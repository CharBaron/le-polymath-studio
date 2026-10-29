// Moteur de plans de la DA « Gravure » : une vidéo = une liste de plans calés sur les balises du script.
// Chaque plan : fond, transition d'entrée, un sujet (pièce, chiffre, image(s), carte-titre, mot-concept, citation, balance)
// et des ornements (rayons, faisceau, crochets, tampon, couronne, laurier, light leak, mot qui claque).
// Le titre d'accroche (`hook:` du script) s'affiche jusqu'à 2,9 s puis revient sur la dernière image pour la boucle.
// v3 (montage « violent », relevé image par image de @dernier.maillon) :
//  - caméra qui pousse en continu (sens alterné d'un plan à l'autre) ;
//  - jump-cuts automatiques calés sur les mots dits, dans tout plan de plus de 1,3 s (sauf cartes de texte et `still`) ;
//  - secousse + aberration chromatique sur les impacts (slam, flashRed, glitch, invert, tampon, mot qui claque) ;
//  - transitions slam, swipe (défilement vertical façon TikTok), spin, invert, shutter ;
//  - chiffres en stroboscope (`num.strobe`) : chaque chiffre seul en plein écran, puis le nombre arrive avec traînée de flou.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp01, FPS, lerp, prog, rand} from '../theme';
import type {SceneProps} from '../Video';
import type {Word} from '../components/Captions';
import {jumpsOf, Shot, STROBE_EVERY, strobeDigits, strobeLen, textCard, Tr} from './shots';
import {Accent, applyTheme, Backdrop, Hud, THEME, Theme, Balance, Beam, Brackets, Coin, ConceptWord, Crown, DigitStrobe, easeIn, easeOut, Filters, Finish, G, GCaptions, GF, GlitchBands, GlitchFilter, HookTitle, Laurel, LinesCard, Num, overshoot, Pic, QuoteCard, Rays, SlamWord, Smear, SpeedLines, Stamp, TitleCard} from './Gravure';

export type {Shot, Spin, Tr} from './shots';
export {wordAt} from './shots';

const TR = 0.16;
const TR_OF: Partial<Record<Tr, number>> = {swipe: 0.26, spin: 0.24, shutter: 0.2, slam: 0.14};
const IMPACT: Partial<Record<Tr, number>> = {slam: 1, flashRed: 0.8, glitch: 0.6, invert: 0.9, shutter: 0.4, swipe: 0.25};
const FRAMES: [number, number, number][] = [[1, 0, 0], [1.14, -26, -30], [1.06, 22, 18], [1.2, 0, -50]];

/** animation sur mesure : lt = temps depuis le début du plan, p = paramètres du plan (shot.anim) */
export type AnimProps = {id: string; lt: number; t: number; t0: number; t1: number; p: NonNullable<Shot['anim']>; words: Word[]};
export type Anims = Record<string, React.FC<AnimProps>>;

const ShotView: React.FC<{id: string; faces: [string, string]; s: Shot; t: number; t1: number; words: Word[]; spin: number; anims: Anims}> = ({id: ID, faces, s, t, t1, words, spin, anims}) => {
  const lt = t - s.t0;
  const dur = Math.max(0.4, t1 - s.t0);
  const z = (s.pic?.zoom ?? (s.pic?.focus ? 0.22 : 0.04)) * easeOut(clamp01(lt / dur));
  const A = s.anim ? anims[s.anim.name] : undefined;
  const sl = strobeLen(s);
  if (sl && lt < sl) return <DigitStrobe id={ID} text={s.num!.text} lt={lt} every={STROBE_EVERY} />;
  let coinEl: React.ReactNode = null;
  if (s.coin) {
    const sp = s.coin.spin;
    let half = s.coin.half ?? 0, lift = 0;
    if (sp) {
      const p = prog(t, sp.t0, sp.t1, easeOut);
      half = lerp(sp.from, sp.to, p);
      lift = Math.sin(clamp01((t - sp.t0) / (sp.t1 - sp.t0)) * Math.PI) * 200;
    }
    coinEl = <Coin id={ID} faces={faces} halfTurns={half} lift={lift} />;
  }
  const rayK = s.rays ? (s.t0 === 0 ? 1 : prog(lt, 0, 0.5, easeOut)) : 0;
  const numEl = s.num ? <Num text={s.num.text} t={t} t0={sl ? s.t0 + sl - 0.32 - (Math.max(1, strobeDigits(s.num.text).length) - 1) * 0.11 : s.t0 + 0.04} color={s.num.color} label={s.num.label} frieze={s.num.frieze} size={s.num.size} /> : null;
  return (
    <AbsoluteFill>
      {s.rays ? <Rays k={rayK} rot={t * spin} cy={s.num ? 790 : 760} dark={s.rays === 'dark'} /> : null}
      {coinEl}
      {s.balance ? <Balance k={prog(lt, 0, 0.45)} tilt={lerp(s.balance.tilt[0], s.balance.tilt[1], prog(lt, 0.25, 1.4, easeOut))} left={s.balance.left} right={s.balance.right} /> : null}
      {s.pic ? <Pic id={ID} name={s.pic.name} w={s.pic.w} y={s.pic.y} z={z} focus={s.pic.focus} full={s.pic.full} /> : null}
      {s.pics?.map((q, i) => {
        const k = prog(lt, q.at, q.at + 0.22, overshoot);
        return lt < q.at ? null : <Pic key={i} id={ID} name={q.name} w={q.w} x={q.x} y={q.y} rot={(q.rot ?? 0) + (1 - k) * 12} z={lerp(-0.6, 0, k) + 0.03 * clamp01((lt - q.at) / dur)} />;
      })}
      {A ? <A id={ID} lt={lt} t={t} t0={s.t0} t1={t1} p={s.anim!} words={words} /> : null}
      {numEl ? (sl ? <Smear lt={lt - sl} streak y={780}>{numEl}</Smear> : numEl) : null}
      {s.card ? <TitleCard words={words} t={t} t0={s.t0} t1={t1} strike={s.card.strike} /> : null}
      {s.concept ? <ConceptWord word={s.concept.word} sub={s.concept.sub} t={t} t0={s.t0 + 0.05} /> : null}
      {s.lines ? <LinesCard draw={s.lines.full ? 1 : prog(lt, 0.05, 1.0)} pick={s.lines.pick} wrong={s.lines.wrong} pickK={prog(lt, s.lines.pickAt ?? 0, (s.lines.pickAt ?? 0) + 0.25, easeOut)} votes={s.lines.votes} /> : null}
      {s.quote ? <QuoteCard lines={s.quote.lines} sign={s.quote.sign} t={t} t0={s.t0} /> : null}
      {s.laurel ? <Laurel cx={540} cy={s.laurel.cy} r={s.laurel.r} dark={s.laurel.dark} k={prog(lt, s.laurel.at ?? 0.2, (s.laurel.at ?? 0.2) + 0.9)} /> : null}
      {s.crown ? <Crown x={540} y={s.crown.y} w={s.crown.w ?? 280} k={prog(lt, s.crown.at, s.crown.at + 0.7)} /> : null}
      {s.brackets ? <Brackets {...s.brackets} k={prog(lt, s.brackets.at ?? 0.3, (s.brackets.at ?? 0.3) + 0.35)} t={t} /> : null}
      {s.title ? <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: Math.min(120, 1100 / s.title.length), color: G.gold, letterSpacing: '0.04em', opacity: prog(lt, 0.15, 0.5), transform: `translateY(${(1 - prog(lt, 0.15, 0.6, easeOut)) * 24}px)`, textShadow: THEME.base === 'light' ? G.shadow : `0 0 24px rgba(${G.goldRgb},0.45), 0 6px 18px rgba(0,0,0,0.8)`}}>{s.title}</div> : null}
      {s.topLabel ? <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: GF.label, fontWeight: 900, fontSize: 50, letterSpacing: '0.22em', color: s.bg === 'white' || (THEME.base === 'light' && (s.bg ?? 'marble') === 'marble') ? '#2A1E0C' : G.text, opacity: prog(lt, 0.3, 0.6)}}>{s.topLabel}</div> : null}
      {s.stamp ? <Stamp text={s.stamp.text} t={t} t0={s.stamp.at} size={s.stamp.size} y={s.stamp.y} rot={s.stamp.rot} color={s.stamp.color} /> : null}
      {s.slam ? <SlamWord text={s.slam.text} lt={lt - (s.slam.at ?? 0.04)} y={s.slam.y} size={s.slam.size} color={s.slam.color} /> : null}
      {s.beam ? <Beam p={prog(lt, 0.05, 1.0, (x) => x)} /> : null}
    </AbsoluteFill>
  );
};

/** entrée / sortie d'un plan (p : 0 → 1 pendant la transition) */
const trStyle = (tr: Tr, p: number, incoming: boolean): React.CSSProperties => {
  const q = incoming ? 1 - p : p; // 1 = loin
  if (tr === 'whip') return {opacity: incoming ? clamp01(p * 2) : 1 - p, transform: `translateX(${(incoming ? 1 : -1) * q * 760}px)`, filter: `blur(${q * 22}px)`};
  if (tr === 'zoom') return {opacity: incoming ? p : 1 - p, transform: `scale(${incoming ? lerp(1.32, 1, p) : lerp(1, 0.9, p)})`, filter: `blur(${q * 12}px)`};
  if (tr === 'slam') return incoming ? {opacity: clamp01(p * 4), transform: `scale(${lerp(1.9, 1, p)})`, filter: `blur(${q * 14}px)`} : {opacity: 1 - p, transform: `scale(${lerp(1, 1.18, p)})`};
  if (tr === 'swipe') return {transform: `translateY(${incoming ? (1 - p) * 1920 : -p * 1920}px)`, filter: `blur(${Math.sin(p * Math.PI) * 6}px)`};
  if (tr === 'spin') return incoming ? {opacity: clamp01(p * 2), transform: `rotate(${lerp(-28, 0, p)}deg) scale(${lerp(1.45, 1, p)})`, filter: `blur(${q * 16}px)`} : {opacity: 1 - p, transform: `rotate(${lerp(0, 22, p)}deg) scale(${lerp(1, 0.8, p)})`};
  if (tr === 'shutter') return {opacity: incoming ? (p >= 0.5 ? 1 : 0) : p < 0.5 ? 1 : 0};
  if (tr === 'flash' || tr === 'flashRed' || tr === 'glitch' || tr === 'invert') return {opacity: incoming ? clamp01(p * 3) : 1 - clamp01(p * 3)};
  return {opacity: incoming ? p : 1 - p, transform: `scale(${incoming ? lerp(1.07, 1, p) : 1})`, filter: `blur(${q * 18}px)`};
};

/** cadrage du plan : poussée lente (sens alterné), saut de cadre à chaque jump-cut, petit coup de zoom à l'arrivée */
const camera = (s: Shot, i: number, t: number, t1: number, jumps: number[], punch: number): string => {
  if (s.still || s.num || textCard(s)) return `scale(${1 + 0.03 * punch})`;
  const dur = Math.max(0.4, t1 - s.t0), u = clamp01((t - s.t0) / dur);
  const push = i % 2 ? 1 + 0.07 * u : 1.07 - 0.07 * u;
  let j = 0, tj = s.t0;
  for (const x of jumps) if (t >= x) { j++; tj = x; }
  const [fs, fx, fy] = FRAMES[j % FRAMES.length];
  const jp = j ? 1 - prog(t, tj, tj + 0.12, easeOut) : 0; // coup de zoom au saut
  const drift = (i % 3 - 1) * 18 * u;
  return `translate(${fx + drift}px, ${fy}px) scale(${push * fs * (1 + 0.05 * jp + 0.08 * punch)})`;
};

/** fabrique la scène d'une vidéo Gravure à partir de sa liste de plans (balises de timeline.json → plans) */
export const makeReel = (ID: string, shotsOf: (B: Record<string, number>, words: Word[], dur: number) => Shot[], coinFaces: [string, string] = ['coin_pile', 'coin_face'], theme: Accent | Theme = 'or', anims: Anims = {}) => {
  const Reel: React.FC<SceneProps> = ({tl, words}) => {
  applyTheme(theme);
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shots = React.useMemo(() => shotsOf(tl.beats, words, tl.duration), [tl, words]);
  const jumps = React.useMemo(() => shots.map((s, k) => jumpsOf(s, shots[k + 1]?.t0 ?? tl.duration, words)), [shots, words, tl]);
  let i = 0;
  while (i + 1 < shots.length && t >= shots[i + 1].t0) i++;
  const cur = shots[i], prev = i > 0 ? shots[i - 1] : null;
  const t1 = shots[i + 1]?.t0 ?? tl.duration;
  const tr = cur.tr ?? 'blur';
  const trd = TR_OF[tr] ?? TR;
  const p = prev ? prog(t, cur.t0, cur.t0 + trd, tr === 'swipe' ? (x: number) => x * x * (3 - 2 * x) : easeOut) : 1;
  const flash = prev && tr === 'flash' ? 1 - prog(t, cur.t0, cur.t0 + 0.2, easeIn) : 0;
  const flashRed = prev && tr === 'flashRed' ? 1 - prog(t, cur.t0, cur.t0 + 0.2, easeIn) : 0;
  const gs = prev && tr === 'glitch' ? 1 - clamp01((t - cur.t0) / (5 / FPS)) : 0; // glitch sur 5 images
  const inv = prev && tr === 'invert' && t - cur.t0 < 3 / FPS; // négatif sur 3 images
  const shut = prev && tr === 'shutter' ? Math.sin(Math.PI * clamp01((t - cur.t0) / trd)) : 0;
  const lt0 = t - cur.t0;
  // impacts : entrée du plan, tampon, mot qui claque → secousse + aberration chromatique (décroît en 0,28 s)
  const hits = [prev ? [cur.t0, IMPACT[tr] ?? 0] : [0, 0], cur.stamp ? [cur.stamp.at, 0.7] : [0, 0], cur.slam ? [cur.t0 + (cur.slam.at ?? 0.04) + 0.12, 0.6] : [0, 0], cur.num?.strobe ? [cur.t0 + strobeLen(cur), 0.6] : [0, 0]];
  let shake = 0;
  for (const [h, a] of hits) if (a && t >= h) shake = Math.max(shake, a * (1 - clamp01((t - h) / 0.28)) ** 2);
  const sx = (rand(frame * 1.7) - 0.5) * 44 * shake, sy = (rand(frame * 2.3 + 5) - 0.5) * 34 * shake, sr = (rand(frame * 3.1 + 9) - 0.5) * 1.6 * shake;
  const punch = prev ? 1 - prog(t, cur.t0, cur.t0 + 0.2, easeOut) : 0;
  const speed = prev && tr === 'slam' ? 1 - prog(t, cur.t0, cur.t0 + 0.35) : 0;
  const leak = (cur.leak ? 0.55 * Math.sin(Math.PI * Math.min(1, lt0 / 1.2)) : 0) + (prev ? 0.35 * (1 - clamp01(lt0 / 0.25)) : 0);
  const hookK = tl.hook ? Math.max(1 - prog(t, 2.9, 3.2), prog(t, tl.duration - 0.6, tl.duration - 0.3)) : 0;
  const strobing = strobeLen(cur) > lt0;
  const light = !strobing && (cur.bg === 'white' || cur.bg === 'gold' || (THEME.base === 'light' && (cur.bg ?? 'marble') === 'marble') || !!cur.pic?.full);
  const capFade = 1 - prog(t, tl.duration - 0.4, tl.duration - 0.08);
  // rayons : période 11,25° → un nombre entier de périodes sur la vidéo, la dernière image retombe sur la première
  const spin = (Math.round((7 * tl.duration) / 11.25) * 11.25) / tl.duration;
  const ca = Math.max(26 * gs, 16 * shake);
  return (
    <AbsoluteFill style={{background: G.bg}}>
      <Filters />
      <GlitchFilter dx={ca} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) rotate(${sr}deg) scale(${1 + 0.04 * shake})`, filter: inv ? 'invert(1) contrast(1.3)' : undefined}}>
        {prev && p < 1 ? <Backdrop id={ID} kind={prev.bg ?? 'marble'} /> : null}
        <Backdrop id={ID} kind={cur.bg ?? 'marble'} o={tr === 'swipe' || tr === 'shutter' ? 1 : p} />
        {prev && p < 1 ? (
          <AbsoluteFill style={trStyle(tr, p, false)}>
            {tr === 'swipe' ? <Backdrop id={ID} kind={prev.bg ?? 'marble'} /> : null}
            <AbsoluteFill style={{transform: camera(prev, i - 1, t, cur.t0, jumps[i - 1], 0)}}>
              <ShotView id={ID} faces={coinFaces} s={prev} t={t} t1={cur.t0} words={words} spin={spin} anims={anims} />
            </AbsoluteFill>
          </AbsoluteFill>
        ) : null}
        <AbsoluteFill style={p < 1 ? trStyle(tr, p, true) : undefined}>
          {tr === 'swipe' && p < 1 ? <Backdrop id={ID} kind={cur.bg ?? 'marble'} /> : null}
          <AbsoluteFill style={{transform: camera(cur, i, t, t1, jumps[i], punch), filter: ca > 2 && gs <= 0.01 ? 'url(#glitch)' : undefined}}>
            <GlitchBands s={gs} seed={i}>
              <ShotView id={ID} faces={coinFaces} s={cur} t={t} t1={t1} words={words} spin={spin} anims={anims} />
            </GlitchBands>
          </AbsoluteFill>
        </AbsoluteFill>
        <SpeedLines s={speed} />
        {flash > 0 ? <AbsoluteFill style={{background: '#F3E7C9', opacity: flash * 0.8, mixBlendMode: 'screen'}} /> : null}
        {flashRed > 0 ? <AbsoluteFill style={{background: 'rgb(200,30,30)', opacity: flashRed * 0.7}} /> : null}
        {shut > 0 ? <><div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 960 * shut, background: '#050403'}} /><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 960 * shut, background: '#050403'}} /></> : null}
      </AbsoluteFill>
      <Finish frame={frame} id={ID} leak={leak} leakCorner={i % 2 ? 'bl' : 'tr'} />
      {light ? <div style={{position: 'absolute', left: 0, right: 0, top: 1240, height: 320, background: 'linear-gradient(180deg, rgba(10,8,5,0) 0%, rgba(10,8,5,0.6) 50%, rgba(10,8,5,0) 100%)', opacity: p}} /> : null}
      {THEME.overlay === 'hud' ? <Hud frame={frame} label={THEME.overlayLabel ?? ''} hide={hookK} /> : null}
      <HookTitle text={tl.hook ?? ''} k={hookK} />
      <GCaptions words={words} t={t} hidden={textCard(cur) && p > 0.5} fade={capFade} />
    </AbsoluteFill>
  );
};
  return Reel;
};
