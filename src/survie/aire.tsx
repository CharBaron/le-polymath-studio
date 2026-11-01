// « AIRE 13 » (kairos) : 2 h du matin, une aire d'autoroute dans le brouillard, toutes les voitures tournent, personne dedans.
// Le parking est UN monde en 3D (mètres, sol Y = 0, voitures nez vers +Z) vu par une caméra en perspective avec plongée : tous
// les plans du parking montrent la même géographie. Voitures en volumes (caisse + habitacle, faces cachées éliminées), faisceaux
// de phares en volume dans le brouillard, pluie visible seulement dans la lumière, échappements, lampadaires au sodium, boutique,
// pylône, et « ceux qui attendent » au bout de chaque faisceau. Tout est fonction du temps (déterministe).
import React from 'react';
import {clamp01, lerp, rand} from '../theme';
import type {Light} from './hero';
import {Figure, LOOKS} from './rider';
import {mixHex, Pose} from './stick';
import {SF} from './ui';
import {Blurs} from './world';

type Pt = [number, number];
const pts = (a: Pt[]) => a.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');

// ---------------- caméra ----------------
/** x, y (hauteur), z en mètres ; pitch = plongée en degrés ; F = focale en px ; VX, VY = centre optique à l'écran */
export type ACam = {x: number; y: number; z: number; pitch?: number; F: number; VX?: number; VY?: number; roll?: number};
export type Pr = {x: number; y: number; d: number; s: number};
export const project = (c: ACam, X: number, Y: number, Z: number): Pr => {
  const th = ((c.pitch ?? 0) * Math.PI) / 180, cs = Math.cos(th), sn = Math.sin(th);
  const dx = X - c.x, dy = Y - c.y, dz = Z - c.z;
  const yy = dy * cs + dz * sn, zz = Math.max(0.05, dz * cs - dy * sn);
  const s = c.F / zz;
  return {x: (c.VX ?? 540) + dx * s, y: (c.VY ?? 960) - yy * s, d: zz, s};
};
const P2 = (c: ACam, X: number, Y: number, Z: number): Pt => {
  const p = project(c, X, Y, Z);
  return [p.x, p.y];
};
/** enveloppe convexe (chaîne monotone) : contour d'un faisceau projeté */
const hull = (a: Pt[]): Pt[] => {
  const p = a.slice().sort((u, v) => u[0] - v[0] || u[1] - v[1]);
  const cr = (o: Pt, u: Pt, v: Pt) => (u[0] - o[0]) * (v[1] - o[1]) - (u[1] - o[1]) * (v[0] - o[0]);
  const lo: Pt[] = [], up: Pt[] = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};

// ---------------- palette ----------------
export const AC = {
  fog: '#6B798E', fogHi: '#A3AEBD', sky: '#1C2433', asphalt: '#171A20', beam: '#FFF1D2', tail: '#FF3B30', sodium: '#FF9A3C',
  shop: '#CFF5E4', dash: '#5CFFB0', line: '#C9CCC6',
};
/** brouillard : part de la couleur du brouillard à la distance d (m) */
export const fogK = (d: number, k = 1) => clamp01((1 - Math.exp(-d / 24)) * 0.92 * k);
const fogged = (c: string, d: number, k = 1) => mixHex(c, AC.fog, fogK(d, k));

// ---------------- la scène ----------------
export type CarSpec = {
  id: string; x: number; z: number; color: string; kind: 'hatch' | 'sedan' | 'van' | 'break';
  /** phares (0-1, s'éteignent en tremblant), feux arrière, échappement, portière conducteur ouverte (0-1), plafonnier */
  lights: number; tail?: number; exhaust?: number; door?: number; dome?: number;
  /** secousse (calage), quelqu'un au volant (tête trop haute dans la lunette arrière), flou de premier plan */
  shake?: number; driver?: number; blur?: number;
  /** liseré de contre-jour forcé (voiture éteinte dans la lumière des autres) */
  rim?: number;
  /** poche de noir là où devrait être le faisceau (0-1) quand les phares sont éteints */
  hole?: number;
  /** longueur du faisceau (m) */
  reach?: number;
};
export type Walker = {x: number; z: number; p: Pose; flip?: boolean; h?: number; o?: number; light?: Light; view?: 'side' | 'back' | 'front';
  /** ombre portée vers le fond (m) quand un faisceau l'éclaire de dos */
  cast?: number};
export type LotProps = {
  T: number; cam: ACam; cars: CarSpec[];
  /** ceux qui attendent (au bout des faisceaux) et toi */
  them?: Walker[]; toi?: Walker | null;
  rain?: number; uid: string;
  /** voile de brouillard devant (0-1) et éclairage d'ensemble (assombrit, 1 = normal) */
  haze?: number; expo?: number;
  /** pylône AIRE 13 et boutique visibles */
  pylon?: boolean; shop?: boolean;
  /** gouttes qui font des ronds dans les flaques au premier plan (plan au ras du sol) */
  ripples?: boolean;
};

const CAR_DIM = {
  hatch: {L: 4.0, W: 1.74, H0: 0.24, H1: 0.9, H2: 1.44, c0: 0.3, c1: 2.95, ins: 0.15, sr: 0.32, sf: 0.75},
  sedan: {L: 4.6, W: 1.8, H0: 0.22, H1: 0.88, H2: 1.42, c0: 0.95, c1: 3.4, ins: 0.16, sr: 0.55, sf: 0.75},
  break: {L: 4.5, W: 1.78, H0: 0.24, H1: 0.9, H2: 1.46, c0: 0.2, c1: 3.3, ins: 0.14, sr: 0.12, sf: 0.75},
  van: {L: 4.9, W: 1.9, H0: 0.28, H1: 1.0, H2: 1.98, c0: 0.0, c1: 3.75, ins: 0.06, sr: 0.0, sf: 0.55},
};
export const carFront = (c: CarSpec) => c.z + CAR_DIM[c.kind].L;

type Item = {d: number; n: React.ReactNode};

/** une boîte (x0..x1, y0..y1, z0..z1), sommet rétréci de `ins` sur les côtés ; faces visibles seulement */
const boxFaces = (cam: ACam, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, ins: number, col: {rear: string; side: string; top: string; front?: string}, key: string, stroke: string, zt0 = z0, zt1 = z1) => {
  const out: React.ReactNode[] = [];
  const q = (a: [number, number, number][]) => a.map((v) => P2(cam, v[0], v[1], v[2]));
  const xt0 = x0 + ins, xt1 = x1 - ins;
  // face arrière inclinée : visible si la caméra est derrière son plan (test sur le milieu de la face)
  const behind = (za: number, zb: number) => {
    const ny = za - zb, nz = y1 - y0; // normale (vers l'arrière) de la face qui va de (y0, za) à (y1, zb)
    return (cam.y - (y0 + y1) / 2) * ny + (cam.z - (za + zb) / 2) * -nz > 0;
  };
  if (behind(z0, zt0)) out.push(<polygon key={key + 'r'} points={pts(q([[x0, y0, z0], [x1, y0, z0], [xt1, y1, zt0], [xt0, y1, zt0]]))} fill={col.rear} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />);
  if (cam.z > z1) out.push(<polygon key={key + 'f'} points={pts(q([[x0, y0, z1], [x1, y0, z1], [xt1, y1, zt1], [xt0, y1, zt1]]))} fill={col.front ?? col.rear} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />);
  if (cam.x < x0) out.push(<polygon key={key + 'l'} points={pts(q([[x0, y0, z0], [x0, y0, z1], [xt0, y1, zt1], [xt0, y1, zt0]]))} fill={col.side} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />);
  if (cam.x > x1) out.push(<polygon key={key + 'd'} points={pts(q([[x1, y0, z0], [x1, y0, z1], [xt1, y1, zt1], [xt1, y1, zt0]]))} fill={col.side} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />);
  if (cam.y > y1) out.push(<polygon key={key + 't'} points={pts(q([[xt0, y1, zt0], [xt1, y1, zt0], [xt1, y1, zt1], [xt0, y1, zt1]]))} fill={col.top} stroke={stroke} strokeWidth={1.2} strokeLinejoin="round" />);
  return out;
};

/** une voiture vue de l'arrière (ou de côté) : ombre de contact, caisse, habitacle, vitres, feux, roues, portière ouverte */
const Car: React.FC<{cam: ACam; c: CarSpec; T: number}> = ({cam, c, T}) => {
  const D = CAR_DIM[c.kind];
  const sh = c.shake ? (rand(Math.floor(T * 30) * 3.1 + c.x) - 0.5) * 0.035 * c.shake : 0;
  const idle = (c.exhaust ?? 1) * 0.004 * Math.sin(T * 47 + c.x); // le moteur au ralenti fait trembler la caisse
  const x0 = c.x - D.W / 2 + sh, x1 = c.x + D.W / 2 + sh, z0 = c.z, z1 = c.z + D.L;
  const yb = idle;
  const mid = project(cam, c.x, 0.7, (z0 + z1) / 2);
  const fk = (k = 1) => (col: string) => fogged(col, mid.d, k);
  const base = c.color;
  // contre-jour : les phares éclairent devant, la face arrière est dans l'ombre ; le toit prend la lueur du brouillard
  const body = {rear: fk()(mixHex(base, '#05060A', 0.62)), side: fk()(mixHex(base, '#05060A', 0.45)), top: fk()(mixHex(mixHex(base, '#05060A', 0.25), AC.fogHi, 0.3))};
  const glass = fk(0.7)('#0D1218');
  const stroke = fk()('#07080A');
  const tail = c.tail ?? (c.lights > 0.05 ? 1 : 0);
  const n: React.ReactNode[] = [];
  // caisse puis habitacle (vitres)
  n.push(...boxFaces(cam, x0, x1, D.H0 + yb, D.H1 + yb, z0, z1, 0.05, body, c.id + 'b', stroke));
  const cab = boxFaces(cam, x0 + 0.04, x1 - 0.04, D.H1 + yb, D.H2 + yb, z0 + D.c0, z0 + D.c1, D.ins, {rear: glass, side: glass, top: fk()(mixHex(base, '#B9C3CF', 0.18))}, c.id + 'c', stroke, z0 + D.c0 + D.sr, z0 + D.c1 - D.sf);
  n.push(...cab);
  // liseré de contre-jour : arête du toit et des épaules éclairées par les faisceaux devant
  if (c.lights > 0.05 || (c.rim ?? 0) > 0) {
    const rk = Math.max(c.lights, c.rim ?? 0);
    const r0 = P2(cam, x0 + D.ins + 0.04, D.H2 + yb, z0 + D.c0 + D.sr), r1 = P2(cam, x1 - D.ins - 0.04, D.H2 + yb, z0 + D.c0 + D.sr);
    const r2 = P2(cam, x1 - D.ins - 0.04, D.H2 + yb, z0 + D.c1 - D.sf), r3 = P2(cam, x0 + D.ins + 0.04, D.H2 + yb, z0 + D.c1 - D.sf);
    n.push(<polyline key="rim" points={pts([r0, r3, r2, r1])} fill="none" stroke={AC.beam} strokeWidth={Math.max(1.5, 0.025 * mid.s)} opacity={0.55 * rk} strokeLinejoin="round" />);
    n.push(<polyline key="rim2" points={pts([r0, r3, r2, r1])} fill="none" stroke={AC.beam} strokeWidth={Math.max(4, 0.09 * mid.s)} opacity={0.18 * rk} filter="url(#b4)" />);
  }
  const F = (X: number, Y: number) => P2(cam, X, Y + yb, z0);
  const Fq = (a: [number, number][]) => pts(a.map(([X, Y]) => F(X, Y)));
  if (cam.z < z0) {
    // montants du hayon autour de la lunette arrière, plafonnier ou passager, reflet en diagonale
    const zc = z0 + D.c0, Y1 = D.H1 + yb, Y2 = D.H2 + yb;
    const C = (X: number, Y: number) => P2(cam, X, Y, zc + D.sr * (Y - Y1) / (Y2 - Y1));
    const gx0 = x0 + D.ins + 0.16, gx1 = x1 - D.ins - 0.16;
    const win: Pt[] = [C(gx0 - 0.05, Y1 + 0.08), C(gx1 + 0.05, Y1 + 0.08), C(gx1, Y2 - 0.07), C(gx0, Y2 - 0.07)];
    const dome = c.dome ?? 0;
    n.push(<polygon key="frame" points={pts([C(x0 + 0.06, Y1), C(x1 - 0.06, Y1), C(x1 - D.ins, Y2), C(x0 + D.ins, Y2)])} fill={fk()(mixHex(base, '#000000', 0.32))} stroke={stroke} strokeWidth={1.2} />);
    n.push(<polygon key="win" points={pts(win)} fill={dome > 0 ? fk(0.5)(mixHex('#141820', '#FFC27A', 0.55 * dome)) : glass} />);
    if (c.driver && c.driver > 0) {
      // quelqu'un au volant : tête trop haute, penchée, qui touche le plafond (côté conducteur = gauche)
      const hx = lerp(gx0, gx1, 0.3), hp = P2(cam, hx, Y2 - 0.18, zc + 1.7), r = 0.14 * project(cam, hx, Y2, zc + 1.7).s;
      n.push(
        <g key="drv" opacity={c.driver}>
          <ellipse cx={hp[0]} cy={hp[1] + r * 0.9} rx={r * 1.7} ry={r * 1.2} fill="#050608" />
          <ellipse cx={hp[0] - r * 0.3} cy={hp[1]} rx={r * 0.85} ry={r * 1.05} fill="#050608" transform={`rotate(-18,${hp[0]},${hp[1]})`} />
        </g>,
      );
    }
    n.push(<polygon key="refl" points={pts([lerp2(win[0], win[1], 0.62), lerp2(win[0], win[1], 0.74), lerp2(win[3], win[2], 0.9), lerp2(win[3], win[2], 0.8)])} fill="#FFFFFF" opacity={0.05} />);
    // pare-chocs, plaque, feux arrière (allumés : halo rouge dans le brouillard et reflet sur le bitume mouillé)
    n.push(<polygon key="bump" points={Fq([[x0 + 0.02, D.H0], [x1 - 0.02, D.H0], [x1 - 0.02, D.H0 + 0.2], [x0 + 0.02, D.H0 + 0.2]])} fill={fk()(mixHex(base, '#000000', 0.62))} />);
    n.push(<polygon key="plate" points={Fq([[c.x - 0.26, D.H0 + 0.25], [c.x + 0.26, D.H0 + 0.25], [c.x + 0.26, D.H0 + 0.37], [c.x - 0.26, D.H0 + 0.37]])} fill={fk()(mixHex('#BDBDB3', '#05060A', 0.45))} />);
    n.push(<polyline key="lip" points={Fq([[x0 + 0.08, D.H1 - 0.01], [x1 - 0.08, D.H1 - 0.01]])} stroke={fk()('#8E96A2')} strokeWidth={1.2} opacity={0.5} />);
    [-1, 1].forEach((s) => {
      const xa = s < 0 ? x0 + 0.07 : x1 - 0.33, xb = xa + 0.26;
      const yt = D.H1 - 0.07, ybt = D.H1 - 0.2;
      n.push(<polygon key={'tl' + s} points={Fq([[xa, ybt], [xb, ybt], [xb, yt], [xa, yt]])} fill={mixHex(fk()('#2A0808'), '#C8221C', tail)} stroke={fk()('#120404')} strokeWidth={1.2} strokeLinejoin="round" />);
      n.push(<polygon key={'tc' + s} points={Fq([[xa + 0.03, ybt + 0.035], [xb - 0.03, ybt + 0.035], [xb - 0.03, yt - 0.035], [xa + 0.03, yt - 0.035]])} fill={mixHex('#3A0C0C', '#FFB4A8', tail)} opacity={0.9} />);
      if (tail > 0.02 && project(cam, c.x, 0.7, z0).d > 3.2) {
        const g = F((xa + xb) / 2, (yt + ybt) / 2), s2 = project(cam, c.x, 0.7, z0).s;
        n.push(<circle key={'tg' + s} cx={g[0]} cy={g[1]} r={0.2 * s2} fill={AC.tail} opacity={0.45 * tail} filter="url(#b8)" style={{mixBlendMode: 'screen'}} />);
      }
    });
  }
  // côté visible : roues, ligne de porte, poignée ; portière conducteur ouverte (gauche) avec la lumière de l'habitacle
  const side = cam.x < x0 ? -1 : cam.x > x1 ? 1 : 0;
  if (side !== 0) {
    const xs = side < 0 ? x0 : x1;
    [z0 + 0.8, z1 - 0.85].forEach((zw, i) => {
      const ring: Pt[] = Array.from({length: 14}, (_, k) => P2(cam, xs + side * 0.01, 0.33 + 0.33 * Math.cos((k / 14) * Math.PI * 2), zw + 0.33 * Math.sin((k / 14) * Math.PI * 2)));
      n.push(<polygon key={'w' + i} points={pts(ring)} fill={fk()('#0B0C0E')} stroke={fk()('#2C2F34')} strokeWidth={1.5} />);
    });
    const dl = [P2(cam, xs, D.H0 + 0.1, z0 + 2.65), P2(cam, xs, D.H1, z0 + 2.65)];
    n.push(<line key="dl" x1={dl[0][0]} y1={dl[0][1]} x2={dl[1][0]} y2={dl[1][1]} stroke={stroke} strokeWidth={1.4} opacity={0.6} />);
  }
  if ((c.door ?? 0) > 0) {
    const a = (c.door ?? 0) * 1.15, hz = z0 + D.c1 - 0.15, Ld = 1.08;
    const fx = x0 - Math.sin(a) * Ld, fz = hz - Math.cos(a) * Ld;
    const pnl = [P2(cam, x0, D.H0 + 0.08, hz), P2(cam, fx, D.H0 + 0.08, fz), P2(cam, fx, D.H1, fz), P2(cam, x0, D.H1, hz)];
    const wnd = [P2(cam, x0, D.H1, hz), P2(cam, fx, D.H1, fz), P2(cam, fx + 0.02, D.H2 - 0.1, fz + 0.05), P2(cam, x0, D.H2 - 0.06, hz)];
    // la lumière chaude de l'habitacle sur le sol, puis le panneau intérieur et la vitre baissée à moitié
    const gp = project(cam, x0 - 0.7, 0, hz - 0.5);
    n.unshift(<ellipse key="spill" cx={gp.x} cy={gp.y} rx={1.3 * gp.s} ry={0.45 * gp.s} fill="#FFC27A" opacity={0.35 * (c.dome ?? 1)} filter="url(#b14)" style={{mixBlendMode: 'screen'}} />);
    // panneau intérieur éclairé par le plafonnier (chaud), garniture, accoudoir, cadre de vitre fin
    const warm = (col: string, k: number) => fk()(mixHex(col, '#FFB870', k * (c.dome ?? 1)));
    const cg = project(cam, x0 - 0.05, 1.05, hz - 0.6);
    n.push(<circle key="cabglow" cx={cg.x} cy={cg.y} r={0.8 * cg.s} fill="#FFC27A" opacity={0.42 * (c.dome ?? 1)} filter="url(#b24)" style={{mixBlendMode: 'screen'}} />);
    n.push(<polygon key="dp" points={pts(pnl)} fill={warm(mixHex(base, '#05060A', 0.55), 0.12)} stroke={stroke} strokeWidth={1.4} strokeLinejoin="round" />);
    n.push(<polygon key="dpi" points={pts([lerp2(pnl[0], pnl[3], 0.14), lerp2(pnl[1], pnl[2], 0.14), lerp2(pnl[1], pnl[2], 0.6), lerp2(pnl[0], pnl[3], 0.6)])} fill={warm('#23211E', 0.25)} />);
    n.push(<polygon key="dgl" points={pts(wnd)} fill={glass} opacity={0.45} />);
    n.push(<polyline key="arm" points={pts([lerp2(pnl[0], pnl[3], 0.68), lerp2(pnl[1], pnl[2], 0.7)])} stroke={warm('#6A6156', 0.35)} strokeWidth={Math.max(2, 0.05 * mid.s)} strokeLinecap="round" />);
    n.push(<polyline key="dw" points={pts([wnd[0], wnd[3], wnd[2], wnd[1]])} fill="none" stroke={fk()(mixHex(base, '#05060A', 0.4))} strokeWidth={Math.max(2, 0.035 * mid.s)} strokeLinejoin="round" />);
  }
  return <g filter={c.blur ? `url(#b${c.blur})` : undefined}>{n}</g>;
};
const lerp2 = (a: Pt, b: Pt, k: number): Pt => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** le monde entier, trié du plus loin au plus proche */
export const Lot: React.FC<LotProps> = ({T, cam, cars, them = [], toi, rain = 1, uid, haze = 0, expo = 1, pylon = true, shop = true, ripples}) => {
  const th = ((cam.pitch ?? 0) * Math.PI) / 180;
  const hy = (cam.VY ?? 960) - cam.F * Math.tan(th); // horizon à l'écran
  const items: Item[] = [];
  const ground: React.ReactNode[] = [];
  const glow: React.ReactNode[] = [];
  const on = (c: CarSpec) => clamp01(c.lights);

  // ---- arrière-plan : lisière d'arbres, autoroute au loin derrière (phares qui passent), pylône, lampadaires, boutique
  const trees: Pt[] = [];
  for (let i = 0; i <= 150; i++) {
    const X = -60 + i * 0.8, hgt = 3.2 + 1.1 * rand(i * 3.7) + 0.8 * Math.sin(i * 0.23) + (i % 3 === 0 ? 0.5 * rand(i) : 0);
    trees.push(P2(cam, X, hgt, 38));
  }
  const tl = P2(cam, 60, 0, 36), tr0 = P2(cam, -60, 0, 36);
  items.push({d: 900, n: <polygon key="trees" points={pts([...trees, [tl[0], Math.max(tl[1], hy) + 4], [tr0[0], Math.max(tr0[1], hy) + 4]])} fill={mixHex('#2E3746', AC.fog, 0.62)} opacity={0.8} filter="url(#b8)" />});
  // phares sur l'autoroute derrière les arbres : une paire de halos qui traverse toutes les ~7 s
  for (let k = 0; k < 2; k++) {
    const ph = ((T + k * 3.4) % 7) / 7, X = lerp(-70, 70, ph) * (k ? -1 : 1);
    const p = project(cam, X, 1, 48);
    items.push({d: 950, n: <circle key={'hw' + k} cx={p.x} cy={p.y} r={4 * p.s} fill={k ? '#FF6050' : '#FFF4DC'} opacity={0.22 * Math.sin(Math.PI * ph)} filter="url(#b24)" />});
  }
  if (pylon) {
    // pylône « AIRE 13 » au fond à gauche : mât, caisson bleu lumineux, le 13 qui grésille
    const px = -3, pz = 34;
    const a = P2(cam, px - 1.5, 12.5, pz), b = P2(cam, px + 1.5, 8.4, pz), m0 = P2(cam, px, 0, pz), m1 = P2(cam, px, 8.4, pz);
    const s = project(cam, px, 7, pz).s, d = project(cam, px, 7, pz).d;
    const buzz = 0.75 + 0.25 * (rand(Math.floor(T * 14) * 7.3) > 0.12 ? 1 : 0.1);
    items.push({
      d: d + 0.5, n: (
        <g key="pylon">
          <line x1={m0[0]} y1={m0[1]} x2={m1[0]} y2={m1[1]} stroke={fogged('#0D1014', d)} strokeWidth={0.35 * s} />
          <circle cx={(a[0] + b[0]) / 2} cy={(a[1] + b[1]) / 2} r={2.6 * s} fill="#3D7BFF" opacity={0.35 * buzz} filter="url(#b40)" />
          <rect x={a[0]} y={a[1]} width={b[0] - a[0]} height={b[1] - a[1]} rx={0.12 * s} fill={mixHex('#1F57D6', AC.fog, fogK(d, 0.6))} stroke={mixHex('#EAF0FF', AC.fog, fogK(d, 0.6))} strokeWidth={0.06 * s} />
          <text x={(a[0] + b[0]) / 2} y={a[1] + 1.15 * s} textAnchor="middle" fontFamily={SF.title} fontSize={1.0 * s} fill={mixHex('#FFFFFF', AC.fog, fogK(d, 0.5))} letterSpacing={0.12 * s}>AIRE</text>
          <text x={(a[0] + b[0]) / 2} y={a[1] + 3.7 * s} textAnchor="middle" fontFamily={SF.title} fontSize={2.7 * s} fill={mixHex('#FFFFFF', AC.fog, fogK(d, 0.5))} opacity={buzz}>13</text>
        </g>
      ),
    });
  }
  // lampadaires au sodium : mât, tête, cône orange dans le brouillard, flaque de lumière au sol
  [[-10, 14], [12, 18], [-9, 30], [11, 32], [-3, 44], [6, 46]].forEach(([lx, lz], i) => {
    const top = project(cam, lx, 7.5, lz), foot = project(cam, lx, 0, lz);
    if (top.d < 0.5) return;
    const arm = P2(cam, lx + (lx < 0 ? 1.4 : -1.4), 7.6, lz);
    const pool = [P2(cam, lx - 4, 0, lz - 3), P2(cam, lx + 4, 0, lz - 3), P2(cam, lx + 4, 0, lz + 3), P2(cam, lx - 4, 0, lz + 3)];
    const fz = fogK(top.d, 0.7);
    ground.push(<polygon key={'pool' + i} points={pts(pool)} fill={AC.sodium} opacity={0.16 * (1 - fz * 0.6)} filter="url(#b24)" style={{mixBlendMode: 'screen'}} />);
    items.push({
      d: top.d, n: (
        <g key={'lamp' + i}>
          <polygon points={pts([arm, P2(cam, lx + (lx < 0 ? 1.4 : -1.4) - 3, 0, lz), P2(cam, lx + (lx < 0 ? 1.4 : -1.4) + 3, 0, lz)])} fill={AC.sodium} opacity={0.1 * (1 - fz * 0.5)} filter="url(#b14)" style={{mixBlendMode: 'screen'}} />
          <line x1={foot.x} y1={foot.y} x2={top.x} y2={top.y} stroke={fogged('#0C0E12', top.d)} strokeWidth={Math.max(1.5, 0.16 * top.s)} />
          <line x1={top.x} y1={top.y} x2={arm[0]} y2={arm[1]} stroke={fogged('#0C0E12', top.d)} strokeWidth={Math.max(1.5, 0.12 * top.s)} />
          <circle cx={arm[0]} cy={arm[1]} r={1.6 * top.s} fill={AC.sodium} opacity={0.55 * (1 - fz * 0.4)} filter="url(#b24)" style={{mixBlendMode: 'screen'}} />
          <circle cx={arm[0]} cy={arm[1] + 0.05 * top.s} r={0.22 * top.s} fill="#FFE2B8" opacity={0.95 - fz * 0.4} />
        </g>
      ),
    });
  });
  if (shop) {
    // la boutique (à gauche) : façade vitrée au néon blanc-vert, auvent, un tube qui grésille
    const x0 = -19, x1 = -11, z0 = 2, z1 = 15, H = 3.6;
    const fl = rand(Math.floor(T * 20) * 1.7 + 5) > 0.08 ? 1 : 0.35;
    const c = project(cam, x1, 1.8, (z0 + z1) / 2);
    const faces = boxFaces(cam, x0, x1, 0, H, z0, z1, 0, {rear: fogged('#1B1F24', c.d), side: fogged('#252A30', c.d), top: fogged('#2B3138', c.d)}, 'shop', fogged('#0A0B0D', c.d));
    const panes: React.ReactNode[] = [];
    if (cam.x > x1) {
      for (let k = 0; k < 4; k++) {
        const za = z0 + 1 + k * 3, zb = za + 2.6;
        const q = [P2(cam, x1 + 0.01, 0.3, za), P2(cam, x1 + 0.01, 0.3, zb), P2(cam, x1 + 0.01, 2.7, zb), P2(cam, x1 + 0.01, 2.7, za)];
        panes.push(<polygon key={'pn' + k} points={pts(q)} fill={mixHex(mixHex('#5E8C7C', AC.shop, 0.55 * (k === 2 ? fl : 1)), AC.fog, fogK(c.d, 0.5))} />);
      }
      const gp = project(cam, x1 + 2.2, 0, (z0 + z1) / 2);
      ground.push(<ellipse key="shopspill" cx={gp.x} cy={gp.y} rx={3.4 * gp.s} ry={1.3 * gp.s} fill={AC.shop} opacity={0.18} filter="url(#b24)" style={{mixBlendMode: 'screen'}} />);
    }
    items.push({d: c.d + 3, n: <g key="shop">{faces}{panes}</g>});
  }

  // ---- les voitures, leurs faisceaux, la pluie dans la lumière, les gaz d'échappement
  cars.forEach((c) => {
    const D = CAR_DIM[c.kind], zf = c.z + D.L, I = on(c);
    const reach = c.reach ?? 12, ze = zf + reach;
    // ombre de contact sous la voiture
    const sh = [P2(cam, c.x - D.W / 2 - 0.15, 0, c.z - 0.1), P2(cam, c.x + D.W / 2 + 0.15, 0, c.z - 0.1), P2(cam, c.x + D.W / 2 + 0.15, 0, zf + 0.1), P2(cam, c.x - D.W / 2 - 0.15, 0, zf + 0.1)];
    ground.push(<polygon key={'sh' + c.id} points={pts(sh)} fill="#030405" opacity={0.7} filter="url(#b8)" />);
    // reflet des feux arrière sur le bitume mouillé (traînée rouge vers la caméra)
    const tail = c.tail ?? (I > 0.05 ? 1 : 0);
    if (tail > 0.02 && cam.z < c.z) {
      [-1, 1].forEach((s) => {
        const a = project(cam, c.x + s * 0.72, 0, c.z - 0.15), b = project(cam, c.x + s * 0.72, 0, c.z - 1.5);
        ground.push(<line key={'rf' + c.id + s} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={AC.tail} strokeWidth={0.3 * a.s} strokeLinecap="round" opacity={0.22 * tail} filter="url(#b14)" style={{mixBlendMode: 'screen'}} />);
      });
    }
    if ((c.hole ?? 0) > 0 && I < 0.99) {
      const zf2 = zf + 0.3, ze2 = zf + 13;
      const hole = hull([[c.x - 0.9, 0, zf2], [c.x + 0.9, 0, zf2], [c.x - 0.9, 1.6, zf2], [c.x + 0.9, 1.6, zf2], [c.x - 2.4, 0, ze2], [c.x + 2.4, 0, ze2], [c.x - 2.4, 3.2, ze2], [c.x + 2.4, 3.2, ze2]].map(([X, Y, Z]) => P2(cam, X, Y, Z)));
      const dH = project(cam, c.x, 1, ze2).d;
      items.push({d: dH + 2, n: <polygon key={'hole' + c.id} points={pts(hole)} fill="#0B0F16" opacity={0.6 * (c.hole ?? 0) * (1 - I)} filter="url(#b24)" />});
    }
    if (I > 0.01) {
      // faisceau : volume tronqué des deux phares jusqu'au fond, dégradé le long de l'axe, cœur plus étroit et plus vif
      const shell = hull([[c.x - 0.8, 0.85, zf], [c.x + 0.8, 0.85, zf], [c.x - 0.8, 0.45, zf], [c.x + 0.8, 0.45, zf], [c.x - 2.6, 2.5, ze], [c.x + 2.6, 2.5, ze], [c.x - 2.8, 0, ze], [c.x + 2.8, 0, ze]].map(([X, Y, Z]) => P2(cam, X, Y, Z)));
      const core = hull([[c.x - 0.7, 0.75, zf], [c.x + 0.7, 0.75, zf], [c.x - 1.6, 1.5, ze - 2], [c.x + 1.6, 1.5, ze - 2], [c.x - 1.7, 0.1, ze - 2], [c.x + 1.7, 0.1, ze - 2]].map(([X, Y, Z]) => P2(cam, X, Y, Z)));
      const a = P2(cam, c.x, 0.7, zf), b = P2(cam, c.x, 1.0, ze);
      const gid = `bm-${uid}-${c.id}`;
      const pool = hull([[c.x - 1.6, 0, zf + 2.5], [c.x + 1.6, 0, zf + 2.5], [c.x - 2.7, 0, ze - 0.5], [c.x + 2.7, 0, ze - 0.5]].map(([X, Y, Z]) => P2(cam, X, Y, Z)));
      const dEnd = project(cam, c.x, 1, ze).d;
      items.push({
        d: dEnd + 1.5, n: (
          <g key={'beam' + c.id} style={{mixBlendMode: 'screen'}} opacity={I}>
            <defs>
              <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}>
                <stop offset={0} stopColor={AC.beam} stopOpacity={0.75} />
                <stop offset={0.45} stopColor={AC.beam} stopOpacity={0.32} />
                <stop offset={1} stopColor={AC.beam} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <polygon points={pts(pool)} fill={`url(#${gid})`} opacity={0.75} filter="url(#b14)" />
            <polygon points={pts(shell)} fill={`url(#${gid})`} opacity={0.6} filter="url(#b14)" />
            <polygon points={pts(core)} fill={`url(#${gid})`} opacity={0.75} filter="url(#b8)" />
          </g>
        ),
      });
      // halo des phares qui dépasse au-dessus du capot (vu de derrière)
      const hp = project(cam, c.x, 0.75, zf + 0.3);
      items.push({d: hp.d + 0.05, n: <ellipse key={'hl' + c.id} cx={hp.x} cy={hp.y} rx={1.5 * hp.s} ry={0.7 * hp.s} fill={AC.beam} opacity={0.5 * I} filter="url(#b24)" style={{mixBlendMode: 'screen'}} />});
      // pluie fine : seulement dans le faisceau (traits courts qui tombent, plus vifs près des phares)
      if (rain > 0) {
        const drops: React.ReactNode[] = [];
        for (let k = 0; k < 46; k++) {
          const u = rand(k * 3.1 + c.x * 7), w = rand(k * 5.7 + c.x), sp = 7 + 3 * rand(k * 1.3);
          const Z = lerp(zf + 0.5, ze - 0.5, u);
          const halfW = lerp(0.8, 2.4, u), X = c.x + (w * 2 - 1) * halfW;
          const Yt = lerp(1.0, 2.6, u), Y = Yt - (((T * sp + rand(k * 9.1 + c.x) * 9) % (Yt + 0.3)));
          if (Y < 0) continue;
          const p0 = P2(cam, X, Y, Z), p1 = P2(cam, X - 0.03, Y + 0.22, Z);
          drops.push(<line key={k} x1={p0[0]} y1={p0[1]} x2={p1[0]} y2={p1[1]} stroke="#FFF6E2" strokeWidth={1.4} opacity={(0.65 - 0.5 * u) * I * rain} />);
        }
        items.push({d: project(cam, c.x, 1, (zf + ze) / 2).d, n: <g key={'rain' + c.id}>{drops}</g>});
      }
    }
    // gaz d'échappement : bouffées qui montent et reviennent vers nous, roses dans les feux arrière puis grises
    const ex = c.exhaust ?? (I > 0.05 ? 1 : 0);
    if (ex > 0.01) {
      const puffs: React.ReactNode[] = [];
      for (let k = 0; k < 9; k++) {
        const life = 2.6, ph = ((T + (k / 9) * life + rand(k + c.x) * 0.3) % life) / life;
        const X = c.x + D.W / 2 - 0.42 + (rand(k * 2.3 + c.x) - 0.5) * 0.3 + Math.sin(T * 1.3 + k) * 0.12 * ph;
        const p = project(cam, X, 0.28 + 1.1 * ph * ph + 0.4 * ph, c.z - 0.15 - 1.2 * ph);
        if (p.d < 2.2) continue; // trop près de l'objectif
        const r = (0.07 + 0.36 * ph) * p.s;
        puffs.push(<circle key={k} cx={p.x} cy={p.y} r={r} fill={mixHex(mixHex('#D9938C', AC.fogHi, ph), AC.fog, fogK(p.d, 0.5))} opacity={0.18 * ex * (1 - ph) * Math.min(1, ph * 6)} />);
      }
      items.push({d: project(cam, c.x, 0.5, c.z - 0.6).d, n: <g key={'ex' + c.id} filter="url(#b8)">{puffs}</g>});
    }
    items.push({d: project(cam, c.x, 0.7, c.z + D.L * 0.5).d, n: <Car key={'car' + c.id} cam={cam} c={c} T={T} />});
  });

  // ---- ceux qui attendent, et toi
  const fig = (w: Walker, key: string, look: 'attendant' | 'driver') => {
    const p = project(cam, w.x, 0, w.z);
    if (p.d < 0.3) return;
    const hM = w.h ?? (look === 'attendant' ? 1.75 : 1.78);
    const fz = fogK(p.d, look === 'attendant' ? 0.3 : 0.35);
    const light: Light = w.light ?? {amb: 1 - fz, tint: AC.fog};
    if (w.cast) {
      const q = [P2(cam, w.x - 0.22, 0, w.z), P2(cam, w.x + 0.22, 0, w.z), P2(cam, w.x + 0.9, 0, w.z + w.cast), P2(cam, w.x - 0.9, 0, w.z + w.cast)];
      ground.push(<polygon key={'cast' + key} points={pts(q)} fill="#0A0C10" opacity={0.6 * (w.o ?? 1)} filter="url(#b8)" />);
    }
    items.push({
      d: p.d, n: (
        <g key={key} opacity={w.o ?? 1}>
          <ellipse cx={p.x} cy={p.y} rx={0.5 * p.s} ry={0.12 * p.s} fill="#020203" opacity={0.6 * (w.o ?? 1)} filter="url(#b4)" />
          <Figure look={LOOKS[look]} p={w.p} x={p.x} y={p.y} h={hM * p.s * 0.98} flip={w.flip} light={light} view={w.view ?? 'side'} fingers={look === 'attendant' ? 0.9 : 0} />
        </g>
      ),
    });
  };
  them.forEach((w, i) => fig(w, 'them' + i, 'attendant'));
  if (toi) fig(toi, 'toi', 'driver');

  // ---- bancs de brouillard qui dérivent à plusieurs profondeurs (passent devant et derrière les objets)
  [7, 13, 19, 26].forEach((Z, j) => {
    for (let k = 0; k < 3; k++) {
      const X = -16 + ((T * (0.35 + 0.15 * j) + k * 11 + j * 5) % 34);
      const p = project(cam, X, 1.2 + 0.6 * k, Z + k);
      if (p.d < 1) continue;
      items.push({d: p.d - 0.2, n: <ellipse key={`fb${j}-${k}`} cx={p.x} cy={p.y} rx={6 * p.s} ry={1.5 * p.s} fill={AC.fogHi} opacity={0.1 + 0.04 * j} filter="url(#b40)" />});
    }
  });

  items.sort((u, v) => v.d - u.d);
  // ---- ciel et sol
  const sky = `sk-${uid}`, gr = `gr-${uid}`;
  // gouttes au premier plan qui font des ronds dans les flaques (plan au ras du sol)
  const rip: React.ReactNode[] = [];
  if (ripples) {
    for (let k = 0; k < 18; k++) {
      const per = 1.1 + rand(k) * 0.8, ph = ((T + rand(k * 3.3) * per) % per) / per;
      const X = cam.x + (rand(k * 7.1) - 0.5) * 3, Z = cam.z + 1.2 + rand(k * 2.9) * 4;
      const p = project(cam, X, 0, Z);
      rip.push(<ellipse key={k} cx={p.x} cy={p.y} rx={(0.04 + 0.25 * ph) * p.s} ry={(0.04 + 0.25 * ph) * p.s * 0.22} fill="none" stroke="#E3EAF2" strokeWidth={2} opacity={0.75 * (1 - ph)} />);
    }
  }
  return (
    <svg width={1080} height={1920} style={{filter: expo !== 1 ? `brightness(${expo})` : undefined}}>
      <Blurs />
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1" gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor={AC.sky} />
          <stop offset={Math.max(0.01, Math.min(0.98, hy / 1920))} stopColor={AC.fog} />
          <stop offset={1} stopColor={AC.fog} />
        </linearGradient>
        <linearGradient id={gr} x1="0" y1={hy} x2="0" y2={1920} gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor={AC.fog} />
          <stop offset={0.18} stopColor={mixHex(AC.fog, AC.asphalt, 0.55)} />
          <stop offset={1} stopColor={AC.asphalt} />
        </linearGradient>
      </defs>
      <g transform={cam.roll ? `rotate(${cam.roll},540,960)` : undefined}>
        <rect x={-200} y={-200} width={1480} height={2320} fill={`url(#${sky})`} />
        <rect x={-200} y={hy} width={1480} height={2400} fill={`url(#${gr})`} />
        {/* marquage au sol : places de parking (traits blancs usés) */}
        {cars.length ? [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((X) => {
          const q = [P2(cam, X - 0.06, 0, 5.4), P2(cam, X + 0.06, 0, 5.4), P2(cam, X + 0.06, 0, 11.2), P2(cam, X - 0.06, 0, 11.2)];
          return <polygon key={'pl' + X} points={pts(q)} fill={AC.line} opacity={0.22} />;
        }) : null}
        {/* bordure au fond du parking, là où commence l'herbe */}
        {(() => {
          const q = [P2(cam, -30, 0, 22.6), P2(cam, 30, 0, 22.6), P2(cam, 30, 0.15, 22.8), P2(cam, -30, 0.15, 22.8)];
          return <polygon points={pts(q)} fill={AC.line} opacity={0.18} />;
        })()}
        {ground}
        {rip}
        {items.map((it) => it.n)}
        {/* voile de brouillard d'ensemble, plus dense vers l'horizon */}
        <rect x={-200} y={hy - 500} width={1480} height={900} fill={AC.fogHi} opacity={0.1 + 0.25 * haze} filter="url(#b40)" />
        {haze > 0 ? <rect x={-200} y={-200} width={1480} height={2400} fill={AC.fog} opacity={0.25 * haze} /> : null}
        {glow}
      </g>
    </svg>
  );
};
