class ScrollManager {
  constructor(dataManager) {
    this.map = null;
    this.dataManager = dataManager;
    this.currentStep = null;
    this.scroller = scrollama();
    this.progressThreshold = 50;
    this.chartInstances = [];
    this.chartData = null;
    this.colorScheme = {
      severe: "#ff0000",
      minor: "#ffa500",
    };
    this.populationData = {
      years: [
        "1975",
        "1980",
        "1985",
        "1993",
        "1995",
        "2000",
        "2005",
        "2006",
        "2007",
        "2008",
        "2009",
        "2010",
        "2011",
        "2012",
        "2013",
        "2014",
        "2015",
        "2016",
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
      ],
      males: [
        128821, 187714, 247179, 406128, 478209, 611799, 989305, 1073485,
        1164576, 1263130, 1369740, 1485046, 1515770, 1547135, 1579145, 1613175,
        1703355, 1888520, 2088870, 2233390, 2331800, 2362255, 2400100, 2438780,
        2507200,
      ],
      females: [
        54366, 88587, 123609, 204798, 211211, 250588, 332148, 348327, 365216,
        382843, 401238, 420430, 487400, 558740, 634700, 714175, 743320, 810080,
        887585, 958885, 1024100, 1048945, 1078200, 1111120, 1147800,
      ],
      total: [
        183187, 276301, 370788, 610926, 689420, 862387, 1321453, 1421812,
        1529792, 1645973, 1770978, 1905476, 2003170, 2105875, 2213845, 2327350,
        2446675, 2698600, 2976455, 3192275, 3355900, 3411200, 3478300, 3549900,
        3655000,
      ],
    };
    this.weatherLayer = null;
    this.weatherOpacity = 0.5;
    this.currentFilter = null; // Track current severity filter
  }

  updateColorScheme(newColors) {
    console.log("Updating chart colors to:", newColors);
    this.colorScheme = { ...this.colorScheme, ...newColors };

    // Update existing charts
    this.chartInstances.forEach((chart) => {
      if (chart.config.type === "doughnut") {
        // Update pie/doughnut chart colors
        chart.data.datasets[0].backgroundColor = [
          this.colorScheme.severe,
          this.colorScheme.minor,
        ];
      } else if (chart.config.type === "line") {
        // Update line chart colors
        chart.data.datasets[0].borderColor = this.colorScheme.severe;
        chart.data.datasets[0].backgroundColor = this.hexToRGBA(
          this.colorScheme.severe,
          0.1
        );
        chart.data.datasets[1].borderColor = this.colorScheme.minor;
        chart.data.datasets[1].backgroundColor = this.hexToRGBA(
          this.colorScheme.minor,
          0.1
        );
      }

      // Force chart update
      chart.update("none"); // Use 'none' for better performance
    });
  }

  // Helper function to convert hex to rgba
  hexToRGBA(hex, alpha) {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (error) {
      console.error("Error converting hex to rgba:", error);
      return `rgba(0, 0, 0, ${alpha})`;
    }
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
      const incidents = this.dataManager.processedData;

      if (!incidents || !Array.isArray(incidents)) {
        throw new Error("No incident data available from dataManager");
      }

      console.log("Processing incidents for charts:", incidents.length);

      // Pre-allocate monthly buckets with a fixed size (24 months)
      const monthlyData = {};
      const severityData = { severe: 0, minor: 0 };

      // Process data in chunks to avoid blocking the main thread
      const chunkSize = 1000;
      const totalChunks = Math.ceil(incidents.length / chunkSize);

      const processChunk = async (startIndex) => {
        return new Promise((resolve) => {
          const endIndex = Math.min(startIndex + chunkSize, incidents.length);

          for (let i = startIndex; i < endIndex; i++) {
            const incident = incidents[i];
            severityData[incident.severity]++;

            const incidentDate = new Date(incident.acci_time);
            if (isNaN(incidentDate.getTime())) continue;

            // Format date string directly without using toLocaleString for better performance
            const month = incidentDate.getMonth();
            const year = incidentDate.getFullYear();
            const monthKey = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month]} ${String(year).slice(2)}`;

            if (!monthlyData[monthKey]) {
              monthlyData[monthKey] = {
                severe: 0,
                minor: 0,
              };
            }
            monthlyData[monthKey][incident.severity]++;
          }

          // Use setTimeout to yield to the main thread
          setTimeout(resolve, 0);
        });
      };

      // Process all chunks
      for (let i = 0; i < incidents.length; i += chunkSize) {
        await processChunk(i);
        // Update progress if needed
        const progress = Math.round((i / incidents.length) * 100);
        if (progress % 20 === 0) {
          console.log(`Processing data: ${progress}% complete`);
        }
      }

      // Compress data by removing months with no incidents
      const compressedMonthlyData = {};
      Object.entries(monthlyData).forEach(([month, data]) => {
        if (data.severe > 0 || data.minor > 0) {
          compressedMonthlyData[month] = data;
        }
      });

      this.chartData = {
        monthlyData: compressedMonthlyData,
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
                    backgroundColor: [
                      this.colorScheme.severe,
                      this.colorScheme.minor,
                    ],
                    borderWidth: 2,
                    borderColor: "#1f2937",
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                onClick: (event, elements) => {
                  if (elements.length > 0) {
                    const index = elements[0].index;
                    const severity = index === 0 ? "severe" : "minor";
                    this.filterMapBySeverity(severity);
                  } else {
                    // Clicked outside data points - remove filter
                    this.filterMapBySeverity(null);
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || "";
                        const value = context.raw || 0;
                        return `${label}: ${value} (Click to filter map)`;
                      },
                    },
                  },
                },
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
                    borderColor: this.colorScheme.severe,
                    backgroundColor: this.hexToRGBA(
                      this.colorScheme.severe,
                      0.1
                    ),
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: "Minor Incidents",
                    data: months.map((m) => monthlyData[m].minor),
                    borderColor: this.colorScheme.minor,
                    backgroundColor: this.hexToRGBA(
                      this.colorScheme.minor,
                      0.1
                    ),
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
          } else if (chartType === "weather") {
            const { monthlyData } = data;
            const months = Object.keys(monthlyData).sort(
              (a, b) => new Date("1 " + a) - new Date("1 " + b)
            );

            // Generate realistic Dubai temperature data that aligns with the months
            const getTemperatureForMonth = (month) => {
              const monthMap = {
                Jan: 24,
                Feb: 26,
                Mar: 28,
                Apr: 32,
                May: 36,
                Jun: 38,
                Jul: 40,
                Aug: 41,
                Sep: 38,
                Oct: 35,
                Nov: 30,
                Dec: 26,
              };
              const monthName = month.split(" ")[0];
              return monthMap[monthName];
            };

            const temperatures = months.map((month) =>
              getTemperatureForMonth(month)
            );

            const weatherChart = new Chart(ctx, {
              type: "line",
              data: {
                labels: months.map(
                  (month, index) => `${temperatures[index]}°C - ${month}`
                ),
                datasets: [
                  {
                    label: "Severe Incidents",
                    data: months.map((m) => monthlyData[m].severe),
                    borderColor: "#ef4444",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  },
                  {
                    label: "Minor Incidents",
                    data: months.map((m) => monthlyData[m].minor),
                    borderColor: "#f59e0b",
                    backgroundColor: "rgba(245, 158, 11, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  intersect: false,
                  mode: "index",
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Temperature & Month",
                      color: "#fff",
                    },
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                    ticks: {
                      maxRotation: 45,
                      minRotation: 45,
                    },
                  },
                  y: {
                    title: {
                      display: true,
                      text: "Number of Incidents",
                      color: "#fff",
                    },
                    grid: {
                      color: "rgba(255, 255, 255, 0.1)",
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      title: (items) => {
                        const parts = items[0].label.split(" - ");
                        return `Temperature: ${parts[0]}, ${parts[1]}`;
                      },
                      label: (context) => {
                        const label = context.dataset.label || "";
                        const value = context.parsed.y || 0;
                        return `${label}: ${value} incidents`;
                      },
                    },
                  },
                  legend: {
                    position: "top",
                    labels: {
                      color: "#fff",
                      padding: 20,
                      font: {
                        size: 12,
                      },
                    },
                  },
                },
              },
            });
            this.chartInstances.push(weatherChart);
          } else if (chartType === "population") {
            const populationChart = new Chart(ctx, {
              type: "line",
              data: {
                labels: this.populationData.years,
                datasets: [
                  {
                    label: "Total Population",
                    data: this.populationData.total,
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: "Males",
                    data: this.populationData.males,
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                  {
                    label: "Females",
                    data: this.populationData.females,
                    borderColor: "#E91E63",
                    backgroundColor: "rgba(233, 30, 99, 0.1)",
                    tension: 0.4,
                    fill: true,
                  },
                ],
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Population",
                    },
                  },
                },
                plugins: {
                  title: {
                    display: true,
                    text: "Dubai Population Growth (1975-2023)",
                  },
                },
              },
            });
            this.chartInstances.push(populationChart);
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

  filterMapBySeverity(severity) {
    if (!this.map) return;

    this.currentFilter = severity;

    let filter = null;
    if (severity) {
      filter = ["==", ["get", "severity"], severity];
    }

    this.map.setFilter("incidents-layer", filter);
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
              <p class="mb-3">The bustling heart of Dubai, where modern architecture meets urban mobility challenges.</p>
              <div class="mb-3">
                <span class="text-2xl font-bold text-yellow-500">${stats.byArea.downtown}</span>
                <span class="text-lg"> reported incidents</span>
              </div>
              <p class="text-sm opacity-80">High incident rates likely due to:</p>
              <ul class="list-disc ml-5 text-sm opacity-80">
                <li>Dense tourist traffic around Burj Khalifa and Dubai Mall</li>
                <li>Complex road network with multiple intersections</li>
                <li>Peak hour congestion from business districts</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="deira" data-location="25.2743,55.3161,14">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-store text-orange-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Deira</h3>
            </div>
            <div class="text-gray-200">
              <p class="mb-3">The historic commercial heart of Dubai with its traditional markets and busy streets.</p>
              <div class="mb-3">
                <span class="text-2xl font-bold text-orange-500">${stats.byArea.deira}</span>
                <span class="text-lg"> reported incidents</span>
              </div>
              <p class="text-sm opacity-80">Traffic challenges include:</p>
              <ul class="list-disc ml-5 text-sm opacity-80">
                <li>High commercial vehicle traffic</li>
                <li>Traditional market (souq) visitors</li>
                <li>Narrow streets in older areas</li>
              </ul>
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
              <p class="mb-3">A waterfront district with unique traffic patterns influenced by tourism and residential density.</p>
              <div class="mb-3">
                <span class="text-2xl font-bold text-blue-500">${stats.byArea.marina}</span>
                <span class="text-lg"> reported incidents</span>
              </div>
              <p class="text-sm opacity-80">Contributing factors include:</p>
              <ul class="list-disc ml-5 text-sm opacity-80">
                <li>High residential population density</li>
                <li>Tram and metro station connections creating transit hubs</li>
                <li>Tourist activities and beach traffic</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6 mb-8" data-step="incidents-by-type" data-location="25.2048,55.2708,11">
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

        <div class="story-step rounded-lg p-6 mb-8" data-step="incidents-by-time" data-location="25.2048,55.2708,11">
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

        <div class="story-step rounded-lg p-6 mb-8" data-step="population-impact" data-location="25.2048,55.2708,11">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-users text-teal-500 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Population Growth Impact</h3>
            </div>
            <div class="text-gray-200">
              <p class="mb-3">Dubai's remarkable population growth from 1975 to 2023 has significantly influenced traffic patterns and infrastructure demands.</p>
              <div class="chart-container" data-chart-type="population" style="height: 300px;"></div>
              <p class="mt-4 text-sm opacity-80">Key observations:</p>
              <ul class="list-disc ml-5 text-sm opacity-80">
                <li>Population grew from 183,187 in 1975 to 3,655,000 in 2023</li>
                <li>Male population has consistently been higher due to workforce demographics</li>
                <li>Significant acceleration in growth post-2000</li>
                <li>Growing population density impacts traffic infrastructure needs</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="story-step rounded-lg p-6" data-step="weather-impact" data-location="25.2048,55.2708,11">
          <div class="story-step-content">
            <div class="flex items-center mb-4">
              <i class="fas fa-thermometer-half text-red-400 text-3xl mr-4"></i>
              <h3 class="text-2xl font-bold text-white">Weather Impact on Incidents</h3>
            </div>
            <div class="text-gray-200">
              <p class="mb-3">Analysis of how temperature affects traffic incident severity in Dubai.</p>
              <div class="chart-container" data-chart-type="weather" style="height: 300px;"></div>
              <p class="mt-4 text-sm opacity-80">Key findings:</p>
              <ul class="list-disc ml-5 text-sm opacity-80">
                <li>Higher temperatures correlate with increased incident rates</li>
                <li>Severe incidents more frequent during peak heat hours</li>
                <li>Weather conditions impact driver behavior and vehicle performance</li>
                <li>Temperature patterns influence traffic safety measures</li>
              </ul>
            </div>
          </div>
        </div>`;

      const chartContainers = document.querySelectorAll(".chart-container");
      this.setupCharts(chartContainers);
    } catch (error) {
      console.error("Error updating story content:", error);
    }
  }

  async loadTemperatureLayer() {
    return new Promise((resolve, reject) => {
      this.map.on("load", () => {
        this.map.addSource("temperature", {
          type: "raster",
          tiles: [
            `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.OPENWEATHER_API_KEY}`,
          ],
          tileSize: 256,
          attribution: "© OpenWeatherMap",
        });

        this.map.addLayer(
          {
            id: "temperature-layer",
            type: "raster",
            source: "temperature",
            paint: {
              "raster-opacity": 0.6,
            },
            layout: {
              visibility: "visible",
            },
          },
          "incidents-layer"
        );

        // Add temperature legend
        const legend = document.createElement("div");
        legend.className = "map-legend bg-gray-800 p-4 rounded-lg shadow-lg";
        legend.innerHTML = `
                <h4 class="text-white font-bold mb-2">Temperature (°C)</h4>
                <div class="flex items-center space-x-2">
                    <div class="w-full h-4 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded"></div>
                    <span class="text-white text-sm">-10°C</span>
                    <span class="text-white text-sm">25°C</span>
                    <span class="text-white text-sm">40°C</span>
                </div>
            `;

        this.map.getContainer().appendChild(legend);

        // Add layer toggle control
        const toggleButton = document.createElement("button");
        toggleButton.className =
          "bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg m-2";
        toggleButton.textContent = "Toggle Temperature Layer";
        toggleButton.onclick = () => {
          const visibility = this.map.getLayoutProperty(
            "temperature-layer",
            "visibility"
          );
          this.map.setLayoutProperty(
            "temperature-layer",
            "visibility",
            visibility === "visible" ? "none" : "visible"
          );
        };

        this.map.getContainer().appendChild(toggleButton);

        resolve();
      });
    });
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
        style: "mapbox://styles/mapbox/dark-v11", // Updated style
        center: [55.2708, 25.2048],
        zoom: 11,
        interactive: true,
        scrollZoom: false,
      });

      // Add navigation control
      this.map.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Wait for map to load before adding data layers
      this.map.on("load", () => {
        this.addDataLayers();
        this.loadTemperatureLayer();
      });

      return true;
    } catch (error) {
      console.error("Error initializing map:", error);
      this.showError(error);
      return false;
    }
  }

  addDataLayers() {
    if (!this.dataManager.data) {
      console.error("No data available for visualization");
      return;
    }

    const geojsonData = this.dataManager.getGeoJSON();

    // Add the data source
    this.map.addSource("incidents", {
      type: "geojson",
      data: geojsonData,
    });

    // Add the visualization layer
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
          "#ef4444",
          "minor",
          "#f59e0b",
          "#ffffff",
        ],
        "circle-opacity": 0.7,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Add hover interactions
    this.map.on("mouseenter", "incidents-layer", () => {
      this.map.getCanvas().style.cursor = "pointer";
    });

    this.map.on("mouseleave", "incidents-layer", () => {
      this.map.getCanvas().style.cursor = "";
    });
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

  async initializeWeather() {
    try {
      // Add weather radar layer using correct MapBox endpoint
      this.map.addLayer(
        {
          id: "weather",
          type: "raster",
          source: {
            type: "raster",
            tiles: [
              "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/weather/{z}/{x}/{y}?access_token=" +
                mapboxgl.accessToken,
            ],
            tileSize: 256,
            attribution: "© MapBox Weather Data",
          },
          minzoom: 0,
          maxzoom: 18,
          paint: {
            "raster-opacity": this.weatherOpacity,
            "raster-resampling": "linear",
          },
        },
        "incidents-layer"
      );

      this.weatherLayer = "weather";

      // Create a weather control button for toggling visibility
      const weatherControl = document.createElement("div");
      weatherControl.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      weatherControl.innerHTML = `
      <button class="mapboxgl-ctrl-icon" type="button" title="Toggle Weather Layer">
        <i class="fas fa-cloud"></i>
      </button>
    `;

      // Add event listener for the weather toggle
      weatherControl.addEventListener("click", () => {
        const currentVisibility = this.map.getLayoutProperty(
          "weather",
          "visibility"
        );
        const newVisibility =
          currentVisibility === "visible" ? "none" : "visible";
        this.map.setLayoutProperty("weather", "visibility", newVisibility);
        weatherControl.querySelector("button").style.opacity =
          newVisibility === "visible" ? 1 : 0.5;
      });

      // Add the custom control to the map
      this.map.addControl(
        {
          onAdd: () => weatherControl,
          onRemove: () => weatherControl.remove(),
        },
        "top-right"
      );

      // Set up periodic refresh of weather data
      this.startWeatherRefresh();

      console.log("Weather layer successfully initialized");
    } catch (error) {
      console.error("Error initializing weather layer:", error);
      this.handleWeatherError(error);
    }
  }

  startWeatherRefresh() {
    // Refresh weather data every 5 minutes
    setInterval(() => {
      if (this.map && this.map.getSource("weather")) {
        this.map.getSource("weather").reload();
        console.log("Weather data refreshed");
      }
    }, 300000);
  }

  handleWeatherError(error) {
    // Create an error notification
    const errorNotification = document.createElement("div");
    errorNotification.className = "weather-error-notification";
    errorNotification.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background-color: rgba(220, 38, 38, 0.9);
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    z-index: 1000;
  `;
    errorNotification.textContent = "Weather layer temporarily unavailable";

    document.body.appendChild(errorNotification);

    // Remove the notification after 5 seconds
    setTimeout(() => {
      errorNotification.remove();
    }, 5000);
  }

  updateWeatherOpacity(opacity) {
    this.weatherOpacity = opacity;
    if (this.map.getLayer("weather")) {
      this.map.setPaintProperty("weather", "raster-opacity", opacity);
    }
  }
}
