// Données des plans de la DA « Gravure » (sans React) : partagées par le moteur (Reel.tsx) et par la bande-son
// (scripts/shots.mjs → videos/<id>/build/shots.json → sfx.py), pour que chaque son tombe sur sa coupe.
import type {Word} from '../components/Captions';

export type Bg = 'marble' | 'velvet' | 'gold' | 'ash' | 'white';
export type Tr = 'blur' | 'zoom' | 'whip' | 'flash' | 'flashRed' | 'glitch' | 'slam' | 'swipe' | 'spin' | 'invert' | 'shutter';
export type Spin = {t0: number; t1: number; from: number; to: number};
export type Shot = {
  t0: number; bg?: Bg; tr?: Tr; rays?: 'gold' | 'dark';
  coin?: {spin?: Spin; half?: number};
  num?: {text: string; color?: 'gold' | 'white' | 'red' | 'ink'; label?: string; frieze?: boolean; size?: number; strobe?: boolean};
  /** focus : point de l'image visé par le zoom (fractions) ; full : plein écran (image préparée en `plein`) */
  pic?: {name: string; w: number; y?: number; zoom?: number; focus?: [number, number]; full?: boolean};
  /** plusieurs images qui popent l'une après l'autre (at : s après le début du plan) */
  pics?: {name: string; w: number; x?: number; y?: number; rot?: number; at: number}[];
  card?: {strike?: boolean};
  balance?: {tilt: [number, number]; left: string; right: string};
  beam?: boolean;
  brackets?: {x: number; y: number; w: number; h: number; at?: number};
  /** at : instant absolu (s) de l'impact */
  stamp?: {text: string; at: number; size?: number; y?: number; rot?: number; color?: string};
  crown?: {at: number; y: number; w?: number};
  laurel?: {cy: number; r: number; at?: number; dark?: boolean};
  title?: string;
  topLabel?: string;
  leak?: boolean;
  concept?: {word: string; sub: string};
  quote?: {lines: string[]; sign: string};
  lines?: {full?: boolean; pick?: 1 | 2 | 3; wrong?: boolean; pickAt?: number; votes?: number};
  /** mot qui claque au-dessus du sujet (at : s après le début du plan) */
  slam?: {text: string; at?: number; color?: 'gold' | 'white' | 'red'; y?: number; size?: number};
  /** animation sur mesure de la vidéo (registre passé à makeReel) : name + paramètres (temps en s absolus si `at…`) */
  anim?: {name: string; [k: string]: number | string | boolean | number[]};
  /** pas de caméra ni de jump-cut (plan qui doit rester lisible ; 1er et dernier plan pour la boucle) */
  still?: boolean;
};

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
/** instant où le mot `w` est dit pour la première fois après `after` (s) */
export const wordAt = (words: Word[], w: string, after: number) => (words.find((x) => x.startMs / 1000 >= after - 0.05 && norm(x.text) === norm(w))?.startMs ?? after * 1000) / 1000;

export const DIG = '0123456789';
export const STROBE_EVERY = 0.1;
export const strobeDigits = (text: string) => [...text].filter((c) => DIG.includes(c));
export const strobeLen = (s: Shot) => (s.num?.strobe ? strobeDigits(s.num.text).length * STROBE_EVERY : 0);
export const textCard = (s: Shot) => !!(s.card || s.concept || s.quote);

/** jump-cuts d'un plan : débuts de mots espacés d'au moins 0,85 s, à plus de 0,7 s du début et 0,35 s de la fin */
export const jumpsOf = (s: Shot, t1: number, words: Word[]) => {
  if (s.still || s.num || textCard(s) || t1 - s.t0 < 1.3) return [];
  const out: number[] = [];
  let last = s.t0 + strobeLen(s);
  for (const w of words) {
    const ws = w.startMs / 1000;
    if (ws <= s.t0 + 0.7 || ws >= t1 - 0.35) continue;
    if (ws - last >= 0.85) { out.push(ws); last = ws; }
  }
  return out;
};
