// Animations sur mesure de la vidéo 20 (le bateau de Thésée), style céramique à figures noires.
// Navire : trirème noire à incisions (boucliers, voile rayée, gréement, éperon, œil, rames qui rament) ; ses 32 planches sont
//   arrachées une à une et remplacées par du bois neuf qui glisse en place (étincelle du marteau) entre `from` et `to` ;
//   mode double : A (neuf) et B (les vieilles planches qui reviennent en volant), étiquettes A / B.
// Cellules : l'Homme de Vitruve couvert d'une mosaïque de cellules qui se renouvellent, sauf les neurones (la tête).
// Teleporteur : le dessin est scanné, se découpe en tuiles qui volent jusqu'à Mars et s'y réassemblent.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const BLACK = '#140F0C';
const NEW = '#E8874A';
const INC = '#C2643A'; // incisions (la terre cuite qui apparaît sous le vernis)

const HULL = 'M 120 0 C 210 70, 560 78, 700 40 L 820 22 L 878 54 L 760 66 C 700 114, 330 122, 150 90 C 90 72, 60 30, 70 -40 C 80 -70, 104 -78, 110 -60 C 100 -30, 104 -12, 120 0 Z';
const COLS = 8, ROWS = 4;
const PW = 760 / COLS, PH = 32;
const order = Array.from({length: COLS * ROWS}, (_, i) => i).sort((a, b) => rand(a * 3.7 + 1) - rand(b * 3.7 + 1));
const rank = (i: number) => order.indexOf(i);
const plankXY = (i: number) => ({x: 70 + (i % COLS) * PW, y: -64 + Math.floor(i / COLS) * (PH + 6)});

/** trirème (boîte ≈ 0..880 × −340..170) ; repl(i) : 0 = planche d'origine, 0..1 = remplacement en cours, 1 = neuve ;
 *  fly(i) : 0..1 arrivée en vol (mode double) */
const Ship: React.FC<{x: number; y: number; s: number; t: number; repl: (i: number) => number; fly?: (i: number) => number; clip: string}> = ({x, y, s, t, repl, fly, clip}) => {
  const row = (Math.sin(t * 3.2) + 1) / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(-440 -20)`}>
      <defs><clipPath id={clip}><path d={HULL} /></clipPath></defs>
      {/* gréement, mât, vergue, voile rayée bordée d'un méandre */}
      <path d="M 430 30 V -340 M 430 -330 L 860 40 M 430 -330 L 96 -50" stroke={BLACK} strokeWidth={3} />
      <path d="M 430 30 V -340 M 290 -310 H 570" stroke={BLACK} strokeWidth={10} strokeLinecap="round" />
      <path d={`M 300 -304 H 560 L 552 ${-118 + Math.sin(t * 2) * 7} H 308 Z`} fill={BLACK} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${322 + i * 42} -290 V ${-126 + Math.sin(t * 2) * 6}`} stroke={i % 2 ? INC : '#3A2A22'} strokeWidth={i % 2 ? 9 : 2} opacity={0.85} />)}
      <path d={Array.from({length: 13}, (_, i) => `M ${304 + i * 20} -292 v -8 h 12 v 6 h -6`).join(' ')} stroke={INC} strokeWidth={2} fill="none" />
      {/* aplustre (poupe recourbée) */}
      <path d="M 106 -58 C 90 -130, 150 -170, 170 -120 C 182 -92, 150 -86, 146 -104" stroke={BLACK} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* rames : deux rangées qui rament */}
      {Array.from({length: 12}, (_, i) => {
        const ox = 190 + i * 46, a = lerp(-18, 14, (Math.sin(t * 3.2 + i * 0.25) + 1) / 2);
        return <line key={`o${i}`} x1={ox} y1={64} x2={ox + Math.sin(a * Math.PI / 180) * 120} y2={64 + Math.cos(a * Math.PI / 180) * 120} stroke={BLACK} strokeWidth={6} strokeLinecap="round" />;
      })}
      {/* gouvernail */}
      <path d="M 150 40 L 70 180 L 92 188 Z" fill={BLACK} />
      <g clipPath={`url(#${clip})`}>
        <rect x={40} y={-90} width={860} height={220} fill={BLACK} />
        {Array.from({length: COLS * ROWS}, (_, i) => {
          const {x: px, y: py} = plankXY(i);
          const k = repl(i), f = fly ? fly(i) : 1;
          if (f <= 0) return null;
          const dy = (1 - easeOut(f)) * 420, rot = (1 - f) * (rand(i) - 0.5) * 120;
          const slide = k > 0 && k < 1 ? (1 - easeOut(clamp01((k - 0.35) / 0.65))) * 46 : 0;
          const isNew = k >= 0.35;
          return (
            <g key={i} transform={`translate(${px} ${py + dy + slide}) rotate(${rot} ${PW / 2} ${PH / 2})`}>
              <rect x={0} y={0} width={PW + 1} height={PH} fill={isNew ? NEW : BLACK} />
              {[0.3, 0.62].map((v, j) => <path key={j} d={`M 3 ${PH * v} Q ${PW * 0.5} ${PH * v + (rand(i * 9 + j) - 0.5) * 7} ${PW - 3} ${PH * v}`} stroke={isNew ? '#F7C29A' : INC} strokeWidth={1.6} fill="none" opacity={0.75} />)}
              <circle cx={6} cy={PH / 2} r={2} fill={isNew ? '#9A4A20' : INC} /><circle cx={PW - 6} cy={PH / 2} r={2} fill={isNew ? '#9A4A20' : INC} />
              <rect x={0} y={0} width={PW + 1} height={PH} fill="none" stroke={isNew ? '#9A4A20' : '#2E2018'} strokeWidth={2} />
            </g>
          );
        })}
      </g>
      {/* planches arrachées qui tombent, étincelles du marteau */}
      {Array.from({length: COLS * ROWS}, (_, i) => {
        const k = repl(i);
        if (!(k > 0 && k < 1)) return null;
        const {x: px, y: py} = plankXY(i), d = clamp01(k / 0.6);
        const sp = k > 0.85 ? 1 - (k - 0.85) / 0.15 : 0;
        return (
          <g key={`f${i}`}>
            <g transform={`translate(${px} ${py + 140 * d * d + 20 * d}) rotate(${d * (rand(i) > 0.5 ? 40 : -40)} ${PW / 2} ${PH / 2})`} opacity={1 - d}>
              <rect width={PW} height={PH} fill={BLACK} stroke={INC} strokeWidth={2} />
            </g>
            {sp > 0 ? Array.from({length: 7}, (_, j) => {
              const a = (j / 7) * Math.PI * 2;
              return <line key={j} x1={px + PW / 2 + Math.cos(a) * 10} y1={py + PH / 2 + Math.sin(a) * 10} x2={px + PW / 2 + Math.cos(a) * (18 + 22 * (1 - sp))} y2={py + PH / 2 + Math.sin(a) * (18 + 22 * (1 - sp))} stroke="#FFE7C2" strokeWidth={4} opacity={sp} />;
            }) : null}
          </g>
        );
      })}
      <path d={HULL} fill="none" stroke={BLACK} strokeWidth={6} />
      {/* boucliers ronds le long du pont */}
      {Array.from({length: 10}, (_, i) => (
        <g key={`s${i}`} transform={`translate(${200 + i * 50} ${-74})`}>
          <circle r={21} fill={BLACK} stroke={INC} strokeWidth={2} />
          <circle r={13} fill="none" stroke={INC} strokeWidth={1.5} />
          <circle r={3.5} fill={INC} />
        </g>
      ))}
      {/* éperon et œil */}
      <path d="M 820 22 L 878 54 L 760 66 M 800 36 L 860 52 M 790 48 L 846 58" stroke={INC} strokeWidth={2} fill="none" />
      <circle cx={760} cy={18} r={15} fill="#F2E3CC" stroke={BLACK} strokeWidth={4} />
      <circle cx={762} cy={18} r={6.5} fill={BLACK} />
      <path d="M 742 6 Q 760 -6 778 6" stroke={INC} strokeWidth={2} fill="none" />
      {void row}
    </g>
  );
};

/** vagues en spirales courantes et traits de houle */
const Waves: React.FC<{y: number; t: number}> = ({y, t}) => {
  const off = (t * 60) % 120;
  let d = '';
  for (let i = -2; i < 12; i++) {
    const x = i * 120 - off;
    d += ` M ${x} ${y} C ${x + 30} ${y}, ${x + 60} ${y - 40}, ${x + 40} ${y - 56} C ${x + 24} ${y - 66}, ${x + 6} ${y - 50}, ${x + 18} ${y - 38} C ${x + 28} ${y - 30}, ${x + 40} ${y - 40}, ${x + 34} ${y - 46} M ${x + 40} ${y} H ${x + 120}`;
  }
  return (
    <g>
      <path d={d} stroke={BLACK} strokeWidth={6} fill="none" />
      {[24, 44, 64].map((dy, j) => <path key={j} d={`M ${-off * (1 + j * 0.3)} ${y + dy} ${Array.from({length: 24}, (_, i) => `q 25 ${j % 2 ? 6 : -6} 50 0`).join(' ')}`} stroke={BLACK} strokeWidth={2.5 - j * 0.5} fill="none" opacity={0.7 - j * 0.15} />)}
    </g>
  );
};

export const Navire: React.FC<AnimProps> = ({lt, t, p}) => {
  const from = Number(p.from ?? 0.3), to = Number(p.to ?? 2.5);
  const mode = String(p.mode ?? 'single');
  const N = COLS * ROWS;
  const slot = (to - from) / N;
  const replNow = (i: number) => clamp01((lt - from - rank(i) * slot) / Math.max(0.12, slot * 2.2));
  if (mode === 'double') {
    const fk = (i: number) => clamp01((lt - from) / (to - from) * N - rank(i));
    const lab = prog(lt, to, to + 0.4, easeOut);
    return (
      <>
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
          <Ship x={280} y={900} s={0.57} t={t} repl={() => 1} clip="hA" />
          <Ship x={800} y={900} s={0.57} t={t + 1} repl={() => 0} fly={fk} clip="hB" />
          <Waves y={1010} t={t} />
        </svg>
        {['A', 'B'].map((L, i) => <div key={L} style={{position: 'absolute', left: i ? 700 : 180, width: 200, top: 1060, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 150, color: G.gold, opacity: lab, textShadow: G.shadow}}>{L}</div>)}
      </>
    );
  }
  const left = N - Array.from({length: N}, (_, i) => replNow(i) >= 0.35 ? 1 : 0).reduce((a: number, b) => a + b, 0);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <Ship x={540} y={980} s={1.12} t={t} repl={replNow} clip="h1" />
        <Waves y={1150} t={t} />
      </svg>
      {p.nolabel ? null : (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: 420, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 44, letterSpacing: '0.16em', color: G.textSoft}}>PLANCHES D’ORIGINE</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: 478, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 104, color: left === 0 ? G.gold : G.text, textShadow: G.shadow}}>{left} / {N}</div>
        </>
      )}
    </>
  );
};

// ---------- l'Homme de Vitruve en cellules ----------
const VC = {x: 540, y: 800}, VW = 820, VR = 395; // médaillon affiché (centre, largeur, rayon utile)
const HEAD = {x: 540, y: 405, r: 66};
/** mosaïque de cellules : hexagones déformés dans le cercle, chacun avec son instant de renouvellement */
const CELLS = (() => {
  const out: {d: string; cx: number; cy: number; r: number; head: boolean}[] = [];
  const R = 26, H = R * Math.sqrt(3);
  for (let j = -18; j <= 18; j++) for (let i = -12; i <= 12; i++) {
    const cx = VC.x + i * R * 1.5, cy = VC.y + j * H + (i % 2 ? H / 2 : 0);
    if (Math.hypot(cx - VC.x, cy - VC.y) > VR - 10) continue;
    const pts = Array.from({length: 6}, (_, k) => {
      const a = (k / 6) * Math.PI * 2, jr = R * (0.86 + 0.22 * rand(i * 31 + j * 17 + k));
      return `${(cx + Math.cos(a) * jr).toFixed(1)},${(cy + Math.sin(a) * jr).toFixed(1)}`;
    });
    out.push({d: `M ${pts.join(' L ')} Z`, cx, cy, r: rand(i * 7.3 + j * 3.1), head: Math.hypot(cx - HEAD.x, cy - HEAD.y) < HEAD.r + 20});
  }
  return out;
})();

export const Cellules: React.FC<AnimProps> = ({id, lt, p}) => {
  const from = Number(p.from ?? 0.2), to = Number(p.to ?? 2.2), neur = Number(p.neur ?? 99);
  const k = clamp01((lt - from) / (to - from));
  const nk = prog(lt, neur, neur + 0.5, easeOut);
  const fresh = CELLS.filter((c) => !c.head && c.r < k * 0.92).length, all = CELLS.filter((c) => !c.head).length;
  return (
    <>
      <div style={{position: 'absolute', left: VC.x - VW / 2, top: VC.y - VW / 2, width: VW}}>
        <Img src={staticFile(`v/${id}/img/vitruve.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, mixBlendMode: 'multiply'}} width={1080} height={1920}>
        {CELLS.map((c, i) => {
          const f = !c.head && c.r < k * 0.92;
          const pop = f ? clamp01((k * 0.92 - c.r) * 12) : 0;
          return <path key={i} d={c.d} fill={f ? NEW : 'none'} fillOpacity={0.62 * pop} stroke={c.head ? 'none' : BLACK} strokeWidth={1.2} strokeOpacity={0.35} />;
        })}
      </svg>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {nk > 0 ? (
          <g opacity={nk}>
            <circle cx={HEAD.x} cy={HEAD.y} r={HEAD.r + 16 + 6 * Math.sin(lt * 5)} fill="none" stroke={G.gold} strokeWidth={6} />
            {Array.from({length: 9}, (_, i) => {
              const a = (i / 9) * Math.PI * 2 + 0.3;
              return <path key={i} d={`M ${HEAD.x + Math.cos(a) * 18} ${HEAD.y + Math.sin(a) * 18} q ${Math.cos(a + 0.6) * 30} ${Math.sin(a + 0.6) * 30} ${Math.cos(a) * 60} ${Math.sin(a) * 60}`} stroke={G.gold} strokeWidth={2.5} fill="none" />;
            })}
          </g>
        ) : null}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1215, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.08em', color: G.text, opacity: prog(lt, from, from + 0.3) * (1 - nk)}}>{Math.round((fresh / all) * 100)} % DE CELLULES NEUVES</div>
      {nk > 0 ? <div style={{position: 'absolute', left: 640, top: 250, fontFamily: GF.serif, fontWeight: 900, fontSize: 56, lineHeight: 1.05, color: G.gold, opacity: nk, textShadow: G.shadow}}>NEURONES :<br />TON ÂGE</div> : null}
    </>
  );
};

export const Teleporteur: React.FC<AnimProps> = ({id, lt}) => {
  const TW = 460, n = 12, ts = TW / n;
  const L = {x: 300, y: 820}, R = {x: 780, y: 820};
  const scan = prog(lt, 0.15, 1.0, easeInOut);
  const mars = prog(lt, 0.1, 0.6, easeOut);
  const tiles: React.ReactNode[] = [];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const delay = 0.85 + (j / n) * 0.55 + rand(i * 13 + j * 7) * 0.25;
    const f = easeInOut(clamp01((lt - delay) / 0.75));
    const sx = L.x - TW / 2 + i * ts, sy = L.y - TW / 2 + j * ts;
    const ex = R.x - TW / 2 + i * ts, ey = R.y - TW / 2 + j * ts;
    const x = lerp(sx, ex, f), y = lerp(sy, ey, f) - Math.sin(Math.PI * f) * (140 + rand(i + j * 5) * 180);
    const r = Math.sin(Math.PI * f) * (rand(i * 3 + j) - 0.5) * 140;
    tiles.push(<div key={`${i}-${j}`} style={{position: 'absolute', left: x, top: y, width: ts + 0.6, height: ts + 0.6, backgroundImage: `url(${staticFile(`v/${id}/img/vitruve.webp`)})`, backgroundSize: `${TW}px ${TW}px`, backgroundPosition: `${-i * ts}px ${-j * ts}px`, transform: `rotate(${r}deg) scale(${1 - 0.3 * Math.sin(Math.PI * f)})`, filter: f > 0 && f < 1 ? `drop-shadow(0 0 8px rgba(${G.goldRgb},0.9))` : undefined}} />);
  }
  return (
    <>
      <div style={{position: 'absolute', left: R.x - 270, top: R.y - 270, width: 540, opacity: 0.55 * mars}}>
        <Img src={staticFile(`v/${id}/img/mars.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      {tiles}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {scan > 0 && scan < 1 ? <g><rect x={L.x - TW / 2 - 20} y={L.y - TW / 2 + scan * TW - 3} width={TW + 40} height={6} fill={G.gold} /><rect x={L.x - TW / 2 - 20} y={L.y - TW / 2 + scan * TW - 40} width={TW + 40} height={40} fill={G.gold} opacity={0.18} /></g> : null}
      </svg>
      <div style={{position: 'absolute', left: R.x - 200, width: 400, top: 1080, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 76, color: G.gold, opacity: prog(lt, 1.9, 2.3), textShadow: G.shadow}}>COPIE ?</div>
      <div style={{position: 'absolute', left: L.x - 200, width: 400, top: 1080, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 76, color: G.text, opacity: prog(lt, 0.1, 0.4) * (1 - prog(lt, 0.9, 1.3)), textShadow: G.shadow}}>TOI</div>
    </>
  );
};

export const THESEE = {Navire, Cellules, Teleporteur};
void easeIn;
