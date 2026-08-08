# Genera iconos PWA (192/512/maskable) desde los masters de logos
# Uso: powershell -File scripts/generate-pwa-icons.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'E:\Ciszu Network'
$antony = (Get-ChildItem -LiteralPath "$root\projects" -Directory | Where-Object { $_.Name -match 'ntony' }).Name

$configs = @(
  @{ name = 'ciszu';      master = "$root\projects\ciszu\content\logos\images\outline\isotype\color\ciszu_logo_isotipo_outline_zwhite_ccolor.png";      pub = "$root\projects\ciszu\website\public\pwa" },
  @{ name = 'antony';     master = "$root\projects\$antony\content\logos\images\outline\isotype\gradient\color\ciszuko_logo_isotipo_outline_degradado_zwhite_ccolor.png"; pub = "$root\projects\$antony\website\public\pwa" },
  @{ name = 'muzicmania'; master = "$root\projects\muzicmania\content\logos\images\not-outline\isotype\gradient\color\muzicmania_logo_isotipo_notoutline_degradado_color.png"; pub = "$root\projects\muzicmania\website\public\pwa" },
  @{ name = 'ciszubot';   master = "$root\projects\ciszubot\content\logos\images\samples\circle\ciszubot_logo_isotipo_color_circle.png";                   pub = "$root\projects\ciszubot\website\public\pwa" }
)

function Render-Icon {
  param([string]$Master, [string]$OutDir, [int]$Size, [double]$Pad, [string]$Out)
  if (-not (Test-Path -LiteralPath $Master)) { Write-Warning "SKIP master no existe: $Master"; return }
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
  $src = [System.Drawing.Image]::FromFile($Master)
  try {
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.CompositingQuality = 'HighQuality'
    $g.Clear([System.Drawing.Color]::FromArgb(255, 2, 3, 8))

    $scale = [Math]::Min(($Size * (1 - 2 * $Pad)) / $src.Width, ($Size * (1 - 2 * $Pad)) / $src.Height)
    $w = [Math]::Round($src.Width * $scale)
    $h = [Math]::Round($src.Height * $scale)
    $x = [Math]::Round(($Size - $w) / 2)
    $y = [Math]::Round(($Size - $h) / 2)
    $g.DrawImage($src, $x, $y, $w, $h)
    $out = Join-Path $OutDir $Out
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "OK $Out ($Size px)"
  } finally {
    $src.Dispose()
  }
}

foreach ($c in $configs) {
  Write-Host "=== $($c.name) ==="
  Render-Icon -Master $c.master -OutDir $c.pub -Size 512 -Pad 0.08 -Out 'icon-512.png'
  Render-Icon -Master $c.master -OutDir $c.pub -Size 192 -Pad 0.06 -Out 'icon-192.png'
  Render-Icon -Master $c.master -OutDir $c.pub -Size 512 -Pad 0.20 -Out 'icon-maskable-512.png'
}
Write-Host 'Done.'