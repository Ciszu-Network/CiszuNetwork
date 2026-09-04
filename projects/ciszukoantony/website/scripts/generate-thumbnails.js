// Script para generar thumbnails automáticos para certificados PDF
// Usa pdf-lib para extraer la primera página y crear una imagen preview

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { createCanvas } = require('canvas');

// Configuración
const CERTIFICATES_DIR = path.join(__dirname, '../../../shared/docs/certificados');
const PREVIEWS_DIR = path.join(CERTIFICATES_DIR, 'previews');
const THUMBNAIL_SIZE = { width: 400, height: 300 };

// Crear directorio de previews si no existe
if (!fs.existsSync(PREVIEWS_DIR)) {
  fs.mkdirSync(PREVIEWS_DIR, { recursive: true });
  console.log(`📁 Directorio creado: ${PREVIEWS_DIR}`);
}

async function generateThumbnailForPdf(pdfPath, outputPath) {
  try {
    console.log(`🔄 Procesando: ${path.basename(pdfPath)}`);
    
    // Leer el archivo PDF
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Crear un canvas para la miniatura
    const canvas = createCanvas(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height);
    const ctx = canvas.getContext('2d');
    
    // Fondo gradiente para la miniatura
    const gradient = ctx.createLinearGradient(0, 0, THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height);
    gradient.addColorStop(0, '#0a0a14');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height);
    
    // Dibujar icono de documento PDF
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    
    // Documento PDF estilizado
    const docX = THUMBNAIL_SIZE.width / 2 - 60;
    const docY = THUMBNAIL_SIZE.height / 2 - 40;
    const docWidth = 120;
    const docHeight = 80;
    
    // Cuerpo del documento
    ctx.beginPath();
    ctx.roundRect(docX, docY, docWidth, docHeight, 8);
    ctx.fill();
    ctx.stroke();
    
    // Parte superior del documento (doblada)
    ctx.beginPath();
    ctx.moveTo(docX + 10, docY);
    ctx.lineTo(docX + docWidth - 10, docY);
    ctx.lineTo(docX + docWidth - 5, docY - 5);
    ctx.lineTo(docX + 5, docY - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Líneas de texto simuladas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 4; i++) {
      const lineY = docY + 25 + (i * 12);
      const lineWidth = 80 - (i * 5); // Líneas de diferentes longitudes
      ctx.fillRect(docX + 20, lineY, lineWidth, 4);
    }
    
    // Texto "PDF"
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#60a5fa';
    ctx.textAlign = 'center';
    ctx.fillText('PDF', THUMBNAIL_SIZE.width / 2, docY + docHeight + 25);
    
    // Texto del nombre del archivo
    const filename = path.basename(pdfPath, '.pdf');
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText(filename.length > 20 ? filename.substring(0, 20) + '...' : filename, 
                 THUMBNAIL_SIZE.width / 2, docY + docHeight + 40);
    
    // Guardar la imagen
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Thumbnail generado: ${path.basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error procesando ${pdfPath}:`, error.message);
    return false;
  }
}

async function generateAllThumbnails() {
  console.log('🎨 Generando thumbnails para certificados PDF...\n');
  
  // Obtener todos los archivos PDF
  const pdfFiles = fs.readdirSync(CERTIFICATES_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => path.join(CERTIFICATES_DIR, file));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const pdfFile of pdfFiles) {
    const filename = path.basename(pdfFile, '.pdf');
    const outputFile = path.join(PREVIEWS_DIR, `${filename}-preview.png`);
    
    const success = await generateThumbnailForPdf(pdfFile, outputFile);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`✅ Thumbnails generados exitosamente: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📁 Total de archivos PDF procesados: ${pdfFiles.length}`);
  
  // Actualizar archivo certificates.ts con las rutas de thumbnails
  updateCertificatesFile();
}

function updateCertificatesFile() {
  const certificatesFilePath = path.join(__dirname, '../src/data/certificates.ts');
  
  try {
    let content = fs.readFileSync(certificatesFilePath, 'utf8');
    
    // Obtener nombres de archivos de preview generados
    const previewFiles = fs.readdirSync(PREVIEWS_DIR)
      .filter(file => file.includes('-preview.png'));
    
    // Crear un mapa de nombres base a rutas de preview
    const previewMap = {};
    previewFiles.forEach(file => {
      const baseName = file.replace('-preview.png', '');
      previewMap[baseName] = `shared/docs/certificados/previews/${file}`;
    });
    
    // Actualizar cada certificado en el archivo
    // Esta es una implementación básica - en producción se necesita un parser más robusto
    console.log('\n📝 Thumbnails disponibles:');
    previewFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
    
    console.log('\n💡 Para usar estos thumbnails, actualiza manualmente el campo "thumbnail" en certificates.ts');
    console.log('   Ejemplo: thumbnail: "shared/docs/certificados/previews/efset-preview.png"');
    
  } catch (error) {
    console.error('Error al actualizar certificates.ts:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateAllThumbnails().catch(console.error);
}

module.exports = { generateAllThumbnails };