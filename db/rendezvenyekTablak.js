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

export function createTableRendezvenyek() {
  return connectionPool.query(`create table if not exists Rendezveny 
  (rendezvenyID int primary key auto_increment,
    nev VARCHAR(30),
    kezdesiIdo DATETIME,
    vegzesiIdo DATETIME,
    helyszin VARCHAR (30)`);
}

export function createTableSzervezok() {
  return connectionPool.query(`create table if not exists Szervezo 
  (szervezoID int primary key auto_increment,
    szervezoNev VARCHAR(30),
    rendezvenyID INT,
    CONSTRAINT FK_Rendezveny_Szervezo FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)`);
}

export function createTableRendezvenyKepek() {
  return connectionPool.query(`create table if not exists RendezvenyKepek 
  (rendezvenyKepekId int primary key auto_increment,
    rendezvenyID INT,
    utvonal VARCHAR(50),
    CONSTRAINT FK_Rendezveny_RendezvenyKepek FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)`);
}
