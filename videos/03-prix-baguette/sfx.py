# Cue sheet — vidéo 03. Tonalité : sol majeur → mi mineur (rebondissement / inflation) → sol (teaser).
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click, riser, impact

N = {'E3': 164.81, 'G3': 196.0, 'A3': 220.0, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'G4': 392.0, 'B4': 493.88, 'D5': 587.33}
ch = lambda *n: [N[x] for x in n]

def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    chords = [(0, ch('G3', 'B3', 'D4')), (b['ble'], ch('C4', 'E4', 'G4')), (b['twist'], ch('E3', 'G3', 'B3')),
              (b['aval'], ch('A3', 'C4', 'E4')), (b['energie'], ch('E3', 'G3', 'B3')), (b['def'], ch('C4', 'E4', 'G4')),
              (b['chute'], ch('G3', 'B3', 'D4'))]
    l, r = pad(dur, chords, detune=0.8)
    mix.put_stereo(0, l, r, 0.06)
    t, k = 0.0, 0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        mix.put(t, blip(root[k % 3] * 2, 0.25, 0.07), 0.035 if k % 2 else 0.05, pan=-0.3 if k % 2 else 0.3)
        t += 0.5; k += 1
    # hook
    mix.put(0.05, pop(500, 1200), 0.18, pan=-0.4)
    for i in range(8):
        mix.put(b['now'] + i * 0.1, click(1500 + i * 60, 0.03), 0.07, pan=-0.4)
    mix.put(b['now'] + 0.9, chime(ch('G4', 'B4', 'D5'), 1.0, 0.4), 0.12)
    mix.put(b['pourquoi'], pop(500, 1400), 0.22, pan=0.5)
    mix.put(b['spoiler'] + 0.2, whoosh(0.5, 500, 2000, peak=0.5), 0.14)
    mix.put(b['spoiler'] + 1.0, impact(0.7), 0.16)
    # blé
    mix.put(b['ble'] + 0.8, scratch(0.6), 0.16)
    mix.put(b['centimes'] + 0.2, pop(800, 1800, 0.12), 0.2)
    # pages qui tournent
    for k2 in ('twist', 'chute'):
        mix.put(b[k2] - 0.05, whoosh(0.7, 3000, 500, peak=0.35), 0.25)
    mix.put(b['baisse'] - 0.3, scratch(1.4), 0.08)
    mix.put(b['baisse'] + 1.6, whoosh(0.4, 2000, 600, peak=0.4), 0.12)
    mix.put(b['stable'] - 0.2, scratch(1.2), 0.08)
    # après le moulin
    mix.put(b['reste'] + 0.6, scratch(1.2), 0.1)
    for i, at in enumerate([0, 0.9, 1.6, 2.2, 3.1]):
        mix.put(b['liste'] + at, pop(500 + i * 120, 1200 + i * 200, 0.12), 0.15, pan=-0.6 + i * 0.25)
    # inflation
    mix.put(b['energie'] + 0.3, impact(0.8), 0.16)
    mix.put(b['energie'] + 1.2, riser(1.0, 300, 3500), 0.08)
    mix.put(b['ipc'], pop(600, 1500), 0.18)
    for i in range(4):
        mix.put(b['def'] + 1.4 + i * 0.3, whoosh(0.3, 600, 2200, peak=0.6), 0.1, pan=-0.4 + i * 0.25)
    # teaser
    mix.put(b['salaire'] + 0.3, impact(0.9), 0.18)
    mix.put(b['next'], chime(ch('G4', 'B4', 'D5'), 2.0, 0.8), 0.2)
