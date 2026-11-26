# OpenCode global (Linux)

Sincroniza la configuracion de OpenCode V2 del repo con `~/.config/opencode`:

```bash
bash shared/opencode/install.sh
```

| Elemento | Origen | Destino |
| --- | --- | --- |
| Skills (34) | `.opencode/skills` | `~/.config/opencode/skills` (symlink) |
| Skills agentes | `.opencode/skills` | `~/.agents/skills` (symlink manual) |
| Config global | `shared/opencode/opencode.json` | `~/.config/opencode/opencode.json` (symlink) |
| CLI/TUI | `shared/opencode/cli.json.template` | `~/.config/opencode/cli.json` (ruta del repo sustituida) |
| Auth | vault / `auth.json` de Windows | `~/.local/share/opencode/auth.json` (no se versiona) |

## MCP

Estado verificado el 2026-11-25:

- **OpenCode (Windows y Linux): sin MCP configurados.** `opencode mcp list`
  responde `No MCP servers configured`. La decision esta documentada en
  `projects/ciszu/docs/documentation/MODELS_SKILLS_SYSTEM.md` §7.
- **VS Code (Windows)**: 11 servidores en
  `%APPDATA%\Code\User\mcp.json` (markitdown, GitHub, Chrome DevTools,
  Playwright, Notion, Supabase, Figma, Stripe, MongoDB, Next DevTools,
  Hugging Face). No son configuracion de OpenCode y la mayoria exige OAuth o
  `${input:...}` que VS Code resuelve, no OpenCode.

Para habilitar un MCP en OpenCode Linux (opt-in, con el server apagado):

```bash
# Local (sin secretos)
opencode mcp add markitdown --global -- uvx markitdown-mcp@0.0.1a4
opencode mcp add playwright --global -- npx @playwright/mcp@latest

# Remoto con OAuth
opencode mcp add github --global --url https://api.githubcopilot.com/mcp/
opencode mcp auth github
```

No se activan por defecto: cada MCP local arranca un proceso y los remotos
requieren credenciales. Mantener el principio de `MODELS_SKILLS_SYSTEM.md`:
skills primero, MCP solo cuando aporte acceso estructurado que las skills no
cubran.

## Contrasena y sesiones

`ciszu-ai` usa `OPENCODE_PASSWORD` o `~/.config/ciszu-ai/password` (0600). Para
que Windows y Linux compartan emparejamientos, el valor debe ser el mismo en
ambos SO (se puede leer del vault o de la variable de usuario de Windows; nunca
del repo). La DB de sesiones sigue siendo local por SO; migrar la de Windows
(6,4 GB en `.opencode/data/`) es una decision manual.

## Plugin de voz

`cli.json` apunta a `tools/tts-stt-ai` (Node, compatible Linux/Windows). Para
usarlo hacen falta `whisper-cpp`, `piper`, `sox` y los modelos locales; sin
ellos la TUI arranca igual y el plugin solo falla si se invoca.
