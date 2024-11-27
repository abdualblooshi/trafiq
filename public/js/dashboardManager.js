// public/js/dashboardManager.js

// Utility function to animate number counting
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * (end - start) + start);
    element.textContent = currentValue;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Data processing functions
function processIncidentTypesData(incidents) {
  const typeCounts = {};
  incidents.forEach((incident) => {
    const type = incident.type || "Unknown"; // Handle undefined type
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  return {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        data: Object.values(typeCounts),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
      },
    ],
  };
}

function processHourlyData(incidents) {
  const hourCounts = new Array(24).fill(0);
  incidents.forEach((incident) => {
    const hour = new Date(incident.timestamp).getHours();
    hourCounts[hour]++;
  });

  return {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Incidents",
        data: hourCounts,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };
}

function processSeverityData(incidents) {
  const severityCounts = {
    low: 0,
    medium: 0,
    high: 0,
  };
  incidents.forEach((incident) => {
    const severity = (incident.severity || "low").toLowerCase();
    severityCounts[severity]++;
  });

  return {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        data: Object.values(severityCounts),
        backgroundColor: [
          "rgba(75, 192, 192, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(255, 99, 132, 0.8)",
        ],
      },
    ],
  };
}

function processMonthlyData(incidents) {
  const monthCounts = new Array(12).fill(0);
  incidents.forEach((incident) => {
    const month = new Date(incident.timestamp).getMonth();
    monthCounts[month]++;
  });

  return {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Monthly Incidents",
        data: monthCounts,
        borderColor: "rgba(153, 102, 255, 1)",
        tension: 0.1,
      },
    ],
  };
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const dataManager = new DataManager();
    const incidents = await dataManager.loadData();

    // Update total incidents count with animation
    const totalElement = document.getElementById("totalIncidents");
    animateValue(totalElement, 0, incidents.length, 2000);

    // Update severe incidents count
    const severeIncidents = incidents.filter(
      (incident) => (incident.severity || "").toLowerCase() === "high"
    ).length;
    const severeElement = document.getElementById("severeIncidents");
    animateValue(severeElement, 0, severeIncidents, 2000);

    // Initialize all charts
    const charts = initializeCharts(incidents);
    window.dashboardCharts = charts; // Make charts globally available

    // Setup filter listeners
    setupFilterListeners(incidents);

    // Initialize map
    initializeMap(incidents);
  } catch (error) {
    console.error("Dashboard initialization error:", error);
  }
});

function initializeCharts(incidents) {
  const charts = {
    incidentTypes: new Chart(
      document.getElementById("incidentTypesChart").getContext("2d"),
      {
        type: "bar",
        data: processIncidentTypesData(incidents),
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      }
    ),

    hourlyDistribution: new Chart(
      document.getElementById("hourlyDistributionChart").getContext("2d"),
      {
        type: "line",
        data: processHourlyData(incidents),
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      }
    ),

    severity: new Chart(
      document.getElementById("severityChart").getContext("2d"),
      {
        type: "doughnut",
        data: processSeverityData(incidents),
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      }
    ),

    monthlyTrend: new Chart(
      document.getElementById("monthlyTrendChart").getContext("2d"),
      {
        type: "line",
        data: processMonthlyData(incidents),
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      }
    ),
  };

  return charts;
}

function setupFilterListeners(incidents) {
  const filters = ["severity", "time"];
  filters.forEach((filter) => {
    const filterElement = document.getElementById(`${filter}Filter`);
    if (filterElement) {
      filterElement.addEventListener("change", () => {
        updateChartsWithFilters(incidents);
      });
    }
  });
}

function updateChartsWithFilters(incidents) {
  const severityFilter = document.getElementById("severityFilter").value;
  const timeFilter = document.getElementById("timeFilter").value;

  let filteredIncidents = incidents;

  // Apply severity filter
  if (severityFilter !== "all") {
    filteredIncidents = filteredIncidents.filter(
      (incident) => (incident.severity || "").toLowerCase() === severityFilter
    );
  }

  // Apply time filter
  if (timeFilter !== "all") {
    filteredIncidents = filteredIncidents.filter((incident) => {
      const hour = new Date(incident.timestamp).getHours();
      switch (timeFilter) {
        case "morning":
          return hour >= 6 && hour < 12;
        case "afternoon":
          return hour >= 12 && hour < 18;
        case "evening":
          return hour >= 18 && hour < 24;
        case "night":
          return hour >= 0 && hour < 6;
        default:
          return true;
      }
    });
  }

  // Update all charts with filtered data
  if (window.dashboardCharts) {
    window.dashboardCharts.incidentTypes.data =
      processIncidentTypesData(filteredIncidents);
    window.dashboardCharts.hourlyDistribution.data =
      processHourlyData(filteredIncidents);
    window.dashboardCharts.severity.data =
      processSeverityData(filteredIncidents);
    window.dashboardCharts.monthlyTrend.data =
      processMonthlyData(filteredIncidents);

    // Update all charts
    Object.values(window.dashboardCharts).forEach((chart) => chart.update());
  }
}

function initializeMap(incidents) {
  const mapElement = document.getElementById("heatmap");
  if (!mapElement) return;

  mapboxgl.accessToken = "your_mapbox_token_here";
  const map = new mapboxgl.Map({
    container: "heatmap",
    style: "mapbox://styles/mapbox/dark-v10",
    center: [55.2708, 25.2048], // Dubai coordinates
    zoom: 10,
  });

  map.on("load", () => {
    // Add heatmap data
    map.addSource("incidents", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: incidents.map((incident) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [incident.longitude, incident.latitude],
          },
        })),
      },
    });

    map.addLayer({
      id: "incidents-heat",
      type: "heatmap",
      source: "incidents",
      paint: {
        "heatmap-weight": 1,
        "heatmap-intensity": 1,
        "heatmap-color": [
          "interpolate",
          ["linear"],
          ["heatmap-density"],
          0,
          "rgba(0, 0, 255, 0)",
          0.2,
          "royalblue",
          0.4,
          "cyan",
          0.6,
          "lime",
          0.8,
          "yellow",
          1,
          "red",
        ],
        "heatmap-radius": 20,
      },
    });
  });
}
