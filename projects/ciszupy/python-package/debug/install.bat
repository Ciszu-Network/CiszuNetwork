@echo off
echo ==========================================
echo Verificando dependencias de entorno...
echo ==========================================

:: Verificar si uv está instalado, si no, instalarlo usando pip
python -m uv --version >nul 2>&1
if errorlevel 1 (
    echo uv no esta instalado. Instalandolo con pip...
    pip install uv
    if errorlevel 1 goto error_uv
)

echo ==========================================
echo Instalando dependencias desde requirements.txt...
echo ==========================================
uv pip install -r requirements.txt
if errorlevel 1 goto error_requirements

echo ==========================================
echo Instalando CiszuPY con uv...
echo ==========================================
uv pip install -e .
if errorlevel 1 goto error_install

:: Si todo sale bien, muestra el mensaje de exito
echo ==========================================
echo ¡Instalacion completada con exito!
echo Ya puedes usar el comando: ciszupy
echo ==========================================
goto fin

:error_uv
echo [ERROR CRITICO] No se pudo instalar 'uv'.
goto fin_error

:error_requirements
echo [ERROR CRITICO] Fallo la instalacion de las dependencias del requirements.txt.
goto fin_error

:error_install
echo [ERROR CRITICO] Fallo la instalacion editable del paquete local. Revisa tu pyproject.toml.
goto fin_error

:fin_error
echo ==========================================
echo [X] La instalacion fallo. Revisa los detalles arriba.
echo ==========================================

:fin
pause
