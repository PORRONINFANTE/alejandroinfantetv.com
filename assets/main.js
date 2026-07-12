document.addEventListener('click', (e) => {
  const toggle = e.target.closest('.lang-toggle');
  if (!toggle) return;
  const lang = toggle.getAttribute('data-lang-set');
  if (lang) {
    try { localStorage.setItem('ai_lang', lang); } catch (err) { /* ignore */ }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('navLinks');
  const scrim = document.getElementById('scrim');
  if (toggle && nav && scrim) {
    const closeMenu = () => {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      scrim.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      scrim.classList.toggle('show', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    scrim.addEventListener('click', closeMenu);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.links a[data-nav]').forEach(a => {
    if (a.getAttribute('data-nav') === path) a.classList.add('active');
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    const items = document.querySelectorAll('.reveal');
    items.forEach(el => el.classList.remove('in'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  }
});
