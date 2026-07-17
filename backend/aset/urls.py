# ============================================================
# FILE: backend/aset/urls.py
# ============================================================

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'kategori', views.ReklameKategoriViewSet)
router.register(r'zona', views.ZonaTataRuangViewSet)
router.register(r'users', views.UsersViewSet)
router.register(r'reklame', views.ReklameViewSet)
router.register(r'perizinan', views.PerizinanViewSet)
router.register(r'dokumen', views.DokumenReklameViewSet)
router.register(r'foto', views.FotoReklameViewSet)
router.register(r'laporan-masyarakat', views.LaporanMasyarakatViewSet)

urlpatterns = [
    # ── Laporan Masyarakat statistics (MUST be before router.urls to avoid pk clash) ──
    path('laporan-masyarakat/stats/', views.laporan_stats, name='laporan-stats'),
    
    # ── Auth ──
    path('auth/login/', views.login_admin, name='auth-login'),
    path('auth/change-password/', views.change_password, name='auth-change-password'),
    
    path('', include(router.urls)),
    # ── Filter options untuk dropdown Manajemen Reklame ──
    path('reklame-filter-options/', views.reklame_filter_options, name='reklame-filter-options'),
    # ── Infografis statistics ──
    path('infografis/', views.infografis_stats, name='infografis-stats'),
]