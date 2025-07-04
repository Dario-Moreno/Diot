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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocsBuilder = void 0;
exports.buildDocs = buildDocs;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("./utils");
class DocsBuilder {
    constructor(config, options) {
        this.config = config;
        this.options = options;
    }
    /**
     * Construye la documentación completa
     */
    async build() {
        console.log('🚀 Iniciando construcción de documentación...');
        // 1. Leer archivos markdown
        const markdownFiles = this.readMarkdownFiles();
        console.log(`📄 Encontrados ${markdownFiles.length} archivos markdown`);
        // 2. Procesar archivos
        const pages = this.processMarkdownFiles(markdownFiles);
        console.log(`✅ Procesadas ${pages.length} páginas`);
        // 3. Generar HTML
        const html = this.generateHTML(pages);
        // 4. Escribir archivo de salida
        this.writeOutput(html);
        console.log('✨ ¡Documentación generada exitosamente!');
    }
    /**
     * Lee todos los archivos markdown
     */
    readMarkdownFiles() {
        const contentDir = path.join(this.options.inputDir, 'content');
        return utils_1.MarkdownProcessor.readMarkdownFiles(contentDir);
    }
    /**
     * Procesa archivos markdown en páginas
     */
    processMarkdownFiles(files) {
        const pages = [];
        const foundIds = new Set(files.map((f) => f.id));
        for (const file of files) {
            const page = {
                id: file.id,
                content: file.content,
                title: typeof file.frontmatter.title === 'string' &&
                    file.frontmatter.title.length > 0
                    ? file.frontmatter.title
                    : this.formatTitle(file.id),
                description: typeof file.frontmatter.description === 'string'
                    ? file.frontmatter.description
                    : '',
            };
            pages.push(page);
        }
        // Agregar páginas faltantes del sidebar como placeholders
        for (const section of this.config.sidebar) {
            for (const item of section.items) {
                if (!foundIds.has(item.link)) {
                    // Solo agrega el título como encabezado markdown, no como campo separado
                    pages.push({
                        id: item.link,
                        content: `# ${this.formatTitle(item.link)}\n\n*Esta página aún no existe. Crea el archivo correspondiente para agregar contenido.*`,
                        title: '', // Deja el título vacío para que no se muestre como texto plano
                        description: '',
                    });
                    console.warn(`⚠️  Archivo markdown no encontrado para '${item.link}'. Se generó un placeholder.`);
                }
            }
        }
        return pages;
    }
    /**
     * Formatea un ID en título legible
     */
    formatTitle(id) {
        return id
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    /**
     * Genera el objeto de navegación prev/next basado en el orden del sidebar
     */
    generateNavigationObject() {
        // Construir un array plano de los links en orden
        const orderedLinks = [];
        for (const section of this.config.sidebar) {
            for (const item of section.items) {
                orderedLinks.push(item.link);
            }
        }
        // Generar el objeto de navegación
        const navigation = {};
        for (let i = 0; i < orderedLinks.length; i++) {
            const current = orderedLinks[i];
            const navObj = {};
            if (i > 0)
                navObj.prev = orderedLinks[i - 1];
            if (i < orderedLinks.length - 1)
                navObj.next = orderedLinks[i + 1];
            navigation[current] = navObj;
        }
        return JSON.stringify(navigation, null, 2);
    }
    /**
     * Genera el HTML de la barra lateral
     */
    generateSidebarContent() {
        // Serializa el sidebar completo como JSON para Alpine.js
        return JSON.stringify(this.config.sidebar, null, 2);
    }
    /**
     * Genera el HTML completo
     */
    generateHTML(pages) {
        // Leer template base
        const templatePath = path.join(this.options.inputDir, 'templates', 'base.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        // Leer estilos externos y reemplazar placeholder si existe
        const cssPath = path.join(this.options.inputDir, 'templates', 'styles', 'main.css');
        let cssContent = '';
        if (fs.existsSync(cssPath)) {
            cssContent = fs.readFileSync(cssPath, 'utf-8');
        }
        template = template.replace('{{INLINE_STYLES}}', `<style>\n${cssContent}\n</style>`);
        // Leer script principal y reemplazar placeholder
        const jsPath = path.join(this.options.inputDir, 'templates', 'assets', 'docsApp.js');
        let jsContent = '';
        if (fs.existsSync(jsPath)) {
            jsContent = fs.readFileSync(jsPath, 'utf-8');
        }
        template = template.replace('{{INLINE_SCRIPTS}}', `<script>\n${jsContent}\n</script>`);
        // Generar contenido de páginas
        const pagesObject = this.generatePagesObject(pages);
        const sidebarContent = this.generateSidebarContent();
        const navigationObject = this.generateNavigationObject();
        // Reemplazar placeholders
        template = template.replace('{{FAVICON}}', this.config.favicon || '/favicon.ico');
        //    this.config.logo = '';
        template = template.replace('{{LOGO_URL}}', this.config.logoUrl || '');
        template = template
            .replace(/\{\{TITLE\}\}/g, this.config.title)
            .replace('{{PAGES_CONTENT}}', pagesObject)
            .replace('{{SIDEBAR_CONTENT}}', sidebarContent)
            .replace('{{NAVIGATION_CONTENT}}', navigationObject)
            .replace('{{PRIMARY_COLOR}}', this.config.theme?.primaryColor || '')
            .replace('{{LOGO}}', this.config.logo || '');
        return template;
    }
    /**
     * Genera el objeto JavaScript con todas las páginas
     */
    generatePagesObject(pages) {
        const pagesObj = {};
        for (const page of pages) {
            let content = utils_1.MarkdownProcessor.escapeForJS(page.content);
            content = content.replace(/\\r/g, ''); // Elimina todos los '\\r'
            content = content.replace(/\\n/g, '\n');
            pagesObj[page.id] = content;
        }
        return JSON.stringify(pagesObj, null, 2);
    }
    /**
     * Escribe el archivo de salida
     */
    writeOutput(html) {
        utils_1.MarkdownProcessor.ensureDirectoryExists(this.options.outputDir);
        const outputPath = path.join(this.options.outputDir, 'index.html');
        fs.writeFileSync(outputPath, html, 'utf-8');
        console.log(`📝 Archivo generado: ${outputPath}`);
    }
}
exports.DocsBuilder = DocsBuilder;
// Función principal para ejecutar el build
async function buildDocs() {
    try {
        // Importar configuración
        const configPath = path.resolve('docs/config/docs.config.js');
        const { docsConfig } = await Promise.resolve(`${configPath}`).then(s => __importStar(require(s)));
        // Opciones de construcción
        const buildOptions = {
            inputDir: 'src',
            outputDir: 'docs',
            configFile: 'src/config/docs.config.ts',
            templateFile: 'src/templates/base.html',
        };
        // Crear y ejecutar builder
        const builder = new DocsBuilder(docsConfig, buildOptions);
        await builder.build();
    }
    catch (error) {
        console.error('❌ Error durante la construcción:', error);
        process.exit(1);
    }
}
// Ejecutar si se llama directamente
if (require.main === module) {
    buildDocs();
}
//# sourceMappingURL=build.js.map