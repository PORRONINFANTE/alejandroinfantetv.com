/* Shared interactions. Each document is an independently accessible page. */
(function(){
  'use strict';

  // Preserve language preference on the root entry; explicit page URLs never auto-switch.
  if (document.body.dataset.languageEntry === 'true' && !location.hash) {
    var preferred = null;
    try { preferred = localStorage.getItem('ai_lang'); } catch (err) {}
    if (preferred !== 'es' && preferred !== 'en') preferred = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
    if (preferred === 'en') {
      var entryTarget = new URL('en/' + (location.protocol === 'file:' ? 'index.html' : ''), location.href);
      entryTarget.search = location.search;
      location.replace(entryTarget.href);
      return;
    }
  }

  var usdRate = null, usdRateDate = '', usdRequest = null, usdCheckedAt = 0;
  function validUsdRate(d){
    return d && d.base === 'MXN' && d.quote === 'USD' && Number.isFinite(d.rate) && d.rate > 0 && d.rate < 1 && /^\d{4}-\d{2}-\d{2}$/.test(d.date) && Number.isFinite(Date.parse(d.date)) && Date.parse(d.date) <= Date.now() + 86400000 && Date.now() - Date.parse(d.date) < 7 * 86400000;
  }
  function usdAmount(amount){ return Math.round(amount * usdRate).toLocaleString('en-US'); }
  function convertUsdDescription(text){
    return text.replace(/\$([\d,]+) MXN/g, function(_, amount){ return usdRate ? '$' + usdAmount(Number(amount.replace(/,/g,''))) + ' USD' : 'USD pricing available on request'; });
  }
  function updateUsdPrices(cached){
    document.querySelectorAll('#lang-en [data-mxn]').forEach(function(el){ el.textContent = usdAmount(Number(el.dataset.mxn)); });
    var note = 'USD equivalents, rounded to whole dollars. Rate dated ' + usdRateDate + '.' + (cached ? ' Using the last saved rate.' : '');
    document.querySelectorAll('#lang-en .usd-status').forEach(function(el){ el.textContent = note; });

  }
  function loadUsdPrices(){
    if (usdRequest || (usdRate && Date.now() - usdCheckedAt < 21600000)) return;
    if (!usdRate) {
      try {
        var saved = JSON.parse(localStorage.getItem('ai_mxn_usd_v1'));
        if (validUsdRate(saved)) { usdRate = saved.rate; usdRateDate = saved.date; updateUsdPrices(true); }
      } catch (err) {}
    }
    var controller = new AbortController();
    var timeout = setTimeout(function(){ controller.abort(); }, 8000);
    usdRequest = fetch('https://api.frankfurter.dev/v2/rate/MXN/USD', {signal:controller.signal})
      .then(function(r){ if (!r.ok) throw new Error('Unavailable rate'); return r.json(); })
      .then(function(d){
        if (!validUsdRate(d)) throw new Error('Invalid or outdated rate');
        usdRate = d.rate; usdRateDate = d.date; usdCheckedAt = Date.now();
        try { localStorage.setItem('ai_mxn_usd_v1', JSON.stringify(d)); } catch (err) {}
        updateUsdPrices(false);
      })
      .catch(function(){
        if (usdRate) { updateUsdPrices(true); return; }
        document.querySelectorAll('#lang-en [data-mxn]').forEach(function(el){ el.textContent = '—'; });
        document.querySelectorAll('#lang-en .usd-status').forEach(function(el){ el.textContent = 'USD conversion is temporarily unavailable. Contact me for a quote.'; });
      })
      .finally(function(){ clearTimeout(timeout); usdRequest = null; });
  }
  window.addEventListener('focus', function(){ if (document.documentElement.lang === 'en') loadUsdPrices(); });

  function reinitReveal(root){
    if (!root) return;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var items = root.querySelectorAll('.reveal');
    document.documentElement.classList.add('motion-ready');
    if (prefersReduced) { items.forEach(function(el){ el.classList.add('in'); }); return; }
    items.forEach(function(el){ el.classList.remove('in'); });
    if (!('IntersectionObserver' in window)) { items.forEach(function(el){ el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, {threshold:0.15, rootMargin:'0px 0px -40px 0px'});
    items.forEach(function(el){ io.observe(el); });
  }

  function initHeaderScroll(root){
    if (!root) return;
    var header = root.querySelector('header');
    if (!header || header.dataset.wired) return;
    header.dataset.wired = '1';
    var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  function initMobileMenu(root){
    var toggle = root.querySelector('.menu-toggle');
    var nav = root.querySelector('.links');
    var scrim = root.querySelector('.nav-scrim');
    if (!toggle || !nav || !scrim || toggle.dataset.wired) return;
    toggle.dataset.wired = '1';
    function closeMenu(){
      toggle.classList.remove('open'); nav.classList.remove('open');
      scrim.classList.remove('show'); toggle.setAttribute('aria-expanded', 'false');
    }
    toggle.addEventListener('click', function(){
      var isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      scrim.classList.toggle('show', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    scrim.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeMenu(); });
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  }

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.home-page .hero').forEach(function(hero){
    var home = hero.closest('.home-page');
    var frame = null, x = 0, y = 0;
    function resetMotion(){
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
      home.style.setProperty('--pointer-x', '0px');
      home.style.setProperty('--pointer-y', '0px');
    }
    hero.addEventListener('pointermove', function(event){
      if (motionQuery.matches || !pointerQuery.matches) return;
      var bounds = hero.getBoundingClientRect();
      x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 28;
      y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 28;
      if (frame !== null) return;
      frame = requestAnimationFrame(function(){
        home.style.setProperty('--pointer-x', x + 'px');
        home.style.setProperty('--pointer-y', y + 'px');
        frame = null;
      });
    }, {passive:true});
    hero.addEventListener('pointerleave', resetMotion);
    motionQuery.addEventListener('change', resetMotion);
    pointerQuery.addEventListener('change', resetMotion);
  });


  var activeRoot = document.querySelector('.lang-root');
  if (activeRoot) { initMobileMenu(activeRoot); initHeaderScroll(activeRoot); reinitReveal(activeRoot); }
  document.querySelectorAll('.footer-year').forEach(function(el){ el.textContent = new Date().getFullYear(); });
  document.querySelectorAll('.lang-toggle').forEach(function(link){
    link.addEventListener('click', function(){ try { localStorage.setItem('ai_lang', link.dataset.langSet); } catch (err) {} });
  });
  // Directory links are clean on a web server; file previews need index.html explicitly.
  if (location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach(function(link){
      var href = link.getAttribute('href');
      if (href && !/^(?:[a-z]+:|#|\/\/)/i.test(href) && href.endsWith('/')) link.setAttribute('href', href + 'index.html');
    });
  }
  if (document.documentElement.lang === 'en' && document.querySelector('[data-mxn]')) loadUsdPrices();

  // Fill wide viewports before duplicating the logo sequence for a gapless loop.
  document.querySelectorAll('.client-logo-track').forEach(function(track){
    var groups = track.querySelectorAll('.client-logo-group');
    if (groups.length !== 2) return;
    var sequence = groups[0].querySelector('.client-logo-repeat');
    if (!sequence) return;
    function fillLogoTrack(){
      var guard = 0;
      while (groups[0].getBoundingClientRect().width < window.innerWidth + 220 && guard++ < 12) {
        groups[0].appendChild(sequence.cloneNode(true));
      }
      groups[1].innerHTML = groups[0].innerHTML;
      groups[1].setAttribute('aria-hidden', 'true');
      groups[1].querySelectorAll('img').forEach(function(img){ img.alt = ''; });
    }
    fillLogoTrack();
    window.addEventListener('resize', fillLogoTrack, {passive:true});
  });
})();
