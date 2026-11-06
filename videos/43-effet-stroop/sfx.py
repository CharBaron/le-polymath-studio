# Cue sheet — vidéo 43-effet-stroop (DA Gravure v3.2) : bande-son commune sfx/gravure.py, calée sur build/shots.json,
# plus le test lui-même : chrono mécanique qui tique pendant les 6 s de silence (rien d'autre : on doit s'entendre lire),
# clic d'arrêt, encre qui entoure « ROUGE », carrés qui se posent, barres de Stroop ; bruitages ElevenLabs sur les moments clés.
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfx.gravure import make
from sfx.synth import SR, click, pop, riser, scratch, thud, impact

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(HERE, 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)
GEN = {
    'start': ('a mechanical stopwatch button pressed to start, crisp metallic click', 0.6, 0.65),
    'stop': ('a mechanical stopwatch button pressed to stop, hard metallic click followed by a small bell ding', 1.0, 0.65),
    'presse': ('an old wooden printing press slamming down onto paper, heavy wooden thunk', 1.0, 0.6),
}


def g(name):
    prompt, dur, infl = GEN[name]
    out = os.path.join(BUILD, name + '.wav')
    eleven(prompt, out, dur, infl)
    y, sr = sf.read(out)
    y = y.mean(1) if y.ndim > 1 else y
    if sr != SR:
        y = np.interp(np.arange(0, len(y) * SR / sr) * sr / SR, np.arange(len(y)), y)
    return list(y / (np.max(np.abs(y)) + 1e-9) * 0.9)


base = make(__file__, 'src/videos/Stroop.shots.ts', semis=-1)


def score(mix, tl):
    base(mix, tl)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))
    S = {k: g(k) for k in GEN}
    for s in shots:
        a, t0, t1 = s.get('anim') or {}, s['t0'], s['t1']
        n, mode = a.get('name'), a.get('mode')
        if n == 'Stroop' and mode == 'test':
            go, stop = a['go'], a['stop']
            mix.put(go - 0.02, S['start'], 0.22)
            k = 0
            while go + 0.5 * (k + 1) < stop - 0.1:  # tic-tac du chrono, discret
                mix.put(go + 0.5 * (k + 1), click(2600 if k % 2 else 2200, 0.02), 0.05, pan=0.15); k += 1
            mix.put(stop - 0.03, S['stop'], 0.3); mix.put(stop, impact(1.0), 0.12)
        elif n == 'Stroop' and mode == 'reveal':
            mix.put(t0 + 0.2, scratch(0.4), 0.12); mix.put(a['zoomAt'], thud(0.25), 0.1)
        elif n == 'Stroop' and mode == 'carres':
            for i in range(10): mix.put(t0 + 0.12 + i * 0.035, pop(600 + 60 * i, 900, 0.1), 0.06, pan=-0.3 if i % 2 == 0 else 0.3)
            for i in range(10): mix.put(t0 + 0.55 + i * 0.11, click(1800 + 90 * i, 0.02), 0.07, pan=-0.3 if i % 2 == 0 else 0.3)  # les carrés qui s'allument
        elif n == 'Barres':
            mix.put(a['at'], riser(0.8, 300, 1400), 0.06); mix.put(a['at'] + 0.35, riser(0.8, 300, 1800), 0.06)
    b = tl['beats']
    mix.put(b['mot'] - 0.05, S['presse'], 0.22)
