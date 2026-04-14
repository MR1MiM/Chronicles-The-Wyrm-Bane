// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  CHRONICLES: THE WYRM-BANE â€” script.js
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let settings = { bgmVolume: 0.2, voiceVolume: 0.45, timerOn: true, sortOrder: 'faction', highStakes: false, terminalEnabled: true, terminalMinimized: false };

// â”€â”€ GAME STATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let currentLevel = 1;
let clearedLevels = [];
let currentEnemy = null;
let unlockedCardCount = 0;   // how many cards player has access to in pool

let mana = 0, maxMana = 0;
let enemyMana = 0, enemyMaxMana = 0;
let playerHP = 20, enemyHP = 20, enemyMaxHP = 20;
let selectedCard = null;
let playerDeck = [], enemyDeck = [], enemyHand = [];
let playerGrave = [], enemyGrave = [];

let turnTimer = null, turnTimeLeft = 60;
let timerPaused = false;   // true while any modal is open
let isPlayerTurn = true;
let pileModalData = [];
let attackInProgress = false;
let currentScreen = 'screen-menu';
let playerTurnDraws = 0;
let enemyTurnDraws = 0;
let playerAbilitySilenceTurns = 0;
let enemyAbilitySilenceTurns = 0;
const BASE_UNLOCKED_CARDS = 10;
let firstPlayDiscountUsed = false;
let ownedCardNames = new Set();
let discoveredCardNames = new Set();
let rewardChoices = [];
let selectedRewardNames = new Set();
let playerCardsPlayedThisTurn = 0;
let gold = 0;
let winStreak = 0;
let divineVaultOpened = false;
let anteActiveForBattle = false;
let dailyQuest = null;
const MAX_CARDS_PER_TURN = 5;
const BATTLE_LOG_LIMIT = 180;
let battleLog = [];
let battleLogNextId = 1;
const MOVE_TO_FRONT_COST = 1;
const ANTE_ENTRY_FEE = 200;
const DAILY_QUEST_REWARD = 200;
const DECK_MIN_CARDS = 30;
const DECK_MAX_CARDS = 45;
const MAX_GODS_PER_DECK = 1;
const MAX_FUSIONS_PER_DECK = 5;
const MAX_FIELDS_PER_DECK = 4;
const SHOP_PACKS = Object.freeze({
  starter: { id: 'starter', name: 'Starter Pack', cost: 500, description: 'Mostly Red, Blue, and Pink cards. Good for basics.' },
  architect: { id: 'architect', name: 'Architect Pack', cost: 800, description: 'High chance of Purple Buildings and Green Fields.' },
  apex: { id: 'apex', name: 'Apex Pack', cost: 1200, description: 'High chance of Cyan Monsters and Orange Fusions.' },
  divine: { id: 'divine', name: 'Divine Vault', cost: 5000, description: 'Guaranteed 1 God Card. Unlocks at Level 10 and can only be opened once.' }
});
const UI_ICONS = Object.freeze({
  atk: '\u2694\uFE0F',
  hp: '\u2764\uFE0F',
  mana: '\u{1F48E}',
  win: '\u{1F3C6}',
  lose: '\u{1F480}'
});
const MAP_ICONS = Object.freeze({
  title: '\u{1F5FA}\uFE0F',
  cleared: '\u2705',
  available: '\u2694\uFE0F',
  locked: '\u{1F512}',
  boss: '\u{1F409}'
});
let playerDeckList = [];
let returningCardsAtEndOfTurn = { player: [], enemy: [] };
let playerDeckFatigue = 0;
let enemyDeckFatigue = 0;
let selectedCardActionMode = 'attack';
let mapSpawnLevel = null;
let ownedItemIds = new Set();
let discoveredItemIds = new Set();
let discoveredRecipeIds = new Set();
let recipeCounts = {};
let selectedInventoryEntry = null;
let shopOffers = [];
const MANUAL_TRIGGER_BY_CARD = Object.freeze({
  'Flame-Wielder Mage': 'onPlay',
  'Highland War-Chieftain': 'onPlay',
  'Spore Scout': 'onPlay',
  'Whispering Willow': 'onPlay',
  'General of the Ravaged Sun': 'onPlay',
  'Larva Scout': 'onPlay',
  'Snap-Trap Lily': 'onPlay',
  'Deep-Sea Terror': 'onPlay',
  'Vine-Choked Gate': 'onPlay',
  'Stone-Watcher Idol': 'onPlay',
  'Tower of Whispers': 'onPlay',
  'Void Gate': 'onPlay',
  'Emerald Totem': 'onPlay',
  'Ancient Ruins': 'onPlay',
  'Chimeric Beast': 'onPlay',
  'Mind Flick': 'onPlay',
  'Dark Surge': 'onPlay',
  'Amnesia': 'onPlay',
  'Gravity Well': 'onPlay',
  'Shadow Copy': 'onPlay',
  'Psychic Scream': 'onPlay',
  'Possession': 'onPlay',
  'Memory Wipe': 'onPlay',
  'Ironwood Root': 'onStartTurn',
  'Lotus Queen': 'onStartTurn',
  'Plague Rat': 'onStartTurn',
  'Leaching Pillar': 'onStartTurn',
  'Dark Library': 'onStartTurn',
  'Verdant Forge': 'onStartTurn',
  'Hidden Grove': 'onStartTurn',
  'Sacrificial Altar': 'onStartTurn',
  'The Dark Hospital': 'onStartTurn',
  'Great Earth Engine': 'onEndTurn',
  'Hive Queen': 'onEndTurn'
});

// â”€â”€ AUDIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const music = new Audio('./public/main-theme.mp3');
music.loop = true; music.volume = settings.bgmVolume;
window.addEventListener('pointerdown', () => music.play().catch(()=>{}), { once: true });

function setVolume(v) {
  settings.bgmVolume = v / 100;
  music.volume = settings.bgmVolume;
  shopMerchantState.voice.volume = settings.voiceVolume;
  shopMerchantState.music.volume = settings.bgmVolume;
  document.getElementById('vol-label').innerText = v + '%';
  saveProgress();
}
function setVoiceVolume(v) {
  settings.voiceVolume = v / 100;
  shopMerchantState.voice.volume = settings.voiceVolume;
  document.getElementById('voice-label').innerText = v + '%';
  saveProgress();
}

function fadeAudio(audio, targetVolume, duration = 500, onComplete = null) {
  if (!audio) return;
  clearInterval(audio._fadeTimer);
  const startVolume = Number.isFinite(audio.volume) ? audio.volume : 0;
  const steps = Math.max(1, Math.floor(duration / 50));
  let currentStep = 0;
  audio._fadeTimer = setInterval(() => {
    currentStep += 1;
    const t = currentStep / steps;
    audio.volume = startVolume + (targetVolume - startVolume) * t;
    if (currentStep >= steps) {
      clearInterval(audio._fadeTimer);
      audio.volume = targetVolume;
      if (onComplete) onComplete();
    }
  }, 50);
}
function toggleTimer(on) {
  if (currentScreen === 'screen-game') {
    const timerToggle = document.getElementById('timer-toggle');
    if (timerToggle) timerToggle.checked = settings.timerOn;
    return;
  }
  settings.timerOn = on;
  document.getElementById('timer-label').innerText = on ? 'ON' : 'OFF';
  const clock = document.getElementById('turn-clock');
  if (clock) clock.style.display = on ? '' : 'none';
  if (!on) clearInterval(turnTimer);
  else if (isPlayerTurn && !timerPaused) startTurnTimer();
  saveProgress();
}
function setSortOrder(v) { settings.sortOrder = v; renderPileCards(); saveProgress(); }
function toggleHighStakes(on) {
  settings.highStakes = on;
  const label = document.getElementById('stakes-label');
  if (label) label.innerText = on ? 'ON' : 'OFF';
  saveProgress();
}
function toggleBattleTerminalEnabled(on) {
  settings.terminalEnabled = on;
  if (!on) settings.terminalMinimized = true;
  else settings.terminalMinimized = false;
  syncBattleTerminalUI();
  const label = document.getElementById('terminal-label');
  if (label) label.innerText = on ? 'ON' : 'OFF';
  saveProgress();
}

function toggleBattleTerminal(open) {
  if (!settings.terminalEnabled) return;
  settings.terminalMinimized = !open;
  syncBattleTerminalUI();
  saveProgress();
}

function syncBattleTerminalUI() {
  const terminal = document.getElementById('battle-terminal');
  const toggle = document.getElementById('battle-terminal-toggle');
  const terminalSetting = document.getElementById('terminal-toggle');
  const terminalLabel = document.getElementById('terminal-label');
  if (terminalSetting) terminalSetting.checked = !!settings.terminalEnabled;
  if (terminalLabel) terminalLabel.innerText = settings.terminalEnabled ? 'ON' : 'OFF';
  if (terminal) terminal.classList.toggle('hidden', !settings.terminalEnabled || settings.terminalMinimized);
  if (toggle) toggle.classList.toggle('show', !!settings.terminalEnabled && !!settings.terminalMinimized && currentScreen === 'screen-game');
}

function updateTimerSettingAvailability() {
  const timerToggle = document.getElementById('timer-toggle');
  const timerNote = document.getElementById('timer-lock-note');
  const inBattle = currentScreen === 'screen-game';
  if (timerToggle) {
    timerToggle.disabled = inBattle;
    timerToggle.checked = settings.timerOn;
  }
  if (timerNote) timerNote.style.display = inBattle ? 'block' : 'none';
}

// â”€â”€ TIMER PAUSE/RESUME â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function pauseTimer() {
  timerPaused = true;
  // We do NOT clearInterval â€” we just skip ticks via the flag
}
function resumeTimer() {
  timerPaused = false;
  // Timer interval is still running, it will just stop skipping ticks
}

// â”€â”€ SCREENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showScreen(id) {
  currentScreen = id;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  updateTimerSettingAvailability();
  syncBattleTerminalUI();
  refreshShopUI();
  if (id === 'screen-map') {
    mapSelectedLevel = null;
    renderMap();
  }
  else stopMapLoop();
}

// â”€â”€ SETTINGS MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openSettings() {
  pauseTimer();
  updateTimerSettingAvailability();
  const stakesToggle = document.getElementById('stakes-toggle');
  const stakesLabel = document.getElementById('stakes-label');
  const terminalToggle = document.getElementById('terminal-toggle');
  const terminalLabel = document.getElementById('terminal-label');
  if (stakesToggle) stakesToggle.checked = !!settings.highStakes;
  if (stakesLabel) stakesLabel.innerText = settings.highStakes ? 'ON' : 'OFF';
  if (terminalToggle) terminalToggle.checked = !!settings.terminalEnabled;
  if (terminalLabel) terminalLabel.innerText = settings.terminalEnabled ? 'ON' : 'OFF';
  document.getElementById('settings-overlay').classList.add('show');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('show');
  resumeTimer();
}

// â”€â”€ ENEMIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function createEnemyRoster() {
  const namePrefixes = [
    'Vaelthor','Seraphix','Gorthnak','Izael','Cruethis','Yendrakh','Solvaine','Drakmor','Thessivane','Nhalor',
    'Velkora','Myrkos','Astraev','Korvax','Elyndra','Morthuun','Zerakai','Thalara','Vorgath','Iskriel',
    'Caldris','Nyxara','Varuun','Selvaris','Dreadmaw','Liora','Ravikhan','Ophess','Kaelthorn','Mirelith',
    'Vorastra','Cindros','Aethra','Ruinor','Belthaine','Xyphor','Marrowyn','Talvek','Sablemere','Zephryx',
    'Orlath','Vespara','Kharos','Illyra','Nemoris','Thornveil','Aurelax','Morvane','Skaleth','The Nameless Sovereign'
  ];
  const epithets = [
    'the Ashwalker','Dawnbreaker','the Unburied','Mirror-Born','the Hollow King','of the Spiral','the Moonreaper','the Everburning','World-Eater','the Riftbound',
    'Storm-Hexer','the Bone Choir','Ember Oracle','the Iron Maw','the Verdant Tyrant','the Grave-Tide','Starforged','the Black Bloom','the Frost Tyrant','the Veiled Judge',
    'the Cinder Saint','Night-Harbinger','the Gilded Fang','the Rot Oracle','the Deep Howl','of Fallen Grace','the Chainbinder','the Echo Lord','the Thorn Crown','the Silent Flood',
    'the Hollow Sun','the Dread Comet','the Pale Regent','the Abyss Smith','the Moonlit Scourge','the Oathless','the Wyrm Shepherd','the Dust Prophet','the Crimson Choir','the Dream Ravager',
    'the Last Beacon','the Storm Grave','the Blightsmith','the Dawnsunder','the Eternal Hunger','the Thorn Judge','the Void Regent','the Grave Emperor','the World Pyre','That Which Should Not Rule'
  ];
  const titles = [
    'Wanderer of Cinders','Herald of False Light','Warlord of the Dead March','The Reflected Tyrant','Sovereign of Empty Thrones',
    'Architect of Ruin','Harvester of Souls','Flame That Refuses to Die','Hunger Given Form','Voice Beneath the World',
    'Scourge of the Sunken Fields','Keeper of the Iron Eclipse','Oracle of the Final Spark','Breaker of Golden Gates','Bloom of the Last Forest',
    'Tide of Ashen Bones','Witness of the Broken Sky','Bloom in the Black Garden','Winter Crown of the Hollow North','Judge of Forgotten Oaths',
    'Saint of the Burning Chapel','Harbinger Beneath New Moons','Fang of the Crystal Court','Seer of the Rotting Vale','Howl from the Lower Deep',
    'Grace Turned Against the Living','Binder of Severed Kings','Lord of a Thousand Echoes','Crown of Briars and Blood','Flood Behind the Silent Dam',
    'Sun That Never Sets','Comet Over the Dying World','Regent of the White Tomb','Smith of Bottomless Forges','Scourge of the Moonlit Pass',
    'One Who Broke the Last Vow','Shepherd of Elder Wyrms','Prophet of the Dust Wars','Choirmaster of Crimson Bells','Ravager of Sleeping Cities',
    'Beacon for the End of Days','Grave of the Tempest Age','Smith of Withered Flesh','Sunderer of the First Dawn','Hunger Beyond Death',
    'Judge Beneath Thorned Skies','Regent of the Shattered Void','Emperor of the Final Crypt','Pyre at the Edge of Time','That Which Should Not Rule'
  ];

  return Array.from({ length: 50 }, (_, idx) => {
    const level = idx + 1;
    const hp = Math.min(180, 15 + idx * 3 + Math.floor(idx / 4) * 2);
    const mana = Math.min(30, 4 + Math.floor(idx / 2));
    const difficulty = Math.min(10, 1 + Math.floor(idx / 5));
    return {
      name: idx === 49 ? 'The Nameless Sovereign' : `${namePrefixes[idx]} ${epithets[idx]}`,
      hp,
      mana,
      difficulty,
      title: `Lv.${level} - ${titles[idx]}`,
      description: `A ${difficulty}/10 threat with ${hp} HP. Expect heavier pressure and stronger board swings at this stage.`
    };
  });
}

const enemies = createEnemyRoster();

// â”€â”€ MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MAP_LAYOUT_VERSION = 1;
const MAP_ZOOM = 1.7;
const MAP_MOVE_SPEED = 320;
const MAP_PADDING = 180;
const MAP_MIN_NODE_DISTANCE = 160;
const MAP_DIRECTION_SPRITES = Object.freeze({
  north: { idle: './public/mc animations/idle_north.gif', walk: './public/mc animations/walking_north.gif' },
  south: { idle: './public/mc animations/idle_south.gif', walk: './public/mc animations/walking_south.gif' },
  east: { idle: './public/mc animations/idle_east.gif', walk: './public/mc animations/walking_east.gif' },
  west: { idle: './public/mc animations/idle_west.gif', walk: './public/mc animations/walking_west.gif' }
});
let mapLayout = [];
let mapCamera = { x: 0, y: 0 };
let mapWorldSize = { width: 2200, height: 1400 };
let mapKeys = new Set();
let mapAnimationFrame = null;
let mapLastFrameTime = 0;
let mapFacing = 'south';
let mapSelectedLevel = null;
let deckEditorSelectedCardName = null;
let pendingFirstTurnOwner = 'player';
let pendingRpsLevel = null;
const RPS_BEATS = Object.freeze({ rock: 'scissors', paper: 'rock', scissors: 'paper' });
const SHOP_UI_ICONS = Object.freeze({
  deck: './public/assets/deck icon.png',
  shop: './public/assets/shop icon.png',
  coins: './public/assets/coins icon.png',
  chest: './public/assets/chest icon.png'
});
const RARITY_ORDER = Object.freeze(['common', 'rare', 'very_rare', 'legendary', 'mythical']);
const RARITY_LABELS = Object.freeze({
  common: 'Common',
  rare: 'Rare',
  very_rare: 'Very Rare',
  legendary: 'Legendary',
  mythical: 'Mythical'
});
const CRAFT_COSTS = Object.freeze({
  common: 200,
  rare: 400,
  very_rare: 600,
  legendary: 1000,
  mythical: 2000
});
const ITEM_DEFS = Object.freeze([
  { id: 'healing_tonic', name: 'Healing Tonic', rarity: 'common', icon: './public/assets/coins icon.png', description: 'A simple tonic the merchant swears by.' },
  { id: 'mana_salt', name: 'Mana Salt', rarity: 'common', icon: './public/assets/coins icon.png', description: 'A crystalline pinch that sparks with dormant power.' },
  { id: 'ember_bomb', name: 'Ember Bomb', rarity: 'rare', icon: './public/assets/chest icon.png', description: 'A glass orb packed with sleeping cinders.' },
  { id: 'wyrm_scale_shield', name: 'Wyrm Scale Shield', rarity: 'rare', icon: './public/assets/deck icon.png', description: 'Layered scales mounted into a field-ready shield.' },
  { id: 'void_compass', name: 'Void Compass', rarity: 'very_rare', icon: './public/assets/shop icon.png', description: 'Its needle always points toward the nearest bad idea.' },
  { id: 'sunsteel_lantern', name: 'Sunsteel Lantern', rarity: 'very_rare', icon: './public/assets/chest icon.png', description: 'A lantern that burns with patient daylight.' },
  { id: 'crown_of_cinders', name: 'Crown of Cinders', rarity: 'legendary', icon: './public/assets/deck icon.png', description: 'A relic fit for heroes who survive dragonfire.' },
  { id: 'wyrmheart_relic', name: 'Wyrmheart Relic', rarity: 'mythical', icon: './public/assets/shop icon.png', description: 'A mythical relic humming with ancient victory.' }
]);
const RECIPE_DEFS = Object.freeze(ITEM_DEFS.map(item => ({
  id: `${item.id}_recipe`,
  itemId: item.id,
  name: `${item.name} Recipe`,
  rarity: item.rarity,
  icon: item.icon,
  description: `Combine four copies and ${CRAFT_COSTS[item.rarity]} Gold to craft ${item.name}.`
})));
const shopMerchantState = {
  voice: new Audio(),
  music: new Audio(),
  idleTimers: [],
  hoverCooldownUntil: 0,
  open: false
};
const SHOP_MERCHANT_LINES = Object.freeze({
  welcome: [
    './public/sounds/voicelines/merchant/welcome 1.wav',
    './public/sounds/voicelines/merchant/welcome 2.wav',
    './public/sounds/voicelines/merchant/welcome 3.ogg'
  ],
  hover: [
    './public/sounds/voicelines/merchant/special offer.wav',
    './public/sounds/voicelines/merchant/when merchant selling boss fight items 1.ogg',
    './public/sounds/voicelines/merchant/when player selling a rare recipe.ogg'
  ],
  buy: [
    './public/sounds/voicelines/merchant/after opening a chest.ogg',
    './public/sounds/voicelines/merchant/when spending 2000+ gold in the shop.ogg'
  ],
  prebuy: [
    './public/sounds/voicelines/merchant/beffor buying a 5000 chest.ogg'
  ],
  exit: [
    './public/sounds/voicelines/merchant/beffore exiting the shop.ogg',
    './public/sounds/voicelines/merchant/exit shop.ogg',
    './public/sounds/voicelines/merchant/chest exit.wav'
  ],
  wait: [
    './public/sounds/voicelines/merchant/waiting for 15 seconds.wav',
    './public/sounds/voicelines/merchant/waiting for 30 seconds.wav'
  ],
  insufficient: [
    './public/sounds/voicelines/merchant/no enough money 1.wav',
    './public/sounds/voicelines/merchant/no enough money 2.ogg'
  ],
  soundtrack: [
    './public/sounds/soundtracks/shop/soundtrack 1.mp3',
    './public/sounds/soundtracks/shop/soundtrack 2.mp3',
    './public/sounds/soundtracks/shop/soundtrack 3.mp3'
  ]
});

function getStarterCards() {
  return [...pool].sort((a,b) => a.m - b.m || a.n.localeCompare(b.n)).slice(0, BASE_UNLOCKED_CARDS);
}

function ensureCollectionInitialized() {
  let changed = false;
  getStarterCards().forEach(card => {
    if (!ownedCardNames.has(card.n)) {
      ownedCardNames.add(card.n);
      changed = true;
    }
    if (!discoveredCardNames.has(card.n)) discoveredCardNames.add(card.n);
  });
  return changed;
}

function isMapOverlayOpen() {
  return document.getElementById('settings-overlay').classList.contains('show')
    || document.getElementById('deck-overlay').classList.contains('show')
    || document.getElementById('shop-overlay').classList.contains('show');
}

function isLevelAvailable(level) {
  return level === 1 || clearedLevels.includes(level - 1);
}

function getLevelState(level) {
  const done = clearedLevels.includes(level);
  const available = isLevelAvailable(level);
  return { done, available, locked: !done && !available };
}

function getLevelDifficulty(level) {
  return enemies[level - 1]?.difficulty || Math.min(10, Math.ceil(level / 5));
}

function getMapStatusText(level) {
  const state = getLevelState(level);
  if (state.done) return 'Cleared';
  if (state.locked) return 'Locked';
  return 'Available';
}

function getMapWorldDimensions() {
  const viewport = document.getElementById('map-viewport');
  if (!viewport) return mapWorldSize;
  return {
    width: Math.max(3600, Math.round(viewport.clientWidth * 3.2)),
    height: Math.max(2400, Math.round(viewport.clientHeight * 3))
  };
}

function clampMapCamera() {
  const viewport = document.getElementById('map-viewport');
  if (!viewport) return;
  const halfWidth = viewport.clientWidth / (2 * MAP_ZOOM);
  const halfHeight = viewport.clientHeight / (2 * MAP_ZOOM);
  const maxX = Math.max(halfWidth, mapWorldSize.width - halfWidth);
  const maxY = Math.max(halfHeight, mapWorldSize.height - halfHeight);
  mapCamera.x = Math.min(maxX, Math.max(halfWidth, mapCamera.x));
  mapCamera.y = Math.min(maxY, Math.max(halfHeight, mapCamera.y));
}

function applyMapCamera() {
  const viewport = document.getElementById('map-viewport');
  const world = document.getElementById('map-world');
  if (!viewport || !world) return;
  clampMapCamera();
  const translateX = viewport.clientWidth / 2 - (mapCamera.x * MAP_ZOOM);
  const translateY = viewport.clientHeight / 2 - (mapCamera.y * MAP_ZOOM);
  world.style.width = `${mapWorldSize.width}px`;
  world.style.height = `${mapWorldSize.height}px`;
  world.style.transform = `translate(${translateX}px, ${translateY}px) scale(${MAP_ZOOM})`;
}

function generateMapLayout() {
  const positions = [];
  for (let level = 1; level <= enemies.length; level++) {
    let point = null;
    for (let attempt = 0; attempt < 400; attempt++) {
      const x = MAP_PADDING + Math.random() * (mapWorldSize.width - MAP_PADDING * 2);
      const y = MAP_PADDING + Math.random() * (mapWorldSize.height - MAP_PADDING * 2);
      const farEnough = positions.every(existing => Math.hypot(existing.x - x, existing.y - y) >= MAP_MIN_NODE_DISTANCE);
      if (farEnough) {
        point = { level, x: Math.round(x), y: Math.round(y) };
        break;
      }
    }
    if (!point) {
      point = {
        level,
        x: MAP_PADDING + ((level * 173) % Math.max(1, mapWorldSize.width - MAP_PADDING * 2)),
        y: MAP_PADDING + ((level * 131) % Math.max(1, mapWorldSize.height - MAP_PADDING * 2))
      };
    }
    positions.push(point);
  }
  mapLayout = positions;
}

function ensureMapLayout() {
  const expected = getMapWorldDimensions();
  const layoutMatches = Array.isArray(mapLayout)
    && mapLayout.length === enemies.length
    && mapWorldSize.width === expected.width
    && mapWorldSize.height === expected.height;
  mapWorldSize = expected;
  if (!layoutMatches) generateMapLayout();
}

function updateMapSprite(isMoving) {
  const sprite = document.getElementById('map-player-sprite');
  if (!sprite) return;
  const sprites = MAP_DIRECTION_SPRITES[mapFacing] || MAP_DIRECTION_SPRITES.south;
  const nextSrc = isMoving ? sprites.walk : sprites.idle;
  if (sprite.getAttribute('src') !== nextSrc) sprite.setAttribute('src', nextSrc);
}

function updateMapMovement(deltaMs) {
  let dx = 0;
  let dy = 0;
  if (mapKeys.has('left')) dx -= 1;
  if (mapKeys.has('right')) dx += 1;
  if (mapKeys.has('up')) dy -= 1;
  if (mapKeys.has('down')) dy += 1;
  const moving = dx !== 0 || dy !== 0;
  if (!moving || isMapOverlayOpen()) {
    updateMapSprite(false);
    return;
  }
  const magnitude = Math.hypot(dx, dy) || 1;
  dx /= magnitude;
  dy /= magnitude;
  if (Math.abs(dx) > Math.abs(dy)) mapFacing = dx > 0 ? 'east' : 'west';
  else mapFacing = dy > 0 ? 'south' : 'north';
  const distance = MAP_MOVE_SPEED * (deltaMs / 1000);
  mapCamera.x += dx * distance;
  mapCamera.y += dy * distance;
  applyMapCamera();
  updateMapGuideArrow();
  updateMapSprite(true);
}

function stepMapFrame(timestamp) {
  if (currentScreen !== 'screen-map') {
    stopMapLoop();
    return;
  }
  if (!mapLastFrameTime) mapLastFrameTime = timestamp;
  const delta = Math.min(40, timestamp - mapLastFrameTime);
  mapLastFrameTime = timestamp;
  updateMapMovement(delta);
  mapAnimationFrame = window.requestAnimationFrame(stepMapFrame);
}

function startMapLoop() {
  if (mapAnimationFrame) return;
  mapLastFrameTime = 0;
  mapAnimationFrame = window.requestAnimationFrame(stepMapFrame);
}

function stopMapLoop() {
  if (mapAnimationFrame) window.cancelAnimationFrame(mapAnimationFrame);
  mapAnimationFrame = null;
  mapLastFrameTime = 0;
  mapKeys.clear();
  updateMapSprite(false);
}

function centerMapCamera() {
  const spawnPoint = mapSpawnLevel ? mapLayout.find(point => point.level === mapSpawnLevel) : null;
  mapCamera.x = spawnPoint ? spawnPoint.x : mapWorldSize.width / 2;
  mapCamera.y = spawnPoint ? spawnPoint.y : mapWorldSize.height / 2;
  applyMapCamera();
}

function getNextUnbeatenLevel() {
  for (let level = 1; level <= enemies.length; level++) {
    if (!clearedLevels.includes(level)) return level;
  }
  return null;
}

function updateMapGuideArrow() {
  const arrow = document.getElementById('map-guide-arrow');
  const targetLevel = getNextUnbeatenLevel();
  const point = mapLayout.find(entry => entry.level === targetLevel);
  if (!arrow) return;
  if (!point) {
    arrow.style.opacity = '0';
    return;
  }
  const dx = point.x - mapCamera.x;
  const dy = point.y - mapCamera.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  arrow.style.transform = `translateX(-50%) rotate(${angle}deg)`;
  arrow.style.opacity = Math.hypot(dx, dy) < 20 ? '0' : '1';
}

function selectMapLevel(level) {
  mapSelectedLevel = level;
  document.querySelectorAll('.map-level-node').forEach(node => {
    node.classList.toggle('node-selected', Number(node.dataset.level) === level);
  });
  const info = document.getElementById('map-level-info');
  const name = document.getElementById('map-level-name');
  const status = document.getElementById('map-level-status');
  const title = document.getElementById('map-level-title');
  const meta = document.getElementById('map-level-meta');
  const startBtn = document.getElementById('map-level-start');
  const enemy = enemies[level - 1];
  const state = getLevelState(level);
  if (!info || !name || !status || !title || !meta || !startBtn || !enemy) return;
  name.innerText = `Level ${level}: ${enemy.name}`;
  status.innerText = state.done
    ? 'Cleared already. You can replay it anytime.'
    : state.locked
      ? `Locked. Clear Level ${level - 1} first.`
      : 'Unlocked and ready to enter.';
  title.innerText = enemy.title;
  meta.innerText = `Status: ${getMapStatusText(level)} | Difficulty: ${getLevelDifficulty(level)}/10 | Enemy HP: ${enemy.hp} | ${enemy.description}`;
  info.classList.remove('hidden');
  startBtn.disabled = state.locked;
  startBtn.innerText = state.locked ? 'Locked' : 'Start';
  startBtn.onclick = () => {
    if (!state.locked) startLevel(level);
  };
}

function renderMap() {
  const layer = document.getElementById('map-level-layer');
  const info = document.getElementById('map-level-info');
  const viewport = document.getElementById('map-viewport');
  if (!layer || !viewport) return;
  ensureMapLayout();
  layer.innerHTML = '';
  mapLayout.forEach(point => {
    const state = getLevelState(point.level);
    const node = document.createElement('button');
    node.type = 'button';
    node.dataset.level = String(point.level);
    node.className = 'map-level-node ' + (state.done ? 'node-done' : state.locked ? 'node-locked' : 'node-available');
    node.style.left = `${point.x}px`;
    node.style.top = `${point.y}px`;
    node.setAttribute('aria-label', `Level ${point.level}: ${enemies[point.level - 1].name}`);
    node.onclick = () => selectMapLevel(point.level);
    layer.appendChild(node);
  });
  if (info) info.classList.add('hidden');
  centerMapCamera();
  updateMapGuideArrow();
  startMapLoop();
  window.setTimeout(() => viewport.focus(), 0);
}

// â”€â”€ CARD UNLOCK SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Cards in pool are sorted by mana cost so low-cost cards unlock first
const poolSortedByMana = null; // computed after pool defined

function getUnlockedCount() {
  ensureCollectionInitialized();
  return ownedCardNames.size;
}

function getAvailablePool() {
  // pool is sorted by mana cost â€” return first N
  ensureCollectionInitialized();
  return [...pool].filter(card => ownedCardNames.has(card.n));
}

function discoverCard(cardData) {
  ensureCollectionInitialized();
  if (!cardData || ownedCardNames.has(cardData.n) || discoveredCardNames.has(cardData.n)) return;
  discoveredCardNames.add(cardData.n);
  addBattleLogEntry(`New card discovered: ${cardData.n}`, 'discovery');
  flashMessage(`New card found: ${cardData.n}`);
  saveProgress();
  if (document.getElementById('deck-overlay').classList.contains('show')) renderDeckEditor();
}

function getEligibleRewardCards() {
  ensureCollectionInitialized();
  return pool.filter(card => !ownedCardNames.has(card.n) && card.m <= maxMana);
}

function pickRandomCards(cards, count) {
  const copy = [...cards];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

function getCardByName(name) {
  return pool.find(c => c.n === name) || null;
}

function getDeckCardCount(cardName) {
  return playerDeckList.filter(n => n === cardName).length;
}

function getDeckCardsByPredicate(predicate) {
  return playerDeckList
    .map(getCardByName)
    .filter(card => card && predicate(card));
}

function getDeckValidation() {
  const gods = getDeckCardsByPredicate(isGodCard).length;
  const fusions = getDeckCardsByPredicate(card => card.faction === 'orange').length;
  const fields = getDeckCardsByPredicate(card => card.faction === 'green').length;
  return {
    gods,
    fusions,
    fields,
    size: playerDeckList.length,
    sizeOk: playerDeckList.length >= DECK_MIN_CARDS && playerDeckList.length <= DECK_MAX_CARDS,
    godsOk: gods <= MAX_GODS_PER_DECK,
    fusionsOk: fusions <= MAX_FUSIONS_PER_DECK,
    fieldsOk: fields <= MAX_FIELDS_PER_DECK
  };
}

function ensureDeckInitialized() {
  ensureCollectionInitialized();
  if (playerDeckList.length >= DECK_MIN_CARDS) return;
  playerDeckList = [];
  const ownedCards = getAvailablePool().sort((a,b)=>a.m-b.m||a.n.localeCompare(b.n));
  let idx = 0;
  while (playerDeckList.length < DECK_MIN_CARDS && ownedCards.length) {
    const card = ownedCards[idx % ownedCards.length];
    const currentGods = getDeckCardsByPredicate(isGodCard).length;
    const currentFusions = getDeckCardsByPredicate(data => data.faction === 'orange').length;
    const currentFields = getDeckCardsByPredicate(data => data.faction === 'green').length;
    if (
      getDeckCardCount(card.n) < 3 &&
      (!isGodCard(card) || currentGods < MAX_GODS_PER_DECK) &&
      (card.faction !== 'orange' || currentFusions < MAX_FUSIONS_PER_DECK) &&
      (card.faction !== 'green' || currentFields < MAX_FIELDS_PER_DECK)
    ) {
      playerDeckList.push(card.n);
    }
    idx++;
    if (idx > 1200) break;
  }
}

function buildPlayerDeckFromList() {
  ensureDeckInitialized();
  const deck = playerDeckList
    .map(getCardByName)
    .filter(Boolean)
    .map(c => ({...c}));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function saveProgress() {
  const payload = {
    clearedLevels,
    ownedCards: [...ownedCardNames],
    discoveredCards: [...discoveredCardNames],
    deckList: [...playerDeckList],
    mapSpawnLevel,
    mapLayoutVersion: MAP_LAYOUT_VERSION,
    mapLayout,
    settings,
    gold,
    winStreak,
    divineVaultOpened,
    dailyQuest,
    ownedItemIds: [...ownedItemIds],
    discoveredItemIds: [...discoveredItemIds],
    discoveredRecipeIds: [...discoveredRecipeIds],
    recipeCounts,
    shopOffers
  };
  localStorage.setItem('wyrmbane_progress_v1', JSON.stringify(payload));
}

function loadProgress() {
  const starterCardsChanged = ensureCollectionInitialized();
  ensureDeckInitialized();
  const raw = localStorage.getItem('wyrmbane_progress_v1');
  if (!raw) {
    if (starterCardsChanged) saveProgress();
    return;
  }
  let progressChanged = starterCardsChanged;
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p.clearedLevels)) clearedLevels = p.clearedLevels;
    if (Array.isArray(p.ownedCards)) ownedCardNames = new Set(p.ownedCards);
    if (Array.isArray(p.discoveredCards)) discoveredCardNames = new Set(p.discoveredCards);
    if (p.mapLayoutVersion === MAP_LAYOUT_VERSION && Array.isArray(p.mapLayout) && p.mapLayout.length === enemies.length) {
      mapLayout = p.mapLayout;
    }
    if (Array.isArray(p.deckList)) {
      const clean = [];
      const copyCount = {};
      p.deckList.forEach(n => {
        const card = getCardByName(n);
        if (!card) return;
        copyCount[n] = (copyCount[n] || 0) + 1;
        if (copyCount[n] > 3 || clean.length >= DECK_MAX_CARDS) return;
        const godCount = clean.map(getCardByName).filter(isGodCard).length;
        const fusionCount = clean.map(getCardByName).filter(cardData => cardData?.faction === 'orange').length;
        const fieldCount = clean.map(getCardByName).filter(cardData => cardData?.faction === 'green').length;
        if (isGodCard(card) && godCount >= MAX_GODS_PER_DECK) return;
        if (card.faction === 'orange' && fusionCount >= MAX_FUSIONS_PER_DECK) return;
        if (card.faction === 'green' && fieldCount >= MAX_FIELDS_PER_DECK) return;
        clean.push(n);
      });
      playerDeckList = clean;
    }
    if (p.settings && typeof p.settings === 'object') settings = { ...settings, ...p.settings };
    if (typeof settings.volume === 'number' && typeof settings.bgmVolume !== 'number') settings.bgmVolume = settings.volume;
    if (typeof settings.bgmVolume !== 'number') settings.bgmVolume = 0.2;
    if (typeof settings.voiceVolume !== 'number') settings.voiceVolume = 0.45;
    if (typeof p.gold === 'number') gold = Math.max(0, Math.floor(p.gold));
    else if (typeof p.crystals === 'number') gold = Math.max(0, Math.floor(p.crystals));
    if (typeof p.winStreak === 'number') winStreak = Math.max(0, Math.floor(p.winStreak));
    if (typeof p.divineVaultOpened === 'boolean') divineVaultOpened = p.divineVaultOpened;
    if (p.dailyQuest && typeof p.dailyQuest === 'object') dailyQuest = p.dailyQuest;
    if (typeof p.mapSpawnLevel === 'number') mapSpawnLevel = p.mapSpawnLevel;
    if (Array.isArray(p.ownedItemIds)) ownedItemIds = new Set(p.ownedItemIds);
    if (Array.isArray(p.discoveredItemIds)) discoveredItemIds = new Set(p.discoveredItemIds);
    if (Array.isArray(p.discoveredRecipeIds)) discoveredRecipeIds = new Set(p.discoveredRecipeIds);
    if (p.recipeCounts && typeof p.recipeCounts === 'object') recipeCounts = { ...p.recipeCounts };
    if (Array.isArray(p.shopOffers)) shopOffers = p.shopOffers;
  } catch {}
  if (ensureCollectionInitialized()) progressChanged = true;
  ensureDeckInitialized();
  ensureDailyQuest();
  if (progressChanged) saveProgress();
}

function prepareAnteForBattle() {
  anteActiveForBattle = false;
  if (!settings.highStakes) return true;
  if (gold < ANTE_ENTRY_FEE) {
    flashMessage(`High Stakes requires ${ANTE_ENTRY_FEE} Gold.`);
    return false;
  }
  gold -= ANTE_ENTRY_FEE;
  anteActiveForBattle = true;
  saveProgress();
  refreshShopUI();
  return true;
}

function openRpsOverlay(level) {
  pendingRpsLevel = level;
  document.getElementById('rps-result').innerText = 'Choose your hand.';
  document.getElementById('rps-overlay').classList.add('show');
}

function closeRpsOverlay() {
  if (pendingRpsLevel === null) return;
  document.getElementById('rps-result').innerText = 'Choose rock, paper, or scissors to start the battle.';
}

function launchBattleWithFirstTurn(owner) {
  pendingFirstTurnOwner = owner;
  pendingRpsLevel = null;
  document.getElementById('rps-overlay').classList.remove('show');
  showScreen('screen-game');
  resetGame();
}

function resolveRpsBattle(playerChoice) {
  const enemyChoice = getRandomItemFromList(['rock', 'paper', 'scissors']);
  const resultEl = document.getElementById('rps-result');
  if (playerChoice === enemyChoice) {
    resultEl.innerText = `Tie: you both chose ${playerChoice}. Try again.`;
    addBattleLogEntry(`Rock Paper Scissors tied on ${playerChoice}.`, 'system');
    return;
  }
  const playerWon = RPS_BEATS[playerChoice] === enemyChoice;
  resultEl.innerText = `You chose ${playerChoice}. Enemy chose ${enemyChoice}. ${playerWon ? 'You go first.' : 'Enemy goes first.'}`;
  addBattleLogEntry(`Rock Paper Scissors: player chose ${playerChoice}, enemy chose ${enemyChoice}. ${playerWon ? 'Player' : 'Enemy'} goes first.`, 'system');
  setTimeout(() => launchBattleWithFirstTurn(playerWon ? 'player' : 'enemy'), 700);
}

async function executeEnemyTurnSequence() {
  enemyMana = enemyMaxMana;
  ageActivatedCards('enemy');
  const enemyDraw = drawCardForOwner('enemy');
  if (enemyDraw) enemyHand.push(enemyDraw);
  runTurnHooks('enemy', 'onStartTurn');
  updateUI();
  await enemyTurn();
  await sleep(400);
  runTurnHooks('enemy', 'onEndTurn');
  resolveQueuedHandReturns();
  refreshBoardForNextTurn('enemy');
  isPlayerTurn = true;
  startPlayerTurn();
}

// â”€â”€ START LEVEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startLevel(lvl) {
  ensureDeckInitialized();
  const validation = getDeckValidation();
  if (!validation.sizeOk) {
    flashMessage(`Deck must have ${DECK_MIN_CARDS} to ${DECK_MAX_CARDS} cards.`);
    return;
  }
  if (!validation.godsOk) {
    flashMessage(`Only ${MAX_GODS_PER_DECK} God card is allowed per deck.`);
    return;
  }
  if (!validation.fusionsOk) {
    flashMessage(`Only ${MAX_FUSIONS_PER_DECK} Orange Fusion cards are allowed per deck.`);
    return;
  }
  if (!validation.fieldsOk) {
    flashMessage(`Only ${MAX_FIELDS_PER_DECK} Green Field cards are allowed per deck.`);
    return;
  }
  if (!prepareAnteForBattle()) return;
  currentLevel = lvl; currentEnemy = enemies[lvl-1];
  closeBattleLog();
  resetBattleLog();
  if (anteActiveForBattle) addBattleLogEntry(`High Stakes ante paid: ${ANTE_ENTRY_FEE} Gold. Winner takes 400 Gold.`, 'system');
  addBattleLogEntry(`Entering Level ${lvl}: ${currentEnemy.name}`, 'system');
  openRpsOverlay(lvl);
}
function retryLevel() {
  closeBattleLog();
  document.getElementById('gameover-overlay').classList.remove('show');
  if (!prepareAnteForBattle()) {
    document.getElementById('gameover-overlay').classList.add('show');
    return;
  }
  resetBattleLog();
  if (anteActiveForBattle) addBattleLogEntry(`High Stakes ante paid: ${ANTE_ENTRY_FEE} Gold. Winner takes 400 Gold.`, 'system');
  addBattleLogEntry(`Retrying Level ${currentLevel}: ${currentEnemy.name}`, 'system');
  openRpsOverlay(currentLevel);
}
function goToMap()    { closeBattleLog(); document.getElementById('gameover-overlay').classList.remove('show'); showScreen('screen-map'); }

function resetGame() {
  ensureCollectionInitialized();
  clearInterval(turnTimer); timerPaused = false;
  document.getElementById('enemy-grid').innerHTML  = '';
  document.getElementById('player-grid').innerHTML = '';
  document.getElementById('hand').innerHTML = '';
  playerDeck=[]; enemyDeck=[]; enemyHand=[]; playerGrave=[]; enemyGrave=[]; selectedCard=null;
  playerCardsPlayedThisTurn = 0;
  returningCardsAtEndOfTurn = { player: [], enemy: [] };
  playerDeckFatigue = 0;
  enemyDeckFatigue = 0;

  const lvl = currentLevel;
  playerHP = 20;
  enemyHP  = currentEnemy.hp; enemyMaxHP = currentEnemy.hp;
  // Player mana progression now follows the highest cleared level, not the selected stage.
  maxMana = getPlayerProgressMana(); mana = maxMana;
  // Enemy always gets +4 mana over the player to access higher-cost cards
  enemyMaxMana = maxMana + 4; enemyMana = enemyMaxMana;

  // Build deck from available pool (mana-appropriate cards)
  const avail = getAvailablePool();
  playerDeck = buildPlayerDeckFromList();
  enemyDeck  = buildDeck(30, avail);
  for (let i = 0; i < 5; i++) {
    const enemyCard = drawCardForOwner('enemy', false, false);
    if (enemyCard) enemyHand.push(enemyCard);
  }

  buildArena();
  for (let i = 0; i < 5; i++) drawCard(false, false);

  document.getElementById('enemy-name-label').innerText = currentEnemy.name;
  document.getElementById('enemy-mana-val').innerText = enemyMaxMana;
  document.getElementById('enemy-hp-val').innerText = enemyHP;
  document.getElementById('enemy-hp-bar-fill').style.width = '100%';

  isPlayerTurn = pendingFirstTurnOwner !== 'enemy';
  document.getElementById('end-btn').disabled = !isPlayerTurn;
  updateUI();
  updateCardActionBar();
  if (isPlayerTurn) {
    if (settings.timerOn) startTurnTimer();
    showTurnBanner('YOUR TURN', false);
  } else {
    showTurnBanner('ENEMY TURN', true);
    setTimeout(() => executeEnemyTurnSequence(), 800);
  }
  pendingFirstTurnOwner = 'player';
}

// â”€â”€ CARD POOL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const factionOrder = ['red','blue','green','cyan','purple','pink','yellow','orange'];
const factionBorder = { red:'#c0392b', blue:'#2980b9', green:'#27ae60', cyan:'#16a085', purple:'#8e44ad', pink:'#e91e8c', yellow:'#f1c40f', orange:'#e67e22' };

const pool = [
  // RED
  { n:'Squire of Cinders',          m:1, a:1, h:1,  img:'public/red/Squire of Cinders.png',            faction:'red',  ability:'Bravery: Gains +1 ATK if attacking a unit with higher HP.',                     lore:'Every great knight was once someone\'s errand boy. This one grew up on a volcano.\n\nToo stubborn to notice he was supposed to die.' },
  { n:'Blood-Bound Duelist',        m:2, a:2, h:2,  img:'public/red/Blood-Bound Duelist.png',          faction:'red',  ability:'Parry: The first time this unit is attacked each turn, it takes 0 damage.',       lore:'She swore a blood oath to her blade the night she lost her partner.\n\nThe hand that holds it never shakes.' },
  { n:'Flame-Wielder Mage',         m:3, a:3, h:1,  img:'public/red/Flame-Wielder Mage.png',           faction:'red',  ability:'Fireball: When played, deal 1 damage to any unit in an adjacent lane.',           lore:'Magic school expelled him for reckless experimentation.\n\nHis lecture notes are still on fire.' },
  { n:'Ironclad Sentinel',          m:4, a:2, h:5,  img:'public/red/Ironclad Sentinel.png',            faction:'red',  ability:'Guardian: Opponents in this lane must attack this card first.',                    lore:'They poured the armour while he was still standing in it.\n\nHe hasn\'t taken it off since.' },
  { n:'Dragon-Slayer Knight',       m:5, a:4, h:4,  img:'public/red/Dragon-Slayer Knight.png',         faction:'red',  ability:'Slayer: Deals double damage to units with 6+ HP.',                               lore:'He faced the wyrm alone from dusk to dawn.\n\nNow known as the Wyrm-Bane, he seeks the strongest monsters.' },
  { n:'Stone-Crusher Catapult',     m:5, a:5, h:2,  img:'public/red/Stone-Crusher Catapult.png',       faction:'red',  ability:'Siege: Can attack Building cards directly from the Back Area.',                   lore:'The enemy fortress said nothing - because it no longer had walls.\n\nPoint made.' },
  { n:'Phoenix Paladin',            m:6, a:3, h:3,  img:'public/red/Phoenix Paladin.png',              faction:'red',  ability:'Rebirth: When destroyed, return to hand (costs +2 MP next play).',               lore:'She\'s been killed in battle exactly seven times. Each time she wakes up angrier.' },
  { n:'Highland War-Chieftain',     m:7, a:5, h:6,  img:'public/red/Highland War-Chieftain.png',       faction:'red',  ability:'War Cry: All other Red units on your board gain +1 ATK permanently.',            lore:'He doesn\'t give speeches. He gives one word.\n\nEvery enemy learns what it means - very briefly.' },
  { n:'General of the Ravaged Sun', m:8, a:6, h:7,  img:'public/red/General of the Ravaged Sun.png',   faction:'red',  ability:'Tactician: Move one unit to an adjacent lane for 0 Mana once per turn.',          lore:'She lost exactly one battle - on purpose, to trap the enemy\'s reserves.' },
  // BLUE
  { n:'Spore Scout',         m:1, a:1, h:2,  color:'#0a3a5a', faction:'blue',   ability:'Vision: Reveal one face-down Yellow Trap in this lane or an adjacent one.', lore:'Its spores map hidden danger before roots or soldiers ever arrive.' },
  { n:'Thorned Vine',        m:2, a:2, h:1,  color:'#1a4a2a', faction:'blue',   ability:'Barbed: Any unit attacking a card in this lane takes 1 recoil DMG.',       lore:'The lane itself learns to bite through every stem it spreads.' },
  { n:'Snap-Trap Lily',      m:3, a:1, h:3,  color:'#2a5a1a', faction:'blue',   ability:'Slow-Down: The next enemy unit played in this lane cannot attack for 1 turn.', lore:'Its petals close like a warning that came too late.' },
  { n:'Ironwood Root',       m:4, a:0, h:7,  color:'#1a3a1a', faction:'blue',   ability:'Wall-Support: While in the Mid Area, the Front Area unit in this lane gains +3 HP.', lore:'It does not move, but entire lanes learn to lean on it.' },
  { n:'Blue-Leaf Alchemist', m:5, a:2, h:4,  color:'#0a2a4a', faction:'blue',   ability:'Photosynthesis: At the start of your turn, if this card is alive, gain +1 extra MP.', lore:'She brews mana the way others brew tea.' },
  { n:'Whispering Willow',   m:5, a:3, h:5,  color:'#1a4a3a', faction:'blue',   ability:'Clarity: While this is active, your Deactivated units in this lane still use 50% of their ATK.', lore:'Even silenced branches keep teaching the lane how to fight.' },
  { n:'Ancient Treant',      m:7, a:5, h:6,  color:'#0a3a0a', faction:'blue',   ability:'Root Network: You may move damage from your LP to this card instead, up to 3 DMG per turn.', lore:'It answers for the forest first and itself second.' },
  { n:'Lotus Queen',         m:8, a:4, h:8,  color:'#1a2a5a', faction:'blue',   ability:'Bloom: Reactivate one card in this lane every turn for 0 cost.',           lore:'Every opening petal is a command for the lane to wake up.' },
  { n:'Great Forest Heart',  m:9, a:6, h:10, color:'#1f2f6d', faction:'blue', rarity:'god', ability:'Eternal Spring: All friendly units on the field regain 2 HP at the end of every turn.', lore:'The whole battlefield starts to breathe in time with it.' },
  // GREEN
  { n:'The Moss-Guard',      m:1, a:0, h:4,  img:'public/green/The Moss-Guard.png',     faction:'green',  ability:'Mist Rule: Units in this lane cannot be targeted by Pink (Spells).',       lore:'Fog gathers around it like the lane signed a privacy oath.' },
  { n:'Vine-Choked Gate',    m:2, a:1, h:5,  img:'public/green/Vine-Choked Gate.png',   faction:'green',  ability:'Thorn Rule: Any unit entering this lane takes 1 DMG.',                      lore:'The gate remembers every step taken through it and punishes all of them.' },
  { n:'Emerald Totem',       m:3, a:0, h:6,  img:'public/green/Emerald Totem.png',      faction:'green',  ability:'Balance Rule: In this lane, all units\' ATK becomes equal to their HP.',   lore:'It settles every argument by making stats obey the same truth.' },
  { n:'Ancient Ruins',       m:4, a:0, h:8,  img:'public/green/Ancient Ruins.png',      faction:'green',  ability:'Archeology Rule: Yellow Traps in this lane stay active even after being triggered.', lore:'Old stone teaches new traps how to linger.' },
  { n:'Verdant Forge',       m:5, a:2, h:5,  img:'public/green/Verdant Forge',          faction:'green',  ability:'Hardwood Rule: All units in this lane take -1 DMG from physical attacks.', lore:'The lane hardens like living armor around everything in it.' },
  { n:'Stone-Watcher Idol',  m:6, a:4, h:6,  img:'public/green/Stone-Watcher Idol.png', faction:'green',  ability:'Stasis Rule: Units in this lane cannot use End of Turn abilities.',        lore:'It freezes timing itself, not just the things caught inside it.' },
  { n:'Hidden Grove',        m:7, a:0, h:10, img:'public/green/Hidden Grove.png',       faction:'green',  ability:'Cover Rule: Units in the Back Area of this lane cannot be targeted.',       lore:'Distance and leaves become the same kind of protection.' },
  { n:'Great Earth Engine',  m:8, a:5, h:8,  img:'public/green/Great Earth Engine.png', faction:'green',  ability:'Gravity Rule: Units cannot leave this lane once they enter it.',           lore:'Once it locks onto a lane, even momentum obeys.' },
  { n:'Yggdrasil Pillar',    m:9, a:7, h:12, img:'public/green/Yggdrasil Pillar.png',   faction:'green',  ability:'Eternal Rule: Cards in this lane cannot be destroyed by Spells, only by DMG.', lore:'The lane survives by becoming too fundamental to erase.' },
  // CYAN
  { n:'Larva Scout',         m:1, a:1, h:1,  color:'#004a4a', faction:'cyan',   ability:'Acidic Touch: Any Building this unit attacks has its Warm-up timer reset to 0.', lore:'It treats architecture like food and countdowns like invitations.' },
  { n:'Noxious Wasp',        m:2, a:2, h:1,  color:'#0a3a4a', faction:'cyan',   ability:'Evasion: This creature cannot be targeted by Reaction effects (Yellow Traps).', lore:'It slips between cause and consequence before traps can close.' },
  { n:'Plague Rat',          m:3, a:1, h:3,  color:'#1a4a4a', faction:'cyan',   ability:'Contagion: When this unit is destroyed, the killer becomes Deactivated for 2 turns.', lore:'It dies like a threat making appointments.' },
  { n:'Acidic Slime',        m:4, a:2, h:4,  color:'#2a5a4a', faction:'cyan',   ability:'Corrode: Attacks against Buildings or Plants deal double damage.',         lore:'It was born with very strong opinions about structures and roots.' },
  { n:'Deep-Sea Terror',     m:5, a:4, h:5,  color:'#003a5a', faction:'cyan',   ability:'Pressure Aura: While on the field, all enemy units in this lane lose 1 ATK.', lore:'Even shallow water feels deep when it arrives.' },
  { n:'Chimeric Beast',      m:6, a:5, h:5,  color:'#1a3a5a', faction:'cyan',   ability:'Adaptation: This card can choose to be treated as Red or Blue type for synergy.', lore:'It evolves according to whatever alliance would help it hunt best.' },
  { n:'Hive Queen',          m:7, a:3, h:8,  color:'#2a4a5a', faction:'cyan',   ability:'Call of the Swarm: As long as she exists, all other Cyan Monsters cost -1 MP (Min 1).', lore:'Every order she gives sounds like hunger finding a budget.' },
  { n:'Colossal Behemoth',   m:8, a:7, h:9,  color:'#003a4a', faction:'cyan',   ability:'Siege Engine: This unit can attack Buildings in the Back Area even if there are Troops in the Front.', lore:'It was built by nature for one purpose: skip the line, crush the problem.' },
  { n:'Hydra of the Abyss',  m:9, a:5, h:12, color:'#b34a00', faction:'cyan', rarity:'god', ability:'Endless Maw: Every time this unit destroys a card, it gains +2 HP and Reactivates itself.', lore:'It eats until the turn itself gives up and starts again.' },
  // PURPLE
  { n:'Leaching Pillar',     m:1, a:0, h:4,  color:'#3a005a', faction:'purple', ability:'Siphon: Pay 1 MP to Deactivate a Level 1 enemy. Requires 1 turn of setup.', lore:'It drains momentum first and blood second.' },
  { n:'Dark Library',        m:2, a:0, h:5,  color:'#2a0a4a', faction:'purple', ability:'Forbidden Knowledge: All Spells in hand cost 0 MP this turn OR reactivate 1-4 Spells from the Grave for 0 MP. Warm-up: 2. Cooldown: 3.', lore:'Every shelf is a shortcut with consequences bound in leather.' },
  { n:'Cursed Obelisk',      m:3, a:2, h:6,  color:'#4a0a5a', faction:'purple', ability:'Vampiric Law: Set a Lane Rule. Units here cannot be healed, and gained HP becomes True Damage instead. Warm-up: 3. Permanent.', lore:'It rewrites mercy as arithmetic.' },
  { n:'Void Gate',           m:4, a:0, h:7,  color:'#1a005a', faction:'purple', ability:'Mass Summons: After 3 turns, activate to summon two 2/2 Monsters to the Front Area for 0 MP.', lore:'It never opens onto something small on purpose.' },
  { n:'The Dark Hospital',   m:5, a:0, h:8,  color:'#2a0a3a', faction:'purple', ability:'Total Purge: Remove all status effects from your cards and heal them to Full HP. 3-turn cooldown.', lore:'Recovery is guaranteed. So is the bill.' },
  { n:'Sacrificial Altar',   m:6, a:0, h:8,  color:'#5a0a2a', faction:'purple', ability:'Soul Exchange: Destroy 1 of your units and permanently Deactivate 2 enemy units in this lane.', lore:'It is a fair trade only if you stop counting souls.' },
  { n:'Tower of Whispers',   m:7, a:0, h:10, color:'#3a002a', faction:'purple', ability:'Signal Jam: This lane becomes Invisible and cannot be targeted by Spells or Abilities for 2 turns. Warm-up: 2. Cooldown: 2.', lore:'Silence is just another form of range control.' },
  { n:'Necromancer\'s Keep', m:8, a:0, h:12, color:'#2a0a5a', faction:'purple', ability:'Specific Resurrection: Choose one type and reactivate all cards of that type from your Grave to any empty lane. Warm-up: 4. One-time Use.', lore:'The dead return only after paperwork is approved.' },
  { n:'The Abyss Throne',    m:9, a:5, h:15, color:'#24002f', faction:'purple', rarity:'god', ability:'God\'s Decree: Set a Supreme Law. The opponent must pay 2x MP for every card played in this lane. Warm-up: 5. Duration: 1 turn.', lore:'It does not tax ambition. It taxes the attempt.' },
  // PINK
  { n:'Mind Flick',          m:1, a:1, h:1,  color:'#5a1a4a', faction:'pink',   ability:'Peek: Look at the top 3 cards of your deck or the opponent\'s deck.',    lore:'A tiny spell that turns hidden plans into public weather.' },
  { n:'Dark Surge',          m:2, a:3, h:1,  color:'#4a0a4a', faction:'pink',   ability:'Momentum: Choose a unit. It can attack twice this turn, but its ATK is halved for both attacks.', lore:'It lends speed by quietly borrowing damage.' },
  { n:'Amnesia',             m:3, a:2, h:1,  color:'#3a0a3a', faction:'pink',   ability:'Area Shift: Move a unit from the Front Area to the Back Area, or vice versa.', lore:'Position is memory with better armor.' },
  { n:'Gravity Well',        m:4, a:2, h:2,  color:'#5a0a5a', faction:'pink',   ability:'Lane Slide: Move an enemy unit to an adjacent lane, or move one of your units to any lane.', lore:'It does not ask where you belong. It decides.' },
  { n:'Shadow Copy',         m:5, a:2, h:3,  color:'#4a1a5a', faction:'pink',   ability:'Echo: Choose a unit with 3 MP or less. Create a temporary copy that disappears at end of turn.', lore:'Copies are easiest to trust right before they vanish.' },
  { n:'Psychic Scream',      m:6, a:3, h:2,  color:'#6a0a4a', faction:'pink',   ability:'Disorder: Choose a lane. Swap the ATK and HP of every unit there for 1 turn.', lore:'The lane forgets what numbers were supposed to mean.' },
  { n:'Possession',          m:7, a:4, h:2,  color:'#5a004a', faction:'pink',   ability:'Bargain: Take control of an enemy unit, but its owner draws 2 cards.',   lore:'You get the body. They get the leverage.' },
  { n:'Memory Wipe',         m:8, a:3, h:3,  color:'#3a003a', faction:'pink',   ability:'Deactivate: Every card on the board loses buffs, debuffs, and Lane Rules and becomes inactive at base stats.', lore:'After it resolves, the battlefield looks normal and plays wrong.' },
  { n:'The Void',            m:9, a:4, h:4,  color:'#d9c65a', faction:'pink', ability:'Pure Exchange: Choose 1 card on your board and 1 on the opponent\'s. Both return to hand cleared of all damage, buffs, and status effects.', lore:'It does not destroy. It resets the argument so completely that both sides forget who was winning.' },
  // YELLOW
  { n:'Flash Powder Trap',   m:1, a:0, h:1,  color:'#a88600', faction:'yellow', ability:'Sand-Pit Rule (Area): While active, units in this lane cannot be moved to other lanes by any card effect or ability. They are stuck here.', lore:'A burst of blinding powder settles into a lane-wide snare that turns escape into a rumor.' },
  { n:'Bounty Hunter\'s Net', m:2, a:0, h:2, color:'#b38f16', faction:'yellow', ability:'Mirror Rule (Reflect): When a unit in this lane is attacked, the attacker takes damage equal to 50% of their own ATK.', lore:'The net does not care who started the fight. It only cares who swings first.' },
  { n:'Alchemist\'s Fire',   m:3, a:0, h:1,  color:'#c17700', faction:'yellow', ability:'Flash Rule (Reaction): When an enemy attacks, reduce that unit\'s ATK to 0 for the rest of the turn.', lore:'The flames burn pride more efficiently than flesh.' },
  { n:'Golden Handcuffs',    m:4, a:0, h:3,  color:'#c9a227', faction:'yellow', ability:'Grid Rule (Area): Any player who plays a card into this lane must immediately discard 1 card from their hand.', lore:'Every summon here is taxed by a kingdom that never forgot how to collect debts.' },
  { n:'Mirage Trap',         m:5, a:0, h:3,  color:'#d8b11e', faction:'yellow', ability:'Weight Rule (Area): All units in this lane have their HP increased by 3, but their ATK decreased by 2.', lore:'Heat haze thickens into a false paradise where strength grows slow and heavy.' },
  { n:'Holy Barbs',          m:6, a:0, h:4,  color:'#e0bf3f', faction:'yellow', ability:'Locked Rule (Reaction): When an enemy is summoned here, it is Locked and cannot attack for 2 turns.', lore:'Sanctified thorns punish trespass with stillness instead of mercy.' },
  { n:'Sunbeam Seal',        m:7, a:0, h:4,  color:'#e5c84d', faction:'yellow', ability:'Pressure Rule (Area): If a lane has more than 2 units, any new unit played there is destroyed instantly.', lore:'The light judges crowded battlefields and finds them unworthy of one more body.' },
  { n:'Treasure Chest Bait', m:8, a:0, h:5,  color:'#f0cf62', faction:'yellow', ability:'Academy Rule (Area): You can play the Inside face of Red/Blue cards in this lane for 0 MP.', lore:'Greed draws the clever and the foolish to the same spot. The trap enjoys both equally.' },
  { n:'The King\'s Justice', m:9, a:0, h:6,  color:'#f6da77', faction:'yellow', rarity:'mythic', ability:'Judgment Rule (Reaction): If you take direct LP damage, destroy all enemy units in the attacking lane.', lore:'The sentence is always swift, final, and delivered in the king\'s voice whether he is present or not.' },
  // ORANGE
  { n:'Blood Knight',        m:4, a:3, h:4, color:'#b55400', faction:'orange', ability:'Red + Red Fusion: Every time this unit kills an enemy, it gains +1 ATK and +1 HP.', lore:'Fusion Formula: MP = Avg + 1 | ATK = Sum x 0.75 | HP = Sum - 2. Chaos d6 can turn it Weak or Supreme.' },
  { n:'Thorn Lancer',        m:4, a:3, h:4, color:'#bc5f00', faction:'orange', ability:'Red + Blue Fusion: Piercing. When attacking, it heals the unit directly behind it for 2 HP.', lore:'A knight rooted in war and bloom, sharpened by two very different forms of survival.' },
  { n:'Beast Rider',         m:4, a:4, h:4, color:'#c26700', faction:'orange', ability:'Red + Cyan Fusion: Can move to an adjacent lane and attack in the same turn.', lore:'Its mount is part instinct, part nightmare, and entirely faster than reason.' },
  { n:'Siege Golem',         m:5, a:4, h:6, color:'#c96d00', faction:'orange', ability:'Red + Purple Fusion: Immune to Manual Activations of Purple buildings; deals double damage to them.', lore:'Built to end fortresses by understanding exactly how they think.' },
  { n:'Warlord',             m:5, a:5, h:5, color:'#ce7200', faction:'orange', ability:'Red + Green Fusion: Area Rule: All other units in this lane gain +1 ATK.', lore:'Even fused power kneels to command when command is this absolute.' },
  { n:'Counter-Striker',     m:5, a:4, h:5, color:'#d27700', faction:'orange', ability:'Red + Yellow Fusion: If an enemy attacks this lane, this card strikes first.', lore:'The trap and the soldier agreed on one thing: the enemy should regret initiative.' },
  { n:'Spellblade',          m:5, a:4, h:4, color:'#d67c00', faction:'orange', ability:'Red + Pink Fusion: When played, you may cast a 1-3 MP Pink spell for 0 cost.', lore:'Steel etched with shortcuts into the parts of magic that should stay expensive.' },
  { n:'Root Hive',           m:4, a:2, h:6, color:'#db8200', faction:'orange', ability:'Blue + Blue Fusion: At the start of turn, create a 1/1 Vine token in an empty area.', lore:'A colony disguised as a garden, patient enough to win by becoming everywhere.' },
  { n:'Bio-Titan',           m:5, a:4, h:7, color:'#df8700', faction:'orange', ability:'Blue + Cyan Fusion: High HP. When it takes damage, the attacker is Deactivated for 1 turn.', lore:'It treats pain as a negotiation and always counters with worse terms.' },
  { n:'Living Wall',         m:5, a:1, h:8, color:'#e28b08', faction:'orange', ability:'Blue + Purple Fusion: Cannot attack, but it Reactivates one adjacent card every turn for 0 MP.', lore:'Part battlement, part heartbeat, all refusal.' },
  { n:'Garden Oasis',        m:5, a:2, h:6, color:'#e59010', faction:'orange', ability:'Blue + Green Fusion: Area Rule: No units in this lane can be destroyed by Spells (Pink).', lore:'Where growth becomes sanctuary and sanctuary dares magic to try harder.' },
  { n:'Toxic Spore',         m:5, a:3, h:5, color:'#e89418', faction:'orange', ability:'Blue + Yellow Fusion: When destroyed, all enemy units in this lane lose 2 HP and 2 ATK.', lore:'It dies the way mushrooms love best: by making everything nearby much worse.' },
  { n:'Mana Orchid',         m:5, a:2, h:5, color:'#eb9820', faction:'orange', ability:'Blue + Pink Fusion: While on board, your Max MP increases by 2.', lore:'A flower that blooms in the shape of a loophole.' },
  { n:'Chimera',             m:6, a:5, h:6, color:'#ee9d28', faction:'orange', ability:'Cyan + Cyan Fusion: Choose two Innate Traits from any Monster cards in your graveyard; it gains both.', lore:'No stable taxonomy survives first contact with this thing.' },
  { n:'Iron Beast',          m:6, a:5, h:7, color:'#f0a230', faction:'orange', ability:'Cyan + Purple Fusion: This unit\'s ATK is equal to the HP of the highest Building you control.', lore:'It hunts with borrowed architecture and bites with reinforced arithmetic.' },
  { n:'Apex Predator',       m:6, a:6, h:6, color:'#f2a738', faction:'orange', ability:'Cyan + Green Fusion: Area Rule: The opponent cannot summon units with less than 3 MP in this lane.', lore:'The food chain notices when something arrives at the top and decides to stay there.' },
  { n:'Ambush Stalker',      m:6, a:5, h:5, color:'#f4ad41', faction:'orange', ability:'Cyan + Yellow Fusion: Stays Invisible (Face-down) until it attacks; that first attack deals 2x damage.', lore:'It lets the trap introduce it, then handles the screaming personally.' },
  { n:'Void Horror',         m:6, a:5, h:6, color:'#f5b34a', faction:'orange', ability:'Cyan + Pink Fusion: When this unit attacks, the target is Deactivated and moved to the Back Area.', lore:'Its touch edits placement, priority, and dignity in one motion.' },
  { n:'Iron Citadel',        m:6, a:3, h:9, color:'#f7b954', faction:'orange', ability:'Purple + Purple Fusion: Manual Activation: Pay 3 MP to make your LP invincible for 1 turn. Warm-up: 3.', lore:'A fortress that learned prayer and billable hours at the same time.' },
  { n:'Command Post',        m:6, a:3, h:7, color:'#f8bf5e', faction:'orange', ability:'Purple + Green Fusion: Area Rule: You may use your Manual Activations one turn earlier than required.', lore:'Its entire purpose is to make delayed power arrive right now.' },
  { n:'Automated Turret',    m:6, a:4, h:6, color:'#f9c468', faction:'orange', ability:'Purple + Yellow Fusion: Reaction: When an enemy enters the lane, this building deals 2 DMG to them.', lore:'The machine was told to watch the lane. It interpreted that as a threat assessment.' },
  { n:'Arcane Forge',        m:6, a:4, h:6, color:'#f9ca73', faction:'orange', ability:'Purple + Pink Fusion: Whenever you play a Spell, this card heals 2 HP and gains +1 ATK.', lore:'Every cast becomes fuel, every fuel source becomes a weapon.' },
  { n:'Overgrowth',          m:6, a:2, h:8, color:'#fad07d', faction:'orange', ability:'Green + Green Fusion: Area Rule: All cards in this lane gain +2 HP every turn.', lore:'The lane stops being a battlefield and starts being eaten by tomorrow.' },
  { n:'Nature\'s Jury',      m:6, a:2, h:7, color:'#fbd587', faction:'orange', ability:'Green + Yellow Fusion: Area Rule: If the opponent plays a card here, they must discard 1 card from their hand.', lore:'The wild has convened. Its verdict is always paid in resources.' },
  { n:'Spirit Gate',         m:6, a:3, h:7, color:'#fcdb92', faction:'orange', ability:'Green + Pink Fusion: Area Rule: Once per turn, you can swap a unit in this lane with one from your hand.', lore:'It opens where roots meet thought and traffic becomes optional.' },
  { n:'Void Trap',           m:6, a:3, h:5, color:'#fde09c', faction:'orange', ability:'Yellow + Yellow Fusion: Reaction: When triggered, the attacking unit and this card are both removed from the game.', lore:'No explosion, no debris, no witnesses. Just absence and a very quiet lane.' },
  { n:'Phantom Echo',        m:6, a:3, h:5, color:'#fde5a8', faction:'orange', ability:'Yellow + Pink Fusion: Reaction: When an enemy attacks, create a copy of the attacker to block the hit.', lore:'The best defense is making the enemy explain themselves to themselves.' },
  { n:'Astral Echo',         m:6, a:3, h:5, color:'#feebb4', faction:'orange', ability:'Pink + Pink Fusion: When played, choose a Spell in your grave; trigger its effect every turn for 0 MP.', lore:'An echo so clean it mistakes repetition for divinity.' }
];

// â”€â”€ SORT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function sortCards(cards, order) {
  const fi = f => factionOrder.indexOf(f);
  return [...cards].sort((a,b) => {
    switch(order) {
      case 'name':   return a.n.localeCompare(b.n);
      case 'mana':   return a.m - b.m;
      case 'atk':    return b.a - a.a;
      case 'hp':     return b.h - a.h;
      default:       return fi(a.faction) - fi(b.faction);
    }
  });
}

// â”€â”€ DECK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildDeck(size = 30, sourcePool = pool) {
  const deck = [];
  for (let i = 0; i < size; i++) deck.push({...sourcePool[i % sourcePool.length]});
  for (let i = deck.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]];
  }
  return deck;
}

function getCurrentDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getHighestClearedLevel() {
  return clearedLevels.length ? Math.max(...clearedLevels) : 0;
}

function getPlayerProgressTier() {
  return Math.max(1, getHighestClearedLevel());
}

function getPlayerProgressMana() {
  return Math.min(6 + (getPlayerProgressTier() - 1) * 2, 26);
}

function ensureDailyQuest() {
  const today = getCurrentDayKey();
  if (dailyQuest && dailyQuest.date === today) return;
  const quests = [
    { type: 'summon_blue', goal: 3, text: 'Summon 3 Blue cards.' },
    { type: 'summon_green', goal: 3, text: 'Summon 3 Green cards.' },
    { type: 'activate_effects', goal: 4, text: 'Use 4 Pink effect cards.' },
    { type: 'trigger_traps', goal: 2, text: 'Trigger 2 Yellow traps.' },
    { type: 'win_matches', goal: 2, text: 'Win 2 matches.' }
  ];
  dailyQuest = { ...quests[Math.floor(Math.random() * quests.length)], progress: 0, claimed: false, date: today };
}

function incrementDailyQuest(type, amount = 1) {
  ensureDailyQuest();
  if (!dailyQuest || dailyQuest.claimed || dailyQuest.type !== type) return;
  dailyQuest.progress = Math.min(dailyQuest.goal, (dailyQuest.progress || 0) + amount);
  saveProgress();
  refreshShopUI();
}

function claimDailyQuest() {
  ensureDailyQuest();
  if (!dailyQuest || dailyQuest.claimed || dailyQuest.progress < dailyQuest.goal) return;
  dailyQuest.claimed = true;
  gold += DAILY_QUEST_REWARD;
  addBattleLogEntry(`Daily quest completed: ${dailyQuest.text} (+${DAILY_QUEST_REWARD} Gold)`, 'reward');
  flashMessage(`+${DAILY_QUEST_REWARD} Gold from your daily quest.`);
  saveProgress();
  refreshShopUI();
}

function getRandomItemFromList(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getItemDef(itemId) {
  return ITEM_DEFS.find(item => item.id === itemId) || null;
}

function getRecipeDef(recipeId) {
  return RECIPE_DEFS.find(recipe => recipe.id === recipeId) || null;
}

function getInventoryQuantity(entry) {
  if (entry.type === 'item') return ownedItemIds.has(entry.id) ? 1 : 0;
  return recipeCounts[entry.id] || 0;
}

function ensureShopOffers() {
  if (shopOffers.length) return;
  const recipes = pickRandomCards(RECIPE_DEFS, Math.min(3, RECIPE_DEFS.length)).map(recipe => ({
    type: 'recipe',
    id: recipe.id,
    price: Math.max(120, Math.round(CRAFT_COSTS[recipe.rarity] * 0.45))
  }));
  const items = pickRandomCards(ITEM_DEFS, Math.min(3, ITEM_DEFS.length)).map(item => ({
    type: 'item',
    id: item.id,
    price: Math.max(250, Math.round(CRAFT_COSTS[item.rarity] * 0.9))
  }));
  shopOffers = [...recipes, ...items];
}

function getSellPrice(type, id) {
  const def = type === 'item' ? getItemDef(id) : getRecipeDef(id);
  if (!def) return 0;
  const base = CRAFT_COSTS[def.rarity] || 100;
  return type === 'item' ? Math.max(80, Math.round(base * 0.45)) : Math.max(40, Math.round(base * 0.2));
}

function grantRecipeDrop() {
  const count = Math.random() < 0.5 ? 1 : 2;
  const drops = pickRandomCards(RECIPE_DEFS, count);
  if (!drops.length) return;
  drops.forEach(recipe => {
    recipeCounts[recipe.id] = (recipeCounts[recipe.id] || 0) + 1;
    discoveredRecipeIds.add(recipe.id);
  });
  addBattleLogEntry(`Recipes found: ${drops.map(recipe => recipe.name).join(', ')}`, 'reward');
  flashMessage(`Recipes found: ${drops.map(recipe => recipe.name).join(', ')}`);
}

function getInventoryEntries() {
  return [
    ...ITEM_DEFS.map(item => ({ ...item, type: 'item' })),
    ...RECIPE_DEFS.map(recipe => ({ ...recipe, type: 'recipe' }))
  ];
}

function openInventoryModal() {
  pauseTimer();
  renderInventoryModal();
  document.getElementById('inventory-overlay').classList.add('show');
}

function closeInventoryModal() {
  document.getElementById('inventory-overlay').classList.remove('show');
  resumeTimer();
}

function selectInventoryEntry(type, id) {
  selectedInventoryEntry = { type, id };
  renderInventoryModal();
}

function renderInventoryModal() {
  const container = document.getElementById('inventory-modal-cards');
  if (!container) return;
  ensureCollectionInitialized();
  container.innerHTML = '';
  const typeFilter = document.getElementById('inventory-type-filter').value;
  const rarityFilter = document.getElementById('inventory-rarity-filter').value;
  const ownedFilter = document.getElementById('inventory-owned-filter').value;
  const recipeCountFilter = Number(document.getElementById('inventory-recipe-count-filter').value || 0);
  const entries = getInventoryEntries().filter(entry => {
    if (typeFilter === 'items' && entry.type !== 'item') return false;
    if (typeFilter === 'recipes' && entry.type !== 'recipe') return false;
    if (rarityFilter !== 'all' && entry.rarity !== rarityFilter) return false;
    const qty = getInventoryQuantity(entry);
    const owned = qty > 0;
    if (ownedFilter === 'owned' && !owned) return false;
    if (ownedFilter === 'unowned' && owned) return false;
    if (entry.type === 'recipe' && recipeCountFilter > 0 && qty < recipeCountFilter) return false;
    return true;
  }).sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity) || a.name.localeCompare(b.name));
  const subtitle = document.getElementById('inventory-modal-subtitle');
  if (subtitle) subtitle.innerText = `Gold ${gold} | Items ${ownedItemIds.size}/${ITEM_DEFS.length} | Recipes ${Object.values(recipeCounts).reduce((sum, value) => sum + value, 0)} total`;
  entries.forEach(entry => {
    const qty = getInventoryQuantity(entry);
    const discovered = entry.type === 'item' ? discoveredItemIds.has(entry.id) || ownedItemIds.has(entry.id) : discoveredRecipeIds.has(entry.id) || qty > 0;
    const wrap = document.createElement('div');
    wrap.className = 'inventory-entry' + (selectedInventoryEntry?.type === entry.type && selectedInventoryEntry?.id === entry.id ? ' selected' : '');
    wrap.onclick = () => selectInventoryEntry(entry.type, entry.id);
    wrap.oncontextmenu = (event) => {
      event.preventDefault();
      openInspect({
        n: discovered ? entry.name : '???',
        m: 0,
        a: 0,
        h: qty,
        faction: entry.type === 'item' ? 'orange' : 'purple',
        color: entry.type === 'item' ? '#3b2a18' : '#241738',
        ability: discovered ? entry.description : 'Unknown collectible.',
        lore: discovered ? `${RARITY_LABELS[entry.rarity]} ${entry.type}.` : 'You have not discovered this collectible yet.'
      });
    };
    const card = document.createElement('div');
    card.className = 'inventory-card' + (!discovered ? ' unknown' : '');
    if (discovered) {
      const img = document.createElement('img');
      img.src = entry.icon;
      img.alt = entry.name;
      card.appendChild(img);
    }
    const count = document.createElement('div');
    count.className = 'inventory-card-count';
    count.innerText = String(qty);
    card.appendChild(count);
    const name = document.createElement('div');
    name.className = 'inventory-entry-name';
    name.innerText = discovered ? entry.name : '???';
    const meta = document.createElement('div');
    meta.className = 'inventory-entry-meta';
    meta.innerText = `${RARITY_LABELS[entry.rarity]} | ${entry.type === 'recipe' ? `Recipes ${qty}` : qty ? 'Owned' : 'Unowned'}`;
    wrap.appendChild(card);
    wrap.appendChild(name);
    wrap.appendChild(meta);
    container.appendChild(wrap);
  });
  const craftBtn = document.getElementById('inventory-craft-btn');
  const sellBtn = document.getElementById('inventory-sell-btn');
  const selectedRecipe = selectedInventoryEntry?.type === 'recipe' ? getRecipeDef(selectedInventoryEntry.id) : null;
  const selectedQty = selectedInventoryEntry ? getInventoryQuantity({ ...selectedInventoryEntry }) : 0;
  if (craftBtn) craftBtn.disabled = !selectedRecipe || selectedQty < 4 || gold < CRAFT_COSTS[selectedRecipe.rarity];
  if (sellBtn) sellBtn.disabled = !selectedInventoryEntry || selectedQty <= 0;
}

function craftSelectedRecipe() {
  if (!selectedInventoryEntry || selectedInventoryEntry.type !== 'recipe') return;
  const recipe = getRecipeDef(selectedInventoryEntry.id);
  if (!recipe) return;
  const qty = recipeCounts[recipe.id] || 0;
  const cost = CRAFT_COSTS[recipe.rarity];
  if (qty < 4 || gold < cost) return;
  gold -= cost;
  recipeCounts[recipe.id] -= 4;
  if (recipeCounts[recipe.id] <= 0) delete recipeCounts[recipe.id];
  ownedItemIds.add(recipe.itemId);
  discoveredItemIds.add(recipe.itemId);
  addBattleLogEntry(`Crafted item: ${getItemDef(recipe.itemId).name}`, 'reward');
  flashMessage(`Crafted ${getItemDef(recipe.itemId).name}.`);
  saveProgress();
  refreshShopUI();
  renderInventoryModal();
}

function sellSelectedInventoryEntry() {
  if (!selectedInventoryEntry) return;
  sellInventoryEntry(selectedInventoryEntry.type, selectedInventoryEntry.id);
}

function sellInventoryEntry(type, id) {
  const price = getSellPrice(type, id);
  if (!price) return;
  if (type === 'item') {
    if (!ownedItemIds.has(id)) return;
    ownedItemIds.delete(id);
  } else {
    if (!(recipeCounts[id] > 0)) return;
    recipeCounts[id] -= 1;
    if (recipeCounts[id] <= 0) delete recipeCounts[id];
  }
  gold += price;
  addBattleLogEntry(`Sold ${type === 'item' ? getItemDef(id).name : getRecipeDef(id).name} for ${price} Gold.`, 'reward');
  flashMessage(`Sold for ${price} Gold.`);
  playMerchantVoice('buy', 'A tidy trade. The merchant pockets the deal.');
  saveProgress();
  refreshShopUI();
  renderInventoryModal();
}

function buyShopOffer(index) {
  const offer = shopOffers[index];
  if (!offer) return;
  if (gold < offer.price) {
    playMerchantVoice('insufficient', 'You need more gold for that one.');
    return;
  }
  gold -= offer.price;
  if (offer.type === 'item') {
    ownedItemIds.add(offer.id);
    discoveredItemIds.add(offer.id);
  } else {
    recipeCounts[offer.id] = (recipeCounts[offer.id] || 0) + 1;
    discoveredRecipeIds.add(offer.id);
  }
  playMerchantVoice('buy', 'A fine choice. This one has weight to it.');
  flashMessage(`Purchased ${offer.type === 'item' ? getItemDef(offer.id).name : getRecipeDef(offer.id).name}.`);
  addBattleLogEntry(`Purchased ${offer.type === 'item' ? getItemDef(offer.id).name : getRecipeDef(offer.id).name}.`, 'reward');
  shopOffers.splice(index, 1);
  saveProgress();
  refreshShopUI();
  renderInventoryModal();
}

function setShopMerchantMood(talking) {
  const sprite = document.getElementById('shop-merchant-sprite');
  if (!sprite) return;
  sprite.src = talking
    ? './public/characters/merchant/merchant talking.gif'
    : './public/characters/merchant/merchant idle.gif';
}

function setShopMerchantLine(text) {
  const line = document.getElementById('shop-merchant-line');
  if (line) line.innerText = text;
}

function scheduleShopMerchantIdleLines() {
  shopMerchantState.idleTimers.forEach(timer => clearTimeout(timer));
  shopMerchantState.idleTimers = [];
  if (!shopMerchantState.open) return;
  shopMerchantState.idleTimers.push(setTimeout(() => playMerchantVoice('wait', 'Just browsing? The relics do hate being ignored.'), 15000));
  shopMerchantState.idleTimers.push(setTimeout(() => playMerchantVoice('wait', 'Take your time. Gold grows restless when it sits too long.'), 30000));
}

function stopShopAudio() {
  shopMerchantState.open = false;
  shopMerchantState.idleTimers.forEach(timer => clearTimeout(timer));
  shopMerchantState.idleTimers = [];
  shopMerchantState.voice.pause();
  shopMerchantState.voice.currentTime = 0;
  shopMerchantState.music.pause();
  shopMerchantState.music.currentTime = 0;
  setShopMerchantMood(false);
}

function playMerchantVoice(category, fallbackText = 'Welcome.') {
  const options = SHOP_MERCHANT_LINES[category] || [];
  const chosen = options.length ? getRandomItemFromList(options) : '';
  const readableLabel = chosen ? chosen.split('/').pop().replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ') : fallbackText;
  setShopMerchantLine(fallbackText || readableLabel);
  setShopMerchantMood(true);
  if (chosen) {
    shopMerchantState.voice.src = chosen;
    shopMerchantState.voice.volume = settings.voiceVolume;
    shopMerchantState.voice.play().catch(() => {});
  }
  clearTimeout(shopMerchantState.voice._idleTimer);
  shopMerchantState.voice._idleTimer = setTimeout(() => setShopMerchantMood(false), 2400);
  scheduleShopMerchantIdleLines();
}

function startShopMusic() {
  shopMerchantState.music.src = getRandomItemFromList(SHOP_MERCHANT_LINES.soundtrack);
  shopMerchantState.music.loop = true;
  shopMerchantState.music.volume = settings.bgmVolume;
  shopMerchantState.music.play().catch(() => {});
}

function handleShopPackHover(packId) {
  if (!shopMerchantState.open || Date.now() < shopMerchantState.hoverCooldownUntil) return;
  shopMerchantState.hoverCooldownUntil = Date.now() + 2200;
  const pack = SHOP_PACKS[packId];
  playMerchantVoice('hover', pack ? `${pack.name} catches the merchant's eye.` : 'The merchant leans in with a sales pitch.');
}

function getPackFactionWeights(packId) {
  if (packId === 'starter') return ['red','blue','pink','red','blue','pink','green','purple'];
  if (packId === 'architect') return ['purple','green','purple','green','purple','green','blue'];
  if (packId === 'apex') return ['cyan','orange','cyan','orange','cyan','red','purple'];
  return ['red','blue','green','cyan','purple','pink','yellow','orange'];
}

function getCardsByFaction(faction) {
  return pool.filter(card => card.faction === faction);
}

function pickShopCard(packId, usedNames, forceGod = false) {
  let candidates = [];
  if (forceGod) {
    candidates = pool.filter(isGodCard);
  } else {
    const factionRoll = getRandomItem(getPackFactionWeights(packId));
    candidates = getCardsByFaction(factionRoll);
    if (!candidates.length && packId === 'apex') candidates = pool.filter(card => card.faction === 'cyan' || card.m >= 7);
    if (!candidates.length) candidates = pool;
  }
  const unseen = candidates.filter(card => !usedNames.has(card.n));
  const choicePool = unseen.length ? unseen : candidates;
  return choicePool[Math.floor(Math.random() * choicePool.length)];
}

function openShopPack(packId) {
  ensureDailyQuest();
  const pack = SHOP_PACKS[packId];
  if (!pack) return;
  if (gold < pack.cost) {
    document.getElementById('shop-last-drop').innerText = 'Not enough gold.';
    playMerchantVoice('insufficient', 'You need more gold for that one.');
    return;
  }
  if (packId === 'divine' && getHighestClearedLevel() < 10) {
    document.getElementById('shop-last-drop').innerText = 'The Divine Vault unlocks after Level 10.';
    playMerchantVoice('hover', 'That chest only opens for proven hunters.');
    return;
  }
  if (packId === 'divine' && divineVaultOpened) {
    document.getElementById('shop-last-drop').innerText = 'The Divine Vault can only be opened once.';
    playMerchantVoice('hover', 'That vault has already given up its prize.');
    return;
  }
  if (pack.cost >= 5000) playMerchantVoice('prebuy', 'A costly choice. The merchant watches closely.');
  gold -= pack.cost;
  const usedNames = new Set();
  const cards = [];
  if (packId === 'divine') {
    const godCard = pickShopCard(packId, usedNames, true);
    if (godCard) {
      cards.push(godCard);
      usedNames.add(godCard.n);
    }
  }
  while (cards.length < 5) {
    const card = pickShopCard(packId, usedNames, false);
    if (!card) break;
    cards.push(card);
    usedNames.add(card.n);
  }
  cards.forEach(card => {
    ownedCardNames.add(card.n);
    discoveredCardNames.add(card.n);
  });
  if (packId === 'divine') divineVaultOpened = true;
  addBattleLogEntry(`Opened ${pack.name}: ${cards.map(card => card.n).join(', ')}`, 'reward');
  document.getElementById('shop-last-drop').innerText = `${pack.name}: ${cards.map(card => card.n).join(', ')}`;
  playMerchantVoice('buy', `${pack.name} sold. Fortune favors bold pockets.`);
  saveProgress();
  refreshShopUI();
  renderDeckEditor();
}

function getBoardSlots(owner) {
  return [...document.querySelectorAll(`.${owner}-side .slot`)];
}

function getOwnerFromElement(el) {
  const grid = el.closest('.grid');
  if (!grid) return null;
  return grid.classList.contains('player-side') ? 'player' : 'enemy';
}

function getSlotIndex(slot) {
  return [...slot.parentNode.children].indexOf(slot);
}

function getLane(index) {
  return index % 4;
}

function getRow(index) {
  return Math.floor(index / 4);
}

function getFrontRowForOwner(owner) {
  return owner === 'enemy' ? 2 : 0;
}

function getBackRowForOwner(owner) {
  return owner === 'enemy' ? 0 : 2;
}

function isFrontRowSlot(slot) {
  const owner = getOwnerFromElement(slot);
  return getRow(getSlotIndex(slot)) === getFrontRowForOwner(owner);
}

function isMidRowSlot(slot) {
  return getRow(getSlotIndex(slot)) === 1;
}

function isBackRowSlot(slot) {
  const owner = getOwnerFromElement(slot);
  return getRow(getSlotIndex(slot)) === getBackRowForOwner(owner);
}

function getBackRowSlot(owner, lane) {
  return getBoardSlots(owner).find(slot => getLane(getSlotIndex(slot)) === lane && isBackRowSlot(slot)) || null;
}

function getFrontRowSlot(owner, lane) {
  return getBoardSlots(owner).find(slot => getLane(getSlotIndex(slot)) === lane && isFrontRowSlot(slot)) || null;
}

function getLaneSlotsByDepth(owner, lane, frontToBack = true) {
  const desiredRows = owner === 'enemy'
    ? (frontToBack ? [2, 1, 0] : [0, 1, 2])
    : (frontToBack ? [0, 1, 2] : [2, 1, 0]);
  return desiredRows
    .map(row => getBoardSlots(owner).find(slot => getLane(getSlotIndex(slot)) === lane && getRow(getSlotIndex(slot)) === row))
    .filter(Boolean);
}

function getAttackTargetSlot(attackerOwner, lane) {
  const defenderOwner = attackerOwner === 'player' ? 'enemy' : 'player';
  return getLaneSlotsByDepth(defenderOwner, lane, true).find(slot => slot.querySelector('.card')) || null;
}

function isTrapCard(cardData) {
  return cardData?.faction === 'yellow';
}

function isEffectCard(cardData) {
  return cardData?.faction === 'pink';
}

function isGodCard(cardData) {
  return cardData?.rarity === 'god';
}

function getAdjacentLaneIndices(index) {
  const lane = getLane(index);
  const adjacent = [];
  if (lane > 0) adjacent.push(index - 1);
  if (lane < 3) adjacent.push(index + 1);
  return adjacent;
}

function getOpposingSlot(slot) {
  const owner = getOwnerFromElement(slot);
  if (!owner) return null;
  return getBoardSlots(owner === 'player' ? 'enemy' : 'player')[getSlotIndex(slot)] || null;
}

function getCardData(card) {
  return JSON.parse(card.dataset.logic);
}

function setCardData(card, data) {
  card.dataset.logic = JSON.stringify(data);
  styleCard(card, data);
}

function getBoardCards(owner) {
  return getBoardSlots(owner).map(slot => slot.querySelector('.card')).filter(Boolean);
}

function getRandomItem(items) {
  return items.length ? items[Math.floor(Math.random() * items.length)] : null;
}

function getPlayerHandCards() {
  const hand = document.getElementById('hand');
  return hand ? [...hand.querySelectorAll('.card')] : [];
}

function normalizeHandCardData(data, overrides = {}) {
  const handData = { ...data, ...overrides };
  delete handData.attacked;
  delete handData.parryUsed;
  delete handData.tempAtkBuff;
  delete handData.borrowed;
  delete handData.abilityReady;
  delete handData.abilityActive;
  delete handData.turnsUntilGrave;
  handData.sick = false;
  handData.stunnedTurns = 0;
  return handData;
}

function createPlayerHandCard(data, animate = true) {
  const el = makeCardElement(normalizeHandCardData(data), false);
  el.draggable = true;
  el.onclick = (e) => { e.stopPropagation(); };
  el.oncontextmenu = (e) => { e.preventDefault(); openInspect(getCardData(el)); };
  el.ondragstart = (e) => { e.dataTransfer.setData('text', el.id); };
  document.getElementById('hand').appendChild(el);
  if (animate) {
    el.classList.add('card-draw-anim');
    setTimeout(() => el.classList.remove('card-draw-anim'), 400);
  }
  return el;
}

function addCardToHand(owner, data, animate = true) {
  const handData = normalizeHandCardData(data);
  if (owner === 'player') return createPlayerHandCard(handData, animate);
  enemyHand.push(handData);
  return handData;
}

function queueCardReturnToHand(owner, data, overrides = {}) {
  returningCardsAtEndOfTurn[owner].push(normalizeHandCardData(data, overrides));
}

function resolveQueuedHandReturns() {
  ['player', 'enemy'].forEach(owner => {
    const queue = returningCardsAtEndOfTurn[owner];
    if (!queue.length) return;
    queue.forEach(data => addCardToHand(owner, data, owner === 'player'));
    returningCardsAtEndOfTurn[owner] = [];
  });
}

function getPlayerPlayCost(cardData) {
  const hasFirstPlayDiscount =
    getBoardCards('player').some(c => getCardData(c).n === 'Mossy Monolith') &&
    !firstPlayDiscountUsed;
  const playCost = Math.max(0, cardData.m - (hasFirstPlayDiscount ? 1 : 0));
  return { playCost, usedFirstPlayDiscount: hasFirstPlayDiscount };
}

function canPlayerPlayMoreCards() {
  return playerCardsPlayedThisTurn < MAX_CARDS_PER_TURN;
}

function canSummonCardToSlot(cardData, slot, owner) {
  if (!cardData || !slot) return { ok: false, reason: 'Invalid summon target.' };
  const backRow = isBackRowSlot(slot);
  if (isTrapCard(cardData)) {
    if (!backRow) return { ok: false, reason: 'Yellow trap cards can only be summoned in the back row.' };
    return { ok: true };
  }
  if (backRow) return { ok: false, reason: 'Only yellow trap cards can be summoned in the back row.' };
  return { ok: true };
}

function maybeResolveEffectCard(card, owner) {
  const data = getCardData(card);
  if (!isEffectCard(data) || owner === 'player') return false;
  incrementDailyQuest('activate_effects', owner === 'player' ? 1 : 0);
  addBattleLogEntry(`${owner === 'player' ? 'You' : 'Enemy'} used effect card: ${data.n}`, 'ability');
  sendToGrave(card, owner);
  return true;
}

function isManualAbilityCard(cardData) {
  return !!MANUAL_TRIGGER_BY_CARD[cardData?.n];
}

function canActivateCardAbility(card, owner = 'player') {
  if (!card || !card.isConnected) return false;
  const data = getCardData(card);
  return owner === 'player' && isManualAbilityCard(data) && !!data.abilityReady;
}

function updateCardActionBar() {
  const bar = document.getElementById('card-action-bar');
  const name = document.getElementById('selected-card-name');
  const button = document.getElementById('activate-ability-btn');
  if (!bar || !name || !button) return;
  if (!selectedCard || !selectedCard.isConnected || getOwnerFromElement(selectedCard) !== 'player') {
    bar.classList.add('hidden');
    return;
  }
  const data = getCardData(selectedCard);
  bar.classList.remove('hidden');
  name.innerText = data.n;
  const canActivate = canActivateCardAbility(selectedCard, 'player');
  button.disabled = !canActivate;
  button.innerText = canActivate ? 'Activate' : (isManualAbilityCard(data) ? 'Used' : 'No Ability');
}

function clearSelectedCard() {
  if (selectedCard?.isConnected) selectedCard.classList.remove('card-selected');
  selectedCard = null;
  selectedCardActionMode = 'attack';
  updateCardActionBar();
}

function signalManaWarning(message = 'Not enough mana.') {
  flashMessage(message);
  const manaWrap = document.getElementById('player-mana-wrap');
  if (!manaWrap) return;
  manaWrap.classList.remove('mana-warning');
  void manaWrap.offsetWidth;
  manaWrap.classList.add('mana-warning');
  clearTimeout(manaWrap._warningTimer);
  manaWrap._warningTimer = setTimeout(() => manaWrap.classList.remove('mana-warning'), 900);
}

function ageActivatedCards(owner) {
  getBoardCards(owner).forEach(card => {
    const data = getCardData(card);
    if (!data.turnsUntilGrave) {
      if (data.abilityActive) {
        data.abilityActive = false;
        setCardData(card, data);
      }
      return;
    }
    data.turnsUntilGrave -= 1;
    if (data.turnsUntilGrave <= 0) sendToGrave(card, owner);
    else setCardData(card, data);
  });
}

function activateSelectedCardAbility() {
  if (!selectedCard || !selectedCard.isConnected) return;
  if (!canActivateCardAbility(selectedCard, 'player')) return;
  applyCardAbility(selectedCard, 'player', 'manualActivate');
  if (!selectedCard?.isConnected) {
    clearSelectedCard();
    return;
  }
  updateCardActionBar();
}

function triggerTrapForLane(owner, lane, intruderCard, phase) {
  const trapSlot = getBackRowSlot(owner, lane);
  const trapCard = trapSlot?.querySelector('.card');
  if (!trapCard || !isTrapCard(getCardData(trapCard))) return false;
  const trapData = getCardData(trapCard);
  const intruderData = intruderCard ? getCardData(intruderCard) : null;
  let triggered = false;
  if (phase === 'onEnemyPlay') {
    if (trapData.n === 'Holy Barbs' && intruderData) {
      intruderData.stunnedTurns = Math.max(intruderData.stunnedTurns || 0, 2);
      setCardData(intruderCard, intruderData);
      triggered = true;
    } else if (trapData.n === 'Sunbeam Seal') {
      const laneCards = getLaneCards(owner === 'player' ? 'enemy' : 'player', lane);
      if (laneCards.length > 2) {
        sendToGrave(intruderCard, owner === 'player' ? 'enemy' : 'player');
        triggered = true;
      }
    } else if (trapData.n === 'The King\'s Justice') {
      const opposingOwner = owner === 'player' ? 'enemy' : 'player';
      getLaneCards(opposingOwner, lane).forEach(card => sendToGrave(card, opposingOwner));
      triggered = true;
    }
  } else if (phase === 'onEnemyAttack') {
    if (trapData.n === 'Bounty Hunter\'s Net' && intruderData) {
      dealDamageToCard(intruderCard, Math.max(1, Math.floor(intruderData.a / 2)));
      triggered = true;
    } else if (trapData.n === 'Alchemist\'s Fire' && intruderData) {
      intruderData.a = 0;
      setCardData(intruderCard, intruderData);
      triggered = true;
    } else if (trapData.n === 'The King\'s Justice') {
      const opposingOwner = owner === 'player' ? 'enemy' : 'player';
      getLaneCards(opposingOwner, lane).forEach(card => sendToGrave(card, opposingOwner));
      triggered = true;
    }
  }
  if (!triggered) return false;
  if (owner === 'player') incrementDailyQuest('trigger_traps', 1);
  else discoverCard(trapData);
  addBattleLogEntry({
    type: 'ability',
    actor: owner,
    abilityName: 'Trap Card Activated',
    detail: `${trapData.n} was triggered.`,
    cardName: trapData.n,
    cardData: { ...trapData }
  });
  sendToGrave(trapCard, owner);
  return true;
}

function tryMoveSelectedCardToSlot(slot) {
  if (!selectedCard || !slot || slot.querySelector('.card')) return false;
  const sourceSlot = selectedCard.closest('.slot');
  if (!sourceSlot || sourceSlot === slot) return false;
  if (getOwnerFromElement(sourceSlot) !== 'player' || getOwnerFromElement(slot) !== 'player') return false;
  const sourceIndex = getSlotIndex(sourceSlot);
  const targetIndex = getSlotIndex(slot);
  if (getLane(sourceIndex) !== getLane(targetIndex)) return false;
  const sourceRow = getRow(sourceIndex);
  const targetRow = getRow(targetIndex);
  if (targetRow >= sourceRow) {
    flashMessage('Cards can only be moved forward toward the front row.');
    return true;
  }
  if (mana < MOVE_TO_FRONT_COST) {
    signalManaWarning(`Moving to the front row costs ${MOVE_TO_FRONT_COST} mana.`);
    return true;
  }
  mana = Math.max(0, mana - MOVE_TO_FRONT_COST);
  slot.appendChild(selectedCard);
  addBattleLogEntry(`You moved ${getCardData(selectedCard).n} to the front line.`, 'system');
  clearSelectedCard();
  updateUI();
  return true;
}

function playPlayerHandCardToSlot(card, slot) {
  if (!card || !slot || slot.querySelector('.card')) return false;
  const data = getCardData(card);
  const summonCheck = canSummonCardToSlot(data, slot, 'player');
  if (!summonCheck.ok) {
    flashMessage(summonCheck.reason);
    return false;
  }
  const { playCost, usedFirstPlayDiscount } = getPlayerPlayCost(data);
  if (playCost > mana) {
    signalManaWarning('Not enough mana.');
    return false;
  }

  mana = Math.max(0, mana - playCost);
  if (usedFirstPlayDiscount) firstPlayDiscountUsed = true;
  data.sick = true;
  data.attacked = false;
  data.parryUsed = false;
  data.stunnedTurns = 0;
  card.dataset.logic = JSON.stringify(data);
  styleCard(card, data);
  card.draggable = false;
  card.onclick = (e) => { e.stopPropagation(); selectCard(card); };
  card.oncontextmenu = (e) => { e.preventDefault(); openInspect(getCardData(card)); };
  slot.appendChild(card);
  styleCard(card, data);
  playerCardsPlayedThisTurn++;
  if (data.faction === 'blue') incrementDailyQuest('summon_blue', 1);
  if (data.faction === 'green') incrementDailyQuest('summon_green', 1);
  triggerTrapForLane('enemy', getLane(getSlotIndex(slot)), card, 'onEnemyPlay');
  if (isManualAbilityCard(data)) {
    const boardData = getCardData(card);
    boardData.abilityReady = data.faction !== 'pink';
    boardData.abilityActive = false;
    boardData.turnsUntilGrave = 0;
    setCardData(card, boardData);
    if (data.faction === 'pink') {
      applyCardAbility(card, 'player', 'onPlay');
      if (card.isConnected) sendToGrave(card, 'player');
    }
  } else {
    applyCardAbility(card, 'player', 'onPlay');
    if (data.faction === 'pink' && card.isConnected) sendToGrave(card, 'player');
  }
  card.classList.add('card-play-anim');
  setTimeout(() => card.classList.remove('card-play-anim'), 400);
  updateUI();
  updateCardActionBar();
  return true;
}

function dealDamageToCard(card, amount) {
  if (!card || amount <= 0 || !card.isConnected) return;
  const data = getCardData(card);
  data.h -= amount;
  setCardData(card, data);
  if (data.h <= 0) sendToGrave(card, getOwnerFromElement(card));
}

function healCard(card, amount) {
  if (!card || amount <= 0 || !card.isConnected) return;
  const data = getCardData(card);
  data.h += amount;
  setCardData(card, data);
}

function summonToken(owner, slot, data) {
  if (!slot || slot.querySelector('.card')) return null;
  const summonCheck = canSummonCardToSlot(data, slot, owner);
  if (!summonCheck.ok) return null;
  const el = makeCardElement(data, false);
  el.draggable = false;
  if (owner === 'player') {
    el.onclick = (e) => { e.stopPropagation(); selectCard(el); };
    el.oncontextmenu = (e) => { e.preventDefault(); openInspect(getCardData(el)); };
  } else {
    el.onclick = (e) => {
      const slotEl = e.currentTarget.closest('.slot');
      if (selectedCard && isPlayerTurn && slotEl) {
        attack(slotEl);
        return;
      }
      e.stopPropagation();
      openInspect(getCardData(el));
    };
    el.oncontextmenu = (e) => { e.preventDefault(); openInspect(getCardData(el)); };
  }
  slot.appendChild(el);
  styleCard(el, getCardData(el));
  return el;
}

function drawCardForOwner(owner, animate=true, countTurnDraw=true) {
  if (owner === 'player') {
    return drawCard(animate, countTurnDraw);
  }
  if (enemyDeck.length === 0) {
    applyEnemyDeckFatigue();
    return null;
  }
  if (countTurnDraw) enemyTurnDraws++;
  return normalizeHandCardData(enemyDeck.pop());
}

function getLaneCards(owner, lane) {
  return getBoardSlots(owner)
    .filter((slot, index) => getLane(index) === lane)
    .map(slot => slot.querySelector('.card'))
    .filter(Boolean);
}

function getAbilityName(cardData) {
  return (cardData.ability || '').split(':')[0].trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatBattleLogSource(type) {
  if (type === 'ability') return 'ABILITY';
  if (type === 'discovery') return 'DISCOVERY';
  if (type === 'reward') return 'REWARD';
  return 'SYSTEM';
}

function renderBattleLogLines(container, entries) {
  if (!container) return;
  if (!entries.length) {
    container.innerHTML = '<div class="battle-terminal-empty">No battle events yet.</div>';
    return;
  }
  container.innerHTML = entries.map(entry => {
    if (entry.type === 'ability') {
      const actorLabel = entry.actor === 'player' ? 'Player' : 'Enemy';
      const cardLabel = entry.cardData?.n || entry.cardName || 'Unknown card';
      const abilityLabel = entry.abilityName || 'Ability';
      const detail = entry.detail ? ` ${escapeHtml(entry.detail)}` : '';
      return `<div class="battle-log-line"><strong>[${formatBattleLogSource(entry.type)}]</strong> <span class="log-actor ${entry.actor}">${actorLabel}</span> activated ${escapeHtml(abilityLabel)} on <button class="log-card-btn" onclick="inspectBattleLogCard(${entry.id})" oncontextmenu="inspectBattleLogCardContext(event, ${entry.id})">${escapeHtml(cardLabel)}</button>.${detail}</div>`;
    }
    return `<div class="battle-log-line"><strong>[${formatBattleLogSource(entry.type)}]</strong> ${escapeHtml(entry.message)}</div>`;
  }).join('');
}

function renderBattleTerminal() {
  const terminal = document.getElementById('battle-terminal-list');
  renderBattleLogLines(terminal, battleLog.slice(-12));
  if (terminal) terminal.scrollTop = terminal.scrollHeight;
}

function renderBattleLogModal() {
  const list = document.getElementById('battle-log-list');
  renderBattleLogLines(list, battleLog);
  if (list) list.scrollTop = list.scrollHeight;
}

function addBattleLogEntry(message, type = 'system') {
  const entry = typeof message === 'object'
    ? { id: battleLogNextId++, ...message }
    : { id: battleLogNextId++, message, type };
  if (!entry.message && entry.type !== 'ability') return;
  battleLog.push(entry);
  if (battleLog.length > BATTLE_LOG_LIMIT) battleLog = battleLog.slice(-BATTLE_LOG_LIMIT);
  renderBattleTerminal();
  renderBattleLogModal();
}

function resetBattleLog() {
  battleLog = [];
  renderBattleTerminal();
  renderBattleLogModal();
}

function openBattleLog() {
  pauseTimer();
  renderBattleLogModal();
  document.getElementById('battle-log-overlay').classList.add('show');
}

function closeBattleLog() {
  document.getElementById('battle-log-overlay').classList.remove('show');
  const settingsOpen = document.getElementById('settings-overlay').classList.contains('show');
  const pileOpen = document.getElementById('pile-overlay').classList.contains('show');
  const deckOpen = document.getElementById('deck-overlay').classList.contains('show');
  const inspectOpen = document.getElementById('inspect-overlay').style.display === 'flex';
  if (!settingsOpen && !pileOpen && !deckOpen && !inspectOpen) resumeTimer();
}

function inspectBattleLogCard(id) {
  const entry = battleLog.find(item => item.id === id);
  if (!entry?.cardData) return;
  openInspect(entry.cardData);
}

function inspectBattleLogCardContext(event, id) {
  event.preventDefault();
  inspectBattleLogCard(id);
  return false;
}

function terminalNeedsVisualCue() {
  return !settings.terminalEnabled || settings.terminalMinimized;
}

function showAbilityCue(card) {
  if (!card || !card.isConnected) return;
  const data = getCardData(card);
  data.abilityActive = true;
  setCardData(card, data);
  if (terminalNeedsVisualCue()) {
    card.classList.remove('card-ability-pulse');
    void card.offsetWidth;
    card.classList.add('card-ability-pulse');
    setTimeout(() => card.classList.remove('card-ability-pulse'), 1600);
  }
}

function logAbilityActivation(owner, cardData, detail = '', card = null) {
  if (!cardData || !cardData.ability) return;
  const abilityName = getAbilityName(cardData) || cardData.n;
  addBattleLogEntry({
    type: 'ability',
    actor: owner,
    abilityName,
    detail,
    cardName: cardData.n,
    cardData: { ...cardData }
  });
  showAbilityCue(card);
}

function abilitiesSuppressed(owner) {
  return owner === 'player' ? playerAbilitySilenceTurns > 0 : enemyAbilitySilenceTurns > 0;
}

function applyCardAbility(card, owner, trigger, ctx = {}) {
  if (!card || !card.isConnected) return;
  if (abilitiesSuppressed(owner)) return;
  const data = getCardData(card);
  if (terminalNeedsVisualCue() || ctx.manual) data.abilityActive = true;
  if (trigger === 'manualActivate') {
    const mappedTrigger = MANUAL_TRIGGER_BY_CARD[data.n];
    if (!mappedTrigger) return;
    applyCardAbility(card, owner, mappedTrigger, { ...ctx, manual: true });
    if (card.isConnected) {
      const latestData = getCardData(card);
      latestData.abilityReady = false;
      latestData.abilityActive = true;
      latestData.turnsUntilGrave = 1;
      setCardData(card, latestData);
      updateCardActionBar();
    }
    if (owner === 'player' && isEffectCard(data)) incrementDailyQuest('activate_effects', 1);
    return;
  }
  const mappedTrigger = MANUAL_TRIGGER_BY_CARD[data.n];
  if (owner === 'player' && mappedTrigger === trigger && !ctx.manual && data.faction !== 'pink') return;
  if (owner === 'player' && trigger === 'onPlay' && isEffectCard(data)) incrementDailyQuest('activate_effects', 1);
  const slot = card.closest('.slot');
  const enemyOwner = owner === 'player' ? 'enemy' : 'player';
  const ownBoard = getBoardCards(owner);
  const enemyBoard = getBoardCards(enemyOwner);
  const opposingSlot = slot ? getOpposingSlot(slot) : null;
  const opposingCard = opposingSlot ? opposingSlot.querySelector('.card') : null;
  const announce = detail => logAbilityActivation(owner, getCardData(card), detail, card);

  if (trigger === 'onPlay') {
    switch (data.n) {
      case 'Flame-Wielder Mage': {
        announce('It scorched an adjacent lane.');
        const targets = slot ? getAdjacentLaneIndices(getSlotIndex(slot)).map(i => getBoardSlots(enemyOwner)[i]?.querySelector('.card')).filter(Boolean) : [];
        const target = getRandomItem(targets);
        if (target) dealDamageToCard(target, 1);
        break;
      }
      case 'War Cry': // dead branch safeguard
        break;
      case 'Highland War-Chieftain':
        announce('Red allies gained attack.');
        ownBoard.filter(other => other !== card && getCardData(other).faction === 'red').forEach(other => {
          const d = getCardData(other); d.a += 1; setCardData(other, d);
        });
        break;
      case 'Spore Scout': {
        announce('It checked the top card of the deck.');
        const top = owner === 'player' ? playerDeck[playerDeck.length - 1] : enemyDeck[enemyDeck.length - 1];
        if (top && owner === 'player') flashMessage(`Top card: ${top.n}`);
        break;
      }
      case 'Whispering Willow':
        announce('The opposing unit lost attack.');
        if (opposingCard) {
          const d = getCardData(opposingCard); d.a = Math.max(0, d.a - 1); setCardData(opposingCard, d);
        }
        break;
      case 'General of the Ravaged Sun':
      case 'Larva Scout': {
        announce('It repositioned to a new lane.');
        if (slot) {
          const adj = getAdjacentLaneIndices(getSlotIndex(slot)).map(i => getBoardSlots(owner)[i]).filter(s => s && !s.querySelector('.card'));
          const moveSlot = getRandomItem(adj);
          if (moveSlot) moveSlot.appendChild(card);
        }
        break;
      }
      case 'Snap-Trap Lily':
        announce('It struck immediately.');
        if (opposingCard) dealDamageToCard(opposingCard, Math.max(1, data.a));
        break;
      case 'Deep-Sea Terror':
        announce('It grew tougher on arrival.');
        data.h += 1;
        setCardData(card, data);
        break;
      case 'Vine-Choked Gate':
        announce('Nearby enemies were weakened.');
        if (slot) {
          getAdjacentLaneIndices(getSlotIndex(slot)).forEach(i => {
            const target = getBoardSlots(enemyOwner)[i]?.querySelector('.card');
            if (target) { const d = getCardData(target); d.a = Math.max(0, d.a - 1); setCardData(target, d); }
          });
        }
        break;
      case 'Stone-Watcher Idol':
      case 'Tower of Whispers':
        announce('The opposing lane was silenced.');
        if (opposingCard) {
          const d = getCardData(opposingCard); d.stunnedTurns = Math.max(d.stunnedTurns || 0, 1); setCardData(opposingCard, d);
        }
        break;
      case 'Void Gate':
        announce('It generated extra mana.');
        if (owner === 'player') mana += 1;
        else enemyMana += 1;
        break;
      case 'Emerald Totem':
        announce('Adjacent allies were strengthened.');
        if (slot) {
          getAdjacentLaneIndices(getSlotIndex(slot)).forEach(i => {
            const target = getBoardSlots(owner)[i]?.querySelector('.card');
            if (target) {
              const d = getCardData(target);
              if (d.faction === 'blue' || d.faction === 'green') { d.a += 1; setCardData(target, d); }
            }
          });
        }
        break;
      case 'Ancient Ruins':
        announce('Blue and green allies were reinforced.');
        ownBoard.filter(other => {
          const d = getCardData(other);
          return d.faction === 'blue' || d.faction === 'green';
        }).forEach(other => {
          const d = getCardData(other); d.a += 1; d.h += 1; setCardData(other, d);
        });
        break;
      case 'Chimeric Beast':
        announce('It adapted for more attack.');
        data.a += 2;
        setCardData(card, data);
        break;
      case 'Mind Flick': {
        announce('It probed the enemy hand.');
        if (owner === 'player' && enemyHand.length) flashMessage(`Enemy is holding: ${enemyHand[enemyHand.length - 1].n}`);
        break;
      }
      case 'Dark Surge': {
        announce('An ally received a temporary attack boost.');
        const target = getRandomItem(ownBoard.filter(other => other !== card));
        if (target) {
          const d = getCardData(target);
          d.a += 2;
          d.tempAtkBuff = (d.tempAtkBuff || 0) + 2;
          setCardData(target, d);
        }
        break;
      }
      case 'Amnesia':
        announce('The opponent discarded a card.');
        if (owner === 'player' && enemyHand.length) enemyHand.pop();
        if (owner === 'enemy') {
          const hand = [...document.getElementById('hand').querySelectorAll('.card')];
          const discard = getRandomItem(hand);
          if (discard) {
            playerGrave.push(getCardData(discard));
            discard.remove();
          }
        }
        break;
      case 'Gravity Well': {
        announce('An enemy unit was pulled into a new lane.');
        const candidates = enemyBoard.filter(other => other !== opposingCard);
        const target = getRandomItem(candidates);
        if (target) {
          const empty = getBoardSlots(enemyOwner).filter(s => !s.querySelector('.card'));
          const newSlot = getRandomItem(empty);
          if (newSlot) newSlot.appendChild(target);
        }
        break;
      }
      case 'Shadow Copy': {
        announce('It created a copy on the board.');
        const source = getRandomItem([...ownBoard, ...enemyBoard].filter(other => other !== card));
        const empty = getRandomItem(getBoardSlots(owner).filter(s => !s.querySelector('.card')));
        if (source && empty) {
          const src = getCardData(source);
          summonToken(owner, empty, { ...src, a: 1, h: 1, m: src.m, n: `${src.n} Copy` });
        }
        break;
      }
      case 'Psychic Scream': {
        announce('A full lane was stunned.');
        const lane = Math.floor(Math.random() * 4);
        getLaneCards(enemyOwner, lane).forEach(target => {
          const d = getCardData(target);
          d.stunnedTurns = Math.max(d.stunnedTurns || 0, 1);
          setCardData(target, d);
        });
        break;
      }
      case 'Possession': {
        announce('An enemy unit was taken over.');
        const stealable = enemyBoard.filter(other => getCardData(other).h <= 3);
        const target = getRandomItem(stealable);
        const empty = getRandomItem(getBoardSlots(owner).filter(s => !s.querySelector('.card')));
        if (target && empty) {
          const d = getCardData(target);
          d.borrowed = true;
          setCardData(target, d);
          empty.appendChild(target);
        }
        break;
      }
      case 'Memory Wipe':
        announce('Enemy abilities were disabled for two turns.');
        if (owner === 'player') enemyAbilitySilenceTurns = Math.max(enemyAbilitySilenceTurns, 2);
        else playerAbilitySilenceTurns = Math.max(playerAbilitySilenceTurns, 2);
        break;
      case 'The Void': {
        announce('Two cards were reset and returned to hand.');
        const friendly = getRandomItem(ownBoard.filter(other => other !== card));
        const opposing = getRandomItem(enemyBoard);
        if (friendly) {
          const fresh = getCardByName(getCardData(friendly).n) || getCardData(friendly);
          addCardToHand(owner, fresh, owner === 'player');
          friendly.remove();
        }
        if (opposing) {
          const fresh = getCardByName(getCardData(opposing).n) || getCardData(opposing);
          addCardToHand(enemyOwner, fresh, enemyOwner === 'player');
          opposing.remove();
        }
        break;
      }
    }
  }

  if (trigger === 'onStartTurn') {
    switch (data.n) {
      case 'Ironwood Root':
        announce('It restored its health.');
        healCard(card, 1);
        break;
      case 'Lotus Queen':
        announce('It granted bonus mana.');
        if (owner === 'player') mana += 1;
        else enemyMana += 1;
        break;
      case 'Blue-Leaf Alchemist':
        announce('It gathered extra mana from the lane.');
        if (owner === 'player') mana += 1;
        else enemyMana += 1;
        break;
      case 'Plague Rat':
        announce('It kept growing stronger.');
        data.a += 1; data.h += 1; setCardData(card, data);
        break;
      case 'Leaching Pillar':
        announce('It drained the opposing life pool.');
        if (owner === 'player') enemyHP = Math.max(0, enemyHP - 1);
        else playerHP = Math.max(0, playerHP - 1);
        break;
      case 'Dark Library':
        announce('It revealed upcoming cards.');
        if (owner === 'player') flashMessage(`Library sees: ${playerDeck.slice(-3).map(c => c.n).join(', ') || 'nothing'}`);
        break;
      case 'Verdant Forge': {
        announce('It forged a stronger red ally.');
        const target = getRandomItem(ownBoard.filter(other => getCardData(other).faction === 'red'));
        if (target && ((owner === 'player' && mana > 0) || (owner === 'enemy' && enemyMana > 0))) {
          if (owner === 'player') mana -= 1;
          else enemyMana -= 1;
          const d = getCardData(target); d.a += 2; setCardData(target, d);
        }
        break;
      }
      case 'Hidden Grove':
        announce('It restored units in its lane.');
        if (slot) {
          getLaneCards(owner, getLane(getSlotIndex(slot))).forEach(target => {
            if (target !== card) healCard(target, 1);
          });
        }
        break;
      case 'Sacrificial Altar': {
        announce('It traded an ally for mana.');
        const sacrifice = getRandomItem(ownBoard.filter(other => other !== card));
        if (sacrifice) {
          const sd = getCardData(sacrifice);
          if (owner === 'player') mana += sd.m;
          else enemyMana += sd.m;
          sendToGrave(sacrifice, owner);
        }
        break;
      }
      case 'The Dark Hospital': {
        data.hospitalCooldown = Math.max(0, (data.hospitalCooldown || 0) - 1);
        if ((data.hospitalCooldown || 0) === 0) {
          announce('It healed an ally.');
          const target = getRandomItem(ownBoard.filter(other => other !== card));
          if (target) {
            healCard(target, ownBoard.some(other => getCardData(other).n === 'Blue-Leaf Alchemist') ? 4 : 3);
            data.hospitalCooldown = 4;
            setCardData(card, data);
          }
        } else setCardData(card, data);
        break;
      }
    }
  }

  if (trigger === 'onEndTurn') {
    switch (data.n) {
      case 'Great Earth Engine':
        announce('It shook the enemy front line.');
        for (let lane = 0; lane < 4; lane++) {
          const slot = getFrontRowSlot(enemyOwner, lane);
          const c = slot?.querySelector('.card');
          if (c) dealDamageToCard(c, 1);
        }
        break;
      case 'Great Forest Heart':
        announce('It restored the whole allied field.');
        ownBoard.forEach(other => healCard(other, 2));
        break;
      case 'Hive Queen': {
        announce('It spawned a larva token.');
        const empty = getRandomItem(getBoardSlots(owner).filter(s => !s.querySelector('.card')));
        if (empty) summonToken(owner, empty, { n:'Larva Token', m:1, a:1, h:1, color:'#004a4a', faction:'cyan', ability:'', lore:'' });
        break;
      }
    }
  }

  if (trigger === 'modifyAttack' && ctx.targetData) {
    switch (data.n) {
      case 'Squire of Cinders':
        announce('It gained bonus attack against a stronger target.');
        if (ctx.targetData.h > data.h) ctx.attackBonus = (ctx.attackBonus || 0) + 1;
        break;
      case 'Dragon-Slayer Knight':
        announce('It struck for double damage.');
        if (ctx.targetData.h >= 6) ctx.attackMultiplier = 2;
        break;
      case 'Cursed Obelisk':
        announce('Its attack cost life.');
        if (owner === 'player') playerHP = Math.max(0, playerHP - 1);
        else enemyHP = Math.max(0, enemyHP - 1);
        break;
      case 'Stone-Crusher Catapult':
      case 'Colossal Behemoth':
      case 'Acidic Slime':
        announce('It dealt siege damage.');
        ctx.attackBonus = (ctx.attackBonus || 0) + 1;
        break;
    }
  }

  if (trigger === 'onDefend' && ctx.attackerData) {
    switch (data.n) {
      case 'Blood-Bound Duelist':
        if (!data.parryUsed) {
          announce('It blocked the first strike.');
          data.parryUsed = true;
          setCardData(card, data);
          ctx.preventDamageToDefender = true;
        }
        break;
      case 'Thorned Vine':
        announce('It damaged the attacker.');
        if (ctx.attackerCard) dealDamageToCard(ctx.attackerCard, 1);
        break;
    }
  }

  if (trigger === 'onDamaged') {
    switch (data.n) {
    }
  }

  if (trigger === 'onKill') {
    switch (data.n) {
      case 'Ancient Treant':
        announce('It trampled damage into the opposing hero.');
        if (owner === 'player') enemyHP = Math.max(0, enemyHP - 1);
        else playerHP = Math.max(0, playerHP - 1);
        break;
      case 'Hydra of the Abyss':
        announce('It devoured the fallen and reactivated itself.');
        data.h += 2;
        data.attacked = false;
        setCardData(card, data);
        break;
    }
  }
}

function runTurnHooks(owner, trigger) {
  getBoardCards(owner).forEach(card => applyCardAbility(card, owner, trigger));
}

// â”€â”€ ARENA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildArena() {
  document.querySelectorAll('.grid').forEach(grid => {
    for (let i=0; i<12; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      if (grid.classList.contains('player-side')) { slot.ondrop=drop; slot.ondragover=allowDrop; slot.onclick=()=>handlePlayerSlotClick(slot); }
      if (grid.classList.contains('enemy-side'))  { slot.onclick=()=>attack(slot); }
      grid.appendChild(slot);
    }
  });
}

// â”€â”€ DRAW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawCard(animate=true, countTurnDraw=true) {
  if (playerDeck.length === 0) {
    playerDeckFatigue += 1;
    playerHP = Math.max(0, playerHP - 1);
    addBattleLogEntry(`Deck Out: you could not draw and lost 1 HP from fatigue.`, 'system');
    updateUI();
    checkGameEnd();
    return null;
  }
  if (countTurnDraw) playerTurnDraws++;
  return addCardToHand('player', playerDeck.pop(), animate);
}

function applyEnemyDeckFatigue() {
  enemyDeckFatigue += 1;
  enemyHP = Math.max(0, enemyHP - 1);
  addBattleLogEntry(`Enemy Deck Out: the enemy could not draw and lost 1 HP from fatigue.`, 'system');
  updateUI();
  checkGameEnd();
}

// â”€â”€ CARD ELEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeCardElement(data, fresh=false) {
  const el = document.createElement('div');
  el.className = 'card';
  el.id = 'c-'+Math.random().toString(36).substr(2,6);
  const d = {...data, attacked:false, sick:fresh, abilityReady: !!data.abilityReady, abilityActive: !!data.abilityActive, turnsUntilGrave: data.turnsUntilGrave || 0};
  el.dataset.logic = JSON.stringify(d);
  styleCard(el, d);
  return el;
}

function styleCard(el, data) {
  const border = factionBorder[data.faction]||'#888';
  const abilityName = getAbilityName(data);
  const owner = getOwnerFromElement(el);
  const hiddenTrap = isTrapCard(data) && owner === 'enemy';
  if (data.img) { el.style.backgroundImage=`url('${data.img}')`; el.style.backgroundColor=''; }
  else          { el.style.backgroundImage='none'; el.style.backgroundColor=data.color||'#1e1e1e'; }
  el.style.borderColor = border;
  if (hiddenTrap) {
    el.style.backgroundImage = 'none';
    el.style.backgroundColor = 'transparent';
    el.style.borderColor = 'transparent';
    el.style.boxShadow = 'none';
  }
  el.innerHTML = `
    <div class="m-cost">${data.m}</div>
    ${hiddenTrap ? '' : !data.img?`<div class="card-name-label">${data.n}</div>`:''}
    <div class="hover-overlay">
      <div class="card-stat-row">${hiddenTrap ? '' : `${UI_ICONS.atk} ${data.a} &nbsp; ${UI_ICONS.hp} ${data.h}`}</div>
      <div class="ability-row">${hiddenTrap ? '' : (abilityName || 'No ability')}</div>
      ${data.sick?'<div class="sick-label">SICK</div>':''}
      ${data.attacked?'<div class="attacked-label">USED</div>':''}
      ${data.stunnedTurns>0?'<div class="stunned-label">STUN</div>':''}
      ${data.parryUsed?'<div class="parry-label">PARRY USED</div>':''}
    </div>`;
  el.classList.toggle('card-sick',   !!data.sick);
  el.classList.toggle('card-attacked',!!data.attacked);
  el.classList.toggle('card-ability-active', !!data.abilityActive);
}

// â”€â”€ DRAG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function allowDrop(e) { e.preventDefault(); }

function drop(e) {
  e.preventDefault();
  if (!isPlayerTurn) return;
  if (!canPlayerPlayMoreCards()) { flashMessage(`You can only play ${MAX_CARDS_PER_TURN} cards per turn.`); return; }
  const id = e.dataTransfer.getData('text');
  const el = document.getElementById(id);
  if (!el) return;
  const slot = e.target.closest('.slot');
  if (!slot || slot.querySelector('.card')) return;
  playPlayerHandCardToSlot(el, slot);
}

function handlePlayerSlotClick(slot) {
  if (!isPlayerTurn) return;
  if (slot.querySelector('.card')) return;
  tryMoveSelectedCardToSlot(slot);
}

// â”€â”€ SELECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function selectCard(card) {
  if (!isPlayerTurn) return;
  const data = JSON.parse(card.dataset.logic);
  const slot = card.closest('.slot');
  document.querySelectorAll('.card').forEach(c => c.classList.remove('card-selected'));
  if (selectedCard===card) { clearSelectedCard(); }
  else {
    selectedCard=card;
    card.classList.add('card-selected');
    if (slot && !isFrontRowSlot(slot)) {
      flashMessage(`Move this card to the front row for ${MOVE_TO_FRONT_COST} mana before attacking.`);
    }
    updateCardActionBar();
  }
}

// â”€â”€ ATTACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function attack(enemySlot) {
  if (!selectedCard || !isPlayerTurn || attackInProgress) return;
  const attacker = selectedCard;
  const attackerSlot = attacker.closest('.slot');
  if (!attackerSlot || !isFrontRowSlot(attackerSlot)) {
    flashMessage(`Only front-row cards can attack. Move it forward for ${MOVE_TO_FRONT_COST} mana first.`);
    return;
  }
  if (getLane(getSlotIndex(attackerSlot)) !== getLane(getSlotIndex(enemySlot))) {
    flashMessage('Cards can only attack cards in the same lane.');
    return;
  }
  const pd = JSON.parse(attacker.dataset.logic);
  if (pd.sick||pd.attacked||pd.a<=0) return;
  const lane = getLane(getSlotIndex(attackerSlot));
  triggerTrapForLane('enemy', lane, attacker, 'onEnemyAttack');
  if (!attacker.isConnected) {
    clearSelectedCard();
    updateUI();
    return;
  }
  const guardianSlot = getLaneCards('enemy', lane).map(card => card.closest('.slot')).find(slot => {
    const c = slot?.querySelector('.card');
    return c && getCardData(c).n === 'Ironclad Sentinel';
  });
  const resolvedTargetSlot = guardianSlot || getAttackTargetSlot('player', lane);
  const enemyCard = resolvedTargetSlot?.querySelector('.card') || null;
  attackInProgress = true;
  markAttacked(attacker, pd);
  clearSelectedCard();
  updateUI();

  animateAttack(attacker, enemyCard || enemySlot, ()=>{
    if (!enemyCard) {
      const directCtx = { attackBonus: 0, attackMultiplier: 1 };
      applyCardAbility(attacker, 'player', 'modifyAttack', directCtx);
      if (['Stone-Crusher Catapult','Colossal Behemoth','Acidic Slime'].includes(pd.n)) directCtx.attackBonus += 1;
      const attackPower = Math.max(0, (pd.a + (directCtx.attackBonus || 0)) * (directCtx.attackMultiplier || 1));
      enemyHP = Math.max(0, enemyHP-attackPower);
      shakeEl(document.getElementById('enemy-hud'));
      updateUI();
      checkGameEnd();
      attackInProgress = false;
    } else {
      const ed = JSON.parse(enemyCard.dataset.logic);
      const attackCtx = { targetData: ed, targetCard: enemyCard, attackBonus: 0, attackMultiplier: 1 };
      applyCardAbility(attacker, 'player', 'modifyAttack', attackCtx);
      const defendCtx = { attackerData: pd, attackerCard: attacker, preventDamageToDefender: false };
      applyCardAbility(enemyCard, 'enemy', 'onDefend', defendCtx);
      const playerDamage = Math.max(0, (pd.a + (attackCtx.attackBonus || 0)) * (attackCtx.attackMultiplier || 1));
      ed.h -= playerDamage;
      if (!defendCtx.preventDamageToDefender) pd.h -= ed.a;
      updateCard(enemyCard, ed);
      if (ed.h<=0) sendToGrave(enemyCard,'enemy');
      else if (playerDamage > 0) applyCardAbility(enemyCard, 'enemy', 'onDamaged');
      if (pd.h<=0) { updateCard(attacker, pd); sendToGrave(attacker,'player'); }
      else {
        updateCard(attacker, pd);
        if (ed.a > 0) applyCardAbility(attacker, 'player', 'onDamaged');
      }
      if (ed.h <= 0) applyCardAbility(attacker, 'player', 'onKill');
      updateUI();
      checkGameEnd();
      attackInProgress = false;
    }
  });
}

function markAttacked(el,data) { data.attacked=true; el.dataset.logic=JSON.stringify(data); styleCard(el,data); el.classList.remove('card-selected'); }
function updateCard(el,data)   { el.dataset.logic=JSON.stringify(data); styleCard(el,data); }

function refreshBoardForNextTurn(owner) {
  document.querySelectorAll(`.${owner}-side .card`).forEach(card => {
    const data = getCardData(card);
    data.sick = false;
    data.attacked = false;
    data.parryUsed = false;
    if (data.tempAtkBuff) {
      data.a = Math.max(0, data.a - data.tempAtkBuff);
      data.tempAtkBuff = 0;
    }
    if (data.stunnedTurns) data.stunnedTurns = Math.max(0, data.stunnedTurns - 1);
    setCardData(card, data);
  });
}

function sendToGrave(card,owner) {
  const data = JSON.parse(card.dataset.logic);
  if (selectedCard === card) clearSelectedCard();
  card.classList.add('card-die-anim');
  setTimeout(()=>{
    if (!card.parentNode) return;
    const slot = card.parentNode;
    const lane = getLane(getSlotIndex(slot));
    const baseReturnData = getCardByName(data.n) || data;
    card.remove();
    (owner==='player'?playerGrave:enemyGrave).push(data);
    if (data.n === 'Phoenix Paladin') addCardToHand(owner, { ...baseReturnData, m: data.m + 2, h: 3 }, owner === 'player');
    if (data.n === 'Noxious Wasp') {
      const opposing = slot ? getOpposingSlot(slot)?.querySelector('.card') : null;
      if (opposing) {
        const od = getCardData(opposing);
        od.a = Math.max(0, od.a - 1);
        setCardData(opposing, od);
      }
    }
    const keepSlot = getLaneCards(owner, lane).map(c => c.closest('.slot')).find(s => {
      const keep = s?.querySelector('.card');
      return keep && getCardData(keep).n === "Necromancer's Keep";
    });
    if (keepSlot && !slot.querySelector('.card')) {
      summonToken(owner, slot, { n:'Skeleton', m:1, a:1, h:1, color:'#666', faction:'purple', ability:'', lore:'' });
    }
    updateUI();
  },350);
}

// â”€â”€ ANIMATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function animateAttack(attacker, target, cb) {
  if (!attacker){cb();return;}
  const ar=attacker.getBoundingClientRect();
  const tr=(target&&target.getBoundingClientRect)?target.getBoundingClientRect():ar;
  const dx=(tr.left+tr.width/2)-(ar.left+ar.width/2);
  const dy=(tr.top+tr.height/2)-(ar.top+ar.height/2);
  attacker.style.transition='transform 0.18s ease';
  attacker.style.transform=`translate(${dx*.55}px,${dy*.55}px) scale(1.15)`;
  if(target&&target.classList) setTimeout(()=>{target.classList.add('card-hit-anim');setTimeout(()=>target.classList.remove('card-hit-anim'),350);},160);
  setTimeout(()=>{ attacker.style.transition=''; attacker.style.transform=''; setTimeout(cb,120); },280);
}
function shakeEl(el) { if(!el)return; el.classList.add('shake-anim'); setTimeout(()=>el.classList.remove('shake-anim'),500); }
function showTurnBanner(text, isEnemy) {
  const b=document.getElementById('turn-banner');
  b.innerText=text; b.className='turn-banner show '+(isEnemy?'enemy-banner':'player-banner');
  setTimeout(()=>b.classList.remove('show'),1600);
}

// â”€â”€ TIMER (pause/resume approach â€” no clearInterval on open/close) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startTurnTimer() {
  if (!settings.timerOn) return;
  clearInterval(turnTimer);
  turnTimeLeft=60; timerPaused=false;
  updateTimerUI();
  turnTimer = setInterval(()=>{
    if (timerPaused) return;  // any modal is open â€” skip tick, time preserved
    turnTimeLeft--;
    updateTimerUI();
    if (turnTimeLeft<=0) { clearInterval(turnTimer); if(isPlayerTurn) autoPlayRandom(); }
  },1000);
}
function updateTimerUI() {
  const el=document.getElementById('turn-clock'); if(!el)return;
  el.innerText=turnTimeLeft+'s'; el.style.color=turnTimeLeft<=10?'#e74c3c':'#aaa';
}
function autoPlayRandom() {
  if (!canPlayerPlayMoreCards()) {
    flashMessage(`Time's up! ${MAX_CARDS_PER_TURN}-card limit reached.`);
    setTimeout(()=>nextTurn(),700);
    return;
  }
  const hand = getPlayerHandCards();
  const freeSlots=[...document.querySelectorAll('.player-side .slot')].filter(s=>!s.querySelector('.card'));
  let played=false;
  if (hand.length&&freeSlots.length) {
    const options = hand.flatMap(card => {
      const data = getCardData(card);
      if (getPlayerPlayCost(data).playCost > mana) return [];
      return freeSlots.filter(slot => canSummonCardToSlot(data, slot, 'player').ok).map(slot => ({ card, slot }));
    });
    if (options.length) {
      const choice = options[Math.floor(Math.random() * options.length)];
      played = playPlayerHandCardToSlot(choice.card, choice.slot);
    }
  }
  flashMessage(played ? "Time's up! Card auto-played." : "Time's up!");
  setTimeout(()=>nextTurn(),700);
}

function scoreEnemyPlayOption(cardData, slot) {
  const lane = getLane(getSlotIndex(slot));
  const playerLaneCards = getLaneCards('player', lane);
  let score = cardData.m + (cardData.a || 0) + (cardData.h || 0) * 0.35;
  if (isTrapCard(cardData)) score += playerLaneCards.length ? 6 : 1;
  if (isEffectCard(cardData)) score += enemyMana >= cardData.m ? 4 : 0;
  if (!isTrapCard(cardData) && isFrontRowSlot(slot)) score += playerLaneCards.length ? 5 : 2;
  if (!isTrapCard(cardData) && isMidRowSlot(slot)) score += 1;
  if (cardData.n === 'Ironclad Sentinel' && playerLaneCards.length) score += 5;
  if (cardData.n === 'Holy Barbs' || cardData.n === 'Sunbeam Seal' || cardData.n === 'The King\'s Justice') score += playerLaneCards.length * 2;
  return score;
}

// â”€â”€ ENEMY AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function enemyTurn() {
  return new Promise(resolve=>{
    const eSlots=[...document.querySelectorAll('.enemy-side .slot')];
    const pSlots=[...document.querySelectorAll('.player-side .slot')];
    let delay=300;

    // Enemy now plays only one card from hand per turn.
    const playableOptions = enemyHand.flatMap((cardData, handIndex) => {
      if (cardData.m > enemyMana) return [];
      return eSlots
        .filter(slot => !slot.querySelector('.card'))
        .filter(slot => canSummonCardToSlot(cardData, slot, 'enemy').ok)
        .map(slot => ({ handIndex, slot, cardData, score: scoreEnemyPlayOption(cardData, slot) }));
    });
    if (playableOptions.length) {
      const choice = playableOptions.sort((a, b) => b.score - a.score)[0];
      const data = enemyHand.splice(choice.handIndex, 1)[0];
      const slot = choice.slot;
      enemyMana -= data.m;
      const el=makeCardElement(data,true);
      el.onclick=(e)=>{
        const slotEl = e.currentTarget.closest('.slot');
        if (selectedCard && isPlayerTurn && slotEl) {
          attack(slotEl);
          return;
        }
        if (isTrapCard(getCardData(el))) {
          e.stopPropagation();
          flashMessage('This enemy trap is hidden.');
          return;
        }
        e.stopPropagation();
        openInspect(getCardData(el));
      };
      el.oncontextmenu=(e)=>{
        e.preventDefault();
        if (isTrapCard(getCardData(el))) {
          flashMessage('This enemy trap is hidden.');
          return;
        }
        openInspect(getCardData(el));
      };
      slot.appendChild(el); el.classList.add('card-play-anim');
      styleCard(el, getCardData(el));
      if (!isTrapCard(data)) discoverCard(data);
      if (isTrapCard(data)) addBattleLogEntry('Enemy played a trap card.', 'system');
      triggerTrapForLane('player', getLane(getSlotIndex(slot)), el, 'onEnemyPlay');
      applyCardAbility(el, 'enemy', 'onPlay');
      maybeResolveEffectCard(el, 'enemy');
      updateUI();
    }
    delay=500;

    // Attack with every card
    const cards=eSlots
      .filter(s => isFrontRowSlot(s))
      .map(s=>s.querySelector('.card'))
      .filter(Boolean)
      .sort((a, b) => {
        const ad = getCardData(a);
        const bd = getCardData(b);
        return (bd.a + bd.h) - (ad.a + ad.h);
      });
    cards.forEach(eCard=>{
      setTimeout(()=>{
        if (!eCard.isConnected) return;
        const attackerSlot = eCard.closest('.slot');
        const ed=JSON.parse(eCard.dataset.logic);
        if (ed.sick || ed.a <= 0 || ed.stunnedTurns > 0) return;
        triggerTrapForLane('player', getLane(getSlotIndex(attackerSlot)), eCard, 'onEnemyAttack');
        if (!eCard.isConnected) return;
        const lane = getLane(getSlotIndex(attackerSlot));
        const guardianSlot = getLaneCards('player', lane).map(card => card.closest('.slot')).find(slot => {
          const c = slot?.querySelector('.card');
          return c && getCardData(c).n === 'Ironclad Sentinel';
        });
        const targetSlot = guardianSlot || getAttackTargetSlot('enemy', lane);
        const pCard=targetSlot?.querySelector('.card');
        if (pCard) {
          if (!pCard||!pCard.isConnected) return;
          const pd=JSON.parse(pCard.dataset.logic);
          animateAttack(eCard,pCard,()=>{
            if(!eCard.isConnected||!pCard.isConnected)return;
            const defendCtx = { attackerData: ed, attackerCard: eCard, preventDamageToDefender: false };
            applyCardAbility(pCard, 'player', 'onDefend', defendCtx);
            const enemyCtx = { targetData: pd, targetCard: pCard, attackBonus: 0, attackMultiplier: 1 };
            applyCardAbility(eCard, 'enemy', 'modifyAttack', enemyCtx);
            const enemyDamage = Math.max(0, (ed.a + (enemyCtx.attackBonus || 0)) * (enemyCtx.attackMultiplier || 1));
            if (!defendCtx.preventDamageToDefender) pd.h-=enemyDamage;
            ed.h-=pd.a;
            updateCard(pCard,pd); updateCard(eCard,ed);
            if(pd.h<=0) sendToGrave(pCard,'player');
            else if (enemyDamage > 0) applyCardAbility(pCard, 'player', 'onDamaged');
            if(ed.h<=0) sendToGrave(eCard,'enemy');
            else if (pd.a > 0) applyCardAbility(eCard, 'enemy', 'onDamaged');
            if (pd.h <= 0) applyCardAbility(eCard, 'enemy', 'onKill');
            playerHP=Math.max(0,playerHP); updateUI(); checkGameEnd();
          });
        } else {
          animateAttack(eCard,document.getElementById('panel'),()=>{
            const enemyCtx = { attackBonus: 0, attackMultiplier: 1 };
            applyCardAbility(eCard, 'enemy', 'modifyAttack', enemyCtx);
            if (['Stone-Crusher Catapult','Colossal Behemoth','Acidic Slime'].includes(ed.n)) enemyCtx.attackBonus += 1;
            const enemyDamage = Math.max(0, (ed.a + (enemyCtx.attackBonus || 0)) * (enemyCtx.attackMultiplier || 1));
            playerHP=Math.max(0,playerHP-enemyDamage);
            shakeEl(document.getElementById('panel'));
            updateUI(); checkGameEnd();
          });
        }
      },delay); delay+=500;
    });
    setTimeout(resolve,delay+300);
  });
}

// â”€â”€ TURNS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function nextTurn() {
  if (!isPlayerTurn) return;
  clearInterval(turnTimer); timerPaused=false;
  attackInProgress = false;
  clearSelectedCard();
  runTurnHooks('player', 'onEndTurn');
  resolveQueuedHandReturns();
  isPlayerTurn=false;
  refreshBoardForNextTurn('player');
  playerTurnDraws = 0;
  enemyTurnDraws = 0;
  firstPlayDiscountUsed = false;
  document.getElementById('end-btn').disabled=true;
  showTurnBanner('ENEMY TURN',true);
  setTimeout(()=>{ executeEnemyTurnSequence(); },800);
}

function startPlayerTurn() {
  attackInProgress = false;
  playerCardsPlayedThisTurn = 0;
  mana=maxMana;
  ageActivatedCards('player');
  runTurnHooks('player', 'onStartTurn');
  if (playerAbilitySilenceTurns > 0) playerAbilitySilenceTurns--;
  if (enemyAbilitySilenceTurns > 0) enemyAbilitySilenceTurns--;
  drawCard();
  if (playerHP <= 0) return;
  document.getElementById('end-btn').disabled=false;
  showTurnBanner('YOUR TURN',false);
  updateUI();
  if (settings.timerOn) startTurnTimer();
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

// â”€â”€ UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function updateUI() {
  mana=Math.max(0,mana);
  enemyMana=Math.max(0,enemyMana);
  document.getElementById('m-val').innerText         = mana;
  document.getElementById('m-max').innerText         = maxMana;
  document.getElementById('player-hp').innerText     = Math.max(0,playerHP);
  document.getElementById('enemy-hp-val').innerText  = Math.max(0,enemyHP);
  document.getElementById('enemy-hp-label').innerHTML = `HP <span id="enemy-hp-val">${Math.max(0,enemyHP)}</span>/${enemyMaxHP}`;
  document.getElementById('enemy-mana-val').innerText= enemyMana;
  document.getElementById('player-deck-count').innerText  = playerDeck.length;
  document.getElementById('enemy-deck-count').innerText   = enemyDeck.length;
  document.getElementById('player-grave-count').innerText = playerGrave.length;
  document.getElementById('enemy-grave-count').innerText  = enemyGrave.length;
  // Enemy HP bar
  const ep=enemyMaxHP ? Math.max(0,(enemyHP/enemyMaxHP)*100) : 0;
  const ef=document.getElementById('enemy-hp-bar-fill');
  ef.style.width=ep+'%'; ef.style.background=ep>50?'#e74c3c':ep>25?'#e67e22':'#c0392b';
  // Player HP bar
  const pp=Math.max(0,(playerHP/20)*100);
  const pf=document.getElementById('player-hp-bar-fill');
  if(pf){pf.style.width=pp+'%';pf.style.background=pp>50?'#e74c3c':pp>25?'#e67e22':'#c0392b';}
  const manaFill = document.getElementById('player-mana-bar-fill');
  if (manaFill) manaFill.style.width = `${maxMana ? Math.max(0, (mana / maxMana) * 100) : 0}%`;
  // Timer visibility
  const clk=document.getElementById('turn-clock');
  if(clk) clk.style.display=settings.timerOn?'':'none';
  syncBattleTerminalUI();
}

function flashMessage(msg) {
  let el=document.getElementById('flash-msg');
  if(!el){el=document.createElement('div');el.id='flash-msg';document.body.appendChild(el);}
  el.innerText=msg; el.classList.add('show'); clearTimeout(el._t);
  el._t=setTimeout(()=>el.classList.remove('show'),2200);
}

// â”€â”€ WIN / LOSE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function checkGameEnd() {
  if (playerHP<=0) showGameOver(false,'Your forces are overwhelmed.');
  else if (enemyHP<=0) showGameOver(true,currentEnemy.name+' has been defeated!');
}
function showGameOver(won,reason) {
  clearInterval(turnTimer); timerPaused=false;
  const firstClear = won && !clearedLevels.includes(currentLevel);
  if (firstClear) clearedLevels.push(currentLevel);
  if (won) mapSpawnLevel = currentLevel;
  let rewardGold = won ? (firstClear ? 100 : (30 + Math.floor(Math.random() * 21))) : 30;
  if (won) {
    winStreak += 1;
    incrementDailyQuest('win_matches', 1);
    if (winStreak > 0 && winStreak % 3 === 0) rewardGold += 50;
    if (anteActiveForBattle) rewardGold += ANTE_ENTRY_FEE * 2;
  } else {
    winStreak = 0;
  }
  gold += rewardGold;
  anteActiveForBattle = false;
  addBattleLogEntry(won ? `Battle won. ${reason || ''}`.trim() : `Battle lost. ${reason || ''}`.trim(), 'system');
  addBattleLogEntry(`Gold earned: ${rewardGold}. Current streak: ${winStreak}.`, 'reward');
  flashMessage(`+${rewardGold} Gold earned.`);
  document.getElementById('gameover-icon').innerText  = won ? UI_ICONS.win : UI_ICONS.lose;
  document.getElementById('gameover-title').innerText = won?'VICTORY!':'DEFEATED';
  document.getElementById('gameover-sub').innerText   = reason||'';
  document.getElementById('gameover-overlay').classList.add('show');
  grantRecipeDrop();
  if (won) openRewardOverlay();
  saveProgress();
  spawnParticles(won);
}
function openRewardOverlay() {
  const eligible = getEligibleRewardCards();
  rewardChoices = pickRandomCards(eligible, Math.min(3, eligible.length));
  selectedRewardNames = new Set();
  if (!rewardChoices.length) return;
  document.getElementById('reward-subtitle').innerText = 'Pick 1 card to add to your collection.';
  renderRewardChoices();
  document.getElementById('reward-overlay').classList.add('show');
}

function renderRewardChoices() {
  const container = document.getElementById('reward-cards');
  const claimBtn = document.getElementById('reward-claim-btn');
  if (!container || !claimBtn) return;
  container.innerHTML = '';
  rewardChoices.forEach(data => {
    const wrap = document.createElement('div');
    wrap.className = 'reward-card-wrap' + (selectedRewardNames.has(data.n) ? ' selected' : '');
    wrap.onclick = () => toggleRewardChoice(data.n);
    wrap.appendChild(makePileCardEl(data, true));
    container.appendChild(wrap);
  });
  claimBtn.disabled = selectedRewardNames.size !== Math.min(1, rewardChoices.length);
}

function toggleRewardChoice(cardName) {
  if (selectedRewardNames.has(cardName)) selectedRewardNames.delete(cardName);
  else if (selectedRewardNames.size < 1) selectedRewardNames.add(cardName);
  renderRewardChoices();
}

function claimRewardChoices() {
  if (selectedRewardNames.size !== Math.min(1, rewardChoices.length)) return;
  const pickedCards = [...selectedRewardNames];
  selectedRewardNames.forEach(name => {
    ownedCardNames.add(name);
    discoveredCardNames.add(name);
    addBattleLogEntry(`Reward card added to collection: ${name}`, 'reward');
  });
  rewardChoices = [];
  selectedRewardNames = new Set();
  document.getElementById('reward-overlay').classList.remove('show');
  flashMessage(`New cards: ${pickedCards.join(', ')}`);
  saveProgress();
  renderDeckEditor();
}

function spawnParticles(won) {
  const c=document.getElementById('particle-container'); c.innerHTML='';
  const cols=won?['#f1c40f','#27ae60','#fff','#f39c12']:['#e74c3c','#8e44ad','#555'];
  for(let i=0;i<60;i++){
    const p=document.createElement('div'); p.className='particle';
    p.style.cssText=`left:${Math.random()*100}vw;top:${Math.random()*100}vh;background:${cols[i%cols.length]};width:${6+Math.random()*10}px;height:${6+Math.random()*10}px;animation-delay:${Math.random()*.6}s;animation-duration:${.8+Math.random()*1.2}s;`;
    c.appendChild(p);
  }
  setTimeout(()=>{if(c)c.innerHTML='';},3000);
}

// â”€â”€ PILE VIEWER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openPileModal(type) {
  pauseTimer();
  let raw,label,hint,isDeck;
  if      (type==='player-deck')  {raw=[...playerDeck]; label='Your Deck';       hint=`${raw.length} cards - order hidden`; isDeck=true;}
  else if (type==='player-grave') {raw=[...playerGrave];label='Your Graveyard';  hint=`${raw.length} cards`; isDeck=false;}
  else if (type==='enemy-deck')   {raw=[...enemyDeck];  label='Enemy Deck';      hint=`${raw.length} cards - order hidden`; isDeck=true;}
  else if (type==='enemy-grave')  {raw=[...enemyGrave]; label='Enemy Graveyard'; hint=`${raw.length} cards`; isDeck=false;}
  document.getElementById('pile-modal-title').innerText    = label;
  document.getElementById('pile-modal-subtitle').innerText = hint;
  document.getElementById('pile-sort-select').value = settings.sortOrder;
  pileModalData = isDeck ? [...raw].sort(()=>Math.random()-.5) : [...raw];
  renderPileCards();
  document.getElementById('pile-overlay').classList.add('show');
}
function renderPileCards() {
  const container=document.getElementById('pile-modal-cards');
  if(!container||!pileModalData) return;
  container.innerHTML='';
  const sorted=sortCards(pileModalData, document.getElementById('pile-sort-select').value);
  if (!sorted.length){container.innerHTML='<p style="color:#666;text-align:center;padding:40px 0;">Empty</p>';return;}
  sorted.forEach(data=>{ container.appendChild(makePileCardEl(data, true)); });
}
function closePileModal() {
  document.getElementById('pile-overlay').classList.remove('show');
  resumeTimer();
}

// â”€â”€ DECK EDITOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function addCardToDeck(cardName) {
  ensureDeckInitialized();
  if (!ownedCardNames.has(cardName)) return;
  const card = getCardByName(cardName);
  if (!card) return;
  if (playerDeckList.length >= DECK_MAX_CARDS) { flashMessage(`Deck max is ${DECK_MAX_CARDS} cards.`); return; }
  if (getDeckCardCount(cardName) >= 3) { flashMessage('Max 3 copies of the same card.'); return; }
  if (isGodCard(card) && getDeckCardsByPredicate(isGodCard).length >= MAX_GODS_PER_DECK) {
    flashMessage(`Only ${MAX_GODS_PER_DECK} God card is allowed per deck.`);
    return;
  }
  if (card.faction === 'orange' && getDeckCardsByPredicate(data => data.faction === 'orange').length >= MAX_FUSIONS_PER_DECK) {
    flashMessage(`Fusion limit reached: ${MAX_FUSIONS_PER_DECK} Orange cards.`);
    return;
  }
  if (card.faction === 'green' && getDeckCardsByPredicate(data => data.faction === 'green').length >= MAX_FIELDS_PER_DECK) {
    flashMessage(`Field limit reached: ${MAX_FIELDS_PER_DECK} Green cards.`);
    return;
  }
  playerDeckList.push(cardName);
  saveProgress();
  renderDeckEditor();
}

function removeCardFromDeck(cardName) {
  ensureDeckInitialized();
  if (playerDeckList.length <= DECK_MIN_CARDS) { flashMessage(`Deck minimum is ${DECK_MIN_CARDS} cards.`); return; }
  const idx = playerDeckList.indexOf(cardName);
  if (idx === -1) return;
  playerDeckList.splice(idx, 1);
  saveProgress();
  renderDeckEditor();
}

function selectDeckEditorCard(cardName) {
  if (!ownedCardNames.has(cardName)) return;
  deckEditorSelectedCardName = cardName;
  renderDeckEditor();
}

function openDeckEditor() {
  document.getElementById('deck-sort-select').value = 'mana';
  document.getElementById('deck-filter-select').value = 'all';
  if (!ownedCardNames.has(deckEditorSelectedCardName)) deckEditorSelectedCardName = null;
  renderDeckEditor();
  document.getElementById('deck-overlay').classList.add('show');
}
function renderDeckEditor() {
  const container = document.getElementById('deck-modal-cards');
  container.innerHTML = '';
  ensureCollectionInitialized();
  ensureDeckInitialized();
  const unlocked = ownedCardNames.size;
  const sortedPool = sortCards(pool, document.getElementById('deck-sort-select').value);
  const unlockedSet = new Set(getAvailablePool().map(c=>c.n));
  const filter = document.getElementById('deck-filter-select').value;
  const validation = getDeckValidation();

  const sub = document.getElementById('deck-modal-subtitle');
  sub.innerText = `Deck ${playerDeckList.length}/${DECK_MAX_CARDS} (min ${DECK_MIN_CARDS}) | Gods ${validation.gods}/${MAX_GODS_PER_DECK} | Fusions ${validation.fusions}/${MAX_FUSIONS_PER_DECK} | Fields ${validation.fields}/${MAX_FIELDS_PER_DECK} | Owned ${unlocked} | Discovered ${discoveredCardNames.size} | Selected ${deckEditorSelectedCardName || 'None'}`;

  sortedPool.forEach(data => {
    const isUnlocked = unlockedSet.has(data.n);
    const isDiscovered = discoveredCardNames.has(data.n);
    const isSelected = deckEditorSelectedCardName === data.n;
    if (filter === 'owned' && !isUnlocked) return;
    if (filter === 'unowned' && isUnlocked) return;

    const wrap = document.createElement('div');
    wrap.className = 'pile-card-wrap' + (isSelected ? ' deck-selected' : '');
    const card = document.createElement('div');
    card.className = 'pile-card';

    if (isUnlocked || isDiscovered) {
      card.style.borderColor = factionBorder[data.faction] || '#888';
      if (data.img) card.style.backgroundImage = `url('${data.img}')`;
      else card.style.backgroundColor = data.color || '#1e1e1e';
      card.innerHTML = `<div class="m-cost">${data.m}</div>${!data.img?`<div class="card-name-label">${data.n}</div>`:''}`;
      card.onclick = () => selectDeckEditorCard(data.n);
      card.oncontextmenu = (e) => { e.preventDefault(); openInspect(data); };
      if (!isUnlocked) card.classList.add('reward-locked','found-card');
    } else {
      card.classList.add('card-locked');
      card.style.backgroundColor = '#111';
      card.style.borderColor = '#333';
      card.innerHTML = `<div class="locked-question">?</div><div class="locked-mana">M${data.m}</div>`;
    }

    const name = document.createElement('div');
    name.className='pile-card-name';
    name.innerText = (isUnlocked || isDiscovered) ? data.n : '???';
    name.style.color = (isUnlocked || isDiscovered) ? '#ccc' : '#444';

    const stats = document.createElement('div');
    stats.className='pile-card-stats';
    stats.innerText = (isUnlocked || isDiscovered)
      ? `${UI_ICONS.atk} ${data.a}  ${UI_ICONS.hp} ${data.h}  ${UI_ICONS.mana} ${data.m}`
      : `${UI_ICONS.mana} ${data.m}`;
    stats.style.color = (isUnlocked || isDiscovered) ? '#888' : '#333';

    wrap.appendChild(card);
    wrap.appendChild(name);
    wrap.appendChild(stats);

    if (isUnlocked) {
      const controls = document.createElement('div');
      controls.className = 'deck-card-controls';
      const minusBtn = document.createElement('button');
      minusBtn.className = 'deck-btn';
      minusBtn.innerText = '-';
      minusBtn.disabled = !isSelected;
      minusBtn.onclick = () => removeCardFromDeck(data.n);
      const count = document.createElement('span');
      count.className = 'deck-count';
      count.innerText = `${getDeckCardCount(data.n)}/3`;
      const plusBtn = document.createElement('button');
      plusBtn.className = 'deck-btn';
      plusBtn.innerText = '+';
      plusBtn.disabled = !isSelected;
      plusBtn.onclick = () => addCardToDeck(data.n);
      controls.appendChild(minusBtn);
      controls.appendChild(count);
      controls.appendChild(plusBtn);
      wrap.appendChild(controls);
    }

    container.appendChild(wrap);
  });
}

function closeDeckEditor() { document.getElementById('deck-overlay').classList.remove('show'); }

function refreshShopUI() {
  ensureDailyQuest();
  ensureShopOffers();
  const goldEl = document.getElementById('shop-gold');
  const packsEl = document.getElementById('shop-pack-list');
  const offerList = document.getElementById('shop-offer-list');
  const sellList = document.getElementById('shop-sell-list');
  const questText = document.getElementById('daily-quest-text');
  const questProgress = document.getElementById('daily-quest-progress');
  const questClaim = document.getElementById('daily-quest-claim');
  if (goldEl) goldEl.innerHTML = `<img class="shop-inline-icon" src="${SHOP_UI_ICONS.coins}" alt="">${gold}`;
  if (offerList) {
    offerList.innerHTML = shopOffers.map((offer, index) => {
      const def = offer.type === 'item' ? getItemDef(offer.id) : getRecipeDef(offer.id);
      if (!def) return '';
      return `<div class="shop-offer-row">
        <div class="shop-offer-copy">
          <span class="shop-offer-name">${def.name}</span>
          <span class="shop-offer-meta">${RARITY_LABELS[def.rarity]} ${offer.type}</span>
        </div>
        <button class="menu-btn small-btn shop-offer-btn" onclick="buyShopOffer(${index})">${offer.price} Gold</button>
      </div>`;
    }).join('') || '<div class="battle-terminal-empty">No offers right now.</div>';
  }
  if (sellList) {
    const sellEntries = getInventoryEntries().filter(entry => getInventoryQuantity(entry) > 0).slice(0, 8);
    sellList.innerHTML = sellEntries.map(entry => {
      const qty = getInventoryQuantity(entry);
      return `<div class="shop-offer-row">
        <div class="shop-offer-copy">
          <span class="shop-offer-name">${entry.name}</span>
          <span class="shop-offer-meta">${RARITY_LABELS[entry.rarity]} ${entry.type} | Qty ${qty}</span>
        </div>
        <button class="menu-btn small-btn shop-offer-btn" onclick="sellInventoryEntry('${entry.type}','${entry.id}')">Sell ${getSellPrice(entry.type, entry.id)}</button>
      </div>`;
    }).join('') || '<div class="battle-terminal-empty">Nothing to sell yet.</div>';
  }
  if (packsEl) {
    packsEl.innerHTML = Object.values(SHOP_PACKS).map(pack => {
      const disabled = (pack.id === 'divine' && (getHighestClearedLevel() < 10 || divineVaultOpened)) ? 'disabled' : '';
      const status = pack.id === 'divine' && divineVaultOpened ? 'Opened' : `${pack.cost} Gold`;
      return `<button class="shop-pack-btn" onclick="openShopPack('${pack.id}')" onmouseenter="handleShopPackHover('${pack.id}')" ${disabled}>
        <span class="shop-pack-name"><img class="shop-inline-icon" src="${SHOP_UI_ICONS.chest}" alt="">${pack.name}</span>
        <span class="shop-pack-cost"><img class="shop-inline-icon" src="${SHOP_UI_ICONS.coins}" alt="">${status}</span>
        <span class="shop-pack-desc">${pack.description}</span>
      </button>`;
    }).join('');
  }
  if (questText && dailyQuest) questText.innerText = dailyQuest.text;
  if (questProgress && dailyQuest) questProgress.innerText = `${dailyQuest.progress}/${dailyQuest.goal}`;
  if (questClaim && dailyQuest) questClaim.disabled = dailyQuest.claimed || dailyQuest.progress < dailyQuest.goal;
}

function openShop() {
  refreshShopUI();
  document.getElementById('shop-overlay').classList.add('show');
  shopMerchantState.open = true;
  music.currentTime = 0;
  fadeAudio(music, 0, 500, () => music.pause());
  startShopMusic();
  playMerchantVoice('welcome', 'Welcome, traveler.');
}

function closeShop() {
  playMerchantVoice('exit', 'Safe travels, and spend boldly next time.');
  document.getElementById('shop-overlay').classList.remove('show');
  setTimeout(() => {
    stopShopAudio();
    music.currentTime = 0;
    music.volume = 0;
    music.play().catch(()=>{});
    fadeAudio(music, settings.bgmVolume, 600);
  }, 1800);
}

// â”€â”€ INSPECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openInspect(d) {
  discoverCard(d);
  pauseTimer();
  const content=document.getElementById('inspect-content');
  const border=factionBorder[d.faction]||'#f1c40f';
  content.style.borderColor=border;
  if(d.img){content.style.backgroundImage=`url('${d.img}')`;content.style.backgroundColor='';}
  else{content.style.backgroundImage='none';content.style.backgroundColor=d.color||'#1e1e1e';}
  document.getElementById('inspect-name').innerText    = d.n;
  document.getElementById('inspect-name').style.color  = border;
  document.getElementById('inspect-ability').innerText = d.ability||'';
  document.getElementById('inspect-lore').innerText    = d.lore||'';
  document.getElementById('inspect-mana').innerText    = `${UI_ICONS.mana} ${d.m}`;
  document.getElementById('inspect-atk').innerText     = `${UI_ICONS.atk} ${d.a}`;
  document.getElementById('inspect-hp').innerText      = `${UI_ICONS.hp} ${d.h}`;
  document.getElementById('inspect-overlay').style.display='flex';
}
function closeInspect() {
  document.getElementById('inspect-overlay').style.display='none';
  // only resume if no other modal is open
  const pileOpen     = document.getElementById('pile-overlay').classList.contains('show');
  const settingsOpen = document.getElementById('settings-overlay').classList.contains('show');
  const deckOpen     = document.getElementById('deck-overlay').classList.contains('show');
  const battleLogOpen = document.getElementById('battle-log-overlay').classList.contains('show');
  const inventoryOpen = document.getElementById('inventory-overlay').classList.contains('show');
  const shopOpen = document.getElementById('shop-overlay').classList.contains('show');
  if (!pileOpen && !settingsOpen && !deckOpen && !battleLogOpen && !inventoryOpen && !shopOpen) resumeTimer();
}

// Helper â€” shared mini-card for pile viewers
function makePileCardEl(data, clickable) {
  const wrap=document.createElement('div'); wrap.className='pile-card-wrap';
  const card=document.createElement('div'); card.className='pile-card';
  card.style.borderColor=factionBorder[data.faction]||'#888';
  if(data.img) card.style.backgroundImage=`url('${data.img}')`;
  else card.style.backgroundColor=data.color||'#1e1e1e';
  card.innerHTML=`<div class="m-cost">${data.m}</div>${!data.img?`<div class="card-name-label">${data.n}</div>`:''}`;
  if(clickable){ card.onclick=()=>openInspect(data); card.oncontextmenu=(e)=>{e.preventDefault();openInspect(data);}; }
  const name=document.createElement('div'); name.className='pile-card-name'; name.innerText=data.n;
  const stats=document.createElement('div'); stats.className='pile-card-stats'; stats.innerText=`${UI_ICONS.atk} ${data.a}  ${UI_ICONS.hp} ${data.h}  ${UI_ICONS.mana} ${data.m}`;
  wrap.appendChild(card); wrap.appendChild(name); wrap.appendChild(stats);
  return wrap;
}

function getMapKeyDirection(key) {
  switch (key) {
    case 'w':
    case 'W':
    case 'ArrowUp':
      return 'up';
    case 's':
    case 'S':
    case 'ArrowDown':
      return 'down';
    case 'a':
    case 'A':
    case 'ArrowLeft':
      return 'left';
    case 'd':
    case 'D':
    case 'ArrowRight':
      return 'right';
    default:
      return null;
  }
}

function handleMapKeyChange(event, pressed) {
  const direction = getMapKeyDirection(event.key);
  if (!direction || currentScreen !== 'screen-map') return;
  const tagName = document.activeElement?.tagName || '';
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') return;
  event.preventDefault();
  if (pressed) mapKeys.add(direction);
  else mapKeys.delete(direction);
  if (!pressed && mapKeys.size === 0) updateMapSprite(false);
}

// â”€â”€ LEFT-CLICK: close inspect when clicking outside it â”€â”€
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('inspect-overlay');
  const clickedInspectableCard = e.target.closest('.card, .pile-card');
  const clickedInspectContent = e.target.closest('#inspect-content');
  if (overlay.style.display === 'flex' && !clickedInspectableCard && !clickedInspectContent) {
    closeInspect();
  }
});

// Left-click deselect card
document.addEventListener('click', (e) => {
  if (!e.target.closest('.card') &&
      !e.target.closest('#inspect-overlay') &&
      !e.target.closest('#pile-modal') &&
      !e.target.closest('#settings-modal') &&
      !e.target.closest('#deck-modal') &&
      !e.target.closest('#card-action-bar')) {
    if (selectedCard) clearSelectedCard();
  }
});

document.addEventListener('click', (e) => {
  if (currentScreen !== 'screen-map') return;
  if (e.target.closest('.map-level-node') || e.target.closest('#map-level-info') || e.target.closest('#map-header')) return;
  const info = document.getElementById('map-level-info');
  if (info) info.classList.add('hidden');
  document.querySelectorAll('.map-level-node').forEach(node => node.classList.remove('node-selected'));
  mapSelectedLevel = null;
});

window.addEventListener('keydown', (event) => handleMapKeyChange(event, true));
window.addEventListener('keyup', (event) => handleMapKeyChange(event, false));
window.addEventListener('blur', () => {
  mapKeys.clear();
  updateMapSprite(false);
});
window.addEventListener('resize', () => {
  if (currentScreen === 'screen-map') renderMap();
});

// â”€â”€ Confirm pool loaded (call last) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Nothing auto-starts â€” user presses START â†’ map â†’ level


ensureCollectionInitialized();
ensureDeckInitialized();
loadProgress();
music.volume = settings.bgmVolume;
shopMerchantState.voice.volume = settings.voiceVolume;
shopMerchantState.music.volume = settings.bgmVolume;
document.getElementById('vol-slider').value = Math.round(settings.bgmVolume * 100);
document.getElementById('vol-label').innerText = `${Math.round(settings.bgmVolume * 100)}%`;
document.getElementById('voice-slider').value = Math.round(settings.voiceVolume * 100);
document.getElementById('voice-label').innerText = `${Math.round(settings.voiceVolume * 100)}%`;
document.getElementById('timer-label').innerText = settings.timerOn ? 'ON' : 'OFF';
document.getElementById('terminal-label').innerText = settings.terminalEnabled ? 'ON' : 'OFF';
const sortSelect = document.getElementById('sort-order');
if (sortSelect) sortSelect.value = settings.sortOrder;
refreshShopUI();
renderBattleTerminal();
renderBattleLogModal();
syncBattleTerminalUI();
updateCardActionBar();
