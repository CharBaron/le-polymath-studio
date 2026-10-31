import {makeEpisode} from '../survie/Episode';
import {FirstCap, Interphone, PlanLigne, Portes, Quai, RAME_CAM, RameQuai, Reflet, TFinFond, TInventory, Voiture} from '../survie/terminus';
import {easeInOut, lerp, prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;
/** caméra entre deux cadrages {x, y, z} */
const camK = (T: number, keys: [number, {x: number; y: number; z: number}][]) => {
  let i = 0;
  while (i + 1 < keys.length && T >= keys[i + 1][0]) i++;
  const [t0, a] = keys[i], nx = keys[i + 1];
  if (!nx) return a;
  const k = prog(T, t0, nx[0], easeInOut);
  return {x: lerp(a.x, nx[1].x, k), y: lerp(a.y, nx[1].y, k), z: lerp(a.z, nx[1].z, k)};
};
/** néon qui claque : quelques éclats puis plus rien entre `off` et `on`, retour en grésillant */
const blackout = (T: number, off: number, on: number) => {
  if (T < off) return 1;
  if (T < off + 0.45) return Math.floor((T - off) * 18) % 3 === 0 ? 1 : 0.05;
  if (T < on) return 0;
  if (T < on + 0.6) return Math.floor((T - on) * 16) % 2 ? 1 : 0.15;
  return 1;
};

// 38 — « TERMINUS », jour 1 (pilote kairos, 63 s). Dernier métro, 1 h 12 : la rame s'arrête dans une station qui n'existe sur
// aucun plan. L'annonce du quai : « Terminus. Personne ne descend. » Règles 1 à 3 au haut-parleur, le néon claque, vous êtes
// quatre, quelqu'un murmure ton prénom. Puis « le conducteur » à l'interphone : « Descendez ! » Deux voix, deux ordres : A ou B.
export const Terminus1 = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const CLOCK: [number, number, boolean?][] = [[0, hm(1, 12)], [B.portes, hm(1, 13)], [B.r2, hm(1, 15)], [B.r3, hm(1, 17)], [B.clac, hm(1, 18)], [B.inter, hm(1, 20)], [B.choix, hm(1, 21)]];
  const ANN = 'ANNONCE · HAUT-PARLEUR DU QUAI';
  return {
    scenes: [
      {t0: 0, render: (p) => <Quai {...p} tilt={B.h3 - 0.6} out={B.h3 + 0.3} />},
      {t0: B.h3 - 0.15, tr: 'black', d: 0.18, render: (p) => <PlanLigne {...p} t0={B.h3 - 0.15} stop={B.h3 + 0.85} />},
      {t0: B.dil - 0.1, tr: 'fade', render: (p) => <RameQuai {...p} t0={B.dil - 0.1} hold={B.dil + 1.4} />},
      {
        t0: B.toi - 0.1, tr: 'black', render: (p) => (
          <Voiture {...p} cam={camK(p.T, [[B.toi - 0.1, {x: 410, y: 1000, z: 1.45}], [B.batt - 0.2, {x: 440, y: 1080, z: 1.75}], [B.trois - 0.1, {x: 880, y: 990, z: 0.86}], [B.portes, {x: 900, y: 990, z: 0.9}]])} s={{L: 1, out: 0.85, phone: 1, four: 0, lean: 0, doors: 0}} />
        ),
      },
      {t0: B.portes - 0.05, tr: 'fade', render: (p) => <Portes {...p} open={[B.portes + 0.1, B.portes + 0.9]} speak={[[B.hp, B.pers + 1.0], [B.r1, B.traces - 0.1]]} steps={[B.traces, B.porte + 0.4]} />},
      {t0: B.r2 - 0.05, tr: 'black', render: (p) => <Reflet {...p} t0={B.r2} jumps={[[B.vitre, 14], [B.approche, 7.5], [B.approche + 0.85, 2.7]]} />},
      {
        t0: B.r3 - 0.05, tr: 'black', render: (p) => (
          <Voiture {...p} cam={camK(p.T, [[B.r3, {x: 840, y: 1000, z: 0.84}], [B.clac, {x: 820, y: 990, z: 0.9}]])} s={{L: 1, out: 0.85, phone: 0, four: 0, lean: 0, doors: 1, count: [{at: B.un, who: 0}, {at: B.deux, who: 1}, {at: B.trois2, who: 2}]}} />
        ),
      },
      {
        t0: B.clac, tr: 'cut', render: (p) => {
          const L = blackout(p.T, B.clac + 0.05, B.revient);
          return (
            <Voiture {...p} cam={camK(p.T, [[B.clac, {x: 560, y: 1040, z: 1.2}], [B.quatre, {x: 500, y: 1010, z: 1.4}], [B.prenom, {x: 480, y: 960, z: 1.75}], [B.inter, {x: 470, y: 940, z: 1.85}]])}
              s={{L, out: L * 0.85, phone: p.T >= B.noir - 0.3 ? 1 : 0, four: p.T >= B.revient ? 1 : 0, lean: prog(p.T, B.prenom - 0.4, B.prenom + 0.9), doors: 1, shake: p.T < B.clac + 0.5 ? 1 : 0, walk: [B.pas - 0.1, B.revient - 0.1], count: [{at: B.quatre + 0.1, who: 3, until: B.prenom + 0.3}]}} />
          );
        },
      },
      {t0: B.inter - 0.05, tr: 'glitch', render: (p) => <Interphone {...p} t0={B.inter} talk={[B.inter, B.ferme - 0.1]} shout={B.desc} />},
      {t0: B.ferme - 0.05, tr: 'cut', render: (p) => <Portes {...p} open={[-10, -9]} close={[B.ferme, endT]} hand={B.choix - 0.2} dark={0.35 * prog(p.T, B.qui - 0.3, B.qui + 0.4)} />},
      {t0: endT, tr: 'black', render: (p) => <TFinFond {...p} />},
    ],
    hud: {day: 'JOUR 1', floor: 'DERNIER MÉTRO · VOITURE 5', t0: B.h1 - 0.05, t1: endT - 0.25, clock: CLOCK},
    series: {name: 'TERMINUS', day: 'JOUR 1', y: 290, t0: B.dil + 0.1, t1: B.toi - 0.35},
    pin: {text: 'TOI · VOITURE 5', x: 540 + (1548 - RAME_CAM.x) * 0.9, y: 960 + (820 - RAME_CAM.y) * 0.9, t0: B.voix - 0.3, t1: B.toi - 0.3},
    rules: [
      {n: 1, title: 'RESTE DANS LA RAME', tag: B.r1, at: B.r1t, shrink: B.traces, end: B.r2 - 0.15},
      {n: 2, title: 'NE REGARDE PAS LE QUAI', tag: B.r2, at: B.r2t, shrink: B.yeux, end: B.r3 - 0.15},
      {n: 3, title: 'COMPTE LES PASSAGERS', sub: 'UN DE PLUS ?', subAt: B.plus, tag: B.r3, at: B.r3t, shrink: B.un - 0.2, end: B.clac - 0.1},
      {n: 3, title: 'NE LUI RÉPONDS PAS', redacted: true, tag: B.prenom + 0.4, at: B.prenom + 1.2, end: B.inter - 0.15},
    ],
    choice: {q: 'TU OBÉIS À QUI ?', a: 'A · JE RESTE DANS LA RAME', b: 'B · JE DESCENDS SUR LE QUAI', tq: B.qui - 0.05, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'TERMINUS', day: 1, time0: '01:21', time1: '01:12', cta: 'ABONNE-TOI POUR LE JOUR 2', t0: endT, flip: B.flip},
    hideCaps: [[endT, 999]],
    dialog: [
      {t0: B.hp - 0.05, t1: B.pers + 1.0, label: ANN},
      {t0: B.r1 - 0.05, t1: B.traces - 0.1, label: ANN},
      {t0: B.r2 - 0.05, t1: B.yeux - 0.1, label: ANN},
      {t0: B.r3 - 0.05, t1: B.un - 0.1, label: ANN},
      {t0: B.inter - 0.05, t1: B.ferme - 0.1, label: '« LE CONDUCTEUR » · INTERPHONE'},
    ],
    extra: (
      <>
        <FirstCap text="IMAGINE…" until={B.h - 0.03} />
        <TInventory t0={B.toi + 0.2} t1={endT - 0.25} batt={[[0, 9], [B.noir, 8], [B.choix, 7]]} net={0} pax={[[0, 3], [B.quatre + 0.1, 4]]} hot={[[B.batt, 'batt'], [B.reseau, 'net'], [B.trois, 'pax'], [B.trois2, 'pax']]} />
      </>
    ),
  };
});
