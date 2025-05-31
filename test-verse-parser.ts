// Test file for verse parser
import { extractVerseReferences } from './utils/verse-parser';

// Test cases
const tests = [
  "Can you explain the meaning of John 3:16?",
  "What does Romans 8:28 mean?",
  "In Matthew 5:3-12, what are the Beatitudes?",
  "Compare Genesis 1:1 with John 1:1",
  "Is Psalm 23 a good psalm for comfort?",
  "Jesus said in John 14:6 that he is the way, the truth, and the life."
];

// Run tests
console.log("Testing verse extraction...");
tests.forEach(test => {
  console.log(`\nInput: "${test}"`);
  const refs = extractVerseReferences(test);
  console.log(`References found: ${refs.length > 0 ? refs.join(', ') : 'None'}`);
});
