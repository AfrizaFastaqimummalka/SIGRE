"use client";

export type ReklamePrintRow = {
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
  kabupaten_kota: string | null;
  pengguna: string | null;
  kuasa_pengguna: string | null;
  tipe_zona: string | null;
};

export type PrintFilterItem = {
  label: string;
  value: string;
};

function formatTanggal(value: string | null | undefined) {
  if (!value) return "-";

  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatTanggalCetak(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(value);
}

export default function ReklamePrintReport({
  data,
  filters,
  generatedAt,
}: {
  data: ReklamePrintRow[];
  filters: PrintFilterItem[];
  generatedAt: Date;
}) {
  const isFiltered = filters.length > 0;

  return (
    <div className="reklame-print-document">
      {/* KOP SURAT */}
      <header className="print-letterhead">
        <div className="print-logo-box">
          <span className="print-logo-fallback">BP Batam</span>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/image/logo-bp-batam.png"
            alt="Logo BP Batam"
            className="print-logo-image"
            onLoad={(event) => {
              const fallback =
                event.currentTarget.previousElementSibling as HTMLElement | null;

              if (fallback) {
                fallback.style.display = "none";
              }
            }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="print-company-identity">
          <div className="print-company-name">
            BP Batam: Badan Pengusahaan Batam
          </div>

          <div className="print-company-field">
            Pengelola Kawasan Perdagangan Bebas dan Pelabuhan Bebas Batam
          </div>

          <div>
            Head Office: Jalan Ibnu Sutowo No. 1 Batam Centre, Pulau Batam, Kepulauan Riau | Telepon: (+62) 778 – 462 047
          </div>

          <div>
            Email: humas@bpbatam.go.id | Website: https://bpbatam.go.id/
          </div>
        </div>
      </header>

      <div className="print-letterhead-line" />

      {/* JUDUL LAPORAN */}
      <section className="print-report-heading">
        <h1>LAPORAN DATA REKLAME</h1>

        <p>
          Sistem Informasi Geografis Reklame Kota Batam (SigRe)
        </p>
      </section>

      {/* INFORMASI LAPORAN */}
      <section className="print-report-meta">
        <div>
          <span>Tanggal Cetak</span>
          <strong>
            {formatTanggalCetak(generatedAt)} WIB
          </strong>
        </div>

        <div>
          <span>Cakupan Data</span>
          <strong>
            {isFiltered
              ? "Hasil pencarian/filter aktif"
              : "Semua data reklame"}
          </strong>
        </div>

        <div>
          <span>Jumlah Data</span>
          <strong>{data.length} data</strong>
        </div>
      </section>

      {/* INFORMASI FILTER */}
      {isFiltered && (
        <section className="print-filter-summary">
          <div className="print-filter-title">
            Parameter pencarian/filter:
          </div>

          <div className="print-filter-list">
            {filters.map((item) => (
              <span key={`${item.label}-${item.value}`}>
                <b>{item.label}:</b> {item.value}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* TABEL LAPORAN */}
      <table className="print-reklame-table">
        <thead>
          <tr>
            <th>No.</th>
            <th>Kode Reklame</th>
            <th>Nama Pemilik</th>
            <th>NIK/NPWP</th>
            <th>Kabupaten/Kota</th>
            <th>Pengguna</th>
            <th>Kuasa Pengguna</th>
            <th>Tipe Zona</th>
            <th>Koordinat</th>
            <th>Luas (m²)</th>
            <th>Tinggi (m)</th>
            <th>Status</th>
            <th>Tanggal Pasang</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || row.kode_reklame}>
              <td>{index + 1}</td>
              <td>{row.kode_reklame || "-"}</td>
              <td>{row.nama_pemilik || "-"}</td>
              <td>{row.nik_npwp || "-"}</td>
              <td>{row.kabupaten_kota || "-"}</td>
              <td>{row.pengguna || "-"}</td>
              <td>{row.kuasa_pengguna || "-"}</td>
              <td>{row.tipe_zona || "-"}</td>

              <td>
                {row.latitude && row.longitude
                  ? `${row.latitude}, ${row.longitude}`
                  : "-"}
              </td>

              <td>{row.luas_m2 || "-"}</td>
              <td>{row.tinggi_m || "-"}</td>
              <td>{row.status_reklame || "-"}</td>
              <td>{formatTanggal(row.tanggal_pasang)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className="print-report-footer">
        Dokumen ini dicetak dari Sistem Informasi Geografis Reklame
        Kota Batam (SigRe).
      </footer>
    </div>
  );
}