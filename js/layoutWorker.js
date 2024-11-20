// Web Worker for layout calculations
self.onmessage = function (e) {
  const { data, type } = e.data;
  let layout;

  switch (type) {
    case "overview":
      layout = calculateOverviewLayout(data);
      break;
    case "timePattern":
      layout = calculateTimeLayout(data);
      break;
    case "spatial":
      layout = calculateSpatialLayout(data);
      break;
  }

  self.postMessage(layout);
};

function calculateOverviewLayout(data) {
  // Heavy layout calculations
}

// ... other layout calculations
