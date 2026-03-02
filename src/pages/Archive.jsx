import { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";

export default function Archive() {
  const { database, getAllStrains } = useDatabase();
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allStrains = getAllStrains();

  const filteredStrains = searchQuery
    ? allStrains.filter(
        (s) =>
          s.speciesName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.strainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.strain.documentedBenefits?.some((b) =>
            b.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : allStrains;

  const speciesGroups = {};
  for (const item of filteredStrains) {
    if (!speciesGroups[item.speciesName]) {
      speciesGroups[item.speciesName] = {
        species: item.species,
        strains: []
      };
    }
    speciesGroups[item.speciesName].strains.push(item);
  }

  const currentStrain = selectedStrain;

  return (
    <div className="page archive">
      <div className="page-header">
        <h1>Archive</h1>
        <p className="page-subtitle">
          Explore bacteria species, strains, and their properties
        </p>
      </div>

      {/* Back button when viewing detail */}
      {(currentStrain || selectedSpecies) && (
        <div style={{ padding: "0 16px 8px" }}>
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (currentStrain) {
                setSelectedStrain(null);
              } else {
                setSelectedSpecies(null);
              }
            }}
            style={{ padding: "8px 16px", fontSize: "0.8125rem" }}
          >
            &larr; Back
          </button>
        </div>
      )}

      <div className="archive-layout">
        {/* Browse list — visible when no detail selected */}
        {!currentStrain && !selectedSpecies && (
          <div className="archive-sidebar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search species, strains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick stats */}
            <div className="stat-row" style={{ marginBottom: 16 }}>
              <div className="stat highlight">
                <span className="stat-value">
                  {Object.keys(database).length}
                </span>
                <span className="stat-label">Species</span>
              </div>
              <div className="stat">
                <span className="stat-value">{allStrains.length}</span>
                <span className="stat-label">Strains</span>
              </div>
            </div>

            <div className="species-list">
              {Object.entries(speciesGroups).map(([speciesName, group]) => (
                <div key={speciesName} className="species-group">
                  <button
                    className={`species-btn ${selectedSpecies === speciesName ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSpecies(
                        selectedSpecies === speciesName ? null : speciesName
                      );
                      setSelectedStrain(null);
                    }}
                  >
                    <span className="species-name">{speciesName}</span>
                    <span className="strain-count">
                      {group.strains.length}
                    </span>
                  </button>

                  {selectedSpecies === speciesName && (
                    <div className="strain-list">
                      {group.strains.map((item) => (
                        <button
                          key={item.strainName}
                          className={`strain-btn ${selectedStrain === item ? "active" : ""}`}
                          onClick={() => setSelectedStrain(item)}
                        >
                          {item.strainName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Species overview */}
        {selectedSpecies && !currentStrain && (
          <div className="archive-sidebar">
            <SpeciesOverview
              species={speciesGroups[selectedSpecies]?.species}
              speciesName={selectedSpecies}
              strains={speciesGroups[selectedSpecies]?.strains || []}
              onSelectStrain={setSelectedStrain}
              selectedStrain={selectedStrain}
            />
          </div>
        )}

        {/* Strain detail */}
        {currentStrain && (
          <main className="archive-content">
            <StrainDetail
              strain={currentStrain.strain}
              strainName={currentStrain.strainName}
              speciesName={currentStrain.speciesName}
            />
          </main>
        )}
      </div>
    </div>
  );
}

function SpeciesOverview({ species, speciesName, strains, onSelectStrain, selectedStrain }) {
  if (!species) return null;
  return (
    <div className="species-overview">
      <div className="card" style={{ margin: "0 0 16px" }}>
        <h2 style={{ fontStyle: "italic" }}>{speciesName}</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Genus</span>
            <span className="info-value">{species.genus}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Gram Stain</span>
            <span className="info-value">{species.grampStain}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Shape</span>
            <span className="info-value">{species.shape}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Oxygen</span>
            <span className="info-value">{species.oxygenRequirement}</span>
          </div>
        </div>
        {species.generalDescription && (
          <div className="info-box">
            <p>{species.generalDescription}</p>
          </div>
        )}
      </div>

      <h3 style={{ padding: "0 4px", marginBottom: 10 }}>Strains</h3>
      <div className="species-list">
        {strains.map((item) => (
          <button
            key={item.strainName}
            className={`species-btn ${selectedStrain === item ? "active" : ""}`}
            onClick={() => onSelectStrain(item)}
          >
            <span style={{ fontWeight: 700 }}>{item.strainName}</span>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>&rarr;</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StrainDetail({ strain, strainName, speciesName }) {
  return (
    <div className="strain-detail">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="strain-header" style={{ marginBottom: 0 }}>
          <h2>{strainName}</h2>
          <span className="species-tag">{speciesName}</span>
          {strain.alternateNames?.length > 0 && (
            <span className="alt-names">
              AKA: {strain.alternateNames.join(", ")}
            </span>
          )}
          <div className="info-item" style={{ marginTop: 12, textAlign: "left" }}>
            <span className="info-label">Origin</span>
            <span className="info-value">{strain.origin}</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <section className="detail-section">
        <h3>Documented Benefits</h3>
        <ul className="benefits-list">
          {strain.documentedBenefits?.map((benefit, i) => (
            <li key={i}>{benefit}</li>
          ))}
        </ul>
      </section>

      {/* Mechanisms */}
      {strain.mechanismsOfAction && (
        <section className="detail-section">
          <h3>Mechanisms of Action</h3>
          <ul className="mechanisms-list">
            {strain.mechanismsOfAction.map((mech, i) => (
              <li key={i}>{mech}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Survival */}
      {strain.survivalCharacteristics && (
        <section className="detail-section">
          <h3>Survival Characteristics</h3>
          <div className="info-grid">
            {Object.entries(strain.survivalCharacteristics).map(
              ([key, value]) => (
                <div key={key} className="info-item">
                  <span className="info-label">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="info-value">{value}</span>
                </div>
              )
            )}
          </div>
        </section>
      )}

      {/* Consumption Guidance */}
      {strain.consumption && (
        <section className="detail-section">
          <h3>Consumption Guidance</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Best Timing</span>
              <span className="info-value">{strain.consumption.bestTiming}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Optimal Dosage</span>
              <span className="info-value">
                {strain.consumption.optimalDosage}
              </span>
            </div>
          </div>
          {strain.consumption.notes && (
            <div className="info-box">
              <p>{strain.consumption.notes}</p>
            </div>
          )}
          {strain.consumption.deliveryForms && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Delivery Form</th>
                    <th>Efficacy</th>
                  </tr>
                </thead>
                <tbody>
                  {strain.consumption.deliveryForms.map((df, i) => (
                    <tr key={i}>
                      <td>{df.form}</td>
                      <td>{df.efficacy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Synergies */}
      {strain.synergies && strain.synergies.length > 0 && (
        <section className="detail-section">
          <h3>Synergistic Combinations</h3>
          {strain.synergies.map((syn, i) => (
            <div key={i} className="synergy-card">
              <div className="synergy-header">
                <strong>
                  {syn.strain}
                </strong>
                <span className="species-tag">{syn.species}</span>
              </div>
              <ul>
                {syn.benefits.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Supplement Compatibility */}
      {strain.supplementCompatibility &&
        strain.supplementCompatibility.length > 0 && (
          <section className="detail-section">
            <h3>Supplement Compatibility</h3>
            <div className="supplements-grid">
              {strain.supplementCompatibility.map((supp, i) => (
                <div key={i} className="supplement-card">
                  <div className="supplement-header">
                    <strong>{supp.name}</strong>
                    <span className={`category-tag ${supp.category}`}>
                      {supp.category}
                    </span>
                  </div>
                  <p>{supp.benefit}</p>
                  <div className="supplement-timing">
                    <span className="timing-label">Timing:</span> {supp.timing}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      {/* Fermentation Quick View */}
      {strain.fermentation && (
        <section className="detail-section">
          <h3>Fermentation Quick Reference</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Optimal Temp</span>
              <span className="info-value">
                {strain.fermentation.optimalTemp}°C
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Duration</span>
              <span className="info-value">
                {strain.fermentation.optimalDuration}h
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">pH Range</span>
              <span className="info-value">
                {strain.fermentation.optimalPH?.join("–")}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Doubling Time</span>
              <span className="info-value">
                {strain.fermentation.doublingTimeMinutes} min
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Max CFU/mL</span>
              <span className="info-value">
                {strain.fermentation.maxCFUperML?.toExponential(1)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Oxygen</span>
              <span className="info-value">
                {strain.fermentation.oxygenRequirement}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
