"use client";

import React from "react";

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    background: "#f5f7fb",
    padding: 24,
    fontFamily: "sans-serif",
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: 600,
  },

  searchBox: {
    display: "flex",
    gap: 10,
  },

  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: 260,
  },

  btnPrimary: {
    background: "#1a8fe3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    padding: 10,
    borderBottom: "2px solid #eee",
    whiteSpace: "nowrap",
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #eee",
    fontSize: 13,
    textAlign: "center",
  },

  emptyBox: {
    textAlign: "center",
    padding: "60px 0",
    color: "#6b7280",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  pagination: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },

  pager: {
    display: "flex",
    gap: 6,
  },

  pageBtn: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
    background: "#fff",
  },

  activePage: {
    background: "#1a8fe3",
    color: "#fff",
    border: "1px solid #1a8fe3",
  },

  download: {
    color: "#1a8fe3",
    cursor: "pointer",
    fontWeight: 500,
  },

  kondisi: {
    color: "#16a34a",
    fontWeight: 500,
  },

  aksi: {
    fontSize: 18,
    cursor: "pointer",
  },
};

export default function Page() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.title}>Validasi Data</div>

          <div style={styles.searchBox}>
            <input
              placeholder="Cari Berdasarkan Nama Pemilik"
              style={styles.input}
            />
            <button style={styles.btnPrimary}>Download CSV</button>
          </div>
        </div>

        {/* TAB */}
        <button style={{ ...styles.btnPrimary, marginBottom: 12 }}>
          Aset Reklame
        </button>

        {/* TABLE */}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nama Simpang</th>
              <th style={styles.th}>Alamat</th>
              <th style={styles.th}>Kabupaten/Kota</th>
              <th style={styles.th}>Nama Pemilik</th>
              <th style={styles.th}>Tanggal Pasang</th>
              <th style={styles.th}>Wilayah</th>
              <th style={styles.th}>Long/Lat</th>
              <th style={styles.th}>Status Perizinan</th>
              <th style={styles.th}>Tanggal Berakhir</th>
              <th style={styles.th}>Dokumen Perizinan</th>
              <th style={styles.th}>Kondisi</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td colSpan={13}>
                <div style={styles.emptyBox}>
                  <div style={styles.emptyIcon}>⚠️</div>
                  <div style={{ fontWeight: 600 }}>
                    Data Tidak Ditemukan
                  </div>
                  <div style={{ fontSize: 12 }}>
                    Silahkan masukkan data terlebih dahulu
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={styles.pagination}>
          <div>Menampilkan 5 dari 20 data</div>

          <div style={styles.pager}>
            {[1, 2, 3].map((p) => (
              <div
                key={p}
                style={
                  p === 2
                    ? { ...styles.pageBtn, ...styles.activePage }
                    : styles.pageBtn
                }
              >
                {p}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}