import { useEffect, useState, useMemo } from "react";
import { api, RainfallPrediction, HistoricalDataPoint } from "@/lib/api";
import { Cloud, CloudRain, CloudDrizzle, Droplets, Wind, Thermometer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine, ReferenceArea } from "recharts";

const STATIONS = [
  { name: "El Junco", code: "jun", elevation: "548m" },
  { name: "Cerro Alto", code: "cer", elevation: "517m" },
  { name: "El Mirador", code: "mira", elevation: "387m" },
  { name: "Merceditas", code: "merc", elevation: "100m" },
];

const HORIZONS = [0, 1, 3, 6] as const;

const RainfallDashboard = () => {
  const [horizon, setHorizon] = useState<0 | 1 | 3 | 6>(0);
  const [predictions, setPredictions] = useState<Record<string, RainfallPrediction>>({});
  const [historicalData, setHistoricalData] = useState<Record<string, HistoricalDataPoint[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchPredictions = async () => {
    setLoading(true);
    
    // Si horizon es 0 (AHORA), no hacemos predicciones, solo mostramos condiciones actuales
    if (horizon === 0) {
      setLoading(false);
      return;
    }
    
    const results = await Promise.allSettled(
      STATIONS.map(s => api.rainfall(s.code, horizon as 1 | 3 | 6))
    );
    
    const newPredictions: Record<string, RainfallPrediction> = {};
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        newPredictions[STATIONS[idx].code] = result.value;
      }
    });
    
    setPredictions(newPredictions);
    setLoading(false);
  };

  const fetchHistoricalData = async () => {
    const results = await Promise.allSettled(
      STATIONS.map(s => api.stationHistory(s.code, 24))
    );
    
    const newHistorical: Record<string, HistoricalDataPoint[]> = {};
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        newHistorical[STATIONS[idx].code] = result.value.data;
      }
    });
    
    setHistoricalData(newHistorical);
  };

  useEffect(() => {
    fetchPredictions();
    fetchHistoricalData();
    const interval = setInterval(() => {
      fetchPredictions();
      fetchHistoricalData();
    }, 60000); // Auto-refresh cada 60s
    return () => clearInterval(interval);
  }, [horizon]);

  // Stable NOW reference — won't shift as data refreshes mid-render
  const nowTimestamp = useMemo(() => Date.now(), []);

  const prepareChartData = (metric: keyof HistoricalDataPoint) => {
    if (Object.keys(historicalData).length === 0) return [];

    const referenceStation = 'jun';
    const allTimestamps = historicalData[referenceStation]?.map(d => d.timestamp) || [];
    if (allTimestamps.length === 0) return [];

    // Sample every 4th point → 1h resolution from 15-min source
    const sampledIndices = allTimestamps.map((_, i) => i).filter((_, i) => i % 4 === 0);

    // ── Past: real observations (solid lines) ────────────────────
    const pastPoints = sampledIndices.map(idx => {
      const ts = new Date(allTimestamps[idx]).getTime();
      const pt: any = { timestamp: ts, isFuture: false };
      STATIONS.forEach(({ code }) => {
        const rows = historicalData[code];
        if (rows && rows[idx]) {
          const v = rows[idx][metric];
          if (v !== null && v !== undefined && !isNaN(Number(v))) {
            pt[code] = Number(v);
          }
        }
      });
      return pt;
    });

    if (pastPoints.length === 0) return [];
    const lastPast = pastPoints[pastPoints.length - 1];

    // ── Connector exactly at NOW: closes past lines, opens future lines ──
    const connector: any = { timestamp: nowTimestamp, isFuture: false, isNow: true };
    STATIONS.forEach(({ code }) => {
      if (lastPast[code] !== undefined) {
        connector[code] = lastPast[code];            // solid line ends here
        connector[`${code}_f`] = lastPast[code];     // dashed line starts here
      }
    });

    // ── Future: flat projection +1h … +6h from NOW (dashed, transparent) ─
    const futurePoints: any[] = Array.from({ length: 6 }, (_, i) => {
      const pt: any = { timestamp: nowTimestamp + (i + 1) * 3_600_000, isFuture: true };
      STATIONS.forEach(({ code }) => {
        if (lastPast[code] !== undefined) {
          pt[`${code}_f`] = lastPast[code];
        }
      });
      return pt;
    });

    return [...pastPoints, connector, ...futurePoints];
  };

  const chartDataTemp     = useMemo(() => prepareChartData('temp_c'),        [historicalData]);
  const chartDataRain     = useMemo(() => prepareChartData('rain_mm'),       [historicalData]);
  const chartDataWind     = useMemo(() => prepareChartData('wind_speed_ms'), [historicalData]);
  const chartDataHumidity = useMemo(() => prepareChartData('rh_avg'),        [historicalData]);

  const getAlerts = () => {
    const alerts: string[] = [];
    Object.values(predictions).forEach(pred => {
      if (pred.pred_class === 1) {
        alerts.push(`Lluvia leve esperada en ${pred.station_name} en las próximas ${pred.horizon_h}h`);
      } else if (pred.pred_class === 2) {
        alerts.push(`⚠️ Lluvia intensa esperada en ${pred.station_name} en las próximas ${pred.horizon_h}h`);
      }
    });
    return alerts;
  };

  const alerts = getAlerts();

  const getClassColor = (predClass: number) => {
    if (predClass === 0) return "hsl(120, 40%, 50%)";
    if (predClass === 1) return "hsl(45, 90%, 55%)";
    return "hsl(0, 70%, 50%)";
  };

  const getClassIcon = (predClass: number) => {
    if (predClass === 0) return <Cloud className="w-8 h-8" />;
    if (predClass === 1) return <CloudDrizzle className="w-8 h-8" />;
    return <CloudRain className="w-8 h-8" />;
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-4">
        <div>
          <h2 className="font-display text-sm text-foreground tracking-[0.15em]">
            PREDICCIÓN DE LLUVIA · TIEMPO REAL
          </h2>
          <p className="font-body text-[10px] text-sand mt-1">
            4 ESTACIONES METEOROLÓGICAS · MODELO LIGHTGBM V3
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="font-body text-[10px] text-sand tracking-wider animate-pulse">ACTUALIZANDO...</span>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-sand animate-pulse" />
              <span className="font-body text-[10px] text-sand tracking-wider">EN VIVO</span>
            </>
          )}
        </div>
      </div>

      {/* Horizon Selector */}
      <div className="flex items-center gap-4">
        <span className="font-display text-[10px] text-foreground tracking-[0.15em]">
          {horizon === 0 ? "VISTA:" : "HORIZONTE:"}
        </span>
        <div className="flex gap-2">
          {HORIZONS.map(h => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-4 py-2 font-body text-[10px] tracking-wider transition-all ${
                horizon === h
                  ? "bg-bioluminescent text-background"
                  : "bg-muted/30 text-sand hover:bg-muted/50"
              }`}
            >
              {h === 0 ? "AHORA" : `+${h}H`}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Banner */}
      {horizon > 0 && (
        <div className={`p-4 border ${
          alerts.length === 0
            ? "border-green-500/30 bg-green-500/5"
            : "border-orange-500/30 bg-orange-500/5"
        }`}>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-green-500 text-xl">✅</span>
              <span className="font-display text-[10px] text-green-500 tracking-wider">
                SIN ALERTAS ACTIVAS
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="text-orange-500 text-sm mt-0.5">⚠️</span>
                  <span className="font-body text-[10px] text-orange-500">
                    {alert}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vista AHORA - Solo condiciones actuales */}
      {horizon === 0 && Object.keys(historicalData).length > 0 && (
        <div className="p-4 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-3">
            <span className="text-blue-500 text-xl">🌤️</span>
            <span className="font-display text-[10px] text-blue-500 tracking-wider">
              CONDICIONES METEOROLÓGICAS ACTUALES · SIN PREDICCIÓN
            </span>
          </div>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {STATIONS.map(station => {
          // En modo AHORA, mostramos solo datos históricos actuales
          if (horizon === 0) {
            const currentData = historicalData[station.code];
            if (!currentData || currentData.length === 0 || loading) {
              return (
                <div key={station.code} className="border border-border/30 p-6 bg-muted/10">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-muted/30 w-3/4 rounded" />
                    <div className="h-4 bg-muted/30 w-1/2 rounded" />
                    <div className="h-20 bg-muted/30 rounded" />
                    <div className="h-16 bg-muted/30 rounded" />
                  </div>
                </div>
              );
            }

            const latest = currentData[currentData.length - 1];
            return (
              <div
                key={station.code}
                className="border border-border/30 p-6 bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                {/* Station Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-sm text-foreground tracking-[0.15em]">
                      {station.name.toUpperCase()}
                    </h3>
                    <p className="font-body text-[9px] text-sand mt-1">
                      {station.elevation} · {station.code.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-blue-500">
                    <Cloud className="w-8 h-8" />
                  </div>
                </div>

                {/* Current Status */}
                <div className="mb-4 p-4 bg-background/50">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-display text-2xl tracking-wider text-blue-500">
                      ACTUAL
                    </span>
                  </div>
                  <p className="font-body text-[9px] text-sand">
                    Sin predicción · Solo observación
                  </p>
                </div>

                {/* Current Conditions */}
                <div className="space-y-2">
                  <p className="font-display text-[9px] text-sand tracking-wider mb-2">
                    CONDICIONES ACTUALES:
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-3 h-3 text-sand" />
                      <div>
                        <p className="font-body text-[9px] text-sand">Temp</p>
                        <p className="font-body text-[10px] text-foreground">
                          {latest.temp_c.toFixed(1)}°C
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-3 h-3 text-sand" />
                      <div>
                        <p className="font-body text-[9px] text-sand">Humedad</p>
                        <p className="font-body text-[10px] text-foreground">
                          {latest.rh_avg.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-3 h-3 text-sand" />
                      <div>
                        <p className="font-body text-[9px] text-sand">Viento</p>
                        <p className="font-body text-[10px] text-foreground">
                          {latest.wind_speed_ms.toFixed(1)} m/s
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/20">
                    <p className="font-body text-[8px] text-sand">
                      Precipitación actual: {latest.rain_mm.toFixed(1)} mm
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mt-4 pt-3 border-t border-border/20">
                  <p className="font-body text-[8px] text-sand/70">
                    Actualizado: {new Date(latest.timestamp).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            );
          }

          // Modo predicción (1h, 3h, 6h)
          const pred = predictions[station.code];
          if (!pred || loading) {
            return (
              <div key={station.code} className="border border-border/30 p-6 bg-muted/10">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted/30 w-3/4 rounded" />
                  <div className="h-4 bg-muted/30 w-1/2 rounded" />
                  <div className="h-24 bg-muted/30 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 bg-muted/30 rounded" />
                    <div className="h-3 bg-muted/30 rounded" />
                    <div className="h-3 bg-muted/30 rounded" />
                  </div>
                  <div className="h-16 bg-muted/30 rounded" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={station.code}
              className="border border-border/30 p-6 bg-muted/10 hover:bg-muted/20 transition-colors"
            >
              {/* Station Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-sm text-foreground tracking-[0.15em]">
                    {pred.station_name.toUpperCase()}
                  </h3>
                  <p className="font-body text-[9px] text-sand mt-1">
                    {station.elevation} · {pred.station.toUpperCase()}
                  </p>
                </div>
                <div style={{ color: getClassColor(pred.pred_class) }}>
                  {getClassIcon(pred.pred_class)}
                </div>
              </div>

              {/* Prediction */}
              <div className="mb-4 p-4 bg-background/50">
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="font-display text-2xl tracking-wider"
                    style={{ color: getClassColor(pred.pred_class) }}
                  >
                    {pred.class_label.toUpperCase()}
                  </span>
                </div>
                <p className="font-body text-[8px] text-sand mb-3">
                  Predicción para las próximas {pred.horizon_h} hora{pred.horizon_h > 1 ? 's' : ''}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[9px] text-sand w-24">Sin lluvia:</span>
                    <div className="flex-1 h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full transition-all bg-green-500"
                        style={{ width: `${pred.pred_prob_no_rain * 100}%` }}
                      />
                    </div>
                    <span className="font-body text-[8px] text-foreground w-12 text-right">
                      {(pred.pred_prob_no_rain * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[9px] text-sand w-24">Lluvia leve:</span>
                    <div className="flex-1 h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full transition-all bg-yellow-500"
                        style={{ width: `${pred.pred_prob_light * 100}%` }}
                      />
                    </div>
                    <span className="font-body text-[8px] text-foreground w-12 text-right">
                      {(pred.pred_prob_light * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[9px] text-sand w-24">Lluvia intensa:</span>
                    <div className="flex-1 h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full transition-all bg-red-500"
                        style={{ width: `${pred.pred_prob_heavy * 100}%` }}
                      />
                    </div>
                    <span className="font-body text-[8px] text-foreground w-12 text-right">
                      {(pred.pred_prob_heavy * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Conditions */}
              <div className="space-y-2">
                <p className="font-display text-[9px] text-sand tracking-wider mb-2">
                  CONDICIONES ACTUALES:
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-sand" />
                    <div>
                      <p className="font-body text-[9px] text-sand">Temp</p>
                      <p className="font-body text-[10px] text-foreground">
                        {pred.conditions.temp_c.toFixed(1)}°C
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-sand" />
                    <div>
                      <p className="font-body text-[9px] text-sand">Humedad</p>
                      <p className="font-body text-[10px] text-foreground">
                        {pred.conditions.rh_pct.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-3 h-3 text-sand" />
                    <div>
                      <p className="font-body text-[9px] text-sand">Viento</p>
                      <p className="font-body text-[10px] text-foreground">
                        {pred.conditions.wind_ms.toFixed(1)} m/s
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/20">
                  <p className="font-body text-[8px] text-sand">
                    Precipitación actual: {pred.conditions.precip_mm.toFixed(1)} mm
                  </p>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-4 pt-3 border-t border-border/20">
                <p className="font-body text-[8px] text-sand/70">
                  Actualizado: {new Date(pred.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trend Charts */}
      {Object.keys(historicalData).length > 0 && (
        <div className="mt-8 space-y-6">
          <div className="border-t border-border/30 pt-6">
            <h3 className="font-display text-sm text-foreground tracking-[0.15em] mb-1">
              TENDENCIAS · ÚLTIMAS 24H + PROYECCIÓN +6H
            </h3>
            <p className="font-body text-[9px] text-sand">
              Línea blanca = AHORA · Zona derecha = proyección (datos aún no disponibles)
            </p>
          </div>

          {/* Shared XAxis formatter */}
          {(() => {
            const fmtTime = (ts: number) =>
              new Date(ts).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

            const xAxisProps = {
              dataKey: "timestamp" as const,
              type: "number" as const,
              scale: "time" as const,
              domain: ["dataMin", "dataMax"] as [string, string],
              tickFormatter: fmtTime,
              tickCount: 8,
              tick: { fontSize: 10, fill: "hsl(30,20%,40%)" },
            };

            const nowLine = (
              <ReferenceLine
                x={nowTimestamp}
                stroke="hsl(0,0%,95%)"
                strokeWidth={2}
                strokeDasharray="4 2"
                label={{ value: 'AHORA', position: 'insideTopRight', fontSize: 9, fill: 'hsl(0,0%,75%)', fontWeight: 'bold' }}
              />
            );

            const futureArea = (
              <ReferenceArea
                x1={nowTimestamp}
                fill="hsl(220,30%,60%)"
                fillOpacity={0.06}
              />
            );

            const makeTooltip = (unit: string) => ({ active, payload }: any) => {
              if (!active || !payload?.length) return null;
              const ts: number = payload[0]?.payload?.timestamp;
              const isFuture: boolean = payload[0]?.payload?.isFuture;
              // Show only the real station lines (not _f duplicates in tooltip)
              const entries = (payload as any[]).filter(e => !String(e.dataKey).endsWith('_f'));
              const futureEntries = (payload as any[]).filter(e => String(e.dataKey).endsWith('_f'));
              const display = isFuture ? futureEntries : entries;
              return (
                <div className="bg-background/95 backdrop-blur-sm p-3 border border-border text-[10px]">
                  <p className="font-display tracking-wider mb-1 text-foreground">
                    {fmtTime(ts)}{isFuture ? ' · PROYECCIÓN' : ''}
                  </p>
                  {display.map((e: any, i: number) => (
                    <p key={i} className="font-body" style={{ color: e.color }}>
                      {e.name.replace('_f', '')}: {e.value?.toFixed(unit === 'mm' ? 2 : 1)}{unit}
                    </p>
                  ))}
                </div>
              );
            };

            // Per-station color palette
            const COLORS = {
              jun:  "hsl(205,70%,55%)",
              cer:  "hsl(145,55%,45%)",
              mira: "hsl(35,80%,55%)",
              merc: "hsl(345,65%,55%)",
            };

            const pastLines = (
              <>
                <Line type="monotone" dataKey="jun"  stroke={COLORS.jun}  strokeWidth={2} dot={false} name="El Junco"   connectNulls />
                <Line type="monotone" dataKey="cer"  stroke={COLORS.cer}  strokeWidth={2} dot={false} name="Cerro Alto" connectNulls />
                <Line type="monotone" dataKey="mira" stroke={COLORS.mira} strokeWidth={2} dot={false} name="El Mirador" connectNulls />
                <Line type="monotone" dataKey="merc" stroke={COLORS.merc} strokeWidth={2} dot={false} name="Merceditas" connectNulls />
              </>
            );

            const futureLines = (
              <>
                <Line type="monotone" dataKey="jun_f"  stroke={COLORS.jun}  strokeWidth={1.5} strokeDasharray="5 3" strokeOpacity={0.35} dot={false} name="El Junco"   legendType="none" connectNulls />
                <Line type="monotone" dataKey="cer_f"  stroke={COLORS.cer}  strokeWidth={1.5} strokeDasharray="5 3" strokeOpacity={0.35} dot={false} name="Cerro Alto" legendType="none" connectNulls />
                <Line type="monotone" dataKey="mira_f" stroke={COLORS.mira} strokeWidth={1.5} strokeDasharray="5 3" strokeOpacity={0.35} dot={false} name="El Mirador" legendType="none" connectNulls />
                <Line type="monotone" dataKey="merc_f" stroke={COLORS.merc} strokeWidth={1.5} strokeDasharray="5 3" strokeOpacity={0.35} dot={false} name="Merceditas" legendType="none" connectNulls />
              </>
            );

            return (
              <>
                {/* Temperature */}
                <div className="border border-border/30 p-6 bg-muted/10">
                  <h4 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-4">
                    TEMPERATURA (°C)
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataTemp} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,60%)" opacity={0.2} />
                        <XAxis {...xAxisProps} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(30,20%,40%)" }} />
                        <Tooltip content={makeTooltip('°C')} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {futureArea}
                        {nowLine}
                        {pastLines}
                        {futureLines}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Precipitation */}
                <div className="border border-border/30 p-6 bg-muted/10">
                  <h4 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-4">
                    PRECIPITACIÓN (mm)
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataRain} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,60%)" opacity={0.2} />
                        <XAxis {...xAxisProps} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(30,20%,40%)" }} />
                        <Tooltip content={makeTooltip('mm')} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {futureArea}
                        {nowLine}
                        {pastLines}
                        {futureLines}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Wind */}
                <div className="border border-border/30 p-6 bg-muted/10">
                  <h4 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-4">
                    VIENTO (m/s)
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataWind} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,60%)" opacity={0.2} />
                        <XAxis {...xAxisProps} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(30,20%,40%)" }} />
                        <Tooltip content={makeTooltip('m/s')} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {futureArea}
                        {nowLine}
                        {pastLines}
                        {futureLines}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Humidity */}
                <div className="border border-border/30 p-6 bg-muted/10">
                  <h4 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-4">
                    HUMEDAD RELATIVA (%)
                  </h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDataHumidity} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(40,15%,60%)" opacity={0.2} />
                        <XAxis {...xAxisProps} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(30,20%,40%)" }} />
                        <Tooltip content={makeTooltip('%')} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        {futureArea}
                        {nowLine}
                        {pastLines}
                        {futureLines}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default RainfallDashboard;
