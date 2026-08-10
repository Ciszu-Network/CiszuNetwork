# vault.ps1 — Gestión del vault de credenciales de Ciszu Network (age)
#
# Protege los .env locales con age (v1.2.1, C:\Users\fplay\Tools\age\).
# Identity: C:\Users\fplay\.ciszu\ciszu-vault-key.txt (ACL fplay+SYSTEM; copia en Bitwarden).
# Doc: projects/ciszu/docs/documentation/VAULT_SEGURIDAD.md
#
# Uso:
#   .\scripts\vault.ps1 crypt          # .env -> .env.age (copia maestra cifrada)
#   .\scripts\vault.ps1 decrypt        # .env.age -> .env (recuperación)
#   .\scripts\vault.ps1 verify         # roundtrip: hash(.env) == hash(descifrado .env.age)
#   .\scripts\vault.ps1 backup         # bundle cifrado de TODOS los .env -> archives/backups/envs/vault-<fecha>.env.age
#   .\scripts\vault.ps1 keygen         # regenera identity (¡solo si se pierde la actual!)
#   .\scripts\vault.ps1 lock-acl       # restringe ACL NTFS de .env/.env.age/key a fplay+SYSTEM
param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('crypt', 'decrypt', 'verify', 'backup', 'keygen', 'lock-acl')]
  [string]$Action
)

$ErrorActionPreference = 'Stop'
$ageExe = 'C:\Users\fplay\Tools\age\age.exe'
$keyFile = 'C:\Users\fplay\.ciszu\ciszu-vault-key.txt'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$vault = Join-Path $repo 'services\supabase\.env'
$vaultAge = "$vault.age"

function Assert-Tools {
  if (-not (Test-Path $ageExe)) { throw "age no encontrado en $ageExe (descargar de github.com/FiloSottile/age/releases)" }
  if (-not (Test-Path $keyFile)) { throw "Identity no encontrada en $keyFile (usar action keygen)" }
}

function Invoke-Age { param([string[]]$Params) & $ageExe @Params; if ($LASTEXITCODE -ne 0) { throw "age falló (exit $LASTEXITCODE)" } }

switch ($Action) {
  'crypt' {
    Assert-Tools
    if (-not (Test-Path $vault)) { throw "No existe $vault" }
    Invoke-Age @('-e', '-i', $keyFile, '-o', $vaultAge, $vault)
    Write-Host "[vault] Cifrado OK -> $vaultAge"
  }
  'decrypt' {
    Assert-Tools
    if (-not (Test-Path $vaultAge)) { throw "No existe $vaultAge" }
    Invoke-Age @('-d', '-i', $keyFile, '-o', $vault, $vaultAge)
    Write-Host "[vault] Descifrado OK -> $vault (borrar con 'Remove-Item' tras su uso si se quiere vault solo-cifrado)"
  }
  'verify' {
    Assert-Tools
    $tmp = Join-Path $env:TEMP 'vault-verify.env'
    try {
      Invoke-Age @('-d', '-i', $keyFile, '-o', $tmp, $vaultAge)
      $h1 = (Get-FileHash $vault -Algorithm SHA256).Hash
      $h2 = (Get-FileHash $tmp -Algorithm SHA256).Hash
      if ($h1 -eq $h2) { Write-Host "[vault] VERIFY OK ($h1)" } else { Write-Host "[vault] MISMATCH: $h1 vs $h2" -ForegroundColor Red }
    } finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
  }
  'backup' {
    Assert-Tools
    $envsDir = Join-Path $repo 'archives\backups\envs'
    $tmpDir = Join-Path $envsDir 'vault-bundle-tmp'
    $zip = "$tmpDir.zip"
    if (Test-Path $tmpDir) { Remove-Item $tmpDir -Recurse -Force }
    New-Item -ItemType Directory -Force -Path "$tmpDir\services\supabase" | Out-Null
    Copy-Item $vault "$tmpDir\services\supabase\.env" -Force
    Copy-Item (Join-Path $repo '.env.local') "$tmpDir\.env.local" -Force -ErrorAction SilentlyContinue
    Copy-Item (Join-Path $repo 'projects\ciszubot\discord-bot\.env') "$tmpDir\ciszubot-bot.env" -Force -ErrorAction SilentlyContinue
    foreach ($w in @('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')) {
      Copy-Item (Join-Path $repo "projects\$w\website\.env.local") "$tmpDir\$w-website.env.local" -Force -ErrorAction SilentlyContinue
    }
    Compress-Archive -Path "$tmpDir\*" -DestinationPath $zip -Force
    $stamp = Get-Date -Format 'yyyy-MM-dd'
    $out = Join-Path $envsDir "vault-$stamp.env.age"
    Invoke-Age @('-e', '-i', $keyFile, '-o', $out, $zip)
    Remove-Item $zip -Force; Remove-Item $tmpDir -Recurse -Force
    Write-Host "[vault] Bundle cifrado OK -> $out"
  }
  'keygen' {
    if (-not (Test-Path $ageExe)) { throw "age no encontrado en $ageExe" }
    if (Test-Path $keyFile) { Write-Host "Ya existe identity: $keyFile (NO regenerar si las copias .age dependen de ella)" -ForegroundColor Yellow }
    New-Item -ItemType Directory -Force -Path (Split-Path $keyFile) | Out-Null
    & (Join-Path (Split-Path $ageExe) 'age-keygen.exe') -o $keyFile
    icacls $keyFile /inheritance:r /grant:r "$env:USERNAME:(F)" "SYSTEM:(F)" | Out-Null
    Write-Host "[vault] Identity regenerada: $keyFile — ¡guardar la copia en Bitwarden y re-cifrar los .env (crypt/backup)!"
  }
  'lock-acl' {
    $targets = @($vault, $vaultAge, $keyFile, (Join-Path $repo '.env.local'), (Join-Path $repo 'archives\backups\envs'))
    foreach ($t in $targets) {
      if (Test-Path $t) {
        icacls $t /inheritance:r /grant:r "$env:USERNAME:(F)" "SYSTEM:(F)" | Out-Null
        Write-Host "[vault] ACL restringida: $t"
      }
    }
  }
}
