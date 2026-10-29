# Cue sheet — vidéo 12 « La loi de Gresham » (DA Gravure). Tonalité : sol mineur.
# Même grammaire que la 11 : nappe grave, une note de piano par plan, son propre à chaque transition, rouleau des chiffres
# (cliquetis puis coup sourd), pièce qui tinte, tampons. Un seul riser + impact : « Cela s'appelle la loi de Gresham ».
# NO_MUSIC=1 : pas de nappe ni de piano (version où la musique est ajoutée dans TikTok).
import json, os
from sfx.synth import drone, piano, boom, coin, thud, whoosh, click, chime, riser, impact, scratch, blip

HERE = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.environ.get('NO_MUSIC') != '1'
N = {'G3': 196.0, 'Bb3': 233.08, 'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'Bb4': 466.16,
     'Eb3': 155.56, 'F3': 174.61, 'D5': 587.33, 'G5': 783.99, 'Bb5': 932.33}
ARP = {'Gm': ['G3', 'Bb3', 'D4', 'G4'], 'Eb': ['Eb3', 'G3', 'Bb3', 'Eb4'], 'Cm': ['C4', 'Eb4', 'G4', 'C4'], 'D': ['D4', 'F4', 'A4', 'D5'], 'Bb': ['Bb3', 'D4', 'F4', 'Bb4']}
# plans : (balise | ('mot', mot, balise après laquelle le chercher, décalage), transition) — même ordre que src/videos/Gresham.tsx
SHOTS = [(('mot', 'disparaissent', 'hook0', 0), 'glitch'), ('vol', 'flashRed'), (('mot', '1964', 'avant', -0.15), 'flash'), ('p90', 'flashRed'),
         ('loi', 'zoom'), ('meme', 'blur'), ('calcul', 'blur'), ('depense', 'whip'), ('garde', 'zoom'), ('tiroirs', 'glitch'), ('nom', 'blur'),
         ('chasse', 'zoom'), ('thomas', 'blur'), (('mot', "d'Élisabeth", 'thomas', 0), 'whip'), ('an1558', 'flash'), ('copernic', 'glitch'),
         ('an2400', 'flash'), (('mot', 'aristophane', 'an2400', 0), 'zoom'), ('quote', 'flashRed'), ('sauf', 'glitch'), ('inverse', 'blur'),
         ('zimb', 'flash'), ('usd', 'zoom'), ('thiers', 'blur'), ('toi', 'glitch'), ('vieille', 'flashRed'), ('loop', 'zoom')]
# chiffres : (plan, nombre de chiffres)
NUMS = [(('mot', '1964', 'avant', -0.15), 4), ('p90', 2), ('an1558', 4), ('an2400', 4), ('zimb', 4), ('vieille', 4)]


def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    words = json.load(open(os.path.join(HERE, '..', '..', 'public', 'v', os.path.basename(HERE), 'captions.json')))
    norm = lambda s: ''.join(c for c in s.lower().replace('é', 'e').replace('É', 'e').replace('è', 'e') if c.isalnum())
    word_at = lambda w, after: next((x['startMs'] / 1000 for x in words if x['startMs'] / 1000 >= after - 0.05 and norm(x['text']) == norm(w)), after)
    T = lambda k: (word_at(k[1], b[k[2]]) + k[3]) if isinstance(k, tuple) else b[k]  # instant d'une balise ou d'un mot

    harm = [(0, 'Gm'), (b['avant'], 'Eb'), (b['tiroir'], 'Cm'), (b['nom'], 'Gm'), (b['gresham'], 'Bb'), (b['aristophane'], 'Eb'),
            (b['sauf'], 'D'), (b['fin'], 'Cm'), (b['loop'], 'Gm')]
    root = {'Gm': 98.0, 'Eb': 77.78, 'Cm': 65.41, 'Bb': 58.27, 'D': 73.42}
    if MUSIC:
        l, r = drone(dur, [(t, root[c]) for t, c in harm], lambda t: 0.85 + 0.15 * min(1, max(0, (t - b['sauf']) / 2)))
        mix.put_stereo(0, l, r, 0.075)
        mix.put(0, piano(N['G3'], 2.4), 0.06)

    for i, (k, tr) in enumerate(SHOTS):
        t = T(k) - 0.05
        chord = [h for h in harm if h[0] <= t + 0.06][-1][1]
        if MUSIC: mix.put(t, piano(N[ARP[chord][i % 4]], 2.0), 0.05, pan=-0.35 if i % 2 else 0.35)
        if tr == 'whip': mix.put(t - 0.12, whoosh(0.32, 3200, 420, peak=0.4), 0.13, pan=0.3)
        elif tr == 'zoom': mix.put(t - 0.25, whoosh(0.45, 300, 2600, peak=0.85), 0.09)
        elif tr == 'flash': mix.put(t, blip(N['D5'] * 2, 0.4, 0.15), 0.035)
        elif tr == 'flashRed': mix.put(t, boom(0.9, 70), 0.09); mix.put(t - 0.15, whoosh(0.3, 500, 2600, peak=0.7), 0.07)
        elif tr == 'glitch':
            for g in range(6): mix.put(t + g * 0.028, click(180 + (g * 977) % 3300, 0.03), 0.06, pan=-0.5 + 0.2 * g)
        else: mix.put(t - 0.15, whoosh(0.35, 600, 2400, peak=0.6), 0.06)

    for k, nd in NUMS:
        t0 = T(k) - 0.01
        land = t0 + 0.32 + (nd - 1) * 0.11
        tt, j = t0 + 0.04, 0
        while tt < land - 0.02:
            mix.put(tt, click(2400 + (j * 263) % 900, 0.02), 0.045, pan=-0.2 + 0.4 * (j % 2)); tt += 0.045; j += 1
        mix.put(land, boom(1.4, 49), 0.15)

    # pièces : lancer d'ouverture, « même valeur, même dessin », boucle finale
    for s0, s1 in [(0.12, 0.72), (b['meme'], b['meme'] + 1.1), (b['loop'], dur - 0.32)]:
        mix.put(s0, coin(0.9, 2500), 0.1)
        tt, step = s0 + 0.05, 0.03
        while tt < s1 - 0.05:
            mix.put(tt, click(3400, 0.012), 0.025, pan=0.15); tt += step; step *= 1.09
        mix.put(s1, coin(1.2, 2280), 0.13)

    # tampons : « Volées ? », « Sans argent », « Sans valeur »
    for t in (word_at('volées', b['vol']), word_at('argent', b['loi']), b['inverse'] + 0.1):
        mix.put(t, thud(), 0.26)

    # le nom : seul riser + impact ; mot-concept tapé ; citation
    mix.put(b['nom'] - 1.25, riser(1.2, 240, 3800), 0.09)
    mix.put(b['nom'] - 0.03, impact(1.4), 0.2)
    mix.put(b['chasse'] - 0.03, boom(1.8, 44), 0.12)
    for g in range(25):
        mix.put(b['chasse'] + 0.05 + g * 0.045, click(2600, 0.015), 0.03)
    mix.put(b['quote'] - 0.03, boom(1.6, 46), 0.1)

    # or : couronnes, laurier, rayons, crochets, faisceau
    gold = [N['D5'], N['G5'], N['Bb5']]
    for t, g in ((b['garde'] + 0.2, 0.07), (b['usd'] + 0.2, 0.08), (T(('mot', 'aristophane', 'an2400', 0)) + 0.2, 0.07), (b['meme'] + 0.2, 0.05)):
        mix.put(t, chime(gold, 1.8, 0.7), g, pan=0.2)
    for t in (b['garde'] + 0.1, b['usd'] + 0.15):
        mix.put(t, scratch(0.6), 0.05)
    for t in (T(('mot', 'disparaissent', 'hook0', 0)) + 0.55, b['tiroirs'] + 0.45, b['thomas'] + 0.45):
        mix.put(t, click(2100, 0.04), 0.09)
    mix.put(b['copernic'], whoosh(1.0, 700, 3000, peak=0.5), 0.045, pan=-0.3)
