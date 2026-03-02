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
      <h1>Import / Export</h1>
      <p className="page-description">
        Export your bacteria database for backup or sharing. Import updated
        archives to expand your knowledge system.
      </p>

      {/* Database Stats */}
      <section className="card">
        <h2>Current Database</h2>
        <div className="stat-row">
          <div className="stat">
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
                {Object.keys(species.strains).length} strains:{" "}
                {Object.keys(species.strains).join(", ")}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section className="card">
        <h2>Export</h2>
        <p>Download your database in your preferred format.</p>
        <div className="button-row">
          <button className="btn btn-primary" onClick={handleExportJSON}>
            Export as JSON
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            Export Strains as CSV
          </button>
        </div>
      </section>

      {/* Import */}
      <section className="card">
        <h2>Import</h2>
        <p>
          Import a previously exported JSON database file. You can choose to
          merge with existing data or overwrite it.
        </p>

        <div className="form-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={overwriteMode}
              onChange={(e) => setOverwriteMode(e.target.checked)}
            />
            <span>
              Overwrite existing data (unchecked = merge, preserving existing entries)
            </span>
          </label>
        </div>

        <div className="file-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            id="file-import"
          />
          <label htmlFor="file-import" className="btn btn-primary">
            Choose JSON File to Import
          </label>
        </div>
      </section>

      {/* Status Messages */}
      {importStatus && (
        <div className="info-box success">
          <p>{importStatus}</p>
        </div>
      )}
      {importError && (
        <div className="info-box error">
          <p>{importError}</p>
        </div>
      )}

      {/* Reset */}
      <section className="card">
        <h2>Reset Database</h2>
        <p>
          Reset the database to the built-in defaults. This will remove any
          imported data.
        </p>
        {!showResetConfirm ? (
          <button
            className="btn btn-danger"
            onClick={() => setShowResetConfirm(true)}
          >
            Reset to Defaults
          </button>
        ) : (
          <div className="confirm-box">
            <p>
              <strong>Are you sure?</strong> This will remove all imported data
              and restore the default database.
            </p>
            <div className="button-row">
              <button className="btn btn-danger" onClick={handleReset}>
                Yes, Reset
              </button>
              <button
                className="btn btn-secondary"
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
