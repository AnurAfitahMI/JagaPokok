// __tests__/services/plantTypeDetector.test.js
import {
  detectPlantType,
  getMalaysiaAdjustment,
} from '../../services/plantTypeDetector';

describe('plantTypeDetector', () => {
  describe('detectPlantType', () => {
    test('detects cactus by name as succulent', () => {
      const plant = { name: 'Cactus' };

      expect(detectPlantType(plant)).toBe('succulent');
    });

    test('detects cactus by family as succulent', () => {
      const plant = {
        name: 'Desert Plant',
        family: 'Cactaceae',
      };

      expect(detectPlantType(plant)).toBe('succulent');
    });

    test('detects aloe by name as succulent', () => {
      const plant = { name: 'Aloe Vera' };

      expect(detectPlantType(plant)).toBe('succulent');
    });

    test('detects aloe by scientific name as succulent', () => {
      const plant = {
        name: 'Medicinal Plant',
        scientificName: 'Aloe barbadensis miller',
      };

      expect(detectPlantType(plant)).toBe('succulent');
    });

    test('detects fern by name', () => {
      const plant = { name: 'Boston Fern' };

      expect(detectPlantType(plant)).toBe('fern');
    });

    test('detects palm by family', () => {
      const plant = {
        name: 'Areca Plant',
        family: 'Arecaceae',
      };

      expect(detectPlantType(plant)).toBe('palm');
    });

    test('detects orchid as flowering', () => {
      const plant = { name: 'Moth Orchid' };

      expect(detectPlantType(plant)).toBe('flowering');
    });

    test('detects lily as flowering', () => {
      const plant = { name: 'Peace Lily' };

      expect(detectPlantType(plant)).toBe('flowering');
    });

    test('detects Araceae family as tropical', () => {
      const plant = {
        name: 'Monstera',
        family: 'Araceae',
      };

      expect(detectPlantType(plant)).toBe('tropical');
    });

    test('detects low-water unknown plant as drought tolerant', () => {
      const plant = {
        name: 'Unknown Plant',
        waterNeeds: 'Low',
      };

      expect(detectPlantType(plant)).toBe('drought_tolerant');
    });

    test('detects very-low-water unknown plant as drought tolerant', () => {
      const plant = {
        name: 'Unknown Plant',
        waterNeeds: 'Very Low',
      };

      expect(detectPlantType(plant)).toBe('drought_tolerant');
    });

    test('detects high-water unknown plant as high humidity', () => {
      const plant = {
        name: 'Unknown Plant',
        waterNeeds: 'High',
      };

      expect(detectPlantType(plant)).toBe('high_humidity');
    });

    test('returns moderate care when no known classification matches', () => {
      const plant = {
        name: 'Unknown Plant',
        waterNeeds: 'Moderate',
      };

      expect(detectPlantType(plant)).toBe('moderate_care');
    });

    test('handles missing plant properties', () => {
      expect(detectPlantType({})).toBe('moderate_care');
    });

    test('matches plant information without case sensitivity', () => {
      const plant = {
        name: 'BOSTON FERN',
        waterNeeds: 'HIGH',
      };

      expect(detectPlantType(plant)).toBe('fern');
    });
  });

  describe('getMalaysiaAdjustment', () => {
    test.each([
      ['succulent', { water: -2, fertilize: 7 }],
      ['drought_tolerant', { water: -2, fertilize: 7 }],
      ['moderate_care', { water: 0, fertilize: 0 }],
      ['high_humidity', { water: 1, fertilize: -3 }],
      ['fern', { water: 2, fertilize: -5 }],
      ['palm', { water: 0, fertilize: 0 }],
      ['flowering', { water: 1, fertilize: -7 }],
      ['tropical', { water: 1, fertilize: -5 }],
    ])(
      'returns the correct Malaysia adjustment for %s',
      (plantType, expectedAdjustment) => {
        expect(getMalaysiaAdjustment(plantType)).toEqual(
          expectedAdjustment
        );
      }
    );

    test('returns zero adjustments for an unknown plant type', () => {
      expect(getMalaysiaAdjustment('unknown_type')).toEqual({
        water: 0,
        fertilize: 0,
      });
    });
  });
});
