"""Images de la vidéo 43 (style imprimerie : casse de typographe, papier journal, bleu encre) : python3 -E videos/43-effet-stroop/prep_img.py
Le test lui-même (les mots de couleur) est dessiné en code dans src/gravure/anim/Stroop.tsx."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

JOBS = {
    'cerveau': ('carte', 'cerveau', (0.0, 0.03, 1.0, 0.6), 760),
    'presse': ('carte', 'presse', (0.0, 0.0, 1.0, 0.94), 880),
    'zetter': ('carte', 'presse', (0.04, 0.3, 0.42, 0.88), 700),
}
run(__file__, 'imprimerie', JOBS)
