import { connectionPool } from './rendezvenyekTablak.js';

export async function findRendezvenyID(rendezvenyNev) {
  const  rendezvenyID = connectionPool.query(`SELECT Rendezveny.rendezvenyID
      FROM Rendezveny
      Where Rendezveny.nev =?`, [rendezvenyNev]);

  return rendezvenyID;
}

export async function findRendezvenyNev(rendezvenyID) {
  const  RendezvenyNev = await connectionPool.query(`SELECT Rendezveny.nev
        FROM Rendezveny
          Where Rendezveny.rendezvenyID =?`, [rendezvenyID]);
  return RendezvenyNev[0][0];
}

export async function findRendezvenyNevvel(rendezvenyNev) {
  const  rendezvenyID = connectionPool.query(`SELECT Rendezveny.rendezvenyID
        FROM Rendezveny
        Where Rendezveny.nev =?`, [rendezvenyNev]);

  return rendezvenyID;
}

export function findAllRendezveny() {
  return connectionPool.query('select * from Rendezveny');
}

export function findRendezvenyWithId(id) {
  return connectionPool.query('select * from Rendezveny Where Rendezveny.rendezvenyID = ?', [id]);
}

export function findAllRendezvenyID() {
  return connectionPool.query(
    'select unique(Rendezveny.rendezvenyID) from Rendezveny',
  );
}

export async function findRendezvenyIdk() {
  return connectionPool.query(
    'select Rendezveny.rendezvenyID from Rendezveny',
  );
}

export async function insertRendezveny(
  rendezvenyNev,
  rendezvenyKezdesiIdopont,
  rendezvenyVegeIdopont,
  rendezvenyHelyszine,
) {
  const beszurtRendezvenyek = [];
  const beszurtRendezveny = connectionPool.query(`insert into Rendezveny 
        values (default, ?, ?, ?, ?)`, [rendezvenyNev, rendezvenyKezdesiIdopont, rendezvenyVegeIdopont, rendezvenyHelyszine]);

  beszurtRendezvenyek.push(beszurtRendezveny);

  return beszurtRendezvenyek;
}
