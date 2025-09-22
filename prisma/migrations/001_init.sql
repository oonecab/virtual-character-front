-- CreateTable
CREATE TABLE `t_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(256) NULL,
    `password` VARCHAR(512) NULL,
    `real_name` VARCHAR(256) NULL,
    `phone` VARCHAR(128) NULL,
    `mail` VARCHAR(512) NULL,
    `deletion_time` BIGINT NULL,
    `create_time` DATETIME(0) NULL,
    `update_time` DATETIME(0) NULL,
    `del_flag` TINYINT NULL,

    UNIQUE INDEX `idx_unique_username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default admin user
INSERT INTO `t_user` (`username`, `password`, `real_name`, `phone`, `mail`, `create_time`, `update_time`, `del_flag`) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '管理员', '13800138000', 'admin@example.com', NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE `update_time` = NOW();

-- Note: The password hash above is for 'password123'
-- You should change this default password after first login