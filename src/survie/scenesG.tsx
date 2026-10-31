// Scènes du jour 4 (« Dernier étage » — le voisin du 11e) : la grille du sol (l'œil, puis la radio de Lina collée aux lames),
// le test des coups (toi 1 → lui 2, toi 3 → lui 4 : eux répètent, lui compte), la façade et la corde du marché, le panier
// (4 conserves et une balle), le ballon d'eau qui se vide par la colonne et la vanne, le pied-de-biche dans ta porte, la vue
// sous la porte (ses bottes, la radio « LINA »), le fil de messages de Lucas resté sans réponse.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeInOut, easeOut, F, lerp, prog, rand, sp} from '../theme';
import {breathe, Hero, HERO, Light} from './hero';
import {P, Pose, Stick} from './stick';
import {Blurs, Dust, Glow, SceneP, VGrad} from './world';
import {PorteNuit} from './scenesE';
import {SF} from './ui';

const DAY: Light = {amb: 0.78, tint: '#2A2E38'};
const AMB = '#F2A23C', LIME = '#D2F84A', RED = '#FF5A4A', RADIO = '#7DFFB0';
const lab = (x: number, y: number, s: string, c: string, size = 26, o = 1, anchor: 'middle' | 'start' | 'end' = 'middle') => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SF.mono} fontWeight={700} fontSize={size} letterSpacing="4" fill={c} opacity={o}>{s}</text>
);
const on = (T: number, spans: [number, number][]) => spans.some(([a, b]) => T >= a && T < b);
/** caméra : cadre (cx, cy) au centre de l'écran, zoom z */
const camT = (cx: number, cy: number, z: number) => `translate(540,960) scale(${z}) translate(${-cx},${-cy})`;
export type CamKey = [number, number, number, number];
const camAt = (T: number, keys: CamKey[]) => {
  let i = 0;
  while (i + 1 < keys.length && T >= keys[i + 1][0]) i++;
  const a = keys[i], b = keys[i + 1];
  if (!b) return camT(a[1], a[2], a[3]);
  const k = prog(T, a[0], b[0], easeInOut);
  return camT(lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k));
};
/** ondes d'une voix qui monte (ou qui sort d'une fente) */
const Waves: React.FC<{T: number; x: number; y: number; col: string; dir?: number; w?: number}> = ({T, x, y, col, dir = -1, w = 1}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const ph = (T * 1.3 + i / 3) % 1;
      return <ellipse key={i} cx={x} cy={y + dir * ph * 220} rx={(80 + ph * 200) * w} ry={16 + ph * 26} fill="none" stroke={col} strokeWidth={5} opacity={(1 - ph) * 0.75} />;
    })}
  </g>
);
/** la radio de Lina : talkie marine, écran vert, autocollant au feutre rouge */
const Radio: React.FC<{T: number; live: boolean; lit?: number; s?: number}> = ({T, live, lit = 1, s = 1}) => {
  const blink = live ? (Math.floor(T * 6) % 2 ? 1 : 0.55) : 0.35;
  return (
    <g transform={`scale(${s})`}>
      <rect x={-12} y={-330} width={24} height={150} rx={10} fill="#16181C" stroke="#3A3E46" strokeWidth={4} />
      <rect x={-140} y={-200} width={280} height={420} rx={34} fill="#23262C" stroke="#4A4F58" strokeWidth={6} />
      <rect x={-140} y={-200} width={60} height={420} rx={30} fill="#1A1C20" opacity={0.7} />
      <rect x={-100} y={-170} width={200} height={90} rx={10} fill="#0A1A12" stroke="#2E3A34" strokeWidth={4} />
      <rect x={-92} y={-162} width={184} height={74} rx={6} fill={RADIO} opacity={0.18 + 0.5 * blink * lit} />
      <text x={0} y={-112} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={40} fill="#062012" opacity={0.9}>CH 07</text>
      <circle cx={88} cy={-60} r={9} fill={live ? '#FF3A2A' : '#4A1A16'} opacity={blink} />
      {Array.from({length: 5}, (_, r) => Array.from({length: 6}, (_, c) => <circle key={`${r}-${c}`} cx={-75 + c * 30} cy={-30 + r * 30} r={7} fill="#0C0D10" />))}
      {/* l'autocollant : bande de scotch blanc, « LINA » au feutre rouge, un cœur */}
      <g transform="translate(0,150) rotate(-6)">
        <rect x={-110} y={-44} width={220} height={88} rx={6} fill="#ECE6D8" opacity={0.96} />
        <rect x={-110} y={-44} width={220} height={88} rx={6} fill="none" stroke="#B8B0A0" strokeWidth={3} />
        <text x={-10} y={26} textAnchor="middle" fontFamily={F.hand} fontWeight={700} fontSize={72} fill="#D41E1E">LINA</text>
        <path d="M80 -6 c -10 -16 -30 -6 -20 10 l 20 18 l 20 -18 c 10 -16 -10 -26 -20 -10 z" fill="#D41E1E" transform="translate(-4,2) scale(0.8)" />
      </g>
      {live ? <Glow x={0} y={-125} r={160} color={RADIO} o={0.35 * lit} blur={24} /> : null}
    </g>
  );
};

// ---------------- la grille du sol, vue d'en haut : l'œil dessous (hook A), puis la radio collée aux lames (nuit A) ----------------
export const Grille: React.FC<SceneP & {
  t0: number; mode: 'eye' | 'radio'; press?: number; sticker?: number; talk?: [number, number][]; radioTalk?: [number, number][]; dark?: number;
}> = ({T, t0, mode, press = 0, sticker = 999, talk = [], radioTalk = [], dark = 0}) => {
  const GX = 540, GY = 900, GW = 640, GH = 380;
  const blink = mode === 'eye' ? 1 - Math.max(0, Math.sin(prog(T, 1.7, 1.95, (q) => q) * Math.PI)) : 1;
  const look = prog(T, 2.2, 2.8, easeInOut);
  const pk = prog(T, press, press + 0.5, easeOut);
  // la radio remonte du noir et se colle aux lames, puis la caméra plonge sur l'autocollant
  const rz = mode === 'radio' ? lerp(0.72, 1.0, pk) : 1;
  const z = mode === 'eye' ? lerp(1.4, 1.62, prog(T, 0, 4.4, (q) => q)) : lerp(1.0, 1.12, prog(T, t0, press, (q) => q));
  const zs = prog(T, sticker - 0.1, sticker + 0.8, easeInOut);
  const cam = camT(lerp(GX, GX + 10, zs), lerp(GY + 40, GY + 23, zs), z * lerp(1, 2.1, zs));
  const shake = on(T, talk) || on(T, radioTalk) ? 1.5 * Math.sin(T * 70) : 0;
  const bars = Array.from({length: 8}, (_, i) => GY - GH / 2 + 24 + i * ((GH - 48) / 7));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="gfFloor" stops={[[0, '#2E241C'], [1, '#1C1610']]} />
        <clipPath id="gfHole"><rect x={GX - GW / 2 + 22} y={GY - GH / 2 + 22} width={GW - 44} height={GH - 44} /></clipPath>
        <radialGradient id="gfBelow" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stopColor={mode === 'eye' ? '#2A1A0C' : '#0C2018'} /><stop offset="1" stopColor="#030304" /></radialGradient>
      </defs>
      <g transform={cam}>
        {/* parquet */}
        <rect x={-400} y={-400} width={1880} height={2720} fill="url(#gfFloor)" />
        {Array.from({length: 26}, (_, i) => (
          <g key={i}>
            <rect x={-400} y={-400 + i * 110} width={1880} height={3} fill="#120D08" />
            {Array.from({length: 5}, (_, j) => <rect key={j} x={-400 + ((j * 420 + i * 170) % 1880)} y={-400 + i * 110} width={3} height={110} fill="#120D08" />)}
            <rect x={-400} y={-394 + i * 110} width={1880} height={30} fill={i % 2 ? '#3A2C20' : '#33271C'} opacity={0.35} />
          </g>
        ))}
        {/* ce qu'on voit à travers : le noir du 11e, l'œil ou la radio */}
        <g clipPath="url(#gfHole)" transform={`translate(${shake},0)`}>
          <rect x={GX - GW / 2} y={GY - GH / 2} width={GW} height={GH} fill="url(#gfBelow)" />
          {mode === 'eye' ? (
            <g transform={`translate(${GX + lerp(-20, 30, look)},${GY + 10}) scale(1,${blink})`}>
              <Glow x={0} y={0} r={240} color="#C8822A" o={0.28} blur={24} />
              <path d="M-200 0 Q0 -130 200 0 Q0 130 -200 0 Z" fill="#B9AE98" />
              <path d="M-200 0 Q0 -130 200 0 Q0 130 -200 0 Z" fill="none" stroke="#1A120A" strokeWidth={10} />
              <circle cx={lerp(-30, 40, look)} cy={0} r={78} fill="#5C4424" />
              <circle cx={lerp(-30, 40, look)} cy={0} r={78} fill="none" stroke="#2A1C0C" strokeWidth={8} />
              <circle cx={lerp(-30, 40, look)} cy={0} r={34} fill="#050403" />
              <circle cx={lerp(-30, 40, look) + 26} cy={-24} r={12} fill="#FFF4DC" opacity={0.9} />
              {[-140, -80, 80, 140].map((x) => <path key={x} d={`M${x} ${-70 + Math.abs(x) * 0.25} l${x * 0.08} -40`} stroke="#1A120A" strokeWidth={6} />)}
            </g>
          ) : (
            <g transform={`translate(${GX + 10},${GY + lerp(10, -70, pk)}) rotate(${lerp(-12, -3, pk)})`} opacity={lerp(0.35, 1, pk)}>
              <Radio T={T} live={on(T, radioTalk)} lit={lerp(0.4, 1, pk)} s={rz * 0.62} />
              {/* la main de Ferrand qui la tient */}
              <path d={`M95 40 q40 6 60 50 l-26 20 q-20 -32 -40 -40 z`} fill="#2A2A30" stroke="#0A0A0C" strokeWidth={5} />
            </g>
          )}
        </g>
        {/* la grille : cadre et lames */}
        <rect x={GX - GW / 2} y={GY - GH / 2} width={GW} height={GH} rx={10} fill="none" stroke="#6E6A62" strokeWidth={26} />
        <rect x={GX - GW / 2 - 13} y={GY - GH / 2 - 13} width={GW + 26} height={GH + 26} rx={14} fill="none" stroke="#2A2620" strokeWidth={4} />
        {bars.map((y, i) => i === 4 ? null : <rect key={i} x={GX - GW / 2 + 12} y={y - 5} width={GW - 24} height={10} rx={4} fill="#7A766C" stroke="#3A362E" strokeWidth={3} transform={`translate(${shake * 0.5},0)`} />)}
        {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => <circle key={i} cx={GX + sx * (GW / 2 - 2)} cy={GY + sy * (GH / 2 - 2)} r={9} fill="#A8A498" stroke="#2A2620" strokeWidth={3} />)}
        {T >= 0 && on(T, talk) ? <Waves T={T} x={GX} y={GY - 40} col={AMB} /> : null}
        {on(T, radioTalk) ? <Waves T={T} x={GX} y={GY - 40} col={RADIO} /> : null}
        {/* tes mains, à plat, de chaque côté de la grille */}
        {[[-1, 200], [1, 880]].map(([s, x]) => (
          <g key={x} transform={`translate(${x},${GY + 330 + 4 * Math.sin(T * 2 + s)})`}>
            <path d={`M${s * 40} 260 L${s * 10} 40`} stroke={HERO.line} strokeWidth={118} strokeLinecap="round" />
            <path d={`M${s * 40} 260 L${s * 10} 40`} stroke={mode === 'eye' ? '#8A6A3A' : '#9A7438'} strokeWidth={104} strokeLinecap="round" />
            <ellipse cx={s * 4} cy={-10} rx={52} ry={62} fill={HERO.line} />
            <ellipse cx={s * 4} cy={-10} rx={45} ry={55} fill="#A8A090" />
            {[-26, -9, 8, 25].map((fx) => <rect key={fx} x={s * 4 + fx - 7} y={-82} width={14} height={40} rx={7} fill="#A8A090" stroke={HERO.line} strokeWidth={4} />)}
          </g>
        ))}
        <Dust x0={200} y0={600} x1={880} y1={1200} T={T} n={26} o={0.35} seed={44} />
      </g>
      <rect width={1080} height={1920} fill={`rgba(0,0,0,${0.18 + dark})`} />
    </svg>
  );
};

// ---------------- le test : un coup au sol → il en rend deux ; trois → quatre. Eux répètent, lui compte ----------------
export const Coups: React.FC<SceneP & {t0: number; mine: number[]; his: number[]; rep: number; compte: number; homme: number}> = ({T, t0, mine, his, rep, compte, homme}) => {
  const frame = useCurrentFrame();
  const k = prog(T, t0, t0 + 0.7, easeOut);
  // ton poing : se lève 0,22 s avant chaque coup, retombe dessus
  const nextMine = mine.find((m) => T < m + 0.08);
  const up = nextMine !== undefined && nextMine - T < 0.24 ? Math.sin(((nextMine - T) / 0.24) * Math.PI * 0.5) : 0;
  const lastMine = mine.filter((m) => T >= m).pop(), lastHis = his.filter((m) => T >= m).pop();
  const hitM = lastMine !== undefined ? Math.exp(-(T - lastMine) * 14) : 0, hitH = lastHis !== undefined ? Math.exp(-(T - lastHis) * 14) : 0;
  const nextHis = his.find((m) => T < m + 0.08);
  const upH = nextHis !== undefined && nextHis - T < 0.2 ? Math.sin(((nextHis - T) / 0.2) * Math.PI * 0.5) : 0;
  const pose: Pose = breathe({...P.sitKnees, torso: 16, head: 18, aL: 62, aLb: 14, aR: lerp(28, 118, up), aRb: lerp(8, -10, up)}, T * 1.6, 0.8);
  // les compteurs : manche 1 (1 → 2), puis manche 2 (3 → 4)
  const r2 = mine.length > 1 ? mine[1] - 0.3 : 999;
  const inR2 = T >= r2;
  const nM = mine.filter((m) => T >= m && (inR2 ? m >= r2 : m < r2)).length;
  const nH = his.filter((m) => T >= m && (inR2 ? m >= r2 : m < r2)).length;
  const cnt = 1 - prog(T, rep - 0.2, rep + 0.2);
  const pop = (list: number[], r: number) => {
    const last = list.filter((m) => T >= m && (inR2 ? m >= r : m < r)).pop();
    return last !== undefined ? 1 + 0.25 * Math.exp(-(T - last) * 10) : 1;
  };
  const lr = sp(frame, rep, {damping: 12, stiffness: 200, mass: 0.6}), lc = sp(frame, compte, {damping: 12, stiffness: 200, mass: 0.6});
  const stamp = sp(frame, homme, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="cpUp" stops={[[0, '#2C2824'], [1, '#3C352E']]} />
        <VGrad id="cpDown" stops={[[0, '#16182A'], [1, '#0A0B12']]} />
      </defs>
      <g transform={`translate(540,1000) scale(${lerp(1.1, 1.0, k)}) translate(-540,-1000)`}>
        <rect x={0} y={0} width={1080} height={1060} fill="url(#cpUp)" />
        
        <rect x={0} y={1060} width={1080} height={70} fill="#5A5248" transform={`translate(0,${hitM * 3 - hitH * 3})`} />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={i * 80} y={1060} width={3} height={70} fill="#3A342C" />)}
        <rect x={0} y={1130} width={1080} height={790} fill="url(#cpDown)" />
        {lab(150, 1200, '11E ÉTAGE', '#6F7A98', 26)}
        {lab(930, 1010, '12E · TOI', '#C8B8A0', 26)}
        {/* toi, à genoux, le poing sur le sol */}
        <Hero p={pose} x={470} y={1060} hipY={0} h={520} light={{amb: 0.78, tint: '#2A2420'}} />
        {hitM > 0.05 ? [0, 1].map((i) => <ellipse key={i} cx={600} cy={1062} rx={60 + (1 - hitM) * 200 + i * 40} ry={14 + (1 - hitM) * 20} fill="none" stroke={LIME} strokeWidth={6} opacity={hitM * (1 - i * 0.4)} />) : null}
        {/* lui, en dessous : casquette, un manche à balai contre le plafond */}
        <g opacity={0.95}>
          <Stick p={{...P.standArmsDown, head: -16, aR: 168, aRb: -6, aL: -20}} x={820} y={1880} h={620} look="rimBlue" />
          <path d="M775 1258 Q820 1218 865 1258 L895 1265 L775 1265 Z" fill="#1A1C24" stroke="#5A6488" strokeWidth={4} />
          <line x1={836} y1={lerp(1390, 1400, 1 - upH)} x2={846} y2={lerp(1132, 1170, upH)} stroke="#8A6A44" strokeWidth={14} strokeLinecap="round" />
        </g>
        {hitH > 0.05 ? [0, 1].map((i) => <ellipse key={i} cx={846} cy={1132} rx={50 + (1 - hitH) * 180 + i * 40} ry={12 + (1 - hitH) * 18} fill="none" stroke={AMB} strokeWidth={6} opacity={hitH * (1 - i * 0.4)} />) : null}
        <Glow x={820} y={1400} r={300} color="#3A4A8A" o={0.18} blur={40} />
      </g>
      {/* compteurs */}
      <g opacity={cnt * k}>
        <g transform={`translate(300,760) scale(${pop(mine, r2)})`}>
          {lab(0, -190, 'TOI', LIME, 34)}
          <text x={0} y={0} textAnchor="middle" fontFamily={SF.title} fontSize={230} fill={LIME} stroke="#0A0A0A" strokeWidth={8} paintOrder="stroke">{nM > 0 ? nM : '·'}</text>
        </g>
        <text x={540} y={700} textAnchor="middle" fontFamily={SF.title} fontSize={120} fill="#FFFFFF" opacity={0.85}>→</text>
        <g transform={`translate(800,760) scale(${pop(his, r2)})`}>
          {lab(0, -190, 'LUI', AMB, 34)}
          <text x={0} y={0} textAnchor="middle" fontFamily={SF.title} fontSize={230} fill={AMB} stroke="#0A0A0A" strokeWidth={8} paintOrder="stroke">{nH > 0 ? nH : '·'}</text>
        </g>
      </g>
      {/* eux répètent / lui compte / c'est un homme */}
      <g opacity={1 - prog(T, homme - 0.1, homme + 0.2)}>
        <g opacity={Math.min(1, lr)} transform={`translate(290,${lerp(680, 640, lr)})`}>
          <rect x={-240} y={-70} width={480} height={110} rx={14} fill="rgba(10,6,6,0.75)" stroke={RED} strokeWidth={5} />
          <text x={0} y={8} textAnchor="middle" fontFamily={SF.title} fontSize={80} fill={RED}>EUX : 3 → 3</text>
        </g>
        <g opacity={Math.min(1, lc)} transform={`translate(790,${lerp(680, 640, lc)})`}>
          <rect x={-240} y={-70} width={480} height={110} rx={14} fill="rgba(10,6,6,0.75)" stroke={AMB} strokeWidth={5} />
          <text x={0} y={8} textAnchor="middle" fontFamily={SF.title} fontSize={80} fill={AMB}>LUI : 3 → 4</text>
        </g>
      </g>
      <g transform={`translate(540,680) scale(${stamp}) rotate(-5)`} opacity={Math.min(1, stamp)}>
        <rect x={-330} y={-80} width={660} height={140} rx={12} fill="rgba(10,6,6,0.6)" stroke={AMB} strokeWidth={9} />
        <text x={0} y={30} textAnchor="middle" fontFamily={SF.title} fontSize={112} fill={AMB}>C'EST UN HOMME</text>
      </g>
    </svg>
  );
};

// ---------------- la façade : ta fenêtre (12e), la sienne (11e), la corde du marché ----------------
const FY = (f: number) => 300 + (12 - f) * 320; // haut de l'étage f (monde)
const WIN = {x: 380, w: 320, top: 80, h: 190};
export const Facade: React.FC<SceneP & {t0: number; mode: 'trade' | 'dusk'; down?: number; up?: number; cam: CamKey[]}> = ({T, t0, mode, down = 999, up = 999, cam}) => {
  const dusk = mode === 'dusk';
  const y12 = FY(12) + WIN.top, y11 = FY(11) + WIN.top;
  const sill12 = y12 + WIN.h;
  // le bidon descend, puis le panier remonte
  const kd = prog(T, down, down + 1.6, easeInOut), ku = prog(T, up, up + 1.5, easeInOut);
  const bidonY = lerp(sill12 + 20, y11 + 70, kd);
  const basketY = lerp(y11 + 110, sill12 - 30, ku);
  const load = T < up ? (T < down + 1.7 ? 'bidon' : 'none') : 'basket';
  const ropeEnd = load === 'bidon' ? bidonY - 40 : load === 'basket' ? basketY - 60 : y11 + 40;
  const sway = 6 * Math.sin(T * 2.2);
  const pull = load === 'basket' ? Math.sin(T * 9) * 0.5 + 0.5 : 0;
  const heroPose: Pose = {...P.hold, torso: 12, head: 26, aL: lerp(70, 90, pull), aLb: 50, aR: lerp(60, 84, 1 - pull), aRb: 60};
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="fcSky" stops={dusk ? [[0, '#1E1A34'], [0.6, '#5A2E3E'], [1, '#C0603A']] : [[0, '#5E6A78'], [1, '#A8B0B6']]} />
        <VGrad id="fcWall" stops={[[0, dusk ? '#4A4248' : '#8C867C'], [1, dusk ? '#2E2830' : '#6E695F']]} />
        <VGrad id="fcFog" stops={[[0, 'rgba(0,0,0,0)'], [1, dusk ? 'rgba(20,14,26,1)' : 'rgba(150,158,166,1)']]} />
      </defs>
      <rect width={1080} height={1920} fill="url(#fcSky)" />
      <g transform={camAt(T, cam)}>
        {/* tours voisines au loin */}
        {[[-520, 900, '#3A3A48'], [1180, 700, '#3A3A48'], [-300, 1300, '#2E2E3A']].map(([x, y, c], i) => <rect key={i} x={x as number} y={y as number} width={420} height={4000} fill={c as string} opacity={dusk ? 0.8 : 0.45} />)}
        <rect x={100} y={260} width={880} height={4400} fill="url(#fcWall)" />
        <rect x={80} y={240} width={920} height={40} fill={dusk ? '#2A242A' : '#5E5A52'} />
        {lab(540, 228, 'TOIT', dusk ? '#C8A890' : '#E8E4DA', 26, 0.7)}
        {Array.from({length: 13}, (_, i) => <rect key={i} x={100} y={FY(12 - i) - 4} width={880} height={8} fill="rgba(0,0,0,0.18)" />)}
        {Array.from({length: 12}, (_, i) => {
          const f = 12 - i, y = FY(f) + WIN.top;
          const mine = f === 12, his = f === 11;
          const lit = his && dusk ? 0.55 + 0.1 * Math.sin(T * 3) : 0;
          return (
            <g key={f}>
              {[160, 780].map((x) => <rect key={x} x={x} y={y + 20} width={140} height={150} fill={dusk ? '#14121A' : '#3A3E46'} stroke="#2A2620" strokeWidth={6} opacity={0.9} />)}
              <rect x={WIN.x} y={y} width={WIN.w} height={WIN.h} fill={mine ? '#5A4030' : lit ? '#C88A40' : dusk ? '#14121A' : '#30343C'} stroke="#2A2620" strokeWidth={8} opacity={lit ? lit + 0.3 : 1} />
              {mine ? <path d={`M${WIN.x + 20} ${y + 30} l60 0 M${WIN.x + 200} ${y + 140} l80 0 M${WIN.x + 120} ${y + 70} l0 60`} stroke="#8A6A44" strokeWidth={10} opacity={0.6} /> : null}
              {his ? <g>
                <path d={`M${WIN.x + 10} ${y + 6} q${30 + sway} 90 ${10} ${WIN.h - 12}`} fill="#4A2A30" opacity={0.85} />
                {dusk ? <g><Glow x={WIN.x + 200} y={y + 100} r={140} color="#F2A23C" o={lit * 0.5} blur={24} /><Stick p={{...P.standArmsDown, head: 10}} x={WIN.x + 210} y={y + WIN.h + 110} h={260} look="dark" /></g> : null}
              </g> : null}
              {f === 12 || f === 11 ? lab(f === 12 ? 860 : 860, y + WIN.h / 2 + 10, f === 12 ? '12E · TOI' : '11E', mine ? LIME : AMB, 30) : null}
              <rect x={WIN.x - 10} y={y + WIN.h} width={WIN.w + 20} height={18} fill={dusk ? '#3A343A' : '#9A948A'} />
            </g>
          );
        })}
        {/* toi à ta fenêtre : on écarte le carton, on fait filer la corde */}
        {mode === 'trade' ? (
          <g>
            <clipPath id="fcW12"><rect x={WIN.x + 60} y={y12} width={200} height={WIN.h} /></clipPath>
            <rect x={WIN.x + 60} y={y12} width={200} height={WIN.h} fill="#120E0C" />
            <g clipPath="url(#fcW12)"><Hero p={heroPose} x={WIN.x + 160} y={sill12 + 210} h={380} light={DAY} /></g>
            {/* la corde, le bidon bleu, le panier */}
            <path d={`M${540} ${sill12} Q${540 + sway} ${(sill12 + ropeEnd) / 2} ${540 + sway * 0.5} ${ropeEnd}`} stroke="#D8C8A0" strokeWidth={6} fill="none" />
            {load === 'bidon' ? (
              <g transform={`translate(${540 + sway * 0.5},${bidonY}) rotate(${sway * 0.6})`}>
                <rect x={-60} y={-40} width={120} height={150} rx={14} fill="#2D6CC4" stroke="#123060" strokeWidth={6} />
                <rect x={-30} y={-62} width={34} height={26} rx={4} fill="#1A3A70" />
                <rect x={-40} y={10} width={80} height={60} rx={6} fill="#6FA8F0" opacity={0.5} />
                {lab(0, 52, '10 L', '#FFFFFF', 26)}
              </g>
            ) : null}
            {load === 'basket' ? (
              <g transform={`translate(${540 + sway * 0.5},${basketY}) rotate(${sway * 0.5})`}>
                <path d="M-70 -40 L70 -40 L56 60 L-56 60 Z" fill="#9A7A4A" stroke="#4A3418" strokeWidth={6} />
                {[-36, -12, 12, 36].map((x, i) => <rect key={x} x={x - 11} y={-74} width={22} height={40} rx={4} fill={['#C83A2A', '#E0B030', '#3A8A4A', '#D8D0C0'][i]} stroke="#2A1A10" strokeWidth={3} />)}
                <path d="M-70 -40 Q0 -140 70 -40" stroke="#4A3418" strokeWidth={6} fill="none" />
              </g>
            ) : null}
            {/* son bras qui attrape */}
            <path d={`M${WIN.x + 150} ${y11 + 120} q${70} ${-10 + 20 * kd} ${110 + sway * 0.5} ${-20}`} stroke="#1E2028" strokeWidth={40} strokeLinecap="round" fill="none" opacity={T > down + 0.9 && T < up + 0.6 ? 1 : 0} />
          </g>
        ) : null}
        <rect x={0} y={3200} width={1080} height={1600} fill="url(#fcFog)" />
      </g>
      {dusk ? <rect width={1080} height={1920} fill="rgba(10,8,20,0.25)" /> : null}
    </svg>
  );
};

// ---------------- le panier sur ton rebord : 4 conserves… et une balle ----------------
export const Panier: React.FC<SceneP & {t0: number; bullet: number}> = ({T, t0, bullet}) => {
  const frame = useCurrentFrame();
  const land = sp(frame, t0, {damping: 11, stiffness: 180, mass: 0.7});
  const roll = prog(T, bullet - 0.15, bullet + 0.6, easeOut);
  const z = lerp(1.0, 1.75, prog(T, bullet + 0.1, bullet + 1.6, easeInOut));
  const glint = Math.max(0, Math.sin(prog(T, bullet + 0.9, bullet + 1.5, (q) => q) * Math.PI));
  const cans: [string, string][] = [['#C83A2A', 'RAVIOLIS'], ['#E0B030', 'MAÏS'], ['#3A8A4A', 'PETITS POIS'], ['#D8D0C0', 'THON']];
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="pnSky" stops={[[0, '#6A7684'], [1, '#9AA2AA']]} />
      </defs>
      <rect width={1080} height={1920} fill="#0E0B09" />
      <g transform={`translate(540,${lerp(1060, 860, prog(T, bullet + 0.1, bullet + 1.6, easeInOut))}) scale(${z}) translate(${-lerp(540, 800, prog(T, bullet + 0.1, bullet + 1.6, easeInOut))},${-lerp(1000, 1160, prog(T, bullet + 0.1, bullet + 1.6, easeInOut))})`}>
        {/* l'ouverture dans le carton, le ciel derrière */}
        <rect x={140} y={300} width={800} height={900} fill="url(#pnSky)" />
        <rect x={0} y={0} width={140} height={1920} fill="#5A4030" />
        <rect x={940} y={0} width={140} height={1920} fill="#5A4030" />
        <rect x={140} y={0} width={800} height={300} fill="#5A4030" />
        <rect x={60} y={1160} width={960} height={150} fill="#7A746A" stroke="#3A3630" strokeWidth={6} />
        <rect x={60} y={1310} width={960} height={620} fill="#1A1410" />
        {/* le panier, posé sur le rebord */}
        <g transform={`translate(540,${lerp(860, 1160, land)})`}>
          <path d="M-260 -230 L260 -230 L220 0 L-220 0 Z" fill="#9A7A4A" stroke="#4A3418" strokeWidth={8} />
          {Array.from({length: 6}, (_, i) => <path key={i} d={`M-250 ${-200 + i * 36} L250 ${-200 + i * 36}`} stroke="#6A5230" strokeWidth={5} opacity={0.7} />)}
          <path d="M-260 -230 Q0 -560 260 -230" stroke="#4A3418" strokeWidth={14} fill="none" />
          {cans.map(([c, name], i) => (
            <g key={name} transform={`translate(${-165 + i * 110},-300)`}>
              <rect x={-48} y={-90} width={96} height={170} rx={10} fill="#9AA0A8" stroke="#2A2A30" strokeWidth={5} />
              <rect x={-48} y={-60} width={96} height={110} fill={c} />
              <text x={0} y={8} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={name.length > 6 ? 15 : 20} fill="#FFFFFF">{name.split(' ')[0]}</text>
            </g>
          ))}
        </g>
        {/* la balle : elle roule hors du panier et s'arrête sur le rebord */}
        <g transform={`translate(${lerp(560, 800, roll)},${1140}) rotate(${lerp(-200, 0, roll)}) scale(1.6)`} opacity={T >= bullet - 0.15 ? 1 : 0}>
          <rect x={-60} y={-18} width={84} height={36} rx={4} fill="#C8962E" stroke="#5A3E10" strokeWidth={4} />
          <rect x={-66} y={-20} width={10} height={40} rx={2} fill="#A87A1E" stroke="#5A3E10" strokeWidth={3} />
          <path d="M24 -16 Q76 -14 82 0 Q76 14 24 16 Z" fill="#B8683A" stroke="#5A2E10" strokeWidth={4} />
          <rect x={-50} y={-12} width={64} height={6} fill="#FFE8A8" opacity={0.6} />
        </g>
        {glint > 0 ? <g transform={`translate(${860},${1110})`} opacity={glint}><path d="M0 -40 L6 -6 L40 0 L6 6 L0 40 L-6 6 L-40 0 L-6 -6 Z" fill="#FFF6D8" /></g> : null}
      </g>
      <rect width={1080} height={1920} fill={`rgba(0,0,0,${0.15 * prog(T, bullet, bullet + 1)})`} />
    </svg>
  );
};

// ---------------- le ballon d'eau qui se vide par la colonne ; la vanne ----------------
export const Ballon: React.FC<SceneP & {t0: number; drop: number; down: number; valve: number; lost: number; cam: CamKey[]; who?: boolean; marks: [string, string]}> = ({T, t0, drop, valve, lost, cam, who = true, marks}) => {
  const frame = useCurrentFrame();
  const lvl = lerp(0.8, 0.6, prog(T, drop - 0.3, valve + 0.3, (q) => q));
  const flowing = T >= drop - 0.5 && T < valve + 0.4;
  const gurgle = T >= t0 && T < valve + 0.4 ? Math.sin(T * 13) * 0.004 + Math.sin(T * 31) * 0.003 : 0;
  const turn = prog(T, valve, valve + 0.5, easeOut);
  const stamp = sp(frame, lost, {damping: 9, stiffness: 260, mass: 0.6});
  const reach = prog(T, valve - 0.6, valve - 0.1, easeInOut);
  const pose: Pose = breathe({...P.stand, torso: lerp(0, 26, reach), head: lerp(-16, 20, reach), aR: lerp(14, 52, reach), aRb: lerp(-4, 18, reach)}, T * 1.5, 1);
  const TOP = 120, BOT = 760;
  const wy = lerp(BOT, TOP, lvl + gurgle);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="blWall" stops={[[0, '#6C7076'], [1, '#4E5258']]} />
        <VGrad id="blDown" stops={[[0, '#14162A'], [1, '#08090E']]} />
        <VGrad id="blTank" stops={[[0, '#E6E8E4'], [1, '#B8BCB8']]} />
        <clipPath id="blGauge"><rect x={728} y={TOP} width={36} height={BOT - TOP} rx={18} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="#08090E" />
      <g transform={camAt(T, cam)}>
        {/* ta salle de bain : faïence, ballon d'eau chaude */}
        <rect x={-300} y={-400} width={1680} height={1500} fill="url(#blWall)" />
        {Array.from({length: 20}, (_, i) => <rect key={`h${i}`} x={-300} y={-400 + i * 80} width={1680} height={3} fill="#3E4248" />)}
        {Array.from({length: 22}, (_, i) => <rect key={`v${i}`} x={-300 + i * 80} y={-400} width={3} height={1500} fill="#3E4248" />)}
        <rect x={360} y={60} width={360} height={760} rx={160} fill="url(#blTank)" stroke="#5A5E62" strokeWidth={8} />
        <rect x={400} y={160} width={40} height={560} rx={20} fill="#FFFFFF" opacity={0.35} />
        <rect x={470} y={320} width={140} height={60} rx={8} fill="#2A2E34" />
        {lab(540, 362, '200 L', '#E8ECF0', 28)}
        {/* jauge transparente : le niveau qui baisse */}
        <rect x={728} y={TOP} width={36} height={BOT - TOP} rx={18} fill="#1A2028" stroke="#9AA2AA" strokeWidth={5} />
        <g clipPath="url(#blGauge)">
          <rect x={728} y={wy} width={36} height={BOT - wy + 10} fill="#3A8AE0" />
          <rect x={728} y={wy - 3} width={36} height={6} fill="#BFE0FF" />
          {flowing ? [0, 1, 2].map((i) => <circle key={i} cx={746} cy={wy + 30 + ((T * 220 + i * 120) % (BOT - wy))} r={5} fill="#BFE0FF" opacity={0.7} />) : null}
        </g>
        {[0.8, 0.6].map((v) => <g key={v}><rect x={770} y={lerp(BOT, TOP, v) - 2} width={26} height={4} fill="#E8ECF0" />{lab(840, lerp(BOT, TOP, v) + 9, v === 0.8 ? marks[0] : marks[1], '#E8ECF0', 24)}</g>)}
        {/* le tuyau qui descend dans la colonne, la vanne rouge */}
        <rect x={528} y={810} width={24} height={1200} fill="#B87A3A" stroke="#5A3A18" strokeWidth={4} />
        <g transform={`translate(540,880) rotate(${lerp(0, 90, turn)})`}>
          <rect x={-70} y={-14} width={140} height={28} rx={12} fill="#D02A20" stroke="#5A0E0A" strokeWidth={5} />
          <circle r={18} fill="#7A1A14" />
        </g>
        {turn > 0 && turn < 1 ? <Glow x={540} y={880} r={90} color={LIME} o={0.5} blur={14} /> : null}
        {flowing ? [0, 1, 2, 3].map((i) => <rect key={i} x={533} y={1100 + ((T * 600 + i * 220) % 880)} width={14} height={60} rx={7} fill="#7FC0FF" opacity={0.55} />) : null}
        <Hero p={pose} x={lerp(250, 330, reach)} y={1100} h={620} light={{amb: 0.72, tint: '#1E2230'}} />
        {/* la dalle, puis le 11e : un robinet qui coule dans des bidons */}
        <rect x={-300} y={1100} width={1680} height={90} fill="#5A5248" />
        <rect x={-300} y={1190} width={1680} height={1300} fill="url(#blDown)" />
        {lab(160, 1260, '11E ÉTAGE', '#6F7A98', 26)}
        <rect x={500} y={1820} width={90} height={30} rx={8} fill="#9AA0A8" />
        <rect x={570} y={1840} width={20} height={50} fill="#9AA0A8" />
        {flowing ? <rect x={572} y={1890} width={16} height={190} fill="#7FC0FF" opacity={0.8} /> : null}
        {flowing ? <Dust x0={540} y0={2060} x1={640} y1={2100} T={T * 3} n={10} o={0.6} seed={9} /> : null}
        <rect x={520} y={2080} width={120} height={150} rx={12} fill="#2D6CC4" stroke="#123060" strokeWidth={5} />
        <rect x={660} y={2080} width={120} height={150} rx={12} fill="#2D6CC4" stroke="#123060" strokeWidth={5} opacity={0.8} />
        {who ? (
          <g>
            <Stick p={{...P.standArmsDown, head: 14, aL: 40, aLb: 30}} x={860} y={2270} h={560} look="rimBlue" />
            <path d="M817 1700 Q860 1662 903 1700 L931 1707 L817 1707 Z" fill="#1A1C24" stroke="#5A6488" strokeWidth={4} />
          </g>
        ) : null}
        <Glow x={600} y={1950} r={300} color="#3A4A8A" o={0.2} blur={40} />
      </g>
      <g transform={`translate(540,1500) scale(${stamp}) rotate(-6)`} opacity={Math.min(1, stamp) * (1 - prog(T, lost + 1.6, lost + 2))}>
        <rect x={-230} y={-70} width={460} height={130} rx={12} fill="rgba(10,6,6,0.7)" stroke={RED} strokeWidth={9} />
        <text x={0} y={36} textAnchor="middle" fontFamily={SF.title} fontSize={120} fill={RED}>−30 L</text>
      </g>
    </svg>
  );
};

// ---------------- la nuit : un pied-de-biche dans ta porte, la radio qui grésille dessous ----------------
export const Biche: React.FC<SceneP & {pries: number[]; crack: number; radioTalk?: [number, number][]; dark?: number; tag?: [number, number]}> = (p) => {
  const {T, pries, crack, radioTalk = [], dark = 0, tag} = p;
  const last = pries.filter((k) => T >= k).pop();
  const hit = last !== undefined ? Math.exp(-(T - last) * 10) : 0;
  const ck = prog(T, crack, crack + 0.3, easeOut);
  const push = 10 + 14 * ck + hit * 10;
  const live = on(T, radioTalk);
  const glow = 0.35 + (live ? 0.5 + 0.15 * Math.sin(T * 30) : 0.1 * Math.sin(T * 4));
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <PorteNuit {...p} knocks={pries} />
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <Blurs />
        {/* la lumière du palier par la fente qui s'ouvre */}
        <rect x={310} y={862} width={push * 0.5} height={636} fill="#A8BCFF" opacity={0.55} filter="url(#b8)" />
        <rect x={311} y={862} width={Math.max(3, push * 0.25)} height={636} fill="#DCE6FF" opacity={0.8} />
        {/* le pied-de-biche */}
        <g transform={`translate(${312 - push * 0.3},${940 + hit * 4}) rotate(${-8 + hit * 3})`}>
          <path d="M60 -10 L-34 -6 Q-62 -4 -66 22 Q-68 40 -50 44" stroke="#0A0A0C" strokeWidth={38} fill="none" strokeLinecap="round" />
          <path d="M60 -10 L-34 -6 Q-62 -4 -66 22 Q-68 40 -50 44" stroke="#B8241C" strokeWidth={26} fill="none" strokeLinecap="round" />
          <path d="M-40 -9 L-20 -4" stroke="#FF8A7A" strokeWidth={4} opacity={0.6} />
        </g>
        {/* éclats de bois */}
        {ck > 0 ? Array.from({length: 7}, (_, i) => {
          const a = rand(i * 7 + 1) * Math.PI - Math.PI / 2, d = ck * (40 + rand(i * 3) * 120);
          return <rect key={i} x={312 + Math.cos(a) * d} y={950 + Math.sin(a) * d + ck * ck * 60} width={18} height={6} fill="#6A4630" transform={`rotate(${rand(i) * 180},${312 + Math.cos(a) * d},${950 + Math.sin(a) * d})`} opacity={1 - prog(T, crack + 0.8, crack + 1.4)} />;
        }) : null}
        {/* sous la porte : la lueur verte de la radio */}
        <rect x={92} y={1494} width={216} height={10} fill={RADIO} opacity={glow} />
        <Glow x={200} y={1505} r={140} color={RADIO} o={glow * 0.5} blur={24} />
        {live ? <Waves T={T} x={200} y={1480} col={RADIO} w={0.7} /> : null}
        {tag ? <g opacity={prog(T, tag[0], tag[0] + 0.2) * (1 - prog(T, tag[1] - 0.2, tag[1]))}>{lab(760, 1020, 'CETTE NUIT', '#DCE6FF', 40)}</g> : null}
      </svg>
      <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${dark})`}} />
    </div>
  );
};

// ---------------- sous la porte : ses bottes, et la radio posée sur le palier ----------------
export const SousPorte: React.FC<SceneP & {t0: number; sticker: number; radioTalk?: [number, number][]}> = ({T, t0, sticker, radioTalk = []}) => {
  const k = prog(T, t0, t0 + 0.6, easeOut);
  const zs = prog(T, sticker - 0.1, sticker + 0.9, easeInOut);
  const live = on(T, radioTalk);
  const shift = Math.sin(T * 1.3) * 10;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="spLand" stops={[[0, '#1A2238'], [1, '#2A3452']]} />
        <clipPath id="spGap"><rect x={0} y={900} width={1080} height={300} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="#050508" />
      <g transform={`translate(540,${lerp(1050, 900, zs)}) scale(${lerp(1.08, 1.0, k) * lerp(1, 2.6, zs)}) translate(${lerp(-540, -380, zs)},${lerp(-1050, -1090, zs)})`}>
        <g clipPath="url(#spGap)">
          <rect x={0} y={900} width={1080} height={300} fill="url(#spLand)" />
          <path d="M0 1120 L1080 1100 L1080 1200 L0 1200 Z" fill="#3A445E" />
          <Glow x={700} y={980} r={300} color="#A8BCFF" o={0.25} blur={24} />
          {/* ses bottes */}
          {[[640, 0], [800, 1]].map(([x, i]) => (
            <g key={i} transform={`translate(${x + (i ? shift : -shift * 0.5)},0)`}>
              <rect x={-36} y={880} width={72} height={200} fill="#0C0C10" />
              <path d="M-40 1060 L60 1060 Q90 1064 92 1100 L-40 1100 Z" fill="#14141A" stroke="#3A445E" strokeWidth={3} />
            </g>
          ))}
          {/* la radio couchée sur le palier */}
          <g transform="translate(380,1030) rotate(-4) scale(0.4)">
            <Radio T={T} live={live} lit={1} />
          </g>
          {live ? <Glow x={380} y={980} r={160} color={RADIO} o={0.35} blur={24} /> : null}
        </g>
        {/* le bas de ta porte, et le sol de ton appart */}
        <rect x={0} y={0} width={1080} height={900} fill="#1A1014" />
        <rect x={0} y={880} width={1080} height={20} fill="#0A0608" />
        <rect x={0} y={1200} width={1080} height={720} fill="#1C1610" />
        {Array.from({length: 6}, (_, i) => <rect key={i} x={0} y={1240 + i * 110} width={1080} height={3} fill="#0E0A06" />)}
      </g>
      {/* ta joue contre le sol : le bord du bonnet en bas */}
      <path d={`M-40 1920 Q300 ${1700 - 20 * k} 700 1920 Z`} fill={HERO.beanie} stroke={HERO.line} strokeWidth={8} opacity={0.95} />
      <rect width={1080} height={1920} fill="rgba(0,0,0,0.12)" />
    </svg>
  );
};

// ---------------- Lucas : ses messages du jour 1, restés sans réponse ----------------
export const LucasFil: React.FC<SceneP & {t0: number}> = ({T, t0}) => {
  const frame = useCurrentFrame();
  const k = sp(frame, t0, {damping: 13, stiffness: 180, mass: 0.7});
  const b2 = prog(T, t0 + 0.25, t0 + 0.5, easeOut);
  const bubble = (y: number, txt: string, o: number) => (
    <g opacity={o} transform={`translate(0,${(1 - o) * 30})`}>
      <rect x={-210} y={y} width={Math.min(420, 60 + txt.length * 24)} height={86} rx={36} fill="#3A3A44" />
      <text x={-180} y={y + 56} fontFamily={SF.cap} fontWeight={700} fontSize={40} fill="#FFFFFF">{txt}</text>
    </g>
  );
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <rect width={1080} height={1920} fill="#07070B" />
      <Glow x={540} y={900} r={520} color="#3A4A9A" o={0.35} blur={40} />
      <g transform={`translate(540,${lerp(1100, 920, k)}) rotate(${lerp(-12, -5, k)}) scale(${lerp(0.9, 1, k)})`}>
        <rect x={-275} y={-545} width={550} height={1090} rx={84} fill="#0B0B10" stroke="#3A3A44" strokeWidth={5} />
        <rect x={-252} y={-522} width={504} height={1044} rx={66} fill="#101018" />
        <rect x={-70} y={-500} width={140} height={38} rx={19} fill="#050507" />
        <text x={-200} y={-430} fontFamily={SF.mono} fontWeight={700} fontSize={26} fill={RED}>10 %</text>
        <circle cx={0} cy={-360} r={44} fill="#4A6AD8" />
        <text x={0} y={-345} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={40} fill="#FFFFFF">L</text>
        <text x={0} y={-280} textAnchor="middle" fontFamily={SF.cap} fontWeight={800} fontSize={40} fill="#FFFFFF">Lucas</text>
        <rect x={-252} y={-250} width={504} height={2} fill="#2A2A34" />
        {lab(0, -200, 'JOUR 1 · 07:58', '#8A8A9A', 22)}
        {bubble(-170, "t'es où ???", 1)}
        {bubble(-70, 'réponds', b2)}
        {bubble(30, 'stp', b2)}
        {lab(140, 160, 'LU', '#6A6A7A', 22)}
        {lab(0, 440, 'TU N’AS JAMAIS RÉPONDU', '#8A8A9A', 22)}
      </g>
    </svg>
  );
};
