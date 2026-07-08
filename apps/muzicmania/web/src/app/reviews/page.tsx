'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { Button } from '@/components/atoms/Button';
import { ListControls } from '@/components/molecules/ListControls';
import { supabase } from '@/config/supabase';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import AuthWarningModal from '@/components/shared/AuthWarningModal';

// --- Types ---
interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_anonymous: boolean;
  is_verified: boolean;
  likes_count: number;
  is_edited: boolean;
  is_bot?: boolean;
  created_at: string;
  updated_at: string;
  user_profile?: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
}

const DEBUG_REVIEWS: Review[] = [
  {
    id: 'debug-1',
    user_id: 'bot-1',
    rating: 5.0,
    comment: '¡Increíble! El sistema rítmico es de otro planeta. #MuzicMania',
    is_anonymous: false,
    is_verified: true,
    likes_count: 99,
    is_edited: false,
    is_bot: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_profile: { display_name: 'Ciszuko Antony', username: 'ciszuko', avatar_url: '' }
  },
  {
    id: 'debug-2',
    user_id: 'bot-2',
    rating: 4.5,
    comment: 'Me encanta la estética amarilla de esta sección. Muy Nexo.',
    is_anonymous: false,
    is_verified: false,
    likes_count: 42,
    is_edited: true,
    is_bot: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    user_profile: { display_name: 'Neon Rider', username: 'neonrider', avatar_url: '' }
  }
];

// --- Icons ---
const I = {
  star: (fillType = "good", size = "w-full h-full") => (
    <div className={`${size} relative drop-shadow-neon-blue`}>
      <svg viewBox="0 0 24 24" className="w-full h-full" stroke="none">
        <defs>
          <linearGradient id="grad-good" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#ff33cc" />
          </linearGradient>
          <linearGradient id="grad-bad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0000" />
            <stop offset="100%" stopColor="#ff33cc" />
          </linearGradient>
          <linearGradient id="grad-neutral" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6600" />
            <stop offset="100%" stopColor="#ff33cc" />
          </linearGradient>
          <linearGradient id="half-good" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="half-bad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#ff0000" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="half-neutral" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#ff6600" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon 
          points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" 
          fill={fillType.startsWith('url') ? fillType : `url(#grad-${fillType})`}
        />
      </svg>
    </div>
  ),
  heart: (filled = false) => (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  check: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>,
  edit: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  plus: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={3}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  trending: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  award: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
  arrow: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
};

export default function ReviewsPage() {
  // State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const reviewsPerPage = 10;

  // Form State
  const [rating, setRating] = useState(5.0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then((res: any) => {
      const currentSession = res?.data?.session;
      setSession(currentSession);
      if (currentSession) fetchUserReview(currentSession.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, currentSession: any) => {
      setSession(currentSession);
      if (currentSession) fetchUserReview(currentSession.user.id);
      else setUserReview(null);
    });

    fetchReviews();

    return () => subscription.unsubscribe();
  }, [sortBy, sortOrder, page]);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, user_profile:profiles(display_name, username, avatar_url)')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range((page - 1) * reviewsPerPage, page * reviewsPerPage - 1);

    if (!error && data) {
      let filteredData = data;
      if (session) {
        const userRevIdx = data.findIndex((r: Review) => r.user_id === session.user.id);
        if (userRevIdx > -1) {
          const userRev = filteredData.splice(userRevIdx, 1)[0];
          filteredData = [userRev, ...filteredData];
        } else if (userReview && page === 1) {
          filteredData = [userReview, ...filteredData];
        }
      }
      
      // Inject debug reviews if local
      const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      if (isLocal && page === 1) {
        filteredData = [...DEBUG_REVIEWS, ...filteredData];
      }

      setReviews(filteredData);
    }
    setLoading(false);
  };

  const fetchUserReview = async (userId: string) => {
    const { data } = await supabase.from('reviews').select('*').eq('user_id', userId).single();
    if (data) {
      setUserReview(data);
      setRating(data.rating);
      setComment(data.comment);
      setIsAnonymous(data.is_anonymous);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!session) {
      setIsAuthWarningOpen(true);
      return;
    }
    await supabase.from('review_likes').insert({ user_id: session.user.id, review_id: reviewId });
    fetchReviews();
  };

  const handleSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    const reviewData = { user_id: session.user.id, rating, comment, is_anonymous: isAnonymous, updated_at: new Date().toISOString() };
    if (userReview) await supabase.from('reviews').update(reviewData).eq('id', userReview.id);
    else await supabase.from('reviews').insert(reviewData);
    setIsModalOpen(false);
    setSubmitting(false);
    fetchReviews();
    fetchUserReview(session.user.id);
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const getRatingType = (r: number) => {
    if (r >= 3.5) return 'good';
    if (r >= 2.5) return 'neutral';
    return 'bad';
  };

  const getRatingColor = (r: number) => {
    if (r >= 4) return 'var(--color-neon-yellow)';
    if (r >= 3) return 'var(--color-neon-green)';
    if (r >= 2) return 'var(--color-neon-orange)';
    return 'var(--color-neon-red)';
  };

  const getRatingShadow = (r: number) => {
    return 'drop-shadow-neon-blue'; // Fijo en azul por petición de usuario
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-neon-yellow/5 rounded-full blur-[250px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-0 pb-32 space-y-12">
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-yellow flex items-center justify-center">
                   {I.star('good')}
                </div>
                <h1 className="text-5xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-yellow to-white bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  RESEÑAS
                </h1>
             </div>
             <p className="text-neon-yellow font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Calibrando la experiencia rítmica global
             </p>
          </div>
        </motion.header>

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="space-y-12">
          <div className="bg-black border border-white/10 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-neon-yellow/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-center justify-center gap-14 relative z-10 text-center flex-wrap">
               <div className="relative group/score">
                  <div className="w-40 h-40 rounded-full border-8 border-neon-yellow/10 flex items-center justify-center shadow-[0_0_80px_rgba(255,217,0,0.15)] bg-black transition-transform group-hover/score:scale-110 duration-500">
                     <div className="text-center">
                        <div className="text-6xl font-header font-black text-neon-yellow drop-shadow-neon-yellow italic -mb-2">4.9</div>
                        <div className="text-[12px] text-neon-yellow font-black uppercase tracking-[0.3em] opacity-40">/ 5.0</div>
                     </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-neon-yellow text-black w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,217,0,0.5)] border-4 border-black group-hover/score:rotate-12 transition-transform">
                    <div className="w-6 h-6">{I.check}</div>
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="flex gap-2.5">
                     {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-8 transform hover:scale-125 transition-transform">{I.star('good')}</div>)}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                     <div className="h-0.5 w-12 bg-neon-yellow/20" />
                     <p className="text-[12px] text-white font-black tracking-[0.4em] uppercase opacity-40">Satisfaction Protocol v2.1.0</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="w-full">
              <ListControls 
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={setSortBy}
                onOrderToggle={() => setSortOrder(v => v === 'asc' ? 'desc' : 'asc')}
                options={[
                  { label: 'Recientes', value: 'created_at', icon: I.clock },
                  { label: 'Tendencias', value: 'likes_count', icon: I.trending },
                  { label: 'Calificación', value: 'rating', icon: I.award }
                ]}
                color="neon-yellow"
              />
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => session ? setIsModalOpen(true) : setIsAuthWarningOpen(true)}
                className="!bg-black !text-neon-yellow border-2 border-neon-yellow/40 shadow-[0_0_40px_rgba(255,217,0,0.2)] hover:shadow-neon-yellow/50 hover:border-neon-yellow hover:scale-110 active:scale-95 px-12 h-20 rounded-3xl group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8">{userReview ? I.edit : I.plus}</div>
                  <span className="font-header font-black tracking-[0.3em] uppercase text-lg italic">
                    {userReview ? 'EDITAR MI RESEÑA' : 'ESCRIBIR RESEÑA'}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section initial="hidden" animate="visible" variants={sectionVariants} className="grid grid-cols-1 gap-10">
           <AnimatePresence mode="popLayout">
             {loading ? (
               <div className="py-60 text-center animate-pulse text-neon-yellow font-header font-black uppercase tracking-[1em] text-2xl drop-shadow-neon-yellow">
                 Sincronizando el Nexo...
               </div>
             ) : (
               reviews.map((rev) => (
                 <ReviewCard key={rev.id} review={rev} onLike={() => handleLike(rev.id)} />
               ))
             )}
           </AnimatePresence>

           <div className="flex justify-center items-center gap-8 pt-20">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-16 h-16 rounded-[2rem] bg-black border-2 border-white/5 flex items-center justify-center hover:border-neon-yellow hover:text-neon-yellow transition-all shadow-2xl active:scale-90 group">
                <div className="w-6 h-6 rotate-180 group-hover:scale-125 transition-transform">{I.arrow}</div>
              </button>
              <div className="flex gap-4">
                {[1, 2, 3].map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-16 h-16 rounded-[2rem] font-header font-black text-xl transition-all shadow-2xl border-2 ${page === p ? 'bg-neon-yellow text-black border-neon-yellow scale-110' : 'bg-black border-white/5 hover:border-white/20'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={() => setPage(p => p + 1)} className="w-16 h-16 rounded-[2rem] bg-black border-2 border-white/5 flex items-center justify-center hover:border-neon-yellow hover:text-neon-yellow transition-all shadow-2xl active:scale-90 group">
                <div className="w-6 h-6 group-hover:scale-125 transition-transform">{I.arrow}</div>
              </button>
           </div>
        </motion.section>

        <QuickDocks />
      </div>

      {/* --- MODAL DE RESEÑA --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
            <motion.div initial={{ scale: 0.9, y: 100, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 100, opacity: 0 }}
              className="relative w-full max-w-3xl bg-black border-2 border-white/10 rounded-[5rem] overflow-hidden shadow-[0_0_200px_rgba(255,217,0,0.2)]"
            >
              <div className={`absolute top-0 left-0 w-full h-4 bg-gradient-to-r transition-all duration-700`} style={{ background: `linear-gradient(to right, ${getRatingColor(rating)}, transparent)` }} />
              <div className="p-20 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-header font-black text-white uppercase italic tracking-tighter">
                      {userReview ? 'ACTUALIZAR RESEÑA' : 'NUEVA RESEÑA'}
                    </h2>
                    <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.4em]">Protocolo de calibración activa</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 hover:text-neon-red hover:border-neon-red transition-all">
                    <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>

                <div className="space-y-8 text-center bg-white/[0.03] p-14 rounded-[4rem] border border-white/10">
                  <div className="flex flex-col items-center gap-4">
                     <p className="text-[13px] font-black text-white/40 uppercase tracking-[0.5em]">Calificación Final</p>
                     <div className={`text-5xl font-header font-black transition-colors ${getRatingShadow(rating)}`} style={{ color: getRatingColor(rating) }}>
                       {rating.toFixed(1)} <span className="opacity-20 text-3xl">/ 5.0</span>
                     </div>
                  </div>
                  <div className="relative h-28 flex items-center justify-center gap-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)}
                        onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left; const percent = x / rect.width; setRating(star - 1 + (percent > 0.5 ? 1 : 0.5)); }}
                        className={`w-20 h-20 transition-all duration-500 transform active:scale-75 ${rating >= star - 0.5 ? `drop-shadow-neon-blue` : 'text-white/5 opacity-30 hover:opacity-100'}`}
                        style={{ color: rating >= star - 0.5 ? getRatingColor(rating) : 'inherit' }}
                      >
                        {I.star(rating >= star ? getRatingType(rating) : (rating >= star - 0.5 ? `url(#half-${getRatingType(rating)})` : 'none'))}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe tu mensaje aquí..."
                  className="w-full h-60 bg-white/[0.02] border-2 border-white/5 rounded-[3.5rem] p-12 text-white font-header font-bold text-2xl placeholder:text-white/5 focus:border-neon-yellow outline-none transition-all resize-none shadow-2xl"
                />

                <div className="flex flex-wrap items-center justify-between gap-10 pt-4">
                   <button onClick={() => setIsAnonymous(!isAnonymous)} className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] border-2 transition-all ${isAnonymous ? 'bg-neon-yellow text-black border-neon-yellow shadow-neon-yellow/30' : 'bg-transparent border-white/10 text-white/20 hover:border-white/40'}`}>
                     <div className="w-6 h-6">{I.lock}</div>
                     <span className="text-[12px] font-black uppercase tracking-[0.2em]">Publicar Anónimo</span>
                   </button>
                   <Button onClick={handleSubmit} disabled={submitting || comment.length < 10} className={`!bg-black !text-neon-yellow border-2 border-neon-yellow/40 min-w-[300px] h-20 rounded-[2.5rem] font-header font-black tracking-[0.3em] uppercase transition-all hover:scale-105 active:scale-95 shadow-2xl ${submitting ? 'opacity-50' : ''}`}>
                     {submitting ? 'SINCRONIZANDO...' : (userReview ? 'GUARDAR CAMBIOS' : 'PUBLICAR RESEÑA')}
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} message="Necesitas una cuenta ciudadana para poder interactuar en esta sección." />
    </MainLayout>
  );
}

// --- Components ---

const ReviewCard = ({ review, onLike }: { review: Review, onLike: () => void }) => {
  const getRatingType = (r: number) => {
    if (r >= 3.5) return 'good';
    if (r >= 2.5) return 'neutral';
    return 'bad';
  };

  const isPositive = review.rating >= 3.5;
  const ratingType = getRatingType(review.rating);
  const colorName = review.rating >= 4 ? 'neon-yellow' : (review.rating >= 3 ? 'neon-green' : (review.rating >= 2 ? 'neon-orange' : 'neon-red'));
  const colorHex = review.rating >= 4 ? '#ffd900' : (review.rating >= 3 ? '#00ff88' : (review.rating >= 2 ? '#ff6600' : '#ff0000'));

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} 
      className={`group relative p-14 bg-black border-2 border-white/5 rounded-[5rem] hover:border-${colorName}/30 transition-all duration-1000 shadow-2xl flex flex-col md:flex-row gap-16 overflow-hidden`}
    >
       <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
       <div className={`absolute -top-32 -left-32 w-80 h-80 opacity-0 group-hover:opacity-20 transition-opacity duration-1000 rounded-full blur-[120px]`} style={{ backgroundColor: colorHex }} />
       
       {/* User Info */}
       <div className="flex flex-col items-center gap-8 flex-shrink-0 min-w-[220px] relative z-10">
         <Link href={`/user/${review.user_profile?.username || 'anonymous'}`} className="relative group/avatar cursor-pointer">
            <div className={`w-40 h-40 rounded-full border-4 border-white/5 p-2 transition-all duration-1000 group-hover/avatar:scale-110 shadow-2xl bg-black relative`}>
               <div className={`absolute inset-0 rounded-full border-2 border-${colorName}/30 animate-pulse`} />
               {review.is_anonymous ? (
                 <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/5">{I.user}</div>
               ) : (
                 <div className="w-full h-full rounded-full bg-black overflow-hidden flex items-center justify-center font-header font-black text-5xl relative">
                   <div className="absolute inset-0 bg-gradient-to-br opacity-20" style={{ backgroundImage: `linear-gradient(to bottom right, ${colorHex}, transparent)` }} />
                   {review.user_profile?.avatar_url ? <Image src={review.user_profile.avatar_url} alt={review.user_profile.display_name} width={160} height={160} className="relative z-10" /> : <span className="relative z-10" style={{ color: colorHex }}>{review.user_profile?.display_name.charAt(0) || '?'}</span>}
                 </div>
               )}
            </div>
            {!review.is_anonymous && (
              <div className={`absolute -bottom-2 -right-2 w-12 h-12 bg-black border-4 border-${colorName} rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover/avatar:scale-100 transition-transform duration-700`} style={{ color: colorHex }}>
                <div className="w-6 h-6">{I.check}</div>
              </div>
            )}
         </Link>
         <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
               <h4 className="text-xl font-header font-black text-white uppercase tracking-widest">{review.is_anonymous ? 'CIUDADANO ANÓNIMO' : review.user_profile?.display_name}</h4>
               {review.is_bot && (
                 <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-[8px] font-black text-white/40 uppercase tracking-widest">BOT</span>
               )}
            </div>
            {!review.is_anonymous && <p className={`text-xs font-black uppercase tracking-[0.4em] opacity-30`} style={{ color: colorHex }}>@{review.user_profile?.username}</p>}
         </div>
       </div>

       {/* Content */}
       <div className="flex-1 space-y-10 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-8">
             <div className="flex items-center gap-10">
                <div className="space-y-3">
                   <div className="flex gap-2 h-8">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-8 h-8 transition-all duration-500 ${review.rating >= i - 0.5 ? 'drop-shadow-neon-blue' : 'text-white/5'}`} style={{ color: review.rating >= i - 0.5 ? colorHex : 'inherit' }}>
                          {I.star(review.rating >= i ? ratingType : (review.rating >= i - 0.5 ? `url(#half-${ratingType})` : 'none'))}
                        </div>
                      ))}
                   </div>
                   <p className={`text-sm font-header font-black tracking-[0.2em] italic`} style={{ color: colorHex }}>{review.rating.toFixed(1)} <span className="opacity-30">/ 5.0</span></p>
                </div>
             </div>

             <div className="flex flex-wrap gap-4">
                <Badge icon={I.clock} color="white" opacity="5" label={new Date(review.created_at).toLocaleDateString()} />
                {review.is_verified && <Badge icon={I.check} color="neon-cyan" label="Nivel Verificado" />}
                <Badge color={isPositive ? 'neon-green' : 'neon-red'} label={isPositive ? 'SENTIMIENTO POSITIVO' : 'SENTIMIENTO NEGATIVO'} />
                {review.is_edited && <Badge icon={I.edit} color="white" opacity="5" label="MODIFICADA" />}
             </div>
          </div>
          
          <div className="relative group/text">
             <div className="absolute -left-8 top-0 w-1.5 h-full rounded-full bg-white/5 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b opacity-50" style={{ backgroundImage: `linear-gradient(to bottom, ${colorHex}, transparent)` }} />
             </div>
             <p className="text-white font-header font-bold text-3xl md:text-5xl uppercase leading-[1.1] italic tracking-tight group-hover/text:translate-x-3 transition-transform duration-700">
                "{review.comment}"
             </p>
          </div>

          <div className="flex flex-wrap items-center gap-10 pt-4">
             <button onClick={onLike} className={`flex items-center gap-5 transition-all text-sm font-black uppercase tracking-[0.4em] group/like ${review.likes_count > 0 ? `text-neon-pink` : 'text-white/10 hover:text-neon-pink'}`}>
                <div className={`w-9 h-9 transition-all duration-500 group-hover/like:scale-125 ${review.likes_count > 0 ? 'drop-shadow-neon-pink' : ''}`}>{I.heart(review.likes_count > 0)}</div>
                <div className="flex flex-col">
                   <span className="text-lg font-header font-black italic leading-none">{review.likes_count}</span>
                   <span className="text-[10px] opacity-40">REACCIONES</span>
                </div>
             </button>
             <div className="h-8 w-px bg-white/5" />
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <span className="text-[11px] text-white/10 font-black uppercase tracking-[0.5em] italic">Transmisión Cifrada v2.1</span>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

const Badge = ({ icon, color, label, opacity = "10" }: { icon?: any, color: string, label: string, opacity?: string }) => {
  const colorVar = color.startsWith('neon') ? `var(--color-${color})` : color;
  return (
    <div className={`flex items-center gap-3 px-6 py-3 bg-black border-2 rounded-[2rem] shadow-xl group transition-all hover:scale-105`} style={{ borderColor: `${colorVar}33` }}>
      {icon && <div className="w-4 h-4 transition-transform group-hover:rotate-12" style={{ color: colorVar }}>{icon}</div>}
      <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: colorVar }}>{label}</span>
    </div>
  );
};
