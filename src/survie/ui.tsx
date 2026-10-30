// DA « Survie » : habillage relevé sur les références (dossier « Vidéo Zombie », analyse dans « ANALYSE - style Survie.md »).
// Mesures en px sur 1080×1920 : sous-titres karaoké citron à y 1220, HUD horloge en haut à gauche, étiquette + titre de règle
// (grand puis en-tête), règle censurée, titre de série, choix A/B, carte de fin avec glitch Jour N → Jour N+1.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadBebas} from '@remotion/google-fonts/BebasNeue';
import {loadFont as loadJet} from '@remotion/google-fonts/JetBrainsMono';
import type {Word} from '../components/Captions';
import {clamp01, easeIn, easeInOut, easeOut, FPS, lerp, prog, rand, sp} from '../theme';

const mont = loadMontserrat('normal', {weights: ['700', '800', '900'], subsets: ['latin', 'latin-ext']});
const bebas = loadBebas('normal', {weights: ['400'], subsets: ['latin', 'latin-ext']});
const jet = loadJet('normal', {weights: ['500', '700'], subsets: ['latin', 'latin-ext']});

export const SF = {
  cap: `${mont.fontFamily}, "Arial Black", sans-serif`,
  title: `${bebas.fontFamily}, Impact, sans-serif`,
  mono: `${jet.fontFamily}, Menlo, monospace`,
};
/** couleurs relevées au pixel sur les références */
export const SV = {
  lime: '#D2F84A', // mot prononcé
  amber: '#F2A23C', // mot prononcé dans un dialogue
  tag: '#D00A0A', // étiquette « RÈGLE N°1 »
  neon: '#FF4E42', // « JOUR 2 », 2e ligne de la règle censurée
  green: '#74F574',
  pillRed: '#F85848',
  hudRed: '#EC4436',
  hudGrey: 'rgba(235,235,235,0.55)',
  white: '#FFFFFF',
  stroke: 'rgba(8,8,12,0.92)',
};
const TXT_SHADOW = '0 5px 14px rgba(0,0,0,0.55)';
/** largeur moyenne d'une capitale (en em) : Bebas 0,40, Montserrat Black 0,74 → taille qui tient dans `w` */
export const fit = (s: string, w: number, max: number, k = 0.4) => Math.min(max, w / Math.max(1, s.length * k));

// ---------------- sous-titres karaoké ----------------
type Chunk = {words: {text: string; t0: number; t1: number}[]; t0: number; t1: number};
const PUNCT = /[.,!?…:;]$/;
/** groupes de 1 à 3 mots (≤ 17 signes), coupés à la ponctuation et aux silences */
export const chunksOf = (words: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: Chunk | null = null;
  words.forEach((w, i) => {
    const text = w.text.trim();
    const t0 = w.startMs / 1000, t1 = w.endMs / 1000;
    const prev = words[i - 1];
    const gap = prev ? t0 - prev.endMs / 1000 : 0;
    const len = cur ? cur.words.map((x) => x.text).join(' ').length + 1 + text.length : 0;
    if (!cur || cur.words.length >= 3 || len > 17 || gap > 0.32 || PUNCT.test(cur.words[cur.words.length - 1].text)) {
      cur = {words: [], t0, t1};
      out.push(cur);
    }
    cur.words.push({text, t0, t1});
    cur.t1 = t1;
  });
  return out;
};

export type DialogSpan = {t0: number; t1: number; label: string};

export const Karaoke: React.FC<{words: Word[]; dialog?: DialogSpan[]; hide?: [number, number][]; y?: number}> = ({words, dialog = [], hide = [], y = 1220}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const chunks = React.useMemo(() => chunksOf(words), [words]);
  const k = chunks.findIndex((c, i) => t >= c.t0 - 0.03 && t < (chunks[i + 1]?.t0 ?? c.t1 + 0.6) - 0.03);
  if (k < 0 || hide.some(([a, b]) => t >= a && t < b)) return null;
  const c = chunks[k];
  const end = Math.min(chunks[k + 1]?.t0 ?? c.t1 + 0.6, c.t1 + 0.9);
  const a = prog(t, c.t0 - 0.03, c.t0 + 0.07, easeOut) * (1 - prog(t, end - 0.12, end - 0.03));
  const pop = lerp(0.9, 1, prog(t, c.t0 - 0.03, c.t0 + 0.12, easeOut));
  const dl = dialog.find((d) => c.t0 >= d.t0 - 0.05 && c.t0 < d.t1);
  const hot = dl ? SV.amber : SV.lime;
  const txt = c.words.map((w) => w.text.toUpperCase()).join(' ');
  const size = fit(txt, 940, 78, 0.74);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {dl ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: y - 112, display: 'flex', justifyContent: 'center', opacity: a}}>
          <div style={{border: `2.5px solid ${SV.amber}`, borderRadius: 40, padding: '6px 22px', background: 'rgba(10,8,6,0.72)', fontFamily: SF.cap, fontWeight: 800, fontSize: 22, letterSpacing: '0.22em', color: SV.amber}}>
            {dl.label.toUpperCase()}
          </div>
        </div>
      ) : null}
      <div style={{position: 'absolute', left: 40, right: 40, top: y - size * 0.62, textAlign: 'center', opacity: a, transform: `scale(${pop})`}}>
        {c.words.map((w, i) => {
          const on = t >= w.t0 - 0.02 && (i === c.words.length - 1 || t < c.words[i + 1].t0 - 0.02);
          return (
            <span key={i} style={{fontFamily: SF.cap, fontWeight: 900, fontSize: size, letterSpacing: '-0.005em', color: on ? hot : SV.white, WebkitTextStroke: `${size * 0.15}px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: TXT_SHADOW, marginRight: i < c.words.length - 1 ? size * 0.26 : 0}}>
              {w.text.toUpperCase()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------- HUD : jour, horloge, étage ----------------
/** horloge : [instant, minutes depuis 0 h, défilement ?] ; `true` = défile depuis la valeur précédente (ellipse) */
export type ClockKey = [number, number, boolean?];
export const clockAt = (t: number, keys: ClockKey[]): [number, boolean] => {
  let i = 0;
  while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [ti, mi] = keys[i], nx = keys[i + 1];
  if (nx?.[2] && t >= ti) return [Math.round(lerp(mi, nx[1], clamp01((t - ti) / Math.max(0.01, nx[0] - ti)))), true];
  return [mi, false];
};
export const hhmm = (m: number) => `${String(Math.floor((((m % 1440) + 1440) % 1440) / 60)).padStart(2, '0')}:${String((((m % 1440) + 1440) % 1440) % 60).padStart(2, '0')}`;

export const Hud: React.FC<{day: string; clock: ClockKey[]; floor: string; t0: number; t1: number}> = ({day, clock, floor, t0, t1}) => {
  const t = useCurrentFrame() / FPS;
  if (t < t0 - 0.01 || t > t1 + 0.4) return null;
  const a = prog(t, t0, t0 + 0.35, easeOut) * (1 - prog(t, t1, t1 + 0.35));
  const [m, ff] = clockAt(t, clock);
  return (
    <div style={{position: 'absolute', left: 68, top: 262, opacity: a, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, fontFamily: SF.cap, fontWeight: 800, fontSize: 25, letterSpacing: '0.2em', color: SV.hudRed}}>
        <div style={{width: 11, height: 11, borderRadius: 6, background: SV.hudRed, opacity: 0.55 + 0.45 * Math.round((Math.sin(t * Math.PI * 1.6) + 1) / 2)}} />
        {day.toUpperCase()}
      </div>
      <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 70, lineHeight: 1.08, color: ff ? '#FFF6D8' : SV.white, letterSpacing: '0.02em'}}>{hhmm(m)}</div>
      <div style={{width: 250, height: 2, background: 'rgba(255,255,255,0.32)', margin: '8px 0 10px'}} />
      <div style={{fontFamily: SF.mono, fontWeight: 500, fontSize: 21, letterSpacing: '0.3em', color: SV.hudGrey}}>{floor.toUpperCase()}</div>
    </div>
  );
};

// ---------------- règle : étiquette + titre (grand → en-tête) ----------------
export type RuleSpec = {n: number; title: string; sub?: string; tag: number; at: number; shrink?: number; end: number; redacted?: boolean};

export const Rule: React.FC<{r: RuleSpec}> = ({r}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < r.tag - 0.02 || t > r.end + 0.3) return null;
  const out = 1 - prog(t, r.end, r.end + 0.28, easeIn);
  const sh = r.shrink === undefined ? 0 : prog(t, r.shrink, r.shrink + 0.38, easeInOut);
  // étiquette : rebond à l'entrée, puis rétrécit avec le titre
  const tagIn = sp(frame, r.tag, {damping: 9, stiffness: 260, mass: 0.6});
  const tagY = lerp(414, 392, sh), tagS = lerp(1, 0.62, sh) * tagIn;
  const big = fit(r.title, 990, 178);
  const titleY = lerp(560, 486, sh), titleS = lerp(1, 0.52, sh);
  const tin = prog(t, r.at - 0.02, r.at + 0.16, easeOut);
  const ul = prog(t, r.at + 0.05, r.at + 0.42, easeOut);
  const subIn = r.sub ? prog(t, r.at + 0.45, r.at + 0.62, easeOut) : 0;
  // règle censurée : 3 barres grises qui clignotent jusqu'à la révélation
  const bars = r.redacted && t < r.at;
  return (
    <AbsoluteFill style={{opacity: out, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: tagY, display: 'flex', justifyContent: 'center'}}>
        <div style={{transform: `scale(${tagS}) rotate(-3deg)`, background: SV.tag, padding: '10px 26px 8px', boxShadow: '0 8px 22px rgba(0,0,0,0.45)', fontFamily: SF.cap, fontWeight: 900, fontSize: 44, color: SV.white, letterSpacing: '0.02em', lineHeight: 1}}>
          RÈGLE N°{r.n}
        </div>
      </div>
      {bars ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', justifyContent: 'center', gap: 16}}>
          {[190, 130, 250].map((w, i) => (
            <div key={i} style={{width: w, height: 92, background: '#CFCFD2', opacity: (0.5 + 0.5 * rand(Math.floor(frame / 2) * 7 + i)) * prog(t, r.tag + 0.1 * i, r.tag + 0.1 * i + 0.12)}} />
          ))}
        </div>
      ) : null}
      {t >= r.at - 0.02 ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: titleY - big * 0.5, textAlign: 'center', transform: `scale(${titleS * lerp(1.08, 1, tin)})`, transformOrigin: '50% 30%', opacity: tin, filter: `blur(${(1 - tin) * 6}px)`}}>
          <div style={{display: 'inline-block', position: 'relative'}}>
            <div style={{fontFamily: SF.title, fontSize: big, lineHeight: 1, color: SV.white, WebkitTextStroke: `${big * 0.05}px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: '0 8px 24px rgba(0,0,0,0.6)', whiteSpace: 'nowrap'}}>
              {r.title}
            </div>
            <div style={{position: 'absolute', left: '4%', right: '6%', bottom: -big * 0.05, height: Math.max(8, big * 0.055), background: SV.tag, transform: `scaleX(${ul})`, transformOrigin: '0 50%', boxShadow: '0 2px 8px rgba(0,0,0,0.5)'}} />
            {r.sub ? (
              <div style={{fontFamily: SF.title, fontSize: big * 0.62, lineHeight: 1.25, color: SV.neon, opacity: subIn, transform: `translateY(${(1 - subIn) * 14}px)`, WebkitTextStroke: `${big * 0.03}px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.6)'}}>
                {r.sub}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ---------------- titre de série (« JOUR 1 » + nom) ----------------
export const SeriesTitle: React.FC<{name: string; day: string; t0: number; t1: number; y?: number}> = ({name, day, t0, t1, y = 360}) => {
  const t = useCurrentFrame() / FPS;
  if (t < t0 - 0.02 || t > t1 + 0.4) return null;
  const a = prog(t, t0, t0 + 0.22, easeOut) * (1 - prog(t, t1, t1 + 0.35, easeIn));
  const flash = 1 - prog(t, t0, t0 + 0.3, easeOut);
  const dayIn = prog(t, t0 + 0.3, t0 + 0.6, easeOut);
  const size = fit(name, 980, 200);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(255,248,235,${0.35 * flash})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', opacity: a}}>
        <div style={{fontFamily: SF.cap, fontWeight: 900, fontSize: 42, letterSpacing: '0.5em', color: '#FF5A4A', opacity: dayIn, marginBottom: 8, paddingLeft: '0.5em', textShadow: '0 0 16px rgba(255,70,50,0.7), 0 4px 12px rgba(0,0,0,0.8)'}}>{day.toUpperCase()}</div>
        <div style={{display: 'inline-block', position: 'relative', transform: `scale(${lerp(1.12, 1, prog(t, t0, t0 + 0.4, easeOut))})`, filter: `blur(${flash * 8}px)`}}>
          <div style={{fontFamily: SF.title, fontSize: size, lineHeight: 1, color: '#FFF8EE', textShadow: '0 0 28px rgba(255,236,210,0.55), 0 0 6px rgba(255,236,210,0.6), 0 10px 30px rgba(0,0,0,0.7)', whiteSpace: 'nowrap'}}>{name}</div>
          <div style={{position: 'absolute', left: '-2%', right: '-2%', bottom: -6, height: 9, background: SV.tag, transform: `scaleX(${prog(t, t0 + 0.2, t0 + 0.6, easeOut)})`, boxShadow: '0 0 14px rgba(208,10,10,0.7)'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** pastille « TOI · ÉTAGE 12 » reliée par un trait à un point de l'image (coordonnées écran) */
export const Pin: React.FC<{text: string; x: number; y: number; t0: number; t1: number}> = ({text, x, y, t0, t1}) => {
  const t = useCurrentFrame() / FPS;
  if (t < t0 || t > t1 + 0.3) return null;
  const a = prog(t, t0, t0 + 0.3, easeOut) * (1 - prog(t, t1, t1 + 0.25));
  const line = prog(t, t0 + 0.1, t0 + 0.45, easeOut);
  const col = '#F1D77E';
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: a, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: -1.5, top: -118, width: 3, height: 104 * line, background: col, transformOrigin: '50% 0'}} />
      <div style={{position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: 13, border: `3px solid ${col}`, boxShadow: `0 0 14px ${col}`}} />
      <div style={{position: 'absolute', left: 0, top: -170, transform: 'translateX(-50%)', whiteSpace: 'nowrap', border: `3px solid ${col}`, borderRadius: 30, padding: '8px 22px', background: 'rgba(14,12,10,0.8)', fontFamily: SF.cap, fontWeight: 900, fontSize: 25, letterSpacing: '0.2em', color: col}}>
        {text.toUpperCase()}
      </div>
    </div>
  );
};

// ---------------- choix A / B ----------------
export const Choice: React.FC<{q: string; a: string; b: string; tq: number; ta: number; tb: number; tc: number; t1: number}> = ({q, a, b, tq, ta, tb, tc, t1}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < tq - 0.02 || t > t1 + 0.4) return null;
  const out = 1 - prog(t, t1, t1 + 0.3, easeIn);
  const qa = prog(t, tq, tq + 0.25, easeOut);
  const pill = (txt: string, col: string, t0: number) => {
    const s = sp(frame, t0, {damping: 10, stiffness: 240, mass: 0.6});
    return (
      <div style={{transform: `scale(${s})`, opacity: clamp01(s * 1.5), border: `4px solid ${col}`, borderRadius: 60, padding: '14px 38px', background: 'rgba(6,8,6,0.72)', fontFamily: SF.cap, fontWeight: 900, fontSize: 38, letterSpacing: '0.05em', color: col, boxShadow: `0 0 22px ${col}55`}}>
        {txt}
      </div>
    );
  };
  const ca = prog(t, tc, tc + 0.3, easeOut);
  const bob = Math.sin((t - tc) * Math.PI * 2.2) * 8;
  return (
    <AbsoluteFill style={{opacity: out, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center', opacity: qa, transform: `scale(${lerp(1.08, 1, qa)})`}}>
        <div style={{fontFamily: SF.title, fontSize: fit(q, 980, 150), lineHeight: 1, color: SV.white, WebkitTextStroke: `6px ${SV.stroke}`, paintOrder: 'stroke fill', textShadow: '0 8px 26px rgba(0,0,0,0.7)'}}>{q}</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
        {t >= ta - 0.02 ? pill(a, SV.green, ta) : null}
        {t >= tb - 0.02 ? pill(b, SV.pillRed, tb) : null}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 920, textAlign: 'center', opacity: ca}}>
        <div style={{fontFamily: SF.cap, fontWeight: 800, fontSize: 28, letterSpacing: '0.34em', color: SV.white, paddingLeft: '0.34em'}}>RÉPONDS EN COMMENTAIRE</div>
        <div style={{fontFamily: SF.cap, fontWeight: 700, fontSize: 54, color: SV.white, transform: `translateY(${bob}px)`}}>↓</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- carte de fin : JOUR N → glitch → JOUR N+1 ----------------
export const EndCard: React.FC<{name: string; day: number; time0: string; time1: string; cta: string; t0: number; flip: number}> = ({name, day, time0, time1, cta, t0, flip}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < t0 - 0.02) return null;
  const a = prog(t, t0, t0 + 0.35, easeOut);
  const after = t >= flip;
  const g = after ? 1 - clamp01((t - flip) / 0.3) : 0; // glitch qui retombe en 0,3 s
  const jx = g * (rand(frame * 3.3) - 0.5) * 70, jy = g * (rand(frame * 5.1) - 0.5) * 18;
  const dayTxt = `JOUR ${after ? day + 1 : day}`;
  const col = after ? SV.neon : '#FFF8EE';
  const glow = after ? `0 0 26px rgba(255,78,66,0.9), 0 0 70px rgba(255,40,30,0.55)` : '0 0 24px rgba(255,240,220,0.45)';
  return (
    <AbsoluteFill style={{opacity: a, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `rgba(200,20,20,${0.28 * g})`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center'}}>
        <div style={{fontFamily: SF.title, fontSize: 112, lineHeight: 1, color: '#F4EEE4', letterSpacing: '0.04em', textShadow: '0 0 20px rgba(255,240,220,0.35)'}}>{name}</div>
        <div style={{position: 'relative', height: 290, marginTop: 10, transform: `translate(${jx}px, ${jy}px)`}}>
          {g > 0.05 ? (
            <>
              <div style={{position: 'absolute', left: 0, right: 0, fontFamily: SF.title, fontSize: 300, lineHeight: 1, color: 'rgba(0,255,255,0.7)', transform: `translateX(${-18 * g}px)`, mixBlendMode: 'screen'}}>{dayTxt}</div>
              <div style={{position: 'absolute', left: 0, right: 0, fontFamily: SF.title, fontSize: 300, lineHeight: 1, color: 'rgba(255,0,60,0.8)', transform: `translateX(${18 * g}px)`, mixBlendMode: 'screen'}}>{dayTxt}</div>
            </>
          ) : null}
          <div style={{position: 'absolute', left: 0, right: 0, fontFamily: SF.title, fontSize: 300, lineHeight: 1, color: col, textShadow: glow}}>{dayTxt}</div>
        </div>
        <div style={{fontFamily: SF.mono, fontWeight: 500, fontSize: 40, letterSpacing: '0.24em', color: '#E8E2D8', paddingLeft: '0.24em'}}>{after ? time1 : time0}</div>
        <div style={{display: 'inline-block', marginTop: 60, border: `3px solid ${after ? SV.neon : 'rgba(255,120,110,0.75)'}`, borderRadius: 50, padding: '14px 40px', fontFamily: SF.cap, fontWeight: 900, fontSize: 30, letterSpacing: '0.12em', color: '#F4EEE4', background: 'rgba(20,6,6,0.6)', boxShadow: after ? '0 0 24px rgba(255,78,66,0.5)' : 'none'}}>
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- inventaire (en haut à droite) : eau, vivres, batterie du téléphone ----------------
/** valeur au temps t d'une courbe [instant, valeur] (linéaire entre deux clés) */
const curve = (t: number, keys: [number, number][]) => {
  let i = 0;
  while (i + 1 < keys.length && t >= keys[i + 1][0]) i++;
  const [t0, v0] = keys[i], nx = keys[i + 1];
  if (!nx || t < t0) return v0;
  return lerp(v0, nx[1], clamp01((t - t0) / Math.max(0.01, nx[0] - t0)));
};
const Icon: React.FC<{kind: 'eau' | 'vivres' | 'batt'; level?: number}> = ({kind, level = 1}) => (
  <svg width={42} height={42} viewBox="0 0 34 34">
    {kind === 'eau' ? <path d="M17 3 C17 3 6 16 6 22 a11 11 0 0 0 22 0 C28 16 17 3 17 3 Z" fill="#5AB4F0" stroke="#0A0A10" strokeWidth={2} /> : null}
    {kind === 'vivres' ? (
      <g><rect x={6} y={6} width={22} height={24} rx={4} fill="#F0A040" stroke="#0A0A10" strokeWidth={2} /><ellipse cx={17} cy={7} rx={11} ry={3.5} fill="#C8D0D8" stroke="#0A0A10" strokeWidth={2} /><rect x={6} y={15} width={22} height={7} fill="#C8402E" /></g>
    ) : null}
    {kind === 'batt' ? (
      <g><rect x={3} y={9} width={26} height={16} rx={3} fill="none" stroke="#E8E8E8" strokeWidth={2.5} /><rect x={29} y={14} width={3} height={6} rx={1} fill="#E8E8E8" /><rect x={6} y={12} width={20 * level} height={10} rx={1.5} fill={level > 0.5 ? '#74F574' : level > 0.25 ? '#F2A23C' : '#FF4E42'} /></g>
    ) : null}
  </svg>
);
export const Inventory: React.FC<{t0: number; t1: number; eau: [number, number][]; vivres: [number, string][]; batt: [number, number][]; off?: [number, number][]}> = ({t0, t1, eau, vivres, batt, off = []}) => {
  const t = useCurrentFrame() / FPS;
  if (t < t0 - 0.02 || t > t1 + 0.4 || off.some(([a, b]) => t >= a && t < b)) return null;
  const a = prog(t, t0, t0 + 0.4, easeOut) * (1 - prog(t, t1, t1 + 0.35));
  let vi = 0;
  while (vi + 1 < vivres.length && t >= vivres[vi + 1][0]) vi++;
  const e = Math.round(curve(t, eau)), bt = Math.round(curve(t, batt));
  // la ligne qui vient de changer clignote en citron
  const hot = (keys: [number, number | string][]) => keys.some(([k], i) => i > 0 && t >= k && t < k + 0.6) ? 1 : 0;
  const eauHot = eau.some(([k, v], i) => i > 0 && v !== eau[i - 1][1] && t >= k && t < k + 0.5) || (curve(t, eau) !== curve(t - 0.05, eau));
  const rows: [React.ReactNode, string, string, boolean][] = [
    [<Icon key="e" kind="eau" />, 'EAU', `${e} L`, eauHot],
    [<Icon key="v" kind="vivres" />, 'VIVRES', vivres[vi][1], hot(vivres) > 0],
    [<Icon key="b" kind="batt" level={bt / 100} />, 'BATTERIE', `${bt} %`, false],
  ];
  return (
    <div style={{position: 'absolute', right: 68, top: 262, opacity: a, transform: `translateX(${(1 - a) * 40}px)`, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.7))'}}>
      {rows.map(([ic, lab, val, h], i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${h ? 1.08 : 1})`, transformOrigin: '100% 50%'}}>
          <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(235,235,235,0.7)'}}>{lab}</div>
          <div style={{fontFamily: SF.mono, fontWeight: 700, fontSize: 40, color: h ? SV.lime : SV.white, minWidth: 160, textAlign: 'right', textShadow: h ? '0 0 14px rgba(210,248,74,0.7)' : undefined}}>{val}</div>
          {ic}
        </div>
      ))}
    </div>
  );
};

// ---------------- morse : les points et traits apparaissent avec la lampe, puis les lettres ----------------
export const Morse: React.FC<{groups: {at: number; on: number; off: number; long: boolean; letter: string}[]; sos: number; t1: number}> = ({groups, sos, t1}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (t < groups[0].at - 0.05 || t > t1 + 0.3) return null;
  const out = 1 - prog(t, t1, t1 + 0.3);
  const lit = t >= sos ? 1 : 0;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center', gap: 64, opacity: out, pointerEvents: 'none'}}>
      {groups.map((g, gi) => (
        <div key={gi} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
          <div style={{display: 'flex', gap: 14, height: 40, alignItems: 'center'}}>
            {[0, 1, 2].map((i) => {
              const s = g.at + i * (g.on + g.off);
              const k = sp(frame, s, {damping: 11, stiffness: 260, mass: 0.5});
              const glow = t >= s && t < s + g.on ? 1 : 0;
              return <div key={i} style={{width: g.long ? 74 : 28, height: 28, borderRadius: 14, background: SV.lime, transform: `scale(${k})`, boxShadow: `0 0 ${12 + 26 * glow}px rgba(210,248,74,${0.5 + 0.5 * glow})`}} />;
            })}
          </div>
          <div style={{fontFamily: SF.title, fontSize: 120, lineHeight: 1, color: SV.white, opacity: lit * prog(t, sos + gi * 0.12, sos + gi * 0.12 + 0.2, easeOut), textShadow: '0 0 22px rgba(255,255,255,0.6), 0 6px 18px rgba(0,0,0,0.7)'}}>{g.letter}</div>
        </div>
      ))}
    </div>
  );
};

// ---------------- finition : grain + vignette ----------------
export const Finish: React.FC<{vignette?: number}> = ({vignette = 0.55}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id={`gr${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter={`url(#gr${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** passage au noir, flash ou glitch entre deux scènes (calque au-dessus de tout) */
export const Dip: React.FC<{at: number; kind: 'black' | 'white' | 'glitch'; d?: number}> = ({at, kind, d = 0.5}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  if (Math.abs(t - at) > d) return null;
  const k = 1 - Math.abs(t - at) / d;
  if (kind === 'glitch') {
    const g = k ** 2;
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rand(frame * 1.3 + i * 7) * 1920, height: 20 + 80 * rand(frame + i), background: i % 2 ? `rgba(255,40,60,${0.5 * g})` : `rgba(60,255,255,${0.35 * g})`, transform: `translateX(${(rand(frame * 2 + i) - 0.5) * 200 * g}px)`, mixBlendMode: 'screen'}} />
        ))}
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{background: kind === 'black' ? '#000' : '#FFF8EC', opacity: easeInOut(clamp01(k * 1.15)) * (kind === 'white' ? 0.7 : 1), pointerEvents: 'none'}} />;
};
