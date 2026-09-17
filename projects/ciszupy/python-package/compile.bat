@echo off
echo ==========================================
echo Compilando nueva version de CiszuPY...
echo ==========================================

pyinstaller --onedir --icon="public/images/icon.ico" --version-file="file_version_info.txt" --console --hidden-import=typer --hidden-import=rich --hidden-import=keyboard --hidden-import=modules --hidden-import=core --paths=src src/main.py --name ciszupy --clean

echo ==========================================
echo ¡Compilacion finalizada! Revisa la carpeta dist/
echo ==========================================
pause
