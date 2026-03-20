-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2026 at 04:31 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `petnexa_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_breed_detection`
--

CREATE TABLE `ai_breed_detection` (
  `detection_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `uploaded_image` varchar(255) NOT NULL,
  `predicted_breed` varchar(100) DEFAULT NULL,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_breed_detection`
--

INSERT INTO `ai_breed_detection` (`detection_id`, `user_id`, `uploaded_image`, `predicted_breed`, `confidence_score`, `created_at`) VALUES
(1, 1, 'uploads/ai/detect_1.jpg', 'Golden Retriever', 95.50, '2026-02-23 14:00:06'),
(2, 2, 'uploads/ai/detect_2.jpg', 'Persian Cat', 92.30, '2026-02-23 14:00:06'),
(3, 3, 'uploads/ai/detect_3.jpg', 'German Shepherd', 97.10, '2026-02-23 14:00:06'),
(4, 1, 'uploads/ai/detect_4.jpg', 'Siamese Cat', 89.80, '2026-02-23 14:00:06'),
(5, 2, 'uploads/ai/detect_5.jpg', 'Labrador Retriever', 93.60, '2026-02-23 14:00:06'),
(6, 3, 'uploads/ai/detect_6.jpg', 'Pomeranian', 88.40, '2026-02-23 14:00:06'),
(7, 1, 'uploads/ai/detect_7.jpg', 'Beagle', 91.20, '2026-02-23 14:00:06'),
(8, 2, 'uploads/ai/detect_8.jpg', 'Maine Coon', 94.70, '2026-02-23 14:00:06'),
(9, 3, 'uploads/ai/detect_9.jpg', 'Shih Tzu', 87.90, '2026-02-23 14:00:06'),
(10, 1, 'uploads/ai/detect_10.jpg', 'Bengal Cat', 96.10, '2026-02-23 14:00:06');

-- --------------------------------------------------------

--
-- Table structure for table `breed_analysis`
--

CREATE TABLE `breed_analysis` (
  `id` int(11) NOT NULL,
  `breed_name` varchar(100) NOT NULL,
  `animal_type` varchar(50) DEFAULT '',
  `food_best` varchar(255) DEFAULT '',
  `food_secondary` varchar(255) DEFAULT '',
  `feeding_frequency` varchar(255) DEFAULT '',
  `vet_checkup` varchar(255) DEFAULT '',
  `dental_care` varchar(255) DEFAULT '',
  `exercise` varchar(255) DEFAULT '',
  `grooming` varchar(255) DEFAULT '',
  `do_1` varchar(255) DEFAULT '',
  `do_2` varchar(255) DEFAULT '',
  `do_3` varchar(255) DEFAULT '',
  `do_4` varchar(255) DEFAULT '',
  `dont_1` varchar(255) DEFAULT '',
  `dont_2` varchar(255) DEFAULT '',
  `dont_3` varchar(255) DEFAULT '',
  `dont_4` varchar(255) DEFAULT '',
  `best_suited` varchar(255) DEFAULT '',
  `climate` varchar(255) DEFAULT '',
  `great_with` varchar(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `breed_analysis`
--

INSERT INTO `breed_analysis` (`id`, `breed_name`, `animal_type`, `food_best`, `food_secondary`, `feeding_frequency`, `vet_checkup`, `dental_care`, `exercise`, `grooming`, `do_1`, `do_2`, `do_3`, `do_4`, `dont_1`, `dont_2`, `dont_3`, `dont_4`, `best_suited`, `climate`, `great_with`) VALUES
(1, 'Abyssinian', 'Cat', 'Royal Canin Abyssinian Adult (Best Choice)', 'Whiskas Active cat food with chicken & fish', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Provide cat trees and climbing spaces', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor environment recommended, moderate temperatures', 'Children, other pets'),
(2, 'American Shorthair', 'Cat', 'Royal Canin American Shorthair Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments or houses, most living situations', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, seniors'),
(3, 'Bengal', 'Cat', 'Royal Canin Bengal Adult (Best Choice)', 'Whiskas Active cat food with chicken & fish', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Provide cat trees and climbing spaces', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor environment recommended, moderate temperatures', 'active individuals, families'),
(4, 'Birman', 'Cat', 'Royal Canin Birman Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, seniors, families'),
(5, 'Bombay', 'Cat', 'Royal Canin Bombay Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses, most living situations', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, families'),
(6, 'British Shorthair', 'Cat', 'Royal Canin British Shorthair Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 15-20 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t force excessive affection', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, seniors'),
(7, 'Egyptian Mau', 'Cat', 'Royal Canin Egyptian Mau Adult (Best Choice)', 'Whiskas Active cat food with chicken & fish', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Interactive play sessions daily', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, families'),
(8, 'Maine Coon', 'Cat', 'Royal Canin Maine Coon Adult (Large Breed)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced protein diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments or houses, most living situations', 'Moderate to cool temperatures preferred', 'Children, other pets, seniors'),
(9, 'Persian', 'Cat', 'Royal Canin Persian Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 15-20 minutes required', 'Grooming: Brush coat daily to prevent matting, clean eyes daily', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Indoor environment recommended, moderate temperatures', 'Children, seniors, families'),
(10, 'Ragdoll', 'Cat', 'Royal Canin Ragdoll Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 15-20 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(11, 'Russian Blue', 'Cat', 'Royal Canin Russian Blue Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Indoor environment recommended, moderate temperatures', 'Children, seniors, families'),
(12, 'Scottishfold', 'Cat', 'Royal Canin Scottishfold Adult (Best Choice)', 'Whiskas Indoor cat food with chicken & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Quiet homes, apartments, seniors', 'Indoor environment recommended, moderate temperatures', 'Children, other pets, seniors'),
(13, 'Siamese', 'Cat', 'Royal Canin Siamese Adult (Best Choice)', 'Whiskas Active cat food with chicken & fish', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Interactive play sessions daily', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor environment recommended, moderate temperatures', 'other pets, families'),
(14, 'Sphinx', 'Cat', 'Royal Canin Sphinx Adult (Best Choice)', 'Whiskas Skin & Coat care with salmon & tuna', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 30-45 minutes required', 'Skin care: Weekly bath, daily moisturizer, sunscreen for outdoors', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Interactive play sessions daily', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor climate-controlled environment essential', 'other pets, families'),
(15, 'Sphynx', 'Cat', 'Royal Canin Sphynx Adult (Best Choice)', 'Whiskas Skin & Coat care with salmon & tuna', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily play/exercise: 30-45 minutes required', 'Skin care: Weekly bath, daily moisturizer, sunscreen for outdoors', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Interactive play sessions daily', 'Avoid overfeeding', 'No chocolate/lilies/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active households with play space', 'Indoor climate-controlled environment essential', 'other pets, families'),
(16, 'Afghan', 'Dog', 'Royal Canin Afghan Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'families'),
(17, 'African Wild Dog', 'Dog', 'Royal Canin African Wild Dog Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 90-120 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'other pets'),
(18, 'Airedale', 'Dog', 'Royal Canin Airedale Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, families'),
(19, 'Akita', 'Dog', 'Royal Canin Akita Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Family homes with yards', 'Cool to moderate temperatures preferred', 'families'),
(20, 'American Hairless', 'Dog', 'Royal Canin American Hairless Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Skin care: Weekly bath, daily moisturizer, sunscreen for outdoors', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Indoor climate-controlled environment essential', 'Children, other pets'),
(21, 'American Spaniel', 'Dog', 'Royal Canin American Spaniel Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Houses with yards, active families', 'Adapts to most climates', 'Children, seniors, families'),
(22, 'Aspin', 'Dog', 'Royal Canin Aspin Adult (Medium)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 40-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'Children, other pets, families'),
(23, 'Basenji', 'Dog', 'Royal Canin Basenji Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'experienced owners'),
(24, 'Basset', 'Dog', 'Royal Canin Basset Adult (Medium)', 'Pedigree Weight Management dry food with chicken & rice', '2 meals/day, controlled calorie diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-40 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Houses with yards, active families', 'Adapts to most climates', 'Children, seniors, families'),
(25, 'Beagle', 'Dog', 'Royal Canin Beagle Adult (Medium)', 'Pedigree Weight Management dry food with chicken & rice', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'Children, families'),
(26, 'Bearded Collie', 'Dog', 'Royal Canin Bearded Collie Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'families'),
(27, 'Bermaise', 'Dog', 'Royal Canin Bermaise Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(28, 'Bernard-Dog Saint', 'Dog', 'Royal Canin Bernard-Dog Saint Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(29, 'Bernese Mountain', 'Dog', 'Royal Canin Bernese Mountain Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(30, 'Bichon Frise', 'Dog', 'Royal Canin Bichon Frise Adult (Mini)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Professional grooming every 4-6 weeks, brush daily', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments or houses with some outdoor access', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(31, 'Blenheim', 'Dog', 'Royal Canin Blenheim Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(32, 'Bloodhound', 'Dog', 'Royal Canin Bloodhound Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Adapts to most climates', 'Children, seniors, families'),
(33, 'Bluetick', 'Dog', 'Royal Canin Bluetick Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, families'),
(34, 'Border Collie', 'Dog', 'Royal Canin Border Collie Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'active individuals, families'),
(35, 'Border-Dog Collie', 'Dog', 'Royal Canin Border-Dog Collie Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'active individuals, families'),
(36, 'Borzoi', 'Dog', 'Royal Canin Borzoi Adult (Maxi)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors'),
(37, 'Boston Terrier', 'Dog', 'Royal Canin Boston Terrier Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Warm to moderate temperatures preferred', 'Children, families'),
(38, 'Boxer', 'Dog', 'Royal Canin Boxer Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, other pets, families'),
(39, 'Bull Mastiff', 'Dog', 'Royal Canin Bull Mastiff Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Family homes with yards', 'Adapts to most climates', 'seniors, families'),
(40, 'Bull Terrier', 'Dog', 'Royal Canin Bull Terrier Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'Children, other pets, families'),
(41, 'Bulldog', 'Dog', 'Royal Canin Bulldog Adult (Medium)', 'Pedigree Weight Management dry food with chicken & rice', '2 meals/day, controlled calorie diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-40 minutes required', 'Grooming: Brush coat 1-2 times weekly, clean skin folds daily', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Houses with yards, active families', 'Adapts to most climates', 'Children, seniors, families'),
(42, 'Bulldong-Dog French', 'Dog', 'Royal Canin Bulldong-Dog French Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly, clean skin folds daily', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Warm to moderate temperatures preferred', 'Children, other pets, families'),
(43, 'Cairn', 'Dog', 'Royal Canin Cairn Adult (Mini)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Adapts to most climates', 'active individuals, families'),
(44, 'Cavalier-Dog Charles-Dog King-Dog Spaniel', 'Dog', 'Royal Canin Cavalier-Dog Charles-Dog King-Dog Spaniel Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(45, 'Chihuahua', 'Dog', 'Royal Canin Chihuahua Adult (X-Small)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth daily, regular dental cleanings', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Indoor climate-controlled environment essential', 'families'),
(46, 'Chinese Crested', 'Dog', 'Royal Canin Chinese Crested Adult (X-Small)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth daily, regular dental cleanings', 'Daily exercise: 20-30 minutes required', 'Skin care: Weekly bath, daily moisturizer, sunscreen for outdoors', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Indoor climate-controlled environment essential', 'Children, other pets, families'),
(47, 'Chow', 'Dog', 'Royal Canin Chow Adult (Maxi)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Family homes with yards', 'Cool to moderate temperatures preferred', 'seniors, families'),
(48, 'Clumber', 'Dog', 'Royal Canin Clumber Adult (Maxi)', 'Pedigree Weight Management dry food with chicken & rice', '2 meals/day, controlled calorie diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Adapts to most climates', 'Children, seniors, families'),
(49, 'Coated-Dog Flat-Dog Retriever', 'Dog', 'Royal Canin Coated-Dog Flat-Dog Retriever Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, families'),
(50, 'Cockapoo', 'Dog', 'Royal Canin Cockapoo Adult (Mini)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Professional grooming every 4-6 weeks, brush daily', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Adapts to most climates', 'Children, other pets, families'),
(51, 'Cocker', 'Dog', 'Royal Canin Cocker Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Houses with yards, active families', 'Adapts to most climates', 'Children, seniors'),
(52, 'Collie', 'Dog', 'Royal Canin Collie Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(53, 'Corgi', 'Dog', 'Royal Canin Corgi Adult (Mini)', 'Pedigree Weight Management dry food with chicken & rice', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Cool to moderate temperatures preferred', 'Children, other pets, families'),
(54, 'Coyote', 'Dog', 'Royal Canin Coyote Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 2-3 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'other pets'),
(55, 'Dachshund', 'Dog', 'Royal Canin Dachshund Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No forceful training methods', 'Apartments, small homes, seniors', 'Warm to moderate temperatures preferred', 'families'),
(56, 'Dalmatian', 'Dog', 'Royal Canin Dalmatian Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 90-120 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Active families with large yards', 'Adapts to most climates', 'Children, other pets'),
(57, 'Dhole', 'Dog', 'Royal Canin Dhole Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'other pets'),
(58, 'Dingo', 'Dog', 'Royal Canin Dingo Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'experienced owners'),
(59, 'Doberman', 'Dog', 'Royal Canin Doberman Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'families'),
(60, 'Doberman-Dog Pinscher', 'Dog', 'Royal Canin Doberman-Dog Pinscher Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'families'),
(61, 'Elk Hound', 'Dog', 'Royal Canin Elk Hound Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Cool to moderate temperatures preferred', 'Children, families'),
(62, 'French Bulldog', 'Dog', 'Royal Canin French Bulldog Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 1-2 times weekly, clean skin folds daily', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Warm to moderate temperatures preferred', 'Children, other pets, families'),
(63, 'German Sheperd', 'Dog', 'Royal Canin German Sheperd Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Cool to moderate temperatures preferred', 'families'),
(64, 'German-Dog Sheperd', 'Dog', 'Royal Canin German-Dog Sheperd Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Cool to moderate temperatures preferred', 'families'),
(65, 'Golden Retriever', 'Dog', 'Royal Canin Golden Retriever Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'Children, families'),
(66, 'Golden-Dog Retriever', 'Dog', 'Royal Canin Golden-Dog Retriever Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'Children, families'),
(67, 'Great Dane', 'Dog', 'Royal Canin Great Dane Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Adapts to most climates', 'Children, seniors, families'),
(68, 'Great Perenees', 'Dog', 'Royal Canin Great Perenees Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors'),
(69, 'Greyhound', 'Dog', 'Royal Canin Greyhound Adult (Maxi)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training or punishment', 'Family homes with yards', 'Adapts to most climates', 'Children, seniors'),
(70, 'Groenendael', 'Dog', 'Royal Canin Groenendael Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Moderate to cool temperatures preferred', 'families'),
(71, 'Havanese', 'Dog', 'Royal Canin Havanese Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(72, 'Husky-Dog Siberian', 'Dog', 'Royal Canin Husky-Dog Siberian Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Cool to moderate temperatures preferred', 'Children, other pets, families'),
(73, 'Irish Spaniel', 'Dog', 'Royal Canin Irish Spaniel Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Professional grooming every 4-6 weeks, brush daily', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, other pets');
INSERT INTO `breed_analysis` (`id`, `breed_name`, `animal_type`, `food_best`, `food_secondary`, `feeding_frequency`, `vet_checkup`, `dental_care`, `exercise`, `grooming`, `do_1`, `do_2`, `do_3`, `do_4`, `dont_1`, `dont_2`, `dont_3`, `dont_4`, `best_suited`, `climate`, `great_with`) VALUES
(74, 'Irish Wolfhound', 'Dog', 'Royal Canin Irish Wolfhound Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Adapts to most climates', 'Children, seniors'),
(75, 'Japanese Spaniel', 'Dog', 'Royal Canin Japanese Spaniel Adult (X-Small)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'families'),
(76, 'Komondor', 'Dog', 'Royal Canin Komondor Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'families'),
(77, 'Labradoodle', 'Dog', 'Royal Canin Labradoodle Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Professional grooming every 4-6 weeks, brush daily', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, families'),
(78, 'Labrador', 'Dog', 'Royal Canin Labrador Adult (Maxi)', 'Pedigree Weight Management dry food with chicken & rice', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Active families with large yards', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(79, 'Labrador-Dog Retriever', 'Dog', 'Royal Canin Labrador-Dog Retriever Adult (Maxi)', 'Pedigree Weight Management dry food with chicken & rice', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Active families with large yards', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(80, 'Lhasa', 'Dog', 'Royal Canin Lhasa Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'families'),
(81, 'Malinois', 'Dog', 'Royal Canin Malinois Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 90-120 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'experienced owners'),
(82, 'Maltese', 'Dog', 'Royal Canin Maltese Adult (X-Small)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth daily, regular dental cleanings', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, seniors, families'),
(83, 'Mex Hairless', 'Dog', 'Royal Canin Mex Hairless Adult (Medium)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 40-60 minutes required', 'Skin care: Weekly bath, daily moisturizer, sunscreen for outdoors', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Indoor climate-controlled environment essential', 'seniors, families'),
(84, 'Miniature-Dog Schnauzer', 'Dog', 'Royal Canin Miniature-Dog Schnauzer Adult (Mini)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Adapts to most climates', 'Children, families'),
(85, 'Newfoundland', 'Dog', 'Royal Canin Newfoundland Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(86, 'Pekinese', 'Dog', 'Royal Canin Pekinese Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'families'),
(87, 'Pit Bull', 'Dog', 'Royal Canin Pit Bull Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'Children, families'),
(88, 'Pomeranian', 'Dog', 'Royal Canin Pomeranian Adult (X-Small)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth daily, regular dental cleanings', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Cool to moderate temperatures preferred', 'Children, other pets'),
(89, 'Poodle', 'Dog', 'Royal Canin Poodle Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Professional grooming every 4-6 weeks, brush daily', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'active individuals, families'),
(90, 'Pug', 'Dog', 'Royal Canin Pug Adult (Mini)', 'Pedigree Weight Management dry food with chicken & rice', '2-3 meals/day, controlled calorie diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat 1-2 times weekly, clean eyes daily', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Warm to moderate temperatures preferred', 'active individuals, families'),
(91, 'Rhodesian', 'Dog', 'Royal Canin Rhodesian Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-90 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Active families with large yards', 'Adapts to most climates', 'families'),
(92, 'Rottweiler', 'Dog', 'Royal Canin Rottweiler Adult (Maxi)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Family homes with yards', 'Adapts to most climates', 'seniors, families'),
(93, 'Saint Bernard', 'Dog', 'Royal Canin Saint Bernard Adult (Giant)', 'Pedigree Large Breed dry food with chicken & rice', '2 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Family homes with yards', 'Moderate to cool temperatures preferred', 'Children, seniors, families'),
(94, 'Schnauzer', 'Dog', 'Royal Canin Schnauzer Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'Children, families'),
(95, 'Scotch Terrier', 'Dog', 'Royal Canin Scotch Terrier Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Hand-strip coat every 6-8 weeks, brush weekly', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'experienced owners'),
(96, 'Shar Pei', 'Dog', 'Royal Canin Shar Pei Adult (Medium)', 'Pedigree Adult dry food with chicken & vegetables', '2 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 40-60 minutes required', 'Grooming: Brush coat 1-2 times weekly, clean skin folds daily, clean eyes daily', 'Provide mental stimulation', 'Respect their independent nature', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t force excessive affection', 'No harsh training methods', 'Houses with yards, active families', 'Adapts to most climates', 'seniors, families'),
(97, 'Sheepdog-Dog Shetland', 'Dog', 'Royal Canin Sheepdog-Dog Shetland Adult (Mini)', 'Pedigree Active adult dry food with chicken & vegetables', '3-4 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 45-60 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments or houses with some outdoor access', 'Adapts to most climates', 'Children, other pets, families'),
(98, 'Shiba Inu', 'Dog', 'Royal Canin Shiba Inu Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 60-75 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Cool to moderate temperatures preferred', 'active individuals, families'),
(99, 'Shih-Dog Tzu', 'Dog', 'Royal Canin Shih-Dog Tzu Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, families'),
(100, 'Shih-Tzu', 'Dog', 'Royal Canin Shih-Tzu Adult (Mini)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 3 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 30-45 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'Children, other pets, families'),
(101, 'Siberian Husky', 'Dog', 'Royal Canin Siberian Husky Adult (Medium)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 75-90 minutes required', 'Grooming: Brush coat 3-4 times weekly, heavy seasonal shedding', 'Provide plenty of mental stimulation', 'Socialize early and often', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Houses with yards, active families', 'Cool to moderate temperatures preferred', 'Children, other pets, families'),
(102, 'Vizsla', 'Dog', 'Royal Canin Vizsla Adult (Maxi)', 'Pedigree Active adult dry food with chicken & vegetables', '2-3 meals/day, high protein diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth 2-3 times per week', 'Daily exercise: 90-120 minutes required', 'Grooming: Brush coat 1-2 times weekly', 'Provide plenty of mental stimulation', 'Socialize early', 'Give fresh water always', 'Daily vigorous exercise sessions', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training or punishment', 'Active families with large yards', 'Adapts to most climates', 'Children, seniors, families'),
(103, 'Yorkie', 'Dog', 'Royal Canin Yorkie Adult (X-Small)', 'Pedigree Small Breed dry food with lamb & vegetables', '2-3 meals/day, balanced diet', 'Regular vet checkups every 6 months', 'Dental care: Brush teeth daily, regular dental cleanings', 'Daily exercise: 20-30 minutes required', 'Grooming: Brush coat daily to prevent matting', 'Provide mental stimulation', 'Socialize early', 'Give fresh water always', 'Regular play time', 'Avoid overfeeding', 'No chocolate/grapes/onions', 'Don\'t leave alone for long periods', 'No harsh training methods', 'Apartments, small homes, seniors', 'Adapts to most climates', 'families');

-- --------------------------------------------------------

--
-- Table structure for table `buyer_pets`
--

CREATE TABLE `buyer_pets` (
  `pet_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `pet_name` varchar(100) NOT NULL,
  `species` varchar(50) DEFAULT '',
  `breed` varchar(100) DEFAULT '',
  `age` varchar(50) DEFAULT '',
  `gender` varchar(20) DEFAULT '',
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `vaccination_cert` varchar(255) DEFAULT NULL,
  `health_cert` varchar(255) DEFAULT NULL,
  `license_cert` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buyer_pets`
--

INSERT INTO `buyer_pets` (`pet_id`, `buyer_id`, `pet_name`, `species`, `breed`, `age`, `gender`, `description`, `image_url`, `vaccination_cert`, `health_cert`, `license_cert`, `created_at`) VALUES
(1, 2, 'buddy', 'dog', 'golden retriever', '2 years', 'male', 'good', 'uploads/buyer_pets/pet_2_1772856808.jpg', NULL, NULL, NULL, '2026-03-07 04:13:28'),
(2, 19, 'bud', 'dog', 'pug', '3', 'male', 'good pet', 'uploads/buyer_pets/pet_19_1773025043.jpg', NULL, NULL, NULL, '2026-03-09 02:57:23');

-- --------------------------------------------------------

--
-- Table structure for table `buyer_profiles`
--

CREATE TABLE `buyer_profiles` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `preferences` text DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `buyer_profiles`
--

INSERT INTO `buyer_profiles` (`profile_id`, `user_id`, `preferences`, `upi_id`) VALUES
(1, 1, NULL, '8985545407@fam'),
(2, 2, NULL, '8985545407@fam'),
(3, 3, NULL, '8985545407@fam'),
(4, 11, NULL, NULL),
(11, 19, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `certificate_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `certificate_type` enum('VACCINATION','HEALTH','LICENSE') NOT NULL,
  `certificate_file` varchar(255) NOT NULL,
  `issued_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`certificate_id`, `pet_id`, `issued_by`, `certificate_type`, `certificate_file`, `issued_date`, `expiry_date`, `notes`, `created_at`) VALUES
(1, 1, 7, 'VACCINATION', 'uploads/certs/cert_1.pdf', '2025-06-15', '2026-06-15', 'Rabies vaccination complete', '2026-02-23 14:00:06'),
(2, 2, 8, 'HEALTH', 'uploads/certs/cert_2.pdf', '2025-07-20', '2026-07-20', 'General health check passed', '2026-02-23 14:00:06'),
(3, 3, 7, 'VACCINATION', 'uploads/certs/cert_3.pdf', '2025-05-10', '2026-05-10', 'Parvo & Distemper combo', '2026-02-23 14:00:06'),
(4, 4, 8, 'HEALTH', 'uploads/certs/cert_4.pdf', '2025-08-01', '2026-08-01', 'FIV/FeLV negative', '2026-02-23 14:00:06'),
(5, 5, 7, 'VACCINATION', 'uploads/certs/cert_5.pdf', '2025-09-12', '2026-09-12', 'DHPP vaccination', '2026-02-23 14:00:06'),
(6, 6, 8, 'LICENSE', 'uploads/certs/cert_6.pdf', '2025-04-05', '2027-04-05', 'Municipal pet license', '2026-02-23 14:00:06'),
(7, 7, 7, 'VACCINATION', 'uploads/certs/cert_7.pdf', '2025-10-18', '2026-10-18', 'Rabies + Bordetella', '2026-02-23 14:00:06'),
(8, 8, 8, 'HEALTH', 'uploads/certs/cert_8.pdf', '2025-11-22', '2026-11-22', 'Deworming completed', '2026-02-23 14:00:06'),
(9, 9, 7, 'LICENSE', 'uploads/certs/cert_9.pdf', '2025-03-30', '2027-03-30', 'City registration license', '2026-02-23 14:00:06'),
(10, 10, 8, 'VACCINATION', 'uploads/certs/cert_10.pdf', '2025-12-01', '2026-12-01', 'FVRCP vaccine for cats', '2026-02-23 14:00:06'),
(11, 7, 7, 'HEALTH', 'uploads/certificates/health certificate_cert_5_1771865612.pdf', '2026-02-23', NULL, 'Appointment ID: 5', '2026-02-23 16:53:32'),
(12, 7, 7, 'HEALTH', '', '2026-02-23', NULL, 'Type: Health Certificate\nIssued: 2026-02-23\nValidity: 1\nDoctor ID: 7\nPet ID: 7\nRemarks: none', '2026-02-23 16:53:32'),
(13, 7, 7, 'HEALTH', 'uploads/certificates/health certificate_cert_5_1771865775.pdf', '2026-02-23', NULL, 'Appointment ID: 5', '2026-02-23 16:56:15'),
(14, 7, 7, 'HEALTH', '', '2026-02-23', NULL, 'Type: Health Certificate\nIssued: 2026-02-23\nValidity: 1\nDoctor ID: 7\nPet ID: 7\nRemarks: none', '2026-02-23 16:56:15'),
(16, 12, NULL, 'VACCINATION', 'uploads/certificates/vaccination_cert_12_1773029344.pdf', '2026-03-09', NULL, NULL, '2026-03-09 04:09:04'),
(17, 13, NULL, 'VACCINATION', 'uploads/certificates/vacc_cert_13_1773039695.pdf', '2026-03-09', NULL, NULL, '2026-03-09 07:01:35'),
(18, 14, NULL, 'VACCINATION', 'uploads/certificates/vaccination_cert_14_1773042970.pdf', '2026-03-09', NULL, NULL, '2026-03-09 07:56:10'),
(19, 12, 21, 'VACCINATION', 'uploads/certificates/vaccination certificate_cert_19_1773117640.pdf', '2026-03-10', NULL, 'Appointment ID: 19', '2026-03-10 04:40:40'),
(20, 12, 21, 'VACCINATION', '', '2026-03-10', NULL, 'Type: Vaccination Certificate\nIssued: 2026-03-10\nValidity: \nDoctor ID: 21\nPet ID: 12', '2026-03-10 04:40:40'),
(21, 12, 21, 'VACCINATION', 'uploads/certificates/vaccination certificate_cert_19_1773117648.pdf', '2026-03-10', NULL, 'Appointment ID: 19', '2026-03-10 04:40:48'),
(22, 12, 21, 'VACCINATION', '', '2026-03-10', NULL, 'Type: Vaccination Certificate\nIssued: 2026-03-10\nValidity: \nDoctor ID: 21\nPet ID: 12', '2026-03-10 04:40:48'),
(23, 1, 21, 'HEALTH', 'uploads/certificates/health certificate_cert_20_1773126994.pdf', '2026-03-10', NULL, 'Appointment ID: 20', '2026-03-10 07:16:34'),
(24, 1, 21, 'HEALTH', '', '2026-03-10', NULL, 'Type: Health Certificate\nIssued: 2026-03-10\nValidity: 1\nDoctor ID: 21\nPet ID: 1\nRemarks: no remarks', '2026-03-10 07:16:35'),
(25, 12, 21, 'HEALTH', 'uploads/certificates/health certificate_cert_21_1773130271.pdf', '2026-03-10', NULL, 'Appointment ID: 21', '2026-03-10 08:11:11'),
(26, 12, 21, 'HEALTH', '', '2026-03-10', NULL, 'Type: Health Certificate\nIssued: 2026-03-10\nValidity: 1\nDoctor ID: 21\nPet ID: 12\nRemarks: good', '2026-03-10 08:11:11'),
(27, 12, 21, 'HEALTH', 'uploads/certificates/health certificate_cert_22_1773131410.pdf', '2026-03-10', NULL, 'Appointment ID: 22', '2026-03-10 08:30:10'),
(28, 12, 21, 'HEALTH', '', '2026-03-10', NULL, 'Type: Health Certificate\nIssued: 2026-03-10\nValidity: 1\nDoctor ID: 21\nPet ID: 12\nRemarks: gooood', '2026-03-10 08:30:10'),
(29, 1, 21, 'VACCINATION', '', '2026-03-13', NULL, 'Type: Vaccination Certificate\nIssued: 2026-03-13\nValidity: \nDoctor ID: 21\nPet ID: 1', '2026-03-13 07:50:31'),
(30, 1, 21, 'VACCINATION', '', '2026-03-13', NULL, 'Type: Vaccination Certificate\nIssued: 2026-03-13\nValidity: \nDoctor ID: 21\nPet ID: 1', '2026-03-13 07:50:34'),
(31, 15, NULL, 'VACCINATION', 'uploads/certificates/vacc_cert_15_1773631686.pdf', '2026-03-16', NULL, NULL, '2026-03-16 03:28:06'),
(32, 16, NULL, 'VACCINATION', 'uploads/certificates/vacc_cert_16_1773631917.pdf', '2026-03-16', NULL, NULL, '2026-03-16 03:31:57'),
(33, 17, NULL, 'VACCINATION', 'uploads/certificates/vacc_cert_17_1773716695.pdf', '2026-03-17', NULL, NULL, '2026-03-17 03:04:55'),
(34, 18, NULL, 'VACCINATION', 'uploads/certificates/vacc_cert_18_1773812154.pdf', '2026-03-18', NULL, NULL, '2026-03-18 05:35:54');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text DEFAULT NULL,
  `message_type` enum('text','image','file') DEFAULT 'text',
  `media_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `is_delivered` tinyint(1) DEFAULT 1,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `timestamp` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`message_id`, `sender_id`, `receiver_id`, `message_text`, `message_type`, `media_url`, `file_name`, `is_read`, `is_delivered`, `sent_at`, `timestamp`) VALUES
(1, 1, 4, 'Hi, is Bruno still available?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(2, 4, 1, 'Yes! Bruno is available. Would you like to visit?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(3, 1, 4, 'Can you share more photos?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(4, 2, 5, 'What is the price for Max?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(5, 5, 2, 'Max is priced at Rs 13000. Negotiable.', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(6, 3, 6, 'Is Charlie vaccinated?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(7, 6, 3, 'Yes, fully vaccinated with certificate.', 'text', NULL, NULL, 0, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(8, 2, 4, 'Can I visit to see Rocky this weekend?', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(9, 1, 5, 'Do you deliver pets to Anna Nagar?', 'text', NULL, NULL, 0, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(10, 5, 1, 'Yes we can arrange delivery within Chennai.', 'text', NULL, NULL, 1, 1, '2026-02-23 14:00:06', '2026-02-23 19:30:06'),
(11, 19, 21, 'Hi', 'text', NULL, NULL, 1, 1, '2026-03-10 12:09:05', '2026-03-10 17:39:05'),
(12, 19, 5, 'hi', 'text', NULL, NULL, 0, 1, '2026-03-16 11:57:23', '2026-03-16 17:27:23'),
(13, 19, 5, 'Hi', 'text', NULL, NULL, 0, 1, '2026-03-18 05:11:10', '2026-03-18 10:41:10'),
(14, 19, 21, 'Hi', 'text', NULL, NULL, 0, 1, '2026-03-18 05:11:25', '2026-03-18 10:41:25'),
(15, 19, 23, 'Hi', 'text', NULL, NULL, 0, 1, '2026-03-18 05:11:55', '2026-03-18 10:41:55');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_addresses`
--

CREATE TABLE `delivery_addresses` (
  `address_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `label` varchar(50) DEFAULT 'Home',
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line1` varchar(255) DEFAULT NULL,
  `address_line2` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `is_default` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_addresses`
--

INSERT INTO `delivery_addresses` (`address_id`, `user_id`, `label`, `full_name`, `phone`, `address_line1`, `address_line2`, `city`, `state`, `pincode`, `is_default`, `created_at`) VALUES
(1, 1, 'Home', 'Timmareddy Prem Kumar Reddy', '8985545407', 'pedda jonnavaram, Duvvur', '', 'kadapa', 'Andhra Pradesh', '516175', 1, '2026-03-02 08:35:57'),
(2, 2, 'Other', 'rohan mehta', '9825646491', 'saveetha nagar, poonamalle, Chennai', 'saveetha Institute of Medical and Technical Sciences', 'chennai', 'Tamil Nadu', '600056', 1, '2026-03-07 03:52:26'),
(3, 19, 'Office', 'nikhill Nandan', '9398286428', 'saveetha Institute of Medical and Technical Sciences', '', 'chennai', 'Tamil Nadu', '600056', 1, '2026-03-07 08:17:55'),
(4, 19, 'Home', 'nikhill Nandan', '9398286428', 'chembarambakam', '', 'chennai', 'Tamil Nadu', '60001', 0, '2026-03-13 04:43:19');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_appointments`
--

CREATE TABLE `doctor_appointments` (
  `appointment_id` int(11) NOT NULL,
  `pet_id` int(11) DEFAULT NULL,
  `pet_source` enum('purchased','manual','market') DEFAULT 'purchased',
  `doctor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `booking_time` varchar(20) DEFAULT NULL,
  `service_name` varchar(255) DEFAULT NULL,
  `visit_type` varchar(20) DEFAULT 'clinic',
  `base_amount` decimal(10,2) DEFAULT 0.00,
  `consultation_status` enum('BOOKED','COMPLETED','CANCELLED','CONFIRMED','ACCEPTED','DONE','PAID','REJECTED','PENDING') DEFAULT 'BOOKED',
  `treatment_notes` text DEFAULT NULL,
  `treatment_charge` decimal(10,2) DEFAULT NULL,
  `payment_method` varchar(20) DEFAULT 'CASH',
  `payment_status` enum('PENDING','PAID') DEFAULT 'PENDING',
  `extra_paid_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `extra_payment_status` varchar(20) DEFAULT 'PENDING'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_appointments`
--

INSERT INTO `doctor_appointments` (`appointment_id`, `pet_id`, `pet_source`, `doctor_id`, `user_id`, `appointment_date`, `booking_time`, `service_name`, `visit_type`, `base_amount`, `consultation_status`, `treatment_notes`, `treatment_charge`, `payment_method`, `payment_status`, `extra_paid_amount`, `created_at`, `extra_payment_status`) VALUES
(1, 1, 'purchased', 7, 1, '2026-02-25 10:00:00', '10:00 AM', 'General Checkup', 'clinic', 0.00, 'CANCELLED', '', 500.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(2, 2, 'purchased', 8, 1, '2026-02-25 11:30:00', '11:30 AM', 'Wellness Exam', 'clinic', 0.00, 'BOOKED', NULL, 600.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(3, 3, 'purchased', 7, 2, '2026-02-26 09:00:00', '09:00 AM', 'Surgery Consult', 'clinic', 0.00, 'CANCELLED', '', 1500.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(4, 5, 'purchased', 8, 2, '2026-02-26 14:00:00', '02:00 PM', 'Deworming', 'home', 0.00, 'BOOKED', NULL, 400.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(5, 7, 'purchased', 7, 3, '2026-02-27 10:30:00', '10:30 AM', 'Vaccination', 'clinic', 0.00, 'COMPLETED', NULL, 800.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(6, 1, 'purchased', 7, 1, '2026-01-15 10:00:00', '10:00 AM', 'Dental Cleaning', 'clinic', 0.00, 'COMPLETED', NULL, 2000.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(7, 4, 'purchased', 8, 2, '2026-01-20 15:00:00', '03:00 PM', 'Skin Treatment', 'clinic', 0.00, 'COMPLETED', NULL, 1200.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(8, 6, 'purchased', 7, 3, '2026-01-25 11:00:00', '11:00 AM', 'Emergency Care', 'home', 0.00, 'COMPLETED', NULL, 3000.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(9, 8, 'purchased', 8, 1, '2026-02-01 09:30:00', '09:30 AM', 'Blood Work', 'clinic', 0.00, 'COMPLETED', NULL, 1000.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(10, 5, 'purchased', 7, 3, '2026-02-10 16:00:00', '04:00 PM', 'General Checkup', 'home', 0.00, 'CANCELLED', NULL, 500.00, 'CASH', 'PENDING', 0.00, '2026-02-23 14:00:06', 'PENDING'),
(11, 2, 'purchased', 7, 1, '2026-03-02 09:00:00', '09:00 AM', 'General Checkup, Vaccination', 'clinic', 0.00, 'BOOKED', NULL, 800.00, 'CASH', 'PENDING', 0.00, '2026-03-01 14:31:35', 'PENDING'),
(12, 1, 'purchased', 7, 1, '2026-03-05 14:00:00', '02:00 PM', 'General Checkup, Vaccination', 'clinic', 0.00, 'BOOKED', NULL, 800.00, 'CASH', 'PENDING', 0.00, '2026-03-05 06:47:27', 'PENDING'),
(13, 1, 'purchased', 7, 1, '2026-03-07 11:30:00', '11:30 AM', 'General Checkup', 'clinic', 0.00, 'BOOKED', NULL, 500.00, 'CASH', 'PENDING', 0.00, '2026-03-07 05:02:02', 'PENDING'),
(14, 1, 'purchased', 7, 1, '2026-03-09 09:30:00', '09:30 AM', 'General Checkup', 'clinic', 0.00, 'BOOKED', NULL, 500.00, 'CASH', 'PENDING', 0.00, '2026-03-07 07:34:48', 'PENDING'),
(15, 11, 'purchased', 7, 19, '2026-03-09 10:30:00', '10:30 AM', 'General Checkup', 'clinic', 0.00, 'BOOKED', NULL, 500.00, 'CASH', 'PENDING', 0.00, '2026-03-09 03:30:24', 'PENDING'),
(16, 1, 'manual', 7, 19, '2026-03-09 15:30:00', '03:30 PM', 'Dental Cleaning', 'home', 0.00, 'BOOKED', NULL, 1100.00, 'CASH', 'PENDING', 0.00, '2026-03-09 04:29:58', 'PENDING'),
(17, 12, '', 7, 20, '2026-03-11 14:30:00', '02:30 PM', 'General Checkup', 'clinic', 0.00, 'BOOKED', NULL, 500.00, 'CASH', 'PENDING', 500.00, '2026-03-09 07:52:16', 'PENDING'),
(18, 1, 'manual', 7, 19, '2026-03-11 11:00:00', '11:00 AM', 'General Checkup', 'clinic', 0.00, 'BOOKED', NULL, 500.00, 'CASH', 'PENDING', 0.00, '2026-03-09 09:14:55', 'PENDING'),
(19, 12, '', 21, 20, '2026-03-12 14:30:00', '02:30 PM', 'General Checkup', 'clinic', 0.00, 'COMPLETED', NULL, 400.00, 'CASH', 'PENDING', 200.00, '2026-03-09 10:45:32', 'PENDING'),
(20, 1, 'manual', 21, 19, '2026-03-10 14:30:00', '02:30 PM', 'Vaccination', 'clinic', 300.00, 'COMPLETED', NULL, 100.00, 'CASH', 'PENDING', 100.00, '2026-03-10 06:41:47', 'CONFIRMED'),
(21, 12, 'purchased', 21, 19, '2026-03-10 15:00:00', '03:00 PM', 'General Checkup', 'clinic', 500.00, 'COMPLETED', NULL, 100.00, 'CASH', 'PENDING', 600.00, '2026-03-10 08:08:25', 'CONFIRMED'),
(22, 12, 'purchased', 21, 19, '2026-03-10 14:30:00', '02:30 PM', 'General Checkup', 'clinic', 500.00, 'COMPLETED', NULL, 100.00, 'CASH', 'PENDING', 600.00, '2026-03-10 08:28:12', 'CONFIRMED'),
(23, 1, 'manual', 21, 19, '2026-03-11 15:00:00', '03:00 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 100.00, 'CASH', 'PENDING', 600.00, '2026-03-11 08:43:23', 'PENDING'),
(24, 1, 'manual', 21, 19, '2026-03-18 10:00:00', '10:00 AM', 'General Checkup', 'clinic', 500.00, 'COMPLETED', NULL, 100.00, 'CASH', 'PENDING', 600.00, '2026-03-13 04:15:07', 'CONFIRMED'),
(25, 12, '', 21, 20, '2026-03-13 14:30:00', '02:30 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-13 07:35:47', 'PENDING'),
(26, 1, 'manual', 21, 19, '2026-03-17 09:30:00', '09:30 AM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-13 08:13:21', 'PENDING'),
(27, 14, '', 21, 20, '2026-03-13 15:00:00', '03:00 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-13 08:38:24', 'PENDING'),
(28, 1, 'manual', 21, 19, '2026-03-14 14:30:00', '02:30 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-14 07:48:15', 'PENDING'),
(29, 1, 'manual', 21, 19, '2026-03-14 15:00:00', '03:00 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-14 07:48:41', 'PENDING'),
(30, 12, 'purchased', 21, 19, '2026-03-16 09:30:00', '09:30 AM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 100.00, 'CASH', 'PENDING', 0.00, '2026-03-16 02:51:33', 'CONFIRMED'),
(31, 15, '', 21, 23, '2026-03-16 14:00:00', '02:00 PM', 'General Checkup', 'clinic', 500.00, 'CONFIRMED', NULL, 0.00, 'CASH', 'PENDING', 0.00, '2026-03-16 03:33:21', 'CONFIRMED'),
(32, 15, 'purchased', 8, 23, '2026-03-17 14:00:00', '02:00 PM', 'General Consultation', 'CLINIC', 800.00, 'BOOKED', NULL, 0.00, 'UPI', 'PAID', 0.00, '2026-03-16 12:06:45', 'PENDING'),
(33, 1, 'manual', 21, 19, '2026-03-17 10:00:00', '10:00 AM', 'General Checkup', 'clinic', 500.00, 'CONFIRMED', NULL, 0.00, 'CASH', 'PENDING', 0.00, '2026-03-17 03:19:30', 'PENDING'),
(34, 15, 'purchased', 21, 19, '2026-03-18 11:30:00', '11:30 AM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', NULL, 0.00, 'CASH', 'PENDING', 0.00, '2026-03-18 05:10:01', 'PENDING'),
(35, 16, 'purchased', 24, 19, '2026-03-18 14:00:00', '02:00 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-18 05:30:53', 'PENDING'),
(36, 15, 'purchased', 24, 19, '2026-03-18 15:30:00', '03:30 PM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', '', 0.00, 'CASH', 'PENDING', 0.00, '2026-03-18 09:10:20', 'PENDING'),
(37, 1, 'manual', 21, 19, '2026-03-19 09:00:00', '09:00 AM', 'General Checkup', 'clinic', 500.00, 'CANCELLED', NULL, 0.00, 'CASH', 'PENDING', 0.00, '2026-03-19 02:57:02', 'PENDING'),
(38, 17, 'purchased', 21, 19, '2026-03-19 15:30:00', '03:30 PM', 'General Checkup', 'clinic', 500.00, 'BOOKED', NULL, 0.00, 'CASH', 'PENDING', 0.00, '2026-03-19 09:02:07', 'PENDING');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_profiles`
--

CREATE TABLE `doctor_profiles` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `hospital` varchar(255) DEFAULT NULL,
  `languages` varchar(255) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_profiles`
--

INSERT INTO `doctor_profiles` (`profile_id`, `user_id`, `qualification`, `specialization`, `experience`, `hospital`, `languages`, `upi_id`) VALUES
(1, 7, 'MVSc', 'Surgery', 7, 'Chennai Vet Hospital', 'English, Tamil, Hindi', '8985545407@fam'),
(2, 8, 'BVSc', 'General Practice', 4, 'Guindy Animal Clinic', 'English, Tamil', '8985545407@fam'),
(3, 21, 'BVSc', 'Orthopedics', NULL, NULL, NULL, 'manukondatarun5@oksbi'),
(4, 24, 'BVSc', 'Small Animal Medicine', 0, '', '', 'nikhill.nandan@ybl');

-- --------------------------------------------------------

--
-- Table structure for table `doctor_services`
--

CREATE TABLE `doctor_services` (
  `service_id` int(11) NOT NULL,
  `doctor_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `doctor_services`
--

INSERT INTO `doctor_services` (`service_id`, `doctor_id`, `service_name`, `description`, `price`, `duration`, `created_at`) VALUES
(1, 7, 'General Checkup', 'Complete physical examination', 500.00, '30 min', '2026-02-23 14:00:06'),
(2, 7, 'Vaccination', 'Core vaccines for dogs and cats', 800.00, '20 min', '2026-02-23 14:00:06'),
(3, 7, 'Surgery Consult', 'Pre-surgical evaluation', 1500.00, '45 min', '2026-02-23 14:00:06'),
(4, 7, 'Dental Cleaning', 'Professional teeth cleaning', 2000.00, '60 min', '2026-02-23 14:00:06'),
(5, 7, 'Emergency Care', 'Urgent medical attention', 3000.00, '60 min', '2026-02-23 14:00:06'),
(6, 8, 'Wellness Exam', 'Annual wellness screening', 600.00, '30 min', '2026-02-23 14:00:06'),
(7, 8, 'Deworming', 'Internal parasite treatment', 400.00, '15 min', '2026-02-23 14:00:06'),
(8, 8, 'Skin Treatment', 'Dermatological exam and treatment', 1200.00, '40 min', '2026-02-23 14:00:06'),
(9, 8, 'X-Ray', 'Digital radiography', 1800.00, '30 min', '2026-02-23 14:00:06'),
(10, 8, 'Blood Work', 'Complete blood panel analysis', 1000.00, '20 min', '2026-02-23 14:00:06');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'system' COMMENT 'appointment, order, booking, chat, certificate, review, system',
  `reference_id` int(11) DEFAULT NULL COMMENT 'ID of related entity',
  `data` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`notification_id`, `user_id`, `title`, `message`, `type`, `reference_id`, `data`, `is_read`, `created_at`) VALUES
(1, 1, 'Appointment Confirmed', 'Your appointment with Dr. Ramesh on Feb 25 is confirmed.', 'appointment', 1, NULL, 1, '2026-02-23 14:00:06'),
(2, 2, 'Booking Confirmed', 'Your spa booking at Pawsome Spa is confirmed.', 'booking', 2, NULL, 0, '2026-02-23 14:00:06'),
(3, 7, 'New Appointment', 'Ananya has booked a General Checkup on Feb 25.', 'appointment', 1, NULL, 1, '2026-02-23 14:00:06'),
(4, 9, 'New Spa Booking', 'Rohan has booked Grooming Deluxe at your spa.', 'booking', 2, NULL, 0, '2026-02-23 14:00:06'),
(5, 4, 'New Message', 'You have a new message from Ananya about Bruno.', 'chat', 1, NULL, 1, '2026-02-23 14:00:06'),
(6, 1, 'Pet Listed', 'Simba (Bengal) has been newly listed by Vikram Pets.', 'pet', 10, NULL, 1, '2026-02-23 14:00:06'),
(7, 3, 'Payment Success', 'Payment of Rs 800 for Charlie grooming is successful.', 'payment', 5, NULL, 0, '2026-02-23 14:00:06'),
(8, 8, 'Appointment Cancelled', 'Priya cancelled the General Checkup appointment.', 'appointment', 10, NULL, 0, '2026-02-23 14:00:06'),
(9, 10, 'Spa Review', 'Ananya left a 5 star review for Happy Tails Spa.', 'review', 1, NULL, 0, '2026-02-23 14:00:06'),
(10, 2, 'Welcome!', 'Welcome to Petnexa! Explore pets, doctors, and spas nearby.', 'system', NULL, NULL, 1, '2026-02-23 14:00:06'),
(11, 3, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 12, NULL, 0, '2026-02-23 16:53:32'),
(12, 3, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 14, NULL, 0, '2026-02-23 16:56:15'),
(13, 1, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 1, NULL, 1, '2026-02-23 17:07:24'),
(14, 2, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 3, NULL, 0, '2026-02-23 17:07:40'),
(15, 1, 'New Spa Booking!', 'New booking for Flea Treatment on Mon 02 Mar, 09:00 AM', 'booking', 13, NULL, 1, '2026-03-01 14:21:45'),
(16, 1, 'New Spa Booking!', 'New booking for Flea Treatment on Mon 02 Mar, 09:00 AM', 'booking', 14, NULL, 1, '2026-03-01 14:21:48'),
(17, 9, 'New Spa Booking!', 'New booking for Flea Treatment on Mon 02 Mar, 09:00 AM', 'booking', 15, NULL, 0, '2026-03-01 14:31:01'),
(18, 7, 'New Appointment Booked', 'A patient has booked General Checkup, Vaccination on 09:00 AM, 02 Mar 2026', 'appointment', 11, NULL, 0, '2026-03-01 14:31:35'),
(19, 4, 'New Pet Order!', 'You have a new order for Bruno - ₹15,050.00', 'order', 11, NULL, 1, '2026-03-02 07:59:57'),
(20, 4, 'New Pet Order!', 'You have a new order for Whiskers - ₹12,050.00', 'order', 12, NULL, 1, '2026-03-02 08:36:24'),
(21, 4, 'New Pet Order!', 'You have a new order for Rocky - ₹20,050.00', 'order', 13, NULL, 0, '2026-03-03 14:17:32'),
(22, 4, 'New Pet Order!', 'You have a new order for Rocky - ₹20,050.00', 'order', 14, NULL, 0, '2026-03-03 14:20:35'),
(23, 4, 'New Pet Order!', 'You have a new order for Bruno - ₹15,050.00', 'order', 15, NULL, 0, '2026-03-05 06:45:49'),
(24, 7, 'New Appointment Booked', 'A patient has booked General Checkup, Vaccination on 02:00 PM, 05 Mar 2026', 'appointment', 12, NULL, 0, '2026-03-05 06:47:27'),
(25, 4, 'New Pet Order!', 'You have a new order for Whiskers - ₹12,050.00', 'order', 16, NULL, 0, '2026-03-07 03:52:32'),
(26, 4, 'New Pet Order!', 'You have a new order for Rocky - ₹20,050.00', 'order', 17, NULL, 0, '2026-03-07 03:52:52'),
(27, 4, 'New Pet Order!', 'You have a new order for Simba - ₹22,050.00', 'order', 18, NULL, 0, '2026-03-07 03:53:12'),
(28, 7, 'New Appointment Booked', 'A patient has booked General Checkup on 11:30 AM, 07 Mar 2026', 'appointment', 13, NULL, 0, '2026-03-07 05:02:02'),
(29, 7, 'New Appointment Booked', 'A patient has booked General Checkup on 09:30 AM, 09 Mar 2026', 'appointment', 14, NULL, 0, '2026-03-07 07:34:48'),
(30, 6, 'New Pet Order!', 'You have a new order for lucus - ₹11,050.00', 'order', 19, NULL, 1, '2026-03-07 08:17:58'),
(31, 7, 'New Appointment Booked', 'A patient has booked General Checkup on 10:30 AM, 09 Mar 2026', 'appointment', 15, NULL, 0, '2026-03-09 03:30:24'),
(32, 7, 'New Appointment Booked', 'A patient has booked Dental Cleaning on 03:30 PM, 09 Mar 2026', 'appointment', 16, NULL, 0, '2026-03-09 04:29:58'),
(33, 7, 'New Appointment Booked', 'A patient has booked General Checkup on 02:30 PM, 11 Mar 2026', 'appointment', 17, NULL, 0, '2026-03-09 07:52:16'),
(35, 7, 'New Appointment Booked', 'A patient has booked General Checkup on 11:00 AM, 11 Mar 2026', 'appointment', 18, NULL, 0, '2026-03-09 09:14:55'),
(36, 20, 'New Pet Order!', 'You have a new order for maddy - ₹14,050.00', 'order', 21, NULL, 1, '2026-03-09 10:15:10'),
(37, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 02:30 PM, 12 Mar 2026', 'appointment', 19, NULL, 1, '2026-03-09 10:45:32'),
(38, 21, 'New Appointment Booked', 'A patient has booked Vaccination on 02:30 PM, 10 Mar 2026', 'appointment', 20, NULL, 1, '2026-03-10 06:41:47'),
(39, 19, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 24, NULL, 1, '2026-03-10 07:16:35'),
(40, 21, 'New Review!', 'You received a 4-star review. Check it out!', 'review', 0, NULL, 1, '2026-03-10 07:32:25'),
(41, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 03:00 PM, 10 Mar 2026', 'appointment', 21, NULL, 1, '2026-03-10 08:08:25'),
(42, 19, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 26, NULL, 1, '2026-03-10 08:11:11'),
(43, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 02:30 PM, 10 Mar 2026', 'appointment', 22, NULL, 0, '2026-03-10 08:28:12'),
(44, 19, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 28, NULL, 1, '2026-03-10 08:30:10'),
(45, 21, 'New Review!', 'You received a 5-star review. Check it out!', 'review', 0, NULL, 1, '2026-03-10 09:00:09'),
(46, 6, 'New Review!', 'You received a 3-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-10 09:21:44'),
(47, 20, 'New Pet Order!', 'You have a new order for buddy - ₹8,050.00', 'order', 22, NULL, 1, '2026-03-10 11:28:13'),
(48, 21, 'nikhill nandan', 'Hi', 'chat', 11, NULL, 0, '2026-03-10 12:09:05'),
(49, 22, 'New Spa Booking!', 'New booking for Bathing on Wed 11 Mar, 02:30 PM', 'booking', 16, NULL, 1, '2026-03-11 07:20:49'),
(50, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 03:00 PM, 11 Mar 2026', 'appointment', 23, NULL, 1, '2026-03-11 08:43:23'),
(51, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 23, NULL, 1, '2026-03-12 04:04:25'),
(52, 20, 'New Pet Order!', 'You have a new order for maxi - ₹15,050.00', 'order', 23, NULL, 1, '2026-03-12 05:12:42'),
(53, 20, 'Booking Accepted!', 'Your spa booking has been accepted. Get ready for your appointment!', 'booking', 16, NULL, 1, '2026-03-12 07:47:30'),
(55, 22, 'New Review!', 'You received a 3-star review. Check it out!', 'review', 0, NULL, 1, '2026-03-12 08:16:12'),
(56, 21, 'New Review!', 'You received a 3-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-13 04:11:33'),
(57, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 10:00 AM, 18 Mar 2026', 'appointment', 24, NULL, 0, '2026-03-13 04:15:07'),
(61, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 02:30 PM, 13 Mar 2026', 'appointment', 25, NULL, 0, '2026-03-13 07:35:47'),
(62, 19, 'Certificate Issued', 'A health certificate has been issued for your pet. You can download it now.', 'certificate', 29, NULL, 0, '2026-03-13 07:50:31'),
(64, 20, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 25, NULL, 0, '2026-03-13 07:51:38'),
(65, 20, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 25, NULL, 0, '2026-03-13 07:51:41'),
(66, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 09:30 AM, 17 Mar 2026', 'appointment', 26, NULL, 0, '2026-03-13 08:13:21'),
(67, 21, 'New Review!', 'You received a 5-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-13 08:13:34'),
(68, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 03:00 PM, 13 Mar 2026', 'appointment', 27, NULL, 1, '2026-03-13 08:38:24'),
(69, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 02:30 PM, 14 Mar 2026', 'appointment', 28, NULL, 0, '2026-03-14 07:48:15'),
(70, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 03:00 PM, 14 Mar 2026', 'appointment', 29, NULL, 1, '2026-03-14 07:48:41'),
(71, 20, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 27, NULL, 0, '2026-03-14 08:03:08'),
(72, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 28, NULL, 0, '2026-03-14 08:03:17'),
(73, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 29, NULL, 0, '2026-03-14 08:03:21'),
(74, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 26, NULL, 0, '2026-03-14 08:03:23'),
(75, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 09:30 AM, 16 Mar 2026', 'appointment', 30, NULL, 0, '2026-03-16 02:51:33'),
(76, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 02:00 PM, 16 Mar 2026', 'appointment', 31, NULL, 0, '2026-03-16 03:33:21'),
(77, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 30, NULL, 0, '2026-03-16 07:13:47'),
(78, 22, 'New Spa Booking!', 'New booking for Bathing on Mon 16 Mar, 03:00 PM', 'booking', 17, NULL, 0, '2026-03-16 07:36:59'),
(79, 21, 'New Review!', 'You received a 3-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-16 07:37:12'),
(80, 21, 'New Review!', 'You received a 5-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-16 07:37:20'),
(81, 23, 'New Pet Order!', 'You have a new order for bock - ₹8,050.00', 'order', 26, NULL, 0, '2026-03-16 07:39:02'),
(82, 5, 'nikhill nandan', 'hi', 'chat', 12, NULL, 0, '2026-03-16 11:57:23'),
(83, 8, 'New Appointment Booked', 'A patient has booked General Consultation on 02:00 PM, 17 Mar 2026', 'appointment', 32, NULL, 0, '2026-03-16 12:06:45'),
(84, 19, 'Booking Accepted!', 'Your spa booking has been accepted. Get ready for your appointment!', 'booking', 17, NULL, 0, '2026-03-16 12:37:35'),
(85, 19, 'Spa Session Complete', 'Your spa session has been marked as completed. Please leave a review!', 'booking', 17, NULL, 0, '2026-03-17 00:56:37'),
(86, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 10:00 AM, 17 Mar 2026', 'appointment', 33, NULL, 0, '2026-03-17 03:19:30'),
(87, 22, 'New Spa Booking!', 'New booking for Ear Cleaning on Tue 17 Mar, 09:30 AM', 'booking', 18, NULL, 0, '2026-03-17 03:19:56'),
(88, 22, 'New Review!', 'You received a 4-star review. Check it out!', 'review', 0, NULL, 0, '2026-03-18 03:06:06'),
(89, 19, 'Booking Declined', 'Unfortunately, your spa booking has been declined. Please try another time.', 'booking', 18, NULL, 0, '2026-03-18 03:15:25'),
(90, 23, 'New Pet Order!', 'You have a new order for ben - ₹7,500.00', 'order', 27, NULL, 0, '2026-03-18 03:17:47'),
(91, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 11:30 AM, 18 Mar 2026', 'appointment', 34, NULL, 0, '2026-03-18 05:10:01'),
(92, 5, 'nikhill nandan', 'Hi', 'chat', 13, NULL, 0, '2026-03-18 05:11:10'),
(93, 21, 'nikhill nandan', 'Hi', 'chat', 14, NULL, 0, '2026-03-18 05:11:25'),
(94, 23, 'nikhill nandan', 'Hi', 'chat', 15, NULL, 0, '2026-03-18 05:11:55'),
(95, 24, 'New Appointment Booked', 'A patient has booked General Checkup on 02:00 PM, 18 Mar 2026', 'appointment', 35, NULL, 1, '2026-03-18 05:30:53'),
(96, 23, 'New Pet Order!', 'You have a new order for bunny - ₹13,050.00', 'order', 28, NULL, 0, '2026-03-18 05:38:53'),
(97, 22, 'New Spa Booking!', 'New booking for Bathing on Wed 18 Mar, 11:30 AM', 'booking', 19, NULL, 0, '2026-03-18 05:40:17'),
(98, 19, 'Booking Accepted!', 'Your spa booking has been accepted. Get ready for your appointment!', 'booking', 19, NULL, 0, '2026-03-18 05:41:33'),
(99, 24, 'New Appointment Booked', 'A patient has booked General Checkup on 03:30 PM, 18 Mar 2026', 'appointment', 36, NULL, 1, '2026-03-18 09:10:20'),
(100, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 35, NULL, 0, '2026-03-18 09:11:12'),
(101, 19, 'Appointment Update', 'Your appointment status has been updated to: CANCELLED', 'appointment', 36, NULL, 0, '2026-03-18 09:11:15'),
(102, 23, 'New Pet Order!', 'You have a new order for ben - ₹7,550.00', 'order', 29, NULL, 0, '2026-03-19 02:52:16'),
(103, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 09:00 AM, 19 Mar 2026', 'appointment', 37, NULL, 0, '2026-03-19 02:57:02'),
(105, 19, 'Order Update', 'Sorry, your order for Bane was rejected by the seller.', 'order', 30, NULL, 1, '2026-03-19 03:28:59'),
(106, 23, 'New Pet Order!', 'You have a new order for ben - ₹7,550.00', 'order', 31, NULL, 0, '2026-03-19 09:01:27'),
(107, 21, 'New Appointment Booked', 'A patient has booked General Checkup on 03:30 PM, 19 Mar 2026', 'appointment', 38, NULL, 0, '2026-03-19 09:02:07'),
(108, 22, 'New Spa Booking!', 'New booking for Bathing on Thu 19 Mar, 03:30 PM', 'booking', 20, NULL, 0, '2026-03-19 09:02:28');

-- --------------------------------------------------------

--
-- Table structure for table `pets`
--

CREATE TABLE `pets` (
  `pet_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `pet_name` varchar(100) DEFAULT NULL,
  `species` varchar(50) DEFAULT NULL,
  `breed` varchar(100) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('MALE','FEMALE') DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `availability_status` enum('AVAILABLE','RESERVED','SOLD') DEFAULT 'AVAILABLE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pets`
--

INSERT INTO `pets` (`pet_id`, `seller_id`, `pet_name`, `species`, `breed`, `age`, `gender`, `color`, `price`, `description`, `availability_status`, `created_at`) VALUES
(1, 4, 'Bruno', 'Dog', 'Golden Retriever', 2, 'MALE', 'Golden', 15000.00, 'Friendly and playful golden retriever', 'SOLD', '2026-02-23 14:00:06'),
(2, 4, 'Whiskers', 'Cat', 'Persian', 1, 'FEMALE', 'White', 12000.00, 'Beautiful long-haired Persian cat', 'RESERVED', '2026-02-23 14:00:06'),
(3, 4, 'Rocky', 'Dog', 'German Shepherd', 3, 'MALE', 'Black & Tan', 20000.00, 'Well-trained GSD, great guard dog', 'RESERVED', '2026-02-23 14:00:06'),
(4, 5, 'Luna', 'Cat', 'Siamese', 2, 'FEMALE', 'Cream', 10000.00, 'Elegant Siamese with blue eyes', 'AVAILABLE', '2026-02-23 14:00:06'),
(5, 5, 'Max', 'Dog', 'Labrador Retriever', 1, 'MALE', 'Chocolate', 13000.00, 'Energetic and loving Lab puppy', 'AVAILABLE', '2026-02-23 14:00:06'),
(6, 5, 'Coco', 'Dog', 'Pomeranian', 2, 'FEMALE', 'Orange', 8000.00, 'Cute and fluffy Pomeranian', 'AVAILABLE', '2026-02-23 14:00:06'),
(7, 6, 'Charlie', 'Dog', 'Beagle', 1, 'MALE', 'Tricolor', 11000.00, 'Curious and merry Beagle puppy', 'AVAILABLE', '2026-02-23 14:00:06'),
(8, 6, 'Bella', 'Cat', 'Maine Coon', 3, 'FEMALE', 'Tabby', 18000.00, 'Gentle giant, very affectionate', 'AVAILABLE', '2026-02-23 14:00:06'),
(9, 6, 'Buddy', 'Dog', 'Shih Tzu', 2, 'MALE', 'White & Brown', 9000.00, 'Adorable lap dog, great companion', 'AVAILABLE', '2026-02-23 14:00:06'),
(10, 4, 'Simba', 'Cat', 'Bengal', 1, 'MALE', 'Spotted', 22000.00, 'Exotic Bengal cat with wild markings', 'RESERVED', '2026-02-23 14:00:06'),
(11, 6, 'lucus', 'dog', 'labrador', 2, 'MALE', '', 11000.00, 'good and generous', 'RESERVED', '2026-03-04 03:49:45'),
(12, 20, 'buddy', 'dog', 'Pug', 5, 'MALE', '', 8000.00, 'very nice pet companion', 'SOLD', '2026-03-09 03:56:12'),
(13, 20, 'maxi', 'dog', 'Beagle', 5, 'MALE', '', 15000.00, 'good pet', 'SOLD', '2026-03-09 07:01:35'),
(14, 20, 'maddy', 'dog', 'beagle', 4, 'MALE', NULL, 14000.00, 'good', 'SOLD', '2026-03-09 07:56:10'),
(15, 23, 'ben', 'cat', 'Bengal', 1, 'MALE', '', 7500.00, 'very nice cat', 'RESERVED', '2026-03-16 03:28:06'),
(16, 23, 'bock', 'cat', 'Bombay cat', 1, 'MALE', '', 8000.00, 'very good cat', 'AVAILABLE', '2026-03-16 03:31:57'),
(17, 23, 'Bane', 'dog', 'pug', 3, 'MALE', '', 4000.00, 'good', 'AVAILABLE', '2026-03-17 03:04:55'),
(18, 23, 'bunny', 'dog', 'pit bull', 2, 'MALE', '', 13000.00, 'very nice pet', 'SOLD', '2026-03-18 05:35:54');

-- --------------------------------------------------------

--
-- Table structure for table `pet_images`
--

CREATE TABLE `pet_images` (
  `image_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pet_images`
--

INSERT INTO `pet_images` (`image_id`, `pet_id`, `image_url`) VALUES
(1, 1, 'uploads/pets/golden_retriever.jpg'),
(2, 2, 'uploads/pets/persian_cat.jpg'),
(3, 3, 'uploads/pets/german_shepherd.jpg'),
(4, 4, 'uploads/pets/siamese_cat.jpg'),
(5, 5, 'uploads/pets/labrador.jpg'),
(6, 6, 'uploads/pets/pomeranian.jpg'),
(7, 7, 'uploads/pets/beagle.jpg'),
(8, 8, 'uploads/pets/maine_coon.jpg'),
(9, 9, 'uploads/pets/shih_tzu.jpg'),
(10, 10, 'uploads/pets/bengal_cat.jpg'),
(11, 11, 'uploads/pets/pet_11_0_1772596185.jpg'),
(12, 11, 'uploads/pets/pet_11_1_1772596185.jpg'),
(13, 11, 'uploads/pets/pet_11_2_1772596185.jpg'),
(14, 12, 'uploads/pets/pet_12_0_1773028572.jpg'),
(15, 12, 'uploads/pets/pet_12_1_1773028572.jpg'),
(16, 12, 'uploads/pets/pet_12_2_1773028572.jpg'),
(17, 13, 'uploads/pets/pet_13_0_1773039695.jpg'),
(18, 13, 'uploads/pets/pet_13_1_1773039695.jpg'),
(19, 13, 'uploads/pets/pet_13_2_1773039695.jpg'),
(20, 14, 'uploads/user_pets/pet_20_1773039930.jpg'),
(21, 14, 'uploads/pets/pet_ext_14_0_1773042970.jpg'),
(22, 14, 'uploads/pets/pet_ext_14_1_1773042970.jpg'),
(23, 14, 'uploads/pets/pet_ext_14_2_1773042970.jpg'),
(24, 15, 'uploads/pets/pet_15_0_1773631686.jpg'),
(25, 15, 'uploads/pets/pet_15_1_1773631686.jpg'),
(26, 15, 'uploads/pets/pet_15_2_1773631686.jpg'),
(27, 16, 'uploads/pets/pet_16_0_1773631917.jpg'),
(28, 16, 'uploads/pets/pet_16_1_1773631917.jpg'),
(29, 16, 'uploads/pets/pet_16_2_1773631917.jpg'),
(30, 17, 'uploads/pets/pet_17_0_1773716695.jpg'),
(31, 17, 'uploads/pets/pet_17_1_1773716695.jpg'),
(32, 17, 'uploads/pets/pet_17_2_1773716695.jpg'),
(33, 18, 'uploads/pets/pet_18_0_1773812154.jpg'),
(34, 18, 'uploads/pets/pet_18_1_1773812154.jpg'),
(35, 18, 'uploads/pets/pet_18_2_1773812154.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `pet_transactions`
--

CREATE TABLE `pet_transactions` (
  `transaction_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('PENDING','SUCCESS','FAILED','BOOKED','CONFIRMED','REJECTED') DEFAULT 'BOOKED',
  `transaction_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_address` text DEFAULT NULL,
  `delivery_name` varchar(100) DEFAULT NULL,
  `delivery_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pet_transactions`
--

INSERT INTO `pet_transactions` (`transaction_id`, `pet_id`, `buyer_id`, `seller_id`, `amount`, `payment_method`, `payment_status`, `transaction_date`, `delivery_address`, `delivery_name`, `delivery_phone`) VALUES
(15, 1, 1, 4, 15050.00, 'UPI', 'CONFIRMED', '2026-03-05 06:45:49', NULL, NULL, NULL),
(16, 2, 2, 4, 12050.00, 'UPI', 'BOOKED', '2026-03-07 03:52:32', NULL, NULL, NULL),
(17, 3, 2, 4, 20050.00, 'UPI', 'BOOKED', '2026-03-07 03:52:52', NULL, NULL, NULL),
(18, 10, 2, 4, 22050.00, 'UPI', 'BOOKED', '2026-03-07 03:53:12', NULL, NULL, NULL),
(19, 11, 19, 6, 11050.00, 'UPI', 'BOOKED', '2026-03-07 08:17:58', NULL, NULL, NULL),
(20, 12, 19, 20, 8050.00, 'UPI', 'REJECTED', '2026-03-09 09:13:52', NULL, NULL, NULL),
(21, 14, 19, 20, 14050.00, 'COD', 'REJECTED', '2026-03-09 10:15:10', NULL, NULL, NULL),
(22, 12, 19, 20, 8050.00, 'COD', 'CONFIRMED', '2026-03-10 11:28:13', NULL, NULL, NULL),
(23, 13, 19, 20, 15050.00, 'COD', 'CONFIRMED', '2026-03-12 05:12:42', NULL, NULL, NULL),
(24, 14, 19, 20, 14050.00, 'COD', 'REJECTED', '2026-03-13 04:47:22', 'chembarambakam, chennai, Tamil Nadu - 60001', 'nikhill Nandan', '9398286428'),
(25, 14, 19, 20, 14050.00, 'COD', 'CONFIRMED', '2026-03-13 04:48:14', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428'),
(26, 16, 19, 23, 8050.00, 'COD', 'REJECTED', '2026-03-16 07:39:02', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428'),
(27, 15, 19, 23, 7500.00, 'COD', 'REJECTED', '2026-03-18 03:17:47', 'Saveetha Nagar, Thandalam, Kanchipuram - Chennai Rd, Chennai, Kuthambakkam, Tamil Nadu 602105, India', 'nikhill nandan', '9398286428'),
(28, 18, 19, 23, 13050.00, 'COD', 'CONFIRMED', '2026-03-18 05:38:53', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428'),
(29, 15, 19, 23, 7550.00, 'COD', 'REJECTED', '2026-03-19 02:52:16', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428'),
(30, 17, 19, 23, 4050.00, 'COD', 'REJECTED', '2026-03-19 03:28:36', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428'),
(31, 15, 19, 23, 7550.00, 'COD', 'BOOKED', '2026-03-19 09:01:27', 'saveetha Institute of Medical and Technical Sciences, chennai, Tamil Nadu - 600056', 'nikhill Nandan', '9398286428');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `target_user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `reviewer_id`, `appointment_id`, `transaction_id`, `booking_id`, `target_user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, NULL, NULL, NULL, 4, 5, 'Excellent pet shop! Bruno is healthy and playful.', '2026-02-23 14:00:06'),
(2, 2, NULL, NULL, NULL, 5, 4, 'Good service. Max was well taken care of.', '2026-02-23 14:00:06'),
(3, 3, NULL, NULL, NULL, 6, 5, 'Charlie is adorable! Very transparent seller.', '2026-02-23 14:00:06'),
(4, 1, NULL, NULL, NULL, 7, 5, 'Dr. Ramesh is very knowledgeable and caring.', '2026-02-23 14:00:06'),
(5, 2, NULL, NULL, NULL, 8, 4, 'Dr. Meera explained everything clearly.', '2026-02-23 14:00:06'),
(6, 3, NULL, NULL, NULL, 7, 5, 'Emergency care was prompt. Thank you doctor!', '2026-02-23 14:00:06'),
(7, 1, NULL, NULL, NULL, 5, 4, 'Lakshmi has a great collection of pets.', '2026-02-23 14:00:06'),
(8, 2, NULL, NULL, NULL, 4, 4, 'Rocky is a stunning dog. Vikram is trustworthy.', '2026-02-23 14:00:06'),
(9, 3, NULL, NULL, NULL, 8, 4, 'Skin treatment worked wonders for Luna.', '2026-02-23 14:00:06'),
(10, 1, NULL, NULL, NULL, 6, 3, 'Decent experience but delivery was slow.', '2026-02-23 14:00:06'),
(11, 19, NULL, NULL, NULL, 21, 4, 'very good doctor', '2026-03-10 07:32:25'),
(12, 1, NULL, NULL, NULL, 2, 3, 'test', '2026-03-10 08:00:24'),
(13, 19, 21, NULL, NULL, 21, 5, '', '2026-03-10 09:00:08'),
(14, 19, NULL, 19, NULL, 6, 3, '', '2026-03-10 09:21:44'),
(15, 20, 19, NULL, NULL, 21, 3, 'nice', '2026-03-13 04:11:33'),
(16, 19, 20, NULL, NULL, 21, 5, '', '2026-03-13 08:13:34'),
(17, 19, 24, NULL, NULL, 21, 3, '', '2026-03-16 07:37:12'),
(18, 19, 26, NULL, NULL, 21, 5, '', '2026-03-16 07:37:20');

-- --------------------------------------------------------

--
-- Table structure for table `saved_pets`
--

CREATE TABLE `saved_pets` (
  `saved_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_pets`
--

INSERT INTO `saved_pets` (`saved_id`, `buyer_id`, `pet_id`, `saved_at`) VALUES
(1, 1, 1, '2026-02-23 14:00:06'),
(2, 1, 3, '2026-02-23 14:00:06'),
(3, 1, 10, '2026-02-23 14:00:06'),
(4, 2, 2, '2026-02-23 14:00:06'),
(5, 2, 5, '2026-02-23 14:00:06'),
(6, 2, 7, '2026-02-23 14:00:06'),
(7, 3, 4, '2026-02-23 14:00:06'),
(8, 3, 6, '2026-02-23 14:00:06'),
(9, 3, 8, '2026-02-23 14:00:06'),
(10, 3, 9, '2026-02-23 14:00:06'),
(12, 20, 12, '2026-03-11 07:22:25'),
(13, 19, 14, '2026-03-12 07:41:27');

-- --------------------------------------------------------

--
-- Table structure for table `seller_profiles`
--

CREATE TABLE `seller_profiles` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shop_name` varchar(255) DEFAULT NULL,
  `seller_type` enum('INDIVIDUAL','SHOP') DEFAULT 'INDIVIDUAL',
  `upi_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `seller_profiles`
--

INSERT INTO `seller_profiles` (`profile_id`, `user_id`, `shop_name`, `seller_type`, `upi_id`) VALUES
(1, 4, 'Vikram Pet Shop', 'SHOP', '8985545407@fam'),
(2, 5, 'Lakshmi Pet World', 'SHOP', '8985545407@fam'),
(3, 6, '', 'INDIVIDUAL', '8985545407@fam'),
(4, 12, '', 'INDIVIDUAL', '8985545407@fam'),
(5, 20, '', 'SHOP', '8074121167@ibl'),
(6, 23, '', 'SHOP', '7702598290-4@ybl');

-- --------------------------------------------------------

--
-- Table structure for table `spa_bookings`
--

CREATE TABLE `spa_bookings` (
  `booking_id` int(11) NOT NULL,
  `spa_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `pet_source` enum('purchased','manual','market') DEFAULT 'purchased',
  `service_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_date` datetime NOT NULL,
  `booking_time` time DEFAULT '10:00:00',
  `status` varchar(20) DEFAULT 'pending',
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `pet_name` varchar(100) DEFAULT 'Unknown',
  `pet_type` varchar(50) DEFAULT 'Dog',
  `booking_status` enum('BOOKED','COMPLETED','CANCELLED','CONFIRMED','ACCEPTED','DONE','PAID','REJECTED','PENDING') DEFAULT 'BOOKED',
  `payment_status` enum('PENDING','SUCCESS','FAILED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `extra_charges` decimal(10,2) DEFAULT 0.00,
  `extra_payment_status` varchar(20) DEFAULT 'PENDING',
  `payment_method` varchar(20) DEFAULT 'CASH'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spa_bookings`
--

INSERT INTO `spa_bookings` (`booking_id`, `spa_id`, `pet_id`, `pet_source`, `service_id`, `buyer_id`, `user_id`, `booking_date`, `booking_time`, `status`, `total_amount`, `pet_name`, `pet_type`, `booking_status`, `payment_status`, `created_at`, `extra_charges`, `extra_payment_status`, `payment_method`) VALUES
(1, 1, 1, 'purchased', 1, 1, 1, '2026-02-25 10:00:00', '10:00:00', 'pending', 500.00, 'Bruno', 'Dog', 'BOOKED', 'PENDING', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(2, 1, 3, 'purchased', 2, 2, 2, '2026-02-25 11:00:00', '11:00:00', 'pending', 1200.00, 'Rocky', 'Dog', 'BOOKED', 'PENDING', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(3, 2, 2, 'purchased', 6, 1, 1, '2026-02-26 09:00:00', '09:00:00', 'pending', 400.00, 'Whiskers', 'Cat', 'BOOKED', 'PENDING', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(4, 2, 5, 'purchased', 7, 3, 3, '2026-02-26 14:00:00', '14:00:00', 'pending', 900.00, 'Max', 'Dog', 'BOOKED', 'PENDING', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(5, 1, 7, 'purchased', 4, 3, 3, '2026-02-27 10:00:00', '10:00:00', 'confirmed', 800.00, 'Charlie', 'Dog', 'BOOKED', 'SUCCESS', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(6, 1, 1, 'purchased', 1, 1, 1, '2026-01-15 10:00:00', '10:00:00', 'completed', 500.00, 'Bruno', 'Dog', 'COMPLETED', 'SUCCESS', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(7, 2, 4, 'purchased', 8, 2, 2, '2026-01-20 15:00:00', '15:00:00', 'completed', 600.00, 'Luna', 'Cat', 'COMPLETED', 'SUCCESS', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(8, 1, 6, 'purchased', 5, 2, 2, '2026-01-25 11:00:00', '11:00:00', 'completed', 700.00, 'Coco', 'Dog', 'COMPLETED', 'SUCCESS', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(9, 2, 8, 'purchased', 10, 1, 1, '2026-02-01 09:00:00', '09:00:00', 'completed', 1800.00, 'Bella', 'Cat', 'COMPLETED', 'SUCCESS', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(10, 1, 5, 'purchased', 3, 3, 3, '2026-02-10 16:00:00', '16:00:00', 'cancelled', 300.00, 'Max', 'Dog', 'CANCELLED', 'FAILED', '2026-02-23 14:00:06', 0.00, 'PENDING', 'CASH'),
(13, 1, 2, 'purchased', 5, 1, 0, '2026-03-02 09:00:00', '09:00:00', 'pending', 700.00, 'Unknown', 'Dog', 'BOOKED', 'SUCCESS', '2026-03-01 14:21:45', 0.00, 'PENDING', 'CASH'),
(14, 1, 2, 'purchased', 5, 1, 0, '2026-03-02 09:00:00', '09:00:00', 'pending', 700.00, 'Unknown', 'Dog', 'BOOKED', 'SUCCESS', '2026-03-01 14:21:48', 0.00, 'PENDING', 'CASH'),
(15, 1, 6, 'purchased', 5, 1, 0, '2026-03-02 09:00:00', '09:00:00', 'pending', 700.00, 'Unknown', 'Dog', 'BOOKED', 'SUCCESS', '2026-03-01 14:31:01', 0.00, 'PENDING', 'CASH'),
(16, 3, 12, '', 11, 20, 20, '2026-03-12 13:38:19', '14:30:00', 'completed', 250.00, 'Unknown', 'Dog', 'COMPLETED', 'SUCCESS', '2026-03-11 07:20:49', 100.00, 'PENDING', 'CASH'),
(17, 3, 11, 'purchased', 11, 19, 19, '2026-03-16 15:00:00', '15:00:00', 'completed', 250.00, 'Unknown', 'Dog', 'COMPLETED', 'SUCCESS', '2026-03-16 07:36:59', 0.00, 'PENDING', 'CASH'),
(18, 3, 16, 'purchased', 15, 19, 19, '2026-03-17 09:30:00', '09:30:00', 'declined', 100.00, 'Unknown', 'Dog', 'CANCELLED', 'SUCCESS', '2026-03-17 03:19:56', 0.00, 'PENDING', 'CASH'),
(19, 3, 18, 'purchased', 11, 19, 19, '2026-03-18 11:30:00', '11:30:00', 'accepted', 250.00, 'Unknown', 'Dog', 'CONFIRMED', 'SUCCESS', '2026-03-18 05:40:17', 0.00, 'PENDING', 'CASH'),
(20, 3, 12, 'purchased', 11, 19, 19, '2026-03-19 15:30:00', '15:30:00', 'pending', 250.00, 'Unknown', 'Dog', 'BOOKED', 'SUCCESS', '2026-03-19 09:02:28', 0.00, 'PENDING', 'CASH');

-- --------------------------------------------------------

--
-- Table structure for table `spa_profiles`
--

CREATE TABLE `spa_profiles` (
  `spa_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `spa_name` varchar(255) DEFAULT NULL,
  `services_offered` text DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `total_reviews` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spa_profiles`
--

INSERT INTO `spa_profiles` (`spa_id`, `user_id`, `spa_name`, `services_offered`, `upi_id`, `rating`, `total_reviews`) VALUES
(1, 9, 'Pawsome Spa', 'Bathing, Grooming, Hair Cut, Nail Trimming', '8985545407@fam', 4.5, 12),
(2, 10, 'Happy Tails Spa', 'Bathing, De-shedding, Teeth Cleaning, Flea Treatment', '8985545407@fam', 4.2, 8),
(3, 22, 'Amazing Spa', 'Bathing, Grooming, Hair Cut, Ear Cleaning, Teeth Cleaning, Skin Treatment, Massage, Styling, Full Spa Package', 'vinzmokez@oksbi', 3.5, 2);

-- --------------------------------------------------------

--
-- Table structure for table `spa_reviews`
--

CREATE TABLE `spa_reviews` (
  `review_id` int(11) NOT NULL,
  `spa_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `rating` int(1) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spa_reviews`
--

INSERT INTO `spa_reviews` (`review_id`, `spa_id`, `user_id`, `booking_id`, `rating`, `review_text`, `created_at`) VALUES
(1, 1, 1, NULL, 5, 'Bruno loved the bath! Came back smelling amazing.', '2026-02-23 14:00:06'),
(2, 1, 2, NULL, 4, 'Rocky grooming was excellent. Took a bit long.', '2026-02-23 14:00:06'),
(3, 1, 3, NULL, 5, 'Great service and friendly staff at Pawsome Spa.', '2026-02-23 14:00:06'),
(4, 2, 1, NULL, 4, 'Whiskers was handled gently. Good cat spa!', '2026-02-23 14:00:06'),
(5, 2, 2, NULL, 5, 'Luna enjoyed the de-shedding treatment.', '2026-02-23 14:00:06'),
(6, 2, 3, NULL, 4, 'Teeth cleaning was thorough. Will visit again.', '2026-02-23 14:00:06'),
(7, 1, 1, NULL, 5, 'Nail trimming was quick and painless for Bruno.', '2026-02-23 14:00:06'),
(8, 1, 2, NULL, 3, 'Had to wait 20 mins past appointment time.', '2026-02-23 14:00:06'),
(9, 2, 3, NULL, 5, 'Spa package was worth every rupee!', '2026-02-23 14:00:06'),
(10, 2, 1, NULL, 4, 'Ear cleaning was gentle. Staff is professional.', '2026-02-23 14:00:06'),
(11, 3, 20, 16, 3, 'good', '2026-03-12 08:16:12'),
(12, 3, 19, 17, 4, 'good service but started appoitment late', '2026-03-18 03:06:06');

-- --------------------------------------------------------

--
-- Table structure for table `spa_services`
--

CREATE TABLE `spa_services` (
  `service_id` int(11) NOT NULL,
  `spa_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `duration` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spa_services`
--

INSERT INTO `spa_services` (`service_id`, `spa_id`, `service_name`, `description`, `duration_minutes`, `duration`, `price`, `created_at`, `status`) VALUES
(1, 1, 'Full Bath', 'Complete bathing with shampoo & conditioner', 45, '45 min', 500.00, '2026-02-23 14:00:06', 'active'),
(2, 1, 'Grooming Deluxe', 'Full body grooming with styling', 90, '90 min', 1200.00, '2026-02-23 14:00:06', 'active'),
(3, 1, 'Nail Trimming', 'Safe nail clipping and filing', 20, '20 min', 300.00, '2026-02-23 14:00:06', 'active'),
(4, 1, 'Hair Cut', 'Breed-specific hair styling', 60, '60 min', 800.00, '2026-02-23 14:00:06', 'active'),
(5, 1, 'Flea Treatment', 'Anti-flea bath and prevention spray', 40, '40 min', 700.00, '2026-02-23 14:00:06', 'active'),
(6, 2, 'Basic Bath', 'Quick bath with premium shampoo', 30, '30 min', 400.00, '2026-02-23 14:00:06', 'active'),
(7, 2, 'De-shedding', 'Deep coat de-shedding treatment', 60, '60 min', 900.00, '2026-02-23 14:00:06', 'active'),
(8, 2, 'Teeth Cleaning', 'Oral hygiene and breath freshening', 30, '30 min', 600.00, '2026-02-23 14:00:06', 'active'),
(9, 2, 'Ear Cleaning', 'Gentle ear cleaning and inspection', 15, '15 min', 250.00, '2026-02-23 14:00:06', 'active'),
(10, 2, 'Spa Package', 'Bath + grooming + nail trim combo', 120, '120 min', 1800.00, '2026-02-23 14:00:06', 'active'),
(11, 3, 'Bathing', 'Default service added from profile selection', 10, NULL, 250.00, '2026-03-09 12:01:51', 'active'),
(12, 3, 'Grooming', 'Default service added from profile selection', 30, NULL, 400.00, '2026-03-09 12:01:51', 'active'),
(13, 3, 'Hair Cut', 'Default service added from profile selection', 24, NULL, 150.00, '2026-03-09 12:01:51', 'active'),
(14, 3, 'Nail Trimming', 'Default service added from profile selection', 10, NULL, 80.00, '2026-03-09 12:01:51', 'active'),
(15, 3, 'Ear Cleaning', 'Default service added from profile selection', 5, NULL, 100.00, '2026-03-09 12:01:51', 'active'),
(16, 3, 'Teeth Cleaning', 'Default service added from profile selection', 5, NULL, 180.00, '2026-03-09 12:01:51', 'active'),
(18, 3, 'Flea & Tick Treatment', 'Default service added from profile selection', 10, NULL, 120.00, '2026-03-09 12:01:51', 'removed'),
(19, 3, 'Skin Treatment', 'Default service added from profile selection', 30, NULL, 450.00, '2026-03-09 12:01:51', 'active'),
(20, 3, 'Massage', 'Default service added from profile selection', 30, NULL, 600.00, '2026-03-09 12:01:51', 'active'),
(21, 3, 'Styling', 'Default service added from profile selection', 20, NULL, 200.00, '2026-03-09 12:01:51', 'active'),
(22, 3, 'Full Spa Package', 'Default service added from profile selection', 30, NULL, 500.00, '2026-03-09 12:01:51', 'active'),
(23, 3, 'De-shedding', 'Default service added from profile selection', 30, NULL, 0.00, '2026-03-11 08:42:34', 'removed'),
(24, 1, 'Bathing', 'Default service from signup', 30, NULL, 80.00, '2026-03-14 07:48:49', 'active'),
(25, 1, 'Grooming', 'Default service from signup', 30, NULL, 120.00, '2026-03-14 07:48:49', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `typing_status`
--

CREATE TABLE `typing_status` (
  `user_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `is_typing` tinyint(1) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `typing_status`
--

INSERT INTO `typing_status` (`user_id`, `recipient_id`, `is_typing`, `updated_at`) VALUES
(1, 4, 0, '2026-02-23 19:30:06'),
(1, 5, 0, '2026-02-23 19:30:06'),
(2, 4, 0, '2026-02-23 19:30:06'),
(2, 5, 0, '2026-02-23 19:30:06'),
(3, 6, 0, '2026-02-23 19:30:06'),
(4, 1, 0, '2026-02-23 19:30:06'),
(4, 2, 0, '2026-02-23 19:30:06'),
(5, 1, 0, '2026-02-23 19:30:06'),
(5, 2, 0, '2026-02-23 19:30:06'),
(6, 3, 0, '2026-02-23 19:30:06'),
(19, 5, 0, '2026-03-18 10:41:10'),
(19, 21, 0, '2026-03-18 10:41:24'),
(19, 23, 0, '2026-03-18 10:41:56');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `upi_id` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('BUYER','SELLER','DOCTOR','SPA_OWNER','ADMIN') NOT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` datetime DEFAULT NULL,
  `fcm_token` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime DEFAULT NULL,
  `latitude` double DEFAULT 0,
  `longitude` double DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `phone`, `upi_id`, `password_hash`, `role`, `profile_image`, `address`, `city`, `state`, `pincode`, `is_verified`, `is_online`, `last_seen`, `fcm_token`, `created_at`, `reset_otp`, `otp_expires_at`, `latitude`, `longitude`) VALUES
(1, 'Ananya Sharma', 'ananya@test.com', '9876543210', NULL, 'BuyerPass1', 'BUYER', 'uploads/roles/buyer/user_1.jpg', '9, Kannadhasan St, near Spartan International School, Chembarambakkam, Tamil Nadu 600123, India', NULL, NULL, NULL, 0, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-02-23 14:00:06', NULL, NULL, 13.0335899, 80.0568103),
(2, 'Rohan Mehta', 'rohan@test.com', '9876543211', NULL, 'BuyerPass2', 'BUYER', 'uploads/roles/buyer/user_2.jpg', '45, T. Nagar, Chennai', NULL, NULL, NULL, 0, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-02-23 14:00:06', NULL, NULL, 12.8831, 80.1),
(3, 'Priya Krishnan', 'priya@test.com', '9876543212', NULL, 'BuyerPass3', 'BUYER', 'uploads/roles/buyer/user_3.jpg', '78, Adyar, Chennai', NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-23 14:00:06', NULL, NULL, 12.7746, 80.0849),
(4, 'Vikram Pets', 'vikram@test.com', '9876543213', NULL, 'SellerPass1', 'SELLER', 'uploads/roles/seller/user_4.jpg', '23, Porur, Chennai', NULL, NULL, NULL, 0, 0, NULL, 'dagLO5pxSuK-49r8sYPKME:APA91bFhJqomluX_8YGS1T_893jA3itXouHK5K8BBIvf3c9MuUtRK6JkezUm22XIC4D6yGpUBU_V_cxLciKfJOEDQTjDxw6Gk-L_mkWJRRmW8bEL359sETc', '2026-02-23 14:00:06', NULL, NULL, 12.8709, 79.9889),
(5, 'Lakshmi Animals', 'lakshmi@test.com', '9876543214', NULL, 'SellerPass2', 'SELLER', 'uploads/roles/seller/user_5.jpg', '45, MG Road, Bangalore', NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-23 14:00:06', NULL, NULL, 12.9716, 77.5946),
(6, 'Karthik Store', 'karthik@test.com', '9876543215', NULL, 'SellerPass3', 'SELLER', 'uploads/roles/seller/user_6.jpg', '23, Bandra West, Mumbai', NULL, NULL, NULL, 0, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-02-23 14:00:06', NULL, NULL, 19.076, 72.8777),
(7, 'Dr. Ramesh Kumar', 'ramesh@test.com', '9876543216', NULL, 'DoctorPass1', 'DOCTOR', 'uploads/roles/doctor/user_7.jpg', '34, Vadapalani, Chennai', NULL, NULL, NULL, 0, 0, NULL, 'dagLO5pxSuK-49r8sYPKME:APA91bFhJqomluX_8YGS1T_893jA3itXouHK5K8BBIvf3c9MuUtRK6JkezUm22XIC4D6yGpUBU_V_cxLciKfJOEDQTjDxw6Gk-L_mkWJRRmW8bEL359sETc', '2026-02-23 14:00:06', NULL, NULL, 12.8268, 80.0066),
(8, 'Dr. Meera Nair', 'meera@test.com', '9876543217', NULL, 'DoctorPass2', 'DOCTOR', 'uploads/roles/doctor/user_8.jpg', '67, Marina Beach Road, Chennai', NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-23 14:00:06', NULL, NULL, 13.0827, 80.2707),
(9, 'Suresh Iyer', 'suresh@test.com', '9876543218', NULL, 'SpaPass1', 'SPA_OWNER', 'uploads/roles/spa_owner/user_9.jpg', '9, Kannadhasan St, near Spartan International School, Chembarambakkam, Tamil Nadu 600123, India', NULL, NULL, NULL, 0, 0, NULL, 'dagLO5pxSuK-49r8sYPKME:APA91bFhJqomluX_8YGS1T_893jA3itXouHK5K8BBIvf3c9MuUtRK6JkezUm22XIC4D6yGpUBU_V_cxLciKfJOEDQTjDxw6Gk-L_mkWJRRmW8bEL359sETc', '2026-02-23 14:00:06', NULL, NULL, 12.7852, 80.0556),
(10, 'Deepa Rajan', 'deepa@test.com', '9876543219', NULL, 'SpaPass2', 'SPA_OWNER', 'uploads/roles/spa_owner/user_10.jpg', '11, RS Puram, Coimbatore', NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-02-23 14:00:06', NULL, NULL, 11.0168, 76.9558),
(11, 'Tharun', 'tpkr4446@gmail.com', '6301687092', NULL, 'Nani@123', 'BUYER', NULL, '23P5+8CM, Chembarambakkam, Tamil Nadu 600123, India', NULL, NULL, NULL, 0, 0, NULL, 'dagLO5pxSuK-49r8sYPKME:APA91bFhJqomluX_8YGS1T_893jA3itXouHK5K8BBIvf3c9MuUtRK6JkezUm22XIC4D6yGpUBU_V_cxLciKfJOEDQTjDxw6Gk-L_mkWJRRmW8bEL359sETc', '2026-03-01 03:59:27', NULL, NULL, 13.0350077, 80.0586929),
(12, 'Timmareddy Prem Kumar Reddy', 'tprem6565@gmail.com', '8985545407', NULL, 'Nani@123', 'SELLER', 'uploads/profiles/sellers/user_12_1772508613.jpg', '3/738, Bajanai Koil St, Poonamallee, Chembarambakkam, Tamil Nadu 600123, India', NULL, NULL, NULL, 0, 0, NULL, NULL, '2026-03-03 03:30:13', NULL, NULL, 13.0375436, 80.057858),
(19, 'nikhill nandan', 'nikhillnandan@gmail.com', '9398286428', '', 'Nikhill@2026', 'BUYER', 'uploads/profiles/buyers/user_19_1773802425.jpg', 'Saveetha Nagar, Thandalam, Kanchipuram - Chennai Rd, Chennai, Kuthambakkam, Tamil Nadu 602105, India', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-07 08:15:59', '081753', '2026-03-17 08:21:32', 13.02801686557377, 80.01749879590164),
(20, 'Avinash Petshop', 'avinashdakkili8@gmail.com', '8074121167', NULL, '123!@#aA', 'SELLER', NULL, 'Saveetha Nagar, Thandalam, Kanchipuram - Chennai Rd, Chennai, Kuthambakkam, Tamil Nadu 602105, India', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-09 03:53:27', NULL, NULL, 13.0282826, 80.0159059),
(21, 'manukonda Tarun', 'manukondatarun5@gmail.com', '7893978256', 'manukondatarun5@oksbi', 'Sravani0690*', 'DOCTOR', NULL, 'Saveetha Nagar, Thandalam, Kanchipuram - Chennai Rd, Chennai, Kuthambakkam, Tamil Nadu 602105, India', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-09 08:05:22', NULL, NULL, 13.028022808430778, 80.0171304771053),
(22, 'Sharan', 'vinzmokez@gmail.com', '9080764317', 'vinzmokez@oksbi', 'Broski123@', 'SPA_OWNER', NULL, 'Saveetha Nagar, Thandalam, Kanchipuram - Chennai Rd, Chennai, Kuthambakkam, Tamil Nadu 602105, India', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-09 09:26:28', NULL, NULL, 13.0895, 80.2739),
(23, 'Ramesh pet shop', 'nikhillkota@gmail.com', '9398286428', '7702598290-4@ybl', 'Nikhill@2026', 'SELLER', NULL, 'Saveetha Institute of Medical and Technical Sciences', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-16 03:19:27', '282698', '2026-03-16 14:34:42', 13.0276537, 80.0156825),
(24, 'Dr. Ramanessh', 'sathishkumarb.sse@saveetha.com', '9500008938', 'nikhill.nandan@ybl', 'Sathish@2026', 'DOCTOR', NULL, 'EEE Department, Kuthambakkam, Tamil Nadu 602105, India', NULL, NULL, NULL, 1, 0, NULL, 'eIWH61ONSMmE7HnpdWRpF2:APA91bE6-2YhgfHG9fFw29faboC4AhXzKGQB09q4gPTa31o3zuOKfBeSYcvOwBBfsrQzFGvS-8RT01Pgdm2XGnaJHu8z8q52hOvDU4l_imWjTUrkUMMp-y0', '2026-03-18 05:26:32', NULL, NULL, 13.0264737, 80.0159347);

-- --------------------------------------------------------

--
-- Table structure for table `user_pets`
--

CREATE TABLE `user_pets` (
  `pet_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pet_name` varchar(100) NOT NULL,
  `species` varchar(50) DEFAULT '',
  `breed` varchar(100) DEFAULT '',
  `age` varchar(50) DEFAULT '',
  `gender` varchar(20) DEFAULT '',
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `vaccination_cert` varchar(255) DEFAULT NULL,
  `health_cert` varchar(255) DEFAULT NULL,
  `license_cert` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_pets`
--

INSERT INTO `user_pets` (`pet_id`, `user_id`, `pet_name`, `species`, `breed`, `age`, `gender`, `description`, `image_url`, `vaccination_cert`, `health_cert`, `license_cert`, `created_at`) VALUES
(1, 19, 'bab', 'dog', 'pug', '3', 'male', 'good pet', 'uploads/user_pets/pet_19_1773030563.jpg', NULL, NULL, NULL, '2026-03-09 04:29:23'),
(5, 23, 'benny', 'cat', 'Bengal', '3 months', 'male', 'nice one', 'uploads/user_pets/pet_23_5_0_1773631993.jpg', NULL, NULL, NULL, '2026-03-16 03:33:13');

-- --------------------------------------------------------

--
-- Table structure for table `user_pet_images`
--

CREATE TABLE `user_pet_images` (
  `image_id` int(11) NOT NULL,
  `pet_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_pet_images`
--

INSERT INTO `user_pet_images` (`image_id`, `pet_id`, `image_url`, `created_at`) VALUES
(1, 5, 'uploads/user_pets/pet_23_5_0_1773631993.jpg', '2026-03-16 03:33:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_breed_detection`
--
ALTER TABLE `ai_breed_detection`
  ADD PRIMARY KEY (`detection_id`),
  ADD KEY `fk_ai_user` (`user_id`);

--
-- Indexes for table `breed_analysis`
--
ALTER TABLE `breed_analysis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_breed` (`breed_name`);

--
-- Indexes for table `buyer_pets`
--
ALTER TABLE `buyer_pets`
  ADD PRIMARY KEY (`pet_id`),
  ADD KEY `buyer_id` (`buyer_id`);

--
-- Indexes for table `buyer_profiles`
--
ALTER TABLE `buyer_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `fk_buyer_user` (`user_id`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `fk_certificate_pet` (`pet_id`),
  ADD KEY `fk_certificate_doctor` (`issued_by`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `fk_chat_sender` (`sender_id`),
  ADD KEY `fk_chat_receiver` (`receiver_id`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`,`timestamp`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_unread` (`receiver_id`,`is_read`),
  ADD KEY `idx_latest_message` (`sender_id`,`receiver_id`,`timestamp`),
  ADD KEY `idx_unread_count` (`receiver_id`,`is_read`,`timestamp`);

--
-- Indexes for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  ADD PRIMARY KEY (`address_id`);

--
-- Indexes for table `doctor_appointments`
--
ALTER TABLE `doctor_appointments`
  ADD PRIMARY KEY (`appointment_id`),
  ADD KEY `fk_appointment_pet` (`pet_id`),
  ADD KEY `fk_appointment_doctor` (`doctor_id`),
  ADD KEY `fk_appointment_buyer` (`user_id`);

--
-- Indexes for table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `fk_doctor_user` (`user_id`);

--
-- Indexes for table `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `fk_doctor_service_owner` (`doctor_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `fk_notification_user` (`user_id`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `pets`
--
ALTER TABLE `pets`
  ADD PRIMARY KEY (`pet_id`),
  ADD KEY `fk_pet_seller` (`seller_id`),
  ADD KEY `idx_pet_species` (`species`),
  ADD KEY `idx_pet_breed` (`breed`);

--
-- Indexes for table `pet_images`
--
ALTER TABLE `pet_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `fk_pet_image` (`pet_id`);

--
-- Indexes for table `pet_transactions`
--
ALTER TABLE `pet_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `fk_transaction_pet` (`pet_id`),
  ADD KEY `fk_transaction_buyer` (`buyer_id`),
  ADD KEY `fk_transaction_seller` (`seller_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `fk_review_reviewer` (`reviewer_id`),
  ADD KEY `fk_review_target` (`target_user_id`);

--
-- Indexes for table `saved_pets`
--
ALTER TABLE `saved_pets`
  ADD PRIMARY KEY (`saved_id`),
  ADD UNIQUE KEY `unique_saved_pet` (`buyer_id`,`pet_id`),
  ADD KEY `idx_buyer_saved` (`buyer_id`),
  ADD KEY `idx_pet_saved` (`pet_id`);

--
-- Indexes for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD PRIMARY KEY (`profile_id`),
  ADD KEY `fk_seller_user` (`user_id`);

--
-- Indexes for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `fk_spa_booking_pet` (`pet_id`),
  ADD KEY `fk_spa_booking_service` (`service_id`),
  ADD KEY `fk_spa_booking_buyer` (`buyer_id`),
  ADD KEY `fk_booking_spa` (`spa_id`);

--
-- Indexes for table `spa_profiles`
--
ALTER TABLE `spa_profiles`
  ADD PRIMARY KEY (`spa_id`),
  ADD KEY `fk_spa_user` (`user_id`);

--
-- Indexes for table `spa_reviews`
--
ALTER TABLE `spa_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `fk_review_spa` (`spa_id`),
  ADD KEY `fk_review_user` (`user_id`);

--
-- Indexes for table `spa_services`
--
ALTER TABLE `spa_services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `fk_spa_owner` (`spa_id`);

--
-- Indexes for table `typing_status`
--
ALTER TABLE `typing_status`
  ADD PRIMARY KEY (`user_id`,`recipient_id`),
  ADD KEY `fk_typing_user` (`user_id`),
  ADD KEY `fk_typing_recipient` (`recipient_id`),
  ADD KEY `idx_updated` (`updated_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_pets`
--
ALTER TABLE `user_pets`
  ADD PRIMARY KEY (`pet_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_pet_images`
--
ALTER TABLE `user_pet_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `pet_id` (`pet_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_breed_detection`
--
ALTER TABLE `ai_breed_detection`
  MODIFY `detection_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `breed_analysis`
--
ALTER TABLE `breed_analysis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `buyer_pets`
--
ALTER TABLE `buyer_pets`
  MODIFY `pet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `buyer_profiles`
--
ALTER TABLE `buyer_profiles`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `delivery_addresses`
--
ALTER TABLE `delivery_addresses`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `doctor_appointments`
--
ALTER TABLE `doctor_appointments`
  MODIFY `appointment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `doctor_services`
--
ALTER TABLE `doctor_services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `pets`
--
ALTER TABLE `pets`
  MODIFY `pet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `pet_images`
--
ALTER TABLE `pet_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `pet_transactions`
--
ALTER TABLE `pet_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `saved_pets`
--
ALTER TABLE `saved_pets`
  MODIFY `saved_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `spa_profiles`
--
ALTER TABLE `spa_profiles`
  MODIFY `spa_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `spa_reviews`
--
ALTER TABLE `spa_reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `spa_services`
--
ALTER TABLE `spa_services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `user_pets`
--
ALTER TABLE `user_pets`
  MODIFY `pet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_pet_images`
--
ALTER TABLE `user_pet_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_breed_detection`
--
ALTER TABLE `ai_breed_detection`
  ADD CONSTRAINT `fk_ai_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `buyer_pets`
--
ALTER TABLE `buyer_pets`
  ADD CONSTRAINT `buyer_pets_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `buyer_profiles`
--
ALTER TABLE `buyer_profiles`
  ADD CONSTRAINT `fk_buyer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `fk_certificate_doctor` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_certificate_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `fk_chat_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_chat_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_appointments`
--
ALTER TABLE `doctor_appointments`
  ADD CONSTRAINT `fk_appointment_buyer` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_appointment_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_appointment_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`) ON DELETE SET NULL;

--
-- Constraints for table `doctor_profiles`
--
ALTER TABLE `doctor_profiles`
  ADD CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `doctor_services`
--
ALTER TABLE `doctor_services`
  ADD CONSTRAINT `fk_doctor_service_owner` FOREIGN KEY (`doctor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `pets`
--
ALTER TABLE `pets`
  ADD CONSTRAINT `fk_pet_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `pet_images`
--
ALTER TABLE `pet_images`
  ADD CONSTRAINT `fk_pet_image` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`) ON DELETE CASCADE;

--
-- Constraints for table `pet_transactions`
--
ALTER TABLE `pet_transactions`
  ADD CONSTRAINT `fk_transaction_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_transaction_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`),
  ADD CONSTRAINT `fk_transaction_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_review_target` FOREIGN KEY (`target_user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `saved_pets`
--
ALTER TABLE `saved_pets`
  ADD CONSTRAINT `fk_saved_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_saved_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`) ON DELETE CASCADE;

--
-- Constraints for table `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD CONSTRAINT `fk_seller_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `spa_bookings`
--
ALTER TABLE `spa_bookings`
  ADD CONSTRAINT `fk_booking_spa` FOREIGN KEY (`spa_id`) REFERENCES `spa_profiles` (`spa_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_spa_booking_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_spa_booking_pet` FOREIGN KEY (`pet_id`) REFERENCES `pets` (`pet_id`),
  ADD CONSTRAINT `fk_spa_booking_service` FOREIGN KEY (`service_id`) REFERENCES `spa_services` (`service_id`);

--
-- Constraints for table `spa_profiles`
--
ALTER TABLE `spa_profiles`
  ADD CONSTRAINT `fk_spa_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `spa_reviews`
--
ALTER TABLE `spa_reviews`
  ADD CONSTRAINT `fk_review_spa` FOREIGN KEY (`spa_id`) REFERENCES `spa_profiles` (`spa_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `spa_services`
--
ALTER TABLE `spa_services`
  ADD CONSTRAINT `fk_spa_owner` FOREIGN KEY (`spa_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `typing_status`
--
ALTER TABLE `typing_status`
  ADD CONSTRAINT `fk_typing_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_typing_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_pets`
--
ALTER TABLE `user_pets`
  ADD CONSTRAINT `user_pets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
