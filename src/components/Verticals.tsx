import { useEffect, useState, useRef } from "react";
import { Anchor, Leaf, Shield, AlertTriangle, Compass, X, MapPin, Phone } from "lucide-react";
import { api, AdvisoriesResponse, PescaAdvisory, AgroAdvisory, BiodiversidadAdvisory, RiesgoAdvisory, TurismoAdvisory, AdvisoryLevel } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ── Level styles ──────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<AdvisoryLevel, string> = {
  safe:    '#06D6A0',
  info:    '#118AB2',
  caution: '#FFD166',
  danger:  '#EF476F',
};

const LEVEL_BG: Record<AdvisoryLevel, string> = {
  safe:    'rgba(6,214,160,0.08)',
  info:    'rgba(17,138,178,0.08)',
  caution: 'rgba(255,209,102,0.10)',
  danger:  'rgba(239,71,111,0.10)',
};

const LEVEL_LABELS: Record<AdvisoryLevel, string> = {
  safe:    'SEGURO',
  info:    'INFO',
  caution: 'PRECAUCIÓN',
  danger:  'PELIGRO',
};

export interface Vertical {
  id: string;
  name: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  userQuestion: string;
  userDescription: string;
  technicalDescription: string;
  color: string;
  users: string;
  features: string[];
}

export interface Service {
  id: string;
  name: string;
  category: string;
  coordinates: [number, number];
  address: string;
  phone?: string;
}

export const services: Service[] = [
  // Salud
  { id: "h1", name: "Hospital General Oskar Jandl", category: "Salud", coordinates: [-0.8999525, -89.6048078], address: "Puerto Baquerizo Moreno", phone: "05-3100-711" },
  { id: "h2", name: "Hospital IESS", category: "Salud", coordinates: [-0.737691, -90.3158164], address: "Islas Duncan 046, Puerto Ayora", phone: "05-2526-514" },
  { id: "h3", name: "Centro de Salud República del Ecuador", category: "Salud", coordinates: [-0.7470772, -90.3138782], address: "Puerto Ayora", phone: "05-2526-140" },
  // Abastecimiento
  { id: "a1", name: "Proinsular Market", category: "Abastecimiento", coordinates: [-0.7478584, -90.3138072], address: "Ave Charles Darwin, Puerto Ayora" },
  { id: "a2", name: "Minimarket MERKA7", category: "Abastecimiento", coordinates: [-0.7457251, -90.3129344], address: "Tomás De Berlanga 340e, Puerto Ayora" },
  { id: "a3", name: "I Go Gringo", category: "Abastecimiento", coordinates: [-0.744692, -90.3116323], address: "Islas Plazas y Charles Darwin, Puerto Ayora" },
  // Farmacias
  { id: "f1", name: "Farmacia Isa-Vital", category: "Farmacia", coordinates: [-0.9552302, -90.966728], address: "Av. 16 de Marzo, Puerto Villamil" },
  { id: "f2", name: "Botiquín Isa-Vital", category: "Farmacia", coordinates: [-0.9539231, -90.9648398], address: "Cactus Rd, Puerto Villamil" },
  { id: "f3", name: "Farmacia Santa Cruz", category: "Farmacia", coordinates: [-0.7450091, -90.3145004], address: "Av. Baltra, Puerto Ayora" },
  { id: "f4", name: "Farmacia Cruz Azul", category: "Farmacia", coordinates: [-0.9039687, -89.6098057], address: "Puerto Baquerizo Moreno" },
  // Seguridad
  { id: "s1", name: "Cuartel de Policía San Cristóbal", category: "Seguridad", coordinates: [-0.9065438, -89.6019273], address: "Puerto Baquerizo Moreno", phone: "101" },
];

export const verticals: Vertical[] = [
  {
    id: "pesca",
    name: "PESCASEGURA",
    label: "Pesca",
    icon: <Anchor className="w-8 h-8" />,
    description: "Asistente inteligente para pescadores artesanales",
    userQuestion: "¿Salgo a pescar?",
    userDescription: "Esta herramienta le ayuda a saber si el tiempo estará seguro para navegar. Si el sistema marca alerta, es porque se esperan vientos fuertes o lluvias pesadas que pueden complicar la visibilidad o picar el mar. Es mejor consultarlo antes de salir del muelle para evitar contratiempos.",
    technicalDescription: "Determina la seguridad de navegación menor mediante la velocidad del viento (WS_ms_Avg) y dirección (WindDir). Al cruzar estos datos con la predicción de Clase 2 (Heavy Rain), el modelo identifica condiciones de ráfagas y reducción de visibilidad horizontal.",
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
    userQuestion: "¿Qué siembro hoy?",
    userDescription: "Aquí puede revisar qué tanta humedad tiene su terreno. Si el suelo ya está muy cargado de agua y el aviso indica que viene una lluvia fuerte, lo más recomendable es no abonar ni sembrar hoy, ya que el agua podría lavar el fertilizante o dañar la semilla.",
    technicalDescription: "Analiza los niveles de contenido volumétrico de agua (VW, VW_2, VW_3). Si el suelo presenta saturación y el modelo predice precipitación intensa a +6h, se emite una recomendación para prevenir la lixiviación de nutrientes y la escorrentía superficial.",
    label: "Agricultura",
    icon: <Leaf className="w-8 h-8" />,
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
    userQuestion: "¿Cómo están las tortugas?",
    userDescription: "Este indicador sirve para vigilar el estado del campo y los animales. Nos avisa si las zonas altas están muy secas o si hay suficiente humedad para que las especies encuentren agua en las pozas. Es una forma de saber si el entorno está bajo mucho calor o falta de lluvia.",
    technicalDescription: "Monitorea el microclima mediante temperatura (AirTC_Avg) y minutos de humedad en hoja (LWMWet_Tot). Estos datos, junto con el acumulado de lluvia (Rain_mm_Tot), permiten modelar la disponibilidad hídrica en reservorios naturales para fauna endémica.",
    label: "Conservación",
    icon: <Shield className="w-8 h-8" />,
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
    userQuestion: "¿Voy a la playa o al sendero?",
    userDescription: "Es un aviso preventivo por su seguridad. A veces en la costa hace sol, pero si en la parte alta del cerro llueve fuerte, el agua puede bajar de repente por los caminos secos. El sistema le avisa cuándo es mejor no entrar a senderos o zonas bajas para evitar peligros.",
    technicalDescription: "Detecta picos de precipitación en cuencas altas incluso si la radiación neta local (NR_Wm2_Avg) es alta. El objetivo es alertar sobre inundaciones repentinas (flash floods) por conectividad hidrológica desde las estaciones de montaña hacia la costa.",
    
    id: "risk",
    name: "RISKWATCH",
    label: "Riesgos",
    icon: <AlertTriangle className="w-8 h-8" />,
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
    userQuestion: "¿Qué hago hoy?",
    userDescription: "Le ayuda a organizar las actividades del día para aprovechar mejor el tiempo. Si el sistema indica que habrá mucha lluvia o neblina en las partes altas, puede elegir una actividad bajo techo o en otra zona. Así los visitantes disfrutan más de su estadía sin mojarse.",
    technicalDescription: "Utiliza la radiación solar (SlrkW_Avg) y la humedad relativa (RH_Avg) para calcular el confort térmico. Se basa en la alta probabilidad de Clase 0 (No Rain) para validar la visibilidad y viabilidad de rutas turísticas en puntos de interés.",
    
    id: "turismo",
    name: "VISITGALÁPAGOS",
    label: "Turismo",
    icon: <Compass className="w-8 h-8" />,
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

// ── Per-module advisory panels ────────────────────────────────────────────────

const RainBadge = ({ heavy, label }: { heavy: boolean; label: string }) => (
  <span
    className="px-3 py-1.5 rounded-full font-display text-xs tracking-wide"
    style={{
      backgroundColor: heavy ? 'rgba(239,71,111,0.22)' : 'rgba(6,214,160,0.18)',
      color: heavy ? '#FF6B8A' : '#06D6A0',
      border: `1px solid ${heavy ? '#EF476F70' : '#06D6A060'}`,
      boxShadow: `0 1px 4px ${heavy ? 'rgba(239,71,111,0.2)' : 'rgba(6,214,160,0.15)'}`,
    }}
  >
    {label} {heavy ? '🌧️' : '☀️'}
  </span>
);

const PescaPanel = ({ d }: { d: PescaAdvisory }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <div>
        <span className="font-display text-4xl" style={{ color: LEVEL_COLORS[d.level] }}>
          {d.wind_ms}
        </span>
        <span className="font-body text-sm text-sand/60 ml-1">m/s</span>
      </div>
      <div className="space-y-1">
        <div
          className="font-display text-2xl leading-none"
          style={{ transform: `rotate(${d.wind_dir_deg}deg)`, display: 'inline-block' }}
        >
          ↑
        </div>
        <p className="font-body text-xs text-foreground/70">{d.wind_cardinal}</p>
      </div>
    </div>
    <div className="flex gap-2 flex-wrap">
      <RainBadge heavy={d.heavy_rain_1h} label="+1h" />
      <RainBadge heavy={d.heavy_rain_3h} label="+3h" />
    </div>
  </div>
);

const AgroPanel = ({ d }: { d: AgroAdvisory }) => {
  const pct = Math.min((d.rain_24h_mm / 20) * 100, 100);
  const barColor = d.rain_24h_mm > 15 ? '#EF476F' : d.rain_24h_mm > 5 ? '#FFD166' : '#06D6A0';
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-body text-xs text-sand/60">Lluvia 24h</span>
          <span className="font-display text-sm" style={{ color: barColor }}>{d.rain_24h_mm} mm</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="font-body text-[10px] text-sand/40 mt-1">escala 0–20 mm</p>
      </div>
      <RainBadge heavy={d.heavy_6h} label="Lluvia intensa +6h" />
    </div>
  );
};

const BiodiversidadPanel = ({ d }: { d: BiodiversidadAdvisory }) => {
  const tempColor = d.temp_c < 15 ? '#60C8F5' : d.temp_c < 28 ? '#06D6A0' : d.temp_c < 30 ? '#FFD166' : '#EF476F';
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-body text-[10px] text-foreground/60 mb-1">🌡️ Temperatura</p>
          <p className="font-display text-2xl" style={{ color: tempColor }}>{d.temp_c}°C</p>
        </div>
        <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <p className="font-body text-[10px] text-foreground/60 mb-1">💧 Humedad</p>
          <p className="font-display text-2xl text-sky-300">{d.rh_pct}%</p>
        </div>
      </div>
      {d.alerts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {d.alerts.map((a, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full font-body text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(255,255,255,0.92)',
                color: '#92400e',
                border: '1px solid rgba(255,209,102,0.80)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.25)',
              }}
            >
              ⚠️ {a}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const RiesgoPanel = ({ d }: { d: RiesgoAdvisory }) => (
  <div className="space-y-3">
    {d.flash_flood_risk && (
      <div
        className="rounded-lg p-3 text-center"
        style={{
          backgroundColor: 'rgba(239,71,111,0.22)',
          border: '1px solid rgba(239,71,111,0.70)',
          boxShadow: '0 2px 8px rgba(239,71,111,0.20)',
        }}
      >
        <p className="font-display text-base text-red-300 tracking-wide">⚠️ ALERTA CRECIDA</p>
        <p className="font-body text-xs text-red-200/80 mt-1">Riesgo de inundación repentina</p>
      </div>
    )}
    <div className="grid grid-cols-3 gap-2">
      {[
        { label: 'Cerro +1h', heavy: d.heavy_highland_1h },
        { label: 'Cerro +3h', heavy: d.heavy_highland_3h },
        { label: 'Costa', heavy: !d.clear_coastal },
      ].map(({ label, heavy }) => (
        <div
          key={label}
          className="rounded-lg p-2 text-center"
          style={{
            backgroundColor: heavy ? 'rgba(239,71,111,0.12)' : 'rgba(6,214,160,0.12)',
            border: `1px solid ${heavy ? '#EF476F40' : '#06D6A040'}`,
          }}
        >
          <p className="font-body text-[9px] text-sand/50 mb-1">{label}</p>
          <p className="text-base">{heavy ? '🌧️' : '☀️'}</p>
        </div>
      ))}
    </div>
    {/* Mini diagram: montaña → costa */}
    <div className="flex items-center justify-center gap-2 opacity-60 py-1">
      <span className="font-body text-[10px]">⛰️ {d.heavy_highland_1h ? '🌧️' : '☀️'}</span>
      <span className="font-body text-[10px] text-sand/40">──▶</span>
      <span className="font-body text-[10px]">🏖️ {d.clear_coastal ? '☀️' : '🌧️'}</span>
    </div>
  </div>
);

const TurismoPanel = ({ d }: { d: TurismoAdvisory }) => {
  const gaugeColor = d.comfort_index > 70 ? '#06D6A0' : d.comfort_index > 50 ? '#FFD166' : '#EF476F';
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-sm text-foreground">{d.condition_desc}, {d.temp_c}°C</p>
          <p className="font-body text-[10px] text-sand/50 mt-0.5">Condición actual</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl" style={{ color: gaugeColor }}>{d.comfort_index}</p>
          <p className="font-body text-[9px] text-sand/50">confort /100</p>
        </div>
      </div>
      <div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${d.comfort_index}%`, backgroundColor: gaugeColor }}
          />
        </div>
      </div>
      {d.activities.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {d.activities.map((a, i) => {
            const disabled = a.startsWith('❌');
            return (
              <span
                key={i}
                className="px-2 py-1 rounded-full font-body text-[10px]"
                style={{
                  backgroundColor: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(33,150,243,0.12)',
                  color: disabled ? '#ffffff40' : '#90caf9',
                  border: `1px solid ${disabled ? '#ffffff15' : '#2196f340'}`,
                  textDecoration: disabled ? 'line-through' : 'none',
                }}
              >
                {a}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Advisory banner shown at top of modal ─────────────────────────────────────

const AdvisoryBanner = ({ level, title, emoji }: { level: AdvisoryLevel; title: string; emoji: string }) => (
  <div
    className="flex items-center gap-3 rounded-lg px-4 py-2"
    style={{ backgroundColor: LEVEL_BG[level], border: `1px solid ${LEVEL_COLORS[level]}40` }}
  >
    <span className="text-xl">{emoji}</span>
    <div className="flex-1">
      <p className="font-display text-xs tracking-wide" style={{ color: LEVEL_COLORS[level] }}>
        {LEVEL_LABELS[level]}
      </p>
      <p className="font-body text-xs text-foreground/80">{title}</p>
    </div>
  </div>
);

// ── Types ─────────────────────────────────────────────────────────────────────

interface VerticalModalProps {
  vertical: Vertical | null;
  advisory?: AdvisoriesResponse['advisories'][keyof AdvisoriesResponse['advisories']] | null;
  onClose: () => void;
}

const VerticalModal = ({ vertical, advisory, onClose }: VerticalModalProps) => {
  if (!vertical) return null;

  const renderAdvisoryPanel = () => {
    if (!advisory) return <p className="font-body text-xs text-sand/50">Cargando datos...</p>;
    switch (vertical.id) {
      case 'pesca':       return <PescaPanel d={advisory as PescaAdvisory} />;
      case 'agro':        return <AgroPanel d={advisory as AgroAdvisory} />;
      case 'bio':         return <BiodiversidadPanel d={advisory as BiodiversidadAdvisory} />;
      case 'risk':        return <RiesgoPanel d={advisory as RiesgoAdvisory} />;
      case 'turismo':     return <TurismoPanel d={advisory as TurismoAdvisory} />;
      default:            return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div
            className="p-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur flex items-start justify-between"
            style={{ backgroundColor: `${vertical.color}10` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${vertical.color}20`, color: vertical.color }}
              >
                {vertical.icon}
              </div>
              <div>
                <h2 className="font-display text-2xl text-foreground tracking-[0.1em]">{vertical.name}</h2>
                <p className="font-body text-xs text-sand mt-1">{vertical.users}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5 text-sand" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* User Question & Description */}
            <div
              className="border rounded-lg p-4"
              style={{ backgroundColor: `${vertical.color}10`, borderColor: `${vertical.color}30` }}
            >
              <h3 className="font-display text-lg text-foreground mb-2">{vertical.userQuestion}</h3>
              <p className="font-body text-sm text-foreground/80 leading-relaxed">{vertical.userDescription}</p>
            </div>

            {/* Technical Details */}
            <details className="border border-border rounded-lg p-4 group cursor-pointer">
              <summary className="font-display text-sm text-foreground tracking-[0.05em] select-none">
                📊 Detalles Técnicos
              </summary>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="font-body text-xs text-sand/70 leading-relaxed">{vertical.technicalDescription}</p>
              </div>
            </details>

            {/* Features */}
            <div>
              <h3 className="font-display text-xs text-foreground tracking-[0.1em] mb-3">FUNCIONALIDADES</h3>
              <div className="space-y-2">
                {vertical.features.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: vertical.color }}
                    />
                    <span className="font-body text-xs text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisory data */}
            <div className="space-y-3">
              {advisory && (
                <AdvisoryBanner level={advisory.level} title={advisory.title} emoji={advisory.emoji} />
              )}
              <div className="bg-muted/20 rounded-lg p-4">
                <h3
                  className="font-display text-xs tracking-[0.1em] mb-4 flex items-center gap-2"
                  style={{ color: vertical.color }}
                >
                  📡 DATOS EN TIEMPO REAL
                  {!advisory && (
                    <span className="font-body text-[8px] text-sand animate-pulse normal-case tracking-normal">cargando...</span>
                  )}
                </h3>
                {renderAdvisoryPanel()}
                {advisory && (
                  <p className="font-body text-[10px] text-foreground/60 mt-4 pt-3 border-t border-border/40">
                    <strong className="text-foreground/80">Acción: </strong>{advisory.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

interface ServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceMapComponent = ({ userLocation, filteredServices, selectedCategory, hoveredServiceId }: { 
  userLocation: [number, number] | null, 
  filteredServices: Service[],
  selectedCategory: string,
  hoveredServiceId?: string
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapRef.current || !userLocation || mapLoaded) return;

    // Cargar Leaflet dinámicamente
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.onload = () => {
      const L = (window as any).L;
      if (!L) return;

      // Crear mapa
      const map = L.map(mapRef.current).setView(userLocation, 11);
      mapInstanceRef.current = map;

      // Agregar tiles de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marcador de ubicación actual del usuario
      L.circleMarker(userLocation, {
        color: '#00f0c8',
        radius: 8,
        fillColor: '#00f0c8',
        fillOpacity: 0.8,
        weight: 2,
      })
        .addTo(map)
        .bindPopup('<strong>Tu ubicación</strong>');

      // Marcadores de servicios
      filteredServices.forEach((service) => {
        const colors: Record<string, string> = {
          Salud: '#ff6b6b',
          Abastecimiento: '#4CAF50',
          Farmacia: '#2196F3',
          Seguridad: '#ff9800',
        };
        const color = colors[selectedCategory] || '#00f0c8';

        L.circleMarker(service.coordinates, {
          color: color,
          radius: 6,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 2,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-size: 12px; color: #fff;">
              <strong>${service.name}</strong><br/>
              ${service.address}<br/>
              ${service.phone ? `📞 ${service.phone}` : ''}
            </div>`
          );
      });

      setMapLoaded(true);
    };
    document.head.appendChild(script);
  }, [userLocation, filteredServices, selectedCategory, mapLoaded]);

  // Centrar mapa cuando se ciclean servicios
  useEffect(() => {
    if (!mapInstanceRef.current || !hoveredServiceId) return;
    
    const service = filteredServices.find((s) => s.id === hoveredServiceId);
    if (service) {
      mapInstanceRef.current.flyTo(service.coordinates, 13, {
        duration: 0.8,
      });
    }
  }, [hoveredServiceId, filteredServices]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: '400px' }} />;
};

const ServicesModal = ({ isOpen, onClose }: ServicesModalProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Salud");
  const [hoveredServiceId, setHoveredServiceId] = useState<string | undefined>();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => setUserLocation([-0.7465, -90.3156]) // Centro fallback (Puerto Ayora)
      );
    }
  }, []);

  const filteredServices = services.filter((s) => s.category === selectedCategory);
  const categories = Array.from(new Set(services.map((s) => s.category)));

  const getServiceColor = (category: string) => {
    const colorMap: Record<string, string> = {
      Salud: "#ff6b6b",
      Abastecimiento: "#4CAF50",
      Farmacia: "#2196F3",
      Seguridad: "#ff9800",
    };
    return colorMap[category] || "#00f0c8";
  };

  const getServiceEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      Salud: "🏥",
      Abastecimiento: "🛒",
      Farmacia: "💊",
      Seguridad: "🚓",
    };
    return emojiMap[category] || "📍";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background border border-border rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b border-border sticky top-0 bg-background/95 backdrop-blur flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-red-500/20 text-red-400">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-foreground tracking-[0.1em]">SERVICIOS DE EMERGENCIA</h2>
                  <p className="font-body text-xs text-sand mt-1">Salud, Abastecimiento, Farmacias y Seguridad</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
                <X className="w-5 h-5 text-sand" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Números de Emergencia */}
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="font-display text-sm text-red-400 mb-3">📞 NÚMEROS DE EMERGENCIA</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-sm">
                    <p className="font-body text-xs text-sand/60">Policía</p>
                    <p className="font-display text-lg text-foreground">101</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-body text-xs text-sand/60">Ambulancia</p>
                    <p className="font-display text-lg text-foreground">911</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-body text-xs text-sand/60">Bomberos</p>
                    <p className="font-display text-lg text-foreground">102</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-body text-xs text-sand/60">Defensa Civil</p>
                    <p className="font-display text-lg text-foreground">1-1-2</p>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg font-body text-xs transition-all ${
                      selectedCategory === cat
                        ? "text-foreground"
                        : "text-sand/60 hover:text-sand"
                    }`}
                    style={{
                      backgroundColor: selectedCategory === cat ? `${getServiceColor(cat)}30` : "transparent",
                      borderBottom: selectedCategory === cat ? `2px solid ${getServiceColor(cat)}` : "none",
                    }}
                  >
                    {getServiceEmoji(cat)} {cat}
                  </button>
                ))}
              </div>

              {/* Map Section */}
              {userLocation && (
                <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
                  <ServiceMapComponent 
                    userLocation={userLocation} 
                    filteredServices={filteredServices}
                    selectedCategory={selectedCategory}
                    hoveredServiceId={hoveredServiceId}
                  />
                </div>
              )}
              {!userLocation && (
                <div className="border border-border rounded-lg overflow-hidden bg-muted/20 h-64 relative flex items-center justify-center">
                  <p className="font-body text-xs text-sand/50">Obteniendo ubicación...</p>
                </div>
              )}

              {/* Services List */}
              <div className="space-y-3">
                <h3 className="font-display text-sm text-foreground tracking-[0.08em]">
                  {getServiceEmoji(selectedCategory)} {selectedCategory.toUpperCase()}
                </h3>
                <div className="space-y-2">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onMouseEnter={() => setHoveredServiceId(service.id)}
                      onMouseLeave={() => setHoveredServiceId(undefined)}
                      className="p-3 rounded-lg border transition-all hover:shadow-lg cursor-pointer"
                      style={{
                        backgroundColor: hoveredServiceId === service.id 
                          ? `${getServiceColor(selectedCategory)}25` 
                          : `${getServiceColor(selectedCategory)}15`,
                        borderColor: hoveredServiceId === service.id
                          ? `${getServiceColor(selectedCategory)}70`
                          : `${getServiceColor(selectedCategory)}40`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-display text-xs text-foreground tracking-[0.05em] mb-1">
                            {service.name}
                          </h4>
                          <p className="font-body text-[10px] text-sand/70 flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />
                            {service.address}
                          </p>
                          {service.phone && (
                            <p className="font-body text-[10px] text-sand/70 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {service.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface VerticalsGridProps {
  onStationClick?: (station: string) => void;
}

// Map vertical.id → advisories key
const ADVISORY_KEY: Record<string, keyof AdvisoriesResponse['advisories']> = {
  pesca:   'pesca',
  agro:    'agro',
  bio:     'biodiversidad',
  risk:    'riesgo',
  turismo: 'turismo',
};

const VerticalsGrid = ({ onStationClick }: VerticalsGridProps) => {
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [showServices, setShowServices] = useState(false);
  const [advisoriesData, setAdvisoriesData] = useState<AdvisoriesResponse | null>(null);

  useEffect(() => {
    const load = () => api.advisories().then(setAdvisoriesData).catch(() => {});
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const getAdvisory = (verticalId: string) => {
    if (!advisoriesData) return null;
    const key = ADVISORY_KEY[verticalId];
    return key ? advisoriesData.advisories[key] : null;
  };

  return (
    <>
      <div className="w-full h-full bg-background overflow-auto">
        {/* Grid */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verticals.map((vertical) => {
              const adv = getAdvisory(vertical.id);
              const borderColor = adv ? LEVEL_COLORS[adv.level] : vertical.color;
              const isPulse = adv?.level === 'danger';
              return (
                <motion.button
                  key={vertical.id}
                  onClick={() => setSelectedVertical(vertical)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`text-left group overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg${isPulse ? ' animate-pulse' : ''}`}
                  style={{
                    backgroundColor: adv ? LEVEL_BG[adv.level] : `${vertical.color}25`,
                    borderColor: `${borderColor}70`,
                    boxShadow: isPulse ? `0 0 12px 2px ${LEVEL_COLORS.danger}30` : undefined,
                  }}
                >
                  <div className="p-6 space-y-4">
                    {/* Icon & Title */}
                    <div className="flex items-start justify-between">
                      <div
                        className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${vertical.color}20`, color: vertical.color }}
                      >
                        {vertical.icon}
                      </div>
                      {adv ? (
                        <span
                          className="font-display text-[9px] px-2 py-0.5 rounded-full tracking-wide font-semibold"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.92)',
                            color: LEVEL_COLORS[adv.level],
                            border: `1px solid ${LEVEL_COLORS[adv.level]}60`,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.20)',
                          }}
                        >
                          {adv.emoji} {LEVEL_LABELS[adv.level]}
                        </span>
                      ) : (
                        <span className="font-display text-[10px] text-sand/50 group-hover:text-sand/70 transition-colors">
                          CLICK PARA MÁS
                        </span>
                      )}
                    </div>

                    {/* Name & Description */}
                    <div>
                      <h2 className="font-display text-lg text-foreground tracking-[0.08em] mb-1">
                        {vertical.name}
                      </h2>
                      <p className="font-body text-xs text-foreground/60 line-clamp-2">{vertical.description}</p>
                    </div>

                    {/* User Question */}
                    <div className="pt-2 border-t border-border/50">
                      <p className="font-display text-sm text-foreground italic">{vertical.userQuestion}</p>
                    </div>

                    {/* Advisory detail preview */}
                    {adv && (
                      <div
                        className="rounded-md px-3 py-2.5"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.07)',
                          borderLeft: `3px solid ${LEVEL_COLORS[adv.level]}`,
                          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                        }}
                      >
                        <p className="font-body text-xs text-foreground line-clamp-2 leading-relaxed">
                          {adv.detail}
                        </p>
                      </div>
                    )}

                    {/* Users Badge */}
                    <div className="pt-1">
                      <p className="font-body text-[9px] text-sand/60">{vertical.users}</p>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${vertical.color}20, transparent)`,
                    }}
                  />
                </motion.button>
              );
            })}

            {/* Services Card */}
            <motion.button
              onClick={() => setShowServices(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-left group overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20"
              style={{
                backgroundColor: "#ff6b6b25",
                borderColor: "#ff6b6b50",
              }}
            >
              <div className="p-6 space-y-4">
                {/* Icon & Title */}
                <div className="flex items-start justify-between">
                  <div
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: "#ff6b6b20", color: "#ff6b6b" }}
                  >
                    <MapPin className="w-8 h-8" />
                  </div>
                  <span className="font-display text-[10px] text-sand/50 group-hover:text-sand/70 transition-colors">
                    CLICK PARA MÁS
                  </span>
                </div>

                {/* Name & Description */}
                <div>
                  <h2 className="font-display text-lg text-foreground tracking-[0.08em] mb-1">
                    SERVICIOS
                  </h2>
                  <p className="font-body text-xs text-sand/70 line-clamp-2">Mapa de servicios de primera necesidad en Galápagos</p>
                </div>

                {/* User Question */}
                <div className="pt-2 border-t border-border/50">
                  <p className="font-display text-sm text-foreground italic">¿Dónde busco ayuda?</p>
                </div>

                {/* Users Badge */}
                <div className="pt-2">
                  <p className="font-body text-[9px] text-sand/60">Salud · Abastecimiento · Farmacia · Seguridad</p>
                </div>
              </div>

              {/* Hover Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, #ff6b6b20, transparent)`,
                }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <VerticalModal
        vertical={selectedVertical}
        advisory={selectedVertical ? getAdvisory(selectedVertical.id) : null}
        onClose={() => setSelectedVertical(null)}
      />
      <ServicesModal isOpen={showServices} onClose={() => setShowServices(false)} />
    </>
  );
};

export { VerticalsGrid, VerticalModal, ServicesModal };
