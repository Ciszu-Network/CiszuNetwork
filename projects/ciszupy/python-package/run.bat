@echo off
setlocal enabledelayedexpansion
cls
title CiszuPY - Interactive Console

:: 1. Check if virtual environment exists
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment .venv not found.
    echo Run install.bat first before testing the app.
    pause
    exit /b 1
)

:: 2. Activate the virtual environment
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment.
    pause
    exit /b 1
)

:menu
cls
echo ==========================================
echo        CISZUPY - TEST PANEL
echo ==========================================
echo  [1] Run ciszupy (Credits / Default)
echo  [2] Show help (--help)
echo  [3] Test: ciszupy profesor
echo  [4] Test: ciszupy papa
echo  [5] Test: ciszupy mama
echo  [6] Test: ciszupy helloworldmemetest
echo  [7] Custom command...
echo  [8] Exit
echo ==========================================
echo.

set /p "opcion=Choose an option (1-8): "

if "%opcion%"=="1" (
    echo.
    ciszupy
    echo.
    pause
    goto menu
)
if "%opcion%"=="2" (
    echo.
    ciszupy --help
    echo.
    pause
    goto menu
)
if "%opcion%"=="3" (
    echo.
    ciszupy profesor
    echo.
    pause
    goto menu
)
if "%opcion%"=="4" (
    echo.
    ciszupy papa
    echo.
    pause
    goto menu
)
if "%opcion%"=="5" (
    echo.
    ciszupy mama
    echo.
    pause
    goto menu
)
if "%opcion%"=="6" (
    echo.
    ciszupy helloworldmemetest
    echo.
    pause
    goto menu
)
if "%opcion%"=="7" (
    echo.
    echo Write the full command you want to test.
    echo Example: ciszupy --help
    echo.
    set /p "custom_cmd=Command: "
    echo.
    echo ------------------------------------------
    call !custom_cmd!
    echo ------------------------------------------
    echo.
    pause
    goto menu
)
if "%opcion%"=="8" (
    goto salir
)

echo.
echo Invalid option. Try again.
pause
goto menu

:salir
echo.
echo Exiting test console...
pause
