import { prisma } from "@/lib/prisma";

/** Friendship rows are always stored with userAId < userBId so a pair can never be duplicated in either order. */
export function normalizePair(idA: string, idB: string) {
  return idA < idB ? { userAId: idA, userBId: idB } : { userAId: idB, userBId: idA };
}

export async function areFriends(idA: string, idB: string) {
  const { userAId, userBId } = normalizePair(idA, idB);
  const row = await prisma.friendship.findUnique({ where: { userAId_userBId: { userAId, userBId } } });
  return !!row;
}

export async function pendingRequestBetween(idA: string, idB: string) {
  return prisma.friendRequest.findFirst({
    where: {
      status: "PENDING",
      OR: [
        { senderId: idA, receiverId: idB },
        { senderId: idB, receiverId: idA },
      ],
    },
  });
}
