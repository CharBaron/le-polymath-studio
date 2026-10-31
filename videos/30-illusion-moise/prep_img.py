"""Images de la vidéo 30 (style déluge) : python3 -E videos/30-illusion-moise/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'deluge_plein': ('plein', 'deluge', (0.15, 0.05, 0.85, 0.8), 0),
    'arche_plein': ('plein', 'colombe', (0.2, 0.0, 0.85, 0.55), 0),
    'moise_plein': ('plein', 'moise', (0.15, 0.0, 0.85, 0.7), 0),
    'deluge': ('carte', 'deluge', (0.03, 0.03, 0.97, 0.93), 820),
    'colombe': ('carte', 'colombe', (0.03, 0.0, 0.97, 0.62), 860),
    'moise': ('carte', 'moise', (0.03, 0.0, 0.97, 0.78), 760),
    'moise_zoom': ('carte', 'moise', (0.25, 0.0, 0.8, 0.42), 700),
    'brueghel': ('carte', 'brueghel', (0.0, 0.0, 1.0, 1.0), 880, C),
    'hicks': ('carte', 'hicks', (0.25, 0.15, 1.0, 0.95), 880, C),
    'paires': ('carte', 'hicks', (0.0, 0.55, 0.62, 0.98), 820, C),
    'muraille': ('carte', 'muraille2', (0.0, 0.0, 1.0, 0.95), 880),
    'renard': ('carte', 'renard', (0.1, 0.05, 0.98, 0.95), 760),
    'renard_zoom': ('carte', 'renard', (0.25, 0.22, 0.65, 0.75), 640, {'up': True}),
}
run(__file__, 'deluge', JOBS)
