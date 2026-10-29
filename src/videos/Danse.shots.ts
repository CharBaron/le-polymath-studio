// 14 — L'épidémie de danse de Strasbourg (1518). Montage v3, accent vert (histoire).
// une femme danse → 30 → 400 → remède : des musiciens → pire, des morts → l'ergot ? impossible → choréomanie
// → saint Guy, Saverne → 1374, le Rhin → 1962, fou rire en Tanzanie → boucle « quelqu'un se met à danser ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const dancers = (at: number) => [
    {name: 'epileptici', w: 430, x: 300, y: 620, rot: -4, at},
    {name: 'pipers', w: 470, x: 690, y: 820, rot: 5, at: at + 0.3},
    {name: 'pilgrims', w: 460, x: 360, y: 1060, rot: -2, at: at + 0.6},
  ];
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'pilgrims', w: 760}},
    {t0: W('strasbourg', 0), bg: 'marble', tr: 'swipe', pic: {name: 'strasbourg', w: 840, zoom: 0.1}},
    {t0: W('danser', 0), bg: 'velvet', tr: 'slam', pic: {name: 'epileptici', w: 640}},
    {t0: W('six', B.h2), bg: 'marble', tr: 'invert', num: {text: '6', color: 'gold', label: 'JOURS SANS S’ARRÊTER', strobe: true}},
    // --- contagion ---
    {t0: B.sem - 0.04, bg: 'marble', tr: 'whip', pics: dancers(0.05)},
    {t0: W('trente', B.sem), bg: 'white', tr: 'flash', num: {text: '30', color: 'ink', label: 'UNE SEMAINE PLUS TARD', strobe: true}},
    {t0: W('400', B.aout), bg: 'velvet', tr: 'flashRed', num: {text: '400', color: 'gold', label: 'DANSEURS EN AOÛT', strobe: true}},
    {t0: W('dansent', B.aout), bg: 'marble', tr: 'swipe', pic: {name: 'peasants', w: 840, zoom: 0.1}},
    // --- le remède ---
    {t0: B.remede - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'strasbourg', w: 840}, slam: {text: 'LE REMÈDE ?', at: 0.3, color: 'gold'}},
    {t0: B.musique - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'bagpiper', w: 540}},
    {t0: W('scène', B.musique), bg: 'velvet', tr: 'whip', pic: {name: 'pipers', w: 840}},
    {t0: B.plus - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'peasants', w: 840}, stamp: {text: 'ENCORE +', at: W('encore', B.plus) + 0.05}},
    // --- pire ---
    {t0: B.pire - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'trumpeters', w: 560}, slam: {text: 'PIRE', at: 0.6, color: 'red'}},
    {t0: B.morts - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'famine', w: 680, zoom: 0.1}, stamp: {text: 'MORTS', at: W('meurent', B.morts) + 0.05}},
    // --- l'ergot ? ---
    {t0: B.ergot - 0.04, bg: 'white', tr: 'swipe', pic: {name: 'ergot', w: 620}, topLabel: 'L’ERGOT DE SEIGLE'},
    {t0: W('hallucinations', B.ergot), bg: 'velvet', tr: 'invert', pic: {name: 'laughing', w: 560}},
    {t0: B.sang - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'ergot', w: 560}, stamp: {text: 'IMPOSSIBLE', at: W('impossible', B.sang) + 0.05, size: 100}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'CHOREOMANIA', sub: '« maladie psychogène de masse »'}},
    {t0: B.stress - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'famine', w: 680}},
    {t0: W('panique', B.stress), bg: 'velvet', tr: 'spin', pics: dancers(0.02)},
    // --- saint Guy ---
    {t0: B.saint - 0.04, bg: 'white', tr: 'flash', pic: {name: 'saints', w: 540}, topLabel: 'SAINT GUY'},
    {t0: B.saverne - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'molenbeek', w: 840, zoom: 0.1}},
    {t0: B.fin1 - 0.04, bg: 'marble', tr: 'zoom', rays: 'gold', pic: {name: 'strasbourg', w: 760}},
    // --- pas un cas isolé ---
    {t0: B.sauf - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'pilgrims', w: 720}, stamp: {text: 'PAS ISOLÉ', at: W('isolé', B.sauf) + 0.05}},
    {t0: B.rhin - 0.04, bg: 'white', tr: 'invert', num: {text: '1374', color: 'ink', label: 'LES VILLES DU RHIN', strobe: true}},
    {t0: W('folie', B.rhin), bg: 'marble', tr: 'swipe', pic: {name: 'epileptici', w: 680}},
    {t0: B.rire - 0.04, bg: 'white', tr: 'invert', num: {text: '1962', color: 'ink', label: 'TANZANIE', strobe: true}},
    {t0: W('fou', B.rire), bg: 'velvet', tr: 'slam', pic: {name: 'laughing', w: 600}, slam: {text: 'FOU RIRE', at: 0.25, color: 'gold'}},
    {t0: W('quatorze', B.rire), bg: 'marble', tr: 'flash', num: {text: '14', color: 'gold', label: 'ÉCOLES FERMÉES', strobe: true}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'peasants', w: 840}, brackets: {x: 320, y: 560, w: 440, h: 340, at: 0.4}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, pic: {name: 'pilgrims', w: 760}},
  ];
};
