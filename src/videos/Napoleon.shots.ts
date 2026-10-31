// 32 — La taille de Napoléon. Montage v3.2, style empire (accent vert, habillage « TEST N°5 »).
// Recette du gorille : la toise à la 1re image (Napoléon en ombre, tête cachée, A · B · C), « raté : 1,69 m »,
// Sainte-Hélène 1821, pouce français contre pouce anglais (−11 cm), Gillray et « Little Boney », la propagande,
// relance, le complexe de Napoléon, les duels au bâton de 2007, « qui a tenu le crayon », boucle.
// Budget : 2 mots qui claquent, 3 tampons, 1 stroboscope.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[]): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  const at = [B.choix, W('un', B.choix + 1.2), W('ou', B.choix + 2.6)];
  const test = {name: 'Toise', at, cd: [] as number[], stop: B.stop};
  const rate = W('raté', B.faux - 0.2);
  return [
    // --- le test : la toise ---
    {t0: 0, bg: 'marble', still: true, anim: test},
    {t0: B.petit - 0.04, bg: 'marble', tr: 'glitch', still: true, anim: {name: 'Toise', reveal: true, lift: rate, wrong: rate + 0.1, right: W('soixante-neuf', B.faux)}},
    {t0: B.moyenne - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'david', w: 700, zoom: 0.14, focus: [0.5, 0.3]}},
    // --- Sainte-Hélène, 1821 ---
    {t0: B.mort - 0.04, bg: 'white', tr: 'invert', num: {text: '1821', color: 'ink', label: 'SAINTE-HÉLÈNE', strobe: true}},
    {t0: W('mort', B.mort + 0.5), bg: 'marble', tr: 'swipe', pic: {name: 'mort', w: 880, zoom: 0.16, focus: [0.45, 0.4]}},
    {t0: W('médecin', B.mort), bg: 'velvet', tr: 'whip', pic: {name: 'mort', w: 880, zoom: 0.35, focus: [0.3, 0.45]}},
    {t0: W('cinq', B.mort + 1), bg: 'velvet', tr: 'slam', pic: {name: 'masque', w: 640, zoom: 0.1}, stamp: {text: '5 PIEDS 2 POUCES', at: W('pouces', B.mort + 1) + 0.04, size: 78, y: 1150, rot: -5}},
    // --- pouce français / pouce anglais ---
    {t0: B.pouce - 0.04, bg: 'marble', tr: 'swipe', anim: {name: 'Pouces', shrink: 99}},
    {t0: B.convertir - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'pudding', w: 880, zoom: 0.18, focus: [0.3, 0.4]}},
    {t0: B.rabot - 0.04, bg: 'marble', tr: 'zoom', anim: {name: 'Pouces', shrink: W('onze', B.rabot) - B.rabot}},
    // --- Gillray ---
    {t0: B.gillray - 0.04, bg: 'marble', tr: 'swipe', pic: {name: 'maniac', w: 880, zoom: 0.1}},
    {t0: W('nabot', B.gillray), bg: 'velvet', tr: 'slam', pic: {name: 'maniac_zoom', w: 700, zoom: 0.14, focus: [0.5, 0.35]}, slam: {text: 'NABOT', at: 0.08, color: 'red', y: 430}},
    {t0: B.boney - 0.04, bg: 'marble', tr: 'whip', pic: {name: 'pudding_boney', w: 700, zoom: 0.12, focus: [0.5, 0.4]}, stamp: {text: 'LITTLE BONEY', at: W('boney', B.boney) + 0.04, size: 96, y: 1160, rot: 6}},
    // --- le nom ---
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LA|PROPAGANDE', sub: '« Little Boney » · James Gillray, 1803'}},
    {t0: B.filtre - 0.04, bg: 'velvet', tr: 'zoom', pics: [{name: 'tiddy', w: 760, y: 600, rot: -5, at: 0}, {name: 'pudding_boney', w: 560, x: 380, y: 860, rot: 4, at: 0.7}, {name: 'maniac_zoom', w: 520, x: 700, y: 900, rot: -3, at: 1.4}]},
    // --- relance ---
    {t0: B.relance - 0.04, bg: 'velvet', tr: 'shutter', pic: {name: 'david_plein', w: 1080, full: true, zoom: 0.12, focus: [0.5, 0.25]}},
    {t0: W('vit', B.relance + 1), bg: 'marble', tr: 'whip', pic: {name: 'maniac_zoom', w: 700, zoom: 0.25, focus: [0.5, 0.3]}},
    // --- le complexe de Napoléon ---
    {t0: B.complexe - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'LE COMPLEXE|DE NAPOLÉON', sub: 'Alfred Adler · « Napoleon complex »'}},
    {t0: B.petits - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'maniac_plein', w: 1080, full: true, zoom: 0.14, focus: [0.5, 0.4]}},
    {t0: B.compte - 0.04, bg: 'marble', tr: 'slam', pic: {name: 'david', w: 640, zoom: 0.1}, slam: {text: 'ÇA COMPTE', at: W('compte', B.compte) - B.compte + 0.04, color: 'gold', y: 430}},
    {t0: B.an - 0.04, bg: 'white', tr: 'invert', num: {text: '2007', color: 'ink', label: 'UNIVERSITÉ DU CENTRAL LANCASHIRE'}},
    {t0: W('chercheurs', B.an), bg: 'marble', tr: 'swipe', pic: {name: 'baton', w: 720, zoom: 0.14, focus: [0.5, 0.4]}},
    {t0: B.grands - 0.04, bg: 'velvet', tr: 'flashRed', pic: {name: 'baton2', w: 720, zoom: 0.12}},
    {t0: W('sont', B.grands + 1), bg: 'marble', tr: 'slam', pic: {name: 'baton', w: 720, zoom: 0.3, focus: [0.3, 0.35]}, stamp: {text: 'LES GRANDS', at: W('grands', B.grands) + 0.04, size: 110, y: 1160, rot: -6}},
    // --- adresse + boucle (dernière image = première) ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'glitch', pic: {name: 'maniac', w: 880, zoom: 0.5, focus: [0.2, 0.92]}},
    {t0: B.loop - 0.04, bg: 'marble', tr: 'blur', still: true, anim: {...test, freezeAt: 0}},
  ];
};
