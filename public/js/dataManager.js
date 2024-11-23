// public/js/dataManager.js
class DataManager {
  constructor() {
    this.processedData = null;
    this.colorScheme = {
      severe: "#FF0000",
      minor: "#FFA500",
    };
  }

  async loadData() {
    try {
      console.log("Attempting to fetch incident data...");
      const response = await fetch("/api/incidents");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.processedData = await response.json();
      console.log(
        "Successfully loaded data. Sample:",
        this.processedData.slice(0, 2)
      );
      return this.processedData;
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }

  getStatistics() {
    if (!Array.isArray(this.processedData)) {
      console.error("processedData is not an array:", this.processedData);
      return {
        totalIncidents: 0,
        severeIncidents: 0,
        byType: {},
        byHour: Array(24).fill(0),
        byArea: {
          downtown: 0,
          marina: 0,
          deira: 0,
          other: 0,
        },
      };
    }

    const stats = {
      totalIncidents: this.processedData.length,
      severeIncidents: this.processedData.filter((d) => d.severity === "severe")
        .length,
      byType: {},
      byHour: Array(24).fill(0),
      byArea: {
        downtown: 0,
        marina: 0,
        deira: 0,
        other: 0,
      },
    };

    this.processedData.forEach((incident) => {
      // Count by type
      stats.byType[incident.acci_name] =
        (stats.byType[incident.acci_name] || 0) + 1;
      stats.byHour[incident.hour]++;

      // Count by area
      if (this.isInArea(incident, 25.197, 55.272, 0.015)) {
        stats.byArea.downtown++;
      } else if (this.isInArea(incident, 25.08, 55.142, 0.015)) {
        stats.byArea.marina++;
      } else if (this.isInArea(incident, 25.262, 55.318, 0.015)) {
        stats.byArea.deira++;
      } else {
        stats.byArea.other++;
      }
    });

    return stats;
  }

  isInArea(incident, centerLat, centerLng, radius) {
    return (
      Math.abs(incident.latitude - centerLat) < radius &&
      Math.abs(incident.longitude - centerLng) < radius
    );
  }

  updateColorScheme(newColors) {
    console.log("DataManager: Updating color scheme to:", newColors);
    this.colorScheme = { ...this.colorScheme, ...newColors };
    console.log("DataManager: Updated color scheme is now:", this.colorScheme);
  }

  getGeoJSON() {
    if (!this.processedData || !Array.isArray(this.processedData)) {
      console.error("Invalid or missing processed data");
      return {
        type: "FeatureCollection",
        features: [],
      };
    }

    console.log(
      "Creating GeoJSON with current color scheme:",
      this.colorScheme
    );

    const features = this.processedData.map((d) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [d.longitude, d.latitude],
      },
      properties: {
        severity: d.severity,
        type: d.acci_name,
        time: d.acci_time,
        description: d.acci_desc || "",
        color:
          d.severity === "severe"
            ? this.colorScheme.severe
            : this.colorScheme.minor,
      },
    }));

    console.log("First few features:", features.slice(0, 2));

    return {
      type: "FeatureCollection",
      features: features,
    };
  }
}
