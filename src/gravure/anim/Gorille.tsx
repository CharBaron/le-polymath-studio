// Animations sur mesure de la vidéo 19 (le gorille invisible), style labo.
// TestPasses : vrais joueurs de basket de 1894 (Université du Minnesota) détourés ; l'équipe noire = les mêmes, assombris ;
//   profondeur (plus haut = plus loin = plus petit, tri par y, ombres au sol) ; exactement `passes` passes blanches entre
//   `go` et `stop` ; un gorille gravé (Brehm) assombri comme l'équipe noire traverse parmi eux, en partie caché.
//   reveal : arrêt sur image, le gorille s'éclaire, cerclé de rouge. freezeAt : image figée (boucle).
// Scanner : radio des poumons, une minuscule tumeur, et un gorille 48 fois plus gros incrusté dans le poumon.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {clamp01, easeInOut, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';

type P = {x: number; y: number};
const SPR: Record<string, [number, number]> = {joueur_a: [205, 572], joueur_b: [230, 575], joueur_c: [200, 540], joueur_d: [218, 524]};
const TEAM = [
  {img: 'joueur_a', white: true, flip: false}, {img: 'joueur_d', white: false, flip: true},
  {img: 'joueur_c', white: true, flip: true}, {img: 'joueur_b', white: false, flip: false},
  {img: 'joueur_b', white: true, flip: false}, {img: 'joueur_a', white: false, flip: true},
];
const Y0 = 700, Y1 = 1180; // profondeur du terrain (pieds)
const homes = (i: number): P => ({x: 540 + Math.cos((i / 6) * Math.PI * 2 + 0.4) * 300, y: 940 + Math.sin((i / 6) * Math.PI * 2 + 0.4) * 190});
const pos = (i: number, tt: number): P => {
  const h = homes(i);
  return {x: h.x + 80 * Math.sin(0.75 * tt + i * 1.7), y: h.y + 50 * Math.cos(1.0 * tt + i * 2.3)};
};
const depth = (y: number) => 0.62 + 0.38 * clamp01((y - Y0) / (Y1 - Y0)); // échelle selon la profondeur
const HUMAN_H = 470;                                                       // hauteur d'un joueur au premier plan
const hand = (q: P): P => ({x: q.x, y: q.y - HUMAN_H * depth(q.y) * 0.55});

/** ballon : passé `passes` fois dans [a, b] entre les joueurs `team` ; vol sur 60 % du temps */
const ballAt = (tt: number, a: number, b: number, passes: number, team: number[]): P => {
  const u = clamp01((tt - a) / (b - a)) * passes;
  const k = Math.min(passes - 1, Math.floor(u)), f = u - k;
  const pa = hand(pos(team[k % team.length], tt)), pb = hand(pos(team[(k + 1) % team.length], tt));
  if (tt < a) return pa;
  if (tt >= b) return hand(pos(team[passes % team.length], tt));
  const v = clamp01(f / 0.6), e = easeInOut(v);
  return {x: lerp(pa.x, pb.x, e), y: lerp(pa.y, pb.y, e) - Math.sin(Math.PI * v) * 150};
};
const Ball: React.FC<{p: P; s: number}> = ({p, s}) => (
  <svg style={{position: 'absolute', left: p.x - 40 * s, top: p.y - 40 * s, overflow: 'visible'}} width={80 * s} height={80 * s} viewBox="-40 -40 80 80">
    <defs>
      <radialGradient id="bl" cx="-0.3" cy="-0.35" r="1.1" gradientUnits="objectBoundingBox" fx="0.35" fy="0.3">
        <stop offset="0" stopColor="#F2A15C" /><stop offset="0.6" stopColor="#C8642A" /><stop offset="1" stopColor="#5E2508" />
      </radialGradient>
    </defs>
    <circle r={21} fill="url(#bl)" stroke="#2A1004" strokeWidth={2.5} />
    <path d="M -21 0 H 21 M 0 -21 V 21 M -14 -15 Q -2 0 -14 15 M 14 -15 Q 2 0 14 15" stroke="#2A1004" strokeWidth={1.8} fill="none" />
    <ellipse cx={-7} cy={-9} rx={6} ry={3.5} fill="#FFE2C4" opacity={0.5} transform="rotate(-30)" />
  </svg>
);

export const TestPasses: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const go = Number(p.go), stop = Number(p.stop), passes = Number(p.passes ?? 11);
  const reveal = !!p.reveal;
  const g0 = go + (stop - go) * 0.3, g1 = go + (stop - go) * 0.78; // fenêtre du gorille
  const gm = g0 + (g1 - g0) * 0.5;
  const tt = reveal ? gm : p.freezeAt !== undefined ? Number(p.freezeAt) : t;
  const W = [0, 2, 4], B = [1, 3, 5];
  // le gorille : entre par la droite derrière les joueurs, s'arrête, se frappe la poitrine, sort par la gauche
  const gu = clamp01((tt - g0) / (g1 - g0));
  const gx = gu < 0.38 ? lerp(1180, 600, easeOut(gu / 0.38)) : gu < 0.62 ? 600 : lerp(600, -140, (gu - 0.62) / 0.38);
  const gy = 900, thump = gu > 0.38 && gu < 0.62 ? Math.sin(tt * 30) : 0;
  const rk = reveal ? prog(lt, 0.15, 0.6, easeOut) : 0;
  const testOn = !reveal && p.freezeAt === undefined && t >= Math.max(go - 0.2, 3.05) && t < stop + 0.3;
  type Item = {y: number; el: React.ReactNode};
  const items: Item[] = TEAM.map((m, i) => {
    const q = pos(i, tt), s = depth(q.y), [w0, h0] = SPR[m.img], h = HUMAN_H * s, w = (w0 / h0) * h;
    const bob = Math.abs(Math.sin(tt * 6 + i)) * 8 * s;
    return {y: q.y, el: (
      <div key={`j${i}`}>
        <div style={{position: 'absolute', left: q.x - w * 0.42, top: q.y - 10 * s, width: w * 0.84, height: 22 * s, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(6px)'}} />
        <Img src={staticFile(`v/${id}/img/${m.img}.webp`)} style={{position: 'absolute', left: q.x - w / 2, top: q.y - h - bob, width: w, height: h, transform: `scaleX(${m.flip ? -1 : 1})`, filter: m.white ? 'brightness(1.08) contrast(1.05)' : 'brightness(0.24) contrast(1.4) saturate(0.6)'}} />
      </div>
    )};
  });
  if (tt > g0 && tt < g1) {
    const s = depth(gy), h = 400 * s, w = (360 / 470) * h;
    items.push({y: gy, el: (
      <div key="g">
        <div style={{position: 'absolute', left: gx - w * 0.45, top: gy - 12, width: w * 0.9, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', filter: 'blur(6px)'}} />
        <Img src={staticFile(`v/${id}/img/gorille_cut.webp`)} style={{position: 'absolute', left: gx - w / 2, top: gy - h - Math.abs(Math.sin(tt * 5)) * 10, width: w, height: h, transform: `scaleX(-1) rotate(${thump * 3}deg) scale(${1 + Math.abs(thump) * 0.03})`, filter: reveal ? `brightness(${lerp(0.26, 1.1, rk)}) contrast(1.2)` : 'brightness(0.26) contrast(1.35) saturate(0.6)'}} />
      </div>
    )});
  }
  items.sort((a, b) => a.y - b.y);
  const bw = ballAt(tt, go + 0.05, stop - 0.15, passes, W), bb = ballAt(tt + 0.37, go + 0.3, stop - 0.05, passes - 2, B);
  return (
    <>
      {items.map((it) => it.el)}
      <Ball p={bw} s={depth(bw.y + 250)} />
      <Ball p={bb} s={depth(bb.y + 250)} />
      {reveal && rk > 0 ? (
        <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
          <ellipse cx={600} cy={900 - 400 * depth(900) * 0.5} rx={210 + 40 * (1 - rk)} ry={260 + 40 * (1 - rk)} fill="none" stroke="#FF3B30" strokeWidth={11} strokeDasharray="1800" strokeDashoffset={1800 * (1 - rk)} />
        </svg>
      ) : null}
      {testOn ? <div style={{position: 'absolute', left: 0, right: 0, top: 305, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 40, lineHeight: 1.3, letterSpacing: '0.1em', color: G.gold}}>COMPTE LES PASSES<br />DES MAILLOTS BLANCS</div> : null}
      {reveal ? <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: GF.label, fontWeight: 700, fontSize: 64, letterSpacing: '0.1em', color: '#FF3B30', opacity: rk}}>IL ÉTAIT LÀ.</div> : null}
    </>
  );
};

/** radio des poumons : tumeur minuscule (à `nodAt`), puis le gorille 48 fois plus gros (à `gorAt`), étiquettes lisibles */
export const Scanner: React.FC<AnimProps> = ({id, lt, p}) => {
  const nodAt = Number(p.nodAt ?? 0.3), gorAt = Number(p.gorAt ?? 1.2);
  const nk = prog(lt, nodAt, nodAt + 0.3, easeOut), gk = prog(lt, gorAt, gorAt + 0.6, easeOut);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 800, width: 760, transform: 'translate(-50%, -50%)'}}>
        <Img src={staticFile(`v/${id}/img/xray_zoom.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <div style={{position: 'absolute', left: 455, top: 735, width: 190, transform: 'translate(-50%, -50%)', opacity: 0.8 * gk, mixBlendMode: 'multiply', filter: 'grayscale(1) contrast(1.3)'}}>
        <Img src={staticFile(`v/${id}/img/gorille_cut.webp`)} style={{width: '100%', display: 'block'}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920}>
        <circle cx={655} cy={955} r={7} fill="#FFFFFF" opacity={nk} />
        <circle cx={655} cy={955} r={7 + 34 * (1 - nk)} fill="none" stroke="#FF3B30" strokeWidth={5} opacity={nk} />
        <path d="M 667 965 L 740 1060 H 800" stroke="#FF3B30" strokeWidth={4} fill="none" opacity={nk} />
        <rect x={355} y={610} width={200} height={250} fill="none" stroke={G.gold} strokeWidth={5} strokeDasharray="16 10" opacity={gk} />
        <path d="M 355 620 L 260 540 H 120" stroke={G.gold} strokeWidth={4} fill="none" opacity={gk} />
      </svg>
      <div style={{position: 'absolute', left: 600, top: 1070, fontFamily: GF.label, fontWeight: 700, fontSize: 48, color: '#FF3B30', opacity: nk}}>TUMEUR ×1</div>
      <div style={{position: 'absolute', left: 90, top: 470, fontFamily: GF.label, fontWeight: 700, fontSize: 48, color: G.gold, opacity: gk}}>GORILLE ×48</div>
    </>
  );
};

export const GORILLE = {TestPasses, Scanner};
