-- MySQL dump 10.13  Distrib 8.3.0, for macos13.6 (arm64)
--
-- Host: localhost    Database: cms_enoch2026
-- ------------------------------------------------------
-- Server version	8.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `provider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `providerAccountId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `access_token` text COLLATE utf8mb4_unicode_ci,
  `expires_at` int DEFAULT NULL,
  `token_type` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scope` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_token` text COLLATE utf8mb4_unicode_ci,
  `session_state` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `accounts_provider_providerAccountId_key` (`provider`,`providerAccountId`),
  KEY `accounts_userId_fkey` (`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line1` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line2` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postalCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'US',
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isDefault` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `addresses_userId_idx` (`userId`),
  CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_notifications`
--

DROP TABLE IF EXISTS `admin_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_notifications` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `admin_notifications_isRead_idx` (`isRead`),
  KEY `admin_notifications_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_notifications`
--

LOCK TABLES `admin_notifications` WRITE;
/*!40000 ALTER TABLE `admin_notifications` DISABLE KEYS */;
INSERT INTO `admin_notifications` VALUES ('cmm8b2l6c0042rmqb27f77iz1','order','New Order','Order #ORD-20260301-8455ABE5 from Guest — $65.00','/admin/orders/cmm8b2hk7003yrmqb3rs5aoxz',1,'2026-03-01 22:12:27.395'),('cmm8bkp7w0008rmoj394mu4ru','order','New Order','Order #ORD-20260301-3F7D4D8D from Guest — $255.00','/admin/orders/cmm8bkp660004rmojnhvrobvg',0,'2026-03-01 22:26:32.492');
/*!40000 ALTER TABLE `admin_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliate_clicks`
--

DROP TABLE IF EXISTS `affiliate_clicks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliate_clicks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` text COLLATE utf8mb4_unicode_ci,
  `referrer` text COLLATE utf8mb4_unicode_ci,
  `landingPage` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `affiliate_clicks_affiliateId_idx` (`affiliateId`),
  KEY `affiliate_clicks_createdAt_idx` (`createdAt`),
  CONSTRAINT `affiliate_clicks_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliate_clicks`
--

LOCK TABLES `affiliate_clicks` WRITE;
/*!40000 ALTER TABLE `affiliate_clicks` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliate_clicks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliate_commissions`
--

DROP TABLE IF EXISTS `affiliate_commissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliate_commissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `affiliateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `rate` decimal(5,2) NOT NULL,
  `type` enum('DIRECT','PARENT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DIRECT',
  `status` enum('PENDING','APPROVED','PAID','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `paidAt` datetime(3) DEFAULT NULL,
  `paidBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidRef` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `affiliate_commissions_orderId_affiliateId_key` (`orderId`,`affiliateId`),
  KEY `affiliate_commissions_affiliateId_idx` (`affiliateId`),
  KEY `affiliate_commissions_status_idx` (`status`),
  KEY `affiliate_commissions_createdAt_idx` (`createdAt`),
  CONSTRAINT `affiliate_commissions_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `affiliate_commissions_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliate_commissions`
--

LOCK TABLES `affiliate_commissions` WRITE;
/*!40000 ALTER TABLE `affiliate_commissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliate_commissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `affiliates`
--

DROP TABLE IF EXISTS `affiliates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `affiliates` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `referralCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `commissionRate` decimal(5,2) NOT NULL DEFAULT '10.00',
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approvedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `affiliates_userId_key` (`userId`),
  UNIQUE KEY `affiliates_referralCode_key` (`referralCode`),
  KEY `affiliates_referralCode_idx` (`referralCode`),
  KEY `affiliates_status_idx` (`status`),
  KEY `affiliates_parentId_idx` (`parentId`),
  CONSTRAINT `affiliates_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `affiliates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `affiliates`
--

LOCK TABLES `affiliates` WRITE;
/*!40000 ALTER TABLE `affiliates` DISABLE KEYS */;
/*!40000 ALTER TABLE `affiliates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_categories_slug_key` (`slug`),
  KEY `blog_categories_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_post_categories`
--

DROP TABLE IF EXISTS `blog_post_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_post_categories` (
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`postId`,`categoryId`),
  KEY `blog_post_categories_categoryId_fkey` (`categoryId`),
  CONSTRAINT `blog_post_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `blog_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `blog_post_categories_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_post_categories`
--

LOCK TABLES `blog_post_categories` WRITE;
/*!40000 ALTER TABLE `blog_post_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_post_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_post_tags`
--

DROP TABLE IF EXISTS `blog_post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_post_tags` (
  `postId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tagId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`postId`,`tagId`),
  KEY `blog_post_tags_tagId_fkey` (`tagId`),
  CONSTRAINT `blog_post_tags_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `blog_post_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_post_tags`
--

LOCK TABLES `blog_post_tags` WRITE;
/*!40000 ALTER TABLE `blog_post_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `featuredImage` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authorId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT '0',
  `publishedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_posts_slug_key` (`slug`),
  KEY `blog_posts_slug_idx` (`slug`),
  KEY `blog_posts_isPublished_publishedAt_idx` (`isPublished`,`publishedAt`),
  KEY `blog_posts_authorId_fkey` (`authorId`),
  CONSTRAINT `blog_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_tags`
--

DROP TABLE IF EXISTS `blog_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_tags` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `blog_tags_name_key` (`name`),
  UNIQUE KEY `blog_tags_slug_key` (`slug`),
  KEY `blog_tags_slug_idx` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_tags`
--

LOCK TABLES `blog_tags` WRITE;
/*!40000 ALTER TABLE `blog_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cartId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_items_cartId_productId_variantId_key` (`cartId`,`productId`,`variantId`),
  KEY `cart_items_cartId_idx` (`cartId`),
  KEY `cart_items_productId_fkey` (`productId`),
  KEY `cart_items_variantId_fkey` (`variantId`),
  CONSTRAINT `cart_items_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `cart_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sessionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `carts_userId_key` (`userId`),
  UNIQUE KEY `carts_sessionId_key` (`sessionId`),
  KEY `carts_sessionId_idx` (`sessionId`),
  CONSTRAINT `carts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES ('cmm81vcnw0001rmygyn7v0w3c','cmm7xec770000rmi1w2ddnbmp',NULL,'2026-03-01 17:54:53.275','2026-03-01 17:54:53.275'),('cmm81weor0004rmyg2efvqz3l',NULL,'45f38afb-350e-438b-8454-70c8cca15017','2026-03-01 17:55:42.556','2026-03-01 17:55:42.556'),('cmm8b1sxz003urmqbwg1506lz',NULL,'71b4bfcf-14a3-47c1-b829-cd2501ca9f94','2026-03-01 22:11:50.856','2026-03-01 22:11:50.856'),('cmm8bk6zs0000rmojjaeft2r4',NULL,'c0b008c2-c69c-4592-b891-30f7c4493472','2026-03-01 22:26:08.872','2026-03-01 22:26:08.872');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `commissionRate` decimal(5,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_key` (`slug`),
  KEY `categories_slug_idx` (`slug`),
  KEY `categories_parentId_idx` (`parentId`),
  CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('cmm7xeego000drmi1t0turx52','Peptides','peptides','Research peptides and compounds',NULL,NULL,1,1,NULL,'2026-03-01 15:49:43.992','2026-03-01 15:49:43.992'),('cmm855g510000rmc7odoeew38','Individual','individual',NULL,NULL,NULL,1,1,NULL,'2026-03-01 19:26:43.189','2026-03-01 19:26:43.189'),('cmm855g7h0001rmc70hpkrmcx','Packs','packs',NULL,NULL,NULL,2,1,NULL,'2026-03-01 19:26:43.277','2026-03-01 19:26:43.277'),('cmm88l11a0001rmmc48u452a6','3 Packs','3-packs',NULL,NULL,'cmm855g7h0001rmc70hpkrmcx',0,1,NULL,'2026-03-01 21:02:48.959','2026-03-01 21:02:48.959');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_messages`
--

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `contact_messages_isRead_idx` (`isRead`),
  KEY `contact_messages_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_messages`
--

LOCK TABLES `contact_messages` WRITE;
/*!40000 ALTER TABLE `contact_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discountType` enum('PERCENTAGE','FIXED_AMOUNT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERCENTAGE',
  `discountValue` decimal(10,2) NOT NULL,
  `minOrderAmount` decimal(10,2) DEFAULT NULL,
  `maxUses` int DEFAULT NULL,
  `usedCount` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `startsAt` datetime(3) DEFAULT NULL,
  `expiresAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `coupons_code_key` (`code`),
  KEY `coupons_code_idx` (`code`),
  KEY `coupons_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mimeType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `size` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `media_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
INSERT INTO `media` VALUES ('cmm846oz8006orm875qn9kt05','/uploads/af8846a0-28d1-4bb2-878a-54ebb94abdf9.png','enoch-logo.png','','image/png',17086,'2026-03-01 18:59:41.684'),('cmm87lw0h0021rmbcx1zq4tzj','/uploads/cbe74e71-942e-4b38-9a8a-ebef9b5a9628.png','dna-pattern.png','','image/png',118854,'2026-03-01 20:35:26.493'),('cmm87okbe0022rmbckxowaiti','/uploads/079a5d34-7068-4c97-99e8-5e49c1a24e13.png','dna-pattern.png','','image/png',127792,'2026-03-01 20:37:34.299');
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `parentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `cssClass` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkTarget` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `visibility` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `affiliateVisibility` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  PRIMARY KEY (`id`),
  KEY `menu_items_location_sortOrder_idx` (`location`,`sortOrder`),
  KEY `menu_items_parentId_fkey` (`parentId`),
  CONSTRAINT `menu_items_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES ('cmm8893u70041rmbch2d6g0yo','header','All Products','/products',0,NULL,1,NULL,NULL,'all','all'),('cmm88a8100043rmbcm6ccvs3w','header','Contact','/contact',3,NULL,1,NULL,NULL,'all','all'),('cmm88awdc0045rmbcbolcwj8q','header','Individual Products','/categories/individual',1,NULL,1,NULL,NULL,'all','all'),('cmm88b4uc0047rmbcv2j1rcwc','header','Peptide Packs','/categories/packs',2,NULL,1,NULL,NULL,'all','all');
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `variantName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `printfulOrderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `printfulStatus` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_orderId_idx` (`orderId`),
  KEY `order_items_productId_fkey` (`productId`),
  KEY `order_items_variantId_fkey` (`variantId`),
  CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES ('cmm8b2hk70040rmqbdmtcs4cg','cmm8b2hk7003yrmqb3rs5aoxz','cmm855glx000srmc76xeu30bs',NULL,'Cagri 10mg',NULL,NULL,50.00,1,50.00,NULL,NULL),('cmm8bkp670006rmojeu2djl7m','cmm8bkp660004rmojnhvrobvg','cmm855g7v0003rmc73lbbehz3',NULL,'3 Pack GLP-T 30mg',NULL,NULL,240.00,1,240.00,NULL,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `addressId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('AWAITING_PAYMENT','PAYMENT_COMPLETE','ORDER_COMPLETE','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AWAITING_PAYMENT',
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `shippingCost` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discountAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `couponId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `couponCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `shippingAddress` json DEFAULT NULL,
  `affiliateId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `guestEmail` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  KEY `orders_userId_idx` (`userId`),
  KEY `orders_status_idx` (`status`),
  KEY `orders_orderNumber_idx` (`orderNumber`),
  KEY `orders_affiliateId_idx` (`affiliateId`),
  KEY `orders_couponId_idx` (`couponId`),
  KEY `orders_createdAt_idx` (`createdAt`),
  KEY `orders_addressId_fkey` (`addressId`),
  CONSTRAINT `orders_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `affiliates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_couponId_fkey` FOREIGN KEY (`couponId`) REFERENCES `coupons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('cmm8b2hk7003yrmqb3rs5aoxz','ORD-20260301-8455ABE5',NULL,NULL,'AWAITING_PAYMENT',50.00,0.00,15.00,0.00,65.00,NULL,NULL,NULL,NULL,'{\"city\": \"Lawton\", \"line1\": \"410 Southeast Sungate Boulevard\", \"phone\": \"(775) 360-9712\", \"state\": \"OK\", \"country\": \"US\", \"lastName\": \"Isaksen\", \"firstName\": \"Eric\", \"postalCode\": \"73501\"}',NULL,'2026-03-01 22:12:22.757','2026-03-01 22:12:22.757','blckoutbrbell@gmail.com'),('cmm8bkp660004rmojnhvrobvg','ORD-20260301-3F7D4D8D',NULL,NULL,'AWAITING_PAYMENT',240.00,0.00,15.00,0.00,255.00,NULL,NULL,NULL,NULL,'{\"city\": \"Lawton\", \"line1\": \"410 Southeast Sungate Boulevard\", \"phone\": \"7753609712\", \"state\": \"OK\", \"country\": \"US\", \"lastName\": \"Isaksen\", \"firstName\": \"Eric\", \"postalCode\": \"73501\"}',NULL,'2026-03-01 22:26:32.430','2026-03-01 22:26:32.430','blckoutbrbell@gmail.com');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_components`
--

DROP TABLE IF EXISTS `page_components`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_components` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pageId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `settings` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `page_components_pageId_sortOrder_idx` (`pageId`,`sortOrder`),
  CONSTRAINT `page_components_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `pages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_components`
--

LOCK TABLES `page_components` WRITE;
/*!40000 ALTER TABLE `page_components` DISABLE KEYS */;
INSERT INTO `page_components` VALUES ('cmm87cai1001wrmbc6ppxw1ij',NULL,'hero_banner','{\"heading\":\"WELCOME TO ENOCH LABS\",\"subtext\":\"Where we hold every product to strict quality standards, no exceptions.\",\"primaryButtonText\":\"Shop Now\",\"primaryButtonUrl\":\"/products\",\"secondaryButtonText\":\"Become an Affiliate\",\"secondaryButtonUrl\":\"/affiliate/apply\",\"showSecondaryButton\":false,\"layout\":\"centered\",\"textAlign\":\"center\",\"imageUrl\":\"\",\"imageAlt\":\"\",\"backgroundImageUrl\":\"/uploads/079a5d34-7068-4c97-99e8-5e49c1a24e13.png\",\"overlayOpacity\":\"0\",\"minHeight\":\"medium\",\"verticalAlign\":\"center\",\"headingFontSize\":\"7xl\",\"subtextFontSize\":\"xl\",\"bgColor\":\"#f0f6fa\",\"headlineColor\":\"#2E9AD0\",\"textColor\":\"#5a6d85\",\"buttonColor\":\"#5a6d85\",\"buttonTextColor\":\"#ffffff\",\"buttonHoverColor\":\"#2E9AD0\",\"buttonHoverTextColor\":\"#ffffff\"}',0,1,'2026-03-01 20:28:01.705','2026-03-01 21:04:49.210'),('cmm87wc950024rmbc7r2o7myn',NULL,'product_listing','{\"heading\":\"All Products\",\"showFilters\":false,\"showSort\":true,\"showCategoryNav\":true,\"bgColor\":\"\",\"headlineColor\":\"\"}',2,1,'2026-03-01 20:43:37.096','2026-03-01 21:01:09.403'),('cmm88edgl005vrmbc5yxt1hum',NULL,'marquee_banner','{\"mode\":\"products\",\"content\":\"Welcome to our store — Free shipping on orders over $50\",\"source\":\"all\",\"maxProducts\":10,\"speed\":\"medium\",\"direction\":\"left\",\"bgColor\":\"#2E9AD0\",\"textColor\":\"#ffffff\",\"separator\":\"\",\"pauseOnHover\":true,\"fontSize\":\"xl\",\"fontFamily\":\"\"}',1,1,'2026-03-01 20:57:38.469','2026-03-01 21:01:09.403');
/*!40000 ALTER TABLE `page_components` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pages`
--

DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '0',
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_key` (`slug`),
  KEY `pages_slug_idx` (`slug`),
  KEY `pages_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_tokens_token_key` (`token`),
  KEY `password_reset_tokens_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `method` enum('PAYPAL','VENMO','CASHAPP','BITCOIN','STRIPE','CREDIT_CARD') COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','SUBMITTED','CONFIRMED','FAILED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `transactionRef` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmedAt` datetime(3) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_orderId_key` (`orderId`),
  KEY `payments_orderId_idx` (`orderId`),
  KEY `payments_status_idx` (`status`),
  CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('cmm8b2hk70041rmqbaqxhavy0','cmm8b2hk7003yrmqb3rs5aoxz','PAYPAL','PENDING',65.00,NULL,NULL,NULL,NULL,'2026-03-01 22:12:22.757','2026-03-01 22:12:22.757'),('cmm8bkp670007rmojefs52myw','cmm8bkp660004rmojnhvrobvg','PAYPAL','PENDING',255.00,NULL,NULL,NULL,NULL,'2026-03-01 22:26:32.430','2026-03-01 22:26:32.430');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_categories`
--

DROP TABLE IF EXISTS `product_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_categories` (
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`productId`,`categoryId`),
  KEY `product_categories_categoryId_fkey` (`categoryId`),
  CONSTRAINT `product_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_categories_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_categories`
--

LOCK TABLES `product_categories` WRITE;
/*!40000 ALTER TABLE `product_categories` DISABLE KEYS */;
INSERT INTO `product_categories` VALUES ('cmm855g7j0002rmc7sz4r9xr9','cmm7xeego000drmi1t0turx52'),('cmm855g7v0003rmc73lbbehz3','cmm7xeego000drmi1t0turx52'),('cmm855g7z0004rmc712krq3yd','cmm7xeego000drmi1t0turx52'),('cmm855g8g0005rmc7ra310og1','cmm7xeego000drmi1t0turx52'),('cmm855g8l0006rmc7d4e3scdo','cmm7xeego000drmi1t0turx52'),('cmm855g8r0007rmc78g8ru3xf','cmm7xeego000drmi1t0turx52'),('cmm855g8u0008rmc7gtn8msx6','cmm7xeego000drmi1t0turx52'),('cmm855g920009rmc7gauvkg8x','cmm7xeego000drmi1t0turx52'),('cmm855g98000armc7xnzz0nyu','cmm7xeego000drmi1t0turx52'),('cmm855g9o000brmc744niwvzi','cmm7xeego000drmi1t0turx52'),('cmm855g9s000crmc7wdq2navu','cmm7xeego000drmi1t0turx52'),('cmm855gad000drmc7i0h7r4cd','cmm7xeego000drmi1t0turx52'),('cmm855gb5000ermc772ot23oz','cmm7xeego000drmi1t0turx52'),('cmm855gbu000frmc7qh0q6f74','cmm7xeego000drmi1t0turx52'),('cmm855gby000grmc7uy6mji79','cmm7xeego000drmi1t0turx52'),('cmm855gc4000hrmc7if25v7y6','cmm7xeego000drmi1t0turx52'),('cmm855gcj000irmc7grgqz549','cmm7xeego000drmi1t0turx52'),('cmm855gcp000jrmc7p9hxxkqd','cmm7xeego000drmi1t0turx52'),('cmm855gd0000krmc7riumzzoo','cmm7xeego000drmi1t0turx52'),('cmm855gd8000lrmc7gnp3s2v5','cmm7xeego000drmi1t0turx52'),('cmm855gde000mrmc7vm41dx6a','cmm7xeego000drmi1t0turx52'),('cmm855gee000nrmc7fiqhr2s4','cmm7xeego000drmi1t0turx52'),('cmm855gfa000ormc7kxd4eqo5','cmm7xeego000drmi1t0turx52'),('cmm855gg7000prmc7s91c6c1a','cmm7xeego000drmi1t0turx52'),('cmm855gh2000qrmc7hakqw3bs','cmm7xeego000drmi1t0turx52'),('cmm855gjr000rrmc7lw2hzl1p','cmm7xeego000drmi1t0turx52'),('cmm855glx000srmc76xeu30bs','cmm7xeego000drmi1t0turx52'),('cmm855gmw000trmc7p7vsorph','cmm7xeego000drmi1t0turx52'),('cmm855gn4000urmc7c2e1z2ul','cmm7xeego000drmi1t0turx52'),('cmm855gn7000vrmc7sgx0f5jl','cmm7xeego000drmi1t0turx52'),('cmm855gna000wrmc7plk67uuf','cmm7xeego000drmi1t0turx52'),('cmm855gnq000xrmc7blpoafn1','cmm7xeego000drmi1t0turx52'),('cmm855gnt000yrmc7r9ewwevp','cmm7xeego000drmi1t0turx52'),('cmm855gnw000zrmc7mawwfzau','cmm7xeego000drmi1t0turx52'),('cmm855gny0010rmc730nm12x7','cmm7xeego000drmi1t0turx52'),('cmm855go20011rmc7si1w9nao','cmm7xeego000drmi1t0turx52'),('cmm855go40012rmc7w7mskpdz','cmm7xeego000drmi1t0turx52'),('cmm855go80013rmc7koj11ega','cmm7xeego000drmi1t0turx52'),('cmm855gom0014rmc75lbub5k0','cmm7xeego000drmi1t0turx52'),('cmm855gor0015rmc75if5j6ib','cmm7xeego000drmi1t0turx52'),('cmm855goy0016rmc769kq5jdk','cmm7xeego000drmi1t0turx52'),('cmm855gp10017rmc7jh9azje1','cmm7xeego000drmi1t0turx52'),('cmm855gp30018rmc7fnev3gup','cmm7xeego000drmi1t0turx52'),('cmm855gp60019rmc7enix95zl','cmm7xeego000drmi1t0turx52'),('cmm855gp9001armc7b80dhw1f','cmm7xeego000drmi1t0turx52'),('cmm855gpc001brmc7o7vr6655','cmm7xeego000drmi1t0turx52'),('cmm855gpq001crmc7upy5ld7v','cmm7xeego000drmi1t0turx52'),('cmm855gpu001drmc7iv6lqa93','cmm7xeego000drmi1t0turx52'),('cmm855gpy001ermc73ijv6osv','cmm7xeego000drmi1t0turx52'),('cmm855gq1001frmc78wkesr99','cmm7xeego000drmi1t0turx52'),('cmm855gq5001grmc70334s973','cmm7xeego000drmi1t0turx52'),('cmm855gqd001hrmc7v3mmh15n','cmm7xeego000drmi1t0turx52'),('cmm855gqg001irmc72alkvq31','cmm7xeego000drmi1t0turx52'),('cmm855gqj001jrmc7jjp3541z','cmm7xeego000drmi1t0turx52'),('cmm855gqm001krmc72as0kad2','cmm7xeego000drmi1t0turx52'),('cmm855gr1001lrmc7lwkowkcg','cmm7xeego000drmi1t0turx52'),('cmm855gr4001mrmc7yzn6kfhr','cmm7xeego000drmi1t0turx52'),('cmm855gr7001nrmc796wdq5zp','cmm7xeego000drmi1t0turx52'),('cmm855gr9001ormc76prnxnp4','cmm7xeego000drmi1t0turx52'),('cmm855grc001prmc7mu8qhxbg','cmm7xeego000drmi1t0turx52'),('cmm855gre001qrmc7wfych4x8','cmm7xeego000drmi1t0turx52'),('cmm855grh001rrmc7m10rz3x8','cmm7xeego000drmi1t0turx52'),('cmm855grv001srmc7a6zr3m9e','cmm7xeego000drmi1t0turx52'),('cmm855grz001trmc7977rib0e','cmm7xeego000drmi1t0turx52'),('cmm855gs2001urmc7hdrcrmdz','cmm7xeego000drmi1t0turx52'),('cmm855gs8001vrmc79tkhh139','cmm7xeego000drmi1t0turx52'),('cmm855gsb001wrmc7fo4ioe2y','cmm7xeego000drmi1t0turx52'),('cmm855gsg001xrmc7hwjuyhpn','cmm7xeego000drmi1t0turx52'),('cmm855g7j0002rmc7sz4r9xr9','cmm855g510000rmc7odoeew38'),('cmm855g7z0004rmc712krq3yd','cmm855g510000rmc7odoeew38'),('cmm855g8g0005rmc7ra310og1','cmm855g510000rmc7odoeew38'),('cmm855g8l0006rmc7d4e3scdo','cmm855g510000rmc7odoeew38'),('cmm855g8u0008rmc7gtn8msx6','cmm855g510000rmc7odoeew38'),('cmm855g98000armc7xnzz0nyu','cmm855g510000rmc7odoeew38'),('cmm855g9o000brmc744niwvzi','cmm855g510000rmc7odoeew38'),('cmm855gb5000ermc772ot23oz','cmm855g510000rmc7odoeew38'),('cmm855gby000grmc7uy6mji79','cmm855g510000rmc7odoeew38'),('cmm855gcj000irmc7grgqz549','cmm855g510000rmc7odoeew38'),('cmm855gcp000jrmc7p9hxxkqd','cmm855g510000rmc7odoeew38'),('cmm855gd0000krmc7riumzzoo','cmm855g510000rmc7odoeew38'),('cmm855gd8000lrmc7gnp3s2v5','cmm855g510000rmc7odoeew38'),('cmm855gde000mrmc7vm41dx6a','cmm855g510000rmc7odoeew38'),('cmm855gee000nrmc7fiqhr2s4','cmm855g510000rmc7odoeew38'),('cmm855gfa000ormc7kxd4eqo5','cmm855g510000rmc7odoeew38'),('cmm855gg7000prmc7s91c6c1a','cmm855g510000rmc7odoeew38'),('cmm855gh2000qrmc7hakqw3bs','cmm855g510000rmc7odoeew38'),('cmm855gjr000rrmc7lw2hzl1p','cmm855g510000rmc7odoeew38'),('cmm855glx000srmc76xeu30bs','cmm855g510000rmc7odoeew38'),('cmm855gmw000trmc7p7vsorph','cmm855g510000rmc7odoeew38'),('cmm855gn4000urmc7c2e1z2ul','cmm855g510000rmc7odoeew38'),('cmm855gn7000vrmc7sgx0f5jl','cmm855g510000rmc7odoeew38'),('cmm855gna000wrmc7plk67uuf','cmm855g510000rmc7odoeew38'),('cmm855gnq000xrmc7blpoafn1','cmm855g510000rmc7odoeew38'),('cmm855gnt000yrmc7r9ewwevp','cmm855g510000rmc7odoeew38'),('cmm855gom0014rmc75lbub5k0','cmm855g510000rmc7odoeew38'),('cmm855gor0015rmc75if5j6ib','cmm855g510000rmc7odoeew38'),('cmm855gp9001armc7b80dhw1f','cmm855g510000rmc7odoeew38'),('cmm855gpc001brmc7o7vr6655','cmm855g510000rmc7odoeew38'),('cmm855gpq001crmc7upy5ld7v','cmm855g510000rmc7odoeew38'),('cmm855gpu001drmc7iv6lqa93','cmm855g510000rmc7odoeew38'),('cmm855gpy001ermc73ijv6osv','cmm855g510000rmc7odoeew38'),('cmm855gq1001frmc78wkesr99','cmm855g510000rmc7odoeew38'),('cmm855gq5001grmc70334s973','cmm855g510000rmc7odoeew38'),('cmm855gqd001hrmc7v3mmh15n','cmm855g510000rmc7odoeew38'),('cmm855gqg001irmc72alkvq31','cmm855g510000rmc7odoeew38'),('cmm855gqj001jrmc7jjp3541z','cmm855g510000rmc7odoeew38'),('cmm855gqm001krmc72as0kad2','cmm855g510000rmc7odoeew38'),('cmm855gr1001lrmc7lwkowkcg','cmm855g510000rmc7odoeew38'),('cmm855gr4001mrmc7yzn6kfhr','cmm855g510000rmc7odoeew38'),('cmm855gr7001nrmc796wdq5zp','cmm855g510000rmc7odoeew38'),('cmm855gr9001ormc76prnxnp4','cmm855g510000rmc7odoeew38'),('cmm855grc001prmc7mu8qhxbg','cmm855g510000rmc7odoeew38'),('cmm855gre001qrmc7wfych4x8','cmm855g510000rmc7odoeew38'),('cmm855grh001rrmc7m10rz3x8','cmm855g510000rmc7odoeew38'),('cmm855grv001srmc7a6zr3m9e','cmm855g510000rmc7odoeew38'),('cmm855grz001trmc7977rib0e','cmm855g510000rmc7odoeew38'),('cmm855gs2001urmc7hdrcrmdz','cmm855g510000rmc7odoeew38'),('cmm855gs8001vrmc79tkhh139','cmm855g510000rmc7odoeew38'),('cmm855gsb001wrmc7fo4ioe2y','cmm855g510000rmc7odoeew38'),('cmm855gsg001xrmc7hwjuyhpn','cmm855g510000rmc7odoeew38'),('cmm855g7v0003rmc73lbbehz3','cmm855g7h0001rmc70hpkrmcx'),('cmm855g8r0007rmc78g8ru3xf','cmm855g7h0001rmc70hpkrmcx'),('cmm855g920009rmc7gauvkg8x','cmm855g7h0001rmc70hpkrmcx'),('cmm855g9s000crmc7wdq2navu','cmm855g7h0001rmc70hpkrmcx'),('cmm855gad000drmc7i0h7r4cd','cmm855g7h0001rmc70hpkrmcx'),('cmm855gbu000frmc7qh0q6f74','cmm855g7h0001rmc70hpkrmcx'),('cmm855gc4000hrmc7if25v7y6','cmm855g7h0001rmc70hpkrmcx'),('cmm855gnw000zrmc7mawwfzau','cmm855g7h0001rmc70hpkrmcx'),('cmm855gny0010rmc730nm12x7','cmm855g7h0001rmc70hpkrmcx'),('cmm855go20011rmc7si1w9nao','cmm855g7h0001rmc70hpkrmcx'),('cmm855go40012rmc7w7mskpdz','cmm855g7h0001rmc70hpkrmcx'),('cmm855go80013rmc7koj11ega','cmm855g7h0001rmc70hpkrmcx'),('cmm855goy0016rmc769kq5jdk','cmm855g7h0001rmc70hpkrmcx'),('cmm855gp10017rmc7jh9azje1','cmm855g7h0001rmc70hpkrmcx'),('cmm855gp30018rmc7fnev3gup','cmm855g7h0001rmc70hpkrmcx'),('cmm855gp60019rmc7enix95zl','cmm855g7h0001rmc70hpkrmcx'),('cmm855g7v0003rmc73lbbehz3','cmm88l11a0001rmmc48u452a6'),('cmm855g8r0007rmc78g8ru3xf','cmm88l11a0001rmmc48u452a6'),('cmm855g920009rmc7gauvkg8x','cmm88l11a0001rmmc48u452a6'),('cmm855g9s000crmc7wdq2navu','cmm88l11a0001rmmc48u452a6'),('cmm855gad000drmc7i0h7r4cd','cmm88l11a0001rmmc48u452a6'),('cmm855gbu000frmc7qh0q6f74','cmm88l11a0001rmmc48u452a6'),('cmm855gc4000hrmc7if25v7y6','cmm88l11a0001rmmc48u452a6'),('cmm855gnw000zrmc7mawwfzau','cmm88l11a0001rmmc48u452a6'),('cmm855gny0010rmc730nm12x7','cmm88l11a0001rmmc48u452a6'),('cmm855go20011rmc7si1w9nao','cmm88l11a0001rmmc48u452a6'),('cmm855go40012rmc7w7mskpdz','cmm88l11a0001rmmc48u452a6'),('cmm855go80013rmc7koj11ega','cmm88l11a0001rmmc48u452a6'),('cmm855goy0016rmc769kq5jdk','cmm88l11a0001rmmc48u452a6'),('cmm855gp10017rmc7jh9azje1','cmm88l11a0001rmmc48u452a6'),('cmm855gp30018rmc7fnev3gup','cmm88l11a0001rmmc48u452a6'),('cmm855gp60019rmc7enix95zl','cmm88l11a0001rmmc48u452a6');
/*!40000 ALTER TABLE `product_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alt` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `isPrimary` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `product_images_productId_idx` (`productId`),
  CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES ('cmm86lzsy0001rmzg0gloasaf','cmm855gqm001krmc72as0kad2','/uploads/e49e4f82-f898-4315-b786-4049700f179d.jpg','Bacteriostatic Water',0,1),('cmm86m0ee0003rmzgkxgdhvb9','cmm855grv001srmc7a6zr3m9e','/uploads/04f62674-dc42-4a64-bea8-6d854a523f6e.jpg','BPC-157 10mg',0,1),('cmm86m0ew0005rmzg583dvvtc','cmm855gr1001lrmc7lwkowkcg','/uploads/0ab05e77-a6e1-4634-96fd-75317eafcbb6.jpg','BPC-157 + TB-500 20mg',0,1),('cmm86m0f30007rmzgaqabemo7','cmm855glx000srmc76xeu30bs','/uploads/de2c6065-b534-4c24-9b11-6aa37cba696b.jpg','Cagri 10mg',0,1),('cmm86m0gl0009rmzg6chibn1c','cmm855gom0014rmc75lbub5k0','/uploads/0c732f8d-f63a-4515-970e-00f6c512e4c7.jpg','Cagri 5mg',0,1),('cmm86m0gu000brmzgwkto3hrk','cmm855gn7000vrmc7sgx0f5jl','/uploads/8d576fce-867d-4694-95af-b445112d9520.jpg','Epitalon 50mg',0,1),('cmm86m0gy000drmzgzh5qbcvl','cmm855grh001rrmc7m10rz3x8','/uploads/468b1d0b-0537-4433-b8cf-907f71037609.jpg','GHK-CU 50mg',0,1),('cmm86m0h2000frmzgiy0ct7rm','cmm855gsg001xrmc7hwjuyhpn','/uploads/639b599f-3607-4bdc-bb8e-c687fa0f5d9e.jpg','GLP-R 10mg',0,1),('cmm86m0hb000hrmzgb7bd4bhl','cmm855gsb001wrmc7fo4ioe2y','/uploads/dbf0a37b-d5c1-4880-b390-a252491fcc78.jpg','GLP-R 20mg',0,1),('cmm86m0iq000jrmzgpzgyawc5','cmm855gfa000ormc7kxd4eqo5','/uploads/40322c3f-b355-450c-a273-e7160966ec1d.jpg','Glutathione 1,500mg',0,1),('cmm86m0kc000lrmzgd93rslzd','cmm855gmw000trmc7p7vsorph','/uploads/a6a059ca-461f-4641-b1d0-b70e54bf50c9.jpg','Glutathione 1,200mg',0,1),('cmm86m0kj000nrmzgvjk6jk0y','cmm855gre001qrmc7wfych4x8','/uploads/d520e233-dfad-4c56-adf2-346909358586.jpg','HCG 5000iu',0,1),('cmm86m0kx000prmzgci3xiwij','cmm855gq5001grmc70334s973','/uploads/0e6ed2a4-272a-455b-acd0-15e40b0a5738.jpg','Healthy Hair, Skin, & Nails Blend 10ml',0,1),('cmm86m0l5000rrmzg42tcmz5u','cmm855gde000mrmc7vm41dx6a','/uploads/ad79137a-2ad6-4c78-b80d-7f015baa4cfd.jpg','IGF-1 LR3 1mg',0,1),('cmm86m0l9000trmzgmnk91hqb','cmm855gpc001brmc7o7vr6655','/uploads/e52cf907-bd63-4dce-97fc-caf210987402.jpg','Ipamorelin 10mg',0,1),('cmm86m0lq000vrmzg8ibyfgoj','cmm855gcp000jrmc7p9hxxkqd','/uploads/23f43974-35c2-42a9-b521-cd10e320361d.jpg','Kisspeptin-10 10mg',0,1),('cmm86m0lt000xrmzg9p86r4gw','cmm855grc001prmc7mu8qhxbg','/uploads/cc1395f6-084c-4ef3-88ab-d692974c4a28.jpg','KLOW 80mg',0,1),('cmm86m0lw000zrmzgkglh8iym','cmm855gnt000yrmc7r9ewwevp','/uploads/d308742c-a1e6-4548-8d72-c27314a0c433.jpg','KPV 10mg',0,1),('cmm86m0mn0011rmzgw5fzykj2','cmm855gq1001frmc78wkesr99','/uploads/77289a01-acf6-468f-a3c9-bc39ac52b833.jpg','L-Carnitine 500mg/ml 10ml',0,1),('cmm86m0nh0013rmzgv4tf1i1a','cmm855gqd001hrmc7v3mmh15n','/uploads/3824a693-9479-43ba-be2d-4cb03df6f48d.jpg','MOTS-C 10mg',0,1),('cmm86m0oc0015rmzgo54jn1aw','cmm855gna000wrmc7plk67uuf','/uploads/302e60b1-28bd-472e-a20a-15d0b01cc0bd.jpg','MOTS-C 40mg',0,1),('cmm86m0oi0017rmzgrf0azcxe','cmm855gpy001ermc73ijv6osv','/uploads/f6081b5e-01f1-466f-be86-38be87a39242.jpg','MT-1 10mg',0,1),('cmm86m0p10019rmzgmk8yy83c','cmm855gr4001mrmc7yzn6kfhr','/uploads/44628dff-7aa6-45fa-a931-54572ae4cd4a.jpg','MT2 10mg',0,1),('cmm86m0p5001brmzgncfudgt3','cmm855gor0015rmc75if5j6ib','/uploads/a7d0db4b-797a-4582-9d2f-b5d1eca8604d.jpg','NAD+ 500mg（Buffered）',0,1),('cmm86m0p8001drmzgnar0ziui','cmm855gby000grmc7uy6mji79','/uploads/b009d054-863f-4b4d-8a97-bd233fb73257.jpg','Pinealon 20mg',0,1),('cmm86m0pe001frmzged5ibq1s','cmm855gd8000lrmc7gnp3s2v5','/uploads/a9570c29-e082-4f61-b9e9-3e3a64fc0460.jpg','Semax 11mg',0,1),('cmm86m0pj001hrmzg5ei8d7rt','cmm855gnq000xrmc7blpoafn1','/uploads/2ffe831e-e7f0-4e34-a421-36b15dee0c8d.jpg','Sermorelin 10mg',0,1),('cmm86m0pn001jrmzg1qw4uzub','cmm855gpq001crmc7upy5ld7v','/uploads/28a00e03-17fa-44af-8260-dc606eb1c10b.jpg','Sermorelin 5MG',0,1),('cmm86sv9e0001rmh13tl25fbv','cmm855g8l0006rmc7d4e3scdo','/uploads/6afd8ded-c6b7-4f24-97ed-535fa6e85241.jpg','5-Amino-1mq 50mg',0,1),('cmm86svab0003rmh14wrzzqsm','cmm855gn4000urmc7c2e1z2ul','/uploads/c5f76f39-de0f-44e8-b033-4a7ff1e706dd.jpg','AHK-CU 100mg',0,1),('cmm86svad0005rmh1f8qa0l16','cmm855gee000nrmc7fiqhr2s4','/uploads/8e36d0dd-b2ff-4816-aca1-4766da7744fd.jpg','BPC-157 + TB-500 10mg',0,1),('cmm86svaf0007rmh1lv3jp13h','cmm855g8u0008rmc7gtn8msx6','/uploads/ff1ea44c-a59f-4d5d-ba32-060986097d9d.jpg','CJC with DAC 5mg',0,1),('cmm86svag0009rmh14waeeu6f','cmm855gh2000qrmc7hakqw3bs','/uploads/4867f7e9-fed4-42b5-bce0-0c97b48bf4ed.jpg','CJC-1295+IPA no DAC 10mg',0,1),('cmm86svaj000brmh1e09pk2xu','cmm855g8g0005rmc7ra310og1','/uploads/b4332042-213b-42d1-a86d-802240e4e083.jpg','GHK-CU 100mg',0,1),('cmm86svak000drmh1jh2qryio','cmm855gs8001vrmc79tkhh139','/uploads/e89f3e96-fe5b-4a2a-809a-e07aec5c63c9.jpg','GLP-R 30mg',0,1),('cmm86sval000frmh12knvub6x','cmm855gs2001urmc7hdrcrmdz','/uploads/8361ee06-7a95-4048-9763-88ad40323bcf.jpg','GLP-T 15mg',0,1),('cmm86svaz000hrmh1n7ppsbf4','cmm855grz001trmc7977rib0e','/uploads/d500b555-91c9-43ed-9857-6c39a37e607a.jpg','GLP-T 20mg',0,1),('cmm86svb0000jrmh10uqiqg9q','cmm855g9o000brmc744niwvzi','/uploads/1cc99982-ee76-4284-bbb0-5b8abfe2f3c0.jpg','GLP-T 30mg',0,1),('cmm86svb1000lrmh1sec8au60','cmm855g98000armc7xnzz0nyu','/uploads/64b72454-18e3-4e21-b74d-9da2b74da02f.jpg','GLP-T 40mg',0,1),('cmm86svb3000nrmh10pfdj0un','cmm855gqg001irmc72alkvq31','/uploads/c1666613-2e2d-4590-a842-ee036db96bde.jpg','GW-501516 10mg 100 count',0,1),('cmm86svb4000prmh1rpodvc4q','cmm855g7j0002rmc7sz4r9xr9','/uploads/638ca436-ab01-4221-ba78-042d1a49cf0b.jpg','PT-141 10mg',0,1),('cmm86svb5000rrmh1smq3puiw','cmm855g7z0004rmc712krq3yd','/uploads/98d07783-1122-4435-baa0-d2e5b87d635f.jpg','Selank 10mg',0,1),('cmm86svb9000trmh1avyndyzb','cmm855gr7001nrmc796wdq5zp','/uploads/b10871dd-2231-40c8-821a-2d9aaa64262f.jpg','SLU-PP-332 1,000 mcg 100 Count',0,1),('cmm86svba000vrmh1eysq6fxx','cmm855gqj001jrmc7jjp3541z','/uploads/150c596f-7c02-4f27-a37e-5516bd9ee988.jpg','SLU-PP-332 20mg 100 Count',0,1),('cmm86svbe000xrmh1ybpxjdt4','cmm855gr9001ormc76prnxnp4','/uploads/dd63e82b-4ab0-41ca-b90d-e75df101dc21.jpg','Super Human Pump Blend 10ml',0,1),('cmm86svbg000zrmh1chiax4wm','cmm855gjr000rrmc7lw2hzl1p','/uploads/28da9674-c2fe-47b9-b094-b1b7cf0b4f36.jpg','Super Shred Blend 10ml',0,1),('cmm86svbu0011rmh12o8itxff','cmm855gd0000krmc7riumzzoo','/uploads/f58ce840-62a8-4d6a-833e-5304aa2feb78.jpg','Tadalafil 20mg 100 Count',0,1),('cmm86svbv0013rmh1xffey9t2','cmm855gp9001armc7b80dhw1f','/uploads/63446835-9822-44b7-8ec2-0b18c7fec422.jpg','TB500 (TB-4) 10mg',0,1),('cmm86svbx0015rmh1aqis70oe','cmm855gg7000prmc7s91c6c1a','/uploads/59c23678-d2ce-434a-a759-63995f4b60c6.jpg','TB500 (TB-4) 5mg',0,1),('cmm86svc00017rmh1h3lji0h1','cmm855gb5000ermc772ot23oz','/uploads/3a544d5d-c28a-4bfe-a532-3b7b2fcea336.jpg','Tesa 11mg + Ipa 6mg Blend',0,1),('cmm86svc30019rmh1ngyjpa7u','cmm855gpu001drmc7iv6lqa93','/uploads/810a83bd-5c81-4cc2-bdbb-679a76df3550.jpg','Tesamorelin 10mg',0,1),('cmm86svc6001brmh19fzn7ir4','cmm855gcj000irmc7grgqz549','/uploads/5d3e1315-e36a-4ba5-ada8-a06652dc2695.jpg','TRIPLE HELIX  Mitochondrial Powerhouse Research Blend',0,1),('cmm89fckp0001rmgrtbc9oo6u','cmm855g7v0003rmc73lbbehz3','/uploads/3-pack-glp-t-30mg-3pack.jpg','3 Pack GLP-T 30mg',0,1),('cmm89fct70003rmgr3ihi4xuc','cmm855g8r0007rmc78g8ru3xf','/uploads/3-pack-cjc-with-dac-5mg-3pack.jpg','3 Pack CJC with DAC 5mg',0,1),('cmm89fd4e0005rmgrjul9yh9l','cmm855g920009rmc7gauvkg8x','/uploads/3-pack-bpc-157-tb-500-10mg-3pack.jpg','3 Pack BPC-157 + TB-500 10mg',0,1),('cmm89fd9i0007rmgrhpyf9bw0','cmm855g9s000crmc7wdq2navu','/uploads/3-pack-cjc-1295ipa-no-dac-10mg-3pack.jpg','3 Pack CJC-1295+IPA no DAC 10mg',0,1),('cmm89fdb60009rmgrv30542mi','cmm855gad000drmc7i0h7r4cd','/uploads/3-pack-of-tesa-11mg-ipa-6mg-blend-3pack.jpg','3 Pack of Tesa 11mg + Ipa 6mg Blend',0,1),('cmm89fddl000brmgr7ymjbdc0','cmm855gbu000frmc7qh0q6f74','/uploads/3-pack-of-hcg-5000-3pack.jpg','3 Pack of HCG 5000',0,1),('cmm89fdeg000drmgrz9jzj0oq','cmm855gc4000hrmc7if25v7y6','/uploads/3-pack-of-triple-helix-3pack.jpg','3 Pack TRIPLE HELIX',0,1),('cmm89fdk8000frmgroe6e925s','cmm855gnw000zrmc7mawwfzau','/uploads/bpc-157-tb-500-20mg-3-pack-3pack.jpg','3 Pack BPC-157 + TB-500 20mg',0,1),('cmm89fdmu000hrmgr7bl6uier','cmm855gny0010rmc730nm12x7','/uploads/mots-c-10mg-3-pack-3pack.jpg','3 Pack MOTS-C 10mg',0,1),('cmm89fdpv000jrmgry2l7ttwh','cmm855go20011rmc7si1w9nao','/uploads/l-carnitine-500mg-ml-10ml-3-pack-3pack.jpg','3 Pack L-Carnitine 500mg/ml 10ml',0,1),('cmm89fdtv000lrmgr70jsg07h','cmm855go40012rmc7w7mskpdz','/uploads/tesamorelin-10mg-3-pack-3pack.jpg','3 Pack Tesamorelin 10mg',0,1),('cmm89fduu000nrmgrvwohthk9','cmm855go80013rmc7koj11ega','/uploads/cagri-10mg-3-pack-3pack.jpg','3 Pack Cagri 10mg',0,1),('cmm89fdxu000prmgrubrdadpb','cmm855goy0016rmc769kq5jdk','/uploads/3-pack-of-glpr-10mg-3pack.jpg','3 Pack GLP-R 10mg',0,1),('cmm89fdyl000rrmgrpe1mha4i','cmm855gp10017rmc7jh9azje1','/uploads/3-pack-of-glpr-20mg-3pack.jpg','3 Pack of GLP-R 20mg',0,1),('cmm89fdz6000trmgry4a1ty33','cmm855gp30018rmc7fnev3gup','/uploads/3-pack-of-glpr-30mg-3pack.jpg','3 Pack of GLP-R 30mg',0,1),('cmm89fe1y000vrmgrsjgsjafj','cmm855gp60019rmc7enix95zl','/uploads/3-pack-of-klow-80mg-3pack.jpg','3 Pack of KLOW 80mg',0,1);
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_reviews` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `isApproved` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_reviews_userId_productId_key` (`userId`,`productId`),
  KEY `product_reviews_productId_isApproved_idx` (`productId`,`isApproved`),
  CONSTRAINT `product_reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_reviews`
--

LOCK TABLES `product_reviews` WRITE;
/*!40000 ALTER TABLE `product_reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compareAtPrice` decimal(10,2) DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `sortOrder` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `options` json NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `printfulProductId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `printfulVariantId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_variants_sku_key` (`sku`),
  KEY `product_variants_productId_idx` (`productId`),
  KEY `product_variants_sku_idx` (`sku`),
  KEY `product_variants_printfulVariantId_idx` (`printfulVariantId`),
  CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `shortDescription` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `basePrice` decimal(10,2) NOT NULL,
  `compareAtPrice` decimal(10,2) DEFAULT NULL,
  `costPrice` decimal(10,2) DEFAULT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `isFeatured` tinyint(1) NOT NULL DEFAULT '0',
  `metaTitle` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaDescription` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_slug_key` (`slug`),
  UNIQUE KEY `products_sku_key` (`sku`),
  KEY `products_slug_idx` (`slug`),
  KEY `products_isActive_isFeatured_idx` (`isActive`,`isFeatured`),
  KEY `products_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('cmm855g7j0002rmc7sz4r9xr9','PT-141 10mg','pt-141-10mg',NULL,NULL,40.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.279','2026-03-01 20:19:58.721'),('cmm855g7v0003rmc73lbbehz3','3 Pack GLP-T 30mg','3-pack-glp-t-30mg',NULL,NULL,240.00,NULL,NULL,NULL,19,1,0,NULL,NULL,0,'2026-03-01 19:26:43.291','2026-03-01 22:26:32.466'),('cmm855g7z0004rmc712krq3yd','Selank 10mg','selank-10mg',NULL,NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.295','2026-03-01 20:19:58.721'),('cmm855g8g0005rmc7ra310og1','GHK-CU 100mg','ghk-cu-100mg',NULL,NULL,60.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.313','2026-03-01 20:19:58.721'),('cmm855g8l0006rmc7d4e3scdo','5-Amino-1mq 50mg','5-amino-1mq-50mg','<p>5-Amino-1mq 50mg</p>',NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.317','2026-03-01 20:19:58.721'),('cmm855g8r0007rmc78g8ru3xf','3 Pack CJC with DAC 5mg','3-pack-cjc-with-dac-5mg','<p>3 Pack of CJC with DAC 5mg</p>',NULL,180.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.324','2026-03-01 20:19:58.721'),('cmm855g8u0008rmc7gtn8msx6','CJC with DAC 5mg','cjc-with-dac-5mg','<p>CJC with DAC 5mg</p>',NULL,60.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.327','2026-03-01 20:19:58.721'),('cmm855g920009rmc7gauvkg8x','3 Pack BPC-157 + TB-500 10mg','3-pack-bpc-157-tb-500-10mg','<p>3 Pack of 5mg BPC-157 + 5mg TB-500</p>',NULL,120.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.335','2026-03-01 20:19:58.721'),('cmm855g98000armc7xnzz0nyu','GLP-T 40mg','glp-t-40mg',NULL,NULL,100.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.341','2026-03-01 20:19:58.721'),('cmm855g9o000brmc744niwvzi','GLP-T 30mg','glp-t-30mg',NULL,NULL,80.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.357','2026-03-01 20:19:58.721'),('cmm855g9s000crmc7wdq2navu','3 Pack CJC-1295+IPA no DAC 10mg','3-pack-cjc-1295ipa-no-dac-10mg','<p>CJC-1295 5mg + IPA 5mg no DAC x3= 30mg total</p>',NULL,135.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.361','2026-03-01 20:19:58.721'),('cmm855gad000drmc7i0h7r4cd','3 Pack of Tesa 11mg + Ipa 6mg Blend','3-pack-of-tesa-11mg-ipa-6mg-blend','<p>3 pack of Tesamorelin 11mg + Ipamorelin 6mg = 17mg blend</p>',NULL,200.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.382','2026-03-01 20:19:58.721'),('cmm855gb5000ermc772ot23oz','Tesa 11mg + Ipa 6mg Blend','tesa-11mg-ipa-6mg-blend','<p>Tesamorelin 11mg + Ipamorelin 6mg = 17mg blend</p>',NULL,75.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.409','2026-03-01 20:19:58.721'),('cmm855gbu000frmc7qh0q6f74','3 Pack of HCG 5000','3-pack-of-hcg-5000',NULL,NULL,120.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.435','2026-03-01 20:19:58.721'),('cmm855gby000grmc7uy6mji79','Pinealon 20mg','pinealon-20mg',NULL,NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.438','2026-03-01 20:19:58.721'),('cmm855gc4000hrmc7if25v7y6','3 Pack TRIPLE HELIX','3-pack-of-triple-helix','<p data-start=\"597\" data-end=\"807\"><strong data-start=\"597\" data-end=\"613\">TRIPLE HELIX</strong> is an advanced peptide research blend engineered to support <strong data-start=\"674\" data-end=\"754\">mitochondrial function, cellular energy production, and metabolic efficiency</strong> through three distinct yet complementary mechanisms.</p>\n<p data-start=\"809\" data-end=\"1107\">By combining <strong data-start=\"822\" data-end=\"830\">NAD+</strong>, <strong data-start=\"832\" data-end=\"842\">MOTS-C</strong>, and <strong data-start=\"848\" data-end=\"863\">5-Amino-1MQ</strong>, <strong>TRIPLE HELIX</strong> <span style=\"box-sizing: border-box; margin: 0px; padding: 0px;\">simultaneously targets energy metabolism at the <strong>cellular</strong>, <strong>mitochondrial</strong>, and <strong>metabolic-regulation</strong> levels</span>. This triple-pathway approach creates a synergistic effect far beyond what each compound can deliver on its own.</p>\n<h3 data-start=\"1109\" data-end=\"1146\">🔬 <strong data-start=\"1116\" data-end=\"1146\">What’s Inside TRIPLE HELIX</strong></h3>\n<ul data-start=\"1147\" data-end=\"1710\">\n<li data-start=\"1147\" data-end=\"1343\">\n<p data-start=\"1149\" data-end=\"1343\"><strong data-start=\"1149\" data-end=\"1165\">NAD+ (100mg)</strong><br data-start=\"1165\" data-end=\"1168\" />A critical coenzyme involved in ATP generation, mitochondrial health, and cellular repair pathways and widely studied for its role in energy metabolism and cellular resilience.</p>\n</li>\n<li data-start=\"1345\" data-end=\"1534\">\n<p data-start=\"1347\" data-end=\"1534\"><strong data-start=\"1347\" data-end=\"1364\">MOTS-C (10mg)</strong><br data-start=\"1364\" data-end=\"1367\" />A mitochondrial-derived peptide known for regulating glucose utilization, improving insulin sensitivity, and enhancing fat oxidation through mitochondrial signaling.</p>\n</li>\n<li data-start=\"1536\" data-end=\"1710\">\n<p data-start=\"1538\" data-end=\"1710\"><strong data-start=\"1538\" data-end=\"1560\">5-Amino-1MQ (10mg)</strong><br data-start=\"1560\" data-end=\"1563\" />An NNMT inhibitor studied for its ability to suppress adipocyte expansion, increase cellular energy expenditure, and support lean-mass signaling.</p>\n</li>\n</ul>\n<h3 data-start=\"1712\" data-end=\"1748\">⚡ How<strong data-start=\"1718\" data-end=\"1748\"> the Triple Helix Works</strong></h3>\n<p data-start=\"1749\" data-end=\"1827\">Each component removes a different bottleneck in the energy-production system:</p>\n<ul data-start=\"1829\" data-end=\"1984\">\n<li data-start=\"1829\" data-end=\"1868\">\n<p data-start=\"1831\" data-end=\"1868\"><strong data-start=\"1831\" data-end=\"1839\">NAD+</strong> fuels mitochondrial output</p>\n</li>\n<li data-start=\"1869\" data-end=\"1913\">\n<p data-start=\"1871\" data-end=\"1913\"><strong data-start=\"1871\" data-end=\"1881\">MOTS-C</strong> optimizes metabolic signaling</p>\n</li>\n<li data-start=\"1914\" data-end=\"1984\">\n<p data-start=\"1916\" data-end=\"1984\"><strong data-start=\"1916\" data-end=\"1931\">5-Amino-1MQ</strong> shifts the system toward higher energy expenditure</p>\n</li>\n</ul>\n<p data-start=\"1986\" data-end=\"2062\">Together, they create a <strong data-start=\"2010\" data-end=\"2047\">coordinated metabolic environment</strong> that supports:</p>\n<ul data-start=\"2063\" data-end=\"2253\">\n<li data-start=\"2063\" data-end=\"2102\">\n<p data-start=\"2065\" data-end=\"2102\">Enhanced <strong data-start=\"2074\" data-end=\"2102\">mitochondrial efficiency</strong></p>\n</li>\n<li data-start=\"2103\" data-end=\"2133\">\n<p data-start=\"2105\" data-end=\"2133\">Increased <strong data-start=\"2115\" data-end=\"2133\">ATP production</strong></p>\n</li>\n<li data-start=\"2134\" data-end=\"2170\">\n<p data-start=\"2136\" data-end=\"2170\">Improved <strong data-start=\"2145\" data-end=\"2170\">metabolic flexibility</strong></p>\n</li>\n<li data-start=\"2171\" data-end=\"2206\">\n<p data-start=\"2173\" data-end=\"2206\">Reduced <strong data-start=\"2181\" data-end=\"2206\">fat-storage signaling</strong></p>\n</li>\n<li data-start=\"2207\" data-end=\"2253\">\n<p data-start=\"2209\" data-end=\"2253\">Greater <strong data-start=\"2217\" data-end=\"2253\">cellular resilience under stress</strong></p>\n</li>\n</ul>\n<p data-start=\"2255\" data-end=\"2336\">This is why TRIPLE HELIX is considered a true <strong data-start=\"2301\" data-end=\"2335\">mitochondrial powerhouse blend</strong>.</p>\n<h3 data-start=\"2338\" data-end=\"2379\">🧠 <strong data-start=\"2345\" data-end=\"2379\">Intended Research Applications</strong></h3>\n<p data-start=\"2380\" data-end=\"2448\">TRIPLE HELIX is designed for advanced research models investigating:</p>\n<ul data-start=\"2449\" data-end=\"2639\">\n<li data-start=\"2449\" data-end=\"2478\">\n<p data-start=\"2451\" data-end=\"2478\">Mitochondrial dysfunction</p>\n</li>\n<li data-start=\"2479\" data-end=\"2509\">\n<p data-start=\"2481\" data-end=\"2509\">Cellular energy metabolism</p>\n</li>\n<li data-start=\"2510\" data-end=\"2553\">\n<p data-start=\"2512\" data-end=\"2553\">Fat-loss and body-composition signaling</p>\n</li>\n<li data-start=\"2554\" data-end=\"2598\">\n<p data-start=\"2556\" data-end=\"2598\">Metabolic health and insulin sensitivity</p>\n</li>\n<li data-start=\"2599\" data-end=\"2639\">\n<p data-start=\"2601\" data-end=\"2639\">Cellular aging and stress resistance</p>\n</li>\n</ul>\n<p data-start=\"2704\" data-end=\"2766\"><strong data-start=\"2704\" data-end=\"2720\">TRIPLE HELIX</strong><br data-start=\"2720\" data-end=\"2723\" /><em data-start=\"2723\" data-end=\"2764\">Mitochondrial Powerhouse Research Blend</em></p>\n<p data-start=\"2768\" data-end=\"2813\">100mg NAD+<br data-start=\"2778\" data-end=\"2781\" />10mg MOTS-C<br data-start=\"2792\" data-end=\"2795\" />10mg 5-Amino-1MQ</p>\n<p data-start=\"2815\" data-end=\"2850\"><strong data-start=\"2815\" data-end=\"2850\">Three Pathways. One Powerhouse.</strong></p>\n<hr data-start=\"2852\" data-end=\"2855\" />\n<p data-start=\"3076\" data-end=\"3259\"><strong data-start=\"3076\" data-end=\"3102\">For Research Use Only.</strong><br data-start=\"3102\" data-end=\"3105\" />Not for human consumption. Intended solely for laboratory research by qualified professionals. Use in compliance with all applicable laws and regulations.</p>','<p data-start=\"2704\" data-end=\"2766\"><em data-start=\"2723\" data-end=\"2764\">Mitochondrial Powerhouse Research Blend</em></p>\n<p data-start=\"2768\" data-end=\"2813\">100mg NAD+<br data-start=\"2778\" data-end=\"2781\" />10mg MOTS-C<br data-start=\"2792\" data-end=\"2795\" />10mg 5-Amino-1MQ</p>',150.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.444','2026-03-01 20:19:58.721'),('cmm855gcj000irmc7grgqz549','TRIPLE HELIX  Mitochondrial Powerhouse Research Blend','triple-helix-mitochondrial-powerhouse-research-blend','<p data-start=\"597\" data-end=\"807\"><strong data-start=\"597\" data-end=\"613\">TRIPLE HELIX</strong> is an advanced peptide research blend engineered to support <strong data-start=\"674\" data-end=\"754\">mitochondrial function, cellular energy production, and metabolic efficiency</strong> through three distinct yet complementary mechanisms.</p>\n<p data-start=\"809\" data-end=\"1107\">By combining <strong data-start=\"822\" data-end=\"830\">NAD+</strong>, <strong data-start=\"832\" data-end=\"842\">MOTS-C</strong>, and <strong data-start=\"848\" data-end=\"863\">5-Amino-1MQ</strong>, <strong>TRIPLE HELIX</strong> <span style=\"box-sizing: border-box; margin: 0px; padding: 0px;\">simultaneously targets energy metabolism at the <strong>cellular</strong>, <strong>mitochondrial</strong>, and <strong>metabolic-regulation</strong> levels</span>. This triple-pathway approach creates a synergistic effect far beyond what each compound can deliver on its own.</p>\n<h3 data-start=\"1109\" data-end=\"1146\">🔬 <strong data-start=\"1116\" data-end=\"1146\">What’s Inside TRIPLE HELIX</strong></h3>\n<ul data-start=\"1147\" data-end=\"1710\">\n<li data-start=\"1147\" data-end=\"1343\">\n<p data-start=\"1149\" data-end=\"1343\"><strong data-start=\"1149\" data-end=\"1165\">NAD+ (100mg)</strong><br data-start=\"1165\" data-end=\"1168\" />A critical coenzyme involved in ATP generation, mitochondrial health, and cellular repair pathways and widely studied for its role in energy metabolism and cellular resilience.</p>\n</li>\n<li data-start=\"1345\" data-end=\"1534\">\n<p data-start=\"1347\" data-end=\"1534\"><strong data-start=\"1347\" data-end=\"1364\">MOTS-C (10mg)</strong><br data-start=\"1364\" data-end=\"1367\" />A mitochondrial-derived peptide known for regulating glucose utilization, improving insulin sensitivity, and enhancing fat oxidation through mitochondrial signaling.</p>\n</li>\n<li data-start=\"1536\" data-end=\"1710\">\n<p data-start=\"1538\" data-end=\"1710\"><strong data-start=\"1538\" data-end=\"1560\">5-Amino-1MQ (10mg)</strong><br data-start=\"1560\" data-end=\"1563\" />An NNMT inhibitor studied for its ability to suppress adipocyte expansion, increase cellular energy expenditure, and support lean-mass signaling.</p>\n</li>\n</ul>\n<h3 data-start=\"1712\" data-end=\"1748\">⚡ How<strong data-start=\"1718\" data-end=\"1748\"> the Triple Helix Works</strong></h3>\n<p data-start=\"1749\" data-end=\"1827\">Each component removes a different bottleneck in the energy-production system:</p>\n<ul data-start=\"1829\" data-end=\"1984\">\n<li data-start=\"1829\" data-end=\"1868\">\n<p data-start=\"1831\" data-end=\"1868\"><strong data-start=\"1831\" data-end=\"1839\">NAD+</strong> fuels mitochondrial output</p>\n</li>\n<li data-start=\"1869\" data-end=\"1913\">\n<p data-start=\"1871\" data-end=\"1913\"><strong data-start=\"1871\" data-end=\"1881\">MOTS-C</strong> optimizes metabolic signaling</p>\n</li>\n<li data-start=\"1914\" data-end=\"1984\">\n<p data-start=\"1916\" data-end=\"1984\"><strong data-start=\"1916\" data-end=\"1931\">5-Amino-1MQ</strong> shifts the system toward higher energy expenditure</p>\n</li>\n</ul>\n<p data-start=\"1986\" data-end=\"2062\">Together, they create a <strong data-start=\"2010\" data-end=\"2047\">coordinated metabolic environment</strong> that supports:</p>\n<ul data-start=\"2063\" data-end=\"2253\">\n<li data-start=\"2063\" data-end=\"2102\">\n<p data-start=\"2065\" data-end=\"2102\">Enhanced <strong data-start=\"2074\" data-end=\"2102\">mitochondrial efficiency</strong></p>\n</li>\n<li data-start=\"2103\" data-end=\"2133\">\n<p data-start=\"2105\" data-end=\"2133\">Increased <strong data-start=\"2115\" data-end=\"2133\">ATP production</strong></p>\n</li>\n<li data-start=\"2134\" data-end=\"2170\">\n<p data-start=\"2136\" data-end=\"2170\">Improved <strong data-start=\"2145\" data-end=\"2170\">metabolic flexibility</strong></p>\n</li>\n<li data-start=\"2171\" data-end=\"2206\">\n<p data-start=\"2173\" data-end=\"2206\">Reduced <strong data-start=\"2181\" data-end=\"2206\">fat-storage signaling</strong></p>\n</li>\n<li data-start=\"2207\" data-end=\"2253\">\n<p data-start=\"2209\" data-end=\"2253\">Greater <strong data-start=\"2217\" data-end=\"2253\">cellular resilience under stress</strong></p>\n</li>\n</ul>\n<p data-start=\"2255\" data-end=\"2336\">This is why TRIPLE HELIX is considered a true <strong data-start=\"2301\" data-end=\"2335\">mitochondrial powerhouse blend</strong>.</p>\n<h3 data-start=\"2338\" data-end=\"2379\">🧠 <strong data-start=\"2345\" data-end=\"2379\">Intended Research Applications</strong></h3>\n<p data-start=\"2380\" data-end=\"2448\">TRIPLE HELIX is designed for advanced research models investigating:</p>\n<ul data-start=\"2449\" data-end=\"2639\">\n<li data-start=\"2449\" data-end=\"2478\">\n<p data-start=\"2451\" data-end=\"2478\">Mitochondrial dysfunction</p>\n</li>\n<li data-start=\"2479\" data-end=\"2509\">\n<p data-start=\"2481\" data-end=\"2509\">Cellular energy metabolism</p>\n</li>\n<li data-start=\"2510\" data-end=\"2553\">\n<p data-start=\"2512\" data-end=\"2553\">Fat-loss and body-composition signaling</p>\n</li>\n<li data-start=\"2554\" data-end=\"2598\">\n<p data-start=\"2556\" data-end=\"2598\">Metabolic health and insulin sensitivity</p>\n</li>\n<li data-start=\"2599\" data-end=\"2639\">\n<p data-start=\"2601\" data-end=\"2639\">Cellular aging and stress resistance</p>\n</li>\n</ul>\n<p data-start=\"2704\" data-end=\"2766\"><strong data-start=\"2704\" data-end=\"2720\">TRIPLE HELIX</strong><br data-start=\"2720\" data-end=\"2723\" /><em data-start=\"2723\" data-end=\"2764\">Mitochondrial Powerhouse Research Blend</em></p>\n<p data-start=\"2768\" data-end=\"2813\">100mg NAD+<br data-start=\"2778\" data-end=\"2781\" />10mg MOTS-C<br data-start=\"2792\" data-end=\"2795\" />10mg 5-Amino-1MQ</p>\n<p data-start=\"2815\" data-end=\"2850\"><strong data-start=\"2815\" data-end=\"2850\">Three Pathways. One Powerhouse.</strong></p>\n<hr data-start=\"2852\" data-end=\"2855\" />\n<p data-start=\"3076\" data-end=\"3259\"><strong data-start=\"3076\" data-end=\"3102\">For Research Use Only.</strong><br data-start=\"3102\" data-end=\"3105\" />Not for human consumption. Intended solely for laboratory research by qualified professionals. Use in compliance with all applicable laws and regulations.</p>','<p data-start=\"2704\" data-end=\"2766\"><em data-start=\"2723\" data-end=\"2764\">Mitochondrial Powerhouse Research Blend</em></p>\n<p data-start=\"2768\" data-end=\"2813\">100mg NAD+<br data-start=\"2778\" data-end=\"2781\" />10mg MOTS-C<br data-start=\"2792\" data-end=\"2795\" />10mg 5-Amino-1MQ</p>',65.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.459','2026-03-01 20:19:58.721'),('cmm855gcp000jrmc7p9hxxkqd','Kisspeptin-10 10mg','kisspeptin-10-10mg','<p>Kisspeptin-10 10mg</p>\n<p data-start=\"220\" data-end=\"265\"><strong data-start=\"220\" data-end=\"265\">Neuroendocrine Signaling Research Peptide</strong></p>\n<p data-start=\"267\" data-end=\"489\"><strong data-start=\"267\" data-end=\"284\">Kisspeptin-10</strong> is a biologically active fragment of the kisspeptin protein family, widely studied for its critical role in <strong data-start=\"393\" data-end=\"448\">hypothalamic–pituitary–gonadal (HPG) axis signaling</strong> and <strong data-start=\"453\" data-end=\"488\">reproductive hormone regulation</strong>.</p>\n<p data-start=\"491\" data-end=\"717\">In research settings, Kisspeptin-10 is recognized as a powerful upstream signaling molecule that interacts with <strong data-start=\"603\" data-end=\"631\">GPR54 (KISS1R) receptors</strong>, triggering cascades involved in <strong data-start=\"665\" data-end=\"716\">gonadotropin-releasing hormone (GnRH) secretion</strong>.</p>\n<h3 data-start=\"719\" data-end=\"768\">🔬 <strong data-start=\"726\" data-end=\"768\">Research Applications &amp; Interest Areas</strong></h3>\n<p data-start=\"769\" data-end=\"826\">Kisspeptin-10 is commonly explored in studies related to:</p>\n<ul data-start=\"827\" data-end=\"1036\">\n<li data-start=\"827\" data-end=\"866\">\n<p data-start=\"829\" data-end=\"866\"><strong data-start=\"829\" data-end=\"866\">Neuroendocrine signaling pathways</strong></p>\n</li>\n<li data-start=\"867\" data-end=\"892\">\n<p data-start=\"869\" data-end=\"892\"><strong data-start=\"869\" data-end=\"892\">HPG axis regulation</strong></p>\n</li>\n<li data-start=\"893\" data-end=\"920\">\n<p data-start=\"895\" data-end=\"920\"><strong data-start=\"895\" data-end=\"920\">GnRH pulse initiation</strong></p>\n</li>\n<li data-start=\"921\" data-end=\"956\">\n<p data-start=\"923\" data-end=\"956\"><strong data-start=\"923\" data-end=\"956\">LH and FSH secretion dynamics</strong></p>\n</li>\n<li data-start=\"957\" data-end=\"1001\">\n<p data-start=\"959\" data-end=\"1001\"><strong data-start=\"959\" data-end=\"1001\">Puberty onset and reproductive biology</strong></p>\n</li>\n<li data-start=\"1002\" data-end=\"1036\">\n<p data-start=\"1004\" data-end=\"1036\"><strong data-start=\"1004\" data-end=\"1036\">Hormonal feedback mechanisms</strong></p>\n</li>\n</ul>\n<p data-start=\"1038\" data-end=\"1206\">Due to its short amino acid sequence and high receptor affinity, Kisspeptin-10 is often favored in experimental models examining <strong data-start=\"1167\" data-end=\"1205\">rapid hormonal signaling responses</strong>.</p>\n<h3 data-start=\"1208\" data-end=\"1234\">🧪 <strong data-start=\"1215\" data-end=\"1234\">Product Details</strong></h3>\n<ul data-start=\"1235\" data-end=\"1361\">\n<li data-start=\"1235\" data-end=\"1266\">\n<p data-start=\"1237\" data-end=\"1266\"><strong data-start=\"1237\" data-end=\"1250\">Compound:</strong> Kisspeptin-10</p>\n</li>\n<li data-start=\"1267\" data-end=\"1296\">\n<p data-start=\"1269\" data-end=\"1296\"><strong data-start=\"1269\" data-end=\"1280\">Amount:</strong> 10mg per vial</p>\n</li>\n<li data-start=\"1297\" data-end=\"1330\">\n<p data-start=\"1299\" data-end=\"1330\"><strong data-start=\"1299\" data-end=\"1308\">Form:</strong> Lyophilized peptide</p>\n</li>\n<li data-start=\"1331\" data-end=\"1361\">\n<p data-start=\"1333\" data-end=\"1361\"><strong data-start=\"1333\" data-end=\"1344\">Purity:</strong> Research-grade</p>\n</li>\n</ul>\n<h3 data-start=\"1363\" data-end=\"1388\">🧠 <strong data-start=\"1370\" data-end=\"1388\">Research Notes</strong></h3>\n<p data-start=\"1389\" data-end=\"1618\">Kisspeptin-10 is valued for its role as a <strong data-start=\"1441\" data-end=\"1466\">key regulatory switch</strong> in endocrine signaling, making it an essential tool for researchers investigating fertility, hormone communication, and neuroendocrine control systems.</p>\n<hr data-start=\"1620\" data-end=\"1623\" />\n<p data-start=\"1625\" data-end=\"1869\">⚠️ <strong data-start=\"1628\" data-end=\"1653\">For Research Use Only</strong><br data-start=\"1653\" data-end=\"1656\" />Not for human consumption. This product is intended strictly for laboratory research by qualified professionals. By purchasing, you agree to use this product in compliance with all applicable laws and regulations.</p>',NULL,50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.466','2026-03-01 20:19:58.721'),('cmm855gd0000krmc7riumzzoo','Tadalafil 20mg 100 Count','tadalafil-20mg-100-count',NULL,NULL,100.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.476','2026-03-01 20:19:58.721'),('cmm855gd8000lrmc7gnp3s2v5','Semax 11mg','semax-11mg','<p>Semax 11mg</p>',NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.484','2026-03-01 20:19:58.721'),('cmm855gde000mrmc7vm41dx6a','IGF-1 LR3 1mg','igf-1-lr3-1mg','<p>IGF-1 LR3 1mg</p>',NULL,60.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.491','2026-03-01 20:19:58.721'),('cmm855gee000nrmc7fiqhr2s4','BPC-157 + TB-500 10mg','bpc-157-tb-500-10mg','<p>5mg BPC-157 + 5mg TB-500</p>',NULL,40.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.526','2026-03-01 20:19:58.721'),('cmm855gfa000ormc7kxd4eqo5','Glutathione 1,500mg','glutathione-1500mg','<p>Glutathione 1,500mg</p>',NULL,40.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.558','2026-03-01 20:19:58.721'),('cmm855gg7000prmc7s91c6c1a','TB500 (TB-4) 5mg','tb500-tb-4-5mg','<p>TB500 (TB-4) 5mg</p>',NULL,25.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.591','2026-03-01 20:19:58.721'),('cmm855gh2000qrmc7hakqw3bs','CJC-1295+IPA no DAC 10mg','cjc-1295-no-dac-ipa-10mg','<p>CJC-1295 5mg + IPA 5mg no DAC= 10mg total</p>',NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.622','2026-03-01 20:19:58.721'),('cmm855gjr000rrmc7lw2hzl1p','Super Shred Blend 10ml','super-shred-blend-10ml','<p class=\"p1\">SUPER SHRED 10ml</p>\n<p>Per ml:</p>\n<p class=\"p1\">L-Carnitine 400mg</p>\n<p class=\"p1\">MIC BLEND 100mg</p>\n<p class=\"p1\">ATP 50mg</p>\n<p class=\"p1\">Albuterol 2mg</p>\n<p class=\"p1\">B12 1mg</p>',NULL,40.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.720','2026-03-01 20:19:58.721'),('cmm855glx000srmc76xeu30bs','Cagri 10mg','cagri-10mg','<p>Cagrilinitide 10mg</p>',NULL,50.00,NULL,NULL,NULL,19,1,0,NULL,NULL,0,'2026-03-01 19:26:43.797','2026-03-01 22:12:25.981'),('cmm855gmw000trmc7p7vsorph','Glutathione 1,200mg','glutathione-1200mg',NULL,NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.832','2026-03-01 20:19:58.721'),('cmm855gn4000urmc7c2e1z2ul','AHK-CU 100mg','ahk-cu-100mg','<p>AHK-CU 100mg</p>',NULL,40.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.840','2026-03-01 20:19:58.721'),('cmm855gn7000vrmc7sgx0f5jl','Epitalon 50mg','epithalon-50mg','<p>Epithalon (aka Epitalon) 50mg</p>',NULL,75.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.843','2026-03-01 20:19:58.721'),('cmm855gna000wrmc7plk67uuf','MOTS-C 40mg','mots-c-40mg','<p>MOTS-C 40mg</p>',NULL,75.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.846','2026-03-01 20:19:58.721'),('cmm855gnq000xrmc7blpoafn1','Sermorelin 10mg','sermorelin-10mg',NULL,NULL,55.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.862','2026-03-01 20:19:58.721'),('cmm855gnt000yrmc7r9ewwevp','KPV 10mg','kpv-10mg','<p>KPV 10mg</p>',NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.865','2026-03-01 20:19:58.721'),('cmm855gnw000zrmc7mawwfzau','3 Pack BPC-157 + TB-500 20mg','bpc-157-tb-500-20mg-3-pack','<p>BPC-157 10mg + TB-500 10mg = 20mg 3 Pack</p>\n<p>60mg total</p>\n<p>&nbsp;</p>',NULL,180.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.868','2026-03-01 20:19:58.721'),('cmm855gny0010rmc730nm12x7','3 Pack MOTS-C 10mg','mots-c-10mg-3-pack','<p>MOTS-C 10mg 3 Pack</p>\n<p>30mg of MOTS-C</p>',NULL,75.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.871','2026-03-01 20:19:58.721'),('cmm855go20011rmc7si1w9nao','3 Pack L-Carnitine 500mg/ml 10ml','l-carnitine-500mg-ml-10ml-3-pack','<p>L-Carnitine 500mg/ml 10ml 3 Pack</p>\n<p>15,000 mg of L-Carn</p>',NULL,50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.874','2026-03-01 20:19:58.721'),('cmm855go40012rmc7w7mskpdz','3 Pack Tesamorelin 10mg','tesamorelin-10mg-3-pack','<p>Tesamorelin 10mg 3 Pack</p>\n<p>30mg total</p>',NULL,130.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.877','2026-03-01 20:19:58.721'),('cmm855go80013rmc7koj11ega','3 Pack Cagri 10mg','cagri-10mg-3-pack','<p>Cagrilinitide 10mg 3 Pack = 30mg total</p>',NULL,120.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.880','2026-03-01 20:19:58.721'),('cmm855gom0014rmc75lbub5k0','Cagri 5mg','cagri-5mg','<p>Cagrilinitide 5mg</p>',NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.895','2026-03-01 20:19:58.721'),('cmm855gor0015rmc75if5j6ib','NAD+ 500mg（Buffered）','nad-500mg%ef%bc%88buffered%ef%bc%89','<p class=\"p1\">NAD+（Buffered）</p>\n<p>Must reconstitute with bac water.</p>',NULL,30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.899','2026-03-01 20:19:58.721'),('cmm855goy0016rmc769kq5jdk','3 Pack GLP-R 10mg','3-pack-of-glpr-10mg','<p>3 Pack of GLP-R 10mg</p>',NULL,150.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.906','2026-03-01 20:19:58.721'),('cmm855gp10017rmc7jh9azje1','3 Pack of GLP-R 20mg','3-pack-of-glpr-20mg','<p>3 Pack of GLP-R 20mg</p>',NULL,240.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.909','2026-03-01 20:19:58.721'),('cmm855gp30018rmc7fnev3gup','3 Pack of GLP-R 30mg','3-pack-of-glpr-30mg','<p>3 Pack of GLP-R 30mg</p>',NULL,330.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.911','2026-03-01 20:19:58.721'),('cmm855gp60019rmc7enix95zl','3 Pack of KLOW 80mg','3-pack-of-klow-80mg','<p>3 Pack of KLOW 80mg</p>',NULL,300.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.915','2026-03-01 20:19:58.721'),('cmm855gp9001armc7b80dhw1f','TB500 (TB-4) 10mg','tb4-tb500-10mg',NULL,NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.917','2026-03-01 20:19:58.721'),('cmm855gpc001brmc7o7vr6655','Ipamorelin 10mg','ipamorelin-10mg',NULL,NULL,30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.920','2026-03-01 20:19:58.721'),('cmm855gpq001crmc7upy5ld7v','Sermorelin 5MG','sermorelin-5mg',NULL,NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.935','2026-03-01 20:19:58.721'),('cmm855gpu001drmc7iv6lqa93','Tesamorelin 10mg','tesamorelin-10mg','<p>Tesamorelin 10mg</p>',NULL,50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.939','2026-03-01 20:19:58.721'),('cmm855gpy001ermc73ijv6osv','MT-1 10mg','mt-1-10mg','<p>Melanotan-1 10mg</p>',NULL,30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.942','2026-03-01 20:19:58.721'),('cmm855gq1001frmc78wkesr99','L-Carnitine 500mg/ml 10ml','l-carnitine-500mg-ml-10ml','<p>L-Carnitine 500mg/ml 10ml</p>',NULL,20.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.946','2026-03-01 20:19:58.721'),('cmm855gq5001grmc70334s973','Healthy Hair, Skin, & Nails Blend 10ml','healthy-hair-skin-nails-blend-10ml','<p>Dosages per 1 ml.</p>\n<p class=\"p1\"><b>NIACINAMIDE 50mg</b></p>\n<p class=\"p1\"><b>THIAMINE HCL 50mg</b></p>\n<p class=\"p1\"><b>PANTOTHENIC ACID 25mg</b></p>\n<p class=\"p1\"><b>CHOLINE 10mg</b></p>\n<p class=\"p1\"><b>INOSITOL 10mg</b></p>\n<p class=\"p1\"><b>NIACIN 5mg</b></p>\n<p class=\"p1\"><b>BIOTIN 100mcg</b></p>\n<p class=\"p1\"><b>FOLIC ACID 100mcg</b></p>\n<p class=\"p1\"><b>RIBOFLAVIN 100mcg</b></p>',NULL,50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.949','2026-03-01 20:19:58.721'),('cmm855gqd001hrmc7v3mmh15n','MOTS-C 10mg','mots-c-10mg','<p>MOTS-C 10mg</p>',NULL,30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.957','2026-03-01 20:19:58.721'),('cmm855gqg001irmc72alkvq31','GW-501516 10mg 100 count','gw-501516-10mg-100-count','<p>GW-501516 Cardarine 10mg 100 count</p>',NULL,80.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.960','2026-03-01 20:19:58.721'),('cmm855gqj001jrmc7jjp3541z','SLU-PP-332 20mg 100 Count','slu-pp-332-20mg-100-count-copy','<p>SLU-PP-332 20mg tablets- 100 count</p>',NULL,165.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.963','2026-03-01 20:19:58.721'),('cmm855gqm001krmc72as0kad2','Bacteriostatic Water','bacteriostatic-water','<p>10 ML Bacteriostatic Water</p>\n<p>Ultra clean with 0.9% Benzyl Alcohol</p>',NULL,10.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.967','2026-03-01 20:19:58.721'),('cmm855gr1001lrmc7lwkowkcg','BPC-157 + TB-500 20mg','bpc-157-tb-500-20mg','<p>10mg BPC-157 + 10mg TB-500</p>',NULL,75.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.981','2026-03-01 20:19:58.721'),('cmm855gr4001mrmc7yzn6kfhr','MT2 10mg','mt2-10mg','<p>Melanotan II</p>','<p>Melanotan II</p>',30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.984','2026-03-01 20:19:58.721'),('cmm855gr7001nrmc796wdq5zp','SLU-PP-332 1,000 mcg 100 Count','slu-pp-332-1000-mcg-100-count','<p>SLU-PP-332 1mg tablets- 100 count</p>',NULL,100.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.987','2026-03-01 20:19:58.721'),('cmm855gr9001ormc76prnxnp4','Super Human Pump Blend 10ml','super-human-pump-blend','<p>Ingredients per 1 ml</p>\n<p class=\"p1\"><b>L-Arginine 110mg</b></p>\n<p class=\"p1\"><b>L-Ornithin 110mg</b></p>\n<p class=\"p1\"><b>L-Citruline 120mg</b></p>\n<p class=\"p1\"><b>L-Lysine 70mg</b></p>\n<p class=\"p1\"><b>L-Glutamine 40mg</b></p>\n<p class=\"p1\"><b>L-Proline 60mg</b></p>\n<p class=\"p1\"><b>L-Taurine 60mg</b></p>\n<p class=\"p1\"><b>L-Carnitine 220mg</b></p>\n<p class=\"p1\"><b>NAC 75mg</b></p>','<p class=\"p1\"><b>L-Arginine 110mg</b></p>\n<p class=\"p1\"><b>L-Ornithin 110mg</b></p>\n<p class=\"p1\"><b>L-Citruline 120mg</b></p>\n<p class=\"p1\"><b>L-Lysine 70mg</b></p>\n<p class=\"p1\"><b>L-Glutamine 40mg</b></p>\n<p class=\"p1\"><b>L-Proline 60mg</b></p>\n<p class=\"p1\"><b>L-Taurine 60mg</b></p>\n<p class=\"p1\"><b>L-Carnitine 220mg</b></p>\n<p class=\"p1\"><b>NAC 75mg</b></p>',50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.990','2026-03-01 20:19:58.721'),('cmm855grc001prmc7mu8qhxbg','KLOW 80mg','klow-80mg',NULL,'<p>50mg GHK-CU<br />\n10mg BPC-157<br />\n10mg TB-500<br />\n10mg KPV</p>',100.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.992','2026-03-01 20:19:58.721'),('cmm855gre001qrmc7wfych4x8','HCG 5000iu','hcg-5000iu',NULL,NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.995','2026-03-01 20:19:58.721'),('cmm855grh001rrmc7m10rz3x8','GHK-CU 50mg','ghk-50mg',NULL,NULL,30.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:43.998','2026-03-01 20:19:58.721'),('cmm855grv001srmc7a6zr3m9e','BPC-157 10mg','bpc-157-10mg',NULL,NULL,35.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.012','2026-03-01 20:19:58.721'),('cmm855grz001trmc7977rib0e','GLP-T 20mg','tirz-20mg',NULL,NULL,60.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.015','2026-03-01 20:19:58.721'),('cmm855gs2001urmc7hdrcrmdz','GLP-T 15mg','tirz-15mg',NULL,NULL,45.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.019','2026-03-01 20:19:58.721'),('cmm855gs8001vrmc79tkhh139','GLP-R 30mg','glpr-30mg',NULL,NULL,110.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.024','2026-03-01 20:19:58.721'),('cmm855gsb001wrmc7fo4ioe2y','GLP-R 20mg','glpr-20mg',NULL,NULL,80.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.027','2026-03-01 20:19:58.721'),('cmm855gsg001xrmc7hwjuyhpn','GLP-R 10mg','glpr-10mg',NULL,NULL,50.00,NULL,NULL,NULL,20,1,0,NULL,NULL,0,'2026-03-01 19:26:44.032','2026-03-01 20:19:58.721');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `return_items`
--

DROP TABLE IF EXISTS `return_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `return_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `returnId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderItemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_items_returnId_idx` (`returnId`),
  KEY `return_items_orderItemId_fkey` (`orderItemId`),
  CONSTRAINT `return_items_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `order_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `return_items_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `returns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `return_items`
--

LOCK TABLES `return_items` WRITE;
/*!40000 ALTER TABLE `return_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `return_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `returns` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('REQUESTED','APPROVED','DENIED','REFUNDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'REQUESTED',
  `reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `adminNotes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `returns_orderId_idx` (`orderId`),
  KEY `returns_userId_idx` (`userId`),
  KEY `returns_status_idx` (`status`),
  CONSTRAINT `returns_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `returns_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `returns`
--

LOCK TABLES `returns` WRITE;
/*!40000 ALTER TABLE `returns` DISABLE KEYS */;
/*!40000 ALTER TABLE `returns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionToken` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_sessionToken_key` (`sessionToken`),
  KEY `sessions_userId_fkey` (`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'string',
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_key` (`key`),
  KEY `settings_key_idx` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('cmm7xecyx0001rmi18euezqyx','store_name','ENOCH Labs','string'),('cmm7xeeak0002rmi1siv19o18','store_description','','string'),('cmm7xeeam0003rmi19h70bmxi','venmo_username','','string'),('cmm7xeebx0004rmi13qwfh16v','venmo_qr_url','','string'),('cmm7xeedv0005rmi1as3o1xyf','cashapp_tag','','string'),('cmm7xeef70006rmi13fr9atjm','cashapp_qr_url','','string'),('cmm7xeefv0007rmi1a9t4jabn','bitcoin_address','','string'),('cmm7xeeg80008rmi1luuetwn8','bitcoin_qr_url','','string'),('cmm7xeega0009rmi1xgpl3s9r','default_commission_rate','10','number'),('cmm7xeegb000armi1rsjc3mcn','affiliate_cookie_days','30','number'),('cmm7xeegl000brmi1bukb4y59','tax_rate','0','number'),('cmm7xeegn000crmi1jyjdm2hz','shipping_flat_rate','15','number'),('cmm83kaq90002rm87rjkvrds0','paypal_email','enochlabs@gmail.com','string'),('cmm83kar00003rm87cuq9o8t1','paypal_qr_url','','string'),('cmm83karb000drm87muec32fk','affiliate_discount_rate','','string'),('cmm83karp000erm87dsuhrgt2','parent_commission_rate','','string'),('cmm83kars000grm87cram02lk','low_stock_threshold','','string'),('cmm83karu000hrm8751awzagr','shipstation_api_key','','string'),('cmm83karv000irm8767livtpn','shipstation_carrier_ids','','string'),('cmm83karw000jrm87bwegh45q','ship_from_name','','string'),('cmm83kary000krm87tyg5ejet','ship_from_street','','string'),('cmm83karz000lrm87m9w17jbi','ship_from_city','','string'),('cmm83kas0000mrm8701unsq9g','ship_from_state','','string'),('cmm83kas2000nrm87mjgpl4us','ship_from_zip','','string'),('cmm83kas3000orm87neufx4ar','ship_from_phone','','string'),('cmm83kas5000prm87y9qo8und','enable_affiliates','false','string'),('cmm83kash000qrm87ox4tofkg','enable_guest_checkout','true','string'),('cmm83kask000rrm870ybsyxyt','email_from_name','','string'),('cmm83kasl000srm87qw528cke','email_from_address','','string'),('cmm83kasm000trm873mzmr1eo','admin_notification_email','','string'),('cmm83kasn000urm87xmwpmqlv','email_payment_confirmed','false','string'),('cmm83kaso000vrm87e9pgmeme','email_shipped','false','string'),('cmm83kasq000wrm87mjszz8g2','email_footer_text','','string'),('cmm83kass000xrm87dzt8ek23','email_provider','smtp','string'),('cmm83kast000yrm87qwvvt6wy','email_smtp_host','','string'),('cmm83kasv000zrm87u4d9snzc','email_smtp_port','','string'),('cmm83kasw0010rm87rdchkl0q','email_smtp_user','','string'),('cmm83kasy0011rm878zozpo3e','email_smtp_password','','string'),('cmm83kat00012rm87brwg29vo','ga4_measurement_id','','string'),('cmm83kat20013rm8701j197z6','facebook_pixel_id','','string'),('cmm83kat40014rm87iijmjxos','tiktok_pixel_id','','string'),('cmm83kat50015rm878zqlwiua','terms_of_service_content','<p>By purchasing from Enoch Labs, the buyer acknowledges that all products are supplied solely for lawful research use and are not intended for human or animal consumption, or for diagnostic or therapeutic procedures.</p><p>The purchaser assumes full responsibility for the use, handling, storage, and distribution of all materials, and agrees to indemnify and hold harmless Enoch Labs from any claims arising from misuse or failure to comply with applicable laws.</p>','string'),('cmm83kat70016rm876oatf3b4','privacy_policy_content','','string'),('cmm83kat90017rm87s70f0pwg','entry_popup_enabled','true','string'),('cmm83katb0018rm87dhozoiht','entry_popup_show_logo','true','string'),('cmm83katc0019rm87fabh2dm7','entry_popup_headline','RESEARCH USE ONLY','string'),('cmm83katd001arm87clzdmjfl','entry_popup_content','<p>By purchasing from Enoch Labs, the buyer acknowledges that all products are supplied solely for lawful research use and are not intended for human or animal consumption, or for diagnostic or therapeutic procedures.</p><p>The purchaser assumes full responsibility for the use, handling, storage, and distribution of all materials, and agrees to indemnify and hold harmless Enoch Labs from any claims arising from misuse or failure to comply with applicable laws.</p>','string'),('cmm83kate001brm87x3nip1fn','entry_popup_agree_text','','string'),('cmm83katg001crm87ct333so5','entry_popup_disagree_text','','string'),('cmm83kath001drm87ebkf0ehf','entry_popup_disagree_url','','string'),('cmm83kati001erm87xs6lxuz1','entry_popup_persistence','session','string'),('cmm83katj001frm87wrmdfyqt','entry_popup_overlay_opacity','73','string'),('cmm83katk001grm87yq1c1shw','entry_popup_overlay_color','#2E9AD0','string'),('cmm83katl001hrm87nbcprx2h','entry_popup_bg_color','','string'),('cmm83katm001irm87zsvd17ym','entry_popup_headline_color','#2E9AD0','string'),('cmm83kato001jrm87ksjo2xop','entry_popup_text_color','','string'),('cmm83katp001krm87tzswdfga','entry_popup_agree_bg_color','','string'),('cmm83katq001lrm870fdnwxgj','entry_popup_agree_text_color','','string'),('cmm83katr001mrm87vmtbrgbg','entry_popup_disagree_bg_color','','string'),('cmm83kats001nrm87jshulrkf','entry_popup_disagree_text_color','','string'),('cmm83yezq001srm87xygf9sz8','enable_paypal','true','string'),('cmm83yf07001vrm87ngupkhr3','enable_venmo','false','string'),('cmm83yf0l001yrm87s1i4wrxk','enable_cashapp','false','string'),('cmm83yf0s0021rm870hzg5u62','enable_bitcoin','false','string'),('cmm843s1w0000rmt33brytcmu','theme_mode','light','string'),('cmm843t5c0001rmt38w8wxs68','font_heading','Montserrat','string'),('cmm843tfi0002rmt3yel36j21','font_body','Inter','string'),('cmm843tik0003rmt38x622ko1','primary_color','#1B2D45','string'),('cmm843tk50004rmt3auledjtb','secondary_color','#5a6d85','string'),('cmm843tln0005rmt3h5o1uj9c','accent_color','#2E9AD0','string'),('cmm843tmc0006rmt32rnezyge','button_bg_color','#2E9AD0','string'),('cmm843tn00007rmt3d6sqocwf','button_text_color','#ffffff','string'),('cmm843tq60008rmt3gczu2d9w','background_color','#ffffff','string'),('cmm843ts30009rmt3axjqa23l','foreground_color','#1B2D45','string'),('cmm843tsu000armt3l30tinya','muted_color','#f0f6fa','string'),('cmm843ttu000brmt3gxj5hn66','border_color','#d4e1ec','string'),('cmm843tw2000crmt32rhxa73w','dark_background_color','#0d1a2a','string'),('cmm843txj000drmt3wzunid96','dark_foreground_color','#e0e8f0','string'),('cmm843ty6000ermt3jskmnxw5','dark_muted_color','#142338','string'),('cmm843tyt000frmt3bxcidddz','dark_border_color','#1e3652','string'),('cmm843u06000grmt35ce5htrm','border_radius','full','string'),('cmm843u12000hrmt3f1glim9h','shadow_depth','subtle','string'),('cmm844wd20040rm87fmsjnh9s','button_style','filled','string'),('cmm844wvx0041rm87kwhayr0x','product_button_bg_color','','string'),('cmm844wxt0042rm87820bl1fr','product_button_text_color','','string'),('cmm844wz70043rm87n63ue98i','product_button_style','outline','string'),('cmm844x1u0044rm870r31scu6','site_logo_url','/uploads/af8846a0-28d1-4bb2-878a-54ebb94abdf9.png','string'),('cmm844x330045rm87b48ryl30','favicon_url','','string'),('cmm844x3v0046rm876o8xlwqf','logo_height','75','string'),('cmm844x5b0047rm87i2pcvbl8','header_layout','classic','string'),('cmm844x6t0048rm87k3sizuh0','footer_layout','centered','string'),('cmm844x7d0049rm87ht6iqi5r','products_layout','compact','string'),('cmm844x95004arm87fw307hpu','product_card_style','boxed','string'),('cmm844xaw004brm871hwxyk5h','blog_layout','standard','string'),('cmm844xcd004crm87fgvb4b6o','contact_page_style','minimal','string'),('cmm844xdt004drm87hrkq6xxs','blog_card_style','standard','string'),('cmm844xei004erm87f7zmsccn','blog_show_author','true','string'),('cmm844xh3004frm87vaovht8w','blog_show_date','true','string'),('cmm844xhq004grm877hyzh676','blog_show_excerpt','true','string'),('cmm844xii004hrm87mbn6t059','enable_wishlist','true','string'),('cmm844xj6004irm87s1efwrks','enable_reviews','true','string'),('cmm844xjw004jrm87q4xjx3ss','container_width_header','','string'),('cmm844xw9004krm87lenrxyx2','container_width_homepage','1500','string'),('cmm844xyh004lrm87u3g5jvg4','container_width_subpages','1500','string'),('cmm844xyr004mrm87mqadhwbh','header_bg_color','','string'),('cmm844y01004nrm87jaulg63u','header_nav_color','','string'),('cmm844y06004orm87b43duulz','header_nav_hover_color','','string'),('cmm844y0u004prm87zarhf7e7','header_icon_color','','string'),('cmm844y1j004qrm8798vp4dqk','header_icon_hover_color','','string'),('cmm844y1m004rrm874i8aoghl','header_user_bg_color','','string'),('cmm844y34004srm87c3lbamn6','header_user_text_color','','string'),('cmm844y4c004trm87mio8qtlg','header_cart_badge_bg_color','','string'),('cmm844y4m004urm87ounsmdav','header_cart_badge_text_color','','string'),('cmm844y59004vrm87h786i6xm','footer_bg_color','','string'),('cmm844y5x004wrm87azkhjdo2','footer_heading_color','','string'),('cmm844y62004xrm87rz5499kk','footer_link_color','','string'),('cmm844y7d004yrm876bo19jwu','footer_link_hover_color','','string'),('cmm844y7e004zrm87x4z4cq3b','alert_bar_enabled','true','string'),('cmm844y8o0050rm875fg46qhd','alert_bar_content','<p>⭐ Welcome to Enoch Labs ⭐</p>','string'),('cmm844y8x0051rm87x29e4f4g','alert_bar_bg_color','#000000','string'),('cmm844y9o0052rm87i54tt34d','alert_bar_text_color','#ffffff','string'),('cmm86yxnc0011rmsln08ojmb5','header_full_width','true','string'),('cmm87b0wk001srmbcvppjmvhh','enable_printful','false','string'),('cmm87b0xd001trmbc0wt02hxn','printful_api_key','','string'),('cmm87b0xg001urmbcx6tnw22j','printful_webhook_secret','','string'),('cmm891fe1000trmaba7hyek5i','product_card_bg_color','#ffffff','string'),('cmm891fp0000urmabofqkpffw','product_card_shadow','none','string'),('cmm89u97q00l0rmab03fz9m3k','footer_show_legal','true','string'),('cmm8awvfv00oyrmabwvkquiez','storefront_passcode_enabled','true','string'),('cmm8awvir00ozrmabezohlosn','storefront_passcode_value','labratswin','string');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_labels`
--

DROP TABLE IF EXISTS `shipping_labels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_labels` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `carrier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `service` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `trackingNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `labelUrl` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `shipmentId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rate` decimal(10,2) NOT NULL,
  `weight` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `shipping_labels_orderId_key` (`orderId`),
  KEY `shipping_labels_orderId_idx` (`orderId`),
  CONSTRAINT `shipping_labels_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_labels`
--

LOCK TABLES `shipping_labels` WRITE;
/*!40000 ALTER TABLE `shipping_labels` DISABLE KEYS */;
/*!40000 ALTER TABLE `shipping_labels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscribers_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('CUSTOMER','AFFILIATE','ADMIN','SUPER_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `status` enum('ACTIVE','SUSPENDED','DELETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  KEY `users_email_idx` (`email`),
  KEY `users_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmm7xec770000rmi1w2ddnbmp','Admin','blckoutbrbell@gmail.com','2026-03-01 15:49:40.130','$2b$10$sOGedcA8O7dSg25sIak9Q.TgrCpJN5SD0qZWoI3w9HV8X6v9GnLo6',NULL,'SUPER_ADMIN','ACTIVE','2026-03-01 15:49:41.059','2026-03-01 15:49:41.059');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_tokens`
--

DROP TABLE IF EXISTS `verification_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_tokens` (
  `identifier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires` datetime(3) NOT NULL,
  UNIQUE KEY `verification_tokens_token_key` (`token`),
  UNIQUE KEY `verification_tokens_identifier_token_key` (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_tokens`
--

LOCK TABLES `verification_tokens` WRITE;
/*!40000 ALTER TABLE `verification_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `productId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `wishlist_items_userId_productId_key` (`userId`,`productId`),
  KEY `wishlist_items_userId_idx` (`userId`),
  KEY `wishlist_items_productId_fkey` (`productId`),
  CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
INSERT INTO `wishlist_items` VALUES ('cmm878j5j009prmslxcwlyakf','cmm7xec770000rmi1w2ddnbmp','cmm855gsg001xrmc7hwjuyhpn','2026-03-01 20:25:06.295'),('cmm87dbnr001yrmbcvb01i7yf','cmm7xec770000rmi1w2ddnbmp','cmm855gs8001vrmc79tkhh139','2026-03-01 20:28:49.863'),('cmm87ddlo0020rmbcny99821o','cmm7xec770000rmi1w2ddnbmp','cmm855gsb001wrmc7fo4ioe2y','2026-03-01 20:28:52.381'),('cmm8929ru001prmabgwcwqxgb','cmm7xec770000rmi1w2ddnbmp','cmm855gde000mrmc7vm41dx6a','2026-03-01 21:16:13.434');
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 16:50:59
