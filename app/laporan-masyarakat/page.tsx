"use client";

import React, { useState } from "react";
import Link from "next/link";
import "../styles/laporan.css";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

const KATEGORI_OPTIONS = [
  { value: "", label: "Pilih Kategori Laporan" },
  { value: "REKLAME_ILEGAL", label: "Reklame Ilegal" },
  { value: "REKLAME_RUSAK", label: "Reklame Rusak" },
  { value: "MELANGGAR_ZONA", label: "Melanggar Zona" },
  { value: "REKLAME_KADALUARSA", label: "Reklame Kadaluarsa" },
  { value: "LAINNYA", label: "Lainnya" },
];

const KECAMATAN_OPTIONS = [
  "Batam Kota", "Batu Aji", "Batu Ampar", "Belakang Padang",
  "Bengkong", "Bulang", "Galang", "Lubuk Baja",
  "Nongsa", "Sagulung", "Sei Beduk", "Sekupang",
];

export default function LaporanMasyarakatPage() {
  const [form, setForm] = useState({
    nama_pelapor: "",
    no_telepon: "",
    email_pelapor: "",
    isi_laporan: "",
    kategori_laporan: "",
    latitude: "",
    longitude: "",
    alamat_lokasi: "",
    kecamatan: "",
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(name: string, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    if (!form.isi_laporan.trim()) {
      return "Isi laporan wajib diisi.";
    }
    if (!form.kategori_laporan) {
      return "Kategori laporan wajib dipilih.";
    }
    if (form.latitude && form.longitude) {
      const lat = Number(form.latitude);
      const lng = Number(form.longitude);
      if (
        Number.isNaN(lat) || Number.isNaN(lng) ||
        lat < -90 || lat > 90 || lng < -180 || lng > 180
      ) {
        return "Koordinat tidak valid. Latitude -90 s.d. 90, Longitude -180 s.d. 180.";
      }
    }
    return "";
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Browser tidak mendukung fitur lokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrorMessage("");
      },
      () => {
        setErrorMessage("Gagal mengambil lokasi perangkat.");
      }
    );
  }

  async function handleSubmit() {
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("isi_laporan", form.isi_laporan);
      formData.append("kategori_laporan", form.kategori_laporan);

      if (form.nama_pelapor.trim()) formData.append("nama_pelapor", form.nama_pelapor);
      if (form.no_telepon.trim()) formData.append("no_telepon", form.no_telepon);
      if (form.email_pelapor.trim()) formData.append("email_pelapor", form.email_pelapor);
      if (form.latitude.trim()) formData.append("latitude", form.latitude);
      if (form.longitude.trim()) formData.append("longitude", form.longitude);
      if (form.alamat_lokasi.trim()) formData.append("alamat_lokasi", form.alamat_lokasi);
      if (form.kecamatan.trim()) formData.append("kecamatan", form.kecamatan);
      if (foto) formData.append("foto", foto);

      const response = await fetch(`${API_BASE}/laporan-masyarakat/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && typeof errorData === "object") {
          const messages = Object.entries(errorData)
            .map(([field, errors]) => {
              const msgs = Array.isArray(errors) ? errors.join(", ") : String(errors);
              return `${field}: ${msgs}`;
            })
            .join(" | ");
          throw new Error(messages || "Gagal mengirim laporan.");
        }
        throw new Error("Gagal mengirim laporan.");
      }

      setSuccessMessage(
        "Laporan berhasil dikirim! Terima kasih atas partisipasi Anda. Laporan akan segera ditindaklanjuti."
      );
      setForm({
        nama_pelapor: "",
        no_telepon: "",
        email_pelapor: "",
        isi_laporan: "",
        kategori_laporan: "",
        latitude: "",
        longitude: "",
        alamat_lokasi: "",
        kecamatan: "",
      });
      setFoto(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="laporan-page">
      {/* Top bar */}
      <div className="laporan-topbar">
        <Link href="/landing" className="laporan-topbar-logo">
          <div className="laporan-topbar-icon">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span className="laporan-topbar-text">SigRe — Laporan Masyarakat</span>
        </Link>

        <Link href="/landing" className="laporan-topbar-back">
          <svg viewBox="0 0 24 24">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali
        </Link>
      </div>

      {/* Content */}
      <div className="laporan-container">
        <div className="laporan-header">
          <h1>Buat Laporan</h1>
          <p>
            Laporkan reklame ilegal, rusak, atau melanggar zona.
            Tidak perlu login — laporan Anda akan ditindaklanjuti oleh petugas.
          </p>
        </div>

        <div className="laporan-card">
          {errorMessage && (
            <div className="laporan-alert-error">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="laporan-alert-success">{successMessage}</div>
          )}

          {/* Identitas pelapor (opsional) */}
          <div className="laporan-section-title">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Identitas Pelapor (Opsional)
          </div>

          <div className="laporan-row">
            <div className="laporan-field">
              <label className="laporan-label">Nama</label>
              <input
                className="laporan-input"
                value={form.nama_pelapor}
                onChange={(e) => updateField("nama_pelapor", e.target.value)}
                placeholder="Nama Anda (opsional)"
              />
            </div>
            <div className="laporan-field">
              <label className="laporan-label">No. Telepon</label>
              <input
                className="laporan-input"
                value={form.no_telepon}
                onChange={(e) => updateField("no_telepon", e.target.value)}
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>

          <div className="laporan-row-full">
            <div className="laporan-field">
              <label className="laporan-label">Email</label>
              <input
                className="laporan-input"
                type="email"
                value={form.email_pelapor}
                onChange={(e) => updateField("email_pelapor", e.target.value)}
                placeholder="email@contoh.com (opsional)"
              />
            </div>
          </div>

          <hr className="laporan-divider" />

          {/* Isi laporan */}
          <div className="laporan-section-title">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Detail Laporan
          </div>

          <div className="laporan-row-full">
            <div className="laporan-field">
              <label className="laporan-label">Kategori Laporan *</label>
              <select
                className="laporan-select"
                value={form.kategori_laporan}
                onChange={(e) => updateField("kategori_laporan", e.target.value)}
              >
                {KATEGORI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="laporan-row-full">
            <div className="laporan-field">
              <label className="laporan-label">Isi Laporan *</label>
              <textarea
                className="laporan-textarea"
                value={form.isi_laporan}
                onChange={(e) => updateField("isi_laporan", e.target.value)}
                placeholder="Jelaskan detail laporan Anda: kondisi reklame, lokasi persis, pelanggaran yang terjadi, dll."
              />
            </div>
          </div>

          <div className="laporan-row-full">
            <div className="laporan-field">
              <label className="laporan-label">Foto Bukti (Opsional)</label>
              <label className="laporan-file-label">
                📎 Pilih Foto
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setFoto(e.target.files?.[0] || null)}
                />
              </label>
              {foto && <div className="laporan-file-name">✓ {foto.name}</div>}
            </div>
          </div>

          <hr className="laporan-divider" />

          {/* Lokasi */}
          <div className="laporan-section-title">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="10" r="3" />
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
            </svg>
            Lokasi (Opsional)
          </div>

          <div className="laporan-row">
            <div className="laporan-field">
              <label className="laporan-label">Latitude</label>
              <input
                className="laporan-input"
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                placeholder="Contoh: 1.0456"
              />
            </div>
            <div className="laporan-field">
              <label className="laporan-label">Longitude</label>
              <input
                className="laporan-input"
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                placeholder="Contoh: 104.0305"
              />
            </div>
          </div>

          <div className="laporan-row-full" style={{ marginBottom: 12 }}>
            <button
              type="button"
              className="laporan-file-label"
              onClick={handleUseLocation}
              style={{ fontSize: 12 }}
            >
              📍 Gunakan Lokasi Saya
            </button>
          </div>

          <div className="laporan-row">
            <div className="laporan-field">
              <label className="laporan-label">Alamat Lokasi</label>
              <input
                className="laporan-input"
                value={form.alamat_lokasi}
                onChange={(e) => updateField("alamat_lokasi", e.target.value)}
                placeholder="Jl. ..."
              />
            </div>
            <div className="laporan-field">
              <label className="laporan-label">Kecamatan</label>
              <select
                className="laporan-select"
                value={form.kecamatan}
                onChange={(e) => updateField("kecamatan", e.target.value)}
              >
                <option value="">Pilih Kecamatan</option>
                {KECAMATAN_OPTIONS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="laporan-divider" />

          {/* Submit */}
          <button
            type="button"
            className="laporan-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Mengirim Laporan..." : "Kirim Laporan"}
          </button>
        </div>
      </div>
    </div>
  );
}
