# Ciszu Network Monorepo

Monorepo principal de Ciszu Network conteniendo todas las aplicaciones y servicios.

## 🏗️ Estructura del Proyecto

```
.
├── apps/                    # Aplicaciones individuales
│   ├── ciszubot/           # Bot de Discord
│   ├── ciszukoantony/      # Sitio web personal
│   └── muzicmania/         # Juego musical (web + desktop)
├── shared/                 # Recursos compartidos
│   ├── icons/             # Sistema de iconos (nuevo!)
│   │   ├── outline/       # Iconos con contorno
│   │   ├── filled/        # Iconos rellenos  
│   │   └── flag/          # Banderas y especiales
│   ├── fonts/             # Fuentes tipográficas
│   └── images/            # Imágenes compartidas
├── packages/              # Paquetes compartidos
│   ├── cdn/              # Gestión de assets y CDN
│   ├── ui/               # Componentes de UI
│   ├── config/           # Configuraciones compartidas
│   └── utils/            # Utilidades comunes
├── content/              # Contenido multimedia
├── documents/            # Documentación general
├── scripts/              # Scripts de automatización
└── docs/                 # Documentación técnica
```

## 🎨 Nuevo Sistema de Iconos

Hemos implementado un sistema profesional de iconos que reemplaza el antiguo sistema de sprites e iconos inline.

### Características Principales

- **Estructura organizada**: `outline/`, `filled/`, `flag/` con formatos SVG, PNG, AI
- **Asset Resolver inteligente**: Decide automáticamente entre CDN y local según entorno
- **Multiplataforma**: Soporta Web, Tauri (Desktop), y futuro React Native (Mobile)
- **Tree-shaking**: Solo incluye los iconos realmente usados en el bundle
- **CDN ready**: Configuración para Supabase Storage o Cloudflare R2

### Uso Rápido

```typescript
// Importación directa (recomendado)
import homeIcon from '@shared/icons/outline/svg/home_outline.svg';

// Usando el Asset Resolver
import { resolveIcon } from '@cdn';
const iconUrl = resolveIcon('home', 'outline', 'svg');
```

### Migración desde Sistema Antiguo

```bash
# 1. Extraer iconos inline del código existente
node scripts/extract-icons.js

# 2. Migrar código a nuevo sistema  
node scripts/migrate-icons.js

# 3. Descargar iconos adicionales (opcional)
node scripts/download-icons.js --category=navigation --count=20
```

## 🚀 Comenzando

### Prerrequisitos

- Node.js 18+
- pnpm 8+ (recomendado) o npm/yarn
- Git

### Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar todas las apps en desarrollo
pnpm dev

# Iniciar app específica
pnpm dev --filter=@ciszu/muzicmania
```

### Comandos Principales

```bash
# Desarrollo
pnpm dev                    # Todas las apps
pnpm dev --filter=[app]     # App específica

# Build
pnpm build                  # Todas las apps
pnpm build --filter=[app]   # App específica

# Testing
pnpm test                   # Todos los tests
pnpm test --filter=[app]    # Tests de app específica

# Linting
pnpm lint                   # Todo el código
pnpm lint:fix              # Con auto-fix
```

## 📦 Paquetes Compartidos

### `@ciszu/cdn` - Gestión de Assets

```typescript
import { assetResolver, resolveIcon } from '@cdn';

// Resolver assets según entorno
const iconUrl = resolveIcon('home', 'outline', 'svg');
const imageUrl = assetResolver.resolve('images/logo.png');

// Verificar disponibilidad
const exists = await assetResolver.assetExists('icons/home.svg');
```

### `@ciszu/ui` - Componentes de UI

```typescript
import { Button, Card, Icon } from '@ui';

// Componentes con soporte de iconos
<Button icon={<Icon name="home" />}>
  Inicio
</Button>
```

### `@ciszu/config` - Configuraciones

```typescript
import { eslintConfig, tailwindConfig } from '@config';

// Configuraciones compartidas para todas las apps
```

## 🏗️ Arquitectura

### Monorepo con Turborepo

- **Build caching**: Builds incrementales rápidos
- **Task orchestration**: Ejecución paralela de tareas
- **Dependency management**: Uso eficiente de dependencias### Workspaces con pnpm

- **Symlinks**: Enlaces simbólicos para paquetes locales
- **Hoisting**: Dependencias compartidas optimizadas
- **Performance**: Instalación rápida de paquetes

### CDN Strategy

- **Desarrollo**: Assets locales para velocidad
- **Producción Web**: CDN para performance global
- **Tauri**: Assets empaquetados para offline
- **React Native**: Bundle assets o CDN según conexión

## 🛡️ Filosofía Oficial y DevSecOps

Ciszu Network opera bajo una filosofía de ingeniería profesional y seguridad integrada (DevSecOps):

- **Filosofía de código** — DRY, KISS, YAGNI, SOLID, Separation of Concerns y Least Astonishment aplicados a toda implementación. Documento oficial: [`docs/ia_docs/CODE_PRINCIPLES.md`](./docs/ia_docs/CODE_PRINCIPLES.md)
- **Seguridad por diseño** — Shift-Left: SAST (Semgrep en CI), DAST (ZAP), escaneo de secretos (secretlint + gitleaks pre-commit), dependencias (pnpm audit, cargo audit, trivy) y advisors de Supabase verificados tras cada cambio. Documento oficial: [`docs/ia_docs/DEVSECOPS.md`](./docs/ia_docs/DEVSECOPS.md)
- **Estándares obligatorios** — aplicables a IA y humanos: ver `AGENTS.md` (checklist "A ejecutar en toda implementación nueva") y los `SECURITY.md` de cada web.

## 🔧 Configuración

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_CDN_URL=http://localhost:3000/assets
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

### TypeScript

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"],
      "@cdn/*": ["packages/cdn/*"],
      "@ui/*": ["packages/ui/*"]
    }
  }
}
```

## 📚 Documentación

- [Sistema de Iconos](./docs/icons-system.md) - Guía completa
- [Configuración de Bundlers](./docs/bundler-config.md) - Vite/Next.js/Tauri
- [Migración](./docs/migration-guide.md) - Desde sistema antiguo

## 🛠️ Scripts de Automatización

```bash
# Sistema de iconos
node scripts/extract-icons.js      # Extraer iconos inline
node scripts/migrate-icons.js      # Migrar código antiguo
node scripts/download-icons.js     # Descargar iconos de Iconify
node scripts/upload-cdn.js         # Subir assets a CDN

# Utilidades
node scripts/clean-node-modules.js # Limpiar node_modules
node scripts/verify-structure.js   # Verificar estructura
node scripts/generate-aliases.js   # Generar aliases TypeScript
```

## 🤝 Contribución

### Flujo de Trabajo

1. Crear branch desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Desarrollar cambios
3. Ejecutar tests: `pnpm test`
4. Verificar linting: `pnpm lint`
5. Commit con mensaje descriptivo
6. Pull Request a `main`

### Convenciones

- **Commits**: Mensajes en español, formato descriptivo
- **Código**: TypeScript estricto, ESLint + Prettier
- **Iconos**: Usar nuevo sistema en `shared/icons/`
- **Assets**: CDN para producción, locales para desarrollo

## 🚨 Solución de Problemas

### Problemas Comunes

```bash
# Error: Cannot find module '@shared/...'
# Solución: Verificar tsconfig.json y alias del bundler

# Error: SVG no se muestra
# Solución: Configurar @svgr en webpack/Vite

# Error: Tauri no encuentra assets
# Solución: Verificar importación y tauri.conf.json
```

### Debugging

```bash
# Ver estructura de iconos
tree shared/icons/

# Verificar configuración
node scripts/verify-config.js

# Analizar bundle
pnpm analyze
```

## 📞 Soporte

- **Documentación**: [docs/](./docs/)
- **Issues**: GitHub Issues
- **Discord**: [Ciszu Network Discord](https://discord.gg/ciszunetwork)

## 📄 Licencia

Propietario - Ciszu Network © 2024

---

*Este README fue generado por CISZU AI - Sistema de Desarrollo Autónomo*
*Última actualización: ${new Date().toLocaleDateString()}*
