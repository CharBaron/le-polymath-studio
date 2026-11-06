// 43 — TEST N°10 : dis la couleur, pas le mot (l'effet Stroop). Montage v3.2, style imprimerie (accent électrique).
// Format TEST court (stratégie du 31/10) : le vrai test à l'image 0 (10 mots, encre ≠ mot), chrono pendant 6 s de silence, STOP,
// la révélation (« ROUGE » écrit en bleu, ta bouche a dit « ROU… »), la preuve (les mêmes couleurs en carrés : facile), le
// typographe (c'est le mot qui bloque), le concept, les vrais temps de Stroop (63 s contre 110 s), le cerveau qui lit tout seul,
// « Envoie-la à quelqu'un », boucle : « Et dis-lui juste : » → « Dis la couleur. Pas le mot. »
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- le test : un seul plan, le tableau ne bouge pas ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Stroop', mode: 'test', go: W('vasy', 2), stop: B.stop}},
    // --- la révélation ---
    {t0: B.bute - 0.04, bg: 'marble', tr: 'invert', still: true, anim: {name: 'Stroop', mode: 'reveal', zoomAt: B.bouche, rouAt: W('dire', B.bouche)}},
    // --- la preuve : des carrés ---
    {t0: B.carres - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Stroop', mode: 'carres'}, stamp: {text: 'FACILE', at: W('facile', B.carres), y: 860, size: 130}},
    {t0: B.mot - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'zetter', w: 820, zoom: 0.3, focus: [0.45, 0.4]}, slam: {text: 'LE MOT', at: W('mot', B.mot) - B.mot + 0.04, color: 'gold', y: 470}},
    // --- le nom, la référence ---
    {t0: B.nom - 0.04, bg: 'velvet', tr: 'blur', concept: {word: 'L’EFFET|STROOP', sub: '« Stroop effect » · J. R. Stroop, 1935'}},
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1935', color: 'ink', label: 'J. R. STROOP · 100 ÉTUDIANTS', strobe: true}},
    {t0: W('etudiants', B.an) + 0.15, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Barres', at: W('mettent', B.an) + 0.05}, stamp: {text: '+74 %', at: W('plus', B.an), y: 1180, size: 120}},
    // --- le cerveau lit tout seul ---
    {t0: B.lit - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'cerveau', w: 760, zoom: 0.25, focus: [0.4, 0.4]}},
    {t0: W('avant', B.lit), bg: 'marble', tr: 'whip', still: true, anim: {name: 'Stroop', mode: 'reveal', zoomAt: -9, rouAt: W('avant', B.lit) + 0.1}},
    {t0: W('decides', B.lit), bg: 'marble', tr: 'slam', pic: {name: 'cerveau', w: 760, zoom: 0.55, focus: [0.4, 0.35]}, slam: {text: 'AVANT TOI', at: W('lire', B.lit) - W('decides', B.lit) + 0.04, color: 'red', y: 470}},
    // --- « Envoie-la à quelqu'un. Sans rien lui dire. » puis la boucle (dernière image = première) ---
    {t0: B.envoie - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Stroop', mode: 'loop', shuffle: 1, hits: [W('quelquun', B.envoie), W('rien', B.envoie)], order: 'ENVOIE-LA À QUELQU’UN|SANS RIEN LUI DIRE'}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {name: 'Stroop', mode: 'loop'}},
  ];
};
