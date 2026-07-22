"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import AppShell from "../components/AppShell";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useReactToPrint } from "react-to-print";

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api`;

type Aset = {
  id: string;
  kode_reklame: string;
  nama_pemilik: string;
  nik_npwp: string;
  latitude: string;
  longitude: string;
  luas_m2: string;
  tinggi_m: string;
  status_reklame: string;
  tanggal_pasang: string;
  kategori: string | null;
  zona: string | null;
  kabupaten_kota: string | null;
  pengguna: string | null;
  kuasa_pengguna: string | null;
  nama_zona: string | null;
  tipe_zona: string | null;
  nama_kategori: string | null;
};

type FilterOptions = {
  kabupaten_kota: string[];
  pengguna: string[];
  kuasa_pengguna: string[];
  tipe_zona: string[];
  kategori: string[];
  status_reklame: string[];
};

type FilterState = {
  kabupaten_kota: string;
  pengguna: string;
  kuasa_pengguna: string;
  tipe_zona: string;
  kategori: string;
  status_reklame: string;
};

const EMPTY_FILTER: FilterState = {
  kabupaten_kota: "",
  pengguna: "",
  kuasa_pengguna: "",
  tipe_zona: "",
  kategori: "",
  status_reklame: "",
};

const FILTER_LABELS: Record<keyof FilterState, string> = {
  kabupaten_kota: "Kabupaten/Kota",
  pengguna: "Pengguna",
  kuasa_pengguna: "Kuasa Pengguna",
  tipe_zona: "Tipe Zona",
  kategori: "Kategori",
  status_reklame: "Status Reklame",
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { background: "rgba(251, 251, 250, 1)", padding: 24, fontFamily: "sans-serif" },
  card: { background: "rgba(251, 251, 250, 1)", borderRadius: 12, padding: 20 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 16, flexWrap: "wrap" },
  title: { fontSize: 18, fontWeight: 600 },
  searchBox: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid rgb(229, 231, 235)", width: 270, outline: "none" },
  btnPrimary: { background: "#1a8fe3", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer" },
  btnPrimaryPDF: { background: "#1a8fe3", color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", cursor: "pointer", display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" },
  btnSecondary: { background: "#fff", color: "#111827", border: "1px solid #ddd", borderRadius: 8, padding: "10px 16px", cursor: "pointer" },
  filterBox: { border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, marginBottom: 20, backgroundColor: "#fff" },
  filterRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  select: { padding: "10px", borderRadius: 8, border: "1px solid #ddd", minWidth: 180, outline: "none", background: "#fff", cursor: "pointer" },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 1400 },
  th: { textAlign: "left", fontSize: 12, color: "#6b7280", padding: 10, borderBottom: "2px solid #eee", whiteSpace: "nowrap" },
  td: { padding: 12, borderBottom: "1px solid #eee", fontSize: 13, verticalAlign: "top", backgroundColor: "#fff" },
  badgeAktif: { background: "#e6f7ee", color: "#16a34a", padding: "4px 10px", borderRadius: 20, fontSize: 12 },
  badgeInaktif: { background: "#fef2f2", color: "#dc2626", padding: "4px 10px", borderRadius: 20, fontSize: 12 },
  badgePending: { background: "#fff7ed", color: "#ea580c", padding: "4px 10px", borderRadius: 20, fontSize: 12 },
  pagination: { display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center", flexWrap: "wrap", gap: 12 },
  pager: { display: "flex", gap: 6, alignItems: "center" },
  pageBtn: { padding: "6px 10px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", background: "#fff", fontSize: 13, minWidth: 34, height: 34 },
  activePage: { background: "#1a8fe3", color: "#fff", border: "1px solid #1a8fe3" },
  loading: { textAlign: "center", padding: 40, color: "#888", fontSize: 14 },
  error: { textAlign: "center", padding: 40, color: "#dc2626", fontSize: 14 },
  searchInfo: { marginBottom: 14, fontSize: 13, color: "#4b5563" },
  empty: { textAlign: "center", color: "#888", padding: 28, backgroundColor: "#fff" },
  activeBadge: { display: "inline-block", background: "#eff6ff", color: "#1a8fe3", border: "1px solid #bfdbfe", borderRadius: 20, padding: "2px 10px", fontSize: 12, marginRight: 6, marginTop: 8 },
};

import ReklamePrintReport, {
  type PrintFilterItem,
} from "../components/ReklamePrintReport";

import "../styles/manajemen_reklame_print.css";

export default function Page() {
  const router = useRouter();
  const [asetData, setAsetData] = useState<Aset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ kabupaten_kota: [], pengguna: [], kuasa_pengguna: [], tipe_zona: [], kategori: [], status_reklame: [] });
  const [pendingFilter, setPendingFilter] = useState<FilterState>(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState<FilterState>(EMPTY_FILTER);
  const [searchInput, setSearchInput] = useState("");
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
  const [checkedAll, setCheckedAll] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;
  const printRef = useRef<HTMLDivElement>(null);

  const [printGeneratedAt, setPrintGeneratedAt] = useState(
    new Date()
  );

  const { data: session, status } = useSession();
  const accessToken = (session as any)?.accessToken;

  const fetchData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/reklame/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Gagal");
      setAsetData(await res.json());
    } catch (err) { setError("Gagal konek ke server."); console.error(err); }
    finally { setLoading(false); }
  }, [accessToken]);

  const fetchFilterOptions = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/reklame-filter-options/`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) setFilterOptions(await res.json());
    } catch (err) { console.error(err); }
  }, [accessToken]);

  useEffect(() => {
    if (status === "authenticated" && accessToken) {
      fetchData(); fetchFilterOptions();
    }
  }, [fetchData, fetchFilterOptions, accessToken, status]);

  const handleSearchChange = (v: string) => { setSearchInput(v); setPage(1); setChecked({}); setCheckedAll(false); };
  const handleResetSearch = () => { setSearchInput(""); setPage(1); setChecked({}); setCheckedAll(false); };
  const handleFilterChange = (key: keyof FilterState, value: string) => setPendingFilter((prev) => ({ ...prev, [key]: value }));
  const handleCari = () => { setAppliedFilter({ ...pendingFilter }); setPage(1); setChecked({}); setCheckedAll(false); };
  const handleResetFilter = () => { setPendingFilter(EMPTY_FILTER); setAppliedFilter(EMPTY_FILTER); setPage(1); setChecked({}); setCheckedAll(false); };

  const filtered = useMemo(
    () =>
      asetData.filter((aset) => {
        const keyword = searchInput.trim().toLowerCase();

        if (
          keyword &&
          !(aset.nama_pemilik || "")
            .toLowerCase()
            .includes(keyword)
        ) {
          return false;
        }

        if (
          appliedFilter.kabupaten_kota &&
          (aset.kabupaten_kota || "").toLowerCase() !==
          appliedFilter.kabupaten_kota.toLowerCase()
        ) {
          return false;
        }

        if (
          appliedFilter.pengguna &&
          (aset.pengguna || "").toLowerCase() !==
          appliedFilter.pengguna.toLowerCase()
        ) {
          return false;
        }

        if (
          appliedFilter.kuasa_pengguna &&
          (aset.kuasa_pengguna || "").toLowerCase() !==
          appliedFilter.kuasa_pengguna.toLowerCase()
        ) {
          return false;
        }

        if (
          appliedFilter.tipe_zona &&
          (aset.tipe_zona || "").toLowerCase() !==
          appliedFilter.tipe_zona.toLowerCase()
        ) {
          return false;
        }

        if (
          appliedFilter.kategori &&
          (aset.nama_kategori || "").toLowerCase() !==
          appliedFilter.kategori.toLowerCase()
        ) {
          return false;
        }

        if (
          appliedFilter.status_reklame &&
          (aset.status_reklame || "").toLowerCase() !==
          appliedFilter.status_reklame.toLowerCase()
        ) {
          return false;
        }

        return true;
      }),
    [asetData, searchInput, appliedFilter]
  );

  const printFilters = useMemo<PrintFilterItem[]>(() => {
    const items: PrintFilterItem[] = [];

    const keyword = searchInput.trim();

    if (keyword) {
      items.push({
        label: "Pencarian Nama Pemilik",
        value: keyword,
      });
    }

    (
      Object.entries(appliedFilter) as [
        keyof FilterState,
        string
      ][]
    ).forEach(([key, value]) => {
      if (value) {
        items.push({
          label: FILTER_LABELS[key],
          value,
        });
      }
    });

    return items;
  }, [searchInput, appliedFilter]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,

    documentTitle: `Laporan_Data_Reklame_${new Date()
      .toISOString()
      .slice(0, 10)}`,

    onBeforePrint: async () => {
      setPrintGeneratedAt(new Date());

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve())
      );
    },

    pageStyle: `
    @page {
      size: A4 landscape;
      margin: 10mm 8mm 12mm;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    * {
      box-sizing: border-box;

      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  `,
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const getPaginationItems = (cp: number, total: number) => {
    const delta = 1; const range: (number | string)[] = []; const pages: number[] = [];
    for (let i = 1; i <= total; i++) { if (i === 1 || i === total || (i >= cp - delta && i <= cp + delta)) pages.push(i); }
    let last = 0;
    pages.forEach((p) => { if (last && p - last > 1) range.push(`ellipsis-${last}`); range.push(p); last = p; });
    return range;
  };

  const goToPage = (t: number) => { if (t < 1 || t > totalPages) return; setPage(t); setChecked({}); setCheckedAll(false); };
  const toggleAll = () => { const next = !checkedAll; setCheckedAll(next); const m: { [k: string]: boolean } = {}; paginated.forEach((r) => { m[r.kode_reklame] = next; }); setChecked(m); };
  const toggleOne = (k: string) => setChecked((prev) => ({ ...prev, [k]: !prev[k] }));
  const getStatusStyle = (s: string) => { const u = s?.toUpperCase(); if (u === "AKTIF") return styles.badgeAktif; if (u === "PENDING") return styles.badgePending; return styles.badgeInaktif; };
  const activeFilterCount = Object.values(appliedFilter).filter(Boolean).length;
  const paginationItems = getPaginationItems(page, totalPages);

  return (
    <AppShell>
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.title}>Manajemen Reklame</div>
            <div style={styles.searchBox}>
              <input placeholder="Cari Berdasarkan Nama Pemilik" style={styles.input} value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} />
              <button type="button" style={styles.btnSecondary} onClick={handleResetSearch}>Reset</button>
              <button type="button" style={styles.btnPrimary} onClick={() => router.push('/manajemen_reklame/create')}>+ Tambah Reklame</button>
              <button
                type="button"
                style={{
                  ...styles.btnPrimaryPDF,

                  opacity:
                    loading || filtered.length === 0
                      ? 0.55
                      : 1,

                  cursor:
                    loading || filtered.length === 0
                      ? "not-allowed"
                      : "pointer",
                }}
                onClick={() => handlePrint()}
                disabled={loading || filtered.length === 0}
                title="Buka print preview untuk mencetak atau menyimpan sebagai PDF"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 6 2 18 2 18 9" />

                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />

                  <rect
                    x="6"
                    y="14"
                    width="12"
                    height="8"
                  />
                </svg>

                 Export ke PDF
              </button>
            </div>
          </div>
{/* Konten khusus yang akan dicetak */}
<div
  aria-hidden="true"
  style={{
    position: "fixed",
    left: "-100000px",
    top: 0,
    width: "297mm",
    pointerEvents: "none",
  }}
>
  <div ref={printRef}>
    <ReklamePrintReport
      data={filtered}
      filters={printFilters}
      generatedAt={printGeneratedAt}
    />
  </div>
</div>
          <div style={styles.filterBox}>
            <div style={{ marginBottom: 10, fontWeight: 600 }}>
              Filter Data
              {activeFilterCount > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: "#1a8fe3", fontWeight: 400 }}>({activeFilterCount} filter aktif)</span>}
            </div>
            <div style={styles.filterRow}>
              <select style={styles.select} value={pendingFilter.kabupaten_kota} onChange={(e) => handleFilterChange("kabupaten_kota", e.target.value)}>
                <option value="">Pilih Kabupaten/Kota</option>
                {filterOptions.kabupaten_kota.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select style={styles.select} value={pendingFilter.pengguna} onChange={(e) => handleFilterChange("pengguna", e.target.value)}>
                <option value="">Pilih Pengguna</option>
                {filterOptions.pengguna.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select style={styles.select} value={pendingFilter.kuasa_pengguna} onChange={(e) => handleFilterChange("kuasa_pengguna", e.target.value)}>
                <option value="">Pilih Kuasa Pengguna</option>
                {filterOptions.kuasa_pengguna.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select style={styles.select} value={pendingFilter.tipe_zona} onChange={(e) => handleFilterChange("tipe_zona", e.target.value)}>
                <option value="">Pilih Tipe Zona</option>
                {filterOptions.tipe_zona.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select style={styles.select} value={pendingFilter.kategori} onChange={(e) => handleFilterChange("kategori", e.target.value)}>
                <option value="">Pilih Kategori</option>
                {filterOptions.kategori.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select style={styles.select} value={pendingFilter.status_reklame} onChange={(e) => handleFilterChange("status_reklame", e.target.value)}>
                <option value="">Pilih Status Reklame</option>
                {filterOptions.status_reklame.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button type="button" style={styles.btnPrimary} onClick={handleCari}>Cari</button>
              <button type="button" style={styles.pageBtn} onClick={handleResetFilter}>Reset</button>
            </div>
            {activeFilterCount > 0 && (
              <div style={{ marginTop: 6 }}>
                {appliedFilter.kabupaten_kota && <span style={styles.activeBadge}>Kab/Kota: {appliedFilter.kabupaten_kota}</span>}
                {appliedFilter.pengguna && <span style={styles.activeBadge}>Pengguna: {appliedFilter.pengguna}</span>}
                {appliedFilter.kuasa_pengguna && <span style={styles.activeBadge}>Kuasa: {appliedFilter.kuasa_pengguna}</span>}
                {appliedFilter.tipe_zona && <span style={styles.activeBadge}>Tipe Zona: {appliedFilter.tipe_zona}</span>}
                {appliedFilter.kategori && <span style={styles.activeBadge}>Kategori: {appliedFilter.kategori}</span>}
                {appliedFilter.status_reklame && <span style={styles.activeBadge}>Status: {appliedFilter.status_reklame}</span>}
              </div>
            )}
          </div>

          {searchInput.trim() && <div style={styles.searchInfo}>Hasil pencarian nama pemilik: <b>{searchInput}</b></div>}

          {loading ? <div style={styles.loading}>⏳ Memuat data dari server...</div>
            : error ? <div style={styles.error}>⚠️ {error}</div>
              : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}><input type="checkbox" onChange={toggleAll} checked={checkedAll} /></th>
                        <th style={styles.th}>Kode Reklame</th>
                        <th style={styles.th}>Nama Pemilik</th>
                        <th style={styles.th}>NIK/NPWP</th>
                        <th style={styles.th}>Kabupaten/Kota</th>
                        <th style={styles.th}>Pengguna</th>
                        <th style={styles.th}>Kuasa Pengguna</th>
                        <th style={styles.th}>Tipe Zona</th>
                        <th style={styles.th}>Koordinat</th>
                        <th style={styles.th}>Luas (m²)</th>
                        <th style={styles.th}>Tinggi (m)</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Tanggal Pasang</th>
                        <th style={styles.th}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.length === 0 ? (
                        <tr><td colSpan={14} style={{ ...styles.td, ...styles.empty }}>Tidak ada data ditemukan.</td></tr>
                      ) : paginated.map((row) => (
                        <tr key={row.kode_reklame}>
                          <td style={styles.td}><input type="checkbox" checked={!!checked[row.kode_reklame]} onChange={() => toggleOne(row.kode_reklame)} /></td>
                          <td style={styles.td}>{row.kode_reklame}</td>
                          <td style={styles.td}>{row.nama_pemilik}</td>
                          <td style={styles.td}>{row.nik_npwp || "-"}</td>
                          <td style={styles.td}>{row.kabupaten_kota || "-"}</td>
                          <td style={styles.td}>{row.pengguna || "-"}</td>
                          <td style={styles.td}>{row.kuasa_pengguna || "-"}</td>
                          <td style={styles.td}>{row.tipe_zona || "-"}</td>
                          <td style={styles.td}>{row.latitude}, {row.longitude}</td>
                          <td style={styles.td}>{row.luas_m2 || "-"}</td>
                          <td style={styles.td}>{row.tinggi_m || "-"}</td>
                          <td style={styles.td}><span style={getStatusStyle(row.status_reklame)}>{row.status_reklame || "-"}</span></td>
                          <td style={styles.td}>{row.tanggal_pasang || "-"}</td>
                          <td style={styles.td}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button type="button" style={styles.pageBtn} onClick={() => router.push(`/manajemen_reklame/detail/${encodeURIComponent(row.kode_reklame)}`)}>Detail</button>
                              <button type="button" style={styles.btnPrimary} onClick={() => router.push(`/manajemen_reklame/edit/${encodeURIComponent(row.kode_reklame)}`)}>Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

          {!loading && !error && filtered.length > 0 && (
            <div style={styles.pagination}>
              <div>Menampilkan {(page - 1) * PER_PAGE + 1} sampai {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} data</div>
              <div style={styles.pager}>
                <button type="button" style={{ ...styles.pageBtn, opacity: page === 1 ? 0.5 : 1, cursor: page === 1 ? "not-allowed" : "pointer" }} disabled={page === 1} onClick={() => goToPage(page - 1)}>&lt;</button>
                {paginationItems.map((item, index) => typeof item === "string"
                  ? <div key={`${item}-${index}`} style={{ ...styles.pageBtn, cursor: "default", border: "none", background: "transparent" }}>...</div>
                  : <button type="button" key={item} style={item === page ? { ...styles.pageBtn, ...styles.activePage } : styles.pageBtn} onClick={() => goToPage(item)}>{item}</button>
                )}
                <button type="button" style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.5 : 1, cursor: page === totalPages ? "not-allowed" : "pointer" }} disabled={page === totalPages} onClick={() => goToPage(page + 1)}>&gt;</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

