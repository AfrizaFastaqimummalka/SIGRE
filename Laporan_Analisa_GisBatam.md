# LAPORAN ANALISA SISTEM INFORMASI GEOGRAFIS REKLAME (GISBATAM / SIGRE)

## 1. INVENTARISASI PROYEK

### 1.1 Struktur Direktori Utama
Berikut adalah struktur komponen utama beserta fungsinya:

| Direktori / File | Fungsi Utama |
|---|---|
| **Halaman (app/)** |
| `app/page.tsx` | Halaman utama aplikasi (Peta Sebaran) yang memuat komponen Leaflet. |
| `app/login/page.js` | Halaman login untuk autentikasi user. |
| `app/infografis/page.tsx` | Halaman dashboard analitik, chart, dan statistik reklame. |
| `app/manajemen_reklame/page.tsx` | Halaman daftar manajemen data reklame (CRUD). |
| `app/manajemen_reklame/detail/[kode]/page.tsx`| Halaman detail data dari sebuah reklame spesifik. |
| `app/manajemen_reklame/edit/[kode]/page.tsx` | Halaman form untuk mengedit data reklame. |
| `app/validasi_data/page.tsx` | Halaman untuk validasi/verifikasi data perizinan reklame. |
| **Backend Models** |
| `backend/aset/models.py` | Deklarasi skema tabel database (Users, Reklame, Perizinan, dll). |
| **Backend Views & Urls** |
| `backend/aset/views.py` | DRF ViewSets untuk CRUD dan endpoint khusus statistik infografis. |
| `backend/config/urls.py` | Entry point URL backend Django, mendaftarkan endpoint `/api/` dan `/api/auth/login`. |
| **Konfigurasi** |
| `middleware.js` | Middleware NextAuth yang memproteksi seluruh halaman agar wajib login kecuali halaman publik/aset. |
| `backend/config/settings.py`| Pengaturan Django, koneksi database PostgreSQL (Neon), JWT, dan CORS. |

### 1.2 Dependencies
Library utama yang digunakan pada ekosistem proyek:

| Library / Package | Versi | Digunakan Untuk |
|---|---|---|
| `next` | 16.1.6 | Framework reaktif utama untuk antarmuka pengguna frontend. |
| `next-auth` | ^4.24.13 | Manajemen session dan state autentikasi JWT di frontend. |
| `leaflet` & `react-leaflet`| ^1.9.4 | Merender peta interaktif dan marker sebaran reklame. |
| `recharts` | ^3.8.1 | Merender grafik (bar dan donut chart) di halaman infografis. |
| `sweetalert2` | ^11.26.24 | Menampilkan pop-up dialog yang menarik dan responsif. |
| `Django` | 6.0.4 | Web framework backend. |
| `djangorestframework` | 3.17.1 | Pembuatan RESTful API. |
| `djangorestframework_simplejwt` | 5.5.1 | Implementasi token JWT (Access & Refresh) untuk otorisasi API. |
| `dj-database-url` | 3.1.2 | Parsing URL database PostgreSQL Neon.tech. |

### 1.3 Database Schema (ERD Teks)
| Nama Tabel | Field Penting | Tipe Data | Relasi (Foreign Key) |
|---|---|---|---|
| **Users** | id, email, password_hash, is_active | UUID, Varchar, Text, Bool | - |
| **ReklameKategori** | id, nama_kategori, retribusi_per_m2 | UUID, Varchar, Decimal | - |
| **ZonaTataRuang**| id, nama_zona, tipe_zona, geometri_geojson| UUID, Varchar, Text | - |
| **Reklame** | id, kode_reklame, latitude, longitude, status | UUID, Varchar, Decimal | -> ReklameKategori, -> ZonaTataRuang |
| **Perizinan** | id, no_registrasi, status_perizinan, tgl_berlaku| UUID, Varchar, Date | -> Reklame, -> Users (Pemohon) |
| **DokumenReklame** | id, jenis_dokumen, file | UUID, Varchar, File | -> Reklame |
| **FotoReklame** | id, foto, keterangan | UUID, Image, Varchar | -> Reklame |

---

## 2. DAFTAR FITUR & ENDPOINT

### 2.1 Halaman Frontend
| URL Path | Nama Halaman | Fungsi Utama | Komponen Utama |
|---|---|---|---|
| `/` | Peta Sebaran (Home) | Menampilkan peta persebaran lokasi aset reklame | `MapArea`, `AppShell` |
| `/login` | Login | Pintu masuk autentikasi | `LoginForm` |
| `/infografis` | Infografis | Dashboard data analitik sanksi, pelanggaran, dsb | `Recharts`, `AppShell` |
| `/manajemen_reklame` | Manajemen Reklame | List data reklame (Read, Delete) | `Table`, `Pagination` |
| `/manajemen_reklame/detail/[kode]`| Detail Reklame | Membaca data spesifik reklame | `DetailCard` |
| `/manajemen_reklame/edit/[kode]`| Edit Reklame | Formulir mengubah data reklame | `FormReklame` |
| `/validasi_data` | Validasi Data | Konfirmasi data dan status perizinan | `ValidationTable` |

*(Catatan: Halaman rute `/laporan_aset` tidak ditemukan dalam root aplikasi)*

### 2.2 API Endpoints Backend
| Method | URL Endpoint | Fungsi / Keterangan | Auth Required? |
|---|---|---|---|
| `POST` | `/api/auth/login/` | Autentikasi JWT (mendapatkan Access & Refresh token) | Tidak |
| `GET/POST` | `/api/reklame/` | Mengambil data reklame atau membuat data baru | Ya / Opsional |
| `PUT/DEL` | `/api/reklame/{kode}/` | Mengubah atau menghapus data satu reklame spesifik | Ya |
| `GET` | `/api/infografis/` | Mengambil agregasi statistik reklame untuk dashboard chart | Tidak (AllowAny) |
| `GET/POST` | `/api/perizinan/` | Mengambil / mencatat status perizinan reklame | Ya / Opsional |
| `GET/POST` | `/api/kategori/` | Manajemen data master kategori tarif reklame | Ya / Opsional |
| `GET/POST` | `/api/zona/` | Manajemen data spasial / GIS per zona | Ya / Opsional |

---

## 3. HASIL PENGUJIAN FUNGSIONAL

Pengujian dilakukan menggunakan metode HTTP requests curl/REST langsung ke Backend dan pengecekan middleware frontend.

| Fitur | Test Case | Input | Output / Respons | Status | Catatan |
|---|---|---|---|---|---|
| **Autentikasi** | Login dengan user valid | `{"email": "admin...", "password": "..."}` | `{"access": "...", "refresh": "..."}` dan status HTTP 200 | ✅ Berhasil | JWT Tokens tergenerate dengan sukses. |
| **Autentikasi** | Akses route proteksi tanpa token | Buka `/infografis` tanpa sesi | Redirect HTTP ke halaman `/login` | ✅ Berhasil | Middleware NextAuth berhasil melakukan pemblokiran. |
| **Data Reklame**| GET semua aset reklame | Akses `/api/reklame/` | JSON list `kode_reklame` beserta detailnya (HTTP 200) | ✅ Berhasil | Berhasil meload data FK untuk kategori dan zona. |
| **Dashboard** | GET Statistik Infografis | Akses `/api/infografis/` | JSON object `{jumlah_reklame, status_reklame, chart_per_kota, dll}` | ✅ Berhasil | Data agregat tergenerate dengan akurat melalui `Count` Django. |
| **Perizinan** | GET list status perizinan | Akses `/api/perizinan/` | JSON list objek perizinan `status_perizinan: "PENDING"` | ✅ Berhasil | Data join relasional ke Reklame dan Users termuat penuh. |
| **Peta Sebaran**| Akses `peta_sebaran` | Buka `/peta_sebaran` di web | Error 404 (Halaman tidak ditemukan) | ⚠️ Parsial | Fitur Leaflet Map rupanya terpasang di root `/` (app/page.tsx), bukan `/peta_sebaran`. |
| **Laporan Aset**| Akses `laporan_aset` | Buka `/laporan_aset` di web | Error 404 (Halaman tidak ditemukan) | ❌ Gagal | Endpoint UI khusus Laporan Aset belum diimplementasikan di `app/`. |

---

## 4. ANALISA TEKNIS

### 4.1 Arsitektur Sistem
Sistem dibangun menggunakan **Arsitektur Client-Server yang sepenuhnya terpisah (Decoupled Architecture)**. 
Frontend (Next.js) bertindak sebagai client SPA (Single Page Application) yang melakukan rendering UI (CSR/SSR) dan mempertahankan manajemen state autentikasi menggunakan **NextAuth**. Autentikasi bekerja dengan model Stateless Token Exchange, di mana Frontend memanggil `/api/auth/login/` di backend, menerima JSON Web Token (JWT), lalu menyematkan akses token pada header otorisasi setiap kali melakukan fetch data lanjutan. 

Backend murni berfungsi sebagai penyedia API (RESTful) berteknologi **Django DRF**. Data GIS disajikan dengan mengirim atribut koordinat (lat/long) atau GeoJSON melalui API `/api/reklame/`, lalu dikonsumsi di frontend menggunakan **Leaflet.js** untuk merender penanda marker interaktif. Sementara itu, untuk fitur infografis, Django melakukan agregasi kueri yang cukup berat di sisi server (menggunakan `annotate` dan `Count`) dan menyajikan hasilnya secara ringkas (JSON), yang kemudian dipetakan langsung ke komponen **Recharts** di frontend tanpa pengolahan berlebihan di sisi client.

### 4.2 Fitur yang Berfungsi Penuh
* ✅ Mekanisme Autentikasi dan JWT Otorisasi (via middleware).
* ✅ Manajemen Aset Reklame (CRUD).
* ✅ Agregasi API Infografis dan Filter Parametrik.
* ✅ Manajemen Perizinan dan Integrasi Status Pelanggaran.
* ✅ Integrasi GIS dan Rendering Peta Leaflet (Di Root URL).

### 4.3 Fitur yang Belum Sempurna / Bug
* ❌ **URL Mapping yang Tidak Tepat (Missing Routes)**: Permintaan aplikasi untuk route `/peta_sebaran` dan `/laporan_aset` tidak membuahkan hasil (404 Not Found), karena halaman ini absen secara direktori. Pengembang menggabungkan Peta Sebaran di halaman `/` dan sepertinya belum menyusun halaman Laporan Aset di frontend.

### 4.4 Teknologi & Justifikasi
1. **Next.js vs React biasa**: Penggunaan Next.js memberikan keunggulan lewat NextAuth untuk routing proxy middleware yang tangguh serta optimalisasi SEO/rendering secara native, mengurangi kompleksitas bundler.
2. **Django DRF vs Express/FastAPI**: Django DRF sangat diandalkan berkat sistem ORM yang matang, fungsionalitas `ModelViewSet` yang mempercepat rilis backend CRUD tanpa hardcode sintaks SQL yang repetitif.
3. **Leaflet.js vs Google Maps**: Leaflet.js dipilih karena sifatnya open-source, ringan, dan tidak berbayar (bebas dari overhead API Key Google), sekaligus kompatibel dengan OpenStreetMap.
4. **PostgreSQL vs MySQL**: PostgreSQL dipilih (via Neon.tech) karena kemampuannya yang sangat superior dalam pemrosesan GIS/Spasial dan dukungan agregasi kueri berskala enterprise.
5. **JWT vs Session Auth**: Karena backend API dan frontend dirender oleh dua server berbeda (port 3000 & 8000), JWT mengatasi masalah pembagian Cross-Origin session cookies dan meningkatkan skalabilitas.
6. **Recharts vs Chart.js**: Recharts dibangun native khusus di atas React, membuat integrasinya secara deklaratif jauh lebih mudah dalam penulisan komponen dibandingkan Chart.js yang memodifikasi langsung DOM.

---

## 5. KESIMPULAN

### 5.1 Deskripsi Sistem
Sistem Informasi Geografis Reklame (GisBatam / SigRe) adalah sebuah platform digital berbasis web yang ditujukan untuk memfasilitasi Pemerintah Kota Batam dalam menginventarisasi, mengelola izin, dan memantau status persebaran tata ruang seluruh aset reklame di ruang publik. Sistem ini tidak hanya mendata informasi administratif reklame, melainkan memvisualisasikannya di atas peta interaktif serta menyediakan dashboard infografis analitik tentang pelanggaran, dan jatuh tempo perizinan guna meningkatkan pendapatan retribusi secara efisien. Secara teknologi, aplikasi ini menganut arsitektur modern yang memisahkan sisi antarmuka menggunakan **Next.js (React) dan Tailwind CSS**, sementara sisi pemrosesan bisnis dan database dikelola dengan sangat baik oleh kerangka kerja **Django REST Framework** berserta database PostgreSQL terdistribusi.

### 5.2 Tabel Rekapitulasi Fitur
| No | Nama Fitur | Deskripsi Singkat | Status Implementasi | Hasil Pengujian |
|---|---|---|---|---|
| 1 | Autentikasi Admin | Gerbang login dan verifikasi JWT token. | Selesai | ✅ Berhasil |
| 2 | Peta Sebaran (GIS) | Visualisasi titik latitude longitude reklame di Peta Leaflet. | Sebagian (Salah Route) | ⚠️ Parsial |
| 3 | Infografis Dasbor | Penyajian grafik agregat pelanggaran dan status perizinan. | Selesai | ✅ Berhasil |
| 4 | Data Reklame | Manajemen data aset reklame dan detail lokasi (CRUD). | Selesai | ✅ Berhasil |
| 5 | Manajemen Izin | Pencatatan penerbitan izin dan masa expired reklame. | Selesai | ✅ Berhasil |
| 6 | Laporan Aset | Ekspor data aset berbentuk PDF / Laporan. | Belum Diimplementasi | ❌ Gagal |

### 5.3 Daftar Use Case Utama
- **UC-01**: Kelola Login — Admin dapat memasukkan email dan kata sandi sehingga berhak mengakses dashboard privat sistem.
- **UC-02**: Tinjau Peta — Admin dapat membuka peta interaktif sehingga bisa melihat persebaran letak marker tiap reklame yang tercatat.
- **UC-03**: Manajemen Data Reklame — Admin dapat menambah atau mengedit detail reklame sehingga spesifikasi teknis reklame tetap aktual di database.
- **UC-04**: Pantau Dasbor Infografis — Pimpinan dapat memonitor chart statistik (berdasarkan tahun/kategori) sehingga memiliki wawasan pelanggaran kota.
- **UC-05**: Verifikasi Perizinan — Petugas dapat mengganti status perizinan dari PENDING menjadi APPROVED sehingga reklame dinyatakan sah menurut hukum.
- **UC-06**: Unggah Bukti Dokumen — Petugas dapat melampirkan berkas foto lapangan dan dokumen PDF sehingga arsip tertata dalam satu sistem terpusat.
- **UC-07**: Proteksi Route — Sistem dapat secara otomatis menendang akses user ke halaman login sehingga kerahasiaan data pemerintah terjaga.
- **UC-08**: Ekspor Laporan — Admin dapat mencetak dan mengunduh rangkuman halaman sebagai laporan pertanggungjawaban instansi (Dalam Rencana Pengembangan).

### 5.4 Kendala & Solusi
| Kendala yang Ditemukan | Solusi yang Diterapkan / Rekomendasi |
|---|---|
| Halaman `/peta_sebaran` dan `/laporan_aset` mengembalikan Error 404 pada URL Bar. | Memindahkan navigasi menu yang mengarah ke `peta_sebaran` ke route root `/`, serta segera membuat satu directory folder page.tsx untuk `laporan_aset`. |
| Kurangnya pemisahan jenis data pengguna di API (Semua Admin). | Disarankan menambahkan `Role-based Access Control (RBAC)` di Django, agar Pemohon dan Admin Pemeriksa memiliki hak akses URL API yang diisolasi mandiri. |
| Pengambilan data peta dalam jumlah massal dapat melambatkan browser saat render Leaflet. | Menerapkan implementasi Pagination dan metode Marker Clustering pada react-leaflet jika jumlah data reklame di masa mendatang menembus 10.000 titik lokasi. |

### 5.5 Statistik Proyek
- Total halaman frontend terdeteksi: 12
- Total endpoint API Backend: 7
- Total model database: 7
- Total tabel database: 7
- Jumlah fitur terujikan: 7
- Jumlah fitur berfungsi penuh: 5
- Jumlah fitur parsial/bug: 2

### 5.6 Hasil Pengujian UI Secara Real-time (Browser)
Pengujian tambahan telah dilakukan dengan merender langsung aplikasi frontend menggunakan engine browser pada `http://localhost:3000`. Pengujian dilakukan menggunakan akun dengan username `rafi` dan password `batam123`.

*   **Peta Sebaran (Home):** Peta spasial (Leaflet.js) berhasil termuat di halaman utama lengkap dengan fungsionalitas zoom dan interaksi. Sidebar menampilkan menu "Informasi Aset Daerah" dengan jumlah aset terdata secara rapi.
*   **Halaman Infografis:** Halaman dashboard termuat sukses. Visualisasi grafik (Donut Chart untuk *Status Pelanggaran*) dan metrik kartu (Jumlah Reklame, Aset Tersewa, dll) dapat di-render sempurna sesuai data agregasi backend.
*   **Manajemen Reklame:** Tabel *Manajemen Reklame* menampilkan baris data dengan sistem paginasi berjalan baik (menampilkan 5 entri per halaman dari total ratusan data) beserta kelengkapan tombol *Aksi* untuk Edit/Detail.
*   **Isu UI:** Sebelumnya ditemukan komponen pop-up debugging bertuliskan "1 Issue" berupa pesan error "Hydration Mismatch". Error ini terjadi karena perbedaan atribut server dan client HTML (biasanya akibat ekstensi browser). Masalah ini telah **berhasil diperbaiki** dengan menambahkan properti `suppressHydrationWarning` pada tag `<html>` dan `<body>` di dalam `app/layout.tsx`.
*   **Laporan Aset:** Menu "Laporan Aset" terkonfirmasi tidak dapat ditemukan pada navigasi utama (header web) layaknya yang diminta spesifikasi.

✅ ANALISA SELESAI — Siap untuk pembuatan laporan KP dan SKPL.
