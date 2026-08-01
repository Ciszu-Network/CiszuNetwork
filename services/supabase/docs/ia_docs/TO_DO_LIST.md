# To Do List — Ciszu Network DataBase

> Este archivo solo puede ser editado por Ciszuko Antony.

## Prioridad Alta — CDN Multimedia

- [x] **Subir assets multimedia a Supabase Storage** (bucket: ciszu-cdn)
    - [x] Hacer inventario de assets por proyecto (GIFs, videos, imágenes grandes, música)
    - [x] Ejecutar `pnpm cdn:upload` con SUPABASE_SERVICE_ROLE_KEY
    - [x] Verificar subida de assets
- [ ] **Migrar referencias locales a CDN** en cada webpage (fase 2 — assets arbitrarios)
    - [ ] Identificar todas las rutas a assets locales en el código (`/content/`, `/public/images/`, etc.)
    - [ ] Reemplazar con llamadas a `assetResolver.resolve(path)` desde `@ciszunetwork/cdn`
    - [ ] Probar que cada webpage carga assets desde CDN correctamente
- [ ] **Limpiar assets locales del repositorio** después de migración exitosa
    - [ ] Actualizar `.gitignore` para excluir assets migrados
    - [ ] Verificar que el repo pesa menos después de la limpieza

## Prioridad Alta — Agent IA

- [ ] Solucionar bugs, errores y mas luego de la nuevas pruebas hasta pulir todo.
- [ ] Aun falta arreglar algunas de las conexiones del cdn con implicacion en las builds reales. Como websites.
- [ ] Arreglar los errores de consola de todas las paginas.
- [ ] Arreglar vulnerabilidades de github de todas las paginas.
- [ ] Arreglar advisors de supabase de todas las pagina.
- [ ] Consultar beneficios de aprender docker para Ciszu Network y sus paginas.
- [ ] Agregar AI APIS para diseños artisticos en los proyectos.
    - [ ] [app.leonardo.ai](https://app.leonardo.ai/)
    - [ ] [www.recraft.ai](https://www.recraft.ai/project/da269349-6552-4a93-ac10-3cb0f9961fbb)
    - [ ] [cloud.siliconflow.co](https://cloud.siliconflow.com/me/models)m
    - [ ] [www.creen.ai](https://www.creen.ai/es)

- [ ] Pedir a la IA que agreges los principios de la programacion y documentarlo para todos lo proyectos de Ciszu Network a partir d eahora, seguirlo y completarlos:

1. SAST y DAST
   SAST (Static Application Security Testing): Es una prueba de seguridad de aplicaciones estáticas. Analiza el código fuente, el bytecode o los binarios en busca de vulnerabilidades sin ejecutar el programa. Funciona como un revisor de código automatizado que detecta errores de sintaxis o malas prácticas antes de que el software corra (aquí entran herramientas como Semgrep o Secretlint).

DAST (Dynamic Application Security Testing): Es una prueba de seguridad de aplicaciones dinámicas. Analiza la aplicación en tiempo de ejecución desde el exterior, simulando ataques reales (como inyecciones SQL o ataques XSS) contra la aplicación ya desplegada o corriendo en un entorno de pruebas (aquí entra OWASP ZAP).

2. DevSecOps
   Significado: Es la evolución del desarrollo ágil y de DevOps, donde la palabra Sec (de Security / Seguridad) se integra desde el principio y en cada etapa del ciclo de vida del desarrollo de software (SDLC), en lugar de pensar en la seguridad solo al final del proyecto.

Para qué sirve: Para automatizar revisiones de seguridad (como escaneos de secretos, auditorías de dependencias y pruebas de vulnerabilidades) directamente dentro de las herramientas cotidianas de los desarrolladores y los flujos de trabajo automatizados (pipelines), reduciendo costos y riesgos.

3. Otros términos clave relacionados con tu flujo de trabajo
   Shift-Left (Desplazamiento a la izquierda): Es la filosofía de mover las pruebas de calidad y seguridad lo más temprano posible en el proceso de desarrollo (por ejemplo, detectando errores en la computadora del programador antes de hacer un commit o un pull request), en lugar de descubrirlos cuando el software ya está en producción.

Pipeline de CI/CD (Integración Continua / Despliegue Continuo): Es un conjunto de pasos automatizados que se ejecutan cada vez que subes código a un repositorio. Compila la aplicación, pasa pruebas unitarias, ejecuta escáneres de seguridad (como Gitleaks o Semgrep) y despliega el sistema de forma automática si todo es seguro.

CVE (Common Vulnerabilities and Exposures): Es un diccionario o catálogo público estándar donde se registran y catalogan todas las vulnerabilidades de ciberseguridad conocidas en software y hardware a nivel mundial. Herramientas como cargo audit o pnpm audit consultan bases de datos basadas en este sistema.

Secret Sprawl (Proliferación de secretos): Ocurre cuando credenciales sensibles (tokens, contraseñas, claves privadas de Supabase o bases de datos) se multiplican y quedan expuestas por error en múltiples archivos de configuración, historiales de Git o capturas de pantalla, aumentando el riesgo de brechas de seguridad.

## Referencias Reales y Casos de Uso en Empresas Gigantes

Las herramientas de seguridad, escaneo estático, gestión de dependencias y monitorización que analizamos no son conceptos teóricos; son la columna vertebral de la infraestructura tecnológica de las mayores empresas del mundo:

- **GitHub y Microsoft** : Utilizan herramientas nativas basadas en ganchos de pre-commit y escáneres de secretos similares a **Gitleaks** y **Secretlint** ( _Secret Scanning_ ) integrados directamente en sus plataformas para bloquear automáticamente claves de API filtradas antes de que se publiquen en repositorios públicos o corporativos.
- **Netflix** : Es un referente global en la automatización de la seguridad ( _DevSecOps_ ). Utilizan análisis estático de código profundo (equivalente conceptual a **Semgrep** ) y escáneres de dependencias automatizados en sus pipelines de despliegue continuo para proteger su enorme ecosistema de microservicios en la nube.
- **Meta (Facebook e Instagram)** : Emplean herramientas avanzadas de análisis estático y dinámico ( **SAST/DAST** ) personalizadas para revisar millones de líneas de código diariamente, aplicando la filosofía de _Shift-Left_ para corregir vulnerabilidades antes de que el código llegue a los servidores de producción que atienden a miles de millones de usuarios.
- **Google** : Desarrolladores y equipos de seguridad de Google utilizan marcos estrictos de auditoría de paquetes y herramientas como analizadores de dependencias similares a **pnpm audit** o **cargo audit** para verificar la integridad de las librerías de terceros en lenguajes como C++, Python, Rust y JavaScript antes de integrarlas a sus productos.
- **Uber** : Utiliza **OWASP ZAP** y herramientas DAST automatizadas dentro de sus pipelines de pruebas de seguridad para escanear aplicaciones web y APIs expuestas al público, asegurando que los servicios de transporte y logística no tengan fallas críticas de inyección o control de acceso.
- **Spotify** : Integra plataformas de monitorización de errores y rendimiento en tiempo real como **Sentry** (en sus niveles empresariales o distribuciones escaladas) para capturar excepciones en sus aplicaciones de escritorio y móviles, permitiendo a los ingenieros detectar y resolver fallos de software en minutos a escala global.

## ¿Qué significa DRY?

**DRY** son las siglas de **"Don't Repeat Yourself"** ( _No te repitas_ ).

Es uno de los principios de diseño de software más famosos del mundo, acuñado por Andy Hunt y Dave Thomas en el libro _The Pragmatic Programmer_ .

- **Significado** : Cada pieza de conocimiento, lógica o funcionalidad en un sistema debe tener una representación única, inequívoca y autoritaria dentro de un sistema. En cristiano: **si te encuentras escribiendo el mismo bloque de código (o muy similar) dos o más veces, estás rompiendo la regla DRY** .
- **Para qué sirve** : Evita la redundancia. Si tienes el mismo código copiado en diez lugares distintos de tu proyecto y necesitas corregir un error o cambiar una regla de negocio, tendrías que modificar los diez archivos (con el riesgo de olvidar alguno). Con el principio DRY, encapsulas ese código en una sola función, componente o librería, y si cambias algo, se actualiza automáticamente en todo el sistema.

### ¿Se usa también?

**Se usa de forma masiva.** Es una regla de oro diaria para cualquier desarrollador, ya sea que esté escribiendo funciones en JavaScript, componentes de interfaz, consultas a bases de datos o lógica de servidores.

Sin embargo, en el mundo real hay un equilibrio: a veces los desarrolladores novatos intentan aplicar DRY de forma tan obsesiva que terminan creando código demasiado complejo o acoplado (lo que llaman _sobreingeniería_ ). Por eso, la regla práctica es no repetirse cuando la lógica es exactamente la misma, pero sin complicar el código innecesariamente solo por ahorrarse tres líneas.

Además de DRY, existen otros principios de diseño y reglas de oro fundamentales en la programación que los desarrolladores utilizan a diario para escribir código limpio, mantenible y escalable. Los más importantes y reconocidos son:

1. KISS (Keep It Simple, Stupid / Mantenlo simple, estúpido)
   Significado: Defiende que la mayoría de los sistemas funcionan mejor si se mantienen simples en lugar de complejos.

Aplicación: Evita la sobreingeniería. Si puedes resolver un problema con una función sencilla y directa, no inventes una arquitectura de diez capas solo porque "luce más profesional". El código simple es más fácil de leer, probar y corregir.

2. YAGNI (You Aren't Gonna Need It / No lo vas a necesitar)
   Significado: No escribas código ni añadas funcionalidades hasta que realmente las necesites en el presente.

Aplicación: Es muy común que los programadores piquen código pensando: "Voy a dejar esta función lista por si acaso en el futuro la usamos". YAGNI prohíbe esto. Si no hay un requerimiento actual para esa funcionalidad, no se implementa, evitando desperdiciar tiempo y acumular código muerto o innecesario.

3. Principios SOLID
   Es el acrónimo de cinco principios fundamentales de la programación orientada a objetos (y del diseño de software en general), creados por Robert C. Martin (Uncle Bob):

S (Single Responsibility / Responsabilidad Única): Una clase o módulo debe tener una, y solo una, razón para cambiar (debe hacer una sola cosa y hacerla bien).

O (Open/Closed / Abierto/Cerrado): Las entidades de software deben estar abiertas para su extensión, pero cerradas para su modificación (puedes añadir nuevas funciones sin alterar el código que ya funciona).

L (Liskov Substitution / Sustitución de Liskov): Si usas herencia, las clases hijas deben poder sustituir a sus clases padres sin romper el funcionamiento del programa.

I (Interface Segregation / Segregación de Interfaces): Es mejor tener muchas interfaces pequeñas y específicas que una sola interfaz gigantesca que obligue a implementar métodos que no se usan.

D (Dependency Inversion / Inversión de Dependencias): Los módulos de alto nivel no deben depender de los de bajo nivel; ambos deben depender de abstracciones.

4. Separation of Concerns (Separación de Intereses / Preocupaciones)
   Significado: Consiste en dividir un programa informático en secciones distintas, de modo que cada sección se ocupe de un aspecto o "interés" independiente.

Aplicación: Es la base de arquitecturas como MVC (Model-View-Controller). Por ejemplo, la interfaz visual (frontend) no debe calcular la lógica de negocios pesada ni conectarse directamente a las tablas de la base de datos sin pasar por un servidor intermediario.

5. Principle of Least Astonishment (Principio de Menor Sorpresa)
   Significado: Un componente de un sistema debe comportarse de una manera que la mayoría de los usuarios o programadores esperen que se comporte, evitando sorpresas o confusiones.

Aplicación: Si creas una función llamada calcularImpuesto(), el resultado lógico que cualquier compañero espera es que devuelva un número con el cálculo; si por sorpresa esa función también borra registros de la base de datos o envía un correo, rompe por completo este principio.

- **Factibilidad local** : Herramientas como **Gitleaks** , **Secretlint** , **Semgrep** , **pnpm** y **Cargo** están diseñadas para ejecutarse directamente en tu computadora o como ganchos ( _hooks_ ) previos al envío del código (`pre-commit`), lo que significa que no requieren una infraestructura pesada y apenas consumen recursos.
- **Automatización** : Toda esta capa de seguridad encaja de manera natural en servicios gratuitos de integración continua (como GitHub Actions) utilizando el nivel gratuito ( _free tier_ ) de plataformas de monitorización como **Sentry** y escáneres de pruebas dinámicas como **OWASP ZAP** instalados mediante gestores como **Chocolatey** (`choco`).
- **Coherencia técnica** : El ecosistema funciona de forma fluida porque cubre todas las fases del desarrollo: manejas la gestión eficiente de dependencias (`pnpm`, `cargo`), auditas esas librerías en busca de vulnerabilidades (`pnpm audit`, `cargo audit`), escaneas el código estáticamente (`Semgrep`), previenes fugas de credenciales (`Gitleaks`, `Secretlint`) y entiendes los conceptos globales de pruebas estáticas y dinámicas ( **SAST/DAST** ) bajo una filosofía de seguridad integrada (**DevSecOps** y **Shift-Left** ).

## 1. Arquitectura y Escalabilidad (Performance & Scalability)

- **Alta Disponibilidad (HA) y Tolerancia a Fallos**: Diseñar el sistema para que, si un servidor o nodo cae, otro tome su lugar automáticamente sin interrumpir el servicio.
- **Estrategias de Caché**: Implementar capas de almacenamiento temporal (como Redis o Memcached) para reducir la carga en la base de datos y acelerar los tiempos de respuesta.
- **Balanceo de Carga (Load Balancing)**: Distribuir el tráfico de usuarios de manera uniforme entre múltiples servidores mediante herramientas como NGINX o servicios en la nube.

---

## 2. Experiencia de Usuario y Accesibilidad (UX / UI & Accessibility)

- **WCAG (Web Content Accessibility Guidelines)**: Normas internacionales de accesibilidad web para garantizar que personas con discapacidades visuales, motoras o cognitivas puedan navegar e interactuar sin problemas con la aplicación.
- **Diseño Responsivo y Rendimiento Front-End**: Optimización de recursos gráficos, compresión de imágenes, carga diferida (_lazy loading_) y métricas de rendimiento (_Core Web Vitals_).

---

## 3. Observabilidad, Monitoreo y Logging

- **El Pilar de las "Tres Métricas de Oro" (Logs, Metrics, Traces)**:
- _Logs_: El registro detallado de eventos y errores (donde herramientas como **Sentry** brillan).
- _Metrics_: Datos numéricos agregados (uso de CPU, memoria, peticiones por segundo).
- _Traces_: El seguimiento completo de una solicitud del usuario a través de todos los microservicios.
- **Alertas Proactivas**: Configurar sistemas (como Prometheus, Grafana o Datadog) para avisar al equipo de ingeniería antes de que un fallo colapse el sistema.

---

## 4. Gestión de Datos y Cumplimiento (Data Governance & Compliance)

- **Modelado y Normalización de Bases de Datos**: Diseñar esquemas eficientes que eviten la redundancia y optimicen las consultas (_queries_).
- **Estrategias de Respaldo y Recuperación (Backup & Disaster Recovery)**: Políticas automatizadas de copias de seguridad periódicas y pruebas de restauración ante desastres (_RPO/RTO_).
- **Normativas de Privacidad**: Cumplimiento legal en el manejo de información de usuarios, como **GDPR** (Europa) o **CCPA** (California), asegurando el derecho al olvido y el cifrado de datos sensibles en tránsito y reposo.

---

## 5. Mantenibilidad y Documentación (Engineering Quality)

- **Documentación Viva de APIs**: Uso de estándares como **OpenAPI / Swagger** para que cualquier desarrollador entienda cómo interactuar con el backend.
- **Pruebas Automatizadas Integrales**: Más allá de la seguridad, asegurar la calidad funcional mediante pruebas unitarias, de integración y _end-to-end_ (E2E) con frameworks como Playwright o Cypress.
