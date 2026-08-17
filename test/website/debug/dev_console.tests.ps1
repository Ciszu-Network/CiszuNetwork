# dev_console.tests.ps1 - pruebas locales de la consola dev (sin Pester)
# Uso: powershell -NoProfile -ExecutionPolicy Bypass -File test\website\debug\dev_console.tests.ps1
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'dev_console.ps1'
$failed = $false

Write-Host "== Tests dev_console.ps1 =="

# 1. Sintaxis / parseo sin errores
$tokens = $null; $errors = $null
$null = [System.Management.Automation.Language.Parser]::ParseFile($script, [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) {
    Write-Host "[FALLO] sintaxis: $($errors.Count) errores" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  L$($_.Extent.StartLineNumber): $($_.Message)" }
    $failed = $true
} else {
    Write-Host "[OK] sintaxis valida"
}

# 2. BOM UTF-8 (necesario para emojis en PS 5.1)
$bom = [System.IO.File]::ReadAllBytes($script)[0..2]
if ($bom[0] -eq 239 -and $bom[1] -eq 187 -and $bom[2] -eq 191) {
    Write-Host "[OK] BOM UTF-8 presente"
} else {
    Write-Host "[FALLO] BOM UTF-8 ausente ($($bom -join ',')) - los emojis saldran rotos" -ForegroundColor Red
    $failed = $true
}

# 3. SelfTest integrado (validaciones deterministicas de estado/funciones)
$out = & powershell -NoProfile -ExecutionPolicy Bypass -File $script -SelfTest
$selftestExit = $LASTEXITCODE
if ($selftestExit -eq 0) {
    Write-Host "[OK] SelfTest interno (exit 0)"
} else {
    Write-Host "[FALLO] SelfTest interno exit=$selftestExit" -ForegroundColor Red
    $out | ForEach-Object { Write-Host "  $_" }
    $failed = $true
}

# 4. Modo Demo arranca sin error (muestra estado)
$demoOut = & powershell -NoProfile -ExecutionPolicy Bypass -File $script -Demo
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Modo Demo (exit 0)"
} else {
    Write-Host "[FALLO] Modo Demo exit=$LASTEXITCODE" -ForegroundColor Red
    $failed = $true
}

# 5. CLI status devuelve lineas para las 4 webs
$cliOut = & powershell -NoProfile -ExecutionPolicy Bypass -File $script -Action status
if (($cliOut | Measure-Object).Count -ge 4) {
    Write-Host "[OK] CLI status imprime las 4 webs"
} else {
    Write-Host "[FALLO] CLI status: se esperaban 4 lineas" -ForegroundColor Red
    $failed = $true
}

Write-Host ""
if ($failed) {
    Write-Host "RESULTADO: FALLIDO" -ForegroundColor Red
    exit 1
}
Write-Host "RESULTADO: TODOS LOS TESTS OK" -ForegroundColor Green
exit 0