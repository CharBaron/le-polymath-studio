import {makeEpisode} from '../survie/Episode';
import {FinFond} from '../survie/scenesC';
import {Voisin} from '../survie/scenesF';
import {Ballon, Biche, Facade, LucasFil, SousPorte} from '../survie/scenesG';
import {FirstCap} from '../survie/terminus';
import {Countdown, Inventory} from '../survie/ui';

const hm = (h: number, m: number) => h * 60 + m;

// 40 — « Dernier étage », jour 4, branche B du jour 3 (« tu te tais »). Le pied-de-biche dans ta porte dès l'image 0 (cette
// nuit), rappel en 3 s, le dilemme annoncé avant 10 s. Ferrand appelle, puis te croit mort ; il ouvre ses robinets et ton ballon
// se vide par la colonne, règle 9. À minuit, il force ta porte : dans sa poche, la radio de Lina, et Lucas qui appelle dessus.
export const DernierEtage4B = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const CLOCK: [number, number, boolean?][] = [[0, hm(7, 0)], [B.jour, hm(8, 0)], [B.mort - 0.3, hm(11, 40), true], [B.mort, hm(11, 52)], [B.glou - 0.3, hm(14, 50), true], [B.glou, hm(15, 0)], [B.vanne, hm(15, 8)], [B.nuit - 0.3, hm(23, 50), true], [B.nuit, hm(23, 58)], [B.choix, hm(24, 1)]];
  const radioTalk: [number, number][] = [[B.radio, B.ami - 0.1]];
  const pries = [0.5, 1.7, 2.9, 4.0, B.biche + 0.1, B.biche + 0.9, B.craque, B.craque + 1.3, B.radio + 1.6, B.choix + 0.3, B.choix + 1.4, B.q + 0.9, B.a + 0.8, B.b + 0.9];
  return {
    scenes: [
      {t0: 0, render: (p) => <Biche {...p} pries={pries} crack={2.3} radioTalk={[[0.6, 2.2]]} tag={[0.3, B.dil - 0.1]} />},
      {t0: B.dil - 0.05, tr: 'black', render: (p) => <Facade {...p} t0={B.dil} mode="dusk" cam={[[B.dil, 540, 640, 0.8], [B.jour, 540, 780, 1.0]]} />},
      {t0: B.jour - 0.05, tr: 'fade', render: (p) => <Voisin {...p} t0={B.jour} talk={[B.ferr - 0.2, B.rien - 0.1]} doubt={999} />},
      {t0: B.mort - 0.05, tr: 'cut', render: (p) => <Voisin {...p} t0={B.jour} talk={[B.mort - 0.1, B.glou - 0.1]} doubt={999} />},
      {
        t0: B.glou - 0.05, tr: 'black', render: (p) => (
          <Ballon {...p} t0={B.glou} drop={B.baisse} down={B.dessous} valve={B.vanne} lost={B.perdu} marks={['176', '146']}
            cam={[[B.glou, 560, 600, 1.0], [B.dessous - 0.2, 560, 620, 0.95], [B.dessous + 0.6, 560, 1900, 1.0], [B.vide + 1.2, 560, 1900, 1.0], [B.vanne - 0.8, 480, 820, 1.1]]} />
        ),
      },
      {t0: B.nuit - 0.05, tr: 'black', render: (p) => <Biche {...p} pries={pries} crack={B.craque} radioTalk={radioTalk} />},
      {t0: B.ami - 0.05, tr: 'cut', render: (p) => <LucasFil {...p} t0={B.ami - 0.05} />},
      {t0: B.fente - 0.05, tr: 'fade', render: (p) => <SousPorte {...p} t0={B.fente} sticker={B.nom} />},
      {t0: B.choix - 0.05, tr: 'black', render: (p) => <Biche {...p} pries={pries} crack={B.craque} dark={0.45} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {day: 'JOUR 4', floor: 'ÉTAGE 12 · APPART 1204', t0: 0.3, t1: endT - 0.25, clock: CLOCK},
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 4', y: 560, t0: 0.4, t1: B.dil - 0.2},
    rules: [{n: 9, title: 'FERME TA VANNE', sub: 'IL TE CROIT MORT.', subAt: B.perdu, tag: B.r9, at: B.r9t, end: B.nuit - 0.15}],
    choice: {q: 'ALORS… TU TE MONTRES ?', a: 'A · JE LUI PARLE', b: 'B · JE L’ATTENDS DANS LE NOIR', tq: B.q, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'DERNIER ÉTAGE', day: 4, time0: '00:01', time1: '00:02', cta: 'ABONNE-TOI POUR LE JOUR 5', t0: endT, flip: B.flip},
    hideCaps: [[endT, 999]],
    dialog: [
      {t0: B.ferr - 0.05, t1: B.rien - 0.1, label: '« FERRAND » · 11E ÉTAGE'},
      {t0: B.mort - 0.05, t1: B.glou - 0.1, label: '« FERRAND » · 11E ÉTAGE'},
      {t0: B.lucas - 0.05, t1: B.ami - 0.1, label: '« LUCAS » · RADIO, SUR LE PALIER'},
    ],
    extra: (
      <>
        <FirstCap text="HIER…" until={B.h} />
        <Inventory t0={0.5} t1={endT - 0.25} eau={[[0, 176], [B.baisse, 176], [B.vanne + 0.3, 146]]} vivres={[[0, '½ RATION']]} batt={[[0, 10], [B.nuit, 10], [B.nuit + 0.6, 9]]} />
        <Countdown label="HÉLICO J-8" t0={0.6} t1={B.q - 0.35} />
      </>
    ),
  };
});
