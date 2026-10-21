# Conectar la lista de espera con Google Sheets

El archivo `Code.gs` recibe solicitudes del formulario y las agrega a la pestaña `Solicitudes` de la hoja privada Cheese♥Cake. No contiene credenciales. Guarda el ID de la hoja en las propiedades del proyecto de Apps Script.

## Configuración pendiente en la cuenta de Google

1. Crea un proyecto en [Google Apps Script](https://script.google.com/home/start) y pega `Code.gs`.
2. En **Configuración del proyecto → Propiedades del script**, agrega `SPREADSHEET_ID` con el ID de la hoja privada **Cheese♥Cake — Lista de espera**.
3. En **Implementar → Nueva implementación → Aplicación web**, selecciona **Ejecutar como: yo** y **Quién tiene acceso: cualquiera**.
4. Google pedirá autorizar que el script escriba en la hoja. Revisa y acepta esos permisos en tu cuenta.
5. Copia la URL que termina en `/exec` y pégala como `googleAppsScriptUrl` en `site-config.js`.

El acceso "cualquiera" permite que visitantes sin iniciar sesión envíen el formulario. El endpoint solo acepta escrituras con nombre, WhatsApp, sabor y consentimiento; valida campos, usa una trampa anti-bots y evita solicitudes duplicadas del mismo número durante cinco minutos. Al ser público, puede recibir spam. Mantén la hoja sin compartir públicamente.

Hasta que se complete el despliegue y se configure la URL `/exec`, el formulario informa que todavía no puede recibir solicitudes y no envía los datos.
