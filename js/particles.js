class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false }); // Optimization 1: Disable alpha
    this.particles = [];
    this.offscreenCanvas = new OffscreenCanvas(
      window.innerWidth,
      window.innerHeight
    ); // Optimization 2: Use OffscreenCanvas
    this.offscreenCtx = this.offscreenCanvas.getContext("2d", { alpha: false });
    this.lastTime = 0;
    this.fps = 60;
    this.frameInterval = 1000 / this.fps;
    this.resize();

    // Optimization 3: Debounced resize
    this.debouncedResize = this.debounce(() => this.resize(), 150);
    window.addEventListener("resize", this.debouncedResize);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.floor(window.innerWidth * dpr);
    const displayHeight = Math.floor(window.innerHeight * dpr);

    this.canvas.width = displayWidth;
    this.canvas.height = displayHeight;
    this.offscreenCanvas.width = displayWidth;
    this.offscreenCanvas.height = displayHeight;

    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;

    // Optimization 4: Set canvas scaling
    this.ctx.scale(dpr, dpr);
    this.offscreenCtx.scale(dpr, dpr);
  }

  createParticles(data, options = {}) {
    // Optimization 5: Limit number of particles
    const maxParticles = 1000;
    const step = Math.ceil(data.length / maxParticles);

    this.particles = data
      .filter((_, index) => index % step === 0)
      .map((d) => ({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        targetX: this.normalizeCoordinate(d.x, "x"),
        targetY: this.normalizeCoordinate(d.y, "y"),
        radius: options.radius || 2,
        color: options.color || "#fff",
        alpha: options.alpha || 0.6,
        friction: 0.95, // Optimization 6: Add friction
        acceleration: 0.1,
        velocity: {
          x: 0,
          y: 0,
        },
      }));
  }

  normalizeCoordinate(value, axis) {
    // Implement coordinate normalization based on your data range
    // This is a placeholder implementation
    const padding = 50;
    if (axis === "x") {
      return (
        ((value - 24.9) * (this.canvas.width - padding * 2)) / (25.3 - 24.9) +
        padding
      );
    } else {
      return (
        ((value - 55.1) * (this.canvas.height - padding * 2)) / (55.4 - 55.1) +
        padding
      );
    }
  }

  // Optimization 7: Batch rendering
  batchDraw() {
    this.offscreenCtx.fillStyle = "#000";
    this.offscreenCtx.fillRect(
      0,
      0,
      this.offscreenCanvas.width,
      this.offscreenCanvas.height
    );

    // Group particles by color and alpha
    const batches = new Map();
    this.particles.forEach((particle) => {
      const key = `${particle.color}-${particle.alpha}`;
      if (!batches.has(key)) {
        batches.set(key, []);
      }
      batches.get(key).push(particle);
    });

    // Draw each batch
    batches.forEach((particles, key) => {
      const [color, alpha] = key.split("-");
      this.offscreenCtx.beginPath();
      this.offscreenCtx.fillStyle = `rgba(255,255,255,${alpha})`;

      particles.forEach((particle) => {
        this.offscreenCtx.moveTo(particle.x, particle.y);
        this.offscreenCtx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );
      });

      this.offscreenCtx.fill();
    });

    // Copy to main canvas
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  // Optimization 8: RAF with time-based animation
  animate(timestamp = 0) {
    const deltaTime = timestamp - this.lastTime;

    if (deltaTime >= this.frameInterval) {
      this.lastTime = timestamp - (deltaTime % this.frameInterval);

      this.updateParticles();
      this.batchDraw();
    }

    requestAnimationFrame((timestamp) => this.animate(timestamp));
  }

  // Optimization 9: Efficient particle updates
  updateParticles() {
    this.particles.forEach((particle) => {
      const dx = particle.targetX - particle.x;
      const dy = particle.targetY - particle.y;

      particle.velocity.x += dx * particle.acceleration;
      particle.velocity.y += dy * particle.acceleration;

      particle.velocity.x *= particle.friction;
      particle.velocity.y *= particle.friction;

      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
    });
  }

  // Optimization 10: Efficient state transitions
  transition(newLayout, duration = 1000) {
    const startPositions = this.particles.map((p) => ({ x: p.x, y: p.y }));
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeProgress =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.particles.forEach((particle, i) => {
        particle.targetX =
          startPositions[i].x +
          (newLayout[i].x - startPositions[i].x) * easeProgress;
        particle.targetY =
          startPositions[i].y +
          (newLayout[i].y - startPositions[i].y) * easeProgress;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }
}
