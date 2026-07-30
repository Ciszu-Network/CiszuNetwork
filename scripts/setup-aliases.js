#!/usr/bin/env node

/**
 * Script para configurar aliases y setup restante del sistema
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function createJsonFile(filePath, content) {
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`${COLORS.green}✅ Archivo creado: ${path.relative(ROOT_DIR, filePath)}${COLORS.reset}`);
}

function updateGitignore() {
  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  const gitignoreAdditions = [
    '# Directorio temporal de descargas de iconos',
    'downloads/',
    '',
    '# Archivos dinámicos de iconos locales',
    'shared/icons/**/*.png',
    'shared/icons/**/*.ai',
    '',
    '# Contenido dinámico de apps',
    '**/content/**/*',
    '',
    '# Archivos de desarrollo',
    '.env*',
    '!.env.example',
    'node_modules/',
    'dist/',
    'build/',
    '*.log',
    '',
    '# Sistemas específicos',
    '.next/',
    '.vercel/',
    '.vscode/',
    '.idea/',
    '*.swp',
    '*.swo'
  ];
  
  let gitignoreContent = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  }
  
  // Agregar solo si no existe
  gitignoreAdditions.forEach(line => {
    if (!gitignoreContent.includes(line.trim())) {
      gitignoreContent += '\n' + line;
    }
  });
  
  fs.writeFileSync(gitignorePath, gitignoreContent.trim(), 'utf-8');
  console.log(`${COLORS.green}✅ .gitignore actualizado${COLORS.reset}`);
}

function updatePackageJson() {
  const packagePath = path.join(ROOT_DIR, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.log(`${COLORS.yellow}⚠️  package.json no encontrado, creando...${COLORS.reset}`);
    
    const packageJson = {
      name: "ciszu-network",
      version: "1.0.0",
      private: true,
      workspaces: [
        "apps/*"
      ],
      scripts: {
        "dev": "turbo dev",
        "build": "turbo build",
        "start": "turbo start",
        "lint": "turbo lint",
        "test": "turbo test",
        "icons:download": "node scripts/download-icons-direct.js",
        "icons:convert": "node scripts/convert-icons.js",
        "icons:verify": "node scripts/verify-system.js",
        "icons:setup": "node scripts/setup-aliases.js",
        "clean": "turbo clean"
      },
      devDependencies: {
        "turbo": "latest",
        "typescript": "^5.0.0"
      },
      dependencies: {},
      packageManager: "pnpm@8.15.0",
      engines: {
        "node": ">=18.0.0"
      }
    };
    
    createJsonFile(packagePath, packageJson);
  } else {
    console.log(`${COLORS.green}✅ package.json ya existe${COLORS.reset}`);
  }
}

function createTsconfigBase() {
  const tsconfigPath = path.join(ROOT_DIR, 'tsconfig.base.json');
  
  const tsconfigBase = {
    "compilerOptions": {
      "target": "ES2022",
      "lib": ["DOM", "DOM.Iterable", "ES2022"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"],
        "@shared/*": ["./shared/*"],
        "@icons/*": ["./shared/icons/*"],
        "@ciszubot/*": ["./apps/ciszubot/*"],
        "@ciszukoantony/*": ["./apps/ciszukoantony/*"],
        "@muzicmania/*": ["./apps/muzicmania/*"]
      }
    },
    "exclude": ["node_modules"]
  };
  
  createJsonFile(tsconfigPath, tsconfigBase);
}

function createTurborepoConfig() {
  const turboPath = path.join(ROOT_DIR, 'turbo.json');
  
  const turboConfig = {
    "$schema": "https://turbo.build/schema.json",
    "globalEnv": [
      "NEXT_PUBLIC_APP_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_CDN_URL"
    ],
    "pipeline": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": [".next/**", "!.next/cache/**"]
      },
      "dev": {
        "cache": false,
        "persistent": true
      },
      "lint": {
        "outputs": []
      },
      "test": {
        "dependsOn": ["build"],
        "outputs": []
      },
      "clean": {
        "cache": false
      }
    }
  };
  
  createJsonFile(turboPath, turboConfig);
}

function createVercelConfig() {
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  
  const vercelConfig = {
    "version": 2,
    "builds": [
      {
        "src": "apps/ciszubot/website/package.json",
        "use": "@vercel/next",
        "config": {
          "distDir": ".next"
        }
      },
      {
        "src": "apps/ciszukoantony/website/package.json",
        "use": "@vercel/next",
        "config": {
          "distDir": ".next"
        }
      },
      {
        "src": "apps/muzicmania/website/package.json",
        "use": "@vercel/next",
        "config": {
          "distDir": ".next"
        }
      }
    ],
    "routes": [
      {
        "src": "/bot",
        "dest": "apps/ciszubot/website"
      },
      {
        "src": "/antony",
        "dest": "apps/ciszukoantony/website"
      },
      {
        "src": "/music",
        "dest": "apps/muzicmania/website"
      }
    ]
  };
  
  createJsonFile(vercelPath, vercelConfig);
}

function createTauriConfig() {
  const tauriPath = path.join(ROOT_DIR, 'apps', 'muzicmania', 'launcher', 'src-tauri', 'tauri.conf.json');
  const tauriDir = path.dirname(tauriPath);
  
  if (!fs.existsSync(tauriDir)) {
    fs.mkdirSync(tauriDir, { recursive: true });
  }
  
  const tauriConfig = {
    "build": {
      "beforeDevCommand": "pnpm run dev",
      "beforeBuildCommand": "pnpm run build",
      "devPath": "http://localhost:3000",
      "distDir": "../dist",
      "withGlobalTauri": false
    },
    "package": {
      "productName": "MuzicMania",
      "version": "0.1.0"
    },
    "tauri": {
      "allowlist": {
        "all": false
      },
      "bundle": {
        "active": true,
        "category": "Games",
        "copyright": "",
        "deb": {
          "depends": []
        },
        "externalBin": [],
        "icon": [
          "icons/icon.png",
          "icons/icon.ico"
        ],
        "identifier": "com.ciszu.muzicmania",
        "longDescription": "",
        "macOS": {
          "frameworks": [],
          "minimumSystemVersion": "",
          "signingIdentity": null
        },
        "resources": [],
        "shortDescription": "",
        "targets": "all",
        "windows": {
          "certificateThumbprint": null,
          "digestAlgorithm": "sha256",
          "timestampUrl": ""
        }
      },
      "security": {
        "csp": null
      },
      "windows": [
        {
          "fullscreen": false,
          "height": 720,
          "resizable": true,
          "title": "MuzicMania",
          "width": 1280
        }
      ]
    }
  };
  
  createJsonFile(tauriPath, tauriConfig);
}

function createAliasesFile() {
  const aliasesPath = path.join(ROOT_DIR, 'shared', 'aliases.json');
  
  const aliases = {
    "$schema": "./schema.json",
    "aliases": {
      // Ruta de iconos
      "@icons": {
        "path": "./shared/icons",
        "description": "Sistema de iconos compartidos"
      },
      // Apps principales
      "@apps/ciszubot": {
        "path": "./apps/ciszubot",
        "description": "Bot de Discord CiszuBot"
      },
      "@apps/ciszukoantony": {
        "path": "./apps/ciszukoantony",
        "description": "Sitio web de Antony"
      },
      "@apps/muzicmania": {
        "path": "./apps/muzicmania",
        "description": "Juego webapp MuzicMania"
      },
      // Utilidades compartidas
      "@shared/utils": {
        "path": "./shared/utils",
        "description": "Utilidades compartidas entre proyectos"
      },
      "@shared/types": {
        "path": "./shared/types",
        "description": "Tipos TypeScript compartidos"
      },
      "@shared/hooks": {
        "path": "./shared/hooks",
        "description": "React hooks compartidos"
      },
      // Configuración CDN
      "@cdn": {
        "url": "https://cdn.ciszu.net",
        "description": "CDN para archivos dinámicos"
      },
      // Sistema híbrido local/CDN
      "hybrid": {
        "local": {
          "icons": "@icons",
          "content": "./shared/content"
        },
        "cdn": {
          "icons": "@cdn/icons",
          "content": "@cdn/content"
        },
        "description": "Sistema híbrido local/CDN"
      }
    },
    "config": {
      "defaultMode": "hybrid", // hybrid, local-only, cdn-only
      "fallbackToLocal": true,
      "cacheDuration": 3600
    }
  };
  
  createJsonFile(aliasesPath, aliases);
}

function createHybridSystemConfig() {
  const hybridPath = path.join(ROOT_DIR, 'shared', 'hybrid-system.js');
  
  const hybridSystem = `
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
          console.warn(\`CDN falló, usando recurso local: \${error.message}\`);
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
      \`\${name}_\${variant}.svg\`
    );
    
    if (!fs.existsSync(localPath)) {
      throw new Error(\`Recurso local no encontrado: \${localPath}\`);
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
    const cdnUrl = \`\${this.config.cdnBase}/\${type}/\${variant}/svg/\${name}_\${variant}.svg\`;
    
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
      .map(file => file.replace(/\\.svg$/, '').replace(\`_\${variant}\`, ''));
  }
  
  /**
   * Configura el modo del sistema
   */
  setMode(mode) {
    const validModes = ['hybrid', 'local', 'cdn'];
    if (!validModes.includes(mode)) {
      throw new Error(\`Modo no válido: \${mode}. Válidos: \${validModes.join(', ')}\`);
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
`;
  
  fs.writeFileSync(hybridPath, hybridSystem, 'utf-8');
  console.log(`${COLORS.green}✅ Sistema híbrido configurado: shared/hybrid-system.js${COLORS.reset}`);
}

function main() {
  console.log(`${COLORS.magenta}╔═══════════════════════════���══════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.magenta}║          CONFIGURACIÓN DE ALIASES Y SETUP       ║${COLORS.reset}`);
  console.log(`${COLORS.magenta}╚══════════════════════════════════════════════════╝${COLORS.reset}\n`);
  
  try {
    console.log(`${COLORS.cyan}1️⃣  Configurando .gitignore...${COLORS.reset}`);
    updateGitignore();
    
    console.log(`${COLORS.cyan}2️⃣  Configurando package.json...${COLORS.reset}`);
    updatePackageJson();
    
    console.log(`${COLORS.cyan}3️⃣  Creando tsconfig.base.json...${COLORS.reset}`);
    createTsconfigBase();
    
    console.log(`${COLORS.cyan}4️⃣  Configurando TurboRepo...${COLORS.reset}`);
    createTurborepoConfig();
    
    console.log(`${COLORS.cyan}5️⃣  Configurando Vercel...${COLORS.reset}`);
    createVercelConfig();
    
    console.log(`${COLORS.cyan}6️⃣  Configurando Tauri...${COLORS.reset}`);
    createTauriConfig();
    
    console.log(`${COLORS.cyan}7️⃣  Creando sistema de aliases...${COLORS.reset}`);
    createAliasesFile();
    
    console.log(`${COLORS.cyan}8️⃣  Configurando sistema híbrido local/CDN...${COLORS.reset}`);
    createHybridSystemConfig();
    
    console.log(`\n${COLORS.green}🎉 CONFIGURACIÓN COMPLETADA${COLORS.reset}`);
    console.log(`${COLORS.yellow}📋 Resumen de archivos creados:${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 .gitignore (actualizado)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 package.json (workspace)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 tsconfig.base.json (aliases)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 turbo.json (Turborepo)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 vercel.json (deploy)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 tauri.conf.json (app desktop)${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 shared/aliases.json${COLORS.reset}`);
    console.log(`${COLORS.cyan}   📄 shared/hybrid-system.js${COLORS.reset}`);
    
    console.log(`\n${COLORS.magenta}🚀 PRÓXIMOS PASOS${COLORS.reset}`);
    console.log(`${COLORS.yellow}1. Instalar dependencias:${COLORS.reset} pnpm install`);
    console.log(`${COLORS.yellow}2. Convertir iconos:${COLORS.reset} node scripts/convert-icons.js`);
    console.log(`${COLORS.yellow}3. Verificar todo:${COLORS.reset} node scripts/verify-system.js`);
    console.log(`${COLORS.yellow}4. Configurar variables de entorno en cada app${COLORS.reset}`);
    
  } catch (error) {
    console.error(`${COLORS.red}❌ Error en la configuración:${COLORS.reset}`, error.message);
    process.exit(1);
  }
}

main();