class ScrollManager {
  constructor(dataManager) {
    this.map = null;
    this.dataManager = dataManager;
    this.currentStep = null;
    this.scroller = scrollama();
    this.progressThreshold = 50;
    this.chartInstances = []; // Track chart instances for cleanup
    this.chartData = null; // Cache for chart data
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
          threshold: 1,
          debug: false,
        })
        .onStepEnter((response) => {
          try {
            const { element, direction } = response;

            document.querySelectorAll(".story-step").forEach((el) => {
              el.classList.remove("is-active");
            });

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

  async fetchAndProcessData() {
    if (this.chartData) {
      return this.chartData;
    }

    try {
      // Use the existing processed data from dataManager instead of fetching again
      const incidents = this.dataManager.processedData;

      if (!incidents || !Array.isArray(incidents)) {
        throw new Error("No incident data available from dataManager");
      }

      console.log("Processing incidents for charts:", incidents.length);

      // Process monthly data
      const monthlyData = {};
      const severityData = { severe: 0, minor: 0 };

      incidents.forEach((incident) => {
        // Update severity counts
        severityData[incident.severity]++;

        // Create date object from incident time
        const incidentDate = new Date(incident.acci_time);

        // Skip invalid dates
        if (isNaN(incidentDate.getTime())) {
          console.warn("Invalid date:", incident.acci_time);
          return;
        }

        // Update monthly data
        const monthKey = incidentDate.toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            severe: 0,
            minor: 0,
          };
        }
        monthlyData[monthKey][incident.severity]++;
      });

      console.log("Processed chart data:", {
        monthlyData: Object.keys(monthlyData).length,
        severityData,
      });

      this.chartData = {
        monthlyData,
        severityData,
      };

      return this.chartData;
    } catch (error) {
      console.error("Error processing data for charts:", error);
      throw error;
    }
  }

  async setupCharts(chartContainers) {
    if (typeof Chart === "undefined") {
      console.error("Chart.js not loaded");
      chartContainers.forEach((container) => {
        container.innerHTML =
          '<div class="error">Chart.js library not available</div>';
      });
      return;
    }

    chartContainers.forEach((container) => {
      container.innerHTML = '<div class="loading">Loading chart data...</div>';
    });

    try {
      const data = await this.fetchAndProcessData();
      console.log("Chart data received:", data);

      if (!data || !data.severityData) {
        throw new Error("Invalid chart data structure");
      }

      Chart.defaults.color = "#fff";
      Chart.defaults.borderColor = "rgba(255,255,255,0.1)";

      chartContainers.forEach((container) => {
        try {
          const chartType = container.dataset.chartType;
          const canvas = document.createElement("canvas");
          container.innerHTML = "";
          container.appendChild(canvas);
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            throw new Error("Could not get canvas context");
          }

          if (chartType === "pie") {
            const { severityData } = data;
            const total = severityData.severe + severityData.minor;

            console.log("Creating pie chart with data:", severityData);

            if (total === 0) {
              container.innerHTML =
                '<div class="error">No incident data available</div>';
              return;
            }

            const pieChart = new Chart(ctx, {
              type: "doughnut",
              data: {
                labels: ["Severe Incidents", "Minor Incidents"],
                datasets: [
                  {
                    data: [severityData.severe, severityData.minor],
                    backgroundColor: ["#ef4444", "#f97316"],
                    borderWidth: 2,
                    borderColor: "#1f2937",
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              },
            });
            this.chartInstances.push(pieChart);
          } else if (chartType === "line") {
            const { monthlyData } = data;
            const months = Object.keys(monthlyData).sort(
              (a, b) => new Date("1 " + a) - new Date("1 " + b)
            );

            console.log("Creating line chart with months:", months);

            const lineChart = new Chart(ctx, {
              type: "line",
              data: {
                labels: months,
                datasets: [
                  {
                    label: "Severe Incidents",
                    data: months.map((m) => monthlyData[m].severe),
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: "Minor Incidents",
                    data: months.map((m) => monthlyData[m].minor),
                    borderColor: "#f97316",
                    backgroundColor: "rgba(249, 115, 22, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
              },
            });
            this.chartInstances.push(lineChart);
          }
        } catch (error) {
          console.error(
            `Error creating ${container.dataset.chartType} chart:`,
            error
          );
          container.innerHTML = `<div class="error">Error creating chart: ${error.message}</div>`;
        }
      });
    } catch (error) {
      console.error("Error setting up charts:", error);
      chartContainers.forEach((container) => {
        container.innerHTML = `<div class="error">Failed to load chart: ${error.message}</div>`;
      });
    }
  }

  updateStoryContent(stats) {
    if (!stats) {
      console.warn("No stats available for story content");
      stats = {
        totalIncidents: 0,
        severeIncidents: 0,
        byType: {},
        byTime: {},
        byArea: {
          downtown: 0,
          marina: 0,
          deira: 0,
          other: 0,
        },
      };
    }

    stats.byType = stats.byType || {};
    stats.byTime = stats.byTime || {};
    stats.byHour = stats.byHour || Array(24).fill(0);

    const storyContainer = document.querySelector(".story-sections");
    if (!storyContainer) {
      console.error("Story container not found");
      return;
    }

    try {
      console.log("Stats data for charts:", stats);
      console.log("Incidents by type:", stats.byType);
      console.log("Incidents by area:", stats.byArea);

      storyContainer.innerHTML = `
        <div class="story-step rounded-lg p-6 mb-8" data-step="intro" data-location="25.2048,55.2708,11">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-car-crash text-red-500 text-3xl mr-4"></i>
              <h2 class="text-3xl font-bold text-white">Traffic Incidents in Dubai</h2>
            </div>
            <div class="flex items-center space-x-8">
              <div class="flex items-center">
                <i class="fas fa-chart-line text-blue-400 text-xl mr-2"></i>
                <p class="text-lg text-gray-200">
                  <span class="font-bold text-blue-400">${stats.totalIncidents || 0}</span> total incidents
                </p>
              </div>
              <div class="flex items-center">
                <i class="fas fa-exclamation-triangle text-red-500 text-xl mr-2"></i>
                <p class="text-lg text-gray-200">
                  <span class="font-bold text-red-500">${stats.severeIncidents || 0}</span> severe cases
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="downtown" data-location="25.1972,55.2744,14">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-building text-yellow-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Downtown Dubai</h3>
            </div>
            <div class="text-gray-200">
              <p>The bustling heart of Dubai, where modern architecture meets urban mobility challenges.</p>
              <div class="mt-2 flex items-center">
                <span class="w-4 h-4 rounded-full bg-yellow-500 mr-2"></span>
                <span>High density traffic area</span>
              </div>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="marina" data-location="25.0806,55.1417,15">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-ship text-blue-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Dubai Marina</h3>
            </div>
            <div class="text-gray-200">
              <p>A waterfront district with unique traffic patterns influenced by tourism and residential density.</p>
              <div class="mt-2 flex items-center">
                <span class="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                <span>Mixed-use zone</span>
              </div>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="incidents-by-type" data-location="25.2841,55.3712,14">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-chart-pie text-purple-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Incidents by Type</h3>
            </div>
            <div class="text-gray-200 mb-4">
              <p>Distribution of different types of traffic incidents</p>
            </div>
            <div class="chart-container" data-chart-type="pie" style="height: 300px;"></div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="incidents-by-time" data-location="25.2285,55.2867,15">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-clock text-green-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Incidents Over Time</h3>
            </div>
            <div class="text-gray-200 mb-4">
              <p>Monthly trends of different incident types from April 2023 to August 2024</p>
            </div>
            <div class="chart-container" data-chart-type="line" style="height: 300px;"></div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6" data-step="al-qouz" data-location="25.1376,55.2313,14">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-industry text-orange-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Al Quoz Industrial Area</h3>
            </div>
            <div class="text-gray-200">
              <p>Industrial zone with heavy vehicle traffic and unique safety considerations.</p>
              <div class="mt-2 flex items-center">
                <span class="w-4 h-4 rounded-full bg-orange-500 mr-2"></span>
                <span>Industrial zone</span>
              </div>
            </div>
          </div>
        </div>`;

      const chartContainers = document.querySelectorAll(".chart-container");
      this.setupCharts(chartContainers);
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
        center: [55.2708, 25.2048],
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
