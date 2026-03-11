import { useEffect, useState, useRef } from "react";
import Map, { Marker, Layer, Source } from "react-map-gl/maplibre";
import { api } from "@/lib/api";
import { Cloud, CloudRain, Wind, Droplets, MapPin, Loader2 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";

// Original stations are kept for fallback/visual reference
const stations = [
  { name: "Cerro Alto", lat: -0.875, lng: -89.555, altitude: "300m" },
  { name: "El Junco", lat: -0.893, lng: -89.559, altitude: "660m" },
  { name: "Merceditas", lat: -0.910, lng: -89.548, altitude: "150m" },
  { name: "El Mirador", lat: -0.900, lng: -89.610, altitude: "50m" },
];

export interface WeatherPoint {
  lat: number;
  lon: number;
  temperature_c: number | null;
  precipitation_mm?: number | null;
  precip_prob_pct?: number | null;
  wind_kmh?: number | null;
  windspeed_kmh?: number | null;
  humidity_pct: number | null;
}

const SanCristobalMap = ({ onStationClick }: { onStationClick?: (station: string) => void }) => {
  const mapRef = useRef<any>(null);

  // Helper to get human-readable location name from coordinates
  const fetchLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.name) return data.name;
        if (data && data.address) {
          return data.address.city || data.address.town || data.address.village || data.address.county || data.address.state || "Ubicación desconocida";
        }
      }
    } catch (e) {
      console.error("Reverse geocoding failed:", e);
    }
    return `Coord: ${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  };

  // States
  const [zones, setZones] = useState<Record<string, { lat: number; lon: number; desc: string }>>({});
  const [selectedZone, setSelectedZone] = useState<string>("");

  // Target clicked point
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number, lon: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);

  // Weather card
  const [activeWeather, setActiveWeather] = useState<{ point: WeatherPoint; name: string } | null>(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Initial load of zones
  useEffect(() => {
    api.getZones()
      .then((data) => {
        setZones(data);
        if (data["Santa Cruz"]) {
          setSelectedZone("Santa Cruz");
        } else if (Object.keys(data).length > 0) {
          setSelectedZone(Object.keys(data)[0]);
        }
      })
      .catch((err) => console.error("Failed to load zones:", err));
  }, []);

  // Request user Geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lon: lng });
          setClickedLatLng({ lat, lon: lng });

          // Fly to user location
          if (mapRef.current) {
            mapRef.current.flyTo({ center: [lng, lat], zoom: 12, duration: 2000 });
          }

          // Fetch weather for this location
          setIsFetchingWeather(true);
          setActiveWeather(null);
          setWeatherError(null);

          try {
            const data = await api.getGridWeather(lat, lng, 10, 5);
            const pointsArray = data.weather_points || data.points || data.grid;
            if (pointsArray && pointsArray.length > 0) {
              const validPoint = pointsArray.find((p: any) => p.temperature_c !== null) || pointsArray[0];
              const locationName = await fetchLocationName(lat, lng);
              setActiveWeather({
                name: locationName.toUpperCase(),
                point: validPoint,
              });
            }
          } catch (err: any) {
            console.error("Failed to fetch weather for user location:", err);
            setWeatherError(err.message || "Ubicación fuera de cobertura");
          } finally {
            setIsFetchingWeather(false);
          }
        },
        (error) => {
          console.warn("Geolocation denied or failed:", error);
          // Fallback handled by the zones effect
        },
        { timeout: 10000 }
      );
    }
  }, []);

  // Fetch weather when selectedZone changes (only if we didn't just load via geolocation)
  useEffect(() => {
    if (!selectedZone || !zones[selectedZone]) return;

    const fetchZoneWeather = async () => {
      const coords = zones[selectedZone];

      if (mapRef.current) {
        mapRef.current.flyTo({ center: [coords.lon, coords.lat], zoom: 11, duration: 1500 });
      }

      setClickedLatLng({ lat: coords.lat, lon: coords.lon });
      setIsFetchingWeather(true);
      setActiveWeather(null);
      setWeatherError(null);

      try {
        const data = await api.getZoneWeather(selectedZone, 15, 2);
        const pointsArray = data.weather_points || data.points || data.grid;
        if (pointsArray && pointsArray.length > 0) {
          // Attempt to find a point that didn't timeout (has valid temp)
          const validPoint = pointsArray.find((p: any) => p.temperature_c !== null) || pointsArray[0];
          const locationName = await fetchLocationName(coords.lat, coords.lon);
          setActiveWeather({
            name: locationName.toUpperCase(),
            point: validPoint
          });
        }
      } catch (err: any) {
        console.error("Error fetching zone weather:", err);
        setWeatherError(err.message || "Error al obtener el clima");
      } finally {
        setIsFetchingWeather(false);
      }
    };

    fetchZoneWeather();
  }, [selectedZone, zones]);


  // Handle map clicks to fetch grid weather
  const onMapClick = async (e: any) => {
    const lat = e.lngLat.lat;
    const lng = e.lngLat.lng;

    setClickedLatLng({ lat, lon: lng });
    setIsFetchingWeather(true);
    setActiveWeather(null); // clear old card
    setWeatherError(null);

    try {
      const data = await api.getGridWeather(lat, lng, 10, 5);
      const pointsArray = data.weather_points || data.points || data.grid;
      if (pointsArray && pointsArray.length > 0) {
        const validPoint = pointsArray.find((p: any) => p.temperature_c !== null) || pointsArray[0];
        const locationName = await fetchLocationName(lat, lng);
        setActiveWeather({
          name: locationName.toUpperCase(),
          point: validPoint,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch weather for grid:", err);
      setWeatherError(err.message || "Error al consultar la zona");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  // Handle Zone Selection Change
  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedZone(e.target.value);
  };

  return (
    <div className="relative w-full h-full bg-[#111214]">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -89.57,
          latitude: -0.895,
          zoom: 10,
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactive={true}
        onClick={onMapClick}
        cursor="crosshair"
      >
        {/* Custom station markers */}
        {stations.map((station, i) => (
          <Marker
            key={i}
            longitude={station.lng}
            latitude={station.lat}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onStationClick?.(station.name);
            }}
          >
            <div className="w-3 h-3 bg-bioluminescent rounded-full shadow-[0_0_12px_rgba(0,240,200,0.6)] animate-pulse-glow cursor-pointer" />
          </Marker>
        ))}

        {/* Temporary click marker / Selected Zone highlighting */}
        {clickedLatLng && (
          <Marker longitude={clickedLatLng.lon} latitude={clickedLatLng.lat}>
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-bioluminescent/30 rounded-full animate-ping" />
              <div className="absolute w-8 h-8 bg-bioluminescent/40 rounded-full animate-pulse" />
              <div className="relative w-4 h-4 bg-bioluminescent rounded-full border-2 border-white shadow-[0_0_15px_2px_#00f0c8]" />
            </div>
          </Marker>
        )}

        {/* User Location marker (different color to distinguish) */}
        {userLocation && clickedLatLng?.lat !== userLocation.lat && (
          <Marker longitude={userLocation.lon} latitude={userLocation.lat}>
            <div className="relative flex items-center justify-center" title="Tu Ubicación">
              <div className="absolute w-6 h-6 bg-blue-500/40 rounded-full animate-pulse" />
              <div className="w-3 h-3 bg-blue-400 rounded-full border-2 border-white shadow-[0_0_10px_#3b82f6]" />
            </div>
          </Marker>
        )}
      </Map>

      {/* Map Interactive Overlay Panel (Solid, Left Side) */}
      <div className="absolute top-4 left-4 z-10 w-[240px] flex flex-col gap-4 pointer-events-none">

        {/* Zone Selector */}
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl pointer-events-auto">
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-2 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" /> EXPLORADOR DE ISLAS
          </h3>
          <select
            value={selectedZone}
            onChange={handleZoneChange}
            className="w-full bg-muted/20 text-foreground text-xs font-body p-2 outline-none border border-border rounded focus:border-primary transition-colors cursor-pointer"
          >
            <option value="" disabled>Selecciona una zona...</option>
            {Object.keys(zones).map(z => (
              <option key={z} value={z}>{z.replace(/_/g, " ")}</option>
            ))}
          </select>
          <p className="font-body text-[9px] text-sand/70 mt-2">Haz clic en el mapa para buscar.</p>
        </div>

        {/* Weather Cards */}
        {(isFetchingWeather || activeWeather || weatherError) && (
          <div className="flex flex-col gap-3 pointer-events-auto">
            {isFetchingWeather ? (
              <div className="bg-card border border-primary/20 p-6 rounded-xl shadow-xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-4 duration-300">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="font-display text-[10px] tracking-widest text-primary animate-pulse text-center">ANALIZANDO...</p>
              </div>
            ) : weatherError ? (
              <div className="bg-destructive/10 border border-destructive/50 p-4 rounded-xl shadow-xl flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-4 duration-300">
                <p className="font-display text-[10px] tracking-widest text-destructive text-center font-bold">
                  {weatherError === "Coordinates outside Galapagos area" ? "FUERA DE LOS LÍMITES" : "ERROR DE CONSULTA"}
                </p>
                <p className="font-body text-xs text-sand text-center mt-2">{weatherError}</p>
              </div>
            ) : activeWeather ? (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="bg-card border border-border/50 p-4 rounded-xl shadow-xl">
                  <h4 className="font-display text-[12px] text-foreground tracking-widest mb-1 truncate" title={activeWeather.name}>
                    {activeWeather.name.toUpperCase()}
                  </h4>
                  <p className="font-body text-[9px] text-sand flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                    TIEMPO REAL
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Temp */}
                  <div className="bg-card border border-border/30 p-3 rounded-xl shadow-lg flex flex-col items-center text-center">
                    <Cloud className="w-5 h-5 text-primary mb-2" />
                    <p className="font-body text-[9px] text-sand">TEMP</p>
                    <p className="font-display text-lg text-foreground">
                      {activeWeather.point.temperature_c != null ? `${activeWeather.point.temperature_c.toFixed(1)}°` : '--'}
                    </p>
                  </div>
                  {/* Precip */}
                  <div className="bg-card border border-border/30 p-3 rounded-xl shadow-lg flex flex-col items-center text-center">
                    <CloudRain className="w-5 h-5 text-blue-400 mb-2" />
                    <p className="font-body text-[9px] text-sand">
                      {activeWeather.point.precipitation_mm != null ? 'LLUVIA' : 'PROB.'}
                    </p>
                    <p className="font-display text-lg text-foreground">
                      {activeWeather.point.precipitation_mm != null
                        ? activeWeather.point.precipitation_mm.toFixed(1)
                        : activeWeather.point.precip_prob_pct != null
                          ? activeWeather.point.precip_prob_pct.toFixed(0)
                          : '--'}
                      <span className="text-xs">
                        {activeWeather.point.precipitation_mm != null ? 'mm' : '%'}
                      </span>
                    </p>
                  </div>
                  {/* Wind */}
                  <div className="bg-card border border-border/30 p-3 rounded-xl shadow-lg flex flex-col items-center text-center">
                    <Wind className="w-5 h-5 text-sand mb-2" />
                    <p className="font-body text-[9px] text-sand">VIENTO</p>
                    <p className="font-display text-lg text-foreground">
                      {activeWeather.point.wind_kmh != null
                        ? activeWeather.point.wind_kmh.toFixed(0)
                        : activeWeather.point.windspeed_kmh != null
                          ? activeWeather.point.windspeed_kmh.toFixed(0)
                          : '--'}
                      <span className="text-xs">km/h</span>
                    </p>
                  </div>
                  {/* Humidity */}
                  <div className="bg-card border border-border/30 p-3 rounded-xl shadow-lg flex flex-col items-center text-center">
                    <Droplets className="w-5 h-5 text-sand mb-2" />
                    <p className="font-body text-[9px] text-sand">HUMEDAD</p>
                    <p className="font-display text-lg text-foreground">
                      {activeWeather.point.humidity_pct != null ? activeWeather.point.humidity_pct.toFixed(0) : '--'}
                      <span className="text-xs">%</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SanCristobalMap;
