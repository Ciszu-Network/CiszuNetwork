# Sistema de Certificados Mejorado - CiszukoAntony

## Resumen de Mejoras Implementadas

### 1. Reorganización de Categorías
Se han añadido y reorganizado las categorías según especificaciones:

| Categoría | Color | Descripción | Documentos incluidos |
|-----------|-------|-------------|---------------------|
| **Personal** | `#ec4899` | Documentos personales | Perfil de personalidad (16Personalities) |
| **Bachillerato** | `#8b5cf6` | Certificado de bachillerato | Imagen de certificado de bachillerato |
| **Other Documents** | `#94a3b8` | Documentos complementarios | Transcripts, expedientes, records |
| *Categorías existentes* | *Originales* | Certificados profesionales | Todos los certificados anteriores |

### 2. Sistema de Thumbnails/Previsualizaciones REALES
Cada certificado muestra una **previsualización real del documento**:

```typescript
{
  thumbnail?: string; // Ruta a la imagen de previsualización (opcional)
  // Si no hay thumbnail, se usa el primer archivo del certificado
}
```

**Características:**
- ✅ **Previsualización REAL**: Muestra la primera página del PDF/imagen real
- ✅ **Auto-detección**: Detecta automáticamente si es imagen o PDF
- ✅ **Fallback inteligente**: Si no hay thumbnail específico, usa el documento principal
- ✅ **Visual directo**: Sin filtros oscuros, muestra el contenido real

### 3. UI Mejorada
- **Tarjetas con previsualización**: Muestra iconos de PDF/imagen con overlay oscuro
- **Modal interactivo mejorado**: Sección de previsualización destacada
- **Filtros independientes**: Certificados principales vs documentos complementarios
- **Design más visual**: Gradientes, efectos hover, y organización clara

## Cómo Agregar Thumbnails/Primeras Páginas

### Opción 1: Thumbnails específicos (recomendado)
1. **Crear screenshots** de la primera página de cada PDF
2. **Guardar imágenes** en: `shared/docs/certificados/previews/`
3. **Usar nombres descriptivos**:
   - `efset-preview.jpg` (EF SET Certificate)
   - `personality-preview.jpg` (Personality Profile)
   - `cisco-preview.jpg` (Cisco certificates)
   - `transcript-preview.jpg` (Learning transcript)
   - `expediente-preview.jpg` (Microsoft Learn record)

4. **Actualizar el archivo `certificates.ts`**:
```typescript
thumbnail: 'shared/docs/certificados/previews/nombre-preview.jpg',
```

### Opción 2: Sistema automático (funciona ahora)
- **Sin configuración**: El sistema usa automáticamente el primer archivo del certificado
- **Para imágenes JPG/PNG**: Muestra la imagen completa como preview
- **Para PDFs**: Muestra la primera página del PDF como preview
- **Etiquetado automático**: Muestra "IMAGEN" o "PDF" según el tipo

## Script de Ayuda

Ejecuta el script para ver instrucciones detalladas:
```powershell
.\scripts\create-certificate-thumbnails.ps1
```

## Flujo de Trabajo Recomendado

1. **Organización**: Clasifica nuevos documentos en las categorías apropiadas
2. **Previsualizaciones**: Toma screenshots de cada documento importante
3. **Actualización**: Añade thumbnails al archivo de datos
4. **Verificación**: Revisa que las previsualizaciones se muestren correctamente

## Categorías Actuales Disponibles

1. **Certificados Profesionales**:
   - english, programming, web, ai, cloud, digital, design, marketing, finance

2. **Documentos Personales**:
   - personal, bachillerato, other

## Notas Técnicas

- Las previsualizaciones usan un filtro de `brightness(0.4)` para legibilidad del texto
- Los iconos cambian según el tipo de documento (PDF, imagen, documento genérico)
- El sistema es retrocompatible: certificados sin thumbnail muestran un placeholder
- La estructura del CDN mantiene: `${CDN_BASE}/shared/docs/certificados/...`

---

*Última actualización: 3 Sep 2026*  
*Responsable: Ciszuko Antony - Sistema de Portfolio Profesional*