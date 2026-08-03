$ErrorActionPreference = 'Stop'
$root = 'E:\Ciszu Network'
$utf8 = New-Object System.Text.UTF8Encoding($false)

$tracked = git -C $root ls-files

$exclude = '\.(png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|mp3|mp4|ogg|zip|rar|7z|exe|pdf|docx|psd|ai|jar)$'

$targets = @()
foreach ($f in $tracked) {
  if ($f -match '^(projects/|packages/cdn/|scripts/|\.github/|AGENTS\.md$|README\.md$|\.gitignore$|\.dockerignore$|\.semgrepignore$|asset-config\.json$|docker-compose\.yml$|pnpm-workspace\.yaml$|tsconfig\.base\.json$|\.vercelignore$)') {
    if ($f -notmatch $exclude) { $targets += $f }
  }
}

$count = 0
foreach ($f in $targets) {
  $path = Join-Path $root $f
  if (-not (Test-Path -LiteralPath $path)) { Write-Output "SKIP (no existe): $f"; continue }
  $text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
  $orig = $text
  $text = $text.Replace('apps/muzicmania', 'projects/muzicmania')
  $text = $text.Replace('apps/ciszubot', 'projects/ciszubot')
  $text = $text.Replace('apps/ciszukoantony', 'projects/ciszukoantony')
  $text = $text.Replace('apps/website', 'projects/ciszu/website')
  $text = $text.Replace('apps/', 'projects/')
  if ($text -ne $orig) {
    [System.IO.File]::WriteAllText($path, $text, $utf8)
    $count++
  }
}
Write-Output "Modified: $count files"
