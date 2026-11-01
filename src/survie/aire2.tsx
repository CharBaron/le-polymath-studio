// « AIRE 13 » : les plans dessinés à plat. Habitacle vu de la banquette arrière (autoroute qui défile, parking, moteur coupé),
// gros plan de la clé de contact, gobelet de café qui fume, porte vitrée de la boutique et son panneau de consignes, inventaire.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, easeInOut, easeOut, FPS, lerp, prog, rand} from '../theme';
import {AC} from './aire';
import {Figure, LOOKS} from './rider';
import {mixHex, Pose} from './stick';
import {SF, SV} from './ui';
import {Blurs} from './world';

type Pt = [number, number];
const pts = (a: Pt[]) => a.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
const view = (c: {x: number; y: number; z: number}) => `translate(540,960) scale(${c.z}) translate(${-c.x},${-c.y})`;

// ---------------- habitacle vu de la banquette arrière ----------------
export type HabProps = {
  T: number; uid: string;
  /** dehors : autoroute qui défile, parking (faisceau devant + silhouette au bout), ou phares coupés */
  mode: 'road' | 'lot' | 'off';
  cam?: {x: number; y: number; z: number};
  /** tableau de bord allumé (0-1), plafonnier (0-1), toi au volant, essuie-glaces, vitesse de l'autoroute (0-1) */
  dash?: number; dome?: number; toi?: boolean; wipers?: boolean; speed?: number;
  /** portière conducteur ouverte : lumière froide qui entre par la gauche, et le carillon visuel (voyant porte) */
  door?: boolean;
  /** silhouette au bout du faisceau (0-1) ; secousse du moteur ; frein (le corps part en avant) */
  att?: number; shake?: number; brake?: number;
};
const WS: Pt[] = [[150, 560], [930, 560], [1050, 1050], [30, 1050]]; // pare-brise
const PIV: Pt[] = [[250, 1050], [640, 1050]]; // axes des essuie-glaces

export const Habitacle: React.FC<HabProps> = ({T, uid, mode, cam = {x: 540, y: 960, z: 1}, dash = 1, dome = 0, toi, wipers, speed = 1, door, att = 0, shake = 0, brake = 0}) => {
  const frame = useCurrentFrame();
  const jx = shake * (rand(frame * 1.7) - 0.5) * 3, jy = shake * (rand(frame * 2.3) - 0.5) * 2;
  const clip = `ws-${uid}`;
  // essuie-glaces : aller-retour en 1,4 s, pause en bas
  const wA = (t: number) => {
    if (!wipers) return 6;
    const ph = (t % 1.6) / 1.6;
    return 6 + 112 * Math.sin(Math.PI * clamp01(ph / 0.8)) ** 1.4;
  };
  const wa = wA(T);
  // dehors
  const out: React.ReactNode[] = [];
  let sweep = 0; // lumière orange des lampadaires qui balaie l'habitacle
  if (mode === 'road') {
    out.push(<rect key="sky" x={0} y={540} width={1080} height={520} fill={`url(#rsky-${uid})`} />);
    // route en perspective : bas-côtés, tirets qui défilent vers nous, rails
    const vp: Pt = [560, 770];
    out.push(<polygon key="road" points={pts([vp, [vp[0] + 4, vp[1]], [1180, 1060], [-100, 1060]])} fill="#1A1D22" />);
    for (let k = 0; k < 7; k++) {
      const u = ((k / 7 + T * 0.9 * speed) % 1), u2 = Math.min(1, u + 0.05);
      const y0 = lerp(vp[1], 1060, u * u), y1 = lerp(vp[1], 1060, u2 * u2);
      const x0 = lerp(vp[0], 760, u * u), x1 = lerp(vp[0], 760, u2 * u2);
      out.push(<line key={'d' + k} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#D8D4C8" strokeWidth={2 + 14 * u * u} opacity={0.75 * Math.min(1, u * 3)} />);
    }
    out.push(<line key="eL" x1={vp[0] - 4} y1={vp[1]} x2={-140} y2={1060} stroke="#CFCBBE" strokeWidth={6} opacity={0.5} />);
    out.push(<line key="eR" x1={vp[0] + 8} y1={vp[1]} x2={1240} y2={1060} stroke="#CFCBBE" strokeWidth={6} opacity={0.35} />);
    // lampadaires qui arrivent et passent au-dessus (halo orange qui grandit et sort par le haut)
    for (let k = 0; k < 3; k++) {
      const u = ((k / 3 + T * 0.42 * speed) % 1), side = k % 2 ? 1 : -1;
      const x = lerp(vp[0], vp[0] + side * 1100, u ** 2.2), y = lerp(vp[1] - 40, 300, u ** 1.8);
      out.push(<circle key={'l' + k} cx={x} cy={y} r={6 + 120 * u ** 2} fill={AC.sodium} opacity={0.75 * Math.min(1, u * 4)} filter="url(#b14)" />);
      out.push(<circle key={'lc' + k} cx={x} cy={y} r={2 + 18 * u ** 2} fill="#FFE6C0" opacity={0.9 * Math.min(1, u * 4)} />);
      if (u > 0.7) sweep = Math.max(sweep, Math.sin(Math.PI * (u - 0.7) / 0.3));
    }
    // une voiture loin devant : deux feux rouges qui ondulent
    const fx = 548 + 6 * Math.sin(T * 0.7);
    [-9, 9].forEach((d) => out.push(<circle key={'tf' + d} cx={fx + d} cy={790} r={4} fill={AC.tail} opacity={0.85} />));
    out.push(<ellipse key="tfg" cx={fx} cy={790} rx={34} ry={16} fill={AC.tail} opacity={0.35} filter="url(#b8)" />);
    out.push(<rect key="fog" x={0} y={560} width={1080} height={300} fill={AC.fogHi} opacity={0.18} filter="url(#b24)" />);
  } else {
    // le parking : brouillard éclairé, faisceaux des voisins en biais, le nôtre droit devant, une silhouette au bout
    const lit = mode === 'lot' ? 1 : 0;
    out.push(<rect key="sky" x={0} y={540} width={1080} height={520} fill={`url(#lsky-${uid})`} />);
    out.push(<polygon key="nbL" points={pts([[-60, 1060], [140, 1060], [330, 760], [250, 760]])} fill={AC.beam} opacity={0.22} filter="url(#b24)" />);
    out.push(<polygon key="nbR" points={pts([[900, 1060], [1140, 1060], [870, 760], [800, 760]])} fill={AC.beam} opacity={0.22} filter="url(#b24)" />);
    out.push(<polygon key="own" points={pts([[180, 1060], [900, 1060], [640, 780], [460, 780]])} fill={AC.beam} opacity={0.5 * lit} filter="url(#b24)" />);
    out.push(<ellipse key="pool" cx={545} cy={840} rx={240} ry={50} fill={AC.beam} opacity={0.45 * lit} filter="url(#b14)" />);
    // les pluies dans notre faisceau
    if (lit) {
      for (let k = 0; k < 36; k++) {
        const x = 420 + rand(k * 3.1) * 250, sp = 380 + 120 * rand(k);
        const y = 640 + ((T * sp + rand(k * 7) * 400) % 420);
        out.push(<line key={'r' + k} x1={x} y1={y} x2={x - 2} y2={y + 14} stroke="#FFF6E2" strokeWidth={1.6} opacity={0.5} />);
      }
    }
    if (att > 0) {
      out.push(
        <g key="att" opacity={att}>
          <Figure look={LOOKS.attendant} p={{torso: 3, head: 32, aL: -9, aLb: 6, aR: 9, aRb: -6, lL: -4, lLb: 0, lR: 4, lRb: 0}} x={548} y={835} h={150} light={{amb: 0.85, tint: AC.fog}} fingers={0.9} />
        </g>,
      );
    }
    out.push(<rect key="fog" x={0} y={560} width={1080} height={320} fill={AC.fogHi} opacity={0.14} filter="url(#b24)" />);
  }
  // capot devant le pare-brise (éclairé par le reflet du faisceau)
  const hood = <path key="hood" d="M-40 1060 Q540 940 1120 1060 L1120 1100 L-40 1100 Z" fill={mode === 'road' ? '#101215' : '#15181C'} />;
  const hoodRim = <path key="hoodr" d="M60 1040 Q540 950 1020 1040" stroke={mode === 'road' ? '#3A3C40' : AC.beam} strokeWidth={3} fill="none" opacity={mode === 'lot' ? 0.45 : 0.3} />;
  // gouttes sur le pare-brise, effacées par les essuie-glaces
  const drops: React.ReactNode[] = [];
  for (let k = 0; k < 70; k++) {
    const x = lerp(160, 940, rand(k * 1.3)), y = lerp(580, 1030, rand(k * 2.7));
    const piv = x < 450 ? PIV[0] : PIV[1];
    const ang = (Math.atan2(piv[1] - y, piv[0] - x) * 180) / Math.PI; // angle de la goutte vu de l'axe
    let age = (T + rand(k * 5.1) * 3) % 3;
    if (wipers) {
      const per = 1.6, ph = T % per;
      // instant du dernier passage du balai sur cette goutte
      const hit = (aa: number) => Math.abs(wA(T - aa) - ang) < 9;
      for (let a = 0; a < ph + per; a += 1 / 30) if (hit(a)) { age = Math.min(age, a); break; }
    }
    const r = 2 + 5 * rand(k * 4.4);
    const o = clamp01(age / 1.2) * 0.75;
    const slide = mode === 'road' ? 0 : (age * 6 * rand(k)) % 30;
    drops.push(
      <g key={k} opacity={o}>
        <circle cx={x} cy={y + slide} r={r} fill="#C9D3DF" opacity={0.35} />
        <circle cx={x - r * 0.3} cy={y + slide - r * 0.35} r={r * 0.35} fill="#FFFFFF" opacity={0.7} />
      </g>,
    );
  }
  const blade = (p: Pt, a: number, L: number, k: string) => {
    const r = (a * Math.PI) / 180, e: Pt = [p[0] - Math.cos(r) * L, p[1] - Math.sin(r) * L];
    return (
      <g key={k}>
        <line x1={p[0]} y1={p[1]} x2={e[0]} y2={e[1]} stroke="#0B0C0E" strokeWidth={11} strokeLinecap="round" />
        <line x1={lerp(p[0], e[0], 0.15)} y1={lerp(p[1], e[1], 0.15)} x2={e[0]} y2={e[1]} stroke="#1D1F23" strokeWidth={5} strokeLinecap="round" />
      </g>
    );
  };
  // intérieur : couleurs selon les lumières (plafonnier chaud, tableau de bord vert, nuit froide)
  const amb = 0.18 + 0.5 * dome + 0.12 * dash;
  const shell = (c: string) => mixHex(mixHex('#07080B', c, amb), '#FFB870', 0.14 * dome);
  const dashG = AC.dash;
  // toi au volant (de dos) : casquette au-dessus de l'appui-tête, épaules orange, bras noirs vers le volant
  const lean = brake * 26;
  const breath = Math.sin(T * 1.6) * 2;
  // toi : éclairé par le tableau de bord (vert) et un peu par la nuit, jamais aussi sombre que l'habitacle
  const lit = (c: string) => mixHex(mixHex(c, '#0A0C10', 0.32), dashG, 0.1 * dash);
  const ly = -lean * 0.4 + breath;
  const toiBack = toi ? (
    <g key="toiB" transform={`translate(0,${ly})`}>
      {/* bras (manches noires) vers le volant, épaules orange qui dépassent du dossier */}
      {[[-1, 150], [1, 612]].map(([s, sx]) => (
        <path key={'arm' + s} d={`M${sx} ${1300 + lean} Q${s < 0 ? 190 : 575} ${1200 + lean} ${s < 0 ? 252 : 520} ${1128 + lean * 0.2}`} stroke={lit('#2C2C33')} strokeWidth={48} fill="none" strokeLinecap="round" />
      ))}
      {[[-1, 150], [1, 612]].map(([s, sx]) => <ellipse key={'sh' + s} cx={sx} cy={1312 + lean} rx={62} ry={56} fill={lit('#F07A22')} stroke="#0A0A0C" strokeWidth={4} />)}
      {[[252, 1128], [520, 1128]].map(([hx, hy], i) => <circle key={'h' + i} cx={hx} cy={hy + lean * 0.2} r={23} fill={lit('#F1EBDD')} stroke="#0A0A0C" strokeWidth={3} />)}
      {/* tête derrière l'appui-tête : seules la casquette et les oreilles dépassent */}
      <ellipse cx={386} cy={1110 + lean * 0.7} rx={78} ry={86} fill={lit('#3B2B22')} stroke="#0A0A0C" strokeWidth={4} />
      {[-1, 1].map((s) => <ellipse key={'ear' + s} cx={386 + s * 80} cy={1112 + lean * 0.7} rx={14} ry={22} fill={lit('#E8D6C4')} stroke="#0A0A0C" strokeWidth={3} />)}
      <path d={`M${306} ${1098 + lean * 0.7} C${300} ${990 + lean * 0.7} ${472} ${990 + lean * 0.7} ${466} ${1098 + lean * 0.7} Q${386} ${1078 + lean * 0.7} ${306} ${1098 + lean * 0.7} Z`} fill={lit('#F2EFE8')} stroke="#0A0A0C" strokeWidth={4} />
      <path d={`M${386} ${1000 + lean * 0.7} L${386} ${1088 + lean * 0.7}`} stroke={lit('#BDB7AA')} strokeWidth={3} />
      <circle cx={386} cy={1000 + lean * 0.7} r={8} fill={lit('#D9D4C8')} stroke="#0A0A0C" strokeWidth={2} />
    </g>
  ) : null;
  // clé sur le contact, porte-clés qui oscille (le moteur fait vibrer)
  const sw = Math.sin(T * 6.3) * (dash > 0.5 ? 7 : 2) + (door ? Math.sin(T * 2.1) * 9 : 0);
  const keys = (
    <g key="keys" transform={`translate(600,1236)`}>
      <rect x={-10} y={-8} width={34} height={16} rx={4} fill="#1C1D20" />
      <g transform={`rotate(${sw},20,6)`}>
        <line x1={20} y1={6} x2={20} y2={48} stroke="#8F959E" strokeWidth={3} />
        <circle cx={20} cy={50} r={9} fill="none" stroke="#9AA0A8" strokeWidth={3} />
        <rect x={10} y={58} width={22} height={34} rx={5} fill={shell('#C8261E')} stroke="#0A0A0C" strokeWidth={2.5} />
      </g>
    </g>
  );
  const sweepO = 0.32 * sweep;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <clipPath id={clip}><polygon points={pts(WS)} /></clipPath>
        <linearGradient id={`rsky-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset={0} stopColor="#0E1118" /><stop offset={1} stopColor="#3A4250" /></linearGradient>
        <linearGradient id={`lsky-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset={0} stopColor={mode === 'lot' ? '#4A5566' : '#2A313C'} /><stop offset={1} stopColor={mode === 'lot' ? AC.fogHi : '#4A5462'} /></linearGradient>
        <radialGradient id={`dome-${uid}`} cx={0.5} cy={0.2} r={0.7}><stop offset={0} stopColor="#FFC98A" stopOpacity={0.55} /><stop offset={1} stopColor="#FFC98A" stopOpacity={0} /></radialGradient>
        <linearGradient id={`seat-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset={0} stopColor={shell('#55565C')} /><stop offset={1} stopColor={shell('#1E1F23')} /></linearGradient>
      </defs>
      <g transform={`${view(cam)} translate(${jx},${jy})`}>
        <rect x={-400} y={-400} width={1900} height={2800} fill={shell('#2A2724')} />
        <g clipPath={`url(#${clip})`}>
          {out}
          {hood}
          {hoodRim}
          {drops}
        </g>
        {/* ciel de toit, plafonnier, rétroviseur */}
        <path d="M-400 -400 L1480 -400 L1480 560 L930 560 Q540 520 150 560 L-400 560 Z" fill={shell('#4A4640')} />
        <path d="M150 560 Q540 520 930 560" stroke={shell('#6A655C')} strokeWidth={6} fill="none" />
        <rect x={470} y={330} width={140} height={46} rx={14} fill={mixHex(shell('#3A3732'), '#FFE0B0', 0.9 * dome)} stroke="#0A0A0C" strokeWidth={3} />
        {dome > 0 ? <circle cx={540} cy={352} r={130} fill="#FFD9A0" opacity={0.45 * dome} filter="url(#b40)" /> : null}
        <line x1={540} y1={540} x2={540} y2={590} stroke="#111214" strokeWidth={14} />
        <rect x={440} y={585} width={200} height={66} rx={16} fill="#121316" stroke="#060607" strokeWidth={4} />
        <rect x={452} y={596} width={176} height={44} rx={10} fill={mode === 'road' ? '#20242C' : '#3E4654'} />
        {/* montants de pare-brise */}
        <polygon points={pts([[-400, 540], [150, 560], [30, 1050], [-400, 1100]])} fill={shell('#34312C')} />
        <polygon points={pts([[1480, 540], [930, 560], [1050, 1050], [1480, 1100]])} fill={shell('#34312C')} />
        {wipers !== undefined ? [blade(PIV[0], wa, 400, 'w0'), blade(PIV[1], wa, 420, 'w1')] : null}
        {/* tableau de bord : planche, bloc compteurs vert, écran, horloge */}
        <path d="M-400 1040 Q540 1010 1480 1040 L1480 1330 L-400 1330 Z" fill={shell('#1F1E1C')} />
        <path d="M-400 1040 Q540 1010 1480 1040" stroke={shell('#4B4842')} strokeWidth={5} fill="none" />
        <path d="M250 1130 Q260 1062 386 1060 Q512 1062 522 1130 Z" fill="#0B0C0D" />
        {[320, 452].map((cx, i) => (
          <g key={'dial' + i}>
            <circle cx={cx} cy={1112} r={40} fill="#060707" stroke={mixHex('#1A1B1C', dashG, 0.8 * dash)} strokeWidth={4} />
            <line x1={cx} y1={1112} x2={cx + Math.cos(Math.PI * (0.85 + (i ? 0.08 : 0.3) * dash)) * 32} y2={1112 + Math.sin(Math.PI * (0.85 + (i ? 0.08 : 0.3) * dash)) * 32} stroke={mixHex('#3A1A10', '#FF7A3C', dash)} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
        {dash > 0 ? <circle cx={386} cy={1110} r={150} fill={dashG} opacity={0.22 * dash} filter="url(#b24)" /> : null}
        {/* voyant essence (orange) : réservoir presque vide */}
        <circle cx={452} cy={1150} r={7} fill="#FF9A2A" opacity={dash} />
        <rect x={640} y={1105} width={170} height={70} rx={8} fill="#08090A" stroke="#1C1D1F" strokeWidth={3} />
        <text x={725} y={1155} textAnchor="middle" fontFamily={SF.mono} fontWeight={700} fontSize={36} fill={dashG} opacity={0.9 * dash}>02:01</text>
        {door ? <rect x={260} y={1150} width={22} height={14} rx={3} fill="#FF4E42" opacity={Math.floor(T * 2.4) % 2 ? 1 : 0.25} /> : null}
        {/* volant (vu de derrière, un peu de dessus) */}
        <ellipse cx={386} cy={1170} rx={190} ry={118} fill="none" stroke="#0C0D0F" strokeWidth={30} />
        <ellipse cx={386} cy={1166} rx={190} ry={118} fill="none" stroke={mixHex('#26272B', dashG, 0.12 * dash)} strokeWidth={9} opacity={0.8} />
        <path d="M206 1180 Q386 1150 566 1180" stroke="#0C0D0F" strokeWidth={26} fill="none" />
        <ellipse cx={386} cy={1188} rx={62} ry={40} fill="#0E0F11" />
        <rect x={360} y={1220} width={52} height={120} fill="#0A0B0C" />
        {keys}
        {toiBack}
        {/* sièges avant (dossiers + appuie-têtes) et console */}
        <rect x={604} y={1290} width={60} height={700} fill={shell('#151517')} />
        <circle cx={634} cy={1300} r={22} fill={shell('#2A2A2E')} stroke="#0A0A0C" strokeWidth={3} />
        <path d="M150 1990 L150 1330 Q160 1240 380 1236 Q600 1240 612 1330 L612 1990 Z" fill={`url(#seat-${uid})`} stroke="#0A0A0C" strokeWidth={5} />
        {[1380, 1520, 1660].map((y) => <path key={y} d={`M190 ${y} Q381 ${y - 14} 572 ${y}`} stroke={shell('#141417')} strokeWidth={4} fill="none" />)}
        <path d="M660 1990 L660 1360 Q670 1280 850 1276 Q1030 1280 1040 1360 L1040 1990 Z" fill={`url(#seat-${uid})`} stroke="#0A0A0C" strokeWidth={5} />
        {[1420, 1560].map((y) => <path key={y} d={`M700 ${y} Q850 ${y - 12} 1000 ${y}`} stroke={shell('#141417')} strokeWidth={4} fill="none" />)}
        {[[386, toi ? 1262 : 1236], [850, 1276]].map(([hx, hy], i) => (
          <g key={'hr' + i}>
            {[-40, 40].map((d) => <rect key={d} x={hx + d - 6} y={hy - 40} width={12} height={44} fill="#8A8E95" />)}
            <rect x={hx - 92} y={hy - 150} width={184} height={118} rx={42} fill={`url(#seat-${uid})`} stroke="#0A0A0C" strokeWidth={5} />
          </g>
        ))}
        {/* lumière : plafonnier chaud, porte ouverte (froid à gauche), lampadaires qui balaient (orange) */}
        {dome > 0 ? <rect x={-400} y={-400} width={1900} height={2800} fill={`url(#dome-${uid})`} opacity={dome} /> : null}
        {door ? <rect x={-400} y={-400} width={700} height={2800} fill="#A8C0E0" opacity={0.08} filter="url(#b40)" /> : null}
        {sweepO > 0.01 ? <rect x={-400} y={-400} width={1900} height={2800} fill={AC.sodium} opacity={sweepO} style={{mixBlendMode: 'screen'}} /> : null}
      </g>
    </svg>
  );
};

// ---------------- gros plan : la clé de contact ----------------
/** turn : instant où la clé tourne (moteur coupé) ; red : teinte rouge (rappel éclair à la révélation) */
export const Contact: React.FC<{T: number; turn: number; red?: number; uid: string}> = ({T, turn, red = 0, uid}) => {
  const k = prog(T, turn, turn + 0.32, easeInOut);
  const dash = 1 - prog(T, turn + 0.25, turn + 0.7, easeOut);
  const ang = lerp(62, 0, k);
  // porte-clés : pendule qui repart après le quart de tour
  const kick = T > turn ? Math.exp(-(T - turn) * 2.2) * Math.sin((T - turn) * 9) * 28 : 0;
  const swing = Math.sin(T * 6.3) * 5 * dash + kick;
  const g = (c: string) => mixHex(c, '#FF2A20', 0.35 * red);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <radialGradient id={`ring-${uid}`} cx={0.4} cy={0.35} r={0.7}><stop offset={0} stopColor="#E9EDF2" /><stop offset={0.6} stopColor="#8A929C" /><stop offset={1} stopColor="#3A3F46" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={g('#0B0C0E')} />
      {/* compteurs flous en haut (bokeh vert) qui s'éteignent */}
      {[[260, 380, 150], [560, 330, 120], [820, 420, 160]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={AC.dash} opacity={0.32 * dash} filter="url(#b40)" />)}
      <circle cx={700} cy={520} r={60} fill="#FF9A2A" opacity={0.35 * dash} filter="url(#b24)" />
      {/* reflet froid du parking qui reste quand tout s'éteint */}
      <rect x={0} y={0} width={1080} height={700} fill={g('#3C4656')} opacity={0.35} filter="url(#b40)" />
      {/* colonne de direction et coquille */}
      <path d="M140 1920 L220 860 Q540 700 860 860 L940 1920 Z" fill={g(mixHex('#121315', '#2F6F55', 0.3 * dash))} />
      <path d="M220 860 Q540 700 860 860" stroke={g(mixHex('#2B2D31', AC.dash, 0.5 * dash))} strokeWidth={6} fill="none" />
      {/* barillet chromé et repères */}
      <circle cx={540} cy={1060} r={150} fill={`url(#ring-${uid})`} stroke="#0A0B0C" strokeWidth={6} />
      <circle cx={540} cy={1060} r={104} fill="#16181B" />
      {['0', 'I', 'II', 'III'].map((t, i) => {
        const a = ((-90 - 62 + i * 31) * Math.PI) / 180;
        return <text key={t} x={540 + Math.cos(a) * 128} y={1060 + Math.sin(a) * 128 + 12} textAnchor="middle" fontFamily={SF.cap} fontWeight={800} fontSize={30} fill={i === 2 ? mixHex('#30343A', AC.dash, dash) : '#2A2E33'}>{t}</text>;
      })}
      {/* clé + main qui tourne */}
      <g transform={`rotate(${ang},540,1060)`}>
        <rect x={528} y={940} width={24} height={240} rx={6} fill="#B9C0C8" stroke="#2A2E33" strokeWidth={3} />
        <path d="M470 760 Q470 690 540 690 Q610 690 610 760 L610 930 Q610 960 580 960 L500 960 Q470 960 470 930 Z" fill="#141518" stroke="#050506" strokeWidth={5} />
        <rect x={506} y={720} width={68} height={22} rx={8} fill="#2A2C31" />
        {/* porte-clés rouge qui pend sous la clé */}
        <g transform={`rotate(${-ang + swing},540,960)`}>
          <circle cx={540} cy={990} r={26} fill="none" stroke="#A9B0B8" strokeWidth={7} />
          <rect x={508} y={1010} width={64} height={110} rx={14} fill={g('#C8261E')} stroke="#2A0806" strokeWidth={4} />
          <rect x={522} y={1028} width={36} height={8} rx={4} fill="#F0B0A8" opacity={0.6} />
        </g>
        {/* la main : manche noire qui vient de la droite, poing, index replié derrière, pouce posé sur la tête de clé */}
        <path d="M1180 980 Q920 930 760 840" stroke="#0A0A0C" strokeWidth={196} fill="none" strokeLinecap="round" />
        <path d="M1180 980 Q920 930 760 840" stroke={g('#26262C')} strokeWidth={184} fill="none" strokeLinecap="round" />
        <path d="M1000 900 Q930 880 900 860" stroke="#3A3A42" strokeWidth={10} fill="none" opacity={0.7} />
        <path d="M612 700 Q640 640 720 660 L790 700 Q830 760 800 860 Q760 930 680 930 L620 900 Z" fill={g('#E3CDB8')} stroke="#2A1D14" strokeWidth={6} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => <path key={i} d={`M${620 + i * 6} ${745 + i * 52} Q${650} ${740 + i * 52} ${690} ${752 + i * 50}`} stroke="#9C7E66" strokeWidth={5} fill="none" strokeLinecap="round" />)}
        <path d="M640 900 Q560 900 520 860 Q500 830 530 812 Q570 800 610 830 L690 880" fill={g('#EAD7C3')} stroke="#2A1D14" strokeWidth={6} strokeLinejoin="round" />
        <path d="M528 838 Q540 822 560 826" stroke="#B89A80" strokeWidth={4} fill="none" />
      </g>
      {/* le tableau de bord éclaire la main en vert, puis plus rien */}
      <rect width={1080} height={1920} fill={AC.dash} opacity={0.07 * dash} style={{mixBlendMode: 'screen'}} />
    </svg>
  );
};

// ---------------- gros plan : le gobelet qui fume encore (trace de rouge à lèvres sur le couvercle) ----------------
export const Gobelet: React.FC<{T: number; t0: number; uid: string}> = ({T, t0, uid}) => {
  const t = T - t0;
  const z = lerp(1, 1.12, prog(T, t0, t0 + 2.2, easeInOut));
  const wisps = Array.from({length: 7}, (_, i) => {
    const ph = ((T * 0.45 + i / 7) % 1);
    const x0 = 540 + (rand(i) - 0.5) * 60, y0 = 700 - ph * 520;
    const a = Math.sin(T * 1.3 + i * 1.7) * 60 * ph;
    return <path key={i} d={`M${x0} ${y0 + 120} C${x0 + a} ${y0 + 60} ${x0 - a} ${y0 - 20} ${x0 + a * 0.6} ${y0 - 90}`} stroke="#E6ECF2" strokeWidth={22 + 30 * ph} fill="none" strokeLinecap="round" opacity={0.22 * Math.sin(Math.PI * ph)} filter="url(#b14)" />;
  });
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id={`cup-${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset={0} stopColor="#8A6A4E" /><stop offset={0.35} stopColor="#E8D9C4" /><stop offset={0.7} stopColor="#C9B49A" /><stop offset={1} stopColor="#5E4632" /></linearGradient>
        <linearGradient id={`win-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset={0} stopColor="#3C4656" /><stop offset={1} stopColor={AC.fogHi} /></linearGradient>
      </defs>
      <g transform={`translate(540,960) scale(${z}) translate(-540,-960)`}>
        {/* pare-brise derrière : brouillard, le faisceau flou, gouttes */}
        <rect x={-100} y={-100} width={1280} height={1300} fill={`url(#win-${uid})`} />
        <ellipse cx={560} cy={900} rx={420} ry={160} fill={AC.beam} opacity={0.4} filter="url(#b40)" />
        {Array.from({length: 40}, (_, k) => <circle key={k} cx={rand(k * 2.1) * 1080} cy={rand(k * 3.3) * 1100} r={4 + 12 * rand(k)} fill="#DDE5EE" opacity={0.18} filter="url(#b4)" />)}
        {/* planche de bord */}
        <path d="M-100 1150 Q540 1080 1180 1150 L1180 2100 L-100 2100 Z" fill="#191816" />
        <path d="M-100 1150 Q540 1080 1180 1150" stroke="#6E655A" strokeWidth={6} fill="none" opacity={0.7} />
        <ellipse cx={560} cy={1225} rx={190} ry={36} fill="#000" opacity={0.6} filter="url(#b8)" />
        {/* le gobelet */}
        <path d="M400 760 L680 760 L650 1220 L430 1220 Z" fill={`url(#cup-${uid})`} stroke="#2A1D14" strokeWidth={5} strokeLinejoin="round" />
        <path d="M418 930 L662 930 L655 1040 L425 1040 Z" fill="#7A2E22" opacity={0.85} />
        <text x={540} y={1002} textAnchor="middle" fontFamily={SF.title} fontSize={52} fill="#F2E6D6" letterSpacing={4}>CAFÉ</text>
        <path d="M384 760 Q540 730 696 760 L700 712 Q540 684 380 712 Z" fill="#F4F1EA" stroke="#2A1D14" strokeWidth={5} />
        <ellipse cx={600} cy={722} rx={34} ry={9} fill="#2A1D14" />
        {/* trace de rouge à lèvres sur le bord du couvercle */}
        <path d="M570 732 Q600 742 632 732" stroke="#B3122A" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
        {wisps}
        {/* plafonnier chaud */}
        <rect x={-100} y={-100} width={1280} height={2200} fill="#FFC98A" opacity={0.1} style={{mixBlendMode: 'screen'}} />
      </g>
      <rect width={1080} height={1920} fill="#000" opacity={0.2 * (1 - clamp01(t * 3))} />
    </svg>
  );
};

// ---------------- la porte vitrée de la boutique et le panneau de consignes ----------------
export const Boutique: React.FC<{T: number; t0: number; push: [number, number]; uid: string; toiP?: Pose}> = ({T, t0, push, uid, toiP}) => {
  const k = prog(T, push[0], push[1], easeInOut);
  const cam = {x: lerp(540, 560, k), y: lerp(960, 990, k), z: lerp(1, 1.1, k) + 0.012 * (T - t0)};
  const tube = rand(Math.floor(T * 18) * 3.7) > 0.15 ? 1 : 0.2;
  const neon = rand(Math.floor(T * 11) * 5.1 + 2) > 0.1 ? 1 : 0.3;
  const sway = Math.sin(T * 1.9) * 0.8;
  const SH = (x: number) => mixHex('#0F1412', AC.shop, x);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <linearGradient id={`floor-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset={0} stopColor={SH(0.45)} /><stop offset={1} stopColor={SH(0.2)} /></linearGradient>
      </defs>
      <g transform={view(cam)}>
        {/* façade sombre, néon OUVERT 24H rouge qui grésille */}
        <rect x={-300} y={-300} width={1680} height={2600} fill="#14171B" />
        <rect x={-300} y={1720} width={1680} height={600} fill="#0E1013" />
        <text x={540} y={210} textAnchor="middle" fontFamily={SF.title} fontSize={110} fill="#FF4A3A" opacity={neon} letterSpacing={8} style={{filter: 'drop-shadow(0 0 18px rgba(255,60,40,0.9))'}}>OUVERT 24H</text>
        {/* intérieur vu à travers la vitre : plafond aux tubes, rayons vides en perspective, comptoir, machine à café */}
        <g>
          <rect x={160} y={300} width={760} height={1420} fill={SH(0.55)} />
          <polygon points={pts([[160, 300], [920, 300], [640, 760], [440, 760]])} fill={SH(0.75)} />
          {[0, 1, 2].map((i) => {
            const y = lerp(330, 720, i / 3), w = lerp(300, 80, i / 3);
            return <rect key={i} x={540 - w / 2} y={y} width={w} height={12 - i * 3} rx={4} fill="#F4FFFA" opacity={i === 1 ? tube : 0.95} />;
          })}
          <circle cx={540} cy={500} r={300} fill="#E6FFF4" opacity={0.25} filter="url(#b40)" />
          <polygon points={pts([[160, 1720], [920, 1720], [640, 900], [440, 900]])} fill={`url(#floor-${uid})`} />
          {[[-1, 300], [1, 780]].map(([s, x]) => (
            <g key={s}>
              <polygon points={pts([[x, 760], [x + s * 140, 1420], [x + s * 140, 1700], [x, 1000]])} fill={SH(0.32)} />
              {[0, 1, 2, 3].map((r) => <line key={r} x1={x} y1={790 + r * 60} x2={x + s * 140} y2={1450 + r * 70} stroke={SH(0.6)} strokeWidth={6} />)}
              {Array.from({length: 10}, (_, j) => <rect key={j} x={x + s * (j * 12) - 6} y={780 + r2(j) * 220 + j * 22} width={10} height={22} fill={['#D84A3A', '#3A7AD8', '#E8C04A'][j % 3]} opacity={0.65} />)}
            </g>
          ))}
          <rect x={590} y={820} width={120} height={160} fill={SH(0.25)} />
          <rect x={606} y={840} width={40} height={40} fill="#FF6A3A" opacity={0.8} />
          <rect x={160} y={300} width={760} height={1420} fill={AC.shop} opacity={0.12 * tube} />
        </g>
        {/* reflets du parking sur la vitre (faisceaux chauds, feux rouges) */}
        <g opacity={0.35} style={{mixBlendMode: 'screen'}}>
          {[[260, 1260], [520, 1300], [800, 1250]].map(([x, y], i) => <ellipse key={i} cx={x + 6 * Math.sin(T * 0.3 + i)} cy={y} rx={110} ry={60} fill={AC.beam} filter="url(#b40)" />)}
          {[[330, 1380], [420, 1380], [690, 1400], [760, 1400]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={AC.tail} filter="url(#b8)" />)}
        </g>
        {/* cadre de porte en alu, poignée */}
        <rect x={140} y={280} width={800} height={1460} fill="none" stroke="#5A6168" strokeWidth={40} />
        <rect x={140} y={280} width={800} height={1460} fill="none" stroke="#9AA2AA" strokeWidth={6} />
        <rect x={860} y={900} width={22} height={260} rx={8} fill="#B8C0C8" stroke="#2A2E33" strokeWidth={3} />
        {/* le panneau jaune scotché sur la vitre ; la première consigne arrachée */}
        <g transform={`translate(0,150) rotate(${-2.5 + sway * 0.2},540,820)`}>
          <path d="M300 520 L780 520 L780 1180 L300 1180 L300 690 L420 660 L520 700 L640 650 L780 690 L780 600 L300 600 Z" fill="none" />
          {/* morceau du haut (en-tête) */}
          <rect x={300} y={500} width={480} height={150} fill="#F2D23C" stroke="#8C7414" strokeWidth={2} />
          <text x={540} y={566} textAnchor="middle" fontFamily={SF.title} fontSize={58} fill="#1A1608" letterSpacing={3}>AIRE 13</text>
          <text x={540} y={616} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={28} fill="#1A1608" letterSpacing={2}>CONSIGNES DE NUIT</text>
          {/* bande arrachée : bord déchiré, restes de papier, le chiffre 1 seul */}
          <path d="M300 650 L780 650 L780 672 L740 690 L700 668 L655 694 L610 671 L560 699 L515 674 L470 697 L420 676 L375 700 L330 678 L300 694 Z" fill="#F2D23C" stroke="#8C7414" strokeWidth={2} />
          <text x={318} y={688} fontFamily={SF.cap} fontWeight={900} fontSize={30} fill="#1A1608">1.</text>
          <path d="M300 760 L330 742 L375 764 L420 740 L470 763 L515 738 L560 765 L610 737 L655 762 L700 736 L740 760 L780 740 L780 1190 L300 1190 Z" fill="#F2D23C" stroke="#8C7414" strokeWidth={2} />
          <text x={318} y={830} fontFamily={SF.cap} fontWeight={900} fontSize={31} fill="#1A1608">2. Restez dans la lumière</text>
          <text x={350} y={868} fontFamily={SF.cap} fontWeight={900} fontSize={31} fill="#1A1608">des phares.</text>
          <text x={318} y={930} fontFamily={SF.cap} fontWeight={900} fontSize={31} fill="#1A1608">3. Ne montez dans aucun</text>
          <text x={350} y={968} fontFamily={SF.cap} fontWeight={900} fontSize={31} fill="#1A1608">autre véhicule.</text>
          <text x={318} y={1060} fontFamily={SF.cap} fontWeight={700} fontSize={22} fill="#4A4220">Merci de votre compréhension.</text>
          <text x={318} y={1094} fontFamily={SF.cap} fontWeight={700} fontSize={22} fill="#4A4220">La direction.</text>
          {/* scotch aux coins */}
          {[[300, 500, -20], [780, 500, 20], [300, 1190, 20], [780, 1190, -20]].map(([x, y, a], i) => <rect key={i} x={x - 40} y={y - 14} width={80} height={28} fill="#E8EEF2" opacity={0.55} transform={`rotate(${a},${x},${y})`} />)}
        </g>
      </g>
    </svg>
  );
};
const r2 = (j: number) => rand(j * 4.7);

// ---------------- inventaire : essence, téléphone, moteur ----------------
const step = (t: number, keys: [number, number][]) => {
  let i = 0;
  while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  return keys[i][1];
};
export const AInventory: React.FC<{t0: number; t1: number; fuel: [number, number][]; batt: [number, number][]; motor: [number, number][]; alarm?: [number, number]}> = ({t0, t1, fuel, batt, motor, alarm}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < t0 - 0.02 || t > t1 + 0.4) return null;
  const a = prog(t, t0, t0 + 0.4, easeOut) * (1 - prog(t, t1, t1 + 0.35));
  const f = step(t, fuel), b = step(t, batt), m = step(t, motor);
  const offAt = motor.find(([, v]) => v === 0)?.[0] ?? 999;
  const hot = t >= offAt && t < offAt + 0.9;
  const pulse = alarm && t >= alarm[0] && t < alarm[1] ? 0.5 + 0.5 * Math.sin((t - alarm[0]) * Math.PI * 4) : 0;
  const pop = hot ? 1 + 0.22 * (1 - clamp01((t - offAt) / 0.5)) : 1 + 0.12 * pulse;
  const row = (lab: string, val: string, icon: React.ReactNode, col: string, s = 1, glow?: string) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${s})`, transformOrigin: '100% 50%'}}>
      <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(235,235,235,0.7)'}}>{lab}</div>
      <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 40, color: col, minWidth: 116, textAlign: 'right', textShadow: glow}}>{val}</div>
      {icon}
    </div>
  );
  return (
    <div style={{position: 'absolute', right: 68, top: 262, opacity: a, transform: `translateX(${(1 - a) * 40}px)`, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.75))'}}>
      {row('ESSENCE', `${f} %`, (
        <svg width={42} height={42} viewBox="0 0 34 34"><rect x={5} y={6} width={16} height={24} rx={2} fill="none" stroke="#E8E8E8" strokeWidth={2.5} /><rect x={8} y={21} width={10} height={6} fill="#F2A23C" /><path d="M21 12 L27 16 L27 26 Q27 29 24 28" stroke="#E8E8E8" strokeWidth={2.5} fill="none" /></svg>
      ), f <= 5 ? SV.amber : SV.white)}
      {row('TÉLÉPHONE', `${b} %`, (
        <svg width={42} height={42} viewBox="0 0 34 34"><rect x={3} y={9} width={26} height={16} rx={3} fill="none" stroke="#E8E8E8" strokeWidth={2.5} /><rect x={29} y={14} width={3} height={6} rx={1} fill="#E8E8E8" /><rect x={6} y={12} width={Math.max(1.5, 20 * b / 100)} height={10} rx={1.5} fill={b > 50 ? '#74F574' : b > 20 ? '#F2A23C' : '#FF4E42'} /></svg>
      ), SV.white)}
      {row('MOTEUR', m ? 'ON' : 'OFF', (
        <svg width={42} height={42} viewBox="0 0 34 34"><path d="M5 13 L10 13 L12 9 L20 9 L22 13 L27 13 L27 25 L10 25 L5 21 Z" fill={m ? '#74F574' : '#FF4E42'} stroke="#0A0A10" strokeWidth={2} /><rect x={13} y={5} width={6} height={4} fill={m ? '#74F574' : '#FF4E42'} /></svg>
      ), m ? '#74F574' : SV.neon, pop, m ? undefined : `0 0 ${14 + 14 * pulse}px rgba(255,78,66,${0.6 + 0.4 * pulse})`)}
    </div>
  );
};

/** « IMAGINE… » dès l'image 0, au même endroit que les sous-titres (y 1400) */
export const FirstCapLow: React.FC<{text: string; until: number}> = ({text, until}) => {
  const t = useCurrentFrame() / FPS;
  if (t >= until) return null;
  const size = 78;
  return (
    <div style={{position: 'absolute', left: 120, right: 120, top: 1400 - size * 0.62, textAlign: 'center', pointerEvents: 'none'}}>
      <span style={{fontFamily: SF.cap, fontWeight: 900, fontSize: size, color: SV.lime, WebkitTextStroke: `${size * 0.15}px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: '0 5px 14px rgba(0,0,0,0.55)'}}>{text}</span>
    </div>
  );
};
