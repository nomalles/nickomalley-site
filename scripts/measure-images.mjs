#!/usr/bin/env node
/**
 * Walk a folder of project images and print Media-shaped entries with
 * width/height filled in, ready to paste into lib/projects.ts.
 *
 * Usage:
 *   node scripts/measure-images.mjs public/projects/<slug>/phase-01
 *
 * Uses macOS's `sips` to read pixel dimensions — avoids adding any image
 * library to the dependency tree. If you're not on macOS, swap the call
 * for `identify` (ImageMagick) or `image-size` (npm).
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { extname, join, posix } from 'node:path';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif']);

function dims(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], {
    encoding: 'utf8',
  });
  const w = /pixelWidth:\s*(\d+)/.exec(out)?.[1];
  const h = /pixelHeight:\s*(\d+)/.exec(out)?.[1];
  if (!w || !h) throw new Error(`could not read dims for ${file}`);
  return { width: Number(w), height: Number(h) };
}

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/measure-images.mjs <folder>');
  process.exit(1);
}

const files = readdirSync(dir)
  .filter((f) => !f.startsWith('.') && IMAGE_EXTS.has(extname(f).toLowerCase()))
  .filter((f) => statSync(join(dir, f)).isFile())
  .sort();

if (!files.length) {
  console.error(`no images found in ${dir}`);
  process.exit(1);
}

// Convert filesystem path under `public/` to the public URL prefix.
const idx = dir.indexOf('public/');
const urlBase = idx >= 0 ? '/' + posix.normalize(dir.slice(idx + 'public/'.length)) : dir;

console.log('images: [');
for (const f of files) {
  const { width, height } = dims(join(dir, f));
  console.log(
    `  { kind: 'image', src: '${urlBase}/${f}', width: ${width}, height: ${height} },`
  );
}
console.log('],');
