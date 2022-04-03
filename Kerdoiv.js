//     Név: Velican László
//     Azonosító: vlim2099
//     Labor: lab2
//     Sorszám: 10  
    

let form_szovegdoboz;

//Ellenőrizzük JavaScript kód segítségével (onblur eseményre), hogy:
//– az e-mail cím érvényes gmail-es vagy yahoo-s e-mailcím
function emailEllenorzes(email) {           //Ellenőrzi ha egy megadott emailcím helyes e, azaz yahoo vagy gamil email cím e, ha nem megjelenik az oldalon egy figyelmeztető üzenet
    let emailEllenorizendo = email.value;
    let emailGmail = /\S+@gmail\.\S+/ 
    let emailYahoo = /\S+@yahoo\.\S+/
    var error = document.getElementById("errorEMAIL")
    if (emailGmail.test(emailEllenorizendo) || emailYahoo.test(emailEllenorizendo) || emailEllenorizendo == "") {
        error.textContent = ""
    }
    else {
        error.textContent = "Helytelen email"               //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
        error.style.color = "red"
        // A form leadását jelző submit gomb ne legyen elérhető, amig hibák vannak a formban. Ez
        // megoldható CSS validitás szerinti szelektorral, vagy JavaScripttel.
        document.getElementById("form-submit").style.display = 'none';              //ha nem helyes az emailcím nem elérhető a submit gomb
    }
}


// Ellenőrizzük JavaScript kód segítségével (onblur eseményre), hogy:
// – a weboldal címében pedig szerepel legalább egy doménium illetve egy aldoménium,
// csak kisbetűt, nagybetűt, számjegyet, alulvonást vagy kötőjelet tartalmaz, stb.
function urlEllenorzes(url) {            //Ellenőrzi ha egy megadott URL helyes e, ha tartalmaz egy domeniumot és egy aldomeniumo, valamint csak kisü nagybetuket, szamjegyeket, alulvonast es vonalat tartalmaz, ha nem megjelenik az oldalon egy figyelmeztető üzenet

    let emailEllenorizendo = url.value
    let vanHiba = false;
    var error = document.getElementById("errorURL")
    error.textContent = ""
    if (emailEllenorizendo != "") {
        if (emailEllenorizendo.match("^[A-Za-z0-9/:._]+$")) {
            error.textContent = ""
            var url1 = emailEllenorizendo.split('//');
            if (url1[0] === "http:" || url1[0] === "https:") {
                var host = url1[1].split('.');

                if (host.length <= 3) {
                    error.textContent = "Hianyzik a domain vagy a subdomain"            //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
                    error.style.color = "red"
                    vanHiba = true
                }
            }
            else {
                error.textContent = "Helytelen email cim (hianyzik http/https) "            //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
                error.style.color = "red"
                vanHiba = true
            }
        }
        else {
            error.textContent = "Helytelen email cim, csak kisbetuket,nagybetuket,alulvonast es kotojelet tartalmazhat az URL"      //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
            error.style.color = "red"
            vanHiba = true
        }
    }
   
//     A form leadását jelző submit gomb ne legyen elérhető, amig hibák vannak a formban. Ez
//     megoldható CSS validitás szerinti szelektorral, vagy JavaScripttel.
    if (vanHiba)
    {
        document.getElementById("form-submit").style.display = 'none';                              //ha nem helyes az emailcím nem elérhető a submit gomb
    }
}

function jelszoEllenorzes(jelszo) {           //Ellenőrzi ha egy megadott jelszó helyes e, ha nem, megjelenik az oldalon egy figyelmeztető üzenet
                      
    let jelszoEllenorzes = jelszo.value
    var error = document.getElementById("errorPWD")
    const specialisKarakterek1 = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{1}/;
    const specialisKarakterek2 = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{2}/;
    const specialisKarakterek3 = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{3,}/;

    const kisbetu = /[a-z]/;
    const nagybetu = /[A-Z]/;
    const szamjegy = /[0-9]/; 

    var hibaelso = false;
    var hibamasodik = false;
    var eddigmegfelelo = true;
    if (specialisKarakterek3.test(jelszoEllenorzes)) {
        hibaelso = true;

    }
    else
        if (specialisKarakterek1.test(jelszoEllenorzes) || specialisKarakterek2.test(jelszoEllenorzes)) {
            hibaelso = false;
        }
        else {
            hibaelso = true;
        }

    if (kisbetu.test(jelszoEllenorzes)) {
        if (nagybetu.test(jelszoEllenorzes)) {
            if (szamjegy.test(jelszoEllenorzes)) {
                error.textContent = ""
            }
            else {
                hibamasodik = true;
            }
        }
        else {
            hibamasodik = true;
        }
    }
    else {
        hibamasodik = true;
    }

    if (!hibamasodik || !hibaelso || jelszoEllenorzes == "") {
        error.textContent = ""
        eddigmegfelelo = true;
    }
//     legalább egy, legtöbb két speciális karakter (ami nem betű és nem szám vagy alulvonás) kell
//     szerepeljen benne, vagy legyen benne nagy- és kisbetű, illetve számjegy is
    else {
        error.textContent = "Nem tartalmaz egy vagy maximum 2 specialis karaktert vagy nem tartalmaz kisbetut, nagybetut es szamjegyet"         //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
        error.style.color = "red"
        eddigmegfelelo = false;
    }

    if (eddigmegfelelo && jelszoEllenorzes != "") {
        // legyen legalább 5 karakter hosszúságú
        if (jelszoEllenorzes.length < 5) {
            eddigmegfelelo = false;
            error.textContent = "A jelszo hossza legalabb 5 karakter kell legyen"           //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
            error.style.color = "red"
        }
        // 12 karakternél hosszabb nem lehet
        if (jelszoEllenorzes.length > 12) {
            eddigmegfelelo = false;
            error.textContent = "A jelszo hossza maximum 12 karakter lehet"                 //Hiba esetén jelenítsünk meg egy megfelelő hibaüzenetet
            error.style.color = "red"
        }
    }

    // A form leadását jelző submit gomb ne legyen elérhető, amig hibák vannak a formban. Ez
    // megoldható CSS validitás szerinti szelektorral, vagy JavaScripttel.
    if (!eddigmegfelelo)
    {
        document.getElementById("form-submit").style.display = 'none';                              //nem jelenik meg a submit gomb
    }
   
    jelszoAtmasolo();                                                                               //átmásolom egy másik input cellába a jelszót, hogy látható legyen

}

function jelszoAtmasolo()                                                                                       
{
    document.getElementById('form-jelszoEllenorzo').value = document.getElementById('form-jelszo').value;
}

function save() {                               //biztonság kedvéért vizsgálja hogy ne legyen egyik mező sem üres                              

    if (document.getElementById('form-csNev').value !== '' && document.getElementById('form-vNev').value !== '' && document.getElementById('form-szulDat').value !== '' && document.getElementById('form-email').value !== '' && document.getElementById('form-webOldal').value !== '') {
        document.getElementById('form-vNev').setValue = "";
        document.getElementById('form-szulDat').setValue = "";
        document.getElementById('form-email').setValue = "";
        document.getElementById('form-webOldal').setValue = "";
    }
    else {
        alert("Mindegyik mezőt szükséges kitölteni!");
    }
}

// Miközben beírjuk a szöveget, az elkezd a megadott irányba gördülni a következő szabályok alapján:
function animate(element)                                                       //ez a függvény animálja a mozgó szöveget

{
    let eredetiElement = element;
    let elementWidth = element.offsetWidth;
    let parentWidth = element.parentElement.offsetWidth;
    let flag = 0;

//     ha rövidebb a szöveg, mint a görgetés számára kijelölt div szélessége, akkor többször egymás
// után jelenik meg.
    while (element.offsetWidth < element.parentElement.offsetWidth)
    {
        element.innerText = element.innerText + " " + eredetiElement.innerText
    }
    if (document.getElementById("form-iranyValasztas").value == "bal")              
    {
        element.style.marginLeft = -elementWidth
        flag = 1200;
    }
    else
    {
        element.style.marginLeft = parentWidth
        flag = 0;
    }

//     a szöveg mindig a görgetésre szánt területnek a megadott iránnyal ellentétes oldalán indul és
//     legyen olvasható.
//     úgy kell működjön, mint a (nem standard!) marquee tag, csak ebben az esetben egy div-ben kell
//     megjelenjen a görgetett szöveg.
     mozgoSzoveg = setInterval(() => {
        elementWidth = element.offsetWidth;
        if (document.getElementById("form-iranyValasztas").value == "bal") {
            element.style.marginLeft = (flag -= 5) + "px";

            if (elementWidth <= -flag) {
                flag = parentWidth;
            }
        } else {
            element.style.marginLeft = (flag += 5) + "px";

            if (parentWidth <= parseInt(element.style.marginLeft)) {
                flag = -elementWidth;
            }
        }
    }, 50);
}

// egy gomb megnyomásával újrakezdhető a görgetés.
function gombUjrakezdes ()
{
    clearInterval(mozgoSzoveg);
    animate(document.getElementById("mozogos"));
}

window.onload = () =>
{
    form_szovegdoboz = document.getElementById("form_szovegdoboz");
    document.getElementById("mozogos").innerText = form_szovegdoboz.value;
    animate(document.getElementById("mozogos"));
   
    // JavaScriptet használva szúrjuk be a HTML oldal aljára (a footer-be), középre igazítva az
    // utolsó módosítás dátumát (lásd: document.lastModified).
    document.getElementById("legutolsoValtoztatas").innerHTML = "Utolso modositas datuma: " + document.lastModified;

    document.getElementById("form-submit").style.display = 'none';
}

window.onchange  = () => {
    
    let okes = true
    let nev = /^[A-Z]{1}[a-z]{1,}$/

    form_szovegdoboz = document.getElementById("form_szovegdoboz");                 //azért van az onchange-ben is lehessen valtoztatni a szoveget
    document.getElementById("mozogos").innerText = form_szovegdoboz.value;
    
    clearInterval(mozgoSzoveg);
    animate(document.getElementById("mozogos"));

    
    var mezo1 = document.getElementById('form-csNev')
    var mezo2 = document.getElementById('form-vNev')
    var mezo3 = document.getElementById('form-szulDat')
    var mezo4 = document.getElementById('form-email')
    var mezo5 = document.getElementById('form-webOldal')
    var mezo6 = document.getElementById('form-jelszo')

    // A form leadását jelző submit gomb ne legyen elérhető, amig hibák vannak a formban. Ez
    // megoldható CSS validitás szerinti szelektorral, vagy JavaScripttel.
    if (!(nev.test(mezo1.value)))
    {
        okes = false;
    }

    if (!(nev.test(mezo2.value)))
    {
        okes = false;
    }
    //ha üresek a mezők vagy helytelenek a nevek akkor nem jelenik meg a submit gomb
    if (mezo1.value == '' || mezo2.value == '' || mezo3.value == '' || mezo4.value == '' ||mezo5.value == '' || mezo6.value == '' || !okes)
    {
        document.getElementById("form-submit").style.display = 'none';
    }
    else
    {
        document.getElementById("form-submit").style.display = 'inline-block';
    }

    emailEllenorzes(mezo4.INNERHTML)
    urlEllenorzes(mezo5.value)
    jelszoEllenorzes(mezo6.value)
}







