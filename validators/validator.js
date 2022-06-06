import {
  findRendezvenyNevvel,
} from '../db/redezvenyekRendezveny.js';

import {
  findSzervezoNevRendezvenyen, findSzervezo,
} from '../db/rendezvenySzervezokRendezvenyeken.js';

export function checkIfUsed(feldolgozandoAdatok) {
  // vizsgálja ha létezik e olyan nevű rendezvény e
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

export function checkIfIsSzervezo(feldolgozandoAdatok) {    // vizsgálom ha olyan csatlakozik/kilép
  // egy eseményhez/eseményből aki megteheti

  const szervezoNev = feldolgozandoAdatok[1];
  const rendezvenyId = parseInt(feldolgozandoAdatok[2], 10);
  const rendezvenySzervezoValasztasa = feldolgozandoAdatok[0];
  const jelenlegiBejelentkezett = feldolgozandoAdatok[3];
  console.log(jelenlegiBejelentkezett);

  return new Promise((resolve, reject) => {
    if (jelenlegiBejelentkezett === '') {
      reject(new Error('Hiba, nem vagy bejelentkezve'));
    } else {
      const szervezo = findSzervezo(szervezoNev, rendezvenyId);

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
    }
  });
}

export function checkIfIsSzervezoRendezvenyen(feldolgozandoAdatok) {
  // vizsgálom ha a felhasználó
  // szervező e az adott eseményen

  const rendezvenySzervezo = feldolgozandoAdatok[4];
  const rendezvenyID = parseInt(feldolgozandoAdatok[3], 10);
  const szervezo = findSzervezoNevRendezvenyen(rendezvenySzervezo, rendezvenyID);

  return new Promise((resolve, reject) => {
    szervezo.then((result) => {
      if (result === undefined || result[0] === undefined) {
        reject(new Error('Hiba, nem szervezo a rendezvenyen'));
      } else {
        const text = result[0].toString();
        if (text === '') {           // a szervezo meg nincs csatlakozva a rendezvenyhez
          reject(new Error('Hiba, nem szervezo a rendezvenyen'));
        } else {
          resolve(feldolgozandoAdatok);
        }
      }
    });
  });
}
