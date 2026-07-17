"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";

type LatLng = {
    lat: number;
    lng: number;
};

type KecamatanGroup = {
    kecamatan: string;
    center: LatLng;
    kelurahan: string[];
};

type KelurahanSeed = {
    kecamatan: string;
    kelurahan: string;
    lat: number;
    lng: number;
};

type RwArea = {
    id: string;
    kecamatan: string;
    kelurahan: string;
    rw: string;
    paths: LatLng[];
    labelPosition: LatLng;
};

type RtArea = {
    id: string;
    kecamatan: string;
    kelurahan: string;
    rw: string;
    rt: string;
    paths: LatLng[];
    labelPosition: LatLng;
};

type LocalSearchItem = {
    name: string;
    type: "Kecamatan" | "Kelurahan" | "Lokasi";
    lat: number;
    lng: number;
    kecamatan?: string;
    kelurahan?: string;
    kabupatenKota?: string;
    provinsi?: string;
    aliases?: string[];
};

type NominatimAddress = {
    neighbourhood?: string;
    suburb?: string;
    village?: string;
    hamlet?: string;
    quarter?: string;
    city_district?: string;
    district?: string;
    subdistrict?: string;
    town?: string;
    city?: string;
    municipality?: string;
    county?: string;
    state?: string;
    province?: string;
    region?: string;
    country?: string;
};

type NominatimResult = {
    display_name: string;
    lat: string;
    lon: string;
    boundingbox?: string[];
    type?: string;
    class?: string;
    address?: NominatimAddress;
};

type SearchPopupData = {
    title: string;
    kategori: string;
    alamat?: string;
    kelurahan: string;
    kecamatan: string;
    kabupatenKota: string;
    provinsi: string;
    lat: number;
    lng: number;
    sumber: "Data Lokal" | "OpenStreetMap";
};

const DEFAULT_ADMIN = {
    kabupatenKota: "Kota Batam",
    provinsi: "Kepulauan Riau",
};

const KECAMATAN_BATAM: KecamatanGroup[] = [
    {
        kecamatan: "Belakang Padang",
        center: { lat: 1.152, lng: 103.895 },
        kelurahan: [
            "Pulau Terong",
            "Pecong",
            "Kasu",
            "Pemping",
            "Tanjung Sari",
            "Sekanak Raya",
        ],
    },
    {
        kecamatan: "Bulang",
        center: { lat: 0.985, lng: 103.835 },
        kelurahan: [
            "Pantai Gelam",
            "Temoyong",
            "Pulau Setokok",
            "Batu Legong",
            "Bulang Lintang",
            "Pulau Buluh",
        ],
    },
    {
        kecamatan: "Galang",
        center: { lat: 0.89, lng: 104.18 },
        kelurahan: [
            "Pulau Abang",
            "Karas",
            "Sijantung",
            "Sembulang",
            "Rempang Cate",
            "Subang Mas",
            "Galang Baru",
            "Air Raja",
        ],
    },
    {
        kecamatan: "Sei Beduk",
        center: { lat: 1.044, lng: 104.05 },
        kelurahan: [
            "Tanjung Piayu",
            "Duriangkang",
            "Mangsang",
            "Mukakuning",
        ],
    },
    {
        kecamatan: "Nongsa",
        center: { lat: 1.191, lng: 104.095 },
        kelurahan: [
            "Ngenang",
            "Kabil",
            "Batu Besar",
            "Sambau",
        ],
    },
    {
        kecamatan: "Sekupang",
        center: { lat: 1.115, lng: 103.94 },
        kelurahan: [
            "Tanjung Riau",
            "Tiban Baru",
            "Tiban Lama",
            "Tiban Indah",
            "Patam Lestari",
            "Sungai Harapan",
            "Tanjung Pinggir",
        ],
    },
    {
        kecamatan: "Lubuk Baja",
        center: { lat: 1.135, lng: 104.006 },
        kelurahan: [
            "Batu Selicin",
            "Lubuk Baja Kota",
            "Kampung Pelita",
            "Baloi Indah",
            "Tanjung Uma",
        ],
    },
    {
        kecamatan: "Batu Ampar",
        center: { lat: 1.163, lng: 104.0 },
        kelurahan: [
            "Tanjung Sengkuang",
            "Sungai Jodoh",
            "Batu Merah",
            "Kampung Seraya",
        ],
    },
    {
        kecamatan: "Batam Kota",
        center: { lat: 1.1185, lng: 104.053 },
        kelurahan: [
            "Teluk Tering",
            "Taman Baloi",
            "Sukajadi",
            "Belian",
            "Sungai Panas",
            "Baloi Permai",
        ],
    },
    {
        kecamatan: "Sagulung",
        center: { lat: 1.025, lng: 103.994 },
        kelurahan: [
            "Tembesi",
            "Sungai Binti",
            "Sungai Lekop",
            "Sagulung Kota",
            "Sungai Langkai",
            "Sungai Pelunggut",
        ],
    },
    {
        kecamatan: "Batu Aji",
        center: { lat: 1.041, lng: 103.969 },
        kelurahan: [
            "Bukit Tempayan",
            "Buliang",
            "Kibing",
            "Tanjung Uncang",
        ],
    },
    {
        kecamatan: "Bengkong",
        center: { lat: 1.143, lng: 104.032 },
        kelurahan: [
            "Bengkong Laut",
            "Bengkong Indah",
            "Sadai",
            "Tanjung Buntung",
        ],
    },
];

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function normalizeText(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replaceAll(".", "")
        .replaceAll(",", "")
        .replace(/\s+/g, " ");
}

function safeValue(value?: string) {
    const clean = value?.trim();
    return clean && clean.length > 0 ? clean : "-";
}

function buildSearchPopupContent(data: SearchPopupData) {
    const alamatSection = data.alamat
        ? `
            <div style="margin-top: 6px; color: #4b5563; line-height: 1.35;">
                ${escapeHtml(data.alamat)}
            </div>
        `
        : "";

    return `
        <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 300px; color: #111827;">
            <strong style="font-size: 14px;">${escapeHtml(data.title)}</strong><br/>
            <span style="color: #4b5563;">${escapeHtml(data.kategori)}</span>

            ${alamatSection}

            <div style="height: 1px; background: #e5e7eb; margin: 8px 0;"></div>

            <table style="border-collapse: collapse; width: 100%; font-size: 13px;">
                <tbody>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Kelurahan</td>
                        <td style="padding: 2px 0; font-weight: 600;">${escapeHtml(data.kelurahan)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Kecamatan</td>
                        <td style="padding: 2px 0; font-weight: 600;">${escapeHtml(data.kecamatan)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Kabupaten/Kota</td>
                        <td style="padding: 2px 0; font-weight: 600;">${escapeHtml(data.kabupatenKota)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Provinsi</td>
                        <td style="padding: 2px 0; font-weight: 600;">${escapeHtml(data.provinsi)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Latitude</td>
                        <td style="padding: 2px 0; font-weight: 600;">${data.lat.toFixed(6)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px 8px 2px 0; color: #6b7280;">Longitude</td>
                        <td style="padding: 2px 0; font-weight: 600;">${data.lng.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>

            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
                Sumber: ${escapeHtml(data.sumber)}
            </div>
        </div>
    `;
}

function createKelurahanSeeds(): KelurahanSeed[] {
    const result: KelurahanSeed[] = [];

    KECAMATAN_BATAM.forEach((group) => {
        const total = group.kelurahan.length;

        group.kelurahan.forEach((kelurahan, index) => {
            const angle = (Math.PI * 2 * index) / total;
            const radius = 0.012 + (index % 3) * 0.003;

            result.push({
                kecamatan: group.kecamatan,
                kelurahan,
                lat: group.center.lat + Math.sin(angle) * radius,
                lng: group.center.lng + Math.cos(angle) * radius,
            });
        });
    });

    return result;
}

const KELURAHAN_BATAM_SEEDS = createKelurahanSeeds();

const LOCAL_SEARCH_ITEMS: LocalSearchItem[] = [
    ...KECAMATAN_BATAM.map((item) => ({
        name: item.kecamatan,
        type: "Kecamatan" as const,
        lat: item.center.lat,
        lng: item.center.lng,
        kecamatan: item.kecamatan,
        kelurahan: "-",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: [`Kecamatan ${item.kecamatan}`, `${item.kecamatan} Batam`],
    })),

    ...KELURAHAN_BATAM_SEEDS.map((item) => ({
        name: item.kelurahan,
        type: "Kelurahan" as const,
        lat: item.lat,
        lng: item.lng,
        kecamatan: item.kecamatan,
        kelurahan: item.kelurahan,
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: [
            `Kelurahan ${item.kelurahan}`,
            `${item.kelurahan} Batam`,
            `${item.kelurahan}, ${item.kecamatan}`,
        ],
    })),

    {
        name: "Batam Center",
        type: "Lokasi",
        lat: 1.1185,
        lng: 104.053,
        kecamatan: "Batam Kota",
        kelurahan: "Teluk Tering",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: ["Batam Centre", "Pusat Kota Batam", "Batam Kota"],
    },
    {
        name: "Nagoya Batam",
        type: "Lokasi",
        lat: 1.1457,
        lng: 104.0106,
        kecamatan: "Lubuk Baja",
        kelurahan: "Lubuk Baja Kota",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: ["Nagoya", "Nagoya Hill", "Nagoya Hill Batam"],
    },
    {
        name: "Sekupang Batam",
        type: "Lokasi",
        lat: 1.115,
        lng: 103.94,
        kecamatan: "Sekupang",
        kelurahan: "-",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: ["Sekupang"],
    },
    {
        name: "Batu Aji Batam",
        type: "Lokasi",
        lat: 1.041,
        lng: 103.969,
        kecamatan: "Batu Aji",
        kelurahan: "-",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: ["Batu Aji"],
    },
    {
        name: "Nongsa Batam",
        type: "Lokasi",
        lat: 1.191,
        lng: 104.095,
        kecamatan: "Nongsa",
        kelurahan: "-",
        kabupatenKota: DEFAULT_ADMIN.kabupatenKota,
        provinsi: DEFAULT_ADMIN.provinsi,
        aliases: ["Nongsa"],
    },
];

function findLocalSearchItem(query: string) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return null;

    const exact = LOCAL_SEARCH_ITEMS.find((item) => {
        const names = [item.name, ...(item.aliases ?? [])].map(normalizeText);
        return names.includes(normalizedQuery);
    });

    if (exact) return exact;

    const contains = LOCAL_SEARCH_ITEMS.find((item) => {
        const names = [item.name, ...(item.aliases ?? [])].map(normalizeText);

        return names.some((name) => {
            return name.includes(normalizedQuery) || normalizedQuery.includes(name);
        });
    });

    return contains ?? null;
}

function getNominatimAdministrative(result: NominatimResult) {
    const address = result.address ?? {};

    const kelurahan =
        address.village ||
        address.suburb ||
        address.neighbourhood ||
        address.quarter ||
        address.hamlet ||
        "-";

    const kecamatan =
        address.city_district ||
        address.district ||
        address.subdistrict ||
        "-";

    const kabupatenKota =
        address.city ||
        address.town ||
        address.municipality ||
        address.county ||
        DEFAULT_ADMIN.kabupatenKota;

    const provinsi =
        address.state ||
        address.province ||
        address.region ||
        DEFAULT_ADMIN.provinsi;

    return {
        kelurahan: safeValue(kelurahan),
        kecamatan: safeValue(kecamatan),
        kabupatenKota: safeValue(kabupatenKota),
        provinsi: safeValue(provinsi),
    };
}

function createRect(center: LatLng, halfLat: number, halfLng: number): LatLng[] {
    return [
        { lat: center.lat - halfLat, lng: center.lng - halfLng },
        { lat: center.lat - halfLat, lng: center.lng + halfLng },
        { lat: center.lat + halfLat, lng: center.lng + halfLng },
        { lat: center.lat + halfLat, lng: center.lng - halfLng },
    ];
}

function createInsetRect(
    south: number,
    west: number,
    north: number,
    east: number,
    insetRatio = 0.06
): LatLng[] {
    const latInset = (north - south) * insetRatio;
    const lngInset = (east - west) * insetRatio;

    return [
        { lat: south + latInset, lng: west + lngInset },
        { lat: south + latInset, lng: east - lngInset },
        { lat: north - latInset, lng: east - lngInset },
        { lat: north - latInset, lng: west + lngInset },
    ];
}

function getRectCenter(paths: LatLng[]): LatLng {
    const lat = paths.reduce((sum, point) => sum + point.lat, 0) / paths.length;
    const lng = paths.reduce((sum, point) => sum + point.lng, 0) / paths.length;

    return { lat, lng };
}

function toLeafletPath(paths: LatLng[]): [number, number][] {
    return paths.map((point) => [point.lat, point.lng]);
}

function generateDummyRTRW() {
    const rwAreas: RwArea[] = [];
    const rtAreas: RtArea[] = [];

    KELURAHAN_BATAM_SEEDS.forEach((seed) => {
        const rwHalfLat = 0.003;
        const rwHalfLng = 0.0038;

        const rwCenters = [
            {
                lat: seed.lat + 0.0032,
                lng: seed.lng,
            },
            {
                lat: seed.lat - 0.0032,
                lng: seed.lng,
            },
        ];

        rwCenters.forEach((rwCenter, rwIndex) => {
            const rw = `RW ${String(rwIndex + 1).padStart(2, "0")}`;
            const rwPaths = createRect(rwCenter, rwHalfLat, rwHalfLng);

            rwAreas.push({
                id: `${seed.kecamatan}-${seed.kelurahan}-${rw}`,
                kecamatan: seed.kecamatan,
                kelurahan: seed.kelurahan,
                rw,
                paths: rwPaths,
                labelPosition: rwCenter,
            });

            const south = rwCenter.lat - rwHalfLat;
            const north = rwCenter.lat + rwHalfLat;
            const west = rwCenter.lng - rwHalfLng;
            const east = rwCenter.lng + rwHalfLng;

            const midLat = (south + north) / 2;
            const midLng = (west + east) / 2;

            const rtBoxes = [
                {
                    rt: "RT 01",
                    south: midLat,
                    west,
                    north,
                    east: midLng,
                },
                {
                    rt: "RT 02",
                    south: midLat,
                    west: midLng,
                    north,
                    east,
                },
                {
                    rt: "RT 03",
                    south,
                    west,
                    north: midLat,
                    east: midLng,
                },
                {
                    rt: "RT 04",
                    south,
                    west: midLng,
                    north: midLat,
                    east,
                },
            ];

            rtBoxes.forEach((box) => {
                const rtPaths = createInsetRect(
                    box.south,
                    box.west,
                    box.north,
                    box.east,
                    0.06
                );

                rtAreas.push({
                    id: `${seed.kecamatan}-${seed.kelurahan}-${rw}-${box.rt}`,
                    kecamatan: seed.kecamatan,
                    kelurahan: seed.kelurahan,
                    rw,
                    rt: box.rt,
                    paths: rtPaths,
                    labelPosition: getRectCenter(rtPaths),
                });
            });
        });
    });

    return { rwAreas, rtAreas };
}

const { rwAreas, rtAreas } = generateDummyRTRW();

export default function MapArea() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);

    const leafletRef = useRef<any>(null);

    const rwLayerRef = useRef<LayerGroup | null>(null);
    const rtLayerRef = useRef<LayerGroup | null>(null);
    const rwLabelLayerRef = useRef<LayerGroup | null>(null);
    const rtLabelLayerRef = useRef<LayerGroup | null>(null);
    const kelurahanLabelLayerRef = useRef<LayerGroup | null>(null);

    const userMarkerRef = useRef<Marker | null>(null);
    const searchMarkerRef = useRef<Marker | null>(null);
    const searchAbortRef = useRef<AbortController | null>(null);
    const pendingSearchQueryRef = useRef<string | null>(null);

    const [ready, setReady] = useState(false);

    const rtrwVisibleRef = useRef(false);
    const requestedRtrwVisibleRef = useRef(false);

    const BATAM_BOUNDS: [[number, number], [number, number]] = [
        [0.82, 103.78],
        [1.25, 104.28],
    ];

    const createTextIcon = (
        text: string,
        className: "kelurahan-label" | "rw-label" | "rt-label"
    ) => {
        const L = leafletRef.current;

        return L.divIcon({
            className: "rtrw-label-wrapper",
            html: `<div class="${className}">${escapeHtml(text)}</div>`,
            iconSize: [120, 26],
            iconAnchor: [60, 13],
        });
    };

    const notifySearchStatus = (
        message: string,
        type: "info" | "success" | "error" = "info"
    ) => {
        window.dispatchEvent(
            new CustomEvent("map-location-search-status", {
                detail: {
                    message,
                    type,
                },
            })
        );
    };

    const clearSearchMarker = () => {
        const map = mapInstanceRef.current;

        if (map && searchMarkerRef.current) {
            map.removeLayer(searchMarkerRef.current);
        }

        searchMarkerRef.current = null;
    };

    const addSearchMarker = (data: SearchPopupData) => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;

        if (!map || !L) return;

        clearSearchMarker();

        const marker = L.marker([data.lat, data.lng])
            .addTo(map)
            .bindPopup(buildSearchPopupContent(data))
            .openPopup();

        searchMarkerRef.current = marker;
    };

    const searchLocationOnMap = async (query: string) => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;
        const cleanQuery = query.trim();

        if (!cleanQuery) {
            notifySearchStatus("Masukkan nama lokasi terlebih dahulu.", "error");
            return;
        }

        if (!map || !L) {
            pendingSearchQueryRef.current = cleanQuery;
            notifySearchStatus("Peta belum siap. Coba lagi sebentar.", "info");
            return;
        }

        const localResult = findLocalSearchItem(cleanQuery);

        if (localResult) {
            map.setView([localResult.lat, localResult.lng], 15, {
                animate: true,
            });

            addSearchMarker({
                title: localResult.name,
                kategori: localResult.type,
                kelurahan: safeValue(localResult.kelurahan),
                kecamatan: safeValue(localResult.kecamatan),
                kabupatenKota: safeValue(localResult.kabupatenKota ?? DEFAULT_ADMIN.kabupatenKota),
                provinsi: safeValue(localResult.provinsi ?? DEFAULT_ADMIN.provinsi),
                lat: localResult.lat,
                lng: localResult.lng,
                sumber: "Data Lokal",
            });

            notifySearchStatus(`Ditemukan dari data lokal: ${localResult.name}`, "success");
            return;
        }

        searchAbortRef.current?.abort();

        const controller = new AbortController();
        searchAbortRef.current = controller;

        notifySearchStatus("Mencari lokasi dari OpenStreetMap...", "info");

        try {
            const searchText = /batam/i.test(cleanQuery)
                ? cleanQuery
                : `${cleanQuery}, Batam, Kepulauan Riau, Indonesia`;

            const params = new URLSearchParams({
                q: searchText,
                format: "jsonv2",
                addressdetails: "1",
                limit: "5",
                countrycodes: "id",
                "accept-language": "id",
                viewbox: "103.78,1.25,104.28,0.82",
                bounded: "0",
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                {
                    method: "GET",
                    signal: controller.signal,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const results = (await response.json()) as NominatimResult[];

            if (!Array.isArray(results) || results.length === 0) {
                clearSearchMarker();
                notifySearchStatus("Lokasi tidak ditemukan.", "error");
                alert("Lokasi tidak ditemukan. Coba kata kunci lain.");
                return;
            }

            const selected = results[0];
            const lat = Number(selected.lat);
            const lng = Number(selected.lon);

            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                clearSearchMarker();
                notifySearchStatus("Koordinat lokasi tidak valid.", "error");
                alert("Koordinat lokasi tidak valid.");
                return;
            }

            const admin = getNominatimAdministrative(selected);
            const bounds = selected.boundingbox;

            if (Array.isArray(bounds) && bounds.length >= 4) {
                const south = Number(bounds[0]);
                const north = Number(bounds[1]);
                const west = Number(bounds[2]);
                const east = Number(bounds[3]);

                if (
                    Number.isFinite(south) &&
                    Number.isFinite(north) &&
                    Number.isFinite(west) &&
                    Number.isFinite(east)
                ) {
                    map.fitBounds(
                        [
                            [south, west],
                            [north, east],
                        ],
                        {
                            padding: [40, 40],
                            maxZoom: 17,
                        }
                    );
                } else {
                    map.setView([lat, lng], 16, {
                        animate: true,
                    });
                }
            } else {
                map.setView([lat, lng], 16, {
                    animate: true,
                });
            }

            addSearchMarker({
                title: "Hasil Pencarian Lokasi",
                kategori: selected.type ? `Lokasi ${selected.type}` : "Lokasi",
                alamat: selected.display_name,
                kelurahan: admin.kelurahan,
                kecamatan: admin.kecamatan,
                kabupatenKota: admin.kabupatenKota,
                provinsi: admin.provinsi,
                lat,
                lng,
                sumber: "OpenStreetMap",
            });

            notifySearchStatus(`Ditemukan: ${selected.display_name}`, "success");
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }

            console.error("Gagal mencari lokasi:", error);
            clearSearchMarker();
            notifySearchStatus("Gagal mencari lokasi. Coba lagi.", "error");
            alert("Gagal mencari lokasi. Coba lagi.");
        }
    };

    const clearRTRWLayer = () => {
        const map = mapInstanceRef.current;

        rwLayerRef.current?.clearLayers();
        rtLayerRef.current?.clearLayers();
        rwLabelLayerRef.current?.clearLayers();
        rtLabelLayerRef.current?.clearLayers();
        kelurahanLabelLayerRef.current?.clearLayers();

        if (map) {
            if (rwLayerRef.current && map.hasLayer(rwLayerRef.current)) {
                map.removeLayer(rwLayerRef.current);
            }

            if (rtLayerRef.current && map.hasLayer(rtLayerRef.current)) {
                map.removeLayer(rtLayerRef.current);
            }

            if (rwLabelLayerRef.current && map.hasLayer(rwLabelLayerRef.current)) {
                map.removeLayer(rwLabelLayerRef.current);
            }

            if (rtLabelLayerRef.current && map.hasLayer(rtLabelLayerRef.current)) {
                map.removeLayer(rtLabelLayerRef.current);
            }

            if (
                kelurahanLabelLayerRef.current &&
                map.hasLayer(kelurahanLabelLayerRef.current)
            ) {
                map.removeLayer(kelurahanLabelLayerRef.current);
            }
        }

        rtrwVisibleRef.current = false;
    };

    const applyLabelVisibility = () => {
        const map = mapInstanceRef.current;

        if (!map || !rtrwVisibleRef.current) return;

        const zoom = map.getZoom();

        if (kelurahanLabelLayerRef.current) {
            if (zoom >= 10) {
                if (!map.hasLayer(kelurahanLabelLayerRef.current)) {
                    kelurahanLabelLayerRef.current.addTo(map);
                }
            } else if (map.hasLayer(kelurahanLabelLayerRef.current)) {
                map.removeLayer(kelurahanLabelLayerRef.current);
            }
        }

        if (rwLabelLayerRef.current) {
            if (zoom >= 12) {
                if (!map.hasLayer(rwLabelLayerRef.current)) {
                    rwLabelLayerRef.current.addTo(map);
                }
            } else if (map.hasLayer(rwLabelLayerRef.current)) {
                map.removeLayer(rwLabelLayerRef.current);
            }
        }

        if (rtLabelLayerRef.current) {
            if (zoom >= 14) {
                if (!map.hasLayer(rtLabelLayerRef.current)) {
                    rtLabelLayerRef.current.addTo(map);
                }
            } else if (map.hasLayer(rtLabelLayerRef.current)) {
                map.removeLayer(rtLabelLayerRef.current);
            }
        }
    };

    const fitToKotaBatamDummy = () => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;

        if (!map || !L) return;

        const allPoints: [number, number][] = [];

        rwAreas.forEach((area) => {
            area.paths.forEach((point) => {
                allPoints.push([point.lat, point.lng]);
            });
        });

        if (allPoints.length > 0) {
            map.fitBounds(L.latLngBounds(allPoints), {
                padding: [30, 30],
            });
        }
    };

    const showRTRWLayer = () => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;

        if (
            !map ||
            !L ||
            !rwLayerRef.current ||
            !rtLayerRef.current ||
            !rwLabelLayerRef.current ||
            !rtLabelLayerRef.current ||
            !kelurahanLabelLayerRef.current
        ) {
            return;
        }

        clearRTRWLayer();

        KELURAHAN_BATAM_SEEDS.forEach((area) => {
            L.marker([area.lat, area.lng], {
                icon: createTextIcon(area.kelurahan, "kelurahan-label"),
                interactive: false,
                keyboard: false,
            }).addTo(kelurahanLabelLayerRef.current);
        });

        rwAreas.forEach((area) => {
            L.polygon(toLeafletPath(area.paths), {
                color: "#8b3dff",
                weight: 4,
                opacity: 1,
                fillColor: "#8b3dff",
                fillOpacity: 0.1,
                interactive: true,
            })
                .addTo(rwLayerRef.current)
                .bindPopup(`
                    <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 280px;">
                        <strong>Batas RW Dummy</strong><br/>
                        Provinsi: Kepulauan Riau<br/>
                        Kabupaten/Kota: Kota Batam<br/>
                        Kecamatan: ${escapeHtml(area.kecamatan)}<br/>
                        Kelurahan: ${escapeHtml(area.kelurahan)}<br/>
                        RW: ${escapeHtml(area.rw)}
                    </div>
                `);

            L.marker([area.labelPosition.lat, area.labelPosition.lng], {
                icon: createTextIcon(area.rw, "rw-label"),
                interactive: false,
                keyboard: false,
            }).addTo(rwLabelLayerRef.current);
        });

        rtAreas.forEach((area) => {
            L.polygon(toLeafletPath(area.paths), {
                color: "#fbc02d",
                weight: 2,
                opacity: 1,
                fillColor: "#fbc02d",
                fillOpacity: 0.16,
                interactive: true,
            })
                .addTo(rtLayerRef.current)
                .bindPopup(`
                    <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 280px;">
                        <strong>Batas RT Dummy</strong><br/>
                        Provinsi: Kepulauan Riau<br/>
                        Kabupaten/Kota: Kota Batam<br/>
                        Kecamatan: ${escapeHtml(area.kecamatan)}<br/>
                        Kelurahan: ${escapeHtml(area.kelurahan)}<br/>
                        RW: ${escapeHtml(area.rw)}<br/>
                        RT: ${escapeHtml(area.rt)}
                    </div>
                `);

            L.marker([area.labelPosition.lat, area.labelPosition.lng], {
                icon: createTextIcon(area.rt, "rt-label"),
                interactive: false,
                keyboard: false,
            }).addTo(rtLabelLayerRef.current);
        });

        rwLayerRef.current.addTo(map);
        rtLayerRef.current.addTo(map);

        rtrwVisibleRef.current = true;

        fitToKotaBatamDummy();
        applyLabelVisibility();
    };

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;
        if (mapInstanceRef.current) return;

        let mounted = true;

        const initMap = async () => {
            const L = (await import("leaflet")).default;
            leafletRef.current = L;

            if (!document.querySelector('link[href*="leaflet@1.9.4"]')) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            if (!mounted || !mapRef.current) return;

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl:
                    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current, {
                center: [1.1185, 104.053],
                zoom: 11,
                minZoom: 7,
                maxZoom: 19,
                zoomControl: false,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
            }).addTo(map);

            map.fitBounds(BATAM_BOUNDS);

            mapInstanceRef.current = map;

            rwLayerRef.current = L.layerGroup();
            rtLayerRef.current = L.layerGroup();
            rwLabelLayerRef.current = L.layerGroup();
            rtLabelLayerRef.current = L.layerGroup();
            kelurahanLabelLayerRef.current = L.layerGroup();

            map.on("zoomend", applyLabelVisibility);

            setTimeout(() => {
                map.invalidateSize();

                if (requestedRtrwVisibleRef.current) {
                    showRTRWLayer();
                }

                if (pendingSearchQueryRef.current) {
                    const pendingQuery = pendingSearchQueryRef.current;
                    pendingSearchQueryRef.current = null;
                    void searchLocationOnMap(pendingQuery);
                }
            }, 300);

            if (mounted) setReady(true);
        };

        const handleLayerToggle = (event: Event) => {
            const customEvent = event as CustomEvent<{
                layer: string;
                visible: boolean;
            }>;

            if (customEvent.detail.layer !== "rtrw") return;

            requestedRtrwVisibleRef.current = customEvent.detail.visible;

            if (customEvent.detail.visible) {
                showRTRWLayer();
            } else {
                clearRTRWLayer();
            }
        };

        const handleLocationSearch = (event: Event) => {
            const customEvent = event as CustomEvent<{
                query: string;
            }>;

            void searchLocationOnMap(customEvent.detail.query);
        };

        const handleLocationClear = () => {
            const map = mapInstanceRef.current;

            clearSearchMarker();
            notifySearchStatus("", "info");

            if (map) {
                map.closePopup();
            }
        };

        window.addEventListener("layer-toggle", handleLayerToggle);
        window.addEventListener("map-location-search", handleLocationSearch);
        window.addEventListener("map-location-clear", handleLocationClear);

        initMap();

        return () => {
            mounted = false;

            window.removeEventListener("layer-toggle", handleLayerToggle);
            window.removeEventListener("map-location-search", handleLocationSearch);
            window.removeEventListener("map-location-clear", handleLocationClear);

            searchAbortRef.current?.abort();

            clearRTRWLayer();
            clearSearchMarker();

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            rwLayerRef.current = null;
            rtLayerRef.current = null;
            rwLabelLayerRef.current = null;
            rtLabelLayerRef.current = null;
            kelurahanLabelLayerRef.current = null;
            userMarkerRef.current = null;
            searchMarkerRef.current = null;
        };
    }, []);

    const handleZoomIn = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.setZoom(map.getZoom() - 1);
    };

    const handleResetView = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        map.fitBounds(BATAM_BOUNDS);
    };

    const handleMyLocation = async () => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;

        if (!map || !L || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;

                map.setView([lat, lng], 17);

                if (userMarkerRef.current) {
                    map.removeLayer(userMarkerRef.current);
                    userMarkerRef.current = null;
                }

                const marker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("Lokasi Anda")
                    .openPopup();

                userMarkerRef.current = marker;
            },
            () => alert("Lokasi tidak dapat diakses.")
        );
    };

    const handleFullscreen = () => {
        const el = mapRef.current?.parentElement;
        if (!el) return;

        if (!document.fullscreenElement) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const handlePan = async (dir: "up" | "down" | "left" | "right") => {
        const map = mapInstanceRef.current;
        const L = leafletRef.current;

        if (!map || !L) return;

        const amount = 150;
        const center = map.getCenter();
        const point = map.latLngToContainerPoint(center);

        const newPoint = L.point(
            point.x + (dir === "right" ? amount : dir === "left" ? -amount : 0),
            point.y + (dir === "down" ? amount : dir === "up" ? -amount : 0)
        );

        map.panTo(map.containerPointToLatLng(newPoint), { animate: true });
    };

    return (
        <main className="map-area" style={{ position: "relative", overflow: "hidden" }}>
            <style jsx global>{`
                .rtrw-label-wrapper {
                    background: transparent;
                    border: none;
                    pointer-events: none;
                }

                .kelurahan-label,
                .rw-label,
                .rt-label {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: max-content;
                    white-space: nowrap;
                    border-radius: 6px;
                    padding: 2px 6px;
                    font-family: Arial, sans-serif;
                    line-height: 1.2;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
                }

                .kelurahan-label {
                    background: rgba(255, 255, 255, 0.96);
                    border: 1px solid rgba(17, 24, 39, 0.2);
                    color: #111827;
                    font-size: 11px;
                    font-weight: 800;
                }

                .rw-label {
                    background: rgba(255, 255, 255, 0.96);
                    border: 1px solid rgba(139, 61, 255, 0.35);
                    color: #6d28d9;
                    font-size: 12px;
                    font-weight: 800;
                }

                .rt-label {
                    background: rgba(255, 248, 220, 0.96);
                    border: 1px solid rgba(251, 192, 45, 0.75);
                    color: #92400e;
                    font-size: 12px;
                    font-weight: 900;
                }
            `}</style>

            <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

            {!ready && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        zIndex: 10,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#e8edf3",
                    }}
                >
                    <span style={{ fontSize: 14, color: "#a0aec0" }}>
                        Memuat peta...
                    </span>
                </div>
            )}

            <div
                className="map-controls-right"
                style={{ zIndex: 1000, pointerEvents: "none" }}
            >
                <button
                    className="map-btn"
                    style={{ pointerEvents: "all" }}
                    onClick={handleFullscreen}
                    title="Fullscreen"
                    type="button"
                >
                    <svg viewBox="0 0 24 24">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>

                <button
                    className="map-btn"
                    style={{ pointerEvents: "all" }}
                    onClick={handleResetView}
                    title="Reset View"
                    type="button"
                >
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </button>

                <button
                    className="map-btn"
                    style={{ pointerEvents: "all" }}
                    onClick={handleZoomIn}
                    title="Zoom In"
                    type="button"
                >
                    +
                </button>

                <button
                    className="map-btn"
                    style={{ pointerEvents: "all" }}
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    type="button"
                >
                    −
                </button>

                <button
                    className="map-btn"
                    style={{ pointerEvents: "all" }}
                    onClick={handleMyLocation}
                    title="Lokasi Saya"
                    type="button"
                >
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="7" />
                        <line x1="12" y1="17" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="7" y2="12" />
                        <line x1="17" y1="12" x2="22" y2="12" />
                    </svg>
                </button>

                {/* <button className="map-btn" style={{ pointerEvents: "all" }} title="Layer" type="button">
                    <svg viewBox="0 0 24 24">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="8" y1="7" x2="8" y2="9" />
                        <line x1="12" y1="5" x2="12" y2="8" />
                        <line x1="16" y1="7" x2="16" y2="9" />
                    </svg>
                </button> */}

                {/* <button className="map-btn" style={{ pointerEvents: "all" }} title="Checklist" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </button> */}

                {/* <button className="map-btn" style={{ pointerEvents: "all" }} title="Riwayat" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="12 6 12 12 16 14" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </button> */}
            </div>

            <div
                style={{
                    position: "absolute",
                    bottom: 40,
                    right: 14,
                    zIndex: 1000,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 34px)",
                    gridTemplateRows: "repeat(3, 34px)",
                    gap: 3,
                }}
            >
                <div />
                <button className="map-btn" onClick={() => handlePan("up")} title="Pan Up" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
                <div />

                <button className="map-btn" onClick={() => handlePan("left")} title="Pan Left" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                <button className="map-btn" onClick={handleResetView} title="Reset" type="button">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="4" fill="#555" />
                    </svg>
                </button>

                <button className="map-btn" onClick={() => handlePan("right")} title="Pan Right" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                <div />
                <button className="map-btn" onClick={() => handlePan("down")} title="Pan Down" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                <div />
            </div>

            <div className="map-scale" style={{ zIndex: 1000 }}>
                <span>400 km</span>
                <div className="scale-bar" />
            </div>

            <div className="map-credit" style={{ zIndex: 1000 }}>
                ©2021 Developed by Braga Technologies
            </div>
        </main>
    );
}