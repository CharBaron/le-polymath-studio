// Scènes de la V2 du jour 1 (plus de contexte) : fiche du perso + plan de l'appart + coupe de l'immeuble, barricade, réserve d'eau,
// rations sur la table. Le perso (hero.tsx) y est toujours le même : bonnet rouge, sweat moutarde, jean.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeIn, easeInOut, easeOut, lerp, prog, rand, sp} from '../theme';
import {breathe, Hero, HERO, HeroTop, stride} from './hero';
import {mix, P, Pose, shamble, Stick} from './stick';
import {Blurs, Dust, Glow, RGrad, SceneP, VGrad} from './world';
import {SF} from './ui';

/** trait qui se dessine (longueur L) : k de 0 à 1 */
const Draw: React.FC<{d: string; L: number; k: number; stroke: string; w: number; glow?: string}> = ({d, L, k, stroke, w, glow}) => (
  <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={L} strokeDashoffset={L * (1 - k)} style={glow ? {filter: `drop-shadow(0 0 8px ${glow})`} : undefined} />
);

// ---------------- fiche du perso → plan de l'appart → coupe de l'immeuble ----------------
export const Dossier: React.FC<SceneP> = ({T, B}) => {
  const frame = useCurrentFrame();
  const plan0 = B.porte - 0.35, cut0 = B.esc - 0.15;
  const BLUE = '#CFE3FF', DIM = '#6F8DB8', RED = '#FF5A4A', CYAN = '#5FE3FF';
  // fiche
  if (T < plan0) {
    const k = prog(T, B.toi - 0.05, B.toi + 0.4, easeOut);
    const row = (t0: number) => prog(T, t0, t0 + 0.25, easeOut);
    const rows: [string, string, string, number][] = [['STATUT', 'SEUL', '#F2A23C', B.toi + 0.6], ['APPART', '1204', '#FFFFFF', B.appart + 1.0], ['ÉTAGE', '12 / 12', '#FFFFFF', B.appart + 1.9]];
    return (
      <svg width={1080} height={1920}>
        <Blurs />
        <defs>
          <RGrad id="dosBg" stops={[[0, '#16203A'], [1, '#05070D']]} cy={0.45} r={0.8} />
          <VGrad id="portrait" stops={[[0, '#2A3A5C'], [1, '#141C2E']]} />
          <clipPath id="portraitClip"><rect x={150} y={640} width={330} height={440} rx={20} /></clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#dosBg)" />
        {Array.from({length: 26}, (_, i) => <rect key={i} x={0} y={i * 80} width={1080} height={1} fill="rgba(140,180,255,0.06)" />)}
        <g transform={`translate(0,${(1 - k) * 120}) rotate(${(1 - k) * -3},540,860)`} opacity={k}>
          <rect x={110} y={560} width={860} height={580} rx={30} fill="#0F1626" stroke="#2C3F5E" strokeWidth={4} />
          <text x={150} y={612} fontFamily={SF.mono} fontWeight={700} fontSize={24} letterSpacing="6" fill="#7F9CC8">FICHE · SURVIVANT</text>
          <circle cx={872} cy={604} r={9} fill="#3BE07A" opacity={0.6 + 0.4 * Math.sin(T * 5)} />
          <text x={930} y={612} textAnchor="end" fontFamily={SF.mono} fontWeight={700} fontSize={22} fill="#3BE07A">EN VIE</text>
          <rect x={150} y={640} width={330} height={440} rx={20} fill="url(#portrait)" />
          <g clipPath="url(#portraitClip)">
            <Glow x={315} y={760} r={180} color="#5A7AC8" o={0.35} blur={40} />
            <Hero p={breathe(P.standArmsDown, T)} x={315} y={1557} h={860} />
          </g>
          <rect x={150} y={640} width={330} height={440} rx={20} fill="none" stroke="#3A5078" strokeWidth={3} />
          <text x={520} y={770} fontFamily={SF.title} fontSize={170} fill="#FFFFFF">TOI</text>
          {rows.map(([lab, val, col, t0], i) => (
            <g key={lab} opacity={row(t0)} transform={`translate(${(1 - row(t0)) * 30},0)`}>
              <text x={524} y={858 + i * 78} fontFamily={SF.mono} fontWeight={500} fontSize={28} letterSpacing="4" fill="#7F9CC8">{lab}</text>
              <text x={930} y={858 + i * 78} textAnchor="end" fontFamily={SF.mono} fontWeight={700} fontSize={44} fill={col}>{val}</text>
              <rect x={524} y={876 + i * 78} width={406} height={2} fill="#22324E" />
            </g>
          ))}
          {T > B.appart + 1.9 ? (
            <g transform={`translate(704,1080) scale(${sp(frame, B.appart + 2.1, {damping: 9, stiffness: 240, mass: 0.6})}) rotate(-4)`}>
              <rect x={-90} y={-30} width={180} height={52} rx={6} fill="#D00A0A" />
              <text x={0} y={7} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={28} fill="#FFFFFF">DERNIER</text>
            </g>
          ) : null}
        </g>
      </svg>
    );
  }
  // plan de l'appart (puis coupe de l'immeuble)
  const kp = prog(T, plan0, plan0 + 0.9, easeOut);
  const walls: [string, number][] = [
    ['M140 560 L940 560 L940 1240 L480 1240', 2280], ['M390 1240 L140 1240 L140 560', 930],
    ['M520 560 L520 860', 300], ['M520 960 L520 1240', 280], ['M140 900 L300 900', 160], ['M380 900 L520 900', 140], ['M360 900 L360 1240', 340], ['M520 1000 L700 1000', 180], ['M800 1000 L940 1000', 140],
  ];
  const door = prog(T, B.porte, B.porte + 0.3, easeOut);
  const winK = [0, 1, 2].map((i) => prog(T, B.fen + i * 0.22, B.fen + i * 0.22 + 0.25, easeOut));
  const toCut = prog(T, cut0, cut0 + 0.7, easeInOut);
  const z = lerp(lerp(1.12, 1.0, prog(T, plan0, plan0 + 1.6, easeOut)), 0.55, toCut);
  const rot = lerp(-4, 0, prog(T, plan0, plan0 + 1.4, easeOut));
  const lab = (x: number, y: number, s: string, c = DIM, size = 26) => <text x={x} y={y} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={size} letterSpacing="4" fill={c}>{s}</text>;
  // coupe : 12 étages, cage d'escalier, ascenseur en panne
  const cutA = prog(T, cut0 + 0.25, cut0 + 0.8, easeOut);
  const stairK = prog(T, B.esc + 0.35, B.esc + 1.5, easeInOut);
  const floors = 12, fy0 = 480, fh = 92, bx0 = 300, bx1 = 780;
  const stairPath = Array.from({length: floors}, (_, i) => {
    const yb = fy0 + (floors - i) * fh, yt = yb - fh;
    return i % 2 === 0 ? `L700 ${yb} L620 ${yt}` : `L620 ${yb} L700 ${yt}`;
  }).join(' ');
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <rect width={1080} height={1920} fill="#0A1626" />
      {Array.from({length: 48}, (_, i) => <rect key={`h${i}`} x={0} y={i * 40} width={1080} height={1} fill="#13294A" />)}
      {Array.from({length: 27}, (_, i) => <rect key={`v${i}`} x={i * 40} y={0} width={1} height={1920} fill="#13294A" />)}
      <g opacity={1 - toCut} transform={`translate(540,900) rotate(${rot}) scale(${z}) translate(-540,-900)`}>
        {walls.map(([d, L], i) => <Draw key={i} d={d} L={L} k={clamp01(kp * 1.3 - i * 0.04)} stroke={BLUE} w={12} />)}
        {kp > 0.6 ? (
          <g opacity={prog(T, plan0 + 0.5, plan0 + 0.9)}>
            {lab(330, 740, 'CHAMBRE')}
            {lab(730, 780, 'SÉJOUR')}
            {lab(730, 1130, 'CUISINE')}
            {lab(250, 1080, 'SDB')}
            {lab(440, 1080, 'ENTRÉE', DIM, 22)}
          </g>
        ) : null}
        {/* la porte : seule entrée */}
        <g opacity={kp}>
          <path d="M390 1240 L390 1160 A80 80 0 0 1 470 1240" fill="none" stroke={door > 0 ? RED : DIM} strokeWidth={6} style={door > 0 ? {filter: `drop-shadow(0 0 10px ${RED})`} : undefined} />
          {door > 0 ? <g opacity={door}>{lab(430, 1310, '1 PORTE', RED, 34)}</g> : null}
        </g>
        {/* trois fenêtres */}
        {[[220, 560, 420, 560], [620, 560, 840, 560], [940, 660, 940, 900]].map(([x1, y1, x2, y2], i) => (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={winK[i] > 0 ? CYAN : BLUE} strokeWidth={winK[i] > 0 ? 18 : 12} style={winK[i] > 0 ? {filter: `drop-shadow(0 0 12px ${CYAN})`} : undefined} opacity={kp} />
            {winK[i] > 0 ? <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={20 + 50 * winK[i]} fill="none" stroke={CYAN} strokeWidth={4} opacity={1 - winK[i]} /> : null}
          </g>
        ))}
        {winK[2] > 0 ? <g opacity={winK[2]}>{lab(540, 500, '3 FENÊTRES', CYAN, 34)}</g> : null}
        <g opacity={prog(T, plan0 + 0.6, plan0 + 1.0)}>
          <HeroTop x={730} y={860} s={70} l={[700, 830]} r={[760, 830]} />
        </g>
      </g>
      {toCut > 0 ? (
        <g opacity={cutA}>
          <rect x={bx0} y={fy0} width={bx1 - bx0} height={floors * fh} fill="none" stroke={BLUE} strokeWidth={8} />
          {Array.from({length: floors - 1}, (_, i) => <line key={i} x1={bx0} y1={fy0 + (i + 1) * fh} x2={bx1} y2={fy0 + (i + 1) * fh} stroke={DIM} strokeWidth={3} />)}
          {Array.from({length: floors}, (_, i) => lab(bx0 - 46, fy0 + (i + 0.6) * fh, String(floors - i), DIM, 22))}
          {/* ascenseur hors service */}
          <rect x={520} y={fy0} width={70} height={floors * fh} fill="none" stroke={DIM} strokeWidth={3} strokeDasharray="10 10" />
          <path d={`M520 ${fy0 + 5.5 * fh} l70 80 M590 ${fy0 + 5.5 * fh} l-70 80`} stroke={RED} strokeWidth={8} />
          {lab(555, fy0 + floors * fh + 110, 'ASCENSEUR HS', RED, 22)}
          {/* l'escalier : seul chemin vers le haut */}
          <Draw d={`M620 ${fy0 + floors * fh} ${stairPath}`} L={floors * 160} k={stairK} stroke={CYAN} w={7} glow={CYAN} />
          {stairK > 0.95 ? lab(660, fy0 + floors * fh + 60, '1 SEUL ESCALIER', CYAN, 30) : null}
          {/* toi, tout en haut ; eux, en bas */}
          <rect x={bx0 + 6} y={fy0 + 6} width={200} height={fh - 12} fill="rgba(255,90,74,0.18)" />
          <g transform={`translate(${bx0 + 70},${fy0 + fh / 2})`}>
            <circle r={26} fill={HERO.beanie} stroke="#FFFFFF" strokeWidth={4} />
            <circle cy={-8} r={9} fill={HERO.pom} />
          </g>
          {lab(bx0 + 170, fy0 + fh / 2 + 11, 'TOI', RED, 32)}
          {Array.from({length: 7}, (_, i) => (
            <Stick key={i} p={shamble(T * 1.6 + i * 0.3)} x={bx0 + 30 + i * 62} y={fy0 + floors * fh - 6} h={80} look="zombie" />
          ))}
        </g>
      ) : null}
    </svg>
  );
};

// ---------------- règle 1 : la barricade ----------------
export const Barricade: React.FC<SceneP> = ({T, B}) => {
  const frame = useCurrentFrame();
  const h = 560;
  const walkIn = [B.r1 - 0.05, B.r1 + 0.55] as const;
  const push = [B.r1 + 0.55, B.cana + 0.25] as const;
  const tip = B.armoire + 0.05;
  const couchX = lerp(560, 104, prog(T, push[0], push[1], (x) => easeInOut(x) * 0.96 + 0.04 * Math.sin(x * Math.PI * 7) * (1 - x)));
  // perso : entre par la droite, pousse le canapé, bascule l'armoire, recule
  let hx: number, pose: Pose, flip = true, bob = 0;
  if (T < push[0]) {
    const k = prog(T, walkIn[0], walkIn[1]);
    hx = lerp(1150, couchX + 400 + 0.17 * h, k);
    const s = stride(k * 1.4, 24);
    pose = s.pose; bob = s.bob;
  } else if (T < B.armoire - 0.15) {
    hx = couchX + 400 + 0.17 * h;
    const s = stride((T - push[0]) * 0.8, 20, {...P.stand, torso: 24, head: 6, aL: 90, aLb: -4, aR: 98, aRb: -8});
    pose = {...s.pose, aL: 90 + 3 * Math.sin(T * 9), aR: 98 - 3 * Math.sin(T * 9)}; bob = s.bob;
  } else if (T < B.lourd + 0.2) {
    hx = 104 + 400 + 0.17 * h;
    const k = prog(T, B.armoire - 0.15, tip + 0.1, easeOut);
    pose = mix(P.stand, {...P.stand, torso: 8, head: 16, aR: 150, aRb: -14, aL: 140, aLb: -20}, k);
  } else {
    const k = prog(T, B.lourd + 0.2, B.lourd + 1.0);
    hx = lerp(104 + 400 + 0.17 * h, 790, k);
    if (k < 1) {
      const s = stride(k * 1.2, 20);
      pose = {...s.pose}; bob = s.bob; flip = false;
    } else pose = breathe({...P.stand, head: 8}, T, 1.4);
    flip = k >= 1;
  }
  // armoire : bascule autour de son coin bas gauche, rebondit, se cale
  const fall = prog(T, tip, tip + 0.42, easeIn);
  const settle = T > tip + 0.42 ? Math.exp(-(T - tip - 0.42) * 9) * Math.sin((T - tip - 0.42) * 30) * 3 : 0;
  const ang = -26 * fall + (fall >= 1 ? 2.5 + settle : 0);
  const impact = (t0: number) => (T > t0 ? Math.exp(-(T - t0) * 10) : 0);
  const shake = 14 * impact(tip + 0.42) + 6 * [0, 1, 2, 3].reduce((m, i) => Math.max(m, impact(B.lourd + 0.1 + i * 0.27 + 0.32)), 0);
  const sx = (rand(frame * 1.3) - 0.5) * shake, sy = (rand(frame * 2.1) - 0.5) * shake;
  const drop = (t0: number) => {
    const k = clamp01((T - t0) / 0.32);
    const y = -900 * (1 - k * k);
    const sq = T > t0 + 0.32 ? Math.exp(-(T - t0 - 0.32) * 12) * Math.sin((T - t0 - 0.32) * 40) * 0.12 : 0;
    return {y, sq, on: T >= t0};
  };
  const items = [
    {t0: B.lourd + 0.1, el: (sq: number) => <g transform={`translate(205,1352) scale(${1 + sq},${1 - sq})`}><rect x={-75} y={-120} width={150} height={120} fill="#B88A55" stroke="#5A3E22" strokeWidth={5} /><rect x={-75} y={-120} width={150} height={22} fill="#A07444" /><rect x={-10} y={-120} width={20} height={120} fill="#D8C08A" opacity={0.7} /></g>},
    {t0: B.lourd + 0.37, el: (sq: number) => <g transform={`translate(380,1352) scale(${1 + sq},${1 - sq})`}><rect x={-70} y={-24} width={140} height={20} fill="#7A4A2A" stroke="#3A2414" strokeWidth={4} />{[-60, 50].map((lx) => <rect key={lx} x={lx} y={-150} width={10} height={130} fill="#7A4A2A" stroke="#3A2414" strokeWidth={3} />)}<rect x={-70} y={-150} width={140} height={14} fill="#7A4A2A" stroke="#3A2414" strokeWidth={3} /></g>},
    {t0: B.lourd + 0.64, el: (sq: number) => <g transform={`translate(205,1232) scale(${1 + sq},${1 - sq})`}><rect x={-80} y={-90} width={160} height={90} rx={8} fill="#D6D8DC" stroke="#4A4C52" strokeWidth={5} /><rect x={-66} y={-76} width={96} height={62} rx={4} fill="#2A2C32" /><circle cx={56} cy={-56} r={7} fill="#4A4C52" /></g>},
    {t0: B.lourd + 0.91, el: (sq: number) => <g transform={`translate(385,1202) scale(${1 + sq},${1 - sq})`}><rect x={-95} y={-110} width={190} height={110} rx={8} fill="#1C1C22" stroke="#4A4A55" strokeWidth={5} /><rect x={-82} y={-98} width={164} height={86} fill="#2A3040" /></g>},
  ];
  const z = lerp(1.0, 1.06, prog(T, B.r1, B.r2, (x) => x));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="bcWall" stops={[[0, '#5A4E44'], [1, '#463C34']]} />
        <VGrad id="bcFloor" stops={[[0, '#3E2C20'], [1, '#2A1E16']]} />
        <VGrad id="bcSky" stops={[[0, '#AFC2D4'], [1, '#E2E6EA']]} />
        <VGrad id="armoire" stops={[[0, '#7A5034'], [1, '#5A3822']]} />
      </defs>
      <g transform={`translate(${540 + sx},${1100 + sy}) scale(${z}) translate(-540,-1100)`}>
        <rect width={1080} height={1920} fill="url(#bcWall)" />
        {Array.from({length: 22}, (_, i) => <rect key={i} x={i * 52} y={0} width={20} height={1500} fill="rgba(255,255,255,0.025)" />)}
        {/* fenêtre : lumière du matin */}
        <rect x={700} y={560} width={300} height={420} fill="#2A221C" />
        <rect x={714} y={574} width={272} height={392} fill="url(#bcSky)" />
        <rect x={846} y={574} width={8} height={392} fill="#2A221C" />
        <path d="M714 966 L986 966 L1180 1500 L560 1500 Z" fill="rgba(230,240,255,0.10)" filter="url(#b24)" />
        <rect x={0} y={1480} width={1080} height={20} fill="#2E221A" />
        <rect x={0} y={1500} width={1080} height={420} fill="url(#bcFloor)" />
        {Array.from({length: 8}, (_, i) => <rect key={`f${i}`} x={0} y={1530 + i * 50} width={1080} height={2} fill="rgba(0,0,0,0.3)" />)}
        {/* la porte (judas, chaîne) */}
        <rect x={76} y={846} width={248} height={656} fill="#2E1E14" />
        <rect x={90} y={860} width={220} height={640} fill="#5C3424" />
        <rect x={110} y={890} width={180} height={260} fill="none" stroke="#4A2A1C" strokeWidth={6} />
        <rect x={110} y={1190} width={180} height={270} fill="none" stroke="#4A2A1C" strokeWidth={6} />
        <circle cx={200} cy={960} r={8} fill="#1A0E08" stroke="#B89A5A" strokeWidth={3} />
        <circle cx={275} cy={1180} r={13} fill="#C8A85A" />
        <path d="M260 1100 q-30 26 -10 50" stroke="#B89A5A" strokeWidth={5} fill="none" />
        {/* l'armoire qui bascule vers la porte */}
        <g transform={`rotate(${ang},330,1500)`}>
          <rect x={330} y={740} width={170} height={760} fill="url(#armoire)" stroke="#2E1C10" strokeWidth={6} />
          <rect x={322} y={724} width={186} height={24} fill="#4A2E1A" />
          <line x1={415} y1={760} x2={415} y2={1480} stroke="#2E1C10" strokeWidth={5} />
          <circle cx={400} cy={1120} r={7} fill="#C8A85A" />
          <circle cx={430} cy={1120} r={7} fill="#C8A85A" />
        </g>
        {fall >= 1 ? <g opacity={1 - prog(T, tip + 0.42, tip + 1.4)}><Dust x0={120} y0={1100} x1={560} y1={1480} T={T * 3} n={40} o={0.8} seed={7} /></g> : null}
        {/* canapé poussé contre la porte */}
        <g transform={`translate(${couchX},0)`}>
          <ellipse cx={200} cy={1504} rx={220} ry={14} fill="rgba(0,0,0,0.45)" filter="url(#b8)" />
          <rect x={0} y={1250} width={400} height={170} rx={34} fill="#2C5A5E" stroke="#163235" strokeWidth={6} />
          <rect x={18} y={1350} width={364} height={110} rx={22} fill="#336A6E" stroke="#163235" strokeWidth={6} />
          <rect x={-18} y={1300} width={60} height={170} rx={24} fill="#2C5A5E" stroke="#163235" strokeWidth={6} />
          <rect x={358} y={1300} width={60} height={170} rx={24} fill="#2C5A5E" stroke="#163235" strokeWidth={6} />
          <rect x={260} y={1280} width={90} height={80} rx={16} fill="#D9A04A" stroke="#7A5420" strokeWidth={5} transform="rotate(-10,305,1320)" />
          {[20, 370].map((lx) => <rect key={lx} x={lx} y={1468} width={14} height={30} fill="#163235" />)}
        </g>
        {T > push[0] && T < push[1] ? <path d={`M${couchX + 420} 1495 l60 0 M${couchX + 430} 1480 l40 -6`} stroke="rgba(255,255,255,0.4)" strokeWidth={4} /> : null}
        {items.map((it, i) => {
          const d = drop(it.t0);
          return d.on ? <g key={i} transform={`translate(0,${d.y})`}>{it.el(d.sq)}</g> : null;
        })}
        <Hero p={pose} x={hx} y={1500 + bob * h} h={h} flip={flip} light={{amb: 0.95, tint: '#2A2420'}} />
      </g>
    </svg>
  );
};

// ---------------- règle 2 : garder de l'eau ----------------
export const Eau: React.FC<SceneP> = ({T, B}) => {
  const h = 540;
  const on = B.r2t - 0.1, stop = B.sec + 0.4;
  const level = lerp(1442, 1218, prog(T, on, B.sec + 0.2, (x) => 1 - (1 - x) * (1 - x)));
  const flowW = 16 * prog(T, on, on + 0.25, easeOut) * (1 - prog(T, stop, stop + 1.4, easeIn));
  const drips = T > stop + 1.2;
  // perso : ouvre le robinet, puis apporte les casseroles
  let hx: number, pose: Pose, flip = true, bob = 0;
  const carry0 = B.bain + 0.3, carry1 = carry0 + 1.3;
  if (T < carry0) {
    hx = 390;
    const k = prog(T, B.r2 + 0.1, on, easeOut) * (1 - prog(T, on + 0.5, on + 0.9, easeInOut));
    pose = breathe(mix(P.stand, {...P.reach, torso: 14, aR: 70, aRb: 10}, k), T);
  } else if (T < carry1) {
    const k = prog(T, carry0, carry1, easeInOut);
    hx = lerp(390, 880, k);
    const s = stride(k * 2.2, 22, P.hold);
    pose = {...s.pose, aL: P.hold.aL, aLb: P.hold.aLb, aR: P.hold.aR, aRb: P.hold.aRb}; bob = s.bob; flip = false;
  } else {
    hx = 880;
    pose = breathe(mix(P.hold, {...P.stand, head: 10}, prog(T, carry1, carry1 + 0.4)), T);
    flip = T > B.sec;
  }
  const pots = [0, 1, 2].map((i) => ({x: 820 + i * 92, on: prog(T, B.bain + 0.75 + i * 0.25, B.bain + 0.95 + i * 0.25, easeOut), fill: prog(T, B.bain + 0.9 + i * 0.25, B.sec + 1.5)}));
  const bottles = Array.from({length: 7}, (_, i) => ({x: 110 + i * 142, fill: prog(T, B.bain + 1.3 + i * 0.22, B.bain + 2.4 + i * 0.22, easeInOut)}));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="eWall" stops={[[0, '#33586E'], [1, '#26465A']]} />
        <VGrad id="water" stops={[[0, 'rgba(110,190,240,0.9)'], [1, 'rgba(40,110,170,0.95)']]} />
        <VGrad id="tub" stops={[[0, '#F4F6F8'], [1, '#C9D1D8']]} />
      </defs>
      <g transform={`translate(540,1200) scale(${lerp(1.0, 1.05, prog(T, B.r2, B.r3, (x) => x))}) translate(-540,-1200)`}>
        <rect width={1080} height={1920} fill="url(#eWall)" />
        {Array.from({length: 30}, (_, i) => <rect key={i} x={0} y={i * 60} width={1080} height={3} fill="rgba(0,0,0,0.12)" />)}
        {Array.from({length: 20}, (_, i) => <rect key={`v${i}`} x={i * 60 + (Math.floor(i / 2) % 2) * 0} y={0} width={3} height={1480} fill="rgba(0,0,0,0.1)" />)}
        <rect x={0} y={1470} width={1080} height={460} fill="#1C2C36" />
        {Array.from({length: 10}, (_, i) => <rect key={`t${i}`} x={i * 120} y={1470} width={3} height={460} fill="rgba(255,255,255,0.05)" />)}
        {/* rideau de douche, petite fenêtre */}
        <rect x={810} y={420} width={190} height={240} fill="#1A2A34" />
        <rect x={822} y={432} width={166} height={216} fill="#C9D6E0" />
        <path d="M100 520 Q140 800 110 1170 L60 1170 Q80 800 40 520 Z" fill="#4E8A8E" opacity={0.9} />
        {/* robinet et filet d'eau */}
        <rect x={150} y={1060} width={22} height={90} rx={8} fill="#B8C2CC" />
        <path d="M160 1070 L240 1070 Q262 1070 262 1092 L262 1110" stroke="#C8D2DC" strokeWidth={18} fill="none" strokeLinecap="round" />
        <circle cx={160} cy={1040} r={20} fill="#D8E0E8" stroke="#8A96A2" strokeWidth={4} />
        {flowW > 0.5 ? (
          <g>
            <rect x={262 - flowW / 2} y={1112} width={flowW} height={level - 1112} fill="rgba(170,220,255,0.85)" />
            {Array.from({length: 8}, (_, i) => <rect key={i} x={262 - flowW / 4} y={1112 + (((T * 900 + i * 60) % (level - 1112)))} width={flowW / 2} height={18} fill="rgba(255,255,255,0.7)" />)}
            {Array.from({length: 6}, (_, i) => {
              const a = ((T * 5 + i / 6) % 1);
              return <circle key={`s${i}`} cx={262 + (i - 2.5) * 14 * a} cy={level - 30 * Math.sin(Math.PI * a)} r={4} fill="rgba(220,240,255,0.8)" opacity={1 - a} />;
            })}
          </g>
        ) : null}
        {drips ? [0, 1].map((i) => {
          const a = ((T - stop) * 1.3 + i * 0.5) % 1;
          return <circle key={`dr${i}`} cx={262} cy={1112 + a * (level - 1112)} r={6} fill="rgba(170,220,255,0.9)" />;
        }) : null}
        {/* baignoire qui se remplit */}
        <rect x={110} y={1170} width={660} height={300} rx={40} fill="url(#tub)" stroke="#8A96A2" strokeWidth={6} />
        <rect x={140} y={1196} width={600} height={252} rx={26} fill="#B9C4CE" />
        <rect x={140} y={level} width={600} height={1448 - level} rx={18} fill="url(#water)" />
        <path d={`M150 ${level} ${Array.from({length: 13}, (_, i) => `Q${165 + i * 46} ${level + 5 * Math.sin(T * 4 + i)} ${188 + i * 46} ${level}`).join(' ')}`} stroke="rgba(255,255,255,0.7)" strokeWidth={4} fill="none" />
        <rect x={110} y={1170} width={660} height={26} rx={13} fill="#FFFFFF" />
        {[150, 720].map((lx) => <rect key={lx} x={lx} y={1468} width={28} height={24} rx={8} fill="#8A96A2" />)}
        {/* casseroles posées au sol */}
        {pots.map((p, i) => (
          <g key={i} transform={`translate(${p.x},${1470 - (1 - p.on) * 60})`} opacity={p.on}>
            <rect x={-40} y={-62} width={80} height={62} rx={8} fill="#8E98A4" stroke="#4A525C" strokeWidth={4} />
            <rect x={-34} y={-56 + 50 * (1 - p.fill)} width={68} height={50 * p.fill} fill="rgba(80,160,220,0.9)" />
            <rect x={40} y={-56} width={46} height={10} rx={5} fill="#3A3F48" />
          </g>
        ))}
        <Hero p={pose} x={hx} y={1478 + bob * h} h={h} flip={flip} />
        {/* premier plan : les bidons qui se remplissent */}
        {bottles.map((b, i) => (
          <g key={i} transform={`translate(${b.x},1880)`}>
            <rect x={-56} y={-250} width={112} height={250} rx={22} fill="rgba(200,230,255,0.22)" stroke="rgba(220,240,255,0.65)" strokeWidth={5} />
            <rect x={-48} y={-242 + 234 * (1 - b.fill)} width={96} height={234 * b.fill} rx={16} fill="rgba(70,150,215,0.85)" />
            <rect x={-20} y={-282} width={40} height={36} rx={6} fill="#2E6FA8" />
            <path d="M30 -230 q30 0 30 40" stroke="rgba(220,240,255,0.6)" strokeWidth={6} fill="none" />
          </g>
        ))}
      </g>
    </svg>
  );
};

// ---------------- règle 3 : rationner (la table vue de dessus) ----------------
type Food = {kind: 'bread' | 'cheese' | 'apple' | 'yog' | 'can' | 'pasta' | 'rice' | 'choc'; from: [number, number]; to: [number, number]; col?: string; r?: number};
const FOODS: Food[] = [
  {kind: 'bread', from: [470, 1470], to: [205, 820]},
  {kind: 'cheese', from: [575, 1420], to: [205, 1030]},
  {kind: 'apple', from: [620, 1510], to: [395, 800]},
  {kind: 'apple', from: [520, 1545], to: [440, 880]},
  {kind: 'yog', from: [420, 1420], to: [413, 1040]},
  {kind: 'can', from: [660, 1440], to: [627, 820], col: '#C8402E'},
  {kind: 'pasta', from: [380, 1510], to: [627, 1040], r: -8},
  {kind: 'can', from: [705, 1520], to: [840, 800], col: '#3E8A4A'},
  {kind: 'rice', from: [565, 1575], to: [840, 1020], r: 6},
  {kind: 'choc', from: [480, 1400], to: [840, 1200], r: -4},
];
const FoodEl: React.FC<{f: Food}> = ({f}) => {
  switch (f.kind) {
    case 'bread': return <g><ellipse rx={95} ry={42} fill="#C98A44" stroke="#6A4420" strokeWidth={5} />{[-40, 0, 40].map((x) => <path key={x} d={`M${x - 14} -24 q14 20 28 0`} stroke="#8A5A28" strokeWidth={5} fill="none" />)}</g>;
    case 'cheese': return <g><path d="M-70 30 L70 30 L40 -40 Z" fill="#F2C84A" stroke="#8A6A1A" strokeWidth={5} strokeLinejoin="round" />{[[-20, 10], [15, 0], [30, 18]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={7} fill="#D8A82A" />)}</g>;
    case 'apple': return <g><circle r={36} fill="#C8302A" stroke="#5A1410" strokeWidth={5} /><circle cx={-10} cy={-10} r={9} fill="#F06A5A" opacity={0.7} /><rect x={-3} y={-44} width={6} height={14} fill="#4A2A10" /></g>;
    case 'yog': return <g>{[-36, 36].map((x) => <g key={x}><circle cx={x} r={32} fill="#F4F2EC" stroke="#8A8A80" strokeWidth={5} /><circle cx={x} r={20} fill="#E8A0B8" /></g>)}</g>;
    case 'can': return <g><circle r={48} fill="#9AA4AE" stroke="#4A525C" strokeWidth={5} /><circle r={38} fill="none" stroke="#C8D0D8" strokeWidth={4} /><circle r={40} fill="none" stroke={f.col} strokeWidth={8} opacity={0.9} /><rect x={-14} y={-6} width={28} height={12} rx={6} fill="#6A727C" /></g>;
    case 'pasta': return <g transform={`rotate(${f.r ?? 0})`}><rect x={-75} y={-40} width={150} height={80} rx={12} fill="#F2D24A" stroke="#8A6A1A" strokeWidth={5} /><rect x={-40} y={-22} width={80} height={44} rx={8} fill="#2A5AA8" /></g>;
    case 'rice': return <g transform={`rotate(${f.r ?? 0})`}><rect x={-70} y={-50} width={140} height={100} rx={14} fill="#F4F2EC" stroke="#8A8A80" strokeWidth={5} /><rect x={-50} y={-14} width={100} height={30} rx={6} fill="#C83A2E" /></g>;
    case 'choc': return <g transform={`rotate(${f.r ?? 0})`}><rect x={-70} y={-30} width={140} height={60} rx={6} fill="#5A2E1A" stroke="#2A140A" strokeWidth={5} />{[-35, 0, 35].map((x) => <line key={x} x1={x} y1={-26} x2={x} y2={26} stroke="#3A1C0E" strokeWidth={4} />)}</g>;
  }
};

export const Rations: React.FC<SceneP> = ({T, B}) => {
  const frame = useCurrentFrame();
  const m0 = B.jours + 0.15, step = Math.min(0.34, (B.frais - 0.2 - m0) / FOODS.length);
  const moves = FOODS.map((f, i) => ({t0: m0 + i * step, t1: m0 + i * step + step * 0.92}));
  const posOf = (i: number) => {
    const {t0, t1} = moves[i];
    const k = prog(T, t0, t1, easeInOut);
    return {x: lerp(FOODS[i].from[0], FOODS[i].to[0], k), y: lerp(FOODS[i].from[1], FOODS[i].to[1], k), lift: Math.sin(Math.PI * k)};
  };
  // mains : vont chercher l'aliment, l'accompagnent, reviennent
  const hand = (side: -1 | 1): [number, number] => {
    const rest: [number, number] = [540 + side * 150, 1520];
    let best: [number, number] = rest;
    moves.forEach((m, i) => {
      const left = FOODS[i].to[0] < 520;
      if ((side === -1) !== left) return;
      const reach = prog(T, m.t0 - 0.16, m.t0, easeOut) * (1 - prog(T, m.t1, m.t1 + 0.2, easeIn));
      if (reach > 0) {
        const p = posOf(i);
        best = [lerp(rest[0], p.x, reach), lerp(rest[1], p.y, reach)];
      }
    });
    return best;
  };
  const cols = [205, 413, 627, 840];
  const lab = (i: number) => sp(frame, B.jours + 0.1 + i * 0.12, {damping: 11, stiffness: 220, mass: 0.6});
  const repas = (i: number) => prog(T, B.fois + 0.2 + i * 0.18, B.fois + 0.4 + i * 0.18, easeOut);
  const frais = prog(T, B.frais, B.frais + 0.3, easeOut), cons = prog(T, B.frais + 1.15, B.frais + 1.45, easeOut);
  const z = lerp(1.08, 1.0, prog(T, B.r3, B.jours + 1, easeOut));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="table" stops={[[0, '#6E4C30'], [1, '#553722']]} />
        <RGrad id="lamp" stops={[[0, 'rgba(255,230,180,0.35)'], [1, 'rgba(255,230,180,0)']]} />
      </defs>
      <g transform={`translate(540,1060) rotate(${lerp(-3, 0, prog(T, B.r3, B.jours + 1, easeOut))}) scale(${z}) translate(-540,-1060)`}>
        <rect x={-100} y={-100} width={1280} height={2200} fill="url(#table)" />
        {Array.from({length: 12}, (_, i) => <rect key={i} x={-100} y={i * 180} width={1280} height={5} fill="rgba(0,0,0,0.25)" />)}
        {Array.from({length: 40}, (_, i) => <path key={`g${i}`} d={`M${rand(i) * 1080} ${rand(i + 3) * 1920} q60 ${8 - rand(i + 5) * 16} 140 0`} stroke="rgba(0,0,0,0.12)" strokeWidth={3} fill="none" />)}
        <circle cx={540} cy={1000} r={760} fill="url(#lamp)" />
        {/* colonnes JOUR 1 → 4 */}
        {[306, 520, 733].map((x, i) => <line key={x} x1={x} y1={700} x2={x} y2={1300} stroke="rgba(255,250,235,0.55)" strokeWidth={5} strokeDasharray="18 16" opacity={lab(i + 1)} />)}
        {cols.map((x, i) => (
          <g key={x} transform={`translate(${x},640) scale(${lab(i)}) rotate(${(i % 2 ? 2 : -2)})`}>
            <rect x={-82} y={-30} width={164} height={56} fill="#E8DDC0" opacity={0.95} />
            <text x={0} y={10} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={30} fill="#3A2A1A">JOUR {i + 1}</text>
            <g opacity={repas(i)} transform="translate(0,64)">
              <text x={0} y={0} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={22} fill="#FFF6DE">1 REPAS</text>
            </g>
          </g>
        ))}
        {/* frais d'abord (jours 1-2), conserves ensuite (jours 3-4) */}
        <rect x={110} y={720} width={400} height={590} rx={26} fill="none" stroke="#7AE07A" strokeWidth={8} opacity={frais} style={{filter: 'drop-shadow(0 0 10px rgba(120,230,120,0.7))'}} />
        <rect x={530} y={720} width={410} height={590} rx={26} fill="none" stroke="#F2A23C" strokeWidth={8} opacity={cons} style={{filter: 'drop-shadow(0 0 10px rgba(240,160,60,0.7))'}} />
        <g opacity={frais} transform={`translate(310,1360) scale(${lerp(0.6, 1, frais)})`}><rect x={-90} y={-32} width={180} height={56} rx={10} fill="#3A8A3A" /><text x={0} y={10} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={30} fill="#FFFFFF">FRAIS</text></g>
        <g opacity={cons} transform={`translate(735,1360) scale(${lerp(0.6, 1, cons)})`}><rect x={-120} y={-32} width={240} height={56} rx={10} fill="#C8781E" /><text x={0} y={10} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={30} fill="#FFFFFF">CONSERVES</text></g>
        {FOODS.map((f, i) => {
          const p = posOf(i);
          return (
            <g key={i}>
              <g transform={`translate(${p.x + 10 + 18 * p.lift},${p.y + 14 + 18 * p.lift})`} opacity={0.35} filter="url(#b8)"><circle r={50} fill="#000" /></g>
              <g transform={`translate(${p.x},${p.y}) scale(${1 + 0.1 * p.lift})`}><FoodEl f={f} /></g>
            </g>
          );
        })}
        <HeroTop x={540} y={1700} s={150} l={hand(-1)} r={hand(1)} />
      </g>
    </svg>
  );
};

