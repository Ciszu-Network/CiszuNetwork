# To Do List — Ciszu Network DataBase

> Este archivo solo puede ser editado por Ciszuko Antony.

- [ ] Verificar que las contraseñas de los usuarios esten 100% cifrados, no texto plano. En todas las DB.
- [ ] No subir claves a codigo, solo guardarlos en varaibles de entorno.
- [ ] Configurar CORS si no esta configurado. Solo CiszuNetwork puede hacer peticiones al backend de las apps.
- [ ] Validar datos no solo en frontend, si no tambien en backend.
- [ ] Siempre sanitizar los inputs antes de guardarlos.
- [ ] Añadir ratelimits para no abusar de endpoints.
- [ ] Añadir RLS para cada usuario solo acceda a su propios datos.
- [ ] Añadir CSP (Content Srecuriy Policy) para bloquear scripts no autorizados

Opcional:

- [ ] **Logs de auditoría:** Mantén un registro (aunque sea básico) de quién hace login o cambios críticos.
- [ ] **Dependabot (GitHub):** Ya tienes alertas, pero asegúrate de que _mergee_ automáticamente las actualizaciones de seguridad.
- [ ] **Secretos de Supabase:** No solo uses variables de entorno, rota tus claves de API cada cierto tiempo.
- [ ] **Headers de seguridad:** Además de CSP, añade estos tres en tu `next.config.js` o configuración de Vercel:
    - [ ] `X-Content-Type-Options: nosniff`
    - [ ] `X-Frame-Options: DENY` (evita que incrusten tu web en otros sitios).
    - [ ] `Strict-Transport-Security` (obliga HTTPS).
