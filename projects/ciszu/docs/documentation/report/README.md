# report/ — Reportes generados por IA

Esta carpeta guarda **reportes generados automaticamente por IA** para Ciszu Network:
investigaciones, analisis, auditorias puntuales y respuestas tecnicas extensas que Ciszuko
Antony quiere leer fuera del chat.

## Nomenclatura

```
(asunto)_report-(fecha).md | .txt
(asunto)_report-(fecha)-NNN.md | .txt   ← NNN solo si hay varios el mismo dia
```

- `asunto`: descriptivo, en minusculas, sin espacios (`_` como separador).
- `fecha`: `YYYY-MM-DD` del dia de generacion.
- `NNN`: sufijo numerico (correlativo/aleatorio) unicamente cuando dos reportes del mismo
  asunto coinciden en fecha, para no sobreescribir.

Ejemplos: `seguridad_escalabilidad_report-2026-09-30.md`,
`rendimiento_vercel_report-2026-10-02-001.txt`.

## Reglas de formato

- **Si el usuario pide un MD**: se generan **dos archivos** con el mismo contenido —
  `.md` (con formato) y `.txt` (texto plano, sin simbolos de markdown).
- **Si el usuario pide un TXT**: se genera **solo** el `.txt`.
- **Si no especifica formato**: por defecto se generan ambos (`.md` + `.txt`).
- Los reportes no se editan despues de publicados; si hay una revision, se genera un
  reporte nuevo con la fecha del dia.

## Contenido permitido

- Nunca incluir secretos, tokens, contrasenas ni datos personales de usuarios. Las
  referencias a credenciales son siempre por nombre (`vault`, variable, etc.).

_Última revisión: 2026-09-30._
