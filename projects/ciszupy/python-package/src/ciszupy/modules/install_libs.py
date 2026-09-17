# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff: noqa: BLE001

# Imports
import importlib
import os
import subprocess
import sys

from rich import print as rprint


def installlibs(*librerias: str) -> None:
    """
    Verifica e instala dinámicamente las librerías que falten.
    """
    for lib in librerias:
        nombre_paquete = lib.split(".")[0]

        try:
            importlib.import_module(nombre_paquete)
            rprint(f"[OK] La librería '{lib}' ya está instalada.")
        except ImportError:
            rprint(f"[AVISO] La librería '{lib}' no está instalada. Instalando...")
            try:
                subprocess.check_call(
                    [sys.executable, "-m", "pip", "install", nombre_paquete]
                )
                rprint(f"[ÉXITO] '{nombre_paquete}' se instaló correctamente.")
            except Exception as e:
                raise ImportError(
                    f"[ERROR CRÍTICO] No se pudo instalar '{nombre_paquete}'. Motivo: {e}"
                )


if __name__ == "__main__":
    try:
        rprint("No se puede ejecutar este modulo por separado.")
    except Exception as exc:
        rprint(
            f"\n[ERROR CRÍTICO]: {os.strerror(exc.errno) if hasattr(exc, 'errno') else exc}"
        )
        sys.exit(1)
