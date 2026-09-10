import type { Metadata } from 'next';
import InstallPdwaInline from '@/components/layout/InstallPdwaInline';
import { FabRestore } from '@ciszu/ui';
import QuickDocks from '@/components/molecules/QuickDocks';

export const metadata: Metadata = {
  title: 'Ciszuko Antony | DOWNLOADS',
  description: 'Download and install Ciszuko Antony as a desktop app (PDWA): what it is and installation steps.',
};

const whatIs = [
  {
    title: 'No tabs or address bar',
    desc: 'The website opens as an independent app window, with your logo and custom design.',
  },
  {
    title: 'One-click installation',
    desc: 'With Microsoft Edge or Chrome, just press "Install" and confirm the browser dialog.',
  },
  {
    title: 'Desktop shortcut',
    desc: 'It appears in Start or on the Desktop with the Ciszuko Antony logo and works offline.',
  },
];

const steps = [
  {
    title: 'Microsoft Edge / Chrome',
    body: 'PDWA installation is native in Chrome/Chromium and Microsoft Edge. Press the "Install PDWA" button below and confirm the browser dialog. The app will be in Start/Desktop.',
  },
  {
    title: 'Opera',
    body: 'Opera does not install PDWA natively. Alternative method (non-PDWA): Menu (red logo) → "Save and Share" → "Create shortcut" → right-click the shortcut → Properties → add to the end of the path: --app="https://ciszukoantony.vercel.app". It opens as an independent app window, just like a PDWA.',
  },
  {
    title: 'Firefox',
    body: 'Firefox does not install apps. Install the PDWA with Microsoft Edge (already included in Windows) or Chrome: use the address bar icon.',
  },
  {
    title: 'Safari (Mac)',
    body: 'Menu File → "Add to Dock". It opens as an independent window with the logo, just like a PDWA.',
  },
  {
    title: 'iPhone / iPad',
    body: 'Open the website in Safari → Share button → "Add to Home Screen". Shortcut with the logo on your home screen.',
  },
];

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function DownloadsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 animate-fade-in-up">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-header font-black tracking-tighter bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent mb-4">
            Downloads
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest">Install Ciszuko Antony as a desktop app (PDWA)</p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            What is a PDWA?
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            PDWA means <strong className="text-white">Progressive Desktop Web App</strong>. It is this same website,
            but installed on your PC or mobile as a desktop application: no tabs, no address bar and
            access from Start/Desktop with your logo and taskbar. The normal web version
            is still available at{' '}
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

        <section id="installation" className="mb-12">
          <h2 className="text-2xl font-header font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Installation steps
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
            Install now
          </h2>
          <InstallPdwaInline />
          <p className="text-xs text-gray-600 text-center mt-4">
            You also have the floating install and feedback buttons at the bottom left on all pages.
          </p>
        </section>

        <section>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              Is the PDWA, the website or this page not working as expected?
            </p>
            <a
              href="/feedback"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neon-pink/10 border border-neon-pink/40 text-neon-pink font-header font-bold text-sm hover:bg-neon-pink/20 hover:text-white transition-all active:scale-95"
            >
              Leave feedback
            </a>
          </div>
        </section>

        <section className="mt-6">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-header font-bold text-sm mb-1">Did you close the floating button?</p>
              <p className="text-gray-500 text-xs">The install and feedback buttons at the bottom left can be shown again whenever you want.</p>
            </div>
            <FabRestore accent="#a78bfa" keys={['ciszu-pdwa-dismissed']} />
          </div>
        </section>
      </div>

      <QuickDocks />
    </div>
  );
}
