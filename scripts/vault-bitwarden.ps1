# vault-bitwarden.ps1 — Sube el vault local (services/supabase/.env) a Bitwarden.
#
# Crea/actualiza un item tipo "secure note" con TODO el contenido del vault
# (nombre por defecto: "Ciszu Network Vault (.env)") y hace sync. Así el vault
# cifrado local queda reflejado en Bitwarden con un solo comando.
#
# Uso:
#   .\scripts\vault-bitwarden.ps1                 # usa BW_SESSION o pide unlock
#   $env:BW_SESSION = "..." ; .\scripts\vault-bitwarden.ps1
#   pnpm vault:bw                                  # alias
#
# Requisitos: Bitwarden CLI (bw) y vault local presente.

param(
    [string]$ItemName = "Ciszu Network Vault (.env)"
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$vault = Join-Path $repo 'services\supabase\.env'

if (-not (Test-Path -LiteralPath $vault)) { throw "No existe el vault: $vault" }

# ---------- 1. Sesión de Bitwarden ----------
$session = $env:BW_SESSION
if ([string]::IsNullOrWhiteSpace($session)) {
    Write-Host "Bitwarden bloqueado. Pidiendo la master password (bw unlock --raw)..."
    $unlockOut = bw unlock --raw 2>&1
    $session = ($unlockOut | Select-Object -Last 1)
    if ([string]::IsNullOrWhiteSpace($session) -or $session -match 'Vault is locked|Master password') {
        throw "No se pudo desbloquear Bitwarden (revisa la master password)."
    }
}

# ---------- 2. Leer el vault ----------
$content = Get-Content -LiteralPath $vault -Raw
Write-Host "[vault-bw] Subiendo $vault ($($content.Length) chars) a Bitwarden..."

# ---------- 3. Buscar item existente ----------
$existing = $null
try {
    $list = bw list items --search $ItemName --session $session 2>$null | ConvertFrom-Json
    $existing = @($list) | Where-Object { $_.name -eq $ItemName } | Select-Object -First 1
} catch { }

if ($existing) {
    $item = bw get item $existing.id --session $session | ConvertFrom-Json
    $item.notes = $content
    $encoded = ($item | ConvertTo-Json -Depth 12) | bw encode
    $encoded | bw edit item $existing.id --session $session | Out-Null
    Write-Host "[vault-bw] Item ACTUALIZADO: '$ItemName' (id $($existing.id))"
} else {
    $obj = @{
        type       = 2
        name       = $ItemName
        notes      = $content
        secureNote = @{ type = 0 }
    }
    $encoded = ($obj | ConvertTo-Json -Depth 6) | bw encode
    $created = $encoded | bw create item --session $session | ConvertFrom-Json
    Write-Host "[vault-bw] Item CREADO: '$ItemName' (id $($created.id))"
}

# ---------- 4. Sync para que suba al servidor ----------
bw sync --session $session | Out-Null
Write-Host "[vault-bw] Sync OK. Vault reflejado en Bitwarden."