# Script para crear thumbnails placeholder para certificados
# Para usar: 
# 1. Toma screenshots de tus certificados PDF
# 2. Guarda las imágenes como JPEG en shared/docs/certificados/previews/
# 3. Usa nombres descriptivos: efset-preview.jpg, personality-preview.jpg, etc.

$certificatesDir = "E:\Ciszu Network\shared\docs\certificados"
$previewsDir = Join-Path $certificatesDir "previews"

# Crear directorio de previews si no existe
if (-not (Test-Path $previewsDir)) {
    New-Item -ItemType Directory -Path $previewsDir -Force
    Write-Host "Created previews directory: $previewsDir" -ForegroundColor Green
}

Write-Host "Certificate thumbnails setup:" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: To add real previews:" -ForegroundColor Yellow
Write-Host "1. Open your PDF certificates and take screenshots" -ForegroundColor White
Write-Host "2. Save screenshots as JPG files in: $previewsDir" -ForegroundColor White
Write-Host "3. Use these naming conventions:" -ForegroundColor White
Write-Host "   - efset-preview.jpg (EF SET Certificate)" -ForegroundColor Gray
Write-Host "   - personality-preview.jpg (Personality Profile)" -ForegroundColor Gray
Write-Host "   - cisco-preview.jpg (Cisco certificates)" -ForegroundColor Gray
Write-Host "   - transcript-preview.jpg (Learning transcript)" -ForegroundColor Gray
Write-Host "   - expediente-preview.jpg (Microsoft Learn record)" -ForegroundColor Gray
Write-Host ""
Write-Host "Current files in certificados directory:" -ForegroundColor Cyan

Get-ChildItem $certificatesDir -Filter *.pdf | Select-Object -First 10 Name | Format-Table

Write-Host ""
Write-Host "For now, the system uses placeholder previews with icon indicators." -ForegroundColor Green
Write-Host "Add real screenshots for a better user experience!" -ForegroundColor Green