// Scènes du jour 3 (« Dernier étage » — ils imitent) : le palier et la trappe du toit ouverte, le schéma du son (ils écoutent,
// ils apprennent), la barricade renforcée, le compte des vivres, la voix du voisin du 11e qui monte par la grille du sol.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {easeIn, easeInOut, easeOut, lerp, prog, rand, sp} from '../theme';
import {breathe, Hero, HeroTop, Light} from './hero';
import {P, Pose, Stick} from './stick';
import {Blurs, Dust, Glow, SceneP, VGrad} from './world';
import {Grimpeur} from './scenesE';
import {SF} from './ui';

const NIGHT: Light = {amb: 0.3, tint: '#0C1030', rim: '#6F8BFF'};
const lab = (x: number, y: number, s: string, c: string, size = 26, o = 1) => <text x={x} y={y} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={size} letterSpacing="4" fill={c} opacity={o}>{s}</text>;
const Blueprint: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#0A1626" />
    {Array.from({length: 48}, (_, i) => <rect key={`h${i}`} x={0} y={i * 40} width={1080} height={1} fill="#13294A" />)}
    {Array.from({length: 27}, (_, i) => <rect key={`v${i}`} x={i * 40} y={0} width={1} height={1920} fill="#13294A" />)}
  </g>
);

// ---------------- A · tu ouvres : le palier vide, la trappe du toit ouverte, une voix, des doigts ----------------
export const Palier: React.FC<SceneP & {t0: number; voice: number; fingers: number; slam: number}> = ({T, t0, voice, fingers, slam}) => {
  const open = prog(T, t0, t0 + 0.9, easeOut);
  const z = lerp(1.0, 1.22, prog(T, t0, slam, (q) => q));
  const fk = prog(T, fingers, fingers + 1.0, easeOut);
  const shut = prog(T, slam - 0.05, slam + 0.2, easeIn);
  const look = prog(T, t0 + 1.2, t0 + 2.2, easeInOut);
  const pose: Pose = breathe({...P.standArmsDown, head: lerp(0, -12, look), aR: lerp(4, 40, 1 - look), aRb: 30}, T * 1.4, 1);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="plWall" stops={[[0, '#141826'], [1, '#0C0E16']]} />
        <VGrad id="plMoon" stops={[[0, 'rgba(190,210,255,0.55)'], [1, 'rgba(190,210,255,0)']]} />
      </defs>
      <g transform={`translate(540,900) scale(${z}) translate(-540,-900)`}>
        <rect width={1080} height={1920} fill="url(#plWall)" />
        {/* palier : plafond, trappe ouverte et lune, escalier qui descend, ascenseur HS */}
        <rect x={0} y={0} width={1080} height={420} fill="#0A0B12" />
        <rect x={400} y={360} width={280} height={70} fill="#2A3352" />
        <rect x={410} y={300} width={260} height={60} fill="#1A2238" />
        <path d="M410 430 L670 430 L860 1700 L220 1700 Z" fill="url(#plMoon)" opacity={0.55} filter="url(#b14)" />
        <Dust x0={300} y0={440} x1={800} y1={1500} T={T} n={40} o={0.5} seed={33} />
        <g transform="rotate(-62,670,430)"><rect x={670} y={420} width={280} height={18} fill="#3A3F52" /></g>
        {[470, 610].map((x) => <rect key={x} x={x} y={430} width={10} height={520} fill="#3A3F52" />)}
        {Array.from({length: 7}, (_, i) => <rect key={`l${i}`} x={470} y={470 + i * 70} width={150} height={8} fill="#3A3F52" />)}
        {fk > 0 ? [0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${470 + i * 34} 432 q${6 + i * 2} ${50 * fk} ${-4 + i * 4} ${90 * fk}`} stroke="#C8D4FF" strokeWidth={10} fill="none" strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #A8BCFF)'}} />
        )) : null}
        <rect x={760} y={760} width={220} height={560} fill="#1A1E2C" stroke="#2A3046" strokeWidth={6} />
        <line x1={870} y1={760} x2={870} y2={1320} stroke="#2A3046" strokeWidth={6} />
        <rect x={810} y={700} width={120} height={44} rx={6} fill="#7A1A1A" />
        <text x={870} y={731} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={26} fill="#FFD0C8">HS</text>
        <path d="M60 1300 L300 1300 L300 1700 L60 1700" stroke="#3A3F52" strokeWidth={10} fill="none" />
        {Array.from({length: 5}, (_, i) => <rect key={`s${i}`} x={60} y={1340 + i * 70} width={240 - i * 30} height={10} fill="#262A3A" />)}
        <rect x={0} y={1700} width={1080} height={220} fill="#0A0B10" />
        {/* les ondes de la voix qui tombe de la trappe */}
        {T >= voice ? [0, 1, 2].map((i) => {
          const ph = (T * 1.2 + i / 3) % 1;
          return <ellipse key={i} cx={540} cy={460 + ph * 260} rx={120 + ph * 260} ry={30 + ph * 60} fill="none" stroke="#F2A23C" strokeWidth={5} opacity={(1 - ph) * 0.6} />;
        }) : null}
        {/* encadrement de ta porte (au premier plan) et toi, de dos */}
        <rect x={-40} y={0} width={150} height={1920} fill="#05060A" />
        <rect x={970} y={0} width={150} height={1920} fill="#05060A" />
        <g transform={`translate(110,0) scale(${lerp(0.2, 1, 1 - open)},1)`}><rect x={0} y={200} width={300} height={1720} fill="#1A1014" /></g>
        <Hero p={pose} x={540} y={2120} h={1200} light={NIGHT} />
      </g>
      {/* la porte qui claque */}
      {shut > 0 ? <rect x={0} y={0} width={1080 * shut} height={1920} fill="#120A0C" /> : null}
    </svg>
  );
};

// ---------------- règle 7 : schéma du son (ton message → il écoute → il répète) ----------------
export const SonSchema: React.FC<SceneP & {t0: number; echo: number; ear: number; learn: number}> = ({T, t0, echo, ear, learn}) => {
  const k = prog(T, t0, t0 + 0.6, easeOut);
  const BLUE = '#CFE3FF', DIM = '#6F8DB8', AMB = '#F2A23C', RED = '#FF5A4A';
  const wave = (x0: number, dir: number, t: number, col: string) => [0, 1, 2].map((i) => {
    const ph = ((T - t) * 1.1 + i / 3) % 1;
    return T >= t ? <path key={i} d={`M${x0 + dir * ph * 220} 760 q${dir * 40} 80 0 160`} stroke={col} strokeWidth={6} fill="none" opacity={(1 - ph) * 0.8} /> : null;
  });
  const listen = prog(T, ear, ear + 0.4, easeOut), bubble = prog(T, learn, learn + 0.4, easeOut);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <Blueprint />
      <g opacity={k} transform={`translate(540,1080) scale(${lerp(1.1, 1, k)}) translate(-540,-880)`}>
        <rect x={80} y={620} width={560} height={420} fill="none" stroke={BLUE} strokeWidth={8} />
        {lab(360, 600, 'APPART 1204', DIM, 26)}
        <rect x={634} y={820} width={14} height={220} fill={RED} />
        {lab(641, 1090, 'PORTE', RED, 22)}
        <rect x={648} y={620} width={360} height={420} fill="none" stroke={DIM} strokeWidth={4} strokeDasharray="14 10" />
        {lab(828, 600, 'PALIER', DIM, 26)}
        {/* le téléphone qui joue le message */}
        <g transform="translate(260,840)">
          <rect x={-40} y={-70} width={80} height={140} rx={14} fill="none" stroke={AMB} strokeWidth={6} />
          {lab(0, 120, 'MESSAGE', AMB, 22)}
          {lab(0, 150, 'VOCAL', AMB, 22)}
        </g>
        <g transform="translate(160,920)"><HeroTop x={0} y={0} s={46} l={[-20, 50]} r={[20, 50]} /></g>
        {wave(320, 1, t0 + 0.3, AMB)}
        {/* lui, derrière la porte : il écoute, il répète */}
        <Grimpeur x={830} y={980} h={300} mode="cling" tilt={lerp(0, 24, listen)} />
        {listen > 0 ? <g opacity={listen}><path d="M905 790 q40 30 0 60 M925 770 q60 50 0 100" stroke={BLUE} strokeWidth={6} fill="none" />{lab(830, 1110, 'IL ÉCOUTE', BLUE, 26)}</g> : null}
        {T >= echo ? wave(760, -1, echo, RED) : null}
        {bubble > 0 ? (
          <g opacity={bubble} transform={`translate(830,700) scale(${lerp(0.6, 1, bubble)})`}>
            <rect x={-170} y={-60} width={340} height={80} rx={20} fill="rgba(255,90,74,0.15)" stroke={RED} strokeWidth={5} />
            <text x={0} y={-8} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={32} fill="#FFD0C8">« MON CŒUR… »</text>
            {lab(0, 72, 'IL APPREND', RED, 26)}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ---------------- règle 8 : renforcer la barricade (le lit, des planches, des vis) ----------------
export const Renfort: React.FC<SceneP & {t0: number; screws: number; done: number}> = ({T, t0, screws, done}) => {
  const frame = useCurrentFrame();
  const pts: [number, number][] = [[120, 920], [300, 900], [150, 1180], [290, 1170], [140, 1420], [300, 1400]];
  const at = pts.map((_, i) => lerp(screws, done - 0.2, i / (pts.length - 1)));
  let idx = at.findIndex((a) => T < a + 0.3);
  if (idx < 0) idx = pts.length - 1;
  const tgt = pts[idx];
  const drill = at.some((a) => T >= a - 0.25 && T < a + 0.05);
  const pose: Pose = {...P.reach, torso: 6, aR: lerp(70, 100, (tgt[1] - 900) / -500 + 0.5), aRb: -6, head: 6};
  const planks = prog(T, t0 + 0.5, t0 + 1.4, easeOut);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="rfWall" stops={[[0, '#4E463E'], [1, '#3C352E']]} />
      </defs>
      <g transform={`translate(540,1100) scale(${lerp(1.05, 1.12, prog(T, t0, done + 1, (q) => q))}) translate(-540,-1100)`}>
        <rect width={1080} height={1920} fill="url(#rfWall)" />
        <rect x={0} y={1500} width={1080} height={420} fill="#2A1E16" />
        <rect x={76} y={846} width={248} height={656} fill="#2E1E14" />
        <rect x={90} y={860} width={220} height={640} fill="#5C3424" />
        <g transform="rotate(-23.5,330,1500)"><rect x={330} y={740} width={170} height={760} fill="#6A4630" stroke="#2E1C10" strokeWidth={6} /></g>
        <rect x={104} y={1250} width={400} height={170} rx={34} fill="#2C5A5E" stroke="#163235" strokeWidth={6} />
        {/* le cadre du lit et les planches vissées en travers de la porte */}
        <g opacity={planks} transform={`translate(${(1 - planks) * 200},0)`}>
          <rect x={60} y={860} width={300} height={40} fill="#8A6A44" stroke="#4A3420" strokeWidth={5} transform="rotate(-8,210,880)" />
          <rect x={60} y={1140} width={300} height={40} fill="#8A6A44" stroke="#4A3420" strokeWidth={5} transform="rotate(6,210,1160)" />
          <rect x={60} y={1390} width={300} height={40} fill="#8A6A44" stroke="#4A3420" strokeWidth={5} transform="rotate(-4,210,1410)" />
          <rect x={40} y={760} width={46} height={760} fill="#7A5A3A" stroke="#4A3420" strokeWidth={5} transform="rotate(4,63,1140)" />
        </g>
        {pts.map(([x, y], i) => (
          <g key={i} opacity={T >= at[i] ? 1 : 0} transform={`translate(${x},${y}) scale(${sp(frame, at[i], {damping: 9, stiffness: 300, mass: 0.5})})`}>
            <circle r={11} fill="#C8CCD2" stroke="#3A3C40" strokeWidth={3} />
            <line x1={-6} y1={0} x2={6} y2={0} stroke="#3A3C40" strokeWidth={3} />
          </g>
        ))}
        {drill ? <Dust x0={tgt[0] - 40} y0={tgt[1] - 40} x1={tgt[0] + 40} y1={tgt[1] + 40} T={T * 6} n={14} o={0.9} seed={idx} /> : null}
        <Hero p={pose} x={tgt[0] + 330} y={1560} h={600} flip hands={null} />
        {/* la visseuse */}
        <g transform={`translate(${tgt[0] + 40},${tgt[1]}) rotate(${drill ? Math.sin(frame) * 3 : 0})`}>
          <rect x={0} y={-18} width={120} height={36} rx={8} fill="#E8B030" stroke="#3A2A0A" strokeWidth={4} />
          <rect x={60} y={10} width={30} height={70} rx={6} fill="#2A2A30" />
          <rect x={-30} y={-5} width={34} height={10} fill="#9AA0A8" />
        </g>
      </g>
    </svg>
  );
};

// ---------------- le compte des vivres : 2 jours de vivres, 9 jours à tenir → demi-ration ----------------
export const Calcul: React.FC<SceneP & {two: number; nine: number; half: number}> = ({T, two, nine, half}) => {
  const frame = useCurrentFrame();
  const a = sp(frame, two, {damping: 10, stiffness: 220, mass: 0.6}), b = sp(frame, nine, {damping: 10, stiffness: 220, mass: 0.6});
  const cut = prog(T, half + 0.2, half + 0.8, easeInOut), stamp = sp(frame, half + 0.9, {damping: 9, stiffness: 260, mass: 0.6});
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <rect width={1080} height={1920} fill="#100C08" />
      <Glow x={540} y={900} r={600} color="#6A4A2A" o={0.35} blur={40} />
      <g transform={`translate(300,760) scale(${a})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={SF.title} fontSize={300} fill="#F2A23C">2</text>
        {lab(0, 60, 'JOURS DE VIVRES', '#F2A23C', 30)}
      </g>
      <g transform={`translate(780,760) scale(${b})`}>
        <text x={0} y={0} textAnchor="middle" fontFamily={SF.title} fontSize={300} fill="#FF5A4A">9</text>
        {lab(0, 60, "JOURS À TENIR", '#FF5A4A', 30)}
      </g>
      {b > 0.5 ? <text x={540} y={690} textAnchor="middle" fontFamily={SF.title} fontSize={160} fill="#FFFFFF" opacity={b}>≠</text> : null}
      {/* le pain coupé en deux */}
      <g transform="translate(540,1180)" opacity={prog(T, half - 0.1, half + 0.2)}>
        <g transform={`translate(${-cut * 50},0)`}><path d="M-150 0 A150 70 0 0 1 0 -70 L0 70 A150 70 0 0 1 -150 0 Z" fill="#C98A44" stroke="#6A4420" strokeWidth={6} /></g>
        <g transform={`translate(${cut * 50},0)`}><path d="M150 0 A150 70 0 0 0 0 -70 L0 70 A150 70 0 0 0 150 0 Z" fill="#C98A44" stroke="#6A4420" strokeWidth={6} /></g>
        <line x1={0} y1={-140} x2={0} y2={-140 + 280 * Math.min(1, cut * 1.5)} stroke="#E8ECF0" strokeWidth={8} strokeLinecap="round" opacity={1 - cut} />
      </g>
      <g transform={`translate(540,1420) scale(${stamp}) rotate(-4)`}>
        <rect x={-260} y={-60} width={520} height={110} rx={10} fill="none" stroke="#FF5A4A" strokeWidth={8} />
        <text x={0} y={22} textAnchor="middle" fontFamily={SF.title} fontSize={84} fill="#FF5A4A">DEMI-RATION</text>
      </g>
    </svg>
  );
};

// ---------------- la voix du 11e qui monte par la grille du sol : un homme… ou l'un d'eux ? ----------------
export const Voisin: React.FC<SceneP & {t0: number; talk: [number, number]; doubt: number; dark?: number}> = ({T, t0, talk, doubt, dark = 0}) => {
  const k = prog(T, t0, t0 + 0.8, easeOut);
  const speaking = T >= talk[0] && T < talk[1];
  // le doute : la silhouette du dessous hésite entre un homme et un grimpeur
  const glitch = T >= doubt ? (rand(Math.floor(T * 8)) > 0.55 ? 1 : 0) : 0;
  const pose: Pose = {...P.lieBed, torso: -90, head: 4, aL: 92, aR: 70, aRb: 40};
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="vsUp" stops={[[0, '#3A3630'], [1, '#2A2622']]} />
        <VGrad id="vsDown" stops={[[0, '#14161E'], [1, '#0A0B10']]} />
      </defs>
      <g transform={`translate(540,1000) scale(${lerp(1.12, 1.0, k) * lerp(1, 1.08, prog(T, doubt, doubt + 3, (q) => q))}) translate(-540,-1000)`}>
        {/* coupe : ton appart en haut (fenêtres occultées), le 11e en dessous */}
        <rect x={0} y={0} width={1080} height={1060} fill="url(#vsUp)" />
        <rect x={700} y={360} width={260} height={360} fill="#6A4A30" stroke="#3A2614" strokeWidth={6} />
        <rect x={0} y={1060} width={1080} height={70} fill="#5A5248" />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={i * 80} y={1060} width={3} height={70} fill="#3A342C" />)}
        <rect x={250} y={1056} width={160} height={30} fill="#1A1A1E" stroke="#8A8A90" strokeWidth={4} />
        {Array.from({length: 7}, (_, i) => <rect key={`g${i}`} x={262 + i * 21} y={1060} width={8} height={22} fill="#8A8A90" />)}
        <rect x={0} y={1130} width={1080} height={790} fill="url(#vsDown)" />
        {lab(160, 1200, '11E ÉTAGE', '#6F7A98', 26)}
        {lab(900, 1010, '12E · TOI', '#C8B8A0', 26)}
        {/* toi, allongé, l'oreille contre la grille */}
        <Hero p={pose} x={620} y={1040} hipY={0} h={560} light={{amb: 0.75, tint: '#2A2420'}} />
        {/* la voix qui monte */}
        {speaking ? [0, 1, 2].map((i) => {
          const ph = (T * 1.3 + i / 3) % 1;
          return <ellipse key={i} cx={330} cy={1100 - ph * 200} rx={60 + ph * 140} ry={14 + ph * 20} fill="none" stroke="#F2A23C" strokeWidth={5} opacity={(1 - ph) * 0.7} />;
        }) : null}
        {/* en dessous : un homme à casquette… ou l'un d'eux */}
        <g opacity={0.9}>
          {glitch ? (
            <Grimpeur x={500} y={1700} h={560} mode="cling" tilt={20} dark rim="#FF6A5A" />
          ) : (
            <g>
              {/* M. Ferrand : silhouette sombre, casquette, la main tendue vers la grille (pas notre perso) */}
              <Stick p={{...P.standArmsDown, head: -14, aR: 150, aRb: -20}} x={500} y={1860} h={620} look="rimBlue" />
              <path d="M455 1255 Q500 1215 545 1255 L575 1262 L455 1262 Z" fill="#1A1C24" stroke="#5A6488" strokeWidth={4} />
            </g>
          )}
        </g>
        <Glow x={500} y={1300} r={260} color="#3A4A8A" o={0.15} blur={40} />
      </g>
      <rect width={1080} height={1920} fill={`rgba(0,0,0,${dark})`} />
    </svg>
  );
};

