'use strict';

// One clock joins loading, a centred upward launch, eight-star flight, and a separate solar dissolve.
// Planet sizes and orbits are deliberately illustrated, not astronomical scale.
const $ = id => document.getElementById(id);
const canvas = $('universe');
const ctx = canvas.getContext('2d');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const orbitButtons = [...document.querySelectorAll('.planet')];
const phases = [2.65,5.15,3.65,.75,4.75,2.45,3.25,5.72];
const orbitRadii = [[104,59],[156,76],[208,94],[260,112],[312,130],[364,149],[416,169],[468,190]];
const periods = [42,61,82,104,139,181,218,258];
// Simulated opening: timing never depends on network or asset loading.
const TIMING=Object.freeze({load:2600,launch:2720,riseEnd:3800,split:4800,allStars:5900,orbit:4800,depart:6800,exitEnd:8000,solar:9000,solarEnd:10000,reveal:10100,end:11900});
const STAR_COUNT=8;
const DURATION=TIMING.end;
let reduced = motionPreference.matches;
let paused = false;
let ready = false;
let introTime = 0;
let orbitTime = 0;
let ambientTime = 0;
let twinkleTime=0;
let userPaused=false;
let captionLanded=false;
let cameraTravel = 0;
let lastFrame = 0;
let frameId = 0;
let W = 1, H = 1, DPR = 1;
let system = {left:0,top:0,width:1,height:1};
let loadingOrigin = {x:0,y:0,barY:0,barWidth:290};
let progress = -1;
let focusedWorld = null;
let pointer = {x:0,y:0,targetX:0,targetY:0};
let stars = [], rocks = [], barParticles = [];
let pointerActive = false;
let stage = 'loading';
let journeyActive=false,journeyMode='cover';
const SOLAR_RETURN_DURATION=1200;
let returnCamera=null;
let planetZoomOrigin=null;
let solarPlaceholder=null;
let focalWorld=null,focalIndex=2;
const selectableWorlds=['earth','mars','jupiter'];
const earthWorld=orbitButtons.find(button=>button.dataset.world==='earth');
focalWorld=earthWorld;
const solarHome=$('solarSystem').parentNode;
const solarSibling=$('solarSystem').nextSibling;
let journeyTime=0,solarOrigin=null,solarGeometry=null,journeyEarthBase=38,solarStartScale=1;
const moonCompanion=document.querySelector('.moon-plane');
const moonHome=moonCompanion.parentNode;
const keplerCompanion=$('keplerCompanion');
const pioneerCompanion=$('pioneerCompanion');
let beltZoomOrigin=null;


const clamp = n => Math.max(0, Math.min(1,n));
const lerp = (a,b,t) => a+(b-a)*t;
const ease = t => {t=clamp(t);return t*t*(3-2*t)};
function seeded(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let a=Math.imul(seed^seed>>>15,1|seed);a^=a+Math.imul(a^a>>>7,61|a);return ((a^a>>>14)>>>0)/4294967296}}
const random = seeded(1842021);
const facts = {
  sun:'The Sun · The star at the heart of our solar system.',
  mercury:'Mercury · A small, rocky world closest to the Sun.',
  venus:'Venus · A rocky world wrapped in thick clouds.',
  earth:'Earth · Our blue home. Every journey here began there.',
  mars:'Mars · The world where Spirit roamed and Ingenuity flew.',
  jupiter:'Jupiter · The largest planet, painted with bands of cloud.',
  saturn:'Saturn · A giant surrounded by beautiful rings.',
  uranus:'Uranus · A pale blue-green ice giant, beyond Saturn.',
  neptune:'Neptune · A distant blue ice giant in our solar system.'
};

function getOrbitPoint(index,time=orbitTime){
  const angle=phases[index]+time/1000/periods[index]*Math.PI*2;
  const [rx,ry]=orbitRadii[index];
  return {x:system.left+system.width*(.5+Math.cos(angle)*rx/1000),y:system.top+system.height*(.5+Math.sin(angle)*ry/400),angle};
}
function setPlanetPositions(){
  $('sun').style.left='50%';$('sun').style.top='50%';
  orbitButtons.forEach((button,index)=>{

    const point=getOrbitPoint(index);
    const x=point.x-system.left,y=point.y-system.top;
    if(journeyActive&&(journeyMode==='planet'||(journeyMode==='returning'&&!returnCamera?.swapped))&&button===focalWorld){
      // Share exact floating-point coordinates with the tracking camera.
      // Transform positioning avoids layout rounding amplified by the zoom.
      // The tracking camera renders Earth at its final pixel size below.
    }else{
      button.style.left=x+'px';button.style.top=y+'px';
      button.style.transform='translate(-50%,-50%)';
    }
  });
  if(journeyActive)positionSolarCamera();
}

function resize(){
  W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
  const box=$('solarSystem').getBoundingClientRect();
  if(journeyActive){system={left:0,top:0,width:solarGeometry.width,height:solarGeometry.height};}
  else system={left:box.left,top:box.top,width:box.width,height:box.height};
  const sunSize=Math.min(W<600?54:84,system.height*.22);$('sun').style.width=sunSize+'px';$('sun').style.height=sunSize+'px';
  const spark=document.querySelector('.loading-star').getBoundingClientRect();
  const bar=$('loadTrack').getBoundingClientRect();
  loadingOrigin={x:spark.left+spark.width/2,y:spark.top+spark.height/2,barY:bar.top+bar.height/2,barWidth:bar.width};
  const rand=seeded(72);
  stars=Array.from({length:W<600?360:700},()=>({x:rand()*W,y:rand()*H,r:.35+rand()*1.1,alpha:.15+rand()*.6,phase:rand()*Math.PI*2,speed:.00035+rand()*.0012,pulse:rand(),depth:.2+rand()*.8,color:rand()>.88?'#FFD5AE':'#EEE5FF'}));
  rocks=Array.from({length:7},(_,i)=>({x:rand()*W,y:rand()*H,size:2+rand()*3,phase:rand()*Math.PI*2,speed:.06+rand()*.1,depth:.5+rand()*.5,shape:Array.from({length:6},()=>.65+rand()*.35)}));
  barParticles=Array.from({length:80},(_,i)=>({x:(i/79-.5)*loadingOrigin.barWidth,y:(rand()-.5)*3,vx:(rand()-.5)*100,vy:-60-rand()*180,life:.6+rand()*.4,seed:rand(),r:.6+rand()*1.3}));
  setPlanetPositions();positionOriginalText(false);
  if(ready&&!frameId)requestFrame();
}

function positionOriginalText(onCover){
  const element=onCover?$('startArea'):$('loadTrack'),r=element.getBoundingClientRect();
  const y=onCover?Math.min(H-48,r.top+r.height+14):r.top+r.height+17;
  $('originalLoadingText').style.top=y+'px';
}

function sparkle(x,y,r,color,alpha=1,rotation=0){
  if(r<=0||alpha<=0)return;
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation+Math.sin(ambientTime*.0007+x*.017)*.025);ctx.fillStyle=color;
  // Unequal curved arms: long, fine vertical tips and softer short side tips.
  ctx.beginPath();ctx.moveTo(r*.025,-r*1.30);
  ctx.bezierCurveTo(r*.13,-r*.34,r*.40,-r*.10,r*1.08,r*.02);
  ctx.bezierCurveTo(r*.37,r*.12,r*.11,r*.38,-r*.02,r*1.25);
  ctx.bezierCurveTo(-r*.12,r*.38,-r*.42,r*.10,-r*1.04,r*.035);
  ctx.bezierCurveTo(-r*.37,-r*.12,-r*.10,-r*.43,r*.025,-r*1.30);
  ctx.fill();ctx.restore();
}



function glow(x,y,r,alpha=1,color='255,200,87'){
  if(alpha<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+color+','+alpha*.28+')');g.addColorStop(.3,'rgba('+color+','+alpha*.12+')');g.addColorStop(1,'rgba('+color+',0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function drawBackground(){
  const galaxy=ready?1:lerp(.045,1,ease((introTime-TIMING.riseEnd)/(TIMING.solarEnd-TIMING.riseEnd)));
  const warp=(reduced?.16:1)*(introTime<TIMING.solar?Math.sin(clamp((introTime-TIMING.riseEnd)/(TIMING.solar-TIMING.riseEnd))*Math.PI):0);
  ctx.clearRect(0,0,W,H);
  // Distant stars have less parallax than foreground sparks and rock fragments.
  for(const s of stars){
    const x=s.x+pointer.x*s.depth;
    const y=((s.y+pointer.y*s.depth+ambientTime*.001*s.depth+cameraTravel*(s.depth+.3))%H+H)%H;
    const wave=Math.sin(twinkleTime*s.speed+s.phase),flare=Math.pow(Math.max(0,Math.sin(twinkleTime*s.speed*.37+s.phase*2.7)),8);const twinkle=.42+.42*(wave*.5+.5)+flare*(reduced?.10:.23);const starRadius=s.r*(.88+(wave*.5+.5)*.27);
    ctx.globalAlpha=s.alpha*galaxy*twinkle;
    ctx.fillStyle=s.color;
    if(warp>.05){ctx.strokeStyle=s.color;ctx.lineWidth=s.r*.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+warp*(10+s.depth*90));ctx.stroke();}
    else{ctx.beginPath();ctx.arc(x,y,starRadius,0,Math.PI*2);ctx.fill();if(s.pulse>.965&&flare>.45){glow(x,y,starRadius*7,galaxy*flare*.3,'211,195,255');sparkle(x,y,starRadius*2,'#FFF3E4',galaxy*flare*.3)}}
  }
  ctx.globalAlpha=1;
  if(galaxy>.3){
    for(const rock of rocks){
      const x=rock.x+pointer.x*rock.depth+Math.sin(ambientTime*.00008+rock.phase)*16;
      const y=rock.y+pointer.y*rock.depth+Math.cos(ambientTime*.00004+rock.phase)*12;
      ctx.save();ctx.translate(x,y);ctx.rotate(rock.phase+ambientTime*.00002);ctx.globalAlpha=galaxy*.45;ctx.fillStyle='#726282';ctx.strokeStyle='#AF98B1';ctx.lineWidth=.5;ctx.beginPath();
      rock.shape.forEach((n,i)=>{const a=i/6*Math.PI*2;const px=Math.cos(a)*rock.size*n,py=Math.sin(a)*rock.size*n;i?ctx.lineTo(px,py):ctx.moveTo(px,py)});ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    for(let i=0;i<9;i++){const x=(i*191+55)%W+pointer.x*1.25,y=((i*137+43)%H)+Math.sin(ambientTime*.0003+i)*7+pointer.y;sparkle(x,y,i%3===0?2.7:1.5,'#F4DDBA',galaxy*(.12+.12*Math.sin(ambientTime*.0006+i)));}
  }
  // A quiet meteor passes occasionally after the arrival.
  if(ready&&!paused){const t=(ambientTime%15000)/15000;if(t<.055){const p=t/.055;ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)*.35;const x=W*.1+W*.5*p,y=H*.08+H*.15*p;const g=ctx.createLinearGradient(x-70,y-25,x,y);g.addColorStop(0,'#FFFFFF00');g.addColorStop(1,'#FFE7B5');ctx.strokeStyle=g;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-70,y-25);ctx.lineTo(x,y);ctx.stroke();ctx.restore();}}
}

function drawBarDissolve(){
  const t=clamp((introTime-TIMING.load)/1350);if(t<=0||t>=1)return;
  for(const p of barParticles){
    const life=clamp((1-t)*1.8),gather=ease((t-.15)/.85);
    const originX=W/2+p.x+p.vx*t,originY=loadingOrigin.barY+p.y+p.vy*t-80*t*t;
    const head=formationPoint(0,introTime);
    sparkle(lerp(originX,head.x,gather),lerp(originY,head.y,gather),p.r,'#FFE7B5',life*.85);
  }
}

// All motion is 2D. The eight shooting stars leave completely before a separate
// one-second solar-system dissolve; none of the stars morph into a planet.
function launchPoint(t){
  const p=ease((t-TIMING.launch)/(TIMING.riseEnd-TIMING.launch));
  const targetY=Math.min(H*.40,loadingOrigin.y-50);
  return{x:W/2,y:lerp(loadingOrigin.y,targetY,p)};
}
function splitTime(index){return TIMING.split+(index-1)*65}
function groupRadius(){return Math.min(W*.15,H*.16,108)}
function travellingPoint(index,t){
  const p=clamp((t-TIMING.depart)/(TIMING.exitEnd-TIMING.depart));
  const centerY=launchPoint(TIMING.riseEnd).y-(H*1.40+600)*Math.pow(p,2.15);
  if(index===0)return{x:W/2,y:centerY};
  const spread=ease((t-splitTime(index))/700),radius=groupRadius()*spread;
  const angle=(index-1)/7*Math.PI*2+Math.max(0,t-TIMING.orbit)*.00165;
  return{x:W/2+Math.cos(angle)*radius,y:centerY+Math.sin(angle)*radius*.9};
}
function formationPoint(index,t){return t<TIMING.split?launchPoint(t):travellingPoint(index,t)}
function shootingStarVisibility(index,t){
  if(t<TIMING.launch||t>=TIMING.solar)return 0;
  return index===0?1:ease((t-splitTime(index))/300);
}
function solarOpacity(t){return ease((t-TIMING.solar)/1000)}
function trailPoints(index,t){
  const head=formationPoint(index,t),birth=index===0?TIMING.launch:splitTime(index),points=[];
  const previous=formationPoint(index,Math.max(birth,t-48));let dx=head.x-previous.x,dy=head.y-previous.y,speed=Math.hypot(dx,dy);
  if(speed<.01){dx=0;dy=-1;speed=1}dx/=speed;dy/=speed;
  const age=clamp((t-birth)/440),length=(index===0?Math.min(H*.54,390):(reduced?200:285))*ease(age);
  const historyBlend=index===0?ease((t-TIMING.depart)/500):ease((t-(birth+280))/520);
  for(let n=0;n<48;n++){
    const u=n/47,past=formationPoint(index,Math.max(birth,t-n*17));
    const bend=Math.sin(Math.PI*u)*Math.sin(t*.0009+index)*3;
    const extended={x:head.x-dx*length*u-dy*bend,y:head.y-dy*length*u+dx*bend};
    // Keep the centred star’s long tail visible while it waits for the split.
    const satelliteDrift=index===0?0:n*17*.001*(reduced?210:360);
    points.push({x:lerp(extended.x,past.x+(index===0?0:Math.sin(n*.16+index)*n*.055),historyBlend),y:lerp(extended.y,past.y+satelliteDrift,historyBlend)});
  }
  return points;
}

function trailGradient(head,end){
  const gradient=ctx.createLinearGradient(head.x,head.y,end.x,end.y);
  gradient.addColorStop(0,'#FFF7E4');gradient.addColorStop(.10,'#FFF0C9EE');
  gradient.addColorStop(.25,'#BDEEF5DD');gradient.addColorStop(.43,'#5879BAA6');
  gradient.addColorStop(.63,'#AD98E08A');gradient.addColorStop(.82,'#E6B7D45A');gradient.addColorStop(1,'#8B7BFF00');
  return gradient;
}
function drawCinematic(){
  if(introTime<TIMING.launch||introTime>=TIMING.solar)return;
  drawBarDissolve();
  const count=introTime<TIMING.split?1:STAR_COUNT;
  for(let i=count-1;i>=0;i--){
    const alpha=shootingStarVisibility(i,introTime);if(alpha<=0)continue;
    const pt=formationPoint(i,introTime),birth=i===0?TIMING.launch:splitTime(i),points=trailPoints(i,introTime),trail=trailGradient(pt,points[47]);
    for(let pass=0;pass<2;pass++){
      ctx.save();ctx.strokeStyle=trail;ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=alpha*(pass===0?.24:.84);ctx.lineWidth=pass===0?(i===0?6.5:4.4):(i===0?2.1:1.3);ctx.shadowColor=pass===0?'#94C5F1':'#C2A6EA';ctx.shadowBlur=reduced?2:(pass===0?11:5);ctx.beginPath();points.forEach((p,n)=>n?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
    }
    const fragments=i===0?(reduced?8:12):(reduced?12:20);
    for(let n=0;n<fragments;n++){
      const age=((introTime-birth+n*89+i*43)%1100+1100)%1100;if(introTime-age<birth)continue;
      const life=age/1100,past=formationPoint(i,introTime-age),seed=i*31+n*17,x=past.x+Math.sin(seed)*(1+life*7),y=past.y+Math.cos(seed)*(1+life*5),a=alpha*Math.pow(1-life,1.8);
      if(n%6===0)sparkle(x,y,1.15,'#D7C2EF',a*.75);
      else{ctx.save();ctx.globalAlpha=a*.7;ctx.fillStyle=['#BDEEF5','#809BD9','#AF99E5','#D7C2EF','#F0C1D9','#FFE6B2'][n%6];ctx.beginPath();ctx.arc(x,y,.5+n%3*.3,0,Math.PI*2);ctx.fill();ctx.restore();}
    }
    const radius=i===0?lerp(22,18,ease((introTime-TIMING.launch)/(TIMING.split-TIMING.launch))):5.4*(.88+.12*Math.sin(introTime*.0032+i*.8));
    glow(pt.x,pt.y,i===0?105:30,alpha*(i===0?1.3:.9),i===0?'255,200,87':'190,166,255');
    // A steady central sparkle anchors the smaller stars.
    sparkle(pt.x,pt.y,radius,'#FFF3E4',alpha);
  }
}

function finishIntro(focus=false){
  $('asteroidBeltLink').setAttribute('tabindex','-1');
  if(ready)return;introTime=DURATION;ready=true;stage='ready';$('intro').classList.add('finished');$('intro').setAttribute('aria-hidden','true');$('intro').inert=true;
  orbitTime=Math.max(orbitTime,DURATION-TIMING.solarEnd);document.body.classList.add('ready');$('solarSystem').style.opacity='1';document.documentElement.style.setProperty('--galaxy-opacity','1');$('loadTrack').setAttribute('aria-valuenow','100');$('originalLoadingText').style.opacity='0';$('journeyMemory').style.opacity='0';setPlanetPositions();
  document.querySelectorAll('.celestial').forEach(b=>{b.disabled=false;b.style.opacity='1';b.style.transform='translate(-50%,-50%)';b.style.filter=''});document.querySelector('.orbit-lines').style.opacity='1';document.querySelector('.saturn-ring').style.opacity='1';$('intro').dataset.phase='ready';$('intro').dataset.shootingStars='0';syncMotion()
  if(focus)$('startButton').focus({preventScroll:true});
}
function timelineStage(t){
  if(t<TIMING.launch)return 'loading';
  if(t<TIMING.riseEnd)return 'rising';
  if(t<TIMING.split)return 'holding';
  if(t<TIMING.allStars)return 'splitting';
  if(t<TIMING.orbit)return 'holding';
  if(t<TIMING.depart)return 'orbiting';
  if(t<TIMING.exitEnd)return 'departing';
  if(t<TIMING.solar)return 'clearing';
  if(t<TIMING.solarEnd)return 'solar';
  if(t<TIMING.reveal)return 'settling';
  if(t<DURATION)return 'revealing';
  return 'ready';
}
function updateIntro(){
  if(ready)return;
  const loadingOpacity=ease(introTime/650)*(1-ease((introTime-TIMING.launch)/650));
  $('loading').style.opacity=String(loadingOpacity);
  const gathering=ease(introTime/650)*(1-ease((introTime-TIMING.load)/550));
  $('originalLoadingText').style.opacity=String(gathering);
  $('originalLoadingText').style.filter='blur('+((1-gathering)*5)+'px)';
  const memory=ease((introTime-TIMING.launch-130)/650)*(1-ease((introTime-(TIMING.solar-650))/600));
  $('journeyMemory').style.opacity=String(memory);
  $('journeyMemory').style.transform='translate(-50%,'+((1-memory)*10)+'px)';
  document.querySelector('.loading-star').style.opacity=String(1-ease((introTime-TIMING.launch)/120));
  const percentage=Math.min(100,Math.floor(ease(introTime/TIMING.load)*100));
  if(percentage!==progress){progress=percentage;$('loadFill').style.width=percentage+'%';$('loadNumber').textContent=percentage+'%';$('loadTrack').setAttribute('aria-valuenow',String(percentage));}
  const next=timelineStage(introTime);if(next!==stage){$('intro').classList.remove(stage);$('intro').classList.add(next);stage=next;}
  $('intro').dataset.phase=next;
  $('intro').dataset.shootingStars=String(introTime>=TIMING.allStars&&introTime<TIMING.depart?8:0);
  const opacity=solarOpacity(introTime);$('solarSystem').style.opacity=String(opacity);
  document.querySelector('.orbit-lines').style.opacity='1';document.querySelector('.saturn-ring').style.opacity='1';
  [$('sun'),...orbitButtons].forEach(button=>{button.style.opacity='1';button.style.transform='translate(-50%,-50%)';button.style.filter=''});
  setPlanetPositions();
  document.documentElement.style.setProperty('--galaxy-opacity',String(lerp(.035,1,ease((introTime-TIMING.riseEnd)/(TIMING.solarEnd-TIMING.riseEnd)))));
  if(introTime>=TIMING.reveal)document.body.classList.add('ready');
  if(introTime>=DURATION)finishIntro(document.activeElement===$('skipIntro'));
}

function requestFrame(){if(!frameId&&!document.hidden)frameId=requestAnimationFrame(frame)}
function frame(now){
  frameId=0;
  if(ready&&(paused||reduced)&&lastFrame&&now-lastFrame<30){requestFrame();return;}
  const dt=lastFrame?Math.min(50,now-lastFrame):0;lastFrame=now;twinkleTime+=dt;
  if(!ready)introTime+=dt;
  if(journeyActive)journeyTime+=dt;
  if(!ready)cameraTravel+=dt*(reduced?.12:1.15)*Math.sin(clamp((introTime-TIMING.riseEnd)/(TIMING.solar-TIMING.riseEnd))*Math.PI);
  if(!paused){ambientTime+=dt;if(ready){if(journeyMode!=='planet'||journeyTime>=2400)orbitTime+=dt;}else if(introTime>=TIMING.solarEnd)orbitTime=introTime-TIMING.solarEnd;}
  // Small touch-device drift substitutes for mouse input. A manual pause stops
  // automatic drift; the reduced-motion default uses a much gentler amplitude.
  if(W<700&&!pointerActive&&!userPaused){pointer.targetX=Math.sin(twinkleTime*.00016)*(reduced?1.3:3);pointer.targetY=Math.cos(twinkleTime*.00012)*(reduced?.9:2);}
  const follow=Math.min(1,dt*(reduced?.0045:.006));
  pointer.x=lerp(pointer.x,pointer.targetX,follow);pointer.y=lerp(pointer.y,pointer.targetY,follow);
  document.documentElement.style.setProperty('--px',pointer.x+'px');document.documentElement.style.setProperty('--py',pointer.y+'px');
  drawBackground();updateIntro();if(!ready)drawCinematic();else if(!paused)setPlanetPositions();
  // Light twinkling and cursor response remain alive while orbital motion rests.
  requestFrame();
}

function setNear(near){$('startArea').classList.toggle('near',near);$('startLabel').textContent=near?'GO':'START'}
function updatePointer(e){
  if(e.pointerType==='touch')return;pointerActive=true;
  pointer.targetX=(e.clientX/W-.5)*(reduced?14:22);pointer.targetY=(e.clientY/H-.5)*(reduced?10:14);
  const button=$('startButton').getBoundingClientRect();
  const dx=Math.max(button.left-e.clientX,0,e.clientX-button.right),dy=Math.max(button.top-e.clientY,0,e.clientY-button.bottom);
  setNear(ready&&Math.hypot(dx,dy)<48);if(ready)requestFrame();
}
function showWorld(button){
  if(!ready||journeyActive)return;focusedWorld=button;const name=button.dataset.world;$('worldFact').textContent=facts[name];$('worldTooltip').classList.add('show');document.querySelectorAll('.celestial').forEach(b=>b.classList.toggle('selected',b===button));
}
function setOuter(name){
  const companion=$('innerIcePlanet'),other=name==='uranus'?'neptune':'uranus';companion.classList.remove('uranus','neptune');companion.classList.add(other);companion.dataset.world=other;companion.setAttribute('aria-label','Explore '+other[0].toUpperCase()+other.slice(1));const planet=$('outerPlanet');planet.classList.remove('uranus','neptune');planet.classList.add(name);planet.dataset.world=name;planet.setAttribute('aria-label','Explore '+name[0].toUpperCase()+name.slice(1));$('outerLabel').textContent=name[0].toUpperCase()+name.slice(1);
  $('showUranus').setAttribute('aria-pressed',String(name==='uranus'));$('showNeptune').setAttribute('aria-pressed',String(name==='neptune'));if(focusedWorld===planet)showWorld(planet);
}
function syncMotion(){
  document.body.classList.toggle('paused',paused);$('motionToggle').setAttribute('aria-pressed',String(paused));$('motionLabel').textContent=paused?'Resume Motion':'Pause Motion';document.querySelector('.motion-icon').textContent=paused?'▷':'Ⅱ';$('motionToggle').setAttribute('aria-label',paused?'Resume background and orbital motion':'Pause background and orbital motion');
}

$('skipIntro').addEventListener('click',()=>finishIntro(true));
$('motionToggle').addEventListener('click',()=>{paused=!paused;userPaused=paused;syncMotion();lastFrame=0;requestFrame()});
function replayIntro(){
  $('asteroidBeltLink').setAttribute('tabindex','-1');
  if(journeyActive)leaveEarthJourney(false);
  // An explicit play action opts into the cinematic sequence for this visit.
  reduced=false;paused=false;userPaused=false;captionLanded=false;document.body.classList.add('full-motion');syncMotion();
  ready=false;introTime=0;orbitTime=0;cameraTravel=0;progress=-1;lastFrame=0;stage='loading';document.body.classList.remove('ready');$('intro').className='intro';$('intro').removeAttribute('aria-hidden');$('intro').inert=false;$('solarSystem').style.opacity='0';$('worldTooltip').classList.remove('show');$('loadFill').style.width='0%';$('loadNumber').textContent='0%';$('loadTrack').setAttribute('aria-valuenow','0');$('originalLoadingText').style.opacity='0';$('originalLoadingText').style.filter='';$('journeyMemory').style.opacity='0';
  document.querySelectorAll('.celestial').forEach(b=>{b.disabled=true;b.style.opacity='0'});window.scrollTo({top:0,behavior:'instant'});resize();$('skipIntro').focus({preventScroll:true});requestFrame();
}

$('startButton').addEventListener('focus',()=>setNear(true));$('startButton').addEventListener('blur',()=>setNear(false));
$('startButton').addEventListener('click',()=>{
  const next=$('startButton').dataset.next;
  if(next){window.location.assign(next);return;}
  enterPlanetSelection();
});

function positionSolarCamera(){
  if(!journeyActive)return;
  if(journeyMode==='belt')return positionBeltCamera();
  if(journeyMode==='selection'){
    const box=$('selectionStage').getBoundingClientRect(),p=ease(journeyTime/1100);
    const fit=Math.min(1,(box.width-34)/solarGeometry.width,box.height*.68/solarGeometry.height);
    const scale=lerp(solarStartScale,fit,p),x=lerp(solarOrigin.left-box.left,(box.width-solarGeometry.width*fit)/2,p),y=lerp(solarOrigin.top-box.top,(box.height-solarGeometry.height*fit)/2-20,p);
    $('solarSystem').style.transform='translate3d('+x+'px,'+y+'px,0) scale('+scale+')';return;
  }
  if(journeyMode==='returning')return positionReturnCamera();
  const stageBox=$('earthStage').getBoundingClientRect(),planet=getOrbitPoint(focalIndex),p=ease(journeyTime/2400);
  const base=journeyEarthBase,targetSize=Math.min(stageBox.width*.55,stageBox.height*.66,340),zoom=lerp(solarStartScale,targetSize/base,p);
  $('solarSystem').style.setProperty('--earth-base',base+'px');
  const otherOpacity=1-ease((journeyTime-350)/1150);
  orbitButtons.forEach(body=>{if(body!==focalWorld)body.style.opacity=String(otherOpacity)});
  $('sun').style.opacity='1';document.querySelector('.orbit-lines').style.opacity='1';
  const ex=planet.x-system.left,ey=planet.y-system.top;
  // Move the selected planet’s screen center along one straight line.
  const centerX=lerp(planetZoomOrigin.x,stageBox.left+stageBox.width*.5,p);
  const centerY=lerp(planetZoomOrigin.y,stageBox.top+stageBox.height*.5,p);
  const x=centerX-stageBox.left-ex*zoom,y=centerY-stageBox.top-ey*zoom;
  $('solarSystem').style.transform='translate3d('+x+'px,'+y+'px,0) scale('+zoom+')';
  Object.assign(focalWorld.style,{left:'0px',top:'0px',width:(base*zoom)+'px',height:(base*zoom)+'px',transform:'translate3d('+ex+'px,'+ey+'px,0) translate(-50%,-50%) scale('+(1/zoom)+')'});
  moonCompanion.style.left='0px';moonCompanion.style.top='0px';moonCompanion.style.transform='translate3d('+ex+'px,'+ey+'px,0) translate(-50%,-50%) rotate(-18deg) scaleY(.55)';
  positionEarthCompanions(x+ex*zoom,y+ey*zoom,base*zoom);
  return {x,y,zoom,earthX:ex,earthY:ey};
}
function updateMarsShortcut(x,y,planetSize){
  const name=focalWorld.dataset.world,marsSelected=name==='mars',jupiterSelected=name==='jupiter',clickable=marsSelected&&journeyTime>=2400;
  focalWorld.classList.toggle('mars-mission-link',clickable);focalWorld.classList.remove('jupiter-mission-link');
  $('marsNavigationHint').hidden=!marsSelected;$('jupiterNavigationHint').hidden=!jupiterSelected;
  pioneerCompanion.hidden=!jupiterSelected;
  if(jupiterSelected){
    Object.assign(pioneerCompanion.style,{left:x+'px',top:y+'px',width:(planetSize*1.5)+'px',height:(planetSize*1.5)+'px',opacity:String(ease((journeyTime-700)/1000))});
    pioneerCompanion.style.setProperty('--telescope-size',Math.min(82,Math.max(34,planetSize*.23))+'px');pioneerCompanion.inert=journeyTime<2400;
  }
  if(marsSelected||jupiterSelected){
    focalWorld.setAttribute('tabindex',clickable?'0':'-1');focalWorld.setAttribute('aria-label',marsSelected?'Choose a Mars mission':'Jupiter');
    const hint=$(marsSelected?'marsNavigationHint':'jupiterNavigationHint');Object.assign(hint.style,{left:x+'px',top:(y+planetSize/2+36)+'px',opacity:String(ease((journeyTime-1400)/800))});
  }
}
function activateWorld(button){
  if(journeyMode==='selection'){enterEarthJourney(button.dataset.world);return;}
  if(journeyMode==='planet'&&button===focalWorld&&button.dataset.world==='mars'&&journeyTime>=2400){openMarsSurface(button);return;}
  showWorld(button);
}
let marsSurfaceOpening=false;
async function openMarsSurface(button,destination='mars.html',surface='mars'){
  if(marsSurfaceOpening)return;
  marsSurfaceOpening=true;
  document.dispatchEvent(new Event('cosmic-surface-entry'));
  const box=button.getBoundingClientRect(),layer=document.createElement('div'),planet=button.cloneNode(true),wash=document.createElement('div');
  layer.className='mars-surface-transition journey-solar '+surface+'-surface-zoom';layer.setAttribute('aria-hidden','true');
  planet.removeAttribute('id');planet.removeAttribute('tabindex');planet.disabled=true;
  if(surface==='moon'){
    planet.className='moon-surface-orb';planet.removeAttribute('href');planet.innerHTML='';
  }
  planet.querySelectorAll('.world-label').forEach(label=>label.remove());
  Object.assign(planet.style,{left:(box.left+box.width/2)+'px',top:(box.top+box.height/2)+'px',width:box.width+'px',height:box.height+'px',opacity:'1',transform:'translate(-50%,-50%)',pointerEvents:'none'});
  wash.className='mars-arrival-wash '+surface+'-arrival-wash';layer.appendChild(planet);layer.appendChild(wash);document.body.appendChild(layer);
  document.body.classList.add('entering-mars-surface');$('solarSystem').inert=true;$('backToCover').disabled=true;
  const duration=reduced?180:1200,target=Math.hypot(window.innerWidth,window.innerHeight)*2.2;
  const zoom=planet.animate(reduced?[{opacity:1},{opacity:1}]:[
    {left:planet.style.left,top:planet.style.top,width:box.width+'px',height:box.height+'px'},
    {left:'50%',top:'50%',width:target+'px',height:target+'px'}
  ],{duration,easing:'cubic-bezier(.55,.05,.35,1)',fill:'forwards'});
  wash.animate([{opacity:0,offset:0},{opacity:0,offset:.65},{opacity:1,offset:1}],{duration,fill:'forwards'});
  await zoom.finished;
  window.location.assign(destination);
}
window.addEventListener('pageshow',()=>{
  document.querySelector('.mars-surface-transition')?.remove();
  if(marsSurfaceOpening){marsSurfaceOpening=false;document.body.classList.remove('entering-mars-surface');$('solarSystem').inert=false;$('backToCover').disabled=false;}
});

function positionEarthCompanions(x,y,planetSize){
  updateMarsShortcut(x,y,planetSize);
  const earthSelected=focalWorld.dataset.world==='earth';
  keplerCompanion.hidden=!earthSelected;
  const hint=$('earthNavigationHint');hint.hidden=!earthSelected;
  if(!earthSelected)return;
  keplerCompanion.style.left=x+'px';keplerCompanion.style.top=y+'px';
  keplerCompanion.style.width=(planetSize*1.36)+'px';keplerCompanion.style.height=(planetSize*1.36)+'px';
  keplerCompanion.style.setProperty('--telescope-size',Math.min(74,Math.max(30,planetSize*.20))+'px');
  keplerCompanion.style.opacity=String(ease((journeyTime-700)/1000));
  hint.style.left=x+'px';hint.style.top=(y+planetSize/2+36)+'px';
  hint.style.opacity=String(ease((journeyTime-1400)/800));
  const arriving=journeyTime<2400;keplerCompanion.inert=arriving;moonCompanion.inert=arriving;
}
function resetPlanetScene(){
  pioneerCompanion.hidden=true;pioneerCompanion.inert=true;$('beltMissionStage').hidden=true;$('beltMissionStage').inert=true;
  $('earthNavigationHint').hidden=true;$('marsNavigationHint').hidden=true;$('jupiterNavigationHint').hidden=true;
  keplerCompanion.hidden=true;keplerCompanion.inert=true;moonCompanion.inert=true;
  orbitButtons.forEach(button=>{button.style.width='';button.style.height='';button.style.opacity='1';button.style.transform='translate(-50%,-50%)';button.classList.remove('planet-focal','earth-focal','mars-mission-link','jupiter-mission-link');button.setAttribute('aria-label','Explore '+button.dataset.world[0].toUpperCase()+button.dataset.world.slice(1));button.removeAttribute('tabindex');});
  $('sun').style.opacity='1';document.querySelector('.orbit-lines').style.opacity='1';
  moonHome.appendChild(moonCompanion);moonCompanion.hidden=false;moonCompanion.classList.remove('solar-moon');Object.assign(moonCompanion.style,{left:'',top:'',transform:'',filter:''});
}
function enterPlanetSelection(){
  if(journeyMode==='planet'||journeyMode==='belt'){beginSolarReturn();return;}
  if(!ready||journeyMode==='selection'||journeyMode==='returning')return;
  const from=$('solarSystem').getBoundingClientRect();
  if(journeyActive)resetPlanetScene();
  else {
    solarGeometry={width:from.width,height:from.height};
    // Preserve the solar illustration’s space so the cover words fade where they are.
    solarPlaceholder=document.createElement('div');solarPlaceholder.setAttribute('aria-hidden','true');
    const solarMargin=getComputedStyle($('solarSystem')).marginBottom;
    Object.assign(solarPlaceholder.style,{width:from.width+'px',height:from.height+'px',maxWidth:'100%',flex:'0 0 auto',marginBottom:solarMargin,visibility:'hidden',pointerEvents:'none'});
    solarHome.insertBefore(solarPlaceholder,$('solarSystem'));
  }
  journeyActive=true;journeyMode='selection';journeyTime=0;
  $('planetSelection').hidden=false;$('earthJourney').hidden=true;
  $('selectionStage').appendChild($('solarSystem'));$('solarSystem').classList.remove('journey-solar','belt-solar');$('solarSystem').classList.add('selection-solar');
  Object.assign($('solarSystem').style,{width:solarGeometry.width+'px',height:solarGeometry.height+'px',opacity:'1'});
  // Returning from a close-up uses a gentle dissolve into the centred overview.
  solarOrigin=from;solarStartScale=from.width/solarGeometry.width;
  if(from.width>solarGeometry.width*1.1){journeyTime=1100;if($('solarSystem').animate)$('solarSystem').animate([{opacity:0},{opacity:1}],{duration:650});}
  system={left:0,top:0,width:solarGeometry.width,height:solarGeometry.height};
  document.body.classList.add('journey-open','choosing-world');$('cover').inert=true;$('cover').setAttribute('aria-hidden','true');document.querySelector('.cover-controls').inert=true;$('skipOpening').disabled=true;
  $('sun').setAttribute('tabindex','-1');orbitButtons.forEach(button=>{const canChoose=selectableWorlds.includes(button.dataset.world);button.setAttribute('tabindex',canChoose?'0':'-1');button.setAttribute('aria-describedby','selectionPrompt');});
  $('asteroidBeltLink').setAttribute('tabindex','0');setPlanetPositions();paused=false;userPaused=false;syncMotion();requestFrame();earthWorld.focus({preventScroll:true});
}
function enterEarthJourney(name='earth'){
  $('asteroidBeltLink').setAttribute('tabindex','-1');
  if(!ready||journeyMode!=='selection'||!selectableWorlds.includes(name))return;
  focalIndex=orbitButtons.findIndex(button=>button.dataset.world===name);focalWorld=orbitButtons[focalIndex];
  journeyEarthBase=focalWorld.offsetWidth||({earth:38,mars:29,jupiter:66}[name]);
  const selectedBox=focalWorld.getBoundingClientRect();
  planetZoomOrigin={x:selectedBox.left+selectedBox.width/2,y:selectedBox.top+selectedBox.height/2};
  solarOrigin=$('solarSystem').getBoundingClientRect();solarStartScale=solarOrigin.width/solarGeometry.width;journeyMode='planet';journeyTime=0;$('earthJourney').setAttribute('aria-label',name[0].toUpperCase()+name.slice(1)+' close-up');
  $('earthJourney').hidden=false;$('planetSelection').hidden=true;$('earthStage').appendChild($('solarSystem'));
  $('solarSystem').classList.remove('selection-solar');$('solarSystem').classList.add('journey-solar');document.body.classList.remove('choosing-world','selection-arriving');
  $('solarSystem').appendChild(moonCompanion);moonCompanion.classList.add('solar-moon');moonCompanion.hidden=name!=='earth';
  focalWorld.classList.add('planet-focal');if(name==='earth')focalWorld.classList.add('earth-focal');
  orbitButtons.forEach(button=>button.setAttribute('tabindex','-1'));setPlanetPositions();$('earthJourney').scrollTop=0;requestFrame();$('backToCover').focus({preventScroll:true});
}
function leaveEarthJourney(focus=true){
  if(!journeyActive)return;
  $('asteroidBeltLink').setAttribute('tabindex','-1');journeyActive=false;journeyMode='cover';returnCamera=null;$('solarSystem').inert=false;$('solarSystem').style.opacity='1';document.body.classList.remove('return-dissolve');$('backToCover').disabled=false;$('skipOpening').disabled=false;resetPlanetScene();
  solarHome.insertBefore($('solarSystem'),solarSibling);if(solarPlaceholder){solarPlaceholder.remove();solarPlaceholder=null;}planetZoomOrigin=null;$('solarSystem').classList.remove('journey-solar','selection-solar','belt-solar');Object.assign($('solarSystem').style,{width:'',height:'',transform:''});
  orbitButtons.forEach(button=>button.removeAttribute('aria-describedby'));$('sun').removeAttribute('tabindex');
  document.body.classList.remove('journey-open','choosing-world','selection-arriving');$('earthJourney').hidden=true;$('planetSelection').hidden=true;$('cover').inert=false;$('cover').removeAttribute('aria-hidden');document.querySelector('.cover-controls').inert=false;document.body.classList.add('ready');setNear(false);resize();
  if(focus)$('startButton').focus({preventScroll:true});requestFrame();
}
function beginSolarReturn(){
  if(journeyMode!=='planet'&&journeyMode!=='belt')return;
  // Freeze the close-up camera, fade it away, then reveal the overview at its final scale.
  positionSolarCamera();returnCamera={swapped:false,focusTarget:journeyMode==='belt'?$('asteroidBeltLink'):focalWorld,overlayOpacity:parseFloat($('beltMissionStage').style.opacity)||0};
  journeyMode='returning';journeyTime=0;
  document.body.classList.remove('selection-arriving');document.body.classList.add('return-dissolve');
  $('solarSystem').inert=true;$('beltMissionStage').inert=true;pioneerCompanion.inert=true;keplerCompanion.inert=true;moonCompanion.inert=true;$('backToCover').disabled=true;requestFrame();
}
function positionReturnCamera(){
  const duration=reduced?300:SOLAR_RETURN_DURATION;
  const p=clamp(journeyTime/duration),solar=$('solarSystem');
  if(p<.5){solar.style.opacity=String(1-ease(p*2));$('beltMissionStage').style.opacity=String(returnCamera.overlayOpacity*(1-ease(p*2)));return;}
  if(!returnCamera.swapped){
    solar.style.opacity='0';resetPlanetScene();
    $('planetSelection').hidden=false;$('selectionStage').appendChild(solar);
    solar.classList.remove('journey-solar','belt-solar');solar.classList.add('selection-solar');
    Object.assign(solar.style,{width:solarGeometry.width+'px',height:solarGeometry.height+'px'});
    system={left:0,top:0,width:solarGeometry.width,height:solarGeometry.height};
    $('earthJourney').hidden=true;returnCamera.swapped=true;
    // Rejoin the orbit while invisible, before the overview starts fading in.
    orbitButtons.forEach((button,index)=>{
      const point=getOrbitPoint(index);
      Object.assign(button.style,{left:(point.x-system.left)+'px',top:(point.y-system.top)+'px',transform:'translate(-50%,-50%)'});
    });
  }
  const box=$('selectionStage').getBoundingClientRect();
  const fit=Math.min(1,(box.width-34)/solarGeometry.width,box.height*.68/solarGeometry.height);
  const x=(box.width-solarGeometry.width*fit)/2,y=(box.height-solarGeometry.height*fit)/2-20;
  solar.style.transform='translate3d('+x+'px,'+y+'px,0) scale('+fit+')';
  solar.style.opacity=String(ease((p-.5)*2));
  if(p>=1)finishSolarReturn();
}
function finishSolarReturn(){
  const focusTarget=returnCamera?.focusTarget||focalWorld;
  resetPlanetScene();journeyMode='selection';journeyTime=1100;returnCamera=null;
  $('planetSelection').hidden=false;
  $('solarSystem').classList.remove('journey-solar','belt-solar');$('solarSystem').classList.add('selection-solar');
  $('solarSystem').style.opacity='1';$('solarSystem').inert=false;
  $('earthJourney').hidden=true;$('backToCover').disabled=false;
  document.body.classList.remove('return-dissolve');document.body.classList.add('choosing-world','selection-arriving');
  orbitButtons.forEach(button=>button.setAttribute('tabindex',selectableWorlds.includes(button.dataset.world)?'0':'-1'));
  $('asteroidBeltLink').setAttribute('tabindex','0');setPlanetPositions();focusTarget.focus({preventScroll:true});requestFrame();
}
function enterBeltJourney(){
  if(!ready||journeyMode!=='selection')return;
  const solar=$('solarSystem'),box=solar.getBoundingClientRect(),local={x:solarGeometry.width*.5,y:solarGeometry.height*79/400};
  solarStartScale=box.width/solarGeometry.width;beltZoomOrigin={x:box.left+local.x*solarStartScale,y:box.top+local.y*solarStartScale,localX:local.x,localY:local.y};
  journeyMode='belt';journeyTime=0;$('earthJourney').hidden=false;$('earthJourney').setAttribute('aria-label','Asteroid belt close-up');$('planetSelection').hidden=true;
  $('earthStage').appendChild(solar);solar.classList.remove('selection-solar');solar.classList.add('journey-solar','belt-solar');
  moonCompanion.hidden=true;keplerCompanion.hidden=true;pioneerCompanion.hidden=true;
  ['earthNavigationHint','marsNavigationHint','jupiterNavigationHint'].forEach(id=>$(id).hidden=true);
  $('beltMissionStage').hidden=false;$('beltMissionStage').inert=true;$('beltMissionStage').style.opacity='0';$('asteroidBeltLink').setAttribute('tabindex','-1');
  orbitButtons.forEach(button=>button.setAttribute('tabindex','-1'));document.body.classList.remove('choosing-world','selection-arriving');
  positionSolarCamera();requestFrame();$('backToCover').focus({preventScroll:true});
}
function positionBeltCamera(){
  const box=$('earthStage').getBoundingClientRect(),p=ease(journeyTime/1800),target=Math.max(1.5,Math.min(3.5,box.width/solarGeometry.width*2.7)),zoom=lerp(solarStartScale,target,p);
  const cx=lerp(beltZoomOrigin.x,box.left+box.width*.5,p),cy=lerp(beltZoomOrigin.y,box.top+box.height*.37,p);
  $('solarSystem').style.transform='translate3d('+(cx-box.left-beltZoomOrigin.localX*zoom)+'px,'+(cy-box.top-beltZoomOrigin.localY*zoom)+'px,0) scale('+zoom+')';
  const opacity=1-ease(journeyTime/700);orbitButtons.forEach(button=>button.style.opacity=String(opacity));$('sun').style.opacity=String(opacity);document.querySelector('.orbit-lines').style.opacity=String(opacity);
  $('beltMissionStage').style.opacity=String(ease((journeyTime-600)/1000));$('beltMissionStage').inert=journeyTime<1800;
}
$('asteroidBeltLink').addEventListener('click',event=>{event.preventDefault();if(ready&&journeyMode==='selection')enterBeltJourney();});
$('asteroidBeltLink').addEventListener('keydown',event=>{if(event.key===' '){event.preventDefault();if(ready&&journeyMode==='selection')enterBeltJourney();}});
$('selectionBack').addEventListener('click',()=>leaveEarthJourney());

$('backToCover').addEventListener('click',enterPlanetSelection);
$('skipOpening').addEventListener('click',()=>finishIntro(true));
$('showUranus').addEventListener('click',()=>setOuter('uranus'));$('showNeptune').addEventListener('click',()=>setOuter('neptune'));
document.querySelectorAll('.celestial').forEach(button=>{button.disabled=true;button.addEventListener('click',()=>activateWorld(button));button.addEventListener('pointerenter',()=>{if(ready)button.classList.add('hovered')});button.addEventListener('pointerleave',()=>button.classList.remove('hovered'))});
$('closeFact').addEventListener('click',()=>{$('worldTooltip').classList.remove('show');if(focusedWorld)focusedWorld.focus({preventScroll:true})});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(journeyMode==='planet'||journeyMode==='belt')enterPlanetSelection();else if(journeyActive)leaveEarthJourney();else if(!ready)finishIntro(true);else $('worldTooltip').classList.remove('show')}});
document.addEventListener('pointermove',updatePointer,{passive:true});
document.addEventListener('pointerleave',()=>{pointerActive=false;pointer.targetX=0;pointer.targetY=0;setNear(false);requestFrame()});
window.addEventListener('blur',()=>{pointer.targetX=0;pointer.targetY=0;setNear(false)});
window.addEventListener('scroll',()=>{if(journeyActive)return;if(pointerActive)setNear(false);const box=$('solarSystem').getBoundingClientRect();system.left=box.left;system.top=box.top;if(ready)setPlanetPositions()},{passive:true});
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{lastFrame=0;if(document.hidden){cancelAnimationFrame(frameId);frameId=0}else requestFrame()});
motionPreference.addEventListener('change',event=>{reduced=event.matches;if(reduced){if(ready)paused=true;pointer.x=pointer.y=pointer.targetX=pointer.targetY=0;syncMotion();requestFrame()}});
if(ctx){resize();syncMotion();updateIntro();requestFrame()}
else{finishIntro();canvas.hidden=true;document.querySelectorAll('.planet').forEach((button,i)=>{const angle=phases[i];button.style.left=(50+Math.cos(angle)*orbitRadii[i][0]/10)+'%';button.style.top=(50+Math.sin(angle)*orbitRadii[i][1]/4)+'%'});$('motionToggle').hidden=true}

// Retain a real link for modified clicks, but animate ordinary Moon entry.
document.querySelector('.moon-link').addEventListener('click',event=>{
  if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button>0)return;
  if(journeyMode!=='planet'||focalWorld.dataset.world!=='earth'||journeyTime<2400)return;
  event.preventDefault();openMarsSurface(event.currentTarget,'moon.html','moon');
});
