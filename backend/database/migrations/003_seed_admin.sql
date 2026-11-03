-- SkillLab admin seed (idempotent).
-- Default credentials: admin@skilllab.com / skilllab@123
-- >>> CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN <<<
-- (update password_hash with password_hash('new-password', PASSWORD_DEFAULT) from any PHP shell)

INSERT INTO users (name, email, password_hash, phone, wallet, referral_code, role, status)
VALUES (
    'SkillLab Admin',
    'admin@skilllab.com',
    '$2b$12$oARJrn0Y5VfrSoVOThA7zuo3qrV2cR7PCozliUP26jM0itpSJUDPK',
    NULL,
    '0',
    'SKILLADMIN1',
    'admin',
    'active'
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    role = 'admin',
    status = 'active';
