import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyNevvel,
} from './redezvenyekRendezveny.js';

import {
  findSzervezoIDNevvel,
} from './rendezvenyekSzervezo.js';

export async function reszfeladatBeszuras(
  feladatNev,
  rendezvenyIDJelenlegi,
  feladatLeiras,
  feladatHataridoKezdete,
  feladatHataridoVege,
) {
  await connectionPool.query(`insert into RendezvenyReszfeladatok 
          values (default, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [rendezvenyIDJelenlegi, feladatNev, feladatLeiras, feladatHataridoKezdete, feladatHataridoVege, feladatHataridoKezdete, feladatHataridoKezdete, null, 'aktiv']);

  // return beszurtRendezvenySzervezo[0][0];

  const beszurtReszfeladatID = await connectionPool.query(`SELECT RendezvenyReszfeladatok.reszfeladatID
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatNeve = ? AND RendezvenyReszfeladatok.reszfeladatLeiras = ? AND RendezvenyReszfeladatok.reszfeladatHataridoKezdete = ? AND RendezvenyReszfeladatok.reszfeladatHataridoVege = ?`, [rendezvenyIDJelenlegi, feladatNev, feladatLeiras, feladatHataridoKezdete, feladatHataridoVege]);

  return beszurtReszfeladatID[0][0].reszfeladatID;
}

export async function findAllreszfeladatok(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladat = await connectionPool.query(`SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ?`, [rendezvenyID]);
  return osszesReszfeladat;
}

export async function findAllreszfeladatokSzervezo(rendezvenyNev, szervezoNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const { szervezoID } = (await findSzervezoIDNevvel(szervezoNev))[0][0];
  const osszesReszfeladat = await connectionPool.query(`SELECT *
      FROM RendezvenyReszfeladatok
      JOIN RendezvenyReszfeladatokSzervezok ON RendezvenyReszfeladatokSzervezok.reszfeladatID = RendezvenyReszfeladatok.reszfeladatID

      WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatokSzervezok.szervezoID = ?`, [rendezvenyID, szervezoID]);
  return osszesReszfeladat;
}

export async function findMegoldottReszfeladatok(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladat = await connectionPool.query(`SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ?`, [rendezvenyID, null]);
  return osszesReszfeladat[0].length;
}

export async function findTullepettHataridokLeadott(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const osszesReszfeladat = await connectionPool.query(
    `SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum > RendezvenyReszfeladatok.reszfeladatHataridoVege`,
    [rendezvenyID, null],
  );
  return osszesReszfeladat[0].length;
}

export async function findTullepettHataridokNemLeadott(rendezvenyNev) {
  const { rendezvenyID } = (await findRendezvenyNevvel(rendezvenyNev))[0][0];
  const maiDatum = new Date();
  const maiDatumFormat = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;

  const osszesReszfeladat = await connectionPool.query(
    `SELECT *
    FROM RendezvenyReszfeladatok
    WHERE RendezvenyReszfeladatok.rendezvenyID = ? AND RendezvenyReszfeladatok.reszfeladatLeadottDatum != ? AND ?> RendezvenyReszfeladatok.reszfeladatHataridoVege`,
    [rendezvenyID, null, maiDatumFormat],
  );
  return osszesReszfeladat[0].length;
}

export async function reszfeladatLeadasa(reszfeladatID) {
  const maiDatum = new Date();
  const maiDatumFormatDatum = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;
  const maiDatumFormatIdo = `${maiDatum.getHours()}:${maiDatum.getMinutes()}:${maiDatum.getSeconds()}`;
  const maiDatumFormatFull = `${maiDatumFormatDatum} ${maiDatumFormatIdo}`;

  // console.log(maiDatumFormat);
  const leadva =  await connectionPool.query(
    `UPDATE RendezvenyReszfeladatok
        SET RendezvenyReszfeladatok.reszfeladatLeadottDatum = ?, RendezvenyReszfeladatok.reszfeladatStatus = ?
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [maiDatumFormatFull, 'leadva', reszfeladatID],
  );
  return leadva;
}

export async function leadasiDatum(reszfeladatID) {
  const leadasiDatumEredmeny =  await connectionPool.query(
    `SELECT RendezvenyReszfeladatok.reszfeladatLeadottDatum
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [reszfeladatID],
  );
  return leadasiDatumEredmeny[0][0].reszfeladatLeadottDatum;
}

export async function reszfeladatModositasiDatum(reszfeladatID) {
  const maiDatum = new Date();
  const maiDatumFormatDatum = `${maiDatum.getFullYear()}-${maiDatum.getMonth() + 1}-${maiDatum.getDate()}`;
  const maiDatumFormatIdo = `${maiDatum.getHours()}:${maiDatum.getMinutes()}:${maiDatum.getSeconds()}`;
  const maiDatumFormatFull = `${maiDatumFormatDatum} ${maiDatumFormatIdo}`;

  // console.log(maiDatumFormat);
  const leadva =  await connectionPool.query(
    `UPDATE RendezvenyReszfeladatok
        SET RendezvenyReszfeladatok.reszfeladatUtolsoModositas = ?
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [maiDatumFormatFull, reszfeladatID],
  );
  return leadva;
}

export async function modositottDatum(reszfeladatID) {
  const leadasiDatumEredmeny =  await connectionPool.query(
    `SELECT RendezvenyReszfeladatok.reszfeladatUtolsoModositas
        FROM RendezvenyReszfeladatok
        WHERE RendezvenyReszfeladatok.reszfeladatID = ?`,
    [reszfeladatID],
  );
  return leadasiDatumEredmeny[0][0].reszfeladatUtolsoModositas;
}
