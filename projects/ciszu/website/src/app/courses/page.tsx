"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { BookOpen, ExternalLink, Globe, Clock, Award, Search, Filter, BookMarked, Target, Layers } from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";
import QuickDocks from "@/components/molecules/QuickDocks";
import { Ac3Section, InfoHero, type InfoTheme } from "@ciszu/ui";

/**
 * /courses — course catalog of the Ciszu Network ecosystem.
 *
 * The first course (currently the only one) is ENGLISH with EF SET: an official
 * CEFR level assessment hosted by EF Corporate. The link opens in another
 * tab (external). The official URL lives in the vault as
 * EF_ENGLISH_ASSESSMENT_URL (see KNOWLEDGE_SYSTEM.md).
 */

const EF_COURSE_URL = "https://assessment.corporate.ef.com/public/test/f0d3daa7-4db2-4bb8-9ce2-5fb8d9fbba5c";

const THEME: InfoTheme = {
  accent: 'text-brand-light',
  accentBg: 'bg-brand/10',
  accentBorder: 'border-brand/40',
  card: 'bg-white/5',
  border: 'border-white/10',
  gradient: 'from-brand-light to-brand-accent',
};

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
    title: "English — Official Level Assessment (EF SET)",
    provider: "EF SET · EF Corporate",
    category: "Languages",
    level: "A1 – C2",
    duration: "50 min",
    format: "Online · CEFR Certificate",
    language: "English",
    description:
      "Measure your English level officially with the EF SET (EF Standard English Test), a standardized test aligned with the Common European Framework of Reference (CEFR). This is the official English course of Ciszu Network: identify your real level to keep learning.",
    href: EF_COURSE_URL,
    badges: ["Official", "CEFR", "Free", "Certificate"],
  },
  {
    id: "ac3-metodologia",
    title: "AC3 — Complete Continuous Cross-Learning",
    provider: "Ciszuko Antony · Ciszu Network",
    category: "Study Methodology",
    level: "All levels",
    duration: "Flexible",
    format: "Online · Downloadable guide",
    language: "Spanish / English",
    description:
      "New learning model created by Ciszuko Antony. Learn programming and other areas by supervising AI in the background, practicing specific fragments, and consuming multimedia theory. Includes official manifesto, dogfooding success case, and free starter kit.",
    href: "#ac3",
    badges: ["New", "Methodology", "AI", "Free"],
  },
];

const CATEGORIES = [{ value: 'All', label: 'All' }, { value: 'Languages', label: 'Languages' }, { value: 'Study Methodology', label: 'Study Methodology' }];
const LEVELS = [{ value: 'All', label: 'All' }, { value: 'Basic (A1-A2)', label: 'Basic (A1-A2)' }, { value: 'Intermediate (B1-B2)', label: 'Intermediate (B1-B2)' }, { value: 'Advanced (C1-C2)', label: 'Advanced (C1-C2)' }];

function levelBucket(level: string): string {
  if (/A1|A2|Basic/.test(level)) return "Basic (A1-A2)";
  if (/B1|B2|Intermediate/.test(level)) return "Intermediate (B1-B2)";
  if (/C1|C2|Advanced/.test(level)) return "Advanced (C1-C2)";
  return "All";
}

function providerColor(p: string): string {
  if (/EF/i.test(p)) return "#00a8e8";
  if (/Simpli/i.test(p)) return "#f97316";
  return "#22d3ee";
}

function FilterSelect({ icon, label, options, value, onChange }: { icon: React.ReactNode; label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-2 rounded-xl bg-[#0b0e1a]/80 border border-white/10 px-3 py-2.5 text-sm text-white hover:border-brand-light/40 transition-colors">
        {icon}
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.split(' ')[0]}</span>
        <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-[160px] rounded-xl bg-[#0b0e1a]/95 border border-brand/20 backdrop:blur-xl shadow-2xl shadow-black/40 overflow-hidden">
          {options.map((o) => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-brand/10 transition-colors ${value === o.value ? 'text-brand-light font-bold bg-brand/5' : 'text-gray-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  usePageTitle('COURSES');
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState<"recent" | "name" | "duration">("recent");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = COURSES.filter((c) => {
      const matchCat = category === "All" || c.category === category;
      const matchLevel = level === "All" || levelBucket(c.level) === level;
      const q = query.trim().toLowerCase();
      const matchQ = !q || `${c.title} ${c.description} ${c.provider}`.toLowerCase().includes(q);
      return matchCat && matchLevel && matchQ;
    });
    if (sort === "name") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "duration") list = [...list].sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
    return list;
  }, [category, level, sort, query]);

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand/15 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Hero */}
        <InfoHero
          icon="certificates"
          title="Courses"
          subtitle="Official training from the Ciszu Network ecosystem: selected courses to grow in languages, development, design and more. Each course opens on its official platform."
          kicker="Learning"
          theme={THEME}
        />

        {/* Filters */}
        <div className="rounded-2xl bg-brand/5 border border-brand/20 p-5 mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search course…"
                className="w-full rounded-xl bg-[#0b0e1a]/80 border border-white/10 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-brand-light/40 outline-none transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterSelect icon={<BookMarked className="w-4 h-4" />} label={category === 'All' ? 'Category' : category} options={CATEGORIES} value={category} onChange={setCategory} />
              <FilterSelect icon={<Target className="w-4 h-4" />} label={level === 'All' ? 'Level' : level} options={LEVELS} value={level} onChange={setLevel} />
              <FilterSelect icon={<Layers className="w-4 h-4" />} label={sort === 'recent' ? 'Sort' : sort === 'name' ? 'Name' : 'Duration'} options={[{ value: 'recent', label: 'Recent' }, { value: 'name', label: 'Name' }, { value: 'duration', label: 'Duration' }]} value={sort} onChange={(v) => setSort(v as typeof sort)} />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
          {filtered.length} course{filtered.length !== 1 ? "s" : ""}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-brand/5 border border-brand/20">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No courses match the filters.</p>
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
                  target={c.href.startsWith('#') ? undefined : '_blank'}
                  rel={c.href.startsWith('#') ? undefined : 'noopener noreferrer'}
                  onClick={c.href.startsWith('#') ? (e) => { e.preventDefault(); const el = document.getElementById(c.href.slice(1)); if (el) el.scrollIntoView({ behavior: 'smooth' }); } : undefined}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-light to-brand-accent text-black font-header font-black uppercase tracking-widest text-xs py-3 hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {c.href.startsWith('#') ? 'View section' : 'Go to course'} {c.href.startsWith('#') ? <Target className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                </a>
              </article>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-gray-500 text-xs">
            Want a course? Write us at{" "}
            <a href="mailto:ciszunetwork@gmail.com" className="text-brand-light underline">ciszunetwork@gmail.com</a>
          </p>
        </div>

        <Ac3Section />
      </div>

      <QuickDocks />
    </div>
  );
}
