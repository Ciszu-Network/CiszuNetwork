# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff: noqa: BLE001


class HelloWorld:
    """
    Invierte el clásico print("HelloWorld") permitiendo hacer HelloWorld("print").
    """

    def __init__(self, action: str = "print") -> None:
        from rich import print as rprint

        if action.lower() == "print":
            rprint("Hello World!")
        else:
            rprint(f"Acción desconocida para el meme: {action}")
