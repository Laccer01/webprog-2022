#Név: Velican László
#Azonosító: vlim2099
#Csoport: 523/1(régi 524/2)

#a rendezvenyek.sql script létrehoz minden szükséges táblát, a táblák között levő kapcsolatokat és a felhasználót is, csak futtatni kell

-- CREATE DATABASE Rendezvenyek ;
USE Rendezvenyek;

ALTER TABLE RendezvenyReszfeladatok
DROP CONSTRAINT FK_RendezvenyReszfeladatok_Rendezveny;

ALTER TABLE RendezvenyReszfeladatokSzervezok
DROP CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_RendezvenyReszfeladatok;

ALTER TABLE RendezvenyReszfeladatokSzervezok
DROP CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_Szervezo;

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
DROP TABLE IF EXISTS RendezvenyReszfeladatok;
DROP TABLE IF EXISTS RendezvenyReszfeladatokSzervezok;

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

CREATE TABLE RendezvenyReszfeladatok 
(
	reszfeladatID int primary key auto_increment,
    rendezvenyID INT,
    reszfeladatNeve VARCHAR (30),
    reszfeladatLeiras VARCHAR(500),
    reszfeladatHataridoKezdete DATE,
    reszfeladatHataridoVege DATE,
    reszfeladatLetrehozasiIdo DATE,
    reszfeladatUtolsoModositas DATE,
    reszfeladatLeadottDatum DATE DEFAULT null,
    reszfeladatStatus VARCHAR(30),
    
    CONSTRAINT FK_RendezvenyReszfeladatok_Rendezveny FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)
);

CREATE TABLE RendezvenyReszfeladatokSzervezok 
(
	reszfeladatSzervezoID int primary key auto_increment,
    reszfeladatID INT,
    szervezoID INT,
    CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_RendezvenyReszfeladatok FOREIGN KEY (reszfeladatID) REFERENCES RendezvenyReszfeladatok(reszfeladatID),
	CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_Szervezo FOREIGN KEY (szervezoID) REFERENCES Szervezo(szervezoID)
);

USE Rendezvenyek;
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON * . * TO 'user'@'localhost';
FLUSH PRIVILEGES;



