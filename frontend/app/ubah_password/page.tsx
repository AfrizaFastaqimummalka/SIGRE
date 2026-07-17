"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Swal from "sweetalert2";
import AppShell from "../components/AppShell";

export default function LupaPasswordPage() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!oldPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Form belum lengkap",
                text: "Password lama, password baru, dan ulangi password wajib diisi.",
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                icon: "warning",
                title: "Password terlalu pendek",
                text: "Password baru minimal 6 karakter.",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                icon: "warning",
                title: "Password tidak sama",
                text: "Password baru dan ulangi password harus sama.",
            });
            return;
        }

        if (oldPassword === newPassword) {
            Swal.fire({
                icon: "warning",
                title: "Password tidak berubah",
                text: "Password baru tidak boleh sama dengan password lama.",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                Swal.fire({
                    icon: "error",
                    title: "Gagal mengubah password",
                    text: data.message || "Password gagal diubah.",
                });
                return;
            }

            await Swal.fire({
                icon: "success",
                title: "Password berhasil diubah",
                text: data.message,
                confirmButtonText: "Login ulang",
            });

            await signOut({
                callbackUrl: "/login",
            });
        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Terjadi kesalahan",
                text: "Tidak dapat terhubung ke server.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppShell>
            <main className="lp-page">
                <section className="lp-container">
                    <div className="lp-card">
                        <div className="lp-breadcrumb">
                            <Link href="/" className="lp-breadcrumb-link">
                                Dashboard
                            </Link>
                            <span>/</span>
                            <span>Ubah Password</span>
                        </div>

                        <div className="lp-header">
                            <div>
                                <h1 className="lp-title">Ubah Password</h1>
                                <p className="lp-subtitle">
                                    Masukkan password lama, password baru, dan ulangi password
                                    baru. Setelah berhasil, sistem akan logout otomatis.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="lp-form">
                            <div className="lp-field">
                                <label htmlFor="oldPassword">Password Lama</label>

                                <div className="lp-input-group">
                                    <input
                                        id="oldPassword"
                                        type={showOldPassword ? "text" : "password"}
                                        value={oldPassword}
                                        onChange={(event) => setOldPassword(event.target.value)}
                                        placeholder="Masukkan password lama"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                    >
                                        {showOldPassword ? "Sembunyi" : "Lihat"}
                                    </button>
                                </div>
                            </div>

                            <div className="lp-field">
                                <label htmlFor="newPassword">Password Baru</label>

                                <div className="lp-input-group">
                                    <input
                                        id="newPassword"
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="Masukkan password baru"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? "Sembunyi" : "Lihat"}
                                    </button>
                                </div>

                                <p className="lp-help">
                                    Minimal 6 karakter dan tidak boleh sama dengan password lama.
                                </p>
                            </div>

                            <div className="lp-field">
                                <label htmlFor="confirmPassword">Ulangi Password Baru</label>

                                <div
                                    className={
                                        confirmPassword && newPassword !== confirmPassword
                                            ? "lp-input-group lp-input-error"
                                            : "lp-input-group"
                                    }
                                >
                                    <input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        placeholder="Ulangi password baru"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? "Sembunyi" : "Lihat"}
                                    </button>
                                </div>

                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="lp-error-text">
                                        Password baru dan ulangi password belum sama.
                                    </p>
                                )}
                            </div>

                            <div className="lp-actions">
                                <button type="submit" className="lp-btn-primary" disabled={loading}>
                                    {loading ? "Menyimpan..." : "Simpan Password"}
                                </button>

                                <button
                                    type="button"
                                    className="lp-btn-secondary"
                                    onClick={resetForm}
                                    disabled={loading}
                                >
                                    Reset Form
                                </button>
                            </div>
                        </form>
                    </div>

                    <aside className="lp-info-card">
                        <div className="lp-info-icon">
                            <i className="fa-solid fa-lock"></i>
                        </div>

                        <h2>Keamanan Akun</h2>

                        <p>
                            Sistem akan mengecek password lama terlebih dahulu. Jika password
                            lama benar, password baru akan disimpan ke database dalam bentuk
                            hash bcrypt.
                        </p>

                        <ul>
                            <li>Password lama harus benar.</li>
                            <li>Password baru minimal 6 karakter.</li>
                            <li>Ulangi password harus sama.</li>
                            <li>Setelah berhasil, user wajib login ulang.</li>
                        </ul>
                    </aside>
                </section>
            </main>
        </AppShell>
    );
}