# Protocolo de Exportación MuzicMania

Este documento define las reglas y algoritmos para la generación y descarga de documentación oficial en MuzicMania.

## 1. Nomenclatura de Archivos
Todos los archivos exportados deben seguir el formato:
`[DOC_ID]_V[VERSION]_[AÑO_MES_DÍA]_muzicmania.[ext]`

## 2. Paquetes Masivos (ZIP)
- Nombre: `DOCS_[DOC_ID]_V[VERSION]_[formatos]_[FECHA]_muzicmania.zip`
- Incluye un manifiesto `.txt` con el mismo nombre detallando el contenido.

## 3. Estándares de Formato (Word y PDF)
- **Tipografía**: Arial 11pt o 12pt (Obligatorio).
- **Numeración PDF**: Parte superior izquierda (Estilo Tradicional).
- **Firma PDF**: "MUZICMANIA OFFICIAL DOCUMENTATION" centrada en el pie de página (Copyright style).
- **Encabezados**: Todos los archivos (incluyendo los `.md` locales) deben tener el bloque de metadatos oficial al inicio.
- **Identificador**: Incluye el sufijo `_muzicmania` en el campo Identificador.

## 4. Sincronización
El script `scripts/export-docs.js` es el encargado de replicar el contenido `.md` en `.txt`, `.pdf` y `.docx`, asegurando que la información sea exactamente igual en todos los canales.
