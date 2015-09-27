-- phpMyAdmin SQL Dump
-- version 4.2.11
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Erstellungszeit: 27. Sep 2015 um 21:31
-- Server Version: 5.6.21
-- PHP-Version: 5.6.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Datenbank: `requirement`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `requirements`
--

CREATE TABLE IF NOT EXISTS `requirements` (
`id` int(11) unsigned NOT NULL,
  `requirement` varchar(200) CHARACTER SET utf8 DEFAULT NULL,
  `owner_id` int(11) unsigned DEFAULT NULL,
  `priority` int(11) DEFAULT NULL,
  `team_id` int(6) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `relations` varchar(50) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2218 DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `requirements`
--

INSERT INTO `requirements` (`id`, `requirement`, `owner_id`, `priority`, `team_id`, `project_id`, `status`, `relations`, `timestamp`) VALUES
(2216, 'ich &req# muss &req# mag &req# kekse  &req# faehig sein, &req# mehr  &req# als du.', 18, 2, 131, 111, 'in Testphase', 'keine', 1443196607425),
(2217, 'sdf &req# muss &req# sdf &req#  &req# faehig sein, &req# sdfl &req# hallo.', 18, 3, 131, 98999, 'abgeschlossen', '', 1443196631003);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `team`
--

CREATE TABLE IF NOT EXISTS `team` (
`id` int(6) NOT NULL,
  `name` varchar(30) DEFAULT NULL,
  `creator_id` int(11) unsigned DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `team`
--

INSERT INTO `team` (`id`, `name`, `creator_id`) VALUES
(107, 'abc', 17),
(108, 'test', 18),
(112, 'socketio', 18),
(113, 'socketio2', 18),
(114, 'erf', 18),
(115, 'erffr', 18),
(116, '321', 18),
(117, 'sdf', 18),
(118, 'blabla2', 18),
(119, 'hallolo', 18),
(120, 'neuesTeam', 18),
(121, 'qw', 18),
(122, 'jhgfds', 18),
(123, 'vcx', 18),
(124, 'inserthere', 18),
(125, 'lolol', 18),
(126, 'asdf', 18),
(127, 'xyz', 18),
(128, 'fdsa', 18),
(129, 'qwertz', 18),
(130, 'hgfds', 18),
(131, 'ztrews', 18);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `users`
--

CREATE TABLE IF NOT EXISTS `users` (
`id` int(11) unsigned NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(60) NOT NULL,
  `email` varchar(60) DEFAULT NULL,
  `cookie` int(6) DEFAULT NULL,
  `team_id` int(6) DEFAULT NULL
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

--
-- Daten für Tabelle `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `cookie`, `team_id`) VALUES
(1, 'admin', '25d55ad283aa400af464c76d713c07ad', 'admin@wichtig.de', 727545, NULL),
(17, 'test', 'ed2b1f468c5f915f3f1cf75d7068baae', 'ich@i.de', 64489, 108),
(18, 'sven', 'ed2b1f468c5f915f3f1cf75d7068baae', '1@1.de', 85777, 131);

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `requirements`
--
ALTER TABLE `requirements`
 ADD PRIMARY KEY (`id`), ADD KEY `fk_owner` (`owner_id`), ADD KEY `fk_team` (`team_id`);

--
-- Indizes für die Tabelle `team`
--
ALTER TABLE `team`
 ADD PRIMARY KEY (`id`), ADD KEY `fk_creator` (`creator_id`);

--
-- Indizes für die Tabelle `users`
--
ALTER TABLE `users`
 ADD PRIMARY KEY (`id`), ADD KEY `fk_team_in` (`team_id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `requirements`
--
ALTER TABLE `requirements`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2218;
--
-- AUTO_INCREMENT für Tabelle `team`
--
ALTER TABLE `team`
MODIFY `id` int(6) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=132;
--
-- AUTO_INCREMENT für Tabelle `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) unsigned NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=19;
--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `requirements`
--
ALTER TABLE `requirements`
ADD CONSTRAINT `fk_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`),
ADD CONSTRAINT `fk_team` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`);

--
-- Constraints der Tabelle `team`
--
ALTER TABLE `team`
ADD CONSTRAINT `team_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`);

--
-- Constraints der Tabelle `users`
--
ALTER TABLE `users`
ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `team` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
