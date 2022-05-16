import express from 'express';
import {
  existsSync, mkdirSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import {
  insertRendezveny, findAllRendezveny, findRendezvenyNevvel, findRendezvenyNev,
  findRendezvenyIdk, findRendezvenyWithId,
} from './db/redezvenyekRendezveny.js';

import {
  insertRendezvenySzervezok, insertSzervezok, findRendezvenySzervezokNevei,
  findAllSzervezoFromRendezvenyek, findSzervezo,

} from './db/rendezvenyekSzervezo.js';

import {
  insertRendezvenyKepek, findAllRendezvenyKepei,
} from './db/rendezvenyekKepek.js';

function checkIfUsed(feldolgozandoAdatok) {   // vizsgálja ha létezik e olyan nevű rendezvény e
  const rendezvenyNev = feldolgozandoAdatok[0];
  const rendezveny = findRendezvenyNevvel(rendezvenyNev);
  return new Promise((resolve, reject) => {
    rendezveny.then((result) => {
      const text = result[0].toString();

      if (text === '') {
        resolve(feldolgozandoAdatok);
      } else {
        reject(new Error('Hiba, letezik ez a rendezveny'));
      }
    });
  });
}

function checkIfIsSzervezo(feldolgozandoAdatok) {    // vizsgálom ha olyan csatlakozik/kilép
  // egy eseményhez/eseményből aki megteheti
  const szervezoNev = feldolgozandoAdatok[1];
  const rendezvenyId = parseInt(feldolgozandoAdatok[2], 10);
  const rendezvenySzervezoValasztasa = feldolgozandoAdatok[0];
  const szervezo = findSzervezo(szervezoNev, rendezvenyId);

  return new Promise((resolve, reject) => {
    szervezo.then((result) => {
      const text = result[0].toString();

      if (rendezvenySzervezoValasztasa === 'csatlakozas') {
        // vizsgálom ha csatlakozni akar a szervező
        if (text === '') {          // a szervezo meg nincs csatlakozva a rendezvenyhez
          resolve(feldolgozandoAdatok);
        } else {
          reject(new Error('Hiba, a csatlakozas/visszalepesnel'));
        }
      } else if (text === '') {           // a szervezo meg nincs csatlakozva a rendezvenyhez
        // akkor nem tud kilepni a rendezvenybol
        reject(new Error('Hiba, a csatlakozas/visszalepesnel'));
      } else {
        resolve(feldolgozandoAdatok);
      }
    });
  });
}

function checkIfIsSzervezoRendezvenyen(feldolgozandoAdatok) {        // vizsgálom ha a felhasználó
  // szervező e az adott eseményen
  const rendezvenySzervezo = feldolgozandoAdatok[2];
  const rendezvenyID = parseInt(feldolgozandoAdatok[3], 10);
  const szervezo = findSzervezo(rendezvenySzervezo, rendezvenyID);

  return new Promise((resolve, reject) => {
    szervezo.then((result) => {
      const text = result[0].toString();
      if (text === '') {           // a szervezo meg nincs csatlakozva a rendezvenyhez
        reject(new Error('Hiba, nem szervezo a rendezvenyen'));
      } else {
        resolve(feldolgozandoAdatok);
      }
    });
  });
}

const app = express();
const uploadDir = join(process.cwd(), '/static/uploadDir');

// feltöltési mappa elkészítése
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(morgan('tiny'));
app.use(express.static(join(process.cwd(), 'static')));
app.use(eformidable({ uploadDir }));
app.set('view engine', 'ejs');

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
      insertRendezvenySzervezok(rendezvenyNev, rendezvenySzervezok);
    }))
    .then(() => {
      response.redirect('/');
    })
    .catch((hiba) => {
      if (hiba.toString() === 'Error: Hiba, letezik ez a rendezveny') response.render('RendezvenyBevezetese', { hibaUzenet: 'Mar be van vezetve ilyen nevű rendezvény' });
      else {
        console.error(hiba);
        response.status(500);
        response.send('Error');
      }
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas',  (request, response) => {
  const feldolgozandoAdatok = [];
  feldolgozandoAdatok.push(request.fields['form-rendezvenySzervezoValasztas']);
  feldolgozandoAdatok.push(request.fields['form-rendezvenySzervezo']);
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
      } else {
        console.error(hiba);
        response.status(500);
        response.send('Error');
      }
    });
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {
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

app.get('/', async (req, res) => {
  try {
    const rendezvenyek = await findAllRendezveny();
    const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);

    res.render('Rendezvenyek', { rendezvenyek: rendezvenyek[0], rendezvenySzervezok });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/kepek', async (req, res) => {
  try {
    const rendezvenyKepei = await findAllRendezvenyKepei(req.query.name);
    const rendezvenyAzonosito = await findRendezvenyNevvel(req.query.name);
    const rendezvenyek = await findRendezvenyWithId(rendezvenyAzonosito[0][0].rendezvenyID);
    const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);
    const { uzenet } = req.query;
    res.render('RendezvenyReszletei', {
      rendezvenyek: rendezvenyek[0],
      rendezvenySzervezok,
      rendezvenyKepei: rendezvenyKepei[0],
      rendezvenyAzonosito: rendezvenyAzonosito[0],
      hibaUzenet: uzenet,
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
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();
    const rendezvenyIDk = await findRendezvenyIdk();

    res.render('RendezvenySzervezoCsatlakozas', {
      rendezvenySzervezokNevei: rendezvenySzervezokNevei[0],
      rendezvenyIDk: rendezvenyIDk[0],
      hibaUzenet: uzenet,
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');                       //         sziiiia jaccej nagyon szejetlek es te vagy a mindenem legyel nagyon ugyes es tegyel buszkeve
  }
});

app.get('/RendezvenyBevezetese.html', (req, response) => {
  response.render('RendezvenyBevezetese', { hibaUzenet: '' });
});

app.get('/RendezvenyBevezetese.html', (req, response) => {
  response.render('RendezvenyBevezetese');
});

app.listen(8000, () => {
  console.log('Server listening on http://localhost:8000/ ...');
});

// főoldal: /
// új rendezvény bevezetése: /RendezvenyBevezetese.html
// csatlakozási form: /csatlakozas

// a rendezvenyek.sql script létrehoz minden szükséges táblát, a táblák
// között levő kapcsolatokat és a felhasználót is, csak futtatni kell
