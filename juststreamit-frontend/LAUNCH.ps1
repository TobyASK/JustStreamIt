# JustStreamIt - Script de lancement complet
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   JustStreamIt - Lancement            " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Lancer l'API Django
Write-Host "Lancement API Django (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Toby\Downloads\OCMovies-API-EN-FR-master'; .\env\Scripts\activate; python manage.py runserver 8000"

Start-Sleep -Seconds 5

# Lancer le Frontend  
Write-Host "Lancement Frontend (port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Toby\Downloads\OCMovies-API-EN-FR-master\juststreamit-frontend'; python -m http.server 8000"

Start-Sleep -Seconds 3

# Ouvrir le navigateur
Write-Host "Ouverture navigateur..." -ForegroundColor Yellow
Start-Process "http://127.0.0.1:8000/index.html"

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  Serveurs actifs !" -ForegroundColor Green  
Write-Host "  API:      http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  Frontend: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "=========================================" -ForegroundColor Green
