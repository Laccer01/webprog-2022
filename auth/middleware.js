import jwt from 'jsonwebtoken';
import { secret } from '../config.js';

export function checkJWT(req, res, next) {
  console.log(req.cookies);
  if (!req.cookies.auth) {
    res.status(401);
    res.send();
  } else {
    res.locals.jwtToken = req.cookies.auth;
    next();
  }
}

export function validateJWT(req, res, next) {
  if (!res.locals.jwtToken) {
    res.status(401);
    res.send();
  } else {
    try {
      const decode = jwt.verify(res.locals.jwtToken, secret);
      res.locals.name = decode.name;
      next();
    } catch (err) {
      console.error(err);
      res.clearCookie('auth');
      res.status(401);
      res.send();
    }
  }
}
