// Animations sur mesure de la vidéo 22 (Ératosthène mesure la Terre), style atlas céleste :
// Terre : la démonstration complète, phase par phase (temps en s après le début du plan ; négatif = déjà dessiné) :
//   rays (rayons parallèles du soleil), well (puits de Syène, rayon jusqu'au centre), stick (bâton d'Alexandrie),
//   shadow (son ombre), angle (7,2° au bâton et au centre), wedges/wedgesEnd (le secteur recopié 50 fois),
//   circ (la circonférence tracée, ≈ 40 000 km) ; zIn/zOut : zoom ×3,2 sur Alexandrie.
// Plate : sur une Terre plate, deux bâtons, rayons verticaux : aucune ombre nulle part.
// Colomb : le vrai tour de la Terre (or) et celui de Colomb, 25 % trop petit (rouge, pointillés).
import React from 'react';
import {clamp01, easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const C = {x: 540, y: 1040}, R = 360;
const deg = Math.PI / 180;
const onCircle = (a: number, r = R) => ({x: C.x + r * Math.cos(a * deg), y: C.y + r * Math.sin(a * deg)});
const S = onCircle(-90), A = onCircle(-97.2);
const U = {x: Math.cos(-97.2 * deg), y: Math.sin(-97.2 * deg)};
const T = {x: A.x + U.x * 70, y: A.y + U.y * 70};
const SH = {x: T.x, y: C.y - Math.sqrt(R * R - (T.x - C.x) ** 2)}; // pied de l'ombre
const at = (lt: number, a: unknown, d = 0.6) => (a === undefined ? 0 : prog(lt, Number(a), Number(a) + d, easeOut));
const surfaceY = (x: number) => C.y - Math.sqrt(Math.max(0, R * R - (x - C.x) ** 2));

const sector = (a0: number, a1: number, r = R) => {
  const p0 = onCircle(a0, r), p1 = onCircle(a1, r);
  return `M ${C.x} ${C.y} L ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y} Z`;
};

export const Terre: React.FC<AnimProps> = ({lt, p}) => {
  const rays = at(lt, p.rays, 0.9), well = at(lt, p.well), stick = at(lt, p.stick, 0.4), shadow = at(lt, p.shadow, 0.5), angle = at(lt, p.angle, 0.6), circ = at(lt, p.circ, 1.2);
  const w0 = p.wedges === undefined ? 99 : Number(p.wedges), w1 = Number(p.wedgesEnd ?? w0 + 2);
  const nW = p.wedges === undefined ? 0 : Math.min(50, Math.floor(clamp01((lt - w0) / (w1 - w0)) * 50.999));
  const zk = p.zIn === undefined ? 0 : prog(lt, Number(p.zIn), Number(p.zIn) + 0.7, easeInOut) * (1 - (p.zOut === undefined ? 0 : prog(lt, Number(p.zOut), Number(p.zOut) + 0.7, easeInOut)));
  const Z = lerp(1, 3.2, zk);
  const gold = G.gold, ink = '#E9DFC2';
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <g transform={`translate(${A.x} ${A.y}) scale(${Z}) translate(${-A.x} ${-A.y})`}>
          <circle cx={C.x} cy={C.y} r={R} fill="#0E1A3A" stroke={ink} strokeWidth={4 / Z} />
          {/* méridiens et parallèles de globe */}
          {[-60, -30, 0, 30, 60].map((l) => <ellipse key={l} cx={C.x} cy={C.y + R * Math.sin(l * deg)} rx={R * Math.cos(l * deg)} ry={R * Math.cos(l * deg) * 0.12} fill="none" stroke={ink} strokeWidth={1.5 / Z} opacity={0.25} />)}
          {/* les 50 secteurs */}
          {Array.from({length: nW}, (_, j) => <path key={j} d={sector(-97.2 + j * 7.2, -90 + j * 7.2)} fill={gold} opacity={j % 2 ? 0.55 : 0.85} stroke="#0E1A3A" strokeWidth={1.5} />)}
          {/* rayons du soleil, parallèles */}
          {Array.from({length: 13}, (_, i) => {
            const x = 300 + i * 40, y1 = surfaceY(x);
            return <line key={i} x1={x} y1={220} x2={x} y2={lerp(220, y1, rays)} stroke={gold} strokeWidth={3 / Z} opacity={0.75} />;
          })}
          {/* puits de Syène : le rayon descend jusqu'au fond, et se prolonge jusqu'au centre */}
          {well > 0 ? <rect x={S.x - 9} y={S.y - 2} width={18} height={34} fill="#05091A" stroke={ink} strokeWidth={2 / Z} opacity={well} /> : null}
          {well > 0 ? <line x1={S.x} y1={S.y} x2={S.x} y2={lerp(S.y, C.y, well)} stroke={gold} strokeWidth={3 / Z} strokeDasharray={`${12 / Z} ${8 / Z}`} /> : null}
          {/* bâton d'Alexandrie (radial) et son ombre */}
          {stick > 0 ? <line x1={A.x} y1={A.y} x2={lerp(A.x, T.x, stick)} y2={lerp(A.y, T.y, stick)} stroke={ink} strokeWidth={6 / Z} strokeLinecap="round" /> : null}
          {shadow > 0 ? <line x1={A.x} y1={A.y} x2={lerp(A.x, SH.x, shadow)} y2={lerp(A.y, SH.y, shadow)} stroke="#000000" strokeWidth={7 / Z} strokeLinecap="round" /> : null}
          {shadow > 0 ? <line x1={T.x} y1={T.y} x2={SH.x} y2={SH.y} stroke={gold} strokeWidth={2 / Z} strokeDasharray={`${5 / Z} ${4 / Z}`} opacity={shadow} /> : null}
          {/* l'angle : au bâton, et le même au centre de la Terre */}
          {angle > 0 ? <path d={sector(-97.2, -90, 150)} fill={gold} opacity={0.35 * angle} stroke={gold} strokeWidth={3 / Z} /> : null}
          {angle > 0 ? <line x1={C.x} y1={C.y} x2={A.x} y2={A.y} stroke={gold} strokeWidth={3 / Z} strokeDasharray={`${12 / Z} ${8 / Z}`} opacity={angle} /> : null}
          <circle cx={S.x} cy={S.y} r={7 / Z} fill={ink} opacity={rays} />
          <circle cx={A.x} cy={A.y} r={7 / Z} fill={ink} opacity={rays} />
          {/* circonférence */}
          {circ > 0 ? <circle cx={C.x} cy={C.y} r={R + 18} fill="none" stroke={gold} strokeWidth={8} pathLength={1} strokeDasharray={`${circ} 1`} transform={`rotate(-90 ${C.x} ${C.y})`} /> : null}
        </g>
      </svg>
      {/* étiquettes (hors zoom) */}
      <div style={{position: 'absolute', left: 600, top: 600, fontFamily: GF.label, fontSize: 34, letterSpacing: '0.12em', color: ink, opacity: rays * (1 - zk)}}>SYÈNE</div>
      <div style={{position: 'absolute', left: 120, top: 600, fontFamily: GF.label, fontSize: 34, letterSpacing: '0.12em', color: ink, opacity: rays * (1 - zk)}}>ALEXANDRIE</div>
      {zk > 0.5 ? <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 64, color: gold, opacity: (zk - 0.5) * 2 * Math.max(stick, 0.3)}}>{shadow > 0 ? 'UNE OMBRE !' : 'ALEXANDRIE'}</div> : null}
      {angle > 0 && zk < 0.5 ? <div style={{position: 'absolute', left: 590, top: 900, fontFamily: GF.serif, fontWeight: 900, fontSize: 70, color: gold, opacity: angle}}>7,2°</div> : null}
      {angle > 0 && zk < 0.5 && nW === 0 ? <div style={{position: 'absolute', left: 590, top: 980, fontFamily: GF.serif, fontWeight: 700, fontSize: 48, color: ink, opacity: angle}}>= 1/50</div> : null}
      {nW > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 150, color: gold, textShadow: G.shadow}}>× {nW}</div> : null}
      {circ > 0 ? <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 52, color: ink, opacity: circ}}>≈ 40 000 km</div> : null}
    </>
  );
};

/** Terre plate : rayons verticaux, deux bâtons, aucune ombre */
export const Plate: React.FC<AnimProps> = ({lt}) => {
  const k = prog(lt, 0, 0.6, easeOut), lab = prog(lt, 0.7, 1.1);
  const gold = G.gold, ink = '#E9DFC2';
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <rect x={140} y={960} width={800} height={30} fill="#0E1A3A" stroke={ink} strokeWidth={4} opacity={k} />
        {Array.from({length: 13}, (_, i) => <line key={i} x1={180 + i * 60} y1={260} x2={180 + i * 60} y2={lerp(260, 960, k)} stroke={gold} strokeWidth={3} opacity={0.7} />)}
        {[330, 750].map((x) => <line key={x} x1={x} y1={960} x2={x} y2={lerp(960, 820, k)} stroke={ink} strokeWidth={8} strokeLinecap="round" />)}
      </svg>
      {['SYÈNE', 'ALEXANDRIE'].map((L, i) => <div key={L} style={{position: 'absolute', left: i ? 600 : 180, width: 300, top: 1010, textAlign: 'center', fontFamily: GF.label, fontSize: 32, letterSpacing: '0.1em', color: ink, opacity: lab}}>{L}<br /><span style={{color: gold, fontSize: 40}}>ombre : 0</span></div>)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 64, color: gold, opacity: lab}}>SI LA TERRE ÉTAIT PLATE</div>
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
        <circle cx={540} cy={860} r={380} fill="none" stroke={gold} strokeWidth={9} pathLength={1} strokeDasharray={`${a} 1`} transform="rotate(-90 540 860)" />
        <circle cx={540} cy={860} r={285} fill="none" stroke={red} strokeWidth={8} pathLength={1} strokeDasharray={`${b * 0.02} 0.012`} transform="rotate(-90 540 860)" opacity={b > 0 ? 1 : 0} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 410, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 50, color: gold, opacity: a}}>ÉRATOSTHÈNE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 56, color: red, opacity: b}}>COLOMB<br /><span style={{fontSize: 80}}>−25 %</span></div>
    </>
  );
};

export const ERATO = {Terre, Plate, Colomb};
