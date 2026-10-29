// 11 — L'aversion à la perte. DA « Gravure » (src/gravure) : un plan par idée, calé sur les balises du script.
// Pile ou face (pièce d'Alexandre, Met CC0) → chiffres en rouleau → « Cela s'appelle… » → Laocoon / rieur →
// Nobel → mugs de Cornell (Kahneman, Knetsch & Thaler 1990) → effet de dotation → Bourse d'Amsterdam → Épictète → boucle.
import {makeReel, Shot, wordAt} from '../gravure/Reel';
import type {Word} from '../components/Captions';

const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => [
  // --- pile ou face (titre d'accroche en haut jusqu'à 2,9 s) ---
  {t0: 0, bg: 'marble', rays: 'gold', coin: {spin: {t0: 0.12, t1: 0.72, from: 0, to: 6}}},
  {t0: B.p150 - 0.05, bg: 'marble', tr: 'flash', rays: 'gold', num: {text: '+150 €', color: 'gold'}},
  {t0: B.face - 0.05, bg: 'velvet', tr: 'glitch', coin: {spin: {t0: B.face, t1: B.face + 0.6, from: 0, to: 5}}},
  {t0: B.m100 - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '−100 €', color: 'white'}},
  {t0: B.refus - 0.05, bg: 'marble', tr: 'zoom', coin: {half: 1}, stamp: {text: 'Non', at: B.refus + 0.12, size: 150}},
  {t0: B.tous - 0.05, bg: 'marble', leak: true, pic: {name: 'panic', w: 840}, brackets: {x: 330, y: 800, w: 200, h: 180, at: 0.5}},
  // --- le calcul ---
  {t0: B.moyenne - 0.05, bg: 'marble', balance: {tilt: [0, -11], left: '+150', right: '−100'}},
  {t0: B.p25 - 0.05, bg: 'marble', tr: 'flash', rays: 'gold', num: {text: '+25 €', color: 'gold', label: 'EN MOYENNE'}},
  // --- la mesure ---
  {t0: B.kt - 0.05, bg: 'marble', tr: 'glitch', pic: {name: 'philosophers', w: 840}, beam: true},
  {t0: B.risquer - 0.05, bg: 'marble', tr: 'flash', num: {text: '100 €', color: 'white', label: 'POUR RISQUER'}},
  {t0: B.deuxcents - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '200 €', color: 'gold', label: 'POUR ACCEPTER'}},
  {t0: B.double - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', num: {text: '2×', color: 'gold', frieze: false}},
  // --- le nom ---
  {t0: B.nom - 0.05, bg: 'marble', tr: 'blur', card: {}},
  {t0: B.mal - 0.05, bg: 'velvet', tr: 'zoom', pic: {name: 'laocoon', w: 840, zoom: 0.07}},
  {t0: B.plaisir - 0.05, bg: 'marble', tr: 'whip', pic: {name: 'laughing', w: 470, zoom: 0.03}},
  {t0: B.nobel - 0.05, bg: 'white', tr: 'flash', num: {text: '2002', color: 'ink', frieze: false}, laurel: {cy: 790, r: 330, at: 0.25, dark: true}, topLabel: 'PRIX NOBEL D’ÉCONOMIE'},
  // --- les mugs de Cornell ---
  {t0: B.cornell - 0.05, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'amphi', w: 840}, beam: true},
  {t0: B.mug - 0.05, bg: 'marble', tr: 'zoom', pic: {name: 'mug', w: 640}, brackets: {x: 270, y: 440, w: 540, h: 660, at: 0.9}},
  {t0: B.vendre - 0.05, bg: 'marble', pic: {name: 'mug', w: 600}, stamp: {text: 'Pas à vendre', at: wordAt(words, 'vendre', B.vendre), size: 88}},
  {t0: B.p525 - 0.05, bg: 'marble', tr: 'flash', num: {text: '5,25 $', color: 'gold', label: 'POUR LE VENDRE'}},
  {t0: B.acheter - 0.05, bg: 'marble', tr: 'whip', pic: {name: 'democritus', w: 700}},
  {t0: B.p225 - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '2,25 $', color: 'white', label: 'POUR L’ACHETER'}},
  {t0: B.onze - 0.05, bg: 'white', tr: 'glitch', num: {text: '11', color: 'ink', label: 'ÉCHANGES PRÉVUS'}},
  {t0: B.deux - 0.05, bg: 'velvet', tr: 'flashRed', num: {text: '2', color: 'white', label: 'ÉCHANGES RÉELS'}},
  // --- effet de dotation : mot-concept tapé ---
  {t0: B.dotation - 0.05, bg: 'marble', tr: 'blur', concept: {word: 'ENDOWMENT EFFECT', sub: '« l’effet de dotation » · Thaler, 1980'}},
  {t0: B.precieux - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', pic: {name: 'mug', w: 620, y: 840}, crown: {at: 0.15, y: 490, w: 280}},
  {t0: B.parce - 0.05, bg: 'marble', pic: {name: 'mug', w: 620, y: 840}, crown: {at: -9, y: 490, w: 280}, stamp: {text: 'À toi', at: wordAt(words, 'toi', B.parce + 0.5), size: 150, y: 860}},
  // --- la Bourse ---
  {t0: B.bourse - 0.05, bg: 'marble', tr: 'glitch', leak: true, pic: {name: 'bourse', w: 840}, beam: true},
  {t0: B.gagnantes - 0.05, bg: 'marble', tr: 'flash', num: {text: '1,5×', color: 'gold', label: 'PLUS SOUVENT'}},
  {t0: B.perdantes - 0.05, bg: 'velvet', tr: 'whip', pic: {name: 'panic', w: 840}},
  {t0: B.coule - 0.05, bg: 'marble', tr: 'zoom', pic: {name: 'ship', w: 840, zoom: 0.06}},
  // --- Épictète ---
  {t0: B.siecles - 0.05, bg: 'white', tr: 'flash', num: {text: '19', color: 'ink', label: 'SIÈCLES'}},
  {t0: B.epictete - 0.05, bg: 'marble', tr: 'zoom', pic: {name: 'epictete', w: 540, y: 800}, laurel: {cy: 800, r: 320, at: 0.2}, title: 'ÉPICTÈTE'},
  {t0: B.quote - 0.05, bg: 'velvet', tr: 'flashRed', quote: {lines: ['« Ne dis jamais :', 'je l’ai perdu.', 'Dis : je l’ai rendu. »'], sign: '— ÉPICTÈTE, MANUEL, XI'}},
  // --- fin + boucle ---
  {t0: B.peur - 0.05, bg: 'velvet', tr: 'zoom', pic: {name: 'laocoon', w: 840, zoom: 0.09}},
  {t0: B.loop - 0.05, bg: 'marble', tr: 'zoom', rays: 'gold', coin: {spin: {t0: B.loop, t1: dur - 0.32, from: 0, to: 12}}},
];

export const Aversion = makeReel('11-aversion-perte', shotsOf);
