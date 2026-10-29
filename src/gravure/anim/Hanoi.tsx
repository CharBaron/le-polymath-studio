// Animations sur mesure de la vidéo 18 (les rats sans queue de Hanoï, 1902), style archive coloniale :
// Registre : registre administratif où les bâtons de comptage s'accumulent, total qui défile ;
// Grouillement : les rats se multiplient (×2 à chaque pas) et courent sur le papier ;
// QueueCoupee : un rat, la queue coupée net, la queue tombe, le rat repart vivant.
import React from 'react';
import {clamp01, easeIn, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const INK = '#1E140B';
const RED = '#A8261C';

/** silhouette de rat à l'encre (boîte 200 × 100, museau à droite) ; tail = longueur de queue visible 0 → 1 */
export const Rat: React.FC<{x: number; y: number; s?: number; flip?: boolean; tail?: number; fill?: string; step?: number}> = ({x, y, s = 1, flip, tail = 1, fill = INK, step = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) translate(-110 -60)`}>
    {tail > 0 ? <path d="M 46 66 C 10 76, -22 94, -74 84" stroke={fill} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${tail} 1`} /> : null}
    <path d="M 70 78 l -8 14 M 132 76 l 6 14" stroke={fill} strokeWidth={6} strokeLinecap="round" transform={`translate(0 ${Math.sin(step) * 2})`} />
    <path d="M 40 62 C 40 38, 80 27, 120 31 C 146 33, 162 42, 176 50 L 198 61 C 191 67, 179 71, 165 71 C 150 79, 120 83, 90 81 C 60 81, 40 75, 40 62 Z" fill={fill} />
    <ellipse cx={148} cy={35} rx={11} ry={14} fill={fill} />
    <ellipse cx={149} cy={37} rx={5} ry={7} fill="#7A5A3A" opacity={0.6} />
    <circle cx={173} cy={54} r={3.2} fill="#EADFC6" />
    <path d="M 196 60 l 16 -6 M 196 62 l 17 2 M 195 64 l 14 9" stroke={fill} strokeWidth={1.4} />
  </g>
);

/** registre des queues : rangées de bâtons (4 + 1 barré), date en rouge, total qui défile jusqu'à `total` */
export const Registre: React.FC<AnimProps> = ({lt, p}) => {
  const total = Number(p.total ?? 20112);
  const fill = Number(p.fill ?? 1.8);
  const k = easeOut(clamp01((lt - 0.15) / fill));
  const rows = 9, groups = 11;
  const shown = Math.floor(k * rows * groups * 5);
  const marks: React.ReactNode[] = [];
  for (let r = 0, m = 0; r < rows; r++) {
    for (let g = 0; g < groups; g++) {
      for (let j = 0; j < 5; j++, m++) {
        if (m >= shown) break;
        const gx = 300 + g * 58, gy = 600 + r * 62;
        const jx = (rand(m * 1.7) - 0.5) * 2.5;
        marks.push(j < 4
          ? <line key={m} x1={gx + j * 10 + jx} y1={gy} x2={gx + j * 10 - jx} y2={gy + 40} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />
          : <line key={m} x1={gx - 6} y1={gy + 34} x2={gx + 38} y2={gy + 6} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />);
      }
    }
  }
  const n = Math.round(total * k);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <rect x={110} y={430} width={860} height={860} fill="#ECDDB8" stroke="#8A6A3A" strokeWidth={3} />
        {Array.from({length: 14}, (_, i) => <line key={i} x1={110} x2={970} y1={540 + i * 62} y2={540 + i * 62} stroke="#7F9BBF" strokeWidth={1.5} opacity={0.6} />)}
        <line x1={270} x2={270} y1={430} y2={1290} stroke={RED} strokeWidth={2.5} opacity={0.8} />
        {Array.from({length: rows}, (_, r) => <text key={r} x={258} y={634 + r * 62} textAnchor="end" fontFamily={GF.label} fontSize={24} fill={RED} opacity={shown > r * groups * 5 ? 0.9 : 0}>{`${12 + r * 2} juin`}</text>)}
        {marks}
      </svg>
      <div style={{position: 'absolute', left: 110, width: 860, top: 452, textAlign: 'center', fontFamily: GF.label, fontSize: 34, letterSpacing: '0.12em', color: INK}}>REGISTRE DES QUEUES — HANOÏ, 1902</div>
      <div style={{position: 'absolute', left: 110, width: 860, top: 1196, textAlign: 'right', paddingRight: 40, boxSizing: 'border-box', fontFamily: GF.label, fontSize: 56, color: RED}}>
        TOTAL : {n.toLocaleString('fr-FR').replace(/ /g, ' ')}
      </div>
    </>
  );
};

/** les rats se multiplient : ×2 toutes les `step` s jusqu'à `max`, chacun pope puis court */
export const Grouillement: React.FC<AnimProps> = ({lt, t, p}) => {
  const max = Number(p.max ?? 64), step = Number(p.step ?? 0.32);
  const gen = Math.floor(Math.max(0, lt) / step);
  const n = Math.min(max, 2 ** gen);
  const rats = Array.from({length: n}, (_, i) => {
    const born = Math.floor(Math.log2(i + 1)) * step; // génération où ce rat apparaît
    const k = prog(lt, born, born + 0.16, overshoot);
    const bx = 140 + rand(i * 3.3 + 1) * 800, by = 470 + rand(i * 5.1 + 2) * 760;
    const dir = rand(i * 7.7) > 0.5 ? 1 : -1;
    const sp = 60 + rand(i * 2.2) * 90;
    const x = ((bx + dir * sp * Math.max(0, lt - born) - 100) % 900 + 900) % 900 + 90;
    return <Rat key={i} x={x} y={by} s={(0.45 + rand(i * 9.9) * 0.35) * k} flip={dir < 0} step={t * 22 + i} />;
  });
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>{rats}</svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 150, color: G.gold, textShadow: G.shadow}}>×{n}</div>
    </>
  );
};

/** la queue coupée : cut = instant de la coupe (s après le début du plan), run = le rat repart */
export const QueueCoupee: React.FC<AnimProps> = ({lt, t, p}) => {
  const cut = Number(p.cut ?? 0.6), run = Number(p.run ?? 1.4);
  const fall = Math.max(0, lt - cut);
  const flash = lt > cut ? 1 - clamp01(fall / 0.25) : 0;
  const go = easeIn(clamp01((lt - run) / 0.7));
  const S = 3.4, rx = 600 + go * 900, ry = 820;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      {/* la queue détachée tombe en tournoyant */}
      {lt > cut ? (
        <g transform={`translate(${rx - 110 * S + 46 * S} ${ry + 6 * S + fall * fall * 900}) rotate(${fall * 220})`} opacity={1 - clamp01((fall - 0.6) / 0.4)}>
          <path d={`M 0 0 C ${-36 * S} ${10 * S}, ${-68 * S} ${28 * S}, ${-120 * S} ${18 * S}`} stroke={INK} strokeWidth={5 * S} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      <Rat x={rx} y={ry} s={S} tail={lt > cut ? 0 : 1} step={go > 0 ? t * 30 : 0} />
      {/* trait de coupe rouge + éclat */}
      {flash > 0 ? <line x1={rx - 64 * S - 60} y1={ry - 40} x2={rx - 64 * S + 40} y2={ry + 110} stroke={RED} strokeWidth={10} opacity={flash} /> : null}
      {flash > 0 ? <circle cx={rx - 64 * S} cy={ry + 20} r={30 + 120 * (1 - flash)} fill="none" stroke={RED} strokeWidth={6} opacity={flash} /> : null}
      {lt > cut ? <text x={rx - 64 * S - 120} y={ry - 120} fontFamily={GF.label} fontSize={64} fill={RED} opacity={clamp01((fall - 0.05) / 0.1) * (1 - clamp01((fall - 0.9) / 0.3))} transform={`rotate(-8 ${rx - 64 * S} ${ry - 120})`}>SNIP !</text> : null}
      {go > 0 ? [0, 1, 2].map((i) => <line key={i} x1={rx - 260 - i * 60} x2={rx - 160 - i * 60} y1={ry - 40 + i * 50} y2={ry - 40 + i * 50} stroke={INK} strokeWidth={4} opacity={0.5 * go} />) : null}
    </svg>
  );
};

export const HANOI = {Registre, Grouillement, QueueCoupee};
void lerp;
