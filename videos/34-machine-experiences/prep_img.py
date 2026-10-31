"""Images de la vidéo 34 (style caverne) : python3 -E videos/34-machine-experiences/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'bosch_plein': ('plein', 'bosch', (0.2, 0.0, 0.8, 0.42), 0, C),
    'bosch': ('carte', 'bosch', (0.0, 0.0, 1.0, 1.0), 760, C),
    'bosch_zoom': ('carte', 'bosch', (0.0, 0.0, 1.0, 0.36), 860, C),
    'caverne': ('carte', 'caverne', (0.0, 0.05, 1.0, 0.78), 880),
    'caverne_ombres': ('carte', 'caverne', (0.45, 0.05, 0.98, 0.6), 760),
    'caverne_plein': ('plein', 'caverne', (0.35, 0.05, 0.95, 0.75), 0),
    'prison': ('carte', 'prison', (0.0, 0.0, 1.0, 1.0), 880),
    'prison2': ('carte', 'prison2', (0.0, 0.0, 1.0, 1.0), 880),
    'prison_plein': ('plein', 'prison2', (0.2, 0.0, 0.8, 1.0), 0),
    'duchenne': ('carte', 'duchenne', (0.04, 0.02, 0.96, 0.98), 640),
    'duchenne_zoom': ('carte', 'duchenne', (0.15, 0.18, 0.85, 0.7), 700),
    'tel': ('carte', 'tel', (0.04, 0.0, 0.96, 0.9), 640),
}
run(__file__, 'caverne', JOBS)
