// Moteur d'un épisode « Survie » : une liste de scènes calées sur les balises de la voix (timeline.json), des transitions
// (fondu, passage au noir, flash blanc, glitch) et l'habillage par-dessus (HUD, règles, titre, choix, fin, sous-titres).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import type {Word} from '../components/Captions';
import type {SceneProps} from '../Video';
import {clamp01, easeInOut, FPS, prog} from '../theme';
import {ClockKey, Choice, DialogSpan, Dip, EndCard, Finish, Hud, Karaoke, Pin, Rule, RuleSpec, SeriesTitle} from './ui';
import type {SceneP} from './world';

export type Seg = {t0: number; tr?: 'cut' | 'fade' | 'black' | 'white' | 'glitch'; d?: number; render: (p: SceneP) => React.ReactNode};
export type EpisodeSpec = {
  scenes: Seg[];
  hud: {day: string; floor: string; clock: ClockKey[]; t0: number; t1: number; off?: [number, number][]};
  series: {name: string; day: string; t0: number; t1: number};
  pin?: {text: string; x: number; y: number; t0: number; t1: number};
  rules: RuleSpec[];
  choice: {q: string; a: string; b: string; tq: number; ta: number; tb: number; tc: number; t1: number};
  end: {name: string; day: number; time0: string; time1: string; cta: string; t0: number; flip: number};
  hideCaps?: [number, number][];
  dialog?: DialogSpan[];
  /** calques propres à l'épisode (ex. morse), sous les sous-titres */
  extra?: React.ReactNode;
};

export const makeEpisode = (specOf: (B: Record<string, number>, words: Word[], dur: number) => EpisodeSpec) => {
  const Ep: React.FC<SceneProps> = ({tl, words}) => {
    const frame = useCurrentFrame();
    const T = frame / FPS;
    const B = tl.beats;
    const S = React.useMemo(() => specOf(B, words, tl.duration), [B, words, tl.duration]);
    let i = 0;
    while (i + 1 < S.scenes.length && T >= S.scenes[i + 1].t0) i++;
    const cur = S.scenes[i], prev = i > 0 ? S.scenes[i - 1] : null;
    const t1 = S.scenes[i + 1]?.t0 ?? tl.duration;
    const p = (s: Seg, e: number): SceneP => ({t: T - s.t0, T, d: e - s.t0, B});
    const d = cur.d ?? (cur.tr === 'fade' ? 0.4 : 0.3);
    const k = prev && cur.tr === 'fade' ? easeInOut(clamp01((T - cur.t0) / d)) : 1;
    // masque HUD pendant certaines scènes (alerte plein écran)
    const hudOff = (S.hud.off ?? []).some(([a, b]) => T >= a - 0.05 && T < b);
    return (
      <AbsoluteFill style={{background: '#000'}}>
        {prev && k < 1 ? <AbsoluteFill>{prev.render(p(prev, cur.t0))}</AbsoluteFill> : null}
        <AbsoluteFill style={{opacity: k}}>{cur.render(p(cur, t1))}</AbsoluteFill>
        {S.scenes.map((s, j) => (j > 0 && s.tr && s.tr !== 'fade' && s.tr !== 'cut' ? <Dip key={j} at={s.t0} kind={s.tr} d={s.d ?? (s.tr === 'black' ? 0.35 : 0.22)} /> : null))}
        <Finish />
        {hudOff ? null : <Hud day={S.hud.day} clock={S.hud.clock} floor={S.hud.floor} t0={S.hud.t0} t1={S.hud.t1} />}
        {S.pin ? <Pin {...S.pin} /> : null}
        <SeriesTitle {...S.series} />
        {S.rules.map((r) => <Rule key={r.n + '-' + r.tag} r={r} />)}
        <Choice {...S.choice} />
        <EndCard {...S.end} />
        {S.extra}
        <Karaoke words={words} dialog={S.dialog} hide={S.hideCaps} />
        <AbsoluteFill style={{opacity: prog(T, tl.duration - 0.25, tl.duration), background: '#000'}} />
      </AbsoluteFill>
    );
  };
  return Ep;
};
