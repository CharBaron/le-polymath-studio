# Cue sheet — vidéo 01. Tonalité : ré majeur → si mineur (bascule sur l'inflation) → retour ré au teaser.
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click, riser, impact

N = {'D3': 146.83, 'E3': 164.81, 'F#3': 185.0, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94, 'C#4': 277.18, 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'A4': 440.0, 'B4': 493.88, 'D5': 587.33}
ch = lambda *n: [N[x] for x in n]

def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    chords = [(0, ch('D3', 'F#3', 'A3')), (b['facture'], ch('G3', 'B3', 'D4')), (b['twist'], ch('E3', 'G3', 'B3')),
              (b['inflation'], ch('B3', 'D4', 'F#4')), (b['prix'], ch('G3', 'B3', 'E4')), (b['histoire'], ch('B3', 'D4', 'F#4')),
              (b['zimbabwe'], ch('F#3', 'A3', 'C#4')), (b['chute'], ch('G3', 'B3', 'D4')), (b['teaser'], ch('D3', 'F#3', 'A3'))]
    l, r = pad(dur, chords, detune=0.8)
    mix.put_stereo(0, l, r, 0.06)
    # pulsation douce (pluck en croches) pour porter le rythme
    step = 0.5
    k = 0
    t = 0.0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        f = root[k % 3] * 2
        mix.put(t, blip(f, 0.25, 0.07), 0.035 if k % 2 else 0.05, pan=-0.3 if k % 2 else 0.3)
        t += step; k += 1

    # hook : pluie de billets
    for i in range(10):
        mix.put(0.05 + i * 0.32, whoosh(0.25, 1800, 700, peak=0.3), 0.05, pan=-0.8 + i * 0.17)
    mix.put(b['spoiler'] + 0.25, impact(0.9), 0.16)
    # facture
    mix.put(b['facture'], scratch(0.9), 0.1, pan=-0.3)
    for i in range(12):
        mix.put(b['total'] + i * 0.08, click(1500 + i * 60, 0.03), 0.07, pan=-0.4)
    mix.put(b['total'] + 0.2, riser(1.0, 200, 2400), 0.07)
    mix.put(b['total'] + 1.2, chime(ch('D4', 'F#4', 'A4'), 1.4, 0.5), 0.15)
    mix.put(b['pib'] + 0.2, pop(500, 1300), 0.2, pan=-0.1)
    mix.put(b['billets'] + 0.2, pop(650, 1600), 0.2, pan=-0.5)
    # pages qui tournent
    for k in ('twist', 'histoire'):
        mix.put(b[k] - 0.05, whoosh(0.7, 3000, 500, peak=0.35), 0.25)
    # BCE : croix
    mix.put(b['bce'], scratch(0.25), 0.2, pan=-0.2)
    mix.put(b['bce'] + 0.15, scratch(0.25), 0.2, pan=0.2)
    mix.put(b['bce'] + 1.6, pop(300, 700, 0.2), 0.15)
    # inflation
    mix.put(b['lundi'] + 0.4, pop(700, 1500), 0.2)
    for i in range(3):
        mix.put(b['mardi'] + 0.5 + i * 0.6, pop(500 + i * 200, 1200 + i * 300), 0.18, pan=-0.6 + i * 0.6)
    for i in range(14):
        mix.put(b['mardi'] + 0.3 + i * 0.22, click(700 + (i % 3) * 90, 0.04), 0.07, pan=0.8 - i * 0.1)
    mix.put(b['prix'], riser(1.2, 300, 4000), 0.1)
    mix.put(b['def'] + 1.2, whoosh(0.8, 400, 1500, peak=0.6), 0.12)
    # histoire
    for i in range(16):
        mix.put(b['dollar'] + i * 0.1, click(1200 + i * 80, 0.03), 0.06, pan=0.3)
    mix.put(b['billet'], impact(1.4), 0.3)
    for i in range(14):
        mix.put(b['billet'] + 0.2 + i * 0.115, blip(N['D5'] * (1 + i * 0.03), 0.1, 0.04), 0.05)
    # chute
    mix.put(b['morale'] + 1.1, scratch(0.4), 0.12)
    mix.put(b['teaser'] + 1.4, pop(400, 900, 0.22), 0.2, pan=0.5)
    mix.put(b['next'], chime(ch('D4', 'F#4', 'A4', 'D5'), 2.0, 0.8), 0.2)
