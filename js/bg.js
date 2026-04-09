const PERF = {
  active: !document.hidden,
  starFPS: 32,
  auxFPS: 24,
  maxDpr: window.innerWidth > 1200 ? 1.25 : 1.4,
  staticDpr: window.innerWidth > 1200 ? 1.0 : 1.2
};
document.addEventListener('visibilitychange', () => { PERF.active = !document.hidden; });
function frameLimiter(fps){ return 1000 / fps; }

// ── NEBULA / SPACE DUST ──
const nebulaCanvas=document.createElement('canvas');
nebulaCanvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
document.body.appendChild(nebulaCanvas);
const nebulaCtx=nebulaCanvas.getContext('2d');
function buildNebula(){
  const W=window.innerWidth,H=window.innerHeight;
  const dpr=Math.min(window.devicePixelRatio||1, PERF.staticDpr);
  nebulaCanvas.width=Math.round(W*dpr);nebulaCanvas.height=Math.round(H*dpr);
  nebulaCtx.setTransform(dpr,0,0,dpr,0,0);
  nebulaCtx.clearRect(0,0,W,H);
  const bands=[
    {cx:0.3,cy:0.25,rx:0.5,ry:0.25,density:1.0,hue:260},
    {cx:0.7,cy:0.55,rx:0.45,ry:0.3,density:0.8,hue:240},
    {cx:0.2,cy:0.7,rx:0.35,ry:0.2,density:0.6,hue:270},
    {cx:0.8,cy:0.2,rx:0.3,ry:0.22,density:0.5,hue:250},
  ];
  const dustCount=Math.round((W*H)/420);
  for(let i=0;i<dustCount;i++){
    const band=bands[Math.floor(Math.random()*bands.length)];
    const ang=Math.random()*Math.PI*2;
    const dist=Math.pow(Math.random(),0.6);
    const px=(band.cx+Math.cos(ang)*band.rx*dist+(Math.random()-0.5)*0.15)*W;
    const py=(band.cy+Math.sin(ang)*band.ry*dist+(Math.random()-0.5)*0.1)*H;
    if(px<0||px>W||py<0||py>H)continue;
    const size=Math.random()*1.1;
    const alpha=(0.04+Math.random()*0.18)*band.density;
    const hue=band.hue+(Math.random()-0.5)*30;
    nebulaCtx.beginPath();nebulaCtx.arc(px,py,size,0,Math.PI*2);
    nebulaCtx.fillStyle=`hsla(${hue},${25+Math.random()*30}%,${60+Math.random()*30}%,${alpha})`;
    nebulaCtx.fill();
  }
}
buildNebula();
window.addEventListener('resize',buildNebula);

// ── STARFIELD ──
const HERO_TIER_MIN=0.992,BRIGHT_TIER_MIN=0.965,STANDARD_TIER_MIN=0.84;
const FLASH_MIN_INTERVAL=180,FLASH_MAX_INTERVAL=300,FLASH_RISE_DURATION=80;
const starfieldCanvas = document.createElement('canvas');
starfieldCanvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
document.body.appendChild(starfieldCanvas);
const starfieldCtx = starfieldCanvas.getContext('2d');
let sfScale=1;
function resizeSF(){
  const W=window.innerWidth,H=window.innerHeight;
  sfScale=Math.min(window.devicePixelRatio||1, PERF.maxDpr);
  starfieldCanvas.width=Math.round(W*sfScale);starfieldCanvas.height=Math.round(H*sfScale);
  starfieldCtx.setTransform(sfScale,0,0,sfScale,0,0);
}
resizeSF();
window.addEventListener('resize',resizeSF);
const NUM_STARS=window.innerWidth>1200?138:window.innerWidth>768?128:96,BASE_SPEED=0.18,DEPTH=800;
const CLUSTER_COUNT = Math.max(5, Math.round((window.innerWidth * window.innerHeight) / 180000));
let starClusters = [];
function rebuildStarClusters(){
  starClusters = Array.from({length:CLUSTER_COUNT},()=>({
    x: Math.random()*starfieldCanvas.width,
    y: Math.random()*starfieldCanvas.height,
    strength: 0.75 + Math.random()*0.55,
    radius: Math.min(starfieldCanvas.width,starfieldCanvas.height)*(0.12 + Math.random()*0.12)
  }));
}
rebuildStarClusters();
window.addEventListener('resize',rebuildStarClusters);
let sfLastScrollY=window.scrollY,sfScrollSpeed=0,sfTargetSpeed=0;
window.addEventListener('scroll',()=>{
  const delta=Math.abs(window.scrollY-sfLastScrollY);
  sfTargetSpeed=BASE_SPEED+delta*0.08;
  sfLastScrollY=window.scrollY;
},{passive:true});
let vpY=0;
function spawnPoint(W=starfieldCanvas.width,H=starfieldCanvas.height){
  const zoneRoll=Math.random();
  let x=(Math.random()-0.5)*W*2;
  let y=(Math.random()-0.5)*H*2;
  if(zoneRoll<0.72){
    const zx=Math.random();
    const zy=Math.random();
    const zoneWeights=[
      {x:0.2,y:0.22,w:0.86},
      {x:0.78,y:0.24,w:1.16},
      {x:0.24,y:0.72,w:1.04},
      {x:0.76,y:0.72,w:0.9},
      {x:0.52,y:0.48,w:1.12}
    ];
    const weighted=zoneWeights.reduce((acc,z)=>acc+z.w,0);
    let pick=Math.random()*weighted;
    let zone=zoneWeights[0];
    for(const z of zoneWeights){ pick-=z.w; if(pick<=0){ zone=z; break; } }
    x=(zone.x+(Math.random()-0.5)*0.42-0.5)*W*2;
    y=(zone.y+(Math.random()-0.5)*0.42-0.5)*H*2;
  }
  if(Math.random()<0.16 && starClusters.length){
    const c = starClusters[Math.floor(Math.random()*starClusters.length)];
    x = (c.x + (Math.random()-0.5)*c.radius - W/2) * 2;
    y = (c.y + (Math.random()-0.5)*c.radius - H/2) * 2;
  }
  return {x,y};
}
function makeStar(){
  const paletteRoll=Math.random();
  let col;
  if(paletteRoll>0.95)col=[255,224,152];
  else if(paletteRoll>0.84)col=[188+Math.floor(Math.random()*32),206+Math.floor(Math.random()*26),255];
  else col=[255,255,255];

  const classRoll=Math.random();
  let tier='dust',sizeMul=0.62,glowMul=0.0,diffraction=0.0,baseAlpha=0.66,maxRadius=0.9;
  if(classRoll>HERO_TIER_MIN){
    tier='hero';sizeMul=1.15;glowMul=window.innerWidth<520?1.45:1.62;diffraction=1.0;baseAlpha=window.innerWidth<520?0.92:0.98;maxRadius=window.innerWidth<520?2.0:2.35;
  }else if(classRoll>BRIGHT_TIER_MIN){
    tier='bright';sizeMul=0.95;glowMul=window.innerWidth<520?0.82:1.16;diffraction=window.innerWidth<520?0.68:0.8;baseAlpha=window.innerWidth<520?0.82:0.92;maxRadius=window.innerWidth<520?1.72:1.95;
  }else if(classRoll>STANDARD_TIER_MIN){
    tier='standard';sizeMul=0.78;glowMul=window.innerWidth<520?0.3:0.4;diffraction=0.18;baseAlpha=window.innerWidth<520?0.68:0.8;maxRadius=window.innerWidth<520?1.18:1.35;
  }

  const pt=spawnPoint();
  return {
    x:pt.x,
    y:pt.y,
    z:Math.random()*DEPTH,
    col,
    flash:0,
    tier,
    sizeMul,
    glowMul,
    diffraction,
    baseAlpha,
    maxRadius,
    angle:Math.random()*Math.PI*0.5,
    rotSpeed:(Math.random()*0.0009+0.00015)*(Math.random()<0.5?-1:1),
    pulseSpeed:0.00028+Math.random()*0.00045,
    pulsePhase:Math.random()*Math.PI*2
  };
}
const stars=Array.from({length:NUM_STARS},makeStar);
// Seed a couple of stars already mid-flash so we don't start flat
stars[3].flash=0.6;stars[17].flash=0.4;stars[31].flash=0.8;
let flashTimer=120,flashStar=null;
const heroCopy=document.querySelector('.hero-copy');
let sfLastFrame=0;
(function renderSF(now){
  if(now-sfLastFrame < frameLimiter(PERF.starFPS)){ requestAnimationFrame(renderSF); return; }
  sfLastFrame = now;
  const W=window.innerWidth,H=window.innerHeight;
  if(!PERF.active){ requestAnimationFrame(renderSF); return; }
  // Lerp toward target speed — eliminates jump on scroll start/stop
  sfScrollSpeed+=(sfTargetSpeed-sfScrollSpeed)*0.08;
  sfTargetSpeed+=(BASE_SPEED-sfTargetSpeed)*0.05;
  const speed=sfScrollSpeed;
  const targetVpY=sfLastScrollY*0.015;
  vpY+=(targetVpY-vpY)*0.06;
  const cx=W/2,cy=H/2+vpY;
  const scrollProgress=Math.min(1,window.scrollY/Math.max(window.innerHeight,1));
  const heroRect=heroCopy?heroCopy.getBoundingClientRect():null;
  starfieldCtx.clearRect(0,0,W,H);
  flashTimer--;
  if(flashTimer<=0){
    const flashable=stars.filter(s=>s.tier!=='dust');
    flashTimer=FLASH_MIN_INTERVAL+Math.floor(Math.random()*FLASH_MAX_INTERVAL);
    flashStar=flashable[Math.floor(Math.random()*flashable.length)]||stars[Math.floor(Math.random()*stars.length)];
    if(flashStar)flashStar.flash=0;
  }
  // Flash rises over FLASH_RISE_DURATION frames, then decays
  if(flashStar&&flashTimer>0&&flashTimer<=FLASH_RISE_DURATION)flashStar.flash=Math.min(1,(FLASH_RISE_DURATION-flashTimer)/FLASH_RISE_DURATION);
  if(flashStar&&flashTimer>FLASH_RISE_DURATION&&flashStar.flash>0)flashStar.flash=Math.max(0,flashStar.flash-0.008);
  stars.forEach(s=>{
    s.z-=speed;
    s.angle+=s.rotSpeed;
    if(s.z<=1){
      const ns=makeStar();
      const pt=spawnPoint(W,H); s.x=pt.x; s.y=pt.y; s.z=DEPTH; s.flash=0;
      s.col=ns.col;s.tier=ns.tier;s.sizeMul=ns.sizeMul;s.glowMul=ns.glowMul;s.diffraction=ns.diffraction;
      s.baseAlpha=ns.baseAlpha;s.maxRadius=ns.maxRadius;s.angle=ns.angle;s.rotSpeed=ns.rotSpeed;
      s.pulseSpeed=ns.pulseSpeed;s.pulsePhase=ns.pulsePhase;
    }
    const scale=DEPTH/s.z;
    const sx=cx+s.x*scale,sy=cy+s.y*scale;
    if(sx<-80||sx>W+80||sy<-80||sy>H+80){
      const ns=makeStar();
      const pt=spawnPoint(W,H); s.x=pt.x*0.6; s.y=pt.y*0.6; s.z=DEPTH*0.6+Math.random()*DEPTH*0.4; s.flash=0;
      s.col=ns.col;s.tier=ns.tier;s.sizeMul=ns.sizeMul;s.glowMul=ns.glowMul;s.diffraction=ns.diffraction;
      s.baseAlpha=ns.baseAlpha;s.maxRadius=ns.maxRadius;s.angle=ns.angle;s.rotSpeed=ns.rotSpeed;
      s.pulseSpeed=ns.pulseSpeed;s.pulsePhase=ns.pulsePhase;
      return;
    }
    const r=Math.max(0.14,scale*0.48*s.sizeMul);
    // tFar: fades in as star approaches (z→0), tNear: fades out if too close (z<80)
    const tFar=1-s.z/DEPTH,tNear=Math.min(1,s.z/80);
    let alpha=Math.min(tFar*1.35,1)*tNear*s.baseAlpha;
    if(alpha<=0)return;
    // Dim stars inside the hero text block so they don't obscure copy
    if(heroRect){
      const padX=56,padY=40;
      const insideX=sx>heroRect.left-padX && sx<heroRect.right+padX;
      const insideY=sy>heroRect.top-padY && sy<heroRect.bottom+padY;
      if(insideX && insideY){
        const centerX=(heroRect.left+heroRect.right)/2;
        const centerY=(heroRect.top+heroRect.bottom)/2;
        const dx=Math.abs(sx-centerX)/((heroRect.width/2)+padX);
        const dy=Math.abs(sy-centerY)/((heroRect.height/2)+padY);
        const dist=Math.min(1,Math.sqrt(dx*dx+dy*dy));
        alpha*=0.3+dist*0.45;
      }
    }
    const pulse=0.96+0.04*Math.sin(now*s.pulseSpeed+s.pulsePhase);
    // Twinkle: slow shimmer that varies by depth (z) and horizontal position (x)
    const twinkle=0.93+0.07*Math.sin(now*0.0009*(1+s.z*0.0016)+s.x*0.01+s.pulsePhase);
    const scrollLift=1+scrollProgress*0.08;
    const desktopBoost = window.innerWidth > 768 ? 1.24 : window.innerWidth > 520 ? 1.12 : 1.0;
    const tierBoost = s.tier==='dust' ? 1.18 : s.tier==='standard' ? 1.12 : 1.06;
    const finalAlpha=Math.min(1,alpha*pulse*twinkle*scrollLift*desktopBoost*tierBoost+s.flash*0.72);
    const flashBoost=s.flash*(s.tier==='hero'?1.2:s.tier==='bright'?0.8:0.45);
    const finalRadius=Math.min(r+flashBoost,s.maxRadius);
    starfieldCtx.beginPath();starfieldCtx.arc(sx,sy,finalRadius,0,Math.PI*2);
    starfieldCtx.fillStyle=`rgba(${s.col[0]},${s.col[1]},${s.col[2]},${finalAlpha})`;starfieldCtx.fill();
    // Diffraction spikes
    if((s.diffraction>0.12&&finalRadius>0.58)||s.flash>0){
      const spikeLen=finalRadius*(3.1+s.diffraction*2.3+s.flash*2.5)*(0.7+tFar*0.22);
      const spikeAlpha=finalAlpha*(0.08+s.diffraction*0.12)+(s.flash*0.16);
      [s.angle,s.angle+Math.PI*0.5].forEach(a=>{
        const dx=Math.cos(a),dy=Math.sin(a);
        const gr=starfieldCtx.createLinearGradient(sx-dx*spikeLen,sy-dy*spikeLen,sx+dx*spikeLen,sy+dy*spikeLen);
        gr.addColorStop(0,`rgba(${s.col[0]},${s.col[1]},${s.col[2]},0)`);
        gr.addColorStop(0.5,`rgba(${s.col[0]},${s.col[1]},${s.col[2]},${spikeAlpha})`);
        gr.addColorStop(1,`rgba(${s.col[0]},${s.col[1]},${s.col[2]},0)`);
        starfieldCtx.beginPath();starfieldCtx.moveTo(sx-dx*spikeLen,sy-dy*spikeLen);starfieldCtx.lineTo(sx+dx*spikeLen,sy+dy*spikeLen);
        starfieldCtx.strokeStyle=gr;starfieldCtx.lineWidth=0.45;starfieldCtx.stroke();
      });
    }
    if((s.glowMul>0&&finalRadius>0.68)||s.flash>0){
      const glowBoost = window.innerWidth > 768 ? 1.14 : 1;
      const glowR=finalRadius*(1.36+s.glowMul*1.18+s.flash*1.52)*glowBoost;
      const grd=starfieldCtx.createRadialGradient(sx,sy,0,sx,sy,glowR);
      grd.addColorStop(0,`rgba(${s.col[0]},${s.col[1]},${s.col[2]},${finalAlpha*(0.095+s.glowMul*0.078)+s.flash*0.12})`);
      grd.addColorStop(0.45,`rgba(${s.col[0]},${s.col[1]},${s.col[2]},${finalAlpha*(0.026+s.glowMul*0.03)})`);
      grd.addColorStop(1,'rgba(255,255,255,0)');
      starfieldCtx.beginPath();starfieldCtx.arc(sx,sy,glowR,0,Math.PI*2);starfieldCtx.fillStyle=grd;starfieldCtx.fill();
    }
  });
  requestAnimationFrame(renderSF);
})(performance.now());

// ── SHOOTING STARS ──
const FIRST_SHOOTING_STAR_DELAY=2000,SHOOTING_STAR_INTERVAL=20000;
const shootingStarsCanvas=document.createElement('canvas');
shootingStarsCanvas.style.cssText='position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50;';
document.body.appendChild(shootingStarsCanvas);
let ssScale=1;
function resizeSS(){
  const W=window.innerWidth,H=window.innerHeight;
  ssScale=Math.min(window.devicePixelRatio||1, PERF.staticDpr);
  shootingStarsCanvas.width=Math.round(W*ssScale);shootingStarsCanvas.height=Math.round(H*ssScale);
}

resizeSS();window.addEventListener('resize',resizeSS);
const shootingStarsCtx=shootingStarsCanvas.getContext('2d'),sStars=[];
shootingStarsCtx.setTransform(ssScale,0,0,ssScale,0,0);
const alienState={x:-100,y:-100,baseY:-100,vx:0,vy:0,active:false,frame:0,type:0,colorIdx:0,startX:-100,alpha:1,spriteW:0,spriteH:0};
function spawnStar(){
  const W=window.innerWidth,H=window.innerHeight;
  const x1=Math.random()*W*0.65,y1=Math.random()*H*0.38;
  const len=100+Math.random()*90,ang=(18+Math.random()*14)*Math.PI/180;
  sStars.push({x1,y1,x2:x1+Math.cos(ang)*len,y2:y1+Math.sin(ang)*len,born:performance.now(),dur:580+Math.random()*280});
}
let ssLastFrame=0;
(function renderSS(now){
  if(now-ssLastFrame < frameLimiter(PERF.auxFPS)){ requestAnimationFrame(renderSS); return; }
  ssLastFrame = now;
  const W=window.innerWidth,H=window.innerHeight;
  if(!PERF.active){ requestAnimationFrame(renderSS); return; }
  shootingStarsCtx.setTransform(ssScale,0,0,ssScale,0,0);
  shootingStarsCtx.clearRect(0,0,W,H);
  for(let i=sStars.length-1;i>=0;i--){
    const s=sStars[i];const t=Math.min((now-s.born)/s.dur,1);
    if(t>=1){sStars.splice(i,1);continue;}
    const hx=s.x1+(s.x2-s.x1)*t,hy=s.y1+(s.y2-s.y1)*t;
    const d=Math.hypot(s.x2-s.x1,s.y2-s.y1),tl=Math.min(t*d,48);
    const tx=hx-((s.x2-s.x1)/d)*tl,ty=hy-((s.y2-s.y1)/d)*tl;
    const alpha=t<0.14?t/0.14:1-(t-0.14)/0.86;
    const gr=shootingStarsCtx.createLinearGradient(tx,ty,hx,hy);
    gr.addColorStop(0,'rgba(255,255,255,0)');
    gr.addColorStop(1,`rgba(255,255,255,${alpha*0.88})`);
    shootingStarsCtx.beginPath();shootingStarsCtx.moveTo(tx,ty);shootingStarsCtx.lineTo(hx,hy);
    shootingStarsCtx.strokeStyle=gr;shootingStarsCtx.lineWidth=1;shootingStarsCtx.stroke();
  }
  if(alienState.active){
    alienState.x+=alienState.vx;
    alienState.baseY+=alienState.vy;
    alienState.frame++;
    const inv=INVADERS[alienState.type];
    const bob=inv.bob;
    const drawY=alienState.baseY+Math.sin(alienState.frame*bob.freq)*bob.amp;
    const travelW=W+alienState.spriteW+20;
    const progress=Math.min(Math.abs(alienState.x-alienState.startX)/travelW,1);
    const fz=0.08;
    alienState.alpha=progress<fz?progress/fz:progress>1-fz?(1-progress)/fz:1;
    shootingStarsCtx.save();shootingStarsCtx.globalAlpha=alienState.alpha;
    drawAlien(shootingStarsCtx,alienState.x,drawY,alienState.frame);
    shootingStarsCtx.restore();
    const hw=alienState.spriteW/2+10;
    if(alienState.x<-hw||alienState.x>W+hw)alienState.active=false;
  }
  requestAnimationFrame(renderSS);
})(performance.now());

setTimeout(spawnStar,FIRST_SHOOTING_STAR_DELAY);
setInterval(()=>{spawnStar();},SHOOTING_STAR_INTERVAL);


// ── ALIEN ──
const FIRST_ALIEN_DELAY=8000,ALIEN_RESPAWN_MIN=11000,ALIEN_RESPAWN_RANGE=8000;
const INVADERS=[
  // Type 0 — Squid (classic top-row arcade alien)
  {px:2,bob:{amp:9,freq:0.048},frames:[
    [[0,0,1,0,0,0,0,0,1,0,0],[0,0,0,1,0,0,0,1,0,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,1,1,0,1,1,1,0,1,1,0],[1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,1,0,1],[0,0,0,1,1,0,1,1,0,0,0]],
    [[0,0,1,0,0,0,0,0,1,0,0],[0,0,0,1,0,0,0,1,0,0,0],[0,0,1,1,1,1,1,1,1,0,0],[0,1,1,0,1,1,1,0,1,1,0],[1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,1,0,1],[0,0,1,0,1,0,1,0,1,0,0]]
  ]},
  // Type 1 — Crab (middle-row arcade alien)
  {px:2,bob:{amp:5,freq:0.042},frames:[
    [[0,1,0,0,0,0,0,0,0,1,0],[0,0,1,0,0,0,0,0,1,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[1,1,0,0,0,0,0,0,0,1,1],[0,0,1,0,0,0,0,0,1,0,0],[1,0,0,1,0,0,0,1,0,0,1]],
    [[0,1,0,0,0,0,0,0,0,1,0],[1,0,1,0,0,0,0,0,1,0,1],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,0,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[0,1,0,0,0,0,0,0,0,1,0],[0,0,1,0,0,0,0,0,1,0,0],[0,1,0,0,0,0,0,0,0,1,0]]
  ]},
  // Type 2 — Octopus (bottom-row arcade alien, skull-like)
  {px:2,bob:{amp:7,freq:0.055},frames:[
    [[0,0,0,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,0,0,1,1,0,0,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,0,1,1,0,0,0,0,1,1,0,0],[0,1,0,1,0,0,0,0,1,0,1,0],[0,0,1,0,0,0,0,0,0,1,0,0]],
    [[0,0,0,1,1,1,1,1,1,0,0,0],[0,0,1,1,1,1,1,1,1,1,0,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,1,1,0,0,1,1,0,0,1,1,0],[0,1,1,1,1,1,1,1,1,1,1,0],[0,0,0,1,1,0,0,1,1,0,0,0],[0,0,1,0,1,0,0,1,0,1,0,0],[0,1,0,0,0,0,0,0,0,0,1,0]]
  ]}
];
const ALIEN_COLORS=[
  {color:'100,255,130',glow:'rgba(100,255,130,0.7)'},
  {color:'255,110,220',glow:'rgba(255,110,220,0.7)'},
  {color:'80,210,255', glow:'rgba(80,210,255,0.7)'},
  {color:'255,200,50', glow:'rgba(255,200,50,0.7)'},
  {color:'200,120,255',glow:'rgba(200,120,255,0.7)'},
  {color:'255,140,40', glow:'rgba(255,140,40,0.7)'}
];

function spawnAlien(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const W=window.innerWidth,H=window.innerHeight;
  const type=Math.floor(Math.random()*3);
  const colorIdx=Math.floor(Math.random()*ALIEN_COLORS.length);
  const inv=INVADERS[type];
  const sW=inv.frames[0][0].length*inv.px,sH=inv.frames[0].length*inv.px;
  const heroEl=document.querySelector('.hero');
  const heroBottom=heroEl?heroEl.offsetTop+heroEl.offsetHeight:H*0.9;
  const heroViewY=heroBottom-window.scrollY;
  let minY=Math.max(heroViewY+20,sH);
  let maxY=H-sH-20;
  if(maxY-minY<sH){minY=sH+20;maxY=H-sH-20;}
  if(maxY-minY<sH)return;
  const crossSec=9+Math.random()*5;
  const spd=W/(crossSec*PERF.auxFPS);
  const y=minY+Math.random()*(maxY-minY);
  let x,vx;
  if(Math.random()<0.5){x=-sW/2-10;vx=spd;}
  else{x=W+sW/2+10;vx=-spd;}
  alienState.x=x;alienState.startX=x;alienState.baseY=y;alienState.vx=vx;alienState.vy=0;
  alienState.active=true;alienState.frame=0;alienState.type=type;alienState.colorIdx=colorIdx;
  alienState.alpha=0;alienState.spriteW=sW;alienState.spriteH=sH;
}

function drawAlien(ctx,x,y,frame){
  const inv=INVADERS[alienState.type];
  const af=Math.floor(frame/18)%2;
  const grid=inv.frames[af];
  const px=inv.px||2,rows=grid.length,cols=grid[0].length;
  const ox=x-cols*px/2,oy=y-rows*px/2;
  const col=ALIEN_COLORS[alienState.colorIdx];
  ctx.save();
  ctx.shadowColor=col.glow;ctx.shadowBlur=8;
  for(let r=0;r<rows;r++){for(let c=0;c<cols;c++){
    if(!grid[r][c])continue;
    const t=1-(r/(rows-1))*0.35;
    ctx.fillStyle=`rgba(${col.color},${t})`;
    ctx.fillRect(ox+c*px,oy+r*px,px-0.5,px-0.5);
  }}
  ctx.restore();
}

// Alien spawn: initial delay, then irregular intervals
function scheduleNext(){
  setTimeout(()=>{if(!alienState.active)spawnAlien();scheduleNext();},ALIEN_RESPAWN_MIN+Math.random()*ALIEN_RESPAWN_RANGE);
}
setTimeout(()=>{spawnAlien();scheduleNext();},FIRST_ALIEN_DELAY);
