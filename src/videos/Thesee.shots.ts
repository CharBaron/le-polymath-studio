// 20 — Le bateau de Thésée. Montage v3.2, style céramique grecque à figures noires (accent terre cuite, Cinzel).
// Hook provocant (« tes cellules ont moins de dix ans… alors ton ex a couché avec qui ? ») sur l'Homme de Vitruve et Canova.
// Animations : Cellules (Vitruve), Navire (planches arrachées et remplacées ; deux navires), Teleporteur (tuiles vers Mars).
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const vit = {name: 'Cellules', from: 99, to: 100}; // l'Homme de Vitruve et sa grille de cellules (1re et dernière image)
  const p0 = B.planches + 0.4, p1 = W('d’origine', B.planches) + 0.1; // remplacement des planches, en temps absolu
  return [
    // --- hook ---
    {t0: 0, bg: 'velvet', still: true, anim: vit},
    {t0: W('cellules', 0), bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Cellules', from: 0.1, to: B.h2 - W('cellules', 0) - 0.3}},
    {t0: B.h2 - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'psyche', w: 880, focus: [0.62, 0.3], zoom: 0.25}},
    {t0: W('couché', B.h2), bg: 'velvet', tr: 'glitch', pic: {name: 'psyche', w: 880, focus: [0.55, 0.55], zoom: 0.12}, slam: {text: 'AVEC QUI ?', at: W('qui,', B.h2) - W('couché', B.h2), color: 'gold', y: 300}},
    // --- le bateau, Plutarque ---
    {t0: B.bateau - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'amphora', w: 540, zoom: 0.12}},
    {t0: W('bateau', B.bateau), bg: 'velvet', tr: 'zoom', anim: {name: 'Navire', from: 99, to: 100, nolabel: true}},
    {t0: B.plutarque - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'plutarch', w: 520}},
    {t0: W('athéniens', B.plutarque), bg: 'marble', tr: 'swipe', pic: {name: 'theseus2', w: 880, focus: [0.3, 0.5]}},
    {t0: W('thésée', B.plutarque), bg: 'velvet', tr: 'spin', pic: {name: 'minotaure', w: 600, zoom: 0.12}},
    {t0: B.planches - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Navire', from: p0 - B.planches + 0.04, to: p1 - B.planches + 0.04}},
    {t0: B.toutes - 0.04, bg: 'velvet', tr: 'flash', anim: {name: 'Navire', from: p0 - B.toutes + 0.04, to: p1 - B.toutes + 0.04}},
    {t0: B.vote - 0.04, bg: 'marble', tr: 'shutter', pic: {name: 'amphora_zoom', w: 640}},
    // --- Hobbes ---
    {t0: B.hobbes - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'hobbes', w: 540, focus: [0.5, 0.35]}, title: 'HOBBES'},
    {t0: B.gardien - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'leviathan', w: 620, focus: [0.5, 0.3], zoom: 0.18}},
    {t0: B.reconstruit - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Navire', mode: 'double', from: 0.2, to: W('bateaux', B.reconstruit) - B.reconstruit}},
    {t0: B.lequel - 0.04, bg: 'velvet', tr: 'flash', still: true, anim: {name: 'Navire', mode: 'double', from: -5, to: -4}, slam: {text: 'LEQUEL ?', at: 0.04, color: 'gold', y: 300}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LE PARADOXE|DE THÉSÉE', sub: 'Plutarque · Hobbes, 1655'}},
    {t0: B.identite - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'canova', w: 580, focus: [0.45, 0.25], zoom: 0.2}},
    // --- relance : c'est toi ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', still: true, anim: {name: 'Cellules', from: -9, to: -8}},
    {t0: B.neurones - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Cellules', from: -9, to: -8, neur: W('neurones', B.neurones) - B.neurones}},
    // --- Parfit ---
    {t0: B.parfit - 0.04, bg: 'velvet', tr: 'whip', slam: {text: 'DEREK|PARFIT', at: 0.02, color: 'gold', y: 760, size: 150}},
    {t0: B.machine - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Teleporteur'}},
    {t0: B.reveil - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'mars', w: 640, zoom: 0.16}},
    {t0: W('souvenirs…', B.reveil), bg: 'marble', tr: 'zoom', pic: {name: 'marsortho', w: 620, focus: [0.3, 0.3], zoom: 0.2}},
    {t0: B.copie - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'canova', w: 560, zoom: 0.12}},
    {t0: B.reponse - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'psyche', w: 880, focus: [0.6, 0.3], zoom: 0.15}},
    // --- boucle (dernière image = première) ---
    {t0: B.loop - 0.04, bg: 'velvet', tr: 'blur', still: true, anim: vit},
  ];
};
