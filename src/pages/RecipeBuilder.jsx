import { useState, useMemo, useEffect, useCallback } from "react";
import { useDatabase } from "../context/DatabaseContext";
import {
  generateGrowthCurve,
  calculateBoostFactor,
  calculateAdditiveContributions,
  applyStarterMode,
  formatCFU
} from "../utils/fermentation";
import GrowthChart from "../components/GrowthChart";
import CompatibilityBadge from "../components/CompatibilityBadge";
import ArcGauge from "../components/ArcGauge";
import MiniRing from "../components/MiniRing";

const RECENT_KEY = "yogurt-recent-species";

function getRecentSpecies() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch { return []; }
}

function saveRecentSpecies(species) {
  try {
    const prev = getRecentSpecies().filter(s => s !== species);
    localStorage.setItem(RECENT_KEY, JSON.stringify([species, ...prev].slice(0, 20)));
  } catch {}
}

export default function RecipeBuilder() {
  const { database, getSpeciesList, getStrainsList, getStrain } = useDatabase();

  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedStrain, setSelectedStrain] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");
  const [selectedAdditives, setSelectedAdditives] = useState([]);
  const [useStarter, setUseStarter] = useState(false);
  const [capsuleStrength, setCapsuleStrength] = useState(2000000000);
  const [capsuleCount, setCapsuleCount] = useState(1);
  const [volumeML, setVolumeML] = useState(1000);
  const [simView, setSimView] = useState("bars");
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSpecies, setRecentSpecies] = useState(getRecentSpecies);

  const speciesList = getSpeciesList();
  const strainsList = selectedSpecies ? getStrainsList(selectedSpecies) : [];
  const strainData = selectedSpecies && selectedStrain
    ? getStrain(selectedSpecies, selectedStrain)
    : null;

  const mediumProfiles = strainData?.fermentation?.mediumProfiles || {};
  const mediumKeys = Object.keys(mediumProfiles);
  const currentMedium = mediumProfiles[selectedMedium] || null;

  // Sort species: recently viewed first, then alphabetical
  const sortedSpecies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // Build flat list of {species, strain} for search
    let filtered = speciesList;
    if (q) {
      // Match species name or any strain name within that species
      filtered = speciesList.filter(sp => {
        if (sp.toLowerCase().includes(q)) return true;
        const strains = getStrainsList(sp);
        return strains.some(st => st.toLowerCase().includes(q));
      });
    }

    // Sort: recent first, then alphabetical
    const recentSet = new Set(recentSpecies);
    return [...filtered].sort((a, b) => {
      const aRecent = recentSet.has(a);
      const bRecent = recentSet.has(b);
      if (aRecent && !bRecent) return -1;
      if (!aRecent && bRecent) return 1;
      if (aRecent && bRecent) {
        return recentSpecies.indexOf(a) - recentSpecies.indexOf(b);
      }
      return a.localeCompare(b);
    });
  }, [speciesList, searchQuery, recentSpecies, getStrainsList]);

  const handleSpeciesClick = useCallback((species) => {
    if (selectedSpecies === species) {
      // Clicking same species again deselects it
      setSelectedSpecies("");
      setSelectedStrain("");
      setSelectedMedium("");
      setSelectedAdditives([]);
      return;
    }
    setSelectedSpecies(species);
    setSelectedStrain("");
    setSelectedMedium("");
    setSelectedAdditives([]);
    saveRecentSpecies(species);
    setRecentSpecies(getRecentSpecies());
  }, [selectedSpecies]);

  const handleStrainClick = useCallback((strain) => {
    setSelectedStrain(strain);
    setSelectedMedium("");
    setSelectedAdditives([]);
  }, []);

  const handleMediumChange = (key) => {
    setSelectedMedium(key);
    setSelectedAdditives([]);
  };

  const toggleAdditive = (name) => {
    setSelectedAdditives((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  // Growth simulation
  const simulation = useMemo(() => {
    if (!strainData || !currentMedium) return null;

    const ferm = strainData.fermentation;
    const initialCFU = capsuleStrength * capsuleCount;
    const boostFactor = calculateBoostFactor(
      currentMedium.additives,
      selectedAdditives
    );

    let lagPhaseHours = ferm.lagPhase;
    let optimalDuration = ferm.optimalDuration;
    let starterNotes = "";

    if (useStarter && ferm.starterMode) {
      const adjusted = applyStarterMode(ferm, ferm.starterMode);
      lagPhaseHours = adjusted.lagPhaseHours;
      optimalDuration = adjusted.optimalDuration;
      starterNotes = adjusted.starterNotes;
    }

    const timePoints = [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48].filter(
      (t) => t <= Math.max(optimalDuration + 12, 36)
    );

    const growthCurve = generateGrowthCurve({
      initialCFU,
      doublingTimeMin: ferm.doublingTimeMinutes,
      lagPhaseHours,
      stationaryPhaseStart: ferm.stationaryPhaseStart,
      maxCFUperML: ferm.maxCFUperML,
      volumeML,
      totalHours: Math.max(optimalDuration + 12, 36),
      boostFactor,
      timePoints
    });

    const baseCurve = generateGrowthCurve({
      initialCFU,
      doublingTimeMin: ferm.doublingTimeMinutes,
      lagPhaseHours,
      stationaryPhaseStart: ferm.stationaryPhaseStart,
      maxCFUperML: ferm.maxCFUperML,
      volumeML,
      totalHours: Math.max(optimalDuration + 12, 36),
      boostFactor: 1.0,
      timePoints
    });

    const finalCFU = growthCurve[growthCurve.length - 1]?.cfu || 0;
    const baseFinalCFU = baseCurve[baseCurve.length - 1]?.cfu || 0;

    const contributions = calculateAdditiveContributions(
      currentMedium.additives,
      selectedAdditives,
      baseFinalCFU
    );

    return {
      growthCurve,
      baseCurve: selectedAdditives.length > 0 ? baseCurve : null,
      finalCFU,
      baseFinalCFU,
      contributions,
      boostFactor,
      lagPhaseHours,
      optimalDuration,
      starterNotes,
      initialCFU
    };
  }, [
    strainData,
    currentMedium,
    selectedAdditives,
    useStarter,
    capsuleStrength,
    capsuleCount,
    volumeML
  ]);

  // Count how many strains match the search (for showing match hints)
  const getMatchingStrains = useCallback((species) => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const strains = getStrainsList(species);
    return strains.filter(s => s.toLowerCase().includes(q));
  }, [searchQuery, getStrainsList]);

  return (
    <div className="page recipe-builder">
      <div className="page-header">
        <h1>Recipe Builder</h1>
        <p className="page-subtitle">
          Tap a species, pick a strain — 1 tap each
        </p>
      </div>

      {/* Search bar — always at the top */}
      <div className="card" style={{ paddingBottom: 14 }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search bacteria species or strains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Species list — all visible, single tap */}
        <div className="species-pick-list">
          {sortedSpecies.map((species) => {
            const isSelected = selectedSpecies === species;
            const isRecent = recentSpecies.includes(species);
            const matchingStrains = getMatchingStrains(species);
            const strains = getStrainsList(species);

            return (
              <div key={species} className="species-pick-group">
                <button
                  className={`species-pick-btn ${isSelected ? "active" : ""}`}
                  onClick={() => handleSpeciesClick(species)}
                >
                  <div className="species-pick-left">
                    {isRecent && <span className="recent-dot"></span>}
                    <span className="species-pick-name">{species}</span>
                  </div>
                  <div className="species-pick-right">
                    <span className="species-pick-count">{strains.length}</span>
                    <span className={`species-pick-chevron ${isSelected ? "open" : ""}`}>
                      &#8250;
                    </span>
                  </div>
                </button>

                {/* Strain pills — visible when species is selected */}
                {isSelected && strains.length > 0 && (
                  <div className="strain-pills">
                    {strains.map((strain) => (
                      <button
                        key={strain}
                        className={`strain-pill ${selectedStrain === strain ? "active" : ""}`}
                        onClick={() => handleStrainClick(strain)}
                      >
                        {strain}
                      </button>
                    ))}
                  </div>
                )}

                {/* Show matching strains hint when searching */}
                {!isSelected && matchingStrains.length > 0 && (
                  <div className="strain-match-hint">
                    Matches: {matchingStrains.join(", ")}
                  </div>
                )}
              </div>
            );
          })}

          {sortedSpecies.length === 0 && (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <p>No species match "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected bacteria summary */}
      {strainData && (
        <div className="card" style={{ padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Selected
            </div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1d26" }}>
              {selectedStrain}
            </div>
            <div style={{ fontSize: "0.75rem", fontStyle: "italic", color: "#6b7280" }}>
              {selectedSpecies}
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 900, fontSize: "1.125rem",
            boxShadow: "0 2px 8px rgba(16,185,129,0.3)"
          }}>
            {selectedStrain.charAt(0)}
          </div>
        </div>
      )}

      {/* Step 2: Inoculation Settings */}
      {strainData && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">2</span>
            <h2>Inoculation</h2>
          </div>

          {/* Capsule strength as pills instead of dropdown */}
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>
            Capsule Strength
          </label>
          <div className="pill-scroll">
            {[
              { v: 500000000, label: "500M" },
              { v: 1000000000, label: "1B" },
              { v: 2000000000, label: "2B" },
              { v: 5000000000, label: "5B" },
              { v: 10000000000, label: "10B" },
              { v: 50000000000, label: "50B" }
            ].map(({ v, label }) => (
              <button
                key={v}
                className={`pill-btn ${capsuleStrength === v ? "active" : ""}`}
                onClick={() => setCapsuleStrength(v)}
              >
                {label}
              </button>
            ))}
          </div>

          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginTop: 16, marginBottom: 8 }}>
            Capsules
          </label>
          <div className="pill-scroll">
            {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
              <button
                key={n}
                className={`pill-btn ${capsuleCount === n ? "active" : ""}`}
                onClick={() => setCapsuleCount(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginTop: 16, marginBottom: 8 }}>
            Volume
          </label>
          <div className="pill-scroll">
            {[
              { v: 500, label: "500 mL" },
              { v: 1000, label: "1 L" },
              { v: 1500, label: "1.5 L" },
              { v: 2000, label: "2 L" }
            ].map(({ v, label }) => (
              <button
                key={v}
                className={`pill-btn ${volumeML === v ? "active" : ""}`}
                onClick={() => setVolumeML(v)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Starter toggle */}
          <div className="toggle-row">
            <span className="toggle-label">Starter culture</span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={useStarter}
                onChange={(e) => setUseStarter(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {useStarter && strainData.fermentation.starterMode && (
            <div className="info-box">
              <strong>Starter Culture Mode</strong>
              <p>{strainData.fermentation.starterMode.notes}</p>
              <ul>
                <li>Lag phase reduction: {strainData.fermentation.starterMode.lagPhaseReduction}%</li>
                <li>Fermentation time reduction: {strainData.fermentation.starterMode.timeReduction}%</li>
              </ul>
            </div>
          )}

          <div className="stat-row" style={{ marginTop: 12 }}>
            <div className="stat highlight">
              <span className="stat-label">Starting CFU</span>
              <span className="stat-value">
                {formatCFU(capsuleStrength * capsuleCount)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Medium Selection */}
      {strainData && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">3</span>
            <h2>Fermentation Medium</h2>
          </div>
          <div className="swipe-hint">
            <span className="swipe-hint-arrow">&larr;</span> Swipe to browse
          </div>
          <div className="medium-scroll">
            {mediumKeys.map((key) => {
              const medium = mediumProfiles[key];
              return (
                <button
                  key={key}
                  className={`medium-card ${selectedMedium === key ? "selected" : ""}`}
                  onClick={() => handleMediumChange(key)}
                >
                  <div className="medium-header">
                    <span className="medium-name">{medium.name}</span>
                  </div>
                  <CompatibilityBadge status={medium.compatibility} />
                  <div className="medium-ph">
                    pH {medium.initialPH} &rarr; {medium.finalPH}
                  </div>
                  <div className="medium-score">
                    {medium.compatibilityScore}/100
                  </div>
                  <div className="progress-bar" style={{ marginTop: 4 }}>
                    <div className="progress-fill" style={{ width: `${medium.compatibilityScore}%` }}></div>
                  </div>
                </button>
              );
            })}
          </div>

          {currentMedium && (
            <div className="info-box">
              <p>{currentMedium.explanation}</p>
            </div>
          )}
        </section>
      )}

      {/* Step 4: Optimal Parameters */}
      {strainData && currentMedium && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">4</span>
            <h2>Parameters</h2>
          </div>
          <div className="params-scroll">
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value">
                  {strainData.fermentation.optimalTemp}°
                </span>
              </div>
              <span className="param-label">Temp</span>
              <span className="param-range">
                {strainData.fermentation.tempRange[0]}–{strainData.fermentation.tempRange[1]}°C
              </span>
            </div>
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value">
                  {simulation?.optimalDuration || strainData.fermentation.optimalDuration}h
                </span>
              </div>
              <span className="param-label">Duration</span>
              <span className="param-range">
                {strainData.fermentation.durationRange[0]}–{strainData.fermentation.durationRange[1]}h
              </span>
            </div>
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value" style={{ fontSize: "0.75rem" }}>
                  {strainData.fermentation.oxygenRequirement.split(" ")[0]}
                </span>
              </div>
              <span className="param-label">Oxygen</span>
            </div>
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value">
                  {strainData.fermentation.optimalPH[0]}–{strainData.fermentation.optimalPH[1]}
                </span>
              </div>
              <span className="param-label">pH Range</span>
            </div>
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value">{currentMedium.initialPH}</span>
              </div>
              <span className="param-label">Start pH</span>
            </div>
            <div className="param-card">
              <div className="param-circle">
                <span className="param-value">{currentMedium.finalPH}</span>
              </div>
              <span className="param-label">End pH</span>
            </div>
          </div>
        </section>
      )}

      {/* Step 5: Additives */}
      {currentMedium && currentMedium.additives && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">5</span>
            <h2>Additives</h2>
          </div>
          <p className="section-desc">
            Tap to select additives for {strainData.name || selectedStrain}
          </p>
          <div className="additives-list">
            {currentMedium.additives.map((additive) => (
              <div
                key={additive.name}
                className={`additive-card ${selectedAdditives.includes(additive.name) ? "selected" : ""}`}
                onClick={() => toggleAdditive(additive.name)}
              >
                <div className="additive-header">
                  <strong>{additive.name}</strong>
                  <span className="boost-badge">
                    +{additive.estimatedGrowthBoost}%
                  </span>
                </div>
                <div className="additive-amount">
                  {additive.recommendedAmount}
                </div>
                <div className="additive-mechanism">{additive.mechanism}</div>
                <div className="additive-category">
                  <span className={`category-tag ${additive.category.replace(/[\s/]+/g, "-")}`}>
                    {additive.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Step 6: Growth Simulation */}
      {simulation && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">6</span>
            <h2>Growth Results</h2>
          </div>

          <div className="arc-gauge-section">
            <ArcGauge
              value={formatCFU(simulation.finalCFU)}
              label="Final CFU"
              sublabel={`from ${formatCFU(simulation.initialCFU)}`}
              percent={Math.min(95, Math.max(10, (Math.log10(simulation.finalCFU) / Math.log10(simulation.finalCFU * 1.5)) * 100))}
              size={220}
              strokeWidth={16}
              color="#10b981"
            />
          </div>

          <div className="mini-rings-row">
            <MiniRing
              value={`${simulation.optimalDuration}h`}
              label="Duration"
              percent={Math.min(90, (simulation.optimalDuration / 48) * 100)}
              color="#3b82f6"
            />
            <MiniRing
              value={`${simulation.lagPhaseHours.toFixed(0)}h`}
              label="Lag Phase"
              percent={Math.min(90, (simulation.lagPhaseHours / 8) * 100)}
              color="#f59e0b"
            />
            {selectedAdditives.length > 0 && (
              <MiniRing
                value={`+${((simulation.boostFactor - 1) * 100).toFixed(0)}%`}
                label="Boost"
                percent={Math.min(90, (simulation.boostFactor - 1) * 100 * 3)}
                color="#8b5cf6"
              />
            )}
            <MiniRing
              value={formatCFU(simulation.initialCFU).split(" ")[0]}
              label="Start"
              percent={20}
              color="#6b7280"
            />
          </div>

          <div className="segmented-control">
            <button
              className={`segmented-btn ${simView === "bars" ? "active" : ""}`}
              onClick={() => setSimView("bars")}
            >
              Bars
            </button>
            <button
              className={`segmented-btn ${simView === "curve" ? "active" : ""}`}
              onClick={() => setSimView("curve")}
            >
              Curve
            </button>
            <button
              className={`segmented-btn ${simView === "table" ? "active" : ""}`}
              onClick={() => setSimView("table")}
            >
              Table
            </button>
          </div>

          {simView === "bars" && (
            <div className="growth-bars">
              {simulation.growthCurve.map((point) => {
                const maxCFU = simulation.growthCurve[simulation.growthCurve.length - 1]?.cfu || 1;
                const logMax = Math.log10(Math.max(1, maxCFU));
                const logMin = Math.log10(Math.max(1, simulation.growthCurve[0]?.cfu || 1));
                const logVal = Math.log10(Math.max(1, point.cfu));
                const heightPct = Math.max(3, ((logVal - logMin) / (logMax - logMin || 1)) * 100);
                let phase = "lag";
                if (point.hour > simulation.lagPhaseHours + 2) phase = "log";
                if (point.hour > strainData.fermentation.stationaryPhaseStart) phase = "stationary";
                return (
                  <div key={point.hour} className="growth-bar-item">
                    <div className="growth-bar-value">{formatCFU(point.cfu)}</div>
                    <div
                      className={`growth-bar phase-${phase}`}
                      style={{ height: `${heightPct}%` }}
                    ></div>
                    <div className="growth-bar-label">{point.hour}h</div>
                  </div>
                );
              })}
            </div>
          )}

          {simView === "curve" && (
            <div className="chart-container">
              <GrowthChart
                data={simulation.growthCurve}
                comparisonData={simulation.baseCurve}
                width={Math.min(440, typeof window !== "undefined" ? window.innerWidth - 72 : 440)}
                height={240}
              />
            </div>
          )}

          {simView === "table" && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Est. CFU</th>
                    <th>Phase</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.growthCurve.map((point) => {
                    let phase = "Lag";
                    if (point.hour > simulation.lagPhaseHours + 2) phase = "Log";
                    if (point.hour > strainData.fermentation.stationaryPhaseStart)
                      phase = "Stationary";
                    return (
                      <tr key={point.hour}>
                        <td>{point.hour}h</td>
                        <td>{formatCFU(point.cfu)}</td>
                        <td>
                          <span className={`phase-tag phase-${phase.toLowerCase()}`}>
                            {phase}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {simulation.contributions.length > 0 && (
            <div className="contributions">
              <h3>Additive Impact</h3>
              {simulation.contributions.map((c) => (
                <div key={c.name} className="contribution-item">
                  <div className="contribution-header">
                    <strong>{c.name}</strong>
                    <span className="boost-badge">+{c.boostPercent}%</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${Math.min(100, c.boostPercent * 4)}%` }}></div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 4 }}>
                    {formatCFU(c.additionalCFU)} additional CFU
                  </div>
                </div>
              ))}
            </div>
          )}

          {simulation.starterNotes && (
            <div className="info-box">
              <strong>Starter Culture Adjustment</strong>
              <p>{simulation.starterNotes}</p>
            </div>
          )}
        </section>
      )}

      {/* Medium Comparison */}
      {strainData && mediumKeys.length > 1 && (
        <section className="card">
          <h2>Compare Media</h2>
          <div className="swipe-hint">
            <span className="swipe-hint-arrow">&larr;</span> Swipe to compare
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medium</th>
                  <th>Score</th>
                  <th>pH</th>
                  <th>Add.</th>
                </tr>
              </thead>
              <tbody>
                {mediumKeys.map((key) => {
                  const m = mediumProfiles[key];
                  return (
                    <tr
                      key={key}
                      className={selectedMedium === key ? "row-selected" : ""}
                      onClick={() => handleMediumChange(key)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#10b981" }}>
                          {m.compatibilityScore}
                        </span>
                      </td>
                      <td>{m.initialPH} &rarr; {m.finalPH}</td>
                      <td>{m.additives?.length || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
