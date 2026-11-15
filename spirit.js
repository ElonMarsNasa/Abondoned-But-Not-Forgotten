var $=function(i){return document.getElementById(i)};
var order=['start','l1','parts','l2','water','l3','done','quiz','pick','badge'];
var hist=[],curS='start';
function go(id,isBack){
  if(!isBack&&curS!==id)hist.push(curS);
  curS=id;
  document.querySelectorAll('.screen').forEach(function(s){s.classList.toggle('on',s.id===id)});
  document.body.classList.toggle('winter',id==='l3');
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
document.querySelectorAll('.clue img').forEach(function(im){im.addEventListener('error',function(){
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

/* 3D rover (built from simple shapes) */
var PD={pancam:['Panoramic camera','My eyes! Two cameras on a mast about 1.5 m high take color 3D photos, so scientists can choose where I drive.'],
 hazcam:['Hazard cameras','Cameras low on my front and back look for rocks and holes right in front of my wheels, so I do not get stuck.'],
 antenna:['Antenna','This dish talks straight to Earth. My radio messages take several minutes to cross space.'],
 panels:['Solar panels','They turn sunlight into electricity to charge my batteries. Dust on them means less power!'],
 arm:['Robotic arm','My arm ends in a turret with four tools: a close-up camera, two instruments that identify minerals and elements, and a grinder that scrapes rocks to see inside.'],
 wheels:['Six wheels','Each wheel has cleats like a tire tread, and a flexible suspension lets me climb over rocks without tipping over. I have three wheels on each side!'],
 body:['Warm electronics box','This warm box protects my computer and batteries from freezing on cold Mars nights.']};
function buildRover(T){
  var root=new T.Group(),parts={};
  ['wheels','body','panels','antenna','pancam','arm','hazcam'].forEach(function(n){parts[n]=new T.Group();root.add(parts[n])});
  function mk(g,c,n,x,y,z,rx,ry,rz){var m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.5,metalness:.25}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.userData.part=n;parts[n].add(m);return m}
  var B=function(w,h,d){return new T.BoxGeometry(w,h,d)},C=function(r,h,s){return new T.CylinderGeometry(r,r,h,s||20)};
  var disc=new T.Mesh(C(3.9,.1,56),new T.MeshStandardMaterial({color:0xB5532B,roughness:.95}));disc.position.y=-.05;root.add(disc);
  for(var i=0;i<14;i++){var a=i*2.4,r=2.4+(i%4)*.35,s=.1+(i%3)*.07,rk=new T.Mesh(new T.SphereGeometry(s,8,8),new T.MeshStandardMaterial({color:0x8E3A1A,roughness:1}));rk.position.set(Math.cos(a)*r,s*.4,Math.sin(a)*r);rk.scale.y=.6;root.add(rk)}
  mk(B(3.2,.9,2),0xE9C46A,'body',0,1.5,0);mk(B(3.3,.08,2.1),0xB8862F,'body',0,1.98,0);
  mk(B(4,.12,3.1),0x3F43B0,'panels',0,2.12,0);mk(B(4.1,.1,.08),0xC9CCE8,'panels',0,2.12,1.58);mk(B(4.1,.1,.08),0xC9CCE8,'panels',0,2.12,-1.58);
  for(i=-3;i<=3;i++)mk(B(.03,.02,3.0),0x1B1F4B,'panels',i*.5,2.19,0);
  for(i=-2;i<=2;i++)mk(B(3.9,.02,.03),0x1B1F4B,'panels',0,2.19,i*.6);
  [-1.5,0,1.5].forEach(function(x){[-1.35,1.35].forEach(function(z){
    mk(C(.55,.4,28),0x2B2D42,'wheels',x,.55,z,Math.PI/2);mk(C(.22,.46,16),0xC9CCE8,'wheels',x,.55,z,Math.PI/2);
    for(var k=0;k<12;k++){var an=k*Math.PI/6;mk(B(.12,.1,.42),0x555878,'wheels',x+Math.cos(an)*.58,.55+Math.sin(an)*.58,z,0,0,an)}
    mk(B(.12,.9,.12),0xC9CCE8,'wheels',x,1.05,z)})});
  [-1.35,1.35].forEach(function(z){mk(B(3.3,.1,.1),0xC9CCE8,'wheels',0,.55,z);mk(B(1.8,.1,.1),0xC9CCE8,'wheels',.75,1.15,z*.9,0,0,.5);mk(B(.12,.12,.5),0xC9CCE8,'wheels',0,1.5,z>0?1.15:-1.15)});
  mk(B(.3,.2,.3),0xC9CCE8,'pancam',1.2,2.3,.5);mk(C(.06,1.45,12),0xE7E9FF,'pancam',1.2,3.0,.5);
  mk(B(.62,.3,.36),0xE7E9FF,'pancam',1.2,3.85,.5);
  [1.0,1.4].forEach(function(x){mk(C(.09,.1,14),0x14123A,'pancam',x,3.85,.7,Math.PI/2);mk(new T.SphereGeometry(.05,8,8),0x6ECFFF,'pancam',x,3.85,.76)});
  mk(B(.2,.14,.2),0x14123A,'pancam',1.2,4.07,.5);
  mk(C(.04,.9,10),0xE7E9FF,'antenna',-1.2,2.6,-.7);mk(B(.3,.1,.3),0xC9CCE8,'antenna',-1.2,2.2,-.7);
  mk(C(.5,.06,32),0xFFC857,'antenna',-1.2,3.1,-.7,.9);mk(C(.04,.35,8),0xE7E9FF,'antenna',-1.2,3.32,-.52,.9);
  mk(C(.06,.9,8),0xE7E9FF,'antenna',-.4,2.55,.9);mk(new T.SphereGeometry(.07,8,8),0xFF7A45,'antenna',-.4,3.02,.9);
  [-.5,.5].forEach(function(z){mk(B(.16,.16,.22),0x14123A,'hazcam',1.66,1.15,z);mk(B(.16,.16,.22),0x14123A,'hazcam',-1.66,1.15,z);mk(new T.SphereGeometry(.05,8,8),0x6ECFFF,'hazcam',1.76,1.15,z)});
  mk(B(.5,.18,.2),0xE7E9FF,'arm',1.75,1.35,.35);mk(B(.9,.12,.12),0xE7E9FF,'arm',2.05,1.3,.35);mk(new T.SphereGeometry(.11,12,12),0xC9CCE8,'arm',2.5,1.3,.35);
  mk(B(.12,.75,.12),0xE7E9FF,'arm',2.5,.92,.35);mk(C(.28,.2,24),0xB8862F,'arm',2.5,.5,.35);
  [[.2,.2,0xFF7A45],[-.2,.2,0xFFC857],[.2,-.2,0xFFFFFF],[-.2,-.2,0x14123A]].forEach(function(t){mk(C(.07,.26,10),t[2],'arm',2.5+t[0],.33,.35+t[1])});
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
Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
function initParts(){
  if(P3.ready||P3.failed)return;
  try{
    var cv=$('cv3'),box=$('r3'),T=THREE;
    var rd=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});rd.setPixelRatio(Math.min(devicePixelRatio,2));
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(6.4,4,8.4);cam.lookAt(0,1.9,0);
    sc.add(new T.HemisphereLight(0xffffff,0x66402a,.95));var dl=new T.DirectionalLight(0xffffff,.9);dl.position.set(5,9,6);sc.add(dl);
    var built=buildRover(T),root=built.root;sc.add(root);root.rotation.y=.7;P3.parts=built.parts;
    function size(){var w=box.clientWidth,h=box.clientHeight;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    size();addEventListener('resize',size);
    var drag=false,lx=0,moved=0;
    cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;moved=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);root.rotation.y+=dx*.012});
    cv.addEventListener('pointerup',function(e){drag=false;cv.style.cursor='grab';
      if(moved<6){var r=cv.getBoundingClientRect(),rc=new T.Raycaster();
        rc.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);
        var h=rc.intersectObjects(root.children,true).filter(function(i){return i.object.userData.part})[0];
        if(h)selPart(h.object.userData.part)}});
    (function loop(){if($('parts').classList.contains('on')){if(!drag)root.rotation.y+=.004;rd.render(sc,cam)}requestAnimationFrame(loop)})();
    P3.ready=true;if(P3.sel)selPart(P3.sel);
  }catch(e){P3.failed=true;$('r3').innerHTML='<p style="padding:30px;text-align:center">The 3D view needs a browser with WebGL. You can still tap the names below to learn about each part!</p>'}
}

/* Level 2 stops */
var opened=0;
document.querySelectorAll('.sh').forEach(function(h){h.onclick=function(){var s=h.parentNode;
  if(!s.classList.contains('open')){opened++;s.classList.add('open');h.setAttribute('aria-expanded','true');
    $('l2hint').textContent=opened===3?'You got through every hard time. Keep going!':'Open all 3 stops to unlock the next page ('+opened+'/3)';
    if(opened===3)$('l2next').disabled=false}}});
$('legacyBtn').onclick=function(){$('legacy').classList.remove('hide');this.classList.add('hide');burst(innerWidth/2,innerHeight*.5,['#FFC857','#FF8FB8','#8B7BFF'],['spark','star'],34)};

/* Water time machine */
function setWater(a){$('wsc').classList.toggle('ago',a);$('tago').classList.toggle('sel',a);$('tdry').classList.toggle('sel',!a);
  $('wcap').textContent=a?'Long ago: silica-rich soil suggests hot springs or steam vents near Home Plate. This is one possible scene.':'Mars today: cold, dry and dusty.';
  if(a)burst(innerWidth/2,innerHeight*.4,['#8EC5FF','#fff','#7B5CFF'],['dot','spark'],26)}
$('tdry').onclick=function(){setWater(false)};$('tago').onclick=function(){setWater(true)};

/* Custom reaction icons (same style as the cards) */
var RI={
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'Thank you! Spirit would be so proud of you.',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'Her story touches many hearts, even yours.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'She proved that hard roads can be crossed.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[
 {q:'Where did Spirit land?',o:['Eagle Crater','Gusev Crater','The Moon'],a:1,e:'Spirit landed in Gusev Crater in January 2004. Her twin explored a different landing site.'},
 {q:'How did Spirit continue after a wheel failed?',o:['She flew over the rocks','She grew a new wheel','Her team drove her backward'],a:2,e:'Five wheels still worked. Driving backward let Spirit keep exploring while dragging the failed wheel.'},
 {q:'What did silica-rich soil suggest?',o:['Ancient hot springs or steam vents','A hidden candy factory','That Mars has no water history'],a:0,e:'On Earth, hot water or steam can concentrate silica. The soil was a clue to a warmer, wetter past.'}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('rover').outerHTML;
function RU(x,y,w){return '<use href="#rover" xlink:href="#rover" x="'+x+'" y="'+y+'" width="'+w+'" height="'+(w*.625)+'"/>'}
var SCENE={
 up:'<defs><linearGradient id="su" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2A8F"/><stop offset="1" stop-color="#FF9A5B"/></linearGradient></defs><rect width="200" height="110" fill="url(#su)"/><circle cx="165" cy="26" r="10" fill="#FFE7A8"/><path d="M0 110V88L50 68L100 48L140 30L200 60V110Z" fill="#8E3A1A"/><path d="M140 30L200 60V110H150Z" fill="#6E2C14"/><g transform="rotate(-20 82 54)">'+RU(46,28,72)+'</g><path d="M140 30V8" stroke="#fff" stroke-width="2"/><path d="M140 8L160 14L140 20Z" fill="#FFC857"/>',
 run:'<defs><linearGradient id="sr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B1245"/><stop offset="1" stop-color="#FF8A5C"/></linearGradient></defs><rect width="200" height="110" fill="url(#sr)"/><circle cx="100" cy="64" r="15" fill="#FFE7A8"/><path d="M0 74L40 56L80 70L130 52L200 72V110H0Z" fill="#7A2B4F"/><path d="M0 110H200V80Q100 70 0 86Z" fill="#C1440E"/><path d="M-10 108C50 88 60 100 100 84S160 80 112 72" stroke="#FFF6E5" stroke-width="2.5" stroke-dasharray="1 6" stroke-linecap="round" fill="none"/>'+RU(20,62,58),
 water:'<defs><linearGradient id="sw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C77A55"/><stop offset="1" stop-color="#F3C08C"/></linearGradient></defs><rect width="200" height="110" fill="url(#sw)"/><rect y="78" width="200" height="32" fill="#B65A32"/><path d="M60 102Q50 62 90 54Q140 46 150 92Q150 106 120 106Z" fill="#8C5A3C"/><g fill="#6B7A99" stroke="#FFF1DC" stroke-width="1.2"><circle cx="80" cy="76" r="5"/><circle cx="100" cy="66" r="4.5"/><circle cx="122" cy="80" r="5"/><circle cx="94" cy="90" r="4.5"/><circle cx="132" cy="64" r="4"/></g><path d="M165 12C155 28 150 36 150 44a15 15 0 0 0 30 0C180 36 175 28 165 12Z" fill="#6EC8F5" stroke="#fff" stroke-width="2"/><path d="M158 42a8 8 0 0 0 5 8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>'+RU(2,66,48),
 star:'<defs><linearGradient id="ss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0A0830"/><stop offset="1" stop-color="#4B2A86"/></linearGradient></defs><rect width="200" height="110" fill="url(#ss)"/><g fill="#fff"><circle cx="20" cy="16" r="1.4"/><circle cx="60" cy="30" r="1.1"/><circle cx="100" cy="12" r="1.6"/><circle cx="40" cy="60" r="1.2"/><circle cx="180" cy="20" r="1.4"/><circle cx="110" cy="70" r="1.1"/></g><circle cx="140" cy="46" r="38" fill="#FF7A45" opacity=".22"/><circle cx="140" cy="46" r="26" fill="#D9573A"/><circle cx="132" cy="40" r="4" fill="#B8432A"/><circle cx="148" cy="54" r="5" fill="#B8432A"/><path d="M60 8L98 30" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M0 110V90Q50 80 100 94T200 100V110Z" fill="#0B0A20"/><circle cx="34" cy="76" r="6" fill="#F5C9A0"/><path d="M28 75q6-12 12 0q-3-4-6-4q-3 0-6 4z" fill="#2B1810"/><path d="M28 82q6-3 12 0l3 16H25z" fill="#FF8FB8"/><path d="M40 84L66 62" stroke="#F5C9A0" stroke-width="4" stroke-linecap="round"/>',
 gear:'<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1F6B"/><stop offset="1" stop-color="#7B4A9A"/></linearGradient></defs><rect width="200" height="110" fill="url(#sg)"/><path d="M0 96Q100 84 200 94V110H0Z" fill="#C1440E"/>'+RU(30,20,140)+'<g fill="none" stroke="#FFC857" stroke-width="2" stroke-dasharray="3 3"><circle cx="130" cy="29" r="9"/><circle cx="67" cy="32" r="9"/><circle cx="164" cy="85" r="9"/><circle cx="100" cy="94" r="9"/></g>'};
SCENE.up="<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 170\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"170\" fill=\"#28205B\"/><circle cx=\"365\" cy=\"37\" r=\"17\" fill=\"#FFE6A7\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"25\" r=\"2\"/><circle cx=\"155\" cy=\"40\" r=\"1.5\"/><circle cx=\"270\" cy=\"17\" r=\"2\"/></g><path d=\"M0 160L90 110L245 48L440 148V170H0Z\" fill=\"#9D4428\"/><path d=\"M245 48L440 148V170H300Z\" fill=\"#70304B\"/><path d=\"M245 48V16m0 0 30 9-30 9\" stroke=\"#FFD66B\" stroke-width=\"3\" fill=\"#FFD66B\"/><g transform=\"rotate(-20 190 83)\"><use href=\"#rover\" x=\"140\" y=\"54\" width=\"100\" height=\"63\"/></g></svg>";
SCENE.run="<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 170\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"170\" fill=\"#28205B\"/><circle cx=\"365\" cy=\"37\" r=\"17\" fill=\"#FFE6A7\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"25\" r=\"2\"/><circle cx=\"155\" cy=\"40\" r=\"1.5\"/><circle cx=\"270\" cy=\"17\" r=\"2\"/></g><path d=\"M0 140Q100 120 220 136T440 128V170H0Z\" fill=\"#B8512B\"/><path d=\"M25 147Q120 123 210 140\" stroke=\"#FFF2C9\" stroke-width=\"13\" fill=\"none\"/><path d=\"M30 146L195 139\" stroke=\"#E5C6A9\" stroke-width=\"3\" stroke-dasharray=\"4 5\"/><use href=\"#rover\" x=\"195\" y=\"72\" width=\"140\" height=\"88\"/><circle cx=\"307\" cy=\"142\" r=\"16\" fill=\"none\" stroke=\"#FF8FB8\" stroke-width=\"3\"/><path d=\"M96 85H37m0 0 15-12M37 85l15 12\" stroke=\"#FFD66B\" stroke-width=\"4\" fill=\"none\" stroke-linecap=\"round\"/></svg>";
SCENE.water="<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 170\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"170\" fill=\"#28205B\"/><circle cx=\"365\" cy=\"37\" r=\"17\" fill=\"#FFE6A7\"/><g fill=\"#fff\"><circle cx=\"35\" cy=\"25\" r=\"2\"/><circle cx=\"155\" cy=\"40\" r=\"1.5\"/><circle cx=\"270\" cy=\"17\" r=\"2\"/></g><path d=\"M0 140Q100 120 220 136T440 128V170H0Z\" fill=\"#B8512B\"/><path d=\"M55 153L105 105L183 116L220 150Z\" fill=\"#FFF0D1\"/><path d=\"M63 149L110 125L167 135L211 149\" stroke=\"#D7BEAC\" stroke-width=\"4\" fill=\"none\"/><use href=\"#rover\" x=\"270\" y=\"75\" width=\"110\" height=\"69\"/><circle cx=\"140\" cy=\"70\" r=\"26\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"6\"/><path d=\"M157 89L186 117\" stroke=\"#8FE3F5\" stroke-width=\"9\" stroke-linecap=\"round\"/></svg>";
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[
  {
    "k": "up",
    "q": "Her hill-climbing adventure",
    "t": "HILLTOP EXPLORER",
    "c1": "#FF9A5B",
    "c2": "#FF4D8D",
    "st": [
      [
        "Courage",
        99
      ],
      [
        "Focus",
        95
      ],
      [
        "Patience",
        90
      ]
    ],
    "a": "You chose the climb! Spirit turned a distant hill into a new viewpoint. Your Hilltop Explorer card celebrates taking a big challenge one small step at a time."
  },
  {
    "k": "run",
    "q": "Her determination on five wheels",
    "t": "KEEP EXPLORING",
    "c1": "#5EEAD4",
    "c2": "#1FA36B",
    "st": [
      [
        "Grit",
        99
      ],
      [
        "Ideas",
        96
      ],
      [
        "Teamwork",
        94
      ]
    ],
    "a": "You chose determination! Spirit and her team found another way forward after a wheel failed. Your Keep Exploring card celebrates trying a new approach when a plan gets difficult."
  },
  {
    "k": "water",
    "q": "Her unexpected water clues",
    "t": "SILICA DETECTIVE",
    "c1": "#8EC5FF",
    "c2": "#7B5CFF",
    "st": [
      [
        "Curiosity",
        99
      ],
      [
        "Clue sense",
        97
      ],
      [
        "Care",
        92
      ]
    ],
    "a": "You chose the mystery under the dust! Your Silica Detective card celebrates looking closely, asking questions, and following evidence wherever it leads."
  },
  {
    "k": "star",
    "q": "A kid named her",
    "t": "BIG DREAMER",
    "c1": "#FFE27A",
    "c2": "#FF9A3D",
    "st": [
      [
        "Imagination",
        99
      ],
      [
        "Courage",
        94
      ],
      [
        "Heart",
        96
      ]
    ],
    "a": "You chose a name born from a dream! Sofi named two explorers. Your Big Dreamer card celebrates the ideas young people can share with the world."
  },
  {
    "k": "gear",
    "q": "Her cameras, arm and wheels",
    "t": "GADGET GENIUS",
    "c1": "#D2B8FF",
    "c2": "#8B5CF6",
    "st": [
      [
        "Brain",
        99
      ],
      [
        "Skill",
        95
      ],
      [
        "Teamwork",
        92
      ]
    ],
    "a": "You chose the tools of exploration! Your Gadget Genius card celebrates cameras, wheels, instruments, and the people who make them work together."
  }
];
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">SPIRIT FAN</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA Mars Exploration Rover · 2004–2010</text>'
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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('Spirit: An Unexpected Discovery',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'spirit-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My Spirit explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='spirit-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};



