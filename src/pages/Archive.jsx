import { useState } from "react";
import { useDatabase } from "../context/DatabaseContext";
import MiniRing from "../components/MiniRing";

export default function Archive() {
  const { database, getAllStrains } = useDatabase();
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedStrain, setSelectedStrain] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveTab, setArchiveTab] = useState("browse");

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
          {Object.keys(database).length} species &bull; {allStrains.length} strains
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
                setArchiveTab("browse");
              }
            }}
            style={{ padding: "8px 16px", fontSize: "0.8125rem", borderRadius: 50 }}
          >
            &larr; Back
          </button>
        </div>
      )}

      <div className="archive-layout">
        {/* Browse list */}
        {!currentStrain && !selectedSpecies && (
          <div className="archive-sidebar">
            {/* Segmented control */}
            <div className="segmented-control" style={{ margin: "0 0 16px" }}>
              <button
                className={`segmented-btn ${archiveTab === "browse" ? "active" : ""}`}
                onClick={() => setArchiveTab("browse")}
              >
                Browse
              </button>
              <button
                className={`segmented-btn ${archiveTab === "search" ? "active" : ""}`}
                onClick={() => setArchiveTab("search")}
              >
                Search
              </button>
            </div>

            {archiveTab === "search" && (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search species, strains, benefits..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {/* Quick stats — mini rings */}
            <div className="mini-rings-row" style={{ marginBottom: 16, padding: "8px 0" }}>
              <MiniRing
                value={String(Object.keys(database).length)}
                label="Species"
                percent={75}
                color="#10b981"
              />
              <MiniRing
                value={String(allStrains.length)}
                label="Strains"
                percent={85}
                color="#3b82f6"
              />
              <MiniRing
                value={String(Object.keys(speciesGroups).length)}
                label="Showing"
                percent={(Object.keys(speciesGroups).length / Math.max(1, Object.keys(database).length)) * 100}
                color="#8b5cf6"
              />
            </div>

            <div className="species-list">
              {Object.entries(speciesGroups).map(([speciesName, group]) => (
                <div key={speciesName} className="species-group">
                  <button
                    className={`species-btn ${selectedSpecies === speciesName ? "active" : ""}`}
                    onClick={() => {
                      setSelectedSpecies(speciesName);
                      setSelectedStrain(null);
                    }}
                  >
                    <span className="species-name">{speciesName}</span>
                    <span className="strain-count">
                      {group.strains.length}
                    </span>
                  </button>
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
        <h2 style={{ fontStyle: "italic", fontSize: "1.375rem" }}>{speciesName}</h2>

        {/* Visual ring indicators for species properties */}
        <div className="mini-rings-row" style={{ padding: "12px 0" }}>
          <MiniRing
            value={species.genus?.slice(0, 4) || "?"}
            label="Genus"
            percent={70}
            color="#10b981"
            size={48}
            strokeWidth={4}
          />
          <MiniRing
            value={species.shape?.slice(0, 4) || "?"}
            label="Shape"
            percent={60}
            color="#3b82f6"
            size={48}
            strokeWidth={4}
          />
          <MiniRing
            value={species.grampStain === "positive" ? "G+" : "G-"}
            label="Gram"
            percent={80}
            color="#8b5cf6"
            size={48}
            strokeWidth={4}
          />
        </div>

        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Oxygen</span>
            <span className="info-value">{species.oxygenRequirement}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Shape</span>
            <span className="info-value">{species.shape}</span>
          </div>
        </div>
        {species.generalDescription && (
          <div className="info-box" style={{ margin: "12px 0 0" }}>
            <p>{species.generalDescription}</p>
          </div>
        )}
      </div>

      <h3 style={{ padding: "0 4px", marginBottom: 10 }}>
        Strains ({strains.length})
      </h3>

      {/* Horizontal swipeable strain cards */}
      <div className="hscroll-container" style={{ padding: "4px 0 12px", margin: 0 }}>
        {strains.map((item) => (
          <button
            key={item.strainName}
            className={`hscroll-card ${selectedStrain === item ? "selected" : ""}`}
            onClick={() => onSelectStrain(item)}
            style={{
              background: selectedStrain === item ? "#d1fae5" : "white",
              border: selectedStrain === item ? "2px solid #10b981" : "2px solid transparent",
              borderRadius: 16,
              padding: "14px 16px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: selectedStrain === item
                ? "0 4px 14px rgba(16, 185, 129, 0.2)"
                : "0 2px 8px rgba(0,0,0,0.06)",
              transform: selectedStrain === item ? "translateY(-2px)" : "none",
              transition: "all 0.2s"
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "#1a1d26", marginBottom: 4 }}>
              {item.strainName}
            </div>
            {item.strain.origin && (
              <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 500 }}>
                {item.strain.origin.length > 30 ? item.strain.origin.slice(0, 30) + "..." : item.strain.origin}
              </div>
            )}
            {item.strain.documentedBenefits && (
              <div style={{
                marginTop: 6,
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "#10b981",
                background: "#f0fdf4",
                padding: "3px 8px",
                borderRadius: 50,
                display: "inline-block"
              }}>
                {item.strain.documentedBenefits.length} benefits
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function StrainDetail({ strain, strainName, speciesName }) {
  const [detailTab, setDetailTab] = useState("overview");

  return (
    <div className="strain-detail">
      {/* Hero card */}
      <div className="card" style={{ textAlign: "center", paddingBottom: 16 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #10b981, #059669)",
          margin: "0 auto 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)"
        }}>
          <span style={{ color: "white", fontSize: "1.5rem", fontWeight: 900 }}>
            {strainName.charAt(0)}
          </span>
        </div>
        <h2 style={{ fontSize: "1.375rem", marginBottom: 6 }}>{strainName}</h2>
        <span className="species-tag">{speciesName}</span>
        {strain.alternateNames?.length > 0 && (
          <span className="alt-names">
            AKA: {strain.alternateNames.join(", ")}
          </span>
        )}
        {strain.origin && (
          <div style={{ marginTop: 12, fontSize: "0.8125rem", color: "#6b7280" }}>
            {strain.origin}
          </div>
        )}
      </div>

      {/* Segmented control for detail sections */}
      <div style={{ padding: "0 16px" }}>
        <div className="segmented-control">
          <button
            className={`segmented-btn ${detailTab === "overview" ? "active" : ""}`}
            onClick={() => setDetailTab("overview")}
          >
            Overview
          </button>
          <button
            className={`segmented-btn ${detailTab === "science" ? "active" : ""}`}
            onClick={() => setDetailTab("science")}
          >
            Science
          </button>
          <button
            className={`segmented-btn ${detailTab === "usage" ? "active" : ""}`}
            onClick={() => setDetailTab("usage")}
          >
            Usage
          </button>
        </div>
      </div>

      {/* Overview tab */}
      {detailTab === "overview" && (
        <>
          {/* Benefits */}
          <section className="detail-section">
            <h3>Documented Benefits</h3>
            <ul className="benefits-list">
              {strain.documentedBenefits?.map((benefit, i) => (
                <li key={i}>{benefit}</li>
              ))}
            </ul>
          </section>

          {/* Fermentation Quick View */}
          {strain.fermentation && (
            <section className="detail-section">
              <h3>Fermentation</h3>
              <div className="mini-rings-row" style={{ padding: "8px 0 12px" }}>
                <MiniRing
                  value={`${strain.fermentation.optimalTemp}°`}
                  label="Temp"
                  percent={Math.min(90, (strain.fermentation.optimalTemp / 50) * 100)}
                  color="#ef4444"
                />
                <MiniRing
                  value={`${strain.fermentation.optimalDuration}h`}
                  label="Time"
                  percent={Math.min(90, (strain.fermentation.optimalDuration / 48) * 100)}
                  color="#3b82f6"
                />
                <MiniRing
                  value={`${strain.fermentation.doublingTimeMinutes}m`}
                  label="Doubling"
                  percent={Math.min(90, 100 - (strain.fermentation.doublingTimeMinutes / 120) * 100)}
                  color="#10b981"
                />
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">pH Range</span>
                  <span className="info-value">
                    {strain.fermentation.optimalPH?.join("–")}
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
                <div className="info-item">
                  <span className="info-label">Temp Range</span>
                  <span className="info-value">
                    {strain.fermentation.tempRange?.[0]}–{strain.fermentation.tempRange?.[1]}°C
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Synergies */}
          {strain.synergies && strain.synergies.length > 0 && (
            <section className="detail-section">
              <h3>Synergistic Combinations</h3>
              {strain.synergies.map((syn, i) => (
                <div key={i} className="synergy-card">
                  <div className="synergy-header">
                    <strong>{syn.strain}</strong>
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
        </>
      )}

      {/* Science tab */}
      {detailTab === "science" && (
        <>
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
        </>
      )}

      {/* Usage tab */}
      {detailTab === "usage" && (
        <>
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
                <div className="info-box" style={{ marginTop: 12 }}>
                  <p>{strain.consumption.notes}</p>
                </div>
              )}
              {strain.consumption.deliveryForms && (
                <div style={{ marginTop: 12 }}>
                  <div className="pill-scroll" style={{ padding: "4px 0", margin: 0 }}>
                    {strain.consumption.deliveryForms.map((df, i) => (
                      <div
                        key={i}
                        className="pill-btn"
                        style={{
                          cursor: "default",
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          minWidth: 100,
                          textAlign: "center"
                        }}
                      >
                        <span style={{ fontWeight: 800 }}>{df.form}</span>
                        <span style={{ fontSize: "0.6875rem", color: "#10b981" }}>{df.efficacy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
        </>
      )}
    </div>
  );
}
