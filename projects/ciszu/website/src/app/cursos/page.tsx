"use client";

import { useMemo, useState } from "react";
import { BookOpen, GraduationCap, ExternalLink, Globe, Clock, Award, Search } from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";

/**
 * /cursos — catálogo de cursos del ecosistema Ciszu Network.
 *
 * El primer curso (único por ahora) es el de INGLÉS con EF SET: un test
 * oficial de nivel CEFR alojado en EF Corporate. El enlace abre en otra
 * pestaña (external). La URL oficial vive en el vault como
 * EF_ENGLISH_ASSESSMENT_URL (ver KNOWLEDGE_SYSTEM.md).
 */

const EF_COURSE_URL = "https://assessment.corporate.ef.com/public/test/f0d3daa7-4db2-4bb8-9ce2-5fb8d9fbba5c";

interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration: string;
  format: string;
  language: string;
  description: string;
  href: string;
  badges: string[];
}

const COURSES: Course[] = [
  {
    id: "ingles-ef-set",
    title: "Inglés — Test de nivel oficial (EF SET)",
    provider: "EF SET · EF Corporate",
    category: "Idiomas",
    level: "A1 – C2",
    duration: "50 min",
    format: "Online · Certificado CEFR",
    language: "Inglés",
    description:
      "Mide tu nivel de inglés de forma oficial con el EF SET (EF Standard English Test), un test estandarizado alineado al Marco Común Europeo de Referencia (CEFR). Es el curso de inglés oficial de Ciszu Network: identifica tu nivel real para seguir aprendiendo.",
    href: EF_COURSE_URL,
    badges: ["Oficial", "CEFR", "Gratuito", "Certificado"],
  },
];

const CATEGORIES = ["Todos", "Idiomas"];
const LEVELS = ["Todos", "Básico (A1-A2)", "Intermedio (B1-B2)", "Avanzado (C1-C2)"];

function levelBucket(level: string): string {
  if (/A1|A2|Básico/.test(level)) return "Básico (A1-A2)";
  if (/B1|B2|Intermedio/.test(level)) return "Intermedio (B1-B2)";
  if (/C1|C2|Avanzado/.test(level)) return "Avanzado (C1-C2)";
  return "Todos";
}

function providerColor(p: string): string {
  if (/EF/i.test(p)) return "#00a8e8";
  if (/Simpli/i.test(p)) return "#f97316";
  return "#22d3ee";
}

export default function CursosPage() {
  usePageTitle('CURSOS');
  const [category, setCategory] = useState("Todos");
  const [level, setLevel] = useState("Todos");
  const [sort, setSort] = useState<"recientes" | "nombre" | "duracion">("recientes");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = COURSES.filter((c) => {
      const matchCat = category === "Todos" || c.category === category;
      const matchLevel = level === "Todos" || levelBucket(c.level) === level;
      const q = query.trim().toLowerCase();
      const matchQ = !q || `${c.title} ${c.description} ${c.provider}`.toLowerCase().includes(q);
      return matchCat && matchLevel && matchQ;
    });
    if (sort === "nombre") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "duracion") list = [...list].sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    return list;
  }, [category, level, sort, query]);

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand/15 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Cursos
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Formación oficial del ecosistema Ciszu Network
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mt-4 text-sm leading-relaxed">
            Cursos seleccionados para crecer: idiomas, desarrollo, diseño y más.
            Cada curso se abre en su plataforma oficial.
          </p>
        </div>

        {/* Filtros */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-5 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar curso…"
                className="w-full rounded-xl bg-[#0b0e1a]/80 border border-white/10 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-brand-light/40 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl bg-[#0b0e1a]/80 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-brand-light/40 outline-none transition-colors cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="rounded-xl bg-[#0b0e1a]/80 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-brand-light/40 outline-none transition-colors cursor-pointer"
              >
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-xl bg-[#0b0e1a]/80 border border-white/10 px-3 py-2.5 text-sm text-white focus:border-brand-light/40 outline-none transition-colors cursor-pointer"
              >
                <option value="recientes">Ordenar: Recientes</option>
                <option value="nombre">Ordenar: Nombre</option>
                <option value="duracion">Ordenar: Duración</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="mb-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
          {filtered.length} curso{filtered.length !== 1 ? "s" : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-brand/5 border border-brand/20">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No hay cursos que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((c) => (
              <article key={c.id} className="group relative p-6 rounded-2xl bg-brand/5 border border-brand/20 hover:border-brand-light/40 transition-all flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ background: `${providerColor(c.provider)}22`, color: providerColor(c.provider) }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    <Globe className="w-3 h-3" /> {c.format}
                  </span>
                </div>

                <h2 className="text-lg font-header font-bold text-white leading-snug mb-1">{c.title}</h2>
                <p className="text-brand-light text-xs font-bold mb-2">{c.provider}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">{c.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {c.badges.map((b) => (
                    <span key={b} className="text-[10px] font-bold uppercase tracking-widest text-brand-light/80 bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">{b}</span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-5">
                  <span className="inline-flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {c.level}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                  <span className="inline-flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> {c.language}</span>
                </div>

                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-light to-brand-accent text-black font-header font-black uppercase tracking-widest text-xs py-3 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Ir al curso <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            ¿Quieres un curso? Escríbenos a{" "}
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">ciszunetwork@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}