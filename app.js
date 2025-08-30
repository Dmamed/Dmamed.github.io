// Año dinámico
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Typewriter ===== */
(function typewriterInit(){
  const el = document.querySelector('.typewriter');
  if(!el) return;
  const phrases = JSON.parse(el.getAttribute('data-phrases') || '[]');
  let i = 0, j = 0, deleting = false;
  function tick(){
    const current = phrases[i] || '';
    el.textContent = current.slice(0, j) + (j % 2 === 0 ? '|' : '');
    if(!deleting && j < current.length){ j++; }
    else if(!deleting && j === current.length){ setTimeout(()=> deleting = true, 900); }
    else if(deleting && j > 0){ j--; }
    else if(deleting && j === 0){ deleting = false; i = (i+1) % phrases.length; }
    setTimeout(tick, deleting ? 35 : 70);
  }
  tick();
})();

/* ===== Carrusel de poemas ===== */
(function carouselInit(){
  const track = document.querySelector('.carousel-track');
  if(!track) return;
  const prev = document.querySelector('.carousel-btn.prev');
  const next = document.querySelector('.carousel-btn.next');
  const slides = Array.from(track.children);
  const dotsWrap = document.querySelector('.carousel-dots');

  let index = 0;
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    if(i===0) b.classList.add('active');
    b.addEventListener('click', ()=> goTo(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index*100}%)`;
    dots.forEach(d=> d.classList.remove('active'));
    dots[index].classList.add('active');
  }

  prev.addEventListener('click', ()=> goTo(index-1));
  next.addEventListener('click', ()=> goTo(index+1));

  // Auto-advance
  setInterval(()=> goTo(index+1), 8000);
})();

/* ===== Reveal on scroll ===== */
const observer = new IntersectionObserver((entries)=>{
  for(const e of entries){
    if(e.isIntersecting) e.target.classList.add('visible');
  }
},{ threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el=> observer.observe(el));

/* ===== Confeti de corazones ===== */
document.getElementById('confetiBtn')?.addEventListener('click', ()=>{
  for(let i=0;i<36;i++){
    spawnHeart();
  }
});
function spawnHeart(){
  const wrap = document.querySelector('.floating-hearts');
  const h = document.createElement('div');
  h.textContent = '❤️';
  h.style.position = 'fixed';
  h.style.left = Math.random()*100 + 'vw';
  h.style.top = '100vh';
  h.style.fontSize = (Math.random()*24 + 16) + 'px';
  h.style.opacity = 1;
  h.style.pointerEvents = 'none';
  const drift = (Math.random()*2 - 1) * 30;
  const duration = Math.random()*2000 + 2500;
  document.body.appendChild(h);
  const start = performance.now();
  (function animate(t){
    const k = Math.min(1, (t - start)/duration);
    const y = 100 - k*120;
    const x = parseFloat(h.style.left) + Math.sin(k*6)*drift/10;
    h.style.transform = `translate(${x} , ${-k*120}vh) rotate(${k*180}deg)`;
    h.style.opacity = 1 - k;
    if(k<1) requestAnimationFrame(animate); else h.remove();
  })(start);
}

/* ===== Starfield (fondo) ===== */
(function starfield(){
  const c = document.getElementById('starfield');
  if(!c) return;
  const ctx = c.getContext('2d');
  let w, h, stars = [];
  function resize(){
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;
    stars = new Array(140).fill(0).map(()=> ({
      x: Math.random()*w,
      y: Math.random()*h,
      z: Math.random()*0.6 + 0.4,
      r: Math.random()*1.6 + .3
    }));
  }
  function draw(){
    ctx.clearRect(0,0,w,h);
    const grad = ctx.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,'rgba(255,255,255,0.02)');
    grad.addColorStop(1,'rgba(255,255,255,0.00)');
    ctx.fillStyle = grad;
    for(const s of stars){
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r*s.z, 0, Math.PI*2);
      ctx.fill();
      s.y += .05*s.z + .02;
      s.x += Math.sin(s.y/70)*.08;
      if(s.y > h+5){ s.y = -5; s.x = Math.random()*w; }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize(); draw();
})();

/* ===== Botón: volver arriba ===== */
document.getElementById('irArriba')?.addEventListener('click', ()=>{
  window.scrollTo({ top:0, behavior:'smooth' });
});

/* ===== Botón Serenata (tono sutil con WebAudio, sin archivos externos) ===== */
(function serenata(){
  const btn = document.getElementById('serenataBtn');
  if(!btn) return;
  let playing = false, ctx, osc, gain, notes, i=0, loop;
  function start(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    osc = ctx.createOscillator();
    gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.value = 0.0001;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    // pequeña secuencia (arpegio suave)
    notes = [392, 440, 523.25, 659.25, 587.33, 523.25, 440];
    i = 0;
    loop = setInterval(()=>{
      const f = notes[i % notes.length];
      osc.frequency.setTargetAtTime(f, ctx.currentTime, 0.015);
      // pulso suave
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.03);
      gain.gain.setTargetAtTime(0.0001, ctx.currentTime+0.25, 0.1);
      i++;
    }, 550);
  }
  function stop(){
    if(loop) clearInterval(loop);
    if(osc){
      osc.stop();
      osc.disconnect();
    }
    if(ctx) ctx.close();
  }
  btn.addEventListener('click', ()=>{
    if(!playing){ start(); btn.textContent = '⏸️ Pausar'; }
    else{ stop(); btn.textContent = '🎵 Serenata'; }
    playing = !playing;
  });
})();
