var $=function(i){return document.getElementById(i)};
var order=['start','arrival','parts','mathilde','setback','orbit','mapping','landing','done','quiz','pick','badge'];
var hist=[],curS='start';
function go(id,isBack){
  if(!isBack&&curS!==id)hist.push(curS);
  curS=id;
  document.querySelectorAll('.screen').forEach(function(s){s.classList.toggle('on',s.id===id)});
  
  var pct=order.indexOf(id)/(order.length-1)*100;
  $('fill').style.width=pct+'%';$('hr').style.left=pct+'%';
  $('back').classList.toggle('hide',!hist.length);
  window.scrollTo(0,0);
  if(id==='parts')initParts();
}
document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){go(b.dataset.go)})});
$('back').onclick=function(){if(hist.length)go(hist.pop(),true)};
var st=$('stars');
for(var i=0;i<70;i++){var d=document.createElement('i'),z=Math.random()*2.5+1;d.style.cssText='left:'+Math.random()*100+'vw;top:'+Math.random()*75+'vh;width:'+z+'px;height:'+z+'px;animation-delay:'+Math.random()*3+'s';st.appendChild(d)}
document.addEventListener('pointermove',function(e){st.style.transform='translate('+((e.clientX/innerWidth-.5)*-14)+'px,'+((e.clientY/innerHeight-.5)*-14)+'px)'});

/* Real photos: if one cannot load, show a link to the NASA page instead of fake art */
document.querySelectorAll('.nasa-photo img').forEach(function(im){im.addEventListener('error',function(){
  var d=document.createElement('div');d.className='miss';d.innerHTML='This NASA photo could not load here.<br><a href="'+im.dataset.page+'" target="_blank" rel="noopener">Open it on NASA\'s website</a>';im.replaceWith(d)})});

/* Particle effects */
var fx=$('fx'),fc=fx.getContext('2d'),ps=[],run=false;
function fit(){fx.width=innerWidth;fx.height=innerHeight}fit();addEventListener('resize',fit);
function shape(h,s){fc.beginPath();
  if(h==='star'){for(var i=0;i<10;i++){var r=i%2?s*.45:s;fc.lineTo(Math.cos(i*Math.PI/5)*r,Math.sin(i*Math.PI/5)*r)}}
  else if(h==='heart'){fc.moveTo(0,s*.4);fc.bezierCurveTo(-s,-s*.2,-s*.5,-s,0,-s*.45);fc.bezierCurveTo(s*.5,-s,s,-s*.2,0,s*.4)}
  else if(h==='spark'){fc.moveTo(0,-s);fc.quadraticCurveTo(0,0,s,0);fc.quadraticCurveTo(0,0,0,s);fc.quadraticCurveTo(0,0,-s,0);fc.quadraticCurveTo(0,0,0,-s)}
  else{fc.arc(0,0,s*.35,0,6.3)}
  fc.closePath();fc.fill()}
function tick(){fc.clearRect(0,0,fx.width,fx.height);ps=ps.filter(function(p){return p.l>0});
  ps.forEach(function(p){p.x+=p.vx;p.y+=p.vy;p.vy+=.16;p.vx*=.985;p.l-=.013;p.r+=p.vr;fc.save();fc.globalAlpha=Math.max(p.l,0);fc.translate(p.x,p.y);fc.rotate(p.r);fc.fillStyle=p.c;shape(p.h,p.s);fc.restore()});
  if(ps.length)requestAnimationFrame(tick);else{run=false}}
function burst(x,y,cols,shapes,n){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  for(var i=0;i<n;i++){var a=Math.random()*6.283,sp=3+Math.random()*8;
    ps.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-3,l:1,r:Math.random()*6,vr:(Math.random()-.5)*.3,s:7+Math.random()*11,c:cols[i%cols.length],h:shapes[i%shapes.length]})}
  if(!run){run=true;requestAnimationFrame(tick)}}

/* Educational interpretation of NEAR's octagonal body and four solar panels. */
var PD={
 panels:['Four solar panels','Four solar panels supplied electrical power for the spacecraft.'],
 antenna:['Radio antenna','The fixed high-gain antenna carried observations and measurements back to Earth.'],
 camera:['Multispectral imager','The camera photographed Mathilde and Eros and helped map surface features.'],
 laser:['Laser rangefinder','Timed laser returns measured distance to the surface and helped map Eros’s shape.'],
 spectra:['Spectrometers','Infrared, X-ray, and gamma-ray measurements investigated mineral and elemental composition.'],
 magnet:['Magnetometer','A magnetic-field instrument contributed to the investigation of the asteroid’s physical properties.'],
 body:['Spacecraft body','The octagonal structure carried equipment and propellant. NEAR had thrusters but no landing legs.']
};
function renderParts(){
 $('pb').innerHTML='';Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
}
function buildCraft(T){
 var root=new T.Group(),parts={};Object.keys(PD).forEach(function(k){parts[k]=new T.Group();root.add(parts[k])});
 var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||24)};
 function mk(k,g,c,x,y,z,rx,ry,rz){var m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.55,metalness:.35}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.userData.part=k;parts[k].add(m);return m}
 mk('body',C(.8,1.5,8),0xCDAF68,0,1.2,0);mk('body',C(.84,.08,8),0xE5D9B8,0,2,0);mk('body',C(.84,.08,8),0xD7C595,0,.42,0);mk('body',new T.CylinderGeometry(.15,.32,.35,24),0x8F98A7,0,.2,0);
 for(var i=0;i<4;i++){var angle=i*Math.PI/2+Math.PI/4,x=Math.cos(angle),z=Math.sin(angle);mk('panels',B(.7,.06,.09),0xC3D0DF,x*1.05,1.9,z*1.05,0,-angle);mk('panels',B(2.1,.04,1.05),0x3A4B8F,x*2.3,1.9,z*2.3,0,-angle);for(var j=-3;j<=3;j++){var at=2.3+j*.28;mk('panels',B(.015,.012,1.02),0x9DB1D0,x*at,1.93,z*at,0,-angle)}}
 mk('antenna',C(.05,.5),0xCCD6E3,0,2.25,0);mk('antenna',new T.CylinderGeometry(.87,.13,.25,40),0xE2E6E5,0,2.6,0);mk('antenna',C(.025,.45),0xB3C1D2,0,2.87,0);
 mk('camera',B(.35,.3,.3),0xC5CFDC,.5,.48,.5);mk('camera',C(.08,.12),0x18253F,.5,.48,.7,Math.PI/2);
 mk('laser',B(.28,.4,.3),0xAEBFD0,-.45,.45,.5);mk('laser',C(.07,.06),0x6BC8E0,-.45,.21,.5);
 mk('spectra',B(.35,.45,.35),0xB8C1CC,-.65,1.25,.3);mk('spectra',C(.19,.35),0xCCD4DE,.4,.3,-.4);
 mk('magnet',B(1.15,.055,.055),0xD5DBE3,1.15,1.55,0);mk('magnet',B(.18,.23,.18),0xB9C6D6,1.8,1.55,0);
 return {root:root,parts:parts};
}

var P3={ready:false,failed:false,sel:null};
function selPart(k){
  document.querySelectorAll('.pbtn').forEach(function(b){b.classList.toggle('on',b.dataset.p===k)});
  $('pinfo').innerHTML='<b>'+PD[k][0]+'</b><br>'+PD[k][1];
  P3.sel=k;
  if(P3.ready)Object.keys(P3.parts).forEach(function(n){P3.parts[n].traverse(function(m){if(!m.isMesh)return;
    m.material.emissive.setHex(n===k?0xFFA800:0x000000);m.material.emissiveIntensity=n===k?.85:0;
    m.material.transparent=true;m.material.opacity=n===k?1:.18;m.material.needsUpdate=true})});
}
renderParts();
function initParts(){
  if(P3.ready){if(P3.resize)P3.resize();return}if(P3.failed)return;
  try{
    var cv=$('cv3'),box=$('r3'),T=THREE;
    var rd=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});rd.setPixelRatio(Math.min(devicePixelRatio,2));
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(6.4,4,8.4);cam.lookAt(0,1.2,0);
    sc.add(new T.HemisphereLight(0xffffff,0x66402a,.95));var dl=new T.DirectionalLight(0xffffff,.9);dl.position.set(5,9,6);sc.add(dl);
    var built=buildCraft(T),root=built.root;sc.add(root);root.rotation.y=.7;P3.parts=built.parts;
    function size(){var w=box.clientWidth,h=box.clientHeight;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    P3.resize=size;size();new ResizeObserver(function(){if(box.clientWidth&&box.clientHeight)size()}).observe(box);addEventListener('resize',function(){if(box.clientWidth&&box.clientHeight)size()});
    var drag=false,lx=0,moved=0;
    cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;moved=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);root.rotation.y+=dx*.012});
    cv.addEventListener('pointerup',function(e){drag=false;cv.style.cursor='grab';
      if(moved<6){var r=cv.getBoundingClientRect(),rc=new T.Raycaster();
        rc.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);
        var h=rc.intersectObjects(root.children,true).filter(function(i){return i.object.userData.part})[0];
        if(h)selPart(h.object.userData.part)}});
    (function loop(){if($('parts').classList.contains('on')){if(!drag&&!matchMedia('(prefers-reduced-motion:reduce)').matches)root.rotation.y+=.004;rd.render(sc,cam)}requestAnimationFrame(loop)})();
    P3.ready=true;if(P3.sel)selPart(P3.sel);
  }catch(e){P3.failed=true;$('r3').innerHTML='<p style="padding:30px;text-align:center">The 3D view needs a browser with WebGL. You can still tap the names below to learn about each part!</p>'}
}

/* Custom reaction icons (same style as the cards) */
var RI={
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'An orbiter became an asteroid pioneer!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'A dedicated team helped a small spacecraft achieve two historic firsts.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big questions take patience and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[{"q":"Which asteroid did NEAR orbit?","o":["Eros","Ceres","Vesta"],"a":0,"e":"NEAR entered orbit around Eros on February 14, 2000."},{"q":"What could the laser rangefinder help measure?","o":["The color of stars","Distance to the surface","The taste of rocks"],"a":1,"e":"Laser measurements helped map the asteroid’s shape and surface heights."},{"q":"What happened after NEAR touched down?","o":["It drove away on wheels","It returned to Earth","It survived and sent more data"],"a":2,"e":"Despite not being designed as a lander, NEAR continued useful measurements from Eros."}];
var qi=0,score=0;
/* Shuffle choices while keeping each correct answer attached to its text. */
function shuffleQuiz(){
  Q.forEach(function(q){
    var choices=q.o.map(function(text,index){return {text:text,correct:index===q.a}});
    for(var i=choices.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),temp=choices[i];choices[i]=choices[j];choices[j]=temp}
    q.o=choices.map(function(choice){return choice.text});
    q.a=choices.findIndex(function(choice){return choice.correct});
  });
  // Avoid the old first/second/third answer pattern even when it occurs by chance.
  if(Q.length===3&&Q.every(function(q,i){return q.a===i})){
    var q=Q[0],next=(q.a+1)%q.o.length,temp=q.o[q.a];q.o[q.a]=q.o[next];q.o[next]=temp;q.a=next;
  }
}
shuffleQuiz();
function showQ(){var c=Q[qi],box=$('qo');$('qn').textContent='Question '+(qi+1)+' of '+Q.length;$('qt').textContent=c.q;$('qf').textContent='';$('qnext').classList.add('hide');box.innerHTML='';box.className='';
  c.o.forEach(function(t,i){var b=document.createElement('button');b.className='opt';b.textContent=t;
    b.onclick=function(){if(box.className)return;box.className='locked';var ok=i===c.a;if(ok){score++;var r=b.getBoundingClientRect();burst(r.left+60,r.top+r.height/2,['#7CF0B8','#FFC857','#fff'],['spark','dot'],18)}
      b.classList.add(ok?'good':'bad');box.children[c.a].classList.add('good');$('qf').textContent=(ok?'Correct! ':'Not quite. ')+c.e;
      var n=$('qnext');n.textContent=qi===Q.length-1?'Choose my favorite part':'Next';n.classList.remove('hide')};box.appendChild(b)})}
$('qnext').onclick=function(){qi++;if(qi<Q.length)showQ();else go('pick')};
document.querySelector('[data-go="quiz"]').addEventListener('click',function(){qi=0;score=0;shuffleQuiz();showQ()});
showQ();

/* Explorer cards */
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('nearCraft').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#EAF4FF\"><circle cx=\"24\" cy=\"23\" r=\"2\"/><circle cx=\"88\" cy=\"91\" r=\"1.3\"/><circle cx=\"177\" cy=\"22\" r=\"1.6\"/><circle cx=\"312\" cy=\"31\" r=\"1.4\"/><circle cx=\"409\" cy=\"80\" r=\"2\"/><circle cx=\"335\" cy=\"186\" r=\"1.5\"/></g><path d=\"M141 67L190 35L251 43L290 86L277 151L226 179L166 159L132 113Z\" fill=\"#747079\" stroke=\"#AAA3AC\" stroke-width=\"2\"/><g fill=\"#45434F\" stroke=\"#98919A\" stroke-width=\"3\"><circle cx=\"192\" cy=\"91\" r=\"30\"/><circle cx=\"251\" cy=\"124\" r=\"25\"/><circle cx=\"183\" cy=\"150\" r=\"13\"/></g><g><use href=\"#nearCraft\" x=\"21\" y=\"35\" width=\"100\" height=\"77.77777777777777\"/></g><path d=\"M42 170Q222 203 401 123\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"2\" stroke-dasharray=\"5 6\"/></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#EAF4FF\"><circle cx=\"24\" cy=\"23\" r=\"2\"/><circle cx=\"88\" cy=\"91\" r=\"1.3\"/><circle cx=\"177\" cy=\"22\" r=\"1.6\"/><circle cx=\"312\" cy=\"31\" r=\"1.4\"/><circle cx=\"409\" cy=\"80\" r=\"2\"/><circle cx=\"335\" cy=\"186\" r=\"1.5\"/></g><g transform=\"translate(336 112) scale(0.63)\"><path d=\"M-104 7Q-115-35-65-48Q-28-63 4-30Q24-20 44-34Q94-48 109-9Q124 25 81 41Q43 61 10 35Q-10 27-36 43Q-86 63-104 7Z\" fill=\"#A59480\" stroke=\"#D0BDA6\" stroke-width=\"2\"/><g fill=\"#786E66\" stroke=\"#BEAC96\" stroke-width=\"2\"><ellipse cx=\"-61\" cy=\"-9\" rx=\"22\" ry=\"17\"/><ellipse cx=\"65\" cy=\"5\" rx=\"18\" ry=\"14\"/><ellipse cx=\"-7\" cy=\"6\" rx=\"12\" ry=\"8\"/></g><path d=\"M-72 28Q-22 17 12 30\" stroke=\"#D0BDA6\" stroke-width=\"3\" fill=\"none\"/></g><path d=\"M42 161Q157 37 264 95\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\" stroke-dasharray=\"5 6\"/><path d=\"M267 96Q410 198 193 179Q70 155 202 94\" fill=\"none\" stroke=\"#FFD786\" stroke-width=\"3\" stroke-dasharray=\"5 6\"/><use href=\"#nearCraft\" x=\"81\" y=\"34\" width=\"108\" height=\"84\"/></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#EAF4FF\"><circle cx=\"24\" cy=\"23\" r=\"2\"/><circle cx=\"88\" cy=\"91\" r=\"1.3\"/><circle cx=\"177\" cy=\"22\" r=\"1.6\"/><circle cx=\"312\" cy=\"31\" r=\"1.4\"/><circle cx=\"409\" cy=\"80\" r=\"2\"/><circle cx=\"335\" cy=\"186\" r=\"1.5\"/></g><g transform=\"translate(220 119) scale(0.65)\"><path d=\"M-104 7Q-115-35-65-48Q-28-63 4-30Q24-20 44-34Q94-48 109-9Q124 25 81 41Q43 61 10 35Q-10 27-36 43Q-86 63-104 7Z\" fill=\"#A59480\" stroke=\"#D0BDA6\" stroke-width=\"2\"/><g fill=\"#786E66\" stroke=\"#BEAC96\" stroke-width=\"2\"><ellipse cx=\"-61\" cy=\"-9\" rx=\"22\" ry=\"17\"/><ellipse cx=\"65\" cy=\"5\" rx=\"18\" ry=\"14\"/><ellipse cx=\"-7\" cy=\"6\" rx=\"12\" ry=\"8\"/></g><path d=\"M-72 28Q-22 17 12 30\" stroke=\"#D0BDA6\" stroke-width=\"3\" fill=\"none\"/></g><ellipse cx=\"220\" cy=\"109\" rx=\"163\" ry=\"57\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"2\" stroke-dasharray=\"4 6\"/><g><use href=\"#nearCraft\" x=\"24\" y=\"73\" width=\"70\" height=\"54.44444444444444\"/></g></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#EAF4FF\"><circle cx=\"24\" cy=\"23\" r=\"2\"/><circle cx=\"88\" cy=\"91\" r=\"1.3\"/><circle cx=\"177\" cy=\"22\" r=\"1.6\"/><circle cx=\"312\" cy=\"31\" r=\"1.4\"/><circle cx=\"409\" cy=\"80\" r=\"2\"/><circle cx=\"335\" cy=\"186\" r=\"1.5\"/></g><g transform=\"translate(254 138) scale(0.9)\"><path d=\"M-104 7Q-115-35-65-48Q-28-63 4-30Q24-20 44-34Q94-48 109-9Q124 25 81 41Q43 61 10 35Q-10 27-36 43Q-86 63-104 7Z\" fill=\"#A59480\" stroke=\"#D0BDA6\" stroke-width=\"2\"/><g fill=\"#786E66\" stroke=\"#BEAC96\" stroke-width=\"2\"><ellipse cx=\"-61\" cy=\"-9\" rx=\"22\" ry=\"17\"/><ellipse cx=\"65\" cy=\"5\" rx=\"18\" ry=\"14\"/><ellipse cx=\"-7\" cy=\"6\" rx=\"12\" ry=\"8\"/></g><path d=\"M-72 28Q-22 17 12 30\" stroke=\"#D0BDA6\" stroke-width=\"3\" fill=\"none\"/></g><use href=\"#nearCraft\" x=\"43\" y=\"17\" width=\"115\" height=\"89.44444444444444\"/><path d=\"M138 87L222 121\" stroke=\"#8FE3F5\" stroke-width=\"3\" stroke-dasharray=\"5 5\"/><circle cx=\"222\" cy=\"121\" r=\"8\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\"/></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#EAF4FF\"><circle cx=\"24\" cy=\"23\" r=\"2\"/><circle cx=\"88\" cy=\"91\" r=\"1.3\"/><circle cx=\"177\" cy=\"22\" r=\"1.6\"/><circle cx=\"312\" cy=\"31\" r=\"1.4\"/><circle cx=\"409\" cy=\"80\" r=\"2\"/><circle cx=\"335\" cy=\"186\" r=\"1.5\"/></g><path d=\"M0 182L67 159L110 180L164 150L222 174L286 145L348 174L399 151L440 175V210H0Z\" fill=\"#887D75\"/><path d=\"M0 191L71 178L117 192L168 171L223 188L291 167L350 189L403 176L440 190\" stroke=\"#B2A18C\" stroke-width=\"3\" fill=\"none\"/><g><use href=\"#nearCraft\" x=\"159\" y=\"11\" width=\"115\" height=\"89.44444444444444\"/></g></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[{"k":"up","q":"The Mathilde flyby","t":"FLYBY EXPLORER","c1":"#FF9A5B","c2":"#FF4D8D","st":[["Curiosity",99],["Care",97],["Discovery",94]],"a":"You enjoy a first glimpse of a world waiting to be explored. Your Flyby Explorer card celebrates that explorer in you."},{"k":"run","q":"Finding a new route","t":"COURSE CORRECTOR","c1":"#5EEAD4","c2":"#1FA36B","st":[["Curiosity",99],["Care",96],["Discovery",95]],"a":"You know a setback can call for a thoughtful new plan. Your Course Corrector card celebrates that explorer in you."},{"k":"water","q":"The first orbit around an asteroid","t":"ORBIT PIONEER","c1":"#8EC5FF","c2":"#7B5CFF","st":[["Curiosity",99],["Care",95],["Discovery",96]],"a":"You appreciate careful navigation and a historic first. Your Orbit Pioneer card celebrates that explorer in you."},{"k":"star","q":"Mapping Eros with science tools","t":"ASTEROID DETECTIVE","c1":"#FFE27A","c2":"#FF9A3D","st":[["Curiosity",99],["Care",94],["Discovery",97]],"a":"You combine different observations to understand a mystery. Your Asteroid Detective card celebrates that explorer in you."},{"k":"gear","q":"The unexpected touchdown","t":"TOUCHDOWN TRAILBLAZER","c1":"#D2B8FF","c2":"#8B5CF6","st":[["Curiosity",99],["Care",93],["Discovery",98]],"a":"You admire a bold final chapter supported by careful engineering. Your Touchdown Trailblazer card celebrates that explorer in you."}];
ICON.up='<path d="M50 8V62m-22-20 22 22 22-22M15 78h70" stroke="#FFF6E5" stroke-width="8" fill="none" stroke-linecap="round"/>';
ICON.run='<rect x="10" y="25" width="80" height="58" rx="10" fill="#FFF6E5"/><path d="M30 25l8-13h25l8 13" fill="#FFF6E5"/><circle cx="50" cy="54" r="20" fill="#315B64"/>';
ICON.water='<path d="M35 12h30M40 12v30L20 78q-5 10 8 10h44q13 0 8-10L60 42V12M32 63h36" stroke="#FFF6E5" stroke-width="7" fill="none"/>';
ICON.star='<path d="M16 30h48q24 0 18-15M10 50h75M20 70h43q24 0 18 15" stroke="#FFF6E5" stroke-width="7" fill="none" stroke-linecap="round"/>';
ICON.gear='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><ellipse cx="50" cy="50" rx="17" ry="36" fill="none" stroke="#FFF6E5" stroke-width="5"/><path d="M14 50h72M23 30h54M23 70h54" stroke="#FFF6E5" stroke-width="5"/>';
ICON.up="<path d=\"M60 15v70H32V15ZM25 30L5 50l20 20M70 30l25 20-25 20\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"6\"/>";
ICON.run="<path d=\"M20 15L65 9L89 36L81 76L39 91L10 63Z\" fill=\"#FFF6E5\"/><circle cx=\"42\" cy=\"35\" r=\"11\" fill=\"#71847E\"/><ellipse cx=\"49\" cy=\"67\" rx=\"21\" ry=\"12\" fill=\"#71847E\"/>";
ICON.water="<circle cx=\"40\" cy=\"40\" r=\"27\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><path d=\"M60 60l28 28M28 43l7-16 17 9-4 18Z\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"#FFF6E5\"/>";
ICON.star="<circle cx=\"50\" cy=\"50\" r=\"36\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><path d=\"M43 44l14-6 13 12-11 13-16-5Z\" fill=\"#FFF6E5\"/>";
ICON.gear="<circle cx=\"25\" cy=\"65\" r=\"14\" fill=\"#FFF6E5\"/><circle cx=\"78\" cy=\"27\" r=\"17\" fill=\"#FFF6E5\"/><path d=\"M15 31Q47-7 78 70\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"5\" stroke-dasharray=\"5 5\"/>";
ICON.up="<path d=\"M10 80Q48 11 90 43m-16-17 16 17-19 7\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/><circle cx=\"50\" cy=\"68\" r=\"14\" fill=\"#FFF6E5\"/>";
ICON.run="<path d=\"M15 85V60Q15 20 50 20T85 60m-17-9 17 12 11-18\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/>";
ICON.water="<ellipse cx=\"50\" cy=\"50\" rx=\"42\" ry=\"20\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"6\" transform=\"rotate(-30 50 50)\"/><circle cx=\"50\" cy=\"50\" r=\"12\" fill=\"#FFF6E5\"/>";
ICON.star="<circle cx=\"39\" cy=\"39\" r=\"25\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/><path d=\"M59 59l29 29M25 43l13-19 16 14-9 16Z\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"#FFF6E5\"/>";
ICON.gear="<path d=\"M50 8v57M28 43l22 22 22-22M12 85h76\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\" stroke-linecap=\"round\"/>";
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">NEAR EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA NEAR Shoemaker · 1996–2001</text>'
  +sp(14,14,1,0)+sp(286,236,1.2,.6)+sp(18,250,.9,1.1)+sp(280,100,1,.3)+'</svg>'}
var cur=null;
BADGES.forEach(function(b){var o=document.createElement('button');o.className='tile';
  o.innerHTML='<div class="art"><svg viewBox="0 0 200 110" role="img" aria-label="Picture: '+b.q+'">'+SCENE[b.k]+'</svg></div><span>'+b.q+'</span>';
  o.onclick=function(){cur=b;prepCard(b);go('badge')};$('picks').appendChild(o)});
function prepCard(b){
  $('bhead').textContent='Something is waiting for you...';$('bhead').classList.remove('hide');
  $('seal').classList.remove('hide','shake');$('cardBox').classList.add('hide');$('bq').classList.add('hide');$('ba').classList.add('hide');$('bbtns').classList.add('hide');$('shareMsg').textContent='';
  $('cardArt').innerHTML=csvg(b,true);$('tilt').style.setProperty('--glow',b.c1);
  $('bq').textContent='You love: '+b.q;$('ba').textContent=b.a}
$('seal').onclick=function(){
  var s=this;s.classList.add('shake');
  setTimeout(function(){
    $('flash').classList.remove('go');void $('flash').offsetWidth;$('flash').classList.add('go');
    s.classList.add('hide');$('bhead').textContent='You unlocked a '+cur.t+' card!';
    $('cardBox').classList.remove('hide');$('bq').classList.remove('hide');$('ba').classList.remove('hide');$('bbtns').classList.remove('hide');
    var cols=[cur.c1,cur.c2,'#FFF6C8','#FFC857'],w=innerWidth,h=innerHeight;
    burst(w/2,h*.4,cols,['star','spark','heart','dot'],90);
    [350,700,1050].forEach(function(t,i){setTimeout(function(){burst(w*(.2+Math.random()*.6),h*(.2+Math.random()*.3),cols,['spark','star'],40)},t)});
  },900)};
var tl=$('tilt');
tl.addEventListener('pointermove',function(e){var r=tl.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  tl.classList.add('moving');tl.style.transform='rotateY('+((x-.5)*26)+'deg) rotateX('+((.5-y)*22)+'deg)';tl.style.setProperty('--hx',(x*100)+'%');tl.style.setProperty('--hy',(y*100)+'%')});
tl.addEventListener('pointerleave',function(){tl.classList.remove('moving');tl.style.transform=''});


/* Share: turn the card into a picture */
$('share').onclick=function(){
  if(!cur)return;var msg=$('shareMsg');
  var img=new Image();img.onload=function(){
    var cv=document.createElement('canvas');cv.width=1080;cv.height=1500;var x=cv.getContext('2d');
    var g=x.createLinearGradient(0,0,0,1500);g.addColorStop(0,'#0B1026');g.addColorStop(.65,'#2A1450');g.addColorStop(1,'#B83A1A');x.fillStyle=g;x.fillRect(0,0,1080,1500);
    var rg=x.createRadialGradient(540,720,50,540,720,620);rg.addColorStop(0,cur.c1+'AA');rg.addColorStop(1,'transparent');x.fillStyle=rg;x.fillRect(0,0,1080,1500);
    x.fillStyle='#fff';for(var i=0;i<90;i++){x.globalAlpha=Math.random();x.fillRect(Math.random()*1080,Math.random()*1000,3,3)}x.globalAlpha=1;
    x.shadowColor='rgba(0,0,0,.55)';x.shadowBlur=60;x.shadowOffsetY=24;x.drawImage(img,150,250,780,1092);x.shadowColor='transparent';
    x.textAlign='center';x.fillStyle='#FFC857';x.font='700 56px Fredoka, Trebuchet MS, sans-serif';x.fillText('I unlocked a rare card!',540,150);
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('NEAR Shoemaker: An Unexpected Landing',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'near-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My NEAR explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='near-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};



/* The flyby, revised route, orbit, and descent are schematic illustrations. */
var flewPast=false,revised=false,orbiting=false,landingStep=0;
$('flyby').onclick=function(){flewPast=!flewPast;$('flybyCraft').closest('svg').classList.toggle('flyby-complete',flewPast);this.textContent=flewPast?'Replay the flyby':'Follow the flyby';$('flybyInfo').textContent=flewPast?'Mathilde passed! Images reveal a heavily cratered world.':'A flyby gives a brief view as a spacecraft passes a world.'};
$('showReturn').onclick=function(){revised=!revised;$('returnPath').closest('svg').classList.toggle('route-revised',revised);this.textContent=revised?'Hide the revised route':'Reveal the revised route';$('setbackInfo').textContent=revised?'A revised trajectory brought NEAR back to Eros for another attempt.':'The first approach did not lead to the planned orbit.'};
$('startOrbit').onclick=function(){orbiting=!orbiting;$('orbitCraft').closest('svg').classList.toggle('orbit-active',orbiting);this.textContent=orbiting?'Pause the illustration':'Follow an orbit';$('orbitInfo').textContent=orbiting?'In orbit, NEAR could observe Eros repeatedly and build detailed maps.':'A careful approach allowed repeated observations of the same world.'};
var mappingMessages=['Camera: images reveal craters, ridges, and surface details.','Laser rangefinder: distance measurements help reveal the asteroid’s shape.','Spectrometers: measurements provide evidence about minerals and elements.'];
document.querySelectorAll('[data-instrument]').forEach(function(b){b.onclick=function(){var n=Number(b.dataset.instrument);document.querySelectorAll('[data-instrument]').forEach(function(x){var active=x===b;x.classList.toggle('on',active);x.setAttribute('aria-pressed',String(active))});var scene=$('mappingBeam').closest('svg');scene.classList.remove('mapping-1','mapping-2');if(n)scene.classList.add('mapping-'+n);$('mappingInfo').textContent=mappingMessages[n]}});
function updateLanding(){
 var scene=$('descendingCraft').closest('svg');scene.classList.remove('descent-1','descent-2','descent-3');if(landingStep)scene.classList.add('descent-'+landingStep);
 $('landingInfo').textContent=['A final approach to the surface, with no landing legs.','Engine maneuvers begin the careful descent.','Closer views reveal a landscape of rocks and loose material.','Touchdown on February 12, 2001. NEAR survived the landing!'][landingStep];
 $('landingNext').textContent=['Begin the descent','Move closer','Touch down','Replay the landing'][landingStep];
}
$('landingNext').onclick=function(){landingStep=(landingStep+1)%4;updateLanding()};
function resetActivities(){
 flewPast=false;revised=false;orbiting=false;landingStep=0;updateLanding();
 $('flybyCraft').closest('svg').classList.remove('flyby-complete');$('flyby').textContent='Follow the flyby';$('flybyInfo').textContent='A flyby gives a brief view as a spacecraft passes a world.';
 $('returnPath').closest('svg').classList.remove('route-revised');$('showReturn').textContent='Reveal the revised route';$('setbackInfo').textContent='The first approach did not lead to the planned orbit.';
 $('orbitCraft').closest('svg').classList.remove('orbit-active');$('startOrbit').textContent='Follow an orbit';$('orbitInfo').textContent='A careful approach allowed repeated observations of the same world.';
 document.querySelectorAll('[data-instrument]').forEach(function(b){var active=b.dataset.instrument==='0';b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});$('mappingBeam').closest('svg').classList.remove('mapping-1','mapping-2');$('mappingInfo').textContent=mappingMessages[0];
 P3.sel=null;document.querySelectorAll('#pb .pbtn').forEach(function(b){b.classList.remove('on')});$('pinfo').textContent='Tap a name to explore the spacecraft.';
 if(P3.ready)Object.keys(P3.parts).forEach(function(k){P3.parts[k].traverse(function(m){if(m.isMesh){m.material.emissive.setHex(0);m.material.opacity=1;m.material.needsUpdate=true}})});
}

/* Automatically maximize the second-page artwork within the available window. */
(function fitSecondPage(){
  var page=document.querySelectorAll('main > .screen')[1];
  if(!page||page.id==='l1')return;
  var scene=page.querySelector('.scene'),main=page.closest('main');
  if(!scene||!main)return;
  var ground=document.getElementById('ground'),buttonRow=page.querySelector(':scope > .row:last-child');
  var style=document.createElement('style');
  style.textContent='.fit-second-page.on{display:flex!important;flex-direction:column;gap:12px}.fit-second-page.on>h2,.fit-second-page.on>p,.fit-second-page.on>.row,.fit-second-page.on>.card{margin-top:0!important;margin-bottom:0!important}.fit-second-page.on>.scene{max-width:none!important;min-width:0!important;flex:none;margin:0 auto!important}.fit-second-page.on>.scene>svg{width:100%;height:auto;display:block}';
  document.head.appendChild(style);page.classList.add('fit-second-page');
  if(ground&&buttonRow){
    page.classList.add('horizon-second-page');
    style.textContent+='.horizon-second-page.fit-second-page.on>.row:last-child{position:fixed!important;left:0;right:0;width:100%;margin:0!important;padding:0;z-index:4;animation:none!important}';
  }
  function horizonY(){
    var rect=ground.getBoundingClientRect(),clip=window.getComputedStyle(ground).clipPath;
    if(clip&&clip.indexOf('polygon(')===0){
      var points=clip.slice(8,-1).split(',').map(function(pair){return pair.trim().split(/\s+/).map(parseFloat)}),ys=[];
      points.forEach(function(a,i){var b=points[(i+1)%points.length];if(a[0]===b[0])return;if(Math.min(a[0],b[0])<=50&&Math.max(a[0],b[0])>=50)ys.push(a[1]+(50-a[0])/(b[0]-a[0])*(b[1]-a[1]));});
      if(ys.length)return rect.top+rect.height*Math.min.apply(Math,ys)/100;
    }
    return rect.top;
  }
  var queued=false;
  function fit(){
    queued=false;if(!page.classList.contains('on'))return;
    scene.style.width='100%';
    var width=scene.offsetWidth,height=scene.offsetHeight;
    if(!width||!height)return;
    var viewHeight=window.visualViewport?Math.min(window.innerHeight,window.visualViewport.height):window.innerHeight;
    var contentLimit=viewHeight-8;
    if(ground&&buttonRow){
      var top=Math.min(horizonY()-buttonRow.offsetHeight/2,viewHeight-buttonRow.offsetHeight-8);
      buttonRow.style.top=top+'px';
      contentLimit=top-8;
    }
    var bottom=main.getBoundingClientRect().bottom+window.scrollY;
    var overflow=Math.max(0,bottom-contentLimit);
    if(overflow>0){var available=Math.max(0,height-overflow);scene.style.width=Math.max(0,Math.floor(width*available/height))+'px';}
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(fit)}}
  new MutationObserver(schedule).observe(page,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});
  window.addEventListener('resize',schedule);
  if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule);
  page.addEventListener('load',schedule,true);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
  schedule();
})();




