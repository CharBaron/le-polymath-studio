// 15 — L'expérience de Rosenhan (1973). Montage v3, accent bleu (psychologie).
// les vrais patients repèrent les faux → 8 personnes saines, 12 hôpitaux → « vide » → internés → « comportement d'écriture »
// → 52 jours → « oral-acquisitif », 2 100 pilules → « t'es journaliste » → effet d'étiquetage → le défi : 41 / 0
// → 2019, l'étude peut-être inventée → boucle « qui repère vraiment les fous ? ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'bedlam', w: 840}},
    {t0: W('faux', 0), bg: 'velvet', tr: 'glitch', pic: {name: 'fous', w: 640}, stamp: {text: 'FAUX ?', at: W('malades', 0) + 0.05}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'fous', w: 700, zoom: 0.12}, slam: {text: 'LES PATIENTS', at: 0.6, color: 'gold'}},
    // --- l'expérience ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1973', color: 'ink', label: 'DAVID ROSENHAN', strobe: true}},
    {t0: W('huit', B.an), bg: 'marble', tr: 'flash', num: {text: '8', color: 'gold', label: 'PERSONNES EN PARFAITE SANTÉ', strobe: true}},
    {t0: W('douze', B.an), bg: 'marble', tr: 'swipe', pics: [
      {name: 'bethlem', w: 560, x: 400, y: 600, rot: -4, at: 0.02},
      {name: 'ohio', w: 520, x: 640, y: 860, rot: 4, at: 0.25},
      {name: 'asylum', w: 560, x: 420, y: 1090, rot: -2, at: 0.5},
    ], slam: {text: '12 HÔPITAUX', at: 0.1, color: 'gold', y: 300}},
    {t0: B.voix - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'patiente', w: 460}, slam: {text: '« VIDE »', at: W('vide', B.voix) - B.voix + 0.04, color: 'white'}},
    {t0: B.admis - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'ohio', w: 840}, stamp: {text: 'INTERNÉS', at: W('internés', B.admis) + 0.05}},
    {t0: B.normal - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'pinel', w: 840, zoom: 0.1}},
    // --- l'étiquette ---
    {t0: B.ecrire - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'charcot', w: 600}},
    {t0: B.dossier - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'salpetriere', w: 840}, stamp: {text: 'ÉCRITURE', at: W('d’écriture', B.dossier) + 0.05}},
    {t0: B.jours - 0.04, bg: 'velvet', tr: 'invert', num: {text: '52', color: 'gold', label: 'JOURS ENFERMÉS', strobe: true}},
    {t0: B.sortie - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'patiente', w: 460}, stamp: {text: 'SCHIZOPHRÈNE', at: W('schizophrénie', B.sortie) + 0.05, size: 92}},
    // --- la cantine, les pilules ---
    {t0: B.cantine - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'bethlem', w: 840}},
    {t0: B.oral - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'charcot', w: 560}, stamp: {text: 'ORAL-ACQUISITIF', at: W('oral-acquisitif', B.oral) + 0.05, size: 78}},
    {t0: B.pilules - 0.04, bg: 'white', tr: 'invert', num: {text: '2 100', color: 'ink', label: 'PILULES', strobe: true}},
    {t0: B.crache - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'laughing', w: 560, y: 800}, stamp: {text: 'RECRACHÉES', at: W('recrachent', B.crache) + 0.05, size: 100}},
    // --- les vrais patients ---
    {t0: B.patients - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'fous', w: 700}},
    {t0: W('35', B.patients), bg: 'velvet', tr: 'flash', num: {text: '35', color: 'gold', label: 'VRAIS PATIENTS', strobe: true}},
    {t0: B.journaliste - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'panic', w: 840}, slam: {text: 'T’ES|JOURNALISTE', at: W('journaliste', B.journaliste) - B.journaliste + 0.04, color: 'gold'}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LABELING EFFECT', sub: '« l’effet d’étiquetage »'}},
    {t0: B.voit - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'patiente', w: 480}, brackets: {x: 400, y: 520, w: 280, h: 300, at: 0.3}},
    // --- le défi ---
    {t0: B.defi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'salpetriere', w: 840}, slam: {text: 'DÉFI', at: 1.4, color: 'red'}},
    {t0: B.p41 - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '41', color: 'gold', label: 'FAUX PATIENTS DÉMASQUÉS', strobe: true}},
    {t0: B.zero - 0.04, bg: 'white', tr: 'invert', num: {text: '0', color: 'ink', label: 'ENVOYÉS PAR ROSENHAN', strobe: true}, slam: {text: 'AUCUN', at: W('aucun', B.zero) - B.zero + 0.04, color: 'red', y: 300}},
    // --- sauf que : 2019 ---
    {t0: B.sauf - 0.04, bg: 'velvet', tr: 'glitch', num: {text: '2019', color: 'gold', label: 'L’ENQUÊTE', strobe: true}},
    {t0: W('journaliste', B.sauf), bg: 'white', tr: 'swipe', pic: {name: 'asylum', w: 760, zoom: 0.12}},
    {t0: B.doute - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'bedlam', w: 840}, stamp: {text: 'INVENTÉE ?', at: W('inventée', B.doute) + 0.05}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'fous', w: 700}, brackets: {x: 300, y: 520, w: 300, h: 300, at: 0.3}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, pic: {name: 'bedlam', w: 840}},
  ];
};
