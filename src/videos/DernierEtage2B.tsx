// 26 — « Dernier étage », jour 2, branche B (au jour 1, la majorité est restée dans le noir).
// Script et bible : « Vidéo Prête et Publication/Dernier étage/ ». La lampe de Lina tombe, quelque chose tapote à ta vitre, au matin
// sa fenêtre est brisée et « IL GRIMPE » est écrit sur son mur (elle te prévenait), règles 5 et 6, Maman, alerte d'évacuation
// (hélico dans 10 jours), à minuit on frappe en morse : personne d'autre ne connaît ce signal… sauf elle.
import {makeEpisode} from '../survie/Episode';
import {FinFond} from '../survie/scenesC';
import {Brisee, Fente, LampeTombe, Occulter, PorteNuit, ToitSchema, Traces, Vitre, Vocal} from '../survie/scenesE';
import {Countdown, Inventory, morseSpans, MorseCode} from '../survie/ui';
import {lerp, prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

export const DernierEtage2B = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const hers = [...morseSpans(0, 'SOS', 0.065, [B.insiste + 0.05, B.insiste + 0.55, B.insiste + 1.45]), ...morseSpans(0, 'SOS', 0.1, [B.s1 + 0.05, B.s2 + 0.05, B.s3 + 0.05])];
  const knockL = morseSpans(0, 'SOS', 0.09, [B.k1 + 0.05, B.k2 + 0.05, B.k3 + 0.05]);
  const knocks = knockL.flatMap((l) => l.on.map(([a]) => a));
  const batt = (t: number) => lerp(19, 15, prog(t, B.maman, B.aime + 0.5));
  return {
    scenes: [
      {t0: 0, render: (p) => <LampeTombe {...p} hers={hers} steadyUntil={0} fall={B.tombe} out={B.eteint + 0.1} />},
      {t0: B.vitre - 0.05, tr: 'fade', render: (p) => <Vitre {...p} appear={B.vitre + 1.3} fingers={B.vitre + 0.1} taps={[B.toc, B.toc2, B.toc3]} meter={B.douze} />},
      {t0: B.matin - 0.05, tr: 'white', d: 0.4, render: (p) => <Traces {...p} pull={B.matin + 1.4} />},
      {t0: B.brisee - 0.05, tr: 'fade', render: (p) => <Brisee {...p} wall={B.mur} hit={B.ilgrimpe} />},
      {t0: B.comprends - 0.05, tr: 'fade', render: (p) => <Traces {...p} pull={B.comprends - 3} enter={B.comprends + 0.2} />},
      {t0: B.r5 - 0.05, tr: 'fade', render: (p) => <Occulter {...p} t0={B.r5} seal={B.rayon + 0.2} />},
      {t0: B.r6 - 0.05, tr: 'black', render: (p) => <Vocal {...p} avion={B.avion} minute={B.minute} vocal={B.vocal} play={[B.maman, B.aime + 0.3]} alert={{at: B.alerte, evac: B.evac, dix: B.dix}} hour="08:31" batt={batt} />},
      {t0: B.sous - 0.05, tr: 'fade', render: (p) => <ToitSchema {...p} t0={B.sous} />},
      {t0: B.nuit - 0.05, tr: 'black', render: (p) => <PorteNuit {...p} knocks={knocks} />},
      {t0: B.signal - 0.05, tr: 'fade', render: (p) => <Fente {...p} t0={B.signal} lina={false} />},
      {t0: B.sauf - 0.05, tr: 'fade', render: (p) => <PorteNuit {...p} knocks={knocks} push={B.sauf} outline={B.barri} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {
      day: 'JOUR 2', floor: 'ÉTAGE 12 · APPART 1204', t0: 0.3, t1: endT - 0.25,
      clock: [
        [0, hm(0, 0)], [B.tombe, hm(0, 1)], [B.vitre, hm(0, 3)], [B.toc, hm(0, 4)], [B.matin - 0.3, hm(6, 10), true], [B.matin, hm(6, 40)],
        [B.r5, hm(7, 10)], [B.cartons, hm(7, 10)], [B.r6 - 0.3, hm(8, 20), true], [B.r6, hm(8, 30)], [B.vocal, hm(8, 31)], [B.alerte, hm(8, 32)],
        [B.dix, hm(8, 32)], [B.nuit - 0.3, hm(18, 0), true], [B.nuit, hm(23, 40)], [B.frappe - 0.2, hm(23, 58), true], [B.frappe, hm(23, 59)],
      ],
    },
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 2', y: 560, t0: B.toc3 + 0.45, t1: B.matin + 1.4},
    rules: [
      {n: 4, title: 'AUCUNE LUMIÈRE', sub: 'CERTAINS GRIMPENT.', subAt: B.certains, tag: B.comprends, at: B.comprends + 0.5, end: B.r5 - 0.15},
      {n: 5, title: 'OCCULTE TES FENÊTRES', tag: B.r5, at: B.r5t, shrink: B.cartons + 0.4, end: B.r6 - 0.15},
      {n: 6, title: 'ÉCONOMISE TA BATTERIE', tag: B.r6, at: B.r6t, shrink: B.avion + 0.6, end: B.alerte - 0.1},
    ],
    choice: {q: 'ALORS… TU OUVRES ?', a: 'A · J’OUVRE', b: 'B · JE NE BOUGE PAS', tq: B.choix, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'DERNIER ÉTAGE', day: 2, time0: '23:59', time1: '00:00', cta: 'ABONNE-TOI POUR LE JOUR 3', t0: endT, flip: B.flip},
    hideCaps: [[endT, 999]],
    dialog: [{t0: B.maman - 0.05, t1: B.aime + 0.35, label: 'MAMAN · MESSAGE VOCAL'}],
    extra: (
      <>
        <Inventory t0={0.5} t1={endT - 0.25} eau={[[0, 190], [B.matin, 190], [B.matin + 0.8, 186], [B.nuit, 186], [B.nuit + 0.8, 180]]} vivres={[[0, '3 JOURS'], [B.nuit, '2 JOURS']]} batt={[[0, 19], [B.maman, 19], [B.aime + 0.5, 15], [B.nuit, 15], [B.nuit + 0.6, 12]]} />
        <Countdown label="HÉLICO J-10" t0={B.dix} t1={B.choix - 0.35} />
        <MorseCode letters={hers.slice(3)} t1={B.tombe - 0.1} />
        <MorseCode letters={knockL} t1={B.signal - 0.2} />
      </>
    ),
  };
});
