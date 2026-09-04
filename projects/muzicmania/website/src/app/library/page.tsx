'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQueryState } from 'nuqs';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { TRACKS_DATA, Track } from '@/data/tracks';
import { trackCover, trackDisc, trackAudioCandidates, createTrackAudio } from '@/utils/musicAssets';
import { supabase } from '@/config/supabase';
import { useAppStore } from '@/store/useAppStore';
import AuthWarningModal from '@/components/shared/AuthWarningModal';
import { extractAccentColor } from '@/lib/colorUtils';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library ---
const I = {
  play: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  download: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  volume: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  zap: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  clock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  target: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  activity: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  info: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>,
  arrow: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  soundcloud: <svg role="img" viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>,
  disc: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>,
  album: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 12V7h5"/></svg>,
  date: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  lyrics: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 7h8M8 11h8M8 15h4"/></svg>,
  video: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>,
  speed: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12h20M2 12l5-5m13 5l-5 5"/></svg>,
  lock: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  heart: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
  sort: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="m15 18 3 3 3-3M3 6h18M3 12h12M3 18h9"/></svg>,
  star: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  user: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  music: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  verified: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
};

function getCoverUrl(track: Track): string {
  return trackCover(track.id);
}

function LibraryContent() {
  const [trackId] = useQueryState('track');
  const initialTrackId = trackId;
  
  const [tracks, setTracks] = useState<Track[]>(TRACKS_DATA);
  const [selectedTrack, setSelectedTrack] = useState(TRACKS_DATA.find(t => t.id === initialTrackId) || TRACKS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [session, setSession] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const { pauseGlobalMusic, isMusicPlaying: isGlobalMusicPlaying } = useAppStore();
  const [realStats, setRealStats] = useState<Record<string, { plays: number, likes: number }>>({});
  const [isAuthWarningOpen, setIsAuthWarningOpen] = useState(false);
  const [downloadNotif, setDownloadNotif] = useState<string | null>(null);
  const [accentColors, setAccentColors] = useState<Record<string, string>>({});

  // Detect accent colors for all tracks from cover art
  useEffect(() => {
    TRACKS_DATA.forEach(track => {
        extractAccentColor(trackCover(track.id)).then(color => {
        setAccentColors(prev => ({ ...prev, [track.id]: color }));
      });
    });
  }, []);
  
  // Modales y Alertas
  const [alert, setAlert] = useState<{ show: boolean, title: string, message: string, type: 'error' | 'info' }>({ show: false, title: '', message: '', type: 'info' });
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Espejo de `isPlaying` para el auto-play al cambiar de candidato/track
  // dentro del efecto de audio (evita depender del valor en el render).
  const isPlayingRef = useRef(false);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: any }) => setSession(data.session));
  }, []);

  useEffect(() => {
    if (trackId) {
      const track = TRACKS_DATA.find(t => t.id === trackId);
      if (track) setSelectedTrack(track);
    }
  }, [trackId]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!selectedTrack) return;
    // Usa createTrackAudio (fallback robusto CDN .ogg → .opus → public .ogg,
    // timeout 8s, detección canplay/loadeddata/error). Evita duplicar lógica.
    const { audio } = createTrackAudio(selectedTrack.id, {
      volume,
      preload: 'auto',
      timeoutMs: 8000,
    });
    audioRef.current = audio;

    const handleEnded = () => setIsPlaying(false);
    const handleLoadedMeta = () => {
      if (audioRef.current && isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
        setDuration(audioRef.current.duration);
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleLoadedMeta);

    // Auto-play si ya se estaba reproduciendo
    if (isPlayingRef.current) {
      pauseGlobalMusic();
      audio.play().catch((e) => {
        console.log('Audio play prevented:', e);
        setIsPlaying(false);
      });
    }

    setProgress(0);
    setCurrentTime(0);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleLoadedMeta);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [selectedTrack, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Sincronizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    let filtered = [...TRACKS_DATA];
    
    if (showOnlyFavorites) {
      filtered = filtered.filter(t => favorites.includes(t.id));
    }

    filtered.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];
      
      if (sortBy === 'likes') {
        valA = likesCount[a.id] || 0;
        valB = likesCount[b.id] || 0;
      }
      
      if (sortBy === 'duration') { valA = a.duration_sec; valB = b.duration_sec; }
      if (typeof valA === 'string') return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
    setTracks(filtered);
  }, [sortBy, sortDir, favorites, showOnlyFavorites, likesCount]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('track_stats')
        .select('track_id, play_count, like_count');
      
      if (!error && data) {
        const statsMap: Record<string, { plays: number, likes: number }> = {};
        const counts: Record<string, number> = {};
        data.forEach((s: any) => {
          statsMap[s.track_id] = { plays: s.play_count, likes: s.like_count };
          counts[s.track_id] = s.like_count;
        });
        setRealStats(statsMap);
        setLikesCount(counts);
      }
    };
    fetchStats();
  }, []);

  const handleLike = (trackId: string) => {
    if (!session) {
      setIsAuthWarningOpen(true);
      return;
    }
    
    setFavorites(prev => {
      const isFav = prev.includes(trackId);
      const newFavs = isFav ? prev.filter(id => id !== trackId) : [...prev, trackId];
      
      // Simular actualización de likes reales
      setLikesCount(counts => ({
        ...counts,
        [trackId]: isFav ? Math.max(0, counts[trackId] - 1) : counts[trackId] + 1
      }));
      
      return newFavs;
    });
  };

  const handleDownload = (track: Track) => {
    const url = track.url.replace('.ogg', '.mp3');
    const filename = `${track.name}.mp3`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    a.addEventListener('click', (e) => e.stopPropagation());
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadNotif(track.name);
    setTimeout(() => setDownloadNotif(null), 4000);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Detener música de fondo si está sonando
      pauseGlobalMusic();
      audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      const dur = audioRef.current.duration;
      setDuration(isFinite(dur) && dur > 0 ? dur : 0);
      setProgress(dur && isFinite(dur) && dur > 0 ? (audioRef.current.currentTime / dur) * 100 : 0);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
      setProgress(val);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const showAlert = (title: string, message: string, type: 'error' | 'info' = 'info') => {
    setAlert({ show: true, title, message, type });
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-neon-blue/5 rounded-full blur-[250px] animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-0 pb-32 space-y-16">
        
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12 text-center">
           <div className="flex flex-col items-center gap-1">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-blue flex items-center justify-center">
                   {I.disc}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-blue via-white to-neon-purple bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  LIBRERÍA
                </h1>
             </div>
             <p className="text-neon-cyan font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               Explora el repertorio exclusivo de CiszukoAntony
             </p>
           </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          
          {/* TRACK LIST */}
          <div className="lg:col-span-8 space-y-6">
            {/* FILTERS - moved above list */}
            <div className="p-6 bg-doc-dark border border-white/5 rounded-[2.5rem] shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                    <div className={`w-3 h-3 transition-transform duration-500 ${sortDir === 'desc' ? 'rotate-180' : ''}`}>{I.sort}</div>
                    {sortDir === 'desc' ? 'DESC' : 'ASC'}
                  </button>
                  <div className="flex gap-1 flex-wrap">
                    {[
                      { id: 'likes', label: 'POPULARIDAD', icon: 'heart' },
                      { id: 'duration', label: 'DURACIÓN', icon: 'clock' },
                      { id: 'bpm', label: 'BPM', icon: 'zap' },
                      { id: 'difficulty', label: 'DIFICULTAD', icon: 'target' },
                      { id: 'album', label: 'ÁLBUM', icon: 'album' },
                      { id: 'name', label: 'ALFABÉTICO', icon: 'sort' },
                      { id: 'release_date', label: 'FECHA', icon: 'date' },
                      { id: 'artist', label: 'AUTOR', icon: 'user' },
                      { id: 'favorites', label: 'FAVORITAS', icon: 'heart' },
                    ].map(f => {
                      const isFavFilter = f.id === 'favorites';
                      const isActive = isFavFilter ? showOnlyFavorites : sortBy === f.id;
                      const handleClick = isFavFilter
                        ? () => setShowOnlyFavorites(v => !v)
                        : () => setSortBy(f.id);
                      return (
                        <button key={f.id} onClick={handleClick} className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isActive ? (isFavFilter ? 'bg-neon-pink text-white' : 'bg-neon-blue text-black') : 'bg-white/5 text-white/30 border border-white/5 hover:border-white/20'}`}>
                          <div className="w-2.5 h-2.5">{isFavFilter ? <svg viewBox="0 0 24 24" className="w-full h-full" fill={showOnlyFavorites ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> : (I as any)[f.icon]}</div>
                          {isFavFilter && showOnlyFavorites ? '★ TODAS' : f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-doc-dark border border-white/5 rounded-[3rem] shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{tracks.length} tracks</span>
              </div>
              {tracks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-white/20 font-black uppercase text-[10px] tracking-[0.5em] italic">No hay tracks disponibles</p>
                </div>
              )}

              <div className="space-y-3">
                {tracks.map((track) => (
                  <div key={track.id} onClick={() => setSelectedTrack(track)}
                    className={`group/track flex items-center gap-5 p-5 rounded-3xl border transition-all cursor-pointer ${selectedTrack.id === track.id ? (accentColors[track.id] ? 'border' : `bg-neon-${track.colorKey}/10 border-neon-${track.colorKey}`) : 'bg-black/40 border-white/5 hover:border-white/20'}`}
                    style={selectedTrack.id === track.id && accentColors[track.id] ? { backgroundColor: `${accentColors[track.id]}1A`, borderColor: accentColors[track.id] } : undefined}>
                     <div className="w-16 h-16 shrink-0 relative group/tc">
                        <img src={trackDisc(track.id)} alt={`Disco de ${track.name}`}
                          className={`absolute inset-0 w-full h-full -translate-y-1 z-0 transition-all duration-500 ease-out group-hover/tc:-translate-y-2 group-hover/tc:z-20 ${
                            selectedTrack.id === track.id && isPlaying ? 'animate-spin' : ''
                          }`}
                          style={{ animationDuration: '4s' }}
                        />
                        <img src={getCoverUrl(track)} alt={track.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-all duration-500 ease-out z-10 shadow-lg group-hover/tc:opacity-15"
                        />
                     </div>
                      <div className="flex-1 min-w-0">
                      <h3 className="font-header font-black text-white text-xl uppercase tracking-tighter italic group-hover/track:text-white flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 text-neon-cyan" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        {track.name}
                      </h3>
                      <p className="text-[9px] text-neon-cyan font-black uppercase tracking-widest opacity-60 flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 12V7h5"/></svg>
                        {track.album}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-gray-500 font-black uppercase text-[7px] tracking-wider">Autor:</span>
                        <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[8px] normal-case hover:text-neon-cyan transition-colors">Ciszuko Antony</Link>
                        <div className="w-2.5 h-2.5 text-blue-400 shrink-0">{I.verified}</div>
                        <span className="text-gray-600 text-[6px]">|</span>
                        <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span className="text-gray-500 font-black uppercase text-[7px] tracking-wider">Subido Por:</span>
                        <Link href="/profile/@muzicmania" className="text-white font-bold text-[8px] normal-case hover:text-neon-cyan transition-colors">MuzicMania</Link>
                        <div className="w-2.5 h-2.5 text-blue-400 shrink-0">{I.verified}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 text-neon-blue fill-current">{I.play}</div>
                      <span className="text-[8px] font-black text-white">{realStats[track.id]?.plays || 0}</span>
                    </div>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleLike(track.id);
                      }} 
                      className={`h-12 px-4 rounded-xl flex items-center justify-center gap-3 border-2 transition-all ${favorites.includes(track.id) ? 'bg-neon-pink/10 text-neon-pink border-neon-pink/40 shadow-neon-pink/20' : 'text-white/10 border-white/5 hover:border-white/20'}`}
                    >
                       <div className="w-5 h-5">{I.heart}</div>
                       <span className="text-[10px] font-mono font-bold">{likesCount[track.id] || 0}</span>
                     </button>
                   </div>
                 ))}
              </div>
              <div className="mt-12 text-center">
                 <p className="text-white/10 font-black uppercase text-[10px] tracking-[0.5em] italic">Más canciones próximamente en la red</p>
              </div>
            </div>

            {/* SOUNDCLOUD CTA */}
            <a 
              href="https://soundcloud.com/ciszuko-antony"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-6 rounded-[2.5rem] bg-orange-600/10 border border-orange-500/20 hover:border-orange-500/50 transition-all flex items-center justify-center gap-4 group"
            >
               <div className="w-8 h-8 text-orange-500">{I.soundcloud}</div>
               <span className="text-xs font-black text-white uppercase italic tracking-tighter">Seguir en SoundCloud</span>
            </a>
          </div>

          {/* PLAYER */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="p-10 rounded-[4rem] bg-doc-dark backdrop-blur-3xl shadow-2xl relative overflow-hidden group/player"
                style={accentColors[selectedTrack.id] ? { borderColor: `${accentColors[selectedTrack.id]}4D` } : { borderColor: 'rgba(0,212,255,0.3)' }}>
                <div className="w-full aspect-square rounded-[3rem] mb-8 overflow-hidden relative shadow-2xl">
                   <Image src={getCoverUrl(selectedTrack)} alt={selectedTrack.name} width={400} height={400} className="w-full h-full object-cover" />
                </div>

                 <div className="text-center mb-4">
                    <h2 className="text-3xl font-header font-black text-white uppercase tracking-tighter italic leading-none">{selectedTrack.name}</h2>
                 </div>

                 {/* AUTHOR & UPLOADER */}
                 <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 mb-6">
                   <div className="flex items-center gap-1">
                     <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     <span className="text-gray-500 font-black uppercase text-[7px] tracking-wider">Autor:</span>
                     <Link href="/profile/@ciszukoantony_" className="text-white font-bold text-[8px] normal-case hover:text-neon-cyan transition-colors">Ciszuko Antony</Link>
                     <div className="w-2.5 h-2.5 text-blue-400 shrink-0">{I.verified}</div>
                   </div>
                   <div className="flex items-center gap-1">
                     <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                     <span className="text-gray-500 font-black uppercase text-[7px] tracking-wider">Subido Por:</span>
                     <Link href="/profile/@muzicmania" className="text-white font-bold text-[8px] normal-case hover:text-neon-cyan transition-colors">MuzicMania</Link>
                     <div className="w-2.5 h-2.5 text-blue-400 shrink-0">{I.verified}</div>
                   </div>
                 </div>

                 {/* ADVANCED CONTROLS */}
                <div className="space-y-8">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-white/40 uppercase font-mono">
                         <span>{formatTime(currentTime)}</span>
                         <span>{formatTime(duration)}</span>
                      </div>
                      <input type="range" value={progress} onChange={handleSeek} className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-neon-blue" />
                   </div>

                   <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col items-center gap-2 group/vol">
                         <div className="w-6 h-6 text-white/20 group-hover/vol:text-neon-blue transition-colors">{I.volume}</div>
                         <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-blue" />
                      </div>

                      <button onClick={togglePlay} className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-neon-pink text-white scale-110 shadow-neon-pink/40' : 'bg-white text-black hover:scale-105 active:scale-95'}`}>
                         {isPlaying ? <div className="w-10 h-10">{I.pause}</div> : <div className="w-10 h-10 ml-1">{I.play}</div>}
                      </button>

                      <div className="flex flex-col items-center gap-2 group/speed">
                          <div className="w-5 h-5 text-white/20">{I.speed}</div>
                          <button 
                            onClick={() => setPlaybackRate(r => r >= 2 ? 1 : r + 0.5)}
                            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[10px] font-black text-white hover:bg-neon-blue hover:text-black transition-all"
                          >
                             {playbackRate}x
                          </button>
                         <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">VELOCIDAD</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => showAlert('CONTENIDO NO DISPONIBLE', 'Las letras no están disponibles en la beta.', 'info')} className="h-14 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/20 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest group">
                         <div className="w-4 h-4">{I.lyrics}</div> LYRICS
                      </button>
                      <button onClick={() => showAlert('CONTENIDO NO DISPONIBLE', 'El video no está disponible en la beta.', 'info')} className="h-14 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-white/20 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest group">
                         <div className="w-4 h-4">{I.video}</div> VIDEO
                      </button>
                   </div>

                   <div className="flex flex-col gap-3">
                      <Link href={`/play?track=${selectedTrack.id}`} className="w-full h-16 bg-neon-blue text-black rounded-2xl flex items-center justify-center gap-4 font-header font-black uppercase tracking-widest italic shadow-neon-blue/20 hover:scale-[1.02] active:scale-95 transition-all">
                         <div className="w-6 h-6">{I.play}</div> JUGAR AHORA
                      </Link>
                       <button onClick={() => handleDownload(selectedTrack)} className="w-full h-14 bg-white/5 border border-white/10 text-white/40 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                         <div className="w-5 h-5">{I.download}</div> DESCARGAR TRACK
                       </button>
                      <button 
                         onClick={() => {
                           if (selectedTrack.on_soundcloud) {
                             window.open('https://soundcloud.com/ciszuko-antony', '_blank');
                           } else {
                             showAlert('SINCRONIZACIÓN EXTERNA', 'Este track no está disponible en SoundCloud aún.', 'info');
                           }
                         }}
                         className="w-full h-14 bg-orange-600/10 border border-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all group"
                       >
                          <div className="w-5 h-5 group-hover:scale-110 transition-transform">{I.soundcloud}</div> VER EN SOUNDCLOUD
                       </button>
                   </div>
                </div>

                <div className="mt-12 pt-10 border-t border-white/5 space-y-6">
                   <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'ÁLBUM', val: selectedTrack.album, icon: 'album', color: 'blue' },
                        { label: 'BPM', val: selectedTrack.bpm, icon: 'zap', color: 'blue' },
                        { label: 'Release', val: selectedTrack.release_date, icon: 'date', color: 'purple' },
                        { label: 'Plays', val: realStats[selectedTrack.id]?.plays || 0, icon: 'activity', color: 'cyan' },
                        { label: 'Likes', val: likesCount[selectedTrack.id] || 0, icon: 'heart', color: 'pink' },
                        { label: 'Dificultad', val: selectedTrack.difficulty, icon: 'target', color: 'pink' },
                      ].map(s => (
                        <div key={s.label} className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center gap-1 group/spec">
                           <div className={`w-4 h-4 text-neon-${s.color} mb-1 group-hover/spec:scale-110 transition-transform`}>{(I as any)[s.icon]}</div>
                           <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">{s.label}</span>
                           <span className="text-xs font-black text-white italic truncate w-full text-center">{s.val}</span>
                        </div>
                      ))}
                   </div>
                   <p className="text-[8px] text-white/10 font-black uppercase text-center">{selectedTrack.copyright}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <AuthWarningModal isOpen={isAuthWarningOpen} onClose={() => setIsAuthWarningOpen(false)} />
        <QuickDocks />
      </div>

      {/* ALERT MODAL */}
      <AnimatePresence>
        {alert.show && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAlert({...alert, show: false})} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }} className={`relative w-full max-w-sm bg-black border-2 ${alert.type === 'error' ? 'border-neon-red' : 'border-neon-blue'} p-10 rounded-[3rem] text-center space-y-6 shadow-2xl`}>
               <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${alert.type === 'error' ? 'bg-neon-red/10 text-neon-red' : 'bg-neon-blue/10 text-neon-blue'}`}>
                  <div className="w-10 h-10">{alert.type === 'error' ? I.lock : I.info}</div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-header font-black text-white uppercase italic">{alert.title}</h3>
                  <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest leading-relaxed">{alert.message}</p>
               </div>
               <button onClick={() => setAlert({...alert, show: false})} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white hover:text-black transition-all">ENTENDIDO</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Download Notification */}
      <AnimatePresence>
        {downloadNotif && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a14]/95 border border-emerald-500/40 px-6 py-5 rounded-2xl shadow-[0_4px_40px_rgba(52,211,153,0.35)] backdrop-blur-md flex items-center gap-4 pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <div>
                <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">DESCARGANDO</p>
                <p className="text-white/80 font-bold text-xs mt-0.5">{downloadNotif}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => setIsPlaying(false)} 
        preload="auto"
        className="hidden" 
      />
    </MainLayout>
  );
}

export default function Library() {
  usePageTitle('LIBRARY');
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LibraryContent />
    </React.Suspense>
  );
}
