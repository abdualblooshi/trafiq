class Sidebar {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.activeDropdown = null;
    this.modals = {
      accessibility: null,
      map: null,
    };
    this.isMobile = window.innerWidth < 1024;
    this.initializeSidebar();
    this.handleResize();
  }

  handleResize() {
    window.addEventListener("resize", () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth < 1024;

      // Handle transition between mobile and desktop
      if (wasMobile !== this.isMobile) {
        this.closeAllDropdowns();
      }
    });
  }

  initializeSidebar() {
    // Initialize dropdowns
    this.initializeDropdowns();

    // Initialize settings buttons
    this.initializeSettings();

    // Initialize filters
    this.initializeFilters();
  }

  initializeDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector("button[data-dropdown]");
      const content = dropdown.querySelector(".dropdown-content");

      if (button && content) {
        button.addEventListener("click", (e) => {
          e.preventDefault();

          // Close other dropdowns
          if (this.activeDropdown && this.activeDropdown !== content) {
            this.activeDropdown.classList.remove("show");
            const activeButton =
              this.activeDropdown.parentElement.querySelector("button");
            if (activeButton) {
              activeButton.querySelector("i").style.transform = "rotate(0deg)";
            }
          }

          // Toggle current dropdown
          content.classList.toggle("show");
          const icon = button.querySelector("i");
          if (icon) {
            icon.style.transform = content.classList.contains("show")
              ? "rotate(180deg)"
              : "rotate(0deg)";
          }

          this.activeDropdown = content.classList.contains("show")
            ? content
            : null;
        });
      }
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".dropdown")) {
        this.closeAllDropdowns();
      }
    });
  }

  closeAllDropdowns() {
    // Close dropdowns when transitioning between mobile and desktop
    if (this.isMobile) {
      const sidebarContainer = document.getElementById("sidebar-container");
      sidebarContainer.classList.add("-translate-x-full");
      document.getElementById("sidebar-backdrop").classList.add("hidden");
    }

    const dropdowns = document.querySelectorAll(".dropdown-content");
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("show");
      const button = dropdown.parentElement.querySelector("button");
      if (button) {
        const icon = button.querySelector("i");
        if (icon) icon.style.transform = "rotate(0deg)";
      }
    });
    this.activeDropdown = null;
  }

  initializeSettings() {
    const accessibilityBtn = document.getElementById("accessibility-settings");
    const mapSettingsBtn = document.getElementById("map-settings");

    if (accessibilityBtn) {
      accessibilityBtn.addEventListener("click", () => {
        this.showModal("accessibility");
      });
    }

    if (mapSettingsBtn) {
      mapSettingsBtn.addEventListener("click", () => {
        this.showModal("map");
      });
    }

    // Initialize modals
    this.initializeModals();
  }

  initializeModals() {
    // Get modal elements
    this.modals.accessibility = document.getElementById("accessibility-modal");
    this.modals.map = document.getElementById("map-modal");

    // Add close functionality to all modals
    document.querySelectorAll(".modal").forEach((modal) => {
      // Initially hide all modals
      modal.style.display = "none";

      // Add close button functionality
      const closeBtn = modal.querySelector(".close-modal");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.style.display = "none";
        });
      }

      // Close modal when clicking outside
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    });
  }

  showModal(type) {
    if (this.modals[type]) {
      this.modals[type].style.display = "flex";
    }
  }

  initializeFilters() {
    const filtersContainer = document.getElementById("filters");
    if (!filtersContainer) return;

    // Create date filter
    const dateFilter = this.createFilter("Date Range", "dateFilter", [
      { value: "all", label: "All Time" },
      { value: "today", label: "Today" },
      { value: "week", label: "Past Week" },
      { value: "month", label: "Past Month" },
    ]);

    // Create severity filter
    const severityFilter = this.createFilter("Severity", "severityFilter", [
      { value: "all", label: "All Severities" },
      { value: "severe", label: "Severe" },
      { value: "minor", label: "Minor" },
    ]);

    filtersContainer.innerHTML = "";
    filtersContainer.appendChild(dateFilter);
    filtersContainer.appendChild(severityFilter);

    // Add event listeners to filters
    this.initializeFilterEvents();
  }

  createFilter(label, id, options) {
    const filterGroup = document.createElement("div");
    filterGroup.className = "filter-group mb-4";

    filterGroup.innerHTML = `
            <label class="block text-sm font-medium text-gray-300 mb-2">${label}</label>
            <select id="${id}" class="w-full bg-gray-700 text-white rounded p-2">
                ${options
                  .map(
                    (option) =>
                      `<option value="${option.value}">${option.label}</option>`
                  )
                  .join("")}
            </select>
        `;

    return filterGroup;
  }

  initializeFilterEvents() {
    const dateFilter = document.getElementById("dateFilter");
    const severityFilter = document.getElementById("severityFilter");

    if (dateFilter) {
      dateFilter.addEventListener("change", (e) => {
        // Implement date filtering logic
        console.log("Date filter changed:", e.target.value);
      });
    }

    if (severityFilter) {
      severityFilter.addEventListener("change", (e) => {
        // Implement severity filtering logic
        console.log("Severity filter changed:", e.target.value);
      });
    }
  }
}
