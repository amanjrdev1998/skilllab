SET NAMES utf8mb4;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NULL,
    wallet VARCHAR(120) NOT NULL,
    status VARCHAR(120) NOT NULL DEFAULT 'active',
    referral_code VARCHAR(40) NULL UNIQUE,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE api_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    secret_key CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_api_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    category VARCHAR(120) NOT NULL,
    description TEXT NULL,
    lessons_count INT UNSIGNED NOT NULL DEFAULT 0,
    duration_hours DECIMAL(5, 2) NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    old_price DECIMAL(10, 2) NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Beginner',
    students_count INT UNSIGNED NOT NULL DEFAULT 0,
    rating DECIMAL(2, 1) NOT NULL DEFAULT 0.0,
    badge VARCHAR(40) NULL,
    icon VARCHAR(20) NULL,
    gradient VARCHAR(120) NULL,
    pdf_url VARCHAR(500) NULL,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_courses_category (category),
    INDEX idx_courses_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE enrollments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    course_name TEXT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
    price_paid DECIMAL(10, 2) NULL,
    referral_code VARCHAR(40) NULL,
    utr VARCHAR(40) NULL UNIQUE,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (user_id, course_id),
    CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO courses
    (title, slug, category, description, lessons_count, duration_hours, price, old_price, level, students_count, rating, badge, icon, gradient, status)
VALUES
    ('Facebook Ads Mastery', 'facebook-ads-mastery', 'Digital Marketing', 'Learn how to create, launch and optimize high-performing Facebook advertising campaigns.', 32, 8, 2999, 5999, 'Beginner', 2400, 4.9, 'BESTSELLER', '📘', 'from-blue-600 to-indigo-600', 'published'),
    ('Instagram Ads Mastery', 'instagram-ads-mastery', 'Digital Marketing', 'Build engaging Instagram campaigns, reach the right audience and increase conversions.', 28, 7, 2499, 4999, 'Beginner', 1800, 4.8, 'POPULAR', '📸', 'from-pink-500 to-orange-500', 'published'),
    ('AI Automation', 'ai-automation', 'Artificial Intelligence', 'Automate repetitive business workflows using AI and build intelligent productivity systems.', 40, 12, 3999, 7999, 'Intermediate', 3100, 4.9, 'TRENDING', '🤖', 'from-violet-600 to-purple-600', 'published'),
    ('Cloud AI Agent Generation', 'cloud-ai-agent-generation', 'Artificial Intelligence', 'Learn how to build, deploy and scale intelligent AI agents using modern cloud technologies.', 45, 15, 4999, 9999, 'Advanced', 1200, 5.0, 'ADVANCED', '☁️', 'from-cyan-500 to-blue-600', 'published'),
    ('Flutter AI App Development Crash Course', 'flutter-ai-app-development', 'Mobile Development', 'Build cross-platform AI-powered mobile apps with Flutter from scratch. Integrate LLMs, computer vision, and smart features into your apps.', 24, 6, 3499, 6999, 'Beginner', 1500, 4.8, 'NEW', '📱', 'from-blue-500 to-teal-400', 'published');
