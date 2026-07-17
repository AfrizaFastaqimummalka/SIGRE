"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "../../../components/AppShell";
import { useSession } from "next-auth/react";
import ReklameLocationSection from "../../../components/ReklameLocationSection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
type ReklameForm = {
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
  kategori: string;
  zona: string;
  kabupaten_kota: string;
  pengguna: string;
  kuasa_pengguna: string;
};

type FotoReklame = {
  id: number | string;
  reklame: number | string;
  foto: string;
  keterangan?: string;
};

type Kategori = {
  id: number | string;
  nama_kategori?: string;
  nama?: string;
};

type Zona = {
  id: number | string;
  nama_zona?: string;
  tipe_zona?: string;
  nama?: string;
};

const initialForm: ReklameForm = {
  id: "",
  kode_reklame: "",
  nama_pemilik: "",
  nik_npwp: "",
  latitude: "",
  longitude: "",
  luas_m2: "",
  tinggi_m: "",
  status_reklame: "",
  tanggal_pasang: "",
  kategori: "",
  zona: "",
  kabupaten_kota: "",
  pengguna: "",
  kuasa_pengguna: "",
};

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const kodeReklame = String(params.kode_reklame || "");

  const [tab, setTab] = useState("informasi");
  const [form, setForm] = useState<ReklameForm>(initialForm);
  const [originalForm, setOriginalForm] = useState<ReklameForm>(initialForm);

  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [zonaList, setZonaList] = useState<Zona[]>([]);

  const [photos, setPhotos] = useState<FotoReklame[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const tabs = [
    { key: "informasi", label: "Informasi", icon: "i" },
    { key: "lokasi", label: "Lokasi", icon: "o" },
    { key: "media", label: "Media", icon: "o" },
  ];

  useEffect(() => {
    async function initializePage() {
      await Promise.all([
        fetchDetailReklame(),
        fetchKategori(),
        fetchZona(),
      ]);
    }

    if (kodeReklame && status === "authenticated" && accessToken) {
      initializePage();
    }
  }, [kodeReklame, accessToken, status]);

  useEffect(() => {
    if (form.id) {
      fetchPhotos();
    }
  }, [form.id]);

  async function fetchDetailReklame() {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/reklame/${encodeURIComponent(kodeReklame)}/`,
        {
          method: "GET",
          cache: "no-store",
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        }
      );

      if (!response.ok) {
        throw new Error("Data reklame tidak ditemukan.");
      }

      const data = await response.json();

      const nextForm: ReklameForm = {
        id: normalizeValue(data.id),
        kode_reklame: normalizeValue(data.kode_reklame),
        nama_pemilik: normalizeValue(data.nama_pemilik),
        nik_npwp: normalizeValue(data.nik_npwp),
        latitude: normalizeValue(data.latitude),
        longitude: normalizeValue(data.longitude),
        luas_m2: normalizeValue(data.luas_m2),
        tinggi_m: normalizeValue(data.tinggi_m),
        status_reklame: normalizeValue(data.status_reklame),
        tanggal_pasang: toInputDate(data.tanggal_pasang),
        kategori: normalizeValue(data.kategori),
        zona: normalizeValue(data.zona),
        kabupaten_kota: normalizeValue(data.kabupaten_kota),
        pengguna: normalizeValue(data.pengguna),
        kuasa_pengguna: normalizeValue(data.kuasa_pengguna),
      };

      setForm(nextForm);
      setOriginalForm(nextForm);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data reklame dari backend."
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchKategori() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/kategori/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) return;

      const data = await response.json();
      setKategoriList(toArrayResponse<Kategori>(data));
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  }

  async function fetchZona() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/zona/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) return;

      const data = await response.json();
      setZonaList(toArrayResponse<Zona>(data));
    } catch (error) {
      console.error("Gagal mengambil zona:", error);
    }
  }

  async function fetchPhotos() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/foto/`, {
        method: "GET",
        cache: "no-store",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) return;

      const data = await response.json();
      const photoList = toArrayResponse<FotoReklame>(data);

      const filteredPhotos = photoList.filter(
        (item: FotoReklame) => String(item.reklame) === String(form.id)
      );

      setPhotos(filteredPhotos);
    } catch (error) {
      console.error("Gagal mengambil foto:", error);
    }
  }

  function updateFormField(name: keyof ReklameForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function updateCoordinate(latitude: string, longitude: string) {
    setForm((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));
  }

  function validateForm() {
    if (!form.nama_pemilik.trim()) {
      return "Nama pemilik wajib diisi.";
    }

    if (!form.latitude.trim()) {
      return "Latitude wajib diisi.";
    }

    if (!form.longitude.trim()) {
      return "Longitude wajib diisi.";
    }

    const lat = Number(form.latitude);
    const lng = Number(form.longitude);

    if (!isValidCoordinate(lat, lng)) {
      return "Koordinat tidak valid. Latitude harus antara -90 s.d. 90, Longitude antara -180 s.d. 180.";
    }

    if (!form.status_reklame.trim()) {
      return "Status reklame wajib dipilih.";
    }

    return "";
  }

  function buildPayload() {
    return {
      nama_pemilik: form.nama_pemilik,
      nik_npwp: form.nik_npwp || null,
      latitude: form.latitude,
      longitude: form.longitude,
      luas_m2: form.luas_m2 || null,
      tinggi_m: form.tinggi_m || null,
      status_reklame: form.status_reklame,
      tanggal_pasang: form.tanggal_pasang || null,
      kategori: form.kategori || null,
      zona: form.zona || null,
      kabupaten_kota: form.kabupaten_kota || null,
      pengguna: form.pengguna || null,
      kuasa_pengguna: form.kuasa_pengguna || null,
    };
  }

  async function handleSubmit() {
    setErrorMessage("");
    setSuccessMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/reklame/${encodeURIComponent(kodeReklame)}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify(buildPayload()),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        if (errorData && typeof errorData === 'object') {
          const messages = Object.entries(errorData)
            .map(([field, errors]) => {
              const msgs = Array.isArray(errors) ? errors.join(', ') : String(errors);
              return `${field}: ${msgs}`;
            })
            .join(' | ');
          throw new Error(messages || "Gagal menyimpan perubahan data reklame.");
        }

        throw new Error("Gagal menyimpan perubahan data reklame.");
      }

      setSuccessMessage("Data reklame berhasil diperbarui.");

      setTimeout(() => {
        router.push(
          `/manajemen_reklame/detail/${encodeURIComponent(kodeReklame)}`
        );
      }, 700);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setForm(originalForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorMessage("Browser tidak mendukung fitur lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);

        updateCoordinate(latitude, longitude);
        setSuccessMessage("Lokasi berhasil diambil dari perangkat.");
        setErrorMessage("");
      },
      () => {
        setErrorMessage("Gagal mengambil lokasi perangkat.");
      }
    );
  }

  async function handleUploadPhoto() {
    if (!selectedPhoto) {
      setErrorMessage("Pilih foto terlebih dahulu.");
      return;
    }

    if (!form.id) {
      setErrorMessage("ID reklame tidak ditemukan.");
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMessage("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("reklame", form.id);
      formData.append("foto", selectedPhoto);
      formData.append("keterangan", photoCaption);

      const response = await fetch(`${API_BASE_URL}/api/foto/`, {
        method: "POST",
        body: formData,
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData ? JSON.stringify(errorData) : "Gagal upload foto."
        );
      }

      setSelectedPhoto(null);
      setPhotoCaption("");
      setSuccessMessage("Foto berhasil diunggah.");
      await fetchPhotos();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal upload foto."
      );
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleDeletePhoto(photoId: number | string) {
    const confirmDelete = window.confirm("Hapus foto ini?");

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/foto/${photoId}/`, {
        method: "DELETE",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });

      if (!response.ok) {
        throw new Error("Gagal menghapus foto.");
      }

      setSuccessMessage("Foto berhasil dihapus.");
      await fetchPhotos();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus foto."
      );
    }
  }

  if (loading) {
    return (
      <AppShell>
        <div style={styles.page}>
          <div style={styles.loading}>Mengambil data edit dari backend...</div>
        </div>
      </AppShell>
    );
  }

  if (errorMessage && !form.kode_reklame) {
    return (
      <AppShell>
        <div style={styles.page}>
          <div style={styles.errorBox}>
            <strong>Gagal memuat data edit</strong>
            <p>{errorMessage}</p>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={() => router.push("/manajemen_reklame")}
            >
              Kembali
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={styles.page}>
        <div style={styles.breadcrumb}>
          <div style={styles.breadcrumbIcon}>≡</div>
          <span>Manajemen Reklame</span>
          <span style={{ color: "#c0cad8" }}>›</span>
          <span>Detail Reklame</span>
          <span style={{ color: "#c0cad8" }}>›</span>
          <span style={{ color: "#3aaef7", fontWeight: 600 }}>
            Edit Reklame
          </span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", paddingBottom: 12 }}>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/manajemen_reklame/detail/${encodeURIComponent(
                      form.kode_reklame
                    )}`
                  )
                }
                style={styles.backButton}
              >
                ‹
              </button>

              <div>
                <div style={styles.title}>Edit Reklame</div>
                <div style={styles.subtitle}>{form.kode_reklame}</div>
              </div>
            </div>

            <div style={styles.tabs}>
              {tabs.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  style={{
                    ...styles.tabButton,
                    fontWeight: tab === item.key ? 600 : 500,
                    borderBottom:
                      tab === item.key
                        ? "2px solid #35b3ff"
                        : "2px solid transparent",
                    color: tab === item.key ? "#35b3ff" : "#6f7f92",
                  }}
                >
                  <span
                    style={{
                      ...styles.tabIcon,
                      border: `1px solid ${
                        tab === item.key ? "#35b3ff" : "#98a6b8"
                      }`,
                      color: tab === item.key ? "#35b3ff" : "#98a6b8",
                    }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {(errorMessage || successMessage) && (
            <div style={{ padding: "12px 14px 0" }}>
              {errorMessage && (
                <div style={styles.alertError}>{errorMessage}</div>
              )}

              {successMessage && (
                <div style={styles.alertSuccess}>{successMessage}</div>
              )}
            </div>
          )}

          {tab === "informasi" && (
            <InformasiSection
              form={form}
              kategoriList={kategoriList}
              zonaList={zonaList}
              onChange={updateFormField}
            />
          )}

          {tab === "lokasi" && (
            <LokasiSection
              form={form}
              onCoordinateChange={updateCoordinate}
              onUseCurrentLocation={handleUseCurrentLocation}
            />
          )}

          {tab === "media" && (
            <MediaSection
              photos={photos}
              selectedPhoto={selectedPhoto}
              photoCaption={photoCaption}
              uploadingPhoto={uploadingPhoto}
              onSelectPhoto={setSelectedPhoto}
              onCaptionChange={setPhotoCaption}
              onUploadPhoto={handleUploadPhoto}
              onDeletePhoto={handleDeletePhoto}
            />
          )}

          <div style={styles.footer}>
            <button
              type="button"
              style={styles.resetButton}
              onClick={handleReset}
              disabled={saving}
            >
              ↺ Reset
            </button>

            <button
              type="button"
              style={{
                ...styles.saveButton,
                opacity: saving ? 0.7 : 1,
              }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InformasiSection({
  form,
  kategoriList,
  zonaList,
  onChange,
}: {
  form: ReklameForm;
  kategoriList: Kategori[];
  zonaList: Zona[];
  onChange: (name: keyof ReklameForm, value: string) => void;
}) {
  return (
    <div style={{ padding: "12px 14px 18px" }}>
      <div style={styles.sectionTitle}>Data Informasi Reklame</div>

      <Grid4>
        <InputCard
          label="Kode Reklame"
          name="kode_reklame"
          value={form.kode_reklame}
          readOnly
          onChange={onChange}
        />

        <InputCard
          label="Nama Pemilik"
          name="nama_pemilik"
          value={form.nama_pemilik}
          onChange={onChange}
        />

        <InputCard
          label="NIK/NPWP"
          name="nik_npwp"
          value={form.nik_npwp}
          onChange={onChange}
        />

        <SelectCard
          label="Status Reklame"
          name="status_reklame"
          value={form.status_reklame}
          onChange={onChange}
          options={[
            { value: "", label: "Pilih Status" },
            { value: "AKTIF", label: "AKTIF" },
            { value: "TIDAK AKTIF", label: "TIDAK AKTIF" },
            { value: "NONAKTIF", label: "NONAKTIF" },
          ]}
        />
      </Grid4>

      <Grid4>
        <InputCard
          label="Luas Reklame m²"
          name="luas_m2"
          value={form.luas_m2}
          onChange={onChange}
        />

        <InputCard
          label="Tinggi Reklame m"
          name="tinggi_m"
          value={form.tinggi_m}
          onChange={onChange}
        />

        <InputCard
          label="Tanggal Pasang"
          name="tanggal_pasang"
          value={form.tanggal_pasang}
          type="date"
          onChange={onChange}
        />

        <SelectCard
          label="Kategori"
          name="kategori"
          value={form.kategori}
          onChange={onChange}
          options={[
            { value: "", label: "Pilih Kategori" },
            ...kategoriList.map((item) => ({
              value: String(item.id),
              label: item.nama_kategori || item.nama || `Kategori ${item.id}`,
            })),
          ]}
        />
      </Grid4>

      <Grid4>
        <SelectCard
          label="Zona"
          name="zona"
          value={form.zona}
          onChange={onChange}
          options={[
            { value: "", label: "Pilih Zona" },
            ...zonaList.map((item) => ({
              value: String(item.id),
              label:
                item.nama_zona ||
                item.tipe_zona ||
                item.nama ||
                `Zona ${item.id}`,
            })),
          ]}
        />

       
        <InputCard
          label="Kabupaten/Kota"
          name="kabupaten_kota"
          value={form.kabupaten_kota}
          onChange={onChange}
        />

        <InputCard
          label="Pengguna"
          name="pengguna"
          value={form.pengguna}
          onChange={onChange}
        />

        <InputCard
          label="Kuasa Pengguna"
          name="kuasa_pengguna"
          value={form.kuasa_pengguna}
          onChange={onChange}
        />
      </Grid4>
    </div>
  );
}

function LokasiSection({
  form,
  onCoordinateChange,
  onUseCurrentLocation,
}: {
  form: ReklameForm;
  onCoordinateChange: (latitude: string, longitude: string) => void;
  onUseCurrentLocation: () => void;
}) {
  return (
    <ReklameLocationSection
      latitude={form.latitude}
      longitude={form.longitude}
      onCoordinateChange={onCoordinateChange}
      onUseCurrentLocation={onUseCurrentLocation}
    />
  );
}

function MediaSection({
  photos,
  selectedPhoto,
  photoCaption,
  uploadingPhoto,
  onSelectPhoto,
  onCaptionChange,
  onUploadPhoto,
  onDeletePhoto,
}: {
  photos: FotoReklame[];
  selectedPhoto: File | null;
  photoCaption: string;
  uploadingPhoto: boolean;
  onSelectPhoto: (file: File | null) => void;
  onCaptionChange: (value: string) => void;
  onUploadPhoto: () => void;
  onDeletePhoto: (id: number | string) => void;
}) {
  return (
    <div style={{ padding: "12px 14px 14px" }}>
      <div style={styles.sectionTitle}>Data Media Reklame</div>

      <div style={styles.mediaInputGrid}>
        <div style={styles.uploadCard}>
          <div style={styles.inputLabel}>Unggah Foto</div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#f1f5f9",
              border: "1px dashed #cbd5e1",
              padding: "10px 16px",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 13,
              color: "#334155",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: 16 }}>📎</span> Pilih Foto
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                onSelectPhoto(event.target.files?.[0] || null)
              }
              style={{ display: "none" }}
            />
          </label>

          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
            {selectedPhoto ? (
              <span style={{ color: "#16a34a" }}>✓ {selectedPhoto.name}</span>
            ) : (
              "Belum ada foto dipilih"
            )}
          </div>
        </div>

        <div style={styles.uploadCard}>
          <div style={styles.inputLabel}>Keterangan Foto</div>

          <input
            value={photoCaption}
            onChange={(event) => onCaptionChange(event.target.value)}
            placeholder="Contoh: Tampak depan reklame"
            style={styles.plainInput}
          />
        </div>
      </div>

      <button
        type="button"
        style={{
          ...styles.smallPrimaryButton,
          marginBottom: 12,
          opacity: uploadingPhoto ? 0.7 : 1,
        }}
        onClick={onUploadPhoto}
        disabled={uploadingPhoto}
      >
        {uploadingPhoto ? "Mengunggah..." : "Upload Foto"}
      </button>

      {photos.length === 0 ? (
        <div style={styles.emptyPhoto}>Belum ada foto reklame.</div>
      ) : (
        <div style={styles.photoGrid}>
          {photos.map((item) => (
            <div key={item.id} style={styles.photoItem}>
              <img
                src={buildFileUrl(item.foto)}
                alt={item.keterangan || "Foto reklame"}
                style={styles.photoImage}
              />

              <button
                type="button"
                onClick={() => onDeletePhoto(item.id)}
                style={styles.deletePhotoButton}
              >
                🗑
              </button>

              <div style={styles.photoCaption}>
                {item.keterangan || "Tanpa keterangan"}
              </div>
            </div>
          ))}
        </div>
      )}


    </div>
  );
}

function Grid4({ children }: { children: React.ReactNode }) {
  return <div style={styles.grid4}>{children}</div>;
}

function InputCard({
  label,
  name,
  value,
  placeholder,
  type = "text",
  readOnly = false,
  onChange,
}: {
  label: string;
  name: keyof ReklameForm;
  value: string;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  onChange: (name: keyof ReklameForm, value: string) => void;
}) {
  return (
    <div style={styles.inputCard}>
      <div style={styles.inputLabel}>{label}</div>

      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        onChange={(event) => onChange(name, event.target.value)}
        style={{
          ...styles.plainInput,
          color: readOnly ? "#6b7280" : "#3b495b",
        }}
      />
    </div>
  );
}

function SelectCard({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: keyof ReklameForm;
  value: string;
  options: { value: string; label: string }[];
  onChange: (name: keyof ReklameForm, value: string) => void;
}) {
  return (
    <div style={styles.inputCard}>
      <div style={styles.inputLabel}>{label}</div>

      <select
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        style={styles.plainSelect}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toInputDate(value: string | null | undefined) {
  if (!value) return "";

  if (value.includes("T")) {
    return value.split("T")[0];
  }

  return value;
}

function toArrayResponse<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];

  if (typeof data === "object" && data !== null && "results" in data) {
    const results = (data as { results?: unknown }).results;
    if (Array.isArray(results)) return results as T[];
  }

  return [];
}

function buildFileUrl(path: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function isValidCoordinate(latitude: number, longitude: number) {
  return (
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: 14,
    fontFamily: "'Segoe UI', Tahoma, sans-serif",
    color: "#1f2937",
  },

  breadcrumb: {
    background: "#f9fbfd",
    border: "1px solid #edf1f6",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#7a8699",
    marginBottom: 10,
    borderRadius: 6,
  },

  breadcrumbIcon: {
    width: 22,
    height: 22,
    background: "#e7f3ff",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#22a3f5",
    fontSize: 12,
    fontWeight: 700,
  },

  card: {
    background: "#fff",
    borderRadius: 8,
    border: "1px solid #edf1f6",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px 0",
    borderBottom: "1px solid #eef2f7",
    minHeight: 52,
  },

  backButton: {
    width: 18,
    height: 18,
    borderRadius: 4,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    marginRight: 8,
    fontSize: 14,
    color: "#7b8798",
    padding: 0,
  },

  title: {
    fontWeight: 600,
    fontSize: 14,
    color: "#2f3f53",
  },

  subtitle: {
    fontSize: 11,
    color: "#8b97a6",
    marginTop: 2,
  },

  tabs: {
    display: "flex",
    gap: 18,
    paddingBottom: 0,
  },

  tabButton: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    height: 40,
    padding: "0 2px",
    borderRadius: 0,
    fontSize: 12,
    cursor: "pointer",
    border: "none",
    background: "transparent",
  },

  tabIcon: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    fontSize: 9,
    lineHeight: "12px",
    textAlign: "center",
    fontWeight: 700,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6e7f93",
    marginBottom: 10,
  },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
    marginBottom: 8,
  },

  inputCard: {
    border: "1px solid #dfe6ef",
    borderRadius: 6,
    padding: "6px 10px",
    position: "relative",
    minHeight: 44,
  },

  inputLabel: {
    fontSize: 10,
    color: "#9aa8b8",
    marginBottom: 2,
  },

  plainInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#3b495b",
    background: "transparent",
    fontFamily: "inherit",
  },

  plainSelect: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 13,
    fontWeight: 500,
    color: "#3b495b",
    background: "transparent",
    fontFamily: "inherit",
  },

  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    padding: "14px 14px",
    borderTop: "1px solid #eef2f7",
  },

  resetButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 98,
    height: 34,
    borderRadius: 6,
    border: "1px solid #79cafb",
    background: "#fff",
    color: "#35b3ff",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  saveButton: {
    minWidth: 132,
    height: 34,
    borderRadius: 6,
    border: "none",
    background: "#35b3ff",
    color: "#fff",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    minWidth: 98,
    height: 34,
    borderRadius: 6,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 12,
  },

  smallPrimaryButton: {
    minWidth: 116,
    height: 30,
    border: "none",
    borderRadius: 6,
    background: "#2db3ff",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },

  smallOutlineButton: {
    minWidth: 116,
    height: 30,
    border: "1px solid #95d5fb",
    borderRadius: 6,
    background: "#f8fdff",
    color: "#36aff8",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
  },

  mapActionRow: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    marginBottom: 8,
  },

  mapBox: {
    border: "1px solid #dfe6ef",
    borderRadius: 6,
    padding: 8,
  },

  mapInfoText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  mediaInputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    marginBottom: 10,
  },

  uploadCard: {
    border: "1px solid #dfe6ef",
    borderRadius: 6,
    padding: "6px 10px",
    minHeight: 44,
  },

  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 8,
  },

  photoItem: {
    position: "relative",
    borderRadius: 6,
    overflow: "hidden",
    height: 100,
    border: "1px solid #dfe6ef",
    background: "#e5e7eb",
  },

  photoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  deletePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "none",
    background: "#ea4f4f",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    lineHeight: 1,
  },

  photoCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    padding: "4px 6px",
    fontSize: 10,
  },

  emptyPhoto: {
    border: "1px dashed #cbd5e1",
    borderRadius: 6,
    padding: 18,
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
  },

  youtubeNote: {
    marginTop: 12,
    fontSize: 11,
    color: "#6b7280",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    padding: 8,
  },

  alertError: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 12,
  },

  alertSuccess: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 12,
  },

  loading: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    color: "#6b7280",
    textAlign: "center",
  },

  errorBox: {
    background: "#fff",
    borderRadius: 8,
    padding: 24,
    color: "#dc2626",
  },
};