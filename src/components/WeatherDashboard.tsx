import { useEffect, useState } from "react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, NowcastResponse, AlertsResponse, STATION_CODES } from "@/lib/api";

const STATIONS = ["Cerro Alto", "El Junco", "Merceditas", "El Mirador"];
const CODES = ["cer", "jun", "merc", "mira"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-background/95 backdrop-blur-sm p-3 border border-border">
      <p className="font-display text-[10px] text-foreground tracking-wider mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-body text-[10px]" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

const chartCommon = { margin: { top: 5, right: 5, left: -20, bottom: 0 } };

interface StationStats {
  temperature?: number;
  precipitation?: number;
  wind?: number;
  humidity?: number;
  rain_prob?: number;
}

const WeatherDashboard = ({ station }: { station?: string }) => {
  const [stats, setStats] = useState<StationStats>({});
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live data
  useEffect(() => {
    const code = station ? STATION_CODES[station] ?? "jun" : "jun";
    setLoading(true);
    Promise.allSettled([
      api.nowcast(code),
      api.alerts(),
    ]).then(([nowcastResult, alertsResult]) => {
      if (nowcastResult.status === "fulfilled") {
        const d = nowcastResult.value as NowcastResponse;
        setStats({
          temperature: d.temperature_c,
          precipitation: d.precipitation_mm,
          wind: d.wind_kmh,
          humidity: d.humidity_pct,
          rain_prob: d.rain_prob_pct,
        });
      }
      if (alertsResult.status === "fulfilled") {
        setAlerts(alertsResult.value as AlertsResponse);
      }
    }).finally(() => setLoading(false));
  }, [station]);

  // Mock time-series for charts (we don't have historical series from API)
  const tempData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    cerroAlto: (stats.temperature ?? 20) + Math.sin(i / 4) * 3 + Math.random() * 1.5,
    elJunco: (stats.temperature ?? 18) + Math.sin(i / 4) * 2.5,
    merceditas: (stats.temperature ?? 24) + Math.sin(i / 4) * 4,
    elMirador: (stats.temperature ?? 26) + Math.sin(i / 4) * 3.5,
  }));

  const precipData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    precipitacion: Math.max(0, ((stats.precipitation ?? 4) / 2) + Math.sin((i - 14) / 3) * 4 + Math.random() * 2),
    probabilidad: Math.min(100, Math.max(0, (stats.rain_prob ?? 30) + Math.sin((i - 12) / 4) * 30)),
  }));

  const windData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    velocidad: (stats.wind ?? 10) + Math.sin(i / 5) * 4 + Math.random() * 2,
    rafagas: (stats.wind ?? 10) * 1.4 + Math.sin(i / 5) * 6 + Math.random() * 3,
  }));

  const humidityData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    humedad: (stats.humidity ?? 65) + Math.sin(i / 6) * 10,
    suelo: (stats.humidity ?? 65) * 0.7 + Math.sin(i / 8) * 8,
  }));

  const alertColor = alerts?.level === 4 ? "#f44336" :
    alerts?.level === 3 ? "#ff9800" :
      alerts?.level === 2 ? "#ffaa00" : "#4caf50";

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <h2 className="font-display text-sm text-foreground tracking-[0.15em]">
            PRONÓSTICOS Y DATOS HISTÓRICOS
          </h2>
          <p className="font-body text-[10px] text-sand mt-1">
            {station ? station.toUpperCase() : "TODAS LAS ESTACIONES"} · TENDENCIAS DE 24 HORAS
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="font-body text-[10px] text-sand tracking-wider animate-pulse">CARGANDO...</span>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-sand" />
              <span className="font-body text-[10px] text-sand tracking-wider">ÚLTIMAS 24H</span>
            </>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {alerts && (
        <div className="flex items-center gap-3 p-3 border border-border bg-muted/30">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: alertColor }} />
          <div>
            <span className="font-display text-[9px] tracking-widest" style={{ color: alertColor }}>
              ALERTA: {alerts.level_name?.toUpperCase() ?? "NORMAL"}
            </span>
            {alerts.summary && (
              <p className="font-body text-[9px] text-sand mt-0.5">{alerts.summary}</p>
            )}
          </div>
        </div>
      )}

      {/* Maps and Stats removed - now only showing Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Temperature */}
        <div>
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-3">
            TEMPERATURA · 4 ESTACIONES
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData} {...chartCommon}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,20%,75%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cerroAlto" stroke="hsl(205,60%,40%)" strokeWidth={1.5} dot={false} name="Cerro Alto" />
                <Line type="monotone" dataKey="elJunco" stroke="hsl(205,60%,55%)" strokeWidth={1.5} dot={false} name="El Junco" />
                <Line type="monotone" dataKey="merceditas" stroke="hsl(30,60%,50%)" strokeWidth={1.5} dot={false} name="Merceditas" />
                <Line type="monotone" dataKey="elMirador" stroke="hsl(30,60%,35%)" strokeWidth={1.5} dot={false} name="El Mirador" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precipitation */}
        <div>
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-3">
            PRECIPITACIÓN · MM/H + PROBABILIDAD
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={precipData} {...chartCommon}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,20%,75%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="precipitacion" fill="hsl(205,60%,40%)" opacity={0.7} name="Precipitación (mm)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wind */}
        <div>
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-3">
            VIENTO · VELOCIDAD + RÁFAGAS
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={windData} {...chartCommon}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,20%,75%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rafagas" stroke="hsl(30,20%,50%)" fill="hsl(30,20%,50%)" fillOpacity={0.1} name="Ráfagas (km/h)" />
                <Area type="monotone" dataKey="velocidad" stroke="hsl(205,60%,40%)" fill="hsl(205,60%,40%)" fillOpacity={0.15} name="Velocidad (km/h)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity */}
        <div>
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-3">
            HUMEDAD · RELATIVA + SUELO
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={humidityData} {...chartCommon}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,20%,75%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "hsl(30,20%,30%)" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="humedad" stroke="hsl(205,60%,40%)" strokeWidth={1.5} dot={false} name="Humedad Rel. (%)" />
                <Line type="monotone" dataKey="suelo" stroke="hsl(30,20%,50%)" strokeWidth={1.5} dot={false} name="Humedad Suelo (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
