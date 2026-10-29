// Vidéo éco n°1 — « Et si l'État imprimait 1 million d'euros pour chaque Français ? »
// Tous les temps viennent de timeline.json (balises du script). Chiffres : videos/01-imprimer-argent/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeIn, easeInOut, easeOut, F, FPS, handPath, Highlight, lerp, Paper, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move} from '../rig/rig';
import {Circle, Counter, fmtFR, HandChart, Note, PageTurn, Spiral, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Balance, Bar, Bill, BillRain, Car, Cross, House, Layer, Press, Src, Sun, Svg, Temple, Title, useT, vis} from '../components/Drawings';

// ---------- scènes ----------
const S1Hook: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, -1, b.facture);
  const dim = prog(t, b.spoiler, b.spoiler + 0.4, easeOut);
  const stamp = sp(useCurrentFrame(), b.spoiler + 0.25, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <Layer o={o}>
      <Svg boil={false}>
        <BillRain t={t} t0={0} dim={dim} />
      </Svg>
      <Title y={190} size={140}>
        <Highlight k={1}>1 million €</Highlight>
      </Title>
      <Title y={360} size={78} color={C.pen}>pour chaque Français ?</Title>
      {stamp > 0.01 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}>
          <Sticker k={stamp} rotate={-6} style={{borderColor: C.red}}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 96, color: C.red}}>pas plus riche.</span>
          </Sticker>
        </div>
      ) : null}
    </Layer>
  );
};

const S3Facture: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const base = 1000;
  const kBig = prog(t, b.total + 0.2, b.total + 1.2, easeInOut);
  const kPib = prog(t, b.pib, b.pib + 0.5, easeOut);
  const kBil = prog(t, b.billets, b.billets + 0.5, easeOut);
  const H = 520;
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Note x={140} y={170} t0={b.facture} size={66} color={C.ink} rotate={-2}>1 000 000 € × 69 000 000</Note>
      <div style={{position: 'absolute', left: 140, top: 270, opacity: t >= b.total ? 1 : 0}}>
        <Counter from={0} to={69000} t0={b.total} t1={b.total + 1.0} size={120} prefix="= ≈ " />
        <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 64, color: C.ink, marginTop: -6}}>milliards d’euros</div>
      </div>
      <Svg>
        <path d={handPath([[110, base], [450, base], [800, base]], frame, 200, 1)} stroke={C.ink} strokeWidth={6} fill="none" opacity={kBig > 0 ? 1 : 0} />
        <Bar x={590} base={base} w={150} h={H} k={kBig} color={C.orange} id={201} />
        <Bar x={360} base={base} w={150} h={(H * 2991) / 69066} k={kPib} color={C.pen} id={202} />
        <Bar x={140} base={base} w={150} h={(H * 1631) / 69066} k={kBil} color={C.green} id={203} />
      </Svg>
      {kBig > 0 ? <div style={{position: 'absolute', left: 560, width: 210, top: base + 14, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 40, color: C.orange}}>le cadeau</div> : null}
      {kPib > 0 ? (
        <>
          <div style={{position: 'absolute', left: 330, width: 210, top: base + 14, textAlign: 'center', fontFamily: F.hand, fontSize: 38, color: C.pen, opacity: kPib}}>PIB France<br />en 1 an</div>
          <div style={{position: 'absolute', left: 330, width: 210, top: base - 130, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 84, color: C.pen, transform: `scale(${sp(frame, b.pib + 0.2, POP)})`}}>×23</div>
        </>
      ) : null}
      {kBil > 0 ? (
        <>
          <div style={{position: 'absolute', left: 110, width: 210, top: base + 14, textAlign: 'center', fontFamily: F.hand, fontSize: 38, color: C.green, opacity: kBil}}>tous les<br />billets €</div>
          <div style={{position: 'absolute', left: 110, width: 210, top: base - 130, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 84, color: C.green, transform: `scale(${sp(frame, b.billets + 0.2, POP)})`}}>×42</div>
        </>
      ) : null}
      <Src>Sources : INSEE (population 2026, PIB 2025) · BCE (billets, sept. 2026)</Src>
    </AbsoluteFill>
  );
};

const S4Twist: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, b.twist, b.inflation);
  const imagine = b.bce + 4.5; // « Mais imaginons »
  const erase = prog(t, imagine, imagine + 0.4, easeIn);
  return (
    <Layer o={o}>
      <Svg>
        <Press x={430} y={560} t={t} t0={b.twist} stop={b.bce} />
        <g opacity={1 - erase}>
          <Cross x={420} y={480} r={190} t={t} t0={b.bce} />
        </g>
        <Temple x={300} y={1080} w={300} label="BCE" k={prog(t, b.bce + 1.6, b.bce + 2.2, easeOut)} id={3} />
      </Svg>
      <Title y={150} size={88} k={prog(t, b.twist, b.twist + 0.4, easeOut)}>
        La France n’a <Highlight k={prog(t, b.bce + 0.4, b.bce + 0.8, easeOut)}>pas le droit</Highlight>
      </Title>
      <Note x={130} y={1100} t0={b.bce + 1.9} size={50} rotate={-2}>seule la BCE autorise</Note>
      <Note x={130} y={1160} t0={b.bce + 2.3} size={50} rotate={-2}>les billets en euros</Note>
      <Src>Source : art. 128 du TFUE</Src>
    </Layer>
  );
};

const S5Inflation: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const sLundi = vis(t, b.lundi, b.mardi);
  const sMardi = vis(t, b.mardi, b.prix);
  const sPrix = vis(t, b.prix, b.def);
  const sDef = vis(t, b.def, b.histoire + 0.8);
  const want = (i: number) => sp(frame, b.mardi + 0.5 + i * 0.6, POP);
  const stockK = prog(t, b.stock, b.stock + 0.4, easeOut);
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Layer o={sLundi}>
        <Title y={180} size={110}>Lundi</Title>
        <div style={{position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center'}}>
          <Sticker k={sp(frame, b.lundi + 0.4, POP)} rotate={3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 58}}>tout le monde est <Highlight k={1}>millionnaire</Highlight></span>
          </Sticker>
        </div>
      </Layer>
      <Layer o={sMardi}>
        <Title y={180} size={110}>Mardi</Title>
        <Svg>
          <g transform={`scale(${want(0)})`} style={{transformOrigin: '230px 620px'}}><Car x={230} y={620} s={1.1} id={300} /></g>
          <g transform={`scale(${want(1)})`} style={{transformOrigin: '540px 620px'}}><House x={540} y={620} s={1.1} id={302} /></g>
          <g transform={`scale(${want(2)})`} style={{transformOrigin: '850px 560px'}}><Sun x={850} y={560} s={1} t={t} /></g>
          {Array.from({length: 7}, (_, i) => (
            <Mascot
              key={i}
              look="bic"
              id={i + 20}
              scale={0.5}
              track={{ground: 1120, x: 1250 + i * 120, facing: -1, moves: [{t0: b.mardi + 0.3 + i * 0.12, t1: b.mardi + 3.4 + i * 0.12, x0: 1250 + i * 110, x1: 180 + i * 95, gait: 'courir'}], keys: [{t: b.stock + 0.2, pose: i % 2 ? 'hausser' : 'choque', hold: 2}]}}
            />
          ))}
        </Svg>
        {stockK > 0 ? (
          <>
            <Note x={195} y={680} t0={b.stock} size={64} color={C.red} rotate={-4}>×1</Note>
            <Note x={505} y={680} t0={b.stock + 0.3} size={64} color={C.red} rotate={-4}>×1</Note>
            <Note x={815} y={680} t0={b.stock + 0.5} size={64} color={C.red} rotate={-4}>×1</Note>
            <Title y={1110} size={64} k={prog(t, b.stock + 1.2, b.stock + 1.6, easeOut)} color={C.pen}>pas plus de choses à acheter</Title>
          </>
        ) : null}
      </Layer>
      <Layer o={sPrix}>
        <Title y={170} size={110}>
          les <Highlight k={prog(t, b.prix + 0.2, b.prix + 0.6, easeOut)}>prix</Highlight> s’envolent
        </Title>
        <Svg>
          <HandChart x={150} y={430} w={580} h={520} t0={b.prix + 0.1} dur={1.1} series={[{values: [1, 1.1, 1.3, 1.8, 2.8, 4.6, 8, 14], color: C.red}]} yLabel="prix" xLabels={['lun.', '', '', '', '', '', '', 'dim.']} />
        </Svg>
      </Layer>
      <Layer o={sDef}>
        <Title y={160} size={120}>
          <Highlight k={prog(t, b.def + 0.3, b.def + 0.7, easeOut)}>l’inflation</Highlight>
        </Title>
        <Svg>
          <Balance x={450} y={560} k={prog(t, b.def + 1.2, b.def + 2.2, easeInOut)} t={t} />
        </Svg>
        <Note x={120} y={970} t0={b.def + 1.6} size={56} color={C.green} rotate={-2}>trop d’argent…</Note>
        <Note x={150} y={1050} t0={b.def + 2.4} size={56} color={C.orange} rotate={-2}>…pas assez de choses</Note>
      </Layer>
    </AbsoluteFill>
  );
};

const S6Histoire: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const de = vis(t, b.allemagne, b.zimbabwe);
  const zw = vis(t, b.zimbabwe, b.chute);
  const zeros = Math.floor(clamp01((t - b.billet - 0.2) / 1.6) * 15);
  const billK = sp(frame, b.billet, {damping: 13, stiffness: 160});
  const bigNum = '1' + '0'.repeat(14);
  const shown = fmtFR(Number(bigNum.slice(0, 1 + zeros) || '1'));
  return (
    <AbsoluteFill>
      <Layer o={de}>
        <Title y={150} size={104}>Allemagne, 1923</Title>
        <div style={{position: 'absolute', left: 120, top: 330, fontFamily: F.hand, fontWeight: 700, fontSize: 74, opacity: prog(t, b.allemagne + 1, b.allemagne + 1.4, easeOut)}}>
          prix <Highlight k={prog(t, b.allemagne + 1.5, b.allemagne + 1.9, easeOut)}>× 2</Highlight> en moins de 4 jours
        </div>
        <div style={{position: 'absolute', left: 120, top: 520, fontFamily: F.hand, fontWeight: 700, fontSize: 74, opacity: t > b.dollar - 0.1 ? 1 : 0}}>1 $ =</div>
        <div style={{position: 'absolute', left: 120, top: 610, opacity: t > b.dollar - 0.1 ? 1 : 0}}>
          <Counter from={1} to={4200000000000} t0={b.dollar} t1={b.dollar + 1.6} size={92} prefix="≈ " />
          <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 64, color: C.ink}}>marks</div>
        </div>
        <Svg>
          <Bill x={300} y={1000} w={260} rot={-8} value="M" id={400} color={C.muted} />
          <Bill x={420} y={1030} w={260} rot={6} value="M" id={401} color={C.muted} />
        </Svg>
        <Src>Sources : Hanke & Krus, Cato (2012) · 1 $ = 4 210 milliards de marks, nov. 1923</Src>
      </Layer>
      <Layer o={zw}>
        <Title y={150} size={104}>Zimbabwe, 2008</Title>
        <div style={{position: 'absolute', left: 120, top: 330, fontFamily: F.hand, fontWeight: 700, fontSize: 74, opacity: prog(t, b.zimbabwe + 1, b.zimbabwe + 1.4, easeOut)}}>
          prix <Highlight k={prog(t, b.zimbabwe + 1.8, b.zimbabwe + 2.2, easeOut)}>× 2</Highlight> ≈ chaque jour
        </div>
        <Note x={120} y={460} t0={b.zimbabwe + 2.0} size={54} rotate={-2}>lundi ×2 · mardi ×4 · mercredi ×8…</Note>
        {billK > 0.01 ? (
          <>
            <Svg>
              <g transform={`translate(420 760) scale(${billK}) rotate(${(1 - billK) * -12 - 3}) translate(-420 -760)`}>
                <Bill x={420} y={760} w={640} value="" id={410} color="#7A5A12" />
              </g>
            </Svg>
            <div style={{position: 'absolute', left: 100, width: 640, top: 705, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 58, color: '#7A5A12', transform: `scale(${billK}) rotate(-3deg)`}}>
              {shown}
            </div>
            <div style={{position: 'absolute', left: 100, width: 640, top: 790, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: 46, color: '#7A5A12', transform: `scale(${billK}) rotate(-3deg)`}}>dollars</div>
          </>
        ) : null}
        <Src>Sources : Hanke & Krus, Cato (2012) · billet de 100 000 milliards Z$, janv. 2009</Src>
      </Layer>
    </AbsoluteFill>
  );
};

const S7Chute: React.FC<{b: B; end: number}> = ({b, end}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const m = vis(t, b.morale, b.teaser);
  const q = vis(t, b.teaser, end + 1);
  const next = sp(frame, b.next, POP);
  return (
    <AbsoluteFill>
      <Layer o={m}>
        <Title y={330} size={96} k={prog(t, b.morale, b.morale + 0.5, easeOut)}>
          L’argent ne vaut que ce qu’il permet <span style={{whiteSpace: 'nowrap'}}><Highlight k={prog(t, b.morale + 1.1, b.morale + 1.5, easeOut)}>d’acheter</Highlight>.</span>
        </Title>
      </Layer>
      <Layer o={q}>
        <Svg>
          <Temple x={400} y={900} w={420} label="BANQUE" k={prog(t, b.teaser, b.teaser + 0.5, easeOut)} id={7} />
          <text x={760} y={560} fontFamily={F.hand} fontWeight={700} fontSize={260} fill={C.orange} opacity={prog(t, b.teaser + 1.4, b.teaser + 1.7, easeOut)} transform={`rotate(${Math.sin(t * 3) * 4} 760 480)`}>?</text>
          <Circle cx={400} cy={760} rx={300} ry={220} t0={b.teaser + 2.2} color={C.pen} />
        </Svg>
        <Title y={160} size={76} k={prog(t, b.teaser + 0.2, b.teaser + 0.6, easeOut)}>
          Les banques créent de l’argent <Highlight k={prog(t, b.teaser + 1.2, b.teaser + 1.6, easeOut)}>tous les jours</Highlight>
        </Title>
        {next > 0.01 ? (
          <div style={{position: 'absolute', left: 120, top: 1020}}>
            <Sticker k={next} rotate={-3}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 58, color: C.pen, lineHeight: 1.1, display: 'block'}}>la suite :<br />prochaine vidéo →</span>
            </Sticker>
          </div>
        ) : null}
        <Src>Source : Banque de France, « Comment est créée la monnaie ? »</Src>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- Pierrot (persiste d'une page à l'autre) ----------
const pierrot = (b: B, end: number) => {
  const moves: Move[] = [
    {t0: b.facture + 0.1, t1: b.facture + 1.5, x0: 540, x1: 900},
    {t0: b.lundi, t1: b.lundi + 1.2, x0: 900, x1: 540},
    {t0: b.mardi, t1: b.mardi + 0.9, x0: 540, x1: 900},
    {t0: b.histoire + 0.2, t1: b.histoire + 1.2, x0: 900, x1: 880},
    {t0: b.chute, t1: b.chute + 1.4, x0: 880, x1: 540},
    {t0: b.teaser + 0.1, t1: b.teaser + 1.1, x0: 540, x1: 900},
  ];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: b.million + 0.2, pose: 'content'},
    {t: b.spoiler + 0.2, pose: 'hausser', hold: 2.2},
    {t: b.total + 0.3, pose: 'pointer', hold: 1.4},
    {t: b.pib + 0.1, pose: 'pointer', hold: 4.2},
    {t: b.bce, pose: 'choque', hold: 1.0},
    {t: b.bce + 2.9, pose: 'reflechir', hold: 1.6},
    {t: b.lundi + 1.3, pose: 'content', hold: 0.6},
    {t: b.stock + 0.3, pose: 'hausser', hold: 1.6},
    {t: b.prix, pose: 'choque', hold: 0.9},
    {t: b.def + 1.0, pose: 'reflechir', hold: 1.8},
    {t: b.dollar, pose: 'choque', hold: 1.2},
    {t: b.billet + 0.3, pose: 'choque', hold: 1.4},
    {t: b.morale + 1.5, pose: 'content', hold: 0.6},
    {t: b.teaser + 1.3, pose: 'reflechir', hold: 2.0},
    {t: b.next, pose: 'content', hold: end - b.next},
  ];
  return {moves, keys};
};

export const ImprimerArgent: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  // cible du doigt selon la scène
  const target: [number, number] = t < b.twist ? [660, 640] : t < b.histoire ? [600, 820] : t < b.chute ? [600, 700] : [540, 1060];
  // taille : grand dans le hook, plus petit ensuite ; caché sur la planche « Mardi » (il est dans la foule)
  const scale = lerp(1.35, 0.95, prog(t, b.facture, b.facture + 1.2, easeInOut));
  const hide = prog(t, b.mardi + 0.2, b.mardi + 0.5, easeIn) * (1 - prog(t, b.prix - 0.3, b.prix, easeOut));
  return (
    <>
      {/* pages du dessous d'abord, puis pages qui tournent par-dessus */}
      {t >= b.chute - 0.2 ? <S7Chute b={b} end={end} /> : null}
      {t >= b.histoire - 0.1 && t < b.chute + 0.5 ? <S6Histoire b={b} /> : null}
      {t >= b.inflation - 0.1 && t < b.histoire + 0.8 ? (
        <PageTurn t0={b.histoire} dur={0.75}>
          <S5Inflation b={b} />
        </PageTurn>
      ) : null}
      {t >= b.twist - 0.1 && t < b.inflation + 0.2 ? <S4Twist b={b} /> : null}
      {t >= b.facture - 0.3 && t < b.twist + 0.8 ? (
        <PageTurn t0={b.twist} dur={0.75}>
          <S3Facture b={b} />
        </PageTurn>
      ) : null}
      {t < b.facture + 0.3 ? <S1Hook b={b} /> : null}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)', opacity: 1 - hide}}>
        <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={scale} track={{ground: 1360, x: 540, target, moves: P.moves, keys: P.keys}} />
      </svg>
    </>
  );
};

