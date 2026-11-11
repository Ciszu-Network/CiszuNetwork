'use client';

import React from 'react';
import { useT } from '@/hooks/useT';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import LegalDocNav from '@/components/molecules/LegalDocNav';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library ---
const I = {
  policy: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="3"/></svg>,
  eye: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
};

const POLICY_ARTICLES = [
  { id: 1, title: "COMPROMISO DE PRIVACIDAD Y ÉTICA DE DATOS", content: "MuzicMania se compromete a proteger la privacidad de sus usuarios mediante el cumplimiento de normativas aplicables de protección de datos. Nuestra prioridad es garantizar que tu experiencia rítmica sea segura y transparente. Esta política explica qué datos tratamos, para qué, con quién los compartimos y cómo puedes ejercer tus derechos." },
  { id: 2, title: "CATEGORÍAS DE DATOS RECOPILADOS", content: "Tratamos datos de identificación y cuenta (correo, nombre de usuario, identificador CISZU ID, avatar, biografía y país), datos técnicos (navegador, sistema operativo, dirección IP, registros de seguridad), datos de juego (puntuaciones, precisión, combos, dificultad, historial y récords), contenido que publicas (niveles, charts, textos y fotos), datos de compras (órdenes, MZP, promociones, reembolsos y retiros) y datos de anticheat. No solicitamos datos sensibles que no sean necesarios para el servicio." },
  { id: 3, title: "DATOS DE IDENTIFICACIÓN Y AUTENTICACIÓN", content: "El registro se gestiona mediante CISZU ID y Supabase Auth. Podemos usar correo y contraseña o proveedores OAuth (Google, Microsoft, Discord o Apple, según disponibilidad), que nos facilitan datos básicos de perfil como correo, nombre e identificador. Usamos esta información para autenticarte, verificar tu cuenta, recuperar el acceso y proteger la plataforma. Puedes activar la verificación por código temporal; los códigos expiran y los reenvíos están limitados." },
  { id: 4, title: "DATOS DE RENDIMIENTO Y LEADERBOARDS", content: "Tus puntuaciones, combos, precisión y récords se recopilan para generar rankings y estadísticas. El nombre de perfil, avatar, rango, nivel, XP y récords pueden ser públicos para fomentar la competencia. Puedes configurar la visibilidad de determinados datos desde tu cuenta; los rankings pueden conservar datos mínimos aunque ocultes tu perfil." },
  { id: 5, title: "CONTENIDO QUE PUBLICAS", content: "Si creas niveles o charts, tratamos el título, descripción, dificultad, BPM, notas y metadatos asociados. Si subes una foto de perfil, tratamos la imagen y sus metadatos técnicos. Este contenido puede ser visible públicamente. Eres responsable de no incluir datos personales de terceros ni contenido ilícito. Puedes solicitar la retirada de tu contenido conforme a esta política y a los Términos." },
  { id: 6, title: "COOKIES, ALMACENAMIENTO LOCAL Y ANALÍTICA", content: "Utilizamos cookies técnicas y sesión, y almacenamiento local para guardar ajustes de juego (volumen, offset, skins), preferencias de tema e idioma y datos de sesión. Podemos usar analítica agregada (Google Analytics 4 y PostHog) para entender el uso del servicio y mejorar la experiencia. No usamos cookies de publicidad de terceros. Puedes bloquear o eliminar cookies desde tu navegador; algunas funciones pueden dejar de estar disponibles." },
  { id: 7, title: "PAGOS, MZP Y DATOS FINANCIEROS", content: "Las compras de paquetes MZP se procesan con proveedores externos; actualmente mediante NOWPayments para criptomonedas. No almacenamos llaves privadas ni números completos de tarjeta. Tratamos identificadores de orden, estado, importe, promoción y datos necesarios para reembolsos o retiros. El proveedor puede aplicar verificación KYC/AML y tratar datos conforme a sus propias políticas. No vendemos tus datos financieros." },
  { id: 8, title: "DATOS DEL ANTICHEAT", content: "Ciszu Anti-Cheat recibe el resultado de la partida (puntuación, precisión, combo y dificultad) y lo contrasta en el servidor con tu historial. Generamos señales, puntuaciones internas, sanciones y strikes en un esquema restringido. No instalamos controladores a nivel de kernel, no escaneamos archivos o procesos de tu dispositivo y no capturamos teclas fuera del juego. Los datos se usan exclusivamente para integridad, seguridad, auditoría y apelaciones." },
  { id: 9, title: "NOTIFICACIONES Y PREFERENCIAS", content: "Tratamos tus preferencias de notificaciones para enviarte avisos in-app, correos transaccionales y, si lo activas, SMS. Estas comunicaciones pueden incluir seguridad, amistades, compras, reembolsos, sanciones, logros y cambios del servicio. Puedes gestionar las categorías no esenciales desde la configuración de tu cuenta." },
  { id: 10, title: "SEGURIDAD DE LA INFRAESTRUCTURA", content: "MuzicMania utiliza Supabase para autenticación, base de datos y almacenamiento, con cifrado en tránsito mediante SSL/TLS y cifrado en reposo del proveedor. Aplicamos control de acceso, RLS, rate limits, registros de seguridad y revisión de dependencias. Ningún sistema es infalible; si detectamos un incidente que afecte datos personales, lo investigaremos y notificaremos conforme a la ley aplicable." },
  { id: 11, title: "COMPARTICIÓN CON PROVEEDORES", content: "Compartimos datos mínimos con proveedores que nos ayudan a operar: Supabase (base de datos, auth y storage), Vercel (hosting), GitHub (distribución y actualizaciones), NOWPayments (pagos cripto), proveedores de email/SMS, Sentry (errores), PostHog/Google Analytics (analítica agregada) y servicios de soporte. Exigimos que traten los datos solo para las finalidades contratadas y conforme a sus políticas. Podemos divulgar datos si la ley lo exige o para proteger derechos y seguridad." },
  { id: 12, title: "NO COMERCIALIZACIÓN DE INFORMACIÓN PERSONAL", content: "MuzicMania no vende, alquila ni comercializa datos personales con terceros. La publicidad propia no se basa en vender tu identidad. Cualquier analítica publicitaria se realiza de forma agregada y no se vincula a datos sensibles." },
  { id: 13, title: "RETENCIÓN Y ELIMINACIÓN", content: "Conservamos tus datos mientras tu cuenta esté activa y durante el tiempo necesario para cumplir obligaciones legales, resolver disputas, prevenir fraude y mantener la seguridad. Puedes solicitar la eliminación desde la configuración de tu cuenta. Algunos registros técnicos, sanciones, compras o reclamaciones pueden conservarse bloqueados durante los plazos legales aplicables. La eliminación no afecta a datos agregados o anonimizados que ya no permitan identificarte." },
  { id: 14, title: "DERECHOS DEL USUARIO", content: "Según tu jurisdicción, puedes ejercer derechos de acceso, rectificación, eliminación, oposición, limitación, portabilidad y retirada del consentimiento. Puedes actualizar gran parte de tu información desde la configuración de tu cuenta. Para solicitudes que no puedas resolver desde la web, escribe a ciszunetwork@outlook.com indicando el derecho que ejerces y el correo asociado. Podemos pedirte información adicional para verificar tu identidad." },
  { id: 15, title: "TRANSFERENCIAS INTERNACIONALES", content: "Nuestros proveedores pueden procesar datos fuera de tu país, incluidos Estados Unidos y la Unión Europea. Aplicamos medidas contractuales y de seguridad razonables para proteger la información conforme a la ley aplicable. Al usar el servicio aceptas estas transferencias necesarias para su funcionamiento." },
  { id: 16, title: "MENORES DE EDAD", content: "MuzicMania no está dirigido a menores que no puedan consentir el tratamiento de sus datos conforme a la ley de su país. Las compras, retiros y funciones financieras requieren mayoría de edad. Si eres padre o tutor y crees que un menor nos proporcionó datos sin consentimiento, contacta a ciszunetwork@outlook.com para revisar y, cuando corresponda, eliminar la información." },
  { id: 17, title: "CAMBIOS Y CONTACTO DEL OFICIAL DE PRIVACIDAD", content: "Podemos actualizar esta política por cambios legales, técnicos o de producto. Publicaremos la nueva fecha y, cuando sea relevante, un aviso. El uso continuado implica aceptación. Para dudas, reclamaciones o solicitudes relacionadas con tus datos, contacta al responsable de privacidad de Ciszu Network en ciszunetwork@outlook.com o mediante el soporte oficial de la web o Discord." },
  { id: 18, title: "CUENTAS: VERIFICACIÓN, ELIMINACIÓN Y RETENCIÓN", content: "El registro exige verificación por código temporal (C-XXX XXX) enviado a tu correo: sin completarla, la cuenta no se activa; cada código expira en 3 horas y los reenvíos están limitados por seguridad. Cada inicio de sesión puede exigir un código temporal, desactivable desde la configuración de tu cuenta. Eliminar la cuenta (Danger Zone) NO borra los datos de inmediato: suspende la cuenta 15 días (deindexada y anonimizada públicamente: bio reemplazada, avatar estándar e historiales ocultos; con respaldo) y podrás recuperarla iniciando sesión en ese plazo (al recuperarla, no podrás eliminarla de nuevo durante 30 días). Si no la recuperas, pasados los 15 días se eliminan credenciales y validación de acceso, pero el identificador (UUID), el correo, el contenido y las sanciones permanecen vinculados internamente por seguridad y trazabilidad; el correo podrá reutilizarse para una cuenta nueva con un aviso. Puntuaciones, logros y guardados pueden permanecer visibles según tu configuración. Las sanciones (baneos, mutes) permanecen ligadas al identificador aunque se elimine la cuenta. Borrado definitivo de contenido concreto: ciszunetwork@outlook.com." },
];

export default function PolicyPage() {
  const t = useT();
  usePageTitle('PRIVACY');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <MainLayout>
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neon-pink/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-purple/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={itemVariants} className="relative space-y-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-1">
             <div className="flex items-center justify-center gap-6 group">
                <div className="w-12 h-12 text-neon-pink flex items-center justify-center">
                   {I.policy}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-pink via-white to-neon-pink bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  PRIVACIDAD
                </h1>
             </div>
             <p className="text-neon-pink font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               {t.pages.misc.policyHero}
             </p>
          </div>
        </motion.header>

        {/* --- DOCUMENT CONTAINER --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative bg-doc-dark border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl overflow-hidden"
        >
          {/* Subtle Document Lines */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
               style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px)', backgroundSize: '100% 3rem' }} />

          <div className="relative space-y-12">
            
            <div className="flex items-center gap-4 pb-8 border-b border-white/5 opacity-50">
               <div className="w-8 h-8 text-white/20">{I.eye}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{t.pages.misc.policyDoc}</span>
            </div>

            <div className="space-y-10">
              {POLICY_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-pink font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-pink transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-pink/30">
                        {art.content}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Footer Sign-off */}
            <div className="pt-16 mt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <div className="space-y-1 text-center md:text-left">
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">{t.pages.misc.policySection}</p>
                 <p className="text-[9px] font-bold text-gray-500 italic">{t.pages.misc.policyUpdated}</p>
               </div>
               <div className="w-24 h-1 bg-neon-pink/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <LegalDocNav />

        <QuickDocks />

      </div>
    </MainLayout>
  );
}

