const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const BIBLE_DATA_PATH = path.join(__dirname, '../data/bible.json');
const BATCH_SIZE = 50;
const NAMESPACE = 'bible-verses';

/**
 * Loads Bible data from a JSON file
 * If you don't have a Bible JSON file, you'll need to create or acquire one
 */
async function loadBibleData() {
  // Check if Bible data file exists
  if (!fs.existsSync(BIBLE_DATA_PATH)) {
    console.error(`Bible data file not found at ${BIBLE_DATA_PATH}`);
    console.log('You need to create or download a Bible JSON file with this structure:');
    console.log(`
    {
      "verses": [
        {
          "reference": "Genesis 1:1",
          "text": "In the beginning God created the heaven and the earth.",
          "translation": "KJV",
          "book": "Genesis",
          "chapter": 1,
          "verse": 1
        },
        ...
      ]
    }
    `);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(BIBLE_DATA_PATH, 'utf8'));
    return data.verses;
  } catch (error) {
    console.error('Failed to parse Bible data:', error);
    return null;
  }
}

/**
 * Sends a batch of verses to the vector database API
 */
async function sendBatch(batch) {
  try {
    const response = await axios.post(`${API_URL}/vector/batch`, {
      documents: batch,
      namespace: NAMESPACE
    });
    
    return response.data.data.ids;
  } catch (error) {
    console.error('Failed to store batch:', error?.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function to populate the vector database
 */
async function populateVectorDatabase() {
  console.log('Starting Bible vector database population script...');
  
  // Check API status
  try {
    await axios.get(`${API_URL}/vector/status`);
    console.log('Vector database API is online');
  } catch (error) {
    console.error('Vector database API is not available. Please make sure your backend is running.');
    process.exit(1);
  }
  
  // Load Bible data
  const verses = await loadBibleData();
  if (!verses || verses.length === 0) {
    console.error('No verses loaded. Cannot populate database.');
    process.exit(1);
  }
  
  console.log(`Loaded ${verses.length} verses. Starting vector database population...`);
  
  // Process in batches
  const totalBatches = Math.ceil(verses.length / BATCH_SIZE);
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const batchVerses = verses.slice(i, i + BATCH_SIZE).map(verse => ({
      text: verse.text,
      metadata: {
        reference: verse.reference,
        translation: verse.translation || 'Unknown',
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse
      }
    }));
    
    try {
      const ids = await sendBatch(batchVerses);
      successCount += ids.length;
      console.log(`✓ Processed batch ${batchNumber}/${totalBatches} (${ids.length} verses)`);
    } catch (error) {
      failCount += batchVerses.length;
      console.error(`✗ Failed batch ${batchNumber}/${totalBatches}`);
      
      // Optional: Retry logic could be added here
    }
    
    // Optional: Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\nVector database population complete!');
  console.log(`Successfully added: ${successCount} verses`);
  if (failCount > 0) {
    console.log(`Failed to add: ${failCount} verses`);
  }
}

// Execute the population function
populateVectorDatabase().catch(error => {
  console.error('Fatal error during population:', error);
  process.exit(1);
});
