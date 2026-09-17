@echo off
cls
echo ==========================================
echo Configurando entorno para Ciszupy...
echo ==========================================

:: 1. Verificar si uv esta instalado
python -m uv --version >nul 2>&1
if errorlevel 1 (
    echo [AVISO] uv no esta instalado. Instalandolo...
    python -m pip install uv
)

:: 2. Crear entorno virtual (.venv) si no existe
if not exist ".venv" (
    echo [AVISO] Creando entorno virtual (.venv)...
    python -m venv .venv
)

:: 3. Activar el entorno virtual
echo [AVISO] Activando entorno virtual...
call .venv\Scripts\activate.bat

:: 4. Instalar dependencias si existe el archivo
if exist "requirements.txt" (
    echo [AVISO] Instalando dependencias...
    uv pip install -r requirements.txt
)

:: 5. Instalar paquete local
echo [AVISO] Instalando Ciszupy localmente...
uv pip install -e .

echo ==========================================
echo ¡Instalacion completada con exito!
echo ==========================================
pause
