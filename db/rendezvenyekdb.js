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
  const x = connectionPool.query(`SELECT rendezvenyID 
    FROM Rendezveny
    Where Rendezveny.nev = ? `, [rendezveny['form-rendezvenyNev']]);
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
    values (default, ?, ?, ?, ?)`, [rendezveny['form-rendezvenyNev'], rendezveny['form-rendezvenyKezdesiIdopont'], rendezveny['form-rendezvenyVegzesiIdopont'], rendezveny['form-rendezvenyHelyszine']]);

  array.push(x);

  return array;
}

export function insertRendezvenySzervezok(rendezveny) {
  const array = [];

  rendezveny[0].then((result) => {
    console.log(result);
  });

  const rendezvenyIDjelenlegi = findRendezvenyID(rendezveny);

  const szervezok = rendezveny['form-rendezvenySzervezok'].split(',');
  let y;

  rendezvenyIDjelenlegi.then((result) => {
    Object.keys(szervezok).forEach((szervezoJelenlegi) => {
      y = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?)`, [szervezoJelenlegi, result[0][0].rendezvenyID]);
      array.push(y);
    });
  });

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
  return connectionPool.query(`insert into RendezvenyKepek 
  values (default, ?, ?)`, [rendezveny.ID, rendezveny.picture]);
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

// createTable().then(
// insertChoclate).then(findAllChockolate

//   ).catch((err) => {
//     console.error(err);
//   }).then((result)=>{
//     console.log(result[0]);
//   })
