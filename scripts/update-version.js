const fs = require('fs');
const version = fs.readFileSync('./.VERSION', 'utf8').trim();
const jsonContent = JSON.stringify({ version });
fs.writeFileSync('./version.json', jsonContent);
console.log(`✅ Version updated to ${version}`);