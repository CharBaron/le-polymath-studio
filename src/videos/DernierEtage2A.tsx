// 25 — « Dernier étage », jour 2, branche A (au jour 1, la majorité a répondu à Lina avec sa lampe).
// Script et bible : « Vidéo Prête et Publication/Dernier étage/ ». Lina répond « MUR » en morse, un grimpeur monte vers ta lumière,
// traces de mains au matin, règles 5 (occulter) et 6 (batterie), message de Maman, Lina et ses feuilles (hélico dans 10 jours),
// à minuit on frappe en morse… alors que Lina est en face.
import {makeEpisode} from '../survie/Episode';
import {FinFond} from '../survie/scenesC';
import {FacadeNuit, Fente, FenetreSOS, LinaJour, Occulter, PorteNuit, ToitSchema, Traces, Vitre, Vocal} from '../survie/scenesE';
import {Countdown, Inventory, morseSpans, MorseCode} from '../survie/ui';
import {lerp, prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

export const DernierEtage2A = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const mine = morseSpans(0, 'SOS', 0.09, [B.s1 + 0.05, B.s1 + 1.1, B.s1 + 2.15]);
  const hers = morseSpans(0, 'MUR', 0.11, [B.mot + 1.2, B.mot + 2.3, B.mot + 3.4]);
  const knockL = morseSpans(0, 'SOS', 0.09, [B.k1 + 0.05, B.k2 + 0.05, B.k3 + 0.05]);
  const knocks = knockL.flatMap((l) => l.on.map(([a]) => a));
  const toc = [B.toc, B.toc + 0.92, B.toc + 1.84];
  const batt = (t: number) => lerp(19, 15, prog(t, B.maman, B.aime + 0.5));
  return {
    scenes: [
      {t0: 0, render: (p) => <FenetreSOS {...p} mine={mine} hers={hers} herSteadyUntil={B.stop} />},
      {t0: B.penche - 0.05, tr: 'fade', render: (p) => <FacadeNuit {...p} look={B.penche} climb={[B.grimpe, B.tard + 0.3]} off={B.eteins + 0.1} />},
      {t0: B.vitre - 0.05, tr: 'black', render: (p) => <Vitre {...p} appear={B.vitre} taps={toc} />},
      {t0: B.matin - 0.05, tr: 'white', d: 0.4, render: (p) => <Traces {...p} pull={B.douze - 0.4} enter={B.comprends - 0.6} />},
      {t0: B.r5 - 0.05, tr: 'fade', render: (p) => <Occulter {...p} t0={B.r5} seal={B.rayon + 0.2} />},
      {t0: B.r6 - 0.05, tr: 'black', render: (p) => <Vocal {...p} avion={B.avion} minute={B.minute} vocal={B.vocal} play={[B.maman, B.aime + 0.9]} hour="08:31" batt={batt} />},
      {t0: B.aprem - 0.05, tr: 'black', render: (p) => (
        <LinaJour {...p} radio={B.radio} sheets={[
          {at: B.nom - 0.1, lines: ['LINA', '7 ANS'], x: 330, y: 770, r: -4},
          {at: B.radio, lines: ["J'AI UNE", 'RADIO'], x: 750, y: 780, r: 3},
          {at: B.helico, lines: ['HÉLICO', 'TOITS'], x: 330, y: 1120, r: 2},
          {at: B.dix - 0.1, lines: ['DANS', '10 JOURS'], x: 750, y: 1120, r: -3, red: true},
        ]} />
      )},
      {t0: B.sous - 0.05, tr: 'fade', render: (p) => <ToitSchema {...p} t0={B.sous} />},
      {t0: B.nuit - 0.05, tr: 'black', render: (p) => <PorteNuit {...p} knocks={knocks} />},
      {t0: B.face - 0.05, tr: 'fade', render: (p) => <Fente {...p} t0={B.face} lina />},
      {t0: B.qui - 0.05, tr: 'fade', render: (p) => <PorteNuit {...p} knocks={knocks} push={B.qui} outline={B.barri} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {
      day: 'JOUR 2', floor: 'ÉTAGE 12 · APPART 1204', t0: 0.3, t1: endT - 0.25,
      clock: [
        [0, hm(0, 0)], [B.penche, hm(0, 1)], [B.vitre, hm(0, 2)], [B.toc, hm(0, 4)], [B.matin - 0.3, hm(6, 10), true], [B.matin, hm(6, 40)],
        [B.r5, hm(7, 10)], [B.cartons, hm(7, 10)], [B.r6 - 0.3, hm(8, 20), true], [B.r6, hm(8, 30)], [B.vocal, hm(8, 31)],
        [B.aprem, hm(15, 20)], [B.dix, hm(15, 20)], [B.nuit - 0.3, hm(18, 0), true], [B.nuit, hm(23, 40)], [B.frappe - 0.2, hm(23, 58), true], [B.frappe, hm(23, 59)],
      ],
    },
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 2', y: 560, t0: 31.9, t1: B.matin + 1.6},
    rules: [
      {n: 4, title: 'AUCUNE LUMIÈRE', sub: 'CERTAINS GRIMPENT.', subAt: B.certains, tag: B.comprends, at: B.comprends + 0.5, end: B.r5 - 0.15},
      {n: 5, title: 'OCCULTE TES FENÊTRES', tag: B.r5, at: B.r5t, shrink: B.cartons + 0.4, end: B.r6 - 0.15},
      {n: 6, title: 'ÉCONOMISE TA BATTERIE', tag: B.r6, at: B.r6t, shrink: B.avion + 0.6, end: B.aprem - 0.15},
    ],
    choice: {q: 'ALORS… TU OUVRES ?', a: 'A · J’OUVRE', b: 'B · JE NE BOUGE PAS', tq: B.choix, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'DERNIER ÉTAGE', day: 2, time0: '23:59', time1: '00:00', cta: 'ABONNE-TOI POUR LE JOUR 3', t0: endT, flip: 108.27},
    hideCaps: [[endT, 999]],
    dialog: [{t0: B.maman - 0.05, t1: B.aime + 1.0, label: 'MAMAN · MESSAGE VOCAL'}],
    extra: (
      <>
        <Inventory t0={0.5} t1={endT - 0.25} eau={[[0, 190], [B.matin, 190], [B.matin + 0.8, 186], [B.nuit, 186], [B.nuit + 0.8, 180]]} vivres={[[0, '3 JOURS'], [B.nuit, '2 JOURS']]} batt={[[0, 19], [B.maman, 19], [B.aime + 0.5, 15], [B.nuit, 15], [B.nuit + 0.6, 12]]} />
        <Countdown label="HÉLICO J-10" t0={B.dix} t1={B.choix - 0.35} />
        <MorseCode letters={mine} t1={B.stop - 0.2} />
        <MorseCode letters={hers} t1={B.penche - 0.2} />
        <MorseCode letters={knockL} t1={B.face - 0.2} />
      </>
    ),
  };
});
