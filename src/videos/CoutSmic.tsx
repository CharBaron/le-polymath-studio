// Vidéo éco n°4 — « Le vrai coût d'un SMIC »
// Tous les temps viennent de timeline.json. Chiffres : videos/04-vrai-cout-smic/sources.md (simulateur Urssaf, info.gouv.fr)
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeInOut, easeOut, F, FPS, Highlight, lerp, Paper, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move, V} from '../rig/rig';
import {Arrow, Counter, Note, PageTurn, Spiral, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {B, Bar, Cross, Doc, Layer, Src, Svg, Title, useT, vis} from '../components/Drawings';

const ORANGE = C.orange;
const SRC_URSSAF = 'Source : simulateur Urssaf (SMIC 1 867,02 € brut, entreprise de 10 salariés)';
// montants mensuels (€) — sources.md #1-#6
const NET = 1456;
const SAL = 411; // cotisations + CSG salarié = brut − net
const PAT = 821; // cotisations patronales plein tarif = 2 688 − 1 867
const RED = 700; // réduction de cotisations au SMIC

// ---------- ligne de fiche de paie ----------
const PayLine: React.FC<{y: number; label: string; amount: string; k: number; color?: string; bold?: boolean; hl?: number}> = ({y, label, amount, k, color = C.ink, bold, hl = 0}) =>
  k <= 0 ? null : (
    <div style={{position: 'absolute', left: 150, width: 560, top: y, display: 'flex', justifyContent: 'space-between', whiteSpace: 'nowrap', fontFamily: F.hand, fontSize: bold ? 64 : 44, fontWeight: bold ? 700 : 400, color, opacity: clamp01(k * 2), transform: `translateX(${(1 - k) * -30}px)`}}>
      <span>{label}</span>
      <span style={{fontWeight: 700}}>{hl > 0 ? <Highlight k={hl}>{amount}</Highlight> : amount}</span>
    </div>
  );

// ---------- 1 · hook + promesse ----------
const S1Hook: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, -1, b.brut);
  const q = sp(frame, b.cout + 0.4, POP);
  const biz = sp(frame, b.spoiler + 0.6, {damping: 9, stiffness: 240, mass: 0.7});
  return (
    <Layer o={o}>
      <Title y={160} size={110}>le vrai coût</Title>
      <Title y={290} size={110}>
        d’un <Highlight k={1}>SMIC</Highlight>
      </Title>
      <Svg>
        <Doc x={120} y={480} w={480} h={330} title="FICHE DE PAIE" size={40} k={1} id={1} rot={-3} lines={['Net à payer :', '≈ 1 460 €']} />
        <text x={660} y={760} fontFamily={F.hand} fontWeight={700} fontSize={230} fill={ORANGE} transform={`translate(700 680) scale(${q}) rotate(${Math.sin(t * 3) * 5}) translate(-700 -680)`}>?</text>
      </Svg>
      {biz > 0.01 ? (
        <div style={{position: 'absolute', left: 140, top: 880}}>
          <Sticker k={biz} rotate={-6} style={{borderColor: C.red}}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 84, color: C.red}}>bizarre…</span>
          </Sticker>
        </div>
      ) : null}
    </Layer>
  );
};

// ---------- 2 · la fiche de paie ----------
const S2Fiche: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, b.brut, b.patron);
  return (
    <Layer o={o}>
      <Title y={160} size={84} k={prog(t, b.brut, b.brut + 0.4, easeOut)}>ta fiche de paie</Title>
      <Svg>
        <Doc x={110} y={300} w={640} h={560} title="" size={40} k={prog(t, b.brut, b.brut + 0.3, easeOut)} id={10} rot={-1} lines={[]} />
        <line x1={150} y1={640} x2={710} y2={640} stroke={C.ink} strokeWidth={4} opacity={prog(t, b.net - 0.2, b.net, easeOut)} />
      </Svg>
      <PayLine y={380} label="salaire brut" amount="1 867 €" k={prog(t, b.brut + 0.3, b.brut + 0.8, easeOut)} bold hl={prog(t, b.brut + 0.8, b.brut + 1.2, easeOut)} />
      <PayLine y={500} label="− cotisations, CSG" amount="≈ 410 €" k={prog(t, b.cotis, b.cotis + 0.5, easeOut)} color={C.pen} />
      <PayLine y={680} label="= net" amount="≈ 1 460 €" k={prog(t, b.net, b.net + 0.5, easeOut)} bold hl={prog(t, b.net + 0.5, b.net + 0.9, easeOut)} />
      <Src>{SRC_URSSAF}</Src>
    </Layer>
  );
};

// ---------- 3 · la colonne du patron ----------
const Stack: React.FC<{b: B; t: number; cut: number}> = ({b, t, cut}) => {
  const base = 1120;
  const scale = 0.24; // px par €
  const x = 200;
  const w = 220;
  const segs = [
    {v: NET, color: C.green, label: 'ton net', k: prog(t, b.patron, b.patron + 0.5, easeOut)},
    {v: SAL, color: C.pen, label: 'tes cotisations', k: prog(t, b.patron + 0.4, b.patron + 0.9, easeOut)},
    {v: PAT, color: ORANGE, label: 'cotisations du patron', k: prog(t, b.patron + 1.2, b.patron + 2.0, easeInOut)},
  ];
  let y = base;
  return (
    <>
      <Svg>
        {segs.map((s, i) => {
          const h = s.v * scale;
          const y0 = y;
          y -= h;
          return <Bar key={i} x={x} base={y0} w={w} h={h} k={s.k} color={s.color} id={30 + i} />;
        })}
        {cut > 0 ? (
          <g>
            <rect x={x - 6} y={base - (NET + SAL + PAT) * scale - 4} width={w + 12} height={RED * scale + 4} fill={C.paper} opacity={0.6 * cut} />
            <Cross x={x + w / 2} y={base - (NET + SAL + PAT) * scale + (RED * scale) / 2} r={70} t={t} t0={b.reduc + 0.6} />
          </g>
        ) : null}
      </Svg>
      {segs.map((s, i) => {
        let yy = base;
        for (let j = 0; j <= i; j++) yy -= segs[j].v * scale;
        return s.k > 0 ? (
          <div key={i} style={{position: 'absolute', left: x + w + 30, top: yy + (s.v * scale) / 2 - 30, fontFamily: F.hand, fontSize: 44, color: s.color, opacity: s.k, whiteSpace: 'nowrap'}}>
            {s.label}
          </div>
        ) : null;
      })}
    </>
  );
};

const S3Patron: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Title y={150} size={80} k={prog(t, b.patron, b.patron + 0.4, easeOut)}>ce que paie le patron</Title>
      <Stack b={b} t={t} cut={0} />
      <div style={{position: 'absolute', left: 120, top: 260, opacity: prog(t, b.plein, b.plein + 0.4, easeOut)}}>
        <div style={{fontFamily: F.hand, fontSize: 46, color: C.muted}}>plein tarif :</div>
        <Counter from={1867} to={2690} t0={b.plein + 0.2} t1={b.plein + 1.2} size={110} prefix="≈ " suffix=" €" />
      </div>
      <Src>{SRC_URSSAF} · 1 988 + 700 €</Src>
    </AbsoluteFill>
  );
};

// ---------- 4 · rebondissement : la réduction ----------
const S4Twist: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const o = vis(t, b.twist, b.hausse);
  const cut = prog(t, b.reduc + 0.5, b.reduc + 0.9, easeOut);
  return (
    <Layer o={o}>
      <Title y={150} size={78} k={prog(t, b.reduc, b.reduc + 0.4, easeOut)}>
        l’État retire <Highlight k={prog(t, b.reduc + 1.2, b.reduc + 1.6, easeOut)}>≈ 700 €</Highlight>
      </Title>
      <Stack b={{...b, patron: -10}} t={t} cut={cut} />
      <div style={{position: 'absolute', left: 120, top: 270, opacity: prog(t, b.reel, b.reel + 0.4, easeOut)}}>
        <div style={{fontFamily: F.hand, fontSize: 46, color: C.muted}}>coût réel :</div>
        <Counter from={2690} to={1990} t0={b.reel + 0.2} t1={b.reel + 1.2} size={110} prefix="≈ " suffix=" €" color={C.red} />
      </div>
      <Src>{SRC_URSSAF} · réduction générale dégressive (RGDU)</Src>
    </Layer>
  );
};

// ---------- 5 · le piège ----------
const S5Piege: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const o = vis(t, b.hausse, b.retraite);
  const kA = prog(t, b.cent + 0.3, b.cent + 0.9, easeOut);
  const kB = prog(t, b.cent + 1.6, b.cent + 2.4, easeOut);
  const deb = prog(t, b.debat, b.debat + 0.4, easeOut);
  const s1 = sp(frame, b.debat + 0.5, POP);
  const s2 = sp(frame, b.debat + 2.4, POP);
  return (
    <Layer o={o}>
      <Title y={150} size={76} k={prog(t, b.hausse, b.hausse + 0.4, easeOut)}>
        ton salaire monte… la réduction <span style={{color: C.red}}>baisse</span>
      </Title>
      <div style={{opacity: 1 - deb}}>
        <Svg>
          <Bar x={170} base={1000} w={200} h={100 * 2.0} k={kA} color={C.green} id={50} />
          <Bar x={460} base={1000} w={200} h={250 * 2.0} k={kB} color={C.red} id={51} />
          <Arrow a={[290, 760]} b={[460, 560]} t0={b.cent + 1.5} bend={-0.3} color={C.ink} id={52} />
        </Svg>
        <div style={{position: 'absolute', left: 120, width: 300, top: 1020, textAlign: 'center', fontFamily: F.hand, fontSize: 44, opacity: kA, whiteSpace: 'nowrap'}}>
          <b style={{fontSize: 58, color: C.green}}>+100 €</b>
          <br />
          net pour toi
        </div>
        <div style={{position: 'absolute', left: 410, width: 300, top: 1020, textAlign: 'center', fontFamily: F.hand, fontSize: 44, opacity: kB, whiteSpace: 'nowrap'}}>
          <b style={{fontSize: 58, color: C.red}}>≈ +250 €</b>
          <br />
          pour le patron
        </div>
      </div>
      {deb > 0 ? (
        <div style={{opacity: deb}}>
          <div style={{position: 'absolute', left: 120, top: 400}}>
            <Sticker k={s1} rotate={-4}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 56}}>un frein aux augmentations ?</span>
            </Sticker>
          </div>
          <div style={{position: 'absolute', left: 160, top: 680}}>
            <Sticker k={s2} rotate={3}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 56}}>ou un effet limité ?</span>
            </Sticker>
          </div>
          <Note x={140} y={930} t0={b.debat + 3.0} size={46} color={C.pen} rotate={-2}>les économistes ne sont pas d’accord</Note>
        </div>
      ) : null}
      <Src>{SRC_URSSAF} · débat : rapport Bozio-Wasmer (2024)</Src>
    </Layer>
  );
};

// ---------- 6 · teaser retraite ----------
const S6Chute: React.FC<{b: B}> = ({b}) => {
  const t = useT();
  const frame = useCurrentFrame();
  const pas = sp(frame, b.pasta, {damping: 9, stiffness: 240, mass: 0.7});
  const next = sp(frame, b.next + 1.0, POP);
  return (
    <AbsoluteFill>
      <Paper />
      <Spiral />
      <Title y={160} size={80} k={prog(t, b.retraite, b.retraite + 0.4, easeOut)}>
        tes cotisations <Highlight k={prog(t, b.retraite + 0.8, b.retraite + 1.2, easeOut)}>retraite</Highlight>
      </Title>
      <div style={{position: 'absolute', left: 150, top: 320, fontFamily: F.hand, fontWeight: 700, fontSize: 64}}>toi</div>
      <Svg>
        <Mascot look="bic" id={60} scale={0.62} track={{ground: 760, x: 190, keys: [{t: 0, pose: 'content', dur: 0.01}]}} />
        <Arrow a={[290, 600]} b={[560, 600]} t0={b.retraite + 1.0} bend={-0.2} color={C.pen} id={61} />
        <Mascot look="bic" id={61} scale={0.62} track={{ground: 760, x: 660, facing: -1, keys: [{t: 0, pose: 'content', dur: 0.01}]}} />
      </Svg>
      <div style={{position: 'absolute', left: 540, top: 330, fontFamily: F.hand, fontWeight: 700, fontSize: 50, opacity: prog(t, b.retraite + 1.4, b.retraite + 1.8, easeOut)}}>les retraités</div>
      {pas > 0.01 ? (
        <div style={{position: 'absolute', left: 150, top: 820}}>
          <Sticker k={pas} rotate={-5} style={{borderColor: C.red}}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 72, color: C.red}}>pas la tienne.</span>
          </Sticker>
        </div>
      ) : null}
      {next > 0.01 ? (
        <div style={{position: 'absolute', left: 110, top: 1040}}>
          <Sticker k={next} rotate={-3}>
            <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 46, color: C.pen, lineHeight: 1.1, display: 'block'}}>
              la suite :<br />la retraite par répartition →
            </span>
          </Sticker>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------- Pierrot ----------
const pierrot = (b: B, end: number) => {
  const moves: Move[] = [{t0: b.brut, t1: b.brut + 1.2, x0: 790, x1: 900}];
  const keys: Key[] = [
    {t: 0, pose: 'content', dur: 0.01},
    {t: b.cout, pose: 'reflechir', hold: 1.6},
    {t: b.spoiler + 0.4, pose: 'hausser', hold: 1.2},
    {t: b.net, pose: 'pointer', hold: 1.6},
    {t: b.plein, pose: 'choque', hold: 1.2},
    {t: b.reduc + 0.6, pose: 'pointer', hold: 1.8},
    {t: b.reel + 0.4, pose: 'content', hold: 1.0},
    {t: b.cent + 1.6, pose: 'choque', hold: 1.2},
    {t: b.debat + 0.4, pose: 'hausser', hold: 2.4},
    {t: b.retraite + 0.4, pose: 'reflechir', hold: 1.6},
    {t: b.pasta, pose: 'choque', hold: 0.9},
    {t: b.next, pose: 'content', hold: end - b.next},
  ];
  return {moves, keys};
};

export const CoutSmic: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const end = tl.duration;
  const P = pierrot(b, end);
  const target: V = t < b.brut ? [520, 640] : t < b.patron ? [640, 740] : [480, 700];
  const scale = lerp(1.3, 0.95, prog(t, b.brut, b.brut + 1.2, easeInOut));
  return (
    <>
      {t >= b.twist - 0.1 && t < b.chute + 0.8 ? (
        <>
          <S4Twist b={b} />
          <S5Piege b={b} />
        </>
      ) : null}
      {t >= b.chute - 0.1 ? <S6Chute b={b} /> : null}
      {t >= b.hausse && t < b.chute + 0.8 ? (
        <PageTurn t0={b.chute} dur={0.75}>
          <AbsoluteFill>
            <Paper />
            <Spiral />
            <S5Piege b={b} />
          </AbsoluteFill>
        </PageTurn>
      ) : null}
      {t < b.patron + 0.3 ? (
        <AbsoluteFill>
          <S1Hook b={b} />
          <S2Fiche b={b} />
        </AbsoluteFill>
      ) : null}
      {t >= b.patron - 0.3 && t < b.twist + 0.8 ? (
        <PageTurn t0={b.twist} dur={0.75}>
          <S3Patron b={b} />
        </PageTurn>
      ) : null}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
        <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={scale} track={{ground: 1360, x: 790, target, moves: P.moves, keys: P.keys}} />
      </svg>
    </>
  );
};
