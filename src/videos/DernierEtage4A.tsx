import {makeEpisode} from '../survie/Episode';
import {FinFond} from '../survie/scenesC';
import {Voisin} from '../survie/scenesF';
import {Ballon, Coups, Facade, Grille, LucasFil, Panier} from '../survie/scenesG';
import {FirstCap} from '../survie/terminus';
import {Countdown, Inventory} from '../survie/ui';
import {prog} from '../theme';

const hm = (h: number, m: number) => h * 60 + m;

// 39 — « Dernier étage », jour 4, branche A du jour 3 (« tu lui réponds »). L'œil sous la grille dès l'image 0, rappel en 3 s,
// le prix annoncé avant 10 s. Le test des coups (eux répètent, lui compte : c'est un homme), le marché par la corde (10 L contre
// 4 conserves… et une balle), le ballon qui se vide par la colonne, règle 9. À minuit, la radio de Lina à la grille : Lucas.
export const DernierEtage4A = makeEpisode((B) => {
  const endT = B.fin + 0.35;
  const CLOCK: [number, number, boolean?][] = [[0, hm(7, 10)], [B.test, hm(7, 30)], [B.corde - 0.3, hm(9, 50), true], [B.corde, hm(10, 0)], [B.glou - 0.3, hm(14, 50), true], [B.glou, hm(15, 0)], [B.vanne, hm(15, 8)], [B.nuit - 0.3, hm(23, 50), true], [B.nuit, hm(23, 57)], [B.choix, hm(23, 59)]];
  const radioTalk: [number, number][] = [[B.radio, B.ami - 0.1]];
  return {
    scenes: [
      {t0: 0, render: (p) => <Grille {...p} t0={0} mode="eye" />},
      {t0: B.dil - 0.05, tr: 'black', render: (p) => <Voisin {...p} t0={B.dil} talk={[999, 999]} doubt={999} />},
      {t0: B.test - 0.05, tr: 'fade', render: (p) => <Coups {...p} t0={B.test} mine={[B.un + 0.12, B.trois, B.trois + 0.2, B.trois + 0.4]} his={[B.deux - 0.3, B.deux - 0.08, B.quatre, B.quatre + 0.18, B.quatre + 0.36, B.quatre + 0.54]} rep={B.rep} compte={B.compte} homme={B.homme} />},
      {
        t0: B.corde - 0.05, tr: 'black', render: (p) => (
          <Facade {...p} t0={B.corde} mode="trade" down={B.descend} up={B.monte} cam={[[B.corde, 540, 520, 1.25], [B.descend, 540, 560, 1.0], [B.descend + 1.6, 540, 760, 1.05], [B.monte, 540, 760, 1.05], [B.monte + 1.5, 540, 540, 1.2]]} />
        ),
      },
      {t0: B.balle - 0.15, tr: 'cut', render: (p) => <Panier {...p} t0={B.balle - 0.15} bullet={B.balle} />},
      {
        t0: B.glou - 0.05, tr: 'black', render: (p) => (
          <Ballon {...p} t0={B.glou} drop={B.baisse} down={B.dessous} valve={B.vanne} lost={B.perdu} marks={['166', '136']}
            cam={[[B.glou, 560, 600, 1.0], [B.dessous - 0.2, 560, 620, 0.95], [B.dessous + 0.6, 560, 1900, 1.0], [B.vide + 1.2, 560, 1900, 1.0], [B.vanne - 0.8, 480, 820, 1.1]]} />
        ),
      },
      {t0: B.nuit - 0.05, tr: 'black', render: (p) => <Grille {...p} t0={B.nuit} mode="radio" press={B.colle} sticker={B.nom} radioTalk={radioTalk} />},
      {t0: B.ami - 0.05, tr: 'cut', render: (p) => <LucasFil {...p} t0={B.ami - 0.05} />},
      {t0: B.prix - 0.05, tr: 'cut', render: (p) => <Grille {...p} t0={B.nuit} mode="radio" press={B.colle} sticker={B.nom} talk={[[B.prix - 0.1, B.colle - 0.1]]} dark={0.45 * prog(p.T, B.choix, B.choix + 0.6)} />},
      {t0: endT, tr: 'black', render: (p) => <FinFond {...p} hero />},
    ],
    hud: {day: 'JOUR 4', floor: 'ÉTAGE 12 · APPART 1204', t0: 0.3, t1: endT - 0.25, clock: CLOCK},
    series: {name: 'DERNIER ÉTAGE', day: 'JOUR 4', y: 560, t0: 0.4, t1: B.dil - 0.2},
    rules: [{n: 9, title: 'FERME TA VANNE', sub: 'IL SAIT CE QUE TU AS.', subAt: B.perdu, tag: B.r9, at: B.r9t, end: B.nuit - 0.15}],
    choice: {q: 'ALORS… TU PAIES ?', a: 'A · JE PAIE 20 LITRES', b: 'B · JE REFUSE', tq: B.q, ta: B.a, tb: B.b, tc: B.b + 0.35, t1: endT - 0.45},
    end: {name: 'DERNIER ÉTAGE', day: 4, time0: '23:59', time1: '00:00', cta: 'ABONNE-TOI POUR LE JOUR 5', t0: endT, flip: B.flip},
    hideCaps: [[endT, 999]],
    dialog: [
      {t0: B.ferrand - 0.05, t1: B.glou - 0.1, label: '« FERRAND » · 11E ÉTAGE'},
      {t0: B.lucas - 0.05, t1: B.ami - 0.1, label: '« LUCAS » · PAR LA RADIO'},
      {t0: B.prix - 0.05, t1: B.colle - 0.1, label: '« FERRAND » · 11E ÉTAGE'},
    ],
    extra: (
      <>
        <FirstCap text="HIER…" until={B.h} />
        <Inventory t0={0.5} t1={endT - 0.25} eau={[[0, 176], [B.descend, 176], [B.descend + 1.2, 166], [B.baisse, 166], [B.vanne + 0.3, 136]]} vivres={[[0, '½ RATION'], [B.monte + 1.0, '+4 BOÎTES']]} batt={[[0, 10], [B.nuit, 10], [B.nuit + 0.6, 9]]} />
        <Countdown label="HÉLICO J-8" t0={0.6} t1={B.q - 0.35} />
      </>
    ),
  };
});
