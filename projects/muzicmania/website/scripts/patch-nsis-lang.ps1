param([string]$NsisDir = "")

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))

if (-not $NsisDir) {
    $candidates = @(
        "$ProjectRoot\launcher\src-tauri\target\x86_64-pc-windows-msvc\release\nsis\x64",
        "$ProjectRoot\launcher\src-tauri\target\release\nsis\x64"
    )
    $NsisDir = $candidates | Where-Object { Test-Path (Join-Path $_ "installer.nsi") } | Select-Object -First 1
}

if (-not $NsisDir -or -not (Test-Path (Join-Path $NsisDir "installer.nsi"))) {
    throw "No se encontro installer.nsi. Compila Tauri primero."
}

$NsiFile = Join-Path $NsisDir "installer.nsi"
$OutputExe = Join-Path $NsisDir "nsis-output.exe"
$Makensis = Join-Path $env:LOCALAPPDATA "tauri\NSIS\makensis.exe"

if (-not (Test-Path $Makensis)) {
    throw "makensis.exe no encontrado en $Makensis"
}

$content = Get-Content $NsiFile -Raw

if ($content -match "Var CustomUIMode") {
    throw "installer.nsi ya esta parcheado. Regenera el bundle con tauri build."
}

$content = $content.Replace("Var OldMainBinaryName`r`n", "Var OldMainBinaryName`r`nVar CustomUIMode`r`n")

$helpers = @'
Function WriteProgress
  Pop $0
  FileOpen $1 "$TEMP\muzicmania-ipc\progress.txt" w
  FileWrite $1 $0
  FileClose $1
FunctionEnd

Function WriteLog
  Pop $0
  FileOpen $1 "$TEMP\muzicmania-ipc\log.txt" a
  FileWrite $1 "$0$\r$\n"
  FileClose $1
FunctionEnd

'@

$content = $content.Replace("Function .onInit", $helpers + "Function .onInit")

$customInit = @'
  ${If} ${Silent}
    StrCpy $PassiveMode 1
  ${EndIf}
  ${IfNot} $PassiveMode = 1
  ${AndIfNot} $UpdateMode = 1
    StrCpy $CustomUIMode 1
    RMDir /r "$TEMP\muzicmania-ipc"
    CreateDirectory "$TEMP\muzicmania-ipc"
    FileOpen $0 "$TEMP\muzicmania-ipc\status.txt" w
    FileWrite $0 "READY"
    FileClose $0
    FileOpen $0 "$TEMP\muzicmania-ipc\progress.txt" w
    FileWrite $0 "5"
    FileClose $0
    FileOpen $0 "$TEMP\muzicmania-ipc\default_dir.txt" w
    FileWrite $0 "$INSTDIR"
    FileClose $0
    FileOpen $0 "$TEMP\muzicmania-ipc\cmd.txt" w
    FileWrite $0 "WAIT"
    FileClose $0

    ${If} ${RunningX64}
      ReadRegStr $4 HKLM "SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\${WEBVIEW2APPGUID}" "pv"
    ${Else}
      ReadRegStr $4 HKLM "SOFTWARE\Microsoft\EdgeUpdate\Clients\${WEBVIEW2APPGUID}" "pv"
    ${EndIf}
    ${If} $4 == ""
      ReadRegStr $4 HKCU "SOFTWARE\Microsoft\EdgeUpdate\Clients\${WEBVIEW2APPGUID}" "pv"
    ${EndIf}
    ${If} $4 == ""
      Delete "$TEMP\MicrosoftEdgeWebview2Setup.exe"
      NSISdl::download "https://go.microsoft.com/fwlink/p/?LinkId=2124703" "$TEMP\MicrosoftEdgeWebview2Setup.exe"
      Pop $0
      ${If} $0 != "success"
        MessageBox MB_ICONSTOP "No se pudo descargar WebView2. Verifica tu conexion a internet."
        Quit
      ${EndIf}
      ExecWait '"$TEMP\MicrosoftEdgeWebview2Setup.exe" /silent /install' $1
      Delete "$TEMP\MicrosoftEdgeWebview2Setup.exe"
      ${If} $1 != 0
        MessageBox MB_ICONSTOP "No se pudo instalar WebView2."
        Quit
      ${EndIf}
    ${EndIf}

    InitPluginsDir
    SetOutPath "$PLUGINSDIR"
    File "${MAINBINARYSRCPATH}"
    Exec '"$PLUGINSDIR\${MAINBINARYNAME}.exe" --installer'
    HideWindow
    StrCpy $R9 0

    WaitForCustomCmd:
      IntOp $R9 $R9 + 1
      ${If} $R9 > 3600
        RMDir /r "$TEMP\muzicmania-ipc"
        Quit
      ${EndIf}
      Sleep 500
      IfFileExists "$TEMP\muzicmania-ipc\cmd.txt" CustomCmdExists
      Goto WaitForCustomCmd

    CustomCmdExists:
      FileOpen $0 "$TEMP\muzicmania-ipc\cmd.txt" r
      FileRead $0 $2
      FileClose $0
      ${If} $2 == "ABORT"
        RMDir /r "$TEMP\muzicmania-ipc"
        Quit
      ${EndIf}
      ${If} $2 != "INSTALL"
        Delete "$TEMP\muzicmania-ipc\cmd.txt"
        Goto WaitForCustomCmd
      ${EndIf}
      Delete "$TEMP\muzicmania-ipc\cmd.txt"

    IfFileExists "$TEMP\muzicmania-ipc\dir.txt" 0 CustomDirDone
      FileOpen $0 "$TEMP\muzicmania-ipc\dir.txt" r
      FileRead $0 $1
      FileClose $0
      ${If} $1 != ""
        StrCpy $INSTDIR $1
      ${EndIf}
    CustomDirDone:

    IfFileExists "$TEMP\muzicmania-ipc\lang.txt" 0 CustomLangDone
      FileOpen $0 "$TEMP\muzicmania-ipc\lang.txt" r
      FileRead $0 $1
      FileClose $0
      ${If} $1 != ""
        StrCpy $LANGUAGE $1
      ${EndIf}
    CustomLangDone:

    FileOpen $0 "$TEMP\muzicmania-ipc\progress.txt" w
    FileWrite $0 "10"
    FileClose $0
    Push "Preparing installation..."
    Call WriteLog
  ${EndIf}

'@

$onInitStart = $content.IndexOf("Function .onInit")
if ($onInitStart -lt 0) { throw "Function .onInit no encontrada" }
$onInitEnd = $content.IndexOf("FunctionEnd", $onInitStart)
if ($onInitEnd -lt 0) { throw "FunctionEnd de .onInit no encontrado" }
$content = $content.Substring(0, $onInitEnd) + $customInit + $content.Substring($onInitEnd)

$content = $content -replace '(?m)^\s*!insertmacro MUI_LANGDLL_DISPLAY\s*$', ""

$content = $content.Replace(
    'VIAddVersionKey "ProductVersion" "${VERSION}"',
    "VIAddVersionKey `"ProductVersion`" `"`${VERSION}`"`r`nVIAddVersionKey `"CompanyName`" `"Ciszu Network`""
)

$swedishFile = Join-Path $NsisDir "Swedish.nsh"
if (Test-Path $swedishFile) {
    $swedish = Get-Content $swedishFile -Raw
    $swedish = $swedish.Replace('${LANG_SWEDISH}}', '${LANG_SWEDISH}')
    Set-Content $swedishFile $swedish -Encoding UTF8 -NoNewline
}

$reinstallGuard = @'
Function PageReinstall
  ${If} $CustomUIMode = 1
    Abort
  ${EndIf}
'@
$content = $content.Replace("Function PageReinstall`r`n", $reinstallGuard + "`r`n")

$content = $content.Replace(
    "Function SkipIfPassive`r`n  `${IfThen} `$PassiveMode = 1  `${|} Abort `${|}`r`nFunctionEnd",
    "Function SkipIfPassive`r`n  `${IfThen} `$PassiveMode = 1  `${|} Abort `${|}`r`n  `${IfThen} `$CustomUIMode = 1  `${|} Abort `${|}`r`nFunctionEnd"
)

$checkRunning = @'
  ${If} $CustomUIMode != 1
    !insertmacro CheckIfAppIsRunning "${MAINBINARYNAME}.exe" "${PRODUCTNAME}"
  ${EndIf}
'@
$runningLine = '  !insertmacro CheckIfAppIsRunning "${MAINBINARYNAME}.exe" "${PRODUCTNAME}"'
$runningIndex = $content.IndexOf($runningLine)
if ($runningIndex -ge 0) {
    $content = $content.Substring(0, $runningIndex) + $checkRunning + $content.Substring($runningIndex + $runningLine.Length)
}

$installProgress = @'
  ${If} $CustomUIMode = 1
    Push 20
    Call WriteProgress
    Push "Copying application files..."
    Call WriteLog
  ${EndIf}

'@
$content = $content.Replace("Section Install`r`n  SetOutPath `$INSTDIR`r`n", "Section Install`r`n  SetOutPath `$INSTDIR`r`n`r`n" + $installProgress)

$content = $content.Replace(
    "  File `"`${MAINBINARYSRCPATH}`"`r`n",
    "  File `"`${MAINBINARYSRCPATH}`"`r`n`r`n  `${If} `$CustomUIMode = 1`r`n    Push 55`r`n    Call WriteProgress`r`n  `${EndIf}`r`n"
)

$content = $content.Replace(
    "  WriteUninstaller `"`$INSTDIR\uninstall.exe`"`r`n",
    "  WriteUninstaller `"`$INSTDIR\uninstall.exe`"`r`n`r`n  `${If} `$CustomUIMode = 1`r`n    Push 75`r`n    Call WriteProgress`r`n    Push `"Creating uninstaller...`"`r`n    Call WriteLog`r`n  `${EndIf}`r`n"
)

$autoClose = @'
  ${If} $CustomUIMode = 1
    Push 90
    Call WriteProgress
    Push "Finalizing installation..."
    Call WriteLog
    SetAutoClose true
  ${EndIf}

'@
$content = $content.Replace("  ; Auto close this page for passive mode`r`n", $autoClose + "  ; Auto close this page for passive mode`r`n")

$onInstSuccess = @'
  ${If} $CustomUIMode = 1
    Push 100
    Call WriteProgress
    Push "Installation completed successfully"
    Call WriteLog
    FileOpen $0 "$TEMP\muzicmania-ipc\status.txt" w
    FileWrite $0 "DONE"
    FileClose $0
    StrCpy $R9 0

    WaitFinishCmd:
      IntOp $R9 $R9 + 1
      ${If} $R9 > 240
        Goto CustomFinishCleanup
      ${EndIf}
      Sleep 500
      IfFileExists "$TEMP\muzicmania-ipc\cmd.txt" FinishCmdExists
      Goto WaitFinishCmd

    FinishCmdExists:
      FileOpen $0 "$TEMP\muzicmania-ipc\cmd.txt" r
      FileRead $0 $1
      FileClose $0
      Delete "$TEMP\muzicmania-ipc\cmd.txt"
      ${If} $1 == "ABORT"
        HideWindow
        ExecWait '"$INSTDIR\uninstall.exe" /S _?=$INSTDIR'
        Goto CustomFinishCleanup
      ${EndIf}
      ${If} $1 == "LAUNCH"
        Sleep 1500
        nsis_tauri_utils::RunAsUser "$INSTDIR\${MAINBINARYNAME}.exe" ""
      ${EndIf}

    CustomFinishCleanup:
      RMDir /r "$TEMP\muzicmania-ipc"
    Return
  ${EndIf}

'@
$content = $content.Replace("Function .onInstSuccess`r`n", "Function .onInstSuccess`r`n" + $onInstSuccess)

$onInstFailed = @'

Function .onInstFailed
  ${If} $CustomUIMode = 1
    FileOpen $0 "$TEMP\muzicmania-ipc\status.txt" w
    FileWrite $0 "ERROR"
    FileClose $0
    Push "Installation failed"
    Call WriteLog
  ${EndIf}
FunctionEnd
'@
$content = $content.Replace("Function RestorePreviousInstallLocation`r`n", $onInstFailed + "`r`nFunction RestorePreviousInstallLocation`r`n")

Set-Content $NsiFile $content -Encoding UTF8

Push-Location $NsisDir
try {
    & $Makensis $NsiFile
    if ($LASTEXITCODE -ne 0) { throw "makensis fallo con codigo $LASTEXITCODE" }
} finally {
    Pop-Location
}

if (-not (Test-Path $OutputExe)) {
    throw "No se genero $OutputExe"
}

$bundleDir = Split-Path -Parent (Split-Path -Parent $NsisDir)
$bundleDir = Join-Path $bundleDir "bundle\nsis"
if (Test-Path $bundleDir) {
    Get-ChildItem (Join-Path $bundleDir "*.exe") | ForEach-Object {
        Copy-Item $OutputExe $_.FullName -Force
    }
}

$size = (Get-Item $OutputExe).Length
if ($size -lt 1000000) {
    throw "El instalador generado es demasiado pequeno: $size bytes"
}

Write-Host "Instalador custom generado: $OutputExe ($size bytes)" -ForegroundColor Green
