import { useState, useRef } from "react";
import { useDatabase } from "../context/DatabaseContext";
import {
  exportDatabaseJSON,
  exportStrainsCSV,
  importDatabaseJSON,
  mergeDatabase,
  readFileAsText
} from "../utils/importExport";

export default function DataManager() {
  const { database, updateDatabase, resetDatabase } = useDatabase();
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState(null);
  const [overwriteMode, setOverwriteMode] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const speciesCount = Object.keys(database).length;
  const strainCount = Object.values(database).reduce(
    (sum, species) => sum + Object.keys(species.strains).length,
    0
  );

  const handleExportJSON = () => {
    exportDatabaseJSON(database);
    setImportStatus("Database exported as JSON successfully.");
    setImportError(null);
  };

  const handleExportCSV = () => {
    exportStrainsCSV(database);
    setImportStatus("Strain data exported as CSV successfully.");
    setImportError(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus(null);
    setImportError(null);

    try {
      const text = await readFileAsText(file);
      const result = importDatabaseJSON(text);

      if (result.type === "yogurt-app-database") {
        const merged = mergeDatabase(database, result.data, overwriteMode);
        updateDatabase(merged);

        const newSpecies = Object.keys(result.data).length;
        const newStrains = Object.values(result.data).reduce(
          (sum, s) => sum + Object.keys(s.strains).length,
          0
        );

        setImportStatus(
          `Successfully imported ${newSpecies} species with ${newStrains} strains.` +
            (overwriteMode
              ? " (Overwrite mode — existing data was replaced)"
              : " (Merge mode — existing data was preserved)")
        );
      } else if (result.type === "yogurt-app-recipe") {
        setImportStatus(
          `Recipe imported: ${result.data.species} ${result.data.strain} in ${result.data.medium}`
        );
      }
    } catch (err) {
      setImportError(err.message || "Failed to import file.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    resetDatabase();
    setShowResetConfirm(false);
    setImportStatus("Database reset to defaults.");
    setImportError(null);
  };

  return (
    <div className="page data-manager">
      <div className="page-header">
        <h1>Data</h1>
        <p className="page-subtitle">
          Export, import, or reset your bacteria database
        </p>
      </div>

      {/* Database Stats */}
      <section className="card">
        <h2>Database</h2>
        <div className="stat-row">
          <div className="stat highlight">
            <span className="stat-value">{speciesCount}</span>
            <span className="stat-label">Species</span>
          </div>
          <div className="stat">
            <span className="stat-value">{strainCount}</span>
            <span className="stat-label">Strains</span>
          </div>
        </div>

        <div className="species-summary">
          {Object.entries(database).map(([name, species]) => (
            <div key={name} className="summary-item">
              <strong>{name}</strong>
              <span>
                {Object.keys(species.strains).length} strains
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="card">
        <h2>Export</h2>
        <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: 14 }}>
          Download your database for backup
        </p>
        <button className="btn btn-primary btn-full" onClick={handleExportJSON} style={{ marginBottom: 10 }}>
          Export as JSON
        </button>
        <button className="btn btn-secondary btn-full" onClick={handleExportCSV}>
          Export as CSV
        </button>
      </section>

      {/* Import */}
      <section className="card">
        <h2>Import</h2>
        <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: 14 }}>
          Import a JSON database file
        </p>

        <div className="toggle-row" style={{ paddingTop: 0 }}>
          <span className="toggle-label" style={{ fontSize: "0.875rem" }}>Overwrite mode</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={overwriteMode}
              onChange={(e) => setOverwriteMode(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: "0 0 14px" }}>
          {overwriteMode ? "Existing data will be replaced" : "New data will be merged with existing"}
        </p>

        <div className="file-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            id="file-import"
          />
          <label htmlFor="file-import" className="btn btn-primary btn-full">
            Choose File to Import
          </label>
        </div>
      </section>

      {/* Status Messages */}
      {importStatus && (
        <div style={{ padding: "0 16px" }}>
          <div className="info-box success">
            <p>{importStatus}</p>
          </div>
        </div>
      )}
      {importError && (
        <div style={{ padding: "0 16px" }}>
          <div className="info-box error">
            <p>{importError}</p>
          </div>
        </div>
      )}

      {/* Reset */}
      <section className="card">
        <h2>Reset</h2>
        <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginBottom: 14 }}>
          Restore the built-in default database
        </p>
        {!showResetConfirm ? (
          <button
            className="btn btn-danger btn-full"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset to Defaults
          </button>
        ) : (
          <div className="confirm-box">
            <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
              This will remove all imported data. Continue?
            </p>
            <div className="button-row">
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReset}>
                Yes, Reset
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
