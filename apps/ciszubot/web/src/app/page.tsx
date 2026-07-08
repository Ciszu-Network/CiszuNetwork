const COMMANDS = [
  { name: "help", desc: "Muestra la lista de comandos" },
  { name: "ping", desc: "Latencia del bot" },
  { name: "pong", desc: "Latencia del bot (alternativo)" },
  { name: "say", desc: "Repite tu mensaje en un embed" },
  { name: "directsay", desc: "Repite tu mensaje directamente" },
  { name: "confess", desc: "Envía un mensaje anónimo" },
  { name: "8ball", desc: "Bola 8 mágica" },
  { name: "hi", desc: "Saludo aleatorio" },
  { name: "bye", desc: "Despedida aleatoria" },
  { name: "profile", desc: "Información de perfil" },
  { name: "serverinfo", desc: "Información del servidor" },
  { name: "test", desc: "Prueba de funcionamiento" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-slate-900 to-indigo-950">
      <header className="border-b border-white/10">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-lg font-bold">C</div>
            <span className="text-xl font-bold">CiszuBot</span>
          </div>
          <a
            href="https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot"
            target="_blank"
            className="rounded-lg bg-primary px-5 py-2 font-semibold transition hover:bg-primary/80"
          >
            Invitar Bot
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20 text-4xl">🤖</div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight">CiszuBot</h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Bot de Discord en español con comandos divertidos, utilitarios y de información.
            Moderno, rápido y fácil de usar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://discord.com/oauth2/authorize?client_id=1395532235872141312&permissions=8&scope=bot"
              target="_blank"
              className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold transition hover:bg-primary/80"
            >
              Añadir a Discord
            </a>
            <a
              href="https://github.com/Ciszu-Network/CiszuNetwork"
              target="_blank"
              className="rounded-lg border border-white/20 px-8 py-3 text-lg font-semibold transition hover:bg-white/10"
            >
              GitHub
            </a>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              { icon: "⚡", label: "Comandos", value: "12+" },
              { icon: "🏠", label: "Prefijo", value: "cz!" },
              { icon: "🔄", label: "Slash Commands", value: "Soporte /" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-card/50 p-6 backdrop-blur">
                <div className="mb-2 text-3xl">{s.icon}</div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <h2 className="mb-8 text-center text-3xl font-bold">Comandos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {COMMANDS.map((cmd) => (
              <div key={cmd.name} className="flex items-center gap-4 rounded-lg border border-white/10 bg-card/30 px-5 py-3">
                <code className="rounded bg-primary/20 px-2 py-1 text-sm text-cyan-300">cz!{cmd.name}</code>
                <span className="text-sm text-gray-300">{cmd.desc}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-gray-500">
        <p>CiszuBot &copy; {new Date().getFullYear()} Ciszu Network</p>
        <p className="mt-1">Desarrollado con Node.js, Discord.js y Express</p>
      </footer>
    </div>
  );
}
