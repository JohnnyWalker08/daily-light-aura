/**
 * Curated scripture recommendations — maps a chapter to related passages
 * for deeper understanding. These are hand-picked, not AI-generated.
 */

interface Recommendation {
  reference: string;
  reason: string;
}

// A curated mapping from commonly-read chapters to related passages
const CHAPTER_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  // Genesis
  "Genesis_1": [
    { reference: "John 1", reason: "See Christ as the Word through whom all things were made" },
    { reference: "Psalm 19", reason: "The heavens declare the glory of the Creator" },
    { reference: "Colossians 1", reason: "Christ the image of the invisible God, firstborn of all creation" },
  ],
  "Genesis_3": [
    { reference: "Romans 5", reason: "How Adam's fall brought sin, and Christ's sacrifice brought redemption" },
    { reference: "Revelation 22", reason: "The tree of life restored in the new creation" },
  ],
  "Genesis_22": [
    { reference: "Hebrews 11", reason: "Abraham's faith — counted among the heroes of faith" },
    { reference: "John 3", reason: "God so loved the world He gave His only Son" },
  ],
  // Exodus
  "Exodus_14": [
    { reference: "Isaiah 43", reason: "When you pass through the waters, I will be with you" },
    { reference: "1 Corinthians 10", reason: "Israel's crossing as a foreshadow of baptism" },
  ],
  "Exodus_20": [
    { reference: "Matthew 5", reason: "Jesus deepens the Law — it's about the heart, not just actions" },
    { reference: "Romans 13", reason: "Love fulfills the law" },
  ],
  // Psalms
  "Psalms_23": [
    { reference: "John 10", reason: "Jesus declares Himself the Good Shepherd" },
    { reference: "Psalm 91", reason: "Another psalm of divine protection and trust" },
  ],
  "Psalms_51": [
    { reference: "2 Samuel 12", reason: "The story behind David's repentance" },
    { reference: "1 John 1", reason: "If we confess our sins, He is faithful to forgive" },
  ],
  "Psalms_119": [
    { reference: "Joshua 1", reason: "Meditate on the Word day and night for success" },
    { reference: "2 Timothy 3", reason: "All Scripture is God-breathed and useful" },
  ],
  // Proverbs
  "Proverbs_3": [
    { reference: "James 1", reason: "Ask God for wisdom — He gives generously" },
    { reference: "Matthew 6", reason: "Seek first the kingdom and trust God with provision" },
  ],
  // Isaiah
  "Isaiah_53": [
    { reference: "1 Peter 2", reason: "By His wounds you have been healed" },
    { reference: "Mark 15", reason: "The crucifixion account — Isaiah's prophecy fulfilled" },
  ],
  "Isaiah_40": [
    { reference: "Matthew 3", reason: "John the Baptist — the voice crying in the wilderness" },
    { reference: "Revelation 21", reason: "God will wipe away every tear" },
  ],
  // Matthew
  "Matthew_5": [
    { reference: "Luke 6", reason: "Luke's parallel account of the Sermon on the Plain" },
    { reference: "James 2", reason: "Faith without works is dead — living out the Beatitudes" },
  ],
  "Matthew_28": [
    { reference: "Acts 1", reason: "The Great Commission continues into Acts" },
    { reference: "1 Corinthians 15", reason: "The resurrection — the cornerstone of faith" },
  ],
  // John
  "John_1": [
    { reference: "Genesis 1", reason: "In the beginning — see how John echoes creation" },
    { reference: "Hebrews 1", reason: "God spoke through His Son, the radiance of His glory" },
  ],
  "John_3": [
    { reference: "Numbers 21", reason: "The bronze serpent — foreshadowing Jesus lifted up" },
    { reference: "Romans 8", reason: "No condemnation for those in Christ" },
  ],
  "John_14": [
    { reference: "John 16", reason: "The Holy Spirit — the Comforter — explained further" },
    { reference: "Philippians 4", reason: "The peace of God that surpasses understanding" },
  ],
  "John_15": [
    { reference: "Galatians 5", reason: "The fruit of the Spirit — abiding produces fruit" },
    { reference: "Colossians 3", reason: "Set your minds on things above — practical abiding" },
  ],
  // Acts
  "Acts_2": [
    { reference: "Joel 2", reason: "Peter quotes Joel — prophecy of the Spirit's outpouring" },
    { reference: "Ephesians 1", reason: "The Holy Spirit as a seal and guarantee" },
  ],
  // Romans
  "Romans_8": [
    { reference: "Psalm 139", reason: "God's intimate knowledge and inescapable love" },
    { reference: "Ephesians 2", reason: "By grace you have been saved — the foundation of Romans 8" },
  ],
  "Romans_12": [
    { reference: "1 Corinthians 12", reason: "One body, many members — using our gifts" },
    { reference: "Philippians 2", reason: "Have the mind of Christ — humility in action" },
  ],
  // 1 Corinthians
  "1 Corinthians_13": [
    { reference: "1 John 4", reason: "God is love — the source of the love described here" },
    { reference: "Colossians 3", reason: "Above all, put on love which binds everything together" },
  ],
  // Ephesians
  "Ephesians_6": [
    { reference: "2 Corinthians 10", reason: "Our weapons are not of this world" },
    { reference: "1 Peter 5", reason: "Be sober, be vigilant — the enemy prowls" },
  ],
  // Philippians
  "Philippians_4": [
    { reference: "Matthew 6", reason: "Do not be anxious — Jesus' own teaching on worry" },
    { reference: "Isaiah 26", reason: "Perfect peace for those whose mind is stayed on God" },
  ],
  // Hebrews
  "Hebrews_11": [
    { reference: "Genesis 15", reason: "Abraham believed God — the beginning of the faith story" },
    { reference: "Hebrews 12", reason: "Run the race with endurance, looking unto Jesus" },
  ],
  // James
  "James_1": [
    { reference: "Proverbs 2", reason: "The pursuit of wisdom — complementary teaching" },
    { reference: "Romans 5", reason: "Suffering produces perseverance" },
  ],
  // Revelation
  "Revelation_21": [
    { reference: "Isaiah 65", reason: "New heavens and new earth — the original prophecy" },
    { reference: "Genesis 2", reason: "Full circle — from Eden to the New Jerusalem" },
  ],
  "Revelation_22": [
    { reference: "Genesis 3", reason: "The curse reversed — the tree of life restored" },
    { reference: "John 14", reason: "Jesus promises to come again — fulfilled here" },
  ],
};

// Generic fallback recommendations by book category
const FALLBACK_BY_CATEGORY: Record<string, Recommendation[]> = {
  law: [
    { reference: "Romans 3", reason: "Understand how the law reveals our need for grace" },
    { reference: "Galatians 3", reason: "The law was our guardian until Christ came" },
  ],
  history: [
    { reference: "Hebrews 11", reason: "See how God's faithfulness runs through all history" },
    { reference: "Psalm 105", reason: "A poetic retelling of God's mighty deeds" },
  ],
  poetry: [
    { reference: "John 15", reason: "Abide in Christ — the heart of all godly wisdom" },
    { reference: "Romans 8", reason: "Nothing can separate us from God's love" },
  ],
  prophets: [
    { reference: "Revelation 21", reason: "See how prophecy culminates in God's eternal plan" },
    { reference: "Acts 2", reason: "Prophecy fulfilled in the coming of the Holy Spirit" },
  ],
  gospels: [
    { reference: "Isaiah 53", reason: "The prophecy that foretold Christ's suffering" },
    { reference: "Philippians 2", reason: "Christ humbled Himself — the heart of the Gospel" },
  ],
  epistles: [
    { reference: "John 15", reason: "Jesus' own words that the epistles unpack" },
    { reference: "Psalm 119", reason: "Delight in God's Word — the foundation of faith" },
  ],
};

const LAW_BOOKS = ["Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy"];
const HISTORY_BOOKS = ["Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther"];
const POETRY_BOOKS = ["Job", "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon"];
const PROPHET_BOOKS = ["Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi"];
const GOSPEL_BOOKS = ["Matthew", "Mark", "Luke", "John", "Acts"];

function getCategory(book: string): string {
  if (LAW_BOOKS.includes(book)) return "law";
  if (HISTORY_BOOKS.includes(book)) return "history";
  if (POETRY_BOOKS.includes(book)) return "poetry";
  if (PROPHET_BOOKS.includes(book)) return "prophets";
  if (GOSPEL_BOOKS.includes(book)) return "gospels";
  return "epistles";
}

export function getRecommendations(book: string, chapter: number): Recommendation[] {
  const key = `${book}_${chapter}`;
  if (CHAPTER_RECOMMENDATIONS[key]) {
    return CHAPTER_RECOMMENDATIONS[key];
  }
  const category = getCategory(book);
  return FALLBACK_BY_CATEGORY[category] || FALLBACK_BY_CATEGORY.epistles;
}
