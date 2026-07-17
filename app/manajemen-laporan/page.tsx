"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "../components/AppShell";
import Image from "next/image";
import { useSession } from "next-auth/react";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

type Laporan = {
  id: string;
  nama_pelapor: string | null;
  no_telepon: string | null;
  email_pelapor: string | null;
  isi_laporan: string;
  kategori_laporan: string;
  foto: string | null;
  latitude: string | null;
  longitude: string | null;
  alamat_lokasi: string | null;
  kecamatan: string | null;
  reklame: string | null;
  kode_reklame: string | null;
  status_laporan: string;
  catatan_admin: string | null;
  created_at: string;
  updated_at: string;
};

const KATEGORI_LABELS: Record<string, string> = {
  REKLAME_ILEGAL: "Reklame Ilegal",
  REKLAME_RUSAK: "Reklame Rusak",
  MELANGGAR_ZONA: "Melanggar Zona",
  REKLAME_KADALUARSA: "Reklame Kadaluarsa",
  LAINNYA: "Lainnya",
};

const STATUS_OPTIONS = ["", "PENDING", "DIPROSES", "SELESAI"];

const styles: { [key: string]: React.CSSProperties } = {
  page: { background: "#f8f9fb", padding: 24, fontFamily: "'Inter', sans-serif", minHeight: "100vh" },
  card: { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e5e7eb" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { fontSize: 18, fontWeight: 700, color: "#1f2937" },
  filterRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 },
  select: { padding: 10, borderRadius: 8, border: "1px solid #ddd", minWidth: 160, outline: "none", background: "#fff", cursor: "pointer", fontSize: 13 },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", width: 240, outline: "none", fontSize: 13 },
  btnPrimary: { background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  btnSecondary: { background: "#fff", color: "#374151", border: "1px solid #ddd", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 13 },
  table: { width: "100%", borderCollapse: "collapse" as const, minWidth: 900 },
  th: { textAlign: "left" as const, fontSize: 11, color: "#6b7280", padding: "10px 12px", borderBottom: "2px solid #eee", whiteSpace: "nowrap" as const, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  td: { padding: "12px", borderBottom: "1px solid #f3f4f6", fontSize: 13, verticalAlign: "top" as const },
  badgePending: { background: "#fff7ed", color: "#ea580c", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  badgeDiproses: { background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  badgeSelesai: { background: "#f0fdf4", color: "#16a34a", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  empty: { textAlign: "center" as const, color: "#888", padding: 28 },
  loading: { textAlign: "center" as const, padding: 40, color: "#888" },
  pagination: { display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center", flexWrap: "wrap" as const, gap: 12, fontSize: 13, color: "#6b7280" },
  pageBtn: { padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", background: "#fff", fontSize: 13, minWidth: 34, height: 34 },
  activePage: { background: "#0ea5e9", color: "#fff", border: "1px solid #0ea5e9" },
  modal: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalCard: { background: "#fff", borderRadius: 12, padding: 24, maxWidth: 480, width: "100%", maxHeight: "80vh", overflowY: "auto" as const },
  modalTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1f2937" },
  modalField: { marginBottom: 12 },
  modalLabel: { fontSize: 11, color: "#6b7280", fontWeight: 600, marginBottom: 4, display: "block" },
  modalValue: { fontSize: 13, color: "#1f2937" },
  alertSuccess: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 12 },
  alertError: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: 10, borderRadius: 6, marginBottom: 12, fontSize: 12 },
};

function getStatusBadge(status: string) {
  if (status === "PENDING") return styles.badgePending;
  if (status === "DIPROSES") return styles.badgeDiproses;
  return styles.badgeSelesai;
}

function formatDate(val: string) {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ManajemenLaporanPage() {
  const [data, setData] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Detail modal
  const [selectedLaporan, setSelectedLaporan] = useState<Laporan | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editCatatan, setEditCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalError, setModalError] = useState("");

  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken;

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/laporan-masyarakat/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Gagal");
      const json = await res.json();
      setData(Array.isArray(json) ? json : json.results || []);
    } catch {
      setError("Gagal memuat data laporan.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { 
    if (status === "authenticated" && accessToken) fetchData(); 
  }, [fetchData, accessToken, status]);

  const filtered = data.filter((l) => {
    if (filterStatus && l.status_laporan !== filterStatus) return false;
    if (filterKategori && l.kategori_laporan !== filterKategori) return false;
    if (search) {
      const kw = search.toLowerCase();
      const match =
        (l.nama_pelapor || "").toLowerCase().includes(kw) ||
        l.isi_laporan.toLowerCase().includes(kw) ||
        (l.kecamatan || "").toLowerCase().includes(kw) ||
        (l.alamat_lokasi || "").toLowerCase().includes(kw);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function openDetail(l: Laporan) {
    setSelectedLaporan(l);
    setEditStatus(l.status_laporan);
    setEditCatatan(l.catatan_admin || "");
    setModalMessage("");
    setModalError("");
  }

  async function handleUpdateStatus() {
    if (!selectedLaporan) return;
    setSaving(true);
    setModalError("");
    setModalMessage("");
    try {
      const res = await fetch(`${API_BASE}/laporan-masyarakat/${selectedLaporan.id}/`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          status_laporan: editStatus,
          catatan_admin: editCatatan,
        }),
      });
      if (!res.ok) throw new Error("Gagal update");
      setModalMessage("Status berhasil diperbarui.");
      await fetchData();
      // Update selected with new data
      const updated = await res.json();
      setSelectedLaporan(updated);
    } catch {
      setModalError("Gagal memperbarui status laporan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.title}>📋 Manajemen Laporan Masyarakat</div>
          </div>

          <div style={styles.filterRow}>
            <input
              placeholder="Cari nama, isi, kecamatan..."
              style={styles.input}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <select
              style={styles.select}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="">Semua Status</option>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              style={styles.select}
              value={filterKategori}
              onChange={(e) => { setFilterKategori(e.target.value); setPage(1); }}
            >
              <option value="">Semua Kategori</option>
              {Object.entries(KATEGORI_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterKategori(""); setPage(1); }}
            >
              Reset
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>⏳ Memuat data laporan...</div>
          ) : error ? (
            <div style={{ ...styles.loading, color: "#dc2626" }}>⚠️ {error}</div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Tanggal</th>
                      <th style={styles.th}>Pelapor</th>
                      <th style={styles.th}>Kategori</th>
                      <th style={styles.th}>Isi Laporan</th>
                      <th style={styles.th}>Kecamatan</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={styles.empty}>Tidak ada laporan ditemukan.</td>
                      </tr>
                    ) : (
                      paginated.map((l) => (
                        <tr key={l.id}>
                          <td style={styles.td}>{formatDate(l.created_at)}</td>
                          <td style={styles.td}>{l.nama_pelapor || <span style={{ color: "#9ca3af" }}>Anonim</span>}</td>
                          <td style={styles.td}>{KATEGORI_LABELS[l.kategori_laporan] || l.kategori_laporan}</td>
                          <td style={{ ...styles.td, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {l.isi_laporan}
                          </td>
                          <td style={styles.td}>{l.kecamatan || "-"}</td>
                          <td style={styles.td}>
                            <span style={getStatusBadge(l.status_laporan)}>
                              {l.status_laporan}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              type="button"
                              style={styles.btnPrimary}
                              onClick={() => openDetail(l)}
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filtered.length > 0 && (
                <div style={styles.pagination}>
                  <div>
                    Menampilkan {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} laporan
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      style={{ ...styles.pageBtn, opacity: page <= 1 ? 0.5 : 1 }}
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span style={{ ...styles.pageBtn, cursor: "default", border: "none", background: "transparent" }}>...</span>
                          )}
                          <button
                            type="button"
                            style={p === page ? { ...styles.pageBtn, ...styles.activePage } : styles.pageBtn}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      type="button"
                      style={{ ...styles.pageBtn, opacity: page >= totalPages ? 0.5 : 1 }}
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Modal */}
        {selectedLaporan && (
          <div style={styles.modal} onClick={() => setSelectedLaporan(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalTitle}>
                Detail Laporan
              </div>

              {modalMessage && <div style={styles.alertSuccess}>{modalMessage}</div>}
              {modalError && <div style={styles.alertError}>{modalError}</div>}

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Tanggal Masuk</span>
                <div style={styles.modalValue}>{formatDate(selectedLaporan.created_at)}</div>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Pelapor</span>
                <div style={styles.modalValue}>
                  {selectedLaporan.nama_pelapor || "Anonim"}
                  {selectedLaporan.no_telepon && ` — ${selectedLaporan.no_telepon}`}
                  {selectedLaporan.email_pelapor && ` — ${selectedLaporan.email_pelapor}`}
                </div>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Kategori</span>
                <div style={styles.modalValue}>
                  {KATEGORI_LABELS[selectedLaporan.kategori_laporan] || selectedLaporan.kategori_laporan}
                </div>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Isi Laporan</span>
                <div style={{ ...styles.modalValue, whiteSpace: "pre-wrap", background: "#f9fafb", padding: 10, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                  {selectedLaporan.isi_laporan}
                </div>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Lokasi</span>
                <div style={styles.modalValue}>
                  {selectedLaporan.alamat_lokasi || "-"}
                  {selectedLaporan.kecamatan && `, Kec. ${selectedLaporan.kecamatan}`}
                  {selectedLaporan.latitude && selectedLaporan.longitude && (
                    <span style={{ color: "#6b7280", marginLeft: 8 }}>
                      ({selectedLaporan.latitude}, {selectedLaporan.longitude})
                    </span>
                  )}
                </div>
              </div>

              {selectedLaporan.kode_reklame && (
                <div style={styles.modalField}>
                  <span style={styles.modalLabel}>Reklame Terkait</span>
                  <div style={styles.modalValue}>{selectedLaporan.kode_reklame}</div>
                </div>
              )}

              <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Status Laporan</span>
                <select
                  style={{ ...styles.select, width: "100%" }}
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="DIPROSES">DIPROSES</option>
                  <option value="SELESAI">SELESAI</option>
                </select>
              </div>

              <div style={styles.modalField}>
                <span style={styles.modalLabel}>Catatan Admin</span>
                <textarea
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: 10,
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 13,
                    resize: "vertical",
                    fontFamily: "inherit",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Tambahkan catatan tindak lanjut..."
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => setSelectedLaporan(null)}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  style={{ ...styles.btnPrimary, opacity: saving ? 0.7 : 1 }}
                  onClick={handleUpdateStatus}
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
