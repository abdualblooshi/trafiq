document.addEventListener("DOMContentLoaded", async () => {
  try {
    const dataManager = new DataManager();
    await dataManager.loadData();

    const scrollManager = new ScrollManager(dataManager);
    await scrollManager.initialize();

    const accessibilityManager = new AccessibilityManager(
      dataManager,
      scrollManager
    );
  } catch (error) {
    console.error("Initialization error:", error);
  }
});
