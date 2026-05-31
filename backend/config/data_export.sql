-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: library-management-library-management-hcmiu.f.aivencloud.com    Database: library_management
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '3f3dd2c4-5937-11f1-aafd-c67be0ec938e:1-220,
7a0d28a1-55ef-11f1-8739-2633f5e8265e:1-40';

--
-- Table structure for table `book_copies`
--

DROP TABLE IF EXISTS `book_copies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_copies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` int NOT NULL,
  `status` enum('available','borrowed','lost','damaged') NOT NULL DEFAULT 'available',
  `copy_code` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `copy_code` (`copy_code`),
  KEY `fk_book_copies_book` (`book_id`),
  CONSTRAINT `fk_book_copies_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `book_copies`
--

LOCK TABLES `book_copies` WRITE;
/*!40000 ALTER TABLE `book_copies` DISABLE KEYS */;
INSERT INTO `book_copies` VALUES (1,1,'borrowed',NULL),(2,2,'borrowed',NULL),(3,3,'borrowed',NULL),(4,4,'available',NULL),(5,5,'borrowed',NULL),(6,6,'available',NULL),(7,7,'borrowed',NULL),(8,8,'borrowed',NULL),(9,9,'available',NULL),(10,10,'borrowed',NULL),(11,11,'borrowed',NULL),(12,12,'available',NULL),(13,13,'borrowed',NULL),(14,14,'borrowed',NULL),(15,15,'available',NULL),(16,16,'borrowed',NULL),(17,17,'borrowed',NULL),(18,18,'available',NULL),(19,19,'borrowed',NULL),(20,20,'borrowed',NULL),(21,21,'damaged',NULL),(22,22,'damaged',NULL),(23,23,'lost',NULL),(24,24,'lost',NULL),(25,25,'borrowed',NULL),(26,26,'lost',NULL),(27,27,'borrowed',NULL),(28,28,'lost',NULL),(29,29,'lost',NULL),(30,30,'borrowed',NULL),(31,31,'damaged',NULL),(32,32,'available',NULL),(33,33,'borrowed',NULL),(34,34,'borrowed',NULL),(35,35,'borrowed',NULL),(36,36,'borrowed',NULL),(37,37,'damaged',NULL),(38,38,'lost',NULL),(39,39,'available',NULL),(40,40,'available',NULL),(41,41,'borrowed',NULL),(42,42,'lost',NULL),(43,43,'available',NULL),(44,44,'borrowed',NULL),(45,45,'borrowed',NULL),(46,46,'borrowed',NULL),(47,47,'borrowed',NULL),(48,48,'borrowed',NULL),(49,49,'borrowed',NULL),(50,50,'lost',NULL),(51,51,'available',NULL),(52,52,'borrowed',NULL),(53,53,'borrowed',NULL),(54,54,'borrowed',NULL),(55,55,'borrowed',NULL),(56,56,'available',NULL),(57,57,'borrowed',NULL),(58,58,'borrowed',NULL),(59,59,'lost',NULL),(60,60,'borrowed',NULL),(61,61,'lost',NULL),(62,62,'lost',NULL),(63,63,'borrowed',NULL),(64,64,'borrowed',NULL),(65,65,'available',NULL),(66,66,'borrowed',NULL),(67,67,'borrowed',NULL),(68,68,'available',NULL),(69,69,'lost',NULL),(70,70,'lost',NULL),(71,71,'borrowed',NULL),(72,72,'borrowed',NULL),(73,73,'borrowed',NULL),(74,74,'available',NULL),(75,75,'borrowed',NULL),(76,76,'available',NULL),(77,77,'borrowed',NULL),(78,78,'borrowed',NULL),(79,79,'borrowed',NULL),(80,80,'available',NULL),(81,81,'borrowed',NULL),(82,82,'borrowed',NULL),(83,83,'available',NULL),(84,84,'borrowed',NULL),(85,85,'borrowed',NULL),(86,86,'borrowed',NULL),(87,87,'available',NULL),(88,88,'lost',NULL),(89,89,'damaged',NULL),(90,90,'borrowed',NULL),(91,91,'damaged',NULL),(92,92,'borrowed',NULL),(93,93,'borrowed',NULL),(94,94,'borrowed',NULL),(95,95,'borrowed',NULL),(96,96,'borrowed',NULL),(97,97,'available',NULL),(98,98,'borrowed',NULL),(99,99,'borrowed',NULL),(100,100,'borrowed',NULL);
/*!40000 ALTER TABLE `book_copies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(150) DEFAULT NULL,
  `published_year` year DEFAULT NULL,
  `isbn` varchar(50) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `subject_id` int DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `fk_books_category` (`category_id`),
  KEY `fk_books_subject` (`subject_id`),
  CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_books_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `books`
--

LOCK TABLES `books` WRITE;
/*!40000 ALTER TABLE `books` DISABLE KEYS */;
INSERT INTO `books` VALUES (1,'Introduction to Programming Handbook 1','Ian Sommerville',2015,'978-2208611688',7,1,'Reference book for introduction to programming students.'),(2,'Object-Oriented Programming Handbook 1','Martin Fowler',2023,'978-7605017181',9,2,'Reference book for object-oriented programming students.'),(3,'Data Structures Handbook 1','Elmasri Navathe',2005,'978-7598546729',2,3,'Reference book for data structures students.'),(4,'Algorithms Handbook 1','Martin Fowler',2007,'978-8723690202',3,4,'Reference book for algorithms students.'),(5,'Database Systems Handbook 1','Abraham Silberschatz',2012,'978-4777560303',6,5,'Reference book for database systems students.'),(6,'Web Application Development Handbook 1','Stuart Russell',2009,'978-7351447746',9,6,'Reference book for web application development students.'),(7,'Computer Networks Handbook 1','Thomas H. Cormen',2016,'978-5953196738',3,7,'Reference book for computer networks students.'),(8,'Operating Systems Handbook 1','Ian Sommerville',2009,'978-3548525789',1,8,'Reference book for operating systems students.'),(9,'Artificial Intelligence Handbook 1','Abraham Silberschatz',2011,'978-5599418818',10,9,'Reference book for artificial intelligence students.'),(10,'Machine Learning Handbook 1','Andrew S. Tanenbaum',2014,'978-4927711579',6,10,'Reference book for machine learning students.'),(11,'Software Testing Handbook 1','Thomas H. Cormen',2021,'978-6981998407',3,11,'Reference book for software testing students.'),(12,'Software Project Management Handbook 1','Ian Sommerville',2014,'978-7335984257',10,12,'Reference book for software project management students.'),(13,'Business Communication Handbook 1','Robert C. Martin',2015,'978-6496407079',5,13,'Reference book for business communication students.'),(14,'Academic English Handbook 1','Robert C. Martin',2026,'978-5348655484',10,14,'Reference book for academic english students.'),(15,'Linear Algebra Handbook 1','Thomas H. Cormen',2009,'978-7818206739',7,15,'Reference book for linear algebra students.'),(16,'Discrete Mathematics Handbook 1','Abraham Silberschatz',2025,'978-5576010065',6,16,'Reference book for discrete mathematics students.'),(17,'Information Security Handbook 1','Robert C. Martin',2012,'978-2865940249',8,17,'Reference book for information security students.'),(18,'Cloud Computing Handbook 1','Abraham Silberschatz',2014,'978-6782446574',7,18,'Reference book for cloud computing students.'),(19,'Human Computer Interaction Handbook 1','Robert C. Martin',2015,'978-9576522053',2,19,'Reference book for human computer interaction students.'),(20,'Mobile App Development Handbook 1','Elmasri Navathe',2007,'978-9818117981',7,20,'Reference book for mobile app development students.'),(21,'Introduction to Programming Handbook 2','Martin Fowler',2010,'978-4493128801',8,21,'Reference book for introduction to programming students.'),(22,'Object-Oriented Programming Handbook 2','Ian Sommerville',2008,'978-3363072276',9,22,'Reference book for object-oriented programming students.'),(23,'Data Structures Handbook 2','Robert C. Martin',2024,'978-2165589977',9,23,'Reference book for data structures students.'),(24,'Algorithms Handbook 2','Stuart Russell',2018,'978-6483893090',1,24,'Reference book for algorithms students.'),(25,'Database Systems Handbook 2','Ian Sommerville',2008,'978-2363278522',9,25,'Reference book for database systems students.'),(26,'Web Application Development Handbook 2','Stuart Russell',2020,'978-6002840328',7,26,'Reference book for web application development students.'),(27,'Computer Networks Handbook 2','Andrew S. Tanenbaum',2006,'978-3100501456',2,27,'Reference book for computer networks students.'),(28,'Operating Systems Handbook 2','Elmasri Navathe',2013,'978-4679490787',9,28,'Reference book for operating systems students.'),(29,'Artificial Intelligence Handbook 2','Ian Sommerville',2026,'978-7474390509',8,29,'Reference book for artificial intelligence students.'),(30,'Machine Learning Handbook 2','Robert C. Martin',2016,'978-9204878784',8,30,'Reference book for machine learning students.'),(31,'Software Testing Handbook 2','Stuart Russell',2015,'978-6315292743',9,31,'Reference book for software testing students.'),(32,'Software Project Management Handbook 2','Thomas H. Cormen',2018,'978-3008136780',6,32,'Reference book for software project management students.'),(33,'Business Communication Handbook 2','James Kurose',2011,'978-8649661174',9,33,'Reference book for business communication students.'),(34,'Academic English Handbook 2','Thomas H. Cormen',2012,'978-2875636007',10,34,'Reference book for academic english students.'),(35,'Linear Algebra Handbook 2','Abraham Silberschatz',2024,'978-2975445405',4,35,'Reference book for linear algebra students.'),(36,'Discrete Mathematics Handbook 2','Thomas H. Cormen',2007,'978-1382627090',1,36,'Reference book for discrete mathematics students.'),(37,'Information Security Handbook 2','Elmasri Navathe',2024,'978-2349982242',8,37,'Reference book for information security students.'),(38,'Cloud Computing Handbook 2','Thomas H. Cormen',2024,'978-2137380674',7,38,'Reference book for cloud computing students.'),(39,'Human Computer Interaction Handbook 2','Thomas H. Cormen',2007,'978-2290386323',7,39,'Reference book for human computer interaction students.'),(40,'Mobile App Development Handbook 2','Stuart Russell',2024,'978-3837828049',7,40,'Reference book for mobile app development students.'),(41,'Introduction to Programming Handbook 3','Elmasri Navathe',2009,'978-4486440747',8,41,'Reference book for introduction to programming students.'),(42,'Object-Oriented Programming Handbook 3','James Kurose',2014,'978-5140701774',6,42,'Reference book for object-oriented programming students.'),(43,'Data Structures Handbook 3','Andrew S. Tanenbaum',2016,'978-7325987690',1,43,'Reference book for data structures students.'),(44,'Algorithms Handbook 3','Ian Sommerville',2022,'978-3343176303',2,44,'Reference book for algorithms students.'),(45,'Database Systems Handbook 3','Ian Sommerville',2007,'978-8232819038',1,45,'Reference book for database systems students.'),(46,'Web Application Development Handbook 3','Ian Sommerville',2010,'978-4877008609',3,46,'Reference book for web application development students.'),(47,'Computer Networks Handbook 3','Peter Norvig',2016,'978-8817067009',1,47,'Reference book for computer networks students.'),(48,'Operating Systems Handbook 3','Thomas H. Cormen',2005,'978-2615178810',1,48,'Reference book for operating systems students.'),(49,'Artificial Intelligence Handbook 3','Abraham Silberschatz',2009,'978-4838094777',3,49,'Reference book for artificial intelligence students.'),(50,'Machine Learning Handbook 3','Robert C. Martin',2011,'978-9991030793',5,50,'Reference book for machine learning students.'),(51,'Software Testing Handbook 3','Abraham Silberschatz',2008,'978-5979887099',6,51,'Reference book for software testing students.'),(52,'Software Project Management Handbook 3','Peter Norvig',2018,'978-7929912840',4,52,'Reference book for software project management students.'),(53,'Business Communication Handbook 3','Abraham Silberschatz',2018,'978-4438940937',9,53,'Reference book for business communication students.'),(54,'Academic English Handbook 3','Ian Sommerville',2020,'978-2593318253',1,54,'Reference book for academic english students.'),(55,'Linear Algebra Handbook 3','Stuart Russell',2021,'978-9324656088',3,55,'Reference book for linear algebra students.'),(56,'Discrete Mathematics Handbook 3','Martin Fowler',2008,'978-4935525977',9,56,'Reference book for discrete mathematics students.'),(57,'Information Security Handbook 3','James Kurose',2014,'978-2872225805',2,57,'Reference book for information security students.'),(58,'Cloud Computing Handbook 3','Martin Fowler',2013,'978-4072741229',2,58,'Reference book for cloud computing students.'),(59,'Human Computer Interaction Handbook 3','Peter Norvig',2011,'978-7468027421',10,59,'Reference book for human computer interaction students.'),(60,'Mobile App Development Handbook 3','Ian Sommerville',2012,'978-6464736117',1,60,'Reference book for mobile app development students.'),(61,'Introduction to Programming Handbook 4','Elmasri Navathe',2011,'978-2487512978',7,61,'Reference book for introduction to programming students.'),(62,'Object-Oriented Programming Handbook 4','Andrew S. Tanenbaum',2017,'978-5908990271',4,62,'Reference book for object-oriented programming students.'),(63,'Data Structures Handbook 4','Abraham Silberschatz',2008,'978-5945599851',2,63,'Reference book for data structures students.'),(64,'Algorithms Handbook 4','Andrew S. Tanenbaum',2011,'978-1347331466',3,64,'Reference book for algorithms students.'),(65,'Database Systems Handbook 4','Thomas H. Cormen',2026,'978-5959561369',4,65,'Reference book for database systems students.'),(66,'Web Application Development Handbook 4','Elmasri Navathe',2012,'978-8485076244',3,66,'Reference book for web application development students.'),(67,'Computer Networks Handbook 4','Ian Sommerville',2020,'978-3024417445',7,67,'Reference book for computer networks students.'),(68,'Operating Systems Handbook 4','Peter Norvig',2014,'978-2222670545',8,68,'Reference book for operating systems students.'),(69,'Artificial Intelligence Handbook 4','Martin Fowler',2026,'978-1100825200',6,69,'Reference book for artificial intelligence students.'),(70,'Machine Learning Handbook 4','Stuart Russell',2010,'978-5899830326',3,70,'Reference book for machine learning students.'),(71,'Software Testing Handbook 4','Abraham Silberschatz',2018,'978-1515469585',10,71,'Reference book for software testing students.'),(72,'Software Project Management Handbook 4','Peter Norvig',2023,'978-3352182189',8,72,'Reference book for software project management students.'),(73,'Business Communication Handbook 4','Elmasri Navathe',2024,'978-8673954009',8,73,'Reference book for business communication students.'),(74,'Academic English Handbook 4','Thomas H. Cormen',2023,'978-6780404005',10,74,'Reference book for academic english students.'),(75,'Linear Algebra Handbook 4','Ian Sommerville',2021,'978-2586190962',9,75,'Reference book for linear algebra students.'),(76,'Discrete Mathematics Handbook 4','Thomas H. Cormen',2025,'978-1431865541',6,76,'Reference book for discrete mathematics students.'),(77,'Information Security Handbook 4','Martin Fowler',2010,'978-4204292642',3,77,'Reference book for information security students.'),(78,'Cloud Computing Handbook 4','Abraham Silberschatz',2010,'978-1094769082',6,78,'Reference book for cloud computing students.'),(79,'Human Computer Interaction Handbook 4','Ian Sommerville',2012,'978-8572961580',5,79,'Reference book for human computer interaction students.'),(80,'Mobile App Development Handbook 4','Andrew S. Tanenbaum',2026,'978-7404790060',4,80,'Reference book for mobile app development students.'),(81,'Introduction to Programming Handbook 5','Thomas H. Cormen',2026,'978-1792381263',10,81,'Reference book for introduction to programming students.'),(82,'Object-Oriented Programming Handbook 5','Ian Sommerville',2022,'978-7964217673',10,82,'Reference book for object-oriented programming students.'),(83,'Data Structures Handbook 5','Martin Fowler',2005,'978-7793606759',10,83,'Reference book for data structures students.'),(84,'Algorithms Handbook 5','Thomas H. Cormen',2017,'978-4273595517',7,84,'Reference book for algorithms students.'),(85,'Database Systems Handbook 5','James Kurose',2021,'978-2926455344',9,85,'Reference book for database systems students.'),(86,'Web Application Development Handbook 5','Elmasri Navathe',2012,'978-6475862205',8,86,'Reference book for web application development students.'),(87,'Computer Networks Handbook 5','Abraham Silberschatz',2025,'978-4359897126',9,87,'Reference book for computer networks students.'),(88,'Operating Systems Handbook 5','Stuart Russell',2015,'978-3912991994',1,88,'Reference book for operating systems students.'),(89,'Artificial Intelligence Handbook 5','James Kurose',2026,'978-8294945671',2,89,'Reference book for artificial intelligence students.'),(90,'Machine Learning Handbook 5','Andrew S. Tanenbaum',2008,'978-1495135415',2,90,'Reference book for machine learning students.'),(91,'Software Testing Handbook 5','Ian Sommerville',2017,'978-2990048625',3,91,'Reference book for software testing students.'),(92,'Software Project Management Handbook 5','Thomas H. Cormen',2021,'978-4882259888',5,92,'Reference book for software project management students.'),(93,'Business Communication Handbook 5','Robert C. Martin',2025,'978-2598978343',9,93,'Reference book for business communication students.'),(94,'Academic English Handbook 5','Peter Norvig',2010,'978-8478290356',3,94,'Reference book for academic english students.'),(95,'Linear Algebra Handbook 5','Stuart Russell',2011,'978-2821222511',3,95,'Reference book for linear algebra students.'),(96,'Discrete Mathematics Handbook 5','Peter Norvig',2022,'978-4237749906',1,96,'Reference book for discrete mathematics students.'),(97,'Information Security Handbook 5','Ian Sommerville',2018,'978-2364874771',1,97,'Reference book for information security students.'),(98,'Cloud Computing Handbook 5','Thomas H. Cormen',2007,'978-2284900393',10,98,'Reference book for cloud computing students.'),(99,'Human Computer Interaction Handbook 5','Ian Sommerville',2023,'978-9222025350',10,99,'Reference book for human computer interaction students.'),(100,'Mobile App Development Handbook 5','Stuart Russell',2014,'978-9345383068',7,100,'Reference book for mobile app development students.');
/*!40000 ALTER TABLE `books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `borrow_records`
--

DROP TABLE IF EXISTS `borrow_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `borrow_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `borrower_user_id` int NOT NULL,
  `book_copy_id` int NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('pending_approval','approved','pending_return_approval','returned','overdue') NOT NULL DEFAULT 'pending_approval',
  `created_by_staff_user_id` int DEFAULT NULL,
  `approved_by_staff_user_id` int DEFAULT NULL,
  `return_approved_by_staff_user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_borrow_records_user` (`borrower_user_id`),
  KEY `fk_borrow_records_book_copy` (`book_copy_id`),
  KEY `fk_borrow_records_staff` (`created_by_staff_user_id`),
  KEY `fk_borrow_records_staff_approved` (`approved_by_staff_user_id`),
  KEY `fk_borrow_records_staff_return_approved` (`return_approved_by_staff_user_id`),
  CONSTRAINT `fk_borrow_records_book_copy` FOREIGN KEY (`book_copy_id`) REFERENCES `book_copies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_borrow_records_staff` FOREIGN KEY (`created_by_staff_user_id`) REFERENCES `staff` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_borrow_records_staff_approved` FOREIGN KEY (`approved_by_staff_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_borrow_records_staff_return_approved` FOREIGN KEY (`return_approved_by_staff_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_borrow_records_user` FOREIGN KEY (`borrower_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `borrow_records`
--

LOCK TABLES `borrow_records` WRITE;
/*!40000 ALTER TABLE `borrow_records` DISABLE KEYS */;
INSERT INTO `borrow_records` VALUES (1,1,1,'2026-05-01','2026-05-15',NULL,'approved',16,16,NULL),(2,2,2,'2026-05-02','2026-05-16',NULL,'approved',17,17,NULL),(3,3,3,'2026-05-03','2026-05-17',NULL,'approved',18,18,NULL),(4,4,4,'2026-05-04','2026-05-18','2026-05-11','',19,19,20),(5,5,5,'2026-05-05','2026-05-19',NULL,'approved',20,20,NULL),(6,6,6,'2026-05-06','2026-05-20','2026-05-13','',16,16,17),(7,7,7,'2026-05-07','2026-05-21',NULL,'approved',17,17,NULL),(8,8,8,'2026-05-08','2026-05-22',NULL,'approved',18,18,NULL),(9,9,9,'2026-05-09','2026-05-23','2026-05-16','',19,19,20),(10,10,10,'2026-05-10','2026-05-24',NULL,'approved',20,20,NULL),(11,11,11,'2026-05-11','2026-05-25',NULL,'approved',16,16,NULL),(12,12,12,'2026-05-12','2026-05-26','2026-05-19','',17,17,18),(13,13,13,'2026-05-13','2026-05-27',NULL,'approved',18,18,NULL),(14,14,14,'2026-05-14','2026-05-28',NULL,'approved',19,19,NULL),(15,15,15,'2026-05-15','2026-05-29','2026-05-22','',20,20,16),(16,1,16,'2026-05-16','2026-05-30',NULL,'approved',16,16,NULL),(17,2,17,'2026-05-17','2026-05-31',NULL,'approved',17,17,NULL),(18,3,18,'2026-05-18','2026-06-01','2026-05-25','',18,18,19),(19,4,19,'2026-05-19','2026-06-02',NULL,'approved',19,19,NULL),(20,5,20,'2026-05-20','2026-06-03',NULL,'approved',20,20,NULL),(21,1,99,'2026-05-30','2026-06-13',NULL,'approved',NULL,16,NULL),(22,1,96,'2026-05-30','2026-06-13',NULL,'approved',NULL,16,NULL);
/*!40000 ALTER TABLE `borrow_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (4,'Artificial Intelligence'),(5,'Business'),(10,'Cybersecurity'),(2,'Database'),(7,'English'),(6,'Mathematics'),(3,'Networking'),(8,'Physics'),(1,'Programming'),(9,'Web Development');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecturers`
--

DROP TABLE IF EXISTS `lecturers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecturers` (
  `user_id` int NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_lecturers_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecturers`
--

LOCK TABLES `lecturers` WRITE;
/*!40000 ALTER TABLE `lecturers` DISABLE KEYS */;
INSERT INTO `lecturers` VALUES (11,'Business Administration'),(12,'Software Engineering'),(13,'Information Systems'),(14,'Information Systems'),(15,'Business Administration');
/*!40000 ALTER TABLE `lecturers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `book_id` int NOT NULL,
  `reservation_date` date NOT NULL,
  `status` enum('pending','approved','cancelled','completed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `fk_reservations_user` (`user_id`),
  KEY `fk_reservations_book` (`book_id`),
  CONSTRAINT `fk_reservations_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,1,1,'2026-05-10','cancelled'),(2,2,2,'2026-05-11','approved'),(3,3,3,'2026-05-12','cancelled'),(4,4,4,'2026-05-13','completed'),(5,5,5,'2026-05-14','pending'),(6,6,6,'2026-05-15','approved'),(7,7,7,'2026-05-16','completed'),(8,8,8,'2026-05-17','pending'),(9,9,9,'2026-05-18','cancelled'),(10,10,10,'2026-05-19','approved');
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shifts`
--

DROP TABLE IF EXISTS `shifts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shifts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `staff_user_id` int NOT NULL,
  `shift_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `note` text,
  PRIMARY KEY (`id`),
  KEY `fk_shifts_staff` (`staff_user_id`),
  CONSTRAINT `fk_shifts_staff` FOREIGN KEY (`staff_user_id`) REFERENCES `staff` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shifts`
--

LOCK TABLES `shifts` WRITE;
/*!40000 ALTER TABLE `shifts` DISABLE KEYS */;
INSERT INTO `shifts` VALUES (2,17,'2026-05-25','13:00:00','17:00:00','Monday Afternoon'),(3,18,'2026-05-26','08:00:00','12:00:00','Tuesday Morning'),(4,19,'2026-05-26','13:00:00','17:00:00','Tuesday Afternoon'),(5,20,'2026-05-27','08:00:00','12:00:00','Wednesday Morning'),(7,17,'2026-05-28','08:00:00','12:00:00','Thursday Morning'),(8,18,'2026-05-28','13:00:00','17:00:00','Thursday Afternoon'),(9,19,'2026-05-29','08:00:00','12:00:00','Friday Morning'),(10,20,'2026-05-29','13:00:00','17:00:00','Friday Afternoon'),(16,16,'2026-06-01','08:00:00','12:00:00','Monday Morning'),(17,16,'2026-06-03','08:00:00','12:00:00','Wednesday Morning'),(18,16,'2026-05-30','13:00:00','17:00:00','Saturday Afternoon');
/*!40000 ALTER TABLE `shifts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `user_id` int NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (16,'Library Staff',1),(17,'Library Staff',1),(18,'Library Staff',1),(19,'Library Staff',1),(20,'Manager',1);
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `user_id` int NOT NULL,
  `student_code` varchar(50) NOT NULL,
  `major` varchar(100) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `student_code` (`student_code`),
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'STU2026001','Data Science','SE4-3'),(2,'STU2026002','Software Engineering','SE3-2'),(3,'STU2026003','Data Science','SE2-2'),(4,'STU2026004','Data Science','SE2-3'),(5,'STU2026005','Software Engineering','SE4-1'),(6,'STU2026006','Information Systems','SE1-1'),(7,'STU2026007','Cybersecurity','SE2-2'),(8,'STU2026008','Information Systems','SE2-2'),(9,'STU2026009','Cybersecurity','SE1-1'),(10,'STU2026010','Data Science','SE1-3');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_subjects_category` (`category_id`),
  CONSTRAINT `fk_subjects_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,5,'Introduction to Programming 1'),(2,9,'Object-Oriented Programming 1'),(3,9,'Data Structures 1'),(4,1,'Algorithms 1'),(5,5,'Database Systems 1'),(6,1,'Web Application Development 1'),(7,4,'Computer Networks 1'),(8,5,'Operating Systems 1'),(9,8,'Artificial Intelligence 1'),(10,7,'Machine Learning 1'),(11,1,'Software Testing 1'),(12,1,'Software Project Management 1'),(13,7,'Business Communication 1'),(14,2,'Academic English 1'),(15,9,'Linear Algebra 1'),(16,2,'Discrete Mathematics 1'),(17,8,'Information Security 1'),(18,5,'Cloud Computing 1'),(19,6,'Human Computer Interaction 1'),(20,6,'Mobile App Development 1'),(21,7,'Introduction to Programming 2'),(22,9,'Object-Oriented Programming 2'),(23,4,'Data Structures 2'),(24,2,'Algorithms 2'),(25,3,'Database Systems 2'),(26,8,'Web Application Development 2'),(27,2,'Computer Networks 2'),(28,4,'Operating Systems 2'),(29,7,'Artificial Intelligence 2'),(30,7,'Machine Learning 2'),(31,9,'Software Testing 2'),(32,6,'Software Project Management 2'),(33,2,'Business Communication 2'),(34,8,'Academic English 2'),(35,5,'Linear Algebra 2'),(36,2,'Discrete Mathematics 2'),(37,7,'Information Security 2'),(38,3,'Cloud Computing 2'),(39,6,'Human Computer Interaction 2'),(40,6,'Mobile App Development 2'),(41,9,'Introduction to Programming 3'),(42,10,'Object-Oriented Programming 3'),(43,2,'Data Structures 3'),(44,8,'Algorithms 3'),(45,1,'Database Systems 3'),(46,7,'Web Application Development 3'),(47,8,'Computer Networks 3'),(48,8,'Operating Systems 3'),(49,4,'Artificial Intelligence 3'),(50,8,'Machine Learning 3'),(51,3,'Software Testing 3'),(52,3,'Software Project Management 3'),(53,2,'Business Communication 3'),(54,2,'Academic English 3'),(55,9,'Linear Algebra 3'),(56,2,'Discrete Mathematics 3'),(57,1,'Information Security 3'),(58,10,'Cloud Computing 3'),(59,9,'Human Computer Interaction 3'),(60,9,'Mobile App Development 3'),(61,7,'Introduction to Programming 4'),(62,7,'Object-Oriented Programming 4'),(63,4,'Data Structures 4'),(64,1,'Algorithms 4'),(65,1,'Database Systems 4'),(66,9,'Web Application Development 4'),(67,6,'Computer Networks 4'),(68,9,'Operating Systems 4'),(69,6,'Artificial Intelligence 4'),(70,1,'Machine Learning 4'),(71,8,'Software Testing 4'),(72,2,'Software Project Management 4'),(73,2,'Business Communication 4'),(74,9,'Academic English 4'),(75,2,'Linear Algebra 4'),(76,6,'Discrete Mathematics 4'),(77,2,'Information Security 4'),(78,7,'Cloud Computing 4'),(79,7,'Human Computer Interaction 4'),(80,7,'Mobile App Development 4'),(81,8,'Introduction to Programming 5'),(82,6,'Object-Oriented Programming 5'),(83,1,'Data Structures 5'),(84,7,'Algorithms 5'),(85,7,'Database Systems 5'),(86,5,'Web Application Development 5'),(87,5,'Computer Networks 5'),(88,9,'Operating Systems 5'),(89,7,'Artificial Intelligence 5'),(90,4,'Machine Learning 5'),(91,9,'Software Testing 5'),(92,1,'Software Project Management 5'),(93,3,'Business Communication 5'),(94,4,'Academic English 5'),(95,7,'Linear Algebra 5'),(96,7,'Discrete Mathematics 5'),(97,9,'Information Security 5'),(98,9,'Cloud Computing 5'),(99,7,'Human Computer Interaction 5'),(100,4,'Mobile App Development 5');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('student','lecturer','staff','manager') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Trần Thanh Hải','student001','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','tran.thanh.hai.student1@library.edu.vn','student','2026-01-08 00:00:00'),(2,'Lê Gia Minh','student002','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','le.gia.minh.student2@library.edu.vn','student','2026-01-11 00:00:00'),(3,'Phạm Anh Sơn','student003','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','pham.anh.son.student3@library.edu.vn','student','2026-01-08 00:00:00'),(4,'Hoàng Tuấn An','student004','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','hoang.tuan.an.student4@library.edu.vn','student','2026-01-21 00:00:00'),(5,'Huỳnh Phương Hải','student005','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','huynh.phuong.hai.student5@library.edu.vn','student','2026-01-28 00:00:00'),(6,'Phan Minh Minh','student006','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','phan.minh.minh.student6@library.edu.vn','student','2026-01-24 00:00:00'),(7,'Vũ Hoàng Sơn','student007','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','vu.hoang.son.student7@library.edu.vn','student','2026-01-22 00:00:00'),(8,'Võ Ngọc An','student008','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','vo.ngoc.an.student8@library.edu.vn','student','2026-01-13 00:00:00'),(9,'Đặng Đức Hải','student009','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','dang.duc.hai.student9@library.edu.vn','student','2026-01-06 00:00:00'),(10,'Bùi Bảo Minh','student010','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','bui.bao.minh.student10@library.edu.vn','student','2026-01-10 00:00:00'),(11,'Đỗ Hoàng Long','lecturer001','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','do.hoang.long.lecturer1@library.edu.vn','lecturer','2026-01-12 00:00:00'),(12,'Hồ Ngọc Quỳnh','lecturer002','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ho.ngoc.quynh.lecturer2@library.edu.vn','lecturer','2026-01-04 00:00:00'),(13,'Ngô Đức Yến','lecturer003','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ngo.duc.yen.lecturer3@library.edu.vn','lecturer','2026-01-13 00:00:00'),(14,'Dương Bảo Hà','lecturer004','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','duong.bao.ha.lecturer4@library.edu.vn','lecturer','2026-01-12 00:00:00'),(15,'Lý Thị Long','lecturer005','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ly.thi.long.lecturer5@library.edu.vn','lecturer','2026-01-10 00:00:00'),(16,'Đỗ Thị Bình','staff001','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','do.thi.binh.staff1@library.edu.vn','staff','2026-01-17 00:00:00'),(17,'Hồ Quang Hiếu','staff002','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ho.quang.hieu.staff2@library.edu.vn','staff','2026-01-04 00:00:00'),(18,'Ngô Khánh Nam','staff003','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ngo.khanh.nam.staff3@library.edu.vn','staff','2026-01-19 00:00:00'),(19,'Dương Hữu Thảo','staff004','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','duong.huu.thao.staff4@library.edu.vn','staff','2026-01-27 00:00:00'),(20,'Lý Mai Bình','staff005','$2b$10$Zw55XcGSaJMVw38b7VbnSuuMc3WT6AO0CvxYn/8xyupZgCtZg20Ie','ly.mai.binh.staff5@library.edu.vn','manager','2026-01-01 00:00:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-30 21:57:53
