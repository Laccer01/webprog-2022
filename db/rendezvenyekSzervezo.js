import bcrypt from 'bcrypt';

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
  const szervezoIDreturn = connectionPool.query(`SELECT szervezoID 
          FROM Szervezo
          Where Szervezo.szervezoNev = ? `, [szervezo]);
  return szervezoIDreturn;
}

export function findAllSzervezo() {
  return connectionPool.query('select * from Szervezo');
}

export async function findRendezvenySzervezokNevei() {
  return connectionPool.query(
    `select DISTINCT Szervezo.szervezoNev from Szervezo 
    Where Szervezo.szerepkor = 'szervezo'`,
  );
}

export async function findAllSzervezoFromRendezveny(rendezvenyID) {
  const szervezokIDRendezvenyrol = await connectionPool.query('select * from RendezokRendezvenyeken Where RendezokRendezvenyeken.rendezvenyID = ?', [rendezvenyID]);
  return szervezokIDRendezvenyrol;
}

export function findSzervezoNev(szervezoID) {
  return connectionPool.query('select Szervezo.szervezoNev from Szervezo Where Szervezo.szervezoID = ?', [szervezoID]);
}

export function findSzervezoMinden(szervezoID) {
  return connectionPool.query('select * from Szervezo Where Szervezo.szervezoID = ?', [szervezoID]);
}

export async function findAllSzervezoFromRendezvenyekID(rendezvenyek) {
  const rendezvenyekSzervezok = [];
  await Promise.all(rendezvenyek[0].map(async (rendezveny) => {
    const rendezvenySzervezok = await findAllSzervezoFromRendezveny(rendezveny.rendezvenyID);
    rendezvenyekSzervezok.push(rendezvenySzervezok[0]);
  }));

  return rendezvenyekSzervezok;
}

export async function findAllSzervezoFromRendezvenyek(rendezvenyek) {
  const szervezok = await findAllSzervezoFromRendezvenyekID(rendezvenyek);

  const rendezvenyekSzervezok = [];
  await Promise.all(szervezok[0].map(async (rendezveny) => {
    const rendezvenySzervezok = await findSzervezoMinden(rendezveny.szervezoID);
    rendezvenyekSzervezok.push(rendezvenySzervezok[0][0]);
  }));

  return rendezvenyekSzervezok;
}

export async function findAllSzervezoNevekFromRendezvenyek(rendezvenyek) {
  const rendezvenyekSzervezok = [];
  await Promise.all(rendezvenyek[0].map(async (rendezveny) => {
    const rendezvenySzervezok = await findAllSzervezoFromRendezveny(rendezveny.rendezvenyID);
    rendezvenyekSzervezok.push(rendezvenySzervezok[0][1]);
  }));

  return rendezvenyekSzervezok;
}

export async function insertRendezvenySzervezok(rendezvenyNev, rendezvenySzervezok) {
  const beszurtRendezvenySzervezok = [];

  let rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);

  if  (rendezvenyIDjelenlegiDic.toString() !== '') {
    setTimeout(() => {
    }, 15000000);
    rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);
  }
  rendezvenyIDjelenlegiDic = await findRendezvenyID(rendezvenyNev);
  // Valamiért néha nem találja meg a rendezvényId mert még nincs
  // beszúrva az adatbázisban ezért van ez a megoldás hogy megvárja
  // amíg beszúródik a megelelő rendezvény

  const szervezok = rendezvenySzervezok.split(', ');

  let beszurtRendezvenySzervezo;

  await Promise.all(szervezok.map(async (szervezoJelenlegi) => {
    const jelenlegiSzervzo = await connectionPool.query(`SELECT Szervezo.szervezoID
    FROM Szervezo
    Where  Szervezo.szervezoNev = ?`, [szervezoJelenlegi]);

    if (jelenlegiSzervzo[0].toString() === '') {
      const szervezoNev = `jelszo${szervezoJelenlegi.toString()}`;
      const password = bcrypt.hashSync(szervezoNev, 10);

      beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?, ?)`, [szervezoJelenlegi, 'szervezo', password]);
      beszurtRendezvenySzervezok.push(beszurtRendezvenySzervezo);
    }
  }));
  return beszurtRendezvenySzervezok;
}

export async function insertSzervezokRendezvenyeken(rendezvenyNev, rendezvenySzervezok) {
  await insertRendezvenySzervezok(rendezvenyNev, rendezvenySzervezok);
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
  let szervezoID;

  await Promise.all(szervezok.map(async (szervezoJelenlegi) => {
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);

    setTimeout(() => {
    }, 150000000);
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);
    setTimeout(() => {
    }, 150000000);
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);

    setTimeout(() => {
    }, 150000000);
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);

    setTimeout(() => {
    }, 150000000);
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);

    beszurtRendezvenySzervezo = connectionPool.query(`insert into RendezokRendezvenyeken 
        values (default, ?, ?)`, [rendezvenyIDjelenlegiDic[0][0].rendezvenyID, szervezoID[0][0].szervezoID]);
    beszurtRendezvenySzervezok.push(beszurtRendezvenySzervezo);
  }));
  return beszurtRendezvenySzervezok;
}

export async function megfeleloFelhasznalo(felhasznaloNev, felhasznaloJelszo) {
  const felhasznaloJelszoHash = await connectionPool.query(`SELECT Szervezo.jelszo
  FROM Szervezo
  Where Szervezo.szervezoNev = ?`, [felhasznaloNev]);

  if (felhasznaloJelszoHash[0][0]) {
    const isValid = await bcrypt.compare(felhasznaloJelszo, felhasznaloJelszoHash[0][0].jelszo);
    return isValid;
  }
  return false;
}

export async function letezikFelhasznalo(felhasznaloNev) {
  const felhasznalo = await connectionPool.query(
    `SELECT *
  FROM Szervezo
  Where Szervezo.szervezoNev = ?`,
    [felhasznaloNev],
  );

  return (felhasznalo[0][0]);
}

export async function felhasznaloBeszuras(felhasznaloNev, felhasznaloJelszo, felhasznaloSzerepkor) {
  const password = bcrypt.hashSync(felhasznaloJelszo, 10);
  const beszurtRendezvenySzervezo = connectionPool.query(`insert into Szervezo 
        values (default, ?, ?, ?)`, [felhasznaloNev, felhasznaloSzerepkor, password]);

  return beszurtRendezvenySzervezo;
}

export async function felhasznaloSzerepkore(felhasznaloNev) {
  const szervezoSzerepkor = await connectionPool.query(`SELECT Szervezo.szerepkor
        FROM Szervezo
        Where Szervezo.szervezoNev = ? `, [felhasznaloNev]);

  return szervezoSzerepkor[0][0].szerepkor;
}
