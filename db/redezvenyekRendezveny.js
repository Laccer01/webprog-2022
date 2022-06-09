import { connectionPool } from './rendezvenyekTablak.js';

//visszatériti egy rendezveny id-ját ha meg van adva a neve
export async function findRendezvenyID(rendezvenyNev) {
  const  rendezvenyID = connectionPool.query(`SELECT Rendezveny.rendezvenyID
      FROM Rendezveny
      Where Rendezveny.nev =?`, [rendezvenyNev]);

  return rendezvenyID;
}

//visszatériti egy rendezveny nevét ha meg van adva az idja
export async function findRendezvenyNev(rendezvenyID) {
  const  RendezvenyNev = await connectionPool.query(`SELECT Rendezveny.nev
        FROM Rendezveny
          Where Rendezveny.rendezvenyID =?`, [rendezvenyID]);
  return RendezvenyNev[0][0];
}

//visszatériti egy rendezveny id-ját ha meg van adva a neve
export async function findRendezvenyNevvel(rendezvenyNev) {
  const  rendezvenyID = connectionPool.query(`SELECT Rendezveny.rendezvenyID
        FROM Rendezveny
        Where Rendezveny.nev =?`, [rendezvenyNev]);

  return rendezvenyID;
}

//visszatériti az össszes rendezvenyt
export function findAllRendezveny() {
  return connectionPool.query('select * from Rendezveny');
}

//visszatériti a megadott id-s rendezvenyt
export function findRendezvenyWithId(id) {
  return connectionPool.query('select * from Rendezveny Where Rendezveny.rendezvenyID = ?', [id]);
}

//visszatériti az össszes rendezvenyId-t (különvöző)
export function findAllRendezvenyID() {
  return connectionPool.query(
    'select unique(Rendezveny.rendezvenyID) from Rendezveny',
  );
}

//visszatériti az össszes rendezvenyId-t
export async function findRendezvenyIdk() {
  return connectionPool.query(
    'select Rendezveny.rendezvenyID from Rendezveny',
  );
}

//beszúrunk egy rendezvényt
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
