// =====================
// SPA SECTION SWITCHER
// =====================
const allSections = document.querySelectorAll('section');
const navLinks    = document.querySelectorAll('.nav-links a');
let skillsAnimated = false;

function showSection(hash) {
  const target = (hash && hash.startsWith('#')) ? hash : '#hero';

  // Hide all, show target
  allSections.forEach(s => s.classList.remove('active'));
  const el = document.querySelector(target);
  if (el) {
    el.classList.add('active');
    window.scrollTo(0, 0);
  }

  // Highlight active nav link
  navLinks.forEach(a => {
    a.classList.toggle('nav-active', a.getAttribute('href') === target);
  });

  // Animate skill bars once when Skills is opened
  if (target === '#skills' && !skillsAnimated) {
    skillsAnimated = true;
    setTimeout(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(f => f.classList.add('animate'));
    }, 100);
  }

  // Re-fit particles canvas when returning to hero
  if (target === '#hero') {
    setTimeout(resizeCanvas, 50);
  }
}

// Nav link clicks
navLinks.forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const hash = a.getAttribute('href');
    history.pushState(null, '', hash);
    showSection(hash);
  });
});

// Logo → home
const logoHome = document.getElementById('logo-home');
if (logoHome) {
  logoHome.addEventListener('click', e => {
    e.preventDefault();
    history.pushState(null, '', '#hero');
    showSection('#hero');
  });
}

// Hero CTA buttons (View My Work, Contact Me)
document.querySelectorAll('#hero a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const hash = a.getAttribute('href');
    history.pushState(null, '', hash);
    showSection(hash);
  });
});

// Browser back / forward
window.addEventListener('popstate', () => showSection(window.location.hash || '#hero'));

// =====================
// SCROLL TO TOP BUTTON
// =====================
const scrollTopBtn = document.getElementById('scroll-top');

window.addEventListener('scroll', () => {
  scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
});
scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// =====================
// PARTICLE SYSTEM
// =====================
const canvas = document.getElementById('particles-canvas');
const ctx    = canvas.getContext('2d');

const PARTICLE_COUNT      = 65;
const CONNECTION_DISTANCE = 130;
let particles = [];

function resizeCanvas() {
  if (!canvas.offsetWidth) return;
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

class Particle {
  constructor() { this.init(); }
  init() {
    this.x      = Math.random() * canvas.width;
    this.y      = Math.random() * canvas.height;
    this.vx     = (Math.random() - 0.5) * 0.45;
    this.vy     = (Math.random() - 0.5) * 0.45;
    this.radius = Math.random() * 1.8 + 0.8;
    this.alpha  = Math.random() * 0.45 + 0.15;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(107, 99, 255, ${this.alpha})`;
    ctx.fill();
  }
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONNECTION_DISTANCE) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(107, 99, 255, ${0.18 * (1 - dist / CONNECTION_DISTANCE)})`;
        ctx.lineWidth   = 0.7;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

// =====================
// INIT
// =====================
showSection(window.location.hash || '#hero');
resizeCanvas();
initParticles();
animate();
