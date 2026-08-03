# Contribuir a Ciszu Network

¡Gracias por tu interés en contribuir a **Ciszu Network**! Este documento establece las pautas y directrices para colaborar de forma ordenada y eficiente en el ecosistema.

---

## 1. Código de Conducta

Al participar en este proyecto, te comprometes a mantener un ambiente respetuoso, colaborativo y constructivo con todos los miembros de la comunidad y equipo de desarrollo.

---

## 2. ¿Cómo puedes contribuir?

Puedes ayudar de diversas maneras:

* Reportando errores (*bugs*) abriendo un *Issue*.
* Proponiendo nuevas funcionalidades o mejoras en la arquitectura.
* Resolviendo *issues* abiertos o enviando *Pull Requests* (PR).
* Mejorando la documentación del proyecto.

---

## 3. Flujo de Trabajo (Git Workflow)

Para mantener la estabilidad en los despliegues y builds de producción, sigue estos pasos para enviar tus cambios:

1. **Haz un Fork** del repositorio principal.
2. **Crea una rama** para tu funcionalidad o corrección de error:
```bash
git checkout -b feature/nombre-de-la-caracteristica
# o para correcciones:
git fix/nombre-del-error

```


3. **Realiza tus cambios** asegurándote de seguir los estándares de código del proyecto.
4. **Haz commit** de tus cambios utilizando mensajes claros y descriptivos:
```bash
git commit -m "feat: añade descripción clara de la nueva funcionalidad"

```


5. **Sube los cambios** a tu repositorio remoto:
```bash
git push origin feature/nombre-de-la-caracteristica

```


6. **Abre un Pull Request (PR)** hacia la rama principal del repositorio de Ciszu Network describiendo detalladamente los cambios realizados y el problema que resuelven.

---

## 4. Estándares y Directrices de Código

* **Tecnologías:** Respeta la estructura del stack tecnológico utilizado en los módulos del ecosistema (HTML, CSS, JavaScript, TypeScript, Tailwind CSS, Python, etc.).
* **Limpieza:** Evita dejar código comentado innecesario, archivos basura o credenciales expuestas.
* **Builds y CDN:** Asegúrate de verificar localmente que tus cambios no rompan las rutas de los recursos estáticos ni las conexiones con el CDN en las *builds* de producción.

---

¡Gracias por formar parte de **Ciszu Network**!
