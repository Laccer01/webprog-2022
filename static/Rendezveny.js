function save() {                               // biztonság kedvéért vizsgálja hogy ne legyen egyik mező sem üres
  if (document.getElementById('form-rendezvenyNev').value !== '' && document.getElementById('form-rendezvenyKezdesiIdopont').value !== '' && document.getElementById('form-rendezvenyVegzesiIdopont').value !== '' && document.getElementById('form-rendezvenyHelyszine').value !== '' && document.getElementById('form-rendezvenySzervezok').value !== '') {
    return true;
  }

  alert('Mindegyik mezőt szükséges kitölteni!');
  return false;
}

function saveSzervezoCsatlakozas() {                               // biztonság kedvéért vizsgálja hogy ne legyen egyik mező sem üres
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
  } else {
    alert('Mindegyik mezőt szükséges kitölteni!');
  }
}

function saveRendezvenyFenykepHozzaadas() {                               // biztonság kedvéért vizsgálja hogy ne legyen egyik mező sem üres
  if (document.getElementById('form-rendezvenySzervezo').value !== '' && document.getElementById('form-rendezvenyID').value !== '' && document.getElementById('form-rendezvenyFenykep').value != '') {
    document.getElementById('form-rendezvenySzervezo').setValue = '';
    document.getElementById('form-rendezvenyID').setValue = '';
  } else {
    alert('Mindegyik mezőt szükséges kitölteni!');
  }
}
