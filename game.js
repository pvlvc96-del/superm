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
const RAZMERA_VELIKI = PH_VELIKI / 36;

// =====================================================================
// NIVOI
// =====================================================================
// # zemlja   B cigla   ? kutija sa novčićem   R kutija sa flašicom rakije   = kamena platforma
// o novčić   E ljutko   P start igrača   F zastavica (kraj nivoa)
const NIVOI = [
  [ // SVET 1-1
    "",
    "",
    "",
    "",
    "                                                                                ooo                             o o",
    "                ?                                                               ===                            =====                       #",
    "                                               ?                                                                                          ##",
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
    "        BB?BB                           BBB?BBB                               ?B?B?         oo    o        ##         BBBRBBB      oooo        #####",
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
    "                  o     o       o    o        o     o       o    o   ?    o     o      o    o    ?   o     o       o    o       o      o",
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
    "",
    "",
    "",
    "",
    "                                                                                 o o o",
    "                                                                                =======                                                                                ####",
    "                                                                                                                                                                      #####",
    "                                                                                            oo      oo                                                               ######",
    "                      ooo                                              E   E                                                                                        #######",
    "        BRB                         #                        ##     BB?BBRBB?BB                                                 E       ##                         ########",
    "                              #     #         ===           ####                                                           #   ===     ####             ===       #########",
    "                              #     #                      ######                       ###    ####    ###             #   #          ######                     ##########",
    "   P          E E E           #  E  #   E E               ########   E  E    E  E       ###    ####    ###    E    E   #   #         ########  E E E            ###########               F",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
    "#####################     ###################     ###    ##################################    ####    #######################     ####################     ############################################",
  ],
];
const VREME_NIVOA = [300, 300, 280, 260];

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
};

try { S.najboljiRezultat = parseInt(localStorage.getItem('superm-najbolji'), 10) || 0; } catch (e) { }
try { if (localStorage.getItem('superm-lik') === 'Z') S.lik = 'Z'; } catch (e) { }
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
  S.trenutniNivo = 0;
  S.poeni = 0; S.novcici = 0; S.zivoti = 3;
  ucitajNivo();
  pokreniUvod();
}

function pokreniUvod() { S.stanje = 'UVOD'; S.tajmerStanja = 120; }

function sledeciNivo() {
  if (S.trenutniNivo < NIVOI.length - 1) {
    S.trenutniNivo++;
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
function cvrsto(c) { return c === '#' || c === 'B' || c === '?' || c === 'R' || c === 'U' || c === '='; }
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
      azurirajNeprijatelje();
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
  const nebo = ctx.createLinearGradient(0, 0, 0, VISINA);
  nebo.addColorStop(0, rgb(92, 148, 252));
  nebo.addColorStop(1, rgb(170, 210, 255));
  ctx.fillStyle = nebo;
  ctx.fillRect(0, 0, SIRINA, VISINA);

  const kx = Math.round(S.kamera);
  nacrtajOblake(kx);
  for (const c of S.cokanji) nacrtajCokanj(c.x - kx, c.y);
  nacrtajMapu(kx);
  nacrtajZastavu(kx);
  for (const n of S.neprijatelji) nacrtajNeprijatelja(n, kx);
  nacrtajEfekte(kx);
  if (S.stanje !== 'NASLOVNA' && S.stanje !== 'KRAJ_IGRE' && S.stanje !== 'SVET_ZAVRSEN') nacrtajIgraca(kx);
  if (S.stanje !== 'NASLOVNA') nacrtajHUD();
  nacrtajPoruke();
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
  ctx.lineWidth = 1;
  for (let y = 0; y < S.mapaVisina; y++) {
    for (let x = Math.max(0, prvi); x <= poslednji && x < S.mapaSirina; x++) {
      const c = S.mapa[y][x];
      const sx = x * PLOCICA - kx, sy = y * PLOCICA;
      switch (c) {
        case '#': {
          const vrh = y === 0 || S.mapa[y - 1][x] !== '#';
          ctx.fillStyle = rgb(150, 90, 50); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
          ctx.strokeStyle = rgb(120, 70, 40); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
          if (vrh) { ctx.fillStyle = rgb(70, 180, 70); ctx.fillRect(sx, sy, PLOCICA, 8); }
          break;
        }
        case 'B':
          ctx.fillStyle = rgb(190, 95, 50); ctx.fillRect(sx, sy, PLOCICA, PLOCICA);
          ctx.strokeStyle = rgb(90, 40, 20); ctx.strokeRect(sx + 0.5, sy + 0.5, PLOCICA - 1, PLOCICA - 1);
          linija(sx, sy + 16.5, sx + 32, sy + 16.5);
          linija(sx + 16.5, sy, sx + 16.5, sy + 16);
          linija(sx + 8.5, sy + 16, sx + 8.5, sy + 32);
          linija(sx + 24.5, sy + 16, sx + 24.5, sy + 32);
          break;
        case '?':
        case 'R': {
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

function nacrtajZastavu(kx) {
  const x = Math.trunc(S.zastavaX) - kx + PLOCICA / 2;
  const dno = (S.mapaVisina - 2) * PLOCICA;
  const vrh = dno - 9 * PLOCICA;
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
  nacrtajLik(x, y, razmera, S.gledaDesno, S.predjeno * 0.18 / razmera, poza);
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

function uglovi(poza, faza) {
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
  const desno = n.vx > 0;
  ctx.fillStyle = LJUTKO; ctx.fill(zaobljen(x, y, n.w, n.h, 7));
  ctx.strokeStyle = LJUTKO_TAMNI; ctx.lineWidth = 1.2; ctx.stroke(zaobljen(x + 0.5, y + 0.5, n.w - 1, n.h - 1, 7));

  const korak = Math.floor(S.animBrojac / 8) % 2 === 0 ? 0 : 3;
  ctx.fillStyle = rgb(20, 20, 25);
  ctx.fill(elipsa(x + 1 + korak, y + n.h - 6, 10, 6));
  ctx.fill(elipsa(x + n.w - 11 - korak, y + n.h - 6, 10, 6));

  const pomak = desno ? 1 : -1;
  ctx.fillStyle = '#fff';
  ctx.fill(elipsa(x + 5, y + 7, 7, 8));
  ctx.fill(elipsa(x + 16, y + 7, 7, 8));
  ctx.fillStyle = '#000';
  ctx.fill(elipsa(x + 7 + pomak, y + 10, 3, 4));
  ctx.fill(elipsa(x + 18 + pomak, y + 10, 3, 4));
  ctx.strokeStyle = '#000'; ctx.lineWidth = 1.6;
  linija(x + 4, y + 6, x + 12, y + 9);
  linija(x + 24, y + 6, x + 16, y + 9);
  ctx.fillStyle = rgb(20, 30, 60); ctx.fill(zaobljen(x + 8, y + 17, 12, 3, 1.5));   // brk

  // policijska kapa
  const cx = x + 2, cw = n.w - 4, cy = y - 9;
  ctx.fillStyle = KAPA;
  ctx.beginPath(); ctx.moveTo(cx + 2, cy + 9); ctx.lineTo(cx - 1, cy); ctx.lineTo(cx + cw + 1, cy); ctx.lineTo(cx + cw - 2, cy + 9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = rgb(45, 60, 100); ctx.fillRect(cx + 1, cy + 1, cw - 2, 2);
  ctx.fillStyle = KAPA_TRAKA; ctx.fillRect(cx + 2, cy + 6, cw - 4, 4);
  const siltX = desno ? x + n.w - 10 : x - 4;
  ctx.fill(zaobljen(siltX, cy + 8, 14, 4, 2));
  ctx.fillStyle = ZNACKA;
  const zx = x + Math.floor(n.w / 2) - 3;
  ctx.beginPath();
  ctx.moveTo(zx + 3, cy + 1); ctx.lineTo(zx + 6, cy + 3); ctx.lineTo(zx + 5, cy + 7); ctx.lineTo(zx + 1, cy + 7); ctx.lineTo(zx, cy + 3);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

function nacrtajEfekte(kx) {
  ctx.font = `bold 14px ${FONT}`;
  for (const ef of S.efekti) {
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
};
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
  if (DODIR) {
    const b = IZBOR.igraj;
    ctx.fillStyle = rgb(190, 35, 45); ctx.fill(zaobljen(b.x, b.y, b.w, b.h, 22));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(zaobljen(b.x, b.y, b.w, b.h, 22));
    centar('▶  IGRAJ', 20, b.y + 29);
    centar('Dodirni lik da ga izabereš', 13, 434);
  } else {
    centar('← →  izaberi lik        ENTER  počni igru', 18, 395);
    centar('U igri:  ← →  kretanje     SPACE  skok     SHIFT  trčanje     P  pauza', 13, 434);
  }
  if (S.najboljiRezultat > 0) centar('Najbolji rezultat: ' + S.najboljiRezultat, 13, 460);
}
function dodirNaslovne(gx, gy) {        // gx, gy u koordinatama igre (800 x 480)
  for (const l of ['M', 'Z']) {
    const k = IZBOR[l];
    if (Math.abs(gx - k.cx) <= IZBOR.pola && gy >= IZBOR.vrh && gy <= IZBOR.dno) { izaberiLik(l); return; }
  }
  const b = IZBOR.igraj;
  if (gx >= b.x - 10 && gx <= b.x + b.w + 10 && gy >= b.y - 10 && gy <= b.y + b.h + 10) novaIgra();
}

function zatamni() { ctx.fillStyle = 'rgba(0,0,0,0.59)'; ctx.fillRect(0, 0, SIRINA, VISINA); }

function nacrtajHUD() {
  ctx.font = `bold 16px ${FONT}`;
  senkaTekst('SUPER M.', 20, 26);
  senkaTekst('POENI ' + String(S.poeni).padStart(6, '0'), 20, 46);
  senkaTekst('NOVČIĆI ×' + String(S.novcici).padStart(2, '0'), 250, 46);
  senkaTekst('ŽIVOTI ×' + S.zivoti, 450, 46);
  senkaTekst('VREME ' + S.vreme, 640, 46);
  senkaTekst('SVET 1-' + (S.trenutniNivo + 1), 640, 26);
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
      centar('SVET 1-' + (S.trenutniNivo + 1), 40, 200);
      nacrtajLik(SIRINA / 2 - 50, 240, 1.2, true, 0, 0);
      ctx.font = `bold 26px ${FONT}`;
      senkaTekst('× ' + S.zivoti, SIRINA / 2, 278);
      break;
    case 'POBEDA':
      centar('NIVO 1-' + (S.trenutniNivo + 1) + ' ZAVRŠEN!', 44, 250);
      break;
    case 'SVET_ZAVRSEN':
      zatamni();
      nacrtajLik(SIRINA / 2 - 36, 40, 3.0, true, 0, 0);
      centar('ČESTITAMO!', 56, 230);
      centar('Prešao si ceo Svet 1', 22, 270);
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
    case 'Space': case 'ArrowUp': case 'KeyW': pritisniSkok(); break;
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
const dugmici = {
  levo: document.getElementById('btn-levo'),
  desno: document.getElementById('btn-desno'),
  skok: document.getElementById('btn-skok'),
  trk: document.getElementById('btn-trk'),
  pauza: document.getElementById('btn-pauza'),
};
const prsti = new Map();       // pointerId -> naziv dugmeta ili null

function dugmeNa(x, y) {
  for (const [ime, el] of Object.entries(dugmici)) {
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
  for (const ime of ['levo', 'desno', 'skok']) dugmici[ime].classList.toggle('pritisnuto', aktivna.has(ime));
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
        const pre = S.lik; dodirNaslovne(gx, gy);
        if (S.stanje === 'NASLOVNA' && S.lik === pre && !(Math.abs(gx - IZBOR[pre].cx) <= IZBOR.pola && gy >= IZBOR.vrh && gy <= IZBOR.dno)) novaIgra();
      } else dodirNaslovne(gx, gy);
    }
    e.preventDefault();
    return;
  }
  if (e.pointerType === 'mouse' && !DODIR) { akcija(); return; }
  const ime = dugmeNa(e.clientX, e.clientY);
  if (ime === 'trk') { S.trci = !S.trci; osveziTrk(); vibriraj(10); prsti.set(e.pointerId, null); }
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
  requestAnimationFrame(petlja);
}

ucitajNivo();
prilagodiEkran();
requestAnimationFrame(petlja);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => { }));
}
