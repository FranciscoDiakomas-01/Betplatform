/*
  Warnings:

  - You are about to drop the column `resultAway` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `resultHome` on the `Match` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[externId]` on the table `Match` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `externId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "resultAway",
DROP COLUMN "resultHome",
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "externId" TEXT NOT NULL,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "scores" JSONB[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "notes" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Match_externId_key" ON "Match"("externId");
