# Setup Remote Control — Ciszu Network
# Activa el control remoto de la terminal desde el móvil (Tailscale + OpenSSH Server + Termius).
# Ejecutar en PowerShell COMO ADMINISTRADOR (reproducible / re-ejecutable).
#
# Qué hace:
#   1. Instala/verifica OpenSSH Server (winget si falta, mantiene el actual si funciona).
#   2. Arranca sshd, lo deja en Automatic, habilita regla firewall (si falta).
#   3. Repara permisos/owner de host keys y sshd_config con OpenSSHUtils (crítico: el servicio
#      falla con "UNPROTECTED PRIVATE KEY FILE" si owner/permissions no son SYSTEM/Administrators).
#   4. Instala Tailscale (winget) y hace login interactivo (navegador).
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts/setup-remote-control.ps1

$ErrorActionPreference = 'Stop'
$bin = 'C:\Program Files\OpenSSH\sshd.exe'
$progData = 'C:\ProgramData\ssh'

function Write-Step([string]$msg) { Write-Host "`n==> $msg" -ForegroundColor Cyan }

# ---------- 1. OpenSSH Server ----------
Write-Step '1/4 Verificando OpenSSH Server...'
$service = Get-Service -Name sshd -ErrorAction SilentlyContinue
if (-not $service) {
    Write-Host 'No hay servicio sshd. Instalando via winget (Microsoft.OpenSSH.Preview)...' -ForegroundColor Yellow
    winget install --id Microsoft.OpenSSH.Preview --source winget --accept-source-agreements --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) { throw 'winget fallo instalando OpenSSH' }
} else {
    Write-Host "Servicio sshd ya existe ($($service.Status))."
}
if (-not (Test-Path $bin)) {
    # Si el MSI no registro el servicio, registrarlo manualmente
    sc.exe create sshd binPath= "$bin" start= auto 2>&1 | Out-Null
}
if (-not (Test-Path "$progData\sshd_config")) {
    Copy-Item 'C:\Program Files\OpenSSH\sshd_config_default' "$progData\sshd_config" -Force
}

# ---------- 2. Reparar permisos host keys + config (causa del crash-loop 7031) ----------
Write-Step '2/4 Reparando permisos y owner de host keys / sshd_config...'
Import-Module 'C:\Program Files\OpenSSH\OpenSSHUtils.psm1' -Force
foreach ($k in @('ssh_host_ed25519_key', 'ssh_host_rsa_key', 'ssh_host_ecdsa_key')) {
    $f = "$progData\$k"
    if (-not (Test-Path $f)) {
        ssh-keygen -q -t ed25519 -f $f -N '""' | Out-Null
        ssh-keygen -q -t rsa -f "$progData\ssh_host_rsa_key" -N '""' | Out-Null
        ssh-keygen -q -t ecdsa -f "$progData\ssh_host_ecdsa_key" -N '""' | Out-Null
        break
    }
}
foreach ($k in @('ssh_host_ed25519_key', 'ssh_host_rsa_key', 'ssh_host_ecdsa_key')) {
    Repair-SshdHostKeyPermission -FilePath "$progData\$k" -Confirm:$false 2>&1 | ForEach-Object { Write-Host "   $_" }
}
Repair-SshdConfigPermission -FilePath "$progData\sshd_config" -Confirm:$false 2>&1 | ForEach-Object { Write-Host "   $_" }
Repair-ModuliFilePermission -Confirm:$false 2>&1 | ForEach-Object { Write-Host "   $_" }

# ---------- 3. Arrancar servicio ----------
Write-Step '3/4 Arrancando sshd (Automatic)...'
sc.exe failure sshd reset= 0 actions= restart/5000/restart/5000/""/0 2>&1 | Out-Null
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
Start-Sleep -Seconds 3
Get-Service sshd | Select-Object Name, Status, StartType | Format-Table

# Firewall (solo tailnet de Tailscale no necesita puerto, pero la regla local es inofensiva)
# ⚠️ 8 ago 2026: FORZAR Profile Any — con Profile Private el tráfico entrante por el
# adaptador Tailscale podía clasificarse en otro perfil y Windows lo bloqueaba en
# silencio (timeout SSH desde el móvil). Ver scripts/ensure-ssh.ps1.
$fwRule = Get-NetFirewallRule -DisplayName 'OpenSSH SSH Server (sshd)' -ErrorAction SilentlyContinue
if (-not $fwRule) {
    New-NetFirewallRule -Name 'OpenSSH-Server-Inbound-TCP' -DisplayName 'OpenSSH SSH Server (sshd)' `
        -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22 -Profile Any | Out-Null
} elseif ($fwRule.Profile -ne 'Any') {
    Set-NetFirewallRule -DisplayName 'OpenSSH SSH Server (sshd)' -Profile Any
    Write-Host '   [fix] regla firewall OpenSSH movida a Profile=Any' -ForegroundColor Yellow
}

# ---------- 4. Tailscale ----------
Write-Step '4/4 Instalando/conectando Tailscale...'
if (-not (Test-Path 'C:\Program Files\Tailscale\tailscale.exe')) {
    winget install --id Tailscale.Tailscale --source winget --accept-source-agreements --accept-package-agreements --silent
    if ($LASTEXITCODE -ne 0) { throw 'winget fallo instalando Tailscale' }
}
& 'C:\Program Files\Tailscale\tailscale.exe' status 2>&1 | Out-String
if (& 'C:\Program Files\Tailscale\tailscale.exe' status 2>&1 | Select-String 'Logged out') {
    Write-Host 'Necesitas autenticarte: se abrira el navegador...' -ForegroundColor Yellow
    Start-Process -FilePath 'C:\Program Files\Tailscale\tailscale.exe' -ArgumentList 'up'
}

Write-Host "`n[OK] Remote control listo. IP tailnet:" -ForegroundColor Green
& 'C:\Program Files\Tailscale\tailscale.exe' ip -4 2>&1 | Out-String
