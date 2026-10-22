# Conectar la lista de espera con Google Sheets

El archivo `Code.gs` recibe solicitudes del formulario y las agrega a la pestaña `Solicitudes` de la hoja privada Cheese♥Cake. No contiene credenciales. Guarda el ID de la hoja en las propiedades del proyecto de Apps Script.

## Implementación actual

El proyecto **Cheese♥Cake — Lista de espera** está desplegado como aplicación web, ejecutada con la cuenta propietaria y accesible para cualquiera. Su URL `/exec` está en `site-config.js`. La propiedad `SPREADSHEET_ID` apunta a la hoja privada y la pestaña de destino es `Solicitudes`. Para publicar cambios en `Code.gs`, actualiza el código del proyecto y crea una nueva versión de la implementación existente; así se conserva la URL.

## Configuración en otra cuenta de Google

1. Crea un proyecto en [Google Apps Script](https://script.google.com/home/start) y pega `Code.gs`.
2. En **Configuración del proyecto → Propiedades del script**, agrega `SPREADSHEET_ID` con el ID de la hoja privada **Cheese♥Cake — Lista de espera**.
3. En **Implementar → Nueva implementación → Aplicación web**, selecciona **Ejecutar como: yo** y **Quién tiene acceso: cualquiera**.
4. Google pedirá autorizar que el script escriba en la hoja. Revisa y acepta esos permisos en tu cuenta.
5. Copia la URL que termina en `/exec` y pégala como `googleAppsScriptUrl` en `site-config.js`.

El acceso "cualquiera" permite que visitantes sin iniciar sesión envíen el formulario. El endpoint valida nombre, WhatsApp, sabor, consentimiento y un identificador aleatorio, usa una trampa anti-bots y evita solicitudes duplicadas del mismo número. La primera solicitud nueva agrega su identificador en la columna G (`ID de solicitud`). La consulta de estado solo devuelve `received`, `duplicate` o `pending` para ese identificador; nunca devuelve nombre, teléfono ni filas de la hoja. El sitio muestra éxito solo después de confirmar el registro.

Al ser público, el endpoint puede recibir spam. Mantén la hoja sin compartir públicamente. Los contactos quedan en Sheets, no en TinaCMS ni en GitHub.

El sitio bloquea los envíos desde páginas HTTP para proteger los datos de contacto. El formulario estará disponible al quedar activo el certificado HTTPS del dominio.
