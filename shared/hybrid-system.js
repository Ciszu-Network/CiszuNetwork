
/**
 * Sistema híbrido local/CDN para Ciszu Network
 * 
 * Funcionalidad:
 * - Si no hay internet: usa archivos locales
 * - Si hay internet: usa CDN para archivos dinámicos
 * - Los iconos seleccionados siempre están compilados localmente
 * - Los iconos dinámicos se obtienen del CDN
 */

const fs = require('fs');
const path = require('path');

class HybridSystem {
  constructor(config = {}) {
    this.config = {
      mode: config.mode || 'hybrid', // 'hybrid', 'local', 'cdn'
      fallbackToLocal: config.fallbackToLocal !== false,
      cacheDir: config.cacheDir || './.hybrid-cache',
      localBase: config.localBase || './shared',
      cdnBase: config.cdnBase || 'https://cdn.ciszu.net',
      ...config
    };
    
    // Crear directorio de caché si no existe
    if (!fs.existsSync(this.config.cacheDir)) {
      fs.mkdirSync(this.config.cacheDir, { recursive: true });
    }
  }
  
  /**
   * Obtiene un recurso (icono, contenido, etc.)
   */
  async getResource(type, name, variant = 'outline') {
    const isOnline = await this.checkOnline();
    
    if (this.config.mode === 'local' || (this.config.mode === 'hybrid' && !isOnline)) {
      // Modo local o sin internet
      return this.getLocalResource(type, name, variant);
    }
    
    if (this.config.mode === 'cdn' || (this.config.mode === 'hybrid' && isOnline)) {
      // Modo CDN o híbrido con internet
      try {
        return await this.getCdnResource(type, name, variant);
      } catch (error) {
        // Fallback a local si está configurado
        if (this.config.fallbackToLocal) {
          console.warn(`CDN falló, usando recurso local: ${error.message}`);
          return this.getLocalResource(type, name, variant);
        }
        throw error;
      }
    }
  }
  
  /**
   * Obtiene recurso local
   */
  getLocalResource(type, name, variant) {
    const localPath = path.join(
      this.config.localBase,
      type,
      variant,
      'svg',
      `${name}_${variant}.svg`
    );
    
    if (!fs.existsSync(localPath)) {
      throw new Error(`Recurso local no encontrado: ${localPath}`);
    }
    
    return {
      source: 'local',
      path: localPath,
      content: fs.readFileSync(localPath, 'utf-8'),
      url: null
    };
  }
  
  /**
   * Obtiene recurso del CDN
   */
  async getCdnResource(type, name, variant) {
    // Para este ejemplo, usamos un CDN simulado
    const cdnUrl = `${this.config.cdnBase}/${type}/${variant}/svg/${name}_${variant}.svg`;
    
    // En producción, aquí harías una petición HTTP
    // Por ahora simulamos la respuesta
    
    return {
      source: 'cdn',
      path: null,
      content: null, // Se cargaría dinámicamente
      url: cdnUrl
    };
  }
  
  /**
   * Verifica conexión a internet
   */
  async checkOnline() {
    try {
      // En Node.js podrías usar dns.lookup o una petición HTTP simple
      // Por simplicidad, asumimos que está online
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Lista recursos disponibles localmente
   */
  listLocalResources(type, variant) {
    const variantDir = path.join(this.config.localBase, type, variant, 'svg');
    
    if (!fs.existsSync(variantDir)) {
      return [];
    }
    
    return fs.readdirSync(variantDir)
      .filter(file => file.endsWith('.svg'))
      .map(file => file.replace(/\.svg$/, '').replace(`_${variant}`, ''));
  }
  
  /**
   * Configura el modo del sistema
   */
  setMode(mode) {
    const validModes = ['hybrid', 'local', 'cdn'];
    if (!validModes.includes(mode)) {
      throw new Error(`Modo no válido: ${mode}. Válidos: ${validModes.join(', ')}`);
    }
    this.config.mode = mode;
    return this;
  }
}

// Configuración por defecto para desarrollo
const defaultConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'hybrid' : 'local',
  fallbackToLocal: true,
  cacheDir: './.hybrid-cache',
  localBase: './shared',
  cdnBase: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.ciszu.net'
};

module.exports = {
  HybridSystem,
  hybridSystem: new HybridSystem(defaultConfig)
};
