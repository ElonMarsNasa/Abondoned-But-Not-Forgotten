'use strict';
(() => {
  const audio=document.getElementById('openingMusic'),button=document.getElementById('musicToggle');
  let enabled=true,waiting=false,leaving=false,fadeFrame=0,playVersion=0;
  const update=()=>{button.textContent=!enabled?'♫ Music off':waiting?'♫ Tap for music':'♫ Music on';button.setAttribute('aria-pressed',String(enabled&&!waiting));button.setAttribute('aria-label',!enabled||waiting?'Play opening music':'Mute opening music');};
  function fadeTo(target,duration,pauseAfter=false,onComplete){
    cancelAnimationFrame(fadeFrame);const from=audio.volume,start=performance.now();
    function step(now){const p=Math.min(1,(now-start)/duration);audio.volume=from+(target-from)*(p*p*(3-2*p));if(p<1)fadeFrame=requestAnimationFrame(step);else{if(pauseAfter)audio.pause();if(onComplete)onComplete();}}
    fadeFrame=requestAnimationFrame(step);
  }
  async function play(restart=false){
    const version=++playVersion;cancelAnimationFrame(fadeFrame);
    if(restart)audio.currentTime=0;audio.volume=0;
    try{await audio.play();if(version!==playVersion)return;if(!enabled){audio.pause();return;}waiting=false;update();fadeTo(.35,650);}
    catch(error){if(version!==playVersion)return;if(error.name==='NotAllowedError'){waiting=true;}else{enabled=false;waiting=false;}update();}
  }
  button.addEventListener('click',()=>{if(leaving)return;if(waiting){enabled=true;play();return;}enabled=!enabled;update();if(enabled)play();else{++playVersion;fadeTo(0,350,true);}});
  // Retry blocked autoplay within a real user gesture, without overriding mute.
  function unlock(event){if(!leaving&&enabled&&waiting&&event.target!==button&&!button.contains(event.target))play();}
  document.addEventListener('pointerdown',unlock);document.addEventListener('keydown',unlock);
  // Fade alongside the Moon/Mars camera zoom; the camera handles navigation.
  document.addEventListener('cosmic-surface-entry',()=>{leaving=true;++playVersion;if(!audio.paused)fadeTo(0,1100,true);});
  // Let the track settle before leaving for a spacecraft mission.
  document.addEventListener('click',event=>{
    if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
    const link=event.target.closest('a[href]');
    if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;
    const destination=link.getAttribute('href');
    if(!['kepler.html','pioneer.html','dawn.html','near.html'].includes(destination))return;
    if(leaving){event.preventDefault();return;}
    if(!enabled||audio.paused||audio.volume<.01)return;
    event.preventDefault();leaving=true;++playVersion;
    fadeTo(0,900,true,()=>window.location.assign(destination));
  });
  function syncScene(){leaving=false;button.hidden=false;if(enabled&&audio.paused)play();}
  window.addEventListener('pagehide',()=>{++playVersion;cancelAnimationFrame(fadeFrame);audio.pause();});window.addEventListener('pageshow',syncScene);
  audio.addEventListener('error',()=>{++playVersion;enabled=false;waiting=false;update();button.textContent='Music unavailable';});
  audio.volume=0;update();syncScene();
})();
