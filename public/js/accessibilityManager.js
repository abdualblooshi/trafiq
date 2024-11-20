class AccessibilityManager {
  constructor(dataManager, scrollManager) {
    this.dataManager = dataManager;
    this.scrollManager = scrollManager;
    this.settings = {
      colorScheme: "default",
      fontSize: "medium",
      contrast: "normal",
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
    const accessibilityBtn = document.getElementById("accessibility-settings");
    const mapSettingsBtn = document.getElementById("map-settings");

    accessibilityBtn.addEventListener("click", () => {
      this.showAccessibilityModal();
    });

    mapSettingsBtn.addEventListener("click", () => {
      this.showMapSettingsModal();
    });
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
    const modal = this.createAccessibilityModal();
    document.body.appendChild(modal);

    // Set current values
    Object.entries(this.settings).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) element.value = value;
    });

    // Event listeners
    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.querySelector("#applySettings").onclick = () => {
      this.applyAccessibilitySettings();
      modal.remove();
    };
  }

  showMapSettingsModal() {
    const modal = this.createMapSettingsModal();
    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.querySelector("#applyMapSettings").onclick = () => {
      this.applyMapSettings();
      modal.remove();
    };
  }

  applyAccessibilitySettings() {
    const colorScheme = document.getElementById("colorScheme").value;
    const fontSize = document.getElementById("fontSize").value;
    const contrast = document.getElementById("contrast").value;

    this.settings = { colorScheme, fontSize, contrast };
    this.dataManager.updateColorScheme(this.colorSchemes[colorScheme]);
    this.scrollManager.updateMapColors();

    // Apply font size
    document.documentElement.style.setProperty(
      "--base-font-size",
      {
        small: "14px",
        medium: "16px",
        large: "18px",
      }[fontSize]
    );

    // Apply contrast
    document.body.className = contrast === "high" ? "high-contrast" : "";
  }

  applyMapSettings() {
    const mapStyle = document.getElementById("mapStyle").value;
    const pointSize = document.getElementById("pointSize").value;
    const pointOpacity = document.getElementById("pointOpacity").value;

    this.scrollManager.updateMapStyle(mapStyle);
    this.scrollManager.updatePointStyle(pointSize, pointOpacity);
  }
}
