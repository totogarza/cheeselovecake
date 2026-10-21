# Cheese♥Cake

Landing page estática mobile first, lista para GitHub Pages. Está hecha con HTML, CSS y JavaScript sin dependencias de build.

## Desarrollo local

Abre `index.html` en el navegador o ejecuta un servidor estático, por ejemplo:

```sh
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

## Configuración del sitio

El formulario de espera queda desactivado hasta configurar una URL de Apps Script en `googleAppsScriptUrl` dentro de `site-config.js`. El receptor y sus pasos de publicación están en [`apps-script/README.md`](apps-script/README.md). Antes de abrirlo al público, confirma que quieres aceptar solicitudes anónimas y guardar nombre, WhatsApp, sabor y consentimiento en la hoja privada.

Configura `instagramUrl` con el perfil oficial cuando esté disponible. Revisa también la ciudad, las fotografías y el texto de marca antes del lanzamiento.

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` publica el contenido del repositorio en GitHub Pages cada vez que se actualiza `main`. En el repositorio, activa **Settings → Pages → Build and deployment → GitHub Actions**. No necesita compilación ni configuración de rutas base.

Las imágenes del sitio están en `assets/` en WebP para reducir su peso. Los textos están en `index.html` y los colores, tipografías y puntos de quiebre en `styles.css`.


## Lista de espera en Google Sheets

La hoja privada tiene columnas para fecha, nombre, WhatsApp, sabor, consentimiento y estado. Para conectar el formulario, sigue los pasos de [`apps-script/README.md`](apps-script/README.md). El endpoint debe autorizar visitantes anónimos para recibir registros desde GitHub Pages; el formulario no enviará datos hasta configurarlo en `site-config.js`.
