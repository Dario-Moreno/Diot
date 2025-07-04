# 📚 Docs SPA Builder

Un constructor de documentación que convierte archivos Markdown en una **Single Page Application (SPA)** completamente funcional y autónoma.

## 🌟 Características

- **🚀 SPA completa**: Todo embebido en un solo archivo HTML
- **📱 Responsive**: Diseño adaptativo para todos los dispositivos
- **🌙 Modo oscuro**: Soporte nativo para tema oscuro/claro
- **🔍 Búsqueda**: Funcionalidad de búsqueda integrada
- **📖 Tabla de contenidos**: Navegación automática por secciones
- **⚡ Rápido**: Sin navegación entre páginas, todo es instantáneo
- **🎨 Personalizable**: Colores, logo y estructura configurable

## 🎯 Problema que resuelve

Si necesitas hostear documentación en un entorno donde:

- No puedes usar rutas convencionales (about.html, contact.html, etc.)
- Solo puedes subir un archivo HTML estático
- Necesitas que funcione sin servidor web

Este proyecto es para ti. Genera un solo archivo `index.html` que contiene toda tu documentación.

## 🚀 Inicio rápido

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Efficientix-MX/netDoc.git
cd netDoc

# Instalar dependencias
npm install

# Inicializar proyecto
npm run init

# Construir documentación
npm run build
```

### Uso básico

1. **Crear archivos Markdown** en `src/content/docs/`
2. **Configurar la navegación** en `src/config/docs.config.ts`
3. **Ejecutar el build** con `npm run build`
4. **¡Listo!** Tu documentación está en `docs/index.html`

## 📁 Estructura del proyecto

```
docs-spa-builder/
├── src/
│   ├── content/
│   │   └── docs/              # 📄 Archivos Markdown
│   │       ├── introduction.md
│   │       ├── installation.md
│   │       └── ...
│   ├── config/
│   │   └── docs.config.ts     # ⚙️ Configuración
│   └── templates/
│       └── base.html          # 🎨 Template HTML
├── scripts/
│   ├── build.ts              # 🔨 Script de construcción
│   ├── cli.ts                # 💻 CLI
│   ├── types.ts              # 📋 Tipos TypeScript
│   └── utils.ts              # 🛠️ Utilidades
├── docs/
│   └── index.html            # 🎯 Archivo generado
├── package.json
└── README.md
```

## ⚙️ Configuración

### docs.config.ts

```typescript
export const docsConfig: DocsConfig = {
  title: 'Mi Documentación',
  logo: '📚',
  theme: {
    primaryColor: '#3b82f6',
    darkMode: true,
  },
  sidebar: [
    {
      title: 'Guía de Inicio',
      items: [
        {
          label: 'Introducción',
          link: 'introduction',
          file: 'introduction.md',
        },
      ],
    },
  ],
}
```

### Frontmatter en Markdown

```markdown
---
title: Mi Página
description: Descripción de la página
---

# Mi Página

Contenido de la página...
```

## 🔧 Comandos

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con hot-reload
npm run build        # Construir documentación
npm run serve        # Servir archivos estáticos

# Utilidades
npm run clean        # Limpiar archivos generados
npm run watch        # Observar cambios
npm run lint         # Linter de código
npm run format       # Formatear código
```

## 📖 Características técnicas

### Tecnologías utilizadas

- **TypeScript**: Tipado fuerte y mejor experiencia de desarrollo
- **Alpine.js**: Reactividad del frontend sin complejidad
- **Marked.js**: Procesamiento de Markdown
- **CSS Grid**: Layout moderno y responsive
- **CSS Variables**: Theming dinámico

### Arquitectura

1. **Fase de construcción**: Los archivos Markdown se procesan y embeben en el HTML
2. **Runtime**: Alpine.js maneja la navegación y interactividad
3. **Resultado**: Un solo archivo HTML completamente funcional

## 🎨 Personalización

### Colores y tema

Modifica las variables CSS en `src/templates/base.html`:

```css
:root {
  --accent-color: #3b82f6;
  --bg-primary: #ffffff;
  /* ... más variables */
}
```

### Layout

El diseño usa CSS Grid con tres columnas:

- Sidebar (280px)
- Contenido principal (flexible)
- Tabla de contenidos (200px)

### Responsive

- **Desktop**: Vista completa con sidebar y TOC
- **Tablet**: Solo contenido principal y TOC
- **Mobile**: Solo contenido principal

## 🔍 Funcionalidades

### Búsqueda

Búsqueda en tiempo real que resalta coincidencias en el contenido actual.

### Navegación

- Sidebar con secciones organizadas
- Tabla de contenidos automática
- Enlaces internos entre páginas

## 🚀 Despliegue

El archivo generado `docs/index.html` es completamente autónomo:

- **Netlify**: Arrastra y suelta el archivo
- **Vercel**: Sube el archivo directamente
- **GitHub Pages**: Commit del archivo a tu repositorio
- **FTP**: Sube el archivo a tu hosting
- **Cualquier CDN**: Sube el archivo donde necesites

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 🙋‍♂️ Soporte

- **Issues**: [GitHub Issues](https://github.com/Efficientix-MX/netDoc/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Efficientix-MX/netDoc/discussions)

---
