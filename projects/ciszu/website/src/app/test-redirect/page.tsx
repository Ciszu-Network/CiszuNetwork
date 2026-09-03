'use client';
import Link from 'next/link';

/* ------------------------------------------------------------------ *
 * Página de prueba del sistema de redireccionamiento
 * ------------------------------------------------------------------ */

export default function TestRedirectPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-400">Prueba del Sistema de Redireccionamiento</h1>
        
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Enlaces de prueba</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">1. Enlace externo con target="_blank" (redes sociales)</h3>
                <a 
                  href="https://github.com/Ciszu-Network" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  GitHub (debería mostrar aviso)
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">2. Enlace externo sin target="_blank"</h3>
                <a 
                  href="https://google.com" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Google (debería mostrar aviso)
                </a>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">3. Enlace interno (no debería mostrar aviso)</h3>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Inicio (no debería mostrar aviso)
                </Link>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">4. Enlace con onclick personalizado</h3>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Este es un test manual para ver si el interceptor funciona
                    const link = document.createElement('a');
                    link.href = 'https://youtube.com';
                    link.target = '_blank';
                    link.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Simular clic en enlace YouTube
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Estado del sistema</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Preferencia redirectGuard</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const prefs = JSON.parse(localStorage.getItem('ciszu_preferences') || '{}');
                      prefs.redirectGuard = true;
                      localStorage.setItem('ciszu_preferences', JSON.stringify(prefs));
                      alert('redirectGuard activado');
                    }}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Activar
                  </button>
                  
                  <button
                    onClick={() => {
                      const prefs = JSON.parse(localStorage.getItem('ciszu_preferences') || '{}');
                      prefs.redirectGuard = false;
                      localStorage.setItem('ciszu_preferences', JSON.stringify(prefs));
                      alert('redirectGuard desactivado');
                    }}
                    className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Desactivar
                  </button>
                  
                  <button
                    onClick={() => {
                      const prefs = JSON.parse(localStorage.getItem('ciszu_preferences') || '{}');
                      alert(`redirectGuard: ${prefs.redirectGuard !== false ? 'true (activo)' : 'false (inactivo)'}`);
                    }}
                    className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    Ver estado
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Resetear preferencias a defaults</h3>
                <button
                  onClick={() => {
                    const defaults = {
                      lang: 'es',
                      theme: 'dark',
                      zoom: 100,
                      tabMuted: false,
                      redirectGuard: true,
                      activityGuard: true,
                    };
                    localStorage.setItem('ciszu_preferences', JSON.stringify(defaults));
                    alert('Preferencias reseteadas a valores por defecto');
                  }}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Resetear a defaults
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Información</h2>
            <ul className="space-y-2 text-gray-300">
              <li>• El sistema RedirectGuard ya está montado en el layout principal</li>
              <li>• Valor por defecto de redirectGuard: <code className="text-blue-400">true</code> (activo)</li>
              <li>• Se puede desactivar en Preferencias → Navegación → "Aviso de redirección"</li>
              <li>• Debería aparecer un modal azul con cuenta regresiva de 3 segundos</li>
              <li>• Botones: CANCELAR y CONTINUAR (con cuenta regresiva)</li>
              <li>• Enlaces con target="_blank" abren en nueva pestaña</li>
              <li>• Enlaces sin target="_blank" redirigen en la misma pestaña</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}