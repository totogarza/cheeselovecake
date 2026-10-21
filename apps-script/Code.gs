const SHEET_NAME = 'Solicitudes';
const VALID_FLAVORS = ['', 'Clásico', 'Lotus', 'Frutos rojos'];

function doGet() {
  return ContentService.createTextOutput('Cheese♥Cake waitlist endpoint is ready.');
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Silent honeypot response: bots appear successful but are not recorded.
    if (String(payload.website || '').trim()) return json_({ ok: true });

    const name = safeText_(payload.name, 80);
    const phone = String(payload.phone || '').replace(/\D/g, '').slice(0, 15);
    const flavor = String(payload.flavor || '').trim();
    const consent = payload.consent === true;

    if (name.length < 2 || phone.length < 10 || phone.length > 15 || !consent) {
      return json_({ ok: false, error: 'Datos incompletos o inválidos.' });
    }
    if (!VALID_FLAVORS.includes(flavor)) {
      return json_({ ok: false, error: 'Sabor no válido.' });
    }

    const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('Falta definir la propiedad SPREADSHEET_ID.');

    const phoneKey = 'phone:' + Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, phone)
    ).slice(0, 32);
    const cache = CacheService.getScriptCache();
    if (cache.get(phoneKey)) return json_({ ok: true, duplicate: true });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error('No se encontró la pestaña ' + SHEET_NAME + '.');
      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 3).setNumberFormat('@');
      sheet.getRange(row, 1, 1, 6).setValues([[
        new Date(),
        safeText_(name, 80),
        phone,
        flavor || 'Sin preferencia',
        'Sí',
        'Pendiente'
      ]]);
      cache.put(phoneKey, '1', 300);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'No se pudo guardar la solicitud.' });
  }
}

function safeText_(value, maxLength) {
  const text = String(value || '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
