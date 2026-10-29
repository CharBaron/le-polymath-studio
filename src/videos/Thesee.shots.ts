// 20 — Le bateau de Thésée. Montage v3.1, style céramique grecque à figures noires (accent terre cuite, Cinzel).
// Structure : dilemme « A ou B » qui s'aggrave. Animations : Navire (planches remplacées ; puis deux navires),
// Cellules (tes cellules se renouvellent, pas tes neurones), Teleporteur (Parfit : toi, ou une copie ?).
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook ---
    {t0: 0, bg: 'velvet', still: true, anim: {name: 'Navire', from: 99, to: 100, nolabel: true}},
    {t0: W('toutes', 0), bg: 'velvet', tr: 'flash', still: true, anim: {name: 'Navire', from: 0.1, to: W('une…', 1) - W('toutes', 0) + 0.3}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'trireme', w: 880, zoom: 0.1}, slam: {text: 'LE MÊME ?', at: W('même', B.h2) - B.h2 + 0.04, color: 'gold', y: 300}},
    // --- Plutarque ---
    {t0: B.plutarque - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'plutarch', w: 520}},
    {t0: W('athéniens', B.plutarque), bg: 'marble', tr: 'swipe', pic: {name: 'theseus2', w: 880, focus: [0.3, 0.5]}},
    {t0: W('thésée', B.plutarque), bg: 'velvet', tr: 'spin', pic: {name: 'minotaure', w: 600, zoom: 0.12}},
    {t0: B.planches - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Navire', from: 0.4, to: W('d’origine', B.planches) - B.planches + 0.1}},
    {t0: B.toutes - 0.04, bg: 'velvet', tr: 'flash', anim: {name: 'Navire', from: B.planches + 0.36 - B.toutes, to: W('d’origine', B.planches) + 0.06 - B.toutes}},
    {t0: B.vote - 0.04, bg: 'marble', tr: 'shutter', pic: {name: 'amphora', w: 520}, slam: {text: 'MÊME BATEAU|OU PAS ?', at: 0.04, color: 'gold', y: 290}},
    // --- Hobbes ---
    {t0: B.hobbes - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'hobbes', w: 540, focus: [0.5, 0.35]}, title: 'HOBBES'},
    {t0: B.gardien - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'leviathan', w: 620, focus: [0.5, 0.3], zoom: 0.18}},
    {t0: B.reconstruit - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Navire', mode: 'double', from: 0.2, to: W('bateaux', B.reconstruit) - B.reconstruit}},
    {t0: B.lequel - 0.04, bg: 'velvet', tr: 'flash', still: true, anim: {name: 'Navire', mode: 'double', from: -5, to: -4}, slam: {text: 'LEQUEL ?', at: 0.04, color: 'gold', y: 300}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LE PARADOXE|DE THÉSÉE', sub: 'Plutarque · Hobbes, 1655'}},
    {t0: B.identite - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'canova', w: 580, focus: [0.45, 0.25], zoom: 0.2}},
    // --- relance : c'est toi ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'amphora_zoom', w: 640}, slam: {text: 'LE BATEAU…|C’EST TOI', at: W('toi', B.relance) - B.relance - 0.3, color: 'gold', y: 290}},
    {t0: B.cellules - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Cellules', from: 0.3, to: W('ans', B.cellules) - B.cellules + 0.2}},
    {t0: B.neurones - 0.04, bg: 'velvet', tr: 'zoom', anim: {name: 'Cellules', from: -9, to: -8, neur: W('neurones', B.neurones) - B.neurones}},
    // --- Parfit ---
    {t0: B.parfit - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'mars', w: 600, zoom: 0.14}, title: 'PARFIT'},
    {t0: B.machine - 0.04, bg: 'velvet', tr: 'glitch', still: true, anim: {name: 'Teleporteur'}},
    {t0: B.reveil - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'marsortho', w: 620, focus: [0.3, 0.3], zoom: 0.2}},
    {t0: B.copie - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'canova', w: 560}, slam: {text: 'TOI ?|OU UNE COPIE ?', at: 0.04, color: 'gold', y: 290}},
    {t0: B.commente - 0.04, bg: 'marble', tr: 'flash', pic: {name: 'lampe', w: 760}, slam: {text: 'A = TOI|B = COPIE', at: 0.04, color: 'gold', y: 300}},
    // --- boucle (dernière image = première) ---
    {t0: B.loop - 0.04, bg: 'velvet', tr: 'blur', still: true, anim: {name: 'Navire', from: 99, to: 100, nolabel: true}},
  ];
};
