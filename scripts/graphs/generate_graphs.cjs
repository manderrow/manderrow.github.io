const exporter = require("highcharts-export-server");
const fs = require("fs/promises");

const DATA = require("./data.json");
const SYSTEMS = ["Low-end", "High-end"];

// Logic must be triggered in an asynchronous function
(async () => {
  for (const entry of DATA) {
    // Export options correspond to the available CLI/HTTP arguments described above
    const options = {
      export: {
        type: "svg",
        options: {
          title: {
            text: entry.name,
          },
          xAxis: {
            categories: Object.keys(entry.data),
          },
          yAxis: {
            title: {
              text: entry.yLabel,
            },
          },
          series: [
            ...new Array(2).fill(0).map((_, i) => ({
              type: "bar",
              name: SYSTEMS[i],
              data: Object.values(entry.data).map((metrics) => metrics[i]),
            })),
          ],
        },
      },
    };

    // Initialize export settings with your chart's config
    const exportSettings = exporter.setOptions(options);

    // Must initialize exporting before being able to export charts
    await exporter.initExport(exportSettings);

    // Perform an export
    await exporter.startExport(exportSettings, async (error, info) => {
      if (error) return console.error(error);

      // The export result is now in info
      // It will be base64 encoded (info.result)
      await fs.writeFile(`${entry.name}.svg`, info.result);
    });
  }

  // Kill the pool when we are done with it
  await exporter.killPool();
})();
