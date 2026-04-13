// ── ECLIPSE HERO LOCK / RELEASE ──
let eclipseCurrentY=0;
let eclipseCurrentScale=1;
let eclipseCurrentOpacity=1;
let heroCopyCurrentY=0;
const eclipseEl=document.getElementById('eclipse');
const heroEl=document.querySelector('.hero');
const heroCopyEl=document.querySelector('.hero-copy');

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

(function animateEclipse(now){
  const vh=window.innerHeight||1;
  const scroll=window.scrollY||window.pageYOffset||0;
  const heroStart=heroEl?heroEl.offsetTop:0;
  const localScroll=Math.max(0,scroll-heroStart);
  const lockEnd=vh*0.4;
  const releaseEnd=vh*0.8;
  const breathe=1+Math.sin(now*0.00042)*0.016;

  let targetY=0;
  let targetScale=1;
  let targetOpacity=1;

  if(localScroll<=lockEnd){
    targetY=localScroll;
    targetScale=1;
    targetOpacity=1;
  }else if(localScroll<=releaseEnd){
    const releaseProgress=(localScroll-lockEnd)/(releaseEnd-lockEnd);
    targetY=lockEnd-(releaseProgress*18);
    targetScale=1-(releaseProgress*0.15);
    targetOpacity=1-(releaseProgress*0.58);
  }else{
    targetY=lockEnd-18;
    targetScale=0.85;
    targetOpacity=0.42;
  }

  targetScale*=breathe;

  // Smooth the eclipse motion a touch more for desktop trackpads / wheel scrolling
  eclipseCurrentY+=(targetY-eclipseCurrentY)*0.085;
  eclipseCurrentScale+=(targetScale-eclipseCurrentScale)*0.085;
  eclipseCurrentOpacity+=(targetOpacity-eclipseCurrentOpacity)*0.11;

  if(eclipseEl){
    eclipseEl.style.transform=`translate3d(0, ${eclipseCurrentY.toFixed(2)}px, 0) scale(${eclipseCurrentScale.toFixed(4)})`;
    eclipseEl.style.opacity=eclipseCurrentOpacity.toFixed(3);
  }

  if(heroCopyEl){
    const heroTextLock=Math.min(localScroll,lockEnd)*0.08;
    const heroTextRelease=Math.max(0,localScroll-lockEnd)*0.03;
    const heroCopyTargetY=heroTextLock+heroTextRelease;

    // Lerp the text too, so it doesn't feel more 'attached to scroll ticks' than the eclipse.
    heroCopyCurrentY+=(heroCopyTargetY-heroCopyCurrentY)*0.12;

    // Snap microscopically small deltas to avoid shimmer/jitter.
    if(Math.abs(heroCopyTargetY-heroCopyCurrentY)<0.02){
      heroCopyCurrentY=heroCopyTargetY;
    }

    heroCopyEl.style.transform=`translate3d(0, ${heroCopyCurrentY.toFixed(2)}px, 0)`;
  }
  requestAnimationFrame(animateEclipse);
})(performance.now());

// ── FAQ ──
function toggleFaq(btn){
  const body=btn.nextElementSibling;
  const isOpen=btn.classList.contains('open');
  document.querySelectorAll('.faq-toggle.open').forEach(b=>{
    b.classList.remove('open');
    b.setAttribute('aria-expanded','false');
    b.nextElementSibling.style.maxHeight='';
  });
  if(!isOpen){
    btn.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    body.style.maxHeight=body.scrollHeight+'px';
  }
}

document.querySelectorAll('.faq-toggle').forEach(function(btn){
  btn.addEventListener('click',function(){toggleFaq(this);});
});

// ── TABS ──
function switchTab(tab,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.track-list').forEach(l=>l.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('tab-'+tab).classList.add('active');
  history.replaceState(null,'','#written-for-'+(tab==='male'?'him':'her'));
}
function initTabFromHash(){
  const hash=window.location.hash;
  const tabs=document.querySelectorAll('.tab');
  if(hash==='#written-for-her'){switchTab('female',tabs[1]);}
}
initTabFromHash();

document.querySelectorAll('.tab[data-tab]').forEach(function(tab){
  tab.addEventListener('click',function(){switchTab(this.dataset.tab,this);});
});

// ── AUDIO ──
const audio=new Audio();
audio.preload='none';
audio.volume=1;
let currentTrack=null,rafId=null,isSeeking=false;
const bottomPlayer=document.getElementById('bottomPlayer');
const playerBtn=document.getElementById('playerBtn');
const playerTitle=document.getElementById('playerTitle');
const playerScrubber=document.getElementById('playerScrubber');
const muteBtn=document.getElementById('muteBtn');
const playerDur=document.getElementById('playerDur');
const playerArt=document.getElementById('playerArt');

const fmt=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
let playerReady=false;

document.querySelectorAll('.track[data-art]').forEach(t=>{
  const a=t.querySelector('.art');
  if(a) a.style.backgroundImage=`url('${t.dataset.art}')`;
});

function setPlayerArt(src){
  if(!playerArt) return;
  if(src){
    playerArt.style.backgroundImage=`url('${src}')`;
  }else{
    playerArt.style.backgroundImage='none';
  }
}

audio.addEventListener('loadedmetadata',()=>{
  playerReady=true;
  if(audio.duration && Number.isFinite(audio.duration)){
    playerDur.textContent='0:00';
  }
});
audio.addEventListener('ended',()=>{
  playerBtn.classList.remove('playing');
  if(playerArt)playerArt.classList.remove('spinning');
  if(currentTrack)currentTrack.classList.remove('playing');
  playerScrubber.value=0;playerScrubber.style.setProperty('--pct','0%');
  playerDur.textContent='—:—';
  discoReset();
  cancelAnimationFrame(rafId);
});
audio.addEventListener('pause',()=>{playerBtn.classList.remove('playing'); if(playerArt)playerArt.classList.remove('spinning'); if(currentTrack) currentTrack.classList.remove('playing'); discoReset();});
audio.addEventListener('play',()=>{playerBtn.classList.add('playing'); if(playerArt)playerArt.classList.add('spinning'); if(currentTrack) currentTrack.classList.add('playing');});

function fadeInAudio(){
  audio.volume=0.05;
  const fade=setInterval(()=>{
    if(audio.paused){clearInterval(fade);return;}
    if(audio.volume>=0.96){
      audio.volume=1;
      clearInterval(fade);
      return;
    }
    audio.volume=Math.min(1,audio.volume+0.08);
  },35);
}

function loadTrack(el){
  const sameTrack = currentTrack===el && audio.src.includes(el.dataset.src);
  if(currentTrack && currentTrack!==el) currentTrack.classList.remove('playing');

  currentTrack=el;
  el.classList.add('playing');
  playerTitle.textContent=el.dataset.title;
  setPlayerArt(el.dataset.art || '');
  if(!bottomPlayer.classList.contains('visible')){document.body.style.paddingBottom='100px';}
  bottomPlayer.classList.add('visible');

  if(!sameTrack){
    cancelAnimationFrame(rafId);
    playerScrubber.value=0;playerScrubber.style.setProperty('--pct','0%');
    playerDur.textContent='—:—';
    audio.pause();
    audio.currentTime=0;
    audio.src=el.dataset.src;
    audio.load();
  }

  const playPromise = audio.play();
  if(playPromise && typeof playPromise.then === 'function'){
    playPromise.then(()=>{fadeInAudio(); tick(); initDisco();}).catch(()=>{
      playerBtn.classList.remove('playing');
      playerDur.textContent='—:—';
    });
  }else{
    fadeInAudio();
    tick();
  }
}

function togglePlay(){
  if(!audio.src)return;
  if(audio.paused){
    const playPromise = audio.play();
    if(playPromise && typeof playPromise.then === 'function'){
      playPromise.then(()=>{ playerBtn.setAttribute('aria-label','Pause'); if(currentTrack) currentTrack.classList.add('playing'); tick(); initDisco(); }).catch(()=>{});
    }else{
      playerBtn.setAttribute('aria-label','Pause');
      if(currentTrack) currentTrack.classList.add('playing');
      tick();
    }
  } else {
    audio.pause();
    playerBtn.setAttribute('aria-label','Play');
    if(currentTrack) currentTrack.classList.remove('playing');
    cancelAnimationFrame(rafId);
  }
}

function tick(){
  cancelAnimationFrame(rafId);
  rafId=requestAnimationFrame(function loop(){
    if(!isSeeking && audio.duration && Number.isFinite(audio.duration)){
      const pct=audio.currentTime/audio.duration;
      playerScrubber.value=Math.round(pct*1000);
      playerScrubber.style.setProperty('--pct',(pct*100)+'%');
      playerDur.textContent=fmt(audio.currentTime);
    }
    discoTick();
    if(!audio.paused){
      rafId=requestAnimationFrame(loop);
    }
  });
}

function onScrubberInput(el){
  if(!audio.duration)return;
  audio.currentTime=(el.value/1000)*audio.duration;
  playerScrubber.style.setProperty('--pct',(el.value/10)+'%');
}

function toggleMute(){
  audio.muted=!audio.muted;
  muteBtn.classList.toggle('muted',audio.muted);
}

playerBtn.addEventListener('click',togglePlay);
muteBtn.addEventListener('click',toggleMute);
playerScrubber.addEventListener('input',function(){onScrubberInput(this);});
playerScrubber.addEventListener('mousedown',function(){isSeeking=true;});
playerScrubber.addEventListener('mouseup',function(){isSeeking=false;});
playerScrubber.addEventListener('touchstart',function(){isSeeking=true;},{passive:true});
playerScrubber.addEventListener('touchend',function(){isSeeking=false;});

document.querySelectorAll('.track').forEach(function(track){
  track.addEventListener('click',function(){loadTrack(this);});
});

// ── DISCO UFO ──
(function(){
  let actx,analyser,fdata;
  let bassHist=new Float32Array(60).fill(0),bhIdx=0,prevBass=0;
  let lastBeat=0;
  let dTarget=0,dAmt=0;
  let dCurR=157,dCurG=111,dCurB=212;
  let dTgtR=157,dTgtG=111,dTgtB=212;
  const PURPLE=[157,111,212];
  const COLS=[[80,210,255],[255,100,200],[255,210,80],[130,255,100],[255,80,120],[80,140,255],[255,160,40],[180,80,255]];

  window.initDisco=function(){
    if(actx){actx.resume();return;}
    try{
      actx=new(window.AudioContext||window.webkitAudioContext)();
      analyser=actx.createAnalyser();
      analyser.fftSize=512;
      analyser.smoothingTimeConstant=0.22;
      actx.createMediaElementSource(audio).connect(analyser);
      analyser.connect(actx.destination);
      fdata=new Uint8Array(analyser.frequencyBinCount);
    }catch(e){}
  };

  window.discoTick=function(){
    if(!analyser)return;
    analyser.getByteFrequencyData(fdata);
    let bass=0;
    for(let i=1;i<5;i++)bass+=fdata[i];
    bass/=4;
    const delta=Math.max(0,bass-prevBass);
    prevBass=bass;
    bassHist[bhIdx%60]=delta;bhIdx++;
    const avgDelta=bassHist.reduce((a,b)=>a+b,0)/60;
    const now=performance.now();
    if(delta>avgDelta*1.5&&delta>3&&now-lastBeat>230){
      lastBeat=now;
      dTarget=1.0;
      const c=COLS[Math.floor(Math.random()*COLS.length)];
      dTgtR=c[0];dTgtG=c[1];dTgtB=c[2];
      dCurR=c[0];dCurG=c[1];dCurB=c[2];
    }
    if(dAmt<dTarget){dAmt+=(dTarget-dAmt)*0.22;}
    dTarget=Math.max(0,dTarget-0.018);
    dAmt=Math.min(dAmt,dTarget+0.08);
    dCurR+=(dTgtR-dCurR)*0.25;
    dCurG+=(dTgtG-dCurG)*0.25;
    dCurB+=(dTgtB-dCurB)*0.25;
    if(dTarget<0.05){
      dTgtR+=(PURPLE[0]-dTgtR)*0.04;
      dTgtG+=(PURPLE[1]-dTgtG)*0.04;
      dTgtB+=(PURPLE[2]-dTgtB)*0.04;
    }
    applyGlow(dAmt);
  };

  function applyGlow(amt){
    const img=document.getElementById('ufoImg');
    const beam=document.querySelector('.ufo-beam');
    if(!img)return;
    const r=Math.round(dCurR),g=Math.round(dCurG),b=Math.round(dCurB);
    if(amt<0.01){img.style.filter='';if(beam)beam.style.background='';return;}
    img.style.filter=`drop-shadow(0 0 ${18+amt*28}px rgba(${r},${g},${b},${(0.35+amt*0.65).toFixed(2)})) drop-shadow(0 0 ${40+amt*60}px rgba(${r},${g},${b},${(0.12+amt*0.43).toFixed(2)}))`;
    if(beam)beam.style.background=`linear-gradient(180deg,rgba(${r},${g},${b},${(0.22+amt*0.58).toFixed(2)}) 0%,rgba(${r},${g},${b},0) 100%)`;
  }

  window.discoReset=function(){
    dTarget=0;
  };
})();

// ── CANVAS ECLIPSE ──
(function(){
  const canvas=document.getElementById('eclipse');
  if(!canvas)return;
  const dpr=Math.min(window.devicePixelRatio||1,1.35);
  const SIZE=window.innerWidth<=520?220:340;
  canvas.style.width=SIZE+'px';canvas.style.height=SIZE+'px';
  canvas.width=SIZE*dpr;canvas.height=SIZE*dpr;
  const ctx=canvas.getContext('2d');
  ctx.scale(dpr,dpr);
  const cx=SIZE/2,cy=SIZE/2,R=SIZE*0.27;
  function drawBase(){
    const g=ctx.createRadialGradient(cx,cy,R*0.98,cx,cy,R*1.8);
    g.addColorStop(0,'rgba(210,150,255,0.72)');g.addColorStop(0.07,'rgba(185,115,252,0.55)');
    g.addColorStop(0.18,'rgba(155,82,238,0.34)');g.addColorStop(0.38,'rgba(115,50,210,0.16)');
    g.addColorStop(0.60,'rgba(75,22,168,0.04)');g.addColorStop(0.82,'rgba(50,12,140,0.01)');
    g.addColorStop(1,'rgba(35,8,120,0)');
    ctx.beginPath();ctx.arc(cx,cy,R*1.8,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    const bx=cx+R*0.55,by=cy-R*0.45;
    const bias=ctx.createRadialGradient(bx,by,0,bx,by,R*1.1);
    bias.addColorStop(0,'rgba(220,160,255,0.36)');bias.addColorStop(0.4,'rgba(180,110,255,0.18)');bias.addColorStop(1,'rgba(140,70,230,0)');
    ctx.beginPath();ctx.arc(bx,by,R*1.1,0,Math.PI*2);ctx.fillStyle=bias;ctx.fill();
  }
  const lights=[
    {speed:0.0017,phase:0,orbitR:R*0.12,glowR:R*0.68,hue:268,peak:0.42},
    {speed:0.0023,phase:Math.PI*0.6,orbitR:R*0.15,glowR:R*0.52,hue:283,peak:0.36},
    {speed:0.0012,phase:Math.PI*1.2,orbitR:R*0.10,glowR:R*0.72,hue:254,peak:0.30},
    {speed:0.0029,phase:Math.PI*1.8,orbitR:R*0.13,glowR:R*0.48,hue:293,peak:0.40},
    {speed:0.0018,phase:Math.PI*0.4,orbitR:R*0.11,glowR:R*0.60,hue:273,peak:0.26},
  ];
  function drawAurora(t){
    lights.forEach(l=>{
      const a=t*l.speed+l.phase;
      const lx=cx+Math.cos(a)*(R+l.orbitR),ly=cy+Math.sin(a)*(R+l.orbitR);
      const b=0.52+Math.sin(t*l.speed*3.4+l.phase)*0.38+Math.sin(t*l.speed*6.1+l.phase*1.3)*0.24;
      const alpha=Math.max(0,b)*l.peak;
      const gr=ctx.createRadialGradient(lx,ly,0,lx,ly,l.glowR);
      gr.addColorStop(0,`hsla(${l.hue},90%,76%,${alpha})`);
      gr.addColorStop(0.4,`hsla(${l.hue},80%,64%,${alpha*0.50})`);
      gr.addColorStop(1,`hsla(${l.hue},70%,44%,0)`);
      ctx.beginPath();ctx.arc(lx,ly,l.glowR,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
    });
  }
  function drawDisc(){ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();}
  let frame=0, eclipseLast=0;
  (function render(now){
    if(!PERF.active){ requestAnimationFrame(render); return; }
    if(now-eclipseLast < frameLimiter(PERF.auxFPS)){ requestAnimationFrame(render); return; }
    eclipseLast = now;
    ctx.clearRect(0,0,SIZE,SIZE);drawBase();drawAurora(frame);drawDisc();frame++;requestAnimationFrame(render);
  })(performance.now());
})();

// UFO scroll parallax
(function(){
  const ufo = document.getElementById('ufoContainer');
  if(!ufo) return;
  let ticking = false;
  const ufoSection = ufo.closest('.about');
  window.addEventListener('scroll', function(){
    if(!ticking){
      requestAnimationFrame(function(){
        const rect = ufoSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const progress = 1 - (rect.top + rect.height) / (vh + rect.height);
        const clampedProgress = Math.max(0, Math.min(1, progress));
        const drift = (clampedProgress - 0.5) * 60;
        ufo.style.transform = 'translateY(' + drift + 'px)';
        ticking = false;
      });
      ticking = true;
    }
  }, {passive: true});
})();
