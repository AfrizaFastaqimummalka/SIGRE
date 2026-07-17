"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getMahasiswa } from "../lib/api";
import AppShell from '../components/AppShell';

type Mahasiswa = {
  npm: string;
  name: string;
  prodi: string;
  semester: number;
  gender: string;
  latitude: number;
  longitude: number;
};

const MapLeaflet = dynamic(() => import("../components/MapLeafet"), {
  ssr: false,
});
const MapGoogle = dynamic(() => import("../components/MapGoogle"), {
  ssr: false,
});

export default function Page() {
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [selected, setSelected] = useState<Mahasiswa | null>(null);

  useEffect(() => {
    getMahasiswa().then((res) => setData(res));
  }, []);

  return (
     <AppShell>
      <h2>Data Mahasiswa</h2>

      <table style={{ border: "1px solid black" }}>
        <thead>
          <tr>
            <th>NPM</th>
            <th>Nama</th>
            <th>Prodi</th>
            <th>Semester</th>
            <th>Gender</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>
          {data.map((mhs) => (
            <tr key={mhs.npm}>
              <td>{mhs.npm}</td>
              <td>{mhs.name}</td>
              <td>{mhs.prodi}</td>
              <td>{mhs.semester}</td>
              <td>{mhs.gender}</td>

              <td>
                <button onClick={() => setSelected(mhs)}>Lihat Lokasi</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <MapGoogle  selected={selected} />
      </AppShell>
  );
}
