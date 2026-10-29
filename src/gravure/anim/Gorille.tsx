// Animations sur mesure de la vidéo 19 (le gorille invisible), style labo :
// TestPasses : 3 maillots blancs + 3 maillots noirs se passent chacun un ballon ; exactement `passes` passes blanches entre
//   `go` et `stop` (temps absolus, calés sur la voix) ; un gorille (carte gravée) traverse au milieu. reveal : arrêt sur image
//   du gorille au centre, cerclé en rouge.
// Scanner : radio des poumons, une minuscule tumeur et un gorille 48 fois plus gros, presque transparent, qui apparaît.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

const INK = '#081426';
const SKIN = '#D6E2EC';

type P = {x: number; y: number};
const homes = (i: number): P => ({x: 540 + Math.cos((i / 6) * Math.PI * 2 + 0.4) * 300, y: 820 + Math.sin((i / 6) * Math.PI * 2 + 0.4) * 230});
/** position d'un joueur à l'instant tt : petite ellipse autour de sa place */
const pos = (i: number, tt: number): P => {
  const h = homes(i);
  return {x: h.x + 70 * Math.sin(0.8 * tt + i * 1.7), y: h.y + 45 * Math.cos(1.05 * tt + i * 2.3)};
};
const Player: React.FC<{p: P; white: boolean; tt: number; i: number}> = ({p, white, tt, i}) => {
  const sw = Math.sin(tt * 7 + i) * 12;
  const jersey = white ? '#F2F7FB' : '#0B1626', line = white ? INK : '#9FC4DE';
  return (
    <g transform={`translate(${p.x} ${p.y})`}>
      <path d={`M -14 50 L ${-20 + sw} 120 M 14 50 L ${20 - sw} 120`} stroke={line} strokeWidth={9} strokeLinecap="round" />
      <path d={`M -34 -22 L ${-56} ${30 - sw * 0.6} M 34 -22 L 56 ${30 + sw * 0.6}`} stroke={line} strokeWidth={8} strokeLinecap="round" />
      <path d="M -34 -34 Q 0 -44 34 -34 L 30 56 Q 0 62 -30 56 Z" fill={jersey} stroke={line} strokeWidth={4} />
      <circle cx={0} cy={-64} r={24} fill={SKIN} stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Ball: React.FC<{p: P}> = ({p}) => (
  <g transform={`translate(${p.x} ${p.y})`}>
    <circle r={19} fill="#E8823A" stroke="#3A1A06" strokeWidth={3} />
    <path d="M -19 0 H 19 M 0 -19 V 19 M -13 -13 Q 0 0 -13 13 M 13 -13 Q 0 0 13 13" stroke="#3A1A06" strokeWidth={2} fill="none" />
  </g>
);
/** ballon passé `passes` fois dans [a, b] entre les joueurs `team` (indices) : vol 60 % du temps, en main le reste */
const ballAt = (tt: number, a: number, b: number, passes: number, team: number[]): P => {
  const D = (b - a) / passes;
  const u = clamp01((tt - a) / (b - a)) * passes;
  const k = Math.min(passes - 1, Math.floor(u));
  const f = u - k;
  const from = team[k % team.length], to = team[(k + 1) % team.length];
  const pa = pos(from, tt), pb = pos(to, tt);
  const hand = (q: P) => ({x: q.x, y: q.y - 10});
  if (tt < a) return hand(pa);
  if (tt >= b) return hand(pos(team[passes % team.length], tt));
  const v = clamp01(f / 0.6);
  const e = easeInOut(v);
  void D;
  return {x: lerp(hand(pa).x, hand(pb).x, e), y: lerp(hand(pa).y, hand(pb).y, e) - Math.sin(Math.PI * v) * 130};
};

export const TestPasses: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const go = Number(p.go), stop = Number(p.stop), passes = Number(p.passes ?? 11);
  const reveal = !!p.reveal;
  const g0 = go + (stop - go) * 0.28, g1 = go + (stop - go) * 0.82; // fenêtre du gorille
  const gm = (g0 + g1) / 2;
  const tt = reveal ? gm : p.freezeAt !== undefined ? Number(p.freezeAt) : t; // freezeAt : image figée (1re et dernière image, boucle)
  const W = [0, 2, 4], B = [1, 3, 5];
  // gorille : entre par la droite, s'arrête au centre et se frappe la poitrine, sort par la gauche
  const gu = clamp01((tt - g0) / (g1 - g0));
  const gx = gu < 0.35 ? lerp(1240, 560, easeOut(gu / 0.35)) : gu < 0.65 ? 560 : lerp(560, -200, (gu - 0.65) / 0.35);
  const thump = gu > 0.35 && gu < 0.65 ? Math.sin(tt * 28) * 6 : 0;
  const gy = 800 + Math.abs(Math.sin(tt * 6)) * -14;
  const show = tt > g0 && tt < g1;
  const rk = reveal ? prog(lt, 0.1, 0.6, easeOut) : 0;
  const testOn = !reveal && p.freezeAt === undefined && t >= go - 0.2 && t < stop + 0.3;
  return (
    <>
      {show ? (
        <div style={{position: 'absolute', left: gx + thump, top: gy, width: 300, transform: `translate(-50%, -50%) rotate(${thump * 0.6}deg)`}}>
          <Img src={staticFile(`v/${id}/img/gorille_test.webp`)} style={{width: '100%', display: 'block'}} />
        </div>
      ) : null}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        {[0, 1, 2, 3, 4, 5].map((i) => <Player key={i} p={pos(i, tt)} white={W.includes(i)} tt={tt} i={i} />)}
        <Ball p={ballAt(tt, go + 0.05, stop - 0.15, passes, W)} />
        <Ball p={ballAt(tt + 0.37, go + 0.3, stop - 0.05, passes - 2, B)} />
        {reveal && rk > 0 ? <ellipse cx={560} cy={800} rx={200 + 40 * (1 - rk)} ry={230 + 40 * (1 - rk)} fill="none" stroke="#FF3B30" strokeWidth={10} strokeDasharray="1600" strokeDashoffset={1600 * (1 - rk)} /> : null}
      </svg>
      {testOn ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 40, letterSpacing: '0.16em', color: G.gold}}>
          COMPTE LES PASSES · MAILLOTS BLANCS
        </div>
      ) : null}
      {reveal ? <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 52, letterSpacing: '0.12em', color: '#FF3B30', opacity: rk}}>IL ÉTAIT LÀ.</div> : null}
    </>
  );
};

/** radio des poumons : tumeur minuscule (à `nodAt`), puis le gorille 48 fois plus gros (à `gorAt`), puis les étiquettes */
export const Scanner: React.FC<AnimProps> = ({id, lt, p}) => {
  const nodAt = Number(p.nodAt ?? 0.3), gorAt = Number(p.gorAt ?? 1.2);
  const nk = prog(lt, nodAt, nodAt + 0.3, easeOut), gk = prog(lt, gorAt, gorAt + 0.6, easeOut);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 780, width: 700, transform: 'translate(-50%, -50%)'}}>
        <Img src={staticFile(`v/${id}/img/xray_zoom.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', left: 470, top: 720, width: 150, transform: 'translate(-50%, -50%)', opacity: 0.38 * gk, mixBlendMode: 'screen', filter: 'invert(1) grayscale(1) contrast(1.4)'}}>
        <Img src={staticFile(`v/${id}/img/gorille_test.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <circle cx={640} cy={920} r={7} fill="#FFFFFF" opacity={nk} />
        <circle cx={640} cy={920} r={7 + 30 * (1 - nk)} fill="none" stroke="#FF3B30" strokeWidth={4} opacity={nk} />
        <path d="M 652 930 L 760 1010 H 880" stroke="#FF3B30" strokeWidth={3} fill="none" opacity={nk} />
        <rect x={392} y={630} width={156} height={180} fill="none" stroke={G.gold} strokeWidth={4} strokeDasharray="14 10" opacity={gk} />
        <path d="M 392 640 L 280 560 H 170" stroke={G.gold} strokeWidth={3} fill="none" opacity={gk} />
      </svg>
      <div style={{position: 'absolute', left: 770, top: 1016, fontFamily: GF.label, fontWeight: 700, fontSize: 30, color: '#FF3B30', opacity: nk}}>TUMEUR ×1</div>
      <div style={{position: 'absolute', left: 120, top: 504, fontFamily: GF.label, fontWeight: 700, fontSize: 30, color: G.gold, opacity: gk}}>GORILLE ×48</div>
    </>
  );
};

export const GORILLE = {TestPasses, Scanner};
