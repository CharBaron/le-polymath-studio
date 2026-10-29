// Animations sur mesure de la vidéo 20 (le bateau de Thésée), style céramique à figures noires :
// Navire : trirème noire sur fond terre cuite ; ses 32 planches sont remplacées une à une (orange vif) entre `from` et `to`
//   (s après le début du plan), compteur « planches d'origine » ; mode double : bateau A (neuf) et bateau B (vieilles
//   planches qui reviennent en volant), étiquettes A / B.
// Cellules : silhouette humaine en points ; les cellules se renouvellent, sauf les neurones (tête) qui restent d'origine.
// Teleporteur : la silhouette est scannée, se dissout en points qui volent vers la droite et s'y réassemblent.
import React from 'react';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const BLACK = '#140F0C';
const NEW = '#E8874A';
const INCISE = '#C2643A';

const HULL = 'M 120 0 C 210 70, 560 78, 700 40 L 820 22 L 872 52 L 760 64 C 700 112, 330 120, 150 88 C 90 70, 60 30, 70 -40 C 80 -70, 104 -78, 110 -60 C 100 -30, 104 -12, 120 0 Z';
const COLS = 8, ROWS = 4;
const order = Array.from({length: COLS * ROWS}, (_, i) => i).sort((a, b) => rand(a * 3.7 + 1) - rand(b * 3.7 + 1));
const rank = (i: number) => order.indexOf(i);

/** trirème (boîte ≈ 0..880 × −80..120) ; repl(i) : 0 = planche d'origine, 1 = neuve ; fly(i) : 0..1 arrivée en vol */
const Ship: React.FC<{x: number; y: number; s: number; t: number; repl: (i: number) => number; fly?: (i: number) => number; clip: string}> = ({x, y, s, t, repl, fly, clip}) => {
  const W = 760 / COLS, H = 120 / ROWS;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-440 -20)`}>
      <defs><clipPath id={clip}><path d={HULL} /></clipPath></defs>
      {/* mât, vergue, voile carrée quadrillée */}
      <path d="M 430 30 V -330 M 300 -300 H 560" stroke={BLACK} strokeWidth={9} />
      <path d={`M 312 -296 H 548 L 540 ${-120 + Math.sin(t * 2) * 6} H 320 Z`} fill={BLACK} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${340 + i * 52} -292 V -126`} stroke={INCISE} strokeWidth={2} />)}
      {/* rames */}
      {Array.from({length: 11}, (_, i) => <line key={i} x1={200 + i * 52} y1={70} x2={160 + i * 52 + Math.sin(t * 3 + i * 0.3) * 18} y2={168} stroke={BLACK} strokeWidth={6} strokeLinecap="round" />)}
      <g clipPath={`url(#${clip})`}>
        {Array.from({length: COLS * ROWS}, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          const k = repl(i), f = fly ? fly(i) : 1;
          const flash = k > 0 && k < 1 ? 1 : 0;
          const dy = (1 - easeOut(f)) * 420, rot = (1 - f) * (rand(i) - 0.5) * 120;
          return (
            <g key={i} transform={`translate(${70 + c * W} ${-80 + r * (H + 10) + dy}) rotate(${rot} ${W / 2} ${H / 2})`} opacity={f > 0 ? 1 : 0}>
              <rect x={0} y={0} width={W + 1} height={H + 11} fill={k >= 1 ? NEW : flash ? '#FFF1D8' : BLACK} />
              <path d={`M 4 ${H / 2} Q ${W / 2} ${H / 2 + (rand(i * 9) - 0.5) * 8} ${W - 4} ${H / 2}`} stroke={k >= 1 ? '#F7C29A' : INCISE} strokeWidth={2} fill="none" opacity={0.8} />
              <rect x={0} y={0} width={W + 1} height={H + 11} fill="none" stroke={k >= 1 ? '#B85A28' : '#2A1E18'} strokeWidth={2} />
            </g>
          );
        })}
      </g>
      <path d={HULL} fill="none" stroke={BLACK} strokeWidth={6} />
      {/* œil apotropaïque à la proue */}
      <circle cx={760} cy={20} r={14} fill="#F2E3CC" stroke={BLACK} strokeWidth={4} />
      <circle cx={762} cy={20} r={6} fill={BLACK} />
    </g>
  );
};

/** vagues « postes » (spirales courantes) qui défilent */
const Waves: React.FC<{y: number; t: number}> = ({y, t}) => {
  const off = (t * 60) % 120;
  let d = '';
  for (let i = -2; i < 12; i++) {
    const x = i * 120 - off;
    d += ` M ${x} ${y} C ${x + 30} ${y}, ${x + 60} ${y - 40}, ${x + 40} ${y - 56} C ${x + 24} ${y - 66}, ${x + 6} ${y - 50}, ${x + 18} ${y - 38} C ${x + 28} ${y - 30}, ${x + 40} ${y - 40}, ${x + 34} ${y - 46} M ${x + 40} ${y} H ${x + 120}`;
  }
  return <path d={d} stroke={BLACK} strokeWidth={6} fill="none" />;
};

export const Navire: React.FC<AnimProps> = ({lt, t, p}) => {
  const from = Number(p.from ?? 0.3), to = Number(p.to ?? 2.5);
  const mode = String(p.mode ?? 'single');
  const N = COLS * ROWS;
  const k = clamp01((lt - from) / (to - from));
  const replNow = (i: number) => clamp01(k * N - rank(i));
  if (mode === 'double') {
    const fk = (i: number) => clamp01((lt - from) / (to - from) * N - rank(i));
    const lab = prog(lt, to, to + 0.4, easeOut);
    return (
      <>
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
          <Ship x={280} y={820} s={0.57} t={t} repl={() => 1} clip="hA" />
          <Ship x={800} y={820} s={0.57} t={t + 1} repl={() => 0} fly={fk} clip="hB" />
          <Waves y={930} t={t} />
        </svg>
        {['A', 'B'].map((L, i) => <div key={L} style={{position: 'absolute', left: i ? 690 : 190, width: 200, top: 990, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 140, color: G.gold, opacity: lab, textShadow: G.shadow}}>{L}</div>)}
      </>
    );
  }
  const left = N - Math.floor(k * N + 0.0001);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <Ship x={540} y={880} s={1.14} t={t} repl={replNow} clip="h1" />
        <Waves y={1040} t={t} />
      </svg>
      {p.nolabel ? null : <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 40, letterSpacing: '0.18em', color: G.textSoft, opacity: prog(lt, 0, 0.3)}}>PLANCHES D’ORIGINE</div>}
      <div style={{display: p.nolabel ? 'none' : 'block', position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 130, color: left === 0 ? G.gold : G.text, textShadow: G.shadow}}>{left} / {N}</div>
    </>
  );
};

// ---------- silhouette humaine en cellules ----------
const inBody = (x: number, y: number) => {
  // tête, cou, torse, bras, jambes (boîte centrée sur 540, de 470 à 1260)
  const hx = x - 540;
  if (Math.hypot(hx, y - 560) < 78) return 'head';
  if (Math.abs(hx) < 30 && y >= 630 && y < 670) return 'body';
  if (y >= 660 && y < 950 && Math.abs(hx) < 120 - (y - 660) * 0.12) return 'body';
  if (y >= 680 && y < 940 && Math.abs(hx) >= 120 && Math.abs(hx) < 175 - (y - 680) * 0.05 && Math.abs(hx) > 128 + (y - 680) * 0.02) return 'body';
  if (y >= 940 && y < 1260 && Math.abs(hx) > 12 && Math.abs(hx) < 95 - (y - 940) * 0.12) return 'body';
  return null;
};
const DOTS = (() => {
  const out: {x: number; y: number; head: boolean; r: number}[] = [];
  for (let y = 470; y < 1270; y += 22) for (let x = 340; x < 740; x += 22) {
    const w = inBody(x, y);
    if (w) out.push({x, y, head: w === 'head', r: rand(x * 0.37 + y * 1.3)});
  }
  return out;
})();

export const Cellules: React.FC<AnimProps> = ({lt, p}) => {
  const from = Number(p.from ?? 0.2), to = Number(p.to ?? 2.2), neur = Number(p.neur ?? 99);
  const k = clamp01((lt - from) / (to - from));
  const nk = prog(lt, neur, neur + 0.5, easeOut);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {DOTS.map((d, i) => {
          const fresh = !d.head && d.r < k * 0.92;
          return <circle key={i} cx={d.x} cy={d.y} r={8} fill={fresh ? NEW : BLACK} stroke={d.head && nk > 0 ? G.gold : 'none'} strokeWidth={3 * nk} />;
        })}
        {nk > 0 ? <circle cx={540} cy={560} r={98 + 10 * Math.sin(lt * 4)} fill="none" stroke={G.gold} strokeWidth={5} opacity={nk} /> : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1290, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 40, letterSpacing: '0.12em', color: G.text, opacity: prog(lt, from, from + 0.3) * (1 - nk)}}>CELLULES DE MOINS DE 10 ANS</div>
      {nk > 0 ? <div style={{position: 'absolute', left: 620, top: 410, fontFamily: GF.serif, fontWeight: 900, fontSize: 44, color: G.gold, opacity: nk}}>NEURONES :<br />TON ÂGE</div> : null}
    </>
  );
};

export const Teleporteur: React.FC<AnimProps> = ({lt}) => {
  const scan = prog(lt, 0.2, 1.0, easeInOut), fly0 = 0.9;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      {DOTS.map((d, i) => {
        const delay = (d.y - 470) / 800 * 0.5 + d.r * 0.2;
        const f = easeInOut(clamp01((lt - fly0 - delay) / 0.7));
        const sx = 300 + (d.x - 540) * 0.75, sy = 400 + (d.y - 470) * 0.75 + 200;
        const tx = 780 + (d.x - 540) * 0.75, ty = sy;
        const x = lerp(sx, tx, f), y = lerp(sy, ty, f) - Math.sin(Math.PI * f) * (120 + d.r * 160);
        const scanned = sy < 600 + scan * 800;
        return <circle key={i} cx={x} cy={y} r={6} fill={f > 0 && f < 1 ? G.gold : f >= 1 ? NEW : scanned && scan > 0 ? '#3A2A20' : BLACK} />;
      })}
      {scan > 0 && scan < 1 ? <line x1={120} x2={480} y1={600 + scan * 800} y2={600 + scan * 800} stroke={G.gold} strokeWidth={6} /> : null}
      <text x={780} y={1262} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={70} fill={G.gold} opacity={prog(lt, 2.0, 2.4)}>COPIE ?</text>
      <text x={300} y={1262} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={70} fill={G.text} opacity={prog(lt, 0.1, 0.4) * (1 - prog(lt, 1.0, 1.4))}>TOI</text>
    </svg>
  );
};

export const THESEE = {Navire, Cellules, Teleporteur};
