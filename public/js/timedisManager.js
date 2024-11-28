class HeatmapManager {
  constructor() {
    this.spec = {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description:
        "Interactive Visualization: Bar Chart and Line Chart Linked by Day of the Week",
      vconcat: [
        {
          title: "Accident Distribution by Day of the Week",
          width: "container",
          height: 200, // Reduced from 300
          data: {
            url: "https://raw.githubusercontent.com/sheriefAbdallah/CS318/main/Traffic_Incidents.csv",
            format: {
              type: "csv",
              parse: { acci_time: "utc:'%d/%m/%Y %H:%M:%S'" },
            },
          },
          transform: [
            {
              calculate: "timeFormat(datum.acci_time, '%A')",
              as: "day_of_week",
            },
          ],
          mark: {
            type: "bar",
            tooltip: true,
            cursor: "pointer",
          },
          encoding: {
            x: {
              field: "day_of_week",
              type: "nominal",
              sort: [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
              ],
              axis: {
                title: "Day of the Week",
                labelAngle: -45, // Angled labels to save space
              },
            },
            y: {
              aggregate: "count",
              field: "acci_id",
              type: "quantitative",
              axis: { title: "Number of Accidents" },
            },
            color: {
              condition: {
                param: "dayFilter",
                field: "day_of_week",
                type: "nominal",
                legend: null, // Remove legend to save space
              },
              value: "lightgray",
            },
            tooltip: [
              { field: "day_of_week", type: "nominal", title: "Day" },
              {
                aggregate: "count",
                field: "acci_id",
                type: "quantitative",
                title: "Number of Accidents",
              },
            ],
          },
          params: [
            {
              name: "dayFilter",
              select: { type: "point", fields: ["day_of_week"] },
            },
          ],
        },
        {
          title: "Accident Distribution by Hour of the Day",
          width: "container",
          height: 250, // Reduced from 400
          data: {
            url: "https://raw.githubusercontent.com/sheriefAbdallah/CS318/main/Traffic_Incidents.csv",
            format: {
              type: "csv",
              parse: { acci_time: "utc:'%d/%m/%Y %H:%M:%S'" },
            },
          },
          transform: [
            {
              calculate: "hours(datum.acci_time)",
              as: "hour_of_day",
            },
            {
              calculate: "timeFormat(datum.acci_time, '%A')",
              as: "day_of_week",
            },
            {
              filter: { param: "dayFilter" },
            },
          ],
          layer: [
            { mark: "line" },
            {
              mark: {
                type: "point",
                filled: true,
                size: 60, // Reduced point size
              },
            },
          ],
          encoding: {
            x: {
              field: "hour_of_day",
              type: "quantitative",
              axis: {
                title: "Hour",
                values: [0, 4, 8, 12, 16, 20], // Fewer axis labels
                labelAngle: 0,
              },
              scale: { domain: [0, 23], nice: false },
            },
            y: {
              aggregate: "count",
              field: "acci_id",
              type: "quantitative",
              axis: { title: "Number of Accidents" },
            },
            color: {
              field: "day_of_week",
              type: "nominal",
              legend: { orient: "bottom" }, // Move legend to bottom
            },
            tooltip: [
              { field: "day_of_week", type: "nominal", title: "Day" },
              { field: "hour_of_day", type: "quantitative", title: "Hour" },
              {
                aggregate: "count",
                field: "acci_id",
                type: "quantitative",
                title: "Number of Accidents",
              },
            ],
          },
        },
      ],
    };

    this.vegaView = null;
  }

  async initialize() {
    try {
      const result = await vegaEmbed("#visContainer", this.spec, {
        actions: false,
        theme: "dark",
        width: "container", // This makes the visualization responsive
        config: {
          autosize: {
            type: "fit",
            contains: "padding",
          },
          background: null,
          axis: {
            labelColor: "#e5e7eb",
            titleColor: "#e5e7eb",
            labelFontSize: 11,
            titleFontSize: 12,
          },
          legend: {
            labelColor: "#e5e7eb",
            titleColor: "#e5e7eb",
            labelFontSize: 11,
          },
          title: {
            color: "#e5e7eb",
            fontSize: 14,
          },
        },
      });

      this.vegaView = result.view;

      const resetButton = document.getElementById("resetButton");
      if (resetButton) {
        resetButton.addEventListener("click", () => this.resetSelection());
      }

      console.log("Heatmap visualization initialized successfully");
    } catch (error) {
      console.error("Error initializing heatmap:", error);
      document.getElementById("visContainer").innerHTML = `
        <div class="flex items-center justify-center h-48 text-red-500">
          <p>Error loading visualization. Please try again later.</p>
        </div>
      `;
    }
  }

  resetSelection() {
    if (this.vegaView) {
      this.vegaView.signal("dayFilter_select", null).run();
    }
  }

  updateData(newData) {
    if (this.vegaView) {
      this.vegaView.data("source_0", newData).run();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const heatmapManager = new HeatmapManager();
  heatmapManager.initialize();
});
