// Animations sur mesure de la vidéo 18 (les rats sans queue de Hanoï, 1902), style archive coloniale.
// Le rat est la vraie planche peinte de Schreber (1775), détourée en deux morceaux superposables (corps, queue) :
// QueueCoupee : des ciseaux gravés tranchent la queue, elle tombe en tournoyant, le rat repart vivant ;
// Registre : registre administratif, une plume trace les bâtons de comptage, le total défile ;
// Grouillement : les rats se multiplient (×2 à chaque pas) et courent sur le papier.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Engraved, InkDefs, Shade} from './ink';

const INK = '#1E140B';
const RED = '#A8261C';
const SW = 900, SH = 450;          // taille des images rat_corps / rat_queue
const PIV = {x: 211, y: 273};      // base de la queue, dans l'image

/** le rat de Schreber : (x, y) = centre, w = largeur affichée ; tail : 1 visible, 0 cachée */
export const Rat: React.FC<{id: string; x: number; y: number; w: number; flip?: boolean; tail?: number; rot?: number; bob?: number}> = ({id, x, y, w, flip, tail = 1, rot = 0, bob = 0}) => {
  const k = w / SW;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - (SH * k) / 2 + bob, width: w, height: SH * k, transform: `scaleX(${flip ? -1 : 1}) rotate(${rot}deg)`, filter: 'drop-shadow(0 10px 10px rgba(30,20,10,0.35))'}}>
      {tail > 0 ? <Img src={staticFile(`v/${id}/img/rat_queue.webp`)} style={{position: 'absolute', left: 0, top: 0, width: '100%', opacity: tail}} /> : null}
      <Img src={staticFile(`v/${id}/img/rat_corps.webp`)} style={{position: 'absolute', left: 0, top: 0, width: '100%'}} />
    </div>
  );
};

/** ciseaux gravés, pivot en (0, 0), lames vers +x ; a = demi-ouverture en degrés */
const Ciseaux: React.FC<{a: number}> = ({a}) => {
  const blade = 'M -14 -9 C 70 -30, 190 -22, 268 -2 C 196 8, 76 12, -14 9 Z';
  const ring = (sy: number) => (
    <g>
      <path d={`M -14 ${sy * 6} C -60 ${sy * 14}, -80 ${sy * 22}, -96 ${sy * 30}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={-130} cy={sy * 44} rx={44} ry={30} fill="none" stroke={INK} strokeWidth={13} transform={`rotate(${sy * 20} -130 ${sy * 44})`} />
      <ellipse cx={-130} cy={sy * 44} rx={44} ry={30} fill="none" stroke="#8C7350" strokeWidth={3} transform={`rotate(${sy * 20} -130 ${sy * 44})`} />
    </g>
  );
  return (
    <g>
      <g transform={`rotate(${-a})`}>
        <Engraved p="sc" id="b1" d={blade} box={[-14, -30, 282, 42]} fill="#D8CDB5" from={[0.5, 1]} to={[0.5, 0.1]} hatch="hh" stroke={3.5} />
        {ring(-1)}
      </g>
      <g transform={`rotate(${a})`}>
        <Engraved p="sc" id="b2" d={'M -14 9 C 70 30, 190 22, 268 2 C 196 -8, 76 -12, -14 -9 Z'} box={[-14, -12, 282, 42]} fill="#C9BDA2" from={[0.5, 0]} to={[0.5, 0.9]} hatch="hh" stroke={3.5} />
        {ring(1)}
      </g>
      <circle r={11} fill="#B9A27A" stroke={INK} strokeWidth={4} />
      <circle r={3} fill={INK} />
    </g>
  );
};

/** la queue coupée : cut = instant de la coupe (s après le début du plan), run = le rat repart */
export const QueueCoupee: React.FC<AnimProps> = ({id, lt, t, p}) => {
  const cut = Number(p.cut ?? 0.8), run = Number(p.run ?? 1.6);
  const W = 940, k = W / SW, cx = 540, cy = 800;
  const px = cx - W / 2 + PIV.x * k, py = cy - (SH * k) / 2 + PIV.y * k; // base de la queue à l'écran
  // ciseaux : arrivent ouverts, se referment sur la base de la queue, repartent
  const inK = prog(lt, cut - 0.55, cut - 0.15, easeOut), outK = prog(lt, cut + 0.15, cut + 0.5, easeIn);
  const open = lt < cut - 0.12 ? 24 : lt < cut ? lerp(24, 2, (lt - (cut - 0.12)) / 0.12) : 2;
  const sx = px + 30 + (1 - inK) * 260 + outK * 300, sy = py - 230 - (1 - inK) * 400 - outK * 500;
  const fall = Math.max(0, lt - cut);
  const flash = lt > cut ? 1 - clamp01(fall / 0.22) : 0;
  const go = easeIn(clamp01((lt - run) / 0.75));
  const dx = go * 1100, bob = go > 0 ? Math.abs(Math.sin(t * 26)) * -10 : 0;
  return (
    <>
      {/* la queue détachée tombe en tournoyant autour de sa base */}
      {lt > cut ? (
        <div style={{position: 'absolute', left: cx - W / 2, top: cy - (SH * k) / 2, width: W, height: SH * k, transformOrigin: `${PIV.x * k}px ${PIV.y * k}px`, transform: `translate(${-fall * 90}px, ${fall * fall * 1100}px) rotate(${-fall * 160}deg)`, opacity: 1 - clamp01((fall - 0.7) / 0.3)}}>
          <Img src={staticFile(`v/${id}/img/rat_queue.webp`)} style={{width: '100%'}} />
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateX(${dx}px)`}}>
        <Rat id={id} x={cx} y={cy} w={W} tail={lt > cut ? 0 : 1} bob={bob} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <InkDefs p="sc" ink={INK} />
        {lt < cut + 0.55 && inK > 0 ? <g transform={`translate(${sx} ${sy}) rotate(112) scale(1.15)`}><Ciseaux a={open} /></g> : null}
        {flash > 0 ? (
          <g opacity={flash}>
            {Array.from({length: 9}, (_, i) => {
              const a = (i / 9) * Math.PI * 2;
              return <line key={i} x1={px + Math.cos(a) * 30} y1={py + Math.sin(a) * 30} x2={px + Math.cos(a) * (70 + 90 * (1 - flash))} y2={py + Math.sin(a) * (70 + 90 * (1 - flash))} stroke={RED} strokeWidth={6} strokeLinecap="round" />;
            })}
          </g>
        ) : null}
        {go > 0 ? [0, 1, 2, 3].map((i) => <line key={i} x1={cx - W / 2 + dx - 40 - i * 70} x2={cx - W / 2 + dx + 60 - i * 70} y1={cy - 60 + i * 40} y2={cy - 60 + i * 40} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.55 * go} />) : null}
      </svg>
      {lt > cut ? <div style={{position: 'absolute', left: px - 260, top: py - 250, fontFamily: GF.label, fontSize: 86, color: RED, transform: 'rotate(-10deg)', opacity: clamp01((fall - 0.03) / 0.1) * (1 - clamp01((fall - 1.0) / 0.3))}}>SNIP !</div> : null}
    </>
  );
};

/** plume d'oie gravée, pointe en (0, 0) */
const Plume: React.FC = () => (
  <g>
    <path d="M 0 0 L 26 -60 C 60 -160, 120 -260, 230 -330 C 170 -230, 120 -150, 40 -50 Z" fill="#EDE2C8" stroke={INK} strokeWidth={3} />
    {Array.from({length: 22}, (_, i) => {
      const u = 0.18 + i * 0.036;
      const x = lerp(26, 220, u), y = lerp(-60, -320, u);
      return <path key={i} d={`M ${x} ${y} q ${-30 - i} ${10} ${-46 - i * 1.4} ${34}`} stroke={INK} strokeWidth={1.4} fill="none" opacity={0.8} />;
    })}
    <path d="M 0 0 L 30 -66 C 80 -170, 140 -260, 230 -330" stroke={INK} strokeWidth={2.5} fill="none" />
    <path d="M 0 0 L 9 -18" stroke="#000" strokeWidth={5} />
  </g>
);

/** registre des queues : une plume trace les bâtons (4 + 1 barré), date en rouge, total qui défile jusqu'à `total` */
export const Registre: React.FC<AnimProps> = ({lt, t, p}) => {
  const total = Number(p.total ?? 20112);
  const fill = Number(p.fill ?? 1.8);
  const k = easeInOut(clamp01((lt - 0.15) / fill));
  const rows = 9, groups = 11;
  const N = rows * groups * 5;
  const shown = Math.floor(k * N);
  const pos = (m: number) => {
    const r = Math.floor(m / (groups * 5)), g = Math.floor((m % (groups * 5)) / 5), j = m % 5;
    return {gx: 300 + g * 58, gy: 600 + r * 62, j};
  };
  const marks: React.ReactNode[] = [];
  for (let m = 0; m < shown; m++) {
    const {gx, gy, j} = pos(m);
    const jx = (rand(m * 1.7) - 0.5) * 2.5;
    marks.push(j < 4
      ? <path key={m} d={`M ${gx + j * 10 + jx} ${gy} Q ${gx + j * 10 + 2} ${gy + 20} ${gx + j * 10 - jx} ${gy + 40}`} stroke={INK} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      : <line key={m} x1={gx - 6} y1={gy + 34} x2={gx + 38} y2={gy + 6} stroke={INK} strokeWidth={3.4} strokeLinecap="round" />);
  }
  const last = pos(Math.max(0, Math.min(N - 1, shown)));
  const tip = {x: last.gx + last.j * 10 + 4, y: last.gy + 40 - Math.abs(Math.sin(t * 40)) * 30};
  const n = Math.round(total * k);
  const blot = prog(lt, fill + 0.2, fill + 0.4, easeOut);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <InkDefs p="rg" ink={INK} />
        <rect x={110} y={430} width={860} height={860} fill="#ECDDB8" stroke="#8A6A3A" strokeWidth={3} />
        <Shade p="rg" id="page" d="M 110 430 H 970 V 1290 H 110 Z" box={[110, 430, 860, 860]} from={[1, 1]} to={[0.6, 0.6]} hatch="hl" o={0.35} />
        {Array.from({length: 14}, (_, i) => <line key={i} x1={110} x2={970} y1={540 + i * 62} y2={540 + i * 62} stroke="#7F9BBF" strokeWidth={1.5} opacity={0.6} />)}
        <line x1={270} x2={270} y1={430} y2={1290} stroke={RED} strokeWidth={2.5} opacity={0.8} />
        {Array.from({length: rows}, (_, r) => <text key={r} x={258} y={634 + r * 62} textAnchor="end" fontFamily={GF.label} fontSize={26} fill={RED} opacity={shown > r * groups * 5 ? 0.9 : 0}>{`${12 + r * 2} juin`}</text>)}
        {marks}
        {blot > 0 ? <path d="M 880 1170 c 18 -22, 50 -10, 46 10 c 20 4, 14 34, -8 30 c -6 22, -40 18, -40 0 c -22 0, -18 -30, 2 -40 Z" fill={INK} opacity={0.85} transform={`translate(880 1170) scale(${blot}) translate(-880 -1170)`} /> : null}
        {k < 1 ? <g transform={`translate(${tip.x} ${tip.y})`}><Plume /></g> : null}
      </svg>
      <div style={{position: 'absolute', left: 110, width: 860, top: 452, textAlign: 'center', fontFamily: GF.label, fontSize: 36, letterSpacing: '0.12em', color: INK}}>REGISTRE DES QUEUES — HANOÏ, 1902</div>
      <div style={{position: 'absolute', left: 110, width: 860, top: 1196, textAlign: 'right', paddingRight: 40, boxSizing: 'border-box', fontFamily: GF.label, fontSize: 60, color: RED}}>
        TOTAL : {n.toLocaleString('fr-FR').replace(/ /g, ' ')}
      </div>
    </>
  );
};

/** les rats se multiplient : ×2 toutes les `step` s jusqu'à `max`, chacun pope puis court */
export const Grouillement: React.FC<AnimProps> = ({id, lt, t, p}) => {
  const max = Number(p.max ?? 64), step = Number(p.step ?? 0.32);
  const gen = Math.floor(Math.max(0, lt) / step);
  const n = Math.min(max, 2 ** gen);
  const rats = Array.from({length: n}, (_, i) => {
    const born = Math.floor(Math.log2(i + 1)) * step;
    const kk = prog(lt, born, born + 0.18, overshoot);
    const by = 520 + rand(i * 5.1 + 2) * 700;
    const dir = rand(i * 7.7) > 0.5 ? 1 : -1;
    const sp = 70 + rand(i * 2.2) * 110;
    const x = ((140 + rand(i * 3.3 + 1) * 800 + dir * sp * Math.max(0, lt - born) - 60) % 960 + 960) % 960 + 60;
    const w = (170 + rand(i * 9.9) * 150) * (0.55 + 0.45 * (by - 520) / 700);
    return {i, x, y: by, w: w * kk, flip: dir < 0, bob: Math.abs(Math.sin(t * 20 + i)) * -6};
  }).sort((a, b) => a.y - b.y);
  return (
    <>
      {rats.map((r) => <Rat key={r.i} id={id} x={r.x} y={r.y} w={r.w} flip={r.flip} bob={r.bob} />)}
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 160, color: G.gold, textShadow: G.shadow}}>×{n}</div>
    </>
  );
};

export const HANOI = {Registre, Grouillement, QueueCoupee};
