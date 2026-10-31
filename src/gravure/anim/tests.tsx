// Pièces communes des vidéos « test participatif » (TEST N°3 à 7) : fiche de papier texturé, compte à rebours 3-2-1,
// boutons de réponse, « STOP. » rouge. Tous les temps sont absolus (s), comme les balises du script.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeOut, lerp, overshoot, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

export const src = (id: string, f: string) => staticFile(`v/${id}/img/${f}.webp`);
export const nums = (p: AnimProps['p'], k: string) => (Array.isArray(p[k]) ? (p[k] as number[]) : []);
export const list = (p: AnimProps['p'], k: string) => String(p[k] ?? '').split('|').filter(Boolean);
export const RED = '#FF4A4A';

/** fiche de papier (texture claire du style), bord déchiré simulé par l'ombre, filet d'accent en tête */
export const Paper: React.FC<{id: string; x: number; y: number; w: number; h: number; rot?: number; s?: number; o?: number; ink?: string; children?: React.ReactNode}> = ({id, x, y, w, h, rot = 0, s = 1, o = 1, children}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, opacity: o, transform: `rotate(${rot}deg) scale(${s})`, borderRadius: 4, overflow: 'hidden', boxShadow: '0 22px 40px rgba(0,0,0,0.65), 0 2px 0 rgba(255,255,255,0.18) inset'}}>
    <Img src={src(id, 'marble_white')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translate(${-((x * 7) % 300)}px, ${-((y * 3) % 900)}px)`}} />
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.2), rgba(40,25,10,0.22) 85%)'}} />
    <div style={{position: 'absolute', inset: 12, border: `2px solid rgba(${G.goldRgb},0.55)`}} />
    {children}
  </div>
);

/** 3 · 2 · 1 en grand : chaque chiffre claque à son instant (at), anneau qui se vide ; disparaît à `stop` */
export const Countdown: React.FC<{t: number; at: number[]; stop: number; y?: number}> = ({t, at, stop, y = 1100}) => {
  if (!at.length || t < at[0] - 0.05 || t >= stop) return null;
  let k = 0;
  for (let i = 0; i < at.length; i++) if (t >= at[i] - 0.05) k = i;
  const lt = t - at[k];
  const next = at[k + 1] ?? stop;
  const ring = 1 - clamp01(lt / Math.max(0.3, next - at[k]));
  const s = lerp(1.7, 1, prog(lt, 0, 0.14, easeOut));
  const c = k === at.length - 1 ? RED : G.gold;
  return (
    <div style={{position: 'absolute', left: 540 - 110, top: y - 110, width: 220, height: 220}}>
      <svg width={220} height={220} style={{position: 'absolute', left: 0, top: 0}}>
        <circle cx={110} cy={110} r={96} fill="rgba(8,6,4,0.72)" stroke={`rgba(${G.goldRgb},0.25)`} strokeWidth={8} />
        <circle cx={110} cy={110} r={96} fill="none" stroke={c} strokeWidth={8} strokeDasharray={603} strokeDashoffset={603 * (1 - ring)} transform="rotate(-90 110 110)" strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.sans, fontWeight: 900, fontSize: 130, color: c, transform: `scale(${s})`, textShadow: `0 0 30px ${c}`}}>{at.length - k}</div>
    </div>
  );
};

/** bouton de réponse (gauche de x = 960, zone des boutons TikTok) ; on = choisi, pulse = en attente */
export const Choice: React.FC<{x: number; y: number; w?: number; text: string; on?: number; pulse?: number; red?: boolean; o?: number; size?: number}> = ({x, y, w = 300, text, on = 0, pulse = 0, red, o = 1, size = 52}) => {
  const col = red ? '255,74,74' : G.goldRgb;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - 52, width: w, height: 104, borderRadius: 52, opacity: o, border: `5px solid rgba(${col},${0.6 + 0.4 * Math.max(on, pulse)})`, background: on ? `rgba(${col},${0.9 * on})` : 'rgba(10,8,6,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: size, letterSpacing: '0.08em', color: on > 0.5 ? '#120C06' : G.text, transform: `scale(${1 + 0.06 * pulse + 0.08 * on * (1 - on)})`, boxShadow: on ? `0 0 40px rgba(${col},${0.75 * on})` : 'none', whiteSpace: 'nowrap'}}>{text}</div>
  );
};

/** « STOP. » rouge qui claque */
export const Stop: React.FC<{t: number; at: number; y?: number; text?: string}> = ({t, at, y = 700, text = 'STOP.'}) =>
  t < at ? null : (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 220, color: RED, transform: `scale(${lerp(1.6, 1, prog(t, at, at + 0.14, easeOut))})`, opacity: prog(t, at, at + 0.08), textShadow: '0 0 40px rgba(255,60,60,0.6), 0 10px 30px rgba(0,0,0,0.9)'}}>{text}</div>
  );

/** consigne en capitales sous le titre (y ≈ 330 : le HUD est au-dessus) */
export const Order: React.FC<{text: string; k: number; y?: number; size?: number; color?: string}> = ({text, k, y = 330, size = 46, color}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: 60, right: 60, top: y, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: size, lineHeight: 1.25, letterSpacing: '0.1em', color: color ?? G.gold, opacity: k, transform: `translateY(${(1 - k) * 18}px)`, textShadow: '0 4px 14px rgba(0,0,0,0.9)'}}>
      {text.split('|').map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );

/** trait d'encre rouge qui s'écrit (cercle, rature) : d = chemin SVG, k = avancement */
export const InkStroke: React.FC<{d: string; k: number; w?: number; color?: string}> = ({d, k, w = 9, color = RED}) =>
  k <= 0 ? null : (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
      <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 * (1 - k)} />
    </svg>
  );

export const pop = (t: number, at: number, d = 0.18) => prog(t, at - 0.04, at - 0.04 + d, overshoot);
