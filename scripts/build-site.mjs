import { readFile, rm, mkdir, cp, writeFile } from 'node:fs/promises';

const content = JSON.parse(await readFile('content/pages/home.json', 'utf8'));
const shell = await readFile('src/shell.html', 'utf8');
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const text = (value) => escapeHtml(value || '');
const lines = (value) => text(value).replace(/\r?\n/g, '<br>');
const media = (value) => {
  const path = String(value || '');
  if (!/^\/?assets\//.test(path) || path.includes('..') || /["'<>\r\n]/.test(path)) return '';
  return escapeHtml(path.startsWith('/') ? path : `/${path}`);
};
const img = (src, alt) => media(src) ? `<img src="${media(src)}" alt="${text(alt)}" loading="lazy">` : '';

function hero(data) {
  const sources = [
    [data.mobileWebm, 'video/webm', '(max-width: 640px)'],
    [data.mobileMp4, 'video/mp4', '(max-width: 640px)'],
    [data.desktopWebm, 'video/webm', ''],
    [data.desktopMp4, 'video/mp4', ''],
  ].filter(([src]) => media(src)).map(([src, type, query]) =>
    `<source src="${media(src)}" type="${type}"${query ? ` media="${query}"` : ''}>`).join('\n');
  return `<section class="hero" aria-labelledby="hero-title" style="background-image:url('${media(data.poster)}')">
    ${sources ? `<video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="${media(data.poster)}" aria-hidden="true">${sources}</video>` : ''}
    <div class="hero-shade"></div>
    <div class="hero-content"><p class="eyebrow eyebrow-light">${text(data.eyebrow)}</p>
      <h1 id="hero-title">${lines(data.title)}</h1><span class="short-rule" aria-hidden="true"></span>
      <p class="hero-signature">${text(data.signature)}</p></div>
    <div class="hero-caption"><span>${text(data.caption)}</span></div>
  </section>`;
}

function collection(data) {
  const flavors = (data.flavors || []).map((flavor, index) => `<article class="flavor-card">
    <a class="flavor-image" href="#lista" aria-label="Consultar disponibilidad de ${text(flavor.name)}">${img(flavor.image, flavor.alt)}<span class="card-arrow" aria-hidden="true">↗</span></a>
    <div class="flavor-meta"><h3>${text(flavor.name)}</h3><span>${String(index + 1).padStart(2, '0')}</span></div>
    <p>${text(flavor.description)}</p></article>`).join('\n');
  return `<section class="collection section-wrap" id="sabores" aria-labelledby="collection-title">
    <div class="collection-intro"><div class="collection-copy">
      <p class="eyebrow">${text(data.eyebrow)}</p><h2 id="collection-title">${text(data.title)}<br><em>${text(data.accent)}</em></h2>
      <p class="body-copy">${text(data.description)}</p><a class="text-link" href="#lista">${text(data.linkLabel)} <span aria-hidden="true">↗</span></a>
    </div><figure class="feature-cake">${img(data.featureImage, data.featureAlt)}<figcaption>${text(data.featureCaption)}</figcaption></figure>
    <div class="collection-note"><span>${text(data.note)}</span></div></div>
    <div class="flavor-grid" aria-label="Nuestros sabores">${flavors}</div>
    <div class="collection-footer"><span>${text(data.footerLabel)}</span><span>↓</span></div>
  </section>`;
}

function story(data) {
  return `<section class="story" id="historia" aria-labelledby="story-title">
    ${img(data.image, data.alt)}<div class="story-overlay"></div>
    <div class="story-content"><p class="eyebrow eyebrow-light">${text(data.eyebrow)}</p>
      <h2 id="story-title">${lines(data.title)}<br><em>${text(data.accent)}</em></h2>
      <span class="short-rule" aria-hidden="true"></span><p>${text(data.description)}</p>
      <a class="story-link" href="#pedidos">${text(data.linkLabel)} <span aria-hidden="true">↗</span></a></div>
    <span class="story-side-note">${text(data.sideNote)}</span>
  </section>`;
}

function extra(section, index) {
  const id = `editorial-${index + 1}`;
  if (section._template === 'editorial') return `<section class="extra-editorial section-wrap" id="${id}">
    <div class="extra-editorial-copy"><p class="eyebrow">${text(section.eyebrow)}</p><h2>${text(section.title)}</h2><p class="body-copy">${text(section.description)}</p></div>
    ${img(section.image, section.alt)}</section>`;
  if (section._template === 'imageBanner') return `<section class="extra-banner" id="${id}">
    ${img(section.image, section.alt)}<div class="extra-banner-shade"></div>
    <div class="extra-banner-copy"><p class="eyebrow eyebrow-light">${text(section.eyebrow)}</p><h2>${text(section.title)}</h2></div></section>`;
  if (section._template === 'statement') return `<section class="extra-statement section-wrap" id="${id}">
    <p class="eyebrow">${text(section.eyebrow)}</p><h2>${lines(section.title)}</h2></section>`;
  throw new Error(`Tipo de sección desconocido: ${section._template}`);
}

function waitlist(data) {
  return `<section class="waitlist section-wrap" id="lista" aria-labelledby="waitlist-title">
    <div class="waitlist-heading"><p class="eyebrow">${text(data.eyebrow)}</p>
      <h2 id="waitlist-title">${text(data.title)}<br><em>${text(data.accent)}</em></h2>
      <p class="body-copy">${text(data.description)}</p></div>
    <form class="waitlist-form" id="waitlist-form" novalidate>
      <label class="visually-hidden" for="name">Nombre</label><input id="name" name="name" type="text" autocomplete="name" placeholder="Nombre" required>
      <label class="visually-hidden" for="phone">WhatsApp</label><input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="WhatsApp · +52 656 000 0000" required>
      <label class="visually-hidden" for="flavor">Sabor favorito (opcional)</label><select id="flavor" name="flavor">
        <option value="">Sabor favorito (opcional)</option><option>Clásico</option><option>Lotus</option><option>Frutos rojos</option></select>
      <div class="honeypot" aria-hidden="true"><label for="website">Sitio web</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
      <label class="consent"><input type="checkbox" name="consent" required><span>${text(data.consentText)}</span></label>
      <button class="button button-dark form-submit" type="submit">${text(data.buttonLabel)} <span aria-hidden="true">→</span></button>
      <p class="form-message" id="form-message" role="status" aria-live="polite">${text(data.helperText)}</p>
    </form></section>`;
}

const sections = [hero(content.hero), collection(content.collection), story(content.story),
  ...(content.extraSections || []).map(extra), waitlist(content.waitlist)].join('\n');
let html = shell.replace(/<main id="contenido">[\s\S]*?<\/main>/, () => `<main id="contenido">${sections}</main>`);
html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${text(content.seoTitle)}</title>`);
const setMeta = (property, value) => {
  html = html.replace(new RegExp(`(<meta ${property} content=")[^"]*(")`), (_, before, after) => before + value + after);
};
setMeta('name="description"', text(content.seoDescription));
setMeta('property="og:title"', text(content.seoTitle));
setMeta('property="og:description"', text(content.seoDescription));
setMeta('property="og:image"', media(content.hero.poster));
html = html.replace(/(<footer class="site-footer"[\s\S]*?<p>)[\s\S]*?(<\/p>)/, (_, before, after) => before + text(content.footer.tagline) + after);
html = html.replace(/(<footer class="site-footer"[\s\S]*?<a href="#lista">)[\s\S]*?( <span aria-hidden="true">↗<\/span><\/a>)/, (_, before, after) => before + text(content.footer.linkLabel) + after);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await Promise.all(['assets', 'styles.css', 'script.js', 'site-config.js', 'CNAME'].map((name) =>
  cp(name, `dist/${name}`, { recursive: true })));
await writeFile('dist/index.html', html);
console.log(`Sitio generado: ${content.extraSections?.length || 0} secciones adicionales.`);
