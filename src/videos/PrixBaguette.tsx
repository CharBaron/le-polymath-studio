// Vidéo éco n°3 — « Pourquoi ta baguette coûte plus cher ? »
// Tous les temps viennent de timeline.json. Chiffres : videos/03-prix-baguette/sources.md (OFPM 2026 d'après INSEE, IPC sept. 2026)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeIn, easeInOut, easeOut, F, FPS, Highlight, lerp, Paper, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, V} from '../rig/rig';
import {Arrow, Counter, HandChart, Note, PageTurn, Spiral, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Baguette, Bill, Bolt, House, Layer, Oven, Pie, Src, Svg, Title, useT, vis, Wheat} from '../components/Drawings';

const ORANGE = C.orange;
const WHEAT = '#E8C063';
const SRC_OFPM = 'Source : Observatoire des prix et des marges (FranceAgriMer, 2026), prix INSEE';

// ---------- 1 · hook + promesse ----------
const S1Hook: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, -1, b.ble);
  const tag = sp(frame, 0, POP);
  const q = sp(frame, b.pourquoi, POP);
  const out = prog(t, b.spoiler - 0.1, b.spoiler + 0.25, easeIn);
  const wheat = sp(frame, b.spoiler + 0.2, {damping: 11, stiffness: 170});
  const notGuilty = sp(frame, b.spoiler + 1.0, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <Layer o={o}>
      <div style={{opacity: 1 - out}}>
        <Title y={170} size={110}>
          ta <Highlight k={1}>baguette</Highlight>
        </Title>
        <Svg>
          <Baguette x={470} y={520} len={700} id={1} />
          <text x={860} y={930} fontFamily={F.hand} fontWeight={700} fontSize={220} fill={ORANGE} transform={`translate(860 850) scale(${q}) rotate(${Math.sin(t * 3) * 5}) translate(-860 -850)`}>?</text>
        </Svg>
        <div style={{position: 'absolute', left: 110, top: 700, transform: `rotate(-4deg) scale(${tag})`, transformOrigin: '0 50%'}}>
          <Sticker k={1} rotate={0}>
            <div style={{fontFamily: F.hand, fontSize: 40, color: C.muted, lineHeight: 1}}>{t < b.now ? 'avant 2020' : 'aujourd’hui'}</div>
            <Counter from={0.88} to={1.0} t0={b.now} t1={b.now + 0.9} size={110} dec={2} prefix="≈ " suffix=" €" hl={t > b.now} />
          </Sticker>
        </div>
      </div>
      {wheat > 0.01 ? (
        <>
          <Title y={180} size={84} k={prog(t, b.spoiler, b.spoiler + 0.4, easeOut)}>
            la faute du <Highlight k={prog(t, b.spoiler + 0.6, b.spoiler + 1.0, easeOut)}>blé</Highlight> ?
          </Title>
          <Svg>
            <g transform={`translate(330 900) scale(${wheat}) translate(-330 -900)`}>
              <Wheat x={330} y={1000} h={560} rot={-6} id={2} />
            </g>
          </Svg>
          <div style={{position: 'absolute', left: 430, top: 520}}>
            <Sticker k={notGuilty} rotate={-8} style={{borderColor: C.red}}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 80, color: C.red}}>non.</span>
            </Sticker>
          </div>
        </>
      ) : null}
    </Layer>
  );
};

// ---------- 2 · la part du blé ----------
const S2Ble: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const cut = prog(t, b.ble + 0.8, b.ble + 1.4, easeOut);
  const coin = sp(frame, b.centimes + 0.2, POP);
  // la tranche « blé » = 6,2 % de la longueur, au bout gauche de la baguette
  const L = 760;
  const x0 = 470 - L / 2;
  const sliceW = L * 0.062;
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Title y={160} size={84} k={prog(t, b.ble, b.ble + 0.4, easeOut)}>
        le blé : à peine <Highlight k={prog(t, b.ble + 1.4, b.ble + 1.8, easeOut)}>6 %</Highlight>
      </Title>
      <Svg>
        <Baguette x={470} y={560} len={L} rot={0} id={10} />
        <g opacity={cut}>
          <rect x={x0 - 6} y={480} width={sliceW + 30} height={160} fill={WHEAT} opacity={0.75} style={{mixBlendMode: 'multiply'}} />
          <line x1={x0 + sliceW + 24} y1={450} x2={x0 + sliceW + 24} y2={670} stroke={C.red} strokeWidth={8} strokeDasharray="18 12" strokeLinecap="round" />
        </g>
        <Arrow a={[200, 820]} b={[x0 + 30, 650]} t0={b.ble + 1.4} bend={-0.2} color={C.ink} id={11} />
      </Svg>
      <Note x={120} y={830} t0={b.ble + 1.6} size={58} rotate={-3}>la part du blé</Note>
      {coin > 0.01 ? (
        <div style={{position: 'absolute', left: 120, top: 960, transform: `scale(${coin})`, transformOrigin: '0 50%'}}>
          <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 96}}>
            ≈ <Highlight k={prog(t, b.centimes + 0.5, b.centimes + 0.9, easeOut)}>6 centimes</Highlight>
          </span>
          <div style={{fontFamily: F.hand, fontSize: 46, color: C.pen}}>sur une baguette d’≈ 1 €</div>
        </div>
      ) : null}
      <Src>{SRC_OFPM} · blé : 6,2 % du prix HT en 2025</Src>
    </AbsoluteFill>
  );
};

// ---------- 3 · rebondissement : le blé baisse, la baguette non ----------
const S3Twist: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, b.twist, b.aval);
  const labels = ['16-20', '21', '22', '23', '24', '25'];
  return (
    <Layer o={o}>
      <Title y={150} size={78} k={prog(t, b.twist, b.twist + 0.4, easeOut)}>
        le blé <span style={{color: C.green}}>baisse</span>… la baguette ?
      </Title>
      <div style={{position: 'absolute', left: 120, top: 300, fontFamily: F.hand, fontWeight: 700, fontSize: 46, color: '#B98A2E'}}>blé dans 1 kg de pain (€)</div>
      <Svg>
        <HandChart x={140} y={380} w={560} h={250} t0={b.baisse - 0.3} dur={1.4} max={0.45} series={[{values: [0.2, 0.29, 0.41, 0.29, 0.26, 0.24], color: '#B98A2E'}]} xLabels={labels} />
        <Arrow a={[420, 400]} b={[680, 560]} t0={b.baisse + 1.6} bend={-0.15} color={C.green} id={21} />
        <HandChart x={140} y={820} w={560} h={250} t0={b.stable - 0.2} dur={1.2} max={4.4} series={[{values: [3.5, 3.58, 3.74, 4.02, 4.07, 4.05], color: ORANGE}]} xLabels={labels} />
      </Svg>
      <div style={{position: 'absolute', left: 120, top: 740, fontFamily: F.hand, fontWeight: 700, fontSize: 46, color: ORANGE, opacity: prog(t, b.stable - 0.4, b.stable, easeOut)}}>baguette (€ / kg)</div>
      <Note x={500} y={760} t0={b.stable + 1.0} size={52} color={ORANGE} rotate={-3}>→ ne baisse pas</Note>
      <Src>{SRC_OFPM} · graphique 171</Src>
    </Layer>
  );
};

// ---------- 4 · après le moulin ----------
const S4Aval: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, b.aval, b.energie);
  const parts = [
    {v: 6.2, color: WHEAT, k: prog(t, b.reste + 0.1, b.reste + 0.4, easeOut)},
    {v: 7.0, color: '#9A968C', k: prog(t, b.reste + 0.3, b.reste + 0.6, easeOut)},
    {v: 86.8, color: ORANGE, k: prog(t, b.reste + 0.6, b.reste + 1.8, easeInOut)},
  ];
  const items: {label: string; at: number; icon: (x: number, y: number) => React.ReactNode}[] = [
    {label: 'le boulanger', at: 0, icon: (x, y) => <Mascot look="bic" id={60} scale={0.32} track={{ground: y + 40, x, keys: [{t: 0, pose: 'content', dur: 0.01}]}} />},
    {label: 'son salaire', at: 0.9, icon: (x, y) => <Bill x={x} y={y} w={110} id={61} />},
    {label: 'le four', at: 1.6, icon: (x, y) => <Oven x={x} y={y + 30} w={110} t={t} id={62} />},
    {label: 'l’électricité', at: 2.2, icon: (x, y) => <Bolt x={x} y={y} s={0.6} id={63} />},
    {label: 'le loyer', at: 3.1, icon: (x, y) => <House x={x} y={y + 40} s={0.55} id={64} />},
  ];
  return (
    <Layer o={o}>
      <Title y={150} size={78} k={prog(t, b.reste, b.reste + 0.4, easeOut)}>
        <Highlight k={prog(t, b.reste + 1.8, b.reste + 2.2, easeOut)}>≈ 87 %</Highlight> après le moulin
      </Title>
      <Svg>
        <Pie cx={400} cy={480} r={170} parts={parts} id={30} />
        {items.map((it, i) => {
          const k = sp(frame, b.liste + it.at, POP);
          if (k <= 0.01) return null;
          const x = 175;
          const y = 760 + i * 100;
          return (
            <g key={i} opacity={clamp01(k * 2)} transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
              {it.icon(x, y)}
            </g>
          );
        })}
      </Svg>
      {items.map((it, i) => (
        <Note key={i} x={260} y={725 + i * 100} t0={b.liste + it.at} size={52} rotate={-1} color={C.ink}>{it.label}</Note>
      ))}
      <div style={{position: 'absolute', left: 600, top: 380, fontFamily: F.hand, fontSize: 38, lineHeight: 1.25, opacity: prog(t, b.reste + 1.8, b.reste + 2.3, easeOut)}}>
        <div><span style={{color: '#B98A2E', fontWeight: 700}}>■</span> blé 6 %</div>
        <div><span style={{color: '#9A968C', fontWeight: 700}}>■</span> moulin 7 %</div>
        <div><span style={{color: ORANGE, fontWeight: 700}}>■</span> après : 87 %</div>
      </div>
      <Src>{SRC_OFPM} · 2025, parts du prix HT</Src>
    </Layer>
  );
};

// ---------- 5 · inflation ----------
const S5Inflation: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, b.energie, b.chute + 0.8);
  const bolt = sp(frame, b.energie + 0.3, POP);
  const ipc = sp(frame, b.ipc, POP);
  const def = prog(t, b.def, b.def + 0.4, easeOut);
  const ups: [string, number, number][] = [['four', 150, 900], ['électricité', 520, 880], ['loyer', 160, 1080], ['salaires', 520, 1090]];
  return (
    <Layer o={o}>
      <div style={{opacity: 1 - def}}>
        <Svg>
          <g transform={`translate(230 380) scale(${bolt}) translate(-230 -380)`}>
            <Bolt x={230} y={380} s={1.6} id={70} />
          </g>
        </Svg>
        <div style={{position: 'absolute', left: 380, top: 270}}>
          <div style={{fontFamily: F.hand, fontSize: 52, color: C.ink}}>énergie, en 1 an</div>
          <Counter from={0} to={21} t0={b.energie + 1.2} t1={b.energie + 2.2} size={140} prefix="+" suffix=" %" color={C.red} />
        </div>
        {ipc > 0.01 ? (
          <div style={{position: 'absolute', left: 120, top: 620, transform: `scale(${ipc})`, transformOrigin: '0 50%'}}>
            <div style={{fontFamily: F.hand, fontSize: 52}}>tous les prix :</div>
            <Counter from={0} to={3.1} t0={b.ipc + 0.6} t1={b.ipc + 1.4} size={120} dec={1} prefix="+" suffix=" %" />
          </div>
        ) : null}
        <Src>Source : INSEE, prix à la consommation, septembre 2026 (énergie +21,3 %, ensemble +3,1 %)</Src>
      </div>
      {def > 0 ? (
        <div style={{opacity: def}}>
          <Title y={160} size={100}>
            l’<Highlight k={prog(t, b.def + 0.5, b.def + 0.9, easeOut)}>inflation</Highlight>
          </Title>
          <Svg>
            <Baguette x={430} y={620} len={560} rot={-6} id={71} />
            {ups.map(([, x, y], i) => (
              <Arrow key={i} a={[x + 20, y + 60]} b={[x + 20, y - 40]} t0={b.def + 1.4 + i * 0.3} dur={0.35} bend={0} color={C.red} id={72 + i} />
            ))}
          </Svg>
          {ups.map(([label, x, y], i) => (
            <Note key={label} x={x + 60} y={y - 30} t0={b.def + 1.4 + i * 0.3} size={52} color={C.red} rotate={-2}>{label}</Note>
          ))}
        </div>
      ) : null}
    </Layer>
  );
};

// ---------- 6 · teaser SMIC ----------
const S6Chute: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const smic = sp(frame, b.salaire + 0.3, {damping: 10, stiffness: 200});
  const q = sp(frame, b.salaire + 1.6, POP);
  const next = sp(frame, b.next, POP);
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Svg>
        {[0, 1, 2].map((i) => (
          <Bill key={i} x={330 + i * 40} y={620 - i * 30} w={300} rot={-8 + i * 7} id={80 + i} />
        ))}
        <text x={720} y={640} fontFamily={F.hand} fontWeight={700} fontSize={240} fill={ORANGE} opacity={clamp01(q)} transform={`rotate(${Math.sin(t * 3) * 5} 780 560)`}>?</text>
      </Svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 160, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 180, transform: `scale(${smic})`}}>
        <Highlight k={prog(t, b.salaire + 0.8, b.salaire + 1.2, easeOut)}>SMIC</Highlight>
      </div>
      <div style={{position: 'absolute', left: 110, width: 640, top: 820, fontFamily: F.hand, fontWeight: 700, fontSize: 64, lineHeight: 1.1, opacity: prog(t, b.salaire + 1.0, b.salaire + 1.4, easeOut)}}>
        combien il coûte <span style={{color: C.red}}>vraiment</span> à un patron ?
      </div>
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1040}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 46, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />le vrai coût d’un SMIC →
            </span>
          </Sticker>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- Pierrot ----------
const pierrot = (b: B, end: number) => {
  const moves: Move[] = [{t0: b.ble, t1: b.ble + 1.2, x0: 790, x1: 900}];
  const keys: Key[] = [
    {t: 0, pose: 'reflechir', dur: 0.01},
    {t: b.now, pose: 'choque', hold: 1.0},
    {t: b.pourquoi, pose: 'hausser', hold: 0.6},
    {t: b.spoiler + 0.9, pose: 'pointer', hold: 1.4},
    {t: b.ble + 1.4, pose: 'pointer', hold: 2.2},
    {t: b.centimes + 0.3, pose: 'content', hold: 0.8},
    {t: b.baisse + 1.5, pose: 'pointer', hold: 1.6},
    {t: b.stable + 0.8, pose: 'choque', hold: 1.2},
    {t: b.reste + 0.6, pose: 'pointer', hold: 2.4},
    {t: b.energie + 1.2, pose: 'choque', hold: 1.0},
    {t: b.def + 0.4, pose: 'reflechir', hold: 1.8},
    {t: b.salaire + 0.6, pose: 'reflechir', hold: 1.8},
    {t: b.next, pose: 'content', hold: end - b.next},
  ];
  return {moves, keys};
};

export const PrixBaguette: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  const target: V = t < b.ble ? [560, 640] : t < b.twist ? [380, 640] : t < b.aval ? [560, 560] : [520, 520];
  const scale = lerp(1.3, 0.95, prog(t, b.ble, b.ble + 1.2, easeInOut));
  return (
    <>
      {t >= b.twist - 0.1 && t < b.chute + 0.8 ? (
        <>
          <S3Twist b={b} />
          <S4Aval b={b} />
        </>
      ) : null}
      {t >= b.chute - 0.1 ? <S6Chute b={b} /> : null}
      {t >= b.energie && t < b.chute + 0.8 ? (
        <PageTurn t0={b.chute} dur={0.75}>
          <AbsoluteFill>
            <Paper />
            <Spiral />
            <S5Inflation b={b} />
          </AbsoluteFill>
        </PageTurn>
      ) : null}
      {t < b.ble + 0.3 ? <S1Hook b={b} /> : null}
      {t >= b.ble - 0.3 && t < b.twist + 0.8 ? (
        <PageTurn t0={b.twist} dur={0.75}>
          <S2Ble b={b} />
        </PageTurn>
      ) : null}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
        <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={scale} track={{ground: 1360, x: 790, target, moves: P.moves, keys: P.keys}} />
      </svg>
    </>
  );
};

