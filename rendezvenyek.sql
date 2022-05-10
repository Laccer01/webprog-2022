#Név: Velican László
#Azonosító: vlim2099
#Csoport: 523/1(régi 524/2)


-- CREATE DATABASE Rendezvenyek ;
USE Rendezvenyek;

ALTER TABLE Szervezo
DROP CONSTRAINT FK_Rendezveny_Szervezo;

ALTER TABLE RendezvenyKepek
DROP CONSTRAINT FK_Rendezveny_RendezvenyKepek;

DROP TABLE IF EXISTS Rendezveny;
DROP TABLE IF EXISTS Szervezo;
DROP TABLE IF EXISTS RendezvenyKepek;

CREATE TABLE Rendezveny
(
	rendezvenyID int primary key auto_increment,
	nev VARCHAR(30),
	kezdesiIdo DATETIME,
    vegzesiIdo DATETIME,
	helyszin VARCHAR (30)
);

CREATE TABLE Szervezo
(
	szervezoID int primary key auto_increment,
	szervezoNev VARCHAR(30),
    rendezvenyID INT,
	CONSTRAINT FK_Rendezveny_Szervezo FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)
);

CREATE TABLE RendezvenyKepek
(
	rendezvenyKepekId int primary key auto_increment,
	rendezvenyID INT,
	utvonal VARCHAR(50),
    CONSTRAINT FK_Rendezveny_RendezvenyKepek FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)
);

USE Rendezvenyek;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'user'@'localhost';
FLUSH PRIVILEGES;


-- USE Rendezveny
-- SELECT * FROM Rendezveny

-- USE Rendezveny
-- DELETE FROM Rendezveny


