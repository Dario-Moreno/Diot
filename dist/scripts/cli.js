#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const build_1 = require("./build");
const child_process_1 = require("child_process");
const chokidar_1 = __importDefault(require("chokidar"));
const args = process.argv.slice(2);
const command = args[0];
async function main() {
    switch (command) {
        case 'init':
            await initProject();
            break;
        case 'build':
            await (0, build_1.buildDocs)();
            break;
        case 'dev':
            await devMode();
            break;
        case 'help':
        case '--help':
        case '-h':
            showHelp();
            break;
        default:
            console.log('❌ Comando no reconocido. Usa "help" para ver comandos disponibles.');
            process.exit(1);
    }
}
async function initProject() {
    console.log('🚀 Inicializando proyecto de documentación...');
    // Crear estructura de directorios
    const dirs = [
        'src',
        'src/content',
        'src/content/docs',
        'src/config',
        'src/templates',
        'scripts',
        'dist',
    ];
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`📁 Creado directorio: ${dir}`);
        }
    }
    // Crear archivos de ejemplo
    await createExampleFiles();
    console.log('✅ Proyecto inicializado exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. npm install');
    console.log('2. Edita src/content/docs/ con tu contenido');
    console.log('3. npm run build');
}
async function createExampleFiles() {
    // Archivo de configuración de ejemplo
    const configContent = `// src/config/docs.config.ts
import { DocsConfig } from '../../scripts/types';

export const docsConfig: DocsConfig = {
  title: 'Mi Documentación',
  logo: '📚',
  theme: {
    primaryColor: '#3b82f6',
    darkMode: true
  },
  sidebar: [
    {
      title: 'Guía de Inicio',
      items: [
        {
          label: 'Introducción',
          link: 'introduction',
          file: 'introduction.md'
        },
        {
          label: 'Instalación',
          link: 'installation',
          file: 'installation.md'
        }
      ]
    }
  ]
};`;
    // Markdown de ejemplo
    const introContent = `---
title: Introducción
description: Bienvenido a la documentación
---

# Introducción

¡Bienvenido a tu nueva documentación!

## Características

- 🚀 SPA (Single Page Application)
- 📱 Diseño responsive
- 🌙 Modo oscuro
- 🔍 Búsqueda integrada

## Empezando

Edita este archivo en \`src/content/docs/introduction.md\` para personalizar tu contenido.

\`\`\`typescript
// Ejemplo de código
console.log('¡Hola mundo!');
\`\`\`

¡Disfruta creando tu documentación!`;
    const installContent = `---
title: Instalación
description: Guía de instalación
---

# Instalación

## Prerrequisitos

- Node.js 16+
- npm o yarn

## Pasos

1. Clona el repositorio
2. Instala dependencias: \`npm install\`
3. Ejecuta el build: \`npm run build\`

¡Listo!`;
    // Escribir archivos
    const files = [
        ['src/config/docs.config.ts', configContent],
        ['src/content/docs/introduction.md', introContent],
        ['src/content/docs/installation.md', installContent],
    ];
    for (const [filePath, content] of files) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`📄 Creado archivo: ${filePath}`);
        }
    }
}
async function devMode() {
    console.log('🔄 Iniciando modo desarrollo...');
    // Construir una vez
    await (0, build_1.buildDocs)();
    // Servir archivos
    const server = (0, child_process_1.spawn)('npx', ['http-server', 'dist', '-p', '3000', '-o'], {
        stdio: 'inherit',
    });
    console.log('🌐 Servidor iniciado en http://localhost:3000');
    console.log('👀 Observando cambios...');
    const watcher = chokidar_1.default.watch([
        'src/content/**/*',
        'src/config/docs.config.ts',
        'src/templates/base.html',
        'src/templates/styles/**/*',
    ], {
        ignored: /node_modules/,
        persistent: true,
    });
    let building = false;
    watcher.on('all', async (event, filePath) => {
        if (building)
            return;
        building = true;
        try {
            console.log(`📝 Archivo ${event}: ${filePath}`);
            console.log('🔄 Reconstruyendo...');
            await (0, build_1.buildDocs)();
            console.log('✅ Reconstrucción completada');
        }
        finally {
            building = false;
        }
    });
    // Manejar cierre del proceso
    process.on('SIGINT', () => {
        console.log('\n🛑 Cerrando servidor...');
        server.kill();
        watcher.close();
        process.exit(0);
    });
}
function showHelp() {
    console.log(`
📚 Constructor de Documentación SPA

COMANDOS:
  init     Inicializar un nuevo proyecto de documentación
  build    Construir la documentación estática
  dev      Iniciar servidor de desarrollo con recarga automática
  help     Mostrar esta ayuda

EJEMPLOS:
  docs-builder init           # Crear nueva documentación
  docs-builder build          # Generar archivo HTML
  docs-builder dev            # Desarrollo con hot-reload

ESTRUCTURA DEL PROYECTO:
  src/
  ├── content/docs/           # Archivos Markdown
  ├── config/docs.config.ts   # Configuración
  └── templates/base.html     # Template HTML

Para más información, visita: https://github.com/tu-usuario/docs-spa-builder
`);
}
// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Error:', error);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('❌ Error crítico:', error);
    process.exit(1);
});
// Ejecutar CLI
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Error en CLI:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=cli.js.map