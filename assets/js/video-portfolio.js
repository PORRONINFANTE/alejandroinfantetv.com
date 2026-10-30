/* Real video previews, with a compact in-page player on phones. */
(function(){
 'use strict';
 var videos=Array.from(document.querySelectorAll('.portfolio-video'));
 if(!videos.length)return;
 var dialog=document.querySelector('.portfolio-viewer'),small=window.matchMedia('(max-width: 600px)'),active=null,trigger=null,marker=null;
 var stage=dialog.querySelector('.portfolio-viewer-stage'),error=dialog.querySelector('.portfolio-viewer-error');
 document.documentElement.classList.add('video-portfolio-ready');
 function restore(){if(!active)return;active.pause();marker.parentNode.replaceChild(active,marker);active=null;marker=null;document.body.classList.remove('portfolio-viewer-open');if(trigger){trigger.hidden=false;trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true});trigger=null;}}
 function open(video,button,card){
  if(!small.matches||typeof dialog.showModal!=='function'||active)return;
  active=video;trigger=button;marker=document.createComment('video-preview');video.parentNode.insertBefore(marker,video);stage.appendChild(video);
  dialog.querySelector('h2').textContent=card.querySelector('h2').textContent;dialog.querySelector('.portfolio-viewer-description').textContent=card.querySelector('.video-work-copy > p').textContent;error.hidden=true;
  try{dialog.showModal();}catch(e){restore();return;}
  button.setAttribute('aria-expanded','true');document.body.classList.add('portfolio-viewer-open');
 }
 dialog.querySelector('.portfolio-viewer-close').addEventListener('click',function(){dialog.close();});dialog.addEventListener('close',restore);
 dialog.addEventListener('click',function(e){if(e.target!==dialog)return;var b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});
 videos.forEach(function(video){
  var card=video.closest('.video-work'),frame=video.closest('.video-work-frame'),button=frame.querySelector('.video-work-play'),message=card.querySelector('.video-playback-error');
  function mode(){if(small.matches&&typeof dialog.showModal==='function')button.setAttribute('aria-haspopup','dialog');else button.removeAttribute('aria-haspopup');}mode();small.addEventListener('change',mode);
  function failed(){message.hidden=false;button.hidden=true;if(active===video)error.hidden=false;}
  button.addEventListener('click',function(){message.hidden=true;open(video,button,card);var request=video.play();if(request&&request.catch)request.catch(failed);});
  video.addEventListener('play',function(){videos.forEach(function(other){if(other!==video)other.pause();});button.hidden=true;message.hidden=true;frame.classList.add('is-playing');});
  video.addEventListener('pause',function(){frame.classList.remove('is-playing');});video.addEventListener('ended',function(){button.hidden=false;frame.classList.remove('is-playing');});video.addEventListener('error',failed);
 });
 function pause(){videos.forEach(function(v){v.pause();});}window.addEventListener('pagehide',pause);document.addEventListener('visibilitychange',function(){if(document.hidden)pause();});
})();
