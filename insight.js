var $=function(i){return document.getElementById(i)};
var order=["start","arrival","parts","deploy","quake","layers","mole","power","done","quiz","pick","badge"];
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

var isInsight=true;
/* Educational interpretations of the Phoenix and InSight landers. */
var PD={
 panels:['Solar arrays','Two circular solar arrays gathered sunlight to power the lander.'],
 body:['Lander body','The central deck carried electronics, communications equipment, and science instruments.'],
 arm:['Robotic arm',isInsight?'The robotic arm placed instruments on the surface beside the lander.':'The sampling arm scraped trenches and delivered soil to onboard laboratories.'],
 camera:['Cameras',isInsight?'Cameras helped the team choose where to place instruments and inspect the workspace.':'Stereo cameras surveyed the landing area and helped the team choose where to dig.'],
 instruments:[isInsight?'Seismometer and shield':'Sample laboratories',isInsight?'The seismometer measured ground vibrations. Its shield reduced disturbances from wind and temperature changes.':'Small ovens and soil-analysis instruments investigated samples collected by the arm.'],
 legs:['Landing legs','Three legs and broad footpads supported the stationary lander.'],
 antenna:[isInsight?'Radio antennas':'Weather station',isInsight?'Radio links carried data to Earth. Precise tracking also helped scientists study how Mars rotates.':'Weather instruments studied the atmosphere, including temperature and pressure.']
};
function renderParts(){
 $('pb').innerHTML='';Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)});
}
function buildCraft(T){
 var root=new T.Group(),parts={};Object.keys(PD).forEach(function(k){parts[k]=new T.Group();root.add(parts[k])});
 var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||24)};
 function mk(k,g,c,x,y,z,rx,ry,rz){var m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.6,metalness:.3}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.userData.part=k;parts[k].add(m);return m}
 function bar(k,a,b,r,c){var start=new T.Vector3(a[0],a[1],a[2]),end=new T.Vector3(b[0],b[1],b[2]),dir=end.clone().sub(start),m=mk(k,C(r,dir.length(),12),c,0,0,0);m.position.copy(start.add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m}
 mk('body',C(1.05,.55,6),0xD7B875,0,1.4,0);mk('body',C(1.1,.08,6),0xECE3C8,0,1.72,0);
 for(var i=0;i<3;i++){var a=i*2*Math.PI/3,x=Math.cos(a),z=Math.sin(a);bar('legs',[x*.8,1.4,z*.8],[x*1.6,.2,z*1.6],.06,0xD4D8DF);mk('legs',C(.26,.08),0xC4CAD3,x*1.6,.15,z*1.6)}
 [-1,1].forEach(function(s){bar('panels',[s*.9,1.5,0],[s*1.9,1.6,0],.055,0xCAD5E6);mk('panels',C(1.15,.045,48),0x424D97,s*2,1.62,0);for(var j=0;j<12;j++){var angle=j*Math.PI/6;bar('panels',[s*2,1.65,0],[s*2+Math.cos(angle)*1.12,1.65,Math.sin(angle)*1.12],.008,0x9EAFD0)}mk('panels',C(.11,.06),0xC7CBDA,s*2,1.66,0)});
 bar('arm',[.7,1.75,.3],[1.3,2.35,.55],.065,0xD9DFE8);bar('arm',[1.3,2.35,.55],[1.8,1.65,1.2],.055,0xD9DFE8);bar('arm',[1.8,1.65,1.2],[2,.6,1.65],.05,0xD9DFE8);mk('arm',B(.36,.17,.34),0xD6AC5E,2,.5,1.65);
 if(isInsight){
  mk('camera',B(.27,.16,.17),0xCDD8E3,.6,1.9,.5);mk('camera',C(.055,.08),0x1C2840,.6,1.9,.61,Math.PI/2);
  mk('instruments',new T.SphereGeometry(.43,24,16,0,Math.PI*2,0,Math.PI/2),0xE9E8DD,-.6,.3,2);mk('instruments',C(.45,.06),0xC7CCD4,-.6,.29,2);bar('instruments',[-.5,1.5,.7],[-.6,.3,2],.018,0xD4A75F);
  mk('instruments',C(.07,.6),0xC7CBD5,.8,.45,2);bar('instruments',[.7,1.5,.7],[.8,.8,2],.018,0xD4A75F);
  [-.6,.45].forEach(function(x){bar('antenna',[x,1.7,-.3],[x,2.15,-.3],.035,0xD8DDE7);mk('antenna',C(.15,.15),0xE8E2D3,x,2.22,-.3)});
 }else{
  bar('camera',[-.35,1.8,.3],[-.35,3.25,.3],.055,0xDCE2E7);mk('camera',B(.5,.25,.25),0xD5DCE6,-.35,3.3,.3);[-.5,-.2].forEach(function(x){mk('camera',C(.065,.08),0x1C2840,x,3.3,.47,Math.PI/2)});
  mk('instruments',B(.68,.3,.48),0xA1ADC1,.25,1.95,-.2);for(i=0;i<4;i++)mk('instruments',B(.12,.03,.35),0xE1E0D7,.02+i*.16,2.12,-.2);mk('instruments',B(.4,.24,.45),0xCFD8DF,-.65,1.9,-.25);
  bar('antenna',[.7,1.8,-.45],[.7,3,-.45],.035,0x8FC8E2);mk('antenna',B(.25,.2,.2),0xA8C8DD,.7,3.1,-.45);
 }
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
    var sc=new T.Scene(),cam=new T.PerspectiveCamera(38,1,.1,100);cam.position.set(5.7,3.8,7.3);cam.lookAt(0,1.9,0);
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
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'Small vibrations revealed a hidden world!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'A dedicated team helped this lander share its discoveries.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big questions take patience and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[{"q":"What did InSight’s seismometer measure?","o":["Ground vibrations","The taste of soil","The height of mountains"],"a":0,"e":"The seismometer measured tiny ground movements, including marsquakes."},{"q":"What can seismic waves help scientists investigate?","o":["Only the clouds","The crust, mantle, and core","The color of a sunset"],"a":1,"e":"Wave patterns provide clues about the materials and layers inside Mars."},{"q":"Why did dust cause a problem?","o":["It made Mars heavier","It stopped Mars rotating","It reduced the solar panels’ power"],"a":2,"e":"Dust blocked sunlight from reaching the solar cells, reducing the lander’s energy."}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('lander').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"366\" cy=\"39\" r=\"18\" fill=\"#FFE8B6\"/><g fill=\"#fff\"><circle cx=\"36\" cy=\"22\" r=\"2\"/><circle cx=\"171\" cy=\"31\" r=\"1.5\"/><circle cx=\"409\" cy=\"75\" r=\"2\"/></g><path d=\"M0 151L80 130L142 150L226 119L316 152L389 129L440 151V210H0Z\" fill=\"#713D5B\"/><path d=\"M0 177Q110 155 220 175T440 169V210H0Z\" fill=\"#B45131\"/><use href=\"#lander\" x=\"24\" y=\"52\" width=\"160\" height=\"106.66666666666667\"/><rect x=\"215\" y=\"55\" width=\"195\" height=\"110\" rx=\"12\" fill=\"#161D3E\" stroke=\"#8FE3F5\" stroke-width=\"2\"/><path d=\"M225 110h175M225 80h175M225 140h175\" stroke=\"#364770\"/><polyline points=\"225,110 400,110\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\"/></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"366\" cy=\"39\" r=\"18\" fill=\"#FFE8B6\"/><g fill=\"#fff\"><circle cx=\"36\" cy=\"22\" r=\"2\"/><circle cx=\"171\" cy=\"31\" r=\"1.5\"/><circle cx=\"409\" cy=\"75\" r=\"2\"/></g><path d=\"M0 151L80 130L142 150L226 119L316 152L389 129L440 151V210H0Z\" fill=\"#713D5B\"/><path d=\"M0 177Q110 155 220 175T440 169V210H0Z\" fill=\"#B45131\"/><circle cx=\"220\" cy=\"109\" r=\"88\" fill=\"#C96948\"/><circle cx=\"220\" cy=\"109\" r=\"77\" fill=\"#DB9A55\"/><circle cx=\"220\" cy=\"109\" r=\"39\" fill=\"#F5CF79\"/><g fill=\"#432244\" font-family=\"Fredoka,sans-serif\" font-size=\"13\"><text x=\"204\" y=\"115\">Core</text><text x=\"208\" y=\"59\">Mantle</text></g><path d=\"M299 69l42-28\" stroke=\"#8FE3F5\" stroke-width=\"2\"/><text x=\"343\" y=\"39\" fill=\"#8FE3F5\" font-size=\"13\" font-family=\"Fredoka,sans-serif\">Crust</text></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"366\" cy=\"39\" r=\"18\" fill=\"#FFE8B6\"/><g fill=\"#fff\"><circle cx=\"36\" cy=\"22\" r=\"2\"/><circle cx=\"171\" cy=\"31\" r=\"1.5\"/><circle cx=\"409\" cy=\"75\" r=\"2\"/></g><path d=\"M0 151L80 130L142 150L226 119L316 152L389 129L440 151V210H0Z\" fill=\"#713D5B\"/><path d=\"M0 177Q110 155 220 175T440 169V210H0Z\" fill=\"#B45131\"/><use href=\"#lander\" x=\"30\" y=\"48\" width=\"190\" height=\"126.66666666666667\"/><path d=\"M199 147H279\" stroke=\"#D7AE66\" stroke-width=\"3\" fill=\"none\"/><g><rect x=\"272\" y=\"148\" width=\"30\" height=\"20\" rx=\"6\" fill=\"#E3AD69\"/><path d=\"M270 169h35\" stroke=\"#D7D8DD\" stroke-width=\"3\"/></g><g><path d=\"M257 171q0-41 31-41t31 41Z\" fill=\"#EDE9DA\" stroke=\"#C4CCD4\" stroke-width=\"2\"/></g></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"366\" cy=\"39\" r=\"18\" fill=\"#FFE8B6\"/><g fill=\"#fff\"><circle cx=\"36\" cy=\"22\" r=\"2\"/><circle cx=\"171\" cy=\"31\" r=\"1.5\"/><circle cx=\"409\" cy=\"75\" r=\"2\"/></g><path d=\"M0 151L80 130L142 150L226 119L316 152L389 129L440 151V210H0Z\" fill=\"#713D5B\"/><path d=\"M0 177Q110 155 220 175T440 169V210H0Z\" fill=\"#B45131\"/><path d=\"M0 91H440V210H0Z\" fill=\"#8A5941\"/><path d=\"M0 91H440\" stroke=\"#D39A6B\" stroke-width=\"5\"/><g><rect x=\"199\" y=\"58\" width=\"24\" height=\"88\" rx=\"9\" fill=\"#C7C8CD\"/><path d=\"M211 58L161 38L99 44\" stroke=\"#E5B76A\" stroke-width=\"3\" fill=\"none\"/></g><path d=\"M178 106h14m38 0h14\" stroke=\"#8FE3F5\" stroke-width=\"3\"/></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#29205E\"/><circle cx=\"366\" cy=\"39\" r=\"18\" fill=\"#FFE8B6\"/><g fill=\"#fff\"><circle cx=\"36\" cy=\"22\" r=\"2\"/><circle cx=\"171\" cy=\"31\" r=\"1.5\"/><circle cx=\"409\" cy=\"75\" r=\"2\"/></g><path d=\"M0 151L80 130L142 150L226 119L316 152L389 129L440 151V210H0Z\" fill=\"#713D5B\"/><path d=\"M0 177Q110 155 220 175T440 169V210H0Z\" fill=\"#B45131\"/><use href=\"#lander\" x=\"130\" y=\"57\" width=\"180\" height=\"120\"/></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[{"k":"up","q":"The marsquake signals","t":"MARSQUAKE DETECTIVE","c1":"#FF9A5B","c2":"#FF4D8D","st":[["Curiosity",99],["Care",97],["Discovery",94]],"a":"You follow the smallest signals to discover a bigger story. Your Marsquake Detective card celebrates that explorer in you."},{"k":"run","q":"The layers inside Mars","t":"PLANET EXPLORER","c1":"#5EEAD4","c2":"#1FA36B","st":[["Curiosity",99],["Care",96],["Discovery",95]],"a":"You want to understand the hidden layers of a world. Your Planet Explorer card celebrates that explorer in you."},{"k":"water","q":"Placing instruments on the ground","t":"INSTRUMENT EXPERT","c1":"#8EC5FF","c2":"#7B5CFF","st":[["Curiosity",99],["Care",95],["Discovery",96]],"a":"You value careful work that helps an experiment succeed. Your Instrument Expert card celebrates that explorer in you."},{"k":"star","q":"The heat-probe challenge","t":"PROBLEM SOLVER","c1":"#FFE27A","c2":"#FF9A3D","st":[["Curiosity",99],["Care",94],["Discovery",97]],"a":"You learn from a difficult challenge and try new approaches. Your Problem Solver card celebrates that explorer in you."},{"k":"gear","q":"Listening patiently for discoveries","t":"PATIENT PIONEER","c1":"#D2B8FF","c2":"#8B5CF6","st":[["Curiosity",99],["Care",93],["Discovery",98]],"a":"You know that steady observation can lead to discovery. Your Patient Pioneer card celebrates that explorer in you."}];
ICON.up='<path d="M50 8V62m-22-20 22 22 22-22M15 78h70" stroke="#FFF6E5" stroke-width="8" fill="none" stroke-linecap="round"/>';
ICON.run='<rect x="10" y="25" width="80" height="58" rx="10" fill="#FFF6E5"/><path d="M30 25l8-13h25l8 13" fill="#FFF6E5"/><circle cx="50" cy="54" r="20" fill="#315B64"/>';
ICON.water='<path d="M35 12h30M40 12v30L20 78q-5 10 8 10h44q13 0 8-10L60 42V12M32 63h36" stroke="#FFF6E5" stroke-width="7" fill="none"/>';
ICON.star='<path d="M16 30h48q24 0 18-15M10 50h75M20 70h43q24 0 18 15" stroke="#FFF6E5" stroke-width="7" fill="none" stroke-linecap="round"/>';
ICON.gear='<circle cx="50" cy="50" r="36" fill="none" stroke="#FFF6E5" stroke-width="6"/><ellipse cx="50" cy="50" rx="17" ry="36" fill="none" stroke="#FFF6E5" stroke-width="5"/><path d="M14 50h72M23 30h54M23 70h54" stroke="#FFF6E5" stroke-width="5"/>';
ICON.up="<path d=\"M5 50h18l8-22 13 49 12-63 12 61 10-25h17\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/>";
ICON.run="<circle cx=\"50\" cy=\"50\" r=\"38\" fill=\"#FFF6E5\"/><circle cx=\"50\" cy=\"50\" r=\"27\" fill=\"#D69553\"/><circle cx=\"50\" cy=\"50\" r=\"13\" fill=\"#FFF1B4\"/>";
ICON.water="<path d=\"M15 80q0-55 35-55t35 55Z\" fill=\"#FFF6E5\"/><path d=\"M10 85h80\" stroke=\"#FFF6E5\" stroke-width=\"6\"/>";
ICON.star="<path d=\"M50 12v76M20 44l30-32 30 32M20 77h60\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/>";
ICON.gear="<circle cx=\"50\" cy=\"50\" r=\"36\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><path d=\"M50 25v27l18 13\" stroke=\"#FFF6E5\" stroke-width=\"7\" fill=\"none\"/>";
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">INSIGHT EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA InSight · 2018–2022</text>'
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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('InSight: Listening to the Heart of Mars',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'insight-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My InSight explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='insight-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};


/* Mission-specific activities. Diagrams illustrate concepts rather than simulate data. */
function selectTab(key,value){document.querySelectorAll('[data-'+key+']').forEach(function(b){var active=Number(b.dataset[key])===value;b.classList.toggle('on',active);b.setAttribute('aria-pressed',String(active))})}
function bindTabs(key,fn){document.querySelectorAll('[data-'+key+']').forEach(function(b){b.onclick=function(){var n=Number(b.dataset[key]);selectTab(key,n);fn(n)}})}
var digStage=0,labStage=0,deployStage=0;
function setClassAt(id,name,on){$(id).closest('svg').classList.toggle(name,on)}
function updateDig(){
 var scene=$('digCover').closest('svg');scene.classList.remove('dig-stage-1','dig-stage-2','dig-stage-3');if(digStage)scene.classList.add('dig-stage-'+digStage);
 $('digInfo').textContent=['A layer of soil hides what lies below.','The first scrape loosens the upper soil.','Another scrape reveals a brighter layer.','Bright material is exposed. Its appearance is a clue to investigate—not a complete answer.'][digStage];
 $('dig').textContent=digStage===3?'Trench exposed':'Scrape away some soil';$('dig').disabled=digStage===3;
}
function updateLab(){
 $('labInfo').textContent=['Collect a sample for the laboratory.','A small sample is delivered to an oven.','Heating releases gases for the instruments to examine.','Analysis of heated samples confirmed water ice.'][labStage];
 $('labNext').textContent=['Deliver the sample','Heat the sample','Examine the result','Water ice confirmed'][labStage];$('labNext').disabled=labStage===3;setClassAt('ovenWindow','oven-hot',labStage>=2);
}
function updateDeploy(){
 var scene=$('instrument').closest('svg');scene.classList.toggle('instrument-placed',deployStage===1);scene.classList.toggle('shield-placed',deployStage===2);
 $('deployInfo').textContent=['Prepare to place the seismometer beside the lander.','The seismometer is on the ground, ready to sense tiny vibrations.','The wind and thermal shield protects the instrument from environmental disturbances.'][deployStage];
 $('deployNext').textContent=['Place the seismometer','Add the protective shield','Instrument protected'][deployStage];$('deployNext').disabled=deployStage===2;
}
if(!isInsight){
 $('dig').onclick=function(){digStage=Math.min(3,digStage+1);updateDig()};$('labNext').onclick=function(){labStage=Math.min(3,labStage+1);updateLab()};
 bindTabs('ice',function(n){setClassAt('icePieces','ice-later',n===1);$('iceInfo').textContent=n?'Four days later: several bright pieces have disappeared, consistent with exposed ice turning into vapor.':'Before: bright pieces lie inside the freshly dug trench.'});
 bindTabs('season',function(n){setClassAt('seasonOverlay','cold-season',n===1);$('seasonInfo').textContent=n?'Less sunlight and colder conditions reduced available power. Last contact came on November 2, 2008.':'During the working season, Phoenix studied soil and weather, including clouds and falling snow.'});
}else{
 $('deployNext').onclick=function(){deployStage=Math.min(2,deployStage+1);updateDeploy()};
 $('triggerQuake').onclick=function(){var points=[];for(var i=0;i<=90;i++){var envelope=Math.sin(Math.PI*i/90)*Math.exp(-i/95),wave=(Math.sin(i*1.5)+.45*Math.sin(i*3.7))*26*envelope;points.push((225+i*175/90).toFixed(1)+','+(110+wave).toFixed(1))}$('waveLine').setAttribute('points',points.join(' '));$('quakeInfo').textContent='Marsquake signals reveal their source and the layers they crossed.'};
 bindTabs('layer',function(n){var scene=$('layers').querySelector('svg');scene.classList.remove('planet-layer-0','planet-layer-1','planet-layer-2');scene.classList.add('planet-layer-'+n);$('layerInfo').textContent=['Crust: the outer rocky layer of Mars.','Mantle: the thick rocky region between the crust and core.','Core: the deep, metal-rich central region. Seismic waves help reveal its properties.'][n]});
 bindTabs('grip',function(n){var scene=$('moleProbe').closest('svg');scene.classList.toggle('probe-grip',n===0);scene.classList.toggle('probe-slip',n===1);$('moleInfo').textContent=n?'At the landing site, the soil did not provide enough friction. The probe could not reach its planned depth.':'With enough friction, soil can resist the hammer’s recoil and help a probe move down.'});
 bindTabs('dust',function(n){setClassAt('seasonOverlay','dusty',n===1);$('dustInfo').textContent=n?'Dust blocks sunlight from the cells, so less electrical power is available.':'Clean panels allow more sunlight to reach the solar cells.'});
}
function resetActivities(){
 document.querySelectorAll('details').forEach(function(d){d.open=false});
 if(!isInsight){digStage=0;labStage=0;updateDig();updateLab();selectTab('ice',0);setClassAt('icePieces','ice-later',false);$('iceInfo').textContent='Before: bright pieces lie inside the freshly dug trench.';selectTab('season',0);setClassAt('seasonOverlay','cold-season',false);$('seasonInfo').textContent='During the working season, sunlight powered the lander’s investigations.'}
 else{deployStage=0;updateDeploy();$('waveLine').setAttribute('points','225,110 400,110');$('quakeInfo').textContent='A quiet trace becomes a pattern of vibrations. This is an illustrative signal.';selectTab('layer',0);var scene=$('layers').querySelector('svg');scene.classList.remove('planet-layer-0','planet-layer-1','planet-layer-2');$('layerInfo').textContent='Crust: the outer rocky layer of Mars.';selectTab('grip',0);$('moleProbe').closest('svg').classList.remove('probe-grip','probe-slip');$('moleInfo').textContent='With enough friction, soil can resist the hammer’s recoil and help a probe move down.';selectTab('dust',0);setClassAt('seasonOverlay','dusty',false);$('dustInfo').textContent='Clean panels allow more sunlight to reach the solar cells.'}
 P3.sel=null;document.querySelectorAll('#pb .pbtn').forEach(function(b){b.classList.remove('on')});$('pinfo').textContent='Tap a name to explore a part of the lander.';
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




