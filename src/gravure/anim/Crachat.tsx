// Animations sur mesure de la vidéo 45 (Diogène, d'après Diogène Laërce VI), style Corinthe (terre cuite, rouille).
// Crachat : le visage de Ribera (1637) plein écran ; il recule, crache : le glaviot grossit vers l'objectif et s'écrase sur la vitre
//   (le spectateur est le riche). spit = départ, hit = impact (s absolus) ; sans `spit`, le visage seul (zoom depuis `z0` vers `z1`, pour la boucle).
// Lanterne : gravure de Castiglione dans le noir, seule la lampe éclaire, le halo balaie les visages ; Plumes : poulet + plumes qui explosent à `at`.
// Os : Diogène en médaillon, os gravés lancés de chaque côté (`at`) ; Ombre : ombre d'Alexandre qui glisse, soleil qui revient à `at`.
// Versions : 3 fiches de mort (pieuvre, chien, souffle) ; Duo : Alexandre et Diogène, deux médaillons ; Liste : ce que tu as peur de perdre, rayé.
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {clamp01, easeOut, lerp, overshoot, prog, rand} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {InkDefs, Engraved} from './ink';
import {InkStroke, nums, pop, punch, RED, src} from './tests';

/** contour bosselé lissé : n points autour de (cx, cy), courbes quadratiques entre les milieux */
const blob = (cx: number, cy: number, r: number, seed: number, n = 14, j = 0.35, sy = 1) => {
  const P = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2, q = r * (1 + j * (rand(seed * 7.1 + i * 3.3) - 0.5) * 2);
    return [cx + q * Math.cos(a), cy + q * sy * Math.sin(a)];
  });
  const mid = (a: number[], b: number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(P[n - 1], P[0]);
  let d = `M ${m0[0].toFixed(1)} ${m0[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) { const m = mid(P[i], P[(i + 1) % n]); d += ` Q ${P[i][0].toFixed(1)} ${P[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }
  return d + ' Z';
};

const GOB = ['rgba(240,238,205,0.95)', 'rgba(205,205,150,0.86)', 'rgba(150,150,90,0.8)'];
const GobDefs: React.FC = () => (
  <defs>
    <radialGradient id="gob" cx="0.38" cy="0.32" r="0.8">
      <stop offset="0" stopColor={GOB[0]} /><stop offset="0.55" stopColor={GOB[1]} /><stop offset="1" stopColor={GOB[2]} />
    </radialGradient>
  </defs>
);

/** le glaviot en vol : bulle luisante et filets qui le suivent */
const Glob: React.FC<{x: number; y: number; r: number; t: number}> = ({x, y, r, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    <GobDefs />
    <path d={blob(x, y, r, 3 + Math.floor(t * 30) % 4, 12, 0.14)} fill="url(#gob)" stroke="rgba(70,62,30,0.75)" strokeWidth={Math.max(2, r * 0.03)} />
    <ellipse cx={x - r * 0.3} cy={y - r * 0.34} rx={r * 0.26} ry={r * 0.15} fill="rgba(255,255,255,0.92)" transform={`rotate(-24 ${x - r * 0.3} ${y - r * 0.34})`} />
    <circle cx={x + r * 0.32} cy={y + r * 0.3} r={r * 0.07} fill="rgba(255,255,255,0.6)" />
  </svg>
);

/** le crachat écrasé sur la vitre : flaque, gouttes éjectées, coulures qui descendent, reflets */
const Splat: React.FC<{u: number; cx?: number; cy?: number; seed?: number}> = ({u, cx = 540, cy = 690, seed = 5}) => {
  const k = prog(u, 0, 0.09, overshoot);
  const R = 370 * k;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <GobDefs />
      {Array.from({length: 6}, (_, i) => {
        const x = cx - 300 + i * 118 + (rand(seed + i) - 0.5) * 40, w = 20 + rand(seed + i * 2.2) * 26, l = (0.25 + rand(seed + i * 3.9)) * 640 * easeOut(clamp01((u - 0.08) / 2.4));
        const y0 = cy + 110;
        const bend = (rand(seed + i * 5.3) - 0.5) * 46; // coulure qui serpente et finit en goutte
        return <path key={i} d={`M ${x - w / 2} ${y0} C ${x - w * 0.2 + bend} ${y0 + l * 0.4}, ${x - w * 0.5 - bend} ${y0 + l * 0.7}, ${x - w * 0.18 + bend * 0.4} ${y0 + l} C ${x - w * 0.8 + bend * 0.4} ${y0 + l + w * 1.3}, ${x + w * 0.8 + bend * 0.4} ${y0 + l + w * 1.3}, ${x + w * 0.18 + bend * 0.4} ${y0 + l} C ${x + w * 0.5 - bend} ${y0 + l * 0.7}, ${x + w * 0.2 + bend} ${y0 + l * 0.4}, ${x + w / 2} ${y0} Z`} fill="url(#gob)" stroke="rgba(70,62,30,0.6)" strokeWidth={3} />;
      })}
      <path d={blob(cx, cy, R, seed, 18, 0.34, 0.86)} fill="url(#gob)" stroke="rgba(70,62,30,0.7)" strokeWidth={5} />
      <path d={blob(cx - 30, cy - 20, R * 0.6, seed + 2, 12, 0.3, 0.8)} fill="rgba(250,248,225,0.3)" />
      {Array.from({length: 22}, (_, i) => {
        const a = rand(seed + i * 1.7) * Math.PI * 2, d = (1.05 + rand(seed + i * 2.3) * 0.75) * 370 * k, r = 7 + rand(seed + i * 4.1) * 24;
        return <path key={i} d={blob(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.9, r, i + seed, 8, 0.2)} fill="url(#gob)" stroke="rgba(70,62,30,0.6)" strokeWidth={2.5} />;
      })}
      <ellipse cx={cx - 130} cy={cy - 130} rx={95 * k} ry={38 * k} fill="rgba(255,255,255,0.85)" transform={`rotate(-28 ${cx - 130} ${cy - 130})`} />
      <ellipse cx={cx + 150} cy={cy + 70} rx={30 * k} ry={14 * k} fill="rgba(255,255,255,0.6)" transform={`rotate(-20 ${cx + 150} ${cy + 70})`} />
    </svg>
  );
};

const Crachat: React.FC<AnimProps> = ({id, lt, t, t0, t1, p}) => {
  const spit = p.spit as number | undefined, hit = p.hit as number | undefined;
  const img = String(p.img ?? 'ribera_plein');
  const [mx, my] = img === 'ribera_bouche' ? [553, 830] : [510, 760];
  const z0 = (p.z0 as number) ?? 1.3, z1 = (p.z1 as number) ?? 1.0;
  let s = lerp(z0, z1, prog(t, t0, spit !== undefined ? spit - 0.25 : t1, easeOut)), rot = 0, ty = 0;
  if (spit !== undefined) {
    const back = prog(t, spit - 0.28, spit - 0.03, easeOut), fwd = prog(t, spit - 0.03, spit + 0.1, easeOut);
    s *= 1 - 0.055 * back + 0.16 * fwd; rot = -2.6 * back + 3.4 * fwd; ty = -30 * back + 50 * fwd;
  }
  // grondement dans la gorge (`rumble` : [début, fin]) : le visage vibre
  const rb = nums(p, 'rumble');
  const vib = rb.length && t >= rb[0] && t < rb[1] ? 7 * prog(t, rb[0], Math.min(rb[1], rb[0] + 1.2)) : 0;
  s *= punch(t, nums(p, 'nod'), 0.1, 0.3);
  const shake = hit !== undefined && t >= hit ? 34 * (1 - clamp01((t - hit) / 0.32)) ** 2 : 0;
  const sx = (rand(t * 91) - 0.5) * (vib + shake), sy = (rand(t * 57 + 3) - 0.5) * (vib + shake);
  const fly = spit !== undefined && hit !== undefined && t >= spit && t < hit ? clamp01((t - spit) / (hit - spit)) : -1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${ty + sy}px) rotate(${rot}deg) scale(${s})`, transformOrigin: `${(mx / 1080) * 100}% ${(my / 1920) * 100}%`}}>
        <Img src={src(id, img)} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      {fly >= 0 ? <Glob x={lerp(mx, 540, fly)} y={lerp(my, 690, fly)} r={lerp(16, 300, fly ** 2.4)} t={t} /> : null}
      {hit !== undefined && t >= hit ? <Splat u={t - hit} /> : null}
    </AbsoluteFill>
  );
};

/** seule la lampe éclaire : la gravure n'existe que dans le halo, qui balaie de la lampe vers les visages */
const Lanterne: React.FC<AnimProps> = ({id, lt, t, t0, t1}) => {
  const u = clamp01(lt / (t1 - t0));
  const fl = 1 + 0.05 * Math.sin(t * 23) + 0.035 * Math.sin(t * 41 + 1);
  const x = lerp(330, 720, easeOut(u)) + 26 * Math.sin(t * 3.1), y = lerp(620, 900, u) + 20 * Math.sin(t * 2.3);
  const r = lerp(330, 440, u) * fl;
  return (
    <AbsoluteFill style={{background: '#080502'}}>
      <AbsoluteFill style={{transform: `scale(${1.06 + 0.1 * u})`}}>
        <Img src={src(id, 'castig')} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle ${r * 1.5}px at ${x}px ${y}px, rgba(8,5,2,0) 0, rgba(8,5,2,0.1) 42%, rgba(8,5,2,0.86) 72%, rgba(8,5,2,0.97) 100%)`}} />
      <AbsoluteFill style={{mixBlendMode: 'soft-light', background: `radial-gradient(circle ${r}px at ${x}px ${y}px, rgba(255,170,70,0.95) 0, rgba(255,130,40,0) 100%)`}} />
      <div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, background: 'radial-gradient(circle, #FFF6D0 0, #FFC860 38%, rgba(255,140,40,0) 72%)', transform: `scale(${fl * 1.5})`}} />
    </AbsoluteFill>
  );
};

/** une plume gravée : hampe, barbes hachurées */
const Feather: React.FC<{x: number; y: number; a: number; s: number}> = ({x, y, a, s}) => (
  <g transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`}>
    <path d="M 0 -70 C 30 -50 34 20 4 60 L -4 60 C -34 20 -30 -50 0 -70 Z" fill="#EFE6CF" stroke="#2A1A0C" strokeWidth={2.6} />
    {[-48, -34, -20, -6, 8, 22, 36].map((q) => <g key={q} stroke="#2A1A0C" strokeWidth={1.7} opacity={0.7}><line x1={0} y1={q} x2={24} y2={q - 16} /><line x1={0} y1={q} x2={-24} y2={q - 16} /></g>)}
    <line x1={0} y1={-70} x2={0} y2={92} stroke="#2A1A0C" strokeWidth={3.4} />
  </g>
);

const Plumes: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = p.at as number;
  const s = 1.04 + 0.1 * clamp01((t - t0) / (t1 - t0));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${s * punch(t, [at], 0.14)})`, transformOrigin: '50% 40%'}}><Img src={src(id, 'rooster')} style={{position: 'absolute', left: 110, top: 300, width: 860}} /></AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: 22}, (_, i) => {
          const u = t - at - rand(i * 2.9) * 0.2;
          if (u < 0) return null;
          const a = rand(i * 1.3) * Math.PI * 2, v = 420 + rand(i * 3.1) * 820, dmp = 1 - Math.exp(-u * 2.6);
          const x = 540 + Math.cos(a) * v * dmp * 0.72 + 44 * Math.sin(u * 3 + i), y = 830 + Math.sin(a) * v * dmp * 0.72 + 130 * u * u;
          return <Feather key={i} x={x} y={y} a={rand(i * 5.7) * 360 + u * 90 * (i % 2 ? 1 : -1) + 34 * Math.sin(u * 3 + i)} s={0.6 + rand(i * 7.7) * 0.7} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

const BONE = 'M -74 -10 C -92 -34 -122 -12 -104 2 C -122 16 -92 36 -74 12 L 74 10 C 92 34 122 14 104 -2 C 122 -18 92 -36 74 -12 Z';
const Os: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = nums(p, 'at');
  const cy = 800;
  const hit = at.filter((a) => t >= a + 0.3);
  const shake = hit.length ? 22 * (1 - clamp01((t - hit[hit.length - 1] - 0.0) / 0.24)) ** 2 : 0;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, zIndex: 2}}>
        <InkDefs p="os" />
        {at.map((a, i) => {
          const u = clamp01((t - a) / 0.3);
          if (t < a) return null;
          const left = i % 2 === 0;
          const rest = [[350, 1160, 18], [720, 1190, -24], [520, 1230, 6], [240, 1230, -12], [850, 1120, 30]][i % 5];
          const fall = clamp01((t - a - 0.3) / 0.28);
          const x = u < 1 ? lerp(left ? -120 : 1200, 540 + (left ? -60 : 60), u) : lerp(540 + (left ? -60 : 60), rest[0], fall);
          const y = u < 1 ? lerp(420, cy - 40, u) - 90 * Math.sin(u * Math.PI) : lerp(cy - 40, rest[1], fall ** 2) - 120 * Math.sin(fall * Math.PI);
          return <g key={i} transform={`translate(${x} ${y}) rotate(${u < 1 ? u * 620 + i * 40 : lerp(i * 40 + 620, rest[2], fall)}) scale(1.5)`}><Engraved p="os" id={`b${i}`} d={BONE} box={[-122, -36, 244, 72]} fill="#EADFC4" hatch="hm" from={[0.5, 1]} to={[0.5, 0.1]} stroke={3.4} /></g>;
        })}
      </svg>
      <div style={{position: 'absolute', left: 540 - 300, top: cy - 300, width: 600, height: 600, transform: `translate(${(rand(t * 77) - 0.5) * shake}px, ${(rand(t * 39) - 0.5) * shake}px) scale(${1 + 0.05 * clamp01((t - t0) / (t1 - t0))})`}}>
        <Img src={src(id, 'ribera_rond')} style={{width: 600, height: 600}} />
      </div>
    </AbsoluteFill>
  );
};

/** l'ombre d'Alexandre couvre Diogène, elle glisse à `at`, le soleil lui tombe dessus */
const Ombre: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = p.at as number;
  const k = prog(t, at, at + 0.5, easeOut);
  const s = 1.1 - 0.08 * clamp01((t - t0) / (t1 - t0));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, filter: `brightness(${lerp(0.72, 1.18, k)}) saturate(${lerp(0.7, 1.15, k)})`}}><Img src={src(id, 'crayer_dio_plein')} style={{width: 1080, height: 1920}} /></AbsoluteFill>
      <AbsoluteFill style={{background: `linear-gradient(100deg, rgba(4,3,2,0.97) 0, rgba(4,3,2,0.92) 60%, rgba(4,3,2,0) 100%)`, transform: `translateX(${lerp(0, -1500, k)}px)`}} />
      <AbsoluteFill style={{opacity: k, mixBlendMode: 'screen', background: 'radial-gradient(circle 1100px at 880px 180px, rgba(255,214,130,0.9) 0, rgba(255,160,70,0.3) 45%, rgba(255,140,40,0) 100%)'}} />
    </AbsoluteFill>
  );
};

const Fiche: React.FC<{id: string; img: string; label: string; k: number; x: number; y: number; w: number; h: number; rot: number; on: number}> = ({id, img, label, k, x, y, w, h, rot, on}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg) scale(${lerp(1.5, 1, k) * (1 + 0.05 * on)})`, opacity: clamp01(k * 3), boxShadow: '0 20px 40px rgba(0,0,0,0.7)', overflow: 'hidden', border: `5px solid ${G.gold}`, background: '#100804'}}>
      <Img src={src(id, img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 0', background: 'rgba(10,6,3,0.84)', textAlign: 'center', fontFamily: GF.label, fontWeight: 900, fontSize: 56, letterSpacing: '0.05em', color: G.goldHi}}>{label}</div>
    </div>
  );

const Versions: React.FC<AnimProps> = ({id, t, p}) => {
  const at = nums(p, 'at');
  const C: [string, string, number, number, number, number, number][] = [['pieuvre', 'PIEUVRE CRUE', 470, 450, 700, 310, -3], ['chiens', 'MORSURE', 560, 800, 700, 310, 2], ['ribera_bouche', 'SOUFFLE RETENU', 480, 1150, 700, 310, -2]];
  return <AbsoluteFill>{C.map((c, i) => <Fiche key={i} id={id} img={c[0]} label={c[1]} k={pop(t, at[i], 0.22)} x={c[2]} y={c[3]} w={c[4]} h={c[5]} rot={c[6]} on={i === at.filter((a) => t >= a).length - 1 ? 1 : 0} />)}</AbsoluteFill>;
};

/** deux médaillons face à face : le maître du monde, le mec de la jarre */
const Duo: React.FC<AnimProps> = ({id, t, t0, t1, p}) => {
  const at = nums(p, 'at');
  const u = clamp01((t - t0) / (t1 - t0));
  const M = (img: string, y: number, label: string, k: number, dx: number) => k <= 0 ? null : (
    <div style={{position: 'absolute', left: 540 - 260 + dx * (1 - u) * 40, top: y - 260, width: 520, textAlign: 'center', transform: `scale(${lerp(1.5, 1, k)})`, opacity: clamp01(k * 3)}}>
      <Img src={src(id, img)} style={{width: 460, height: 460}} />
      <div style={{fontFamily: GF.label, fontWeight: 900, fontSize: 58, color: G.goldHi, letterSpacing: '0.05em', whiteSpace: 'nowrap', marginTop: -18, textShadow: '0 4px 14px #000'}}>{label}</div>
    </div>
  );
  return <AbsoluteFill style={{transform: `scale(${punch(t, nums(p, 'hits'), 0.07)})`}}>{M('crayer_alex_rond', 500, 'LE MAÎTRE DU MONDE', pop(t, at[0], 0.2), -1)}{M('ribera_rond', 1000, 'LE MEC DE LA JARRE', pop(t, at[1], 0.2), 1)}</AbsoluteFill>;
};

/** ce que tu as peur de perdre, rayé mot après mot */
const Liste: React.FC<AnimProps> = ({t, p}) => {
  const L = String(p.lines).split('|'), at = nums(p, 'at');
  return (
    <AbsoluteFill style={{transform: `scale(${punch(t, at, 0.05)})`}}>
      {L.map((l, i) => {
        const y = 480 + i * 240, k = pop(t, at[i] - 0.5, 0.16);
        return k <= 0 ? null : (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 124, color: G.gold, opacity: clamp01(k * 3) * (t >= at[i] + 0.2 ? 0.55 : 1), transform: `scale(${lerp(1.3, 1, k)})`}}>{l}</div>
            <InkStroke d={`M 130 ${y + 86} C 380 ${y + 62}, 640 ${y + 106}, 950 ${y + 72}`} k={prog(t, at[i], at[i] + 0.2, easeOut)} w={15} color={RED} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const CRACHAT = {Crachat, Lanterne, Plumes, Os, Ombre, Versions, Duo, Liste};
