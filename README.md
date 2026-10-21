# Cheese♥Cake

Landing page estática mobile first, lista para GitHub Pages. Está hecha con HTML, CSS y JavaScript sin dependencias de build.

## Desarrollo local

Abre `index.html` en el navegador o ejecuta un servidor estático, por ejemplo:

```sh
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

## Configuración del sitio

El formulario de espera está conectado al Web App de Apps Script configurado en `site-config.js`. El receptor está en [`apps-script/Code.gs`](apps-script/Code.gs) y guarda los registros en la hoja privada. Por seguridad, el formulario solo envía solicitudes desde una página servida por HTTPS (o durante pruebas locales).

Configura `instagramUrl` con el perfil oficial cuando esté disponible. Revisa también la ciudad, las fotografías y el texto de marca antes del lanzamiento.

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` publica el contenido del repositorio en GitHub Pages cada vez que se actualiza `main`. Pages está configurado para usar GitHub Actions y el dominio canónico `cheeselovecake.com`. No necesita compilación ni configuración de rutas base.

Las imágenes y los videos del hero están en `assets/`. El hero usa WebM, MP4 de respaldo, encuadres separados para escritorio y móvil, y una imagen poster. Los cuatro fotogramas fuente y el comando reproducible de exportación están en `video-source/`; ejecuta `bash video-source/build-hero.sh` para regenerar los videos con FFmpeg. Es una secuencia de fotografías animadas con movimientos suaves de cámara, preparada para sustituirse por metraje filmado más adelante. Los textos están en `index.html` y los colores, tipografías y puntos de quiebre en `styles.css`.


## Lista de espera en Google Sheets

La hoja privada tiene columnas para fecha, nombre, WhatsApp, sabor, consentimiento y estado. La implementación actual permite que visitantes anónimos envíen solicitudes; la hoja no es pública. Los detalles del receptor y la forma de actualizarlo están en [`apps-script/README.md`](apps-script/README.md).
