const SHEET_NAME = 'Solicitudes';
const RECEIPT_COLUMN = 7;
const RECEIPT_HEADER = 'ID de solicitud';
const VALID_FLAVORS = ['', 'Clásico', 'Lotus', 'Frutos rojos'];
const RECEIPT_PATTERN = /^[a-f0-9]{32}$/;

function doGet(e) {
  const receipt = String((e && e.parameter && e.parameter.receipt) || '');
  if (!receipt) return ContentService.createTextOutput('Cheese♥Cake waitlist endpoint is ready.');

  // The public status endpoint returns only a state for an unguessable receipt ID.
  // No name, phone number, or sheet contents are exposed.
  let status = 'pending';
  if (RECEIPT_PATTERN.test(receipt)) {
    try {
      const cached = CacheService.getScriptCache().get('receipt:' + receipt);
      if (cached) {
        status = cached;
      } else {
        const sheet = getSheet_();
        if (sheet.getLastRow() > 1 && sheet.getRange(1, RECEIPT_COLUMN).getValue() === RECEIPT_HEADER) {
          const match = sheet.getRange(2, RECEIPT_COLUMN, sheet.getLastRow() - 1, 1)
            .createTextFinder(receipt).matchEntireCell(true).findNext();
          if (match) status = 'received';
        }
      }
    } catch (error) {
      console.error(error);
      status = 'pending';
    }
  }

  // Script-tag polling works around Apps Script's cross-origin response redirect.
  const result = { receipt: receipt, status: status };
  return ContentService
    .createTextOutput('window.CheeseLoveCakeReceipt(' + JSON.stringify(result) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
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
    const receipt = String(payload.receipt || '');

    if (name.length < 2 || phone.length < 10 || phone.length > 15 || !consent || !RECEIPT_PATTERN.test(receipt)) {
      return json_({ ok: false, error: 'Datos incompletos o inválidos.' });
    }
    if (!VALID_FLAVORS.includes(flavor)) {
      return json_({ ok: false, error: 'Sabor no válido.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();
      ensureReceiptColumn_(sheet);
      if (sheet.getLastRow() > 1) {
        const existing = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1)
          .createTextFinder(phone).matchEntireCell(true).findNext();
        if (existing) {
          CacheService.getScriptCache().put('receipt:' + receipt, 'duplicate', 600);
          return json_({ ok: true, duplicate: true });
        }
      }
      const row = sheet.getLastRow() + 1;
      sheet.getRange(row, 3).setNumberFormat('@');
      sheet.getRange(row, 1, 1, RECEIPT_COLUMN).setValues([[
        new Date(),
        name,
        phone,
        flavor || 'Sin preferencia',
        'Sí',
        'Pendiente',
        receipt
      ]]);
      SpreadsheetApp.flush();
      CacheService.getScriptCache().put('receipt:' + receipt, 'received', 600);
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'No se pudo guardar la solicitud.' });
  }
}

function getSheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('Falta definir la propiedad SPREADSHEET_ID.');
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('No se encontró la pestaña ' + SHEET_NAME + '.');
  return sheet;
}

function ensureReceiptColumn_(sheet) {
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const values = sheet.getRange(1, RECEIPT_COLUMN, lastRow, 1).getDisplayValues();
  if (values[0][0] === RECEIPT_HEADER) return;
  if (values.some(function (row) { return row[0] !== ''; })) {
    throw new Error('La columna G ya contiene datos ajenos a los recibos.');
  }
  sheet.getRange(1, RECEIPT_COLUMN).setValue(RECEIPT_HEADER);
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
