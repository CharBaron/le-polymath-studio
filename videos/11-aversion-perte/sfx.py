# Cue sheet — vidéo 11 « L'aversion à la perte » (DA Gravure). Tonalité : ré mineur.
# Nappe grave continue (comme la référence), une note de piano feutré à chaque plan, rouleau des chiffres = cliquetis
# de machine à sous puis coup sourd, pièce = tintement métallique, tampons = choc. Un seul riser + impact : « Cela s'appelle l'aversion à la perte ».
import json, os
from sfx.synth import drone, piano, boom, coin, thud, whoosh, click, chime, riser, impact, scratch, blip

HERE = os.path.dirname(os.path.abspath(__file__))
N = {'G3': 196.0, 'Bb3': 233.08, 'C4': 261.63, 'D4': 293.66, 'F3': 174.61, 'A3': 220.0, 'F4': 349.23, 'G4': 392.0,
     'A4': 440.0, 'Bb4': 466.16, 'D5': 587.33, 'F5': 698.46, 'A5': 880.0}
ARP = {'Dm': ['D4', 'F4', 'A4', 'D5'], 'Bb': ['Bb3', 'D4', 'F4', 'Bb4'], 'Gm': ['G3', 'Bb3', 'D4', 'G4'], 'F': ['F3', 'A3', 'C4', 'F4']}
# plans (balise, transition) — même ordre que src/videos/Aversion.tsx (version 60 s)
SHOTS = [('p150', 'flash'), ('face', 'glitch'), ('m100', 'flashRed'), ('refus', 'zoom'), ('tous', 'blur'), ('moyenne', 'blur'), ('p25', 'flash'),
         ('kt', 'glitch'), ('risquer', 'flash'), ('deuxcents', 'flashRed'), ('double', 'zoom'), ('nom', 'blur'), ('mal', 'zoom'),
         ('plaisir', 'whip'), ('nobel', 'flash'), ('cornell', 'glitch'), ('mug', 'zoom'), ('vendre', 'blur'), ('p525', 'flash'), ('acheter', 'whip'),
         ('p225', 'flashRed'), ('onze', 'glitch'), ('deux', 'flashRed'), ('dotation', 'blur'), ('precieux', 'zoom'), ('parce', 'blur'),
         ('bourse', 'glitch'), ('gagnantes', 'flash'), ('perdantes', 'whip'), ('coule', 'zoom'), ('siecles', 'flash'), ('epictete', 'zoom'),
         ('quote', 'flashRed'), ('peur', 'zoom'), ('loop', 'zoom')]
# chiffres : (balise, nombre de chiffres) — le dernier chiffre se pose à t0 + 0,32 + (n-1)·0,11 (Num dans Gravure.tsx)
NUMS = [('p150', 3), ('m100', 3), ('p25', 2), ('risquer', 3), ('deuxcents', 3), ('double', 1), ('nobel', 4), ('p525', 3), ('p225', 3),
        ('onze', 2), ('deux', 1), ('gagnantes', 2), ('siecles', 2)]
# NO_MUSIC=1 : pas de nappe ni de piano (version où la musique est ajoutée dans TikTok)
MUSIC = os.environ.get('NO_MUSIC') != '1'


def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    words = json.load(open(os.path.join(HERE, '..', '..', 'public', 'v', os.path.basename(HERE), 'captions.json')))
    norm = lambda s: ''.join(c for c in s.lower() if c.isalnum())
    word_at = lambda w, after: next((x['startMs'] / 1000 for x in words if x['startMs'] / 1000 >= after - 0.05 and norm(x['text']) == norm(w)), after)
    word_end = lambda w, after: next((x['endMs'] / 1000 for x in words if x['startMs'] / 1000 >= after - 0.05 and norm(x['text']) == norm(w)), after)

    # --- nappe : ré → si♭ → sol → ré → si♭ → fa → sol → ré → si♭ → ré (la boucle retombe sur ré) ---
    roots = [(0, 73.42), (b['calcul'], 58.27), (b['mesure'], 98.0), (b['nom'], 73.42), (b['mugs'], 58.27), (b['dotation'], 87.31),
             (b['bourse'], 98.0), (b['epictete'], 73.42), (b['fin'], 58.27), (b['loop'], 73.42)]
    harm = [(0, 'Dm'), (b['calcul'], 'Bb'), (b['mesure'], 'Gm'), (b['nom'], 'Dm'), (b['mugs'], 'Bb'), (b['dotation'], 'F'),
            (b['bourse'], 'Gm'), (b['epictete'], 'Dm'), (b['fin'], 'Bb'), (b['loop'], 'Dm')]
    vol = lambda t: 0.85 + 0.15 * min(1, max(0, (t - b['peur']) / 2)) if t < b['loop'] else 0.85
    if MUSIC:
        l, r = drone(dur, roots, vol)
        mix.put_stereo(0, l, r, 0.075)

    # --- une note de piano à chaque plan (arpège montant dans l'accord du moment) ---
    for i, (bn, tr) in enumerate(SHOTS):
        t = b[bn] - 0.05
        chord = [h for h in harm if h[0] <= t + 0.06][-1][1]
        note = N[ARP[chord][i % 4]]
        if MUSIC: mix.put(t, piano(note, 2.0), 0.05, pan=-0.35 if i % 2 else 0.35)
        if tr == 'whip': mix.put(t - 0.12, whoosh(0.32, 3200, 420, peak=0.4), 0.13, pan=0.3)
        elif tr == 'zoom': mix.put(t - 0.25, whoosh(0.45, 300, 2600, peak=0.85), 0.09)
        elif tr == 'flash': mix.put(t, blip(N['D5'] * 2, 0.4, 0.15), 0.035)
        elif tr == 'flashRed': mix.put(t, boom(0.9, 70), 0.09); mix.put(t - 0.15, whoosh(0.3, 500, 2600, peak=0.7), 0.07)
        elif tr == 'glitch':  # rafale de clics carrés désaccordés
            for g in range(6): mix.put(t + g * 0.028, click(180 + (g * 977) % 3300, 0.03), 0.06, pan=-0.5 + 0.2 * g)
        else: mix.put(t - 0.15, whoosh(0.35, 600, 2400, peak=0.6), 0.06)
    if MUSIC: mix.put(0, piano(N['D4'], 2.4), 0.06)

    # --- chiffres : cliquetis du rouleau puis coup sourd à l'arrêt ---
    for bn, nd in NUMS:
        t0 = b[bn] - 0.01
        land = t0 + 0.32 + (nd - 1) * 0.11
        k = 0
        tt = t0 + 0.04
        while tt < land - 0.02:
            mix.put(tt, click(2400 + (k * 263) % 900, 0.02), 0.045, pan=-0.2 + 0.4 * (k % 2)); tt += 0.045; k += 1
        mix.put(land, boom(1.4, 52 if bn not in ('nobel', 'deux') else 46), 0.15)

    # --- pièce : lancer, tournoiement, atterrissage ---
    for s0, s1 in [(0.12, 0.72), (b['face'], b['face'] + 0.6), (b['loop'], dur - 0.32)]:
        mix.put(s0, coin(0.9, 2500), 0.1)
        tt, step = s0 + 0.05, 0.03
        while tt < s1 - 0.05:
            mix.put(tt, click(3400, 0.012), 0.025, pan=0.15); tt += step; step *= 1.09
        mix.put(s1, coin(1.2, 2280), 0.13)

    # --- tampons ---
    for t in (b['refus'] + 0.12, word_at('vendre', b['vendre']), word_at('toi', b['parce'] + 0.5)):
        mix.put(t, thud(), 0.26)

    # --- le nom : seul riser + impact de la vidéo ---
    mix.put(b['nom'] - 1.25, riser(1.2, 240, 3800), 0.09)
    mix.put(b['nom'] - 0.03, impact(1.4), 0.2)
    mix.put(b['dotation'] - 0.03, boom(1.8, 44), 0.13)
    for g in range(16):  # mot-concept tapé lettre par lettre
        mix.put(b['dotation'] + 0.05 + g * 0.045, click(2600, 0.015), 0.03)
    mix.put(b['quote'] - 0.03, boom(1.6, 46), 0.1)

    # --- or : rayons, laurier, couronne, crochets, faisceau ---
    gold = [N['D5'], N['F5'], N['A5']]
    for bn, g in (('double', 0.05), ('nobel', 0.1), ('precieux', 0.06), ('epictete', 0.07)):
        mix.put(b[bn] + 0.2, chime(gold, 1.8, 0.7), g, pan=0.2)
    mix.put(b['precieux'] + 0.1, scratch(0.6), 0.05)
    for bn, at in (('tous', 0.5), ('mug', 0.9)):
        mix.put(b[bn] - 0.05 + at, click(2100, 0.04), 0.09)
    for bn in ('kt', 'cornell', 'bourse'):
        mix.put(b[bn], whoosh(1.0, 700, 3000, peak=0.5), 0.045, pan=-0.3)
    for bn in ('mal', 'peur'):
        mix.put(b[bn], boom(1.8, 41), 0.12)
