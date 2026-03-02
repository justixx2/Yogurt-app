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
      <h1>Fermentation Recipe Builder</h1>
      <p className="page-description">
        Select a bacteria species, strain, and fermentation medium to generate
        an optimized recipe with growth simulation.
      </p>

      {/* Step 1: Species & Strain Selection */}
      <section className="card">
        <h2>1. Select Bacteria</h2>
        <div className="form-row">
          <div className="form-group">
            <label>Species</label>
            <select value={selectedSpecies} onChange={handleSpeciesChange}>
              <option value="">-- Select Species --</option>
              {speciesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Strain</label>
            <select
              value={selectedStrain}
              onChange={handleStrainChange}
              disabled={!selectedSpecies}
            >
              <option value="">-- Select Strain --</option>
              {strainsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Step 2: Inoculation Settings */}
      {strainData && (
        <section className="card">
          <h2>2. Inoculation</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Capsule Strength (CFU)</label>
              <select
                value={capsuleStrength}
                onChange={(e) => setCapsuleStrength(Number(e.target.value))}
              >
                <option value={500000000}>500 million</option>
                <option value={1000000000}>1 billion</option>
                <option value={2000000000}>2 billion</option>
                <option value={5000000000}>5 billion</option>
                <option value={10000000000}>10 billion</option>
                <option value={50000000000}>50 billion</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Capsules</label>
              <select
                value={capsuleCount}
                onChange={(e) => setCapsuleCount(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Volume (mL)</label>
              <select
                value={volumeML}
                onChange={(e) => setVolumeML(Number(e.target.value))}
              >
                <option value={500}>500 mL</option>
                <option value={1000}>1 litre</option>
                <option value={1500}>1.5 litres</option>
                <option value={2000}>2 litres</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={useStarter}
                onChange={(e) => setUseStarter(e.target.checked)}
              />
              <span>Use existing ferment as starter culture</span>
            </label>
          </div>

          {useStarter && strainData.fermentation.starterMode && (
            <div className="info-box">
              <strong>Starter Culture Mode</strong>
              <p>{strainData.fermentation.starterMode.notes}</p>
              <ul>
                <li>
                  Lag phase reduction:{" "}
                  {strainData.fermentation.starterMode.lagPhaseReduction}%
                </li>
                <li>
                  Fermentation time reduction:{" "}
                  {strainData.fermentation.starterMode.timeReduction}%
                </li>
              </ul>
            </div>
          )}

          <div className="stat-row">
            <div className="stat">
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
          <h2>3. Select Fermentation Medium</h2>
          <div className="medium-grid">
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
                    <CompatibilityBadge status={medium.compatibility} />
                  </div>
                  <div className="medium-ph">
                    pH {medium.initialPH} → {medium.finalPH}
                  </div>
                  <div className="medium-score">
                    Score: {medium.compatibilityScore}/100
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
          <h2>4. Optimal Fermentation Parameters</h2>
          <div className="params-grid">
            <div className="param">
              <span className="param-label">Temperature</span>
              <span className="param-value">
                {strainData.fermentation.optimalTemp}°C
              </span>
              <span className="param-range">
                Range: {strainData.fermentation.tempRange[0]}–
                {strainData.fermentation.tempRange[1]}°C
              </span>
            </div>
            <div className="param">
              <span className="param-label">Duration</span>
              <span className="param-value">
                {simulation?.optimalDuration || strainData.fermentation.optimalDuration}h
              </span>
              <span className="param-range">
                Range: {strainData.fermentation.durationRange[0]}–
                {strainData.fermentation.durationRange[1]}h
              </span>
            </div>
            <div className="param">
              <span className="param-label">Oxygen</span>
              <span className="param-value">
                {strainData.fermentation.oxygenRequirement}
              </span>
            </div>
            <div className="param">
              <span className="param-label">Optimal pH</span>
              <span className="param-value">
                {strainData.fermentation.optimalPH[0]}–
                {strainData.fermentation.optimalPH[1]}
              </span>
            </div>
            <div className="param">
              <span className="param-label">Initial pH</span>
              <span className="param-value">{currentMedium.initialPH}</span>
            </div>
            <div className="param">
              <span className="param-label">Expected Final pH</span>
              <span className="param-value">{currentMedium.finalPH}</span>
            </div>
          </div>
        </section>
      )}

      {/* Step 5: Additives */}
      {currentMedium && currentMedium.additives && (
        <section className="card">
          <h2>5. Recommended Additives</h2>
          <p className="section-desc">
            Select additives to include in your recipe. Each shows its effect on{" "}
            {strainData.name || selectedStrain} growth.
          </p>
          <div className="additives-list">
            {currentMedium.additives.map((additive) => (
              <div
                key={additive.name}
                className={`additive-card ${selectedAdditives.includes(additive.name) ? "selected" : ""}`}
                onClick={() => toggleAdditive(additive.name)}
              >
                <div className="additive-header">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedAdditives.includes(additive.name)}
                      onChange={() => toggleAdditive(additive.name)}
                    />
                    <strong>{additive.name}</strong>
                  </label>
                  <span className="boost-badge">
                    +{additive.estimatedGrowthBoost}% growth
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
          <h2>6. Growth Simulation</h2>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-label">Starting CFU</span>
              <span className="stat-value">
                {formatCFU(simulation.initialCFU)}
              </span>
            </div>
            <div className="stat highlight">
              <span className="stat-label">Estimated Final CFU</span>
              <span className="stat-value">
                {formatCFU(simulation.finalCFU)}
              </span>
            </div>
            {selectedAdditives.length > 0 && (
              <div className="stat">
                <span className="stat-label">Boost Factor</span>
                <span className="stat-value">
                  {((simulation.boostFactor - 1) * 100).toFixed(0)}% increase
                </span>
              </div>
            )}
          </div>

          <div className="chart-container">
            <h3>Bacterial Growth Curve</h3>
            <GrowthChart
              data={simulation.growthCurve}
              comparisonData={simulation.baseCurve}
              width={Math.min(700, typeof window !== "undefined" ? window.innerWidth - 80 : 700)}
              height={300}
            />
          </div>

          {/* Growth timeline table */}
          <div className="table-container">
            <h3>Growth Timeline</h3>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Estimated CFU</th>
                  <th>Phase</th>
                </tr>
              </thead>
              <tbody>
                {simulation.growthCurve.map((point) => {
                  let phase = "Lag";
                  if (point.hour > simulation.lagPhaseHours + 2) phase = "Log (active growth)";
                  if (point.hour > strainData.fermentation.stationaryPhaseStart)
                    phase = "Stationary";
                  return (
                    <tr key={point.hour}>
                      <td>{point.hour}h</td>
                      <td>{formatCFU(point.cfu)}</td>
                      <td>
                        <span className={`phase-tag phase-${phase.split(" ")[0].toLowerCase()}`}>
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
              <h3>Additive Contributions</h3>
              {simulation.contributions.map((c) => (
                <div key={c.name} className="contribution-item">
                  <div className="contribution-header">
                    <strong>{c.name}</strong>
                    <span className="boost-badge">
                      +{c.boostPercent}% ({formatCFU(c.additionalCFU)} additional CFU)
                    </span>
                  </div>
                  <div className="contribution-detail">
                    <span className={`category-tag ${c.category.replace(/[\s/]+/g, "-")}`}>
                      {c.category}
                    </span>
                    <span>{c.mechanism}</span>
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

      {/* Medium Comparison Dashboard */}
      {strainData && mediumKeys.length > 1 && (
        <section className="card">
          <h2>Medium Comparison</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medium</th>
                  <th>Compatibility</th>
                  <th>Score</th>
                  <th>Initial pH</th>
                  <th>Final pH</th>
                  <th>Additives</th>
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
                      <td>{m.name}</td>
                      <td>
                        <CompatibilityBadge status={m.compatibility} />
                      </td>
                      <td>{m.compatibilityScore}/100</td>
                      <td>{m.initialPH}</td>
                      <td>{m.finalPH}</td>
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
