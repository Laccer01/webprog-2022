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

function checkIfUsed(body) {                              // 1.nem működő függvény
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

function checkIfIsSzervezo(body) {                          // 2.nem működő függvény
  const x = findSzervezo(body['form-rendezvenySzervezo'], parseInt(body['form-rendezvenyID'], 10));
  return new Promise((resolve, reject) => {
    // resolve(body);

    x.then((result) => {
      const text = result[0].toString();
      // resolve(body);

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

function checkIfIsSzervezoRendezvenyen(body) {
  // console.log(body.fields['form-rendezvenySzervezo'])
  // console.log(parseInt(body.query.rendezvenyID))
  const x = findSzervezo(body.fields['form-rendezvenySzervezo'], parseInt(body.query.rendezvenyID, 10));

  return new Promise((resolve, reject) => {
    x.then((result) => {
      // console.log(result[0])
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

app.use('/lekezelRendezvenyBevezetese', (request, response) => {
  checkIfUsed(request.fields).then(((request1) => {
    insertRendezveny(request);
    return request1;
  }))
    .then(((request2) => {
      insertRendezvenySzervezok(request2);
    }))
    .then(() => {
      response.redirect('/');
    })
    .catch(() => {
      response.render('RendezvenyBevezetese', { hibaUzenet: 'Mar megvan ez a rendezveny' });
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
      // console.log(request.fields[0].szervezoID);
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
      console.log(jelenlegiRendezvenyNev);
      jelenlegiRendezvenyNev.then((result) => {
        console.log(result[0][0].nev);
        const x = `/kepek?name=${result[0][0].nev}`;
        // console.log(x)
        response.redirect(x);
      });
    })
    .catch(() => {
      const jelenlegiRendezvenyId = request.query.rendezvenyID;
      const jelenlegiRendezvenyNev =  findRendezvenyNev(jelenlegiRendezvenyId);
      console.log(jelenlegiRendezvenyNev);
      jelenlegiRendezvenyNev.then((result) => {
        console.log(result[0][0].nev);
        const x = `/kepekHiba?name=${result[0][0].nev}`;
        // console.log(x)
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
    // console.log(rendezvenyek[0])
    const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);
    // console.log(rendezvenySzervezok[0])

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

    res.render('RendezvenyReszletei', { rendezvenyKepei: rendezvenyKepei[0], rendezvenyAzonosito: rendezvenyAzonosito[0], hibaUzenet: 'Nem vagy szervezo ezen a rendezvényen' });
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

app.get('/csatlakozasHiba', async (req, res) => {
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
