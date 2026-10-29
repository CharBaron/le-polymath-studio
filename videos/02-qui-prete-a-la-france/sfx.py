# Cue sheet — vidéo 02. Tonalité : la mineur → do majeur (rebondissement) → la mineur (prix) → fa majeur (teaser).
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click, riser, impact

N = {'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.0, 'A4': 440.0, 'C5': 523.25, 'E5': 659.25}
ch = lambda *n: [N[x] for x in n]

def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    chords = [(0, ch('A3', 'C4', 'E4')), (b['dette'], ch('F3', 'A3', 'C4')), (b['oblig'], ch('C4', 'E4', 'G4')),
              (b['preteurs'], ch('G3', 'B3', 'D4')), (b['twist'], ch('C4', 'E4', 'G4')), (b['bdf'], ch('F3', 'A3', 'C4')),
              (b['interets'], ch('A3', 'C4', 'E4')), (b['chute'], ch('D4', 'F4', 'A4')), (b['baguette'], ch('F3', 'A3', 'C4'))]
    l, r = pad(dur, chords, detune=0.8)
    mix.put_stereo(0, l, r, 0.06)
    t, k = 0.0, 0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        mix.put(t, blip(root[k % 3] * 2, 0.25, 0.07), 0.035 if k % 2 else 0.05, pan=-0.3 if k % 2 else 0.3)
        t += 0.5; k += 1

    # hook : billets qui s'envolent du calendrier
    for i in range(6):
        mix.put(0.6 + i * 0.45, whoosh(0.3, 900, 2600, peak=0.4), 0.06, pan=-0.4 + i * 0.16)
    mix.put(b['qui'], pop(500, 1400), 0.25, pan=0.5)
    mix.put(b['toi'] + 0.5, impact(0.8), 0.16)
    mix.put(b['toi'] + 0.5, pop(700, 1700), 0.2, pan=0.4)
    # dette
    for i in range(14):
        mix.put(b['dette'] + 0.3 + i * 0.1, click(1400 + i * 50, 0.03), 0.06, pan=-0.3)
    mix.put(b['dette'] + 1.8, chime(ch('A4', 'C5', 'E5'), 1.2, 0.5), 0.13)
    mix.put(b['parfr'], pop(600, 1500), 0.2, pan=-0.3)
    # obligation
    mix.put(b['oblig'] + 0.2, scratch(2.0), 0.08, pan=-0.2)
    mix.put(b['pret'] + 0.2, whoosh(0.5, 600, 2200, peak=0.5), 0.15, pan=0.2)
    mix.put(b['pret'] + 1.6, whoosh(0.5, 2200, 600, peak=0.5), 0.15, pan=-0.2)
    # camembert
    for i, k2 in enumerate(['etranger', 'banques', 'assureurs']):
        mix.put(b[k2] + (0.9 if i == 0 else 0.3), scratch(0.5), 0.1)
        mix.put(b[k2] + (1.1 if i == 0 else 0.5), pop(500 + i * 200, 1300 + i * 250), 0.18, pan=-0.5 + i * 0.3)
    mix.put(b['assureurs'] + 1.5, scratch(0.4), 0.08)
    # pages qui tournent
    for k2 in ('twist', 'chute'):
        mix.put(b[k2] - 0.05, whoosh(0.7, 3000, 500, peak=0.35), 0.25)
    mix.put(b['av'] + 1.5, whoosh(0.4, 700, 2000, peak=0.5), 0.1)
    for i in range(3):
        mix.put(b['parents'] + i * 0.15, pop(800 + i * 150, 1600 + i * 200, 0.12), 0.12, pan=-0.6 + i * 0.3)
    mix.put(b['bdf'] + 0.3, impact(1.0), 0.2)
    for i in range(12):
        mix.put(b['bdf'] + 0.9 + i * 0.09, click(1300 + i * 60, 0.03), 0.06)
    # prix : tic-tac
    for i in range(10):
        mix.put(b['interets'] + 1.0 + i * 0.1, click(1500 + i * 60, 0.03), 0.06)
    tk = b['seconde']
    while tk < b['chute'] - 0.2:
        mix.put(tk, click(2400, 0.02), 0.12, pan=-0.3)
        tk += 0.5
    # chute
    for i in range(6):
        mix.put(b['ennemi'] + 1.2 + i * 0.33, scratch(0.12), 0.18, pan=0.2)
    mix.put(b['baguette'] + 0.1, pop(300, 900, 0.22), 0.22)
    mix.put(b['next'], chime(ch('F4', 'A4', 'C5'), 2.0, 0.8), 0.2)
