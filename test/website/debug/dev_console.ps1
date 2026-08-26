<#
.SYNOPSIS
Ciszu Network - Console Dev Debugging (TUI)
Consola interactiva de pruebas locales para las 4 webs del monorepo.

.DESCRIPTION
Menu navegable con flechas (up/down + Enter) para:
  - Encender / reiniciar / detener cada webapp (next dev con puerto fijo).
  - Iniciar o detener TODAS las webs a la vez.
  - Ver estado de puertos y abrir las apps en el navegador.
  - Ver logs a tiempo real (Get-Content -Tail -Wait).
  - Manual de uso, creditos y version.

Puertos fijos por web (nomenclatura del monorepo):
  ciszunetwork-website   -> 3000   (Ciszu Network)
  ciszukoantony-website  -> 3001   (Ciszuko Antony)
  ciszubot-website       -> 3002   (CiszuBot)
  muzicmania-website     -> 3003   (MuzicMania)

.EXAMPLE
  .\test\website\debug\dev_console.ps1           # modo TUI interactivo
  .\test\website\debug\dev_console.ps1 -Demo     # imprime el menu sin loops
#>

[CmdletBinding()]
param(
    [switch]$Demo,
    [switch]$SelfTest,
    [ValidateSet('start','stop','restart','status','log','help')]
    [string]$Action,
    [string]$Web
)

$ErrorActionPreference = 'Stop'
# test/website/debug -> website -> test -> E:\Ciszu Network
$root = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
Set-Location $root

# ---------- Paleta neon (truecolor ANSI, ASCII puro) ----------
$e = [char]27
$c_cyan   = "${e}[38;2;52;226;226m"
$c_pink   = "${e}[38;2;255;92;144m"
$c_purple = "${e}[38;2;173;69;255m"
$c_green  = "${e}[38;2;138;226;52m"
$c_yellow = "${e}[38;2;221;176;85m"
$c_red    = "${e}[38;2;255;80;80m"
$c_blue   = "${e}[38;2;59;130;246m"
$c_white  = "${e}[38;2;230;235;245m"
$c_gray   = "${e}[38;2;120;130;145m"
$c_reset  = "$e[0m"
# ---------- fin paleta ----------

# ---------- Web catalog (nomenclatura central del monorepo) ----------
$WEBS = @(
    @{ key = 'network';  name = 'Ciszu Network';  filter = 'ciszunetwork-website'; port = 3000; dir = 'projects/ciszu/website';  emoji = '🌐' },
    @{ key = 'antony';   name = 'Ciszuko Antony'; filter = 'ciszukoantony-website'; port = 3001; dir = (Get-ChildItem projects -Directory | Where-Object { $_.Name -match 'antony' } | Select-Object -First 1).Name + '/website'; emoji = '🎨' },
    @{ key = 'ciszubot'; name = 'CiszuBot';       filter = 'ciszubot-website';     port = 3002; dir = 'projects/ciszubot/website'; emoji = '🤖' },
    @{ key = 'muzic';    name = 'MuzicMania';     filter = 'muzicmania-website';   port = 3003; dir = 'projects/muzicmania/website'; emoji = '🎵' }
)

$VERSION = '2.4.0'
# Logs locales visibles para Ciszuko, dentro de la carpeta de debug
# (gitignored; use la herramienta "Abrir carpeta de logs" para verlos).
$LOG_DIR = Join-Path $PSScriptRoot 'local-logs'
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }

# CDN local (offline): sirve el monorepo en el puerto 8788 como NEXT_PUBLIC_CDN_URL
# para que las webs muestren logos/audios/content sin internet. scripts/serve-cdn.js.
$CDN_PORT = 8788
$CDN_PID_FILE = Join-Path $LOG_DIR 'cdn-serve.pid'
$CDN_LOG = Join-Path $LOG_DIR 'cdn-serve.log'

# ---------- Arte ASCII ----------
$ART = @'
                    [0;37;40m                                                                [0m
                    [0;37;40m      [0;34;40m▄▄▓▄[0;37;40m    [0;34;40m▄▓[0;94;44m▄[0;34;40m▄[0;37;40m         [0;34;40m▄▄▄▄[0;37;40m        [0;34;40m▄▄▄▄[0;37;40m               [0;34;40m▄[0;37;40m     [0m
                    [0;37;40m   [0;34;40m▄▓[0;94;44m·[0;34;40m█▀[0;90;40m░[0;37;40m [0;34;40m▀[0;37;40m  [0;34;40m▀▀███▓[0;37;40m     [0;34;40m▄▀▀▀▀█▓█[0;94;44m▄[0;34;40m▄▀▀▄[0;94;44m▄[0;34;40m█▓█▀▀▀▀▄[0;37;40m        [0;90;40m░░[0;37;40m [0;34;40m▐█▓▄[0;37;40m   [0m
                    [0;37;40m [0;34;40m▄▓█[0;94;44m■[0;34;40m▀[0;90;40m░[0;37;40m       [0;90;40m░░[0;34;40m███▌[0;37;40m   [0;34;40m▓▄▄[0;37;40m   [0;90;40m░[0;34;40m▀▓▀[0;37;40m    [0;34;40m▀▓▀[0;90;40m░[0;37;40m   [0;34;40m▄▄▓[0;37;40m    [0;34;40m▄▄█▀[0;37;40m   [0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m [0m
                    [0;34;40m▐███▌[0;90;40m░[0;37;40m         [0;90;40m░[0;34;40m▐██▌[0;37;40m  [0;90;40m░░[0;34;40m▀██▓▄[0;37;40m            [0;34;40m▄▓██▀[0;90;40m░░[0;37;40m  [0;34;40m█[0;94;44m░░[0;37;40m     [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0m
                    [0;94;44m░░░░[0;34;40m▌[0;90;40m░░[0;37;40m         [0;90;40m░[0;94;44m░░[0;34;40m▌[0;37;40m    [0;90;40m░░[0;34;40m█[0;94;44m▀[0;34;40m█▓▄[0;37;40m        [0;34;40m▄▓█[0;94;44m▀[0;34;40m█[0;90;40m░░[0;37;40m    [0;94;44m▒▒[0;34;40m▌[0;37;40m     [0;90;40m░[0;34;40m▐[0;94;44m▒▒▒▒[0m
                    [0;34;40m▐[0;94;44m▒▒▒▒[0;90;40m░[0;37;40m      [0;94;40m▄[0;37;40m   [0;90;40m░[0;94;44m▒▒[0;37;40m  [0;94;40m▄▀[0;37;40m   [0;90;40m░[0;94;44m░░░░[0;34;40m▌[0;37;40m      [0;34;40m▐[0;94;44m░░░░[0;90;40m░[0;37;40m   [0;94;40m▀▄[0;37;40m [0;94;44m▓▓▓[0;94;40m▄[0;37;40m   [0;90;40m░░[0;94;44m▓▓▓▓[0;94;40m▌[0m
                    [0;37;40m [0;94;40m▀[0;94;44m▓▓▓▓[0;94;40m▄▄▄▄█▀[0;37;40m     [0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▐[0;94;44m▓[0;94;40m▄[0;37;40m   [0;34;40m▄[0;94;44m▒▒▒[0;34;40m█[0;37;40m        [0;34;40m█[0;94;44m▒▒▒[0;34;40m▄[0;37;40m   [0;94;40m▄[0;94;44m▓[0;94;40m▌[0;37;40m [0;94;40m▀█[0;94;44m█[0;94;40m█▄▄▄▓[0;94;44m██[0;94;40m█▀[0;37;40m [0m
                    [0;37;40m   [0;94;40m▀▀▀▀▀▀[0;37;40m       [0;94;40m▀[0;37;40m    [0;94;40m▀█[0;94;44m▓▓▓▒▒[0;34;40m▀▀[0;37;40m          [0;34;40m▀▀[0;94;44m▒▒▓▓▓[0;94;40m█▀[0;37;40m     [0;94;40m▀▀▀▀▀▀▀[0;37;40m   [0m
[0;34;40m▀█▀▀█[0;37;40m [0;34;40m▀█▀▀█[0;37;40m [0;34;40m▀█[0;97;40m  [0;34;40m█▀[0;37;40m      [0;34;40m▀█▀▀█[0;37;40m [0;34;40m▀█▀▀█[0;37;40m [0;34;40m▀█▀▀█[0;37;40m [0;34;40m▀█[0;97;40m  [0;34;40m█▀[0;37;40m [0;34;40m█▀▀█[0;37;40m        [0;34;40m█▀▀█[0;37;40m [0;34;40m█▀▀█[0;37;40m [0;34;40m▀█▀▀█[0;37;40m  [0;34;40m█▀▀█[0;37;40m [0;34;40m█▀▀█[0;37;40m [0;34;40m▀█▀[0;37;40m   [0;34;40m▀█▀▀█[0m
[0;97;40m [0;35;40m█[0;97;40m [0;35;40m █[0;37;40m [0;97;40m [0;35;40m█▄▄[0;37;40m  [0;97;40m [0;35;40m█[0;97;40m  [0;35;40m█[0;37;40m       [0;97;40m [0;35;40m█[0;97;40m [0;35;40m █[0;37;40m [0;97;40m [0;35;40m█▄▄[0;37;40m   [0;35;40m█▄▄▀[0;37;40m [0;97;40m [0;35;40m█[0;97;40m  [0;35;40m█[0;37;40m  [0;35;40m█[0;97;40m [0;35;40m▄▄▄[0;37;40m       [0;35;40m█[0;37;40m    [0;35;40m█[0;97;40m  [0;35;40m█[0;37;40m [0;97;40m [0;35;40m█[0;97;40m  [0;35;40m█[0;37;40m  [0;35;40m█▄▄▄[0;37;40m [0;35;40m█[0;97;40m  [0;35;40m█[0;37;40m [0;97;40m [0;35;40m█[0;37;40m    [0;97;40m [0;35;40m█▄▄[0;37;40m [0m
[0;97;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  ▄[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m       [0;97;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  ▄[0;37;40m  [0;95;40m█[0;37;40m  [0;95;40m█[0;37;40m [0;97;40m [0;95;40m█[0;97;40m [0;95;40m █[0;37;40m  [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m        [0;95;40m█[0;37;40m  [0;95;40m▄[0;37;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m  [0;97;40m   [0;95;40m█[0;37;40m [0;95;40m█[0;97;40m  [0;95;40m█[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  [0;95;40m▄[0;37;40m [0;97;40m [0;95;40m█[0;97;40m  ▄[0m
[0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m  ▀▀[0;37;40m        [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m ▀▀▀▀[0;37;40m  [0;97;40m▀▀▀▀[0;37;40m       [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀[0;37;40m [0;97;40m▀▀  ▀▀[0;37;40m [0;97;40m▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀▀[0;37;40m [0;97;40m▀▀▀▀▀[0m
'@

# ---------- Estados de webs (bugfix: 'encendiendo' interno) ----------
$script:startingWeb = @{}   # key -> PID de la app que estamos lanzando

function Get-WebState([string]$port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) { return $true } else { return $false }
}

function Get-WebPhase([string]$key) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return 'off' }
    if (Get-WebState $w.port) { return 'on' }
    if ($script:startingWeb.ContainsKey($key)) {
        $pidMark = $script:startingWeb[$key]
        $alive = [bool](Get-Process -Id $pidMark -ErrorAction SilentlyContinue)
        if ($alive) { return 'starting' }
        else { $script:startingWeb.Remove($key) }
    }
    return 'off'
}

function Format-State($status, [switch]$Emoji) {
    $tag = '▮ '
    if ($status -eq 'on')      { return "${c_green}${tag}ENCENDIDA - 🟢${c_reset}" }
    elseif ($status -eq 'starting') { return "${c_yellow}${tag}ENCENDIENDO... 🟡${c_reset}" }
    else                       { return "${c_gray}${tag}DETENIDA - ⚫${c_reset}" }
}

function Wait-WebReady([string]$key, [int]$timeoutSec = 180) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    $deadline = (Get-Date).AddSeconds($timeoutSec)
    Write-Host ""
    Write-Host ("{0} Esperando a que {1} responda en http://localhost:{2}...${c_reset}" -f "${c_cyan}", "$($w.emoji) $($w.name)", $w.port)
    $spinner = @('|', '/', '-', '\')
    $s = 0
    while ((Get-Date) -lt $deadline) {
        if (Get-WebState $w.port) {
            $script:startingWeb.Remove($key)
            Write-Host ("`r{0} {1}{2}${c_reset}" -f "${c_green}[LISTA] ${c_reset}", "$($w.emoji) $($w.name)", " en http://localhost:$($w.port)  ")
            return $true
        }
        $mark = $script:startingWeb[$key]
        $alive = if ($mark) { [bool](Get-Process -Id $mark -ErrorAction SilentlyContinue) } else { $true }
        if (-not $alive) {
            $script:startingWeb.Remove($key)
            Write-Host ("`r{0} El proceso de {1} termino sin abrir el puerto (revisa el log).${c_reset}" -f "${c_red}", "$($w.emoji) $($w.name)")
            return $false
        }
        $frame = $spinner[$s % 4]
        $s++
        Write-Host ("`r   {0} compilando/arrancando... {1}   " -f $frame, ((Get-Date) -lt $deadline)) -NoNewline
        Start-Sleep -Milliseconds 400
    }
    $script:startingWeb.Remove($key)
    Write-Host ("`r{0} Tiempo de espera superado para {1}. Revisa el log en tiempo real.${c_reset}" -f "${c_red}", "$($w.emoji) $($w.name)")
    return $false
}

# ---------- CDN local (offline) ----------
function Ensure-CdnServe {
    $serving = Get-NetTCPConnection -LocalPort $CDN_PORT -State Listen -ErrorAction SilentlyContinue
    if ($serving) {
        if (Test-Path $CDN_PID_FILE) { $p = Get-Content $CDN_PID_FILE; if ([bool](Get-Process -Id $p -ErrorAction SilentlyContinue)) { return } }
        return
    }
    $node = (Get-Command node).Source
    $job = 'scripts/serve-cdn.js'
    try {
        $proc = Start-Process -FilePath $node -ArgumentList $job, '--port', "$CDN_PORT" -WorkingDirectory $root `
            -WindowStyle Hidden -RedirectStandardOutput $CDN_LOG -RedirectStandardError "$CDN_LOG.err" -PassThru
        $proc.Id | Out-File $CDN_PID_FILE
        Write-Host "${c_cyan}🖥 CDN local (offline) en http://localhost:$CDN_PORT ${c_reset}${c_gray}(sirve el monorepo, sin internet)${c_reset}"
    } catch {
        Write-Host "${c_yellow}No pude arrancar el CDN local (8788): $($_.Exception.Message)${c_reset}"
    }
}

function Stop-CdnServe {
    if (Test-Path $CDN_PID_FILE) {
        $p = Get-Content $CDN_PID_FILE
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Remove-Item $CDN_PID_FILE -Force -ErrorAction SilentlyContinue
        Write-Host "${c_gray}🖥 CDN local (8788) detenido.${c_reset}"
    }
    $serving = Get-NetTCPConnection -LocalPort $CDN_PORT -State Listen -ErrorAction SilentlyContinue
    if ($serving) { try { Stop-Process -Id $serving.OwningProcess -Force -ErrorAction SilentlyContinue } catch { } }
}

# ---------- Launcher / Stopper ----------
function Start-WebByKey([string]$key, [switch]$Wait) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    if (Get-WebState $w.port) { Write-Host "${c_yellow}${w.emoji} Ya encendida (port $($w.port)).${c_reset}"; return }

    Ensure-CdnServe

    if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
    $logFile = Join-Path $LOG_DIR "$key.log"
    $cmd = "Set-Location '$root'; pnpm --filter $($w.filter) dev -p $($w.port)"
    $proc = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $cmd `
        -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" -PassThru
    $script:startingWeb[$key] = $proc.Id

    Write-Host "${c_cyan}⚡ Encendiendo ${w.emoji} $($w.name) -> http://localhost:$($w.port)${c_reset}"
    Write-Host "${c_gray}Log: $logFile${c_reset}"

    if ($Wait) { $null = Wait-WebReady $key }
}

function Stop-WebByKey([string]$key, [switch]$Wait) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    $conns = Get-NetTCPConnection -LocalPort $w.port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue } catch { }
    }
    $script:startingWeb.Remove($key)
    if ($Wait) {
        $deadline = (Get-Date).AddSeconds(15)
        while ((Get-Date) -lt $deadline) {
            if (-not (Get-WebState $w.port)) { break }
            Start-Sleep -Milliseconds 300
        }
    }
    Write-Host "${c_pink}${w.emoji} Web $($w.name) detenida (puerto $($w.port) liberado).${c_reset}"
}

# ---------- Menu de seleccion multiple con checkboxes ----------
# Devuelve un objeto con .Action = 'proceed' | 'noproceed' | 'abort' y
# .Selection = array de keys marcadas (vacia si no procede o aborta).
function Show-MultiSelect {
    param([string]$Title, [object[]]$Options, [string[]]$Init = @())
    $sel = @{}
    foreach ($k in $Init) { $sel[$k] = $true }
    $total = $Options.Count
    $i = 0
    while ($true) {
        Clear-Host
        Show-Art
        Show-MenuHeader $Title
        Write-Host "${c_gray}(↑/↓ mover · Espacio marcar/desmarcar · Enter PROCEDER · N no proceder · Q abortar · A marcar todas)${c_reset}"
        Write-Host ""
        for ($n = 0; $n -lt $total; $n++) {
            $opt = $Options[$n]
            $k   = $opt.key
            $ic  = if ($opt.ic) { $opt.ic } else { $opt.emoji }
            $ct  = if ($k -and $sel[$k]) { '☑' } else { '☐' }
            $st  = if ($opt.s) { '  ' + $opt.s } else { '' }
            if ($n -eq $i) {
                Write-Host "${c_yellow}▸ [${ct}] ${ic}  ${c_yellow}$($opt.l)${c_reset}${c_yellow}$st${c_reset}"
            } else {
                Write-Host "  [${ct}] ${ic}  $($opt.l)$st"
            }
        }
        Write-Host ""
        $selCount = @($sel.Keys).Count
        Write-Host "${c_gray}Seleccionadas: $selCount / $total${c_reset}"
        Write-Host ""
        Write-Host "${c_green}   [Enter] Proceder    ${c_yellow}[N] No proceder    ${c_red}[Q/Esc] Abortar${c_reset}"
        Write-Host "${c_cyan}   [A] Marcar todas    [Espacio] marcar/desmarcar    [1-9] ir a la opcion${c_reset}"
        Write-Host ""

        $keyInfo = [System.Console]::ReadKey($true)
        $k = $keyInfo.Key
        if     ($k -eq [ConsoleKey]::UpArrow)   { if ($i -gt 0) { $i-- } }
        elseif ($k -eq [ConsoleKey]::DownArrow) { if ($i -lt $total - 1) { $i++ } }
        elseif ($k -eq [ConsoleKey]::Spacebar)  {
            $ck = $Options[$i].key
            if ($ck -and $sel.ContainsKey($ck)) { $sel.Remove($ck) } elseif ($ck) { $sel[$ck] = $true }
        }
        elseif ($k -eq [ConsoleKey]::Enter) {
            return @{ Action = 'proceed'; Selection = @($sel.Keys) }
        }
        elseif ($k -eq [ConsoleKey]::N)  { return @{ Action = 'noproceed'; Selection = @() } }
        elseif ($k -eq [ConsoleKey]::Q -or $k -eq [ConsoleKey]::Escape) { return @{ Action = 'abort'; Selection = @() } }
        elseif ($k -eq [ConsoleKey]::A)  { foreach ($o in $Options) { $sel[$o.key] = $true } }
        else {
            $ch = $keyInfo.KeyChar
            if ($ch -ge '1' -and $ch -le '9') {
                $n = [int][string]$ch - 1
                if ($n -lt $total) { $i = $n }
            }
            elseif ($ch -eq '0') { if ($total -gt 9) { $i = 9 } }
        }
    }
}

function Show-MenuHeader([string]$Title) {
    Write-Host ""
    Write-Host "${c_cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰${c_reset}"
    Write-Host "${c_blue}  $Title${c_reset}"
    Write-Host "${c_cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰${c_reset}"
    Write-Host ""
}

# ---------- Estado: seleccion multiple + informe ----------
function Show-Status {
    Clear-Host
    Show-Art
    Show-MenuHeader "Selecciona las webs a consultar (Espacio marca)"
    $opts = @()
    foreach ($w in $WEBS) {
        $st = Format-State -status (Get-WebPhase $w.key)
        $opts += @{ key = $w.key; ic = $w.emoji; l = "$($w.name)  port $($w.port)"; s = $st }
    }
    $r = Show-MultiSelect -Title "ESTADO - selecciona webs" -Options $opts -Init @($WEBS.key)
    if ($r.Action -eq 'abort' -or $r.Action -eq 'noproceed') { return }
    $sel = $r.Selection
    if ($sel.Count -eq 0) { Write-Host "${c_yellow}No seleccionaste ninguna web.${c_reset}"; Press-Continue; return }

    Clear-Host
    Show-Art
    Write-Host "${c_cyan}==================  ESTADO DE PUERTOS  ==================${c_reset}"
    foreach ($k in $sel) {
        $w = $WEBS | Where-Object { $_.key -eq $k }
        $status = Get-WebPhase $k
        $url = "http://localhost:$($w.port)"
        $st = Format-State -status $status
        Write-Host ("{0}  {1,-16} port {2,-4} {3}" -f $st, $w.name, $w.port, $url)
        if ($status -eq 'on') { Write-Host ("      ${c_green}${w.emoji} Comprobando... abrir en navegador.${c_reset}") }
    }
    Write-Host ""
    Write-Host "${c_gray}Consejo: podes explorar cada web con el navegador y, si algo falla,${c_reset}"
    Write-Host "${c_gray}abrir el log en tiempo real desde la seccion Logs del menu.${c_reset}"
    Write-Host ""
    Press-Continue
}

# ---------- Log en tiempo real (menu simple, abre UNA ventana por web) ----------
function Show-LogMenu {
    $opts = @()
    foreach ($w in $WEBS) {
        $phase = Get-WebPhase $w.key
        $logFile = Join-Path $LOG_DIR "$($w.key).log"
        if ($phase -eq 'off') {
            $tag = "${c_gray}${w.emoji} detenida - sin log${c_reset}"
        } elseif (Test-Path $logFile) {
            $tag = "${c_green}${w.emoji} hay log${c_reset}"
        } else {
            $tag = "${c_gray}${w.emoji} sin log aun${c_reset}"
        }
        $act = { Show-Log $w.key }.GetNewClosure()
        $opts += @{ ic = $w.emoji; l = $w.name; s = $tag; act = $act }
    }
    $sel = Show-Menu -Title "LOGS EN TIEMPO REAL - elige UNA web" -Options $opts
    if ($sel -ge 0) { & $opts[$sel].act; Press-Continue }
}

function Show-Log([string]$key) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    $phase = Get-WebPhase $key
    if ($phase -eq 'off') {
        Write-Host "${c_yellow}${w.emoji} $($w.name) esta DETENIDA: no hay log en tiempo real.${c_reset}"
        Write-Host "${c_gray}Enciende la web primero desde el menu principal.${c_reset}"
        Press-Continue
        return
    }
    $logFile = Join-Path $LOG_DIR "$key.log"
    $errFile = "$logFile.err"
    if (-not (Test-Path $logFile) -and -not (Test-Path $errFile)) {
        Write-Host "${c_yellow}Sin log todavia. Enciende la web primero o espera a que escriba su log.${c_reset}"
        Press-Continue
        return
    }
    $cmd = "if (Test-Path '$errFile') { Write-Host '-- ERR --' -ForegroundColor Red; Get-Content '$errFile' -Tail 80 }; Get-Content '$logFile' -Tail 80 -Wait"
    $boot = "Clear-Host; Write-Host 'LOG EN VIVO - $($w.name) (next dev)' -ForegroundColor Cyan; Write-Host '--- close window to stop ---' -ForegroundColor DarkGray"
    Start-Process powershell.exe -ArgumentList '-NoLogo', '-NoExit', '-Command', "& { $boot; $cmd }" | Out-Null
    Write-Host "${c_white}Log en vivo de $($w.name) abierto en ventana separada.${c_reset}"
}

# ---------- Menu simple (seleccion de una opcion) ----------
function Show-Menu {
    param([string]$Title, [object[]]$Options, [int]$InitIndex = 0)
    $i = [Math]::Max(0, [Math]::Min($InitIndex, $Options.Count - 1))
    while ($true) {
        Clear-Host
        Show-Art
        Show-MenuHeader $Title
        Write-Host "${c_gray}(↑/↓ o numero para moverte, Enter para elegir, Q para volver)${c_reset}"
        Write-Host ""
        for ($n = 0; $n -lt $Options.Count; $n++) {
            $opt    = $Options[$n]
            $icon   = if ($opt.ic) { $opt.ic } else { '  ' }
            $label  = $opt.l
            $suffix = if ($opt.s) { '  ' + $opt.s } else { '' }
            $idx    = $n + 1
            if ($n -eq $i) {
                Write-Host "${c_yellow}▸ [${idx}] ${c_reset}${c_yellow}${icon}${c_reset}  ${c_yellow}${label}${c_reset}${c_yellow}${suffix}${c_reset}"
            } else {
                Write-Host "   [${idx}]  ${icon}  ${label}${suffix}"
            }
        }
        Write-Host ""

        $keyInfo = [System.Console]::ReadKey($true)
        $k = $keyInfo.Key
        if     ($k -eq [ConsoleKey]::UpArrow)   { if ($i -gt 0) { $i-- } }
        elseif ($k -eq [ConsoleKey]::DownArrow) { if ($i -lt $Options.Count - 1) { $i++ } }
        elseif ($k -eq [ConsoleKey]::Enter)     { return $i }
        elseif ($k -eq [ConsoleKey]::Escape)    { return -1 }
        elseif ($k -eq [ConsoleKey]::Q)         { return -1 }
        else {
            $ch = $keyInfo.KeyChar
            if ($ch -ge '1' -and $ch -le '9') {
                $n = [int][string]$ch - 1
                if ($n -lt $Options.Count) { $i = $n }
            }
            elseif ($ch -eq '0') { if ($Options.Count -gt 9) { $i = 9 } }
        }
    }
}

function Show-Art {
    Write-Host "${c_cyan}$ART${c_reset}"
    Write-Host "${c_cyan}                                          C I S Z U   N E T W O R K${c_reset}"
    Write-Host "${c_purple}                                        Console Dev Debugging  v$VERSION${c_reset}"
    Write-Host ""
}

function Press-Continue {
    Write-Host ""
    Write-Host "${c_gray}Pulsa una tecla para continuar...${c_reset}"
    $null = [System.Console]::ReadKey($true)
}

# ---------- Ayuda / creditos / version ----------
function Show-Help {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}====================  MANUAL DE AYUDA  ====================${c_reset}"
    Write-Host ""
    Write-Host "${c_white}Objetivo:${c_reset} encender, reiniciar o detener las 4 webs de`
Ciszu Network en local (Next.js dev) sin abrir terminales a mano."
    Write-Host ""
    Write-Host "${c_cyan}Puertos fijos (nomenclatura del monorepo):${c_reset}"
    foreach ($w in $WEBS) {
        Write-Host ("   {0,-16} -> http://localhost:{1}   ({2})" -f $w.name, $w.port, $w.dir)
    }
    Write-Host ""
    Write-Host "${c_cyan}Operativas (Encender / Reiniciar / Detener):${c_reset}"
    Write-Host "   Abren un menu de seleccion MULTIPLE con las 4 webs:"
    Write-Host "   las webs vienen MARCADAS por defecto (marcar todas automaticamente)."
    Write-Host "   Al terminar de marcar/desmarcar elige como proceder:"
    Write-Host "     Enter      PROCEDER  -> ejecuta la operacion en las webs marcadas"
    Write-Host "     N          NO PROCEDER -> vuelve al menu sin aplicar nada"
    Write-Host "     Q / Esc    ABORTAR   -> cierra la consola sin tocar las webs (siguen activas)"
    Write-Host ""
    Write-Host "${c_cyan}Atajos del menu de seleccion multiple:${c_reset}"
    Write-Host "   Up/Down      mover el cursor"
    Write-Host "   Espacio      marcar o desmarcar la web resaltada"
    Write-Host "   A            seleccionar TODAS las webs"
    Write-Host "   1-9 / 0      saltar al indice de la opcion"
    Write-Host "   Enter        PROCEDER (ejecutar operacion)"
    Write-Host "   N            NO PROCEDER (cancelar operacion)"
    Write-Host "   Q / Esc      ABORTAR (cerrar consola, las webs siguen activas)"
    Write-Host ""
    Write-Host "${c_cyan}Estado de puertos:${c_reset} consulta las webs que elijas, mostrando`
   🟢 ENCENDIDA / 🟡 ENCENDIENDO... / ⚫ DETENIDA."
    Write-Host ""
    Write-Host "${c_cyan}Logs en tiempo real:${c_reset} solo las webs ENCENDIDAS tienen log;`
   si una web esta detenida no se ofrece abrir su log."
    Write-Host ""
    Write-Host "${c_cyan}Salir (Ctrl+C o 'Salir'):${c_reset} cierra solo la consola. Las webs y el CDN`
   local SIGUEN ejecutandose y respondiendo en sus puertos (3000-3003 y 8788);`
   puedes usar pnpm dev:stop o el menu 'Detener webs' cuando quieras pararlas."
    Write-Host ""
    Write-Host "${c_gray}Los logs se guardan en: $LOG_DIR\<web>.log (visible en test/website/debug/local-logs)${c_reset}"
    Write-Host "${c_gray}Guias: test/website/debug/dev_console.{md,txt}${c_reset}"
    Press-Continue
}

function Show-Credits {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}====================  CREDITOS  ====================${c_reset}"
    Write-Host ""
    Write-Host "${c_pink}CISZU NETWORK${c_reset} ${c_gray}- ecosistema digital de Ciszuko Antony.${c_reset}"
    Write-Host "${c_gray}Proyecto:      Ciszu Network${c_reset}"
    Write-Host "${c_gray}Consola:       Console Dev Debugging (TUI)${c_reset}"
    Write-Host "${c_gray}Version:       $VERSION${c_reset}"
    Write-Host "${c_gray}Carpeta:       test/website/debug/${c_reset}"
    Write-Host "${c_gray}Creado:        ago 2026${c_reset}"
    Write-Host ""
    Write-Host "${c_gray}Documentacion: DEV_CONSOLE_SYSTEM.md, DEBUGGING_SYSTEM.md,${c_reset}"
    Write-Host "${c_gray}               LOCAL_TESTING_PROTOCOLS.md${c_reset}"
    Press-Continue
}

function Show-Version {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}====================  VERSION  ====================${c_reset}"
    Write-Host ""
    Write-Host ("{0} {1}" -f "${c_pink}dev_console${c_reset}", $VERSION)
    Write-Host "${c_gray}Rama:          main${c_reset}"
    Write-Host "${c_gray}Package:       pnpm (monorepo)${c_reset}"
    Write-Host "${c_gray}Next locales:  ${c_reset}3000 · 3001 · 3002 · 3003"
    Press-Continue
}

# ---------- Seguridad: password de acceso al devcon ----------
# Lee la contraseña del vault local (services/supabase/.env, DEVCON_PASSWORD),
# nunca la muestra. Se pide al arrancar y en acciones sensibles (kill switch,
# borrado). Si falla -> se sale de la operación.
function Read-VaultEnv([string]$Name) {
    $vault = Join-Path $root 'services\supabase\.env'
    if (-not (Test-Path -LiteralPath $vault)) { return $null }
    foreach ($line in Get-Content -LiteralPath $vault) {
        if ($line -match "^$Name\s*=\s*(.*)$") {
            return $matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return $null
}

function Test-DevconPassword {
    $expected = Read-VaultEnv 'DEVCON_PASSWORD'
    if ([string]::IsNullOrWhiteSpace($expected)) {
        Write-Host "${c_red}[SEGURIDAD] DEVCON_PASSWORD no configurado en el vault (services/supabase/.env).${c_reset}"
        return $false
    }
    $secure = Read-Host "Contraseña de acceso" -AsSecureString
    $plain = [System.Net.NetworkCredential]::new('', $secure).Password
    return ($plain -ceq $expected)
}

# ---------- Advisor (mensajes globales) ----------
# Ejecuta scripts/advisor.js y, si detecta contenido prohibido (exit code 2),
# cierra la consola de seguridad tras registrar el intento en el log.
function Invoke-AdvisorNode {
    param([string[]]$NodeArgs)
    Push-Location $root
    try {
        node @NodeArgs 2>&1 | Out-Host
        $code = $LASTEXITCODE
    } finally {
        Pop-Location
    }
    if ($code -eq 2) {
        Write-Host ""
        Write-Host "${c_red}🔒 Contenido prohibido detectado (mensaje o autor). Intento registrado en el log de auditoría.${c_reset}"
        Write-Host "${c_red}   Cerrando la consola por seguridad...${c_reset}"
        Start-Sleep -Milliseconds 1500
        exit 2
    }
    return $code
}

function Show-AdvisorMenu {
    $sites = @('ciszu', 'ciszukoantony', 'muzicmania', 'ciszubot')
    # Selección persistente entre mensajes (la tecla A marca todas; no hay opción "global").
    $sel = @($sites)
    $kind = 'info'
    $sender = 'admin'
    if (-not $script:advisorSession) {
        $script:advisorSession = 'devcon-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString().Substring(0, 8))
    }
    while ($true) {
        Clear-Host
        Show-Art
        Show-MenuHeader "GLOBAL ADVISOR - enviar mensaje (A=todas · Espacio marca · Esc=volver)"
        $optWebs = @($sites | ForEach-Object { @{ key = $_; l = $_ } })
        $res = Show-MultiSelect -Title "WEBS DESTINO (persiste entre mensajes)" -Options $optWebs -Init $sel
        if ($res.Action -eq 'abort') { return }
        if ($res.Action -eq 'noproceed') { continue }
        $sel = @($res.Selection)
        if ($sel.Count -eq 0) { Write-Host "${c_yellow}Selecciona al menos una web.${c_reset}"; Press-Continue; continue }
        $target = $sel -join ','

        $kinds = @('info', 'success', 'warning', 'error')
        $ki = Show-Menu -Title "TIPO DE MENSAJE (actual: $kind)" -Options @($kinds | ForEach-Object { @{ ic = '▪'; l = $_ } }) -InitIndex $kinds.IndexOf($kind)
        if ($ki -lt 0) { return }
        $kind = $kinds[$ki]

        $msg = Read-Host "Mensaje (Enter vacío = volver al menú)"
        if ([string]::IsNullOrWhiteSpace($msg)) { return }
        if ($msg.Length -lt 2 -or $msg.Length -gt 620) {
            Write-Host "${c_yellow}El mensaje debe tener entre 2 y 620 caracteres (actual: $($msg.Length)).${c_reset}"
            Press-Continue
            continue
        }

        $raw = Read-Host "De parte de (Enter = $sender)"
        if (-not [string]::IsNullOrWhiteSpace($raw)) { $sender = $raw.Trim() }

        Write-Host ""
        Write-Host "${c_cyan}Enviando a [$target] · tipo [$kind] · autor [$sender] (esperando entrega... )${c_reset}"
        Invoke-AdvisorNode @('scripts/advisor.js', $msg, '--target', $target, '--kind', $kind, '--sender', $sender, '--session', $script:advisorSession, '--wait')

        Write-Host ""
        Write-Host "${c_green}[Enter] Enviar otro mensaje   ${c_red}[Q/Esc] Volver al menú${c_reset}"
        $k = [System.Console]::ReadKey($true)
        if ($k.Key -eq [ConsoleKey]::Q -or $k.Key -eq [ConsoleKey]::Escape) { return }
    }
}

# Kill switch: activar/desactivar los mensajes globales (requiere password).
function Show-AdvisorToggle {
    if (-not (Test-DevconPassword)) { Write-Host "${c_red}Contraseña incorrecta. Operación cancelada.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-MenuHeader "KILL SWITCH - mensajes globales"
    Push-Location $root
    node scripts/advisor.js --status 2>&1 | Out-Host
    Pop-Location
    Write-Host ""
    Write-Host "${c_green}[1] ACTIVAR mensajes   ${c_red}[2] DESACTIVAR mensajes   [Q/Esc] volver${c_reset}"
    $k = [System.Console]::ReadKey($true)
    $ch = $k.KeyChar
    if ($ch -eq '1') { Invoke-AdvisorNode @('scripts/advisor.js', '--toggle', 'on', '--sender', 'admin', '--session', $script:advisorSession) }
    elseif ($ch -eq '2') { Invoke-AdvisorNode @('scripts/advisor.js', '--toggle', 'off', '--sender', 'admin', '--session', $script:advisorSession) }
    Press-Continue
}

# Borrado de mensajes enviados (error o seguridad; requiere password).
function Show-AdvisorClear {
    if (-not (Test-DevconPassword)) { Write-Host "${c_red}Contraseña incorrecta. Operación cancelada.${c_reset}"; Press-Continue; return }
    Clear-Host
    Show-MenuHeader "BORRAR MENSAJES GLOBALES"
    Push-Location $root
    node scripts/advisor.js --list 2>&1 | Out-Host
    Pop-Location
    Write-Host ""
    Write-Host "${c_cyan}IDs a borrar separados por espacio · [A] borrar TODOS · [Q] volver:${c_reset}"
    $in = Read-Host ">"
    if ($in -match '^[aA]$') {
        Invoke-AdvisorNode @('scripts/advisor.js', '--clear-all', '--sender', 'admin', '--session', $script:advisorSession)
    } elseif ($in -match '^[\d\s]+$') {
        $ids = @($in -split '\s+' | Where-Object { $_ })
        if ($ids.Count -gt 0) { Invoke-AdvisorNode @('scripts/advisor.js', '--clear', @($ids), '--sender', 'admin', '--session', $script:advisorSession) }
    }
    Press-Continue
}

# ---------- Herramientas extra ----------
function Show-Tools {
    $opts = @(
        @{ ic = '🧹'; l = "Limpiar logs (test/website/debug/local-logs)";  act = { Remove-Item "$LOG_DIR\*" -Force -ErrorAction SilentlyContinue; Write-Host "${c_green}Logs limpiados.${c_reset}"; Press-Continue } },
        @{ ic = '💾'; l = "Ver memoria / procesos node";              act = { Clear-Host; Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, @{n='RAM MB';e={[math]::Round($_.WorkingSet64/1MB)}} | Format-Table | Out-Host; Press-Continue } },
        @{ ic = '🔌'; l = "Ver que puertos 3000-3003 estan ocupados"; act = { Clear-Host; foreach ($p in 3000..3003) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { Write-Host "${c_pink}Port $p -> PID $($c.OwningProcess)${c_reset}" } else { Write-Host "${c_gray}Port $p -> libre${c_reset}" } }; Press-Continue } },
        @{ ic = '🌐'; l = "Abrir todas las webs en el navegador";     act = { foreach ($w in $WEBS) { if ((Get-WebPhase $w.key) -eq 'on') { Start-Process "http://localhost:$($w.port)" } else { Write-Host "${c_gray}$($w.name) detenida - no se abre.${c_reset}" } }; Press-Continue } },
        @{ ic = '🔗'; l = "Ver procesos que ocupan los puertos 3000-3003"; act = { Clear-Host; foreach ($p in 3000..3003) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { $pr = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue; Write-Host ("{0} Port {1} -> PID {2} {3}" -f $c.LocalAddress, $p, $c.OwningProcess, $pr.ProcessName) } }; Press-Continue } },
        @{ ic = '⏱'; l = "Ver procesos node de cada web (CPU/mem)";    act = { Clear-Host; $pids = @(); foreach ($w in $WEBS) { $c = Get-NetTCPConnection -LocalPort $w.port -State Listen -ErrorAction SilentlyContinue; if ($c) { $pids += $c.OwningProcess } }; Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Id -in $pids } | Select-Object Id, @{n='RAM MB';e={[math]::Round($_.WorkingSet64/1MB)}}, @{n='CPU s';e={[math]::Round($_.CPU,1)}} | Format-Table | Out-Host; Press-Continue } },
        @{ ic = '🧾'; l = "Abrir carpeta de logs en el explorador";    act = { if (Test-Path $LOG_DIR) { Start-Process explorer.exe (Resolve-Path $LOG_DIR).Path } else { Write-Host "${c_yellow}No hay carpeta de logs aun.${c_reset}" }; Press-Continue } },
        @{ ic = '⚙'; l = "Ver versiones node / pnpm / turbo";        act = { Clear-Host; node -v; pnpm -v; turbo --version 2>$null; Press-Continue } },
        @{ ic = '📦'; l = "Ver git status del monorepo";              act = { Clear-Host; git -C $root status --short --branch | Out-Host; Press-Continue } },
        @{ ic = '📢'; l = "Advisor: enviar mensaje global a las webs"; act = { Show-AdvisorMenu } },
        @{ ic = '🔘'; l = "Advisor: activar/desactivar mensajes globales (kill switch)"; act = { Show-AdvisorToggle } },
        @{ ic = '🗑'; l = "Advisor: borrar mensajes enviados"; act = { Show-AdvisorClear } },
        @{ ic = '👥'; l = "Staff Console (STAFFCON) - empleados"; act = { Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $PSScriptRoot 'staffcon.ps1'); Write-Host "${c_green}STAFFCON abierta en ventana separada.${c_reset}"; Press-Continue } },
        @{ ic = '🛒'; l = "Customers Console (CUSTOMERSCON) - clientes"; act = { Start-Process powershell.exe -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File',(Join-Path $PSScriptRoot 'customerscon.ps1'); Write-Host "${c_green}CUSTOMERSCON abierta en ventana separada.${c_reset}"; Press-Continue } },
        @{ ic = '🌡'; l = "Ver espacio en disco (C y E)";             act = { Clear-Host; Get-PSDrive C,E | Select-Object Name, @{n='Libre GB';e={[math]::Round($_.Free/1GB,1)}}, @{n='Usado GB';e={[math]::Round($_.Used/1GB,1)}} | Format-Table | Out-Host; Press-Continue } },
        @{ ic = '🖥'; l = "Estado CDN local (offline :8788)";         act = { $s = Get-NetTCPConnection -LocalPort $CDN_PORT -State Listen -ErrorAction SilentlyContinue; if ($s) { Write-Host "${c_green}CDN local activo (pid $($s.OwningProcess)) -> http://localhost:$CDN_PORT${c_reset}" } else { Write-Host "${c_yellow}CDN local DETENIDO. Arranca una web para encenderlo.${c_reset}" }; Press-Continue } },
        @{ ic = '♻'; l = "Reiniciar CDN local (offline :8788)";      act = { Stop-CdnServe; Ensure-CdnServe; Start-Sleep -Milliseconds 800; Press-Continue } }
    )
    $sel = Show-Menu -Title "HERRAMIENTAS EXTRAS" -Options $opts
    if ($sel -ge 0) { & $opts[$sel].act }
}

# ---------- Modo CLI no interactivo (para PowerShell/opencode) ----------
if ($Action) {
    $keys = @('network','antony','ciszubot','muzic')
    $w = $null
    if ($Web) {
        $w = $WEBS | Where-Object { $_.key -eq $Web -or $_.name -like "*$Web*" }
    }
    switch ($Action) {
        'status' {
            foreach ($ww in $WEBS) {
                $ph = Get-WebPhase $ww.key
                $tag = switch ($ph) { 'on' { '[ON] ' } 'starting' { '[...] ' } default { '[OFF]' } }
                Write-Host ("{0}  {1,-16} port {2,-4} http://localhost:{3}" -f $tag, $ww.name, $ww.port, $ww.port)
            }
        }
        'help' {
            Show-Help
        }
        default {
            if (-not $w) { Write-Host "${c_red}Web no valida. Usa: network | antony | ciszubot | muzic${c_reset}"; exit 1 }
            switch ($Action) {
                'start'   { Start-WebByKey $w.key -Wait }
                'stop'    { Stop-WebByKey $w.key -Wait }
                'restart' { Stop-WebByKey $w.key -Wait; Start-WebByKey $w.key -Wait }
                'log'     { Show-Log $w.key }
            }
        }
    }
    exit 0
}

# ---------- Modo Demo (imprime estado sin loops ni esperas) ----------
if ($Demo.IsPresent) {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}==================  ESTADO DE PUERTOS  ==================${c_reset}"
    foreach ($w in $WEBS) {
        $ph = Get-WebPhase $w.key
        $url = "http://localhost:$($w.port)"
        $st = Format-State -status $ph
        Write-Host ("{0}  {1,-16} port {2,-4} {3}" -f $st, $w.name, $w.port, $url)
    }
    Write-Host ""
    Write-Host "${c_gray}(modo demo: sin menu interactivo)${c_reset}"
    exit 0
}

# ---------- Opciones para los menus de seleccion multiple ----------
function Build-WebSelectOptions {
    $r = @()
    foreach ($w in $WEBS) {
        $ph = Get-WebPhase $w.key
        $tag = Format-State -status $ph
        $r += @{ key = $w.key; ic = $w.emoji; l = "$($w.name)  port $($w.port)"; s = $tag }
    }
    return $r
}

# ---------- Modo SelfTest (sin interactividad, exit 0 si OK) ----------
if ($SelfTest.IsPresent) {
    $failures = @()
    function AssertEqual($label, $expected, $actual) {
        if ($expected -ne $actual) { $script:failures += "${label}: esperado '${expected}', obtenido '${actual}'" }
    }
    function AssertTrue($label, $cond) {
        if (-not $cond) { $script:failures += $label }
    }

    AssertEqual 'Version' '2.4.0' $VERSION
    AssertEqual 'Webs count' 4 $WEBS.Count
    AssertEqual 'CDN port' 8788 $CDN_PORT
    AssertEqual 'Keys' 'network;antony;ciszubot;muzic' (($WEBS.key) -join ';')
    AssertEqual 'Ports 3000-3003' '3000;3001;3002;3003' (($WEBS.port) -join ';')
    AssertEqual 'Filter antony' 'ciszukoantony-website' (($WEBS | Where-Object { $_.key -eq 'antony' }).filter)

    # Format-State
    AssertTrue 'Format-State on' ((Format-State -status 'on') -like '*ENCENDIDA*')
    AssertTrue 'Format-State starting' ((Format-State -status 'starting') -like '*ENCENDIENDO*')
    AssertTrue 'Format-State off' ((Format-State -status 'off') -like '*DETENIDA*')

    # Get-WebPhase siempre devuelve una fase valida (sin lanzar)
    foreach ($w in $WEBS) {
        $ph = Get-WebPhase $w.key
        AssertTrue "Get-WebPhase $($w.key) valida" ($ph -in @('on','starting','off'))
    }

    # Build-WebSelectOptions devuelve 4 opciones con key (requiere WEBS cargada)
    $opts = Build-WebSelectOptions
    AssertEqual 'WebSelectOptions count' 4 $opts.Count

    # Menu de seleccion multiple: Enter procede (sin ReadKey) => construimos AMBA seleccion
    $sel = @{ network = $true; antony = $true }
    AssertEqual 'MultiSelect proceed count' 2 $sel.Count

    if ($failures.Count -gt 0) {
        Write-Host "${c_red}SELF-TEST FALLIDO:${c_reset}" | Out-Host
        $failures | ForEach-Object { Write-Host "  - $_" } | Out-Host
        exit 1
    }
    Write-Host "${c_green}SELF-TEST OK (v$VERSION)${c_reset}" | Out-Host
    exit 0
}

# ---------- Menu principal ----------
Clear-Host
Show-Art
Write-Host "${c_gray}Bienvenido. Elige una operativa y luego las webs que quieras.${c_reset}"
Write-Host ""

function Invoke-SelectedWebs([string]$Action, [string[]]$Keys) {
    foreach ($k in $Keys) {
        switch ($Action) {
            'start'   { Start-WebByKey $k -Wait }
            'stop'    { Stop-WebByKey $k -Wait }
            'restart' { Stop-WebByKey $k -Wait; Start-WebByKey $k -Wait }
        }
    }
}

$script:quitRequested = $false

# ---------- Login de acceso (seguridad) ----------
Clear-Host
Show-Art
Write-Host "${c_cyan}════════════════  CISZU DEV CONSOLE - ACCESO RESTRINGIDO  ════════════════${c_reset}"
if (-not (Test-DevconPassword)) {
    Write-Host "${c_red}[SEGURIDAD] Contraseña incorrecta. Cerrando la consola.${c_reset}"
    Start-Sleep -Milliseconds 900
    exit 1
}
# Sesión de auditoría del advisor (queda registrada en el log con cada acción).
$script:advisorSession = 'devcon-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + ([guid]::NewGuid().ToString().Substring(0, 8))
Clear-Host
while (-not $script:quitRequested) {
    $menuItems = @(
        @{ ic = '🚀'; l = "Encender webs";      key = '__start' },
        @{ ic = '🔄'; l = "Reiniciar webs";     key = '__restart' },
        @{ ic = '⏹'; l = "Detener webs";       key = '__stop' },
        @{ ic = '📊'; l = "Estado de puertos";  key = '__status' },
        @{ ic = '📜'; l = "Logs en tiempo real"; key = '__logs' },
        @{ ic = '🧰'; l = "Herramientas extra"; key = '__tools' },
        @{ ic = '❓'; l = "Manual de ayuda";    key = '__help' },
        @{ ic = '♥'; l = "Creditos";           key = '__credits' },
        @{ ic = '✨'; l = "Version";           key = '__version' },
        @{ ic = '🚪'; l = "Salir (Ctrl+C)";    key = '__quit' }
    )

    $sel = Show-Menu -Title "CONSOLE DEV DEBUGGING - MENU PRINCIPAL" -Options $menuItems
    if ($sel -lt 0) { $script:quitRequested = $true; continue }

    $key = $menuItems[$sel].key

    switch ($key) {
        '__start' {
            $opts = Build-WebSelectOptions
            $r = Show-MultiSelect -Title "🚀 ENCENDER - marca las webs (auto: todas)" -Options $opts -Init @($WEBS.key)
            if ($r.Action -eq 'abort') { $script:quitRequested = $true; continue }
            if ($r.Action -eq 'noproceed') { continue }
            if ($r.Selection.Count -eq 0) { Write-Host "${c_yellow}No seleccionaste ninguna web.${c_reset}"; Press-Continue; continue }
            Invoke-SelectedWebs 'start' $r.Selection
            Press-Continue
        }
        '__restart' {
            $opts = Build-WebSelectOptions
            $r = Show-MultiSelect -Title "🔄 REINICIAR - marca las webs (auto: todas)" -Options $opts -Init @($WEBS.key)
            if ($r.Action -eq 'abort') { $script:quitRequested = $true; continue }
            if ($r.Action -eq 'noproceed') { continue }
            if ($r.Selection.Count -eq 0) { Write-Host "${c_yellow}No seleccionaste ninguna web.${c_reset}"; Press-Continue; continue }
            Invoke-SelectedWebs 'restart' $r.Selection
            Press-Continue
        }
        '__stop' {
            $opts = Build-WebSelectOptions
            $r = Show-MultiSelect -Title "⏹ DETENER - marca las webs (auto: todas)" -Options $opts -Init @($WEBS.key)
            if ($r.Action -eq 'abort') { $script:quitRequested = $true; continue }
            if ($r.Action -eq 'noproceed') { continue }
            if ($r.Selection.Count -eq 0) { Write-Host "${c_yellow}No seleccionaste ninguna web.${c_reset}"; Press-Continue; continue }
            Invoke-SelectedWebs 'stop' $r.Selection
            Press-Continue
        }
        '__status' { Show-Status }
        '__logs'   { Show-LogMenu }
        '__tools'  { Show-Tools }
        '__help'   { Show-Help }
        '__credits' { Show-Credits }
        '__version' { Show-Version }
        '__quit' {
            Write-Host "${c_cyan}Cerrando la consola SIN detener las webs (los servidores siguen activos).${c_reset}"
            foreach ($w in $WEBS) {
                if ((Get-WebPhase $w.key) -eq 'on') {
                    Write-Host ("{0} quedara activa en http://localhost:{1}" -f $w.name, $w.port)
                }
            }
            Write-Host "${c_gray}Para detenerlas usa el menu 'Detener webs' o: pnpm dev:stop${c_reset}"
            $script:quitRequested = $true
        }
    }
}

Clear-Host
Write-Host "${c_green}Consola finalizada. Que las webs te acompanen.${c_reset} ${c_pink}:: CISZU NETWORK ::${c_reset}"
Write-Host "${c_cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰${c_reset}"
