"""Télécharge des images de Wikimedia Commons en ne gardant que le domaine public / CC0.
python3 -I scripts/commons.py videos/<id> nom='File:Titre.jpg' nom2='File:…'
→ videos/<id>/img_src/<nom>.jpg + meta.json (titre, licence, auteur, url) pour sources.md"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = {'User-Agent': 'PolymathStudio/1.0 (giacocharles@orange.fr)'}
OK = ('public domain', 'pd', 'cc0', 'no restrictions')


def get(url):
    for k in range(5):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            if '429' in str(e) or k < 4: time.sleep(4 + 6 * k); continue
            raise


vdir = sys.argv[1]
src = os.path.join(vdir, 'img_src'); os.makedirs(src, exist_ok=True)
mp = os.path.join(src, 'meta.json')
meta = json.load(open(mp)) if os.path.exists(mp) else {}
for arg in sys.argv[2:]:
    name, title = arg.split('=', 1)
    q = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280&format=json&titles=' + urllib.parse.quote(title)
    page = list(json.loads(get(q))['query']['pages'].values())[0]
    if 'imageinfo' not in page: print(f'✗ {name} : introuvable ({title})'); continue
    ii = page['imageinfo'][0]; m = ii['extmetadata']
    lic = m.get('LicenseShortName', {}).get('value', '?')
    if not any(lic.lower().startswith(o) or o in lic.lower() for o in OK):
        print(f'✗ {name} : licence {lic} refusée'); continue
    open(os.path.join(src, name + '.jpg'), 'wb').write(get(ii.get('thumburl') or ii['url']))
    artist = m.get('Artist', {}).get('value', '')
    meta[name] = {'title': title, 'license': lic, 'artist': re.sub(r'<[^>]+>', '', artist).strip()[:160], 'url': ii['descriptionurl']}
    print(f'✓ {name} : {lic}')
    time.sleep(1.5)
json.dump(meta, open(mp, 'w'), indent=1, ensure_ascii=False)
