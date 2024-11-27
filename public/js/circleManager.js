document.addEventListener("DOMContentLoaded", async () => {
  const spec = {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    description:
      "An example of a zoomable circle packing layout for hierarchical data.",
    width: 800,
    height: 800,
    padding: 5,
    signals: [
      {
        name: "duration",
        init: "750",
        on: [
          {
            events: { type: "click", marknames: ["circles", "background"] },
            update: "(event.metaKey || event.ctrlKey ? 4 : 1) * 750",
          },
        ],
      },
      {
        name: "colorScheme",
        value: "viridis",
        bind: {
          input: "select",
          options: [
            "viridis",
            "magma",
            "inferno",
            "plasma",
            "rainbow",
            "sinebow",
            "browns",
            "tealblues",
            "teals",
            "blues",
          ],
          name: "Color Scheme:",
        },
      },
      {
        name: "k",
        value: 1,
        on: [
          {
            events: [{ signal: "focus" }],
            update: "focus ? width/(focus.r*2) : 1",
          },
        ],
      },
      {
        name: "root",
        update:
          "{'id': data('tree')[0]['id'], 'x': data('tree')[0]['x'], 'y': data('tree')[0]['y'], 'r': data('tree')[0]['r'], 'k': 1, 'children': data('tree')[0]['children']}",
      },
      {
        name: "focus",
        init: "root",
        on: [
          {
            events: { type: "click", markname: "background" },
            update:
              "{id: root['id'], 'x': root['x'], 'y': root['y'], 'r': root['r'], 'k': 1,'children': root['children']}",
          },
          {
            events: { type: "click", markname: "circles" },
            update:
              "(focus['x'] === datum['x'] && focus['y'] === datum['y'] && focus['r'] === datum['r'] && focus['r'] !== root['r']) ? {'id': root['id'], 'x': root['x'], 'y': root['y'], 'r': root['r'], 'k': 1, 'children': root['children']} : {'id': datum['id'], 'x': datum['x'], 'y': datum['y'], 'r': datum['r'], 'k': k, 'children': datum['children']}",
          },
        ],
      },
      {
        name: "focus0",
        update:
          "data('focus0') && length(data('focus0'))>0 ? data('focus0')[0] : focus",
      },
      {
        name: "timer",
        on: [{ events: "timer", update: "now()" }],
      },
      {
        name: "interpolateTime",
        on: [
          {
            events: { type: "click", marknames: ["circles", "background"] },
            update: "{'start': timer, 'end': timer+duration}",
          },
        ],
      },
      {
        name: "t",
        update:
          "interpolateTime ? clamp((timer-interpolateTime.start)/(interpolateTime.end-interpolateTime.start), 0, 1): null",
      },
      {
        name: "tEase",
        update:
          "t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1",
      },
    ],
    data: [
      {
        name: "source",
        values: [
          { id: "root", parent: null, name: "All Incidents", size: 1 },
          { id: "بسيط (Minor)", parent: "root", name: "بسيط (Minor)", size: 1 },
          {
            id: "بليغ (Severe)",
            parent: "root",
            name: "بليغ (Severe)",
            size: 1,
          },
          { id: "اخرى (Other)", parent: "root", name: "اخرى (Other)", size: 1 },
          {
            id: "صدم عمود - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم عمود - بسيط",
            size: 10,
          },
          {
            id: "مركبه عطلانه في الشارع - بسيط",
            parent: "بسيط (Minor)",
            name: "مركبه عطلانه في الشارع - بسيط",
            size: 15,
          },
          {
            id: "صدم علامة مرورية - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم علامة مرورية - بسيط",
            size: 8,
          },
          {
            id: "اصطدام بين مركبتين - بسيط",
            parent: "بسيط (Minor)",
            name: "اصطدام بين مركبتين - بسيط",
            size: 20,
          },
          {
            id: "ازدحام مروري - بسيط",
            parent: "بسيط (Minor)",
            name: "ازدحام مروري - بسيط",
            size: 12,
          },
          {
            id: "الوقوف خلف المركبات (دبل بارك) - بسيط",
            parent: "بسيط (Minor)",
            name: "الوقوف خلف المركبات (دبل بارك) - بسيط",
            size: 5,
          },
          {
            id: "تدهور دراجة نارية - بليغ",
            parent: "بليغ (Severe)",
            name: "تدهور دراجة نارية - بليغ",
            size: 7,
          },
          {
            id: "اصطدام بين مركبتين - بليغ",
            parent: "بليغ (Severe)",
            name: "اصطدام بين مركبتين - بليغ",
            size: 14,
          },
          {
            id: "صدم دراجة نارية - بليغ",
            parent: "بليغ (Severe)",
            name: "صدم دراجة نارية - بليغ",
            size: 9,
          },
          {
            id: "صدم حاجز - بليغ",
            parent: "بليغ (Severe)",
            name: "صدم حاجز - بليغ",
            size: 6,
          },
          {
            id: "صدم جدار - بليغ",
            parent: "بليغ (Severe)",
            name: "صدم جدار - بليغ",
            size: 11,
          },
          {
            id: "دهس - بليغ",
            parent: "بليغ (Severe)",
            name: "دهس - بليغ",
            size: 13,
          },
          {
            id: "تدهور مركبة ثقيلة - بليغ",
            parent: "بليغ (Severe)",
            name: "تدهور مركبة ثقيلة - بليغ",
            size: 8,
          },
          {
            id: "مركبات مخالفة",
            parent: "اخرى (Other)",
            name: "مركبات مخالفة",
            size: 16,
          },
          {
            id: "عبور شخص أو عدة أشخاص من مكان غير مخصص لعبور المشا",
            parent: "اخرى (Other)",
            name: "عبور شخص أو عدة أشخاص من مكان غير مخصص لعبور المشا",
            size: 17,
          },
          {
            id: "حريق مركبة أثناء سيرها",
            parent: "اخرى (Other)",
            name: "حريق مركبة أثناء سيرها",
            size: 18,
          },
          {
            id: "الصدم والهروب - بسيط",
            parent: "بسيط (Minor)",
            name: "الصدم والهروب - بسيط",
            size: 9,
          },
          {
            id: "صدم شجرة - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم شجرة - بسيط",
            size: 7,
          },
          {
            id: "دهس - بسيط",
            parent: "بسيط (Minor)",
            name: "دهس - بسيط",
            size: 10,
          },
          {
            id: "صدم حاجز - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم حاجز - بسيط",
            size: 6,
          },
          {
            id: "صدم رصيف - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم رصيف - بسيط",
            size: 4,
          },
          {
            id: "صدم جدار - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم جدار - بسيط",
            size: 5,
          },
          {
            id: "صدم شجرة - بليغ",
            parent: "بليغ (Severe)",
            name: "صدم شجرة - بليغ",
            size: 8,
          },
          {
            id: "دهس وهروب - بسيط",
            parent: "بسيط (Minor)",
            name: "دهس وهروب - بسيط",
            size: 9,
          },
          {
            id: "دهس وهروب - بليغ",
            parent: "بليغ (Severe)",
            name: "دهس وهروب - بليغ",
            size: 11,
          },
          {
            id: "تدهور دراجة نارية - بسيط",
            parent: "بسيط (Minor)",
            name: "تدهور دراجة نارية - بسيط",
            size: 8,
          },
          {
            id: "الاستعراضات والتفحيط - بسيط",
            parent: "بسيط (Minor)",
            name: "الاستعراضات والتفحيط - بسيط",
            size: 6,
          },
          {
            id: "صدم مبنى - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم مبنى - بسيط",
            size: 7,
          },
          {
            id: "طلب ثبات دورية في موقع عمل على الطريق العام - بسيط",
            parent: "بسيط (Minor)",
            name: "طلب ثبات دورية في موقع عمل على الطريق العام - بسيط",
            size: 5,
          },
          {
            id: "تعطل مركبة نقل أموال - بسيط",
            parent: "بسيط (Minor)",
            name: "تعطل مركبة نقل أموال - بسيط",
            size: 4,
          },
          {
            id: "تعطل اشارة ضوئية - بسيط",
            parent: "بسيط (Minor)",
            name: "تعطل اشارة ضوئية - بسيط",
            size: 3,
          },
          {
            id: "وجود جسم في الشارع - بسيط",
            parent: "بسيط (Minor)",
            name: "وجود جسم في الشارع - بسيط",
            size: 7,
          },
          {
            id: "اصطدام بين شاحنة ومركبة - بسيط",
            parent: "بسيط (Minor)",
            name: "اصطدام بين شاحنة ومركبة - بسيط",
            size: 12,
          },
          {
            id: "صدم باب - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم باب - بسيط",
            size: 4,
          },
          {
            id: "صدم حيوان - بسيط",
            parent: "بسيط (Minor)",
            name: "صدم حيوان - بسيط",
            size: 3,
          },
          {
            id: "سقوط وتطاير أجسام على مركبة أثناء سيرها - بسيط",
            parent: "بسيط (Minor)",
            name: "سقوط وتطاير أجسام على مركبة أثناء سيرها - بسيط",
            size: 6,
          },
          {
            id: "اصطدام بين عدة مركبات - بسيط",
            parent: "بسيط (Minor)",
            name: "اصطدام بين عدة مركبات - بسيط",
            size: 20,
          },
        ],
      },
      {
        name: "tree",
        source: "source",
        transform: [
          {
            type: "stratify",
            key: "id",
            parentKey: "parent",
          },
          {
            type: "pack",
            field: "size",
            sort: { field: "value" },
            size: [{ signal: "width" }, { signal: "height" }],
          },
        ],
      },
      {
        name: "focus0",
        on: [{ trigger: "focus", insert: "focus" }],
        transform: [
          { type: "formula", expr: "now()", as: "now" },
          {
            type: "window",
            ops: ["row_number"],
            as: ["row"],
            sort: { field: "now", order: "descending" },
          },
          { type: "filter", expr: "datum['row'] ? datum['row'] == 2 : true" },
          { type: "project", fields: ["id", "x", "y", "r", "children"] },
          { type: "formula", expr: "width/(datum['r']*2)", as: "k" },
        ],
      },
    ],
    scales: [
      {
        name: "color",
        type: "ordinal",
        domain: { data: "tree", field: "depth" },
        range: { scheme: { signal: "colorScheme" } },
      },
    ],
    marks: [
      {
        name: "background",
        type: "rect",
        encode: {
          enter: {
            x: { signal: "-padding" },
            y: { signal: "-padding" },
            width: { signal: "width+padding*2" },
            height: { signal: "height+padding*2" },
            fillOpacity: { value: 0 },
          },
        },
      },
      {
        name: "circles",
        type: "symbol",
        from: { data: "tree" },
        encode: {
          enter: {
            shape: { value: "circle" },
            cursor: { value: "pointer" },
            tooltip: {
              signal: "{'Name': datum.name, 'Size': datum.size}",
            },
          },
          update: {
            x: {
              signal:
                "lerp([root['x'] + (datum['x'] - focus0['x']) * focus0['k'], root['x'] + (datum['x'] - focus['x']) * k], tEase)",
            },
            y: {
              signal:
                "lerp([root['y'] + (datum['y'] - focus0['y']) * focus0['k'], root['y'] + (datum['y'] - focus['y']) * k], tEase)",
            },
            size: {
              signal:
                "pow(2 * (datum['r'] * lerp([focus0['k'], k], tEase)), 2)",
            },
            fill: {
              scale: "color",
              field: "depth",
            },
            stroke: { value: "white" },
            strokeWidth: { value: 0.5 },
            strokeOpacity: { value: 0.8 },
            fillOpacity: { value: 0.9 },
          },
          hover: {
            strokeWidth: { value: 2 },
            fillOpacity: { value: 1 },
          },
        },
      },
      {
        name: "title",
        type: "text",
        encode: {
          enter: {
            fontSize: { value: 24 },
            fill: { value: "black" },
            align: { value: "left" },
            x: { value: 10 },
            y: { value: 30 },
          },
        },
      },
      {
        name: "helper_text",
        type: "text",
        encode: {
          enter: {
            fontSize: { value: 14 },
            fill: { value: "black" },
            text: {
              signal:
                "['Interaction Instructions:', '• Click on a node to zoom in', '• Click on background to zoom out', '• Hold ⌘/⊞ to slow down animations', '• Use color scheme selector to change colors']",
            },
            y: { signal: "height + 5" },
          },
          update: {
            opacity: {
              signal: "ceil(k) === 1 ? 1 : 0",
            },
          },
        },
      },
    ],
  };

  // Embed the visualization
  vegaEmbed("#circlePacking", spec, {
    actions: false,
    theme: "dark",
  }).then((result) => {
    // Add event listeners for interactivity
    const view = result.view;

    // Handle grouping changes
    document
      .getElementById("groupingSelect")
      .addEventListener("change", (e) => {
        const grouping = e.target.value;
        updateGrouping(view, grouping);
      });

    // Handle reset button
    document.getElementById("resetButton").addEventListener("click", () => {
      view.signal("zoom", null).run();
    });
  });
});

function updateGrouping(view, grouping) {
  // Update the visualization based on selected grouping
  const transformations = {
    type: ["severity", "acci_name"],
    severity: ["severity"],
    time: ["severity", "hour"],
  };

  view.signal("groupBy", transformations[grouping]).run();
}
