/**
 * 50 daily self-examination questions and reflection prompts
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
  // --- New reflections (22–50) ---
  {
    question: "Have I been slow to listen and quick to speak today?",
    scripture: "Wherefore, my beloved brethren, let every man be swift to hear, slow to speak, slow to wrath.",
    scriptureRef: "James 1:19",
    tip: "In your next conversation, focus entirely on listening before formulating your response.",
  },
  {
    question: "Am I bearing fruit that reflects genuine repentance?",
    scripture: "Bring forth therefore fruits meet for repentance.",
    scriptureRef: "Matthew 3:8",
    tip: "Repentance isn't just feeling sorry — it's a changed direction. What has actually changed?",
  },
  {
    question: "Is my faith producing works, or is it idle?",
    scripture: "Even so faith, if it hath not works, is dead, being alone.",
    scriptureRef: "James 2:17",
    tip: "Identify one way your belief in God translated into tangible action this week.",
  },
  {
    question: "Have I been a peacemaker or a troublemaker in my relationships?",
    scripture: "Blessed are the peacemakers: for they shall be called the children of God.",
    scriptureRef: "Matthew 5:9",
    tip: "If there's tension in a relationship, take the first step toward reconciliation today.",
  },
  {
    question: "Am I storing up treasures on earth or in heaven?",
    scripture: "Lay not up for yourselves treasures upon earth, where moth and rust doth corrupt.",
    scriptureRef: "Matthew 6:19",
    tip: "Consider: What did I invest in today that will matter in eternity?",
  },
  {
    question: "Do I truly believe God's promises, or do I only know them intellectually?",
    scripture: "For all the promises of God in him are yea, and in him Amen, unto the glory of God by us.",
    scriptureRef: "2 Corinthians 1:20",
    tip: "Pick one promise of God and declare it out loud over your situation today.",
  },
  {
    question: "Am I submitting to God's will, even when it's uncomfortable?",
    scripture: "Not my will, but thine, be done.",
    scriptureRef: "Luke 22:42",
    tip: "Surrender begins when obedience costs you something. What is God asking you to release?",
  },
  {
    question: "Have I shown hospitality or generosity to a stranger recently?",
    scripture: "Be not forgetful to entertain strangers: for thereby some have entertained angels unawares.",
    scriptureRef: "Hebrews 13:2",
    tip: "Generosity to strangers reveals the heart of Christ in you. Look for an opportunity this week.",
  },
  {
    question: "Am I walking by faith or by sight in my current season?",
    scripture: "For we walk by faith, not by sight.",
    scriptureRef: "2 Corinthians 5:7",
    tip: "Faith doesn't deny reality — it trusts the One who is above reality.",
  },
  {
    question: "Is there pride in my heart that I'm refusing to acknowledge?",
    scripture: "God resisteth the proud, but giveth grace unto the humble.",
    scriptureRef: "James 4:6",
    tip: "Humility is not thinking less of yourself — it's thinking of yourself less.",
  },
  {
    question: "Am I clothing myself with compassion and kindness daily?",
    scripture: "Put on therefore, as the elect of God, holy and beloved, bowels of mercies, kindness, humbleness of mind, meekness, longsuffering.",
    scriptureRef: "Colossians 3:12",
    tip: "Each morning, intentionally 'put on' one of these virtues as your focus for the day.",
  },
  {
    question: "Have I neglected the discipline of prayer this week?",
    scripture: "Pray without ceasing.",
    scriptureRef: "1 Thessalonians 5:17",
    tip: "Prayer is not an event — it's a posture. Talk to God throughout the day, not just at set times.",
  },
  {
    question: "Am I being faithful in my private devotion to God?",
    scripture: "But thou, when thou prayest, enter into thy closet, and when thou hast shut thy door, pray to thy Father which is in secret.",
    scriptureRef: "Matthew 6:6",
    tip: "Your public walk with God is only as strong as your private one. Guard your secret place.",
  },
  {
    question: "Do I harbour resentment toward someone God has told me to release?",
    scripture: "For if ye forgive men their trespasses, your heavenly Father will also forgive you.",
    scriptureRef: "Matthew 6:14",
    tip: "Forgiveness is a decision, not a feeling. Choose to forgive, and let God heal your emotions.",
  },
  {
    question: "Am I seeking approval from people more than from God?",
    scripture: "For do I now persuade men, or God? or do I seek to please men? for if I yet pleased men, I should not be the servant of Christ.",
    scriptureRef: "Galatians 1:10",
    tip: "Ask yourself: Would I still do this if no one ever noticed or applauded?",
  },
  {
    question: "Have I been a good witness in my workplace or school?",
    scripture: "Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.",
    scriptureRef: "Matthew 5:16",
    tip: "Excellence, integrity, and kindness at work are sermons that require no pulpit.",
  },
  {
    question: "Am I letting the peace of God rule in my heart?",
    scripture: "And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.",
    scriptureRef: "Colossians 3:15",
    tip: "When anxiety rises, pause and ask: Is God's peace ruling here, or is my flesh?",
  },
  {
    question: "Is my tongue under the control of the Holy Spirit?",
    scripture: "Death and life are in the power of the tongue: and they that love it shall eat the fruit thereof.",
    scriptureRef: "Proverbs 18:21",
    tip: "Your words create atmospheres. Speak life, hope, and truth into every room you enter.",
  },
  {
    question: "Am I pursuing holiness or just religiosity?",
    scripture: "Follow peace with all men, and holiness, without which no man shall see the Lord.",
    scriptureRef: "Hebrews 12:14",
    tip: "Holiness is not about rules — it's about relationship. Draw near to God and He draws near to you.",
  },
  {
    question: "Have I obeyed the prompting of the Holy Spirit today?",
    scripture: "For as many as are led by the Spirit of God, they are the sons of God.",
    scriptureRef: "Romans 8:14",
    tip: "The Spirit often speaks in a still, small voice. Quiet your heart long enough to hear it.",
  },
  {
    question: "Am I content with what God has provided, or am I constantly wanting more?",
    scripture: "But godliness with contentment is great gain.",
    scriptureRef: "1 Timothy 6:6",
    tip: "Contentment is not having everything you want — it's wanting everything you have.",
  },
  {
    question: "Do I meditate on God's Word day and night?",
    scripture: "But his delight is in the law of the LORD; and in his law doth he meditate day and night.",
    scriptureRef: "Psalm 1:2",
    tip: "Choose one verse each morning and carry it with you all day. Let it shape your thinking.",
  },
  {
    question: "Am I growing weary in doing good?",
    scripture: "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
    scriptureRef: "Galatians 6:9",
    tip: "The harvest comes after the planting. Keep sowing, even when you can't see the fruit yet.",
  },
  {
    question: "Have I loved my neighbour as myself today?",
    scripture: "Thou shalt love thy neighbour as thyself.",
    scriptureRef: "Mark 12:31",
    tip: "Love your neighbour practically: a meal, a kind word, a prayer — small acts carry eternal weight.",
  },
  {
    question: "Am I abiding in Christ, or trying to bear fruit on my own?",
    scripture: "Abide in me, and I in you. As the branch cannot bear fruit of itself, except it abide in the vine; no more can ye, except ye abide in me.",
    scriptureRef: "John 15:4",
    tip: "Fruitfulness flows from connection with Christ. Stay rooted in prayer, worship, and His Word.",
  },
  {
    question: "Is there any area of my life where I'm living a double standard?",
    scripture: "A double minded man is unstable in all his ways.",
    scriptureRef: "James 1:8",
    tip: "Integrity means your private life matches your public profession. Align every area with the Word.",
  },
  {
    question: "Am I guarding what I allow into my eyes and ears?",
    scripture: "I will set no wicked thing before mine eyes.",
    scriptureRef: "Psalm 101:3",
    tip: "What you repeatedly watch and listen to shapes your desires. Guard the gates of your soul.",
  },
  {
    question: "Have I thanked God for His faithfulness in past trials?",
    scripture: "It is of the LORD's mercies that we are not consumed, because his compassions fail not. They are new every morning.",
    scriptureRef: "Lamentations 3:22-23",
    tip: "Look back at a past trial God brought you through. Let that memory strengthen your faith for today.",
  },
  {
    question: "Am I preparing my heart for the return of Christ?",
    scripture: "Therefore be ye also ready: for in such an hour as ye think not the Son of man cometh.",
    scriptureRef: "Matthew 24:44",
    tip: "Live each day as if Jesus could return tonight. Let urgency fuel your obedience and love.",
  },
];

export function getDailyReflection(): DailyReflection {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return REFLECTIONS[dayOfYear % REFLECTIONS.length];
}
