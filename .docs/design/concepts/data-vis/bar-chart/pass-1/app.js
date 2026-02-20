/* ============================================================
   Bar Chart — Pass 1 | Application Logic
   Chart.js v4.4.7 — Grouped / Stacked bar chart
   ============================================================ */

(function () {
  "use strict";

  // ---- Palette ----
  const COLORS = {
    indigo:      "#6366F1",
    indigoFade:  "rgba(99, 102, 241, 0.15)",
    pink:        "#EC4899",
    pinkFade:    "rgba(236, 72, 153, 0.15)",
    violet:      "#A78BFA",
    violetFade:  "rgba(167, 139, 250, 0.15)",
    rose:        "#F9A8D4",
    roseFade:    "rgba(249, 168, 212, 0.15)",
    surface:     "#1E293B",
    gridLine:    "rgba(248, 250, 252, 0.06)",
    tickText:    "rgba(248, 250, 252, 0.45)",
    tooltipBg:   "#0F172A",
    tooltipText: "#F8FAFC",
  };

  // ---- Mock Data ----
  const projects = [
    { name: "Wavz.fm Music Platform",       tasks_total: 47, tasks_done: 31, ideas_count: 23, collaborators: 5  },
    { name: "Campus Learning App",           tasks_total: 62, tasks_done: 18, ideas_count: 41, collaborators: 8  },
    { name: "RepoSaver Backup Tool",         tasks_total: 28, tasks_done: 28, ideas_count: 12, collaborators: 2  },
    { name: "Storyboarder Video Editor",     tasks_total: 85, tasks_done: 42, ideas_count: 56, collaborators: 12 },
    { name: "Event Invites System",          tasks_total: 34, tasks_done: 20, ideas_count: 15, collaborators: 4  },
    { name: "Portfolio Builder Pro",         tasks_total: 19, tasks_done: 19, ideas_count: 8,  collaborators: 1  },
  ];

  // Short labels for small screens
  const shortLabels = projects.map(function (p) {
    var words = p.name.split(" ");
    return words.length > 2 ? words[0] : p.name;
  });

  const fullLabels = projects.map(function (p) { return p.name; });

  // ---- Gradient Factory ----
  function makeGradient(ctx, colorStart, colorEnd) {
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    g.addColorStop(0, colorStart);
    g.addColorStop(1, colorEnd);
    return g;
  }

  // ---- Create Datasets ----
  function buildDatasets(ctx) {
    return [
      {
        label: "Tasks Total",
        data: projects.map(function (p) { return p.tasks_total; }),
        backgroundColor: makeGradient(ctx, COLORS.indigo, "rgba(99, 102, 241, 0.55)"),
        hoverBackgroundColor: COLORS.indigo,
        borderColor: COLORS.indigo,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Tasks Done",
        data: projects.map(function (p) { return p.tasks_done; }),
        backgroundColor: makeGradient(ctx, COLORS.pink, "rgba(236, 72, 153, 0.55)"),
        hoverBackgroundColor: COLORS.pink,
        borderColor: COLORS.pink,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Ideas",
        data: projects.map(function (p) { return p.ideas_count; }),
        backgroundColor: makeGradient(ctx, COLORS.violet, "rgba(167, 139, 250, 0.55)"),
        hoverBackgroundColor: COLORS.violet,
        borderColor: COLORS.violet,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: "Collaborators",
        data: projects.map(function (p) { return p.collaborators; }),
        backgroundColor: makeGradient(ctx, COLORS.rose, "rgba(249, 168, 212, 0.55)"),
        hoverBackgroundColor: COLORS.rose,
        borderColor: COLORS.rose,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ];
  }

  // ---- Responsive label helper ----
  function getLabels() {
    return window.innerWidth < 640 ? shortLabels : fullLabels;
  }

  // ---- Chart Config ----
  var canvas = document.getElementById("barChart");
  var ctx = canvas.getContext("2d");

  var chartConfig = {
    type: "bar",
    data: {
      labels: getLabels(),
      datasets: buildDatasets(ctx),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutQuart",
        delay: function (context) {
          // Stagger bars: each dataset + each data point
          var datasetDelay = context.datasetIndex * 120;
          var dataDelay = context.dataIndex * 60;
          return datasetDelay + dataDelay;
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false, // We use our own filter UI
        },
        tooltip: {
          backgroundColor: COLORS.tooltipBg,
          titleColor: COLORS.tooltipText,
          bodyColor: COLORS.tooltipText,
          borderColor: "rgba(99, 102, 241, 0.25)",
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: { size: 13, weight: "600" },
          bodyFont: { size: 12, weight: "400" },
          bodySpacing: 6,
          usePointStyle: true,
          boxPadding: 4,
          callbacks: {
            title: function (items) {
              if (!items.length) return "";
              var idx = items[0].dataIndex;
              return projects[idx].name;
            },
            label: function (item) {
              return " " + item.dataset.label + ": " + item.formattedValue;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: {
            display: false,
          },
          ticks: {
            color: COLORS.tickText,
            font: { size: 11, weight: "500" },
            maxRotation: 45,
            minRotation: 0,
          },
          border: {
            color: COLORS.gridLine,
          },
        },
        y: {
          stacked: false,
          beginAtZero: true,
          grid: {
            color: COLORS.gridLine,
          },
          ticks: {
            color: COLORS.tickText,
            font: { size: 11 },
            padding: 8,
          },
          border: {
            display: false,
          },
        },
      },
    },
  };

  var chart = new Chart(ctx, chartConfig);

  // ---- Layout Toggle (Grouped / Stacked) ----
  var currentMode = "grouped";
  var toggleBtns = document.querySelectorAll(".toggle-btn");

  toggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var mode = btn.getAttribute("data-mode");
      if (mode === currentMode) return;

      currentMode = mode;
      var stacked = mode === "stacked";

      // Update active class
      toggleBtns.forEach(function (b) { b.classList.remove("toggle-btn--active"); });
      btn.classList.add("toggle-btn--active");

      // Update scales
      chart.options.scales.x.stacked = stacked;
      chart.options.scales.y.stacked = stacked;

      chart.update("active");
    });
  });

  // ---- Dataset Filter (Checkboxes) ----
  var checks = document.querySelectorAll(".check input[type='checkbox']");

  checks.forEach(function (cb) {
    cb.addEventListener("change", function () {
      var idx = parseInt(cb.closest(".check").getAttribute("data-index"), 10);
      var meta = chart.getDatasetMeta(idx);
      meta.hidden = !cb.checked;
      chart.update("active");
    });
  });

  // ---- Responsive Labels on Resize ----
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      chart.data.labels = getLabels();

      // Rebuild gradients since canvas size changed
      var newDatasets = buildDatasets(ctx);
      chart.data.datasets.forEach(function (ds, i) {
        ds.backgroundColor = newDatasets[i].backgroundColor;
      });

      chart.update("none");
    }, 150);
  });

})();
