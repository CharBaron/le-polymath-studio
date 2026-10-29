# Cue sheet — vidéo 10 « La Bourse ». Tonalité : ré mineur (Amsterdam) → fa (carnet) → si♭ / ré m (krach)
# → sol (grand huit) → ré (billes, durée) → fa (pari) → si♭ (teaser).
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click, riser, impact, key

N = {'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'Bb3': 233.08, 'C4': 261.63, 'D4': 293.66,
     'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'Bb4': 466.16, 'D5': 587.33}
ch = lambda *n: [N[x] for x in n]


def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    chords = [(0, ch('D3', 'F3', 'A3')), (b['actions'], ch('F3', 'A3', 'C4')), (b['qui'], ch('F3', 'A3', 'C4')),
              (b['vide'], ch('Bb3', 'D4', 'F4')), (b['k1987'], ch('D3', 'F3', 'A3')), (b['monte'], ch('G3', 'Bb3', 'D4')),
              (b['billes'], ch('D3', 'F3', 'A3')), (b['duree'], ch('F3', 'A3', 'C4')), (b['pros'], ch('Bb3', 'D4', 'F4')),
              (b['france'], ch('G3', 'Bb3', 'D4')), (b['foule'], ch('Bb3', 'D4', 'F4'))]
    l, r = pad(dur, chords, detune=0.8)
    mix.put_stereo(0, l, r, 0.06)
    # pulsation : plus serrée pendant le krach et le grand huit
    t, k = 0.0, 0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        fast = b['k1987'] <= t < b['pourtant'] or b['k1929'] <= t < b['million']
        mix.put(t, blip(root[k % 3] * 2, 0.22, 0.06), 0.03 if k % 2 else 0.045, pan=-0.3 if k % 2 else 0.3)
        t += 0.25 if fast else 0.5; k += 1

    # --- Amsterdam 1602 ---
    mix.put(b['an1602'] + 0.1, pop(500, 1300), 0.15)
    mix.put(b['decoupe'] + 0.1, scratch(0.6), 0.12)
    for i in range(46):  # 1 143 morceaux qui s'envolent : pluie de petits clics
        mix.put(b['decoupe'] + 0.9 + i * 0.05, click(1800 + (i * 137) % 900, 0.025), 0.035, pan=-0.6 + (i % 7) * 0.2)
    mix.put(b['servante'] + 0.6, pop(700, 1600), 0.18, pan=-0.4)
    # zoom dans le certificat
    mix.put(b['actions'] - 0.6, riser(1.1, 300, 3200), 0.1)
    mix.put(b['actions'] + 0.5, impact(0.6), 0.1)

    # --- l'action ---
    mix.put(b['deux'] + 0.1, pop(500, 1200), 0.14, pan=-0.3)
    mix.put(b['deux'] + 0.3, pop(700, 1500), 0.14, pan=0.3)
    mix.put(b['dividende'] + 2.0, scratch(1.4), 0.1, pan=-0.4)  # les épices se déversent
    mix.put(b['plusvalue'] + 1.6, chime(ch('F4', 'A4', 'D5'), 1.0, 0.4), 0.1, pan=0.4)
    mix.put(b['qui'] - 0.15, whoosh(0.7, 3000, 500, peak=0.35), 0.22)

    # --- carnet d'ordres ---
    for i in range(6):
        mix.put(b['carnet'] + 0.3 + i * 0.3, key(), 0.08, pan=-0.5)
    for i in range(6):
        mix.put(b['fourchette'] - 1.5 + i * 0.28, key(), 0.08, pan=0.5)
    mix.put(b['fourchette'] + 0.2, pop(400, 900), 0.12)
    mix.put(b['match'] + 0.9, chime(ch('A4', 'D5'), 0.7, 0.25), 0.16)  # premier échange
    mix.put(b['cours'] + 0.1, pop(600, 1400), 0.16)
    mix.put(b['cours'] + 0.8, chime(ch('F4', 'A4'), 0.5, 0.2), 0.08)
    mix.put(b['cours'] + 1.3, chime(ch('A4', 'C4'), 0.5, 0.2), 0.08)

    # --- krach 1987 ---
    for i in range(7):  # les acheteurs retirent leurs ordres
        mix.put(b['vide'] + 0.4 + i * 0.28, whoosh(0.2, 1500, 600, peak=0.4), 0.05, pan=-0.6)
    tt, i = b['k1987'] + 0.5, 0
    while tt < b['fuite']:  # robots : VENTE ! VENTE !
        mix.put(tt + 0.18, click(900, 0.04), 0.09, pan=0.5)
        mix.put(tt + 0.36, click(800, 0.04), 0.09, pan=0.6)
        mix.put(tt + 0.2, blip(N['D4'] * (1 - i * 0.025), 0.15, 0.05), 0.05)
        tt += 0.5; i += 1
    mix.put(b['fuite'] + 0.2, riser(1.5, 2400, 300), 0.08)
    for i in range(12):  # la chute : échanges de plus en plus bas
        mix.put(b['chute'] + 0.3 + i * 0.28, blip(N['A4'] * (0.94 ** i), 0.18, 0.06), 0.09, pan=-0.2 + (i % 3) * 0.2)
    mix.put(b['chute'] + 2.6, impact(1.0), 0.2)
    mix.put(b['pourtant'] + 3.0, chime(ch('D4', 'F4', 'A4'), 1.2, 0.5), 0.12)

    # --- zoom arrière, grand huit ---
    mix.put(b['monte'] - 0.25, whoosh(1.2, 400, 2600, peak=0.6), 0.16)
    for i in range(int((b['k1929'] - b['cent'] - 0.6) / 0.13)):  # la montée : clic-clic-clic
        mix.put(b['cent'] + 0.45 + i * 0.13, click(1100, 0.03), 0.07, pan=-0.1)
    for bk in ('k1929', 'k1973', 'k2000', 'k2008'):
        mix.put(b[bk] - 0.05, whoosh(0.9, 2400, 300, peak=0.3), 0.2)
        mix.put(b[bk] + 0.3, pop(300, 700), 0.1)
    mix.put(b['million'] + 0.6, chime(ch('G4', 'Bb4', 'D5'), 1.4, 0.6), 0.16)

    # --- planche de Galton : une bille par année ---
    mix.put(b['billes'], whoosh(1.0, 2600, 500, peak=0.4), 0.12)
    for i in range(98):
        land = b['billes'] + 0.95 + i * 0.04 + 0.35 + 10 * 0.055 + 0.3
        mix.put(land, click(1500 + (i * 211) % 1400, 0.03), 0.05, pan=-0.5 + (i % 11) * 0.1)
    mix.put(b['pire'] + 0.3, pop(300, 600), 0.14, pan=-0.5)
    mix.put(b['meilleure'] + 0.3, pop(800, 1700), 0.14, pan=0.5)
    mix.put(b['moyenne'] + 0.2, chime(ch('D4', 'F4', 'A4'), 0.9, 0.4), 0.1)

    # --- la durée ---
    mix.put(b['duree'] + 0.2, whoosh(0.9, 500, 2200, peak=0.5), 0.1)
    for bk in ('dix', 'vingt'):
        for i in range(10):
            mix.put(b[bk] + 0.1 + i * 0.07, click(1600 - i * 40, 0.03), 0.05)
    mix.put(b['vingt'] + 0.45, impact(0.7), 0.12)

    # --- le pari ---
    mix.put(b['pros'] - 0.2, whoosh(0.7, 3000, 500, peak=0.35), 0.22)
    mix.put(b['buffett'] + 0.2, scratch(0.5), 0.12)
    for i in range(10):
        mix.put(b['indice'] + 0.4 + i * 0.43, blip(N['D4'] * (1.06 ** i), 0.2, 0.08), 0.06, pan=0.3)
    mix.put(b['resultat'] + 0.3, chime(ch('F4', 'A4', 'D5'), 1.2, 0.5), 0.14)
    mix.put(b['meilleur'] + 0.2, pop(500, 1100), 0.12)
    mix.put(b['pirep'] + 0.1, pop(300, 500), 0.12)

    # --- France, frais ---
    mix.put(b['france'] - 0.2, whoosh(0.7, 3000, 500, peak=0.35), 0.22)
    for i in range(20):
        mix.put(b['france'] + 1.6 + i * 0.11, click(700 + (i * 97) % 500, 0.03), 0.05)
    for i in range(7):  # croc, croc
        mix.put(b['frais'] + 0.5 + i * 0.35, blip(180, 0.12, 0.04), 0.12)

    # --- teaser ---
    mix.put(b['foule'] - 0.2, whoosh(0.7, 3000, 500, peak=0.35), 0.22)
    mix.put(b['tulipe'] + 0.3, riser(2.0, 300, 1800), 0.06)
    mix.put(b['legende'] + 0.2, riser(b['next'] + 0.3 - b['legende'], 400, 4200), 0.08)
    mix.put(b['next'] + 0.5, pop(900, 2400, 0.12), 0.3)
    mix.put(b['next'] + 0.55, impact(0.8), 0.16)
    mix.put(b['next'] + 1.0, chime(ch('Bb3', 'D4', 'F4', 'A4'), 2.0, 0.8), 0.2)
