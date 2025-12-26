#!/usr/bin/env python3
"""
Serveur web léger pour servir le frontend JustStreamIt
Lance le frontend sur http://localhost:3000
Le backend doit être lancé sur http://localhost:8000
"""

import http.server
import socketserver
import sys
from pathlib import Path

# Port pour le frontend
PORT = 3000

# Répertoire du frontend
FRONTEND_DIR = Path(__file__).parent


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler personnalisé pour servir les fichiers du frontend"""

    def __init__(self, *args, **kwargs):
        # Changer le répertoire de travail vers le frontend
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def end_headers(self):
        """Ajouter des headers pour éviter les erreurs CORS et le caching"""
        # Permettre les requêtes cross-origin vers le backend
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, max-age=0'
        )
        super().end_headers()

    def do_GET(self):
        """Servir index.html par défaut pour les routes non trouvées"""
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()


def run_server():
    """Lancer le serveur web"""
    handler = MyHTTPRequestHandler

    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            print("=" * 60)
            print("  JustStreamIt - Serveur Frontend")
            print("=" * 60)
            print()
            print(f"✅ Serveur lancé sur http://localhost:{PORT}")
            print()
            print("📝 Instructions:")
            print("   1. Ouvrir http://localhost:{PORT} dans un navigateur")
            print("   2. Le backend Django doit tourner sur "
                  "http://localhost:8000")
            print("   3. Appuyer sur CTRL+C pour arrêter le serveur")
            print()
            print("=" * 60)
            print()

            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n✋ Serveur arrêté.")
        sys.exit(0)
    except OSError as e:
        print(f"\n❌ Erreur: {e}")
        print(f"   Le port {PORT} est peut-être déjà utilisé.")
        sys.exit(1)


if __name__ == "__main__":
    run_server()
