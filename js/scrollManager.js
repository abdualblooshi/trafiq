class ScrollManager {
  constructor(visualization) {
    this.scroller = scrollama();
    this.visualization = visualization;
  }

  initialize() {
    this.scroller
      .setup({
        step: ".story-step",
        offset: 0.5,
        debug: false,
      })
      .onStepEnter(this.handleStepEnter.bind(this))
      .onStepExit(this.handleStepExit.bind(this));
  }

  handleStepEnter(response) {
    const step = response.element.dataset.step;
    this.visualization.setState(step);
    response.element.classList.add("is-active");
  }

  handleStepExit(response) {
    response.element.classList.remove("is-active");
  }
}
