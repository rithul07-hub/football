(function(){
  "use strict";
  var kickerEl=document.getElementById('kicker'),numEl=document.getElementById('num'),
      countryEl=document.getElementById('country'),revealEl=document.getElementById('reveal'),
      finaleEl=document.getElementById('finale'),navEl=document.getElementById('archiveNav'),
      fallbackEl=document.getElementById('fallback'),fallbackListEl=document.getElementById('fallbackList');

  // ==== ARCHIVE DATA: to add a club, add ONE T(...) line. The engine below never changes. ====
  // T(category, nav code, name, number, main, accent, second, number colour, options)
  // pat: solid|stripes|center|chev  sw: pattern density  alt: pattern's 2nd colour slot (default 1)
  // colour slots 0 main / 1 accent / 2 second ->  sl sleeves, co collar, tr hem+cuff trim, pn side panels
  // sheen: fabric satin  atm: dust tint before formation  bands/radial/dark/exitDy/exitSpread: exit personality  camX/camY: camera emphasis
  var CATS=['NATIONALS','MLS','LA LIGA','PREMIER LEAGUE','SERIE A','BUNDESLIGA','LIGUE 1'];
  function T(cat,ab,name,num,c,a,s,nc,o){
    o=o||{}; o.cat=cat; o.ab=ab; o.country=name; o.num=num; o.color=c; o.accent=a; o.second=s; o.numc=nc;
    if(o.co==null)o.co=1; if(o.tr==null)o.tr=1; return o;
  }
  var identities=[
    T('NATIONALS','ARG','ARGENTINA','10',0x74b9e8,0xf4f6f8,0x2f6fb6,0x2f6fb6,{pat:'stripes',sw:2.4,exitDy:1,exitSpread:.35,atm:.12}),
    T('NATIONALS','BRA','BRAZIL','10',0xf2c94c,0x1f8a4c,0xd9a92c,0x15803d,{pat:'chev',sw:1.3,alt:2,radial:1,exitSpread:1.8,camX:1.2,sheen:.6}),
    T('NATIONALS','SPA','SPAIN','6',0xb3323f,0xd9b45a,0x1a2a4f,0xe6c56e,{pn:2,bands:1,exitSpread:.32}),
    T('NATIONALS','POR','PORTUGAL','7',0x9c1f2b,0x2f7a49,0x6a141e,0x4fae6c,{pat:'chev',sw:1.6,alt:2,dark:1,exitDy:-1.2,exitSpread:.15,camY:1,sheen:.4}),
    T('NATIONALS','FRA','FRANCE','10',0x3a5a8c,0xc0392b,0x1f3766,0xf2f4f7,{pn:2,exitSpread:.3}),
    T('MLS','MIA','INTER MIAMI','10',0xf4a9c0,0x141416,0xe58fab,0x141416,{pat:'stripes',sw:4.2,alt:2,atm:.3,sheen:.4,exitDy:.6,exitSpread:.5}),
    T('LA LIGA','BAR','FC BARCELONA','10',0x1c3f94,0xa50044,0xe8c14a,0xe8c14a,{pat:'stripes',sw:1.5,co:2,tr:2,bands:1,exitSpread:.3}),
    T('LA LIGA','RMA','REAL MADRID','7',0xf3f1ec,0xd4af5a,0xb9c0cb,0x22305e,{pn:2,sheen:.95,atm:.04,camY:.5,exitSpread:.25,exitDy:.4}),
    T('PREMIER LEAGUE','MCI','MANCHESTER CITY','10',0x8bc4ec,0x16305c,0xa9d6f4,0x16305c,{pat:'stripes',sw:5,alt:2,exitDy:-.7,exitSpread:.25,sheen:.55}),
    T('PREMIER LEAGUE','MUN','MANCHESTER UNITED','7',0xc8202f,0x111114,0xf1efe9,0xf1efe9,{pn:1,radial:1,exitSpread:1.2,sheen:.45}),
    T('PREMIER LEAGUE','LIV','LIVERPOOL','11',0xa4121f,0xf3efe9,0x7a0d18,0xf3efe9,{pat:'stripes',sw:1.2,alt:2,exitSpread:.5,sheen:.4}),
    T('PREMIER LEAGUE','ARS','ARSENAL','7',0xd2232a,0xf3efe9,0x14204a,0xf3efe9,{sl:1,tr:2,exitSpread:.3,sheen:.55}),
    T('PREMIER LEAGUE','CHE','CHELSEA','8',0x1e46a6,0xf3f5f8,0x173b8a,0xf3f5f8,{pat:'chev',sw:1.4,alt:2,radial:1,exitSpread:1}),
    T('PREMIER LEAGUE','TOT','TOTTENHAM HOTSPUR','10',0xf1efe9,0x14204a,0x6f9fd8,0x14204a,{pn:2,exitSpread:.3}),
    T('SERIE A','MIL','AC MILAN','9',0xc2151f,0x0d0d10,0xf1efe9,0xf1efe9,{pat:'stripes',sw:1.8,co:2,tr:2,dark:1,bands:1,exitSpread:.4,sheen:.35}),
    T('SERIE A','INT','INTER MILAN','10',0x1f6fe0,0x0d0d12,0xf0d36a,0xf1efe9,{pat:'stripes',sw:1.8,co:2,tr:2,exitDy:1.4,exitSpread:.18,sheen:.55}),
    T('SERIE A','JUV','JUVENTUS','7',0xf1efe9,0x0d0d10,0xb9bdc5,0xd9b45a,{pat:'stripes',sw:2,co:2,tr:2,bands:1,exitSpread:.35,sheen:.4}),
    T('BUNDESLIGA','BAY','BAYERN MUNICH','9',0xc0142a,0xf3efe9,0x8a0f1e,0xf3efe9,{pn:2,radial:1,exitSpread:1.5}),
    T('BUNDESLIGA','BVB','BORUSSIA DORTMUND','11',0xfbd10a,0x0d0d10,0x3a3a40,0x0d0d10,{sl:1,pn:2,radial:1,exitSpread:1.9,camX:-1}),
    T('LIGUE 1','PSG','PARIS SAINT-GERMAIN','10',0x14234f,0xd7263d,0xf3efe9,0xf3efe9,{pat:'center',tr:2,finalEdition:1})
  ];
  var SEGS=identities.length+0.6, RX=1.05, RZ=0.42, SEG_VH=170;
  document.querySelector('.spacer').style.height=(SEGS*SEG_VH+100)+'vh';
  var numberCache={},slotCache={},pal=new Float32Array(9);
  // pure black would vanish against the black void: lift near-black club colours to a readable charcoal (hue kept)
  function lift(c){ var y=0.3*c[0]+0.59*c[1]+0.11*c[2],g=y<0.22?Math.min(4.5,0.22/(y+0.001)):1; return [c[0]*g,c[1]*g,c[2]*g]; }
  function wf(y){ return 1-0.11*Math.exp(-Math.pow((y+0.3)/0.55,2)); }   // athletic waist taper
  function zf(y){ return 1+0.16*Math.exp(-Math.pow((y-0.5)/0.6,2)); }    // convex chest volume

  function showFallback(){
    fallbackEl.style.display='flex';
    fallbackListEl.innerHTML=identities.map(function(id,i){return (i+1)+'. '+id.country+' — N°'+id.num;}).join('<br>');
  }
  if(typeof THREE==='undefined'){ showFallback(); return; }

  var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile=window.innerWidth<700;
  var COUNT=isMobile?1500:6000;
  var NUMSTART=Math.round(COUNT*0.78), NUMCOUNT=COUNT-NUMSTART;
  var baseSize=isMobile?0.11:0.058;

  var renderer,scene,camera,points,pmat,geo,positions,targets,homes,ords,roles,stripe,nrms,texs,zones,colorsArr,seeds,scs,sns,ready=false;
  var mouseX=0,mouseY=0,mx=0,my=0,activeIdx=-1,sp=0,userRot=0,rotVel=0,inspectReady=false;
  var pDown=false,pAxis=null,pStartX=0,pStartY=0,dragLastX=0,lastMoveT=0;
  var hud={fin:false,kick:false,rev:false};
  var tmpC=new THREE.Color();

  function ss(a,b,x){ var t=(x-a)/(b-a); t=t<0?0:(t>1?1:t); return t*t*(3-2*t); }

  function buildShell(n){
    var pts=new Float32Array(n*3),nrm=new Float32Array(n*3),tex=new Float32Array(n),ord=new Float32Array(n),
        role=new Uint8Array(n),zone=new Uint8Array(n),strp=new Uint8Array(n);
    for(var i=0;i<n;i++){
      var r=Math.random(),x,y,z,nx,ny=0,nz,ro=0,zn=0,wr=0,seam=0;
      if(r<0.66){                                    // torso: tapered body, curved hem, side seams
        var th,w;
        do{ th=Math.random()*6.2832; var a=RX*Math.cos(th),b=RZ*Math.sin(th); w=Math.sqrt(a*a+b*b)/RX; }while(Math.random()>w);
        if(Math.random()<0.07){ th=(Math.random()<0.5?1.5708:4.7124)+(Math.random()-0.5)*0.05; seam=1; }
        var sv=Math.sin(th),cv=Math.cos(th),xx=RX*sv;
        var top=Math.abs(xx)<0.42?1.1:1.32-0.3*Math.min(1,Math.abs(xx)/RX);
        var hem=-0.85+0.08*sv*sv;                    // hem rises slightly at the sides
        y=hem+Math.random()*(top-hem);
        var wk=wf(y),zk=zf(y);
        x=RX*wk*sv; z=RZ*zk*cv; nx=sv/(RX*wk); nz=cv/(RZ*zk);
        ro=y<hem+0.09?1:0;
        if(ro){ x*=1.012; z*=1.03; }                 // hem roll = double-layer thickness
        wr=Math.max(0,Math.sin(y*26+sv*4))*sv*sv*0.55+Math.max(0,Math.sin(xx*34))*Math.max(0,1-(y-hem)/0.35)*0.5;
      } else if(r<0.95){                             // sleeves: tapered, reinforced cuff, underarm folds
        var sd=Math.random()<0.5?-1:1,tt=Math.random(),ph=Math.random()*6.2832;
        var sx=sd*0.98,sy=0.86,ex=sd*1.78,ey=0.2;
        var dx=ex-sx,dy=ey-sy,dl=Math.sqrt(dx*dx+dy*dy),cph=Math.cos(ph);
        ro=tt>0.88?1:0; zn=1;
        var rad=0.33-0.07*tt+(ro?0.012:0);
        x=sx+dx*tt+rad*cph*(-dy/dl); y=sy+dy*tt+rad*cph*(dx/dl); z=rad*Math.sin(ph);
        nx=cph*(-dy/dl); ny=cph*(dx/dl); nz=Math.sin(ph);
        seam=tt<0.05?1:0;
        wr=Math.max(0,Math.sin(tt*34+ph*2))*(0.5-0.5*cph*sd)*(1-tt);
      } else {                                       // collar: rolled tube with inner + outer edge
        var cth=Math.random()*6.2832,tp=Math.random()*6.2832,cc=Math.cos(cth),cn=Math.sin(cth);
        nx=cc*Math.cos(tp); ny=Math.sin(tp); nz=cn*Math.cos(tp);
        x=0.42*cc+0.05*nx; y=1.15+0.05*ny; z=0.36*cn+0.05*nz; ro=1; zn=2;
        wr=-0.4*(Math.floor(cth*40)&1);              // rib knit
      }
      var nl=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;
      pts[i*3]=x; pts[i*3+1]=y; pts[i*3+2]=z;
      nrm[i*3]=nx/nl; nrm[i*3+1]=ny/nl; nrm[i*3+2]=nz/nl;
      role[i]=ro; zone[i]=zn; strp[i]=Math.floor((x+2.2)*2.4)&1;
      tex[i]=(0.93+Math.random()*0.07+(((Math.floor(x*46)+Math.floor(y*46))&1)*0.03))*(1-0.24*wr)*(seam?1.14:1);
      ord[i]=Math.min(1,Math.max(0,(1.4-y)/2.4+(Math.random()-0.5)*0.1));
    }
    return {pts:pts,nrm:nrm,tex:tex,ord:ord,role:role,zone:zone,strp:strp};
  }

  // per-identity colour slot for every particle: pattern + panel/sleeve/collar/trim rules (cached)
  function getSlots(idx){
    if(slotCache[idx]) return slotCache[idx];
    var d=identities[idx],s=new Uint8Array(COUNT),alt=d.alt||1,sw=d.sw||2.4;
    for(var i=0;i<COUNT;i++){
      var X=targets[i*3],Y=targets[i*3+1],zn=zones[i],v=0;
      if(d.pat==='stripes') v=(Math.floor((X+2.2)*sw)&1)?alt:0;
      else if(d.pat==='chev') v=(Math.floor((Math.abs(X)*1.5-Y*1.7+5)*sw*0.6)&1)?alt:0;
      else if(d.pat==='center') v=(Math.abs(X)<0.13&&zn===0)?1:0;
      if(d.pn!=null && zn===0 && Math.abs(X)>0.78) v=d.pn;
      if(zn===1 && d.sl!=null) v=d.sl;
      if(roles[i]===1) v=(zn===2)?d.co:d.tr;
      s[i]=v;
    }
    return (slotCache[idx]=s);
  }

  function buildGlyphTargets(text,n){
    var c=document.createElement('canvas'); c.width=256; c.height=160;
    var ctx=c.getContext('2d');
    ctx.fillStyle='#000'; ctx.fillRect(0,0,256,160);
    ctx.fillStyle='#fff'; ctx.font='bold 150px Helvetica, Arial, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(text,128,84);
    var data=ctx.getImageData(0,0,256,160).data,cand=[],x0=999,x1=-1,y0=999,y1=-1;
    for(var y=0;y<160;y+=2){ for(var x=0;x<256;x+=2){
      if(data[(y*256+x)*4]>128){ cand.push(x,y); if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
    } }
    var cnt=cand.length/2,mx0=(x0+x1)/2,my0=(y0+y1)/2,S=0.0066;
    var f=new Float32Array(n*3),b=new Float32Array(n*3);
    for(var k=0;k<n;k++){
      var pk=cnt?Math.min(cnt-1,Math.floor((k+Math.random())*cnt/n)):0;
      var cx=cnt?cand[pk*2]+Math.random()*2-1:mx0,cy=cnt?cand[pk*2+1]+Math.random()*2-1:my0;
      var gx=(cx-mx0)*S,gy=(my0-cy)*S+0.3,kk=RX*wf(gy),zs=RZ*zf(gy)*Math.sqrt(Math.max(0,1-(gx/kk)*(gx/kk)))+0.035;
      f[k*3]=gx; f[k*3+1]=gy; f[k*3+2]=zs;
      b[k*3]=-gx; b[k*3+1]=gy; b[k*3+2]=-zs;
    }
    return {f:f,b:b};
  }
  function getNumberTargets(idx){
    if(!numberCache[idx]) numberCache[idx]=buildGlyphTargets(identities[idx].num,NUMCOUNT);
    return numberCache[idx];
  }

  function makeSprite(){
    var c=document.createElement('canvas'); c.width=c.height=32;
    var ctx=c.getContext('2d');
    var g=ctx.createRadialGradient(16,16,0,16,16,16);
    g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.55,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,32,32);
    return new THREE.CanvasTexture(c);
  }

  function goTo(i){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    window.scrollTo({top:max*((i+0.9)/SEGS),behavior:'smooth'});
  }
  function buildNav(){
    CATS.forEach(function(cat){
      var box=document.createElement('div'),head=document.createElement('button'),list=document.createElement('div'),first=-1;
      box.className='cat'; box.dataset.cat=cat; head.className='ch'; head.textContent=cat; list.className='eds';
      identities.forEach(function(id,i){
        if(id.cat!==cat) return;
        if(first<0) first=i;
        var b=document.createElement('button'); b.className='ed';
        b.textContent=String(i+1).padStart(2,'0')+' — '+id.ab;
        b.addEventListener('click',function(){ goTo(i); });
        list.appendChild(b);
      });
      head.addEventListener('click',function(){ goTo(first); });
      box.appendChild(head); box.appendChild(list); navEl.appendChild(box);
    });
  }

  function onResize(){
    if(!renderer) return;
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  }
  function onMouse(e){ mouseX=(e.clientX/window.innerWidth-0.5); mouseY=(e.clientY/window.innerHeight-0.5); }
  function frameProgress(){
    var max=document.documentElement.scrollHeight-window.innerHeight;
    return max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
  }

  function updateHUD(idx,localP){
    var id=identities[idx];
    if(idx!==activeIdx){
      activeIdx=idx;
      var cats=navEl.querySelectorAll('.cat'),eds=navEl.querySelectorAll('.ed'),j;
      for(j=0;j<cats.length;j++){
        var on=cats[j].dataset.cat===id.cat; cats[j].classList.toggle('active',on);
        if(on && navEl.scrollWidth>navEl.clientWidth) navEl.scrollTo({left:cats[j].offsetLeft-24,behavior:'smooth'});
      }
      for(j=0;j<eds.length;j++) eds[j].classList.toggle('active',j===idx);
      kickerEl.textContent=String(idx+1).padStart(2,'0')+' — '+id.country;
      countryEl.textContent=id.country; numEl.textContent='EDITION '+id.num+' — '+id.cat;
    }
    var fin=!!id.finalEdition && localP>1.3;
    var kick=!fin && localP<0.42;
    var rev=!fin && localP>0.8 && localP<(id.finalEdition?1.2:0.97);
    if(fin!==hud.fin){ hud.fin=fin; finaleEl.classList.toggle('show',fin); }
    if(kick!==hud.kick){ hud.kick=kick; kickerEl.classList.toggle('show',kick); }
    if(rev!==hud.rev){ hud.rev=rev; revealEl.classList.toggle('show',rev); }
  }

  function init(){
    try{ renderer=new THREE.WebGLRenderer({canvas:document.getElementById('scene'),antialias:true}); }
    catch(e){ showFallback(); return; }
    try{
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
      renderer.setSize(window.innerWidth,window.innerHeight);
      scene=new THREE.Scene();
      camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,100);
      camera.position.set(0,0.1,9);

      identities.forEach(function(d){
        tmpC.set(d.color); d.m=lift([tmpC.r,tmpC.g,tmpC.b]);
        tmpC.set(d.accent); d.a=lift([tmpC.r,tmpC.g,tmpC.b]);
        tmpC.set(d.numc); d.n=lift([tmpC.r,tmpC.g,tmpC.b]);
        tmpC.set(d.second); d.s=lift([tmpC.r,tmpC.g,tmpC.b]);
      });

      var sh=buildShell(COUNT);
      targets=sh.pts; ords=sh.ord; roles=sh.role; stripe=sh.strp; nrms=sh.nrm; texs=sh.tex; zones=sh.zone;
      homes=new Float32Array(COUNT*3); seeds=new Float32Array(COUNT); scs=new Float32Array(COUNT); sns=new Float32Array(COUNT);
      for(var i=0;i<COUNT;i++){
        homes[i*3]=(Math.random()-0.5)*10; homes[i*3+1]=(Math.random()-0.5)*6.5; homes[i*3+2]=(Math.random()-0.5)*6;
        seeds[i]=Math.random()*6.2832; scs[i]=Math.cos(seeds[i]); sns[i]=Math.sin(seeds[i]);
      }
      positions=new Float32Array(homes); colorsArr=new Float32Array(COUNT*3);
      geo=new THREE.BufferGeometry();
      geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
      geo.setAttribute('color',new THREE.BufferAttribute(colorsArr,3));
      pmat=new THREE.PointsMaterial({size:baseSize,map:makeSprite(),vertexColors:true,alphaTest:0.3,depthWrite:true,sizeAttenuation:true});
      points=new THREE.Points(geo,pmat);
      points.frustumCulled=false;
      scene.add(points);

      buildNav();
      document.getElementById('finaleTop').textContent=identities.length+' IDENTITIES. ONE FORM.';
      for(var q=0;q<identities.length;q++) getSlots(q);
      window.addEventListener('resize',onResize);
      window.addEventListener('mousemove',onMouse);
      window.addEventListener('pointerdown',onPointerDown,{passive:true});
      window.addEventListener('pointermove',onPointerMove,{passive:false});
      window.addEventListener('pointerup',onPointerUp,{passive:true});
      window.addEventListener('pointercancel',onPointerUp,{passive:true});
      ready=true;
      requestAnimationFrame(animate);
    }catch(err){ if(window.console) console.error(err); showFallback(); }
  }

  function onPointerDown(e){
    if(!inspectReady) return;
    pDown=true; pAxis=null; pStartX=e.clientX; pStartY=e.clientY; dragLastX=e.clientX; rotVel=0;
  }
  function onPointerMove(e){
    if(!pDown) return;
    var dx=e.clientX-pStartX,dy=e.clientY-pStartY;
    if(pAxis===null && (Math.abs(dx)>6||Math.abs(dy)>6)) pAxis=Math.abs(dx)>Math.abs(dy)?'x':'y';
    if(pAxis==='x'){
      if(e.cancelable) e.preventDefault();
      var step=e.clientX-dragLastX;
      userRot+=step*0.006; rotVel=Math.max(-0.1,Math.min(0.1,step*0.006)); dragLastX=e.clientX; lastMoveT=performance.now();
    }
  }
  function onPointerUp(){ if(performance.now()-lastMoveT>90) rotVel=0; pDown=false; pAxis=null; }

  function animate(){
    requestAnimationFrame(animate);
    if(!ready) return;
    var rm=reduceMotion,n=identities.length,p=frameProgress();
    sp+=(p-sp)*(rm?0.3:0.09);
    var energy=rm?0:Math.min(1,Math.abs(p-sp)*40);
    var seg=sp*SEGS,idx=Math.min(n-1,Math.floor(seg)),localP=seg-idx;
    var id=identities[idx],fin=!!id.finalEdition;
    updateHUD(idx,localP);
    inspectReady=localP>=0.86 && (fin||localP<0.97);

    var dis=fin?0:ss(0.93,1,localP);
    var asm=ss(0.18,0.5,localP)*(1-dis);
    var chroma=ss(0.3,0.62,localP)*(1-(fin?0:ss(0.94,1,localP)));
    var bri=(0.3+0.7*ss(0.05,0.45,localP))*(1-0.65*dis);
    var numT=ss(0.62,0.78,localP)*(1-(fin?0:ss(0.93,0.98,localP)));
    var finT=fin?ss(0.9,1.5,localP):0;
    var xid=id,xt=dis;
    if(idx>0 && localP<0.16){ xid=identities[idx-1]; xt=1-ss(0,0.16,localP); }

    var k=bri*(xid.dark?1-0.85*xt:1),NEU=0.72,m=id.m,a=id.a,nn=id.n,sc=id.s,at=id.atm==null?0.1:id.atm;
    var n0=NEU+(m[0]-NEU)*at,n1=NEU+(m[1]-NEU)*at,n2=NEU+(m[2]-NEU)*at;      // dust carries a hint of the coming identity
    pal[0]=(n0+(m[0]-n0)*chroma)*k; pal[1]=(n1+(m[1]-n1)*chroma)*k; pal[2]=(n2+(m[2]-n2)*chroma)*k;
    pal[3]=(n0+(a[0]-n0)*chroma)*k; pal[4]=(n1+(a[1]-n1)*chroma)*k; pal[5]=(n2+(a[2]-n2)*chroma)*k;
    pal[6]=(n0+(sc[0]-n0)*chroma)*k; pal[7]=(n1+(sc[1]-n1)*chroma)*k; pal[8]=(n2+(sc[2]-n2)*chroma)*k;
    var nr=(n0+(nn[0]-n0)*chroma)*k,ng=(n1+(nn[1]-n1)*chroma)*k,nb=(n2+(nn[2]-n2)*chroma)*k;

    var t=performance.now()*0.00035;
    var noiseAmp=rm?0:(0.006+0.02*(1-asm))*(1+energy*3);
    var arcK=rm?0.5:1.4;
    var ex=(xid.exitSpread||0)*xt*(rm?0.4:1),edy=(xid.exitDy||0)*xt*(rm?0.4:1);
    var bump=rm?0:Math.sin(numT*Math.PI)*0.16;
    var numTgt=numT>0.001?getNumberTargets(idx):null;
    var slots=getSlots(idx),sheen=id.sheen==null?0.5:id.sheen,br=rm?0:0.012*asm*(1-dis);
    // light rig in object space: soft key (upper-left front), cool rim (back right), view axis
    var ry=points.rotation.y,cy=Math.cos(ry),sy=Math.sin(ry);
    var kx=-0.45*cy-0.65*sy,kz=-0.45*sy+0.65*cy,rx=0.85*cy+0.5*sy,rz=0.85*sy-0.5*cy;
    var posArr=geo.attributes.position.array,colArr=geo.attributes.color.array;

    for(var i=0;i<COUNT;i++){
      var ix=i*3,s=seeds[i],cs=scs[i],sn=sns[i],o=ords[i]*0.55;
      var pull=ss(o,o+0.45,asm);
      var dxv=0,dyv=0,dzv=0;
      if(!rm){ dxv=Math.sin(t*1.1+s*3); dyv=Math.cos(t*0.9+s*2); dzv=Math.sin(t*0.7+s); }
      var hx=homes[ix]+dxv*0.28,hy=homes[ix+1]+dyv*0.28,hz=homes[ix+2]+dzv*0.28;
      var tx=hx+(targets[ix]-hx)*pull,ty=hy+(targets[ix+1]-hy)*pull,tz=hz+(targets[ix+2]-hz)*pull;
      var arc=pull*(1-pull)*arcK;
      tx+=cs*arc; ty+=sn*arc; tz+=cs*sn*arc*2;

      var nx=nrms[ix],ny=nrms[ix+1],nz=nrms[ix+2],isNum=numTgt!==null && i>=NUMSTART;
      if(isNum){
        nx-=nx*numT; ny-=ny*numT; nz+=(((i&1)?-1:1)-nz)*numT;     // number lies flat on the surface
        var li=(i-NUMSTART)*3,nt=(i&1)?numTgt.b:numTgt.f;
        tx+=(nt[li]-tx)*numT+bump*cs;
        ty+=(nt[li+1]-ty)*numT+bump*sn;
        tz+=(nt[li+2]-tz)*numT;
      }
      if(br!==0){ var bb=br*Math.sin(t*3.1+s+ty*1.4); tx+=nx*bb; ty+=ny*bb; tz+=nz*bb; }   // breathing / fabric settling
      if(xt>0.001){
        if(xid.bands){ ty+=(stripe[i]?1:-1)*ex*2.2; }
        else if(xid.radial){ var rl=Math.sqrt(tx*tx+ty*ty)+0.05; tx+=tx/rl*ex; ty+=ty/rl*ex; tz+=sn*ex*0.3; }
        else { tx+=cs*ex; ty+=sn*ex*0.4; }
        ty+=edy;
      }
      posArr[ix]  +=(tx+dxv*noiseAmp-posArr[ix])*0.07;
      posArr[ix+1]+=(ty+dyv*noiseAmp-posArr[ix+1])*0.07;
      posArr[ix+2]+=(tz+dzv*noiseAmp*0.5-posArr[ix+2])*0.07;

      var pi=slots[i]*3,cr=pal[pi],cg=pal[pi+1],cb=pal[pi+2];
      if(isNum){ cr+=(nr-cr)*numT; cg+=(ng-cg)*numT; cb+=(nb-cb)*numT; }
      // fabric lighting: key + cool rim + low fill, modulated by static weave / seams / wrinkles
      var dk=nx*kx+ny*0.62+nz*kz,dr=nx*rx+ny*0.25+nz*rz,vd=nz*cy-nx*sy,fr=1-(vd<0?-vd:vd);
      if(dk<0)dk=0; if(dr<0)dr=0;
      var rim=dr*fr*fr*sheen,lum=1+((0.42+0.75*dk+0.5*rim)*texs[i]-1)*pull;
      cr*=lum; cg*=lum; cb=cb*lum+0.1*rim*pull;
      colArr[ix]  +=(cr-colArr[ix])*0.1;
      colArr[ix+1]+=(cg-colArr[ix+1])*0.1;
      colArr[ix+2]+=(cb-colArr[ix+2])*0.1;
    }
    geo.attributes.position.needsUpdate=true;
    geo.attributes.color.needsUpdate=true;
    pmat.size=baseSize*(0.6+0.4*asm);

    if(!pDown||pAxis!=='x') rotVel*=rm?0.8:0.9;
    if(!inspectReady && !pDown) userRot+=(Math.round(userRot/6.2832)*6.2832-userRot)*0.05;
    userRot+=rotVel;
    var orbit=(xid.radial?1.1*xt:0)+finT*6.2832;
    points.rotation.y=(rm?0:Math.sin(t*1.3)*0.2)+userRot+orbit*(rm?0.3:1);

    if(!rm){ mx+=(mouseX*0.4-mx)*0.03; my+=(-mouseY*0.3-my)*0.03; }
    var prog=ss(0.1,0.9,localP)-0.5,cm=rm?0.3:1;
    var fit=Math.max(4,3.9/(0.8284*camera.aspect));
    var mac=rm?0:ss(0.44,0.54,localP)*(1-ss(0.6,0.7,localP));      // brief textile close-up while seams settle
    camera.position.set(mx+(id.camX||0)*prog*cm,0.1+my+(id.camY||0)*prog*cm+0.3*mac,fit*(1+0.5*(1-asm)-0.1*numT+1.4*finT-0.3*mac));
    camera.lookAt(0,0.12+0.5*mac,0);
    renderer.render(scene,camera);
  }

  init();
})();
