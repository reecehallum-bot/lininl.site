(function(){
  const canvas=document.getElementById('eclipse');
  if(!canvas)return;
  const wrap=canvas.closest('.service-eclipse-wrap');
  const isMobile=window.innerWidth<=600;
  const _PERF=typeof PERF!=='undefined'?PERF:{active:true,auxFPS:30};
  const _frameLimiter=typeof frameLimiter!=='undefined'?frameLimiter:function(fps){return 1000/fps;};
  const dpr=Math.min(window.devicePixelRatio||1,1.35);
  const SIZE=isMobile?150:180;
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
    lights.forEach(function(l){
      const a=t*l.speed+l.phase;
      const lx=cx+Math.cos(a)*(R+l.orbitR),ly=cy+Math.sin(a)*(R+l.orbitR);
      const b=0.52+Math.sin(t*l.speed*3.4+l.phase)*0.38+Math.sin(t*l.speed*6.1+l.phase*1.3)*0.24;
      const alpha=Math.max(0,b)*l.peak;
      const gr=ctx.createRadialGradient(lx,ly,0,lx,ly,l.glowR);
      gr.addColorStop(0,'hsla('+l.hue+',90%,76%,'+alpha+')');
      gr.addColorStop(0.4,'hsla('+l.hue+',80%,64%,'+(alpha*0.50)+')');
      gr.addColorStop(1,'hsla('+l.hue+',70%,44%,0)');
      ctx.beginPath();ctx.arc(lx,ly,l.glowR,0,Math.PI*2);ctx.fillStyle=gr;ctx.fill();
    });
  }
  function drawDisc(){ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle='#000';ctx.fill();}

  // Canvas render loop — frame-limited via PERF.auxFPS
  let frame=0,last=0;
  (function render(now){
    if(!_PERF.active){requestAnimationFrame(render);return;}
    if(now-last<_frameLimiter(_PERF.auxFPS)){requestAnimationFrame(render);return;}
    last=now;
    ctx.clearRect(0,0,SIZE,SIZE);drawBase();drawAurora(frame);drawDisc();
    frame++;requestAnimationFrame(render);
  })(performance.now());

  // Desktop: breathing + scroll parallax on wrap at native rAF rate
  if(wrap&&!isMobile){
    let targetY=0,currentY=0;
    window.addEventListener('scroll',function(){targetY=window.scrollY*0.4;},{passive:true});
    (function animateWrap(now){
      currentY+=(targetY-currentY)*0.12;
      wrap.style.transform='translateY(-'+currentY.toFixed(2)+'px) scale('+(1+Math.sin(now*0.00042)*0.016).toFixed(4)+')';
      requestAnimationFrame(animateWrap);
    })(performance.now());
  }
})();
