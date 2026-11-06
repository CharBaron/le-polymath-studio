// 44 — TEST N°11 : quel âge a cette femme ? (« Ma femme et ma belle-mère », W. E. Hill, 1915). Montage v3.2, style boudoir.
// Format TEST court : le dessin à l'image 0, 3-2-1, STOP → la jeune en or, la vieille en rouge, les mêmes traits → oreille = œil,
// menton = nez → la figure ambiguë → Nicholls 2018 (0,5 s, 393 Américains, 34 ans contre 46) → ton chiffre parle de toi → boucle.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Hill', mode: 'test', at: [B.c3, B.c2, B.c1], stop: B.stop, ask: W('quel', 0), hits: [W('mentir', 0), W('femme', 0) + 0.04, W('seul', 0)]}},
    {t0: B.vingt - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Hill', mode: 'lecture', vingt: B.vingt, jeune: B.jeune, quatre: B.quatre, vieille: B.vieille, meme: B.meme}},
    {t0: B.oreille - 0.04, bg: 'marble', tr: 'whip', still: true, anim: {name: 'Hill', mode: 'detail', focus: 'ear', swap: W("l'œil", B.oreille), from: 'OREILLE', to: 'ŒIL'}},
    {t0: B.menton - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Hill', mode: 'detail', focus: 'chin', swap: W('nez', B.menton), from: 'MENTON', to: 'NEZ'}},
    {t0: B.collier - 0.04, bg: 'marble', tr: 'whip', still: true, anim: {name: 'Hill', mode: 'detail', focus: 'neck', swap: W('bouche', B.collier), from: 'COLLIER', to: 'BOUCHE'}},
    {t0: B.nom - 0.04, bg: 'velvet', tr: 'blur', concept: {word: 'LA FIGURE|AMBIGUË', sub: '« Ma femme et ma belle-mère » · W. E. Hill, 1915'}},
    {t0: B.an - 0.04, bg: 'white', tr: 'glitch', num: {text: '2018', color: 'ink', label: 'NICHOLLS, CHURCHES & LOETSCHER', strobe: true}},
    {t0: W('montrent', B.an), bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Flash', at: W('demi-seconde', B.an)}},
    {t0: B.n393 - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Foule'}},
    {t0: B.jeunes - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Ages', a: W('donnent', B.jeunes) + 0.42, b: B.ages + 0.62}},
    {t0: B.juge - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Hill', mode: 'lecture', vingt: -9, jeune: -8, quatre: -7, vieille: -6, meme: -5}, stamp: {text: 'TON JUGEMENT', at: W('jugement', B.juge), y: 860, size: 96}},
    {t0: B.choc - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'vanity', w: 860, zoom: 0.35, focus: [0.5, 0.42]}, slam: {text: 'SUR TOI', at: W('toi', B.choc) - B.choc + 0.04, color: 'gold', y: 470}},
    {t0: B.envoie - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Hill', mode: 'loop', hits: [W('quelquun', B.envoie), W('rien', B.envoie)], order: 'ENVOIE-LA À QUELQU’UN|SANS RIEN LUI DIRE'}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {name: 'Hill', mode: 'loop'}},
  ];
};
