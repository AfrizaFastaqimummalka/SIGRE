"use client";

import React from "react";
import Link from "next/link";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navbar / Header */}
      <header className="landing-header">
        <div className="landing-container header-container">
          <div className="landing-brand">
            <img 
              src="/image/logo-bp-batam.png" 
              alt="BP Batam Logo" 
              className="landing-logo-img"
            />
            <div className="landing-brand-text">
              <span className="brand-title">SigRe</span>
              <span className="brand-subtitle">Sistem Informasi Geografis Reklame</span>
            </div>
          </div>
          <div className="landing-nav">
            <a href="https://bpbatam.go.id" target="_blank" rel="noreferrer" className="nav-link">Portal BP Batam</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-hero">
        <div className="landing-container">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Kota Batam — Provinsi Kepulauan Riau
          </div>
          <h1 className="hero-title">
            Sistem Informasi <br/>
            <span className="hero-highlight">Geografis Reklame</span>
          </h1>
          <p className="hero-description">
            Platform terpadu resmi dari BP Batam untuk pengelolaan data aset reklame, pengawasan perizinan, dan pelayanan pelaporan masyarakat secara transparan dan akuntabel.
          </p>

          <div className="hero-cards">
            {/* Card Admin */}
            <div className="action-card">
              <div className="card-icon blue-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3>Portal Admin</h3>
              <p>Kelola titik koordinat, perizinan reklame, dan pantau statistik data spasial.</p>
              <Link href="/login" className="card-btn btn-blue">
                Masuk Sistem →
              </Link>
            </div>

            {/* Card Laporan Warga */}
            <div className="action-card">
              <div className="card-icon green-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3>Layanan Masyarakat</h3>
              <p>Sampaikan laporan terkait reklame ilegal, rusak, atau melanggar aturan zonasi.</p>
              <Link href="/laporan-masyarakat" className="card-btn btn-green">
                Buat Laporan →
              </Link>
            </div>
            
            {/* Card Infografis */}
            <div className="action-card">
              <div className="card-icon yellow-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <h3>Data & Statistik</h3>
              <p>Akses infografis transparansi data laporan masyarakat Kota Batam.</p>
              <Link href="/infografis-laporan" className="card-btn btn-yellow">
                Lihat Infografis →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <p>&copy; {new Date().getFullYear()} Badan Pengusahaan Batam (BP Batam). Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
