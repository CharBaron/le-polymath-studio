// 37 — Lis à voix haute. Style école / test (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {LECTURE} from '../gravure/anim/Lecture';
import {shotsOf} from './Lecture.shots';

export const Lecture = makeReel('37-lecture-piege', shotsOf, undefined, {accent: 'bleu', display: 'playfair', label: 'montserrat', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°9 · TA LECTURE'}, LECTURE);
