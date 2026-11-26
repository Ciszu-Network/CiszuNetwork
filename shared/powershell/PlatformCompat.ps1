# CISZU Network - compatibilidad PowerShell entre Windows y Linux.
# Se carga con dot-source desde los wrappers de consola (pwsh en Linux).
# No sustituye al perfil; solo rellena las diferencias de cmdlets.

function Test-CiszuWindows {
  if ($PSVersionTable.PSEdition -eq 'Desktop') { return $true }
  return [bool]$IsWindows
}

# --- Abrir rutas y URLs -----------------------------------------------------
function Open-Path {
  param([Parameter(Mandatory, ValueFromPipeline = $true)][string]$Path)
  process {
    if (-not (Test-Path -LiteralPath $Path)) { Write-Warning "No existe: $Path"; return }
    if (Test-CiszuWindows) {
      Start-Process explorer.exe -ArgumentList $Path
    } else {
      & xdg-open $Path 2>$null
    }
  }
}

function Open-Url {
  param([Parameter(Mandatory)][string]$Url)
  if (Test-CiszuWindows) {
    Start-Process $Url
  } else {
    & xdg-open $Url 2>$null
  }
}

function Get-PwshExe {
  if (Test-CiszuWindows) {
    $cmd = Get-Command powershell.exe -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    return 'powershell.exe'
  }
  return (Get-Command pwsh -ErrorAction Stop).Source
}

# --- Diferencias solo en Linux ---------------------------------------------
if (-not (Test-CiszuWindows)) {
  # Join-Path con separadores Windows: normaliza a '/' para que Test-Path funcione.
  function Join-Path {
    [CmdletBinding()]
    param(
      [Parameter(Mandatory, Position = 0)][string[]]$Path,
      [Parameter(Mandatory, Position = 1)][string]$ChildPath,
      [Parameter(ValueFromRemainingArguments = $true)][string[]]$AdditionalChildPath
    )
    $result = Microsoft.PowerShell.Management\Join-Path -Path $Path -ChildPath $ChildPath
    foreach ($extra in @($AdditionalChildPath)) {
      if ($extra) { $result = Microsoft.PowerShell.Management\Join-Path -Path $result -ChildPath $extra }
    }
    return ($result -replace '\\', '/')
  }

  # Get-NetTCPConnection no existe en pwsh/Linux: se emula con `ss`.
  function Get-NetTCPConnection {
    [CmdletBinding()]
    param(
      [int]$LocalPort,
      [string]$State = 'Listen'
    )
    $lines = & ss -ltnp 2>$null
    foreach ($line in $lines) {
      if ($line -notmatch "LISTEN") { continue }
      if ($line -notmatch "[:.](\d+)\s") { continue }
      $port = [int]$matches[1]
      if ($LocalPort -and $port -ne $LocalPort) { continue }
      $pidValue = if ($line -match 'pid=(\d+)') { [int]$matches[1] } else { 0 }
      $address = if ($line -match '^\S+\s+\d+\s+\d+\s+(\S+):') { $matches[1] } else { '0.0.0.0' }
      [pscustomobject]@{
        LocalAddress  = $address
        LocalPort     = $port
        State         = 'Listen'
        OwningProcess = $pidValue
      }
    }
  }

  # Start-Process: URLs con xdg-open y parametros de redireccion compatibles.
  function Start-Process {
    [CmdletBinding(DefaultParameterSetName = 'Default')]
    param(
      [Parameter(Position = 0, ParameterSetName = 'Default')][string]$FilePath,
      [Parameter(ParameterSetName = 'Default')][string[]]$ArgumentList,
      [Parameter(ParameterSetName = 'Default')][string]$WorkingDirectory,
      [Parameter(ParameterSetName = 'Default')][switch]$Wait,
      [Parameter(ParameterSetName = 'Default')][string]$WindowStyle,
      [Parameter(ParameterSetName = 'Default')][string]$RedirectStandardOutput,
      [Parameter(ParameterSetName = 'Default')][string]$RedirectStandardError,
      [Parameter(ParameterSetName = 'Default')][switch]$PassThru,
      [Parameter(ParameterSetName = 'Default')][switch]$NoNewWindow,
      [Parameter(ValueFromRemainingArguments = $true)]$Rest
    )
    if ($FilePath -match '^https?://') {
      & xdg-open $FilePath 2>$null
      return
    }
    $params = @{ FilePath = $FilePath }
    if ($ArgumentList) { $params.ArgumentList = $ArgumentList }
    if ($WorkingDirectory) { $params.WorkingDirectory = $WorkingDirectory }
    if ($Wait) { $params.Wait = $true }
    if ($RedirectStandardOutput) { $params.RedirectStandardOutput = $RedirectStandardOutput }
    if ($RedirectStandardError) { $params.RedirectStandardError = $RedirectStandardError }
    if ($PassThru) { $params.PassThru = $true }
    if ($NoNewWindow) { $params.NoNewWindow = $true }
    Microsoft.PowerShell.Management\Start-Process @params
  }
}
