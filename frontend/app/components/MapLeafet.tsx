"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

type Mahasiswa = {
  latitude: number;
  longitude: number;
  name: string;
  prodi: string;
  semester: number;
};

function ChangeView({ selected }: { selected: Mahasiswa | null }) {
  const map = useMap();

  useEffect(() => {
    if (selected) {
      map.flyTo([selected.latitude, selected.longitude], 15);
    }
  }, [selected, map]);

  return null;
}

export default function MapLeaflet({
  selected,
}: {
  selected: Mahasiswa | null;
}) {
  const redIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={5}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Menggerakkan map */}
      <ChangeView selected={selected} />

      {selected && (
        <Marker
          position={[selected.latitude, selected.longitude]}
          icon={redIcon}
        >
          <Popup>
            <b>{selected.name}</b>
            <br />
            Prodi: {selected.prodi}
            <br />
            Semester: {selected.semester}
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}