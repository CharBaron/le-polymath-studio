// Scènes d'intérieur et de nuit : cuisine (frigo), cage d'escalier → toit, la ville qui s'éteint, le salon dans le noir,
// les jumelles (la petite fille et sa lampe en morse), le faisceau sur ta fenêtre, fond de la carte de fin.
import React from 'react';
import {clamp01, easeIn, easeInOut, easeOut, lerp, prog, rand} from '../theme';
import {bones, mix, P, Pose, Stick, walk} from './stick';
import {breathe, Hero, Person} from './hero';
import {Blurs, Cam, Dust, Glow, RGrad, SceneP, Skyline, Smoke, Tower, VGrad, winAt} from './world';

// ---------------- cuisine : le frigo d'abord ----------------
export const Cuisine: React.FC<SceneP & {t0: number; ff: [number, number]}> = ({T, t0, ff}) => {
  const lt = T - t0;
  const z = lerp(1.04, 1.12, clamp01(lt / 6));
  // va-et-vient frigo ↔ plan de travail (accéléré pendant l'ellipse)
  const speed = T > ff[0] && T < ff[1] ? 5.5 : 0.55;
  const ph = T < ff[0] ? lt * 0.55 : (ff[0] - t0) * 0.55 + (Math.min(T, ff[1]) - ff[0]) * 5.5 + Math.max(0, T - ff[1]) * 0.55;
  const tri = (x: number) => 1 - Math.abs(((x % 2) + 2) % 2 - 1); // 0 → 1 → 0
  const at = (p: number) => {
    const k = easeInOut(tri(p * 0.5));
    return {x: lerp(560, 780, k), walking: Math.abs(Math.sin(p * Math.PI)) > 0.25};
  };
  const pile = clamp01((T - ff[0]) / (ff[1] - ff[0]));
  const noon = prog(T, ff[0], ff[1], (x) => x);
  const flick = T > ff[1] - 0.3 ? (rand(Math.floor(T * 14)) > 0.55 ? 0.35 : 1) : 1;
  const me = at(ph);
  const facingFridge = Math.cos(ph * Math.PI * 0.5) > 0;
  const pose: Pose = me.walking && speed > 1 ? walk(T * 2.4, 22) : facingFridge ? P.reach : P.hold;
  const ghosts = T > ff[0] && T < ff[1] ? [0.07, 0.14, 0.21] : [];
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="kWall" stops={[[0, '#2E474B'], [1, '#22363A']]} />
        <VGrad id="kFridge" stops={[[0, '#E3E6EA'], [1, '#B9BEC6']]} />
        <VGrad id="kSky" stops={[[0, lerp(0, 1, noon) > 0.5 ? '#C9D6E2' : '#9FB0C4'], [1, '#E2E6EA']]} />
        <RGrad id="kCold" stops={[[0, 'rgba(225,242,255,0.55)'], [1, 'rgba(225,242,255,0)']]} />
      </defs>
      <g transform={`translate(540,1060) scale(${z}) translate(-540,-1060)`}>
        <rect width={1080} height={1920} fill="url(#kWall)" />
        {Array.from({length: 16}, (_, i) => <rect key={i} x={0} y={300 + i * 52} width={1080} height={2} fill="rgba(255,255,255,0.05)" />)}
        {Array.from({length: 22}, (_, i) => <rect key={`v${i}`} x={i * 52} y={300} width={2} height={780} fill="rgba(255,255,255,0.04)" />)}
        {/* fenêtre : la journée avance */}
        <rect x={720} y={380} width={300} height={380} fill="#16242A" />
        <rect x={734} y={394} width={272} height={352} fill="url(#kSky)" />
        <Skyline y={746} seed={51} color="#7D8796" lit="#FFFFFF" litRatio={0} hMin={60} hMax={200} x0={734} x1={1006} wMin={40} wMax={80} />
        <Smoke x={900} y={700} T={T} seed={44} scale={0.4} color="#55575F" o={0.5} />
        <rect x={866} y={394} width={8} height={352} fill="#16242A" />
        <rect x={0} y={1060} width={1080} height={34} fill="#7C6852" />
        <rect x={0} y={1094} width={1080} height={380} fill="#2E4044" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={470 + i * 150} y={1120} width={130} height={330} rx={6} fill="#33484D" stroke="#24363A" strokeWidth={4} />)}
        <rect x={0} y={1474} width={1080} height={460} fill="#232327" />
        {/* frigo ouvert, lumière froide */}
        <rect x={70} y={540} width={360} height={940} rx={18} fill="url(#kFridge)" />
        <rect x={96} y={570} width={308} height={880} rx={10} fill={flick > 0.5 ? '#EEF6FF' : '#9AA2AA'} />
        {[790, 1010, 1230].map((y) => <rect key={y} x={96} y={y} width={308} height={8} fill="#C9D3DD" />)}
        {/* contenu : se vide pendant l'ellipse */}
        {[[140, 720, 50, 70, '#F2F2F2'], [205, 700, 40, 90, '#E8D25A'], [260, 735, 90, 55, '#C94A4A'], [140, 950, 120, 60, '#D9A05A'], [280, 930, 70, 80, '#6FAF5A'], [150, 1180, 60, 50, '#EDEDE0'], [230, 1160, 110, 70, '#B03A3A'], [180, 1390, 80, 60, '#5A9A4A']].map(([x, y, w, h, c], i) => (
          <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} rx={8} fill={c as string} opacity={1 - clamp01(pile * 1.2 - i * 0.1)} />
        ))}
        <path d="M70 540 L-90 470 L-90 1560 L70 1480 Z" fill="#C3C8CF" />
        <path d="M430 600 L1080 1470 L1080 1920 L300 1920 Z" fill="url(#kCold)" opacity={0.7 * flick} filter="url(#b24)" />
        <Glow x={250} y={1000} r={260} color="#DCEEFF" o={0.25 * flick} blur={40} />
        {/* plan de travail : la pile grandit */}
        {Array.from({length: 9}, (_, i) => {
          const a = clamp01(pile * 9 - i);
          return <rect key={`f${i}`} x={600 + (i % 4) * 85} y={1000 - Math.floor(i / 4) * 52} width={70} height={56} rx={8} fill={['#C94A4A', '#E8D25A', '#F2F2F2', '#6FAF5A', '#D9A05A'][i % 5]} opacity={a} transform={`translate(0,${(1 - a) * -30})`} />;
        })}
        {ghosts.map((g) => {
          const m = at(ph - g * speed);
          return <Stick key={g} p={walk((T - g) * 2.4, 22)} x={m.x} y={1560} h={600} opacity={0.22} flip={facingFridge} />;
        })}
        <Stick p={pose} x={me.x} y={1560} h={600} flip={facingFridge} />
        {/* premier plan flou : bocaux et conserves */}
        <g filter="url(#b14)" opacity={0.9}>
          {[[60, 1700, 120, 220], [210, 1740, 100, 180], [800, 1690, 130, 240], [950, 1730, 110, 200]].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} rx={16} fill="#3A4A50" />
              <rect x={x + 10} y={y + 20} width={w - 20} height={h * 0.4} rx={6} fill="#B04A3A" opacity={0.7} />
              <rect x={x} y={y} width={w} height={22} rx={8} fill="#8A9398" />
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
};

// ---------------- cage d'escalier → trappe du toit ----------------
export const Escalier: React.FC<SceneP & {t0: number; ladder: number; hatch: number}> = ({T, t0, ladder, hatch}) => {
  const lt = T - t0;
  // montée des marches (bas gauche → palier haut droite), puis échelle
  const ks = clamp01(lt / (ladder - t0 - 0.2));
  const sx = lerp(150, 760, ks), sy = lerp(1700, 1080, ks);
  const kl = prog(T, ladder, hatch, easeInOut);
  const onLadder = T >= ladder;
  const x = onLadder ? lerp(800, 890, prog(T, ladder, ladder + 0.4)) : sx;
  const y = onLadder ? lerp(1080, 860, kl) : sy;
  const climbPh = (T - ladder) * 2.2;
  const pose: Pose = onLadder ? (T > hatch ? {...P.climb, aR: 175, aRb: 0, aL: 168} : {...P.climb, aL: 168 + 10 * Math.sin(climbPh * 6.28), aR: 150 - 10 * Math.sin(climbPh * 6.28)}) : walk(lt * 1.8, 24, P.stand, 6);
  const open = prog(T, hatch, hatch + 0.5, easeOut);
  const z = lerp(1.0, 1.12, clamp01(lt / 5));
  const tube = rand(Math.floor(T * 12)) > 0.9 ? 0.4 : 1;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="sWall" stops={[[0, '#3F404A'], [1, '#2A2B33']]} />
        <RGrad id="sky1" stops={[[0, 'rgba(255,236,200,0.9)'], [1, 'rgba(255,236,200,0)']]} />
      </defs>
      {/* caméra qui suit le personnage (la tête reste dans le cadre en haut de l'échelle) */}
      <g transform={`translate(540,1000) scale(${z}) translate(${-lerp(560, x, 0.55)},${-Math.min(1250, y - 330)})`}>
        <rect x={-200} y={0} width={1480} height={2100} fill="url(#sWall)" />
        {Array.from({length: 14}, (_, i) => <rect key={i} x={-200} y={120 + i * 130} width={1480} height={3} fill="rgba(0,0,0,0.18)" />)}
        {/* néon qui grésille */}
        <rect x={160} y={380} width={260} height={18} rx={9} fill="#E8F0F6" opacity={tube} />
        <Glow x={290} y={400} r={220} color="#DDE8F2" o={0.25 * tube} blur={40} />
        {/* marches */}
        <path d={Array.from({length: 13}, (_, i) => `${i === 0 ? 'M' : 'L'}${100 + i * 52} ${1720 - i * 50} L${152 + i * 52} ${1720 - i * 50}`).join(' ') + ' L800 1070 L1100 1070 L1100 1900 L100 1900 Z'} fill="#55565F" />
        <path d="M80 1560 L780 900" stroke="#9A9AA4" strokeWidth={8} />
        <rect x={760} y={1070} width={340} height={30} fill="#62636C" />
        {/* panneau SORTIE et ACCÈS TOIT */}
        <rect x={560} y={560} width={170} height={64} rx={6} fill="#0E3A1E" />
        <rect x={566} y={566} width={158} height={52} rx={4} fill="#2FD86A" />
        <text x={645} y={603} textAnchor="middle" fontFamily="Arial Black, sans-serif" fontSize={30} fill="#0B2A14">SORTIE</text>
        <Glow x={645} y={592} r={120} color="#3BE07A" o={0.35} blur={24} />
        <rect x={700} y={660} width={110} height={60} rx={4} fill="#B3201F" />
        <text x={755} y={688} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={17} fill="#FFFFFF">ACCÈS</text>
        <text x={755} y={710} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={700} fontSize={17} fill="#FFFFFF">TOIT</text>
        {/* plafond, trappe, échelle */}
        <rect x={-200} y={0} width={1480} height={500} fill="#24252C" />
        <rect x={820} y={480} width={180} height={24} fill="#15161B" />
        {open > 0 ? <rect x={826} y={0} width={168} height={490} fill="url(#sky1)" opacity={open} /> : null}
        <g transform={`translate(1000,492) rotate(${-110 * open})`}>
          <rect x={-180} y={-12} width={180} height={22} fill="#6A6B74" />
        </g>
        {open > 0 ? (
          <g opacity={open}>
            <path d="M826 500 L994 500 L1240 1900 L560 1900 Z" fill="rgba(255,236,200,0.16)" filter="url(#b24)" />
            <Dust x0={700} y0={500} x1={1150} y1={1600} T={T} n={50} />
          </g>
        ) : null}
        {[850, 960].map((lx) => <rect key={lx} x={lx} y={500} width={12} height={580} fill="#8A8B94" />)}
        {Array.from({length: 9}, (_, i) => <rect key={`r${i}`} x={850} y={540 + i * 62} width={122} height={9} fill="#8A8B94" />)}
        <Stick p={pose} x={x} y={y} h={520} />
      </g>
    </svg>
  );
};

// ---------------- le toit : personne ne monte jamais jusque-là ----------------
export const Toit: React.FC<SceneP & {t0: number}> = ({T, t0}) => {
  const lt = T - t0;
  const z = lerp(1.18, 1.0, prog(lt, 0, 2.6, easeOut));
  const heli = clamp01(lt / 2.6);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="tSky" stops={[[0, '#3A3A55'], [0.5, '#8A6A72'], [1, '#D89A6A']]} />
        <VGrad id="tRoof" stops={[[0, '#55505C'], [1, '#2E2B33']]} />
      </defs>
      <g transform={`translate(540,1100) scale(${z}) translate(-540,-1100)`}>
        <rect width={1080} height={1920} fill="url(#tSky)" />
        <Smoke x={200} y={1100} T={T} seed={61} scale={1.1} color="#2A2630" />
        <Smoke x={860} y={1150} T={T + 3} seed={67} scale={0.9} color="#2A2630" />
        <Skyline y={1260} seed={71} color="#4A4258" lit="#F4C070" litRatio={0.05} hMin={160} hMax={420} wMin={60} wMax={140} winScale={0.7} />
        <Skyline y={1360} seed={73} color="#2E2A3A" lit="#F4C070" litRatio={0.04} hMin={200} hMax={520} />
        {/* hélicoptère lointain : petite silhouette, feu clignotant (pour le jour 2) */}
        <g transform={`translate(${lerp(180, 420, heli)},${lerp(640, 600, heli)})`}>
          <ellipse cx={0} cy={0} rx={22} ry={9} fill="#1E1B26" />
          <rect x={14} y={-3} width={30} height={4} fill="#1E1B26" />
          <rect x={-30} y={-12} width={60} height={2} fill="#1E1B26" />
          <circle cx={-4} cy={8} r={4} fill="#FF4040" opacity={Math.floor(T * 2.5) % 2 ? 1 : 0.2} />
        </g>
        <path d="M-100 1380 L1180 1380 L1180 1940 L-100 1940 Z" fill="url(#tRoof)" />
        <rect x={-100} y={1360} width={1280} height={36} fill="#6A6470" />
        {/* château d'eau, antenne */}
        <g transform="translate(160,1380)">
          <rect x={0} y={-300} width={190} height={210} rx={14} fill="#3A3540" />
          <path d="M-10 -300 L95 -360 L200 -300 Z" fill="#2F2B35" />
          {[10, 170].map((lx) => <rect key={lx} x={lx} y={-90} width={12} height={90} fill="#2A2630" />)}
        </g>
        <rect x={880} y={1020} width={8} height={360} fill="#2A2630" />
        <circle cx={884} cy={1020} r={7} fill="#FF4040" opacity={Math.floor(T * 1.5) % 2 ? 0.9 : 0.25} />
        <Stick p={P.standArmsDown} x={560} y={1600} h={460} />
      </g>
    </svg>
  );
};

// ---------------- la ville qui s'éteint, fenêtre par fenêtre ----------------
export const VilleSoir: React.FC<SceneP & {t0: number; offFrom: number; offTo: number}> = ({T, t0, offFrom, offTo}) => {
  const lt = T - t0;
  const night = prog(T, t0, offTo, (x) => x);
  const offAt = (k: number) => (T - (offFrom + rand(k * 0.37) * (offTo - offFrom))) / 0.06;
  const z = lerp(1.1, 1.0, prog(lt, 0, 4, easeOut));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="vsSky" stops={[[0, '#14122C'], [0.3, '#4A2648'], [0.48, '#B24E3E'], [0.6, '#E8865A']]} />
        <VGrad id="vsNight" stops={[[0, '#05060F'], [0.45, '#0E1428'], [0.6, '#1E2850']]} />
      </defs>
      <g transform={`translate(540,1000) scale(${z}) translate(-540,-1000)`}>
        <rect x={-100} y={-100} width={1280} height={2120} fill="url(#vsSky)" />
        <rect x={-100} y={-100} width={1280} height={2120} fill="url(#vsNight)" opacity={night} />
        <circle cx={860} cy={lerp(520, 420, night)} r={34} fill="#F2EEDC" opacity={night} />
        <Glow x={860} y={lerp(520, 420, night)} r={110} color="#DDE4FF" o={0.35 * night} blur={24} />
        <Smoke x={260} y={1200} T={T} seed={81} scale={1} color="#0E0C14" o={0.5} />
        {/* silhouettes nettes sur le ciel du couchant : on lit les immeubles, pas seulement des points */}
        <Skyline y={1420} seed={83} color="#241E36" lit="#F2BE6A" litRatio={0.32} hMin={260} hMax={520} wMin={70} wMax={150} winScale={0.8} off={offAt} />
        <Skyline y={1620} seed={89} color="#120F1C" lit="#F2BE6A" litRatio={0.3} hMin={380} hMax={760} off={offAt} />
        <rect x={-100} y={1620} width={1280} height={400} fill="#0A0A10" />
      </g>
    </svg>
  );
};

// ---------------- le salon dans le noir : une lumière s'allume en face ----------------
const OPP = {x: 140, y: 380, w: 520, floors: 9, fh: 95, cols: 5};
const [LX, LY] = winAt(OPP.x, OPP.y, OPP.w, OPP.floors, OPP.fh, OPP.cols, 7, 3);
export const LIT_WIN = {x: LX, y: LY};

/** l'immeuble d'en face, vu depuis ta fenêtre (une seule fenêtre allumée à partir de `lit`) */
export const Opposite: React.FC<{T: number; lit: number; beam?: number; level?: number}> = ({T, lit, beam = 0, level}) => {
  // `level` (0..1) impose la lumière de la fenêtre de Lina (morse, lampe qui tombe) ; sinon elle s'allume à `lit`
  const on = level ?? (T < lit ? 0 : T < lit + 0.35 ? (rand(Math.floor(T * 20)) > 0.45 ? 1 : 0.2) : 1);
  return (
    <g>
      <defs>
        <VGrad id="oSky" stops={[[0, '#05070F'], [1, '#121935']]} />
        <VGrad id="oBody" stops={[[0, '#1E2236'], [1, '#141726']]} />
      </defs>
      <rect x={-100} y={-100} width={1280} height={2200} fill="url(#oSky)" />
      <circle cx={880} cy={300} r={40} fill="#EEF0F8" />
      <Glow x={880} y={300} r={130} color="#C8D2FF" o={0.4} blur={24} />
      <Tower {...OPP} body="url(#oBody)" edge="#4A5A9A" dark="#0D0F1A" roof={false} win={(f, c) => (f === 7 && c === 3 && on > 0.5 ? '#F6C46A' : null)} />
      {on > 0.02 && on <= 0.5 ? <rect x={LX} y={LY} width={44} height={58.67} fill="#F6C46A" opacity={on * 1.6} /> : null}
      {on > 0 ? <Glow x={LX + 22} y={LY + 29} r={110} color="#F6B858" o={0.55 * on} blur={24} /> : null}
      {beam > 0 ? <Glow x={LX + 22} y={LY + 29} r={60 + 400 * beam} color="#FFF6DC" o={Math.min(1, beam * 1.4)} blur={40} /> : null}
    </g>
  );
};

/** assis par terre sous la fenêtre ; avec le perso (V2) : mange sa ration à la cuillère pendant `eat`, puis tourne la tête vers la lumière */
const SitEat: React.FC<{T: number; hero?: boolean; look: number; eat?: [number, number]}> = ({T, hero, look, eat}) => {
  if (!hero) return <Stick p={{...P.sitKnees, head: lerp(P.sitKnees.head, 18, look)}} x={300} y={1640} hipY={0} h={560} look="rimBlue" />;
  const h = 600;
  const eating = eat && T >= eat[0] && T < eat[1] ? 1 : 0;
  const ph = eat ? (T - eat[0]) * 0.75 : 0;
  const toMouth = eating ? Math.pow(Math.max(0, Math.sin(ph * Math.PI * 2)), 0.8) : 0;
  const base: Pose = {...P.sitKnees, aL: 58, aLb: 40, head: lerp(-4 + 6 * toMouth, 20, look)};
  const pose: Pose = breathe({...base, aR: lerp(70, 132, toMouth), aRb: lerp(20, -118, toMouth)}, T, 0.6);
  const b = bones(pose, h);
  return (
    <Hero p={pose} x={300} y={1640} hipY={0} h={h} light={{amb: 0.3, tint: '#0C1030', rim: '#6F8BFF'}} hands={
      <g>
        {/* boîte de conserve dans la main gauche, cuillère dans la droite */}
        <rect x={b.hL[0] - 0.035 * h} y={b.hL[1] - 0.075 * h} width={0.07 * h} height={0.08 * h} rx={4} fill="#3A4258" stroke="#8FA4FF" strokeWidth={2} />
        <rect x={b.hL[0] - 0.035 * h} y={b.hL[1] - 0.06 * h} width={0.07 * h} height={0.025 * h} fill="#7A3A30" opacity={0.8} />
        <line x1={b.hR[0]} y1={b.hR[1]} x2={b.hR[0] + 0.045 * h} y2={b.hR[1] - 0.03 * h} stroke="#C8D2FF" strokeWidth={4} strokeLinecap="round" />
      </g>
    } />
  );
};

export const SalonNuit: React.FC<SceneP & {t0: number; lit: number; push: number; hero?: boolean; eat?: [number, number]}> = ({T, t0, lit, push, hero, eat}) => {
  const lt = T - t0;
  const kp = prog(T, push, push + 1.6, easeInOut);
  const z = lerp(1.0, 1.04, clamp01(lt / 3)) * lerp(1, 1.9, kp);
  const fx = lerp(540, LX + 22, kp), fy = lerp(960, LY + 29, kp);
  const look = prog(T, lit + 0.2, lit + 0.7, easeOut);
  const warm = T > lit ? 0.12 : 0;
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <Cam x={fx} y={fy} z={z}>
        <rect x={-200} y={-200} width={1480} height={2400} fill="#0A0B12" />
        <g transform="translate(110,330)">
          <svg x={0} y={0} width={860} height={760} viewBox="110 330 860 760" overflow="hidden">
            <Opposite T={T} lit={lit} />
          </svg>
        </g>
        {/* encadrement */}
        <rect x={90} y={310} width={900} height={22} fill="#05060A" />
        <rect x={90} y={1090} width={900} height={30} fill="#05060A" />
        <rect x={90} y={310} width={22} height={810} fill="#05060A" />
        <rect x={968} y={310} width={22} height={810} fill="#05060A" />
        <rect x={530} y={310} width={16} height={810} fill="#05060A" />
        <path d="M110 1120 L970 1120 L1200 1920 L-120 1920 Z" fill="rgba(120,150,255,0.07)" filter="url(#b24)" />
        <rect x={-200} y={1120} width={1480} height={900} fill="#090A10" />
        <rect x={-200} y={1120} width={1480} height={900} fill={`rgba(246,184,88,${warm * 0.4})`} />
        {/* silhouettes du salon : canapé, lampe éteinte, plante */}
        <path d="M640 1520 q0 -90 70 -90 h300 q70 0 70 90 v160 h-440 Z" fill="#12131C" />
        <rect x={60} y={1180} width={8} height={420} fill="#12131C" />
        <path d="M20 1180 L108 1180 L88 1120 L40 1120 Z" fill="#161724" />
        <SitEat T={T} hero={hero} look={look} eat={eat} />
      </Cam>
    </svg>
  );
};

// ---------------- jumelles : toi à la fenêtre, puis la vue ronde sur la fenêtre d'en face ----------------
export const Girl: React.FC<{T: number; up: number; on: number; x: number; y: number; h: number; item?: 'lamp' | 'radio' | 'none'}> = ({T, up, on, x, y, h, item = 'lamp'}) => {
  const pose: Pose = {...mix(P.standArmsDown, {...P.stand, aR: 140, aRb: -40}, up), head: Math.sin(T * 1.4) * 3};
  const b = bones(pose, h);
  const hipY = -0.437 * h;
  const hc = [x + b.headC[0], y + hipY + b.headC[1]];
  const hand = [x + b.hR[0], y + hipY + b.hR[1]];
  return (
    <g>
      <Stick p={pose} x={x} y={y} h={h} look="runner" />
      {/* couettes, robe */}
      {/* cheveux : frange sur le haut de la tête, deux couettes qui pendent */}
      <path d={`M${hc[0] - b.R * 1.02} ${hc[1] + b.R * 0.1} A${b.R * 1.04} ${b.R * 1.04} 0 0 1 ${hc[0] + b.R * 1.02} ${hc[1] + b.R * 0.1} Q${hc[0]} ${hc[1] - b.R * 0.35} ${hc[0] - b.R * 1.02} ${hc[1] + b.R * 0.1} Z`} fill="#6A4A3A" stroke="#22201E" strokeWidth={3} />
      {[-1, 1].map((s) => <ellipse key={s} cx={hc[0] + s * b.R * 1.2} cy={hc[1] + b.R * 0.75} rx={b.R * 0.32} ry={b.R * 0.62} fill="#6A4A3A" stroke="#22201E" strokeWidth={3} />)}
      <path d={`M${x + b.sh[0] - h * 0.07} ${y + hipY + b.sh[1] + h * 0.05} L${x - h * 0.16} ${y + hipY + h * 0.08} L${x + h * 0.16} ${y + hipY + h * 0.08} L${x + b.sh[0] + h * 0.07} ${y + hipY + b.sh[1] + h * 0.05} Z`} fill="#C9506A" stroke="#22201E" strokeWidth={4} strokeLinejoin="round" />
      {item === 'radio' ? (
        <g transform={`translate(${hand[0]},${hand[1]})`}>
          <rect x={-h * 0.07} y={-h * 0.11} width={h * 0.14} height={h * 0.1} rx={6} fill="#3A3F48" stroke="#15171C" strokeWidth={4} />
          <circle cx={-h * 0.03} cy={-h * 0.06} r={h * 0.025} fill="#15171C" />
          <rect x={h * 0.01} y={-h * 0.09} width={h * 0.04} height={h * 0.012} fill="#7AE07A" />
          <line x1={h * 0.05} y1={-h * 0.11} x2={h * 0.09} y2={-h * 0.24} stroke="#15171C" strokeWidth={4} />
        </g>
      ) : null}
      {item !== 'lamp' ? null : <>
      {/* lampe tournée vers toi */}
      <rect x={hand[0] - h * 0.03} y={hand[1] - h * 0.06} width={h * 0.06} height={h * 0.1} rx={6} fill="#2A2A30" />
      <circle cx={hand[0]} cy={hand[1] - h * 0.06} r={h * 0.035} fill={on > 0.5 ? '#FFFBEA' : '#8A8A70'} />
      {on > 0 ? (
        <g opacity={on}>
          <circle cx={hand[0]} cy={hand[1] - h * 0.06} r={h * 0.5} fill="#FFF2C8" opacity={0.45} filter="url(#b40)" />
          <circle cx={hand[0]} cy={hand[1] - h * 0.06} r={h * 0.16} fill="#FFFDF2" opacity={0.85} filter="url(#b14)" />
          <rect x={hand[0] - h * 0.9} y={hand[1] - h * 0.065} width={h * 1.8} height={5} fill="#FFF6D8" opacity={0.6} filter="url(#b4)" />
        </g>
      ) : null}
      </>}
    </g>
  );
};

/** créneaux de la lampe : S (3 courts) · O (3 longs) · S (3 courts) */
export const morseOn = (T: number, m1: number, m2: number, m3: number) => {
  const groups: [number, number, number][] = [[m1 + 0.02, 0.11, 0.09], [m2 + 0.02, 0.2, 0.08], [m3 + 0.02, 0.11, 0.09]];
  for (const [g0, on, off] of groups) for (let i = 0; i < 3; i++) {
    const s = g0 + i * (on + off);
    if (T >= s && T < s + on) return 1;
  }
  return 0;
};

/** jumelles tenues à deux mains : au visage (k = 1) ou baissées à la taille (k = 0) */
export const Binoculars: React.FC<{pose: Pose; x: number; y: number; h: number; k: number}> = ({pose, x, y, h, k}) => {
  const b = bones(pose, h);
  const hy = y - 0.437 * h;
  const cx = x + (b.hL[0] + b.hR[0]) / 2, cy = hy + (b.hL[1] + b.hR[1]) / 2 - lerp(0, 0.02 * h, k);
  const bw = 0.07 * h, bh = 0.085 * h, gap = lerp(0.045, 0.06, k) * h;
  return (
    <g style={{filter: 'drop-shadow(0 0 10px rgba(110,140,255,0.8))'}}>
      {[-1, 1].map((s) => <rect key={s} x={cx + s * gap - bw / 2} y={cy - bh / 2} width={bw} height={bh} rx={bw * 0.35} fill="#0F1120" stroke="#6F8BFF" strokeWidth={4} />)}
      <rect x={cx - gap} y={cy - bh * 0.12} width={gap * 2} height={bh * 0.24} fill="#0F1120" stroke="#6F8BFF" strokeWidth={3} />
    </g>
  );
};

/** toi de dos devant la fenêtre, en contre-jour bleu : lève les jumelles (raise), puis les baisse (lower) */
export const AlaFenetre: React.FC<SceneP & {raise: [number, number]; lower?: [number, number]; dim?: number; hero?: boolean}> = ({T, raise, lower, dim = 0, hero}) => {
  const k = prog(T, raise[0], raise[1], easeOut) * (lower ? 1 - prog(T, lower[0], lower[1], easeInOut) : 1);
  const z = lerp(1.0, 1.06, prog(T, raise[0], raise[0] + 4, (x) => x));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <g transform={`translate(540,900) scale(${z}) translate(-540,-900)`}>
        <rect width={1080} height={1920} fill="#07080E" />
        <g transform="translate(110,330)">
          <svg x={0} y={0} width={860} height={760} viewBox="110 330 860 760" overflow="hidden">
            <Opposite T={T} lit={0} />
          </svg>
        </g>
        <rect x={90} y={310} width={900} height={22} fill="#05060A" />
        <rect x={90} y={1090} width={900} height={30} fill="#05060A" />
        <rect x={90} y={310} width={22} height={810} fill="#05060A" />
        <rect x={968} y={310} width={22} height={810} fill="#05060A" />
        <rect x={530} y={310} width={16} height={810} fill="#05060A" />
        <path d="M110 1120 L970 1120 L1200 1920 L-120 1920 Z" fill="rgba(120,150,255,0.06)" filter="url(#b24)" />
        <rect x={0} y={1120} width={1080} height={800} fill="#090A10" opacity={0.92} />
        <Person hero={hero} p={hero ? breathe(mix(P.binoLow, P.binoBack, k), T, 0.5) : mix(P.binoLow, P.binoBack, k)} x={600} y={2080} h={1150} look="rimBlue" light={{amb: 0.28, tint: '#0C1030', rim: '#6F8BFF'}} />
        <Binoculars pose={mix(P.binoLow, P.binoBack, k)} x={600} y={2080} h={1150} k={k} />
      </g>
      <rect width={1080} height={1920} fill={`rgba(0,0,0,${dim})`} />
    </svg>
  );
};

export const Jumelles: React.FC<SceneP & {pov: number; signal: number; m: [number, number, number]; sos: number; aim?: number; white?: number}> = ({T, pov, signal, m, sos, aim = 1e9, white = 1e9}) => {
  // vue dans les jumelles : deux cercles, léger tremblé
  const shake = [Math.sin(T * 7.3) * 5 + Math.sin(T * 13.1) * 2, Math.cos(T * 6.1) * 4];
  const up = prog(T, signal, signal + 0.5, easeOut);
  const toward = prog(T, aim, white, easeIn);
  const on = Math.max(morseOn(T, ...m), T >= aim ? 1 : 0, T >= sos + 0.05 && T < sos + 1.1 ? 0.6 + 0.4 * Math.sin(T * 30) : 0);
  const z = lerp(1.18, 1.3, prog(T, pov, pov + 4, (x) => x)) * lerp(1, 1.6, toward);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="girlRoom" stops={[[0, '#4A3624'], [1, '#2A1E14']]} />
        {/* contour adouci de l'union des deux cercles : pas d'arc sombre au milieu de l'image */}
        <mask id="bino">
          <rect width={1080} height={1920} fill="black" />
          <g filter="url(#b4)">
            <circle cx={370} cy={930} r={368} fill="white" />
            <circle cx={710} cy={930} r={368} fill="white" />
          </g>
        </mask>
        <mask id="binoEdge">
          <rect width={1080} height={1920} fill="white" />
          <g filter="url(#b24)">
            <circle cx={370} cy={930} r={322} fill="black" />
            <circle cx={710} cy={930} r={322} fill="black" />
          </g>
        </mask>
      </defs>
      <rect width={1080} height={1920} fill="#000" />
      <g mask="url(#bino)">
        <g transform={`translate(${540 + shake[0]},${930 + shake[1]}) scale(${z}) translate(-540,-930)`}>
          <rect x={-200} y={300} width={1480} height={1300} fill="#161A2C" />
          {/* fenêtre d'en face, en gros */}
          <rect x={150} y={470} width={780} height={900} fill="#0D0F1A" />
          <rect x={180} y={500} width={720} height={840} fill="url(#girlRoom)" />
          <Glow x={540} y={900} r={340} color="#F6B858" o={0.35} blur={40} />
          <rect x={220} y={1080} width={300} height={130} rx={14} fill="#5A3A48" />
          <circle cx={300} cy={1060} r={34} fill="#8A5A3A" />
          <circle cx={278} cy={1032} r={13} fill="#8A5A3A" />
          <circle cx={322} cy={1032} r={13} fill="#8A5A3A" />
          <rect x={180} y={500} width={720} height={70} fill="#6A2E3A" />
          <path d="M180 570 Q230 700 200 900 L180 900 Z M900 570 Q850 700 880 900 L900 900 Z" fill="#6A2E3A" />
          <Girl T={T} up={up} on={on} x={560} y={1300} h={560} />
          <rect x={150} y={1340} width={780} height={40} fill="#0D0F1A" />
        </g>
        <rect width={1080} height={1920} fill={`rgba(150,190,255,0.06)`} />
        {/* bord intérieur assombri le long du contour seulement */}
        <rect width={1080} height={1920} fill="#000" opacity={0.85} mask="url(#binoEdge)" />
        <rect width={1080} height={1920} fill="#FFFBEE" opacity={toward ** 1.6} />
      </g>
    </svg>
  );
};

/** le faisceau de la lampe traverse la rue et frappe ta fenêtre (vue de la rue, contre-plongée) */
export const Faisceau: React.FC<SceneP & {t0: number; hero?: boolean}> = ({T, t0, hero}) => {
  const lt = T - t0;
  const z = lerp(1.06, 1.0, prog(lt, 0, 1.4, easeOut));
  const flick = 0.85 + 0.15 * Math.sin(T * 23);
  const TWR = {x: 520, y: 260, w: 460, floors: 14, fh: 100, cols: 6};
  const [ox, oy] = winAt(TWR.x, TWR.y, TWR.w, TWR.floors, TWR.fh, TWR.cols, 14, 2);
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="fSky" stops={[[0, '#04050C'], [1, '#121834']]} />
        <VGrad id="fBody" stops={[[0, '#1C2034'], [1, '#0E1020']]} />
      </defs>
      <g transform={`translate(540,960) scale(${z}) translate(-540,-960)`}>
        <rect width={1080} height={1920} fill="url(#fSky)" />
        <circle cx={900} cy={170} r={34} fill="#EEF0F8" />
        <Glow x={900} y={170} r={110} color="#C8D2FF" o={0.35} blur={24} />
        {/* l'immeuble d'en face, au bord gauche : la fenêtre de la petite fille */}
        <rect x={-60} y={180} width={150} height={1800} fill="#0B0D18" />
        <rect x={40} y={oy - 70} width={46} height={62} fill="#FFF2CC" />
        <Glow x={63} y={oy - 40} r={90} color="#FFF0C0" o={0.8 * flick} blur={24} />
        <Tower {...TWR} body="url(#fBody)" edge="#3A4A8A" dark="#0B0D18" roof={false} win={(f, c) => (f === 14 && c === 2 ? '#FFF2CC' : null)} />
        <path d={`M70 ${oy - 60} L${ox} ${oy - 30} L${ox} ${oy + 90} L70 ${oy - 22} Z`} fill="#FFF0C8" opacity={0.3 * flick} filter="url(#b14)" />
        <path d={`M70 ${oy - 46} L${ox} ${oy + 4} L${ox} ${oy + 52} L70 ${oy - 34} Z`} fill="#FFF8E4" opacity={0.5 * flick} filter="url(#b4)" />
        <Dust x0={90} y0={oy - 60} x1={ox} y1={oy + 80} T={T} n={30} o={0.6} />
        <Glow x={ox + 22} y={oy + 29} r={170} color="#FFF0C0" o={0.8 * flick} blur={40} />
        <Person hero={hero} p={P.standArmsDown} x={ox + 22} y={oy + 58} h={50} look="dark" light={{amb: 0.35, tint: '#3A2A10'}} />
        {/* rue en bas : les premières silhouettes */}
        <rect x={0} y={1700} width={1080} height={220} fill="#07080E" />
        {Array.from({length: 9}, (_, i) => <Stick key={i} p={P.standArmsDown} x={80 + i * 110 + rand(i) * 40} y={1830 + rand(i * 3) * 40} h={120} look="dark" />)}
      </g>
    </svg>
  );
};

/** fond de la carte de fin : noir, et ta fenêtre allumée tout en bas (le motif de la série) */
export const FinFond: React.FC<SceneP & {hero?: boolean}> = ({T, hero}) => (
  <svg width={1080} height={1920}>
    <Blurs />
    <rect width={1080} height={1920} fill="#050507" />
    <Glow x={540} y={1720} r={260} color="#F6B858" o={0.18 + 0.03 * Math.sin(T * 3)} blur={40} />
    {/* ta fenêtre, seule allumée dans la nuit (le motif de la série) */}
    <rect x={430} y={1560} width={220} height={260} fill="#0E0B08" />
    <rect x={442} y={1572} width={196} height={236} fill="#F6C46A" opacity={0.9} />
    <rect x={536} y={1572} width={8} height={236} fill="#0E0B08" />
    <rect x={442} y={1686} width={196} height={8} fill="#0E0B08" />
    <Person hero={hero} p={P.standArmsDown} x={505} y={1808} h={150} look="dark" light={{amb: 0.3, tint: '#2A1A08'}} />
    <rect x={420} y={1820} width={240} height={14} fill="#1A140E" />
  </svg>
);

export {Cam, Smoke};
