class DataManager {
  constructor() {
    this.rawData = null;
    this.processedData = null;
    this.filters = {
      dateRange: "all",
      incidentType: "all",
      severity: "all",
    };
  }

  async loadData() {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/sheriefAbdallah/CS318/refs/heads/main/Traffic_Incidents.csv"
      );
      const text = await response.text();
      this.rawData = d3.csvParse(text);
      this.processData();
      return this.processedData;
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }

  processData() {
    this.processedData = this.rawData.map((d) => ({
      ...d,
      date: new Date(d.acci_time),
      hour: new Date(d.acci_time).getHours(),
      x: +d.acci_x,
      y: +d.acci_y,
      severity: d.acci_name.includes("بليغ") ? "severe" : "minor",
    }));
  }

  applyFilters() {
    return this.processedData.filter((d) => {
      let passes = true;

      if (this.filters.dateRange !== "all") {
        // Apply date filter
      }

      if (this.filters.incidentType !== "all") {
        passes = passes && d.acci_name === this.filters.incidentType;
      }

      if (this.filters.severity !== "all") {
        passes = passes && d.severity === this.filters.severity;
      }

      return passes;
    });
  }

  getUniqueTypes() {
    return [...new Set(this.processedData.map((d) => d.acci_name))];
  }
}
