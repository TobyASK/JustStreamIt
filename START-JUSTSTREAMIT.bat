@echo off
echo ========================================
echo   JustStreamIt - Lancement
echo ========================================
echo.

echo Activation de l'environnement virtuel...
call .\env\Scripts\activate

echo.
echo Lancement du serveur Django (port 8000)...
echo.

python manage.py runserver 8000

echo.
echo Serveur arrêté.
pause
