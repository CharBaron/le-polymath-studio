"""Images de la vidéo 46 (style ecorche : fibres rouge sombre, planche d'anatomie) : python3 -E videos/46-biceps-menteur/prep_img.py
Le bras écorché est dessiné en code (src/gravure/anim/Biceps.tsx), le reste vient de Vésale, Gray, Duchenne, Brouillet."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'vesale_plein': ('plein', 'vesale', (0.1, 0.08, 0.9, 0.62), 0),
    'vesale_bras': ('carte', 'vesale', (0.0, 0.2, 0.42, 0.56), 760, {'up': True}),
    'vesale_tete': ('plein', 'vesale', (0.3, 0.08, 0.72, 0.36), 0),
    'dos_plein': ('plein', 'vesale_dos', (0.08, 0.1, 0.92, 0.64), 0),
    'salpe': ('carte', 'salpe', (0.5, 0.05, 1.0, 1.0), 860, C),
    'duchenne': ('plein', 'duchenne', (0.14, 0.05, 0.86, 0.72), 0),
    'cerveau': ('carte', 'cerveau', (0.0, 0.06, 1.0, 0.64), 800, {'up': True}),
    'colonne': ('carte', 'colonne', (0.0, 0.0, 1.0, 1.0), 300, {'up': True}),
    'humerus': ('carte', 'humerus', (0.0, 0.0, 1.0, 1.0), 300, {'up': True}),
    'szabo': ('carte', 'szabo', (0.17, 0.46, 1.0, 0.8), 880),
}
run(__file__, 'ecorche', JOBS)
