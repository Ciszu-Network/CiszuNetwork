import Link from "next/link";
import Image from "next/image";
import { CISZU_NETWORK } from "@/config/site";
import { Pickaxe, ArrowRight, ExternalLink, Server, Package, Wrench } from "lucide-react";

const features = [
  { icon: Package, title: "Texture Packs", desc: "Packs de texturas personalizados con la identidad visual Ciszu. Estilo único para tu experiencia Minecraft." },
  { icon: Wrench, title: "Mods", desc: "Modificaciones a medida para mejorar y expandir tu servidor. Funcionalidades únicas." },
  { icon: Server, title: "Servidores", desc: "Administración y configuración de servidores Minecraft optimizados para rendimiento y comunidad." },
];

export default function MinecraftPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#44B272] to-[#1ABC9C] flex items-center justify-center mx-auto mb-6">
            <Pickaxe className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-[#44B272] via-[#2ECC71] to-[#1ABC9C] bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Minecraft
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Texture Packs • Mods • Servers
          </p>
        </div>

        <div className="space-y-8">
          <div className="p-8 rounded-[2rem] bg-brand/5 border border-brand/20">
            <h2 className="text-2xl font-header font-bold text-white mb-4">¿Qué ofrecemos?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              En {CISZU_NETWORK.name} desarrollamos contenido personalizado para Minecraft. 
              Desde texture packs con identidad única hasta mods y servidores completos, 
              llevamos tu experiencia Minecraft al siguiente nivel.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <f.icon className="w-8 h-8 text-[#44B272] mb-4" />
                  <h3 className="text-white font-bold font-header text-sm mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center p-8 rounded-[2rem] bg-gradient-to-br from-[#44B272]/10 to-transparent border border-[#44B272]/30">
            <h2 className="text-xl font-header font-bold text-white mb-4">¿Interesado?</h2>
            <p className="text-gray-400 text-sm mb-6">Contáctanos para discutir tu proyecto Minecraft.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#44B272]/20 border border-[#44B272]/40 text-[#44B272] rounded-xl font-bold text-sm hover:bg-[#44B272] hover:text-white transition-all">
              Contáctanos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
