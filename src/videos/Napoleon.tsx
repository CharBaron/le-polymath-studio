// 32 — La taille de Napoléon. Style empire / test d'histoire (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {NAPOLEON} from '../gravure/anim/Napoleon';
import {shotsOf} from './Napoleon.shots';

export const Napoleon = makeReel('32-taille-napoleon', shotsOf, undefined, {accent: 'vert', display: 'playfair', label: 'montserrat', ornament: 'greek', overlay: 'hud', overlayLabel: 'TEST N°5 · HISTOIRE'}, NAPOLEON);
