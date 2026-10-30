// Bonhomme bâton articulé du style « Survie » : tête ronde sans visage, membres épais à bouts ronds, contour sombre.
// Pose = angles en degrés (0 = vers le bas, 90 = vers la droite, 180 = vers le haut) pour le haut de chaque membre,
// pli relatif pour le bas (coude, genou). Cinématique directe depuis la hanche. Hauteur debout = `h` px.
import React from 'react';
import {lerp} from '../theme';

export type Pose = {
  torso: number; // inclinaison du buste (0 = droit, + = penché vers la droite)
  head: number; // décalage de la tête par rapport au buste
  aL: number; aLb: number; aR: number; aRb: number; // bras gauche / droit (écran) : épaule, coude
  lL: number; lLb: number; lR: number; lRb: number; // jambes : hanche, genou
};
export const P = {
  stand: {torso: 0, head: 0, aL: -10, aLb: 4, aR: 10, aRb: -4, lL: -7, lLb: 0, lR: 7, lRb: 0},
  standArmsDown: {torso: 0, head: 0, aL: -4, aLb: 0, aR: 4, aRb: 0, lL: -5, lLb: 0, lR: 5, lRb: 0},
  // assis par terre, genoux repliés contre la poitrine, bras autour (référence : soirée devant la baie vitrée)
  sitKnees: {torso: -14, head: -6, aL: 62, aLb: 14, aR: 70, aRb: 10, lL: 138, lLb: -112, lR: 128, lRb: -100},
  // assis dans le lit, jambes sous la couette (vers la droite)
  sitBed: {torso: -6, head: -4, aL: 40, aLb: 30, aR: 52, aRb: 20, lL: 88, lLb: 0, lR: 92, lRb: 0},
  lieBed: {torso: -84, head: -2, aL: 80, aLb: 2, aR: 92, aRb: 4, lL: 90, lLb: 0, lR: 94, lRb: 0},
  point: {torso: 4, head: 6, aL: -12, aLb: 4, aR: 128, aRb: -12, lL: -6, lLb: 0, lR: 8, lRb: 0},
  handOnGlass: {torso: 6, head: 12, aL: -10, aLb: 4, aR: 105, aRb: 40, lL: -5, lLb: 0, lR: 8, lRb: 0},
  reach: {torso: 10, head: 4, aL: -8, aLb: 6, aR: 92, aRb: -4, lL: -8, lLb: 0, lR: 10, lRb: 0},
  hold: {torso: 4, head: 0, aL: 40, aLb: 70, aR: 52, aRb: 64, lL: -6, lLb: 0, lR: 7, lRb: 0},
  binoculars: {torso: 2, head: 4, aL: 100, aLb: 112, aR: 110, aRb: 105, lL: -7, lLb: 0, lR: 8, lRb: 0},
  binocularsDown: {torso: 0, head: -4, aL: 34, aLb: 82, aR: 44, aRb: 76, lL: -7, lLb: 0, lR: 8, lRb: 0},
  // vu de dos, coudes écartés, mains au visage (jumelles)
  binoBack: {torso: 0, head: 0, aL: -115, aLb: -118, aR: 115, aRb: 118, lL: -6, lLb: 0, lR: 6, lRb: 0},
  binoLow: {torso: 0, head: -8, aL: -35, aLb: 74, aR: 35, aRb: -74, lL: -6, lLb: 0, lR: 6, lRb: 0},
  climb: {torso: 8, head: 10, aL: 168, aLb: -6, aR: 150, aRb: 30, lL: 40, lLb: -70, lR: -4, lRb: 0},
  sitKneesBino: {torso: -10, head: 2, aL: 100, aLb: 112, aR: 110, aRb: 105, lL: 138, lLb: -112, lR: 128, lRb: -100},
  zombie: {torso: 12, head: 14, aL: 84, aLb: 2, aR: 96, aRb: -4, lL: -6, lLb: 0, lR: 8, lRb: 0},
  flash: {torso: 2, head: 4, aL: -8, aLb: 4, aR: 96, aRb: -6, lL: -6, lLb: 0, lR: 8, lRb: 0},
} satisfies Record<string, Pose>;

const KEYS = ['torso', 'head', 'aL', 'aLb', 'aR', 'aRb', 'lL', 'lLb', 'lR', 'lRb'] as const;
export const mix = (a: Pose, b: Pose, k: number): Pose => Object.fromEntries(KEYS.map((n) => [n, lerp(a[n], b[n], k)])) as Pose;
/** cycle de marche (phase en tours) : jambes ± amp, genou qui plie au passage, bras en opposition */
export const walk = (phase: number, amp = 26, base: Pose = P.stand, lean = 4): Pose => {
  const s = Math.sin(phase * Math.PI * 2), c = Math.cos(phase * Math.PI * 2);
  return {
    ...base,
    torso: base.torso + lean,
    lL: amp * s, lLb: -Math.max(0, -c) * amp * 1.4,
    lR: -amp * s, lRb: -Math.max(0, c) * amp * 1.4,
    aL: base.aL - amp * 0.7 * s, aLb: Math.abs(s) * 18,
    aR: base.aR + amp * 0.7 * s, aRb: -Math.abs(s) * 18,
  };
};
export const run = (phase: number) => walk(phase, 46, {...P.stand, aL: -20, aR: 20}, 16);
/** démarche d'infecté : bras tendus, pas courts et traînants */
export const shamble = (phase: number) => {
  const s = Math.sin(phase * Math.PI * 2);
  return {...P.zombie, lL: 16 * s, lLb: -Math.max(0, -s) * 22, lR: -16 * s, lRb: -Math.max(0, s) * 22, aL: 84 + 6 * s, aR: 96 - 6 * s, head: 14 + 6 * Math.sin(phase * Math.PI * 4)};
};

export type Look = 'cream' | 'rimOrange' | 'rimBlue' | 'zombie' | 'runner' | 'dark';
const LOOKS: Record<Look, {fill: string; line: string; glow?: string}> = {
  cream: {fill: '#EFE9DA', line: '#3B342D'},
  rimOrange: {fill: '#16131A', line: '#F2963E', glow: 'rgba(255,140,50,0.85)'},
  rimBlue: {fill: '#0F1120', line: '#6F8BFF', glow: 'rgba(110,140,255,0.8)'},
  zombie: {fill: '#A9C08F', line: '#26301F'},
  runner: {fill: '#F6F6F2', line: '#22201E'},
  dark: {fill: '#2A2730', line: '#121016'},
};

const rad = (d: number) => (d * Math.PI) / 180;
/** point au bout d'un segment de longueur L partant de (x, y) selon l'angle a (0 = vers le bas) */
const seg = (x: number, y: number, a: number, L: number): [number, number] => [x + Math.sin(rad(a)) * L, y + Math.cos(rad(a)) * L];

/** squelette → points (hanche en 0,0) */
export const bones = (p: Pose, h: number) => {
  const T = 0.34 * h, N = 0.05 * h, R = 0.088 * h, UA = 0.175 * h, FA = 0.16 * h, TH = 0.225 * h, SH = 0.215 * h;
  const hip: [number, number] = [0, 0];
  const neck = seg(0, 0, 180 - p.torso, T);
  const headC = seg(neck[0], neck[1], 180 - p.torso - p.head, N + R);
  const sh = seg(0, 0, 180 - p.torso, T * 0.9);
  const eL = seg(sh[0], sh[1], p.aL, UA), hL = seg(eL[0], eL[1], p.aL + p.aLb, FA);
  const eR = seg(sh[0], sh[1], p.aR, UA), hR = seg(eR[0], eR[1], p.aR + p.aRb, FA);
  const kL = seg(0, 0, p.lL, TH), fL = seg(kL[0], kL[1], p.lL + p.lLb, SH);
  const kR = seg(0, 0, p.lR, TH), fR = seg(kR[0], kR[1], p.lR + p.lRb, SH);
  return {hip, neck, headC, R, sh, eL, hL, eR, hR, kL, fL, kR, fR};
};

/** dessine le bonhomme : (x, y) = position des pieds au repos (la hanche est à 0,44 h au-dessus) */
export const Stick: React.FC<{p: Pose; x: number; y: number; h: number; look?: Look; flip?: boolean; rot?: number; shade?: number; opacity?: number; hipY?: number; id?: string; extra?: React.ReactNode}> = ({
  p, x, y, h, look = 'cream', flip = false, rot = 0, shade = 0, opacity = 1, hipY, id = 's', extra,
}) => {
  const b = bones(p, h);
  const L = LOOKS[look];
  const w = 0.048 * h, o = Math.max(1.5, 0.011 * h);
  const fill = shade > 0 ? mixHex(L.fill, '#101018', shade) : L.fill;
  const back = mixHex(fill, '#000000', look === 'cream' || look === 'runner' ? 0.12 : 0.05);
  const pts = (a: [number, number][]) => a.map((q) => q.join(',')).join(' ');
  const limb = (a: [number, number][], f: string, key: string) => (
    <g key={key}>
      <polyline points={pts(a)} fill="none" stroke={L.line} strokeWidth={w + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts(a)} fill="none" stroke={f} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
  const hy = hipY ?? -(0.437 * h);
  const glow = L.glow ? `drop-shadow(0 0 ${0.02 * h}px ${L.glow})` : undefined;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${flip ? -1 : 1},1) translate(0,${hy})`} opacity={opacity} style={glow ? {filter: glow} : undefined} data-id={id}>
      {limb([b.hip, b.kL, b.fL], back, 'lL')}
      {limb([b.sh, b.eL, b.hL], back, 'aL')}
      {limb([b.hip, b.neck], fill, 't')}
      <circle cx={b.headC[0]} cy={b.headC[1]} r={b.R + o} fill={L.line} />
      <circle cx={b.headC[0]} cy={b.headC[1]} r={b.R} fill={fill} />
      {extra}
      {limb([b.hip, b.kR, b.fR], fill, 'lR')}
      {limb([b.sh, b.eR, b.hR], fill, 'aR')}
    </g>
  );
};

/** mélange de deux couleurs #rrggbb */
export const mixHex = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join('');
};
