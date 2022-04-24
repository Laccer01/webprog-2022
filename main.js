import express from 'express';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
 import fs from 'fs';
import { join } from 'path';
import eformidable from 'express-formidable';
import morgan from 'morgan';

const app = express();
const uploadDir = join(process.cwd(), 'uploadDir');

// feltöltési mappa elkészítése
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir);
}

app.use(morgan('tiny'));
app.use(express.static(join(process.cwd(), 'static')));
app.use(eformidable({ uploadDir }));

app.use('/lekezelRendezvenyBevezetese', (request, response) => {

  const localArray = JSON.parse(readFileSync('./ide.json', (err) => {}))
  const ujID = localArray.length + 1;
  var megfelelo = true;

  localArray.forEach(function(value){
    if (value.rendezvenyNev == request.fields['form-rendezvenyNev'])
    {
      megfelelo = false;
    }
  });
 
  if (megfelelo)
  {
    localArray.push(
      {
        rendezvenyNev: request.fields['form-rendezvenyNev'],
        rendezvenyKezdesiIdopont: request.fields['form-rendezvenyKezdesiIdopont'],
        rendezvenyVegzesiIdopont: request.fields['form-rendezvenyVegzesiIdopont'],
        rendezvenyHelyszine: request.fields['form-rendezvenyHelyszine'],
        rendezvenySzemelyekListaja: request.fields['form-rendezvenySzervezok'],
        rendezenyID: ujID,
        rendezvenyKepek: []
      }
    )

    writeFileSync('./ide.json', JSON.stringify(localArray),(err) => {
    })
  }

  var respBody = `A szerver sikeresen megkapta a következő információt:
    név: ${request.fields['form-rendezvenyNev']}
    kezdesiIdopont: ${request.fields['form-rendezvenyKezdesiIdopont']}
    vegzesiIdopont: ${request.fields['form-rendezvenyVegzesiIdopont']}
    helyszint: ${request.fields['form-rendezvenyHelyszine']}
    szervezok: ${request.fields['form-rendezvenySzervezok']}
    beszurtID: ${ujID}
  `;
  response.status(200);

  if (!megfelelo) respBody += 'Volt mar ilyen nevu esemeny'

  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(respBody);
});


app.use('/lekezelRendezvenySzervezoCsatlakozas', (request, response) => {

  const localArray = JSON.parse(readFileSync('./ide.json', (err) => {}))
  var rendezvenyLetezik = false;
  var csatlakozhat = true;
  var kilephet = false;
  var respBody = ''


  localArray.forEach(function(value){
    if (value.rendezenyID == request.fields['form-rendezvenyID'])
    {
      rendezvenyLetezik = true;
      const szervezok = value.rendezvenySzemelyekListaja.split(', ',)
      if (request.fields['form-rendezvenySzervezoValasztas'] == 'csatlakozas')
      {
        szervezok.forEach(function(value1){
          if (value1 == request.fields['form-rendezvenySzervezo'])
          csatlakozhat = false;
        })
        if (csatlakozhat == true){
        value.rendezvenySzemelyekListaja += ', ' + request.fields['form-rendezvenySzervezo'];
        }
      }
      else
      {
        value.rendezvenySzemelyekListaja = ''
        szervezok.forEach(function(value1){
          if (value1 == request.fields['form-rendezvenySzervezo'])
          {
            kilephet = true;
          }
          else
          {
            if (value.rendezvenySzemelyekListaja == '')
              value.rendezvenySzemelyekListaja += value1
            else
              value.rendezvenySzemelyekListaja += ', ' + value1
          }
        })
      } 
    }
  });
 
  if (kilephet == true || csatlakozhat == true)
  {
    //valtoztatjuk a formot
    writeFileSync('./ide.json', JSON.stringify(localArray),(err) => {
    })
  }

  
  if (!rendezvenyLetezik)
  {
    respBody = 'Nem letezik ez az ID-ju esemeny'
  }
  else
  {  
    if (request.fields['form-rendezvenySzervezoValasztas'] == 'csatlakozas')
    {
      if (csatlakozhat == false)
      {
        respBody = 'Mar ehez az esemenyhez tartozol nem csatlakozhatsz ujra'
        response.status(400);
      }
      else
      {
        respBody = 'Minden rendben csatlakoztal az esemenyhez'
        response.status(400);
      }
    }
    
    if (request.fields['form-rendezvenySzervezoValasztas'] == 'visszalepes')
    {
      if (kilephet == false)
      {
        respBody = 'Nem tartozol ehez az esemenyhez, ezert nem is tudsz kilepni belole'
        response.status(400);
      }
      else
      {
        respBody = 'Minden rendben kileptel az esemenybol'
        response.status(200);
      }
    }
    
  }
  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(respBody);
});

app.post('/lekezelRendezvenySzervezoFenykepHozzaadas', (request, response) => {

  const localArray = JSON.parse(readFileSync('./ide.json', (err) => {}))
  
  var rendezvenyLetezik = false;
  var szervezoE = false;
  var respBody = ``

  localArray.forEach(function(value){
    if (value.rendezenyID == request.fields['form-rendezvenyID'])
    {
      rendezvenyLetezik = true;
      const szervezok = value.rendezvenySzemelyekListaja.split(', ',)
        szervezok.forEach(function(value1){
          if (value1 == request.fields['form-rendezvenySzervezo'])
          szervezoE = true; 
        })
        if (szervezoE == true){
        //itt kene hozza adni a kepet a kepekhez
        const fileHandler = request.files['form-rendezvenyFenykep'];
        const file = fileHandler.path
        const fileLista = file.split('\\',)
        value.rendezvenyKepek.push(fileLista[fileLista.length-1])

        //valtoztatjuk a formot
        writeFileSync('./ide.json', JSON.stringify(localArray),(err) => {
    })
        }
        else
        {

          const fileHandler = request.files['form-rendezvenyFenykep'];
          const path = fileHandler.path

          console.log(path)
           fs.unlink(path, function (err) {
            if (err) {
              console.error(err);
            } 
          });
        }
    }
  });
 
  // writeFileSync('./ide.json', JSON.stringify(localArray),(err) => {})

  if (!rendezvenyLetezik)
  {
    respBody = 'Nem letezik az adott Id-ju esemeny'
    response.status(400);
  }
  else
  {
    if (!szervezoE)
    {
      respBody = 'A megadott szemely nem szervezo a valasztott esemenyen'
      response.status(400);
    }
    else
    {
      respBody = 'Sikerult hozzaadni a kivalasztott kepet az esemenyhez'
      response.status(200);
    }
  }

  response.set('Content-Type', 'text/plain;charset=utf-8');
  response.end(respBody);
});



app.listen(8000, () => {
  console.log('Server listening on http://localhost:8000/ ...');
});



