// 43 — TEST N°10 : dis la couleur, pas le mot. Style imprimerie (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {STROOP} from '../gravure/anim/Stroop';
import {shotsOf} from './Stroop.shots';

export const Stroop = makeReel('43-effet-stroop', shotsOf, undefined, {accent: 'electrique', display: 'playfair', label: 'plex', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°10 · TON CERVEAU'}, STROOP);
