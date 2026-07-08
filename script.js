const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 16);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

function animateNumber(element) {
  if (element.dataset.animated === "true") return;
  element.dataset.animated = "true";

  const target = Number(element.dataset.count || "0");
  const duration = prefersReducedMotion ? 0 : 1300;
  const start = performance.now();

  function frame(now) {
    const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    element.textContent = current.toLocaleString();

    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      entry.target.querySelectorAll("[data-count]").forEach(animateNumber);
      if (entry.target.matches("[data-count]")) animateNumber(entry.target);
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".reveal, .language-panel, .danger-meter, [data-count]").forEach((item) => {
  revealObserver.observe(item);
});

const joinForm = document.querySelector("[data-join-form]");
const formStatus = document.querySelector("[data-form-status]");

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "Thank you. Your interest has been noted on this demo page.";
  joinForm.reset();
});

const canvas = document.getElementById("glyphCanvas");
const ctx = canvas.getContext("2d");
const glyphs = ["A", "文", "あ", "अ", "ع", "Б", "ñ", "Ω", "한", "ç", "Ж", "語", "λ", "م", "क", "é"];
let width = 0;
let height = 0;
let particles = [];
let animationFrame = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  const count = Math.max(34, Math.min(92, Math.floor(width / 18)));
  particles = Array.from({ length: count }, (_, index) => {
    const scale = 0.75 + Math.random() * 1.6;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.22,
      glyph: glyphs[index % glyphs.length],
      size: 18 + scale * 18,
      alpha: 0.18 + Math.random() * 0.42,
      accent: index % 7 === 0
    };
  });
}

function drawCanvas() {
  ctx.fillStyle = "#002147";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.075)";
  ctx.lineWidth = 1;
  for (let x = -120; x < width + 160; x += 160) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x + 130, height * 0.28, x - 80, height * 0.62, x + 90, height);
    ctx.stroke();
  }

  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;

    if (particle.x < -50) particle.x = width + 50;
    if (particle.x > width + 50) particle.x = -50;
    if (particle.y < -50) particle.y = height + 50;
    if (particle.y > height + 50) particle.y = -50;

    for (let i = index + 1; i < particles.length; i += 1) {
      const other = particles[i];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 120) {
        ctx.strokeStyle = `rgba(255,255,255,${(1 - distance / 120) * 0.08})`;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }

    ctx.font = `${particle.size}px Georgia, serif`;
    ctx.fillStyle = particle.accent
      ? `rgba(200, 162, 77, ${particle.alpha})`
      : `rgba(255, 255, 255, ${particle.alpha})`;
    ctx.fillText(particle.glyph, particle.x, particle.y);
  });

  animationFrame = requestAnimationFrame(drawCanvas);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

if (!prefersReducedMotion) {
  drawCanvas();
} else {
  ctx.fillStyle = "#002147";
  ctx.fillRect(0, 0, width, height);
  particles.forEach((particle) => {
    ctx.font = `${particle.size}px Georgia, serif`;
    ctx.fillStyle = particle.accent ? "rgba(200, 162, 77, 0.5)" : "rgba(255, 255, 255, 0.36)";
    ctx.fillText(particle.glyph, particle.x, particle.y);
  });
}

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
});
