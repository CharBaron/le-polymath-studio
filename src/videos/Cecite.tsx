// 35 — Trouve ce qui change. Style labo / test (DA « Gravure » v3.2 : thème, polices et animations sur mesure).
import {makeReel} from '../gravure/Reel';
import {CECITE} from '../gravure/anim/Cecite';
import {shotsOf} from './Cecite.shots';

export const Cecite = makeReel('35-cecite-changement', shotsOf, undefined, {accent: 'electrique', display: 'playfair', label: 'plex', ornament: 'rule', overlay: 'hud', overlayLabel: 'TEST N°8 · TES YEUX'}, CECITE);
