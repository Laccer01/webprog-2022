import express from 'express';
import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

import {
  megfeleloFelhasznalo,
} from '../db/rendezvenyekSzervezo.js';

const router = express.Router();

router.post('/BejelentkezesFeldolgozas', (request, response) => {
  const felhasznalonev = request.fields.inputLoginDataName;
  const jelszo = request.fields.inputLoginDataPasswd;

  const x = megfeleloFelhasznalo(felhasznalonev, jelszo);
  x.then((result) => {
    if (!result) {
      response.status(401);
      response.send('NEM jelentkeztel be | SOMETHINGS WRONG');
    } else {
      const token = jwt.sign({ name: felhasznalonev }, secret);
      response.cookie('auth', token, { sameSite: 'strict' });
      response.redirect('/?uzenet=');
    }
  });
});

router.post('/Kijelentkezes', (request, response) => {
  const token = jwt.sign({ name: '' }, secret);

  response.cookie('auth', token, { ameSite: 'strict' });

  response.locals.jwtToken = '';

  response.redirect('/?uzenet=');
});

export default router;
