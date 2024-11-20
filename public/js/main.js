document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize managers
    const dataManager = new DataManager();
    await dataManager.loadData();
    console.log("Data loaded successfully");

    const scrollManager = new ScrollManager(dataManager);
    await scrollManager.initialize();
    console.log("Scroll manager initialized");

    // Make scrollManager globally available for sidebar filters
    window.scrollManager = scrollManager;

    const accessibilityManager = new AccessibilityManager(
      dataManager,
      scrollManager
    );

    // Initialize sidebar
    const sidebar = new Sidebar(dataManager);

    console.log("All managers initialized successfully");
  } catch (error) {
    console.error("Initialization error:", error);
  }
});
