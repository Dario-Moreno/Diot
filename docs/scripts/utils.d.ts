import { MarkdownFile } from './types';
export declare class MarkdownProcessor {
    /**
     * Lee un archivo markdown y extrae frontmatter
     */
    static readMarkdownFile(filePath: string): MarkdownFile;
    /**
     * Extrae frontmatter de un archivo markdown
     */
    static parseFrontmatter(content: string): {
        frontmatter: Record<string, string>;
        body: string;
    };
    /**
     * Escapa contenido para embeber en JavaScript
     */
    static escapeForJS(content: string): string;
    /**
     * Genera un slug desde un texto
     */
    static slugify(text: string): string;
    /**
     * Crea directorios si no existen
     */
    static ensureDirectoryExists(dirPath: string): void;
    /**
     * Lee todos los archivos markdown de un directorio
     */
    static readMarkdownFiles(directory: string): MarkdownFile[];
}
//# sourceMappingURL=utils.d.ts.map