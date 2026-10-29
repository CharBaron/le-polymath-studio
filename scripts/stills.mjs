#!/usr/bin/env node
// Relecture rapide sur images fixes (sans rendre la vidéo).
//   npm run stills -- videos/<dossier>                 une image 0,9 s après chaque balise de timeline.json
//   npm run stills -- videos/<dossier> 3.2 10 18.5     instants précis (en s)
// Options : --offset 0.9  --size 300 (largeur d'une vignette)  --cols 6
// Sortie : out/stills/<dossier>-N.png (planches) — un seul empaquetage Remotion, ~2-4 s par image.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n, d) => {
  const i = argv.indexOf(`--${n}`);
  if (i === -1) return d;
  const v = argv[i + 1];
  argv.splice(i, 2);
  return v;
};
const offset = Number(opt('offset', '0.9'));
const size = Number(opt('size', '300'));
const cols = Number(opt('cols', '6'));
const dir = argv.shift();
if (!dir) {
  console.error('usage : npm run stills -- videos/<dossier> [instants…]');
  process.exit(1);
}
const id = path.basename(dir);
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/v', id, 'timeline.json'), 'utf8'));
let times = argv.map(Number);
if (!times.length) times = [0, ...[...new Set(Object.values(tl.beats))].sort((a, b) => a - b).map((t) => Math.min(tl.duration - 0.1, t + offset))];
const frames = [...new Set(times.map((t) => Math.round(t * tl.fps)))].sort((a, b) => a - b);

const tmp = path.join(ROOT, 'out/stills/tmp-' + id);
fs.rmSync(tmp, {recursive: true, force: true});
fs.mkdirSync(tmp, {recursive: true});
const t0 = Date.now();
const serveUrl = await bundle({entryPoint: path.join(ROOT, 'src/index.ts'), publicDir: path.join(ROOT, 'public')});
const inputProps = {id};
const compId = fs.readFileSync(path.join(ROOT, 'src/videos/index.ts'), 'utf8').includes(`'${id}'`) ? id : 'kit';
const composition = await selectComposition({serveUrl, id: compId, inputProps});
for (const [i, frame] of frames.entries()) {
  await renderStill({composition, serveUrl, inputProps, frame, output: path.join(tmp, `${String(i).padStart(3, '0')}.jpg`), imageFormat: 'jpeg', jpegQuality: 70, scale: size / 1080});
}
// planches : `cols` vignettes par ligne, 2 lignes par planche
const per = cols * 2;
const files = fs.readdirSync(tmp).filter((f) => f.endsWith('.jpg')).sort();
fs.mkdirSync(path.join(ROOT, 'out/stills'), {recursive: true});
const outs = [];
for (let s = 0; s * per < files.length; s++) {
  const part = files.slice(s * per, (s + 1) * per);
  const out = path.join(ROOT, 'out/stills', `${id}-${s + 1}.png`);
  const inputs = part.flatMap((f) => ['-i', path.join(tmp, f)]);
  const n = part.length;
  const c = Math.min(cols, n);
  const layout = part.map((_, k) => `${(k % c) * size}_${Math.floor(k / c) * Math.round((size * 16) / 9)}`).join('|');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', n > 1 ? `xstack=inputs=${n}:layout=${layout}:fill=0x333333` : 'null', out]);
  outs.push(out);
}
console.log(`${frames.length} images (${frames.map((f) => (f / tl.fps).toFixed(1)).join(' ')} s) en ${((Date.now() - t0) / 1000).toFixed(0)} s`);
outs.forEach((o) => console.log('  ' + path.relative(ROOT, o)));
