const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const OUTPUT_FILE = path.join(__dirname, '../data/bible.json');
const API_KEY = process.env.BIBLE_API_KEY || '';  // You'll need to set this environment variable

async function fetchBibleData() {
  console.log('Starting Bible data fetch...');
  
  try {
    // Check if we have an API key
    if (!API_KEY) {
      console.log('No API key found. Creating sample data instead...');
      return createSampleData();
    }
    
    // This is an example using the ESV API - replace with your preferred Bible API
    // You'll need to sign up for an API key at https://api.esv.org/
    const response = await axios.get('https://api.esv.org/v3/passage/text/', {
      params: {
        q: 'Genesis-Revelation',  // The entire Bible
        'include-passage-references': true,
        'include-verse-numbers': true,
        'include-footnotes': false,
        'include-headings': false,
      },
      headers: {
        'Authorization': `Token ${API_KEY}`
      }
    });
    
    // Process the response into our desired format
    const verses = [];
    
    // Logic to parse API response and convert to our format would go here
    // This is highly dependent on which API you use
    
    // For demonstration purposes, we'll create some sample data
    return createSampleData();
  } catch (error) {
    console.error('Error fetching Bible data:', error);
    console.log('Creating sample data instead...');
    return createSampleData();
  }
}

function createSampleData() {
  // Create a structured object with some key verses
  const verses = [
    // Genesis verses
    {
      reference: "Genesis 1:1",
      text: "In the beginning God created the heaven and the earth.",
      translation: "KJV",
      book: "Genesis",
      chapter: 1,
      verse: 1
    },
    {
      reference: "Genesis 1:27",
      text: "So God created mankind in his own image, in the image of God he created them; male and female he created them.",
      translation: "NIV",
      book: "Genesis",
      chapter: 1,
      verse: 27
    },
    // Psalms verses
    {
      reference: "Psalm 23:1",
      text: "The LORD is my shepherd, I lack nothing.",
      translation: "NIV", 
      book: "Psalms",
      chapter: 23,
      verse: 1
    },
    {
      reference: "Psalm 119:105",
      text: "Your word is a lamp for my feet, a light on my path.",
      translation: "NIV",
      book: "Psalms",
      chapter: 119,
      verse: 105
    },
    // New Testament verses
    {
      reference: "John 3:16",
      text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
      translation: "NIV",
      book: "John",
      chapter: 3,
      verse: 16
    },
    {
      reference: "Romans 8:28",
      text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
      translation: "NIV",
      book: "Romans",
      chapter: 8,
      verse: 28
    },
    {
      reference: "Philippians 4:13",
      text: "I can do all this through him who gives me strength.",
      translation: "NIV",
      book: "Philippians",
      chapter: 4,
      verse: 13
    },
    {
      reference: "1 John 4:8",
      text: "Whoever does not love does not know God, because God is love.",
      translation: "NIV",
      book: "1 John",
      chapter: 4,
      verse: 8
    },
    {
      reference: "1 Corinthians 13:4",
      text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.",
      translation: "NIV",
      book: "1 Corinthians",
      chapter: 13,
      verse: 4
    },
    {
      reference: "Revelation 21:4",
      text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away.",
      translation: "NIV",
      book: "Revelation", 
      chapter: 21,
      verse: 4
    }
  ];

  // Add a note in the console
  console.log(`Created sample data with ${verses.length} verses`);
  
  // Write to file
  const data = { verses };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  
  console.log(`Sample Bible data written to ${OUTPUT_FILE}`);
  return data;
}

// Execute the function
fetchBibleData().then(() => console.log('Bible data fetch completed!'));
