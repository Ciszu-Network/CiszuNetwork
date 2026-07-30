'use client';

import React from 'react';
import { Icon, IconButton, IconList, ICON_NAMES } from '@ciszu/ui';

/**
 * Ejemplo de uso del nuevo sistema de iconos de Ciszu Network
 * 
 * Este componente demuestra cómo usar los iconos en MuzicMania
 */

export function CiszuIconExample() {
  const [selectedIcon, setSelectedIcon] = React.useState<string>(ICON_NAMES.HOME);
  const [iconStyle, setIconStyle] = React.useState<'outline' | 'filled' | 'flag'>('outline');
  const [iconSize, setIconSize] = React.useState<number>(32);

  // Iconos de navegación comunes para MuzicMania
  const navigationIcons = [
    ICON_NAMES.HOME,
    ICON_NAMES.SEARCH,
    ICON_NAMES.PLAY,
    ICON_NAMES.MUSIC,
    ICON_NAMES.USER,
    ICON_NAMES.SETTINGS,
    ICON_NAMES.HEART,
    ICON_NAMES.STAR,
  ];

  // Iconos de acciones del juego
  const gameActionIcons = [
    'play-circle',
    'pause-circle',
    'stop-circle',
    'skip-forward',
    'skip-back',
    'volume',
    'mute',
    'headphones',
  ];

  // Iconos sociales
  const socialIcons = [
    ICON_NAMES.DISCORD,
    ICON_NAMES.WHATSAPP,
    'twitter',
    'youtube',
    'instagram',
    'facebook',
    'github',
  ];

  return (
    <div className="ciszu-icon-example p-6 bg-gray-900 text-white rounded-lg">
      <h1 className="text-2xl font-bold mb-6">🎨 Sistema de Iconos de Ciszu Network</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ejemplo Individual</h2>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gray-800 rounded">
            <Icon 
              name={selectedIcon}
              style={iconStyle}
              size={iconSize}
              color="#4F46E5"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div>
              <label className="block text-sm mb-1">Icono:</label>
              <select 
                value={selectedIcon}
                onChange={(e) => setSelectedIcon(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                {Object.values(ICON_NAMES).map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Estilo:</label>
              <div className="flex gap-2">
                {(['outline', 'filled', 'flag'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => setIconStyle(style)}
                    className={`px-3 py-1 rounded ${iconStyle === style ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Tamaño: {iconSize}px</label>
              <input
                type="range"
                min="16"
                max="64"
                value={iconSize}
                onChange={(e) => setIconSize(parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IconButton Examples</h2>
        <div className="flex flex-wrap gap-4">
          <IconButton
            name={ICON_NAMES.PLAY}
            label="Reproducir"
            size={20}
            onClick={() => alert('Reproducir!')}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
          />
          
          <IconButton
            name={ICON_NAMES.SETTINGS}
            label="Configuración"
            size={20}
            onClick={() => alert('Configuración!')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          />
          
          <IconButton
            name={ICON_NAMES.HEART}
            label="Favoritos"
            size={20}
            onClick={() => alert('Añadido a favoritos!')}
            className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded"
          />
          
          <IconButton
            name={ICON_NAMES.DOWNLOAD}
            label="Descargar"
            size={20}
            onClick={() => alert('Descargando...')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IconList - Navegación</h2>
        <IconList
          icons={navigationIcons}
          style="outline"
          size={28}
          spacing={12}
          align="center"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IconList - Acciones del Juego</h2>
        <IconList
          icons={gameActionIcons}
          style="filled"
          size={32}
          spacing={16}
          align="center"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">IconList - Redes Sociales</h2>
        <IconList
          icons={socialIcons}
          style="filled"
          size={24}
          spacing={20}
          align="center"
        />
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2">💡 Cómo usar en tu código:</h3>
        <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
{`// Importación básica
import { Icon } from '@ciszu/ui';

// Uso simple
<Icon name="home" size={24} color="#333" />

// Con estilo diferente
<Icon name="search" style="filled" size={32} />

// IconButton con texto
<IconButton 
  name="play" 
  label="Reproducir" 
  onClick={() => console.log('Play!')}
/>

// Lista de iconos
<IconList 
  icons={['home', 'search', 'user', 'settings']}
  size={24}
  spacing={8}
/>`}
        </pre>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <p>✅ Sistema de iconos completamente funcional</p>
        <p>✅ Soporta múltiples estilos y tamaños</p>
        <p>✅ Integración con CDN automática</p>
        <p>✅ Componentes listos para producción</p>
      </div>
    </div>
  );
}

// Componente de migración para reemplazar iconos inline antiguos
export function MigrateInlineIcons({ children }: { children: React.ReactNode }) {
  return (
    <div className="migration-notice p-4 border border-yellow-600 bg-yellow-900/20 rounded">
      <div className="flex items-start gap-3">
        <Icon name="info" size={24} color="#FBBF24" />
        <div>
          <h4 className="font-semibold text-yellow-300">Migración de Iconos</h4>
          <p className="text-sm text-yellow-200/80">
            Este componente usa el nuevo sistema de iconos. 
            Los iconos antiguos inline deben ser migrados usando:
          </p>
          <code className="block mt-2 text-xs bg-black/30 p-2 rounded">
            node scripts/migrate-icons.js
          </code>
        </div>
      </div>
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

export default CiszuIconExample;