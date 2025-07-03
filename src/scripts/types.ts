export interface DocsConfig {
  title: string
  logo?: string
  logoUrl?: string
  favicon?: string
  theme?: {
    primaryColor: string
    darkMode: boolean
  }
  sidebar: SidebarSection[]
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
  collapsed?: boolean // Si la sección inicia colapsada
}

export interface SidebarItem {
  label: string
  link: string
  file: string
}

export interface MarkdownFile {
  id: string
  content: string
  frontmatter: Record<string, unknown>
}

export interface GeneratedPage {
  id: string
  content: string
  title: string
  description?: string
}

export interface BuildOptions {
  inputDir: string
  outputDir: string
  configFile: string
  templateFile: string
}
