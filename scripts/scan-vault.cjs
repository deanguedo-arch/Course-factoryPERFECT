const fs = require('fs');
const path = require('path');

// CONFIGURATION
const VAULT_DIR = path.join(__dirname, '../public/materials');
const OUTPUT_FILE = path.join(__dirname, '../src/data/vault.json');
const BASE_URL = '/Course-factoryPERFECT'; // Must match vite.config.js base

// Ensure directories exist
if (!fs.existsSync(VAULT_DIR)) {
    console.log(`[VAULT] Creating vault directory at: ${VAULT_DIR}`);
    fs.mkdirSync(VAULT_DIR, { recursive: true });
}

// Ensure output directory exists
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`[VAULT] Creating data directory at: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const getSmartTitle = (filename) => {
    // 1. Remove extension
    let name = filename.replace(/\.[^/.]+$/, "");
    
    // 2. Replace underscores/hyphens with spaces
    name = name.replace(/[-_]/g, " ");
    
    // 3. Capitalize Words
    return name.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
};

const scanVault = () => {
    console.log('🔍 Scanning Vault for assets...');
    
    try {
        const files = fs.readdirSync(VAULT_DIR);
        const assets = [];

        files.forEach(file => {
            // Skip hidden files or system files
            if (file.startsWith('.')) return;

            const stats = fs.statSync(path.join(VAULT_DIR, file));
            
            if (stats.isFile()) {
                assets.push({
                    id: `vault-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    filename: file,
                    path: `${BASE_URL}/materials/${file}`,
                    title: getSmartTitle(file),
                    type: path.extname(file).toLowerCase().replace('.', ''),
                    size: (stats.size / 1024).toFixed(1) + ' KB',
                    date: stats.mtime.toISOString().split('T')[0]
                });
            }
        });

        // Write to JSON
        const data = {
            lastUpdated: new Date().toISOString(),
            count: assets.length,
            files: assets
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
        console.log(`✅ Vault Index Updated! Found ${assets.length} items.`);
        console.log(`📄 Saved to: ${OUTPUT_FILE}`);

    } catch (err) {
        console.error('❌ Error scanning vault:', err);
    }
};

scanVault();