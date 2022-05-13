import express from 'express';
import {
  existsSync, mkdirSync,
} from 'fs';

import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

import {
  insertRendezveny, insertRendezvenySzervezok, findAllRendezveny, insertRendezvenyKepek,
  insertSzervezok, findAllRendezvenyKepei, findRendezvenyNevvel,
  findRendezvenySzervezokNevei, findRendezvenyIdk,
  // findSzervezo,
} from './db/rendezvenyekdb.js';

// function checkIfUsed(body) {                              //1.nem működő függvény
//   console.log(body['form-rendezvenyNev']);
//   const x = findRendezvenyNevvel(body['form-rendezvenyNev']);
//   console.log(x);
//   return new Promise((resolve, reject) => {
//     x.then((result) => {
//       console.log(result[0])
//       if (result[0] === [])
//       {
//         resolve(body);
//       } else
//       {
//         reject();
//       }
//     });
//   });
// }

function checkIfUsed(body) {
  console.log(body['form-rendezvenyNev']);
  const x = findRendezvenyNevvel(body['form-rendezvenyNev']);
  console.log(x);
  return new Promise((resolve) => {
    resolve(body);
  });
}

// function checkIfIsSzervezo(body) {                          //2.nem működő függvény
//   const x = findSzervezo(body['form-rendezvenySzervezo'], body['form-rendezvenyID']);
//   console.log(x);
//   x.then((result) => {
//     console.log(result[0])
//     return new Promise((resolve, reject) => {
//     if (body['form-rendezvenySzervezoValasztas'] == 'csatlakozas')
//   //vizsgálom ha csatlakozni akar a szervező
//     {
//       if (result[0] === [])           //a szervezo meg nincs csatlakozva a rendezvenyhez
//       {
//         resolve(body);
//       }
//       else
//       {
//         reject();
//       }
//     } else
//     {
//       if (result[0] === [])           //a szervezo meg nincs csatlakozva a rendezvenyhez
//   //akkor nem tud kilepni a rendezvenybol
//       {
//         reject();
//       }
//       else
//       {
//         resolve(body);
//       }
//     }
//   });
// });
// }

function checkIfIsSzervezo(body) {
  return new Promise((resolve) => {
    resolve(body);
  });
}

// function checkIfIsSzervezoRendezvenyen(body) {                    //3.nem működő függvény
//   console.log(body.fields['form-rendezvenySzervezo']);
//   console.log(body.query.rendezvenyID)
//   const x = findSzervezo (body.fields['form-rendezvenySzervezo'],body.query.rendezvenyID)
//     x.then((result) => {
//       console.log(result[0])
//       if (result[0] = [])
//       {
//   return new Promise((resolve) => {   //  return new Promise((resolve, reject) => {
//     resolve(body);
//   });
//       }
//       else
//       {
//         return new Promise((reject) => {
//           reject();});
//       }
//     });
// }

function checkIfIsSzervezoRendezvenyen(body) {
  return new Promise((resolve) => {
    resolve(body);
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
      response.status(400);
      response.send('A megadott rendezveny mar be van szurva az adatbazisba!');
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.use('/lekezelRendezvenySzervezoCsatlakozas', async (request, response) => {
  checkIfIsSzervezo(request.fields)
    .then(insertSzervezok).then(() => {
      response.redirect('/');
    })
    .catch(() => {
      response.status(400);
      response.send('Mar szervezo vagy az esemenyen!');
    })
    .catch((err) => {
      console.error(err);
      response.status(500);
      response.send('Error');
    });
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {
  checkIfIsSzervezoRendezvenyen(request).then(insertRendezvenyKepek).then(() => {
    response.redirect('/');
  })
    .catch(() => {
      response.status(400);
      response.send('Nem vagy szervezo az esemenyen!');
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
