# CISZU Network portable PowerShell profile.
# Windows PowerShell 5.1+ / PowerShell 7+. ASCII-safe for legacy consoles.

$script:CiszuRepo = if ($env:CISZU_REPO -and (Test-Path -LiteralPath $env:CISZU_REPO)) {
  (Resolve-Path -LiteralPath $env:CISZU_REPO).Path
} else {
  (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}

$script:CiszuApps = [ordered]@{
  network  = 'ciszunetwork-website'
  antony   = 'ciszukoantony-website'
  ciszubot = 'ciszubot-website'
  muzic    = 'muzicmania-website'
}
$script:CiszuDevKeys = @('network', 'antony', 'ciszubot', 'muzic')

$script:CiszuShowBanner = $env:CISZU_PROFILE_BANNER -ne '0'

$e = [char]27
$c_cyan = "${e}[38;2;52;226;226m"
$c_pink = "${e}[38;2;255;92;144m"
$c_purple = "${e}[38;2;173;69;255m"
$c_green = "${e}[38;2;138;226;52m"
$c_yellow = "${e}[38;2;221;176;85m"
$c_red = "${e}[38;2;255;80;80m"
$c_blue = "${e}[38;2;59;130;246m"
$c_white = "${e}[38;2;230;235;245m"
$c_gray = "${e}[38;2;120;130;145m"
$c_reset = "$e[0m"

$artWidth = 120
try {
  $h = $Host.UI.RawUI
  if ($artWidth -gt $h.WindowSize.Width) {
    $buf = $h.BufferSize
    $buf.Width = $artWidth
    $h.BufferSize = $buf
    $win = $h.WindowSize
    $win.Width = [Math]::Min(500, $artWidth)
    $h.WindowSize = $win
  }
} catch {}

if ($script:CiszuShowBanner -and $Host.Name -match 'ConsoleHost') {
  Write-Host "${c_cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰${c_reset}"
  Write-Host "                 ${c_blue}CISZU NETWORK${c_reset} ${c_purple}| PORTABLE PROFILE | CLI | TUI${c_reset}"
  Write-Host "${c_cyan}☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰${c_reset}"
}

try {
  $prl = Get-Module PSReadLine -ListAvailable | Sort-Object Version -Descending | Select-Object -First 1
  if ($prl -and $prl.Version -ge [version]'2.1.0') {
    Import-Module PSReadLine -RequiredVersion $prl.Version -Force
    if ($PSVersionTable.PSVersion.Major -ge 7) {
      Set-PSReadLineOption -PredictionSource HistoryAndPlugin
    } else {
      Set-PSReadLineOption -PredictionSource History
    }
    Set-PSReadLineOption -PredictionViewStyle InlineView
    Set-PSReadLineOption -EditMode Windows
    Set-PSReadLineOption -MaximumHistoryCount 10000
    Set-PSReadLineOption -HistorySaveStyle SaveIncrementally
    Set-PSReadLineOption -Colors @{
      Command = $c_cyan
      Parameter = $c_pink
      String = $c_green
      Variable = $c_yellow
      Operator = $c_white
      Comment = $c_gray
    }
    Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
    Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
    Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
    try { Set-PSReadLineOption -HistorySearchCursorMovesToEnd } catch {}
  } else {
    Import-Module PSReadLine -Force
  }
} catch {
  $msg = "$_"
  if ($env:CISZU_PROFILE_DEBUG -eq '1' -and $msg -notmatch 'virtual terminal processing|prediction plugin source|prediction .* not supported') {
    Write-Warning "PSReadLine skip: $msg"
  }
}

$script:CiszuGitCache = @{ Path = ''; Branch = ''; At = [datetime]::MinValue }
function Get-CiszuGitBranch {
  $now = Get-Date
  if ($script:CiszuGitCache.Path -eq $PWD.Path -and ($now - $script:CiszuGitCache.At).TotalSeconds -lt 2) {
    return $script:CiszuGitCache.Branch
  }
  $branch = git rev-parse --abbrev-ref HEAD 2>$null
  if ($LASTEXITCODE -ne 0) { $branch = $null }
  $script:CiszuGitCache = @{ Path = $PWD.Path; Branch = $branch; At = $now }
  return $branch
}

function prompt {
  $p = $PWD.Path
  if ($p.StartsWith($HOME)) { $p = $p.Replace($HOME, '~') }
  if ($script:CiszuRepo -and $p.Contains($script:CiszuRepo)) { $p = $p.Replace($script:CiszuRepo, '[repo]') }
  $time = Get-Date -Format 'HH:mm'
  $user = "$env:USERNAME@$env:COMPUTERNAME"
  $branch = Get-CiszuGitBranch
  $g = if ($branch) { "${c_pink}($branch) ⛕${c_reset}" } else { "${c_red} No git branch ✘${c_reset}" }
  "${c_cyan} ✦ BIENVENIDO CISZU ✦ ${c_reset} 〔Repo: $g ︙ Time: [$time] ✇ ︙ Usuario: [$user] ㋡〕 ${c_reset}${c_cyan}✦${c_reset}${c_purple} `n
  ♥︎ INGRESAR COMANDO ${c_reset}${c_cyan}➤ ➤ ➤ ${c_purple} "
}

if (Get-Command git -ErrorAction SilentlyContinue) {
  Set-Alias -Name g -Value git -Force
}
function ll { Get-ChildItem -Force @args }
Set-Alias -Name pn -Value pnpm -Force -ErrorAction SilentlyContinue

function repo { Set-Location -LiteralPath $script:CiszuRepo }
function dev {
  param(
    [string]$App = 'network',
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Rest
  )
  $filter = $script:CiszuApps[$App]
  if (-not $filter) { $filter = $App }
  pnpm --filter $filter dev @Rest
}
function buildall { pnpm turbo run build @args }
function lintall { pnpm lint:all @args }
function testall { pnpm test:all @args }
function cdnupload { pnpm cdn:upload @args }
function cdnverify { pnpm cdn:verify @args }
function gs { git status --short @args }
function gd { git diff @args }
function glog { git log --oneline --graph --decorate -20 @args }
function gpull { git pull --ff-only @args }
function gp { git push @args }

function Add-CiszuSafeAll {
  $status = git status --porcelain -uall 2>$null
  if ($LASTEXITCODE -ne 0) { return $false }
  $bad = @($status | ForEach-Object { $_.Substring(3).Trim('"') } | Where-Object {
    $_ -match '(^|/)\.env($|\.)|SECRET_TEMP\.env$|\.age$'
  })
  if ($bad.Count -gt 0) {
    Write-Host 'Commit bloqueado: hay archivos sensibles en el stage potencial:' -ForegroundColor Red
    $bad | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    return $false
  }
  git add -A
  return ($LASTEXITCODE -eq 0)
}

function gc {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Message)
  if (-not $Message) { Write-Host 'Uso: gc "mensaje de commit"' -ForegroundColor Yellow; return }
  if (Add-CiszuSafeAll) { git commit -m ($Message -join ' ') }
}
function gcp {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Message)
  if (-not $Message) { Write-Host 'Uso: gcp "mensaje de commit"' -ForegroundColor Yellow; return }
  if (Add-CiszuSafeAll) {
    git commit -m ($Message -join ' ')
    if ($LASTEXITCODE -eq 0) { git push }
  }
}

function touch {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Path)
  New-Item -ItemType File -Path $Path -Force | Out-Null
}
function pgrep { param([string]$Name) Get-Process -Name $Name }
function duff { param([string]$Filter) Get-ChildItem -Recurse -Filter $Filter -File }

function doctor { pnpm run doctor @args }
function cmds { pnpm commands @args }
function opsstatus { pnpm ops:status @args }
function opsdigest { pnpm ops:digest @args }
function opsreport { pnpm ops:report @args }
function cleannext { pnpm clean:next @args }
function cleanlogs { pnpm clean:logs @args }
function cleanall { pnpm clean:all @args }
function profile-reload { . $PROFILE }
function profile-edit { notepad $PROFILE }
function profile-path { Write-Output $PROFILE; Write-Output $script:CiszuRepo }
function free {
  Get-PSDrive -PSProvider FileSystem |
    Where-Object { $_.Name -in @('C', 'E') } |
    Select-Object Name, @{n = 'FreeGB'; e = { [math]::Round($_.Free / 1GB, 2) } }
}
function ports {
  foreach ($port in 3000..3003) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    $state = if ($conn) { 'LISTEN' } else { 'free' }
    Write-Output ("{0}: {1}" -f $port, $state)
  }
}

$osintRoot = Join-Path $script:CiszuRepo 'tools\cibersecurity\osint'
function osint { & (Join-Path $osintRoot 'osint.ps1') @args }
function osint-mai { & (Join-Path $osintRoot 'maigret.ps1') @args }
function osint-sher { & (Join-Path $osintRoot 'sherlock.ps1') @args }
function osint-slo { & (Join-Path $osintRoot 'simplelogin.ps1') @args }
function osint-sfx { & (Join-Path $osintRoot 'spiderfoot.ps1') @args }
function maltego { & (Join-Path $script:CiszuRepo 'tools\cibersecurity\maltego\maltego.ps1') @args }

$AI_IMG = Join-Path $script:CiszuRepo 'tools\image-ai\generate-art.js'
$AI_MUS = Join-Path $script:CiszuRepo 'tools\music-ai\generate-music.js'
$AI_VID = Join-Path $script:CiszuRepo 'tools\video-ai\generate-video.js'
$AI_RMB = Join-Path $script:CiszuRepo 'tools\removebg-ai\remove-bg.js'
$AI_TXT = Join-Path $script:CiszuRepo 'tools\ascii-ai\textart.js'
function art { node $AI_IMG @args }
function music { node $AI_MUS @args }
function video { node $AI_VID @args }
function removebg { node $AI_RMB @args }
function textart { node $AI_TXT @args }

function test { pnpm test @args }
function testui { pnpm test:ui --open @args }
function testwatch { pnpm test:watch @args }
function e2e { pnpm e2e @args }
function e2egui { pnpm e2e @args; if ($LASTEXITCODE -eq 0) { pnpm exec playwright show-report } }
function sb { pnpm --filter @ciszu/ui storybook @args }
function sbtest { pnpm --filter @ciszu/ui test:storybook @args }
function sbwatch { pnpm --filter @ciszu/ui exec vitest --config vitest.config.mts @args }
function sbbuild { pnpm --filter @ciszu/ui build-storybook @args }
function sbchrom { pnpm --filter @ciszu/ui chromatic @args }
function pwopen { pnpm exec playwright show-report test/website/e2e/reports/playwright @args }
function pwcode { pnpm exec playwright codegen --browser chromium $(if ($args) { "http://$args" } else { 'https://ciszunetwork.vercel.app' }) }
function pwinst { pnpm exec playwright install --with-deps chromium @args }

$DEV_CONSOLE = Join-Path $script:CiszuRepo 'tools\consoles\devcon.ps1'
function devcon { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE @args }
function devall { foreach ($w in $script:CiszuDevKeys) { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action start -Web $w } }
function devstop { foreach ($w in $script:CiszuDevKeys) { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action stop -Web $w } }
function devstatus { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action status }
function devlog {
  param([string]$Web)
  $key = if ($script:CiszuApps.Contains($Web)) { $Web } else { $Web }
  powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action log -Web $key
}
function devweb { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action start -Web network @args }
function devantony { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action start -Web antony @args }
function devbotweb { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action start -Web ciszubot @args }
function devmuzic { powershell -NoProfile -ExecutionPolicy Bypass -File $DEV_CONSOLE -Action start -Web muzic @args }

$STAFF_CONSOLE = Join-Path $script:CiszuRepo 'tools\consoles\staffcon.ps1'
$CUSTOMERS_CONSOLE = Join-Path $script:CiszuRepo 'tools\consoles\customerscon.ps1'
function staffcon { powershell -NoProfile -ExecutionPolicy Bypass -File $STAFF_CONSOLE @args }
function customerscon { powershell -NoProfile -ExecutionPolicy Bypass -File $CUSTOMERS_CONSOLE @args }

function checkall {
  Write-Host '== Unit (Vitest) ==' -ForegroundColor Cyan
  pnpm test
  if ($LASTEXITCODE -ne 0) { return }
  Write-Host '== Component (Storybook) ==' -ForegroundColor Cyan
  pnpm --filter @ciszu/ui test:storybook
}

function ciszuh {
  Write-Host "`n== CISZU NETWORK - COMANDOS ==" -ForegroundColor Cyan
  Write-Host "`n[ DevOps ]" -ForegroundColor Green
  Write-Host '  doctor        pnpm run doctor'
  Write-Host '  cmds          pnpm commands (pnpm + opencode + perfil)'
  Write-Host '  opsstatus     estado de sistemas (dry-run)'
  Write-Host '  opsdigest     resumen de metricas (dry-run)'
  Write-Host '  opsreport     informe semanal (dry-run)'
  Write-Host '  cleannext / cleanlogs / cleanall'
  Write-Host '  profile-reload / profile-edit / profile-path'
  Write-Host "`n[ Git ]" -ForegroundColor Green
  Write-Host '  gs  gd  glog  gpull  gp'
  Write-Host '  gc "msg" / gcp "msg"  (bloquea .env y secretos)'
  Write-Host "`n[ Workspace ]" -ForegroundColor Green
  Write-Host '  repo  dev <network|antony|ciszubot|muzic>'
  Write-Host '  buildall  lintall  testall  cdnupload  cdnverify'
  Write-Host "`n[ Testing ]" -ForegroundColor Green
  Write-Host '  test  testui  testwatch  e2e  e2egui  checkall'
  Write-Host '  sb  sbtest  sbwatch  sbbuild  sbchrom'
  Write-Host "`n[ Dev local ]" -ForegroundColor Green
  Write-Host '  devcon  devall  devstop  devstatus  devlog <web>'
  Write-Host '  devweb  devantony  devbotweb  devmuzic'
  Write-Host "`n[ Datos y consolas ]" -ForegroundColor Green
  Write-Host '  staffcon  customerscon  free  ports'
  Write-Host "`n[ Contenido ]" -ForegroundColor Green
  Write-Host '  art  music  video  removebg  textart'
  Write-Host '  osint  osint-mai  osint-sher  osint-slo  osint-sfx  maltego'
  Write-Host ''
}
Set-Alias -Name czhelp -Value ciszuh -Force

function Get-CiszuPnpmScripts {
  $pkg = Join-Path $script:CiszuRepo 'package.json'
  if (-not (Test-Path -LiteralPath $pkg)) { return @() }
  try {
    return (Get-Content -LiteralPath $pkg -Raw | ConvertFrom-Json).scripts.PSObject.Properties.Name
  } catch {
    return @()
  }
}

Register-ArgumentCompleter -Native -CommandName pnpm -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  Get-CiszuPnpmScripts |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}

Register-ArgumentCompleter -CommandName dev -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $script:CiszuDevKeys |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}
Register-ArgumentCompleter -CommandName devlog -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $script:CiszuDevKeys |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}

Register-ArgumentCompleter -Native -CommandName git -ScriptBlock {
  param($wordToComplete, $commandAst, $cursorPosition)
  $elements = @($commandAst.CommandElements | ForEach-Object { $_.Extent.Text })
  if (-not ($elements | Where-Object { $_ -match '^(checkout|switch|merge|rebase|branch)$' })) { return }
  git branch --format='%(refname:short)' 2>$null |
    Where-Object { $_ -like "$wordToComplete*" } |
    ForEach-Object { [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_) }
}

function Show-CiszuHeader {
  $artFile = Join-Path $HOME '.config\powershell-banners-custom\ciszu-banner-logo.ansi'
  if (Test-Path -LiteralPath $artFile) {
    Get-Content -LiteralPath $artFile -Encoding UTF8 | ForEach-Object { Write-Host $_ }
  }
  Write-Host ''
}
if ($script:CiszuShowBanner) {
  Show-CiszuHeader
}
