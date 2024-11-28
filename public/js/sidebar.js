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

    // Add theme toggle to settings section
    const settingsContent = document.querySelector(".settings-content");
    if (settingsContent) {
      const themeToggle = document.createElement("div");
      themeToggle.className =
        "theme-toggle setting-group border-t border-gray-700 pt-4 mt-4";
      themeToggle.innerHTML = `
                <label class="flex items-center justify-between">
                    <span class="text-sm font-medium">Theme</span>
                    <button id="theme-toggle-btn" class="relative inline-flex items-center h-6 rounded-full w-11 bg-gray-600 transition-colors">
                        <span class="sr-only">Toggle theme</span>
                        <span class="flex items-center justify-center w-5 h-5 rounded-full bg-white transform translate-x-1 transition-transform dark:translate-x-5">
                            <i class="fas fa-sun text-yellow-500 dark:hidden"></i>
                            <i class="fas fa-moon text-blue-500 hidden dark:block"></i>
                        </span>
                    </button>
                </label>
                <p class="text-xs text-gray-400 mt-1">Switch between light and dark themes</p>
            `;
      settingsContent.appendChild(themeToggle);
      this.initializeThemeToggle();
    }
  }

  initializeThemeToggle() {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    // Initialize theme based on saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const initialTheme = savedTheme || (prefersDark.matches ? "dark" : "light");
    this.setTheme(initialTheme);

    themeToggleBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
      const newTheme = currentTheme === "light" ? "dark" : "light";
      this.setTheme(newTheme);
    });

    // Listen for system theme changes
    prefersDark.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) {
        this.setTheme(e.matches ? "dark" : "light");
      }
    });
  }

  setTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
    this.updateMapStyle(theme);
  }

  updateMapStyle(theme) {
    const map = window.map; // Assuming the map instance is accessible
    if (map) {
      const style =
        theme === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11";
      map.setStyle(style);
    }
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
