// Visualization specifications and functions
const visualizationSpecs = {
  summary: {
    title: "Summary Statistics",
    create: async (data) => {
      const summaryDiv = document.createElement("div");
      summaryDiv.className = "grid grid-cols-1 md:grid-cols-3 gap-6";

      const stats = calculateSummaryStats(data);

      summaryDiv.innerHTML = `
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl font-bold text-gray-900">${stats.total}</div>
                    <div class="text-sm text-gray-500">Total Incidents</div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl font-bold text-gray-900">${stats.mostCommon}</div>
                    <div class="text-sm text-gray-500">Most Common Type</div>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="text-3xl font-bold text-gray-900">${stats.severityRate}%</div>
                    <div class="text-sm text-gray-500">Severe Incident Rate</div>
                </div>
            `;

      return summaryDiv;
    },
  },

  distribution: {
    title: "Incident Type Distribution",
    spec: {
      $schema: "https://vega.lite.schema.org/v5.json",
      width: "container",
      height: 400,
      mark: "bar",
      encoding: {
        y: {
          field: "acci_name",
          type: "nominal",
          sort: { op: "count", order: "descending" },
          axis: { title: "Incident Type" },
        },
        x: {
          aggregate: "count",
          type: "quantitative",
          title: "Number of Incidents",
        },
        color: {
          field: "acci_name",
          type: "nominal",
          legend: null,
        },
      },
    },
  },

  daily: {
    title: "Daily Trend Analysis",
    spec: {
      $schema: "https://vega.lite.schema.org/v5.json",
      width: "container",
      height: 400,
      mark: {
        type: "line",
        point: true,
      },
      encoding: {
        x: {
          timeUnit: "hours",
          field: "acci_time",
          type: "temporal",
          title: "Hour of Day",
        },
        y: {
          aggregate: "count",
          type: "quantitative",
          title: "Number of Incidents",
        },
        tooltip: [
          {
            timeUnit: "hours",
            field: "acci_time",
            type: "temporal",
            title: "Hour",
          },
          { aggregate: "count", type: "quantitative", title: "Incidents" },
        ],
      },
    },
  },
  // Add more visualization specs as needed
};

async function showVisualization(visType) {
  const visArea = document.getElementById("visualizationArea");
  visArea.innerHTML = ""; // Clear current visualization

  const spec = visualizationSpecs[visType];
  if (!spec) return;

  // Add title
  const titleDiv = document.createElement("h2");
  titleDiv.className = "text-2xl font-bold mb-4";
  titleDiv.textContent = spec.title;
  visArea.appendChild(titleDiv);

  // Create visualization
  if (spec.create) {
    const element = await spec.create(filteredData);
    visArea.appendChild(element);
  } else if (spec.spec) {
    const visDiv = document.createElement("div");
    visDiv.className = "bg-white rounded-lg shadow p-6";
    visArea.appendChild(visDiv);

    const vegaSpec = { ...spec.spec, data: { values: filteredData } };
    await vegaEmbed(visDiv, vegaSpec, {
      actions: false,
      theme: "default",
    });
  }
}
