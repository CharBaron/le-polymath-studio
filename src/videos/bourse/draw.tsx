// Dessins propres à la vidéo 10 (style Carnet) : navire de la VOC, foule de 1602, certificat d'action,
// robots vendeurs, wagonnet, tulipe, petits fonds, Pac-Man des frais, bulle.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, clamp01, F, handPath, rand} from '../../theme';
import {rectPts} from '../../components/Drawings';

type P2 = [number, number];
const WOOD = '#8A5A2B';
const WOOD_D = '#5E3B1A';
export const PARCH = '#F3E3BC';
export const PARCH_D = '#E2CC97';
export const GOLD = '#E8B93A';

/** Texte SVG manuscrit. */
export const T: React.FC<{x: number; y: number; size?: number; color?: string; w?: 400 | 700; a?: 'start' | 'middle' | 'end'; o?: number; rot?: number; children: React.ReactNode}> = ({x, y, size = 48, color = C.ink, w = 700, a = 'start', o = 1, rot = 0, children}) => (
  <text x={x} y={y} fontSize={size} fontWeight={w} fill={color} textAnchor={a} opacity={o} transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} style={{fontFamily: F.hand}}>
    {children}
  </text>
);

/** Rectangle à main levée (centre x, y). */
export const HRect: React.FC<{x: number; y: number; w: number; h: number; fill?: string; stroke?: string; sw?: number; id?: number}> = ({x, y, w, h, fill = C.white, stroke = C.ink, sw = 6, id = 1}) => {
  const frame = useCurrentFrame();
  return <path d={handPath(rectPts(w, h).map(([a, b]) => [a + x, b + y] as P2), frame, id, 1.1)} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />;
};

/** Tampon encreur qui s'écrase (k 0→1). */
export const Stamp: React.FC<{x: number; y: number; k: number; w: number; text: string; color?: string; size?: number; rot?: number}> = ({x, y, k, w, text, color = C.red, size = 56, rot = -7}) =>
  k > 0.01 ? (
    <g transform={`translate(${x} ${y}) rotate(${rot + (1 - k) * 18}) scale(${0.6 + 0.4 * k})`} opacity={clamp01(k * 3)}>
      <rect x={-w / 2} y={-size * 1.05} width={w} height={size * 2.1} rx={12} fill={C.white} stroke={color} strokeWidth={7} />
      <T x={0} y={size * 0.35} size={size} color={color} a="middle">{text}</T>
    </g>
  ) : null;

// ---------- mer et navire ----------
export const waveY = (x: number, t: number, row = 0) => Math.sin(x * 0.012 + t * 1.6 + row * 1.7) * 14 + Math.sin(x * 0.031 - t * 2.3 + row) * 6;
export const Waves: React.FC<{x0: number; x1: number; y: number; t: number; rows?: number; id?: number; bottom?: number}> = ({x0, x1, y, t, rows = 4, id = 1, bottom = 1e9}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {Array.from({length: rows}, (_, r) => {
        const yy = y + r * 70;
        const pts: P2[] = [];
        for (let x = x0; x <= x1; x += 40) pts.push([x, yy + waveY(x, t, r)]);
        return (
          <g key={r}>
            <path d={`${handPath(pts, frame, id + r, 1)} L ${x1} ${Math.min(bottom, yy + 400)} L ${x0} ${Math.min(bottom, yy + 400)} Z`} fill={r === 0 ? '#BFD8EE' : '#A9C9E6'} opacity={r === 0 ? 1 : 0.5} />
            <path d={handPath(pts, frame, id + r, 1)} fill="none" stroke={C.pen} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
          </g>
        );
      })}
    </g>
  );
};

/** Navire marchand (point d'ancrage : milieu de la ligne de flottaison). */
export const Ship: React.FC<{x: number; y: number; s?: number; rot?: number; id?: number; grid?: number}> = ({x, y, s = 1, rot = 0, id = 1, grid = 0}) => {
  const frame = useCurrentFrame();
  const hull: P2[] = [[-260, -70], [-200, 40], [190, 40], [250, -90], [300, -120], [240, -110], [170, -60], [-230, -60], [-260, -70]];
  const sail = (cx: number, top: number, w: number, h: number, i: number) => (
    <g key={i}>
      <line x1={cx} y1={-60} x2={cx} y2={top - 30} stroke={WOOD_D} strokeWidth={10} />
      <path d={handPath([[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 + 14, top + h], [cx - w / 2 - 14, top + h], [cx - w / 2, top]], frame, id + i, 1.4)} fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {sail(-120, -330, 150, 210, 1)}
      {sail(30, -400, 180, 270, 2)}
      {sail(170, -290, 120, 170, 3)}
      {/* monogramme VOC sur la grande voile */}
      <T x={30} y={-235} size={64} color={C.red} a="middle">VOC</T>
      <path d="M 30 -430 L 30 -470 L 90 -458 L 30 -446" fill={C.red} stroke={C.ink} strokeWidth={4} />
      <path d={handPath(hull, frame, id + 9, 1.2)} fill={WOOD} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <line x1={-215} y1={-20} x2={200} y2={-20} stroke={WOOD_D} strokeWidth={5} />
      {[-150, -60, 30, 120].map((cx) => <circle key={cx} cx={cx} cy={0} r={10} fill={WOOD_D} stroke={C.ink} strokeWidth={3} />)}
      {/* découpe en morceaux : quadrillage pointillé */}
      {grid > 0 ? (
        <g opacity={clamp01(grid)} stroke={C.ink} strokeWidth={4} strokeDasharray="14 10" fill="none">
          {[-170, -80, 10, 100, 190].map((gx) => <line key={gx} x1={gx} y1={-460} x2={gx} y2={40} />)}
          {[-380, -260, -140, -20].map((gy) => <line key={gy} x1={-260} y1={gy} x2={270} y2={gy} />)}
        </g>
      ) : null}
    </g>
  );
};

/** Bonhomme de 1602 (pieds en x, y). hat : 0 chapeau, 1 béret, 2 coiffe (servante). */
export const Person: React.FC<{x: number; y: number; s?: number; hat?: number; color?: string; bob?: number; spin?: number; id?: number}> = ({x, y, s = 1, hat = 0, color = '#3B4A6B', bob = 0, spin = 0}) => (
  <g transform={`translate(${x} ${y - bob}) scale(${s})`}>
    <path d="M -26 0 L -20 -70 Q 0 -86 20 -70 L 26 0 Z" fill={color} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -18 -74 Q 0 -60 18 -74" fill={C.white} stroke={C.ink} strokeWidth={3} />
    <circle cx={0} cy={-100} r={24} fill="#F2D2B6" stroke={C.ink} strokeWidth={5} />
    {spin > 0 ? (
      <g stroke={C.ink} strokeWidth={2.5} fill="none">
        {[-9, 9].map((ex) => <path key={ex} d={`M ${ex} -102 m -5 0 a 5 5 0 1 1 5 5 a 3 3 0 1 1 -3 -3`} transform={`rotate(${spin * 360} ${ex} -102)`} />)}
      </g>
    ) : (
      <g fill={C.ink}>
        <circle cx={-8} cy={-102} r={3.5} />
        <circle cx={8} cy={-102} r={3.5} />
      </g>
    )}
    {hat === 0 ? (
      <g>
        <rect x={-34} y={-122} width={68} height={8} rx={3} fill={C.ink} />
        <path d="M -18 -122 L -15 -152 L 15 -152 L 18 -122 Z" fill={C.ink} />
      </g>
    ) : hat === 1 ? (
      <ellipse cx={4} cy={-120} rx={28} ry={11} fill="#7A2E2E" stroke={C.ink} strokeWidth={4} />
    ) : (
      <path d="M -27 -96 Q -28 -132 0 -132 Q 28 -132 27 -96 Q 14 -112 0 -112 Q -14 -112 -27 -96 Z" fill={C.white} stroke={C.ink} strokeWidth={4} />
    )}
  </g>
);

/** Petit certificat d'action (centre x, y). */
export const Cert: React.FC<{x: number; y: number; w: number; rot?: number; o?: number}> = ({x, y, w, rot = 0, o = 1}) => {
  const h = w * 1.4;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={PARCH} stroke={C.ink} strokeWidth={Math.max(1.5, w * 0.08)} />
      <line x1={-w * 0.3} y1={-h * 0.22} x2={w * 0.3} y2={-h * 0.22} stroke={C.ink} strokeWidth={Math.max(1, w * 0.05)} />
      <line x1={-w * 0.3} y1={0} x2={w * 0.2} y2={0} stroke={C.ink} strokeWidth={Math.max(1, w * 0.04)} opacity={0.6} />
      <circle cx={w * 0.18} cy={h * 0.26} r={w * 0.14} fill={C.red} />
    </g>
  );
};

/** Sceau de cire VOC. */
export const Seal: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <path d={Array.from({length: 13}, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      const rr = r * (1 + 0.08 * Math.sin(i * 2.7));
      return `${i ? 'L' : 'M'} ${x + Math.cos(a) * rr} ${y + Math.sin(a) * rr}`;
    }).join(' ')} fill="#B3261E" stroke={C.ink} strokeWidth={5} />
    <circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="#7E1712" strokeWidth={4} />
    <T x={x} y={y + r * 0.22} size={r * 0.62} color="#FBE3D6" a="middle">VOC</T>
  </g>
);

/** Sac d'épices (macis) incliné de `tilt` degrés. */
export const Sack: React.FC<{x: number; y: number; tilt: number; id?: number}> = ({x, y, tilt, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <path d={handPath([[-80, 90], [-95, -10], [-60, -80], [60, -80], [95, -10], [80, 90], [-80, 90]], frame, id, 1.4)} fill="#D9B98A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -60 -80 Q 0 -110 60 -80" fill="none" stroke={C.ink} strokeWidth={5} />
      <ellipse cx={0} cy={-84} rx={56} ry={14} fill="#C2410C" stroke={C.ink} strokeWidth={4} />
      <T x={0} y={30} size={40} a="middle" color="#7A3A12">macis</T>
    </g>
  );
};

/** Robot vendeur : tête carrée, antenne, bras sur un gros bouton VENTE (press 0→1). */
export const Robot: React.FC<{x: number; y: number; s?: number; press: number; id?: number}> = ({x, y, s = 1, press, id = 1}) => {
  const frame = useCurrentFrame();
  const blink = (frame + id * 7) % 40 < 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <line x1={0} y1={-150} x2={0} y2={-185} stroke={C.ink} strokeWidth={5} />
      <circle cx={0} cy={-190} r={9} fill={C.red} stroke={C.ink} strokeWidth={3} />
      <path d={handPath(rectPts(110, 80).map(([a, b]) => [a, b - 110] as P2), frame, id, 1)} fill="#C9D3E0" stroke={C.ink} strokeWidth={5} />
      <rect x={-34} y={-128} width={22} height={blink ? 4 : 18} fill={C.ink} />
      <rect x={12} y={-128} width={22} height={blink ? 4 : 18} fill={C.ink} />
      <path d="M -20 -86 L 20 -86" stroke={C.ink} strokeWidth={4} />
      <path d={handPath(rectPts(90, 70).map(([a, b]) => [a, b - 35] as P2), frame, id + 1, 1)} fill="#AEBBCB" stroke={C.ink} strokeWidth={5} />
      <line x1={-45} y1={-50} x2={-80} y2={-20 + press * 18} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <rect x={-125} y={-12} width={70} height={26} rx={8} fill={C.red} stroke={C.ink} strokeWidth={4} transform={`translate(0 ${press * 6})`} />
      <T x={-90} y={44} size={22} a="middle" color={C.red}>VENTE</T>
    </g>
  );
};

/** Wagonnet (centre du plancher en 0,0 ; à placer dans un groupe orienté). */
export const Cart: React.FC<{front?: boolean; id?: number}> = ({front, id = 1}) => {
  const frame = useCurrentFrame();
  if (front)
    return (
      <g>
        <path d={handPath([[-95, -6], [-105, -96], [105, -96], [95, -6], [-95, -6]], frame, id, 1.1)} fill={C.orange} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
        <T x={0} y={-36} size={34} a="middle" color={C.white}>S&amp;P 500</T>
      </g>
    );
  return (
    <g>
      {[-60, 60].map((wx) => (
        <g key={wx}>
          <circle cx={wx} cy={10} r={20} fill={C.ink} />
          <circle cx={wx} cy={10} r={7} fill={C.paper} />
        </g>
      ))}
      <rect x={-100} y={-104} width={200} height={14} rx={6} fill="#C9431A" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Tulipe panachée (Semper Augustus : flammes rouges sur blanc). k = croissance 0→1. */
export const Tulip: React.FC<{x: number; y: number; h: number; k: number; t: number; id?: number}> = ({x, y, h, k, t, id = 1}) => {
  const frame = useCurrentFrame();
  const sk = clamp01(k * 1.6);
  const fk = clamp01((k - 0.5) * 2);
  const top = y - h * sk;
  const sway = Math.sin(t * 1.4) * 4;
  return (
    <g>
      <path d={handPath([[x, y], [x + sway * 0.4, y - h * sk * 0.5], [x + sway, top]], frame, id, 1)} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" />
      {sk > 0.4 ? <path d={`M ${x} ${y - h * 0.25} Q ${x - 90} ${y - h * 0.45} ${x - 40} ${y - h * 0.75} Q ${x - 30} ${y - h * 0.45} ${x} ${y - h * 0.32} Z`} fill="#7CC08A" stroke={C.ink} strokeWidth={5} opacity={clamp01((sk - 0.4) * 3)} /> : null}
      {fk > 0 ? (
        <g transform={`translate(${x + sway} ${top}) scale(${fk})`}>
          <path d="M -60 0 Q -70 -90 -30 -120 Q -10 -80 0 -125 Q 10 -80 30 -120 Q 70 -90 60 0 Q 0 30 -60 0 Z" fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          {[-38, -14, 12, 36].map((sx, i) => <path key={i} d={`M ${sx} 4 Q ${sx + (i % 2 ? 10 : -10)} -50 ${sx + 4} -100`} stroke={C.red} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />)}
        </g>
      ) : null}
    </g>
  );
};

/** Bulbe (oignon). */
export const Bulb: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <g>
    <path d={`M ${x} ${y - r * 1.5} Q ${x + r * 1.2} ${y - r * 0.4} ${x + r * 0.9} ${y + r * 0.6} Q ${x} ${y + r * 1.1} ${x - r * 0.9} ${y + r * 0.6} Q ${x - r * 1.2} ${y - r * 0.4} ${x} ${y - r * 1.5} Z`} fill="#D9A066" stroke={C.ink} strokeWidth={5} />
    <path d={`M ${x - r * 0.5} ${y + r * 0.8} L ${x - r * 0.6} ${y + r * 1.15} M ${x} ${y + r * 0.95} L ${x} ${y + r * 1.3} M ${x + r * 0.5} ${y + r * 0.8} L ${x + r * 0.6} ${y + r * 1.15}`} stroke={C.ink} strokeWidth={3} />
    <path d={`M ${x} ${y - r * 1.3} Q ${x + r * 0.3} ${y - r * 0.2} ${x} ${y + r * 0.9}`} stroke="#A9743F" strokeWidth={3} fill="none" />
  </g>
);

/** Petit fonds (pot avec courbe). dim 0→1 : s'éteint (gris, flèche vers le bas). gold : reste doré. */
export const Fund: React.FC<{x: number; y: number; s: number; dim: number; gold?: boolean; t: number; i: number}> = ({x, y, s, dim, gold, t, i}) => {
  const col = gold ? GOLD : dim > 0.5 ? '#B9B6AE' : C.pen;
  const sparkle = gold ? 0.5 + 0.5 * Math.sin(t * 6 + i) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-22} y={-22} width={44} height={44} rx={9} fill={gold ? '#FFF4CC' : C.white} stroke={col} strokeWidth={4} />
      <path d={dim > 0.5 && !gold ? 'M -13 -8 L -3 0 L 4 -4 L 13 10' : 'M -13 10 L -3 2 L 4 6 L 13 -10'} stroke={col} strokeWidth={4} fill="none" strokeLinecap="round" />
      {gold ? <path d={`M 22 -26 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z`} fill={GOLD} opacity={sparkle} /> : null}
    </g>
  );
};

/** Pac-Man des frais (bouche qui s'ouvre et se ferme). */
export const Chomp: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => {
  const a = (0.12 + 0.28 * Math.abs(Math.sin(t * 9))) * Math.PI;
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + Math.cos(a) * r} ${y - Math.sin(a) * r} A ${r} ${r} 0 1 0 ${x + Math.cos(a) * r} ${y + Math.sin(a) * r} Z`} fill={C.red} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={x - r * 0.05} cy={y - r * 0.5} r={r * 0.11} fill={C.ink} />
    </g>
  );
};

/** Bulle de savon irisée. */
export const Bubble: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => {
  const wob = 1 + Math.sin(t * 5) * 0.03;
  return (
    <g transform={`translate(${x} ${y}) scale(${wob} ${2 - wob})`}>
      <circle r={r} fill="rgba(170,210,255,0.25)" stroke="#7FB2E5" strokeWidth={6} />
      <path d={`M ${-r * 0.55} ${-r * 0.35} A ${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.1} ${-r * 0.7}`} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
      <circle r={r * 0.96} fill="none" stroke="#E7A6F0" strokeWidth={3} opacity={0.6} strokeDasharray={`${r * 0.8} ${r * 1.2}`} transform={`rotate(${t * 40})`} />
    </g>
  );
};

/** Éclats (bulle qui éclate, échange, …). */
export const Burst: React.FC<{x: number; y: number; k: number; r: number; color?: string; n?: number; seed?: number}> = ({x, y, k, r, color = C.hl, n = 10, seed = 1}) =>
  k > 0 && k < 1 ? (
    <g opacity={1 - k}>
      {Array.from({length: n}, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand(seed + i) * 0.4;
        const r0 = r * (0.3 + 0.7 * k);
        const r1 = r * (0.6 + 0.9 * k);
        return <line key={i} x1={x + Math.cos(a) * r0} y1={y + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + Math.sin(a) * r1} stroke={color} strokeWidth={8} strokeLinecap="round" />;
      })}
    </g>
  ) : null;
