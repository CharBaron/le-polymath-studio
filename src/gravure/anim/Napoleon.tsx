// Animations sur mesure de la vidéo 32 (la taille de Napoléon), style empire (vert impérial, abeilles d'or).
// Toise : une toise en bois gravée ; Napoléon (David, 1812, détouré) en ombre chinoise, la tête cachée par un rideau
//   « ? » ; les trois réponses (A 1,57 · B 1,69 · C 1,80) se tracent à leur instant ; 3-2-1, « STOP. ».
//   reveal : le rideau se lève, Napoléon s'éclaire, la ligne A est barrée, la B s'allume. freezeAt : image figée.
// Pouces : un pouce français (2,71 cm) contre un pouce anglais (2,54 cm) ; Napoléon converti « à l'anglaise »
//   rapetisse de 1,69 à 1,58 m (−11 cm).
import React from 'react';
import {Img} from 'remotion';
import {easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Countdown, nums, pop, RED, src, Stop} from './tests';

const FLOOR = 1290, S = 480; // sol (y) et pixels par mètre
const yOf = (m: number) => FLOOR - m * S;
const RULER_X = 175;
const ASPECT = 515 / 1780; // napo_cut : largeur / hauteur
const GREEN = '#7CFF9A';

/** toise en bois : graduations tous les 1 cm, chiffres tous les 10 cm */
const Ruler: React.FC<{to?: number}> = ({to = 1.95}) => (
  <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
    <defs>
      <linearGradient id="wood" x1="0" x2="1">
        <stop offset="0" stopColor="#4A2E14" /><stop offset="0.45" stopColor="#A2703A" /><stop offset="1" stopColor="#3E260F" />
      </linearGradient>
      <pattern id="grain" width="7" height="60" patternUnits="userSpaceOnUse"><path d="M 3 0 Q 6 30 3 60" stroke="rgba(30,15,5,0.4)" strokeWidth="1.3" fill="none" /></pattern>
    </defs>
    <rect x={RULER_X - 50} y={yOf(to) - 20} width={100} height={FLOOR - yOf(to) + 20} fill="url(#wood)" stroke="#1E1208" strokeWidth={3} />
    <rect x={RULER_X - 50} y={yOf(to) - 20} width={100} height={FLOOR - yOf(to) + 20} fill="url(#grain)" />
    {Array.from({length: Math.round(to * 100) + 1}, (_, i) => {
      const y = yOf(i / 100), big = i % 10 === 0, mid = i % 5 === 0;
      return <line key={i} x1={RULER_X + 50} y1={y} x2={RULER_X + 50 - (big ? 42 : mid ? 26 : 12)} y2={y} stroke="#F3E2B8" strokeWidth={big ? 3.5 : 1.6} />;
    })}
    {Array.from({length: Math.floor(to * 10) + 1}, (_, i) => (i < 3 ? null : <text key={i} x={RULER_X - 44} y={yOf(i / 10) + 9} fill="#F3E2B8" fontFamily="Georgia, serif" fontWeight={700} fontSize={24}>{(i / 10).toFixed(1).replace('.', ',')}</text>))}
    <line x1={60} y1={FLOOR} x2={1020} y2={FLOOR} stroke={`rgba(${G.goldRgb},0.6)`} strokeWidth={4} />
  </svg>
);

/** Napoléon détouré, à l'échelle de la toise (tête à `m` mètres) ; dark = ombre chinoise */
const Napo: React.FC<{id: string; m: number; x?: number; dark: number; glow?: number}> = ({id, m, x = 600, dark, glow = 0}) => {
  const h = m * S, w = h * ASPECT;
  return (
    <Img src={src(id, 'napo_cut')} style={{position: 'absolute', left: x - w / 2, top: FLOOR - h, width: w, height: h, filter: `brightness(${lerp(1, 0.05, dark)}) contrast(${lerp(1.05, 1.5, dark)}) drop-shadow(0 0 ${36 * glow}px rgba(${G.goldRgb},${0.85 * glow}))`}} />
  );
};

const OPTS: [string, number][] = [['A', 1.57], ['B', 1.69], ['C', 1.8]];

const Lines: React.FC<{t: number; at: number[]; wrong?: number; right?: number}> = ({t, at, wrong = 1e9, right = 1e9}) => (
  <>
    {OPTS.map(([l, m], i) => {
      const k = prog(t, (at[i] ?? 1e9) - 0.05, (at[i] ?? 1e9) + 0.25, easeOut);
      if (k <= 0) return null;
      const y = yOf(m);
      const strike = i === 0 ? prog(t, wrong, wrong + 0.25, easeOut) : 0, ok = i === 1 ? prog(t, right, right + 0.25, easeOut) : 0;
      const col = ok ? GREEN : strike ? RED : G.gold;
      return (
        <div key={l}>
          <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
            <line x1={RULER_X + 52} y1={y} x2={RULER_X + 52 + 600 * k} y2={y} stroke={col} strokeWidth={ok ? 7 : 5} strokeDasharray={ok ? undefined : '18 12'} />
          </svg>
          <div style={{position: 'absolute', left: 800, top: y - 30, fontFamily: GF.label, fontWeight: 700, fontSize: 42, color: col, opacity: k, whiteSpace: 'nowrap', textShadow: '0 3px 10px rgba(0,0,0,0.95)', textDecoration: strike > 0.5 ? 'line-through' : 'none', textDecorationThickness: 5}}>
            {l} · {m.toFixed(2).replace('.', ',')}
          </div>
        </div>
      );
    })}
  </>
);

export const Toise: React.FC<AnimProps> = ({id, t: tNow, p}) => {
  const at = nums(p, 'at'), cd = nums(p, 'cd'), stop = Number(p.stop ?? 1e9);
  const reveal = !!p.reveal;
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined && !reveal;
  const liftAt = Number(p.lift ?? 1e9);
  const lift = reveal ? prog(t, liftAt, liftAt + 0.4, easeInOut) : 0;
  const wrong = reveal ? Number(p.wrong) : 1e9, right = reveal ? Number(p.right) : 1e9;
  const light = reveal ? prog(t, liftAt + 0.15, liftAt + 0.6, easeOut) : 0;
  const cy0 = yOf(1.95), cy1 = yOf(1.5);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.2}}>
        <Img src={src(id, 'david_plein')} style={{width: '100%', height: '100%', filter: 'blur(4px)'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(6,14,8,0.15) 30%, rgba(6,14,8,0.92) 90%)'}} />
      <Ruler />
      <Napo id={id} m={1.69} dark={1 - light} glow={reveal ? prog(t, right, right + 0.3) : 0} />
      {/* rideau « ? » qui cache la tête, donc la réponse */}
      <div style={{position: 'absolute', left: 300, top: cy0 - lift * 900, width: 600, height: cy1 - cy0, overflow: 'hidden', borderRadius: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.75)'}}>
        <Img src={src(id, 'velvet')} style={{position: 'absolute', left: -300, top: -cy0, width: 1080, height: 1920}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.3) 0 20px, rgba(255,255,255,0.06) 20px 44px)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 200, color: G.gold, textShadow: `0 0 30px rgba(${G.goldRgb},0.6)`}}>?</div>
      </div>
      <Lines t={t} at={reveal ? [-1, -1, -1] : at} wrong={wrong} right={right} />
      {live ? <Countdown t={t} at={cd} stop={stop} y={1570} /> : null}
      {live ? <Stop t={t} at={stop} y={760} /> : null}
    </>
  );
};

export const Pouces: React.FC<AnimProps> = ({id, lt, p}) => {
  const shrink = Number(p.shrink ?? 1.4);
  const k = prog(lt, shrink, shrink + 0.6, easeInOut);
  const fr = prog(lt, 0.1, 0.45, easeOut), en = prog(lt, 0.35, 0.7, easeOut);
  const Bar: React.FC<{y: number; u: number; label: string; kk: number; red?: boolean}> = ({y, u, label, kk, red}) => (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <rect x={110} y={y} width={u * 5 * kk} height={46} fill={red ? 'rgba(255,74,74,0.88)' : `rgba(${G.goldRgb},0.92)`} stroke="#0C0A06" strokeWidth={3} />
        {Array.from({length: 6}, (_, i) => <line key={i} x1={110 + i * u} y1={y} x2={110 + i * u} y2={y + (i % 5 ? 24 : 46)} stroke="#0C0A06" strokeWidth={3} opacity={kk} />)}
      </svg>
      <div style={{position: 'absolute', left: 110, top: y - 56, fontFamily: GF.label, fontWeight: 700, fontSize: 36, color: red ? RED : G.gold, opacity: kk, letterSpacing: '0.06em'}}>{label}</div>
    </>
  );
  const m = lerp(1.69, 1.58, k);
  const h = 620 * (m / 1.69), w = h * ASPECT;
  return (
    <>
      <Bar y={470} u={27.07 * 4.2} label="POUCE FRANÇAIS · 2,71 CM" kk={fr} />
      <Bar y={610} u={25.4 * 4.2} label="POUCE ANGLAIS · 2,54 CM" kk={en} red />
      <Img src={src(id, 'napo_cut')} style={{position: 'absolute', left: 820 - w / 2, top: 1290 - h, width: w, height: h, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.8))'}} />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <line x1={700} y1={1290 - 620} x2={950} y2={1290 - 620} stroke={GREEN} strokeWidth={4} strokeDasharray="14 10" opacity={k} />
      </svg>
      <div style={{position: 'absolute', left: 90, top: 820, fontFamily: GF.sans, fontWeight: 900, fontSize: 140, color: k > 0.5 ? RED : G.gold, lineHeight: 1}}>{m.toFixed(2).replace('.', ',')} m</div>
      {k > 0 ? <div style={{position: 'absolute', left: 100, top: 990, fontFamily: GF.label, fontWeight: 700, fontSize: 70, color: RED, transform: `scale(${pop(lt, shrink + 0.45)})`, transformOrigin: 'left center'}}>−11 CM</div> : null}
    </>
  );
};

export const NAPOLEON = {Toise, Pouces};
