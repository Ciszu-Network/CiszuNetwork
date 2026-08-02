# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

# Prioridad Alta

- [ ] Terminar de integrar el ecosistema de Docker a Ciszu Network.
- [ ] Instalar herramientras externas NO CLIS O IDES. Se encuentran en la carpeta downloads. Sirve para mas control y interfaz GUI. No utilizar si no es necesario o comparar cual es mejor.
- [ ] Pensar si integrar el ecosistema de tuneles para la consola remota. Segun el siguiente texto de informacion:

    **Ntfy.sh** es una herramienta minimalista, gratuita, sin registros obligatorios y basada puramente en HTTP (puedes enviar notificaciones con un simple comando `curl` o desde cualquier script de Node.js/Python).

    Sin embargo, para responder a tu pregunta con total precisión sobre si es _la mejor manera_ para lo que quieres lograr (monitorear y accionar desde fuera de casa), hay que hacer una distinción técnica importante:
    - **ntfy.sh es excelente para:** Recibir alertas rápidas, resúmenes, errores críticos o estados ("La tarea terminó", "La IA necesita tu aprobación") en la pantalla de bloqueo de tu teléfono estemos donde estemos.
    - **ntfy.sh NO es para:** Ver en tiempo real cada letra que imprime el CLI o interactuar activamente escribiendo comandos complejos de forma fluida (para eso es una notificación push de una sola vía, no una terminal remota interactiva).

    ***

    ### ¿Cómo lograr exactamente lo que pides (Monitorear + Accionar desde el teléfono)?

    Si tu objetivo es ver la ventana de la CLI en tiempo real y poder controlar o responder cuando no estás en casa, existen alternativas reales y profesionales que complementan (o superan) a una simple notificación:

    #### 1. Para ver la CLI en tiempo real y controlarla (Acceso Remoto a la Terminal)
    - **Gotty o ttyd**: Son herramientas ultraligeras que convierten cualquier terminal de comandos (como tu CLI de VS Code) en una aplicación web interactiva.
    - _Cómo funciona_: Ejecutas `gotty -w tu_comando_o_shell` en tu PC. Esto levanta un servidor local seguro con un token. Si usas un túnel seguro como **Cloudflare Tunnels** o **Tailscale**, puedes abrir ese enlace desde el navegador de tu teléfono móvil. Verás exactamente la misma ventana negra de la terminal actualizándose al instante y podrás escribir en ella como si estuvieras frente al teclado.
    - **tmux + SSH (La vieja confiable)**: Si configuras un servidor SSH seguro en tu PC de desarrollo y usas una app de terminal móvil (como _Termius_ en Android/iOS), puedes conectarte a tu PC desde la calle, abrir una sesión de `tmux` (multiplexor de terminales) y ver la ejecución de la IA en tiempo real exactamente igual que en tu escritorio.

    #### 2. Para interactuar mediante la IA (El ecosistema que ya usas)

    Si la IA está corriendo en tu VS Code a través de scripts o extensiones, la mejor forma de "accionar" sin tener que mirar la terminal negra constantemente es combinar **ntfy.sh** con **Webhooks interactivos** o **Discord/Telegram**:
    - En lugar de solo recibir un aviso en `ntfy.sh`, puedes hacer que el script de notificación te envíe un botón o un enlace rápido (o usar un bot de Telegram/Discord privado).
    - Por ejemplo: La IA termina una tarea o se queda esperando una confirmación tuya $\rightarrow$ Te llega una notificación al móvil $\rightarrow$ Respondes con un comando rápido o un botón en Telegram que le dice al script local de tu PC cómo continuar.

    ***

    ### Veredicto
    1. **Para alertas y avisos rápidos**: Mantén **ntfy.sh**. Es liviano, rápido y no consume recursos de tu proyecto.
    2. **Para ver la pantalla negra y tipear en remoto**: Instala **Tailscale** (para conectar tu móvil y tu PC a la misma red privada virtual de forma segura sin abrir puertos en tu router) y usa **Termius** o **Gotty** para ver la terminal en tiempo real desde el celular.

Para tener una experiencia 100% nativa de app (sin depender de abrir pestañas en el navegador del móvil, con notificaciones push reales y una interfaz optimizada para pantallas táctiles), la respuesta es **sí, existe una herramienta oficial y es el estándar de la industria para esto**.

Se trata de **Termius**.

### Termius: La aplicación móvil oficial para control total de terminales

**Termius** es una aplicación cliente de SSH, SFTP y Terminal con aplicaciones oficiales y nativas para **Android e iOS**. No es una página web; es una app instalada en tu teléfono con diseño moderno, soporte para temas oscuros, atajos de teclado virtuales avanzados (con flechas, `Tab`, `Ctrl`, `Esc`) y gestión segura de credenciales.

---

### ¿Cómo se configura para tener el control total desde la app?

Para conectarte desde la app de Termius en tu teléfono a la terminal de tu PC (estando en la casa o en la calle), se combina con la misma tecnología de red privada que mencionamos antes (**Tailscale**):

1. **Instalas Tailscale** en tu PC y en tu teléfono (para que tu PC tenga una IP interna fija como `100.x.x.x` accesible desde cualquier red del mundo).
2. **Habilitas un servidor SSH seguro en tu PC** (en Windows 10/11 puedes activar el servicio nativo de _OpenSSH Server_, o si usas WSL/Linux viene integrado por defecto).
3. **Abres la app de Termius en tu móvil**, añades un nuevo "Host" rellenando estos datos:

- **Alias**: Mi PC de Desarrollo
- **Hostname / IP**: La IP de Tailscale de tu PC (`100.x.x.x`)
- **Port**: `22`
- **Username y Password**: Las credenciales de tu usuario de Windows/Linux.

4. **¡Listo!** Con solo tocar ese host en la app de Termius, se abrirá una **aplicación nativa** con la terminal interactiva de tu PC.

### Por qué esta es la versión definitiva que buscas:

- **Es una app real**: La descargas de la Google Play Store o App Store.
- **Control Absoluto**: Ves la terminal de VS Code en tiempo real y puedes escribir, compilar, usar `tmux` para mantener múltiples pestañas abiertas, o detener procesos con `Ctrl + C` usando los botones flotantes de la app.
- **Seguridad Máxima**: Al ir cifrado por protocolo SSH puro y respaldado por la red privada de Tailscale, nadie en internet puede ver ni interceptar tu conexión.

Para tener una experiencia 100% nativa de app (sin depender de abrir pestañas en el navegador del móvil, con notificaciones push reales y una interfaz optimizada para pantallas táctiles), la respuesta es **sí, existe una herramienta oficial y es el estándar de la industria para esto**.

Se trata de **Termius**.

### Termius: La aplicación móvil oficial para control total de terminales

**Termius** es una aplicación cliente de SSH, SFTP y Terminal con aplicaciones oficiales y nativas para **Android e iOS**. No es una página web; es una app instalada en tu teléfono con diseño moderno, soporte para temas oscuros, atajos de teclado virtuales avanzados (con flechas, `Tab`, `Ctrl`, `Esc`) y gestión segura de credenciales.

---

### ¿Cómo se configura para tener el control total desde la app?

Para conectarte desde la app de Termius en tu teléfono a la terminal de tu PC (estando en la casa o en la calle), se combina con la misma tecnología de red privada que mencionamos antes (**Tailscale**):

1. **Instalas Tailscale** en tu PC y en tu teléfono (para que tu PC tenga una IP interna fija como `100.x.x.x` accesible desde cualquier red del mundo).
2. **Habilitas un servidor SSH seguro en tu PC** (en Windows 10/11 puedes activar el servicio nativo de _OpenSSH Server_, o si usas WSL/Linux viene integrado por defecto).
3. **Abres la app de Termius en tu móvil**, añades un nuevo "Host" rellenando estos datos:

- **Alias**: Mi PC de Desarrollo
- **Hostname / IP**: La IP de Tailscale de tu PC (`100.x.x.x`)
- **Port**: `22`
- **Username y Password**: Las credenciales de tu usuario de Windows/Linux.

4. **¡Listo!** Con solo tocar ese host en la app de Termius, se abrirá una **aplicación nativa** con la terminal interactiva de tu PC.

### Por qué esta es la versión definitiva que buscas:

- **Es una app real**: La descargas de la Google Play Store o App Store.
- **Control Absoluto**: Ves la terminal de VS Code en tiempo real y puedes escribir, compilar, usar `tmux` para mantener múltiples pestañas abiertas, o detener procesos con `Ctrl + C` usando los botones flotantes de la app.
- **Seguridad Máxima**: Al ir cifrado por protocolo SSH puro y respaldado por la red privada de Tailscale, nadie en internet puede ver ni interceptar tu conexión.

Aplicar las APIS de servicios de generacion de arte para Ciszu Network (Si se necesita tokens pedir)

Generar claves AI artísticas: Leonardo, Recraft, SiliconFlow (plan en docs/ia_docs/AI_ART_APIS.md — Creen no tiene API)

- [ ] Leonardo AI
- [ ] Recraft
- [ ] SiliconFlow
- [ ] Creen

# Prioridad Media

- [ ] Añadir framework de tests (Playwright, Vitest)
- [ ] Aun falta arreglar algunas de las conexiones del cdn con implicacion en las builds reales. Como websites, en especial ciszukoantony y ciszunetwork pages, debido a que los logos no se muestran correctamente

## Prioridad Baja

- [ ] Sistema de caché con Redis
- [ ] PWA para websites
