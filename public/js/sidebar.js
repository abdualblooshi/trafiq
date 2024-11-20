// sidebar.js
class Sidebar {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.activeDropdown = null;
    this.initializeSidebar();
  }

  initializeSidebar() {
    // Initialize dropdowns
    this.initializeDropdowns();

    // Initialize filters
    this.initializeFilters();

    // Initialize settings buttons
    this.initializeSettings();
  }

  initializeDropdowns() {
    // Add click handlers to all dropdown buttons
    document.querySelectorAll(".dropdown").forEach((dropdown) => {
      const button =
        dropdown.querySelector("button") ||
        dropdown.querySelector("[data-dropdown]");
      const content = dropdown.querySelector(".dropdown-content");

      if (button && content) {
        button.addEventListener("click", () => {
          // Close other open dropdowns
          if (this.activeDropdown && this.activeDropdown !== content) {
            this.activeDropdown.classList.remove("show");
            const activeIcon = this.activeDropdown.parentElement.querySelector(
              "i.fas.fa-chevron-down"
            );
            if (activeIcon) {
              activeIcon.style.transform = "rotate(0deg)";
            }
          }

          // Toggle current dropdown
          content.classList.toggle("show");
          const icon = button.querySelector("i.fas.fa-chevron-down");
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
  }

  initializeFilters() {
    // Create and append filter elements
    const filtersContainer = document.querySelector("#filters");
    if (filtersContainer) {
      filtersContainer.innerHTML = this.createFilterHTML();

      // Initialize date range filter
      const dateFilter = document.getElementById("dateFilter");
      if (dateFilter) {
        dateFilter.addEventListener("change", (e) => this.handleDateFilter(e));
      }

      // Initialize incident type filter
      const typeFilter = document.getElementById("typeFilter");
      if (typeFilter) {
        typeFilter.addEventListener("change", (e) => this.handleTypeFilter(e));
      }

      // Initialize severity filter
      const severityFilter = document.getElementById("severityFilter");
      if (severityFilter) {
        severityFilter.addEventListener("change", (e) =>
          this.handleSeverityFilter(e)
        );
      }
    }
  }

  createFilterHTML() {
    return `
      <div class="filter-group mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
        <select id="dateFilter" class="w-full bg-gray-700 text-white rounded p-2">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
        </select>
      </div>

      <div class="filter-group mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Incident Type</label>
        <select id="typeFilter" class="w-full bg-gray-700 text-white rounded p-2">
          <option value="all">All Types</option>
          <option value="collision">Collision</option>
          <option value="pedestrian">Pedestrian</option>
          <option value="motorcycle">Motorcycle</option>
        </select>
      </div>

      <div class="filter-group mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Severity</label>
        <select id="severityFilter" class="w-full bg-gray-700 text-white rounded p-2">
          <option value="all">All Severities</option>
          <option value="severe">Severe</option>
          <option value="minor">Minor</option>
        </select>
      </div>
    `;
  }

  initializeSettings() {
    // Add click handlers for settings buttons
    const accessibilityBtn = document.getElementById("accessibility-settings");
    const mapSettingsBtn = document.getElementById("map-settings");

    if (accessibilityBtn) {
      accessibilityBtn.addEventListener("click", () => {
        // Trigger accessibility modal
        const accessibilityManager = new AccessibilityManager(
          this.dataManager,
          window.scrollManager
        );
        accessibilityManager.showAccessibilityModal();
      });
    }

    if (mapSettingsBtn) {
      mapSettingsBtn.addEventListener("click", () => {
        // Trigger map settings modal
        const accessibilityManager = new AccessibilityManager(
          this.dataManager,
          window.scrollManager
        );
        accessibilityManager.showMapSettingsModal();
      });
    }
  }

  handleDateFilter(event) {
    const dateRange = event.target.value;
    const currentDate = new Date();
    let filteredData = this.dataManager.processedData;

    switch (dateRange) {
      case "today":
        filteredData = filteredData.filter((incident) => {
          const incidentDate = new Date(incident.date);
          return incidentDate.toDateString() === currentDate.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(currentDate - 7 * 24 * 60 * 60 * 1000);
        filteredData = filteredData.filter((incident) => {
          const incidentDate = new Date(incident.date);
          return incidentDate >= weekAgo;
        });
        break;
      case "month":
        const monthAgo = new Date(currentDate - 30 * 24 * 60 * 60 * 1000);
        filteredData = filteredData.filter((incident) => {
          const incidentDate = new Date(incident.date);
          return incidentDate >= monthAgo;
        });
        break;
    }

    this.updateMapData(filteredData);
  }

  handleTypeFilter(event) {
    const type = event.target.value;
    let filteredData = this.dataManager.processedData;

    if (type !== "all") {
      filteredData = filteredData.filter((incident) =>
        incident.acci_name.toLowerCase().includes(type.toLowerCase())
      );
    }

    this.updateMapData(filteredData);
  }

  handleSeverityFilter(event) {
    const severity = event.target.value;
    let filteredData = this.dataManager.processedData;

    if (severity !== "all") {
      filteredData = filteredData.filter(
        (incident) => incident.severity === severity
      );
    }

    this.updateMapData(filteredData);
  }

  updateMapData(filteredData) {
    // Update the map with filtered data
    if (window.scrollManager && window.scrollManager.map) {
      const geojsonData = {
        type: "FeatureCollection",
        features: filteredData.map((d) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [d.longitude, d.latitude],
          },
          properties: {
            severity: d.severity,
            type: d.acci_name,
            time: d.acci_time,
            description: d.acci_desc || "",
          },
        })),
      };

      const source = window.scrollManager.map.getSource("incidents");
      if (source) {
        source.setData(geojsonData);
      }
    }
  }
}
