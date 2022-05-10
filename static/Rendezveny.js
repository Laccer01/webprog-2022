function save() {
  const error = document.forms.RendezvenyBevezetes.errorBekuldes1;

  if (document.getElementById('form-rendezvenyNev').value !== '' && document.getElementById('form-rendezvenyKezdesiIdopont').value !== '' && document.getElementById('form-rendezvenyVegzesiIdopont').value !== '' && document.getElementById('form-rendezvenyHelyszine').value !== '' && document.getElementById('form-rendezvenySzervezok').value !== '') {
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
