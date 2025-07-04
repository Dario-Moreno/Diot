import { DocsConfig, BuildOptions } from './types';
export declare class DocsBuilder {
    private config;
    private options;
    constructor(config: DocsConfig, options: BuildOptions);
    /**
     * Construye la documentación completa
     */
    build(): Promise<void>;
    /**
     * Lee todos los archivos markdown
     */
    private readMarkdownFiles;
    /**
     * Procesa archivos markdown en páginas
     */
    private processMarkdownFiles;
    /**
     * Formatea un ID en título legible
     */
    private formatTitle;
    /**
     * Genera el objeto de navegación prev/next basado en el orden del sidebar
     */
    private generateNavigationObject;
    /**
     * Genera el HTML de la barra lateral
     */
    private generateSidebarContent;
    /**
     * Genera el HTML completo
     */
    private generateHTML;
    /**
     * Genera el objeto JavaScript con todas las páginas
     */
    private generatePagesObject;
    /**
     * Escribe el archivo de salida
     */
    private writeOutput;
}
export declare function buildDocs(): Promise<void>;
//# sourceMappingURL=build.d.ts.map