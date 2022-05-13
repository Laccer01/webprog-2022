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
//   console.log(rendezveny);
  const  x = connectionPool.query(`SELECT Rendezveny.rendezvenyID
    FROM Rendezveny
    Where Rendezveny.nev =?`, [rendezveny['form-rendezvenyNev']]);

  return x;
}

export async function findRendezvenyNevvel(rendezvenyNev) {
  const  x = connectionPool.query(`SELECT Rendezveny.rendezvenyID
      FROM Rendezveny
      Where Rendezveny.nev =?`, [rendezvenyNev]);

  return x;
}

export function findSzervezoID(szervezo) {
  const x = connectionPool.query(`SELECT szervezoID 
      FROM Szervezo
      Where Szervezo.szervezoID = ? `, [szervezo['form-rendezvenySzervezo']]);

  return x;
}

export function findSzervezoIDNevvel(szervezo) {
  const x = connectionPool.query(`SELECT szervezoID 
        FROM Szervezo
        Where Szervezo.nev = ? `, [szervezo]);
  console.log(x);
  return x;
}

export function findRendezvenyIdRendezvenyKepek(Kep) {
  const x = connectionPool.query(`SELECT RendezvenyKepek.rendezvenyID
        FROM RendezvenyKepek
        Where RendezvenyKepek.utvonal = ? `, [Kep]);
  //   console.log(x);
  return x;
}

export async function insertRendezveny(rendezveny) {
  const array = [];
  const x = connectionPool.query(`insert into Rendezveny 
    values (default, ?, ?, ?, ?)`, [rendezveny.fields['form-rendezvenyNev'], rendezveny.fields['form-rendezvenyKezdesiIdopont'],
    rendezveny.fields['form-rendezvenyVegzesiIdopont'], rendezveny.fields['form-rendezvenyHelyszine']]);

  array.push(x);

  return array;
}

export async function insertRendezvenySzervezok(rendezveny) {
  console.log(rendezveny);
  const array = [];
  const rendezvenyIDjelenlegiDic =  await findRendezvenyID(rendezveny);
  console.log(rendezvenyIDjelenlegiDic);
  const szervezok = rendezveny['form-rendezvenySzervezok'].split(',');
  //   console.log ( result[0][0] );

  let y;
  Object.values(szervezok).forEach((szervezoJelenlegi) => {
    y = connectionPool.query(`insert into Szervezo 
            values (default, ?, ?)`, [szervezoJelenlegi, rendezvenyIDjelenlegiDic[0][0].rendezvenyID]);
    array.push(y);
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
  const fileHandler = rendezveny.files['form-rendezvenyFenykep'];
  const file = fileHandler.path;
  const fileLista = file.split('\\');
  //   console.log(request.query.rendezvenyID)
  if (rendezveny.fields['form-rendezvenyID'] === undefined) {
    return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezveny.query.rendezvenyID, fileLista[fileLista.length - 1]]);
  }

  return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezveny.fields['form-rendezvenyID'], fileLista[fileLista.length - 1]]);

  // console.log ((rendezveny.files['form-rendezvenyFenykep']))
  // console.log(((result[0])[0])['rendezvenyID']);
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

export async function findAllRendezvenyKepei(rendezvenyNev) {
  const rendezvenyIDjelenlegiDic =  await findRendezvenyNevvel(rendezvenyNev);

  //    console.log((rendezvenyIDjelenlegiDic[0][0]));
  const y = Object.values(rendezvenyIDjelenlegiDic[0][0])[0];
  //   console.log(y);
  const x =  connectionPool.query('select RendezvenyKepek.utvonal from RendezvenyKepek Where RendezvenyKepek.rendezvenyID = ?', [y]);

  return x;
}

export function findAllRendezvenyID() {
  return connectionPool.query(
    'select unique(Rendezveny.rendezvenyID) from Rendezveny',
  );
}

export async function findRendezvenySzervezokNevei() {
  return connectionPool.query(
    'select Szervezo.szervezoNev from Szervezo',
  );
}

export async function findRendezvenyIdk() {
  return connectionPool.query(
    'select Rendezveny.rendezvenyID from Rendezveny',
  );
}

export function findSzervezo(nev, rendezvenyId) {
  return connectionPool.query('select Szervezo.szervezoID from Szervezo Where Szervezo.szervezoNev = ? And Szervezo.szervezoNev = ?', [nev, rendezvenyId]);
}
