import express from 'express';

import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { secret } from '../config.js';

import {
  findRendezvenySzervezokNevei, findRendezvenySzervezokNeveiRendezvenyrol,
  findSzervezoIDNevvel,

} from '../db/rendezvenyekSzervezo.js';

import {
  findSzervezoRendezvenyken, insertSzervezok,
} from '../db/rendezvenySzervezokRendezvenyeken.js';

import {
  findReszfeladatonDolgozik, insertSzervezokReszfeladatokra,
  reszfeladatSzervezokNevei,
} from '../db/rendezvenyReszfeladatokSzervezo.js';

import {
  reszfeladatLeadasa, leadasiDatum,
  reszfeladatModositasiDatum, modositottDatum,

} from '../db/RendezvenyReszfeladatok.js';

const router = express.Router();

router.use(cookieParser());

// visszatériti egy rendezvény szervezőinek a listáját
router.get('/rendezveny/:id', async (req, res) => {
  try {
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();

    let szervezokLista = 'Szervezők:\n';
    rendezvenySzervezokNevei[0].forEach((szervezok) => {
      szervezokLista += `${szervezok.szervezoNev}, `;
    });

    res.send(JSON.stringify(szervezokLista));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti az összes szervező listáját
router.get('/szervezok', async (req, res) => {
  try {
    const lista = [];
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();

    rendezvenySzervezokNevei[0].forEach((szervezok) => {
      lista.push(szervezok.szervezoNev);
    });

    res.send(lista);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti azt hogy 'csatlakozas' vagy 'kilepes' annak függvényében
// hogy a személy szervező e az eseményen
router.get('/szervezoE', async (req, res) => {
  try {
    let csatlakozasVagyKilepes;

    const szervezo = await findSzervezoRendezvenyken(req.query.name, parseInt(req.query.id, 10));

    if (szervezo[0][0] === undefined) csatlakozasVagyKilepes = 'csatlakozas';
    else csatlakozasVagyKilepes = 'kilepes';

    res.send(JSON.stringify(csatlakozasVagyKilepes));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// kilépés vagy csatlakozás annak függvényében mit nyomott a személyek
// valamint a gomb státuszának a megváltoztatása
router.get('/szervezoCsatlakozasKilepes', async (req, res) => {
  try {
    let csatlakozasVagyKilepes,
      csatlakozasVagyKilepesValasz = '';
    const szervezo = await findSzervezoRendezvenyken(req.query.name, parseInt(req.query.id, 10));
    if (szervezo[0][0] === undefined) {
      csatlakozasVagyKilepes = 'csatlakozas';
      csatlakozasVagyKilepesValasz = 'kilepes';
    } else {
      csatlakozasVagyKilepes = 'kilepes';
      csatlakozasVagyKilepesValasz = 'csatlakozas';
    }

    res.locals.jwtToken = req.cookies.auth;
    const decode = jwt.verify(res.locals.jwtToken, secret);
    res.locals.name = decode.name;
    const felhasznaloNev =  res.locals.name;

    if (req.query.name !== felhasznaloNev) {
      csatlakozasVagyKilepesValasz = csatlakozasVagyKilepes;
    } else {
      await insertSzervezok(csatlakozasVagyKilepes, req.query.name, req.query.id, felhasznaloNev);
    }

    res.send(JSON.stringify(csatlakozasVagyKilepesValasz));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti egy rendezvény szervezőinek a listáját
router.get('/szervezokRendezveny', async (req, res) => {
  try {
    const lista = [];
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNeveiRendezvenyrol(
      parseInt(req.query.rendezvenyID, 10),
    );

    rendezvenySzervezokNevei.forEach((szervezok) => {
      lista.push(szervezok.szervezoNev);
    });

    res.send(lista);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti hogy szervező e egy részfeladaton (hozzaadas/eltavolitas)
router.get('/szervezoEReszfeladaton', async (req, res) => {
  try {
    let csatlakozasVagyKilepes;

    const { szervezoID } = (await findSzervezoIDNevvel(req.query.name))[0][0];
    const reszfeladatonSzervezo = await
    findReszfeladatonDolgozik(parseInt(req.query.reszfeladatID, 10), szervezoID);
    if (reszfeladatonSzervezo === undefined) csatlakozasVagyKilepes = 'hozzáadás';
    else csatlakozasVagyKilepes = 'eltávolítás';

    res.send(JSON.stringify(csatlakozasVagyKilepes));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// hozzadas vagy eltavolitas elvégzése és a gomb frissítése
router.get('/szervezoCsatlakozasKilepesReszfeladat', async (req, res) => {
  try {
    let csatlakozasVagyKilepes,
      csatlakozasVagyKilepesValasz = '';
    const { szervezoID } = (await findSzervezoIDNevvel(req.query.name))[0][0];
    const reszfeladatonSzervezo = await
    findReszfeladatonDolgozik(parseInt(req.query.reszfeladatID, 10), szervezoID);
    if (reszfeladatonSzervezo === undefined) {
      csatlakozasVagyKilepes = 'hozzaadas';
      csatlakozasVagyKilepesValasz = 'eltavolitas';
    } else {
      csatlakozasVagyKilepes = 'eltavolitas';
      csatlakozasVagyKilepesValasz = 'hozzaadas';
    }

    await insertSzervezokReszfeladatokra(
      csatlakozasVagyKilepes,
      szervezoID,
      parseInt(req.query.reszfeladatID, 10),
    );
    res.send(JSON.stringify(csatlakozasVagyKilepesValasz));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti egy részfeladat szervezőinek a listáját
router.get('/reszfeladatSzervezok', async (req, res) => {
  try {
    const lista = [];
    const rendezvenySzervezokNevei = await reszfeladatSzervezokNevei(
      parseInt(req.query.reszfeladatID, 10),
    );

    rendezvenySzervezokNevei.forEach((szervezok) => {
      lista.push(szervezok.szervezoNev);
    });

    res.send(lista);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti egy részfeladat leadási határidejét és frissíti is azt
router.get('/leadasiDatum', async (req, res) => {
  try {
    await reszfeladatLeadasa(parseInt(req.query.reszfeladatID, 10));
    const maiDatum = await leadasiDatum(parseInt(req.query.reszfeladatID, 10));
    res.send(maiDatum);
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

// visszatériti egy részfeladat módosítási dátumát és frissíti is azt
router.get('/ModositasiDatum', async (req, res) => {
  try {
    await reszfeladatModositasiDatum(parseInt(req.query.reszfeladatID, 10));
    const maiDatum = await modositottDatum(parseInt(req.query.reszfeladatID, 10));
    res.send(JSON.stringify(maiDatum));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.use('/rendezveny/:id', express.json());
router.use('/szervezok', express.json());
router.use('/szervezoE', express.json());
router.use('/szervezoCsatlakozasKilepes', express.json());
router.use('/szervezokRendezveny', express.json());
router.use('/szervezoEReszfeladaton', express.json());
router.use('/szervezoCsatlakozasKilepesReszfeladat', express.json());
router.use('/reszfeladatSzervezok', express.json());
router.use('/leadasiDatum', express.json());

export default router;
