// Vidéo éco n°10 — « La Bourse, comment ça marche vraiment ? » (≈ 2 min 14)
// Idée neuve : LES MOTEURS. Chaque séquence est pilotée par du vrai calcul (bourse/sim.ts) :
// particules (1 143 souscripteurs), moteur d'appariement d'ordres, grand huit sur la vraie courbe 1928-2025,
// planche de Galton (98 vraies années), périodes glissantes, course du pari de Buffett.
// Transitions : zoom DANS un objet (le certificat de Neeltgen), zoom ARRIÈRE (le krach de 1987 devient un point de la courbe), pages qui glissent.
// Chiffres : videos/10-la-bourse/sources.md
import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeIn, easeInOut, easeOut, F, FPS, handPath, lerp, overshoot, POP, prog, rand, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, Track} from '../rig/rig';
import {fmtFR, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {Coin, Doc, House, vis} from '../components/Drawings';
import {RET, YEARS} from './bourse/data';
import {
  bestAsk, bestBid, betCum, BookState, bookEvents, eur, Ev, Order, galtonMoves, binOf, N_ROWS, PXD, rolling, runBook, SLOT, TRACK, trackAt, coasterU, valueAt,
} from './bourse/sim';
import {Bubble, Bulb, Burst, Cart, Cert, Chomp, Fund, HRect, PARCH, PARCH_D, Person, Robot, Sack, Seal, Ship, Stamp, T, Tulip, Waves, waveY} from './bourse/draw';

type B = Record<string, number>;
type P2 = [number, number];
const G = 1360; // sol (écran)
const W = 1080;
const pct = (r: number, d = 1) => `${r >= 0 ? '+' : '−'}${Math.abs(r * 100).toFixed(d).replace('.', ',')} %`;
const ease = (t: number, a: number, d: number, f = easeInOut) => prog(t, a, a + d, f);
const pop = (frame: number, t0: number) => sp(frame, t0, POP);

/** Contexte partagé par les stations (pas de hooks dans les stations). */
type Ctx = {b: B; frame: number; ev: Ev[]; lastAt: (t: number) => number; words: Record<string, number>};

const Bg: React.FC<{color?: string; grid?: boolean}> = ({color = C.paper, grid = true}) => (
  <g>
    <rect x={-40} y={-40} width={W + 80} height={2000} fill={color} />
    {grid ? <rect x={-40} y={-40} width={W + 80} height={2000} fill="url(#bgrid)" /> : null}
  </g>
);
const Ground: React.FC<{frame: number; id: number; color?: string}> = ({frame, id, color = C.ink}) => (
  <path d={handPath([[70, G], [400, G + 2], [760, G - 1], [1050, G]], frame, id, 1)} stroke={color} strokeWidth={7} fill="none" strokeLinecap="round" />
);
const Title: React.FC<{t: number; t0: number; t1?: number; y?: number; size?: number; children: React.ReactNode; color?: string}> = ({t, t0, t1 = 1e9, y = 300, size = 74, children, color = C.ink}) => {
  const k = prog(t, t0, t0 + 0.4, easeOut) * (1 - prog(t, t1 - 0.25, t1, easeIn));
  return k > 0 ? <T x={W / 2} y={y + (1 - k) * 26} size={size} a="middle" o={k} color={color}>{children}</T> : null;
};
const Label: React.FC<{x: number; y: number; k: number; text: string; color?: string; size?: number; w?: number; id?: number}> = ({x, y, k, text, color = C.ink, size = 40, w, id = 1}) =>
  k > 0.01 ? (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * clamp01(k)})`} opacity={clamp01(k * 2)}>
      <HRect x={0} y={-size * 0.35} w={w ?? text.length * size * 0.52 + 40} h={size * 1.5} fill={C.white} stroke={color} sw={5} id={id} />
      <T x={0} y={0} size={size} a="middle" color={color}>{text}</T>
    </g>
  ) : null;

// =====================================================================
// S0 — Amsterdam, 1602 : la VOC se découpe en 1 143 morceaux
// =====================================================================
const CROWD: {x: number; y: number; hat: number; color: string}[] = Array.from({length: 15}, (_, i) => ({
  x: 150 + i * 58 + (rand(i * 3.1) - 0.5) * 16,
  y: 770 + (i % 2) * 22,
  hat: i === 3 ? 2 : rand(i * 1.7) < 0.55 ? 0 : 1,
  color: ['#3B4A6B', '#5B3B4A', '#2F5D50', '#6B5233', '#44406B'][i % 5],
}));
const NEEL = 3; // la servante
const NP = 1143; // souscripteurs du registre d'Amsterdam
const shipX = (t: number, b: B) => lerp(-380, 400, ease(t, b.an1602 + 0.2, 3.2, easeOut));
const shipY = (t: number, b: B) => 1150 + waveY(shipX(t, b), t, 0) * 0.7;
const P1 = {x: CROWD[NEEL].x + 6, y: CROWD[NEEL].y - 112, w: 40}; // le certificat de Neeltgen = portail vers S1
const partT = (i: number, b: B) => b.decoupe + 0.9 + (i / NP) * 2.3;

const Hook = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const sx = shipX(t, b);
  const sy = shipY(t, b);
  const rock = Math.cos(sx * 0.012 + t * 1.6) * 3;
  const grid = ease(t, b.decoupe, 0.5);
  // particules : morceaux du navire qui volent vers la foule
  const parts: React.ReactNode[] = [];
  let landed = 0;
  for (let i = 0; i < NP; i++) {
    const t0 = partT(i, b);
    if (t < t0) break;
    const k = (t - t0) / 0.9;
    if (k >= 1) {
      landed++;
      continue;
    }
    const p = CROWD[i % CROWD.length];
    const a: P2 = [sx - 200 + rand(i * 1.3) * 420, sy - 60 - rand(i * 2.9) * 380];
    const z: P2 = [p.x + (rand(i * 5.1) - 0.5) * 30, p.y - 70];
    const e = easeInOut(k);
    const x = lerp(a[0], z[0], e);
    const y = lerp(a[1], z[1], e) - Math.sin(Math.PI * k) * (160 + rand(i) * 140);
    parts.push(<Cert key={i} x={x} y={y} w={9 + rand(i * 7.7) * 7} rot={k * 540 * (rand(i) - 0.5) * 2} />);
  }
  const lastLand = (pi: number) => {
    // dernière arrivée d'un morceau chez la personne pi
    const n = Math.floor(((t - b.decoupe - 0.9 - 0.9) / 2.3) * NP);
    for (let i = Math.min(NP - 1, n); i >= 0; i--) if (i % CROWD.length === pi) return partT(i, b) + 0.9;
    return -10;
  };
  // le grand certificat de Neeltgen
  const tc0 = b.servante + 0.1;
  const kc = ease(t, tc0, 0.75);
  const cStart: P2 = [sx + 30, sy - 260];
  const cEnd: P2 = [P1.x + 20, P1.y + 35.5];
  const empty = ease(t, c.words.manque - 0.2, 0.4, overshoot);
  return (
    <g>
      <Bg />
      <Title t={t} t0={b.an1602}>Amsterdam, 1602</Title>
      {/* la ville : pignons à redents */}
      {Array.from({length: 9}, (_, i) => {
        const x = 120 + i * 102;
        const h = 170 + rand(i * 4.2) * 120;
        const top = 760 - h;
        return (
          <g key={i} opacity={0.9}>
            <path d={handPath([[x, 760], [x, top + 40], [x + 14, top + 40], [x + 14, top + 20], [x + 30, top + 20], [x + 30, top], [x + 62, top], [x + 62, top + 20], [x + 78, top + 20], [x + 78, top + 40], [x + 92, top + 40], [x + 92, 760]], frame, 300 + i, 1)} fill={['#F7EBDD', '#EEDCC6', '#F2E3D0'][i % 3]} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            {[0, 1].map((r) => [0, 1].map((col) => <rect key={`${r}${col}`} x={x + 18 + col * 34} y={top + 60 + r * 52} width={20} height={28} fill="#9DB6CF" stroke={C.ink} strokeWidth={3} />))}
          </g>
        );
      })}
      <Waves x0={60} x1={1060} y={830} t={t} rows={8} id={40} bottom={G} />
      <Ship x={sx} y={sy} s={0.82} rot={rock} grid={grid} id={50} />
      {CROWD.map((p, i) => {
        const L = lastLand(i);
        const bob = t > L && t < L + 0.5 ? Math.sin(((t - L) / 0.5) * Math.PI) * 14 : 0;
        return <Person key={i} x={p.x} y={p.y} s={0.85} hat={p.hat} color={p.color} bob={bob} />;
      })}
      {parts}
      {/* la caisse vide */}
      {empty > 0 ? (
        <g transform={`translate(640 ${G - 6}) scale(${empty})`}>
          <path d={handPath([[-80, -90], [-96, -190], [64, -190], [80, -90]], frame, 62, 1)} fill="#A9743F" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <path d={handPath([[-80, 0], [-80, -90], [80, -90], [80, 0], [-80, 0]], frame, 61, 1)} fill="#8A5A2B" stroke={C.ink} strokeWidth={6} />
          <rect x={-66} y={-100} width={132} height={22} rx={6} fill="#2A1A0C" />
          <path d={`M -10 ${-210 - ((t * 60) % 60)} q 10 -16 20 0 q 10 -16 20 0`} stroke={C.muted} strokeWidth={4} fill="none" opacity={1 - ((t * 1) % 1)} />
          <T x={0} y={-30} size={30} a="middle" color={C.white}>caisse vide</T>
        </g>
      ) : null}
      {/* compteur de souscripteurs */}
      {t > b.decoupe + 0.9 ? (
        <g opacity={ease(t, b.decoupe + 0.9, 0.3)}>
          <T x={W / 2} y={392} size={46} a="middle" color={C.pen}>{`${fmtFR(landed)} souscripteurs`}</T>
          <T x={W / 2} y={432} size={28} a="middle" color={C.muted} w={400}>registre d’Amsterdam, août 1602</T>
        </g>
      ) : null}
      {/* Neeltgen */}
      {t > tc0 && kc < 1 ? (
        <g transform={`translate(${lerp(cStart[0], cEnd[0], kc)} ${lerp(cStart[1], cEnd[1], kc) - Math.sin(Math.PI * kc) * 220}) rotate(${(1 - kc) * 200})`}>
          <rect x={-20} y={-35.5} width={40} height={71} fill={PARCH} stroke={C.ink} strokeWidth={3} />
        </g>
      ) : null}
      {pop(frame, b.servante + 0.5) > 0.01 ? (
        <g transform={`translate(${CROWD[NEEL].x + 150} 560) scale(${0.7 + 0.3 * clamp01(pop(frame, b.servante + 0.5))})`} opacity={clamp01(pop(frame, b.servante + 0.5) * 2)}>
          <HRect x={0} y={4} w={520} h={110} fill={C.white} stroke={C.orange} sw={5} id={70} />
          <T x={0} y={-6} size={36} a="middle" color={C.orange}>Neeltgen, servante : 100 florins</T>
          <T x={0} y={40} size={28} a="middle" color={C.muted} w={400} o={ease(t, b.servante + 0.9, 0.3)}>plus de 200 jours de salaire</T>
        </g>
      ) : null}
    </g>
  );
};

// =====================================================================
// S1 — dans le certificat : une action, deux façons de gagner
// =====================================================================
const Action = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const k0 = ease(t, b.actions + 0.5, 0.6);
  const deux = ease(t, b.deux, 0.5, easeOut);
  const tilt = lerp(0, -62, ease(t, c.words.epices - 1.2, 0.6, easeOut));
  const pourT = c.words.epices - 0.7;
  const grains: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const t0 = pourT + i * 0.03;
    if (t < t0) break;
    const k = clamp01((t - t0) / 0.55);
    const x = 238 + (rand(i) - 0.5) * 30 + k * 30;
    const yEnd = 1290 - Math.floor(i / 9) * 7;
    const y = lerp(1000, yEnd, k * k);
    grains.push(<ellipse key={i} cx={x + (k >= 1 ? (rand(i * 3) - 0.5) * 120 : 0)} cy={y} rx={7} ry={5} fill="#C2410C" stroke={C.ink} strokeWidth={1.5} />);
  }
  const pv = ease(t, b.plusvalue + 0.4, 1.0, easeInOut);
  return (
    <g>
      <Bg color={PARCH} grid={false} />
      {/* bordure ornée */}
      <rect x={34} y={34} width={W - 68} height={1852} fill="none" stroke={C.ink} strokeWidth={8} />
      <rect x={54} y={54} width={W - 108} height={1812} fill="none" stroke="#9C7A3C" strokeWidth={4} strokeDasharray="22 10" />
      {[[34, 34], [W - 34, 34], [34, 1886], [W - 34, 1886]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={20} fill={PARCH_D} stroke={C.ink} strokeWidth={5} />)}
      <T x={W / 2} y={190} size={104} a="middle" color="#5B3A12">ACTION</T>
      <T x={W / 2} y={252} size={40} a="middle" color="#7A5A2A" w={400}>Compagnie des Indes orientales · 1602</T>
      <Seal x={900} y={150} r={58} />
      <line x1={180} y1={290} x2={900} y2={290} stroke="#9C7A3C" strokeWidth={4} />
      {/* une part de l'entreprise */}
      <g opacity={k0}>
        <T x={W / 2} y={372} size={50} a="middle">une action = une part de l’entreprise</T>
        {Array.from({length: 24}, (_, i) => {
          const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const a1 = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2;
          const mine = i === 3;
          const out = mine ? ease(t, b.actions + 1.1, 0.4, overshoot) * 30 : 0;
          const am = (a0 + a1) / 2;
          const cx = 540 + Math.cos(am) * out;
          const cy = 560 + Math.sin(am) * out;
          const r = 140 * clamp01(k0 * 1.2);
          return (
            <path key={i} d={`M ${cx} ${cy} L ${cx + Math.cos(a0) * r} ${cy + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(a1) * r} ${cy + Math.sin(a1) * r} Z`} fill={mine ? C.orange : i % 2 ? '#E9D6A8' : '#F6E9C8'} stroke={C.ink} strokeWidth={3} />
          );
        })}
        <T x={720} y={470} size={36} color={C.orange} o={ease(t, b.actions + 1.3, 0.3)}>ta part</T>
      </g>
      {/* deux façons de gagner */}
      {deux > 0 ? (
        <g opacity={deux}>
          <path d={handPath([[470, 690], [300, 750]], frame, 80, 1)} stroke={C.pen} strokeWidth={6} fill="none" />
          <path d={handPath([[610, 690], [740, 750]], frame, 81, 1)} stroke={C.pen} strokeWidth={6} fill="none" />
          <Label x={290} y={810} k={1} text="① dividende" size={46} color={C.green} id={82} />
          <Label x={770} y={810} k={1} text="② plus-value" size={46} color={C.pen} id={83} />
        </g>
      ) : null}
      {/* dividende : une part des bénéfices… payée en épices */}
      {t > b.dividende ? (
        <g opacity={ease(t, b.dividende, 0.4)}>
          <T x={130} y={920} size={34} color={C.muted} w={400}>une part des bénéfices</T>
          <Sack x={220 + (1 - ease(t, b.dividende, 0.5, overshoot)) * -300} y={1060} tilt={tilt} id={84} />
          {grains}
          <path d={handPath([[150, 1260], [170, 1330], [360, 1330], [380, 1260]], frame, 85, 1)} fill="#E7D3A7" stroke={C.ink} strokeWidth={6} />
          <Label x={300} y={1180} k={pop(frame, c.words.epices)} text="1610 : payé en épices !" size={34} color="#C2410C" id={86} />
        </g>
      ) : null}
      {/* plus-value */}
      {t > b.plusvalue ? (
        <g opacity={ease(t, b.plusvalue, 0.3)}>
          <T x={500} y={1300} size={36}>achat : 100</T>
          <path d={handPath([[540, 1250], [590, 1190], [640, 1130], [680, 1070]], frame, 87, 1)} stroke={C.green} strokeWidth={8} fill="none" strokeDasharray={`${pv * 260} 400`} />
          <T x={500} y={1030} size={36} o={ease(t, b.plusvalue + 1.2, 0.3)}>revente : 140</T>
          <Label x={520} y={1150} k={pop(frame, b.plusvalue + 1.6)} text="+40" size={44} color={C.green} id={88} w={120} />
        </g>
      ) : null}
      <path d={handPath([[80, G], [1000, G]], frame, 89, 1)} stroke="#5B3A12" strokeWidth={5} fill="none" />
      <T x={110} y={G - 14} size={24} color="#7A5A2A" w={400} o={1 - ease(t, b.dividende, 0.3)}>signature de l’actionnaire</T>
    </g>
  );
};

// =====================================================================
// S2 — le carnet d'ordres (vrai moteur d'appariement) et le krach du 19/10/1987
// =====================================================================
const LX = 415; // colonne des prix
const LY = 880; // centre de l'échelle
const LH = 72; // hauteur d'un niveau
const BW = 34; // largeur d'une unité de quantité
const LADDER = {x0: 110, x1: 720, y0: 482, y1: 1282};

const Carnet = (t: number, c: Ctx) => {
  const {b, frame, ev, lastAt} = c;
  const st: BookState = runBook(ev, t);
  // l'échelle suit le cours (moyenne glissante, pour un défilement doux)
  let vc = 0;
  for (let k = 0; k < 8; k++) vc += lastAt(t - k * 0.07);
  vc /= 8;
  const yOf = (p: number) => LY + (vc - p) * LH;
  const bb = bestBid(st);
  const ba = bestAsk(st);
  const krach = t > b.vide;
  const lvls: React.ReactNode[] = [];
  for (let p = Math.floor(vc) - 8; p <= Math.ceil(vc) + 8; p++) {
    const y = yOf(p);
    lvls.push(
      <g key={p}>
        <line x1={LADDER.x0} y1={y + LH / 2} x2={LADDER.x1} y2={y + LH / 2} stroke="rgba(20,19,26,0.08)" strokeWidth={2} />
        <T x={LX} y={y + 13} size={36} a="middle" color={p === st.last ? C.ink : C.muted} w={p === st.last ? 700 : 400}>{eur(p)}</T>
      </g>,
    );
  }
  // ordres au repos : file d'attente, le plus ancien collé au centre (servi en premier)
  const blocks: React.ReactNode[] = [];
  const drawSide = (m: Map<number, Order[]>, side: 'B' | 'S') => {
    for (const [p, q] of m) {
      let off = 0;
      for (const o of q) {
        const w = o.q * BW - 4;
        const x = side === 'B' ? LX - 62 - off - w : LX + 62 + off;
        const born = ease(t, o.t, 0.15);
        blocks.push(<rect key={`${side}${o.id}`} x={x} y={yOf(p) - 25} width={w} height={50} rx={8} fill={side === 'B' ? '#BFE8DD' : '#F6C7C2'} stroke={side === 'B' ? C.green : C.red} strokeWidth={4} opacity={0.4 + 0.6 * born} />);
        if (w > 30) blocks.push(<T key={`q${o.id}`} x={x + w / 2} y={yOf(p) + 12} size={32} a="middle" color={side === 'B' ? C.green : C.red}>{o.q}</T>);
        off += o.q * BW;
      }
    }
  };
  drawSide(st.bids, 'B');
  drawSide(st.asks, 'S');
  // ordres en vol (arrivent pile quand ils sont traités)
  const flying: React.ReactNode[] = [];
  const robotsK = ease(t, b.k1987, 0.6, easeOut);
  const robotPos = (i: number): P2 => [800 + (i % 2) * 140, 700 - (i % 2) * 40];
  for (const e of ev) {
    if (e.kind === 'cancel' || e.t <= t || e.t > t + 0.45) continue;
    const k = 1 - (e.t - t) / 0.45;
    const dest: P2 = e.kind === 'market' ? [LX, yOf(bb ?? vc)] : [e.side === 'B' ? LX - 120 : LX + 120, yOf(e.p)];
    const src: P2 = e.src === 'robot' ? robotPos(e.id) : e.side === 'B' ? [40, dest[1] + 80] : [W - 20, dest[1] - 80];
    const x = lerp(src[0], dest[0], easeOut(k));
    const y = lerp(src[1], dest[1], easeOut(k)) - Math.sin(Math.PI * k) * 40;
    const col = e.side === 'B' ? C.green : C.red;
    const intro = t < b.fourchette + 2;
    flying.push(
      <g key={e.id} transform={`translate(${x} ${y})`}>
        <rect x={-78} y={-28} width={156} height={56} rx={12} fill={C.white} stroke={col} strokeWidth={5} />
        <T x={0} y={11} size={intro ? 30 : 32} a="middle" color={col}>{e.kind === 'market' ? 'VENTE !' : intro ? `${e.side === 'B' ? 'max' : 'min'} ${eur(e.p)}` : `${e.side === 'B' ? 'achat' : 'vente'}`}</T>
      </g>,
    );
  }
  // ordres qui disparaissent (exécutés / annulés)
  const ghosts = st.ghosts.filter((g) => t - g.t < 0.45).map((g, i) => {
    const k = (t - g.t) / 0.45;
    const y = yOf(g.o.p);
    if (g.how === 'cancel') {
      return <rect key={`g${i}`} x={LX - 200 - k * 300} y={y - 25} width={g.o.q * BW} height={50} rx={8} fill="#BFE8DD" stroke={C.green} strokeWidth={4} opacity={1 - k} />;
    }
    return <circle key={`g${i}`} cx={LX + (g.o.side === 'B' ? -90 : 90)} cy={y} r={20 + k * 40} fill="none" stroke={C.hl} strokeWidth={8} opacity={1 - k} />;
  });
  const flashes = st.trades.filter((tr) => t - tr.t < 0.5).map((tr, i) => <Burst key={`f${i}`} x={LX} y={yOf(tr.p)} k={(t - tr.t) / 0.5} r={90} seed={tr.t * 10} />);
  // fourchette
  const fk = ease(t, b.fourchette, 0.4) * (1 - ease(t, b.vide, 0.4));
  const lastTr = st.trades[st.trades.length - 1];
  const prevDiff = [...st.trades].reverse().find((x) => lastTr && x.p !== lastTr.p);
  const up = lastTr && prevDiff ? lastTr.p > prevDiff.p : true;
  const coursK = ease(t, b.cours, 0.3, easeOut);
  // Dow Jones du 19 octobre 1987
  const dow = lerp(2246.74, 1738.74, ease(t, b.chute + 0.2, 3.0, easeIn));
  const dowK = ease(t, b.chute, 0.4);
  const yearK = ease(t, b.pourtant + 0.4, 0.5, easeOut);
  return (
    <g>
      <Bg />
      <Title t={t} t0={b.qui} t1={b.carnet}>qui fixe le prix ?</Title>
      <Title t={t} t0={b.carnet} t1={b.vide}>le carnet d’ordres</Title>
      <Title t={t} t0={b.vide} t1={b.k1987} color={C.red}>un krach</Title>
      <Title t={t} t0={b.k1987} color={C.red}>19 octobre 1987</Title>
      {t < b.carnet ? <T x={LX} y={900} size={200} a="middle" color={C.orange} o={ease(t, b.qui + 0.6, 0.4)} rot={Math.sin(t * 3) * 5}>?</T> : null}
      <g opacity={ease(t, b.carnet - 0.2, 0.5)}>
        <T x={235} y={458} size={32} a="middle" color={C.green}>ACHETEURS</T>
        <T x={595} y={458} size={32} a="middle" color={C.red}>VENDEURS</T>
        <T x={LX} y={1322} size={24} a="middle" color={C.muted} w={400}>simulation · prix fictifs · vrai moteur d’appariement</T>
        <rect x={LX - 58} y={LADDER.y0} width={116} height={LADDER.y1 - LADDER.y0} fill={C.white} opacity={0.6} />
        <g clipPath="url(#ladder)">
          {fk > 0 && bb !== null && ba !== null ? (
            <g opacity={fk}>
              <rect x={LX - 58} y={yOf(ba) + 26} width={116} height={yOf(bb) - yOf(ba) - 52} fill={C.hlSoft} />
              <rect x={LX + 66} y={(yOf(ba) + yOf(bb)) / 2 - 26} width={190} height={50} rx={10} fill={C.hl} stroke={C.ink} strokeWidth={4} />
              <T x={LX + 161} y={(yOf(ba) + yOf(bb)) / 2 + 10} size={32} a="middle" color={C.ink}>fourchette</T>
            </g>
          ) : null}
          {lvls}
          {blocks}
          {ghosts}
          {flashes}
        </g>
        {krach && t > b.fuite && bb === null ? <T x={225} y={LY + 120} size={34} a="middle" color={C.red} o={0.5 + 0.5 * Math.sin(t * 8)}>plus d’acheteurs…</T> : null}
      </g>
      {/* le cours */}
      {lastTr ? (
        <g transform={`translate(255 372) scale(${1 + 0.15 * (1 - coursK) * (t > b.cours ? 1 : 0)})`}>
          <HRect x={0} y={-12} w={330} h={72} fill={C.white} stroke={up ? C.green : C.red} sw={6} id={95} />
          <T x={0} y={8} size={40} a="middle" color={up ? C.green : C.red}>{`cours ${eur(lastTr.p)} € ${up ? '▲' : '▼'}`}</T>
        </g>
      ) : null}
      {flying}
      {/* les programmes vendeurs */}
      {robotsK > 0 ? (
        <g opacity={robotsK} transform={`translate(${(1 - robotsK) * 300} 0)`}>
          <rect x={735} y={705} width={320} height={16} rx={6} fill="#8A8A92" stroke={C.ink} strokeWidth={4} />
          {[0, 1].map((i) => {
            const press = ev.some((e) => e.src === 'robot' && e.id % 2 === i && t - e.t > -0.5 && t - e.t < -0.3) ? 1 : 0;
            return <Robot key={i} x={820 + i * 140} y={700} s={0.8} press={press} id={96 + i} />;
          })}
          <T x={895} y={790} size={28} a="middle" color={C.muted} w={400}>« assurance de portefeuille »</T>
        </g>
      ) : null}
      {/* Dow Jones */}
      {dowK > 0 ? (
        <g opacity={dowK}>
          <HRect x={890} y={372} w={300} h={110} fill={C.white} stroke={C.red} sw={6} id={97} />
          <T x={890} y={352} size={30} a="middle" color={C.muted}>Dow Jones</T>
          <T x={890} y={404} size={50} a="middle" color={C.red}>{fmtFR(dow, 2)}</T>
        </g>
      ) : null}
      <Stamp x={LX} y={760} k={ease(t, b.chute + 2.6, 0.35, overshoot)} w={330} text="−22,6 %" size={70} />
      <Label x={LX} y={880} k={pop(frame, c.words.pire)} text="son pire jour, à ce jour" size={34} color={C.red} id={94} />
      {/* et pourtant… */}
      {yearK > 0 ? (
        <g opacity={yearK}>
          <rect x={130} y={960} width={580} height={300} rx={18} fill={C.white} stroke={C.ink} strokeWidth={5} opacity={0.96} />
          <g transform="translate(250 1110)">
            <HRect x={0} y={0} w={150} h={158} fill={C.white} id={98} />
            <rect x={-71} y={-75} width={142} height={44} fill={C.red} opacity={0.9} />
            <T x={0} y={-42} size={32} a="middle" color={C.white}>1987</T>
            <T x={0} y={30} size={54} a="middle">31</T>
            <T x={0} y={66} size={28} a="middle" color={C.muted}>déc.</T>
          </g>
          <T x={350} y={1070} size={36}>sur l’année 1987 :</T>
          <Stamp x={510} y={1150} k={ease(t, c.words.hausse - 0.1, 0.35, overshoot)} w={240} text="+5,8 %" size={56} color={C.green} rot={-5} />
          <T x={350} y={1238} size={24} color={C.muted} w={400}>S&amp;P 500, dividendes inclus</T>
        </g>
      ) : null}
      <Ground frame={frame} id={99} />
    </g>
  );
};

// =====================================================================
// S3 — le grand huit 1928-2025, la planche de Galton, la durée
// =====================================================================
type Cam = {x: number; y: number; z: number};
const OVZ = 860 / 5880;
const OV: Cam = {x: 2940, y: -1300 + 440 / OVZ, z: OVZ}; // toute la courbe en haut de l'écran
const toScreen = (cam: Cam, p: P2): P2 => [540 + (p[0] - cam.x) * cam.z, 960 + (p[1] - cam.y) * cam.z];
/** de la caméra a à la caméra b : zoom géométrique, et le point suivi f glisse en ligne droite à l'écran */
const camLerp = (a: Cam, b2: Cam, e: number, f: P2): Cam => {
  const z = Math.exp(lerp(Math.log(a.z), Math.log(b2.z), e));
  const sa = toScreen(a, f);
  const sb = toScreen(b2, f);
  const sx = lerp(sa[0], sb[0], e);
  const sy = lerp(sa[1], sb[1], e);
  return {x: f[0] - (sx - 540) / z, y: f[1] - (sy - 960) / z, z};
};
const anchors = (b: B): [number, number][] => [
  [b.cent + 0.45, 0],
  [b.k1929 - 0.1, 1],
  [b.k1929 + 0.9, 5],
  [b.k1973 + 0.55, 45],
  [b.k1973 + 0.95, 47],
  [b.k2000 + 0.45, 72],
  [b.k2000 + 0.9, 75],
  [b.k2008 + 0.35, 80],
  [b.k2008 + 0.75, 81],
  [b.million + 0.6, 98],
];
const follow = (t: number, b: B): Cam => {
  const A = anchors(b);
  const u = coasterU(t, A);
  const p = trackAt(u);
  // zoom selon la vitesse (moyennée) : plus ça va vite, plus on recule
  let zs = 0;
  for (let k = -4; k <= 4; k++) {
    const t2 = t + k * 0.06;
    const pa = trackAt(coasterU(t2 - 0.04, A));
    const pb = trackAt(coasterU(t2 + 0.04, A));
    const v = Math.hypot(pb.x - pa.x, pb.y - pa.y) / 0.08;
    zs += Math.max(0.3, Math.min(1, 520 / Math.max(1, v)));
  }
  const z = zs / 9;
  return {x: p.x + 110 / z, y: p.y - 40 / z, z};
};
const ZO = (b: B) => ({t0: b.monte - 0.25, t1: b.monte + 1.05}); // zoom arrière krach → courbe
const camAt3 = (t: number, b: B): Cam => {
  const z = ZO(b);
  const tDive = z.t1;
  const wp = (tt: number): P2 => {
    const p = trackAt(coasterU(tt, anchors(b)));
    return [p.x, p.y];
  };
  if (t < tDive) return OV;
  if (t < tDive + 1.1) return camLerp(OV, follow(t, b), ease(t, tDive, 1.1), wp(t));
  if (t < b.billes) return follow(t, b);
  return camLerp(follow(b.billes, b), OV, ease(t, b.billes, 1.2), wp(t));
};
// planche de Galton (écran)
const GX = 480;
const GSP = 72;
const GTOP = 790;
const GROW = 30;
const BALL_R = 10.5;
const binX = (bin: number) => GX + (bin - 5) * GSP;
const slotPos = (i: number): P2 => {
  const s = SLOT[i];
  return [binX(binOf(RET[i])) + ((s % 3) - 1) * 22, G - 8 - BALL_R - Math.floor(s / 3) * 21];
};
const relT = (i: number, b: B) => b.billes + 0.95 + i * 0.04;
// nuage de points (périodes glissantes)
const SY = (r: number) => 860 - r * 800;
const COLX = [240, 480, 700];
const swarm = (vals: number[], cx: number): P2[] => {
  const out: P2[] = [];
  const order = vals.map((v, i) => [v, i] as [number, number]).sort((a, c) => a[0] - c[0]);
  const res: P2[] = new Array(vals.length);
  for (const [v, i] of order) {
    const y = SY(v);
    let dx = 0;
    for (let k = 0; k < 40; k++) {
      dx = (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 19;
      if (!out.some(([x2, y2]) => Math.hypot(x2 - (cx + dx), y2 - y) < 18.5)) break;
    }
    res[i] = [cx + dx, y];
    out.push(res[i]);
  }
  return res;
};
const R1 = RET;
const R10 = rolling(10);
const R20 = rolling(20);
const SW1 = swarm(R1, COLX[0]);
/** nuage serré dans sa colonne (les périodes longues se ressemblent : les points se tassent) */
const cloud = (vals: number[], cx: number, seed: number): P2[] => vals.map((v, i) => [cx + (rand(i * 7.3 + seed) - 0.5) * 150, SY(v) + (rand(i * 3.7 + seed) - 0.5) * 6]);
const SW10 = cloud(R10.map((x) => x.r), COLX[1], 11);
const SW20 = cloud(R20.map((x) => x.r), COLX[2], 23);
const YEAR_SIGNS: {u0: number; u1: number; text: string; beat: string}[] = [
  {u0: 1, u1: 5, text: '1929-32 : −65 %', beat: 'k1929'},
  {u0: 45, u1: 47, text: '1973-74 : −36 %', beat: 'k1973'},
  {u0: 72, u1: 75, text: '2000-02 : −37 %', beat: 'k2000'},
  {u0: 80, u1: 81, text: '2008 : −37 %', beat: 'k2008'},
];

const Courbe = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const cam = camAt3(t, b);
  const A = anchors(b);
  const u = coasterU(t, A);
  const wp = trackAt(u);
  const curveO = 1 - ease(t, b.duree, 0.7);
  const galtonO = ease(t, b.billes + 0.5, 0.5) * (1 - ease(t, b.duree + 0.3, 0.6));
  // le monde (courbe) — traits à épaisseur constante à l'écran
  const tr = TRACK.filter((_, i) => i % 2 === 0);
  const d = `M ${tr.map((p) => p.join(' ')).join(' L ')}`;
  const wagonO = 1 - ease(t, b.billes + 0.2, 0.4);
  const decades = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
  const vlines = [1e3, 1e4, 1e5, 1e6];
  const pierrotKeys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    ...A.slice(2).filter((_, i) => i % 2 === 0).map((a) => ({t: a[0] - 0.9, pose: 'choque' as const, hold: 0.7})),
    {t: b.million + 0.6, pose: 'content', hold: 3},
  ];
  // billes
  const balls: React.ReactNode[] = [];
  if (t > b.billes + 0.6) {
    for (let i = 0; i < RET.length; i++) {
      const t0 = relT(i, b);
      const tp = trackAt(i + 1);
      const start = toScreen(cam, [tp.x, tp.y]);
      let x = start[0];
      let y = start[1];
      let o = clamp01((t - (b.billes + 0.6)) * 3);
      if (t > t0) {
        const m = galtonMoves(i);
        const k = t - t0;
        if (k < 0.35) {
          const e = easeIn(k / 0.35);
          x = lerp(start[0], GX, e);
          y = lerp(start[1], GTOP - 30, e) - Math.sin(Math.PI * e) * 60;
        } else if (k < 0.35 + N_ROWS * 0.055) {
          const f = (k - 0.35) / 0.055;
          const r = Math.floor(f);
          const q = f - r;
          const right = m.slice(0, r).reduce((s2, v) => s2 + v, 0);
          const xa = GX + (right - r / 2) * GSP;
          const xb = GX + (right + m[r] - (r + 1) / 2) * GSP;
          x = lerp(xa, xb, q);
          y = GTOP - 30 + r * GROW + q * GROW - Math.sin(Math.PI * q) * 12;
        } else {
          const right = m.reduce((s2, v) => s2 + v, 0);
          const xa = GX + (right - N_ROWS / 2) * GSP;
          const [sx, sy] = slotPos(i);
          const e = clamp01((k - 0.35 - N_ROWS * 0.055) / 0.3);
          x = lerp(xa, sx, e);
          y = lerp(GTOP - 30 + N_ROWS * GROW, sy, e * e);
          if (t > b.duree + 0.2) {
            const k2 = ease(t, b.duree + 0.2 + i * 0.012, 0.7);
            x = lerp(sx, SW1[i][0], k2);
            y = lerp(sy, SW1[i][1], k2) - Math.sin(Math.PI * k2) * 120;
          }
        }
        o = 1;
      }
      const neg = RET[i] < 0;
      const hl = (i === 3 && t > b.pire) || (i === 26 && t > b.meilleure);
      balls.push(
        <g key={i} opacity={o}>
          <circle cx={x} cy={y} r={BALL_R * (hl ? 1.3 : 1)} fill={neg ? C.red : C.green} stroke={C.ink} strokeWidth={2.5} />
          <text x={x} y={y + 3} fontSize={7.5} textAnchor="middle" fill={C.white} style={{fontFamily: F.note}}>{YEARS[i]}</text>
        </g>,
      );
    }
  }
  const landed = RET.filter((_, i) => t > relT(i, b) + 0.35 + N_ROWS * 0.055 + 0.3);
  const ups = landed.filter((r) => r > 0).length;
  const downs = landed.length - ups;
  // compteur du grand huit
  const cK = ease(t, b.cent, 0.4) * (1 - ease(t, b.billes + 0.3, 0.4));
  const durK = ease(t, b.duree + 0.4, 0.5);
  const colK = (k: number) => ease(t, [b.duree + 1.0, b.dix, b.vingt][k], 0.4);
  const funnel = ease(t, b.vingt + 1.2, 0.8);
  const ext = [R1, R10.map((x) => x.r), R20.map((x) => x.r)].map((v) => [Math.min(...v), Math.max(...v)]);
  return (
    <g>
      <Bg grid={false} />
      <rect x={-40} y={-40} width={W + 80} height={2000} fill="url(#bgrid)" transform={`translate(${-((cam.x * cam.z) % 54)} ${-((cam.y * cam.z) % 54)})`} />
      {/* ---- la courbe (monde) ---- */}
      <g opacity={curveO}>
        <g transform={`translate(540 960) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
          {vlines.map((v) => {
            const y = -Math.log10(v / 100) * PXD;
            return (
              <g key={v}>
                <line x1={-200} y1={y} x2={6100} y2={y} stroke={C.penLight} strokeWidth={2} strokeDasharray="10 12" vectorEffect="non-scaling-stroke" />
                {[0, 1, 2, 3, 4].map((k) => <T key={k} x={k * 1400 + 20} y={y - 14} size={40} color={C.pen} w={400} o={0.7}>{`${fmtFR(v)} $`}</T>)}
              </g>
            );
          })}
          {TRACK.filter((_, i) => i % 32 === 0).map((p, i) => <line key={i} x1={p[0]} y1={p[1] + 8} x2={p[0]} y2={330} stroke="#B5AA96" strokeWidth={2} opacity={0.7} vectorEffect="non-scaling-stroke" />)}
          <line x1={-100} y1={330} x2={6000} y2={330} stroke={C.ink} strokeWidth={4} vectorEffect="non-scaling-stroke" />
          {decades.map((y) => <T key={y} x={(y - 1928) * 60} y={390} size={44} a="middle" color={C.muted}>{y}</T>)}
          <path d={d} fill="none" stroke={C.ink} strokeWidth={9} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" stroke={C.orange} strokeWidth={3} strokeLinejoin="round" vectorEffect="non-scaling-stroke" transform="translate(0 -9)" />
          {YEAR_SIGNS.map((s, i) => {
            const pa = trackAt(s.u0);
            const k = clamp01((u - s.u0 + 0.6) * 2) * (t < b.billes ? 1 : 1 - ease(t, b.billes, 0.4));
            return k > 0 ? (
              <g key={i} transform={`translate(${pa.x + 40} ${pa.y - 330}) scale(${0.6 + 0.4 * k})`} opacity={k}>
                <line x1={20} y1={16} x2={20} y2={240} stroke="#8A6A3A" strokeWidth={10} strokeLinecap="round" />
                <rect x={-10} y={-62} width={s.text.length * 21 + 24} height={78} rx={10} fill={C.white} stroke={C.red} strokeWidth={5} />
                <T x={2} y={0} size={42} color={C.red}>{s.text}</T>
              </g>
            ) : null;
          })}
          {/* le wagonnet et Pierrot */}
          {wagonO > 0 ? (
            <g transform={`translate(${wp.x} ${wp.y - 26}) rotate(${(wp.ang * 180) / Math.PI})`} opacity={wagonO}>
              <Cart />
              <g transform="translate(-6 -16) scale(0.55)">
                <Mascot look="pierrot" talk={0} scale={1} time={t} track={{ground: 0, x: 0, facing: 1, keys: pierrotKeys}} />
              </g>
              <Cart front />
            </g>
          ) : null}
        </g>
      </g>
      {/* ---- le compteur ---- */}
      {cK > 0 ? (
        <g opacity={cK}>
          <rect x={250} y={250} width={580} height={190} rx={22} fill={C.white} stroke={C.ink} strokeWidth={6} opacity={0.94} />
          <T x={540} y={312} size={46} a="middle" color={C.muted}>{`${Math.min(2025, 1928 + Math.floor(u))}`}</T>
          <T x={540} y={402} size={88} a="middle" color={u > 97.5 ? C.green : C.ink}>{`${fmtFR(Math.round(valueAt(u)))} $`}</T>
          <T x={540} y={485} size={30} a="middle" color={C.pen} w={400} o={ease(t, c.words.hors - 0.1, 0.3)}>hors inflation (dollars courants)</T>
          <T x={540} y={485} size={30} a="middle" color={C.muted} w={400} o={(1 - ease(t, c.words.hors - 0.3, 0.2)) * ease(t, b.cent + 0.3, 0.3)}>dividendes réinvestis · échelle log</T>
        </g>
      ) : null}
      {/* ---- planche de Galton ---- */}
      {galtonO > 0 ? (
        <g opacity={galtonO}>
          <path d={handPath([[GX - 70, GTOP - 80], [GX - 14, GTOP - 36], [GX - 14, GTOP - 26]], frame, 120, 1)} stroke={C.ink} strokeWidth={5} fill="none" />
          <path d={handPath([[GX + 70, GTOP - 80], [GX + 14, GTOP - 36], [GX + 14, GTOP - 26]], frame, 121, 1)} stroke={C.ink} strokeWidth={5} fill="none" />
          {Array.from({length: N_ROWS}, (_, r) => Array.from({length: r + 1}, (_, j) => <circle key={`${r}-${j}`} cx={GX + (j - r / 2) * GSP} cy={GTOP + r * GROW} r={4.5} fill={C.ink} />))}
          {Array.from({length: 12}, (_, k) => <line key={k} x1={binX(k - 0.5)} y1={GTOP + N_ROWS * GROW - 6} x2={binX(k - 0.5)} y2={G - 8} stroke={C.ink} strokeWidth={4} />)}
          <T x={binX(0)} y={GTOP + N_ROWS * GROW + 26} size={24} a="middle" color={C.red}>−50 %</T>
          <T x={binX(5) - GSP / 2} y={GTOP + N_ROWS * GROW + 26} size={24} a="middle" color={C.muted}>0</T>
          <T x={binX(10)} y={GTOP + N_ROWS * GROW + 26} size={24} a="middle" color={C.green}>+50 %</T>
          {/* bilan */}
          <g opacity={ease(t, b.billes + 1.0, 0.4)}>
            <T x={130} y={330} size={50} color={C.green}>{`▲ ${ups} en hausse`}</T>
            <T x={130} y={392} size={50} color={C.red}>{`▼ ${downs} en baisse`}</T>
            <T x={130} y={440} size={28} color={C.muted} w={400}>1 bille = 1 année · 1928 → 2025</T>
          </g>
          <Label x={190} y={1015} k={pop(frame, b.pire + 0.3)} text="1931 : −44 %" size={40} color={C.red} id={122} />
          <Label x={790} y={1015} k={pop(frame, b.meilleure + 0.3)} text="1954 : +53 %" size={40} color={C.green} id={123} />
          {t > b.moyenne ? (
            <g opacity={ease(t, b.moyenne, 0.4)}>
              <line x1={binX(5.5)} y1={GTOP - 10} x2={binX(5.5)} y2={G - 8} stroke={C.orange} strokeWidth={6} strokeDasharray="16 10" />
              <Label x={binX(5.5) + 10} y={GTOP - 52} k={pop(frame, b.moyenne + 0.2)} text="≈ 10 %/an, composés" size={36} color={C.orange} id={124} />
            </g>
          ) : null}
        </g>
      ) : null}
      {/* ---- la durée : périodes glissantes ---- */}
      {durK > 0 ? (
        <g>
          <Title t={t} t0={b.duree + 0.4}>le vrai secret : la durée</Title>
          <g opacity={durK}>
            <line x1={150} y1={SY(0)} x2={800} y2={SY(0)} stroke={C.red} strokeWidth={4} strokeDasharray="12 10" />
            <T x={150} y={SY(0) - 12} size={28} color={C.red}>0 %</T>
            {funnel > 0 ? (
              <path d={`M ${COLX[0] - 70} ${SY(ext[0][1])} L ${COLX[1]} ${SY(ext[1][1])} L ${COLX[2] + 60} ${SY(ext[2][1])} L ${COLX[2] + 60} ${SY(ext[2][0])} L ${COLX[1]} ${SY(ext[1][0])} L ${COLX[0] - 70} ${SY(ext[0][0])} Z`} fill="rgba(31,63,191,0.08)" stroke={C.pen} strokeWidth={4} strokeDasharray="10 8" opacity={funnel} />
            ) : null}
            {['sur 1 an', 'sur 10 ans', 'sur 20 ans'].map((s, k) => (
              <g key={k} opacity={colK(k)}>
                <T x={COLX[k]} y={1290} size={38} a="middle">{s}</T>
                <T x={COLX[k]} y={1336} size={32} a="middle" color={k === 2 ? C.green : C.red}>{['perte : 26 / 98', 'perte : 5 / 89', 'perte : 0 / 79'][k]}</T>
              </g>
            ))}
            <T x={760} y={SY(0.55)} size={26} color={C.muted} w={400} o={durK}>rendement moyen par an</T>
          </g>
          {[SW10, SW20].map((sw, k) => {
            const tk = [b.dix, b.vingt][k];
            const data = [R10, R20][k];
            return sw.map(([x, y], i) => {
              const kk = ease(t, tk + 0.1 + i * 0.008, 0.45, easeIn);
              if (kk <= 0) return null;
              const neg = data[i].r < 0;
              return <circle key={`${k}-${i}`} cx={x} cy={lerp(380, y, kk)} r={7} fill={neg ? C.red : C.green} stroke={C.ink} strokeWidth={1.8} opacity={kk} />;
            });
          })}
          {/* les 5 périodes de 10 ans perdantes */}
          {t > b.dix + 0.9
            ? R10.map((x, i) => (x.r < 0 ? <circle key={`c${i}`} cx={SW10[i][0]} cy={SW10[i][1]} r={18} fill="none" stroke={C.red} strokeWidth={4} opacity={ease(t, b.dix + 0.9, 0.3)} /> : null))
            : null}
          <Stamp x={COLX[2]} y={1040} k={ease(t, c.words.jamais - 0.05, 0.35, overshoot)} w={250} text="JAMAIS" size={54} color={C.green} rot={-6} />
          <g opacity={ease(t, b.passe, 0.4)} transform="rotate(-3 470 1130)">
            <T x={330} y={1150} size={40} color={C.pen}>le passé ne garantit rien…</T>
          </g>
        </g>
      ) : null}
      {balls}
      {t > b.billes + 0.3 ? <path d={handPath([[70, G], [1050, G]], frame, 125, 1)} stroke={C.ink} strokeWidth={7} fill="none" opacity={ease(t, b.billes + 0.3, 0.4)} /> : null}
    </g>
  );
};

// =====================================================================
// S4 — le pari de Buffett (vrais chiffres de la lettre 2017)
// =====================================================================
const BX = (y: number) => 160 + (y - 2007) * 56;
const BYv = (v: number) => 1180 - ((v + 45) / 180) * 700;
const BETS = (['A', 'B', 'C', 'D', 'E'] as const).map((k) => ({k, v: betCum(k)}));
const IDX = betCum('index');

const Pari = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const race = ease(t, b.indice + 0.4, 4.3, easeInOut) * 10;
  const docK = ease(t, b.buffett + 0.2, 0.5, easeOut);
  const docOut = ease(t, b.indice + 0.1, 0.5);
  const line = (v: number[], color: string, w: number, id: number, dash?: string) => {
    const n = Math.min(v.length - 1, race);
    const pts: P2[] = [];
    for (let i = 0; i <= Math.floor(n); i++) pts.push([BX(2007 + i), BYv(v[i])]);
    const f = n - Math.floor(n);
    if (f > 0 && Math.floor(n) + 1 < v.length) pts.push([lerp(BX(2007 + Math.floor(n)), BX(2008 + Math.floor(n)), f), BYv(lerp(v[Math.floor(n)], v[Math.floor(n) + 1], f))]);
    if (pts.length < 2) return null;
    const last = pts[pts.length - 1];
    return (
      <g key={id}>
        <path d={handPath(pts, frame, id, 0.8)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
        <circle cx={last[0]} cy={last[1]} r={w + 3} fill={color} stroke={C.ink} strokeWidth={3} />
      </g>
    );
  };
  return (
    <g>
      <Bg />
      <Title t={t} t0={b.pros - 0.2} t1={b.buffett}>et les pros ?</Title>
      <Title t={t} t0={b.buffett}>le pari de Buffett</Title>
      {docK > 0 && docOut < 1 ? (
        <g opacity={1 - docOut} transform={`translate(0 ${-docOut * 80})`}>
          <Doc x={140} y={380} w={640} h={330} k={docK} title="Pari du 19/12/2007" lines={['enjeu : 1 000 000 $ (pour une œuvre)', 'un fonds qui copie le S&P 500', 'contre 5 paniers de fonds spéculatifs']} id={130} size={40} />
        </g>
      ) : null}
      {t > b.indice ? (
        <g opacity={ease(t, b.indice, 0.4)}>
          <line x1={BX(2007)} y1={BYv(0)} x2={BX(2017) + 20} y2={BYv(0)} stroke={C.muted} strokeWidth={3} strokeDasharray="10 8" />
          <T x={BX(2007) - 12} y={BYv(0) + 10} size={26} a="end" color={C.muted}>0</T>
          {[2008, 2012, 2017].map((y) => <T key={y} x={BX(y)} y={1225} size={30} a="middle" color={C.muted}>{y}</T>)}
          <line x1={BX(2007)} y1={1190} x2={BX(2017) + 20} y2={1190} stroke={C.ink} strokeWidth={4} />
          {BETS.map((s, i) => line(s.v, i === 2 && t > b.meilleur ? C.pen : '#8F8A80', 5, 140 + i, undefined))}
          {line(IDX, C.orange, 10, 150)}
          <T x={140} y={430} size={36} color="#6E6A62" o={ease(t, b.indice + 0.7, 0.3) * (1 - ease(t, b.indice + 2.6, 0.3))}>2008 : les experts perdent moins…</T>
          <T x={140} y={430} size={36} color={C.orange} o={ease(t, b.indice + 2.6, 0.3) * (1 - ease(t, b.resultat, 0.3))}>… puis l’indice passe devant, 9 ans de suite</T>
          {(() => {
            const n = Math.min(10, race);
            const i0 = Math.floor(n);
            const f = n - i0;
            const vi = i0 < 10 ? lerp(IDX[i0], IDX[i0 + 1], f) : IDX[10];
            const avg = (j: number) => BETS.reduce((a2, s2) => a2 + (s2.v[Math.min(j, s2.v.length - 1)] ?? 0), 0) / BETS.length;
            const va = i0 < 10 ? lerp(avg(i0), avg(i0 + 1), f) : avg(10);
            const x = BX(2007) + n * 56;
            const o = ease(t, b.indice + 0.6, 0.3) * (1 - ease(t, b.resultat - 0.3, 0.3));
            return (
              <g opacity={o}>
                <T x={x + 16} y={BYv(vi) - 18} size={30} color={C.orange}>fonds indiciel</T>
                <T x={x + 16} y={BYv(va) + 40} size={28} color="#6E6A62">5 paniers d’experts</T>
              </g>
            );
          })()}
        </g>
      ) : null}
      <Label x={BX(2017) - 30} y={BYv(125.8) - 90} k={pop(frame, b.resultat + 0.3)} text="+126 %" size={56} color={C.orange} id={151} />
      <Label x={BX(2017) - 20} y={BYv(87.7) + 70} k={pop(frame, b.meilleur + 0.2)} text="+88 %" size={44} color={C.pen} id={152} />
      {t > b.pirep ? (
        <g opacity={ease(t, b.pirep, 0.3)}>
          <Label x={BX(2016) - 40} y={BYv(2.8) + 72} k={pop(frame, b.pirep + 0.1)} text="+3 %" size={44} color="#6E6A62" id={153} />
          <T x={BX(2016) + 18} y={BYv(BETS[3].v[9]) - 18} size={24} color={C.muted} w={400}>liquidé en 2017</T>
        </g>
      ) : null}
      <Ground frame={frame} id={154} />
    </g>
  );
};

// =====================================================================
// S5 — en France : 98 % des fonds actifs font moins bien que leur indice ; les frais
// =====================================================================
const ORDER = Array.from({length: 100}, (_, i) => i).sort((a, c) => rand(a * 3.3) - rand(c * 3.3));
const GOLDS = new Set([37, 82]);
const France = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const gridK = ease(t, b.france + 0.3, 0.6);
  const t98 = c.words.quatrevingtdixhuit;
  const coins = 11;
  const chompX = lerp(90, 760, ease(t, b.frais + 0.5, 2.2, easeInOut));
  return (
    <g>
      <Bg />
      <Title t={t} t0={b.france}>en France, sur 10 ans</Title>
      <g opacity={gridK}>
        {Array.from({length: 100}, (_, i) => {
          const rank = ORDER.indexOf(i);
          const dim = GOLDS.has(i) ? 0 : ease(t, t98 + 0.1 + (rank / 100) * 2.2, 0.15);
          const gold = GOLDS.has(i) && t > t98 + 1.2;
          return <Fund key={i} x={160 + (i % 10) * 60} y={420 + Math.floor(i / 10) * 60} s={1} dim={dim} gold={gold} t={t} i={i} />;
        })}
      </g>
      <g opacity={ease(t, t98, 0.4)}>
        <T x={880} y={540} size={130} a="middle" color={C.red}>98 %</T>
        <T x={880} y={600} size={34} a="middle">des fonds actions</T>
        <T x={880} y={640} size={34} a="middle">gérés activement</T>
        <T x={880} y={690} size={34} a="middle" color={C.red}>font moins bien</T>
        <T x={880} y={730} size={34} a="middle" color={C.red}>que leur indice</T>
      </g>
      {t > b.frais ? (
        <g opacity={ease(t, b.frais, 0.3)}>
          <T x={140} y={1060} size={34} color={C.pen} rot={-2}>« Les performances vont et viennent.</T>
          <T x={180} y={1106} size={34} color={C.pen} rot={-2}>Les frais, jamais. » — W. Buffett</T>
          {Array.from({length: coins}, (_, i) => {
            const x = 170 + i * 52;
            return x > chompX + 20 ? <Coin key={i} x={x} y={1240} r={22} rot={i * 20} /> : null;
          })}
          <Chomp x={chompX} y={1240} r={46} t={t} />
          <Label x={chompX + 10} y={1170} k={pop(frame, b.frais + 0.4)} text="frais ≈ 2,5 %/an" size={32} color={C.red} id={160} />
        </g>
      ) : null}
      <Ground frame={frame} id={161} />
    </g>
  );
};

// =====================================================================
// S6 — teaser : 1637, la tulipe… vrai ou légende ? Les bulles.
// =====================================================================
const Next = (t: number, c: Ctx) => {
  const {b, frame} = c;
  const crowdO = ease(t, b.foule, 0.4) * (1 - ease(t, b.tulipe + 0.4, 0.5));
  const tulK = ease(t, b.tulipe + 0.3, 2.2, easeOut) * (1 - ease(t, c.words.maison - 1.2, 0.5));
  const balK = ease(t, c.words.maison - 1.0, 0.6, easeOut);
  const pop0 = b.next + 0.5;
  const grow = ease(t, b.legende + 0.2, pop0 - b.legende - 0.2, easeIn);
  const popped = t > pop0;
  const bubR = lerp(30, 240, grow);
  const bub: P2 = [lerp(200, 400, grow), lerp(1040, 820, grow)];
  const tilt = 0;
  return (
    <g>
      <Bg />
      <Title t={t} t0={b.foule} t1={b.tulipe}>la foule perd la tête</Title>
      <Title t={t} t0={b.tulipe}>Amsterdam, 1637</Title>
      {crowdO > 0 ? (
        <g opacity={crowdO}>
          {Array.from({length: 9}, (_, i) => (
            <Person key={i} x={170 + i * 70} y={1000 + (i % 2) * 30} s={1.1} hat={i % 3 === 1 ? 1 : 0} color={['#3B4A6B', '#5B3B4A', '#2F5D50'][i % 3]} bob={Math.abs(Math.sin(t * 9 + i)) * 26} spin={t} />
          ))}
          {[0, 1, 2].map((i) => <T key={i} x={230 + i * 210} y={760 + Math.sin(t * 4 + i) * 10} size={60} color={C.red} rot={-10 + i * 10}>?!</T>)}
        </g>
      ) : null}
      {tulK > 0 ? <Tulip x={330} y={1300} h={420} k={tulK} t={t} id={170} /> : null}
      {tulK > 0 ? <T x={480} y={980} size={34} color={C.red} o={ease(t, b.tulipe + 1.6, 0.3) * tulK}>« Semper Augustus »</T> : null}
      {balK > 0 ? (
        <g opacity={balK}>
          <line x1={450} y1={1300} x2={450} y2={960} stroke={C.ink} strokeWidth={10} />
          <path d="M 380 1300 L 520 1300" stroke={C.ink} strokeWidth={10} />
          <g transform={`rotate(${tilt} 450 960)`}>
            <line x1={200} y1={960} x2={700} y2={960} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
            {[200, 700].map((x) => (
              <g key={x}>
                <line x1={x} y1={960} x2={x - 70} y2={1080} stroke={C.ink} strokeWidth={4} />
                <line x1={x} y1={960} x2={x + 70} y2={1080} stroke={C.ink} strokeWidth={4} />
                <path d={`M ${x - 90} 1080 Q ${x} 1120 ${x + 90} 1080 Z`} fill={C.white} stroke={C.ink} strokeWidth={5} />
              </g>
            ))}
            <House x={700} y={1080} s={0.7} id={171} />
            {!popped && grow <= 0.02 ? <Bulb x={200} y={1050} r={26} /> : null}
          </g>
          <circle cx={450} cy={960} r={14} fill={C.orange} stroke={C.ink} strokeWidth={4} />
          <T x={200} y={1170} size={30} a="middle" color={C.muted}>1 bulbe</T>
          <T x={700} y={1170} size={30} a="middle" color={C.muted}>1 maison</T>
        </g>
      ) : null}
      {t > b.legende && !popped ? (
        <g>
          <Bubble x={bub[0]} y={bub[1]} r={bubR} t={t} />
          <g transform={`translate(${bub[0]} ${bub[1]}) scale(${bubR / 120})`}>
            <Bulb x={0} y={10} r={26} />
          </g>
        </g>
      ) : null}
      <Burst x={bub[0]} y={bub[1]} k={(t - pop0) / 0.5} r={240} color="#7FB2E5" n={16} seed={9} />
      <T x={W / 2} y={640} size={78} a="middle" color={C.pen} o={ease(t, b.legende, 0.4) * (1 - ease(t, b.next + 0.7, 0.3))} rot={-2}>vrai… ou légende ?</T>
      <Ground frame={frame} id={172} />
    </g>
  );
};

// =====================================================================
// Bandeau de cotations (vraies années)
// =====================================================================
const Ticker: React.FC<{t: number; t0: number}> = ({t, t0}) => {
  if (t < t0) return null;
  const k = ease(t, t0, 0.5);
  const item = 260;
  const total = YEARS.length * item;
  const off = ((t - t0) * 120) % total;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < YEARS.length; i++) {
    for (const base of [0, total]) {
      const x = 130 + i * item - off + base;
      if (x < -item || x > W) continue;
      const up = RET[i] >= 0;
      items.push(
        <g key={`${i}-${base}`}>
          <text x={x} y={190} fontSize={34} fill="#EDE6D6" style={{fontFamily: F.note}}>{YEARS[i]}</text>
          <text x={x + 82} y={190} fontSize={34} fill={up ? '#41D3A6' : '#FF6B5E'} style={{fontFamily: F.note}}>{`${up ? '▲' : '▼'} ${pct(RET[i])}`}</text>
        </g>,
      );
    }
  }
  return (
    <g opacity={k}>
      <rect x={0} y={150} width={W} height={56} fill="#1D1C24" />
      {items}
      <rect x={0} y={150} width={96} height={56} fill="#1D1C24" />
      <text x={14} y={188} fontSize={26} fill={C.hl} style={{fontFamily: F.note}}>S&amp;P</text>
    </g>
  );
};

// =====================================================================
// Pierrot (écran) : poses et déplacements
// =====================================================================
const pierrotTrack = (b: B, w: Record<string, number>, end: number): {track: Track; targets: [number, number, P2][]} => {
  const moves: Move[] = [
    {t0: b.monte + 0.15, t1: b.monte + 1.25, x0: 880, x1: -260, gait: 'courir'},
    {t0: b.billes + 0.3, t1: b.billes + 1.2, x0: 1300, x1: 975, gait: 'courir'},
    {t0: b.pros + 0.1, t1: b.pros + 0.9, x0: 975, x1: 880, gait: 'marche'},
  ];
  const keys: Key[] = [
    {t: 0, pose: 'reflechir', hold: 2.2},
    {t: b.navires + 0.1, pose: 'pointer', hold: 1.6},
    {t: w.manque - 0.2, pose: 'hausser', hold: 1.0},
    {t: b.decoupe + 1.0, pose: 'choque', hold: 1.3},
    {t: b.servante + 0.2, pose: 'pointer', hold: 1.4},
    {t: b.actions + 0.9, pose: 'content', hold: 1.0},
    {t: b.deux + 0.1, pose: 'pointer', hold: 1.1},
    {t: w.epices - 0.1, pose: 'choque', hold: 0.9},
    {t: b.plusvalue + 1.0, pose: 'pointer', hold: 1.2},
    {t: b.qui + 0.1, pose: 'reflechir', hold: 1.7},
    {t: b.carnet + 0.4, pose: 'pointer', hold: 1.6},
    {t: w.vendeurs, pose: 'pointer', hold: 1.0},
    {t: b.fourchette + 0.1, pose: 'pointer', hold: 1.6},
    {t: b.match + 0.9, pose: 'content', hold: 1.0},
    {t: b.cours + 0.1, pose: 'pointer', hold: 1.2},
    {t: b.vide + 0.1, pose: 'reflechir', hold: 1.8},
    {t: b.k1987 + 0.3, pose: 'choque', hold: 1.6},
    {t: b.fuite + 0.1, pose: 'hausser', hold: 1.0},
    {t: b.chute + 0.6, pose: 'choque', hold: 2.6},
    {t: w.hausse - 0.2, pose: 'content', hold: 0.9},
    {t: b.bilan + 0.4, pose: 'pointer', hold: 1.4},
    {t: b.pire + 0.1, pose: 'pointer', hold: 1.2},
    {t: b.meilleure + 0.1, pose: 'pointer', hold: 1.2},
    {t: b.moyenne + 0.3, pose: 'content', hold: 1.2},
    {t: b.duree + 0.2, pose: 'reflechir', hold: 1.4},
    {t: b.un + 0.1, pose: 'pointer', hold: 1.2},
    {t: b.dix + 0.1, pose: 'pointer', hold: 1.2},
    {t: b.vingt + 0.1, pose: 'pointer', hold: 0.6},
    {t: w.jamais + 0.1, pose: 'content', hold: 1.1},
    {t: b.passe + 0.1, pose: 'hausser', hold: 1.4},
    {t: b.buffett + 0.3, pose: 'pointer', hold: 1.4},
    {t: b.indice + 1.2, pose: 'pointer', hold: 1.6},
    {t: b.resultat + 0.3, pose: 'choque', hold: 1.2},
    {t: b.meilleur + 0.1, pose: 'pointer', hold: 1.0},
    {t: b.pirep + 0.1, pose: 'hausser', hold: 1.0},
    {t: b.france + 0.2, pose: 'reflechir', hold: 1.0},
    {t: w.quatrevingtdixhuit + 0.3, pose: 'choque', hold: 1.2},
    {t: b.frais + 0.4, pose: 'pointer', hold: 1.5},
    {t: b.foule + 0.1, pose: 'hausser', hold: 1.4},
    {t: b.tulipe + 0.6, pose: 'pointer', hold: 1.4},
    {t: w.maison - 0.3, pose: 'choque', hold: 1.0},
    {t: b.legende + 0.1, pose: 'reflechir', hold: 1.6},
    {t: b.next + 0.5, pose: 'choque', hold: 0.6},
    {t: b.next + 1.6, pose: 'content', hold: end},
  ];
  const targets: [number, number, P2][] = [
    [0, b.decoupe, [430, 1000]],
    [b.decoupe, b.actions, [CROWD[NEEL].x + 20, 680]],
    [b.actions, b.plusvalue, [420, 820]],
    [b.plusvalue, b.qui, [660, 1100]],
    [b.qui, w.vendeurs - 0.1, [240, 880]],
    [w.vendeurs - 0.1, b.fourchette, [600, 820]],
    [b.fourchette, b.cours, [430, 880]],
    [b.cours, b.bilan, [380, 380]],
    [b.bilan, b.pire, [330, 360]],
    [b.pire, b.meilleure, [150, 1300]],
    [b.meilleure, b.un, [820, 1300]],
    [b.un, b.dix, [COLX[0] + 40, 900]],
    [b.dix, b.vingt, [COLX[1] + 40, 820]],
    [b.vingt, b.buffett, [COLX[2] + 30, 780]],
    [b.buffett, b.indice, [460, 460]],
    [b.indice, b.frais, [BX(2016), BYv(100)]],
    [b.frais, b.tulipe, [420, 1200]],
    [b.tulipe, 1e9, [360, 980]],
  ];
  return {track: {ground: G, x: 880, restFacing: -1, moves, keys}, targets};
};

// =====================================================================
// La scène
// =====================================================================
const zoomView = (P: {x: number; y: number; w: number}, e: number) => {
  const r = P.w / W;
  const fx = P.x / (1 - r);
  const fy = P.y / (1 - r);
  const s = Math.pow(r, e);
  return `scale(${1 / s}) translate(${-fx * (1 - s)} ${-fy * (1 - s)})`;
};
const Portal: React.FC<{P: {x: number; y: number; w: number}; children: React.ReactNode}> = ({P, children}) => (
  <g transform={`translate(${P.x} ${P.y}) scale(${P.w / W})`} clipPath="url(#clip916)">{children}</g>
);
const slide = (a: React.ReactNode, b2: React.ReactNode, e: number) => (
  <>
    <g transform={`translate(${-W * e} 0) rotate(${-3 * e} 540 960)`}>{a}</g>
    <g transform={`translate(${W * (1 - e)} 0)`}>
      <rect x={-18} y={-40} width={18} height={2000} fill="rgba(20,19,26,0.12)" />
      {b2}
    </g>
  </>
);

const wordAt = (words: SceneProps['words'], re: RegExp, after = 0) => {
  const w = words.find((x) => x.startMs / 1000 >= after && re.test(x.text));
  return w ? w.startMs / 1000 : after;
};

export const Bourse: React.FC<SceneProps> = ({tl, words, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const w = useMemo(
    () => ({
      manque: wordAt(words, /manque/),
      epices: wordAt(words, /épices\./),
      vendeurs: wordAt(words, /vendeurs/),
      pire: wordAt(words, /pire/, b.chute),
      hausse: wordAt(words, /hausse\./, b.pourtant),
      hors: wordAt(words, /hors/, b.million),
      jamais: wordAt(words, /jamais/),
      quatrevingtdixhuit: wordAt(words, /98/, b.france),
      maison: wordAt(words, /maison/),
    }),
    [words, b],
  );
  const ev = useMemo(() => bookEvents(b, w.vendeurs), [b, w]);
  const trades = useMemo(() => runBook(ev, 1e9).trades, [ev]);
  const lastAt = (tt: number) => {
    let p = 200;
    for (const tr of trades) {
      if (tr.t > tt) break;
      p = tr.p;
    }
    return p;
  };
  const ctx: Ctx = {b, frame, ev, lastAt, words: w};

  // enchaînement des stations
  const Z1 = {tp: b.servante + 0.85, t0: b.actions - 0.55, t1: b.actions + 0.55};
  const S12 = {t0: b.qui - 0.15, t1: b.qui + 0.5};
  const z2 = ZO(b);
  const ov87 = toScreen(OV, [trackAt(59.8).x, trackAt(59.8).y]);
  const P2r = {x: ov87[0] - 27, y: ov87[1] - 48, w: 54};
  const S34 = {t0: b.pros - 0.2, t1: b.pros + 0.45};
  const S45 = {t0: b.france - 0.2, t1: b.france + 0.45};
  const S56 = {t0: b.foule - 0.2, t1: b.foule + 0.45};
  let scene: React.ReactNode;
  if (t < Z1.t1) {
    const e = prog(t, Z1.t0, Z1.t1, easeInOut);
    scene = (
      <g transform={zoomView(P1, e)}>
        {Hook(t, ctx)}
        {t >= Z1.tp ? <Portal P={P1}>{Action(t, ctx)}</Portal> : null}
      </g>
    );
  } else if (t < S12.t0) scene = Action(t, ctx);
  else if (t < S12.t1) scene = slide(Action(t, ctx), Carnet(t, ctx), prog(t, S12.t0, S12.t1, easeInOut));
  else if (t < z2.t0) scene = Carnet(t, ctx);
  else if (t < z2.t1) {
    const e = 1 - prog(t, z2.t0, z2.t1, easeInOut);
    scene = (
      <g transform={zoomView(P2r, e)}>
        {Courbe(t, ctx)}
        <Portal P={P2r}>{Carnet(t, ctx)}</Portal>
      </g>
    );
  } else if (t < S34.t0) scene = Courbe(t, ctx);
  else if (t < S34.t1) scene = slide(Courbe(t, ctx), Pari(t, ctx), prog(t, S34.t0, S34.t1, easeInOut));
  else if (t < S45.t0) scene = Pari(t, ctx);
  else if (t < S45.t1) scene = slide(Pari(t, ctx), France(t, ctx), prog(t, S45.t0, S45.t1, easeInOut));
  else if (t < S56.t0) scene = France(t, ctx);
  else if (t < S56.t1) scene = slide(France(t, ctx), Next(t, ctx), prog(t, S56.t0, S56.t1, easeInOut));
  else scene = Next(t, ctx);

  const {track, targets} = useMemo(() => pierrotTrack(b, w, end), [b, w, end]);
  const target = (targets.find(([a, z]) => t >= a && t < z) ?? targets[targets.length - 1])[2];
  const pScale = t > b.billes ? lerp(0.82, 0.95, ease(t, b.pros, 0.8)) : 0.95;
  const sources: [number, number, string][] = [
    [0, b.actions, 'L. Petram, « The world’s first IPO » (2020) · Nationaal Archief'],
    [b.actions, b.qui, 'O’Shaughnessy AM, « Dividends: A 400-Year-Old Practice »'],
    [b.qui, b.vide, 'AMF, les ordres de bourse · Boursorama, guide des ordres'],
    [b.vide, b.monte, 'Federal Reserve History · Guinness · S&P 500 1987 : Damodaran'],
    [b.monte, b.duree, 'Damodaran (NYU Stern), S&P 500 dividendes réinvestis, 1928-2025'],
    [b.duree, b.pros, 'calcul sur Damodaran : périodes glissantes, dollars courants'],
    [b.pros, b.france, 'Berkshire Hathaway, lettre aux actionnaires 2017'],
    [b.france, b.foule, 'S&P DJI, SPIVA Europe fin 2025 · Berkshire 2017'],
    [b.foule, end + 1, 'Smithsonian (2017) · BBC, T. Harford (2020) · A. Goldgar'],
  ];
  const next = sp(frame, b.next + 0.9, POP);
  return (
    <>
      <svg width={W} height={1920} style={{position: 'absolute'}}>
        <defs>
          <pattern id="bgrid" width={54} height={54} patternUnits="userSpaceOnUse">
            <path d="M 54 0 L 0 0 0 54" fill="none" stroke={C.grid} strokeWidth={2} />
          </pattern>
          <clipPath id="clip916">
            <rect x={0} y={0} width={W} height={1920} />
          </clipPath>
          <clipPath id="ladder">
            <rect x={LADDER.x0} y={LADDER.y0} width={LADDER.x1 - LADDER.x0} height={LADDER.y1 - LADDER.y0} />
          </clipPath>
        </defs>
        <g style={{filter: 'url(#boil)'}}>
          {scene}
          <Ticker t={t} t0={b.qui} />
          <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={pScale} track={{...track, target}} />
          {/* bord du carnet */}
          <line x1={96} y1={0} x2={96} y2={1920} stroke={C.margin} strokeWidth={3} opacity={t > Z1.t1 && t < S12.t0 ? 0 : 1} />
        </g>
      </svg>
      {sources.map(([a, z, s], i) => (
        <AbsoluteFill key={i} style={{opacity: vis(t, a, z)}}>
          <div style={{position: 'absolute', left: 110, top: 1378, width: 700, fontFamily: F.note, fontSize: 26, color: C.muted, lineHeight: 1.1}}>Source : {s}</div>
        </AbsoluteFill>
      ))}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 150, top: 380, maxWidth: 700}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 72, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />les bulles →
            </span>
          </Sticker>
        </div>
      ) : null}
    </>
  );
};
