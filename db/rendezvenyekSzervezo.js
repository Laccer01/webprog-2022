import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyID,
} from './redezvenyekRendezveny.js';

export function findSzervezoID(szervezoNev) {
  const szervezoID = connectionPool.query(`SELECT szervezoID 
        FROM Szervezo
        Where Szervezo.szervezoID = ? `, [szervezoNev]);

  return szervezoID;
}

export function findSzervezoIDNevvel(szervezo) {
  const szervezoID = connectionPool.query(`SELECT szervezoID 
          FROM Szervezo
          Where Szervezo.nev = ? `, [szervezo]);
  return szervezoID;
}

export function insertSzervezok(szervezoValasztasa, szervezoNev, szervezoID) {
  let beszurtRendezvenySzervezo;
  if (szervezoValasztasa === 'csatlakozas') {
    if (findSzervezoID(szervezoNev) !== undefined) {
      beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
          values (default, ?, ?)`, [szervezoNev, szervezoID]);
    }
  } else if (findSzervezoID(szervezoNev) !== undefined) {
    beszurtRendezvenySzervezo = connectionPool.query(`DELETE From Szervezo 
          Where Szervezo.szervezoNev = ? and Szervezo.rendezvenyID = ?`, [szervezoNev, szervezoID]);
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
    'select DISTINCT Szervezo.szervezoNev from Szervezo',
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

export async function insertRendezvenySzervezok(rendezvenyNev, rendezvenySzervezok) {
  const beszurtRendezvenySzervezok = [];

  let rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);

  if  (rendezvenyIDjelenlegiDic.toString() !== '') {
    setTimeout(() => {
    }, 10000);
    rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);
  }
  rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);
  // Valamiért néha nem találja meg a rendezvényId mert még nincs
  // beszúrva az adatbázisban ezért van ez a megoldás hogy megvárja
  // amíg beszúródik a megelelő rendezvény

  const szervezok = rendezvenySzervezok.split(', ');

  let beszurtRendezvenySzervezo;

  await Promise.all(szervezok.map(async (szervezoJelenlegi) => {
    beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?)`, [szervezoJelenlegi, rendezvenyIDjelenlegiDic[0][0].rendezvenyID]);
    beszurtRendezvenySzervezok.push(beszurtRendezvenySzervezo);
  }));
  return beszurtRendezvenySzervezok;
}
