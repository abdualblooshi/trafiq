document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Initialize data manager
    const dataManager = new DataManager();
    await dataManager.loadData();
    console.log("Data loaded successfully");

    // Initialize trending manager if we're on the trends page
    if (document.getElementById("debugOutput")) {
      const trendingManager = new TrendingManager();
      console.log("Trending manager initialized");
    }

    // Initialize scroll manager only if we're on a page that needs it
    let scrollManager;
    if (document.getElementById("map")) {
      scrollManager = new ScrollManager(dataManager);
      await scrollManager.initialize();
      console.log("Scroll manager initialized");
      // Make scrollManager globally available for sidebar filters
      window.scrollManager = scrollManager;
    }

    // Initialize accessibility manager only if scroll manager exists
    if (scrollManager) {
      const accessibilityManager = new AccessibilityManager(
        dataManager,
        scrollManager
      );
      window.accessibilityManager = accessibilityManager;
    }

    console.log("All managers initialized successfully");
  } catch (error) {
    console.error("Initialization error:", error);
  }
});
