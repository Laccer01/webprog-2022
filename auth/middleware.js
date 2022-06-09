import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

// cookie feldolgozása
export function checkJWT(req, res, next) {
  if (req.cookies.auth) {
    res.locals.jwtToken = req.cookies.auth;
    return next();
  }

  res.status(401);
  res.send();
  return -1;
}

// felhasználónév tárolása res.localsban
export function validateJWT(req, res, next) {
  if (res.locals.jwtToken) {
    try {
      const decode = jwt.verify(res.locals.jwtToken, secret);
      res.locals.name = decode.name;
      return next();
    } catch (err) {
      res.status(401);
      res.send();
    }
  } else {
    res.locals.name = '';
    return next();
  }
  return -1;
}
