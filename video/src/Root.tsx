import { Composition } from "remotion";
import { PromoReel, promoReelSchema } from "./PromoReel";
import {
  ReelSubtitulado,
  reelSubtituladoSchema,
  calcularDuracionReel,
} from "./ReelSubtitulado";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromoReel"
        component={PromoReel}
        schema={promoReelSchema}
        durationInFrames={15 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          marca: "Estudio Reels",
          gancho: "¿Grabás videos y no tenés tiempo de editarlos?",
          beneficios: [
            "Subtítulos animados en 24 h",
            "Cortes, zooms y música",
            "Formato listo para Reels y TikTok",
          ],
          precio: "Desde USD 15 por video",
          cta: "Escribime por DM",
          colorPrincipal: "#ff4d6d",
          colorFondo: "#0f0f14",
        }}
      />
      <Composition
        id="ReelSubtitulado"
        component={ReelSubtitulado}
        schema={reelSubtituladoSchema}
        calculateMetadata={calcularDuracionReel}
        durationInFrames={10 * FPS}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          videoSrc: "",
          titulo: "3 errores al armar tu PC",
          colorResaltado: "#ffd60a",
          palabrasPorBloque: 3,
          subtitulos: [
            { text: "El", startMs: 0, endMs: 300 },
            { text: "primer", startMs: 300, endMs: 650 },
            { text: "error", startMs: 650, endMs: 1100 },
            { text: "es", startMs: 1100, endMs: 1300 },
            { text: "comprar", startMs: 1300, endMs: 1750 },
            { text: "una", startMs: 1750, endMs: 1950 },
            { text: "GPU", startMs: 1950, endMs: 2500 },
            { text: "demasiado", startMs: 2500, endMs: 3000 },
            { text: "potente", startMs: 3000, endMs: 3600 },
            { text: "para", startMs: 3600, endMs: 3850 },
            { text: "tu", startMs: 3850, endMs: 4050 },
            { text: "procesador.", startMs: 4050, endMs: 4800 },
            { text: "Eso", startMs: 5200, endMs: 5500 },
            { text: "se", startMs: 5500, endMs: 5650 },
            { text: "llama", startMs: 5650, endMs: 6000 },
            { text: "cuello", startMs: 6000, endMs: 6400 },
            { text: "de", startMs: 6400, endMs: 6550 },
            { text: "botella.", startMs: 6550, endMs: 7300 },
          ],
        }}
      />
    </>
  );
};
