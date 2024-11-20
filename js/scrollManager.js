class ScrollManager {
  constructor(dataManager) {
    this.map = null;
    this.scroller = scrollama();
    this.dataManager = dataManager;
  }

  async initialize() {
    // In ScrollManager.js, update the story-sections HTML
    const stats = this.dataManager.getStatistics();

    document.querySelector(".story-sections").innerHTML = `
  <div class="story-step" data-step="intro" data-location="25.2048,55.2708,11">
    <div class="story-step-content">
      <h2 class="text-3xl font-bold mb-4">Traffic Incidents in Dubai</h2>
      <p class="text-lg">Analyzing ${
        stats.totalIncidents
      } traffic incidents, including ${stats.severeIncidents} severe cases. 
      The most common type is ${
        Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0][0]
      }.</p>
    </div>
  </div>

  <div class="story-step" data-step="downtown" data-location="25.1972,55.2744,14">
    <div class="story-step-content">
      <h3 class="text-2xl font-bold mb-4">Downtown Dubai</h3>
      <p class="text-lg">The downtown area has recorded ${
        stats.byArea.downtown
      } incidents, 
      with peak hours between ${stats.byHour.indexOf(
        Math.max(...stats.byHour)
      )}:00-${stats.byHour.indexOf(Math.max(...stats.byHour)) + 1}:00.</p>
    </div>
  </div>

  <div class="story-step" data-step="marina" data-location="25.0806,55.1417,15">
    <div class="story-step-content">
      <h3 class="text-2xl font-bold mb-4">Dubai Marina</h3>
      <p class="text-lg">The Marina area has seen ${
        stats.byArea.marina
      } incidents, 
      with ${Object.entries(stats.byType)
        .filter((t) => t[0].includes("دراجة"))
        .reduce((a, b) => a + b[1], 0)} involving motorcycles or bicycles.</p>
    </div>
  </div>
`;

    await this.initMap();
    this.initializeScroller(); // Changed method name to avoid confusion
  }

  initMap() {
    console.log(
      "Don't forget to add ACCESS TOKEN for the map to work (gotta convert this to Node.JS a7sn)"
    );
    return new Promise((resolve) => {
      mapboxgl.accessToken = ""; // NEED TO ADD ACCESS TOKEN HERE

      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/dark-v10",
        center: [55.2708, 25.2048], // Dubai coordinates
        zoom: 11,
        interactive: true,
      });

      this.map.on("load", () => {
        console.log("Map loaded");
        // Add bounds logging
        const bounds = this.map.getBounds();
        console.log("Initial map bounds:", bounds.toArray());

        this.addDataLayers();
        resolve();
      });
    });
  }

  addDataLayers() {
    if (!this.dataManager.processedData) {
      console.error("No processed data available");
      return;
    }

    const geojsonData = this.dataManager.getGeoJSON();
    console.log(
      `Adding GeoJSON data with ${geojsonData.features.length} features`
    );
    console.log("First few features:", geojsonData.features.slice(0, 3));

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

      // After adding the layer, log a few points' positions
      const source = this.map.getSource("incidents");
      if (source) {
        console.log("Source added successfully");
      }

      console.log("Data layers added successfully");
    } catch (error) {
      console.error("Error adding layers:", error);
    }
  }

  createGeoJSON(data) {
    return {
      type: "FeatureCollection",
      features: data.map((d) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [d.longitude, d.latitude], // Changed from [d.x, d.y]
        },
        properties: {
          severity: d.severity,
          type: d.acci_name,
          time: d.acci_time,
        },
      })),
    };
  }

  initializeScroller() {
    this.scroller
      .setup({
        step: ".story-step",
        offset: 0.5,
        debug: false,
      })
      .onStepEnter((response) => {
        const { element } = response;
        const location = element.dataset.location;

        if (location && this.map) {
          const [lat, lng, zoom] = location.split(",").map(Number);
          this.map.flyTo({
            center: [lng, lat],
            zoom: zoom,
            duration: 2000,
          });
        }
      });

    window.addEventListener("resize", () => this.scroller.resize());
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
