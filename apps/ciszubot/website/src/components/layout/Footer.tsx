import Link from 'next/link';
import Image from 'next/image';
import { resolveAssetPath } from '@ciszunetwork/cdn';

const IcoDiscord = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.101 18.079.112 18.1.13 18.114a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;
const IcoGithub = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const IcoYoutube = () => <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;

const SOCIALS = [
  { Ico: IcoDiscord, href: 'https://discord.gg/W3kMtMMj6E', label: 'Discord', hoverClass: 'hover:border-[#5865F2] hover:bg-gradient-to-tr hover:from-[#5865F2]/30 hover:to-transparent hover:text-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.4)]' },
  { Ico: IcoGithub, href: 'https://github.com/Ciszu-Network', label: 'GitHub', hoverClass: 'hover:border-white hover:bg-gradient-to-tr hover:from-white/30 hover:to-transparent hover:text-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]' },
  { Ico: IcoYoutube, href: 'https://www.youtube.com/@CiszuNetwork', label: 'YouTube', hoverClass: 'hover:border-[#FF0000] hover:bg-gradient-to-tr hover:from-[#FF0000]/30 hover:to-transparent hover:text-[#FF0000] hover:shadow-[0_0_15px_rgba(255,0,0,0.4)]' },
];

export default function Footer() {
  return (
    <footer className="relative bg-black border-t-2 border-white/10 pt-10 pb-6 px-4 md:px-8 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-[length:200%_auto] bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink shadow-[0_0_15px_rgba(0,212,255,0.4)] animate-gradient-x" />

      <div className="max-w-[90rem] mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8 bg-[#050505] border border-white/5 p-6 lg:p-8 rounded-[2rem]">
          <div className="flex flex-col items-center text-center md:w-2/5 border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-10">
            <Link href="/" className="flex flex-col items-center gap-4 cursor-pointer group hover:scale-105 active:scale-95 transition-all duration-300 mb-6">
              <Image
                src={resolveAssetPath('apps/ciszubot/content/logos/imagen/not outline/isotipo/color/ciszubot_logo_isotipo_color.png')}
                alt="Isotipo" width={72} height={72}
                className="drop-shadow-neon-blue group-hover:drop-shadow-[0_0_25px_rgba(0,212,255,0.9)] transition-all duration-300"
              />
              <span className="font-header font-black tracking-widest text-2xl text-white group-hover:drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] transition-all duration-300">
                CISZUBOT
              </span>
            </Link>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {SOCIALS.map(({ Ico, href, label, hoverClass }, i) => (
                <a
                  key={i} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 ${hoverClass}`}
                >
                  <Ico />
                </a>
              ))}
            </div>

            <a
              href="https://discord.gg/W3kMtMMj6E"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#5865F2]/10 border border-[#5865F2]/40 text-[#5865F2] hover:bg-[#5865F2] hover:text-white px-6 py-3 rounded-2xl transition-all shadow-lg active-depth"
            >
              <div className="w-5 h-5"><IcoDiscord /></div>
              <span className="font-header font-black uppercase tracking-wider text-sm">Servidor de Discord</span>
            </a>
          </div>

          <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left content-start">
            <div className="flex flex-col gap-2">
              <h3 className="text-neon-cyan font-header font-black uppercase tracking-widest text-xs mb-2 text-shadow-neon-cyan">Explorar</h3>
              <Link href="/" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Inicio</Link>
              <Link href="/#comandos" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Comandos</Link>
              <Link href="/#estado" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Estado del bot</Link>
              <Link href="/#ecosistema" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Ecosistema</Link>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-neon-pink font-header font-black uppercase tracking-widest text-xs mb-2 text-shadow-neon-pink">Proyectos</h3>
              <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Ciszu Network</a>
              <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">Ciszuko Antony</a>
              <a href="https://muzicmania.vercel.app" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">MuzicMania</a>
              <a href="https://github.com/Ciszu-Network/CiszuNetwork" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-neon-blue transition-colors font-header font-bold text-sm">GitHub</a>
            </div>

            <div className="flex flex-col gap-2 col-span-2 lg:col-span-1">
              <h3 className="text-neon-purple font-header font-black uppercase tracking-widest text-xs mb-2 text-shadow-neon-purple">El Bot</h3>
              <span className="text-white/70 font-header font-bold text-sm">Prefijo: <code className="text-neon-blue bg-white/5 px-1.5 py-0.5 rounded">cz!</code></span>
              <span className="text-white/70 font-header font-bold text-sm">Slash: <code className="text-neon-pink bg-white/5 px-1.5 py-0.5 rounded">/comandos</code></span>
              <span className="text-white/70 font-header font-bold text-sm">12 comandos · 4 categorías</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

        <div className="text-center space-y-1 pb-2">
          <p className="text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-loose">
            &copy; {new Date().getFullYear()}{' '}
            <a href="https://ciszunetwork.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-neon-cyan transition-colors font-black">CISZU NETWORK</a>{' '}
            &amp; CISZUBOT. ALL RIGHTS RESERVED.
            <br className="hidden sm:block" />
            CREADO POR{' '}
            <a href="https://ciszukoantony.vercel.app" target="_blank" rel="noopener noreferrer" className="text-neon-cyan font-black transition-colors hover:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]">CISZUKO ANTONY</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
