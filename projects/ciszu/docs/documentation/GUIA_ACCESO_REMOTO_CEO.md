# Guía de acceso remoto — opencode desde el móvil (uso CEO)

> **Para quién**: Ciszuko (CEO). Uso personal — acceso a la terminal de IA del PC desde el móvil.
> **Versión**: ago 2026 · Enfoque: **Windows nativo** (sshd + opencode.exe, sin WSL/tmux).

---

## Qué es esto

El PC (ciszu-pc) expone **opencode nativo de Windows** (la IA que trabaja en el monorepo) alcanzable desde el móvil mediante SSH. Es el MISMO opencode que usas en el PC, con el mismo theme, el mismo historial de conversaciones y exactamente la misma carpeta `E:\Ciszu Network`.

```
                    opencode serve (headless, 127.0.0.1:4096) ←── proceso persistente en el PC
                    │  (tarea programada opencode-server-ciszu al iniciar sesión)
        ┌───────────┴────────────┐
        ▼                        ▼
Móvil (Termius) ──SSH──▶ PC :22 ─▶ opencode attach http://127.0.0.1:4096
PC (terminal local)  ────────▶ opencode attach http://127.0.0.1:4096
```

**Ambos se anclan al MISMO servidor** → misma sesión, mismo historial, en vivo. Si escribes en uno, se ve en el otro al instante.

No hay WSL ni tmux de por medio: la sincronización la hace el propio servidor de opencode (`serve` + `attach`), sin sobreingeniería.

---

## Acceso desde el PC (igual que siempre)

```powershell
opencode-ciszu-pc     # ancla al servidor compartido (sesión en vivo)
opencode                    # alternativa: instancia local independiente
```

---

## Acceso desde el móvil (Termius)

**Prerrequisitos (ya hechos):**

- App **Tailscale** instalada y logueada con la cuenta de Google del CEO.
- App **Termius** instalada, con la clave privada `CISZU SSH Key` importada y el host `Ciszu-PC` creado (`fplay@100.75.124.72:22`).

**Pasos (cada vez que quieras entrar):**

1. Abrir **Termius**.
2. Tocar el host **Ciszu-PC**.
3. Escribir el comando que retoma tu conversación:

    ```
    opencode-ciszu-cel
    ```

    (un lanzador del PC, ubicado en `C:\Users\fplay\opencode-ciszu-cel.cmd` — carpeta añadida al PATH de usuario — que arranca el servidor si no está y hace `opencode attach http://127.0.0.1:4096`). Ya no hace falta `.\`.

4. Ya estás dentro de opencode, anclado al **servidor compartido**: la MISMA sesión que el PC, en vivo.
5. Al terminar: **cerrar la app**. El servidor sigue corriendo en el PC y la conversación queda guardada.
6. Para volver: tocar el host → `opencode-ciszu-cel` de nuevo → vuelves a la misma sesión en vivo.

> ⚠️ Girar el móvil a **horizontal**: la TUI de opencode necesita ancho; en vertical se ve pequeña/cortada.

---

## Fallos comunes y solución

| Síntoma                                         | Causa probable                                                         | Solución                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| "Connection refused" / no conecta               | Tailscale apagado en PC o móvil                                        | Abrir Tailscale en el dispositivo y esperar a que reconecte                         |
| Conecta pero a PowerShell normal (sin opencode) | Aún no escribiste `opencode-ciszu-cel` | Escribir `opencode-ciszu-cel` |
| La pantalla se ve pequeña/cortada               | Móvil en vertical                                                      | Girar a horizontal                                                                  |
| "Permission denied (publickey)"                 | La clave privada no está en Termius                                    | Revisar Keys →`CISZU SSH Key` presente y seleccionada en el host                    |
| Al escribir salen caracteres raros              | Móvil en vertical (TUI muy estrecha)                                   | Girar a horizontal                                                                  |
| "Connection refused" a 127.0.0.1:4096           | El servidor headless no está corriendo (se apagó sin reiniciar sesión) | Lanzar `opencode-ciszu-pc` o `opencode-ciszu-cel` de nuevo: ellos arrancan el servidor si no existe |

---

## Qué pasa si… (preguntas frecuentes)

| Evento                            | Resultado                                                                                                                                                                                                                              |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cierro Tailscale en el teléfono   | No conectas hasta reabrirlo; al reabrirlo todo vuelve solo                                                                                                                                                                             |
| Cierro Tailscale en el PC         | Igual que arriba; reconecta al abrir la app                                                                                                                                                                                            |
| Reinicio el PC                    | `sshd` + Tailscale arrancan solos (servicios Automatic). El servidor opencode lo levanta la tarea programada `opencode-server-ciszu` al iniciar sesión. Tus conversaciones siguen en disco (se reanudan con `opencode-ciszu-pc`) |
| Apago el PC                       | Nada conecta hasta encenderlo — obvio, pero por si acaso 😄                                                                                                                                                                            |
| Trabajo en el PC y entra el móvil | ✅**Sin problema y sin duplicar**: ambos se anclan al mismo servidor → misma sesión, en vivo, en los dos a la vez                                                                                                                      |

---

## Seguridad (importante)

- 🔑 **La clave privada `ciszu_pc_ed25519` NO debe copiarse en este documento ni en ningún chat/doc.** Vive solo en:
    - **Termius (móvil)** — protegida con huella/PIN de la app.
    - **Copia local del PC** en `E:\Ciszu Network\.opencode\temp\termius-key\` (carpeta gitignored, fuera de git).
- Opcional recomendado: subir esa copia local a un gestor de contraseñas (vault) y borrarla del disco.
- El acceso es solo por **clave SSH** (sin contraseña), solo alcanzable desde la **red privada Tailscale** (no expuesto a internet).
- Si el móvil se pierde: revocar el dispositivo desde la consola admin de Tailscale (`https://login.tailscale.com/admin`) — hecho.

---

## Referencias

- Implementación técnica completa y troubleshooting: `projects/ciszu/docs/documentation/CONTROL_REMOTO.md`
- Script reproducible de la infraestructura: `scripts/setup-remote-control.ps1`
- Lanzadores (ninguno reinicia por defecto: solo ensure si falta + `opencode attach http://127.0.0.1:4096`; para reiniciar usar los `-reset`):
  - **Entrar (PC)**: `ciszu-ai-pc` o `opencode-ciszu-pc` (alias → tool oficial `C:\Users\fplay\ciszu-ai\ciszu-ai.cmd`, espejo sin espacios)
  - **Entrar (móvil)**: `ciszu-ai-cel` o `opencode-ciszu-cel` (mismo attach; Termius → SSH → estos comandos)
  - **Arrancar/garantizar**: `ciszu-ai-start`, `opencode-ciszu-start`
  - **Detener**: `ciszu-ai-stop`, `opencode-ciszu-stop`
  - **Reiniciar (explícito)**: `ciszu-ai-reset`, `opencode-ciszu-reset` (stop + ensure + attach)
  - Todos existen en `.cmd` y `.bat`, en `C:\Users\fplay\` y `AppData\Roaming\npm\`; tool oficial en `E:\Ciszu Network\tools\ciszu-ai\ciszu-ai.cmd` (subcomandos `server`/`stop`/`reset`)
- Tool del servidor headless: `E:\Ciszu Network\tools\ciszu-ai\ensure-server.ps1` (espejo `C:\Users\fplay\ciszu-ai\ensure-server.ps1` con `-RepoRoot`; tarea programada `opencode-server-ciszu` al iniciar sesión)
- Host del PC en la tailnet: `100.75.124.72` (hostname `ciszu-pc`)
