// Vidéo éco n°6 — « Pourquoi se loger coûte si cher ? »
// Nouvelle mise en scène : une grande page de carnet (3 × 2 écrans), la caméra glisse de station en station,
// Pierrot marche, court, saute d'une station à l'autre. Chiffres : videos/06-logement/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, easeIn, easeInOut, easeOut, F, FPS, overshoot, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move} from '../rig/rig';
import {fmtFR, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Bar, Building, Crane, Facade, Signpost, Tape, vis} from '../components/Drawings';
import {camAt, Ink, WHighlight, World, WText} from '../components/Camera';

const ORANGE = C.orange;
// centres des stations dans le monde (un écran = 1080 × 1920)
const ST = {
  hook: [540, 960],
  tunnel: [1940, 960],
  credit: [3340, 960],
  chantier: [3340, 3360],
  vacants: [1940, 3360],
  loyers: [540, 3360],
  chute: [1940, 2160],
} as const;

const Title: React.FC<{x: number; y: number; t: number; t0: number; size?: number; children: React.ReactNode}> = ({x, y, t, t0, size = 76, children}) => (
  <WText x={x} y={y + (1 - prog(t, t0, t0 + 0.4, easeOut)) * 30} size={size} anchor="middle" o={prog(t, t0, t0 + 0.4, easeOut)}>
    {children}
  </WText>
);
const num = (t: number, t0: number, to: number, dur = 1.1, from = 0) => fmtFR(t < t0 ? from : from + (to - from) * prog(t, t0, t0 + dur, easeOut));

// ---------- stations ----------
const Hook: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.hook;
  const base = cy + 330;
  const kF = prog(t, 0.5, 2.4, overshoot);
  const kP = prog(t, b.paris, b.paris + 1.3, overshoot);
  const hF = 280 * (1 + 0.7 * kF);
  const hP = 280 * (1 + 1.2 * kP);
  const q = sp(Math.round(t * FPS), b.paris + 1.9, POP);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={-1} size={84}>le prix des logements</Title>
      <WText x={cx} y={cy - 615} size={48} color={C.pen} anchor="middle" weight={400}>depuis 2000, hors inflation</WText>
      <line x1={cx - 420} y1={base - 280} x2={cx + 120} y2={base - 280} stroke={C.muted} strokeWidth={3} strokeDasharray="14 12" />
      <WText x={cx - 420} y={base - 292} size={34} color={C.muted} weight={400}>niveau 2000</WText>
      <Building x={cx - 280} y={base} w={190} h={hF} id={1} lit={0.9} />
      <Building x={cx - 20} y={base} w={190} h={hP} id={2} lit={0.9} color="#FFF4E8" />
      <WText x={cx - 280} y={base + 60} size={44} anchor="middle" weight={400}>France</WText>
      <WText x={cx - 20} y={base + 60} size={44} anchor="middle" weight={400}>Paris</WText>
      <WHighlight x={cx - 345} y={base - hF - 92} w={130} h={62} k={prog(t, 2.0, 2.4, easeOut)} />
      <WText x={cx - 280} y={base - hF - 40} size={64} anchor="middle" o={prog(t, 1.9, 2.2, easeOut)}>×1,7</WText>
      <WHighlight x={cx - 85} y={base - hP - 92} w={130} h={62} k={prog(t, b.paris + 1.1, b.paris + 1.5, easeOut)} />
      <WText x={cx - 20} y={base - hP - 40} size={64} anchor="middle" o={prog(t, b.paris + 1.0, b.paris + 1.3, easeOut)} color={C.red}>×2,2</WText>
      {q > 0.01 ? <WText x={cx + 200} y={cy - 250} size={240} color={ORANGE} rot={Math.sin(t * 3) * 6}><tspan>?</tspan></WText> : null}
    </g>
  );
};

const yearX = (cx: number, y: number) => cx - 470 + ((y - 1965) / 60) * 690;
const Tunnel: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.tunnel;
  const base = cy + 160;
  const rev = (y: number) => base - 60 - ((y - 1965) / 60) * 300; // revenus : pente régulière
  const kR = prog(t, b.dedans - 0.2, b.dedans + 1.0, easeInOut);
  const kT = prog(t, b.dedans + 0.6, b.dedans + 1.3, easeOut);
  const kIn = prog(t, b.dedans + 1.0, b.dedans + 2.4, easeInOut);
  const kOut = prog(t, b.sortie, b.sortie + 1.6, easeOut);
  const pts = (y0: number, y1: number, f: (y: number) => number): [number, number][] => Array.from({length: 13}, (_, i) => {
    const y = y0 + ((y1 - y0) * i) / 12;
    return [yearX(cx, y), f(y)];
  });
  const priceIn = (y: number) => rev(y) + Math.sin((y - 1965) * 0.5) * 14;
  const priceOut = (y: number) => rev(y) - Math.pow((y - 2000) / 25, 0.8) * 330;
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.tunnel}>prix et revenus</Title>
      <Ink pts={[[yearX(cx, 1965), base], [yearX(cx, 2025) + 20, base]]} k={prog(t, b.tunnel, b.tunnel + 0.6, easeOut)} width={6} id={10} />
      {[1965, 2000, 2025].map((y) => (
        <WText key={y} x={yearX(cx, y)} y={base + 52} size={36} anchor="middle" weight={400} color={C.muted} o={prog(t, b.tunnel + 0.3, b.tunnel + 0.7, easeOut)}>{y}</WText>
      ))}
      {/* le tunnel : bande grisée + arche d'entrée */}
      {kT > 0 ? (
        <g opacity={kT}>
          <path d={`M ${yearX(cx, 1965)} ${rev(1965) - 55} L ${yearX(cx, 2000)} ${rev(2000) - 55} L ${yearX(cx, 2000)} ${rev(2000) + 55} L ${yearX(cx, 1965)} ${rev(1965) + 55} Z`} fill="rgba(20,19,26,0.08)" stroke={C.ink} strokeWidth={4} strokeDasharray="10 8" />
          <path d={`M ${yearX(cx, 1965) - 10} ${rev(1965) + 55} L ${yearX(cx, 1965) - 10} ${rev(1965) - 40} Q ${yearX(cx, 1965) + 30} ${rev(1965) - 110} ${yearX(cx, 1965) + 70} ${rev(1965) - 40}`} stroke={C.ink} strokeWidth={6} fill="none" />
        </g>
      ) : null}
      <Ink pts={pts(1965, 2025, rev)} k={kR} color={C.pen} width={9} id={11} />
      <Ink pts={pts(1965, 2000, priceIn)} k={kIn} color={ORANGE} width={9} id={12} />
      <Ink pts={pts(2000, 2025, priceOut)} k={kOut} color={ORANGE} width={11} id={13} />
      <WText x={yearX(cx, 2025) + 10} y={rev(2025) + 60} size={40} color={C.pen} o={kR} weight={400}>revenus</WText>
      <WText x={yearX(cx, 2018)} y={priceOut(2025) - 30} size={44} color={ORANGE} o={kOut}>prix</WText>
      <WHighlight x={cx - 460} y={cy - 610} w={560} h={70} k={prog(t, b.dedans + 2.2, b.dedans + 2.7, easeOut)} />
      <WText x={cx - 450} y={cy - 560} size={60} o={prog(t, b.dedans + 2.0, b.dedans + 2.3, easeOut)}>le tunnel de Friggit</WText>
      <WText x={yearX(cx, 2004)} y={priceOut(2014) - 120} size={46} color={C.red} o={prog(t, b.sortie + 0.8, b.sortie + 1.2, easeOut)} rot={-14}>sortie !</WText>
    </g>
  );
};

const Credit: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.credit;
  const k1 = prog(t, b.d2001, b.d2001 + 0.9, easeOut);
  const k2 = prog(t, b.d2026, b.d2026 + 1.2, overshoot);
  const v = 13.6 * k1 + 7.4 * k2;
  const kM = prog(t, b.mecanisme + 0.3, b.mecanisme + 2.0, overshoot);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.credit}>la durée des crédits</Title>
      <Tape x={cx - 380} y={cy - 380} w={600} max={25} v={Math.max(0.01, v)} id={20} />
      <WText x={cx - 440} y={cy - 250} size={50} weight={400} o={k1}>2001 : <tspan fontWeight={700}>13,6 ans</tspan></WText>
      <WHighlight x={cx - 450} y={cy - 210} w={360} h={64} k={prog(t, b.d2026 + 0.9, b.d2026 + 1.3, easeOut)} />
      <WText x={cx - 440} y={cy - 160} size={56} o={k2} color={C.red}>2026 : 21 ans</WText>
      <Building x={cx - 220} y={cy + 330} w={200} h={260 * (1 + 0.8 * kM)} id={21} lit={0.85} />
      <WText x={cx - 20} y={cy + 160} size={48} color={C.pen} weight={400} o={prog(t, b.mecanisme + 1.2, b.mecanisme + 1.6, easeOut)} rot={-4}>+ long</WText>
      <WText x={cx - 20} y={cy + 220} size={48} color={C.red} o={prog(t, b.mecanisme + 1.8, b.mecanisme + 2.2, easeOut)} rot={-4}>= + cher</WText>
    </g>
  );
};

const Chantier: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.chantier;
  const kStamp = sp(Math.round(t * FPS), b.quart + 0.1, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.chantier}>logements commencés en 2025</Title>
      <WText x={cx - 150} y={cy - 480} size={130} anchor="middle" o={prog(t, b.neuf, b.neuf + 0.3, easeOut)}>≈ {num(t, b.neuf, 270000, 1.2)}</WText>
      <Crane x={cx - 330} y={cy + 330} h={620} t={t} id={30} />
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={cx - 120 + (i % 3) * 82} y={cy + 330 - 52 * (Math.floor(i / 3) + 1)} width={78} height={48} fill="#C9431A" stroke={C.ink} strokeWidth={4} rx={4} opacity={prog(t, b.neuf + 0.4 + i * 0.15, b.neuf + 0.6 + i * 0.15, easeOut)} />
      ))}
      <line x1={cx - 480} y1={cy + 330} x2={cx + 200} y2={cy + 330} stroke={C.ink} strokeWidth={6} />
      {kStamp > 0.01 ? (
        <g transform={`translate(${cx - 120} ${cy - 290}) rotate(${-8 + (1 - kStamp) * 20}) scale(${kStamp})`}>
          <rect x={-250} y={-60} width={500} height={120} rx={12} fill={C.white} stroke={C.red} strokeWidth={7} />
          <WText x={0} y={20} size={56} color={C.red} anchor="middle">−25 % vs avant Covid</WText>
        </g>
      ) : null}
    </g>
  );
};

const Vacants: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.vacants;
  const dark = prog(t, b.vacants + 0.6, b.vacants + 1.6, easeInOut);
  const signs = prog(t, b.rotation + 0.4, b.rotation + 2.2, easeOut);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.vacants - 0.2}>≈ 3 millions de logements vides</Title>
      <Facade x={cx - 490} y={cy + 330} cols={6} rows={6} dark={dark} signs={signs} id={40} />
      <WHighlight x={cx - 380} y={cy - 610} w={520} h={66} k={prog(t, b.rotation + 2.0, b.rotation + 2.5, easeOut)} />
      <WText x={cx - 370} y={cy - 562} size={56} o={prog(t, b.rotation + 1.8, b.rotation + 2.1, easeOut)}>la vacance de rotation</WText>
    </g>
  );
};

const Loyers: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.loyers;
  const base = cy - 60;
  const X = (y: number) => cx - 460 + ((y - 1970) / 55) * 640;
  const line = (f: (y: number) => number): [number, number][] => Array.from({length: 12}, (_, i) => {
    const y = 1970 + (55 * i) / 11;
    return [X(y), f(y)];
  });
  const rev = (y: number) => base - 40 - ((y - 1970) / 55) * 330;
  const loy = (y: number) => rev(y) - 22 + Math.sin(y * 0.4) * 6;
  const loc = (y: number) => rev(y) + ((y - 1970) / 55) * 210;
  const kL = prog(t, b.loyers + 0.2, b.loyers + 1.6, easeInOut);
  const kP = prog(t, b.pauvres, b.pauvres + 1.3, easeInOut);
  const kD = prog(t, b.double + 0.2, b.double + 1.0, overshoot);
  return (
    <g>
      <Title x={cx} y={cy - 700} t={t} t0={b.loyers}>loyers et revenus, 1970 → 2025</Title>
      <line x1={X(1970)} y1={base} x2={X(2025) + 20} y2={base} stroke={C.ink} strokeWidth={6} opacity={prog(t, b.loyers, b.loyers + 0.4, easeOut)} />
      <Ink pts={line(rev)} k={kL} color={C.pen} width={9} id={50} />
      <Ink pts={line(loy)} k={kL} color={ORANGE} width={9} id={51} dash={kL >= 1 ? '20 14' : undefined} />
      <Ink pts={line(loc)} k={kP} color={C.red} width={9} id={52} />
      <WText x={X(2025) - 210} y={rev(2025) - 50} size={40} color={ORANGE} o={kL}>loyers ≈ revenus</WText>
      <WText x={X(2025) - 250} y={loc(2025) + 60} size={40} color={C.red} o={kP}>revenus des locataires</WText>
      <Bar x={cx - 420} base={cy + 320} w={110} h={110} k={kD} color={C.muted} id={53} />
      <Bar x={cx - 250} base={cy + 320} w={110} h={220} k={kD} color={C.red} id={54} />
      <WText x={cx - 365} y={cy + 375} size={36} anchor="middle" weight={400} o={kD}>avant</WText>
      <WText x={cx - 195} y={cy + 375} size={36} anchor="middle" weight={400} o={kD}>aujourd’hui</WText>
      <WText x={cx - 90} y={cy + 160} size={44} o={kD}>poids du loyer</WText>
      <WText x={cx - 90} y={cy + 230} size={84} color={C.red} o={prog(t, b.double + 0.9, b.double + 1.2, easeOut)}>×2</WText>
    </g>
  );
};

const Chute: React.FC<{b: B; t: number}> = ({b, t}) => {
  const [cx, cy] = ST.chute;
  return (
    <g>
      <Signpost x={cx - 120} y={cy + 230} left="acheter" right="louer" k={prog(t, b.teaser + 0.6, b.teaser + 1.6, easeOut)} id={60} />
      <WText x={cx + 260} y={cy - 160} size={180} color={ORANGE} o={prog(t, b.teaser + 1.4, b.teaser + 1.7, easeOut)} rot={Math.sin(t * 3) * 6}>?</WText>
    </g>
  );
};

// ---------- Pierrot : il traverse la page ----------
const R0 = 1360; // sol de la rangée du haut
const pierrot = (b: B, end: number) => {
  const run = (t0: number, x0: number, x1: number, d = 1.3): Move => ({t0, t1: t0 + d, x0, x1, gait: 'courir'});
  const moves: Move[] = [
    run(b.tunnel + 0.2, 900, 2300),
    run(b.credit, 2300, 3700),
    run(b.vacants - 0.1, 3700, 2300),
    run(b.loyers - 0.1, 2300, 900),
    run(b.chute, 900, 2160, 1.4),
  ];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: 1.9, pose: 'choque', hold: 0.8},
    {t: b.paris + 1.0, pose: 'choque', hold: 0.8},
    {t: b.paris + 1.9, pose: 'hausser', hold: 0.5},
    {t: b.dedans + 1.0, pose: 'pointer', hold: 1.8},
    {t: b.sortie + 0.6, pose: 'choque', hold: 1.0},
    {t: b.d2001 + 0.2, pose: 'pointer', hold: 1.2},
    {t: b.d2026 + 0.4, pose: 'choque', hold: 1.0},
    {t: b.chantier + 1.1, pose: 'choque', hold: 0.6}, // atterrissage du saut
    {t: b.quart + 0.2, pose: 'hausser', hold: 1.2},
    {t: b.vacants + 1.2, pose: 'pointer', hold: 1.6},
    {t: b.rotation + 0.6, pose: 'reflechir', hold: 1.8},
    {t: b.pauvres + 0.4, pose: 'pointer', hold: 1.4},
    {t: b.double + 0.9, pose: 'choque', hold: 1.0},
    {t: b.teaser + 1.4, pose: 'reflechir', hold: end - b.teaser - 1.4},
  ];
  return {moves, keys};
};
/** décalage vertical de Pierrot : saut vers la rangée du bas, puis montée vers le carrefour */
const pierrotDy = (b: B, t: number) => {
  const fall = prog(t, b.chantier, b.chantier + 1.0, easeIn) * 2400;
  const climb = prog(t, b.chute, b.chute + 1.4, easeInOut) * (2400 - (ST.chute[1] + 230 - R0));
  return fall - climb;
};

export const Logement: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  const cam = camAt(t, [
    {t: 0, x: ST.hook[0], y: ST.hook[1], z: 1},
    {t: b.tunnel + 0.2, x: ST.tunnel[0], y: ST.tunnel[1], dur: 1.3},
    {t: b.credit, x: ST.credit[0], y: ST.credit[1], dur: 1.3},
    {t: b.chantier, x: ST.chantier[0], y: ST.chantier[1], dur: 1.0},
    {t: b.vacants - 0.1, x: ST.vacants[0], y: ST.vacants[1], dur: 1.3},
    {t: b.loyers - 0.1, x: ST.loyers[0], y: ST.loyers[1], dur: 1.3},
    {t: b.chute, x: 1940, y: 2160, z: 0.27, dur: 1.4},
    {t: b.next + 0.7, x: ST.chute[0], y: ST.chute[1] - 40, z: 1.0, dur: 1.2},
  ]);
  const dy = pierrotDy(b, t);
  const target: [number, number] = [cam.x - 240, cam.y - 300 - dy];
  const sources: [number, number, string][] = [
    [0, b.tunnel, 'IGEDD (J. Friggit), indices en monnaie constante, base 2000'],
    [b.tunnel, b.credit, 'IGEDD, travaux de J. Friggit (prix / revenu par ménage)'],
    [b.credit, b.chantier, 'FBF / Observatoire Crédit Logement, févr. 2026'],
    [b.chantier, b.vacants, 'SDES, Compte du logement 2025'],
    [b.vacants, b.loyers, 'INSEE, logements vacants au 1er janvier 2026'],
    [b.loyers, b.chute, 'IGEDD (J. Friggit), loyers et revenus 1970-2025'],
  ];
  const next = sp(frame, b.next + 1.8, POP);
  return (
    <>
      <World cam={cam} width={3880} height={4320}>
        <g opacity={1 - 0.95 * prog(t, b.next + 0.6, b.next + 1.4, easeInOut)}>
          <Hook b={b} t={t} />
          <Tunnel b={b} t={t} />
          <Credit b={b} t={t} />
          <Chantier b={b} t={t} />
          <Vacants b={b} t={t} />
          <Loyers b={b} t={t} />
        </g>
        <g opacity={prog(t, b.chute - 0.2, b.chute + 0.4, easeOut)}>
          <Chute b={b} t={t} />
        </g>
        <g transform={`translate(0 ${dy})`}>
          <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={t < b.tunnel ? 1.1 : 0.95} track={{ground: R0, x: 900, restFacing: -1, target, moves: P.moves, keys: P.keys}} />
        </g>
      </World>
      {sources.map(([a, z, s], i) => (
        <AbsoluteFill key={i} style={{opacity: vis(t, a, z)}}>
          <div style={{position: 'absolute', left: 110, top: 1378, width: 680, fontFamily: F.note, fontSize: 27, color: C.muted, lineHeight: 1.1}}>Source : {s}</div>
        </AbsoluteFill>
      ))}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1050, maxWidth: 620}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 52, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />acheter ou louer ? →
            </span>
          </Sticker>
        </div>
      ) : null}
    </>
  );
};

