/**
 * Daily self-examination questions and reflection prompts
 * Grounded in Scripture — no generic motivational content
 */

export interface DailyReflection {
  question: string;
  scripture: string;
  scriptureRef: string;
  tip: string;
}

const REFLECTIONS: DailyReflection[] = [
  {
    question: "Have I spoken any words today that tore down rather than built up?",
    scripture: "Let no corrupt communication proceed out of your mouth, but that which is good to the use of edifying.",
    scriptureRef: "Ephesians 4:29",
    tip: "Before speaking, ask: Is this true? Is it kind? Is it necessary?",
  },
  {
    question: "Did I prioritize God's presence over the busyness of my day?",
    scripture: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.",
    scriptureRef: "Matthew 6:33",
    tip: "Set aside the first 10 minutes of your day for prayer before checking your phone.",
  },
  {
    question: "Is there anyone I need to forgive or seek reconciliation with?",
    scripture: "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
    scriptureRef: "Ephesians 4:32",
    tip: "Unforgiveness poisons the one who holds it. Release it to God tonight.",
  },
  {
    question: "Am I being a faithful steward of what God has entrusted to me?",
    scripture: "Moreover it is required in stewards, that a man be found faithful.",
    scriptureRef: "1 Corinthians 4:2",
    tip: "Faithfulness in small things is the training ground for greater responsibilities.",
  },
  {
    question: "Did I show love to someone who didn't deserve it today?",
    scripture: "But God commendeth his love toward us, in that, while we were yet sinners, Christ died for us.",
    scriptureRef: "Romans 5:8",
    tip: "Grace is giving what is not deserved. Look for one person to show grace to tomorrow.",
  },
  {
    question: "Have I allowed fear or anxiety to control my decisions?",
    scripture: "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
    scriptureRef: "2 Timothy 1:7",
    tip: "Name your fear out loud, then replace it with the specific promise of God that addresses it.",
  },
  {
    question: "Am I walking in integrity when no one is watching?",
    scripture: "The integrity of the upright shall guide them: but the perverseness of transgressors shall destroy them.",
    scriptureRef: "Proverbs 11:3",
    tip: "Character is who you are in the dark. Let God's light search your hidden places.",
  },
  {
    question: "Did I use my time wisely today, or did I waste it on things that don't matter?",
    scripture: "Redeeming the time, because the days are evil.",
    scriptureRef: "Ephesians 5:16",
    tip: "Track how you spent the last 3 hours. Ask: Did any of it advance God's kingdom?",
  },
  {
    question: "Have I been grateful today, or did I focus on what I lack?",
    scripture: "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
    scriptureRef: "1 Thessalonians 5:18",
    tip: "Write down 3 specific things you're thankful for before you sleep.",
  },
  {
    question: "Am I guarding my heart from envy or comparison?",
    scripture: "A sound heart is the life of the flesh: but envy the rottenness of the bones.",
    scriptureRef: "Proverbs 14:30",
    tip: "When you feel envious, pray a blessing over that person instead.",
  },
  {
    question: "Did I encourage someone today with my words or actions?",
    scripture: "Wherefore comfort yourselves together, and edify one another, even as also ye do.",
    scriptureRef: "1 Thessalonians 5:11",
    tip: "Send one message of encouragement to someone before the day ends.",
  },
  {
    question: "Am I holding onto any bitterness that is poisoning my peace?",
    scripture: "Looking diligently lest any man fail of the grace of God; lest any root of bitterness springing up trouble you.",
    scriptureRef: "Hebrews 12:15",
    tip: "Bitterness grows when watered. Starve it by choosing to bless those who hurt you.",
  },
  {
    question: "Have I been patient with others today, or was I quick to anger?",
    scripture: "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.",
    scriptureRef: "Proverbs 16:32",
    tip: "When anger rises, take 3 deep breaths and ask the Holy Spirit for self-control.",
  },
  {
    question: "Is there a sin I keep returning to that I need to surrender completely?",
    scripture: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
    scriptureRef: "1 John 1:9",
    tip: "Confess to God specifically — not vaguely. Specificity breaks the power of hidden sin.",
  },
  {
    question: "Am I living as salt and light in my environment?",
    scripture: "Ye are the light of the world. A city that is set on a hill cannot be hid.",
    scriptureRef: "Matthew 5:14",
    tip: "Ask: Can people around me tell I follow Jesus by how I live, not just what I say?",
  },
  {
    question: "Did I put others' needs before my own today?",
    scripture: "Look not every man on his own things, but every man also on the things of others.",
    scriptureRef: "Philippians 2:4",
    tip: "Choose one act of service tomorrow that costs you something — time, comfort, or convenience.",
  },
  {
    question: "Am I trusting God with what I cannot control?",
    scripture: "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
    scriptureRef: "Proverbs 3:5",
    tip: "Write down what's worrying you, then physically set the paper aside as a symbol of surrender.",
  },
  {
    question: "Have I been feeding my spirit or my flesh more this week?",
    scripture: "For he that soweth to his flesh shall of the flesh reap corruption; but he that soweth to the Spirit shall of the Spirit reap life everlasting.",
    scriptureRef: "Galatians 6:8",
    tip: "Review your screen time vs. prayer time this week. Adjust accordingly.",
  },
  {
    question: "Am I running from God in any area of my life?",
    scripture: "Whither shall I go from thy spirit? Or whither shall I flee from thy presence?",
    scriptureRef: "Psalm 139:7",
    tip: "God isn't chasing you to punish you — He's pursuing you because He loves you.",
  },
  {
    question: "Do I love God with all my heart, soul, mind, and strength?",
    scripture: "And thou shalt love the Lord thy God with all thy heart, and with all thy soul, and with all thy mind, and with all thy strength.",
    scriptureRef: "Mark 12:30",
    tip: "Love for God is demonstrated not by feelings alone but by obedience and devotion.",
  },
  {
    question: "Am I being transformed by the renewal of my mind, or conformed to the world?",
    scripture: "And be not conformed to this world: but be ye transformed by the renewing of your mind.",
    scriptureRef: "Romans 12:2",
    tip: "What you consume shapes who you become. Choose inputs that align with God's Word.",
  },
];

export function getDailyReflection(): DailyReflection {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return REFLECTIONS[dayOfYear % REFLECTIONS.length];
}
