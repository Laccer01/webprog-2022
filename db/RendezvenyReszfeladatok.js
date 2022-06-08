import { connectionPool } from './rendezvenyekTablak.js';

import {
  findRendezvenyNevvel,
} from './redezvenyekRendezveny.js';

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
