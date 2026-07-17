"use client";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useRef, useState } from "react";

type Mahasiswa = {
  latitude: number;
  longitude: number;
  name: string;
  prodi: string;
  semester: number;
};

export default function MapGoogle({
  selected,
}: {
  selected: Mahasiswa | null;
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const [center] = useState({ lat: -2.5, lng: 118 });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selected && mapRef.current) {
      const map = mapRef.current;

      const target = {
        lat: selected.latitude,
        lng: selected.longitude,
      };

      map.panTo(target);
      map.setZoom(15);

      setOpen(false); // reset popup
    }
  }, [selected]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <GoogleMap
      center={center}
      zoom={5}
      mapContainerStyle={{ width: "100%", height: "500px" }}
      onLoad={(map) => { mapRef.current = map; }}
    >
      {selected && (
        <>
          <Marker
            position={{
              lat: selected.latitude,
              lng: selected.longitude,
            }}
            onClick={() => setOpen(true)}
          />

          {open && (
            <InfoWindow
              position={{
                lat: selected.latitude,
                lng: selected.longitude,
              }}
              onCloseClick={() => setOpen(false)}
            >
              <div>
                <b>{selected.name}</b>
                <br />
                Prodi: {selected.prodi}
                <br />
                Semester: {selected.semester}
              </div>
            </InfoWindow>
          )}
        </>
      )}
    </GoogleMap>
  );
}