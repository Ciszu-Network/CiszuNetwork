# Genera public/favicon.ico en cada website desde el master del favicon actual.
# Uso: powershell -File scripts/generate-favicons.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = 'E:\Ciszu Network'
$antony = (Get-ChildItem -LiteralPath "$root\projects" -Directory | Where-Object { $_.Name -match 'ntony' }).Name

# master = fuente canónica del favicon actual de cada web (mismo look que el metadata icons)
# pad = margen relativo; bg = fondo del cuadrado del icono
$configs = @(
  @{ name = 'ciszu';      master = "$root\projects\ciszu\content\logos\images\outline\isotype\color\ciszu_logo_isotipo_outline_zwhite_ccolor.png"; pub = "$root\projects\ciszu\website\public";     pad = 0.10; bg = '#020308' },
  @{ name = 'antony';     master = "$root\projects\$antony\content\assets\youtube_canal.png";                                               pub = "$root\projects\$antony\website\public";     pad = 0.00; bg = '#000000' },
  @{ name = 'muzicmania'; master = "$root\projects\muzicmania\content\logos\images\not-outline\isotype\gradient\color\muzicmania_logo_isotipo_notoutline_degradado_color.png"; pub = "$root\projects\muzicmania\website\public"; pad = 0.08; bg = '#020308' },
  @{ name = 'ciszubot';   master = "$root\projects\ciszubot\content\logos\images\samples\circle\ciszubot_logo_isotipo_color_circle.png";     pub = "$root\projects\ciszubot\website\public";     pad = 0.00; bg = '#020308' }
)

function New-FaviconIco {
  param([string]$Master, [string]$OutDir, [int]$Size, [double]$Pad, [string]$BgHex)
  if (-not (Test-Path -LiteralPath $Master)) { Write-Warning "SKIP master no existe: $Master"; return }
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
  $bg = [System.Drawing.ColorTranslator]::FromHtml($BgHex)
  $src = [System.Drawing.Image]::FromFile($Master)
  try {
    $bmp = New-Object System.Drawing.Bitmap $Size, $Size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.CompositingQuality = 'HighQuality'
    $g.Clear($bg)

    $scale = [Math]::Min(($Size * (1 - 2 * $Pad)) / $src.Width, ($Size * (1 - 2 * $Pad)) / $src.Height)
    $w = [Math]::Round($src.Width * $scale)
    $h = [Math]::Round($src.Height * $scale)
    $x = [Math]::Round(($Size - $w) / 2)
    $y = [Math]::Round(($Size - $h) / 2)
    $g.DrawImage($src, $x, $y, $w, $h)
    $g.Flush()

    $out = Join-Path $OutDir 'favicon.ico'
    $hicon = $bmp.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hicon)
    $fs = [System.IO.File]::Open($out, [System.IO.FileMode]::Create)
    try { $icon.Save($fs) } finally { $fs.Dispose() }
    $icon.Dispose()
    Write-Host "OK favicon.ico ($($Size)px) -> $out"
  } finally {
    $src.Dispose()
  }
}

foreach ($c in $configs) {
  Write-Host "=== $($c.name) ==="
  New-FaviconIco -Master $c.master -OutDir $c.pub -Size 48 -Pad $c.pad -BgHex $c.bg
}
Write-Host 'Done.'