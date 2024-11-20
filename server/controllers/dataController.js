// server/controllers/dataController.js
const fs = require("fs").promises;
const path = require("path");
const { parse } = require("csv-parse");

class DataController {
  async getIncidents() {
    try {
      const csvPath = path.join(__dirname, "../../data/Traffic_Incidents.csv");
      const csvData = await fs.readFile(csvPath, "utf-8");

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
              console.error("CSV parsing error:", err);
              reject(err);
              return;
            }

            const processedData = output
              .map((d) => ({
                ...d,
                date: new Date(d.acci_time),
                hour: new Date(d.acci_time).getHours(),
                // Swap the coordinates here:
                longitude: this.cleanCoordinate(d.acci_y), // Use acci_y for longitude
                latitude: this.cleanCoordinate(d.acci_x), // Use acci_x for latitude
                severity: d.acci_name.includes("بليغ") ? "severe" : "minor",
              }))
              .filter((d) => this.isValidCoordinate(d.latitude, d.longitude));

            console.log("Processed data sample:", processedData.slice(0, 2));
            resolve(processedData);
          }
        );
      });
    } catch (error) {
      console.error("Error reading or processing CSV:", error);
      throw error;
    }
  }

  cleanCoordinate(coord) {
    const cleaned = parseFloat(coord.trim());
    if (isNaN(cleaned)) {
      console.warn("Invalid coordinate:", coord);
    }
    return cleaned;
  }

  isValidCoordinate(lat, lng) {
    const valid = !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    if (!valid) {
      console.warn("Invalid coordinate pair:", lat, lng);
    }
    return valid;
  }
}

module.exports = new DataController();
