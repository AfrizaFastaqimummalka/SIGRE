"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LeafletMouseEvent, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

type ReklameLocationSectionProps = {
  latitude: string;
  longitude: string;
  onCoordinateChange: (latitude: string, longitude: string) => void;
  onUseCurrentLocation: () => void;
};

const BATAM_CENTER: [number, number] = [1.1185, 104.053];

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export default function ReklameLocationSection({
  latitude,
  longitude,
  onCoordinateChange,
  onUseCurrentLocation,
}: ReklameLocationSectionProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onCoordinateChangeRef = useRef(onCoordinateChange);
  const latestCoordinatesRef = useRef({ latitude, longitude });
  const [mapMessage, setMapMessage] = useState(
    "Klik area pada peta untuk menentukan titik reklame."
  );

  const createOrUpdateMarker = useCallback(
    (currentLat: number, currentLng: number, shouldCenter: boolean) => {
      const L = leafletRef.current;
      const map = mapInstanceRef.current;

      if (!L || !map) return;

      const position: [number, number] = [currentLat, currentLng];

      if (!markerRef.current) {
        const marker = L.marker(position, {
          draggable: true,
          title: "Titik Reklame",
        }).addTo(map);

        marker.on("dragend", () => {
          const draggedPosition = marker.getLatLng();
          const latitudeValue = draggedPosition.lat.toFixed(6);
          const longitudeValue = draggedPosition.lng.toFixed(6);

          onCoordinateChangeRef.current(latitudeValue, longitudeValue);
          setMapMessage(
            `Titik reklame dipindahkan: ${latitudeValue}, ${longitudeValue}`
          );
        });

        markerRef.current = marker;
      } else {
        markerRef.current.setLatLng(position);
      }

      if (shouldCenter) {
        map.setView(position, Math.max(map.getZoom(), 17));
      }
    },
    []
  );

  useEffect(() => {
    latestCoordinatesRef.current = { latitude, longitude };
  }, [createOrUpdateMarker, latitude, longitude]);

  useEffect(() => {
    onCoordinateChangeRef.current = onCoordinateChange;
  }, [onCoordinateChange]);

  useEffect(() => {
    let mounted = true;

    async function initializeMap() {
      try {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const L = (await import("leaflet")).default;
        if (!mounted || !mapContainerRef.current) return;

        leafletRef.current = L;

        const defaultIconPrototype = L.Icon.Default.prototype as unknown as {
          _getIconUrl?: unknown;
        };
        delete defaultIconPrototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const currentLat = Number(latestCoordinatesRef.current.latitude);
        const currentLng = Number(latestCoordinatesRef.current.longitude);
        const hasCoordinate = isValidCoordinate(currentLat, currentLng);
        const initialCenter: [number, number] = hasCoordinate
          ? [currentLat, currentLng]
          : BATAM_CENTER;

        const map = L.map(mapContainerRef.current, {
          center: initialCenter,
          zoom: hasCoordinate ? 17 : 11,
          minZoom: 3,
          maxZoom: 19,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        map.on("click", (event: LeafletMouseEvent) => {
          const clickedLat = event.latlng.lat;
          const clickedLng = event.latlng.lng;
          const latitudeValue = clickedLat.toFixed(6);
          const longitudeValue = clickedLng.toFixed(6);

          onCoordinateChangeRef.current(latitudeValue, longitudeValue);
          setMapMessage(
            `Titik reklame dipilih: ${latitudeValue}, ${longitudeValue}`
          );
        });

        mapInstanceRef.current = map;

        if (hasCoordinate) {
          createOrUpdateMarker(currentLat, currentLng, false);
        }

        window.setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 100);
      } catch (error) {
        setMapMessage(
          error instanceof Error
            ? error.message
            : "Gagal memuat OpenStreetMap."
        );
      }
    }

    void initializeMap();

    return () => {
      mounted = false;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      markerRef.current = null;
      leafletRef.current = null;
    };
  }, [createOrUpdateMarker]);

  useEffect(() => {
    const currentLat = Number(latitude);
    const currentLng = Number(longitude);

    if (!isValidCoordinate(currentLat, currentLng)) return;

    createOrUpdateMarker(currentLat, currentLng, true);
  }, [createOrUpdateMarker, latitude, longitude]);

  function openOpenStreetMap() {
    const currentLat = Number(latitude);
    const currentLng = Number(longitude);

    if (!isValidCoordinate(currentLat, currentLng)) {
      setMapMessage("Isi atau pilih koordinat yang valid terlebih dahulu.");
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}#map=18/${currentLat}/${currentLng}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div style={{ padding: "12px 14px 14px" }}>
      <div style={styles.sectionTitle}>Data Lokasi Reklame</div>

      <div style={styles.coordinateGrid}>
        <div style={styles.inputCard}>
          <div style={styles.inputLabel}>Latitude</div>
          <input
            name="latitude"
            value={latitude}
            onChange={(event) =>
              onCoordinateChange(event.target.value, longitude)
            }
            placeholder="Contoh: 1.045600"
            style={styles.plainInput}
          />
        </div>

        <div style={styles.inputCard}>
          <div style={styles.inputLabel}>Longitude</div>
          <input
            name="longitude"
            value={longitude}
            onChange={(event) =>
              onCoordinateChange(latitude, event.target.value)
            }
            placeholder="Contoh: 104.030500"
            style={styles.plainInput}
          />
        </div>
      </div>

      <div style={styles.mapActionRow}>
        <button
          type="button"
          style={styles.smallPrimaryButton}
          onClick={onUseCurrentLocation}
        >
          Gunakan Lokasi Saya
        </button>

        <button
          type="button"
          style={styles.smallOutlineButton}
          onClick={openOpenStreetMap}
        >
          Buka di OpenStreetMap
        </button>
      </div>

      <div style={styles.mapBox}>
        <div ref={mapContainerRef} style={styles.mapContainer} />
        <div style={styles.mapInfoText}>{mapMessage}</div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6e7f93",
    marginBottom: 10,
  },
  coordinateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  inputCard: {
    border: "1px solid #dfe6ef",
    borderRadius: 6,
    padding: "6px 10px",
    position: "relative",
    minHeight: 44,
  },
  inputLabel: {
    fontSize: 10,
    color: "#9aa8b8",
    marginBottom: 2,
  },
  plainInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#3b495b",
    background: "transparent",
    fontFamily: "inherit",
  },
  mapActionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  smallPrimaryButton: {
    minWidth: 116,
    minHeight: 30,
    padding: "6px 12px",
    border: "none",
    borderRadius: 6,
    background: "#2db3ff",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  smallOutlineButton: {
    minWidth: 140,
    minHeight: 30,
    padding: "6px 12px",
    border: "1px solid #95d5fb",
    borderRadius: 6,
    background: "#f8fdff",
    color: "#36aff8",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },
  mapBox: {
    border: "1px solid #dfe6ef",
    borderRadius: 6,
    padding: 8,
  },
  mapContainer: {
    width: "100%",
    height: 360,
    borderRadius: 6,
    border: "1px solid #e5ebf3",
    overflow: "hidden",
  },
  mapInfoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
};
