/**
 * Fermentation simulation engine
 *
 * Models bacterial growth using a modified Gompertz / logistic growth model
 * with additive boost factors.
 */

/**
 * Calculate CFU at a given time point using a logistic growth model.
 *
 * @param {Object} params
 * @param {number} params.initialCFU - Starting CFU (from capsules/starter)
 * @param {number} params.doublingTimeMin - Doubling time in minutes
 * @param {number} params.lagPhaseHours - Duration of lag phase in hours
 * @param {number} params.stationaryPhaseStart - Hour at which growth plateaus
 * @param {number} params.maxCFUperML - Carrying capacity per mL
 * @param {number} params.volumeML - Volume in mL (default 1000 for 1L)
 * @param {number} params.timeHours - Time point to evaluate
 * @param {number} params.boostFactor - Combined growth boost (1.0 = no boost)
 * @returns {number} Estimated CFU at the given time
 */
export function calculateCFUAtTime({
  initialCFU,
  doublingTimeMin,
  lagPhaseHours,
  stationaryPhaseStart,
  maxCFUperML,
  volumeML = 1000,
  timeHours,
  boostFactor = 1.0
}) {
  const maxCFU = maxCFUperML * volumeML * boostFactor;

  if (timeHours <= lagPhaseHours) {
    // During lag phase: minimal growth, cells are adapting
    const lagProgress = timeHours / lagPhaseHours;
    return Math.round(initialCFU * (1 + lagProgress * 0.1));
  }

  // Active growth phase
  const activeTime = timeHours - lagPhaseHours;
  const doublingTimeHours = doublingTimeMin / 60;
  const growthRate = Math.log(2) / doublingTimeHours;

  // Logistic growth: N(t) = K / (1 + ((K - N0) / N0) * e^(-r*t))
  const K = maxCFU;
  const N0 = initialCFU;
  const denominator = 1 + ((K - N0) / N0) * Math.exp(-growthRate * activeTime);
  const cfu = K / denominator;

  return Math.round(Math.min(cfu, maxCFU));
}

/**
 * Generate a full growth curve with time points.
 */
export function generateGrowthCurve({
  initialCFU,
  doublingTimeMin,
  lagPhaseHours,
  stationaryPhaseStart,
  maxCFUperML,
  volumeML = 1000,
  totalHours = 48,
  boostFactor = 1.0,
  timePoints = null
}) {
  const points = timePoints || [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 30, 36, 42, 48].filter(
    (t) => t <= totalHours
  );

  return points.map((t) => ({
    hour: t,
    cfu: calculateCFUAtTime({
      initialCFU,
      doublingTimeMin,
      lagPhaseHours,
      stationaryPhaseStart,
      maxCFUperML,
      volumeML,
      timeHours: t,
      boostFactor
    })
  }));
}

/**
 * Calculate the combined boost factor from selected additives.
 */
export function calculateBoostFactor(additives, selectedAdditives) {
  if (!selectedAdditives || selectedAdditives.length === 0) return 1.0;

  let totalBoostPercent = 0;
  for (const additiveName of selectedAdditives) {
    const additive = additives.find((a) => a.name === additiveName);
    if (additive) {
      totalBoostPercent += additive.estimatedGrowthBoost;
    }
  }

  // Diminishing returns: each additive contributes less when combined
  const effectiveBoost = totalBoostPercent * 0.75;
  return 1 + effectiveBoost / 100;
}

/**
 * Calculate individual additive contributions.
 */
export function calculateAdditiveContributions(additives, selectedAdditives, baseCFU) {
  return selectedAdditives.map((name) => {
    const additive = additives.find((a) => a.name === name);
    if (!additive) return null;
    const boost = additive.estimatedGrowthBoost;
    const effectiveBoost = boost * 0.75;
    const additionalCFU = baseCFU * (effectiveBoost / 100);
    return {
      name,
      boostPercent: boost,
      effectiveBoostPercent: effectiveBoost,
      additionalCFU: Math.round(additionalCFU),
      mechanism: additive.mechanism,
      category: additive.category
    };
  }).filter(Boolean);
}

/**
 * Adjust fermentation parameters for starter culture mode.
 */
export function applyStarterMode(fermentationParams, starterMode) {
  const lagReduction = starterMode.lagPhaseReduction / 100;
  const timeReduction = starterMode.timeReduction / 100;

  return {
    ...fermentationParams,
    lagPhaseHours: fermentationParams.lagPhase * (1 - lagReduction),
    optimalDuration: Math.round(
      fermentationParams.optimalDuration * (1 - timeReduction)
    ),
    isStarterMode: true,
    starterNotes: starterMode.notes
  };
}

/**
 * Format large CFU numbers for display.
 */
export function formatCFU(cfu) {
  if (cfu >= 1e12) return `${(cfu / 1e12).toFixed(1)} trillion`;
  if (cfu >= 1e9) return `${(cfu / 1e9).toFixed(1)} billion`;
  if (cfu >= 1e6) return `${(cfu / 1e6).toFixed(1)} million`;
  if (cfu >= 1e3) return `${(cfu / 1e3).toFixed(1)} thousand`;
  return cfu.toString();
}

/**
 * Get compatibility label from status string.
 */
export function getCompatibilityInfo(status) {
  const map = {
    perfect: { label: "Perfect", emoji: "check", color: "#22c55e" },
    good: { label: "Good", emoji: "check", color: "#84cc16" },
    acceptable: { label: "Acceptable", emoji: "warning", color: "#f59e0b" },
    poor: { label: "Poor", emoji: "cross", color: "#ef4444" }
  };
  return map[status] || map.acceptable;
}
