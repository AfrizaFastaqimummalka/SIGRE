# ============================================================
# FILE: backend/aset/views.py
# GANTI SELURUH ISI FILE INI
# ============================================================

from rest_framework import viewsets, permissions, status as drf_status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Count, Sum, Q
from django.utils import timezone
from .models import ReklameKategori, ZonaTataRuang, Users, Reklame, Perizinan, DokumenReklame, FotoReklame, LaporanMasyarakat
from .serializers import (
    ReklameKategoriSerializer,
    ZonaTataRuangSerializer,
    UsersSerializer,
    ReklameSerializer,
    PerizinanSerializer,
    DokumenReklameSerializer,
    FotoReklameSerializer,
    LaporanMasyarakatSerializer,
    LaporanMasyarakatCreateSerializer,
)

from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.settings import api_settings

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        refresh = self.token_class(attrs["refresh"])
        
        user_id = refresh.payload.get(api_settings.USER_ID_CLAIM, None)
        if user_id:
            try:
                user = Users.objects.get(id=user_id)
                if not user.is_active:
                    raise AuthenticationFailed("User is inactive")
            except Users.DoesNotExist:
                raise AuthenticationFailed("User not found")

        data = {"access": str(refresh.access_token)}

        if api_settings.ROTATE_REFRESH_TOKENS:
            if api_settings.BLACKLIST_AFTER_ROTATION:
                try:
                    # Attempt to blacklist the given refresh token
                    refresh.blacklist()
                except AttributeError:
                    pass

            refresh.set_jti()
            refresh.set_exp()
            refresh.set_iat()

            data["refresh"] = str(refresh)

        return data

class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenRefreshSerializer


# ─── Existing ViewSets (tidak diubah) ──────────────────────

class ReklameKategoriViewSet(viewsets.ModelViewSet):
    queryset = ReklameKategori.objects.all()
    serializer_class = ReklameKategoriSerializer
    permission_classes = [permissions.AllowAny]

class ZonaTataRuangViewSet(viewsets.ModelViewSet):
    queryset = ZonaTataRuang.objects.all()
    serializer_class = ZonaTataRuangSerializer
    permission_classes = [permissions.AllowAny]

class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReklameViewSet(viewsets.ModelViewSet):
    queryset = Reklame.objects.all().order_by("-created_at")
    serializer_class = ReklameSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "kode_reklame"

class PerizinanViewSet(viewsets.ModelViewSet):
    queryset = Perizinan.objects.all()
    serializer_class = PerizinanSerializer
    permission_classes = [permissions.AllowAny]

class DokumenReklameViewSet(viewsets.ModelViewSet):
    queryset = DokumenReklame.objects.all()
    serializer_class = DokumenReklameSerializer
    permission_classes = [permissions.AllowAny]

class FotoReklameViewSet(viewsets.ModelViewSet):
    queryset = FotoReklame.objects.all()
    serializer_class = FotoReklameSerializer
    permission_classes = [permissions.AllowAny]


# ─── Filter Options untuk Manajemen Reklame ───────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def reklame_filter_options(request):
    """
    GET /api/reklame-filter-options/
    Mengembalikan nilai unik dari field filter untuk dropdown
    di halaman Manajemen Reklame. Ditambah default list agar tidak kosong.
    """
    # 1. Ambil data dari database
    db_kabupaten_kota = list(
        Reklame.objects.exclude(kabupaten_kota__isnull=True)
                       .exclude(kabupaten_kota__exact='')
                       .values_list('kabupaten_kota', flat=True)
                       .distinct()
    )
    db_pengguna = list(
        Reklame.objects.exclude(pengguna__isnull=True)
                       .exclude(pengguna__exact='')
                       .values_list('pengguna', flat=True)
                       .distinct()
    )
    db_kuasa_pengguna = list(
        Reklame.objects.exclude(kuasa_pengguna__isnull=True)
                       .exclude(kuasa_pengguna__exact='')
                       .values_list('kuasa_pengguna', flat=True)
                       .distinct()
    )
    db_tipe_zona = list(
        ZonaTataRuang.objects.exclude(tipe_zona__isnull=True)
                             .exclude(tipe_zona__exact='')
                             .values_list('tipe_zona', flat=True)
                             .distinct()
    )
    db_kategori = list(
        ReklameKategori.objects.exclude(nama_kategori__isnull=True)
                               .exclude(nama_kategori__exact='')
                               .values_list('nama_kategori', flat=True)
                               .distinct()
    )
    db_status_reklame = list(
        Reklame.objects.exclude(status_reklame__isnull=True)
                       .exclude(status_reklame__exact='')
                       .values_list('status_reklame', flat=True)
                       .distinct()
    )

    # 2. Definisikan default statis
    default_kabupaten = [
        "Batam Kota", "Batu Aji", "Batu Ampar", "Belakang Padang",
        "Bengkong", "Bulang", "Galang", "Lubuk Baja",
        "Nongsa", "Sagulung", "Sei Beduk", "Sekupang"
    ]
    default_pengguna = ["Pemerintah Daerah", "Swasta", "BUMN/BUMD", "Perorangan"]
    default_kuasa = ["BPKAD Batam", "Dinas Pendapatan Daerah", "Dinas Perhubungan", "Swasta"]
    default_tipe_zona = ["KENDALI KETAT", "KENDALI SEDANG", "KENDALI RENDAH", "KHUSUS", "LARANGAN"]
    default_status_reklame = ["AKTIF", "TIDAK AKTIF", "NONAKTIF", "TERSEWA"]

    # 3. Gabungkan dan hapus duplikat (menggunakan set), lalu urutkan
    kabupaten_kota = sorted(list(set(default_kabupaten + db_kabupaten_kota)))
    pengguna = sorted(list(set(default_pengguna + db_pengguna)))
    kuasa_pengguna = sorted(list(set(default_kuasa + db_kuasa_pengguna)))
    tipe_zona = sorted(list(set(default_tipe_zona + db_tipe_zona)))
    kategori = sorted(list(set(db_kategori)))
    status_reklame = sorted(list(set(default_status_reklame + db_status_reklame)))

    return Response({
        'kabupaten_kota': kabupaten_kota,
        'pengguna':       pengguna,
        'kuasa_pengguna': kuasa_pengguna,
        'tipe_zona':      tipe_zona,
        'kategori':       kategori,
        'status_reklame': status_reklame,
    })



# ─── NEW: Infografis Statistics Endpoint ───────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def infografis_stats(request):
    """
    GET /api/infografis/
    Query params (semua optional):
      - kabupaten  : filter by zona nama_zona contains
      - kategori   : filter by kategori nama_kategori
      - status_perizinan : APPROVED / PENDING / REJECTED / EXPIRED
      - pelanggaran      : TANPA_IZIN / ZONA_LARANGAN
      - status_sanksi    : AKTIF / SELESAI
      - tahun            : filter by tanggal_pasang year (default: tahun sekarang)
    """

    tahun = request.GET.get('tahun', str(timezone.now().year))
    kabupaten = request.GET.get('kabupaten', '')
    kategori_filter = request.GET.get('kategori', '')
    status_perizinan_filter = request.GET.get('status_perizinan', '')
    pelanggaran_filter = request.GET.get('pelanggaran', '')
    status_sanksi_filter = request.GET.get('status_sanksi', '')

    # Base queryset reklame
    reklame_qs = Reklame.objects.all()

    # Filter tahun
    if tahun:
        reklame_qs = reklame_qs.filter(tanggal_pasang__year=tahun)

    # Filter kategori
    if kategori_filter:
        reklame_qs = reklame_qs.filter(kategori__nama_kategori__icontains=kategori_filter)

    # Filter kabupaten/kota (via zona)
    if kabupaten:
        reklame_qs = reklame_qs.filter(zona__nama_zona__icontains=kabupaten)

    # IDs reklame yang sudah difilter
    reklame_ids = reklame_qs.values_list('id', flat=True)

    # Base perizinan queryset
    perizinan_qs = Perizinan.objects.filter(reklame_id__in=reklame_ids)

    if status_perizinan_filter:
        perizinan_qs = perizinan_qs.filter(status_perizinan__iexact=status_perizinan_filter)

    # ── 1. Summary Cards ─────────────────────────────────
    jumlah_reklame = reklame_qs.count()

    # Status Reklame (field status_reklame di model Reklame)
    status_aktif = reklame_qs.filter(status_reklame__iexact='AKTIF').count()
    status_tidak_aktif = reklame_qs.filter(
        Q(status_reklame__iexact='TIDAK_AKTIF') | Q(status_reklame__isnull=True)
    ).exclude(status_reklame__iexact='AKTIF').count()

    # Pelanggaran — dari perizinan
    tanpa_izin = perizinan_qs.filter(
        Q(status_perizinan__iexact='PENDING') | Q(status_perizinan__iexact='REJECTED')
    ).count()
    zona_larangan_count = reklame_qs.filter(zona__tipe_zona__iexact='LARANGAN').count()

    # Sanksi — aktif/selesai (perizinan EXPIRED = kadaluarsa/sanksi)
    sanksi_aktif = perizinan_qs.filter(status_perizinan__iexact='EXPIRED').count()
    sanksi_selesai = perizinan_qs.filter(status_perizinan__iexact='APPROVED').count()

    # ── 2. Luas Aset & Nilai Perolehan ───────────────────
    total_lokasi = reklame_qs.count()
    # Hitung nilai perolehan: luas_m2 * retribusi_per_m2 per kategori
    total_nilai = 0
    for r in reklame_qs.select_related('kategori').filter(
        luas_m2__isnull=False,
        kategori__retribusi_per_m2__isnull=False
    ):
        total_nilai += float(r.luas_m2) * float(r.kategori.retribusi_per_m2)

    # ── 3. Reklame Tersewa ────────────────────────────────
    tersewa = reklame_qs.filter(status_reklame__iexact='TERSEWA').count()
    belum_tersewa = total_lokasi - tersewa
    pct_tersewa = round((tersewa / total_lokasi * 100), 1) if total_lokasi > 0 else 0

    # ── 4. Grafik Status Pelanggaran (donut) ─────────────
    # Pakai status_perizinan sebagai proxy pelanggaran
    pelanggaran_tanpa_izin = perizinan_qs.filter(
        Q(status_perizinan__iexact='PENDING') | Q(status_perizinan__iexact='REJECTED')
    ).count()
    pelanggaran_zona_larangan = reklame_qs.filter(zona__tipe_zona__iexact='LARANGAN').count()
    pelanggaran_kadaluarsa = perizinan_qs.filter(status_perizinan__iexact='EXPIRED').count()
    pelanggaran_sengketa = perizinan_qs.filter(status_perizinan__iexact='DISPUTE').count()

    total_pelanggaran = (
        pelanggaran_tanpa_izin + pelanggaran_zona_larangan +
        pelanggaran_kadaluarsa + pelanggaran_sengketa
    )
    pct_pelanggaran = round((pelanggaran_tanpa_izin / total_pelanggaran * 100), 1) if total_pelanggaran > 0 else 0

    # ── 5. Jumlah Aset Per Kota (bar chart) ──────────────
    # Group by zona nama_zona
    per_zona = (
        reklame_qs
        .values('zona__nama_zona')
        .annotate(
            jumlah_aset=Count('id'),
            bersertifikat=Count('id', filter=Q(
                id__in=Perizinan.objects.filter(
                    status_perizinan__iexact='APPROVED'
                ).values('reklame_id')
            )),
        )
        .order_by('-jumlah_aset')[:10]
    )

    chart_per_kota = []
    for z in per_zona:
        nama = z['zona__nama_zona'] or 'Tidak Diketahui'
        jumlah = z['jumlah_aset']
        bersertifikat = z['bersertifikat']
        # "Diproses" = pending
        diproses = Perizinan.objects.filter(
            reklame__zona__nama_zona=nama,
            status_perizinan__iexact='PENDING',
            reklame_id__in=reklame_ids
        ).count()
        chart_per_kota.append({
            'nama': nama,
            'jumlah_aset': jumlah,
            'bersertifikat': bersertifikat,
            'diproses': diproses,
        })

    # ── 6. Filter Options (untuk dropdown) ───────────────
    kabupaten_options = list(
        ZonaTataRuang.objects.values_list('nama_zona', flat=True).distinct().order_by('nama_zona')
    )
    kategori_options = list(
        ReklameKategori.objects.values_list('nama_kategori', flat=True).distinct().order_by('nama_kategori')
    )

    return Response({
        # Summary cards
        'jumlah_reklame': jumlah_reklame,
        'status_reklame': {
            'aktif': status_aktif,
            'tidak_aktif': status_tidak_aktif,
        },
        'pelanggaran': {
            'tanpa_izin': tanpa_izin,
            'zona_larangan': zona_larangan_count,
        },
        'jumlah_sanksi': {
            'aktif': sanksi_aktif,
            'selesai': sanksi_selesai,
        },
        # Luas & nilai
        'luas_aset': {
            'total_lokasi': total_lokasi,
            'total_nilai_perolehan': total_nilai,
        },
        # Tersewa
        'reklame_tersewa': {
            'tersewa': tersewa,
            'belum_tersewa': belum_tersewa,
            'persen': pct_tersewa,
            'total': total_lokasi,
        },
        # Donut chart
        'grafik_pelanggaran': {
            'tanpa_izin': pelanggaran_tanpa_izin,
            'zona_larangan': pelanggaran_zona_larangan,
            'kadaluarsa': pelanggaran_kadaluarsa,
            'sengketa': pelanggaran_sengketa,
            'persen_tanpa_izin': pct_pelanggaran,
        },
        # Bar chart
        'chart_per_kota': chart_per_kota,
        # Filter options
        'filter_options': {
            'kabupaten': kabupaten_options,
            'kategori': kategori_options,
            'status_perizinan': ['APPROVED', 'PENDING', 'REJECTED', 'EXPIRED', 'DISPUTE'],
            'pelanggaran': ['TANPA_IZIN', 'ZONA_LARANGAN'],
            'status_sanksi': ['AKTIF', 'SELESAI'],
            'tahun': [str(y) for y in range(2020, timezone.now().year + 2)],
        }
    })


# ─── Laporan Masyarakat ViewSet ────────────────────────────

class LaporanMasyarakatViewSet(viewsets.ModelViewSet):
    """
    POST   /api/laporan-masyarakat/  → Publik (AllowAny)
    GET    /api/laporan-masyarakat/  → Admin (IsAuthenticated)
    PATCH  /api/laporan-masyarakat/<id>/  → Admin
    DELETE /api/laporan-masyarakat/<id>/  → Admin
    """
    queryset = LaporanMasyarakat.objects.all().order_by('-created_at')
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return LaporanMasyarakatCreateSerializer
        return LaporanMasyarakatSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ─── Laporan Masyarakat Statistics ────────────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def laporan_stats(request):
    """
    GET /api/laporan-masyarakat/stats/
    Statistik laporan masyarakat untuk infografis.
    """
    qs = LaporanMasyarakat.objects.all()

    total = qs.count()
    pending = qs.filter(status_laporan='PENDING').count()
    diproses = qs.filter(status_laporan='DIPROSES').count()
    selesai = qs.filter(status_laporan='SELESAI').count()

    # Per kategori
    per_kategori = list(
        qs.values('kategori_laporan')
          .annotate(jumlah=Count('id'))
          .order_by('-jumlah')
    )

    # Per kecamatan
    per_kecamatan = list(
        qs.exclude(kecamatan__isnull=True)
          .exclude(kecamatan__exact='')
          .values('kecamatan')
          .annotate(jumlah=Count('id'))
          .order_by('-jumlah')[:15]
    )

    # Per bulan (12 bulan terakhir)
    from django.db.models.functions import TruncMonth
    per_bulan = list(
        qs.annotate(bulan=TruncMonth('created_at'))
          .values('bulan')
          .annotate(jumlah=Count('id'))
          .order_by('bulan')
    )
    # Format bulan ke string
    per_bulan_formatted = []
    for item in per_bulan:
        if item['bulan']:
            per_bulan_formatted.append({
                'bulan': item['bulan'].strftime('%Y-%m'),
                'jumlah': item['jumlah'],
            })

    return Response({
        'total': total,
        'status': {
            'pending': pending,
            'diproses': diproses,
            'selesai': selesai,
        },
        'per_kategori': per_kategori,
        'per_kecamatan': per_kecamatan,
        'per_bulan': per_bulan_formatted,
        'kategori_options': [c[0] for c in LaporanMasyarakat.KATEGORI_CHOICES],
        'kecamatan_options': list(
            qs.exclude(kecamatan__isnull=True)
              .exclude(kecamatan__exact='')
              .values_list('kecamatan', flat=True)
              .distinct()
              .order_by('kecamatan')
        ),
    })

# ─── Auth ──────────────────────────────────────────────────

import bcrypt
import logging
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_admin(request):
    """
    POST /api/auth/login/
    Menerima username/email dan password, memverifikasi bcrypt,
    lalu mengembalikan access token dan refresh token.
    """
    identifier = (
        request.data.get('identifier')
        or request.data.get('email')
        or request.data.get('nama_lengkap')
        or ''
    ).strip()
    password = request.data.get('password', '')

    if not identifier or not password:
        return Response(
            {'detail': 'Username/email dan password wajib diisi.'},
            status=drf_status.HTTP_400_BAD_REQUEST,
        )

    # Pertahankan perilaku proyek lama: login dapat memakai email
    # maupun nama lengkap/username.
    user = Users.objects.filter(email__iexact=identifier).first()
    if user is None:
        user = Users.objects.filter(nama_lengkap__iexact=identifier).first()

    if user is None or not user.is_active or not user.password_hash:
        return Response(
            {'detail': 'Kredensial tidak valid'},
            status=drf_status.HTTP_401_UNAUTHORIZED,
        )

    try:
        is_valid = bcrypt.checkpw(
            password.encode('utf-8'),
            user.password_hash.encode('utf-8'),
        )
    except (TypeError, ValueError) as exc:
        logger.warning('Format password_hash user %s tidak valid: %s', user.id, exc)
        is_valid = False

    if not is_valid:
        return Response(
            {'detail': 'Kredensial tidak valid'},
            status=drf_status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': str(user.id),
            'nama_lengkap': user.nama_lengkap,
            'email': user.email,
        },
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """
    POST /api/auth/change-password/
    Mengubah password admin. Membutuhkan jwt auth token.
    """
    old_password = request.data.get('oldPassword')
    new_password = request.data.get('newPassword')
    confirm_password = request.data.get('confirmPassword')

    if not old_password or not new_password or not confirm_password:
        return Response({'success': False, 'message': 'Password lama, password baru, dan ulangi password wajib diisi.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    if new_password != confirm_password:
        return Response({'success': False, 'message': 'Password baru dan ulangi password tidak sama.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    if old_password == new_password:
        return Response({'success': False, 'message': 'Password baru tidak boleh sama dengan password lama.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    user = request.user

    if not user.password_hash:
        return Response({'success': False, 'message': 'Password user belum tersedia di database.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    try:
        is_valid = bcrypt.checkpw(old_password.encode('utf-8'), user.password_hash.encode('utf-8'))
    except Exception:
        is_valid = False

    if not is_valid:
        return Response({'success': False, 'message': 'Password lama salah.'}, status=drf_status.HTTP_400_BAD_REQUEST)

    # Hash new password
    salt = bcrypt.gensalt(12)
    new_password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt).decode('utf-8')

    # Update database
    user.password_hash = new_password_hash
    user.save()

    return Response({
        'success': True,
        'message': 'Password berhasil diubah. Silakan login ulang.'
    })