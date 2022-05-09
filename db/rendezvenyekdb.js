import mysql2 from 'mysql2/promise.js';
//ezt kene megirni okesra
//const connection_pool = mysql2.createPool({host: 'pdae.cs.ubbcluj.ro', port: 33060, user: 'seminar524', password: 'seminar524', database: 'seminar524', connectionLimit: 5});

export function createTableRendezvenyek ()
{
  return connection_pool.query(`create table if not exists Rendezveny 
  (rendezvenyID int primary key auto_increment,
    nev VARCHAR(30),
    kezdesiIdo DATETIME,
    vegzesiIdo DATETIME,
    helyszin VARCHAR (30)`);
}

export function createTableSzervezok ()
{
  return connection_pool.query(`create table if not exists Szervezo 
  (szervezoID int primary key auto_increment,
    szervezoNev VARCHAR(30),
    rendezvenyID INT,
    CONSTRAINT FK_Rendezveny_Szervezo FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)`);
}

export function createTableRendezvenyKepek ()
{
  return connection_pool.query(`create table if not exists RendezvenyKepek 
  (rendezvenyKepekId int primary key auto_increment,
    rendezvenyID INT,
    utvonal VARCHAR(50),
    CONSTRAINT FK_Rendezveny_RendezvenyKepek FOREIGN KEY (rendezvenyID) REFERENCES Rendezveny(rendezvenyID)`);
}


export function insertRendezveny(rendezveny)
{
  return connection_pool.query(`insert into Rendezveny 
  values (default, ?, ?, ?, ?)`, [rendezveny.name, rendezveny.startDate, rendezveny.endDate, rendezveny.location]);
}

export function insertSzervezok(szervezo)
{
  return connection_pool.query(`insert into Szervezok 
  values (default, ?, ?)`, [szervezo.name, szervezo.rendezvenyID]);
}

export function insertRendezvenyKepek(rendezveny)
{
  return connection_pool.query(`insert into RendezvenyKepek 
  values (default, ?, ?)`, [rendezveny.ID, rendezveny.picture]);
}

export function findAllRendezveny()
{
  return connection_pool.query('select * from Rendezveny');
}

export function findAllSzervezo()
{
  return connection_pool.query('select * from Szervezo');
}

export function findAllRendezvenyKepek()
{
  return connection_pool.query('select * from RendezvenyKepek');
}

// createTable().then(
// insertChoclate).then(findAllChockolate
     
//   ).catch((err) => {
//     console.error(err);
//   }).then((result)=>{
//     console.log(result[0]);
//   })
