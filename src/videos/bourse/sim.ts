// Moteurs de la vidéo 10 : tout est calculé, rien n'est « dessiné à la main ».
//  - carnet d'ordres : vrai moteur d'appariement (priorité au prix, puis au temps), rejoué image par image
//  - planche de Galton : chaque bille = une vraie année, chemin déterministe qui finit dans la bonne case
//  - grand huit : la vraie courbe 1928-2025 (échelle log), vitesse qui dépend de la pente
//  - périodes glissantes et pari de Buffett : calculés depuis les données
import {rand} from '../../theme';
import {BET, RET, VALUE, YEARS} from './data';

const R = (i: number, s = 0) => rand(i * 12.9898 + s * 78.233 + 0.5);

// =====================================================================
// Carnet d'ordres
// =====================================================================
export type Side = 'B' | 'S';
export type Src = 'crowd' | 'robot';
export type Ev = {t: number; id: number; kind: 'limit' | 'market' | 'cancel'; side: Side; p: number; q: number; src: Src; target?: number};
export type Order = {id: number; side: Side; p: number; q: number; q0: number; t: number; src: Src};
export type Trade = {t: number; p: number; q: number; side: Side; maker: number; taker: number};
export type Ghost = {o: Order; t: number; how: 'fill' | 'cancel'};
export type BookState = {bids: Map<number, Order[]>; asks: Map<number, Order[]>; trades: Trade[]; ghosts: Ghost[]; last: number | null};

/** prix en « pas de cotation » (tick = 0,50 €) */
export const TICK = 0.5;
export const eur = (p: number) => (p * TICK).toFixed(2).replace('.', ',');

const best = (m: Map<number, Order[]>, side: Side) => {
  let b: number | null = null;
  for (const [p, q] of m) if (q.length && (b === null || (side === 'B' ? p > b : p < b))) b = p;
  return b;
};

/** Rejoue tous les ordres arrivés avant `now`. */
export const runBook = (evs: Ev[], now: number): BookState => {
  const bids = new Map<number, Order[]>();
  const asks = new Map<number, Order[]>();
  const trades: Trade[] = [];
  const ghosts: Ghost[] = [];
  let last: number | null = null;
  const byId = new Map<number, Order>();
  for (const e of evs) {
    if (e.t > now) break;
    if (e.kind === 'cancel') {
      const o = byId.get(e.target!);
      if (!o || o.q <= 0) continue;
      const book = o.side === 'B' ? bids : asks;
      const lvl = book.get(o.p)!;
      lvl.splice(lvl.indexOf(o), 1);
      ghosts.push({o: {...o}, t: e.t, how: 'cancel'});
      o.q = 0;
      continue;
    }
    // agresseur : consomme le meilleur prix opposé tant que les prix se croisent
    let q = e.q;
    const opp = e.side === 'B' ? asks : bids;
    while (q > 0) {
      const bp = best(opp, e.side === 'B' ? 'S' : 'B');
      if (bp === null) break;
      if (e.kind === 'limit' && (e.side === 'B' ? bp > e.p : bp < e.p)) break;
      const lvl = opp.get(bp)!;
      const maker = lvl[0]; // le plus ancien à ce prix est servi en premier
      const x = Math.min(q, maker.q);
      maker.q -= x;
      q -= x;
      trades.push({t: e.t, p: bp, q: x, side: e.side, maker: maker.id, taker: e.id});
      last = bp;
      if (maker.q <= 0) {
        lvl.shift();
        ghosts.push({o: {...maker, q: maker.q0}, t: e.t, how: 'fill'});
      }
    }
    if (q > 0 && e.kind === 'limit') {
      const o: Order = {id: e.id, side: e.side, p: e.p, q, q0: q, t: e.t, src: e.src};
      const book = e.side === 'B' ? bids : asks;
      if (!book.has(e.p)) book.set(e.p, []);
      book.get(e.p)!.push(o);
      byId.set(e.id, o);
    }
  }
  return {bids, asks, trades, ghosts, last};
};

export const bestBid = (s: BookState) => best(s.bids, 'B');
export const bestAsk = (s: BookState) => best(s.asks, 'S');

/** Le scénario du carnet, calé sur la voix (b = balises). Déterministe. */
export const bookEvents = (b: Record<string, number>, vendeurs: number): Ev[] => {
  const ev: Ev[] = [];
  let id = 1;
  const add = (t: number, kind: Ev['kind'], side: Side, p: number, q: number, src: Src = 'crowd', target?: number) => {
    ev.push({t, id: id++, kind, side, p, q, src, target});
    return id - 1;
  };
  // 1. les acheteurs annoncent un maximum, les vendeurs un minimum (prix en ticks : 200 = 100,00 €)
  const bidIds: number[] = [];
  [[199, 3], [198, 2], [199, 2], [197, 4], [196, 3], [198, 2]].forEach(([p, q], i) => bidIds.push(add(b.carnet + 0.3 + i * 0.3, 'limit', 'B', p, q)));
  [[201, 2], [202, 3], [201, 2], [203, 4], [204, 3], [202, 2]].forEach(([p, q], i) => add(vendeurs + 0.1 + i * 0.28, 'limit', 'S', p, q));
  bidIds.push(add(b.fourchette + 1.2, 'limit', 'B', 197, 2));
  add(b.fourchette + 1.7, 'limit', 'S', 203, 2);
  // 2. deux ordres se croisent : l'échange se fait au prix du vendeur le plus ancien
  add(b.match + 0.9, 'limit', 'B', 201, 2);
  // 3. le carnet vit
  add(b.cours + 0.8, 'limit', 'S', 199, 1);
  add(b.cours + 1.3, 'limit', 'B', 201, 1);
  // 4. krach : les acheteurs retirent leurs ordres, les vendeurs baissent leurs prix
  const t1 = b.vide + 0.4;
  bidIds.forEach((bid, i) => add(t1 + i * 0.28, 'cancel', 'B', 0, 0, 'crowd', bid));
  [[200, 2], [200, 3], [199, 2], [199, 3]].forEach(([p, q], i) => add(t1 + 0.5 + i * 0.45, 'limit', 'S', p, q));
  // 5. des programmes vendent automatiquement ; quelques acheteurs, toujours plus bas
  let last = 197;
  let k = 0;
  for (let t = b.k1987 + 0.5; t < b.fuite; t += 0.5, k++) {
    last -= 2 + Math.floor(R(k, 1) * 2);
    add(t, 'limit', 'B', last, 2 + Math.floor(R(k, 2) * 2));
    add(t + 0.18, 'market', 'S', 0, 1 + Math.floor(R(k, 3) * 2), 'robot');
    add(t + 0.36, 'market', 'S', 0, 1 + Math.floor(R(k, 4) * 2), 'robot');
  }
  // 6. les acheteurs disparaissent : les programmes empilent des offres de vente
  for (let i = 0; i < 6; i++) add(b.fuite + 0.2 + i * 0.22, 'limit', 'S', last + 1 + (i % 3), 2, 'robot');
  // 7. la chute : de rares acheteurs très bas, aussitôt servis
  for (let t = b.chute + 0.2; last > 157; t += 0.28, k++) {
    last -= 2 + Math.floor(R(k, 5) * 3);
    add(t, 'limit', 'B', Math.max(155, last), 1);
    add(t + 0.1, 'market', 'S', 0, 1, 'robot');
  }
  // 8. le calme revient vers 77,50 €
  const tc = b.chute + 3.6;
  [[155, 3], [154, 2], [156, 2]].forEach(([p, q], i) => add(tc + i * 0.4, 'limit', 'B', p, q));
  [[158, 2], [157, 3]].forEach(([p, q], i) => add(tc + 0.2 + i * 0.4, 'limit', 'S', p, q));
  add(tc + 1.8, 'market', 'S', 0, 1, 'robot');
  add(tc + 2.6, 'limit', 'B', 157, 1);
  return ev.sort((a, c) => a.t - c.t || a.id - c.id);
};

// =====================================================================
// Planche de Galton
// =====================================================================
export const N_ROWS = 10;
/** case de 10 % : 0 = [-50 ; -40[, … , 10 = [50 ; 60[ */
export const binOf = (r: number) => Math.max(0, Math.min(10, Math.floor(r * 10) + 5));
/** gauche (0) / droite (1) à chaque rangée de clous : autant de « droite » que le numéro de la case, ordre pseudo-aléatoire */
export const galtonMoves = (i: number): number[] => {
  const b = binOf(RET[i]);
  const m: number[] = Array.from({length: N_ROWS}, (_, k) => (k < b ? 1 : 0));
  for (let k = N_ROWS - 1; k > 0; k--) {
    const j = Math.floor(R(i, 10 + k) * (k + 1));
    [m[k], m[j]] = [m[j], m[k]];
  }
  return m;
};
/** rang d'arrivée de chaque bille dans sa case (ordre chronologique) */
export const SLOT: number[] = (() => {
  const c = new Array(11).fill(0);
  return RET.map((r) => c[binOf(r)]++);
})();
export const BIN_COUNT: number[] = (() => {
  const c = new Array(11).fill(0);
  RET.forEach((r) => c[binOf(r)]++);
  return c;
})();

// =====================================================================
// Grand huit : la courbe réelle
// =====================================================================
export const PXY = 60; // px par année
export const PXD = 640; // px par décade (×10)
/** points de contrôle : k = 0 (début 1928, 100 $) … k = 98 (fin 2025) */
export const CTRL: [number, number][] = [[0, 0], ...VALUE.map((v, i) => [(i + 1) * PXY, -Math.log10(v / 100) * PXD] as [number, number])];
const SUB = 16;
/** courbe lissée (Catmull-Rom), échantillonnée finement : TRACK[k*SUB + s] */
export const TRACK: [number, number][] = (() => {
  const out: [number, number][] = [];
  const P = (i: number) => CTRL[Math.max(0, Math.min(CTRL.length - 1, i))];
  for (let i = 0; i < CTRL.length - 1; i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let s = 0; s < SUB; s++) {
      const u = s / SUB;
      const u2 = u * u;
      const u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(CTRL[CTRL.length - 1]);
  return out;
})();
/** point, angle (rad) et pente au paramètre u (années depuis début 1928) */
export const trackAt = (u: number) => {
  const f = Math.max(0, Math.min(TRACK.length - 1.001, u * SUB));
  const i = Math.floor(f);
  const k = f - i;
  const a = TRACK[i];
  const c = TRACK[i + 1];
  const x = a[0] + (c[0] - a[0]) * k;
  const y = a[1] + (c[1] - a[1]) * k;
  const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
  return {x, y, ang, slope: -(c[1] - a[1]) / Math.max(1e-6, c[0] - a[0])};
};
/** valeur (en $) au paramètre u, interpolée en log */
export const valueAt = (u: number) => {
  const vs = [100, ...VALUE];
  const i = Math.max(0, Math.min(vs.length - 2, Math.floor(u)));
  const k = Math.max(0, Math.min(1, u - i));
  return Math.pow(10, Math.log10(vs[i]) * (1 - k) + Math.log10(vs[i + 1]) * k);
};

// vitesse : lente en montée, rapide en descente (comme un vrai grand huit)
const DU = 0.02;
const COST: number[] = (() => {
  const c = [0];
  for (let u = 0; u < 98; u += DU) {
    const s = trackAt(u + DU / 2).slope;
    const speed = (1 + 1.6 * Math.max(0, -s)) / (1 + 0.9 * Math.max(0, s));
    c.push(c[c.length - 1] + DU / speed);
  }
  return c;
})();
const costAt = (u: number) => COST[Math.max(0, Math.min(COST.length - 1, Math.round(u / DU)))];
/** u(t) : passe par chaque ancre (t, u) au bon moment, vitesse selon la pente entre deux ancres */
export const coasterU = (t: number, anchors: [number, number][]) => {
  if (t <= anchors[0][0]) return anchors[0][1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const [ta, ua] = anchors[i];
    const [tb, ub] = anchors[i + 1];
    if (t > tb) continue;
    const ca = costAt(ua);
    const cb = costAt(ub);
    const target = ca + ((t - ta) / (tb - ta)) * (cb - ca);
    let lo = ua;
    let hi = ub;
    for (let it = 0; it < 30; it++) {
      const mid = (lo + hi) / 2;
      if (costAt(mid) < target) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }
  return anchors[anchors.length - 1][1];
};

// =====================================================================
// Périodes glissantes (rendement annuel moyen sur n années)
// =====================================================================
export const rolling = (n: number) => {
  const out: {y: number; r: number}[] = [];
  for (let i = 0; i + n <= RET.length; i++) {
    let g = 1;
    for (let j = i; j < i + n; j++) g *= 1 + RET[j];
    out.push({y: YEARS[i], r: Math.pow(g, 1 / n) - 1});
  }
  return out;
};

// =====================================================================
// Pari de Buffett : gain cumulé (%) fin 2007 → fin 2017
// =====================================================================
export const betCum = (k: keyof typeof BET) => {
  const out: number[] = [0];
  let g = 1;
  for (const r of BET[k]) {
    if (r === null) break;
    g *= 1 + r / 100;
    out.push((g - 1) * 100);
  }
  return out;
};
