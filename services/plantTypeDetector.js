// Helper to infer plant type from available data
export const detectPlantType = (plantData) => {
  const { waterNeeds, family, name, scientificName } = plantData;
  
  // Convert to lowercase for comparison
  const water = (waterNeeds || '').toLowerCase();
  const plantName = (name || '').toLowerCase();
  const sciName = (scientificName || '').toLowerCase();
  const plantFamily = (family || '').toLowerCase();
  
  // Check for specific plant names first
  if (plantName.includes('cactus') || plantFamily.includes('cactaceae')) {
    return 'succulent';
  }
  
  if (plantName.includes('succulent') || plantFamily.includes('crassulaceae')) {
    return 'succulent';
  }
  
  if (plantName.includes('aloe') || sciName.includes('aloe')) {
    return 'succulent';
  }
  
  if (plantName.includes('fern') || plantFamily.includes('nephrolepidaceae')) {
    return 'fern';
  }
  
  if (plantName.includes('palm') || plantFamily.includes('arecaceae')) {
    return 'palm';
  }
  
  if (plantName.includes('lily') || plantFamily.includes('liliaceae')) {
    return 'flowering';
  }
  
  if (plantName.includes('orchid') || plantFamily.includes('orchidaceae')) {
    return 'flowering';
  }
  
  if (plantFamily.includes('araceae')) {
    return 'tropical';
  }
  
  // Check by water needs
  if (water.includes('very low') || water.includes('low')) {
    return 'drought_tolerant';
  }
  
  if (water.includes('high')) {
    return 'high_humidity';
  }
  
  // Default
  return 'moderate_care';
};

// Additional helper for Malaysia-specific adjustments
export const getMalaysiaAdjustment = (plantType) => {
  // Malaysia is tropical - adjust frequencies
  const adjustments = {
    'succulent': { water: -2, fertilize: 7 }, // Reduce watering slightly
    'drought_tolerant': { water: -2, fertilize: 7 },
    'moderate_care': { water: 0, fertilize: 0 },
    'high_humidity': { water: 1, fertilize: -3 }, // More water, less fertilizer
    'fern': { water: 2, fertilize: -5 },
    'palm': { water: 0, fertilize: 0 },
    'flowering': { water: 1, fertilize: -7 },
    'tropical': { water: 1, fertilize: -5 },
  };
  
  return adjustments[plantType] || { water: 0, fertilize: 0 };
};