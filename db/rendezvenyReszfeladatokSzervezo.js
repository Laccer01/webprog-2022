import { connectionPool } from './rendezvenyekTablak.js';

import {
  findSzervezoIDNevvel,
} from './rendezvenyekSzervezo.js';

export async function insertSzervezokReszfeladat(rendezvenyID, rendezvenySzervezok) {
  const beszurtRendezvenySzervezok = [];

  const szervezok = rendezvenySzervezok.split(', ');

  let beszurtRendezvenySzervezo;
  let szervezoID;

  await Promise.all(szervezok.map(async (szervezoJelenlegi) => {
    szervezoID = await findSzervezoIDNevvel(szervezoJelenlegi);
    if (szervezoID !== undefined) {
      beszurtRendezvenySzervezo = connectionPool.query(`insert into RendezvenyReszfeladatokSzervezok 
            values (default, ?, ?)`, [rendezvenyID, szervezoID[0][0].szervezoID]);
      beszurtRendezvenySzervezok.push(beszurtRendezvenySzervezo);
    }
  }));
  return beszurtRendezvenySzervezok;
}

export async function findallSzervezoIDReszfeladatokon(osszesReszfeladat) {
  const beszurtRendezvenySzervezok = [];
  let reszfeladatSzervezok;
  await Promise.all(osszesReszfeladat.map(async (jelenlegiReszfeladat) => {
    reszfeladatSzervezok = await connectionPool.query(`select RendezvenyReszfeladatokSzervezok.szervezoID
        from RendezvenyReszfeladatokSzervezok
        Where RendezvenyReszfeladatokSzervezok.reszfeladatID = ?`, [jelenlegiReszfeladat.reszfeladatID]);
    beszurtRendezvenySzervezok.push(reszfeladatSzervezok[0]);
  }));
  return beszurtRendezvenySzervezok;
}

export async function findallSzervezoNevReszfeladatokon(reszfeladatokSzervezoID) {
  const reszfeladatokSzervezoNevek = [];
  let jelenlegiReszfeladatSzervezok = [];
  await Promise.all(reszfeladatokSzervezoID.map(async () => {
    jelenlegiReszfeladatSzervezok = [];

    reszfeladatokSzervezoNevek.push
      .apply(reszfeladatokSzervezoNevek, [jelenlegiReszfeladatSzervezok]);
  }));
  return reszfeladatokSzervezoNevek;
}

export async function findReszfeladatonDolgozik(reszfeladatID, szervezoID) {
  const jelenlegiSzervezo = await connectionPool.query(`select RendezvenyReszfeladatokSzervezok.reszfeladatSzervezoID
          from RendezvenyReszfeladatokSzervezok
          Where RendezvenyReszfeladatokSzervezok.reszfeladatID = ? And RendezvenyReszfeladatokSzervezok.szervezoID = ?`, [reszfeladatID, szervezoID]);

  return jelenlegiSzervezo[0][0];
}

export async function
insertSzervezokReszfeladatokra(csatlakozasVagyKilepes, szervezoID, reszfeladatID) {
  let beszurtRendezvenySzervezo;
  if (csatlakozasVagyKilepes === 'hozzaadas') {
    beszurtRendezvenySzervezo = connectionPool.query(`insert into RendezvenyReszfeladatokSzervezok 
                values (default, ?, ?)`, [reszfeladatID, szervezoID]);
  } else {
    // csak egy eseményhez tartozik a szervező
    beszurtRendezvenySzervezo = connectionPool.query(`DELETE From RendezvenyReszfeladatokSzervezok 
        Where RendezvenyReszfeladatokSzervezok.reszfeladatID = ? 
        and RendezvenyReszfeladatokSzervezok.szervezoID = ?`, [reszfeladatID, szervezoID]);
  }
  return beszurtRendezvenySzervezo;
}

export async function reszfeladatSzervezokNevei(reszfeldatID) {
  const reszfeladatSzervezoi = await connectionPool.query(`select DISTINCT Szervezo.szervezoNev from RendezvenyReszfeladatokSzervezok 
        JOIN Szervezo ON Szervezo.szervezoID = RendezvenyReszfeladatokSzervezok.szervezoID
        Where RendezvenyReszfeladatokSzervezok.reszfeladatID = ?`, [reszfeldatID]);
  return reszfeladatSzervezoi[0];
}
