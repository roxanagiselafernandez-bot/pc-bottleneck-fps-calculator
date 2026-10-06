import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

export const promoReelSchema = z.object({
  marca: z.string(),
  gancho: z.string(),
  beneficios: z.array(z.string()).max(5),
  precio: z.string(),
  cta: z.string(),
  colorPrincipal: zColor(),
  colorFondo: zColor(),
});

type Props = z.infer<typeof promoReelSchema>;

const fuente =
  "'Inter', 'Helvetica Neue', Arial, system-ui, -apple-system, sans-serif";

// Entrada con resorte: devuelve opacidad y desplazamiento vertical.
const useEntrada = (retraso = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progreso = spring({ frame: frame - retraso, fps, config: { damping: 14 } });
  return {
    opacity: progreso,
    transform: `translateY(${interpolate(progreso, [0, 1], [60, 0])}px)`,
  };
};

const Gancho: React.FC<Pick<Props, "marca" | "gancho" | "colorPrincipal">> = ({
  marca,
  gancho,
  colorPrincipal,
}) => {
  const marcaEstilo = useEntrada(0);
  const ganchoEstilo = useEntrada(8);
  return (
    <AbsoluteFill style={{ justifyContent: "center", padding: 90, gap: 40 }}>
      <div
        style={{
          ...marcaEstilo,
          color: colorPrincipal,
          fontSize: 54,
          fontWeight: 800,
          letterSpacing: 4,
          textTransform: "uppercase",
        }}
      >
        {marca}
      </div>
      <div style={{ ...ganchoEstilo, color: "white", fontSize: 96, fontWeight: 800, lineHeight: 1.1 }}>
        {gancho}
      </div>
    </AbsoluteFill>
  );
};

const Beneficio: React.FC<{ texto: string; indice: number; color: string }> = ({
  texto,
  indice,
  color,
}) => {
  const estilo = useEntrada(indice * 20);
  return (
    <div style={{ ...estilo, display: "flex", alignItems: "center", gap: 32 }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          background: color,
          color: "white",
          fontSize: 40,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {indice + 1}
      </div>
      <div style={{ color: "white", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{texto}</div>
    </div>
  );
};

const Cierre: React.FC<Pick<Props, "precio" | "cta" | "colorPrincipal">> = ({
  precio,
  cta,
  colorPrincipal,
}) => {
  const frame = useCurrentFrame();
  const precioEstilo = useEntrada(0);
  const ctaEstilo = useEntrada(12);
  // Pulso suave del botón para llamar la atención.
  const escala = 1 + Math.sin(frame / 6) * 0.03;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 90, gap: 70 }}>
      <div style={{ ...precioEstilo, color: "white", fontSize: 88, fontWeight: 800, textAlign: "center" }}>
        {precio}
      </div>
      <div
        style={{
          ...ctaEstilo,
          scale: String(escala),
          background: colorPrincipal,
          color: "white",
          fontSize: 64,
          fontWeight: 800,
          padding: "36px 80px",
          borderRadius: 100,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};

export const PromoReel: React.FC<Props> = ({
  marca,
  gancho,
  beneficios,
  precio,
  cta,
  colorPrincipal,
  colorFondo,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const finGancho = 3 * fps;
  const finBeneficios = 10 * fps;

  return (
    <AbsoluteFill style={{ background: colorFondo, fontFamily: fuente }}>
      <Sequence durationInFrames={finGancho}>
        <Gancho marca={marca} gancho={gancho} colorPrincipal={colorPrincipal} />
      </Sequence>
      <Sequence from={finGancho} durationInFrames={finBeneficios - finGancho}>
        <AbsoluteFill style={{ justifyContent: "center", padding: 90, gap: 56 }}>
          {beneficios.map((b, i) => (
            <Beneficio key={b} texto={b} indice={i} color={colorPrincipal} />
          ))}
        </AbsoluteFill>
      </Sequence>
      <Sequence from={finBeneficios} durationInFrames={durationInFrames - finBeneficios}>
        <Cierre precio={precio} cta={cta} colorPrincipal={colorPrincipal} />
      </Sequence>
    </AbsoluteFill>
  );
};
