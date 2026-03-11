import { useState } from "react";
import { Wind, Droplets, Thermometer, Sun, Leaf, Activity } from "lucide-react";
import fondoImg from "@/assets/fondo.png";

interface HabitatZone {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  items: string[];
  // SVG path area (percentage based)
  x: number;
  y: number;
}

const zones: HabitatZone[] = [
  {
    id: "caparazon",
    label: "PROTECCIÓN",
    description: "Alertas y seguridad ambiental",
    icon: <Activity className="w-4 h-4" />,
    items: ["Alertas tempranas", "Eventos extremos", "Defensa Civil"],
    x: 48, // Above shell
    y: 10,
  },
  {
    id: "cabeza",
    label: "PREDICCIÓN",
    description: "Modelos de IA y pronósticos",
    icon: <Thermometer className="w-4 h-4" />,
    items: ["Nowcasting", "Predicción 24h", "Modelos ML/DL"],
    x: 95, // Right of head
    y: 35,
  },
  {
    id: "patas-delanteras",
    label: "CLIMA",
    description: "Datos meteorológicos en tiempo real",
    icon: <Wind className="w-4 h-4" />,
    items: ["Estaciones", "Viento", "Presión"],
    x: 88, // Right/Bottom of front legs
    y: 85,
  },
  {
    id: "patas-traseras",
    label: "HIDROLOGÍA",
    description: "Precipitación y humedad del suelo",
    icon: <Droplets className="w-4 h-4" />,
    items: ["Precipitación", "Humedad suelo", "Nivel freático"],
    x: 5,  // Left/Bottom of back legs
    y: 85,
  },
  {
    id: "cola",
    label: "RADIACIÓN",
    description: "Radiación solar y UV",
    icon: <Sun className="w-4 h-4" />,
    items: ["Índice UV", "Radiación solar", "Horas sol"],
    x: 5,  // Left of tail
    y: 50,
  },
  {
    id: "vientre",
    label: "ECOSISTEMA",
    description: "Biodiversidad y conservación",
    icon: <Leaf className="w-4 h-4" />,
    items: ["Flora", "Fauna endémica", "Conservación"],
    x: 45, // Bottom below belly
    y: 95,
  },
];

const TortoiseSilhouette = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const active = zones.find((z) => z.id === activeZone);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Galapagos background image */}
      <img
        src={fondoImg}
        alt="Fondo Galápagos"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-40 pointer-events-none z-0"
      />

      {/* Interactive zones */}
      {zones.map((zone) => (
        <button
          key={zone.id}
          className="absolute group cursor-pointer z-10"
          style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setActiveZone(zone.id)}
          onMouseLeave={() => setActiveZone(null)}
          onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
        >
          {/* Pulse indicator */}
          <span className="block w-3 h-3 rounded-full bg-bioluminescent animate-pulse-glow" />

          {/* Tooltip */}
          <div
            className={`absolute z-20 transition-all duration-300 ${activeZone === zone.id
              ? "opacity-100 scale-100 pointer-events-auto"
              : "opacity-0 scale-95 pointer-events-none"
              }`}
            style={{
              left: zone.x > 50 ? "auto" : "24px",
              right: zone.x > 50 ? "24px" : "auto",
              top: zone.y > 60 ? "auto" : "0",
              bottom: zone.y > 60 ? "24px" : "auto",
              minWidth: "200px",
            }}
          >
            <div className="bg-background/90 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-bioluminescent">{zone.icon}</span>
                <h3 className="font-display text-sm text-foreground tracking-widest">{zone.label}</h3>
              </div>
              <p className="font-body text-xs text-sand mb-3">{zone.description}</p>
              <ul className="space-y-1">
                {zone.items.map((item) => (
                  <li key={item} className="font-body text-xs text-foreground/70 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-bioluminescent inline-block" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </button>
      ))}

      {/* Bottom info bar */}
      {active && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center transition-all duration-500">
          <p className="font-display text-xs text-sand tracking-[0.2em]">
            EXPLORANDO · {active.label}
          </p>
        </div>
      )}
    </div>
  );
};

export default TortoiseSilhouette;
