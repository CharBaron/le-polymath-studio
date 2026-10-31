// Les personnages de « TERMINUS » (même squelette que stick.tsx : Pose, angles en degrés, 0 = vers le bas, 90 = vers la droite).
// TOI : sweat gris à capuche, casque audio jaune autour du cou, sac à dos rouge, cheveux bruns, jean noir, baskets blanches.
// Reconnaissable dans toutes les lumières : `light.amb` assombrit vers la teinte de la scène sans perdre les couleurs, `light.rim`
// ajoute un liseré (néon, écran du téléphone). Passagers : la dame qui dort, l'homme à l'imperméable, l'usager (trop grand, trop maigre).
import React from 'react';
import {lerp} from '../theme';
import type {Light} from './hero';
import {mixHex, Pose} from './stick';

const rad = (d: number) => (d * Math.PI) / 180;
const seg = (x: number, y: number, a: number, L: number): [number, number] => [x + Math.sin(rad(a)) * L, y + Math.cos(rad(a)) * L];
type Pt = [number, number];
type K = {arm?: number; leg?: number; torso?: number; head?: number};

/** squelette de stick.tsx avec des longueurs réglables (l'usager a les bras trop longs) */
export const bonesK = (p: Pose, h: number, k: K = {}) => {
  const T = 0.34 * h * (k.torso ?? 1), N = 0.05 * h, R = 0.088 * h * (k.head ?? 1);
  const UA = 0.175 * h * (k.arm ?? 1), FA = 0.16 * h * (k.arm ?? 1), TH = 0.225 * h * (k.leg ?? 1), SH = 0.215 * h * (k.leg ?? 1);
  const hip: Pt = [0, 0];
  const neck = seg(0, 0, 180 - p.torso, T);
  const headC = seg(neck[0], neck[1], 180 - p.torso - p.head, N + R);
  const sh = seg(0, 0, 180 - p.torso, T * 0.9);
  const eL = seg(sh[0], sh[1], p.aL, UA), hL = seg(eL[0], eL[1], p.aL + p.aLb, FA);
  const eR = seg(sh[0], sh[1], p.aR, UA), hR = seg(eR[0], eR[1], p.aR + p.aRb, FA);
  const kL = seg(0, 0, p.lL, TH), fL = seg(kL[0], kL[1], p.lL + p.lLb, SH);
  const kR = seg(0, 0, p.lR, TH), fR = seg(kR[0], kR[1], p.lR + p.lRb, SH);
  return {hip, neck, headC, R, sh, eL, hL, eR, hR, kL, fL, kR, fR};
};

/** poses assises (vue de profil, tournée vers la droite) ; la hanche est posée sur l'assise */
export const SP = {
  sit: {torso: -4, head: 2, aL: 26, aLb: 58, aR: 34, aRb: 54, lL: 84, lLb: -86, lR: 90, lRb: -92},
  phone: {torso: 6, head: 24, aL: 30, aLb: 82, aR: 38, aRb: 76, lL: 84, lLb: -86, lR: 90, lRb: -92},
  tense: {torso: -8, head: -6, aL: 18, aLb: 40, aR: 26, aRb: 36, lL: 82, lLb: -84, lR: 88, lRb: -90},
  sleep: {torso: -10, head: -30, aL: 30, aLb: 52, aR: 38, aRb: 46, lL: 86, lLb: -86, lR: 92, lRb: -92},
  read: {torso: -4, head: 6, aL: 58, aLb: 78, aR: 66, aRb: 70, lL: 80, lLb: -70, lR: 92, lRb: -96},
  lean: {torso: 20, head: 26, aL: 10, aLb: 24, aR: 18, aRb: 30, lL: 86, lLb: -88, lR: 92, lRb: -96},
  stand: {torso: 0, head: 0, aL: -8, aLb: 4, aR: 8, aRb: -4, lL: -6, lLb: 0, lR: 6, lRb: 0},
  standStill: {torso: 0, head: 8, aL: -3, aLb: 0, aR: 3, aRb: 0, lL: -3, lLb: 0, lR: 3, lRb: 0},
} satisfies Record<string, Pose>;

export type Look = {
  skin: string; top: string; topDark: string; legs: string; shoes: string; line: string;
  hair?: string; hairStyle?: 'rider' | 'bun' | 'wet' | 'none'; hat?: string; scarf?: string;
  coat?: boolean; thin?: number; k?: K;
};
export const LOOKS = {
  // toi
  rider: {skin: '#F1EBDD', top: '#9399A1', topDark: '#6C7179', legs: '#25272F', shoes: '#F1EEE6', line: '#1E1C1B', hair: '#3A2A20', hairStyle: 'rider'},
  // la dame qui dort : manteau bordeaux, écharpe crème, chignon gris
  dame: {skin: '#EADFCF', top: '#7C2F3B', topDark: '#58202A', legs: '#2E2E37', shoes: '#3A2A22', line: '#1F1A19', hair: '#B8B2A8', hairStyle: 'bun', scarf: '#DCCDA8', coat: true},
  // l'homme à l'imperméable : trench beige, chapeau, journal
  imper: {skin: '#E8DDCB', top: '#B49C6E', topDark: '#8A7650', legs: '#3A3A42', shoes: '#1E1A18', line: '#221E19', hat: '#2C2927', hairStyle: 'none', coat: true},
  // l'usager / le quatrième : trop grand, bras trop longs, peau grise, cheveux mouillés sur le visage
  usager: {skin: '#AAB4AA', top: '#1A221E', topDark: '#111714', legs: '#141A17', shoes: '#0C0E0D', line: '#070908', hair: '#0A0C0B', hairStyle: 'wet', coat: true, thin: 0.72, k: {arm: 1.32, leg: 1.1, torso: 1.12, head: 0.92}},
} satisfies Record<string, Look>;
const BAG = {bag: '#B3392F', bagDark: '#7C241E', cup: '#F5A623', cupDark: '#B8741A', band: '#1E1E22'};

export type FigureProps = {
  look: Look; p: Pose; x: number; y: number; h: number; flip?: boolean; light?: Light; opacity?: number;
  /** y de la hanche par rapport à (x, y) : 0 = assis (hanche sur l'assise), défaut = debout (pieds en y) */
  hipY?: number;
  /** TOI : sac à dos et casque (par défaut si look = rider) */
  gear?: boolean;
  /** téléphone dans la main droite : 0 = rien, 1 = allumé (lueur) */
  phone?: number;
  /** journal tenu devant le visage (l'homme à l'imperméable) */
  paper?: boolean;
  /** doigts trop longs (l'usager) */
  fingers?: number;
};

export const Figure: React.FC<FigureProps> = ({look, p, x, y, h, flip = false, light = {}, opacity = 1, hipY, gear, phone = 0, paper, fingers = 0}) => {
  const b = bonesK(p, h, look.k);
  const amb = light.amb ?? 1, tint = light.tint ?? '#141626';
  const L = (c: string) => (amb >= 1 ? c : mixHex(c, tint, 1 - amb));
  const back = (c: string) => mixHex(L(c), '#000000', 0.18);
  const line = L(look.line);
  const thin = look.thin ?? 1;
  const w = 0.05 * h * thin, o = Math.max(1.6, 0.011 * h);
  const pts = (a: Pt[]) => a.map((q) => q.join(',')).join(' ');
  const R = b.R;
  const rider = gear ?? look.hairStyle === 'rider';
  // buste en trapèze arrondi le long de l'axe hanche → épaules
  const dx = b.sh[0] - b.hip[0], dy = b.sh[1] - b.hip[1];
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const hb: Pt = [b.hip[0] - ux * 0.035 * h, b.hip[1] - uy * 0.035 * h];
  const st: Pt = [b.sh[0] + ux * 0.012 * h, b.sh[1] + uy * 0.012 * h];
  const bw = 0.075 * h * (thin < 1 ? 0.8 : 1), sw = 0.088 * h * (thin < 1 ? 0.85 : 1);
  const body: Pt[] = [[hb[0] + nx * bw, hb[1] + ny * bw], [st[0] + nx * sw, st[1] + ny * sw], [st[0] - nx * sw, st[1] - ny * sw], [hb[0] - nx * bw, hb[1] - ny * bw]];
  const at = (k: number, side: number, d: number): Pt => [lerp(hb[0], st[0], k) + nx * d * side, lerp(hb[1], st[1], k) + ny * d * side];
  const arm = (s: Pt, e: Pt, hd: Pt, dark: boolean, k: string) => (
    <g key={k}>
      <polyline points={pts([s, e, hd])} fill="none" stroke={line} strokeWidth={w * 1.12 + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([s, e, hd])} fill="none" stroke={dark ? back(look.top) : L(look.top)} strokeWidth={w * 1.12} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hd[0]} cy={hd[1]} r={w * 0.62 + o} fill={line} />
      <circle cx={hd[0]} cy={hd[1]} r={w * 0.62} fill={dark ? back(look.skin) : L(look.skin)} />
    </g>
  );
  // jambe : la cuisse prend la couleur du manteau quand il descend dessus
  const leg = (k0: Pt, f: Pt, dark: boolean, k: string) => {
    const thigh = look.coat ? look.top : look.legs;
    const c = (s: string) => (dark ? back(s) : L(s));
    return (
      <g key={k}>
        <polyline points={pts([b.hip, k0, f])} fill="none" stroke={line} strokeWidth={w * 1.08 + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts([k0, f])} fill="none" stroke={c(look.legs)} strokeWidth={w * 1.08} strokeLinecap="round" />
        <polyline points={pts([b.hip, k0])} fill="none" stroke={c(thigh)} strokeWidth={w * (look.coat ? 1.5 : 1.08)} strokeLinecap="round" />
        <ellipse cx={f[0] + (flip ? -1 : 1) * 0.014 * h} cy={f[1] + 0.006 * h} rx={w * 0.95} ry={w * 0.5} fill={L(look.shoes)} stroke={line} strokeWidth={o} />
        {rider ? <rect x={f[0] - w * 0.75 + (flip ? -1 : 1) * 0.014 * h} y={f[1] + 0.006 * h + w * 0.18} width={w * 1.5} height={w * 0.28} rx={w * 0.12} fill={L('#C9C3B8')} /> : null}
      </g>
    );
  };
  const rot = p.torso + p.head;
  const H0 = b.headC;
  // cheveux : bruns en bataille avec une mèche (toi), chignon gris, mèches noires mouillées devant le visage (l'usager)
  const hair = look.hairStyle === 'rider' ? (
    <g transform={`translate(${H0[0]},${H0[1]}) rotate(${rot})`}>
      <path d={`M${-R * 1.04} ${R * 0.05} C${-R * 1.12} ${-R * 0.9} ${-R * 0.35} ${-R * 1.28} ${R * 0.25} ${-R * 1.12} C${R * 0.6} ${-R * 1.34} ${R * 1.12} ${-R * 0.8} ${R * 1.06} ${-R * 0.18} L${R * 0.86} ${-R * 0.42} L${R * 0.7} ${-R * 0.1} L${R * 0.42} ${-R * 0.52} L${R * 0.08} ${-R * 0.3} L${-R * 0.3} ${-R * 0.55} L${-R * 0.62} ${-R * 0.2} Z`} fill={L(look.hair!)} stroke={line} strokeWidth={o} strokeLinejoin="round" />
      <path d={`M${-R * 0.4} ${-R * 0.95} Q${R * 0.05} ${-R * 1.1} ${R * 0.5} ${-R * 0.85}`} stroke={mixHex(L(look.hair!), '#ffffff', 0.18)} strokeWidth={o * 0.9} fill="none" opacity={0.7} />
    </g>
  ) : look.hairStyle === 'bun' ? (
    <g transform={`translate(${H0[0]},${H0[1]}) rotate(${rot})`}>
      <path d={`M${-R * 1.03} ${R * 0.1} A${R * 1.03} ${R * 1.03} 0 0 1 ${R * 1.03} ${R * 0.1} Q${R * 0.2} ${-R * 0.35} ${-R * 1.03} ${R * 0.1} Z`} fill={L(look.hair!)} stroke={line} strokeWidth={o} />
      <circle cx={-R * 0.85} cy={-R * 0.7} r={R * 0.42} fill={L(look.hair!)} stroke={line} strokeWidth={o} />
    </g>
  ) : look.hairStyle === 'wet' ? (
    <g transform={`translate(${H0[0]},${H0[1]}) rotate(${rot})`}>
      <path d={`M${-R * 1.1} ${R * 0.2} C${-R * 1.2} ${-R * 1.1} ${R * 1.2} ${-R * 1.25} ${R * 1.12} ${R * 0.1} L${R * 1.18} ${R * 1.9} L${R * 0.82} ${R * 1.4} L${R * 0.62} ${R * 2.2} L${R * 0.3} ${R * 1.3} L${R * 0.02} ${R * 2.4} L${-R * 0.3} ${R * 1.25} L${-R * 0.6} ${R * 2.0} L${-R * 0.85} ${R * 1.1} L${-R * 1.18} ${R * 1.6} Z`} fill={L(look.hair!)} stroke={line} strokeWidth={o} strokeLinejoin="round" />
      {[-0.5, 0.1, 0.62].map((u) => <path key={u} d={`M${u * R} ${-R * 0.6} Q${u * R + R * 0.1} ${R * 0.5} ${u * R - R * 0.05} ${R * 1.6}`} stroke="#3C4A44" strokeWidth={o * 0.8} fill="none" opacity={0.55} />)}
    </g>
  ) : null;
  const hat = look.hat ? (
    <g transform={`translate(${H0[0]},${H0[1]}) rotate(${rot})`}>
      <rect x={-R * 1.55} y={-R * 0.42} width={R * 3.1} height={R * 0.26} rx={R * 0.12} fill={L(look.hat)} stroke={line} strokeWidth={o} />
      <path d={`M${-R * 0.95} ${-R * 0.4} L${-R * 0.85} ${-R * 1.25} Q0 ${-R * 1.5} ${R * 0.85} ${-R * 1.25} L${R * 0.95} ${-R * 0.4} Z`} fill={L(look.hat)} stroke={line} strokeWidth={o} />
      <rect x={-R * 0.95} y={-R * 0.62} width={R * 1.9} height={R * 0.2} fill={mixHex(L(look.hat), '#000000', 0.4)} />
    </g>
  ) : null;
  // TOI : sac à dos (derrière le buste, dépasse des épaules), bretelles, casque autour du cou
  const bag = rider ? (
    <g>
      <polygon points={pts([at(0.1, 1, bw * 1.25), at(1.05, 1, sw * 1.18), at(1.05, -1, sw * 1.18), at(0.1, -1, bw * 1.25)])} fill={L(BAG.bag)} stroke={line} strokeWidth={0.04 * h + 2 * o} strokeLinejoin="round" />
      <polygon points={pts([at(0.1, 1, bw * 1.25), at(1.05, 1, sw * 1.18), at(1.05, -1, sw * 1.18), at(0.1, -1, bw * 1.25)])} fill={L(BAG.bag)} stroke={L(BAG.bag)} strokeWidth={0.04 * h} strokeLinejoin="round" />
      <path d={`M${at(1.12, 1, sw * 0.4).join(' ')} Q${at(1.3, 0, 0).join(' ')} ${at(1.12, -1, sw * 0.4).join(' ')}`} stroke={line} strokeWidth={o * 2.2} fill="none" />
    </g>
  ) : null;
  const straps = rider ? [1, -1].map((s) => (
    <polyline key={s} points={pts([at(1.0, s, sw * 0.62), at(0.55, s, bw * 0.7), at(0.25, s, bw * 0.95)])} stroke={L(BAG.bagDark)} strokeWidth={0.022 * h} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  )) : null;
  const neckP: Pt = [lerp(b.neck[0], H0[0], 0.25), lerp(b.neck[1], H0[1], 0.25)];
  const phones = rider ? (
    <g>
      <path d={`M${neckP[0] + nx * R * 1.0} ${neckP[1] + ny * R * 1.0} Q${neckP[0] + ux * R * 0.55} ${neckP[1] + uy * R * 0.55 + R * 0.1} ${neckP[0] - nx * R * 1.0} ${neckP[1] - ny * R * 1.0}`} stroke={L(BAG.band)} strokeWidth={0.02 * h} fill="none" strokeLinecap="round" />
      {[1, -1].map((s) => (
        <g key={s} transform={`translate(${neckP[0] + nx * R * 0.98 * s - ux * R * 0.15},${neckP[1] + ny * R * 0.98 * s - uy * R * 0.15}) rotate(${p.torso})`}>
          <rect x={-R * 0.32} y={-R * 0.42} width={R * 0.64} height={R * 0.84} rx={R * 0.28} fill={L(BAG.cup)} stroke={line} strokeWidth={o} />
          <rect x={-R * 0.12} y={-R * 0.28} width={R * 0.24} height={R * 0.56} rx={R * 0.1} fill={L(BAG.cupDark)} />
        </g>
      ))}
    </g>
  ) : null;
  // téléphone tenu dans la main droite (écran allumé = petite lueur cyan)
  const tel = rider && phone > 0 ? (
    <g transform={`translate(${b.hR[0]},${b.hR[1]}) rotate(${p.aR + p.aRb - 90})`}>
      <circle cx={0} cy={-0.05 * h} r={0.09 * h} fill="#9FE6FF" opacity={0.35 * phone} filter="url(#b14)" />
      <rect x={-0.016 * h} y={-0.06 * h} width={0.032 * h} height={0.07 * h} rx={0.006 * h} fill="#101216" stroke={line} strokeWidth={o * 0.8} />
      <rect x={-0.012 * h} y={-0.056 * h} width={0.024 * h} height={0.062 * h} rx={0.004 * h} fill="#BFF1FF" opacity={0.9 * phone} />
    </g>
  ) : null;
  const news = paper ? (() => {
    const c: Pt = [lerp(b.hL[0], b.hR[0], 0.5), lerp(b.hL[1], b.hR[1], 0.5)];
    return (
      <g transform={`translate(${c[0]},${c[1]}) rotate(${-8 + p.torso})`}>
        <rect x={-0.03 * h} y={-0.21 * h} width={0.16 * h} height={0.25 * h} fill={L('#E4DFD1')} stroke={line} strokeWidth={o} />
        <rect x={-0.015 * h} y={-0.19 * h} width={0.13 * h} height={0.03 * h} fill={L('#3A3632')} />
        {Array.from({length: 7}, (_, i) => <rect key={i} x={-0.015 * h} y={-0.145 * h + i * 0.024 * h} width={(i % 3 === 2 ? 0.08 : 0.13) * h} height={0.007 * h} fill={L('#8C867C')} />)}
      </g>
    );
  })() : null;
  // doigts trop longs : quatre traits dans le prolongement de l'avant-bras
  const claws = (e: Pt, hd: Pt, k: string) => {
    const a = Math.atan2(hd[1] - e[1], hd[0] - e[0]);
    return (
      <g key={k}>
        {[-0.5, -0.17, 0.17, 0.5].map((d, i) => {
          const aa = a + d * 0.5, Lf = 0.085 * h * fingers * (i === 0 || i === 3 ? 0.8 : 1);
          const x2 = hd[0] + Math.cos(aa) * Lf, y2 = hd[1] + Math.sin(aa) * Lf;
          const xm = hd[0] + Math.cos(aa) * Lf * 0.55 + Math.cos(aa + Math.PI / 2) * Lf * 0.08, ym = hd[1] + Math.sin(aa) * Lf * 0.55 + Math.sin(aa + Math.PI / 2) * Lf * 0.08;
          return <path key={i} d={`M${hd[0]} ${hd[1]} Q${xm} ${ym} ${x2} ${y2}`} stroke={L(look.skin)} strokeWidth={w * 0.28} fill="none" strokeLinecap="round" />;
        })}
      </g>
    );
  };
  const hy = hipY ?? -(0.437 * h * (look.k?.leg ?? 1));
  const rim = light.rim ? (
    <g style={{filter: `drop-shadow(0 0 ${0.025 * h}px ${light.rim})`}} opacity={0.95}>
      {[[b.hip, b.kL, b.fL], [b.hip, b.kR, b.fR], [b.sh, b.eL, b.hL], [b.sh, b.eR, b.hR]].map((q, i) => (
        <polyline key={i} points={pts(q as Pt[])} fill="none" stroke={light.rim} strokeWidth={w * 1.12 + 4 * o} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      <polygon points={pts(body)} fill={light.rim} stroke={light.rim} strokeWidth={0.05 * h + 4 * o} strokeLinejoin="round" />
      <circle cx={H0[0]} cy={H0[1]} r={R * 1.25 + 2 * o} fill={light.rim} />
    </g>
  ) : null;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1) translate(0,${hy})`} opacity={opacity}>
      {rim}
      {bag}
      {leg(b.kL, b.fL, true, 'lL')}
      {arm(b.sh, b.eL, b.hL, true, 'aL')}
      {fingers > 0 ? claws(b.eL, b.hL, 'fL') : null}
      {leg(b.kR, b.fR, false, 'lR')}
      {/* capuche (toi) ou col du manteau, derrière la nuque */}
      <ellipse cx={b.neck[0] - ux * 0.01 * h} cy={b.neck[1] - uy * 0.01 * h} rx={0.075 * h * (thin < 1 ? 0.8 : 1)} ry={0.045 * h} fill={L(look.topDark)} stroke={line} strokeWidth={o} transform={`rotate(${p.torso},${b.neck[0]},${b.neck[1]})`} />
      <polygon points={pts(body)} fill={L(look.top)} stroke={line} strokeWidth={0.05 * h + 2 * o} strokeLinejoin="round" />
      <polygon points={pts(body)} fill={L(look.top)} stroke={L(look.top)} strokeWidth={0.05 * h} strokeLinejoin="round" />
      {rider ? <polyline points={pts([at(0.3, 1, bw * 0.6), at(0.3, -1, bw * 0.6)])} stroke={L(look.topDark)} strokeWidth={o * 1.4} fill="none" strokeLinecap="round" /> : null}
      {look.coat ? <polyline points={pts([at(1.0, 0, 0), at(0.05, 0, 0)])} stroke={L(look.topDark)} strokeWidth={o * 1.2} fill="none" /> : null}
      {straps}
      {look.scarf ? <ellipse cx={neckP[0]} cy={neckP[1] + 0.01 * h} rx={0.07 * h} ry={0.035 * h} fill={L(look.scarf)} stroke={line} strokeWidth={o} transform={`rotate(${p.torso},${neckP[0]},${neckP[1]})`} /> : null}
      <circle cx={H0[0]} cy={H0[1]} r={R + o} fill={line} />
      <circle cx={H0[0]} cy={H0[1]} r={R} fill={L(look.skin)} />
      {hair}
      {hat}
      {phones}
      {arm(b.sh, b.eR, b.hR, false, 'aR')}
      {fingers > 0 ? claws(b.eR, b.hR, 'fR') : null}
      {tel}
      {news}
    </g>
  );
};

/** TOI, avec les bons accessoires */
export const Rider: React.FC<Omit<FigureProps, 'look'>> = (props) => <Figure look={LOOKS.rider} gear {...props} />;
