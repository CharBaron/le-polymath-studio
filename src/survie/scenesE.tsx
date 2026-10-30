// Scènes du jour 2 (« Dernier étage ») : le grimpeur, ta lampe en morse, la lampe de Lina qui tombe, la façade de nuit, la vitre,
// les traces de mains, l'occultation des fenêtres, le téléphone (mode avion, message vocal, alerte), Lina et ses feuilles,
// sa fenêtre brisée (« IL GRIMPE »), le schéma du toit, la porte barricadée qu'on frappe en morse, le regard par la fente.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, easeOut, lerp, prog, rand, sp} from '../theme';
import {breathe, Hero, HERO, Light} from './hero';
import {mix, P, Pose} from './stick';
import {Blurs, Cam, Dust, Glow, SceneP, Skyline, Smoke, Tower, VGrad, winAt} from './world';
import {Girl, LIT_WIN, Opposite} from './scenesC';
import {MorseLetter, morseLit, SF} from './ui';

type Pt = [number, number];
const NIGHT: Light = {amb: 0.3, tint: '#0C1030', rim: '#6F8BFF'};

/** coude d'une articulation à deux segments (côté choisi pour que le coude parte vers `out`) */
const ik = (s: Pt, t: Pt, L1: number, L2: number, out: number): Pt => {
  const dx = t[0] - s[0], dy = t[1] - s[1];
  const d = Math.max(1e-3, Math.min(Math.hypot(dx, dy), L1 + L2 - 1e-3));
  const a = Math.atan2(dy, dx), b = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const e1: Pt = [s[0] + Math.cos(a + b) * L1, s[1] + Math.sin(a + b) * L1], e2: Pt = [s[0] + Math.cos(a - b) * L1, s[1] + Math.sin(a - b) * L1];
  return (e1[0] - s[0]) * out > (e2[0] - s[0]) * out ? e1 : e2;
};

// ---------------- le grimpeur : maigre, membres trop longs, doigts crochus ----------------
export const Grimpeur: React.FC<{x: number; y: number; h: number; phase?: number; mode?: 'climb' | 'cling'; tilt?: number; tap?: number; dark?: boolean; rim?: string; opacity?: number}> = ({
  x, y, h, phase = 0, mode = 'climb', tilt = 0, tap = 0, dark = false, rim = '#B8CCFF', opacity = 1,
}) => {
  const s = Math.sin(phase * Math.PI * 2), bob = mode === 'climb' ? 0.025 * h * Math.sin(phase * Math.PI * 4) : 0;
  const sh: [Pt, Pt] = [[-0.075 * h, -0.36 * h + bob], [0.075 * h, -0.36 * h + bob]];
  const hip: [Pt, Pt] = [[-0.05 * h, 0], [0.05 * h, 0]];
  const T = mode === 'climb'
    ? {lh: [-0.27 * h, -0.62 * h - 0.13 * h * s] as Pt, rh: [0.27 * h, -0.62 * h + 0.13 * h * s] as Pt, lf: [-0.21 * h, 0.34 * h + 0.1 * h * s] as Pt, rf: [0.21 * h, 0.34 * h - 0.1 * h * s] as Pt}
    : {lh: [-0.25 * h, -0.64 * h] as Pt, rh: [0.25 * h - 0.02 * h * tap, -0.6 * h - 0.05 * h * tap] as Pt, lf: [-0.19 * h, 0.36 * h] as Pt, rf: [0.19 * h, 0.36 * h] as Pt};
  const L = 0.23 * h;
  const fill = dark ? '#090B13' : '#B7C2AA', line = dark ? rim : '#141A12';
  const w = 0.034 * h, o = Math.max(2, 0.008 * h);
  const limb = (a: Pt, t: Pt, out: number, k: string, hand: boolean) => {
    const e = ik(a, t, L, L, out);
    const ang = Math.atan2(t[1] - e[1], t[0] - e[0]);
    const pts = `${a[0]},${a[1]} ${e[0]},${e[1]} ${t[0]},${t[1]}`;
    return (
      <g key={k}>
        <polyline points={pts} fill="none" stroke={line} strokeWidth={w + 2 * o} strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={pts} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        {hand ? [-0.5, 0, 0.5].map((da) => {
          const fx = t[0] + Math.cos(ang + da) * 0.075 * h, fy = t[1] + Math.sin(ang + da) * 0.075 * h;
          return <path key={da} d={`M${t[0]} ${t[1]} Q${(t[0] + fx) / 2 + Math.cos(ang + da + 1.2) * 0.012 * h} ${(t[1] + fy) / 2 + Math.sin(ang + da + 1.2) * 0.012 * h} ${fx} ${fy}`} stroke={line} strokeWidth={w * 0.45 + o} fill="none" strokeLinecap="round" />;
        }) : null}
      </g>
    );
  };
  return (
    <g transform={`translate(${x},${y})`} opacity={opacity} style={dark ? {filter: `drop-shadow(0 0 ${0.02 * h}px ${rim})`} : undefined}>
      {limb(hip[0], T.lf, -1, 'lf', false)}
      {limb(hip[1], T.rf, 1, 'rf', false)}
      <path d={`M0 0 Q${0.04 * h} ${-0.2 * h + bob} 0 ${-0.4 * h + bob}`} stroke={line} strokeWidth={w * 1.3 + 2 * o} fill="none" strokeLinecap="round" />
      <path d={`M0 0 Q${0.04 * h} ${-0.2 * h + bob} 0 ${-0.4 * h + bob}`} stroke={fill} strokeWidth={w * 1.3} fill="none" strokeLinecap="round" />
      {limb(sh[0], T.lh, -1, 'lh', true)}
      {limb(sh[1], T.rh, 1, 'rh', true)}
      <g transform={`translate(0,${-0.5 * h + bob}) rotate(${tilt})`}>
        <ellipse rx={0.07 * h + o} ry={0.095 * h + o} fill={line} />
        <ellipse rx={0.07 * h} ry={0.095 * h} fill={fill} />
        <circle cx={-0.025 * h} cy={0.01 * h} r={0.011 * h} fill="#EEF4D8" opacity={dark ? 0.85 : 0.9} />
        <circle cx={0.025 * h} cy={0.01 * h} r={0.011 * h} fill="#EEF4D8" opacity={dark ? 0.85 : 0.9} />
      </g>
    </g>
  );
};

/** fenêtre du salon (900×810) vue de l'intérieur, la nuit : l'immeuble d'en face derrière la vitre */
const NightWindow: React.FC<{T: number; level?: number; children?: React.ReactNode}> = ({T, level, children}) => (
  <g>
    <g transform="translate(110,330)">
      <svg x={0} y={0} width={860} height={760} viewBox="110 330 860 760" overflow="hidden">
        <Opposite T={T} lit={0} level={level} />
        {children}
      </svg>
    </g>
    <rect x={90} y={310} width={900} height={22} fill="#05060A" />
    <rect x={90} y={1090} width={900} height={30} fill="#05060A" />
    <rect x={90} y={310} width={22} height={810} fill="#05060A" />
    <rect x={968} y={310} width={22} height={810} fill="#05060A" />
    <rect x={530} y={310} width={16} height={810} fill="#05060A" />
    <path d="M110 1120 L970 1120 L1200 1920 L-120 1920 Z" fill="rgba(120,150,255,0.06)" filter="url(#b24)" />
    <rect x={-200} y={1120} width={1480} height={900} fill="#090A10" />
  </g>
);

// ---------------- A · accroche : ta lampe en S.O.S., Lina répond « MUR » ----------------
export const FenetreSOS: React.FC<SceneP & {mine: MorseLetter[]; hers: MorseLetter[]; herSteadyUntil: number}> = ({T, mine, hers, herSteadyUntil}) => {
  const myOn = morseLit(T, mine) ? 1 : 0;
  const herOn = T < herSteadyUntil ? 1 : morseLit(T, hers) ? 1 : 0;
  const k = prog(T, 0, 0.6, easeOut);
  const pose: Pose = breathe({...P.standArmsDown, aR: lerp(20, 128, k), aRb: lerp(0, -14, k), head: 6}, T, 0.4);
  const h = 1150, x = 600, y = 2080;
  const warm: Light = myOn ? {amb: 0.75, tint: '#2A1E10', rim: '#FFD08A'} : NIGHT;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <g transform={`translate(540,900) scale(${lerp(1.0, 1.08, prog(T, 0, 12, (q) => q))}) translate(-540,-900)`}>
        <rect width={1080} height={1920} fill="#07080E" />
        <NightWindow T={T} level={herOn} />
        {myOn ? <path d={`M${x + 260} 1120 L${LIT_WIN.x - 40} ${LIT_WIN.y - 30} L${LIT_WIN.x + 90} ${LIT_WIN.y + 100} L${x + 330} 1180 Z`} fill="rgba(255,236,190,0.22)" filter="url(#b14)" /> : null}
        <Hero p={pose} x={x} y={y} h={h} light={warm} />
        {myOn ? <Glow x={x + 300} y={1150} r={160} color="#FFF0C8" o={0.8} blur={40} /> : null}
      </g>
    </svg>
  );
};

// ---------------- B · accroche : tu restes dans le noir, sa lampe insiste, tombe, s'éteint ----------------
export const LampeTombe: React.FC<SceneP & {hers: MorseLetter[]; steadyUntil: number; fall: number; out: number}> = ({T, hers, steadyUntil, fall, out}) => {
  const falling = prog(T, fall, fall + 0.5, easeIn);
  const herOn = T < steadyUntil ? 1 : T < fall ? (morseLit(T, hers) ? 1 : 0.12) : T < out ? lerp(0.9, 0.3, falling) * (0.8 + 0.2 * Math.sin(T * 40)) : 0;
  const pose: Pose = breathe({...P.sitKnees, head: lerp(14, -16, prog(T, out, out + 1.2, easeInOut))}, T, 0.8);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      {/* on part serré sur la lampe de Lina, puis on recule jusqu'à toi quand sa fenêtre s'éteint */}
      <Cam x={lerp(LIT_WIN.x + 22, 540, prog(T, fall, out + 1.4, easeInOut))} y={lerp(LIT_WIN.y + 29, 880, prog(T, fall, out + 1.4, easeInOut))} z={lerp(2.1, 1.05, prog(T, fall, out + 1.4, easeInOut))}>
        <rect x={-400} y={-400} width={1880} height={2720} fill="#07080E" />
        <NightWindow T={T} level={herOn}>
          {T > fall && T < out ? <path d={`M${LIT_WIN.x + 22} ${LIT_WIN.y + 30} l${-60 + 120 * falling} ${-140 + 200 * falling} l40 0 Z`} fill="rgba(255,240,200,0.5)" filter="url(#b8)" /> : null}
        </NightWindow>
        <Hero p={pose} x={300} y={1640} hipY={0} h={600} light={NIGHT} />
      </Cam>
    </svg>
  );
};

// ---------------- A · la façade de nuit : le grimpeur monte vers ta fenêtre ----------------
const TW = {x: 330, y: 560, w: 420, floors: 12, fh: 95, cols: 6};
const [OWX, OWY] = winAt(TW.x, TW.y, TW.w, TW.floors, TW.fh, TW.cols, 12, 2);
const sill = (f: number) => TW.y + 18 + (TW.floors - f) * TW.fh + 66;
export const FacadeNuit: React.FC<SceneP & {look: number; climb: [number, number]; off: number}> = ({T, look, climb, off}) => {
  const c = prog(T, climb[0], climb[1], (q) => q * (0.85 + 0.15 * q));
  const cx = OWX + 22, cy = lerp(sill(7) + 30, sill(12) + 18, c);
  const floor = Math.min(12, Math.floor(7 + c * 5.2));
  const lit = T < off ? 1 : Math.max(0, 1 - (T - off) * 6);
  const kz = prog(T, look, climb[0], easeInOut), kf = prog(T, climb[0], climb[0] + 1.2, easeInOut);
  const camY = lerp(lerp(OWY + 30, cy - 40, kf), OWY + 50, prog(T, climb[1] - 1.2, climb[1], easeInOut));
  const z = lerp(4.6, 3.0, kz) * lerp(1, 1.15, prog(T, climb[1] - 1.2, climb[1], easeInOut));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="fnSky" stops={[[0, '#04050C'], [1, '#141B38']]} />
        <VGrad id="fnBody" stops={[[0, '#232840'], [1, '#141726']]} />
      </defs>
      <Cam x={cx} y={camY} z={z}>
        <rect x={-500} y={-500} width={2080} height={3000} fill="url(#fnSky)" />
        <circle cx={760} cy={420} r={30} fill="#EEF0F8" />
        <Skyline y={1600} seed={13} color="#0C0E1A" lit="#F2BE6A" litRatio={0.01} hMin={500} hMax={900} />
        <Tower {...TW} body="url(#fnBody)" edge="#3A4A8A" dark="#0B0D18" win={(f, cc) => (f === 12 && cc === 2 && lit > 0.5 ? '#FFE2A8' : null)} />
        {lit > 0 ? (
          <g opacity={lit}>
            <path d={`M${OWX - 6} ${OWY + 60} L${OWX + 50} ${OWY + 60} L${OWX + 90} ${OWY + 420} L${OWX - 46} ${OWY + 420} Z`} fill="rgba(255,226,168,0.16)" filter="url(#b8)" />
            <Glow x={OWX + 22} y={OWY + 30} r={60} color="#FFE2A8" o={0.6} blur={14} />
            {/* toi qui te penches, bonnet rouge dans la fenêtre */}
            <circle cx={OWX + 22} cy={OWY + 46} r={10} fill="#2A2420" />
            <path d={`M${OWX + 12} ${OWY + 44} A10 10 0 0 1 ${OWX + 32} ${OWY + 44} Z`} fill={HERO.beanie} />
          </g>
        ) : null}
        {/* rebords de fenêtres */}
        {Array.from({length: 12}, (_, i) => <rect key={i} x={OWX - 6} y={sill(i + 1) - 6} width={56} height={5} fill="#2E3450" />)}
        <Grimpeur x={cx} y={cy} h={120} phase={c * 7} mode={c >= 1 ? 'cling' : 'climb'} tilt={c >= 1 ? 14 * Math.sin(T * 0.8) : 0} />
        <g transform={`translate(${cx + 58},${cy - 40})`} opacity={prog(T, climb[0] + 0.3, climb[0] + 0.6) * (1 - prog(T, climb[1] - 0.2, climb[1] + 0.2))}>
          <rect x={-4} y={-15} width={54} height={22} rx={6} fill="rgba(10,10,14,0.8)" stroke="#D2F84A" strokeWidth={1.5} />
          <text x={23} y={2} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={13} fill="#D2F84A">{floor}E</text>
        </g>
      </Cam>
    </svg>
  );
};

// ---------------- la vitre : il est derrière, il écoute, toc toc toc ----------------
export const Vitre: React.FC<SceneP & {appear: number; taps: number[]; fingers?: number; meter?: number}> = ({T, appear, taps, fingers, meter}) => {
  const rise = prog(T, appear, appear + 1.6, easeOut);
  const lastTap = taps.filter((t) => T >= t).pop();
  const tapK = lastTap !== undefined ? Math.max(0, 1 - (T - lastTap) / 0.18) : 0;
  const shake = lastTap !== undefined ? Math.exp(-(T - lastTap) * 18) * 3 : 0;
  const hy = lerp(2000, 1240, rise);
  const fk = fingers !== undefined ? prog(T, fingers, fingers + 0.8, easeOut) * (1 - rise) : 0;
  const pose: Pose = breathe({...P.sitKnees, head: -18, aL: 66, aR: 74}, T * 1.6, 1.2);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <g transform={`translate(${540 + (rand(Math.floor(T * 30)) - 0.5) * shake},900) scale(${lerp(1.0, 1.1, prog(T, appear, appear + 8, (q) => q))}) translate(-540,-900)`}>
        <rect width={1080} height={1920} fill="#07080E" />
        <NightWindow T={T} level={0}>
          <Grimpeur x={600} y={hy} h={900} mode="cling" tilt={lerp(0, 22, prog(T, appear + 1.8, appear + 3.2, easeInOut)) + 4 * Math.sin(T * 0.9)} tap={tapK} dark />
          {fk > 0 ? [0, 1, 2].map((i) => <path key={i} d={`M${640 + i * 26} 1100 q${4 + i * 2} ${-60 * fk} ${-6 + i * 6} ${-110 * fk}`} stroke="#B8CCFF" strokeWidth={9} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px #B8CCFF)'}} />) : null}
          {lastTap !== undefined && T - lastTap < 0.6 ? <circle cx={600 + 0.23 * 900} cy={hy - 0.62 * 900} r={20 + 160 * (T - lastTap)} fill="none" stroke="#DDE6FF" strokeWidth={5} opacity={1 - (T - lastTap) / 0.6} /> : null}
        </NightWindow>
        <Hero p={pose} x={250} y={1660} hipY={0} h={600} light={NIGHT} />
        {meter !== undefined ? (
          <g opacity={prog(T, meter, meter + 0.3) * (1 - prog(T, meter + 2.6, meter + 3))} transform="translate(980,1060)">
            <rect x={-250} y={-40} width={250} height={56} rx={10} fill="rgba(6,8,14,0.85)" stroke="#D2F84A" strokeWidth={3} />
            <text x={-125} y={-3} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={28} fill="#D2F84A">↓ 12E · 36 M</text>
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ---------------- au matin : les traces de mains sur la vitre ----------------
export const Traces: React.FC<SceneP & {pull: number; enter?: number}> = ({T, pull, enter}) => {
  const kz = prog(T, pull, pull + 2.2, easeInOut);
  const z = lerp(2.3, 1.0, kz) * lerp(1, 1.04, prog(T, pull + 2.2, pull + 9, (q) => q));
  const fx = lerp(520, 540, kz), fy = lerp(700, 900, kz);
  const he = enter !== undefined ? prog(T, enter, enter + 1.4, easeInOut) : 0;
  const hand = (x: number, y: number, r: number, s: number, k: string) => (
    <g key={k} transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={0.5} filter="url(#b2)">
      <ellipse rx={36} ry={44} fill="rgba(230,236,240,0.55)" />
      {[-30, -10, 10, 30].map((dx, i) => <path key={i} d={`M${dx * 0.7} -30 q${dx * 0.2} -50 ${dx * 0.5} -95`} stroke="rgba(230,236,240,0.55)" strokeWidth={14} strokeLinecap="round" fill="none" />)}
      <path d="M-40 10 q-30 -10 -50 -40" stroke="rgba(230,236,240,0.55)" strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d="M-20 40 l-6 120 M10 44 l4 140" stroke="rgba(230,236,240,0.3)" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="trSky" stops={[[0, '#7E8BA0'], [0.6, '#C9B9B6'], [1, '#E8CFC0']]} />
        <VGrad id="trRoom" stops={[[0, '#3A3C46'], [1, '#24252C']]} />
      </defs>
      <Cam x={fx} y={fy} z={z}>
        <rect x={-300} y={-300} width={1680} height={2600} fill="url(#trRoom)" />
        <rect x={112} y={332} width={856} height={758} fill="url(#trSky)" />
        <Smoke x={300} y={1000} T={T} seed={91} scale={0.9} color="#6A6670" o={0.4} />
        <Skyline y={1090} seed={93} color="#5A5C6A" lit="#FFFFFF" litRatio={0} hMin={120} hMax={360} x0={112} x1={968} wMin={60} wMax={130} />
        <rect x={112} y={332} width={150} height={758} fill="#4E5262" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={140} y={360 + i * 120} width={40} height={52} fill="#3A3D4A" />)}
        {hand(380, 760, -12, 1.1, 'a')}
        {hand(650, 640, 10, 1.15, 'b')}
        {hand(540, 940, -4, 1.0, 'c')}
        <rect x={90} y={310} width={900} height={22} fill="#1A1B22" />
        <rect x={90} y={1090} width={900} height={30} fill="#1A1B22" />
        <rect x={90} y={310} width={22} height={810} fill="#1A1B22" />
        <rect x={968} y={310} width={22} height={810} fill="#1A1B22" />
        <rect x={530} y={310} width={16} height={810} fill="#1A1B22" />
        <rect x={-300} y={1120} width={1680} height={900} fill="#1E1F25" />
        <path d="M112 1120 L968 1120 L1180 1920 L-100 1920 Z" fill="rgba(240,220,210,0.08)" filter="url(#b24)" />
        {enter !== undefined ? <Hero p={he < 1 ? P.stand : breathe({...P.stand, head: 10}, T)} x={lerp(1250, 800, he)} y={1720} h={700} flip light={{amb: 0.8, tint: '#2A2A34'}} /> : null}
      </Cam>
    </svg>
  );
};

// ---------------- règle 5 : occulter les fenêtres (cartons, scotch, couverture) ----------------
export const Occulter: React.FC<SceneP & {t0: number; seal: number}> = ({T, t0, seal}) => {
  const panes: [number, number, number, number][] = [[140, 400, 380, 360], [560, 400, 380, 360], [140, 780, 380, 360], [560, 780, 380, 360]];
  const at = panes.map((_, i) => lerp(t0 + 1.3, seal - 1.2, i / 3));
  const cover = panes.map((_, i) => prog(T, at[i], at[i] + 0.4, easeOut));
  const blanket = prog(T, seal - 0.7, seal - 0.1, easeOut);
  const dark = 0.18 + 0.5 * cover.reduce((a, b) => a + b, 0) / 4 + 0.2 * blanket;
  // le perso va d'un carreau à l'autre et tend les bras
  let idx = panes.findIndex((_, i) => T < at[i] + 0.45);
  if (idx < 0) idx = 3;
  const target = panes[idx][0] + 190;
  const prev = idx > 0 ? panes[idx - 1][0] + 190 : 960;
  const kmove = prog(T, (idx > 0 ? at[idx - 1] + 0.45 : t0), at[idx] - 0.05, easeInOut);
  const hx = lerp(prev, target, kmove);
  const high = panes[idx][1] < 600;
  const reach: Pose = high ? {...P.stand, aL: -165, aLb: -8, aR: 165, aRb: 8, head: -10} : {...P.stand, aL: -110, aLb: -10, aR: 110, aRb: 10};
  const walking = kmove > 0 && kmove < 1;
  const pose: Pose = walking ? mix(P.stand, reach, 0.2) : mix(P.stand, reach, prog(T, at[idx] - 0.25, at[idx], easeOut));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="ocSky" stops={[[0, '#9AA6B6'], [1, '#D8DCE0']]} />
        <VGrad id="ocWall" stops={[[0, '#4A4A52'], [1, '#33343A']]} />
      </defs>
      <g transform={`translate(540,1000) scale(${lerp(1.0, 1.05, prog(T, t0, seal + 1, (q) => q))}) translate(-540,-1000)`}>
        <rect width={1080} height={1920} fill="url(#ocWall)" />
        <rect x={120} y={380} width={840} height={780} fill="#1E1F25" />
        <rect x={140} y={400} width={800} height={740} fill="url(#ocSky)" />
        <Skyline y={1140} seed={95} color="#7A7E8C" lit="#FFFFFF" litRatio={0} hMin={120} hMax={380} x0={140} x1={940} wMin={60} wMax={130} />
        <path d="M140 1140 L940 1140 L1160 1920 L-80 1920 Z" fill="rgba(230,236,245,0.10)" opacity={1 - dark} filter="url(#b24)" />
        {panes.map(([x, y, w, h], i) => (
          <g key={i} opacity={cover[i]} transform={`translate(${x + w / 2},${y + h / 2}) scale(${lerp(0.85, 1, cover[i])}) translate(${-x - w / 2},${-y - h / 2})`}>
            <rect x={x} y={y} width={w} height={h} fill="#A27A4E" stroke="#6A4A2A" strokeWidth={5} />
            <path d={`M${x + 20} ${y + 30} L${x + w - 30} ${y + h - 40}`} stroke="#8A643C" strokeWidth={4} />
            <text x={x + w / 2} y={y + h / 2 + 20} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={40} fill="#7A5634" opacity={0.6}>{['FRAGILE', '↑ HAUT', 'CUISINE', 'LIVRES'][i]}</text>
            {[[x - 10, y + 10, 45], [x + w - 70, y - 4, -45], [x - 6, y + h - 40, -45], [x + w - 60, y + h - 30, 45]].map(([tx, ty, r], j) => (
              <rect key={j} x={tx} y={ty} width={90} height={26} fill="rgba(236,224,190,0.9)" transform={`rotate(${r},${tx + 45},${ty + 13})`} />
            ))}
          </g>
        ))}
        {/* fines fuites de lumière, scellées à la fin */}
        {cover[3] > 0.9 && T < seal ? <g opacity={0.8 * (1 - blanket)}><rect x={520} y={400} width={40} height={740} fill="#E8EEF6" opacity={0.5} filter="url(#b4)" /><rect x={140} y={760} width={800} height={20} fill="#E8EEF6" opacity={0.5} filter="url(#b4)" /></g> : null}
        <g opacity={blanket} transform={`translate(0,${(1 - blanket) * -200})`}>
          <path d="M110 370 L970 370 L985 1180 Q760 1210 540 1170 Q320 1210 95 1180 Z" fill="#7A2430" stroke="#3A0E14" strokeWidth={6} />
          {[230, 400, 570, 740, 900].map((x) => <path key={x} d={`M${x} 380 Q${x + 20} 780 ${x - 10} 1180`} stroke="#5A1820" strokeWidth={8} fill="none" />)}
          {[500, 820].map((y) => <rect key={y} x={110} y={y} width={860} height={12} fill="#A23A44" opacity={0.6} />)}
        </g>
        <rect x={0} y={1160} width={1080} height={760} fill="#26272D" />
        <Hero p={pose} x={hx} y={1820} h={760} light={{amb: lerp(0.95, 0.5, dark), tint: '#14151C'}} />
      </g>
      <rect width={1080} height={1920} fill={`rgba(4,5,10,${dark * 0.6})`} />
    </svg>
  );
};

// ---------------- règle 6 : le téléphone (mode avion, message vocal, alerte) ----------------
export const Vocal: React.FC<SceneP & {avion: number; minute: number; vocal: number; play: [number, number]; alert?: {at: number; evac: number; dix: number}; hour: string; batt: (t: number) => number}> = ({T, avion, minute, vocal, play, alert, hour, batt}) => {
  const frame = useCurrentFrame();
  const plane = T >= avion && T < minute;
  const playing = prog(T, play[0], play[1], (q) => q);
  const notif = prog(T, vocal, vocal + 0.3, easeOut);
  const player = prog(T, play[0] - 0.3, play[0], easeOut);
  const al = alert ? prog(T, alert.at, alert.at + 0.25, easeOut) : 0;
  const b = Math.round(batt(T));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="vScreen" stops={[[0, '#151A2E'], [1, '#0C0F1C']]} />
        <VGrad id="vAlert" stops={[[0, '#9E0E0C'], [1, '#3A0505']]} />
      </defs>
      <rect width={1080} height={1920} fill="#06070C" />
      <Glow x={540} y={900} r={520} color="#4A5AA8" o={0.25} blur={40} />
      <g transform={`translate(540,930) rotate(-5) scale(${lerp(1.0, 1.05, prog(T, avion - 2, play[1] + 2, (q) => q))})`}>
        <rect x={-275} y={-545} width={550} height={1090} rx={84} fill="#0B0B10" stroke="#3A3A44" strokeWidth={5} />
        <rect x={-252} y={-522} width={504} height={1044} rx={66} fill="url(#vScreen)" />
        <rect x={-70} y={-500} width={140} height={38} rx={19} fill="#050507" />
        {/* barre d'état */}
        <text x={-205} y={-472} fontFamily={SF.cap} fontWeight={700} fontSize={26} fill="#FFFFFF">{hour}</text>
        {plane ? (
          <g transform="translate(120,-482)"><path d="M0 0 L-14 10 L-14 6 L-4 0 L-14 -6 L-14 -10 Z M-6 -2 L-20 -2 L-20 2 L-6 2 Z" fill="#FF9F0A" transform="scale(1.4)" /></g>
        ) : T >= minute ? [0, 1, 2, 3].map((i) => <rect key={i} x={98 + i * 9} y={-474 - i * 5} width={6} height={8 + i * 5} rx={1} fill={i < 2 + (T > minute + 0.8 ? 1 : 0) ? '#FFFFFF' : '#555'} />) : null}
        <rect x={150} y={-490} width={46} height={22} rx={5} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
        <rect x={154} y={-486} width={38 * b / 100} height={14} rx={2} fill={b > 20 ? '#FFFFFF' : '#FF453A'} />
        <text x={210} y={-472} fontFamily={SF.cap} fontWeight={700} fontSize={20} fill={b > 20 ? '#FFFFFF' : '#FF453A'}>{b}%</text>
        {/* commande du mode avion */}
        <g opacity={1 - player} transform="translate(0,-250)">
          <rect x={-200} y={-90} width={400} height={180} rx={40} fill="rgba(255,255,255,0.08)" />
          <circle cx={-100} cy={0} r={52} fill={plane ? '#FF9F0A' : 'rgba(255,255,255,0.18)'} />
          <path d="M-100 -26 L-84 -2 L-60 4 L-60 12 L-84 8 L-90 26 L-82 32 L-82 38 L-100 32 L-118 38 L-118 32 L-110 26 L-116 8 L-140 12 L-140 4 L-116 -2 Z" fill="#FFFFFF" transform="translate(0,-4) scale(0.9) translate(-11,0)" />
          <text x={-20} y={-6} fontFamily={SF.cap} fontWeight={800} fontSize={30} fill="#FFFFFF">Mode avion</text>
          <text x={-20} y={32} fontFamily={SF.cap} fontWeight={600} fontSize={24} fill={plane ? '#FF9F0A' : 'rgba(255,255,255,0.6)'}>{plane ? 'Activé' : T >= minute ? 'Désactivé · 1 min' : 'Désactivé'}</text>
        </g>
        {/* notification puis lecteur du message vocal */}
        {notif > 0 && player < 1 ? (
          <g opacity={notif} transform={`translate(0,${-40 + (1 - notif) * -50})`}>
            <rect x={-232} y={0} width={464} height={110} rx={26} fill="rgba(255,255,255,0.16)" />
            <rect x={-212} y={24} width={60} height={60} rx={14} fill="#34C759" />
            <text x={-136} y={50} fontFamily={SF.cap} fontWeight={800} fontSize={26} fill="#FFFFFF">Messagerie</text>
            <text x={-136} y={84} fontFamily={SF.cap} fontWeight={500} fontSize={22} fill="rgba(255,255,255,0.85)">1 message vocal · Maman</text>
          </g>
        ) : null}
        {player > 0 ? (
          <g opacity={player * (1 - al)}>
            <circle cx={0} cy={-250} r={80} fill="#F2A23C" />
            <text x={0} y={-226} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={70} fill="#2A1A08">M</text>
            <text x={0} y={-120} textAnchor="middle" fontFamily={SF.cap} fontWeight={800} fontSize={44} fill="#FFFFFF">Maman</text>
            <text x={0} y={-76} textAnchor="middle" fontFamily={SF.cap} fontWeight={500} fontSize={26} fill="rgba(255,255,255,0.6)">message vocal · hier, 07:12</text>
            {Array.from({length: 34}, (_, i) => {
              const hh = 14 + 70 * rand(i * 3.7) * (0.6 + 0.4 * Math.sin(i * 0.7));
              const played = i / 34 < playing;
              const live = played && Math.abs(i / 34 - playing) < 0.05 ? 1 + 0.3 * Math.sin(frame) : 1;
              return <rect key={i} x={-204 + i * 12} y={60 - (hh * live) / 2} width={7} height={hh * live} rx={3.5} fill={played ? '#F2A23C' : 'rgba(255,255,255,0.3)'} />;
            })}
            <text x={-204} y={150} fontFamily={SF.mono} fontWeight={500} fontSize={24} fill="rgba(255,255,255,0.7)">0:{String(Math.floor(playing * 9)).padStart(2, '0')}</text>
            <text x={204} y={150} textAnchor="end" fontFamily={SF.mono} fontWeight={500} fontSize={24} fill="rgba(255,255,255,0.7)">0:09</text>
            <circle cx={0} cy={260} r={56} fill="rgba(255,255,255,0.15)" />
            {playing > 0 && playing < 1 ? <g><rect x={-16} y={236} width={11} height={48} rx={3} fill="#FFFFFF" /><rect x={6} y={236} width={11} height={48} rx={3} fill="#FFFFFF" /></g> : <path d="M-12 232 L22 260 L-12 288 Z" fill="#FFFFFF" />}
          </g>
        ) : null}
        {alert && al > 0 ? (
          <g opacity={al}>
            <rect x={-252} y={-522} width={504} height={1044} rx={66} fill="url(#vAlert)" />
            <path d="M0 -360 L80 -220 L-80 -220 Z" fill="#FF3424" stroke="#FF6A50" strokeWidth={8} strokeLinejoin="round" />
            <rect x={-7} y={-320} width={14} height={60} rx={7} fill="#FFFFFF" />
            <circle cx={0} cy={-242} r={8} fill="#FFFFFF" />
            <text x={0} y={-150} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={38} fill="#FFFFFF">ALERTE D'URGENCE</text>
            {[['ÉVACUATION PAR', alert.evac], ['HÉLICOPTÈRE', alert.evac + 0.3], ['SUR LES TOITS', alert.evac + 0.9], ['DANS 10 JOURS', alert.dix]].map(([s, t], i) => (
              <text key={i} x={0} y={-50 + i * 70} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={i === 3 ? 50 : 42} fill={i === 3 ? '#FFD08A' : '#FFFFFF'} opacity={prog(T, t as number, (t as number) + 0.2, easeOut)}>{s}</text>
            ))}
          </g>
        ) : null}
      </g>
      {/* ta main qui tient le téléphone */}
      <g transform="translate(860,1560) rotate(-30)">
        <rect x={-80} y={0} width={200} height={600} rx={80} fill={HERO.hoodie} stroke={HERO.line} strokeWidth={8} />
        <ellipse cx={20} cy={-10} rx={95} ry={70} fill={HERO.skin} stroke={HERO.line} strokeWidth={8} />
      </g>
      {[0, 1, 2].map((i) => <ellipse key={i} cx={262} cy={900 + i * 70} rx={34} ry={22} fill={HERO.skin} stroke={HERO.line} strokeWidth={6} transform={`rotate(-5,540,930)`} />)}
    </svg>
  );
};

/** vue aux jumelles (deux cercles, bord adouci), en plein jour ou de nuit */
const Bino: React.FC<{T: number; z: number; children: React.ReactNode; day?: boolean}> = ({T, z, children, day}) => {
  const shake = [Math.sin(T * 7.3) * 5 + Math.sin(T * 13.1) * 2, Math.cos(T * 6.1) * 4];
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <mask id="binoE">
          <rect width={1080} height={1920} fill="black" />
          <g filter="url(#b4)"><circle cx={370} cy={930} r={368} fill="white" /><circle cx={710} cy={930} r={368} fill="white" /></g>
        </mask>
        <mask id="binoEdgeE">
          <rect width={1080} height={1920} fill="white" />
          <g filter="url(#b24)"><circle cx={370} cy={930} r={322} fill="black" /><circle cx={710} cy={930} r={322} fill="black" /></g>
        </mask>
      </defs>
      <rect width={1080} height={1920} fill="#000" />
      <g mask="url(#binoE)">
        <g transform={`translate(${540 + shake[0]},${930 + shake[1]}) scale(${z}) translate(-540,-930)`}>{children}</g>
        <rect width={1080} height={1920} fill={day ? 'rgba(255,240,220,0.04)' : 'rgba(150,190,255,0.06)'} />
        <rect width={1080} height={1920} fill="#000" opacity={0.85} mask="url(#binoEdgeE)" />
      </g>
    </svg>
  );
};

// ---------------- A · Lina colle des feuilles contre sa vitre ----------------
export const LinaJour: React.FC<SceneP & {sheets: {at: number; lines: string[]; x: number; y: number; r: number; red?: boolean}[]; radio: number}> = ({T, sheets, radio}) => {
  const frame = useCurrentFrame();
  const z = lerp(1.15, 1.28, prog(T, sheets[0].at - 1, sheets[sheets.length - 1].at + 1.5, (q) => q));
  const holdingRadio = T >= radio && T < radio + 1.6;
  return (
    <Bino T={T} z={z} day>
      <defs>
        <VGrad id="ljRoom" stops={[[0, '#C9B48E'], [1, '#9E8866']]} />
        <VGrad id="ljWall" stops={[[0, '#5E6272'], [1, '#4A4E5C']]} />
      </defs>
      <rect x={-200} y={300} width={1480} height={1300} fill="url(#ljWall)" />
      <rect x={150} y={470} width={780} height={900} fill="#2E3240" />
      <rect x={180} y={500} width={720} height={840} fill="url(#ljRoom)" />
      <rect x={220} y={1080} width={300} height={130} rx={14} fill="#B07A88" />
      <circle cx={300} cy={1060} r={34} fill="#8A5A3A" />
      <Girl T={T} up={0} on={0} x={560} y={1300} h={560} item={holdingRadio ? 'radio' : 'none'} />
      {sheets.map((s, i) => {
        const k = sp(frame, s.at, {damping: 12, stiffness: 200, mass: 0.7});
        if (T < s.at) return null;
        return (
          <g key={i} transform={`translate(${s.x},${s.y}) rotate(${s.r}) scale(${k})`}>
            <rect x={-150} y={-90} width={300} height={180} fill="#FAFAF4" stroke="#C8C8BC" strokeWidth={3} />
            {s.lines.map((l, j) => <text key={j} x={0} y={-90 + (180 / (s.lines.length + 1)) * (j + 1) + 18} textAnchor="middle" fontFamily={SF.title} fontSize={s.lines.length > 1 ? 56 : 72} fill={s.red ? '#C81E1E' : '#1A1A22'}>{l}</text>)}
            {[[-150, -90], [130, -90]].map(([tx, ty], j) => <rect key={j} x={tx} y={ty - 6} width={30} height={14} fill="rgba(236,224,190,0.9)" transform={`rotate(${j ? 30 : -30},${tx + 15},${ty})`} />)}
          </g>
        );
      })}
      <rect x={180} y={500} width={720} height={840} fill="rgba(255,255,255,0.06)" />
      <path d="M200 520 L420 520 L260 1320 L190 1320 Z" fill="rgba(255,255,255,0.08)" />
      <rect x={530} y={500} width={16} height={840} fill="#2E3240" />
      <rect x={150} y={1340} width={780} height={40} fill="#2E3240" />
    </Bino>
  );
};

// ---------------- B · sa fenêtre brisée, et sur le mur : IL GRIMPE ----------------
export const Brisee: React.FC<SceneP & {wall: number; hit: number}> = ({T, wall, hit}) => {
  const kz = prog(T, wall, wall + 1.6, easeInOut), kh = prog(T, hit, hit + 0.25, easeOut);
  const z = lerp(1.15, 1.6, kz) * lerp(1, 1.18, kh) * lerp(1, 1.03, prog(T, hit, hit + 4, (q) => q));
  const flap = Math.sin(T * 2.4) * 30 + Math.sin(T * 5.1) * 10;
  return (
    <Bino T={T} z={z} day>
      <defs>
        <VGrad id="bzWall" stops={[[0, '#5E6272'], [1, '#4A4E5C']]} />
        <VGrad id="bzRoom" stops={[[0, '#8E8270'], [1, '#6A604E']]} />
      </defs>
      <g transform={`translate(${lerp(0, -40, kz)},${lerp(-430, 120, kz)})`}>
        <rect x={-200} y={300} width={1480} height={1300} fill="url(#bzWall)" />
        <rect x={150} y={470} width={780} height={900} fill="#2E3240" />
        <rect x={180} y={500} width={720} height={840} fill="url(#bzRoom)" />
        {/* le mur du fond : deux mots au feutre rouge */}
        <g transform="translate(540,760) rotate(-4)">
          <text x={0} y={0} textAnchor="middle" fontFamily={SF.title} fontSize={150} fill="#B01818" opacity={0.92} letterSpacing="4">IL GRIMPE</text>
          <path d="M-230 30 q120 14 250 -4 t220 10" stroke="#B01818" strokeWidth={10} fill="none" opacity={0.85} />
          {[-180, -60, 70, 190].map((x, i) => <path key={i} d={`M${x} 6 l2 ${30 + rand(i) * 40}`} stroke="#B01818" strokeWidth={6} opacity={0.7} />)}
        </g>
        <rect x={250} y={1150} width={230} height={70} rx={10} fill="#5A3A48" transform="rotate(-18,365,1185)" />
        <g transform="translate(700,1260) rotate(70)">
          <rect x={-20} y={-50} width={40} height={90} rx={8} fill="#2A2A30" />
          <circle cx={0} cy={-50} r={18} fill="#C8C2A0" />
          <path d="M0 -60 L-160 -320 L160 -320 Z" fill="rgba(255,240,200,0.12)" filter="url(#b14)" />
        </g>
        {/* vitre brisée : éclats, trou déchiqueté */}
        <path d="M180 500 L900 500 L900 1340 L180 1340 Z M420 640 L520 600 L610 690 L700 640 L660 780 L760 880 L620 900 L560 1040 L470 900 L330 930 L400 800 L300 720 Z" fill="rgba(210,225,240,0.22)" fillRule="evenodd" stroke="rgba(240,248,255,0.7)" strokeWidth={4} />
        {[[520, 600, 380, 360], [610, 690, 840, 560], [760, 880, 900, 1100], [560, 1040, 520, 1340], [330, 930, 180, 1050], [300, 720, 180, 600]].map(([x1, y1, x2, y2], i) => <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(240,248,255,0.55)" strokeWidth={3} />)}
        <path d={`M900 520 Q${960 + flap} 760 ${930 + flap * 1.6} 1060 L${905 + flap} 1080 Q${920 + flap * 0.5} 780 890 520 Z`} fill="#C9506A" opacity={0.9} />
        <rect x={530} y={500} width={16} height={840} fill="#2E3240" />
        <rect x={150} y={1340} width={780} height={40} fill="#2E3240" />
        {Array.from({length: 14}, (_, i) => <path key={i} d={`M${200 + rand(i) * 680} ${1352 + rand(i + 4) * 20} l${10 + rand(i + 2) * 16} ${-6 - rand(i + 9) * 10} l${8 + rand(i + 3) * 10} ${10}`} fill="rgba(220,235,250,0.8)" />)}
      </g>
    </Bino>
  );
};

// ---------------- « et toi, tu vis juste sous le toit » : schéma du haut de l'immeuble + hélico ----------------
export const ToitSchema: React.FC<SceneP & {t0: number}> = ({T, t0}) => {
  const k = prog(T, t0, t0 + 0.6, easeOut);
  const BLUE = '#CFE3FF', DIM = '#6F8DB8', CYAN = '#5FE3FF', AMB = '#F2A23C';
  const heli = prog(T, t0 + 0.4, t0 + 1.6, easeOut);
  const lab = (x: number, y: number, s: string, c = DIM, size = 26) => <text x={x} y={y} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={size} letterSpacing="4" fill={c}>{s}</text>;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <rect width={1080} height={1920} fill="#0A1626" />
      {Array.from({length: 48}, (_, i) => <rect key={`h${i}`} x={0} y={i * 40} width={1080} height={1} fill="#13294A" />)}
      {Array.from({length: 27}, (_, i) => <rect key={`v${i}`} x={i * 40} y={0} width={1} height={1920} fill="#13294A" />)}
      <g opacity={k} transform={`translate(540,1100) scale(${lerp(1.15, 1, k)}) translate(-540,-1100)`}>
        <rect x={240} y={900} width={600} height={560} fill="none" stroke={BLUE} strokeWidth={8} />
        {[1080, 1270].map((y) => <line key={y} x1={240} y1={y} x2={840} y2={y} stroke={DIM} strokeWidth={3} />)}
        {lab(200, 1000, '12', DIM, 24)}{lab(200, 1180, '11', DIM, 24)}{lab(200, 1370, '10', DIM, 24)}
        <rect x={246} y={906} width={330} height={168} fill="rgba(255,90,74,0.16)" />
        <g transform="translate(330,990)"><circle r={30} fill={HERO.beanie} stroke="#FFFFFF" strokeWidth={4} /><circle cy={-9} r={10} fill={HERO.pom} /></g>
        {lab(450, 1000, 'TOI · 1204', '#FF5A4A', 28)}
        {/* le palier, la trappe, le toit */}
        <rect x={640} y={890} width={120} height={20} fill={AMB} />
        {lab(700, 870, 'TRAPPE', AMB, 24)}
        <path d={`M700 1060 L700 ${lerp(1060, 820, prog(T, t0 + 0.3, t0 + 1.0, easeOut))}`} stroke={CYAN} strokeWidth={6} strokeDasharray="14 10" />
        <path d="M688 840 L700 816 L712 840 Z" fill={CYAN} opacity={prog(T, t0 + 0.9, t0 + 1.1)} />
        <line x1={200} y1={900} x2={880} y2={900} stroke={BLUE} strokeWidth={10} />
        {lab(540, 950, 'TOIT', BLUE, 30)}
        <g transform={`translate(${lerp(1200, 560, heli)},${lerp(560, 640, heli)})`}>
          <ellipse rx={90} ry={34} fill="none" stroke={AMB} strokeWidth={6} />
          <rect x={80} y={-8} width={120} height={14} fill={AMB} />
          <line x1={-130 + 60 * Math.sin(T * 40)} y1={-50} x2={130 - 60 * Math.sin(T * 40)} y2={-50} stroke={AMB} strokeWidth={5} />
          <line x1={0} y1={-34} x2={0} y2={-50} stroke={AMB} strokeWidth={5} />
          <line x1={-50} y1={40} x2={50} y2={40} stroke={AMB} strokeWidth={5} />
        </g>
        <g opacity={heli}>{lab(560, 540, 'HÉLICO · J-10', AMB, 40)}</g>
      </g>
    </svg>
  );
};

// ---------------- la nuit : la porte barricadée, on frappe en morse ----------------
/** état de la barricade et du perso (jour 3 : on la défait, on la refait) ; `voice` = créneaux où une voix traverse la porte */
type PorteState = {arm?: number; couch?: number; items?: number; hero?: {x: number; pose: Pose; flip?: boolean; y?: number}; voice?: [number, number][]};
export const PorteNuit: React.FC<SceneP & {knocks: number[]; push?: number; outline?: number} & PorteState> = ({T, knocks, push, outline, arm = -23.5, couch = 104, items = 1, hero, voice = []}) => {
  const last = knocks.filter((k) => T >= k).pop();
  const hit = last !== undefined ? Math.exp(-(T - last) * 16) : 0;
  const dx = hit * 5 * Math.sin(T * 90);
  const kp = push !== undefined ? prog(T, push, push + 3, easeInOut) : 0;
  const z = lerp(1.0, 1.25, kp);
  const ol = outline !== undefined ? prog(T, outline, outline + 0.5, easeOut) : 0;
  const pose: Pose = breathe({...P.sitKnees, head: 12, aL: 70, aR: 80}, T * 1.5, 1.2);
  const speaking = voice.some(([a, b]) => T >= a && T < b);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="pnWall" stops={[[0, '#1A1C2A'], [1, '#101118']]} />
      </defs>
      <g transform={`translate(380,1150) scale(${z}) translate(-380,-1150)`}>
        <rect width={1080} height={1920} fill="url(#pnWall)" />
        <rect x={0} y={1500} width={1080} height={420} fill="#0C0D12" />
        <Glow x={300} y={1180} r={420} color="#3A4A8A" o={0.18} blur={40} />
        {/* porte */}
        <g transform={`translate(${dx},0)`}>
          <rect x={76} y={846} width={248} height={656} fill="#0E0B10" />
          <rect x={90} y={860} width={220} height={640} fill="#24161A" stroke={last !== undefined && T - last < 0.15 ? '#8A9CFF' : '#1A0E10'} strokeWidth={4} />
          <circle cx={275} cy={1180} r={13} fill="#5A4A2A" />
          <circle cx={200} cy={960} r={8} fill="#0A0608" stroke="#5A4A2A" strokeWidth={3} />
        </g>
        {last !== undefined && T - last < 0.5 ? [0, 1].map((i) => <path key={i} d={`M${330 + i * 30} ${1000 + i * 30} q${60 + 80 * (T - last)} 120 0 240`} stroke="#9AB0FF" strokeWidth={5} fill="none" opacity={(1 - (T - last) / 0.5) * 0.8} />) : null}
        {/* armoire couchée sur la porte, canapé, objets */}
        <g transform={`rotate(${arm + hit * 0.6},330,1500)`}>
          <rect x={330} y={740} width={170} height={760} fill="#2A1C14" stroke={ol > 0 ? '#F2A23C' : '#140C08'} strokeWidth={ol > 0 ? 8 : 6} strokeDasharray={ol > 0 ? '18 12' : undefined} />
        </g>
        <g transform={`translate(${couch},${hit * -2})`}>
          <rect x={0} y={1250} width={400} height={170} rx={34} fill="#13282A" stroke={ol > 0 ? '#F2A23C' : '#0A1416'} strokeWidth={ol > 0 ? 8 : 6} strokeDasharray={ol > 0 ? '18 12' : undefined} />
          <rect x={18} y={1350} width={364} height={110} rx={22} fill="#163032" />
        </g>
        <g opacity={items}>
          <rect x={130} y={1232} width={150} height={120} fill="#3A2C1E" transform={`translate(0,${hit * -3})`} />
          <rect x={125} y={1142} width={160} height={90} rx={8} fill="#4A4C52" transform={`translate(0,${hit * -4})`} />
          <rect x={290} y={1092} width={190} height={110} rx={8} fill="#141418" transform={`translate(0,${hit * -3})`} />
        </g>
        {speaking ? [0, 1, 2].map((i) => {
          const ph = (T * 1.4 + i / 3) % 1;
          return <path key={`v${i}`} d={`M${330 + ph * 260} ${940 - ph * 120} q${70 + ph * 60} ${260 + ph * 120} 0 ${520 + ph * 240}`} stroke="#F2A23C" strokeWidth={6} fill="none" opacity={(1 - ph) * 0.7} />;
        }) : null}
        {hit > 0.2 ? <Dust x0={120} y0={900} x1={520} y1={1250} T={T * 4} n={24} o={0.5 * hit} seed={last ?? 1} /> : null}
        {hero ? <Hero p={hero.pose} x={hero.x} y={hero.y ?? 1700} h={hero.y ? 700 : 560} flip={hero.flip ?? true} light={NIGHT} /> : <Hero p={pose} x={820} y={1700} hipY={0} h={560} flip light={NIGHT} />}
      </g>
    </svg>
  );
};

// ---------------- par la fente du carton : ce qu'on voit en face ----------------
export const Fente: React.FC<SceneP & {t0: number; lina: boolean}> = ({T, t0, lina}) => {
  const open = prog(T, t0, t0 + 0.5, easeOut);
  const gap = lerp(20, 170, open);
  const z = lerp(1.0, 1.15, prog(T, t0, t0 + 4, (q) => q));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <clipPath id="fente"><rect x={540 - gap / 2} y={0} width={gap} height={1920} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="#050508" />
      <g clipPath="url(#fente)">
        <g transform={`translate(540,700) scale(${z * 1.6}) translate(${-(LIT_WIN.x + 22)},${-(LIT_WIN.y + 29)})`}>
          <Opposite T={T} lit={0} level={lina ? 1 : 0} />
          {lina ? <Girl T={T} up={0.35} on={0.6} x={LIT_WIN.x + 26} y={LIT_WIN.y + 58} h={46} /> : (
            <g>
              <rect x={LIT_WIN.x} y={LIT_WIN.y} width={44} height={58.67} fill="#05060C" />
              <path d={`M${LIT_WIN.x} ${LIT_WIN.y} L${LIT_WIN.x + 44} ${LIT_WIN.y} L${LIT_WIN.x + 44} ${LIT_WIN.y + 58} L${LIT_WIN.x} ${LIT_WIN.y + 58} Z M${LIT_WIN.x + 10} ${LIT_WIN.y + 14} l12 -6 l10 10 l8 -2 l-4 16 l6 10 l-14 4 l-6 12 l-8 -14 l-8 2 l4 -14 Z`} fill="rgba(170,190,230,0.35)" fillRule="evenodd" stroke="rgba(220,235,255,0.9)" strokeWidth={1.2} />
              <path d={`M${LIT_WIN.x + 44} ${LIT_WIN.y + 4} q${6 + 3 * Math.sin(T * 2.4)} 20 ${2 + 4 * Math.sin(T * 2.4)} 40`} stroke="#C9506A" strokeWidth={4} fill="none" />
              <Glow x={LIT_WIN.x + 22} y={LIT_WIN.y + 29} r={40} color="#8EA4FF" o={0.25} blur={14} />
            </g>
          )}
        </g>
      </g>
      {/* bords des cartons, tes doigts qui écartent */}
      <rect x={0} y={0} width={540 - gap / 2} height={1920} fill="#5A4430" />
      <rect x={540 + gap / 2} y={0} width={540 - gap / 2} height={1920} fill="#5A4430" />
      <rect x={540 - gap / 2 - 6} y={0} width={6} height={1920} fill="#2A1E12" />
      <rect x={540 + gap / 2} y={0} width={6} height={1920} fill="#2A1E12" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={540 + gap / 2 + 10} cy={1180 + i * 80} rx={44} ry={28} fill={HERO.skin} stroke={HERO.line} strokeWidth={6} />)}
      <rect width={1080} height={1920} fill="rgba(0,0,0,0.25)" />
    </svg>
  );
};

