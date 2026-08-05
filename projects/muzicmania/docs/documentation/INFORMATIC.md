# 📖 Glosario Informático y Arquitectura Avanzada
**Autor:** Antigravity (Gemini 3 Pro)
**Apto para:** Ciszuko Antony (Ingeniería de Software / Desarrollo Backend y Frontend)

Este documento responde de forma exhaustiva a todos los conceptos informáticos solicitados, explicados desde una perspectiva profesional para entender "el porqué" de cada pieza en la industria del software.

---

## 🎨 1. Ecosistema de Frontend (Estilos y UI)

### CSS Preprocessors & Postprocessors
- **SASS / LESS / Stylus:** Son "preprocesadores". Permiten escribir CSS con superpoderes (variables, funciones, bucles, anidamiento). Luego un compilador lo traduce a CSS normal. SASS es el líder absoluto de la industria.
- **PostCSS:** Es un "postprocesador". Toma tu CSS normal o SASS y lo transforma usando plugins de JavaScript. Tailwind CSS *es* en realidad un plugin gigante de PostCSS. También sirve para añadir automáticamente prefijos para navegadores viejos (Autoprefixer).

### Frameworks de UI & Librerías
- **Bootstrap:** El abuelo de los frameworks CSS. Creado por Twitter. Te da botones, tarjetas y navbar ya hechos. *Desventaja:* Todas las páginas hechas con Bootstrap se ven iguales. Está en declive frente a Tailwind.
- **Material UI (MUI):** Librería de componentes de React basada en las guías de diseño de Google (Material Design). Muy pesada y estructurada, excelente para paneles de administración internos corporativos.
- **Svelte:** Es un framework de JavaScript (competencia de React). A diferencia de React que hace el trabajo pesado en el navegador, Svelte *compila* el código cuando haces el build, haciendo páginas ultra ligeras y rápidas.
- **Tailwind CSS:** Framework de CSS utilitario. No te da "botones", te da clases (`bg-blue-500`, `flex`, `p-4`) para que tú armes los diseños sin salir de tu HTML/JSX. Es el estándar actual (#1 en la industria).

---

## 🧠 2. Backend, Servidores y APIs

- **Express.js:** El framework web más popular para Node.js. Es muy minimalista y te permite hacer un servidor web y una API con pocas líneas de código.
- **Spring (Spring Boot):** Framework gigantesco y súper empresarial escrito en **Java**. Es extremadamente robusto, estricto y seguro. Usado por corporaciones, bancos y sistemas de facturación mundiales.
- **FastAPI:** Framework moderno escrito en **Python**. Destaca por ser absurdamente rápido (casi como NodeJS) e incorporar generación automática de documentación. Muy usado en IA y Machine Learning.
- **PHP:** Lenguaje de los 90s (creó Facebook y WordPress). Antes, el HTML se mezclaba directamente con PHP en el servidor (Renderización clásica). Sigue vivo, pero en startups modernas se prefiere TS/Node.js, Go o Rust.
- **REST API:** Arquitectura para comunicar servidores. Funciona enviando peticiones (GET, POST, PUT, DELETE) aURLs específicas (ej. `/api/users`) para obtener un JSON de respuesta.

---

## 🗄️ 3. Bases de Datos (SQL vs NoSQL)

### Diferencias Clave
- **SQL (Relacional):** Tablas conectadas matemáticamente (Usuarios, Posts, Comentarios). Si un post se borra, el motor sabe qué hacer con los comentarios.
- **NoSQL (Documental):** Guarda cosas como "Archivos" (JSON), sin estructura estricta. Bueno para cosas caóticas. (Ej. MongoDB).

### Motores SQL Competidores
- **Postgres (PostgreSQL):** El rey indiscutible open-source. Maneja Big Data, Arrays, JSON y funciones geográficas brillantemente. *Usado en Supabase*.
- **MySQL:** El más famoso en la web antigua (fiel compañero de PHP). Más sencillo pero menos potente matemáticamente que Postgres.
- **Microsoft Access:** No es un motor de base de datos para backend web. Es una herramienta de ofimática (Office) basada en archivos físicos `.mdb` locales. *Implicaciones en SQL Web:* Cero absolutas; nadie debería usar Access jamás como backend de una web en producción, explota si hay 5 personas a la vez.

### Archivos Adicionales
- **Redis:** Una base de datos que vive en la **Memoria RAM** (increíblemente rápida). Se usa como "Caché" (guardar cosas temporalmente para no preguntar a Postgres).
- **init_db:** Suele ser el nombre de scripts o comandos que "construyen" las tablas vacías la primera vez que prendes tu base de datos.

---

## 🔐 4. Seguridad y Autenticación

- **JWT (JSON Web Token):** Es como un "Boleto dorado de Willy Wonka". Cuando inicias sesión, el servidor no guarda quién eres en su memoria; en cambio, te da un token firmado crípticamente. Tú lo presentas en cada petición para demostrar que eres Ciszuko.
- **OIDC (OpenID Connect):** Es la capa oficial de autenticación sobre OAuth 2.0. Básicamente es el botón de "Inicia sesión con Google / Apple / Discord". Estandariza cómo verificar la identidad del usuario a través de un tercero sin tener las contraseñas reales.

---

## 📂 5. Arquitectura de Software "La Base Profesional"

Explicación explícita de las nuevas carpetas solicitadas:

- **Routes (`src/app/api` u otras):** Las "puertas" de entrada. Aquí escuchas las peticiones entrantes.
- **Controllers (`src/controllers`):** Los directores. Toman la información de la ruta y deciden qué llamar. No tocan la base de datos (delegan eso).
- **Services (`src/services`):** El músculo. Toda tu lógica de negocio (como restar vida a un jefe o sumar puntajes SQL) y las llamadas a *Supabase* suceden aquí.
- **Middlewares (`src/middlewares`):** "Los Guardias de Seguridad". Revisan (interceptan) cada petición antes de dejarla pasar al Route/Controller. Revisan si el JWT es válido y si eres admin.
- **Seed (`supabase/seed.sql`):** "La semilla". Archivo que introduce datos ficticios o primordiales a la base de datos recién creada (ej. crear al usuario 'Ciszuko', roles básicos y 5 canciones placeholder).
- **Uploads:** Carpetas temporales para guardar subidas de imágenes (*En Supabase no necesitas carpeta local de uploads porque usaremos Supabase Storage de la nube*).
- **.json (Archivos):** El "esperanto" de la web. `JavaScript Object Notation`. Es simplemente un archivo de texto estructurado en llave-valor usado para transmitir configuraciones (como `package.json`) o enviar datos en APIs.

---

## 🧪 6. Ingeniería Avanzada (Conceptos Claves)

### Polimorfismo (POO)
"Muchas formas". Se refiere a cuando en Programación Orientada a Objetos, diferentes objetos (Ej. `Pistola`, `Bomba`, `Espada`) todos responden a una misma orden general (como `atacar()`), pero cada quien lo ejecuta a su manera sin que el director lo sepa. Beneficia la escalabilidad, pues si añades una nueva arma, no rompes nada.

### Web Semántica vs No Semántica
- **No Semántico:** Envolver todo en `<div>` y `<span>`. El navegador y Google no saben qué significa el contenido, solo que son "bloques".
- **Semántico:** Usar `<header>`, `<main>`, `<article>`, `<nav>`, `<aside>`. El navegador, los robots de Google (SEO) y los lectores de pantalla para ciegos reconocen inmediatamente cómo está estructurado tu sitio de valor.

### QA, Herramientas & Entornos Aislados
- **ESLint & Prettier:** `Prettier` arregla "los espacios y las tabulaciones", `ESLint` arregla tu lógica y el código "escribiste mal esta variable, esto dañará el programa en el runtime".
- **Jest:** El rey del "Testing". Herramienta que lee y corre tu código de forma automática simulando el entorno para verificar si todo hace "Pass" (verde) o algo se rompió por accidente.
- **Docker:** El estándar de estandarización industrial. Es una caja aislada ("contenedor"). Tú instalas Node 20, Postgres, tu código y su .env en Docker. Cuando se lo das a otra persona, funciona **exactamente igual** importando el SO temporal que está encapsulado, librándonos del síndrome de *"pero en mi máquina sí funciona"*.

---

**Conclusión Industrial:** Tu nuevo plan (Next.js App Router, Tailwind, Supabase/PostgreSQL, Vercel) cumple al 100% con *la crema y nata* de las decisiones corporativas del 2026 para Startups ultra-escalables rápidas. Startups como Midjourney usan este stack en frontend.
