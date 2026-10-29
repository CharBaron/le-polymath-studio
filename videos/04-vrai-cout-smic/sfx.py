# Cue sheet — vidéo 04. Tonalité : ré mineur → fa majeur (fiche) → ré mineur (piège) → si♭ (teaser).
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click, riser, impact

N = {'D3': 146.83, 'F3': 174.61, 'G3': 196.0, 'A3': 220.0, 'Bb3': 233.08, 'C4': 261.63, 'D4': 293.66, 'F4': 349.23, 'A4': 440.0, 'D5': 587.33}
ch = lambda *n: [N[x] for x in n]

def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    chords = [(0, ch('D3', 'F3', 'A3')), (b['brut'], ch('F3', 'A3', 'C4')), (b['patron'], ch('G3', 'Bb3', 'D4')),
              (b['twist'], ch('F3', 'A3', 'C4')), (b['hausse'], ch('D3', 'F3', 'A3')), (b['chute'], ch('Bb3', 'D4', 'F4'))]
    l, r = pad(dur, chords, detune=0.8)
    mix.put_stereo(0, l, r, 0.06)
    t, k = 0.0, 0
    while t < dur - 1:
        root = [c for c in chords if c[0] <= t][-1][1]
        mix.put(t, blip(root[k % 3] * 2, 0.25, 0.07), 0.035 if k % 2 else 0.05, pan=-0.3 if k % 2 else 0.3)
        t += 0.5; k += 1
    mix.put(b['cout'] + 0.4, pop(500, 1400), 0.22, pan=0.4)
    mix.put(b['spoiler'] + 0.6, impact(0.7), 0.15)
    # fiche de paie : lignes qui s'écrivent
    for at in (b['brut'] + 0.3, b['cotis'], b['net']):
        mix.put(at, scratch(0.5), 0.12)
    mix.put(b['net'] + 0.5, chime(ch('F4', 'A4', 'D5'), 1.0, 0.4), 0.1)
    # colonne du patron
    for i, at in enumerate((b['patron'], b['patron'] + 0.4, b['patron'] + 1.2)):
        mix.put(at, pop(400 + i * 150, 1000 + i * 250, 0.14), 0.15)
    for i in range(10):
        mix.put(b['plein'] + 0.2 + i * 0.1, click(1400 + i * 60, 0.03), 0.06)
    # pages qui tournent
    for k2 in ('twist', 'chute'):
        mix.put(b[k2] - 0.05, whoosh(0.7, 3000, 500, peak=0.35), 0.25)
    mix.put(b['reduc'] + 0.6, scratch(0.25), 0.2, pan=-0.2)
    mix.put(b['reduc'] + 0.75, scratch(0.25), 0.2, pan=0.2)
    for i in range(10):
        mix.put(b['reel'] + 0.2 + i * 0.1, click(2000 - i * 60, 0.03), 0.06)
    # piège
    mix.put(b['cent'] + 0.3, pop(600, 1400), 0.18, pan=-0.4)
    mix.put(b['cent'] + 1.6, impact(0.8), 0.16)
    mix.put(b['debat'] + 0.5, pop(500, 1200), 0.15, pan=-0.3)
    mix.put(b['debat'] + 2.4, pop(700, 1500), 0.15, pan=0.3)
    # teaser
    mix.put(b['retraite'] + 1.0, whoosh(0.5, 600, 2200, peak=0.5), 0.12)
    mix.put(b['pasta'], impact(0.8), 0.18)
    mix.put(b['next'] + 1.0, chime(ch('Bb3', 'D4', 'F4', 'A4'), 2.0, 0.8), 0.2)
