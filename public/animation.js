const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

// Resize canvas to fill the screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const particles = [];

// Adjust particle count based on screen size
const particleCount = window.innerWidth < 768 ? 100 : 200;

// Particle object
class Particle {
  constructor(x, y) {
    this.x = x || Math.random() * canvas.width;
    this.y = y || Math.random() * canvas.height;
    this.radius = 2 + Math.random() * 2;
    this.color = "rgba(255, 255, 255, 0.8)";
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Limit particle speed
    this.vx = Math.max(Math.min(this.vx, 1.5), -1.5);
    this.vy = Math.max(Math.min(this.vy, 1.5), -1.5);
  }
}

// Create particles
for (let i = 0; i < particleCount; i++) {
  particles.push(new Particle());
}

// Connect particles with lines
function connectParticles() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

// Animation loop with frame rate control
let lastTime = 0;
const fps = 60;
const interval = 1000 / fps;

function animate(time) {
  if (time - lastTime >= interval) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });
    connectParticles();
    lastTime = time;
  }
  requestAnimationFrame(animate);
}

animate(0);
