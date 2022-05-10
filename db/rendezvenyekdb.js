import mysql2 from 'mysql2/promise.js';
// ezt kene megirni okesra
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

export function findRendezvenyID(rendezveny) {
  console.log(rendezveny);
  const  x = connectionPool.query(`SELECT Rendezveny.rendezvenyID
    FROM Rendezveny
    Where Rendezveny.rendezvenyID = 2 `);

  return x;
}

export function findSzervezoID(szervezo) {
  const x = connectionPool.query(`SELECT szervezoID 
      FROM Szervezo
      Where Szervezo.szervezoID = ? `, [szervezo['form-rendezvenySzervezo']]);

  return x;
}

export function insertRendezveny(rendezveny) {
  const array = [];
  const x = connectionPool.query(`insert into Rendezveny 
    values (default, ?, ?, ?, ?)`, [rendezveny.fields['form-rendezvenyNev'], rendezveny.fields['form-rendezvenyKezdesiIdopont'], rendezveny.fields['form-rendezvenyVegzesiIdopont'], rendezveny.fields['form-rendezvenyHelyszine']]);

  array.push(x);

  return array;
}

export function insertRendezvenySzervezok(rendezveny) {
  const array = [];
  //   const rendezvenyIDjelenlegi = findRendezvenyID(rendezveny);
  // console.log(rendezvenyIDjelenlegi);

  const szervezok = rendezveny['form-rendezvenySzervezok'].split(',');

  let y;

  //   rendezvenyIDjelenlegi.then((result) => {
  //    console.log(((result[0])[0])['rendezvenyID']);
  Object.values(szervezok).forEach((szervezoJelenlegi) => {
    y = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?)`, [szervezoJelenlegi, 2]);       // emiatt itt sem működik
    array.push(y);
  });
  //   });

  return array;
}

export function insertSzervezok(szervezo) {
  let y;
  if (szervezo['form-rendezvenySzervezoValasztas'] === 'csatlakozas') {
    if (findSzervezoID(szervezo) !== undefined) {
      y = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?)`, [szervezo['form-rendezvenySzervezo'], szervezo['form-rendezvenyID']]);
    }
  } else if (findSzervezoID(szervezo) !== undefined) {
    y = connectionPool.query(`DELETE From Szervezo 
        Where Szervezo.szervezoNev = ? and Szervezo.rendezvenyID = ?`, [szervezo['form-rendezvenySzervezo'], szervezo['form-rendezvenyID']]);
  }
  return y;
}

export function insertRendezvenyKepek(rendezveny) {
  const fileHandler = rendezveny.files['form-rendezvenyFenykep'];
  const file = fileHandler.path;
  const fileLista = file.split('\\');

  // console.log ((rendezveny.files['form-rendezvenyFenykep']))
  // console.log(((result[0])[0])['rendezvenyID']);
  return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezveny.fields['form-rendezvenyID'], fileLista[fileLista.length - 1]]);       // emiatt itt sem működik
}

export function findAllRendezveny() {
  return connectionPool.query('select * from Rendezveny');
}

export function findAllSzervezo() {
  return connectionPool.query('select * from Szervezo');
}

export function findAllRendezvenyKepek() {
  return connectionPool.query('select * from RendezvenyKepek');
}

export function findAllRendezvenyKepei(rendezvenyID) {
  console.log(rendezvenyID);
  return connectionPool.query('select * from RendezvenyKepek Where RendezvenyKepek.rendezvenyID = rendezvenyID');
}
