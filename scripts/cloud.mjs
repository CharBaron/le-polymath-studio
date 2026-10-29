// Rendu dans le cloud (GitHub Actions, gratuit) au lieu du Mac : node scripts/cloud.mjs videos/<id> [videos/<id2> …] [--draft]
// 1. pousse le code et les fichiers de public/v/<id> (audio, images) en un seul commit ;
// 2. lance un workflow « render » par vidéo (ils tournent en parallèle) ; 3. attend ; 4. télécharge videos/<id>/final.mp4.
// Les étapes parse → audio restent sur le Mac ; ou tout d'un coup : `npm run video -- videos/<id> --cloud`.
import {execFileSync, spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const GH = process.env.GH || path.join(os.homedir(), 'bin', 'gh');
const draft = process.argv.includes('--draft');
const vdirs = process.argv.slice(2).filter((a) => !a.startsWith('--')).map((a) => path.resolve(a));
const index = fs.readFileSync(path.join(ROOT, 'src/videos/index.ts'), 'utf8');
const sh = (cmd, args, quiet) => execFileSync(cmd, args, {cwd: ROOT, encoding: 'utf8', stdio: quiet ? 'pipe' : 'inherit'});
const lastRun = () => sh(GH, ['run', 'list', '--workflow', 'render.yml', '-L', '1', '--json', 'databaseId', '-q', '.[0].databaseId'], true).trim();
const t0 = Date.now();

sh('git', ['add', '-A']);
if (sh('git', ['status', '--porcelain'], true).trim()) sh('git', ['commit', '-q', '-m', `rendu ${vdirs.map((v) => path.basename(v)).join(', ')}`]);
sh('git', ['push', '-q', 'origin', 'main']);

// lancement un par un (pour récupérer l'identifiant de chaque run), puis attente en parallèle
const jobs = [];
for (const vdir of vdirs) {
  const id = path.basename(vdir);
  const compId = index.includes(`'${id}'`) ? id : 'kit';
  const before = lastRun();
  sh(GH, ['workflow', 'run', 'render.yml', '-f', `id=${id}`, '-f', `comp=${compId}`, '-f', `draft=${draft}`]);
  let run = before;
  for (let k = 0; k < 30 && run === before; k++) { execFileSync('sleep', ['2']); run = lastRun(); }
  console.log(`☁ ${id} : run ${run}`);
  jobs.push({id, vdir, run});
}
const wait = ({id, vdir, run}) => new Promise((res, rej) => {
  const p = spawn(GH, ['run', 'watch', run, '--exit-status', '--interval', '20'], {cwd: ROOT, stdio: 'ignore'});
  p.on('exit', (code) => {
    if (code) return rej(new Error(`${id} : le rendu a échoué (gh run view ${run} --log-failed)`));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'render-'));
    sh(GH, ['run', 'download', run, '-n', 'final', '-D', tmp], true);
    const out = path.join(vdir, draft ? 'draft.mp4' : 'final.mp4');
    fs.copyFileSync(path.join(tmp, 'final.mp4'), out);
    fs.rmSync(tmp, {recursive: true, force: true});
    console.log(`✔ ${path.relative(ROOT, out)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    res();
  });
});
const results = await Promise.allSettled(jobs.map(wait));
for (const r of results) if (r.status === 'rejected') console.error('✘', r.reason.message);
process.exit(results.some((r) => r.status === 'rejected') ? 1 : 0);
