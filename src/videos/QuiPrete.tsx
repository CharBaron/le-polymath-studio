// Vidéo éco n°2 — « Qui prête à la France ? »
// Tous les temps viennent de timeline.json. Chiffres : videos/02-qui-prete-a-la-france/sources.md
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeIn, easeInOut, easeOut, F, FPS, Highlight, lerp, Paper, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, V} from '../rig/rig';
import {Arrow, Counter, fmtFR, Note, PageTurn, Spiral, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Baguette, Bill, BittenBill, Calendar, Doc, Layer, Pie, Src, Stopwatch, Svg, Temple, Title, useT, vis} from '../components/Drawings';

const ORANGE = C.orange;
const PARTS = [
  {key: 'etranger', v: 57.5, color: ORANGE, label: 'étranger', pct: '57,5 %'},
  {key: 'banques', v: 10.5, color: C.pen, label: 'banques françaises', pct: '10,5 %'},
  {key: 'assureurs', v: 9.6, color: C.green, label: 'assureurs français', pct: '9,6 %'},
  {key: 'autres', v: 22.4, color: '#9A968C', label: 'autres résidents', pct: '22,4 %'},
];

// ---------- 1 · hook + promesse ----------
const S1Hook: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, -1, b.dette);
  const titleOut = prog(t, b.toi - 0.1, b.toi + 0.25, easeIn);
  const q = sp(frame, b.qui, POP);
  const toi = sp(frame, b.toi + 0.5, {damping: 9, stiffness: 230, mass: 0.7});
  // billets qui partent du calendrier vers la droite, en boucle
  const bills = Array.from({length: 4}, (_, i) => {
    const u = ((t * 0.55 + i * 0.25) % 1);
    return {x: lerp(330, 980, easeIn(u)), y: 700 - Math.sin(u * Math.PI) * 120, o: 1 - u, r: u * 40 - 10};
  });
  return (
    <Layer o={o}>
      <div style={{opacity: 1 - titleOut}}>
        <Title y={170} size={124}>
          Qui prête
        </Title>
        <Title y={310} size={124}>
          à la <Highlight k={1}>France</Highlight> ?
        </Title>
        <Svg>
          <Calendar x={250} y={720} w={240} day="LUNDI" id={1} />
          <g opacity={prog(t, 0.6, 1.2, easeOut)}>
            {bills.map((bl, i) => (
              <g key={i} opacity={bl.o}>
                <Bill x={bl.x} y={bl.y} w={150} rot={bl.r} id={20 + i} />
              </g>
            ))}
          </g>
          <text x={840} y={540} fontFamily={F.hand} fontWeight={700} fontSize={260} fill={ORANGE} transform={`translate(840 450) scale(${q}) rotate(${Math.sin(t * 3) * 5}) translate(-840 -450)`}>?</text>
        </Svg>
        <Note x={110} y={880} t0={0.9} size={50} rotate={-3}>chaque lundi,</Note>
        <Note x={110} y={940} t0={1.2} size={50} rotate={-3}>des milliards</Note>
      </div>
      {toi > 0.01 ? (
        <>
          <Title y={200} size={80} k={prog(t, b.toi, b.toi + 0.4, easeOut)}>un des prêteurs…</Title>
          <div style={{position: 'absolute', left: 680, top: 470}}>
            <Sticker k={toi} rotate={-6} style={{borderColor: ORANGE}}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 120, color: ORANGE}}>toi ?</span>
            </Sticker>
          </div>
        </>
      ) : null}
    </Layer>
  );
};

// ---------- 2 · la dette ----------
const S2Dette: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, b.dette, b.oblig);
  const per = sp(frame, b.parfr, POP);
  return (
    <Layer o={o}>
      <Title y={170} size={84} k={prog(t, b.dette, b.dette + 0.4, easeOut)}>la dette publique</Title>
      <div style={{position: 'absolute', left: 120, top: 330}}>
        <Counter from={0} to={3600} t0={b.dette + 0.3} t1={b.dette + 1.8} size={150} prefix="≈ " />
        <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 72, color: C.ink, marginTop: -4}}>milliards d’euros</div>
        <div style={{fontFamily: F.hand, fontSize: 46, color: C.pen, marginTop: 10, opacity: prog(t, b.dette + 1.9, b.dette + 2.3, easeOut)}}>soit 119 % du PIB</div>
      </div>
      {per > 0.01 ? (
        <div style={{position: 'absolute', left: 120, top: 760}}>
          <Sticker k={per} rotate={3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 74, lineHeight: 1.1, display: 'block'}}>
              ≈ <Highlight k={prog(t, b.parfr + 0.4, b.parfr + 0.8, easeOut)}>52 000 €</Highlight>
              <br />
              <span style={{fontSize: 56}}>par Français</span>
            </span>
          </Sticker>
        </div>
      ) : null}
      <Src>Source : INSEE, dette fin juin 2026 (3 595,5 Md€) · population 2026</Src>
    </Layer>
  );
};

// ---------- 3 · les obligations ----------
const S3Oblig: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, b.oblig, b.preteurs);
  const kDoc = prog(t, b.oblig + 0.2, b.oblig + 2.6, easeInOut);
  const kFlow = prog(t, b.pret, b.pret + 0.4, easeOut);
  return (
    <Layer o={o}>
      <Svg>
        <Doc x={130} y={190} w={620} h={470} title="RECONNAISSANCE DE DETTE" size={40} k={kDoc} id={40} lines={['L’État doit : 100 €', 'remboursé : dans 10 ans', '+ intérêts chaque année', 'signé : l’État  ~~~']} />
        <g opacity={kFlow}>
          <Temple x={520} y={1010} w={200} label="ÉTAT" k={kFlow} id={41} />
        </g>
      </Svg>
      {kFlow > 0 ? (
        <>
          <div style={{position: 'absolute', left: 120, top: 830, fontFamily: F.hand, fontWeight: 700, fontSize: 64, color: C.ink, opacity: kFlow}}>toi</div>
          <Svg>
            <Arrow a={[210, 920]} b={[400, 900]} t0={b.pret + 0.2} bend={-0.25} color={C.green} />
            <Arrow a={[420, 1060]} b={[190, 1065]} t0={b.pret + 1.6} bend={-0.25} color={ORANGE} id={5} />
          </Svg>
          <Note x={250} y={780} t0={b.pret + 0.4} size={54} color={C.green} rotate={-4}>100 €</Note>
          <Note x={130} y={1110} t0={b.pret + 1.9} size={48} color={ORANGE} rotate={-2}>100 € + intérêts, plus tard</Note>
        </>
      ) : null}
      <Src>Source : Agence France Trésor (OAT, programme 2026 : 310 Md€)</Src>
    </Layer>
  );
};

// ---------- 4 · les prêteurs ----------
const S4Preteurs: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const at = [b.etranger + 0.9, b.banques + 0.3, b.assureurs + 0.3, b.assureurs + 1.5];
  const parts = PARTS.map((p, i) => ({...p, k: prog(t, at[i], at[i] + (i === 0 ? 1.0 : 0.5), easeInOut)}));
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Title y={150} size={88} k={prog(t, b.preteurs, b.preteurs + 0.4, easeOut)}>qui achète ?</Title>
      <Svg>
        <Pie cx={420} cy={590} r={230} parts={parts} id={6} />
      </Svg>
      {parts.map((p, i) => {
        const k = sp(frame, at[i] + 0.2, POP);
        if (k <= 0.01) return null;
        return (
          <div key={p.key} style={{position: 'absolute', left: 120, top: 880 + i * 82, display: 'flex', alignItems: 'center', gap: 18, transform: `translateX(${(1 - k) * -40}px)`, opacity: clamp01(k * 2)}}>
            <div style={{width: 40, height: 40, borderRadius: 8, background: p.color, opacity: 0.75, border: `4px solid ${C.ink}`}} />
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 50, color: C.ink, lineHeight: 1}}>
              {i === 0 ? <Highlight k={prog(t, b.etranger + 1.6, b.etranger + 2.0, easeOut)}>{p.pct}</Highlight> : p.pct} <span style={{fontWeight: 400}}>{p.label}</span>
              {i === 3 ? <span style={{display: 'block', fontSize: 34, fontWeight: 400, color: C.muted, marginTop: 4}}>dont la Banque de France</span> : null}
            </span>
          </div>
        );
      })}
      <Src>Source : Banque de France via AFT · dette négociable de l’État, T1 2026</Src>
    </AbsoluteFill>
  );
};

// ---------- 5 · rebondissement : assurance-vie + Banque de France ----------
const Family: React.FC<{t0: number}> = ({t0}) => (
  <>
    {[0, 1, 2].map((i) => (
      <Mascot
        key={i}
        look="bic"
        id={40 + i}
        scale={i === 2 ? 0.42 : 0.55}
        track={{ground: 1130, x: 170 + i * 150, keys: [{t: t0 + i * 0.15, pose: 'content'}]}}
      />
    ))}
  </>
);

const S5Twist: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const sAv = vis(t, b.twist, b.bdf);
  const sBdf = vis(t, b.bdf, b.interets);
  const kAv = prog(t, b.av + 0.6, b.av + 1.6, easeOut);
  const bdfK = prog(t, b.bdf + 0.3, b.bdf + 0.9, easeOut);
  return (
    <>
      <Layer o={sAv}>
        <Title y={150} size={80} k={prog(t, b.av, b.av + 0.4, easeOut)}>
          ton <Highlight k={prog(t, b.av + 1.4, b.av + 1.8, easeOut)}>assurance-vie</Highlight>
        </Title>
        <Svg>
          <Doc x={120} y={330} w={400} h={300} title="Assurance-vie" size={38} k={kAv} id={50} rot={-4} accent={C.green} lines={['fonds en euros', 'capital garanti']} />
          <Doc x={560} y={420} w={230} h={190} title="OAT" size={40} k={prog(t, b.av + 1.6, b.av + 2.3, easeOut)} id={51} rot={5} lines={['État']} />
          <Arrow a={[470, 690]} b={[620, 650]} t0={b.av + 1.5} bend={0.3} color={C.green} id={52} />
        </Svg>
        <Note x={120} y={700} t0={b.av + 2.2} size={48} color={C.green} rotate={-2}>fonds en euros → titres publics</Note>
        <Svg>{t > b.parents - 0.2 ? <Family t0={b.parents} /> : null}</Svg>
        <Note x={120} y={1150} t0={b.parents + 0.8} size={46} rotate={-2}>toi ou tes parents = prêteurs</Note>
        <Src>Source : Banque de France / ACPR, placements des assureurs</Src>
      </Layer>
      <Layer o={sBdf}>
        <Svg>
          <Temple x={420} y={1000} w={420} label="BANQUE DE FRANCE" labelSize={32} k={bdfK} id={53} />
        </Svg>
        <div style={{position: 'absolute', left: 120, top: 170, transform: `scale(${sp(frame, b.bdf + 0.8, POP)})`, transformOrigin: '0 50%'}}>
          <Counter from={0} to={490} t0={b.bdf + 0.9} t1={b.bdf + 2.0} size={130} prefix="≈ " />
          <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 64}}>milliards d’euros</div>
        </div>
        <Note x={120} y={1080} t0={b.bdf + 2.6} size={46} rotate={-2}>achetés sur le marché,</Note>
        <Note x={120} y={1135} t0={b.bdf + 3.0} size={46} rotate={-2}>pas directement à l’État</Note>
        <Src>Source : Banque de France, 488 Md€ au 30/06/2026 · TFUE art. 123</Src>
      </Layer>
    </>
  );
};

// ---------- 6 · le prix ----------
const S6Prix: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, b.interets, b.chute + 0.8);
  const sw = sp(frame, b.seconde, POP);
  const paid = Math.max(0, t - b.seconde - 0.3) * 1839;
  return (
    <Layer o={o}>
      <Title y={150} size={84} k={prog(t, b.interets, b.interets + 0.4, easeOut)}>les intérêts</Title>
      <div style={{position: 'absolute', left: 120, top: 290}}>
        <Counter from={0} to={58} t0={b.interets + 1.0} t1={b.interets + 2.0} size={150} prefix="≈ " suffix=" Md€" />
        <div style={{fontFamily: F.hand, fontSize: 52, color: C.pen}}>prévus pour 2026</div>
      </div>
      {sw > 0.01 ? (
        <>
          <Svg>
            <Stopwatch x={300} y={820} r={150} t={t} t0={b.seconde} k={sw} />
          </Svg>
          <div style={{position: 'absolute', left: 480, top: 700, fontFamily: F.hand, fontWeight: 700, fontSize: 62, color: C.red, transform: `scale(${sw})`, transformOrigin: '0 50%'}}>≈ 1 800 €</div>
          <div style={{position: 'absolute', left: 480, top: 780, fontFamily: F.hand, fontSize: 48, color: C.ink, opacity: sw}}>par seconde</div>
          <div style={{position: 'absolute', left: 120, top: 1020, fontFamily: F.hand, fontSize: 46, color: C.muted, opacity: prog(t, b.seconde + 0.6, b.seconde + 1.0, easeOut)}}>
            depuis cette phrase : <span style={{color: C.ink, fontWeight: 700}}>{fmtFR(paid)} €</span>
          </div>
        </>
      ) : null}
      <Src>Source : Sénat, PLF 2026 (charge de la dette : 58,0 Md€) · 58 Md€ / an ÷ secondes</Src>
    </Layer>
  );
};

// ---------- 7 · chute + teaser baguette ----------
const S7Chute: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const sInf = vis(t, b.chute, b.baguette);
  const sBag = vis(t, b.baguette, 999);
  const bites = prog(t, b.ennemi + 1.2, b.ennemi + 3.2, easeInOut);
  const bag = sp(frame, b.baguette + 0.1, {damping: 11, stiffness: 160});
  const next = sp(frame, b.next, POP);
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Layer o={sInf}>
        <Title y={160} size={84} k={prog(t, b.ennemi, b.ennemi + 0.4, easeOut)}>
          leur ennemi : <Highlight k={prog(t, b.ennemi + 0.9, b.ennemi + 1.3, easeOut)}>l’inflation</Highlight>
        </Title>
        <Svg>
          <BittenBill x={430} y={620} w={520} bites={bites} value="100" id={70} />
        </Svg>
        <Note x={150} y={860} t0={b.ennemi + 1.6} size={54} color={C.red} rotate={-3}>on te rend 100 €…</Note>
        <Note x={150} y={930} t0={b.ennemi + 2.4} size={54} color={C.red} rotate={-3}>…qui achètent moins</Note>
      </Layer>
      <Layer o={sBag}>
        <Svg>
          <g transform={`translate(430 560) scale(${bag}) translate(-430 -560)`}>
            <Baguette x={430} y={560} len={620} id={80} />
          </g>
          <text x={780} y={760} fontFamily={F.hand} fontWeight={700} fontSize={200} fill={ORANGE} opacity={prog(t, b.baguette + 1.0, b.baguette + 1.3, easeOut)} transform={`rotate(${Math.sin(t * 3) * 5} 820 690)`}>?</text>
        </Svg>
        <Title y={160} size={76} k={prog(t, b.baguette, b.baguette + 0.4, easeOut)}>
          pourquoi elle coûte <Highlight k={prog(t, b.baguette + 1.4, b.baguette + 1.8, easeOut)}>plus cher</Highlight> ?
        </Title>
        {next > 0.01 ? (
          <div style={{position: 'absolute', left: 120, top: 900}}>
            <Sticker k={next} rotate={-3}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 50, color: C.pen, lineHeight: 1.1, display: 'block'}}>
                la suite :<br />le prix de la baguette →
              </span>
            </Sticker>
          </div>
        ) : null}
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- Pierrot ----------
const pierrot = (b: B, end: number) => {
  const moves: Move[] = [
    {t0: b.dette, t1: b.dette + 1.2, x0: 600, x1: 900},
  ];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: b.qui, pose: 'reflechir', hold: 0.6},
    {t: b.toi + 0.4, pose: 'pointer', hold: 2.0},
    {t: b.parfr, pose: 'choque', hold: 1.0},
    {t: b.pret + 0.2, pose: 'pointer', hold: 2.6},
    {t: b.etranger + 0.8, pose: 'pointer', hold: 7.5},
    {t: b.av + 0.5, pose: 'reflechir', hold: 2.2},
    {t: b.parents + 0.3, pose: 'content', hold: 1.6},
    {t: b.bdf + 0.4, pose: 'choque', hold: 1.0},
    {t: b.interets + 1.8, pose: 'choque', hold: 0.9},
    {t: b.seconde + 0.3, pose: 'hausser', hold: 1.6},
    {t: b.ennemi + 1.5, pose: 'choque', hold: 1.0},
    {t: b.baguette + 0.6, pose: 'reflechir', hold: 2.0},
    {t: b.next, pose: 'content', hold: end - b.next},
  ];
  return {moves, keys};
};

export const QuiPrete: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  const target: V = t < b.dette ? [800, 600] : t < b.preteurs ? [560, 960] : t < b.twist ? [560, 600] : [600, 800];
  const scale = lerp(1.3, 0.95, prog(t, b.dette, b.dette + 1.2, easeInOut));
  return (
    <>
      {t >= b.twist - 0.1 && t < b.chute + 0.8 ? (
        <S5Twist b={b} />
      ) : null}
      {t >= b.chute - 0.1 ? (
        <AbsoluteFill>
          <S7Chute b={b} />
        </AbsoluteFill>
      ) : null}
      {t >= b.interets && t < b.chute + 0.8 ? (
        <PageTurn t0={b.chute} dur={0.75}>
          <AbsoluteFill>
            <Paper />
            <Spiral />
            <S6Prix b={b} />
          </AbsoluteFill>
        </PageTurn>
      ) : null}
      {t < b.twist ? (
        <>
          <S1Hook b={b} />
          <S2Dette b={b} />
          <S3Oblig b={b} />
        </>
      ) : null}
      {t >= b.preteurs - 0.3 && t < b.twist + 0.8 ? (
        <PageTurn t0={b.twist} dur={0.75}>
          <S4Preteurs b={b} />
        </PageTurn>
      ) : null}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
        <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={scale} track={{ground: 1360, x: 600, target, moves: P.moves, keys: P.keys}} />
      </svg>
    </>
  );
};
