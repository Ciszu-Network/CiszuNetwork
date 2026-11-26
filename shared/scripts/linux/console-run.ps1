param(
  [Parameter(Mandatory = $true)][string]$Target,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$Rest
)

$compat = Join-Path $PSScriptRoot '..\..\powershell\PlatformCompat.ps1'
if (Test-Path -LiteralPath $compat) {
  . $compat
}

if (-not (Test-Path -LiteralPath $Target)) {
  Write-Error "No existe el script: $Target"
  exit 1
}

# Splatting un $null escalar agrega un argumento '$null' y rompe los scripts
# que no aceptan posicionales (pwsh/Linux). Ademas, `pwsh -File` entrega los
# argumentos con guion como texto: se reconstruyen los parametros nombrados.
$named = @{}
$positional = @()
for ($i = 0; $i -lt $Rest.Count; $i++) {
  $arg = $Rest[$i]
  if ($arg -match '^-([A-Za-z][A-Za-z0-9_]*)$') {
    $name = $Matches[1]
    if ($i + 1 -lt $Rest.Count -and $Rest[$i + 1] -notmatch '^-') {
      $named[$name] = $Rest[$i + 1]
      $i++
    } else {
      $named[$name] = $true
    }
  } else {
    $positional += $arg
  }
}
if ($named.Count -gt 0) {
  & $Target @named @positional
} elseif ($positional.Count -gt 0) {
  & $Target @positional
} else {
  & $Target
}
exit $LASTEXITCODE
