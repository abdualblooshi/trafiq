class ScrollManager {
  constructor(dataManager) {
    this.map = null;
    this.dataManager = dataManager;
    this.currentStep = null;
    this.scroller = scrollama();
    this.progressThreshold = 50; // Add fixed threshold value
  }

  async initialize() {
    try {
      await this.initMap();
      const stats = this.dataManager.getStatistics();
      this.updateStoryContent(stats);
      this.setupScroll();
    } catch (error) {
      console.error("Error initializing ScrollManager:", error);
    }
  }

  setupScroll() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.initializeScroller()
      );
    } else {
      this.initializeScroller();
    }
  }

  initializeScroller() {
    try {
      const steps = document.querySelectorAll(".story-step");
      if (steps.length === 0) {
        console.error("No story steps found");
        return;
      }

      this.scroller
        .setup({
          step: ".story-step",
          offset: 0.5,
          progress: true,
          threshold: 1, // Add fixed threshold
          debug: false,
        })
        .onStepEnter((response) => {
          try {
            const { element, direction } = response;

            // Remove active class from all steps
            document.querySelectorAll(".story-step").forEach((el) => {
              el.classList.remove("is-active");
            });

            // Add active class to current step
            element.classList.add("is-active");

            const location = element.dataset.location;
            if (location && this.map) {
              const [lat, lng, zoom] = location.split(",").map(Number);
              this.map.flyTo({
                center: [lng, lat],
                zoom: zoom,
                duration: 2000,
              });
            }
          } catch (error) {
            console.error("Error in onStepEnter:", error);
          }
        });

      // Add resize handler with debouncing
      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          try {
            this.scroller.resize();
          } catch (error) {
            console.error("Error resizing scroller:", error);
          }
        }, 250);
      });
    } catch (error) {
      console.error("Error initializing scroller:", error);
    }
  }

  updateStoryContent(stats) {
    if (!stats) {
      console.warn("No stats available for story content");
      stats = {
        totalIncidents: 0,
        severeIncidents: 0,
        byType: {},
        byArea: {
          downtown: 0,
          marina: 0,
          deira: 0,
          other: 0,
        },
      };
    }

    const storyContainer = document.querySelector(".story-sections");
    if (!storyContainer) {
      console.error("Story container not found");
      return;
    }

    try {
      storyContainer.innerHTML = `
        <div class="story-step" data-step="intro" data-location="25.2048,55.2708,11">
          <div class="story-step-content">
            <h2 class="text-3xl font-bold mb-4">Traffic Incidents in Dubai</h2>
            <p class="text-lg">Analyzing ${stats.totalIncidents} traffic incidents, including ${stats.severeIncidents} severe cases.</p>
          </div>
        </div>

        <div class="story-step" data-step="downtown" data-location="25.1972,55.2744,14">
          <div class="story-step-content">
            <h3 class="text-2xl font-bold mb-4">Downtown Dubai</h3>
            <p class="text-lg">The downtown area has recorded ${stats.byArea.downtown} incidents.</p>
          </div>
        </div>

        <div class="story-step" data-step="marina" data-location="25.0806,55.1417,15">
          <div class="story-step-content">
            <h3 class="text-2xl font-bold mb-4">Dubai Marina</h3>
            <p class="text-lg">The Marina area has seen ${stats.byArea.marina} incidents.</p>
          </div>
        </div>`;
    } catch (error) {
      console.error("Error updating story content:", error);
    }
  }

  async initMap() {
    try {
      const response = await fetch("/mapbox-token");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!data.token) {
        throw new Error("No Mapbox token received");
      }

      mapboxgl.accessToken = data.token;

      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v10",
        center: [55.2708, 25.2048], // Dubai coordinates
        zoom: 11,
        interactive: true,
        scrollZoom: false,
      });

      this.map.on("load", () => {
        console.log("Map loaded");
        this.addDataLayers();
      });

      this.map.addControl(new mapboxgl.NavigationControl(), "top-right");

      return true;
    } catch (error) {
      console.error("Error initializing map:", error);
      // Add a visible error message to the map container
      const mapContainer = document.getElementById("map");
      if (mapContainer) {
        mapContainer.innerHTML = `
          <div class="flex items-center justify-center h-full bg-gray-900">
            <div class="text-center p-4">
              <h3 class="text-xl text-red-500 mb-2">Map Loading Error</h3>
              <p class="text-gray-300">${error.message}</p>
            </div>
          </div>
        `;
      }
      return false;
    }
  }

  addDataLayers() {
    if (!this.dataManager.processedData) {
      console.error("No processed data available");
      return;
    }

    const geojsonData = this.dataManager.getGeoJSON();
    console.log("GeoJSON data sample:", {
      type: geojsonData.type,
      featureCount: geojsonData.features.length,
      sampleFeature: geojsonData.features[0],
    });

    try {
      // Remove existing layers if they exist
      if (this.map.getLayer("incidents-layer")) {
        this.map.removeLayer("incidents-layer");
      }
      if (this.map.getSource("incidents")) {
        this.map.removeSource("incidents");
      }

      this.map.addSource("incidents", {
        type: "geojson",
        data: geojsonData,
      });

      this.map.addLayer({
        id: "incidents-layer",
        type: "circle",
        source: "incidents",
        paint: {
          "circle-radius": 6,
          "circle-color": [
            "match",
            ["get", "severity"],
            "severe",
            "#ff0000",
            "minor",
            "#ffa500",
            "#ffffff",
          ],
          "circle-opacity": 0.7,
        },
      });
      console.log("Successfully added map layers");
    } catch (error) {
      console.error("Error adding layers:", error);
    }
  }

  updateMapStyle(style) {
    this.map.setStyle(`mapbox://styles/mapbox/${style}`);
  }

  updatePointStyle(size, opacity) {
    if (this.map.getLayer("incidents-layer")) {
      this.map.setPaintProperty(
        "incidents-layer",
        "circle-radius",
        parseInt(size)
      );
      this.map.setPaintProperty(
        "incidents-layer",
        "circle-opacity",
        parseFloat(opacity)
      );
    }
  }
}
