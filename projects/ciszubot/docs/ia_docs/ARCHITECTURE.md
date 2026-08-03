# CiszuBot — Architecture Overview

## Project Structure
```
projects/ciszubot/
├── website/              # Next.js 15 — Landing page del bot
│   ├── public/
│   │   └── docs/         # Documentación pública descargable
│   └── src/              # Código fuente de la web
├── discord/              # Discord.js bot (pendiente de crear)
├── docs/                 # Documentación del proyecto
│   ├── txt/              # Texto plano (fuente de verdad)
│   ├── md/               # Markdown
│   ├── docx/             # Word
│   ├── pdf/              # PDF
│   ├── ia_docs/          # Documentación para IA
│   └── backups/          # Copias de seguridad
└── Shigamens Server/     # Docs del servidor de Discord (special)
```

## Components
- **Website**: Landing page con información del bot, comandos, FAQ
- **Bot**: Procesador de comandos de Discord (slash commands)
- **Docs**: Documentación completa del bot y servidor

## Document Pipeline
```
txt → md → docx → pdf
```