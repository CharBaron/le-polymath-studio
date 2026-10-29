// Éléments dessinés à la main : compteur, flèche, entourage, soulignement, graphique, page qui tourne.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {C, clamp01, easeInOut, easeOut, F, FPS, handPath, Highlight, lerp, overshoot, prog, rand} from '../theme';

type P2 = [number, number];
const t_ = (frame: number) => frame / FPS;

// ---------- compteur ----------
export const fmtFR = (n: number, dec = 0) =>
  n.toLocaleString('fr-FR', {minimumFractionDigits: dec, maximumFractionDigits: dec}).replace(/ | /g, ' ');

/** Compteur qui défile de `from` à `to` entre t0 et t1, puis se surligne. */
export const Counter: React.FC<{from?: number; to: number; t0: number; t1: number; size?: number; prefix?: string; suffix?: string; dec?: number; color?: string; hl?: boolean; style?: React.CSSProperties}> = ({
  from = 0, to, t0, t1, size = 150, prefix = '', suffix = '', dec = 0, color = C.ink, hl = true, style,
}) => {
  const frame = useCurrentFrame();
  const t = t_(frame);
  const k = prog(t, t0, t1, easeOut);
  // interpolation logarithmique pour les grands écarts (sinon tout se joue à la fin)
  const v = from > 0 && to / from > 100 ? Math.exp(lerp(Math.log(from), Math.log(to), Math.min(1, k))) : lerp(from, to, k);
  const shown = t >= t1 ? to : v;
  const land = prog(t, t1, t1 + 0.35, easeOut);
  return (
    <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', transform: `scale(${1 + 0.08 * Math.sin(land * Math.PI)})`, ...style}}>
      <Highlight k={hl ? land : 0}>
        {prefix}
        {fmtFR(shown, dec)}
        {suffix}
      </Highlight>
    </div>
  );
};

// ---------- traits ----------
const Drawn: React.FC<{d: string; k: number; color?: string; width?: number; fill?: string}> = ({d, k, color = C.ink, width = 7, fill}) => {
  if (k <= 0) return null;
  const e = evolvePath(clamp01(k), d);
  return <path d={d} stroke={color} strokeWidth={width} fill={fill ?? 'none'} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />;
};

/** Flèche courbe dessinée de a vers b (bend = courbure). */
export const Arrow: React.FC<{a: P2; b: P2; t0: number; dur?: number; bend?: number; color?: string; width?: number; id?: number}> = ({a, b, t0, dur = 0.5, bend = 0.25, color = C.pen, width = 8, id = 1}) => {
  const frame = useCurrentFrame();
  const k = prog(t_(frame), t0, t0 + dur, easeInOut);
  const mx = (a[0] + b[0]) / 2 - (b[1] - a[1]) * bend;
  const my = (a[1] + b[1]) / 2 + (b[0] - a[0]) * bend;
  const pts: P2[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8;
    pts.push([(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * mx + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * my + u * u * b[1]]);
  }
  const d = handPath(pts, frame, id, 1.2);
  const ang = Math.atan2(b[1] - pts[7][1], b[0] - pts[7][0]);
  const hk = prog(t_(frame), t0 + dur * 0.85, t0 + dur + 0.12, easeOut);
  const h = 34 * hk;
  const head = `M ${b[0] - Math.cos(ang - 0.5) * h} ${b[1] - Math.sin(ang - 0.5) * h} L ${b[0]} ${b[1]} L ${b[0] - Math.cos(ang + 0.5) * h} ${b[1] - Math.sin(ang + 0.5) * h}`;
  return (
    <g>
      <Drawn d={d} k={k} color={color} width={width} />
      {hk > 0 ? <path d={head} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};

/** Entourage au stylo (ellipse qui ne se referme pas tout à fait). */
export const Circle: React.FC<{cx: number; cy: number; rx: number; ry: number; t0: number; dur?: number; color?: string; id?: number}> = ({cx, cy, rx, ry, t0, dur = 0.45, color = C.red, id = 2}) => {
  const frame = useCurrentFrame();
  const k = prog(t_(frame), t0, t0 + dur, easeInOut);
  const pts: P2[] = [];
  for (let i = 0; i <= 20; i++) {
    const a = -2.2 + (i / 20) * Math.PI * 2.15;
    const r = 1 + (i / 20) * 0.07;
    pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
  }
  return <Drawn d={handPath(pts, frame, id, 1.5)} k={k} color={color} width={7} />;
};

/** Soulignement au marqueur. */
export const Underline: React.FC<{x: number; y: number; w: number; t0: number; dur?: number; color?: string; id?: number}> = ({x, y, w, t0, dur = 0.35, color = C.orange, id = 3}) => {
  const frame = useCurrentFrame();
  const k = prog(t_(frame), t0, t0 + dur, easeOut);
  const pts: P2[] = [[x, y + 3], [x + w * 0.35, y - 2], [x + w * 0.7, y + 2], [x + w, y - 3]];
  return <Drawn d={handPath(pts, frame, id, 1)} k={k} color={color} width={12} />;
};

/** Note manuscrite qui s'écrit (révélation gauche → droite). */
export const Note: React.FC<{x: number; y: number; t0: number; size?: number; color?: string; rotate?: number; children: React.ReactNode; dur?: number}> = ({x, y, t0, size = 52, color = C.pen, rotate = -3, children, dur = 0.6}) => {
  const frame = useCurrentFrame();
  const k = prog(t_(frame), t0, t0 + dur, easeOut);
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: F.hand, fontSize: size, color, transform: `rotate(${rotate}deg)`, clipPath: `inset(-20% ${100 - k * 100}% -20% -5%)`, whiteSpace: 'nowrap'}}>{children}</div>
  );
};

// ---------- graphique ----------
export type Series = {values: number[]; color?: string; label?: string};
/** Courbe dessinée à la main avec axes. Les points apparaissent au fil du tracé. */
export const HandChart: React.FC<{x: number; y: number; w: number; h: number; series: Series[]; t0: number; dur?: number; max?: number; xLabels?: string[]; yLabel?: string; log?: boolean}> = ({
  x, y, w, h, series, t0, dur = 1.6, max, xLabels, yLabel, log,
}) => {
  const frame = useCurrentFrame();
  const t = t_(frame);
  const axes = prog(t, t0 - 0.4, t0, easeOut);
  const all = series.flatMap((s) => s.values);
  const top = max ?? Math.max(...all) * 1.08;
  const f = (v: number) => (log ? Math.log10(Math.max(1, v)) / Math.log10(top) : v / top);
  return (
    <g>
      <Drawn d={handPath([[x, y], [x, y + h * 0.5], [x, y + h]], frame, 40, 1)} k={axes} width={6} />
      <Drawn d={handPath([[x, y + h], [x + w * 0.5, y + h], [x + w, y + h]], frame, 41, 1)} k={axes} width={6} />
      {series.map((s, si) => {
        const pts: P2[] = s.values.map((v, i) => [x + (i / (s.values.length - 1)) * w, y + h - f(v) * h]);
        const k = prog(t, t0 + si * 0.3, t0 + si * 0.3 + dur, easeInOut);
        return (
          <g key={si}>
            <Drawn d={handPath(pts, frame, 50 + si, 1.3)} k={k} color={s.color ?? C.pen} width={9} />
            {pts.map((p, i) => (k > 0 && i / (pts.length - 1) <= k + 0.001 ? <circle key={i} cx={p[0]} cy={p[1]} r={9} fill={s.color ?? C.pen} /> : null))}
          </g>
        );
      })}
      {xLabels?.map((l, i) => (
        <text key={i} x={x + (i / (xLabels.length - 1)) * w} y={y + h + 52} textAnchor="middle" fontFamily={F.hand} fontSize={38} fill={C.muted} opacity={axes}>{l}</text>
      ))}
      {yLabel ? <text x={x + 16} y={y - 18} fontFamily={F.hand} fontSize={38} fill={C.muted} opacity={axes}>{yLabel}</text> : null}
    </g>
  );
};

/** Barres hachurées au feutre. */
export const HandBars: React.FC<{x: number; y: number; w: number; h: number; values: number[]; labels?: string[]; colors?: string[]; t0: number; stagger?: number; max?: number}> = ({x, y, w, h, values, labels, colors, t0, stagger = 0.18, max}) => {
  const frame = useCurrentFrame();
  const t = t_(frame);
  const top = max ?? Math.max(...values);
  const bw = (w / values.length) * 0.62;
  return (
    <g>
      <Drawn d={handPath([[x - 10, y + h], [x + w / 2, y + h], [x + w + 10, y + h]], frame, 60, 1)} k={prog(t, t0 - 0.3, t0, easeOut)} width={6} />
      {values.map((v, i) => {
        const k = prog(t, t0 + i * stagger, t0 + i * stagger + 0.55, overshoot);
        const bh = (v / top) * h * k;
        const bx = x + (i + 0.19) * (w / values.length);
        const col = colors?.[i] ?? C.pen;
        const hatch = [];
        for (let j = 0; j < bh / 22; j++) hatch.push(<line key={j} x1={bx + 4} y1={y + h - j * 22 - 4} x2={bx + bw - 4} y2={y + h - j * 22 - 18} stroke={col} strokeWidth={5} opacity={0.55} />);
        return (
          <g key={i}>
            {hatch}
            <path d={handPath([[bx, y + h], [bx, y + h - bh], [bx + bw, y + h - bh], [bx + bw, y + h]], frame, 70 + i, 1.2)} stroke={col} strokeWidth={7} fill="none" strokeLinejoin="round" />
            {labels?.[i] ? <text x={bx + bw / 2} y={y + h + 50} textAnchor="middle" fontFamily={F.hand} fontSize={40} fill={C.ink}>{labels[i]}</text> : null}
          </g>
        );
      })}
    </g>
  );
};

// ---------- transition « page qui tourne » ----------
/** La scène `children` est une page qui se tourne entre t0 et t0+dur (charnière à gauche, spirale du carnet). */
export const PageTurn: React.FC<{t0: number; dur?: number; children: React.ReactNode}> = ({t0, dur = 0.7, children}) => {
  const frame = useCurrentFrame();
  const k = prog(t_(frame), t0, t0 + dur, easeInOut);
  if (k >= 1) return null;
  const ang = -k * 180;
  return (
    <AbsoluteFill style={{perspective: 2600, perspectiveOrigin: '0% 50%'}}>
      <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${ang}deg)`, backfaceVisibility: 'hidden', boxShadow: `${20 + k * 60}px 0 ${30 + k * 60}px rgba(40,30,10,${0.25 * Math.sin(k * Math.PI)})`, overflow: 'hidden'}}>
        {children}
        {/* ombre de courbure */}
        <AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${0.18 * k}) 0%, rgba(0,0,0,0) 35%, rgba(255,255,255,${0.25 * Math.sin(k * Math.PI)}) 80%, rgba(0,0,0,${0.12 * k}) 100%)`}} />
      </AbsoluteFill>
      {/* verso de la page */}
      <AbsoluteFill style={{transformOrigin: '0% 50%', transform: `rotateY(${ang + 180}deg)`, backfaceVisibility: 'hidden', background: C.paperShade}} />
    </AbsoluteFill>
  );
};

/** Spirale du carnet sur le bord gauche (décor persistant). */
export const Spiral: React.FC = () => (
  <svg width={70} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 24}, (_, i) => (
      <g key={i}>
        <circle cx={30} cy={60 + i * 78} r={9} fill={C.paperShade} stroke="rgba(20,19,26,0.35)" strokeWidth={2} />
        <path d={`M 4 ${54 + i * 78} Q 22 ${40 + i * 78} 32 ${60 + i * 78}`} stroke="#8A8A92" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    ))}
  </svg>
);

export const Sticker: React.FC<{k: number; rotate?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({k, rotate = -2, children, style}) => (
  <div style={{background: C.white, borderRadius: 14, padding: '18px 30px', boxShadow: '0 10px 0 rgba(20,19,26,0.12)', border: `5px solid ${C.ink}`, transform: `scale(${k}) rotate(${rotate + (1 - k) * 8}deg)`, opacity: clamp01(k * 3), ...style}}>
    {children}
  </div>
);

export const jitterSeed = rand;
