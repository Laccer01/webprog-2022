import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { secret } from '../config.js';

import {
  megfeleloFelhasznalo, felhasznaloBeszuras, letezikFelhasznalo,
} from '../db/rendezvenyekSzervezo.js';

const router = express.Router();

router.use(cookieParser());

// vizsgálja ha egy személy bejentkezett és jó volt e a jelszója
router.post('/BejelentkezesFeldolgozas', (request, response) => {
  const felhasznalonev = request.fields.inputLoginDataName;
  const jelszo = request.fields.inputLoginDataPasswd;

  const megfeleloFelhasznaloo = megfeleloFelhasznalo(felhasznalonev, jelszo);
  megfeleloFelhasznaloo.then((result) => {
    if (!result) {
      response.status(401);
      response.send('NEM jelentkeztel be | SOMETHINGS WRONG');
    } else {
      const token = jwt.sign({ name: felhasznalonev }, secret);
      response.cookie('auth', token, { sameSite: 'strict' });
      response.redirect('/');
    }
  });
});

// Kijelentkezik a bejlentkezett felhasználó
router.post('/Kijelentkezes', (request, response) => {
  const token = jwt.sign({ name: '' }, secret);

  response.cookie('auth', token, { sameSite: 'strict', expiresIn: new Date(0) });

  response.redirect('/');
});

// a Regisztrációkor kapott kérést feldolgozza, regisztrálja a felhasználót
// a megadott névvel, kóddal és szerepkörrel
router.post('/RegisztracioFeldolgozas', (request, response) => {
  const felhasznalonev = request.fields.inputRegisterDataName;
  const jelszo = request.fields.inputRegisterDataPasswd;
  const szerepkor = request.fields.inputRegisterDataType;

  const megfeleloFelhasznaloo = letezikFelhasznalo(felhasznalonev);
  megfeleloFelhasznaloo.then((result) => {
    if (result) {
      response.status(401);
      response.send('Már létezik ilyen felhasználó');
    } else {
      felhasznaloBeszuras(felhasznalonev, jelszo, szerepkor);
      const token = jwt.sign({ name: felhasznalonev }, secret);
      response.cookie('auth', token, { sameSite: 'strict' });
      response.redirect('/');
    }
  });
});

export default router;
