$ErrorActionPreference = 'Continue'
Write-Output "=== Verificacion union docs ==="
$dest = "projects\ciszukoantony\docs"
$srcs = @("ciszukoantony\docs", "apps\ciszukoantony\docs")
$missing = @()
foreach ($src in $srcs) {
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring((Resolve-Path $src).Path.Length + 1)
    if (-not (Test-Path (Join-Path $dest $rel))) { $script:missing += "$src :: $rel" }
  }
}
Write-Output "faltantes docs: $($missing.Count)"
$missing | ForEach-Object { Write-Output "  FALTA: $_" }
Write-Output "raiz docs: $((Get-ChildItem $srcs[0] -Recurse -File | Measure-Object).Count) / apps: $((Get-ChildItem $srcs[1] -Recurse -File | Measure-Object).Count) / destino: $((Get-ChildItem $dest -Recurse -File | Measure-Object).Count)"

Write-Output ""
Write-Output "=== Verificacion union music ==="
$dest2 = "projects\ciszukoantony\music"
$srcs2 = @("ciszukoantony\ciszukoantony-music", "apps\ciszukoantony\music")
$missing2 = @()
foreach ($src in $srcs2) {
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring((Resolve-Path $src).Path.Length + 1)
    if (-not (Test-Path (Join-Path $dest2 $rel))) { $script:missing2 += "$src :: $rel" }
  }
}
Write-Output "faltantes music: $($missing2.Count)"
$missing2 | ForEach-Object { Write-Output "  FALTA: $_" }
Write-Output "raiz music: $((Get-ChildItem $srcs2[0] -Recurse -File | Measure-Object).Count) / apps music: $((Get-ChildItem $srcs2[1] -Recurse -File | Measure-Object).Count) / destino: $((Get-ChildItem $dest2 -Recurse -File | Measure-Object).Count)"
