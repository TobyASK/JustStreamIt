# Script de lancement du frontend JustStreamIt
# Lance un serveur web sur le port 3000

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   JustStreamIt - Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si on est dans le bon répertoire
if (-not (Test-Path "index.html")) {
    Write-Host "Erreur: index.html non trouvé" -ForegroundColor Red
    Write-Host "Assurez-vous de lancer ce script depuis le répertoire juststreamit-frontend" -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer"
    exit 1
}

Write-Host "Lancement du serveur frontend sur http://localhost:3000..." -ForegroundColor Green
Write-Host ""
Write-Host "Notes:" -ForegroundColor Yellow
Write-Host "   - Appuyez sur CTRL+C pour arrêter le serveur"
Write-Host "   - Le backend Django doit tourner sur http://localhost:8000"
Write-Host ""

python server.py
