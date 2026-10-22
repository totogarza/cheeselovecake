import { defineConfig } from 'tinacms';

const text = (name: string, label: string, required = false) => ({
  type: 'string' as const,
  name,
  label,
  required,
});

const paragraph = (name: string, label: string) => ({
  ...text(name, label),
  ui: { component: 'textarea' as const },
});

const image = (name: string, label: string) => ({
  type: 'image' as const,
  name,
  label,
});

const video = (name: string, label: string) => ({
  ...image(name, label),
  accept: 'video' as const,
});

export default defineConfig({
  branch: process.env.TINA_PUBLIC_BRANCH || 'main',
  clientId: process.env.TINA_PUBLIC_CLIENT_ID || '',
  token: process.env.TINA_TOKEN || '',
  build: {
    publicFolder: 'dist',
    outputFolder: 'admin',
  },
  media: {
    tina: {
      publicFolder: '.',
      mediaRoot: 'assets',
    },
  },
  schema: {
    collections: [
      {
        name: 'home',
        label: 'Página principal',
        path: 'content/pages',
        format: 'json',
        match: { include: 'home' },
        ui: { global: true },
        fields: [
          text('seoTitle', 'Título para buscadores', true),
          paragraph('seoDescription', 'Descripción para buscadores'),
          {
            type: 'object', name: 'hero', label: 'Portada',
            fields: [
              text('eyebrow', 'Texto superior'), paragraph('title', 'Título principal (saltos de línea permitidos)'),
              text('signature', 'Firma'), text('caption', 'Ubicación'),
              image('poster', 'Imagen de respaldo'),
              video('desktopWebm', 'Video escritorio WebM'), video('desktopMp4', 'Video escritorio MP4'),
              video('mobileWebm', 'Video móvil WebM'), video('mobileMp4', 'Video móvil MP4'),
            ],
          },
          {
            type: 'object', name: 'collection', label: 'Colección de sabores',
            fields: [
              text('eyebrow', 'Texto superior'), text('title', 'Título'), text('accent', 'Título en cursiva'),
              paragraph('description', 'Descripción'), text('linkLabel', 'Texto del enlace'),
              image('featureImage', 'Imagen principal'), text('featureAlt', 'Descripción de la imagen'),
              text('featureCaption', 'Pie de imagen'), text('note', 'Nota'), text('footerLabel', 'Texto inferior'),
              {
                type: 'object', name: 'flavors', label: 'Sabores', list: true,
                ui: { itemProps: (item) => ({ label: item?.name || 'Sabor' }) },
                fields: [
                  text('name', 'Nombre', true), paragraph('description', 'Descripción'),
                  image('image', 'Fotografía'), text('alt', 'Descripción de la fotografía'),
                ],
              },
            ],
          },
          {
            type: 'object', name: 'story', label: 'Historia',
            fields: [
              image('image', 'Fotografía'), text('alt', 'Descripción de la fotografía'),
              text('eyebrow', 'Texto superior'), paragraph('title', 'Título (saltos de línea permitidos)'),
              text('accent', 'Título en cursiva'), paragraph('description', 'Párrafo'),
              text('linkLabel', 'Texto del enlace'), text('sideNote', 'Nota lateral'),
            ],
          },
          {
            type: 'object', name: 'extraSections', label: 'Secciones adicionales', list: true,
            templates: [
              {
                name: 'editorial', label: 'Texto e imagen',
                fields: [
                  text('eyebrow', 'Texto superior'), text('title', 'Título'),
                  paragraph('description', 'Párrafo'), image('image', 'Fotografía'),
                  text('alt', 'Descripción de la fotografía'),
                ],
              },
              {
                name: 'imageBanner', label: 'Imagen a todo lo ancho',
                fields: [
                  image('image', 'Fotografía'), text('alt', 'Descripción de la fotografía'),
                  text('eyebrow', 'Texto superior'), text('title', 'Título'),
                ],
              },
              {
                name: 'statement', label: 'Frase editorial',
                fields: [text('eyebrow', 'Texto superior'), paragraph('title', 'Frase')],
              },
            ],
          },
          {
            type: 'object', name: 'waitlist', label: 'Lista de espera',
            fields: [
              text('eyebrow', 'Texto superior'), text('title', 'Título'), text('accent', 'Título en cursiva'),
              paragraph('description', 'Descripción'), text('buttonLabel', 'Botón'),
              text('helperText', 'Mensaje debajo del formulario'), paragraph('consentText', 'Consentimiento'),
            ],
          },
          {
            type: 'object', name: 'footer', label: 'Pie de página',
            fields: [text('tagline', 'Frase'), text('linkLabel', 'Enlace')],
          },
        ],
      },
    ],
  },
});
