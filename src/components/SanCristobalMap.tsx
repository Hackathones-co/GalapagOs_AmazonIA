import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const stations = [
  { name: "Cerro Alto", lat: -0.875, lng: -89.555, altitude: "300m", status: "active" },
  { name: "El Junco", lat: -0.893, lng: -89.559, altitude: "660m", status: "active" },
  { name: "Merceditas", lat: -0.910, lng: -89.548, altitude: "150m", status: "active" },
  { name: "El Mirador", lat: -0.900, lng: -89.610, altitude: "50m", status: "active" },
];

// Mock risk zone data
const riskZones = [
  { name: "Zona Costera", level: "alto", color: "#ff4444" },
  { name: "Zona Media", level: "medio", color: "#ffaa00" },
  { name: "Zona Alta", level: "bajo", color: "#00f0c8" },
];

const SanCristobalMap = ({ onStationClick }: { onStationClick?: (station: string) => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [-0.895, -89.57],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Custom station markers
    stations.forEach((station) => {
      const icon = L.divIcon({
        className: "custom-station-marker",
        html: `
          <div style="
            width: 12px; height: 12px;
            background: #00f0c8;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(0,240,200,0.6), 0 0 30px rgba(0,240,200,0.2);
            animation: pulse-glow 3s ease-in-out infinite;
          "></div>
        `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([station.lat, station.lng], { icon }).addTo(map);

      marker.bindPopup(`
        <div style="
          background: #111214;
          color: #F0F2F5;
          padding: 12px 16px;
          font-family: 'Roboto Flex', sans-serif;
          border: none;
          min-width: 180px;
        ">
          <div style="
            font-family: 'Montserrat', sans-serif;
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #00f0c8;
            margin-bottom: 6px;
          ">${station.name}</div>
          <div style="font-size: 10px; color: #9D9386; margin-bottom: 4px;">
            ALT: ${station.altitude} · ${station.lat.toFixed(3)}°S, ${Math.abs(station.lng).toFixed(3)}°W
          </div>
          <div style="font-size: 10px; color: #9D9386;">
            ESTADO: <span style="color: #00f0c8;">● ACTIVA</span>
          </div>
          <div style="font-size: 10px; color: #9D9386; margin-top: 6px;">
            TEMP: 22.4°C · HUM: 78% · VIENTO: 12 km/h
          </div>
        </div>
      `, {
        className: "galapagos-popup",
        closeButton: false,
      });

      marker.on("click", () => {
        onStationClick?.(station.name);
      });
    });

    // Risk zone circles (simplified)
    L.circle([-0.900, -89.610], {
      radius: 800,
      color: "#ff4444",
      fillColor: "#ff4444",
      fillOpacity: 0.08,
      weight: 0.5,
    }).addTo(map);

    L.circle([-0.890, -89.560], {
      radius: 1200,
      color: "#ffaa00",
      fillColor: "#ffaa00",
      fillOpacity: 0.06,
      weight: 0.5,
    }).addTo(map);

    L.circle([-0.880, -89.555], {
      radius: 1000,
      color: "#00f0c8",
      fillColor: "#00f0c8",
      fillOpacity: 0.05,
      weight: 0.5,
    }).addTo(map);

    // Zoom control positioned
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onStationClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map overlay legend */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-background/80 backdrop-blur-sm p-3">
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-2">
            ESTACIONES METEOROLÓGICAS
          </h3>
          {stations.map((s) => (
            <div key={s.name} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-bioluminescent" />
              <span className="font-body text-[9px] text-sand">{s.name.toUpperCase()} · {s.altitude}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk zones legend */}
      <div className="absolute top-4 right-4 z-[1000]">
        <div className="bg-background/80 backdrop-blur-sm p-3">
          <h3 className="font-display text-[10px] text-foreground tracking-[0.15em] mb-2">
            ZONAS DE RIESGO
          </h3>
          {riskZones.map((z) => (
            <div key={z.name} className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.color }} />
              <span className="font-body text-[9px] text-sand">
                {z.name.toUpperCase()} · {z.level.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom popup styles */}
      <style>{`
        .galapagos-popup .leaflet-popup-content-wrapper {
          background: #111214;
          border-radius: 0;
          border: 1px solid rgba(0,240,200,0.2);
          box-shadow: 0 0 20px rgba(0,240,200,0.1);
        }
        .galapagos-popup .leaflet-popup-tip {
          background: #111214;
          border: 1px solid rgba(0,240,200,0.2);
        }
        .galapagos-popup .leaflet-popup-content {
          margin: 0;
        }
        .leaflet-control-zoom a {
          background: #111214 !important;
          color: #F0F2F5 !important;
          border-color: rgba(0,240,200,0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default SanCristobalMap;
