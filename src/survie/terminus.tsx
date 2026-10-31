// Scènes de « TERMINUS » (kairos) : le dernier métro, 1 h 12, une station qui n'existe sur aucun plan.
// La station est un vrai volume en perspective (voûte carrelée, quai, voie, rame, néons qui grésillent), calculé à partir de
// coordonnées en mètres ; les autres décors (voiture, portes, interphone, plan de ligne) sont dessinés à plat.
// Lumière : néon vert-blanc sur le quai, jaune chaud dans la rame, cyan de l'écran du téléphone dans le noir.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOut, easeOut, FPS, lerp, prog, rand, sp} from '../theme';
import type {Light} from './hero';
import {Figure, LOOKS, Rider, SP} from './rider';
import {mixHex, Pose} from './stick';
import {SF, SV} from './ui';
import {Blurs, Cam, SceneP, VGrad} from './world';

type Pt = [number, number];
const pts = (a: Pt[]) => a.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');

// ---------------- les néons : allumé, grésillant ou mort, toujours déterministe ----------------
/** néon qui grésille : surtout allumé, avec des salves de coupures (seed = un néon) */
export const flicker = (T: number, seed: number, rate = 0.22) => {
  const f = Math.floor(T * 24);
  const burst = rand(Math.floor(T * 1.7) * 13 + seed) < rate * 2.2; // une salve toutes les ~0,6 s en moyenne
  if (!burst) return 0.92 + 0.08 * rand(f + seed * 7);
  return rand(f * 3 + seed) < 0.55 ? 0.08 : 0.95;
};

// ---------------- la station en perspective ----------------
export type View = {cx: number; cy: number; cz: number; F: number; VX: number; VY: number};
const pj = (v: View, X: number, Y: number, Z: number): Pt => {
  const d = Math.max(0.08, Z - v.cz);
  return [v.VX + (v.F * (X - v.cx)) / d, v.VY + (v.F * (Y - v.cy)) / d];
};
const ST = {floor: 1.6, wall: 3.0, spring: -1.0, xc: -1.25, rx: 4.25, ry: 3.0, left: -5.5, track: 2.7, edge: -1.6, end: 42};
export const NEONS = [3, 9, 15, 21, 27, 33, 39];
// profil de la voûte, du pied du mur de droite au pied du mur de gauche ; [X, Y, part] (0 mur droit, 1 voûte droite, 2 voûte gauche, 3 mur gauche)
const PROFILE: [number, number, number][] = (() => {
  const a: [number, number, number][] = [[ST.wall, ST.floor, 0], [ST.wall, ST.spring, 0]];
  for (let i = 0; i <= 16; i++) {
    const th = (i / 16) * Math.PI;
    a.push([ST.xc + ST.rx * Math.cos(th), ST.spring - ST.ry * Math.sin(th), i <= 8 ? 1 : 2]);
  }
  a.push([ST.left, ST.spring, 3], [ST.left, ST.track, 3]);
  return a;
})();
const PART_K = [1, 0.62, 0.34, 0.24];
const TILE_DARK = '#060A09', TILE_LIT = '#DCE8D4';

export type StationOpts = {
  T: number;
  /** intensité de chaque néon (indice dans NEONS) */
  neon: (k: number) => number;
  train?: boolean;
  /** la silhouette sur le quai : profondeur Z, position X, tête penchée (deg), opacité */
  sil?: {z: number; x: number; tilt?: number; o?: number; walk?: number; lit?: number};
  amb?: number;
};
const litAt = (z: number, o: StationOpts) => {
  let b = o.amb ?? 0.04;
  NEONS.forEach((zk, k) => {
    const d = z - zk, i = o.neon(k);
    b += i * (0.85 * Math.exp(-((d / 2.6) ** 2)) + 0.22 * Math.exp(-((d / 7) ** 2)));
  });
  return b;
};

/** la station vue depuis `v` : voûte, mur carrelé, plaques, sièges, quai, voie, rame, néons, silhouette */
export const Station: React.FC<{v: View; o: StationOpts}> = ({v, o}) => {
  const zs: number[] = [];
  for (let z = v.cz + 0.45; z < ST.end; z += Math.max(0.45, (z - v.cz) * 0.11)) zs.push(z);
  zs.push(ST.end);
  const fog = (z: number) => 1 / (1 + ((z - v.cz) / 34) ** 2);
  const col = (z: number, k: number) => mixHex(TILE_DARK, TILE_LIT, clamp01(litAt(z, o) * k * fog(z)));
  const shell: React.ReactNode[] = [], floor: React.ReactNode[] = [];
  for (let i = 0; i + 1 < zs.length; i++) {
    const z0 = zs[i], z1 = zs[i + 1], zm = (z0 + z1) / 2;
    for (let part = 0; part < 4; part++) {
      const pp = PROFILE.filter((q, j) => q[2] === part || PROFILE[j + 1]?.[2] === part);
      const poly = [...pp.map((q) => pj(v, q[0], q[1], z0)), ...pp.slice().reverse().map((q) => pj(v, q[0], q[1], z1))];
      const c = col(zm, PART_K[part]);
      shell.push(<polygon key={`s${i}-${part}`} points={pts(poly)} fill={c} stroke={mixHex(c, '#000000', 0.35)} strokeWidth={part === 0 ? 1.4 : 1} />);
    }
    // quai : asphalte, bande blanche du bord
    const fc = mixHex('#050706', '#7F887F', clamp01(litAt(zm, o) * 0.8 * fog(zm)));
    floor.push(<polygon key={`f${i}`} points={pts([pj(v, ST.edge + 0.42, ST.floor, z0), pj(v, ST.wall, ST.floor, z0), pj(v, ST.wall, ST.floor, z1), pj(v, ST.edge + 0.42, ST.floor, z1)])} fill={fc} />);
    floor.push(<polygon key={`e${i}`} points={pts([pj(v, ST.edge, ST.floor, z0), pj(v, ST.edge + 0.42, ST.floor, z0), pj(v, ST.edge + 0.42, ST.floor, z1), pj(v, ST.edge, ST.floor, z1)])} fill={mixHex(fc, '#F4F0E2', 0.35)} />);
    if (v.cx < ST.edge) floor.push(<polygon key={`ef${i}`} points={pts([pj(v, ST.edge, ST.floor, z0), pj(v, ST.edge, ST.track, z0), pj(v, ST.edge, ST.track, z1), pj(v, ST.edge, ST.floor, z1)])} fill={mixHex(fc, '#000000', 0.55)} />);
  }
  const zn = zs[0], zf = ST.end;
  const lineZ = (X: number, Y: number, w: number, c: string, o2 = 1, k = 0) => {
    const a = pj(v, X, Y, zn), b = pj(v, X, Y, zf);
    return <line key={`l${k}-${X}-${Y}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} opacity={o2} />;
  };
  // joints du carrelage du mur de droite (rangs horizontaux) et de la voûte (filants)
  const joints: React.ReactNode[] = [];
  for (let y = ST.floor - 0.15; y > ST.spring; y -= 0.16) joints.push(lineZ(ST.wall - 0.002, y, 1.1, 'rgba(0,0,0,0.38)', 1, 1));
  PROFILE.forEach((q, j) => { if (q[2] === 1 || q[2] === 2) joints.push(lineZ(q[0], q[1], 1, 'rgba(0,0,0,0.3)', 1, 2 + j)); });
  // plaques émaillées « TERMINUS » et sièges orange sur le mur de droite
  const plates = [6, 18, 30].map((z) => {
    const a = pj(v, ST.wall - 0.01, -0.45, z + 1.2), b = pj(v, ST.wall - 0.01, -0.45, z - 1.2), c = pj(v, ST.wall - 0.01, 0.1, z + 1.2);
    if (z - 1.2 < v.cz + 0.5) return null;
    const lk = clamp01(litAt(z, o) * fog(z) * 1.1);
    // carte affine du rectangle 240×55 vers le quadrilatère (approximation suffisante sur 2,4 m)
    const m = `matrix(${(b[0] - a[0]) / 240},${(b[1] - a[1]) / 240},${(c[0] - a[0]) / 55},${(c[1] - a[1]) / 55},${a[0]},${a[1]})`;
    return (
      <g key={`p${z}`} transform={m}>
        <rect x={-6} y={-6} width={252} height={67} rx={6} fill={mixHex('#05060A', '#E9E4D4', lk)} />
        <rect x={0} y={0} width={240} height={55} rx={4} fill={mixHex('#02040C', '#1B3478', lk)} />
        <text x={120} y={44} textAnchor="middle" fontFamily={SF.title} fontSize={46} letterSpacing="3" fill={mixHex('#05060A', '#F4F1E6', lk)}>TERMINUS</text>
      </g>
    );
  });
  const seats = [10, 24].map((z) => {
    if (z - 1 < v.cz + 0.5) return null;
    const lk = clamp01(litAt(z, o) * fog(z) * 0.9);
    const q = [pj(v, ST.wall - 0.45, 1.15, z - 1), pj(v, ST.wall - 0.02, 1.15, z - 1), pj(v, ST.wall - 0.02, 1.15, z + 1), pj(v, ST.wall - 0.45, 1.15, z + 1)];
    const back = [pj(v, ST.wall - 0.02, 1.15, z - 1), pj(v, ST.wall - 0.02, 0.62, z - 1), pj(v, ST.wall - 0.02, 0.62, z + 1), pj(v, ST.wall - 0.02, 1.15, z + 1)];
    return (
      <g key={`b${z}`}>
        <polygon points={pts(back)} fill={mixHex('#0A0503', '#D2672A', lk)} />
        <polygon points={pts(q)} fill={mixHex('#0A0503', '#E8803A', lk)} />
      </g>
    );
  });
  // la rame à quai : flanc acier, bande bleue, fenêtres et portes éclairées de l'intérieur
  const train: React.ReactNode[] = [];
  if (o.train) {
    const X = -1.75, top = -1.15, bot = 1.45, zEnd = 38;
    for (let i = 0; i + 1 < zs.length && zs[i] < zEnd; i++) {
      const z0 = zs[i], z1 = Math.min(zEnd, zs[i + 1]), zm = (z0 + z1) / 2;
      const c = mixHex('#08090B', '#B4BBC2', clamp01(litAt(zm, o) * 0.75 * fog(zm) + 0.05));
      train.push(<polygon key={`t${i}`} points={pts([pj(v, X, top, z0), pj(v, X, bot, z0), pj(v, X, bot, z1), pj(v, X, top, z1)])} fill={c} />);
      train.push(<polygon key={`tb${i}`} points={pts([pj(v, X, 0.52, z0), pj(v, X, 0.72, z0), pj(v, X, 0.72, z1), pj(v, X, 0.52, z1)])} fill={mixHex('#02040A', '#22409A', clamp01(litAt(zm, o) * fog(zm) + 0.1))} />);
    }
    const quad = (z0: number, z1: number, y0: number, y1: number, fill: string, k: string, op = 1) => (
      <polygon key={k} points={pts([pj(v, X, y0, z0), pj(v, X, y1, z0), pj(v, X, y1, z1), pj(v, X, y0, z1)])} fill={fill} opacity={op} />
    );
    for (let car = 0; car < 3; car++) {
      const c0 = -6 + car * 15;
      [[2.9, 4.5], [6.6, 8.2], [10.3, 11.9]].forEach(([a, b], j) => {
        if (c0 + b < v.cz + 0.5 || c0 + a > zEnd) return;
        const za = Math.max(v.cz + 0.5, c0 + a), zb = c0 + b;
        train.push(quad(za, zb, -0.62, 0.4, '#FFE3A6', `w${car}-${j}`, 0.92 * fog(za) + 0.08));
      });
      [1.9, 5.55, 9.25, 12.9].forEach((dz, j) => {
        const za = c0 + dz - 0.65, zb = c0 + dz + 0.65;
        if (zb < v.cz + 0.5 || za > zEnd) return;
        train.push(quad(Math.max(v.cz + 0.5, za), zb, -0.8, 1.42, '#2A2F35', `d${car}-${j}`, 0.9));
        train.push(quad(Math.max(v.cz + 0.5, za + 0.1), zb - 0.1, -0.62, 0.15, '#FFDD98', `dw${car}-${j}`, 0.85 * fog(za) + 0.1));
      });
      if (c0 + 15 > v.cz + 0.5 && c0 + 15 < zEnd) train.push(quad(c0 + 14.85, c0 + 15.15, top, bot, '#050506', `g${car}`));
    }
    // dessous de caisse, puis phares contre le tunnel
    const u = [pj(v, X, bot, zs[0]), pj(v, X, ST.track - 0.1, zs[0]), pj(v, X, ST.track - 0.1, zEnd), pj(v, X, bot, zEnd)];
    train.push(<polygon key="under" points={pts(u)} fill="#040405" />);
    const hl = pj(v, -2.5, 0.9, zEnd + 0.3);
    train.push(<circle key="hl" cx={hl[0]} cy={hl[1]} r={v.F * 1.6 / (zEnd - v.cz)} fill="#FFF0C8" opacity={0.5} filter="url(#b24)" />);
  }
  // néons sur le haut du mur de droite : tube + halo
  const tubes = NEONS.map((zk, k) => {
    if (zk - 0.7 < v.cz + 0.4) return null;
    const i = o.neon(k), a = pj(v, ST.wall - 0.08, ST.spring + 0.12, zk - 0.7), b = pj(v, ST.wall - 0.08, ST.spring + 0.12, zk + 0.7);
    const d = zk - v.cz, f = fog(zk);
    const g = pj(v, ST.wall - 0.5, ST.floor, zk);
    return (
      <g key={`n${k}`}>
        {i > 0.2 ? <ellipse cx={g[0]} cy={g[1]} rx={(v.F * 1.3) / d} ry={(v.F * 0.32) / d} fill="#CFF2DC" opacity={0.28 * i * f} filter="url(#b14)" /> : null}
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={i > 0.2 ? '#F2FFF4' : '#2A302C'} strokeWidth={Math.max(2, (v.F * 0.07) / d)} strokeLinecap="round" />
        {i > 0.2 ? <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#BFF5D2" strokeWidth={Math.max(6, (v.F * 0.5) / d)} strokeLinecap="round" opacity={0.45 * i * f} filter="url(#b8)" /> : null}
      </g>
    );
  });
  // au fond : la bouche du tunnel, un feu rouge
  const red = pj(v, -3.6, 0.2, ST.end + 18);
  // la silhouette : trop grande, immobile, tournée vers le mur
  let sil: React.ReactNode = null;
  if (o.sil && o.sil.z > v.cz + 0.6) {
    const {z, x, tilt = 0, o: so = 1, walk = 0, lit = 0} = o.sil;
    const d = z - v.cz, foot = pj(v, x, ST.floor, z), hpx = (v.F * 1.95) / d;
    const k = NEONS.reduce((bi, zk, i) => (Math.abs(zk - z) < Math.abs(NEONS[bi] - z) ? i : bi), 0);
    const li = Math.max(lit, clamp01(o.neon(k) * Math.exp(-(((z - NEONS[k]) / 3) ** 2)) + 0.06));
    const s = Math.sin(walk * Math.PI * 2);
    const pose: Pose = {...SP.standStill, head: 8 + tilt, lL: -3 + 9 * s, lR: 3 - 9 * s, aL: -3 - 5 * s, aR: 3 + 5 * s};
    sil = (
      <g opacity={so}>
        <ellipse cx={foot[0]} cy={foot[1]} rx={hpx * 0.22} ry={hpx * 0.04} fill="#000" opacity={0.6} />
        <Figure look={LOOKS.usager} p={pose} x={foot[0]} y={foot[1]} h={hpx / 1.12} light={{amb: 0.08 + 0.55 * li, tint: '#020403', rim: li > 0.4 ? '#7FB89A' : undefined}} fingers={1} />
      </g>
    );
  }
  return (
    <g>
      <rect x={-2000} y={-2000} width={6000} height={6000} fill="#010202" />
      <circle cx={red[0]} cy={red[1]} r={14} fill="#FF2A1E" opacity={0.9} />
      <circle cx={red[0]} cy={red[1]} r={50} fill="#FF2A1E" opacity={0.4} filter="url(#b14)" />
      {shell}
      {joints}
      {plates}
      {seats}
      {floor}
      {train}
      {tubes}
      {sil}
    </g>
  );
};

// ---------------- 1 · le quai (accroche) : quai désert, néon qui grésille, la silhouette au bout ----------------
export const Quai: React.FC<SceneP & {tilt: number; out: number}> = ({T, tilt, out}) => {
  const k = prog(T, 0, out, (q) => q);
  const v: View = {cx: lerp(0.95, 0.8, k), cy: 0.04 * Math.sin(T * 1.3), cz: lerp(2, 7.2, easeOut(k)), F: lerp(800, 900, k), VX: 540, VY: 820};
  const neon = (i: number) => (i === 0 ? 0.32 * flicker(T, 3, 0.12) : i === 2 ? flicker(T, 11, 0.3) : 0);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <Station v={v} o={{T, neon, train: true, amb: 0.02, sil: {z: 15.6, x: 2.0, tilt: 34 * prog(T, tilt, tilt + 1.2, easeInOut)}}} />
      <rect width={1080} height={1920} fill="url(#qVig)" />
      <defs><radialGradient id="qVig" cx="0.53" cy="0.43" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
    </svg>
  );
};

// ---------------- 2 · le plan de ligne au-dessus des portes : le voyant clignote entre deux stations ----------------
const STATIONS = ['PORTE D’ARGENT', 'LES CORDIERS', 'HALLE-AUX-DRAPS', 'SAINT-ÉLOI', null, 'MARCHÉ-NEUF', 'CLOS-FLEURI'];
export const PlanLigne: React.FC<SceneP & {t0: number; stop: number}> = ({T, t0, stop}) => {
  const frame = useCurrentFrame();
  const SX = (i: number) => 260 + i * 330, LY = 980;
  // le voyant du train avance, puis s'arrête là où il n'y a rien
  const pos = lerp(SX(2) + 40, SX(4), prog(T, t0, stop, easeInOut));
  const blink = T >= stop ? (Math.floor(T * 5) % 2 ? 1 : 0.25) : 1;
  const cam = {x: lerp(900, SX(4) - 60, prog(T, t0, stop + 0.4, easeInOut)), y: 940, z: lerp(0.78, 1.22, prog(T, stop - 0.2, stop + 1.6, easeInOut))};
  const q = prog(T, stop + 0.35, stop + 0.75, easeOut);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="plBg" stops={[[0, '#1A1E24'], [1, '#0B0D10']]} />
        <VGrad id="plPanel" stops={[[0, '#141B2A'], [1, '#0B111C']]} />
      </defs>
      <rect width={1080} height={1920} fill="url(#plBg)" />
      <Cam x={cam.x} y={cam.y} z={cam.z} r={-2 + 1.2 * Math.sin(T * 0.8)}>
        {/* plafond de la voiture et lumière jaune */}
        <rect x={-600} y={0} width={3600} height={560} fill="#2C2E2C" />
        <rect x={-600} y={470} width={3600} height={40} fill="#FFE7B0" opacity={0.85} />
        <rect x={-600} y={430} width={3600} height={130} fill="#FFE2A0" opacity={0.25} filter="url(#b24)" />
        {/* le plan */}
        <rect x={40} y={720} width={2300} height={500} rx={18} fill="url(#plPanel)" stroke="#3A4150" strokeWidth={6} />
        <rect x={40} y={720} width={2300} height={70} rx={18} fill="#E9E6DD" />
        <text x={90} y={770} fontFamily={SF.cap} fontWeight={800} fontSize={34} letterSpacing="5" fill="#1A1E28">DIRECTION CLOS-FLEURI</text>
        <rect x={80} y={LY - 14} width={2220} height={28} rx={14} fill="#D9B419" />
        {STATIONS.map((s, i) => s ? (
          <g key={i}>
            <circle cx={SX(i)} cy={LY} r={30} fill="#F4F1E8" stroke="#0B111C" strokeWidth={8} />
            <circle cx={SX(i)} cy={LY} r={10} fill={i <= 3 ? '#3A2420' : '#5A2A22'} />
            <text x={SX(i) - 6} y={LY - 52} transform={`rotate(-38,${SX(i) - 6},${LY - 52})`} fontFamily={SF.cap} fontWeight={800} fontSize={34} letterSpacing="1" fill={i <= 3 ? 'rgba(244,241,232,0.55)' : '#F4F1E8'}>{s}</text>
          </g>
        ) : null)}
        {/* le voyant rouge, là où le plan ne montre rien */}
        <circle cx={pos} cy={LY} r={46} fill="#FF3322" opacity={0.55 * blink} filter="url(#b14)" />
        <circle cx={pos} cy={LY} r={17} fill={blink > 0.5 ? '#FF4A36' : '#5A1A14'} stroke="#200806" strokeWidth={4} />
        <text x={SX(4)} y={LY + 120} textAnchor="middle" fontFamily={SF.title} fontSize={110} fill="#FF4E42" opacity={q * blink} style={{filter: 'drop-shadow(0 0 16px rgba(255,60,40,0.8))'}} transform={`translate(0,${(1 - q) * 20})`}>?</text>
        {/* reflets sur le plexiglas */}
        <path d="M200 720 L420 720 L180 1220 L-40 1220 Z" fill="#FFFFFF" opacity={0.05} />
        <path d="M1500 720 L1580 720 L1340 1220 L1260 1220 Z" fill="#FFFFFF" opacity={0.04} />
        {/* les portes en dessous */}
        <rect x={-600} y={1220} width={3600} height={900} fill="#23272C" />
        <rect x={SX(4) - 260} y={1300} width={250} height={900} fill="#3A4048" stroke="#14171A" strokeWidth={8} />
        <rect x={SX(4) + 10} y={1300} width={250} height={900} fill="#3A4048" stroke="#14171A" strokeWidth={8} />
        <rect x={SX(4) - 220} y={1360} width={170} height={300} rx={20} fill="#0E1A16" />
        <rect x={SX(4) + 50} y={1360} width={170} height={300} rx={20} fill="#0E1A16" />
      </Cam>
      {/* une secousse à l'arrêt */}
      <rect width={1080} height={1920} fill="#000" opacity={0.25 * (1 - sp(frame, t0, {damping: 18}))} />
    </svg>
  );
};

// ---------------- vue de la station à plat (fenêtres, portes) : carrelage, plaque, néon ----------------
const TileWall: React.FC<{x0: number; x1: number; y0: number; y1: number; lit: number; seed?: number}> = ({x0, x1, y0, y1, lit}) => {
  const tw = 46, th = 24;
  const rows: React.ReactNode[] = [];
  for (let y = y0, r = 0; y < y1; y += th, r++) rows.push(<rect key={r} x={x0} y={y} width={x1 - x0} height={1.6} fill="rgba(0,0,0,0.28)" />);
  const cols: React.ReactNode[] = [];
  for (let y = y0, r = 0; y < y1; y += th, r++) for (let x = x0 + (r % 2 ? tw / 2 : 0); x < x1; x += tw) cols.push(<rect key={`${r}-${x}`} x={x} y={y} width={1.4} height={th} fill="rgba(0,0,0,0.2)" />);
  return (
    <g>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={mixHex('#0A100D', '#D8E4D0', lit)} />
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#twShade)" />
      {rows}
      {cols}
    </g>
  );
};
const Plate: React.FC<{x: number; y: number; w: number; lit: number}> = ({x, y, w, lit}) => {
  const h = w * 0.23;
  return (
    <g>
      <rect x={x - w / 2 - 12} y={y - h / 2 - 12} width={w + 24} height={h + 24} rx={10} fill={mixHex('#06070A', '#E9E4D4', lit)} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill={mixHex('#02040C', '#1B3478', lit)} />
      <text x={x} y={y + h * 0.33} textAnchor="middle" fontFamily={SF.title} fontSize={h * 0.92} letterSpacing={w * 0.012} fill={mixHex('#06070A', '#F5F2E8', lit)}>TERMINUS</text>
    </g>
  );
};
const NeonBar: React.FC<{x0: number; x1: number; y: number; i: number}> = ({x0, x1, y, i}) => (
  <g>
    <rect x={x0 - 14} y={y - 14} width={x1 - x0 + 28} height={28} rx={8} fill="#1C211E" />
    <rect x={x0} y={y - 6} width={x1 - x0} height={12} rx={6} fill={i > 0.2 ? '#F4FFF6' : '#2C332F'} />
    {i > 0.2 ? <rect x={x0 - 40} y={y - 60} width={x1 - x0 + 80} height={120} rx={60} fill="#BFF5D2" opacity={0.35 * i} filter="url(#b24)" /> : null}
  </g>
);

// ---------------- 3 · la rame à quai, vue du quai (titre de série) ----------------
/** caméra posée sur ta fenêtre ; ta tête est en (1575, 832) dans le monde (pour la pastille « TOI ») */
export const RAME_CAM = {x: 1300, y: 980};
export const RameQuai: React.FC<SceneP & {t0: number; hold: number}> = ({T, t0, hold}) => {
  const k = prog(T, t0, hold, easeInOut);
  const cam = {x: lerp(760, RAME_CAM.x, k) + 6 * Math.sin(T * 0.9), y: RAME_CAM.y, z: lerp(0.86, 0.98, prog(T, t0, hold + 3, (q) => q))};
  const n1 = flicker(T, 5, 0.1);
  const win = (x: number) => (
    <g key={x}>
      <rect x={x} y={640} width={300} height={300} rx={26} fill="#FFE2A2" />
      <rect x={x} y={640} width={300} height={300} rx={26} fill="url(#rqIn)" />
      <rect x={x} y={640} width={300} height={300} rx={26} fill="none" stroke="#1A1D21" strokeWidth={12} />
      <path d={`M${x + 40} 650 L${x + 120} 650 L${x + 50} 930 L${x + 10} 930 Z`} fill="#FFFFFF" opacity={0.1} />
    </g>
  );
  const door = (x: number) => (
    <g key={`d${x}`}>
      <rect x={x} y={590} width={300} height={850} fill="#8E969E" stroke="#22262B" strokeWidth={8} />
      <line x1={x + 150} y1={590} x2={x + 150} y2={1440} stroke="#22262B" strokeWidth={8} />
      <rect x={x + 30} y={650} width={95} height={300} rx={14} fill="#FFDD98" />
      <rect x={x + 175} y={650} width={95} height={300} rx={14} fill="#FFDD98" />
      <rect x={x + 112} y={1000} width={14} height={90} rx={6} fill="#C9CED3" />
      <rect x={x + 174} y={1000} width={14} height={90} rx={6} fill="#C9CED3" />
    </g>
  );
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id="twShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0.55} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.4} /></linearGradient>
        <VGrad id="rqBody" stops={[[0, '#C9CFD5'], [0.55, '#A9B0B8'], [1, '#6E757E']]} />
        <VGrad id="rqIn" stops={[[0, 'rgba(255,255,255,0.15)'], [1, 'rgba(150,90,20,0.25)']]} />
        <VGrad id="rqFloor" stops={[[0, '#7C857D'], [1, '#262B28']]} />
      </defs>
      <Cam x={cam.x} y={cam.y} z={cam.z}>
        <TileWall x0={-400} x1={2800} y0={-200} y1={600} lit={0.55 + 0.35 * n1} />
        <NeonBar x0={300} x1={760} y={150} i={n1} />
        <NeonBar x0={1500} x1={1960} y={150} i={0.85} />
        {/* la rame */}
        <rect x={-400} y={520} width={3200} height={950} fill="url(#rqBody)" />
        <rect x={-400} y={520} width={3200} height={40} fill="#D9DEE3" />
        <rect x={-400} y={960} width={3200} height={46} fill="#22409A" />
        {[60, 1060, 2060].map((x) => door(x))}
        {[-320, 410, 710, 1410, 1710, 2410].map((x) => win(x))}
        {/* les passagers derrière les vitres : toi, la dame, l'homme */}
        <g clipPath="url(#rqClip)">
          <Rider p={{...SP.sit, head: 4}} x={1560} y={1080} h={520} hipY={0} light={{amb: 0.95, tint: '#3A2A10'}} phone={1} />
          <Figure look={LOOKS.dame} p={SP.sleep} x={540} y={1080} h={500} hipY={0} light={{amb: 0.92, tint: '#3A2A10'}} />
          <Figure look={LOOKS.imper} p={SP.read} x={2560} y={1080} h={540} hipY={0} flip paper light={{amb: 0.92, tint: '#3A2A10'}} />
        </g>
        <defs>
          <clipPath id="rqClip">{[-320, 410, 710, 1410, 1710, 2410].map((x) => <rect key={x} x={x + 6} y={646} width={288} height={288} rx={22} />)}</clipPath>
        </defs>
        <text x={1260} y={1260} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={40} letterSpacing="8" fill="#2A3038" opacity={0.75}>5</text>
        <rect x={-400} y={1440} width={3200} height={60} fill="#1A1C20" />
        {/* le quai */}
        <rect x={-400} y={1500} width={3200} height={700} fill="url(#rqFloor)" />
        <rect x={-400} y={1500} width={3200} height={42} fill="#E2DFD2" opacity={0.85} />
        <ellipse cx={530} cy={1640} rx={420} ry={60} fill="#CFF2DC" opacity={0.12 * n1} filter="url(#b14)" />
      </Cam>
    </svg>
  );
};

// ---------------- 4 · l'intérieur de la voiture (profil) : toi, la dame qui dort, l'homme au journal, le quatrième ----------------
const WIN_A = [150, 800], WIN_B = [900, 1550], DOOR = [1640, 1980];
export type VoitureState = {L: number; out: number; phone: number; four: number; lean: number; count?: {at: number; who: 0 | 1 | 2 | 3; until?: number}[]; doors: number; shake?: number; walk?: [number, number]};
export const Voiture: React.FC<SceneP & {cam: {x: number; y: number; z: number}; s: VoitureState}> = ({T, cam, s}) => {
  const frame = useCurrentFrame();
  const L = s.L;
  const inLight: Light = {amb: lerp(0.07, 0.95, L), tint: '#05080B', rim: L < 0.35 && s.phone > 0 ? '#7FE3FF' : undefined};
  const outLit = s.out;
  const ceil = mixHex('#030405', '#C3C7C2', L * 0.9);
  const wall = mixHex('#030405', '#8C969A', L * 0.85);
  const fab = mixHex('#020306', '#1F4F90', L);
  const seat = (bx: number, faceR: boolean, k: string) => {
    const back = faceR ? [bx - 50, bx] : [bx, bx + 50];
    const cush = faceR ? [bx, bx + 240] : [bx - 240, bx];
    return (
      <g key={k}>
        <rect x={back[0]} y={880} width={50} height={400} rx={22} fill={fab} stroke={mixHex('#000', '#11151A', L)} strokeWidth={6} />
        <rect x={cush[0]} y={1240} width={240} height={52} rx={18} fill={fab} stroke={mixHex('#000', '#11151A', L)} strokeWidth={6} />
        {Array.from({length: 7}, (_, i) => <circle key={i} cx={cush[0] + 20 + i * 33} cy={1266} r={5} fill={mixHex('#020306', '#3A78C8', L)} />)}
        <rect x={cush[0] + 30} y={1292} width={14} height={90} fill={mixHex('#000', '#6A7076', L)} />
        <rect x={cush[1] - 44} y={1292} width={14} height={90} fill={mixHex('#000', '#6A7076', L)} />
      </g>
    );
  };
  const win = (x0: number, x1: number, k: string) => (
    <g key={k}>
      <rect x={x0} y={470} width={x1 - x0} height={520} rx={40} fill="none" stroke={mixHex('#000', '#2A2F35', L)} strokeWidth={16} />
      <path d={`M${x0 + 60} 480 L${x0 + 170} 480 L${x0 + 70} 980 L${x0 - 30} 980 Z`} fill="#FFFFFF" opacity={0.05 + 0.04 * L} />
    </g>
  );
  const neonOut = outLit;
  const label = (x: number, y: number, n: string, at: number, red = false) => {
    if (T < at - 0.02) return null;
    const k = sp(frame, at, {damping: 9, stiffness: 240, mass: 0.6});
    const c = red ? SV.neon : SV.lime;
    return (
      <g key={n} transform={`translate(${x},${y}) scale(${k})`}>
        <circle r={58} fill="rgba(6,8,6,0.75)" stroke={c} strokeWidth={7} style={{filter: `drop-shadow(0 0 14px ${c})`}} />
        <text y={30} textAnchor="middle" fontFamily={SF.title} fontSize={86} fill={c}>{n}</text>
      </g>
    );
  };
  const shake = s.shake ?? 0;
  const jx = shake * (rand(frame * 1.7) - 0.5) * 18, jy = shake * (rand(frame * 2.3) - 0.5) * 12;
  const fourP: Pose = {...SP.lean, torso: lerp(6, -8, s.lean), head: lerp(12, -22, s.lean), aL: 8, aLb: 30, aR: 14, aRb: 34};
  const POS = {you: [360, 1250], dame: [1070, 1250], imper: [1390, 1250], four: [575, 1300]} as const;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id="twShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0.55} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.4} /></linearGradient>
        <VGrad id="voFloor" stops={[[0, mixHex('#020203', '#5A5E62', L)], [1, mixHex('#000000', '#2A2C30', L)]]} />
        <clipPath id="voWins">
          <rect x={WIN_A[0]} y={470} width={WIN_A[1] - WIN_A[0]} height={520} rx={40} />
          <rect x={WIN_B[0]} y={470} width={WIN_B[1] - WIN_B[0]} height={520} rx={40} />
          <rect x={DOOR[0] + 170 * (1 - s.doors)} y={380} width={(DOOR[1] - DOOR[0]) * s.doors} height={1010} />
          <rect x={2060} y={470} width={500} height={520} rx={40} />
        </clipPath>
        <clipPath id="voPocket"><rect x={WIN_B[1] + 10} y={360} width={2060 - WIN_B[1] - 20} height={1040} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="#000" />
      <g transform={`translate(${jx},${jy})`}>
        <Cam x={cam.x} y={cam.y} z={cam.z}>
          {/* dehors, derrière les vitres : le mur du quai, la plaque, le néon (la station ne bouge pas) */}
          <g clipPath="url(#voWins)">
            <TileWall x0={-200} x1={2700} y0={300} y1={1300} lit={0.08 + 0.6 * neonOut} />
            <NeonBar x0={500} x1={1300} y={420} i={neonOut} />
            <Plate x={1240} y={760} w={560} lit={0.1 + 0.85 * neonOut} />
            <rect x={-200} y={1300} width={2900} height={200} fill={mixHex('#030404', '#6E776F', 0.1 + 0.8 * neonOut)} />
            <rect x={-200} y={1300} width={2900} height={22} fill={mixHex('#030404', '#E0DDD0', 0.1 + 0.8 * neonOut)} />
          </g>
          {/* la porte (ouverte sur le quai) : vantaux poussés dans les poches, derrière la paroi */}
          <g clipPath="url(#voPocket)">
            {[0, 1].map((side) => {
              const w0 = (DOOR[1] - DOOR[0]) / 2, off = s.doors * (w0 - 30);
              const x = side ? DOOR[0] + w0 + off : DOOR[0] - off;
              return (
                <g key={side}>
                  <rect x={x} y={392} width={w0} height={1000} fill={mixHex('#030405', '#8E969E', L)} stroke={mixHex('#000', '#1C2024', L)} strokeWidth={8} />
                  <rect x={x + 30} y={460} width={w0 - 60} height={330} rx={18} fill={mixHex('#010202', '#2E3A36', 0.3 + 0.6 * neonOut)} />
                </g>
              );
            })}
          </g>
          <rect x={DOOR[0] - 30} y={370} width={DOOR[1] - DOOR[0] + 60} height={22} fill={mixHex('#000', '#3A4048', L)} />
          {/* la caisse : plafond, bandeau de pubs, parois */}
          <rect x={-300} y={-200} width={3000} height={500} fill={ceil} />
          {[0, 700, 1400, 2100].map((x) => (
            <g key={x}>
              <rect x={x + 40} y={226} width={560} height={34} rx={14} fill={L > 0.3 ? '#FFF6DA' : '#20221F'} />
              {L > 0.3 ? <rect x={x} y={180} width={640} height={130} rx={60} fill="#FFE6A8" opacity={0.3 * L} filter="url(#b24)" /> : null}
            </g>
          ))}
          <rect x={-300} y={300} width={3000} height={170} fill={wall} />
          {[[170, '#7A3A8C'], [480, '#2E7A60'], [930, '#C24E2A'], [1240, '#2A4E9A']].map(([x, c]) => (
            <g key={x as number}><rect x={x as number} y={330} width={260} height={110} rx={8} fill={mixHex('#000000', c as string, L * 0.8)} /><rect x={(x as number) + 20} y={350} width={150} height={16} fill={mixHex('#000', '#F4EEE0', L * 0.7)} /></g>
          ))}
          <path d={`M-300 300 L${WIN_A[0]} 300 L${WIN_A[0]} 990 L-300 990 Z M${WIN_A[1]} 300 L${WIN_B[0]} 300 L${WIN_B[0]} 990 L${WIN_A[1]} 990 Z M${WIN_B[1]} 300 L${DOOR[0]} 300 L${DOOR[0]} 990 L${WIN_B[1]} 990 Z M${DOOR[1]} 300 L2060 300 L2060 990 L${DOOR[1]} 990 Z`} fill={wall} />
          <rect x={-300} y={470} width={WIN_A[0] + 300} height={520} fill={wall} />
          {win(WIN_A[0], WIN_A[1], 'wa')}
          {win(WIN_B[0], WIN_B[1], 'wb')}
          {win(2060, 2560, 'wc')}
          <rect x={-300} y={990} width={DOOR[0] + 300} height={400} fill={mixHex('#020304', '#7C868B', L * 0.85)} />
          <rect x={DOOR[1]} y={990} width={900} height={400} fill={mixHex('#020304', '#7C868B', L * 0.85)} />
          <rect x={DOOR[0] - 70} y={392} width={70} height={1000} fill={wall} />
          <rect x={DOOR[1]} y={392} width={70} height={1000} fill={wall} />
          {/* barres de maintien */}
          {[860, 1590, 2030].map((x) => (
            <g key={x}>
              <rect x={x - 9} y={300} width={18} height={1090} rx={9} fill={mixHex('#000', '#C9CED3', L)} />
              <rect x={x - 3} y={300} width={5} height={1090} fill="#FFFFFF" opacity={0.35 * L} />
            </g>
          ))}
          {/* sièges en vis-à-vis */}
          {seat(240, true, 'sA1')}
          {seat(790, false, 'sA2')}
          {seat(930, true, 'sB1')}
          {seat(1500, false, 'sB2')}
          <rect x={-300} y={1380} width={3000} height={700} fill="url(#voFloor)" />
          {[360, 1070, 1390].map((x) => <ellipse key={x} cx={x + 60} cy={1392} rx={190} ry={22} fill="#000" opacity={0.35 * L} filter="url(#b8)" />)}
          {Array.from({length: 40}, (_, i) => <circle key={i} cx={-250 + i * 70 + 20 * rand(i)} cy={1420 + 140 * rand(i * 3)} r={4} fill={mixHex('#000', '#6E7378', L)} />)}
          {/* les passagers */}
          <Figure look={LOOKS.dame} p={{...SP.sleep, head: SP.sleep.head + 2 * Math.sin(T * 0.9)}} x={POS.dame[0]} y={POS.dame[1]} h={520} hipY={0} light={inLight} />
          <Figure look={LOOKS.imper} p={SP.read} x={POS.imper[0]} y={POS.imper[1]} h={560} hipY={0} flip paper light={inLight} />
          <Rider p={s.phone > 0.5 ? {...SP.phone, head: SP.phone.head + 1.5 * Math.sin(T * 1.6)} : {...SP.tense, torso: SP.tense.torso + 1.2 * Math.sin(T * 1.7)}} x={POS.you[0]} y={POS.you[1]} h={560} hipY={0} light={inLight} phone={s.phone} />
          {s.four > 0 ? (
            <g opacity={s.four}>
              <Figure look={LOOKS.usager} p={fourP} x={POS.four[0]} y={POS.four[1]} h={600} hipY={0} light={{amb: lerp(0.05, 0.6, L), tint: '#020403', rim: L < 0.35 ? '#5FAF9A' : undefined}} fingers={1} />
              {/* il goutte */}
              {[0, 1, 2].map((i) => {
                const ph = (T * 0.8 + i / 3) % 1;
                return <circle key={i} cx={POS.four[0] + 40 + i * 30} cy={1300 + ph * 90} r={5} fill="#8FB8B0" opacity={(1 - ph) * 0.7 * L} />;
              })}
            </g>
          ) : null}
          {/* dans le noir, quelque chose traverse la voiture (seul le liseré de l'écran le dessine) */}
          {s.walk && T >= s.walk[0] && T < s.walk[1] ? (() => {
            const k = prog(T, s.walk[0], s.walk[1], (q) => q), ph = Math.sin(k * Math.PI * 5);
            const wp: Pose = {...SP.standStill, torso: -6, head: 14, lL: 14 * ph, lLb: -8 * Math.max(0, -ph), lR: -14 * ph, lRb: -8 * Math.max(0, ph), aL: 6 - 8 * ph, aR: 10 + 8 * ph};
            return <Figure look={LOOKS.usager} p={wp} x={lerp(880, POS.four[0] + 40, k)} y={1395} h={590} flip light={{amb: 0.03, tint: '#000000', rim: '#4FA08E'}} fingers={1} />;
          })() : null}
          {(s.count ?? []).map((c) => {
            const p = [[POS.you[0] + 10, 840], [POS.dame[0] - 40, 850], [POS.imper[0] - 20, 820], [POS.four[0] + 60, 760]][c.who];
            return c.until !== undefined && T >= c.until ? null : label(p[0], p[1], String(c.who + 1), c.at, c.who === 3);
          })}
        </Cam>
      </g>
      {/* lumière de la voiture : plafonniers chauds, coins sombres */}
      <rect width={1080} height={1920} fill="url(#voLight)" opacity={L} />
      <defs>
        <radialGradient id="voLight" cx="0.5" cy="0.2" r="0.95"><stop offset="0" stopColor="#FFE6A8" stopOpacity={0.14} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#050608" stopOpacity={0.6} /></radialGradient>
      </defs>
      {/* lueur de l'écran quand tout est noir */}
      {L < 0.5 && s.phone > 0 ? <rect width={1080} height={1920} fill="url(#voPh)" opacity={(1 - L * 2) * 0.5} /> : null}
      <defs><radialGradient id="voPh" cx="0.45" cy="0.55" r="0.5"><stop offset="0" stopColor="#7FE3FF" stopOpacity={0.18} /><stop offset="1" stopColor="#000" stopOpacity={0} /></radialGradient></defs>
      <rect width={1080} height={1920} fill="#000" opacity={clamp01(0.85 - L * 1.4) * (s.phone > 0 ? 0.35 : 0.9)} />
    </svg>
  );
};

// ---------------- 5 · les portes ouvertes sur le quai (vue de l'intérieur) : la plaque, le haut-parleur, les traces mouillées ----------------
export const Portes: React.FC<SceneP & {open: [number, number]; speak?: [number, number][]; steps?: [number, number]; close?: [number, number]; hand?: number; tilt?: [number, number]; dark?: number}> = ({T, open, speak = [], steps, close, hand, tilt, dark = 0}) => {
  const frame = useCurrentFrame();
  const o = prog(T, open[0], open[1], easeOut) * (close ? 1 - 0.62 * prog(T, close[0], close[1], (q) => q) : 1);
  const n = flicker(T, 21, 0.14);
  const tl = tilt ? prog(T, tilt[0], tilt[1], easeInOut) : 0;
  const z = lerp(1.0, 1.08, prog(T, open[0], open[0] + 9, (q) => q));
  const sy = lerp(0, -260, tl);
  const talking = speak.some(([a, b]) => T >= a && T < b);
  const warn = close && T >= close[0] ? (Math.floor(T * 4) % 2 ? 1 : 0.15) : 0;
  // traces de pas mouillées : de la gauche du quai jusqu'au seuil, puis plus rien
  const PR: [number, number, number][] = [[60, 1290, 18], [190, 1330, 30], [290, 1395, 40], [400, 1440, 52], [470, 1510, 64], [540, 1560, 78]];
  const shown = steps ? Math.floor(lerp(0, PR.length + 0.99, prog(T, steps[0], steps[1], (q) => q))) : 0;
  const leafW = 400;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id="twShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity={0.6} /><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.45} /></linearGradient>
        <VGrad id="poFloor" stops={[[0, '#5D665F'], [1, '#2C322E']]} />
        <VGrad id="poCar" stops={[[0, '#3E4246'], [1, '#17191B']]} />
      </defs>
      <g transform={`translate(540,960) scale(${z}) translate(-540,${-960 + sy + 4 * Math.sin(T * 1.1)})`}>
        {/* le quai d'en face */}
        <TileWall x0={-200} x1={1280} y0={-100} y1={1250} lit={0.25 + 0.6 * n} />
        <NeonBar x0={250} x1={830} y={380} i={n} />
        <Plate x={540} y={800} w={640} lit={0.2 + 0.78 * n} />
        {/* haut-parleur à pavillon */}
        <g transform="translate(150,500)">
          <rect x={-10} y={-80} width={20} height={80} fill="#2A2E2C" />
          <path d="M-40 0 L40 0 L80 90 L-80 90 Z" fill={mixHex('#0A0C0B', '#6A726C', 0.3 + 0.6 * n)} stroke="#111" strokeWidth={4} />
          <ellipse cx={0} cy={90} rx={80} ry={18} fill="#0B0D0C" />
          {talking ? [0, 1, 2].map((i) => {
            const ph = (T * 1.6 + i / 3) % 1;
            return <path key={i} d={`M${-90 - ph * 140} ${120 + ph * 160} Q0 ${170 + ph * 260} ${90 + ph * 140} ${120 + ph * 160}`} stroke="#CFF2DC" strokeWidth={6} fill="none" opacity={(1 - ph) * 0.8} />;
          }) : null}
        </g>
        {/* sièges orange et affiche déchirée */}
        {[0, 1, 2].map((i) => <rect key={i} x={330 + i * 150} y={1110} width={130} height={56} rx={14} fill={mixHex('#0A0503', '#E07A35', 0.3 + 0.6 * n)} />)}
        {[0, 1, 2].map((i) => <rect key={`b${i}`} x={330 + i * 150} y={1020} width={130} height={90} rx={14} fill={mixHex('#0A0503', '#C9662A', 0.3 + 0.6 * n)} />)}
        <rect x={880} y={820} width={300} height={380} fill={mixHex('#070807', '#B9B2A2', 0.25 + 0.5 * n)} />
        <path d="M880 820 L1180 820 L1180 960 L1020 1010 L940 930 L880 990 Z" fill={mixHex('#070807', '#7A2E2A', 0.25 + 0.5 * n)} />
        {/* le sol du quai, la bande du bord */}
        <rect x={-200} y={1250} width={1480} height={350} fill="url(#poFloor)" opacity={0.35 + 0.6 * n} />
        <rect x={-200} y={1250} width={1480} height={350} fill="#000" opacity={0.6 * (1 - n)} />
        <rect x={-200} y={1556} width={1480} height={40} fill={mixHex('#121412', '#E6E3D6', 0.3 + 0.6 * n)} />
        {PR.slice(0, shown).map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x + (i % 2 ? 28 : -28)},${y}) rotate(${12 - i * 4})`}>
            <ellipse rx={s * 0.62} ry={s * 1.25} fill="#BFF5E4" opacity={0.18 + 0.2 * n} filter="url(#b8)" />
            <ellipse rx={s * 0.46} ry={s * 1.05} fill="#050B0A" opacity={0.85} />
            <ellipse cy={s * 0.75} rx={s * 0.34} ry={s * 0.34} fill="#050B0A" opacity={0.85} />
            <ellipse rx={s * 0.32} ry={s * 0.8} fill="#7FB0A6" opacity={0.45 + 0.3 * n} />
            <ellipse cx={-s * 0.12} cy={-s * 0.35} rx={s * 0.1} ry={s * 0.26} fill="#F0FFFA" opacity={0.5 + 0.45 * n} />
          </g>
        ))}
        {/* l'espace entre le quai et la rame, puis le seuil et le sol de la voiture */}
        <rect x={-200} y={1596} width={1480} height={44} fill="#000" />
        <rect x={-200} y={1640} width={1480} height={34} fill="#9CA3A8" />
        <rect x={-200} y={1674} width={1480} height={500} fill="url(#poCar)" />
        {Array.from({length: 24}, (_, i) => <circle key={i} cx={-150 + (i % 12) * 120 + (i > 11 ? 60 : 0)} cy={1720 + (i > 11 ? 90 : 0)} r={9} fill="#4A4F54" />)}
        {/* tes baskets, au bord */}
        {[400, 640].map((x, i) => (
          <g key={x} transform={`translate(${x},${lerp(1800, 1880, tl)})`}>
            <ellipse rx={92} ry={46} fill="#F1EEE6" stroke="#1E1C1B" strokeWidth={6} />
            <rect x={-92} y={22} width={184} height={20} rx={10} fill="#C9C3B8" />
            <rect x={-40} y={-56} width={80} height={60} rx={20} fill="#25272F" />
            <path d={`M${-50} ${-10} L${50} ${-10}`} stroke="#9AA0A6" strokeWidth={6} opacity={i ? 1 : 0.8} />
          </g>
        ))}
        {/* les vantaux et l'encadrement */}
        <rect x={-200} y={-200} width={lerp(540, 150, o) + 200} height={2400} fill="#141719" />
        <rect x={lerp(540, 930, o)} y={-200} width={600} height={2400} fill="#141719" />
        {[0, 1].map((side) => {
          const x = side ? lerp(540, 930, o) : lerp(540, 150, o) - leafW;
          return (
            <g key={side}>
              <rect x={x} y={-100} width={leafW} height={1740} fill="#8E969E" stroke="#1C2024" strokeWidth={10} />
              <rect x={x + 60} y={60} width={leafW - 120} height={560} rx={30} fill="#16211D" opacity={0.92} />
              <rect x={side ? x : x + leafW - 26} y={-100} width={26} height={1740} fill="#0B0C0D" />
            </g>
          );
        })}
        <rect x={-200} y={-200} width={1480} height={360} fill="#1B1E21" />
        <rect x={400} y={118} width={280} height={40} rx={20} fill={warn > 0.5 ? '#FF3A2A' : '#3A1410'} />
        {warn > 0.5 ? <rect x={340} y={60} width={400} height={160} rx={80} fill="#FF3A2A" opacity={0.55} filter="url(#b24)" /> : null}
        {/* la main du quatrième, sur la barre, juste derrière toi */}
        {hand !== undefined && T >= hand ? (
          <g transform={`translate(${lerp(60, 0, prog(T, hand, hand + 0.8, easeOut))},0)`} opacity={prog(T, hand, hand + 0.5, easeOut)}>
            <rect x={872} y={-200} width={30} height={2400} fill="#B9BEC2" />
            <rect x={878} y={-200} width={7} height={2400} fill="#FFFFFF" opacity={0.4} />
            <path d="M1180 560 L975 650 L960 790 L1180 760 Z" fill="#1A221E" stroke="#070908" strokeWidth={6} />
            <ellipse cx={952} cy={712} rx={44} ry={62} fill="#AAB4AA" stroke="#070908" strokeWidth={6} />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M930 ${668 + i * 30} Q850 ${652 + i * 32} 858 ${712 + i * 34} Q866 ${742 + i * 34} 900 ${744 + i * 32}`} stroke="#070908" strokeWidth={21} fill="none" strokeLinecap="round" />)}
            {[0, 1, 2, 3].map((i) => <path key={`f${i}`} d={`M930 ${668 + i * 30} Q850 ${652 + i * 32} 858 ${712 + i * 34} Q866 ${742 + i * 34} 900 ${744 + i * 32}`} stroke="#AAB4AA" strokeWidth={13} fill="none" strokeLinecap="round" />)}
          </g>
        ) : null}
      </g>
      <rect width={1080} height={1920} fill={`rgba(255,40,30,${0.08 * warn})`} />
      <rect width={1080} height={1920} fill="#000" opacity={0.15 + 0.5 * (1 - n) * 0.4 + dark} />
      <rect width={1080} height={1920} fill="#000" opacity={0.3 * (1 - sp(frame, open[0], {damping: 20}))} />
    </svg>
  );
};

// ---------------- 6 · dans la vitre : tu baisses les yeux, et quelqu'un approche sur le quai ----------------
export const Reflet: React.FC<SceneP & {t0: number; jumps: [number, number][]}> = ({T, t0, jumps}) => {
  // la silhouette avance par bonds, pendant les coupures du néon
  let z = 26;
  jumps.forEach(([at, zz]) => { if (T >= at) z = zz; });
  const offK = jumps.some(([at]) => T >= at - 0.12 && T < at + 0.05) ? 0.05 : 1;
  const neon = (k: number) => offK * (k <= 1 ? 0.35 * flicker(T, 40 + k, 0.08) : k === 2 ? 0.6 : k === 3 ? 0.75 : 0.4);
  const v: View = {cx: -3.1, cy: 0.05, cz: 0, F: 620, VX: 330 + 8 * Math.sin(T * 0.7), VY: 640};
  const push = prog(T, t0, t0 + 8, (q) => q);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <clipPath id="rfWin"><rect x={80} y={280} width={920} height={820} rx={70} /></clipPath>
        <VGrad id="rfWall" stops={[[0, '#2A2E2C'], [1, '#121413']]} />
        <linearGradient id="rfGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.1} /><stop offset="0.4" stopColor="#FFFFFF" stopOpacity={0} /><stop offset="0.62" stopColor="#FFFFFF" stopOpacity={0.06} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} /></linearGradient>
      </defs>
      <g transform={`translate(540,900) scale(${lerp(1, 1.07, push)}) translate(-540,-900)`}>
        <rect width={1080} height={1920} fill="url(#rfWall)" />
        <g clipPath="url(#rfWin)">
          <g transform="translate(80,280)">
            <Station v={v} o={{T, neon, sil: {z, x: lerp(0.4, -1.0, clamp01((26 - z) / 23)), tilt: 0, lit: z < 10 ? 0.55 : 0}}} />
          </g>
          {/* ton reflet dans la vitre, en miroir */}
          <g opacity={0.13} transform="translate(1080,0) scale(-1,1)">
            <Rider p={SP.phone} x={420} y={1300} h={760} hipY={0} light={{amb: 0.6, tint: '#0A1A20'}} phone={1} />
          </g>
          <rect x={80} y={280} width={920} height={820} fill="url(#rfGlass)" />
        </g>
        <rect x={80} y={280} width={920} height={820} rx={70} fill="none" stroke="#0B0C0C" strokeWidth={26} />
        <rect x={80} y={280} width={920} height={820} rx={70} fill="none" stroke="#5E666B" strokeWidth={8} />
        <rect x={0} y={1100} width={1080} height={820} fill="#1C2022" />
        {/* toi, au premier plan, la tête sur le téléphone */}
        <Rider p={{...SP.phone, head: SP.phone.head + 2 * Math.sin(T * 1.4), torso: SP.phone.torso + 1 * Math.sin(T * 1.7)}} x={300} y={1830} h={900} hipY={0} light={{amb: 0.55, tint: '#08141A', rim: '#7FE3FF'}} phone={1} />
      </g>
      <rect width={1080} height={1920} fill="#000" opacity={0.85 * (1 - offK)} />
    </svg>
  );
};

// ---------------- 7 · l'interphone de la voiture : « Ici le conducteur ! » ----------------
export const Interphone: React.FC<SceneP & {t0: number; talk: [number, number]; shout: number}> = ({T, t0, talk, shout}) => {
  const frame = useCurrentFrame();
  const on = T >= talk[0] && T < talk[1];
  const led = on ? (Math.floor(T * 7) % 2 ? 1 : 0.3) : 0.2;
  const sh = on ? (T >= shout ? 1 : 0.4) : 0;
  const jx = sh * (rand(frame * 1.9) - 0.5) * 10, jy = sh * (rand(frame * 2.7) - 0.5) * 8;
  const z = lerp(1.0, 1.18, prog(T, t0, talk[1] + 0.5, (q) => q));
  const holes: React.ReactNode[] = [];
  for (let y = -190; y <= 190; y += 34) for (let x = -190; x <= 190; x += 34) if (x * x + y * y < 190 * 190) holes.push(<circle key={`${x},${y}`} cx={540 + x} cy={725 + y} r={10} fill="#0B0C0D" />);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id="ipSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C9CED2" /><stop offset="0.5" stopColor="#8D949A" /><stop offset="1" stopColor="#5A6066" /></linearGradient>
        <VGrad id="ipWall" stops={[[0, '#6E777C'], [1, '#2E3438']]} />
      </defs>
      <g transform={`translate(${540 + jx},${960 + jy}) scale(${z}) translate(-540,-960)`}>
        <rect width={1080} height={1920} fill="url(#ipWall)" />
        <rect x={190} y={380} width={700} height={1180} rx={36} fill="#22272B" />
        <rect x={200} y={390} width={680} height={1160} rx={30} fill="url(#ipSteel)" />
        {Array.from({length: 33}, (_, i) => <rect key={i} x={200} y={392 + i * 34.5} width={680} height={2} fill="#FFFFFF" opacity={0.06} />)}
        {[[240, 430], [840, 430], [240, 1510], [840, 1510]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={14} fill="#4A5056" stroke="#2A2E32" strokeWidth={4} />)}
        <rect x={350} y={418} width={380} height={56} rx={10} fill="#1A1E22" />
        <text x={540} y={458} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={32} letterSpacing="7" fill="#E9E6DD">INTERPHONE</text>
        <circle cx={540} cy={725} r={215} fill="#3A4046" stroke="#22272B" strokeWidth={10} />
        {holes}
        {on ? [0, 1, 2].map((i) => {
          const ph = (T * 2.2 + i / 3) % 1;
          return <circle key={i} cx={540} cy={725} r={230 + ph * 260} fill="none" stroke="#FF6A50" strokeWidth={8} opacity={(1 - ph) * 0.65 * (0.6 + 0.4 * sh)} />;
        }) : null}
        <circle cx={540} cy={975} r={22} fill={led > 0.5 ? '#FF3A2A' : '#4A1612'} />
        {led > 0.5 ? <circle cx={540} cy={975} r={70} fill="#FF3A2A" opacity={0.6} filter="url(#b14)" /> : null}
        <circle cx={540} cy={1395} r={70} fill="#2A0E0C" />
        <circle cx={540} cy={1395} r={58} fill="#C8261C" stroke="#7A120C" strokeWidth={6} />
        <text x={540} y={1406} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={28} fill="#FFF0EC">APPEL</text>
        <text x={540} y={1050} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={26} letterSpacing="6" fill="#2A2E32">CONDUCTEUR · VOITURE 5</text>
      </g>
      <rect width={1080} height={1920} fill="url(#ipVig)" />
      <defs><radialGradient id="ipVig" cx="0.5" cy="0.45" r="0.7"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.7} /></radialGradient></defs>
    </svg>
  );
};

// ---------------- fond de la carte de fin : le néon qui grésille, la silhouette qui attend ----------------
export const TFinFond: React.FC<SceneP> = ({T}) => {
  const n = flicker(T, 77, 0.3);
  const v: View = {cx: 0.9, cy: 0, cz: 6, F: 820, VX: 540, VY: 1300};
  const neon = (k: number) => (k === 3 ? n : 0);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <g opacity={0.75}>
        <Station v={v} o={{T, neon, train: false, sil: {z: 21.5, x: 2.05, tilt: 34}, amb: 0}} />
      </g>
      <rect width={1080} height={1150} fill="#000" />
      <rect y={1100} width={1080} height={200} fill="url(#tfFade)" />
      <defs><VGrad id="tfFade" stops={[[0, '#000'], [1, 'rgba(0,0,0,0)']]} /></defs>
    </svg>
  );
};

// ---------------- inventaire (haut droite) : batterie, réseau, passagers ----------------
const curve = (t: number, keys: [number, number][]) => {
  let i = 0;
  while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  return keys[i][1];
};
const TIcon: React.FC<{kind: 'batt' | 'net' | 'pax'; level?: number}> = ({kind, level = 1}) => (
  <svg width={42} height={42} viewBox="0 0 34 34">
    {kind === 'batt' ? (
      <g><rect x={3} y={9} width={26} height={16} rx={3} fill="none" stroke="#E8E8E8" strokeWidth={2.5} /><rect x={29} y={14} width={3} height={6} rx={1} fill="#E8E8E8" /><rect x={6} y={12} width={Math.max(1.5, 20 * level)} height={10} rx={1.5} fill={level > 0.5 ? '#74F574' : level > 0.2 ? '#F2A23C' : '#FF4E42'} /></g>
    ) : null}
    {kind === 'net' ? (
      <g>{[0, 1, 2, 3].map((i) => <rect key={i} x={4 + i * 7} y={24 - i * 5} width={5} height={6 + i * 5} rx={1} fill="#5A5A5A" />)}<path d="M20 4 L30 14 M30 4 L20 14" stroke="#FF4E42" strokeWidth={3.2} strokeLinecap="round" /></g>
    ) : null}
    {kind === 'pax' ? (
      <g><circle cx={17} cy={10} r={6} fill="#E8E8E8" /><path d="M6 31 Q6 18 17 18 Q28 18 28 31 Z" fill="#E8E8E8" /></g>
    ) : null}
  </svg>
);
export const TInventory: React.FC<{t0: number; t1: number; batt: [number, number][]; net: number; pax: [number, number][]; hot?: [number, 'batt' | 'net' | 'pax'][]}> = ({t0, t1, batt, net, pax, hot = []}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < t0 - 0.02 || t > t1 + 0.4) return null;
  const a = prog(t, t0, t0 + 0.4, easeOut) * (1 - prog(t, t1, t1 + 0.35));
  const bt = curve(t, batt), px = curve(t, pax);
  const isHot = (k: 'batt' | 'net' | 'pax') => hot.some(([at, kk]) => kk === k && t >= at && t < at + 0.9);
  const four = px >= 4;
  const rows: [React.ReactNode, string, string, 'batt' | 'net' | 'pax', number][] = [
    [<TIcon key="b" kind="batt" level={bt / 100} />, 'BATTERIE', `${bt} %`, 'batt', 0],
    [<TIcon key="n" kind="net" />, 'RÉSEAU', 'AUCUN', 'net', net],
    [<TIcon key="p" kind="pax" />, 'PASSAGERS', String(px), 'pax', 0],
  ];
  return (
    <div style={{position: 'absolute', right: 68, top: 262, opacity: a, transform: `translateX(${(1 - a) * 40}px)`, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.75))'}}>
      {rows.map(([ic, lab, val, k, from]) => {
        if (t < from) return null;
        const h = isHot(k);
        const red = k === 'pax' && four;
        const pop = k === 'pax' && four ? 1 + 0.25 * (1 - clamp01((t - (pax.find(([, v]) => v >= 4)?.[0] ?? 0)) / 0.5)) : 1;
        return (
          <div key={k} style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${(h ? 1.08 : 1) * pop})`, transformOrigin: '100% 50%', opacity: prog(t, from, from + 0.25, easeOut)}}>
            <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(235,235,235,0.7)'}}>{lab}</div>
            <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 40, color: red ? SV.neon : h ? SV.lime : SV.white, minWidth: 116, textAlign: 'right', textShadow: red ? '0 0 16px rgba(255,78,66,0.85)' : h ? '0 0 14px rgba(210,248,74,0.7)' : undefined}}>{val}</div>
            {ic}
          </div>
        );
      })}
    </div>
  );
};

/** « IMAGINE… » dès l'image 0 (la voix démarre 0,2 s plus tard), dans le style exact des sous-titres karaoké */
export const FirstCap: React.FC<{text: string; until: number}> = ({text, until}) => {
  const t = useCurrentFrame() / FPS;
  if (t >= until) return null;
  const size = 78;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1220 - size * 0.62, textAlign: 'center', pointerEvents: 'none'}}>
      <span style={{fontFamily: SF.cap, fontWeight: 900, fontSize: size, color: SV.lime, WebkitTextStroke: `${size * 0.15}px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: '0 5px 14px rgba(0,0,0,0.55)'}}>{text}</span>
    </div>
  );
};
