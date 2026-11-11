'use client';

import React from 'react';
import { useT } from '@/hooks/useT';
import { motion } from 'framer-motion';
import MainLayout from '@/components/templates/MainLayout';
import QuickDocks from '@/components/molecules/QuickDocks';
import LegalDocNav from '@/components/molecules/LegalDocNav';
import { LegalCiszuLink, SupportPolicy } from '@ciszu/ui';
import { usePageTitle } from '@/lib/usePageTitle';

// --- Icons Library ---
const I = {
  terms: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  balance: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 10a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M3 6h18"/><path d="M12 2v4"/></svg>,
};

const TERMS_ARTICLES = [
  { id: 1, title: "ACUERDO VINCULANTE DE USO", content: "Al acceder, registrarse o utilizar MuzicMania, usted acepta quedar vinculado legalmente por los términos y condiciones de este documento. Este contrato rige toda interacción entre el usuario y la plataforma oficial de la Red Ciszu." },
  { id: 2, title: "REQUISITOS DE EDAD Y CAPACIDAD", content: "El juego base está disponible para usuarios con la capacidad legal mínima exigida en su país. Las compras con dinero real (paquetes MZP, cosméticos, suscripciones o propinas), los retiros y las funciones sujetas a verificación requieren ser mayor de 18 años y aceptar las condiciones de compra. Los menores de edad solo podrán usar funciones con registro bajo consentimiento verificable de sus padres o tutores y no podrán realizar compras ni retiros. Podemos solicitar confirmación de edad y suspender funciones si no se acredita." },
  { id: 3, title: "REGISTRO Y RESPONSABILIDAD DE CUENTA", content: "Usted es el único responsable de mantener la seguridad y confidencialidad de sus credenciales de acceso. Cualquier actividad realizada bajo su perfil de MuzicMania se considerará efectuada por usted directamente. Debe notificar de inmediato cualquier acceso no autorizado." },
  { id: 4, title: "USO PERMITIDO DEL SOFTWARE", content: "MuzicMania otorga una licencia limitada para el uso recreativo de su plataforma. Queda estrictamente prohibido el uso de la misma para fines ilícitos, spam, distribución de malware o cualquier actividad que degrade el servicio." },
  { id: 5, title: "CÓDIGO DE CONDUCTA (REGLAS DE ORO)", content: "Los usuarios deben adherirse a los principios de Fair Play descritos en la sección de Reglas. El acoso, la discriminación y la toxicidad en los espacios comunitarios resultarán en la terminación inmediata del servicio." },
  { id: 6, title: "PROPIEDAD INTELECTUAL Y DERECHOS DE AUTOR", content: "Todo el código fuente, diseño de interfaz, artes gráficos, logotipos, bases de datos y demás materiales oficiales son propiedad exclusiva de Ciszu Network y Ciszuko Antony. La música de la biblioteca se utiliza bajo licencias NCS, Creative Commons o acuerdos directos con sus autores. Los niveles, charts y fotos aportados por la comunidad se rigen por el Artículo 22. Las marcas y contenidos de terceros pertenecen a sus respectivos titulares." },
  { id: 7, title: "LICENCIA DE USUARIO FINAL (EULA)", content: "El acceso a MuzicMania no constituye una venta de su software. Se le concede una licencia revocable, no exclusiva e intransferible para ejecutar el cliente del juego dentro de los navegadores compatibles." },
  { id: 8, title: "BIENES VIRTUALES Y PROGRESIÓN", content: "Los MuziPoints (MZP), ítems estéticos y demás bienes virtuales constituyen una licencia limitada de uso dentro de MuzicMania; no son dinero, no representan un depósito ni otorgan derechos de propiedad. No tienen valor monetario fuera de la plataforma y no pueden venderse, canjearse o transferirse por medios externos, salvo las funciones de regalo habilitadas. El saldo y los ítems pueden ajustarse por errores técnicos, fraude, reembolsos, contracargos o cambios de catálogo, sin perjuicio de los derechos que correspondan por ley." },
  { id: 9, title: "DISPONIBILIDAD Y GARANTÍA DEL SERVICIO", content: "MuzicMania se proporciona 'TAL CUAL' y 'SEGÚN DISPONIBILIDAD'. No garantizamos que el servicio sea ininterrumpido o libre de errores; pueden existir mantenimientos, actualizaciones, caídas de terceros o causas de fuerza mayor. Trabajamos para restablecer el servicio en el menor tiempo razonable." },
  { id: 10, title: "LIMITACIÓN DE RESPONSABILIDAD LEGAL", content: "En la medida máxima permitida por la ley, MuzicMania y sus desarrolladores no serán responsables de daños indirectos, incidentales o consecuentes derivados del uso o la incapacidad de uso de la plataforma. Nada en estos términos excluye responsabilidades que no puedan limitarse legalmente." },
  { id: 11, title: "INDEMNIZACIÓN Y DEFENSA", content: "Usted acepta indemnizar y eximir de responsabilidad a Ciszu Network y Ciszuko Antony frente a cualquier reclamación, pérdida o gasto resultante de su incumplimiento de estos términos, del contenido que publique o del uso indebido del software, en la medida permitida por la ley." },
  { id: 12, title: "SUSPENSIÓN Y TERMINACIÓN", content: "Podemos suspender, limitar o eliminar cuentas y contenido por incumplimiento de estos términos, las reglas o las directrices, por fraude, riesgos de seguridad o requerimientos legales. Las sanciones del anticheat se rigen por el Artículo 23 y pueden apelarse. La terminación no extingue obligaciones pendientes ni derechos irrenunciables del consumidor. Los bienes virtuales no son reembolsables salvo que la ley o una decisión comercial expresa lo dispongan." },
  { id: 13, title: "LEGISLACIÓN VIGENTE Y RESOLUCIÓN DE CONFLICTOS", content: "Estos términos se rigen por las leyes aplicables en la República Bolivariana de Venezuela y, cuando corresponda, por las normas imperativas de protección al consumidor del país del usuario. Las partes intentarán resolver cualquier disputa de buena fe; de no lograrlo, podrán acudir a los tribunales competentes. Nada en este documento limita derechos que legalmente no puedan renunciarse." },
  { id: 14, title: "ANUNCIOS Y PUBLICIDAD", content: "MuzicMania muestra anuncios propios (promoción del ecosistema Ciszu Network) y, en el futuro, de terceros. Todos los anuncios son opcionales y cerrables, con temporizador visible y enlace a estos términos. Tras finalizar una partida pueden mostrarse anuncios con recompensa (la mitad de puntos extra); cerrarlos antes de tiempo conlleva la pérdida de la recompensa. Las impresiones, clics y cierres se miden de forma agregada (Google Analytics 4) para mejorar la relevancia; nunca vinculamos anuncios a datos sensibles." },
  { id: 15, title: "DATOS PARA RECOMENDACIÓN DE ANUNCIOS", content: "Para recomendar mejores anuncios, MuzicMania puede usar señales de audiencia agregadas (páginas visitadas, idioma del navegador, región aproximada) recogidas por Google Analytics 4. Estos datos se tratan de forma agregada y anónima; no se utilizan para identificar a una persona concreta más allá de lo necesario para el servicio. Puedes bloquear las cookies de análisis desde tu navegador o desde las preferencias del sitio." },
  { id: 16, title: "GEOLOCALIZACIÓN", content: "Podemos estimar tu ubicación aproximada (región/país) a partir de tu dirección IP para: (1) ofrecer contenido y anuncios relevantes a tu región, (2) cumplir requisitos legales locales y (3) mejorar la seguridad (detección de accesos sospechosos). La geolocalización precisa (GPS) solo se utiliza si una funcionalidad lo requiere explícitamente y con tu consentimiento; nunca se usa para anuncios." },
  { id: 17, title: "CUENTAS, CISZU ID Y AUTENTICACIÓN", content: "La creación de cuentas (CISZU ID) es opcional y sirve para sincronizar tu progreso, perfil y preferencias entre los servicios del ecosistema. Puedes registrarte con correo y contraseña o mediante proveedores OAuth habilitados (Google, Microsoft, Discord o Apple, según disponibilidad). Al crear una cuenta aceptas estos términos, eres responsable de mantener la confidencialidad de tus credenciales y de la actividad realizada con tu cuenta. Una cuenta es personal; no puedes venderla, alquilarla ni compartirla para manipular rankings. Puedes eliminar tu cuenta conforme a la Política de Privacidad. Podemos verificar identidad o edad para compras, retiros y soporte." },
  { id: 18, title: "COMUNICACIONES OFICIALES Y SOPORTE", content: "Toda notificación oficial respecto a estos términos se realizará mediante el canal general de Discord, la sección de anuncios de la web o el correo registrado. El soporte legal se gestiona únicamente vía correo electrónico corporativo." },
  { id: 19, title: "RESEÑAS Y CALIFICACIONES", content: "Las calificaciones públicas de MuzicMania incorporan una reseña base editorial de 5.0 para reflejar un estándar de calidad objetivo. Cuando no existen reseñas reales de usuarios, se muestra 5.0 y se indica expresamente que no hay reseñas para analizar. Cuando existen reseñas reales, la calificación pública es la media aritmética entre las reseñas de usuarios y la reseña base 5.0. No se falsifican reseñas de usuarios: todas las reseñas visibles son reales o, en su defecto, se muestra el estado de 'sin reseñas'." },
  { id: 20, title: "ECONOMÍA MZP, COMPRAS Y PAGOS", content: "Las compras se procesan mediante proveedores externos. Actualmente los paquetes MZP se adquieren con criptomonedas a través de NOWPayments; las tarjetas y PayPal pueden no estar disponibles. Los precios, redes, comisiones de red, tipo de cambio y disponibilidad varían. La orden se considera pagada cuando el proveedor confirma la transacción; las órdenes pendientes pueden expirar. No almacenamos llaves privadas ni datos completos de tarjetas. El proveedor puede aplicar verificación KYC/AML. Debes usar fondos lícitos y no realizar fraude, contracargos ni abuso de promociones. Los impuestos locales aplicables son responsabilidad del usuario." },
  { id: 21, title: "REEMBOLSOS, RETIROS Y PROMOCIONES", content: "Las solicitudes de reembolso o retiro se evalúan manualmente por el staff y pueden requerir verificación de identidad, datos de pago y revisión antifraude; no son automáticas ni están garantizadas. Solo se consideran dentro de los plazos y condiciones aplicables, y cuando la ley exija su procedencia. Los retiros, si están habilitados, se sujetan a reglas, mínimos, comisiones y disponibilidad del proveedor; MZP no es dinero. Los códigos promocionales y recompensas son de un uso por cuenta y no pueden obtenerse mediante multicuentas, bots o abuso. Podemos anular puntos o beneficios obtenidos irregularmente. Las compras de contenido digital pueden ser finales una vez acreditadas, salvo disposición legal en contrario." },
  { id: 22, title: "CONTENIDO DE USUARIO, NIVELES, FOTOS Y DERECHOS DE AUTOR", content: "Conservas la titularidad de tus niveles, charts, textos, imágenes y demás contenido original. Al publicarlo otorgas a Ciszu Network y MuzicMania una licencia mundial, no exclusiva, gratuita y revocable al retirar el contenido, para alojar, reproducir, mostrar y distribuir ese contenido dentro de la plataforma, su promoción y sus copias de seguridad. Declaras que eres autor o que cuentas con permisos y licencias suficientes. No puedes subir audio, charts, imágenes o marcas de terceros sin autorización; no se aceptan charts copiados, audio no licenciado ni contenido que infrinja derechos. Podemos retirar contenido y suspender cuentas reincidentes. Reclamaciones de copyright: ciszunetwork@outlook.com, indicando obra, URL, titularidad y declaración de buena fe." },
  { id: 23, title: "ANTICHEAT Y SANCIONES AUTOMÁTICAS", content: "MuzicMania utiliza Ciszu Anti-Cheat para proteger la integridad de los rankings. El cliente envía el resultado de la partida (puntuación, precisión, combo y dificultad); el servidor reconstruye el historial y evalúa señales ponderadas. El sistema no instala controladores a nivel de kernel, no escanea archivos o procesos del dispositivo y no captura teclas fuera del juego. Las señales y puntuaciones se guardan en un entorno restringido. Hasta superar el umbral, el sistema es invisible. Al superarlo, puede aplicar advertencia, silencio, bloqueo o eliminación de cuenta según gravedad e historial, con strikes. Las sanciones automáticas pueden apelarse en Soporte → Apelación de sanción y son revisadas por una persona. No garantizamos una detección perfecta; puedes reportar un falso positivo. La manipulación del cliente, la red, la memoria, la automatización o las cuentas múltiples está prohibida." },
  { id: 24, title: "NOTIFICACIONES Y COMUNICACIONES ELECTRÓNICAS", content: "Podemos enviar notificaciones dentro de la aplicación, por correo electrónico y, si las activas, por SMS, relativas a seguridad, amistades, compras, sanciones, reembolsos, retiros y cambios del servicio. Las comunicaciones transaccionales necesarias para la seguridad o el cumplimiento legal no pueden desactivarse. Puedes gestionar tus preferencias desde la configuración de la cuenta. Los avisos legales se publicarán en la web, por correo o en Discord." },
  { id: 25, title: "CONTACTO, CAMBIOS Y NULIDAD PARCIAL", content: "El contacto legal es ciszunetwork@outlook.com; el soporte técnico está disponible en la web y en Discord. Podemos modificar estos términos por cambios legales, técnicos o de producto; publicaremos la fecha de actualización y, cuando sea relevante, un aviso. El uso continuado después de la entrada en vigor implica aceptación. Si no aceptas los cambios, debes dejar de usar el servicio. Si alguna cláusula resulta inválida, las demás seguirán vigentes." },
];

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

export default function TermsPage() {
  const t = useT();
  usePageTitle('TERMS');
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
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-neon-orange/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-neon-yellow/5 rounded-full blur-[200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-0 pb-28 space-y-16">
        
        {/* --- HERO --- */}
        <motion.header id="hero" initial="hidden" animate="visible" variants={sectionVariants} className="relative space-y-8 pt-12">
          <div className="flex flex-col items-center gap-1 text-center">
             <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 text-neon-orange flex items-center justify-center">
                   {I.terms}
                </div>
                <h1 className="text-4xl md:text-8xl font-header font-black uppercase tracking-tighter leading-none transition-all group-hover:tracking-normal bg-gradient-to-r from-neon-orange via-neon-yellow to-neon-orange bg-clip-text text-transparent [-webkit-text-stroke:1px_black]">
                  {t.pages.misc.termsTitle}
                </h1>
             </div>
             <p className="text-neon-orange font-black tracking-[0.5em] uppercase text-[10px] md:text-xs">
               {t.pages.misc.termsHeroSub}
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
               <div className="w-8 h-8 text-white/20">{I.balance}</div>
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">{t.pages.misc.termsDoc}</span>
            </div>

            <div className="space-y-10">
              {TERMS_ARTICLES.map((art) => (
                <motion.article 
                  key={art.id}
                  id={art.id === 14 ? 'anuncios' : undefined}
                  variants={itemVariants}
                  className="group"
                >
                  <div className="flex gap-6 md:gap-8">
                    <div className="flex-shrink-0 pt-1">
                      <span className="text-neon-orange font-mono font-bold text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                        {art.id.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1 overflow-hidden">
                      <h2 className="text-xl font-header font-black text-white italic uppercase tracking-tighter group-hover:text-neon-orange transition-colors">
                        ART. {art.id}: {art.title}
                      </h2>
                      <p className="text-gray-400 font-bold leading-relaxed text-sm md:text-base selection:bg-neon-orange/30">
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
                 <p className="text-[10px] font-black uppercase tracking-widest text-white">{t.pages.misc.termsJuris}</p>
                  <p className="text-[9px] font-bold text-gray-500 italic">{t.pages.misc.termsUpdated}</p>
               </div>
               <div className="w-24 h-1 bg-neon-orange/50 rounded-full" />
            </div>

          </div>
        </motion.div>

        <LegalDocNav />

        <SupportPolicy mode="support" siteName="MuzicMania" />

        <QuickDocks />

        <LegalCiszuLink />

      </div>
    </MainLayout>
  );
}

