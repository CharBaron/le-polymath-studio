# Cue sheet du prototype : les temps viennent de timeline.json (beats).
from sfx.synth import pad, pop, whoosh, scratch, chime, blip, click

D = [146.83, 220.0, 293.66]  # ré majeur
G = [196.0, 246.94, 293.66]
A = [220.0, 277.18, 329.63]

def score(mix, tl):
    b = tl['beats']; dur = tl['duration']
    l, r = pad(dur, [(0, D), (b['chiffre'], G), (b['question'], A)])
    mix.put_stereo(0, l, r, 0.05)
    # pas de Pierrot pendant l'entrée (marche 0.2 → 2.4 s)
    for i in range(7):
        mix.put(0.35 + i * 0.3, click(900 + (i % 2) * 120, 0.04), 0.10, pan=-0.6 + i * 0.12)
    mix.put(b['point'], whoosh(0.35, 600, 2600, peak=0.5), 0.22, pan=0.3)
    mix.put(b['count'], scratch(0.5), 0.12, pan=0.2)
    for i in range(10):
        mix.put(b['count'] + i * 0.07, blip(587.33 * (1 + i * 0.06), 0.12, 0.05), 0.07, pan=0.2)
    mix.put(b['count'] + 0.9, chime([587.33, 739.99, 880.0], 1.6, 0.6), 0.22)
    mix.put(b['shock'], pop(400, 1400, 0.18), 0.25, pan=-0.2)
