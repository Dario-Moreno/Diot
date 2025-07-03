// scripts/utils.ts
import * as fs from 'fs'
import * as path from 'path'
import { MarkdownFile } from './types'

export class MarkdownProcessor {
  /**
   * Lee un archivo markdown y extrae frontmatter
   */
  static readMarkdownFile(filePath: string): MarkdownFile {
    const fullPath = path.resolve(filePath)
    const content = fs.readFileSync(fullPath, 'utf-8')

    const { frontmatter, body } = this.parseFrontmatter(content)
    const id = path.basename(filePath, '.md')

    return {
      id,
      content: body,
      frontmatter,
    }
  }

  /**
   * Extrae frontmatter de un archivo markdown
   */
  static parseFrontmatter(content: string): {
    frontmatter: Record<string, string>
    body: string
  } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = content.match(frontmatterRegex)

    if (!match) {
      return { frontmatter: {}, body: content }
    }

    const frontmatterText = match[1]
    const body = match[2]

    // Parse simple YAML-like frontmatter
    const frontmatter: Record<string, string> = {}
    frontmatterText.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim()
        frontmatter[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    })

    return { frontmatter, body }
  }

  /**
   * Escapa contenido para embeber en JavaScript
   */
  static escapeForJS(content: string): string {
    return content
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
//      .replace(/"/g, '\\"') // NO ESCAPES COMILLAS DOBLES
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
  }

  /**
   * Genera un slug desde un texto
   */
  static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Crea directorios si no existen
   */
  static ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  /**
   * Lee todos los archivos markdown de un directorio
   */
  static readMarkdownFiles(directory: string): MarkdownFile[] {
    const files: MarkdownFile[] = []

    if (!fs.existsSync(directory)) {
      console.warn(`Directorio no encontrado: ${directory}`)
      return files
    }

    const entries = fs.readdirSync(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(this.readMarkdownFile(fullPath))
      } else if (entry.isDirectory()) {
        // Recursivamente leer subdirectorios
        files.push(...this.readMarkdownFiles(fullPath))
      }
    }

    return files
  }
}
