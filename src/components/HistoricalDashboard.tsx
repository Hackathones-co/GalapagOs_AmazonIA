import { useEffect, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine,
} from "recharts";
import { api, HistoricalEvent, HistoricalSummaryResponse, HistoricalDataRow } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_COLOR: Record<string, string> = {
  el_nino: "#EF476F",
  la_nina: "#118AB2",
  floods: "#FFD166",
};
const TYPE_LABEL: Record<string, string> = {
  el_nino: "El Niño",
  la_nina: "La Niña",
  floods: "Inundaciones",
};

const fmt = (n: number, d = 1) => n?.toFixed(d) ?? "—";

// Reduce series to ~200 points for performance
const downsample = (data: HistoricalDataRow[], target = 200): HistoricalDataRow[] => {
  if (data.length <= target) return data;
  const step = Math.ceil(data.length / target);
  return data.filter((_, i) => i % step === 0);
};

// Short date label for X axis
const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
};

// ── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, unit, stat, color,
}: {
  label: string; unit: string;
  stat: { mean: number; max: number; min: number };
  color: string;
}) => (
  <div
    className="rounded-xl p-4 space-y-3"
    style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
  >
    <p className="font-display text-[10px] tracking-[0.12em]" style={{ color }}>{label}</p>
    <div className="flex items-end gap-1">
      <span className="font-display text-3xl text-foreground">{fmt(stat.mean)}</span>
      <span className="font-body text-xs text-foreground/50 pb-1">{unit}</span>
    </div>
    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
      <div>
        <p className="font-body text-[9px] text-foreground/40">MÁX</p>
        <p className="font-display text-sm" style={{ color }}>{fmt(stat.max)}</p>
      </div>
      <div>
        <p className="font-body text-[9px] text-foreground/40">MÍN</p>
        <p className="font-display text-sm text-sky-300">{fmt(stat.min)}</p>
      </div>
    </div>
  </div>
);

// ── Chart wrapper ─────────────────────────────────────────────────────────────

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    className="rounded-xl p-4"
    style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
  >
    <p className="font-display text-[10px] tracking-[0.1em] text-foreground/60 mb-4">{title}</p>
    {children}
  </div>
);

const tooltipStyle = {
  backgroundColor: "#0d1117",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  fontSize: 11,
  color: "#e0e0e0",
};

// ── Main component ────────────────────────────────────────────────────────────

const HistoricalDashboard = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<HistoricalSummaryResponse | null>(null);
  const [series, setSeries] = useState<HistoricalDataRow[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load event list
  useEffect(() => {
    api.historicalEvents()
      .then((r) => setEvents(r.events))
      .catch(() => { })
      .finally(() => setLoadingEvents(false));
  }, []);

  // Load detail when event selected
  useEffect(() => {
    if (!selectedId) return;
    setLoadingDetail(true);
    setSummary(null);
    setSeries([]);
    Promise.all([
      api.historicalSummary(selectedId),
      api.historicalSeries(selectedId),
    ])
      .then(([sum, ser]) => {
        setSummary(sum);
        setSeries(downsample(ser.data));
      })
      .catch(() => { })
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const selectedEvent = events.find((e) => e.id === selectedId);
  const accentColor = selectedEvent ? (TYPE_COLOR[selectedEvent.type] ?? "#06D6A0") : "#06D6A0";

  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-display text-2xl text-foreground tracking-[0.1em]">HISTÓRICOS</h1>
          <p className="font-body text-xs text-foreground/50 mt-1">
            Eventos climáticos extremos registrados en Galápagos
          </p>
        </div>

        {/* Event cards */}
        {loadingEvents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {events.map((ev) => {
              const color = TYPE_COLOR[ev.type] ?? "#06D6A0";
              const isSelected = ev.id === selectedId;
              return (
                <motion.button
                  key={ev.id}
                  onClick={() => setSelectedId(isSelected ? null : ev.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-left rounded-xl p-4 space-y-3 transition-all border"
                  style={{
                    backgroundColor: isSelected ? `${color}18` : "rgba(255,255,255,0.03)",
                    borderColor: isSelected ? `${color}80` : "rgba(255,255,255,0.08)",
                    boxShadow: isSelected ? `0 0 16px ${color}20` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="font-display text-[9px] px-2 py-0.5 rounded-full tracking-wide"
                      style={{ backgroundColor: `${color}25`, color, border: `1px solid ${color}50` }}
                    >
                      {TYPE_LABEL[ev.type] ?? ev.type}
                    </span>
                    {ev.total_days !== undefined && <span className="font-body text-[9px] text-foreground/40">{ev.total_days}d</span>}
                  </div>
                  <div>
                    <p className="font-display text-sm text-foreground tracking-wide leading-tight">{ev.label}</p>
                    <p className="font-body text-[10px] text-foreground/50 mt-1 line-clamp-2">{ev.description}</p>
                  </div>
                  {ev.error ? (
                    <p className="font-body text-[9px] text-destructive/80 mt-2 bg-destructive/10 px-2 py-1 rounded border border-destructive/20 line-clamp-1 italic">
                      Error: {ev.error.split(':')[0]}
                    </p>
                  ) : (
                    <p className="font-body text-[9px] text-foreground/30 mt-2">
                      {ev.date_start?.slice(0, 7)} → {ev.date_end?.slice(0, 7)}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Detail panel */}
        <AnimatePresence>
          {selectedId && (
            <motion.div
              key={selectedId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Divider */}
              <div className="border-t border-white/10 pt-2 flex items-center gap-3">
                <span className="font-display text-xs tracking-[0.1em]" style={{ color: accentColor }}>
                  {selectedEvent?.label}
                </span>
                {loadingDetail && (
                  <span className="font-body text-[10px] text-foreground/40 animate-pulse">Cargando datos...</span>
                )}
                {selectedEvent?.error && !loadingDetail && (
                  <span className="font-body text-[10px] text-destructive/80 bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">
                    Archivo de datos no encontrado en el servidor
                  </span>
                )}
              </div>

              {/* Stat cards */}
              {summary && summary.stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {summary.stats.temp_c && <StatCard label="TEMPERATURA" unit="°C" stat={summary.stats.temp_c} color={accentColor} />}
                  {summary.stats.precip_mm && <StatCard label="PRECIPITACIÓN" unit="mm" stat={summary.stats.precip_mm} color="#60C8F5" />}
                  {summary.stats.wind_ms && <StatCard label="VIENTO" unit="m/s" stat={summary.stats.wind_ms} color="#06D6A0" />}
                  {summary.stats.dewpoint_c && <StatCard label="TEMP. ROCÍO" unit="°C" stat={summary.stats.dewpoint_c} color="#FFD166" />}
                  {summary.stats.sst_c && <StatCard label="TEMP. MAR" unit="°C" stat={summary.stats.sst_c} color="#118AB2" />}
                  {summary.stats.solar_wm2 && <StatCard label="RADIACIÓN" unit="W/m²" stat={summary.stats.solar_wm2} color="#FFB347" />}
                </div>
              )}

              {/* Charts */}
              {series.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Temperatura */}
                  <ChartCard title="🌡️ TEMPERATURA (°C)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v)} °C`, "Temp"]} labelFormatter={shortDate} />
                        <ReferenceLine y={summary?.stats.temp_c.mean} stroke={accentColor} strokeDasharray="4 4" strokeOpacity={0.5} />
                        <Line type="monotone" dataKey="temp_c" stroke={accentColor} strokeWidth={1.5} dot={false} name="Temperatura" />
                        <Line type="monotone" dataKey="sst_c" stroke="#118AB2" strokeWidth={1} dot={false} name="Temp. mar" strokeDasharray="3 3" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Precipitación */}
                  <ChartCard title="🌧️ PRECIPITACIÓN (mm/día)">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v)} mm`, "Precip."]} labelFormatter={shortDate} />
                        <Bar dataKey="precip_mm" fill="#60C8F5" fillOpacity={0.8} name="Precipitación" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Viento */}
                  <ChartCard title="💨 VIENTO (m/s)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v)} m/s`, "Viento"]} labelFormatter={shortDate} />
                        <ReferenceLine y={summary?.stats.wind_ms.mean} stroke="#06D6A0" strokeDasharray="4 4" strokeOpacity={0.5} />
                        <Line type="monotone" dataKey="wind_ms" stroke="#06D6A0" strokeWidth={1.5} dot={false} name="Viento" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Presión + Radiación */}
                  <ChartCard title="☀️ RADIACIÓN SOLAR (W/m²)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v)} W/m²`, "Solar"]} labelFormatter={shortDate} />
                        <Line type="monotone" dataKey="solar_wm2" stroke="#FFB347" strokeWidth={1.5} dot={false} name="Radiación" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Presión */}
                  <ChartCard title="🔵 PRESIÓN ATMOSFÉRICA (hPa)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v, 1)} hPa`, "Presión"]} labelFormatter={shortDate} />
                        <Line type="monotone" dataKey="pressure_hpa" stroke="#A78BFA" strokeWidth={1.5} dot={false} name="Estación" />
                        <Line type="monotone" dataKey="msl_hpa" stroke="#C4B5FD" strokeWidth={1} dot={false} name="Nivel mar" strokeDasharray="3 3" />
                        <Legend wrapperStyle={{ fontSize: 9, color: "#888" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* Temperatura de rocío */}
                  <ChartCard title="💧 TEMPERATURA DE ROCÍO (°C)">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={series} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 9, fill: "#666" }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "#666" }} />
                        <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${fmt(v)} °C`, "Rocío"]} labelFormatter={shortDate} />
                        <Line type="monotone" dataKey="dewpoint_c" stroke="#FFD166" strokeWidth={1.5} dot={false} name="Punto de rocío" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!selectedId && !loadingEvents && (
          <div className="text-center py-16 text-foreground/30">
            <p className="font-display text-sm tracking-widest">SELECCIONA UN EVENTO</p>
            <p className="font-body text-xs mt-2">para ver las series temporales y estadísticas</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoricalDashboard;
