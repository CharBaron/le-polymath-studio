// 31 — Le trou dans ton œil (la tache aveugle). Montage v3.2, style optique (accent sang, habillage « TEST N°4 »).
// Recette du gorille : le vrai test à la 1re image (croix + point rouge, il disparaît vers 20 cm), révélation,
// le nerf optique, Mariotte vers 1660, le concept, le cerveau qui bouche le trou, relance, les saccades (≈ 1 h
// d'aveuglement par jour), boucle. Le test reste immobile (still) pour qu'il marche sur le téléphone.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const test = {name: 'TacheTest', at: [B.fixe, B.approche]};
  return [
    // --- le test : un seul plan, rien ne bouge ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    {t0: B.point - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'TacheTest', reveal: true}},
    {t0: B.trou - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'regard', w: 700, zoom: 0.3, focus: [0.42, 0.32]}, slam: {text: 'UN TROU', at: W('trou', B.trou) - B.trou + 0.04, color: 'red', y: 430}},
    // --- le nerf optique ---
    {t0: B.nerf - 0.04, bg: 'marble', tr: 'swipe', anim: {name: 'Nerf', hit: W('aucune', B.nerf) - B.nerf + 0.04}},
    {t0: B.chaque - 0.04, bg: 'velvet', tr: 'flashRed', num: {text: '×2', color: 'gold', label: 'UN DANS CHAQUE ŒIL'}},
    {t0: B.naissance - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'yeux', w: 880, zoom: 0.15, focus: [0.3, 0.6]}},
    // --- Mariotte, vers 1660 ---
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '1660', color: 'ink', label: 'EDME MARIOTTE', strobe: true}},
    {t0: W('physicien', B.an), bg: 'velvet', tr: 'whip', pic: {name: 'academie_zoom', w: 760, zoom: 0.18, focus: [0.4, 0.5]}},
    {t0: W('montre', B.an + 1), bg: 'marble', tr: 'swipe', pic: {name: 'academie', w: 880, zoom: 0.2, focus: [0.3, 0.6]}},
    {t0: B.piece - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'testelin', w: 720, zoom: 0.14, focus: [0.6, 0.4]}, slam: {text: 'DISPARAÎT', at: B.pfft - B.piece + 0.04, color: 'red', y: 430}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA TACHE|AVEUGLE', sub: '« blind spot » · papille optique · Mariotte, vers 1660'}},
    {t0: B.filtre - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'TacheTest', patch: true}},
    {t0: W('invente', B.filtre + 1), bg: 'velvet', tr: 'whip', pic: {name: 'oeil_nerf', w: 700, zoom: 0.2, focus: [0.5, 0.6]}},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'academie_plein', w: 1080, full: true, zoom: 0.14, focus: [0.5, 0.4]}},
    // --- les saccades ---
    {t0: B.miroir - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'testelin', w: 720, zoom: 0.3, focus: [0.55, 0.36]}},
    {t0: W('gauche', B.miroir), bg: 'velvet', tr: 'whip', pic: {name: 'regard', w: 700, zoom: 0.5, focus: [0.33, 0.35]}},
    {t0: W('droit', B.miroir + 1), bg: 'velvet', tr: 'whip', pic: {name: 'regard', w: 700, zoom: 0.5, focus: [0.62, 0.35]}},
    {t0: B.bouger - 0.04, bg: 'marble', tr: 'glitch', anim: {name: 'Saccades', count: B.milliers - B.bouger, hour: W('heure', B.heure) - B.bouger}},
    {t0: B.recolle - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'oeil', w: 860, zoom: 0.18, focus: [0.43, 0.8]}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'regard', w: 640, zoom: 0.4, focus: [0.42, 0.3]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
