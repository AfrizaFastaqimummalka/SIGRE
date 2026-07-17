"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import Link from "next/link";
import { useSession } from "next-auth/react";
import "../../../styles/detail_aset.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type FotoReklame = {
  id?: number | string;
  reklame?: number | string;
  foto?: string;
  url?: string;
  keterangan?: string;
  uploaded_at?: string;
};

type DokumenReklame = {
  id?: number | string;
  reklame?: number | string;
  jenis_dokumen?: string;
  nama_file?: string;
  file?: string;
};

type PerizinanReklame = {
  id?: number | string;
  reklame?: number | string;
  no_registrasi?: string;
  status_perizinan?: string;
  tanggal_pengajuan?: string;
  tanggal_keputusan?: string | null;
  catatan_keputusan?: string | null;
  masa_berlaku?: string | null;
};

type ReklameDetail = {
  id: number | string;
  kode_reklame: string;
  kategori?: number | string | null;
  kategori_nama?: string | null;
  zona?: number | string | null;
  zona_nama?: string | null;
  nama_pemilik: string;
  nik_npwp: string;
  latitude: string | number;
  longitude: string | number;
  luas_m2: string | number;
  tinggi_m: string | number;
  status_reklame: string;
  tanggal_pasang: string;
  created_at?: string;
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: "#f5f7fb",
    padding: 24,
    fontFamily: "sans-serif",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  breadcrumb: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 10,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  btn: {
    background: "#1a8fe3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
  },

  btnSecondary: {
    background: "#6b7280",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontSize: 13,
  },

  gallery: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 12,
    marginBottom: 20,
  },

  mainImage: {
    width: "100%",
    height: 250,
    objectFit: "cover",
    borderRadius: 10,
    background: "#e5e7eb",
  },

  sideImages: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    maxHeight: 250,
    overflowY: "auto",
  },

  smallImageWrap: {
    position: "relative",
    width: "100%",
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    background: "#e5e7eb",
  },

  smallImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imageCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "4px 6px",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 10,
  },

  sectionTitle: {
    fontWeight: 600,
    marginBottom: 12,
    fontSize: 15,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    fontSize: 13,
  },

  field: {
    marginBottom: 10,
  },

  label: {
    color: "#6b7280",
    marginBottom: 3,
  },

  value: {
    fontWeight: 500,
    color: "#111827",
  },

  statusBadge: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
  },

  emptyImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: 13,
  },

  emptySmallImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
    fontSize: 12,
  },

  loading: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    color: "#6b7280",
  },

  error: {
    background: "#fff",
    borderRadius: 12,
    padding: 24,
    color: "#dc2626",
  },

  photoInfo: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: -10,
    marginBottom: 18,
  },
};

function buildFileUrl(path?: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function toArrayResponse(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusStyle(status?: string): React.CSSProperties {
  const normalizedStatus = status?.toLowerCase();

  if (normalizedStatus === "aktif") {
    return {
      ...styles.statusBadge,
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (normalizedStatus === "tidak aktif" || normalizedStatus === "nonaktif") {
    return {
      ...styles.statusBadge,
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    ...styles.statusBadge,
    background: "#e5e7eb",
    color: "#374151",
  };
}

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const kodeReklame = decodeURIComponent(String(params.kode_reklame || ""));

  const [reklame, setReklame] = useState<ReklameDetail | null>(null);
  const [photos, setPhotos] = useState<FotoReklame[]>([]);
  const [dokumen, setDokumen] = useState<DokumenReklame[]>([]);
  const [perizinan, setPerizinan] = useState<PerizinanReklame[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (kodeReklame && accessToken) {
      fetchDetailReklame();
    }
  }, [kodeReklame, accessToken]);

  async function fetchDetailReklame() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/reklame/${encodeURIComponent(kodeReklame)}/`,
        {
          method: "GET",
          cache: "no-store",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Data reklame tidak ditemukan atau gagal diambil dari backend.");
      }

      const data: ReklameDetail = await response.json();
      setReklame(data);

      await Promise.all([
        fetchPhotosByReklameId(data.id),
        fetchDokumenByReklameId(data.id),
        fetchPerizinanByReklameId(data.id),
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil detail reklame.";

      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPhotosByReklameId(reklameId: number | string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/foto/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        setPhotos([]);
        return;
      }

      const data = await response.json();
      const photoList = toArrayResponse(data);

      const filteredPhotos = photoList.filter(
        (item: FotoReklame) => String(item.reklame) === String(reklameId)
      );

      setPhotos(filteredPhotos);
    } catch (error) {
      console.error("Gagal mengambil foto reklame:", error);
      setPhotos([]);
    }
  }

  async function fetchDokumenByReklameId(reklameId: number | string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dokumen/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        setDokumen([]);
        return;
      }

      const data = await response.json();
      const dokumenList = toArrayResponse(data);

      const filteredDokumen = dokumenList.filter(
        (item: DokumenReklame) => String(item.reklame) === String(reklameId)
      );

      setDokumen(filteredDokumen);
    } catch (error) {
      console.error("Gagal mengambil dokumen reklame:", error);
      setDokumen([]);
    }
  }

  async function fetchPerizinanByReklameId(reklameId: number | string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/perizinan/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        setPerizinan([]);
        return;
      }

      const data = await response.json();
      const perizinanList = toArrayResponse(data);

      const filteredPerizinan = perizinanList.filter(
        (item: PerizinanReklame) => String(item.reklame) === String(reklameId)
      );

      setPerizinan(filteredPerizinan);
    } catch (error) {
      console.error("Gagal mengambil perizinan reklame:", error);
      setPerizinan([]);
    }
  }

  function handleOpenMap() {
    if (!reklame?.latitude || !reklame?.longitude) return;

    const mapUrl = `https://www.google.com/maps?q=${reklame.latitude},${reklame.longitude}`;
    window.open(mapUrl, "_blank");
  }

  function handleDownloadCsv() {
    if (!reklame) return;

    const headers = [
      "kode_reklame",
      "nama_pemilik",
      "nik_npwp",
      "kategori",
      "zona",
      "latitude",
      "longitude",
      "luas_m2",
      "tinggi_m",
      "status_reklame",
      "tanggal_pasang",
    ];

    const values = [
      reklame.kode_reklame,
      reklame.nama_pemilik,
      reklame.nik_npwp,
      reklame.kategori_nama || reklame.kategori || "",
      reklame.zona_nama || reklame.zona || "",
      reklame.latitude,
      reklame.longitude,
      reklame.luas_m2,
      reklame.tinggi_m,
      reklame.status_reklame,
      reklame.tanggal_pasang,
    ];

    const csvContent = `${headers.join(",")}\n${values
      .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
      .join(",")}`;

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `detail-reklame-${reklame.kode_reklame}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <AppShell>
        <div style={styles.page}>
          <div style={styles.loading}>Mengambil data detail reklame...</div>
        </div>
      </AppShell>
    );
  }

  if (errorMessage || !reklame) {
    return (
      <AppShell>
        <div style={styles.page}>
          <div style={styles.error}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>
              Gagal memuat detail reklame
            </div>

            <div>{errorMessage}</div>

            <button
              style={{ ...styles.btnSecondary, marginTop: 16 }}
              onClick={() => router.push("/manajemen_reklame")}
            >
              Kembali
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const mainPhoto = buildFileUrl(photos[0]?.foto || photos[0]?.url);
  const sidePhotos = photos.slice(1);
  const latestPerizinan = perizinan[0];
  const firstDokumen = dokumen[0];

  return (
    <AppShell>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.breadcrumb}>
            Manajemen Reklame &gt; Detail Reklame &gt; {reklame.kode_reklame}
          </div>

          <div style={styles.header}>
            <div>
              <div style={styles.title}>{reklame.kode_reklame}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                {reklame.nama_pemilik}
              </div>
            </div>

            <div style={styles.actions}>
              <button style={styles.btn} onClick={handleOpenMap}>
                Lihat Peta
              </button>

              <button style={styles.btn} onClick={handleDownloadCsv}>
                Download CSV
              </button>

              <button
                style={styles.btn}
                onClick={() =>
                  router.push(
                    `/manajemen_reklame/edit/${encodeURIComponent(reklame.kode_reklame)}`
                  )
                }
              >
                Edit Informasi Reklame
              </button>
            </div>
          </div>

          <div style={styles.gallery}>
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt="Foto reklame utama"
                style={styles.mainImage}
              />
            ) : (
              <div style={styles.emptyImage}>Belum ada foto reklame</div>
            )}

            <div style={styles.sideImages}>
              {sidePhotos.length > 0 ? (
                sidePhotos.map((photo, index) => {
                  const photoUrl = buildFileUrl(photo.foto || photo.url);

                  return (
                    <div key={photo.id || index} style={styles.smallImageWrap}>
                      <img
                        src={photoUrl}
                        alt={`Foto reklame ${index + 2}`}
                        style={styles.smallImage}
                      />

                      {photo.keterangan && (
                        <div style={styles.imageCaption}>{photo.keterangan}</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div style={styles.emptySmallImage}>Foto kosong</div>
                  <div style={styles.emptySmallImage}>Foto kosong</div>
                  <div style={styles.emptySmallImage}>Foto kosong</div>
                  <div style={styles.emptySmallImage}>Foto kosong</div>
                </>
              )}
            </div>
          </div>

          <div style={styles.photoInfo}>
            Total foto dari backend: {photos.length}
          </div>

          <div>
            <div style={styles.sectionTitle}>Rincian Reklame</div>

            <div style={styles.grid}>
              <div>
                <div style={styles.field}>
                  <div style={styles.label}>Kode Reklame</div>
                  <div style={styles.value}>{formatValue(reklame.kode_reklame)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Nama Pemilik</div>
                  <div style={styles.value}>{formatValue(reklame.nama_pemilik)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>NIK/NPWP</div>
                  <div style={styles.value}>{formatValue(reklame.nik_npwp)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Kategori Reklame</div>
                  <div style={styles.value}>
                    {formatValue(reklame.kategori_nama || reklame.kategori)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Zona Tata Ruang</div>
                  <div style={styles.value}>
                    {formatValue(reklame.zona_nama || reklame.zona)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Status Reklame</div>
                  <div style={getStatusStyle(reklame.status_reklame)}>
                    {formatValue(reklame.status_reklame)}
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.field}>
                  <div style={styles.label}>Latitude</div>
                  <div style={styles.value}>{formatValue(reklame.latitude)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Longitude</div>
                  <div style={styles.value}>{formatValue(reklame.longitude)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Luas Reklame</div>
                  <div style={styles.value}>{formatValue(reklame.luas_m2)} m²</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Tinggi Reklame</div>
                  <div style={styles.value}>{formatValue(reklame.tinggi_m)} m</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Tanggal Pasang</div>
                  <div style={styles.value}>{formatDate(reklame.tanggal_pasang)}</div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Dibuat Pada</div>
                  <div style={styles.value}>{formatDate(reklame.created_at)}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={styles.sectionTitle}>Rincian Perizinan</div>

            <div style={styles.grid}>
              <div>
                <div style={styles.field}>
                  <div style={styles.label}>Nomor Registrasi</div>
                  <div style={styles.value}>
                    {formatValue(latestPerizinan?.no_registrasi)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Status Perizinan</div>
                  <div style={styles.value}>
                    {formatValue(latestPerizinan?.status_perizinan)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Tanggal Pengajuan</div>
                  <div style={styles.value}>
                    {formatDate(latestPerizinan?.tanggal_pengajuan)}
                  </div>
                </div>
              </div>

              <div>
                <div style={styles.field}>
                  <div style={styles.label}>Tanggal Keputusan</div>
                  <div style={styles.value}>
                    {formatDate(latestPerizinan?.tanggal_keputusan)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Masa Berlaku</div>
                  <div style={styles.value}>
                    {formatDate(latestPerizinan?.masa_berlaku)}
                  </div>
                </div>

                <div style={styles.field}>
                  <div style={styles.label}>Catatan Keputusan</div>
                  <div style={styles.value}>
                    {formatValue(latestPerizinan?.catatan_keputusan)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div style={styles.sectionTitle}>Dokumen Reklame</div>

            {firstDokumen?.file ? (
              <a
                href={buildFileUrl(firstDokumen.file)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1a8fe3", fontSize: 13, fontWeight: 600 }}
              >
                Download{" "}
                {firstDokumen.nama_file ||
                  firstDokumen.jenis_dokumen ||
                  "Dokumen"}
              </a>
            ) : (
              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Belum ada dokumen perizinan.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}