import { Anchor, Leaf, Shield, AlertTriangle, Compass } from "lucide-react";

export interface Vertical {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  users: string;
  features: string[];
}

export const verticals: Vertical[] = [
  {
    id: "pesca",
    name: "PESCASEGURA",
    label: "Pesca",
    icon: <Anchor className="w-4 h-4" />,
    description: "Asistente inteligente para pescadores artesanales",
    color: "#00f0c8",
    users: "~1,200 pescadores artesanales",
    features: [
      "Índice de Pesca del Día (0-100)",
      "Ventanas óptimas de pesca 24-48h",
      "Alertas de tormenta en tiempo real",
      "Historial de condiciones por zona",
      "Planificación semanal",
    ],
  },
  {
    id: "agro",
    name: "AGROGALÁPAGOS",
    label: "Agricultura",
    icon: <Leaf className="w-4 h-4" />,
    description: "Calendario inteligente de cultivos",
    color: "#4CAF50",
    users: "~500 productores agrícolas",
    features: [
      "Calendario de siembra adaptativo",
      "Alertas de riego inteligente",
      "Alertas de helada/calor extremo",
      "Monitoreo de humedad foliar",
      "Historial por finca",
    ],
  },
  {
    id: "bio",
    name: "BIOGUARD",
    label: "Conservación",
    icon: <Shield className="w-4 h-4" />,
    description: "Protección de fauna y flora endémica",
    color: "#FF9800",
    users: "Parque Nacional · FCD · Conservacionistas",
    features: [
      "Alertas de protección de nidos",
      "Mapa de riesgo por especies",
      "Monitoreo de especies invasoras",
      "Índice de bienestar de fauna",
      "Reportes automáticos institucionales",
    ],
  },
  {
    id: "risk",
    name: "RISKWATCH",
    label: "Riesgos",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "Análisis por zonas y gestión de desastres",
    color: "#f44336",
    users: "Defensa Civil · COE · Municipio",
    features: [
      "Mapa de riesgo en tiempo real",
      "Alertas escalonadas (4 niveles)",
      "Simulación de escenarios",
      "Dashboard de toma de decisiones",
      "Análisis post-evento",
    ],
  },
  {
    id: "turismo",
    name: "VISITGALÁPAGOS",
    label: "Turismo",
    icon: <Compass className="w-4 h-4" />,
    description: "Planificador turístico inteligente",
    color: "#2196F3",
    users: "Turistas · Operadores turísticos",
    features: [
      "Planificador de actividades por clima",
      "Recomendaciones fotográficas",
      "Avistamiento de fauna estacional",
      "Alertas para operadores",
    ],
  },
];

const VerticalCard = ({
  vertical,
  isActive,
  onClick,
}: {
  vertical: Vertical;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full p-4 transition-all duration-300 ${
        isActive
          ? "bg-muted/40 border-l-2"
          : "bg-transparent border-l-2 border-transparent hover:bg-muted/20"
      }`}
      style={{ borderLeftColor: isActive ? vertical.color : "transparent" }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: vertical.color }}>{vertical.icon}</span>
        <span className="font-display text-[10px] text-foreground tracking-[0.12em]">
          {vertical.name}
        </span>
      </div>
      <p className="font-body text-[9px] text-sand">{vertical.description}</p>
    </button>
  );
};

const VerticalDetail = ({ vertical }: { vertical: Vertical }) => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <span style={{ color: vertical.color }}>{vertical.icon}</span>
        <div>
          <h2 className="font-display text-sm text-foreground tracking-[0.15em]">{vertical.name}</h2>
          <p className="font-body text-[10px] text-sand">{vertical.users}</p>
        </div>
      </div>
      <p className="font-body text-xs text-foreground/70">{vertical.description}</p>

      <div>
        <h3 className="font-display text-[10px] text-sand tracking-[0.15em] mb-3">FUNCIONALIDADES</h3>
        <div className="space-y-2">
          {vertical.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2 p-2 bg-muted/20">
              <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: vertical.color }} />
              <span className="font-body text-xs text-foreground/80">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mock data for each vertical */}
      {vertical.id === "pesca" && (
        <div className="bg-muted/20 p-4">
          <h3 className="font-display text-[10px] tracking-[0.15em] mb-2" style={{ color: vertical.color }}>
            ÍNDICE DE PESCA HOY
          </h3>
          <div className="flex items-end gap-2">
            <span className="font-display text-4xl text-foreground">78</span>
            <span className="font-body text-xs text-sand mb-1">/100</span>
            <span className="font-body text-xs mb-1 ml-2" style={{ color: "#4CAF50" }}>● BUENO</span>
          </div>
          <p className="font-body text-[10px] text-sand mt-2">
            Ventana óptima: 5:00 AM – 11:00 AM · Viento SSE 8 km/h · Oleaje bajo
          </p>
        </div>
      )}

      {vertical.id === "risk" && (
        <div className="bg-muted/20 p-4">
          <h3 className="font-display text-[10px] tracking-[0.15em] mb-2" style={{ color: vertical.color }}>
            NIVEL DE ALERTA ACTUAL
          </h3>
          <div className="flex items-center gap-3">
            <span className="font-display text-sm px-3 py-1" style={{ backgroundColor: "#ffaa00", color: "#111214" }}>
              VIGILANCIA
            </span>
            <span className="font-body text-[10px] text-sand">NIVEL 2 DE 4</span>
          </div>
          <p className="font-body text-[10px] text-sand mt-2">
            Precipitación acumulada prevista: 28mm/6h · Suelo saturado al 65%
          </p>
        </div>
      )}
    </div>
  );
};

export { VerticalCard, VerticalDetail };
