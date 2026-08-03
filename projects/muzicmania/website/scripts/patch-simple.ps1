$NsisDir = "E:\Ciszu Network\ciszu_proyects\muzic mania\src-tauri\target\release\nsis\x64"
$NsiFile = "$NnisDir\installer.nsi"
$OutputExe = "$NnisDir\nsis-output.exe"

$content = Get-Content $NsiFile -Raw

if ($content -match 'CustomUIMode') {
    Write-Host "Already patched, skipping." -ForegroundColor Yellow
    exit 0
}

# Add CustomUIMode var
$content = $content.Replace('Var OldMainBinaryName', "Var OldMainBinaryName`r`nVar CustomUIMode")

# Early CustomUIMode initialization BEFORE lang dialog check
# This ensures CustomUIMode is initialized before the lang dialog check at line 610
$content = $content.Replace(
  '  ${GetOptions} $CMDLINE "/UPDATE" $UpdateMode',
  '  ${GetOptions} $CMDLINE "/UPDATE" ``$UpdateMode``r`n  ${AndIfNot} ``$UpdateMode`` = 1`r`n    StrCpy ``$CustomUIMode`` 1'
)

# Suppress NSIS lang dialog
$oldDll = '  !if "${DISPLAYLANGUAGESELECTOR}" == "true"`r`n    !insertmacro MUI_LANGDLL_DISPLAY`r`n  !endif'
$newDll = '  ${If} $CustomUIMode != 1`r`n' + $oldDll + '`r`n  ${EndIf}'
$content = $content.Replace($oldDll, $newDll)

# Write patched installer.nsi
Set-Content $NsiFile $content -Encoding UTF8
Write-Host "Patched installer.nsi written" -ForegroundColor Green

# Recompile with makensis
$makensis = "$env:LOCALAPPDATA\tauri\NSIS\makensis.exe"
if (-not (Test-Path $makensis)) {
    Write-Host "ERROR: makensis.exe not found" -ForegroundColor Red
    exit 1
}
Write-Host "Recompiling..." -ForegroundColor Yellow
& $makensis $NsiFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: $OutputExe" -ForegroundColor Green
    $bundleDir = Resolve-Path "$NnisDir\..\..\bundle\nsis" -ErrorAction SilentlyContinue
    if ($bundleDir) {
        Get-ChildItem "$bundleDir\*.exe" | ForEach-Object {
            Copy-Item $OutputExe $_.FullName -Force
            Write-Host "Copied to $($_.FullName)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "ERROR: makensis failed (exit $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}