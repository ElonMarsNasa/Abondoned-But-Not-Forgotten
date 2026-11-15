var $=function(i){return document.getElementById(i)};
var order=['start','arrival','parts','belt','jupiter','assist','saturn','plaque','done','quiz','pick','badge'];
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

/* Simplified Pioneer model: dish, equipment bay, paired RTG booms, and sensors. */
var PD={antenna:['Radio dish','A large antenna sent measurements home.'],power:['Radioisotope generators','Heat from radioactive decay supplied electricity far from the Sun.'],imager:['Imaging instrument','An imaging photopolarimeter scanned light to build pictures.'],magnet:['Magnetometer','A sensor on a boom measured magnetic fields.'],body:['Equipment bay','The central body held electronics and spacecraft systems.'],plaque:['Message plaque','A small metal message represents humanity and our location.']};
function renderParts(){ $('pb').innerHTML='';Object.keys(PD).forEach(function(k){var b=document.createElement('button');b.className='pbtn';b.dataset.p=k;b.textContent=PD[k][0];b.onclick=function(){selPart(k)};$('pb').appendChild(b)})}
function buildCraft(T){var root=new T.Group(),parts={};Object.keys(PD).forEach(function(k){parts[k]=new T.Group();root.add(parts[k])});
function mk(k,g,c,x,y,z,rx,ry,rz){var m=new T.Mesh(g,new T.MeshStandardMaterial({color:c,roughness:.55,metalness:.35}));m.position.set(x,y,z);m.rotation.set(rx||0,ry||0,rz||0);m.userData.part=k;parts[k].add(m);return m}
var B=function(x,y,z){return new T.BoxGeometry(x,y,z)},C=function(r,h,n){return new T.CylinderGeometry(r,r,h,n||24)};
mk('body',C(.7,.65,6),0xD5AD61,0,1,0);mk('body',C(.73,.06,6),0xDDD4B4,0,.65,0);
// Concave paraboloid, open toward +Y, with a feed on its axis.
var pos=[],idx=[],rings=12,segs=48;
for(var j=0;j<=rings;j++){var r=j/rings*1.55;for(var i=0;i<=segs;i++){var a=i/segs*Math.PI*2;pos.push(r*Math.cos(a),1.5+r*r*.23,r*Math.sin(a))}}
for(var j=0;j<rings;j++)for(var i=0;i<segs;i++){var a=j*(segs+1)+i,b=a+segs+1;idx.push(a,b,a+1,a+1,b,b+1)}
var geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();var dish=mk('antenna',geo,0xE7E0CD,0,0,0);dish.material.side=T.DoubleSide;
mk('antenna',C(.025,1.05),0xCAD2DC,0,2.06,0);mk('antenna',C(.075,.15),0xD6C9AA,0,2.64,0);
for(var s=-1;s<=1;s+=2){mk('power',B(2,.055,.055),0xCFD5DE,s*1.5,.8,0);for(var n=-1;n<=1;n+=2){mk('power',C(.22,.5),0x636B74,s*2.45,.8,n*.3,Math.PI/2);for(var f=-2;f<=2;f++)mk('power',C(.28,.035),0x91969C,s*2.45,.8+f*.09,n*.3,Math.PI/2)}}
mk('magnet',B(.05,.05,2.2),0xCCD6DE,0,1.1,-1.5);mk('magnet',B(.18,.18,.18),0x8B9BAD,0,1.1,-2.65);
mk('imager',B(.25,.3,.35),0xAEB9C8,.6,.95,.5);mk('imager',C(.08,.13),0x12223D,.6,.95,.73,Math.PI/2);
mk('plaque',B(.3,.21,.025),0xF1C86F,-.24,1,.63);return {root:root,parts:parts};}

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
 wow:{c:['#FFC857','#FF9A3D','#FFF6C8'],h:['star','spark'],m:'Two scouts opened a new view of giant worlds!',l:'Amazing',s:'<defs><linearGradient id="ra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE27A"/><stop offset="1" stop-color="#FF9A3D"/></linearGradient></defs><polygon points="50,6 62,36 94,38 69,59 78,91 50,73 22,91 31,59 6,38 38,36" fill="url(#ra)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="48" r="4" fill="#14123A"/><circle cx="60" cy="48" r="4" fill="#14123A"/><path d="M40 60q10 9 20 0" stroke="#14123A" stroke-width="3.5" fill="none" stroke-linecap="round"/>'},
 love:{c:['#FF8FB8','#FF4D8D','#FFD1E3'],h:['heart','heart','spark'],m:'Their teams sent curiosity far beyond familiar skies.',l:'Touched',s:'<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF3D7F"/></linearGradient></defs><path d="M50 88C14 62 8 38 22 24c12-11 26-5 28 8 2-13 16-19 28-8 14 14 8 38-28 64z" fill="url(#rb)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M28 34q4-8 12-6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'},
 power:{c:['#8B7BFF','#FF8FB8','#FFE27A'],h:['spark','star'],m:'Big questions take patience and teamwork.',l:'Strong',s:'<defs><linearGradient id="rc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B7A8FF"/><stop offset="1" stop-color="#FF5FA2"/></linearGradient></defs><polygon points="58,4 20,56 44,56 36,96 80,40 55,40" fill="url(#rc)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>'},
 dream:{c:['#FFC857','#FFFFFF','#8B7BFF'],h:['star','spark','dot'],m:'Maybe you will explore space one day!',l:'Inspired',s:'<defs><linearGradient id="rd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#C9CCFF"/></linearGradient></defs><path d="M44 74Q50 100 56 74Z" fill="#FFC857"/><path d="M50 6C72 22 74 54 66 72H34C26 54 28 22 50 6Z" fill="url(#rd)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="38" r="9" fill="#FF7A45" stroke="#14123A" stroke-width="3"/><path d="M34 60L18 80l18-4zM66 60l16 20-18-4z" fill="#FF7A45"/>'}};
Object.keys(RI).forEach(function(k){var e=RI[k],b=document.createElement('button');b.className='emo';
  b.innerHTML='<svg viewBox="0 0 100 100" aria-hidden="true">'+e.s+'</svg>'+e.l;
  b.onclick=function(){document.querySelectorAll('.emo').forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');$('emoMsg').textContent=e.m;
    var r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,e.c,e.h,34)};
  $('emos').appendChild(b)});

/* Quiz */
var Q=[{"q":"Which planet did both Pioneers visit?","o":["Jupiter","Mars","Neptune"],"a":0,"e":"Both made close flybys of Jupiter."},{"q":"How did Pioneer 11 reach a path toward Saturn?","o":["It landed on Jupiter","Jupiter’s gravity changed its trajectory","It followed a road"],"a":1,"e":"The Jupiter encounter redirected its journey."},{"q":"What do both spacecraft carry?","o":["A crew","Rock samples from Saturn","A message from humanity"],"a":2,"e":"Their metal plaques represent people and our cosmic address."}];
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
var ROVDEFS=$('gold').outerHTML+$('pan').outerHTML+$('pioneerCraft').outerHTML;
var SCENE={"up":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#F6F1FF\"><circle cx=\"23\" cy=\"21\" r=\"2\"/><circle cx=\"99\" cy=\"91\" r=\"1\"/><circle cx=\"179\" cy=\"22\" r=\"1.5\"/><circle cx=\"314\" cy=\"30\" r=\"2\"/><circle cx=\"408\" cy=\"177\" r=\"1.5\"/></g><g fill=\"#9C8D9B\"><path d=\"M107 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M150 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M193 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M236 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M279 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M322 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M365 28l9-5 8 8-6 9-11-3Z\"/><path d=\"M107 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M150 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M193 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M236 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M279 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M322 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M365 76l9-5 8 8-6 9-11-3Z\"/><path d=\"M107 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M150 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M193 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M236 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M279 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M322 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M365 124l9-5 8 8-6 9-11-3Z\"/><path d=\"M107 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M150 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M193 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M236 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M279 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M322 172l9-5 8 8-6 9-11-3Z\"/><path d=\"M365 172l9-5 8 8-6 9-11-3Z\"/></g><path d=\"M25 112L410 112\" stroke=\"#8FE3F5\" stroke-dasharray=\"4 6\" fill=\"none\"/><g><use href=\"#pioneerCraft\" x=\"12\" y=\"73\" width=\"93\" height=\"72.33333333333333\"/></g></svg>","run":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#F6F1FF\"><circle cx=\"23\" cy=\"21\" r=\"2\"/><circle cx=\"99\" cy=\"91\" r=\"1\"/><circle cx=\"179\" cy=\"22\" r=\"1.5\"/><circle cx=\"314\" cy=\"30\" r=\"2\"/><circle cx=\"408\" cy=\"177\" r=\"1.5\"/></g><g transform=\"translate(277 107)\"><circle r=\"79\" fill=\"#D59170\"/><path d=\"M-63.2 -31.6Q0 -15.8 63.2 -31.6M-76.63 0Q0 19.75 76.63 0M-63.2 31.6Q0 47.4 63.2 31.6\" stroke=\"#EACAA1\" stroke-width=\"12.64\" fill=\"none\"/><ellipse cx=\"23.7\" cy=\"23.7\" rx=\"18.96\" ry=\"10.27\" fill=\"#AF4E43\"/></g><g><use href=\"#pioneerCraft\" x=\"29\" y=\"34\" width=\"122\" height=\"94.88888888888889\"/></g><path d=\"M37 180Q201 215 379 48\" stroke=\"#8FE3F5\" stroke-dasharray=\"5 6\" fill=\"none\"/></svg>","water":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#F6F1FF\"><circle cx=\"23\" cy=\"21\" r=\"2\"/><circle cx=\"99\" cy=\"91\" r=\"1\"/><circle cx=\"179\" cy=\"22\" r=\"1.5\"/><circle cx=\"314\" cy=\"30\" r=\"2\"/><circle cx=\"408\" cy=\"177\" r=\"1.5\"/></g><g transform=\"translate(208 115)\"><circle r=\"48\" fill=\"#D59170\"/><path d=\"M-38.400000000000006 -19.200000000000003Q0 -9.600000000000001 38.400000000000006 -19.200000000000003M-46.56 0Q0 12 46.56 0M-38.400000000000006 19.200000000000003Q0 28.799999999999997 38.400000000000006 19.200000000000003\" stroke=\"#EACAA1\" stroke-width=\"7.68\" fill=\"none\"/><ellipse cx=\"14.399999999999999\" cy=\"14.399999999999999\" rx=\"11.52\" ry=\"6.24\" fill=\"#AF4E43\"/></g><g transform=\"translate(378 43)\"><ellipse rx=\"41.4\" ry=\"10.35\" fill=\"none\" stroke=\"#BDA477\" stroke-width=\"12\" transform=\"rotate(-20)\"/><circle r=\"23\" fill=\"#DFC18D\"/><path d=\"M-18.400000000000002 -9.200000000000001Q0 -4.6000000000000005 18.400000000000002 -9.200000000000001M-22.31 0Q0 5.75 22.31 0M-18.400000000000002 9.200000000000001Q0 13.799999999999999 18.400000000000002 9.200000000000001\" stroke=\"#BDA477\" stroke-width=\"3.68\" fill=\"none\"/></g><path d=\"M20 170Q230 210 265 119Q280 65 365 47\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\" stroke-dasharray=\"5 5\"/><g><use href=\"#pioneerCraft\" x=\"12\" y=\"119\" width=\"80\" height=\"62.22222222222222\"/></g></svg>","star":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#F6F1FF\"><circle cx=\"23\" cy=\"21\" r=\"2\"/><circle cx=\"99\" cy=\"91\" r=\"1\"/><circle cx=\"179\" cy=\"22\" r=\"1.5\"/><circle cx=\"314\" cy=\"30\" r=\"2\"/><circle cx=\"408\" cy=\"177\" r=\"1.5\"/></g><g transform=\"translate(264 107)\"><ellipse rx=\"115.2\" ry=\"28.8\" fill=\"none\" stroke=\"#BDA477\" stroke-width=\"12\" transform=\"rotate(-20)\"/><circle r=\"64\" fill=\"#DFC18D\"/><path d=\"M-51.2 -25.6Q0 -12.8 51.2 -25.6M-62.08 0Q0 16 62.08 0M-51.2 25.6Q0 38.4 51.2 25.6\" stroke=\"#BDA477\" stroke-width=\"10.24\" fill=\"none\"/></g><use href=\"#pioneerCraft\" x=\"28\" y=\"18\" width=\"117\" height=\"91\"/><ellipse cx=\"264\" cy=\"107\" rx=\"130\" ry=\"40\" transform=\"rotate(-20 264 107)\" fill=\"none\" stroke=\"#8FE3F5\" stroke-width=\"3\"/></svg>","gear":"<svg x=\"0\" y=\"0\" width=\"200\" height=\"110\" viewBox=\"0 0 440 210\" preserveAspectRatio=\"xMidYMid slice\"><rect width=\"440\" height=\"210\" fill=\"#1B1948\"/><g fill=\"#F6F1FF\"><circle cx=\"23\" cy=\"21\" r=\"2\"/><circle cx=\"99\" cy=\"91\" r=\"1\"/><circle cx=\"179\" cy=\"22\" r=\"1.5\"/><circle cx=\"314\" cy=\"30\" r=\"2\"/><circle cx=\"408\" cy=\"177\" r=\"1.5\"/></g><rect x=\"75\" y=\"24\" width=\"290\" height=\"163\" rx=\"9\" fill=\"#DCB56D\" stroke=\"#FFE7B6\" stroke-width=\"3\"/><g fill=\"none\" stroke=\"#725437\" stroke-width=\"2\"><circle cx=\"126\" cy=\"80\" r=\"5\"/><path d=\"M126 80l-31-17m31 17 22-33m-22 33 35 5m-35-5-14 33m14-33 32 28M197 121V73m0 15-16 20m16-20 16 20m-16 13-11 32m11-32 11 32M238 121V73m0 15-12 20m12-20 12 20m-12 13-10 32m10-32 10 32\"/><circle cx=\"197\" cy=\"63\" r=\"8\"/><circle cx=\"238\" cy=\"63\" r=\"8\"/><path d=\"M277 131h64M287 130v-16m12 16v-29m12 29v-39\"/></g><text x=\"220\" y=\"177\" text-anchor=\"middle\" fill=\"#725437\" font-family=\"Fredoka,sans-serif\" font-size=\"12\">A message from Earth · simplified illustration</text></svg>"};
var ICON={
 up:'<path d="M10 82 L40 34 L56 58 L68 44 L92 82Z" fill="#FFF6E5"/><path d="M40 34V12" stroke="#FFF6E5" stroke-width="5" stroke-linecap="round"/><path d="M40 12L64 20L40 28Z" fill="#FFC857"/>',
 run:'<circle cx="60" cy="52" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><circle cx="60" cy="52" r="7" fill="#FFF6E5"/><path d="M60 26V78M34 52H86M42 34L78 70M78 34L42 70" stroke="#FFF6E5" stroke-width="4"/><path d="M6 38h20M0 54h18M8 70h20" stroke="#FFC857" stroke-width="5" stroke-linecap="round"/>',
 water:'<circle cx="42" cy="42" r="26" fill="none" stroke="#FFF6E5" stroke-width="9"/><path d="M62 62L88 88" stroke="#FFF6E5" stroke-width="11" stroke-linecap="round"/><path d="M42 26C34 38 30 44 30 50a12 12 0 0 0 24 0C54 44 50 38 42 26Z" fill="#FFF6E5"/>',
 star:'<polygon points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFF6E5"/><path d="M82 8l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC857"/>',
 gear:(function(){var s='<circle cx="50" cy="50" r="22" fill="none" stroke="#FFF6E5" stroke-width="12"/><circle cx="50" cy="50" r="6" fill="#FFF6E5"/>';for(var i=0;i<8;i++)s+='<rect x="44" y="4" width="12" height="18" rx="3" fill="#FFF6E5" transform="rotate('+i*45+' 50 50)"/>';return s})()};
var BADGES=[{"k":"up","q":"Crossing the asteroid belt","t":"BELT TRAILBLAZER","c1":"#FF9A5B","c2":"#FF4D8D","st":[["Curiosity",99],["Care",97],["Discovery",94]],"a":"You enjoy exploring a route no one has tested before."},{"k":"run","q":"Seeing Jupiter up close","t":"GIANT PLANET SCOUT","c1":"#5EEAD4","c2":"#1FA36B","st":[["Curiosity",99],["Care",96],["Discovery",95]],"a":"You look closely at worlds full of surprises."},{"k":"water","q":"The gravity assist","t":"GRAVITY NAVIGATOR","c1":"#8EC5FF","c2":"#7B5CFF","st":[["Curiosity",99],["Care",95],["Discovery",96]],"a":"You appreciate clever ways to reach a new destination."},{"k":"star","q":"Saturn and its rings","t":"RING EXPLORER","c1":"#FFE27A","c2":"#FF9A3D","st":[["Curiosity",99],["Care",94],["Discovery",97]],"a":"You are drawn to the details of distant worlds."},{"k":"gear","q":"The message from Earth","t":"COSMIC MESSENGER","c1":"#D2B8FF","c2":"#8B5CF6","st":[["Curiosity",99],["Care",93],["Discovery",98]],"a":"You like sharing a little of who we are."}];
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
ICON.up="<path d=\"M10 80L50 15L90 80Z\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/><circle cx=\"50\" cy=\"58\" r=\"12\" fill=\"#FFF6E5\"/>";
ICON.run="<circle cx=\"50\" cy=\"50\" r=\"37\" fill=\"#FFF6E5\"/><path d=\"M18 42h64M20 62h60\" stroke=\"#E5B76E\" stroke-width=\"7\"/>";
ICON.water="<path d=\"M10 80Q80 100 70 40T95 15M78 15h17v17\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"7\"/>";
ICON.star="<circle cx=\"50\" cy=\"50\" r=\"25\" fill=\"#FFF6E5\"/><ellipse cx=\"50\" cy=\"50\" rx=\"46\" ry=\"16\" transform=\"rotate(-25 50 50)\" fill=\"none\" stroke=\"#FFF6E5\" stroke-width=\"6\"/>";
ICON.gear="<rect x=\"14\" y=\"20\" width=\"72\" height=\"60\" rx=\"7\" fill=\"#FFF6E5\"/><path d=\"M28 38h44M28 52h28M28 66h38\" stroke=\"#D1A76E\" stroke-width=\"6\"/>";
function csvg(b,anim){var id='c'+b.k,sp=function(x,y,s,d){return '<path'+(anim?' class="tw" style="animation-delay:'+d+'s"':'')+' transform="translate('+x+' '+y+') scale('+s+')" d="M0-10Q0 0 10 0Q0 0 0 10Q0 0-10 0Q0 0 0-10Z" fill="#FFF6C8"/>'};
  var fs=Math.min(27,Math.floor(250/(b.t.length*.62))),stars='';
  for(var i=0;i<3;i++)stars+='<polygon transform="translate('+(236+i*16)+' 28) scale(.15)" points="50,4 62,36 96,38 70,60 79,92 50,74 21,92 30,60 4,38 38,36" fill="#FFC857"/>';
  var rows='';b.st.forEach(function(s,j){var y=336+j*24;rows+='<text x="26" y="'+(y+4)+'" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" fill="#D8D2FF">'+s[0]+'</text><rect x="112" y="'+(y-4)+'" width="130" height="9" rx="4.5" fill="rgba(255,255,255,.16)"/><rect x="112" y="'+(y-4)+'" width="'+(s[1]*1.3)+'" height="9" rx="4.5" fill="url(#'+id+'f)"/><text x="274" y="'+(y+4)+'" text-anchor="end" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" fill="#fff">'+s[1]+'</text>'});
  return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 420" width="300" height="420" role="img" aria-label="'+b.t+' explorer card"><defs>'+ROVDEFS+'<linearGradient id="'+id+'f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset=".5" stop-color="#FFF6C8"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><linearGradient id="'+id+'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E6B"/><stop offset="1" stop-color="#120F38"/></linearGradient><linearGradient id="'+id+'m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+b.c1+'"/><stop offset="1" stop-color="'+b.c2+'"/></linearGradient><clipPath id="'+id+'c"><rect x="22" y="48" width="256" height="170" rx="16"/></clipPath></defs>'
  +'<rect width="300" height="420" rx="26" fill="url(#'+id+'f)"/><rect x="6" y="6" width="288" height="408" rx="21" fill="url(#'+id+'b)"/>'
  +'<text x="24" y="33" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="700" letter-spacing="3" fill="#FFC857">EXPLORER CARD</text>'+stars
  +'<g clip-path="url(#'+id+'c)"><svg x="22" y="48" width="256" height="170" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">'+SCENE[b.k]+'</svg></g><rect x="22" y="48" width="256" height="170" rx="16" fill="none" stroke="#FFF6E5" stroke-width="3"/>'
  +'<circle cx="150" cy="222" r="36" fill="url(#'+id+'m)" stroke="#FFF6E5" stroke-width="4"/><circle cx="150" cy="222" r="29" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.5" stroke-dasharray="2 5"/><g transform="translate(122 194) scale(.56)">'+ICON[b.k]+'</g>'
  +'<text x="150" y="290" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="'+fs+'" font-weight="700" fill="#FFF6E5">'+b.t+'</text><text x="150" y="311" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="'+b.c1+'">PIONEER EXPLORER</text>'
  +rows+'<text x="150" y="408" text-anchor="middle" font-family="Fredoka,Trebuchet MS,sans-serif" font-size="10" fill="rgba(255,255,255,.55)">NASA Pioneer 10 &amp; 11 · 1972–2003</text>'
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
    x.fillStyle='#FFF6E5';x.font='500 36px Fredoka, Trebuchet MS, sans-serif';x.fillText('Pioneer 10 & 11: Scouts of the Giant Planets',540,1430);
    cv.toBlob(function(bl){var f=new File([bl],'pioneer-card.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:'My Pioneer explorer card',text:'I unlocked the '+cur.t+' card!'}).catch(function(){})}
      else{var a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download='pioneer-card.png';a.click();msg.textContent='Your card picture was saved. Share it with your friends!'}})};
  img.onerror=function(){msg.textContent='Sorry, the picture could not be made. Try taking a screenshot instead!'};
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(csvg(cur,false));
};




/* Schematic activities; these are not trajectory simulations. */
var crossed=false,assisted=false;
function updateCrossing(){ $('beltCraft').closest('svg').classList.toggle('belt-crossed',crossed);$('crossBelt').textContent=crossed?'Replay the crossing':'Follow the crossing';$('beltInfo').textContent=crossed?'The spacecraft crossed successfully; the route was navigable.':'Would dust and small rocks endanger the spacecraft?'}
$('crossBelt').onclick=function(){crossed=!crossed;updateCrossing()};
function updateAssist(){ $('assistCraft').closest('svg').classList.toggle('assist-complete',assisted);$('swing').textContent=assisted?'Replay the gravity assist':'Follow the gravity assist';$('assistInfo').textContent=assisted?'A new direction: onward to Saturn!':'A moving planet can change a spacecraft’s path and speed.'}
$('swing').onclick=function(){assisted=!assisted;updateAssist()};
var tabMessages={jupiter:['Images revealed Jupiter’s clouds and Great Red Spot.','Particle measurements explored an intense radiation environment.','Pioneer 11 passed closer than its sister spacecraft.'],saturn:['Pioneer 11 discovered Saturn’s narrow F ring.','Its measurements confirmed a magnetic field at Saturn.','This was a passing visit, rather than an orbit or landing.'],plaque:['Human figures represent the people who built and sent the spacecraft.','The diagrams describe our origin using astronomical clues.','The plaque is a possible greeting, not evidence anyone has found it.']};
function setTab(key,n){document.querySelectorAll('[data-'+key+']').forEach(function(b){var on=Number(b.dataset[key])===n;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});$(key+'Info').textContent=tabMessages[key][n];if(key==='saturn'){var svg=$('ringHighlight').closest('svg');svg.classList.remove('saturn-1','saturn-2');if(n)svg.classList.add('saturn-'+n)}}
Object.keys(tabMessages).forEach(function(key){document.querySelectorAll('[data-'+key+']').forEach(function(b){b.onclick=function(){setTab(key,Number(b.dataset[key]))}})});
function resetActivities(){crossed=false;assisted=false;updateCrossing();updateAssist();Object.keys(tabMessages).forEach(function(k){setTab(k,0)});P3.sel=null;document.querySelectorAll('#pb .pbtn').forEach(function(b){b.classList.remove('on')});$('pinfo').textContent='Tap a name to explore the spacecraft.';if(P3.ready)Object.keys(P3.parts).forEach(function(k){P3.parts[k].traverse(function(m){if(m.isMesh){m.material.emissive.setHex(0);m.material.opacity=1;m.material.needsUpdate=true}})})}

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




