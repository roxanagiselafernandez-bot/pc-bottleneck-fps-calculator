// Corre semanalmente vía .github/workflows/update-hardware.yml.
//
// hardware.json usa un esquema curado (score_1080p/1440p/4k relativos 0-100, tdp_watts y
// price_usd reales) en vez de un número scrapeable 1:1 de una página pública. Por eso este
// script NO inventa números: valida la integridad del catálogo (ids únicos, scores en rango,
// specs presentes) y sólo si todo es válido actualiza `last_updated`. Si el equipo agrega una
// fuente de precios/scores en vivo más adelante, ese fetch va acá, antes de la validación final.

import { readFile, writeFile } from 'node:fs/promises';

const HARDWARE_JSON_PATH = new URL('../hardware.json', import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateCpu(c) {
  assert(typeof c.id === 'string' && c.id, `CPU sin id válido: ${JSON.stringify(c)}`);
  assert(typeof c.name === 'string' && c.name, `CPU sin name válido: ${c.id}`);
  assert(Number.isFinite(c.score_1080p) && c.score_1080p > 0 && c.score_1080p <= 100, `CPU ${c.id}: score_1080p fuera de rango`);
  assert(Number.isFinite(c.score_1440p) && c.score_1440p > 0 && c.score_1440p <= 100, `CPU ${c.id}: score_1440p fuera de rango`);
  assert(Number.isFinite(c.tdp_watts) && c.tdp_watts > 0, `CPU ${c.id}: tdp_watts inválido`);
  assert(Number.isFinite(c.price_usd) && c.price_usd > 0, `CPU ${c.id}: price_usd inválido`);
}

function validateGpu(g) {
  assert(typeof g.id === 'string' && g.id, `GPU sin id válido: ${JSON.stringify(g)}`);
  assert(typeof g.name === 'string' && g.name, `GPU sin name válido: ${g.id}`);
  assert(Number.isFinite(g.vram_gb) && g.vram_gb > 0, `GPU ${g.id}: vram_gb inválido`);
  for (const key of ['score_1080p', 'score_1440p', 'score_4k']) {
    assert(Number.isFinite(g[key]) && g[key] > 0 && g[key] <= 100, `GPU ${g.id}: ${key} fuera de rango`);
  }
  assert(Number.isFinite(g.tdp_watts) && g.tdp_watts > 0, `GPU ${g.id}: tdp_watts inválido`);
  assert(Number.isFinite(g.price_usd) && g.price_usd > 0, `GPU ${g.id}: price_usd inválido`);
}

function assertUniqueIds(list, label) {
  const seen = new Set();
  for (const item of list) {
    assert(!seen.has(item.id), `${label}: id duplicado "${item.id}"`);
    seen.add(item.id);
  }
}

async function main() {
  const raw = await readFile(HARDWARE_JSON_PATH, 'utf8');
  const data = JSON.parse(raw);

  assert(Array.isArray(data.cpus) && data.cpus.length, 'hardware.json: falta el array "cpus"');
  assert(Array.isArray(data.gpus) && data.gpus.length, 'hardware.json: falta el array "gpus"');
  assert(Array.isArray(data.ram) && data.ram.length, 'hardware.json: falta el array "ram"');
  assert(Array.isArray(data.storage) && data.storage.length, 'hardware.json: falta el array "storage"');
  assert(data.validation_rules && typeof data.validation_rules === 'object', 'hardware.json: falta "validation_rules"');

  data.cpus.forEach(validateCpu);
  data.gpus.forEach(validateGpu);
  assertUniqueIds(data.cpus, 'cpus');
  assertUniqueIds(data.gpus, 'gpus');
  assertUniqueIds(data.ram, 'ram');
  assertUniqueIds(data.storage, 'storage');

  data.last_updated = new Date().toISOString().slice(0, 10);

  await writeFile(HARDWARE_JSON_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`[update-hardware] hardware.json válido. last_updated -> ${data.last_updated}`);
}

main().catch((e) => {
  console.error('[update-hardware] validación fallida, NO se modifica hardware.json:', e.message);
  process.exit(1);
});
