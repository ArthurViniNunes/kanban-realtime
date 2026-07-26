/*
  Warnings:

  - The `role` column on the `BoardMember` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,boardId]` on the table `BoardMember` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BoardRole" AS ENUM ('owner', 'admin', 'member');

-- DropForeignKey
ALTER TABLE "BoardMember" DROP CONSTRAINT "BoardMember_boardId_fkey";

-- DropForeignKey
ALTER TABLE "BoardMember" DROP CONSTRAINT "BoardMember_userId_fkey";

-- ConvertRoleToEnum
ALTER TABLE "BoardMember"
ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "BoardMember"
ALTER COLUMN "role" TYPE "BoardRole"
USING ("role"::"BoardRole");

ALTER TABLE "BoardMember"
ALTER COLUMN "role" SET DEFAULT 'member';

-- CreateIndex
CREATE INDEX "BoardMember_boardId_idx" ON "BoardMember"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "BoardMember_userId_boardId_key" ON "BoardMember"("userId", "boardId");

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BoardMember" ADD CONSTRAINT "BoardMember_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
