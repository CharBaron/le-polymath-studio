"""Images de la vidéo 21 (style planche d'anatomie) : python3 -E videos/21-estomac-ficelle/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'beaumont': ('carte', 'beaumont', (0.05, 0.02, 0.95, 0.9), 560),
    'beaumont_face': ('carte', 'beaumont2', (0.15, 0.08, 0.85, 0.62), 600),
    'stmartin': ('carte', 'stmartin', (0.05, 0.03, 0.95, 0.9), 560),
    'stmartin_vieux': ('carte', 'stmartin3', (0.05, 0.03, 0.95, 0.9), 540),
    'couple': ('carte', 'stmartinwife', (0.02, 0.03, 0.98, 0.97), 760),
    'couple_plein': ('plein', 'stmartinwife', (0.5, 0.05, 0.98, 0.95), 0),
    'canoe': ('carte', 'canoe', (0.0, 0.05, 1.0, 0.95), 880, C),
    'canoe_zoom': ('carte', 'canoe', (0.05, 0.35, 0.6, 0.85), 860, C),
    'estomac_grand': ('carte', 'stomach', (0.0, 0.0, 1.0, 1.0), 900, {'up': True}),
    'estomac': ('carte', 'stomach', (0.0, 0.0, 1.0, 1.0), 760),
    'mousquet': ('carte', 'militia', (0.0, 0.0, 0.34, 0.5), 560),
    'brevet': ('carte', 'life1', (0.02, 0.02, 0.98, 0.9), 820),
}
run(__file__, 'anatomie', JOBS)
