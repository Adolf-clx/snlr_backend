/*
  Warnings:

  - The values [PAYMENT_PENDING,READY] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [APPROVED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `document` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `items` table. All the data in the column will be lost.
  - The primary key for the `order_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `status` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `external_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[open_id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[union_id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transaction_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `store_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `customers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `items` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `order_items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `subtotal` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payAmount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `store_id` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Made the column `customer_id` on table `orders` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "PricingUnit" AS ENUM ('PIECE', 'WEIGHT');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('WECHAT', 'ALIPAY', 'BALANCE');

-- CreateEnum
CREATE TYPE "DeliveryProvider" AS ENUM ('STORE_SELF', 'DADA', 'MEITUAN', 'SF');

-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('CASH', 'DISCOUNT');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PREPARING', 'AWAITING_RESULT', 'DELIVERING', 'COMPLETED', 'CANCELED', 'REFUNDED');
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- DropIndex
DROP INDEX "categories_name_key";

-- DropIndex
DROP INDEX "customers_document_key";

-- DropIndex
DROP INDEX "customers_email_key";

-- DropIndex
DROP INDEX "payments_external_id_key";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "sort" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "store_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "document",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "open_id" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "union_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "items" DROP COLUMN "active",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "specification" TEXT,
ADD COLUMN     "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "store_id" TEXT NOT NULL,
ADD COLUMN     "unit" "PricingUnit" NOT NULL DEFAULT 'PIECE',
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_pkey",
DROP COLUMN "status",
DROP COLUMN "unit_price",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "subtotal" INTEGER NOT NULL,
ADD COLUMN     "unitPrice" INTEGER NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION,
ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "total",
ADD COLUMN     "couponAmount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveryFee" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'PICKUP',
ADD COLUMN     "payAmount" INTEGER NOT NULL,
ADD COLUMN     "remark" TEXT,
ADD COLUMN     "store_id" TEXT NOT NULL,
ADD COLUMN     "totalAmount" INTEGER NOT NULL,
ALTER COLUMN "customer_id" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "external_id",
DROP COLUMN "qr_code",
ADD COLUMN     "method" "PaymentMethod" NOT NULL DEFAULT 'WECHAT',
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "pay_url" TEXT,
ADD COLUMN     "prepay_id" TEXT,
ADD COLUMN     "transaction_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "OrderItemStatus";

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" "DeliveryProvider" NOT NULL DEFAULT 'STORE_SELF',
    "remote_id" TEXT,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "lng" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,
    "status" TEXT,
    "fee" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "store_id" TEXT,
    "title" TEXT NOT NULL,
    "type" "CouponType" NOT NULL,
    "value" INTEGER NOT NULL,
    "minSpend" INTEGER NOT NULL DEFAULT 0,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER NOT NULL DEFAULT -1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_coupons" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stores_code_key" ON "stores"("code");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_order_id_key" ON "deliveries"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_coupons_order_id_key" ON "user_coupons"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_open_id_key" ON "customers"("open_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_union_id_key" ON "customers"("union_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
