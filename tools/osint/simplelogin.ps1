# simplelogin.ps1 — Control de SimpleLogin por API (presets Ciszu)
#
# SimpleLogin: gestion de alias de email temporales (anti-spam / privacidad).
# API: https://api.simplelogin.io/  — auth por header `Authentication: <api_key>`.
# La API key se lee del vault: services/supabase/.env -> SIMPLELOGIN_API_KEY
# Documentado en: projects/ciszu/docs/documentation/CIBERSECURITY_SYSTEM.md y OSINT_PROTOCOLS.md
#
# Uso:
#   .\tools\osint\simplelogin.ps1 info          # validar key + datos de la cuenta
#   .\tools\osint\simplelogin.ps1 aliases       # listar aliases
#   .\tools\osint\simplelogin.ps1 options       # dominios/suffix disponibles
#   .\tools\osint\simplelogin.ps1 create <prefijo>   # crear alias custom con el primer suffix libre
#   .\tools\osint\simplelogin.ps1 random              # crear alias aleatorio
#
# Acciones: info | aliases | options | create <prefijo> | random
#
# Nota: NO imprime nunca la API key ni recovery codes por pantalla; solo lee
# la variable del vault y avisa genericamente si falta.

param(
  [Parameter(Mandatory = $true, Position = 0)]
  [ValidateSet('info', 'aliases', 'options', 'create', 'random')]
  [string]$Action,
  [Parameter(Position = 1)]
  [string]$Prefix
)

$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$envFile = Join-Path $repo 'services\supabase\.env'
$base = 'https://api.simplelogin.io'

$key = $null
if (Test-Path $envFile) {
  $m = Select-String -Path $envFile -Pattern '^SIMPLELOGIN_API_KEY=(.+)$'
  if ($m) { $key = $m.Matches[0].Groups[1].Value.Trim('"').Trim("'") }
}
if (-not $key) {
  throw "SIMPLELOGIN_API_KEY no esta en services/supabase/.env (vault). Ejecuta 'vault crypt' tras anadirla."
}

$headers = @{ Authentication = $key }

function Invoke-Slo([string]$Method, [string]$Path, $Body = $null) {
  $params = @{ Uri = $base + $Path; Method = $Method; Headers = $headers; TimeoutSec = 25 }
  if ($null -ne $Body) { $params.ContentType = 'application/json'; $params.Body = $Body }
  Invoke-RestMethod @params
}

switch ($Action) {
  'info' {
    $u = Invoke-Slo 'GET' '/api/user_info'
    Write-Output ("cuenta: " + $u.email)
    Write-Output ("nombre: " + $u.name)
    Write-Output ("premium: " + $u.is_premium)
  }
  'aliases' {
    $page = 0
    do {
      $r = Invoke-Slo 'GET' ("/api/v2/aliases?page_id=$page")
      foreach ($a in $r.aliases) {
        Write-Output ("[" + $a.id + "] " + $a.email + "  enabled=" + $a.enabled + "  fwd=" + $a.nb_forward + "  block=" + $a.nb_block + "  reply=" + $a.nb_reply)
      }
      $page++
    } while ($r.aliases.Count -ge 20)
  }
  'options' {
    $o = Invoke-Slo 'GET' '/api/v5/alias/options'
    Write-Output ("can_create: " + $o.can_create)
    foreach ($s in $o.suffixes) {
      Write-Output ("suffix: " + $s.suffix + "  custom=" + $s.is_custom + "  premium=" + $s.is_premium)
    }
  }
  'create' {
    if (-not $Prefix) { throw "Accion 'create' requiere <prefijo> como segundo argumento." }
    $o = Invoke-Slo 'GET' '/api/v5/alias/options'
    if (-not $o.can_create) { throw "No se pueden crear mas aliases (cuota/modo)." }
    $signed = $o.suffixes[0].signed_suffix
    $body = ConvertTo-Json -InputObject @{ alias_prefix = $Prefix; signed_suffix = $signed }
    $c = Invoke-Slo 'POST' '/api/v3/alias/custom/new' $body
    Write-Output ("alias creado: " + $c.email)
  }
  'random' {
    $c = Invoke-Slo 'POST' '/api/alias/random/new' '{}'
    Write-Output ("alias aleatorio creado: " + $c.email)
  }
}