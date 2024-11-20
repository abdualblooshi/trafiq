// server/controllers/dataController.js
const { parse } = require("csv-parse");
const axios = require("axios");

class DataController {
  async getIncidents() {
    try {
      // Fetch CSV directly from GitHub
      const csvUrl =
        "https://raw.githubusercontent.com/sheriefAbdallah/CS318/refs/heads/main/Traffic_Incidents.csv";
      console.log("Fetching CSV from:", csvUrl);

      const response = await axios.get(csvUrl);
      const csvData = response.data;
      console.log("Successfully fetched CSV data");

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
                longitude: this.cleanCoordinate(d.acci_y),
                latitude: this.cleanCoordinate(d.acci_x),
                severity: d.acci_name.includes("بليغ") ? "severe" : "minor",
              }))
              .filter((d) => this.isValidCoordinate(d.latitude, d.longitude));

            console.log("Processed data sample:", processedData.slice(0, 2));
            resolve(processedData);
          }
        );
      });
    } catch (error) {
      console.error("Error fetching or processing CSV:", error);
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
