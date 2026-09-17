# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff:noqa: BLE001

# Imports
import os
import sys

from rich import print


def clear_cls() -> None:
    """
    Borra la consola.
    """
    clear_command = "cls" if os.name == "nt" else "clear"
    os.system(clear_command)


if __name__ == "__main__":
    try:
        print("No se puede ejecutar este modulo por separado.")
    except Exception as exc:
        print(
            f"\n[ERROR CRÍTICO]: {os.strerror(exc.errno) if hasattr(exc, 'errno') else exc}"
        )
        sys.exit(1)
