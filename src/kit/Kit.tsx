// Kit de scènes : une vidéo entière pilotée par script.md, sans écrire de TSX.
// Dans script.md, sous chaque `# section` :
//   >> chiffre                 ← type de scène
//   > titre: la dette *publique*   (*mot* = surligné)
//   > valeur: 3600
//   > quand: dette, parfr       ← balises {@…} qui déclenchent les apparitions (sinon réparties)
// Types : titre, chiffre, compare, barres, camembert, courbe, liste, definition, stickers, teaser.
// Clés communes : titre, source, quand, transition (page), dessin (baguette, billet, temple:LABEL, calendrier:JOUR,
// blé, four, éclair, maison, voiture, soleil, chrono, doc:TITRE), question (oui).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SceneProps} from '../Video';
import {C, clamp01, easeInOut, easeOut, F, FPS, Highlight, lerp, Paper, POP, prog, sp} from '../theme';
import {Mascot} from '../rig/Mascot';
import {Key, Move} from '../rig/rig';
import {PoseName} from '../rig/poses';
import {Arrow, Counter, HandChart, Note, PageTurn, Spiral, Sticker} from '../components/Ink';
import {talkAt} from '../components/Captions';
import {Baguette, Bar, Bill, Bolt, Calendar, Car, Doc, House, Oven, Pie, Src, Stopwatch, Sun, Svg, Temple, vis, Wheat} from '../components/Drawings';

export type Spec = Record<string, string> & {type: string};
type Sec = {id: string; t0: number; t1: number; scene?: Spec | null; beats?: string[]};
const PALETTE = [C.orange, C.pen, C.green, '#9A968C', C.red, '#B98A2E'];

// ---------- lecture des paramètres ----------
const num = (s?: string) => (s ? Number(s.replace(/\s/g, '').replace(',', '.')) : NaN);
const list = (s?: string) => (s ? s.split('|').map((x) => x.trim()).filter(Boolean) : []);
const fmt = (s: string) => s.replace(/(\d),(\d)/g, '$1,$2');
/** « 57,5 étranger » → {v: 57.5, label: 'étranger'} */
const valLabel = (s: string) => {
  const m = s.match(/^([-\d\s,.]+)\s*(.*)$/);
  return m ? {v: num(m[1]), label: m[2], raw: m[1].trim()} : {v: NaN, label: s, raw: ''};
};
/** texte avec *mots* surlignés */
const Rich: React.FC<{text: string; k: number}> = ({text, k}) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((p, i) =>
      p.startsWith('*') ? (
        <Highlight key={i} k={k}>
          {p.slice(1, -1)}
        </Highlight>
      ) : (
        <React.Fragment key={i}>{p}</React.Fragment>
      ),
    )}
  </>
);

/** instants d'apparition : balises listées dans `quand`, sinon réparties dans la section */
const times = (s: Sec, spec: Spec, n: number, b: Record<string, number>) => {
  const q = list(spec.quand?.replace(/,/g, '|'));
  const span = Math.max(1, s.t1 - s.t0 - 1.2);
  return Array.from({length: n}, (_, i) => {
    const name = q[i];
    if (name && b[name] !== undefined) return b[name];
    return s.t0 + 0.4 + (span * i) / Math.max(1, n);
  });
};

// ---------- dessins par nom ----------
export const Drawing: React.FC<{name: string; x: number; y: number; size: number; t: number; id?: number}> = ({name, x, y, size, t, id = 1}) => {
  const [kind, arg] = name.split(':').map((s) => s.trim());
  switch (kind) {
    case 'baguette': return <Baguette x={x} y={y} len={size * 1.6} id={id} />;
    case 'billet': return <Bill x={x} y={y} w={size} id={id} />;
    case 'temple': return <Temple x={x} y={y + size * 0.4} w={size} label={arg ?? ''} k={1} id={id} labelSize={size * 0.09} />;
    case 'calendrier': return <Calendar x={x} y={y} w={size * 0.7} day={arg ?? ''} id={id} />;
    case 'blé': return <Wheat x={x} y={y + size * 0.5} h={size} id={id} />;
    case 'four': return <Oven x={x} y={y + size * 0.3} w={size} t={t} id={id} />;
    case 'éclair': return <Bolt x={x} y={y} s={size / 120} id={id} />;
    case 'maison': return <House x={x} y={y + size * 0.4} s={size / 180} id={id} />;
    case 'voiture': return <Car x={x} y={y + size * 0.2} s={size / 190} id={id} />;
    case 'soleil': return <Sun x={x} y={y} s={size / 180} t={t} />;
    case 'chrono': return <Stopwatch x={x} y={y} r={size / 2} t={t} t0={0} />;
    case 'doc': return <Doc x={x - size / 2} y={y - size * 0.35} w={size} h={size * 0.7} title={arg ?? ''} lines={[]} k={1} id={id} />;
    default: return null;
  }
};

const TitleK: React.FC<{text?: string; t: number; t0: number; size?: number; y?: number}> = ({text, t, t0, size = 84, y = 160}) =>
  text ? (
    <div style={{position: 'absolute', left: 100, right: 100, top: y, textAlign: 'center', fontFamily: F.hand, fontWeight: 700, fontSize: size, lineHeight: 1.08, textShadow: `0 0 10px ${C.paper}`, opacity: prog(t, t0, t0 + 0.35, easeOut), transform: `translateY(${(1 - prog(t, t0, t0 + 0.35, easeOut)) * 30}px)`}}>
      <Rich text={text} k={prog(t, t0 + 0.6, t0 + 1.0, easeOut)} />
    </div>
  ) : null;

// ---------- une scène ----------
const Scene: React.FC<{sec: Sec; spec: Spec; b: Record<string, number>; hook: boolean}> = ({sec, spec, b, hook}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const T0 = sec.t0;
  const title = <TitleK text={spec.titre} t={t} t0={hook ? -1 : T0} size={hook ? 110 : 84} />;
  const drawing = spec.dessin ? (
    <Svg>
      <g transform={`translate(${hook ? 340 : 430} ${hook ? 720 : 620}) scale(${hook ? 1 : sp(frame, T0 + 0.2, POP)}) translate(${hook ? -340 : -430} ${hook ? -720 : -620})`}>
        <Drawing name={spec.dessin} x={hook ? 340 : 430} y={hook ? 720 : 620} size={hook ? 380 : 360} t={t} id={7} />
      </g>
    </Svg>
  ) : null;
  const q = spec.question ? sp(frame, times(sec, spec, 1, b)[0] + 0.4, POP) : 0;
  const question = q > 0 ? (
    <Svg>
      <text x={800} y={760} fontFamily={F.hand} fontWeight={700} fontSize={230} fill={C.orange} transform={`translate(840 680) scale(${q}) rotate(${Math.sin(t * 3) * 5}) translate(-840 -680)`}>?</text>
    </Svg>
  ) : null;
  const src = spec.source ? <Src>Source : {spec.source}</Src> : null;

  switch (spec.type) {
    case 'titre':
      return (
        <>
          {title}
          {spec.sous ? <Note x={130} y={hook ? 420 : 290} t0={hook ? 0.3 : T0 + 0.5} size={56} rotate={-2}>{spec.sous}</Note> : null}
          {drawing}
          {question}
          {src}
        </>
      );
    case 'chiffre': {
      const [ta] = times(sec, spec, 1, b);
      const v = num(spec.valeur);
      const dec = spec.decimales ? Number(spec.decimales) : Number.isInteger(v) ? 0 : 1;
      const k = sp(frame, ta - 0.1, POP);
      return (
        <>
          {title}
          {drawing}
          <div style={{position: 'absolute', left: 110, top: spec.dessin ? 860 : 420, opacity: k > 0.01 ? 1 : 0, transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: '0 50%'}}>
            <Counter from={spec.de ? num(spec.de) : 0} to={v} t0={ta} t1={ta + 1.1} size={150} dec={dec} prefix={spec.prefixe ? spec.prefixe + ' ' : ''} suffix={spec.suffixe ? ' ' + spec.suffixe : ''} color={spec.couleur === 'rouge' ? C.red : C.ink} />
            {spec.unite ? <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 66}}>{spec.unite}</div> : null}
            {spec.note ? <div style={{fontFamily: F.hand, fontSize: 46, color: C.pen, marginTop: 8, opacity: prog(t, ta + 1.3, ta + 1.7, easeOut)}}>{spec.note}</div> : null}
          </div>
          {question}
          {src}
        </>
      );
    }
    case 'compare': {
      const [ta, tb] = times(sec, spec, 2, b);
      const [la, va] = list(spec.gauche);
      const [lb, vb] = list(spec.droite);
      const ka = sp(frame, ta, POP);
      const kb = sp(frame, tb, POP);
      const box = (k: number, top: number, label: string, val: string, color: string, rot: number) =>
        k > 0.01 ? (
          <div style={{position: 'absolute', left: 120, top}}>
            <Sticker k={k} rotate={rot}>
              <div style={{fontFamily: F.hand, fontSize: 44, color: C.muted}}>{label}</div>
              <div style={{fontFamily: F.hand, fontWeight: 700, fontSize: 130, color, whiteSpace: 'nowrap'}}>{fmt(val ?? '')}</div>
            </Sticker>
          </div>
        ) : null;
      return (
        <>
          {title}
          {box(ka, 360, la, va, C.ink, -3)}
          {box(kb, 760, lb, vb, C.red, 2)}
          <Svg>{kb > 0.01 ? <Arrow a={[560, 600]} b={[520, 760]} t0={tb - 0.3} bend={-0.4} color={C.ink} id={9} /> : null}</Svg>
          {src}
        </>
      );
    }
    case 'barres': {
      const vals = list(spec.valeurs).map(num);
      const labs = list(spec.labels);
      const ts = times(sec, spec, vals.length, b);
      const max = Math.max(...vals);
      const H = 560;
      const w = Math.min(190, 560 / vals.length);
      return (
        <>
          {title}
          <Svg>
            {vals.map((v, i) => (
              <Bar key={i} x={130 + i * (w + 40)} base={1080} w={w} h={(v / max) * H} k={prog(t, ts[i], ts[i] + 0.7, easeOut)} color={PALETTE[i % PALETTE.length]} id={20 + i} />
            ))}
          </Svg>
          {vals.map((v, i) => {
            const k = prog(t, ts[i] + 0.5, ts[i] + 0.9, easeOut);
            return k > 0 ? (
              <div key={i} style={{position: 'absolute', left: 130 + i * (w + 40) - 20, width: w + 40, top: 1095, textAlign: 'center', fontFamily: F.hand, opacity: k, whiteSpace: 'nowrap'}}>
                <div style={{fontWeight: 700, fontSize: 50, color: PALETTE[i % PALETTE.length]}}>{fmt(String(v).replace('.', ','))}{spec.unite ? ' ' + spec.unite : ''}</div>
                <div style={{fontSize: 36}}>{labs[i]}</div>
              </div>
            ) : null;
          })}
          {src}
        </>
      );
    }
    case 'camembert': {
      const parts = list(spec.parts).map(valLabel);
      const ts = times(sec, spec, parts.length, b);
      const P = parts.map((p, i) => ({v: p.v, color: PALETTE[i % PALETTE.length], k: prog(t, ts[i], ts[i] + (i === 0 ? 1 : 0.5), easeInOut)}));
      return (
        <>
          {title}
          <Svg>
            <Pie cx={420} cy={580} r={230} parts={P} id={30} />
          </Svg>
          {parts.map((p, i) => {
            const k = sp(frame, ts[i] + 0.2, POP);
            return k > 0.01 ? (
              <div key={i} style={{position: 'absolute', left: 120, top: 870 + i * 76, display: 'flex', alignItems: 'center', gap: 16, opacity: clamp01(k * 2), fontFamily: F.hand, fontSize: 48, whiteSpace: 'nowrap'}}>
                <div style={{width: 36, height: 36, borderRadius: 8, background: P[i].color, opacity: 0.75, border: `4px solid ${C.ink}`}} />
                <b>{fmt(p.raw)} %</b> {p.label}
              </div>
            ) : null;
          })}
          {src}
        </>
      );
    }
    case 'courbe': {
      const vals = list(spec.valeurs).map(num);
      const [ta] = times(sec, spec, 1, b);
      return (
        <>
          {title}
          <Svg>
            <HandChart x={150} y={420} w={580} h={560} t0={ta} dur={1.6} series={[{values: vals, color: spec.couleur === 'vert' ? C.green : C.red}]} xLabels={list(spec.labels)} yLabel={spec.unite} />
          </Svg>
          {spec.note ? <Note x={140} y={1100} t0={ta + 1.8} size={52} rotate={-2}>{spec.note}</Note> : null}
          {src}
        </>
      );
    }
    case 'liste': {
      const items = list(spec.items);
      const icons = list(spec.icones);
      const ts = times(sec, spec, items.length, b);
      const top = spec.titre ? 360 : 220;
      const step = Math.min(160, 820 / Math.max(1, items.length));
      const longest = Math.max(...items.map((x) => x.length));
      const fs = Math.max(42, Math.min(66, Math.floor(470 / (longest * 0.5))));
      return (
        <>
          {title}
          <Svg>
            {icons.map((ic, i) => {
              const k = sp(frame, ts[i], POP);
              const y = top + i * step + 40;
              return k > 0.01 ? (
                <g key={i} transform={`translate(180 ${y}) scale(${k * 0.6}) translate(-180 ${-y})`}>
                  <Drawing name={ic} x={180} y={y} size={200} t={t} id={40 + i} />
                </g>
              ) : null;
            })}
          </Svg>
          {items.map((it, i) => (
            <Note key={i} x={icons.length ? 290 : 130} y={top + i * step} t0={ts[i]} size={fs} rotate={-1} color={C.ink}>{it}</Note>
          ))}
          {src}
        </>
      );
    }
    case 'definition': {
      const [ta] = times(sec, spec, 1, b);
      return (
        <>
          <TitleK text={`*${spec.mot ?? ''}*`} t={t} t0={T0} size={120} y={200} />
          <div style={{position: 'absolute', left: 120, width: 640, top: 430}}>
            <Sticker k={sp(frame, ta + 0.3, POP)} rotate={-2}>
              <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 60, lineHeight: 1.15}}>{spec.texte}</span>
            </Sticker>
          </div>
          {drawing}
          {src}
        </>
      );
    }
    case 'stickers': {
      const items = list(spec.items);
      const ts = times(sec, spec, items.length, b);
      return (
        <>
          {title}
          {items.map((it, i) => {
            const k = sp(frame, ts[i], POP);
            return k > 0.01 ? (
              <div key={i} style={{position: 'absolute', left: 110 + (i % 2) * 30, top: 360 + i * 330, maxWidth: 640}}>
                <Sticker k={k} rotate={i % 2 ? 3 : -4}>
                  <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 54, lineHeight: 1.15}}>{it}</span>
                </Sticker>
              </div>
            ) : null;
          })}
          {src}
        </>
      );
    }
    case 'teaser': {
      const ts = times(sec, spec, 2, b);
      const next = sp(frame, ts[1], POP);
      return (
        <>
          {title}
          {drawing}
          {question}
          {next > 0.01 ? (
            <div style={{position: 'absolute', left: 110, top: 1000, maxWidth: 600}}>
              <Sticker k={next} rotate={-3}>
                <span style={{fontFamily: F.hand, fontWeight: 700, fontSize: 48, color: C.pen, lineHeight: 1.1, display: 'block'}}>
                  la suite :<br />
                  {spec.suite} →
                </span>
              </Sticker>
            </div>
          ) : null}
        </>
      );
    }
    default:
      return title;
  }
};

// ---------- poses automatiques de Pierrot ----------
const POSE_FOR: Record<string, PoseName> = {chiffre: 'pointer', barres: 'pointer', camembert: 'pointer', courbe: 'pointer', compare: 'choque', liste: 'content', definition: 'reflechir', stickers: 'hausser', teaser: 'reflechir', titre: 'content'};

const pierrot = (secs: Sec[], b: Record<string, number>, end: number) => {
  const moves: Move[] = secs.length > 1 ? [{t0: secs[1].t0, t1: secs[1].t0 + 1.1, x0: 790, x1: 900}] : [];
  const keys: Key[] = [{t: 0, pose: 'content', dur: 0.01}];
  secs.forEach((s, i) => {
    const sc = s.scene;
    if (!sc) return;
    const pose = (sc.pose as PoseName) || POSE_FOR[sc.type] || 'content';
    const at = times(s, sc, 1, b)[0] + 0.5;
    keys.push({t: at, pose, hold: Math.max(0.6, Math.min(2.2, s.t1 - at - 0.6))});
    if (i === secs.length - 1) keys.push({t: Math.max(at + 2.5, end - 3), pose: 'content', hold: 5});
  });
  return {moves, keys};
};

// ---------- la vidéo ----------
export const Kit: React.FC<SceneProps> = ({tl, talk}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const b = tl.beats;
  const secs = (tl.sections as Sec[]).map((s) => ({...s, scene: s.scene ?? {type: 'titre'}}));
  const P = pierrot(secs, b, tl.duration);
  const scale = lerp(1.3, 0.95, prog(t, secs[1]?.t0 ?? 999, (secs[1]?.t0 ?? 999) + 1.1, easeInOut));
  // de la dernière à la première : une section suivie d'une « page » est dessinée par-dessus et se tourne
  const layers = secs
    .map((s, i) => {
      const next = secs[i + 1];
      const page = next?.scene?.transition === 'page';
      const tEnd = page ? next!.t0 + 0.8 : s.t1 + 0.2;
      if (t < s.t0 - 0.35 || t > tEnd) return null;
      const body = <Scene sec={s} spec={s.scene!} b={b} hook={i === 0} />;
      if (page)
        return (
          <PageTurn key={s.id} t0={next!.t0} dur={0.75}>
            <AbsoluteFill style={{opacity: i === 0 ? 1 : vis(t, s.t0, 999)}}>
              <Paper />
              <Spiral />
              {body}
            </AbsoluteFill>
          </PageTurn>
        );
      return (
        <AbsoluteFill key={s.id} style={{opacity: i === 0 ? 1 - prog(t, s.t1 - 0.2, s.t1, easeOut) : vis(t, s.t0, s.t1)}}>
          {body}
        </AbsoluteFill>
      );
    })
    .reverse();
  return (
    <>
      {layers}
      <svg width={1080} height={1920} style={{position: 'absolute', filter: 'url(#boil)'}}>
        <Mascot look="pierrot" talk={talkAt(talk, frame)} scale={scale} track={{ground: 1360, x: 790, restFacing: -1, target: [520, 560], moves: P.moves, keys: P.keys}} />
      </svg>
    </>
  );
};
