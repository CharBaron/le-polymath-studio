"""Images de la vidéo 18 (style archive coloniale) : python3 -E videos/18-rats-hanoi/prep_img.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
from tools.pipeline.gravure_prep import run

C = {'color': True}
JOBS = {
    'paulbert': ('carte', 'paulbert', (0.03, 0.03, 0.97, 0.86), 860),
    'changeurs': ('carte', 'changeurs', (0.02, 0.03, 0.98, 0.80), 860),
    'pavillons': ('carte', 'pavillons', (0.02, 0.03, 0.98, 0.82), 860),
    'rue_plein': ('plein', 'paulbert', (0.25, 0.05, 0.7, 0.86), 0),
    'expo': ('carte', 'expo', (0.04, 0.03, 0.96, 0.92), 600, C),
    'egouts': ('carte', 'egouts', (0.0, 0.0, 1.0, 1.0), 720),
    'egouts_zoom': ('carte', 'egouts', (0.12, 0.12, 0.72, 0.6), 860),
    'doumer': ('carte', 'doumer', (0.05, 0.02, 0.95, 0.85), 540),
    'catcher': ('carte', 'ratcatcher', (0.03, 0.02, 0.97, 0.95), 600),
    'catcher_plein': ('plein', 'ratcatcher', (0.05, 0.0, 0.95, 0.9), 0),
    'catcher2': ('carte', 'ratcatcher2', (0.02, 0.02, 0.98, 0.98), 680),
    'rathead': ('carte', 'rathead', (0.02, 0.02, 0.98, 0.98), 620),
    'ratsfr': ('carte', 'ratsfr', (0.02, 0.02, 0.98, 0.88), 860),
    'ratsfr_zoom': ('carte', 'ratsfr', (0.28, 0.4, 0.72, 0.84), 860),
    'bouquiniste': ('carte', 'bouquiniste', (0.02, 0.02, 0.98, 0.92), 580, C),
    'rat': ('carte', 'ratskel', (0.05, 0.1, 0.95, 0.5), 780),
    'ratskel': ('carte', 'ratskel', (0.12, 0.55, 0.88, 0.93), 640),
    # rat peint à la main (Schreber, 1775), détouré : corps et queue séparés (même boîte → ils se superposent exactement)
    'rat_corps': ('poly', 'schreber', (60, 560, 960, 1010), 900, {'color': True, 'edge': 16, 'poly': [(910, 874), (901, 855), (883, 833), (860, 805), (842, 778), (819, 755), (801, 728), (795, 705), (783, 694), (769, 695), (760, 705), (746, 703), (728, 705), (713, 713), (696, 690), (660, 667), (624, 645), (569, 622), (515, 608), (460, 608), (415, 620), (369, 640), (333, 665), (301, 699), (278, 735), (265, 776), (258, 810), (262, 833), (278, 847), (305, 855), (333, 862), (353, 874), (374, 884), (405, 887), (437, 893), (460, 902), (467, 916), (451, 920), (428, 913), (410, 911), (487, 885), (533, 890), (587, 895), (642, 899), (667, 905), (687, 918), (716, 916), (744, 912), (762, 902), (778, 889), (815, 886), (851, 885), (883, 885), (910, 880)], 'bg': (240, 228, 185), 'tol': 30}),
    'rat_queue': ('poly', 'schreber', (60, 560, 960, 1010), 900, {'color': True, 'nogreen': True, 'tube': [(271, 833, 22), (224, 831, 20), (169, 844, 19), (131, 869, 18), (113, 905, 16), (115, 942, 14), (137, 962, 14), (187, 967, 13), (260, 953, 12), (333, 935, 11), (387, 947, 10), (410, 974, 9), (401, 998, 7), (369, 1007, 6), (333, 997, 6), (320, 984, 5)]}),
    'rat_hero': ('carte', 'schreber', (0.04, 0.33, 0.86, 0.66), 880, {'color': True}),
    'cobras': ('carte', 'cobras', (0.05, 0.02, 0.95, 0.98), 500),
    'schnabel': ('carte', 'schnabel', (0.02, 0.02, 0.98, 0.98), 580),
    'schnabel_face': ('carte', 'schnabel', (0.12, 0.05, 0.62, 0.42), 600),
}
run(__file__, 'archive', JOBS)
