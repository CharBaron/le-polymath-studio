"""Bruitages du style « Survie » (références : dossier « Vidéo Zombie ») : sirène lointaine, bip d'alerte d'urgence, vibreur,
alarme de voiture, ronron de frigo, tic-tac accéléré, pas, échelle, vent, rotor lointain, coupure de courant, battement de cœur,
bip morse, râle de foule, glitch. Même forme que sfx/synth.py : listes d'échantillons mono à SR."""
import math
import random

from sfx.synth import SR, bandnoise


def _lp(x, a):
    """passe-bas un pôle (a petit = plus sombre)"""
    y, out = 0.0, []
    for v in x:
        y += a * (v - y)
        out.append(y)
    return out


def siren(dur, f0=720.0, f1=1250.0, period=4.0):
    """Sirène lointaine qui monte et descend (cycle de ~4 s), assourdie par la distance."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        f = f0 + (f1 - f0) * (0.5 - 0.5 * math.cos(2 * math.pi * t / period))
        ph += 2 * math.pi * f / SR
        out.append(0.6 * math.sin(ph) + 0.25 * math.sin(2 * ph) + 0.1 * math.sin(3 * ph))
    out = _lp(out, 0.08)
    env = [min(1, k / (0.8 * SR), (n - k) / (0.8 * SR)) for k in range(n)]
    return [o * e * 2.2 for o, e in zip(out, env)]


def eas(beeps=3, on=0.5, off=0.12):
    """Bip d'alerte d'urgence à deux tons (853 + 960 Hz), en salves."""
    out = []
    for _ in range(beeps):
        n = int(on * SR)
        for k in range(n):
            t = k / SR
            a = min(1, k / 240, (n - k) / 240)
            out.append(a * 0.5 * (math.sin(2 * math.pi * 853 * t) + math.sin(2 * math.pi * 960 * t)))
        out += [0.0] * int(off * SR)
    return out


def buzz(dur=0.32):
    """Téléphone qui vibre sur une table : bourdon grave haché + cliquetis du bois."""
    n = int(dur * SR)
    rattle = bandnoise(n, lambda k: 900, q=0.6)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * 165 / SR
        am = 0.6 + 0.4 * math.sin(2 * math.pi * 28 * t)
        a = min(1, t / 0.01, (dur - t) / 0.03)
        out.append(a * am * (math.tanh(3 * math.sin(ph)) * 0.5 + rattle[k] * 1.6))
    return out


def car_alarm(dur=2.6):
    """Alarme de voiture : deux tons qui alternent vite, sirène qui monte, en boucle."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        seg = int(t / 0.65) % 2
        f = (1300 if int(t * 8) % 2 else 980) if seg == 0 else 900 + 900 * ((t % 0.65) / 0.65)
        ph += 2 * math.pi * f / SR
        a = min(1, t / 0.02, (dur - t) / 0.3)
        out.append(a * math.tanh(2.5 * math.sin(ph)) * 0.6)
    return _lp(out, 0.35)


def hum(dur, f=58.0):
    """Ronron électrique (frigo, néon) : fondamentale + harmoniques, très léger."""
    n = int(dur * SR)
    out = []
    for k in range(n):
        t = k / SR
        a = min(1, t / 0.4, (dur - t) / 0.4)
        out.append(a * (0.6 * math.sin(2 * math.pi * f * t) + 0.3 * math.sin(4 * math.pi * f * t) + 0.12 * math.sin(6 * math.pi * f * t)))
    return out


def tick(f=3200.0):
    """Tic d'horloge sec."""
    n = int(0.03 * SR)
    return [math.sin(2 * math.pi * f * k / SR) * math.exp(-k / (0.004 * SR)) + random.uniform(-1, 1) * 0.4 * math.exp(-k / (0.001 * SR)) for k in range(n)]


def step(hard=True):
    """Pas sur du béton (grave + claquement)."""
    n = int(0.22 * SR)
    sl = bandnoise(n, lambda k: 1400 if hard else 600, q=0.7)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (80 + 90 * math.exp(-t / 0.02)) / SR
        out.append(math.tanh(1.5 * (math.sin(ph) * math.exp(-t / 0.05) + sl[k] * 1.8 * math.exp(-t / 0.018))))
    return out


def clank(f=520.0):
    """Barreau d'échelle métallique : impact inharmonique court."""
    n = int(0.5 * SR)
    parts = ((1.0, 1.0, 0.12), (2.3, 0.5, 0.08), (3.9, 0.3, 0.05))
    return [sum(g * math.sin(2 * math.pi * f * r * k / SR) * math.exp(-k / (tau * SR)) for r, g, tau in parts) * 0.6 + random.uniform(-1, 1) * 0.5 * math.exp(-k / (0.003 * SR)) for k in range(n)]


def wind(dur, base=420.0):
    """Vent : bruit filtré qui ondule lentement."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: base + 180 * math.sin(k / SR * 0.7) + 90 * math.sin(k / SR * 2.3), q=0.4)
    return [v * min(1, k / (0.6 * SR), (n - k) / (0.6 * SR)) * 1.4 for k, v in enumerate(w)]


def rotor(dur):
    """Hélicoptère très lointain : souffle haché à ~11 Hz, assourdi."""
    n = int(dur * SR)
    w = bandnoise(n, lambda k: 260, q=0.5)
    return [v * (0.4 + 0.6 * max(0, math.sin(2 * math.pi * 11 * k / SR)) ** 3) * min(1, k / SR, (n - k) / SR) * 1.6 for k, v in enumerate(w)]


def power_down(dur=1.4):
    """Coupure de courant : claquement + bourdon qui chute dans le grave."""
    n = int(dur * SR)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        f = 120 * math.exp(-t / 0.35) + 30
        ph += 2 * math.pi * f / SR
        snap = random.uniform(-1, 1) * math.exp(-t / 0.006)
        out.append(math.tanh(2 * (math.sin(ph) * math.exp(-t / 0.6) * 0.8 + snap)))
    return out


def heartbeat(bpm=62, dur=4.0):
    """Battement de cœur sourd (lub-dub)."""
    n = int(dur * SR)
    out = [0.0] * n
    period = 60 / bpm
    t0 = 0.0
    while t0 < dur:
        for dt, g in ((0.0, 1.0), (0.22, 0.7)):
            i0 = int((t0 + dt) * SR)
            ph = 0.0
            for k in range(int(0.18 * SR)):
                if i0 + k >= n:
                    break
                t = k / SR
                ph += 2 * math.pi * (48 + 30 * math.exp(-t / 0.02)) / SR
                out[i0 + k] += g * math.sin(ph) * math.exp(-t / 0.06)
        t0 += period
    return out


def beep(dur, f=880.0):
    """Bip morse : sinus pur aux bords adoucis."""
    n = int(dur * SR)
    return [math.sin(2 * math.pi * f * k / SR) * min(1, k / 200, (n - k) / 200) for k in range(n)]


def moan(dur=1.6, f=95.0, seed=0):
    """Râle d'infecté : voix grave rauque (formants) qui gonfle et retombe."""
    random.seed(1000 + seed)
    n = int(dur * SR)
    br = bandnoise(n, lambda k: 520 + 200 * math.sin(k / SR * 3), q=0.5)
    ph, out = 0.0, []
    for k in range(n):
        t = k / SR
        ph += 2 * math.pi * (f * (1 + 0.04 * math.sin(2 * math.pi * 5 * t))) / SR
        a = math.sin(math.pi * t / dur) ** 1.5
        out.append(a * (math.tanh(2.2 * math.sin(ph)) * 0.35 + br[k] * 1.4))
    return _lp(out, 0.25)


def glitch(dur=0.35):
    """Glitch numérique : bruit haché et notes carrées aléatoires."""
    n = int(dur * SR)
    out, val, hold = [], 0.0, 0
    f = 400.0
    for k in range(n):
        if hold <= 0:
            hold = random.randint(200, 1400)
            val = random.uniform(-1, 1)
            f = random.choice([220.0, 440.0, 660.0, 1320.0, 90.0])
        hold -= 1
        sq = 1 if math.sin(2 * math.pi * f * k / SR) > 0 else -1
        out.append((0.5 * val + 0.35 * sq) * (1 - k / n))
    return out
