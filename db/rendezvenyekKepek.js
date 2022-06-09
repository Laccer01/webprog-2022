import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyNevvel,
} from './redezvenyekRendezveny.js';

//visszatéríti egy képnek a rendezvenyID-t ha az útvonal megegyezik
export function findRendezvenyIdRendezvenyKepek(Kep) {
  const rendezvenyID = connectionPool.query(`SELECT RendezvenyKepek.rendezvenyID
        FROM RendezvenyKepek
        Where RendezvenyKepek.utvonal = ? `, [Kep]);
  return rendezvenyID;
}

//beszúr egy képet a megfelelő rendezvényhez
export function insertRendezvenyKepek(rendezvenyKep, rendezvenyID, rendezvenyId) {
  const fileHandler = rendezvenyKep;
  const file = fileHandler.path;
  const fileLista = file.split('\\');

  if (rendezvenyID === undefined) {
    return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezvenyId, fileLista[fileLista.length - 1]]);
  }

  return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezvenyID, fileLista[fileLista.length - 1]]);
}

//meghatározza az összes kéepet
export function findAllRendezvenyKepek() {
  return connectionPool.query('select * from RendezvenyKepek');
}

//meghatározza egy rendezvény összes kéepet
export async function findAllRendezvenyKepei(rendezvenyNev) {
  const rendezvenyIDjelenlegiDic =  await findRendezvenyNevvel(rendezvenyNev);

  const jelenlegirendezvenyID = Object.values(rendezvenyIDjelenlegiDic[0][0])[0];
  const jelenlegirendezvenyKepei =  connectionPool.query('select RendezvenyKepek.utvonal from RendezvenyKepek Where RendezvenyKepek.rendezvenyID = ?', [jelenlegirendezvenyID]);

  return jelenlegirendezvenyKepei;
}
