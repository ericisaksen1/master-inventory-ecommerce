-- AlterTable: Add drop-ship fields to orders
ALTER TABLE `orders` ADD COLUMN `sourceSiteId` VARCHAR(191) NULL;
ALTER TABLE `orders` ADD COLUMN `sourceOrderNumber` VARCHAR(191) NULL;
ALTER TABLE `orders` ADD COLUMN `sourceOrderUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `orders_sourceSiteId_idx` ON `orders`(`sourceSiteId`);

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_sourceSiteId_fkey` FOREIGN KEY (`sourceSiteId`) REFERENCES `connected_sites`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterEnum: Add EXTERNAL to PaymentMethod
ALTER TABLE `payments` MODIFY COLUMN `method` ENUM('PAYPAL', 'VENMO', 'CASHAPP', 'BITCOIN', 'STRIPE', 'CREDIT_CARD', 'EXTERNAL') NOT NULL;
