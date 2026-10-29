// 18 — Les rats sans queue de Hanoï (1902). Style archive coloniale (DA « Gravure » v3.1 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {HANOI} from '../gravure/anim/Hanoi';
import {shotsOf} from './Rats.shots';

export const Rats = makeReel('18-rats-hanoi', shotsOf, undefined, {accent: 'ocre', display: 'playfair', label: 'elite', ornament: 'rule'}, HANOI);
