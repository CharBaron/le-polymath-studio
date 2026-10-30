// Animations sur mesure de la vidéo 22 (Ératosthène mesure la Terre), style atlas céleste.
// Terre : la démonstration complète, phase par phase (temps en s après le début du plan ; négatif = déjà dessiné) :
//   rays (le soleil de Flammarion et ses rayons parallèles), well (le puits de Syène, rayon jusqu'au centre), stick (l'obélisque
//   d'Alexandrie), shadow (son ombre), angle (7,2° à l'obélisque et au centre), wedges/wedgesEnd (le secteur recopié 50 fois),
//   circ (la circonférence, ≈ 40 000 km) ; zIn/zOut : zoom ×3,2 sur Alexandrie. Globe ombré aux hachures, méridiens gravés.
// Plate : sur une Terre plate, deux obélisques sous le même soleil : aucune ombre nulle part.
// Colomb : le vrai tour de la Terre (or) et celui de Colomb, 25 % trop petit (rouge, pointillés).
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs, Shade} from './ink';

const C = {x: 540, y: 1040}, R = 360;
const deg = Math.PI / 180;
const onCircle = (a: number, r = R) => ({x: C.x + r * Math.cos(a * deg), y: C.y + r * Math.sin(a * deg)});
const S = onCircle(-90), A = onCircle(-97.2);
const U = {x: Math.cos(-97.2 * deg), y: Math.sin(-97.2 * deg)};
const N = {x: -U.y, y: U.x}; // tangente
const T = {x: A.x + U.x * 70, y: A.y + U.y * 70};
const SH = {x: T.x, y: C.y - Math.sqrt(R * R - (T.x - C.x) ** 2)};
const at = (lt: number, a: unknown, d = 0.6) => (a === undefined ? 0 : prog(lt, Number(a), Number(a) + d, easeOut));
const surfaceY = (x: number) => C.y - Math.sqrt(Math.max(0, R * R - (x - C.x) ** 2));
const sector = (a0: number, a1: number, r = R) => {
  const p0 = onCircle(a0, r), p1 = onCircle(a1, r);
  return `M ${C.x} ${C.y} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`;
};
const INK = '#E9DFC2';
const CIRCLE = `M ${C.x - R} ${C.y} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0`;

/** obélisque gravé dressé selon la verticale locale (u), base en b, hauteur h */
const Obelisque: React.FC<{b: {x: number; y: number}; u: {x: number; y: number}; n: {x: number; y: number}; h: number; k: number; z: number}> = ({b, u, n, h, k, z}) => {
  if (k <= 0) return null;
  const hh = h * k, w = 9;
  const q = (s: number, t: number) => `${b.x + u.x * s + n.x * t} ${b.y + u.y * s + n.y * t}`;
  const d = `M ${q(0, -w)} L ${q(hh * 0.88, -w * 0.62)} L ${q(hh, 0)} L ${q(hh * 0.88, w * 0.62)} L ${q(0, w)} Z`;
  return (
    <g>
      <path d={d} fill="#CFC3A2" stroke="#1A1408" strokeWidth={2.4 / z} />
      <path d={`M ${q(0, 0)} L ${q(hh * 0.88, 0)}`} stroke="#1A1408" strokeWidth={1.2 / z} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${q(hh * (0.1 + i * 0.13), 1)} L ${q(hh * (0.1 + i * 0.13) + 4, w * 0.8)}`} stroke="#1A1408" strokeWidth={1 / z} />)}
    </g>
  );
};

export const Terre: React.FC<AnimProps> = ({id, lt, p}) => {
  const rays = at(lt, p.rays, 0.9), well = at(lt, p.well), stick = at(lt, p.stick, 0.4), shadow = at(lt, p.shadow, 0.5), angle = at(lt, p.angle, 0.6), circ = at(lt, p.circ, 1.2);
  const w0 = p.wedges === undefined ? 99 : Number(p.wedges), w1 = Number(p.wedgesEnd ?? w0 + 2);
  const nW = p.wedges === undefined ? 0 : Math.min(50, Math.floor(clamp01((lt - w0) / (w1 - w0)) * 50.999));
  const zk = p.zIn === undefined ? 0 : prog(lt, Number(p.zIn), Number(p.zIn) + 0.7, easeInOut) * (1 - (p.zOut === undefined ? 0 : prog(lt, Number(p.zOut), Number(p.zOut) + 0.7, easeInOut)));
  const Z = lerp(1, 3.2, zk);
  const gold = G.gold;
  return (
    <>
      {/* le soleil de Flammarion, hors zoom */}
      <div style={{position: 'absolute', left: 790, top: 360, width: 190, opacity: rays * (1 - zk), transform: `rotate(${lt * 8}deg)`}}>
        <Img src={staticFile(`v/${id}/img/soleil.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <InkDefs p="er" ink="#05091A" />
        <g transform={`translate(${A.x} ${A.y}) scale(${Z}) translate(${-A.x} ${-A.y})`}>
          <path d={CIRCLE} fill="#16264E" />
          <Shade p="er" id="globe" d={CIRCLE} box={[C.x - R, C.y - R, 2 * R, 2 * R]} from={[0.95, 0.9]} to={[0.35, 0.25]} hatch="hm" cross />
          {[-60, -30, 0, 30, 60].map((l) => <ellipse key={l} cx={C.x} cy={C.y + R * Math.sin(l * deg)} rx={R * Math.cos(l * deg)} ry={R * Math.cos(l * deg) * 0.12} fill="none" stroke={INK} strokeWidth={1.6 / Z} opacity={0.35} />)}
          {[-50, -25, 0, 25, 50].map((m) => <ellipse key={m} cx={C.x + R * Math.sin(m * deg) * 0.0} cy={C.y} rx={R * Math.abs(Math.sin(m * deg))} ry={R} fill="none" stroke={INK} strokeWidth={1.6 / Z} opacity={m ? 0.25 : 0.35} />)}
          {Array.from({length: nW}, (_, j) => <path key={j} d={sector(-97.2 + j * 7.2, -90 + j * 7.2)} fill={gold} opacity={j % 2 ? 0.55 : 0.85} stroke="#0E1A3A" strokeWidth={1.5} />)}
          <path d={CIRCLE} fill="none" stroke={gold} strokeWidth={6 / Z} />
          {/* rayons parallèles, gravés en double trait */}
          {Array.from({length: 11}, (_, i) => {
            const x = 340 + i * 40, y1 = surfaceY(x);
            return <g key={i}><line x1={x} y1={560} x2={x} y2={lerp(560, y1, rays)} stroke={gold} strokeWidth={3 / Z} opacity={0.8} /><line x1={x + 5 / Z} y1={560} x2={x + 5 / Z} y2={lerp(560, y1, rays)} stroke={gold} strokeWidth={1 / Z} opacity={0.5} /></g>;
          })}
          {/* le puits de Syène */}
          {well > 0 ? (
            <g opacity={well}>
              <rect x={S.x - 16} y={S.y - 14} width={32} height={22} fill="#8C7A58" stroke="#1A1408" strokeWidth={2 / Z} />
              {[0, 1].map((r) => <line key={r} x1={S.x - 16} x2={S.x + 16} y1={S.y - 7 + r * 7} y2={S.y - 7 + r * 7} stroke="#1A1408" strokeWidth={1 / Z} />)}
              <rect x={S.x - 9} y={S.y - 14} width={18} height={40} fill="#05091A" />
              <line x1={S.x} y1={S.y} x2={S.x} y2={lerp(S.y, C.y, well)} stroke={gold} strokeWidth={3 / Z} strokeDasharray={`${12 / Z} ${8 / Z}`} />
            </g>
          ) : null}
          <Obelisque b={A} u={U} n={N} h={70} k={stick} z={Z} />
          {shadow > 0 ? <line x1={A.x} y1={A.y} x2={lerp(A.x, SH.x, shadow)} y2={lerp(A.y, SH.y, shadow)} stroke="#000000" strokeWidth={7 / Z} strokeLinecap="round" /> : null}
          {shadow > 0 ? <line x1={T.x} y1={T.y} x2={SH.x} y2={SH.y} stroke={gold} strokeWidth={2 / Z} strokeDasharray={`${5 / Z} ${4 / Z}`} opacity={shadow} /> : null}
          {angle > 0 ? <path d={sector(-97.2, -90, 150)} fill={gold} opacity={0.35 * angle} stroke={gold} strokeWidth={3 / Z} /> : null}
          {angle > 0 ? <line x1={C.x} y1={C.y} x2={A.x} y2={A.y} stroke={gold} strokeWidth={3 / Z} strokeDasharray={`${12 / Z} ${8 / Z}`} opacity={angle} /> : null}
          <circle cx={S.x} cy={S.y} r={7 / Z} fill={INK} opacity={rays} />
          <circle cx={A.x} cy={A.y} r={7 / Z} fill={INK} opacity={rays} />
          {circ > 0 ? <circle cx={C.x} cy={C.y} r={R + 18} fill="none" stroke={gold} strokeWidth={8} pathLength={1} strokeDasharray={`${circ} 1`} transform={`rotate(-90 ${C.x} ${C.y})`} /> : null}
        </g>
      </svg>
      <div style={{position: 'absolute', left: 580, top: 600, fontFamily: GF.label, fontSize: 46, letterSpacing: '0.08em', color: INK, opacity: rays * (1 - zk)}}>SYÈNE</div>
      <div style={{position: 'absolute', left: 90, top: 600, fontFamily: GF.label, fontSize: 46, letterSpacing: '0.08em', color: INK, opacity: rays * (1 - zk)}}>ALEXANDRIE</div>
      {zk > 0.5 ? <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 80, color: gold, opacity: (zk - 0.5) * 2, textShadow: G.shadow}}>{shadow > 0 ? 'UNE OMBRE !' : 'ALEXANDRIE'}</div> : null}
      {angle > 0 && zk < 0.5 ? <div style={{position: 'absolute', left: 585, top: 880, fontFamily: GF.serif, fontWeight: 900, fontSize: 92, color: gold, opacity: angle, textShadow: G.shadow}}>7,2°</div> : null}
      {angle > 0 && zk < 0.5 && nW === 0 ? <div style={{position: 'absolute', left: 590, top: 990, fontFamily: GF.serif, fontWeight: 700, fontSize: 64, color: INK, opacity: angle}}>= 1/50</div> : null}
      {nW > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 160, color: gold, textShadow: G.shadow}}>× {nW}</div> : null}
      {circ > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 66, color: INK, opacity: circ, textShadow: G.shadow}}>≈ 40 000 km</div> : null}
    </>
  );
};

/** Terre plate : même soleil, rayons verticaux, deux obélisques, aucune ombre */
export const Plate: React.FC<AnimProps> = ({id, lt}) => {
  const k = prog(lt, 0, 0.6, easeOut), lab = prog(lt, 0.7, 1.1);
  const gold = G.gold;
  const ground = 'M 120 960 H 960 L 940 1010 H 140 Z';
  return (
    <>
      <div style={{position: 'absolute', left: 445, top: 300, width: 190, opacity: k}}>
        <Img src={staticFile(`v/${id}/img/soleil.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <InkDefs p="pl" ink="#05091A" />
        <path d={ground} fill="#16264E" stroke={INK} strokeWidth={4} opacity={k} />
        <Shade p="pl" id="sol" d={ground} box={[120, 960, 840, 50]} from={[0.5, 1]} to={[0.5, 0]} hatch="hh" />
        {Array.from({length: 13}, (_, i) => <line key={i} x1={180 + i * 60} y1={520} x2={180 + i * 60} y2={lerp(520, 960, k)} stroke={gold} strokeWidth={3} opacity={0.7} />)}
        {[330, 750].map((x) => <Obelisque key={x} b={{x, y: 960}} u={{x: 0, y: -1}} n={{x: 1, y: 0}} h={150} k={k} z={1} />)}
      </svg>
      {['SYÈNE', 'ALEXANDRIE'].map((L, i) => <div key={L} style={{position: 'absolute', left: i ? 570 : 150, width: 360, top: 1030, textAlign: 'center', fontFamily: GF.label, fontSize: 44, letterSpacing: '0.06em', color: INK, opacity: lab}}>{L}<br /><span style={{color: gold, fontSize: 54}}>ombre : 0</span></div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 72, color: gold, opacity: lab, textShadow: G.shadow}}>SI LA TERRE ÉTAIT PLATE</div>
    </>
  );
};

/** le tour de la Terre d'Ératosthène contre celui de Colomb (−25 %) */
export const Colomb: React.FC<AnimProps> = ({lt}) => {
  const a = prog(lt, 0, 0.9, easeInOut), b = prog(lt, 0.8, 1.7, easeInOut);
  const gold = G.gold, red = '#FF5A4A';
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <InkDefs p="co" ink="#05091A" />
        <circle cx={540} cy={860} r={380} fill="#16264E" opacity={0.6 * a} />
        <Shade p="co" id="g" d="M 160 860 a 380 380 0 1 0 760 0 a 380 380 0 1 0 -760 0" box={[160, 480, 760, 760]} from={[0.95, 0.9]} to={[0.35, 0.25]} hatch="hm" o={a} />
        <circle cx={540} cy={860} r={380} fill="none" stroke={gold} strokeWidth={10} pathLength={1} strokeDasharray={`${a} 1`} transform="rotate(-90 540 860)" />
        <circle cx={540} cy={860} r={285} fill="none" stroke={red} strokeWidth={9} pathLength={1} strokeDasharray={`${b * 0.02} 0.012`} transform="rotate(-90 540 860)" opacity={b > 0 ? 1 : 0} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 390, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 64, color: gold, opacity: a, textShadow: G.shadow}}>ÉRATOSTHÈNE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 790, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 70, lineHeight: 1.05, color: red, opacity: b, textShadow: G.shadow}}>COLOMB<br /><span style={{fontSize: 104}}>−25 %</span></div>
    </>
  );
};

export const ERATO = {Terre, Plate, Colomb};
