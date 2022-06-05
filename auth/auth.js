import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { secret } from '../config.js';

import {
  megfeleloFelhasznalo,
} from '../db/rendezvenyekSzervezo.js';

const router = express.Router();

router.use(cookieParser());

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
      response.redirect('/?uzenet=');
    }
  });
});

router.post('/Kijelentkezes', (request, response) => {
  response.cookie('auth', jwt.sign({ name: '' }, secret), { ameSite: 'strict' });

  // response.cookie("auth", { expires: new Date() });

  // Object.entries(request.cookies).forEach(([cookieName, cookieValue]) => {
  //   console.log(`  ${cookieName} : ${cookieValue}`);
  // });

  response.redirect('/?uzenet=');
  // response.end()

});

export default router;
