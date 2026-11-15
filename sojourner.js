var $=function(i){return document.getElementById(i)};
var order=['start','arrival','parts','landing','deploy','route','analyze','water','done','quiz','pick','badge'];
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

/* Simplified six-wheel Sojourner model. The rear sensor is not a sampling arm. */
var PD={
 wheels:['Six wheels','Six wheels and a flexible suspension helped Sojourner cross uneven ground.'],
 panels:['Solar panel','A panel on top supplied solar power. Primary batteries also supported the early mission.'],
 cameras:['Cameras and lasers','Two front cameras worked with laser-stripe projectors to detect hazards. A rear camera viewed the science workspace.'],
 antenna:['Radio antenna','Sojourner exchanged data with the Pathfinder lander, which communicated with Earth.'],
 apxs:['Rock-analysis sensor','The rear Alpha Proton X-ray Spectrometer investigated the elements in Martian rocks and soil.'],
 body:['Electronics box','The body held the rover’s computer, electronics, and batteries. Sojourner was only about 30 centimeters tall.']
};
function renderParts(){
 $('pb').innerHTML='';Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
}
function buildCraft(T){
 var root=new T.Group(),parts={};Object.keys(PD).forEach(function(k){parts[k]=new T.Group();root.add(parts[k])});
 var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||24)};
 function mk(k,g,c,x,y,z,rx,ry,rz){var m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.65,metalness:.25}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.userData.part=k;parts[k].add(m);return m}
 mk('body',B(2.65,.65,1.6),0xCFAC68,0,1.2,0);mk('body',B(2.7,.08,1.65),0xE5D4A0,0,1.57,0);
 mk('panels',B(3.05,.07,1.95),0x414B99,0,1.67,0);
 for(var i=-4;i<=4;i++)mk('panels',B(.018,.012,1.9),0xA3B5D6,i*.32,1.715,0);[-.6,0,.6].forEach(function(z){mk('panels',B(3,.012,.018),0xA3B5D6,0,1.715,z)});
 [-1.25,0,1.25].forEach(function(x){[-1.03,1.03].forEach(function(z){mk('wheels',C(.43,.3,24),0x262C42,x,.48,z,Math.PI/2);mk('wheels',C(.16,.34,16),0xBBC7D7,x,.48,z,Math.PI/2);for(var j=0;j<12;j++){var a=j*Math.PI/6;mk('wheels',B(.08,.06,.34),0x6F788C,x+Math.cos(a)*.43,.48+Math.sin(a)*.43,z,0,0,a)}mk('wheels',B(.07,.6,.07),0xBBC7D7,x,.85,z)})});
 [-1.03,1.03].forEach(function(z){mk('wheels',B(2.6,.08,.08),0xBBC7D7,0,.72,z);mk('wheels',B(1.4,.08,.08),0xBBC7D7,.5,1.03,z,0,0,.33)});
 [-.42,.42].forEach(function(z){mk('cameras',B(.18,.22,.28),0xE2E4EA,1.4,1.12,z);mk('cameras',C(.07,.1,16),0x17233D,1.53,1.12,z,0,0,Math.PI/2)});
 mk('cameras',B(.12,.15,.23),0x596775,-1.4,1.15,.5);
 mk('antenna',C(.028,1.1,12),0xDDE1E7,-.4,2.27,.5);mk('antenna',B(.2,.04,.04),0xDDE1E7,-.32,2.81,.5);
 mk('apxs',B(.28,.1,.13),0xBFC7D3,-1.46,.95,0);mk('apxs',B(.08,.45,.08),0xBFC7D3,-1.58,.73,0);mk('apxs',C(.2,.18),0xD9C9A3,-1.72,.58,0,0,0,Math.PI/2);
 root.scale.setScalar(1.15);return {root:root,parts:parts};
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
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(5.2,3.6,6.8);cam.lookAt(0,1.25,0);
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
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'Small wheels made a big beginning!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'A little rover and a dedicated team shared an adventure.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big questions take patience and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[{"q":"What cushioned Pathfinder’s landing?","o":["Inflated airbags","A giant swimming pool","Rover wheels"],"a":0,"e":"Airbags cushioned the lander as it bounced on the surface."},{"q":"How many wheels did Sojourner have?","o":["Two","Six","Ten"],"a":1,"e":"Six wheels and a flexible suspension helped Sojourner move over uneven ground."},{"q":"What did Sojourner’s spectrometer investigate?","o":["The sound of wind","The age of stars","The elements in rocks and soil"],"a":2,"e":"The Alpha Proton X-ray Spectrometer investigated elemental composition."}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('sojourner').outerHTML+$('pathfinder').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"37\" r=\"18\" fill=\"#FFE8B4\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"24\" r=\"2\"/><circle cx=\"170\" cy=\"19\" r=\"1.5\"/><circle cx=\"405\" cy=\"86\" r=\"2\"/></g><path d=\"M0 148L65 119L135 148L209 119L301 151L380 123L440 147V210H0Z\" fill=\"#753A5A\"/><path d=\"M0 175Q110 154 220 176T440 173V210H0Z\" fill=\"#B9522E\"/><g><g><path d=\"M148 36Q220-22 292 36Z\" fill=\"#EEE2C8\" stroke=\"#B7BED4\" stroke-width=\"2\"/><path d=\"M148 36L220 102L292 36m-99-45 27 111 27-111\" fill=\"none\" stroke=\"#D4D5DB\" stroke-width=\"2\"/></g><g fill=\"#E0CFAE\" stroke=\"#A68E76\" stroke-width=\"2\"><circle cx=\"194\" cy=\"116\" r=\"24\"/><circle cx=\"242\" cy=\"116\" r=\"24\"/><circle cx=\"218\" cy=\"100\" r=\"24\"/><circle cx=\"218\" cy=\"139\" r=\"24\"/></g><path d=\"M207 109H229V130H207Z\" fill=\"#B59659\"/></g></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"37\" r=\"18\" fill=\"#FFE8B4\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"24\" r=\"2\"/><circle cx=\"170\" cy=\"19\" r=\"1.5\"/><circle cx=\"405\" cy=\"86\" r=\"2\"/></g><path d=\"M0 148L65 119L135 148L209 119L301 151L380 123L440 147V210H0Z\" fill=\"#753A5A\"/><path d=\"M0 175Q110 154 220 176T440 173V210H0Z\" fill=\"#B9522E\"/><use href=\"#pathfinder\" x=\"43\" y=\"54\" width=\"200\" height=\"133.33333333333334\"/><path d=\"M166 159L236 183L254 176L191 148Z\" fill=\"#BBC5D8\"/><g><use href=\"#sojourner\" x=\"118\" y=\"75\" width=\"95\" height=\"63.333333333333336\"/></g></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"37\" r=\"18\" fill=\"#FFE8B4\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"24\" r=\"2\"/><circle cx=\"170\" cy=\"19\" r=\"1.5\"/><circle cx=\"405\" cy=\"86\" r=\"2\"/></g><path d=\"M0 148L65 119L135 148L209 119L301 151L380 123L440 147V210H0Z\" fill=\"#753A5A\"/><path d=\"M0 175Q110 154 220 176T440 173V210H0Z\" fill=\"#B9522E\"/><use href=\"#sojourner\" x=\"30\" y=\"91\" width=\"110\" height=\"73.33333333333333\"/><path d=\"M131 157Q207 104 307 165\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\" stroke-dasharray=\"5 6\"/><path d=\"M132 157H329\" fill=\"none\" stroke=\"#FF8FB8\" stroke-width=\"3\" stroke-dasharray=\"5 6\"/><path d=\"M210 173L223 123L266 130L280 174Z\" fill=\"#745044\"/></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"37\" r=\"18\" fill=\"#FFE8B4\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"24\" r=\"2\"/><circle cx=\"170\" cy=\"19\" r=\"1.5\"/><circle cx=\"405\" cy=\"86\" r=\"2\"/></g><path d=\"M0 148L65 119L135 148L209 119L301 151L380 123L440 147V210H0Z\" fill=\"#753A5A\"/><path d=\"M0 175Q110 154 220 176T440 173V210H0Z\" fill=\"#B9522E\"/><path d=\"M29 182L49 128L99 116L121 184Z\" fill=\"#988477\"/><g><use href=\"#sojourner\" x=\"166\" y=\"72\" width=\"150\" height=\"100\"/></g><g stroke=\"#8FE3F5\" stroke-width=\"3\"><path d=\"M65 99v-15m-21 26-10-10m58 10 10-10\"/></g></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"37\" r=\"18\" fill=\"#FFE8B4\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"24\" r=\"2\"/><circle cx=\"170\" cy=\"19\" r=\"1.5\"/><circle cx=\"405\" cy=\"86\" r=\"2\"/></g><path d=\"M0 148L65 119L135 148L209 119L301 151L380 123L440 147V210H0Z\" fill=\"#753A5A\"/><path d=\"M0 175Q110 154 220 176T440 173V210H0Z\" fill=\"#B9522E\"/><path d=\"M65 199L177 174m-85 30 111-29\" stroke=\"#D5AC83\" stroke-width=\"3\" stroke-dasharray=\"4 5\"/><use href=\"#sojourner\" x=\"124\" y=\"58\" width=\"190\" height=\"126.66666666666667\"/></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[{"k":"up","q":"The bouncing arrival","t":"AIRBAG ADVENTURER","c1":"#FF9A5B","c2":"#FF4D8D","st":[["Curiosity",99],["Care",97],["Discovery",94]],"a":"You admire a clever solution to a difficult landing. Your Airbag Adventurer card celebrates that explorer in you."},{"k":"run","q":"The first drive onto Mars","t":"FIRST TRACKS PIONEER","c1":"#5EEAD4","c2":"#1FA36B","st":[["Curiosity",99],["Care",96],["Discovery",95]],"a":"You chose the first tracks! A small step can begin an adventure. Your First Tracks Pioneer card celebrates that explorer in you."},{"k":"water","q":"Finding a clear route","t":"TRAIL FINDER","c1":"#8EC5FF","c2":"#7B5CFF","st":[["Curiosity",99],["Care",95],["Discovery",96]],"a":"You look ahead, compare possibilities, and choose a careful route. Your Trail Finder card celebrates that explorer in you."},{"k":"star","q":"Investigating Martian rocks","t":"ROCK DETECTIVE","c1":"#FFE27A","c2":"#FF9A3D","st":[["Curiosity",99],["Care",94],["Discovery",97]],"a":"You ask what a rock can reveal and follow the evidence. Your Rock Detective card celebrates that explorer in you."},{"k":"gear","q":"The little rover’s big beginning","t":"LITTLE ROVER LEGEND","c1":"#D2B8FF","c2":"#8B5CF6","st":[["Curiosity",99],["Care",93],["Discovery",98]],"a":"You know a small explorer can make a lasting contribution. Your Little Rover Legend card celebrates that explorer in you."}];
ICON.up='<path d="M50 8V62m-22-20 22 22 22-22M15 78h70" stroke="#FFF6E5" stroke-width="8" fill="none" stroke-linecap="round"/>';
ICON.run='<rect x="10" y="25" width="80" height="58" rx="10" fill="#FFF6E5"/><path d="M30 25l8-13h25l8 13" fill="#FFF6E5"/><circle cx="50" cy="54" r="20" fill="#315B64"/>';
ICON.water='<path d="M35 12h30M40 12v30L20 78q-5 10 8 10h44q13 0 8-10L60 42V12M32 63h36" stroke="#FFF6E5" stroke-width="7" fill="none"/>';
ICON.star='<path d="M16 30h48q24 0 18-15M10 50h75M20 70h43q24 0 18 15" stroke="#FFF6E5" stroke-width="7" fill="none" stroke-linecap="round"/>';
ICON.gear='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><ellipse cx="50" cy="50" rx="17" ry="36" fill="none" stroke="#FFF6E5" stroke-width="5"/><path d="M14 50h72M23 30h54M23 70h54" stroke="#FFF6E5" stroke-width="5"/>';
ICON.up="<g fill=\"#FFF6E5\"><circle cx=\"32\" cy=\"50\" r=\"23\"/><circle cx=\"68\" cy=\"50\" r=\"23\"/><circle cx=\"50\" cy=\"30\" r=\"23\"/><circle cx=\"50\" cy=\"70\" r=\"23\"/></g>";
ICON.run="<circle cx=\"30\" cy=\"64\" r=\"17\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><circle cx=\"72\" cy=\"64\" r=\"17\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><path d=\"M20 35h60\" stroke=\"#FFF6E5\" stroke-width=\"7\"/>";
ICON.water="<path d=\"M15 88Q20 50 49 58T85 13m-23 4 23-4 2 23\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\" stroke-linecap=\"round\"/>";
ICON.star="<circle cx=\"40\" cy=\"40\" r=\"25\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/><path d=\"M60 60l27 27M24 47l12-24 18 16-8 16Z\" fill=\"#FFF6E5\" stroke=\"#FFF6E5\" stroke-width=\"7\"/>";
ICON.gear="<path d=\"M50 5L62 35L95 39L69 60L77 92L50 74L23 92L31 60L5 39L38 35Z\" fill=\"#FFF6E5\"/>";
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">SOJOURNER EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA Mars Pathfinder · 1997</text>'
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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('Sojourner: Small Wheels, A Big Beginning',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'sojourner-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My Sojourner explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='sojourner-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};


/* The interactive diagrams are educational illustrations, not mission simulations. */
var landingStep=0,deployStep=0,analysisStep=0;
function updateLanding(){
 var scene=$('airbagCraft').closest('svg');scene.classList.remove('bags-ready','bouncing','landed');if(landingStep)scene.classList.add(['','bags-ready','bouncing','landed'][landingStep]);
 $('landingInfo').textContent=['Follow the descent to the Martian ground.','Airbags inflate to cushion the landing.','Bounce! The bags absorb the landing’s impacts.','At rest on Mars. The lander can prepare to open.'][landingStep];
 $('landingNext').textContent=['Inflate the airbags','Watch the bouncing arrival','Settle on the surface','Replay the sequence'][landingStep];
}
$('landingNext').onclick=function(){landingStep=(landingStep+1)%4;updateLanding()};
function updateDeploy(){
 var scene=$('departingRover').closest('svg');scene.classList.toggle('ramp-ready',deployStep===1);scene.classList.toggle('rover-deployed',deployStep===2);
 $('deployInfo').textContent=['The little rover is still on the lander.','The ramp is ready. A path leads to the ground.','First tracks! Sojourner rolls onto the surface.'][deployStep];
 $('deployNext').textContent=['Lower the ramp','Roll onto Mars','Replay the deployment'][deployStep];
}
$('deployNext').onclick=function(){deployStep=(deployStep+1)%3;updateDeploy()};
document.querySelectorAll('[data-route]').forEach(function(b){b.onclick=function(){
 document.querySelectorAll('[data-route]').forEach(function(x){var active=x===b;x.classList.toggle('on',active);x.setAttribute('aria-pressed',String(active))});
 var safe=b.dataset.route==='clear';$('routeInfo').textContent=safe?'Good choice! Go around the large rock.':'A large rock blocks this route. Look for a clearer path.';$('routeNext').disabled=!safe;
}});
function updateAnalysis(){
 var scene=$('studyRover').closest('svg');scene.classList.remove('analysis-step-1','analysis-step-2','analysis-step-3');if(analysisStep)scene.classList.add('analysis-step-'+analysisStep);
 $('analysisInfo').textContent=['Approach a rock with the sensor facing it.','The rover moves its rear sensor toward the rock.','The instrument is positioned close to the surface for a reading.','Scientists compare readings to identify the rock’s elements.'][analysisStep];
 $('analysisNext').textContent=['Approach the rock','Position the instrument','Examine the reading','Replay the investigation'][analysisStep];
}
$('analysisNext').onclick=function(){analysisStep=(analysisStep+1)%4;updateAnalysis()};
function setWater(n){
 document.querySelectorAll('[data-water]').forEach(function(b){var active=Number(b.dataset.water)===n;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
 $('ancientWater').closest('svg').classList.toggle('wet-past',n===1);$('waterInfo').textContent=n?'Long ago: a flood could carry and reshape rocks. This is an imagined scene.':'Today: dry ground preserves clues to a different past.';
}
document.querySelectorAll('[data-water]').forEach(function(b){b.onclick=function(){setWater(Number(b.dataset.water))}});
function resetActivities(){
 landingStep=0;deployStep=0;analysisStep=0;updateLanding();updateDeploy();updateAnalysis();setWater(0);
 document.querySelectorAll('[data-route]').forEach(function(b){b.classList.remove('on');b.setAttribute('aria-pressed','false')});$('routeNext').disabled=true;$('routeInfo').textContent='Look for a clear route before moving.';
 document.querySelectorAll('details').forEach(function(d){d.open=false});P3.sel=null;document.querySelectorAll('#pb .pbtn').forEach(function(b){b.classList.remove('on')});$('pinfo').textContent='Tap a name to explore the rover.';
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




