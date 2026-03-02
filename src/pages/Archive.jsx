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
      <h1>Bacteria & Strain Archive</h1>
      <p className="page-description">
        Browse the scientific database of bacteria species, strains, benefits,
        synergies, and supplement compatibility.
      </p>

      <div className="archive-layout">
        {/* Sidebar */}
        <aside className="archive-sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search species, strains, benefits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    {group.strains.length} strain
                    {group.strains.length !== 1 ? "s" : ""}
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
        </aside>

        {/* Main Content */}
        <main className="archive-content">
          {!currentStrain && !selectedSpecies && (
            <div className="empty-state">
              <h2>Select a species or strain</h2>
              <p>
                Browse the sidebar to explore bacteria species and their strains.
                Each strain page shows detailed biological information, consumption
                guidance, synergies, and supplement compatibility.
              </p>
              <div className="quick-stats">
                <div className="stat">
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
            </div>
          )}

          {selectedSpecies && !currentStrain && (
            <SpeciesOverview
              species={speciesGroups[selectedSpecies]?.species}
              speciesName={selectedSpecies}
            />
          )}

          {currentStrain && (
            <StrainDetail
              strain={currentStrain.strain}
              strainName={currentStrain.strainName}
              speciesName={currentStrain.speciesName}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function SpeciesOverview({ species, speciesName }) {
  if (!species) return null;
  return (
    <div className="species-overview">
      <h2>{speciesName}</h2>
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
      <div className="info-box">
        <p>{species.generalDescription}</p>
      </div>
      <p className="hint-text">Select a strain from the sidebar for detailed information.</p>
    </div>
  );
}

function StrainDetail({ strain, strainName, speciesName }) {
  return (
    <div className="strain-detail">
      <div className="strain-header">
        <h2>{strainName}</h2>
        <span className="species-tag">{speciesName}</span>
        {strain.alternateNames?.length > 0 && (
          <span className="alt-names">
            Also known as: {strain.alternateNames.join(", ")}
          </span>
        )}
      </div>

      <div className="info-item">
        <span className="info-label">Origin</span>
        <span className="info-value">{strain.origin}</span>
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
