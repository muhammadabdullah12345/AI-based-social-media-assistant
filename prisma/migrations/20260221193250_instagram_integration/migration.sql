/*
  Warnings:

  - You are about to drop the `ScheduledPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SocialAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ScheduledPost" DROP CONSTRAINT "ScheduledPost_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialAccount" DROP CONSTRAINT "SocialAccount_userId_fkey";

-- DropTable
DROP TABLE "public"."ScheduledPost";

-- DropTable
DROP TABLE "public"."SocialAccount";

-- DropEnum
DROP TYPE "public"."Platform";
