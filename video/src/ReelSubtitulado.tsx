import {
  AbsoluteFill,
  CalculateMetadataFunction,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Mismo formato que Caption de @remotion/captions, así sirve la salida de Whisper.
const palabraSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
});

export const reelSubtituladoSchema = z.object({
  // Vacío = fondo degradado. Ruta dentro de public/ (ej. "cliente.mp4") o URL https.
  videoSrc: z.string(),
  titulo: z.string(),
  colorResaltado: zColor(),
  palabrasPorBloque: z.number().int().min(1).max(6),
  subtitulos: z.array(palabraSchema),
});

type Props = z.infer<typeof reelSubtituladoSchema>;
type Palabra = z.infer<typeof palabraSchema>;

const fuente =
  "'Inter', 'Helvetica Neue', Arial, system-ui, -apple-system, sans-serif";

// La duración sale del último subtítulo + medio segundo de aire.
export const calcularDuracionReel: CalculateMetadataFunction<Props> = ({ props }) => {
  const fps = 30;
  const finMs = Math.max(1000, ...props.subtitulos.map((p) => p.endMs));
  return { durationInFrames: Math.ceil((finMs / 1000 + 0.5) * fps), fps };
};

const agruparEnBloques = (palabras: Palabra[], tamano: number): Palabra[][] => {
  const bloques: Palabra[][] = [];
  for (let i = 0; i < palabras.length; i += tamano) {
    bloques.push(palabras.slice(i, i + tamano));
  }
  return bloques;
};

const resolverSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

const Subtitulos: React.FC<Pick<Props, "subtitulos" | "palabrasPorBloque" | "colorResaltado">> = ({
  subtitulos,
  palabrasPorBloque,
  colorResaltado,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;

  const bloques = agruparEnBloques(subtitulos, palabrasPorBloque);
  const bloque = bloques.find((b) => ms >= b[0].startMs && ms < b[b.length - 1].endMs);
  if (!bloque) return null;

  const inicioBloque = Math.round((bloque[0].startMs / 1000) * fps);
  const entrada = spring({ frame: frame - inicioBloque, fps, config: { damping: 12 }, durationInFrames: 8 });

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 520 }}>
      <div
        style={{
          scale: String(interpolate(entrada, [0, 1], [0.85, 1])),
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 22px",
          padding: "0 70px",
        }}
      >
        {bloque.map((p) => {
          const activa = ms >= p.startMs && ms < p.endMs;
          return (
            <span
              key={`${p.startMs}-${p.text}`}
              style={{
                fontSize: 92,
                fontWeight: 900,
                textTransform: "uppercase",
                color: activa ? colorResaltado : "white",
                WebkitTextStroke: "4px black",
                paintOrder: "stroke",
                textShadow: "0 8px 24px rgba(0,0,0,0.6)",
              }}
            >
              {p.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const ReelSubtitulado: React.FC<Props> = ({
  videoSrc,
  titulo,
  colorResaltado,
  palabrasPorBloque,
  subtitulos,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progreso = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ fontFamily: fuente, background: "black" }}>
      {videoSrc ? (
        <OffthreadVideo src={resolverSrc(videoSrc)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <AbsoluteFill
          style={{
            background: `linear-gradient(${160 + progreso * 40}deg, #1b1b2f 0%, #3a0ca3 55%, #7209b7 100%)`,
          }}
        />
      )}

      {titulo ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 200 }}>
          <div
            style={{
              background: "white",
              color: "black",
              fontSize: 56,
              fontWeight: 800,
              padding: "18px 40px",
              borderRadius: 18,
              maxWidth: 900,
              textAlign: "center",
            }}
          >
            {titulo}
          </div>
        </AbsoluteFill>
      ) : null}

      <Subtitulos subtitulos={subtitulos} palabrasPorBloque={palabrasPorBloque} colorResaltado={colorResaltado} />

      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          height: 14,
          width: `${progreso * 100}%`,
          background: colorResaltado,
        }}
      />
    </AbsoluteFill>
  );
};
