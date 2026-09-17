# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff:noqa: BLE001

# Imports
import os
import sys

import keyboard as kb
from rich import print


def init_hotkeys() -> None:
    """
    Funcion que inicializa los hotkeys.
    """
    print("Usa CONTROL+Z para Cerrar la App")

    def ctrl_z_func():
        print("\nCerrado App...")
        os._exit(1)

    kb.add_hotkey(hotkey="ctrl+z", callback=ctrl_z_func)


if __name__ == "__main__":
    try:
        print("No se puede ejecutar este modulo por separado.")
    except Exception as exc:
        print(
            f"\n[ERROR CRÍTICO]: {os.strerror(exc.errno) if hasattr(exc, 'errno') else exc}"
        )
        sys.exit(1)
