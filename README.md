# Cheese♥Cake

Sitio estático en GitHub Pages con contenido editable mediante TinaCMS y TinaCloud. La lista de espera sigue conectada a Google Sheets mediante Apps Script.

## Contenido y secciones

El contenido de la página está en `content/pages/home.json`. Tina edita ese archivo desde `/admin/` una vez conectado a TinaCloud. Incluye portada, colección de sabores, historia, lista de espera y pie de página. En «Secciones adicionales» se pueden agregar, quitar y reordenar tres bloques: texto e imagen, imagen a todo lo ancho y frase editorial. Estos bloques aparecen entre historia y lista de espera.

Las fotos que se suben desde el editor se guardan en `assets/` dentro del repositorio, junto con las imágenes y videos actuales. El archivo `src/shell.html` contiene la estructura fija de navegación y metadatos; `scripts/build-site.mjs` renderiza la página usando el contenido de Tina.

Los sabores de la colección son editables, pero el selector «Sabor favorito» del formulario permanece con Clásico, Lotus y Frutos rojos porque el Apps Script publicado solo admite esos valores. Si se cambia esa lista, hay que actualizar y volver a desplegar `apps-script/Code.gs` antes de cambiar las opciones del formulario.

## Desarrollo local

```sh
npm ci
npm run build:site
python3 -m http.server 8000 --directory dist
```

Abre `http://localhost:8000`. Para probar el esquema y compilar el admin con el backend local de Tina:

```sh
TINA_PUBLIC_CLIENT_ID=local-test TINA_TOKEN=local-test npx tinacms build --local --skip-cloud-checks
```

Esa versión local del admin no debe publicarse: está conectada a un servidor local. La compilación de producción requiere las credenciales reales de TinaCloud.

## Conectar TinaCloud

1. Crea un proyecto en [TinaCloud](https://app.tina.io/) y conecta `totogarza/cheeselovecake`, rama `main`.
2. Copia el **Client ID** del proyecto como variable del repositorio GitHub `TINA_PUBLIC_CLIENT_ID`.
3. Crea un **Read Only Token** en TinaCloud y guárdalo como secreto de GitHub `TINA_TOKEN`. Nunca lo incluyas en el repositorio ni en una variable pública.
4. Ejecuta de nuevo el workflow «Deploy to GitHub Pages». La acción compilará `dist/admin/index.html` y el editor quedará en `https://cheeselovecake.com/admin/`.
5. Autoriza en TinaCloud a las personas que podrán editar. Al guardar, TinaCloud crea un commit en `main` y GitHub Pages publica la nueva versión.

Sin esas dos variables, el workflow publica el sitio normalmente y omite el admin para evitar ofrecer una pantalla sin conexión.

GitHub Pages no ejecuta el endpoint de vista previa en vivo que usa el editor visual de Tina. El admin funciona con formularios para editar bloques, fotos y textos; la página actualizada se ve tras la publicación. Una vista previa en vivo requeriría un hosting gestionado con funciones bajo demanda.

## Publicación y formulario

`.github/workflows/pages.yml` instala dependencias, genera `dist/` y lo publica en GitHub Pages. El dominio canónico está en `CNAME`. El receptor de la lista de espera está en `apps-script/Code.gs`; la configuración pública está en `site-config.js`. La hoja de solicitudes es privada. Consulta `apps-script/README.md` para el despliegue del receptor.

El hero usa WebM, MP4 de respaldo y encuadres separados para escritorio y móvil. `assets/hero.webp` se conserva como poster y fondo de respaldo. Las fuentes y el comando de exportación están en `video-source/`.
