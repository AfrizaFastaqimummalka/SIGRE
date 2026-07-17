from rest_framework import serializers
from .models import ReklameKategori, ZonaTataRuang, Users, Reklame, Perizinan, DokumenReklame, FotoReklame, LaporanMasyarakat

class ReklameKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReklameKategori
        fields = '__all__'

class ZonaTataRuangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaTataRuang
        fields = '__all__'

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'nama_lengkap', 'email', 'no_telepon', 'is_active', 'created_at']

class ReklameSerializer(serializers.ModelSerializer):
    # Field tambahan: nama zona, tipe zona, nama kategori (read-only, untuk filter di frontend)
    nama_zona     = serializers.CharField(source='zona.nama_zona',        read_only=True, allow_null=True)
    tipe_zona     = serializers.CharField(source='zona.tipe_zona',        read_only=True, allow_null=True)
    nama_kategori = serializers.CharField(source='kategori.nama_kategori', read_only=True, allow_null=True)

    class Meta:
        model = Reklame
        fields = [
            'id', 'kode_reklame', 'kategori', 'zona',
            'nama_pemilik', 'nik_npwp',
            'latitude', 'longitude',
            'luas_m2', 'tinggi_m',
            'status_reklame', 'tanggal_pasang',
            'kabupaten_kota', 'pengguna', 'kuasa_pengguna',
            'created_at',
            # computed read-only
            'nama_zona', 'tipe_zona', 'nama_kategori',
        ]

class PerizinanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perizinan
        fields = '__all__'

class DokumenReklameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DokumenReklame
        fields = '__all__'

class FotoReklameSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoReklame
        fields = '__all__'


class LaporanMasyarakatSerializer(serializers.ModelSerializer):
    """Full serializer — untuk Admin (read/update semua field)."""
    kode_reklame = serializers.CharField(source='reklame.kode_reklame', read_only=True, allow_null=True)

    class Meta:
        model = LaporanMasyarakat
        fields = [
            'id', 'nama_pelapor', 'no_telepon', 'email_pelapor',
            'isi_laporan', 'kategori_laporan', 'foto',
            'latitude', 'longitude', 'alamat_lokasi', 'kecamatan',
            'reklame', 'kode_reklame',
            'status_laporan', 'catatan_admin',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'kode_reklame']


class LaporanMasyarakatCreateSerializer(serializers.ModelSerializer):
    """Serializer untuk POST publik — hanya field yang boleh diisi Pemohon."""

    class Meta:
        model = LaporanMasyarakat
        fields = [
            'id', 'nama_pelapor', 'no_telepon', 'email_pelapor',
            'isi_laporan', 'kategori_laporan', 'foto',
            'latitude', 'longitude', 'alamat_lokasi', 'kecamatan',
            'reklame',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']