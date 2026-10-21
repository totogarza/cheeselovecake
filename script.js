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

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  showMessage('Enviando tu solicitud…');
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name, phone: phoneDigits, flavor, consent, website })
    });
    showMessage('Gracias. Enviamos tu solicitud y te contactaremos cuando haya una nueva tanda.');
    form.reset();
  } catch {
    showMessage('No pudimos enviar tu solicitud. Inténtalo de nuevo en un momento.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('is-error', isError);
}
