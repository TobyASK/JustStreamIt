@echo off
REM Script de lancement du frontend JustStreamIt
REM Lance un serveur web sur le port 3000

echo ========================================
echo   JustStreamIt - Frontend Server
echo ========================================
echo.

REM Vérifier si on est dans le bon répertoire
if not exist "index.html" (
    echo Erreur: index.html non trouvé
    echo Assurez-vous de lancer ce script depuis le répertoire juststreamit-frontend
    pause
    exit /b 1
)

echo Lancement du serveur frontend sur http://localhost:3000...
echo.
echo Notes:
echo   - Appuyez sur CTRL+C pour arrêter le serveur
echo   - Le backend Django doit tourner sur http://localhost:8000
echo.

python server.py

pause
