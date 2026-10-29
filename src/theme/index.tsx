// DA « Carnet » : papier quadrillé, encre stylo, surligneur jaune, trait qui tremble.
import React from 'react';
import {AbsoluteFill, Easing, spring, SpringConfig, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadKalam} from '@remotion/google-fonts/Kalam';
import {loadFont as loadPatrick} from '@remotion/google-fonts/PatrickHand';

const kalam = loadKalam('normal', {weights: ['400', '700'], subsets: ['latin', 'latin-ext']});
const patrick = loadPatrick('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const C = {
  paper: '#F4EFE3',
  paperShade: '#E9E2D2',
  grid: 'rgba(45,91,255,0.13)',
  margin: 'rgba(255,90,31,0.35)',
  ink: '#14131A', // encre noire
  pen: '#1F3FBF', // stylo bleu
  penLight: 'rgba(31,63,191,0.55)',
  hl: '#FFE14D', // surligneur
  hlSoft: 'rgba(255,225,77,0.75)',
  orange: '#FF5A1F', // couleur de marque (mascotte)
  green: '#0E9F87',
  red: '#E0352B',
  white: '#FFFDF8',
  muted: 'rgba(20,19,26,0.55)',
};

export const F = {
  hand: `${kalam.fontFamily}, "Comic Sans MS", cursive`, // titres, chiffres, sous-titres
  note: `${patrick.fontFamily}, ${kalam.fontFamily}, cursive`, // notes, sources
};

// ---------- temps ----------
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.35);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const overshoot = Easing.bezier(0.55, 0, 0.2, 1.12);
/** anticipation (petit recul) + dépassement : pour les changements de pose. */
export const antic = Easing.bezier(0.5, -0.35, 0.25, 1.35);
export const prog = (t: number, t0: number, t1: number, ease: (x: number) => number = easeInOut) =>
  ease(clamp01((t - t0) / Math.max(1e-6, t1 - t0)));
export const sp = (frame: number, startSec: number, config: Partial<SpringConfig> = {}, fps = FPS) => {
  const fr = frame - startSec * fps;
  if (fr <= 0) return 0;
  return spring({frame: fr, fps, config: {damping: 14, mass: 0.8, stiffness: 140, ...config}});
};
export const POP: Partial<SpringConfig> = {damping: 10, stiffness: 220, mass: 0.7};
/** pseudo-aléatoire déterministe [0,1) */
export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** graine qui change toutes les `every` images : le trait « bout » à 10 i/s. */
export const boilSeed = (frame: number, every = 3) => Math.floor(frame / every);

// ---------- papier ----------
export const Paper: React.FC<{step?: number; marginX?: number}> = ({step = 54, marginX = 96}) => {
  const {width, height} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <svg width={width} height={height} style={{position: 'absolute'}}>
        <defs>
          <pattern id="grid" width={step} height={step} patternUnits="userSpaceOnUse">
            <path d={`M ${step} 0 L 0 0 0 ${step}`} fill="none" stroke={C.grid} strokeWidth={2} />
          </pattern>
          <radialGradient id="vign" cx="50%" cy="45%" r="75%">
            <stop offset="60%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(80,60,20,0.16)" />
          </radialGradient>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        <line x1={marginX} y1={0} x2={marginX} y2={height} stroke={C.margin} strokeWidth={3} />
        <rect width={width} height={height} fill="url(#vign)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- trait qui bout ----------
/** Filtre SVG partagé : à poser une fois par composition, puis style={{filter:'url(#boil)'}}. */
export const BoilFilter: React.FC<{amount?: number; every?: number}> = ({amount = 3, every = 3}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={1} seed={boilSeed(frame, every) % 41} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={amount} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
};

/** Décale légèrement un point (tremblement de trait, à 10 i/s). */
export const jitter = (frame: number, id: number, amp = 1.6) => {
  const s = boilSeed(frame) * 13.7 + id * 7.31;
  return [(rand(s) - 0.5) * 2 * amp, (rand(s + 3.1) - 0.5) * 2 * amp] as const;
};

/** Trait à main levée entre des points : polyline lissée, sommets qui tremblent. */
export const handPath = (pts: [number, number][], frame: number, id = 0, amp = 1.6) => {
  const p = pts.map(([x, y], i) => {
    const [dx, dy] = jitter(frame, id * 31 + i, amp);
    return [x + dx, y + dy];
  });
  if (p.length < 3) return `M ${p.map((q) => q.join(' ')).join(' L ')}`;
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mx = (p[i][0] + p[i + 1][0]) / 2;
    const my = (p[i][1] + p[i + 1][1]) / 2;
    d += ` Q ${p[i][0]} ${p[i][1]} ${mx} ${my}`;
  }
  const l = p[p.length - 1];
  return d + ` L ${l[0]} ${l[1]}`;
};

// ---------- surligneur ----------
/** Coup de surligneur derrière un texte. k 0→1 = le feutre passe de gauche à droite. */
export const Highlight: React.FC<{k: number; children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
  k,
  children,
  color = C.hlSoft,
  style,
}) => (
  <span style={{position: 'relative', display: 'inline-block', ...style}}>
    <span
      style={{
        position: 'absolute',
        left: '-0.12em',
        right: '-0.12em',
        top: '0.18em',
        bottom: '0.02em',
        background: color,
        borderRadius: '0.25em 0.4em 0.3em 0.2em',
        transform: `scaleX(${clamp01(k)}) skewX(-6deg) rotate(-1.2deg)`,
        transformOrigin: '0% 50%',
        mixBlendMode: 'multiply',
      }}
    />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);

/** Texte manuscrit standard. */
export const Hand: React.FC<{size?: number; color?: string; weight?: 400 | 700; style?: React.CSSProperties; children: React.ReactNode}> = ({
  size = 72,
  color = C.ink,
  weight = 700,
  style,
  children,
}) => (
  <div style={{fontFamily: F.hand, fontSize: size, fontWeight: weight, color, lineHeight: 1.1, ...style}}>{children}</div>
);
