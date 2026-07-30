param(
    [Parameter(Mandatory=$true)]
    [string]$DocsPath
)

$docxDir = Join-Path -Path $DocsPath -ChildPath "docx"
$pdfDir = Join-Path -Path $DocsPath -ChildPath "pdf"

if (-not (Test-Path $docxDir)) { Write-Host "No existe: $docxDir"; exit 1 }
if (-not (Test-Path $pdfDir)) { New-Item -ItemType Directory -Path $pdfDir -Force | Out-Null }

$docxFiles = Get-ChildItem -Path $docxDir -Filter "*.docx" | Where-Object { $_.Name -ne "ACTA.docx" }
if ($docxFiles.Count -eq 0) { Write-Host "No hay DOCX para convertir"; exit 0 }

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$converted = 0; $errors = 0

foreach ($file in $docxFiles) {
    $pdfPath = Join-Path -Path $pdfDir -ChildPath ($file.BaseName + ".pdf")
    try {
        $doc = $word.Documents.Open($file.FullName)
        $doc.SaveAs([ref] $pdfPath, [ref] 17)
        $doc.Close()
        Write-Host "  OK $($file.Name)"
        $converted++
    } catch {
        Write-Host "  FAIL $($file.Name): $($_.Exception.Message)"
        $errors++
    }
}

$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
[System.GC]::Collect()

Write-Host "PDFs: $converted generados, $errors errores"