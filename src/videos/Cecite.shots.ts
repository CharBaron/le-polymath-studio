// 35 — Trouve ce qui change (la cécité au changement). Montage v3.2, style labo (accent bleu, habillage « TEST N°8 »).
// Format TEST court (stratégie du 31/10) : le vrai test « flicker » de Rensink, O'Regan & Clark (1997) dès la 1re image, puis
// la révélation (la flèche du beffroi entourée), la preuve (le même test sans le gris), le concept, la porte de Simons & Levin
// (1998), « Envoie-la à quelqu'un », boucle sur le test. Le test reste immobile (still) pour qu'il marche sur le téléphone.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const test = {name: 'Flicker', at: [B.c5, B.c4, B.c3, B.c2, B.c1], stop: B.stop};
  return [
    // --- le test : un seul plan, la carte ne bouge pas ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    // --- la révélation ---
    {t0: B.tour - 0.04, bg: 'velvet', tr: 'invert', still: true, anim: {name: 'Flicker', mode: 'reveal'}},
    {t0: B.fleche - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Flicker', mode: 'reveal', zoom: 1, label: ''}},
    {t0: B.gris - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Flicker', mode: 'nogray'}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA CÉCITÉ|AU|CHANGEMENT', sub: '« change blindness » · Rensink, 1997'}},
    // --- la porte (Simons & Levin, 1998) ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1998', color: 'ink', label: 'SIMONS & LEVIN · CORNELL', strobe: true}},
    {t0: W('inconnu', B.an), bg: 'velvet', tr: 'whip', pic: {name: 'homme1', w: 560, zoom: 0.12, focus: [0.5, 0.35]}},
    {t0: W('passants', B.an + 1), bg: 'marble', tr: 'swipe', pic: {name: 'ville_a', w: 880, zoom: 0.55, focus: [0.48, 0.78]}},
    {t0: B.porte - 0.04, bg: 'velvet', tr: 'slam', still: true, anim: {name: 'Porte', pass: [B.porte + 0.25, B.autre + 0.15]}, slam: {text: 'UN AUTRE HOMME', at: B.autre - B.porte + 0.3, color: 'gold', y: 1120, size: 90}},
    {t0: B.moitie - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '8 / 15', color: 'gold', label: 'N’ONT RIEN REMARQUÉ'}},
    {t0: W('rien', B.moitie) + 0.3, bg: 'marble', tr: 'whip', pics: [{name: 'homme1', w: 400, x: 300, y: 760, rot: -4, at: 0}, {name: 'homme2', w: 400, x: 745, y: 760, rot: 4, at: 0.3}]},
    // --- « Envoie-la à quelqu'un. Sans rien lui dire. » puis la boucle (dernière image = première) ---
    {t0: B.envoie - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Flicker', mode: 'loop', order: 'ENVOIE-LA À QUELQU’UN|SANS RIEN LUI DIRE'}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {name: 'Flicker', mode: 'loop', holdFrom: dur - 0.65}},
  ];
};
