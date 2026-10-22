const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const form = document.querySelector('#waitlist-form');
const message = document.querySelector('#form-message');
const submitButton = form.querySelector('[type="submit"]');
const instagramLink = document.querySelector('[data-instagram]');
const instagramUrl = window.CHEESE_LOVE_CAKE?.instagramUrl || '';
if (instagramUrl) {
  instagramLink.href = instagramUrl;
  instagramLink.hidden = false;
}

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menú');
  nav.classList.remove('is-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  nav.classList.toggle('is-open', !isOpen);
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
document.querySelector('#year').textContent = new Date().getFullYear();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.classList.remove('is-error');
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const phone = String(data.get('phone') || '').trim();
  const flavor = String(data.get('flavor') || '');
  const consent = data.get('consent') === 'on';
  const website = String(data.get('website') || '').trim();
  const phoneDigits = phone.replace(/\D/g, '');

  if (name.length < 2) return showMessage('Escribe tu nombre para continuar.', true);
  if (phoneDigits.length < 10 || phoneDigits.length > 15) return showMessage('Revisa tu número de WhatsApp, incluyendo la lada.', true);
  if (!consent) return showMessage('Necesitamos tu autorización para guardar tus datos y contactarte.', true);

  const endpoint = window.CHEESE_LOVE_CAKE?.googleAppsScriptUrl?.trim() || '';
  if (!endpoint) return showMessage('La lista aún no recibe solicitudes. Falta conectar Google Sheets.', true);
  if (location.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
    return showMessage('Por seguridad, la lista estará disponible cuando HTTPS esté activo.', true);
  }

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  showMessage('Enviando tu solicitud…');
  try {
    const receipt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0')).join('');
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, phone: phoneDigits, flavor, consent, website, receipt })
    });
    showMessage('Confirmando que recibimos tu solicitud…');
    const status = await confirmReceipt(endpoint, receipt);
    showMessage(status === 'duplicate'
      ? 'Ya tenemos tu registro. Te avisaremos cuando abramos nuevos pedidos.'
      : 'Gracias. Registramos tu interés y te avisaremos cuando abramos nuevos pedidos.');
    form.reset();
  } catch {
    showMessage('No pudimos confirmar el registro. Espera un momento antes de intentarlo de nuevo.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('is-error', isError);
}

async function confirmReceipt(endpoint, receipt) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const status = await readReceiptStatus(endpoint, receipt).catch(() => 'pending');
    if (status === 'received' || status === 'duplicate') return status;
    if (attempt < 4) await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  throw new Error('Receipt not confirmed');
}

function readReceiptStatus(endpoint, receipt) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const url = new URL(endpoint);
    url.searchParams.set('receipt', receipt);
    url.searchParams.set('_', Date.now().toString());
    let finished = false;
    const finish = (result, error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      delete window.CheeseLoveCakeReceipt;
      script.remove();
      if (error) reject(error);
      else resolve(result);
    };
    const timeout = setTimeout(() => finish(null, new Error('Receipt check timed out')), 7000);
    window.CheeseLoveCakeReceipt = (result) => {
      if (result?.receipt === receipt) finish(result.status);
    };
    script.onerror = () => finish(null, new Error('Receipt check failed'));
    script.src = url.toString();
    document.head.append(script);
  });
}
