param([string]$NsisDir = "")

if (-not $NsisDir) {
    $ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
    $NsisDir = "$ProjectRoot\src-tauri\target\release\nsis\x64"
}

$NsiFile = "$NsisDir\installer.nsi"
$OutputExe = "$NsisDir\nsis-output.exe"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$JsonFile = "$ScriptDir\lang-strings.json"

if (-not (Test-Path $NsiFile)) {
    Write-Host "ERROR: NSIS script not found at $NsiFile" -ForegroundColor Red
    exit 1
}

$content = Get-Content $NsiFile -Raw

if ($content -match 'CustomUIMode') {
    Write-Host "Already patched, skipping." -ForegroundColor Yellow
    exit 0
}

$translations = Get-Content $JsonFile -Raw -Encoding UTF8 | ConvertFrom-Json
$cr = "`r`n"

# ── Step 0: Force admin mode ──
$content = $content.Replace('RequestExecutionLevel user', 'RequestExecutionLevel admin')
$content = $content.Replace('MULTIUSER_EXECUTIONLEVEL Highest', 'MULTIUSER_EXECUTIONLEVEL Admin')
Write-Host "[0/11] Admin mode forced" -ForegroundColor Green

# ── Step 1: LangStrings + Author info ──
# Add CompanyName (other VI keys already exist via Tauri template)
$content = $content.Replace('VIAddVersionKey "ProductVersion" "${VERSION}"', 'VIAddVersionKey "ProductVersion" "${VERSION}"' + "${cr}VIAddVersionKey CompanyName `"Ciszu Network`"")

$ls = ""
foreach ($t in $translations) { $ls += "LangString versionInfo `${$($t.lang)} `"$($t.versionInfo)`"$cr" }
foreach ($t in $translations) {
    $ls += "LangString viewChangelog `${$($t.lang)} `"$($t.changelog)`"$cr"
    $ls += "LangString thankYou `${$($t.lang)} `"$($t.thanks)`"$cr"
    $ls += "LangString uninstallDone `${$($t.lang)} `"$($t.uninstallQ)`"$cr"
}
$content = $content -replace '(Function \.onInit)', "${ls}`$1"
Write-Host "[1/11] LangStrings + CompanyName added" -ForegroundColor Green

# ── Step 2: CustomUIMode var ──
$content = $content.Replace('Var OldMainBinaryName', "Var OldMainBinaryName${cr}Var CustomUIMode")
Write-Host "[2/11] CustomUIMode var added" -ForegroundColor Green

# ── Step 3: Helper functions ──
$hf = @"
; --- Custom UI helpers ---
Function WriteProgress
  Pop `$0
  FileOpen `$1 "`$TEMP\muzicmania-ipc\progress.txt" w
  FileWrite `$1 `$0
  FileClose `$1
FunctionEnd
Function WriteLog
  Pop `$0
  FileOpen `$1 "`$TEMP\muzicmania-ipc\log.txt" a
  FileWrite `$1 "`$0$\r$\n"
  FileClose `$1
FunctionEnd
Function SkipIfCustomUI
  `${If} `$PassiveMode = 1
    Abort
  `${EndIf}
  `${If} `$CustomUIMode = 1
    Abort
  `${EndIf}
FunctionEnd

"@
$content = $content.Replace('Function .onInit', "${hf}Function .onInit")
Write-Host "[3/11] Helpers added" -ForegroundColor Green

# ── Step 4: Custom UI added to .onInit ──
$cu = @"
  `${IfNot} `$PassiveMode = 1
  `${AndIfNot} `$UpdateMode = 1
    StrCpy `$CustomUIMode 1
    StrCpy `$R8 `$INSTDIR
    RMDir /r "`$TEMP\muzicmania-ipc"
    CreateDirectory "`$TEMP\muzicmania-ipc"
    FileOpen `$0 "`$TEMP\muzicmania-ipc\default_dir.txt" w
    FileWrite `$0 `$INSTDIR
    FileClose `$0
    FileOpen `$0 "`$TEMP\muzicmania-ipc\status.txt" w
    FileWrite `$0 "READY"
    FileClose `$0
    InitPluginsDir
    SetOutPath `$PLUGINSDIR
    File "`${MAINBINARYSRCPATH}"
    Exec '"`$PLUGINSDIR\`${MAINBINARYNAME}.exe" --installer'
    HideWindow
    StrCpy `$R9 0
    WaitForCmd:
    IntOp `$R9 `$R9 + 1
    `${If} `$R9 > 240
      Quit
    `${EndIf}
    Sleep 500
    IfFileExists "`$TEMP\muzicmania-ipc\cmd.txt" CmdExists
    Goto WaitForCmd
    CmdExists:
  `${EndIf}

"@
$fnOnInitIdx = $content.IndexOf('Function .onInit')
$fnEndIdx = $content.IndexOf('FunctionEnd', $fnOnInitIdx)
$content = $content.Substring(0, $fnEndIdx) + $cr + $cu + $content.Substring($fnEndIdx)
Write-Host "[4/11] Custom UI added to .onInit" -ForegroundColor Green

# ── Step 5: Remove NSIS lang dialog entirely, keep only custom ──
# Delete the whole MUI_LANGDLL_DISPLAY block and set selector to false
$muiIdx = $content.IndexOf('MUI_LANGDLL_DISPLAY')
if ($muiIdx -ge 0) {
    $blockStart = $content.LastIndexOf('!if', $muiIdx)
    $blockEnd = $content.IndexOf('!endif', $muiIdx) + 6
    if ($blockStart -ge 0 -and $blockEnd -gt $blockStart) {
        $content = $content.Substring(0, $blockStart) + $content.Substring($blockEnd)
        Write-Host "[5/11] NSIS lang dialog removed" -ForegroundColor Green
    } else {
        Write-Host "[5/11] Could not find !if/!endif around MUI_LANGDLL_DISPLAY" -ForegroundColor Yellow
    }
} else {
    Write-Host "[5/11] MUI_LANGDLL_DISPLAY not found" -ForegroundColor Yellow
}
# Also set DISPLAYLANGUAGESELECTOR to "false" to prevent any lang handling
$content = $content.Replace('!define DISPLAYLANGUAGESELECTOR "true"', '!define DISPLAYLANGUAGESELECTOR "false"')
Write-Host "[5b/11] DISPLAYLANGUAGESELECTOR set to false" -ForegroundColor Green

# ── Step 6: Page pre-functions ──
$content = $content -replace '(!define MUI_PAGE_CUSTOMFUNCTION_PRE )SkipIfPassive', '${1}SkipIfCustomUI'
Write-Host "[6/11] Page pre-functions updated" -ForegroundColor Green

# ── Step 7: MainSection progress ──
$msIdx = $content.IndexOf('Section Install')
if ($msIdx -ge 0) {
    $meIdx = $content.IndexOf('SectionEnd', $msIdx)
    $soIdx = $content.IndexOf('SetOutPath $INSTDIR', $msIdx, $meIdx - $msIdx)
    if ($soIdx -ge 0) {
        $leIdx = $content.IndexOf($cr, $soIdx)
        $at = $leIdx + 2
        $progStart = "  Push 10${cr}  Call WriteProgress${cr}  Push `"Extracting application files...`"${cr}  Call WriteLog${cr}"
        $content = $content.Substring(0, $at) + $cr + $progStart + $content.Substring($at)
    }
    $meIdx = $content.IndexOf('SectionEnd', $msIdx)
    $beIdx = $content.LastIndexOf($cr, $meIdx - 1)
    if ($beIdx -ge 0) {
        $progEnd = "  Push 90${cr}  Call WriteProgress${cr}  Push `"Finalizing installation...`"${cr}  Call WriteLog${cr}"
        $content = $content.Substring(0, $beIdx + 2) + $progEnd + $content.Substring($beIdx + 2)
    }
    Write-Host "[7/11] MainSection progress added" -ForegroundColor Green
}

# ── Step 8: .onInstSuccess ──
$sIdx = $content.IndexOf('Function .onInstSuccess')
if ($sIdx -ge 0) {
    $eIdx = $content.IndexOf('FunctionEnd', $sIdx)
    if ($eIdx -ge 0) {
        $eIdx += 'FunctionEnd'.Length
        if ($content.Substring($eIdx, 2) -eq $cr) { $eIdx += 2 }
        $newOnInst = @"
Function .onInstSuccess
  `${If} `$CustomUIMode = 1
    Push 100
    Call WriteProgress
    Push "Installation completed successfully"
    Call WriteLog
    FileOpen `$0 "`$TEMP\muzicmania-ipc\status.txt" w
    FileWrite `$0 "DONE"
    FileClose `$0
    StrCpy `$R9 0
    WaitFinishCmd:
    IntOp `$R9 `$R9 + 1
    `${If} `$R9 > 240
      RMDir /r "`$TEMP\muzicmania-ipc"
      Quit
    `${EndIf}
    Sleep 500
    IfFileExists "`$TEMP\muzicmania-ipc\cmd.txt" FinishCmdExists
    Goto WaitFinishCmd
    FinishCmdExists:
    FileOpen `$0 "`$TEMP\muzicmania-ipc\cmd.txt" r
    FileRead `$0 `$1
    FileClose `$0
    Delete "`$TEMP\muzicmania-ipc\cmd.txt"
    RMDir /r "`$TEMP\muzicmania-ipc"
    `${If} `$1 == "LAUNCH"
      Exec '"`$INSTDIR\`${MAINBINARYNAME}.exe"'
    `${EndIf}
  `${EndIf}
FunctionEnd
"@
        $content = $content.Substring(0, $sIdx) + $newOnInst + $content.Substring($eIdx)
        Write-Host "[8/11] .onInstSuccess replaced" -ForegroundColor Green
    }
}

# ── Step 9: Remove RunMainBinary ──
$content = $content.Replace("${cr}!define MUI_FINISHPAGE_RUN_FUNCTION RunMainBinary", "")
Write-Host "[9/11] RunMainBinary removed" -ForegroundColor Green

# ── Step 10: Uninstall loop ──
$unstFix = "  `${If} `$0 = 0${cr}  `${AndIfNot} `${FileExists} `"`$INSTDIR\`${MAINBINARYNAME}.exe`"${cr}    MessageBox MB_YESNO|MB_ICONQUESTION `"`$(uninstallDone)`" /SD IDYES IDYES reinst_done${cr}    Quit${cr}  `${EndIf}${cr}${cr}"
$content = $content.Replace("reinst_done:${cr}FunctionEnd", "${unstFix}reinst_done:${cr}FunctionEnd")
Write-Host "[10/11] Uninstall loop fixed" -ForegroundColor Green

# ── Step 11: Skip CheckIfAppIsRunning ──
$appIdx = $content.IndexOf('!insertmacro CheckIfAppIsRunning')
if ($appIdx -ge 0) {
    $lStart = $content.LastIndexOf($cr, $appIdx - 1) + 2
    $lEnd = $content.IndexOf($cr, $appIdx)
    if ($lEnd -lt 0) { $lEnd = $content.Length }
    $origLine = $content.Substring($lStart, $lEnd - $lStart)
    $wrapper = "  `${If} `$CustomUIMode = 1${cr}    Goto SkipAppCheck${cr}  `${EndIf}${cr}"
    $after = "${cr}  SkipAppCheck:"
    $content = $content.Substring(0, $lStart) + $wrapper + $origLine + $after + $content.Substring($lEnd)
    Write-Host "[11/11] CheckIfAppIsRunning wrapped" -ForegroundColor Green
} else {
    Write-Host "[11/11] CheckIfAppIsRunning not found, skipping" -ForegroundColor Yellow
}

# ── Write & recompile ──
Set-Content $NsiFile $content -Encoding UTF8
Write-Host "Patched installer.nsi written" -ForegroundColor Green

$makensis = "$env:LOCALAPPDATA\tauri\NSIS\makensis.exe"
if (-not (Test-Path $makensis)) {
    Write-Host "ERROR: makensis.exe not found" -ForegroundColor Red
    exit 1
}
Write-Host "Recompiling..." -ForegroundColor Yellow
& $makensis $NsiFile

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: $OutputExe" -ForegroundColor Green
    $bundleDir = Resolve-Path "$NsisDir\..\..\bundle\nsis" -ErrorAction SilentlyContinue
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