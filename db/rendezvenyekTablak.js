import mysql2 from 'mysql2/promise.js';

const connectionPool = mysql2.createPool(
  {
    connectionLimit: 10,
    database: 'Rendezvenyek',
    host: 'localhost',
    port: 3306,
    user: 'user',
    password: 'password',
  },
);
export { connectionPool };

//rendezvények tábla
export function createTableRendezvenyek() {
  return connectionPool.query(`create table if not exists Rendezveny 
  (rendezvenyID int primary key auto_increment,
    nev VARCHAR(30),
    kezdesiIdo DATETIME,
    vegzesiIdo DATETIME,
    helyszin VARCHAR (30)`);
}

//szervezők tábla
export function createTableSzervezok() {
  return connectionPool.query(`create table if not exists Szervezo 
  (szervezoID int primary key auto_increment,
    szervezoNev VARCHAR(30),
    szerepkor VARCHAR(30),
    jelszo VARCHAR(100))`);
}

//rendezvények Képek tábla
export function createTableRendezvenyKepek() {
  return connectionPool.query(`create table if not exists RendezvenyKepek 
  (rendezvenyKepekId int primary key auto_increment,
    rendezvenyID INT,
    utvonal VARCHAR(50),
    CONSTRAINT FK_Rendezveny_RendezvenyKepek FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID))`);
}

//rendezokRendezvenyeken tábla
export function createTableRendezokRendezvenyeken() {
  return connectionPool.query(`create table if not exists RendezokRendezvenyeken 
  (kapcsolatID int primary key auto_increment,
    rendezvenyID INT,
    szervezoID INT,
    CONSTRAINT FK_RendezokRendezvenyeken_Rendezveny FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID),
    CONSTRAINT FK_RendezokRendezvenyeken_Szervezo FOREIGN KEY (szervezoID) REFERENCES Szervezo(rendezvenyID))`);
}

//részfeladatok tábla
export function createTableRendezvenyReszfeladatok() {
  return connectionPool.query(`CREATE TABLE RendezvenyReszfeladatok 
  (
    reszfeladatID int primary key auto_increment,
      rendezvenyID INT,
      reszfeladatNeve VARCHAR (30),
      reszfeladatLeiras VARCHAR(100),
      reszfeladatHataridoKezdete DATE,
      reszfeladatHataridoVege DATE,
      reszfeladatLetrehozasiIdo DATE,
      reszfeladatUtolsoModositas DATE,
      reszfeladatLeadottDatum DATE,
      reszfeladatStatus VARCHAR(30),
      
      CONSTRAINT FK_RendezvenyReszfeladatok_Rendezveny FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID));`);
}

//részfeladatok szervezők táblaa
export function createTableRendezvenyReszfeladatokSzervezok() {
  return connectionPool.query(`CREATE TABLE RendezvenyReszfeladatokSzervezok 
  (
    reszfeladatSzervezoID int primary key auto_increment,
      reszfeladatID INT,
      szervezoID INT,
      CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_RendezvenyReszfeladatok FOREIGN KEY (reszfeladatID) REFERENCES RendezvenyReszfeladatok(reszfeladatID),
    CONSTRAINT FK_RendezvenyReszfeladatokSzervezok_Szervezo FOREIGN KEY (szervezoID) REFERENCES Szervezo(szervezoID));`);
}
