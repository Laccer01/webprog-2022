import express from 'express';
import {
  existsSync, mkdirSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import {
  // insertRendezveny, insertSzervezok, insertRendezvenyKepek,
  insertRendezveny, insertRendezvenySzervezok, findAllRendezveny, insertRendezvenyKepek,
  insertSzervezok, findAllRendezvenyKepei, findRendezvenyNevvel,
  findRendezvenySzervezokNevei, findRendezvenyIdk,
  // findAllSzervezo, findAllRendezvenyKepek,
} from './db/rendezvenyekdb.js';

function checkIfUsed(body) {
  return new Promise((resolve, reject) => {
    if (body['form-rendezvenyNev'] ===  'Malacka') {
      reject();
    } else {
      resolve(body);
    }
  });
}

function checkIfIsSzervezo(body) {
  return new Promise((resolve) => {
    // if (body.sweetness > 10) {
    //   reject();
    // } else {
    resolve(body);
    // }
  });
}

function checkIfIsSzervezoRendezvenyen(body) {
  return new Promise((resolve) => {
    // if (body.name !== 'malac')
    // {

    // // if (body.sweetness > 10) {

    // reject();
    //   } else {
    //   // const vanE = findRendezvenyNevvel(
    resolve(body);
  //   }
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

app.use('/lekezelRendezvenyBevezetese', (request, response) => {
  checkIfUsed(request.fields).catch(() => {
    response.status(400);
    response.send('A megadott rendezveny mar be van szurva az adatbazisba!');
  }).then(((request1) => {
    insertRendezveny(request);
    return request1;
  }))
    .then(((request2) => {
      insertRendezvenySzervezok(request2);
    }))
    .then(() => {
      response.redirect('/');
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas', async (request, response) => {
  checkIfIsSzervezo(request.fields).catch(() => {
    response.status(400);
    response.send('Mar szervezo vagy az esemenyen!');
  }).then(insertSzervezok).then(() => {
    response.redirect('/');
  })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', async (request, response) => {
  checkIfIsSzervezoRendezvenyen(request).catch(() => {
    response.status(400);
    response.send('Mar szervezo vagy az esemenyen!');
  }).then(insertRendezvenyKepek).then(() => {
    response.redirect('/');
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
    res.render('Rendezvenyek', { rendezvenyek: rendezvenyek[0] });
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

    res.render('RendezvenyReszletei', { rendezvenyKepei: rendezvenyKepei[0], rendezvenyAzonosito: rendezvenyAzonosito[0] });
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
    res.render('RendezvenySzervezoCsatlakozas', { rendezvenySzervezokNevei: rendezvenySzervezokNevei[0], rendezvenyIDk: rendezvenyIDk[0] });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});
