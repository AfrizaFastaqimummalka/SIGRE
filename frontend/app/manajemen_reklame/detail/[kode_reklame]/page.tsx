"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import "../../../styles/detail_aset.css";
import Link from "next/link";
import { useSession } from "next-auth/react";

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
  pemohon?: number | string | null;
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
  kabupaten_kota?: string | null;
  pengguna?: string | null;
  kuasa_pengguna?: string | null;
  tipe_zona?: string | null;
  nama_kategori?: string | null;
};

function toArrayResponse(data: any) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function buildFileUrl(path?: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
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

function statusLabel(status?: string) {
  if (!status) return "-";

  const lower = status.toLowerCase();

  if (lower === "aktif") return "Aktif";
  if (lower === "tidak aktif") return "Tidak Aktif";
  if (lower === "nonaktif") return "Nonaktif";

  return status;
}

export default function DetilAsetPage() {
  const router = useRouter();
  const params = useParams();

  const kodeReklame = decodeURIComponent(String(params.kode_reklame || ""));

  const [reklame, setReklame] = useState<ReklameDetail | null>(null);
  const [photos, setPhotos] = useState<FotoReklame[]>([]);
  const [dokumen, setDokumen] = useState<DokumenReklame[]>([]);
  const [perizinan, setPerizinan] = useState<PerizinanReklame[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken;

  useEffect(() => {
    if (kodeReklame && status === "authenticated" && accessToken) {
      fetchDetailReklame();
    }
  }, [kodeReklame, accessToken, status]);

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
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil detail reklame."
      );
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

    window.open(
      `https://www.google.com/maps?q=${reklame.latitude},${reklame.longitude}`,
      "_blank"
    );
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
        <div className="da-wrapper">
          <div className="da-container">
            <div className="da-state-box">Mengambil data detail reklame...</div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (errorMessage || !reklame) {
    return (
      <AppShell>
        <div className="da-wrapper">
          <div className="da-container">
            <div className="da-state-box da-state-error">
              <div style={{ fontWeight: 700, marginBottom: 8 }}>
                Gagal memuat detail reklame
              </div>
              <div>{errorMessage}</div>

              <button
                className="da-btn"
                style={{ marginTop: 16 }}
                onClick={() => router.push("/manajemen_reklame")}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const latestPerizinan = perizinan[0];
  const firstDokumen = dokumen[0];

  const mainPhoto = photos[0];
  const thumbnailPhotos = photos.slice(1, 5);
  const remainingPhotos = Math.max(photos.length - 5, 0);

  return (
    <AppShell>
      <div className="da-wrapper">
        <div className="da-container">
          <div className="da-breadcrumb">
            <div className="da-bc-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2" fill="#0EA5E9" />
                <path d="M7 10H17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <span
              className="bc-link"
              onClick={() => router.push("/manajemen_reklame")}
            >
              Manajemen Reklame
            </span>

            <svg
              className="chevron"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>

            <span>Detail Reklame</span>
          </div>

          <div className="da-header">
            <div className="da-title-section">
              <button
                className="da-back-btn"
                onClick={() => router.push("/manajemen_reklame")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="da-title-text">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>

                {reklame.kode_reklame} - {reklame.nama_pemilik}
              </div>
            </div>

            <div className="da-actions">
              <button className="da-btn" onClick={handleOpenMap}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2a10 10 0 0 0-10 10c0 5.5 10 10 10 10s10-4.5 10-10A10 10 0 0 0 12 2z" />
                </svg>
                Lihat Lokasi
              </button>

              <button className="da-btn" onClick={handleDownloadCsv}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download CSV
              </button>

              <button
                className="da-btn"
                onClick={() =>
                  router.push(
                    `/manajemen_reklame/edit/${encodeURIComponent(reklame.kode_reklame)}`
                  )
                }
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Informasi Reklame
              </button>
            </div>
          </div>

          <div className="da-gallery">
            <div className="da-img-main">
              {mainPhoto?.foto || mainPhoto?.url ? (
                <img
                  src={buildFileUrl(mainPhoto.foto || mainPhoto.url)}
                  alt={mainPhoto.keterangan || "Foto utama reklame"}
                  className="da-img-real"
                />
              ) : (
                <div className="da-img-empty">Belum ada foto reklame</div>
              )}
            </div>

            <div className="da-gallery-grid">
              {thumbnailPhotos.length > 0 ? (
                thumbnailPhotos.map((photo, index) => {
                  const isLastVisible = index === thumbnailPhotos.length - 1;
                  const showOverlay = isLastVisible && remainingPhotos > 0;

                  return (
                    <div className="da-img-thumb" key={photo.id || index}>
                      <img
                        src={buildFileUrl(photo.foto || photo.url)}
                        alt={photo.keterangan || `Foto reklame ${index + 2}`}
                        className="da-img-real"
                      />

                      {showOverlay && (
                        <div className="da-img-2-overlay">
                          +{remainingPhotos}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="da-img-thumb da-img-empty">Foto kosong</div>
                  <div className="da-img-thumb da-img-empty">Foto kosong</div>
                  <div className="da-img-thumb da-img-empty">Foto kosong</div>
                  <div className="da-img-thumb da-img-empty">Foto kosong</div>
                </>
              )}

              {thumbnailPhotos.length > 0 &&
                thumbnailPhotos.length < 4 &&
                Array.from({ length: 4 - thumbnailPhotos.length }).map((_, index) => (
                  <div className="da-img-thumb da-img-empty" key={`empty-${index}`}>
                    Foto kosong
                  </div>
                ))}
            </div>
          </div>

          <div className="da-photo-count">
            Total foto dari backend: {photos.length}
          </div>

          <div className="da-details-title">Rincian Reklame</div>

          <div className="da-details-grid">
            <div>
              <DetailRow label="Kode Reklame" value={reklame.kode_reklame} />
              <DetailRow label="Nama Pemilik" value={reklame.nama_pemilik} />
              <DetailRow label="NIK/NPWP" value={reklame.nik_npwp} />
              <DetailRow
                label="Kategori Reklame"
                value={reklame.nama_kategori || reklame.kategori_nama || reklame.kategori}
              />
              <DetailRow
                label="Zona Tata Ruang"
                value={reklame.zona_nama || reklame.zona}
              />
              <DetailRow label="Tipe Zona" value={reklame.tipe_zona} />
              <DetailRow label="Status Reklame" value={statusLabel(reklame.status_reklame)} />
            </div>

            <div>
              <DetailRow label="Kabupaten/Kota" value={reklame.kabupaten_kota} />
              <DetailRow label="Pengguna" value={reklame.pengguna} />
              <DetailRow label="Kuasa Pengguna" value={reklame.kuasa_pengguna} />
              <DetailRow label="Latitude" value={reklame.latitude} />
              <DetailRow label="Longitude" value={reklame.longitude} />
              <DetailRow label="Luas Reklame" value={`${formatValue(reklame.luas_m2)} m²`} />
              <DetailRow label="Tinggi Reklame" value={`${formatValue(reklame.tinggi_m)} m`} />
              <DetailRow label="Tanggal Pasang" value={formatDate(reklame.tanggal_pasang)} />
              <DetailRow label="Dibuat Pada" value={formatDate(reklame.created_at)} />
            </div>
          </div>

          <div className="da-divider"></div>

          <div className="da-details-title">Rincian Perizinan</div>

          <div className="da-details-grid">
            <div>
              <DetailRow label="Nomor Registrasi" value={latestPerizinan?.no_registrasi} />
              <DetailRow label="Status Perizinan" value={latestPerizinan?.status_perizinan} />
              <DetailRow label="Tanggal Pengajuan" value={formatDate(latestPerizinan?.tanggal_pengajuan)} />
              <DetailRow label="Tanggal Keputusan" value={formatDate(latestPerizinan?.tanggal_keputusan)} />
            </div>

            <div>
              <DetailRow label="Masa Berlaku" value={formatDate(latestPerizinan?.masa_berlaku)} />
              <DetailRow label="Catatan Keputusan" value={latestPerizinan?.catatan_keputusan} />
              <DetailRow
                label="Dokumen Perizinan"
                value={
                  firstDokumen?.file ? (
                    <a
                      href={buildFileUrl(firstDokumen.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="da-link"
                    >
                      Download {firstDokumen.nama_file || firstDokumen.jenis_dokumen || "Dokumen"}
                    </a>
                  ) : (
                    "-"
                  )
                }
              />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="da-detail-row">
      <div className="da-detail-label">{label}</div>
      <div className="da-detail-colon">:</div>
      <div className="da-detail-value">{formatValue(value)}</div>
    </div>
  );
}