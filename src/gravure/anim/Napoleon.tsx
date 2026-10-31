// Animations sur mesure de la vidéo 32 (la taille de Napoléon), style empire (vert impérial, abeilles d'or).
// Toise : une toise gravée (1,40 → 1,90 m) ; Napoléon (David, 1812, détouré) en ombre chinoise, la tête cachée par un
//   rideau « ? » ; les trois réponses (A 1,57 · B 1,69 · C 1,80) se tracent à leur instant ; 3-2-1, « STOP. ».
//   reveal : le rideau se lève, Napoléon s'éclaire, la ligne A est barrée, la B s'allume. freezeAt : image figée.
// Pouces : un pouce français (2,707 cm) contre un pouce anglais (2,54 cm), 62 pouces chacun ; Napoléon converti
//   « à l'anglaise » rapetisse de 1,69 à 1,58 m (−11 cm).
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Countdown, nums, pop, RED, src, Stop} from './tests';

const FLOOR = 1180, PX_M = 560; // sol (y) et pixels par mètre au-dessus de 1,00 m
const yOf = (m: number) => FLOOR - (m - 1.0) * PX_M * 1.0 - 0; // 1,00 m au sol de l'image : seule la tête compte
const TOP = (m: number) => yOf(m) - 0;
const RULER_X = 170;
const NAPO_W = 515, NAPO_H = 1780; // boîte de napo_cut (px source)

/** toise gravée : réglette de bois avec graduations tous les 1 cm, chiffres tous les 10 cm */
const Ruler: React.FC<{from?: number; to?: number}> = ({from = 1.3, to = 1.9}) => (
  <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
    <defs>
      <linearGradient id="wood" x1="0" x2="1">
        <stop offset="0" stopColor="#5A3A1C" /><stop offset="0.5" stopColor="#9C6B36" /><stop offset="1" stopColor="#4A2E14" />
      </linearGradient>
      <pattern id="grain" width="6" height="40" patternUnits="userSpaceOnUse"><path d="M 3 0 Q 5 20 3 40" stroke="rgba(30,15,5,0.35)" strokeWidth="1.2" fill="none" /></pattern>
    </defs>
    <rect x={RULER_X - 46} y={TOP(to) - 30} width={92} height={FLOOR - TOP(to) + 30} fill="url(#wood)" stroke="#1E1208" strokeWidth={3} />
    <rect x={RULER_X - 46} y={TOP(to) - 30} width={92} height={FLOOR - TOP(to) + 30} fill="url(#grain)" />
    {Array.from({length: Math.round((to - from) * 100) + 1}, (_, i) => {
      const m = from + i / 100, y = TOP(m), big = i % 10 === 0, mid = i % 5 === 0;
      return <line key={i} x1={RULER_X + 46} y1={y} x2={RULER_X + 46 - (big ? 40 : mid ? 26 : 14)} y2={y} stroke="#F3E2B8" strokeWidth={big ? 3.5 : 1.8} />;
    })}
    {Array.from({length: Math.round((to - from) * 10) + 1}, (_, i) => {
      const m = from + i / 10;
      return <text key={i} x={RULER_X - 40} y={TOP(m) + 10} fill="#F3E2B8" fontFamily="Georgia, serif" fontWeight={700} fontSize={26}>{m.toFixed(1).replace('.', ',')}</text>;
    })}
  </svg>
);

/** Napoléon détouré, mis à l'échelle pour que sa tête touche `m` mètres ; dark = ombre chinoise */
const Napo: React.FC<{id: string; m: number; x?: number; dark: number; glow?: number}> = ({id, m, x = 600, dark, glow = 0}) => {
  const h = FLOOR - TOP(m) + (1.0 * PX_M); // le corps entier : du sol à la tête (le sol est à 1,00 m sous FLOOR)
  const hh = (m / (m - 1.0 + 1e-6)) * 0 + h; // (lisibilité)
  const w = (NAPO_W / NAPO_H) * hh;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: TOP(m), width: w, height: hh, overflow: 'visible'}}>
      <Img src={src(id, 'napo_cut')} style={{width: w, height: hh * (1 + 1.0 * PX_M / Math.max(1, FLOOR - TOP(m))) * 0 + hh, filter: `brightness(${lerp(1, 0.04, dark)}) contrast(${lerp(1.05, 1.6, dark)}) drop-shadow(0 0 ${30 * glow}px rgba(${G.goldRgb},${0.8 * glow}))`}} />
    </div>
  );
};

const OPTS: [string, number][] = [['A', 1.57], ['B', 1.69], ['C', 1.8]];

const Lines: React.FC<{t: number; at: number[]; wrong?: number; right?: number}> = ({t, at, wrong = 1e9, right = 1e9}) => (
  <>
    {OPTS.map(([l, m], i) => {
      const k = prog(t, (at[i] ?? 1e9) - 0.05, (at[i] ?? 1e9) + 0.25, easeOut);
      if (k <= 0) return null;
      const y = TOP(m), isW = i === 0, isR = i === 1;
      const strike = isW ? prog(t, wrong, wrong + 0.25, easeOut) : 0, ok = isR ? prog(t, right, right + 0.25, easeOut) : 0;
      const col = ok ? '#7CFF9A' : strike ? RED : G.gold;
      return (
        <div key={l}>
          <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
            <line x1={RULER_X + 50} y1={y} x2={RULER_X + 50 + 700 * k} y2={y} stroke={col} strokeWidth={ok ? 7 : 5} strokeDasharray={ok ? undefined : '18 12'} opacity={0.95} />
          </svg>
          <div style={{position: 'absolute', left: 820, top: y - 46, width: 170, fontFamily: GF.label, fontWeight: 700, fontSize: 40, color: col, opacity: k, textShadow: '0 3px 10px rgba(0,0,0,0.9)', textDecoration: strike > 0.5 ? 'line-through' : 'none', textDecorationThickness: 5}}>
            {l} · {m.toFixed(2).replace('.', ',')}
          </div>
        </div>
      );
    })}
  </>
);

export const Toise: React.FC<AnimProps> = ({id, t: tNow, lt, p}) => {
  const at = nums(p, 'at'), cd = nums(p, 'cd'), stop = Number(p.stop ?? 1e9);
  const reveal = !!p.reveal;
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined && !reveal;
  const lift = reveal ? prog(lt, 0.15, 0.6, easeInOut) : 0;
  const wrong = reveal ? Number(p.wrong) : 1e9, right = reveal ? Number(p.right) : 1e9;
  const light = reveal ? prog(lt, 0.3, 0.8, easeOut) : 0;
  const curtainY = TOP(1.9) - 40, curtainH = TOP(1.5) - curtainY;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.22}}>
        <Img src={src(id, 'david_plein')} style={{width: '100%', height: '100%', filter: 'blur(3px)'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(6,14,8,0.2) 30%, rgba(6,14,8,0.9) 90%)'}} />
      <Ruler />
      <Napo id={id} m={1.69} dark={1 - light} glow={reveal ? prog(t, right, right + 0.3) : 0} />
      {/* rideau « ? » qui cache la tête (et donc la réponse) */}
      <div style={{position: 'absolute', left: 300, top: curtainY - lift * 900, width: 560, height: curtainH, overflow: 'hidden', borderRadius: 8, boxShadow: '0 20px 40px rgba(0,0,0,0.7)', opacity: 1 - lift * 0.3}}>
        <Img src={src(id, 'velvet')} style={{position: 'absolute', left: -300, top: -curtainY, width: 1080, height: 1920}} />
        <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0 18px, rgba(255,255,255,0.05) 18px 40px)'}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 260, color: G.gold, textShadow: `0 0 30px rgba(${G.goldRgb},0.6)`}}>?</div>
      </div>
      <Lines t={t} at={reveal ? [0, 0, 0] : at} wrong={wrong} right={right} />
      {live ? <Countdown t={t} at={cd} stop={stop} y={1420} /> : null}
      {live ? <Stop t={t} at={stop} y={1300} /> : null}
    </>
  );
};

export const Pouces: React.FC<AnimProps> = ({id, lt, p}) => {
  const shrink = Number(p.shrink ?? 1.4);
  const k = prog(lt, shrink, shrink + 0.6, easeInOut);
  const fr = prog(lt, 0.1, 0.45, easeOut), en = prog(lt, 0.4, 0.75, easeOut);
  const unit = 2.707 * 12, unitE = 2.54 * 12; // px pour un pouce (à l'échelle des réglettes)
  const Bar: React.FC<{y: number; u: number; label: string; k: number; red?: boolean}> = ({y, u, label, k: kk, red}) => (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <rect x={150} y={y} width={u * 6 * kk} height={44} fill={red ? 'rgba(255,74,74,0.85)' : `rgba(${G.goldRgb},0.9)`} stroke="#120C06" strokeWidth={3} />
        {Array.from({length: 7}, (_, i) => <line key={i} x1={150 + i * u} y1={y} x2={150 + i * u} y2={y + (i % 6 ? 22 : 44)} stroke="#120C06" strokeWidth={3} opacity={kk} />)}
      </svg>
      <div style={{position: 'absolute', left: 150, top: y - 58, fontFamily: GF.label, fontWeight: 700, fontSize: 36, color: red ? RED : G.gold, opacity: kk, letterSpacing: '0.06em'}}>{label}</div>
    </>
  );
  const m = lerp(1.69, 1.58, k);
  const S = 0.58, ox = 860;
  const h = 1050 * S * (m / 1.69);
  return (
    <>
      <Bar y={500} u={unit} label="POUCE FRANÇAIS · 2,71 CM" k={fr} />
      <Bar y={640} u={unitE} label="POUCE ANGLAIS · 2,54 CM" k={en} red />
      <div style={{position: 'absolute', left: ox - (h * NAPO_W) / NAPO_H / 2, top: 1300 - h, width: (h * NAPO_W) / NAPO_H, height: h}}>
        <Img src={src(id, 'napo_cut')} style={{width: '100%', height: '100%', filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.8))'}} />
      </div>
      <div style={{position: 'absolute', left: 90, top: 860, fontFamily: GF.sans, fontWeight: 900, fontSize: 130, color: k > 0.5 ? RED : G.gold, lineHeight: 1}}>{m.toFixed(2).replace('.', ',')} m</div>
      {k > 0 ? <div style={{position: 'absolute', left: 100, top: 1010, fontFamily: GF.label, fontWeight: 700, fontSize: 64, color: RED, transform: `scale(${pop(lt, shrink + 0.45)})`, transformOrigin: 'left center'}}>−11 CM</div> : null}
      {void clamp01}
    </>
  );
};

export const NAPOLEON = {Toise, Pouces};
