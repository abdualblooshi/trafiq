document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("visualization-canvas");
  const dataManager = new DataManager();
  const visualization = new Visualization(canvas, dataManager);
  const scrollManager = new ScrollManager(visualization);
  const sidebar = new Sidebar(dataManager);

  await visualization.initialize();
  scrollManager.initialize();
});
