"""OCMovies-API URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import FileResponse
import os

def serve_frontend(request, path=''):
    """Sert les fichiers du frontend JustStreamIt"""
    if path == '' or path == 'index.html':
        file_path = os.path.join(settings.BASE_DIR, 'juststreamit-frontend', 'index.html')
    else:
        file_path = os.path.join(settings.BASE_DIR, 'juststreamit-frontend', path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(open(file_path, 'rb'))
    
    # Si le fichier n'existe pas, rediriger vers index.html (pour SPA)
    index_path = os.path.join(settings.BASE_DIR, 'juststreamit-frontend', 'index.html')
    return FileResponse(open(index_path, 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/genres/', include('api.v1.genres.urls')),
    path('api/v1/titles/', include('api.v1.titles.urls')),
    
    # Redirection de la racine vers le frontend
    path('', RedirectView.as_view(url='/index.html', permanent=False)),
    
    # Servir les fichiers du frontend
    path('<path:path>', serve_frontend),
]

# En mode DEBUG, servir les fichiers statiques
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'juststreamit-frontend')

