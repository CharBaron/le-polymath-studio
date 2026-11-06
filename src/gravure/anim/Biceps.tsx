// Animations sur mesure de la vidéo 46 (le biceps), style écorché : planche d'anatomie dessinée en code, comme Vésale et Albinus.
// Bras : bras droit de profil, os + muscles gravés (fibres, hachures). L'avant-bras pivote au coude et tire le biceps, qui gonfle.
//   flex, hard, peel, off, twist = clés [t, v, t, v…] (s absolus) : plié 0-1, biceps dur 0-1, biceps soulevé pour montrer le brachial,
//   biceps éteint (gris), rotation du poignet. ghost : avant-bras imaginé (pointillé doré). phone : le téléphone en main. ring : doigt qui touche.
// Jauge : cadran de dynamomètre gravé ; val = clés de force en %, shot = instant du coup de feu (pistolet gravé, éclair de bouche).
// Vis : vis et tournevis gravés qui tournent. Crack : os qui se fend à `at` (humérus ou colonne). Eclair : décharges sur la photo de Duchenne.
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {clamp01, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Engraved, InkDefs, Shade} from './ink';
import {nums, punch, RED, src} from './tests';

const INK = '#2A0E08';
/** clés [t0, v0, t1, v1…] : valeur adoucie au temps t */
export const kf = (t: number, k: number[], d = 0) => {
  if (k.length < 2) return d;
  if (t <= k[0]) return k[1];
  for (let i = 0; i + 3 < k.length; i += 2) if (t < k[i + 2]) return lerp(k[i + 1], k[i + 3], prog(t, k[i], k[i + 2], easeOut));
  return k[k.length - 1];
};

const S: [number, number] = [70, 990], E: [number, number] = [730, 1130]; // le poing reste sous le titre d'accroche (y < 480)
const LEN = Math.hypot(E[0] - S[0], E[1] - S[1]);
const U = [(E[0] - S[0]) / LEN, (E[1] - S[1]) / LEN], N = [U[1], -U[0]]; // N : vers le haut du bras
const A0 = Math.atan2(U[1], U[0]);
const pt = (s: number, n: number): [number, number] => [S[0] + U[0] * s * LEN + N[0] * n, S[1] + U[1] * s * LEN + N[1] * n];
const P = (q: number[]) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;

const lerpP = (a: number[], b: number[], k: number) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

/** les muscles de l'avant-bras et la main, dans le repère de l'avant-bras (x le long de l'os) */
const Forearm: React.FC<{p: string; twist: number; phone?: boolean; ghost?: boolean; o?: number}> = ({p, twist, phone, ghost, o = 1}) => {
  const c = Math.cos(twist * Math.PI), sq = 0.72 + 0.28 * Math.abs(c);
  const ry = lerp(-20, 20, (1 + c) / 2);
  const mass = 'M -10 -56 C 90 -112 250 -92 420 -48 L 560 -38 L 560 38 L 420 52 C 250 96 90 92 -10 56 Z';
  const fibres = [-70, -46, -22, 2, 26, 50, 72].map((y, i) => `M 20 ${y * 0.8} C 160 ${y * 1.12} 330 ${y * 0.82} 556 ${y * 0.4}`);
  return (
    <g opacity={o} style={ghost ? {filter: 'drop-shadow(0 0 12px rgba(255,190,90,0.8))'} : undefined}>
      {ghost ? (
        <g fill="rgba(255,196,90,0.2)" stroke={G.gold} strokeWidth={6} strokeDasharray="20 14">
          <path d={mass} /><path d="M 556 -56 C 630 -92 700 -66 696 0 C 700 62 630 88 556 54 Z" />
        </g>
      ) : (
        <>
          <path d={mass} fill={`url(#${p}-mus)`} />
          <Shade p={p} id="fa" d={mass} box={[-10, -110, 570, 210]} from={[0.5, 1]} to={[0.5, 0.25]} hatch="hd" cross o={0.8} />
          <g fill="none" stroke={INK} strokeWidth={2} opacity={0.55}>{fibres.map((d, i) => <path key={i} d={d} />)}</g>
          <path d={`M 40 ${ry * 0.3} C 200 ${ry * 0.7} 400 ${-ry} 556 ${-ry * 1.1}`} fill="none" stroke="#F0E2C4" strokeWidth={15} strokeLinecap="round" opacity={0.8} />
          <path d={mass} fill="none" stroke={INK} strokeWidth={4} filter={`url(#${p}-wob)`} />
          <g transform={`translate(600 0) scale(1 ${sq})`}>
            <Engraved p={p} id="ha" d="M -46 -56 C 30 -92 110 -76 118 -14 C 124 44 66 84 -46 56 Z" box={[-46, -90, 170, 170]} fill="#C96A52" from={[0.3, 1]} to={[0.6, 0.1]} hatch="hm" stroke={4} ink={INK} />
            {[-46, -16, 14, 44].map((y, i) => <path key={i} d={`M 34 ${y} C 86 ${y - 6} 116 ${y + 2} 112 ${y + 16}`} fill="none" stroke={INK} strokeWidth={3.5} />)}
          </g>
        </>
      )}
      {phone ? (
        <g transform="translate(650 0) rotate(90)">
          <rect x={-74} y={-150} width={148} height={300} rx={20} fill="#17110C" stroke="#E9DCBF" strokeWidth={5} />
          <rect x={-60} y={-132} width={120} height={262} rx={8} fill="#3A2A1C" />
          <rect x={-60} y={-132} width={120} height={262} rx={8} fill={`url(#${p}-hl)`} opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};

/** le bras complet */
export const Arm: React.FC<{flex: number; hard: number; peel: number; off: number; twist: number; ghost?: number; phone?: boolean; ring?: number; p?: string}> = ({flex, hard, peel, off, twist, ghost, phone, ring = 0, p = 'bi'}) => {
  const ang = (f: number) => A0 - (0.22 + 2.25 * f); // angle de l'avant-bras à l'écran
  const a = ang(flex);
  const dir = [Math.cos(a), Math.sin(a)];
  const att = [E[0] + dir[0] * 86, E[1] + dir[1] * 86]; // tubérosité du radius
  const h = lerp(96, 214, clamp01(flex * 0.42 + hard * 0.72)), lift = 300 * peel;
  // bords haut et bas du biceps
  const A = pt(0.03, 62 + lift * 0.5), B = [att[0] + N[0] * lift * 0.1, att[1] + N[1] * lift * 0.1];
  const top = [pt(0.3, h + 48 + lift), pt(0.72, h + 30 + lift)], bot = [pt(0.72, 40 + lift), pt(0.3, 44 + lift)];
  const bic = `M ${P(A)} C ${P(top[0])} ${P(top[1])} ${P(B)} C ${P(bot[0])} ${P(bot[1])} ${P(A)} Z`;
  const fib = [0.16, 0.32, 0.48, 0.64, 0.8].map((k) => `M ${P(A)} C ${P(lerpP(bot[1], top[0], k))} ${P(lerpP(bot[0], top[1], k))} ${P(B)}`);
  const c = (x: number[], y: number[], k: number) => `rgb(${x.map((v, i) => Math.round(lerp(v, y[i], k))).join(',')})`;
  const hi = c(c3(hard, [200, 74, 58], [244, 92, 62]), [150, 146, 138], off), lo = c(c3(hard, [108, 26, 20], [150, 22, 16]), [64, 62, 60], off);
  const brach = `M ${P(pt(0.36, 22))} C ${P(pt(0.56, 150))} ${P(pt(0.9, 130))} ${P([E[0] + dir[0] * 74 + N[0] * 8, E[1] + dir[1] * 74 + N[1] * 8])} C ${P(pt(0.92, 8))} ${P(pt(0.6, -6))} ${P(pt(0.36, 22))} Z`;
  const tri = `M ${P(pt(0.02, -30))} C ${P(pt(0.3, -188))} ${P(pt(0.76, -178))} ${P(pt(1.02, -62))} L ${P(pt(1.0, -18))} L ${P(pt(0.02, -6))} Z`;
  const delt = `M ${P(pt(-0.18, 170))} C ${P(pt(0.05, 230))} ${P(pt(0.26, 120))} ${P(pt(0.32, 30))} C ${P(pt(0.18, -60))} ${P(pt(0.0, -140))} ${P(pt(-0.18, -120))} Z`;
  const box: [number, number, number, number] = [0, 500, 1080, 760];
  const twistA = (k: number) => a * (180 / Math.PI) + k;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${p}-mus`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C4503F" /><stop offset="1" stopColor="#6E1A14" /></linearGradient>
        <linearGradient id={`${p}-bic`} gradientUnits="userSpaceOnUse" x1={pt(0.5, h + 90)[0]} y1={pt(0.5, h + 90 + lift)[1]} x2={pt(0.5, 20)[0]} y2={pt(0.5, 20 + lift)[1]}><stop offset="0" stopColor={hi} /><stop offset="1" stopColor={lo} /></linearGradient>
        <linearGradient id={`${p}-bra`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c([190, 66, 52], [255, 208, 110], peel)} /><stop offset="1" stopColor={c([110, 28, 22], [190, 120, 40], peel)} /></linearGradient>
        <linearGradient id={`${p}-hl`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE6B0" /><stop offset="1" stopColor="#5A3A20" /></linearGradient>
      </defs>
      <InkDefs p={p} ink={INK} />
      <Engraved p={p} id="tri" d={tri} box={box} fill="#8E2C22" from={[0.5, 1]} to={[0.5, 0.5]} hatch="hd" cross stroke={4} ink={INK} />
      <path d={`M ${P(S)} L ${P(E)}`} stroke="#EFE3C8" strokeWidth={62} strokeLinecap="round" />
      <path d={`M ${P(pt(0, 31))} L ${P(pt(1, 31))} M ${P(pt(0, -31))} L ${P(pt(1, -31))}`} stroke={INK} strokeWidth={4} />
      <circle cx={E[0]} cy={E[1]} r={52} fill="#EFE3C8" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${E[0]} ${E[1]}) rotate(${twistA(0)})`}><Forearm p={p} twist={twist} phone={phone} /></g>
      {ghost !== undefined ? <g transform={`translate(${E[0]} ${E[1]}) rotate(${ang(ghost) * 180 / Math.PI})`}><Forearm p={p} twist={0} ghost /></g> : null}
      <Engraved p={p} id="bra" d={brach} box={box} fill={`url(#${p}-bra)`} from={[0.5, 0.95]} to={[0.5, 0.4]} hatch="hm" stroke={peel > 0.5 ? 6 : 4} ink={INK} />
      <g opacity={lerp(1, 0.62, peel)}>
        <path d={bic} fill={`url(#${p}-bic)`} />
        <Shade p={p} id="bic" d={bic} box={[0, 400, 1080, 700]} from={[0.55, 0.92]} to={[0.5, 0.38]} hatch="hd" cross o={0.72} />
        <g fill="none" stroke={INK} strokeWidth={2.4} opacity={0.6}>{fib.map((d, i) => <path key={i} d={d} />)}</g>
        <path d={bic} fill="none" stroke={INK} strokeWidth={5} filter={`url(#${p}-wob)`} />
        <path d={`M ${P(lerpP(A, B, 0.34))} Q ${P(pt(0.5, h * 0.92 + lift))} ${P(lerpP(A, B, 0.66))}`} fill="none" stroke="rgba(255,235,210,0.5)" strokeWidth={9} strokeLinecap="round" opacity={0.25 + 0.75 * hard} transform={`translate(${N[0] * h * 0.42} ${N[1] * h * 0.42})`} />
      </g>
      <Engraved p={p} id="del" d={delt} box={box} fill="#A23A2C" from={[0.1, 0.9]} to={[0.4, 0.2]} hatch="hm" stroke={4} ink={INK} />
      {ring > 0 ? (
        <g transform={`translate(${pt(0.52, h * 0.82)[0]} ${pt(0.52, h * 0.82)[1]})`}>
          <circle r={70 + 24 * Math.sin(ring * 9)} fill="none" stroke="#FFEFC8" strokeWidth={9} opacity={0.95} />
          <circle r={112 + 24 * Math.sin(ring * 9)} fill="none" stroke="#FFEFC8" strokeWidth={4} opacity={0.55} />
        </g>
      ) : null}
    </svg>
  );
};
const c3 = (k: number, a: number[], b: number[]) => a.map((v, i) => lerp(v, b[i], k));

/** légende de planche : filet + mot */
const Tag: React.FC<{text: string; x: number; y: number; tx: number; ty: number; k: number; size?: number; color?: string}> = ({text, x, y, tx, ty, k, size = 66, color = '#6A120C'}) =>
  k <= 0 ? null : (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}><path d={`M ${tx} ${ty} L ${lerp(tx, x, k)} ${lerp(ty, y, k)}`} stroke={color} strokeWidth={5} /><circle cx={tx} cy={ty} r={10} fill={color} /></svg>
      <div style={{position: 'absolute', left: x - 340, width: 680, top: y - size - 6, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: size, color, opacity: clamp01(k * 2)}}>{text}</div>
    </>
  );

const Bras: React.FC<AnimProps> = ({t, t0, t1, p}) => {
  const f = kf(t, nums(p, 'flex'), 0.85), hard = kf(t, nums(p, 'hard'), 0), peel = kf(t, nums(p, 'peel'), 0), off = kf(t, nums(p, 'off'), 0), tw = kf(t, nums(p, 'twist'), 0);
  const pump = p.pump ? 0.14 * Math.sin((t - t0) * 7.5) : 0;
  const wob = p.wob ? 0.05 * Math.sin((t - (p.wob as number)) * 16) * Math.exp(-(t - (p.wob as number)) * 2.4) * (t >= (p.wob as number) ? 1 : 0) : 0;
  const zoom = (p.z as number) ?? 0.05, u = clamp01((t - t0) / (t1 - t0));
  const g = nums(p, 'ghost');
  const ghost = g.length ? 0.55 + 0.42 * (0.5 - 0.5 * Math.cos((t - g[0]) * 3.4)) : undefined;
  const tag = String(p.tag ?? '');
  return (
    <AbsoluteFill style={{transform: `scale(${(1 + zoom * u) * punch(t, nums(p, 'hits'), 0.08)})`, transformOrigin: '50% 48%'}}>
      <Arm flex={clamp01(f + pump)} hard={clamp01(hard + (p.pump ? 0.45 + 0.4 * Math.sin((t - t0) * 7.5) : 0) + wob)} peel={peel} off={off} twist={tw} ghost={ghost} phone={!!p.phone} ring={p.ring !== undefined && t >= (p.ring as number) ? t - (p.ring as number) + 0.01 : 0} />
      {tag ? <Tag text={tag} x={(p.tx as number) ?? 700} y={(p.ty as number) ?? 1270} tx={(p.ax as number) ?? 560} ty={(p.ay as number) ?? 910} k={prog(t, (p.tagAt as number) ?? t0, ((p.tagAt as number) ?? t0) + 0.25, easeOut)} /> : null}
    </AbsoluteFill>
  );
};

/** cadran de dynamomètre + pistolet gravé */
const Jauge: React.FC<AnimProps> = ({t, t0, t1, p}) => {
  const v = kf(t, nums(p, 'val'), 100) + 0.7 * Math.sin(t * 31) * ((p.shiver as number) ?? 1);
  const cx = 540, cy = 880, R = 380; // sous l'étiquette du haut (topLabel, y 360)
  const a = (x: number) => (-210 + ((x - 80) / 60) * 240) * (Math.PI / 180);
  const ticks = Array.from({length: 31}, (_, i) => 80 + i * 2);
  const shot = p.shot as number | undefined;
  const fl = shot !== undefined && t >= shot ? 1 - clamp01((t - shot) / 0.3) : 0;
  const pct = Math.round(kf(t, nums(p, 'val'), 100));
  const na = a(v);
  return (
    <AbsoluteFill style={{transform: `scale(${(1 + 0.04 * clamp01((t - t0) / (t1 - t0))) * punch(t, shot !== undefined ? [shot] : [], 0.12)})`}}>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <defs><radialGradient id="jg" cx="0.42" cy="0.36" r="0.75"><stop offset="0" stopColor="#F4E9D2" /><stop offset="0.8" stopColor="#D8C6A2" /><stop offset="1" stopColor="#8F7A58" /></radialGradient></defs>
        <InkDefs p="jg" ink={INK} />
        <circle cx={cx} cy={cy} r={R + 30} fill="#2A1A10" stroke="#C9A25A" strokeWidth={10} />
        <circle cx={cx} cy={cy} r={R} fill="url(#jg)" />
        <Shade p="jg" id="c" d={`M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0`} box={[cx - R, cy - R, 2 * R, 2 * R]} from={[0.8, 0.95]} to={[0.4, 0.45]} hatch="hm" o={0.45} />
        <path d={`M ${cx + (R - 34) * Math.cos(a(100))} ${cy + (R - 34) * Math.sin(a(100))} A ${R - 34} ${R - 34} 0 0 1 ${cx + (R - 34) * Math.cos(a(140))} ${cy + (R - 34) * Math.sin(a(140))}`} fill="none" stroke="#B22A20" strokeWidth={30} opacity={0.85} />
        {ticks.map((x) => <line key={x} x1={cx + (R - 12) * Math.cos(a(x))} y1={cy + (R - 12) * Math.sin(a(x))} x2={cx + (R - (x % 10 ? 40 : 66)) * Math.cos(a(x))} y2={cy + (R - (x % 10 ? 40 : 66)) * Math.sin(a(x))} stroke={INK} strokeWidth={x % 10 ? 3 : 7} />)}
        {[80, 100, 120, 140].map((x) => <text key={x} x={cx + (R - 116) * Math.cos(a(x))} y={cy + (R - 116) * Math.sin(a(x)) + 20} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={58} fill={INK}>{x}</text>)}
        <path d={`M ${cx + 44 * Math.cos(na + 1.57)} ${cy + 44 * Math.sin(na + 1.57)} L ${cx + (R - 26) * Math.cos(na)} ${cy + (R - 26) * Math.sin(na)} L ${cx + 44 * Math.cos(na - 1.57)} ${cy + 44 * Math.sin(na - 1.57)} L ${cx - 80 * Math.cos(na)} ${cy - 80 * Math.sin(na)} Z`} fill="#B22A20" stroke={INK} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={30} fill="#C9A25A" stroke={INK} strokeWidth={4} />
        <text x={cx} y={cy + 250} textAnchor="middle" fontFamily={GF.serif} fontWeight={900} fontSize={112} fill={pct > 100 ? '#A81E14' : INK}>{pct} %</text>
      </svg>
      {shot !== undefined ? <Pistol t={t} shot={shot} /> : null}
      {fl > 0 ? <AbsoluteFill style={{background: '#FFF4D8', opacity: fl * 0.9}} /> : null}
    </AbsoluteFill>
  );
};

const Pistol: React.FC<{t: number; shot: number}> = ({t, shot}) => {
  const k = prog(t, shot - 1.2, shot - 0.5, easeOut), rec = t >= shot ? 34 * (1 - clamp01((t - shot) / 0.3)) : 0, u = t - shot;
  const gun = 'M 0 -30 L 340 -30 L 356 -16 L 340 6 L 150 8 C 120 30 110 60 60 120 L 0 120 C 10 70 34 40 30 10 L 0 4 Z';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <InkDefs p="pi" ink={INK} />
      <g transform={`translate(${lerp(-520, 10, k) - rec} ${1090 + rec * 0.3}) rotate(${-4 - rec * 0.2}) scale(1.5)`}>
        <Engraved p="pi" id="g" d={gun} box={[0, -30, 356, 150]} fill="#7A6248" from={[0.5, 1]} to={[0.5, 0]} hatch="hd" cross stroke={5} ink={INK} />
        {u >= 0 && u < 0.22 ? <path d={Array.from({length: 18}, (_, i) => { const a = (i / 18) * 6.283, r = i % 2 ? 66 : 210 + 60 * rand(i + 3); return `${i ? 'L' : 'M'} ${376 + r * Math.cos(a)} ${-14 + r * Math.sin(a) * 0.7}`; }).join(' ') + ' Z'} fill="#FFD460" stroke="#B22A20" strokeWidth={7} /> : null}
        {u > 0.05 ? Array.from({length: 8}, (_, i) => <circle key={i} cx={400 + (60 + i * 30) * Math.min(u, 1.6) * 2.4} cy={-20 - i * 8 - 40 * Math.min(u, 1.6)} r={(26 + i * 7) * (0.6 + Math.min(u, 1.6))} fill="rgba(226,216,196,0.34)" />) : null}
      </g>
    </svg>
  );
};

/** vis gravée qui s'enfonce en tournant, tournevis au-dessus */
const Vis: React.FC<AnimProps> = ({t, t0}) => {
  const ph = ((t - t0) * 2.3) % 1, dep = clamp01((t - t0) / 1.8);
  const x = 540, y0 = 560 + 130 * dep;
  const body = `M ${x - 62} ${y0} L ${x + 62} ${y0} L ${x + 62} ${y0 + 480} L ${x} ${y0 + 610} L ${x - 62} ${y0 + 480} Z`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <InkDefs p="vs" ink={INK} />
        <Engraved p="vs" id="w" d="M 40 1010 L 1040 1010 L 1040 1290 L 40 1290 Z" box={[40, 1010, 1000, 280]} fill="#A9875A" from={[0.5, 1]} to={[0.5, 0]} hatch="hh" stroke={5} ink={INK} />
        <g clipPath="url(#vsb)">
          <defs><clipPath id="vsb"><path d={body} /></clipPath></defs>
          <path d={body} fill="#C9C3B4" />
          <Shade p="vs" id="b" d={body} box={[x - 62, y0, 124, 610]} from={[1, 0.5]} to={[0.1, 0.5]} hatch="hm" cross />
          {Array.from({length: 11}, (_, i) => { const y = y0 - 40 + (i + ph) * 62; return <path key={i} d={`M ${x - 76} ${y + 22} L ${x + 76} ${y - 22}`} stroke={INK} strokeWidth={11} />; })}
        </g>
        <path d={body} fill="none" stroke={INK} strokeWidth={5} />
        <path d="M 0 0" />
        <Engraved p="vs" id="h" d={`M ${x - 150} ${y0 - 60} L ${x + 150} ${y0 - 60} L ${x + 80} ${y0 + 8} L ${x - 80} ${y0 + 8} Z`} box={[x - 150, y0 - 60, 300, 68]} fill="#D8D0BE" from={[0.8, 1]} to={[0.2, 0]} hatch="hm" stroke={5} ink={INK} />
        <g transform={`translate(${x} ${y0 - 60})`}>
          <rect x={-18} y={-300} width={36} height={300} fill="#BDB7A8" stroke={INK} strokeWidth={4} />
          <rect x={-58 * Math.abs(Math.cos(ph * 6.283)) - 8} y={-470} width={(58 * Math.abs(Math.cos(ph * 6.283)) + 8) * 2} height={190} rx={22} fill="#8A2A1E" stroke={INK} strokeWidth={5} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** l'os se fend à `at` : ligne de fracture en dents de scie, les 2 morceaux s'écartent */
const Crack: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = p.at as number, name = String(p.img), w = p.w as number, h = p.h as number, fy = (p.fy as number) ?? 0.5;
  const x0 = 540 - w / 2, y0 = (p.y as number ?? 760) - h / 2;
  const k = prog(t, at, at + 0.14, easeOut), sep = 22 * prog(t, at + 0.05, at + 0.4, overshoot);
  const zig = Array.from({length: 11}, (_, i) => [(i / 10) * 100, fy * 100 + (i % 2 ? 2.6 : -2.2) * (1 + rand(i * 3.3))]);
  const top = `polygon(0% 0%, 100% 0%, ${zig.slice().reverse().map((q) => `${q[0]}% ${q[1]}%`).join(', ')})`;
  const bot = `polygon(${zig.map((q) => `${q[0]}% ${q[1]}%`).join(', ')}, 100% 100%, 0% 100%)`;
  const shake = t >= at ? 26 * (1 - clamp01((t - at) / 0.35)) ** 2 : 0;
  const s = 1 + 0.06 * clamp01((t - t0) / (t1 - t0));
  const part = (clip: string, dy: number, r: number) => <Img src={src(id, name)} style={{position: 'absolute', left: x0, top: y0, width: w, height: h, clipPath: clip, transform: `translate(${r * 7}px, ${dy}px) rotate(${r}deg)`}} />;
  return (
    <AbsoluteFill style={{transform: `translate(${(rand(t * 83) - 0.5) * shake}px, ${(rand(t * 47) - 0.5) * shake}px) scale(${s})`, transformOrigin: `50% ${((y0 + h * fy) / 1920) * 100}%`}}>
      {t < at ? <Img src={src(id, name)} style={{position: 'absolute', left: x0, top: y0, width: w, height: h}} /> : <>{part(top, -sep, -1.6 * k)}{part(bot, sep, 1.6 * k)}</>}
      {t >= at ? (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          <circle cx={540} cy={y0 + h * fy} r={120 + 240 * (t - at)} fill="none" stroke={RED} strokeWidth={8} opacity={Math.max(0, 1 - (t - at) * 2.5)} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/** décharges sur la photo de Duchenne : arcs en dents de scie depuis les 2 électrodes, flash blanc */
const Eclair: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = nums(p, 'at');
  const on = at.some((a) => t >= a && t < a + 0.2);
  const fr = Math.floor(t * 30);
  const bolt = (x: number, y: number, seed: number) => {
    let d = `M ${x} ${y}`, cx = x, cy = y;
    for (let i = 0; i < 9; i++) { cx += (rand(seed + i * 3.1 + fr) - 0.5) * 150; cy -= 70 + rand(seed + i * 1.7 + fr) * 50; d += ` L ${cx.toFixed(0)} ${cy.toFixed(0)}`; }
    return d;
  };
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${1.06 + 0.1 * clamp01((t - t0) / (t1 - t0))})`, filter: on ? 'brightness(1.5) contrast(1.2)' : undefined}}><Img src={src(id, 'duchenne')} style={{width: 1080, height: 1920}} /></AbsoluteFill>
      {on ? (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
          {[[420, 900, 1], [660, 920, 7], [540, 1000, 13]].map(([x, y, s]) => <g key={s} fill="none" strokeLinejoin="round"><path d={bolt(x, y, s)} stroke={`rgba(${G.goldHiRgb},0.5)`} strokeWidth={22} /><path d={bolt(x, y, s)} stroke="#FFF9E4" strokeWidth={7} /></g>)}
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const BICEPS = {Bras, Jauge, Vis, Crack, Eclair};
