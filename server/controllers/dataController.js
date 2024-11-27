const { parse } = require("csv-parse");
const axios = require("axios");

class DataController {
  constructor() {
    this.csvUrl =
      "https://raw.githubusercontent.com/sheriefAbdallah/CS318/main/Traffic_Incidents.csv";
    this.cache = {
      incidents: null,
      lastFetch: null,
      expiryTime: 5 * 60 * 1000, // 5 minutes cache
    };
  }

  async getIncidents() {
    try {
      // Return cached data if valid
      if (this.isCacheValid()) {
        return this.cache.incidents;
      }

      const response = await axios.get(this.csvUrl);
      if (!response.data) {
        throw new Error("No data received from CSV source");
      }

      const incidents = await this.parseCSV(response.data);

      // Update cache
      this.cache.incidents = incidents;
      this.cache.lastFetch = Date.now();

      return incidents;
    } catch (error) {
      console.error("Error in getIncidents:", error.message);
      throw new Error("Failed to fetch incident data");
    }
  }

  async parseCSV(csvData) {
    return new Promise((resolve, reject) => {
      parse(
        csvData,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, output) => {
          if (err) {
            reject(new Error("CSV parsing failed"));
            return;
          }

          try {
            const processedData = this.processIncidents(output);
            resolve(processedData);
          } catch (error) {
            reject(new Error("Data processing failed"));
          }
        }
      );
    });
  }

  processIncidents(rawIncidents) {
    return rawIncidents
      .map((incident) => this.transformIncident(incident))
      .filter((incident) => this.isValidIncident(incident));
  }

  transformIncident(incident) {
    return {
      id: incident.acci_id,
      timestamp: new Date(incident.acci_time),
      description: incident.acci_name || "",
      location: {
        latitude: this.parseCoordinate(incident.acci_x),
        longitude: this.parseCoordinate(incident.acci_y),
      },
      severity: this.determineSeverity(incident.acci_name),
      status: this.determineStatus(incident.status),
    };
  }

  parseCoordinate(coord) {
    if (!coord) return null;
    const parsed = parseFloat(String(coord).trim());
    return isNaN(parsed) ? null : parsed;
  }

  determineSeverity(description) {
    if (!description) return "minor";
    const severityIndicators = ["بليغ", "خطير", "شديد", "severe"];
    return severityIndicators.some((indicator) =>
      description.toLowerCase().includes(indicator)
    )
      ? "severe"
      : "minor";
  }

  determineStatus(status) {
    if (!status) return "unknown";
    return status.toLowerCase() === "active" ? "active" : "resolved";
  }

  isValidIncident(incident) {
    return (
      incident.location.latitude !== null &&
      incident.location.longitude !== null &&
      !isNaN(incident.timestamp) &&
      incident.id
    );
  }

  isCacheValid() {
    return (
      this.cache.incidents &&
      this.cache.lastFetch &&
      Date.now() - this.cache.lastFetch < this.cache.expiryTime
    );
  }

  async getStatistics() {
    try {
      const incidents = await this.getIncidents();
      return {
        total: incidents.length,
        bySeverity: this.calculateSeverityStats(incidents),
        byTime: this.calculateTimeStats(incidents),
        byLocation: this.calculateLocationStats(incidents),
      };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      throw new Error("Failed to generate statistics");
    }
  }

  calculateSeverityStats(incidents) {
    return {
      severe: incidents.filter((i) => i.severity === "severe").length,
      minor: incidents.filter((i) => i.severity === "minor").length,
    };
  }

  calculateTimeStats(incidents) {
    const timeStats = {};
    incidents.forEach((incident) => {
      const hour = incident.timestamp.getHours();
      timeStats[hour] = (timeStats[hour] || 0) + 1;
    });
    return timeStats;
  }

  calculateLocationStats(incidents) {
    const areas = {
      downtown: { lat: 25.197, lng: 55.272, radius: 0.015 },
      marina: { lat: 25.08, lng: 55.142, radius: 0.015 },
      deira: { lat: 25.262, lng: 55.318, radius: 0.015 },
    };

    const stats = { downtown: 0, marina: 0, deira: 0, other: 0 };

    incidents.forEach((incident) => {
      let counted = false;
      for (const [area, coords] of Object.entries(areas)) {
        if (this.isInArea(incident.location, coords)) {
          stats[area]++;
          counted = true;
          break;
        }
      }
      if (!counted) stats.other++;
    });

    return stats;
  }

  isInArea(location, area) {
    return (
      Math.abs(location.latitude - area.lat) < area.radius &&
      Math.abs(location.longitude - area.lng) < area.radius
    );
  }
}

module.exports = new DataController();
