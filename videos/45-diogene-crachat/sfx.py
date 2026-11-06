# Cue sheet — vidéo 45-diogene-crachat : bande-son commune sfx/gravure.py, calée sur build/shots.json, plus les bruitages ElevenLabs
# des moments clés (raclement de gorge et crachat, plumes, os, chien, lampe qui grésille, pièces, foule).
import json
import os
import sys

import numpy as np
import soundfile as sf

from sfx.gravure import make
from sfx.synth import SR, boom, click, impact, riser, whoosh

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'tts'))
from sfx_eleven import sfx as eleven  # noqa: E402

BUILD = os.path.join(HERE, 'build', 'sfx')
os.makedirs(BUILD, exist_ok=True)
GEN = {
    'raclement': ('a man clearing his throat loudly, deep phlegm hawking sound, gross and close up', 1.4, 0.7),
    'crachat': ('a single wet spit, close up, a gob of saliva flying out of a mouth', 0.6, 0.7),
    'splat': ('a wet gob of spit splatting hard against a glass window, wet slap', 0.7, 0.7),
    'plumes': ('a burst of feathers flapping, a chicken squawk then soft feathers falling', 1.4, 0.55),
    'os': ('a dry bone thrown and clattering on a stone floor', 0.7, 0.65),
    'pisse': ('a dog urinating on a stone floor, liquid stream, short', 1.2, 0.6),
    'lampe': ('an old oil lamp flame flickering and crackling softly, night', 2.2, 0.5),
    'pieces': ('a handful of ancient coins dropped on a wooden table, metallic clatter', 1.0, 0.65),
    'foule': ('an ancient market crowd shouting bids, hands raised, muffled', 2.5, 0.45),
}


def g(name):
    prompt, dur, infl = GEN[name]
    out = os.path.join(BUILD, name + '.wav')
    if not os.path.exists(out): eleven(prompt, out, dur, infl)
    y, sr = sf.read(out)
    y = y.mean(1) if y.ndim > 1 else y
    if sr != SR: y = np.interp(np.arange(0, len(y) * SR / sr) * sr / SR, np.arange(len(y)), y)
    return list(y / (np.max(np.abs(y)) + 1e-9) * 0.9)


base = make(__file__, 'src/videos/DiogeneCrachat.shots.ts', semis=-3)


def score(mix, tl):
    base(mix, tl)
    shots = json.load(open(os.path.join(HERE, 'build', 'shots.json')))
    S = {k: g(k) for k in GEN}
    b = tl['beats']
    for s in shots:
        a, t0, t1 = s.get('anim') or {}, s['t0'], s['t1']
        n = a.get('name')
        if n == 'Crachat' and a.get('hit') is not None:
            mix.put(a['spit'] - 0.05, S['crachat'], 0.3); mix.put(a['hit'], S['splat'], 0.34); mix.put(a['hit'], impact(1.0), 0.13); mix.put(a['hit'], boom(0.8, 58), 0.1)
            if a.get('rumble'): mix.put(a['rumble'][0], S['raclement'], 0.2)
        elif n == 'Lanterne':
            mix.put(t0, S['lampe'], 0.14)
        elif n == 'Plumes':
            mix.put(a['at'] - 0.05, S['plumes'], 0.26)
        elif n == 'Os':
            for i, tt in enumerate(a['at']): mix.put(tt + 0.28, S['os'], 0.2, pan=-0.3 if i % 2 == 0 else 0.3)
        elif n == 'Ombre':
            mix.put(a['at'], whoosh(0.5, 300, 2800, peak=0.6), 0.1); mix.put(a['at'] + 0.1, riser(0.7, 500, 2600), 0.05)
    mix.put(b['pisse'] + 0.05, S['pisse'], 0.16)
    mix.put(b['pirates'], S['foule'], 0.12)
    mix.put(b['achete'] + 0.02, S['pieces'], 0.24)
    # le faux silence avant « Commander »
    mix.put(0.0, impact(0.8), 0.1); mix.put(0.0, whoosh(0.4, 2600, 500, peak=0.5), 0.12)
