// Le perso récurrent de « Dernier étage » : bonnet rouge à pompon, sweat moutarde à capuche, jean, tête ronde sans visage.
// Même squelette que stick.tsx (Pose, bones), mais habillé, et éclairé sans perdre ses couleurs : `light.amb` assombrit vers
// la teinte de la scène (nuit bleue, aube orangée), `light.rim` ajoute un liseré lumineux (contre-jour, lune, lampe).
import React from 'react';
import {lerp} from '../theme';
import {bones, Look, mixHex, P, Pose, Stick} from './stick';

export const HERO = {
  skin: '#F1EBDD', beanie: '#D8382E', band: '#A92A22', pom: '#F6F0E4', hoodie: '#E4A63C', hoodieDark: '#B47A22', jeans: '#344262', shoes: '#1C1C22', line: '#2A231D',
};
export type Light = {amb?: number; tint?: string; rim?: string; rimW?: number};

/** cycle de marche à pieds posés : renvoie la pose, le rebond vertical et l'avance par cycle (en fraction de h) */
export const stride = (phase: number, amp = 24, base: Pose = P.stand) => {
  const a = phase * Math.PI * 2, s = Math.sin(a), c = Math.cos(a);
  const pose: Pose = {
    ...base,
    torso: base.torso + 3 + 1.5 * Math.cos(2 * a),
    head: base.head - 2 * Math.cos(2 * a),
    lL: amp * s, lLb: -Math.max(0, c) * amp * 1.7,
    lR: -amp * s, lRb: -Math.max(0, -c) * amp * 1.7,
    aL: base.aL - amp * 0.8 * s, aLb: 10 + 12 * Math.max(0, s),
    aR: base.aR + amp * 0.8 * s, aRb: -10 - 12 * Math.max(0, -s),
  };
  return {pose, bob: -Math.abs(Math.cos(a)) * 0.018 + 0.009, adv: 2 * 0.44 * Math.sin((amp * Math.PI) / 180) * 2};
};
/** respiration au repos : petit balancement du buste et de la tête */
export const breathe = (p: Pose, t: number, k = 1): Pose => ({...p, torso: p.torso + 1.2 * k * Math.sin(t * 1.7), head: p.head + 2 * k * Math.sin(t * 1.7 - 0.6), aL: p.aL - 1.5 * k * Math.sin(t * 1.7), aR: p.aR + 1.5 * k * Math.sin(t * 1.7)});

export const Hero: React.FC<{p: Pose; x: number; y: number; h: number; flip?: boolean; light?: Light; hipY?: number; opacity?: number; hands?: React.ReactNode}> = ({p, x, y, h, flip = false, light = {}, hipY, opacity = 1, hands}) => {
  const b = bones(p, h);
  const amb = light.amb ?? 1, tint = light.tint ?? '#141626';
  const L = (c: string) => (amb >= 1 ? c : mixHex(c, tint, 1 - amb));
  const back = (c: string) => mixHex(L(c), '#000000', 0.16);
  const line = L(HERO.line);
  const w = 0.05 * h, o = Math.max(1.6, 0.011 * h);
  const pts = (a: [number, number][]) => a.map((q) => q.join(',')).join(' ');
  const R = b.R;
  // buste : sweat en trapèze arrondi le long de l'axe hanche → épaules
  const dx = b.sh[0] - b.hip[0], dy = b.sh[1] - b.hip[1];
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const hb = [b.hip[0] - ux * 0.035 * h, b.hip[1] - uy * 0.035 * h];
  const st = [b.sh[0] + ux * 0.012 * h, b.sh[1] + uy * 0.012 * h];
  const body = [
    [hb[0] + nx * 0.07 * h, hb[1] + ny * 0.07 * h], [st[0] + nx * 0.085 * h, st[1] + ny * 0.085 * h],
    [st[0] - nx * 0.085 * h, st[1] - ny * 0.085 * h], [hb[0] - nx * 0.07 * h, hb[1] - ny * 0.07 * h],
  ] as [number, number][];
  const pocket = [[lerp(hb[0], st[0], 0.3) + nx * 0.045 * h, lerp(hb[1], st[1], 0.3) + ny * 0.045 * h], [lerp(hb[0], st[0], 0.3) - nx * 0.045 * h, lerp(hb[1], st[1], 0.3) - ny * 0.045 * h]] as [number, number][];
  // bras : manche (sweat) jusqu'au poignet, main ronde ; jambes : jean, chaussure
  const arm = (s: [number, number], e: [number, number], hd: [number, number], dark: boolean, k: string) => (
    <g key={k}>
      <polyline points={pts([s, e, hd])} fill="none" stroke={line} strokeWidth={w * 1.12 + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([s, e, hd])} fill="none" stroke={dark ? back(HERO.hoodie) : L(HERO.hoodie)} strokeWidth={w * 1.12} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={hd[0]} cy={hd[1]} r={w * 0.62 + o} fill={line} />
      <circle cx={hd[0]} cy={hd[1]} r={w * 0.62} fill={dark ? back(HERO.skin) : L(HERO.skin)} />
    </g>
  );
  const leg = (k0: [number, number], f: [number, number], dark: boolean, k: string) => (
    <g key={k}>
      <polyline points={pts([b.hip, k0, f])} fill="none" stroke={line} strokeWidth={w * 1.08 + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([b.hip, k0, f])} fill="none" stroke={dark ? back(HERO.jeans) : L(HERO.jeans)} strokeWidth={w * 1.08} strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={f[0] + (flip ? -1 : 1) * 0.012 * h} cy={f[1] + 0.006 * h} rx={w * 0.85} ry={w * 0.5} fill={L(HERO.shoes)} stroke={line} strokeWidth={o} />
    </g>
  );
  // bonnet : tourné comme la tête (rotation = buste + tête)
  const rot = p.torso + p.head;
  const beanie = (
    <g transform={`translate(${b.headC[0]},${b.headC[1]}) rotate(${rot})`}>
      <path d={`M${-R * 1.04} ${-R * 0.08} A${R * 1.04} ${R * 1.04} 0 0 1 ${R * 1.04} ${-R * 0.08} Z`} fill={L(HERO.beanie)} stroke={line} strokeWidth={o} />
      {[-0.55, -0.15, 0.25, 0.62].map((u) => <path key={u} d={`M${u * R} ${-R * 0.22} Q${u * R + R * 0.06} ${-R * 0.7} ${u * R * 0.6} ${-R * 0.98}`} stroke={back(HERO.beanie)} strokeWidth={o * 0.8} fill="none" opacity={0.7} />)}
      <rect x={-R * 1.12} y={-R * 0.3} width={R * 2.24} height={R * 0.36} rx={R * 0.16} fill={L(HERO.band)} stroke={line} strokeWidth={o} />
      <circle cx={0} cy={-R * 1.12} r={R * 0.3} fill={L(HERO.pom)} stroke={line} strokeWidth={o} />
    </g>
  );
  const hy = hipY ?? -(0.437 * h);
  const rim = light.rim ? (
    <g style={{filter: `drop-shadow(0 0 ${0.025 * h}px ${light.rim})`}} opacity={0.95}>
      <polyline points={pts([b.hip, b.kL, b.fL])} fill="none" stroke={light.rim} strokeWidth={w * 1.08 + 4 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([b.hip, b.kR, b.fR])} fill="none" stroke={light.rim} strokeWidth={w * 1.08 + 4 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([b.sh, b.eL, b.hL])} fill="none" stroke={light.rim} strokeWidth={w * 1.12 + 4 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts([b.sh, b.eR, b.hR])} fill="none" stroke={light.rim} strokeWidth={w * 1.12 + 4 * o} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={pts(body)} fill={light.rim} stroke={light.rim} strokeWidth={0.05 * h + 4 * o} strokeLinejoin="round" />
      <circle cx={b.headC[0]} cy={b.headC[1]} r={R * 1.2 + 2 * o} fill={light.rim} />
    </g>
  ) : null;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1) translate(0,${hy})`} opacity={opacity}>
      {rim}
      {leg(b.kL, b.fL, true, 'lL')}
      {arm(b.sh, b.eL, b.hL, true, 'aL')}
      {leg(b.kR, b.fR, false, 'lR')}
      {/* capuche derrière la nuque */}
      <ellipse cx={b.neck[0] - ux * 0.01 * h} cy={b.neck[1] - uy * 0.01 * h} rx={0.075 * h} ry={0.045 * h} fill={L(HERO.hoodieDark)} stroke={line} strokeWidth={o} transform={`rotate(${p.torso},${b.neck[0]},${b.neck[1]})`} />
      <polygon points={pts(body)} fill={L(HERO.hoodie)} stroke={line} strokeWidth={0.05 * h + 2 * o} strokeLinejoin="round" />
      <polygon points={pts(body)} fill={L(HERO.hoodie)} stroke={L(HERO.hoodie)} strokeWidth={0.05 * h} strokeLinejoin="round" />
      <polyline points={pts(pocket)} stroke={L(HERO.hoodieDark)} strokeWidth={o * 1.4} fill="none" strokeLinecap="round" />
      <circle cx={b.headC[0]} cy={b.headC[1]} r={R + o} fill={line} />
      <circle cx={b.headC[0]} cy={b.headC[1]} r={R} fill={L(HERO.skin)} />
      {beanie}
      {arm(b.sh, b.eR, b.hR, false, 'aR')}
      {hands}
    </g>
  );
};

/** bonhomme générique (V1) ou perso récurrent (V2) : les scènes partagées choisissent avec `hero` */
export const Person: React.FC<{hero?: boolean; p: Pose; x: number; y: number; h: number; flip?: boolean; hipY?: number; look?: Look; shade?: number; light?: Light; opacity?: number}> = ({hero, look, shade, light, ...rest}) =>
  hero ? <Hero {...rest} light={light} /> : <Stick {...rest} look={look} shade={shade} />;

/** le perso vu de dessus (rations, table) : bonnet rouge, épaules du sweat, avant-bras vers (lx, ly) et (rx, ry) */
export const HeroTop: React.FC<{x: number; y: number; s: number; l: [number, number]; r: [number, number]}> = ({x, y, s, l, r}) => {
  // épaules, puis bras à deux segments : le coude part vers l'extérieur (lecture plus naturelle vue de dessus)
  const sh: [number, number][] = [[x - 0.7 * s, y + 0.12 * s], [x + 0.7 * s, y + 0.12 * s]];
  const limb = (a: [number, number], c: [number, number], side: number, k: string) => {
    const L = 1.25 * s, d = Math.min(Math.hypot(c[0] - a[0], c[1] - a[1]), L * 1.98);
    const mx = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
    const bend = Math.sqrt(Math.max(0, L * L - (d / 2) * (d / 2))) * 0.9;
    const nx = -(c[1] - a[1]) / (d || 1), ny = (c[0] - a[0]) / (d || 1);
    const e: [number, number] = [mx + nx * bend * side, my + ny * bend * side];
    const pts = `${a[0]},${a[1]} ${e[0]},${e[1]} ${c[0]},${c[1]}`;
    return (
      <g key={k}>
        <polyline points={pts} stroke={HERO.line} strokeWidth={0.28 * s + 6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} stroke={HERO.hoodie} strokeWidth={0.28 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={c[0]} cy={c[1]} r={0.17 * s + 3} fill={HERO.line} />
        <circle cx={c[0]} cy={c[1]} r={0.17 * s} fill={HERO.skin} />
      </g>
    );
  };
  return (
    <g>
      <ellipse cx={x} cy={y + 0.4 * s} rx={1.0 * s} ry={0.6 * s} fill="rgba(0,0,0,0.35)" filter="url(#b14)" />
      <path d={`M${x - 0.9 * s} ${y + 0.6 * s} Q${x - 0.95 * s} ${y - 0.05 * s} ${x} ${y - 0.12 * s} Q${x + 0.95 * s} ${y - 0.05 * s} ${x + 0.9 * s} ${y + 0.6 * s} Z`} fill={HERO.hoodie} stroke={HERO.line} strokeWidth={5} />
      <path d={`M${x - 0.42 * s} ${y + 0.1 * s} Q${x} ${y + 0.62 * s} ${x + 0.42 * s} ${y + 0.1 * s}`} fill={HERO.hoodieDark} stroke={HERO.line} strokeWidth={4} />
      {limb(sh[0], l, -1, 'l')}
      {limb(sh[1], r, 1, 'r')}
      <circle cx={x} cy={y} r={0.46 * s + 4} fill={HERO.line} />
      <circle cx={x} cy={y} r={0.46 * s} fill={HERO.beanie} />
      <circle cx={x} cy={y} r={0.3 * s} fill="none" stroke={HERO.band} strokeWidth={0.06 * s} opacity={0.7} />
      <circle cx={x} cy={y - 0.02 * s} r={0.15 * s + 3} fill={HERO.line} />
      <circle cx={x} cy={y - 0.02 * s} r={0.15 * s} fill={HERO.pom} />
    </g>
  );
};
