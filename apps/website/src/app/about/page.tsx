import Link from "next/link";
import Image from "next/image";
import { CISZU_NETWORK, CISZUKO_ANTONY } from "@/config/site";
import { Shield, ArrowRight, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Sobre Nosotros
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            {CISZU_NETWORK.tagline}
          </p>
        </div>

        <div className="space-y-12">
          <div className="p-8 md:p-10 rounded-[2rem] bg-gradient-to-br from-brand/10 via-brand-dark/5 to-transparent border border-brand/20">
            <Image
              src="/logos/imagen/outline/isotipo/color/ciszuko_logo_isotipo_outline_zcolor_cwhite.svg"
              alt={CISZU_NETWORK.name}
              width={60}
              height={60}
              className="mb-6 drop-shadow-brand"
            />
            <h2 className="text-2xl md:text-3xl font-header font-bold text-white mb-4">
              {CISZU_NETWORK.name}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Somos una compañía de innovación digital fundada por {CISZUKO_ANTONY.name}. 
              Desarrollamos soluciones tecnológicas de alto rendimiento: desarrollo web con Next.js y React, 
              infraestructura cloud, experiencias de usuario, bots, servidores de juego y más.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Nuestra filosofía se centra en combinar tecnología de punta con una estética inconfundible. 
              Cada proyecto refleja nuestro compromiso con la calidad, el rendimiento y la experiencia de usuario.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Con sede en Coro, Falcón, Venezuela, operamos 24/7 para ofrecer soluciones globales 
              con un toque latinoamericano.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h3 className="text-lg font-header font-bold text-white mb-3">Misión</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Democratizar la tecnología de alto rendimiento, ofreciendo soluciones digitales 
                accesibles, escalables y con diseño de primer nivel.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
              <h3 className="text-lg font-header font-bold text-white mb-3">Visión</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Ser referente en innovación digital desde Latinoamérica, creando un ecosistema 
                de proyectos que inspiren y transformen.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm mb-6">¿Quieres saber más?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-brand/20 border border-brand/40 text-brand-light rounded-xl font-bold text-sm hover:bg-brand hover:text-white transition-all">
                Contáctanos <ArrowRight className="w-4 h-4" />
              </Link>
              <a href={CISZU_NETWORK.social.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/10 transition-all">
                <ExternalLink className="w-4 h-4" /> GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
