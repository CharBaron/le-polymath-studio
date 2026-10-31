// 37 — Lis à voix haute (TEST N°9, l'effet du mot manquant). Montage v3.2, style école (ardoise, cahier, accent bleu).
// Format TEST court (stratégie du 31/10) : le triangle « J'AIME / PARIS AU / AU PRINTEMPS » dès la 1re image (immobile),
// révélation (les deux « AU » entourés), 2e piège pour le spectateur méfiant (il cherche un doublon, il manque un mot), le
// concept (Healy & Zangara, 2017), le chiffre de Staub, Dodge & Cohen (2019), « Envoie-la à quelqu'un », boucle sur le triangle.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- le test : le panneau ne bouge pas ---
    {t0: 0, bg: 'marble', still: true, anim: {name: 'Triangle', at: [B.c3, B.c2, B.c1], stop: B.stop}},
    // --- la révélation ---
    {t0: B.relis - 0.04, bg: 'velvet', tr: 'invert', still: true, anim: {name: 'Triangle', reveal: true}},
    // --- 2e essai : il manque un mot ---
    {t0: B.essai - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Plaque', lu: B.lu, barre: B.pasle + 0.35, label: 'IL N’Y EST PAS'}},
    {t0: B.existe - 0.04, bg: 'velvet', tr: 'glitch', still: true, anim: {name: 'Plaque', lu: 0, barre: 0, static: true}, slam: {text: 'UN MOT FANTÔME', at: 0.15, color: 'red', y: 1150, size: 90}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’EFFET|DU MOT|MANQUANT', sub: '« missing word effect » · Healy & Zangara, 2017'}},
    {t0: B.devine - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'liseuse', w: 640, zoom: 0.2, focus: [0.4, 0.4]}, slam: {text: 'IL DEVINE', at: W('devine', B.devine) - B.devine + 0.1, color: 'gold', y: 300}},
    // --- 2019 : les yeux des lecteurs ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '2019', color: 'ink', label: 'STAUB, DODGE & COHEN', strobe: true}},
    {t0: W('chercheurs', B.an), bg: 'marble', tr: 'whip', pic: {name: 'ecole', w: 880, zoom: 0.18, focus: [0.55, 0.4]}},
    {t0: W('yeux', B.an), bg: 'velvet', tr: 'slam', pic: {name: 'oeil', w: 760, zoom: 0.15}},
    {t0: W('lecteurs', B.an), bg: 'marble', tr: 'whip', pic: {name: 'liseuse_livre', w: 680, zoom: 0.15, focus: [0.5, 0.5]}},
    {t0: B.p54 - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '54 %', color: 'gold', label: 'DES DOUBLONS RATÉS'}},
    {t0: W('fois', B.p54), bg: 'marble', tr: 'whip', pic: {name: 'ecole_maitre', w: 640, zoom: 0.15}},
    // --- « Envoie-la à quelqu'un. Sans rien lui dire. » puis la boucle (dernière image = première) ---
    {t0: B.envoie - 0.04, bg: 'marble', tr: 'swipe', still: true, anim: {name: 'Triangle', order: 'ENVOIE-LA À QUELQU’UN|SANS RIEN LUI DIRE'}},
    {t0: Math.max(B.loop - 0.04, dur - 1.6), bg: 'marble', tr: 'blur', still: true, anim: {name: 'Triangle'}},
  ];
};
