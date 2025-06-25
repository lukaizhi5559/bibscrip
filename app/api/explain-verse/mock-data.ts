/**
 * Mock explanation data for common Bible verses
 * Used as fallback when the real API service is unavailable
 */

interface MockExplanation {
  theological: string;
  historical: string;
  application: string;
}

const mockExplanations: Record<string, MockExplanation> = {
  // Most common verses with prepared explanations
  'john3:16': {
    theological: `This verse expresses the core of Christian theology - God's sacrificial love. It states that God loved the world so deeply that He gave His only Son as a sacrifice, so that through faith in Him, people can have eternal life rather than face condemnation for their sins. This verse encapsulates the gospel message in a single statement.`,
    historical: `Written by the apostle John (around 85-95 AD), this verse appears during Jesus' conversation with Nicodemus, a Pharisee seeking understanding. In the first-century Jewish context, the concept of God's love extending to the entire world was revolutionary, as many believed salvation was exclusively for Israel. The term "whoever believes" opened salvation to all people.`,
    application: `This verse reminds us that God's love is unconditional and available to everyone. It challenges us to respond with faith and extend similar love to others. When facing difficult relationships, we can reflect on how God's sacrificial love should guide our actions. This verse offers comfort with the promise of eternal life, providing hope beyond our current challenges.`
  },
  'rom8:28': {
    theological: `This verse affirms God's sovereignty and providential care. It teaches that God actively works all circumstances—even difficult ones—for the ultimate good of those who love Him and are pursuing His purposes. This doesn't mean everything that happens is good, but that God can redeem and transform any situation for those who belong to Him.`,
    historical: `Written by Paul around 57 AD to the Roman church, this passage addressed believers experiencing persecution and hardship. Roman Christians faced societal rejection, economic disadvantages, and potential violence. Paul's assurance that God works all things for good provided hope and perspective during their trials.`,
    application: `In times of suffering or confusion, this verse reminds us that God is actively working behind the scenes. It doesn't ask us to deny pain but to trust in God's larger purpose. This perspective helps us maintain hope when circumstances seem hopeless, looking for ways God might be shaping our character or creating opportunities for ministry through difficult experiences.`
  },
  'psalm23:1': {
    theological: `This verse establishes the Lord as our shepherd, implying His guidance, protection, and provision. It teaches that God relates to us personally and cares for our needs. The "I shall not want" statement affirms God's sufficiency—when He is our shepherd, our deepest needs are met.`,
    historical: `Written by David, who had been a shepherd himself, this psalm likely dates to his time as king (around 1000 BC). In ancient Israel, the shepherd metaphor was significant as it was used to describe both kings and deities. David draws on his knowledge of shepherding to express his deep trust in God's care.`,
    application: `This verse invites us to accept our dependence on God and trust His provision. In our self-sufficient culture, acknowledging that we need a shepherd can be humbling but liberating. When facing anxiety about needs, this verse reminds us to turn to God as our provider and find contentment in His care rather than worldly abundance.`
  },
  'phil4:13': {
    theological: `This verse teaches about the empowerment that comes through Christ. Paul isn't claiming universal superhero abilities but is stating that Christ provides the strength needed for whatever circumstances God calls us to endure or accomplish. It's about spiritual enablement, not unlimited personal power.`,
    historical: `Paul wrote this from prison (around 62 AD) to the Philippian church. The context reveals he's specifically referring to contentment in all circumstances—whether in abundance or need, fullness or hunger. His "all things" refers primarily to enduring hardship rather than achieving spectacular feats.`,
    application: `This verse is often misapplied to athletic achievements or personal goals, but its true application is about finding strength to remain faithful in difficult situations. When facing trials, limitations, or seemingly impossible tasks within God's will, we can rely on Christ's strength rather than our own. This means praying for His empowerment and moving forward in obedient faith.`
  },
  'jer29:11': {
    theological: `This verse reveals God's character as one who plans for His people's welfare, not harm. It shows that even amid judgment (the Exile), God's ultimate intentions are redemptive. The verse speaks to God's sovereignty over history and His ability to bring hope and a future even through difficult circumstances.`,
    historical: `Jeremiah delivered this message around 597 BC to Jews exiled in Babylon. Contrary to false prophets promising a quick return to Jerusalem, Jeremiah advised settling in Babylon for the long term (70 years). This specific promise was made to the collective Jewish exiles, not as a personal promise to individuals.`,
    application: `While written specifically to ancient Israel in exile, this verse demonstrates a pattern of how God works. We should be careful not to claim it as a personal guarantee of earthly prosperity, but we can find comfort in knowing that God's character remains consistent—He still desires our ultimate welfare and works through our circumstances toward redemptive ends. This gives us courage during seasons of hardship.`
  }
};

/**
 * Get mock explanation for a given verse reference
 */
export function getMockExplanation(reference: string): MockExplanation {
  // Normalize the reference by removing spaces, making lowercase
  const normalizedRef = reference.toLowerCase().replace(/\\s+/g, '');
  
  // Try to find an exact match
  if (mockExplanations[normalizedRef]) {
    return mockExplanations[normalizedRef];
  }
  
  // Try to match by partial reference
  for (const key of Object.keys(mockExplanations)) {
    if (normalizedRef.includes(key)) {
      return mockExplanations[key];
    }
  }
  
  // Default explanation if nothing specific found
  return {
    theological: `This verse contributes to our understanding of God's character and His relationship with humanity. It's part of the larger biblical narrative that reveals God's redemptive plan throughout history.`,
    historical: `Understanding this passage requires considering its original audience, the cultural context of the time, and its place within the broader biblical book. The original hearers would have understood specific references and implications that may require explanation for modern readers.`,
    application: `Scripture is meant to transform our lives, not just inform our minds. This verse invites reflection on how its truth might shape our beliefs, attitudes, relationships, and actions in contemporary contexts.`
  };
}
