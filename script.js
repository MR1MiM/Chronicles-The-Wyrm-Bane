// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  CHRONICLES: THE WYRM-BANE â€” script.js
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let settings = { volume: 0.35, timerOn: true, sortOrder: 'faction' };

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
const BASE_UNLOCKED_CARDS = 9;
let firstPlayDiscountUsed = false;
let ownedCardNames = new Set();
let discoveredCardNames = new Set();
let rewardChoices = [];
let selectedRewardNames = new Set();
let playerCardsPlayedThisTurn = 0;
let crystals = 0;
const CHEST_COST = 10;
const MAX_CARDS_PER_TURN = 5;
const BATTLE_LOG_LIMIT = 180;
let battleLog = [];
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

// â”€â”€ AUDIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const music = new Audio('./public/main-theme.mp3');
music.loop = true; music.volume = settings.volume;
window.addEventListener('pointerdown', () => music.play().catch(()=>{}), { once: true });

function setVolume(v) {
  settings.volume = v / 100; music.volume = settings.volume;
  document.getElementById('vol-label').innerText = v + '%';
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
}
function setSortOrder(v) { settings.sortOrder = v; renderPileCards(); }

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
  refreshShopUI();
  if (id === 'screen-map') renderMap();
}

// â”€â”€ SETTINGS MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function openSettings() {
  pauseTimer();
  updateTimerSettingAvailability();
  document.getElementById('settings-overlay').classList.add('show');
}
function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('show');
  resumeTimer();
}

// â”€â”€ ENEMIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const enemies = [
  { name:'Vaelthor the Ashwalker',    hp:15, mana:4,  title:'Lv.1 - Wanderer of Cinders' },
  { name:'Seraphix Dawnbreaker',      hp:17, mana:5,  title:'Lv.2 - Herald of False Light' },
  { name:'Gorthnak the Unburied',     hp:19, mana:6,  title:'Lv.3 - Warlord of the Dead March' },
  { name:'Izael, Mirror-Born',        hp:21, mana:6,  title:'Lv.4 - The Reflected Tyrant' },
  { name:'Cruethis the Hollow King',  hp:23, mana:7,  title:'Lv.5 - Sovereign of Empty Thrones' },
  { name:'Yendrakh of the Spiral',    hp:25, mana:8,  title:'Lv.6 - Architect of Ruin' },
  { name:'Solvaine the Moonreaper',   hp:27, mana:8,  title:'Lv.7 - Harvester of Souls' },
  { name:'Drakmor the Everburning',   hp:29, mana:9,  title:'Lv.8 - Flame That Refuses to Die' },
  { name:'Thessivane, World-Eater',   hp:32, mana:9,  title:'Lv.9 - Hunger Given Form' },
  { name:'The Nameless Sovereign',    hp:36, mana:10, title:'Lv.10 - That Which Should Not Rule' }
];

// â”€â”€ MAP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderMap() {
  const container = document.getElementById('map-path');
  container.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const e = enemies[i-1];
    const done  = clearedLevels.includes(i);
    const avail = i === 1 || clearedLevels.includes(i-1);
    const locked = !avail && !done;
    const statusText = done ? 'Cleared' : locked ? 'Locked' : 'Available';
    const node = document.createElement('div');
    node.className = 'map-node ' + (done ? 'node-done' : avail ? 'node-available' : 'node-locked');
    node.innerHTML = `
      <div class="node-number">Level ${i}</div>
      <div class="node-name">${e.name}</div>
      <div class="node-status">${statusText}</div>
      <div class="node-title">${e.title}</div>`;
    if (!locked) node.onclick = () => startLevel(i);
    container.appendChild(node);
    if (i < 10) {
      const conn = document.createElement('div');
      conn.className = 'map-connector' + (done ? ' conn-done' : '');
      container.appendChild(conn);
    }
  }
}

// â”€â”€ CARD UNLOCK SYSTEM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Cards unlocked = 3 per level cleared + base 3 (covers level 1 low-cost cards)
// Cards in pool are sorted by mana cost so low-cost cards unlock first
const poolSortedByMana = null; // computed after pool defined

function ensureCollectionInitialized() {
  if (ownedCardNames.size) return;
  const starters = [...pool].sort((a,b) => a.m - b.m || a.n.localeCompare(b.n)).slice(0, BASE_UNLOCKED_CARDS);
  starters.forEach(card => {
    ownedCardNames.add(card.n);
    discoveredCardNames.add(card.n);
  });
}

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

function ensureDeckInitialized() {
  ensureCollectionInitialized();
  if (playerDeckList.length >= 20) return;
  playerDeckList = [];
  const ownedCards = getAvailablePool().sort((a,b)=>a.m-b.m||a.n.localeCompare(b.n));
  let idx = 0;
  while (playerDeckList.length < 20 && ownedCards.length) {
    const card = ownedCards[idx % ownedCards.length];
    if (getDeckCardCount(card.n) < 3) playerDeckList.push(card.n);
    idx++;
    if (idx > 400) break;
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
    crystals
  };
  localStorage.setItem('wyrmbane_progress_v1', JSON.stringify(payload));
}

function loadProgress() {
  ensureCollectionInitialized();
  ensureDeckInitialized();
  const raw = localStorage.getItem('wyrmbane_progress_v1');
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p.clearedLevels)) clearedLevels = p.clearedLevels;
    if (Array.isArray(p.ownedCards)) ownedCardNames = new Set(p.ownedCards);
    if (Array.isArray(p.discoveredCards)) discoveredCardNames = new Set(p.discoveredCards);
    if (Array.isArray(p.deckList)) {
      const clean = [];
      const copyCount = {};
      p.deckList.forEach(n => {
        if (!getCardByName(n)) return;
        copyCount[n] = (copyCount[n] || 0) + 1;
        if (copyCount[n] <= 3 && clean.length < 35) clean.push(n);
      });
      playerDeckList = clean;
    }
    if (typeof p.crystals === 'number') crystals = Math.max(0, Math.floor(p.crystals));
  } catch {}
  ensureCollectionInitialized();
  ensureDeckInitialized();
}

// â”€â”€ START LEVEL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function startLevel(lvl) {
  ensureDeckInitialized();
  if (playerDeckList.length < 20 || playerDeckList.length > 35) {
    flashMessage('Deck must have 20 to 35 cards.');
    return;
  }
  currentLevel = lvl; currentEnemy = enemies[lvl-1];
  closeBattleLog();
  resetBattleLog();
  addBattleLogEntry(`Entering Level ${lvl}: ${currentEnemy.name}`, 'system');
  showScreen('screen-game');
  resetGame();
}
function retryLevel() { closeBattleLog(); document.getElementById('gameover-overlay').classList.remove('show'); resetGame(); }
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

  const lvl = currentLevel;
  playerHP = 20;
  enemyHP  = currentEnemy.hp; enemyMaxHP = currentEnemy.hp;
  // Player mana: 6 at lv1, +2 per level, cap 16
  maxMana = Math.min(6 + (lvl - 1) * 2, 16); mana = maxMana;
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

  isPlayerTurn = true;
  document.getElementById('end-btn').disabled = false;
  updateUI();
  if (settings.timerOn) startTurnTimer();
  showTurnBanner('YOUR TURN', false);
}

// â”€â”€ CARD POOL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const factionOrder = ['red','blue','green','cyan','purple','pink'];
const factionBorder = { red:'#c0392b', blue:'#2980b9', green:'#27ae60', cyan:'#16a085', purple:'#8e44ad', pink:'#e91e8c' };

const pool = [
  // RED
  { n:'Squire of Cinders',          m:1, a:1, h:1,  img:'public/red/Squire of Cinders.png',           faction:'red',  ability:'Bravery: Gains +1 ATK if attacking a unit with higher HP.',                     lore:'Every great knight was once someone\'s errand boy. This one grew up on a volcano.\n\nToo stubborn to notice he was supposed to die.' },
  { n:'Blood-Bound Duelist',        m:2, a:2, h:2,  img:'public/red/Blood-Bound Duelist.png',          faction:'red',  ability:'Parry: The first time this unit is attacked each turn, it takes 0 damage.',       lore:'She swore a blood oath to her blade the night she lost her partner.\n\nThe hand that holds it never shakes.' },
  { n:'Flame-Wielder Mage',         m:3, a:3, h:1,  img:'public/red/Flame-Wielder Mage.png',           faction:'red',  ability:'Fireball: When played, deal 1 damage to any unit in an adjacent lane.',           lore:'Magic school expelled him for reckless experimentation.\n\nHis lecture notes are still on fire.' },
  { n:'Ironclad Sentinel',          m:4, a:2, h:5,  img:'public/red/Ironclad Sentinel.png',            faction:'red',  ability:'Guardian: Opponents in this lane must attack this card first.',                    lore:'They poured the armour while he was still standing in it.\n\nHe hasn\'t taken it off since.' },
  { n:'Dragon-Slayer Knight',       m:5, a:4, h:4,  img:'public/red/Dragon-Slayer Knight.png',         faction:'red',  ability:'Slayer: Deals double damage to units with 6+ HP.',                               lore:'He faced the wyrm alone from dusk to dawn.\n\nNow known as the Wyrm-Bane, he seeks the strongest monsters.' },
  { n:'Stone-Crusher Catapult',     m:5, a:5, h:2,  img:'public/red/Stone-Crusher Catapult.png',       faction:'red',  ability:'Siege: Can attack Building cards directly from the Back Area.',                   lore:'The enemy fortress said nothing - because it no longer had walls.\n\nPoint made.' },
  { n:'Phoenix Paladin',            m:6, a:3, h:3,  img:'public/red/Phoenix Paladin.png',              faction:'red',  ability:'Rebirth: When destroyed, return to hand (costs +2 MP next play).',               lore:'She\'s been killed in battle exactly seven times. Each time she wakes up angrier.' },
  { n:'Highland War-Chieftain',     m:7, a:5, h:6,  img:'public/red/Highland War-Chieftain.png',       faction:'red',  ability:'War Cry: All other Red units on your board gain +1 ATK permanently.',            lore:'He doesn\'t give speeches. He gives one word.\n\nEvery enemy learns what it means - very briefly.' },
  { n:'General of the Ravaged Sun', m:8, a:6, h:7,  img:'public/red/General of the Ravaged Sun.png',  faction:'red',  ability:'Tactician: Move one unit to an adjacent lane for 0 Mana once per turn.',          lore:'She lost exactly one battle - on purpose, to trap the enemy\'s reserves.' },
  // BLUE
  { n:'Spore Scout',         m:1, a:1, h:2,  color:'#0a3a5a', faction:'blue',   ability:'Pollen Path: When played, look at the top card of your deck.',               lore:'By the time you see one, it has already seen everything.' },
  { n:'Thorned Vine',        m:2, a:2, h:1,  color:'#1a4a2a', faction:'blue',   ability:'Barbed: Deals 1 damage to any unit that attacks it in melee.',               lore:'Every inch of it is a decision the forest made to be dangerous.' },
  { n:'Snap-Trap Lily',      m:3, a:1, h:3,  color:'#2a5a1a', faction:'blue',   ability:'Snare: If an enemy enters this lane, this unit attacks immediately.',        lore:'It smells like honey and rot. Hunger works both ways.' },
  { n:'Ironwood Root',       m:4, a:0, h:7,  color:'#1a3a1a', faction:'blue',   ability:'Wall: Cannot attack, but restores 1 HP to itself every turn.',              lore:'The forest doesn\'t fight back. It just outlasts everything.' },
  { n:'Blue-Leaf Alchemist', m:5, a:2, h:4,  color:'#0a2a4a', faction:'blue',   ability:'Brew: Your healing effects gain +1 HP while this is on board.',             lore:'She distills cures from plants that have never been named.' },
  { n:'Whispering Willow',   m:5, a:3, h:5,  color:'#1a4a3a', faction:'blue',   ability:'Soothe: Reduces the ATK of the unit in front of it by -1.',                 lore:'Armies have re-routed entire marches to avoid it.' },
  { n:'Ancient Treant',      m:7, a:5, h:6,  color:'#0a3a0a', faction:'blue',   ability:'Trample: If this card destroys a unit, deal 1 DMG to the opponent.',        lore:'It remembers when these were all forests. It doesn\'t hurry.' },
  { n:'Lotus Queen',         m:8, a:4, h:8,  color:'#1a2a5a', faction:'blue',   ability:'Bloom: At start of your turn, gain +1 Mana.',                               lore:'She blooms once every century. When she opens, the world is remade.' },
  { n:'Great Forest Heart',  m:9, a:6, h:10, color:'#004a2a', faction:'blue',   ability:'Photosynthesis: Gains +2 ATK / +2 HP if the World is Nature.',              lore:'You can hear it if the woods go completely silent.' },
  // GREEN
  { n:'Mossy Monolith',      m:1, a:0, h:4,  color:'#2a4a1a', faction:'green',  ability:'Foundation: Your first card play each turn costs -1 MP.',                   lore:'No one built it. The locals just started building around it.' },
  { n:'Vine-Choked Gate',    m:2, a:1, h:5,  color:'#1a3a10', faction:'green',  ability:'Overgrowth: Units moving out of this lane must pay 1 extra MP.',            lore:'The gate was iron once. The vines didn\'t stop.' },
  { n:'Emerald Totem',       m:3, a:0, h:6,  color:'#1a5a2a', faction:'green',  ability:'Resonance: Gives all Plant units in adjacent lanes +1 ATK.',               lore:'Plant life within a mile grows twice as sharp.' },
  { n:'Ancient Ruins',       m:4, a:0, h:8,  color:'#3a5a1a', faction:'green',  ability:'Nature\'s Call: Blue/Green units gain +1/+1.',                              lore:'Only the shape of the stones suggests it once mattered enormously.' },
  { n:'Verdant Forge',       m:5, a:2, h:5,  color:'#2a5a10', faction:'green',  ability:'Craft: Pay 1 MP to give a Red unit +2 ATK once per turn.',                 lore:'The swords it produces have a faint green hue. They grow.' },
  { n:'Stone-Watcher Idol',  m:6, a:4, h:6,  color:'#4a5a2a', faction:'green',  ability:'Gaze: Enemy units in this lane cannot use Special Abilities.',             lore:'Its eyes are shut but everything in front of it feels observed.' },
  { n:'Hidden Grove',        m:7, a:0, h:10, color:'#1a4a00', faction:'green',  ability:'Conceal: Your units here cannot be targeted by Spells.',                   lore:'Scouts sent to find it report finding a pleasant clearing, then forget why they were there.' },
  { n:'Great Earth Engine',  m:8, a:5, h:8,  color:'#3a4a00', faction:'green',  ability:'Tremor: At end of turn, deal 1 damage to all enemy Front Area units.',    lore:'Someone pointed out it could also be aimed.' },
  { n:'Yggdrasil Pillar',    m:9, a:7, h:12, color:'#004a00', faction:'green',  ability:'Eternal Life: If destroyed, returns to your hand at end of turn.',         lore:'You can\'t destroy it. It finds its way back. It always does.' },
  // CYAN
  { n:'Larva Scout',         m:1, a:1, h:1,  color:'#004a4a', faction:'cyan',   ability:'Skitter: Can move to an adjacent lane for 0 Mana.',                        lore:'There\'s always more where it came from. That\'s the part that should worry you.' },
  { n:'Noxious Wasp',        m:2, a:2, h:1,  color:'#0a3a4a', faction:'cyan',   ability:'Stinger: When this unit dies, the killer loses -1 ATK.',                   lore:'The wasp doesn\'t need to win. It just needs to sting once.' },
  { n:'Plague Rat',          m:3, a:1, h:3,  color:'#1a4a4a', faction:'cyan',   ability:'Infection: Each turn alive, gains +1 HP and +1 ATK.',                      lore:'On day one it\'s a rat. By day ten it\'s the reason the village doesn\'t exist.' },
  { n:'Acidic Slime',        m:4, a:2, h:4,  color:'#2a5a4a', faction:'cyan',   ability:'Corrode: Attacks ignore Armored status of enemy buildings.',               lore:'Armour, walls, hope - same thing to the slime. Lunch.' },
  { n:'Deep-Sea Terror',     m:5, a:4, h:5,  color:'#003a5a', faction:'cyan',   ability:'Submerge: Cannot be targeted by Spells in the Back Area.',                 lore:'It moved like darkness deciding to have a shape.' },
  { n:'Chimeric Beast',      m:6, a:5, h:5,  color:'#1a3a5a', faction:'cyan',   ability:'Adapt: When played, choose +2 ATK or +2 HP.',                             lore:'Do not approach. Do not name.' },
  { n:'Hive Queen',          m:7, a:3, h:8,  color:'#2a4a5a', faction:'cyan',   ability:'Spawn: At end of turn, summon a 1/1 Larva in an empty lane.',              lore:'She doesn\'t command. She broadcasts. The colony is her body.' },
  { n:'Colossal Behemoth',   m:8, a:7, h:9,  color:'#003a4a', faction:'cyan',   ability:'Siege Monster: Deals double damage to Buildings.',                         lore:'It just knows that some things resist it and it doesn\'t like that.' },
  { n:'Hydra of the Abyss',  m:9, a:5, h:12, color:'#001a3a', faction:'cyan',   ability:'Regrow: Whenever this unit takes damage, it gains +1 ATK.',               lore:'No one has found the point where that stops being true.' },
  // PURPLE
  { n:'Leaching Pillar',     m:1, a:0, h:4,  color:'#3a005a', faction:'purple', ability:'Siphon: At start of your turn, deal 1 DMG to enemy life pool.',           lore:'Standing near it too long makes everything feel pointless. In battle, that\'s a weapon.' },
  { n:'Dark Library',        m:2, a:0, h:5,  color:'#2a0a4a', faction:'purple', ability:'Forbidden Lore: Look at the top 3 cards of your deck every turn.',        lore:'Reading is free. Understanding costs something else.' },
  { n:'Cursed Obelisk',      m:3, a:2, h:6,  color:'#4a0a5a', faction:'purple', ability:'Pain: Can attack, but every attack costs you 1 HP.',                      lore:'Power is still available. The price hasn\'t changed.' },
  { n:'Void Gate',           m:4, a:0, h:7,  color:'#1a005a', faction:'purple', ability:'Summoning: Reduces cost of Monster cards in this lane by 1.',             lore:'Controlling what comes through is the part that requires talent.' },
  { n:'The Dark Hospital',   m:5, a:0, h:8,  color:'#2a0a3a', faction:'purple', ability:'Regeneration: Heals 1 unit for 3 HP, goes passive 4 turns.',             lore:'Patients leave healthier. They also leave quieter. Permanently.' },
  { n:'Sacrificial Altar',   m:6, a:0, h:8,  color:'#5a0a2a', faction:'purple', ability:'Ritual: Destroy one of your units to gain Mana equal to its MP cost.',   lore:'Everything offered here is accepted. The altar has never been picky.' },
  { n:'Tower of Whispers',   m:7, a:0, h:10, color:'#3a002a', faction:'purple', ability:'Paralyze: Enemy units here cannot activate Special Abilities.',           lore:'Units start forgetting what they were trained to do. Then forget why it matters.' },
  { n:'Necromancer\'s Keep', m:8, a:0, h:12, color:'#2a0a5a', faction:'purple', ability:'Resurrect: When a unit dies here, summon a 1/1 Skeleton.',               lore:'It learned the process by watching him do it. It\'s been practicing ever since.' },
  { n:'The Abyss Throne',    m:9, a:5, h:15, color:'#1a0a3a', faction:'purple', ability:'Despair: While active, opponent cannot draw more than 1 card per turn.', lore:'Every conqueror who claimed it ended up serving it instead.' },
  // PINK
  { n:'Mind Flick',          m:1, a:1, h:1,  color:'#5a1a4a', faction:'pink',   ability:'Distract: Opponent reveals a random card from their hand.',               lore:'It makes you forget what you were about to do, at exactly the wrong moment.' },
  { n:'Dark Surge',          m:2, a:3, h:1,  color:'#4a0a4a', faction:'pink',   ability:'Energy: Gives one of your units +2 ATK for this turn only.',              lore:'Thirty seconds is a long time in a fight.' },
  { n:'Amnesia',             m:3, a:2, h:1,  color:'#3a0a3a', faction:'pink',   ability:'Forget: Forces the opponent to discard 1 card.',                          lore:'You only notice what\'s missing when you reach for it and find air.' },
  { n:'Gravity Well',        m:4, a:2, h:2,  color:'#5a0a5a', faction:'pink',   ability:'Anchor: Move an enemy unit from one lane to another.',                    lore:'Physics is mostly a suggestion when you know which questions to ask it.' },
  { n:'Shadow Copy',         m:5, a:2, h:3,  color:'#4a1a5a', faction:'pink',   ability:'Mimic: Creates a 1/1 copy of any unit on the board.',                    lore:'The copy believes it\'s the original. That conviction is a kind of power.' },
  { n:'Psychic Scream',      m:6, a:3, h:2,  color:'#6a0a4a', faction:'pink',   ability:'Stun: All units in a targeted lane cannot attack next turn.',             lore:'Most units answer whether to keep existing incorrectly for one full turn.' },
  { n:'Possession',          m:7, a:4, h:2,  color:'#5a004a', faction:'pink',   ability:'Control: Take control of enemy unit with 3 HP or less for 1 turn.',      lore:'The host fights with full conviction. They just couldn\'t stop themselves.' },
  { n:'Memory Wipe',         m:8, a:3, h:3,  color:'#3a003a', faction:'pink',   ability:'Nullify: Opponent cannot use special abilities for 2 turns.',             lore:'They\'ve simply forgotten where they put it.' },
  { n:'Cataclysm',           m:9, a:6, h:4,  color:'#6a006a', faction:'pink',   ability:'Ruination: Destroy all units in the Front Area.',                        lore:'They cast it anyway. That\'s how bad things were.' }
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

function playPlayerHandCardToSlot(card, slot) {
  if (!card || !slot || slot.querySelector('.card')) return false;
  const data = getCardData(card);
  const { playCost, usedFirstPlayDiscount } = getPlayerPlayCost(data);
  if (playCost > mana) {
    flashMessage('Not enough mana!');
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
  playerCardsPlayedThisTurn++;
  applyCardAbility(card, 'player', 'onPlay');
  card.classList.add('card-play-anim');
  setTimeout(() => card.classList.remove('card-play-anim'), 400);
  updateUI();
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
  return el;
}

function drawCardForOwner(owner, animate=true, countTurnDraw=true) {
  if (owner === 'player') {
    return drawCard(animate, countTurnDraw);
  }
  if (enemyDeck.length === 0) return null;
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
  container.innerHTML = entries.map(entry => `<div class="battle-log-line"><strong>[${formatBattleLogSource(entry.type)}]</strong> ${entry.message}</div>`).join('');
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
  if (!message) return;
  battleLog.push({ message, type });
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
  renderBattleLogModal();
  document.getElementById('battle-log-overlay').classList.add('show');
}

function closeBattleLog() {
  document.getElementById('battle-log-overlay').classList.remove('show');
}

function logAbilityActivation(owner, cardData, detail = '') {
  if (!cardData || !cardData.ability) return;
  const actor = owner === 'player' ? 'You' : 'Enemy';
  const abilityName = getAbilityName(cardData) || cardData.n;
  const suffix = detail ? ` ${detail}` : '';
  addBattleLogEntry(`${actor} activated ${abilityName} on ${cardData.n}.${suffix}`, 'ability');
}

function abilitiesSuppressed(owner) {
  return owner === 'player' ? playerAbilitySilenceTurns > 0 : enemyAbilitySilenceTurns > 0;
}

function applyCardAbility(card, owner, trigger, ctx = {}) {
  if (!card || !card.isConnected) return;
  if (abilitiesSuppressed(owner)) return;
  const data = getCardData(card);
  const slot = card.closest('.slot');
  const enemyOwner = owner === 'player' ? 'enemy' : 'player';
  const ownBoard = getBoardCards(owner);
  const enemyBoard = getBoardCards(enemyOwner);
  const opposingSlot = slot ? getOpposingSlot(slot) : null;
  const opposingCard = opposingSlot ? opposingSlot.querySelector('.card') : null;

  if (trigger === 'onPlay') {
    switch (data.n) {
      case 'Flame-Wielder Mage': {
        logAbilityActivation(owner, data, 'It scorched an adjacent lane.');
        const targets = slot ? getAdjacentLaneIndices(getSlotIndex(slot)).map(i => getBoardSlots(enemyOwner)[i]?.querySelector('.card')).filter(Boolean) : [];
        const target = getRandomItem(targets);
        if (target) dealDamageToCard(target, 1);
        break;
      }
      case 'War Cry': // dead branch safeguard
        break;
      case 'Highland War-Chieftain':
        logAbilityActivation(owner, data, 'Red allies gained attack.');
        ownBoard.filter(other => other !== card && getCardData(other).faction === 'red').forEach(other => {
          const d = getCardData(other); d.a += 1; setCardData(other, d);
        });
        break;
      case 'Spore Scout': {
        logAbilityActivation(owner, data, 'It checked the top card of the deck.');
        const top = owner === 'player' ? playerDeck[playerDeck.length - 1] : enemyDeck[enemyDeck.length - 1];
        if (top && owner === 'player') flashMessage(`Top card: ${top.n}`);
        break;
      }
      case 'Whispering Willow':
        logAbilityActivation(owner, data, 'The opposing unit lost attack.');
        if (opposingCard) {
          const d = getCardData(opposingCard); d.a = Math.max(0, d.a - 1); setCardData(opposingCard, d);
        }
        break;
      case 'General of the Ravaged Sun':
      case 'Larva Scout': {
        logAbilityActivation(owner, data, 'It repositioned to a new lane.');
        if (slot) {
          const adj = getAdjacentLaneIndices(getSlotIndex(slot)).map(i => getBoardSlots(owner)[i]).filter(s => s && !s.querySelector('.card'));
          const moveSlot = getRandomItem(adj);
          if (moveSlot) moveSlot.appendChild(card);
        }
        break;
      }
      case 'Snap-Trap Lily':
        logAbilityActivation(owner, data, 'It struck immediately.');
        if (opposingCard) dealDamageToCard(opposingCard, Math.max(1, data.a));
        break;
      case 'Great Forest Heart':
        logAbilityActivation(owner, data, 'It empowered itself from allied nature units.');
        if (ownBoard.some(other => other !== card && ['blue','green'].includes(getCardData(other).faction))) {
          data.a += 2; data.h += 2; setCardData(card, data);
        }
        break;
      case 'Deep-Sea Terror':
        logAbilityActivation(owner, data, 'It grew tougher on arrival.');
        data.h += 1;
        setCardData(card, data);
        break;
      case 'Vine-Choked Gate':
        logAbilityActivation(owner, data, 'Nearby enemies were weakened.');
        if (slot) {
          getAdjacentLaneIndices(getSlotIndex(slot)).forEach(i => {
            const target = getBoardSlots(enemyOwner)[i]?.querySelector('.card');
            if (target) { const d = getCardData(target); d.a = Math.max(0, d.a - 1); setCardData(target, d); }
          });
        }
        break;
      case 'Stone-Watcher Idol':
      case 'Tower of Whispers':
        logAbilityActivation(owner, data, 'The opposing lane was silenced.');
        if (opposingCard) {
          const d = getCardData(opposingCard); d.stunnedTurns = Math.max(d.stunnedTurns || 0, 1); setCardData(opposingCard, d);
        }
        break;
      case 'Void Gate':
        logAbilityActivation(owner, data, 'It generated extra mana.');
        if (owner === 'player') mana += 1;
        else enemyMana += 1;
        break;
      case 'The Abyss Throne':
        logAbilityActivation(owner, data, 'A card was stripped from the opposing hand.');
        if (owner === 'player' && enemyHand.length) enemyHand.pop();
        else if (owner === 'enemy') {
          const hand = [...document.getElementById('hand').querySelectorAll('.card')];
          const discard = getRandomItem(hand);
          if (discard) {
            playerGrave.push(getCardData(discard));
            discard.remove();
          }
        }
        break;
      case 'Emerald Totem':
        logAbilityActivation(owner, data, 'Adjacent allies were strengthened.');
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
        logAbilityActivation(owner, data, 'Blue and green allies were reinforced.');
        ownBoard.filter(other => {
          const d = getCardData(other);
          return d.faction === 'blue' || d.faction === 'green';
        }).forEach(other => {
          const d = getCardData(other); d.a += 1; d.h += 1; setCardData(other, d);
        });
        break;
      case 'Chimeric Beast':
        logAbilityActivation(owner, data, 'It adapted for more attack.');
        data.a += 2;
        setCardData(card, data);
        break;
      case 'Mind Flick': {
        logAbilityActivation(owner, data, 'It probed the enemy hand.');
        if (owner === 'player' && enemyHand.length) flashMessage(`Enemy is holding: ${enemyHand[enemyHand.length - 1].n}`);
        break;
      }
      case 'Dark Surge': {
        logAbilityActivation(owner, data, 'An ally received a temporary attack boost.');
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
        logAbilityActivation(owner, data, 'The opponent discarded a card.');
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
        logAbilityActivation(owner, data, 'An enemy unit was pulled into a new lane.');
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
        logAbilityActivation(owner, data, 'It created a copy on the board.');
        const source = getRandomItem([...ownBoard, ...enemyBoard].filter(other => other !== card));
        const empty = getRandomItem(getBoardSlots(owner).filter(s => !s.querySelector('.card')));
        if (source && empty) {
          const src = getCardData(source);
          summonToken(owner, empty, { ...src, a: 1, h: 1, m: src.m, n: `${src.n} Copy` });
        }
        break;
      }
      case 'Psychic Scream': {
        logAbilityActivation(owner, data, 'A full lane was stunned.');
        const lane = Math.floor(Math.random() * 4);
        getLaneCards(enemyOwner, lane).forEach(target => {
          const d = getCardData(target);
          d.stunnedTurns = Math.max(d.stunnedTurns || 0, 1);
          setCardData(target, d);
        });
        break;
      }
      case 'Possession': {
        logAbilityActivation(owner, data, 'An enemy unit was taken over.');
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
        logAbilityActivation(owner, data, 'Enemy abilities were disabled for two turns.');
        if (owner === 'player') enemyAbilitySilenceTurns = Math.max(enemyAbilitySilenceTurns, 2);
        else playerAbilitySilenceTurns = Math.max(playerAbilitySilenceTurns, 2);
        break;
      case 'Cataclysm':
        logAbilityActivation(owner, data, 'The front line was destroyed.');
        getBoardSlots('player').slice(0, 4).forEach(s => { const c = s.querySelector('.card'); if (c) sendToGrave(c, 'player'); });
        getBoardSlots('enemy').slice(0, 4).forEach(s => { const c = s.querySelector('.card'); if (c) sendToGrave(c, 'enemy'); });
        break;
    }
  }

  if (trigger === 'onStartTurn') {
    switch (data.n) {
      case 'Ironwood Root':
        logAbilityActivation(owner, data, 'It restored its health.');
        healCard(card, 1);
        break;
      case 'Lotus Queen':
        logAbilityActivation(owner, data, 'It granted bonus mana.');
        if (owner === 'player') mana += 1;
        else enemyMana += 1;
        break;
      case 'Plague Rat':
        logAbilityActivation(owner, data, 'It kept growing stronger.');
        data.a += 1; data.h += 1; setCardData(card, data);
        break;
      case 'Leaching Pillar':
        logAbilityActivation(owner, data, 'It drained the opposing life pool.');
        if (owner === 'player') enemyHP = Math.max(0, enemyHP - 1);
        else playerHP = Math.max(0, playerHP - 1);
        break;
      case 'Dark Library':
        logAbilityActivation(owner, data, 'It revealed upcoming cards.');
        if (owner === 'player') flashMessage(`Library sees: ${playerDeck.slice(-3).map(c => c.n).join(', ') || 'nothing'}`);
        break;
      case 'Verdant Forge': {
        logAbilityActivation(owner, data, 'It forged a stronger red ally.');
        const target = getRandomItem(ownBoard.filter(other => getCardData(other).faction === 'red'));
        if (target && ((owner === 'player' && mana > 0) || (owner === 'enemy' && enemyMana > 0))) {
          if (owner === 'player') mana -= 1;
          else enemyMana -= 1;
          const d = getCardData(target); d.a += 2; setCardData(target, d);
        }
        break;
      }
      case 'Hidden Grove':
        logAbilityActivation(owner, data, 'It restored units in its lane.');
        if (slot) {
          getLaneCards(owner, getLane(getSlotIndex(slot))).forEach(target => {
            if (target !== card) healCard(target, 1);
          });
        }
        break;
      case 'Sacrificial Altar': {
        logAbilityActivation(owner, data, 'It traded an ally for mana.');
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
          logAbilityActivation(owner, data, 'It healed an ally.');
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
        logAbilityActivation(owner, data, 'It shook the enemy front line.');
        getBoardSlots(enemyOwner).slice(0, 4).forEach(s => { const c = s.querySelector('.card'); if (c) dealDamageToCard(c, 1); });
        break;
      case 'Hive Queen': {
        logAbilityActivation(owner, data, 'It spawned a larva token.');
        const empty = getRandomItem(getBoardSlots(owner).filter(s => !s.querySelector('.card')));
        if (empty) summonToken(owner, empty, { n:'Larva Token', m:1, a:1, h:1, color:'#004a4a', faction:'cyan', ability:'', lore:'' });
        break;
      }
    }
  }

  if (trigger === 'modifyAttack' && ctx.targetData) {
    switch (data.n) {
      case 'Squire of Cinders':
        logAbilityActivation(owner, data, 'It gained bonus attack against a stronger target.');
        if (ctx.targetData.h > data.h) ctx.attackBonus = (ctx.attackBonus || 0) + 1;
        break;
      case 'Dragon-Slayer Knight':
        logAbilityActivation(owner, data, 'It struck for double damage.');
        if (ctx.targetData.h >= 6) ctx.attackMultiplier = 2;
        break;
      case 'Cursed Obelisk':
        logAbilityActivation(owner, data, 'Its attack cost life.');
        if (owner === 'player') playerHP = Math.max(0, playerHP - 1);
        else enemyHP = Math.max(0, enemyHP - 1);
        break;
      case 'Stone-Crusher Catapult':
      case 'Colossal Behemoth':
      case 'Acidic Slime':
        logAbilityActivation(owner, data, 'It dealt siege damage.');
        ctx.attackBonus = (ctx.attackBonus || 0) + 1;
        break;
    }
  }

  if (trigger === 'onDefend' && ctx.attackerData) {
    switch (data.n) {
      case 'Blood-Bound Duelist':
        if (!data.parryUsed) {
          logAbilityActivation(owner, data, 'It blocked the first strike.');
          data.parryUsed = true;
          setCardData(card, data);
          ctx.preventDamageToDefender = true;
        }
        break;
      case 'Thorned Vine':
        logAbilityActivation(owner, data, 'It damaged the attacker.');
        if (ctx.attackerCard) dealDamageToCard(ctx.attackerCard, 1);
        break;
    }
  }

  if (trigger === 'onDamaged') {
    switch (data.n) {
      case 'Hydra of the Abyss':
        logAbilityActivation(owner, data, 'It grew stronger after taking damage.');
        data.a += 1;
        setCardData(card, data);
        break;
    }
  }

  if (trigger === 'onKill') {
    switch (data.n) {
      case 'Ancient Treant':
        logAbilityActivation(owner, data, 'It trampled damage into the opposing hero.');
        if (owner === 'player') enemyHP = Math.max(0, enemyHP - 1);
        else playerHP = Math.max(0, playerHP - 1);
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
      if (grid.classList.contains('player-side')) { slot.ondrop=drop; slot.ondragover=allowDrop; }
      if (grid.classList.contains('enemy-side'))  { slot.onclick=()=>attack(slot); }
      grid.appendChild(slot);
    }
  });
}

// â”€â”€ DRAW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function drawCard(animate=true, countTurnDraw=true) {
  if (playerDeck.length === 0) { showGameOver(false,'You ran out of cards!'); return null; }
  if (countTurnDraw) playerTurnDraws++;
  return addCardToHand('player', playerDeck.pop(), animate);
}

// â”€â”€ CARD ELEMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function makeCardElement(data, fresh=false) {
  const el = document.createElement('div');
  el.className = 'card';
  el.id = 'c-'+Math.random().toString(36).substr(2,6);
  const d = {...data, attacked:false, sick:fresh};
  el.dataset.logic = JSON.stringify(d);
  styleCard(el, d);
  return el;
}

function styleCard(el, data) {
  const border = factionBorder[data.faction]||'#888';
  const abilityName = getAbilityName(data);
  if (data.img) { el.style.backgroundImage=`url('${data.img}')`; el.style.backgroundColor=''; }
  else          { el.style.backgroundImage='none'; el.style.backgroundColor=data.color||'#1e1e1e'; }
  el.style.borderColor = border;
  el.innerHTML = `
    <div class="m-cost">${data.m}</div>
    ${!data.img?`<div class="card-name-label">${data.n}</div>`:''}
    <div class="hover-overlay">
      <div class="card-stat-row">${UI_ICONS.atk} ${data.a} &nbsp; ${UI_ICONS.hp} ${data.h}</div>
      <div class="ability-row">${abilityName || 'No ability'}</div>
      ${data.sick?'<div class="sick-label">SICK</div>':''}
      ${data.attacked?'<div class="attacked-label">USED</div>':''}
      ${data.stunnedTurns>0?'<div class="stunned-label">STUN</div>':''}
      ${data.parryUsed?'<div class="parry-label">PARRY USED</div>':''}
    </div>`;
  el.classList.toggle('card-sick',   !!data.sick);
  el.classList.toggle('card-attacked',!!data.attacked);
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

// â”€â”€ SELECT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function selectCard(card) {
  if (!isPlayerTurn) return;
  const data = JSON.parse(card.dataset.logic);
  if (data.sick)     { flashMessage('Summoning sickness! Wait a turn.'); return; }
  if (data.attacked) { flashMessage('Already attacked this turn!'); return; }
  if (data.stunnedTurns > 0) { flashMessage('This card is stunned this turn.'); return; }
  if (data.a <= 0)   { flashMessage('This card has 0 ATK and cannot attack.'); return; }
  document.querySelectorAll('.card').forEach(c=>c.style.outline='none');
  if (selectedCard===card) { selectedCard=null; }
  else { selectedCard=card; card.style.outline='3px solid #f1c40f'; }
}

// â”€â”€ ATTACK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function attack(enemySlot) {
  if (!selectedCard || !isPlayerTurn || attackInProgress) return;
  const attacker = selectedCard;
  const pd = JSON.parse(attacker.dataset.logic);
  if (pd.sick||pd.attacked||pd.a<=0) return;
  const lane = getLane(getSlotIndex(enemySlot));
  const guardianSlot = getLaneCards('enemy', lane).map(card => card.closest('.slot')).find(slot => {
    const c = slot?.querySelector('.card');
    return c && getCardData(c).n === 'Ironclad Sentinel';
  });
  if (guardianSlot) enemySlot = guardianSlot;
  const enemyCard = enemySlot.querySelector('.card');
  attackInProgress = true;
  markAttacked(attacker, pd);
  selectedCard = null;
  updateUI();

  animateAttack(attacker, enemyCard||enemySlot, ()=>{
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

function markAttacked(el,data) { data.attacked=true; el.dataset.logic=JSON.stringify(data); styleCard(el,data); el.style.outline='none'; }
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
  card.classList.add('card-die-anim');
  setTimeout(()=>{
    if (!card.parentNode) return;
    const slot = card.parentNode;
    const lane = getLane(getSlotIndex(slot));
    const baseReturnData = getCardByName(data.n) || data;
    card.remove();
    (owner==='player'?playerGrave:enemyGrave).push(data);
    if (data.n === 'Phoenix Paladin') addCardToHand(owner, { ...baseReturnData, m: data.m + 2, h: 3 }, owner === 'player');
    if (data.n === 'Yggdrasil Pillar') queueCardReturnToHand(owner, baseReturnData, { h: 12 });
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
    const affordable=hand.filter(c=>getPlayerPlayCost(getCardData(c)).playCost<=mana);
    if (affordable.length) {
      const card=affordable[Math.floor(Math.random()*affordable.length)];
      const slot=freeSlots[Math.floor(Math.random()*freeSlots.length)];
      played = playPlayerHandCardToSlot(card, slot);
    }
  }
  flashMessage(played ? "Time's up! Card auto-played." : "Time's up!");
  setTimeout(()=>nextTurn(),700);
}

// â”€â”€ ENEMY AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function enemyTurn() {
  return new Promise(resolve=>{
    const eSlots=[...document.querySelectorAll('.enemy-side .slot')];
    const pSlots=[...document.querySelectorAll('.player-side .slot')];
    let delay=300;

    // Play up to the turn limit from hand if mana allows
    let played=0;
    const tryPlay=()=>{
      if (played >= MAX_CARDS_PER_TURN || enemyHand.length === 0) return;
      const empty=eSlots.filter(s=>!s.querySelector('.card'));
      if (!empty.length) return;
      const idx=[...enemyHand].reverse().findIndex(c=>c.m<=enemyMana);
      if (idx===-1) return;
      const ri=enemyHand.length-1-idx;
      const data=enemyHand.splice(ri,1)[0]; if(!data)return;
      enemyMana-=data.m;
      const slot=empty[Math.floor(Math.random()*empty.length)];
      const el=makeCardElement(data,true);
      el.onclick=(e)=>{
        const slotEl = e.currentTarget.closest('.slot');
        if (selectedCard && isPlayerTurn && slotEl) {
          attack(slotEl);
          return;
        }
        e.stopPropagation();
        openInspect(getCardData(el));
      };
      el.oncontextmenu=(e)=>{e.preventDefault();openInspect(getCardData(el));};
      slot.appendChild(el); el.classList.add('card-play-anim');
      discoverCard(data);
      applyCardAbility(el, 'enemy', 'onPlay');
      updateUI();
      played++;
      if (enemyMana > 0) tryPlay();
    };
    tryPlay();
    delay=500;

    // Attack with every card
    const cards=eSlots.map(s=>s.querySelector('.card')).filter(Boolean);
    cards.forEach(eCard=>{
      setTimeout(()=>{
        if (!eCard.isConnected) return;
        const ed=JSON.parse(eCard.dataset.logic);
        if (ed.sick || ed.a <= 0 || ed.stunnedTurns > 0) return;
        let occupied=pSlots.filter(s=>s.querySelector('.card'));
        const guardians = occupied.filter(s => getCardData(s.querySelector('.card')).n === 'Ironclad Sentinel');
        if (guardians.length) occupied = guardians;
        const shouldHitPlayerDirectly = !guardians.length && (occupied.length === 0 || Math.random() < 0.45);
        if (!shouldHitPlayerDirectly && occupied.length>0) {
          const randomSlot = occupied[Math.floor(Math.random() * occupied.length)];
          const pCard=randomSlot.querySelector('.card');
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
  runTurnHooks('player', 'onEndTurn');
  resolveQueuedHandReturns();
  isPlayerTurn=false;
  if (playerDeck.length===0 && !getPlayerHandCards().length) { showGameOver(false,'You ran out of cards!'); return; }
  refreshBoardForNextTurn('player');
  playerTurnDraws = 0;
  enemyTurnDraws = 0;
  firstPlayDiscountUsed = false;
  document.getElementById('end-btn').disabled=true;
  showTurnBanner('ENEMY TURN',true);
  setTimeout(async()=>{
    enemyMana = enemyMaxMana;
    const enemyDraw = drawCardForOwner('enemy');
    if (enemyDraw) enemyHand.push(enemyDraw);
    if (enemyDeck.length===0 && enemyHand.length===0){ showGameOver(true,'Enemy ran out of cards!'); return; }
    runTurnHooks('enemy', 'onStartTurn');
    updateUI();
    await enemyTurn(); await sleep(400);
    runTurnHooks('enemy', 'onEndTurn');
    resolveQueuedHandReturns();
    refreshBoardForNextTurn('enemy');
    isPlayerTurn=true; startPlayerTurn();
  },800);
}

function startPlayerTurn() {
  attackInProgress = false;
  playerCardsPlayedThisTurn = 0;
  mana=maxMana;
  runTurnHooks('player', 'onStartTurn');
  if (playerAbilitySilenceTurns > 0) playerAbilitySilenceTurns--;
  if (enemyAbilitySilenceTurns > 0) enemyAbilitySilenceTurns--;
  if (playerDeck.length > 0) drawCard();
  if (playerDeck.length===0 && getPlayerHandCards().length===0) {
    showGameOver(false,'You ran out of cards!'); return;
  }
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
  // Timer visibility
  const clk=document.getElementById('turn-clock');
  if(clk) clk.style.display=settings.timerOn?'':'none';
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
  if (won) crystals += (3 + currentLevel);
  addBattleLogEntry(won ? `Battle won. ${reason || ''}`.trim() : `Battle lost. ${reason || ''}`.trim(), 'system');
  document.getElementById('gameover-icon').innerText  = won ? UI_ICONS.win : UI_ICONS.lose;
  document.getElementById('gameover-title').innerText = won?'VICTORY!':'DEFEATED';
  document.getElementById('gameover-sub').innerText   = reason||'';
  document.getElementById('gameover-overlay').classList.add('show');
  if (firstClear) openRewardOverlay();
  saveProgress();
  spawnParticles(won);
}
function openRewardOverlay() {
  const eligible = getEligibleRewardCards();
  rewardChoices = pickRandomCards(eligible, Math.min(5, eligible.length));
  selectedRewardNames = new Set();
  if (!rewardChoices.length) return;
  document.getElementById('reward-subtitle').innerText = 'Pick 2 cards to add to your collection.';
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
  claimBtn.disabled = selectedRewardNames.size !== Math.min(2, rewardChoices.length);
}

function toggleRewardChoice(cardName) {
  if (selectedRewardNames.has(cardName)) selectedRewardNames.delete(cardName);
  else if (selectedRewardNames.size < 2) selectedRewardNames.add(cardName);
  renderRewardChoices();
}

function claimRewardChoices() {
  if (selectedRewardNames.size !== Math.min(2, rewardChoices.length)) return;
  selectedRewardNames.forEach(name => {
    ownedCardNames.add(name);
    discoveredCardNames.add(name);
    addBattleLogEntry(`Reward card added to collection: ${name}`, 'reward');
  });
  rewardChoices = [];
  selectedRewardNames = new Set();
  document.getElementById('reward-overlay').classList.remove('show');
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
  if (playerDeckList.length >= 35) { flashMessage('Deck max is 35 cards.'); return; }
  if (getDeckCardCount(cardName) >= 3) { flashMessage('Max 3 copies of the same card.'); return; }
  playerDeckList.push(cardName);
  saveProgress();
  renderDeckEditor();
}

function removeCardFromDeck(cardName) {
  ensureDeckInitialized();
  if (playerDeckList.length <= 20) { flashMessage('Deck minimum is 20 cards.'); return; }
  const idx = playerDeckList.indexOf(cardName);
  if (idx === -1) return;
  playerDeckList.splice(idx, 1);
  saveProgress();
  renderDeckEditor();
}

function openDeckEditor() {
  document.getElementById('deck-sort-select').value = 'mana';
  document.getElementById('deck-filter-select').value = 'all';
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

  const sub = document.getElementById('deck-modal-subtitle');
  sub.innerText = `Deck ${playerDeckList.length}/35 (min 20) | Owned ${unlocked} | Discovered ${discoveredCardNames.size}`;

  sortedPool.forEach(data => {
    const isUnlocked = unlockedSet.has(data.n);
    const isDiscovered = discoveredCardNames.has(data.n);
    if (filter === 'owned' && !isUnlocked) return;
    if (filter === 'unowned' && isUnlocked) return;

    const wrap = document.createElement('div');
    wrap.className = 'pile-card-wrap';
    const card = document.createElement('div');
    card.className = 'pile-card';

    if (isUnlocked || isDiscovered) {
      card.style.borderColor = factionBorder[data.faction] || '#888';
      if (data.img) card.style.backgroundImage = `url('${data.img}')`;
      else card.style.backgroundColor = data.color || '#1e1e1e';
      card.innerHTML = `<div class="m-cost">${data.m}</div>${!data.img?`<div class="card-name-label">${data.n}</div>`:''}`;
      card.onclick = () => openInspect(data);
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
      minusBtn.onclick = () => removeCardFromDeck(data.n);
      const count = document.createElement('span');
      count.className = 'deck-count';
      count.innerText = `${getDeckCardCount(data.n)}/3`;
      const plusBtn = document.createElement('button');
      plusBtn.className = 'deck-btn';
      plusBtn.innerText = '+';
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
  const c = document.getElementById('shop-crystals');
  const cost = document.getElementById('shop-chest-cost');
  if (c) c.innerText = String(crystals);
  if (cost) cost.innerText = String(CHEST_COST);
}

function openShop() {
  refreshShopUI();
  document.getElementById('shop-overlay').classList.add('show');
}

function closeShop() {
  document.getElementById('shop-overlay').classList.remove('show');
}

function openCrystalChest() {
  if (crystals < CHEST_COST) {
    document.getElementById('shop-last-drop').innerText = 'Not enough crystals.';
    return;
  }
  crystals -= CHEST_COST;
  const candidates = pool.filter(c => !ownedCardNames.has(c.n));
  const drop = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : pool[Math.floor(Math.random() * pool.length)];
  ownedCardNames.add(drop.n);
  discoveredCardNames.add(drop.n);
  addBattleLogEntry(`New card unlocked from chest: ${drop.n}`, 'reward');
  document.getElementById('shop-last-drop').innerText = `You got: ${drop.n}`;
  saveProgress();
  refreshShopUI();
  renderDeckEditor();
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
  if (!pileOpen && !settingsOpen && !deckOpen) resumeTimer();
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
      !e.target.closest('#deck-modal')) {
    if (selectedCard) { selectedCard.style.outline='none'; selectedCard=null; }
  }
});

// â”€â”€ Confirm pool loaded (call last) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Nothing auto-starts â€” user presses START â†’ map â†’ level


ensureCollectionInitialized();
ensureDeckInitialized();
loadProgress();
refreshShopUI();
renderBattleTerminal();
renderBattleLogModal();

