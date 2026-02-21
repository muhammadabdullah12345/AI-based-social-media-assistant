/*
  Warnings:

  - You are about to drop the column `status` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `ScheduledPost` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `ScheduledPost` table. All the data in the column will be lost.
  - You are about to drop the `InstagramAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `platform` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `ScheduledPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ScheduledPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ScheduledPost` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN');

-- DropForeignKey
ALTER TABLE "public"."InstagramAccount" DROP CONSTRAINT "InstagramAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScheduledPost" DROP CONSTRAINT "ScheduledPost_postId_fkey";

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "status",
ADD COLUMN     "platform" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ScheduledPost" DROP COLUMN "postId",
DROP COLUMN "published",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "platforms" "public"."Platform"[],
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."InstagramAccount";

-- DropEnum
DROP TYPE "public"."PostStatus";

-- CreateTable
CREATE TABLE "public"."SocialAccount" (
    "id" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "accountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScheduledPost" ADD CONSTRAINT "ScheduledPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
