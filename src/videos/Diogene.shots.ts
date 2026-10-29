// 16 — Diogène et le poulet plumé. Montage v3, accent pourpre (philosophie).
// le poulet chez Platon → « bipède sans plumes » → aux ongles plats → la jarre → le bol jeté → la lanterne
// → citoyen du monde → le chien, kunikos → Alexandre : « ôte-toi de mon soleil » → boucle « dont tu pourrais te passer ? ».
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'chicken', w: 840}},
    {t0: W('platon', 0), bg: 'marble', tr: 'whip', pic: {name: 'plato', w: 540}},
    {t0: W('poulet', 0), bg: 'velvet', tr: 'slam', pic: {name: 'rooster', w: 560}, stamp: {text: 'PLUMÉ', at: W('plumé', 0) + 0.05}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'chicken', w: 840, zoom: 0.14}, stamp: {text: 'L’HOMME !', at: W('lhomme', B.h2) + 0.05, size: 110}},
    // --- Platon ---
    {t0: B.def - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'plato', w: 560, zoom: 0.08}},
    {t0: W('bipède', B.def), bg: 'velvet', tr: 'slam', pic: {name: 'rooster', w: 580}, slam: {text: 'SANS|PLUMES', at: 0.45, color: 'gold'}},
    {t0: B.poulet - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'chicken', w: 840}, stamp: {text: 'FAUX', at: W('faux', B.poulet) + 0.05}},
    {t0: B.ongles - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'plato', w: 540}, slam: {text: 'ONGLES|PLATS', at: W('ongles', B.ongles) - B.ongles + 0.04, color: 'gold'}},
    // --- la jarre, le bol ---
    {t0: B.jarre - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'jarre', w: 620}},
    {t0: W('athènes', B.jarre), bg: 'marble', tr: 'zoom', pic: {name: 'gerome', w: 840}},
    {t0: B.bol - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'waterhouse', w: 500}, slam: {text: 'UN SEUL BOL', at: 0.6, color: 'gold', y: 280}},
    {t0: B.enfant - 0.04, bg: 'marble', tr: 'spin', pic: {name: 'jarre', w: 620, zoom: 0.12}},
    {t0: B.jette - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'gerome', w: 840}, stamp: {text: 'JETÉ', at: W('bol', B.jette) + 0.05}},
    // --- la lanterne ---
    {t0: B.lampe - 0.04, bg: 'marble', tr: 'flash', pic: {name: 'lantern', w: 600}, beam: true},
    {t0: B.cherche - 0.04, bg: 'velvet', tr: 'zoom', pic: {name: 'lantern', w: 600, zoom: 0.12}, brackets: {x: 640, y: 760, w: 220, h: 260, at: 0.2}},
    // --- citoyen du monde ---
    {t0: B.pays - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'world', w: 840}},
    {t0: B.monde - 0.04, bg: 'velvet', tr: 'slam', rays: 'gold', pic: {name: 'world', w: 760, zoom: 0.1}, slam: {text: 'CITOYEN|DU MONDE', at: W('citoyen', B.monde) - B.monde + 0.04, color: 'gold', y: 300}},
    {t0: B.cosmo - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'world', w: 720, y: 860}, title: 'KOSMOPOLITÊS'},
    // --- le chien ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'gerome', w: 840, zoom: 0.14}, stamp: {text: 'CHIEN', at: W('chien', B.nom) + 0.05}},
    {t0: B.cynique - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'KYNIKOS', sub: '« comme un chien » → cynique'}},
    {t0: B.sens - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'waterhouse', w: 500}, slam: {text: 'PRESQUE|RIEN', at: W('presque', B.sens) - B.sens + 0.04, color: 'gold', y: 300}},
    // --- Alexandre ---
    {t0: B.ans - 0.04, bg: 'white', tr: 'invert', num: {text: '2 300', color: 'ink', label: 'ANS', strobe: true}},
    {t0: B.alex - 0.04, bg: 'marble', tr: 'zoom', pic: {name: 'loeb', w: 600}, crown: {at: 0.6, y: 360, w: 200}},
    {t0: B.demande - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'alexandre', w: 580}},
    {t0: B.soleil - 0.04, bg: 'marble', tr: 'slam', rays: 'gold', pic: {name: 'tub', w: 760}, slam: {text: 'ÔTE-TOI|DE MON SOLEIL', at: W('ôte-toi', B.soleil) - B.soleil + 0.04, color: 'gold', y: 300}},
    {t0: B.quote - 0.04, bg: 'velvet', tr: 'flashRed', quote: {lines: ['« Si je n’étais pas', 'Alexandre… »'], sign: '— ALEXANDRE, SELON PLUTARQUE'}},
    {t0: W('voudrais', B.quote), bg: 'velvet', tr: 'slam', rays: 'gold', pic: {name: 'loeb', w: 560, y: 820}, slam: {text: 'JE VOUDRAIS|ÊTRE DIOGÈNE', at: 0.02, color: 'gold', y: 290}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'marble', tr: 'glitch', pic: {name: 'jarre', w: 620}},
    {t0: W('choses', B.toi), bg: 'velvet', tr: 'spin', pics: [
      {name: 'lantern', w: 380, x: 320, y: 620, rot: -6, at: 0.02},
      {name: 'world', w: 460, x: 660, y: 820, rot: 5, at: 0.2},
      {name: 'rooster', w: 380, x: 380, y: 1060, rot: -3, at: 0.4},
    ]},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, pic: {name: 'chicken', w: 840}},
  ];
};
