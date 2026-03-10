import { useState } from "react";
import { Wind, Droplets, Thermometer, Sun, Leaf, Activity } from "lucide-react";

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
    x: 45,
    y: 25,
  },
  {
    id: "cabeza",
    label: "PREDICCIÓN",
    description: "Modelos de IA y pronósticos",
    icon: <Thermometer className="w-4 h-4" />,
    items: ["Nowcasting", "Predicción 24h", "Modelos ML/DL"],
    x: 78,
    y: 52,
  },
  {
    id: "patas-delanteras",
    label: "CLIMA",
    description: "Datos meteorológicos en tiempo real",
    icon: <Wind className="w-4 h-4" />,
    items: ["Estaciones", "Viento", "Presión"],
    x: 70,
    y: 78,
  },
  {
    id: "patas-traseras",
    label: "HIDROLOGÍA",
    description: "Precipitación y humedad del suelo",
    icon: <Droplets className="w-4 h-4" />,
    items: ["Precipitación", "Humedad suelo", "Nivel freático"],
    x: 22,
    y: 78,
  },
  {
    id: "cola",
    label: "RADIACIÓN",
    description: "Radiación solar y UV",
    icon: <Sun className="w-4 h-4" />,
    items: ["Índice UV", "Radiación solar", "Horas sol"],
    x: 12,
    y: 50,
  },
  {
    id: "vientre",
    label: "ECOSISTEMA",
    description: "Biodiversidad y conservación",
    icon: <Leaf className="w-4 h-4" />,
    items: ["Flora", "Fauna endémica", "Conservación"],
    x: 45,
    y: 62,
  },
];

const TortoiseSilhouette = () => {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const active = zones.find((z) => z.id === activeZone);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Tortoise SVG silhouette - architectural line drawing */}
      <svg
        viewBox="0 0 800 500"
        className="w-full max-w-4xl h-auto"
        style={{ animation: "silhouette-breathe 8s ease-in-out infinite", filter: "drop-shadow(0 0 2px hsla(165,100%,47%,0.1))" }}
      >
        {/* Main shell outline */}
        <path
          d="M400,80 C480,60 580,80 620,140 C660,200 660,260 640,300 C620,340 560,370 500,380 C440,370 380,370 320,380 C260,370 200,340 160,300 C140,260 140,200 180,140 C220,80 320,60 400,80 Z"
          fill="none"
          stroke="hsl(216,14%,95%)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Shell segments */}
        <path d="M400,80 L400,380" fill="none" stroke="hsl(216,14%,95%)" strokeWidth="0.5" opacity="0.3" />
        <path d="M280,120 L320,380" fill="none" stroke="hsl(216,14%,95%)" strokeWidth="0.5" opacity="0.3" />
        <path d="M520,120 L480,380" fill="none" stroke="hsl(216,14%,95%)" strokeWidth="0.5" opacity="0.3" />
        <path d="M180,200 L620,200" fill="none" stroke="hsl(216,14%,95%)" strokeWidth="0.5" opacity="0.3" />
        <path d="M160,280 L640,280" fill="none" stroke="hsl(216,14%,95%)" strokeWidth="0.5" opacity="0.3" />

        {/* Head */}
        <path
          d="M620,220 C650,210 700,200 720,210 C740,220 740,240 720,250 C700,260 650,250 620,240"
          fill="none"
          stroke="hsl(216,14%,95%)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Eye */}
        <circle cx="710" cy="222" r="3" fill="hsl(165,100%,47%)" opacity="0.8" />

        {/* Front legs */}
        <path
          d="M580,350 C600,370 620,400 610,420 C600,440 580,440 570,420 C560,400 560,380 560,360"
          fill="none"
          stroke="hsl(216,14%,95%)"
          strokeWidth="1.2"
          opacity="0.5"
        />
        {/* Rear legs */}
        <path
          d="M220,350 C200,370 180,400 190,420 C200,440 220,440 230,420 C240,400 240,380 240,360"
          fill="none"
          stroke="hsl(216,14%,95%)"
          strokeWidth="1.2"
          opacity="0.5"
        />
        {/* Tail */}
        <path
          d="M160,280 C130,290 100,280 90,260"
          fill="none"
          stroke="hsl(216,14%,95%)"
          strokeWidth="1.2"
          opacity="0.5"
        />
      </svg>

      {/* Interactive zones */}
      {zones.map((zone) => (
        <button
          key={zone.id}
          className="absolute group cursor-pointer"
          style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: "translate(-50%, -50%)" }}
          onMouseEnter={() => setActiveZone(zone.id)}
          onMouseLeave={() => setActiveZone(null)}
          onClick={() => setActiveZone(activeZone === zone.id ? null : zone.id)}
        >
          {/* Pulse indicator */}
          <span className="block w-3 h-3 rounded-full bg-bioluminescent animate-pulse-glow" />

          {/* Tooltip */}
          <div
            className={`absolute z-20 transition-all duration-300 ${
              activeZone === zone.id
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
