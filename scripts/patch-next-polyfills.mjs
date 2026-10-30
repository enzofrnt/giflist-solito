// Next 16 ships a legacy polyfill bundle from app-globals/client, even when
// browserslist targets modern browsers. The app targets modern browsers
// (Chrome/Edge/Firefox 111+, Safari 16.4+), so the polyfills are dead weight.
// Remove only the two internal imports; patch-package does not support Bun.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const files = [
  path.join(root, 'node_modules/next/dist/client/app-globals.js'),
  path.join(root, 'node_modules/next/dist/client/index.js'),
]
const needle = 'require("../build/polyfills/polyfill-module");'
let changed = 0

for (const file of files) {
  if (!existsSync(file)) continue
  const source = readFileSync(file, 'utf8')
  if (!source.includes(needle)) continue
  writeFileSync(file, source.replaceAll(needle, ''))
  changed++
}

if (changed > 0) console.log(`Patched Next legacy polyfill imports (${changed} files)`)
