// DA « Gravure » (d'après le format @dernier.maillon) : fond noir marbré, gravures du domaine public en cartes
// de papier déchiré, or, chiffres en serif qui défilent, cartes « Cela s'appelle… » entre deux frises grecques,
// tampons rouges, rayons, faisceau de lumière, sous-titres mot à mot (gris → blanc, mot clé doré souligné).
// Textures et images : videos/<id>/prep_img.py → public/v/<id>/img/.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {clamp01, easeIn, easeInOut, easeOut, lerp, overshoot, prog, rand} from '../theme';
import type {Word} from '../components/Captions';
import {strobeDigits} from './shots';

const mont = loadMontserrat('normal', {weights: ['700', '800', '900'], subsets: ['latin', 'latin-ext']});
const play = loadPlayfair('normal', {weights: ['700', '800', '900'], subsets: ['latin', 'latin-ext']});

export const G = {
  bg: '#0E0D0C',
  white: '#F6F1E6',
  cream: '#EFE6D2',
  grey: 'rgba(246,241,230,0.32)',
  gold: '#E2B14A',
  goldHi: '#F7D98A',
  goldDeep: '#A8792A',
  red: '#C8262C',
  redDeep: '#5A0E10',
  goldRgb: '226,177,74',
  goldHiRgb: '255,200,110',
  leakRgb: '255,140,40',
};
/** couleur d'accent par thème (l'or n'est plus obligatoire) : psycho bleu, histoire vert, philo pourpre, corps rouge sang */
export type Accent = 'or' | 'bleu' | 'vert' | 'pourpre' | 'sang';
const ACCENTS: Record<Accent, Partial<typeof G>> = {
  or: {gold: '#E2B14A', goldHi: '#F7D98A', goldDeep: '#A8792A', goldRgb: '226,177,74', goldHiRgb: '255,200,110', leakRgb: '255,140,40'},
  bleu: {gold: '#5AAEF0', goldHi: '#B4DEFF', goldDeep: '#1F5F9E', goldRgb: '90,174,240', goldHiRgb: '170,220,255', leakRgb: '70,150,255'},
  vert: {gold: '#4CC38A', goldHi: '#B2F2CF', goldDeep: '#1E7A4E', goldRgb: '76,195,138', goldHiRgb: '170,245,200', leakRgb: '80,220,150'},
  pourpre: {gold: '#B98AF0', goldHi: '#E2CCFF', goldDeep: '#6B3FA8', goldRgb: '185,138,240', goldHiRgb: '225,200,255', leakRgb: '170,100,255'},
  sang: {gold: '#E8504F', goldHi: '#FFAFA6', goldDeep: '#9A1E22', goldRgb: '232,80,79', goldHiRgb: '255,170,160', leakRgb: '255,70,50'},
};
/** appelé par la scène avant ses enfants : toute la vidéo prend l'accent du thème */
export const applyAccent = (a: Accent) => Object.assign(G, ACCENTS[a]);
export const GF = {
  sans: `${mont.fontFamily}, "Arial Black", sans-serif`,
  serif: `${play.fontFamily}, Georgia, serif`,
};
const img = (id: string, f: string) => staticFile(`v/${id}/img/${f}`);
/** typo française : espace insécable avant : ; ? ! */
export const fr = (s: string) => s.trim().replace(/([^\s\u00a0])([:;?!]+)$/, '$1\u00a0$2');

// ---------- fonds ----------
export type Bg = 'marble' | 'velvet' | 'gold' | 'ash' | 'white';
export const Backdrop: React.FC<{id: string; kind: Bg; o?: number}> = ({id, kind, o = 1}) => {
  if (o <= 0) return null;
  const st: React.CSSProperties = {opacity: o};
  if (kind === 'marble') return <AbsoluteFill style={st}><Img src={img(id, 'marble.webp')} style={{width: '100%', height: '100%'}} /></AbsoluteFill>;
  if (kind === 'velvet') return <AbsoluteFill style={st}><Img src={img(id, 'velvet.webp')} style={{width: '100%', height: '100%'}} /></AbsoluteFill>;
  if (kind === 'white') return <AbsoluteFill style={st}><Img src={img(id, 'marble_white.webp')} style={{width: '100%', height: '100%'}} /><AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 42%, rgba(0,0,0,0) 50%, rgba(40,32,20,0.45) 100%)'}} /></AbsoluteFill>;
  if (kind === 'gold') return <AbsoluteFill style={{...st, background: `radial-gradient(ellipse 75% 55% at 50% 42%, ${G.goldHi} 0%, ${G.gold} 38%, ${G.goldDeep} 78%, #14110C 100%)`}} />;
  return <AbsoluteFill style={{...st, background: 'radial-gradient(ellipse 80% 60% at 50% 42%, #8A857C 0%, #5E5A53 50%, #24221F 100%)'}} />;
};

/** grain de film (tuile 512 px décalée toutes les 2 images) + vignette */
export const Finish: React.FC<{frame: number; id: string; leak?: number; leakCorner?: 'tr' | 'bl'}> = ({frame, id, leak = 0, leakCorner = 'tr'}) => {
  const s = Math.floor(frame / 2);
  const dust = Array.from({length: 46}, (_, i) => ({x: rand(s * 31 + i) * 1080, y: rand(s * 17 + i * 3.1) * 1920, r: 1 + rand(i * 7.7 + s) * 2.2, o: 0.25 + rand(i + s * 0.3) * 0.5}));
  const [lx, ly] = leakCorner === 'tr' ? [980, 300] : [60, 1500];
  return (
    <>
      {leak > 0 ? <AbsoluteFill style={{background: `radial-gradient(circle at ${lx}px ${ly}px, rgba(${G.leakRgb},${0.55 * leak}) 0px, rgba(${G.leakRgb},${0.22 * leak}) 260px, rgba(${G.leakRgb},0) 640px)`, mixBlendMode: 'screen'}} /> : null}
      <svg style={{position: 'absolute', left: 0, top: 0, opacity: 0.55}} width={1080} height={1920}>{dust.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#E9DFC8" opacity={d.o} />)}</svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 72% 58% at 50% 44%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: `url(${img(id, 'grain.png')})`, backgroundPosition: `${Math.round(rand(s) * 512)}px ${Math.round(rand(s + 7.3) * 512)}px`, mixBlendMode: 'overlay', opacity: 0.11}} />
    </>
  );
};

/** rayons qui tournent lentement derrière le sujet (rot en degrés) */
export const Rays: React.FC<{k: number; rot: number; cy?: number; color?: string; dark?: boolean}> = ({k, rot, cy = 760, color = `rgba(${G.goldRgb},0.30)`, dark}) =>
  k <= 0 ? null : (
    <AbsoluteFill
      style={{
        opacity: k,
        background: `repeating-conic-gradient(from ${rot}deg at 540px ${cy}px, ${dark ? 'rgba(0,0,0,0.22)' : color} 0deg 3.2deg, transparent 3.2deg 11.25deg)`,
        WebkitMaskImage: `radial-gradient(circle at 540px ${cy}px, black 0px, black 260px, transparent 900px)`,
        maskImage: `radial-gradient(circle at 540px ${cy}px, black 0px, black 260px, transparent 900px)`,
      }}
    >
      <AbsoluteFill style={{background: `radial-gradient(circle at 540px ${cy}px, rgba(247,217,138,${dark ? 0 : 0.28}) 0px, transparent 420px)`}} />
    </AbsoluteFill>
  );

/** faisceau de lumière diagonal qui balaie l'écran (p : 0 → 1) */
export const Beam: React.FC<{p: number}> = ({p}) => {
  if (p <= 0 || p >= 1) return null;
  const x = lerp(-900, 1500, p);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x, top: -600, width: 300, height: 3200, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(247,217,138,0) 0%, rgba(247,217,138,0.42) 50%, rgba(247,217,138,0) 100%)', filter: 'blur(14px)', opacity: Math.sin(p * Math.PI)}} />
    </AbsoluteFill>
  );
};

/** crochets de mise au point dorés autour d'une zone (coordonnées écran) */
export const Brackets: React.FC<{x: number; y: number; w: number; h: number; k: number; t: number}> = ({x, y, w, h, k, t}) => {
  if (k <= 0) return null;
  const s = lerp(1.45, 1, easeOut(k)) * (1 + 0.012 * Math.sin(t * 5));
  const L = Math.min(56, w * 0.22);
  const cx = x + w / 2, cy = y + h / 2;
  const c = (sx: number, sy: number) => {
    const px = cx + sx * (w / 2) * s, py = cy + sy * (h / 2) * s;
    return `M ${px} ${py - sy * L} L ${px} ${py} L ${px - sx * L} ${py}`;
  };
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      <path d={[c(-1, -1), c(1, -1), c(1, 1), c(-1, 1)].join(' ')} stroke={G.gold} strokeWidth={7} fill="none" strokeLinecap="square" opacity={clamp01(k * 1.6)} style={{filter: `drop-shadow(0 0 6px rgba(${G.goldRgb},0.6))`}} />
    </svg>
  );
};

/** frise grecque (méandre) centrée, qui se déroule depuis le centre (k) */
export const GreekKey: React.FC<{y: number; w?: number; k: number}> = ({y, w = 760, k}) => {
  if (k <= 0) return null;
  const U = 40, H = 34, n = Math.floor(w / U), W = n * U;
  let d = `M 0 2 H ${W} M 0 ${H} H ${W}`;
  for (let i = 0; i < n; i++) {
    const x = i * U;
    d += ` M ${x + 4} ${H} V 8 H ${x + 32} V 26 H ${x + 14} V 16 H ${x + 24}`;
  }
  const reveal = easeOut(k) * W;
  return (
    <svg style={{position: 'absolute', left: 540 - W / 2, top: y - H / 2, overflow: 'visible'}} width={W} height={H + 4}>
      <defs>
        <clipPath id={`gk${Math.round(y)}`}>
          <rect x={W / 2 - reveal / 2} y={-4} width={reveal} height={H + 12} />
        </clipPath>
      </defs>
      <path d={d} stroke={G.gold} strokeWidth={4.5} fill="none" clipPath={`url(#gk${Math.round(y)})`} style={{filter: `drop-shadow(0 0 4px rgba(${G.goldRgb},0.45))`}} />
    </svg>
  );
};

/** couronne de laurier dorée : les feuilles poussent du bas vers le haut (k) */
export const Laurel: React.FC<{cx: number; cy: number; r: number; k: number; dark?: boolean}> = ({cx, cy, r, k, dark}) => {
  if (k <= 0) return null;
  const N = 12;
  const leaves: React.ReactNode[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < N; i++) {
      const f = 0.32 + (i / (N - 1)) * 2.25; // angle depuis le bas (rad), en remontant chaque côté
      const show = clamp01(k * (N + 3) - i);
      if (show <= 0) continue;
      const tan = (Math.atan2(-Math.sin(f), side * Math.cos(f)) * 180) / Math.PI; // direction de la tige
      for (const off of [-1, 1]) {
        // une paire de feuilles de part et d'autre de la tige, inclinées de ±32°
        const x = cx + side * Math.sin(f) * (r + off * 16), y = cy + Math.cos(f) * (r + off * 16);
        const rot = tan + 90 + off * 32 * side;
        leaves.push(
          <ellipse key={`${side}-${i}-${off}`} cx={x} cy={y} rx={11 * show} ry={27 * show} transform={`rotate(${rot} ${x} ${y})`} fill={dark ? '#3A2A10' : 'url(#goldgrad)'} stroke={dark ? '#1E1508' : G.goldDeep} strokeWidth={1.5} />,
        );
      }
    }
  }
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
      <defs>
        <linearGradient id="goldgrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={G.goldHi} />
          <stop offset="1" stopColor={G.goldDeep} />
        </linearGradient>
      </defs>
      <g style={{filter: dark ? 'none' : `drop-shadow(0 0 8px rgba(${G.goldRgb},0.55))`}}>{leaves}</g>
    </svg>
  );
};

/** couronne de roi tracée au trait doré (k : tracé) */
export const Crown: React.FC<{x: number; y: number; w: number; k: number}> = ({x, y, w, k}) => {
  if (k <= 0) return null;
  const h = w * 0.62;
  const pts: [number, number][] = [[0, h], [0, h * 0.18], [w * 0.25, h * 0.55], [w * 0.5, 0], [w * 0.75, h * 0.55], [w, h * 0.18], [w, h], [0, h]];
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${x - w / 2 + p[0]} ${y - h + p[1]}`).join(' ');
  const len = 3.6 * w;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
      <path d={d} stroke={G.gold} strokeWidth={9} fill="none" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - easeInOut(clamp01(k * 1.15)))} style={{filter: `drop-shadow(0 0 8px rgba(${G.goldRgb},0.7))`}} />
      {[[0, h * 0.18], [w * 0.5, 0], [w, h * 0.18]].map(([px, py], i) => (
        <circle key={i} cx={x - w / 2 + px} cy={y - h + py - 12} r={11 * clamp01(k * 3 - 2)} fill={G.gold} />
      ))}
    </svg>
  );
};

/** tampon encreur qui s'abat (t0 : impact) */
export const Stamp: React.FC<{text: string; t: number; t0: number; x?: number; y?: number; rot?: number; size?: number; color?: string}> = ({text, t, t0, x = 540, y = 760, rot = -13, size = 128, color = G.red}) => {
  const lt = t - t0;
  if (lt < -0.12) return null;
  const k = prog(lt, -0.12, 0, easeIn);
  const s = lerp(2.3, 1, k);
  const shake = lt > 0 && lt < 0.18 ? Math.sin(lt * 90) * 7 * (1 - lt / 0.18) : 0;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translate(${shake}px, 0) rotate(${rot}deg) scale(${s})`, opacity: 0.25 + 0.68 * k}}>
      <div style={{fontFamily: GF.sans, fontWeight: 900, fontSize: size, letterSpacing: '0.04em', color, border: `${Math.round(size * 0.09)}px solid ${color}`, padding: `${size * 0.02}px ${size * 0.22}px`, lineHeight: 1.05, whiteSpace: 'nowrap', textTransform: 'uppercase', filter: 'url(#rough)', mixBlendMode: 'normal', textShadow: '0 0 1px rgba(0,0,0,0.3)'}}>
        {text}
      </div>
    </div>
  );
};

/** filtres partagés : bord rugueux des tampons */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feComponentTransfer in="n" result="holes">
        <feFuncA type="discrete" tableValues="1 1 1 1 1 0.35 1 1" />
      </feComponentTransfer>
      <feComposite in="d" in2="holes" operator="in" />
    </filter>
  </svg>
);

// ---------- images ----------
/** gravure / photo préparée, centrée en (x, y) ; z : poussée lente (ken burns) */
export const Pic: React.FC<{id: string; name: string; w: number; x?: number; y?: number; z?: number; rot?: number}> = ({id, name, w, x = 540, y = 760, z = 0, rot = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%, -50%) scale(${1 + z}) rotate(${rot}deg)`}}>
    <Img src={img(id, `${name}.webp`)} style={{width: '100%', display: 'block', filter: `drop-shadow(0 22px 34px rgba(0,0,0,0.75)) drop-shadow(0 0 14px rgba(${G.goldRgb},0.22))`}} />
  </div>
);

/** pièce qui tourne sur elle-même : angle en demi-tours (pair = pile visible, impair = face) */
export const Coin: React.FC<{id: string; halfTurns: number; size?: number; y?: number; lift?: number; faces?: [string, string]}> = ({id, halfTurns, size = 660, y = 760, lift = 0, faces = ['coin_pile', 'coin_face']}) => {
  const a = halfTurns * Math.PI;
  const c = Math.cos(a);
  const side = Math.round(halfTurns) % 2 === 0 ? faces[0] : faces[1];
  const sx = Math.max(0.04, Math.abs(c));
  return (
    <div style={{position: 'absolute', left: 540, top: y - lift, width: size, height: size, transform: `translate(-50%, -50%) scaleX(${sx})`}}>
      <Img src={img(id, `${side}.webp`)} style={{width: '100%', height: '100%', filter: `brightness(${0.75 + 0.25 * sx}) drop-shadow(0 26px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 18px rgba(${G.goldRgb},0.3))`}} />
    </div>
  );
};

// ---------- chiffres ----------
const DIG = '0123456789';
/** chiffre en rouleau : les colonnes défilent puis s'arrêtent de gauche à droite (t0 : début) */
export const Num: React.FC<{text: string; t: number; t0: number; y?: number; size?: number; color?: 'gold' | 'white' | 'red' | 'ink'; label?: string; frieze?: boolean}> = ({text, t, t0, y = 780, size, color = 'gold', label, frieze = true}) => {
  const lt = t - t0;
  const chars = [...text];
  const nd = chars.filter((ch) => DIG.includes(ch)).length;
  const fs = size ?? (text.length <= 2 ? 420 : text.length <= 4 ? 300 : text.length <= 6 ? 230 : 190);
  let di = 0;
  const land = 0.32 + (nd - 1) * 0.11; // le dernier chiffre se pose
  const pop = lt > land ? 1 + 0.07 * Math.exp(-(lt - land) * 9) * Math.cos((lt - land) * 26) : 1;
  const fill = color === 'gold' ? `linear-gradient(180deg, ${G.goldHi} 0%, ${G.gold} 45%, ${G.goldDeep} 100%)` : color === 'ink' ? 'linear-gradient(180deg, #3B2A10, #140D05)' : color === 'red' ? `linear-gradient(180deg, #FF6B5E, ${G.red})` : `linear-gradient(180deg, #FFFFFF, ${G.cream})`;
  const enter = prog(lt, 0, 0.18, easeOut);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, transform: `translateY(-50%) scale(${pop * lerp(0.9, 1, enter)})`, display: 'flex', justifyContent: 'center', alignItems: 'baseline', opacity: enter, fontFamily: GF.serif, fontWeight: 900, fontSize: fs, lineHeight: 1, letterSpacing: '-0.01em'}}>
        {chars.map((ch, i) => {
          if (ch === ' ') return <span key={i} style={{display: 'inline-block', width: fs * 0.2}} />; // espace des milliers (« 2 400 »)
          if (!DIG.includes(ch)) {
            return <span key={i} style={{backgroundImage: fill, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontSize: ch === ' ' ? fs * 0.3 : /[€$%×]/.test(ch) ? fs * 0.7 : fs, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.6))'}}>{ch === ' ' ? ' ' : ch}</span>;
          }
          const stop = 0.32 + di * 0.11; di++;
          const target = DIG.indexOf(ch);
          const rolling = lt < stop;
          const spin = rolling ? Math.floor((lt + 1) * 34 + i * 3) % 10 : target;
          const blur = rolling ? 7 : lt < stop + 0.06 ? 3 : 0;
          const dy = rolling ? ((lt * 34) % 1) * fs * 0.25 : lt < stop + 0.1 ? -fs * 0.05 * (1 - (lt - stop) / 0.1) : 0;
          return (
            <span key={i} style={{display: 'inline-block', transform: `translateY(${dy}px)`, filter: `blur(${blur}px) drop-shadow(0 6px 18px rgba(0,0,0,0.6))`, backgroundImage: fill, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>
              {DIG[spin]}
            </span>
          );
        })}
      </div>
      {frieze ? (
        <>
          <GreekKey y={y - fs * 0.62} w={Math.min(860, fs * text.length * 0.62 + 120)} k={prog(lt, land - 0.05, land + 0.4)} />
          <GreekKey y={y + fs * 0.6} w={Math.min(860, fs * text.length * 0.62 + 120)} k={prog(lt, land - 0.05, land + 0.4)} />
        </>
      ) : null}
      {label ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y + fs * 0.6 + (frieze ? 46 : 10), textAlign: 'center', fontFamily: GF.sans, fontWeight: 800, fontSize: 40, letterSpacing: '0.26em', color: color === 'ink' ? '#2A1E0C' : G.cream, opacity: prog(lt, land, land + 0.3) * 0.85}}>
          {label}
        </div>
      ) : null}
    </>
  );
};

// ---------- carte « Cela s'appelle… » ----------
/** les mots apparaissent quand ils sont dits ; retour à la ligne après « s'appelle » ou « : » (sinon après le 1er mot) */
export const TitleCard: React.FC<{words: Word[]; t: number; t0: number; t1: number; strike?: boolean}> = ({words, t, t0, t1, strike}) => {
  const ws = words.filter((w) => w.startMs / 1000 >= t0 - 0.05 && w.startMs / 1000 < t1 - 0.05);
  let br = ws.findIndex((w) => /appelle|:$/i.test(w.text.trim()));
  if (br === -1) br = 0;
  const lines = [ws.slice(0, br + 1), ws.slice(br + 1)];
  const lt = t - t0;
  const last = ws[ws.length - 1];
  const strikeK = strike && last ? prog(t, last.endMs / 1000, last.endMs / 1000 + 0.35, easeOut) : 0;
  return (
    <>
      <GreekKey y={700} k={prog(lt, 0, 0.45)} />
      <GreekKey y={1110} k={prog(lt, 0.05, 0.5)} />
      <div style={{position: 'absolute', left: 70, right: 70, top: 905, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: GF.serif, fontWeight: 800, color: G.white, lineHeight: 1.12, textTransform: 'uppercase'}}>
        {lines.map((ln, li) => (
          <div key={li} style={{fontSize: li === 0 ? 68 : 92, marginTop: li ? 18 : 0, position: 'relative', display: ln.length ? 'block' : 'none'}}>
            {ln.map((w, i) => {
              const k = prog(t, w.startMs / 1000 - 0.04, w.startMs / 1000 + 0.14, easeOut);
              return (
                <span key={i} style={{opacity: k, color: w.key ? G.gold : G.white, display: 'inline-block', transform: `translateY(${(1 - k) * 14}px)`, textShadow: '0 6px 22px rgba(0,0,0,0.7)'}}>
                  {fr(w.text)}{i < ln.length - 1 ? '\u00a0' : ''}
                </span>
              );
            })}
            {li === 1 && strikeK > 0 ? <div style={{position: 'absolute', left: '6%', top: '52%', height: 12, width: `${88 * strikeK}%`, background: G.red, transform: 'rotate(-3deg)', boxShadow: '0 0 10px rgba(200,38,44,0.6)'}} /> : null}
          </div>
        ))}
      </div>
    </>
  );
};

// ---------- balance dorée ----------
export const Balance: React.FC<{k: number; tilt: number; left: string; right: string; y?: number; bw?: number}> = ({k, tilt, left, right, y = 760, bw = 280}) => {
  if (k <= 0) return null;
  const draw = easeInOut(clamp01(k));
  const a = (tilt * Math.PI) / 180; // bw ≤ 280 : les plateaux restent hors de la colonne d'icônes TikTok (x > 960)
  const lx = 540 - bw * Math.cos(a), ly = y - 210 - bw * Math.sin(a);
  const rx = 540 + bw * Math.cos(a), ry = y - 210 + bw * Math.sin(a);
  const pan = (px: number, py: number, label: string, col: string) => (
    <g>
      <path d={`M ${px} ${py} L ${px - 105} ${py + 260} M ${px} ${py} L ${px + 105} ${py + 260}`} stroke={G.gold} strokeWidth={3} opacity={0.8} />
      <path d={`M ${px - 128} ${py + 260} Q ${px} ${py + 350} ${px + 128} ${py + 260} Z`} fill="rgba(${G.goldRgb},0.12)" stroke={G.gold} strokeWidth={7} />
      <text x={px} y={py + 238} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={74} fill={col} style={{filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))'}}>{label}</text>
    </g>
  );
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, opacity: draw}} width={1080} height={1920}>
      <g style={{filter: `drop-shadow(0 0 8px rgba(${G.goldRgb},0.5))`}}>
        <path d={`M 540 ${y - 250} L 540 ${y + 330} M 430 ${y + 330} L 650 ${y + 330}`} stroke={G.gold} strokeWidth={10} strokeLinecap="round" />
        <circle cx={540} cy={y - 262} r={20} fill={G.gold} />
        <line x1={lx} y1={ly} x2={rx} y2={ry} stroke={G.gold} strokeWidth={10} strokeLinecap="round" />
        {pan(lx, ly, left, G.goldHi)}
        {pan(rx, ry, right, '#FF7468')}
      </g>
    </svg>
  );
};

// ---------- sous-titres ----------
/** pages de 1 à 4 mots coupées à la ponctuation ; le mot dit passe du gris au blanc, le mot clé est doré et souligné */
export const GCaptions: React.FC<{words: Word[]; t: number; hidden?: boolean; y?: number; fade?: number}> = ({words, t, hidden, y = 1355, fade = 1}) => {
  const pages = React.useMemo(() => {
    const out: Word[][] = [];
    let cur: Word[] = [];
    for (const w of words) {
      const txt = [...cur, w].map((c) => c.text.trim()).join(' ');
      if (cur.length && txt.length > 19) { out.push(cur); cur = []; }
      cur.push(w);
      if (/[.,;:!?…]$/.test(w.text.trim()) || cur.length >= 4) { out.push(cur); cur = []; }
    }
    if (cur.length) out.push(cur);
    return out;
  }, [words]);
  if (hidden || fade <= 0) return null;
  const ms = t * 1000;
  const pi = pages.findIndex((p, i) => ms >= p[0].startMs - 30 && ms < (pages[i + 1]?.[0].startMs ?? p[p.length - 1].endMs + 900) - 30);
  if (pi < 0) return null;
  const page = pages[pi];
  return (
    <div style={{position: 'absolute', left: 96, right: 70, top: y, fontFamily: GF.sans, fontWeight: 900, fontSize: 70, lineHeight: 1.15, textTransform: 'uppercase', letterSpacing: '0.005em', opacity: fade}}>
      {page.map((w, i) => {
        const s = w.startMs / 1000;
        if (t < s - 0.03) return null;
        const k = prog(t, s - 0.03, s + 0.16, easeOut);
        const u = w.key ? prog(t, s + 0.05, s + 0.35, easeOut) : 0;
        const col = w.key ? G.gold : G.white;
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', marginRight: '0.26em', color: k < 1 ? `color-mix(in srgb, ${col} ${Math.round(k * 100)}%, #6B6862)` : col, textShadow: '0 4px 16px rgba(0,0,0,0.85), 3px 4px 0 rgba(0,0,0,0.55)', WebkitTextStroke: '2px rgba(8,6,4,0.9)', paintOrder: 'stroke fill', transform: `scale(${lerp(1.35, 1, k)})`, transformOrigin: '50% 70%'}}>
            {fr(w.text)}
            {u > 0 ? <span style={{position: 'absolute', left: 0, bottom: -4, height: 7, width: `${u * 100}%`, background: G.gold, borderRadius: 2, boxShadow: `0 0 8px rgba(${G.goldRgb},0.6)`}} /> : null}
          </span>
        );
      })}
    </div>
  );
};

export {easeIn, easeOut, overshoot};


// ---------- idées reprises du kit de Hark (kit_style_gravure/PROMPT_MAITRE.txt) ----------
/** titre d'accroche doré écrit en haut dès l'image 0 (miniature) ; « | » = retour à la ligne ; k = opacité */
export const HookTitle: React.FC<{text: string; k: number}> = ({text, k}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: 70, right: 70, top: 170, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: Math.min(82, 1500 / Math.max(...text.split('|').map((l) => l.length))), whiteSpace: 'nowrap', lineHeight: 1.08, color: G.gold, textTransform: 'uppercase', opacity: k, textShadow: `0 0 28px rgba(${G.goldRgb},0.4), 0 6px 18px rgba(0,0,0,0.9)`}}>
      {text.split('|').map((ln, i) => <div key={i}>{ln}</div>)}
    </div>
  );

/** mot-concept tapé lettre par lettre (0,045 s) entre deux frises, traduction à +0,55 s après la dernière lettre */
export const ConceptWord: React.FC<{word: string; sub: string; t: number; t0: number}> = ({word, sub, t, t0}) => {
  const lt = t - t0;
  const n = Math.max(0, Math.min(word.length, Math.floor(lt / 0.045)));
  const done = word.length * 0.045;
  const fs = word.length > 12 ? 104 : 128;
  return (
    <>
      <GreekKey y={690} k={prog(lt, 0, 0.4)} />
      <div style={{position: 'absolute', left: 40, right: 40, top: 840, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: fs, lineHeight: 1.02, color: G.gold, textShadow: `0 0 30px rgba(${G.goldRgb},0.45), 0 8px 20px rgba(0,0,0,0.85)`}}>
        {word.slice(0, n)}<span style={{opacity: 0}}>{word.slice(n)}</span>
      </div>
      <div style={{position: 'absolute', left: 60, right: 60, top: 990, textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontStyle: 'italic', fontSize: 58, color: G.cream, opacity: prog(lt, done + 0.1, done + 0.45), textShadow: '0 4px 14px rgba(0,0,0,0.85)'}}>{sub}</div>
      <GreekKey y={1110} k={prog(lt, 0.05, 0.45)} />
    </>
  );
};

/** citation : lignes qui apparaissent une par une (0,25 s), signature dorée à +0,9 s après la dernière */
export const QuoteCard: React.FC<{lines: string[]; sign: string; t: number; t0: number; every?: number}> = ({lines, sign, t, t0, every = 0.25}) => {
  const lt = t - t0;
  return (
    <>
      <GreekKey y={620} k={prog(lt, 0, 0.4)} />
      <div style={{position: 'absolute', left: 110, right: 110, top: 860, transform: 'translateY(-50%)', textAlign: 'center', fontFamily: GF.serif, fontWeight: 700, fontSize: 70, lineHeight: 1.22, color: G.white}}>
        {lines.map((ln, i) => {
          const k = prog(lt, 0.15 + i * every, 0.4 + i * every, easeOut);
          return <div key={i} style={{opacity: k, transform: `translateY(${(1 - k) * 12}px)`, textShadow: '0 6px 18px rgba(0,0,0,0.85)'}}>{ln}</div>;
        })}
      </div>
      <GreekKey y={1110} k={prog(lt, 0.05, 0.45)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: GF.sans, fontWeight: 700, fontSize: 38, letterSpacing: '0.14em', color: G.gold, opacity: prog(lt, 0.15 + lines.length * every + 0.65, 0.15 + lines.length * every + 0.95)}}>{sign}</div>
    </>
  );
};

/** filtre « glitch » : canaux rouge et bleu décalés de ±dx px (à recréer à chaque image avec le bon dx) */
export const GlitchFilter: React.FC<{dx: number}> = ({dx}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id="glitch" x="-5%" y="0" width="110%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
      <feOffset in="r" dx={dx} dy={0} result="r2" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
      <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
      <feOffset in="b" dx={-dx} dy={0} result="b2" />
      <feBlend in="r2" in2="g" mode="screen" result="rg" />
      <feBlend in="rg" in2="b2" mode="screen" />
    </filter>
  </svg>
);

/** bandes horizontales décalées (glitch) : 7 tranches du plan, chacune poussée de ±90·s px */
export const GlitchBands: React.FC<{s: number; seed: number; children: React.ReactNode}> = ({s, seed, children}) => {
  if (s <= 0.01) return <>{children}</>;
  const bands = Array.from({length: 7}, (_, i) => {
    const h = 20 + rand(seed * 13 + i) * 100, y = rand(seed * 7 + i * 3.3) * (1920 - h);
    return {y, h, dx: (rand(seed + i * 9.1) - 0.5) * 180 * s};
  });
  return (
    <AbsoluteFill style={{filter: 'url(#glitch)'}}>
      <AbsoluteFill>{children}</AbsoluteFill>
      {bands.map((b, i) => (
        <AbsoluteFill key={i} style={{clipPath: `inset(${b.y}px 0 ${1920 - b.y - b.h}px 0)`, transform: `translateX(${b.dx}px)`}}>{children}</AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

// ---------- cartes de l'expérience d'Asch (1951) ----------
/** deux cartes de papier : la ligne de référence à gauche, les lignes 1, 2, 3 à droite (2 = la bonne).
 *  draw : tracé 0 → 1 ; pick : ligne désignée ; wrong : la désignation est fausse (rouge) ; votes : nombre de mains levées pour `pick` */
export const LinesCard: React.FC<{draw: number; pick?: 1 | 2 | 3; wrong?: boolean; pickK?: number; votes?: number}> = ({draw, pick, wrong, pickK = 1, votes = 0}) => {
  if (draw <= 0) return null;
  const base = 1000, top = 470;
  const L = {ref: 300, 1: 225, 2: 300, 3: 385} as const;
  const xs: Record<1 | 2 | 3, number> = {1: 590, 2: 735, 3: 880};
  const d = (len: number, k: number) => ({strokeDasharray: len, strokeDashoffset: len * (1 - easeInOut(clamp01(k)))});
  const col = (n: 1 | 2 | 3) => (pick === n && pickK > 0 ? (wrong ? '#B3201F' : G.goldDeep) : '#1B1712');
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      <g opacity={clamp01(draw * 3)}>
        <rect x={120} y={top} width={300} height={base - top + 90} rx={6} fill={G.cream} stroke={G.gold} strokeWidth={4} />
        <rect x={500} y={top} width={460} height={base - top + 90} rx={6} fill={G.cream} stroke={G.gold} strokeWidth={4} />
      </g>
      <line x1={270} y1={base} x2={270} y2={base - L.ref} stroke="#1B1712" strokeWidth={16} strokeLinecap="round" style={d(L.ref, draw * 1.4 - 0.2)} />
      {([1, 2, 3] as const).map((n, i) => (
        <g key={n}>
          {pick === n && pickK > 0 ? <rect x={xs[n] - 40} y={base - L[n] - 30} width={80} height={L[n] + 110} rx={40} fill={wrong ? 'rgba(179,32,31,0.16)' : `rgba(${G.goldRgb},0.28)`} stroke={wrong ? '#B3201F' : G.gold} strokeWidth={6} opacity={pickK} /> : null}
          <line x1={xs[n]} y1={base} x2={xs[n]} y2={base - L[n]} stroke={col(n)} strokeWidth={16} strokeLinecap="round" style={d(L[n], draw * 1.4 - 0.35 - i * 0.12)} />
          <text x={xs[n]} y={base + 62} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={54} fill={col(n)} opacity={clamp01(draw * 2 - 0.6)}>{n}</text>
        </g>
      ))}
      {votes > 0 && pick ? Array.from({length: votes}, (_, i) => {
        const k = clamp01(pickK * (votes + 2) - i);
        const x = 160 + i * 110, y = 1200;
        return k > 0 ? (
          <g key={i} opacity={k} transform={`translate(${x} ${y + (1 - k) * 30})`}>
            <circle cx={40} cy={40} r={36} fill={wrong ? '#B3201F' : G.gold} />
            <text x={40} y={58} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={50} fill={G.white}>{pick}</text>
          </g>
        ) : null;
      }) : null}
    </svg>
  );
};

// ---------- v3 : montage « violent » (relevé image par image de @dernier.maillon) ----------
/** stroboscope de chiffres : avant un nombre, chaque chiffre seul en plein écran ~3 images, fond différent à chaque fois.
 *  Renvoie null quand le stroboscope est fini (lt ≥ digits × every). */
const STROBE: {bg: Bg; col: string}[] = [
  {bg: 'velvet', col: 'linear-gradient(180deg, #FFFFFF, #EFE6D2)'},
  {bg: 'ash', col: `linear-gradient(180deg, ${G.goldHi}, ${G.gold} 50%, ${G.goldDeep})`},
  {bg: 'white', col: 'linear-gradient(180deg, #3B2A10, #0A0603)'},
  {bg: 'marble', col: `linear-gradient(180deg, ${G.goldHi}, ${G.gold} 50%, ${G.goldDeep})`},
];
export const DigitStrobe: React.FC<{id: string; text: string; lt: number; every?: number}> = ({id, text, lt, every = 0.1}) => {
  const ds = strobeDigits(text);
  const i = Math.floor(lt / every);
  if (lt < 0 || i >= ds.length) return null;
  const st = STROBE[i % STROBE.length];
  const k = (lt - i * every) / every; // 0 → 1 dans le chiffre
  const smear = k < 0.4 ? 1 - k / 0.4 : 0;
  return (
    <AbsoluteFill>
      <Backdrop id={id} kind={st.bg} />
      {[3, 2, 1, 0].map((g) => (
        <div key={g} style={{position: 'absolute', left: 0, right: 0, top: 760, transform: `translateY(-50%) translateY(${g * smear * -70}px) scale(${1 + 0.06 * (1 - k)})`, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 900, lineHeight: 1, opacity: g === 0 ? 1 : 0.28 * smear, filter: g ? `blur(${4 + g * 3}px)` : `blur(${smear * 5}px) drop-shadow(0 20px 40px rgba(0,0,0,0.5))`}}>
          <span style={{backgroundImage: st.col, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{ds[i]}</span>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** traînée de flou horizontale à l'arrivée d'un élément (copies décalées qui se résorbent en `dur` s) + trait de lumière dorée */
export const Smear: React.FC<{lt: number; dur?: number; streak?: boolean; y?: number; children: React.ReactNode}> = ({lt, dur = 0.3, streak, y = 780, children}) => {
  const s = 1 - prog(lt, 0, dur, easeOut);
  return (
    <>
      {s > 0.01 ? [-3, -2, -1, 1, 2, 3].map((g) => <AbsoluteFill key={g} style={{transform: `translateX(${g * 38 * s}px)`, opacity: 0.22 * s, filter: 'blur(3px)'}}>{children}</AbsoluteFill>) : null}
      <AbsoluteFill style={{transform: `translateX(${-60 * s}px)`, filter: s > 0.05 ? `blur(${s * 6}px)` : undefined}}>{children}</AbsoluteFill>
      {streak && s > 0.01 ? <div style={{position: 'absolute', left: -200, right: -200, top: y - 6, height: 12, background: `linear-gradient(90deg, rgba(${G.goldRgb},0) 0%, rgba(${G.goldHiRgb},0.95) 50%, rgba(${G.goldRgb},0) 100%)`, filter: 'blur(5px)', opacity: s, transform: `scaleY(${1 + 3 * s})`, mixBlendMode: 'screen'}} /> : null}
    </>
  );
};

/** mot qui claque au centre (Montserrat 900) : arrive de ×2,4 en 0,12 s, puis respire */
export const SlamWord: React.FC<{text: string; lt: number; y?: number; size?: number; color?: 'gold' | 'white' | 'red'}> = ({text, lt, y = 330, size, color = 'white'}) => {
  if (lt < 0) return null;
  const k = prog(lt, 0, 0.12, easeIn);
  const fs = size ?? Math.min(180, 860 / Math.max(3, text.length)); // Montserrat 900 ≈ 0,8 em par lettre : ≤ 880 px de large
  const col = color === 'gold' ? G.gold : color === 'red' ? '#FF3B30' : G.white;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: y, transform: `translateY(-50%) scale(${lerp(2.4, 1, k) * (1 + 0.02 * Math.sin(lt * 5))})`, textAlign: 'center', fontFamily: GF.sans, fontWeight: 900, fontSize: fs, lineHeight: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', color: col, opacity: k, WebkitTextStroke: '4px rgba(8,6,4,0.95)', paintOrder: 'stroke fill', textShadow: '0 10px 30px rgba(0,0,0,0.9), 6px 8px 0 rgba(0,0,0,0.6)'}}>
      {text}
    </div>
  );
};

/** lignes de vitesse radiales (impact), s : 1 → 0 */
export const SpeedLines: React.FC<{s: number; cy?: number}> = ({s, cy = 760}) =>
  s <= 0.01 ? null : (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
      {Array.from({length: 44}, (_, i) => {
        const a = (i / 44) * Math.PI * 2 + rand(i) * 0.1;
        const r0 = 420 + rand(i * 3.1) * 220 - 160 * (1 - s), r1 = 1500;
        return <line key={i} x1={540 + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={540 + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke="#F6F1E6" strokeWidth={2 + rand(i * 7) * 7} opacity={s * (0.25 + rand(i * 5) * 0.4)} />;
      })}
    </svg>
  );
