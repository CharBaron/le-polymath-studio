# Storyboard — vidéo 10 « La Bourse »

Durée estimée : environ 2 min 18 (calibrée sur la vidéo 09). Voix : Gemini Puck. DA : Carnet.

Fil rouge : chaque séquence a son propre moteur codé, et les animations de données sont tracées à partir des vrais chiffres (`data.json`), pas dessinées à la main. Un ruban de cotations (années et rendements réels) défile en haut de l'écran pendant toute la vidéo, et Pierrot regarde toujours le contenu.

| # | Séquence | Moteur / animation |
|---|---|---|
| 1 | Hook — Amsterdam 1602 | Un navire de la VOC tangue sur une mer de papier (vagues procédurales). Au mot « découper », la coque éclate en 1 143 petits certificats, le vrai nombre de souscripteurs : c'est un système de particules qui les fait voler vers une foule de bonshommes. L'étiquette « Neeltgen, servante : 100 florins » apparaît, et Pierrot attrape un certificat. |
| 2 | Action | Le certificat se déplie en grand. Deux tuyaux en sortent : côté dividende, un sac d'épices (macis) se déverse en grains ; côté plus-value, une étiquette de prix monte. |
| 3 | Carnet d'ordres | **Vrai moteur d'appariement**, avec priorité au prix puis au temps, simulé image par image. Les ordres arrivent en jetons, les colonnes acheteurs (vert) et vendeurs (rouge) se remplissent, et la fourchette clignote entre les deux. Chaque échange déclenche un flash et imprime un point sur la courbe du cours, qui se dessine donc en direct à partir de la simulation. |
| 4 | Krach 1987 | Même carnet : de petits robots « vente auto » martèlent le bouton SELL, le côté acheteur se vide et le cours dévale l'échelle. Un sismographe s'emballe, puis le tampon « −22,6 % » tombe. Retournement final : « année 1987 : +5,8 % ». |
| 5 | Grand huit | Pierrot monte dans un wagonnet qui roule sur **la vraie courbe 1928–2025** (échelle logarithmique), avec une physique simple : il ralentit en montée et accélère dans les krachs. La caméra est embarquée, un compteur passe de 100 $ à 1 157 599 $, et des panneaux 1929 / choc pétrolier / bulle internet / subprimes tombent pile sur la voix. |
| 6 | Planche de Galton | 98 billes, une par année, chacune portant son année. Elles rebondissent entre les clous et tombent dans la case de leur vrai rendement (par tranches de 10 %), si bien que l'histogramme se construit tout seul. Les années en baisse sont en rouge, puis zoom sur 1931 (−44 %) et 1954 (+53 %). |
| 7 | La durée | Les 79 vraies périodes de 20 ans depuis 1928 se superposent en « spaghettis », et toutes finissent au-dessus de leur point de départ. Un entonnoir se resserre ensuite : 1 an (−44 % à +53 %), 10 ans, 20 ans (+2,4 % à +17,7 % par an). |
| 8 | Pari de Buffett | Course année par année avec les chiffres exacts de sa lettre. En 2008, les 5 paniers mènent parce qu'ils perdent moins, puis l'indice les dépasse chaque année. Podium final : +126 % contre +88 %. |
| 9 | France / frais | Une grille de 100 petits fonds : 98 s'éteignent, 2 restent dorés. Puis des « frais » en forme de Pac-Man grignotent une pile de pièces. |
| 10 | Teaser | Une tulipe pousse, et son bulbe gonfle comme une bulle face à une maison posée sur une balance. Elle éclate, et le sticker « la suite : les bulles → » apparaît. |

Nouveautés techniques : système de particules, moteur d'appariement d'ordres, wagonnet physique sur une courbe de données réelles, planche de Galton déterministe (rebonds calculés pour que chaque bille finisse dans sa vraie case), ruban de cotations, et une pose « assis » pour le rig.
