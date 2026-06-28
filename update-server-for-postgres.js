// ═══════════════════════════════════════════════════════════════
// Automated Script to Update server.js for Postgres + Cloudinary
// Run: node update-server-for-postgres.js
// ═══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const SERVER_FILE = path.join(__dirname, 'server.js');
const BACKUP_FILE = path.join(__dirname, 'server.js.backup');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   Updating server.js for Postgres + Cloudinary           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

try {
  // Create backup
  console.log('📄 Creating backup: server.js.backup');
  fs.copyFileSync(SERVER_FILE, BACKUP_FILE);
  
  // Read server.js
  let content = fs.readFileSync(SERVER_FILE, 'utf8');
  
  // Track changes
  let changes = 0;
  
  // 1. Update database imports
  if (content.includes("require('./database')")) {
    content = content.replace(
      "const { insertOrder, getAllOrders } = require('./database');",
      "const { insertOrder, getAllOrders } = require('./database-postgres');"
    );
    changes++;
    console.log('✅ Updated: database import');
  }
  
  if (content.includes("require('./products-database')")) {
    content = content.replace(
      "const productsDB = require('./products-database');",
      "const productsDB = require('./products-database-postgres');"
    );
    changes++;
    console.log('✅ Updated: products-database import');
  }
  
  if (content.includes("require('./showcase-database')")) {
    content = content.replace(
      "const showcaseDB = require('./showcase-database');",
      "const showcaseDB = require('./showcase-database-postgres');"
    );
    changes++;
    console.log('✅ Updated: showcase-database import');
  }
  
  // 2. Add Cloudinary config import after other requires
  if (!content.includes("require('./cloudinary-config')")) {
    const multerIndex = content.indexOf("const multer = require('multer');");
    if (multerIndex !== -1) {
      content = content.substring(0, multerIndex) +
                "const { upload, cloudinary } = require('./cloudinary-config');\n" +
                content.substring(multerIndex);
      changes++;
      console.log('✅ Added: cloudinary-config import');
    }
  }
  
  // 3. Comment out old multer storage configuration
  const uploadDirStart = content.indexOf('const uploadDir = path.join(__dirname,');
  const uploadConfigEnd = content.indexOf('});', uploadDirStart);
  
  if (uploadDirStart !== -1 && uploadConfigEnd !== -1) {
    const oldConfig = content.substring(uploadDirStart, uploadConfigEnd + 3);
    const commentedConfig = '// OLD LOCAL STORAGE (Replaced by Cloudinary)\n/*\n' + oldConfig + '\n*/\n' +
                           '// Now using Cloudinary storage from cloudinary-config.js';
    content = content.replace(oldConfig, commentedConfig);
    changes++;
    console.log('✅ Commented out: old multer local storage config');
  }
  
  // 4. Add async to route handlers (examples - user will need to review all)
  const routesToUpdate = [
    "app.get('/api/products'",
    "app.get('/api/admin/products'",
    "app.get('/api/orders'",
    "app.post('/api/place-order'",
    "app.get('/api/showcase-categories'",
    "app.get('/api/admin/showcase-categories'"
  ];
  
  console.log('\n⚠️  Important: The following routes need manual async/await updates:');
  routesToUpdate.forEach(route => {
    if (content.includes(route) && !content.includes(route + ', async')) {
      console.log(`   - ${route}`);
    }
  });
  
  console.log('\n💡 Add "async" keyword before (req, res) and "await" before database calls');
  console.log('   Example: app.get(\'/api/products\', async (req, res) => {');
  console.log('            const products = await productsDB.getAllProducts();');
  
  // Write updated file
  fs.writeFileSync(SERVER_FILE, content);
  
  console.log(`\n✅ server.js updated successfully! (${changes} automatic changes)`);
  console.log('📄 Backup saved: server.js.backup');
  console.log('\n⚠️  NEXT STEPS:');
  console.log('1. Manually review server.js for routes that need async/await');
  console.log('2. Test locally: npm start');
  console.log('3. Run migration: npm run migrate');
  console.log('4. Deploy to Vercel: vercel --prod\n');
  
} catch (error) {
  console.error('\n❌ Error updating server.js:', error.message);
  console.log('\n💡 Manual update instructions:');
  console.log('1. Open server.js');
  console.log('2. Replace: require(\'./database\') with require(\'./database-postgres\')');
  console.log('3. Replace: require(\'./products-database\') with require(\'./products-database-postgres\')');
  console.log('4. Replace: require(\'./showcase-database\') with require(\'./showcase-database-postgres\')');
  console.log('5. Add: const { upload } = require(\'./cloudinary-config\');');
  console.log('6. Add "async" to route handlers and "await" to database calls\n');
  process.exit(1);
}
