'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import "../styles/header.css";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";

/* ── SVG Icons ── */
const LogoIcon = () => (
              <svg width="90" height="29" viewBox="0 0 90 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.9717 7.20703H14.5898C10.5125 7.20703 7.20703 10.5125 7.20703 14.5898C7.2072 18.6082 10.4181 21.8734 14.4141 21.9668V29.001C6.44564 28.9537 0.000204902 22.4815 0 14.502C0 6.49295 6.49295 0 14.502 0H21.9717V7.20703Z" fill="#2131C5"/>
                <path d="M21.9721 15.437C21.972 19.0461 19.046 21.9722 15.437 21.9722C15.0888 21.9722 14.747 21.9426 14.4135 21.8901V14.4136H21.9721V15.437Z" fill="#F0BE1D"/>
                <path d="M43.1269 11.1383C43.0701 10.5654 42.8263 10.1203 42.3954 9.80304C41.9645 9.48581 41.3798 9.32719 40.6411 9.32719C40.1392 9.32719 39.7155 9.39821 39.3698 9.54026C39.0242 9.67757 38.759 9.86933 38.5744 10.1155C38.3945 10.3618 38.3045 10.6411 38.3045 10.9536C38.295 11.214 38.3495 11.4413 38.4678 11.6354C38.591 11.8296 38.759 11.9976 38.9721 12.1397C39.1852 12.277 39.4314 12.3977 39.7107 12.5019C39.9901 12.6013 40.2884 12.6866 40.6056 12.7576L41.9124 13.0701C42.5469 13.2121 43.1293 13.4015 43.6596 13.6383C44.1899 13.875 44.6492 14.1662 45.0374 14.5119C45.4257 14.8575 45.7264 15.2647 45.9394 15.7334C46.1572 16.2022 46.2685 16.7396 46.2732 17.3457C46.2685 18.2358 46.0412 19.0076 45.5914 19.661C45.1463 20.3097 44.5024 20.8139 43.6596 21.1738C42.8215 21.5289 41.8106 21.7065 40.6269 21.7065C39.4527 21.7065 38.43 21.5265 37.5588 21.1667C36.6923 20.8068 36.0152 20.2742 35.5275 19.5687C35.0446 18.8584 34.7912 17.9801 34.7676 16.9337H37.7434C37.7766 17.4214 37.9162 17.8286 38.1624 18.1553C38.4134 18.4773 38.7472 18.7211 39.1639 18.8869C39.5853 19.0478 40.0611 19.1283 40.5914 19.1283C41.1123 19.1283 41.5644 19.0526 41.948 18.9011C42.3362 18.7495 42.6369 18.5388 42.8499 18.269C43.063 17.9991 43.1696 17.6889 43.1696 17.3386C43.1696 17.0119 43.0725 16.7372 42.8784 16.5147C42.689 16.2922 42.4096 16.1028 42.0403 15.9465C41.6757 15.7903 41.2283 15.6482 40.698 15.5204L39.1142 15.1226C37.8878 14.8244 36.9196 14.358 36.2093 13.7235C35.4991 13.089 35.1463 12.2344 35.1511 11.1596C35.1463 10.2789 35.3807 9.50948 35.8542 8.85134C36.3324 8.1932 36.9882 7.67947 37.8215 7.31015C38.6549 6.94083 39.6018 6.75617 40.6624 6.75617C41.742 6.75617 42.6842 6.94083 43.4892 7.31015C44.2988 7.67947 44.9285 8.1932 45.3784 8.85134C45.8282 9.50948 46.0602 10.2718 46.0744 11.1383H43.1269ZM48.285 21.5005V10.5914H51.3105V21.5005H48.285ZM49.8048 9.18515C49.355 9.18515 48.9691 9.036 48.6472 8.7377C48.3299 8.43467 48.1713 8.07246 48.1713 7.65106C48.1713 7.23439 48.3299 6.87691 48.6472 6.57861C48.9691 6.27558 49.355 6.12407 49.8048 6.12407C50.2547 6.12407 50.6382 6.27558 50.9554 6.57861C51.2774 6.87691 51.4384 7.23439 51.4384 7.65106C51.4384 8.07246 51.2774 8.43467 50.9554 8.7377C50.6382 9.036 50.2547 9.18515 49.8048 9.18515ZM58.649 25.8187C57.6688 25.8187 56.8284 25.6837 56.1276 25.4138C55.4316 25.1487 54.8776 24.7865 54.4657 24.3272C54.0538 23.8679 53.7863 23.3518 53.6632 22.7789L56.4615 22.4025C56.5467 22.6203 56.6816 22.8239 56.8663 23.0133C57.0509 23.2027 57.2948 23.3542 57.5978 23.4678C57.9056 23.5862 58.2796 23.6454 58.72 23.6454C59.3781 23.6454 59.9203 23.4844 60.3464 23.1624C60.7773 22.8452 60.9927 22.3125 60.9927 21.5644V19.5687H60.8649C60.7323 19.8717 60.5334 20.1582 60.2683 20.428C60.0031 20.6979 59.6622 20.9181 59.2455 21.0886C58.8289 21.259 58.3317 21.3442 57.7541 21.3442C56.9349 21.3442 56.1892 21.1548 55.5169 20.7761C54.8492 20.3925 54.3166 19.8078 53.9188 19.0218C53.5258 18.2311 53.3294 17.232 53.3294 16.0246C53.3294 14.7888 53.5306 13.7566 53.933 12.928C54.3355 12.0994 54.8705 11.4792 55.5382 11.0672C56.2105 10.6553 56.9468 10.4494 57.747 10.4494C58.3578 10.4494 58.8691 10.5535 59.2811 10.7619C59.693 10.9655 60.0244 11.2211 60.2754 11.5289C60.5311 11.8319 60.7276 12.1302 60.8649 12.4238H60.9785V10.5914H63.9828V21.607C63.9828 22.5351 63.7555 23.3116 63.3009 23.9366C62.8464 24.5616 62.2167 25.0303 61.4117 25.3428C60.6115 25.6601 59.6906 25.8187 58.649 25.8187ZM58.7129 19.0715C59.2006 19.0715 59.6125 18.9508 59.9487 18.7093C60.2896 18.4631 60.55 18.1127 60.7299 17.6582C60.9146 17.1989 61.0069 16.6496 61.0069 16.0104C61.0069 15.3712 60.9169 14.8172 60.737 14.3485C60.5571 13.875 60.2967 13.5081 59.9558 13.2476C59.6149 12.9872 59.2006 12.857 58.7129 12.857C58.2157 12.857 57.7967 12.992 57.4558 13.2619C57.1149 13.527 56.8568 13.8963 56.6816 14.3698C56.5064 14.8433 56.4188 15.3902 56.4188 16.0104C56.4188 16.6402 56.5064 17.1847 56.6816 17.644C56.8615 18.0985 57.1196 18.4512 57.4558 18.7022C57.7967 18.9484 58.2157 19.0715 58.7129 19.0715ZM66.4472 21.5005V6.95503H72.1859C73.2844 6.95503 74.2219 7.15153 74.9984 7.54452C75.7796 7.93278 76.3739 8.48439 76.7811 9.19935C77.193 9.90958 77.399 10.7453 77.399 11.7065C77.399 12.6724 77.1906 13.5033 76.774 14.1994C76.3573 14.8906 75.7536 15.4209 74.9629 15.7903C74.1769 16.1596 73.2252 16.3442 72.1078 16.3442H68.2654V13.8726H71.6106C72.1977 13.8726 72.6854 13.7922 73.0737 13.6312C73.4619 13.4702 73.7508 13.2287 73.9401 12.9067C74.1343 12.5848 74.2313 12.1847 74.2313 11.7065C74.2313 11.2235 74.1343 10.8163 73.9401 10.4849C73.7508 10.1534 73.4596 9.90248 73.0666 9.73202C72.6783 9.55683 72.1883 9.46924 71.5964 9.46924H69.5225V21.5005H66.4472ZM74.3024 14.8812L77.9174 21.5005H74.5225L70.9856 14.8812H74.3024ZM84.3112 21.7136C83.1891 21.7136 82.2232 21.4863 81.4135 21.0317C80.6086 20.5725 79.9883 19.9238 79.5527 19.0857C79.1171 18.2429 78.8993 17.2462 78.8993 16.0957C78.8993 14.9735 79.1171 13.9887 79.5527 13.1411C79.9883 12.2936 80.6015 11.6331 81.3922 11.1596C82.1877 10.6861 83.1204 10.4494 84.1905 10.4494C84.9102 10.4494 85.5802 10.5654 86.2004 10.7974C86.8254 11.0246 87.37 11.3679 87.834 11.8272C88.3027 12.2865 88.6673 12.8641 88.9277 13.5601C89.1881 14.2514 89.3183 15.0611 89.3183 15.9891V16.8201H80.1067V14.9451H86.4703C86.4703 14.5095 86.3756 14.1236 86.1862 13.7874C85.9968 13.4512 85.7341 13.1885 85.3979 12.9991C85.0664 12.8049 84.6806 12.7079 84.2402 12.7079C83.7809 12.7079 83.3737 12.8144 83.0186 13.0275C82.6682 13.2358 82.3936 13.5175 82.1948 13.8726C81.9959 14.223 81.8941 14.6137 81.8894 15.0445V16.8272C81.8894 17.367 81.9888 17.8333 82.1877 18.2263C82.3913 18.6193 82.6777 18.9224 83.047 19.1354C83.4164 19.3485 83.8543 19.455 84.361 19.455C84.6971 19.455 85.0049 19.4077 85.2843 19.313C85.5636 19.2183 85.8027 19.0762 86.0016 18.8869C86.2004 18.6975 86.352 18.4655 86.4561 18.1908L89.2544 18.3755C89.1124 19.0478 88.8212 19.635 88.3808 20.1369C87.9452 20.634 87.3818 21.0223 86.6905 21.3016C86.0039 21.5762 85.2109 21.7136 84.3112 21.7136Z" fill="#353432"/>
              </svg>
);

interface NavbarProps {
  onDrawerOpen: () => void;
}

export default function Navbar({ onDrawerOpen }: NavbarProps) {
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleDrop = (id: string) => {
    setOpenDrop(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) {
        setOpenDrop(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      {/* Brand */}
      <Link className="brand" href="/dashboard">
        <LogoIcon />
        
      </Link>

      {/* Desktop nav menu + user */}
      <div className="navbar-right-group">
        <div className="nav-menu">

          {/* Peta Sebaran */}
          <Link className="nav-item" href="/dashboard">
            <svg className="n-icon" viewBox="0 0 24 24">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            </svg>
            Peta Sebaran
          </Link>

          {/* Pengelola Aset dropdown */}
          <div
            className={`nav-item${openDrop === 'aset' ? ' open' : ''}`}
            onClick={() => toggleDrop('aset')}
          >
            <svg className="n-icon" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            Data Reklame
            <svg className="n-caret" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>

            <div className={`dropdown${openDrop === 'aset' ? ' show' : ''}`}>
              <div className="dd-label">Modul Aset</div>

              <Link className="dd-item mreklame" href="/manajemen_reklame" onClick={() => setOpenDrop(null)}>
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                Manajemen Reklame
              </Link>

              {/* <Link className="dd-item" href="/dokumen_aset" onClick={() => setOpenDrop(null)}>
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Dokumen Aset
              </Link>

              <Link className="dd-item" href="/detail_aset" onClick={() => setOpenDrop(null)}>
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                Detail Aset
              </Link> */}

              <div className="dd-divider" />
              {/* <div className="dd-label">Manajemen</div> */}

              {/* <Link className="dd-item" href="/tambah_aset" onClick={() => setOpenDrop(null)}>
                <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                Tambah Aset Baru
              </Link>

              <Link className="dd-item" href="/validasi_data" onClick={() => setOpenDrop(null)}>
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                Validasi Data
              </Link> */}
            </div>
          </div>

          {/* Infografis Reklame */}
          <Link className="nav-item" href="/infografis">
            <svg className="n-icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l3 3" />
            </svg>
            Infografis Reklame
          </Link>

          {/* Manajemen Laporan (Admin) */}
          <Link className="nav-item" href="/manajemen-laporan">
            <svg className="n-icon" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Laporan Masuk
          </Link>

          {/* Infografis Laporan */}
          <Link className="nav-item" href="/infografis-laporan">
            <svg className="n-icon" viewBox="0 0 24 24">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
            Infografis Laporan
          </Link>
        </div>

        {/* Desktop user */}
        <div className="navbar-right">
          <div
            className={`user-btn${openDrop === 'user' ? ' open' : ''}`}
            onClick={() => toggleDrop('user')}
          >
            <div className="avatar">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            Admin BPKAD
            <svg className="n-caret" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9" />
            </svg>
            <div className={`dropdown right${openDrop === 'user' ? ' show' : ''}`}>
              {/* <div className="dd-item">
                <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Profil Saya
              </div>
              <div className="dd-item">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>
                Pengaturan Akun
              </div> */}
                <a href="/ubah_password" className='ubahpw'>
              <div className="dd-item">
                <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                Ubah Password
              </div></a>
              <div className="dd-divider" />
              <button className='dd-item danger borde-none' onClick={async () => {
                const result = await Swal.fire({
                  title: "Yakin ingin logout?",
                  text: "Sesi Anda akan diakhiri.",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Ya, logout",
                  cancelButtonText: "Batal",
                  reverseButtons: true,
                });
                if (result.isConfirmed) {
                  await signOut({ callbackUrl: "/login" });
                }
              }}>
                <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile hamburger */}
      <button className="nav-hamburger" onClick={onDrawerOpen}>
        <svg viewBox="0 0 24 24">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </nav>
  );
}