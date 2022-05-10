import express from 'express';
import fs, {
  existsSync, mkdirSync, writeFileSync, readFileSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import {
  // insertRendezveny, insertSzervezok, insertRendezvenyKepek,
  insertRendezveny, findAllRendezveny,insertSzervezok
  // findAllSzervezo, findAllRendezvenyKepek,
} from './db/rendezvenyekdb.js';

function checkIfUsed(body) {
  return new Promise((resolve) => {
    // if (body.sweetness > 10) {
    //   reject();
    // } else {
    resolve(body);
    // }
  });
}

const app = express();
const uploadDir = join(process.cwd(), 'uploadDir');

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
  }).then(insertRendezveny).then(() => {

    response.redirect('/');
  })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas', (request, response) => {
  const localArray = JSON.parse(readFileSync('./ide.json', () => {}));
  let rendezvenyLetezik = false;
  let csatlakozhat = true;
  let kilephet = false;
  let respBody = '';

  localArray.forEach((value) => {
    if (String(value.rendezenyID) === String(request.fields['form-rendezvenyID'])) {
      rendezvenyLetezik = true;
      const szervezok = value.rendezvenySzemelyekListaja;
      if (request.fields['form-rendezvenySzervezoValasztas'] === 'csatlakozas') {
        szervezok.forEach((value1) => {
          if (String(value1) === String(request.fields['form-rendezvenySzervezo'])) csatlakozhat = false;
        });
        if (csatlakozhat === true) {
          value.rendezvenySzemelyekListaja.push(request.fields['form-rendezvenySzervezo']);
        }
      } else {
        szervezok.forEach((value1) => {
          if (String(value1) === String(request.fields['form-rendezvenySzervezo'])) {
            kilephet = true;
            szervezok.pop(request.fields['form-rendezvenySzervezo']);
          }
        });
      }
    }
  });

  if (kilephet === true || csatlakozhat === true) {
    // valtoztatjuk a formot
    writeFileSync('./ide.json', JSON.stringify(localArray), () => {
    });
  }

  if (!rendezvenyLetezik) {
    respBody = 'Nem letezik ez az ID-ju esemeny';
  } else {
    if (request.fields['form-rendezvenySzervezoValasztas'] === 'csatlakozas') {
      if (csatlakozhat === false) {
        respBody = 'Mar ehez az esemenyhez tartozol nem csatlakozhatsz ujra';
        response.status(400);
      } else {
        respBody = 'Minden rendben csatlakoztal az esemenyhez';
        response.status(400);
      }
    }

    if (request.fields['form-rendezvenySzervezoValasztas'] === 'visszalepes') {
      if (kilephet === false) {
        respBody = 'Nem tartozol ehez az esemenyhez, ezert nem is tudsz kilepni belole';
        response.status(400);
      } else {
        respBody = 'Minden rendben kileptel az esemenybol';
        response.status(200);
      }
    }
  }
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(respBody);
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {
  const localArray = JSON.parse(readFileSync('./ide.json', () => {}));

  let rendezvenyLetezik = false;
  let szervezoE = false;
  let respBody = '';

  localArray.forEach((value) => {
    if (String(value.rendezenyID) === String(request.fields['form-rendezvenyID'])) {
      rendezvenyLetezik = true;
      const szervezok = value.rendezvenySzemelyekListaja;
      szervezok.forEach((value1) => {
        if (String(value1) === String(request.fields['form-rendezvenySzervezo'])) szervezoE = true;
      });
      if (szervezoE === true) {
        // itt kene hozza adni a kepet a kepekhez
        const fileHandler = request.files['form-rendezvenyFenykep'];
        const file = fileHandler.path;
        const fileLista = file.split('\\');
        value.rendezvenyKepek.push(fileLista[fileLista.length - 1]);

        // valtoztatjuk a formot
        writeFileSync('./ide.json', JSON.stringify(localArray), () => {
        });
      } else {
        const fileHandler = request.files['form-rendezvenyFenykep'];
        const { path } = fileHandler;

        console.log(path);
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    }
  });

  // writeFileSync('./ide.json', JSON.stringify(localArray),(err) => {})

  if (!rendezvenyLetezik) {
    respBody = 'Nem letezik az adott Id-ju esemeny';
    response.status(400);
  } else if (!szervezoE) {
    respBody = 'A megadott szemely nem szervezo a valasztott esemenyen';
    response.status(400);
  } else {
    respBody = 'Sikerult hozzaadni a kivalasztott kepet az esemenyhez';
    response.status(200);
  }

  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(respBody);
});

app.listen(8000, () => {
  console.log('Server listening on http://localhost:8000/ ...');
});

app.use('/', async (req, res) => {
  try {
    const rendezvenyek = await findAllRendezveny();
    res.render('Rendezvenyek', { rendezvenyek: rendezvenyek[0] });
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});
