# 🎯 Sistema de Iconos Profesional (MuzicMania)

Este documento describe el sistema de gestión de iconos automatizado, diseñado para la escalabilidad y portabilidad.

## 🛠️ Herramientas
- **Task Runner**: `npm scripts` + `chokidar-cli`
- **Generadores**: `svg-sprite` (SVG) e `ImageMagick` (PNG - opcional)
- **Fuentes**: Remix Icon, Tabler Icons, Font Awesome.

## 📂 Estructura de Archivos
```text
debug/download/         # Recursos externos ZIP/Unzipped (IGNORADO EN GIT)
content/icons/
├── svg-src/          # Iconos organizados con nomenclatura estándar
│   ├── outline/      # [lib]-outline-[name].svg
│   └── filled/       # [lib]-filled-[name].svg
├── sprites/          # ARCHIVOS GENERADOS (SVG Symbols)
│   ├── sprite-outline.svg
│   └── sprite-filled.svg
└── png/              # Iconos exportados para compatibilidad
```

## ⚙️ Automatización (MuzicMania Ultimate)
- `npm run console`: Acceso a la consola principal de depuración (Submenú `icons`).
- `npm run icons:build`: Atajo para ejecutar el sistema completo (Sprite + PNG + AI).

## 🚀 Cómo usar un icono
Usa el ID completo siguiendo el formato `icon-[nombre]`:

```html
<svg class="nav-icon">
  <use href="/sprite.svg#icon-ri-outline-home"></use>
</svg>
```

## 📝 Protocolo de Gestión
1. **Origen**: Descargar el icono en `debug/download`.
2. **Procesar**: Ejecutar `npm run icons:build`.
3. **Verificar**: Comprobar que el ID aparezca en el sprite correspondiente.

