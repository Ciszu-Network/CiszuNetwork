param(
  [switch]$SkipCdn
)

Write-Host "=== Ciszu Network - Setup ===" -ForegroundColor Cyan
Write-Host ""

# 1. Install dependencies
Write-Host "[1/3] Instalando dependencias..." -ForegroundColor Yellow
pnpm install
if (-not $?) {
  Write-Host "[ERR] pnpm install fallo" -ForegroundColor Red
  exit 1
}

# 2. Download CDN assets if not skipped
if (-not $SkipCdn) {
  Write-Host "[2/3] Descargando assets desde CDN..." -ForegroundColor Yellow
  $cdnBase = "https://obwzzmbvkrcscqwptlqo.supabase.co/storage/v1/object/public/ciszu-cdn"
  $criticalAssets = @(
    "tagline_black.svg",
    "tagline_white.svg",
    "images/outline/isotype/color/ciszuko_logo_isotipo_outline_zcolor_ccolor.svg"
  )

  foreach ($asset in $criticalAssets) {
    $url = "$cdnBase/projects/ciszukoantony/content/logos/$asset"
    $dest = Join-Path (Get-Location) "projects/ciszukoantony/content/logos/$asset"
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) {
      New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    try {
      Invoke-WebRequest -Uri $url -OutFile $dest -ErrorAction Stop
      Write-Host "  [OK] $asset" -ForegroundColor Green
    } catch {
      Write-Host "  [!] $asset no disponible (CDN sin upload aun?)" -ForegroundColor DarkYellow
    }
  }
} else {
  Write-Host "[2/3] CDN skip (usa --SkipCdn)" -ForegroundColor DarkYellow
}

# 3. Copy critical assets to apps
Write-Host "[3/3] Copiando assets criticos a las apps..." -ForegroundColor Yellow
node scripts/copy-assets.js

Write-Host ""
Write-Host "=== Setup completo ===" -ForegroundColor Green
Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host "  pnpm cdn:upload     - Subir assets locales al CDN"
Write-Host "  pnpm web:dev        - Desarrollar ciszunetwork"
Write-Host "  pnpm antony:dev     - Desarrollar ciszukoantony"
Write-Host "  pnpm muzicmania:dev - Desarrollar muzicmania"
Write-Host "  pnpm bot:dev        - Desarrollar ciszubot"
