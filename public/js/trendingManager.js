class TrendingManager {
  constructor() {
    this.charts = {};
    this.colors = {
      primary: "#60A5FA",
      severe: "#EF4444",
      minor: "#10B981",
      night: "#312E81",
      day: "#FBBF24",
      highlight: "#F472B6",
    };
    this.selectedTimeRange = null;
    this.selectedSeverity = null;
    this.selectedLocation = null;
    this.init();
  }

  async init() {
    try {
      const dataManager = new DataManager();
      this.incidents = await dataManager.loadData();

      this.processData();
      this.initCharts();
      this.setupInteractions();
      this.setupResetButton();
    } catch (error) {
      console.error("Initialization error:", error);
    }
  }

  processData() {
    // Process hourly distribution
    this.hourlyData = Array(24).fill(0);
    this.severityData = { severe: 0, minor: 0 };
    this.locationData = [];

    this.incidents.forEach((incident) => {
      const hour = new Date(incident.acci_time).getHours();
      this.hourlyData[hour]++;

      this.severityData[incident.severity]++;

      this.locationData.push({
        hour,
        severity: incident.severity,
        lat: incident.latitude,
        lng: incident.longitude,
      });
    });
  }

  initCharts() {
    this.initHourlyChart();
    this.initSeverityChart();
    this.initLocationChart();
  }

  initHourlyChart() {
    const ctx = document.getElementById("hourlyChart").getContext("2d");
    this.charts.hourly = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Array(24)
          .fill()
          .map((_, i) => `${i}:00`),
        datasets: [
          {
            label: "Incidents",
            data: this.hourlyData,
            backgroundColor: Array(24)
              .fill()
              .map((_, i) =>
                i < 6 || i >= 18 ? this.colors.night : this.colors.day
              ),
          },
        ],
      },
      options: this.getChartOptions("Number of Incidents"),
    });
  }

  initSeverityChart() {
    const ctx = document.getElementById("severityChart").getContext("2d");
    this.charts.severity = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Severe", "Minor"],
        datasets: [
          {
            data: [this.severityData.severe, this.severityData.minor],
            backgroundColor: [this.colors.severe, this.colors.minor],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  initLocationChart() {
    const ctx = document.getElementById("locationChart").getContext("2d");
    this.charts.location = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Incidents",
            data: this.locationData.map((d) => ({
              x: d.lng,
              y: d.lat,
              hour: d.hour,
              severity: d.severity,
            })),
            backgroundColor: this.locationData.map((d) =>
              d.severity === "severe" ? this.colors.severe : this.colors.minor
            ),
          },
        ],
      },
      options: {
        scales: {
          x: { title: { display: true, text: "Longitude" } },
          y: { title: { display: true, text: "Latitude" } },
        },
      },
    });
  }

  setupInteractions() {
    Object.entries(this.charts).forEach(([id, chart]) => {
      chart.options.onClick = (e, elements) => {
        if (!elements.length) return;

        const element = elements[0];
        this.handleChartClick(id, element);
      };
    });
  }

  setupResetButton() {
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset Filters";
    resetButton.className =
      "bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded mt-4";
    resetButton.onclick = () => this.resetFilters();

    // Insert before the first chart
    const firstChart = document.getElementById("hourlyChart");
    firstChart.parentNode.insertBefore(resetButton, firstChart);
  }

  resetFilters() {
    this.selectedTimeRange = null;
    this.selectedSeverity = null;
    this.selectedLocation = null;
    this.updateCharts();
  }

  handleChartClick(chartId, element) {
    switch (chartId) {
      case "hourly":
        this.filterByHour(element.index);
        break;
      case "severity":
        this.filterBySeverity(element.index === 0 ? "severe" : "minor");
        break;
      case "location":
        this.filterByLocation(element.element);
        break;
    }
  }

  filterByHour(hour) {
    this.selectedTimeRange = hour;
    this.updateCharts();
  }

  filterBySeverity(severity) {
    this.selectedSeverity = severity;
    this.updateCharts();
  }

  filterByLocation(location) {
    this.selectedLocation = location;
    this.updateCharts();
  }

  updateCharts() {
    // Filter data based on selections
    let filteredData = this.incidents;

    if (this.selectedTimeRange !== null) {
      filteredData = filteredData.filter((incident) => {
        const hour = new Date(incident.acci_time).getHours();
        return hour === this.selectedTimeRange;
      });
    }

    if (this.selectedSeverity !== null) {
      filteredData = filteredData.filter(
        (incident) => incident.severity === this.selectedSeverity
      );
    }

    if (this.selectedLocation !== null) {
      // Add location filtering logic here if needed
    }

    // Update hourly chart
    const hourlyData = Array(24).fill(0);
    filteredData.forEach((incident) => {
      const hour = new Date(incident.acci_time).getHours();
      hourlyData[hour]++;
    });
    this.charts.hourly.data.datasets[0].data = hourlyData;
    this.charts.hourly.update();

    // Update severity chart
    const severityData = { severe: 0, minor: 0 };
    filteredData.forEach((incident) => {
      severityData[incident.severity]++;
    });
    this.charts.severity.data.datasets[0].data = [
      severityData.severe,
      severityData.minor,
    ];
    this.charts.severity.update();

    // Update location chart
    const locationData = filteredData.map((incident) => ({
      x: incident.longitude,
      y: incident.latitude,
      hour: new Date(incident.acci_time).getHours(),
      severity: incident.severity,
    }));
    this.charts.location.data.datasets[0].data = locationData;
    this.charts.location.data.datasets[0].backgroundColor = locationData.map(
      (d) => (d.severity === "severe" ? this.colors.severe : this.colors.minor)
    );
    this.charts.location.update();
  }

  getChartOptions(yAxisLabel) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.formattedValue}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: yAxisLabel,
          },
        },
      },
    };
  }
}
