# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff:noqa: BLE001


def HelloWorld(action: str = "print") -> None:
    """
    Invierte el clásico print("HelloWorld") permitiendo hacer HelloWorld("print").
    """
    if action.lower() == "print":
        print("Hello World!")
    else:
        print(f"Acción desconocida para el meme: {action}")
