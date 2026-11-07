-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: java_booking_nail
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Current Database: `java_booking_nail`
--

/*!40000 DROP DATABASE IF EXISTS `java_booking_nail`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `java_booking_nail` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `java_booking_nail`;

--
-- Table structure for table `appointment_services`
--

DROP TABLE IF EXISTS `appointment_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `service_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_services`
--

LOCK TABLES `appointment_services` WRITE;
/*!40000 ALTER TABLE `appointment_services` DISABLE KEYS */;
INSERT INTO `appointment_services` VALUES (1,1,150000.00,1),(2,1,80000.00,2),(3,2,150000.00,1),(4,3,150000.00,1),(5,4,1800000.00,25),(6,5,650000.00,18),(7,6,1800000.00,8),(8,7,300000.00,3),(9,8,180000.00,6),(10,9,150000.00,1),(11,10,120000.00,5),(12,11,150000.00,1),(13,12,1800000.00,25),(14,13,850000.00,20),(15,14,150000.00,1),(16,15,150000.00,1),(17,16,150000.00,1),(18,17,750000.00,23),(19,18,150000.00,1),(20,19,80000.00,2),(21,20,80000.00,2),(22,21,150000.00,1),(23,22,150000.00,1),(24,23,150000.00,1),(25,24,150000.00,1),(26,25,150000.00,1),(27,25,80000.00,2),(28,25,300000.00,3),(29,25,100000.00,4),(30,25,120000.00,5),(31,25,180000.00,6),(32,25,350000.00,7),(33,25,1800000.00,8),(34,25,600000.00,9),(35,25,2500000.00,10),(36,25,900000.00,11),(37,25,350000.00,12),(38,26,150000.00,1),(39,26,80000.00,2),(40,26,300000.00,3),(41,26,100000.00,4),(42,26,120000.00,5),(43,26,180000.00,6),(44,26,350000.00,7),(56,39,150000.00,1),(57,39,80000.00,2),(58,39,300000.00,3),(59,39,100000.00,4),(60,39,120000.00,5),(61,39,180000.00,6),(62,39,350000.00,7),(63,39,1800000.00,8),(83,59,150000.00,1),(84,60,150000.00,1),(85,61,150000.00,1),(86,62,150000.00,1),(87,63,150000.00,1),(88,63,80000.00,2),(89,63,300000.00,3),(90,63,100000.00,4),(91,63,120000.00,5),(92,64,150000.00,1),(93,65,150000.00,1),(94,66,150000.00,1),(95,67,150000.00,1),(96,68,150000.00,1),(97,69,150000.00,1),(98,70,100000.00,31),(99,71,150000.00,1),(100,72,850000.00,20);
/*!40000 ALTER TABLE `appointment_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_status_history`
--

DROP TABLE IF EXISTS `appointment_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_status_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint DEFAULT NULL,
  `changed_by` bigint DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `from_status` varchar(255) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `to_status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_status_history`
--

LOCK TABLES `appointment_status_history` WRITE;
/*!40000 ALTER TABLE `appointment_status_history` DISABLE KEYS */;
INSERT INTO `appointment_status_history` VALUES (1,1,1,'2026-10-16 21:41:42.919962',NULL,'Khách đặt lịch qua website','PENDING'),(2,1,2,'2026-10-16 22:41:42.922480','PENDING','Salon đã gọi điện xác nhận lịch','CONFIRMED'),(3,2,1,'2026-10-15 20:41:42.932511',NULL,'Đặt lịch làm móng','PENDING'),(4,2,2,'2026-10-15 23:41:42.936037','PENDING','Hoàn thành và đã thanh toán đầy đủ','COMPLETED'),(5,3,4,'2026-10-30 12:24:42.978104',NULL,'','PENDING'),(6,4,4,'2026-10-30 15:20:55.796724',NULL,'','PENDING'),(7,5,4,'2026-10-30 15:29:57.016800',NULL,'','PENDING'),(8,6,4,'2026-10-31 12:53:15.568845',NULL,'','PENDING'),(9,3,NULL,'2026-10-31 12:56:39.744408','PENDING','','CONFIRMED'),(10,3,NULL,'2026-10-31 12:56:39.789401','CONFIRMED','','CONFIRMED'),(11,7,4,'2026-10-31 15:07:33.452343',NULL,'','PENDING'),(12,8,4,'2026-10-31 15:08:31.702037',NULL,'','PENDING'),(13,9,4,'2026-10-31 15:22:09.307201',NULL,'','PENDING'),(14,10,4,'2026-10-31 15:28:32.599653',NULL,'','PENDING'),(15,11,4,'2026-10-31 15:36:39.514308',NULL,'','PENDING'),(16,12,4,'2026-10-31 15:38:02.791206',NULL,'','PENDING'),(17,13,4,'2026-10-31 15:43:42.537096',NULL,'','PENDING'),(18,12,NULL,'2026-10-31 15:46:15.316772','PENDING',NULL,'CONFIRMED'),(19,12,NULL,'2026-10-31 15:46:25.920252','CONFIRMED',NULL,'PENDING'),(20,13,NULL,'2026-10-31 15:50:48.104686','PENDING','','CONFIRMED'),(21,14,4,'2026-10-31 15:57:22.140293',NULL,'','PENDING'),(22,15,4,'2026-10-31 15:57:43.822894',NULL,'','PENDING'),(23,10,NULL,'2026-10-31 15:58:15.042182','PENDING','huy','CANCELLED'),(24,15,NULL,'2026-10-31 15:58:23.584918','PENDING','','CONFIRMED'),(25,14,NULL,'2026-10-31 15:58:27.920952','PENDING','','CONFIRMED'),(26,8,NULL,'2026-10-31 16:03:34.846100','PENDING','','CONFIRMED'),(27,16,4,'2026-11-02 22:54:40.777095',NULL,'','PENDING'),(28,17,4,'2026-11-02 22:55:56.696564',NULL,'','PENDING'),(29,8,NULL,'2026-11-02 23:14:53.686110','CONFIRMED','','CHECKED_IN'),(30,8,NULL,'2026-11-02 23:15:23.830226','CHECKED_IN','','IN_SERVICE'),(31,8,NULL,'2026-11-02 23:15:24.771562','IN_SERVICE','','COMPLETED'),(32,16,NULL,'2026-11-02 23:16:15.333848','PENDING','a','CANCELLED'),(33,6,NULL,'2026-11-02 23:16:17.758636','PENDING','a','CANCELLED'),(34,9,NULL,'2026-11-02 23:16:20.449507','PENDING','a','CANCELLED'),(35,11,NULL,'2026-11-02 23:16:22.825062','PENDING','a','CANCELLED'),(36,12,NULL,'2026-11-02 23:16:24.624388','PENDING','a','CANCELLED'),(37,17,NULL,'2026-11-02 23:16:27.224592','PENDING','a','CANCELLED'),(38,3,NULL,'2026-11-03 10:30:05.782949','CONFIRMED','','CHECKED_IN'),(39,5,NULL,'2026-11-03 10:30:11.225962','PENDING','','CONFIRMED'),(40,5,NULL,'2026-11-03 10:30:14.164209','CONFIRMED','','CONFIRMED'),(41,15,NULL,'2026-11-03 10:30:30.028847','CONFIRMED','','CHECKED_IN'),(42,14,NULL,'2026-11-03 10:30:31.752880','CONFIRMED','','CHECKED_IN'),(43,7,NULL,'2026-11-03 10:30:33.072134','PENDING','','CONFIRMED'),(44,4,NULL,'2026-11-03 10:30:34.480419','PENDING','','CONFIRMED'),(45,1,NULL,'2026-11-03 10:30:35.048519','CONFIRMED','','CHECKED_IN'),(46,1,NULL,'2026-11-03 10:30:36.046552','CHECKED_IN','','IN_SERVICE'),(47,1,NULL,'2026-11-03 10:30:36.755644','IN_SERVICE','','COMPLETED'),(48,3,NULL,'2026-11-03 10:30:42.380734','CHECKED_IN','','IN_SERVICE'),(49,3,NULL,'2026-11-03 10:30:44.279456','IN_SERVICE','','COMPLETED'),(50,5,NULL,'2026-11-03 10:30:44.689237','CONFIRMED','','CHECKED_IN'),(51,5,NULL,'2026-11-03 10:30:45.085443','CHECKED_IN','','IN_SERVICE'),(52,5,NULL,'2026-11-03 10:30:45.853981','IN_SERVICE','','COMPLETED'),(53,4,NULL,'2026-11-03 10:30:48.210432','CONFIRMED','','CHECKED_IN'),(54,4,NULL,'2026-11-03 10:30:48.828490','CHECKED_IN','','IN_SERVICE'),(55,4,NULL,'2026-11-03 10:30:49.310597','IN_SERVICE','','COMPLETED'),(56,7,NULL,'2026-11-03 10:30:50.039588','CONFIRMED','','CHECKED_IN'),(57,7,NULL,'2026-11-03 10:30:50.429966','CHECKED_IN','','IN_SERVICE'),(58,7,NULL,'2026-11-03 10:30:50.886430','IN_SERVICE','','COMPLETED'),(59,14,NULL,'2026-11-03 10:30:51.376239','CHECKED_IN','','IN_SERVICE'),(60,14,NULL,'2026-11-03 10:30:51.757309','IN_SERVICE','','COMPLETED'),(61,15,NULL,'2026-11-03 10:30:54.376255','CHECKED_IN','','IN_SERVICE'),(62,15,NULL,'2026-11-03 10:30:54.693260','IN_SERVICE','','COMPLETED'),(63,13,NULL,'2026-11-03 10:42:19.720104','CONFIRMED','','CHECKED_IN'),(64,13,NULL,'2026-11-03 10:42:23.253179','CHECKED_IN','','IN_SERVICE'),(65,13,NULL,'2026-11-03 10:42:24.390607','IN_SERVICE','','COMPLETED'),(66,18,4,'2026-11-03 10:44:01.118388',NULL,'','PENDING'),(67,18,NULL,'2026-11-03 10:49:24.125842','PENDING','','CONFIRMED'),(68,18,NULL,'2026-11-03 10:49:32.882753','CONFIRMED','','CHECKED_IN'),(69,18,NULL,'2026-11-03 10:49:35.366431','CHECKED_IN','','IN_SERVICE'),(70,18,NULL,'2026-11-03 10:49:36.283305','IN_SERVICE','','COMPLETED'),(71,19,4,'2026-11-03 10:58:36.620744',NULL,'','PENDING'),(72,19,NULL,'2026-11-03 11:01:02.160443','PENDING','','CONFIRMED'),(73,19,NULL,'2026-11-03 11:11:24.180981','CONFIRMED','','CHECKED_IN'),(74,19,NULL,'2026-11-03 11:11:31.189250','CHECKED_IN','','IN_SERVICE'),(75,19,NULL,'2026-11-03 11:11:35.889940','IN_SERVICE','','COMPLETED'),(76,20,4,'2026-11-03 11:20:02.749561',NULL,'','PENDING'),(77,20,NULL,'2026-11-03 11:20:18.783519','PENDING','','CONFIRMED'),(78,20,NULL,'2026-11-03 11:20:28.219049','CONFIRMED','','CHECKED_IN'),(79,20,NULL,'2026-11-03 11:20:36.033607','CHECKED_IN','','IN_SERVICE'),(80,20,NULL,'2026-11-03 11:20:41.970280','IN_SERVICE','','COMPLETED'),(81,21,4,'2026-11-03 21:42:38.277648',NULL,'','PENDING'),(82,22,4,'2026-11-03 21:50:53.528343',NULL,'','PENDING'),(83,23,4,'2026-11-03 21:54:18.494118',NULL,'','PENDING'),(84,24,4,'2026-11-03 22:17:13.606790',NULL,'','PENDING'),(85,25,4,'2026-11-04 09:29:29.537654',NULL,'','PENDING'),(86,25,NULL,'2026-11-04 09:31:10.452645','PENDING','','CONFIRMED'),(87,25,NULL,'2026-11-04 09:31:14.923846','CONFIRMED','','CHECKED_IN'),(88,25,NULL,'2026-11-04 10:09:38.746131','CHECKED_IN','','IN_SERVICE'),(89,25,NULL,'2026-11-04 10:09:39.734701','IN_SERVICE','','COMPLETED'),(90,26,4,'2026-11-04 10:11:13.033660',NULL,'','PENDING'),(91,23,NULL,'2026-11-04 10:12:26.900570','PENDING','thich','CANCELLED'),(92,21,NULL,'2026-11-04 10:12:37.467146','PENDING','a','CANCELLED'),(93,22,NULL,'2026-11-04 10:12:43.333683','PENDING','a','CANCELLED'),(94,24,NULL,'2026-11-04 10:12:47.116133','PENDING','a','CANCELLED'),(95,26,NULL,'2026-11-04 10:12:50.316577','PENDING','a','CANCELLED'),(117,39,4,'2026-11-05 13:09:03.269072',NULL,'','PENDING'),(118,39,NULL,'2026-11-05 13:09:26.903565','PENDING','','CONFIRMED'),(165,59,4,'2026-11-05 15:40:57.456109',NULL,'Đặt lịch hẹn mới','PENDING'),(166,60,4,'2026-11-05 15:40:57.525873',NULL,'Đặt lịch hẹn mới','PENDING'),(167,61,4,'2026-11-05 15:40:57.565856',NULL,'Đặt lịch hẹn mới','PENDING'),(168,59,NULL,'2026-11-05 15:40:57.588003','PENDING','Cập nhật trạng thái sang CONFIRMED','CONFIRMED'),(169,59,NULL,'2026-11-05 15:40:57.609222','CONFIRMED','Cập nhật trạng thái sang CHECKED_IN','CHECKED_IN'),(170,59,NULL,'2026-11-05 15:40:57.633336','CHECKED_IN','Cập nhật trạng thái sang IN_SERVICE','IN_SERVICE'),(171,59,NULL,'2026-11-05 15:40:57.660192','IN_SERVICE','Cập nhật trạng thái sang COMPLETED','COMPLETED'),(172,62,4,'2026-11-05 15:40:58.002616',NULL,'Đặt lịch hẹn mới','PENDING'),(173,60,NULL,'2026-11-05 15:40:58.193372','PENDING','Cập nhật trạng thái sang CANCELLED','CANCELLED'),(174,61,NULL,'2026-11-05 15:40:58.222583','PENDING','Cập nhật trạng thái sang CANCELLED','CANCELLED'),(175,62,NULL,'2026-11-05 15:40:58.249349','PENDING','Cập nhật trạng thái sang CANCELLED','CANCELLED'),(176,63,19,'2026-11-05 21:35:50.037699',NULL,'Đặt lịch hẹn mới','PENDING'),(177,63,NULL,'2026-11-05 21:36:23.795737','PENDING','','CONFIRMED'),(178,63,NULL,'2026-11-05 21:54:44.667401','CONFIRMED','','CHECKED_IN'),(179,63,NULL,'2026-11-05 21:54:45.809822','CHECKED_IN','','IN_SERVICE'),(180,63,NULL,'2026-11-05 21:54:46.912538','IN_SERVICE','','COMPLETED'),(181,64,19,'2026-11-05 21:56:40.872620',NULL,'Đặt lịch hẹn mới','PENDING'),(182,64,NULL,'2026-11-05 21:57:12.055846','PENDING','','CONFIRMED'),(183,64,NULL,'2026-11-05 22:00:28.168036','CONFIRMED','Chuyển vào danh sách chờ','CANCELLED'),(184,39,NULL,'2026-11-05 22:01:06.505216','CONFIRMED','x','CANCELLED'),(185,65,19,'2026-11-05 22:13:05.249705',NULL,'Đặt lịch hẹn mới','PENDING'),(186,65,NULL,'2026-11-05 22:13:47.933706','PENDING','','CONFIRMED'),(187,65,19,'2026-11-05 22:14:22.969017','CONFIRMED','Khách hàng đổi lịch hẹn sang khung giờ mới','PENDING'),(188,65,19,'2026-11-05 22:20:49.422595','PENDING','k','CANCELLED'),(189,66,19,'2026-11-05 22:21:14.610720',NULL,'Đặt lịch hẹn mới','PENDING'),(190,67,17,'2026-11-05 22:46:26.568279',NULL,'Đặt lịch hẹn mới','PENDING'),(191,68,19,'2026-11-06 08:28:11.407176',NULL,'Đặt lịch hẹn mới','PENDING'),(192,69,19,'2026-11-06 08:48:12.825130',NULL,'Đặt lịch hẹn mới','PENDING'),(193,66,NULL,'2026-11-06 08:48:25.027336','PENDING','','CONFIRMED'),(194,69,NULL,'2026-11-06 08:48:53.690813','PENDING','','CONFIRMED'),(195,68,NULL,'2026-11-06 08:49:25.138917','PENDING','','CONFIRMED'),(196,70,19,'2026-11-06 09:10:55.674531',NULL,'Đặt lịch hẹn mới','PENDING'),(197,71,19,'2026-11-06 09:24:44.478765',NULL,'Đặt lịch hẹn mới','PENDING'),(198,72,19,'2026-11-06 09:30:25.114268',NULL,'Đặt lịch hẹn mới','PENDING');
/*!40000 ALTER TABLE `appointment_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_date` date DEFAULT NULL,
  `booking_code` varchar(255) DEFAULT NULL,
  `coupon_id` bigint DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `discount_amount` decimal(38,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `staff_id` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `total_duration` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `subtotal` decimal(38,2) DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `admin_note` varchar(255) DEFAULT NULL,
  `amount_paid` decimal(38,2) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (1,'2026-10-16','APPT-20261016-001',NULL,1,0.00,'Khách muốn sơn gel màu pastel nhẹ nhàng.',2,'COMPLETED',230000.00,60,'2026-10-16 23:41:42.902396',230000.00,'10:30:00','09:30:00','2026-11-03 11:19:04.930560',NULL,230000.00,'2026-11-03 11:19:04.924561','transfer','PAID',NULL,NULL,NULL),(2,'2026-10-15','APPT-20261015-002',NULL,1,0.00,'Khách rất hài lòng với màu sơn mới.',2,'COMPLETED',150000.00,60,'2026-10-16 23:41:42.924996',150000.00,'15:00:00','14:00:00','2026-11-03 11:19:01.775284',NULL,150000.00,'2026-11-03 11:19:01.771283','transfer','PAID',NULL,NULL,NULL),(3,'2026-09-24','VELA-882902',NULL,4,NULL,'',12,'COMPLETED',150000.00,45,'2026-10-30 12:24:42.970088',150000.00,'16:45:00','16:00:00','2026-11-03 11:18:43.755358',NULL,150000.00,'2026-11-03 11:18:43.750254','transfer','PAID',NULL,NULL,NULL),(4,'2026-10-16','VELA-455710',NULL,4,NULL,'',13,'COMPLETED',1800000.00,150,'2026-10-30 15:20:55.763801',1800000.00,'12:30:00','10:00:00','2026-11-03 11:19:07.154746',NULL,1800000.00,'2026-11-03 11:19:07.150605','transfer','PAID',NULL,NULL,NULL),(5,'2026-09-25','VELA-996994',NULL,4,NULL,'',12,'COMPLETED',650000.00,60,'2026-10-30 15:29:57.010800',650000.00,'19:00:00','18:00:00','2026-11-03 11:18:57.600600',NULL,650000.00,'2026-11-03 11:18:57.596639','transfer','PAID',NULL,NULL,NULL),(6,'2026-11-06','VELA-995451',NULL,4,NULL,'',15,'CANCELLED',1800000.00,90,'2026-10-31 12:53:15.518831',1800000.00,'17:30:00','16:00:00','2026-11-02 23:16:17.766634',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'2026-10-23','VELA-053426',NULL,4,NULL,'',13,'COMPLETED',300000.00,90,'2026-10-31 15:07:33.452343',300000.00,'16:00:00','14:30:00','2026-11-03 11:19:09.313788',NULL,300000.00,'2026-11-03 11:19:09.307781','transfer','PAID',NULL,NULL,NULL),(8,'2026-11-13','VELA-111691',NULL,4,NULL,'',15,'COMPLETED',180000.00,45,'2026-10-31 15:08:31.702037',180000.00,'15:15:00','14:30:00','2026-11-03 11:11:58.484436','',180000.00,'2026-11-03 11:11:57.534301','cash','PAID',NULL,NULL,NULL),(9,'2026-11-06','VELA-929286',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-10-31 15:22:09.307201',150000.00,'11:15:00','10:30:00','2026-11-02 23:16:20.456507',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'2026-09-25','VELA-312583',NULL,4,NULL,'',9,'CANCELLED',120000.00,40,'2026-10-31 15:28:32.589258',120000.00,'15:10:00','14:30:00','2026-10-31 15:58:15.057461',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'2026-11-06','VELA-799490',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-10-31 15:36:39.508400',150000.00,'10:45:00','10:00:00','2026-11-02 23:16:22.831305',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,'2026-11-06','VELA-882771',NULL,4,NULL,'',9,'CANCELLED',1800000.00,150,'2026-10-31 15:38:02.780038',1800000.00,'14:30:00','12:00:00','2026-11-02 23:16:24.631436',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(13,'2026-11-03','VELA-222524',NULL,4,NULL,'',9,'COMPLETED',850000.00,75,'2026-10-31 15:43:42.537096',850000.00,'15:15:00','14:00:00','2026-11-03 11:19:25.688241',NULL,850000.00,'2026-11-03 11:19:25.684055','transfer','PAID',NULL,NULL,NULL),(14,'2026-11-01','VELA-042118',NULL,4,NULL,'',15,'COMPLETED',150000.00,45,'2026-10-31 15:57:22.128293',150000.00,'09:45:00','09:00:00','2026-11-03 11:19:12.014712',NULL,150000.00,'2026-11-03 11:19:12.010710','transfer','PAID',NULL,NULL,NULL),(15,'2026-11-01','VELA-063806',NULL,4,NULL,'',15,'COMPLETED',150000.00,45,'2026-10-31 15:57:43.817770',150000.00,'09:45:00','09:00:00','2026-11-03 11:19:14.144815',NULL,150000.00,'2026-11-03 11:19:14.139303','transfer','PAID',NULL,NULL,NULL),(16,'2026-11-08','VELA-880702',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-11-02 22:54:40.741951',150000.00,'09:45:00','09:00:00','2026-11-02 23:16:15.342189',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'2026-11-04','VELA-956672',NULL,4,NULL,'',9,'CANCELLED',750000.00,90,'2026-11-02 22:55:56.691566',750000.00,'10:30:00','09:00:00','2026-11-02 23:16:27.230854',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'2026-11-04','VELA-441087',NULL,4,NULL,'',14,'COMPLETED',150000.00,45,'2026-11-03 10:44:01.111081',150000.00,'12:15:00','11:30:00','2026-11-03 10:49:41.525832','',150000.00,'2026-11-03 10:49:39.780773','cash','PAID',NULL,NULL,NULL),(19,'2026-11-03','VELA-316595',NULL,4,NULL,'',9,'COMPLETED',80000.00,30,'2026-11-03 10:58:36.614744',80000.00,'12:00:00','11:30:00','2026-11-03 11:19:16.480488','',80000.00,'2026-11-03 11:19:16.475178','transfer','PAID',NULL,NULL,NULL),(20,'2026-11-09','VELA-602728',NULL,4,NULL,'',9,'COMPLETED',80000.00,30,'2026-11-03 11:20:02.743276',80000.00,'19:00:00','18:30:00','2026-11-03 11:25:21.682909',NULL,80000.00,'2026-11-03 11:25:21.676905','transfer','PAID',NULL,NULL,NULL),(21,'2026-11-07','VELA-958209',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-11-03 21:42:38.247826',150000.00,'09:45:00','09:00:00','2026-11-04 10:12:37.483168',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'2026-11-09','VELA-453508',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-11-03 21:50:53.523340',150000.00,'09:45:00','09:00:00','2026-11-04 10:12:43.340162',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'2026-11-04','VELA-658473',NULL,4,NULL,'',9,'CANCELLED',150000.00,45,'2026-11-03 21:54:18.489118',150000.00,'09:45:00','09:00:00','2026-11-04 10:12:26.917614',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'2026-11-09','VELA-033583',NULL,4,15000.00,'',9,'CANCELLED',135000.00,45,'2026-11-03 22:17:13.599436',150000.00,'09:45:00','09:00:00','2026-11-04 10:12:47.122494',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'2026-11-05','VELA-369434',3,4,30000.00,'',9,'COMPLETED',7400000.00,775,'2026-11-04 09:29:29.471539',7430000.00,'21:55:00','09:00:00','2026-11-04 10:09:41.101543',NULL,7400000.00,'2026-11-04 10:09:41.101543','transfer','PAID',NULL,NULL,NULL),(26,'2026-11-09','VELA-872992',NULL,4,0.00,'',9,'CANCELLED',1280000.00,340,'2026-11-04 10:11:13.017329',1280000.00,'15:40:00','10:00:00','2026-11-04 10:12:50.333976',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(39,'2026-11-06','VELA-943212',3,4,30000.00,'',9,'CANCELLED',3050000.00,430,'2026-11-05 13:09:03.259071',3080000.00,'16:10:00','09:00:00','2026-11-05 22:01:06.523686',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(59,'2026-12-25','VELA-57451',NULL,4,0.00,NULL,9,'COMPLETED',150000.00,45,'2026-11-05 15:40:57.452354',150000.00,'10:45:00','10:00:00','2026-11-05 15:40:57.669294',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(60,'2026-12-25','VELA-57522',NULL,4,0.00,NULL,9,'CANCELLED',150000.00,45,'2026-11-05 15:40:57.522653',150000.00,'11:45:00','11:00:00','2026-11-05 15:40:58.204110',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(61,'2026-12-25','VELA-57561',1,4,20000.00,NULL,9,'CANCELLED',130000.00,45,'2026-11-05 15:40:57.561857',150000.00,'13:45:00','13:00:00','2026-11-05 15:40:58.234360',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(62,'2026-12-29','VELA-57998',NULL,4,0.00,NULL,9,'CANCELLED',150000.00,45,'2026-11-05 15:40:57.998876',150000.00,'15:45:00','15:00:00','2026-11-05 15:40:58.260512',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(63,'2026-12-01','VELA-349970',NULL,19,0.00,'',9,'COMPLETED',750000.00,235,'2026-11-05 21:35:50.029699',750000.00,'10:55:00','07:00:00','2026-11-05 21:54:50.520954',NULL,750000.00,'2026-11-05 21:54:50.511714','cash','PAID','giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(64,'2026-11-06','VELA-600841',3,19,30000.00,'',9,'CANCELLED',120000.00,45,'2026-11-05 21:56:40.872620',150000.00,'07:45:00','07:00:00','2026-11-05 22:00:28.179041',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(65,'2026-11-05','VELA-585225',NULL,19,0.00,'Chuyển từ đơn VELA-600841',9,'CANCELLED',150000.00,45,'2026-11-05 22:13:05.249705',150000.00,'07:45:00','07:00:00','2026-11-05 22:20:49.436694',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(66,'2026-11-06','VELA-074537',NULL,19,0.00,'',9,'CONFIRMED',150000.00,45,'2026-11-05 22:21:14.580872',150000.00,'07:45:00','07:00:00','2026-11-06 08:48:25.047630',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(67,'2026-11-06','VELA-586489',1,17,20000.00,'',12,'PENDING',130000.00,45,'2026-11-05 22:46:26.545829',150000.00,'07:45:00','07:00:00','2026-11-05 22:46:26.545829',NULL,NULL,NULL,NULL,NULL,'admin@vela.com','Quản trị VELA','0901234560'),(68,'2026-11-06','VELA-491214',NULL,19,0.00,'',9,'CONFIRMED',150000.00,45,'2026-11-06 08:28:11.347636',150000.00,'09:45:00','09:00:00','2026-11-06 08:49:25.155084',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(69,'2026-11-06','VELA-692713',3,19,30000.00,'',9,'CONFIRMED',120000.00,45,'2026-11-06 08:48:12.805034',150000.00,'10:45:00','10:00:00','2026-11-06 08:48:53.710110',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(70,'2026-11-06','VELA-055523',NULL,19,0.00,'',12,'PENDING',100000.00,60,'2026-11-06 09:10:55.661433',100000.00,'10:30:00','09:30:00','2026-11-06 09:10:55.661433',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(71,'2026-11-06','VELA-884396',3,19,30000.00,'',13,'PENDING',120000.00,45,'2026-11-06 09:24:44.471513',150000.00,'10:45:00','10:00:00','2026-11-06 09:24:44.471513',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133'),(72,'2026-11-06','VELA-225025',3,19,30000.00,'',9,'PENDING',820000.00,75,'2026-11-06 09:30:25.107044',850000.00,'12:15:00','11:00:00','2026-11-06 09:30:25.107044',NULL,NULL,NULL,NULL,NULL,'giahuy@gmail.com','Phạm Hồng Gia Huy','0986024133');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments_services`
--

DROP TABLE IF EXISTS `appointments_services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments_services` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint DEFAULT NULL,
  `price` decimal(38,2) DEFAULT NULL,
  `service_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments_services`
--

LOCK TABLES `appointments_services` WRITE;
/*!40000 ALTER TABLE `appointments_services` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointments_services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` text,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dịch vụ làm đẹp và chăm sóc móng.','Làm móngs','ACTIVE','SERVICE'),(2,'Dịch vụ wax và tẩy lông.','Wax lông','ACTIVE','SERVICE'),(3,'Dịch vụ cắt, tạo kiểu và chăm sóc tóc.','Làm tóc','ACTIVE','SERVICE'),(4,'Các sản phẩm chăm sóc và làm đẹp móng.','Sản phẩm mónghgh','ACTIVE','SERVICE'),(5,'Thiết kế dáng mi phù hợp với đôi mắt, nhẹ nhàng và tự nhiên.','Nối mi & Chân mày','ACTIVE','SERVICE'),(6,'Liệu trình chăm sóc và nuôi dưỡng làn da chuyên sâu.','Chăm sóc da','ACTIVE','SERVICE'),(7,'Không gian thư giãn với các liệu trình gội đầu và chăm sóc da đầu.','Gội đầu & Spa','ACTIVE','SERVICE'),(8,'Dịch vụ làm đẹp và chăm sóc móng.','Làm nail','ACTIVE','SERVICE'),(9,'Test1','Test1','ACTIVE','SERVICE');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) DEFAULT NULL,
  `code` varchar(255) NOT NULL,
  `discount_type` varchar(255) DEFAULT NULL,
  `discount_value` decimal(38,2) DEFAULT NULL,
  `end_at` datetime(6) DEFAULT NULL,
  `max_discount` decimal(38,2) DEFAULT NULL,
  `min_order_value` decimal(38,2) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `start_at` datetime(6) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeplt0kkm9yf2of2lnx6c1oy9b` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,_binary '','WELCOME20K','FIXED',20000.00,'2027-10-30 23:59:59.000000',20000.00,100000.00,'Giảm 20.000đ cho đơn hàng mới từ 100.000đ','2026-10-30 00:00:00.000000',NULL,NULL),(2,_binary '','SUMMER50K','FIXED',50000.00,'2027-10-30 10:06:00.101416',50000.00,200000.00,'Khuyến mãi mùa hè giảm 50.000đ cho đơn từ 200.000đ','2026-10-30 10:06:00.101416',50,0),(3,_binary '','GIAM30K','FIXED',30000.00,'2027-10-30 10:06:00.101416',30000.00,150000.00,'Giảm 30.000đ cho hoá đơn từ 150.000đ','2026-10-30 10:06:00.101416',200,5);
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lookbook_entries`
--

DROP TABLE IF EXISTS `lookbook_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lookbook_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_slug` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) NOT NULL,
  `service_id` bigint DEFAULT NULL,
  `staff_id` bigint DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lookbook_entries`
--

LOCK TABLES `lookbook_entries` WRITE;
/*!40000 ALTER TABLE `lookbook_entries` DISABLE KEYS */;
INSERT INTO `lookbook_entries` VALUES (1,'nails','2026-10-31 23:31:35.139552','Móng dáng hạnh nhân thanh lịch với lớp viền nhũ vàng 24K sang trọng.','/images/photo-1632345031435-8727f6897d53.jpg',1,1,'Sơn gel thạch hồng viền ánh kim'),(2,'nails','2026-10-29 23:31:35.143065','Kỹ thuật tạo vệt sáng galaxy hút mắt, bắt sáng đa góc nhìn.','/images/photo-1610992015836-7c249d75782d.jpg',2,2,'Ombre mắt mèo ánh trăng 9D'),(3,'lashes','2026-10-27 23:31:35.145063','Sợi mi lụa tơ mỏng nhẹ, xen kẽ tạo chiều sâu cho đôi mắt cuốn hút.','/images/photo-1583843364289-0d1b2978874c.jpg',3,3,'Nối mi thiết kế Katun tự nhiên'),(4,'spa','2026-10-24 23:31:35.147430','Kết hợp thảo mộc thiên nhiên và massage bấm huyệt cổ vai gáy.','/images/photo-1560066984-138dadb4c035.jpg',4,4,'Liệu trình Gội đầu dưỡng sinh & Thư giãn'),(5,'nails','2026-10-22 23:31:35.149431','Phục hồi biểu bì móng hư tổn với tinh chất keratin và dầu dưỡng organic.','/images/photo-1554519934-e32b1629d9ee.jpg',1,2,'Chăm sóc phục hồi móng yếu & Cắt da chuẩn Nga');
/*!40000 ALTER TABLE `lookbook_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nail_service`
--

DROP TABLE IF EXISTS `nail_service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nail_service` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKn9qkfkfe3raasvu0nvxqig0e` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nail_service`
--

LOCK TABLES `nail_service` WRITE;
/*!40000 ALTER TABLE `nail_service` DISABLE KEYS */;
INSERT INTO `nail_service` VALUES (1,2,'Sơn gel với màu sắc theo lựa chọn của khách hàng.',45,'/images/photo-1619520167112-c8cb9961e30a.jpg','Sơn gel híss',150000,'ACTIVE',NULL),(2,1,'Làm sạch và sơn móng tay bằng sơn thường.',30,'/images/photo-1610992015762-45dca7fa3a85.jpg','Sơn thường',80000,'ACTIVE',NULL),(3,1,'Nối dài và tạo hình móng bằng gel.',90,'/images/photo-1690749138086-7422f71dc159.jpg','Đắp móng gel',300000,'ACTIVE',NULL),(4,1,'Cắt, giũa móng và chăm sóc vùng da quanh móng tay.',30,'/images/photo-1519014816548-bf5fe059798b.jpg','Chăm sóc móng tay',100000,'ACTIVE',NULL),(5,1,'Vệ sinh, cắt và chăm sóc móng chân.',40,'/images/photo-1604902396830-aca29e19b067.jpg','Chăm sóc móng chân',120000,'ACTIVE',NULL),(6,1,'Vẽ họa tiết thủ công và chi tiết theo phong cách riêng.',45,'/images/photo-1587729927069-ef3b7a5ab9b4.jpg','Vẽ móng nghệ thuật',180000,'ACTIVE',NULL),(7,3,'Đường cắt được tạo theo gương mặt và nếp tóc của bạn.',60,'/images/photo-1779153862705-5969578ac606.jpg','Cắt tóc thiết kế',350000,'ACTIVE',NULL),(8,3,'Sắc màu chuyển nhẹ, hài hòa với nền tóc tự nhiên.',90,'/images/photo-1619520167112-c8cb9961e30a.jpg','Nhuộm Balayage VELA',1800000,'ACTIVE',NULL),(9,3,'Chăm sóc biểu bì tóc để có độ bóng và mềm mại.',45,'/images/photo-1521590832167-7bcbfaa6381f.jpg','Phục hồi tóc bóng mượt',600000,'ACTIVE',NULL),(10,3,'Nâng tông và điều chỉnh sắc độ với chăm sóc phục hồi.',180,'/images/photo-1779399147716-a3ca1e519406.jpg','Nhuộm tóc sáng VELA',2500000,'ACTIVE',NULL),(11,3,'Làm đều phần chân tóc với màu tóc hiện tại.',75,'/images/photo-1560869713-7d0a29430803.jpg','Nhuộm chân tóc',900000,'ACTIVE',NULL),(12,3,'Mái tóc có độ phồng tự nhiên và chuyển động mềm mại.',45,'/images/photo-1580618672591-eb180b1a973f.jpg','Sấy tạo kiểu',350000,'ACTIVE',NULL),(13,3,'Giảm xơ rối, giữ độ mềm mại tự nhiên cho tóc.',150,'/images/photo-1600948836101-f9ffda59d250.jpg','Làm mượt tóc Keratin',2200000,'ACTIVE',NULL),(14,5,'Từng sợi mi nhẹ nhàng, tôn nét thanh thoát tự nhiên.',60,'/images/photo-1589710751893-f9a6770ad71b.jpg','Nối mi tự nhiên Classic',350000,'ACTIVE',NULL),(15,5,'Dáng mi được thiết kế tạo độ dày và cuốn hút.',90,'/images/photo-1735151226446-1d364b4adc2f.jpg','Nối mi Volume dày',550000,'ACTIVE',NULL),(16,5,'Làm cong mi tự nhiên và dưỡng collagen bóng mượt.',45,'/images/photo-1639629509821-c54cdd984227.jpg','Uốn và nhuộm mi Collagen',300000,'ACTIVE',NULL),(17,5,'Tạo dáng chân mày cân đối hài hòa với gương mặt.',30,'/images/photo-1548902378-2ec44c906391.jpg','Định hình và nhuộm chân mày',250000,'ACTIVE',NULL),(18,6,'Hiểu làn da trước khi chọn từng bước làm sạch và cấp ẩm.',60,'/images/photo-1616394584738-fc6e612e71b9.jpg','Chăm sóc da chuyên sâu VELA',650000,'ACTIVE',NULL),(19,6,'Chăm sóc bề mặt da và tẩy tế bào chết sinh học dịu nhẹ.',45,'/images/photo-1570172619644-dfd03ed5d881.jpg','Làm sáng da nhẹ nhàng Glow Peel',750000,'ACTIVE',NULL),(20,6,'Bổ sung dưỡng chất và điện di tinh chất giúp làn da tươi sáng.',75,'/images/photo-1598440947619-2c35fc9aa908.jpg','Dưỡng sáng da Vitamin C',850000,'ACTIVE',NULL),(21,6,'Mặt nạ sinh học và dưỡng chất làm dịu hàng rào bảo vệ da.',45,'/images/photo-1693004927824-f2623bbedc8b.jpg','Cấp ẩm chuyên sâu phục hồi da',500000,'ACTIVE',NULL),(22,7,'Gội thảo mộc kết hợp massage bấm huyệt cổ vai gáy.',60,'/images/photo-1761470575018-135c213340eb.jpg','Gội đầu dưỡng sinh thư giãn',250000,'ACTIVE',NULL),(23,7,'90 phút chăm sóc da đầu chuyên sâu trong không gian yên tĩnh.',90,'/images/photo-1693578538512-fc66f318c833.jpg','Gội đầu thư giãn Nhật Bản Head Spa',750000,'ACTIVE',NULL),(24,7,'Làm sạch cặn sản phẩm và cân bằng độ ẩm da đầu.',45,'/images/photo-1611920629515-3f76f8c36b37.jpg','Làm sạch da đầu Scalp Detox',450000,'ACTIVE',NULL),(25,7,'Chăm sóc da đầu, massage trị liệu và dưỡng ẩm thư thái trọn vẹn.',150,'/images/photo-1776763019060-fa0663574ae6.jpg','Liệu trình thư giãn toàn diện VELA',1800000,'ACTIVE',NULL),(26,2,'Định hình đường chân mày gọn gàng, sắc nét.',20,'/images/photo-1548902378-2ec44c906391.jpg','Wax tạo hình chân mày',120000,'ACTIVE',NULL),(27,2,'Tẩy sạch lông vùng mép với sáp dưỡng da dịu nhẹ.',15,'/images/photo-1524504388940-b1c1722653e1.jpg','Wax ria mép nhẹ dịu',80000,'ACTIVE',NULL),(28,2,'Làm sạch lông cánh tay và thoa dưỡng ức chế mọc lông.',30,'/images/photo-1519014816548-bf5fe059798b.jpg','Wax tay trọn gói',220000,'ACTIVE',NULL),(29,2,'Liệu trình wax chân nhẹ nhàng, không gây kích ứng.',45,'/images/photo-1604902396830-aca29e19b067.jpg','Wax chân toàn phần',320000,'ACTIVE',NULL),(30,1,'Sơn gel với màu sắc theo lựa chọn của khách hàng.',45,'/images/photo-1632345031435-8727f6897d53.jpg','Sơn gel',150000,'ACTIVE',NULL),(31,9,'làm đầu thân chân',60,NULL,'Chăm sóc toàn thân',100000,'ACTIVE',NULL);
/*!40000 ALTER TABLE `nail_service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `category_id` bigint DEFAULT NULL,
  `cost_price` decimal(38,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_for_sale` bit(1) DEFAULT NULL,
  `min_stock` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `sale_price` decimal(38,2) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `stock_quantity` int DEFAULT NULL,
  `unit` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfhmd06dsmj6k0n90swsh8ie9g` (`sku`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,NULL,120000.00,NULL,_binary '\0',10,'Sơn gel OPI Classic Red',0.00,'PROD-OPI-01','ACTIVE',3,'Chai'),(2,4,60000.00,NULL,_binary '',5,'Dầu dưỡng viền móng Cuticle Oil',95000.00,'PROD-OIL-02','ACTIVE',30,'Lọ'),(3,4,150000.00,NULL,_binary '',5,'Kem dưỡng da tay L\'Occitane Shea',220000.00,'PROD-HAND-03','ACTIVE',20,'Tuýp'),(4,NULL,0.00,NULL,_binary '',5,'Sơn gel kim tuyến nhũ vàng 24K (Mẫu cũ)',0.00,'GEL-GLITTER-OLD','DELETED',0,'Chai');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `appointment_id` bigint NOT NULL,
  `comment` text,
  `created_at` datetime(6) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `staff_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKvroos1rdslok15k6q2go3p15` (`appointment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,'Dịch vụ tại VELA rất tuyệt vời! Nhân viên nhiệt tình, tư vấn chu đáo và làm rất êm tay. Chắc chắn sẽ quay lại!','2026-10-30 10:03:41.398816',5,2,1),(2,8,'','2026-11-02 23:16:36.574828',5,15,4),(3,18,'','2026-11-03 10:58:07.281759',5,14,4),(4,13,'h','2026-11-03 10:58:14.005439',5,9,4),(5,63,'','2026-11-05 22:16:53.581742',4,9,19);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKch1113horj4qr56f91omojv8` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN','Quản trị viên'),(2,'RECEPTIONIST','Lễ tân'),(3,'STAFF','Nhân viên'),(4,'CUSTOMER','Khách hàng');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_category`
--

DROP TABLE IF EXISTS `service_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_category`
--

LOCK TABLES `service_category` WRITE;
/*!40000 ALTER TABLE `service_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `service_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_time_off`
--

DROP TABLE IF EXISTS `staff_time_off`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_time_off` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `off_date` date NOT NULL,
  `end_time` time DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `staff_id` bigint NOT NULL,
  `start_time` time DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_time_off`
--

LOCK TABLES `staff_time_off` WRITE;
/*!40000 ALTER TABLE `staff_time_off` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_time_off` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `after_qty` int DEFAULT NULL,
  `before_qty` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `delta` int DEFAULT NULL,
  `note` text,
  `operator` varchar(255) DEFAULT NULL,
  `product_id` bigint NOT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `sku` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stocks`
--

LOCK TABLES `stocks` WRITE;
/*!40000 ALTER TABLE `stocks` DISABLE KEYS */;
INSERT INTO `stocks` VALUES (1,45,30,'2026-11-01 23:31:35.119405',15,'Nhập hàng định kỳ từ nhà phân phối','Quản trị viên VELA',1,'Sơn gel OPI Classic Red','PROD-OPI-01','IMPORT'),(2,8,10,'2026-11-03 11:31:35.123921',-2,'Xuất dùng cho bàn làm việc tầng 1','Lễ tân VELA',2,'Dầu dưỡng viền móng Cuticle Oil','PROD-OIL-02','EXPORT'),(3,6,7,'2026-11-05 23:17:47.889787',-1,'Điều chỉnh giảm -1 Chai','Quản trị VELA',1,'Sơn gel OPI Classic Red','PROD-OPI-01','OUT'),(4,3,5,'2026-11-05 23:17:59.583830',-2,'Điều chỉnh giảm -2 Chai','Quản trị VELA',1,'Sơn gel OPI Classic Red','PROD-OPI-01','OUT');
/*!40000 ALTER TABLE `stocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `failed_attempts` tinyint NOT NULL DEFAULT '0',
  `locked_until` datetime(6) DEFAULT NULL,
  `role_id` bigint DEFAULT NULL,
  `bio` text,
  `experience_years` int DEFAULT NULL,
  `job_title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKdu5v5sr43g5bfnji4vb8hg5s3` (`phone`),
  KEY `FKp56c1712k691lhsyewcssf40f` (`role_id`),
  CONSTRAINT `FKp56c1712k691lhsyewcssf40f` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'2026-10-16 23:41:42.752478','minhanh@example.com','Nguyễn Minh Anh','$2a$10$NT6uSE4G2Lsac8GTzeO6/efy.xK/fW3jUB.hU4qw4A4eVuOlGh4UC','0910000001','ACTIVE','2026-10-16 23:41:42.752478',0,NULL,4,NULL,NULL,NULL),(2,NULL,'2026-10-16 23:41:42.774354','thaolinh@example.com','Trần Thảo Linh','$2a$10$KQlamg6Wagmlr4TOkR81EeSOHZwf92gr30.TuzZZFAPsVHAp3vXMq','0910000002','ACTIVE','2026-10-16 23:41:42.774354',0,NULL,4,NULL,NULL,NULL),(3,NULL,'2026-10-16 23:41:42.789014','ngocmai@example.com','Lê Ngọc Mai','$2a$10$1QX7Dv1Bb0Gqohu7pHHoge/QzzvLAIpwW3nxdktdpa92fYdGcb3I.','0910000003','ACTIVE','2026-10-16 23:41:42.789014',0,NULL,4,NULL,NULL,NULL),(4,NULL,'2026-10-16 23:41:42.798090','thuha@example.com','Phạm Thu Hà','$2a$10$yO2VUNGu2U/EM5uRwHmPWuVm8cJgDBYSM56hUEWmRsqeBrR9Tv3ka','0910000004','ACTIVE','2026-10-16 23:41:42.798090',0,NULL,4,NULL,NULL,NULL),(5,NULL,'2026-10-16 23:41:42.805920','baongoc@example.com','Hoàng Bảo Ngọc','$2a$10$2xQzPt88MxpKe70XCEVdzuiYDlArzgUlTjxBN6vVrh7BllggzAOz.','0910000022','ACTIVE','2026-11-06 07:58:20.108897',0,NULL,4,NULL,NULL,NULL),(6,NULL,'2026-10-17 13:23:49.090647','a@a.a','Huy Pham','$2a$10$ZTjNpaXQAnoJ1WZbjW48MOrjed8O9uL5Utgwabr7BF/bc4ryZbEsW','0988888888','ACTIVE','2026-10-17 13:23:49.090647',5,'2026-10-17 15:02:17.532754',4,NULL,NULL,NULL),(7,NULL,'2026-10-17 13:41:49.016400','admin@gmail.com','Quản trị VELA','$2a$10$TKpZZrUqYcKGA87mYsMeJOwnL11ko9QFd/Rt2aoyHq7NU2nmSEDnO','0901234567','ACTIVE','2026-11-04 22:57:47.932859',1,NULL,1,NULL,NULL,NULL),(8,NULL,'2026-10-17 13:41:49.103446','letan@gmail.com','Lễ tân VELA','$2a$10$M9eMLg8TznTh3ufjHNAE4..XM7dU62O3aXK0Dur5mEJ.BRobqp9P2','0901234568','ACTIVE','2026-10-17 13:41:49.103446',0,NULL,2,NULL,NULL,NULL),(9,NULL,'2026-10-17 13:41:49.188591','stafcf@gmail.com','Đoàn Quốc Dũn',NULL,'0901234507','ACTIVE','2026-11-06 08:06:18.472074',0,NULL,3,NULL,NULL,NULL),(10,NULL,'2026-10-17 14:44:17.717442','testuser99@example.com','Test User','$2a$10$2QVbrrDIEzFGDGd/uFBRLu6vb8ZrOGsfMg5Hg9LyrX26kYE99Mpti','0988776655','ACTIVE','2026-10-17 14:44:17.717442',0,NULL,4,NULL,NULL,NULL),(11,NULL,'2026-10-17 14:47:48.417484','b@b.b','Huy Pham','$2a$10$LXINwteqiHKT3uAv/ycEUeggLLy5A8YOdQurRMatO4NvXMAj3ZIjK','0999999998','ACTIVE','2026-10-17 14:47:48.417484',0,NULL,4,NULL,NULL,NULL),(12,NULL,'2026-10-29 16:20:11.584496','quynhanh.staff@gmail.com','Nguyễn Quỳnh Anh',NULL,'0902000001','ACTIVE','2026-10-29 16:20:11.584496',0,NULL,3,NULL,NULL,NULL),(13,NULL,'2026-10-29 16:20:11.693492','hoangyen.staff@gmail.com','Lê Hoàng Yến',NULL,'0902000002','ACTIVE','2026-10-29 16:20:11.693492',0,NULL,3,NULL,NULL,NULL),(14,NULL,'2026-10-29 16:20:11.783322','thuhuong.staff@gmail.com','Phạm Thu Hương',NULL,'0902000003','ACTIVE','2026-10-29 16:20:11.783322',0,NULL,3,NULL,NULL,NULL),(15,NULL,'2026-10-29 16:20:11.869382','minhphuong.staff@gmail.com','Vũ Minh Phương',NULL,'0902000004','ACTIVE','2026-10-29 16:20:11.869382',0,NULL,3,NULL,NULL,NULL),(16,NULL,'2026-10-29 16:20:11.956138','camly.staff@gmail.com','Đỗ Cẩm Ly',NULL,'0902000005','ACTIVE','2026-11-03 20:48:48.730707',0,NULL,3,NULL,NULL,NULL),(17,NULL,'2026-11-03 23:11:11.621658','admin@vela.com','Quản trị VELA','$2a$10$VcGSmZw9H0Qonqr1tH2qEOz3Z9ZmqOv29MFUB3XSXOeBklb/hTaxm','0901234560','ACTIVE','2026-11-03 23:11:11.621658',0,NULL,1,NULL,NULL,NULL),(18,NULL,'2026-11-03 23:11:11.717580','letan@vela.com','Lễ tân VELA','$2a$10$GrenJ4K9R0NL1zvsPyT1SuKAta8/c.78VeaS.w7QC3JctXc.fUOdW','0901234561','ACTIVE','2026-11-03 23:11:11.717580',0,NULL,2,NULL,NULL,NULL),(19,NULL,'2026-11-05 21:32:22.406101','giahuy@gmail.com','Phạm Hồng Gia Huy','$2a$10$1kG8nQ6VL7HiKXGPMhf1..xWJ.Ao0JHsJGGQ49KMxqJRacedgXOJi','0986024133','ACTIVE','2026-11-05 21:32:22.406101',0,NULL,4,NULL,NULL,NULL),(20,NULL,'2026-11-06 08:22:33.518363','staff@gmail.com','Nhân viên VELA',NULL,'0901234569','ACTIVE','2026-11-06 08:22:33.518363',0,NULL,3,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `waitlist_entries`
--

DROP TABLE IF EXISTS `waitlist_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waitlist_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `customer_id` bigint DEFAULT NULL,
  `desired_date` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `from_time` time DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `note` text,
  `phone` varchar(255) NOT NULL,
  `service_id` bigint DEFAULT NULL,
  `staff_id` bigint DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `to_time` time DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `waitlist_entries`
--

LOCK TABLES `waitlist_entries` WRITE;
/*!40000 ALTER TABLE `waitlist_entries` DISABLE KEYS */;
INSERT INTO `waitlist_entries` VALUES (1,'2026-11-03 23:18:33.346746',NULL,'2026-11-03','test@example.com',NULL,'Test User',NULL,'0901234567',NULL,NULL,'WAITING',NULL);
/*!40000 ALTER TABLE `waitlist_entries` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-07  9:36:32
