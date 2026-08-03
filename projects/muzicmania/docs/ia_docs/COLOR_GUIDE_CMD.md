# 🎨 Guía de Colores para dev-debug-console.bat

## Método Actual: Códigos ANSI

El script ahora usa **códigos ANSI/VT100** en lugar del comando `color`, lo que permite mezclar colores en la misma pantalla sin limpiarla.

## Códigos de Color Definidos

En el script, las variables están definidas así:

```batch
set "PURPLE=[95m"
set "WHITE=[97m"
set "RESET=[0m"
```

**IMPORTANTE:** El carácter `` representa el código de escape ANSI (ESC). En el archivo .bat, esto se escribe literalmente como el carácter de escape.

## Cómo Usar los Colores

### Sintaxis Básica

```batch
echo %PURPLE%Texto en morado%RESET%
echo %WHITE%Texto en blanco%RESET%
```

**Ejemplo del script:**
```batch
echo %PURPLE%   ███╗   ███╗██╗   ██╗███████╗%RESET%
```

### El Comando RESET

`%RESET%` es **CRÍTICO** al final de cada línea coloreada. Si no lo usas, el color se "pegará" a todas las siguientes líneas.

```batch
:: ❌ MAL - El morado se quedará para siempre
echo %PURPLE%Texto morado
echo Esto también será morado (no queremos esto)

:: ✅ BIEN - El color se resetea
echo %PURPLE%Texto morado%RESET%
echo Esto será del color normal (blanco)
```

## Cómo Agregar Más Colores Manualmente

### Paso 1: Definir el Color

Agrega nuevas variables después de la línea 21 del script:

```batch
:: Códigos ANSI comunes
set "RED=[91m"        :: Rojo brillante
set "GREEN=[92m"      :: Verde brillante
set "YELLOW=[93m"     :: Amarillo brillante
set "BLUE=[94m"       :: Azul brillante
set "PURPLE=[95m"     :: Morado/Magenta brillante
set "CYAN=[96m"       :: Cyan brillante
set "WHITE=[97m"      :: Blanco brillante
set "RESET=[0m"       :: Reset (volver a color por defecto)
```

### Paso 2: Usar el Nuevo Color

```batch
echo %RED%[ERROR] Algo salió mal%RESET%
echo %GREEN%[OK] Todo correcto%RESET%
echo %YELLOW%[WARN] Advertencia%RESET%
echo %CYAN%[INFO] Información%RESET%
```

## Tabla de Códigos ANSI Completa

| Color | Código Normal | Código Brillante | Variable Sugerida |
|-------|---------------|------------------|-------------------|
| Negro | `[30m` | `[90m` | `set "BLACK=[90m"` |
| Rojo | `[31m` | `[91m` | `set "RED=[91m"` |
| Verde | `[32m` | `[92m` | `set "GREEN=[92m"` |
| Amarillo | `[33m` | `[93m` | `set "YELLOW=[93m"` |
| Azul | `[34m` | `[94m` | `set "BLUE=[94m"` |
| Magenta | `[35m` | `[95m` | `set "PURPLE=[95m"` |
| Cyan | `[36m` | `[96m` | `set "CYAN=[96m"` |
| Blanco | `[37m` | `[97m` | `set "WHITE=[97m"` |

## Ejemplo Práctico: Agregar Color Verde para Éxito

### 1. Definir la variable (línea ~21):
```batch
set "GREEN=[92m"
```

### 2. Usar en el código (ejemplo línea ~180):
```batch
if %errorlevel%==0 (
    echo   %GREEN%[OK] Todos los procesos Node.js han sido detenidos.%RESET%
) else (
    echo   %YELLOW%[WARN] No se encontraron procesos activos.%RESET%
)
```

## Ejemplo Completo: Mejorar Mensajes con Colores

Reemplaza esta sección (líneas ~97-105):

```batch
:: ANTES (sin colores específicos)
if errorlevel 1 (
    echo.
    echo   [INFO] Servidor detenido o interrumpido.
) else (
    echo.
    echo   [INFO] Servidor finalizado correctamente.
)
```

```batch
:: DESPUÉS (con colores específicos)
if errorlevel 1 (
    echo.
    echo   %YELLOW%[WARN] Servidor detenido o interrumpido.%RESET%
) else (
    echo.
    echo   %GREEN%[OK] Servidor finalizado correctamente.%RESET%
)
```

## Notas Importantes

1. **El carácter de escape**: En archivos .bat, necesitas el carácter ESC literal (ASCII 27). Algunos editores lo muestran como `` o `←`.

2. **EnableDelayedExpansion**: La línea `setlocal EnableDelayedExpansion` es necesaria para que las variables funcionen correctamente.

3. **Compatibilidad**: Los códigos ANSI funcionan en Windows 10+ con el registro habilitado (línea 4 del script hace esto automáticamente).

4. **Comillas en las definiciones**: Usa comillas dobles alrededor de la definición completa:
   - ✅ `set "PURPLE=[95m"`
   - ❌ `set PURPLE=[95m` (puede causar problemas)

## Solución de Problemas

### Problema: Los colores no aparecen, veo texto como `[95m`

**Causa**: El soporte ANSI no está habilitado.

**Solución**: Asegúrate de que estas líneas estén al inicio:
```batch
reg add HKCU\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f >nul 2>&1
```

### Problema: Todo el texto queda en un color después de usarlo

**Causa**: Falta el `%RESET%` al final.

**Solución**: Siempre termina con `%RESET%`:
```batch
echo %PURPLE%Texto morado%RESET%
```

## Método Antiguo: Comando COLOR (No Recomendado)

El método antiguo usaba:
```batch
color 05  :: Color morado
color 0F  :: Color blanco
```

**Problemas:**
- Limpia toda la pantalla al cambiar
- Solo puede haber un color a la vez
- No se puede mezclar texto de diferentes colores

**Por eso cambiamos a códigos ANSI.** ✅
