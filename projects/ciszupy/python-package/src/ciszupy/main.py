# ruff: noqa: RUF100
# ruff: noqa: I001
# ruff: noqa: BLE001

# Imports
import sys
import threading as thr
import time

import keyboard as kb
import typer
from rich import print as rprint

try:
    from .modules.helloworldprintmeme import HelloWorld
    from .modules import clear_cls_command, hotkeys, install_libs
except ImportError:
    from ciszupy.modules.helloworldprintmeme import HelloWorld
    from ciszupy.modules import clear_cls_command, hotkeys, install_libs


def ensure_dependencies() -> None:
    """
    Verifica que las dependencias estén instaladas antes de ejecutar la CLI.
    """
    install_libs.installlibs("rich", "keyboard", "typer")


def run_app() -> None:
    """
    Lógica central de la aplicación que ejecuta los hilos y espera la salida.
    """
    thr_hotkeys = thr.Thread(target=hotkeys.init_hotkeys, daemon=True)
    thr_hotkeys.start()
    time.sleep(0.1)

    rprint("Presiona [ESC] para terminar.")
    kb.wait("esc")


# Inicializamos la aplicación Typer
app = typer.Typer(
    help="Ciszupy CLI - Herramienta multipropósito con un toque personal.",
    add_completion=False,
)


@app.callback(invoke_without_command=True)
def main(ctx: typer.Context):
    """
    Si ejecutas 'ciszupy' sin argumentos, muestra los créditos y la ayuda por defecto.
    """
    if ctx.invoked_subcommand is None:
        rprint("[bold cyan]=========================================[/bold cyan]")
        rprint("[bold green]  Ciszupy CLI - Versión 0.1.0[/bold green]")
        rprint("[bold cyan]=========================================[/bold cyan]")
        rprint("[yellow]Autor:[/yellow] CiszukoAntony (Francisco Garcia)")
        rprint(
            "\n[italic]Uso general:[/italic] Escribe [bold]ciszupy --help[/bold] para ver los comandos disponibles."
        )
        rprint(
            "O prueba comandos especiales como: [bold]ciszupy profesor[/bold], [bold]ciszupy papa[/bold], [bold]ciszupy mama[/bold]\n"
        )
        run_app()


@app.command()
def profesor():
    """Mensaje dedicado al profesor."""
    rprint("[bold magenta]🎓 Mensaje Especial:[/bold magenta]")
    rprint(
        "[cyan]Un saludo y agradecimiento especial al profesor por la guía, paciencia y el conocimiento impartido en este camino académico.[/cyan]"
    )
    run_app()


@app.command()
def papa():
    """Mensaje dedicado a papá."""
    rprint("[bold blue]💙 Mensaje Especial:[/bold blue]")
    rprint(
        "[cyan]Para papá: Gracias por el apoyo incondicional, los consejos de vida y ser un pilar fundamental en cada paso que doy.[/cyan]"
    )
    run_app()


@app.command()
def mama():
    """Mensaje dedicado a mamá."""
    rprint("[bold pink1]💖 Mensaje Especial:[/bold pink1]")
    rprint(
        "[cyan]Para mamá: Gracias por tu amor infinito, tu cuidado diario y por impulsarme siempre a dar lo mejor de mí.[/cyan]"
    )
    run_app()


@app.command()
def helloworldmemetest():
    """Funcion de prueba para hello world print meme."""
    HelloWorld("print")
    HelloWorld("notprint")
    run_app()


if __name__ == "__main__":
    try:
        ensure_dependencies()
        app()
    except KeyboardInterrupt:
        rprint("\n[bold red]Interrumpido por el usuario.[/bold red]")
        sys.exit(0)
    except Exception as exc:
        rprint(f"\n[ERROR CRÍTICO]: {exc}")
        sys.exit(1)
