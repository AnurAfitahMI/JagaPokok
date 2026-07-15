import {
  calculateReminderFrequencies,
  calculateNextDate,
  isReminderOverdue,
  getDaysUntilReminder,
} from '../../services/reminderCalculator';

describe('reminderCalculator', () => {
  describe('calculateReminderFrequencies', () => {
    test('calculates reminder frequencies for a low-water cactus', () => {
      const plant = {
        name: 'Cactus',
        waterNeeds: 'Low',
        repottingFrequency: 'Every 1-2 years',
      };

      expect(calculateReminderFrequencies(plant)).toEqual({
        watering: 12,
        fertilizing: 67,
        rotating: 30,
        repotting: 365,
      });
    });

    test('calculates reminder frequencies for a high-water fern', () => {
      const plant = {
        name: 'Boston Fern',
        waterNeeds: 'High',
        repottingFrequency: 'Every 2-3 years',
      };

      expect(calculateReminderFrequencies(plant)).toEqual({
        watering: 5,
        fertilizing: 23,
        rotating: 7,
        repotting: 730,
      });
    });

    test('uses default frequencies when plant information is missing', () => {
      expect(calculateReminderFrequencies({})).toEqual({
        watering: 7,
        fertilizing: 30,
        rotating: 14,
        repotting: 365,
      });
    });
  });

  describe('calculateNextDate', () => {
    test('adds the frequency and schedules the reminder at 9 AM', () => {
      const result = calculateNextDate('2024-01-01T00:00:00.000Z', 7);
      const nextDate = new Date(result);

      expect(nextDate.getDate()).toBe(8);
      expect(nextDate.getHours()).toBe(9);
      expect(nextDate.getMinutes()).toBe(0);
    });
  });

  describe('isReminderOverdue', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('returns true for a reminder in the past', () => {
      expect(
        isReminderOverdue({ nextDate: '2026-01-09T12:00:00.000Z' })
      ).toBe(true);
    });

    test('returns false for a reminder in the future', () => {
      expect(
        isReminderOverdue({ nextDate: '2026-01-11T12:00:00.000Z' })
      ).toBe(false);
    });

    test('returns false when nextDate is missing', () => {
      expect(isReminderOverdue({})).toBe(false);
    });
  });

  describe('getDaysUntilReminder', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-10T00:00:00.000Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('returns the number of days until the reminder', () => {
      expect(
        getDaysUntilReminder({ nextDate: '2026-01-13T00:00:00.000Z' })
      ).toBe(3);
    });

    test('returns null when nextDate is missing', () => {
      expect(getDaysUntilReminder({})).toBeNull();
    });
  });
});
