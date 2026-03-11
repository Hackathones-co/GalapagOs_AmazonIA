const BASE_URL = "http://localhost:8000/api/v1";

// Station codes mapping
export const STATION_CODES: Record<string, string> = {
    "Cerro Alto": "cer",
    "El Junco": "jun",
    "Merceditas": "merc",
    "El Mirador": "mira",
};

// --- Types ---

export interface NowcastResponse {
    station: string;
    timestamp: string;
    temperature_c?: number;
    precipitation_mm?: number;
    wind_kmh?: number;
    humidity_pct?: number;
    rain_prob_pct?: number;
    [key: string]: unknown;
}

export interface AlertsResponse {
    level: number;
    level_name: string;
    summary: string;
    details?: string;
    accumulated_mm?: number;
    soil_saturation_pct?: number;
    [key: string]: unknown;
}

export interface PescaScore {
    score: number;
    label: string;
    window?: string;
    wind?: string;
    swell?: string;
    [key: string]: unknown;
}

export interface AgroCalendar {
    recommendations?: string[];
    events?: Array<{ date: string; activity: string }>;
    [key: string]: unknown;
}

export interface BioStatus {
    status: string;
    alerts?: string[];
    species_at_risk?: string[];
    [key: string]: unknown;
}

export interface RiskZones {
    level: number;
    level_name: string;
    zones?: Array<{ name: string; risk: string }>;
    [key: string]: unknown;
}

export interface VisitRecommend {
    activities?: Array<{ name: string; score: number; description: string }>;
    [key: string]: unknown;
}

export interface ChatResponse {
    response: string;
    module?: string;
    [key: string]: unknown;
}

export interface VoiceSignedUrl {
    url: string;
    agent_id: string;
    dynamic_variables: Record<string, any>;
    [key: string]: unknown;
}

// --- Helpers ---

const fetchJson = async <T>(path: string, opts?: RequestInit): Promise<T> => {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...opts,
        headers: { "Content-Type": "application/json", ...(opts?.headers ?? {}) },
    });
    if (!res.ok) {
        let errorMsg = `API error ${res.status}: ${path}`;
        try {
            const errData = await res.json();
            if (errData && errData.detail) {
                errorMsg = errData.detail;
            }
        } catch (e) { }
        throw new Error(errorMsg);
    }
    return res.json() as Promise<T>;
};

// --- Endpoints ---

export const api = {
    nowcast: (stationCode: string) =>
        fetchJson<NowcastResponse>(`/nowcast/${stationCode}`),

    alerts: () =>
        fetchJson<AlertsResponse>("/alerts"),

    pesca: () =>
        fetchJson<PescaScore>("/pesca/score"),

    agro: () =>
        fetchJson<AgroCalendar>("/agro/calendar"),

    bio: () =>
        fetchJson<BioStatus>("/bio/status"),

    risk: () =>
        fetchJson<RiskZones>("/risk/zones"),

    visit: (topN = 5) =>
        fetchJson<VisitRecommend>(`/visit/recommend?top_n=${topN}`),

    chat: (message: string, module: string = "pesca") =>
        fetchJson<ChatResponse>("/chat", {
            method: "POST",
            body: JSON.stringify({ message, module }),
        }),

    voiceSignedUrl: () =>
        fetchJson<VoiceSignedUrl>("/voice/signed-url"),

    // --- Weather Map / Geospatial ---
    getZones: () =>
        fetchJson<Record<string, { lat: number; lon: number; desc: string }>>("/weather/zones"),

    getZoneWeather: (zoneName: string, radius_km = 10, points = 4) =>
        fetchJson<any>(`/weather/zone/${encodeURIComponent(zoneName)}?radius_km=${radius_km}&points=${points}`),

    getGridWeather: (lat: number, lon: number, radius_km = 30, cell_size_km = 20) =>
        fetchJson<any>(`/weather/grid?lat=${lat}&lon=${lon}&radius_km=${radius_km}&cell_size_km=${cell_size_km}`),
};
