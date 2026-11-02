"""Planche contact des captures d'une maquette, pour la relecture humaine des sections.
python3 outils/planche.py <depot> <sortie.jpg> [p1440|m390] [colonnes]
"""
import json, os, sys
from PIL import Image, ImageDraw

racine = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
depot, sortie = sys.argv[1], sys.argv[2]
fmt = sys.argv[3] if len(sys.argv) > 3 else 'p1440'
cols = int(sys.argv[4]) if len(sys.argv) > 4 else (4 if fmt == 'p1440' else 8)
inv = json.load(open(os.path.join(racine, 'inventaire', depot + '.json')))
cle = 'capture' if fmt == 'p1440' else 'capture_m390'
items = [(b['id'], b['medias'][cle]) for b in inv['blocs'] if b['medias'].get(cle)]
w = 480 if fmt == 'p1440' else 195
h = 300 if fmt == 'p1440' else 422
rows = (len(items) + cols - 1) // cols
planche = Image.new('RGB', (cols * w, rows * (h + 18)), 'white')
d = ImageDraw.Draw(planche)
for i, (id_, chemin) in enumerate(items):
    x, y = (i % cols) * w, (i // cols) * (h + 18)
    try:
        im = Image.open(os.path.join(racine, chemin)).convert('RGB').resize((w, h))
        planche.paste(im, (x, y + 18))
    except Exception:
        pass
    d.text((x + 4, y + 3), id_[:60], fill='black')
planche.save(sortie, quality=78)
print(len(items), 'captures', planche.size)
