// Animations sur mesure de la vidéo 42 (Héraclite et la bouse, d'après Diogène Laërce IX, 3-4), style étable (planches, paille).
// Bouse : le portrait d'Héraclite (Moreelse, couleur) et un tas de bouse gravé en code (mottes à contour tremblé, hachures,
//   brins de paille, reflets humides) qui monte jusqu'à sa barbe. Mouches qui tournent, vapeur qui monte.
//   mode 'hook' : tas complet, `splats` = instants où une motte de plus s'écrase (secousse, éclaboussures, les mouches fuient) ;
//   mode 'cover' : les mottes tombent une à une entre cover[0] et cover[1] ; heat = instant où la chaleur monte (vapeur
//   plus forte, gouttes d'eau aspirées hors du tas) ; mode 'dry' : la bouse pâlit et se craquelle (crack = instant).
// Gonfle : la gravure d'Héraclite qui pleure se remplit d'eau gravée (hachures horizontales, vague, bulles) et gonfle.
// Enigme : fiche « LA PLUIE → LA SÉCHERESSE ? », pluie hachurée puis soleil gravé ; at = la 2e ligne s'écrit.
// Osselets : 5 osselets (astragales) gravés lancés en arc, qui retombent devant les enfants ; at = le lancer.
// Recherche : barre de recherche gravée, la requête se tape (« ventre gonflé d'eau que faire »), 3 résultats.
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs, Shade} from './ink';
import {nums, Order, Paper, RED, src} from './tests';

const INK = '#1A1108';
const SHADOW = 'drop-shadow(0 22px 34px rgba(0,0,0,0.75))';

/** contour d'une motte : cercle bosselé (bruit déterministe), aplati en bas */
const lump = (cx: number, cy: number, rx: number, ry: number, seed: number, n = 22) => {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 1 + 0.16 * (rand(seed * 13.1 + i * 3.7) - 0.5) * 2 + 0.07 * Math.sin(a * 3 + seed);
    const y = Math.sin(a) > 0 ? Math.sin(a) * 0.8 : Math.sin(a);
    pts.push(`${(cx + rx * r * Math.cos(a)).toFixed(1)} ${(cy + ry * r * y).toFixed(1)}`);
  }
  return `M ${pts.join(' L ')} Z`;
};

// le tas : un monticule de mottes irrégulières (x, y, rx, ry) en px écran, du bas vers le haut ; il monte jusqu'à la barbe
const CARD = {w: 820, x: 540, y: 840}; // carte « heraclite » (778×759)
const CH = Math.round((CARD.w * 759) / 778);
const LUMPS: [number, number, number, number][] = [];
for (let row = 0; row < 5; row++) {
  const y = 1300 - row * 86;
  const half = 480 - row * 70;
  const n = [6, 5, 5, 4, 3][row];
  for (let k = 0; k < n; k++) {
    const j = rand(row * 7.3 + k * 1.9);
    const x = 540 - half + ((k + 0.5) / n) * half * 2 + (j - 0.5) * 70 - row * 12;
    LUMPS.push([x, y + (rand(row * 3.1 + k * 5.7) - 0.5) * 40, half / n + 30 + j * 46, 54 + rand(row + k * 2.3) * 30]);
  }
}
// motte finale sous la barbe (celle des `splats` du hook)
const TOP: [number, number, number, number] = [480, 940, 140, 62];

/** une motte : dégradé (lumière en haut à gauche), hachures gravées, pli intérieur, contour d'encre tremblé */
const Lump: React.FC<{d: string; i: number; dry: number; L: [number, number, number, number]}> = ({d, i, dry, L}) => {
  const c = (a: number[], b: number[]) => `rgb(${a.map((v, k) => Math.round(lerp(v, b[k], dry))).join(',')})`;
  const crease = `M ${L[0] - L[2] * 0.55} ${L[1] - L[3] * 0.05} C ${L[0] - L[2] * 0.2} ${L[1] + L[3] * 0.25}, ${L[0] + L[2] * 0.2} ${L[1] - L[3] * 0.25}, ${L[0] + L[2] * 0.5} ${L[1] + L[3] * 0.1}`;
  return (
    <g>
      <defs>
        <radialGradient id={`hb-r${i}`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={c([104, 74, 34], [206, 192, 160])} />
          <stop offset="0.55" stopColor={c([62, 42, 18], [170, 152, 120])} />
          <stop offset="1" stopColor={c([26, 16, 6], [110, 96, 74])} />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#hb-r${i})`} />
      <Shade p="hb" id={`l${i}`} d={d} box={[L[0] - L[2], L[1] - L[3], L[2] * 2, L[3] * 2]} from={[0.8, 1]} to={[0.3, 0.2]} hatch={i % 2 ? 'hm' : 'hd'} cross={i % 3 === 0} o={lerp(0.7, 0.65, dry)} />
      <path d={crease} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.7} strokeLinecap="round" />
      <path d={d} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" filter="url(#hb-wob)" />
    </g>
  );
};

/** brins de paille piqués dans le tas */
const Straw: React.FC<{n: number; dry: number}> = ({n, dry}) => (
  <g stroke={`rgb(${Math.round(lerp(214, 230, dry))}, ${Math.round(lerp(170, 205, dry))}, 80)`} strokeWidth={4} strokeLinecap="round" opacity={0.9}>
    {Array.from({length: n}, (_, i) => {
      const L = LUMPS[i % LUMPS.length];
      const x = L[0] + (rand(i * 5.3) - 0.5) * L[2], y = L[1] - L[3] * 0.4 + (rand(i * 2.1) - 0.5) * 30, a = (rand(i * 8.7) - 0.5) * 2.2, l = 30 + rand(i * 4.4) * 34;
      return <line key={i} x1={x} y1={y} x2={x + Math.sin(a) * l} y2={y - Math.cos(a) * l} />;
    })}
  </g>
);

/** éclaboussures d'une motte qui s'écrase à `at` */
const Splash: React.FC<{t: number; at: number; x: number; y: number; seed: number}> = ({t, at, x, y, seed}) => {
  const u = t - at;
  if (u < 0 || u > 0.6) return null;
  return (
    <g fill="#4A3014" stroke={INK} strokeWidth={2}>
      {Array.from({length: 9}, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * rand(seed + i * 1.3)), v = 600 + 500 * rand(seed + i * 2.9);
        const px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u + 1800 * u * u;
        const r = (5 + 9 * rand(seed + i * 4.1)) * (1 - u / 0.6);
        return <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 0.8} />;
      })}
    </g>
  );
};

/** une mouche gravée qui tourne autour du point (cx, cy) */
const Fly: React.FC<{t: number; i: number; cx: number; cy: number; flee: number}> = ({t, i, cx, cy, flee}) => {
  const w = 2.2 + i * 0.7, ph = i * 2.1;
  const x = cx + Math.cos(t * w + ph) * (120 + 40 * i) + Math.sin(t * w * 2.3 + i) * 30 + flee * (i % 2 ? 1 : -1) * 500;
  const y = cy + Math.sin(t * w * 1.3 + ph) * (60 + 20 * i) - flee * 400;
  const flap = Math.sin(t * 90 + i) > 0 ? 1 : 0.4;
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={-5} cy={-7} rx={9 * flap} ry={5} fill="rgba(230,230,240,0.55)" stroke={INK} strokeWidth={1.5} transform="rotate(-30)" />
      <ellipse cx={5} cy={-7} rx={9 * flap} ry={5} fill="rgba(230,230,240,0.55)" stroke={INK} strokeWidth={1.5} transform="rotate(30)" />
      <ellipse cx={0} cy={0} rx={7} ry={5} fill="#120C06" />
    </g>
  );
};

/** volutes de vapeur qui montent du tas (force k) */
const Steam: React.FC<{t: number; k: number}> = ({t, k}) =>
  k <= 0 ? null : (
    <g fill="none" stroke="rgba(245,240,228,0.55)" strokeLinecap="round">
      {Array.from({length: 7}, (_, i) => {
        const x0 = 230 + i * 100 + (rand(i) - 0.5) * 40;
        const cyc = (t * 0.55 + rand(i * 3.3)) % 1;
        const y0 = 1000 - cyc * 420;
        let d = `M ${x0} ${y0 + 160}`;
        for (let s = 1; s <= 8; s++) d += ` L ${(x0 + Math.sin(s * 0.9 + t * 2 + i) * 22 * (1 + s / 4)).toFixed(1)} ${(y0 + 160 - s * 26).toFixed(1)}`;
        return <path key={i} d={d} strokeWidth={10 - cyc * 6} opacity={k * Math.sin(cyc * Math.PI) * 0.9} />;
      })}
    </g>
  );

/** gouttes d'eau aspirées hors du tas par la chaleur (à partir de `at`) */
const Drops: React.FC<{t: number; at: number; until: number}> = ({t, at, until}) => {
  if (t < at || t > until + 0.6) return null;
  return (
    <g>
      {Array.from({length: 12}, (_, i) => {
        const st = at + i * 0.13, u = t - st;
        if (u < 0 || u > 1.1) return null;
        const x = 260 + rand(i * 7.7) * 560 + Math.sin(u * 6 + i) * 14, y = 1060 - u * 520;
        const o = Math.sin(clamp01(u / 1.1) * Math.PI);
        return <path key={i} d={`M ${x} ${y - 22} C ${x + 12} ${y - 4}, ${x + 12} ${y + 10}, ${x} ${y + 10} C ${x - 12} ${y + 10}, ${x - 12} ${y - 4}, ${x} ${y - 22} Z`} fill={`rgba(120,190,255,${0.85 * o})`} stroke={`rgba(10,30,60,${o})`} strokeWidth={2.5} />;
      })}
    </g>
  );
};

/** fissures de la bouse séchée (k : avancement du tracé) */
const CRACKS = Array.from({length: 15}, (_, i) => {
  const L = LUMPS[(i * 5) % LUMPS.length];
  let x = L[0] - L[2] * 0.6, y = L[1] + (rand(i) - 0.5) * 20;
  let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
  for (let s = 0; s < 6; s++) { x += L[2] * 0.22; y += (rand(i * 11 + s) - 0.5) * 34; d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`; }
  return d;
});

export const Bouse: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const mode = String(p.mode ?? 'hook');
  const cover = nums(p, 'cover');
  const splats = nums(p, 'splats');
  const heat = Number(p.heat ?? 1e9), crack = Number(p.crack ?? 1e9);
  const dry = mode === 'dry' ? prog(t, crack - 0.2, crack + 0.6, easeOut) : 0;
  const N = LUMPS.length;
  const covering = mode === 'cover' && cover.length === 2;
  // instant d'arrivée de chaque motte (mode cover) ; sinon déjà posées
  const land = (i: number) => (covering ? lerp(cover[0], cover[1], i / N) : -1e9);
  const lastSplat = splats.filter((s) => s <= t).pop() ?? -1e9;
  const topLand = covering ? cover[1] + 0.05 : lastSplat;
  const flee = Math.max(0, ...splats.map((s) => (t >= s ? Math.sin(Math.PI * clamp01((t - s) / 0.9)) : 0)));
  const steamK = (covering ? prog(t, cover[1], cover[1] + 0.6) * 0.5 : mode === 'dry' ? 0.25 * (1 - dry) : 0.55) + (t >= heat ? 0.6 * prog(t, heat, heat + 0.4) : 0);
  const quake = Math.max(0, ...splats.map((s) => (t >= s && t < s + 0.3 ? 1 - (t - s) / 0.3 : 0)), ...(covering ? LUMPS.map((_, i) => (t >= land(i) && t < land(i) + 0.15 ? 0.4 * (1 - (t - land(i)) / 0.15) : 0)) : [0]));
  const breathe = 1 + 0.006 * Math.sin(lt * 2.4);
  // coups de zoom vers le visage à chaque motte du hook (comme des jump-cuts) : ×1,22 puis ×1,4
  let zoom = 1;
  splats.forEach((s, j) => { if (t >= s) zoom = lerp(zoom, [1.16, 1.3, 1.4][Math.min(j, 2)], prog(t, s, s + 0.12, easeOut)); });
  // une motte lancée d'un côté, en arc bas et rapide (0,24 s), qui s'écrase avec un rebond amorti
  const lumpAt = (L: [number, number, number, number], i: number, at: number) => {
    const u = t - at;
    if (u < -0.24) return null;
    const fl = u < 0 ? clamp01((u + 0.24) / 0.24) : 1;
    const side = L[0] < 540 ? -1 : 1;
    const x = lerp(540 + side * 760, L[0], fl), y = lerp(L[1] + 160, L[1], fl) - Math.sin(fl * Math.PI) * 110;
    const squash = u >= 0 ? 1 - 0.4 * Math.exp(-u * 14) * Math.cos(u * 30) : 1;
    return (
      <g key={i} transform={`translate(${x - L[0]} ${y - L[1] + L[3] * (1 - squash) * 0.5}) translate(${L[0]} ${L[1]}) scale(${2 - squash} ${squash}) rotate(${(1 - fl) * side * 40}) translate(${-L[0]} ${-L[1]})`}>
        <Lump d={lump(L[0], L[1], L[2], L[3], i + 1)} i={i} dry={dry} L={L} />
      </g>
    );
  };
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '500px 470px', transform: `scale(${zoom})`}}>
      {/* lumière chaude d'étable derrière le sujet */}
      <div style={{position: 'absolute', left: 540 - 560, top: 320, width: 1120, height: 1100, background: `radial-gradient(ellipse at 50% 45%, rgba(${G.goldRgb},0.3), rgba(0,0,0,0) 62%)`}} />
      <div style={{position: 'absolute', left: CARD.x - CARD.w / 2, top: CARD.y - CH / 2, width: CARD.w, height: CH, filter: SHADOW, transform: `translate(${quake * Math.sin(t * 90) * 8}px, ${quake * 6}px) scale(${breathe})`, transformOrigin: '50% 70%'}}>
        <Img src={src(id, 'heraclite')} style={{width: CARD.w, height: CH}} />
        {/* ombre portée du tas sur le tableau */}
        <div style={{position: 'absolute', left: 0, right: 0, top: CH * 0.5, height: CH * 0.5, background: 'linear-gradient(180deg, rgba(20,12,4,0) 0%, rgba(20,12,4,0.55) 55%, rgba(20,12,4,0.8) 100%)', opacity: covering ? prog(t, cover[0], cover[1]) : 1}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <InkDefs p="hb" />
        <defs>
          {/* relief de la matière : bruit → éclairage diffus (lumière en haut à gauche) multiplié, reflets humides spéculaires */}
          <filter id="hb-mat" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse">
            <feTurbulence type="fractalNoise" baseFrequency="0.055" numOctaves="4" seed="8" result="n" />
            <feDiffuseLighting in="n" surfaceScale={3.5 + 3 * dry} diffuseConstant="1" lightingColor="#fff" result="d"><feDistantLight azimuth="235" elevation="48" /></feDiffuseLighting>
            <feComposite in="d" in2="SourceGraphic" operator="arithmetic" k1="1.1" k2="0" k3="0" k4="0" result="lit" />
            <feSpecularLighting in="n" surfaceScale="5" specularConstant={0.45 * (1 - dry) + 0.01} specularExponent="34" lightingColor="#FFE9C0" result="sp"><feDistantLight azimuth="235" elevation="52" /></feSpecularLighting>
            <feComposite in="sp" in2="SourceAlpha" operator="in" result="sp2" />
            <feComposite in="sp2" in2="lit" operator="arithmetic" k1="0" k2="0.4" k3="1" k4="0" result="all" />
            <feComposite in="all" in2="SourceAlpha" operator="in" />
          </filter>
        </defs>
        {/* ombre de contact du tas */}
        <ellipse cx={540} cy={1338} rx={520} ry={34} fill="rgba(0,0,0,0.6)" />
        <g filter="url(#hb-mat)">
          {LUMPS.map((L, i) => lumpAt(L, i, land(i)))}
          {topLand > -1e8 ? lumpAt(TOP, N, topLand) : <Lump d={lump(TOP[0], TOP[1], TOP[2], TOP[3], N + 1)} i={N} dry={dry} L={TOP} />}
        </g>
        <Straw n={covering ? Math.round(18 * prog(t, cover[0], cover[1])) : 18} dry={dry} />
        {dry > 0 ? CRACKS.map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog(t, crack + i * 0.05, crack + 0.4 + i * 0.05, easeOut)} />) : null}
        {splats.map((s, i) => <Splash key={i} t={t} at={s} x={TOP[0]} y={TOP[1] - 30} seed={i * 17 + 3} />)}
        {covering ? LUMPS.map((L, i) => (i % 3 === 0 ? <Splash key={`s${i}`} t={t} at={land(i)} x={L[0]} y={L[1] - L[3]} seed={i * 5 + 1} /> : null)) : null}
        <Steam t={t} k={steamK} />
        <Drops t={t} at={heat} until={heat + 1.6} />
        {mode !== 'dry' ? [0, 1, 2].map((i) => <Fly key={i} t={t} i={i} cx={520} cy={780} flee={flee} />) : null}
      </svg>
      </div>
      {mode === 'dry' ? <Order text="SÉCHÉE" k={prog(t, crack + 0.3, crack + 0.55, easeOut)} y={330} size={84} color={G.goldHi} /> : null}
      {p.order ? <Order text={String(p.order)} k={prog(lt, 0.05, 0.3, easeOut)} y={318} size={52} color={G.goldHi} /> : null}
    </>
  );
};

// --- Gonfle : la gravure qui se remplit d'eau ---
const PW = 680, PH = Math.round((680 * 859) / 658);
export const Gonfle: React.FC<AnimProps> = ({id, lt, t1, t0}) => {
  const k = prog(lt, 0.15, Math.max(0.8, t1 - t0 - 0.2), (x) => x * x * (3 - 2 * x));
  const level = PH * (1 - 0.78 * k);
  const sw = 1 + 0.07 * k;
  const wave = (ph: number) => {
    let d = `M -20 ${level}`;
    for (let x = -20; x <= PW + 20; x += 20) d += ` L ${x} ${(level + Math.sin(x / 38 + lt * 5 + ph) * 9).toFixed(1)}`;
    return d;
  };
  return (
    <>
      <div style={{position: 'absolute', left: 540 - PW / 2, top: 820 - PH / 2, width: PW, height: PH, filter: SHADOW, transform: `scale(${sw}, ${1 + 0.02 * k})`}}>
        <Img src={src(id, 'pleure')} style={{width: PW, height: PH}} />
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}} width={PW} height={PH}>
          <defs>
            <pattern id="gw-h" width={9} height={9} patternUnits="userSpaceOnUse"><line x1={0} y1={0} x2={9} y2={0} stroke="rgba(10,40,90,0.7)" strokeWidth={1.6} /></pattern>
          </defs>
          <path d={`${wave(0)} L ${PW + 20} ${PH + 20} L -20 ${PH + 20} Z`} fill="rgba(60,140,230,0.42)" style={{mixBlendMode: 'multiply'}} />
          <path d={`${wave(0)} L ${PW + 20} ${PH + 20} L -20 ${PH + 20} Z`} fill="url(#gw-h)" opacity={0.6} />
          <path d={wave(0)} fill="none" stroke="rgba(230,245,255,0.95)" strokeWidth={5} />
          <path d={wave(1.7)} fill="none" stroke="rgba(10,40,90,0.8)" strokeWidth={2.5} transform="translate(0 14)" />
          {Array.from({length: 10}, (_, i) => {
            const u = (lt * 0.8 + rand(i * 3.1)) % 1;
            const y = PH - u * (PH - level);
            return <circle key={i} cx={40 + rand(i * 7.3) * (PW - 80) + Math.sin(lt * 4 + i) * 8} cy={y} r={5 + rand(i) * 7} fill="rgba(230,245,255,0.35)" stroke="rgba(10,40,90,0.8)" strokeWidth={2} opacity={k > 0.05 ? 1 : 0} />;
          })}
        </svg>
      </div>
      <Order text="HYDROPISIE" k={prog(lt, 0.35, 0.6, easeOut)} y={300} size={76} color="#8CC8FF" />
    </>
  );
};

// --- Enigme : la fiche de l'énigme ---
export const Enigme: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const at = Number(p.at ?? 1);
  const k = prog(lt, 0, 0.3, easeOut);
  const l2 = 'LA SÉCHERESSE ?';
  const n2 = Math.floor(clamp01((t - at) / 0.75) * l2.length);
  const sun = prog(t, at + 0.55, at + 1.0, easeOut);
  const rain = 1 - sun;
  return (
    <Paper id={id} x={540} y={800} w={860} h={760} rot={lerp(-5, -1.5, k)} s={lerp(0.86, 1, k)} o={k}>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={860} height={760}>
        <InkDefs p="en" />
        {/* nuage gravé et pluie hachurée */}
        <g opacity={rain}>
          <path d="M 250 170 C 230 110, 320 80, 360 120 C 390 60, 500 60, 520 125 C 580 100, 640 150, 610 200 L 270 205 C 220 205, 220 175, 250 170 Z" fill="#CFC6B4" stroke={INK} strokeWidth={4} filter="url(#en-wob)" />
          <Shade p="en" id="nu" d="M 250 170 C 230 110, 320 80, 360 120 C 390 60, 500 60, 520 125 C 580 100, 640 150, 610 200 L 270 205 C 220 205, 220 175, 250 170 Z" box={[220, 60, 420, 150]} from={[0.5, 1]} to={[0.5, 0.2]} />
          {Array.from({length: 16}, (_, i) => {
            const x = 270 + i * 22, y = 220 + ((lt * 600 + i * 47) % 120);
            return <line key={i} x1={x} y1={y} x2={x - 8} y2={y + 26} stroke="#1E4A8A" strokeWidth={4} strokeLinecap="round" />;
          })}
        </g>
        <g opacity={sun} transform={`translate(430 170) scale(${lerp(0.6, 1, sun)}) rotate(${lt * 20})`}>
          {Array.from({length: 14}, (_, i) => <line key={i} x1={0} y1={-70} x2={0} y2={-112} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${i * (360 / 14)})`} />)}
          <circle r={58} fill="#F2C14E" stroke={INK} strokeWidth={5} filter="url(#en-wob)" />
          <Shade p="en" id="so" d="M -58 0 A 58 58 0 1 0 58 0 A 58 58 0 1 0 -58 0 Z" box={[-58, -58, 116, 116]} from={[1, 1]} to={[0.2, 0.2]} />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 84, color: INK}}>LA PLUIE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 478, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 64, color: INK, opacity: prog(lt, 0.3, 0.5)}}>↓</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 76, color: RED, whiteSpace: 'pre'}}>{l2.slice(0, n2)}</div>
    </Paper>
  );
};

// --- Osselets : astragales lancés ---
const BONE = 'M -38 -22 Q -40 -30 -30 -30 L -12 -28 Q 0 -18 12 -28 L 30 -30 Q 40 -30 38 -22 L 34 -6 Q 30 0 34 6 L 38 22 Q 40 30 30 30 L 12 28 Q 0 18 -12 28 L -30 30 Q -40 30 -38 22 L -34 6 Q -30 0 -34 -6 Z';
export const Osselets: React.FC<AnimProps> = ({id, t, lt, p}) => {
  const at = Number(p.at ?? 0.3);
  const OW = 600, OH = Math.round((600 * 832) / 645);
  return (
    <>
      <div style={{position: 'absolute', left: 540 - OW / 2, top: 760 - OH / 2, width: OW, height: OH, filter: SHADOW, transform: `scale(${1 + 0.015 * lt})`}}>
        <Img src={src(id, 'osselets')} style={{width: OW, height: OH}} />
      </div>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920}>
        <InkDefs p="os" />
        <defs>
          {[0, 1, 2, 3, 4].map((i) => <clipPath key={i} id={`os-c${i}`}><path d={BONE} /></clipPath>)}
        </defs>
        {[0, 1, 2, 3, 4].map((i) => {
          const st = at + i * 0.07, u = clamp01((t - st) / 0.62);
          if (t < st) return null;
          const x0 = 540, y0 = 1300, x1 = 230 + i * 155, y1 = 1215 + (rand(i * 3) - 0.5) * 30;
          const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * (420 + 60 * i);
          const land = u >= 1 ? Math.exp(-(t - st - 0.62) * 10) : 0;
          const rot = lerp(0, 540 + (i % 2) * 180, easeOut(u)) + (rand(i) - 0.5) * 24;
          return (
            <g key={i}>
              {u >= 1 ? <ellipse cx={x1} cy={y1 + 58} rx={70} ry={13} fill="rgba(0,0,0,0.5)" /> : null}
              <g transform={`translate(${x} ${y - land * 18}) rotate(${rot}) scale(1.95)`}>
                <path d={BONE} fill="#E4D4AE" />
                <g clipPath={`url(#os-c${i})`}><rect x={-50} y={-50} width={100} height={100} fill="url(#os-hd)" opacity={0.6} transform="translate(16 18)" /></g>
                <path d={BONE} fill="none" stroke={INK} strokeWidth={3} filter="url(#os-wob)" />
                <ellipse cx={0} cy={0} rx={9} ry={6} fill="#B9A57E" stroke={INK} strokeWidth={2} /><path d="M -26 -16 Q -20 -4 -26 8 M 26 -12 Q 20 0 26 12" fill="none" stroke={INK} strokeWidth={2} opacity={0.7} />
              </g>
            </g>
          );
        })}
      </svg>
    </>
  );
};

// --- Recherche : barre de recherche gravée ---
export const Recherche: React.FC<AnimProps> = ({id, lt}) => {
  const q = 'ventre gonflé d’eau que faire';
  const n = Math.floor(clamp01((lt - 0.2) / 0.75) * q.length);
  const k = prog(lt, 0, 0.25, easeOut);
  const res = ['Consultez un médecin', 'Hydropisie : causes', 'Remèdes de grand-mère'];
  return (
    <Paper id={id} x={540} y={790} w={880} h={720} rot={lerp(3, 1, k)} s={lerp(0.88, 1, k)} o={k}>
      <div style={{position: 'absolute', left: 50, right: 50, top: 70, height: 110, borderRadius: 55, border: `5px solid ${INK}`, background: 'rgba(255,252,244,0.75)', display: 'flex', alignItems: 'center', paddingLeft: 96, fontFamily: GF.sans, fontWeight: 700, fontSize: 42, color: INK, whiteSpace: 'nowrap', overflow: 'hidden'}}>
        {q.slice(0, n)}
        <span style={{opacity: Math.floor(lt * 2.4) % 2 ? 0 : 1, marginLeft: 2}}>|</span>
      </div>
      <svg style={{position: 'absolute', left: 82, top: 103}} width={50} height={50}>
        <circle cx={20} cy={20} r={14} fill="none" stroke={INK} strokeWidth={5} />
        <line x1={31} y1={31} x2={45} y2={45} stroke={INK} strokeWidth={6} strokeLinecap="round" />
      </svg>
      {res.map((r, i) => {
        const o = prog(lt, 0.85 + i * 0.1, 1.0 + i * 0.1, overshoot);
        return (
          <div key={i} style={{position: 'absolute', left: 70, right: 70, top: 240 + i * 150, opacity: clamp01(o), transform: `translateY(${(1 - clamp01(o)) * 20}px)`}}>
            <div style={{fontFamily: GF.serif, fontWeight: 900, fontSize: 54, color: '#1E3E8A', textDecoration: 'underline'}}>{r}</div>
            <div style={{marginTop: 14, height: 10, width: '86%', background: `repeating-linear-gradient(90deg, rgba(26,17,8,0.45) 0 14px, transparent 14px 20px)`}} />
          </div>
        );
      })}
    </Paper>
  );
};

export const HERACLITE = {Bouse, Gonfle, Enigme, Osselets, Recherche};
