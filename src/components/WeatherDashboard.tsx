import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for 24h
const tempData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  cerroAlto: 18 + Math.sin(i / 4) * 3 + Math.random() * 1.5,
  elJunco: 16 + Math.sin(i / 4) * 2.5 + Math.random(),
  merceditas: 22 + Math.sin(i / 4) * 4 + Math.random() * 2,
  elMirador: 24 + Math.sin(i / 4) * 3.5 + Math.random() * 1.5,
}));

const precipData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  precipitacion: Math.max(0, Math.sin((i - 14) / 3) * 8 + Math.random() * 3),
  probabilidad: Math.min(100, Math.max(0, 30 + Math.sin((i - 12) / 4) * 50 + Math.random() * 10)),
}));

const windData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  velocidad: 8 + Math.sin(i / 5) * 6 + Math.random() * 3,
  rafagas: 12 + Math.sin(i / 5) * 8 + Math.random() * 5,
}));

const humidityData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  humedad: 65 + Math.sin(i / 6) * 15 + Math.random() * 5,
  suelo: 40 + Math.sin(i / 8) * 10 + Math.random() * 3,
}));

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

const chartCommon = {
  margin: { top: 5, right: 5, left: -20, bottom: 0 },
};

const WeatherDashboard = ({ station }: { station?: string }) => {
  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm text-foreground tracking-[0.15em]">
            DATOS METEOROLÓGICOS
          </h2>
          <p className="font-body text-[10px] text-sand mt-1">
            {station ? station.toUpperCase() : "TODAS LAS ESTACIONES"} · ÚLTIMAS 24 HORAS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-bioluminescent animate-pulse-glow" />
          <span className="font-body text-[10px] text-bioluminescent tracking-wider">EN VIVO</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "TEMPERATURA", value: "23.4°C", sub: "↑ 1.2° vs ayer" },
          { label: "PRECIPITACIÓN", value: "4.2 mm", sub: "P(lluvia 3h): 45%" },
          { label: "VIENTO", value: "14 km/h", sub: "Dirección: SSE" },
          { label: "HUMEDAD", value: "78%", sub: "Suelo: 42% VW" },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/30 p-4">
            <p className="font-display text-[9px] text-sand tracking-[0.15em] mb-2">{stat.label}</p>
            <p className="font-display text-xl text-foreground">{stat.value}</p>
            <p className="font-body text-[9px] text-sand mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <div>
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-3">
            TEMPERATURA · 4 ESTACIONES
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData} {...chartCommon}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#9D9386" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "#9D9386" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="cerroAlto" stroke="#00f0c8" strokeWidth={1.5} dot={false} name="Cerro Alto" />
                <Line type="monotone" dataKey="elJunco" stroke="#00c8d0" strokeWidth={1.5} dot={false} name="El Junco" />
                <Line type="monotone" dataKey="merceditas" stroke="#00a8e0" strokeWidth={1.5} dot={false} name="Merceditas" />
                <Line type="monotone" dataKey="elMirador" stroke="#0088f0" strokeWidth={1.5} dot={false} name="El Mirador" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#9D9386" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "#9D9386" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="precipitacion" fill="#00f0c8" opacity={0.6} name="Precipitación (mm)" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#9D9386" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "#9D9386" }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rafagas" stroke="#9D9386" fill="#9D9386" fillOpacity={0.1} name="Ráfagas (km/h)" />
                <Area type="monotone" dataKey="velocidad" stroke="#00f0c8" fill="#00f0c8" fillOpacity={0.15} name="Velocidad (km/h)" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,10%,15%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "#9D9386" }} interval={5} />
                <YAxis tick={{ fontSize: 8, fill: "#9D9386" }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="humedad" stroke="#00f0c8" strokeWidth={1.5} dot={false} name="Humedad Rel. (%)" />
                <Line type="monotone" dataKey="suelo" stroke="#9D9386" strokeWidth={1.5} dot={false} name="Humedad Suelo (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
