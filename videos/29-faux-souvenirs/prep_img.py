"""Images de la vidéo 29 (style rêve) : python3 -E videos/29-faux-souvenirs/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

JOBS = {
    # fonds du test (plein écran, très assombris dans l'animation) : un par paire de mots
    'goya_plein': ('plein', 'goya', (0.25, 0.2, 0.85, 0.72), 0),
    'nightmare_plein': ('plein', 'nightmare', (0.25, 0.05, 0.75, 0.95), 0),
    'prefet_plein': ('plein', 'prefet', (0.3, 0.15, 0.75, 0.7), 0),
    'sieste_plein': ('plein', 'sieste', (0.2, 0.3, 0.8, 0.75), 0),
    'gahner_plein': ('plein', 'gahner', (0.2, 0.05, 0.8, 0.8), 0),
    'endymion_plein': ('plein', 'endymion', (0.35, 0.4, 0.7, 0.85), 0),
    # cartes
    'goya': ('carte', 'goya', (0.22, 0.15, 0.88, 0.75), 760),
    'nightmare': ('carte', 'nightmare', (0.05, 0.08, 0.95, 0.95), 880),
    'prefet': ('carte', 'prefet', (0.2, 0.08, 0.82, 0.72), 880),
    'gahner': ('carte', 'gahner', (0.15, 0.05, 0.85, 0.75), 620),
    'sieste': ('carte', 'sieste', (0.0, 0.3, 1.0, 0.8), 880),
    'endymion': ('carte', 'endymion', (0.3, 0.4, 0.8, 0.85), 760),
    'temoin': ('carte', 'temoin', (0.2, 0.12, 0.85, 0.72), 880),
    'temoin_zoom': ('carte', 'temoin', (0.22, 0.3, 0.52, 0.72), 620),
    'wundt': ('carte', 'wundt', (0.0, 0.0, 1.0, 1.0), 880),
    'versailles': ('carte', 'versailles', (0.0, 0.03, 1.0, 1.0), 880),
    'montgolfier': ('carte', 'montgolfier', (0.0, 0.0, 1.0, 0.9), 640, {'up': True}),
    'enfant': ('carte', 'enfant', (0.12, 0.04, 0.88, 0.97), 620),
    # l'enfant découpé (tête et buste) pour la photo truquée
    'enfant_cut': ('poly', 'enfant', (95, 40, 345, 350), 0, {'poly': [(233, 52), (262, 60), (278, 85), (281, 118), (274, 148), (262, 164), (300, 178), (322, 205), (330, 260), (334, 345), (120, 345), (124, 262), (134, 206), (160, 180), (205, 165), (192, 148), (186, 116), (189, 84), (205, 60)]}),
}
run(__file__, 'reve', JOBS)
