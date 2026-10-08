'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { audioEngine } from '@/lib/audioEngine';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Check,
  Flame,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Shuffle,
  RefreshCw,
  Trash2,
  Send,
  Star,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// SCRABBLE LETTER POINT VALUES
const SCRABBLE_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5,
  L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4,
  W: 4, X: 8, Y: 4, Z: 10,
};

// COMPREHENSIVE BIBLICAL LEXICON WITH SCRIPTURE REFERENCES
export interface BibleLexiconEntry {
  word: string;
  category: string;
  definition: string;
  verse: string;
  reference: string;
}

export const SCRIPTURE_LEXICON: Record<string, BibleLexiconEntry> = {
  FAITH: {
    word: 'FAITH',
    category: 'Virtue',
    definition: 'Complete trust and confidence in God’s promises.',
    verse: '“Now faith is confidence in what we hope for and assurance about what we do not see.”',
    reference: 'Hebrews 11:1',
  },
  GRACE: {
    word: 'GRACE',
    category: 'Gift of God',
    definition: 'Unmerited divine favor and redemption.',
    verse: '“For by grace you have been saved through faith; and this is not your own doing; it is the gift of God.”',
    reference: 'Ephesians 2:8',
  },
  MOSES: {
    word: 'MOSES',
    category: 'Prophet & Deliverer',
    definition: 'Led Israel out of Egypt and received the Law on Mount Sinai.',
    verse: '“The Lord spoke to Moses face to face, as a man speaks to his friend.”',
    reference: 'Exodus 33:11',
  },
  DAVID: {
    word: 'DAVID',
    category: 'King & Psalmist',
    definition: 'The shepherd king of Israel, a man after God’s own heart.',
    verse: '“I have found David son of Jesse, a man after my own heart.”',
    reference: 'Acts 13:22',
  },
  NOAH: {
    word: 'NOAH',
    category: 'Patriarch',
    definition: 'Built the Ark in obedience to God during the great flood.',
    verse: '“Noah was a righteous man, blameless in his generation; Noah walked with God.”',
    reference: 'Genesis 6:9',
  },
  JESUS: {
    word: 'JESUS',
    category: 'Messiah & Lord',
    definition: 'The Son of God, Savior, and Redeemer of the world.',
    verse: '“She will bear a son, and you shall call his name Jesus, for he will save his people from their sins.”',
    reference: 'Matthew 1:21',
  },
  MARY: {
    word: 'MARY',
    category: 'Mother of Jesus',
    definition: 'Favored of the Lord, mother of Jesus Christ.',
    verse: '“Blessed are you among women, and blessed is the fruit of your womb!”',
    reference: 'Luke 1:42',
  },
  PAUL: {
    word: 'PAUL',
    category: 'Apostle',
    definition: 'Apostle to the Gentiles who authored foundational epistles.',
    verse: '“For to me to live is Christ, and to die is gain.”',
    reference: 'Philippians 1:21',
  },
  PETER: {
    word: 'PETER',
    category: 'Apostle',
    definition: 'Leader among the disciples, known for bold confession of faith.',
    verse: '“You are the Christ, the Son of the living God.”',
    reference: 'Matthew 16:16',
  },
  JOHN: {
    word: 'JOHN',
    category: 'Apostle & Gospel Writer',
    definition: 'The beloved disciple who penned the Gospel and Revelation.',
    verse: '“In the beginning was the Word, and the Word was with God, and the Word was God.”',
    reference: 'John 1:1',
  },
  LUKE: {
    word: 'LUKE',
    category: 'Evangelist',
    definition: 'Physician, companion of Paul, and author of Luke and Acts.',
    verse: '“Luke the beloved physician greets you.”',
    reference: 'Colossians 4:14',
  },
  MARK: {
    word: 'MARK',
    category: 'Evangelist',
    definition: 'Companion of Peter and Barnabas, author of the second Gospel.',
    verse: '“Get Mark and bring him with you, for he is very useful to me for ministry.”',
    reference: '2 Timothy 4:11',
  },
  ACTS: {
    word: 'ACTS',
    category: 'Book of Scripture',
    definition: 'The historical account of the Holy Spirit and early church.',
    verse: '“You will receive power when the Holy Spirit comes upon you.”',
    reference: 'Acts 1:8',
  },
  EDEN: {
    word: 'EDEN',
    category: 'Sacred Location',
    definition: 'The paradisiacal garden planted by God for Adam and Eve.',
    verse: '“And the Lord God planted a garden eastward in Eden.”',
    reference: 'Genesis 2:8',
  },
  SINAI: {
    word: 'SINAI',
    category: 'Sacred Mountain',
    definition: 'The holy mountain where God gave the Ten Commandments.',
    verse: '“Mount Sinai was completely in smoke, because the Lord descended upon it in fire.”',
    reference: 'Exodus 19:18',
  },
  ZION: {
    word: 'ZION',
    category: 'Holy City',
    definition: 'The hill of Jerusalem representing God’s dwelling and kingdom.',
    verse: '“Out of Zion, the perfection of beauty, God shines forth.”',
    reference: 'Psalm 50:2',
  },
  SION: {
    word: 'SION',
    category: 'Holy City',
    definition: 'Alternative biblical spelling for Mount Zion.',
    verse: '“You have come to Mount Sion, and to the city of the living God.”',
    reference: 'Hebrews 12:22',
  },
  ARK: {
    word: 'ARK',
    category: 'Sacred Vessel',
    definition: 'The Ark of Noah and the Ark of the Covenant.',
    verse: '“Make yourself an ark of gopher wood.”',
    reference: 'Genesis 6:14',
  },
  ALTAR: {
    word: 'ALTAR',
    category: 'Sacred Worship',
    definition: 'Place of sacrifice, prayer, and worship to the Lord.',
    verse: '“Noah built an altar to the Lord and offered burnt offerings.”',
    reference: 'Genesis 8:20',
  },
  TEMPLE: {
    word: 'TEMPLE',
    category: 'Holy Sanctuary',
    definition: 'House of the Lord built by Solomon in Jerusalem.',
    verse: '“The glory of the Lord filled the temple.”',
    reference: '2 Chronicles 7:1',
  },
  CROSS: {
    word: 'CROSS',
    category: 'Redemption',
    definition: 'The instrument of Christ’s sacrifice for the sins of the world.',
    verse: '“For the message of the cross is foolishness to those who are perishing, but to us who are being saved it is the power of God.”',
    reference: '1 Corinthians 1:18',
  },
  PEACE: {
    word: 'PEACE',
    category: 'Spiritual Fruit',
    definition: 'The tranquility and wholeness (Shalom) given by God.',
    verse: '“Peace I leave with you; my peace I give you.”',
    reference: 'John 14:27',
  },
  GLORY: {
    word: 'GLORY',
    category: 'Divine Majesty',
    definition: 'The radiant presence, honor, and majesty of God.',
    verse: '“The heavens declare the glory of God; the skies proclaim the work of his hands.”',
    reference: 'Psalm 19:1',
  },
  MERCY: {
    word: 'MERCY',
    category: 'God’s Heart',
    definition: 'God’s compassionate withholding of deserved punishment.',
    verse: '“The Lord is compassionate and gracious, slow to anger, abounding in mercy.”',
    reference: 'Psalm 103:8',
  },
  LIGHT: {
    word: 'LIGHT',
    category: 'Divine Truth',
    definition: 'God’s truth, holiness, and the nature of Christ.',
    verse: '“Your word is a lamp to my feet and a light for my path.”',
    reference: 'Psalm 119:105',
  },
  LIFE: {
    word: 'LIFE',
    category: 'Eternal Gift',
    definition: 'Abundant and everlasting life in Christ Jesus.',
    verse: '“I am the way, the truth, and the life.”',
    reference: 'John 14:6',
  },
  LOVE: {
    word: 'LOVE',
    category: 'Greatest Virtue',
    definition: 'Selfless agape love that reflects God’s very nature.',
    verse: '“For God so loved the world that he gave his one and only Son.”',
    reference: 'John 3:16',
  },
  HOPE: {
    word: 'HOPE',
    category: 'Spiritual Anchor',
    definition: 'Confident expectation of God’s goodness and eternal glory.',
    verse: '“We have this hope as an anchor for the soul, firm and secure.”',
    reference: 'Hebrews 6:19',
  },
  SOUL: {
    word: 'SOUL',
    category: 'Spiritual Being',
    definition: 'The immortal spiritual essence of human life.',
    verse: '“Praise the Lord, my soul; all my inmost being, praise his holy name.”',
    reference: 'Psalm 103:1',
  },
  HEART: {
    word: 'HEART',
    category: 'Inner Person',
    definition: 'The center of human devotion, will, and affection.',
    verse: '“Trust in the Lord with all your heart and lean not on your own understanding.”',
    reference: 'Proverbs 3:5',
  },
  SPIRIT: {
    word: 'SPIRIT',
    category: 'Holy Trinity',
    definition: 'The Holy Spirit, Comforter, and Counselor of believers.',
    verse: '“Not by might nor by power, but by my Spirit, says the Lord Almighty.”',
    reference: 'Zechariah 4:6',
  },
  PRAY: {
    word: 'PRAY',
    category: 'Spiritual Discipline',
    definition: 'Communing directly with God in petition and praise.',
    verse: '“Pray continually, give thanks in all circumstances.”',
    reference: '1 Thessalonians 5:17',
  },
  PRAISE: {
    word: 'PRAISE',
    category: 'Worship',
    definition: 'Glorifying and expressing thanksgiving to God.',
    verse: '“Let everything that has breath praise the Lord.”',
    reference: 'Psalm 150:6',
  },
  HOLY: {
    word: 'HOLY',
    category: 'Attribute of God',
    definition: 'Set apart, morally pure, and transcendent.',
    verse: '“Holy, holy, holy is the Lord Almighty; the whole earth is full of his glory.”',
    reference: 'Isaiah 6:3',
  },
  BLESS: {
    word: 'BLESS',
    category: 'Divine Favor',
    definition: 'To bestow goodness, grace, and happiness upon someone.',
    verse: '“The Lord bless you and keep you; the Lord make his face shine on you.”',
    reference: 'Numbers 6:24-25',
  },
  CROWN: {
    word: 'CROWN',
    category: 'Reward & Glory',
    definition: 'The Crown of Life given to those who persevere in faith.',
    verse: '“Be faithful unto death, and I will give you the crown of life.”',
    reference: 'Revelation 2:10',
  },
  BREAD: {
    word: 'BREAD',
    category: 'Sustenance',
    definition: 'Bread of Life representing Christ, and the Manna from heaven.',
    verse: '“Jesus declared, ‘I am the bread of life. Whoever comes to me will never go hungry.’”',
    reference: 'John 6:35',
  },
  MANNA: {
    word: 'MANNA',
    category: 'Miraculous Food',
    definition: 'Supernatural bread rained from heaven in the wilderness.',
    verse: '“The people of Israel called the bread manna. It was white like coriander seed and tasted like wafers made with honey.”',
    reference: 'Exodus 16:31',
  },
  WINE: {
    word: 'WINE',
    category: 'Sacred Element',
    definition: 'Symbol of the New Covenant in Christ’s shed blood.',
    verse: '“This cup is the new covenant in my blood, which is poured out for you.”',
    reference: 'Luke 22:20',
  },
  LAMB: {
    word: 'LAMB',
    category: 'Messianic Title',
    definition: 'The Lamb of God who takes away the sin of the world.',
    verse: '“Look, the Lamb of God, who takes away the sin of the world!”',
    reference: 'John 1:29',
  },
  SHEEP: {
    word: 'SHEEP',
    category: 'Flock of God',
    definition: 'Believers guided and protected by the Good Shepherd.',
    verse: '“The Lord is my shepherd, I lack nothing.”',
    reference: 'Psalm 23:1',
  },
  DOVE: {
    word: 'DOVE',
    category: 'Holy Symbol',
    definition: 'Symbol of peace and the descent of the Holy Spirit.',
    verse: '“The Holy Spirit descended on him in bodily form like a dove.”',
    reference: 'Luke 3:22',
  },
  LION: {
    word: 'LION',
    category: 'Messianic Title',
    definition: 'The Lion of the tribe of Judah, victorious King.',
    verse: '“See, the Lion of the tribe of Judah, the Root of David, has triumphed.”',
    reference: 'Revelation 5:5',
  },
  ROCK: {
    word: 'ROCK',
    category: 'Foundation',
    definition: 'God as the eternal fortress and foundation of believers.',
    verse: '“The Lord is my rock, my fortress and my deliverer.”',
    reference: 'Psalm 18:2',
  },
  STONE: {
    word: 'STONE',
    category: 'Symbol of Truth',
    definition: 'The smooth stones of David and Christ as Chief Cornerstone.',
    verse: '“The stone the builders rejected has become the cornerstone.”',
    reference: 'Psalm 118:22',
  },
  FIRE: {
    word: 'FIRE',
    category: 'Divine Presence',
    definition: 'Pillar of Fire in Exodus and holy refining presence of God.',
    verse: '“For our God is a consuming fire.”',
    reference: 'Hebrews 12:29',
  },
  STAFF: {
    word: 'STAFF',
    category: 'Shepherd’s Tool',
    definition: 'Moses’ rod and the shepherd’s staff of guidance.',
    verse: '“Your rod and your staff, they comfort me.”',
    reference: 'Psalm 23:4',
  },
  SWORD: {
    word: 'SWORD',
    category: 'Word of God',
    definition: 'The Sword of the Spirit, which is the living Word of God.',
    verse: '“For the word of God is alive and active. Sharper than any double-edged sword.”',
    reference: 'Hebrews 4:12',
  },
  SHIELD: {
    word: 'SHIELD',
    category: 'Armor of God',
    definition: 'The Shield of Faith that extinguishes fiery darts.',
    verse: '“Take up the shield of faith, with which you can extinguish all the flaming arrows of the evil one.”',
    reference: 'Ephesians 6:16',
  },
  HELMET: {
    word: 'HELMET',
    category: 'Armor of God',
    definition: 'The Helmet of Salvation protecting the mind.',
    verse: '“Take the helmet of salvation and the sword of the Spirit.”',
    reference: 'Ephesians 6:17',
  },
  ROBE: {
    word: 'ROBE',
    category: 'Righteousness',
    definition: 'The Robe of Righteousness bestowed upon the redeemed.',
    verse: '“He has clothed me with garments of salvation and arrayed me in a robe of his righteousness.”',
    reference: 'Isaiah 61:10',
  },
  OIL: {
    word: 'OIL',
    category: 'Anointing',
    definition: 'Holy anointing oil symbolizing the blessing of the Holy Spirit.',
    verse: '“You anoint my head with oil; my cup overflows.”',
    reference: 'Psalm 23:5',
  },
  PALM: {
    word: 'PALM',
    category: 'Victory',
    definition: 'Palm branches waved at Triumphal Entry and in heavenly victory.',
    verse: '“They took palm branches and went out to meet him, shouting, ‘Hosanna!’”',
    reference: 'John 12:13',
  },
  VINE: {
    word: 'VINE',
    category: 'Union with Christ',
    definition: 'Jesus as the True Vine and believers as the fruit-bearing branches.',
    verse: '“I am the vine; you are the branches. If you remain in me and I in you, you will bear much fruit.”',
    reference: 'John 15:5',
  },
  SEED: {
    word: 'SEED',
    category: 'Kingdom Parable',
    definition: 'Faith like a mustard seed and the Word sown in hearts.',
    verse: '“If you have faith as small as a mustard seed, you can say to this mountain, ‘Move from here to there,’ and it will move.”',
    reference: 'Matthew 17:20',
  },
  GOLD: {
    word: 'GOLD',
    category: 'Pure Worship',
    definition: 'Refined faith tested through trial, more precious than gold.',
    verse: '“These have come so that the proven genuineness of your faith—of greater worth than gold—may result in praise.”',
    reference: '1 Peter 1:7',
  },
  ANGEL: {
    word: 'ANGEL',
    category: 'Heavenly Messenger',
    definition: 'Ministering spirits sent to serve those who inherit salvation.',
    verse: '“The angel of the Lord encamps around those who fear him, and he delivers them.”',
    reference: 'Psalm 34:7',
  },
  PRIEST: {
    word: 'PRIEST',
    category: 'Holy Service',
    definition: 'Intercessors before God, with Christ as High Priest.',
    verse: '“You are a royal priesthood, a holy nation, God’s special possession.”',
    reference: '1 Peter 2:9',
  },
  RUTH: {
    word: 'RUTH',
    category: 'Faithful Moabitess',
    definition: 'Great-grandmother of King David, exemplar of loyalty and grace.',
    verse: '“Where you go I will go, and where you stay I will stay. Your people will be my people and your God my God.”',
    reference: 'Ruth 1:16',
  },
  ESTHER: {
    word: 'ESTHER',
    category: 'Queen of Persia',
    definition: 'Brave Jewish queen who risked her life to save her people.',
    verse: '“And who knows but that you have come to your royal position for such a time as this?”',
    reference: 'Esther 4:14',
  },
  JONAH: {
    word: 'JONAH',
    category: 'Prophet',
    definition: 'Swallowed by a great fish after fleeing to Tarshish.',
    verse: '“Now the Lord provided a huge fish to swallow Jonah, and Jonah was in the belly of the fish three days and three nights.”',
    reference: 'Jonah 1:17',
  },
  ELIJAH: {
    word: 'ELIJAH',
    category: 'Prophet of Fire',
    definition: 'Defeated the prophets of Baal on Mount Carmel.',
    verse: '“Then the fire of the Lord fell and burned up the sacrifice, the wood, the stones and the soil.”',
    reference: '1 Kings 18:38',
  },
  AARON: {
    word: 'AARON',
    category: 'First High Priest',
    definition: 'Brother of Moses and first High Priest of Israel.',
    verse: '“The Lord spoke to Moses: ‘Tell Aaron and his sons: This is how you are to bless the Israelites.’”',
    reference: 'Numbers 6:22-23',
  },
  JACOB: {
    word: 'JACOB',
    category: 'Patriarch',
    definition: 'Wrestled with God at Peniel and was renamed Israel.',
    verse: '“Your name will no longer be Jacob, but Israel, because you have struggled with God and with humans and have overcome.”',
    reference: 'Genesis 32:28',
  },
  ISAAC: {
    word: 'ISAAC',
    category: 'Son of Promise',
    definition: 'Miraculous son of Abraham and Sarah.',
    verse: '“God said, ‘Yes, but your wife Sarah will bear you a son, and you will call him Isaac. I will establish my covenant with him.’”',
    reference: 'Genesis 17:19',
  },
  SARAH: {
    word: 'SARAH',
    category: 'Matriarch',
    definition: 'Wife of Abraham and mother of the covenant promise.',
    verse: '“By faith even Sarah, who was past childbearing age, was enabled to bear children because she considered him faithful who had made the promise.”',
    reference: 'Hebrews 11:11',
  },
  ABEL: {
    word: 'ABEL',
    category: 'Righteous Offerer',
    definition: 'Offered a more acceptable sacrifice to God by faith.',
    verse: '“By faith Abel brought God a better offering than Cain did.”',
    reference: 'Hebrews 11:4',
  },
  ENOCH: {
    word: 'ENOCH',
    category: 'Walked with God',
    definition: 'Did not see death, for God took him away.',
    verse: '“Enoch walked faithfully with God; then he was no more, because God took him away.”',
    reference: 'Genesis 5:24',
  },
  BOAZ: {
    word: 'BOAZ',
    category: 'Kinsman Redeemer',
    definition: 'Righteous landowner of Bethlehem who married Ruth.',
    verse: '“Boaz took Ruth and she became his wife... The Lord enabled her to conceive, and she gave birth to a son.”',
    reference: 'Ruth 4:13',
  },
  AMEN: {
    word: 'AMEN',
    category: 'Solemn Affirmation',
    definition: '“Truly” or “So be it” — affirmation of divine truth.',
    verse: '“For no matter how many promises God has made, they are ‘Yes’ in Christ. And so through him the ‘Amen’ is spoken by us to the glory of God.”',
    reference: '2 Corinthians 1:20',
  },
  HOSANNA: {
    word: 'HOSANNA',
    category: 'Praise & Petition',
    definition: '“Save us now, Lord!” — cry of praise to the Messiah.',
    verse: '“Hosanna to the Son of David! Blessed is he who comes in the name of the Lord!”',
    reference: 'Matthew 21:9',
  },
};

// MULTIPLIER BOARD SLOTS (SCRABBLE MODIFIERS)
const BOARD_SLOTS = [
  { id: 0, label: 'START', multiplierType: 'none', multiplier: 1, badge: '⭐' },
  { id: 1, label: '2L', multiplierType: 'letter', multiplier: 2, badge: '2x Letter' },
  { id: 2, label: 'HOLY', multiplierType: 'bonus', multiplier: 10, badge: '+10 Holy' },
  { id: 3, label: '3L', multiplierType: 'letter', multiplier: 3, badge: '3x Letter' },
  { id: 4, label: '2W', multiplierType: 'word', multiplier: 2, badge: '2x Word' },
  { id: 5, label: '3W', multiplierType: 'word', multiplier: 3, badge: '3x Word' },
  { id: 6, label: 'DIVINE', multiplierType: 'word', multiplier: 2, badge: 'Divine' },
];

export interface DiscoveredWord {
  word: string;
  score: number;
  entry: BibleLexiconEntry;
  timestamp: string;
}

interface RackTile {
  id: string;
  letter: string;
  points: number;
}

export default function CovenantWordle({ onBack }: { onBack: () => void }) {
  const { profile, updateProfile } = useGame();

  // 7-tile Scrabble Rack
  const [rack, setRack] = useState<RackTile[]>([]);
  // Board Placement: Array of tiles placed on the 7-slot board
  const [boardPlacements, setBoardPlacements] = useState<(RackTile | null)[]>([
    null, null, null, null, null, null, null,
  ]);

  const [totalScore, setTotalScore] = useState<number>(0);
  const [discoveredWords, setDiscoveredWords] = useState<DiscoveredWord[]>([]);
  const [activeRevealedLore, setActiveRevealedLore] = useState<BibleLexiconEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRackShaking, setIsRackShaking] = useState<boolean>(false);
  const [isBonusWon, setIsBonusWon] = useState<boolean>(false);

  // Bag Generator to ensure playable vowels and consonants
  const generateNewTileHand = useCallback((): RackTile[] => {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const commonConsonants = ['D', 'V', 'M', 'S', 'P', 'R', 'T', 'L', 'N', 'C', 'H', 'G', 'F', 'B'];
    const handLetters: string[] = [];

    // Ensure at least 3 vowels
    for (let i = 0; i < 3; i++) {
      handLetters.push(vowels[Math.floor(Math.random() * vowels.length)]);
    }
    // Ensure 4 consonants
    for (let i = 0; i < 4; i++) {
      handLetters.push(commonConsonants[Math.floor(Math.random() * commonConsonants.length)]);
    }

    // Shuffle hand
    const shuffled = handLetters.sort(() => Math.random() - 0.5);

    return shuffled.map((char, idx) => ({
      id: `${char}-${idx}-${Date.now()}-${Math.random()}`,
      letter: char,
      points: SCRABBLE_POINTS[char] || 1,
    }));
  }, []);

  // Initialize hand on mount
  useEffect(() => {
    // Seed with guaranteed letters capable of making words like FAITH, MOSES, DAVID, NOAH, PEACE
    const starterHands = [
      ['F', 'A', 'I', 'T', 'H', 'O', 'S'],
      ['M', 'O', 'S', 'E', 'S', 'A', 'R'],
      ['D', 'A', 'V', 'I', 'D', 'E', 'N'],
      ['G', 'R', 'A', 'C', 'E', 'O', 'D'],
      ['P', 'E', 'A', 'C', 'E', 'L', 'T'],
    ];
    const starter = starterHands[Math.floor(Math.random() * starterHands.length)];
    const initialRack = starter.map((char, idx) => ({
      id: `${char}-${idx}-${Date.now()}`,
      letter: char,
      points: SCRABBLE_POINTS[char] || 1,
    }));
    setRack(initialRack);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Place a tile from the rack onto the next open board slot
  const handleSelectRackTile = (tile: RackTile) => {
    audioEngine.playClick();
    const firstEmptySlotIdx = boardPlacements.findIndex((slot) => slot === null);
    if (firstEmptySlotIdx === -1) {
      showToast('All 7 board slots are filled!');
      return;
    }

    // Remove from rack, put on board
    setRack((prev) => prev.filter((t) => t.id !== tile.id));
    setBoardPlacements((prev) => {
      const next = [...prev];
      next[firstEmptySlotIdx] = tile;
      return next;
    });
  };

  // Remove a placed tile from the board back to the rack
  const handleRemoveBoardTile = (slotIndex: number) => {
    const tile = boardPlacements[slotIndex];
    if (!tile) return;

    audioEngine.playClick();
    setBoardPlacements((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setRack((prev) => [...prev, tile]);
  };

  // Clear all placed board tiles back to the rack
  const handleClearBoard = () => {
    audioEngine.playWrong();
    const placedTiles = boardPlacements.filter((t): t is RackTile => t !== null);
    setBoardPlacements([null, null, null, null, null, null, null]);
    setRack((prev) => [...prev, ...placedTiles]);
  };

  // Shuffle the remaining tiles on the rack
  const handleShuffleRack = () => {
    audioEngine.playWheelTick();
    setRack((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  // Swap rack tiles for a completely fresh hand
  const handleSwapHand = () => {
    audioEngine.playPowerup();
    handleClearBoard();
    const newHand = generateNewTileHand();
    setRack(newHand);
    showToast('Hand refreshed with new Scripture tiles!');
  };

  // Active word formed on the board
  const activeWord = useMemo(() => {
    return boardPlacements
      .filter((t): t is RackTile => t !== null)
      .map((t) => t.letter)
      .join('');
  }, [boardPlacements]);

  // Calculate potential Scrabble score for active tiles with board multipliers
  const calculatedActiveScore = useMemo(() => {
    let letterSum = 0;
    let wordMultiplier = 1;
    let holyBonus = 0;

    boardPlacements.forEach((tile, slotIdx) => {
      if (!tile) return;
      const slotDef = BOARD_SLOTS[slotIdx];
      let tileVal = tile.points;

      if (slotDef.multiplierType === 'letter') {
        tileVal *= slotDef.multiplier;
      } else if (slotDef.multiplierType === 'bonus') {
        holyBonus += slotDef.multiplier;
      } else if (slotDef.multiplierType === 'word') {
        wordMultiplier *= slotDef.multiplier;
      }

      letterSum += tileVal;
    });

    const isScriptureWord = !!SCRIPTURE_LEXICON[activeWord];
    const scriptureBonusMultiplier = isScriptureWord ? 1.5 : 1.0;
    const finalScore = Math.round((letterSum * wordMultiplier + holyBonus) * scriptureBonusMultiplier);

    return {
      basePoints: letterSum,
      wordMultiplier,
      holyBonus,
      isScriptureWord,
      finalScore: activeWord.length >= 2 ? finalScore : 0,
    };
  }, [boardPlacements, activeWord]);

  // Submit the constructed word
  const handleSubmitWord = () => {
    if (activeWord.length < 2) {
      setIsRackShaking(true);
      audioEngine.playWrong();
      showToast('Form at least a 2-letter biblical word!');
      setTimeout(() => setIsRackShaking(false), 500);
      return;
    }

    const lexiconMatch = SCRIPTURE_LEXICON[activeWord];

    if (!lexiconMatch) {
      setIsRackShaking(true);
      audioEngine.playWrong();
      showToast(`“${activeWord}” is not in the Scripture Lexicon! Try MOSES, FAITH, ARK, NOAH, GRACE...`);
      setTimeout(() => setIsRackShaking(false), 500);
      return;
    }

    // SUCCESSFUL SCRIPTURE WORD!
    const earnedScore = calculatedActiveScore.finalScore;
    const nextTotal = totalScore + earnedScore;

    audioEngine.playCorrect(3);
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });

    setTotalScore(nextTotal);
    setActiveRevealedLore(lexiconMatch);

    // Record in discovered list if new
    setDiscoveredWords((prev) => [
      {
        word: activeWord,
        score: earnedScore,
        entry: lexiconMatch,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);

    // Update player XP & coins
    const coinsWon = Math.round(earnedScore / 2);
    updateProfile({
      wisdomCoins: profile.wisdomCoins + coinsWon,
      xp: profile.xp + earnedScore,
    });

    // Check Daily Goal Tiers
    if (nextTotal >= 300 && !isBonusWon) {
      setIsBonusWon(true);
      audioEngine.playLevelComplete();
    }

    // Refill tiles used
    const placedCount = boardPlacements.filter((t) => t !== null).length;
    setBoardPlacements([null, null, null, null, null, null, null]);

    // Draw new replacement tiles
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = ['S', 'D', 'M', 'P', 'R', 'T', 'L', 'N', 'C', 'H', 'G', 'F', 'B', 'V'];
    const newDraws: RackTile[] = [];

    for (let i = 0; i < placedCount; i++) {
      const isVowel = Math.random() < 0.45;
      const char = isVowel
        ? vowels[Math.floor(Math.random() * vowels.length)]
        : consonants[Math.floor(Math.random() * consonants.length)];
      newDraws.push({
        id: `${char}-${Date.now()}-${Math.random()}`,
        letter: char,
        points: SCRABBLE_POINTS[char] || 1,
      });
    }

    setRack((prev) => [...prev, ...newDraws]);
    showToast(`+${earnedScore} PTS! Unlocked ${lexiconMatch.reference}`);
  };

  // Provide a smart hint
  const handleScriptureHint = () => {
    audioEngine.playPowerup();
    const allAvailableLetters = [
      ...rack.map((t) => t.letter),
      ...boardPlacements.filter((t): t is RackTile => t !== null).map((t) => t.letter),
    ];

    // Find any Scripture word that can be constructed from current letters
    const validMatches = Object.keys(SCRIPTURE_LEXICON).filter((word) => {
      const letterPool = [...allAvailableLetters];
      for (const ch of word) {
        const idx = letterPool.indexOf(ch);
        if (idx === -1) return false;
        letterPool.splice(idx, 1);
      }
      return true;
    });

    if (validMatches.length > 0) {
      const hintWord = validMatches[0];
      const entry = SCRIPTURE_LEXICON[hintWord];
      showToast(`💡 Hint: You can form “${hintWord}” (${entry.category} — ${entry.reference})!`);
    } else {
      showToast('💡 Tip: Try clicking “Swap Hand” to draw new letters that can form MOSES, FAITH, GRACE!');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in text-slate-100 text-center">
      {/* 1. TOP HEADER HUD */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/40 p-3.5 rounded-2xl shadow-xl">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Hub
        </button>

        <div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
              Scrabble Word Builder
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              DAILY EDITION
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-white">
            SCRIPTURE SCRABBLE
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-xl text-xs font-black text-amber-300">
            Score: {totalScore} pts
          </div>
        </div>
      </div>

      {/* 2. PROGRESS / DAILY GOAL TARGET BAR */}
      <div className="game-panel rounded-2xl p-3 sm:p-4 border border-amber-500/30 text-left space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            Daily Wisdom Target (Goal: 300 pts)
          </span>
          <span className="text-amber-300 font-mono font-black">
            {totalScore} / 300 pts {totalScore >= 300 ? '👑 COMPLETED' : ''}
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${Math.min(100, (totalScore / 300) * 100)}%` }}
          />
        </div>
      </div>

      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="py-2 px-5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-black text-xs inline-block animate-pop shadow-xl border border-yellow-200">
          {toastMessage}
        </div>
      )}

      {/* 3. THE 7-SLOT SCRABBLE WORD BOARD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase text-amber-300 tracking-wider">
            Active Word Board: {activeWord ? `“${activeWord}”` : '(Tap tiles below to build)'}
          </span>
          {activeWord.length > 0 && (
            <span className="text-xs font-extrabold text-emerald-400 animate-pop">
              +{calculatedActiveScore.finalScore} PTS {calculatedActiveScore.isScriptureWord ? '(+1.5x Scripture Bonus!)' : ''}
            </span>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 max-w-lg mx-auto p-3 rounded-3xl bg-gradient-to-b from-[#16233d] to-[#0c1424] border-2 border-amber-500/50 shadow-2xl">
          {BOARD_SLOTS.map((slot, idx) => {
            const placedTile = boardPlacements[idx];

            return (
              <div
                key={slot.id}
                onClick={() => placedTile && handleRemoveBoardTile(idx)}
                className={`h-16 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-between p-1 relative transition-all select-none ${
                  placedTile
                    ? 'bg-gradient-to-b from-[#fef3c7] to-[#fde68a] border-amber-400 text-slate-950 shadow-lg cursor-pointer transform hover:scale-105 animate-pop'
                    : 'bg-slate-900/80 border-slate-700/80 text-slate-500 border-dashed'
                }`}
              >
                {/* Slot Multiplier Badge */}
                <span
                  className={`text-[8px] font-black uppercase px-1 rounded block ${
                    slot.multiplierType === 'letter'
                      ? 'bg-cyan-900 text-cyan-200'
                      : slot.multiplierType === 'word'
                      ? 'bg-red-900 text-red-200'
                      : slot.multiplierType === 'bonus'
                      ? 'bg-amber-900 text-amber-200'
                      : 'text-slate-500'
                  }`}
                >
                  {slot.label}
                </span>

                {/* Placed Scrabble Letter */}
                {placedTile ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black font-serif text-slate-950 leading-none">
                      {placedTile.letter}
                    </span>
                    <span className="text-[10px] font-black text-amber-800 self-end mr-1">
                      {placedTile.points}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-600 font-bold m-auto">
                    {slot.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIONS: SUBMIT, CLEAR, SHUFFLE, HINT, SWAP */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
        <button
          onClick={handleSubmitWord}
          disabled={activeWord.length < 2}
          className={`py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition ${
            activeWord.length >= 2
              ? 'btn-game-primary text-slate-950 scale-105'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Submit Word (+{calculatedActiveScore.finalScore} pts)</span>
        </button>

        <button
          onClick={handleClearBoard}
          disabled={activeWord.length === 0}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition disabled:opacity-40"
          title="Clear active board"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={handleShuffleRack}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
          title="Shuffle rack tiles"
        >
          <Shuffle className="w-4 h-4" />
        </button>

        <button
          onClick={handleScriptureHint}
          className="p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1"
          title="Get a Scripture clue"
        >
          <Lightbulb className="w-4 h-4 text-yellow-300" />
          <span className="hidden sm:inline">Hint</span>
        </button>

        <button
          onClick={handleSwapHand}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1"
          title="Swap hand for new letters"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Swap</span>
        </button>
      </div>

      {/* 5. PLAYER'S SCRABBLE TILE RACK */}
      <div
        className={`p-4 rounded-3xl bg-gradient-to-b from-[#22180d] to-[#120d07] border-2 border-amber-700/60 shadow-2xl max-w-lg mx-auto space-y-2 ${
          isRackShaking ? 'animate-shake' : ''
        }`}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-300/80 px-1">
          <span>YOUR TILE RACK (Tap tile to place):</span>
          <span>{rack.length} Tiles remaining</span>
        </div>

        {/* Tactile Wooden Scrabble Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {rack.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleSelectRackTile(tile)}
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-gradient-to-b from-[#fffbeb] via-[#fef3c7] to-[#fde68a] border-2 border-amber-400/90 text-slate-950 shadow-md shadow-black/60 flex flex-col items-center justify-between p-1 transform transition hover:-translate-y-1 hover:scale-105 active:translate-y-1 select-none"
            >
              <span className="text-xl sm:text-2xl font-black font-serif leading-none mt-1">
                {tile.letter}
              </span>
              <span className="text-[9px] font-bold text-amber-900 self-end mr-1">
                {tile.points}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. SCRIPTURE LORE CARD (REVEALED WHEN A BIBLE WORD IS PLAYED) */}
      {activeRevealedLore && (
        <div className="game-panel rounded-3xl p-5 border-2 border-emerald-500/60 text-left space-y-2.5 animate-pop shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📜</span>
              <span className="text-xs font-black uppercase text-emerald-400 tracking-wider">
                Scripture Discovery: {activeRevealedLore.word}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/40">
              {activeRevealedLore.category}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {activeRevealedLore.definition}
          </p>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-serif italic text-amber-200/90">
            {activeRevealedLore.verse}
            <span className="block text-[11px] font-sans font-bold text-amber-400 not-italic mt-1">
              — {activeRevealedLore.reference}
            </span>
          </div>
        </div>
      )}

      {/* 7. DISCOVERED WORDS CODEX LIST */}
      {discoveredWords.length > 0 && (
        <div className="space-y-2 text-left max-w-lg mx-auto">
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider block px-1">
            Discovered Words Today ({discoveredWords.length}):
          </span>

          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {discoveredWords.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setActiveRevealedLore(item.entry)}
                className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-white font-serif tracking-wider">
                    {item.word}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({item.entry.reference})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300">
                    +{item.score} pts
                  </span>
                  <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
