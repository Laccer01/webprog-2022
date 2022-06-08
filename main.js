import express from 'express';
import {
  existsSync, mkdirSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import cookieParser from 'cookie-parser';

import {
  insertRendezveny, findAllRendezveny, findRendezvenyNevvel, findRendezvenyNev,
  findRendezvenyIdk, findRendezvenyWithId,
} from './db/redezvenyekRendezveny.js';

import {
  findRendezvenySzervezokNevei, felhasznaloSzerepkore,
  insertSzervezokRendezvenyeken, findAllSzervezoFromRendezvenyek,

} from './db/rendezvenyekSzervezo.js';

import {
  insertRendezvenyKepek, findAllRendezvenyKepei,
} from './db/rendezvenyekKepek.js';

import {
  insertSzervezok,
} from './db/rendezvenySzervezokRendezvenyeken.js';

import {
  reszfeladatBeszuras,
  findAllreszfeladatok, findMegoldottReszfeladatok,
  findTullepettHataridokLeadott, findTullepettHataridokNemLeadott,
} from './db/RendezvenyReszfeladatok.js';

import {
  checkJWT, validateJWT,
} from './auth/middleware.js';

import apiRouter from './api/router.js';

import authrouter from './auth/auth.js';

import {
  checkIfUsed, checkIfIsSzervezo,
  checkIfIsSzervezoRendezvenyen,
} from './validators/validator.js';

const app = express();

const uploadDir = join(process.cwd(), '/static/uploadDir');

// feltöltési mappa elkészítése
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(eformidable({ uploadDir }));

app.use('/auth', authrouter);
app.use('/api', apiRouter);
app.use(morgan('tiny'));
app.use(express.static('static/'));
app.use(express.static(join(process.cwd(), 'static')));

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use('/lekezelRendezvenyBevezetese', async (request, response) => {
  const feldolgozandoAdatok = [];
  feldolgozandoAdatok.push(request.fields['form-rendezvenyNev']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenyKezdesiIdopont']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenyVegzesiIdopont']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenyHelyszine']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenySzervezok']);

  checkIfUsed(feldolgozandoAdatok)
    .then(((request1) => {
      const rendezvenyNev = request1[0];
      const endezvenyKezdesiIdopont = request1[1];
      const rendezvenyVegeIdopont = request1[2];
      const rendezvenyHelyszine = request1[3];
      insertRendezveny(
        rendezvenyNev,
        endezvenyKezdesiIdopont,
        rendezvenyVegeIdopont,
        rendezvenyHelyszine,
      );
      return request1;
    }))

    .then(((request1) => {
      const rendezvenyNev = request1[0];
      const rendezvenySzervezok = request1[4];
      insertSzervezokRendezvenyeken(rendezvenyNev, rendezvenySzervezok);
    }))
    .then(() => {
      response.redirect('/');
    })
    .catch((hiba) => {
      if (hiba.toString() === 'Error: Hiba, letezik ez a rendezveny') {
        response.render('RendezvenyBevezetese', { hibaUzenet: 'Mar be van vezetve ilyen nevű rendezvény' });
      } else {
        console.error(hiba);
        response.status(500);
        response.send('Error');
      }
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas',  (request, response) => {
  const feldolgozandoAdatok = [];

  checkJWT(request, response);
  validateJWT(request, response);

  feldolgozandoAdatok.push(request.fields['form-rendezvenySzervezoValasztas']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenyID']);

  checkIfIsSzervezo(feldolgozandoAdatok).then(((request1) => {
    const szervezoValasztasa = request1[0];
    const szervezoNev = request1[1];
    const szervezoID = request1[2];
    insertSzervezok(szervezoValasztasa, szervezoNev, szervezoID);
  }))

    .then(() => {
      response.redirect('/csatlakozas?uzenet=Sikeresen csatlakoztál/visszaléptél');
    })
    .catch((hiba) => {
      if (hiba.toString() === 'Error: Hiba, a csatlakozas/visszalepesnel') {
        response.redirect('/csatlakozas?uzenet=Hiba, ha szervező vagy a rendezvényen '
        + 'nem tudsz újra csatlakozni és ha nem vagy szervező a reszdezvényen nem tudsz visszalépni');
      } else
      if (hiba.toString() === 'Error: Hiba, nem vagy bejelentkezve') {
        response.redirect('/csatlakozas?uzenet=Hiba, nem vagy bejelentkezve');
      } else {
        console.error(hiba);
        response.status(500);
        response.send('Error');
      }
    });
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {
  checkJWT(request, response);
  validateJWT(request, response);

  const feldolgozandoAdatok = [];
  feldolgozandoAdatok.push(request.files['form-rendezvenyFenykep']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenyID']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenySzervezo']);
  feldolgozandoAdatok.push(request.query.rendezvenyID);

  checkIfIsSzervezoRendezvenyen(feldolgozandoAdatok)
    .then(() => {
      const rendezvenyKep = feldolgozandoAdatok[0];
      const rendezvenyID = feldolgozandoAdatok[1];
      const rendezvenyId = feldolgozandoAdatok[3];
      insertRendezvenyKepek(rendezvenyKep, rendezvenyID, rendezvenyId);
    })

    .then(() => {
      const jelenlegiRendezvenyId = feldolgozandoAdatok[3];
      const jelenlegiRendezvenyNev =  findRendezvenyNev(jelenlegiRendezvenyId);
      jelenlegiRendezvenyNev.then((result) => {
        const utvonal = `/kepek?name=${result.nev}&uzenet=`;
        response.redirect(utvonal);
      });
    })
    .catch((hiba) => {
      if (hiba.toString() === 'Error: Hiba, nem szervezo a rendezvenyen') {
        const jelenlegiRendezvenyId = feldolgozandoAdatok[3];
        const jelenlegiRendezvenyNev =  findRendezvenyNev(jelenlegiRendezvenyId);
        jelenlegiRendezvenyNev.then((result) => {
          const utvonal = `/kepek?name=${result.nev}&uzenet=Nem vagy szervező ezen a rendezvényen!`;
          response.redirect(utvonal);
        });
      } else {
        console.error(hiba);
        response.status(500);
        response.send('Error');
      }
    });
});

app.post('/lekezelRendezvenyReszfeladatokLetrehozasa', (request, response) => {
  checkJWT(request, response);
  validateJWT(request, response);

  const { rendezvenyNev } = request.query;
  const rendezvenyIDPromise = findRendezvenyNevvel(rendezvenyNev);
  const { reszfeladatNev } = request.fields;
  const { reszfeladatKezdesiIdopont } = request.fields;
  const { reszfeladatVegzesiIdopont } = request.fields;
  const { reszfeladatLeirasa } = request.fields;

  rendezvenyIDPromise.then((result) => {
    reszfeladatBeszuras(
      reszfeladatNev,
      result[0][0].rendezvenyID,
      reszfeladatLeirasa,
      reszfeladatKezdesiIdopont,
      reszfeladatVegzesiIdopont,
    );
    response.redirect(`/rendezvenyBelepes?name=${rendezvenyNev}`);
  });
});

app.get('/', async (req, res) => {
  try {
    const rendezvenyek = await findAllRendezveny();
    const rendezvenySzervezok = await findRendezvenySzervezokNevei();
    let felhasznaloSzerepkor;
    checkJWT(req, res);
    validateJWT(req, res);

    if (res.locals.name !== '') {
      felhasznaloSzerepkor = await felhasznaloSzerepkore(res.locals.name);
    } else {
      felhasznaloSzerepkor = '';
    }
    res.render('Rendezvenyek', {
      rendezvenyek: rendezvenyek[0],
      rendezvenySzervezok: rendezvenySzervezok[0],
      felhasznaloSzerepkor,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.use('/kepek', async (req, res) => {
  try {
    const rendezvenyKepei = await findAllRendezvenyKepei(req.query.name);
    const rendezvenyAzonosito = await findRendezvenyNevvel(req.query.name);
    const rendezvenyek = await findRendezvenyWithId(rendezvenyAzonosito[0][0].rendezvenyID);
    const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);
    const { uzenet } = req.query;

    checkJWT(req, res);
    validateJWT(req, res);

    if (res.locals.name !== '') {
      const felhasznaloSzerepkor = await felhasznaloSzerepkore(res.locals.name);
      // console.log(felhasznaloSzerepkor);

      res.render('RendezvenyReszletei', {
        rendezvenyek: rendezvenyek[0],
        rendezvenySzervezok,
        rendezvenyKepei: rendezvenyKepei[0],
        rendezvenyAzonosito: rendezvenyAzonosito[0],
        hibaUzenet: uzenet,
        felhasznaloSzerepkor,
      });
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.use('/reszfeladatLetrehozasa', async (req, res) => {
  // console.log(req.query)
  const { rendezvenyNev } = req.query;
  try {
    res.render('RendezvenyekReszfeladatokLetrehozasa', {
      rendezvenyNev,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.use('/rendezvenyBelepes', async (req, res) => {
  try {
    const rendezvenyAzonosito = await findRendezvenyNevvel(req.query.name);
    const rendezvenyek = await findRendezvenyWithId(rendezvenyAzonosito[0][0].rendezvenyID);
    const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);
    const { uzenet } = req.query;

    checkJWT(req, res);
    validateJWT(req, res);

    const felhasznaloSzerepkor = await felhasznaloSzerepkore(res.locals.name);
    const reszfeladatok = await findAllreszfeladatok(req.query.name);

    const osszesReszfeladatokSzama = reszfeladatok[0].length;
    const megoldottReszfeladatokSzama = await findMegoldottReszfeladatok(req.query.name);
    const megoldatlanReszfeladatokSzama = osszesReszfeladatokSzama - megoldottReszfeladatokSzama;
    const tullepettHataridosReszfeladatokSzamaLeadott = await
    findTullepettHataridokLeadott(req.query.name);
    const tullepettHataridosReszfeladatokSzamaNemLeadott = await
    findTullepettHataridokNemLeadott(req.query.name);

    res.render('RendezvenyFeladatok', {
      rendezvenyek: rendezvenyek[0],
      rendezvenySzervezok,
      rendezvenyAzonosito: rendezvenyAzonosito[0],
      hibaUzenet: uzenet,
      felhasznaloSzerepkor,
      reszfeladatok: reszfeladatok[0],
      osszesReszfeladatokSzama,
      megoldottReszfeladatokSzama,
      megoldatlanReszfeladatokSzama,
      tullepettHataridosReszfeladatokSzamaLeadott,
      tullepettHataridosReszfeladatokSzamaNemLeadott,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/csatlakozas', async (req, res) => {
  try {
    const { uzenet } = req.query;
    const rendezvenyIDk = await findRendezvenyIdk();

    checkJWT(req, res);
    validateJWT(req, res);

    res.render('RendezvenySzervezoCsatlakozas', {
      rendezvenyIDk: rendezvenyIDk[0],
      hibaUzenet: uzenet,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.use('/RendezvenyBevezetese', (req, response) => {
  response.render('RendezvenyBevezetese', { hibaUzenet: '' });
});

app.listen(8000, () => {
  console.log('Server listening on http://localhost:8000/ ...');
});

// főoldal: /
// új rendezvény bevezetése: /RendezvenyBevezetese
// csatlakozási form: /csatlakozas

// a rendezvenyek.sql script létrehoz minden szükséges táblát, a táblák
// között levő kapcsolatokat és a felhasználót is, csak futtatni kell

// szervezők jelszó: jelszo+szervezőnév (pl. jelszoSanyi)
