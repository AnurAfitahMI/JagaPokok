import { detectPlantType, getMalaysiaAdjustment } from './plantTypeDetector';

// MALAYSIA-SPECIFIC FREQUENCIES
export const calculateReminderFrequencies = (plantData) => {
  const waterNeeds = (plantData.waterNeeds || '').toLowerCase();
  const repottingFreq = plantData.repottingFrequency || 'Every 1-2 years';
  const plantType = detectPlantType(plantData);
  const malaysiaAdjustment = getMalaysiaAdjustment(plantType);
  
  // Base watering frequencies (days)
  const getWateringDays = () => {
    if (waterNeeds.includes('very low')) return 21;
    if (waterNeeds.includes('low')) return 14;
    if (waterNeeds.includes('moderate')) return 7;
    if (waterNeeds.includes('high')) return 3;
    return 7; // Default
  };
  
  // Base fertilizing frequencies (days)
  const getFertilizingDays = () => {
    const baseFrequencies = {
      'succulent': 60,
      'drought_tolerant': 45,
      'moderate_care': 30,
      'high_humidity': 21,
      'fern': 28,
      'palm': 35,
      'flowering': 21,
      'tropical': 25,
    };
    return baseFrequencies[plantType] || 30;
  };
  
  // Base rotating frequencies (days)
  const getRotatingDays = () => {
    const baseFrequencies = {
      'succulent': 30,
      'drought_tolerant': 30,
      'moderate_care': 14,
      'high_humidity': 7,
      'fern': 7,
      'palm': 14,
      'flowering': 7,
      'tropical': 7,
    };
    return baseFrequencies[plantType] || 14;
  };
  
  // Convert repotting frequency to days
  const getRepottingDays = () => {
    const repottingMap = {
      'every 6-12 months': 180,
      'every 1-2 years': 365,
      'every 2-3 years': 730,
      'every 3-5 years': 1095,
    };
    
    const key = repottingFreq.toLowerCase();
    for (const [mapKey, days] of Object.entries(repottingMap)) {
      if (key.includes(mapKey)) {
        return days;
      }
    }
    return 365; // Default 1 year
  };
  
  // Calculate with Malaysia adjustments
  let wateringDays = getWateringDays() + malaysiaAdjustment.water;
  let fertilizingDays = getFertilizingDays() + malaysiaAdjustment.fertilize;
  
  // Ensure minimum values
  wateringDays = Math.max(2, wateringDays); // At least 2 days
  fertilizingDays = Math.max(14, fertilizingDays); // At least 2 weeks
  
  return {
    watering: wateringDays,
    fertilizing: fertilizingDays,
    rotating: getRotatingDays(),
    repotting: getRepottingDays(),
  };
};

// Calculate next date based on frequency
export const calculateNextDate = (lastDate, frequencyDays) => {
  const last = new Date(lastDate);
  const next = new Date(last);
  next.setDate(next.getDate() + frequencyDays);
  
  // Set to 9 AM Malaysia time
  next.setHours(9, 0, 0, 0);
  
  return next.toISOString();
};

// Create initial reminders for a new plant
export const createInitialReminders = (plantData, addedDate = new Date().toISOString()) => {
  const frequencies = calculateReminderFrequencies(plantData);
  
  const getWateringNotes = () => {
    const waterNeeds = (plantData.waterNeeds || '').toLowerCase();
    if (waterNeeds.includes('low')) return 'Check soil is completely dry before watering. Water thoroughly until it drains out.';
    if (waterNeeds.includes('high')) return 'Keep soil consistently moist. Check daily during hot weather.';
    return 'Water when top 2-3 cm of soil feels dry.';
  };
  
  const getFertilizingNotes = () => {
    const plantType = detectPlantType(plantData);
    if (plantType === 'succulent') return 'Use half-strength succulent fertilizer. Avoid fertilizing in rainy season.';
    if (plantType === 'flowering') return 'Use blooming fertilizer. Best to fertilize in the morning.';
    return 'Use balanced houseplant fertilizer (NPK 20-20-20). Dilute to half strength.';
  };
  
  const reminders = [
    {
      id: `watering_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'watering',
      title: `Water me!`,
      frequency: `every_${frequencies.watering}_days`,
      frequencyDays: frequencies.watering,
      lastCompleted: null,
      nextDate: calculateNextDate(addedDate, frequencies.watering),
      isEnabled: true,
      priority: frequencies.watering <= 3 ? 'high' : 'medium',
      notes: getWateringNotes(),
      icon: 'watering-can',
    },
    {
      id: `fertilizing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'fertilizing',
      title: `Feed me!`,
      frequency: `every_${frequencies.fertilizing}_days`,
      frequencyDays: frequencies.fertilizing,
      lastCompleted: null,
      nextDate: calculateNextDate(addedDate, frequencies.fertilizing),
      isEnabled: true,
      priority: 'medium',
      notes: getFertilizingNotes(),
      icon: 'leaf',
    },
    {
      id: `rotating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'rotating',
      title: `Spin me!`,
      frequency: `every_${frequencies.rotating}_days`,
      frequencyDays: frequencies.rotating,
      lastCompleted: null,
      nextDate: calculateNextDate(addedDate, frequencies.rotating),
      isEnabled: true,
      priority: 'low',
      notes: 'Rotate 90° for even growth. Prevents leaning toward light.',
      icon: 'rotate-360',
    },
    {
      id: `repotting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'repotting',
      title: `My shoes are tight!`,
      frequency: `every_${frequencies.repotting}_days`,
      frequencyDays: frequencies.repotting,
      lastCompleted: null,
      nextDate: calculateNextDate(addedDate, frequencies.repotting),
      isEnabled: true,
      priority: 'low',
      notes: 'Check for: roots growing out of drainage holes, slowed growth, or soil drying too quickly.',
      icon: 'shovel',
    },
  ];
  
  return reminders;
};

// Helper to check if reminder is overdue
export const isReminderOverdue = (reminder) => {
  if (!reminder.nextDate) return false;
  const nextDate = new Date(reminder.nextDate);
  const now = new Date();
  return nextDate < now;
};

// Helper to get days until reminder
export const getDaysUntilReminder = (reminder) => {
  if (!reminder.nextDate) return null;
  const nextDate = new Date(reminder.nextDate);
  const now = new Date();
  const diffTime = nextDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};