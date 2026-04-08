const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const { extractToolsFromCategoryData } = require('./utils/category-tools');

const ajv = new Ajv({ allErrors: true, verbose: true });
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/schema.json'), 'utf8'));
const validate = ajv.compile(schema);

function validateTools() {
  const toolsDir = path.join(__dirname, '../data/tools');
  const categories = fs.readdirSync(toolsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));

  let allValid = true;
  let totalTools = 0;
  const errors = [];

  console.log('🔍 Validating AI Tools Database...\n');

  categories.forEach(category => {
    const filePath = path.join(toolsDir, `${category}.json`);

    if (fs.existsSync(filePath)) {
      try {
        const parsedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const tools = extractToolsFromCategoryData(parsedData);

        if (!tools) {
          allValid = false;
          errors.push({
            category,
            file: `${category}.json`,
            type: 'file-format',
            message: 'Expected either an array of tools or an object with a tools array'
          });
          console.error(`❌ Invalid format in ${category}.json: expected an array or { tools: [] }`);
          return;
        }

        console.log(`📂 Checking ${category}.json (${tools.length} tools)`);

        tools.forEach((tool, index) => {
          totalTools++;
          const valid = validate(tool);

          if (!valid) {
            allValid = false;
            const error = {
              category,
              toolIndex: index,
              toolId: tool.id || 'unknown',
              errors: validate.errors
            };
            errors.push(error);

            console.log(`❌ Tool ${index + 1} (${tool.id}):`);
            validate.errors.forEach(err => {
              console.log(`   - ${err.instancePath}: ${err.message}`);
            });
          }
        });

        if (tools.length > 0) {
          console.log(`✅ ${category}: ${tools.length} tools validated\n`);
        }

      } catch (error) {
        allValid = false;
        errors.push({
          category,
          file: `${category}.json`,
          type: 'parse-error',
          message: error.message
        });
        console.error(`❌ Error parsing ${category}.json:`, error.message);
      }
    }
  });

  console.log(`📊 Validation Summary:`);
  console.log(`   Total tools checked: ${totalTools}`);
  console.log(`   Categories checked: ${categories.length}`);
  console.log(`   Errors found: ${errors.length}`);

  if (allValid) {
    console.log('\n🎉 All tools are valid! Ready for deployment.');
    return true;
  } else {
    console.log('\n❌ Validation failed. Please fix the errors above.');
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  const isValid = validateTools();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateTools };