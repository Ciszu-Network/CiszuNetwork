# Script PowerShell simple para generar thumbnails placeholder para certificados
# Crea imágenes PNG simples con diseño de documento PDF

param(
    [string]$CertificatesDir = "E:\Ciszu Network\shared\docs\certificados",
    [string]$PreviewsDir = "E:\Ciszu Network\shared\docs\certificados\previews"
)

# Asegurar que el directorio de previews existe
if (-not (Test-Path $PreviewsDir)) {
    New-Item -ItemType Directory -Path $PreviewsDir -Force | Out-Null
    Write-Host "📁 Directorio creado: $PreviewsDir" -ForegroundColor Green
}

# Función para crear una imagen PNG simple de thumbnail
function Create-ThumbnailImage {
    param(
        [string]$OutputPath,
        [string]$DocumentName,
        [string]$DocumentType = "PDF"
    )
    
    # Usar .NET para crear una imagen simple
    Add-Type -AssemblyName System.Drawing
    
    $width = 400
    $height = 300
    
    # Crear bitmap
    $bitmap = New-Object System.Drawing.Bitmap($width, $height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Fondo gradiente
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Point(0, 0)),
        (New-Object System.Drawing.Point($width, $height)),
        [System.Drawing.Color]::FromArgb(10, 10, 20),
        [System.Drawing.Color]::FromArgb(26, 26, 46)
    )
    $graphics.FillRectangle($brush, 0, 0, $width, $height)
    
    # Establecer calidad de renderizado
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Dibujar documento PDF estilizado
    $docX = $width / 2 - 60
    $docY = $height / 2 - 40
    $docWidth = 120
    $docHeight = 80
    
    # Cuerpo del documento
    $docBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20, 255, 255, 255))
    $docPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 255, 255, 255), 2)
    $graphics.FillRectangle($docBrush, $docX, $docY, $docWidth, $docHeight)
    $graphics.DrawRectangle($docPen, $docX, $docY, $docWidth, $docHeight)
    
    # Parte superior doblada
    $topPoints = @(
        [System.Drawing.Point]::new($docX + 10, $docY),
        [System.Drawing.Point]::new($docX + $docWidth - 10, $docY),
        [System.Drawing.Point]::new($docX + $docWidth - 5, $docY - 5),
        [System.Drawing.Point]::new($docX + 5, $docY - 5)
    )
    $graphics.FillPolygon($docBrush, $topPoints)
    $graphics.DrawPolygon($docPen, $topPoints)
    
    # Líneas de texto simuladas
    $textLineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(80, 255, 255, 255))
    for ($i = 0; $i -lt 4; $i++) {
        $lineY = $docY + 25 + ($i * 12)
        $lineWidth = 80 - ($i * 5)
        $graphics.FillRectangle($textLineBrush, $docX + 20, $lineY, $lineWidth, 4)
    }
    
    # Texto "PDF"
    $font = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 96, 165, 250))
    $textFormat = New-Object System.Drawing.StringFormat
    $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString($DocumentType, $font, $textBrush, ($width / 2), ($docY + $docHeight + 25), $textFormat)
    
    # Nombre del archivo
    $smallFont = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Regular)
    $fileName = if ($DocumentName.Length -gt 20) { $DocumentName.Substring(0, 20) + "..." } else { $DocumentName }
    $nameBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(128, 255, 255, 255))
    $graphics.DrawString($fileName, $smallFont, $nameBrush, ($width / 2), ($docY + $docHeight + 40), $textFormat)
    
    # Guardar la imagen
    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Liberar recursos
    $graphics.Dispose()
    $bitmap.Dispose()
    
    Write-Host "✅ Thumbnail creado: $(Split-Path $OutputPath -Leaf)" -ForegroundColor Green
}

# Obtener archivos PDF
Write-Host "🎨 Generando thumbnails para certificados..." -ForegroundColor Cyan
Write-Host ""

$pdfFiles = Get-ChildItem $CertificatesDir -Filter *.pdf | Select-Object -First 10

$count = 0
foreach ($pdfFile in $pdfFiles) {
    $count++
    $baseName = $pdfFile.BaseName
    $outputFile = Join-Path $PreviewsDir "$baseName-preview.png"
    
    # Crear thumbnail
    Create-ThumbnailImage -OutputPath $outputFile -DocumentName $baseName -DocumentType "PDF"
    
    Write-Host "   [$count/$($pdfFiles.Count)] $baseName.pdf" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "✅ Thumbnails generados: $count" -ForegroundColor Green
Write-Host "📁 Directorio: $PreviewsDir" -ForegroundColor White
Write-Host ""
Write-Host "💡 Instrucciones para usar:" -ForegroundColor Yellow
Write-Host "1. Los thumbnails están listos en la carpeta previews" -ForegroundColor White
Write-Host "2. Actualiza el campo 'thumbnail' en certificates.ts con la ruta correspondiente:" -ForegroundColor White
Write-Host "   Ejemplo: thumbnail: 'shared/docs/certificados/previews/nombre-archivo-preview.png'" -ForegroundColor Gray
Write-Host "3. Para mejores resultados, toma screenshots reales de tus PDFs y reemplaza estos placeholders" -ForegroundColor White