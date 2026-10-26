
(function(){
  'use strict';
  var script = document.currentScript;
  var base = new URL('../../', script.src);
  var routes = {"es": {"home": "es/", "sobre-mi": "es/sobre-mi/", "experiencia": "es/sobre-mi/", "contenido": "es/contenido/", "contacto": "es/contacto/", "servicios": "es/servicios/", "servicio-web": "es/servicio-web/", "servicio-ads": "es/servicio-ads/", "servicio-colaboraciones": "es/servicio-colaboraciones/", "servicio-crm": "es/servicio-crm/", "ejemplos-video": "es/ejemplos-video/"}, "en": {"home": "en/", "about": "en/about/", "experience": "en/about/", "content": "en/content/", "contact": "en/contact/", "services": "en/services/", "service-web": "en/service-web/", "service-ads": "en/service-ads/", "service-collabs": "en/service-collabs/", "service-crm": "en/service-crm/", "video-examples": "en/video-examples/"}};
  function migrate(){
    var match = location.hash.match(/^#\/(es|en)\/([^/?#]+)/);
    if (!match || !routes[match[1]][match[2]]) return;
    var target = new URL(routes[match[1]][match[2]], base);
    if (location.protocol === 'file:') target.pathname += 'index.html';
    target.search = location.search;
    location.replace(target.href);
  }
  migrate();
  window.addEventListener('hashchange', migrate);
})();
