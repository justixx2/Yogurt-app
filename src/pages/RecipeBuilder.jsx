import { useState, useMemo } from "react";
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

  const speciesList = getSpeciesList();
  const strainsList = selectedSpecies ? getStrainsList(selectedSpecies) : [];
  const strainData = selectedSpecies && selectedStrain
    ? getStrain(selectedSpecies, selectedStrain)
    : null;

  const mediumProfiles = strainData?.fermentation?.mediumProfiles || {};
  const mediumKeys = Object.keys(mediumProfiles);
  const currentMedium = mediumProfiles[selectedMedium] || null;

  const handleSpeciesChange = (e) => {
    setSelectedSpecies(e.target.value);
    setSelectedStrain("");
    setSelectedMedium("");
    setSelectedAdditives([]);
  };

  const handleStrainChange = (e) => {
    setSelectedStrain(e.target.value);
    setSelectedMedium("");
    setSelectedAdditives([]);
  };

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

    // Base curve without additives for comparison
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

  return (
    <div className="page recipe-builder">
      <div className="page-header">
        <h1>Recipe Builder</h1>
        <p className="page-subtitle">
          Build an optimized fermentation recipe with growth simulation
        </p>
      </div>

      {/* Step 1: Species & Strain Selection */}
      <section className="card">
        <div className="section-title">
          <span className="step-number">1</span>
          <h2>Select Bacteria</h2>
        </div>
        <div className="form-group" style={{ marginBottom: 12 }}>
          <label>Species</label>
          <select value={selectedSpecies} onChange={handleSpeciesChange}>
            <option value="">Choose species...</option>
            {speciesList.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {selectedSpecies && (
          <div className="form-group">
            <label>Strain</label>
            <select
              value={selectedStrain}
              onChange={handleStrainChange}
              disabled={!selectedSpecies}
            >
              <option value="">Choose strain...</option>
              {strainsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Step 2: Inoculation Settings */}
      {strainData && (
        <section className="card">
          <div className="section-title">
            <span className="step-number">2</span>
            <h2>Inoculation</h2>
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label>Capsule Strength</label>
            <select
              value={capsuleStrength}
              onChange={(e) => setCapsuleStrength(Number(e.target.value))}
            >
              <option value={500000000}>500 million CFU</option>
              <option value={1000000000}>1 billion CFU</option>
              <option value={2000000000}>2 billion CFU</option>
              <option value={5000000000}>5 billion CFU</option>
              <option value={10000000000}>10 billion CFU</option>
              <option value={50000000000}>50 billion CFU</option>
            </select>
          </div>

          {/* Horizontal scroll for capsule count */}
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 8 }}>
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

          {/* Volume pills */}
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

      {/* Step 3: Medium Selection — horizontal swipeable */}
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

      {/* Step 4: Optimal Parameters — circular gauges */}
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
            <h2>Growth Simulation</h2>
          </div>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-label">Start</span>
              <span className="stat-value">
                {formatCFU(simulation.initialCFU)}
              </span>
            </div>
            <div className="stat highlight">
              <span className="stat-label">Final CFU</span>
              <span className="stat-value">
                {formatCFU(simulation.finalCFU)}
              </span>
            </div>
            {selectedAdditives.length > 0 && (
              <div className="stat">
                <span className="stat-label">Boost</span>
                <span className="stat-value">
                  +{((simulation.boostFactor - 1) * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Bar chart visualization */}
          <h3>Growth Timeline</h3>
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

          {/* Line chart */}
          <div className="chart-container" style={{ marginTop: 20 }}>
            <h3>Detailed Growth Curve</h3>
            <GrowthChart
              data={simulation.growthCurve}
              comparisonData={simulation.baseCurve}
              width={Math.min(440, typeof window !== "undefined" ? window.innerWidth - 72 : 440)}
              height={240}
            />
          </div>

          {/* Growth timeline table */}
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

          {/* Additive contributions */}
          {simulation.contributions.length > 0 && (
            <div className="contributions">
              <h3>Additive Impact</h3>
              {simulation.contributions.map((c) => (
                <div key={c.name} className="contribution-item">
                  <div className="contribution-header">
                    <strong>{c.name}</strong>
                    <span className="boost-badge">
                      +{c.boostPercent}%
                    </span>
                  </div>
                  <div className="contribution-detail">
                    <span className={`category-tag ${c.category.replace(/[\s/]+/g, "-")}`}>
                      {c.category}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }}>
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

      {/* Medium Comparison — horizontal scrollable */}
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
