# PC Bottleneck & FPS Calculator

Calculadora de cuello de botella CPU/GPU y estimación de FPS, con un catálogo de hardware **real** (no matemática sintética inventada):

- Cada CPU/GPU tiene un **score relativo 0-100 calibrado por resolución** (1080p/1440p, y 1080p/1440p/4K para GPU), en vez de una curva genérica de "caída por resolución".
- **TDP real** de CPU y GPU para calcular consumo y PSU recomendada (no una fórmula heurística).
- **VRAM real** de ficha técnica por GPU, con alertas configurables (`validation_rules`).
- Catálogo real de **RAM** (capacidad, velocidad, tipo DDR4/DDR5) y **almacenamiento** (HDD/SATA SSD/NVMe) con precio de referencia en USD.

## Archivos

- `PC Bottleneck FPS Calculator.dc.html` — la app (HTML/CSS/JS autocontenido, formato Claude Design `.dc.html`).
- `support.js` — runtime del formato `.dc.html` (generado, no editar a mano).
- `hardware.json` — catálogo completo (cpus, gpus, ram, storage, validation_rules). La app lo descarga en cada carga (`fetch`), con fallback a los datos embebidos en el HTML si la red falla.
- `scripts/update-hardware.mjs` — valida la integridad del catálogo (ids únicos, scores en rango, specs presentes) y actualiza `last_updated`. Corre semanalmente vía GitHub Actions.
- `.github/workflows/update-hardware.yml` — corre el script todos los lunes y commitea los cambios automáticamente.

## Metodología y limitaciones (leer antes de confiar ciegamente en los números)

- Los `score_1080p` / `score_1440p` / `score_4k` son **estimaciones relativas curadas**, no un promedio automático de miles de benchmarks en vivo. Son una guía orientativa para comparar hardware entre sí, no una promesa de FPS exactos en cada juego.
- El job semanal **valida la estructura de `hardware.json`** (nada corrupto, sin ids duplicados, specs coherentes) y refresca la fecha — no re-calcula los scores automáticamente, porque no existe hoy una fuente pública única que dé "score gaming 0-100 por resolución" para cada pieza en este formato exacto. Si en algún momento se define una fuente de precios/rendimiento en vivo (una API de precios, un feed propio, etc.), ese fetch se agrega en `scripts/update-hardware.mjs` antes de la validación.
- Agregar hardware nuevo: sumá una entrada al array correspondiente en `hardware.json` (con `id` único) — la app la toma automáticamente en la próxima carga, sin tocar el código.
