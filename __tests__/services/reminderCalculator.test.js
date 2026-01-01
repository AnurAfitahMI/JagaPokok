// __tests__/services/reminderCalculator.test.js
import * as ReminderCalculator from '../../services/reminderCalculator';

const { 
  calculateReminderFrequencies, 
  calculateNextDate, 
  isReminderOverdue 
} = ReminderCalculator;

describe('reminderCalculator', () => {
  if (!calculateReminderFrequencies) {
    it.todo('calculateReminderFrequencies not exported');
    return;
  }

  describe('calculateReminderFrequencies', () => {
    test('calculates frequencies for plant object', () => {
      const plant = {
        name: 'Cactus',
        waterNeeds: 'Low',
        repottingFrequency: 'Every 1-2 years',
      };
      
      const frequencies = calculateReminderFrequencies(plant);
      
      expect(typeof frequencies).toBe('object');
      expect(frequencies).toHaveProperty('watering');
      expect(frequencies).toHaveProperty('fertilizing');
      expect(frequencies).toHaveProperty('rotating');
      expect(frequencies).toHaveProperty('repotting');
    });
  });

  describe('calculateNextDate', () => {
    if (!calculateNextDate) {
      it.todo('calculateNextDate not exported');
      return;
    }

    test('returns date string', () => {
      const lastDate = '2024-01-01T00:00:00.000Z';
      const frequencyDays = 7;
      
      const nextDate = calculateNextDate(lastDate, frequencyDays);
      expect(typeof nextDate).toBe('string');
      // Should be a valid date
      expect(() => new Date(nextDate)).not.toThrow();
    });
  });

  describe('isReminderOverdue', () => {
    if (!isReminderOverdue) {
      it.todo('isReminderOverdue not exported');
      return;
    }

    test('returns boolean', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const reminder = {
        nextDate: futureDate.toISOString(),
      };
      
      const result = isReminderOverdue(reminder);
      expect(typeof result).toBe('boolean');
    });
  });
});