// 12 — La loi de Gresham. DA « Gravure » (moteur src/gravure/Reel.tsx).
// Quarters en argent qui disparaissent (1965) → « Cela s'appelle la loi de Gresham » → Gresham 1558, Copernic →
// Aristophane, Les Grenouilles (citation) → sauf en hyperinflation : Zimbabwe 2009, loi de Thiers → boucle sur 1965.
import {makeReel, Shot, wordAt} from '../gravure/Reel';
import type {Word} from '../components/Captions';

const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => [
  // --- hook : la pièce qui tourne, titre doré en haut ---
  {t0: 0, bg: 'marble', rays: 'gold', coin: {spin: {t0: 0.12, t1: 0.72, from: 0, to: 6}}},
  {t0: wordAt(words, 'disparaissent', 0.5) - 0.05, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'panic', w: 840}, brackets: {x: 300, y: 800, w: 220, h: 190, at: 0.6}},
  {t0: B.vol - 0.05, bg: 'velvet', tr: 'flashRed', coin: {half: 1}, stamp: {text: 'Volées ?', at: wordAt(words, 'volees', B.vol), size: 140}},
  // --- avant / après 1965 ---
  {t0: wordAt(words, '1964', B.avant) - 0.2, bg: 'white', tr: 'flash', num: {text: '1964', color: 'ink', label: 'JUSQU’EN'}},
  {t0: B.p90 - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '90 %', color: 'gold', label: 'D’ARGENT'}},
  {t0: B.loi - 0.05, bg: 'marble', tr: 'zoom', coin: {half: 0}, stamp: {text: 'Sans argent', at: wordAt(words, 'argent', B.loi), size: 100}},
  {t0: B.meme - 0.05, bg: 'marble', tr: 'blur', rays: 'gold', coin: {spin: {t0: B.meme, t1: B.meme + 1.1, from: 0, to: 4}}},
  // --- le calcul de tout le monde ---
  {t0: B.calcul - 0.05, bg: 'marble', tr: 'blur', balance: {tilt: [0, -12], left: '90 %', right: '0 %'}},
  {t0: B.depense - 0.05, bg: 'marble', tr: 'whip', pic: {name: 'dollar', w: 840}},
  {t0: B.garde - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', coin: {half: 0}, crown: {at: 0.15, y: 420, w: 260}},
  {t0: B.tiroirs - 0.05, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'misers', w: 760}, brackets: {x: 330, y: 820, w: 300, h: 230, at: 0.5}},
  // --- le nom ---
  {t0: B.nom - 0.05, bg: 'marble', tr: 'blur', card: {}},
  {t0: B.chasse - 0.05, bg: 'marble', tr: 'zoom', concept: {word: 'BAD MONEY DRIVES OUT GOOD', sub: '« la mauvaise monnaie chasse la bonne »'}},
  // --- Gresham, Copernic ---
  {t0: B.thomas - 0.05, bg: 'marble', tr: 'blur', pic: {name: 'gresham', w: 620}, brackets: {x: 400, y: 450, w: 280, h: 300, at: 0.5}},
  {t0: wordAt(words, 'd’Élisabeth', B.thomas) - 0.05, bg: 'marble', tr: 'whip', pic: {name: 'elizabeth', w: 620}},
  {t0: B.an1558 - 0.05, bg: 'white', tr: 'flash', num: {text: '1558', color: 'ink', label: 'LETTRE À LA REINE'}},
  {t0: B.copernic - 0.05, bg: 'marble', tr: 'glitch', pic: {name: 'copernic', w: 620}, beam: true},
  // --- Aristophane ---
  {t0: B.an2400 - 0.05, bg: 'white', tr: 'flash', num: {text: '2 400', color: 'ink', label: 'ANS'}},
  {t0: wordAt(words, 'aristophane', B.an2400) - 0.05, bg: 'marble', tr: 'zoom', pic: {name: 'aristophane', w: 560, y: 820}, laurel: {cy: 820, r: 380, at: 0.2}, title: 'ARISTOPHANE'},
  {t0: B.quote - 0.05, bg: 'velvet', tr: 'flashRed', quote: {lines: ['« Les belles pièces d’argent', 'ne circulent plus ;', 'seul le mauvais bronze', 'passe de main en main. »'], sign: '— D’APRÈS LES GRENOUILLES, 405 AV. J.-C.'}},
  // --- sauf que : l'inverse ---
  {t0: B.sauf - 0.05, bg: 'velvet', tr: 'glitch', pic: {name: 'zimb', w: 840}},
  {t0: B.inverse - 0.05, bg: 'velvet', pic: {name: 'zimb', w: 800}, stamp: {text: 'Sans valeur', at: B.inverse + 0.1, size: 100}},
  {t0: B.zimb - 0.05, bg: 'white', tr: 'flash', num: {text: '2009', color: 'ink', label: 'ZIMBABWE'}},
  {t0: B.usd - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', pic: {name: 'dollar', w: 820}, crown: {at: 0.2, y: 560, w: 240}},
  {t0: B.thiers - 0.05, bg: 'marble', tr: 'blur', pic: {name: 'thiers', w: 560, y: 860}, title: 'LOI DE THIERS'},
  // --- adresse + boucle ---
  {t0: B.toi - 0.05, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'misers', w: 760}},
  {t0: B.vieille - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '2 400', color: 'gold', label: 'ANS'}},
  {t0: B.loop - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', coin: {spin: {t0: B.loop, t1: dur - 0.32, from: 0, to: 10}}},
];

export const Gresham = makeReel('12-loi-de-gresham', shotsOf, ['quarter_ob', 'quarter_rev']);
