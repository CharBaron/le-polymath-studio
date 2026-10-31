"""Images de la vidéo 31 (style optique) : python3 -E videos/31-tache-aveugle/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from tools.pipeline.gravure_prep import run

JOBS = {
    'oeil': ('carte', 'oeil', (0.0, 0.0, 1.0, 1.0), 880, {'up': True}),
    'oeil_nerf': ('carte', 'oeil', (0.25, 0.55, 0.75, 1.0), 700, {'up': True}),
    'academie': ('carte', 'academie', (0.0, 0.0, 1.0, 0.9), 880),
    'academie_zoom': ('carte', 'academie', (0.02, 0.4, 0.45, 0.88), 760),
    'testelin': ('carte', 'testelin', (0.0, 0.0, 1.0, 0.82), 760, {'color': True}),
    'yeux': ('carte', 'duchenne', (0.18, 0.26, 0.82, 0.42), 880),
    'regard': ('carte', 'duchenne', (0.1, 0.1, 0.9, 0.75), 700),
    'academie_plein': ('plein', 'academie', (0.3, 0.1, 0.7, 0.9), 0),
}
run(__file__, 'optique', JOBS)
