// 30 — La question piège. Style déluge / test de culture (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {MOISE} from '../gravure/anim/Moise';
import {shotsOf} from './Moise.shots';

export const Moise = makeReel('30-illusion-moise', shotsOf, undefined, {accent: 'bleu', display: 'cinzel', label: 'montserrat', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°3 · QUESTION PIÈGE'}, MOISE);
