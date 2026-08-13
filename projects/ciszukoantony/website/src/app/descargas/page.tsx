import type { Metadata } from 'next';
import InstallPdwaInline from '@/components/layout/InstallPdwaInline';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | DESCARGAS',
  description: 'Descarga e instala Ciszuko Antony como app de escritorio (PDWA): qué es, pasos de instalación y botón de instalación.',
};

const whatIs = [
  {
    title: 'Sin pestañas ni barra de direcciones',
    desc: 'La web se abre como una ventana de app independiente, con tu logo y diseño propio.',
  },
  {
    title: 'Instalación en un clic',
    desc: 'Con Microsoft Edge o Chrome solo hace falta pulsar "Instalar" y confirmar el diálogo del navegador.',
  },
  {
    title: 'Acceso directo en el escritorio',
    desc: 'Queda en Inicio o en el Escritorio con el isotipo de Ciszuko Antony y funciona offline.',
  },
];

const steps = [
  {
    title: 'Microsoft Edge / Chrome / Opera',
    body: 'Pulsa el botón "Instalar PDWA" de abajo y confirma el diálogo del navegador (o usa el icono de instalación de la barra de direcciones). La app queda en Inicio/Escritorio.',
  },
  {
    title: 'Opera GX',
    body: 'Opera GX no muestra el instalador nativo: Menú (logo rojo) → "Guardar y compartir" → "Crear acceso directo" → con clic derecho en el acceso → Propiedades → añade al final de la ruta: --app="https://ciszukoantony.vercel.app". Se abre como ventana de app independiente.',
  },
  {
    title: 'Firefox',
    body: 'Firefox no instala apps. Instala la PDWA con Microsoft Edge (ya incluido en Windows) o Chrome: icono de la barra de direcciones.',
  },
  {
    title: 'Safari (Mac)',
    body: 'Menú Archivo → "Añadir al Dock". Se abre como ventana independiente con el logo, igual que una PDWA.',
  },
  {
    title: 'iPhone / iPad',
    body: 'Abre la web en Safari → botón Compartir → "Añadir a pantalla de inicio". Acceso directo con el logo en tu pantalla de inicio.',
  },
];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function DescargasPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Descargas
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Instala Ciszuko Antony como app de escritorio (PDWA)</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            ¿Qué es una PDWA?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            PDWA significa <strong className="text-white">App de Escritorio Progresiva</strong>. Es esta misma web,
            pero instalada en tu PC o móvil como si fuera una aplicación de escritorio: sin pestañas, sin barra de
            direcciones y con acceso desde Inicio/Escritorio con tu logo y barra de tareas. La versión web normal
            sigue disponible en{' '}
            <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="text-brand font-bold hover:text-brand-200 transition-colors">
              ciszukoantony.vercel.app
            </a>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {whatIs.map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <span className="mb-4 inline-flex w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-pink items-center justify-center text-white">
                  <DownloadIcon />
                </span>
                <h3 className="text-sm font-header font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="instalacion" className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Pasos de instalación
          </h2>
          <div className="space-y-4">
            {steps.map((s, i) => (
              <div key={s.title} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-8 h-8 rounded-full bg-neon-blue/20 border border-neon-blue/40 text-neon-blue flex items-center justify-center font-header font-black text-sm">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-header font-bold text-white mb-1">{s.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Instalar ahora
          </h2>
          <InstallPdwaInline />
          <p className="text-xs text-gray-600 text-center mt-4">
            También tienes el botón flotante de instalación abajo a la izquierda en todas las páginas.
          </p>
        </section>

        <section>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              ¿La PDWA, la web o esta página no funcionan como esperabas?
            </p>
            <a
              href="/feedback"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/40 text-neon-pink font-header font-bold text-sm hover:bg-neon-pink/20 hover:text-white transition-all active:scale-95"
            >
              Deja tu feedback
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}