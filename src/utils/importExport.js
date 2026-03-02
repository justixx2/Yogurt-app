/**
 * Import / Export utilities for the bacteria database.
 * Supports JSON and CSV formats.
 */

/**
 * Export the full database as JSON.
 */
export function exportDatabaseJSON(database) {
  const data = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "yogurt-app-database",
    data: database
  };
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, "bacteria-database.json", "application/json");
}

/**
 * Export a single recipe as JSON.
 */
export function exportRecipeJSON(recipe) {
  const data = {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    type: "yogurt-app-recipe",
    data: recipe
  };
  const json = JSON.stringify(data, null, 2);
  const filename = `recipe-${recipe.species}-${recipe.strain}-${recipe.medium}.json`
    .replace(/\s+/g, "-")
    .toLowerCase();
  downloadFile(json, filename, "application/json");
}

/**
 * Export strain data as CSV.
 */
export function exportStrainsCSV(database) {
  const rows = [
    [
      "Species",
      "Strain",
      "Origin",
      "Optimal Temp (°C)",
      "Duration (h)",
      "pH Range",
      "Doubling Time (min)",
      "Max CFU/mL",
      "Benefits"
    ].join(",")
  ];

  for (const species of Object.values(database)) {
    for (const strain of Object.values(species.strains)) {
      const ferm = strain.fermentation;
      rows.push(
        [
          `"${species.species}"`,
          `"${strain.name}"`,
          `"${strain.origin}"`,
          ferm.optimalTemp,
          ferm.optimalDuration,
          `"${ferm.optimalPH.join("–")}"`,
          ferm.doublingTimeMinutes,
          ferm.maxCFUperML,
          `"${strain.documentedBenefits.join("; ")}"`
        ].join(",")
      );
    }
  }

  downloadFile(rows.join("\n"), "bacteria-strains.csv", "text/csv");
}

/**
 * Import database from JSON file.
 * Returns the parsed data or throws on invalid format.
 */
export function importDatabaseJSON(jsonString) {
  const parsed = JSON.parse(jsonString);

  if (!parsed.type || !parsed.type.startsWith("yogurt-app-")) {
    throw new Error(
      "Invalid file format. Expected a Yogurt App export file."
    );
  }

  if (!parsed.data) {
    throw new Error("No data found in the import file.");
  }

  return {
    type: parsed.type,
    data: parsed.data,
    version: parsed.version,
    exportDate: parsed.exportDate
  };
}

/**
 * Merge imported data into existing database.
 * New species/strains are added; existing ones can be optionally overwritten.
 */
export function mergeDatabase(existing, imported, overwrite = false) {
  const merged = { ...existing };

  for (const [speciesName, speciesData] of Object.entries(imported)) {
    if (!merged[speciesName]) {
      // New species — add entirely
      merged[speciesName] = speciesData;
    } else if (overwrite) {
      // Overwrite existing species
      merged[speciesName] = speciesData;
    } else {
      // Merge strains
      for (const [strainName, strainData] of Object.entries(
        speciesData.strains || {}
      )) {
        if (!merged[speciesName].strains[strainName] || overwrite) {
          merged[speciesName].strains[strainName] = strainData;
        }
      }
    }
  }

  return merged;
}

/**
 * Helper to trigger a file download in the browser.
 */
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read a file and return its text content.
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}
