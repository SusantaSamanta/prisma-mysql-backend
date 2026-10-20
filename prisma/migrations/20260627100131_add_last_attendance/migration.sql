-- AlterTable
ALTER TABLE `User`
    ADD COLUMN `lastAttendance` VARCHAR(191) NOT NULL DEFAULT '0',
    MODIFY `attendances` JSON NULL;
