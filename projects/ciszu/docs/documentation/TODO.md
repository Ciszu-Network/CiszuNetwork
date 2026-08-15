# To Do List — Ciszu Network

> Este archivo solo puede ser editado por Ciszuko Antony.

## Frontend General — estructura y diseño de páginas

**PDWA (Descargas) + Feedback botones flotantes.**

- Arreglar las advertencias al cerrar con X. Actualmente el unico que recive advertencia es uno de los 2. No los 2. Ademas la advertencia se sobre pone , queda mal. Y la informacion es incorrecta, debe indicar que puede reactivar el boton cierta pagina. Solamente eso. Ademas debe tener un contador para indicar que se quitara en 3 segundos. Visualmente.

**Footers de todas las websites**

- Centrar copyrights de footers y dejar espacio debajo. Ademas todo los copyright deben decir helaborado con amor por ciszukoantony, deben tener respaldo por ciszunetwork, y mencionar a la propia pagina, todo con copyright desde 2024 hasta el 2026. Icono oficial de copyrgiht, hipervinculos llamativos a color y funcionales a las paginas.

**Logo favicon error (ciszuko antony y ciszu network websites)**

- Actualmente sigue ocurriendo un error extraño, al cambiar de paginas dentro de una website, el favicon cambia a la version antigua de un archivo ya eliminado del logo de ciszukoantony. Esto ocurre en 2 paginas (ciszukoantony y ciszunetwork) debemos arreglar esto de manera que use ciszunetwork como isotipo con fondo transparente (no el actual que es cuadrada) y ciszukoantony debe usar el icono de perifl de youtube circular (archivo nuevo creado debemos subirlo a cdn) y (actualmente es uno cuadrado)
- Antes existian 3 archivos erroneos en content sin ningun tipo de razon o sentido, ya el CEO lo borro manualmente y recreo correctamente en las rutas reales. Uno de los archivos era el favicon.svg que replicaba el diseño malo antiguo incorrecto.
- Tambien ocurre algo similar al entra con el turnstile de cloudflare, el logo muestra unos segundos el logo de isotipo de ciszukoantony (no el de youtube) lo cual es ta muy mal, deberia ser igual al del favicon arreglado.

**Secciones de páginas fuera de los navbars**

- Aun existen ciertas paginas internas de websites que estan dentro de la seccion de informacion, como descargas o deefback, siempre debe estar afuera.

# Cambios por cada website para pulir errores de frontend (adema de las generales)

Ciszu Netowork Website:

- [ ] Reactualizar los iconos de ciszunetwork isotipo por la z blanca en vez de azul en toda la web. Incluso usando las versiones en degradado.
- [ ] Usar el tagline real (svg no html desde cdn) cada vez que se mencione o se debe usar por ejmplo en home y footer.
- [ ] El menu de hamburguesa debe estar antes del boton de auth, no despues.
- [ ] No hace el boton de togle theme y el boton de idioma en el navbar del header, quitalo.

Ciszuko Antony Website:

- [ ] Centrar el logo del footer con el menu de redes y ademas agregar el icono de perfil de yotube como en el header.

Ciszubot Website:

- [ ] Los iconos del header son muy diferentes a todos los demas paginas, le falta el menu hamburguesa, y mete alli dentro los botones de togle idioma y theme estilo muzicmania o cualquier otra website.
- [ ] Como ciszubot website usa un header y footer diferente a los de las demas websites, existen momento que con el togle theme en modo claro, al usar la rueda del mouse para subir y bajar en el body, la transparencia del header y su blur se bugean visualmente, dando un efecto raro en el centro, como solapamiento o glitch cortado.
- [ ] El tema de oscuridad debe ser el por defecto al inicio.
- [ ] El boton de invitar debe decir invitar
- [ ] Ciszubot es la unica web con un diseño un poco mas diferente en especial la gui y botones, deben ser mas parecidos al estilo de las demas 3 paginas o usar el mismo.
- [ ] El footer debe agregar el boton de togle theme y idioma parecido a las demas apps.
- [ ] El footer le falta muchas redes sociales (replicar desde ciszunetwork si no existen)
- [ ] Debemos cambiar como funciona los clores del tema, el modo oscuro debe ser mas omoled como muzicmania, y el modo claro es el que mas fallas, el color del fondo del footer y header son diferentes en modo claro, deben ser iguales. Ademas, principalmente no deberia ser oscuros. Cuando cambiamos a modo claro realmente no quiero fondos negros, usa fondo grises o claros y el texto debe ser negro.
