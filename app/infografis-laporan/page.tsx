"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppShell from "../components/AppShell";
import "../styles/infografis_laporan.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const API_BASE = `${
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
}/api`;

interface StatsData {
  total: number;

  status: {
    pending: number;
    diproses: number;
    selesai: number;
  };

  per_kategori: {
    kategori_laporan: string;
    jumlah: number;
  }[];

  per_kecamatan: {
    kecamatan: string;
    jumlah: number;
  }[];

  per_bulan: {
    bulan: string;
    jumlah: number;
  }[];
}

interface ConditionalLayoutProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

const KATEGORI_LABELS: Record<string, string> = {
  REKLAME_ILEGAL: "Reklame Ilegal",
  REKLAME_RUSAK: "Reklame Rusak",
  MELANGGAR_ZONA: "Melanggar Zona",
  REKLAME_KADALUARSA: "Kadaluarsa",
  LAINNYA: "Lainnya",
};

const DONUT_COLORS = ["#fbbf24", "#60a5fa", "#4ade80"];

const BAR_COLORS = [
  "#0ea5e9",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Header ini hanya muncul untuk pengunjung
 * yang belum login.
 */
function PublicHeader() {
  return (
    <header
      style={{
        background: "#ffffff",
        padding: "16px 24px",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        href="/landing"
        aria-label="Kembali ke halaman beranda"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#1e3a8a",
          textDecoration: "none",
          fontWeight: 600,
          fontSize: "15px",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>

        Kembali ke Beranda
      </Link>
    </header>
  );
}

/**
 * Admin yang sudah login menggunakan AppShell.
 *
 * Pengunjung tanpa login tidak memasang AppShell,
 * Navbar admin, NavDrawer, fungsi logout, maupun
 * pemeriksaan refresh token.
 */
function ConditionalLayout({
  isAuthenticated,
  children,
}: ConditionalLayoutProps) {
  if (isAuthenticated) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <>
      <PublicHeader />
      {children}
    </>
  );
}

function LoadingContent({ message }: { message: string }) {
  return (
    <div className="igl-page">
      <div className="igl-loading">{message}</div>
    </div>
  );
}

export default function InfografisLaporanPage() {
  const { status: sessionStatus } = useSession();

  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAuthenticated = sessionStatus === "authenticated";

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchStats() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/laporan-masyarakat/stats/`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          let errorMessage = "Gagal memuat statistik laporan.";

          try {
            const errorResponse = await response.json();

            if (errorResponse?.detail) {
              errorMessage = errorResponse.detail;
            }
          } catch {
            // Gunakan pesan bawaan ketika respons bukan JSON.
          }

          throw new Error(errorMessage);
        }

        const result = (await response.json()) as StatsData;

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (!isMounted || controller.signal.aborted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat mengambil data.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  /**
   * Tunggu pemeriksaan sesi selesai agar navbar publik
   * tidak muncul sesaat sebelum navbar admin.
   */
  if (sessionStatus === "loading") {
    return <LoadingContent message="Memeriksa sesi pengguna..." />;
  }

  if (loading) {
    return (
      <ConditionalLayout isAuthenticated={isAuthenticated}>
        <LoadingContent message="⏳ Memuat data infografis laporan..." />
      </ConditionalLayout>
    );
  }

  if (error || !data) {
    return (
      <ConditionalLayout isAuthenticated={isAuthenticated}>
        <div className="igl-page">
          <div
            className="igl-loading"
            style={{
              color: "#dc2626",
            }}
          >
            ⚠️ {error || "Data infografis tidak tersedia."}
          </div>
        </div>
      </ConditionalLayout>
    );
  }

  const statusData = [
    {
      name: "Pending",
      value: Number(data.status?.pending ?? 0),
    },
    {
      name: "Diproses",
      value: Number(data.status?.diproses ?? 0),
    },
    {
      name: "Selesai",
      value: Number(data.status?.selesai ?? 0),
    },
  ].filter((item) => item.value > 0);

  const kategoriData = (data.per_kategori ?? []).map((item) => ({
    name:
      KATEGORI_LABELS[item.kategori_laporan] ||
      item.kategori_laporan ||
      "Tanpa Kategori",

    jumlah: Number(item.jumlah ?? 0),
  }));

  const kecamatanData = (data.per_kecamatan ?? []).map((item) => ({
    name: item.kecamatan || "Tidak diketahui",
    jumlah: Number(item.jumlah ?? 0),
  }));

  const bulanData = (data.per_bulan ?? []).map((item) => {
    const [year, month] = String(item.bulan ?? "").split("-");
    const monthIndex = Number.parseInt(month, 10) - 1;

    const validMonth =
      monthIndex >= 0 && monthIndex < MONTH_LABELS.length
        ? MONTH_LABELS[monthIndex]
        : month || "-";

    return {
      name: `${validMonth} ${year || ""}`.trim(),
      jumlah: Number(item.jumlah ?? 0),
    };
  });

  return (
    <ConditionalLayout isAuthenticated={isAuthenticated}>
      <main
        className="igl-page"
        style={{
          padding: 0,
        }}
      >
        <div
          className="igl-container"
          style={{
            padding: "24px",
          }}
        >
          {/* Header halaman */}
          <section className="igl-header">
            <h1>📊 Infografis Laporan Masyarakat</h1>

            <p>
              Statistik dan visualisasi data laporan dari masyarakat Kota Batam
            </p>
          </section>

          {/* Ringkasan statistik */}
          <section
            className="igl-summary-grid"
            aria-label="Ringkasan statistik laporan"
          >
            <div className="igl-summary-card">
              <div className="igl-summary-label">Total Laporan</div>

              <div className="igl-summary-value">
                {Number(data.total ?? 0)}
              </div>
            </div>

            <div className="igl-summary-card">
              <div className="igl-summary-label">Pending</div>

              <div className="igl-summary-value">
                {Number(data.status?.pending ?? 0)}
              </div>
            </div>

            <div className="igl-summary-card">
              <div className="igl-summary-label">Diproses</div>

              <div className="igl-summary-value">
                {Number(data.status?.diproses ?? 0)}
              </div>
            </div>

            <div className="igl-summary-card">
              <div className="igl-summary-label">Selesai</div>

              <div className="igl-summary-value">
                {Number(data.status?.selesai ?? 0)}
              </div>
            </div>
          </section>

          {/* Grafik status dan kategori */}
          <section className="igl-charts-grid">
            {/* Grafik status */}
            <article className="igl-chart-card">
              <div className="igl-chart-title">
                Breakdown Status Laporan
              </div>

              <div className="igl-chart-container">
                {statusData.length === 0 ? (
                  <div className="igl-empty-chart">
                    Belum ada data status laporan
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {statusData.map((item, index) => (
                          <Cell
                            key={`status-${item.name}-${index}`}
                            fill={
                              DONUT_COLORS[
                                index % DONUT_COLORS.length
                              ]
                            }
                          />
                        ))}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          color: "#334155",
                          fontSize: 12,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>

            {/* Grafik kategori */}
            <article className="igl-chart-card">
              <div className="igl-chart-title">
                Laporan per Kategori
              </div>

              <div className="igl-chart-container">
                {kategoriData.length === 0 ? (
                  <div className="igl-empty-chart">
                    Belum ada data kategori laporan
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={kategoriData}
                      layout="vertical"
                      margin={{
                        top: 5,
                        right: 15,
                        left: 5,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        stroke="#64748b"
                        fontSize={11}
                      />

                      <YAxis
                        dataKey="name"
                        type="category"
                        width={110}
                        stroke="#64748b"
                        fontSize={11}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          color: "#334155",
                          fontSize: 12,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        }}
                      />

                      <Bar
                        dataKey="jumlah"
                        fill="#0ea5e9"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </article>
          </section>

          {/* Grafik kecamatan */}
          {kecamatanData.length > 0 && (
            <section className="igl-chart-full">
              <div className="igl-chart-title">
                Sebaran Laporan per Kecamatan
              </div>

              <div className="igl-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={kecamatanData}
                    margin={{
                      top: 5,
                      right: 15,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                      angle={-30}
                      textAnchor="end"
                      height={70}
                      interval={0}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#64748b"
                      fontSize={11}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        color: "#334155",
                        fontSize: 12,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    />

                    <Bar
                      dataKey="jumlah"
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    >
                      {kecamatanData.map((item, index) => (
                        <Cell
                          key={`kecamatan-${item.name}-${index}`}
                          fill={
                            BAR_COLORS[index % BAR_COLORS.length]
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Grafik per bulan */}
          {bulanData.length > 0 && (
            <section className="igl-chart-full">
              <div className="igl-chart-title">
                Tren Laporan per Bulan
              </div>

              <div className="igl-chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bulanData}
                    margin={{
                      top: 5,
                      right: 15,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={11}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#64748b"
                      fontSize={11}
                    />

                    <Tooltip
                      contentStyle={{
                        background: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        color: "#334155",
                        fontSize: 12,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      }}
                    />

                    <Bar
                      dataKey="jumlah"
                      fill="#38bdf8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      </main>
    </ConditionalLayout>
  );
}