import {
  calculateNextDate,
  calculateReminderFrequencies,
  createInitialReminders,
  getDaysUntilReminder,
  isReminderOverdue,
} from "../../services/reminderCalculator";

describe("reminderCalculator", () => {
  describe("calculateReminderFrequencies", () => {
    test("calculates reminder frequencies for a low-water cactus", () => {
      const plant = {
        name: "Cactus",
        waterNeeds: "Low",
        repottingFrequency: "Every 1-2 years",
      };

      expect(calculateReminderFrequencies(plant)).toEqual({
        watering: 12,
        fertilizing: 67,
        rotating: 30,
        repotting: 365,
      });
    });

    test("calculates reminder frequencies for a high-water fern", () => {
      const plant = {
        name: "Boston Fern",
        waterNeeds: "High",
        repottingFrequency: "Every 2-3 years",
      };

      expect(calculateReminderFrequencies(plant)).toEqual({
        watering: 5,
        fertilizing: 23,
        rotating: 7,
        repotting: 730,
      });
    });

    test("uses default frequencies when plant information is missing", () => {
      expect(calculateReminderFrequencies({})).toEqual({
        watering: 7,
        fertilizing: 30,
        rotating: 14,
        repotting: 365,
      });
    });

    test("uses the default repotting frequency for an unknown value", () => {
      const plant = {
        name: "Unknown Plant",
        waterNeeds: "Moderate",
        repottingFrequency: "When needed",
      };

      expect(calculateReminderFrequencies(plant).repotting).toBe(365);
    });
  });

  describe("calculateNextDate", () => {
    test("adds the frequency and schedules the reminder at 9 AM", () => {
      const result = calculateNextDate("2024-01-01T00:00:00.000Z", 7);
      const nextDate = new Date(result);

      expect(nextDate.getDate()).toBe(8);
      expect(nextDate.getHours()).toBe(9);
      expect(nextDate.getMinutes()).toBe(0);
    });
  });

  describe("createInitialReminders", () => {
    beforeEach(() => {
      jest.spyOn(Date, "now").mockReturnValue(1234567890);
      jest.spyOn(Math, "random").mockReturnValue(0.5);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("creates four enabled reminders for a cactus", () => {
      const plant = {
        name: "Cactus",
        waterNeeds: "Low",
        repottingFrequency: "Every 1-2 years",
      };
      const addedDate = "2026-01-01T00:00:00.000Z";

      const reminders = createInitialReminders(plant, addedDate);

      expect(reminders).toHaveLength(4);
      expect(reminders.map((reminder) => reminder.type)).toEqual([
        "watering",
        "fertilizing",
        "rotating",
        "repotting",
      ]);

      expect(reminders.every((reminder) => reminder.isEnabled)).toBe(true);
      expect(
        reminders.every((reminder) => reminder.lastCompleted === null),
      ).toBe(true);
    });

    test("creates exact frequencies, titles, icons, and IDs", () => {
      const plant = {
        name: "Cactus",
        waterNeeds: "Low",
        repottingFrequency: "Every 1-2 years",
      };

      const reminders = createInitialReminders(
        plant,
        "2026-01-01T00:00:00.000Z",
      );

      expect(reminders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "watering_1234567890_i",
            type: "watering",
            title: "Water me!",
            frequency: "every_12_days",
            frequencyDays: 12,
            priority: "medium",
            icon: "watering-can",
          }),
          expect.objectContaining({
            id: "fertilizing_1234567890_i",
            type: "fertilizing",
            title: "Feed me!",
            frequency: "every_67_days",
            frequencyDays: 67,
            priority: "medium",
            icon: "leaf",
          }),
          expect.objectContaining({
            id: "rotating_1234567890_i",
            type: "rotating",
            title: "Spin me!",
            frequency: "every_30_days",
            frequencyDays: 30,
            priority: "low",
            icon: "rotate-360",
          }),
          expect.objectContaining({
            id: "repotting_1234567890_i",
            type: "repotting",
            title: "My shoes are tight!",
            frequency: "every_365_days",
            frequencyDays: 365,
            priority: "low",
            icon: "shovel",
          }),
        ]),
      );
    });

    test("calculates each next reminder date from the added date", () => {
      const plant = {
        name: "Cactus",
        waterNeeds: "Low",
        repottingFrequency: "Every 1-2 years",
      };
      const addedDate = "2026-01-01T00:00:00.000Z";

      const reminders = createInitialReminders(plant, addedDate);

      expect(reminders[0].nextDate).toBe(calculateNextDate(addedDate, 12));
      expect(reminders[1].nextDate).toBe(calculateNextDate(addedDate, 67));
      expect(reminders[2].nextDate).toBe(calculateNextDate(addedDate, 30));
      expect(reminders[3].nextDate).toBe(calculateNextDate(addedDate, 365));
    });

    test("uses low-water and succulent care notes for a cactus", () => {
      const reminders = createInitialReminders(
        {
          name: "Cactus",
          waterNeeds: "Low",
        },
        "2026-01-01T00:00:00.000Z",
      );

      expect(reminders[0].notes).toBe(
        "Check soil is completely dry before watering. Water thoroughly until it drains out.",
      );
      expect(reminders[1].notes).toBe(
        "Use half-strength succulent fertilizer. Avoid fertilizing in rainy season.",
      );
    });

    test("uses high-water notes and high priority for a palm", () => {
      const reminders = createInitialReminders(
        {
          name: "Areca Palm",
          family: "Arecaceae",
          waterNeeds: "High",
        },
        "2026-01-01T00:00:00.000Z",
      );

      expect(reminders[0].frequencyDays).toBe(3);
      expect(reminders[0].priority).toBe("high");
      expect(reminders[0].notes).toBe(
        "Keep soil consistently moist. Check daily during hot weather.",
      );
    });

    test("uses flowering fertilizer notes for an orchid", () => {
      const reminders = createInitialReminders(
        {
          name: "Moth Orchid",
          waterNeeds: "Moderate",
        },
        "2026-01-01T00:00:00.000Z",
      );

      expect(reminders[1].notes).toBe(
        "Use blooming fertilizer. Best to fertilize in the morning.",
      );
    });

    test("uses standard care notes for a moderate-care plant", () => {
      const reminders = createInitialReminders(
        {
          name: "Unknown Plant",
          waterNeeds: "Moderate",
        },
        "2026-01-01T00:00:00.000Z",
      );

      expect(reminders[0].notes).toBe(
        "Water when top 2-3 cm of soil feels dry.",
      );
      expect(reminders[1].notes).toBe(
        "Use balanced houseplant fertilizer (NPK 20-20-20). Dilute to half strength.",
      );
    });
  });

  describe("isReminderOverdue", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-10T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("returns true for a reminder in the past", () => {
      expect(isReminderOverdue({ nextDate: "2026-01-09T12:00:00.000Z" })).toBe(
        true,
      );
    });

    test("returns false for a reminder in the future", () => {
      expect(isReminderOverdue({ nextDate: "2026-01-11T12:00:00.000Z" })).toBe(
        false,
      );
    });

    test("returns false when nextDate is missing", () => {
      expect(isReminderOverdue({})).toBe(false);
    });
  });

  describe("getDaysUntilReminder", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2026-01-10T00:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("returns the number of days until the reminder", () => {
      expect(
        getDaysUntilReminder({ nextDate: "2026-01-13T00:00:00.000Z" }),
      ).toBe(3);
    });

    test("returns null when nextDate is missing", () => {
      expect(getDaysUntilReminder({})).toBeNull();
    });
  });
});
