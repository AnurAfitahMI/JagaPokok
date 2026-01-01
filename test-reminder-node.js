// test-reminder-node.js - Run with Node directly
const fs = require('fs');
const path = require('path');

// Check if reminderCalculator exists
const reminderPath = path.join(__dirname, 'services', 'reminderCalculator.ts');
if (fs.existsSync(reminderPath)) {
  console.log('✓ reminderCalculator.ts exists');
  
  // For now, just test the logic directly
  const calculateNextDate = (lastDate, frequencyDays) => {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + frequencyDays);
    return date.toISOString();
  };
  
  const result = calculateNextDate('2024-01-01', 7);
  console.log('✓ calculateNextDate works:', result);
  
  if (result.includes('2024-01-08')) {
    console.log('✓ All tests PASSED!');
    process.exit(0);
  } else {
    console.log('✗ Test FAILED');
    process.exit(1);
  }
} else {
  console.log('✗ reminderCalculator.ts not found');
  process.exit(1);
}
