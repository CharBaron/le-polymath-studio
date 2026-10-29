"""Images de la vidéo 19 (style labo) : python3 -E videos/19-gorille-invisible/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

JOBS = {
    'gorilla': ('carte', 'gorilla', (0.05, 0.03, 0.95, 0.97), 620),
    'gorille_test': ('carte', 'gorilla', (0.18, 0.22, 0.86, 0.78), 340),
    'gorilla_face': ('carte', 'gorilla', (0.3, 0.25, 0.72, 0.55), 620),
    'gorilla_plein': ('plein', 'gorilla', (0.15, 0.1, 0.85, 0.9), 0),
    'brehm7': ('carte', 'brehm7', (0.03, 0.03, 0.97, 0.9), 620),
    'gorillas': ('carte', 'gorillab2', (0.03, 0.03, 0.97, 0.97), 620),
    'leopard': ('carte', 'gorillaleo', (0.03, 0.03, 0.97, 0.97), 620),
    'basket1': ('carte', 'basket1', (0.0, 0.0, 1.0, 0.86), 880),
    'basket2': ('carte', 'basket2', (0.0, 0.0, 1.0, 0.86), 880),
    'basket_zoom': ('carte', 'basket2', (0.1, 0.25, 0.6, 0.86), 760),
    'xray': ('carte', 'xray1', (0.0, 0.0, 1.0, 0.62), 880),
    'xray_zoom': ('carte', 'xray1', (0.02, 0.02, 0.49, 0.6), 640),
    'machine': ('carte', 'xray2', (0.05, 0.03, 0.95, 0.97), 560),
    'chair': ('carte', 'xray3', (0.05, 0.03, 0.95, 0.97), 520),
}
run(__file__, 'labo', JOBS)
