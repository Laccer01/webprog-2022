import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyNevvel,
} from './redezvenyekRendezveny.js';

export function findRendezvenyIdRendezvenyKepek(Kep) {
  const rendezvenyID = connectionPool.query(`SELECT RendezvenyKepek.rendezvenyID
        FROM RendezvenyKepek
        Where RendezvenyKepek.utvonal = ? `, [Kep]);
  return rendezvenyID;
}

export function insertRendezvenyKepek(rendezveny) {
  const fileHandler = rendezveny.files['form-rendezvenyFenykep'];
  const file = fileHandler.path;
  const fileLista = file.split('\\');

  if (rendezveny.fields['form-rendezvenyID'] === undefined) {
    return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezveny.query.rendezvenyID, fileLista[fileLista.length - 1]]);
  }

  return connectionPool.query(`insert into RendezvenyKepek 
    values (default, ?, ?)`, [rendezveny.fields['form-rendezvenyID'], fileLista[fileLista.length - 1]]);
}

export function findAllRendezvenyKepek() {
  return connectionPool.query('select * from RendezvenyKepek');
}

export async function findAllRendezvenyKepei(rendezvenyNev) {
  const rendezvenyIDjelenlegiDic =  await findRendezvenyNevvel(rendezvenyNev);

  const jelenlegirendezvenyID = Object.values(rendezvenyIDjelenlegiDic[0][0])[0];
  const jelenlegirendezvenyKepei =  connectionPool.query('select RendezvenyKepek.utvonal from RendezvenyKepek Where RendezvenyKepek.rendezvenyID = ?', [jelenlegirendezvenyID]);

  return jelenlegirendezvenyKepei;
}
