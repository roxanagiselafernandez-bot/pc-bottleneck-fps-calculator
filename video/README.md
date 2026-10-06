# Edición de video con Remotion + Claude

Plantillas en código para producir reels verticales (1080×1920, 30 fps) que se venden como servicio. Cada video de cliente es un archivo JSON con sus textos, colores y subtítulos. Claude arma o corrige ese JSON y Remotion renderiza el MP4.

## Plantillas

| Composición | Para qué sirve | Duración |
|---|---|---|
| `PromoReel` | Anuncio del propio servicio o de un producto del cliente: gancho, beneficios numerados, precio y botón de llamada a la acción. | 15 s fijos |
| `ReelSubtitulado` | Video "cabeza parlante" del cliente con subtítulos palabra por palabra (la palabra que se dice se pinta de color), título arriba y barra de progreso. | Se calcula del último subtítulo + 0,5 s |

Todas las props están validadas con zod, así que en Remotion Studio aparecen como formulario editable.

## Uso

```bash
cd video
npm install
npm run studio            # editor visual en el navegador
npm run render:promo      # out/promo.mp4
npm run render:cliente    # out/cliente.mp4 con clientes/ejemplo.json
```

Si Remotion no puede descargar su Chromium (entornos sin red), pasá uno instalado:
`npx remotion render PromoReel out/promo.mp4 --browser-executable=/ruta/a/chrome`

## Flujo por cliente

1. El cliente manda el video crudo. Copialo a `public/` (ej. `public/juan-01.mp4`).
2. Transcribí con marcas de tiempo por palabra. Opción local y gratis: `@remotion/install-whisper-cpp`, que devuelve el mismo formato `{ text, startMs, endMs }` que usa la plantilla.
3. Pedile a Claude: "corregí la ortografía de estos subtítulos, sacá muletillas y armá `clientes/juan-01.json` con título y color de marca". Claude edita el JSON, no el video.
4. Renderizá: `npx remotion render ReelSubtitulado out/juan-01.mp4 --props=./clientes/juan-01.json`
5. Entregá el MP4. Si pide cambios, se edita el JSON y se vuelve a renderizar en menos de un minuto.

`videoSrc` acepta un archivo dentro de `public/` o una URL `https://`. Vacío usa un fondo degradado.

## Antes de cobrar

- **Licencia de Remotion:** es gratis para personas y empresas de hasta 3 empleados. Si crecés más o un cliente empresa quiere usar el código, hace falta la licencia de empresa. Revisá las condiciones vigentes en https://www.remotion.dev/license.
- **Derechos:** la música y las imágenes que agregues tienen que ser libres de derechos o del cliente.
- **Precio:** cobrá por video o por paquete mensual (ej. 8 o 12 reels), no por hora. Con plantillas, tu costo por video baja mucho después del primero de cada cliente.
