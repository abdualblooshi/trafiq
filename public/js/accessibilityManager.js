class AccessibilityManager {
  constructor(dataManager, scrollManager) {
    console.log("Initializing AccessibilityManager", {
      dataManager,
      scrollManager,
    });
    this.dataManager = dataManager;
    this.scrollManager = scrollManager;
    this.settings = {
      colorScheme: "default",
      fontSize: "medium",
      contrast: "normal",
      pointSize: "6",
      pointOpacity: "0.7",
    };

    this.colorSchemes = {
      default: {
        severe: "#FF0000",
        minor: "#FFA500",
      },
      protanopia: {
        severe: "#0000FF",
        minor: "#FFFF00",
      },
      deuteranopia: {
        severe: "#0000FF",
        minor: "#FFFF00",
      },
      tritanopia: {
        severe: "#FF0000",
        minor: "#00FF00",
      },
    };

    this.initEventListeners();
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

    if (mapSettingsBtn) {
      mapSettingsBtn.addEventListener("click", () => {
        console.log("Map settings button clicked");
        this.showMapSettingsModal();
      });
    } else {
      console.warn("Map settings button not found");
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

        <div class="modal-footer mt-6">
          <button id="applySettings" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Apply Settings
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

        <div class="modal-footer mt-6">
          <button id="applyMapSettings" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Apply Settings
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
    Object.entries(this.settings).forEach(([key, value]) => {
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
    };
  }

  showMapSettingsModal() {
    console.log("Showing map settings modal");
    const modal = this.createMapSettingsModal();
    document.body.appendChild(modal);

    // Set current values for map settings
    const pointSizeInput = modal.querySelector("#pointSize");
    const pointOpacityInput = modal.querySelector("#pointOpacity");

    if (pointSizeInput) {
      pointSizeInput.value = this.settings.pointSize || "6";
      console.log("Set point size to:", pointSizeInput.value);
    }

    if (pointOpacityInput) {
      pointOpacityInput.value = this.settings.pointOpacity || "0.7";
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
    };
  }

  applyMapSettings() {
    console.log("Applying map settings...");
    const mapStyle = document.getElementById("mapStyle").value;
    const pointSize = document.getElementById("pointSize").value;
    const pointOpacity = document.getElementById("pointOpacity").value;

    console.log("New map settings:", { mapStyle, pointSize, pointOpacity });

    this.settings = {
      ...this.settings,
      pointSize,
      pointOpacity,
    };

    if (!this.scrollManager || !this.scrollManager.map) {
      console.warn("ScrollManager or map not available");
      return;
    }

    const map = this.scrollManager.map;

    // If only changing point size or opacity (not style)
    if (map.getLayer("incidents-layer")) {
      console.log("Updating point properties:", { pointSize, pointOpacity });

      try {
        map.setPaintProperty(
          "incidents-layer",
          "circle-radius",
          parseInt(pointSize)
        );
        map.setPaintProperty(
          "incidents-layer",
          "circle-opacity",
          parseFloat(pointOpacity)
        );
        console.log("Successfully updated point properties");
        return; // Exit early if we're only updating point properties
      } catch (error) {
        console.error("Error updating point properties:", error);
      }
    }

    // If changing style or layer doesn't exist
    if (mapStyle) {
      console.log("Setting map style to:", mapStyle);
      map.setStyle(`mapbox://styles/mapbox/${mapStyle}`);

      // Wait for the style to load before updating point properties
      map.once("style.load", () => {
        console.log("Map style loaded, recreating layer");

        if (this.dataManager) {
          const geojsonData = this.dataManager.getGeoJSON();

          // Add source if it doesn't exist
          if (!map.getSource("incidents")) {
            map.addSource("incidents", {
              type: "geojson",
              data: geojsonData,
            });
          }

          // Add layer if it doesn't exist
          if (!map.getLayer("incidents-layer")) {
            map.addLayer({
              id: "incidents-layer",
              type: "circle",
              source: "incidents",
              paint: {
                "circle-radius": parseInt(pointSize),
                "circle-opacity": parseFloat(pointOpacity),
                "circle-color": [
                  "match",
                  ["get", "severity"],
                  "severe",
                  this.colorSchemes[this.settings.colorScheme].severe,
                  "minor",
                  this.colorSchemes[this.settings.colorScheme].minor,
                  this.colorSchemes[this.settings.colorScheme].minor,
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
