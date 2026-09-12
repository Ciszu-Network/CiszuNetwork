'use client';

import { useState } from 'react';
import { Modal } from '@ciszu/ui';
import { BookOpen, GraduationCap, Sparkles, Target, Layers, Zap, Brain, Rocket, ChevronRight, ExternalLink } from 'lucide-react';

const AC3_FULL =
  'AC3 (Aprendizaje Completo Cruzado Continuo) / C3L (Comprehensive Continuous Cross-Learning) es un modelo de aprendizaje desarrollado por Ciszuko Antony que redefine la educación en la era de la IA. A diferencia de los métodos tradicionales, AC3 integra tres frentes simultáneos: supervisión de IA como consejera auxiliar, práctica individual constante y fuente teórica multimedia. El estudiante se convierte en arquitecto de su proyecto mientras aprende haciendo, sin perder tiempo en recrear bases que la IA ya resolvió.';

const AC3_PILLARS = [
  {
    icon: Brain,
    title: 'Supervisión de IA',
    desc: 'La IA construye el proyecto ideal en segundo plano. Tú diriges, revisas y aprendes del código complejo por ósmosis.',
    color: '#a855f7',
  },
  {
    icon: Target,
    title: 'Práctica constante',
    desc: 'Cuaderno, IDE o programa de testeo: practicas fragmentos específicos mientras la IA avanza en el proyecto principal.',
    color: '#22d3ee',
  },
  {
    icon: Layers,
    title: 'Teoría multimedia',
    desc: 'Cursos, videos, libros, podcasts o cualquier fuente externa. La teoría se consume en paralelo y se aplica en el proyecto.',
    color: '#f472b6',
  },
];

const AC3_STEPS = [
  {
    title: '1. Define el proyecto',
    desc: 'Elige un proyecto real (ej: juego en Godot, app web, bot de Discord). La IA lo construye mientras tú supervisas.',
    icon: Rocket,
  },
  {
    title: '2. Aprende teoría en paralelo',
    desc: 'Consume contenido multimedia relacionado con el proyecto: cursos, tutorials, libros, audio.',
    icon: BookOpen,
  },
  {
    title: '3. Practica fragmentos',
    desc: 'En tu IDE o cuaderno, practica lo que vas aprendiendo. Aplica los conceptos teóricos en ejercicios pequeños.',
    icon: Zap,
  },
  {
    title: '4. Supervisa y ajusta',
    desc: 'Revisa el código que la IA genera. Corrige errores visuales, estructura y escalabilidad. Entiende por qué funciona.',
    icon: GraduationCap,
  },
];

const AC3_BENEFITS = [
  'Aprendes a ser el jefe del proyecto, no solo un escriba de código.',
  'Adquieres visión global: arquitectura, UX, finanzas, marketing y más.',
  'Optimizas tiempo: no recreas lo que la IA ya resolvió.',
  'Desarrollas pensamiento crítico: la IA es herramienta, tú eres el criterio.',
  'Transición rápida de "consumidor de tutorials" a "creador de productos reales".',
];

const AC3_CHALLENGES = [
  'Multitasking cognitivo: gestionar tres frentes simultáneos requiere disciplina.',
  'Riesgo de "caja negra": si solo revisas errores visuales, puedes no entender la arquitectura profunda.',
  'Constancia: el método requiere hábitos y métricas de seguimiento claras.',
];

const AC3_DOGFOODING = {
  title: 'Caso de éxito: Dogfooding AC3',
  desc: 'Construye un proyecto real dentro de CiszuNetwork usando AC3. Por ejemplo: un juego en Godot, una app web con Next.js, o un bot de Discord. Documenta el proceso en un diario de abordo o serie de artículos: "Cómo construí X en 30 días usando AC3". Ver para creer.',
  href: 'https://ciszukoantony.vercel.app',
  label: 'Ver caso de estudio',
};

const AC3_KIT = {
  title: 'Kit de Inicio Gratuito',
  desc: 'Guía Rápida de Inicio de AC3 (PDF o Notion) descargable de forma gratuita. Incluye: Prompt Maestro para configurar la IA como tutor auxiliar, plantilla de planificación de tareas (Teoría + Práctica + Supervisión), y checklist de constancia.',
  href: 'mailto:ciszunetwork@gmail.com',
  label: 'Descargar kit gratuito',
};

const AC3_MANIFESTO = {
  title: 'Manifiesto AC3',
  desc: 'Documento oficial que define el framework AC3. Publicado en CiszuNetwork. Se recomienda registro en oficinas de propiedad intelectual o sellos de tiempo digitales (Proof of Existence, Copyrighted.com) bajo el nombre CiszukoAntony. Disponible bajo licencia Creative Commons Atribución-NoComercial-CompartirIgual (CC BY-NC-SA).',
  href: 'https://ciszunetwork.vercel.app',
  label: 'Leer manifiesto',
};

export interface Ac3SectionProps {
  title?: string;
  subtitle?: string;
}

export function Ac3Section({ title = 'Educación', subtitle = 'Metodología AC3 — Aprendizaje Completo Cruzado Continuo' }: Ac3SectionProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="relative py-16 border-t border-white/5">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-brand-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-screen-xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-brand-light mb-6 shadow-[0_0_30px_rgba(35,63,146,0.4)]">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-header font-black bg-gradient-to-r from-white via-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            {title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-brand-light text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Patentado por Ciszuko Antony
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" /> AC3 / C3L
            </span>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {AC3_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isHovered = hoveredCard === pillar.title;
            return (
              <div
                key={pillar.title}
                onMouseEnter={() => setHoveredCard(pillar.title)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 ${
                  isHovered ? 'border-brand-light/40 shadow-[0_0_30px_rgba(35,63,146,0.25)]' : 'border-white/10'
                }`}
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${pillar.color}22`, color: pillar.color }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-white font-header font-bold text-lg mb-2">{pillar.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Steps */}
        <div className="mb-12">
          <h3 className="text-2xl font-header font-bold text-white text-center mb-8">
            ¿Cómo funciona AC3?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {AC3_STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-light/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-brand-light/60 uppercase tracking-widest">
                      Paso {idx + 1}
                    </span>
                  </div>
                  <h4 className="text-white font-header font-bold text-sm mb-1">{step.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits & Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="p-6 rounded-2xl bg-brand/5 border border-brand/20">
            <h3 className="text-xl font-header font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-light" /> Beneficios
            </h3>
            <ul className="space-y-2">
              {AC3_BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-gray-300">
                  <ChevronRight className="w-4 h-4 text-brand-light shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h3 className="text-xl font-header font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-accent" /> Retos
            </h3>
            <ul className="space-y-2">
              {AC3_CHALLENGES.map((c) => (
                <li key={c} className="flex items-start gap-2 text-sm text-gray-300">
                  <ChevronRight className="w-4 h-4 text-brand-accent shrink-0 mt-0.5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Dock */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand to-brand-light text-white font-header font-black uppercase tracking-widest text-sm rounded-xl shadow-lg shadow-brand/30 hover:shadow-2xl hover:shadow-brand/40 hover:scale-105 active:scale-95 transition-all"
          >
            <BookOpen className="w-4 h-4" /> Leer más sobre AC3
          </button>
          <a
            href="https://ciszukoantony.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-white/20 text-white font-header font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
          >
            Ver portfolio <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Dogfooding + Kit + Manifiesto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <a
            href={AC3_DOGFOODING.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-light/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="w-5 h-5" />
              </div>
              <h4 className="text-white font-header font-bold text-sm">{AC3_DOGFOODING.title}</h4>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{AC3_DOGFOODING.desc}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-light">
              {AC3_DOGFOODING.label} <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href={AC3_KIT.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-light/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-white font-header font-bold text-sm">{AC3_KIT.title}</h4>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{AC3_KIT.desc}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-light">
              {AC3_KIT.label} <ExternalLink className="w-3 h-3" />
            </span>
          </a>

          <a
            href={AC3_MANIFESTO.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-light/40 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand-light flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-white font-header font-bold text-sm">{AC3_MANIFESTO.title}</h4>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">{AC3_MANIFESTO.desc}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-brand-light">
              {AC3_MANIFESTO.label} <ExternalLink className="w-3 h-3" />
            </span>
          </a>
        </div>

        {/* Modal */}
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="AC3 — Aprendizaje Completo Cruzado Continuo"
          description="Metodología patentada por Ciszuko Antony · C3L (Comprehensive Continuous Cross-Learning)"
          className="max-w-2xl"
        >
          <div className="space-y-4 text-sm text-gray-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
            <p>{AC3_FULL}</p>

            <div className="p-4 rounded-xl bg-brand/5 border border-brand/20">
              <h4 className="text-white font-header font-bold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-light" /> Fortalezas principales
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li>• Rol de "Arquitecto / Director de Proyecto": el principiante supervisa lo que la IA construye, hackeando la curva de aprendizaje tradicional.</li>
                <li>• Aprendizaje transversal: prepara para entornos profesionales al lidiar con arquitectura, UX y gestión desde el inicio.</li>
                <li>• Optimización del tiempo: evita la frustración del síndrome de la hoja en blanco.</li>
                <li>• Independencia cognitiva: la IA es tutor auxiliar, no sustituto.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-header font-bold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-brand-accent" /> Retos a vigilar
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li>• Curva de entrada: el multitasking cognitivo puede saturar si no hay andamiaje.</li>
                <li>• Efecto caja negra: riesgo de no entender arquitectura profunda si solo se revisan errores visuales.</li>
                <li>• Gestión de la atención: requiere método y métricas de constancia.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-brand/5 border border-brand/20">
              <h4 className="text-white font-header font-bold mb-2">Veredicto</h4>
              <p className="text-xs text-gray-300">
                AC3 es un enfoque moderno y pragmático. Rompe con la pedagogía tradicional y abraza la realidad del desarrollo asistido por IA. 
                Con andamiaje y métricas de constancia, tiene potencial para convertirse en metodología de aceleración para creadores independientes y juniors.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-header font-bold mb-2">Dogfooding — Caso de éxito</h4>
              <p className="text-xs text-gray-300">
                Aplica AC3 tú mismo para construir un proyecto real, visible y funcional dentro de CiszuNetwork 
                (por ejemplo, un juego o una app en vivo). Documenta el proceso en formato de diario de abordo 
                o serie de artículos: "Cómo construí X app en 30 días usando AC3". Ver para creer.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-brand/5 border border-brand/20">
              <h4 className="text-white font-header font-bold mb-2">Kit de Inicio Gratuito</h4>
              <p className="text-xs text-gray-300">
                Guía Rápida de Inicio de AC3 (PDF o Notion) descargable de forma gratuita. Incluye: 
                Prompt Maestro para configurar la IA como tutor auxiliar y plantilla de planificación 
                de tareas (Teoría + Práctica + Supervisión).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-white font-header font-bold mb-2">Manifiesto AC3 — Propiedad intelectual</h4>
              <p className="text-xs text-gray-300">
                Documento oficial del framework AC3. Disponible bajo licencia Creative Commons 
                Atribución-NoComercial-CompartirIgual (CC BY-NC-SA). Se recomienda registro en oficinas 
                de propiedad intelectual o sellos de tiempo digitales (Proof of Existence, Copyrighted.com) 
                bajo el nombre CiszukoAntony.
              </p>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}

export default Ac3Section;
