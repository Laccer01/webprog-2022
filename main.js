import express from 'express';
import {
  existsSync, mkdirSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import {
  insertRendezveny, insertRendezvenySzervezok, findAllRendezveny, insertRendezvenyKepek,
  insertSzervezok, findAllRendezvenyKepei, findRendezvenyNevvel, findRendezvenyNev,
  findRendezvenySzervezokNevei, findRendezvenyIdk,
  findAllSzervezoFromRendezvenyek, findSzervezo,
} from './db/rendezvenyekdb.js';

function checkIfUsed(body) {   // vizsgálja ha létezik e olyan nevű rendezvény e
  const x = findRendezvenyNevvel(body['form-rendezvenyNev']);
  return new Promise((resolve, reject) => {
    x.then((result) => {
      const text = result[0].toString();

      if (text === '') {
        resolve(body);
      } else {
        reject();
      }
    });
  });
}

function checkIfIsSzervezo(body) {    // vizsgálom ha olyan csatlakozik/kilép
  // egy eseményhez/eseményből aki megteheti
  const x = findSzervezo(body['form-rendezvenySzervezo'], parseInt(body['form-rendezvenyID'], 10));
  return new Promise((resolve, reject) => {
    x.then((result) => {
      const text = result[0].toString();

      if (body['form-rendezvenySzervezoValasztas'] === 'csatlakozas') {
        // vizsgálom ha csatlakozni akar a szervező
        if (text === '') {          // a szervezo meg nincs csatlakozva a rendezvenyhez
          resolve(body);
        } else {
          reject();
        }
      } else if (text === '') {           // a szervezo meg nincs csatlakozva a rendezvenyhez
        // akkor nem tud kilepni a rendezvenybol
        reject();
      } else {
        resolve(body);
      }
    });
  });
}

function checkIfIsSzervezoRendezvenyen(body) {        // vizsgálom ha a felhasználó
  // szervező e az adott eseményen
  const x = findSzervezo(body.fields['form-rendezvenySzervezo'], parseInt(body.query.rendezvenyID, 10));

  return new Promise((resolve, reject) => {
    x.then((result) => {
      const text = result[0].toString();
      if (text === '') {           // a szervezo meg nincs csatlakozva a rendezvenyhez
        reject();
      } else {
        resolve(body);
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
  checkIfUsed(request.fields)
    .then(((request1) => {
      insertRendezveny(request);
      return request1;
    }))
    .then(((request1) => {
      insertRendezvenySzervezok(request1);
    }))
    .then(() => {
      response.redirect('/');
    })
    .catch(() => {
      response.render('RendezvenyBevezetese', { hibaUzenet: 'Mar be van vezetve ilyen nevű rendezvény' });
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas',  (request, response) => {
  checkIfIsSzervezo(request.fields).then((() => {
    insertSzervezok(request.fields);
  }))

    .then(() => {
      response.redirect('/csatlakozasSikeres');
    })
    .catch(() => {
      response.redirect('/csatlakozasHiba');
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {
  checkIfIsSzervezoRendezvenyen(request).then(() => {
    insertRendezvenyKepek(request);
  })

    .then(() => {
      const jelenlegiRendezvenyId = request.query.rendezvenyID;
      const jelenlegiRendezvenyNev =  findRendezvenyNev(jelenlegiRendezvenyId);
      jelenlegiRendezvenyNev.then((result) => {
        const x = `/kepek?name=${result[0][0].nev}`;
        response.redirect(x);
      });
    })
    .catch(() => {
      const jelenlegiRendezvenyId = request.query.rendezvenyID;
      const jelenlegiRendezvenyNev =  findRendezvenyNev(jelenlegiRendezvenyId);
      jelenlegiRendezvenyNev.then((result) => {
        const x = `/kepekHiba?name=${result[0][0].nev}`;
        response.redirect(x);
      });
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.listen(8000, () => {
  console.log('Server listening on http://localhost:8000/ ...');
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

    res.render('RendezvenyReszletei', { rendezvenyKepei: rendezvenyKepei[0], rendezvenyAzonosito: rendezvenyAzonosito[0], hibaUzenet: '' });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/kepekHiba', async (req, res) => {
  try {
    const rendezvenyKepei = await findAllRendezvenyKepei(req.query.name);
    const rendezvenyAzonosito = await findRendezvenyNevvel(req.query.name);

    res.render('RendezvenyReszletei', { rendezvenyKepei: rendezvenyKepei[0], rendezvenyAzonosito: rendezvenyAzonosito[0], hibaUzenet: 'Nem vagy szervező ezen a rendezvényen' });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/csatlakozas', async (req, res) => {
  try {
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();
    const rendezvenyIDk = await findRendezvenyIdk();
    res.render('RendezvenySzervezoCsatlakozas', { rendezvenySzervezokNevei: rendezvenySzervezokNevei[0], rendezvenyIDk: rendezvenyIDk[0], hibaUzenet: '' });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/csatlakozasHiba', async (req, res) => {
  try {
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();
    const rendezvenyIDk = await findRendezvenyIdk();
    res.render('RendezvenySzervezoCsatlakozas', {
      rendezvenySzervezokNevei: rendezvenySzervezokNevei[0],
      rendezvenyIDk: rendezvenyIDk[0],
      hibaUzenet: 'Hiba, ha szervező vagy a rendezvényen '
    + 'nem tudsz újra csatlakozni és ha nem vagy szervező a reszdezvényen nem tudsz visszalépni',
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/csatlakozasSikeres', async (req, res) => {
  try {
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();
    const rendezvenyIDk = await findRendezvenyIdk();
    res.render('RendezvenySzervezoCsatlakozas', {
      rendezvenySzervezokNevei: rendezvenySzervezokNevei[0],
      rendezvenyIDk: rendezvenyIDk[0],
      hibaUzenet: 'Sikeresen csatlakoztál/visszaléptél',
    });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

app.get('/RendezvenyBevezetese.html', (req, response) => {
  response.render('RendezvenyBevezetese', { hibaUzenet: '' });
});

app.get('/RendezvenyBevezetese.html', (req, response) => {
  response.render('RendezvenyBevezetese');
});

// főoldal: /
// új rendezvény bevezetése: /RendezvenyBevezetese.html
// csatlakozási form: /csatlakozas

// a rendezvenyek.sql script létrehoz minden szükséges táblát, a táblák
// között levő kapcsolatokat és a felhasználót is, csak futtatni kell
