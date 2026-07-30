#!/usr/bin/env node

/**
 * Sistema para configurar iconos en proyectos de Ciszu Network
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const SHARED_ICONS = path.join(ROOT_DIR, 'shared', 'icons');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function isProgrammableProject(projectPath) {
  const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
  const hasWebsite = fs.existsSync(path.join(projectPath, 'website'));
  const hasWebsitePackage = hasWebsite && fs.existsSync(path.join(projectPath, 'website', 'package.json'));
  
  return hasPackageJson || hasWebsitePackage;
}

function createIconUtils(projectPath, projectName) {
  const utilsDir = path.join(projectPath, 'src', 'utils');
  const hooksDir = path.join(projectPath, 'src', 'hooks');
  
  createDirectory(utilsDir);
  createDirectory(hooksDir);
  
  // Crear utilidad de iconos
  const iconUtilsPath = path.join(utilsDir, 'icons.ts');
  const iconUtilsContent = `/**
 * Utilidades de iconos para ${projectName}
 * Sistema híbrido local/CDN
 */

export type IconStyle = 'outline' | 'filled' | 'flag';
export type IconFormat = 'svg' | 'png';

export interface IconConfig {
  /** Estilo del icono */
  style: IconStyle;
  /** Nombre del icono (sin extensión ni estilo) */
  name: string;
  /** Formato del icono */
  format?: IconFormat;
  /** Tamaño para PNG (opcional) */
  size?: number;
  /** Usar CDN si está disponible */
  useCDN?: boolean;
}

export interface IconResult {
  /** URL o ruta del icono */
  url: string;
  /** Fuente del icono (local/cdn) */
  source: 'local' | 'cdn';
  /** Información del icono */
  metadata: {
    style: IconStyle;
    name: string;
    format: IconFormat;
    size?: number;
  };
}

class IconSystem {
  private config = {
    /** Modo: 'hybrid', 'local', 'cdn' */
    mode: 'hybrid' as 'hybrid' | 'local' | 'cdn',
    /** Fallback a local si CDN falla */
    fallbackToLocal: true,
    /** URL base del CDN */
    cdnBase: process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.ciszu.net',
    /** Ruta base local */
    localBase: '/shared/icons',
    /** Tamaño por defecto para PNG */
    defaultPngSize: 512
  };

  constructor(config?: Partial<typeof this.config>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Obtiene un icono
   */
  async getIcon(config: IconConfig): Promise<IconResult> {
    const format = config.format || 'svg';
    const size = config.size || (format === 'png' ? this.config.defaultPngSize : undefined);
    const useCDN = config.useCDN !== false && this.config.mode !== 'local';
    
    const iconName = \`\${config.name}_\${config.style}.\${format}\`;
    const iconPath = \`/\${config.style}/\${format}/\${iconName}\`;
    
    // Verificar si estamos online y debemos usar CDN
    const isOnline = useCDN && this.config.mode !== 'local' && await this.checkOnline();
    
    if (isOnline) {
      try {
        const cdnUrl = \`\${this.config.cdnBase}/icons\${iconPath}\`;
        return {
          url: cdnUrl,
          source: 'cdn',
          metadata: {
            style: config.style,
            name: config.name,
            format,
            size
          }
        };
      } catch (error) {
        // Fallback a local si está configurado
        if (this.config.fallbackToLocal) {
          console.warn(\`CDN falló, usando icono local: \${error.message}\`);
        }
      }
    }
    
    // Usar recurso local
    const localUrl = \`\${this.config.localBase}\${iconPath}\`;
    return {
      url: localUrl,
      source: 'local',
      metadata: {
        style: config.style,
        name: config.name,
        format,
        size
      }
    };
  }

  /**
   * Lista iconos disponibles localmente
   */
  listLocalIcons(style?: IconStyle): string[] {
    const styles = style ? [style] : ['outline', 'filled', 'flag'];
    const icons: string[] = [];
    
    styles.forEach(s => {
      const svgDir = path.join(process.cwd(), '..', '..', 'shared', 'icons', s, 'svg');
      try {
        if (fs.existsSync(svgDir)) {
          const files = fs.readdirSync(svgDir);
          files.forEach(file => {
            if (file.endsWith('.svg')) {
              const iconName = file.replace(\`_\${s}.svg\`, '');
              icons.push(\`\${iconName} (\${s})\`);
            }
          });
        }
      } catch (error) {
        console.warn(\`Error leyendo iconos \${s}: \${error.message}\`);
      }
    });
    
    return icons;
  }

  /**
   * Verifica conexión a internet
   */
  private async checkOnline(): Promise<boolean> {
    try {
      // En navegador
      if (typeof window !== 'undefined') {
        return navigator.onLine;
      }
      
      // En Node.js
      return true; // Asumir online para simplificar
    } catch (error) {
      return false;
    }
  }

  /**
   * Cambia el modo del sistema
   */
  setMode(mode: 'hybrid' | 'local' | 'cdn') {
    this.config.mode = mode;
    return this;
  }

  /**
   * Configura la URL del CDN
   */
  setCdnBase(url: string) {
    this.config.cdnBase = url;
    return this;
  }
}

// Utilidades de ayuda
export function iconPath(style: IconStyle, name: string, format: IconFormat = 'svg'): string {
  return \`/shared/icons/\${style}/\${format}/\${name}_\${style}.\${format}\`;
}

export function cdnIconUrl(style: IconStyle, name: string, format: IconFormat = 'svg'): string {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.ciszu.net';
  return \`\${cdnBase}/icons/\${style}/\${format}/\${name}_\${style}.\${format}\`;
}

// Instancia por defecto
export const icons = new IconSystem();

// Para React/Next.js
export function useIcon(config: IconConfig) {
  const [iconUrl, setIconUrl] = React.useState<string>('');
  const [source, setSource] = React.useState<'local' | 'cdn'>('local');
  
  React.useEffect(() => {
    async function loadIcon() {
      const result = await icons.getIcon(config);
      setIconUrl(result.url);
      setSource(result.source);
    }
    
    loadIcon();
  }, [config]);
  
  return { iconUrl, source };
}

export default IconSystem;`;
  
  fs.writeFileSync(iconUtilsPath, iconUtilsContent, 'utf-8');
  console.log(`${COLORS.green}✅ Utilidad de iconos creada: ${path.relative(projectPath, iconUtilsPath)}${COLORS.reset}`);
  
  // Crear hook para React
  const useIconHookPath = path.join(hooksDir, 'useIcon.ts');
  const useIconHookContent = `/**
 * Hook React para usar iconos en ${projectName}
 */

import { IconConfig, useIcon as useIconBase } from '../utils/icons';

export function useIcon(config: IconConfig) {
  return useIconBase(config);
}

export function useIconList(style?: 'outline' | 'filled' | 'flag') {
  const [icons, setIcons] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    // En un caso real, aquí cargarías la lista de iconos
    // Por ahora devolvemos un ejemplo
    const exampleIcons = [
      'home (outline)',
      'search (outline)',
      'user (outline)',
      'settings (outline)',
      'info (outline)'
    ];
    
    setIcons(exampleIcons);
  }, [style]);
  
  return icons;
}

export function IconComponent({ 
  name, 
  style = 'outline', 
  format = 'svg',
  size,
  className = '',
  alt = ''
}: {
  name: string;
  style?: 'outline' | 'filled' | 'flag';
  format?: 'svg' | 'png';
  size?: number;
  className?: string;
  alt?: string;
}) {
  const { iconUrl, source } = useIcon({ name, style, format, size });
  
  if (format === 'svg') {
    return (
      <img 
        src={iconUrl} 
        alt={alt || \`\${name} icon\`}
        className={\`icon icon-\${style} \${className}\`}
        data-source={source}
      />
    );
  }
  
  // Para PNG
  return (
    <img 
      src={iconUrl} 
      alt={alt || \`\${name} icon\`}
      className={\`icon icon-\${style} icon-png \${className}\`}
      data-source={source}
      width={size}
      height={size}
    />
  );
}`;
  
  fs.writeFileSync(useIconHookPath, useIconHookContent, 'utf-8');
  console.log(`${COLORS.green}✅ Hook de iconos creado: ${path.relative(projectPath, useIconHookPath)}${COLORS.reset}`);
  
  return true;
}

function updatePackageJson(projectPath, projectName) {
  const packagePath = path.join(projectPath, 'package.json');
  const websitePackagePath = path.join(projectPath, 'website', 'package.json');
  
  let targetPath = null;
  if (fs.existsSync(packagePath)) {
    targetPath = packagePath;
  } else if (fs.existsSync(websitePackagePath)) {
    targetPath = websitePackagePath;
  }
  
  if (!targetPath) return false;
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
    
    // Agregar scripts si no existen
    if (!packageJson.scripts) packageJson.scripts = {};
    
    packageJson.scripts = {
      ...packageJson.scripts,
      "icons:list": "node -e \"const { icons } = require('./src/utils/icons'); console.log(icons.listLocalIcons());\"",
      "icons:setup": "node ../../scripts/setup-icons-system.js"
    };
    
    // Agregar dependencias si es necesario
    if (!packageJson.dependencies) packageJson.dependencies = {};
    if (!packageJson.devDependencies) packageJson.devDependencies = {};
    
    fs.writeFileSync(targetPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    console.log(`${COLORS.green}✅ package.json actualizado${COLORS.reset}`);
    return true;
  } catch (error) {
    console.log(`${COLORS.yellow}⚠️  No se pudo actualizar package.json: ${error.message}${COLORS.reset}`);
    return false;
  }
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

function setupProjectIcons(projectName) {
  const projectPath = path.join(APPS_DIR, projectName);
  
  console.log(`\n${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}🎨 CONFIGURANDO ICONOS: ${projectName.toUpperCase()}${COLORS.reset}`);
  console.log(`${COLORS.magenta}══════════════════════════════════════════════════${COLORS.reset}`);
  
  // Verificar si es proyecto programable
  if (!isProgrammableProject(projectPath)) {
    console.log(`${COLORS.yellow}⏭️  Saltando (no es proyecto programable)${COLORS.reset}`);
    return { projectName, configured: false, reason: 'not-programmable' };
  }
  
  const hasWebsite = fs.existsSync(path.join(projectPath, 'website'));
  const targetPath = hasWebsite ? path.join(projectPath, 'website') : projectPath;
  
  console.log(`${COLORS.yellow}📁 Objetivo: ${path.relative(projectPath, targetPath)}${COLORS.reset}`);
  
  // Crear estructura de directorios
  const srcPath = path.join(targetPath, 'src');
  createDirectory(srcPath);
  
  // Crear utilidades de iconos
  createIconUtils(targetPath, projectName);
  
  // Actualizar package.json
  updatePackageJson(projectPath, projectName);
  
  // Crear archivo de configuración de iconos
  const configPath = path.join(targetPath, 'icon-config.json');
  const configContent = {
    $schema: "../../../shared/icons/schema.json",
    project: projectName,
    iconSystem: {
      mode: "hybrid",
      cdnBase: "${process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.ciszu.net'}",
      localBase: "/shared/icons",
      defaultFormat: "svg",
      supportedStyles: ["outline", "filled", "flag"],
      supportedFormats: ["svg", "png"]
    },
    aliases: {
      "@icons": "../../../shared/icons",
      "@project/icons": "./src/utils/icons"
    },
    documentation: "Ver shared/icons/README.md para más información"
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2), 'utf-8');
  console.log(`${COLORS.green}✅ Configuración de iconos creada${COLORS.reset}`);
  
  // Crear ejemplo de uso
  const examplePath = path.join(targetPath, 'icon-usage-example.jsx');
  const exampleContent = `/**
 * Ejemplo de uso de iconos en ${projectName}
 */

import { IconComponent, icons, iconPath, cdnIconUrl } from './src/utils/icons';
import { useIcon } from './src/hooks/useIcon';

// Ejemplo 1: Componente de icono simple
function SimpleIconExample() {
  return (
    <div className="icon-example">
      <h2>Iconos en ${projectName}</h2>
      
      <div className="icon-grid">
        <IconComponent name="home" style="outline" alt="Inicio" />
        <IconComponent name="search" style="filled" alt="Buscar" />
        <IconComponent name="user" style="outline" alt="Usuario" />
        <IconComponent name="settings" style="filled" alt="Configuración" />
        <IconComponent name="info" style="outline" alt="Información" />
      </div>
      
      <div className="icon-grid png">
        <IconComponent name="home" style="outline" format="png" size={64} />
        <IconComponent name="search" style="filled" format="png" size={64} />
        <IconComponent name="user" style="outline" format="png" size={64} />
      </div>
    </div>
  );
}

// Ejemplo 2: Usando el hook
function IconWithHookExample() {
  const { iconUrl, source } = useIcon({
    name: 'settings',
    style: 'filled',
    format: 'svg'
  });
  
  return (
    <div>
      <img src={iconUrl} alt="Configuración" data-source={source} />
      <p>Fuente: {source}</p>
    </div>
  );
}

// Ejemplo 3: URL directa
function DirectUrlExample() {
  const localIcon = iconPath('outline', 'home', 'svg');
  const cdnIcon = cdnIconUrl('filled', 'search', 'png');
  
  return (
    <div>
      <p>Local: {localIcon}</p>
      <p>CDN: {cdnIcon}</p>
    </div>
  );
}

// Ejemplo 4: Cambiar modo del sistema
function ChangeModeExample() {
  const handleLocalMode = () => {
    icons.setMode('local');
    console.log('Modo cambiado a local');
  };
  
  const handleCdnMode = () => {
    icons.setMode('cdn');
    console.log('Modo cambiado a CDN');
  };
  
  const handleHybridMode = () => {
    icons.setMode('hybrid');
    console.log('Modo cambiado a híbrido');
  };
  
  return (
    <div>
      <button onClick={handleLocalMode}>Modo Local</button>
      <button onClick={handleCdnMode}>Modo CDN</button>
      <button onClick={handleHybridMode}>Modo Híbrido</button>
    </div>
  );
}

export { 
  SimpleIconExample, 
  IconWithHookExample, 
  DirectUrlExample, 
  ChangeModeExample 
};`;
  
  fs.writeFileSync(examplePath, exampleContent, 'utf-8');
  console.log(`${COLORS.green}✅ Ejemplo de uso creado${COLORS.reset}`);
  
  return {
    projectName,
    configured: true,
    targetPath: path.relative(ROOT_DIR, targetPath)
  };
}

function main() {
  console.log(`${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║     SISTEMA DE ICONOS - CISZU NETWORK          ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  console.log(`${COLORS.cyan}🎨 Iconos disponibles en: ${path.relative(ROOT_DIR, SHARED_ICONS)}${COLORS.reset}`);
  
  // Verificar iconos
  const iconStats = {
    outline: fs.existsSync(path.join(SHARED_ICONS, 'outline', 'svg')) ? 
      fs.readdirSync(path.join(SHARED_ICONS, 'outline', 'svg')).length : 0,
    filled: fs.existsSync(path.join(SHARED_ICONS, 'filled', 'svg')) ? 
      fs.readdirSync(path.join(SHARED_ICONS, 'filled', 'svg')).length : 0,
    flag: fs.existsSync(path.join(SHARED_ICONS, 'flag', 'svg')) ? 
      fs.readdirSync(path.join(SHARED_ICONS, 'flag', 'svg')).length : 0
  };
  
  console.log(`${COLORS.yellow}📊 Iconos disponibles:${COLORS.reset}`);
  console.log(`  Outline: ${iconStats.outline} iconos`);
  console.log(`  Filled: ${iconStats.filled} iconos`);
  console.log(`  Flag: ${iconStats.flag} banderas`);
  console.log(`  Total: ${iconStats.outline + iconStats.filled + iconStats.flag} iconos únicos`);
  
  // Listar proyectos
  const projects = fs.readdirSync(APPS_DIR).filter(item => {
    const itemPath = path.join(APPS_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  console.log(`\n${COLORS.cyan}📋 Configurando proyectos: ${projects.length}${COLORS.reset}`);
  
  const results = [];
  projects.forEach(project => {
    const result = setupProjectIcons(project);
    results.push(result);
  });
  
  // Resumen final
  console.log(`\n${COLORS.magenta}╔══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║             RESUMEN DE CONFIGURACIÓN             ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}`);
  
  const configuredCount = results.filter(r => r.configured).length;
  
  console.log(`${COLORS.green}✅ Proyectos con iconos configurados: ${configuredCount}/${projects.length}${COLORS.reset}`);
  
  results.forEach(result => {
    if (result.configured) {
      console.log(`✅ ${result.projectName}: ${result.targetPath}`);
    } else {
      console.log(`⏭️  ${result.projectName}: ${result.reason}`);
    }
  });
  
  // Instrucciones
  console.log(`\n${COLORS.cyan}🚀 Cómo usar el sistema de iconos:${COLORS.reset}`);
  console.log(`${COLORS.yellow}1. Para páginas web: Usar modo 'hybrid' (CDN con fallback local)${COLORS.reset}`);
  console.log(`${COLORS.yellow}2. Para aplicaciones offline: Usar modo 'local'${COLORS.reset}`);
  console.log(`${COLORS.yellow}3. Importar desde: import { IconComponent } from './src/utils/icons'${COLORS.reset}`);
  console.log(`${COLORS.yellow}4. Variables de entorno:${COLORS.reset}`);
  console.log(`${COLORS.blue}   NEXT_PUBLIC_CDN_URL=https://cdn.ciszu.net${COLORS.reset}`);
  console.log(`${COLORS.blue}   NEXT_PUBLIC_ICON_MODE=hybrid${COLORS.reset}`);
  
  console.log(`\n${COLORS.green}🎉 Sistema de iconos configurado en todos los proyectos${COLORS.reset}`);
}

// Ejecutar configuración
try {
  main();
} catch (error) {
  console.error(`${COLORS.red}❌ Error en la configuración: ${error.message}${COLORS.reset}`);
  process.exit(1);
}