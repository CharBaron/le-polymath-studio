// 24 — « Dernier étage », jour 1, V2 (30/10 : Charles veut plus de contexte, un perso dont on se souvient, des animations plus
// fluides). Même histoire que la 23, plus la fiche du perso, le plan de l'appart, la barricade, l'eau, les rations et l'inventaire.
import {makeEpisode} from '../survie/Episode';
import {Alerte, OUR_WIN, Ouverture, Telephone} from '../survie/scenesA';
import {Baie, Rue, Tetes} from '../survie/scenesB';
import {AlaFenetre, Faisceau, FinFond, Jumelles, SalonNuit, VilleSoir} from '../survie/scenesC';
import {Barricade, Dossier, Eau, Rations} from '../survie/scenesD';
import {Inventory, Morse} from '../survie/ui';
import {prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

export const DernierEtage1V2 = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  return {
    scenes: [
      {t0: 0, render: (p) => <Ouverture {...p} hero wake={1.62} pull={[2.6, 4.0]} />},
      {
        t0: B.tel, tr: 'fade', render: (p) => (
          <Telephone {...p} hour="06:47" date="vendredi 30 octobre" notifs={[
            {at: B.tel + 0.12, app: 'Téléphone', icon: '#34C759', who: 'Maman', msg: 'Appels manqués (9)'},
            {at: B.tel + 0.62, app: 'Messages', icon: '#2F8CFF', who: 'Lucas', msg: "t'es où ??? réponds"},
            {at: B.tel + 1.1, app: 'Messages', icon: '#34C759', who: 'Maman', msg: 'DÉCROCHE STP'},
            {at: B.tel + 1.55, app: 'Infos', icon: '#FF9F0A', who: 'Alerte Info', msg: 'Hôpitaux débordés, restez chez vous'},
            {at: B.alerte - 0.12, app: 'maintenant', icon: '#FF3B30', who: "ALERTE D'URGENCE", msg: 'Confinement total. Touchez…', alert: true},
          ]} />
        ),
      },
      {
        t0: B.alerte + 0.28, tr: 'white', render: (p) => (
          <Alerte {...p} lines={[
            {at: B.conf, text: 'CONFINEMENT TOTAL.'},
            {at: B.lum, text: 'ÉTEIGNEZ TOUTES', red: true},
            {at: B.lum + 1.18, text: 'LES LUMIÈRES.', red: true},
          ]} />
        ),
      },
      {t0: B.dehors - 0.02, tr: 'black', render: (p) => <Baie {...p} t0={B.dehors} hero />},
      {t0: B.bas - 0.05, tr: 'fade', d: 0.3, render: (p) => <Rue {...p} alarmAt={B.alarme + 0.6} />},
      {t0: B.toi - 0.05, tr: 'black', render: (p) => <Dossier {...p} />},
      {t0: B.r1 - 0.05, tr: 'black', render: (p) => <Barricade {...p} />},
      {t0: B.r2 - 0.08, tr: 'black', render: (p) => <Eau {...p} />},
      {t0: B.r3 - 0.05, tr: 'black', render: (p) => <Rations {...p} />},
      {t0: B.soir - 0.05, tr: 'black', render: (p) => <VilleSoir {...p} t0={B.soir} offFrom={B.fenetres - 0.1} offTo={B.ration - 0.3} />},
      {t0: B.ration - 0.05, tr: 'black', render: (p) => <SalonNuit {...p} t0={B.ration} lit={B.allume + 0.38} push={B.face} hero eat={[B.ration + 0.2, B.minuit + 0.4]} />},
      {t0: B.jum - 0.05, tr: 'fade', render: (p) => <AlaFenetre {...p} raise={[B.jum + 0.3, B.jum + 1.0]} hero />},
      {t0: B.fille - 0.15, tr: 'black', render: (p) => <Jumelles {...p} pov={B.fille - 0.15} signal={B.signal + 0.1} m={[B.m1, B.m2, B.m3]} sos={B.sos} />},
      {t0: B.r4 - 0.05, tr: 'fade', render: (p) => <AlaFenetre {...p} raise={[-9, -8]} lower={[B.r4 + 0.2, B.r4 + 0.9]} dim={0.3} hero />},
      {t0: B.braque - 0.05, tr: 'fade', render: (p) => <Jumelles {...p} pov={B.braque - 0.05} signal={-9} m={[-99, -99, -99]} sos={-99} aim={B.braque + 0.35} white={B.tafen} />},
      {t0: B.tafen, tr: 'white', d: 0.35, render: (p) => <Faisceau {...p} t0={B.tafen} hero />},
      {t0: B.tetes - 0.05, tr: 'black', render: (p) => <Tetes {...p} dark={0.55 * prog(p.T, B.choix, B.choix + 0.6)} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {
      day: 'JOUR 1', floor: 'ÉTAGE 12 · APPART 1204', t0: B.tel, t1: endT - 0.25, off: [[B.alerte + 0.28, B.dehors]],
      clock: [
        [0, hm(6, 47)], [B.alerte, hm(6, 48)], [B.dehors, hm(6, 49)], [B.alarme, hm(6, 51)], [B.toi, hm(6, 55)], [B.r1, hm(7, 10)],
        [B.lourd, hm(7, 10)], [B.r2 - 0.3, hm(8, 55), true], [B.r2, hm(9, 30)], [B.bain, hm(9, 30)], [B.r3 - 0.3, hm(13, 0), true],
        [B.r3, hm(15, 40)], [B.frais, hm(15, 40)], [B.soir - 0.3, hm(17, 30), true], [B.soir, hm(19, 40)], [B.fenetres, hm(19, 40)],
        [B.ration - 0.3, hm(21, 0), true], [B.ration, hm(21, 10)], [B.minuit - 0.3, hm(22, 40), true], [B.minuit, hm(23, 58)], [B.allume + 0.38, hm(23, 59)],
      ],
    },
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 1', t0: B.h2 + 0.08, t1: B.tel - 0.45},
    pin: {text: 'TOI · ÉTAGE 12', x: OUR_WIN.cx, y: OUR_WIN.cy - 50, t0: 4.0, t1: B.h2 + 0.05},
    rules: [
      {n: 1, title: 'BARRICADE LA PORTE', tag: B.r1, at: B.r1t, shrink: B.cana - 0.15, end: B.r2 - 0.15},
      {n: 2, title: 'GARDE DE L’EAU', tag: B.r2 + 0.05, at: B.r2t, shrink: B.bain + 0.4, end: B.r3 - 0.15},
      {n: 3, title: 'RATIONNE', tag: B.r3 + 0.05, at: B.r3t, shrink: B.jours - 0.1, end: B.soir - 0.15},
      {n: 4, title: 'AUCUNE LUMIÈRE', sub: 'MÊME POUR ELLE.', tag: B.r4, at: B.r4x, end: B.braque + 0.25, redacted: true},
    ],
    choice: {q: 'ALORS… TU RÉPONDS ?', a: 'A · JE LUI RÉPONDS', b: 'B · JE RESTE DANS LE NOIR', tq: B.choix, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.1},
    end: {name: 'DERNIER ÉTAGE', day: 1, time0: '23:59', time1: '00:00', cta: 'ABONNE-TOI POUR LE JOUR 2', t0: endT, flip: B.fin + 1.55},
    hideCaps: [[B.alerte + 0.28, B.dehors - 0.02], [endT, 999]],
    extra: (
      <>
        <Inventory t0={B.toi + 0.5} t1={endT - 0.25}
          eau={[[0, 2], [B.r2t, 2], [B.sec + 1.2, 190]]}
          vivres={[[0, '?'], [B.jours + 1.3, '4 JOURS'], [B.ration + 1.6, '3 JOURS']]}
          batt={[[0, 64], [B.r2, 58], [B.r3, 47], [B.soir, 36], [B.minuit, 21], [B.choix, 19]]} />
        <Morse sos={B.sos} t1={B.r4 - 0.1} groups={[
          {at: B.m1 + 0.02, on: 0.11, off: 0.09, long: false, letter: 'S'},
          {at: B.m2 + 0.02, on: 0.2, off: 0.08, long: true, letter: 'O'},
          {at: B.m3 + 0.02, on: 0.11, off: 0.09, long: false, letter: 'S'},
        ]} />
      </>
    ),
  };
});
