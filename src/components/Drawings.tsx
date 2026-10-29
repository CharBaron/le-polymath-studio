// Dessins et mises en page partagés entre les vidéos (style Carnet).
// Scène : Layer + vis (apparition/disparition), Svg (calque avec trait qui bout), Title, Src (ligne de sources).
// Objets : Bill, BillRain, Temple, Press, Cross, Car, House, Sun, Bar, Balance.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, clamp01, easeIn, easeInOut, easeOut, F, FPS, handPath, lerp, prog, rand} from '../theme';

export type B = Record<string, number>;
export const useT = () => useCurrentFrame() / FPS;

/** Opacité d'une scène : entrée 0.3 s, sortie 0.2 s (plus rapide). */
export const vis = (t: number, t0: number, t1: number) => prog(t, t0, t0 + 0.3, easeOut) * (1 - prog(t, t1 - 0.2, t1, easeIn));
export const Layer: React.FC<{o: number; children: React.ReactNode}> = ({o, children}) => (o <= 0 ? null : <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>);
export const Svg: React.FC<{children: React.ReactNode; boil?: boolean}> = ({children, boil = true}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', filter: boil ? 'url(#boil)' : undefined}}>{children}</svg>
);
export const Src: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: 110, width: 600, top: 1240, fontFamily: F.note, fontSize: 30, lineHeight: 1.15, color: C.muted}}>{children}</div>
);
export const Title: React.FC<{y: number; size?: number; children: React.ReactNode; k?: number; color?: string}> = ({y, size = 96, children, k = 1, color = C.ink}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: y, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: size, lineHeight: 1.05, color, textShadow: `0 0 12px ${C.paper}, 0 0 6px ${C.paper}, 0 0 3px ${C.paper}`, transform: `translateY(${(1 - k) * 40}px)`, opacity: clamp01(k * 1.5)}}>
    {children}
  </div>
);

// ---------- dessins ----------
export const rectPts = (w: number, h: number): [number, number][] => {
  const c: [number, number][] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
  const out: [number, number][] = [];
  for (let i = 0; i < 4; i++) {
    const a = c[i], b2 = c[(i + 1) % 4];
    for (let k = 0; k < 4; k++) out.push([a[0] + ((b2[0] - a[0]) * k) / 4, a[1] + ((b2[1] - a[1]) * k) / 4]);
  }
  out.push(c[0], [c[0][0] + w / 8, c[0][1]]);
  return out;
};

/** Billet dessiné à la main. */
export const Bill: React.FC<{x: number; y: number; w?: number; rot?: number; value?: string; id?: number; color?: string}> = ({x, y, w = 220, rot = 0, value = '€', id = 1, color = C.green}) => {
  const frame = useCurrentFrame();
  const h = w * 0.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={handPath(rectPts(w, h), frame, id, 1.2)} fill="#DDF1E3" stroke={color} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={8} fill="none" stroke={color} strokeWidth={2.5} opacity={0.6} />
      <circle cx={0} cy={0} r={h * 0.3} fill="none" stroke={color} strokeWidth={4} />
      <text x={0} y={h * 0.13} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={h * 0.36} fill={color}>{value}</text>
    </g>
  );
};

/** Pluie de billets déterministe. */
export const BillRain: React.FC<{t: number; t0: number; n?: number; dim?: number}> = ({t, t0, n = 14, dim = 0}) => (
  <g opacity={1 - dim * 0.75} style={{filter: dim > 0 ? `grayscale(${dim})` : undefined}}>
    {Array.from({length: n}, (_, i) => {
      const speed = 260 + rand(i * 3.1) * 180;
      const y = ((t - t0 + 1.2 + rand(i) * 6) * speed) % 2300 - 250;
      const x = 120 + rand(i * 7.7) * 860 + Math.sin(t * 1.3 + i) * 40;
      return <Bill key={i} x={x} y={y} w={150 + rand(i * 2.2) * 70} rot={Math.sin(t * 2 + i * 1.7) * 30} id={i + 10} />;
    })}
  </g>
);

/** Bâtiment à colonnes (BCE / banque). */
export const Temple: React.FC<{x: number; y: number; w: number; label: string; k: number; id?: number; labelSize?: number}> = ({x, y, w, label, k, id = 1, labelSize}) => {
  const frame = useCurrentFrame();
  const h = w * 0.8;
  const hp = (pts: [number, number][], n: number) => handPath(pts, frame, id * 20 + n, 1.3);
  return (
    <g opacity={clamp01(k * 2)} transform={`translate(${x} ${y}) scale(${0.9 + 0.1 * k}) translate(${-x} ${-y})`}>
      <path d={hp([[x - w / 2 - 20, y - h * 0.62], [x, y - h], [x + w / 2 + 20, y - h * 0.62], [x - w / 2 - 20, y - h * 0.62]], 0)} fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <text x={x} y={y - h * 0.7} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={labelSize ?? w * 0.13} fill={C.pen}>{label}</text>
      {[0, 1, 2, 3].map((i) => {
        const cx = x - w * 0.36 + i * w * 0.24;
        return <path key={i} d={hp([[cx - 18, y - h * 0.55], [cx - 18, y - 30], [cx + 18, y - 30], [cx + 18, y - h * 0.55]], 1 + i)} fill={C.white} stroke={C.ink} strokeWidth={6} />;
      })}
      <path d={hp([[x - w / 2 - 30, y - 28], [x + w / 2 + 30, y - 28], [x + w / 2 + 30, y], [x - w / 2 - 30, y], [x - w / 2 - 30, y - 28]], 8)} fill={C.paperShade} stroke={C.ink} strokeWidth={6} />
    </g>
  );
};

/** Planche à billets : une machine qui crache un billet. */
export const Press: React.FC<{x: number; y: number; t: number; t0: number; stop: number}> = ({x, y, t, t0, stop}) => {
  const frame = useCurrentFrame();
  const run = t < stop ? (t - t0) : stop - t0;
  const out = ((run * 1.3) % 1) * 200;
  return (
    <g>
      <Bill x={x + 170 + out * 0.5} y={y - 40 + out * 0.15} w={170} rot={8} id={90} />
      <path d={handPath([[x - 170, y - 160], [x + 150, y - 160], [x + 150, y + 60], [x - 170, y + 60], [x - 170, y - 160]], frame, 91, 1.3)} fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {[0, 1].map((i) => (
        <g key={i} transform={`rotate(${run * 300 * (i ? -1 : 1)} ${x - 60 + i * 120} ${y - 50})`}>
          <circle cx={x - 60 + i * 120} cy={y - 50} r={48} fill={C.paperShade} stroke={C.ink} strokeWidth={6} />
          <line x1={x - 60 + i * 120} y1={y - 95} x2={x - 60 + i * 120} y2={y - 5} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      <text x={x - 10} y={y + 130} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={50} fill={C.ink}>planche à billets</text>
    </g>
  );
};

/** Grande croix rouge tracée en deux coups. */
export const Cross: React.FC<{x: number; y: number; r: number; t: number; t0: number}> = ({x, y, r, t, t0}) => {
  const frame = useCurrentFrame();
  const k1 = prog(t, t0, t0 + 0.2, easeOut);
  const k2 = prog(t, t0 + 0.15, t0 + 0.35, easeOut);
  const l = (a: [number, number], b: [number, number], k: number, id: number) =>
    k > 0 ? <path d={handPath([a, [lerp(a[0], b[0], k / 2), lerp(a[1], b[1], k / 2)], [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]], frame, id, 1.5)} stroke={C.red} strokeWidth={22} strokeLinecap="round" fill="none" /> : null;
  return (
    <g>
      {l([x - r, y - r], [x + r, y + r], k1, 95)}
      {l([x + r, y - r], [x - r, y + r], k2, 96)}
    </g>
  );
};

export const Car: React.FC<{x: number; y: number; s?: number; id?: number}> = ({x, y, s = 1, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={handPath([[-90, 0], [-90, -40], [-50, -45], [-25, -85], [45, -85], [70, -45], [95, -40], [95, 0], [-90, 0]], frame, id, 1.2)} fill={C.orange} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -15 -78 L 40 -78 L 58 -48 L -30 -48 Z" fill={C.white} stroke={C.ink} strokeWidth={4} />
      {[-50, 55].map((wx) => <circle key={wx} cx={wx} cy={2} r={22} fill={C.ink} />)}
    </g>
  );
};
export const House: React.FC<{x: number; y: number; s?: number; id?: number}> = ({x, y, s = 1, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={handPath([[-70, 0], [-70, -80], [70, -80], [70, 0], [-70, 0]], frame, id, 1.2)} fill={C.white} stroke={C.ink} strokeWidth={6} />
      <path d={handPath([[-90, -75], [0, -150], [90, -75], [-90, -75]], frame, id + 1, 1.2)} fill={C.red} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <rect x={-18} y={-50} width={36} height={50} fill={C.pen} stroke={C.ink} strokeWidth={4} />
    </g>
  );
};
export const Sun: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 20})`}>
    <circle r={45} fill={C.hl} stroke={C.ink} strokeWidth={6} />
    {Array.from({length: 8}, (_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return <line key={i} x1={Math.cos(a) * 60} y1={Math.sin(a) * 60} x2={Math.cos(a) * 85} y2={Math.sin(a) * 85} stroke={C.ink} strokeWidth={7} strokeLinecap="round" />;
    })}
  </g>
);

/** Subdivise une ligne brisée pour que le lissage du trait garde des coins nets. */
export const edgePts = (pts: [number, number][], n = 4): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  out.push(pts[pts.length - 1]);
  return out;
};

/** Petit rectangle « barre » qui pousse. */
export const Bar: React.FC<{x: number; base: number; w: number; h: number; k: number; color: string; id: number}> = ({x, base, w, h, k, color, id}) => {
  const frame = useCurrentFrame();
  const bh = Math.max(4, h * k);
  if (k <= 0) return null;
  const hatch = [];
  for (let j = 0; j < bh / 24; j++) hatch.push(<line key={j} x1={x + 6} y1={base - j * 24 - 4} x2={x + w - 6} y2={base - j * 24 - 20} stroke={color} strokeWidth={5} opacity={0.5} />);
  return (
    <g>
      {hatch}
      <path d={handPath(edgePts([[x, base], [x, base - bh], [x + w, base - bh], [x + w, base]]), frame, id, 1.2)} stroke={color} strokeWidth={7} fill="none" strokeLinejoin="round" />
    </g>
  );
};

/** Balance : beaucoup d'argent d'un côté, peu de choses de l'autre. */
export const Balance: React.FC<{x: number; y: number; k: number; t: number}> = ({x, y, k, t}) => {
  const frame = useCurrentFrame();
  const ang = 14 * k + Math.sin(t * 3) * 1.2 * k; // le côté argent descend
  const a = (ang * Math.PI) / 180;
  const L = 300;
  const lp: [number, number] = [x - Math.cos(a) * L, y - Math.sin(a) * L * -1];
  const rp: [number, number] = [x + Math.cos(a) * L, y - Math.sin(a) * L];
  const pan = (p: [number, number], id: number, children: React.ReactNode) => (
    <g>
      <line x1={p[0]} y1={p[1]} x2={p[0] - 90} y2={p[1] + 150} stroke={C.ink} strokeWidth={4} />
      <line x1={p[0]} y1={p[1]} x2={p[0] + 90} y2={p[1] + 150} stroke={C.ink} strokeWidth={4} />
      {children}
      <path d={handPath([[p[0] - 120, p[1] + 150], [p[0], p[1] + 190], [p[0] + 120, p[1] + 150]], frame, id, 1.2)} fill={C.white} stroke={C.ink} strokeWidth={7} />
    </g>
  );
  return (
    <g>
      <path d={handPath([[x, y], [x, y + 330]], frame, 120, 1)} stroke={C.ink} strokeWidth={10} />
      <path d={handPath([[x - 110, y + 340], [x + 110, y + 340]], frame, 121, 1)} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      <path d={handPath([lp, [x, y], rp], frame, 122, 1)} stroke={C.ink} strokeWidth={10} strokeLinecap="round" fill="none" />
      <circle cx={x} cy={y} r={14} fill={C.ink} />
      {pan(lp, 123, Array.from({length: 7}, (_, i) => <Bill key={i} x={lp[0] - 55 + (i % 3) * 55} y={lp[1] + 135 - Math.floor(i / 3) * 34} w={110} rot={(i % 2 ? 8 : -6)} id={130 + i} />))}
      {pan(rp, 124, <Car x={rp[0]} y={rp[1] + 150} s={0.7} id={140} />)}
    </g>
  );
};


// ---------- ajouts vidéo 02 ----------
type P2 = [number, number];

/** Camembert dessiné : chaque part pousse avec son propre k (0→1). Départ à midi, sens horaire. */
export const Pie: React.FC<{cx: number; cy: number; r: number; parts: {v: number; color: string; k: number}[]; id?: number}> = ({cx, cy, r, parts, id = 1}) => {
  const frame = useCurrentFrame();
  const total = parts.reduce((a, p) => a + p.v, 0);
  let a0 = -Math.PI / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={C.white} opacity={0.6} />
      {parts.map((p, i) => {
        const span = (p.v / total) * Math.PI * 2;
        const start = a0;
        a0 += span;
        if (p.k <= 0) return null;
        const end = start + span * clamp01(p.k);
        const n = Math.max(2, Math.ceil(((end - start) / (Math.PI * 2)) * 40));
        const pts: P2[] = [[cx, cy]];
        for (let j = 0; j <= n; j++) {
          const a = start + ((end - start) * j) / n;
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        pts.push([cx, cy]);
        return <path key={i} d={handPath(pts, frame, id * 10 + i, 1.1)} fill={p.color} fillOpacity={0.45} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />;
      })}
      <path d={handPath(Array.from({length: 42}, (_, j) => [cx + Math.cos((j / 40) * Math.PI * 2) * r, cy + Math.sin((j / 40) * Math.PI * 2) * r] as P2), frame, id * 10 + 9, 1.1)} fill="none" stroke={C.ink} strokeWidth={6} />
    </g>
  );
};

/** Feuille de papier avec titre et lignes manuscrites (reconnaissance de dette, contrat…). k : écriture progressive. */
export const Doc: React.FC<{x: number; y: number; w: number; h: number; title: string; lines: string[]; k: number; rot?: number; id?: number; accent?: string; size?: number}> = ({x, y, w, h, title, lines, k, rot = -2, id = 1, accent = C.pen, size = 44}) => {
  const frame = useCurrentFrame();
  const shown = Math.floor(clamp01(k) * (lines.length + 1) + 0.0001);
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`} opacity={clamp01(k * 4)}>
      <rect x={x + 12} y={y + 14} width={w} height={h} fill="rgba(20,19,26,0.10)" />
      <path d={handPath(rectPts(w, h).map(([a, b]) => [a + x + w / 2, b + y + h / 2] as P2), frame, id, 1.1)} fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <text x={x + w / 2} y={y + size * 1.6} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={size * 1.05} fill={accent}>{title}</text>
      <line x1={x + 40} y1={y + size * 2.1} x2={x + w - 40} y2={y + size * 2.1} stroke={accent} strokeWidth={4} opacity={0.6} />
      {lines.map((l, i) => (i < shown ? <text key={i} x={x + 44} y={y + size * (3.3 + i * 1.35)} fontFamily={F.hand} fontSize={size} fill={C.ink}>{l}</text> : null))}
    </g>
  );
};

/** Chronomètre : l'aiguille fait un tour par seconde depuis t0. */
export const Stopwatch: React.FC<{x: number; y: number; r: number; t: number; t0: number; k?: number}> = ({x, y, r, t, t0, k = 1}) => {
  const frame = useCurrentFrame();
  const a = Math.max(0, t - t0) * Math.PI * 2 - Math.PI / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <rect x={x - 18} y={y - r - 40} width={36} height={30} rx={6} fill={C.ink} />
      <path d={handPath(Array.from({length: 34}, (_, j) => [x + Math.cos((j / 32) * Math.PI * 2) * r, y + Math.sin((j / 32) * Math.PI * 2) * r] as P2), frame, 300, 1.2)} fill={C.white} stroke={C.ink} strokeWidth={8} />
      {Array.from({length: 12}, (_, i) => {
        const b = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x + Math.cos(b) * r * 0.78} y1={y + Math.sin(b) * r * 0.78} x2={x + Math.cos(b) * r * 0.9} y2={y + Math.sin(b) * r * 0.9} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />;
      })}
      <line x1={x} y1={y} x2={x + Math.cos(a) * r * 0.75} y2={y + Math.sin(a) * r * 0.75} stroke={C.red} strokeWidth={8} strokeLinecap="round" />
      <circle cx={x} cy={y} r={10} fill={C.ink} />
    </g>
  );
};

/** Baguette de pain (grignes en diagonale). */
export const Baguette: React.FC<{x: number; y: number; len: number; rot?: number; id?: number}> = ({x, y, len, rot = -12, id = 1}) => {
  const frame = useCurrentFrame();
  const h = len * 0.16;
  const pts: P2[] = [];
  for (let j = 0; j <= 30; j++) {
    const a = (j / 30) * Math.PI * 2;
    const c = Math.cos(a);
    const sgn = Math.sign(c) || 1;
    pts.push([x + sgn * Math.pow(Math.abs(c), 0.35) * len / 2, y + Math.sin(a) * h / 2]);
  }
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <path d={handPath(pts, frame, id, 1.2)} fill="#E2B064" stroke={C.ink} strokeWidth={7} />
      {Array.from({length: 5}, (_, i) => {
        const cx = x - len * 0.32 + i * len * 0.16;
        return <path key={i} d={`M ${cx - h * 0.35} ${y + h * 0.18} Q ${cx} ${y - h * 0.05} ${cx + h * 0.35} ${y - h * 0.25}`} stroke="#9C6A22" strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};

const BITES: [number, number][] = [[0.5, -0.28], [0.52, 0.12], [0.47, 0.42], [0.36, -0.46], [0.4, -0.05], [0.33, 0.3]];
/** Billet grignoté : `bites` 0→1 fait disparaître des bouchées sur le bord droit. */
export const BittenBill: React.FC<{x: number; y: number; w: number; bites: number; value: string; id?: number}> = ({x, y, w, bites, value, id = 1}) => {
  const n = Math.floor(clamp01(bites) * 6 + 0.0001);
  const h = w * 0.5;
  const mid = `bite-${id}`;
  return (
    <g>
      <mask id={mid}>
        <rect x={x - w} y={y - h} width={w * 2} height={h * 2} fill="white" />
        {BITES.slice(0, n).map(([fx, fy], i) => (
          <g key={i}>
            <circle cx={x + fx * w} cy={y + fy * h} r={h * 0.17} fill="black" />
            {[-1, 0, 1].map((j) => (
              <circle key={j} cx={x + fx * w - h * 0.17 * 0.95} cy={y + fy * h + j * h * 0.09} r={h * 0.045} fill="black" />
            ))}
          </g>
        ))}
      </mask>
      <g mask={`url(#${mid})`}>
        <Bill x={x} y={y} w={w} value={value} id={id} />
      </g>
    </g>
  );
};

/** Page de calendrier à arracher. */
export const Calendar: React.FC<{x: number; y: number; w: number; day: string; k?: number; id?: number}> = ({x, y, w, day, k = 1, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 1.05;
  return (
    <g opacity={clamp01(k * 3)} transform={`rotate(${(1 - k) * 8 - 3} ${x} ${y})`}>
      <path d={handPath(rectPts(w, h).map(([a, b]) => [a + x, b + y] as P2), frame, id, 1.1)} fill={C.white} stroke={C.ink} strokeWidth={6} />
      <rect x={x - w / 2 + 4} y={y - h / 2 + 4} width={w - 8} height={h * 0.28} fill={C.red} opacity={0.85} />
      {[-0.3, 0, 0.3].map((u) => <circle key={u} cx={x + u * w} cy={y - h / 2} r={9} fill={C.ink} />)}
      <text x={x} y={y - h / 2 + h * 0.21} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={w * 0.17} fill={C.white}>{day}</text>
      <text x={x} y={y + h * 0.3} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={w * 0.42} fill={C.ink}>€</text>
    </g>
  );
};

export const lerpPt = (a: P2, b: P2, k: number): P2 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
export const wave = (t: number) => easeInOut(0.5 + 0.5 * Math.sin(t));

// ---------- ajouts vidéo 03 ----------
/** Épi de blé : tige + grains en chevrons. */
export const Wheat: React.FC<{x: number; y: number; h: number; rot?: number; id?: number}> = ({x, y, h, rot = 0, id = 1}) => {
  const frame = useCurrentFrame();
  const g = h * 0.075;
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <path d={handPath([[x, y], [x + 4, y - h * 0.5], [x, y - h]], frame, id, 1.2)} stroke="#B98A2E" strokeWidth={8} fill="none" strokeLinecap="round" />
      {Array.from({length: 7}, (_, i) => {
        const yy = y - h * 0.45 - i * g * 1.1;
        return (
          <g key={i}>
            <ellipse cx={x - g * 0.75} cy={yy} rx={g * 0.55} ry={g * 1.05} transform={`rotate(-30 ${x - g * 0.75} ${yy})`} fill="#E8C063" stroke={C.ink} strokeWidth={4} />
            <ellipse cx={x + g * 0.75} cy={yy} rx={g * 0.55} ry={g * 1.05} transform={`rotate(30 ${x + g * 0.75} ${yy})`} fill="#E8C063" stroke={C.ink} strokeWidth={4} />
          </g>
        );
      })}
      <ellipse cx={x} cy={y - h * 0.45 - 7 * g * 1.1} rx={g * 0.5} ry={g * 1.1} fill="#E8C063" stroke={C.ink} strokeWidth={4} />
    </g>
  );
};

/** Éclair (électricité / énergie). */
export const Bolt: React.FC<{x: number; y: number; s?: number; color?: string; id?: number}> = ({x, y, s = 1, color = C.hl, id = 1}) => {
  const frame = useCurrentFrame();
  const P: P2[] = [[10, -60], [-25, 5], [0, 5], [-12, 60], [28, -10], [2, -10], [10, -60]];
  return <path d={handPath(P.map(([a, b]) => [x + a * s, y + b * s] as P2), frame, id, 1)} fill={color} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />;
};

/** Four de boulanger (voûte + porte + flammes). */
export const Oven: React.FC<{x: number; y: number; w: number; t: number; id?: number}> = ({x, y, w, t, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 0.75;
  const arc: P2[] = Array.from({length: 13}, (_, i) => {
    const a = Math.PI + (i / 12) * Math.PI;
    return [x + Math.cos(a) * w / 2, y - h * 0.45 + Math.sin(a) * h * 0.55];
  });
  return (
    <g>
      <path d={handPath([[x - w / 2, y], ...arc, [x + w / 2, y], [x - w / 2, y]], frame, id, 1.2)} fill="#D9B48A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${x - w * 0.22} ${y} L ${x - w * 0.22} ${y - h * 0.35} Q ${x} ${y - h * 0.6} ${x + w * 0.22} ${y - h * 0.35} L ${x + w * 0.22} ${y} Z`} fill={C.ink} />
      {[-1, 0, 1].map((k) => (
        <path key={k} d={`M ${x + k * w * 0.1 - 12} ${y - 4} Q ${x + k * w * 0.1} ${y - 50 - 12 * Math.sin(t * 9 + k)} ${x + k * w * 0.1 + 12} ${y - 4} Z`} fill={k === 0 ? C.hl : C.orange} />
      ))}
    </g>
  );
};

// ---------- ajouts vidéo 06 (logement) ----------
/** Immeuble qui se dessine (draw 0→1) et dont la hauteur suit `h` (px). Base au sol en (x, y). */
export const Building: React.FC<{x: number; y: number; w: number; h: number; draw?: number; color?: string; id?: number; lit?: number}> = ({x, y, w, h, draw = 1, color = C.white, id = 1, lit = 1}) => {
  const frame = useCurrentFrame();
  const top = y - h;
  const outline = edgePts([[x - w / 2, y], [x - w / 2, top], [x + w / 2, top], [x + w / 2, y]], 6);
  const cols = Math.max(2, Math.round(w / 70));
  const rows = Math.max(1, Math.floor((h - 40) / 75));
  return (
    <g opacity={clamp01(draw * 3)}>
      <path d={handPath(outline, frame, id, 1.1)} fill={color} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" strokeDasharray={draw < 1 ? `${draw * 4 * (w + h)} 99999` : undefined} />
      {draw >= 1
        ? Array.from({length: rows * cols}, (_, i) => {
            const c = i % cols;
            const r = Math.floor(i / cols);
            const wx = x - w / 2 + (w / cols) * (c + 0.5) - 16;
            const wy = y - 60 - r * 75;
            return <rect key={i} x={wx} y={wy - 22} width={32} height={40} rx={4} fill={rand(i * 3.3 + id) < lit ? C.hl : C.paperShade} stroke={C.ink} strokeWidth={3} />;
          })
        : null}
      <line x1={x - w / 2 - 30} y1={y} x2={x + w / 2 + 30} y2={y} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** Grue de chantier ; `swing` fait balancer la charge. */
export const Crane: React.FC<{x: number; y: number; h: number; t: number; id?: number}> = ({x, y, h, t, id = 1}) => {
  const frame = useCurrentFrame();
  const top = y - h;
  const jib = h * 0.75;
  const hookX = x + jib * 0.7;
  const rope = h * 0.45 + Math.sin(t * 1.4) * 20;
  const sw = Math.sin(t * 1.8) * 8;
  return (
    <g>
      <path d={handPath([[x - 18, y], [x - 18, top], [x + 18, top], [x + 18, y]], frame, id, 1)} fill="none" stroke={C.orange} strokeWidth={8} />
      {Array.from({length: Math.floor(h / 60)}, (_, i) => (
        <line key={i} x1={x - 18} y1={y - i * 60} x2={x + 18} y2={y - i * 60 - 60} stroke={C.orange} strokeWidth={5} />
      ))}
      <path d={handPath([[x - jib * 0.3, top], [x + jib, top]], frame, id + 1, 1)} stroke={C.orange} strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${x} ${top - 60} L ${x - jib * 0.3} ${top} M ${x} ${top - 60} L ${x + jib} ${top}`} stroke={C.ink} strokeWidth={3} />
      <rect x={x - jib * 0.3 - 10} y={top} width={60} height={50} fill={C.ink} />
      <line x1={hookX} y1={top} x2={hookX + sw} y2={top + rope} stroke={C.ink} strokeWidth={3} />
      <rect x={hookX + sw - 45} y={top + rope} width={90} height={45} fill="#C9431A" stroke={C.ink} strokeWidth={5} rx={4} />
    </g>
  );
};

/** Façade : grille de fenêtres allumées ; `dark` 0→1 éteint une partie (vacants) ; `signs` pose des panneaux. */
export const Facade: React.FC<{x: number; y: number; cols: number; rows: number; dark: number; signs?: number; id?: number}> = ({x, y, cols, rows, dark, signs = 0, id = 1}) => {
  const frame = useCurrentFrame();
  const cw = 110;
  const ch = 120;
  const W = cols * cw + 40;
  const H = rows * ch + 40;
  const SIGNS = ['À LOUER', 'À VENDRE', 'TRAVAUX'];
  let darkIdx = 0;
  return (
    <g>
      <path d={handPath(edgePts([[x, y], [x, y - H], [x + W, y - H], [x + W, y]], 6), frame, id, 1.1)} fill={C.white} stroke={C.ink} strokeWidth={7} />
      {Array.from({length: cols * rows}, (_, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const wx = x + 20 + c * cw + 15;
        const wy = y - 20 - (r + 1) * ch + 15;
        const vac = rand(i * 7.7 + id) < 0.12; // ≈ 1 fenêtre sur 8 (≈ 7,6 % du parc, arrondi pour être visible)
        const off = vac && dark > 0;
        const myIdx = vac ? darkIdx++ : -1;
        const sign = off && signs > myIdx / 6;
        return (
          <g key={i}>
            <rect x={wx} y={wy} width={cw - 30} height={ch - 30} rx={6} fill={off ? C.ink : C.hl} opacity={off ? lerp(1, 0.85, dark) : 1} stroke={C.ink} strokeWidth={4} />
            {sign ? (
              <g transform={`rotate(${myIdx % 2 ? 6 : -6} ${wx + (cw - 30) / 2} ${wy + (ch - 30) / 2})`}>
                <rect x={wx - 14} y={wy + 26} width={cw + -2} height={36} fill={C.white} stroke={C.red} strokeWidth={4} rx={4} />
                <text x={wx + (cw - 30) / 2} y={wy + 52} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={20} fill={C.red}>{SIGNS[myIdx % 3]}</text>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};

/** Mètre ruban : graduations 0→max ans, ruban déroulé jusqu'à `v`. */
export const Tape: React.FC<{x: number; y: number; w: number; max: number; v: number; id?: number}> = ({x, y, w, max, v, id = 1}) => {
  const frame = useCurrentFrame();
  const px = (a: number) => x + (a / max) * w;
  return (
    <g>
      <rect x={x - 90} y={y - 70} width={110} height={140} rx={24} fill={C.orange} stroke={C.ink} strokeWidth={6} />
      <circle cx={x - 35} cy={y} r={30} fill={C.paperShade} stroke={C.ink} strokeWidth={5} />
      <path d={handPath([[x, y - 30], [px(v), y - 30], [px(v), y + 30], [x, y + 30]], frame, id, 0.8)} fill={C.hl} stroke={C.ink} strokeWidth={5} />
      {Array.from({length: Math.floor(v) + 1}, (_, i) => (
        <g key={i}>
          <line x1={px(i)} y1={y - 30} x2={px(i)} y2={y - (i % 5 === 0 ? 0 : 14)} stroke={C.ink} strokeWidth={3} />
          {i % 5 === 0 && i > 0 ? <text x={px(i)} y={y + 22} textAnchor="middle" fontFamily={F.hand} fontSize={26} fill={C.ink}>{i}</text> : null}
        </g>
      ))}
      <rect x={px(v) - 6} y={y - 44} width={14} height={88} fill={C.ink} rx={3} />
    </g>
  );
};

/** Panneau de carrefour à deux flèches. */
export const Signpost: React.FC<{x: number; y: number; left: string; right: string; k?: number; id?: number}> = ({x, y, left, right, k = 1, id = 1}) => {
  const frame = useCurrentFrame();
  const a = (dir: 1 | -1, yy: number, label: string, kk: number, col: string) => {
    if (kk <= 0) return null;
    const L = 300 * kk;
    const x0 = x;
    const x1 = x + dir * L;
    return (
      <g>
        <path d={handPath([[x0, yy - 40], [x1, yy - 40], [x1 + dir * 50, yy], [x1, yy + 40], [x0, yy + 40]], frame, id + (dir > 0 ? 1 : 2), 1)} fill={C.white} stroke={col} strokeWidth={7} strokeLinejoin="round" />
        {kk > 0.8 ? <text x={x + dir * 150} y={yy + 18} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={52} fill={col}>{label}</text> : null}
      </g>
    );
  };
  return (
    <g>
      <path d={handPath([[x, y], [x, y - 520]], frame, id, 1)} stroke="#8A6A3A" strokeWidth={22} strokeLinecap="round" />
      {a(-1, y - 430, left, clamp01(k * 2), C.green)}
      {a(1, y - 300, right, clamp01(k * 2 - 1), C.pen)}
    </g>
  );
};

// ---------- ajouts vidéo 07 (acheter ou louer) ----------
/** Fenêtre ouverte (volets à 0) ou fermée (volets à 1). */
export const Window: React.FC<{x: number; y: number; w: number; shut: number; id?: number}> = ({x, y, w, shut, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 1.25;
  const s = clamp01(shut);
  return (
    <g>
      <path d={handPath(edgePts([[x - w / 2, y + h / 2], [x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], 4), frame, id, 1)} fill="#CFE3F5" stroke={C.ink} strokeWidth={8} />
      <line x1={x} y1={y - h / 2} x2={x} y2={y + h / 2} stroke={C.ink} strokeWidth={5} opacity={0.4} />
      {[-1, 1].map((sg) => {
        // volet : pivote depuis le bord extérieur ; ouvert = plaqué contre le mur
        const ang = (1 - s) * 160 * sg;
        const hx = x + sg * (w / 2);
        return (
          <g key={sg} transform={`rotate(${ang} ${hx} ${y})`}>
            <rect x={sg > 0 ? hx - w / 2 : hx} y={y - h / 2} width={w / 2} height={h} fill={C.green} stroke={C.ink} strokeWidth={6} />
            {[0.25, 0.5, 0.75].map((u) => <line key={u} x1={sg > 0 ? hx - w / 2 + 10 : hx + 10} y1={y - h / 2 + h * u} x2={sg > 0 ? hx - 10 : hx + w / 2 - 10} y2={y - h / 2 + h * u} stroke={C.ink} strokeWidth={3} opacity={0.5} />)}
          </g>
        );
      })}
      <rect x={x - w / 2 - 20} y={y + h / 2} width={w + 40} height={22} fill={C.paperShade} stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

/** Étiquette de prix ; `cut` 0→1 détache la part de droite (frac du prix). */
export const PriceTag: React.FC<{x: number; y: number; w: number; frac: number; cut: number; id?: number}> = ({x, y, w, frac, cut, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 0.42;
  const xs = x + w * (1 - frac);
  const off = cut * 140;
  return (
    <g>
      <path d={handPath(edgePts([[x, y - h / 2], [xs, y - h / 2], [xs, y + h / 2], [x, y + h / 2], [x - h * 0.35, y], [x, y - h / 2]], 4), frame, id, 1)} fill={C.white} stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={x + 30} cy={y} r={14} fill={C.paper} stroke={C.ink} strokeWidth={4} />
      <text x={x + w * 0.42} y={y + h * 0.16} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={h * 0.45} fill={C.ink}>PRIX</text>
      <g transform={`translate(${off} ${cut * 40}) rotate(${cut * 14} ${xs} ${y})`}>
        <rect x={xs} y={y - h / 2} width={w * frac} height={h} fill={C.hl} stroke={C.ink} strokeWidth={7} />
      </g>
      {cut < 0.98 ? <line x1={xs} y1={y - h / 2 - 20} x2={xs} y2={y + h / 2 + 20} stroke={C.red} strokeWidth={5} strokeDasharray="14 10" /> : null}
    </g>
  );
};

/** Ciseaux ouverts/fermés (k 0→1→0 pour un coup). */
export const Scissors: React.FC<{x: number; y: number; s?: number; open: number; rot?: number}> = ({x, y, s = 1, open, rot = 90}) => {
  const a = 8 + open * 22;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[-1, 1].map((sg) => (
        <g key={sg} transform={`rotate(${sg * a})`}>
          <path d="M 0 0 L 150 -10 L 150 10 Z" fill={C.paperShade} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <ellipse cx={-55} cy={0} rx={38} ry={24} fill="none" stroke={C.red} strokeWidth={12} />
        </g>
      ))}
      <circle r={8} fill={C.ink} />
    </g>
  );
};

/** Couloir de piste : ligne, graduations en années, drapeau d'arrivée. */
export const Track: React.FC<{x0: number; y: number; pxPerYear: number; years: number; flag: number; flagLabel?: string; k?: number; id?: number; color?: string; size?: number; labelLeft?: boolean}> = ({x0, y, pxPerYear, years, flag, flagLabel, k = 1, id = 1, color = C.orange, size = 44, labelLeft}) => {
  const frame = useCurrentFrame();
  const x1 = x0 + years * pxPerYear * clamp01(k);
  const fx = x0 + flag * pxPerYear;
  return (
    <g opacity={clamp01(k * 3)}>
      <path d={handPath([[x0, y], [(x0 + x1) / 2, y], [x1, y]], frame, id, 1)} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      {Array.from({length: years + 1}, (_, i) => (x0 + i * pxPerYear <= x1 ? (
        <g key={i}>
          <line x1={x0 + i * pxPerYear} y1={y} x2={x0 + i * pxPerYear} y2={y + (i % 5 === 0 ? 28 : 14)} stroke={C.ink} strokeWidth={4} />
          {i % 5 === 0 ? <text x={x0 + i * pxPerYear} y={y + 28 + size} textAnchor="middle" fontFamily={F.hand} fontSize={size} fill={C.muted}>{i} ans</text> : null}
        </g>
      ) : null))}
      {fx <= x1 + 1 ? (
        <g>
          <line x1={fx} y1={y} x2={fx} y2={y - 240} stroke={C.ink} strokeWidth={7} />
          <path d={`M ${fx} ${y - 240} L ${fx + 120} ${y - 205} L ${fx} ${y - 170} Z`} fill={color} stroke={C.ink} strokeWidth={5} />
          {flagLabel ? <text x={labelLeft ? fx - 20 : fx + 20} y={y - 262} textAnchor={labelLeft ? 'end' : 'start'} fontFamily={F.hand} fontWeight={700} fontSize={size * 1.4} fill={color}>{flagLabel}</text> : null}
        </g>
      ) : null}
    </g>
  );
};

/** Levier : planche sur un pivot ; `tilt` en degrés (+ = côté droit en haut). */
export const Lever: React.FC<{x: number; y: number; len: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode; id?: number}> = ({x, y, len, tilt, left, right, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <path d={handPath([[x - 70, y + 120], [x, y], [x + 70, y + 120], [x - 70, y + 120]], frame, id, 1)} fill="#8A6A3A" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`rotate(${-tilt} ${x} ${y})`}>
        <rect x={x - len / 2} y={y - 22} width={len} height={26} rx={6} fill="#C9A06A" stroke={C.ink} strokeWidth={6} />
        <g transform={`translate(${x - len / 2 + 70} ${y - 22}) rotate(${tilt})`}>{left}</g>
        <g transform={`translate(${x + len / 2 - 120} ${y - 22}) rotate(${tilt})`}>{right}</g>
      </g>
    </g>
  );
};

/** Plante qui pousse (k 0→1). */
export const Plant: React.FC<{x: number; y: number; h: number; k: number; id?: number}> = ({x, y, h, k, id = 1}) => {
  const frame = useCurrentFrame();
  const hh = h * clamp01(k);
  return (
    <g>
      <path d={handPath([[x - 60, y], [x - 45, y + 80], [x + 45, y + 80], [x + 60, y]], frame, id, 1)} fill="#C9431A" stroke={C.ink} strokeWidth={6} />
      <path d={handPath([[x, y], [x + 8, y - hh * 0.5], [x, y - hh]], frame, id + 1, 1)} stroke={C.green} strokeWidth={10} fill="none" strokeLinecap="round" />
      {[0.35, 0.6, 0.85].map((u, i) => (u <= clamp01(k) + 0.01 ? (
        <ellipse key={i} cx={x + (i % 2 ? 40 : -40)} cy={y - hh * u} rx={44} ry={20} transform={`rotate(${i % 2 ? -25 : 25} ${x + (i % 2 ? 40 : -40)} ${y - hh * u})`} fill={C.green} stroke={C.ink} strokeWidth={4} />
      ) : null))}
      {k > 0.95 ? <circle cx={x} cy={y - hh - 26} r={26} fill={C.hl} stroke={C.ink} strokeWidth={4} /> : null}
    </g>
  );
};

/** Sablier ; `k` 0→1 = sable écoulé. */
export const Hourglass: React.FC<{x: number; y: number; h: number; k: number; t: number; id?: number}> = ({x, y, h, k, t, id = 1}) => {
  const frame = useCurrentFrame();
  const w = h * 0.55;
  const top = y - h / 2;
  const bot = y + h / 2;
  const kk = clamp01(k);
  const sandTop = (1 - kk) * (h / 2 - 30);
  const sandBot = kk * (h / 2 - 30);
  return (
    <g>
      <path d={handPath([[x - w / 2, top], [x + w / 2, top], [x + 12, y], [x + w / 2, bot], [x - w / 2, bot], [x - 12, y], [x - w / 2, top]], frame, id, 1)} fill="#EAF3FB" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${x - (w / 2) * (sandTop / (h / 2))} ${y - sandTop} L ${x + (w / 2) * (sandTop / (h / 2))} ${y - sandTop} L ${x} ${y - 4} Z`} fill={C.hl} />
      <path d={`M ${x - w / 2 + 14} ${bot - 6} L ${x + w / 2 - 14} ${bot - 6} L ${x} ${bot - 6 - sandBot} Z`} fill={C.hl} />
      {kk < 1 ? <line x1={x} y1={y} x2={x} y2={bot - 8 - sandBot * 0.5} stroke="#D9B22E" strokeWidth={4} strokeDasharray={`6 ${4 + Math.sin(t * 20) * 2}`} /> : null}
      <rect x={x - w / 2 - 20} y={top - 26} width={w + 40} height={26} rx={6} fill="#8A6A3A" stroke={C.ink} strokeWidth={5} />
      <rect x={x - w / 2 - 20} y={bot} width={w + 40} height={26} rx={6} fill="#8A6A3A" stroke={C.ink} strokeWidth={5} />
    </g>
  );
};

/** Livret d'épargne (couverture + titre). */
export const Passbook: React.FC<{x: number; y: number; w: number; title: string; open?: number; id?: number}> = ({x, y, w, title, open = 0, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 1.35;
  return (
    <g>
      <rect x={x - w / 2 + 14} y={y - h / 2 + 14} width={w} height={h} rx={14} fill="rgba(20,19,26,0.12)" />
      <path d={handPath(edgePts([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2], [x - w / 2, y - h / 2]], 4), frame, id, 1)} fill={C.pen} stroke={C.ink} strokeWidth={7} />
      <rect x={x - w / 2 + 30} y={y - h * 0.3} width={w - 60} height={h * 0.22} rx={8} fill={C.white} />
      <text x={x} y={y - h * 0.15} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={w * 0.17} fill={C.pen}>{title}</text>
      <g transform={`translate(${x - w / 2} ${y}) scale(${1 - open} 1) translate(${-(x - w / 2)} ${-y})`} opacity={open > 0.9 ? 0 : 0.35}>
        <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill={C.ink} />
      </g>
    </g>
  );
};

// ---------- ajouts vidéo 08 (Livret A) ----------
/** Thermomètre : `level` 0→1 de remplissage. */
export const Thermo: React.FC<{x: number; y: number; h: number; level: number; color: string; id?: number}> = ({x, y, h, level, color, id = 1}) => {
  const frame = useCurrentFrame();
  const w = 70;
  const top = y - h;
  const fillH = (h - 40) * clamp01(level);
  return (
    <g>
      <path d={handPath(edgePts([[x - w / 2, y], [x - w / 2, top + w / 2], [x + w / 2, top + w / 2], [x + w / 2, y]], 5), frame, id, 1)} fill={C.white} stroke={C.ink} strokeWidth={7} />
      <rect x={x - w / 2 + 14} y={y - fillH} width={w - 28} height={fillH} fill={color} />
      <circle cx={x} cy={y + 40} r={60} fill={color} stroke={C.ink} strokeWidth={7} />
      {Array.from({length: 8}, (_, i) => <line key={i} x1={x + w / 2} y1={y - 40 - i * ((h - 80) / 7)} x2={x + w / 2 + 26} y2={y - 40 - i * ((h - 80) / 7)} stroke={C.ink} strokeWidth={4} />)}
    </g>
  );
};

/** Panier de courses avec n baguettes ; `s` échelle. */
export const Basket: React.FC<{x: number; y: number; s?: number; items: number; id?: number}> = ({x, y, s = 1, items, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
      {Array.from({length: Math.max(0, Math.round(items))}, (_, i) => (
        <g key={i} transform={`rotate(${-50 + i * 14} ${x - 90 + i * 36} ${y - 90})`}>
          <rect x={x - 110 + i * 36} y={y - 260} width={36} height={220} rx={18} fill="#E2B064" stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      <path d={handPath([[x - 180, y - 100], [x + 180, y - 100], [x + 140, y + 80], [x - 140, y + 80], [x - 180, y - 100]], frame, id, 1)} fill="#C9A06A" stroke={C.ink} strokeWidth={7} strokeLinejoin="round" />
      {[-1, 0, 1].map((k) => <line key={k} x1={x + k * 90} y1={y - 100} x2={x + k * 70} y2={y + 80} stroke={C.ink} strokeWidth={4} opacity={0.5} />)}
      <path d={`M ${x - 140} ${y - 100} Q ${x} ${y - 300} ${x + 140} ${y - 100}`} fill="none" stroke={C.ink} strokeWidth={8} />
    </g>
  );
};

/** Machine à formule : deux entonnoirs, une boîte, un ticket qui sort (`out` 0→1). */
export const Machine: React.FC<{x: number; y: number; w: number; left: string; right: string; ticket: string; out: number; t: number; id?: number}> = ({x, y, w, left, right, ticket, out, t, id = 1}) => {
  const frame = useCurrentFrame();
  const h = w * 0.6;
  const shake = out > 0 && out < 1 ? Math.sin(t * 60) * 3 : 0;
  return (
    <g transform={`translate(${shake} 0)`}>
      {[[-1, left], [1, right]].map(([sg, lab]) => {
        const fx = x + (sg as number) * w * 0.28;
        return (
          <g key={String(sg)}>
            <path d={`M ${fx - 90} ${y - h / 2 - 170} L ${fx + 90} ${y - h / 2 - 170} L ${fx + 22} ${y - h / 2 - 40} L ${fx + 22} ${y - h / 2} L ${fx - 22} ${y - h / 2} L ${fx - 22} ${y - h / 2 - 40} Z`} fill={C.white} stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
            <text x={fx} y={y - h / 2 - 190} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={40} fill={C.pen}>{lab}</text>
          </g>
        );
      })}
      <path d={handPath(edgePts([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2], [x - w / 2, y - h / 2]], 4), frame, id, 1)} fill={C.paperShade} stroke={C.ink} strokeWidth={8} />
      {[0, 1, 2].map((i) => <circle key={i} cx={x - w * 0.25 + i * w * 0.25} cy={y - 10} r={22} fill={i === 1 ? C.red : C.hl} stroke={C.ink} strokeWidth={5} opacity={0.6 + 0.4 * Math.abs(Math.sin(t * 4 + i))} />)}
      <rect x={x + w / 2 - 20} y={y + h / 2 - 80} width={30} height={60} fill={C.ink} />
      {out > 0 ? (
        <g transform={`translate(${x + w / 2 - 230} ${y + h / 2 - 40 + out * 170})`}>
          <rect x={-10} y={-50} width={230} height={100} rx={8} fill={C.white} stroke={C.ink} strokeWidth={5} />
          <text x={105} y={18} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={56} fill={C.ink}>{ticket}</text>
        </g>
      ) : null}
    </g>
  );
};

/** Pièce de 1 €. */
export const Coin: React.FC<{x: number; y: number; r: number; rot?: number}> = ({x, y, r, rot = 0}) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <circle cx={x} cy={y} r={r} fill="#E8C063" stroke={C.ink} strokeWidth={Math.max(3, r * 0.12)} />
    <circle cx={x} cy={y} r={r * 0.72} fill="#D6A93F" stroke="#B98A2E" strokeWidth={r * 0.06} />
    <text x={x} y={y + r * 0.32} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={r * 0.95} fill="#7A5A12">1€</text>
  </g>
);

/** Tuyau le long d'une polyligne (épais, contour encre). */
export const Pipe: React.FC<{pts: [number, number][]; w?: number; k?: number}> = ({pts, w = 70, k = 1}) => {
  const d = `M ${pts.map((p) => p.join(' ')).join(' L ')}`;
  return (
    <g opacity={clamp01(k * 3)}>
      <path d={d} stroke={C.ink} strokeWidth={w + 14} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke="#CFE3F5" strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke="rgba(255,255,255,0.7)" strokeWidth={w * 0.18} fill="none" strokeLinejoin="round" transform={`translate(0 ${-w * 0.22})`} />
    </g>
  );
};
/** Point le long d'une polyligne (u 0→1). */
export const along = (pts: [number, number][], u: number): [number, number] => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const tot = seg.reduce((a, b) => a + b, 0);
  let d = clamp01(u) * tot;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const k = seg[i] ? d / seg[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)];
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

/** Calendrier d'un mois : deux quinzaines teintées (k), marqueurs de jours. */
export const MonthCal: React.FC<{x: number; y: number; cell: number; k: number; marks?: {day: number; color: string; label: string; k: number}[]; id?: number}> = ({x, y, cell, k, marks = [], id = 1}) => {
  const frame = useCurrentFrame();
  const pos = (d: number): [number, number] => [x + ((d - 1) % 7) * cell, y + Math.floor((d - 1) / 7) * cell];
  return (
    <g>
      <path d={handPath(edgePts([[x - 16, y - 16], [x + 7 * cell + 16, y - 16], [x + 7 * cell + 16, y + 5 * cell + 16], [x - 16, y + 5 * cell + 16], [x - 16, y - 16]], 4), frame, id, 1)} fill={C.white} stroke={C.ink} strokeWidth={7} />
      {Array.from({length: 31}, (_, i) => {
        const d = i + 1;
        const [cx, cy] = pos(d);
        const tint = d <= 15 ? 'rgba(31,63,191,0.18)' : 'rgba(14,159,135,0.2)';
        return (
          <g key={d}>
            <rect x={cx + 4} y={cy + 4} width={cell - 8} height={cell - 8} rx={8} fill={k > (d <= 15 ? 0 : 0.5) ? tint : 'none'} stroke="rgba(20,19,26,0.25)" strokeWidth={2} />
            <text x={cx + cell / 2} y={cy + cell * 0.62} textAnchor="middle" fontFamily={F.hand} fontSize={cell * 0.4} fill={C.ink}>{d}</text>
          </g>
        );
      })}
      {marks.map((m, i) => {
        if (m.k <= 0) return null;
        const [cx, cy] = pos(m.day);
        return (
          <g key={i} opacity={clamp01(m.k * 2)}>
            <circle cx={cx + cell / 2} cy={cy + cell / 2} r={cell * 0.48 * (0.6 + 0.4 * clamp01(m.k))} fill="none" stroke={m.color} strokeWidth={7} />
            <text x={cx + cell / 2} y={cy - 14} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={cell * 0.38} fill={m.color}>{m.label}</text>
          </g>
        );
      })}
    </g>
  );
};

/** Boule de neige qui roule (rot en degrés). */
export const Snowball: React.FC<{x: number; y: number; r: number; rot: number; id?: number}> = ({x, y, r, rot, id = 1}) => {
  const frame = useCurrentFrame();
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <path d={handPath(Array.from({length: 26}, (_, i) => [x + Math.cos((i / 24) * Math.PI * 2) * r, y + Math.sin((i / 24) * Math.PI * 2) * r] as [number, number]), frame, id, 1.5)} fill={C.white} stroke={C.ink} strokeWidth={7} />
      {[0.3, 1.4, 2.6, 3.9, 5.1].map((a, i) => <circle key={i} cx={x + Math.cos(a) * r * 0.55} cy={y + Math.sin(a) * r * 0.55} r={r * 0.08} fill="#CFE3F5" />)}
    </g>
  );
};

// ---------- ajouts vidéo 09 (intérêts composés) ----------
/** Parchemin qui se déroule (k 0→1) avec des lignes de texte. */
export const Parchment: React.FC<{x: number; y: number; w: number; h: number; k: number; title: string; lines: string[]; id?: number}> = ({x, y, w, h, k, title, lines, id = 1}) => {
  const frame = useCurrentFrame();
  const hh = h * clamp01(k);
  return (
    <g>
      <path d={handPath(edgePts([[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + hh], [x - w / 2, y + hh], [x - w / 2, y]], 4), frame, id, 1)} fill="#F3E2B8" stroke="#8A6A3A" strokeWidth={6} />
      <rect x={x - w / 2 - 20} y={y - 24} width={w + 40} height={40} rx={20} fill="#E0C88F" stroke="#8A6A3A" strokeWidth={6} />
      <rect x={x - w / 2 - 20} y={y + hh - 16} width={w + 40} height={40} rx={20} fill="#E0C88F" stroke="#8A6A3A" strokeWidth={6} />
      {k > 0.3 ? <text x={x} y={y + 80} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={54} fill="#5A3E16">{title}</text> : null}
      {lines.map((l, i) => (y + 150 + i * 60 < y + hh - 20 ? <text key={i} x={x - w / 2 + 40} y={y + 150 + i * 60} fontFamily={F.hand} fontSize={42} fill="#5A3E16">{l}</text> : null))}
    </g>
  );
};

/** Cadenas (closed 0→1 : l'anse descend). */
export const Padlock: React.FC<{x: number; y: number; s?: number; closed: number; label?: string}> = ({x, y, s = 1, closed, label}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M -45 ${-20 - (1 - closed) * 40} L -45 -70 A 45 45 0 0 1 45 -70 L 45 ${-20 - (1 - closed) * 0}`} fill="none" stroke={C.ink} strokeWidth={16} strokeLinecap="round" transform={`translate(0 ${(1 - closed) * -30})`} />
    <rect x={-75} y={-30} width={150} height={120} rx={18} fill={C.hl} stroke={C.ink} strokeWidth={7} />
    <circle cx={0} cy={20} r={14} fill={C.ink} />
    {label ? <text x={0} y={78} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={34} fill={C.ink}>{label}</text> : null}
  </g>
);

/** Sapin enneigé. */
export const Pine: React.FC<{x: number; y: number; h: number; id?: number}> = ({x, y, h, id = 1}) => {
  const frame = useCurrentFrame();
  const w = h * 0.55;
  return (
    <g>
      <rect x={x - h * 0.05} y={y - h * 0.18} width={h * 0.1} height={h * 0.18} fill="#8A6A3A" />
      {[0, 1, 2].map((i) => {
        const top = y - h + i * h * 0.25;
        const ww = w * (0.55 + i * 0.25);
        return <path key={i} d={handPath([[x, top], [x + ww / 2, top + h * 0.42], [x - ww / 2, top + h * 0.42], [x, top]], frame, id * 3 + i, 1)} fill={C.green} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />;
      })}
      <path d={`M ${x - w * 0.18} ${y - h + h * 0.22} Q ${x} ${y - h + h * 0.12} ${x + w * 0.18} ${y - h + h * 0.22}`} stroke={C.white} strokeWidth={10} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Panneau de piste sur un poteau. */
export const Panel: React.FC<{x: number; y: number; text: string; k?: number; color?: string; w?: number; size?: number}> = ({x, y, text, k = 1, color = C.pen, w = 300, size = 46}) =>
  k > 0.01 ? (
    <g opacity={clamp01(k * 2)} transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * clamp01(k)}) translate(${-x} ${-y})`}>
      <line x1={x} y1={y} x2={x} y2={y - 230} stroke="#8A6A3A" strokeWidth={12} strokeLinecap="round" />
      <rect x={x - w / 2} y={y - 330} width={w} height={110} rx={12} fill={C.white} stroke={color} strokeWidth={7} />
      <text x={x} y={y - 260} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={size} fill={color}>{text}</text>
    </g>
  ) : null;
