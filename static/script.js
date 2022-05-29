function save() {
  const error = document.forms.RendezvenyBevezetes.errorBekuldes1;

  if (document.getElementById('form-rendezvenyNev').value !== ''
   && document.getElementById('form-rendezvenyKezdesiIdopont').value !== ''
   && document.getElementById('form-rendezvenyVegzesiIdopont').value !== ''
   && document.getElementById('form-rendezvenyHelyszine').value !== ''
    && document.getElementById('form-rendezvenySzervezok').value !== '') {
    error.textContent = '';
    return true;
  }

  error.textContent = 'Mindegyik mezőt szükséges kitölteni!';               // Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
  error.style.color = 'red';

  return false;
}

function saveSzervezoCsatlakozas() {
  const error = document.forms.RendezvenySzervezoCsatlakozas.errorBekuldes1;
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
    error.textContent = '';
    return true;
  }

  error.textContent = 'Mindegyik mezőt szükséges kitölteni!';               // Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
  error.style.color = 'red';

  return false;
}

function saveRendezvenyFenykepHozzaadas() {
  const error = document.forms.RendezvenySzervezoFenykepHozzaadas.errorBekuldes1;
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '' && document.getElementById('form-rendezvenyFenykep').value !== '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
    error.textContent = '';
    return true;
  }

  error.textContent = 'Mindegyik mezőt szükséges kitölteni!';               // Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
  error.style.color = 'red';
  return false;
}

const el1 = document.forms.RendezvenyBevezetes['form-submit'];
el1.addEventListener('click', save, false);

const el2 = document.forms.RendezvenySzervezoCsatlakozas['form-saveSzervezoCsatlakozas'];
el2.addEventListener('click', saveSzervezoCsatlakozas, false);

const el3 = document.forms.RendezvenySzervezoFenykepHozzaadas['form-saveSzervezoCsatlakozas'];
el3.addEventListener('click', saveRendezvenyFenykepHozzaadas, false);

async function csatlakozasVagyKilepes(id, szervezoNev) {
  try {
    const result = await fetch(`/api/szervezoCsatlakozasKilepes?id=${id}&name=${szervezoNev}`);
    const megvaltozottValasztas = await result.json();
    document.getElementById(`button-${id}-${szervezoNev}`).innerText = megvaltozottValasztas;
  } catch (error) {
    console.log(error);
  }
}

async function showMore(id) {
  try {
    const result = await fetch(`/api/rendezveny/${id}`);
    const rendezveny = await result.json();

    const result1 = await fetch('/api/szervezok');
    const szervezok = await result1.json();

    document.getElementById(`content-text${id}`).innerText = rendezveny;

    let result3,
      csatlakozasVagyKilepesValtozo;
    await Promise.all(szervezok.map(async (szervezo) => {
      result3 = await fetch(`/api/szervezoE?id=${id}&name=${szervezo}`);
      csatlakozasVagyKilepesValtozo = await result3.json();
      document.getElementById(`button-${id}-${szervezo}`).innerText = csatlakozasVagyKilepesValtozo;

      let hidden = document.getElementById(`button-${id}-${szervezo}`).getAttribute("hidden");
      if (hidden === "hidden")
        document.getElementById(`button-${id}-${szervezo}`).removeAttribute("hidden");
    }));
  } catch (error) {
    console.log(error);
  }
}
