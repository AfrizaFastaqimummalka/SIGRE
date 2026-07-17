from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from aset.views import CustomTokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('aset.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
