@echo off
cls
echo ==========================================
echo Configuring Ciszupy environment...
echo ==========================================

:: 1. Check if uv is installed
python -m uv --version >nul 2>&1
if errorlevel 1 goto install_uv
echo [OK] uv detected.
goto check_venv

:install_uv
echo [INFO] uv not found. Installing...
python -m pip install uv
if errorlevel 1 (
    echo [ERROR] Failed to install uv.
    pause
    exit /b 1
)
echo [OK] uv installed.

:: 2. Create virtual environment (.venv) if it does not exist
:check_venv
if exist ".venv\Scripts\python.exe" (
    echo [OK] Virtual environment found.
    goto activate_venv
)
echo [INFO] Creating virtual environment (.venv)...
python -m venv .venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment.
    pause
    exit /b 1
)
echo [OK] Virtual environment created.

:: 3. Activate the virtual environment
:activate_venv
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

:: 4. Upgrade pip in the virtual environment
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

:: 5. Install dependencies if requirements.txt exists
if exist "requirements.txt" (
    echo [INFO] Installing dependencies from requirements.txt...
    uv pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo [INFO] requirements.txt not found, installing direct dependencies...
    uv pip install typer rich keyboard
    if errorlevel 1 (
        echo [ERROR] Failed to install direct dependencies.
        pause
        exit /b 1
    )
)

:: 6. Install local package in editable mode
echo [INFO] Installing Ciszupy locally in editable mode...
uv pip install -e .
if errorlevel 1 (
    echo [ERROR] Failed to install local package.
    pause
    exit /b 1
)

echo ==========================================
echo Installation completed successfully!
echo ==========================================
pause
