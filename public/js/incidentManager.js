// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch incident data from API
    const response = await fetch("/api/incidents");
    const incidents = await response.json();

    // Process data for visualization
    const processedData = incidents.map((incident) => ({
      date: new Date(incident.date),
      hour: new Date(incident.date).getHours(),
      minute: new Date(incident.date).getMinutes(),
      second: new Date(incident.date).getSeconds(),
      type: incident.type,
      severity: incident.severity || "اخرى (Other)", // Default severity if not provided
      description: incident.description,
      location: incident.location,
      acci_name: incident.type, // Map type to acci_name for treemap
    }));

    // Create the Vega specification
    const spec = {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      description: "Traffic Incidents Calendar with Synchronized Clock View",
      padding: 10,
      title: {
        text: "Traffic Incidents (2023-2024)",
        anchor: "start",
        fontSize: 24,
        offset: 20,
        color: "#333",
        dx: 50,
      },
      signals: [
        { name: "step", value: 10 },
        { name: "offset", value: 20 },
        { name: "width", update: "step * 55" },
        { name: "height", update: "step * 18" },
        {
          name: "scheme",
          value: "spectral",
          bind: {
            input: "select",
            name: "Color Scheme",
            options: [
              "viridis",
              "spectral",
              "magma",
              "cividis",
              "plasma",
              "blueorange",
              "brownbluegreen",
              "redyellowblue",
              "pinkyellowgreen",
              "purplegreen",
              "redblue",
              "redgrey",
            ],
          },
        },
        {
          name: "currentWeekDate",
          update:
            "playing ? datetime(selectedYear, 1, 1 + animationTime * 7) : null",
        },
        {
          name: "clockLabel",
          update:
            "selectedDate ? timeFormat(selectedDate.dateOnly, '%A, %B %d, %Y') + '\\nIncidents: ' + selectedDate.incidents : (playing ? timeFormat(currentWeekDate, '%A, %B %d, %Y') + '\\nWeek: ' + animationTime : 'No Date Selected')",
        },

        {
          name: "selectedYear",
          value: 2023,
          bind: {
            input: "select",
            options: [2023, 2024],
            name: "Select Year",
          },
        },
        {
          name: "playing",
          value: false,
          bind: {
            input: "checkbox",
            name: "Play Animation",
          },
        },
        {
          name: "timer",
          value: 0,
          on: [
            {
              events: { type: "timer", throttle: 100 },
              update: "playing ? timer + 1 : timer",
            },
          ],
        },
        {
          name: "animationTime",
          value: 0,
          bind: {
            input: "range",
            min: 0,
            max: 52,
            step: 1,
            name: "Week Progress",
          },
          on: [
            {
              events: { signal: "timer" },
              update: "playing ? timer % 53 : animationTime",
            },
          ],
        },
        {
          name: "selectedHour",
          value: 0,
          bind: {
            input: "range",
            min: 0,
            max: 12,
            step: 1,
            name: "Hour",
          },
          on: [
            {
              events: { signal: "timer" },
              update: "playing ? timer % 12 : selectedHour",
            },
          ],
        },
        {
          name: "selectedMinute",
          value: 0,
          bind: {
            input: "range",
            min: 0,
            max: 59,
            step: 1,
            name: "Minute",
          },
          on: [
            {
              events: { signal: "timer" },
              update: "playing ? timer % 60 : selectedMinute",
            },
          ],
        },
        {
          name: "selectedSecond",
          value: 0,
          bind: {
            input: "range",
            min: 0,
            max: 59,
            step: 1,
            name: "Second",
          },
          on: [
            {
              events: { signal: "timer" },
              update: "playing ? (timer * 5) % 60 : selectedSecond",
            },
          ],
        },
        {
          name: "selectedPeriod",
          value: "AM",
          bind: {
            input: "select",
            options: ["AM", "PM"],
            name: "Time Period",
          },
          on: [
            {
              events: { signal: "timer" },
              update:
                "playing ? (floor(timer / 720) % 2 === 0 ? 'AM' : 'PM') : selectedPeriod",
            },
          ],
        },
        {
          name: "hours",
          update:
            "playing ? (floor((timer % 720) / 60)) : (selectedHour + (selectedPeriod === 'PM' && selectedHour !== 12 ? 12 : (selectedHour === 12 && selectedPeriod === 'AM' ? 0 : 0)))",
        },
        {
          name: "minutes",
          update: "playing ? selectedMinute : selectedMinute",
        },
        {
          name: "seconds",
          update: "playing ? selectedSecond : selectedSecond",
        },
        {
          name: "timeDisplay",
          update:
            "playing ? format(hours === 0 ? 12 : hours, '02d') + ':' + format(minutes, '02d') + ':' + format(seconds, '02d') + ' ' + selectedPeriod : format(selectedHour === 0 ? 12 : selectedHour, '02d') + ':' + format(selectedMinute, '02d') + ':' + format(selectedSecond, '02d') + ' ' + selectedPeriod",
        },
        {
          name: "selectedDate",
          value: null,
          on: [
            {
              events: "@cell:click",
              update: "datum",
              force: true,
            },
          ],
        },
        {
          name: "currentIncidentIndex",
          value: 0,
          on: [
            {
              events: { signal: "timer" },
              update:
                "playing && data('selectedDayIncidents').length > 0 ? (currentIncidentIndex + 1) % data('selectedDayIncidents').length : currentIncidentIndex",
            },
            {
              events: { signal: "selectedDate" },
              update: "0",
            },
          ],
        },

        {
          name: "clockTime",
          update:
            "currentTime ? currentTime : {hour: selectedHour + (selectedPeriod === 'PM' ? 12 : 0), minute: selectedMinute, second: selectedSecond}",
        },
        {
          name: "selectedTime",
          value: null,
          on: [
            {
              events: "@hourHand:click, @minuteHand:click, @secondHand:click",
              update: "{hour: hours, minute: minutes, second: seconds}",
            },
            {
              events:
                "signals:selectedHour, signals:selectedMinute, signals:selectedSecond, signals:selectedPeriod",
              update:
                "{hour: selectedHour + (selectedPeriod === 'PM' && selectedHour !== 12 ? 12 : (selectedHour === 12 && selectedPeriod === 'AM' ? 0 : 0)), minute: selectedMinute, second: selectedSecond}",
            },
          ],
        },
        {
          name: "currentTime",
          update:
            "selectedDate ? (data('selectedDayIncidents').length > 0 ? {hour: data('selectedDayIncidents')[currentIncidentIndex].hour, minute: data('selectedDayIncidents')[currentIncidentIndex].minute, second: 0} : {hour: selectedHour + (selectedPeriod === 'PM' ? 12 : 0), minute: selectedMinute, second: selectedSecond}) : null",
        },
        {
          name: "textColor",
          value: "white",
          bind: {
            input: "color",
            name: "Treemap Text Color:",
          },
        },
        {
          name: "treemapHeight",
          value: 300,
        },
        {
          name: "layout",
          value: "squarify",
          bind: {
            input: "select",
            options: ["squarify", "binary", "slicedice"],
            name: "Treemap Layout:",
          },
        },
        {
          name: "aspectRatio",
          value: 1.6,
          bind: {
            input: "range",
            min: 1,
            max: 5,
            step: 0.1,
            name: "Treemap Aspect Ratio:",
          },
        },
        {
          name: "textScale",
          value: 12,
          bind: {
            input: "range",
            min: 8,
            max: 24,
            step: 1,
            name: "Treemap Text Size:",
          },
        },
        {
          name: "sizeScale",
          value: 1,
          bind: {
            input: "range",
            min: 0.5,
            max: 3,
            step: 0.1,
            name: "Box Size Scale:",
          },
        },
        {
          name: "treemapMode",
          value: "severity",
          bind: {
            input: "select",
            options: ["severity", "type"],
            name: "Treemap Grouping",
          },
        },
        {
          name: "treemapDepth",
          value: 2,
          bind: {
            input: "range",
            min: 1,
            max: 3,
            step: 1,
            name: "Treemap Depth",
          },
        },
        {
          name: "severityFilter",
          value: "All",
          bind: {
            input: "select",
            options: ["All", "بسيط (Minor)", "بليغ (Severe)", "اخرى (Other)"],
            name: "Filter by Severity:",
          },
        },
      ],
      data: [
        {
          name: "traffic",
          url: "https://raw.githubusercontent.com/sheriefAbdallah/CS318/refs/heads/main/Traffic_Incidents.csv",
          format: { type: "csv" },
          transform: [
            {
              type: "formula",
              expr: "timeParse(datum.acci_time, '%d/%m/%Y %H:%M:%S')",
              as: "date",
            },
            {
              type: "filter",
              expr: "datum.date != null && isDate(datum.date)",
            },
            {
              type: "formula",
              expr: "year(datum.date)",
              as: "year",
            },
            {
              type: "formula",
              expr: "month(datum.date)",
              as: "month",
            },
            {
              type: "formula",
              expr: "week(datum.date)",
              as: "week",
            },
            {
              type: "timeunit",
              field: "date",
              units: ["year", "week"],
              as: ["w0", "w1"],
            },
            {
              type: "formula",
              expr: "datetime(year(datum.date), month(datum.date), date(datum.date))",
              as: "dateOnly",
            },
            {
              type: "formula",
              expr: "date(datum.date)",
              as: "dayOfMonth",
            },
            {
              type: "formula",
              expr: "timeFormat(datum.date, '%A')",
              as: "day",
            },
            {
              type: "formula",
              expr: "timeFormat(datum.date, '%B')",
              as: "monthName",
            },
            {
              type: "formula",
              expr: "timeFormat(datum.date, '%Y-%m')",
              as: "yearMonth",
            },
            {
              type: "formula",
              expr: "hours(datum.date)",
              as: "hour",
            },
            {
              type: "formula",
              expr: "minutes(datum.date)",
              as: "minute",
            },

            {
              type: "filter",
              expr: "year(datum.date) === selectedYear",
            },
          ],
        },
        {
          name: "dailyIncidents",
          source: "traffic",
          transform: [
            {
              type: "aggregate",
              groupby: [
                "year",
                "month",
                "monthName",
                "week",
                "day",
                "dateOnly",
                "w0",
                "dayOfMonth",
                "yearMonth",
              ],
              ops: ["count"],
              as: ["incidents"],
            },
            {
              type: "window",
              sort: { field: "dateOnly" },
              groupby: ["yearMonth"],
              ops: ["row_number"],
              as: ["dayInMonth"],
            },
            {
              type: "formula",
              expr: "datum.dayInMonth === 1",
              as: "showMonthLabel",
            },
          ],
        },
        {
          name: "selectedDayIncidents",
          source: "traffic",
          transform: [
            {
              type: "filter",
              expr: "selectedDate && timeFormat(datum.dateOnly, '%Y-%m-%d') === timeFormat(selectedDate.dateOnly, '%Y-%m-%d')",
            },
            {
              type: "filter",
              expr: "selectedDate && timeFormat(datum.dateOnly, '%Y-%m-%d') === timeFormat(selectedDate.dateOnly, '%Y-%m-%d')",
            },
            {
              type: "collect",
              sort: { field: ["hour", "minute", "second"] },
            },
          ],
        },
        {
          name: "treemapBase",
          values: [
            { id: "root", parent: null, name: "All Incidents" },
            { id: "بسيط (Minor)", parent: "root", name: "بسيط (Minor)" },
            { id: "بليغ (Severe)", parent: "root", name: "بليغ (Severe)" },
            { id: "اخرى (Other)", parent: "root", name: "اخرى (Other)" },
            {
              id: "صدم عمود - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم عمود - بسيط",
            },
            {
              id: "مركبه عطلانه في الشارع - بسيط",
              parent: "بسيط (Minor)",
              name: "مركبه عطلانه في الشارع - بسيط",
            },
            {
              id: "صدم علامة مرورية - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم علامة مرورية - بسيط",
            },
            {
              id: "اصطدام بين مركبتين - بسيط",
              parent: "بسيط (Minor)",
              name: "اصطدام بين مركبتين - بسيط",
            },
            {
              id: "ازدحام مروري - بسيط",
              parent: "بسيط (Minor)",
              name: "ازدحام مروري - بسيط",
            },
            {
              id: "الوقوف خلف المركبات (دبل بارك) - بسيط",
              parent: "بسيط (Minor)",
              name: "الوقوف خلف المركبات (دبل بارك) - بسيط",
            },
            {
              id: "تدهور دراجة نارية - بليغ",
              parent: "بليغ (Severe)",
              name: "تدهور دراجة نارية - بليغ",
            },
            {
              id: "اصطدام بين مركبتين - بليغ",
              parent: "بليغ (Severe)",
              name: "اصطدام بين مركبتين - بليغ",
            },
            {
              id: "صدم دراجة نارية - بليغ",
              parent: "بليغ (Severe)",
              name: "صدم دراجة نارية - بليغ",
            },
            {
              id: "صدم حاجز - بليغ",
              parent: "بليغ (Severe)",
              name: "صدم حاجز - بليغ",
            },
            {
              id: "صدم جدار - بليغ",
              parent: "بليغ (Severe)",
              name: "صدم جدار - بليغ",
            },
            { id: "دهس - بليغ", parent: "بليغ (Severe)", name: "دهس - بليغ" },
            {
              id: "تدهور مركبة ثقيلة - بليغ",
              parent: "بليغ (Severe)",
              name: "تدهور مركبة ثقيلة - بليغ",
            },
            {
              id: "مركبات مخالفة",
              parent: "اخرى (Other)",
              name: "مركبات مخالفة",
            },
            {
              id: "عبور شخص أو عدة أشخاص من مكان غير مخصص لعبور المشا",
              parent: "اخرى (Other)",
              name: "عبور شخص أو عدة أشخاص من مكان غير مخصص لعبور المشا",
            },
            {
              id: "حريق مركبة أثناء سيرها",
              parent: "اخرى (Other)",
              name: "حريق مركبة أثناء سيرها",
            },
            {
              id: "الصدم والهروب - بسيط",
              parent: "بسيط (Minor)",
              name: "الصدم والهروب - بسيط",
            },
            {
              id: "صدم شجرة - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم شجرة - بسيط",
            },
            { id: "دهس - بسيط", parent: "بسيط (Minor)", name: "دهس - بسيط" },
            {
              id: "صدم حاجز - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم حاجز - بسيط",
            },
            {
              id: "صدم رصيف - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم رصيف - بسيط",
            },
            {
              id: "صدم جدار - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم جدار - بسيط",
            },
            {
              id: "صدم شجرة - بليغ",
              parent: "بليغ (Severe)",
              name: "صدم شجرة - بليغ",
            },
            {
              id: "دهس وهروب - بسيط",
              parent: "بسيط (Minor)",
              name: "دهس وهروب - بسيط",
            },
            {
              id: "دهس وهروب - بليغ",
              parent: "بليغ (Severe)",
              name: "دهس وهروب - بليغ",
            },
            {
              id: "تدهور دراجة نارية - بسيط",
              parent: "بسيط (Minor)",
              name: "تدهور دراجة نارية - بسيط",
            },
            {
              id: "الاستعراضات والتفحيط - بسيط",
              parent: "بسيط (Minor)",
              name: "الاستعراضات والتفحيط - بسيط",
            },
            {
              id: "صدم مبنى - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم مبنى - بسيط",
            },
            {
              id: "طلب ثبات دورية في موقع عمل على الطريق العام - بسيط",
              parent: "بسيط (Minor)",
              name: "طلب ثبات دورية في موقع عمل على الطريق العام - بسيط",
            },
            {
              id: "تعطل مركبة نقل أموال - بسيط",
              parent: "بسيط (Minor)",
              name: "تعطل مركبة نقل أموال - بسيط",
            },
            {
              id: "تعطل اشارة ضوئية - بسيط",
              parent: "بسيط (Minor)",
              name: "تعطل اشارة ضوئية - بسيط",
            },
            {
              id: "وجود جسم في الشارع - بسيط",
              parent: "بسيط (Minor)",
              name: "وجود جسم في الشارع - بسيط",
            },
            {
              id: "اصطدام بين شاحنة ومركبة - بسيط",
              parent: "بسيط (Minor)",
              name: "اصطدام بين شاحنة ومركبة - بسيط",
            },
            {
              id: "صدم باب - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم باب - بسيط",
            },
            {
              id: "صدم حيوان - بسيط",
              parent: "بسيط (Minor)",
              name: "صدم حيوان - بسيط",
            },
            {
              id: "سقوط وتطاير أجسام على مركبة أثناء سيرها - بسيط",
              parent: "بسيط (Minor)",
              name: "سقوط وتطاير أجسام على مركبة أثناء سيرها - بسيط",
            },
            {
              id: "اصطدام بين عدة مركبات - بسيط",
              parent: "بسيط (Minor)",
              name: "اصطدام بين عدة مركبات - بسيط",
            },
          ],
        },
        {
          name: "incidents",
          source: "selectedDayIncidents",
          transform: [
            {
              type: "aggregate",
              groupby: ["acci_name"],
              ops: ["count"],
              fields: ["acci_name"],
              as: ["value"],
            },
          ],
        },
        {
          name: "selectedDayIncidentsForTreemap",
          source: "selectedDayIncidents",
          transform: [
            {
              type: "aggregate",
              groupby: ["acci_name"],
              ops: ["count"],
              fields: ["acci_name"],
              as: ["value"],
            },
          ],
        },
        {
          name: "currentIncident",
          source: "selectedDayIncidents",
          transform: [
            {
              type: "filter",
              expr: "datum.incident_index - 1 === currentIncidentIndex",
            },
          ],
        },

        {
          name: "treemapHierarchy",
          source: "traffic",
          transform: [
            {
              type: "filter",
              expr: "year(datum.date) === selectedYear",
            },
            {
              type: "filter",
              expr: "selectedDate ? timeFormat(datum.date, '%Y-%m-%d') === timeFormat(selectedDate.dateOnly, '%Y-%m-%d') : true",
            },
            {
              type: "filter",
              expr: "selectedTime ? (hours(datum.date) === selectedTime.hour && minutes(datum.date) === selectedTime.minute) : true",
            },
            {
              type: "formula",
              expr: "datum.severity", // Simplified since we removed time grouping
              as: "group1",
            },
            {
              type: "formula",
              expr: "treemapMode === 'time' ? datum.severity : datum.acci_name",
              as: "group2",
            },
            {
              type: "formula",
              expr: "treemapDepth < 3 ? null : datum.acci_name",
              as: "group3",
            },
            {
              type: "nest",
              keys: ["group1", "group2", "group3"],
              generate: true,
            },
          ],
        },
        {
          name: "tree",
          source: "treemapBase",
          transform: [
            {
              type: "stratify",
              key: "id",
              parentKey: "parent",
            },
            {
              type: "formula",
              expr: "1", // Set constant value to maintain static layout
              as: "scaledValue",
            },
            {
              type: "lookup",
              from: "incidents",
              key: "acci_name",
              fields: ["id"],
              values: ["value"],
              as: ["count"],
              default: 0,
            },

            {
              type: "filter",
              expr: "severityFilter === 'All' || datum.parent === severityFilter || datum.parent === null || datum.parent === 'root'",
            },
            {
              type: "formula",
              expr: "datum.parent === null || datum.parent === 'root' ? 1 : 1",
              as: "scaledValue",
            },
            {
              type: "treemap",
              field: "scaledValue",
              size: [
                { signal: "width * sizeScale" },
                { signal: "treemapHeight * sizeScale" },
              ],
              round: true,
              method: { signal: "layout" },
              ratio: { signal: "aspectRatio" },
              paddingInner: 2,
            },
          ],
        },
        {
          name: "clockLabels",
          values: [
            { angle: 0, label: "3" },
            { angle: 30, label: "4" },
            { angle: 60, label: "5" },
            { angle: 90, label: "6" },
            { angle: 120, label: "7" },
            { angle: 150, label: "8" },
            { angle: 180, label: "9" },
            { angle: 210, label: "10" },
            { angle: 240, label: "11" },
            { angle: 270, label: "12" },
            { angle: 300, label: "1" },
            { angle: 330, label: "2" },
          ],
        },
        {
          name: "selectedTimeIncidents",
          source: "selectedDayIncidents",
          transform: [
            {
              type: "filter",
              expr: "hours(datum.date) === (selectedHour + (selectedPeriod === 'PM' && selectedHour !== 12 ? 12 : (selectedHour === 12 && selectedPeriod === 'AM' ? 0 : 0))) && minutes(datum.date) === selectedMinute",
            },
          ],
        },
      ],

      scales: [
        {
          name: "y",
          type: "band",
          domain: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
          range: [0, { signal: "height" }],
        },

        {
          name: "color",
          type: "quantile",
          range: { scheme: { signal: "scheme" }, count: 600 },
          domain: { data: "dailyIncidents", field: "incidents" },
          nice: false,
        },
        {
          name: "treemapColor",
          type: "ordinal",
          domain: ["بسيط (Minor)", "بليغ (Severe)", "اخرى (Other)"],
          range: { scheme: { signal: "scheme" } },
        },
        {
          name: "opacity",
          type: "ordinal",
          domain: [0, 1, 2],
          range: [0.7, 0.9, 1.0],
        },
      ],
      legends: [
        {
          fill: "color",
          title: "Daily Traffic Incidents",
          titleFontSize: 16,
          titleOrient: "left",
          titlePadding: 25,
          labelFontSize: 14,
          offset: 20,
          orient: "top",
          type: "gradient",
          direction: "horizontal",
          gradientLength: 250,
          gradientThickness: 16,
          values: [0, 100, 200, 300, 400, 500, 600],
        },
        {
          fill: "treemapColor",
          title: "Severity Level / مستوى الشدة",
          orient: "bottom",
          direction: "horizontal",
        },
      ],
      layout: { columns: 1, padding: 30 },
      marks: [
        {
          type: "group",
          name: "mainView",
          encode: {
            enter: {
              width: { signal: "width + 200" },
              height: { signal: "height" },
            },
          },
          marks: [
            {
              type: "group",
              name: "calendar",
              from: {
                facet: {
                  data: "dailyIncidents",
                  name: "years",
                  groupby: "year",
                },
              },
              encode: {
                update: {
                  width: { signal: "width" },
                  height: { signal: "height" },
                },
              },
              scales: [
                {
                  name: "x",
                  type: "band",
                  domain: { data: "years", field: "week", sort: true },
                  range: [0, { signal: "width - 40" }],
                  padding: 0.15,
                },
              ],
              axes: [
                {
                  orient: "left",
                  scale: "y",
                  ticks: false,
                  domain: false,
                  labelPadding: 10,
                  title: "",
                  labelFontSize: 14,
                },
              ],
              marks: [
                {
                  type: "text",
                  encode: {
                    enter: {
                      x: { value: -60 },
                      y: { value: -10 },
                      text: { signal: "parent.year" },
                      fontSize: { value: 20 },
                      fontWeight: { value: "bold" },
                      align: { value: "right" },
                    },
                  },
                },
                {
                  type: "text",
                  from: { data: "years" },
                  encode: {
                    update: {
                      x: { scale: "x", field: "week" },
                      y: { value: -25 },
                      text: { field: "monthName" },
                      fontSize: { value: 16 },
                      fontWeight: { value: "bold" },
                      align: { value: "left" },
                      opacity: { field: "showMonthLabel" },
                    },
                  },
                },
                {
                  name: "cell",
                  type: "rect",
                  from: { data: "years" },
                  encode: {
                    enter: {
                      x: { scale: "x", field: "week" },
                      width: { scale: "x", band: 1, offset: -2 },
                      y: { scale: "y", field: "day" },
                      height: { scale: "y", band: 1, offset: -2 },
                      cornerRadius: { value: 3 },
                      tooltip: {
                        signal:
                          "timeFormat(datum.dateOnly, '%A, %B %d, %Y') + '\\nIncidents: ' + datum.incidents + '\\nWeek: ' + datum.week",
                      },
                    },
                    update: {
                      fill: [
                        {
                          test: "datum.incidents > 0",
                          scale: "color",
                          field: "incidents",
                        },
                        { value: "#f5f5f5" },
                      ],
                      fillOpacity: {
                        signal:
                          "playing || animationTime > 0 ? (datum.week <= animationTime ? 1 : 0.2) : 1",
                      },
                      stroke: [
                        {
                          test: "selectedDate && timeFormat(datum.dateOnly, '%Y-%m-%d') === timeFormat(selectedDate.dateOnly, '%Y-%m-%d')",
                          value: "#000",
                        },
                        { value: "white" },
                      ],
                      strokeWidth: [
                        {
                          test: "selectedDate && timeFormat(datum.dateOnly, '%Y-%m-%d') === timeFormat(selectedDate.dateOnly, '%Y-%m-%d')",
                          value: 2,
                        },
                        { value: 1 },
                      ],
                    },
                    hover: {
                      strokeWidth: { value: 2 },
                      stroke: { value: "#333" },
                    },
                  },
                },
              ],
            },
            {
              type: "group",
              name: "clock",
              encode: {
                enter: {
                  x: { signal: "width" },
                  y: { value: 0 },
                },
              },
              marks: [
                {
                  type: "arc",
                  encode: {
                    enter: {
                      x: { value: 90 },
                      y: { value: 90 },
                      innerRadius: { value: 0 },
                      outerRadius: { value: 90 },
                      startAngle: { value: 0 },
                      endAngle: { value: 6.283 },
                      fill: { value: "#f2f2f2" },
                      stroke: { value: "transparent" },
                    },
                  },
                },
                {
                  type: "text",
                  from: { data: "clockLabels" },
                  encode: {
                    enter: {
                      x: {
                        signal: "90 + 75 * cos(datum.angle * PI / 180)",
                      },
                      y: {
                        signal: "90 + 75 * sin(datum.angle * PI / 180)",
                      },
                      text: { field: "label" },
                      fontSize: { value: 18 },
                      fontWeight: { value: "bold" },
                      align: { value: "center" },
                      baseline: { value: "middle" },
                    },
                  },
                },
                {
                  type: "rule",
                  name: "minuteHand",
                  encode: {
                    enter: {
                      x: { value: 90 },
                      y: { value: 90 },
                      stroke: { value: "#ff0000" },
                      strokeWidth: { value: 2 },
                    },
                    update: {
                      x2: {
                        signal:
                          "90 + 75 * cos((minutes + seconds/60) * PI/30 - PI/2)",
                      },
                      y2: {
                        signal:
                          "90 + 75 * sin((minutes + seconds/60) * PI/30 - PI/2)",
                      },
                    },
                  },
                },

                {
                  type: "rule",
                  name: "secondHand",
                  encode: {
                    enter: {
                      x: { value: 90 },
                      y: { value: 90 },
                      stroke: { value: "#0000ff" },
                      strokeWidth: { value: 1 },
                      strokeCap: { value: "round" }, // Added rounded caps
                    },
                    update: {
                      x2: {
                        signal: "90 + 85 * cos(seconds * PI/30 - PI/2)",
                      },
                      y2: {
                        signal: "90 + 85 * sin(seconds * PI/30 - PI/2)",
                      },
                    },
                  },
                },
                {
                  type: "rule",
                  name: "hourHand",
                  encode: {
                    enter: {
                      x: { value: 90 },
                      y: { value: 90 },
                      stroke: { value: "#000000" },
                      strokeWidth: { value: 4 },
                    },
                    update: {
                      x2: {
                        signal:
                          "90 + 45 * cos((hours % 12 + minutes/60) * 30 * PI/180 - PI/2)",
                      },
                      y2: {
                        signal:
                          "90 + 45 * sin((hours % 12 + minutes/60) * 30 * PI/180 - PI/2)",
                      },
                    },
                  },
                },
                {
                  type: "text",
                  encode: {
                    update: {
                      x: { value: 50 },
                      y: { value: 180 },
                      text: { signal: "clockLabel" },
                      fontSize: { value: 16 },
                      fontWeight: { value: "bold" },
                      align: { value: "center" },
                      baseline: { value: "top" },
                    },
                  },
                },
                {
                  type: "text",
                  encode: {
                    update: {
                      x: { value: 90 },
                      y: { value: 210 },
                      text: { signal: "timeDisplay" },
                      fontSize: { value: 16 },
                      align: { value: "center" },
                      baseline: { value: "top" },
                    },
                  },
                },

                {
                  type: "symbol",
                  encode: {
                    enter: {
                      x: { value: 90 },
                      y: { value: 90 },
                      size: { value: 100 },
                      fill: { value: "#000000" },
                      shape: { value: "circle" },
                      zindex: { value: 1 }, // Added zindex to ensure center dot stays on top
                    },
                  },
                },
              ],
            },
            {
              type: "group",
              name: "treemap",
              encode: {
                enter: {
                  y: { signal: "height + 30" },
                  width: { signal: "width" },
                  height: { signal: "treemapHeight" },
                  x: { signal: "-100" },
                },
              },
              marks: [
                {
                  type: "rect",
                  from: { data: "tree" },
                  encode: {
                    update: {
                      x: { field: "x0" },
                      y: { field: "y0" },
                      x2: { field: "x1" },
                      y2: { field: "y1" },
                      fill: {
                        signal:
                          "datum.parent === null ? scale('treemapColor', datum.id) : datum.parent === 'root' ? scale('treemapColor', datum.id) : (selectedDate && data('selectedTimeIncidents').length > 0 && pluck(data('selectedTimeIncidents'), 'acci_name')[0] === datum.id) ? '#ff0000' : (datum.parent === 'بسيط (Minor)' ? scale('treemapColor', 'بسيط (Minor)') : datum.parent === 'بليغ (Severe)' ? scale('treemapColor', 'بليغ (Severe)') : scale('treemapColor', 'اخرى (Other)'))",
                      },
                      fillOpacity: {
                        signal:
                          "severityFilter === 'All' || datum.parent === severityFilter || datum.parent === null || datum.parent === 'root' ? (selectedDate && data('selectedTimeIncidents').length > 0 && pluck(data('selectedTimeIncidents'), 'acci_name')[0] === datum.id ? 1 : 0.6) : 0.2",
                      },
                      tooltip: {
                        signal:
                          "{'Time': selectedDate ? format(selectedHour === 0 ? 12 : selectedHour, '02d') + ':' + format(selectedMinute, '02d') + ' ' + selectedPeriod : '', 'Incident Type': datum.name, 'Severity Level': datum.parent, 'Count': datum.count}",
                      },
                    },
                    hover: {
                      fill: { value: "red" },
                      stroke: { value: "white" },
                      strokeWidth: { value: 3 },
                    },
                  },
                },
                {
                  type: "text",
                  from: { data: "tree" },
                  encode: {
                    enter: {
                      font: { value: "Arial" },
                      align: { value: "center" },
                      baseline: { value: "middle" },
                      fontWeight: { value: "bold" },
                    },
                    update: {
                      x: { signal: "(datum.x0 + datum.x1) / 2" },
                      y: { signal: "(datum.y0 + datum.y1) / 2" },
                      text: { field: "name" },
                      fontSize: { signal: "textScale" },
                      fill: { signal: "textColor" },
                      angle: { value: 0 },
                      opacity: {
                        signal:
                          "selectedDate && data('selectedTimeIncidents').length > 0 && datum.id === pluck(data('selectedTimeIncidents'), 'acci_name')[0] ? 1 : 0.8",
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
      config: {
        axis: {
          labelFont: "Arial",
          titleFont: "Arial",
        },
        text: {
          font: "Arial",
        },
        animation: {
          duration: 500,
          easing: "ease-in-out",
        },
      },
    };

    // Embed the visualization
    vegaEmbed("#vegaLiteContainer", spec, {
      actions: true,
      theme: "dark",
    }).catch(console.error);
  } catch (error) {
    console.error("Error loading visualization:", error);
    document.getElementById("vegaLiteContainer").innerHTML =
      '<p class="text-red-500">Error loading visualization. Please try again later.</p>';
  }
});
