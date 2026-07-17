'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import AppShell from '../components/AppShell';
// @ts-ignore
import '../styles/infografis.css';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { useReactToPrint } from 'react-to-print';

// ── Types ─────────────────────────────────────────────────

interface InfografisData {
  jumlah_reklame: number;
  status_reklame: { aktif: number; tidak_aktif: number };
  pelanggaran: { tanpa_izin: number; zona_larangan: number };
  jumlah_sanksi: { aktif: number; selesai: number };
  luas_aset: { total_lokasi: number; total_nilai_perolehan: number };
  reklame_tersewa: { tersewa: number; belum_tersewa: number; persen: number; total: number };
  grafik_pelanggaran: {
    tanpa_izin: number; zona_larangan: number;
    kadaluarsa: number; sengketa: number; persen_tanpa_izin: number;
  };
  chart_per_kota: { nama: string; jumlah_aset: number; bersertifikat: number; diproses: number }[];
  filter_options: {
    kabupaten: string[]; kategori: string[];
    status_perizinan: string[]; pelanggaran: string[];
    status_sanksi: string[]; tahun: string[];
  };
}

interface FilterState {
  kabupaten: string;
  kategori: string;
  status_perizinan: string;
  pelanggaran: string;
  status_sanksi: string;
  tahun: string;
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api`;
const DONUT_COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316'];

function formatRupiah(val: number): string {
  if (!val) return 'Rp 0,-';
  return 'Rp ' + val.toLocaleString('id-ID') + ',-';
}

// ── Custom Dropdown ────────────────────────────────────────

function FilterSelect({
  label, value, options, placeholder, onChange,
}: {
  label: string; value: string; options: string[]; placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="ig-filter-input">
      <label className="ig-filter-lbl">{label}</label>
      <div className="ig-filter-field">
        <select
          className="ig-filter-select"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="ig-filter-chevron" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

export default function InfografisPage() {
  const [data, setData] = useState<InfografisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ── ref untuk print (hanya konten ini yang dicetak) ──
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Infografis SigRe',
    pageStyle: `
      @page { size: A4 landscape; margin: 8mm 10mm; }
      body { font-family: Inter, sans-serif; background: #fff; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .ig-btn-download, .ig-filter-actions { display: none !important; }
      .ig-container { padding: 8px 12px !important; }
      .ig-row { margin-bottom: 10px !important; }
      .ig-cards-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; }
      .ig-wide-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
      .ig-filter-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8px !important; }
    `,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    kabupaten: '', kategori: '', status_perizinan: '',
    pelanggaran: '', status_sanksi: '',
    tahun: new Date().getFullYear().toString(),
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    kabupaten: '', kategori: '', status_perizinan: '',
    pelanggaran: '', status_sanksi: '',
    tahun: new Date().getFullYear().toString(),
  });

  const fetchData = useCallback(async (f: FilterState) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (f.kabupaten) params.set('kabupaten', f.kabupaten);
      if (f.kategori) params.set('kategori', f.kategori);
      if (f.status_perizinan) params.set('status_perizinan', f.status_perizinan);
      if (f.pelanggaran) params.set('pelanggaran', f.pelanggaran);
      if (f.status_sanksi) params.set('status_sanksi', f.status_sanksi);
      if (f.tahun) params.set('tahun', f.tahun);

      const res = await fetch(`${API_BASE}/infografis/?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(appliedFilters);
  }, [appliedFilters, fetchData]);

  const handleApply = () => setAppliedFilters({ ...filters });

  const handleReset = () => {
    const defaultF: FilterState = {
      kabupaten: '', kategori: '', status_perizinan: '',
      pelanggaran: '', status_sanksi: '',
      tahun: new Date().getFullYear().toString(),
    };
    setFilters(defaultF);
    setAppliedFilters(defaultF);
  };

  // Skeleton loader
  if (loading && !data) {
    return (
      <AppShell>
        <div className="ig-container">
          <div className="ig-row ig-header-card" style={{ justifyContent: 'space-between' }}>
            <div style={{ height: 24, width: 160, background: '#e2e8f0', borderRadius: 6 }} />
            <div style={{ height: 40, width: 200, background: '#e2e8f0', borderRadius: 6 }} />
          </div>
          <div className="ig-row ig-cards-grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="ig-card" style={{ height: 90 }}>
                <div style={{ width: 54, height: 54, background: '#f0f9ff', borderRadius: 12 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, width: 100, background: '#e2e8f0', borderRadius: 4, marginBottom: 10 }} />
                  <div style={{ height: 24, width: 60, background: '#e2e8f0', borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="ig-row" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            Memuat data infografis...
          </div>
        </div>
      </AppShell>
    );
  }

  const opts = data?.filter_options;

  const donutData = data ? [
    { name: 'Tanpa Izin', value: data.grafik_pelanggaran.tanpa_izin },
    { name: 'Zona Larangan', value: data.grafik_pelanggaran.zona_larangan },
    { name: 'Kadaluarsa', value: data.grafik_pelanggaran.kadaluarsa },
    { name: 'Sengketa', value: data.grafik_pelanggaran.sengketa },
  ].filter(d => d.value > 0) : [];

  const totalDonut = donutData.reduce((s, d) => s + d.value, 0);
  const pctDonut = totalDonut > 0
    ? Math.round((donutData[0]?.value || 0) / totalDonut * 100)
    : data?.grafik_pelanggaran.persen_tanpa_izin || 0;

  return (
    <AppShell>
      {/* ── div ini yang akan dicetak ── */}
      <div className="ig-container" ref={printRef}>

        {/* Error Banner */}
        {error && (
          <div className="ig-row" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 20px', color: '#dc2626', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Gagal terhubung ke backend: {error}
          </div>
        )}

        {/* 1. Header */}
        <div className="ig-row">
          <div className="ig-header-card">
            <div className="ig-title-area">
              <svg className="ig-title-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <h1 className="ig-page-title">Monitoring</h1>
              {loading && <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Memperbarui...</span>}
            </div>
            <button className="ig-btn-download" onClick={handlePrint}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export ke PDF
            </button>
          </div>
        </div>

        {/* 2. Summary Cards */}
        <div className="ig-row ig-cards-grid">
          <div className="ig-card">
            <div className="ig-card-icon-box">
              <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6"/></svg>
            </div>
            <div className="ig-card-content">
              <div className="ig-card-title">Jumlah Reklame</div>
              <div className="ig-card-val-big">{data?.jumlah_reklame ?? '—'}</div>
            </div>
          </div>

          <div className="ig-card">
            <div className="ig-card-icon-box">
              <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div className="ig-card-content">
              <div className="ig-card-title">Status Reklame</div>
              <div className="ig-sub-stats">
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Aktif</span>
                  <span className="ig-sub-val">{data?.status_reklame.aktif ?? '—'}</span>
                </div>
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Tidak Aktif</span>
                  <span className="ig-sub-val">{data?.status_reklame.tidak_aktif ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ig-card">
            <div className="ig-card-icon-box">
              <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
            </div>
            <div className="ig-card-content">
              <div className="ig-card-title">Pelanggaran</div>
              <div className="ig-sub-stats">
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Tanpa Izin</span>
                  <span className="ig-sub-val">{data?.pelanggaran.tanpa_izin ?? '—'}</span>
                </div>
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Zona Larangan</span>
                  <span className="ig-sub-val">{data?.pelanggaran.zona_larangan ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ig-card">
            <div className="ig-card-icon-box">
              <svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="M10.5 13.5l3-3"/></svg>
            </div>
            <div className="ig-card-content">
              <div className="ig-card-title">Jumlah Sanksi</div>
              <div className="ig-sub-stats">
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Aktif</span>
                  <span className="ig-sub-val">{data?.jumlah_sanksi.aktif ?? '—'}</span>
                </div>
                <div className="ig-sub-item">
                  <span className="ig-sub-label">Selesai</span>
                  <span className="ig-sub-val">{data?.jumlah_sanksi.selesai ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Filter */}
        <div className="ig-row ig-filter-card">
          <div className="ig-filter-hd">
            <div className="ig-filter-title">
              <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter Data
            </div>
            <div className="ig-filter-actions">
              <button className="ig-btn-apply" onClick={handleApply}>Apply</button>
              <button className="ig-btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>
          <div className="ig-filter-grid">
            <FilterSelect label="KABUPATEN/KOTA" value={filters.kabupaten}
              options={opts?.kabupaten ?? []} placeholder="Pilih Kabupaten/Kota"
              onChange={v => setFilters(f => ({ ...f, kabupaten: v }))} />
            <FilterSelect label="KATEGORI" value={filters.kategori}
              options={opts?.kategori ?? []} placeholder="Pilih Kategori"
              onChange={v => setFilters(f => ({ ...f, kategori: v }))} />
            <FilterSelect label="STATUS PERIZINAN" value={filters.status_perizinan}
              options={opts?.status_perizinan ?? []} placeholder="Pilih Status Perizinan"
              onChange={v => setFilters(f => ({ ...f, status_perizinan: v }))} />
            <FilterSelect label="PELANGGARAN" value={filters.pelanggaran}
              options={opts?.pelanggaran ?? []} placeholder="Pilih Pelanggaran"
              onChange={v => setFilters(f => ({ ...f, pelanggaran: v }))} />
            <FilterSelect label="STATUS SANKSI" value={filters.status_sanksi}
              options={opts?.status_sanksi ?? []} placeholder="Pilih Status Sanksi"
              onChange={v => setFilters(f => ({ ...f, status_sanksi: v }))} />
            <FilterSelect label="TAHUN DATA" value={filters.tahun}
              options={opts?.tahun ?? ['2024','2025','2026']} placeholder="Pilih Tahun"
              onChange={v => setFilters(f => ({ ...f, tahun: v }))} />
          </div>
        </div>

        {/* 4. Luas Aset + Grafik Pelanggaran */}
        <div className="ig-row ig-wide-grid">
          <div className="ig-box-card">
            <div className="ig-box-title">Luas Aset Dan Nilai Perolehan</div>
            <div className="ig-luas-grid">
              <div className="ig-inner-card">
                <div className="ig-inner-hd">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Reklame Tersewa
                </div>
                <div className="ig-inner-lbl">Total Lokasi</div>
                <div className="ig-inner-val">{data?.luas_aset.total_lokasi?.toLocaleString('id-ID') ?? '—'}</div>
              </div>
              <div className="ig-inner-card">
                <div className="ig-inner-hd">
                  <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Nilai Perolehan
                </div>
                <div className="ig-inner-lbl">Total Nilai Perolehan</div>
                <div className={`ig-inner-val${data && data.luas_aset.total_nilai_perolehan > 999999999 ? ' ig-inner-val--compact' : ''}`}>
                  {data ? formatRupiah(data.luas_aset.total_nilai_perolehan) : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="ig-box-card">
            <div className="ig-box-title">Grafik Status Pelanggaran</div>
            <div className="ig-chart-flex">
              <div className="ig-legend-grid">
                {[
                  { label: 'Tanpa Izin', val: data?.grafik_pelanggaran.tanpa_izin ?? 0, color: '#0ea5e9' },
                  { label: 'Zona Larangan', val: data?.grafik_pelanggaran.zona_larangan ?? 0, color: '#22c55e' },
                  { label: 'Kadaluarsa', val: data?.grafik_pelanggaran.kadaluarsa ?? 0, color: '#eab308' },
                  { label: 'Sengketa', val: data?.grafik_pelanggaran.sengketa ?? 0, color: '#f97316' },
                ].map(item => (
                  <div key={item.label} className="ig-leg-item">
                    <div className="ig-leg-top">
                      <div className="ig-dot" style={{ background: item.color }}></div> {item.label}
                    </div>
                    <div className="ig-leg-val">
                      <span className="ig-leg-val-num" style={{ color: item.color }}>{item.val.toLocaleString('id-ID')}</span>
                      <span className="ig-leg-val-unit">Aset(s)</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ig-donut-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData.length > 0 ? donutData : [{ name: 'Tidak Ada Data', value: 1 }]}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={75}
                      paddingAngle={2} dataKey="value" labelLine={false}
                    >
                      {(donutData.length > 0 ? donutData : [{ name: 'Tidak Ada Data', value: 1 }]).map((_, i) => (
                        <Cell key={i} fill={donutData.length > 0 ? DONUT_COLORS[i % DONUT_COLORS.length] : '#e2e8f0'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => [`${Number(v).toLocaleString('id-ID')} Aset`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ig-donut-pct-overlay">
                  <span className="ig-donut-pct-label">{pctDonut}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Reklame Tersewa */}
        <div className="ig-row ig-box-card">
          <div className="ig-box-title" style={{ marginBottom: 0 }}>Jumlah Titik Reklame Tersewa</div>
          <div className="ig-bottom-content">
            <div className="ig-bot-hd">
              <div className="ig-bot-val">{data?.reklame_tersewa.tersewa?.toLocaleString('id-ID') ?? '—'}</div>
              <div className="ig-bot-pct">{data?.reklame_tersewa.persen ?? 0}%</div>
            </div>
            <div className="ig-progress-bg">
              <div className="ig-progress-fill" style={{ width: `${data?.reklame_tersewa.persen ?? 0}%`, transition: 'width 0.6s ease' }}></div>
            </div>
            <div className="ig-bot-legend">
              <div className="ig-bot-leg-item">
                <div className="ig-dot ig-c2"></div> Tersewa ({data?.reklame_tersewa.tersewa?.toLocaleString('id-ID') ?? 0})
              </div>
              <div className="ig-bot-leg-item">
                <div className="ig-dot" style={{ background: '#cbd5e1' }}></div> Belum Tersewa ({data?.reklame_tersewa.belum_tersewa?.toLocaleString('id-ID') ?? 0})
              </div>
            </div>
          </div>
        </div>

        {/* 6. Bar Chart Per Kota */}
        <div className="ig-row ig-box-card">
          <div className="ig-box-title">Jumlah Aset Per Kota / Zona</div>
          {(!data?.chart_per_kota || data.chart_per_kota.length === 0) ? (
            <div className="ig-empty-state">
              Tidak ada data tersedia untuk filter ini.
            </div>
          ) : (
            <div className="ig-bar-chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.chart_per_kota} margin={{ top: 10, right: 20, left: 0, bottom: 60 }} barGap={2} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="nama" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} angle={-30} textAnchor="end" interval={0} height={60} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Jumlah Aset', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#64748b' } }} />
                  <Tooltip formatter={(val: unknown, name: unknown) => [Number(val).toLocaleString('id-ID'), String(name)]} contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingTop: 8 }} iconType="circle" iconSize={10} />
                  <Bar dataKey="jumlah_aset" name="Jumlah Aset" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="bersertifikat" name="Bersertifikat" fill="#16a34a" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="diproses" name="Diproses" fill="#eab308" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>
    </AppShell>
  );
}