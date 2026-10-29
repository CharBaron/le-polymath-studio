"""Images de la vidéo 22 (style atlas céleste) : python3 -E videos/22-eratosthene/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'strozzi': ('carte', 'strozzi', (0.0, 0.0, 1.0, 1.0), 860, C),
    'strozzi_plein': ('plein', 'strozzi', (0.08, 0.0, 0.62, 1.0), 0, C),
    'pharos': ('carte', 'pharos', (0.02, 0.02, 0.98, 0.88), 860),
    'pharos2': ('carte', 'pharos2', (0.03, 0.03, 0.97, 0.85), 860),
    'columbus': ('carte', 'columbus', (0.05, 0.03, 0.95, 0.9), 580, C),
    'ships': ('carte', 'ships', (0.0, 0.0, 1.0, 1.0), 880),
    'landing': ('carte', 'landing', (0.12, 0.15, 0.88, 0.75), 860),
    'flammarion': ('carte', 'flammarion', (0.02, 0.02, 0.98, 0.86), 760),
    'flammarion_plein': ('plein', 'flammarion', (0.0, 0.0, 1.0, 0.86), 0),
    'cellarius': ('carte', 'cellarius', (0.03, 0.03, 0.97, 0.97), 760, C),
    'ptolemaic': ('carte', 'ptolemaic', (0.03, 0.03, 0.97, 0.97), 760, C),
    'armillaire': ('carte', 'compass', (0.55, 0.08, 0.97, 0.92), 500, C),
    'scholars': ('carte', 'scholars', (0.03, 0.03, 0.97, 0.97), 600),
}
run(__file__, 'atlas', JOBS)
