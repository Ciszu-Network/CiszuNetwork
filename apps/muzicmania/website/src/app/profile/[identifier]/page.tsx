'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/config/supabase';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { 
  Medal, Trophy, Gamepad2, Target, LogOut, Star, Calendar, Music, User, Flame, MessageSquare
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Image from 'next/image';

// SVG reemplazos para iconos que no existen en esta versión de lucide-react
const Settings   = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const Share2     = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ShieldCheck = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
const Heart      = ({ className = 'w-4 h-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
const Ticket     = ({ className = 'w-5 h-5' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 5v2M15 11v2M15 17v2M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>;

const ACHIEVEMENTS = [
  { id: 1, name: 'Primera Partida', icon: <Medal />, unlocked: true, color: 'text-yellow-500' },
  { id: 2, name: 'Amante de la Música', icon: <Music />, unlocked: true, color: 'text-neon-blue' },
  { id: 3, name: 'Top 10', icon: <Trophy />, unlocked: false, color: 'text-gray-600' },
  { id: 4, name: 'Perfección', icon: <Target />, unlocked: false, color: 'text-gray-600' },
  { id: 5, name: 'En Racha', icon: <Flame className="w-4 h-4" />, unlocked: false, color: 'text-gray-600' },
];

export default function DynamicProfilePage() {
  const { identifier } = useParams();
  const router = useRouter();
  const { user: currentUser, setUser, showToast } = useAppStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        let query = supabase.from('profiles').select('*');
        const idStr = decodeURIComponent(Array.isArray(identifier) ? identifier[0] : identifier);

        if (idStr.startsWith('@')) {
          // Buscar por username (case-insensitive ya que en la BD está en minúsculas)
          const username = idStr.substring(1).toLowerCase();
          // Usar ilike para mayor seguridad o eq ya que sabemos que en la bd está en minuscula
          query = query.ilike('username', username);
        } else {
          // Buscar por UUID
          query = query.eq('id', idStr);
        }

        const queryPromise = query.single();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tiempo de espera agotado conectando con el servidor')), 8000)
        );

        const { data, error: pgError } = await Promise.race([queryPromise, timeoutPromise]) as any;

        if (pgError || !data) {
          setError(true);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (identifier) fetchProfile();
  }, [identifier]);

  const isOwnProfile = currentUser?.id === profile?.id;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin shadow-neon-blue" />
          <p className="text-neon-cyan font-header font-black uppercase tracking-widest text-xs animate-pulse">
            Sincronizando Identidad...
          </p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <h1 className="text-8xl font-header font-black text-white/10 select-none">404</h1>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-header font-black text-neon-pink uppercase italic">Perfil Inexistente</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">El usuario que buscas no reside en este sistema.</p>
          </div>
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink rounded-xl font-header font-bold hover:bg-neon-pink hover:text-white transition-all active:scale-95 shadow-lg"
          >
            VOLVER AL HOME
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="flex-grow pt-0 pb-20 container mx-auto px-4 max-w-5xl space-y-12">
        
        {/* Profile Header Card */}
        <section className="relative p-8 md:p-12 rounded-[3.5rem] border border-white/10 bg-white/5 overflow-hidden backdrop-blur-xl mb-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-44 h-44 rounded-full bg-black border-4 border-black flex items-center justify-center overflow-hidden shadow-inner">
                 {profile.avatar_url ? (
                   <Image src={profile.avatar_url} alt={profile.display_name} fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                 ) : (
                   <div className="w-full h-full bg-gradient-to-tr from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-7xl font-header font-black text-neon-cyan drop-shadow-neon-blue">
                     {profile.display_name?.charAt(0).toUpperCase()}
                   </div>
                 )}
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-neon-blue text-black rounded-full border-4 border-black flex items-center justify-center hover:scale-110 transition-all shadow-lg">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-5xl md:text-6xl font-header font-black tracking-tighter italic text-white drop-shadow-sm">
                  {profile.display_name}
                </h2>
                <p className="text-neon-cyan font-black tracking-widest text-sm opacity-80 uppercase italic">
                  @{profile.username}
                </p>
                {profile.bio && (
                  <p className="text-gray-300 font-bold text-sm max-w-md leading-relaxed mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                    {profile.bio}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Calendar className="w-4 h-4 text-neon-blue" />
                  MIEMBRO DESDE {new Date(profile.created_at).getFullYear()}
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <ShieldCheck className="w-4 h-4 text-neon-green" />
                  RANGO: {profile.role || 'USUARIO'}
                </div>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                  <Star className="w-4 h-4 text-neon-pink" />
                  VIP ACCESS
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                {isOwnProfile && (
                  <>
                    <button 
                      onClick={() => router.push('/profile/settings')}
                      className="flex items-center gap-3 px-8 py-3 bg-neon-purple/20 border border-neon-purple/40 rounded-2xl text-xs font-black tracking-widest text-white hover:bg-neon-purple hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      <Settings className="w-4 h-4" />
                      CONFIGURAR CUENTA
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatCard label="Puntuación Máxima" value={(profile.high_score || 0).toLocaleString()} color="text-neon-blue" icon={<Trophy className="w-4 h-4" />} />
          <StatCard label="Partidas" value={profile.games_played || 0} color="text-neon-purple" icon={<Gamepad2 className="w-4 h-4" />} />
          <StatCard label="Precisión Promedio" value={`${profile.accuracy || 0}%`} color="text-neon-cyan" icon={<Target className="w-4 h-4" />} />
          <StatCard label="Posición Global" value={`#${profile.rank || '--'}`} color="text-neon-pink" icon={<Star className="w-4 h-4" />} />
        </div>

        {/* Achievements & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-8">
              <h2 className="text-3xl font-header font-black italic tracking-tighter text-neon-blue flex items-center gap-3 uppercase">
                <Medal className="w-8 h-8" />
                LOGROS DESBLOQUEADOS
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {ACHIEVEMENTS.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-8 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-4 ${
                      achievement.unlocked ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-black opacity-30 border-dashed border-gray-800'
                    }`}
                  >
                    <div className={`w-14 h-14 flex items-center justify-center text-4xl ${achievement.unlocked ? achievement.color : 'text-gray-800'}`}>
                      {achievement.icon}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${achievement.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                      {achievement.name}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-header font-black italic tracking-tighter text-neon-purple flex items-center gap-3 uppercase">
                  <MessageSquare className="w-8 h-8" />
                  REVIEWS Y FEEDBACK
                </h2>
                <div className="h-px flex-1 bg-white/5 mx-6 hidden md:block" />
              </div>
              <div className="rounded-[3rem] border border-white/10 bg-white/5 p-16 text-center space-y-4">
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] italic text-xs">No hay actividad registrada.</p>
                {isOwnProfile && (
                  <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Tus interacciones con el ecosistema aparecerán aquí.</p>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            <div className="p-10 rounded-[3rem] bg-[#050505] border-2 border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-neon-blue/5 blur-[50px] group-hover:bg-neon-blue/10 transition-all" />
               <h3 className="font-header font-black tracking-tighter text-2xl mb-8 text-neon-blue italic uppercase">MEJORES CANCIONES</h3>
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="flex justify-between items-center p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                     <div className="flex gap-4 items-center">
                       <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-header font-black text-xs text-gray-500 group-hover:text-neon-cyan transition-colors">
                         {i}
                       </div>
                       <div>
                         <div className="text-sm font-black uppercase tracking-tight text-white group-hover:text-neon-cyan transition-colors">Neon Nights</div>
                         <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Dificultad: HARD</div>
                       </div>
                     </div>
                     <div className="text-right">
                        <div className="text-base font-header font-black text-neon-purple italic">742,000</div>
                        <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">High Score</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </aside>
        </div>
        
        <QuickDocks />
      </main>
    </MainLayout>
  );
}

function StatCard({ label, value, color, icon }: { label: string, value: string | number, color: string, icon: ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 group hover:border-white/10 transition-all shadow-xl backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 text-gray-500 mb-4">
        <div className="p-2 bg-black/50 rounded-xl border border-white/5 group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="text-[9px] uppercase font-black tracking-[0.2em]">{label}</span>
      </div>
      <div className={`text-4xl font-header font-black tracking-tighter italic ${color} group-hover:scale-110 transition-transform origin-left drop-shadow-sm`}>
        {value}
      </div>
    </motion.div>
  );
}
