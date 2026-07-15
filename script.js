/* ==========================================================
   PICTURE PERFECT
   Used only by index.html and album.html.
   ========================================================== */

/* ---------- hamburger menu ---------- */
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');

if (hamburger && nav) {
  hamburger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.classList.toggle('nav-open', open);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      document.body.classList.remove('nav-open');
    });
  });
}

/* ---------- scroll trigger (scroll listener + light timer) ---------- */
function onScrollIntoView(section, fraction, callback) {
  let done = false;

  function check() {
    if (done) return;
    const rect = section.getBoundingClientRect();
    const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visible > Math.min(rect.height, window.innerHeight) * fraction) {
      done = true;
      window.removeEventListener('scroll', check);
      clearInterval(watcher);
      callback();
    }
  }

  window.addEventListener('scroll', check, { passive: true });
  const watcher = setInterval(check, 250);
  check();
}

/* ---------- generic reveals: [data-reveal] fades up in view ---------- */
document.querySelectorAll('[data-reveal]').forEach((el) => {
  onScrollIntoView(el, 0.25, () => el.classList.add('is-in'));
});

/* ---------- curtains: [data-curtain] slides open in view ---------- */
document.querySelectorAll('.curtain').forEach((el) => {
  onScrollIntoView(el, 0.35, () => el.classList.add('is-in'));
});

/* ---------- hero: play the line reveal right after load ---------- */
const hero = document.querySelector('.hero');
if (hero) {
  setTimeout(() => hero.classList.add('play'), 200);
}

/* ---------- trouw: handwriting wipe when scrolled into view ---------- */
const trouw = document.querySelector('.trouw');
if (trouw) {
  onScrollIntoView(trouw, 0.100, () => trouw.classList.add('play'));
}

/* ---------- blur-in titles ---------- */
document.querySelectorAll('.blur-in').forEach((el) => {
  onScrollIntoView(el, 0.5, () => el.classList.add('play'));
});

/* ---------- letters cascade: split text, play in view ---------- */
document.querySelectorAll('.cascade').forEach((el) => {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.textContent = ch === ' ' ? ' ' : ch;
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    el.appendChild(s);
  });
  onScrollIntoView(el, 0.6, () => el.classList.add('play'));
});

/* ---------- work index: floating photo preview ---------- */
const workSection = document.querySelector('.work');
const workPreview = document.querySelector('.work__preview');

if (workSection && workPreview) {
  document.querySelectorAll('.work__row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      if (!row.dataset.img) return;
      workPreview.src = row.dataset.img;
      workPreview.classList.add('on');
    });
    row.addEventListener('mouseleave', () => workPreview.classList.remove('on'));
  });

  workSection.addEventListener('mousemove', (e) => {
    const rect = workSection.getBoundingClientRect();
    workPreview.style.left = (e.clientX - rect.left + 30) + 'px';
    workPreview.style.top = (e.clientY - rect.top - 160) + 'px';
  });
}

/* ==========================================================
   ALBUM PAGE (album.html?album=categorie/id)
   Reads the same albums.js data as the real site.
   ========================================================== */
const galleryEl = document.querySelector('[data-album-gallery]');

if (galleryEl && typeof ALBUMS !== 'undefined') {
  const param = new URLSearchParams(window.location.search).get('album') || '';
  const parts = param.split('/').filter(Boolean);
  const category = parts[0];
  const albums = ALBUMS[category] || [];
  const album = parts.length > 1 ? albums.find((a) => a.id === parts[1]) : null;

  const titleEl = document.querySelector('[data-album-title]');
  const backEl = document.querySelector('[data-album-back]');
  const specCat = document.querySelector('[data-spec-category]');
  const specCount = document.querySelector('[data-spec-count]');
  const catName = category ? category.charAt(0).toUpperCase() + category.slice(1) : '';

  if (parts.length === 1 && albums.length) {
    /* ---- categorie-overzicht: één kaart per album ---- */
    document.title = catName + ' — Picture Perfect';
    if (titleEl) titleEl.textContent = catName;
    if (backEl) backEl.href = 'index.html#portfolio';
    if (specCat) specCat.textContent = catName;
    if (specCount) {
      const total = albums.reduce((n, a) => n + a.photos.length, 0);
      specCount.textContent = albums.length + ' ALBUMS — ' + total;
    }

    galleryEl.classList.add('gallery--albums');
    albums.forEach((a) => {
      const card = document.createElement('a');
      card.className = 'albumcard';
      card.href = 'album.html?album=' + category + '/' + a.id;

      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = a.photos[0] + '=w800';
      img.decoding = 'async';
      img.alt = a.title;

      const cap = document.createElement('figcaption');
      cap.className = 'meta';
      cap.innerHTML = '<span><b>' + a.title.toUpperCase() + '</b></span><span>' +
        String(a.photos.length).padStart(3, '0') + '</span>';

      const show = () => fig.classList.add('is-loaded');
      if (img.complete) show();
      else img.addEventListener('load', show);
      img.addEventListener('error', show); /* kaart altijd tonen, ook als de cover hapert */

      fig.appendChild(img);
      fig.appendChild(cap);
      card.appendChild(fig);
      galleryEl.appendChild(card);
    });
  } else if (album) {
    /* ---- albumweergave: alle foto's ---- */
    document.title = album.title + ' — Picture Perfect';
    if (titleEl) titleEl.textContent = album.title;
    if (backEl && albums.length > 1) {
      backEl.href = 'album.html?album=' + category;
      backEl.innerHTML = '&larr; TERUG NAAR ' + category.toUpperCase();
    } else if (backEl) {
      backEl.href = 'index.html#portfolio';
    }
    if (specCat) specCat.textContent = catName;
    if (specCount) specCount.textContent = String(album.photos.length).padStart(3, '0');

    const total = String(album.photos.length).padStart(3, '0');

    album.photos.forEach((url, index) => {
      const fig = document.createElement('figure');

      const img = document.createElement('img');
      img.src = url + '=w800';
      img.loading = index < 8 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.alt = album.title + ' — foto ' + (index + 1);

      const cap = document.createElement('figcaption');
      cap.className = 'meta';
      cap.textContent = String(index + 1).padStart(3, '0') + ' / ' + total;

      const show = () => fig.classList.add('is-loaded');
      if (img.complete) show();
      else img.addEventListener('load', show);
      img.addEventListener('error', () => fig.remove());

      fig.appendChild(img);
      fig.appendChild(cap);
      galleryEl.appendChild(fig);
    });
  } else if (titleEl) {
    titleEl.textContent = 'Album niet gevonden';
  }
}
