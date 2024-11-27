// server/controllers/dataController.js
const { parse } = require("csv-parse");
const axios = require("axios");

class DataController {
  async getIncidents() {
    try {
      // Update the CSV URL to the raw GitHub content URL
      const csvUrl =
        "https://raw.githubusercontent.com/sheriefAbdallah/CS318/main/Traffic_Incidents.csv";
      console.log("Fetching CSV from:", csvUrl);

      const response = await axios.get(csvUrl);
      const csvData = response.data;

      if (!csvData) {
        throw new Error("No data received from CSV source");
      }

      console.log("Successfully fetched CSV data, length:", csvData.length);

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

            try {
              const processedData = output
                .map((d) => ({
                  acci_id: d.acci_id || "",
                  acci_time: d.acci_time || "",
                  acci_desc: d.acci_name || "",
                  latitude: this.cleanCoordinate(d.acci_x),
                  longitude: this.cleanCoordinate(d.acci_y),
                  severity: d.acci_name?.includes("بليغ") ? "severe" : "minor",
                }))
                .filter((d) => this.isValidCoordinate(d.latitude, d.longitude));

              console.log("Processed data sample:", processedData.slice(0, 2));
              resolve(processedData);
            } catch (error) {
              console.error("Data processing error:", error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error("Error fetching or processing CSV:", error);
      throw error;
    }
  }

  cleanCoordinate(coord) {
    if (!coord) return null;
    const cleaned = parseFloat(String(coord).trim());
    return isNaN(cleaned) ? null : cleaned;
  }

  isValidCoordinate(lat, lng) {
    return lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);
  }
}

module.exports = new DataController();
