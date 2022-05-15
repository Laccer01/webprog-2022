import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyID,
} from './redezvenyekRendezveny.js';

export function findSzervezoID(szervezo) {
  const szervezoID = connectionPool.query(`SELECT szervezoID 
        FROM Szervezo
        Where Szervezo.szervezoID = ? `, [szervezo['form-rendezvenySzervezo']]);

  return szervezoID;
}

export function findSzervezoIDNevvel(szervezo) {
  const szervezoID = connectionPool.query(`SELECT szervezoID 
          FROM Szervezo
          Where Szervezo.nev = ? `, [szervezo]);
  return szervezoID;
}

export function insertSzervezok(szervezo) {
  let beszurtRendezvenySzervezo;
  if (szervezo['form-rendezvenySzervezoValasztas'] === 'csatlakozas') {
    if (findSzervezoID(szervezo) !== undefined) {
      beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
          values (default, ?, ?)`, [szervezo['form-rendezvenySzervezo'], szervezo['form-rendezvenyID']]);
    }
  } else if (findSzervezoID(szervezo) !== undefined) {
    beszurtRendezvenySzervezo = connectionPool.query(`DELETE From Szervezo 
          Where Szervezo.szervezoNev = ? and Szervezo.rendezvenyID = ?`, [szervezo['form-rendezvenySzervezo'], szervezo['form-rendezvenyID']]);
  }
  return beszurtRendezvenySzervezo;
}

export function findAllSzervezo() {
  return connectionPool.query('select * from Szervezo');
}

export async function findAllSzervezoFromRendezveny(rendezvenyID) {
  return connectionPool.query('select * from Szervezo Where Szervezo.rendezvenyID = ?', [rendezvenyID]);
}

export async function findRendezvenySzervezokNevei() {
  return connectionPool.query(
    'select Szervezo.szervezoNev from Szervezo',
  );
}

export function findSzervezo(nev, rendezvenyId) {
  return connectionPool.query('select Szervezo.szervezoID from Szervezo Where Szervezo.szervezoNev = ? And Szervezo.rendezvenyID = ?', [nev, rendezvenyId]);
}

export async function findAllSzervezoFromRendezvenyek(rendezvenyek) {
  const rendezvenyekSzervezok = [];
  await Promise.all(rendezvenyek[0].map(async (rendezveny) => {
    const rendezvenySzervezok = await findAllSzervezoFromRendezveny(rendezveny.rendezvenyID);
    rendezvenyekSzervezok.push(rendezvenySzervezok[0]);
  }));

  return rendezvenyekSzervezok;
}

export async function insertRendezvenySzervezok(rendezveny) {
  const beszurtRendezvenySzervezok = [];

  let rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezveny);

  if  (rendezvenyIDjelenlegiDic.toString() !== '') {
    setTimeout(() => {
    }, 10000);
    rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezveny);
  }
  rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezveny);

  // Valamiért néha nem találja meg a rendezvényId mert még nincs
  // beszúrva az adatbázisban ezért van ez a megoldás hogy megvárja
  // amíg beszúródik a megelelő rendezvény

  const szervezok = rendezveny['form-rendezvenySzervezok'].split(', ');

  let beszurtRendezvenySzervezo;

  await Promise.all(szervezok.map(async (szervezoJelenlegi) => {
    beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?)`, [szervezoJelenlegi, rendezvenyIDjelenlegiDic[0][0].rendezvenyID]);
    beszurtRendezvenySzervezok.push(beszurtRendezvenySzervezo);
  }));
  return beszurtRendezvenySzervezok;
}
