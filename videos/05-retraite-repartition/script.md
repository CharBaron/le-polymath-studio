---
title: La retraite par répartition
voice: gemini-lite:Puck
rate: 1.0
tail: 1.4
---
# hook
>> titre
> titre: ta cotisation *retraite*
> sous: de ce mois-ci…
> dessin: doc:FICHE DE PAIE
> question: oui
> quand: deja
Ta cotisation retraite de ce mois-ci ? {@deja} Elle est déjà dépensée.
# principe
>> liste
> titre: la *répartition*
> items: tu cotises | l’argent part aussitôt | il paie les retraités | demain : les jeunes pour toi
> icones: billet | éclair | maison | chrono
> quand: cotises, part, paie, demain
> transition: page
{@normal} Et c'est normal : c'est le principe de la *répartition*. {@cotises} Tu cotises, {@part} l'argent part aussitôt, {@paie} et il paie les pensions des retraités d'aujourd'hui. {@demain} Demain, ce sont les jeunes qui paieront la tienne.
# montant
>> chiffre
> titre: ce que ça représente
> valeur: 422
> suffixe: Md€
> unite: de pensions en 2025
> note: ≈ 14 % de ce que produit la France
> quand: total
> source: COR, rapport annuel juin 2026
{@total} En [2025|deux mille vingt-cinq], ça représente [422 milliards €|quatre cent vingt-deux milliards d'euros]. {@pib} Environ [14 %|quatorze pour cent] de tout ce que la France produit.
# hic
>> barres
> titre: 20-64 ans pour *un* senior
> valeurs: 3,6 | 2,5 | 1,6
> labels: 2009 | 2025 | ≈ 2070
> quand: r2009, r2025, r2070
> source: COR, rapport annuel juin 2026 (20-64 ans / 65 ans et +)
> transition: page
{@vieillit} Le hic : la population *vieillit*. {@r2009} En [2009|deux mille neuf], il y avait [3,6|trois virgule six] personnes en âge de travailler pour une de plus de soixante-cinq ans. {@r2025} Aujourd'hui : [2,5|deux virgule cinq]. {@r2070} Vers [2070|deux mille soixante-dix] : environ [1,6|un virgule six].
# twist
>> stickers
> titre: alors… *foutu* ?
> items: ≈ 1 jeune sur 2 pense ne rien toucher | le COR : dépenses stables jusqu’en 2045
> quand: jeunes, cor
> source: COR, rapport annuel juin 2026 (enquête Pat€r 2020)
{@jeunes} Résultat : près d'un jeune sur deux pense toucher une retraite nulle ou presque. {@cor} Pourtant, selon le *COR*, les dépenses resteraient quasi stables jusqu'en [2045|deux mille quarante-cinq].
# chute
>> teaser
> titre: le vrai *débat*
> suite: pourquoi se loger coûte si cher
> dessin: maison
> question: oui
> quand: leviers, next
{@leviers} Le vrai débat, c'est comment équilibrer : travailler plus longtemps, cotiser plus, ou toucher un peu moins. {@next} Et prochaine vidéo : pourquoi se loger coûte si cher ?
