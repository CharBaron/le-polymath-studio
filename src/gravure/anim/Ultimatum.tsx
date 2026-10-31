// Animations sur mesure de la vidéo 33 (le jeu de l'ultimatum), style or (marbre noir, Massys).
// Partage : dix billets gravés de 10 € (guillochis, rosace, hachures) sur la table ; à `split`, l'inconnu en garde
//   neuf (LUI · 90 €) et en pousse un vers toi (TOI · 10 €) ; ACCEPTER / REFUSER ; 3-2-1.
//   reveal : REFUSER s'allume, les dix billets brûlent, LUI · 0 € / TOI · 0 €. freezeAt : image figée (boucle).
// Insula : la planche du cerveau de Gray ; l'insula s'allume en vert bile, étiquette « DÉGOÛT ».
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs} from './ink';
import {Choice, Countdown, nums, pop, RED, src} from './tests';

const BW = 300, BH = 150;
/** billet de 10 € gravé : papier crème, cadre double, guillochis, rosace, « 10 » aux coins */
const Bill: React.FC<{x: number; y: number; rot: number; s?: number; burn?: number; k: number}> = ({x, y, rot, s = 1, burn = 0, k}) => (
  <div style={{position: 'absolute', left: x - BW / 2, top: y - BH / 2, width: BW, height: BH, transform: `rotate(${rot}deg) scale(${s})`, opacity: 1 - clamp01((burn - 0.6) / 0.4), filter: burn ? `sepia(${burn}) brightness(${1 - 0.85 * burn}) contrast(${1 + 1.5 * burn})` : undefined, boxShadow: '0 10px 18px rgba(0,0,0,0.55)'}}>
    <svg width={BW} height={BH} viewBox={`0 0 ${BW} ${BH}`}>
      <InkDefs p={`b${k}`} ink="#3A2A0E" />
      <rect x={0} y={0} width={BW} height={BH} fill="#EADBB0" />
      <rect x={0} y={0} width={BW} height={BH} fill={`url(#b${k}-hl)`} opacity={0.35} />
      <rect x={8} y={8} width={BW - 16} height={BH - 16} fill="none" stroke="#3A2A0E" strokeWidth={2.5} />
      <rect x={14} y={14} width={BW - 28} height={BH - 28} fill="none" stroke="#8A6A22" strokeWidth={1.2} />
      {Array.from({length: 18}, (_, i) => (
        <ellipse key={i} cx={BW / 2} cy={BH / 2} rx={44} ry={20} fill="none" stroke="#6B4E16" strokeWidth={0.8} transform={`rotate(${i * 10} ${BW / 2} ${BH / 2})`} opacity={0.75} />
      ))}
      <circle cx={BW / 2} cy={BH / 2} r={22} fill="#EADBB0" stroke="#3A2A0E" strokeWidth={1.5} />
      <text x={BW / 2} y={BH / 2 + 9} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={26} fill="#3A2A0E">€</text>
      {[[30, 44], [BW - 30, 44], [30, BH - 18], [BW - 30, BH - 18]].map(([cx, cy], i) => <text key={i} x={cx} y={cy} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={900} fontSize={30} fill="#3A2A0E">10</text>)}
      <rect x={0} y={0} width={BW} height={BH} fill={`url(#b${k}-hx)`} opacity={0.12} />
    </svg>
    {burn > 0 ? <div style={{position: 'absolute', inset: -6, background: `radial-gradient(ellipse at ${30 + 40 * rand(k)}% 100%, rgba(255,150,40,${0.9 * Math.sin(Math.PI * clamp01(burn))}) 0%, rgba(255,60,0,0) 70%)`, mixBlendMode: 'screen'}} /> : null}
  </div>
);

const pile = (i: number) => ({x: 540 + (rand(i * 3.3) - 0.5) * 40, y: 800 - i * 6, rot: (rand(i * 7.1) - 0.5) * 14});
const his = (i: number) => ({x: 300 + (i % 3) * 230 + (rand(i) - 0.5) * 20, y: 520 + Math.floor(i / 3) * 34, rot: (rand(i * 2.1) - 0.5) * 18});
const mine = {x: 540, y: 960, rot: -4};

export const Partage: React.FC<AnimProps> = ({id, t: tNow, lt, p}) => {
  const reveal = !!p.reveal;
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined && !reveal;
  const show = Number(p.show ?? 0.5), split = reveal ? -1e9 : Number(p.split ?? 1e9), btn = reveal ? -1e9 : Number(p.btn ?? 1e9);
  const cd = nums(p, 'cd');
  const burnAt = reveal ? Number(p.burn ?? 1e9) : 1e9;
  const burn = prog(t, burnAt, burnAt + 0.7);
  const refuse = reveal ? prog(lt, 0.05, 0.25) : 0;
  const lab = (txt: string, y: number, on: number, col: string) => (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 48, letterSpacing: '0.12em', color: col, opacity: on, textShadow: '0 4px 12px rgba(0,0,0,0.95)'}}>{txt}</div>
  );
  const zero = burn > 0.5;
  // la règle expliquée : ACCEPTER s'allume, puis REFUSER (et le partage passe à 0 € en fantôme)
  const acc = Number(p.acc ?? 1e9), ref = Number(p.ref ?? 1e9), ask = Number(p.ask ?? 1e9);
  const accOn = live && t >= acc && t < ref ? prog(t, acc, acc + 0.15) * 0.75 : 0;
  const refOn = live && t >= ref && t < ask ? prog(t, ref, ref + 0.15) * 0.75 : 0;
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.3}}>
        <Img src={src(id, 'couple_plein')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 45%, rgba(8,6,3,0.25) 25%, rgba(8,6,3,0.92) 85%)'}} />
      {Array.from({length: 10}, (_, i) => {
        const a = pile(i), dest = i < 9 ? his(i) : mine;
        const k = prog(t, split + i * 0.05, split + i * 0.05 + 0.4, easeInOut);
        const inK = pop(t, show + i * 0.04, 0.2);
        return inK > 0 ? <Bill key={i} k={i} x={lerp(a.x, dest.x, k)} y={lerp(a.y, dest.y, k) - (1 - inK) * 300} rot={lerp(a.rot, dest.rot, k)} s={lerp(1.3, 1, inK)} burn={burn} /> : null;
      })}
      {t < split + 0.3 && live ? lab('100 €', 590, pop(t, show + 0.5), G.gold) : null}
      {lab(zero ? 'LUI · 0 €' : refOn ? 'LUI · 90 € → 0 €' : 'LUI · 90 €', 330, prog(t, split + 0.3, split + 0.6), zero || refOn ? RED : G.gold)}
      {lab(zero ? 'TOI · 0 €' : refOn ? 'TOI · 10 € → 0 €' : 'TOI · 10 €', 1060, prog(t, split + 0.5, split + 0.8), zero || refOn ? RED : G.text)}
      <Choice x={300} y={1210} w={360} text="ACCEPTER" o={prog(t, btn, btn + 0.2)} on={accOn} pulse={live && t > ask ? 0.5 + 0.5 * Math.sin(t * 9) : 0} size={44} />
      <Choice x={720} y={1210} w={360} text="REFUSER" red o={prog(t, btn, btn + 0.2)} on={Math.max(refuse, refOn)} pulse={live && t > ask ? 0.5 + 0.5 * Math.sin(t * 9 + 1.5) : 0} size={44} />
      {live ? <Countdown t={t} at={cd} stop={cd.length ? cd[cd.length - 1] + 0.7 : 0} y={1570} /> : null}
    </>
  );
};

export const Insula: React.FC<AnimProps> = ({id, lt, p}) => {
  const glow = Number(p.glow ?? 0.8);
  const W = 880, H = Math.round((W * 520) / 898), x0 = 540 - W / 2, y0 = 760 - H / 2;
  const g = prog(lt, glow, glow + 0.4, easeOut), pulse = g * (0.75 + 0.25 * Math.sin(lt * 9));
  const cx = x0 + 0.5 * W, cy = y0 + 0.55 * H;
  return (
    <>
      <div style={{position: 'absolute', left: x0, top: y0, width: W, filter: 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))'}}>
        <Img src={src(id, 'insula')} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', left: cx - 170, top: cy - 90, width: 340, height: 180, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(170,220,40,${0.85 * pulse}) 0%, rgba(120,170,20,${0.5 * pulse}) 45%, rgba(80,120,0,0) 75%)`, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: cx - 170, top: cy - 90, width: 340, height: 180, borderRadius: '50%', border: `5px dashed rgba(190,240,60,${g})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1060, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 60, letterSpacing: '0.12em', color: '#C8F04A', opacity: g, transform: `scale(${pop(lt, glow + 0.2)})`, textShadow: '0 4px 14px rgba(0,0,0,0.95)'}}>INSULA · DÉGOÛT</div>
    </>
  );
};

export const ULTIMATUM = {Partage, Insula};
