"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        google: typeof google;
    }
}

export default function MapArea() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            const jabarBounds = new window.google.maps.LatLngBounds(
                { lat: -7.83, lng: 106.20 }, // barat daya Jawa Barat
                { lat: -5.85, lng: 108.90 }  // timur laut Jawa Barat
            );

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: -6.90389, lng: 107.61861 }, // Bandung
                zoom: 8,
                minZoom: 7,
                maxZoom: 18,
                mapTypeId: "roadmap",
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: false,
                gestureHandling: "greedy",
                clickableIcons: true,
            });

            map.fitBounds(jabarBounds);
            mapInstanceRef.current = map;

            new window.google.maps.Marker({
                position: { lat: -6.9175, lng: 107.6191 },
                map,
                title: "Bandung, Jawa Barat",
            });
        };

        const loadGoogleMaps = () => {
            if (window.google?.maps) {
                initMap();
                return;
            }

            const existingScript = document.getElementById(
                "google-maps-script"
            ) as HTMLScriptElement | null;

            if (existingScript) {
                existingScript.addEventListener("load", initMap);
                return;
            }

            const script = document.createElement("script");
            script.id = "google-maps-script";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.addEventListener("load", initMap);
            document.body.appendChild(script);
        };

        loadGoogleMaps();

        return () => {
            const existingScript = document.getElementById("google-maps-script");
            if (existingScript) {
                existingScript.removeEventListener("load", initMap);
            }
        };
    }, []);

    const handleZoomIn = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom((map.getZoom() || 8) + 1);
    };

    const handleZoomOut = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom((map.getZoom() || 8) - 1);
    };

    const handleResetView = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const jabarBounds = new window.google.maps.LatLngBounds(
            { lat: -7.83, lng: 106.20 },
            { lat: -5.85, lng: 108.90 }
        );

        map.fitBounds(jabarBounds);
    };

    const handleMyLocation = () => {
        const map = mapInstanceRef.current;
        if (!map || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.panTo(currentPos);
                map.setZoom(14);

                new window.google.maps.Marker({
                    position: currentPos,
                    map,
                    title: "Lokasi Anda",
                });
            },
            (error) => {
                console.error("Gagal mengambil lokasi:", error);
                alert("Lokasi tidak dapat diakses.");
            }
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

    return (
        <main className="map-area">
            <div ref={mapRef} className="map-ph" />

            <div className="map-controls-right">
                <button className="map-btn" onClick={handleFullscreen} title="Fullscreen" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>

                <button className="map-btn" onClick={handleResetView} title="Reset View" type="button">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </button>

                <button className="map-btn" onClick={handleZoomIn} title="Zoom In" type="button">
                    +
                </button>

                <button className="map-btn" onClick={handleZoomOut} title="Zoom Out" type="button">
                    −
                </button>

                <button className="map-btn" onClick={handleMyLocation} title="Lokasi Saya" type="button">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="7" />
                        <line x1="12" y1="17" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="7" y2="12" />
                        <line x1="17" y1="12" x2="22" y2="12" />
                    </svg>
                </button>

                <button className="map-btn" title="Layer" type="button">
                    <svg viewBox="0 0 24 24">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="8" y1="7" x2="8" y2="9" />
                        <line x1="12" y1="5" x2="12" y2="8" />
                        <line x1="16" y1="7" x2="16" y2="9" />
                    </svg>
                </button>

                <button className="map-btn" title="Checklist" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </button>

                <button className="map-btn" title="Riwayat" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="12 6 12 12 16 14" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </button>
            </div>

            <div className="map-scale">
                <span>400 km</span>
                <div className="scale-bar" />
            </div>

            <div className="map-credit">©2021 Developed by Braga Technologies</div>
        </main>
    );
}