@echo off
echo ==========================================
echo Compilando nueva version de CiszuPY...
echo ==========================================

pyinstaller --onedir --icon="public/images/icon.ico" --version-file="file_version_info.txt" --console --hidden-import=ciszupy --hidden-import=ciszupy.modules --hidden-import=typer --hidden-import=rich --hidden-import=keyboard --paths=src src/ciszupy/main.py --name ciszupy --clean

echo ==========================================
echo ¡Compilacion finalizada! Revisa la carpeta dist/
echo ==========================================
pause
