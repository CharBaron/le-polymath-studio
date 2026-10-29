// Exporte les plans d'une vidéo Gravure pour la bande-son : node scripts/shots.mjs videos/<id> src/videos/<X>.shots.ts
// → videos/<id>/build/shots.json : [{t0, t1, tr, jumps, stampAt, slamAt, strobe: [instants des chiffres], land}]
import {build} from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const [vdir, mod] = process.argv.slice(2);
const id = path.basename(vdir);
fs.mkdirSync(path.join(vdir, 'build'), {recursive: true});
const bundle = path.join(vdir, 'build', 'shots.bundle.mjs');
await build({
  stdin: {contents: `export {shotsOf} from ${JSON.stringify(path.resolve(mod))};\nexport * from ${JSON.stringify(path.resolve('src/gravure/shots.ts'))};`, resolveDir: process.cwd(), loader: 'ts'},
  bundle: true, format: 'esm', platform: 'node', outfile: bundle, logLevel: 'error',
});
const m = await import(pathToFileURL(path.resolve(bundle)).href + `?t=${Date.now()}`), lib = m;
const tl = JSON.parse(fs.readFileSync(path.join('public', 'v', id, 'timeline.json'), 'utf8'));
const words = JSON.parse(fs.readFileSync(path.join('public', 'v', id, 'captions.json'), 'utf8'));
const shots = m.shotsOf(tl.beats, words, tl.duration);
const rows = shots.map((s, k) => {
  const t1 = shots[k + 1]?.t0 ?? tl.duration;
  const sl = lib.strobeLen(s);
  return {
    t0: s.t0, t1, tr: k ? s.tr ?? 'blur' : null, bg: s.bg ?? 'marble', jumps: lib.jumpsOf(s, t1, words),
    stampAt: s.stamp ? s.stamp.at : null, slamAt: s.slam ? s.t0 + (s.slam.at ?? 0.04) : null,
    strobe: sl ? lib.strobeDigits(s.num.text).map((_, i) => s.t0 + i * lib.STROBE_EVERY) : [],
    num: s.num ? {land: s.t0 + sl + 0.04, digits: lib.strobeDigits(s.num.text).length} : null,
    pops: (s.pics ?? []).map((q) => s.t0 + q.at), lines: s.lines ?? null, card: lib.textCard(s), rays: s.rays ?? null, anim: s.anim ?? null,
  };
});
fs.writeFileSync(path.join(vdir, 'build', 'shots.json'), JSON.stringify(rows, null, 1));
fs.rmSync(bundle, {force: true});
console.log(`shots: ${rows.length} plans, ${rows.reduce((a, r) => a + r.jumps.length, 0)} jump-cuts → ${vdir}/build/shots.json`);
