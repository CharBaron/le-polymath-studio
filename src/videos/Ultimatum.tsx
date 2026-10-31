// 33 — La proposition indécente. Style or / test d'économie (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {ULTIMATUM} from '../gravure/anim/Ultimatum';
import {shotsOf} from './Ultimatum.shots';

export const Ultimatum = makeReel('33-jeu-ultimatum', shotsOf, undefined, {accent: 'or', display: 'playfair', label: 'montserrat', ornament: 'greek', overlay: 'hud', overlayLabel: 'TEST N°6 · ARGENT'}, ULTIMATUM);
