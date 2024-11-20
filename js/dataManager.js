class DataManager {
  constructor() {
    this.rawData = null;
    this.processedData = null;
    this.colorScheme = {
      severe: "#FF0000",
      minor: "#FFA500",
    };
  }

  async loadData() {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/sheriefAbdallah/CS318/refs/heads/main/Traffic_Incidents.csv"
      );
      const text = await response.text();
      console.log("Raw CSV data:", text.substring(0, 200)); // Log first 200 chars
      this.rawData = d3.csvParse(text);
      console.log("Parsed data:", this.rawData.slice(0, 5)); // Log first 5 rows
      this.processData();
      console.log("Processed data:", this.processedData.slice(0, 5)); // Log first 5 processed rows
      return this.processedData;
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }

  processData() {
    let invalidCount = 0;
    let validCount = 0;

    this.processedData = this.rawData
      .map((d) => {
        const longitude = this.cleanCoordinate(d.acci_x);
        const latitude = this.cleanCoordinate(d.acci_y);

        // Log any NaN or undefined coordinates
        if (isNaN(longitude) || isNaN(latitude)) {
          console.log("Invalid coordinate data:", {
            raw_x: d.acci_x,
            raw_y: d.acci_y,
            cleaned_long: longitude,
            cleaned_lat: latitude,
          });
        }

        return {
          ...d,
          date: new Date(d.acci_time),
          hour: new Date(d.acci_time).getHours(),
          longitude: longitude,
          latitude: latitude,
          severity: d.acci_name.includes("بليغ") ? "severe" : "minor",
        };
      })
      .filter((d) => {
        const isValid = this.isValidCoordinate(d.latitude, d.longitude);
        if (isValid) {
          validCount++;
        } else {
          invalidCount++;
        }
        return isValid;
      });

    console.log(`Processing complete:
    Total records: ${this.rawData.length}
    Valid records: ${validCount}
    Invalid records: ${invalidCount}
  `);

    // Log a few valid records to verify coordinate format
    console.log(
      "Sample of valid processed records:",
      this.processedData.slice(0, 3).map((d) => ({
        longitude: d.longitude,
        latitude: d.latitude,
      }))
    );
  }

  cleanCoordinate(coord) {
    if (typeof coord === "string") {
      return parseFloat(coord);
    }
    return parseFloat(coord);
  }

  isValidCoordinate(lat, lng) {
    // Basic validation to ensure we have numbers and they're not 0
    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
  }

  getGeoJSON() {
    const features = this.processedData.map((d) => {
      // Swap the coordinates order since your data has lat,lng but GeoJSON needs lng,lat
      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [d.latitude, d.longitude], // SWAP these values
        },
        properties: {
          id: d.acci_id,
          severity: d.severity,
          type: d.acci_name,
          time: d.acci_time,
          description: d.acci_desc || "",
        },
      };

      return feature;
    });

    console.log(
      "First few features coordinates:",
      features.slice(0, 3).map((f) => f.geometry.coordinates)
    );

    return {
      type: "FeatureCollection",
      features: features,
    };
  }
  updateColorScheme(newColors) {
    this.colorScheme = { ...this.colorScheme, ...newColors };
  }

  // Add these methods to DataManager class
  getStatistics() {
    const stats = {
      totalIncidents: this.processedData.length,
      severeIncidents: this.processedData.filter((d) => d.severity === "severe")
        .length,
      byType: {},
      byHour: Array(24).fill(0),
      byArea: {
        downtown: 0, // Around Dubai Mall/Burj Khalifa
        marina: 0, // Dubai Marina area
        deira: 0, // Deira area
        other: 0,
      },
    };

    // Count by type
    this.processedData.forEach((incident) => {
      stats.byType[incident.acci_name] =
        (stats.byType[incident.acci_name] || 0) + 1;
      stats.byHour[incident.hour]++;

      // Count by area based on coordinates
      if (this.isInArea(incident, 25.197, 55.272, 0.015)) {
        // Downtown
        stats.byArea.downtown++;
      } else if (this.isInArea(incident, 25.08, 55.142, 0.015)) {
        // Marina
        stats.byArea.marina++;
      } else if (this.isInArea(incident, 25.262, 55.318, 0.015)) {
        // Deira
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
}
