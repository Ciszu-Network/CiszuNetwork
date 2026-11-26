param([switch]$SkipBuild, [switch]$AllowUnsignedPolicy, [string]$PolicyKeyFile = $env:MUZIC_RELEASE_POLICY_PRIVATE_KEY_FILE)

$ErrorActionPreference = "Stop"

$LauncherRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $LauncherRoot
$RepoRoot = Split-Path -Parent (Split-Path -Parent $ProjectRoot)
$SignScript = Join-Path $RepoRoot "shared\scripts\sign-windows.ps1"
$WebsiteRoot = Join-Path $ProjectRoot "website"
$TauriCli = Join-Path $WebsiteRoot "node_modules\.bin\tauri.cmd"
$PatchScript = Join-Path $WebsiteRoot "scripts\patch-nsis-lang.ps1"
$TargetRoot = Join-Path $LauncherRoot "src-tauri\target\x86_64-pc-windows-msvc\release"
$Installer = Join-Path $TargetRoot "nsis\x64\nsis-output.exe"
$NsisWork = Join-Path $TargetRoot "nsis"
$ConfigPath = Join-Path $LauncherRoot "build.config.json"
$BuildInfoPath = Join-Path $LauncherRoot "src-tauri\splash\build-info.js"
$CargoPath = Join-Path $LauncherRoot "src-tauri\Cargo.toml"
$TauriConfigPath = Join-Path $LauncherRoot "src-tauri\tauri.conf.json"

if (-not (Test-Path $ConfigPath)) {
    throw "No se encontro build.config.json en $ConfigPath"
}
if (-not (Test-Path $TauriCli)) {
    throw "Tauri CLI no encontrado en $TauriCli"
}

$Config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json
$LauncherVersion = [string]$Config.launcherVersion
$GameVersion = [string]$Config.gameVersion
$Channel = ([string]$Config.channel).ToLowerInvariant()
$BuildDate = [string]$Config.buildDate
$ChangelogUrl = [string]$Config.changelogUrl
$ReleaseTag = [string]$Config.releaseTag
$MinimumWindows = [string]$Config.minimumWindows

if (-not $PolicyKeyFile -and -not $AllowUnsignedPolicy) {
    throw "Falta la clave privada de politica. Usa -PolicyKeyFile o MUZIC_RELEASE_POLICY_PRIVATE_KEY_FILE; para desarrollo usa -AllowUnsignedPolicy."
}
if ($PolicyKeyFile -and -not (Test-Path $PolicyKeyFile)) {
    throw "No existe el archivo de clave de politica: $PolicyKeyFile"
}

if ($LauncherVersion -notmatch '^\d+\.\d+\.\d+$') {
    throw "launcherVersion invalida: $LauncherVersion"
}
if ($GameVersion -notmatch '^\d+\.\d+\.\d+$') {
    throw "gameVersion invalida: $GameVersion"
}
if ($Channel -notin @("beta", "release", "testing")) {
    throw "channel invalido: $Channel (usa beta, release o testing)"
}

function Write-Utf8NoBom {
    param([string]$Path, [string]$Value)
    [IO.File]::WriteAllText($Path, $Value, (New-Object System.Text.UTF8Encoding($false)))
}

function Set-PackageVersions {
    param([string]$Version)

    $cargo = Get-Content -LiteralPath $CargoPath -Raw
    $cargoUpdated = [regex]::Replace(
        $cargo,
        '(?m)(^\[package\][\s\S]*?^version\s*=\s*")[^"]+(")',
        '${1}' + $Version + '${2}',
        1
    )
    if ($cargoUpdated -ne $cargo) {
        Write-Utf8NoBom -Path $CargoPath -Value $cargoUpdated
    }

    $tauri = Get-Content -LiteralPath $TauriConfigPath -Raw
    $tauriUpdated = [regex]::Replace(
        $tauri,
        '("version"\s*:\s*")[^"]+(")',
        '${1}' + $Version + '${2}',
        1
    )
    if ($tauriUpdated -ne $tauri) {
        Write-Utf8NoBom -Path $TauriConfigPath -Value $tauriUpdated
    }
}

function Write-BuildInfo {
    $info = [ordered]@{
        launcherVersion = $LauncherVersion
        gameVersion = $GameVersion
        channel = $Channel
        buildDate = $BuildDate
        changelogUrl = $ChangelogUrl
        releaseTag = $ReleaseTag
    }
    $json = $info | ConvertTo-Json -Depth 4
    Write-Utf8NoBom -Path $BuildInfoPath -Value ("window.MUZIC_BUILD = " + $json + ";`n")
}

function Copy-Download {
    param(
        [string]$Source,
        [string]$DestinationRoot,
        [string]$RelativePath,
        [string]$FileName
    )

    $archiveDir = Join-Path (Join-Path $DestinationRoot $RelativePath) (Join-Path $LauncherVersion $Channel)
    New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
    $archivePath = Join-Path $archiveDir $FileName
    Copy-Item -LiteralPath $Source -Destination $archivePath -Force
    return $archivePath
}

Set-PackageVersions -Version $LauncherVersion
Write-BuildInfo

if (-not $SkipBuild) {
    if (Test-Path $NsisWork) {
        Remove-Item -LiteralPath $NsisWork -Recurse -Force
    }

    Push-Location $LauncherRoot
    try {
        & $TauriCli build --target x86_64-pc-windows-msvc --bundles nsis --ci --no-sign
        if ($LASTEXITCODE -ne 0) { throw "Tauri build fallo con codigo $LASTEXITCODE" }
    } finally {
        Pop-Location
    }

    $AppBinary = Join-Path $TargetRoot "muzicmania.exe"
    & powershell -NoProfile -ExecutionPolicy Bypass -File $SignScript -File $AppBinary
    if ($LASTEXITCODE -ne 0) { throw "La firma del binario fallo con codigo $LASTEXITCODE" }

    & powershell -NoProfile -ExecutionPolicy Bypass -File $PatchScript
    if ($LASTEXITCODE -ne 0) { throw "El parche NSIS fallo con codigo $LASTEXITCODE" }

    if (-not (Test-Path $Installer)) {
        throw "No se encontro el instalador final en $Installer"
    }

    & powershell -NoProfile -ExecutionPolicy Bypass -File $SignScript -File $Installer
    if ($LASTEXITCODE -ne 0) { throw "La firma del instalador fallo con codigo $LASTEXITCODE" }
}
if (-not (Test-Path $Installer)) {
    throw "No se encontro el instalador final en $Installer (usa sin -SkipBuild para compilarlo)"
}
$Size = (Get-Item $Installer).Length
if ($Size -lt 1000000) {
    throw "El instalador es demasiado pequeno: $Size bytes"
}

$WebsiteDownloads = Join-Path $WebsiteRoot "public\downloads"
$WebsiteData = Join-Path $WebsiteRoot "src\data"
$ManifestBuilder = Join-Path $RepoRoot "scripts\build-release-manifest.mjs"
$ReleaseManifest = Join-Path $LauncherRoot "release-manifest.json"
$ReleaseSignature = Join-Path $LauncherRoot "release-manifest.sig"
$LauncherDownloads = Join-Path $LauncherRoot "downloads"
New-Item -ItemType Directory -Path $WebsiteDownloads -Force | Out-Null
New-Item -ItemType Directory -Path $LauncherDownloads -Force | Out-Null

$Targets = @(
    [ordered]@{ Os = "windows10"; Relative = "windows/x64"; Label = "Windows 10" },
    [ordered]@{ Os = "windows11"; Relative = "windows/x64"; Label = "Windows 11" }
)
$Hash = (Get-FileHash -LiteralPath $Installer -Algorithm SHA256).Hash
$Entries = @()
$Files = @{}

foreach ($Target in $Targets) {
    $FileName = "MuzicMania_Game-v${GameVersion}_Launcher-v${LauncherVersion}_${Channel}_$($Target.Os)_x64.exe"
    $WebsiteArchive = Copy-Download -Source $Installer -DestinationRoot $WebsiteDownloads -RelativePath $Target.Relative -FileName $FileName
    $LauncherArchive = Copy-Download -Source $Installer -DestinationRoot $LauncherDownloads -RelativePath $Target.Relative -FileName $FileName
    $RelativeUrl = "windows/x64/$LauncherVersion/$Channel/$FileName"

    $entry = [ordered]@{
        launcherVersion = $LauncherVersion
        gameVersion = $GameVersion
        channel = $Channel
        os = $Target.Os
        osLabel = $Target.Label
        arch = "x64"
        minimumWindows = $MinimumWindows
        fileName = $FileName
        path = $RelativeUrl
        size = $Size
        sha256 = $Hash
        buildDate = $BuildDate
        changelogUrl = $ChangelogUrl
        releaseTag = $ReleaseTag
    }
    $Entries += $entry
    $Files[$Target.Os] = $entry

    Write-Host "Archivado: $WebsiteArchive" -ForegroundColor DarkGray
    Write-Host "Archivado: $LauncherArchive" -ForegroundColor DarkGray
}

function Update-Registry {
    param([string]$Root)

    New-Item -ItemType Directory -Path $Root -Force | Out-Null
    $registryPath = Join-Path $Root "registry.json"
    $previous = @()
    if (Test-Path $registryPath) {
        try {
            $loaded = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
            if ($loaded -is [array]) { $previous = $loaded } elseif ($loaded) { $previous = @($loaded) }
        } catch {
            $previous = @()
        }
    }

    $kept = @($previous | Where-Object {
        -not ($_.launcherVersion -eq $LauncherVersion -and $_.channel -eq $Channel -and $_.os -in @("windows10", "windows11"))
    })
    $registry = @($kept + $Entries | Sort-Object -Property @{ Expression = { [version]$_.launcherVersion }; Descending = $true }, channel, os)
    Write-Utf8NoBom -Path $registryPath -Value ($registry | ConvertTo-Json -Depth 6)

    $release = $registry | Where-Object { $_.channel -eq "release" } | Select-Object -First 1
    $beta = $registry | Where-Object { $_.channel -eq "beta" } | Select-Object -First 1
    $latestPath = Join-Path $Root "latest.json"
    $latest = [ordered]@{
        generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
        launcherVersion = $LauncherVersion
        gameVersion = $GameVersion
        channel = $Channel
        buildDate = $BuildDate
        changelogUrl = $ChangelogUrl
        releaseTag = $ReleaseTag
        files = $Files
        release = $release
        beta = $beta
    }
    Write-Utf8NoBom -Path $latestPath -Value ($latest | ConvertTo-Json -Depth 7)
}

Update-Registry -Root $WebsiteDownloads
Update-Registry -Root $LauncherDownloads

New-Item -ItemType Directory -Path $WebsiteData -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $WebsiteDownloads "registry.json") -Destination (Join-Path $WebsiteData "downloads-registry.json") -Force
Copy-Item -LiteralPath (Join-Path $WebsiteDownloads "latest.json") -Destination (Join-Path $WebsiteData "downloads-latest.json") -Force

if (Test-Path $ManifestBuilder) {
    $manifestArgs = @(
        "--registry", (Join-Path $WebsiteData "downloads-registry.json"),
        "--policy", (Join-Path $LauncherRoot "release-policy.json"),
        "--out", $ReleaseManifest,
        "--signature", $ReleaseSignature
    )
    if ($PolicyKeyFile) { $manifestArgs += @("--key-file", $PolicyKeyFile) }
    & node $ManifestBuilder @manifestArgs
    if ($LASTEXITCODE -ne 0) { throw "La generacion del manifiesto fallo con codigo $LASTEXITCODE" }
    Copy-Item -LiteralPath $ReleaseManifest -Destination (Join-Path $WebsiteData "releases-manifest.json") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $WebsiteData "releases-manifest.sig") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $WebsiteData "releases-manifest.json.sig") -Force
    Copy-Item -LiteralPath $ReleaseManifest -Destination (Join-Path $WebsiteRoot "public\releases-manifest.json") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $WebsiteRoot "public\releases-manifest.sig") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $WebsiteRoot "public\releases-manifest.json.sig") -Force
    Copy-Item -LiteralPath $ReleaseManifest -Destination (Join-Path $LauncherDownloads "releases-manifest.json") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $LauncherDownloads "releases-manifest.sig") -Force
    Copy-Item -LiteralPath $ReleaseSignature -Destination (Join-Path $LauncherDownloads "releases-manifest.json.sig") -Force
} else {
    Write-Warning "No se encontro build-release-manifest.mjs; no se genero el manifiesto."
}

Write-Host "Instalador listo: $Installer" -ForegroundColor Green
Write-Host "Launcher: v$LauncherVersion · Juego: v$GameVersion · Canal: $Channel" -ForegroundColor Green
Write-Host "Tamano: $Size bytes" -ForegroundColor Green
Write-Host "SHA256: $Hash" -ForegroundColor Green








