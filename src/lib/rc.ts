import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class InsufficientFundsError extends Error {
  constructor() {
    super("Insufficient RC balance.");
    this.name = "InsufficientFundsError";
  }
}

export class DuplicateRequestError extends Error {
  constructor() {
    super("This request was already processed.");
    this.name = "DuplicateRequestError";
  }
}

/**
 * Move RC from one user to another. This is the ONLY code path allowed to
 * debit a sender's balance. Everything happens inside a single serializable
 * database transaction so two concurrent sends can never both succeed
 * against a balance that only covers one of them, and a duplicate submit
 * (double click, retried request) is rejected by the unique
 * `clientRequestId` constraint rather than applied twice.
 */
export async function sendRichCoin(params: {
  senderId: string;
  receiverId: string;
  amount: number;
  clientRequestId: string;
}) {
  const { senderId, receiverId, amount, clientRequestId } = params;

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive whole number of RC.");
  }
  if (senderId === receiverId) {
    throw new Error("You cannot send RC to yourself.");
  }

  try {
    return await prisma.$transaction(
      async (tx) => {
        // Row-level lock via SELECT ... FOR UPDATE semantics: Prisma doesn't
        // expose FOR UPDATE directly for all providers, so we re-check the
        // balance inside the same transaction immediately before writing,
        // and rely on the transaction's isolation level to serialize
        // concurrent writers against the same wallet row.
        const senderWallet = await tx.wallet.findUnique({ where: { userId: senderId } });
        if (!senderWallet) throw new Error("Sender wallet not found.");
        if (senderWallet.balance < amount) throw new InsufficientFundsError();

        const receiverWallet = await tx.wallet.findUnique({ where: { userId: receiverId } });
        if (!receiverWallet) throw new Error("Receiver wallet not found.");

        // The unique constraint on clientRequestId makes this whole
        // operation idempotent: a retried submit throws here instead of
        // moving RC twice.
        await tx.richCoinTransaction.create({
          data: {
            senderId,
            receiverId,
            amount,
            type: TransactionType.SEND,
            clientRequestId,
          },
        });

        await tx.wallet.update({
          where: { userId: senderId },
          data: { balance: { decrement: amount }, totalSent: { increment: amount } },
        });
        await tx.wallet.update({
          where: { userId: receiverId },
          data: { balance: { increment: amount }, totalReceived: { increment: amount } },
        });

        await tx.notification.create({
          data: {
            userId: receiverId,
            type: "RC_RECEIVED",
            message: `You received ${amount.toLocaleString()} RC.`,
          },
        });

        return { amount };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new DuplicateRequestError();
    }
    throw err;
  }
}

/**
 * Credit RC after a payment provider (Stripe, or the local test-mode
 * simulator) confirms a charge succeeded. Never called from anything the
 * client directly triggers — only from the payment-confirmation route,
 * keyed on the provider's payment id so a replayed webhook is a no-op.
 */
export async function creditPurchasedRichCoin(params: {
  userId: string;
  rcAmount: number;
  amountPaidCents: number;
  currency: string;
  paymentProvider: string;
  providerPaymentId: string;
  packageName: string;
}) {
  const {
    userId,
    rcAmount,
    amountPaidCents,
    currency,
    paymentProvider,
    providerPaymentId,
    packageName,
  } = params;

  try {
    return await prisma.$transaction(async (tx) => {
      // Upsert keyed on the unique providerPaymentId: the checkout step
      // already wrote a PENDING row (test mode) — this flips it to
      // SUCCEEDED. A production Stripe webhook that never saw a PENDING
      // row (or a replay of one already SUCCEEDED) is handled by the same
      // upsert. Either way RC is only ever credited on the transition INTO
      // SUCCEEDED, checked just below — never twice.
      const existing = await tx.payment.findUnique({ where: { providerPaymentId } });
      if (existing?.status === "SUCCEEDED") {
        throw new DuplicateRequestError();
      }

      const payment = await tx.payment.upsert({
        where: { providerPaymentId },
        update: { status: "SUCCEEDED" },
        create: {
          userId,
          package: packageName,
          rcAmount,
          amountPaidCents,
          currency,
          paymentProvider,
          providerPaymentId,
          status: "SUCCEEDED",
        },
      });

      await tx.wallet.update({
        where: { userId },
        data: { balance: { increment: rcAmount }, totalPurchased: { increment: rcAmount } },
      });

      await tx.richCoinTransaction.create({
        data: {
          receiverId: userId,
          amount: rcAmount,
          type: TransactionType.PURCHASE,
          metadata: { paymentId: payment.id, packageName },
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: "PURCHASE_COMPLETED",
          message: `Your purchase of ${rcAmount.toLocaleString()} RC is complete.`,
        },
      });

      return payment;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new DuplicateRequestError();
    }
    throw err;
  }
}

/** Admin-only balance adjustment. Always produces an audited transaction — there is no path that edits a wallet balance directly without one. */
export async function adminAdjustBalance(params: {
  adminId: string;
  targetUserId: string;
  amount: number; // can be negative
  reason: string;
}) {
  const { adminId, targetUserId, amount, reason } = params;
  if (!Number.isInteger(amount) || amount === 0) {
    throw new Error("Amount must be a non-zero whole number.");
  }
  if (!reason || reason.trim().length < 3) {
    throw new Error("A reason is required for any admin balance adjustment.");
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId: targetUserId } });
    if (!wallet) throw new Error("Target wallet not found.");
    if (wallet.balance + amount < 0) throw new InsufficientFundsError();

    await tx.wallet.update({
      where: { userId: targetUserId },
      data: { balance: { increment: amount } },
    });

    await tx.richCoinTransaction.create({
      data: {
        receiverId: amount > 0 ? targetUserId : undefined,
        senderId: amount < 0 ? targetUserId : undefined,
        amount: Math.abs(amount),
        type: TransactionType.ADMIN_ADJUST,
        metadata: { reason, adminId },
      },
    });

    await tx.auditLog.create({
      data: { adminId, targetUserId, amount, reason },
    });
  });
}

export const RC_PACKAGES = [
  { id: "25_RC", rc: 25, cents: 250 },
  { id: "50_RC", rc: 50, cents: 500 },
  { id: "100_RC", rc: 100, cents: 1000 },
  { id: "250_RC", rc: 250, cents: 2500 },
  { id: "500_RC", rc: 500, cents: 5000 },
  { id: "1000_RC", rc: 1000, cents: 10000 },
] as const;
