// 20 — Le bateau de Thésée. Style céramique grecque à figures noires (DA « Gravure » v3.1 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {THESEE} from '../gravure/anim/Thesee';
import {shotsOf} from './Thesee.shots';

export const Thesee = makeReel('20-bateau-thesee', shotsOf, undefined, {accent: 'terracotta', display: 'cinzel', label: 'cinzel', ornament: 'greek'}, THESEE);
