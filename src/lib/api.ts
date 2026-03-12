const BASE_URL = "https://sala-galapagos-api-629631305612.us-central1.run.app/api/v1";

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

// ── Advisory types ────────────────────────────────────────────────────────────

export type AdvisoryLevel = 'safe' | 'info' | 'caution' | 'danger';

interface AdvisoryBase {
    level: AdvisoryLevel;
    title: string;
    emoji: string;
    detail: string;
    action: string;
}

export interface PescaAdvisory extends AdvisoryBase {
    wind_ms: number;
    wind_dir_deg: number;
    wind_cardinal: string;
    heavy_rain_1h: boolean;
    heavy_rain_3h: boolean;
}

export interface AgroAdvisory extends AdvisoryBase {
    rain_24h_mm: number;
    heavy_6h: boolean;
}

export interface BiodiversidadAdvisory extends AdvisoryBase {
    temp_c: number;
    rh_pct: number;
    alerts: string[];
}

export interface RiesgoAdvisory extends AdvisoryBase {
    flash_flood_risk: boolean;
    heavy_highland_1h: boolean;
    heavy_highland_3h: boolean;
    clear_coastal: boolean;
}

export interface TurismoAdvisory extends AdvisoryBase {
    condition_desc: string;
    condition_type: string;
    temp_c: number;
    comfort_index: number;
    activities: string[];
}

export interface AdvisoriesResponse {
    advisories: {
        pesca: PescaAdvisory;
        agro: AgroAdvisory;
        biodiversidad: BiodiversidadAdvisory;
        riesgo: RiesgoAdvisory;
        turismo: TurismoAdvisory;
    };
    predictions?: unknown[];
    stations?: Record<string, unknown>;
    timestamp: string;
}

import { HISTORICAL_EVENTS, HISTORICAL_SUMMARIES, HISTORICAL_SERIES } from "./historicalDataStore";

// ── Historical types ──────────────────────────────────────────────────────────

export interface HistoricalEvent {
    id: string;
    label: string;
    type: string;
    description: string;
    date_start?: string;
    date_end?: string;
    total_days?: number;
    error?: string;
}

export interface HistoricalEventsResponse {
    events: HistoricalEvent[];
    count: number;
}

export interface HistoricalDataRow {
    date: string;
    temp_c: number;
    dewpoint_c: number;
    sst_c: number;
    wind_ms: number;
    wind_dir_deg: number;
    pressure_hpa: number;
    msl_hpa: number;
    precip_mm: number;
    solar_wm2: number;
}

export interface HistoricalSeriesResponse {
    event: HistoricalEvent;
    data: HistoricalDataRow[];
    count: number;
}

export interface HistoricalStat {
    mean: number;
    max: number;
    min: number;
}

export interface HistoricalSummaryResponse {
    event: HistoricalEvent;
    stats: {
        temp_c: HistoricalStat;
        precip_mm: HistoricalStat;
        wind_ms: HistoricalStat;
        dewpoint_c: HistoricalStat;
        sst_c: HistoricalStat;
        pressure_hpa: HistoricalStat;
        msl_hpa: HistoricalStat;
        solar_wm2: HistoricalStat;
    };
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

// --- Mocks ---

const MOCK_HISTORICAL_EVENTS: HistoricalEvent[] = [
    {
        id: "el_nino_1982_83",
        label: "El Niño 1982–1983",
        type: "el_nino",
        description: "Uno de los El Niño más intensos del siglo XX. Lluvias extremas en Galápagos.",
        error: "CSV not found: app/data/el_nino_1982_83.csv"
    },
    {
        id: "el_nino_1997_98",
        label: "El Niño 1997–1998",
        type: "el_nino",
        description: "El Niño más intenso registrado. Inundaciones masivas y daños severos.",
        error: "CSV not found: app/data/el_nino_1997_98.csv"
    },
    {
        id: "el_nino_2015_16",
        label: "El Niño 2015–2016",
        type: "el_nino",
        description: "Tercer El Niño más fuerte en el registro histórico.",
        error: "CSV not found: app/data/el_nino_2015_16.csv"
    },
    {
        id: "la_nina_2010_11",
        label: "La Niña 2010–2011",
        type: "la_nina",
        description: "Período de sequía y temperaturas frías en el Pacífico ecuatorial.",
        error: "CSV not found: app/data/la_nina_2010_11.csv"
    },
    {
        id: "floods_2023_24",
        label: "Inundaciones 2023–2024",
        type: "floods",
        description: "Evento de inundaciones recientes en San Cristóbal asociado a El Niño 2023.",
        error: "CSV not found: app/data/floods_2023_24.csv"
    }
];

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

    advisories: () =>
        fetchJson<AdvisoriesResponse>('/advisories'),

    historicalEvents: async () => {
        console.log("Using hardcoded historical events");
        return { events: HISTORICAL_EVENTS, count: HISTORICAL_EVENTS.length };
    },

    historicalSeries: async (eventId: string, params?: { from?: string; to?: string; limit?: number }) => {
        console.log(`Using hardcoded historical series for ${eventId}`);
        const series = HISTORICAL_SERIES[eventId] || [];
        return {
            event: HISTORICAL_EVENTS.find(e => e.id === eventId)!,
            data: series,
            count: series.length
        };
    },

    historicalSummary: async (eventId: string) => {
        console.log(`Using hardcoded historical summary for ${eventId}`);
        const summary = HISTORICAL_SUMMARIES[eventId];
        if (!summary) throw new Error(`Historical summary not found for ${eventId}`);
        return summary;
    },
};
