# Fusion checks for ciszukoantony merge
$ErrorActionPreference = 'Continue'

Write-Output "=== 1. content: apps ⊆ raiz? (hash compare) ==="
$raiz = "ciszukoantony\content"
$apps = "apps\ciszukoantony\content"
$missing = @()
$diff = @()
$same = 0
Get-ChildItem $apps -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring((Resolve-Path $apps).Path.Length + 1)
  $rPath = Join-Path $raiz $rel
  if (-not (Test-Path $rPath)) { $missing += $rel }
  else {
    $ha = (Get-FileHash $_.FullName).Hash
    $hb = (Get-FileHash $rPath).Hash
    if ($ha -eq $hb) { $same++ } else { $diff += $rel }
  }
}
Write-Output "apps files: $((Get-ChildItem $apps -Recurse -File | Measure-Object).Count)"
Write-Output "identicos en raiz: $same"
Write-Output "faltantes en raiz: $($missing.Count)"
$missing | Select-Object -First 10 | ForEach-Object { Write-Output "  FALTA: $_" }
Write-Output "difieren: $($diff.Count)"
$diff | Select-Object -First 10 | ForEach-Object { Write-Output "  DIFF: $_" }

Write-Output ""
Write-Output "=== 2. docs duplicados (STATUS, TO_DO_LIST) fecha/hash ==="
foreach($n in @("STATUS.md","TO_DO_LIST.md")){
  $a = "ciszukoantony\docs\ia_docs\$n"; $b = "apps\ciszukoantony\docs\ia_docs\$n"
  if ((Test-Path $a) -and (Test-Path $b)) {
    $da = (Get-Item $a).LastWriteTime; $db = (Get-Item $b).LastWriteTime
    $ha = (Get-FileHash $a).Hash; $hb = (Get-FileHash $b).Hash
    Write-Output "$n raiz($(($da).ToString('yyyy-MM-dd HH:mm')) len=$(Get-Item $a | Select-Object -ExpandProperty Length)) vs apps($(($db).ToString('yyyy-MM-dd HH:mm')) len=$(Get-Item $b | Select-Object -ExpandProperty Length)) hashEqual=$($ha -eq $hb)"
  }
}

Write-Output ""
Write-Output "=== 3. configs sueltos raiz apps/ciszukoantony vs website/ ==="
foreach($f in @("eslint.config.mjs","next.config.ts","tsconfig.json","vercel.json","postcss.config.mjs","tailwind.config.mjs","README.md","LICENSE","LICENSE.md","next-env.d.ts")){
  $a = "apps\ciszukoantony\$f"; $b = "apps\ciszukoantony\website\$f"
  if ((Test-Path $a) -and (Test-Path $b)) {
    $ha = (Get-FileHash $a).Hash; $hb = (Get-FileHash $b).Hash
    $da = (Get-Item $a).LastWriteTime; $db = (Get-Item $b).LastWriteTime
    Write-Output "$f iguales=$($ha -eq $hb) raiz=$(($da).ToString('yyyy-MM-dd')) appsweb=$(($db).ToString('yyyy-MM-dd'))"
  } elseif (Test-Path $a) { Write-Output "$f SOLO en raiz" } else { Write-Output "$f SOLO en website" }
}

Write-Output ""
Write-Output "=== 4. music: ciszukoantony-music vs apps/music ==="
Write-Output "raiz ciszukoantony-music:"
Get-ChildItem "ciszukoantony\ciszukoantony-music" -Recurse | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\ciszukoantony\','') } | Select-Object -First 12
Write-Output "apps music:"
Get-ChildItem "apps\ciszukoantony\music" -Recurse | ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\apps\ciszukoantony\','') } | Select-Object -First 12
