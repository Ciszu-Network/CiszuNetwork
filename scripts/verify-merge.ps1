$ErrorActionPreference = 'Continue'
$dest = "projects\ciszukoantony\content"
$srcs = @("ciszukoantony\content", "apps\ciszukoantony\content")

Write-Output "=== Verificacion union content ==="
$missing = @()
foreach ($src in $srcs) {
  Get-ChildItem $src -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring((Resolve-Path $src).Path.Length + 1)
    if (-not (Test-Path (Join-Path $dest $rel))) { $script:missing += "$src :: $rel" }
  }
}
Write-Output "faltantes en destino: $($missing.Count)"
$missing | Select-Object -First 20 | ForEach-Object { Write-Output "  FALTA: $_" }

Write-Output ""
Write-Output "=== Conteos ==="
Write-Output "origen raiz: $((Get-ChildItem $srcs[0] -Recurse -File | Measure-Object).Count)"
Write-Output "origen apps: $((Get-ChildItem $srcs[1] -Recurse -File | Measure-Object).Count)"
Write-Output "destino:     $((Get-ChildItem $dest -Recurse -File | Measure-Object).Count)"

Write-Output ""
Write-Output "=== archivos unicos de apps (para confirmar que estan) ==="
$raizRel = Get-ChildItem $srcs[0] -Recurse -File | ForEach-Object { $_.FullName.Substring((Resolve-Path $srcs[0]).Path.Length + 1) }
$appsRel = Get-ChildItem $srcs[1] -Recurse -File | ForEach-Object { $_.FullName.Substring((Resolve-Path $srcs[1]).Path.Length + 1) }
$onlyApps = $appsRel | Where-Object { $_ -notin $raizRel }
Write-Output "unicos de apps ($($onlyApps.Count)):"
$onlyApps | ForEach-Object { Write-Output "  $_" }
