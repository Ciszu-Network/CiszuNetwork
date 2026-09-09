import { Trophy } from "lucide-react";
import QuickDocks from "@/components/molecules/QuickDocks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Ciszu Network | LEADERBOARD',
  description: 'Tabla de clasificación y rankings de la comunidad de Ciszu Network.',
};

const rankings = [
  { rank: 1, name: "Ciszuko Antony", score: "9,800", role: "Fundador", project: "Ciszu Network" },
  { rank: 2, name: "CiszuBot", score: "8,500", role: "Bot Oficial", project: "Ciszu Network" },
  { rank: 3, name: "MuzicMania", score: "7,200", role: "Juego de Ritmo", project: "Ciszu Network" },
  { rank: 4, name: "Ciszugamens", score: "6,100", role: "Comunidad Gamer", project: "Ciszu Network" },
  { rank: 5, name: "Ciszuko Antony", score: "5,400", role: "Portfolio", project: "Ciszuko Antony" },
];

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 text-brand-light mb-6">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-6xl font-header font-black bg-gradient-to-r from-brand-light to-brand-accent bg-clip-text text-transparent uppercase tracking-tighter mb-4">
            Leaderboard
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm uppercase tracking-widest">
            Rankings de la comunidad / Community Rankings
          </p>
        </div>

        <div className="space-y-3">
          {rankings.map((r, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${r.rank <= 3 ? "bg-brand/10 border-brand/30" : "bg-brand/5 border-brand/20"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-header font-black text-lg shrink-0 ${r.rank === 1 ? "bg-yellow-500/20 text-yellow-400" : r.rank === 2 ? "bg-gray-400/20 text-gray-300" : r.rank === 3 ? "bg-orange-600/20 text-orange-400" : "bg-white/5 text-gray-400"}`}>
                {r.rank}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-white font-bold text-sm truncate">{r.name}</p>
                <p className="text-gray-500 text-xs">{r.role} · {r.project}</p>
              </div>
              <div className="text-brand-light font-mono font-bold text-sm shrink-0">{r.score}</div>
            </div>
          ))}
        </div>
      </div>

      <QuickDocks />
    </div>
  );
}
