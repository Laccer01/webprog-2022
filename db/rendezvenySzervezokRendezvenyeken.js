import { connectionPool } from './rendezvenyekTablak.js';

import {
  findSzervezoIDNevvel,
} from './rendezvenyekSzervezo.js';

// visszatériti a kapcsolat Id-t, azaz ha létezik az a szervező azon az eseményen
export function findSzervezoRendezvenyen(szervezoID, rendezvenyID) {
  const szervezoIDreturn = connectionPool.query(`SELECT RendezokRendezvenyeken.kapcsolatID 
            FROM RendezokRendezvenyeken
            Where RendezokRendezvenyeken.rendezvenyID = ? and RendezokRendezvenyeken.szervezoID`, [rendezvenyID, szervezoID]);
  return szervezoIDreturn;
}

// visszatériti a kapcsolat Id-t, azaz ha létezik az a szervező azon az eseményen
// szervező névvel megadva
export async function findSzervezoNevRendezvenyen(szervezoNev, rendezvenyID) {
  const szervezoID = await findSzervezoIDNevvel(szervezoNev);
  let szervezoIDreturn;
  if (szervezoID[0][0] !== undefined) {
    szervezoIDreturn = connectionPool.query(`SELECT RendezokRendezvenyeken.kapcsolatID 
        FROM RendezokRendezvenyeken
        Where RendezokRendezvenyeken.rendezvenyID = ? And RendezokRendezvenyeken.szervezoID = ?`, [rendezvenyID, szervezoID[0][0].szervezoID]);
  }

  return szervezoIDreturn;
}

// visszatériti a kapcsolat Id-t, azaz ha létezik az a szervező azon az eseményen
// szervező névvel megadva
export async function findSzervezoRendezvenyken(szervezoNev, rendezvenyId) {
  const szervezoID = await findSzervezoIDNevvel(szervezoNev);

  return connectionPool.query(`select RendezokRendezvenyeken.kapcsolatID from RendezokRendezvenyeken
  Where RendezokRendezvenyeken.rendezvenyID = ?
  And RendezokRendezvenyeken.szervezoID = ?`, [rendezvenyId, szervezoID[0][0].szervezoID]);
}

// beszúrja a szervezoket a megfelelő táblába
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

// visszatériti a szervezőt a megfelelő rendezvényen
export async function findSzervezo(nev, rendezvenyId) {
  const szervezoID = await findSzervezoIDNevvel(nev);
  return connectionPool.query(`select RendezokRendezvenyeken.szervezoID
        from RendezokRendezvenyeken
        Where RendezokRendezvenyeken.szervezoID = ? And RendezokRendezvenyeken.rendezvenyID = ?`, [szervezoID[0][0].szervezoID, rendezvenyId]);
}
