---
description: Instala, comprueba o recarga el perfil PowerShell portable de Ciszu Network.
---

El perfil vive versionado en `shared/powershell/CiszuNetwork.Profile.ps1` y el `$PROFILE`
solo contiene un cargador que lo busca (incluido `CISZU_REPO`).

- **Instalar/reparar** (hace backup del perfil actual):
  `pnpm profile:install`
- **Comprobar**:
  `pnpm profile:check`
- **Recargar en la sesión actual**:
  `. $PROFILE` o `profile-reload` si ya está cargado.

En un dispositivo nuevo: clona el repo, ejecuta `pnpm install` y después
`pnpm profile:install`; abre una consola nueva. No copies secretos al perfil.
