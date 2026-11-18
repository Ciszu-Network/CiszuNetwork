param(
    [Parameter(Mandatory = $true)]
    [string]$File,
    [string]$CertificatePath = $env:CISZU_CODE_SIGN_CERT,
    [string]$CertificatePassword = $env:CISZU_CODE_SIGN_PASSWORD,
    [string]$TimestampUrl = $(if ($env:CISZU_TIMESTAMP_URL) { $env:CISZU_TIMESTAMP_URL } else { "http://timestamp.digicert.com" })
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $File)) {
    throw "No existe el archivo a firmar: $File"
}

if (-not $CertificatePath) {
    Write-Warning "CISZU_CODE_SIGN_CERT no configurado. El artefacto queda SIN FIRMA."
    exit 0
}

if (-not (Test-Path -LiteralPath $CertificatePath)) {
    throw "No existe el certificado: $CertificatePath"
}

$signTool = (Get-Command signtool.exe -ErrorAction SilentlyContinue | Select-Object -First 1).Source
if (-not $signTool) {
    $kits = @(
        "${env:ProgramFiles(x86)}\Windows Kits\10\bin",
        "$env:ProgramFiles\Windows Kits\10\bin"
    ) | Where-Object { Test-Path -LiteralPath $_ }

    foreach ($kitsRoot in $kits) {
        $candidate = Get-ChildItem -LiteralPath $kitsRoot -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { Join-Path $_.FullName "x64\signtool.exe" } |
            Where-Object { Test-Path -LiteralPath $_ } |
            Select-Object -First 1
        if ($candidate) {
            $signTool = $candidate
            break
        }
    }
}

if (-not $signTool) {
    throw "signtool.exe no encontrado. Instala Windows SDK o firma el archivo manualmente."
}

$arguments = @(
    "sign",
    "/fd", "SHA256",
    "/f", $CertificatePath
)

if ($CertificatePassword) {
    $arguments += @("/p", $CertificatePassword)
}

$arguments += @(
    "/tr", $TimestampUrl,
    "/td", "SHA256",
    "/d", "Ciszu Network",
    "/a",
    $File
)

& $signTool @arguments
if ($LASTEXITCODE -ne 0) {
    throw "La firma Authenticode fallo con codigo $LASTEXITCODE"
}

Write-Host "Firmado: $File" -ForegroundColor Green

