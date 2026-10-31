"""Images de la vidéo 37 (style école : tableau noir, cahier Seyès, velours bleu nuit) : python3 -E videos/37-lecture-piege/prep_img.py
Les panneaux du test sont dessinés en code (src/gravure/anim/Lecture.tsx) ; ici, les tableaux et planches qui les entourent."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'liseuse': ('carte', 'liseuse', (0.0, 0.08, 0.86, 0.78), 640, C),
    'liseuse_livre': ('carte', 'liseuse', (0.02, 0.36, 0.5, 0.68), 700, C),
    'ecole': ('carte', 'ecole', (0.0, 0.0, 1.0, 1.0), 880, C),
    'ecole_maitre': ('carte', 'ecole', (0.38, 0.22, 0.78, 0.62), 700, C),
    'oeil': ('carte', 'oeil', (0.0, 0.0, 1.0, 1.0), 760, {'up': True}),
}
run(__file__, 'ecole', JOBS)
