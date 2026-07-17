from django.db import models
import uuid


class ReklameKategori(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_kategori = models.CharField(max_length=255)
    ukuran_max = models.CharField(max_length=100, null=True, blank=True)
    retribusi_per_m2 = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = 'reklame_kategori'

    def __str__(self):
        return self.nama_kategori


class ZonaTataRuang(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_zona = models.CharField(max_length=255)
    tipe_zona = models.CharField(max_length=100)
    geometri_geojson = models.TextField(null=True, blank=True)
    keterangan = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'zona_tata_ruang'

    def __str__(self):
        return self.nama_zona


class Users(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_lengkap = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password_hash = models.TextField()
    no_telepon = models.CharField(max_length=20, null=True, blank=True)
    foto_profil = models.CharField(max_length=500, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    update_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Reklame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kode_reklame = models.CharField(max_length=100, unique=True)
    kategori = models.ForeignKey(
        ReklameKategori,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='kategori_id'
    )
    zona = models.ForeignKey(
        ZonaTataRuang,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='zona_id'
    )
    nama_pemilik = models.CharField(max_length=255)
    nik_npwp = models.CharField(max_length=50, null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    luas_m2 = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    tinggi_m = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    status_reklame = models.CharField(max_length=50, null=True, blank=True)
    tanggal_pasang = models.DateField(null=True, blank=True)
    kabupaten_kota = models.CharField(max_length=100, null=True, blank=True)
    pengguna = models.CharField(max_length=255, null=True, blank=True)
    kuasa_pengguna = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reklame'

    def __str__(self):
        return self.kode_reklame


class Perizinan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    no_registrasi = models.CharField(max_length=100, unique=True)
    reklame = models.ForeignKey(
        Reklame,
        on_delete=models.CASCADE,
        db_column='reklame_id'
    )
    pemohon = models.ForeignKey(
        Users,
        on_delete=models.CASCADE,
        db_column='pemohon_id',
        related_name='perizinan_pemohon'
    )
    status_perizinan = models.CharField(max_length=50, default='PENDING')
    tanggal_pengajuan = models.DateField(auto_now_add=True)
    tanggal_keputusan = models.DateField(null=True, blank=True)
    catatan_keputusan = models.TextField(null=True, blank=True)
    masa_berlaku = models.DateField(null=True, blank=True)
    update_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'perizinan'

    def __str__(self):
        return self.no_registrasi


class DokumenReklame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reklame = models.ForeignKey(
        Reklame,
        on_delete=models.CASCADE,
        db_column='reklame_id',
        related_name='dokumen'
    )
    jenis_dokumen = models.CharField(max_length=100, null=True, blank=True)
    nama_file = models.CharField(max_length=500, null=True, blank=True)
    file = models.FileField(upload_to='dokumen/reklame/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'perizinan_dokumen'

    def __str__(self):
        return f"{self.jenis_dokumen} - {self.nama_file}"


class FotoReklame(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reklame = models.ForeignKey(
        Reklame,
        on_delete=models.CASCADE,
        db_column='reklame_id',
        related_name='foto'
    )
    foto = models.ImageField(upload_to='foto/reklame/')
    keterangan = models.CharField(max_length=255, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'foto_reklame'

    def __str__(self):
        return f"Foto {self.reklame.kode_reklame}"


class LaporanMasyarakat(models.Model):
    KATEGORI_CHOICES = [
        ('REKLAME_ILEGAL', 'Reklame Ilegal'),
        ('REKLAME_RUSAK', 'Reklame Rusak'),
        ('MELANGGAR_ZONA', 'Melanggar Zona'),
        ('REKLAME_KADALUARSA', 'Reklame Kadaluarsa'),
        ('LAINNYA', 'Lainnya'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('DIPROSES', 'Diproses'),
        ('SELESAI', 'Selesai'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nama_pelapor = models.CharField(max_length=255, null=True, blank=True)
    no_telepon = models.CharField(max_length=20, null=True, blank=True)
    email_pelapor = models.EmailField(null=True, blank=True)
    isi_laporan = models.TextField()
    kategori_laporan = models.CharField(max_length=50, choices=KATEGORI_CHOICES)
    foto = models.ImageField(upload_to='foto/laporan/', null=True, blank=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8, null=True, blank=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, null=True, blank=True)
    alamat_lokasi = models.CharField(max_length=500, null=True, blank=True)
    kecamatan = models.CharField(max_length=100, null=True, blank=True)
    reklame = models.ForeignKey(
        Reklame,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='reklame_id',
        related_name='laporan'
    )
    status_laporan = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    catatan_admin = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'laporan_masyarakat'
        ordering = ['-created_at']

    def __str__(self):
        return f"Laporan {self.id} - {self.kategori_laporan}"