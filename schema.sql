-- ================================================
-- JA Excursoes - Schema Completo
-- Execute na VPS: mysql -u root -p < schema.sql
-- ================================================

CREATE DATABASE IF NOT EXISTS jotta_excursoes CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE jotta_excursoes;

-- ===== ADMINS =====
CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== TRIPS =====
CREATE TABLE IF NOT EXISTS `trips` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `duration` varchar(100) DEFAULT NULL,
  `departure_date` date NOT NULL,
  `return_date` date NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `category` enum('praia','aventura','cultural','natureza') DEFAULT 'praia',
  `total_seats` int NOT NULL,
  `deposit_percent` int DEFAULT 100,
  `seat_rows` int DEFAULT 11,
  `seats_per_row` int DEFAULT 4,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bate_volta` tinyint(1) DEFAULT 0,
  `telefone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== SEATS =====
CREATE TABLE IF NOT EXISTS `seats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `seat_row` int NOT NULL,
  `column_position` enum('A','B','C','D') NOT NULL,
  `seat_type` enum('regular','premium') DEFAULT 'regular',
  `status` enum('disponivel','reservado','bloqueado') DEFAULT 'disponivel',
  `price_modifier` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_seat_trip` (`trip_id`,`seat_number`),
  KEY `idx_trip_status` (`trip_id`,`status`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== BOOKINGS =====
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(20) NOT NULL,
  `trip_id` int NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `total_passengers` int NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `deposit_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pendente','confirmado','cancelado') DEFAULT 'pendente',
  `payment_status` enum('aguardando','pago','reembolsado') DEFAULT 'aguardando',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `trip_id` (`trip_id`),
  KEY `idx_customer_email` (`customer_email`),
  KEY `idx_booking_code` (`booking_code`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== BOOKING PASSENGERS =====
CREATE TABLE IF NOT EXISTS `booking_passengers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `seat_id` int NOT NULL,
  `passenger_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `booking_passengers_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_passengers_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== PAYMENTS =====
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `pix_code` text,
  `pix_qrcode` longtext,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','expired') DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== SITE SETTINGS =====
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int NOT NULL DEFAULT 1,
  `nav_links` json DEFAULT NULL,
  `stats` json DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `banner_slides` json DEFAULT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_whatsapp` varchar(50) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== TRIP INCLUDED =====
CREATE TABLE IF NOT EXISTS `trip_included` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `item` varchar(255) NOT NULL,
  `display_order` int DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `trip_included_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== TRIP ITINERARY =====
CREATE TABLE IF NOT EXISTS `trip_itinerary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `trip_id` int NOT NULL,
  `day_number` int NOT NULL,
  `description` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `trip_id` (`trip_id`),
  CONSTRAINT `trip_itinerary_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== STRIPE ACCOUNT =====
CREATE TABLE IF NOT EXISTS `stripe_account` (
  `id` int NOT NULL DEFAULT 1,
  `stripe_account_id` varchar(255) DEFAULT NULL,
  `status` enum('pendente','verificando','ativo','restrito') DEFAULT 'pendente',
  `business_name` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `cpf_cnpj` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `address_city` varchar(100) DEFAULT NULL,
  `address_state` varchar(2) DEFAULT NULL,
  `address_postal` varchar(10) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_agency` varchar(20) DEFAULT NULL,
  `bank_account` varchar(30) DEFAULT NULL,
  `bank_account_type` enum('checking','savings') DEFAULT 'checking',
  `stripe_details_submitted` tinyint(1) DEFAULT 0,
  `stripe_charges_enabled` tinyint(1) DEFAULT 0,
  `stripe_payouts_enabled` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ===== DADOS INICIAIS =====

-- Admin padrao (troque a senha depois!)
INSERT IGNORE INTO `admins` (`id`, `nome`, `email`, `senha`) VALUES
(1, 'Admin', 'admin@jottaexcursoes.com', 'admin123');

-- Config inicial do site
INSERT IGNORE INTO `site_settings` (`id`) VALUES (1);

-- Conta Stripe (registro unico)
INSERT IGNORE INTO `stripe_account` (`id`) VALUES (1);
