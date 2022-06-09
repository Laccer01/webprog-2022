import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyNevvel,
} from './redezvenyekRendezveny.js';

import {
  findSzervezoIDNevvel,
} from './rendezvenyekSzervezo.js';

// részfeladat beszúrása
export async function reszfeladatBeszuras(
  feladatNev,
  rendezvenyIDJelenlegi,
  feladatLeiras,
  feladatHataridoKezdete,
  feladatHataridoVege,
) {
  await connectionPool.query(`insert into RendezvenyReszfeladatok 
          values (default, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [rendezvenyIDJelenlegi, feladatNev, feladatLeiras, feladatHataridoKezdete, feladatHataridoVege, feladatHataridoKezdete, feladatHataridoKezdete, null, 'aktiv']);

  const beszurtReszfeladatID = await connectionPool.query(`SELECT RendezvenyReszfeladatok.reszfeladatID
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatNeve = ? AND RendezvenyReszfeladatok.reszfeladatLeiras = ? AND RendezvenyReszfeladatok.reszfeladatHataridoKezdete = ? AND RendezvenyReszfeladatok.reszfeladatHataridoVege = ?`, [rendezvenyIDJelenlegi, feladatNev, feladatLeiras, feladatHataridoKezdete, feladatHataridoVege]);

  return beszurtReszfeladatID[0][0].reszfeladatID;
}

// meghatározza az összes részfeladatot
export async function findAllreszfeladatok(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladatEredmeny = await connectionPool.query(`SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ?`, [rendezvenyID]);
  return osszesReszfeladatEredmeny;
}

// meghatározza az összes szervezőt egy adott részfeladaton
export async function findAllreszfeladatokSzervezo(rendezvenyNev, szervezoNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const { szervezoID } = (await findSzervezoIDNevvel(szervezoNev))[0][0];
  const osszesReszfeladatEredmeny = await connectionPool.query(`SELECT *
      FROM RendezvenyReszfeladatok
      JOIN RendezvenyReszfeladatokSzervezok ON RendezvenyReszfeladatokSzervezok.reszfeladatID = RendezvenyReszfeladatok.reszfeladatID

      WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatokSzervezok.szervezoID = ?`, [rendezvenyID, szervezoID]);
  return osszesReszfeladatEredmeny;
}

// meghatározza az összes megoldott részfeladatot
export async function findMegoldottReszfeladatok(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladatEredmeny = await connectionPool.query(`SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ?`, [rendezvenyID, null]);
  return osszesReszfeladatEredmeny[0].length;
}

// meghatározza az összes részfeladatot amelyek túllépett a határidője
// amelyek le vannak adva
export async function findTullepettHataridokLeadott(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladatEredmeny = await connectionPool.query(
    `SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum > RendezvenyReszfeladatok.reszfeladatHataridoVege`,
    [rendezvenyID, null],
  );
  return osszesReszfeladatEredmeny[0].length;
}

// meghatározza az összes részfeladatot amelyek túllépett a határidője
// amelyek nincsenek leadva
export async function findTullepettHataridokNemLeadott(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const maiDatum = new Date();
  const maiDatumFormat = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;

  const osszesReszfeladatEredmeny = await connectionPool.query(
    `SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ? AND ?> RendezvenyReszfeladatok.reszfeladatHataridoVege`,
    [rendezvenyID, null, maiDatumFormat],
  );
  return osszesReszfeladatEredmeny[0].length;
}

// lead egy részfeladatot
export async function reszfeladatLeadasa(reszfeladatID) {
  const maiDatum = new Date();
  const maiDatumFormatDatum = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;
  const maiDatumFormatIdo = `${maiDatum.getHours()}:${maiDatum.getMinutes()}:${maiDatum.getSeconds()}`;
  const maiDatumFormatFull = `${maiDatumFormatDatum} ${maiDatumFormatIdo}`;

  const leadva =  await connectionPool.query(
    `UPDATE RendezvenyReszfeladatok
        SET RendezvenyReszfeladatok.reszfeladatLeadottDatum = ?, RendezvenyReszfeladatok.reszfeladatStatus = ?
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [maiDatumFormatFull, 'leadva', reszfeladatID],
  );
  return leadva;
}

// beállítja egy részfeladat leadási dátumát
export async function leadasiDatum(reszfeladatID) {
  const leadasiDatumEredmeny =  await connectionPool.query(
    `SELECT RendezvenyReszfeladatok.reszfeladatLeadottDatum
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [reszfeladatID],
  );
  return leadasiDatumEredmeny[0][0].reszfeladatLeadottDatum;
}

// beállítja egy részfeladat utolsó módosítási dátumát
export async function reszfeladatModositasiDatum(reszfeladatID) {
  const maiDatum = new Date();
  const maiDatumFormatDatum = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;
  const maiDatumFormatIdo = `${maiDatum.getHours()}:${maiDatum.getMinutes()}:${maiDatum.getSeconds()}`;
  const maiDatumFormatFull = `${maiDatumFormatDatum} ${maiDatumFormatIdo}`;

  const leadva =  await connectionPool.query(
    `UPDATE RendezvenyReszfeladatok
        SET RendezvenyReszfeladatok.reszfeladatUtolsoModositas = ?
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [maiDatumFormatFull, reszfeladatID],
  );
  return leadva;
}

// visszatériti egy reszfeladat utolsó módosítási dátumát
export async function modositottDatum(reszfeladatID) {
  const leadasiDatumEredmeny =  await connectionPool.query(
    `SELECT RendezvenyReszfeladatok.reszfeladatUtolsoModositas
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [reszfeladatID],
  );
  return leadasiDatumEredmeny[0][0].reszfeladatUtolsoModositas;
}

// visszatériti az össszes reszfeladatot
export async function osszesReszfeladat() {
  const reszfeladatOsszes = await connectionPool.query(
    `SELECT *
            FROM RendezvenyReszfeladatok
            JOIN RendezvenyReszfeladatokSzervezok ON RendezvenyReszfeladatokSzervezok.reszfeladatID = RendezvenyReszfeladatok.reszfeladatID
            JOIN Szervezo ON Szervezo.szervezoID = RendezvenyReszfeladatokSzervezok.szervezoID`,
  );
  return reszfeladatOsszes[0];
}
