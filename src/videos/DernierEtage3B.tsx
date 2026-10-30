import {makeEpisode} from '../survie/Episode';
import {FinFond} from '../survie/scenesC';
import {PorteNuit} from '../survie/scenesE';
import {Calcul, Renfort, SonSchema, Voisin} from '../survie/scenesF';
import {Countdown, Inventory, morseSpans, MorseCode} from '../survie/ui';
import {prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

// 28 — « Dernier étage », jour 3, branche « je ne bouge pas ». Valable pour les deux branches du jour 1 (Lina n'apparaît pas).
// Les coups s'arrêtent… et contre la porte, la voix de ta mère, mot pour mot ton message vocal, toute la nuit. Ils imitent.
// Règles 7 (plus aucun son) et 8 (renforce la barricade), demi-ration, la voix du voisin du 11e : vraie ou apprise ?
export const DernierEtage3B = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const knockL = morseSpans(B.frappe + 0.2, 'SOS', 0.09);
  const knocks = knockL.flatMap((l) => l.on.map(([a]) => a));
  const CLOCK: [number, number, boolean?][] = [[0, hm(0, 0)], [B.stop, hm(0, 1)], [B.voix, hm(0, 4)], [B.nuit, hm(0, 30)], [B.matin - 0.3, hm(6, 10), true], [B.matin, hm(6, 30)], [B.r8, hm(9, 10)], [B.vis, hm(9, 10)], [B.compte - 0.3, hm(11, 30), true], [B.compte, hm(12, 0)], [B.aprem - 0.3, hm(16, 40), true], [B.aprem, hm(17, 0)], [B.choix, hm(17, 6)]];
  const SERIES0 = B.encore + 0.6, FLIP = 63.25, KNOCK_END = B.stop + 0.4, MAMAN_LABEL = '« MAMAN » · DERRIÈRE LA PORTE';
  return {
    scenes: [
      {t0: 0, render: (p) => <PorteNuit {...p} knocks={knocks} push={B.voix} voice={[[B.maman - 0.1, B.ta], [B.nuit + 0.2, B.matin - 0.3]]} />},
      {t0: B.matin - 0.05, tr: 'fade', render: (p) => <PorteNuit {...p} knocks={[]} />},
      {t0: B.comprends - 0.05, tr: 'fade', render: (p) => <SonSchema {...p} t0={B.comprends} echo={B.imitent} ear={B.ecoutent} learn={B.apprennent} />},
      {t0: B.r8 - 0.05, tr: 'black', render: (p) => <Renfort {...p} t0={B.r8} screws={B.vis} done={B.tient + 0.6} />},
      {t0: B.compte - 0.05, tr: 'fade', render: (p) => <Calcul {...p} two={B.deux} nine={B.neuf} half={B.demi} />},
      {t0: B.aprem - 0.05, tr: 'black', render: (p) => <Voisin {...p} t0={B.aprem} talk={[B.ferrand - 0.2, B.vrai - 0.1]} doubt={B.vrai} dark={0.5 * prog(p.T, B.choix, B.choix + 0.6)} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {day: 'JOUR 3', floor: 'ÉTAGE 12 · APPART 1204', t0: 0.3, t1: endT - 0.25, clock: CLOCK},
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 3', y: 560, t0: SERIES0, t1: B.matin + 1.3},
    rules: [
      {n: 7, title: 'PLUS AUCUN SON', sub: 'ILS APPRENNENT.', subAt: B.apprennent, tag: B.r7, at: B.r7t, end: B.r8 - 0.15},
      {n: 8, title: 'RENFORCE LA BARRICADE', tag: B.r8, at: B.r8t, shrink: B.vis + 0.3, end: B.compte - 0.15},
    ],
    choice: {q: 'ALORS… TU LUI RÉPONDS ?', a: 'A · JE LUI RÉPONDS', b: 'B · JE ME TAIS', tq: B.choix, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'DERNIER ÉTAGE', day: 3, time0: '17:06', time1: '00:00', cta: 'ABONNE-TOI POUR LE JOUR 4', t0: endT, flip: FLIP},
    hideCaps: [[endT, 999]],
    dialog: [{t0: B.maman - 0.05, t1: B.ta - 0.1, label: MAMAN_LABEL}, {t0: B.ferrand - 0.3, t1: B.vrai - 0.1, label: '« FERRAND » · 11E ÉTAGE'}],
    extra: (
      <>
        <Inventory t0={0.5} t1={endT - 0.25} eau={[[0, 180], [B.matin, 180], [B.matin + 0.8, 176]]} vivres={[[0, '2 JOURS'], [B.demi + 0.9, '½ RATION']]} batt={[[0, 12], [B.comprends, 12], [B.comprends + 0.6, 10]]} />
        <Countdown label="HÉLICO J-9" t0={0.6} t1={B.choix - 0.35} />
        <MorseCode letters={knockL} t1={KNOCK_END} />
      </>
    ),
  };
});
