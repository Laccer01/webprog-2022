#Név: Velican László
#Azonosító: vlim2099
#Csoport: 523/1(régi 524/2)

#a rendezvenyek.sql script létrehoz minden szükséges táblát, a táblák között levő kapcsolatokat és a felhasználót is, csak futtatni kell

-- CREATE DATABASE Rendezvenyek ;
USE Rendezvenyek;

ALTER TABLE RendezvenyKepek
DROP CONSTRAINT FK_Rendezveny_RendezvenyKepek;

ALTER TABLE RendezokRendezvenyeken
DROP CONSTRAINT FK_RendezokRendezvenyeken_Rendezveny;

ALTER TABLE RendezokRendezvenyeken
DROP CONSTRAINT FK_RendezokRendezvenyeken_Szervezo;

DROP TABLE IF EXISTS Rendezveny;
DROP TABLE IF EXISTS Szervezo;
DROP TABLE IF EXISTS RendezvenyKepek;
DROP TABLE IF EXISTS RendezokRendezvenyeken;

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
    szerepkor VARCHAR(30),
    jelszo VARCHAR(100)
);

CREATE TABLE RendezvenyKepek
(
	rendezvenyKepekId int primary key auto_increment,
	rendezvenyID INT,
	utvonal VARCHAR(50),
    CONSTRAINT FK_Rendezveny_RendezvenyKepek FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)
);

CREATE TABLE RendezokRendezvenyeken 
(
	kapcsolatID int primary key auto_increment,
    rendezvenyID INT,
    szervezoID INT,
    CONSTRAINT FK_RendezokRendezvenyeken_Rendezveny FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID),
    CONSTRAINT FK_RendezokRendezvenyeken_Szervezo FOREIGN KEY (szervezoID) REFERENCES Szervezo(szervezoID)
);

USE Rendezvenyek;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'user'@'localhost';
FLUSH PRIVILEGES;


SELECT * FROM Rendezveny;

	SELECT * FROM Szervezo;

SELECT * FROM RendezvenyKepek;

SELECT * FROM RendezokRendezvenyeken;
-- DELETE FROM Rendezveny

-- USE Rendezveny
-- SELECT * FROM Szervezok

INSERT INTO Szervezo
VALUES (default, 'user1', 'felhasznalo', 'hey'), (default, 'user2', 'felhasznalo', 'hey');
