// Animations sur mesure de la vidéo 30 (l'illusion de Moïse), style déluge (nuit d'orage bleue, gravures de Doré).
// QuestionPiege : la question s'écrit mot à mot sur une fiche au fil de la voix, devant l'arche de Doré ; 3 réponses
//   (1 · 2 · 7), compte à rebours 3-2-1, « STOP. ». Le piège n'est jamais souligné. freezeAt : image figée (boucle).
// Correction : la même fiche, le « 2 » s'allume (« Bravo »), puis MOÏSE est entouré, barré, et NOÉ écrit au-dessus.
// Repete : la phrase fausse répétée en pile, la jauge « VRAI » se remplit à chaque répétition.
import React from 'react';
import {Img} from 'remotion';
import {clamp01, easeOut, lerp, prog} from '../../theme';
import type {AnimProps} from '../Reel';
import {G, GF} from '../Gravure';
import {Choice, Countdown, list, nums, Paper, pop, RED, src, Stop} from './tests';

const INK = '#0E1A2C';
const TRAP = 'MOÏSE';

const Card: React.FC<{id: string; t: number; W: string[]; at: number[]; all?: boolean; fix?: number; s?: number}> = ({id, t, W, at, all, fix = 1e9, s = 1}) => {
  const ck = prog(t, fix, fix + 0.35, easeOut), sk = prog(t, fix + 0.3, fix + 0.5, easeOut), nk = pop(t, fix + 0.55, 0.22);
  const shown = all ? W.length : at.filter((a) => t >= a - 0.06).length;
  return (
    <Paper id={id} x={540} y={700} w={920} h={540} rot={-1.2} s={s}>
      <div style={{position: 'absolute', left: 50, top: 30, fontFamily: GF.label, fontWeight: 700, fontSize: 30, letterSpacing: '0.24em', color: `rgba(${G.goldRgb},0.95)`, textShadow: '0 1px 0 rgba(0,0,0,0.25)'}}>QUESTION · UN SEUL ESSAI</div>
      {shown === 0 ? <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 300, color: 'rgba(14,26,44,0.16)'}}>?</div> : null}
      <div style={{position: 'absolute', left: 54, right: 54, top: 110, display: 'flex', flexWrap: 'wrap', columnGap: 18, rowGap: 4, fontFamily: GF.serif, fontWeight: 700, fontSize: 66, lineHeight: 1.12, color: INK}}>
        {W.map((w, i) => {
          const k = all ? 1 : prog(t, at[i] - 0.06, at[i] + 0.1, easeOut);
          const trap = w === TRAP;
          return (
            <span key={i} style={{position: 'relative', opacity: k, transform: `translateY(${(1 - k) * 14}px)`, display: 'inline-block'}}>
              {w}
              {trap && ck > 0 ? (
                <svg style={{position: 'absolute', left: -20, top: -14, overflow: 'visible'}} width={10} height={10}>
                  <path d="M 120 6 C 210 4, 262 30, 250 62 C 238 96, 120 104, 40 92 C -10 84, -6 40, 30 22 C 70 4, 130 2, 170 8" fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 * (1 - ck)} />
                  <path d="M 10 54 L 250 46" fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" pathLength={1000} strokeDasharray={1000} strokeDashoffset={1000 * (1 - sk)} />
                </svg>
              ) : null}
              {trap && nk > 0 ? <span style={{position: 'absolute', left: 30, top: -78, fontFamily: '"Special Elite", "Courier New", monospace', fontWeight: 700, fontSize: 74, color: RED, transform: `rotate(-7deg) scale(${nk})`, transformOrigin: 'left bottom', whiteSpace: 'nowrap'}}>NOÉ</span> : null}
            </span>
          );
        })}
      </div>
    </Paper>
  );
};

const OPTS = ['1', '2', '7'];
const Answers: React.FC<{t: number; from: number; pick?: number; o?: number}> = ({t, from, pick = 1e9, o = 1}) => (
  <>
    {OPTS.map((x, i) => {
      const k = pop(t, from + i * 0.08);
      const on = i === 1 ? prog(t, pick, pick + 0.15) : 0;
      return k > 0 ? <Choice key={x} x={250 + i * 230} y={1060} w={190} text={x} on={on} pulse={on ? 0 : 0.5 + 0.5 * Math.sin(t * 9 + i)} o={k * o} size={64} /> : null;
    })}
  </>
);

export const QuestionPiege: React.FC<AnimProps> = ({id, t: tNow, p}) => {
  const W = list(p, 'words'), at = nums(p, 'at'), cd = nums(p, 'cd'), stop = Number(p.stop);
  const t = p.freezeAt !== undefined ? Number(p.freezeAt) : tNow;
  const live = p.freezeAt === undefined;
  const push = 1.04 + 0.06 * clamp01(t / 14);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.42, transform: `scale(${push})`}}>
        <Img src={src(id, 'arche_plein')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(4,8,18,0.1) 25%, rgba(4,8,18,0.85) 90%)'}} />
      <Card id={id} t={t} W={W} at={at} s={lerp(1.06, 1, prog(t, 0, 0.3, easeOut))} />
      {live && cd.length ? <Answers t={t} from={cd[0] - 0.3} /> : null}
      {live ? <Countdown t={t} at={cd} stop={stop} y={1235} /> : null}
      {live ? <Stop t={t} at={stop} y={1130} /> : null}
    </>
  );
};

export const Correction: React.FC<AnimProps> = ({id, t, t0, p}) => {
  const W = list(p, 'words'), fix = Number(p.fix);
  const bravo = pop(t, t0 + 0.35);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, opacity: 0.3}}>
        <Img src={src(id, 'deluge_plein')} style={{width: '100%', height: '100%'}} />
      </div>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 40%, rgba(4,8,18,0.15) 25%, rgba(4,8,18,0.88) 90%)'}} />
      <Card id={id} t={t} W={W} at={[]} all fix={fix} />
      <Answers t={t} from={t0 - 1} pick={t0 + 0.05} o={1 - prog(t, fix, fix + 0.3) * 0.65} />
      {t < fix ? <div style={{position: 'absolute', left: 0, right: 0, top: 1150, textAlign: 'center', fontFamily: GF.serif, fontWeight: 900, fontSize: 96, color: G.gold, opacity: bravo, transform: `scale(${bravo})`, textShadow: `0 0 26px rgba(${G.goldRgb},0.5)`}}>BRAVO.</div> : null}
    </>
  );
};

export const Repete: React.FC<AnimProps> = ({id, lt, p}) => {
  const text = String(p.text ?? ''), n = Number(p.n ?? 6), every = Number(p.every ?? 0.32);
  const k = Math.min(n, Math.floor(lt / every) + 1);
  const meter = clamp01(k / n) * prog(lt, 0, 0.2);
  return (
    <>
      {Array.from({length: k}, (_, i) => {
        const a = prog(lt, i * every, i * every + 0.12, easeOut);
        const age = k - 1 - i;
        return (
          <Paper key={i} id={id} x={540 + (i % 2 ? 26 : -26)} y={470 + i * 92} w={900} h={150} rot={(i % 3 - 1) * 1.6} s={lerp(1.2, 1, a)} o={a * (age ? Math.max(0.35, 0.9 - age * 0.12) : 1)}>
            <div style={{position: 'absolute', left: 30, right: 80, top: 34, fontFamily: GF.serif, fontWeight: 700, fontSize: 46, lineHeight: 1.1, color: INK}}>{text}</div>
            <div style={{position: 'absolute', right: 26, top: 46, fontFamily: GF.label, fontWeight: 700, fontSize: 34, color: `rgba(${G.goldRgb},1)`}}>×{i + 1}</div>
          </Paper>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: 1100, width: 700, fontFamily: GF.label, fontWeight: 700, fontSize: 36, letterSpacing: '0.16em', color: G.text}}>TON CERVEAU : <span style={{color: meter > 0.8 ? '#7CFF9A' : G.gold}}>{meter > 0.8 ? 'VRAI' : '…'}</span></div>
      <div style={{position: 'absolute', left: 120, top: 1160, width: 760, height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.12)', border: `2px solid rgba(${G.goldRgb},0.5)`}}>
        <div style={{width: `${meter * 100}%`, height: '100%', borderRadius: 13, background: `linear-gradient(90deg, rgba(${G.goldRgb},0.6), ${meter > 0.8 ? '#7CFF9A' : G.gold})`, boxShadow: `0 0 20px rgba(${G.goldRgb},0.6)`}} />
      </div>
    </>
  );
};

export const MOISE = {QuestionPiege, Correction, Repete};
