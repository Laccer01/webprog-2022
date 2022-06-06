import express from 'express';

import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { secret } from '../config.js';

import {
  findRendezvenySzervezokNevei,

} from '../db/rendezvenyekSzervezo.js';

import {
  findSzervezoRendezvenyken, insertSzervezok,
} from '../db/rendezvenySzervezokRendezvenyeken.js';

const router = express.Router();

router.use(cookieParser());

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

    res.send(csatlakozasVagyKilepesValasz);
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

export default router;
