class Visualization {
  constructor(canvas, dataManager) {
    this.particles = new ParticleSystem(canvas);
    this.dataManager = dataManager;
    this.currentState = null;
    this.layoutCache = new Map(); // Cache layouts
    this.worker = new Worker("js/layoutWorker.js"); // Offload heavy computations
  }

  async initialize() {
    await this.dataManager.loadData();
    this.particles.createParticles(this.dataManager.processedData);
    this.particles.animate();
  }

  setState(state) {
    switch (state) {
      case "overview":
        this.showOverview();
        break;
      case "timePattern":
        this.showTimePattern();
        break;
      case "spatial":
        this.showSpatialPattern();
        break;
      // Add more states as needed
    }
    this.currentState = state;
  }

  showOverview() {
    // Transform particles into overview layout
  }

  showTimePattern() {
    // Transform particles into time-based pattern
  }

  showSpatialPattern() {
    // Transform particles into spatial pattern
  }
}
