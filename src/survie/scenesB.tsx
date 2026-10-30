// Scènes de la rue : toi devant la baie vitrée (contre-jour), la rue vue de dessus (fuite, poursuite, alarme de voiture),
// la rue de nuit où les têtes se lèvent vers ta fenêtre.
import React from 'react';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../theme';
import {P, run, shamble, Stick} from './stick';
import {breathe, Person} from './hero';
import {Blurs, Cam, CarTop, Glow, RGrad, SceneP, VanTop, VGrad} from './world';
import {DawnOutside} from './scenesA';

// ---------------- toi devant la baie vitrée, en contre-jour ----------------
export const Baie: React.FC<SceneP & {t0: number; hero?: boolean}> = ({T, t0, hero}) => {
  const lt = T - t0;
  const z = lerp(1.0, 1.08, clamp01(lt / 2));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="bWall" stops={[[0, '#221C2C'], [1, '#15111C']]} />
        <VGrad id="bCurt" stops={[[0, '#6E2433'], [1, '#3A121C']]} />
      </defs>
      <g transform={`translate(540,1000) scale(${z}) translate(-540,-1000)`}>
        <rect width={1080} height={1920} fill="url(#bWall)" />
        <DawnOutside T={T} x={90} y={480} w={900} h={760} />
        {/* montants de la baie */}
        <rect x={70} y={460} width={940} height={22} fill="#120E18" />
        <rect x={70} y={1238} width={940} height={30} fill="#120E18" />
        <rect x={70} y={460} width={22} height={800} fill="#120E18" />
        <rect x={988} y={460} width={22} height={800} fill="#120E18" />
        <rect x={530} y={460} width={18} height={800} fill="#120E18" />
        <rect x={92} y={860} width={896} height={10} fill="#120E18" opacity={0.8} />
        <path d="M0 420 Q60 900 30 1320 L130 1320 Q110 880 120 420 Z" fill="url(#bCurt)" />
        <path d="M1080 420 Q1020 900 1050 1320 L950 1320 Q970 880 960 420 Z" fill="url(#bCurt)" />
        <rect x={0} y={1268} width={1080} height={700} fill="#1A1420" />
        <path d="M90 1268 L990 1268 L1180 1920 L-100 1920 Z" fill="rgba(255,140,80,0.10)" filter="url(#b24)" />
        <Glow x={540} y={1000} r={360} color="#FF9A5A" o={0.16} blur={40} />
        <Person hero={hero} p={hero ? breathe(P.handOnGlass, T) : P.handOnGlass} x={430} y={1640} h={820} look="rimOrange" light={{amb: 0.3, tint: '#24141C', rim: '#F2963E'}} />
      </g>
    </svg>
  );
};

// ---------------- la rue vue de dessus ----------------
type Mob = {kind: 'run' | 'z'; x0: number; y: number; v: number; t0: number; ph: number; target?: number};
/** foule déterministe : fuyards (blancs) de gauche à droite, infectés (verts) derrière eux */
const MOBS: Mob[] = (() => {
  const m: Mob[] = [];
  for (let i = 0; i < 9; i++) m.push({kind: 'run', x0: -120 - i * 150 - rand(i) * 80, y: 930 + rand(i * 3) * 340, v: 250 + rand(i * 5) * 90, t0: 16.0, ph: rand(i * 7)});
  for (let i = 0; i < 22; i++) m.push({kind: 'z', x0: -260 - i * 95 - rand(i + 40) * 120, y: 900 + rand(i * 3 + 40) * 400, v: 190 + rand(i * 5 + 40) * 70, t0: 18.9, ph: rand(i * 7 + 40)});
  return m;
})();
const ALARM_CAR = {x: 330, y: 1240};

/** positions et poses de la foule à l'instant T (avant l'alarme : poursuite ; après : tous vers la voiture) */
const crowdAt = (T: number, alarm: number) =>
  MOBS.map((m, i) => {
    const dt = Math.max(0, T - m.t0);
    let x = m.x0 + m.v * dt, y = m.y + Math.sin(dt * 2 + i) * 12;
    let dir = 0;
    if (m.kind === 'z' && T > alarm) {
      // demi-tour vers la voiture qui sonne
      const xa = m.x0 + m.v * (alarm - m.t0), ya = m.y;
      const k = clamp01((T - alarm) * 0.55 * (0.7 + rand(i) * 0.6));
      const tx = ALARM_CAR.x + (rand(i * 9) - 0.5) * 260, ty = ALARM_CAR.y + (rand(i * 11) - 0.5) * 160;
      x = lerp(xa, tx, easeInOut(k));
      y = lerp(ya, ty, easeInOut(k));
      dir = tx < xa ? 180 : 0;
    }
    return {m, x, y, dir, i};
  });

export const Rue: React.FC<SceneP & {alarmAt?: number}> = ({T, B, alarmAt}) => {
  const alarm = alarmAt ?? B.r1y - 0.15;
  const s0 = B.bas;
  // caméra : plongée inclinée qui se redresse, puis s'approche de la voiture qui sonne
  const k0 = prog(T, s0, s0 + 2.6, easeOut);
  let z = lerp(1.32, 1.0, k0), r = lerp(-16, -4, k0);
  let cx = lerp(620, 560, k0), cy = 1110;
  const ka = prog(T, alarm, alarm + 2.2, easeInOut);
  z = lerp(z, 1.28, ka);
  cx = lerp(cx, ALARM_CAR.x + 120, ka);
  cy = lerp(cy, ALARM_CAR.y - 60, ka);
  r = lerp(r, 2, ka);
  const crowd = crowdAt(T, alarm);
  const blink = T > alarm ? (Math.floor((T - alarm) * 3.2) % 2 === 0 ? 1 : 0.15) : 0;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="roofT" stops={[[0, '#33323C'], [1, '#45434F']]} />
        <VGrad id="roofB" stops={[[0, '#3C3B45'], [1, '#2A2932']]} />
        <RGrad id="pool" stops={[[0, 'rgba(255,214,140,0.42)'], [1, 'rgba(255,214,140,0)']]} />
      </defs>
      <Cam x={cx} y={cy} z={z} r={r}>
        <rect x={-900} y={-200} width={3000} height={2600} fill="#232229" />
        {/* toits et auvents en haut */}
        <rect x={-900} y={200} width={3000} height={560} fill="url(#roofT)" />
        {Array.from({length: 18}, (_, i) => (
          <g key={i}>
            <rect x={-860 + i * 170} y={260 + (i % 3) * 60} width={60} height={34} fill={i % 4 === 0 ? '#E6B85A' : '#2A2930'} opacity={0.9} />
            <rect x={-760 + i * 170} y={420 + (i % 2) * 70} width={60} height={34} fill={i % 5 === 1 ? '#E6B85A' : '#2A2930'} opacity={0.9} />
          </g>
        ))}
        {Array.from({length: 14}, (_, i) => (
          <rect key={`a${i}`} x={-900 + i * 220} y={700} width={200} height={60} fill={['#A9302C', '#2E4A96', '#2F7A4E', '#A9302C', '#7A2E8A'][i % 5]} />
        ))}
        {Array.from({length: 14}, (_, i) => (
          <rect key={`v${i}`} x={-860 + i * 220} y={760} width={130} height={16} fill="#F2C46A" opacity={i % 3 === 0 ? 0.9 : 0.25} />
        ))}
        {/* trottoirs, chaussée, marquages */}
        <rect x={-900} y={776} width={3000} height={130} fill="#55545C" />
        <rect x={-900} y={906} width={3000} height={8} fill="#6E6D75" />
        <rect x={-900} y={914} width={3000} height={400} fill="#2C2C33" />
        <rect x={-900} y={1314} width={3000} height={8} fill="#6E6D75" />
        <rect x={-900} y={1322} width={3000} height={140} fill="#55545C" />
        <rect x={-900} y={1462} width={3000} height={700} fill="url(#roofB)" />
        {Array.from({length: 30}, (_, i) => <rect key={`d${i}`} x={-900 + i * 110} y={1010} width={56} height={7} fill="#D8D8D8" opacity={0.75} />)}
        {Array.from({length: 30}, (_, i) => <rect key={`e${i}`} x={-900 + i * 110} y={1214} width={56} height={7} fill="#D8D8D8" opacity={0.75} />)}
        <rect x={-900} y={1106} width={3000} height={6} fill="#C9A53A" />
        <rect x={-900} y={1118} width={3000} height={6} fill="#C9A53A" />
        {[[-100, 800], [380, 800], [860, 800], [1340, 800], [140, 1430], [620, 1430], [1100, 1430]].map(([x, y], i) => (
          <circle key={`p${i}`} cx={x} cy={y} r={150} fill="url(#pool)" />
        ))}
        {[[150, 980], [720, 1270], [980, 1020], [-60, 1180]].map(([x, y], i) => <ellipse key={`m${i}`} cx={x} cy={y} rx={34} ry={22} fill="#1E1E24" />)}
        {/* sang, débris */}
        <path d="M470 1150 q60 10 120 -6 q50 -8 90 10" stroke="#5E1212" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.85} />
        <path d="M820 1260 q40 -20 90 -10" stroke="#5E1212" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
        {Array.from({length: 26}, (_, i) => <rect key={`x${i}`} x={-300 + rand(i) * 1700} y={930 + rand(i + 9) * 380} width={8 + rand(i + 3) * 10} height={6} fill="#8A8A92" transform={`rotate(${rand(i + 5) * 90})`} opacity={0.7} />)}
        {/* véhicules */}
        <CarTop x={ALARM_CAR.x} y={ALARM_CAR.y} r={-8} color="#A8262A" alarm={blink} />
        <CarTop x={980} y={980} r={12} color="#2F4E8E" />
        <CarTop x={-180} y={1000} r={-4} color="#5A5A62" />
        <VanTop x={720} y={1130} r={28} T={T} />
        {T > alarm ? [0, 1, 2].map((i) => {
          const ph = ((T - alarm) * 0.9 + i / 3) % 1;
          return <circle key={`w${i}`} cx={ALARM_CAR.x} cy={ALARM_CAR.y} r={60 + ph * 520} fill="none" stroke="#FFC24A" strokeWidth={6} opacity={(1 - ph) * 0.55} />;
        }) : null}
        {/* foule : silhouettes couchées dans le sens de la course */}
        {crowd.map(({m, x, y, dir, i}) => {
          if (x < -400 || x > 1500) return null;
          const ph = T * (m.kind === 'run' ? 2.6 : 2.2) + m.ph;
          // infectés : course bras tendus (référence : ils courent, ils ne traînent pas les pieds)
          const zr = {...run(ph), aL: 80 + 8 * Math.sin(ph * 6.28), aLb: 0, aR: 98 - 8 * Math.sin(ph * 6.28), aRb: 0, head: 12};
          const pose = m.kind === 'run' ? run(ph) : T > alarm && clamp01((T - alarm) * 0.55) >= 1 ? shamble(ph) : zr;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y + 6} rx={22} ry={8} fill="rgba(0,0,0,0.35)" />
              <Stick p={pose} x={x} y={y} h={m.kind === 'run' ? 74 : 70} look={m.kind === 'run' ? 'runner' : 'zombie'} flip={dir === 180} />
            </g>
          );
        })}
      </Cam>
    </svg>
  );
};

// ---------------- la rue de nuit : des têtes qui se lèvent vers ta fenêtre ----------------
const HEADS = Array.from({length: 150}, (_, i) => {
  // la 1re au centre, les 10 suivantes autour, puis la marée
  const ring = i === 0 ? 0 : i <= 10 ? 1 : 2;
  const a = rand(i * 3.3) * Math.PI * 2;
  const d = ring === 0 ? 0 : ring === 1 ? 120 + rand(i) * 140 : 220 + rand(i * 1.7) * 760;
  return {x: 540 + Math.cos(a) * d * 1.05, y: 1080 + Math.sin(a) * d * 0.9, ring, s: 0.85 + rand(i * 5) * 0.3, ph: rand(i * 7)};
});

export const Tetes: React.FC<SceneP & {dark?: number}> = ({T, B, dark = 0}) => {
  const z = lerp(1.9, 1.0, prog(T, B.tetes, B.cent + 0.8, easeInOut)) * lerp(1, 0.94, prog(T, B.cent, B.choix + 5, (x) => x));
  const upAt = (ring: number, i: number) => (ring === 0 ? B.une - 0.1 : ring === 1 ? B.dix - 0.15 + rand(i) * 0.25 : B.cent - 0.2 + rand(i) * 0.5);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <RGrad id="moonPool" stops={[[0, 'rgba(120,150,255,0.20)'], [1, 'rgba(120,150,255,0)']]} />
        <RGrad id="beamPool" stops={[[0, 'rgba(255,236,190,0.28)'], [1, 'rgba(255,236,190,0)']]} />
      </defs>
      <rect width={1080} height={1920} fill="#0B0C14" />
      <Cam x={540} y={1060} z={z}>
        <rect x={-600} y={-200} width={2300} height={2600} fill="#14151E" />
        <rect x={-600} y={760} width={2300} height={640} fill="#191A24" />
        {Array.from({length: 20}, (_, i) => <rect key={i} x={-600 + i * 120} y={1074} width={60} height={7} fill="#3A3B48" />)}
        <rect x={-600} y={754} width={2300} height={6} fill="#2A2B36" />
        <rect x={-600} y={1400} width={2300} height={6} fill="#2A2B36" />
        <circle cx={540} cy={1080} r={900} fill="url(#moonPool)" />
        <circle cx={600} cy={1020} r={380} fill="url(#beamPool)" opacity={prog(T, B.tetes, B.tetes + 1)} />
        <CarTop x={120} y={900} r={10} color="#2A2A36" />
        <CarTop x={960} y={1300} r={-14} color="#2A2A36" />
        {HEADS.map((h, i) => {
          const u = prog(T, upAt(h.ring, i), upAt(h.ring, i) + 0.45, easeOut);
          const vis = h.ring === 2 ? prog(T, B.tetes - 0.2, B.tetes + 1.5) : 1;
          const r = 26 * h.s * lerp(1, 1.14, u);
          const sway = Math.sin(T * 1.3 + h.ph * 6) * 3 * (1 - u);
          return (
            <g key={i} transform={`translate(${h.x + sway},${h.y})`} opacity={vis}>
              <ellipse cx={0} cy={22 * h.s} rx={44 * h.s} ry={24 * h.s} fill="#3E4A38" />
              <circle cx={0} cy={4} r={r + 3} fill="#151A12" />
              <circle cx={0} cy={4} r={r} fill={u > 0.05 ? '#9DAA92' : '#56634E'} />
              {u > 0.05 ? (
                <g opacity={u}>
                  <circle cx={-9 * h.s} cy={0} r={8 * h.s} fill="#FFF6D0" opacity={0.7} filter="url(#b4)" />
                  <circle cx={9 * h.s} cy={0} r={8 * h.s} fill="#FFF6D0" opacity={0.7} filter="url(#b4)" />
                  <circle cx={-9 * h.s} cy={0} r={4.2 * h.s} fill="#FFFBEA" />
                  <circle cx={9 * h.s} cy={0} r={4.2 * h.s} fill="#FFFBEA" />
                  <rect x={-7 * h.s} y={13 * h.s} width={14 * h.s} height={5 * h.s} rx={2} fill="#2A2A22" />
                </g>
              ) : null}
            </g>
          );
        })}
      </Cam>
      <rect width={1080} height={1920} fill={`rgba(0,0,0,${dark})`} />
    </svg>
  );
};

export {Glow};
