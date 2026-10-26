/* Compact previews on phones, native controls everywhere, and in-page expanded playback. */
(function(){
 'use strict';
 var videos = Array.from(document.querySelectorAll('.portfolio-video'));
 if (!videos.length) return;
 var dialog = document.querySelector('.portfolio-viewer');
 var smallScreen = window.matchMedia('(max-width: 600px)');
 var activeVideo = null, activeButton = null, marker = null;
 var stage = dialog && dialog.querySelector('.portfolio-viewer-stage');
 var viewerError = dialog && dialog.querySelector('.portfolio-viewer-error');
 document.documentElement.classList.add('video-portfolio-ready');
 function restorePlayer(){
  if (!activeVideo) return;
  activeVideo.pause();
  if (marker && marker.parentNode) marker.parentNode.replaceChild(activeVideo, marker);
  var button = activeButton;
  activeVideo = null; activeButton = null; marker = null;
  document.body.classList.remove('portfolio-viewer-open');
  if (button) { button.hidden = false; button.setAttribute('aria-expanded','false'); button.focus({preventScroll:true}); }
 }
 function openViewer(video,button,card){
  if (!smallScreen.matches || !dialog || typeof dialog.showModal !== 'function' || activeVideo) return false;
  activeVideo = video; activeButton = button;
  marker = document.createComment('video-preview-position');
  video.parentNode.insertBefore(marker,video);
  stage.appendChild(video);
  dialog.querySelector('h2').textContent = card.querySelector('h2').textContent;
  dialog.querySelector('.portfolio-viewer-description').textContent = card.querySelector('.video-work-copy > p').textContent;
  viewerError.hidden = true;
  try { dialog.showModal(); }
  catch (err) { restorePlayer(); return false; }
  button.setAttribute('aria-expanded','true');
  document.body.classList.add('portfolio-viewer-open');
  return true;
 }
 if (dialog) {
  dialog.querySelector('.portfolio-viewer-close').addEventListener('click',function(){ dialog.close(); });
  dialog.addEventListener('close',restorePlayer);
  dialog.addEventListener('click',function(event){
   if (event.target !== dialog) return;
   var bounds = dialog.getBoundingClientRect();
   if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
 }
 videos.forEach(function(video){
  var frame = video.closest('.video-work-frame');
  var card = video.closest('.video-work');
  var button = frame.querySelector('.video-work-play');
  var error = card.querySelector('.video-playback-error');
  function updateButtonMode(){
   if (smallScreen.matches && dialog && typeof dialog.showModal === 'function') button.setAttribute('aria-haspopup','dialog');
   else button.removeAttribute('aria-haspopup');
  }
  updateButtonMode();
  smallScreen.addEventListener('change',updateButtonMode);
  function playbackError(){
   button.hidden = true; error.hidden = false; frame.classList.remove('is-playing');
   if (activeVideo === video && viewerError) viewerError.hidden = false;
  }
  button.addEventListener('click',function(){
   error.hidden = true;
   openViewer(video,button,card);
   var request = video.play();
   if (request && typeof request.catch === 'function') request.catch(playbackError);
  });
  video.addEventListener('play',function(){
   videos.forEach(function(other){ if (other !== video && !other.paused) other.pause(); });
   button.hidden = true; error.hidden = true; frame.classList.add('is-playing');
  });
  video.addEventListener('pause',function(){ frame.classList.remove('is-playing'); });
  video.addEventListener('ended',function(){ button.hidden = false; frame.classList.remove('is-playing'); });
  video.addEventListener('error',playbackError);
 });
 function pauseAll(){ videos.forEach(function(video){ if (!video.paused) video.pause(); }); }
 window.addEventListener('pagehide',pauseAll);
 document.addEventListener('visibilitychange',function(){ if (document.hidden) pauseAll(); });
})();
