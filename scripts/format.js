const fs = require('fs');
const path = require('path');
const {
  readCategoryData,
  readCategoryTools,
  writeCategoryTools
} = require('./utils/category-tools');
const { updateReadmeStats, updateWebStats } = require('./utils/readme-stats');

function formatJSONFiles() {
  const toolsDir = path.join(__dirname, '../data/tools');
  const categories = fs.readdirSync(toolsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  console.log('🔧 Formatting JSON files...\n');

  let totalFiles = 0;
  let totalTools = 0;

  categories.forEach(category => {
    const filePath = path.join(toolsDir, `${category}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const parsedData = readCategoryData(filePath);
        const tools = readCategoryTools(filePath);

        // Sort tools by name
        tools.sort((a, b) => a.name.localeCompare(b.name));

        // Preserve source shape while writing sorted tools
        writeCategoryTools(filePath, parsedData, tools);

        totalFiles++;
        totalTools += tools.length;

        console.log(`✅ ${category}.json: ${tools.length} tools formatted`);

      } catch (error) {
        console.error(`❌ Error formatting ${category}.json:`, error.message);
      }
    }
  });

  // Update main tools.json
  const mainToolsPath = path.join(__dirname, '../data/tools.json');
  if (fs.existsSync(mainToolsPath)) {
    try {
      const mainData = JSON.parse(fs.readFileSync(mainToolsPath, 'utf8'));

      // Sort main tools array
      mainData.tools.sort((a, b) => a.name.localeCompare(b.name));
      mainData.lastUpdated = new Date().toISOString();

      fs.writeFileSync(mainToolsPath, JSON.stringify(mainData, null, 2));
      console.log(`✅ tools.json: ${mainData.tools.length} tools formatted`);
    } catch (error) {
      console.error(`❌ Error formatting tools.json:`, error.message);
    }
  }

  console.log(`\n📊 Formatting Summary:`);
  console.log(`   Files formatted: ${totalFiles}`);
  console.log(`   Total tools: ${totalTools}`);
  console.log('\n🎉 Formatting completed!');
}

function generateStats() {
  const toolsDir = path.join(__dirname, '../data/tools');
  const stats = {
    lastUpdated: new Date().toISOString(),
    totalTools: 0,
    totalCategories: 0,
    categories: {},
    featured: 0,
    popular: 0,
    new: 0,
    pricing: {
      Free: 0,
      Freemium: 0,
      Paid: 0,
      Subscription: 0
    }
  };

  if (fs.existsSync(toolsDir)) {
    const categoryFiles = fs.readdirSync(toolsDir)
      .filter(file => file.endsWith('.json'));

    categoryFiles.forEach(file => {
      const category = file.replace('.json', '');
      const filePath = path.join(toolsDir, file);

      try {
        const tools = readCategoryTools(filePath);
        stats.categories[category] = tools.length;
        stats.totalTools += tools.length;

        tools.forEach(tool => {
          if (tool.featured) stats.featured++;
          if (tool.popular) stats.popular++;
          if (tool.new) stats.new++;
          if (stats.pricing[tool.pricing] !== undefined) {
            stats.pricing[tool.pricing]++;
          }
        });
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
      }
    });
  }

  stats.totalCategories = Object.keys(stats.categories).length;

  const statsPath = path.join(__dirname, '../data/stats.json');
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
  updateReadmeStats(stats);
  updateWebStats(stats);

  console.log('📊 Stats generated:', stats);
  return stats;
}

// CLI usage
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'stats') {
    generateStats();
  } else {
    formatJSONFiles();
    generateStats();

    // Also aggregate all tools into main file
    const { aggregateTools } = require('./aggregate.js');
    aggregateTools();
  }
}

module.exports = { formatJSONFiles, generateStats };