# Patch NSIS installer to add early CustomUIMode initialization before lang dialog

`$NsisDir = 'E:\Ciszu Network\ciszu_proyects\muzic mania\src-tauri\target\release\nsis\x64'
`$NsiFile = `$NsisDir + '\installer.nsi'
`$content = Get-Content `$NsiFile -Raw

if (`$content -match 'CustomUIMode') {
    Write-Host 'Already patched, skipping.' -ForegroundColor Yellow
    exit
}

# Add CustomUIMode var
`$content = `$content.Replace('Var OldMainBinaryName', 'Var OldMainBinaryName`r`nVar CustomUIMode')

# Early CustomUIMode initialization BEFORE lang dialog check
# This ensures CustomUIMode is initialized before the lang dialog check at line 610
`$content = `$content.Replace(
  '  ${GetOptions} $CMDLINE "/UPDATE" $UpdateMode',
  '  ${GetOptions} $CMDLINE "/UPDATE" $UpdateMode`r`n  ${AndIfNot} $UpdateMode = 1`r`n    StrCpy $CustomUIMode 1'
)

# Suppress NSIS lang dialog
`$oldDll = '  !if "${DISPLAYLANGUAGESELECTOR}" == "true"`r`n    !insertmacro MUI_LANGDLL_DISPLAY`r`n  !endif'
`$newDll = '  ${If} $CustomUIMode != 1`r`n' + `$oldDll + '`r`n  ${EndIf}'
`$content = `$content.Replace(`$oldDll, `$newDll)

# Write patched installer.nsi
Set-Content `$NsiFile `$content -Encoding UTF8
Write-Host 'Patched installer.nsi written' -ForegroundColor Green

# Recompile with makensis
`$makensis = `$env:LOCALAPPDATA + '\tauri\NSIS\makensis.exe'
if ((-not (Test-Path `$makensis))) {
    Write-Host 'ERROR: makensis.exe not found' -ForegroundColor Red
    exit
}
Write-Host 'Recompiling...' -ForegroundColor Yellow
& `$makensis `$NsiFile

if (`$LASTEXITCODE -eq 0) {
    Write-Host 'OK: ' + `$NsiFile.Replace(`$NsisDir + '\', '') -ForegroundColor Green
    `$bundleDir = Resolve-Path (`$NsisDir + '\..\..\bundle\nsis')
    if (`$bundleDir) {
        Get-ChildItem (`$bundleDir + '\*.exe') | ForEach-Object {
            Copy-Item (`$NsisDir + '\nsis-output.exe') `$_'FullName' -Force
            Write-Host 'Copied to ' + `$_'FullName' -ForegroundColor Green
        }
    }
} else {
    Write-Host 'ERROR: makensis failed (exit ' + `$LASTEXITCODE + ')' -ForegroundColor Red
    exit
}