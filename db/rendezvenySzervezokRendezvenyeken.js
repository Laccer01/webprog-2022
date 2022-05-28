import { connectionPool } from './rendezvenyekTablak.js';

import {
  findSzervezoIDNevvel,
} from './rendezvenyekSzervezo.js';

export function findSzervezoRendezvenyen(szervezoID, rendezvenyID) {
  const szervezoIDreturn = connectionPool.query(`SELECT RendezokRendezvenyeken.kapcsolatID 
            FROM RendezokRendezvenyeken
            Where RendezokRendezvenyeken.rendezvenyID = ? and RendezokRendezvenyeken.szervezoID`, [rendezvenyID, szervezoID]);
  return szervezoIDreturn;
}

export async function findSzervezoNevRendezvenyen(szervezoNev, rendezvenyID) {
  const szervezoID = await findSzervezoIDNevvel(szervezoNev);

  const szervezoIDreturn = connectionPool.query(`SELECT RendezokRendezvenyeken.kapcsolatID 
        FROM RendezokRendezvenyeken
        Where RendezokRendezvenyeken.rendezvenyID = ? And RendezokRendezvenyeken.szervezoID = ?`, [rendezvenyID, szervezoID[0][0].szervezoID]);

  return szervezoIDreturn;
}

export async function findSzervezoRendezvenyken(szervezoNev, rendezvenyId) {
  const szervezoID = await findSzervezoIDNevvel(szervezoNev);

  return connectionPool.query(`select RendezokRendezvenyeken.kapcsolatID from RendezokRendezvenyeken
  Where RendezokRendezvenyeken.rendezvenyID = ?
  And RendezokRendezvenyeken.szervezoID = ?`, [rendezvenyId, szervezoID[0][0].szervezoID]);
}

export async function insertSzervezok(szervezoValasztasa, szervezoNev, rendezvenyID) {
  let beszurtRendezvenySzervezo;
  const szervezoID = await findSzervezoIDNevvel(szervezoNev);
  if (szervezoValasztasa === 'csatlakozas') {
    if ((await findSzervezoRendezvenyen(szervezoID[0][0].szervezoID, rendezvenyID))[0] !== []) {
      beszurtRendezvenySzervezo = connectionPool.query(`insert into RendezokRendezvenyeken 
            values (default, ?, ?)`, [rendezvenyID, szervezoID[0][0].szervezoID]);
    }
  } else if ((await findSzervezoRendezvenyen(
    szervezoID[0][0].szervezoID,
    rendezvenyID,
  ))[0] !== []) {
    // csak egy eseményhez tartozik a szervező
    beszurtRendezvenySzervezo = connectionPool.query(`DELETE From RendezokRendezvenyeken 
        Where RendezokRendezvenyeken.rendezvenyID = ? 
        and RendezokRendezvenyeken.szervezoID = ?`, [rendezvenyID, szervezoID[0][0].szervezoID]);
  }
  return beszurtRendezvenySzervezo;
}

export async function findSzervezo(nev, rendezvenyId) {
  const szervezoID = await findSzervezoIDNevvel(nev);
  return connectionPool.query(`select RendezokRendezvenyeken.szervezoID
        from RendezokRendezvenyeken
        Where RendezokRendezvenyeken.szervezoID = ? And RendezokRendezvenyeken.rendezvenyID = ?`, [szervezoID, rendezvenyId]);
}
