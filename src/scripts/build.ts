import * as fs from 'fs'
import * as path from 'path'
import { DocsConfig, BuildOptions, MarkdownFile, GeneratedPage } from './types'
import { MarkdownProcessor } from './utils'

export class DocsBuilder {
  private config: DocsConfig
  private options: BuildOptions

  constructor(config: DocsConfig, options: BuildOptions) {
    this.config = config
    this.options = options
  }

  /**
   * Construye la documentación completa
   */
  async build(): Promise<void> {
    console.log('🚀 Iniciando construcción de documentación...')

    // 1. Leer archivos markdown
    const markdownFiles = this.readMarkdownFiles()
    console.log(`📄 Encontrados ${markdownFiles.length} archivos markdown`)

    // 2. Procesar archivos
    const pages = this.processMarkdownFiles(markdownFiles)
    console.log(`✅ Procesadas ${pages.length} páginas`)

    // 3. Generar HTML
    const html = this.generateHTML(pages)

    // 4. Escribir archivo de salida
    this.writeOutput(html)

    console.log('✨ ¡Documentación generada exitosamente!')
  }

  /**
   * Lee todos los archivos markdown
   */
  private readMarkdownFiles(): MarkdownFile[] {
    const contentDir = path.join(this.options.inputDir, 'content')
    return MarkdownProcessor.readMarkdownFiles(contentDir)
  }

  /**
   * Procesa archivos markdown en páginas
   */
  private processMarkdownFiles(files: MarkdownFile[]): GeneratedPage[] {
    const pages: GeneratedPage[] = []
    const foundIds = new Set(files.map((f) => f.id))

    for (const file of files) {
      const page: GeneratedPage = {
        id: file.id,
        content: file.content,
        title:
          typeof file.frontmatter.title === 'string' &&
          file.frontmatter.title.length > 0
            ? file.frontmatter.title
            : this.formatTitle(file.id),
        description:
          typeof file.frontmatter.description === 'string'
            ? file.frontmatter.description
            : '',
      }
      pages.push(page)
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
          })
          console.warn(
            `⚠️  Archivo markdown no encontrado para '${item.link}'. Se generó un placeholder.`
          )
        }
      }
    }

    return pages
  }

  /**
   * Formatea un ID en título legible
   */
  private formatTitle(id: string): string {
    return id
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Genera el objeto de navegación prev/next basado en el orden del sidebar
   */
  private generateNavigationObject(): string {
    // Construir un array plano de los links en orden
    const orderedLinks: string[] = []
    for (const section of this.config.sidebar) {
      for (const item of section.items) {
        orderedLinks.push(item.link)
      }
    }
    // Generar el objeto de navegación
    const navigation: Record<string, { prev?: string; next?: string }> = {}
    for (let i = 0; i < orderedLinks.length; i++) {
      const current = orderedLinks[i]
      const navObj: { prev?: string; next?: string } = {}
      if (i > 0) navObj.prev = orderedLinks[i - 1]
      if (i < orderedLinks.length - 1) navObj.next = orderedLinks[i + 1]
      navigation[current] = navObj
    }
    return JSON.stringify(navigation, null, 2)
  }

  /**
   * Genera el HTML de la barra lateral
   */
  private generateSidebarContent(): string {
    // Serializa el sidebar completo como JSON para Alpine.js
    return JSON.stringify(this.config.sidebar, null, 2)
  }

  /**
   * Genera el HTML completo
   */
  private generateHTML(pages: GeneratedPage[]): string {
    // Leer template base
    const templatePath = path.join(
      this.options.inputDir,
      'templates',
      'base.html'
    )
    let template = fs.readFileSync(templatePath, 'utf-8')

    // Leer estilos externos y reemplazar placeholder si existe
    const cssPath = path.join(
      this.options.inputDir,
      'templates',
      'styles',
      'main.css'
    )
    let cssContent = ''
    if (fs.existsSync(cssPath)) {
      cssContent = fs.readFileSync(cssPath, 'utf-8')
    }
    template = template.replace(
      '{{INLINE_STYLES}}',
      `<style>\n${cssContent}\n</style>`
    )

    // Leer script principal y reemplazar placeholder
    const jsPath = path.join(
      this.options.inputDir,
      'templates',
      'assets',
      'docsApp.js'
    )
    let jsContent = ''
    if (fs.existsSync(jsPath)) {
      jsContent = fs.readFileSync(jsPath, 'utf-8')
    }
    template = template.replace(
      '{{INLINE_SCRIPTS}}',
      `<script>\n${jsContent}\n</script>`
    )

    // Generar contenido de páginas
    const pagesObject = this.generatePagesObject(pages)
    const sidebarContent = this.generateSidebarContent()
    const navigationObject = this.generateNavigationObject()

    // Reemplazar placeholders
    template = template.replace(
      '{{FAVICON}}',
      this.config.favicon || '/favicon.ico'
    )
//    this.config.logo = '';
    template = template.replace('{{LOGO_URL}}', this.config.logoUrl || '')
    template = template
      .replace(/\{\{TITLE\}\}/g, this.config.title)
      .replace('{{PAGES_CONTENT}}', pagesObject)
      .replace('{{SIDEBAR_CONTENT}}', sidebarContent)
      .replace('{{NAVIGATION_CONTENT}}', navigationObject)
      .replace('{{PRIMARY_COLOR}}', this.config.theme?.primaryColor || '')
      .replace('{{LOGO}}', this.config.logo || '')
    return template
  }

  /**
   * Genera el objeto JavaScript con todas las páginas
   */
  private generatePagesObject(pages: GeneratedPage[]): string {
    const pagesObj: Record<string, string> = {}

    for (const page of pages) {
      let content = MarkdownProcessor.escapeForJS(page.content)
      content = content.replace(/\\r/g, '') // Elimina todos los '\\r'
      content = content.replace(/\\n/g, '\n')
      pagesObj[page.id] = content
    }

    return JSON.stringify(pagesObj, null, 2)
  }

  /**
   * Escribe el archivo de salida
   */
  private writeOutput(html: string): void {
    MarkdownProcessor.ensureDirectoryExists(this.options.outputDir)
    const outputPath = path.join(this.options.outputDir, 'index.html')
    fs.writeFileSync(outputPath, html, 'utf-8')
    console.log(`📝 Archivo generado: ${outputPath}`)
  }
}

// Función principal para ejecutar el build
export async function buildDocs(): Promise<void> {
  try {
    // Importar configuración
    const configPath = path.resolve('dist/config/docs.config.js')
    const { docsConfig } = await import(configPath)

    // Opciones de construcción
    const buildOptions: BuildOptions = {
      inputDir: 'src',
      outputDir: 'dist',
      configFile: 'src/config/docs.config.ts',
      templateFile: 'src/templates/base.html',
    }

    // Crear y ejecutar builder
    const builder = new DocsBuilder(docsConfig, buildOptions)
    await builder.build()
  } catch (error) {
    console.error('❌ Error durante la construcción:', error)
    process.exit(1)
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  buildDocs()
}
