import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_FILE = path.join('data', 'admin.json');
const RESELLERS_FILE = path.join('data', 'resellers.json');
const TOKENS_FILE = path.join('data', 'tokens.json');
const KEYS_FILE = path.join('data', 'keys.json');
const DEVICES_FILE = path.join('data', 'devices.json');

// Initialize with default data if files don't exist
function initializeFiles() {
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data', { recursive: true });
  }
  
  // Admin file
  if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify([
      { id: 1, username: 'admin', password: 'admin' }
    ], null, 2));
  }
  
  // Resellers file
  if (!fs.existsSync(RESELLERS_FILE)) {
    fs.writeFileSync(RESELLERS_FILE, JSON.stringify([], null, 2));
  }
  
  // Tokens file
  if (!fs.existsSync(TOKENS_FILE)) {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify([], null, 2));
  }
  
  // Keys file
  if (!fs.existsSync(KEYS_FILE)) {
    fs.writeFileSync(KEYS_FILE, JSON.stringify([], null, 2));
  }
  
  // Devices file
  if (!fs.existsSync(DEVICES_FILE)) {
    fs.writeFileSync(DEVICES_FILE, JSON.stringify([], null, 2));
  }
}

// Initialize files on load
initializeFiles();

// Helper functions
function readJsonFile(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${file}: ${error.message}`);
    return [];
  }
}

function writeJsonFile(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing file ${file}: ${error.message}`);
    return false;
  }
}

// Get reseller specific file path
function getResellerFilePath(username) {
  return path.join('data', `${username}.json`);
}

// Create or update reseller file
function updateResellerFile(reseller, keys = []) {
  const filePath = getResellerFilePath(reseller.username);
  
  let resellerData = {
    resellerId: reseller.id,
    username: reseller.username,
    credits: reseller.credits,
    registrationDate: reseller.registrationDate,
    keys: []
  };
  
  // If file exists, read it first to preserve existing data
  if (fs.existsSync(filePath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      resellerData = { ...existingData };
      
      // If new keys are provided, add them
      if (keys.length > 0) {
        // Format date objects to strings before saving to JSON
        const formattedKeys = keys.map(key => ({
          ...key,
          createdAt: key.createdAt ? new Date(key.createdAt).toISOString() : new Date().toISOString(),
          expiryDate: key.expiryDate ? new Date(key.expiryDate).toISOString() : null
        }));
        
        resellerData.keys = [...resellerData.keys, ...formattedKeys];
      }
      
      // Update reseller info
      resellerData.credits = reseller.credits;
    } catch (error) {
      console.error(`Error reading reseller file ${filePath}: ${error.message}`);
    }
  } else {
    // If file doesn't exist, initialize with the provided keys
    if (keys.length > 0) {
      // Format date objects to strings before saving to JSON
      const formattedKeys = keys.map(key => ({
        ...key,
        createdAt: key.createdAt ? new Date(key.createdAt).toISOString() : new Date().toISOString(),
        expiryDate: key.expiryDate ? new Date(key.expiryDate).toISOString() : null
      }));
      
      resellerData.keys = formattedKeys;
    }
  }
  
  // Write the data back to the file
  try {
    fs.writeFileSync(filePath, JSON.stringify(resellerData, null, 2));
    console.log(`Updated reseller file for: ${reseller.username}`);
    return true;
  } catch (error) {
    console.error(`Error writing reseller file ${filePath}: ${error.message}`);
    return false;
  }
}

// Export the functions
export {
  readJsonFile,
  writeJsonFile,
  getResellerFilePath,
  updateResellerFile,
  ADMIN_FILE,
  RESELLERS_FILE,
  TOKENS_FILE,
  KEYS_FILE,
  DEVICES_FILE
};
