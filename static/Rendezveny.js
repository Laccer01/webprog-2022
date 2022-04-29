function save() {
  if (document.getElementById('form-rendezvenyNev').value !== '' && document.getElementById('form-rendezvenyKezdesiIdopont').value !== '' && document.getElementById('form-rendezvenyVegzesiIdopont').value !== '' && document.getElementById('form-rendezvenyHelyszine').value !== '' && document.getElementById('form-rendezvenySzervezok').value !== '') {
    return true;
  }

  alert('Mindegyik mezőt szükséges kitölteni!');
  return false;
}

function saveSzervezoCsatlakozas() {
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
    return true;
  }

  alert('Mindegyik mezőt szükséges kitölteni!');
  return false;
}

function saveRendezvenyFenykepHozzaadas() {
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '' && document.getElementById('form-rendezvenyFenykep').value !== '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
    return true;
  }

  alert('Mindegyik mezőt szükséges kitölteni!');
  return false;
}

const el1 = document.forms.RendezvenyBevezetes['form-submit'];
el1.addEventListener('click', save, false);

const el2 = document.forms.RendezvenySzervezoCsatlakozas['form-saveSzervezoCsatlakozas'];
el2.addEventListener('click', saveSzervezoCsatlakozas, false);

const el3 = document.forms.RendezvenySzervezoFenykepHozzaadas['form-saveSzervezoCsatlakozas'];
el3.addEventListener('click', saveRendezvenyFenykepHozzaadas, false);
