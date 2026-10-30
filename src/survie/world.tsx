// Briques de décor du style « Survie » : caméra, ciel, silhouettes de ville, tour à fenêtres, fumée, lumières, voitures vues de dessus.
// Tout est en SVG 1080×1920, éclairé par dégradés et halos (pas d'aplat mort), déterministe (rand), fonction du temps.
import React from 'react';
import {clamp01, lerp, rand} from '../theme';

export type SceneP = {t: number; T: number; d: number; B: Record<string, number>};
export const W = 1080, H = 1920;

/** caméra : centre (x, y) du monde à l'écran, zoom z, rotation r (deg) */
export const Cam: React.FC<{x: number; y: number; z: number; r?: number; children: React.ReactNode}> = ({x, y, z, r = 0, children}) => (
  <g transform={`translate(${W / 2},${H / 2}) rotate(${r}) scale(${z}) translate(${-x},${-y})`}>{children}</g>
);

/** dégradé vertical réutilisable */
export const VGrad: React.FC<{id: string; stops: [number, string][]}> = ({id, stops}) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
  </linearGradient>
);
export const RGrad: React.FC<{id: string; stops: [number, string][]; cx?: number; cy?: number; r?: number}> = ({id, stops, cx = 0.5, cy = 0.5, r = 0.5}) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r}>
    {stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}
  </radialGradient>
);
/** filtres de flou partagés (profondeur de champ, halos) */
export const Blurs: React.FC = () => (
  <defs>
    {[2, 4, 8, 14, 24, 40].map((b) => (
      <filter key={b} id={`b${b}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={b} /></filter>
    ))}
  </defs>
);

/** halo lumineux (cercle flou) */
export const Glow: React.FC<{x: number; y: number; r: number; color: string; o?: number; blur?: number}> = ({x, y, r, color, o = 1, blur = 24}) => (
  <circle cx={x} cy={y} r={r} fill={color} opacity={o} filter={`url(#b${blur})`} />
);

/** colonne de fumée : boules floues qui montent, grossissent et s'effacent */
export const Smoke: React.FC<{x: number; y: number; T: number; seed: number; scale?: number; color?: string; o?: number; wind?: number}> = ({x, y, T, seed, scale = 1, color = '#17151F', o = 0.6, wind = 30}) => {
  const n = 11;
  return (
    <g filter="url(#b14)">
      {Array.from({length: n}, (_, i) => {
        const life = 7, ph = ((T + (i / n) * life + rand(seed + i) * 2) % life) / life;
        const r = (26 + 120 * ph) * scale;
        return <circle key={i} cx={x + (wind * ph * ph * 4 + (rand(seed * 3 + i) - 0.5) * 40) * scale} cy={y - ph * 620 * scale} r={r} fill={color} opacity={o * Math.sin(Math.PI * Math.min(1, ph * 1.4)) * (1 - ph * 0.5)} />;
      })}
    </g>
  );
};

/** rangée d'immeubles en silhouette avec fenêtres (éteintes au fil de `off`) */
export const Skyline: React.FC<{y: number; seed: number; color: string; lit: string; litRatio: number; hMin: number; hMax: number; x0?: number; x1?: number; wMin?: number; wMax?: number; off?: (k: number) => number; winScale?: number}> = ({
  y, seed, color, lit, litRatio, hMin, hMax, x0 = -200, x1 = 1280, wMin = 80, wMax = 190, off, winScale = 1,
}) => {
  const bs: React.ReactNode[] = [];
  let x = x0, i = 0;
  while (x < x1) {
    const w = lerp(wMin, wMax, rand(seed + i * 1.7)), h = lerp(hMin, hMax, rand(seed + i * 3.1));
    const wins: React.ReactNode[] = [];
    const cw = 9 * winScale, ch = 12 * winScale, gx = 22 * winScale, gy = 26 * winScale;
    for (let wy = y - h + 18 * winScale; wy < y - 14; wy += gy) {
      for (let wx = x + 12 * winScale; wx < x + w - 14 * winScale; wx += gx) {
        const k = seed * 1000 + Math.round(wx * 7 + wy * 13);
        if (rand(k) < litRatio) {
          const a = off ? 1 - clamp01(off(k)) : 1;
          if (a > 0.01) wins.push(<rect key={k} x={wx} y={wy} width={cw} height={ch} fill={lit} opacity={(0.55 + 0.45 * rand(k + 1)) * a} />);
        }
      }
    }
    bs.push(
      <g key={i}>
        <rect x={x} y={y - h} width={w + 1} height={h + 400} fill={color} />
        {rand(seed + i * 5) > 0.7 ? <rect x={x + w * 0.4} y={y - h - 26} width={6} height={26} fill={color} /> : null}
        {wins}
      </g>,
    );
    x += w - 2;
    i++;
  }
  return <g>{bs}</g>;
};

/** tour de `floors` étages × `cols` fenêtres ; `win(f, c)` donne la couleur d'une fenêtre (null = éteinte) */
export const Tower: React.FC<{x: number; y: number; w: number; floors: number; fh: number; cols: number; body: string; edge: string; win: (f: number, c: number) => string | null; dark?: string; roof?: boolean; children?: React.ReactNode}> = ({
  x, y, w, floors, fh, cols, body, edge, win, dark = '#1B1A26', roof = true, children,
}) => {
  const ww = 44, wh = 58.67, gap = (w - cols * ww) / (cols + 1);
  const cells: React.ReactNode[] = [];
  for (let f = 1; f <= floors; f++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + gap + c * (ww + gap), wy = y + 18 + (floors - f) * fh;
      const col = win(f, c);
      cells.push(
        <g key={`${f}-${c}`}>
          <rect x={wx - 3} y={wy - 3} width={ww + 6} height={wh + 6} fill="rgba(0,0,0,0.28)" />
          <rect x={wx} y={wy} width={ww} height={wh} fill={col ?? dark} />
          {col ? <rect x={wx} y={wy} width={ww} height={wh} fill={col} opacity={0.45} filter="url(#b8)" /> : null}
          <rect x={wx + ww / 2 - 1} y={wy} width={2} height={wh} fill="rgba(0,0,0,0.25)" />
        </g>,
      );
    }
  }
  const hh = floors * fh + 30;
  return (
    <g>
      <rect x={x} y={y} width={w} height={hh + 400} fill={body} />
      <rect x={x + w - 18} y={y} width={18} height={hh + 400} fill={edge} opacity={0.55} />
      <rect x={x} y={y} width={w} height={10} fill={edge} opacity={0.6} />
      {roof ? (
        <g>
          <rect x={x + w * 0.62} y={y - 70} width={70} height={58} fill={body} />
          <rect x={x + w * 0.62 + 6} y={y - 12} width={6} height={12} fill={body} />
          <rect x={x + w * 0.62 + 58} y={y - 12} width={6} height={12} fill={body} />
          <path d={`M${x + w * 0.62 - 4} ${y - 70} L${x + w * 0.62 + 35} ${y - 92} L${x + w * 0.62 + 74} ${y - 70} Z`} fill={body} />
          <rect x={x + w * 0.2} y={y - 120} width={4} height={120} fill={body} />
        </g>
      ) : null}
      {cells}
      {children}
    </g>
  );
};
/** coin supérieur gauche de la fenêtre (étage f, colonne c) d'une Tower */
export const winAt = (x: number, y: number, w: number, floors: number, fh: number, cols: number, f: number, c: number) => {
  const ww = 44, gap = (w - cols * ww) / (cols + 1);
  return [x + gap + c * (ww + gap), y + 18 + (floors - f) * fh] as const;
};

/** voiture vue de dessus (longueur 150) */
export const CarTop: React.FC<{x: number; y: number; r?: number; color: string; lights?: number; alarm?: number}> = ({x, y, r = 0, color, lights = 0, alarm = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-80} y={-40} width={160} height={84} rx={18} fill="rgba(0,0,0,0.35)" filter="url(#b4)" />
    <rect x={-75} y={-36} width={150} height={72} rx={16} fill={color} />
    <rect x={-36} y={-30} width={70} height={60} rx={10} fill="rgba(0,0,0,0.38)" />
    <rect x={-28} y={-25} width={52} height={50} rx={7} fill={color} opacity={0.85} />
    <rect x={-75} y={-36} width={150} height={12} rx={6} fill="rgba(255,255,255,0.12)" />
    {lights > 0 ? (
      <g opacity={lights}>
        <path d="M75 -30 L260 -80 L260 80 L75 30 Z" fill="rgba(255,240,200,0.18)" filter="url(#b8)" />
        <circle cx={72} cy={-24} r={7} fill="#FFF4D6" />
        <circle cx={72} cy={24} r={7} fill="#FFF4D6" />
      </g>
    ) : null}
    {alarm > 0 ? (
      <g opacity={alarm}>
        {[[-72, -30], [-72, 30], [72, -30], [72, 30]].map(([ax, ay], i) => <circle key={i} cx={ax} cy={ay} r={26} fill="#FFB020" filter="url(#b8)" />)}
        {[[-72, -30], [-72, 30], [72, -30], [72, 30]].map(([ax, ay], i) => <circle key={`c${i}`} cx={ax} cy={ay} r={8} fill="#FFE6A0" />)}
      </g>
    ) : null}
  </g>
);

/** camionnette renversée vue de dessus */
export const VanTop: React.FC<{x: number; y: number; r?: number; T: number}> = ({x, y, r = 0, T}) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-112} y={-52} width={232} height={112} rx={14} fill="rgba(0,0,0,0.4)" filter="url(#b8)" />
    <rect x={-110} y={-50} width={220} height={100} rx={12} fill="#D9DADF" />
    <rect x={-110} y={-50} width={220} height={18} rx={8} fill="#F2F2F4" />
    <rect x={40} y={-44} width={60} height={88} rx={8} fill="#9EA3AE" />
    <path d="M-60 -50 L-20 0 L-70 50" stroke="#7A7E88" strokeWidth={4} fill="none" />
    <path d="M110 -40 L380 -150 L380 150 L110 40 Z" fill="rgba(255,236,190,0.16)" filter="url(#b14)" />
    <circle cx={108} cy={-36} r={9} fill="#FFF3D0" />
    <circle cx={108} cy={36} r={9} fill="#FFF3D0" />
    <circle cx={-90} cy={0} r={40 + 6 * Math.sin(T * 3)} fill="rgba(40,36,40,0.35)" filter="url(#b14)" />
  </g>
);

/** gyrophares (rouge / bleu alternés) */
export const Siren: React.FC<{x: number; y: number; T: number; s?: number}> = ({x, y, T, s = 1}) => {
  const ph = Math.floor(T * 4) % 2;
  return (
    <g>
      <circle cx={x - 12 * s} cy={y} r={60 * s} fill="#FF2A2A" opacity={ph ? 0.55 : 0.12} filter="url(#b24)" />
      <circle cx={x + 12 * s} cy={y} r={60 * s} fill="#2A5BFF" opacity={ph ? 0.12 : 0.55} filter="url(#b24)" />
      <rect x={x - 22 * s} y={y - 5 * s} width={44 * s} height={10 * s} rx={4} fill={ph ? '#FF6A6A' : '#6A8BFF'} />
    </g>
  );
};

/** particules de poussière dans un faisceau (rectangle x0..x1 × y0..y1) */
export const Dust: React.FC<{x0: number; y0: number; x1: number; y1: number; T: number; n?: number; o?: number; seed?: number}> = ({x0, y0, x1, y1, T, n = 40, o = 0.7, seed = 3}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const px = x0 + (x1 - x0) * ((rand(seed + i) + T * 0.02 * (rand(seed + i * 2) - 0.5)) % 1 + 1) % 1;
      const py = y0 + (y1 - y0) * ((rand(seed + i * 3) + T * 0.015 * rand(seed + i * 5)) % 1);
      return <circle key={i} cx={px} cy={py} r={1.5 + 2.5 * rand(seed + i * 7)} fill="#FFF6E0" opacity={o * (0.3 + 0.7 * Math.abs(Math.sin(T * 1.3 + i)))} />;
    })}
  </g>
);
