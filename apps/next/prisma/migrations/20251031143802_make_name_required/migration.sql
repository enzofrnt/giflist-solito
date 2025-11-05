/*
  Warnings:

  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- Mettre à jour les valeurs NULL avec l'email comme valeur par défaut
UPDATE "public"."User" SET "name" = "email" WHERE "name" IS NULL OR "name" = '';

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "name" SET NOT NULL;
