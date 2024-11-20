document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("visualization-canvas");
  const dataManager = new DataManager();
  const visualization = new Visualization(canvas, dataManager);
  const scrollManager = new ScrollManager(visualization);
  const sidebar = new Sidebar(dataManager);

  // Set up filter change callback
  sidebar.setFilterChangeCallback((filters) => {
    visualization.updateWithFilters(filters);
  });

  await visualization.initialize();
  scrollManager.initialize();
});
