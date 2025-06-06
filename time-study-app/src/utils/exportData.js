import ExcelJS from "exceljs";
import { saveAs } from "file-saver"; // exceljs recommends file-saver for browser downloads

// Prepare data returns array of arrays for both summary and steps
const prepareDataForExport = (timeStudy) => {
  const studySummaryData = [
    // Array of [label, value] pairs
    ["Study ID", timeStudy.id],
    ["Study Name", timeStudy.name],
    ["Status", timeStudy.status],
    ["Admin", timeStudy.admin?.username || "N/A"],
    ["Estimated Total Time (mins)", timeStudy.estimated_total_time || "N/A"],
    [
      "Actual Total Time (HH:MM:SS)",
      formatSecondsToHHMMSS(timeStudy.actual_total_time),
    ],
    ["Number of Steps", timeStudy.steps?.length || 0],
    [
      "Assigned Machinists",
      timeStudy.machinists?.map((m) => m.username).join(", ") || "N/A",
    ],
    ["Overall Notes", timeStudy.notes || ""],
  ];

  const stepsHeaderRow = [
    "Step Order",
    "Step Name",
    "Step Estimated Time (mins)",
    "Step Actual Time (HH:MM:SS)",
    "Step Notes",
  ];

  const stepsDataRows =
    timeStudy.steps
      ?.sort((a, b) => a.order - b.order)
      .map((step) => [
        step.order,
        step.name,
        step.estimated_time || "N/A",
        formatSecondsToHHMMSS(step.actual_time),
        step.notes || "",
      ]) || [];

  return { studySummaryData, stepsHeaderRow, stepsDataRows };
};

// Helper to format seconds to HH:MM:SS
const formatSecondsToHHMMSS = (totalSeconds) => {
  if (
    totalSeconds === null ||
    totalSeconds === undefined ||
    isNaN(totalSeconds)
  ) {
    return "N/A";
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
};

// --- CSV Export (Corrected) ---
export const exportToCSV = (timeStudy, filename = "time_study_export.csv") => {
  const { studySummaryData, stepsHeaderRow, stepsDataRows } =
    prepareDataForExport(timeStudy);

  let csvContent = "";

  // Add Summary Info
  csvContent += "Time Study Summary\n"; // Section title
  studySummaryData.forEach(([key, value]) => {
    // Destructure [key, value] from each item in studySummaryData
    // Escape double quotes within key and value, and enclose in double quotes
    const formattedKey = `"${String(key || "").replace(/"/g, '""')}"`;
    const formattedValue = `"${String(value || "").replace(/"/g, '""')}"`;
    csvContent += `${formattedKey},${formattedValue}\n`;
  });
  csvContent += "\n"; // Blank line separator before steps data

  // Add Steps Data
  if (stepsDataRows && stepsDataRows.length > 0) {
    // Add Steps Header Row
    csvContent +=
      stepsHeaderRow
        .map((header) => `"${String(header || "").replace(/"/g, '""')}"`)
        .join(",") + "\n";

    // Add Step Data Rows
    stepsDataRows.forEach((rowArray) => {
      csvContent +=
        rowArray
          .map(
            (cellValue) => `"${String(cellValue || "").replace(/"/g, '""')}"`
          )
          .join(",") + "\n";
    });
  } else {
    csvContent += "No step data available.\n";
  }

  // Create blob and trigger download (same as before)
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  }); // Added BOM for Excel compatibility
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// --- Excel Export using exceljs ---
export const exportToExcel = async (
  timeStudy,
  filename = "time_study_export.xlsx"
) => {
  const { studySummaryData, stepsHeaderRow, stepsDataRows } =
    prepareDataForExport(timeStudy);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Time Study App";
  workbook.lastModifiedBy = "Time Study App";
  workbook.created = new Date();
  workbook.modified = new Date();

  // --- Sheet 1: Study Summary ---
  const summarySheet = workbook.addWorksheet("Study Summary");
  // Add summary data (array of arrays) directly
  summarySheet.addRows(studySummaryData);
  // Style headers if you want (e.g., make the first column bold)
  summarySheet.getColumn(1).font = { bold: true };
  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 50;

  // --- Sheet 2: Step Details ---
  const stepsSheet = workbook.addWorksheet("Step Details");
  if (stepsDataRows.length > 0) {
    stepsSheet.addRow(stepsHeaderRow); // Add headers as the first row
    stepsSheet.addRows(stepsDataRows); // Add data rows (array of arrays)

    // Style steps sheet headers (optional)
    stepsSheet.getRow(1).font = { bold: true };
    stepsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    // Basic column width setting
    stepsHeaderRow.forEach((header, index) => {
      stepsSheet.getColumn(index + 1).width =
        header.includes("Name") || header.includes("Notes") ? 35 : 20;
    });
  } else {
    stepsSheet.addRow(["No step data available."]);
  }

  try {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  } catch (error) {
    console.error("Error writing Excel file:", error);
    alert("Error generating Excel file. Please try again.");
  }
};
