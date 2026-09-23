import { PrismaClient, TransactionType, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PEOPLE = [
  { fullName: "Amara Solis", username: "amara", balance: 2450 },
  { fullName: "Deniz Okur", username: "deniz", balance: 1980 },
  { fullName: "Priya Nair", username: "priya", balance: 1750 },
  { fullName: "Brusk Ahmadi", username: "brusk", balance: 1250 },
  { fullName: "Kenji Watanabe", username: "kenji", balance: 1180 },
  { fullName: "Elena Fischer", username: "elena", balance: 990 },
  { fullName: "Marcus Webb", username: "marcus", balance: 875 },
  { fullName: "Lucia Moretti", username: "lucia", balance: 760 },
  { fullName: "Tariq Hassan", username: "tariq", balance: 640 },
  { fullName: "Sofia Reyes", username: "sofia", balance: 520 },
  { fullName: "Noah Kim", username: "noah", balance: 410 },
  { fullName: "Ines Duarte", username: "ines", balance: 305 },
  { fullName: "Omar Farouk", username: "omar", balance: 220 },
  { fullName: "Yuki Tanaka", username: "yuki", balance: 150 },
  { fullName: "Zara Ali", username: "zara", balance: 75 },
];

const BIOS = [
  "Living the rich life.",
  "Building my empire, one RC at a time.",
  "Status is everything.",
  "Here for the flex.",
  "Digital wealth, real ambition.",
  "Climbing the leaderboard.",
  "RC collector.",
  "New here, already rich.",
];

async function main() {
  console.log("Seeding database…");

  const passwordHash = await bcrypt.hash("password123", 12);

  // ── Admin account ──────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@imrich.app" },
    update: {},
    create: {
      email: "admin@imrich.app",
      username: "admin",
      fullName: "IM RICH Admin",
      passwordHash,
      isAdmin: true,
      profile: { create: { avatarSeed: "admin", bio: "Keeping the platform honest." } },
      wallet: { create: { balance: 0 } },
    },
  });
  console.log(`Admin ready: admin@imrich.app / password123`);

  // ── Regular users ──────────────────────────────────────────────────
  const users: any[] = [];
  for (let i = 0; i < PEOPLE.length; i++) {
    const p = PEOPLE[i];
    const user = await prisma.user.upsert({
      where: { email: `${p.username}@imrich.app` },
      update: {},
      create: {
        email: `${p.username}@imrich.app`,
        username: p.username,
        fullName: p.fullName,
        passwordHash,
        profile: { create: { avatarSeed: p.username, bio: BIOS[i % BIOS.length] } },
        wallet: {
          create: {
            balance: p.balance,
            totalPurchased: Math.round(p.balance * 1.3),
            totalSent: Math.round(p.balance * 0.3),
            totalReceived: Math.round(p.balance * 0.1),
          },
        },
      },
    });
    users.push(user);
  }
  console.log(`Seeded ${users.length} users (password123 for all).`);

  // ── Friendships (a realistic-ish social graph) ─────────────────────
  const friendshipPairs: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [1, 2], [1, 4], [2, 5], [3, 4],
    [3, 6], [4, 7], [5, 8], [6, 9], [7, 10], [8, 11], [9, 12],
    [0, 5], [1, 6], [2, 7], [3, 9],
  ];

  for (const [a, b] of friendshipPairs) {
    const userA = users[a];
    const userB = users[b];
    const [userAId, userBId] = userA.id < userB.id ? [userA.id, userB.id] : [userB.id, userA.id];
    await prisma.friendship.upsert({
      where: { userAId_userBId: { userAId, userBId } },
      update: {},
      create: { userAId, userBId },
    });
  }
  console.log(`Seeded ${friendshipPairs.length} friendships.`);

  // ── A few pending friend requests, so /friends has something to show ──
  const pendingPairs: [number, number][] = [[13, 0], [14, 1], [10, 2]];
  for (const [senderIdx, receiverIdx] of pendingPairs) {
    await prisma.friendRequest.upsert({
      where: {
        senderId_receiverId: { senderId: users[senderIdx].id, receiverId: users[receiverIdx].id },
      },
      update: {},
      create: { senderId: users[senderIdx].id, receiverId: users[receiverIdx].id, status: "PENDING" },
    });
    await prisma.notification.create({
      data: {
        userId: users[receiverIdx].id,
        type: NotificationType.FRIEND_REQUEST,
        message: `@${users[senderIdx].username} sent you a friend request.`,
      },
    });
  }
  console.log(`Seeded ${pendingPairs.length} pending friend requests.`);

  // ── Historical RC transactions, spread over the last 30 days ───────
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  async function recordTransfer(senderIdx: number, receiverIdx: number, amount: number, daysAgo: number) {
    const sender = users[senderIdx];
    const receiver = users[receiverIdx];
    await prisma.richCoinTransaction.create({
      data: {
        senderId: sender.id,
        receiverId: receiver.id,
        amount,
        type: TransactionType.SEND,
        createdAt: new Date(now - daysAgo * day),
      },
    });
  }

  async function recordPurchase(userIdx: number, amount: number, daysAgo: number) {
    const user = users[userIdx];
    const providerPaymentId = `seed_${user.username}_${daysAgo}_${amount}`;
    await prisma.payment.upsert({
      where: { providerPaymentId },
      update: {},
      create: {
        userId: user.id,
        package: `${amount}_RC`,
        rcAmount: amount,
        amountPaidCents: amount * 10,
        currency: "usd",
        paymentProvider: "test-mode",
        providerPaymentId,
        status: "SUCCEEDED",
        createdAt: new Date(now - daysAgo * day),
      },
    });
    await prisma.richCoinTransaction.create({
      data: {
        receiverId: user.id,
        amount,
        type: TransactionType.PURCHASE,
        createdAt: new Date(now - daysAgo * day),
      },
    });
  }

  const transferScript: [number, number, number, number][] = [
    [3, 0, 100, 2],
    [0, 3, 50, 5],
    [4, 3, 75, 8],
    [3, 6, 40, 11],
    [1, 4, 120, 3],
    [2, 5, 60, 6],
    [5, 8, 30, 9],
    [6, 9, 45, 14],
    [7, 10, 25, 18],
    [0, 1, 200, 21],
  ];
  for (const [s, r, amt, d] of transferScript) {
    await recordTransfer(s, r, amt, d);
  }

  const purchaseScript: [number, number, number][] = [
    [0, 500, 25],
    [0, 250, 12],
    [1, 250, 20],
    [2, 100, 15],
    [3, 250, 27],
    [4, 100, 10],
    [5, 50, 7],
  ];
  for (const [u, amt, d] of purchaseScript) {
    await recordPurchase(u, amt, d);
  }

  console.log(`Seeded ${transferScript.length} transfers and ${purchaseScript.length} purchases.`);

  console.log("\nSeed complete. Log in with any of:");
  console.log("  admin@imrich.app / password123  (admin panel)");
  console.log("  brusk@imrich.app / password123  (regular user, 1,250 RC)");
  console.log("  (or any other <username>@imrich.app from the seed list)\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
