import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAIN_IMAGES_DIR = path.join(__dirname, '../../public/storage/images/main');
const COLLECTION_PATH = path.join(__dirname, '../../public/storage/data/collection.json');

let mainImagesCache = null;
let collectionImageCache = null;

function storageUrlExists(storageUrl) {
  if (!storageUrl || !storageUrl.startsWith('/storage/')) return false;
  const relativePath = storageUrl.replace('/storage/', 'storage/');
  return fs.existsSync(path.join(__dirname, '../../public', relativePath));
}

function normalizeKey(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getMainImagesMap() {
  if (mainImagesCache) return mainImagesCache;

  const map = new Map();
  if (!fs.existsSync(MAIN_IMAGES_DIR)) {
    mainImagesCache = map;
    return map;
  }

  const files = fs.readdirSync(MAIN_IMAGES_DIR);
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.ico'].includes(ext)) continue;

    const base = path.basename(file, ext);
    const key = normalizeKey(base);
    if (!key || map.has(key)) continue;
    map.set(key, `/storage/images/main/${file}`);
  }

  mainImagesCache = map;
  return map;
}

function getMainImageForFolder(folderName) {
  const imagesMap = getMainImagesMap();
  if (!imagesMap.size) return null;

  // Match only by game folder name (ignoring case and separators).
  return imagesMap.get(normalizeKey(folderName)) || null;
}

const THUMBNAIL_NAMES = [
  'logo.png', 'splash.png', 'loading-logo.png',
  'icon-256.png', 'icon-512.png', 'icon.png',
  'thumbnail.png', 'cover.png', 'preview.png', 'favicon.png',
];

function findImageInGameFolder(gamePath) {
  const maxDepth = 3;

  function walk(currentPath, depth) {
    if (depth > maxDepth) return null;

    let entries = [];
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return null;
    }

    const nameMap = new Map(
      entries.filter(e => e.isFile()).map(e => [e.name.toLowerCase(), path.join(currentPath, e.name)])
    );

    for (const name of THUMBNAIL_NAMES) {
      if (nameMap.has(name)) return nameMap.get(name);
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const nested = walk(path.join(currentPath, entry.name), depth + 1);
      if (nested) return nested;
    }

    return null;
  }

  return walk(gamePath, 0);
}

// Game metadata mapping with specific images
const GAME_METADATA = {
  'flappy-bird': { label: 'Flappy Bird', categories: ['action', 'skill'], image: '/storage/images/main/favicon.png' },
  'mario': { label: 'Super Mario', categories: ['action'], image: '/storage/images/main/supermario.jpg' },
  'ducklife': { label: 'Duck Life', categories: ['skill', 'strategy'], image: '/storage/images/main/ducklife0.jpg' },
  'ducklife2': { label: 'Duck Life 2', categories: ['skill', 'strategy'], image: '/storage/images/main/ducklife0.jpg' },
  'ducklife3': { label: 'Duck Life 3', categories: ['skill', 'strategy'], image: '/storage/images/main/ducklife0.jpg' },
  'ducklife4': { label: 'Duck Life 4', categories: ['skill', 'strategy'], image: '/storage/images/main/ducklife0.jpg' },
  'slope': { label: 'Slope', categories: ['action', 'skill'], image: '/storage/images/main/slope.jpg' },
  'slope2': { label: 'Slope 2', categories: ['action', 'skill'], image: '/storage/images/main/slope2.jpg' },
  'cookie-clicker': { label: 'Cookie Clicker', categories: ['strategy', 'idle'], image: '/storage/images/main/cookie.jpg' },
  'cookieclicker': { label: 'Cookie Clicker', categories: ['strategy', 'idle'], image: '/storage/images/main/cookie.jpg' },
  'geometry-dash': { label: 'Geometry Dash', categories: ['action', 'skill'], image: '/storage/images/main/geo.jpg' },
  'geometrydash': { label: 'Geometry Dash', categories: ['action', 'skill'], image: '/storage/images/main/geo.jpg' },
  'geometrydash2': { label: 'Geometry Dash 2', categories: ['action', 'skill'], image: '/storage/images/main/geo.jpg' },
  '2048': { label: '2048', categories: ['skill', 'puzzle'], image: '/storage/images/main/2048.jpg' },
  'tetris': { label: 'Tetris', categories: ['puzzle', 'skill'], image: '/storage/images/main/tetris.jpg' },
  'wordle': { label: 'Wordle', categories: ['skill', 'puzzle'], image: '/storage/images/main/wordle.jpg' },
  'agar': { label: 'Agar.io', categories: ['action', 'io'], image: '/storage/images/main/agario.jpg' },
  'slither': { label: 'Slither.io', categories: ['action', 'io'], image: '/storage/images/main/slitherio.jpg' },
  'krunker': { label: 'Krunker', categories: ['shooting', 'action'], image: '/storage/images/main/gun.jpg' },
  'shellshockers': { label: 'Shell Shockers', categories: ['shooting', 'action'], image: '/storage/images/main/shellshockers.jpg' },
  'shellshockersio': { label: 'Shell Shockers', categories: ['shooting', 'action'], image: '/storage/images/main/shellshockers.jpg' },
  'vex': { label: 'Vex', categories: ['action', 'skill'], image: '/storage/images/main/vex6.jpg' },
  'vex-3': { label: 'Vex 3', categories: ['action', 'skill'], image: '/storage/images/main/vex3.jpg' },
  'vex-4': { label: 'Vex 4', categories: ['action', 'skill'], image: '/storage/images/main/vex4.jpg' },
  'vex-5': { label: 'Vex 5', categories: ['action', 'skill'], image: '/storage/images/main/vex5.jpg' },
  'vex-6': { label: 'Vex 6', categories: ['action', 'skill'], image: '/storage/images/main/vex6.jpg' },
  'vex-7': { label: 'Vex 7', categories: ['action', 'skill'], image: '/storage/images/main/vex7.jpg' },
  'vex6': { label: 'Vex 6', categories: ['action', 'skill'], image: '/storage/images/main/vex6.jpg' },
  'basketball-stars': { label: 'Basketball Stars', categories: ['sports'], image: '/storage/images/main/basketbros.jpeg' },
  'soccer-random': { label: 'Soccer Random', categories: ['sports', '2 player'], image: '/storage/images/main/soccerrandom.jpg' },
  'basketball-random': { label: 'Basketball Random', categories: ['sports'], image: '/storage/images/main/basketballrandom.jpg' },
  'soccer-skills-champions-league': { label: 'Soccer Skills', categories: ['sports'], image: '/storage/images/main/soccerrandom.jpg' },
  'soccer-skills-euro-cup': { label: 'Soccer Skills', categories: ['sports'], image: '/storage/images/main/soccerrandom.jpg' },
  'soccer-skills-world-cup': { label: 'Soccer Skills', categories: ['sports'], image: '/storage/images/main/soccerrandom.jpg' },
  'happy-wheels': { label: 'Happy Wheels', categories: ['action', 'skill'], image: '/storage/images/main/wheely.jpg' },
  'run-3': { label: 'Run 3', categories: ['action', 'skill'], image: '/storage/images/main/run3.jpg' },
  'run3': { label: 'Run 3', categories: ['action', 'skill'], image: '/storage/images/main/run3.jpg' },
  'subway-surfers': { label: 'Subway Surfers', categories: ['action'], image: '/storage/images/main/subway.jpg' },
  'crossy-road': { label: 'Crossy Road', categories: ['action', 'skill'], image: '/storage/images/main/skiing.jpg' },
  'little-alchemy': { label: 'Little Alchemy', categories: ['strategy', 'puzzle'], image: '/storage/images/main/alchemy.jpg' },
  'littlealchemy': { label: 'Little Alchemy', categories: ['strategy', 'puzzle'], image: '/storage/images/main/alchemy.jpg' },
  'littlealchemy2': { label: 'Little Alchemy 2', categories: ['strategy', 'puzzle'], image: '/storage/images/main/alchemy.jpg' },
  'retro-bowl': { label: 'Retro Bowl', categories: ['sports'], image: '/storage/images/main/retrobowl.jpg' },
  'drift-boss': { label: 'Drift Boss', categories: ['racing', 'skill'], image: '/storage/images/main/driftb.jpg' },
  'drive-mad': { label: 'Drive Mad', categories: ['racing', 'skill'], image: '/storage/images/main/drive.jpg' },
  'superhot': { label: 'Superhot', categories: ['shooting', 'action'], image: '/storage/images/main/superhot.jpg' },
  'super-hot': { label: 'Superhot', categories: ['shooting', 'action'], image: '/storage/images/main/superhot.jpg' },
  '1v1lol': { label: '1v1.LoL', categories: ['shooting', 'action'], image: '/storage/images/main/1v1.jpg' },
  'angry-birds': { label: 'Angry Birds', categories: ['strategy', 'skill'], image: '/storage/games-lib/angrybirds/logo.webp' },
  'angrybirds': { label: 'Angry Birds', categories: ['strategy', 'skill'], image: '/storage/games-lib/angrybirds/logo.webp' },
  'bitlife': { label: 'BitLife', categories: ['strategy', 'simulation'], image: '/storage/images/main/bitlife.jpg' },
  'blocky-snakes': { label: 'Blocky Snakes', categories: ['action', 'skill'], image: '/storage/images/main/blocky.jpg' },
  'bloonstd': { label: 'Bloons TD', categories: ['strategy', 'action'], image: '/storage/images/main/bloons.jpg' },
  'bloonstd2': { label: 'Bloons TD 2', categories: ['strategy', 'action'], image: '/storage/images/main/bloons.jpg' },
  'bloonstd3': { label: 'Bloons TD 3', categories: ['strategy', 'action'], image: '/storage/images/main/bloons.jpg' },
  'bloonstd4': { label: 'Bloons TD 4', categories: ['strategy', 'action'], image: '/storage/images/main/bloons.jpg' },
  'bloonstd5': { label: 'Bloons TD 5', categories: ['strategy', 'action'], image: '/storage/images/main/btd5.jpg' },
  'bloonstd6': { label: 'Bloons TD 6', categories: ['strategy', 'action'], image: '/storage/images/main/bloons6.jpg' },
  'btd5': { label: 'Bloons TD 5', categories: ['strategy', 'action'], image: '/storage/images/main/btd5.jpg' },
  'btd6': { label: 'Bloons TD 6', categories: ['strategy', 'action'], image: '/storage/images/main/bloons6.jpg' },
  'core-ball': { label: 'Core Ball', categories: ['skill', 'action'], image: '/storage/images/main/ball2.jpg' },
  'cluster-rush': { label: 'Cluster Rush', categories: ['action', 'skill'], image: '/storage/images/main/cluster.jpg' },
  'candy-crush': { label: 'Candy Crush', categories: ['puzzle', 'skill'], image: '/storage/images/main/color.jpg' },
  'stickman-hook': { label: 'Stickman Hook', categories: ['action', 'skill'], image: '/storage/images/main/stickmanhook.jpg' },
  'stickman-hook-halloween': { label: 'Stickman Hook', categories: ['action', 'skill'], image: '/storage/images/main/stickmanhook.jpg' },
  'tiny-fishing': { label: 'Tiny Fishing', categories: ['idle', 'skill'], image: '/storage/images/main/tiny.jpg' },
  'tinyfishing': { label: 'Tiny Fishing', categories: ['idle', 'skill'], image: '/storage/images/main/tiny.jpg' },
  'fireboy-watergirl': { label: 'Fireboy & Watergirl', categories: ['action', 'puzzle'], image: '/storage/images/main/fire.jpg' },
  'motox3m': { label: 'Moto X3M', categories: ['racing', 'skill'], image: '/storage/images/main/moto3xm.jpg' },
  'motox3m2': { label: 'Moto X3M 2', categories: ['racing', 'skill'], image: '/storage/images/main/moto3xm.jpg' },
  'motox3m3': { label: 'Moto X3M 3', categories: ['racing', 'skill'], image: '/storage/images/main/moto3xm.jpg' },
  'motox3m-pool': { label: 'Moto X3M Pool', categories: ['racing', 'skill'], image: '/storage/images/main/moto3xm.jpg' },
  'motox3m-winter': { label: 'Moto X3M Winter', categories: ['racing', 'skill'], image: '/storage/images/main/moto.jpg' },
  'stick-merge': { label: 'Stick Merge', categories: ['strategy', 'idle'], image: '/storage/images/main/stickmanb.jpg' },
  'stumble-guys': { label: 'Stumble Guys', categories: ['action', 'skill'], image: '/storage/images/main/stumble.jpg' },
  'stumbleguys': { label: 'Stumble Guys', categories: ['action', 'skill'], image: '/storage/images/main/stumble.jpg' },
  'skribbl': { label: 'Skribbl', categories: ['skill', 'puzzle'], image: '/storage/images/main/scratch.jpg' },
  'brawl-stars': { label: 'Brawl Stars', categories: ['action', 'shooting'], image: '/storage/images/main/brawlstars.jpg' },
  'brawlstars': { label: 'Brawl Stars', categories: ['action', 'shooting'], image: '/storage/images/main/brawlstars.jpg' },
  'buildnowgg': { label: 'Build Now.gg', categories: ['action', 'shooting'], image: '/storage/images/main/buildnow.jpeg' },
  'paper-io': { label: 'Paper.io', categories: ['action', 'strategy'], image: '/storage/images/main/paper.jpg' },
  'paperio': { label: 'Paper.io', categories: ['action', 'strategy'], image: '/storage/images/main/paper.jpg' },
  'paperio2': { label: 'Paper.io 2', categories: ['action', 'strategy'], image: '/storage/images/main/paper2.jpg' },
  'papery-planes': { label: 'Papery Planes', categories: ['action', 'skill'], image: '/storage/images/main/paperyplanes.jpg' },
  'paperyplanes1': { label: 'Papery Planes', categories: ['action', 'skill'], image: '/storage/images/main/paperyplanes.jpg' },
};


// Default fallback image
const DEFAULT_IMAGE = '';

function isLikelyArcadeFallback(imageUrl) {
  if (!imageUrl) return true;
  if (imageUrl.includes('/arcade.')) return true;
  if (imageUrl.startsWith('/storage/')) return !storageUrlExists(imageUrl);
  return false;
}

function getCollectionImageMap() {
  if (collectionImageCache) return collectionImageCache;

  const map = new Map();
  if (!fs.existsSync(COLLECTION_PATH)) {
    collectionImageCache = map;
    return map;
  }

  try {
    const data = JSON.parse(fs.readFileSync(COLLECTION_PATH, 'utf8'));
    for (const game of data.games || []) {
      if (game.label && game.imageUrl) {
        const key = normalizeKey(game.label);
        if (key && !map.has(key)) {
          map.set(key, game.imageUrl);
        }
      }
    }
  } catch {
    // ignore parse errors
  }

  collectionImageCache = map;
  return map;
}

function getImageForGame(folderName, metadata, gamesDirPath, gamesUrlBase) {
  // 1. Match against collection.json by folder name or label
  const collectionMap = getCollectionImageMap();
  const folderKey = normalizeKey(folderName);
  const labelKey = metadata?.label ? normalizeKey(metadata.label) : null;
  const collectionImage = collectionMap.get(folderKey) || (labelKey ? collectionMap.get(labelKey) : null);
  if (collectionImage) return collectionImage;

  // 2. Fall back to GAME_METADATA hardcoded image
  if (metadata?.image && storageUrlExists(metadata.image)) {
    return metadata.image;
  }

  // 3. Search for an image file inside the game folder
  const gamePath = path.join(gamesDirPath, folderName);
  const firstPng = findImageInGameFolder(gamePath);
  if (firstPng) {
    const relPath = path.relative(gamePath, firstPng).split(path.sep).join('/');
    return `${gamesUrlBase}/${folderName}/${relPath}`;
  }

  return DEFAULT_IMAGE;
}

// Category inference from folder name
function inferCategory(folderName) {
  const name = folderName.toLowerCase();
  if (name.includes('racing') || name.includes('race') || name.includes('car') || name.includes('drift') || name.includes('moto') || name.includes('turbo')) return ['racing'];
  if (name.includes('sport') || name.includes('soccer') || name.includes('basketball') || name.includes('ball') || name.includes('football')) return ['sports'];
  if (name.includes('shoot') || name.includes('gun') || name.includes('blast') || name.includes('force')) return ['shooting'];
  if (name.includes('puzzle') || name.includes('block') || name.includes('tetris') || name.includes('mine') || name.includes('merge')) return ['puzzle'];
  if (name.includes('strategy') || name.includes('tower')) return ['strategy'];
  if (name.includes('idle') || name.includes('clicker') || name.includes('tycoon') || name.includes('empire')) return ['idle'];
  if (name.includes('io')) return ['io'];
  if (name.includes('2') && (name.includes('player') || name.includes('vs'))) return ['2 player'];
  return ['action'];
}

export async function getGamesListHandler(req, res) {
  try {
    const storagePath = path.join(__dirname, '../../public/storage');
    const gamesDirName = ['games-lib', 'Games-lib']
      .find(name => fs.existsSync(path.join(storagePath, name)));
    
    if (!gamesDirName) {
      return res.json([]);
    }

    const publicPath = path.join(storagePath, gamesDirName);
    const gamesUrlBase = `/storage/${gamesDirName}`;

    const folders = fs.readdirSync(publicPath).filter(file => {
      const stat = fs.statSync(path.join(publicPath, file));
      return stat.isDirectory() && !file.startsWith('.');
    });

    const games = folders
      .map(folder => {
        const gamePath = path.join(publicPath, folder);
        const hasIndex = fs.existsSync(path.join(gamePath, 'index.html'));
        
        if (!hasIndex) return null;

        const metadata = GAME_METADATA[folder];
        const label = metadata?.label || folder
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        
        const categories = metadata?.categories || inferCategory(folder);
        const imageUrl = getImageForGame(folder, metadata, publicPath, gamesUrlBase);

        return {
          id: folder,
          label,
          url: `${gamesUrlBase}/${folder}/index.html`,
          imageUrl,
          categories,
          isCustom: false
        };
      })
      .filter(game => game !== null)
      .sort((a, b) => a.label.localeCompare(b.label));

    const arcadeFallbackGames = games
      .filter(game => isLikelyArcadeFallback(game.imageUrl))
      .map(game => `${game.id} (${game.label})`);

    if (arcadeFallbackGames.length) {
      console.log('[games] Using arcade fallback for:', arcadeFallbackGames.join(', '));
    }

    res.json(games);
  } catch (error) {
    console.error('Error reading games:', error);
    res.status(500).json({ error: 'Failed to load games' });
  }
}
