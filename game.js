'use strict';
/*
 * SUPER M. - platformska igrica (iPhone web verzija)
 * Prepisano iz Java (NetBeans) verzije 7: ista fizika, nivoi, lik i protivnici.
 *
 * Tastatura (računar):  ← → / A D kretanje, SPACE / ↑ / W skok, SHIFT trčanje, ENTER start, P pauza
 * iPhone:               dugmići na ekranu (← →, SKOK, TRK), dodir ekrana za start, ❚❚ pauza
 */

// =====================================================================
// OSNOVNA PODEŠAVANJA
// =====================================================================
const PLOCICA = 32;
const SIRINA = 25 * PLOCICA;   // 800
const VISINA = 15 * PLOCICA;   // 480

const GRAVITACIJA = 0.6;
const MAX_PAD = 12;
const SKOK_BRZINA = -12.6;
const SKOK_PREKID = -4;
const HOD_MAX = 3.2;
const TRK_MAX = 5.4;
const UBRZANJE_ZEMLJA = 0.28;
const UBRZANJE_VAZDUH = 0.18;
const TRENJE = 0.30;
const KOJOT_VREME = 6;
const SKOK_BAFER = 6;
const NEPRIJATELJ_BRZINA = 1.0;

const PW = 20, PH_MALI = 36, PH_VELIKI = 52;
const VATRA_TRAJANJE = 600;    // ljuta paprika: 10 sekundi vatre
const MAX_KUGLICA = 2;         // najviše 2 vatrene kuglice na ekranu odjednom
const RAZMERA_VELIKI = PH_VELIKI / 36;

// =====================================================================
// NIVOI
// =====================================================================
// # zemlja/kamen   B cigla   ? kutija sa novčićem   R kutija sa flašicom rakije   L kutija sa ljutom paprikom
// = kamena platforma   o novčić   E ljutko   K glavni crveni ljutko   Z rešetka   P start   F zastavica
const NIVOI = [
  [ // SVET 1-1
    "",
    "",
    "",
    "",
    "                                                                                ooo                             o o",
    "                ?                                                               ===                            =====                       #",
    "                                               L                                                                                          ##",
    "                                                                                                          o o                            ###",
    "                                                                                                         ======                         ####",
    "          ?   BBRBB                 o o o o   o o   oooo             ##       BBRB?BB                         ?                        #####",
    "                                 #          =======                 ####               =====          #                               ######",
    "                         #       #                                 ######                             #                              #######",
    "   P                  E  #       #   E  E                   E E   ########  E         E        E E E  #          E          E  E    ########          F",
    "############################   #####################    ################################   ###########################    ######################################",
    "############################   #####################    ################################   ###########################    ######################################",
  ],
  [ // SVET 1-2
    "",
    "",
    "",
    "",
    "",
    "          R                                                             o o o                                            ?                         #",
    "                                                                          E                                                                       ##",
    "                               oooo                                     =====                                                                    ###",
    "                              ======      E                                                                                                     ####",
    "        BB?BB                           BBB?BBB                               ?B?BL         oo    o        ##         BBBRBBB      oooo        #####",
    "                          #                           ##          =====                                   ####                                ######",
    "                         ##                           ##                                                 ######                              #######",
    "   P            E   E   ###                     E  E  ##                        E  E  E        ##       ########  E  E         E            ########                  F",
    "###############################    ##########################   ###########################    ##   ###############################    #############################################",
    "###############################    ##########################   ###########################    ##   ###############################    #############################################",
  ],
  [ // SVET 1-3
    "",
    "",
    "",
    "",
    "                                                                                                               ?",
    "                  o     o       o    o        o     o       o    o   L    o     o      o    o    ?   o     o       o    o       o      o",
    "                           BRB                          E                                ##",
    "                                                      #####                              ##                    E                                     #",
    "                                  ##                  #####          E            ####   ##     E            #####          E                       ##",
    "        ?           ###     E     ##            ###   #####        ######         ####   ##   ######         #####        #####                    ###",
    "                    ###   #####   ##     E      ###   #####   ##   ######         ####   ##   ######   ###   #####        #####   ####            ####",
    "             ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####   ##   ######   ###   #####   ##   #####   ####           #####",
    "   P         ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####   ##   ######   ###   #####   ##   #####   ####   ###    ######          F",
    "###########  ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####   ##   ######   ###   #####   ##   #####   ####   ###  ############################",
    "###########  ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####   ##   ######   ###   #####   ##   #####   ####   ###  ############################",
  ],
  [ // SVET 1-4
    "                                                                                                                                                                                              Z",
    "                                                                                                                                                                                              Z",
    "                                                                                                                                                                                              Z",
    "                                                                                                                                                                                              Z",
    "                                                                                 o o o                                                                                                        Z",
    "                                                                                =======                                                                                ####                   Z",
    "                                                                                                                                                                      #####                   Z",
    "                                                                                            oo      oo                                                               ######                   Z",
    "                      ooo                                              E   E                                                                                        #######                   Z",
    "        BRB                         #                        ##     BB?BBRBBLBB                                                 E       ##                         ########                   Z",
    "                              #     #         ===           ####                                                           #   ===     ####             ===       #########                   Z",
    "                              #     #                      ######                       ###    ####    ###             #   #          ######                     ##########           K       Z",
    "   P          E E E           #  E  #   E E               ########   E  E    E  E       ###    ####    ###    E    E   #   #         ########  E E E            ###########                   Z   F",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
  ],
  [ // SVET 2-1
    "################################################################################################################################################################",
    "################################################################################################################################################################",
    "                 #           #                                  #               ################  #",
    "                 #           #                                  #               ################  #",
    "                             #                                                  ################  #",
    "             ?                                    L                             ################                                              #",
    "                                                                                ################                                             ##",
    "                                                                                ################                                            ###",
    "                                                 o o                                                                                       ####",
    "         ? BBRBB                ooo            ======                   BB?BB                        oo                  ##               #####",
    "                                                         #                                                              ####             ######",
    "                       #                #               ##                        o  o  o  o                           ######           #######",
    "   P               E   #  E             #  E  E        ###         E  E               E     E                 E  E    ########  E      ########         F",
    "################################   #########################   #####################################    ########################################################",
    "################################   #########################   #####################################    ########################################################",
  ],
  [ // SVET 2-2
    "####################################################################################################################################################################################",
    "####################################################################################################################################################################################",
    "                                                                                                        ##############",
    "                                                                                                        ##############",
    "                                                                                                        ##############",
    "                                                                      o o o                             ##############                                  #",
    "                                                                        E                               ##############                                 ##",
    "                             oooo                                     =====                             ##############                                ###",
    "              BBBB?BBBB     ======     E                                                                                                             ####",
    "       BB?RBB                        BBB?BBB                                 ?BLB?          oo    o                        ##            oo         #####",
    "                          #                          ##         =====                                                     ####                     ######",
    "                         ##                          ##                                                                  ######                   #######",
    "   P           E   E    ###                   E   E  ##                       E  E             ##           E    E      ########  E              ########               F",
    "#############################    ##########################   #############################    ##   ####################################    ########################################",
    "#############################    ##########################   #############################    ##   ####################################    ########################################",
  ],
  [ // SVET 2-3
    "##########################################################################################################################################################################",
    "##########################################################################################################################################################################",
    "",
    "",
    "                                                                                                               ?",
    "                                                                     ?                           L",
    "                  o     o       o    o        o     o       o    o        o     o      o    o        o     o       o    o       o      o",
    "                                                        E                                                      E                                     #",
    "                                  ##                  #####          E            ####  ####                 #####          E                       ##",
    "        R           ###     E     ##            ###   #####        ######         ####  ####  ######         #####        #####                    ###",
    "                    ###   #####   ##     E      ###   #####   ##   ######         ####  ####  ######   ###   #####        #####   ####            ####",
    "             ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####  ####  ######   ###   #####   ##   #####   ####           #####",
    "   P         ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####  ####  ######   ###   #####   ##   #####   ####   ###    ######          F",
    "###########  ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####  ####  ######   ###   #####   ##   #####   ####   ###  ############################",
    "###########  ####   ###   #####   ##   ######   ###   #####   ##   ######   ###   ####  ####  ######   ###   #####   ##   #####   ####   ###  ############################",
  ],
  [ // SVET 2-4
    "########################################################################################################################################################################################################",
    "########################################################################################################################################################################################################",
    "                                                                                  #######                                                                                                     Z",
    "                                                                                  #######                                                                                                     Z",
    "                                                                                  #######                                                                                                     Z",
    "                                                                                  #######                                                                              ####                   Z",
    "                                                                                  #######                                                                             #####                   Z",
    "                                                                                            oo      oo                                                               ######                   Z",
    "                      ooo                                              E   E                                                                                        #######                   Z",
    "        BRB                         #                        ##     BB?BBLBBRBB                                                 E       ##                         ########                   Z",
    "                              #     #         ===           ####                                                           #   ===     ####             ===       #########                   Z",
    "                              #     #                      ######                       ###    ####    ###             #   #          ######                     ##########           K       Z",
    "   P          E E E           #  E  #   E E               ########   E  E    E  E       ###    ####    ###    E    E   #   #         ########  E E E            ###########                   Z   F",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
  ],
];
const VREME_NIVOA = [300, 300, 280, 300, 300, 300, 280, 300];
const BROJ_SVETOVA = NIVOI.length / 4;
const IMENA_SVETOVA = ['LIVADA', 'PEĆINA'];

// =====================================================================
// STANJE IGRE
// =====================================================================
const S = {
  stanje: 'NASLOVNA',          // NASLOVNA, UVOD, IGRA, PAUZA, POGINUO, KRAJ_IGRE, POBEDA, SVET_ZAVRSEN
  trenutniNivo: 0,
  mapa: [], mapaSirina: 0, mapaVisina: 0,
  startX: 0, startY: 0, zastavaX: 0,
  px: 0, py: 0, pvx: 0, pvy: 0, PH: PH_MALI,
  veliki: false, rastTajmer: 0, predjeno: 0,
  naZemlji: false, gledaDesno: true,
  kojot: 0, skokBafer: 0, nepovredivost: 0, tajmerStanja: 0,
  levo: false, desno: false, skokDrzi: false, trci: false,
  poeni: 0, novcici: 0, zivoti: 3, vreme: 300, vremeBrojac: 0, kombo: 0,
  najboljiRezultat: 0,
  lik: 'M',                    // 'M' = momak, 'Z' = devojka
  kamera: 0, animBrojac: 0,
  neprijatelji: [], efekti: [], cokanji: [],
  paprike: [], kuglice: [], vatra: 0, bacanje: 0, pucaDrzi: false,
  glavni: null, beleKugle: [],   // glavni crveni ljutko i njegove bele kugle
  pocetniSvet: 1, otkljucanSvet: 1,
};

try { S.najboljiRezultat = parseInt(localStorage.getItem('superm-najbolji'), 10) || 0; } catch (e) { }
try { if (localStorage.getItem('superm-lik') === 'Z') S.lik = 'Z'; } catch (e) { }
try { S.otkljucanSvet = Math.max(1, Math.min(BROJ_SVETOVA, parseInt(localStorage.getItem('superm-svet'), 10) || 1)); } catch (e) { }
function otkljucajSvet(n) {
  if (n > S.otkljucanSvet) {
    S.otkljucanSvet = n;
    try { localStorage.setItem('superm-svet', String(n)); } catch (e) { }
  }
}
function svet() { return Math.floor(S.trenutniNivo / 4) + 1; }           // 1 = selo, 2 = pećina
function oznakaNivoa() { return svet() + '-' + (S.trenutniNivo % 4 + 1); }
function izaberiLik(l) {
  S.lik = l;
  try { localStorage.setItem('superm-lik', l); } catch (e) { }
}
function sacuvajNajbolji() {
  S.najboljiRezultat = Math.max(S.najboljiRezultat, S.poeni);
  try { localStorage.setItem('superm-najbolji', String(S.najboljiRezultat)); } catch (e) { }
}

function noviNeprijatelj(x, y) {
  return { x, y, vx: -NEPRIJATELJ_BRZINA, vy: 0, w: 28, h: 26, ziv: true, aktivan: false, naZemlji: false, spljosten: 0 };
}
function noviEfekat(x, y, tekst, novcic) {
  return { x, y, tekst, novcic, vy: novcic ? -6 : -1.2, zivot: novcic ? 30 : 45 };
}
function novaPaprika(x, vrhKutije) {    // ljuta paprika - izađe iz kutije i ostane na njoj
  const h = 26;
  return { x, y: vrhKutije + PLOCICA - 2 - h, w: 16, h, izlazakDo: vrhKutije - h };
}
function novaKuglica(x, y, smer) {
  return { x, y, vx: 6.5 * smer, vy: 2, r: 5, zivot: 150, okret: 0 };
}
function noviCokanj(x, vrhKutije) {      // flašica rakije
  const h = 30;
  return { x, y: vrhKutije + PLOCICA - 2 - h, vx: 0, vy: 0, w: 16, h, izlazi: true, izlazakDo: vrhKutije - h };
}

// =====================================================================
// UČITAVANJE NIVOA
// =====================================================================
function ucitajNivo() {
  const NIVO = NIVOI[S.trenutniNivo];
  S.mapaVisina = NIVO.length;
  S.mapaSirina = Math.max(...NIVO.map(r => r.length));
  S.mapa = [];
  S.cokanji = []; S.neprijatelji = []; S.efekti = [];
  S.paprike = []; S.kuglice = []; S.vatra = 0; S.bacanje = 0;
  S.glavni = null; S.beleKugle = [];
  S.veliki = false; S.PH = PH_MALI; S.rastTajmer = 0;
  for (let y = 0; y < S.mapaVisina; y++) {
    const red = [];
    for (let x = 0; x < S.mapaSirina; x++) {
      let c = x < NIVO[y].length ? NIVO[y][x] : ' ';
      if (c === 'P') {
        S.startX = x * PLOCICA + (PLOCICA - PW) / 2;
        S.startY = y * PLOCICA + PLOCICA - S.PH;
        c = ' ';
      } else if (c === 'E') {
        S.neprijatelji.push(noviNeprijatelj(x * PLOCICA + 2, y * PLOCICA + PLOCICA - 26));
        c = ' ';
      } else if (c === 'F') {
        S.zastavaX = x * PLOCICA;
        c = ' ';
      } else if (c === 'K') {
        S.glavni = noviGlavni(x * PLOCICA, y * PLOCICA + PLOCICA * 2 - GLAVNI_H);
        c = ' ';
      }
      red.push(c);
    }
    S.mapa.push(red);
  }
  S.px = S.startX; S.py = S.startY; S.pvx = 0; S.pvy = 0;
  S.gledaDesno = true; S.naZemlji = false;
  S.kojot = 0; S.skokBafer = 0; S.nepovredivost = 0; S.kombo = 0;
  S.vreme = VREME_NIVOA[S.trenutniNivo]; S.vremeBrojac = 0;
  S.kamera = 0;
}

function novaIgra() {
  S.trenutniNivo = (S.pocetniSvet - 1) * 4;
  S.poeni = 0; S.novcici = 0; S.zivoti = 3;
  ucitajNivo();
  pokreniUvod();
}

function pokreniUvod() { S.stanje = 'UVOD'; S.tajmerStanja = 120; }

function sledeciNivo() {
  if (S.trenutniNivo < NIVOI.length - 1) {
    S.trenutniNivo++;
    otkljucajSvet(svet());
    S.novcici = 0;                       // između nivoa se čuvaju samo poeni i životi
    ucitajNivo();
    pokreniUvod();
  } else {
    sacuvajNajbolji();
    S.stanje = 'SVET_ZAVRSEN';
  }
}

function polje(tx, ty) {
  if (tx < 0 || tx >= S.mapaSirina) return '#';     // nevidljivi zid levo i desno
  if (ty < 0 || ty >= S.mapaVisina) return ' ';
  return S.mapa[ty][tx];
}
function cvrsto(c) {
  return c === '#' || c === 'B' || c === '?' || c === 'R' || c === 'L' || c === 'U' || c === '='
    || (c === 'Z' && glavniZiv());               // rešetka je zatvorena dok je glavni ljutko živ
}
function glavniZiv() { return S.glavni !== null && S.glavni.hp > 0; }
function cvrstoNa(x, y) { return cvrsto(polje(Math.floor(x / PLOCICA), Math.floor(y / PLOCICA))); }

// =====================================================================
// JEDAN KORAK IGRE (60 u sekundi)
// =====================================================================
function azuriraj() {
  S.animBrojac++;
  switch (S.stanje) {
    case 'IGRA':
      if (S.rastTajmer > 0) { S.rastTajmer--; break; }
      azurirajIgraca();
      if (S.stanje !== 'IGRA' && S.stanje !== 'POGINUO') break;
      azurirajCokanje();
      azurirajPaprike();
      azurirajVatru();
      azurirajNeprijatelje();
      azurirajGlavnog();
      azurirajBeleKugle();
      azurirajEfekte();
      azurirajVreme();
      azurirajKameru();
      break;
    case 'POGINUO':
      S.pvy += GRAVITACIJA * 0.7;
      S.py += S.pvy;
      if (--S.tajmerStanja <= 0) {
        if (S.zivoti > 0) { ucitajNivo(); pokreniUvod(); }
        else { sacuvajNajbolji(); S.stanje = 'KRAJ_IGRE'; }
      }
      break;
    case 'UVOD':
      if (--S.tajmerStanja <= 0) S.stanje = 'IGRA';
      break;
    case 'POBEDA':
      azurirajEfekte();
      if (S.vreme > 0) {
        if (S.animBrojac % 2 === 0) { S.vreme--; S.poeni += 10; }
      } else if (--S.tajmerStanja <= 0) {
        sledeciNivo();
      }
      break;
  }
}

// ---------------- igrač ----------------
function azurirajIgraca() {
  const max = S.trci ? TRK_MAX : HOD_MAX;
  const ubrzanje = S.naZemlji ? UBRZANJE_ZEMLJA : UBRZANJE_VAZDUH;

  if (S.levo && !S.desno) {
    S.pvx -= ubrzanje * (S.pvx > 0 && S.naZemlji ? 2 : 1);
    S.gledaDesno = false;
  } else if (S.desno && !S.levo) {
    S.pvx += ubrzanje * (S.pvx < 0 && S.naZemlji ? 2 : 1);
    S.gledaDesno = true;
  } else if (S.naZemlji) {
    if (Math.abs(S.pvx) <= TRENJE) S.pvx = 0;
    else S.pvx -= Math.sign(S.pvx) * TRENJE;
  }
  if (S.pvx > max) S.pvx = Math.max(max, S.pvx - TRENJE);
  if (S.pvx < -max) S.pvx = Math.min(-max, S.pvx + TRENJE);

  if (S.naZemlji) S.kojot = KOJOT_VREME; else if (S.kojot > 0) S.kojot--;
  if (S.skokBafer > 0) S.skokBafer--;
  if (S.skokBafer > 0 && S.kojot > 0) {
    S.pvy = SKOK_BRZINA - Math.abs(S.pvx) * 0.25;
    S.skokBafer = 0; S.kojot = 0; S.naZemlji = false;
  }
  if (!S.skokDrzi && S.pvy < SKOK_PREKID) S.pvy = SKOK_PREKID;

  S.pvy += GRAVITACIJA;
  if (S.pvy > MAX_PAD) S.pvy = MAX_PAD;

  const PH = S.PH;
  // X osa
  S.px += S.pvx;
  if (S.naZemlji) S.predjeno += Math.abs(S.pvx);
  if (S.pvx > 0) {
    if (cvrstoNa(S.px + PW, S.py + 1) || cvrstoNa(S.px + PW, S.py + PH - 1) || cvrstoNa(S.px + PW, S.py + PH / 2)) {
      S.px = Math.floor((S.px + PW) / PLOCICA) * PLOCICA - PW;
      S.pvx = 0;
    }
  } else if (S.pvx < 0) {
    if (cvrstoNa(S.px, S.py + 1) || cvrstoNa(S.px, S.py + PH - 1) || cvrstoNa(S.px, S.py + PH / 2)) {
      S.px = Math.floor(S.px / PLOCICA) * PLOCICA + PLOCICA;
      S.pvx = 0;
    }
  }

  // Y osa
  S.py += S.pvy;
  S.naZemlji = false;
  if (S.pvy > 0) {
    if (cvrstoNa(S.px + 2, S.py + PH) || cvrstoNa(S.px + PW - 2, S.py + PH)) {
      S.py = Math.floor((S.py + PH) / PLOCICA) * PLOCICA - PH;
      S.pvy = 0;
      S.naZemlji = true;
      S.kombo = 0;
    }
  } else if (S.pvy < 0) {
    const sredina = S.px + PW / 2;
    if (cvrstoNa(S.px + 3, S.py) || cvrstoNa(S.px + PW - 3, S.py)) {
      const ty = Math.floor(S.py / PLOCICA);
      let tx = Math.floor(sredina / PLOCICA);
      if (!cvrsto(polje(tx, ty))) {
        tx = cvrsto(polje(Math.floor((S.px + 3) / PLOCICA), ty))
          ? Math.floor((S.px + 3) / PLOCICA)
          : Math.floor((S.px + PW - 3) / PLOCICA);
      }
      udaracGlavom(tx, ty);
      S.py = (ty + 1) * PLOCICA;
      S.pvy = 1;
    }
  }

  // novčići
  for (let ty = Math.floor(S.py / PLOCICA); ty <= Math.floor((S.py + PH - 1) / PLOCICA); ty++) {
    for (let tx = Math.floor(S.px / PLOCICA); tx <= Math.floor((S.px + PW - 1) / PLOCICA); tx++) {
      if (polje(tx, ty) === 'o') { S.mapa[ty][tx] = ' '; dodajNovcic(); }
    }
  }

  if (S.nepovredivost > 0) S.nepovredivost--;

  if (S.py > S.mapaVisina * PLOCICA) { pogini(); return; }

  // zastavica
  if (S.px + PW >= S.zastavaX + PLOCICA / 2) {
    S.stanje = 'POBEDA';
    S.tajmerStanja = 120;
    const bonus = Math.max(100, Math.floor((S.mapaVisina * PLOCICA - S.py) / PLOCICA) * 200);
    S.poeni += bonus;
    S.efekti.push(noviEfekat(S.px, S.py - 10, '+' + bonus, false));
  }
}

function udaracGlavom(tx, ty) {
  const c = polje(tx, ty);
  if (c === '?') {
    S.mapa[ty][tx] = 'U';
    dodajNovcic();
    S.efekti.push(noviEfekat(tx * PLOCICA + 8, ty * PLOCICA - 24, null, true));
  } else if (c === 'R') {
    S.mapa[ty][tx] = 'U';
    S.cokanji.push(noviCokanj(tx * PLOCICA + 8, ty * PLOCICA));
  } else if (c === 'L') {
    S.mapa[ty][tx] = 'U';
    S.paprike.push(novaPaprika(tx * PLOCICA + 8, ty * PLOCICA));
  } else if (c === 'B' && S.veliki) {         // samo veliki momak razbija cigle
    S.mapa[ty][tx] = ' ';
    S.poeni += 50;
    S.efekti.push(noviEfekat(tx * PLOCICA, ty * PLOCICA, '+50', false));
  }
  for (const n of S.neprijatelji) {
    if (n.ziv && n.spljosten === 0
      && Math.abs((n.y + n.h) - ty * PLOCICA) < 4
      && n.x + n.w > tx * PLOCICA && n.x < (tx + 1) * PLOCICA) {
      pobediNeprijatelja(n, false);
    }
  }
}

function dodajNovcic() {
  S.novcici++;
  S.poeni += 100;
  if (S.novcici >= 100) { S.novcici -= 100; S.zivoti++; }
}

// ---------------- flašica rakije ----------------
function azurirajCokanje() {
  for (let i = 0; i < S.cokanji.length; i++) {
    const c = S.cokanji[i];
    if (c.izlazi) {
      c.y -= 1;
      if (c.y <= c.izlazakDo) { c.izlazi = false; c.vx = 1.6; }
    } else {
      c.vy += GRAVITACIJA;
      if (c.vy > MAX_PAD) c.vy = MAX_PAD;
      c.x += c.vx;
      const ivica = c.vx > 0 ? c.x + c.w : c.x;
      if (cvrstoNa(ivica, c.y + 2) || cvrstoNa(ivica, c.y + c.h - 2)) { c.x -= c.vx; c.vx = -c.vx; }
      c.y += c.vy;
      if (c.vy > 0 && (cvrstoNa(c.x + 2, c.y + c.h) || cvrstoNa(c.x + c.w - 2, c.y + c.h))) {
        c.y = Math.floor((c.y + c.h) / PLOCICA) * PLOCICA - c.h;
        c.vy = 0;
      }
      if (c.y > S.mapaVisina * PLOCICA) { S.cokanji.splice(i, 1); i--; continue; }
    }
    if (S.px < c.x + c.w && S.px + PW > c.x && S.py < c.y + c.h && S.py + S.PH > c.y) {
      S.cokanji.splice(i, 1); i--;
      S.poeni += 1000;
      S.efekti.push(noviEfekat(c.x, c.y - 10, '+1000', false));
      if (!S.veliki) {
        S.veliki = true;
        S.py -= PH_VELIKI - PH_MALI;
        S.PH = PH_VELIKI;
        S.rastTajmer = 36;
      }
    }
  }
}

// ---------------- ljuta paprika i vatrene kuglice ----------------
function azurirajPaprike() {
  for (let i = 0; i < S.paprike.length; i++) {
    const p = S.paprike[i];
    if (p.y > p.izlazakDo) p.y -= 1;                    // polako izlazi i ostaje na kutiji
    if (S.px < p.x + p.w && S.px + PW > p.x && S.py < p.y + p.h && S.py + S.PH > p.y) {
      S.paprike.splice(i, 1); i--;
      S.poeni += 1000;
      S.efekti.push(noviEfekat(p.x, p.y - 10, '+1000', false));
      S.vatra = VATRA_TRAJANJE;                          // veličina ostaje ista, dobija se vatra
      vibriraj(20);
    }
  }
}

function pucaj() {
  if (S.stanje !== 'IGRA' || S.vatra <= 0 || S.rastTajmer > 0) return;
  if (S.kuglice.length >= MAX_KUGLICA) return;
  const smer = S.gledaDesno ? 1 : -1;
  const x = S.gledaDesno ? S.px + PW + 2 : S.px - 2;
  const k = novaKuglica(x, S.py + S.PH * 0.35, smer);
  k.vx += S.pvx * 0.5;
  S.kuglice.push(k);
  S.bacanje = 10;
}

function azurirajVatru() {
  if (S.vatra > 0) S.vatra--;
  if (S.bacanje > 0) S.bacanje--;
  for (let i = 0; i < S.kuglice.length; i++) {
    const k = S.kuglice[i];
    let ukloni = false;
    k.okret += 0.35;
    k.x += k.vx;
    if (cvrstoNa(k.x, k.y)) ukloni = true;               // udarila u zid
    k.vy += 0.5;
    if (k.vy > 9) k.vy = 9;
    k.y += k.vy;
    if (k.vy > 0 && cvrstoNa(k.x, k.y + k.r)) {         // odskok od tla
      k.y = Math.floor((k.y + k.r) / PLOCICA) * PLOCICA - k.r;
      k.vy = -5.2;
    } else if (k.vy < 0 && cvrstoNa(k.x, k.y - k.r)) {
      k.vy = 1;
    }
    if (--k.zivot <= 0 || k.y > S.mapaVisina * PLOCICA || k.x < S.kamera - 20 || k.x > S.kamera + SIRINA + 20) ukloni = true;
    const g = S.glavni;
    if (!ukloni && g && g.hp > 0 && g.aktivan && k.x + k.r > g.x && k.x - k.r < g.x + g.w && k.y + k.r > g.y && k.y - k.r < g.y + g.h) {
      ukloni = true;
      pogodiGlavnogVatrom();
    }
    if (!ukloni) {
      for (const n of S.neprijatelji) {                  // pogodak
        if (!n.ziv || n.spljosten > 0 || !n.aktivan) continue;
        if (k.x + k.r > n.x && k.x - k.r < n.x + n.w && k.y + k.r > n.y && k.y - k.r < n.y + n.h) {
          pobediNeprijatelja(n, false);
          ukloni = true;
          break;
        }
      }
    }
    if (ukloni) {
      S.efekti.push({ x: k.x, y: k.y, vy: 0, zivot: 12, iskra: true });
      S.kuglice.splice(i, 1); i--;
    }
  }
}

// =====================================================================
// GLAVNI CRVENI LJUTKO (kraj 1-4 i 2-4)
// =====================================================================
const GLAVNI_W = 56, GLAVNI_H = 52;
const GLAVNI_BRZINA = 1.3;                     // ista brzina bez obzira na povrede
const VATRE_ZA_TRECINU = 2;                    // 2 pogotka vatrom = 1/3 života
const MAX_BELIH = 3;

function noviGlavni(x, y) {
  return { x, y, w: GLAVNI_W, h: GLAVNI_H, vx: -GLAVNI_BRZINA, vy: 0, hp: 3, naZemlji: false,
           aktivan: false, nepov: 0, pogodaka: 0, pucanje: 90, skok: 170, umire: false, gotov: false };
}

function novaBelaKugla(x, y, smer) {
  return { x, y, vx: 3.3 * smer, vy: -2, r: 7, okret: 0 };
}

function azurirajGlavnog() {
  const g = S.glavni;
  if (!g || g.gotov) return;
  if (g.umire) {                                  // pobeđen: pada naopako sa ekrana
    g.vy += GRAVITACIJA; g.y += g.vy;
    if (g.y > S.mapaVisina * PLOCICA + 60) g.gotov = true;
    return;
  }
  if (!g.aktivan) {
    if (g.x < S.kamera + SIRINA - 40) g.aktivan = true;
    else return;
  }
  if (g.nepov > 0) g.nepov--;

  // hod levo-desno, okreće se na zidu i ivici
  g.vx = Math.sign(g.vx || -1) * GLAVNI_BRZINA;
  g.x += g.vx;
  const ivica = g.vx > 0 ? g.x + g.w : g.x;
  const zid = cvrstoNa(ivica, g.y + 4) || cvrstoNa(ivica, g.y + g.h / 2) || cvrstoNa(ivica, g.y + g.h - 4);
  const litica = g.naZemlji && !cvrstoNa(ivica, g.y + g.h + 4);
  const levaIvicaEkrana = g.vx < 0 && g.x < S.kamera + 140;   // ne beži ispod dugmića levo
  if (zid || litica || levaIvicaEkrana) { g.x -= g.vx; g.vx = -g.vx; }

  // povremeni skok
  if (--g.skok <= 0 && g.naZemlji) { g.vy = -9.5; g.skok = 150 + (g.hp * 20); }
  g.vy += GRAVITACIJA;
  if (g.vy > MAX_PAD) g.vy = MAX_PAD;
  g.y += g.vy;
  g.naZemlji = false;
  if (g.vy > 0 && (cvrstoNa(g.x + 4, g.y + g.h) || cvrstoNa(g.x + g.w - 4, g.y + g.h) || cvrstoNa(g.x + g.w / 2, g.y + g.h))) {
    g.y = Math.floor((g.y + g.h) / PLOCICA) * PLOCICA - g.h;
    g.vy = 0; g.naZemlji = true;
  } else if (g.vy < 0 && (cvrstoNa(g.x + 4, g.y) || cvrstoNa(g.x + g.w - 4, g.y))) {
    g.vy = 0;
  }

  // puca bele kugle prema igraču
  if (--g.pucanje <= 0) {
    g.pucanje = 120 - (3 - g.hp) * 25;
    if (S.beleKugle.length < MAX_BELIH) {
      const smer = (S.px + PW / 2) < (g.x + g.w / 2) ? -1 : 1;
      S.beleKugle.push(novaBelaKugla(smer > 0 ? g.x + g.w + 4 : g.x - 4, g.y + g.h * 0.55, smer));
    }
  }

  // dodir sa igračem
  if (S.stanje === 'IGRA' && S.px < g.x + g.w && S.px + PW > g.x && S.py < g.y + g.h && S.py + S.PH > g.y) {
    const odozgo = S.pvy > 0 && (S.py + S.PH - S.pvy) <= g.y + 12;
    if (odozgo && g.nepov === 0) {
      S.pvy = S.skokDrzi ? -12.5 : -9.5;
      S.py = g.y - S.PH;
      povrediGlavnog();
    } else if (g.nepov === 0) {
      povredi();
    }
  }
}

function povrediGlavnog() {                       // gaženje: skida 1/3 života
  const g = S.glavni;
  g.hp--;
  g.nepov = 50;
  vibriraj(30);
  if (g.hp <= 0) pobediGlavnog();
  else { S.poeni += 1000; S.efekti.push(noviEfekat(g.x + 10, g.y - 30, '+1000', false)); }
}

function pogodiGlavnogVatrom() {                  // vatra: svaka 2 pogotka skidaju 1/3 života
  const g = S.glavni;
  if (g.nepov > 0) return;
  g.pogodaka++;
  S.poeni += 200;
  S.efekti.push(noviEfekat(g.x + 16, g.y - 30, '+200', false));
  if (g.pogodaka >= VATRE_ZA_TRECINU) {
    g.pogodaka = 0;
    povrediGlavnog();
  }
}

function pobediGlavnog() {
  const g = S.glavni;
  g.hp = 0; g.umire = true; g.vy = -8;
  S.poeni += 5000;
  S.efekti.push(noviEfekat(g.x + 4, g.y - 30, '+5000', false));
  for (const k of S.beleKugle) S.efekti.push({ x: k.x, y: k.y, vy: 0, zivot: 12, iskra: true, bela: true });
  S.beleKugle = [];
  for (let y = 0; y < S.mapaVisina; y++)          // rešetka se otvara
    for (let x = 0; x < S.mapaSirina; x++) if (S.mapa[y][x] === 'Z') S.mapa[y][x] = ' ';
  vibriraj(120);
}

function azurirajBeleKugle() {
  for (let i = 0; i < S.beleKugle.length; i++) {
    const k = S.beleKugle[i];
    let ukloni = false;
    k.okret += 0.2;
    k.x += k.vx;
    if (cvrstoNa(k.x + Math.sign(k.vx) * k.r, k.y)) ukloni = true;
    k.vy += 0.45;
    k.y += k.vy;
    if (k.vy > 0 && cvrstoNa(k.x, k.y + k.r)) {    // nisko odskakuje - može da se preskoči
      k.y = Math.floor((k.y + k.r) / PLOCICA) * PLOCICA - k.r;
      k.vy = -4.2;
    }
    if (k.y > S.mapaVisina * PLOCICA || k.x < S.kamera - 30 || k.x > S.kamera + SIRINA + 30) ukloni = true;
    // vatrena kuglica gasi belu kuglu
    if (!ukloni) {
      for (let j = 0; j < S.kuglice.length; j++) {
        const f = S.kuglice[j];
        if (Math.hypot(f.x - k.x, f.y - k.y) < f.r + k.r + 2) {
          S.kuglice.splice(j, 1);
          S.efekti.push({ x: f.x, y: f.y, vy: 0, zivot: 12, iskra: true });
          S.poeni += 200;
          S.efekti.push(noviEfekat(k.x - 10, k.y - 14, '+200', false));
          ukloni = true;
          break;
        }
      }
    }
    // pogodak u igrača = gubi život
    if (!ukloni && S.stanje === 'IGRA' && S.nepovredivost === 0) {
      const najx = Math.max(S.px, Math.min(k.x, S.px + PW)), najy = Math.max(S.py, Math.min(k.y, S.py + S.PH));
      if (Math.hypot(najx - k.x, najy - k.y) < k.r - 1) {
        ukloni = true;
        pogini();
      }
    }
    if (ukloni) {
      S.efekti.push({ x: k.x, y: k.y, vy: 0, zivot: 12, iskra: true, bela: true });
      S.beleKugle.splice(i, 1); i--;
    }
  }
}

function povredi() {
  if (S.nepovredivost > 0) return;
  if (S.veliki) {
    S.veliki = false;
    S.py += PH_VELIKI - PH_MALI;
    S.PH = PH_MALI;
    S.nepovredivost = 120;
    S.rastTajmer = 30;
  } else {
    pogini();
  }
}

function pogini() {
  if (S.stanje !== 'IGRA') return;
  S.zivoti--;
  S.stanje = 'POGINUO';
  S.tajmerStanja = 120;
  S.pvy = -10;
  S.pvx = 0;
  vibriraj(80);
}

// ---------------- ljutci ----------------
function azurirajNeprijatelje() {
  const lista = S.neprijatelji;
  for (let i = 0; i < lista.length; i++) {
    const n = lista[i];
    if (!n.aktivan) {
      if (n.x < S.kamera + SIRINA + PLOCICA * 2) n.aktivan = true;
      else continue;
    }
    if (n.spljosten > 0) {
      if (--n.spljosten === 0) { lista.splice(i, 1); i--; }
      continue;
    }
    if (!n.ziv) {
      n.vy += GRAVITACIJA;
      n.y += n.vy;
      if (n.y > S.mapaVisina * PLOCICA) { lista.splice(i, 1); i--; }
      continue;
    }

    n.vy += GRAVITACIJA;
    if (n.vy > MAX_PAD) n.vy = MAX_PAD;

    n.x += n.vx;
    const prednjaIvica = n.vx > 0 ? n.x + n.w : n.x;
    const zid = cvrstoNa(prednjaIvica, n.y + 2) || cvrstoNa(prednjaIvica, n.y + n.h - 2);
    const litica = n.naZemlji && !cvrstoNa(prednjaIvica, n.y + n.h + 4);   // na ivici se okreće
    if (zid || litica) { n.x -= n.vx; n.vx = -n.vx; }

    n.y += n.vy;
    n.naZemlji = false;
    if (n.vy > 0 && (cvrstoNa(n.x + 2, n.y + n.h) || cvrstoNa(n.x + n.w - 2, n.y + n.h))) {
      n.y = Math.floor((n.y + n.h) / PLOCICA) * PLOCICA - n.h;
      n.vy = 0;
      n.naZemlji = true;
    }
    if (n.y > S.mapaVisina * PLOCICA) { lista.splice(i, 1); i--; continue; }

    if (S.stanje === 'IGRA' && S.px < n.x + n.w && S.px + PW > n.x && S.py < n.y + n.h && S.py + S.PH > n.y) {
      const odozgo = S.pvy > 0 && (S.py + S.PH - S.pvy) <= n.y + 6;
      if (odozgo) {
        pobediNeprijatelja(n, true);
        S.pvy = S.skokDrzi ? SKOK_BRZINA * 0.9 : -7;
        S.py = n.y - S.PH;
      } else {
        povredi();
      }
    }
  }
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const a = lista[i], b = lista[j];
      if (!a.ziv || !b.ziv || a.spljosten > 0 || b.spljosten > 0 || !a.aktivan || !b.aktivan) continue;
      if (a.x < b.x + b.w && a.x + a.w > b.x && Math.abs(a.y - b.y) < a.h) {
        if (a.x < b.x) { a.vx = -NEPRIJATELJ_BRZINA; b.vx = NEPRIJATELJ_BRZINA; }
        else { a.vx = NEPRIJATELJ_BRZINA; b.vx = -NEPRIJATELJ_BRZINA; }
      }
    }
  }
}

function pobediNeprijatelja(n, zgazen) {
  S.kombo++;
  const vrednost = 100 * Math.min(8, 1 << (S.kombo - 1));
  S.poeni += vrednost;
  S.efekti.push(noviEfekat(n.x, n.y - 10, '+' + vrednost, false));
  if (zgazen) { n.spljosten = 30; vibriraj(15); }
  else { n.ziv = false; n.vy = -6; }
}

function azurirajEfekte() {
  for (let i = 0; i < S.efekti.length; i++) {
    const ef = S.efekti[i];
    ef.y += ef.vy;
    if (ef.novcic) ef.vy += 0.4;
    if (--ef.zivot <= 0) { S.efekti.splice(i, 1); i--; }
  }
}

function azurirajVreme() {
  if (S.stanje !== 'IGRA') return;
  if (++S.vremeBrojac >= 40) {
    S.vremeBrojac = 0;
    S.vreme--;
    if (S.vreme <= 0) { S.vreme = 0; pogini(); }
  }
}

function azurirajKameru() {
  const cilj = S.px + PW / 2 - SIRINA * 0.4;
  if (cilj > S.kamera) S.kamera = cilj;
  S.kamera = Math.max(0, Math.min(S.kamera, S.mapaSirina * PLOCICA - SIRINA));
  if (S.px < S.kamera) { S.px = S.kamera; if (S.pvx < 0) S.pvx = 0; }
}

function vibriraj(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { }
}

// =====================================================================
// CRTANJE
// =====================================================================
const platno = document.getElementById('platno');
const ctx = platno.getContext('2d');
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const DODIR = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

function rgb(r, g, b, a) { return a === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a / 255})`; }
function tamnije(c) {        // isto kao Java Color.darker()
  const m = c.match(/\d+/g).map(Number);
  return rgb(Math.floor(m[0] * 0.7), Math.floor(m[1] * 0.7), Math.floor(m[2] * 0.7));
}
function elipsa(x, y, w, h) { const p = new Path2D(); p.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); return p; }
function zaobljen(x, y, w, h, r) {
  const p = new Path2D();
  r = Math.min(r, w / 2, h / 2);
  p.moveTo(x + r, y);
  p.arcTo(x + w, y, x + w, y + h, r);
  p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r);
  p.arcTo(x, y, x + w, y, r);
  p.closePath();
  return p;
}
function linija(x1, y1, x2, y2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }

function nacrtaj() {
  // nebo
  const pecina = svet() === 2;
  const nebo = ctx.createLinearGradient(0, 0, 0, VISINA);
  if (pecina) { nebo.addColorStop(0, rgb(14, 12, 22)); nebo.addColorStop(1, rgb(44, 34, 52)); }
  else { nebo.addColorStop(0, rgb(92, 148, 252)); nebo.addColorStop(1, rgb(170, 210, 255)); }
  ctx.fillStyle = nebo;
  ctx.fillRect(0, 0, SIRINA, VISINA);

  const kx = Math.round(S.kamera);
  if (pecina) nacrtajPozadinuPecine(kx); else nacrtajOblake(kx);
  for (const c of S.cokanji) nacrtajCokanj(c.x - kx, c.y);
  for (const p of S.paprike) nacrtajPapriku(p.x - kx, p.y);
  nacrtajMapu(kx);
  nacrtajZastavu(kx);
  for (const n of S.neprijatelji) nacrtajNeprijatelja(n, kx);
  if (S.glavni && !S.glavni.gotov) nacrtajGlavnog(S.glavni, kx);
  for (const k of S.beleKugle) nacrtajBeluKuglu(k.x - kx, k.y, k.r, k.okret);
  for (const k of S.kuglice) nacrtajKuglicu(k.x - kx, k.y, k.r, k.okret);
  nacrtajEfekte(kx);
  if (S.stanje !== 'NASLOVNA' && S.stanje !== 'KRAJ_IGRE' && S.stanje !== 'SVET_ZAVRSEN') nacrtajIgraca(kx);
  if (S.stanje !== 'NASLOVNA') nacrtajHUD();
  nacrtajPoruke();
}

// pećina: daleki stalaktiti, stene i svetlucavi kristali (pomeraju se sporije od nivoa)
function nacrtajPozadinuPecine(kx) {
  const duzina = 12 * 300;
  for (let i = 0; i < 12; i++) {
    const x = Math.floor((((i * 300 - kx * 0.4) % duzina) + duzina) % duzina) - 150;
    const v = 60 + (i * 53) % 110;
    ctx.fillStyle = rgb(30, 25, 40);
    ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x + 26, 60 + v); ctx.lineTo(x + 52, 60); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 90, 60); ctx.lineTo(x + 104, 60 + v * 0.5); ctx.lineTo(x + 118, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgb(36, 30, 46);
    const h = 70 + (i * 37) % 90;
    ctx.beginPath(); ctx.moveTo(x + 140, 420); ctx.lineTo(x + 175, 420 - h); ctx.lineTo(x + 210, 420); ctx.closePath(); ctx.fill();
    const sjaj = 0.45 + 0.35 * Math.sin(S.animBrojac * 0.05 + i);
    ctx.fillStyle = i % 2 ? `rgba(120,200,255,${sjaj})` : `rgba(200,120,255,${sjaj})`;
    const kx2 = x + 60, ky2 = 150 + (i * 71) % 180;
    ctx.beginPath(); ctx.moveTo(kx2, ky2 - 7); ctx.lineTo(kx2 + 4, ky2); ctx.lineTo(kx2, ky2 + 7); ctx.lineTo(kx2 - 4, ky2); ctx.closePath(); ctx.fill();
  }
}

function nacrtajOblake(kx) {
  ctx.fillStyle = rgb(255, 255, 255, 210);
  const duzina = 14 * 360;
  for (let i = 0; i < 14; i++) {
    const x = Math.floor((((i * 360 - kx * 0.5) % duzina) + duzina) % duzina) - 150;
    const y = 50 + (i * 37) % 90;
    ctx.fill(elipsa(x, y, 70, 30));
    ctx.fill(elipsa(x + 25, y - 14, 60, 36));
    ctx.fill(elipsa(x + 55, y, 60, 28));
  }
}

function nacrtajMapu(kx) {
  const prvi = Math.floor(kx / PLOCICA), poslednji = Math.floor((kx + SIRINA) / PLOCICA) + 1;
  const pecina = svet() === 2;
  ctx.lineWidth = 1;
  for (let y = 0; y < S.mapaVisina; y++) {
    for (let x = Math.max(0, prvi); x <= poslednji && x < S.mapaSirina; x++) {
      const c = S.mapa[y][x];
      const sx = x * PLOCICA - kx, sy = y * PLOCICA;
      switch (c) {
        case '#': {
          const vrh = y === 0 || S.mapa[y - 1][x] !== '#';
          if (pecina) {                                  // tamni kamen
            ctx.fillStyle = (x + y) % 2 ? rgb(78, 70, 90) : rgb(72, 64, 84); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
            ctx.strokeStyle = rgb(48, 42, 58); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
            ctx.fillStyle = rgb(95, 86, 108); ctx.fillRect(sx + 4 + (x * 7) % 14, sy + 6 + (y * 5) % 14, 6, 3);
            if (vrh && y > 1) { ctx.fillStyle = rgb(110, 100, 125); ctx.fillRect(sx, sy, PLOCICA, 5); }
          } else {
            ctx.fillStyle = rgb(150, 90, 50); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
            ctx.strokeStyle = rgb(120, 70, 40); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
            if (vrh) { ctx.fillStyle = rgb(70, 180, 70); ctx.fillRect(sx, sy, PLOCICA, 8); }
          }
          break;
        }
        case 'Z':                                        // gvozdena rešetka do zastavice
          ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + 4, sy, 24, PLOCICA);
          ctx.fillStyle = rgb(70, 72, 80);
          for (let b = 0; b < 4; b++) ctx.fillRect(sx + 5 + b * 7, sy, 3, PLOCICA);
          ctx.fillStyle = rgb(110, 112, 122); ctx.fillRect(sx + 3, sy + 13, 26, 4);
          break;
        case 'B':
          ctx.fillStyle = pecina ? rgb(70, 95, 145) : rgb(190, 95, 50); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
          ctx.strokeStyle = pecina ? rgb(30, 40, 70) : rgb(90, 40, 20); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
          linija(sx, sy + 16.5, sx + 32, sy + 16.5);
          linija(sx + 16.5, sy, sx + 16.5, sy + 16);
          linija(sx + 8.5, sy + 16, sx + 8.5, sy + 32);
          linija(sx + 24.5, sy + 16, sx + 24.5, sy + 32);
          break;
        case '?':
        case 'R':
        case 'L': {
          const puls = Math.trunc(Math.sin(S.animBrojac * 0.1) * 25);
          ctx.fillStyle = rgb(240, 180 + Math.trunc(puls / 2), 40); ctx.fill(zaobljen(sx, sy, PLOCICA, PLOCICA, 3));
          ctx.strokeStyle = rgb(140, 80, 20); ctx.stroke(zaobljen(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1, 3));
          ctx.fillStyle = '#fff'; ctx.font = `bold 22px ${FONT}`; ctx.textAlign = 'center';
          ctx.fillText('?', sx + 16, sy + 24); ctx.textAlign = 'left';
          break;
        }
        case 'U':
          ctx.fillStyle = rgb(150, 110, 80); ctx.fill(zaobljen(sx, sy, PLOCICA, PLOCICA, 3));
          ctx.strokeStyle = rgb(90, 60, 40); ctx.stroke(zaobljen(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1, 3));
          break;
        case '=':
          ctx.fillStyle = rgb(120, 120, 135); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
          ctx.fillStyle = rgb(160, 160, 175); ctx.fillRect(sx + 3, sy + 3, PLOCICA - 6, 4);
          ctx.strokeStyle = rgb(70, 70, 85); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
          break;
        case 'o':
          nacrtajNovcic(sx + 8, sy + 4);
          break;
      }
    }
  }
}

function nacrtajNovcic(x, y) {
  const faza = Math.abs(Math.sin(S.animBrojac * 0.08));
  const w = Math.trunc(6 + 10 * faza);
  const e = elipsa(x + Math.trunc((16 - w) / 2), y, w, 24);
  ctx.fillStyle = rgb(255, 210, 40); ctx.fill(e);
  ctx.strokeStyle = rgb(200, 140, 0); ctx.lineWidth = 1; ctx.stroke(e);
}

// flašica rakije: crni zatvarač, plava traka, kruškasto telo, zlatna šljivovica
function nacrtajCokanj(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const flasa = new Path2D();
  flasa.moveTo(5.2, 12);
  flasa.lineTo(5.0, 16.5);
  flasa.bezierCurveTo(4.6, 20, 0.6, 22, 0.6, 26.6);
  flasa.quadraticCurveTo(0.6, 29.6, 3.5, 29.6);
  flasa.lineTo(12.5, 29.6);
  flasa.quadraticCurveTo(15.4, 29.6, 15.4, 26.6);
  flasa.bezierCurveTo(15.4, 22, 11.4, 20, 11.0, 16.5);
  flasa.lineTo(10.8, 12);
  flasa.closePath();
  ctx.fillStyle = rgb(235, 240, 245, 150); ctx.fill(flasa);

  ctx.save();
  ctx.clip(flasa);
  const rak = ctx.createLinearGradient(0, 17, 0, 30);
  rak.addColorStop(0, rgb(240, 175, 70)); rak.addColorStop(1, rgb(205, 120, 35));
  ctx.fillStyle = rak; ctx.fillRect(0, 17.2, 16, 13);
  ctx.fillStyle = rgb(255, 215, 130); ctx.fillRect(0, 17.2, 16, 0.9);
  ctx.restore();

  ctx.fillStyle = rgb(40, 38, 40); ctx.fill(elipsa(5.4, 21.4, 6.4, 6.4));
  ctx.fillStyle = rgb(110, 60, 140); ctx.fill(elipsa(7.1, 23.6, 3.2, 3.4));
  ctx.fillStyle = rgb(90, 170, 80); ctx.fill(elipsa(8.6, 22.4, 2.2, 1.4));

  ctx.strokeStyle = rgb(255, 255, 255, 190);
  ctx.beginPath(); ctx.moveTo(3.2, 21.5); ctx.quadraticCurveTo(2, 24, 2.4, 27.2); ctx.stroke();
  ctx.strokeStyle = rgb(90, 90, 100); ctx.stroke(flasa);

  const cep = zaobljen(4.6, 0, 6.8, 13, 1.2);
  ctx.fillStyle = rgb(28, 28, 32); ctx.fill(cep);
  ctx.strokeStyle = rgb(85, 85, 95); linija(6, 1.6, 6, 10.5);
  ctx.fillStyle = rgb(50, 110, 200); ctx.fillRect(4.8, 11.2, 6.4, 1.6);
  ctx.strokeStyle = rgb(15, 15, 20); ctx.stroke(cep);
  ctx.restore();
}

// ljuta paprika: crvena, povijena, sa zelenom peteljkom
function nacrtajPapriku(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const telo = new Path2D();
  telo.moveTo(3, 7);
  telo.quadraticCurveTo(3, 4.4, 8, 4.6);
  telo.quadraticCurveTo(13.6, 4.8, 13.2, 9);
  telo.bezierCurveTo(13, 16, 11.6, 22.5, 7.4, 25.8);
  telo.quadraticCurveTo(5.6, 24.4, 6, 21.4);
  telo.bezierCurveTo(5.6, 16.5, 3.2, 12.6, 3, 7);
  telo.closePath();
  const g = ctx.createLinearGradient(3, 0, 13, 0);
  g.addColorStop(0, rgb(235, 45, 35)); g.addColorStop(1, rgb(170, 20, 25));
  ctx.fillStyle = g; ctx.fill(telo);
  ctx.strokeStyle = rgb(255, 170, 150);
  ctx.beginPath(); ctx.moveTo(5.2, 8); ctx.bezierCurveTo(5.4, 12, 6.6, 15, 7.6, 18); ctx.stroke();
  ctx.strokeStyle = rgb(110, 15, 20); ctx.stroke(telo);
  // zelena čašica i peteljka
  ctx.fillStyle = rgb(60, 150, 60);
  ctx.fill(zaobljen(3.2, 3.4, 9.8, 3, 1.4));
  ctx.strokeStyle = rgb(30, 90, 35); ctx.stroke(zaobljen(3.2, 3.4, 9.8, 3, 1.4));
  ctx.strokeStyle = rgb(60, 150, 60); ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(8, 3.6); ctx.quadraticCurveTo(8.4, 0.8, 11, 0.4); ctx.stroke();
  ctx.restore();
}

function nacrtajKuglicu(x, y, r, okret) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(0, 0, 0.5, 0, 0, r + 2);
  g.addColorStop(0, rgb(255, 250, 200)); g.addColorStop(0.45, rgb(255, 190, 40));
  g.addColorStop(0.8, rgb(240, 80, 20)); g.addColorStop(1, 'rgba(200,30,10,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r + 2, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(okret);                                     // plamičci koji se vrte
  ctx.fillStyle = rgb(255, 120, 30);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(r - 1, -2); ctx.lineTo(r + 3.5, 0); ctx.lineTo(r - 1, 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function nacrtajZastavu(kx) {
  const x = Math.trunc(S.zastavaX) - kx + PLOCICA / 2;
  const dno = (S.mapaVisina - 2) * PLOCICA;
  const vrh = dno - (svet() === 2 ? 8 : 9) * PLOCICA;
  ctx.fillStyle = rgb(230, 230, 230); ctx.fillRect(x - 2, vrh, 4, dno - vrh);
  ctx.fillStyle = rgb(40, 160, 60); ctx.fill(elipsa(x - 6, vrh - 10, 12, 12));
  ctx.fillStyle = rgb(230, 50, 50);
  ctx.beginPath(); ctx.moveTo(x + 2, vrh + 6); ctx.lineTo(x + 40, vrh + 20); ctx.lineTo(x + 2, vrh + 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgb(100, 100, 100); ctx.fillRect(x - 12, dno - 16, 24, 16);
}

function nacrtajIgraca(kx) {
  if (S.nepovredivost > 0 && Math.floor(S.animBrojac / 4) % 2 === 0) return;
  let poza;
  if (S.stanje === 'POGINUO') poza = 3;
  else if (!S.naZemlji) poza = 2;
  else if (Math.abs(S.pvx) > 0.3) poza = 1;
  else poza = 0;
  let razmera = S.veliki ? RAZMERA_VELIKI : 1.0;
  if (S.rastTajmer > 0 && Math.floor(S.rastTajmer / 4) % 2 === 0) razmera = S.veliki ? 1.0 : RAZMERA_VELIKI;
  const x = S.px - kx - (24 * razmera - PW) / 2;
  const y = S.py + S.PH - 38 * razmera;
  if (S.vatra > 0) {                                       // vatrena aura dok traje paprika
    const pred_kraj = S.vatra < 120;
    if (!pred_kraj || Math.floor(S.animBrojac / 5) % 2 === 0) {
      const cx = S.px - kx + PW / 2, cy = S.py + S.PH / 2;
      const r = S.PH * 0.75 + Math.sin(S.animBrojac * 0.25) * 2;
      const g = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
      g.addColorStop(0, 'rgba(255,160,40,0.35)'); g.addColorStop(1, 'rgba(255,60,20,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  likBaca = S.bacanje > 0 && poza !== 3;
  nacrtajLik(x, y, razmera, S.gledaDesno, S.predjeno * 0.18 / razmera, poza);
  likBaca = false;
}

// =====================================================================
// LIK: momak u srpskoj narodnoj nošnji (okvir 24 x 38, gleda udesno)
// poza: 0 stoji, 1 hoda, 2 skače, 3 pogođen
// =====================================================================
const SAJKACA = rgb(98, 102, 108), SAJKACA_TAMNA = rgb(66, 70, 76);
const KOZA = rgb(245, 203, 165), KOZA_SENKA = rgb(222, 172, 135);
const KOSA = rgb(78, 50, 30);
const KOSULJA = rgb(250, 250, 252), KOSULJA_SENKA = rgb(214, 220, 232);
const VEZ = rgb(55, 105, 200), VEZ_CRVENI = rgb(200, 45, 50);
const JELEK = rgb(30, 40, 92), JELEK_SVETLO = rgb(52, 66, 135);
const TKANICA = rgb(185, 35, 45), TKANICA_PLAVA = rgb(45, 80, 170);
const CAKSIRE = rgb(92, 94, 90), CAKSIRE_TAMNE = rgb(66, 68, 64);
const CARAPA = rgb(28, 28, 30), SARA = rgb(225, 70, 55), SARA2 = rgb(240, 200, 60);
const OPANAK = rgb(210, 170, 120), OPANAK_TAMNI = rgb(150, 108, 66);
const OBRIS = rgb(35, 30, 35);

function nacrtajLik(x, y, razmera, desno, faza, poza, koji) {
  if ((koji || S.lik) === 'Z') nacrtajDevojku(x, y, razmera, desno, faza, poza);
  else nacrtajMomka(x, y, razmera, desno, faza, poza);
}

let likBaca = false;           // ruka ispružena napred dok baca kuglicu
function uglovi(poza, faza) {
  const u = osnovniUglovi(poza, faza);
  if (likBaca) u.rukaPrednja = 80;
  return u;
}
function osnovniUglovi(poza, faza) {
  let nogaPrednja = 0, nogaZadnja = 0, rukaPrednja = 0, rukaZadnja = 0, odskok = 0;
  if (poza === 1) {
    const s = Math.sin(faza);
    nogaPrednja = 32 * s; nogaZadnja = -32 * s;
    rukaPrednja = -28 * s; rukaZadnja = 28 * s;
    odskok = -Math.abs(Math.cos(faza)) * 1.2;
  } else if (poza === 2) {
    nogaPrednja = 40; nogaZadnja = -25; rukaPrednja = 105; rukaZadnja = -45;
  } else if (poza === 3) {
    nogaPrednja = 15; nogaZadnja = -15; rukaPrednja = 140; rukaZadnja = -140;
  } else {
    odskok = Math.sin(S.animBrojac * 0.06) * 0.4;
  }
  return { nogaPrednja, nogaZadnja, rukaPrednja, rukaZadnja, odskok };
}

function nacrtajMomka(x, y, razmera, desno, faza, poza) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(razmera, razmera);
  if (!desno) { ctx.translate(24, 0); ctx.scale(-1, 1); }
  ctx.lineWidth = 0.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  const { nogaPrednja, nogaZadnja, rukaPrednja, rukaZadnja, odskok } = uglovi(poza, faza);
  ctx.translate(0, odskok);

  nacrtajRuku(9, 17, rukaZadnja, true);
  nacrtajNogu(10, 26, nogaZadnja, true);

  // rese tkanice
  ctx.fillStyle = SARA2; ctx.fillRect(4.2, 25, 1.3, 6.5);
  ctx.fillStyle = SARA; ctx.fillRect(5.4, 25, 1.3, 7.2);
  ctx.fillStyle = rgb(60, 150, 80); ctx.fillRect(6.6, 25, 1.2, 6.2);

  // čakšire
  const cak = new Path2D();
  cak.moveTo(6.5, 24.5); cak.lineTo(18, 24.5);
  cak.quadraticCurveTo(19.8, 27.5, 17.5, 30); cak.lineTo(7, 30);
  cak.quadraticCurveTo(4.8, 27.5, 6.5, 24.5); cak.closePath();
  ctx.fillStyle = CAKSIRE; ctx.fill(cak);
  ctx.strokeStyle = CAKSIRE_TAMNE; linija(12.3, 26, 12.3, 29.5);
  ctx.strokeStyle = OBRIS; ctx.stroke(cak);

  nacrtajNogu(14.5, 26, nogaPrednja, false);

  // košulja i jelek
  const telo = zaobljen(6.5, 14.5, 11.5, 11, 2);
  ctx.fillStyle = KOSULJA; ctx.fill(telo);
  const jelekZ = new Path2D();
  jelekZ.moveTo(6.5, 16); jelekZ.quadraticCurveTo(7, 14.5, 9, 14.6); jelekZ.lineTo(11, 15);
  jelekZ.lineTo(10.6, 24); jelekZ.lineTo(6.5, 24); jelekZ.closePath();
  const jelekP = new Path2D();
  jelekP.moveTo(18, 16); jelekP.quadraticCurveTo(17.5, 14.5, 15.5, 14.6); jelekP.lineTo(14.2, 15);
  jelekP.lineTo(14.8, 24); jelekP.lineTo(18, 24); jelekP.closePath();
  ctx.fillStyle = JELEK; ctx.fill(jelekZ); ctx.fill(jelekP);
  ctx.strokeStyle = JELEK_SVETLO;
  linija(10.2, 16, 9.9, 23.5);
  linija(15, 16, 15.3, 23.5);
  for (let i = 0; i < 4; i++) {          // vez na košulji
    const vy = 16.3 + i * 1.9;
    ctx.fillStyle = i % 2 === 0 ? VEZ : VEZ_CRVENI;
    ctx.beginPath();
    ctx.moveTo(12.6, vy - 0.8); ctx.lineTo(13.4, vy); ctx.lineTo(12.6, vy + 0.8); ctx.lineTo(11.8, vy);
    ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = OBRIS; ctx.stroke(telo); ctx.stroke(jelekZ); ctx.stroke(jelekP);

  // tkanica
  const pojas = zaobljen(6, 22.6, 12.6, 3, 0.75);
  ctx.fillStyle = TKANICA; ctx.fill(pojas);
  ctx.fillStyle = TKANICA_PLAVA; ctx.fillRect(6.3, 23.6, 12, 0.9);
  ctx.fillStyle = SARA2;
  for (let p = 7.2; p < 18; p += 2.4) ctx.fill(elipsa(p, 23.7, 0.8, 0.7));
  ctx.strokeStyle = OBRIS; ctx.stroke(pojas);

  // vrat i glava
  ctx.fillStyle = KOZA_SENKA; ctx.fillRect(11, 12.5, 3.5, 2.5);
  const lice = elipsa(7, 3.6, 12, 10.6);
  ctx.fillStyle = KOZA; ctx.fill(lice);
  const kosa = new Path2D();
  kosa.moveTo(7.2, 6); kosa.quadraticCurveTo(6.6, 10.5, 9, 12.2); kosa.quadraticCurveTo(9.6, 9, 11, 6.5); kosa.closePath();
  ctx.fillStyle = KOSA; ctx.fill(kosa);
  ctx.fillStyle = KOZA_SENKA; ctx.fill(elipsa(10.2, 8, 2.4, 3));       // uho
  ctx.fillStyle = KOZA; ctx.fill(elipsa(17.4, 8.6, 2.4, 2.2));         // nos
  ctx.strokeStyle = OBRIS; ctx.stroke(lice);
  ctx.fillStyle = KOZA; ctx.fill(elipsa(16.8, 8.7, 2.4, 2));
  ctx.fillStyle = '#fff'; ctx.fill(elipsa(14.6, 7.2, 2.6, 2.6));       // oko
  ctx.fillStyle = rgb(60, 40, 25); ctx.fill(elipsa(15.6, 7.7, 1.6, 1.8));
  ctx.strokeStyle = KOSA; linija(14.4, 6.4, 17, 6.1);                   // obrva
  ctx.strokeStyle = rgb(170, 70, 60);                                   // osmeh
  ctx.beginPath(); ctx.ellipse(16.2, 10.9, 1.8, 1.3, 0, Math.PI * 160 / 180, Math.PI * 40 / 180, true); ctx.stroke();

  // šajkača
  const kapa = new Path2D();
  kapa.moveTo(6.4, 6.6);
  kapa.lineTo(6.2, 2.6);
  kapa.quadraticCurveTo(8.5, 1.2, 11.2, 2.4);
  kapa.quadraticCurveTo(12.8, 3.4, 14.4, 2.3);
  kapa.quadraticCurveTo(17.2, 0.6, 19.6, 2.2);
  kapa.lineTo(19.6, 6.6);
  kapa.quadraticCurveTo(13, 7.6, 6.4, 6.6);
  kapa.closePath();
  ctx.fillStyle = SAJKACA; ctx.fill(kapa);
  ctx.fillStyle = SAJKACA_TAMNA; ctx.fillRect(6.3, 5, 13.3, 1.6);
  ctx.strokeStyle = SAJKACA_TAMNA;
  ctx.beginPath(); ctx.moveTo(12.6, 3.2); ctx.quadraticCurveTo(12.4, 4.2, 12.8, 5); ctx.stroke();
  ctx.strokeStyle = rgb(140, 145, 150);
  ctx.beginPath(); ctx.moveTo(7, 3); ctx.quadraticCurveTo(9, 2.1, 10.8, 3); ctx.stroke();
  ctx.strokeStyle = OBRIS; ctx.stroke(kapa);

  nacrtajRuku(15.5, 17, rukaPrednja, false);
  ctx.restore();
}

function nacrtajNogu(kukX, kukY, ugao, zadnja) {
  ctx.save();
  ctx.translate(kukX, kukY);
  ctx.rotate(-ugao * Math.PI / 180);
  const gornji = new Path2D();
  gornji.moveTo(-2.6, 0); gornji.lineTo(2.6, 0); gornji.lineTo(2, 5.5); gornji.lineTo(-2, 5.5); gornji.closePath();
  ctx.fillStyle = zadnja ? CAKSIRE_TAMNE : CAKSIRE; ctx.fill(gornji);
  ctx.strokeStyle = OBRIS; ctx.stroke(gornji);
  const carapa = zaobljen(-2, 5.3, 4, 5.4, 0.5);
  ctx.fillStyle = CARAPA; ctx.fill(carapa);
  ctx.fillStyle = zadnja ? tamnije(SARA) : SARA; ctx.fillRect(-1.6, 6.6, 3.2, 0.8);
  ctx.fillStyle = zadnja ? tamnije(SARA2) : SARA2;
  for (let sx = -1.2; sx < 1.6; sx += 1.2) ctx.fill(elipsa(sx, 8, 0.7, 0.7));
  ctx.strokeStyle = OBRIS; ctx.stroke(carapa);
  const opanak = new Path2D();
  opanak.moveTo(-2.4, 10.2);
  opanak.lineTo(3, 10.2);
  opanak.quadraticCurveTo(4.8, 10.4, 5.2, 9.2);       // kljun
  opanak.quadraticCurveTo(5.6, 11.4, 3.8, 12);
  opanak.lineTo(-2.4, 12);
  opanak.closePath();
  ctx.fillStyle = zadnja ? OPANAK_TAMNI : OPANAK; ctx.fill(opanak);
  ctx.strokeStyle = OPANAK_TAMNI; linija(-1.6, 10.6, 3, 10.6);
  ctx.strokeStyle = OBRIS; ctx.stroke(opanak);
  ctx.restore();
}

function nacrtajRuku(ramX, ramY, ugao, zadnja) {
  ctx.save();
  ctx.translate(ramX, ramY);
  ctx.rotate(-ugao * Math.PI / 180);
  const rukav = zaobljen(-1.7, -0.5, 3.4, 7.4, 1.2);
  ctx.fillStyle = zadnja ? KOSULJA_SENKA : KOSULJA; ctx.fill(rukav);
  ctx.fillStyle = VEZ; ctx.fillRect(-1.5, 5.4, 3, 0.8);
  ctx.strokeStyle = OBRIS; ctx.stroke(rukav);
  const saka = elipsa(-1.6, 6.6, 3.2, 3);
  ctx.fillStyle = zadnja ? KOZA_SENKA : KOZA; ctx.fill(saka);
  ctx.strokeStyle = OBRIS; ctx.stroke(saka);
  ctx.restore();
}

// =====================================================================
// DEVOJKA u srpskoj narodnoj nošnji (isti okvir 24 x 38, iste poze kao momak)
// =====================================================================
const KOSA_Z = rgb(58, 34, 22), KOSA_Z_SVETLA = rgb(92, 58, 38);
const JELEK_Z = rgb(22, 22, 26), ZLATO = rgb(222, 178, 62), ZLATO_TAMNO = rgb(150, 110, 30);
const SUKNJA = rgb(180, 30, 42), SUKNJA_ZELENA = rgb(40, 120, 70), SUKNJA_TAMNA = rgb(40, 20, 30);
const PREGACA = rgb(24, 24, 30), POJAS_Z = rgb(205, 40, 55), POJAS_ROZE = rgb(235, 100, 150);
const MASNA = rgb(225, 35, 40);
const CVECE = [rgb(230, 60, 70), rgb(240, 120, 170), rgb(70, 120, 220), rgb(245, 200, 60)];

function nacrtajDevojku(x, y, razmera, desno, faza, poza) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(razmera, razmera);
  if (!desno) { ctx.translate(24, 0); ctx.scale(-1, 1); }
  ctx.lineWidth = 0.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const { nogaPrednja, nogaZadnja, rukaPrednja, rukaZadnja, odskok } = uglovi(poza, faza);
  ctx.translate(0, odskok);
  // suknja se njiše u hodu i leprša u skoku
  const njihanje = poza === 1 ? Math.sin(faza) * 0.9 : (poza === 2 || poza === 3 ? -1.4 : 0);

  // pletenica iza leđa
  ctx.fillStyle = KOSA_Z; ctx.strokeStyle = OBRIS;
  for (let i = 0; i < 6; i++) {
    const bx = 7.6 - i * 0.25 - (poza === 2 ? i * 0.35 : 0), by = 10 + i * 1.9;
    const e = elipsa(bx - 1.3, by - 1.1, 2.6, 2.3);
    ctx.fill(e); ctx.lineWidth = 0.5; ctx.stroke(e);
  }
  ctx.lineWidth = 0.9;
  ctx.fillStyle = MASNA;                                    // crvena mašna na kraju pletenice
  const mx = 6.3 - (poza === 2 ? 2 : 0), my = 21.6;
  ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx - 1.8, my - 1); ctx.lineTo(mx - 1.8, my + 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 1.6, my - 1); ctx.lineTo(mx + 1.6, my + 1); ctx.closePath(); ctx.fill();

  nacrtajRukuZ(9, 16.8, rukaZadnja, true);
  nacrtajNoguZ(10.5, 26, nogaZadnja, true);
  nacrtajNoguZ(14, 26, nogaPrednja, false);

  // suknja: crvena sa zelenim i tamnim prugama
  const suknja = new Path2D();
  suknja.moveTo(7, 22.6); suknja.lineTo(18, 22.6);
  suknja.lineTo(20.6 + njihanje, 32);
  suknja.quadraticCurveTo(12.5, 33.2, 4.4 + njihanje, 32);
  suknja.closePath();
  ctx.fillStyle = SUKNJA; ctx.fill(suknja);
  ctx.save(); ctx.clip(suknja);
  for (const [py, boja, deb] of [[25.2, SUKNJA_ZELENA, 0.9], [26.3, SUKNJA_TAMNA, 0.5], [28.4, SUKNJA_ZELENA, 0.9], [29.5, SUKNJA_TAMNA, 0.5], [31.2, SUKNJA_ZELENA, 1.2]]) {
    ctx.fillStyle = boja; ctx.fillRect(0, py, 24, deb);
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 0.4;          // nabori
  for (let nx = 8; nx < 20; nx += 1.8) linija(nx, 23, nx + njihanje * 0.6 + (nx - 12.5) * 0.18, 33);
  ctx.restore();
  ctx.lineWidth = 0.9; ctx.strokeStyle = OBRIS; ctx.stroke(suknja);

  // crna pregača sa izvezenim cvećem (napred)
  const pregaca = new Path2D();
  pregaca.moveTo(12.6, 23); pregaca.lineTo(18.2, 23);
  pregaca.lineTo(19.8 + njihanje, 31.8);
  pregaca.lineTo(12.2 + njihanje * 0.5, 32.2);
  pregaca.closePath();
  ctx.fillStyle = PREGACA; ctx.fill(pregaca);
  const cvetovi = [[15.4, 25.6, 0], [17.2, 27.6, 1], [14.6, 28.8, 2], [17.8, 30.4, 3], [15.6, 31, 0]];
  for (const [cx, cy, b] of cvetovi) {
    ctx.fillStyle = rgb(70, 150, 70); ctx.fill(elipsa(cx - 1.5 + njihanje * 0.4, cy + 0.2, 1.2, 0.7));
    ctx.fillStyle = CVECE[b]; ctx.fill(elipsa(cx - 0.65 + njihanje * 0.4, cy - 0.65, 1.3, 1.3));
  }
  ctx.strokeStyle = OBRIS; ctx.stroke(pregaca);

  // košulja
  const telo = zaobljen(7, 14.5, 11, 9, 2);
  ctx.fillStyle = KOSULJA; ctx.fill(telo);
  ctx.fillStyle = CVECE[0]; ctx.fill(elipsa(12.1, 16.6, 1.2, 1.2));    // vez na grudima
  ctx.fillStyle = CVECE[2]; ctx.fill(elipsa(12.5, 18.4, 1.1, 1.1));
  ctx.fillStyle = CVECE[1]; ctx.fill(elipsa(12.0, 20.0, 1.1, 1.1));
  // crni jelek sa zlatnim vezom
  const jelekZ = new Path2D();
  jelekZ.moveTo(7, 16); jelekZ.quadraticCurveTo(7.4, 14.5, 9.2, 14.6); jelekZ.lineTo(11.2, 15.2);
  jelekZ.quadraticCurveTo(10.2, 18.5, 11, 22.4); jelekZ.lineTo(7, 22.4); jelekZ.closePath();
  const jelekP = new Path2D();
  jelekP.moveTo(18, 16); jelekP.quadraticCurveTo(17.6, 14.5, 15.6, 14.6); jelekP.lineTo(14, 15.2);
  jelekP.quadraticCurveTo(15, 18.5, 14.2, 22.4); jelekP.lineTo(18, 22.4); jelekP.closePath();
  ctx.fillStyle = JELEK_Z; ctx.fill(jelekZ); ctx.fill(jelekP);
  ctx.strokeStyle = ZLATO; ctx.lineWidth = 0.7;
  ctx.stroke(jelekZ); ctx.stroke(jelekP);
  ctx.fillStyle = ZLATO;                                      // zlatni vez na jeleku
  for (const [zx, zy] of [[8.6, 17.2], [9.4, 18.6], [8.6, 20], [9.4, 21.2], [16.4, 17.2], [15.6, 18.6], [16.4, 20], [15.6, 21.2]]) {
    ctx.fill(elipsa(zx - 0.45, zy - 0.45, 0.9, 0.9));
  }
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = OBRIS; ctx.stroke(telo);

  // pojas
  const pojas = zaobljen(6.6, 21.8, 11.8, 2.4, 0.7);
  ctx.fillStyle = POJAS_Z; ctx.fill(pojas);
  ctx.fillStyle = POJAS_ROZE; ctx.fillRect(6.8, 22.7, 11.4, 0.6);
  ctx.strokeStyle = OBRIS; ctx.stroke(pojas);

  // vrat i dukati
  ctx.fillStyle = KOZA_SENKA; ctx.fillRect(11.2, 12.6, 3.2, 2.4);
  for (let i = 0; i < 5; i++) {
    const dx = 10.6 + i * 1.15, dy = 14.1 + Math.sin(i / 4 * Math.PI) * 1.1;
    const d = elipsa(dx - 0.6, dy - 0.6, 1.2, 1.2);
    ctx.fillStyle = ZLATO; ctx.fill(d);
    ctx.strokeStyle = ZLATO_TAMNO; ctx.lineWidth = 0.3; ctx.stroke(d);
  }
  ctx.lineWidth = 0.9;

  // glava
  const lice = elipsa(7, 3.6, 12, 10.6);
  ctx.fillStyle = KOZA; ctx.fill(lice);
  ctx.fillStyle = KOZA; ctx.fill(elipsa(17.4, 8.6, 2.2, 2));            // nos
  ctx.strokeStyle = OBRIS; ctx.stroke(lice);
  ctx.fillStyle = KOZA; ctx.fill(elipsa(16.8, 8.7, 2.3, 1.9));
  // kosa (razdeljak, začešljana nazad)
  const kosa = new Path2D();
  kosa.moveTo(7.2, 11.4);
  kosa.quadraticCurveTo(5.4, 4.4, 11, 2.9);
  kosa.quadraticCurveTo(17, 1.9, 19.1, 6.6);
  kosa.quadraticCurveTo(16.6, 4.9, 13.8, 5.3);
  kosa.quadraticCurveTo(11.4, 5.8, 10.8, 8.6);
  kosa.quadraticCurveTo(10.2, 11, 7.2, 11.4);
  kosa.closePath();
  ctx.fillStyle = KOSA_Z; ctx.fill(kosa);
  ctx.strokeStyle = KOSA_Z_SVETLA; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(9, 4.6); ctx.quadraticCurveTo(12.5, 3.2, 16.4, 4); ctx.stroke();
  ctx.lineWidth = 0.9; ctx.strokeStyle = OBRIS; ctx.stroke(kosa);
  // crveni cvet u kosi
  ctx.fillStyle = MASNA;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2;
    ctx.fill(elipsa(9.4 + Math.cos(a) * 0.9 - 0.7, 3.8 + Math.sin(a) * 0.9 - 0.7, 1.4, 1.4));
  }
  ctx.fillStyle = rgb(250, 210, 70); ctx.fill(elipsa(8.95, 3.35, 0.9, 0.9));
  // oko sa trepavicama, rumenilo, usne
  ctx.fillStyle = '#fff'; ctx.fill(elipsa(14.6, 7.3, 2.6, 2.6));
  ctx.fillStyle = rgb(60, 40, 25); ctx.fill(elipsa(15.6, 7.8, 1.6, 1.8));
  ctx.strokeStyle = OBRIS; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.moveTo(14.3, 7.3); ctx.quadraticCurveTo(15.8, 6.5, 17.3, 7.1); ctx.lineTo(18, 6.4); ctx.stroke();
  ctx.lineWidth = 0.9;
  ctx.fillStyle = 'rgba(240,120,120,0.45)'; ctx.fill(elipsa(13.4, 9.8, 2.4, 1.4));
  ctx.strokeStyle = rgb(200, 45, 60); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(16.2, 10.9, 1.7, 1.2, 0, Math.PI * 160 / 180, Math.PI * 40 / 180, true); ctx.stroke();
  ctx.lineWidth = 0.9;

  nacrtajRukuZ(15.5, 16.8, rukaPrednja, false);
  ctx.restore();
}

function nacrtajNoguZ(kukX, kukY, ugao, zadnja) {
  ctx.save();
  ctx.translate(kukX, kukY);
  ctx.rotate(-ugao * Math.PI / 180);
  const carapa = zaobljen(-1.7, 0, 3.4, 10.7, 0.6);
  ctx.fillStyle = zadnja ? rgb(16, 16, 18) : CARAPA; ctx.fill(carapa);
  ctx.fillStyle = zadnja ? tamnije(SARA) : SARA; ctx.fill(elipsa(-1.2, 7.4, 1, 1));
  ctx.fillStyle = zadnja ? tamnije(SARA2) : SARA2; ctx.fill(elipsa(0.3, 7.6, 0.9, 0.9));
  ctx.fillStyle = zadnja ? tamnije(CVECE[2]) : CVECE[2]; ctx.fill(elipsa(-0.5, 8.7, 0.9, 0.9));
  ctx.strokeStyle = OBRIS; ctx.stroke(carapa);
  const opanak = new Path2D();
  opanak.moveTo(-2.4, 10.2);
  opanak.lineTo(3, 10.2);
  opanak.quadraticCurveTo(4.8, 10.4, 5.2, 9.2);
  opanak.quadraticCurveTo(5.6, 11.4, 3.8, 12);
  opanak.lineTo(-2.4, 12);
  opanak.closePath();
  ctx.fillStyle = zadnja ? OPANAK_TAMNI : OPANAK; ctx.fill(opanak);
  ctx.strokeStyle = OPANAK_TAMNI; linija(-1.6, 10.6, 3, 10.6);
  ctx.strokeStyle = OBRIS; ctx.stroke(opanak);
  ctx.restore();
}

function nacrtajRukuZ(ramX, ramY, ugao, zadnja) {
  ctx.save();
  ctx.translate(ramX, ramY);
  ctx.rotate(-ugao * Math.PI / 180);
  const rukav = new Path2D();                                 // široki rukav košulje
  rukav.moveTo(-1.8, -0.4); rukav.lineTo(1.8, -0.4);
  rukav.lineTo(2.6, 7); rukav.quadraticCurveTo(0, 7.8, -2.6, 7); rukav.closePath();
  ctx.fillStyle = zadnja ? KOSULJA_SENKA : KOSULJA; ctx.fill(rukav);
  ctx.fillStyle = CVECE[1]; ctx.fill(elipsa(-1.3, 5, 1.1, 1.1));
  ctx.fillStyle = CVECE[2]; ctx.fill(elipsa(0.4, 5.4, 1.1, 1.1));
  ctx.strokeStyle = OBRIS; ctx.stroke(rukav);
  ctx.fillStyle = MASNA;                                      // crvena traka na laktu
  ctx.fillRect(-2.1, 2.6, 4.2, 1);
  ctx.beginPath(); ctx.moveTo(2, 3.1); ctx.lineTo(3.6, 4.6); ctx.lineTo(3, 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(2, 3.1); ctx.lineTo(3.8, 2.6); ctx.lineTo(3.7, 3.4); ctx.closePath(); ctx.fill();
  const saka = elipsa(-1.5, 7, 3, 2.8);
  ctx.fillStyle = zadnja ? KOZA_SENKA : KOZA; ctx.fill(saka);
  ctx.strokeStyle = OBRIS; ctx.stroke(saka);
  ctx.restore();
}

// ljutko u plavom, sa policijskom kapom
const LJUTKO = rgb(45, 105, 205), LJUTKO_TAMNI = rgb(25, 60, 135);
const KAPA = rgb(20, 30, 60), KAPA_TRAKA = rgb(15, 15, 20), ZNACKA = rgb(240, 195, 50);

function nacrtajNeprijatelja(n, kx) {
  const x = Math.round(n.x) - kx, y = Math.round(n.y);
  if (x < -40 || x > SIRINA + 40) return;
  ctx.save();
  if (n.spljosten > 0) {
    ctx.fillStyle = LJUTKO; ctx.fill(zaobljen(x, y + n.h - 8, n.w, 8, 3));
    ctx.fillStyle = KAPA; ctx.fill(zaobljen(x + 4, y + n.h - 12, n.w - 8, 5, 1.5));
    ctx.restore();
    return;
  }
  if (!n.ziv) {                      // pada naopako
    ctx.translate(x + n.w / 2, y + n.h / 2);
    ctx.scale(1, -1);
    ctx.translate(-(x + n.w / 2), -(y + n.h / 2));
  }
  ctx.translate(x, y);
  nacrtajTeloLjutka(n.vx > 0, LJUTKO, LJUTKO_TAMNI, false);
  ctx.restore();
}

// telo ljutka u okviru 28 x 26 (kapa viri 9 piksela iznad)
function nacrtajTeloLjutka(desno, boja, tamna, glavni) {
  const w = 28, h = 26;
  ctx.fillStyle = boja; ctx.fill(zaobljen(0, 0, w, h, 7));
  ctx.strokeStyle = tamna; ctx.lineWidth = 1.2; ctx.stroke(zaobljen(0.5, 0.5, w - 1, h - 1, 7));

  const korak = Math.floor(S.animBrojac / 8) % 2 === 0 ? 0 : 3;
  ctx.fillStyle = rgb(20, 20, 25);
  ctx.fill(elipsa(1 + korak, h - 6, 10, 6));
  ctx.fill(elipsa(w - 11 - korak, h - 6, 10, 6));

  const pomak = desno ? 1 : -1;
  ctx.fillStyle = glavni ? rgb(255, 235, 120) : '#fff';
  ctx.fill(elipsa(5, 7, 7, 8));
  ctx.fill(elipsa(16, 7, 7, 8));
  ctx.fillStyle = '#000';
  ctx.fill(elipsa(7 + pomak, 10, 3, 4));
  ctx.fill(elipsa(18 + pomak, 10, 3, 4));
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.6;
  linija(4, 6, 12, 9);
  linija(24, 6, 16, 9);
  ctx.fillStyle = glavni ? rgb(40, 15, 15) : rgb(20, 30, 60);
  ctx.fill(zaobljen(glavni ? 6 : 8, 17, glavni ? 16 : 12, 3, 1.5));   // brk

  // policijska kapa
  const cx = 2, cw = w - 4, cy = -9;
  ctx.fillStyle = KAPA;
  ctx.beginPath(); ctx.moveTo(cx + 2, cy + 9); ctx.lineTo(cx - 1, cy); ctx.lineTo(cx + cw + 1, cy); ctx.lineTo(cx + cw - 2, cy + 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgb(45, 60, 100); ctx.fillRect(cx + 1, cy + 1, cw - 2, 2);
  ctx.fillStyle = glavni ? ZNACKA : KAPA_TRAKA; ctx.fillRect(cx + 2, cy + 6, cw - 4, glavni ? 2.5 : 4);
  if (glavni) { ctx.fillStyle = KAPA_TRAKA; ctx.fillRect(cx + 2, cy + 8.5, cw - 4, 1.5); }
  ctx.fillStyle = KAPA_TRAKA;
  const siltX = desno ? w - 10 : -4;
  ctx.fill(zaobljen(siltX, cy + 8, 14, 4, 2));
  ctx.fillStyle = ZNACKA;
  const zx = Math.floor(w / 2) - 3;
  ctx.beginPath();
  ctx.moveTo(zx + 3, cy + 1); ctx.lineTo(zx + 6, cy + 3); ctx.lineTo(zx + 5, cy + 7); ctx.lineTo(zx + 1, cy + 7); ctx.lineTo(zx, cy + 3);
  ctx.closePath(); ctx.fill();
}

const GLAVNI_BOJA = rgb(210, 40, 45), GLAVNI_TAMNA = rgb(120, 15, 20);

function nacrtajGlavnog(g, kx) {
  const x = Math.round(g.x) - kx, y = Math.round(g.y);
  if (x < -80 || x > SIRINA + 80) return;
  ctx.save();
  if (g.umire) {
    ctx.translate(x + g.w / 2, y + g.h / 2); ctx.scale(1, -1); ctx.translate(-(x + g.w / 2), -(y + g.h / 2));
  }
  if (g.nepov > 0 && Math.floor(g.nepov / 4) % 2 === 0) ctx.globalAlpha = 0.45;     // trepće posle gaženja
  ctx.translate(x, y);
  ctx.scale(g.w / 28, g.h / 26);
  const desno = (S.px + PW / 2) > (g.x + g.w / 2);
  nacrtajTeloLjutka(desno, GLAVNI_BOJA, GLAVNI_TAMNA, true);
  ctx.restore();

  // traka života: 3 dela, svako gaženje skida jednu trećinu
  if (!g.umire && g.aktivan) {
    const sirina = 66, bx = x + g.w / 2 - sirina / 2, by = y - 34;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fill(zaobljen(bx - 2, by - 2, sirina + 4, 11, 4));
    ctx.fillStyle = rgb(230, 30, 40);
    const ostalo = Math.max(0, g.hp - g.pogodaka / VATRE_ZA_TRECINU);   // pogodak vatrom = pola trećine
    if (ostalo > 0) ctx.fill(zaobljen(bx, by, sirina * ostalo / 3, 7, 3));
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1;
    ctx.stroke(zaobljen(bx - 0.5, by - 0.5, sirina + 1, 8, 3.5));
    ctx.strokeStyle = 'rgba(0,0,0,0.7)';
    linija(bx + sirina / 3, by, bx + sirina / 3, by + 7);
    linija(bx + sirina * 2 / 3, by, bx + sirina * 2 / 3, by + 7);
  }
}

function nacrtajBeluKuglu(x, y, r, okret) {
  ctx.save();
  ctx.translate(x, y);
  const g = ctx.createRadialGradient(-2, -2, 0.5, 0, 0, r + 3);
  g.addColorStop(0, '#fff'); g.addColorStop(0.6, rgb(225, 235, 255)); g.addColorStop(1, 'rgba(160,190,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r + 3, 0, Math.PI * 2); ctx.fill();
  ctx.rotate(okret);
  ctx.strokeStyle = rgb(150, 175, 230); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, 0, r - 2, 0.3, 2.2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r - 2, 3.4, 5.3); ctx.stroke();
  ctx.restore();
}

function nacrtajEfekte(kx) {
  ctx.font = `bold 14px ${FONT}`;
  for (const ef of S.efekti) {
    if (ef.iskra) {                                     // kuglica se ugasila
      const t = ef.zivot / 12;
      ctx.fillStyle = ef.bela ? `rgba(220,230,255,${t})` : `rgba(255,${Math.floor(120 + 100 * t)},40,${t})`;
      ctx.beginPath(); ctx.arc(ef.x - kx, ef.y, 3 + (1 - t) * 7, 0, Math.PI * 2); ctx.fill();
      continue;
    }
    if (ef.novcic) nacrtajNovcic(Math.trunc(ef.x) - kx, Math.trunc(ef.y));
    else { ctx.fillStyle = '#fff'; ctx.fillText(ef.tekst, Math.trunc(ef.x) - kx, Math.trunc(ef.y)); }
  }
}

function senkaTekst(tekst, x, y) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillText(tekst, x + 2, y + 2);
  ctx.fillStyle = '#fff'; ctx.fillText(tekst, x, y);
}
function centar(tekst, velicina, y) {
  ctx.font = `bold ${velicina}px ${FONT}`;
  const w = ctx.measureText(tekst).width;
  senkaTekst(tekst, (SIRINA - w) / 2, y);
}
// ---------------- naslovni ekran sa izborom lika ----------------
const IZBOR = {
  M: { cx: 300, ime: 'MOMAK' },
  Z: { cx: 500, ime: 'DEVOJKA' },
  vrh: 168, dno: 352, pola: 62,
  igraj: { x: 320, y: 368, w: 160, h: 44 },
  svet: { x: 500, y: 372, w: 124, h: 36 },
};
if (!DODIR) IZBOR.svet = { x: 338, y: 362, w: 124, h: 34 };    // na računaru: ispod likova, iznad uputstva
function promeniPocetniSvet() {
  if (S.otkljucanSvet < 2) return;
  S.pocetniSvet = S.pocetniSvet % S.otkljucanSvet + 1;
}
function nacrtajIzborLika() {
  ctx.fillStyle = 'rgba(10,18,40,0.86)'; ctx.fillRect(0, 0, SIRINA, VISINA);
  centar('SUPER M.', 60, 112);
  centar('Izaberi lik', 18, 150);
  for (const l of ['M', 'Z']) {
    const k = IZBOR[l], izabran = S.lik === l;
    const okvir = zaobljen(k.cx - IZBOR.pola, IZBOR.vrh, IZBOR.pola * 2, IZBOR.dno - IZBOR.vrh, 14);
    ctx.fillStyle = izabran ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.06)';
    ctx.fill(okvir);
    ctx.lineWidth = izabran ? 3 : 1.5;
    ctx.strokeStyle = izabran ? rgb(245, 200, 60) : 'rgba(255,255,255,0.35)';
    ctx.stroke(okvir);
    ctx.save();
    if (!izabran) ctx.globalAlpha = 0.5;
    const r = 3.2, poza = izabran ? 1 : 0;        // izabrani lik maršira u mestu
    nacrtajLik(k.cx - 12 * r, 318 - 38 * r, r, true, S.animBrojac * 0.12, poza, l);
    ctx.restore();
    ctx.font = `bold 17px ${FONT}`;
    const w = ctx.measureText(k.ime).width;
    ctx.save(); if (!izabran) ctx.globalAlpha = 0.6;
    senkaTekst(k.ime, k.cx - w / 2, 342);
    ctx.restore();
  }
  if (S.otkljucanSvet > 1) {                       // izbor sveta od kog se počinje
    const v = IZBOR.svet;
    ctx.fillStyle = S.pocetniSvet === 2 ? rgb(70, 60, 95) : rgb(40, 110, 60);
    ctx.fill(zaobljen(v.x, v.y, v.w, v.h, 18));
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.stroke(zaobljen(v.x, v.y, v.w, v.h, 18));
    ctx.font = `bold 15px ${FONT}`;
    const t = IMENA_SVETOVA[S.pocetniSvet - 1] + '  ⇄';
    senkaTekst(t, v.x + (v.w - ctx.measureText(t).width) / 2, v.y + 24);
  }
  if (DODIR) {
    const b = IZBOR.igraj;
    ctx.fillStyle = rgb(190, 35, 45); ctx.fill(zaobljen(b.x, b.y, b.w, b.h, 22));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(zaobljen(b.x, b.y, b.w, b.h, 22));
    centar('▶  IGRAJ', 20, b.y + 29);
    centar('Dodirni lik da ga izabereš', 13, 434);
  } else {
    const sv = S.otkljucanSvet > 1;
    centar(sv ? '← →  lik     ↑ ↓  svet     ENTER  počni' : '← →  izaberi lik        ENTER  počni igru', 18, sv ? 422 : 395);
    centar('U igri:  ← →  kretanje     SPACE  skok     SHIFT  trčanje     X  vatra     P  pauza', 13, sv ? 446 : 434);
  }
  if (S.najboljiRezultat > 0) centar('Najbolji rezultat: ' + S.najboljiRezultat, 13, !DODIR && S.otkljucanSvet > 1 ? 470 : 460);
}
function dodirNaslovne(gx, gy) {        // gx, gy u koordinatama igre (800 x 480)
  for (const l of ['M', 'Z']) {
    const k = IZBOR[l];
    if (Math.abs(gx - k.cx) <= IZBOR.pola && gy >= IZBOR.vrh && gy <= IZBOR.dno) { izaberiLik(l); return 'lik'; }
  }
  const v = IZBOR.svet;
  if (S.otkljucanSvet > 1 && gx >= v.x && gx <= v.x + v.w && gy >= v.y - 6 && gy <= v.y + v.h + 6) { promeniPocetniSvet(); return 'svet'; }
  const b = IZBOR.igraj;
  if (gx >= b.x - 10 && gx <= b.x + b.w + 10 && gy >= b.y - 10 && gy <= b.y + b.h + 10) { novaIgra(); return 'igraj'; }
  return null;
}

function zatamni() { ctx.fillStyle = 'rgba(0,0,0,0.59)'; ctx.fillRect(0, 0, SIRINA, VISINA); }

function nacrtajHUD() {
  ctx.font = `bold 16px ${FONT}`;
  senkaTekst('SUPER M.', 20, 26);
  senkaTekst('POENI ' + String(S.poeni).padStart(6, '0'), 20, 46);
  senkaTekst('NOVČIĆI ×' + String(S.novcici).padStart(2, '0'), 250, 46);
  senkaTekst('ŽIVOTI ×' + S.zivoti, 450, 46);
  senkaTekst('VREME ' + S.vreme, 640, 46);
  senkaTekst('SVET ' + oznakaNivoa(), 640, 26);
  if (S.vatra > 0) {                                       // paprika + traka preostalog vremena
    nacrtajPapriku(250, 6);
    const w = 110, ostalo = S.vatra / VATRA_TRAJANJE;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill(zaobljen(272, 13, w, 10, 5));
    ctx.fillStyle = S.vatra < 120 && Math.floor(S.animBrojac / 5) % 2 === 0 ? rgb(255, 230, 120) : rgb(245, 110, 30);
    ctx.fill(zaobljen(272, 13, Math.max(10, w * ostalo), 10, 5));
    ctx.font = `bold 14px ${FONT}`;
    senkaTekst(Math.ceil(S.vatra / 60) + 's', 272 + w + 8, 24);
  }
}

function nacrtajPoruke() {
  switch (S.stanje) {
    case 'NASLOVNA':
      nacrtajIzborLika();
      break;
    case 'PAUZA':
      zatamni();
      centar('PAUZA', 48, 230);
      centar(DODIR ? 'Dodirni ekran za nastavak' : 'Pritisni P za nastavak', 16, 270);
      break;
    case 'KRAJ_IGRE':
      zatamni();
      centar('KRAJ IGRE', 56, 210);
      centar('Poeni: ' + S.poeni, 20, 255);
      centar(DODIR ? 'Dodirni ekran za nastavak' : 'ENTER za nastavak', 16, 295);
      break;
    case 'UVOD':
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, SIRINA, VISINA);
      nacrtajHUD();
      centar('SVET ' + oznakaNivoa(), 40, 170);
      ctx.save(); ctx.globalAlpha = 0.75; centar(IMENA_SVETOVA[svet() - 1], 18, 200); ctx.restore();
      if (S.glavni) { ctx.save(); ctx.fillStyle = rgb(255, 90, 90); ctx.font = `bold 15px ${FONT}`;
        const t = 'Na kraju te čeka glavni ljutko!'; ctx.fillText(t, (SIRINA - ctx.measureText(t).width) / 2, 330); ctx.restore(); }
      nacrtajLik(SIRINA / 2 - 50, 240, 1.2, true, 0, 0);
      ctx.font = `bold 26px ${FONT}`;
      senkaTekst('× ' + S.zivoti, SIRINA / 2, 278);
      break;
    case 'POBEDA':
      centar('NIVO ' + oznakaNivoa() + ' ZAVRŠEN!', 44, 250);
      break;
    case 'SVET_ZAVRSEN':
      zatamni();
      nacrtajLik(SIRINA / 2 - 36, 40, 3.0, true, 0, 0);
      centar('ČESTITAMO!', 56, 230);
      centar('Prešao si sve svetove!', 22, 270);
      centar('Poeni: ' + S.poeni, 20, 305);
      centar(DODIR ? 'Dodirni ekran za nastavak' : 'ENTER za nastavak', 16, 345);
      break;
  }
}

// =====================================================================
// EKRAN: platno se prilagođava veličini telefona (uvek 800 x 480 u igri)
// =====================================================================
let razmeraEkrana = 1;
function prilagodiEkran() {
  const sirinaProzora = window.innerWidth, visinaProzora = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  razmeraEkrana = Math.min(sirinaProzora / SIRINA, visinaProzora / VISINA);
  const w = Math.floor(SIRINA * razmeraEkrana), h = Math.floor(VISINA * razmeraEkrana);
  platno.style.width = w + 'px';
  platno.style.height = h + 'px';
  platno.style.left = Math.floor((sirinaProzora - w) / 2) + 'px';
  platno.style.top = Math.floor((visinaProzora - h) / 2) + 'px';
  platno.width = Math.floor(w * dpr);
  platno.height = Math.floor(h * dpr);
  ctx.setTransform(platno.width / SIRINA, 0, 0, platno.height / VISINA, 0, 0);
  if (sirinaProzora < visinaProzora && S.stanje === 'IGRA') S.stanje = 'PAUZA';   // telefon uspravno
}
window.addEventListener('resize', prilagodiEkran);
window.addEventListener('orientationchange', () => setTimeout(prilagodiEkran, 200));
document.addEventListener('visibilitychange', () => { if (document.hidden && S.stanje === 'IGRA') S.stanje = 'PAUZA'; });

// =====================================================================
// KONTROLE
// =====================================================================
function akcija() {             // ENTER ili dodir ekrana
  if (S.stanje === 'NASLOVNA') novaIgra();
  else if (S.stanje === 'KRAJ_IGRE' || S.stanje === 'SVET_ZAVRSEN') { S.trenutniNivo = 0; ucitajNivo(); S.stanje = 'NASLOVNA'; }
  else if (S.stanje === 'PAUZA') S.stanje = 'IGRA';
}
function pauza() {
  if (S.stanje === 'IGRA') S.stanje = 'PAUZA';
  else if (S.stanje === 'PAUZA') S.stanje = 'IGRA';
}
function pritisniSkok() {
  if (!S.skokDrzi) S.skokBafer = SKOK_BAFER;
  S.skokDrzi = true;
}

// tastatura
window.addEventListener('keydown', e => {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': S.levo = true; if (S.stanje === 'NASLOVNA') izaberiLik('M'); break;
    case 'ArrowRight': case 'KeyD': S.desno = true; if (S.stanje === 'NASLOVNA') izaberiLik('Z'); break;
    case 'ShiftLeft': case 'ShiftRight': S.trci = true; osveziTrk(); break;
    case 'Space': case 'ArrowUp': case 'KeyW':
      if (S.stanje === 'NASLOVNA' && e.code !== 'Space') { promeniPocetniSvet(); break; }
      pritisniSkok(); break;
    case 'ArrowDown': case 'KeyS': if (S.stanje === 'NASLOVNA') promeniPocetniSvet(); break;
    case 'KeyX': case 'KeyF': case 'KeyK': case 'ControlLeft': case 'ControlRight':
      if (!e.repeat) pucaj(); break;
    case 'Enter': akcija(); break;
    case 'KeyP': pauza(); break;
    default: return;
  }
  e.preventDefault();
});
window.addEventListener('keyup', e => {
  switch (e.code) {
    case 'ArrowLeft': case 'KeyA': S.levo = false; break;
    case 'ArrowRight': case 'KeyD': S.desno = false; break;
    case 'ShiftLeft': case 'ShiftRight': S.trci = false; osveziTrk(); break;
    case 'Space': case 'ArrowUp': case 'KeyW': S.skokDrzi = false; break;
  }
});

// dugmići na ekranu (više prstiju istovremeno, prst može da klizne sa ← na →)
// Ako je na serveru ostao stariji index.html / style.css bez dugmeta VATRA, dodaj ga ovde,
// da igra radi i kad nisu otpremljeni svi fajlovi.
(function obezbediDugmeVatra() {
  if (!document.getElementById('btn-vatra')) {
    const d = document.createElement('div');
    d.id = 'btn-vatra'; d.className = 'dugme vatra'; d.textContent = 'VATRA';
    const skok = document.getElementById('btn-skok');
    if (skok && skok.parentNode) skok.parentNode.insertBefore(d, skok); else document.body.appendChild(d);
  }
  if (!document.getElementById('stil-vatra')) {
    const st = document.createElement('style');
    st.id = 'stil-vatra';
    st.textContent = `.dugme.vatra { width: 66px; height: 66px; font-size: 13px; visibility: hidden;
      background: rgba(245, 110, 30, .75); border-color: rgba(255, 230, 150, .9); color: #fff; }
      .dugme.vatra.vidljivo { visibility: visible; }
      .dugme.vatra.pritisnuto { background: rgba(255, 200, 60, .95); }
      #kontrole-desno { flex-direction: column; align-items: center; gap: 10px; }`;
    document.head.appendChild(st);
  }
})();

const dugmici = {
  levo: document.getElementById('btn-levo'),
  desno: document.getElementById('btn-desno'),
  skok: document.getElementById('btn-skok'),
  trk: document.getElementById('btn-trk'),
  vatra: document.getElementById('btn-vatra'),
  pauza: document.getElementById('btn-pauza'),
};
const prsti = new Map();       // pointerId -> naziv dugmeta ili null

function dugmeNa(x, y) {
  for (const [ime, el] of Object.entries(dugmici)) {
    if (ime === 'vatra' && !el.classList.contains('vidljivo')) continue;
    const r = el.getBoundingClientRect();
    const rez = ime === 'pauza' ? 6 : 14;           // malo veća zona dodira od samog kruga
    if (x >= r.left - rez && x <= r.right + rez && y >= r.top - rez && y <= r.bottom + rez) return ime;
  }
  return null;
}
function osveziDugmice() {
  const aktivna = new Set(prsti.values());
  S.levo = aktivna.has('levo');
  S.desno = aktivna.has('desno');
  const skok = aktivna.has('skok');
  if (skok && !S.skokDrzi) pritisniSkok();
  if (!skok) S.skokDrzi = false;
  for (const ime of ['levo', 'desno', 'skok', 'vatra']) dugmici[ime].classList.toggle('pritisnuto', aktivna.has(ime));
}
function osveziTrk() { dugmici.trk.classList.toggle('ukljuceno', S.trci); }

function uIgru(e) {
  const r = platno.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width * SIRINA, (e.clientY - r.top) / r.height * VISINA];
}
document.addEventListener('pointerdown', e => {
  if (S.stanje === 'NASLOVNA') {               // izbor lika: dodir na lik / IGRAJ, ili ◀ ▶
    const ime0 = DODIR ? dugmeNa(e.clientX, e.clientY) : null;
    if (ime0 === 'levo') izaberiLik('M');
    else if (ime0 === 'desno') izaberiLik('Z');
    else if (ime0 === 'skok') novaIgra();
    else if (!ime0) {
      const [gx, gy] = uIgru(e);
      if (e.pointerType === 'mouse' && !DODIR) {
        if (dodirNaslovne(gx, gy) === null) novaIgra();      // klik van lika i sveta = počni
      } else dodirNaslovne(gx, gy);
    }
    e.preventDefault();
    return;
  }
  if (e.pointerType === 'mouse' && !DODIR) { akcija(); return; }
  const ime = dugmeNa(e.clientX, e.clientY);
  if (ime === 'trk') { S.trci = !S.trci; osveziTrk(); vibriraj(10); prsti.set(e.pointerId, null); }
  else if (ime === 'vatra') { if (S.vatra > 0) pucaj(); prsti.set(e.pointerId, 'vatra'); }
  else if (ime === 'pauza') { pauza(); prsti.set(e.pointerId, null); }
  else if (ime) { prsti.set(e.pointerId, ime); }
  else { prsti.set(e.pointerId, null); akcija(); }
  osveziDugmice();
  e.preventDefault();
}, { passive: false });
document.addEventListener('pointermove', e => {
  if (!prsti.has(e.pointerId)) return;
  const staro = prsti.get(e.pointerId);
  if (staro === null) return;
  const novo = dugmeNa(e.clientX, e.clientY);
  if (novo === 'levo' || novo === 'desno' || novo === 'skok') prsti.set(e.pointerId, novo);
  else if (novo === null && (staro === 'levo' || staro === 'desno')) prsti.set(e.pointerId, staro);
  osveziDugmice();
  e.preventDefault();
}, { passive: false });
function pustiPrst(e) { prsti.delete(e.pointerId); osveziDugmice(); }
document.addEventListener('pointerup', pustiPrst);
document.addEventListener('pointercancel', pustiPrst);
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

if (DODIR) document.body.classList.add('dodir');

// =====================================================================
// GLAVNA PETLJA: 60 koraka u sekundi bez obzira na brzinu telefona
// =====================================================================
const KORAK = 1 / 60;
let poslednje = performance.now(), akumulator = 0;
function petlja(sad) {
  akumulator += (sad - poslednje) / 1000;
  poslednje = sad;
  if (akumulator > 0.25) akumulator = 0.25;
  while (akumulator >= KORAK) { azuriraj(); akumulator -= KORAK; }
  nacrtaj();
  const vidi = S.vatra > 0 && S.stanje !== 'NASLOVNA';
  if (dugmici.vatra.classList.contains('vidljivo') !== vidi) dugmici.vatra.classList.toggle('vidljivo', vidi);
  requestAnimationFrame(petlja);
}

ucitajNivo();
prilagodiEkran();
requestAnimationFrame(petlja);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }));
}
