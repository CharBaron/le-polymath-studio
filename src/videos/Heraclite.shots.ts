// 42 — Héraclite, enterré dans la bouse (légende rapportée par Diogène Laërce, IX, 3-4). Montage v3.2, style étable.
// Format PERSONNAGE FOU court (stratégie du 31/10, modèle Diogène/Bentham) : l'image la plus folle à la 1re image (Héraclite
// sous le tas de bouse, mouches, vapeur ; deux mottes s'écrasent sur « enterré » et « bouse »), puis un fait par plan qui
// monte : les osselets plutôt que les lois → la montagne et l'herbe → le corps qui se remplit d'eau → l'énigme aux médecins
// → l'étable, la bouse qui le recouvre → la mort → la bouse qui sèche, les chiens → toi et Google → la vache → boucle.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const hook = {name: 'Bouse', mode: 'hook'};
  return [
    // --- hook : le tas de bouse, en entier ---
    {t0: 0, bg: 'marble', still: true, anim: {...hook, splats: [W('enterre', 0) + 0.05, W('bouse', 0) + 0.05]}},
    {t0: B.h2 - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'portrait_plein', w: 1080, full: true, zoom: 0.14, focus: [0.42, 0.42]}, slam: {text: 'IL L’A VOULU', at: W('voulu', B.h2) - B.h2 + 0.04, color: 'gold', y: 470}},
    // --- qui : Héraclite, la légende ---
    {t0: B.qui - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'pleure', w: 600, y: 900, zoom: 0.08}, title: 'HÉRACLITE'},
    {t0: W('diogene', B.qui), bg: 'velvet', tr: 'zoom', pic: {name: 'pleure', w: 640, zoom: 0.4, focus: [0.42, 0.28]}, stamp: {text: 'LÉGENDE', at: W('laerce', B.qui) + 0.12, y: 1130}},
    {t0: B.lois - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'temple', w: 880, y: 880, zoom: 0.2, focus: [0.4, 0.45]}, title: 'ÉPHÈSE'},
    {t0: B.osselets - 0.04, bg: 'velvet', tr: 'slam', still: true, anim: {name: 'Osselets', at: W('osselets', B.osselets) - 0.1}},
    // --- la montagne, l'herbe ---
    {t0: B.hait - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'portrait_plein', w: 1080, full: true, zoom: 0.3, focus: [0.4, 0.5]}, stamp: {text: 'MISANTHROPE', at: W('humains', B.hait) + 0.1, y: 1120, size: 74}},
    {t0: B.herbe - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'montagne', w: 880, zoom: 0.35, focus: [0.2, 0.75]}},
    {t0: W('lherbe', B.herbe), bg: 'marble', tr: 'whip', pic: {name: 'koe', w: 860, zoom: 0.25, focus: [0.75, 0.72]}},
    // --- l'eau, l'énigme ---
    {t0: B.gonfle - 0.04, bg: 'velvet', tr: 'zoom', still: true, anim: {name: 'Gonfle'}},
    {t0: B.enigme - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'docteurs', w: 880, zoom: 0.35, focus: [0.45, 0.5]}},
    {t0: W('changer', B.enigme), bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Enigme', at: W('secheresse', B.enigme)}},
    // --- l'étable, la bouse ---
    {t0: B.etable - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'stal', w: 880, zoom: 0.4, focus: [0.45, 0.62]}},
    {t0: B.nom - 0.04, bg: 'velvet', tr: 'slam', still: true, anim: {name: 'Bouse', mode: 'cover', cover: [B.nom + 0.15, W('vache', B.nom) + 0.25], heat: B.chaleur + 0.15}},
    // --- la mort, la bouse sèche, les chiens ---
    {t0: B.mort - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'arts', w: 720, zoom: 0.3, focus: [0.58, 0.42]}, stamp: {text: 'MORT', at: W('meurt', B.mort) + 0.08, y: 1130}},
    {t0: B.seche - 0.04, bg: 'velvet', tr: 'invert', still: true, anim: {name: 'Bouse', mode: 'dry', crack: W('seche', B.seche)}},
    {t0: B.chiens - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'honden', w: 860, zoom: 0.25, focus: [0.3, 0.45]}, slam: {text: 'DÉVORÉ', at: W('devorent', B.chiens) - B.chiens + 0.04, color: 'red', y: 470}},
    // --- toi ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Recherche'}},
    {t0: B.vache - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'koekop', w: 660, y: 920, zoom: 0.18, focus: [0.45, 0.5]}, title: 'SON MÉDECIN'},
    // --- « Envoie-la à quelqu'un » puis la boucle (dernière image = première) ---
    {t0: B.envoie - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {...hook, order: 'ENVOIE-LA À QUELQU’UN|SANS RIEN LUI DIRE'}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: hook},
  ];
};
