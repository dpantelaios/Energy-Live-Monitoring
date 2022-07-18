-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Εξυπηρετητής: 127.0.0.1:3307
-- Χρόνος δημιουργίας: 15 Ιουλ 2022 στις 20:54:58
-- Έκδοση διακομιστή: 10.4.24-MariaDB
-- Έκδοση PHP: 7.4.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Βάση δεδομένων: `display_agpt`
--

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `country`
--

CREATE TABLE `country` (
  `Country` varchar(30) NOT NULL,
  `AreaTypeCode` varchar(20) NOT NULL,
  `AreaName` varchar(20) NOT NULL,
  `MapCode` varchar(20) NOT NULL,
  `AreaReference` varchar(40) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `country`
--

INSERT INTO `country` (`Country`, `AreaTypeCode`, `AreaName`, `MapCode`, `AreaReference`) VALUES
('Albania', 'CTY', 'AL CTY', 'AL', 'Albania / AL CTY / CTY'),
('Armenia', 'CTY', 'AM CTY', 'AM', 'Armenia / AM CTY / CTY'),
('Austria', 'CTY', 'AT CTY', 'AT', 'Austria / AT CTY / CTY'),
('Azerbaijan', 'CTY', 'AZ CTY', 'AZ', 'Azerbaijan / AZ CTY / CTY'),
('Bosnia Herzegovina', 'CTY', 'BA CTY', 'BA', 'Bosnia Herzegovina / BA CTY / CTY'),
('Belgium', 'CTY', 'BE CTY', 'BE', 'Belgium / BE CTY / CTY'),
('Bulgaria', 'CTY', 'BG CTY', 'BG', 'Bulgaria / BG CTY / CTY'),
('Belarus', 'CTY', 'BY CTY', 'BY', 'Belarus / BY CTY / CTY'),
('Switzerland', 'CTY', 'CH CTY', 'CH', 'Switzerland / CH CTY / CTY'),
('Cyprus', 'CTY', 'CY CTY', 'CY', 'Cyprus / CY CTY / CTY'),
('Czech Republic', 'CTY', 'CZ CTY', 'CZ', 'Czech Republic / CZ CTY / CTY'),
('Germany', 'CTY', 'DE CTY', 'DE', 'Germany / DE CTY / CTY'),
('Denmark', 'CTY', 'DK CTY', 'DK', 'Denmark / DK CTY / CTY'),
('Estonia', 'CTY', 'EE CTY', 'EE', 'Estonia / EE CTY / CTY'),
('Spain', 'CTY', 'ES CTY', 'ES', 'Spain / ES CTY / CTY'),
('Finland', 'CTY', 'FI CTY', 'FI', 'Finland / FI CTY / CTY'),
('France', 'CTY', 'FR CTY', 'FR', 'France / FR CTY / CTY'),
('United Kingdom', 'CTY', 'UK CTY', 'GB', 'United Kingdom / UK CTY / CTY'),
('Georgia', 'CTY', 'GE CTY', 'GE', 'Georgia / GE CTY / CTY'),
('Greece', 'CTY', 'GR CTY', 'GR', 'Greece / GR CTY / CTY'),
('Croatia', 'CTY', 'HR CTY', 'HR', 'Croatia / HR CTY / CTY'),
('Hungary', 'CTY', 'HU CTY', 'HU', 'Hungary / HU CTY / CTY'),
('Ireland', 'CTY', 'IE CTY', 'IE', 'Ireland / IE CTY / CTY'),
('Italy', 'CTY', 'IT CTY', 'IT', 'Italy / IT CTY / CTY'),
('Lithuania', 'CTY', 'LT CTY', 'LT', 'Lithuania / LT CTY / CTY'),
('Luxembourg', 'CTY', 'LU CTY', 'LU', 'Luxembourg / LU CTY / CTY'),
('Latvia', 'CTY', 'LV CTY', 'LV', 'Latvia / LV CTY / CTY'),
('Republic of Moldova', 'CTY', 'MD CTY', 'MD', 'Republic of Moldova / MD CTY / CTY'),
('Montenegro', 'CTY', 'ME CTY', 'ME', 'Montenegro / ME CTY / CTY'),
('North Macedonia', 'CTY', 'MK CTY', 'MK', 'North Macedonia / MK CTY / CTY'),
('Malta', 'CTY', 'MT CTY', 'MT', 'Malta / MT CTY / CTY'),
('Netherlands', 'CTY', 'NL CTY', 'NL', 'Netherlands / NL CTY / CTY'),
('Norway', 'CTY', 'NO CTY', 'NO', 'Norway / NO CTY / CTY'),
('Poland', 'CTY', 'PL CTY', 'PL', 'Poland / PL CTY / CTY'),
('Portugal', 'CTY', 'PT CTY', 'PT', 'Portugal / PT CTY / CTY'),
('Romania', 'CTY', 'RO CTY', 'RO', 'Romania / RO CTY / CTY'),
('Serbia', 'CTY', 'RS CTY', 'RS', 'Serbia / RS CTY / CTY'),
('Russia', 'CTY', 'RU CTY', 'RU', 'Russia / RU CTY / CTY'),
('Sweden', 'CTY', 'SE CTY', 'SE', 'Sweden / SE CTY / CTY'),
('Slovenia', 'CTY', 'SI CTY', 'SI', 'Slovenia / SI CTY / CTY'),
('Slovakia', 'CTY', 'SK CTY', 'SK', 'Slovakia / SK CTY / CTY'),
('Turkey', 'CTY', 'TR CTY', 'TR', 'Turkey / TR CTY / CTY'),
('Ukraine', 'CTY', 'UA CTY', 'UA', 'Ukraine / UA CTY / CTY'),
('Kosovo', 'CTY', 'XK CTY', 'XK', 'Kosovo / XK CTY / CTY');

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `generation`
--

CREATE TABLE `generation` (
  `dateTime` timestamp NOT NULL DEFAULT current_timestamp(),
  `resolutionCode` int(11) NOT NULL,
  `mapCode` varchar(10) NOT NULL,
  `productionType` varchar(60) NOT NULL,
  `actualGenerationOutput` float NOT NULL,
  `table_index` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `productionkinds`
--

CREATE TABLE `productionkinds` (
  `ProductionType` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Δομή πίνακα για τον πίνακα `resolution_code`
--

CREATE TABLE `resolution_code` (
  `resolutionCode` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Άδειασμα δεδομένων του πίνακα `resolution_code`
--

INSERT INTO `resolution_code` (`resolutionCode`) VALUES
(15),
(30),
(60);

--
-- Ευρετήρια για άχρηστους πίνακες
--

--
-- Ευρετήρια για πίνακα `country`
--
ALTER TABLE `country`
  ADD PRIMARY KEY (`MapCode`);

--
-- Ευρετήρια για πίνακα `generation`
--
ALTER TABLE `generation`
  ADD PRIMARY KEY (`table_index`),
  ADD KEY `country_foreign` (`mapCode`),
  ADD KEY `resolution_code_foreign` (`resolutionCode`),
  ADD KEY `production_foreign` (`productionType`);

--
-- Ευρετήρια για πίνακα `productionkinds`
--
ALTER TABLE `productionkinds`
  ADD PRIMARY KEY (`ProductionType`);

--
-- Ευρετήρια για πίνακα `resolution_code`
--
ALTER TABLE `resolution_code`
  ADD PRIMARY KEY (`resolutionCode`);

--
-- AUTO_INCREMENT για άχρηστους πίνακες
--

--
-- AUTO_INCREMENT για πίνακα `generation`
--
ALTER TABLE `generation`
  MODIFY `table_index` int(11) NOT NULL AUTO_INCREMENT;

--
-- Περιορισμοί για άχρηστους πίνακες
--

--
-- Περιορισμοί για πίνακα `generation`
--
ALTER TABLE `generation`
  ADD CONSTRAINT `country_foreign` FOREIGN KEY (`mapCode`) REFERENCES `country` (`MapCode`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `production_foreign` FOREIGN KEY (`productionType`) REFERENCES `productionkinds` (`ProductionType`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resolution_code_foreign` FOREIGN KEY (`resolutionCode`) REFERENCES `resolution_code` (`resolutionCode`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

CREATE DATABASE `user_management`;
USE `user_management`;

CREATE TABLE `users` (
  `email` varchar(50) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `license_expiration_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`email`, `first_name`, `last_name`, `license_expiration_date`, `last_login`) VALUES
('dimitris.pantelaios@gmail.com', 'dimitris', 'pantelaios', '2022-08-20 06:34:21', '2022-07-13 14:39:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`);
COMMIT;
