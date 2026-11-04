-- 005: affiliate system — referral tracking on purchases, wallet ledger, withdrawals.
-- Run once, after 001-004.

-- Which referral code (if any) was used for a purchase + commission earned.
ALTER TABLE payment_transactions
    ADD COLUMN referral_code VARCHAR(40) NULL AFTER currency,
    ADD COLUMN referral_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD INDEX idx_payment_referral (referral_code);

-- Every wallet credit/debit, for audit.
CREATE TABLE wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_tx_user (user_id),
    CONSTRAINT fk_wallet_tx_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawal requests from users; admin approves/rejects, then marks paid
-- after sending the money manually (UPI).
CREATE TABLE withdrawal_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    upi_id VARCHAR(120) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'pending',
    admin_note VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_withdrawal_user (user_id),
    INDEX idx_withdrawal_status (status),
    CONSTRAINT fk_withdrawal_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
