// Scènes du début : la chambre dans une fenêtre de la tour (dézoom continu jusqu'à la ville), le téléphone qui vibre, l'alerte d'urgence.
import React from 'react';
import {clamp01, easeInOut, easeOut, lerp, prog, rand} from '../theme';
import {mix, P, Stick} from './stick';
import {Blurs, Cam, CarTop, Glow, RGrad, SceneP, Siren, Skyline, Smoke, Tower, VGrad, winAt} from './world';
import {SF} from './ui';

// ---------------- la chambre (dessinée en 1080×1440, posée dans la fenêtre de l'étage 12) ----------------
export const Bedroom: React.FC<{T: number; up: number; shade?: number}> = ({T, up, shade = 0.12}) => {
  const pose = mix(P.lieBed, P.sitBed, up);
  const hipY = lerp(948, 940, up);
  return (
    <g>
      <defs>
        <VGrad id="brWall" stops={[[0, '#433D5E'], [1, '#2B2842']]} />
        <VGrad id="brDawn" stops={[[0, '#3A2C4E'], [0.55, '#8A4A55'], [1, '#E08A55']]} />
        <VGrad id="brDuvet" stops={[[0, '#36428C'], [1, '#1F2656']]} />
        <VGrad id="brCurt" stops={[[0, '#8A3445'], [1, '#521C2A']]} />
        <VGrad id="brFloor" stops={[[0, '#3E3036'], [1, '#2A2026']]} />
        <RGrad id="brSun" stops={[[0, 'rgba(255,170,110,0.55)'], [1, 'rgba(255,170,110,0)']]} />
      </defs>
      <rect x={0} y={0} width={1080} height={1440} fill="url(#brWall)" />
      {/* baie vitrée : l'aube et la ville silencieuse */}
      <rect x={640} y={170} width={330} height={480} fill="#15131E" />
      <rect x={654} y={184} width={302} height={452} fill="url(#brDawn)" />
      <Skyline y={636} seed={41} color="#2A2440" lit="#F0BC70" litRatio={0.06} hMin={90} hMax={260} x0={654} x1={956} wMin={30} wMax={70} winScale={0.5} />
      <Smoke x={760} y={560} T={T} seed={5} scale={0.35} o={0.5} />
      <rect x={803} y={184} width={8} height={452} fill="#15131E" />
      <rect x={654} y={405} width={302} height={8} fill="#15131E" />
      <path d="M600 150 Q630 400 610 690 L680 690 Q672 420 668 150 Z" fill="url(#brCurt)" />
      <path d="M1010 150 Q980 400 1000 690 L930 690 Q940 420 944 150 Z" fill="url(#brCurt)" />
      <rect x={590} y={140} width={440} height={14} rx={7} fill="#1A1622" />
      {/* lumière de l'aube qui entre */}
      <path d="M660 640 L960 640 L620 1440 L-60 1440 Z" fill="rgba(255,160,110,0.07)" filter="url(#b14)" />
      <circle cx={800} cy={420} r={420} fill="url(#brSun)" opacity={0.6} />
      {/* tableau */}
      <rect x={170} y={250} width={290} height={210} fill="#211B2A" />
      <rect x={184} y={264} width={262} height={182} fill="#3B2842" />
      <rect x={184} y={360} width={262} height={86} fill="#5A2E44" />
      <circle cx={315} cy={372} r={42} fill="#E89A5A" />
      <path d="M184 446 L250 392 L300 430 L360 380 L446 446 Z" fill="#2A1E30" />
      {/* sol, tapis */}
      <rect x={0} y={1130} width={1080} height={310} fill="url(#brFloor)" />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={0} y={1150 + i * 42} width={1080} height={2} fill="rgba(0,0,0,0.25)" />)}
      <ellipse cx={560} cy={1290} rx={420} ry={70} fill="#6B2C45" opacity={0.55} />
      <ellipse cx={560} cy={1290} rx={360} ry={52} fill="none" stroke="#8A3E58" strokeWidth={6} opacity={0.5} />
      {/* lit */}
      <rect x={100} y={700} width={48} height={420} rx={10} fill="#241D30" />
      <rect x={120} y={1060} width={900} height={60} fill="#211A2B" />
      <rect x={140} y={1110} width={22} height={40} fill="#17121F" />
      <rect x={990} y={1110} width={22} height={40} fill="#17121F" />
      <rect x={130} y={930} width={880} height={140} rx={18} fill="#CFC8BC" />
      <ellipse cx={265} cy={925} rx={118} ry={44} fill="#E7E1D6" />
      <ellipse cx={265} cy={945} rx={110} ry={20} fill="rgba(0,0,0,0.12)" />
      <Stick p={pose} x={600} y={hipY} hipY={0} h={560} shade={shade} />
      {/* couette : remonte sur le buste quand il dort, glisse quand il se redresse */}
      <path d={`M${lerp(330, 560, up)} ${lerp(905, 930, up)} Q${lerp(600, 700, up)} ${lerp(870, 880, up)} 900 895 Q1010 900 1020 960 L1020 1075 L${lerp(300, 520, up)} 1075 Q${lerp(300, 510, up)} 990 ${lerp(330, 560, up)} ${lerp(905, 930, up)} Z`} fill="url(#brDuvet)" />
      <path d={`M${lerp(420, 620, up)} 1000 Q700 980 780 1010 M820 960 Q900 940 980 990`} stroke="#18204A" strokeWidth={6} fill="none" opacity={0.6} />
      <rect x={0} y={0} width={1080} height={1440} fill="rgba(10,8,20,0.18)" />
    </g>
  );
};

// ---------------- ouverture : chambre → façade → tour → ville (dézoom continu) ----------------
const TW = {x: 330, y: 560, w: 420, floors: 12, fh: 95, cols: 6};
const [WX, WY] = winAt(TW.x, TW.y, TW.w, TW.floors, TW.fh, TW.cols, 12, 2);
const WIN_C = [WX + 22, WY + 29.33] as const;
export const OUR_WIN = {x: WX, y: WY, cx: WIN_C[0], cy: WIN_C[1]};

/** la ville à l'aube, vue de face (sert à l'ouverture) */
export const CityDawn: React.FC<{T: number; bedUp: number; inner?: boolean}> = ({T, bedUp, inner = true}) => (
  <g>
    <defs>
      <VGrad id="skyDawn" stops={[[0, '#17183A'], [0.28, '#33294F'], [0.46, '#6E4060'], [0.6, '#C0644E'], [0.7, '#EE9A58'], [0.8, '#F4B66A']]} />
      <VGrad id="towerBody" stops={[[0, '#4C4664'], [1, '#2E2B40']]} />
      <RGrad id="horizon" stops={[[0, 'rgba(255,170,100,0.75)'], [1, 'rgba(255,150,90,0)']]} />
    </defs>
    <rect x={-400} y={-400} width={1880} height={2720} fill="url(#skyDawn)" />
    <circle cx={760} cy={1250} r={760} fill="url(#horizon)" />
    <Smoke x={160} y={1150} T={T} seed={11} scale={1.4} color="#241E2C" o={0.75} />
    <Smoke x={880} y={1220} T={T + 2} seed={23} scale={1.6} color="#241E2C" o={0.75} />
    <Smoke x={620} y={1300} T={T + 4} seed={29} scale={0.9} color="#2A2230" o={0.55} />
    <Glow x={880} y={1250} r={110} color="#FF7A2A" o={0.6 + 0.2 * Math.sin(T * 9)} blur={24} />
    <Glow x={160} y={1220} r={80} color="#FF7A2A" o={0.5 + 0.2 * Math.sin(T * 7 + 1)} blur={24} />
    <Skyline y={1540} seed={3} color="#2A2440" lit="#E9B96A" litRatio={0.07} hMin={260} hMax={640} wMin={70} wMax={150} winScale={0.8} />
    <Skyline y={1720} seed={7} color="#1A1828" lit="#E9B96A" litRatio={0.06} hMin={420} hMax={980} />
    <Tower {...TW} body="url(#towerBody)" edge="#D98458" win={(f, c) => (f === 12 && c === 2 ? '#15131E' : rand(f * 13 + c * 7) < 0.1 ? '#E2AE5E' : null)} />
    {inner ? (
      <g transform={`translate(${WX},${WY}) scale(${44 / 1080})`}>
        <Bedroom T={T} up={bedUp} />
      </g>
    ) : null}
    {/* rue : voitures abandonnées, une voiture de police muette */}
    <rect x={-400} y={1700} width={1880} height={600} fill="#121119" />
    <rect x={-400} y={1700} width={1880} height={8} fill="#2A2733" />
    {[120, 300, 640, 960].map((x, i) => (
      <g key={i} transform={`translate(${x},1772)`}>
        <rect x={-60} y={-18} width={120} height={34} rx={12} fill="#1E1C26" />
        <rect x={-34} y={-38} width={66} height={26} rx={10} fill="#1E1C26" />
      </g>
    ))}
    <Siren x={800} y={1748} T={T} s={0.8} />
  </g>
);

export const Ouverture: React.FC<SceneP> = ({T, B}) => {
  const Z0 = 1080 / 44;
  const up = prog(T, B.h + 1.28, B.h + 1.95, easeOut);
  const e = prog(T, 2.35, 3.75, easeInOut);
  let z = Z0 * lerp(1.035, 1, prog(T, 0, 2.35, easeOut));
  if (T > 2.35) z = Math.exp(lerp(Math.log(Z0), 0, e));
  const wgt = clamp01((1 / z - 1 / Z0) / (1 - 1 / Z0));
  const cx = lerp(WIN_C[0], 540, wgt);
  let cy = lerp(WIN_C[1], 1010, wgt);
  if (T > 3.75) {
    const k = prog(T, 3.75, 7.2, (x) => x);
    z = lerp(1, 1.07, k);
    cy = lerp(1010, 990, k);
  }
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <Cam x={cx} y={cy} z={z}>
        <CityDawn T={T} bedUp={up} />
      </Cam>
    </svg>
  );
};

// ---------------- le téléphone qui vibre (notifications qui s'empilent) ----------------
type Notif = {at: number; app: string; icon: string; who: string; msg: string; alert?: boolean};
export const Telephone: React.FC<SceneP & {notifs: Notif[]; hour: string; date: string}> = ({T, B, notifs, hour, date}) => {
  const shown = notifs.filter((n) => T >= n.at);
  const last = shown.length ? shown[shown.length - 1].at : -9;
  const buzz = Math.max(0, 1 - (T - last) / 0.32);
  const jx = buzz * Math.sin(T * 120) * 7, jr = buzz * Math.sin(T * 95) * 1.6;
  const z = lerp(1, 1.08, prog(T, B.tel, B.alerte + 0.1, (x) => x));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <RGrad id="deskLight" stops={[[0, '#3A2A22'], [0.6, '#1C1512'], [1, '#0B0807']]} cx={0.5} cy={0.42} r={0.7} />
        <VGrad id="wall2" stops={[[0, '#2C2240'], [0.5, '#3A2A55'], [1, '#2A1E3E']]} />
      </defs>
      <rect width={1080} height={1920} fill="url(#deskLight)" />
      <g transform={`translate(540,930) scale(${z}) translate(-540,-930)`}>
        <path d="M600 1430 C 620 1600, 480 1700, 430 1960" stroke="rgba(0,0,0,0.5)" strokeWidth={22} fill="none" filter="url(#b8)" />
        <path d="M590 1420 C 610 1590, 470 1690, 420 1960" stroke="#E9E6E0" strokeWidth={13} fill="none" />
        <g transform={`translate(${540 + jx},900) rotate(${-8 + jr})`}>
          <rect x={-275} y={-545} width={550} height={1090} rx={84} fill="rgba(0,0,0,0.6)" filter="url(#b24)" transform="translate(18,26)" />
          <rect x={-275} y={-545} width={550} height={1090} rx={84} fill="#0B0B10" />
          <rect x={-275} y={-545} width={550} height={1090} rx={84} fill="none" stroke="#3A3A44" strokeWidth={5} />
          <rect x={-252} y={-522} width={504} height={1044} rx={66} fill="url(#wall2)" />
          <rect x={-70} y={-500} width={140} height={38} rx={19} fill="#050507" />
          <text x={0} y={-370} textAnchor="middle" fontFamily={SF.cap} fontWeight={600} fontSize={30} fill="rgba(255,255,255,0.86)">{date}</text>
          <text x={0} y={-235} textAnchor="middle" fontFamily={SF.cap} fontWeight={600} fontSize={150} fill="rgba(255,255,255,0.94)" letterSpacing="-2">{hour}</text>
          {shown.slice().reverse().map((n, i) => {
            const k = prog(T, n.at, n.at + 0.28, easeOut);
            const yy = -160 + i * 118 - (i === 0 ? (1 - k) * 60 : 0);
            const shift = i > 0 ? (1 - prog(T, shown[shown.length - 1].at, shown[shown.length - 1].at + 0.28, easeOut)) * -118 : 0;
            return (
              <g key={n.at} transform={`translate(0,${yy + shift})`} opacity={i === 0 ? k : 1}>
                <rect x={-232} y={0} width={464} height={104} rx={26} fill={n.alert ? 'rgba(200,30,30,0.72)' : 'rgba(255,255,255,0.15)'} />
                <rect x={-212} y={22} width={58} height={58} rx={14} fill={n.icon} />
                {n.alert ? <path d="M-183 34 L-163 70 L-203 70 Z" fill="#FFFFFF" /> : null}
                <text x={-136} y={46} fontFamily={SF.cap} fontWeight={800} fontSize={24} fill={n.alert ? '#FFE3DE' : '#FFFFFF'}>{n.who}</text>
                <text x={-136} y={80} fontFamily={SF.cap} fontWeight={500} fontSize={22} fill="rgba(255,255,255,0.85)">{n.msg}</text>
                <text x={212} y={42} textAnchor="end" fontFamily={SF.cap} fontWeight={500} fontSize={18} fill="rgba(255,255,255,0.55)">{n.app}</text>
              </g>
            );
          })}
        </g>
      </g>
    </svg>
  );
};

// ---------------- l'alerte d'urgence plein écran ----------------
export const Alerte: React.FC<SceneP & {lines: {at: number; text: string; red?: boolean}[]}> = ({T, B, lines}) => {
  const lt = T - B.alerte;
  const z = lerp(1.12, 1.0, prog(lt, 0, 0.5, easeOut)) * lerp(1, 1.05, prog(lt, 0.5, 5.4, (x) => x));
  const pulse = 0.65 + 0.35 * Math.max(0, Math.sin(lt * Math.PI * 2 * 1.25));
  return (
    <svg width={1080} height={1920}>
      <Blurs />
      <defs>
        <VGrad id="alertBg" stops={[[0, '#9E0E0C'], [0.45, '#650807'], [1, '#2A0303']]} />
        <RGrad id="alertHi" stops={[[0, 'rgba(255,90,70,0.55)'], [1, 'rgba(255,90,70,0)']]} cx={0.5} cy={0.2} r={0.6} />
      </defs>
      <rect width={1080} height={1920} fill="#0A0707" />
      <g transform={`translate(540,960) scale(${z}) translate(-540,-960)`}>
        <rect x={-30} y={-80} width={1140} height={2080} rx={120} fill="#0B0B10" />
        <rect x={10} y={-40} width={1060} height={2000} rx={96} fill="url(#alertBg)" />
        <rect x={10} y={-40} width={1060} height={2000} rx={96} fill="url(#alertHi)" />
        <g transform="translate(540,420)">
          <path d="M0 -150 L150 110 L-150 110 Z" fill="#FF2A1F" opacity={0.85 * pulse} filter="url(#b24)" />
          <path d="M0 -140 L140 104 L-140 104 Z" fill="#FF3424" stroke="#FF6A50" strokeWidth={10} strokeLinejoin="round" />
          <rect x={-13} y={-62} width={26} height={110} rx={13} fill="#FFFFFF" />
          <circle cx={0} cy={78} r={15} fill="#FFFFFF" />
        </g>
        <text x={540} y={690} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={74} fill="#FFFFFF">ALERTE D'URGENCE</text>
        <text x={540} y={752} textAnchor="middle" fontFamily={SF.cap} fontWeight={800} fontSize={32} letterSpacing="12" fill="#FF8A7A">MENACE EXTRÊME</text>
        <rect x={190} y={800} width={700} height={3} fill="rgba(255,255,255,0.22)" />
        {lines.map((l, i) => {
          const k = prog(T, l.at, l.at + 0.22, easeOut);
          if (T < l.at - 0.02) return null;
          return (
            <text key={i} x={540} y={900 + i * 92 + (1 - k) * 18} opacity={k} textAnchor="middle" fontFamily={SF.cap} fontWeight={900} fontSize={l.red ? 76 : 70} fill={l.red ? '#FF5A3C' : '#FFFFFF'} style={{filter: l.red ? 'drop-shadow(0 0 14px rgba(255,80,50,0.6))' : undefined}}>
              {l.text}
            </text>
          );
        })}
        <text x={540} y={1500} textAnchor="middle" fontFamily={SF.cap} fontWeight={500} fontSize={34} fill="rgba(255,255,255,0.7)">D'autres instructions suivront.</text>
        <rect x={400} y={1570} width={280} height={84} rx={42} fill="rgba(255,255,255,0.16)" />
        <text x={540} y={1624} textAnchor="middle" fontFamily={SF.cap} fontWeight={800} fontSize={36} fill="#FFFFFF">OK</text>
      </g>
      <rect width={1080} height={1920} fill={`rgba(255,60,40,${0.06 * pulse})`} />
    </svg>
  );
};

/** petite fumée + débris pour l'extérieur à l'aube, réutilisé derrière la baie vitrée */
export const DawnOutside: React.FC<{T: number; x: number; y: number; w: number; h: number}> = ({T, x, y, w, h}) => (
  <g>
    <defs>
      <VGrad id="dawnWin" stops={[[0, '#3A2D52'], [0.45, '#9A5260'], [0.8, '#F09A58'], [1, '#F6B86A']]} />
    </defs>
    <rect x={x} y={y} width={w} height={h} fill="url(#dawnWin)" />
    <Smoke x={x + w * 0.25} y={y + h * 0.75} T={T} seed={9} scale={1.0} color="#241E2C" o={0.7} />
    <Smoke x={x + w * 0.75} y={y + h * 0.8} T={T + 3} seed={19} scale={1.1} color="#241E2C" o={0.7} />
    <Glow x={x + w * 0.72} y={y + h * 0.84} r={90} color="#FF7A2A" o={0.6 + 0.2 * Math.sin(T * 8)} blur={24} />
    <Glow x={x + w * 0.2} y={y + h * 0.88} r={70} color="#FF7A2A" o={0.5 + 0.2 * Math.sin(T * 6 + 2)} blur={24} />
    <Skyline y={y + h} seed={31} color="#2A2440" lit="#F0BC70" litRatio={0.08} hMin={h * 0.25} hMax={h * 0.62} x0={x - 20} x1={x + w + 20} wMin={60} wMax={130} winScale={0.7} />
    <Skyline y={y + h + 30} seed={37} color="#1B1828" lit="#F0BC70" litRatio={0.05} hMin={h * 0.15} hMax={h * 0.4} x0={x - 20} x1={x + w + 20} wMin={90} wMax={180} winScale={0.8} />
  </g>
);

export {CarTop};
