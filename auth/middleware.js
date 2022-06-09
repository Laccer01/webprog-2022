import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

// cookie feldolgozása
export function checkJWT(req, res) {
  if (req.cookies.auth) {
    res.locals.jwtToken = req.cookies.auth;
  } else {
    res.status(401);
    res.send();
  }
}

// felhasználónév tárolása res.localsban
export function validateJWT(req, res) {
  if (res.locals.jwtToken) {
    try {
      const decode = jwt.verify(res.locals.jwtToken, secret);
      res.locals.name = decode.name;
    } catch (err) {
      res.status(401);
      res.send();
    }
  } else {
    res.locals.name = '';
  }
}
