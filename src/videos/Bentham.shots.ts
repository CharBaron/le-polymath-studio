// 36 — Jeremy Bentham, le philosophe empaillé. Montage v3.2, style cabinet (vitrine en acajou, accent pourpre : philosophie).
// Format PERSONNAGE FOU court (stratégie du 31/10, modèle Diogène) : la vraie photo de l'auto-icône à la 1re image, puis un fait
// par plan qui monte : dissection publique → squelette habillé (animation) → l'auto-icône → la tête ratée, la tête en cire, la
// vraie entre ses jambes → volée en 1975, la rançon → le conseil de 2013 → toi qui sèches les réunions → boucle sur la photo.
import type {Word} from '../components/Captions';
import {Shot, wordAt} from '../gravure/shots';

export const shotsOf = (B: Record<string, number>, words: Word[], dur: number): Shot[] => {
  const W = (w: string, after: number) => wordAt(words, w, after) - 0.04;
  return [
    // --- hook : la photo, en plein écran ---
    {t0: 0, bg: 'marble', still: true, pic: {name: 'icone_plein', w: 1080, full: true, zoom: 0}},
    {t0: B.h2 - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'conseil', w: 880, zoom: 0.25, focus: [0.5, 0.55]}},
    {t0: W('reunion', B.h2), bg: 'marble', tr: 'whip', pic: {name: 'profil', w: 520, zoom: 0.08}},
    // --- le corps légué, la dissection publique ---
    {t0: B.legue - 0.04, bg: 'velvet', tr: 'swipe', pic: {name: 'portrait', w: 620, zoom: 0.1, focus: [0.5, 0.35]}, title: 'JEREMY BENTHAM'},
    {t0: W('corps', B.legue), bg: 'marble', tr: 'whip', pic: {name: 'carica', w: 600, zoom: 0.15, focus: [0.4, 0.4]}},
    {t0: W('medecin', B.legue), bg: 'velvet', tr: 'whip', pic: {name: 'tulp_zoom', w: 740, zoom: 0.12, focus: [0.75, 0.4]}},
    {t0: B.public - 0.04, bg: 'marble', tr: 'flashRed', pic: {name: 'tulp', w: 880, zoom: 0.18, focus: [0.45, 0.65]}, slam: {text: 'EN PUBLIC', at: 0.1, color: 'red', y: 330}},
    // --- le squelette habillé ---
    {t0: B.squelette - 0.04, bg: 'velvet', tr: 'slam', still: true, anim: {name: 'Habille', at: W('vetements', B.squelette) - 0.25}},
    {t0: B.nom - 0.04, bg: 'marble', tr: 'blur', concept: {word: 'L’AUTO-|ICÔNE', sub: '« auto-icon » · Bentham, 1832'}},
    // --- les têtes ---
    {t0: B.tete - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'portrait', w: 640, zoom: 0.45, focus: [0.5, 0.3]}, stamp: {text: 'RATÉ', at: W('peur', B.tete) + 0.1, y: 760}},
    {t0: B.cire - 0.04, bg: 'marble', tr: 'invert', still: true, anim: {name: 'Tetes', mode: 'cire'}},
    {t0: B.jambes - 0.04, bg: 'marble', tr: 'zoom', still: true, anim: {name: 'Tetes', mode: 'jambes'}},
    // --- 1975 : la tête volée ---
    {t0: B.vol - 0.04, bg: 'white', tr: 'invert', num: {text: '1975', color: 'ink', label: 'DES ÉTUDIANTS', strobe: true}},
    {t0: W('volent', B.vol) - 0.1, bg: 'velvet', tr: 'slam', pic: {name: 'icone_tete', w: 560, zoom: 0.12}, slam: {text: 'VOLÉE', at: 0.08, color: 'red', y: 330}},
    {t0: B.rancon - 0.04, bg: 'velvet', tr: 'swipe', still: true, anim: {name: 'Rancon'}, stamp: {text: 'UCL A PAYÉ 10 £', at: B.conseil - 0.75, y: 1180, size: 70}},
    // --- 2013 : le conseil ---
    {t0: B.conseil - 0.04, bg: 'marble', tr: 'glitch', num: {text: '2013', color: 'gold', label: 'CONSEIL DE L’UNIVERSITÉ', strobe: true}},
    {t0: W('surprise', B.conseil), bg: 'velvet', tr: 'whip', pic: {name: 'conseil_zoom', w: 820, zoom: 0.2, focus: [0.5, 0.5]}},
    {t0: W('luniversite', B.conseil), bg: 'marble', tr: 'swipe', pic: {name: 'vitrine', w: 540, zoom: 0.1}},
    // --- toi ---
    {t0: B.toi - 0.04, bg: 'velvet', tr: 'whip', pic: {name: 'sommeil', w: 640, zoom: 0.1}},
    {t0: W('reunions', B.toi), bg: 'marble', tr: 'whip', pic: {name: 'sommeil_zoom', w: 760, zoom: 0.18, focus: [0.4, 0.5]}},
    {t0: B.loop - 0.04, bg: 'velvet', tr: 'slam', pic: {name: 'profil', w: 520, zoom: 0.1}},
    {t0: W('encore', B.loop), bg: 'marble', tr: 'whip', pic: {name: 'courtiers', w: 880, zoom: 0.15}},
    {t0: W('ans', B.loop), bg: 'velvet', tr: 'slam', pic: {name: 'icone', w: 560, zoom: 0.08}},
    // --- boucle : dernière image = première ---
    {t0: dur - 0.9, bg: 'marble', tr: 'blur', still: true, pic: {name: 'icone_plein', w: 1080, full: true, zoom: 0}},
  ];
};
