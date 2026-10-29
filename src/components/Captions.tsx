// Sous-titres façon TikTok : pages de quelques mots, mot actif surligné, mots clés en bleu stylo.
import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {createTikTokStyleCaptions} from '@remotion/captions';
import type {Caption} from '@remotion/captions';
import {C, clamp01, easeOut, F, FPS, POP, prog, sp} from '../theme';

export type Word = Caption & {key?: boolean};

export const Captions: React.FC<{words: Word[]; y?: number; size?: number; combineMs?: number}> = ({words, y = 1430, size = 78, combineMs = 900}) => {
  const frame = useCurrentFrame();
  const ms = (frame / FPS) * 1000;
  const {pages} = useMemo(() => createTikTokStyleCaptions({captions: words, combineTokensWithinMilliseconds: combineMs}), [words, combineMs]);
  const page = pages.find((p, i) => ms >= p.startMs && ms < (pages[i + 1]?.startMs ?? p.startMs + p.durationMs + 400));
  if (!page) return null;
  const tIn = page.startMs / 1000;
  const k = sp(frame, tIn, POP);
  const keys = new Set(words.filter((w) => w.key).map((w) => w.startMs));
  return (
    <div
      style={{
        position: 'absolute', left: 90, right: 90, top: y, textAlign: 'center',
        fontFamily: F.hand, fontWeight: 700, fontSize: size, lineHeight: 1.18, color: C.ink,
        transform: `scale(${0.86 + 0.14 * k}) translateY(${(1 - k) * 24}px)`, opacity: clamp01(k * 2),
        textShadow: `0 0 10px ${C.paper}, 0 0 4px ${C.paper}`,
      }}
    >
      {page.tokens.map((tk, i) => {
        const active = ms >= tk.fromMs && ms < tk.toMs;
        const past = ms >= tk.toMs;
        const hk = prog(ms / 1000, tk.fromMs / 1000, tk.fromMs / 1000 + 0.12, easeOut);
        const isKey = keys.has(tk.fromMs);
        return (
          <span key={i} style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
            {active || (past && isKey) ? (
              <span style={{position: 'absolute', left: '0.05em', right: '-0.02em', top: '0.2em', bottom: '0.05em', background: C.hlSoft, borderRadius: '0.25em 0.4em', transform: `scaleX(${past ? 1 : hk}) rotate(-1.5deg)`, transformOrigin: '0 50%', mixBlendMode: 'multiply'}} />
            ) : null}
            <span style={{position: 'relative', color: isKey ? C.pen : C.ink, display: 'inline-block', transform: active ? 'scale(1.06)' : undefined}}>{tk.text}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Ouverture de bouche 0..1 à partir de l'enveloppe audio (talk.json : une valeur par image). */
export const talkAt = (talk: number[] | undefined, frame: number) => (talk ? talk[Math.max(0, Math.min(talk.length - 1, frame))] ?? 0 : 0);
