import express from 'express';

import {
  findRendezvenySzervezokNevei,
  findSzervezo, insertSzervezok,

} from '../db/rendezvenyekSzervezo.js';

const router = express.Router();

router.get('/rendezveny/:id', async (req, res) => {
  try {
    // const rendezvenyek = await findRendezvenyWithId(req.params.id);
    // const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);

    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();

    let szervezokLista = 'Szervezők:\n';
    rendezvenySzervezokNevei[0].forEach((szervezok) => {
      szervezokLista += `${szervezok.szervezoNev}, `;
    });

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(szervezokLista));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.get('/szervezok', async (req, res) => {
  try {
    // const rendezvenyek = await findRendezvenyWithId(req.params.id);
    // const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);
    const lista = [];
    const rendezvenySzervezokNevei = await findRendezvenySzervezokNevei();

    rendezvenySzervezokNevei[0].forEach((szervezok) => {
      lista.push(szervezok.szervezoNev);
    });

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(lista));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.get('/szervezoE', async (req, res) => {
  try {
    // const rendezvenyek = await findRendezvenyWithId(req.params.id);
    // const rendezvenySzervezok = await findAllSzervezoFromRendezvenyek(rendezvenyek);

    // req.params.id
    let csatlakozasVagyKilepes;

    const szervezo = await findSzervezo(req.query.name, parseInt(req.query.id, 10));

    if (szervezo[0][0] === undefined) csatlakozasVagyKilepes = 'csatlakozas';
    else csatlakozasVagyKilepes = 'kilepes';

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(csatlakozasVagyKilepes));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.get('/szervezoCsatlakozasKilepes', async (req, res) => {
  try {
    let csatlakozasVagyKilepes,
      csatlakozasVagyKilepesValasz;
    const szervezo = await findSzervezo(req.query.name, parseInt(req.query.id, 10));
    if (szervezo[0][0] === undefined) {
      csatlakozasVagyKilepes = 'csatlakozas';
      csatlakozasVagyKilepesValasz = 'kilepes';
    } else {
      csatlakozasVagyKilepes = 'kilepes';
      csatlakozasVagyKilepesValasz = 'csatlakozas';
    }

    await insertSzervezok(csatlakozasVagyKilepes, req.query.name, req.query.id);

    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(csatlakozasVagyKilepesValasz));
  } catch (err) {
    console.error(err);
    res.status(500);
    res.send('Error');
  }
});

router.use('/rendezveny/:id', express.json());
router.use('/szervezok', express.json());
router.use('/szervezoE', express.json());
router.use('/szervezoCsatlakozasKilepes', express.json());

// router.delete('/csokik/:id', async (req, res) => {
//   try {
//     await deleteById(req.params.id);
//     res.status(204);
//     res.send();
//   } catch (err) {
//     console.error(err);
//     res.status(500);
//     res.send('Error');
//   }
// });

// router.use('/csokik/:id', express.json());

// router.put('/csokik/:id', async (req, res) => {
//   try {
//     await updateDescription(req.params.id, req.body.description);
//     res.send(JSON.stringify({ description: req.body.description }));
//   } catch (err) {
//     console.error(err);
//     res.status(500);
//     res.send('Error');
//   }
// });

export default router;
