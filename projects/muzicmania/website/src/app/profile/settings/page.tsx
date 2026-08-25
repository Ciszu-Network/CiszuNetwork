'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/config/supabase';
import { Icon, useToast } from '@ciszu/ui';
import AvatarUploadModal from '@/components/profile/AvatarUploadModal';
import Image from 'next/image';
import { usePageTitle } from '@/lib/usePageTitle';


export default function ProfileSettingsPage() {
  usePageTitle('SETTINGS');
  const { user,  setUser,  isHydrated } = useAppStore();
  const { toast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('account');
  const [showUUID, setShowUUID] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) {
      router.push('/login?redirect=/profile/settings');
    }
  }, [user, isHydrated, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (data) {
          setProfileData(data);
          setBio(data.bio || '');
        }
      }
    };
    fetchProfile();
  }, [user]);

  if (!isHydrated || !user || !profileData) return null;

  const tabs = [
    { id: 'account', label: 'Cuenta', icon: <Icon name="user" size={16} /> },
    { id: 'security', label: 'Seguridad', icon: <Icon name="shield" size={16} /> },
    { id: 'privacy', label: 'Privacidad', icon: <Icon name="lock" size={16} /> },
    { id: 'notifications', label: 'Notificaciones', icon: <Icon name="bell" size={16} /> },
    { id: 'info', label: 'Información', icon: <Icon name="info" size={16} /> },
    { id: 'danger', label: 'Zona de Peligro', icon: <Icon name="warning" size={16} />, color: 'text-red-400' },
    { id: 'help', label: 'Ayuda / FAQ', icon: <Icon name="help" size={16} /> },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast('[SISTEMA]: Sesión finalizada');
    router.push('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-neon-blue italic tracking-tighter">DATOS DE CUENTA</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Configuración base de tu identidad.</p>
            </div>
            
            <div className="space-y-6">
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Foto de Perfil</label>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 rounded-full bg-black border-2 border-white/20 overflow-hidden group">
                    {profileData.avatar_url ? (
                      <Image src={profileData.avatar_url} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-3xl font-header font-black text-neon-cyan">
                        {user.display_name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button 
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon name="camera" size={24} className="text-white" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest max-w-xs">
                      Sube una imagen para personalizar tu identidad. La imagen se recortará a un círculo.
                    </p>
                    <button onClick={() => setIsAvatarModalOpen(true)} className="px-4 py-2 bg-white/10 text-white font-bold text-xs uppercase rounded-lg border border-white/20 hover:bg-white/20 transition-all">
                      Cambiar Foto
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Nombre de Usuario</label>
                  <span className="text-[9px] font-bold text-gray-500 bg-black/50 px-3 py-1 rounded-full border border-white/10">Cambiable en 14 días</span>
                </div>
                <div className="flex gap-4">
                  <input type="text" defaultValue={`@${user.username}`} disabled className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold opacity-50" />
                  <button disabled className="px-6 py-3 bg-neon-blue/20 text-neon-blue font-bold text-xs uppercase rounded-xl border border-neon-blue/30 opacity-50 cursor-not-allowed">Cambiar</button>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Biografía</label>
                  <span className="text-[9px] font-bold text-gray-500">{bio.length}/160</span>
                </div>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={160}
                  placeholder="Cuéntale a la comunidad sobre ti..."
                  className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-bold resize-none h-24 placeholder:text-gray-700"
                />
                <div className="flex justify-end">
                  <button 
                    disabled={isSavingBio || bio === (profileData.bio || '')}
                    onClick={async () => {
                      setIsSavingBio(true);
                      await supabase.from('profiles').update({ bio }).eq('id', user.id);
                      setProfileData({ ...profileData, bio });
                      setIsSavingBio(false);
                      toast('[SISTEMA]: Biografía actualizada.');
                    }}
                    className="px-6 py-2 bg-neon-blue/20 text-neon-blue font-bold text-xs uppercase rounded-lg border border-neon-blue/30 hover:bg-neon-blue hover:text-black transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Icon name="check" size={16} /> {isSavingBio ? 'Guardando' : 'Guardar Biografía'}
                  </button>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Email & Teléfono</label>
                <div className="space-y-3">
                  <div className="flex gap-4 items-center">
                    <input type="email" defaultValue={user.email} disabled className="flex-1 bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold" />
                    <button className="px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase rounded-xl border border-white/20 hover:bg-white/20 transition-all">Verificar Nuevo</button>
                  </div>
                  <div className="flex gap-4 items-center">
                    <input type="tel" placeholder="Añadir teléfono para mayor seguridad" disabled className="flex-1 bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold placeholder:text-gray-700" />
                    <button className="px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase rounded-xl border border-white/20 hover:bg-white/20 transition-all">Añadir</button>
                  </div>
                </div>
              </div>
            </div>
            
            <AvatarUploadModal 
              isOpen={isAvatarModalOpen}
              onClose={() => setIsAvatarModalOpen(false)}
              userId={user.id}
              onUploadSuccess={(url) => {
                setProfileData({ ...profileData, avatar_url: url });
                setUser({ ...user, avatar_url: url });
                toast('[SISTEMA]: Avatar actualizado correctamente.');
              }}
            />
          </div>
        );

      case 'security':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-neon-cyan italic tracking-tighter">SEGURIDAD</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Protege tu cuenta de accesos no autorizados.</p>
            </div>

            <div className="space-y-6">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-white mb-2">
                  <Icon name="key" size={20} className="text-neon-cyan" />
                  <h3 className="font-header font-black uppercase text-sm">Cambiar Contraseña</h3>
                </div>
                <div className="space-y-3">
                  <input type="password" placeholder="Contraseña Antigua" className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold" />
                  <input type="password" placeholder="Nueva Contraseña" className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold" />
                  <input type="password" placeholder="Repetir Nueva Contraseña" className="w-full bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-white font-header font-bold" />
                  <button className="w-full py-3 bg-neon-cyan/20 text-neon-cyan font-bold text-xs uppercase rounded-xl border border-neon-cyan/30 hover:bg-neon-cyan hover:text-black transition-all">Actualizar Contraseña</button>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="font-header font-black uppercase text-sm text-white mb-1">Autenticación de 2 Factores (2FA)</h3>
                  <p className="text-[10px] text-gray-500 font-bold">Añade una capa extra de seguridad vía Email o SMS.</p>
                </div>
                <button className="px-6 py-3 bg-white/10 text-white font-bold text-xs uppercase rounded-xl border border-white/20 hover:bg-white/20 transition-all">Activar</button>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-header font-black uppercase text-sm text-white">Dispositivos Conectados</h3>
                  <button 
                    onClick={async () => {
                      await supabase.auth.signOut({ scope: 'others' });
                      toast('[SISTEMA]: Sesiones en otros dispositivos cerradas.');
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:underline transition-all"
                  >
                    Cerrar otras sesiones
                  </button>
                </div>
                
                {/* Dispositivo Actual */}
                <div className="flex items-center justify-between p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-neon-cyan/20 blur-2xl group-hover:bg-neon-cyan/30 transition-all" />
                  <div className="flex items-center gap-4 relative z-10">
                    <Icon name="monitor" size={32} className="text-neon-cyan drop-shadow-sm" />
                    <div>
                      <div className="text-white font-black text-sm uppercase">Este Dispositivo</div>
                      <div className="text-neon-cyan text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
                        Sesión Actual (Navegador)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Otros dispositivos (Simulado visualmente hasta tener tracking en BD) */}
                <div className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-xl group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Icon name="smartphone" size={32} className="text-gray-500 group-hover:text-white transition-colors" />
                    <div>
                      <div className="text-gray-300 font-black text-sm uppercase">Dispositivo Móvil</div>
                      <div className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Requiere configuración backend para listar historiales</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toast('[SISTEMA]: Utiliza "Cerrar otras sesiones" para forzar la desconexión.')}
                    className="px-4 py-2 bg-red-500/10 text-red-400 font-bold text-[10px] uppercase rounded-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    Desconectar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-neon-purple italic tracking-tighter">PRIVACIDAD</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Controla quién puede ver tu actividad.</p>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-header font-black uppercase text-sm text-white mb-1">Visibilidad de Cuenta</h3>
                    <p className="text-[10px] text-gray-500 font-bold">Las cuentas privadas no aparecen en las leaderboards ni buscadores.</p>
                  </div>
                  <select disabled className="bg-black border border-white/20 rounded-xl px-4 py-2 text-white font-header font-bold text-xs outline-none cursor-not-allowed opacity-50">
                    <option>Pública (Obligatorio en Beta)</option>
                    <option>Privada</option>
                  </select>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-header font-black uppercase text-sm text-white mb-1">Privacidad de Fecha de Nacimiento</h3>
                    <p className="text-[10px] text-gray-500 font-bold">Elige quién puede ver tu edad en el perfil público.</p>
                  </div>
                  <select 
                    value={profileData.birth_privacy || 'private'} 
                    onChange={async (e) => {
                      const newPrivacy = e.target.value;
                      setProfileData({ ...profileData, birth_privacy: newPrivacy });
                      await supabase.from('profiles').update({ birth_privacy: newPrivacy }).eq('id', user.id);
                      toast('[SISTEMA]: Privacidad de edad actualizada.');
                    }}
                    className="bg-black border border-white/20 rounded-xl px-4 py-2 text-white font-header font-bold text-xs outline-none hover:border-white/40 focus:border-neon-purple transition-all"
                  >
                    <option value="public">Público</option>
                    <option value="friends">Solo Amigos</option>
                    <option value="private">Nadie (Privado)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-yellow-500 italic tracking-tighter">NOTIFICACIONES</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Mantente al tanto de la comunidad.</p>
            </div>
            <div className="space-y-2">
              {['Noticias y Actualizaciones (Push)', 'Nuevos retos y canciones (Email)', 'Alertas de Seguridad (Ambos)'].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                  <span className="text-sm font-bold text-white uppercase">{item}</span>
                  <input type="checkbox" defaultChecked className="w-5 h-5 accent-yellow-500" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-white italic tracking-tighter">INFORMACIÓN DETALLADA</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Datos técnicos de tu identidad digital.</p>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Fecha de Creación</label>
                  <div className="text-white font-bold text-sm">Registrado hace poco (Fase Beta)</div>
                </div>
                <div>
                  <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-1">Estado de Cuenta</label>
                  <div className="text-neon-green font-bold text-sm uppercase">Activa & Verificada</div>
                </div>
              </div>

              <div>
                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest block mb-2">Identificador Único (UUID)</label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1 bg-black/80 border border-white/10 rounded-xl px-5 py-3 text-gray-400 font-mono text-sm tracking-widest">
                    {showUUID ? user.id : '••••••••-••••-••••-••••-••••••••••••'}
                  </div>
                  <button onClick={() => setShowUUID(!showUUID)} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
                    {showUUID ? <Icon name="eye-off" size={20} /> : <Icon name="eye" size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-white/20 text-white hover:border-white/50 hover:bg-white/5 transition-all">
              <Icon name="download" size={24} />
              <div>
                <div className="font-header font-black uppercase tracking-widest">Solicitar Descarga de Datos</div>
                <div className="text-[10px] text-gray-400">Recibe un archivo con todo tu historial, scores y configuraciones.</div>
              </div>
            </button>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-neon-blue italic tracking-tighter">AYUDA Y SOPORTE</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Recursos y políticas de MuzicMania.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Términos de Servicio', 'Política de Privacidad', 'FAQ del Juego', 'Contactar al Soporte', 'Manual de Atajos', 'Reportar un Bug'].map((item, i) => (
                <button key={i} className="p-6 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-neon-blue/50 transition-all group">
                  <div className="text-white font-header font-black uppercase text-sm group-hover:text-neon-blue">{item}</div>
                  <div className="text-[10px] text-gray-500 mt-2">Leer artículo completo →</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-10 relative z-10">
            <div>
              <h2 className="text-2xl font-header font-black text-red-500 italic tracking-tighter">ZONA DE PELIGRO</h2>
              <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-1">Acciones destructivas para tu cuenta.</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-red-400 font-header font-black uppercase">Desactivar Cuenta</h3>
                  <p className="text-gray-500 text-[10px] uppercase font-bold mt-1 max-w-sm">
                    Oculta tu perfil y récords. Puedes reactivarla iniciando sesión nuevamente.
                  </p>
                </div>
                <button className="px-6 py-3 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">
                  Desactivar
                </button>
              </div>

              <div className="p-6 border border-red-500/50 bg-red-500/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-red-500 font-header font-black uppercase text-lg">Eliminar Cuenta Permanentemente</h3>
                  <p className="text-gray-400 text-[10px] uppercase font-bold mt-1 max-w-sm">
                    Tus datos se borrarán, pero se conservará tu ID (UUID) anónimamente por integridad de la base de datos. Tienes 1 semana para deshacer esta acción si te arrepientes.
                  </p>
                </div>
                <button className="px-6 py-3 bg-red-500 text-white font-black text-xs uppercase rounded-xl hover:bg-red-600 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                  Borrar Cuenta
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-neon-purple/5 rounded-full blur-[150px] animate-pulse" />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 pb-32">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Icon name="settings" size={24} />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-header font-black uppercase tracking-tighter text-white">
                CONFIGURACIÓN
              </h1>
              <p className="text-neon-cyan font-black tracking-[0.2em] uppercase text-[10px]">
                Ajustes del Ecosistema MuzicMania
              </p>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex flex-col gap-2 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-header font-bold uppercase tracking-widest text-xs transition-all group
                  ${activeTab === tab.id 
                    ? `bg-white/10 text-white border border-white/20 shadow-lg ${tab.color || ''}` 
                    : `bg-transparent text-gray-500 hover:bg-white/5 hover:text-white border border-transparent`
                  }
                `}
              >
                <div className={`${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  {tab.icon}
                </div>
                {tab.label}
              </button>
            ))}
            
            <div className="pt-8 mt-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-header font-black uppercase tracking-widest text-xs bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95 border border-red-500/20"
              >
                <Icon name="logout" size={16} />
                CERRAR SESIÓN
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 w-full">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-[#050505] border border-white/5 rounded-[3rem] p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <QuickDocks />
      </div>
    </MainLayout>
  );
}
