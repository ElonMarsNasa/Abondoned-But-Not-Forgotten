var $=function(i){return document.getElementById(i)};
var order=['start','team','parts','landing','sites','lab','life','discover','done','quiz','pick','badge'];
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

/* Simplified educational Viking lander and orbiter models. */
var craftType='lander';
var PD={
 camera:['Scan cameras','Two cameras built views of the landing site by scanning the scene.','lander'],
 arm:['Sampling arm','A collector at the end of the arm delivered soil to instruments inside the lander.','lander'],
 antenna:['Radio antenna','The lander could send information directly to Earth and relay data through an orbiter.','lander'],
 power:['RTG power units','Two radioisotope thermoelectric generators turned heat from radioactive decay into electricity.','lander'],
 legs:['Landing legs','Three legs and broad footpads supported the stationary lander on the surface.','lander'],
 lab:['Science laboratory','Internal instruments investigated soil composition and possible signs of life.','lander'],
 panels:['Solar panels','The orbiter used sunlight to generate electricity. The lander used RTGs.','orbiter'],
 orbitcamera:['Imaging system','Two cameras photographed Mars from orbit and helped scientists map the planet.','orbiter'],
 orbitantenna:['Orbiter antenna','A radio link carried pictures and measurements back to Earth.','orbiter'],
 orbitbody:['Orbiter body','The central structure carried instruments, electronics, and propulsion equipment.','orbiter']
};
function renderParts(){
 $('pb').innerHTML='';
 Object.keys(PD).filter(function(k){return PD[k][2]===craftType}).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
}
function buildCraft(T){
 var root=new T.Group(),parts={},crafts={lander:new T.Group(),orbiter:new T.Group()};
 root.add(crafts.lander);root.add(crafts.orbiter);
 Object.keys(PD).forEach(function(k){parts[k]=new T.Group();crafts[PD[k][2]].add(parts[k])});
 var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||24)};
 function mk(k,g,c,x,y,z,rx,ry,rz){var mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.55,metalness:.3}));mesh.position.set(x,y,z);mesh.rotation.set(rx||0,ry||0,rz||0);mesh.userData.part=k;parts[k].add(mesh);return mesh}
 function bar(k,a,b,r,c){var start=new T.Vector3(a[0],a[1],a[2]),end=new T.Vector3(b[0],b[1],b[2]),dir=end.clone().sub(start);var m=mk(k,C(r,dir.length(),12),c,0,0,0);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m}
 mk('lab',C(1.25,.65,6),0xD8B96D,0,1.38,0);mk('lab',C(1.3,.1,6),0xF1E0AE,0,1.75,0);
 mk('lab',B(.5,.16,.6),0xB4AFBE,0,1.9,.4);
 for(var i=0;i<3;i++){var a=i*Math.PI*2/3,x=Math.cos(a),z=Math.sin(a);bar('legs',[x*.9,1.45,z*.9],[x*2.1,.22,z*2.1],.07,0xE2DCE5);bar('legs',[x*.65,1.0,z*.65],[x*2.1,.22,z*2.1],.045,0xADB0C1);mk('legs',C(.38,.1),0xC4C4D0,x*2.1,.13,z*2.1)}
 [-1,1].forEach(function(s){mk('power',C(.27,.8),0x777789,s*1.18,1.85,-.45);for(var n=0;n<6;n++)mk('power',C(.34,.04),0xA5A1AA,s*1.18,1.52+n*.13,-.45)});
 [-.5,.5].forEach(function(x){bar('camera',[x,1.7,.72],[x,2.75,.72],.06,0xE8E6EE);mk('camera',C(.16,.45),0xD8D8E3,x,2.82,.72);mk('camera',C(.09,.09),0x191B38,x,2.88,.9,Math.PI/2)});
 bar('arm',[0,1.6,1.0],[.7,1.1,1.65],.07,0xE5E1E8);bar('arm',[.7,1.1,1.65],[1.3,.5,2.1],.06,0xE5E1E8);mk('arm',B(.4,.2,.4),0xD4B55D,1.3,.4,2.1);
 bar('antenna',[.3,1.8,-.5],[.3,2.65,-.5],.05,0xE7E3E3);mk('antenna',new T.CylinderGeometry(.65,.13,.2,32),0xF0E5C5,.3,2.8,-.5,.4);bar('antenna',[.3,2.8,-.5],[.3,3.15,-.37],.025,0xAAA8B9);
 mk('orbitbody',C(.9,1.1,8),0xD6B35F,0,1.8,0);mk('orbitbody',B(1.2,.12,1.2),0xE2D6AD,0,2.4,0);
 for(i=0;i<4;i++){var angle=i*Math.PI/2,x=Math.cos(angle),z=Math.sin(angle);mk('panels',B(2.1,.06,1.1),0x384B9B,x*1.9,1.8,z*1.9,0,-angle);for(n=-3;n<=3;n++){var at=1.9+n*.25;mk('panels',B(.025,.015,1.05),0x9AAED4,x*at,1.845,z*at,0,-angle)}}
 bar('orbitantenna',[0,2.4,0],[0,3.2,0],.05,0xD9D5D8);mk('orbitantenna',new T.CylinderGeometry(.85,.12,.25,32),0xF0E5CB,0,3.3,0,.35);bar('orbitantenna',[0,3.3,0],[0,3.7,.12],.03,0xBCB7B9);
 mk('orbitcamera',B(.9,.4,.6),0xC5C8D4,0,1.1,.45);[-.22,.22].forEach(function(x){mk('orbitcamera',C(.14,.15),0x181B3E,x,1.05,.8,Math.PI/2)});
 return {root:root,parts:parts,crafts:crafts};
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
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(5.2,3.7,6.8);cam.lookAt(0,1.9,0);
    sc.add(new T.HemisphereLight(0xffffff,0x66402a,.95));var dl=new T.DirectionalLight(0xffffff,.9);dl.position.set(5,9,6);sc.add(dl);
    var built=buildCraft(T),root=built.root;sc.add(root);root.rotation.y=.7;P3.parts=built.parts;P3.crafts=built.crafts;built.crafts.orbiter.visible=craftType==='orbiter';built.crafts.lander.visible=craftType==='lander';
    function size(){var w=box.clientWidth,h=box.clientHeight;rd.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
    P3.resize=size;size();new ResizeObserver(function(){if(box.clientWidth&&box.clientHeight)size()}).observe(box);addEventListener('resize',function(){if(box.clientWidth&&box.clientHeight)size()});
    var drag=false,lx=0,moved=0;
    cv.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;moved=0;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-lx;lx=e.clientX;moved+=Math.abs(dx);root.rotation.y+=dx*.012});
    cv.addEventListener('pointerup',function(e){drag=false;cv.style.cursor='grab';
      if(moved<6){var r=cv.getBoundingClientRect(),rc=new T.Raycaster();
        rc.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),cam);
        var h=rc.intersectObjects(P3.crafts[craftType].children,true).filter(function(i){return i.object.userData.part})[0];
        if(h&&PD[h.object.userData.part][2]===craftType)selPart(h.object.userData.part)}});
    (function loop(){if($('parts').classList.contains('on')){if(!drag)root.rotation.y+=.004;rd.render(sc,cam)}requestAnimationFrame(loop)})();
    P3.ready=true;if(P3.sel)selPart(P3.sel);
  }catch(e){P3.failed=true;$('r3').innerHTML='<p style="padding:30px;text-align:center">The 3D view needs a browser with WebGL. You can still tap the names below to learn about each part!</p>'}
}

/* Custom reaction icons (same style as the cards) */
var RI={
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'Two missions, so many discoveries!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'The people behind these missions shared a remarkable adventure.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big questions take patience and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[
{q:'Which spacecraft studied Mars from above?',o:['The lander','The orbiter','A Viking rover'],a:1,e:'The orbiter studied Mars from space. The lander stayed on the ground.'},
{q:'Which pair of landing sites is correct?',o:['Viking 1: Gusev; Viking 2: Eagle','Both landed at the same place','Viking 1: Chryse; Viking 2: Utopia'],a:2,e:'Viking 1 landed at Chryse Planitia. Viking 2 landed at Utopia Planitia.'},
{q:'What did the Viking biology results establish?',o:['They did not confirm life','They proved that microbes live on Mars','They proved Mars never had life'],a:0,e:'The tests did not provide clear evidence of living microorganisms. More evidence was needed.'}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('lander').outerHTML+$('orbiter').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"26\" r=\"2\"/><circle cx=\"180\" cy=\"18\" r=\"1.5\"/><circle cx=\"404\" cy=\"40\" r=\"2\"/></g><path d=\"M0 164Q220 140 440 164V210H0Z\" fill=\"#A54F32\"/><use href=\"#lander\" x=\"115\" y=\"48\" width=\"210\" height=\"140\"/></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"26\" r=\"2\"/><circle cx=\"180\" cy=\"18\" r=\"1.5\"/><circle cx=\"404\" cy=\"40\" r=\"2\"/></g><path d=\"M0 164Q220 140 440 164V210H0Z\" fill=\"#A54F32\"/><use href=\"#lander\" x=\"30\" y=\"68\" width=\"150\" height=\"100\"/><rect x=\"235\" y=\"57\" width=\"140\" height=\"99\" rx=\"16\" fill=\"#E8DBEC\"/><path d=\"M257 57l15-19h48l14 19\" fill=\"#E8DBEC\"/><circle cx=\"306\" cy=\"105\" r=\"35\" fill=\"#30265E\" stroke=\"#8FE3F5\" stroke-width=\"7\"/><circle cx=\"306\" cy=\"105\" r=\"14\" fill=\"#6DB8D2\"/></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"26\" r=\"2\"/><circle cx=\"180\" cy=\"18\" r=\"1.5\"/><circle cx=\"404\" cy=\"40\" r=\"2\"/></g><path d=\"M0 165H440V210H0Z\" fill=\"#A54F32\"/><use href=\"#lander\" x=\"28\" y=\"48\" width=\"150\" height=\"100\"/><rect x=\"230\" y=\"59\" width=\"147\" height=\"115\" rx=\"16\" fill=\"#3C3570\" stroke=\"#8FE3F5\" stroke-width=\"3\"/><path d=\"M252 83h33v53a16 16 0 0 1-33 0ZM315 83h33v53a16 16 0 0 1-33 0Z\" fill=\"#8FE3F5\" opacity=\".75\"/><circle cx=\"267\" cy=\"130\" r=\"5\" fill=\"#FFF1C9\"/><circle cx=\"330\" cy=\"121\" r=\"5\" fill=\"#FFF1C9\"/><path d=\"M167 112h45m-12-10 12 10-12 10\" stroke=\"#FFC857\" stroke-width=\"4\" fill=\"none\"/></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"26\" r=\"2\"/><circle cx=\"180\" cy=\"18\" r=\"1.5\"/><circle cx=\"404\" cy=\"40\" r=\"2\"/></g><path d=\"M0 165H440V210H0Z\" fill=\"#A54F32\"/><use href=\"#lander\" x=\"180\" y=\"60\" width=\"170\" height=\"113.33333333333333\"/><path d=\"M40 55h84q25 0 25-18t-25-18M30 85h120M45 115h70q25 0 25 18t-25 18\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"6\" stroke-linecap=\"round\"/></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"26\" r=\"2\"/><circle cx=\"180\" cy=\"18\" r=\"1.5\"/><circle cx=\"404\" cy=\"40\" r=\"2\"/></g><circle cx=\"220\" cy=\"107\" r=\"85\" fill=\"#CA6442\"/><path d=\"M144 75H296M137 111H303M153 150H287M220 22V192\" stroke=\"#F3A478\" stroke-width=\"2\" fill=\"none\"/><ellipse cx=\"220\" cy=\"107\" rx=\"44\" ry=\"85\" fill=\"none\" stroke=\"#F3A478\" stroke-width=\"2\"/><use href=\"#orbiter\" x=\"300\" y=\"3\" width=\"110\" height=\"73.33333333333333\"/></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[
  {
    "k": "up",
    "q": "The daring landings",
    "t": "LANDING PIONEER",
    "c1": "#FF9A5B",
    "c2": "#FF4D8D",
    "st": [
      [
        "Courage",
        99
      ],
      [
        "Care",
        96
      ],
      [
        "Focus",
        92
      ]
    ],
    "a": "You chose the landings! Your Landing Pioneer card celebrates planning carefully, solving problems, and taking the next step into the unknown."
  },
  {
    "k": "run",
    "q": "The first surface views",
    "t": "MARS PHOTOGRAPHER",
    "c1": "#5EEAD4",
    "c2": "#1FA36B",
    "st": [
      [
        "Observation",
        99
      ],
      [
        "Vision",
        97
      ],
      [
        "Patience",
        92
      ]
    ],
    "a": "You chose the photographs! Your Mars Photographer card celebrates noticing small details and sharing a new view with everyone."
  },
  {
    "k": "water",
    "q": "The search for signs of life",
    "t": "LIFE DETECTIVE",
    "c1": "#8EC5FF",
    "c2": "#7B5CFF",
    "st": [
      [
        "Curiosity",
        99
      ],
      [
        "Evidence",
        98
      ],
      [
        "Care",
        95
      ]
    ],
    "a": "You chose the big question! Your Life Detective card celebrates testing explanations and following evidence, even when the answer remains uncertain."
  },
  {
    "k": "star",
    "q": "The Martian weather reports",
    "t": "WEATHER WATCHER",
    "c1": "#FFE27A",
    "c2": "#FF9A3D",
    "st": [
      [
        "Observation",
        99
      ],
      [
        "Patience",
        97
      ],
      [
        "Wonder",
        94
      ]
    ],
    "a": "You chose the weather! Your Weather Watcher card celebrates returning to a question, recording changes, and spotting patterns over time."
  },
  {
    "k": "gear",
    "q": "The maps from orbit",
    "t": "PLANET MAPPER",
    "c1": "#D2B8FF",
    "c2": "#8B5CF6",
    "st": [
      [
        "Vision",
        99
      ],
      [
        "Discovery",
        97
      ],
      [
        "Focus",
        95
      ]
    ],
    "a": "You chose the view from above! Your Planet Mapper card celebrates connecting small observations to understand a much bigger world."
  }
];
ICON.up='<path d="M50 8V62m-22-20 22 22 22-22M15 78h70" stroke="#FFF6E5" stroke-width="8" fill="none" stroke-linecap="round"/>';
ICON.run='<rect x="10" y="25" width="80" height="58" rx="10" fill="#FFF6E5"/><path d="M30 25l8-13h25l8 13" fill="#FFF6E5"/><circle cx="50" cy="54" r="20" fill="#315B64"/>';
ICON.water='<path d="M35 12h30M40 12v30L20 78q-5 10 8 10h44q13 0 8-10L60 42V12M32 63h36" stroke="#FFF6E5" stroke-width="7" fill="none"/>';
ICON.star='<path d="M16 30h48q24 0 18-15M10 50h75M20 70h43q24 0 18 15" stroke="#FFF6E5" stroke-width="7" fill="none" stroke-linecap="round"/>';
ICON.gear='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><ellipse cx="50" cy="50" rx="17" ry="36" fill="none" stroke="#FFF6E5" stroke-width="5"/><path d="M14 50h72M23 30h54M23 70h54" stroke="#FFF6E5" stroke-width="5"/>';
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">VIKING EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA Viking Missions · Launched 1975</text>'
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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('Viking 1 & 2: The Search Begins',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'viking-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My Viking explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='viking-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};

/* Story activities; only the spacecraft separation is animated. */
document.querySelectorAll('[data-craft]').forEach(function(b){b.onclick=function(){
 craftType=b.dataset.craft;
 document.querySelectorAll('[data-craft]').forEach(function(x){var active=x===b;x.classList.toggle('on',active);x.setAttribute('aria-pressed',String(active))});
 if(P3.ready){P3.crafts.lander.visible=craftType==='lander';P3.crafts.orbiter.visible=craftType==='orbiter'}
 renderParts();selPart(craftType==='lander'?'camera':'orbitcamera');
}});
$('separate').onclick=function(){
 var separated=$('separation').classList.toggle('separated');
 this.textContent=separated?'Bring them together':'Separate the spacecraft';
 $('separationMsg').textContent=separated?'The orbiter remains above Mars. The lander descends to the surface.':'Together for the journey; different jobs at Mars.';
};
document.querySelectorAll('[data-site]').forEach(function(b){b.onclick=function(){
 document.querySelectorAll('[data-site]').forEach(function(x){x.classList.toggle('chosen',x===b)});
 var safe=b.dataset.site==='plain';
 $('landingFeedback').textContent=safe?'Good choice! Flatter ground is safer for landing.':'Steep slopes and large rocks make landing harder. Compare this with the flatter plain.';
 $('landingNext').disabled=!safe;
}});
function showMission(n){
 $('mission1').classList.toggle('hide',n!==1);$('mission2').classList.toggle('hide',n!==2);
 document.querySelectorAll('[data-mission]').forEach(function(b){var active=Number(b.dataset.mission)===n;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
}
document.querySelectorAll('[data-mission]').forEach(function(b){b.onclick=function(){showMission(Number(b.dataset.mission))}});
var sampleStep=0;
var sampleMessages=['The arm reaches the ground to collect a small sample.','The collector carries soil to the instrument openings.','Biology tests look for possible activity. Other instruments investigate the sample’s chemistry. This is a simplified illustration of the workflow.'];
function showSample(){
 document.querySelector('.sample-scene').dataset.step=String(sampleStep);
 for(var i=0;i<3;i++)$('sampleStep'+i).classList.toggle('active',i===sampleStep);
 $('sampleInfo').textContent=sampleMessages[sampleStep];
 $('sampleNext').textContent=['Deliver the sample','Investigate the sample','Sample investigated'][sampleStep];
 $('sampleNext').disabled=sampleStep===2;$('sampleContinue').disabled=sampleStep!==2;
}
$('sampleNext').onclick=function(){sampleStep=Math.min(2,sampleStep+1);showSample()};
function resetActivities(){
 $('separation').classList.remove('separated');$('separate').textContent='Separate the spacecraft';$('separationMsg').textContent='One partner stays above; one travels down.';
 document.querySelectorAll('[data-site]').forEach(function(b){b.classList.remove('chosen')});$('landingNext').disabled=true;$('landingFeedback').textContent='Look at slopes and obstacles before you choose.';
 showMission(1);sampleStep=0;showSample();
 document.querySelectorAll('details').forEach(function(d){d.open=false});
 craftType='lander';document.querySelectorAll('[data-craft]').forEach(function(b){var active=b.dataset.craft==='lander';b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))});
 if(P3.ready){P3.crafts.lander.visible=true;P3.crafts.orbiter.visible=false}renderParts();selPart('camera');
}
showSample();







/* Keep the complete soil-sample activity inside the available window. */
(function fitVikingLab(){
 var page=document.getElementById('lab'),scene=page.querySelector('.scene'),main=page.closest('main'),queued=false;
 function fit(){queued=false;if(!page.classList.contains('on'))return;scene.style.width='100%';var width=scene.offsetWidth,height=scene.offsetHeight;if(!width||!height)return;var viewHeight=window.visualViewport?Math.min(window.innerHeight,window.visualViewport.height):window.innerHeight;var overflow=Math.max(0,main.getBoundingClientRect().bottom+window.scrollY-viewHeight+8);if(overflow)scene.style.width=Math.max(0,Math.floor(width*Math.max(0,height-overflow)/height))+'px';}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(fit)}}
 new MutationObserver(schedule).observe(page,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});window.addEventListener('resize',schedule);if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);schedule();
})();
