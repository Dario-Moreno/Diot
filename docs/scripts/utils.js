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
exports.MarkdownProcessor = void 0;
// scripts/utils.ts
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MarkdownProcessor {
    /**
     * Lee un archivo markdown y extrae frontmatter
     */
    static readMarkdownFile(filePath) {
        const fullPath = path.resolve(filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const { frontmatter, body } = this.parseFrontmatter(content);
        const id = path.basename(filePath, '.md');
        return {
            id,
            content: body,
            frontmatter,
        };
    }
    /**
     * Extrae frontmatter de un archivo markdown
     */
    static parseFrontmatter(content) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontmatterRegex);
        if (!match) {
            return { frontmatter: {}, body: content };
        }
        const frontmatterText = match[1];
        const body = match[2];
        // Parse simple YAML-like frontmatter
        const frontmatter = {};
        frontmatterText.split('\n').forEach((line) => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim();
                frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        });
        return { frontmatter, body };
    }
    /**
     * Escapa contenido para embeber en JavaScript
     */
    static escapeForJS(content) {
        return content
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            //      .replace(/"/g, '\\"') // NO ESCAPES COMILLAS DOBLES
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
    }
    /**
     * Genera un slug desde un texto
     */
    static slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    /**
     * Crea directorios si no existen
     */
    static ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    /**
     * Lee todos los archivos markdown de un directorio
     */
    static readMarkdownFiles(directory) {
        const files = [];
        if (!fs.existsSync(directory)) {
            console.warn(`Directorio no encontrado: ${directory}`);
            return files;
        }
        const entries = fs.readdirSync(directory, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);
            if (entry.isFile() && entry.name.endsWith('.md')) {
                files.push(this.readMarkdownFile(fullPath));
            }
            else if (entry.isDirectory()) {
                // Recursivamente leer subdirectorios
                files.push(...this.readMarkdownFiles(fullPath));
            }
        }
        return files;
    }
}
exports.MarkdownProcessor = MarkdownProcessor;
//# sourceMappingURL=utils.js.map