"""Images de la vidéo 33 (style or) : python3 -E videos/33-jeu-ultimatum/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'couple_plein': ('plein', 'couple', (0.3, 0.0, 0.8, 1.0), 0, C),
    'couple': ('carte', 'couple', (0.0, 0.0, 1.0, 1.0), 880, C),
    'couple_main': ('carte', 'couple', (0.0, 0.62, 0.42, 1.0), 760, C),
    'preteur': ('carte', 'preteur', (0.0, 0.0, 1.0, 1.0), 820, C),
    'pieces': ('carte', 'preteur', (0.1, 0.62, 0.7, 0.96), 860, C),
    'preteur_plein': ('plein', 'preteur', (0.05, 0.1, 0.55, 0.95), 0, C),
    'chimp': ('carte', 'chimp', (0.02, 0.0, 0.98, 1.0), 640),
    'chimp_zoom': ('carte', 'chimp', (0.2, 0.0, 0.85, 0.45), 640),
    'insula': ('carte', 'insula', (0.0, 0.0, 1.0, 1.0), 880, {'up': True}),
}
run(__file__, 'or', JOBS)
