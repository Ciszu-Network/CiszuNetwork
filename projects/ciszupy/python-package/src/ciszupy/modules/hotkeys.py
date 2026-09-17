# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff: noqa: BLE001

# Imports
import os
import sys

import keyboard as kb
from rich import print as rprint


def init_hotkeys() -> None:
    """
    Funcion que inicializa los hotkeys.
    """
    rprint("Usa CONTROL+Z para Cerrar la App")

    def ctrl_z_func():
        rprint("\nCerrando App...")
        sys.exit(0)

    kb.add_hotkey(hotkey="ctrl+z", callback=ctrl_z_func)


if __name__ == "__main__":
    try:
        rprint("No se puede ejecutar este modulo por separado.")
    except Exception as exc:
        rprint(
            f"\n[ERROR CRÍTICO]: {os.strerror(exc.errno) if hasattr(exc, 'errno') else exc}"
        )
        sys.exit(1)
