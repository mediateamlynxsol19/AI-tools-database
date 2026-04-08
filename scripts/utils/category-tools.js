const fs = require('fs');

function extractToolsFromCategoryData(parsedData) {
  if (Array.isArray(parsedData)) {
    return parsedData;
  }

  if (parsedData && Array.isArray(parsedData.tools)) {
    return parsedData.tools;
  }

  return null;
}

function readCategoryTools(filePath) {
  const parsedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const tools = extractToolsFromCategoryData(parsedData);

  if (!tools) {
    throw new Error('Expected category file to be an array or an object with a tools array');
  }

  return tools;
}

function writeCategoryTools(filePath, parsedData, tools) {
  if (Array.isArray(parsedData)) {
    fs.writeFileSync(filePath, JSON.stringify(tools, null, 2));
    return;
  }

  if (parsedData && typeof parsedData === 'object') {
    const updated = {
      ...parsedData,
      tools,
      _count: tools.length
    };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
    return;
  }

  throw new Error('Cannot write tools for unsupported category file format');
}

function readCategoryData(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = {
  extractToolsFromCategoryData,
  readCategoryTools,
  readCategoryData,
  writeCategoryTools
};
