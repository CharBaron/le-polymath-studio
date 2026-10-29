"""Images de la vidéo 20 (style céramique grecque) : python3 -E videos/20-bateau-thesee/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'amphora': ('carte', 'amphora', (0.1, 0.04, 0.9, 0.98), 540, C),
    'amphora_zoom': ('carte', 'amphora', (0.32, 0.28, 0.72, 0.62), 640, C),
    'trireme': ('carte', 'trireme1', (0.12, 0.22, 0.88, 0.74), 860),
    'trireme_plein': ('plein', 'trireme1', (0.2, 0.25, 0.8, 0.72), 0),
    'lampe': ('carte', 'trireme2', (0.15, 0.28, 0.85, 0.56), 760),
    'forty': ('carte', 'forty', (0.0, 0.0, 1.0, 1.0), 880),
    'hobbes': ('carte', 'hobbes', (0.08, 0.05, 0.92, 0.82), 540),
    'leviathan': ('carte', 'leviathan', (0.14, 0.03, 0.86, 0.55), 620),
    'plutarch': ('rond', 'plutarch', (0.5, 0.33, 0.34), 520),
    'minotaure': ('carte', 'minotaure', (0.03, 0.03, 0.97, 0.85), 620),
    'theseus2': ('carte', 'theseus2', (0.04, 0.08, 0.96, 0.85), 880),
    'canova': ('carte', 'canova2', (0.08, 0.05, 0.92, 0.82), 580),
    'mars': ('rond', 'mars', (0.5, 0.41, 0.44), 600),
    'marsortho': ('carte', 'marsortho', (0.05, 0.08, 0.95, 0.95), 620, C),
    'acropolis': ('carte', 'acropolis', (0.05, 0.12, 0.47, 0.5), 860),
}
run(__file__, 'grec', JOBS)
