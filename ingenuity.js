var $=function(i){return document.getElementById(i)};
var order=['start','ride','parts','air','first','control','flights','final','done','quiz','pick','badge'];
var hist=[],curS='start';
function go(id,isBack){
  if(!isBack&&curS!==id)hist.push(curS);
  if(curS==='first'&&id!=='first')stopFlight();
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

/* Simplified helicopter model; two counter-rotating, two-bladed rotors. */
var rotorsSpinning=false;
var PD={
 solar:['Solar panel','Sunlight charged rechargeable batteries that supplied electricity for the helicopter.'],
 rotors:['Rotors and blades','Four blades form two rotors. The rotors turn in opposite directions to help the lightweight helicopter fly in thin Martian air.'],
 body:['Body and batteries','The small insulated body held electronics and batteries. Ingenuity used electricity to power its motors and keep vital components warm.'],
 cameras:['Cameras','A downward-facing navigation camera helped estimate motion. A second camera captured color views.'],
 legs:['Landing legs','Four light legs supported the helicopter when it touched down.'],
 antenna:['Radio link','A small antenna communicated with Perseverance, which relayed information between Ingenuity and Earth.']
};
function renderParts(){
 $('pb').innerHTML='';Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
}
function buildCraft(T){
 var root=new T.Group(),parts={},rotors=[];
 Object.keys(PD).forEach(function(k){parts[k]=new T.Group();root.add(parts[k])});
 var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||20)};
 function mk(k,g,c,x,y,z,rx,ry,rz,parent){var mesh=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.5,metalness:.35}));mesh.position.set(x,y,z);mesh.rotation.set(rx||0,ry||0,rz||0);mesh.userData.part=k;(parent||parts[k]).add(mesh);return mesh}
 function bar(k,a,b,r,c){var start=new T.Vector3(a[0],a[1],a[2]),end=new T.Vector3(b[0],b[1],b[2]),dir=end.clone().sub(start),m=mk(k,C(r,dir.length(),12),c,0,0,0);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m}
 mk('body',B(1.05,.85,.8),0xDCC28C,0,1.6,0);mk('body',B(1.08,.035,.83),0xF4E2AF,0,2.04,0);
 [-.36,0,.36].forEach(function(x){mk('body',B(.025,.8,.02),0xAC8A4A,x,1.6,.414)});
 [[-1,-1],[-1,1],[1,-1],[1,1]].forEach(function(t){bar('legs',[t[0]*.42,1.35,t[1]*.3],[t[0]*1.3,.15,t[1]*1.05],.045,0xCED4DC);mk('legs',new T.SphereGeometry(.1,12,12),0xA6B0C0,t[0]*1.3,.13,t[1]*1.05)});
 bar('rotors',[0,2.03,0],[0,3.55,0],.055,0xD4D4D9);
 [2.65,3.08].forEach(function(y,i){var pair=new T.Group();pair.position.y=y;pair.rotation.y=i*Math.PI/2;parts.rotors.add(pair);rotors.push(pair);mk('rotors',B(4.4,.045,.2),i?0xBEBBC2:0xE0D5C9,0,0,0,0,0,.015,pair);mk('rotors',C(.13,.12),0xA8A5AF,0,0,0,0,0,0,pair)});
 mk('solar',B(1.3,.06,.7),0x3F4D9B,0,3.6,0);[-.5,-.25,0,.25,.5].forEach(function(x){mk('solar',B(.015,.012,.67),0xA9BBDC,x,3.64,0)});mk('solar',B(1.3,.012,.02),0xA9BBDC,0,3.64,.33);mk('solar',B(1.3,.012,.02),0xA9BBDC,0,3.64,-.33);
 mk('cameras',B(.35,.14,.25),0xDDE2E9,0,1.1,0);mk('cameras',C(.07,.1),0x101F39,0,1.02,0);mk('cameras',C(.07,.1),0x101F39,.3,1.35,.45,Math.PI/2);
 bar('antenna',[.65,3.6,0],[1.0,3.6,0],.025,0xEDE1CA);
 return {root:root,parts:parts,rotors:rotors};
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
    var built=buildCraft(T),root=built.root;sc.add(root);root.rotation.y=.7;P3.parts=built.parts;P3.rotors=built.rotors;
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
    (function loop(){if($('parts').classList.contains('on')){if(!drag&&!matchMedia('(prefers-reduced-motion:reduce)').matches)root.rotation.y+=.004;if(rotorsSpinning&&!matchMedia('(prefers-reduced-motion:reduce)').matches){P3.rotors[0].rotation.y+=.18;P3.rotors[1].rotation.y-=.18}rd.render(sc,cam)}requestAnimationFrame(loop)})();
    P3.ready=true;if(P3.sel)selPart(P3.sel);
  }catch(e){P3.failed=true;$('r3').innerHTML='<p style="padding:30px;text-align:center">The 3D view needs a browser with WebGL. You can still tap the names below to learn about each part!</p>'}
}

/* Custom reaction icons (same style as the cards) */
var RI={
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'A tiny helicopter opened a new way to explore!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'Ingenuity and its team shared an unforgettable adventure.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big challenges take clever ideas and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[
 {q:'Why is flying on Mars so challenging?',o:['The air is much thinner than on Earth','Mars has no gravity','The sky is too close'],a:0,e:'Mars has air about 1% as dense as Earth’s. Ingenuity needed large, fast-spinning rotors and a lightweight body.'},
 {q:'What guided Ingenuity during flight?',o:['A pilot sitting inside','Its onboard software and sensors','A person steering it live from Earth'],a:1,e:'Engineers planned the flights. Ingenuity used onboard software, sensors, and camera images to guide itself.'},
 {q:'How many flights did Ingenuity complete?',o:['5','12','72'],a:2,e:'Originally planned for up to five test flights, Ingenuity completed 72 flights on Mars.'}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('helicopter').outerHTML+$('companion').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"39\" r=\"18\" fill=\"#FFE5A8\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"24\" r=\"2\"/><circle cx=\"174\" cy=\"18\" r=\"1.5\"/><circle cx=\"403\" cy=\"88\" r=\"1.7\"/></g><path d=\"M0 144L65 116L134 143L208 109L291 142L367 118L440 145V210H0Z\" fill=\"#703A60\"/><path d=\"M0 175Q130 147 260 172T440 168V210H0Z\" fill=\"#BD512E\"/><ellipse cx=\"214\" cy=\"181\" rx=\"46\" ry=\"7\" fill=\"#592D40\"/><use href=\"#helicopter\" x=\"123\" y=\"35\" width=\"180\" height=\"120\" /><path d=\"M97 106h17m215-25h17\" stroke=\"#FFD786\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"39\" r=\"18\" fill=\"#FFE5A8\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"24\" r=\"2\"/><circle cx=\"174\" cy=\"18\" r=\"1.5\"/><circle cx=\"403\" cy=\"88\" r=\"1.7\"/></g><path d=\"M0 144L65 116L134 143L208 109L291 142L367 118L440 145V210H0Z\" fill=\"#703A60\"/><path d=\"M0 175Q130 147 260 172T440 168V210H0Z\" fill=\"#BD512E\"/><use href=\"#helicopter\" x=\"120\" y=\"40\" width=\"200\" height=\"133.33333333333334\" /><ellipse cx=\"219\" cy=\"86\" rx=\"93\" ry=\"15\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"2\" stroke-dasharray=\"7 5\"/></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"39\" r=\"18\" fill=\"#FFE5A8\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"24\" r=\"2\"/><circle cx=\"174\" cy=\"18\" r=\"1.5\"/><circle cx=\"403\" cy=\"88\" r=\"1.7\"/></g><path d=\"M0 144L65 116L134 143L208 109L291 142L367 118L440 145V210H0Z\" fill=\"#703A60\"/><path d=\"M0 175Q130 147 260 172T440 168V210H0Z\" fill=\"#BD512E\"/><path d=\"M38 179L104 111L166 171L235 126L310 177L386 133\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"2\" stroke-dasharray=\"4 5\"/><use href=\"#helicopter\" x=\"144\" y=\"22\" width=\"150\" height=\"100\" /><path d=\"M213 103L154 169H282Z\" fill=\"#8FE3F5\" opacity=\".13\"/></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"39\" r=\"18\" fill=\"#FFE5A8\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"24\" r=\"2\"/><circle cx=\"174\" cy=\"18\" r=\"1.5\"/><circle cx=\"403\" cy=\"88\" r=\"1.7\"/></g><path d=\"M0 144L65 116L134 143L208 109L291 142L367 118L440 145V210H0Z\" fill=\"#703A60\"/><path d=\"M0 175Q130 147 260 172T440 168V210H0Z\" fill=\"#BD512E\"/><use href=\"#companion\" x=\"29\" y=\"86\" width=\"165\" height=\"110\" /><use href=\"#helicopter\" x=\"264\" y=\"43\" width=\"130\" height=\"86.66666666666667\" /><path d=\"M176 101q54-44 100-13\" stroke=\"#8FE3F5\" stroke-width=\"3\" fill=\"none\" stroke-dasharray=\"5 6\"/></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"367\" cy=\"39\" r=\"18\" fill=\"#FFE5A8\"/><g fill=\"#fff\"><circle cx=\"30\" cy=\"24\" r=\"2\"/><circle cx=\"174\" cy=\"18\" r=\"1.5\"/><circle cx=\"403\" cy=\"88\" r=\"1.7\"/></g><path d=\"M0 144L65 116L134 143L208 109L291 142L367 118L440 145V210H0Z\" fill=\"#703A60\"/><path d=\"M0 175Q130 147 260 172T440 168V210H0Z\" fill=\"#BD512E\"/><path d=\"M53 173Q112 70 206 146T380 113\" fill=\"none\" stroke=\"#FFE4A9\" stroke-width=\"3\" stroke-dasharray=\"4 8\"/><g fill=\"#8FE3F5\" stroke=\"#fff\" stroke-width=\"2\"><circle cx=\"53\" cy=\"173\" r=\"7\"/><circle cx=\"206\" cy=\"146\" r=\"7\"/><circle cx=\"380\" cy=\"113\" r=\"7\"/></g><use href=\"#helicopter\" x=\"213\" y=\"31\" width=\"125\" height=\"83.33333333333333\" /></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[
  {
    "k": "up",
    "q": "The first takeoff on Mars",
    "t": "FIRST FLIGHT PIONEER",
    "c1": "#FF9A5B",
    "c2": "#FF4D8D",
    "st": [
      [
        "Courage",
        99
      ],
      [
        "Wonder",
        97
      ],
      [
        "Focus",
        93
      ]
    ],
    "a": "You chose the first takeoff! Your First Flight Pioneer card celebrates trying something new and taking a small step toward a big possibility."
  },
  {
    "k": "run",
    "q": "The clever helicopter design",
    "t": "ROTOR GENIUS",
    "c1": "#5EEAD4",
    "c2": "#1FA36B",
    "st": [
      [
        "Ideas",
        99
      ],
      [
        "Skill",
        96
      ],
      [
        "Care",
        94
      ]
    ],
    "a": "You chose the engineering! Your Rotor Genius card celebrates asking how things work and finding clever ways to solve a difficult problem."
  },
  {
    "k": "water",
    "q": "Flying with its own guidance",
    "t": "SKY NAVIGATOR",
    "c1": "#8EC5FF",
    "c2": "#7B5CFF",
    "st": [
      [
        "Focus",
        99
      ],
      [
        "Planning",
        97
      ],
      [
        "Balance",
        94
      ]
    ],
    "a": "You chose independent flight! Your Sky Navigator card celebrates careful planning, close observation, and adapting to the world around you."
  },
  {
    "k": "star",
    "q": "The team behind the flights",
    "t": "MISSION TEAMMATE",
    "c1": "#FFE27A",
    "c2": "#FF9A3D",
    "st": [
      [
        "Teamwork",
        99
      ],
      [
        "Care",
        97
      ],
      [
        "Hope",
        94
      ]
    ],
    "a": "You chose teamwork! Your Mission Teammate card celebrates the people who share ideas, prepare carefully, and help each other achieve a goal."
  },
  {
    "k": "gear",
    "q": "Five flights becoming 72",
    "t": "BEYOND EXPECTATIONS",
    "c1": "#D2B8FF",
    "c2": "#8B5CF6",
    "st": [
      [
        "Curiosity",
        99
      ],
      [
        "Grit",
        97
      ],
      [
        "Discovery",
        96
      ]
    ],
    "a": "You chose the extended adventure! Your Beyond Expectations card celebrates continuing to learn after an early success and discovering what else is possible."
  }
];
ICON.up='<path d="M50 8V62m-22-20 22 22 22-22M15 78h70" stroke="#FFF6E5" stroke-width="8" fill="none" stroke-linecap="round"/>';
ICON.run='<rect x="10" y="25" width="80" height="58" rx="10" fill="#FFF6E5"/><path d="M30 25l8-13h25l8 13" fill="#FFF6E5"/><circle cx="50" cy="54" r="20" fill="#315B64"/>';
ICON.water='<path d="M35 12h30M40 12v30L20 78q-5 10 8 10h44q13 0 8-10L60 42V12M32 63h36" stroke="#FFF6E5" stroke-width="7" fill="none"/>';
ICON.star='<path d="M16 30h48q24 0 18-15M10 50h75M20 70h43q24 0 18 15" stroke="#FFF6E5" stroke-width="7" fill="none" stroke-linecap="round"/>';
ICON.gear='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><ellipse cx="50" cy="50" rx="17" ry="36" fill="none" stroke="#FFF6E5" stroke-width="5"/><path d="M14 50h72M23 30h54M23 70h54" stroke="#FFF6E5" stroke-width="5"/>';
ICON.up='<path d="M50 88V12m-22 25 22-25 22 25M15 88h70" fill="none" stroke="#FFF6E5" stroke-width="7" stroke-linecap="round"/>';
ICON.run='<path d="M10 25h80M10 43h80M50 18v58M34 64h32v20H34Z" fill="none" stroke="#FFF6E5" stroke-width="6" stroke-linecap="round"/>';
ICON.water='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><path d="M62 25L56 56L27 72L42 42Z" fill="#FFF6E5"/>';
ICON.star='<circle cx="30" cy="30" r="12" fill="#FFF6E5"/><circle cx="70" cy="30" r="12" fill="#FFF6E5"/><path d="M12 85V66a18 18 0 0 1 36 0v19M52 85V66a18 18 0 0 1 36 0v19" fill="#FFF6E5"/>';
ICON.gear='<path d="M14 86L43 55L60 65L87 19m-22 2 22-2 1 22" fill="none" stroke="#FFF6E5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>';
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">INGENUITY EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA Mars Helicopter · 2021–2024</text>'
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
$('again').onclick=function(){qi=0;score=0;hist=[];cur=null;resetActivities();document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});$('emoMsg').innerHTML='&nbsp;';showQ();curS='start';go('start')};

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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('Ingenuity: The Little Helicopter That Could',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'ingenuity-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My Ingenuity explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='ingenuity-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};


/* Ingenuity story interactions. Flight timing is illustrative, not real-time. */
var flightTimers=[];
var airMessages={earth:'Earth: denser air gives rotor blades more molecules to push.',mars:'Mars: air is about 1% as dense as Earth’s. A light body and fast-spinning rotors help Ingenuity fly.'};
function selectButtons(selector,key,value){document.querySelectorAll(selector).forEach(function(b){var active=String(b.dataset[key])===String(value);b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))})}
$('deploy').onclick=function(){var deployed=$('stowedHeli').closest('svg').classList.toggle('deployed');this.textContent=deployed?'Tuck it beneath the rover':'Reveal the helicopter';$('deployInfo').textContent=deployed?'Perseverance delivered Ingenuity—ready for its own adventure.':'A small passenger, tucked beneath a much larger explorer.'};
$('rotorSpin').onclick=function(){rotorsSpinning=!rotorsSpinning;this.setAttribute('aria-pressed',String(rotorsSpinning));this.classList.toggle('on',rotorsSpinning);this.textContent=rotorsSpinning?'Stop the rotors':'Spin the rotors';if(matchMedia('(prefers-reduced-motion:reduce)').matches){if(P3.ready)P3.rotors.forEach(function(r,i){r.rotation.y+=(i?-.4:.4)});$('pinfo').textContent='The two rotors turn in opposite directions. Continuous animation is paused for reduced motion.'}};
function setAir(kind){
 selectButtons('[data-air]','air',kind);var count=kind==='earth'?100:1,dots='';
 for(var i=0;i<count;i++){var x=15+(i*67)%410,y=14+(i*43)%182;dots+='<circle cx="'+x+'" cy="'+y+'" r="2.5" fill="#8FE3F5" opacity=".65"/>'}
 $('airDots').innerHTML=dots;$('airInfo').textContent=airMessages[kind];
}
document.querySelectorAll('[data-air]').forEach(function(b){b.onclick=function(){setAir(b.dataset.air)}});
function stopFlight(){
 flightTimers.forEach(clearTimeout);flightTimers=[];
 $('flyingHeli').closest('svg').classList.remove('flight-up','flight-hover');$('watchFlight').disabled=false;$('watchFlight').textContent='Watch the first flight';
 $('flightInfo').textContent='Ready on the ground. Follow the takeoff, hover, and landing.';
}
$('watchFlight').onclick=function(){
 stopFlight();var scene=$('flyingHeli').closest('svg'),button=this;
 if(matchMedia('(prefers-reduced-motion:reduce)').matches){$('flightInfo').textContent='First flight complete: rise 3 meters, hover for 30 seconds, then land. The animation is paused for reduced motion.';button.textContent='Review the first flight';return}
 button.disabled=true;scene.classList.add('flight-up');$('flightInfo').textContent='Takeoff! Ingenuity rises 3 meters. This illustration plays faster than the real flight.';
 flightTimers.push(setTimeout(function(){scene.classList.replace('flight-up','flight-hover');$('flightInfo').textContent='A stable hover! The real helicopter held its hover for 30 seconds.'},1600));
 flightTimers.push(setTimeout(function(){scene.classList.remove('flight-hover');$('flightInfo').textContent='Coming back down for a landing.'},3600));
 flightTimers.push(setTimeout(function(){button.disabled=false;button.textContent='Replay the first flight';$('flightInfo').textContent='Touchdown! The first powered, controlled flight on another planet was a success.';burst(innerWidth/2,innerHeight*.45,['#FFC857','#8FE3F5','#fff'],['spark','star'],25);flightTimers=[]},5300));
};
var processMessages=['Plan: the team chooses a flight path and checks the conditions.','Send: flight instructions travel from Earth through the mission’s communication links.','Fly: Ingenuity uses its onboard software, sensors, and camera images to guide itself.','Receive: flight information and pictures return to the team for study.'];
function setProcess(n){selectButtons('[data-process]','process',n);$('processInfo').textContent=processMessages[n]}
document.querySelectorAll('[data-process]').forEach(function(b){b.onclick=function(){setProcess(Number(b.dataset.process))}});
var milestones=['Flight 1: a short rise and hover proved that controlled flight on Mars was possible.','Flight 5: The planned test was complete. More flights followed.','72 flights: Nearly three years on Mars, with over two hours in the air.'];
function setMilestone(n){selectButtons('[data-milestone]','milestone',n);$('milestoneInfo').textContent=milestones[n]}
document.querySelectorAll('[data-milestone]').forEach(function(b){b.onclick=function(){setMilestone(Number(b.dataset.milestone))}});
$('finalReveal').onclick=function(){$('finalLesson').classList.remove('hide');this.classList.add('hide')};
function resetActivities(){
 stopFlight();$('stowedHeli').closest('svg').classList.remove('deployed');$('deploy').textContent='Reveal the helicopter';$('deployInfo').textContent='A small passenger, tucked beneath a much larger explorer.';
 rotorsSpinning=false;$('rotorSpin').textContent='Spin the rotors';$('rotorSpin').setAttribute('aria-pressed','false');$('rotorSpin').classList.remove('on');
 setAir('earth');setProcess(0);setMilestone(0);$('finalLesson').classList.add('hide');$('finalReveal').classList.remove('hide');
 P3.sel=null;document.querySelectorAll('#pb .pbtn').forEach(function(b){b.classList.remove('on')});$('pinfo').textContent='Tap a name to explore the helicopter.';
 if(P3.ready)Object.keys(P3.parts).forEach(function(k){P3.parts[k].traverse(function(m){if(m.isMesh){m.material.emissive.setHex(0);m.material.opacity=1;m.material.needsUpdate=true}})});
}
setAir('earth');

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





/* Maximize page 6 artwork while keeping the flight controls and next button visible. */
(function fitFlightControlPage(){
 var page=document.getElementById('control'),scene=page.querySelector('.scene'),main=page.closest('main'),queued=false;
 function fit(){queued=false;if(!page.classList.contains('on'))return;scene.style.maxWidth='none';scene.style.width='100%';var width=scene.offsetWidth,height=scene.offsetHeight;if(!width||!height)return;var viewHeight=window.visualViewport?Math.min(window.innerHeight,window.visualViewport.height):window.innerHeight;var overflow=Math.max(0,main.getBoundingClientRect().bottom+window.scrollY-viewHeight+8);if(overflow)scene.style.width=Math.max(0,Math.floor(width*Math.max(0,height-overflow)/height))+'px';}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(fit)}}
 new MutationObserver(schedule).observe(page,{attributes:true,attributeFilter:['class'],childList:true,characterData:true,subtree:true});window.addEventListener('resize',schedule);if(window.visualViewport)window.visualViewport.addEventListener('resize',schedule);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);schedule();
})();
