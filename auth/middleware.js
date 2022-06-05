import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

export function checkJWT(req, res) {
  if (req.cookies.auth) {
    res.locals.jwtToken = req.cookies.auth;
  } else {
    res.status(401);
    res.send();
  }
}

export function validateJWT(req, res) {
  if (res.locals.jwtToken) {
    try {
      const decode = jwt.verify(res.locals.jwtToken, secret);
      res.locals.name = decode.name;
    } catch (err) {
      validateJWT(req, res);
      console.error(err);
      res.clearCookie('auth');
      res.status(401);
      res.send();
    }
  } else {
    res.locals.name = '';
  }
}
