class Sidebar {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Add event listeners to all dropdown buttons
    document.querySelectorAll("[data-dropdown]").forEach((button) => {
      button.addEventListener("click", () =>
        this.toggleDropdown(button.dataset.dropdown)
      );
    });

    // Initialize filter listeners
    this.initializeFilters();
  }

  toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(`${dropdownId}-dropdown`);
    if (dropdown) {
      dropdown.classList.toggle("show");

      // Toggle icon rotation
      const icon = document.querySelector(
        `[data-dropdown="${dropdownId}"] i.fas.fa-chevron-down`
      );
      if (icon) {
        icon.style.transform = dropdown.classList.contains("show")
          ? "rotate(180deg)"
          : "rotate(0)";
      }
    }
  }

  initializeFilters() {
    const dateFilter = document.getElementById("dateFilter");
    const typeFilter = document.getElementById("typeFilter");

    if (dateFilter) {
      dateFilter.addEventListener("change", (e) => {
        this.dataManager.filters.dateRange = e.target.value;
        this.updateVisualization();
      });
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", (e) => {
        this.dataManager.filters.incidentType = e.target.value;
        this.updateVisualization();
      });
    }
  }

  updateVisualization() {
    // Trigger visualization update based on new filters
    if (this.onFilterChange) {
      this.onFilterChange(this.dataManager.filters);
    }
  }

  setFilterChangeCallback(callback) {
    this.onFilterChange = callback;
  }
}
