'use client';

import { FormEvent, useEffect, useState } from 'react';

interface SidebarProps {
    collapsed: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
    const [eyeStates, setEyeStates] = useState<Record<string, boolean>>({
        poligon: false,
        rtrw: false,
    });

    const [openAccs, setOpenAccs] = useState<Record<string, boolean>>({});
    const [locationKeyword, setLocationKeyword] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    useEffect(() => {
        const handleSearchStatus = (event: Event) => {
            const customEvent = event as CustomEvent<{
                message: string;
                type: 'info' | 'success' | 'error';
            }>;

            setSearchStatus(customEvent.detail.message);
        };

        window.addEventListener('map-location-search-status', handleSearchStatus);

        return () => {
            window.removeEventListener('map-location-search-status', handleSearchStatus);
        };
    }, []);

    const toggleEye = (key: string) => {
        setEyeStates((prev) => {
            const nextValue = !prev[key];

            window.dispatchEvent(
                new CustomEvent('layer-toggle', {
                    detail: {
                        layer: key,
                        visible: nextValue,
                    },
                })
            );

            return {
                ...prev,
                [key]: nextValue,
            };
        });
    };

    const toggleAcc = (key: string) => {
        setOpenAccs((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const dispatchLocationSearch = (keyword: string) => {
        const query = keyword.trim();

        if (!query) {
            setSearchStatus('Masukkan nama lokasi terlebih dahulu.');
            return;
        }

        setSearchStatus('Mencari lokasi...');

        window.dispatchEvent(
            new CustomEvent('map-location-search', {
                detail: {
                    query,
                },
            })
        );

        if (mobileOpen) {
            onMobileClose();
        }
    };

    const handleLocationSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        dispatchLocationSearch(locationKeyword);
    };

    const handleClearLocationSearch = () => {
        setLocationKeyword('');
        setSearchStatus('');

        window.dispatchEvent(new CustomEvent('map-location-clear'));
    };

    const EyeOpen = () => (
        <svg viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    const EyeClosed = () => (
        <svg viewBox="0 0 24 24">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    const sidebarClass = [
        'sidebar',
        collapsed ? 'collapsed' : '',
        mobileOpen ? 'mobile-open' : '',
    ].filter(Boolean).join(' ');

    return (
        <>
            <div
                className={`nav-overlay sidebar-overlay${mobileOpen ? ' show' : ''}`}
                style={{ display: mobileOpen ? 'block' : 'none' }}
                onClick={onMobileClose}
            />

            <aside className={sidebarClass} id="sidebar">
                <div className="info-card">
                    <div className="info-card-hd">
                        <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <circle cx="12" cy="16" r=".5" fill="white" />
                        </svg>
                        Informasi Aset Daerah
                    </div>

                    <div className="asset-row">
                        <div className="a-icon">
                            <svg viewBox="0 0 24 24">
                                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                            </svg>
                        </div>
                        <span className="a-label">Aset Tanah</span>
                        <span className="a-count">400</span>
                    </div>

                    <div className="asset-row">
                        <div className="a-icon">
                            <svg viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </div>
                        <span className="a-label">Aset Lainnya</span>
                        <span className="a-count">200</span>
                    </div>
                </div>

                <hr className="hr-navbar" />

                <div className="sec-title">
                    <svg viewBox="0 0 24 24">
                        <polygon points="12 2 2 7 12 12 22 7" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                    </svg>
                    Layer Management
                </div>

                <div className="layer-list">
                    <div className="layer-item">
                        <div className="layer-hd">
                            <span>Poligon Aset</span>
                            <div className="hd-right">
                                <button
                                    className="i-btn"
                                    onClick={() => toggleEye('poligon')}
                                    type="button"
                                    aria-label="Toggle Poligon Aset"
                                >
                                    {eyeStates.poligon ? <EyeOpen /> : <EyeClosed />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="layer-item">
                        <div className="layer-hd">
                            <span>Rencana Pola Ruang RTRW</span>
                            <div className="hd-right">
                                <button
                                    className="i-btn"
                                    onClick={() => toggleEye('rtrw')}
                                    type="button"
                                    aria-label="Toggle Rencana Pola Ruang RTRW"
                                >
                                    {eyeStates.rtrw ? <EyeOpen /> : <EyeClosed />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* <div className={`layer-item${openAccs.terdekat ? ' open' : ''}`}>
                        <div
                            className="layer-hd clickable"
                            onClick={() => toggleAcc('terdekat')}
                        >
                            <span>Aset Terdekat</span>
                            <div className="hd-right">
                                <div className="i-btn chevron">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="acc-body">
                            <div className="acc-inner">
                                <div className="acc-empty">Belum ada data aset terdekat</div>

                                {['Radius 500m', 'Radius 1km', 'Radius 5km'].map((label) => (
                                    <div key={label} className="acc-opt">
                                        <svg viewBox="0 0 24 24">
                                            <circle cx="12" cy="10" r="3" />
                                            <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" />
                                        </svg>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> */}

                    {/* <div className={`layer-item${openAccs.filter ? ' open' : ''}`}>
                        <div
                            className="layer-hd clickable"
                            onClick={() => toggleAcc('filter')}
                        >
                            <span>Filter Data</span>
                            <div className="hd-right">
                                <div className="i-btn chevron">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="acc-body">
                            <div className="acc-inner">
                                <div className="acc-empty">Belum ada filter yang tersedia</div>

                                {[
                                    'Filter Kategori',
                                    'Filter Tahun',
                                    'Filter Status',
                                    'Filter Wilayah',
                                ].map((label) => (
                                    <div key={label} className="acc-opt">
                                        <svg viewBox="0 0 24 24">
                                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                                        </svg>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div> */}

                    <div className={`layer-item${openAccs.cari ? ' open' : ''}`}>
                        <div
                            className="layer-hd clickable"
                            onClick={() => toggleAcc('cari')}
                        >
                            <span>Cari Lokasi</span>
                            <div className="hd-right">
                                <div className="i-btn chevron">
                                    <svg viewBox="0 0 24 24">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="acc-body">
                            <div className="acc-inner">
                                <form className="map-search-form" onSubmit={handleLocationSubmit}>
                                    <label className="map-search-label">Cari lokasi</label>

                                    <div className="map-search-box">
                                        <svg viewBox="0 0 24 24">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>

                                        <input
                                            value={locationKeyword}
                                            onChange={(event) => setLocationKeyword(event.target.value)}
                                            placeholder="Contoh: Batam Center, Nagoya, Tiban"
                                            className="map-search-input"
                                        />
                                    </div>

                                    <div className="map-search-actions">
                                        <button className="map-search-btn" type="submit">
                                            Cari Lokasi
                                        </button>

                                        <button
                                            className="map-search-clear"
                                            type="button"
                                            onClick={handleClearLocationSearch}
                                        >
                                            Reset
                                        </button>
                                    </div>

                                    {searchStatus && (
                                        <div className="map-search-status">
                                            {searchStatus}
                                        </div>
                                    )}
                                </form>

                                <div className="map-search-chips">
                                    {[
                                        'Batam Center',
                                        'Nagoya Batam',
                                        'Sekupang Batam',
                                        'Batu Aji Batam',
                                        'Nongsa Batam',
                                    ].map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            className="map-search-chip"
                                            onClick={() => {
                                                setLocationKeyword(label);
                                                dispatchLocationSearch(label);
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}