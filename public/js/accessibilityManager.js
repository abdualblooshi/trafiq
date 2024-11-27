class AccessibilityManager {
  constructor(dataManager, scrollManager = null) {
    console.log("Initializing AccessibilityManager", {
      dataManager,
      scrollManager,
    });
    this.dataManager = dataManager;
    this.scrollManager = scrollManager;

    // Load settings from localStorage or use defaults
    this.settings = this.loadSettings();

    this.colorSchemes = {
      default: {
        severe: "#FF0000",
        minor: "#FFA500",
        accent1: "#1f77b4",
        accent2: "#ff7f0e",
        accent3: "#2ca02c",
        accent4: "#d62728",
        background: "#ffffff",
        text: "#000000",
      },
      protanopia: {
        severe: "#0000FF",
        minor: "#FFFF00",
        accent1: "#0000FF",
        accent2: "#FFFF00",
        accent3: "#00FFFF",
        accent4: "#000000",
        background: "#ffffff",
        text: "#000000",
      },
      deuteranopia: {
        severe: "#0000FF",
        minor: "#FFFF00",
        accent1: "#0000FF",
        accent2: "#FFFF00",
        accent3: "#00FFFF",
        accent4: "#000000",
        background: "#ffffff",
        text: "#000000",
      },
      tritanopia: {
        severe: "#FF0000",
        minor: "#00FF00",
        accent1: "#FF0000",
        accent2: "#00FF00",
        accent3: "#0000FF",
        accent4: "#000000",
        background: "#ffffff",
        text: "#000000",
      },
    };

    this.initEventListeners();
    this.applyGlobalStyles();
  }

  loadSettings() {
    const defaultSettings = {
      colorScheme: "default",
      fontSize: "medium",
      contrast: "normal",
      pointSize: 6,
      pointOpacity: 0.7,
    };

    try {
      const savedSettings = localStorage.getItem("accessibilitySettings");
      if (savedSettings) {
        return { ...defaultSettings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error);
    }

    return defaultSettings;
  }

  saveSettings() {
    try {
      localStorage.setItem(
        "accessibilitySettings",
        JSON.stringify(this.settings)
      );
      console.log("Settings saved to localStorage");
    } catch (error) {
      console.error("Error saving settings to localStorage:", error);
    }
  }

  initEventListeners() {
    console.log("Initializing event listeners");
    const accessibilityBtn = document.getElementById("accessibility-settings");
    const mapSettingsBtn = document.getElementById("map-settings");

    if (accessibilityBtn) {
      accessibilityBtn.addEventListener("click", () => {
        console.log("Accessibility button clicked");
        this.showAccessibilityModal();
      });
    } else {
      console.warn("Accessibility button not found");
    }

    // Only show map settings on story-map page
    if (
      mapSettingsBtn &&
      this.scrollManager &&
      window.location.pathname === "/story-map"
    ) {
      mapSettingsBtn.addEventListener("click", () => {
        console.log("Map settings button clicked");
        this.showMapSettingsModal();
      });
      mapSettingsBtn.style.display = "block";
    } else if (mapSettingsBtn) {
      mapSettingsBtn.style.display = "none";
    }
  }

  createAccessibilityModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content bg-gray-800 text-white">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Accessibility Settings</h2>
          <button class="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body space-y-4">
          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Color Scheme</label>
            <select id="colorScheme" class="w-full bg-gray-700 rounded p-2">
              <option value="default">Default</option>
              <option value="protanopia">Protanopia</option>
              <option value="deuteranopia">Deuteranopia</option>
              <option value="tritanopia">Tritanopia</option>
            </select>
          </div>

          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Font Size</label>
            <select id="fontSize" class="w-full bg-gray-700 rounded p-2">
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Contrast</label>
            <select id="contrast" class="w-full bg-gray-700 rounded p-2">
              <option value="normal">Normal</option>
              <option value="high">High Contrast</option>
            </select>
          </div>
        </div>

        <div class="modal-footer mt-6 space-y-2">
          <button id="applySettings" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Apply Settings
          </button>
          <button id="resetSettings" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Reset to Default
          </button>
        </div>
      </div>
    `;

    return modal;
  }

  createMapSettingsModal() {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content bg-gray-800 text-white">
        <div class="modal-header flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Map Display Settings</h2>
          <button class="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body space-y-4">
          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Map Style</label>
            <select id="mapStyle" class="w-full bg-gray-700 rounded p-2">
              <option value="dark-v10">Dark</option>
              <option value="light-v10">Light</option>
              <option value="streets-v11">Streets</option>
              <option value="satellite-v9">Satellite</option>
            </select>
          </div>

          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Point Size</label>
            <input type="range" id="pointSize" min="2" max="10" step="1" class="w-full">
          </div>

          <div class="setting-group">
            <label class="block text-sm font-medium mb-2">Point Opacity</label>
            <input type="range" id="pointOpacity" min="0.1" max="1" step="0.1" class="w-full">
          </div>
        </div>

        <div class="modal-footer mt-6 space-y-2">
          <button id="applyMapSettings" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Apply Settings
          </button>
          <button id="resetMapSettings" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Reset to Default
          </button>
        </div>
      </div>
    `;

    return modal;
  }

  showAccessibilityModal() {
    console.log("Showing accessibility modal");
    const modal = this.createAccessibilityModal();
    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("show");
    });

    // Set current values
    console.log("Setting current values:", this.settings);
    const settingsToShow = {
      colorScheme: this.settings.colorScheme,
      fontSize: this.settings.fontSize,
      contrast: this.settings.contrast,
    };

    Object.entries(settingsToShow).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        element.value = value;
        console.log(`Set ${key} to ${value}`);
      } else {
        console.warn(`Element not found for ${key}`);
      }
    });

    // Event listeners
    modal.querySelector(".close-modal").onclick = () => {
      console.log("Closing modal");
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector("#applySettings").onclick = () => {
      console.log("Applying accessibility settings");
      this.applyAccessibilitySettings();
      this.applyGlobalStyles();
    };

    modal.querySelector("#resetSettings").onclick = () => {
      console.log("Resetting to default settings");
      this.settings = this.loadSettings();
      this.applyGlobalStyles();
      // Close current modal
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };
  }

  applyAccessibilitySettings() {
    console.log("Applying accessibility settings");
    const colorScheme = document.getElementById("colorScheme")?.value;
    const fontSize = document.getElementById("fontSize")?.value;
    const contrast = document.getElementById("contrast")?.value;

    console.log("New accessibility settings:", {
      colorScheme,
      fontSize,
      contrast,
    });

    // Update settings object while preserving numeric values
    this.settings = {
      ...this.settings,
      colorScheme: colorScheme || this.settings.colorScheme,
      fontSize: fontSize || this.settings.fontSize,
      contrast: contrast || this.settings.contrast,
    };

    // Save settings to localStorage
    this.saveSettings();

    // Apply the new color scheme immediately
    this.applyGlobalStyles();

    // Close the modal
    const modal = document.querySelector(".modal");
    if (modal) {
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    }
  }

  showMapSettingsModal() {
    if (!this.scrollManager || window.location.pathname !== "/story-map") {
      console.warn(
        "Map settings not available - not on story-map page or no ScrollManager"
      );
      return;
    }

    console.log("Showing map settings modal");
    const modal = this.createMapSettingsModal();
    document.body.appendChild(modal);

    // Set current values for map settings
    const pointSizeInput = modal.querySelector("#pointSize");
    const pointOpacityInput = modal.querySelector("#pointOpacity");

    if (pointSizeInput) {
      pointSizeInput.value = this.settings.pointSize;
      console.log("Set point size to:", pointSizeInput.value);
    }

    if (pointOpacityInput) {
      pointOpacityInput.value = this.settings.pointOpacity;
      console.log("Set point opacity to:", pointOpacityInput.value);
    }

    requestAnimationFrame(() => {
      modal.classList.add("show");
    });

    modal.querySelector(".close-modal").onclick = () => {
      console.log("Closing map settings modal");
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector("#applyMapSettings").onclick = () => {
      console.log("Applying map settings");
      this.applyMapSettings();
      // Close the modal after applying settings
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };

    modal.querySelector("#resetMapSettings").onclick = () => {
      console.log("Resetting to default map settings");
      const defaultSettings = this.loadSettings();
      this.settings.pointSize = defaultSettings.pointSize;
      this.settings.pointOpacity = defaultSettings.pointOpacity;
      this.applyMapSettings();
      // Close the modal after resetting settings
      modal.classList.remove("show");
      setTimeout(() => modal.remove(), 300);
    };
  }

  applyGlobalStyles() {
    const colors = this.colorSchemes[this.settings.colorScheme];
    console.log("Applying color scheme:", this.settings.colorScheme, colors);

    // Apply font size
    document.documentElement.style.setProperty(
      "--base-font-size",
      this.settings.fontSize === "small"
        ? "14px"
        : this.settings.fontSize === "large"
          ? "18px"
          : "16px"
    );

    // Apply contrast settings
    if (this.settings.contrast === "high") {
      document.documentElement.style.setProperty("--text-color", "#ffffff");
      document.documentElement.style.setProperty(
        "--background-color",
        "#000000"
      );
    }

    // Update ScrollManager colors if available
    if (this.scrollManager) {
      console.log("Updating ScrollManager colors");
      this.scrollManager.updateColorScheme({
        severe: colors.severe,
        minor: colors.minor,
      });

      // Update map colors
      if (this.scrollManager.map?.getLayer("incidents-layer")) {
        this.scrollManager.map.setPaintProperty(
          "incidents-layer",
          "circle-color",
          [
            "match",
            ["get", "severity"],
            "severe",
            colors.severe,
            "minor",
            colors.minor,
            colors.minor,
          ]
        );
      }
    }

    // Save settings to localStorage
    this.saveSettings();
  }
  applyMapSettings() {
    if (!this.scrollManager?.map) return;

    console.log("Applying map settings...");
    const mapStyle = document.getElementById("mapStyle")?.value;
    const pointSize =
      Number(document.getElementById("pointSize")?.value) ||
      this.settings.pointSize;
    const pointOpacity =
      Number(document.getElementById("pointOpacity")?.value) ||
      this.settings.pointOpacity;

    console.log("New map settings:", { mapStyle, pointSize, pointOpacity });

    // Update settings with numeric values
    this.settings = {
      ...this.settings,
      pointSize,
      pointOpacity,
    };

    // Save settings to localStorage
    this.saveSettings();

    const map = this.scrollManager.map;

    // If only changing point size or opacity (not style)
    if (map.getLayer("incidents-layer")) {
      console.log("Updating point properties:", { pointSize, pointOpacity });

      try {
        map.setPaintProperty("incidents-layer", "circle-radius", pointSize);
        map.setPaintProperty("incidents-layer", "circle-opacity", pointOpacity);
        console.log("Successfully updated point properties");
        return;
      } catch (error) {
        console.error("Error updating point properties:", error);
      }
    }

    // If changing style or layer doesn't exist
    if (mapStyle) {
      console.log("Setting map style to:", mapStyle);
      map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);

      map.once("style.load", () => {
        console.log("Map style loaded, recreating layer");

        if (this.dataManager) {
          const geojsonData = this.dataManager.getGeoJSON();

          if (!map.getSource("incidents")) {
            map.addSource("incidents", {
              type: "geojson",
              data: geojsonData,
            });
          }

          if (!map.getLayer("incidents-layer")) {
            const colors = this.colorSchemes[this.settings.colorScheme];
            map.addLayer({
              id: "incidents-layer",
              type: "circle",
              source: "incidents",
              paint: {
                "circle-radius": pointSize,
                "circle-opacity": pointOpacity,
                "circle-color": [
                  "match",
                  ["get", "severity"],
                  "severe",
                  colors.severe,
                  "minor",
                  colors.minor,
                  colors.minor,
                ],
              },
            });
          }

          console.log("Successfully recreated layer with new properties");
        }
      });
    }
  }
}
