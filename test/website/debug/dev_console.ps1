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
  ciszunetwork-website  -> 3000   (Ciszu Network)
  ciszukantony-website  -> 3001   (Ciszuko Antony)
  ciszubot-website      -> 3002   (CiszuBot)
  muzicmania-website    -> 3003   (MuzicMania)

.EXAMPLE
  .\test\website\debug\dev_console.ps1           # modo TUI interactivo
  .\test\website\debug\dev_console.ps1 -Demo     # imprime el menu sin loops
#>

[CmdletBinding()]
param(
    [switch]$Demo,
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
    @{ key = 'network';  name = 'Ciszu Network';  filter = 'ciszunetwork-website'; port = 3000; dir = 'projects/ciszu/website' },
    @{ key = 'antony';   name = 'Ciszuko Antony'; filter = 'ciszukantony-website'; port = 3001; dir = (Get-ChildItem projects -Directory | Where-Object { $_.Name -match 'antony' } | Select-Object -First 1).Name + '/website' },
    @{ key = 'ciszubot'; name = 'CiszuBot';       filter = 'ciszubot-website';     port = 3002; dir = 'projects/ciszubot/website' },
    @{ key = 'muzic';    name = 'MuzicMania';     filter = 'muzicmania-website';   port = 3003; dir = 'projects/muzicmania/website' }
)

$VERSION = '1.0.0'
$LOG_DIR = Join-Path $root '.opencode\temp\dev-logs'

# ---------- Arte ASCII ----------
$ART = @'
  ____ ___  ____ ___  ____ __  __
 / ___/ _ \/ ___|_ _||__  / |/ /   _   _
| |  | | | \___ \| |   / /| ' /   (_) (_)
| |__| |_| |___) | |  / /_| . \    _   _
 \____\___/|____/|___|/_// |_|\_\ (_) (_)
'@

# ---------- Colores de estado ----------
function Get-WebState([string]$port) {
    $null = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($?) { return $true } else { return $false }
}

function Format-State($running) {
    if ($running) { return "${c_green}[ENCENDIDA]${c_reset}" }
    return "${c_gray}[DETENIDA]${c_reset}"
}

# ---------- Launcher / Stopper ----------
function Start-WebByKey([string]$key) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    if (Get-WebState $w.port) { Write-Host "${c_yellow}Ya encendida (port $($w.port)).${c_reset}"; return }

    if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null }
    $logFile = Join-Path $LOG_DIR "$key.log"
    $cmd = "Set-Location '$root'; pnpm --filter $($w.filter) dev -p $($w.port)"
    $proc = Start-Process -FilePath 'powershell.exe' -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $cmd `
        -WindowStyle Hidden -RedirectStandardOutput $logFile -RedirectStandardError "$logFile.err" -PassThru

    Write-Host "${c_cyan}Encendiendo ${c_pink}$($w.name)${c_cyan} -> http://localhost:$($w.port)${c_reset}"
    Write-Host "${c_gray}Log: $logFile${c_reset}"

    Start-Sleep -Seconds 5
    if (Get-WebState $w.port) { Write-Host "${c_green}[OK] ${c_reset}respondiendo en localhost:$($w.port)" }
    else { Write-Host "${c_yellow}[esperando]${c_reset} el compilador sigue arrancando (revisa estado en el menu)" }
}

function Stop-WebByKey([string]$key) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    if (-not $w) { return }
    $conns = Get-NetTCPConnection -LocalPort $w.port -State Listen -ErrorAction SilentlyContinue
    foreach ($c in $conns) {
        try {
            Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
        } catch { }
    }
    Write-Host "${c_pink}Web $($w.name)${c_gray} detenida (puerto $($w.port) liberado).${c_reset}"
}

# Accion selectiva sobre una web concreta
function Invoke-WebAction($w) {
    $running = Get-WebState $w.port
    $opts = @(
        @{ l = "Encender";  act = { Start-WebByKey $w.key } },
        @{ l = "Reiniciar"; act = { Stop-WebByKey $w.key; Start-WebByKey $w.key } },
        @{ l = "Detener";   act = { Stop-WebByKey $w.key } },
        @{ l = "Abrir en navegador - http://localhost:$($w.port)"; act = { Start-Process "http://localhost:$($w.port)" } },
        @{ l = "Ver log (tiempo real)"; act = { Show-Log $w.key } }
    )
    $sel = Show-Menu -Title ("Gestionar  " + $w.name + "  [port " + $w.port + "] - estado " + $(if ($running) {'ENCENDIDA'} else {'DETENIDA'})) -Options $opts
    if ($sel -ge 0) { & $opts[$sel].act }
    Press-Continue
}

# ---------- Log en tiempo real (ventana propia, no rompe el TUI) ----------
function Show-Log([string]$key) {
    $w = $WEBS | Where-Object { $_.key -eq $key }
    $logFile = Join-Path $LOG_DIR "$key.log"
    if (-not (Test-Path $logFile)) {
        Write-Host "${c_yellow}Sin log todavia. Enciende la web primero.${c_reset}"
        Press-Continue
        return
    }
    # Ventana PowerShell separada: Get-Content -Wait en vivo. Cerrar la ventana
    # del log no afecta al TUI.
    $cmd = "Get-Content '" + $logFile + "' -Tail 80 -Wait"
    Start-Process powershell.exe -ArgumentList '-NoLogo', '-NoExit', '-Command', "& { $cmd }" | Out-Null
    Write-Host "${c_white}Log en vivo abierto en ventana separada.${c_reset}"
}

# ---------- Estado global / Puertos / Links ----------
function Show-Status {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}==================  ESTADO DE PUERTOS  ==================${c_reset}"
    foreach ($w in $WEBS) {
        $running = Get-WebState $w.port
        $url = "http://localhost:$($w.port)"
        $st = Format-State $running
        Write-Host ("{0}  {1,-16} port {2,-4} {3}" -f $st, $w.name, $w.port, $url)
    }
    Write-Host ""
    Write-Host "${c_gray}Consejo: podes explorar cada web con el navegador y, si algo falla,${c_reset}"
    Write-Host "${c_gray}abrir el log en tiempo real desde la accion de la web.${c_reset}"
    Write-Host ""
    Press-Continue
}

# ---------- Menu navegable con flechas ----------
function Show-Menu {
    param([string]$Title, [object[]]$Options, [int]$ShowStatus = 0)
    $i = 0
    while ($true) {
        Clear-Host
        Show-Art
        Write-Host "${c_pink}==  $Title  ==${c_reset}"
        Write-Host "${c_gray}(usa ↑/↓ para moverte y Enter para elegir; Q para volver)${c_reset}"
        Write-Host ""
        for ($n = 0; $n -lt $Options.Count; $n++) {
            $prefix = if ($n -eq $i) { "${c_cyan}  >>>  ${c_reset}" } else { "       " }
            $suffix = if ($Options[$n].s) { "  " + $Options[$n].s } else { "" }
            Write-Host ("{0}{1}{2}" -f $prefix, $Options[$n].l, $suffix)
        }
        Write-Host ""

        $key = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        $k = $key.Key
        if ($k -eq 'UpArrow')   { if ($i -gt 0) { $i-- } }
        elseif ($k -eq 'DownArrow') { if ($i -lt $Options.Count - 1) { $i++ } }
        elseif ($k -eq 'Enter') { return $i }
        elseif ($k -eq 'Q' -or $k -eq 'Escape') { return -1 }
    }
}

function Show-Art {
    Write-Host "${c_cyan}$ART${c_reset}"
    Write-Host "${c_pink}                          C I S Z U   N E T W O R K${c_reset}"
    Write-Host "${c_gray}                    console dev debugging  v$VERSION${c_reset}"
    Write-Host ""
}

function Press-Continue {
    Write-Host ""
    Write-Host "${c_gray}Pulsa una tecla para continuar...${c_reset}"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# ---------- Ayuda / creditos / version ----------
function Show-Help {
    Clear-Host
    Show-Art
    Write-Host "${c_cyan}====================  MANUAL DE USO  ====================${c_reset}"
    Write-Host ""
    Write-Host "${c_white}Objetivo:${c_reset} encender, reiniciar o detener las 4 webs de`
Ciszu Network en local (Next.js dev) sin abrir terminales a mano."
    Write-Host ""
    Write-Host "${c_cyan}Puertos fijos (nomenclatura del monorepo):${c_reset}"
    foreach ($w in $WEBS) {
        Write-Host ("   {0,-16} -> http://localhost:{1}   ({2})" -f $w.name, $w.port, $w.dir)
    }
    Write-Host ""
    Write-Host "${c_cyan}Atajos:${c_reset}"
    Write-Host "   Up/Down     mover el cursor"
    Write-Host "   Enter       elegir la opcion"
    Write-Host "   Q / Esc     volver al menu anterior"
    Write-Host ""
    Write-Host "${c_gray}Los logs se guardan en: .opencode\temp\dev-logs\<web>.log${c_reset}"
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
    Write-Host "${c_gray}Package:       pnpm ${c_reset}dispatch"
    Write-Host "${c_gray}Next locales:  ${c_reset}3000 · 3001 · 3002 · 3003"
    Press-Continue
}

# ---------- Herramientas extra ----------
function Show-Tools {
    $opts = @(
        @{ l = "Limpiar logs (.opencode/temp/dev-logs)";  act = { Remove-Item "$LOG_DIR\*" -Force -ErrorAction SilentlyContinue; Write-Host "${c_green}Logs limpiados.${c_reset}"; Press-Continue } },
        @{ l = "Ver memoria / procesos node";              act = { Clear-Host; Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName, @{n='RAM MB';e={[math]::Round($_.WorkingSet64/1MB)}} | Format-Table | Out-Host; Press-Continue } },
        @{ l = "Ver que puertos 3000-3003 estan ocupados"; act = { Clear-Host; foreach ($p in 3000..3003) { $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue; if ($c) { Write-Host "${c_pink}Port $p -> PID $($c.OwningProcess)${c_reset}" } else { Write-Host "${c_gray}Port $p -> libre${c_reset}" } }; Press-Continue } }
    )
    $sel = Show-Menu -Title "Herramientas extra" -Options $opts
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
                $running = Get-WebState $ww.port
                Write-Host ("{0}  {1,-16} port {2,-4} http://localhost:{3}" -f $(if ($running) {'[ON] '} else {'[OFF]'}), $ww.name, $ww.port, $ww.port)
            }
        }
        'help' {
            Show-Help
        }
        default {
            if (-not $w) { Write-Host "${c_red}Web no valida. Usa: network | antony | ciszubot | muzic${c_reset}"; exit 1 }
            switch ($Action) {
                'start'   { Start-WebByKey $w.key }
                'stop'    { Stop-WebByKey $w.key }
                'restart' { Stop-WebByKey $w.key; Start-WebByKey $w.key }
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
        $running = Get-WebState $w.port
        $url = "http://localhost:$($w.port)"
        $st = Format-State $running
        Write-Host ("{0}  {1,-16} port {2,-4} {3}" -f $st, $w.name, $w.port, $url)
    }
    Write-Host ""
    Write-Host "${c_gray}(modo demo: sin menu interactivo)${c_reset}"
    exit 0
}

# ---------- Menu principal ----------
Clear-Host
Show-Art
Write-Host "${c_gray}Bienvenido. Selecciona una web o una accion global.${c_reset}"
Write-Host ""

while ($true) {
    $optWebs = $WEBS | ForEach-Object {
        [PSCustomObject]@{ l = ("{0}  port {1}" -f $_.name, $_.port); key = $_.key }
    }

    $menuItems = @(
        @{ l = "Web  " + $WEBS[0].name;   key = 'network' },
        @{ l = "Web  " + $WEBS[1].name;   key = 'antony' },
        @{ l = "Web  " + $WEBS[2].name;   key = 'ciszubot' },
        @{ l = "Web  " + $WEBS[3].name;   key = 'muzic' },
        @{ l = "Encender TODAS las webs"; key = '__all_start' },
        @{ l = "Detener TODAS las webs";  key = '__all_stop' },
        @{ l = "Estado de puertos / links";   key = '__status' },
        @{ l = "Herramientas extra";          key = '__tools' },
        @{ l = "Ayuda (manual de uso)";       key = '__help' },
        @{ l = "Creditos";                    key = '__credits' },
        @{ l = "Version";                     key = '__version' },
        @{ l = "Salir";                       key = '__quit' }
    )

    $sel = Show-Menu -Title "CONSOLE DEV DEBUGGING - menu principal" -Options $menuItems
    if ($sel -lt 0) { break }

    $key = $menuItems[$sel].key

    switch ($key) {
        '__all_start' {
            foreach ($w in $WEBS) { Start-WebByKey $w.key }
            Press-Continue
        }
        '__all_stop' {
            foreach ($w in $WEBS) { Stop-WebByKey $w.key }
            Press-Continue
        }
        '__status'  { Show-Status }
        '__tools'   { Show-Tools }
        '__help'    { Show-Help }
        '__credits' { Show-Credits }
        '__version' { Show-Version }
        '__quit'    { break }
        default {
            $w = $WEBS | Where-Object { $_.key -eq $key }
            if ($w) { Invoke-WebAction $w }
        }
    }
}

Clear-Host
Write-Host "${c_green}Consola finalizada. Que las webs te acompaen.${c_reset} ${c_pink}:: CISZU NETWORK ::${c_reset}"