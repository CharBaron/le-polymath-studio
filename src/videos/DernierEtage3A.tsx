import {makeEpisode} from '../survie/Episode';
import {stride} from '../survie/hero';
import {FinFond} from '../survie/scenesC';
import {PorteNuit} from '../survie/scenesE';
import {Calcul, Palier, Renfort, SonSchema, Voisin} from '../survie/scenesF';
import {P} from '../survie/stick';
import {Countdown, Inventory, morseSpans, MorseCode} from '../survie/ui';
import {lerp, prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

// 27 — « Dernier étage », jour 3, branche « j'ouvre ». Valable pour les deux branches du jour 1 (Lina n'apparaît pas).
// Tu défais la barricade, le palier est vide, la trappe du toit ouverte… et la voix de ta mère, mot pour mot ton message vocal.
// Ils imitent. Règles 7 (plus aucun son) et 8 (renforce la barricade), demi-ration, la voix du voisin du 11e : vraie ou apprise ?
export const DernierEtage3A = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const knockL = morseSpans(B.frappe + 0.4, 'SOS', 0.09);
  const knocks = knockL.flatMap((l) => l.on.map(([a]) => a));
  const CLOCK: [number, number, boolean?][] = [[0, hm(0, 1)], [B.ouvre, hm(0, 5)], [B.claque, hm(0, 6)], [B.matin - 0.3, hm(6, 0), true], [B.matin, hm(6, 30)], [B.r8, hm(9, 10)], [B.vis, hm(9, 10)], [B.compte - 0.3, hm(11, 30), true], [B.compte, hm(12, 0)], [B.aprem - 0.3, hm(16, 40), true], [B.aprem, hm(17, 0)], [B.choix, hm(17, 6)]];
  const SERIES0 = B.claque + 0.3, FLIP = 76.33, KNOCK_END = B.ouvre - 0.2, MAMAN_LABEL = '« MAMAN » · PAR LA TRAPPE';
  return {
    scenes: [
      {
        t0: 0, render: (p) => {
          const T = p.T;
          const kc = prog(T, B.cana, B.cana + 1.6);
          const couch = lerp(104, 560, kc);
          const s = stride(kc * 1.6, 18, {...P.stand, aL: -60, aR: 60});
          const hero = T < B.arm ? {x: 560, pose: {...P.reach, aR: 120, aRb: -10}}
            : T < B.cana ? {x: 560, pose: {...P.stand, aL: -150, aLb: -10, aR: 150, aRb: 10, head: -6}}
            : {x: couch + 470, pose: kc < 1 ? s.pose : {...P.stand, head: 6}};
          return <PorteNuit {...p} knocks={knocks} arm={lerp(-23.5, 0, prog(T, B.arm, B.arm + 0.9))} couch={couch} items={1 - prog(T, B.h + 0.4, B.arm - 0.1)} hero={{...hero, y: 1700}} />;
        },
      },
      {t0: B.ouvre - 0.05, tr: 'fade', render: (p) => <Palier {...p} t0={B.ouvre} voice={B.voix} fingers={B.doigts} slam={B.claque} />},
      {t0: B.matin - 0.05, tr: 'black', render: (p) => <PorteNuit {...p} knocks={[]} items={0.6} hero={{x: 560, pose: {...P.stand, torso: -14, aL: -95, aR: -80, aRb: 10}, y: 1700}} />},
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
