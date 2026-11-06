// 44 — TEST N°11 : quel âge a cette femme ? Style boudoir (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {HILL} from '../gravure/anim/Hill';
import {shotsOf} from './DoubleLecture.shots';

export const DoubleLecture = makeReel('44-double-lecture', shotsOf, undefined, {accent: 'pourpre', display: 'playfair', label: 'plex', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°11 · TON CERVEAU'}, HILL);
