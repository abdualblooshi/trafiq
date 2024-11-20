class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.animations = [];
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(data, options = {}) {
    this.particles = data.map((d) => ({
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      targetX: d.x,
      targetY: d.y,
      radius: options.radius || 3,
      color: options.color || "#fff",
      alpha: options.alpha || 0.6,
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
      },
    }));
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle) => {
      particle.x += (particle.targetX - particle.x) * 0.1;
      particle.y += (particle.targetY - particle.y) * 0.1;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255,255,255,${particle.alpha})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }

  transition(newLayout) {
    // Handle transitions between different visualization states
  }
}
