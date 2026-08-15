<#
.SYNOPSIS
Opera Storybook de @ciszu/ui escribiendo menos. Wrapper sobre pnpm --filter @ciszu/ui.

.EXAMPLE
  .\scripts\storybook.ps1            # sirve (pnpm --filter @ciszu/ui storybook, puerto 6006)
  .\scripts\storybook.ps1 test       # corre las stories como tests (Playwright/Chromium)
  .\scripts\storybook.ps1 watch      # modo watch de los tests de stories
  .\scripts\storybook.ps1 build      # output estatico en packages/ui/storybook-static
  .\scripts\storybook.ps1 chromatic  # publica visual + a11y en Chromatic (nube)
  .\scripts\storybook.ps1 playwright # lanza el navegador de Playwright para inspeccionar
#>

[CmdletBinding()]
param(
    [ValidateSet('run', 'serve', 'test', 'watch', 'build', 'chromatic', 'playwright', 'help')]
    [string]$Action = 'run'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Banner { Write-Host "Storybook @ciszu/ui - $Action" -ForegroundColor Cyan }

# Libera el puerto 6006 si un proceso anterior quedó huérfano (Storybook a veces
# no cierra todos sus hijos al terminar, bloqueando el bind del puerto y
# provocando el UniversalStoreFollowerTimeoutError en el arranque siguiente).
function Clear-StorybookPort {
    param([int]$Port = 6006)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn.OwningProcess | Select-Object -Unique
        foreach ($pid in $pids) {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc -and ($proc.ProcessName -eq 'node' -or $proc.ProcessName -eq 'esbuild')) {
                Write-Host "Puerto $Port ocupado por $($proc.ProcessName) (PID $pid). Finalizado." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 1
    }
}

switch ($Action) {
    'run'       { Clear-StorybookPort 6006; Write-Banner; pnpm --filter @ciszu/ui storybook }
    'serve'     { Clear-StorybookPort 6006; Write-Banner; pnpm --filter @ciszu/ui storybook }
    'test'      { Write-Banner; pnpm --filter @ciszu/ui test:storybook }
    'watch'     { Write-Banner; pnpm --filter @ciszu/ui exec vitest --config vitest.config.mts }
    'build'     { Write-Banner; pnpm --filter @ciszu/ui build-storybook }
    'chromatic' { Write-Banner; pnpm --filter @ciszu/ui chromatic }
    'playwright'{
        Write-Banner
        Write-Host "Abriendo el navegador de Playwright (chromium) para inspeccionar tests..." -ForegroundColor Yellow
        pnpm --filter @ciszu/ui exec vitest --config vitest.config.mts --browser.headless false
    }
    default     {
        Write-Host @"
Uso: .\scripts\storybook.ps1 [accion]

  run|serve      sirve Storybook en http://localhost:6006
  test           corre las stories como tests (Playwright/Chromium)
  watch          modo watch de los tests de stories
  build          build estatico en packages/ui/storybook-static
  chromatic      publica visual+a11y en Chromatic (nube)
  playwright     abre el navegador Playwright para inspeccionar
"@
    }
}