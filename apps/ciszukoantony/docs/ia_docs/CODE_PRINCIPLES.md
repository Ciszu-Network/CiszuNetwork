# 🧠 Principios de Programación — Estándares de Ingeniería (Ciszu Network)

Versión: 1.0.0
Actualización: 2026-08-01
Identificador: CODE_PRINCIPLES_V1.0.0_2026_08_01_ciszunetwork

> Documentación para agentes de IA. Define las reglas de oro de diseño y calidad de software aplicables a todo el código del monorepo. Criterio: profesional, serio, bajo marcos de ingeniería estables (Pragmatic Programmer, Robert C. Martin / SOLID).

---

## 1. DRY — Don't Repeat Yourself (No te repitas)

**Cada pieza de conocimiento, lógica o funcionalidad debe tener una representación única, inequívoca y autoritaria** dentro del sistema.

- Si escribes el mismo bloque de código (o muy similar) **dos o más veces**, estás rompiendo DRY.
- **Cómo se aplica en este monorepo**:
  - Lógica compartida de assets → `packages/cdn` (`assetResolver.resolve`, `resolveIcon`).
  - Componentes UI compartidos → `packages/ui` (`Icon.tsx` con registro generado).
  - Tipos/config compartidos → `packages/config`, `packages/utils`.
  - El sistema de iconos: el registro se genera una sola vez desde `shared/icons/svg/` (nunca duplicar SVGs en las apps).
- **Equilibrio**: no caer en sobreingeniería — si la lógica es distinta aunque parecida, no forzar la unificación. La regla es no repetirse cuando la lógica es **exactamente la misma**.

## 2. KISS — Keep It Simple (Mantenlo simple)

La mayoría de los sistemas funcionan mejor si se mantienen simples.

- Si puedes resolver un problema con una función sencilla, no inventes una arquitectura de diez capas.
- El código simple es más fácil de leer, probar y corregir.

## 3. YAGNI — You Aren't Gonna Need It (No lo vas a necesitar)

No escribas código ni añadas funcionalidades **hasta que realmente las necesites en el presente**.

- Prohibido "dejar funciones preparadas por si acaso": es código muerto que acumula deuda técnica.
- Si no hay un requerimiento actual, no se implementa.

## 4. SOLID

| Principio | Significado |
|---|---|
| **S**ingle Responsibility | Una clase/módulo debe tener una, y solo una, razón para cambiar (hacer una sola cosa y bien). |
| **O**pen/Closed | Abierto a extensión, cerrado a modificación: añadir funciones sin alterar código que ya funciona. |
| **L**iskov Substitution | Las clases hijas deben poder sustituir a las padres sin romper el programa. |
| **I**nterface Segregation | Muchas interfaces pequeñas y específicas, no una gigantesca que obligue a implementar lo que no se usa. |
| **D**ependency Inversion | Los módulos de alto nivel no dependen de los de bajo nivel; ambos dependen de abstracciones. |

**En la práctica (este monorepo)**: los servicios Supabase se separan por dominio (`auth.ts`, `stats.ts`...), los componentes UI tienen responsabilidad única, y las apps consumen los paquetes compartidos por sus interfaces (`packages/cdn`), no por su implementación.

## 5. Separation of Concerns (Separación de intereses)

Dividir el programa en secciones independientes; cada sección se ocupa de un aspecto:

- **Frontend** (Next.js) no ejecuta lógica de negocio pesada ni se conecta directamente a la DB — usa RPC de Supabase.
- **Backend** (Supabase/Postgres) gestiona datos y seguridad (RLS, functions SECURITY INVOKER).
- **Arquitectura de referencia**: MVC / capas (UI → servicios → datos).

## 6. Principle of Least Astonishment (Menor sorpresa)

Un componente debe comportarse como la mayoría de los desarrolladores esperan:

- `calcularImpuesto()` debe devolver un número; nunca borrar registros ni enviar correos.
- Nombres descriptivos: si una función se llama `getUser`, que devuelva el usuario.
- Nada de efectos secundarios ocultos.

## 7. Calidad y observabilidad

- **TypeScript estricto** en todos los proyectos (tipos = contrato).
- **Documentación viva**: este documento + `AGENT_INSTRUCTIONS.md` + `DEVSECOPS.md` son la fuente de verdad del estilo.
- **Código limpio > código ingenioso**: legibilidad para el próximo programador (humano o IA).
- **Cero regresiones**: todo cambio se verifica con lint + build (`pnpm lint`, `pnpm build`).

## 8. Checklist del agente antes de escribir código

1. ¿Existe ya esta funcionalidad en `packages/`? → **DRY**: reutilizar.
2. ¿Es más simple de lo que lo estoy haciendo? → **KISS**.
3. ¿Alguien pidió esto ahora? → **YAGNI**.
4. ¿El módulo hace UNA sola cosa? → **SRP**.
5. ¿El nombre refleja exactamente lo que hace? → **Least Astonishment**.
6. ¿Toca datos sensibles? → ver `AGENT_SECURITY_PROTOCOLS.md` y `DEVSECOPS.md`.
