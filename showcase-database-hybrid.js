// ═══════════════════════════════════════════════════════════════
// Hybrid Showcase Database - Auto-switches between Postgres and JSON
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const SHOWCASE_FILE = path.join(__dirname, 'showcase-categories.json');

let usePostgres = false;
let connectionCheckPromise = null;

async function checkPostgresConnection() {
  if (connectionCheckPromise) return connectionCheckPromise;
  
  connectionCheckPromise = (async () => {
    try {
      await pool.query('SELECT NOW()');
      usePostgres = true;
      console.log('✅ [SHOWCASE] Connected to Postgres');
      return true;
    } catch (error) {
      usePostgres = false;
      console.log('⚠️ [SHOWCASE] Using local JSON files');
      
      if (!fs.existsSync(SHOWCASE_FILE)) {
        // Create default showcase categories
        const defaultCategories = [
          { id: 1, name: 'College Wear', subtitle: '', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', category: 'indian', filter_tag: 'college', active: true, sort_order: 1 },
          { id: 2, name: 'Ethnic Sarees', subtitle: '', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', category: 'indian', filter_tag: 'saree', active: true, sort_order: 2 },
          { id: 3, name: 'Elegant Designs', subtitle: '', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', category: 'indian', filter_tag: '', active: true, sort_order: 3 },
          { id: 4, name: 'Mens Wear', subtitle: '', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', category: 'western', filter_tag: 'mens', active: true, sort_order: 4 },
          { id: 5, name: 'Christian Bridal', subtitle: 'bridal wear', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', category: 'bridal', filter_tag: 'christian', active: true, sort_order: 5 },
          { id: 6, name: 'Bridal Wear', subtitle: '', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', category: 'bridal', filter_tag: '', active: true, sort_order: 6 },
          { id: 7, name: 'Skirts', subtitle: 'Contemporary/Fusion', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', category: 'western', filter_tag: 'skirt', active: true, sort_order: 7 },
          { id: 8, name: 'Contemporary/Fusion', subtitle: 'Modern Styles', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', category: 'western', filter_tag: '', active: true, sort_order: 8 }
        ];
        fs.writeFileSync(SHOWCASE_FILE, JSON.stringify(defaultCategories, null, 2));
      }
      return false;
    }
  })();
  
  return connectionCheckPromise;
}

checkPostgresConnection();

// ─── JSON Helpers ──────────────────────────────────────────────
function readJSON() {
  try {
    if (!fs.existsSync(SHOWCASE_FILE)) return [];
    return JSON.parse(fs.readFileSync(SHOWCASE_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading showcase JSON:', error);
    return [];
  }
}

function writeJSON(data) {
  try {
    fs.writeFileSync(SHOWCASE_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing showcase JSON:', error);
    return false;
  }
}

// ─── Get All Categories ────────────────────────────────────────
async function getAllCategories() {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM showcase_categories ORDER BY sort_order, id');
      return result.rows;
    } catch (error) {
      console.error('❌ Postgres failed, using JSON:', error.message);
      usePostgres = false;
    }
  }
  
  return readJSON().sort((a, b) => a.sort_order - b.sort_order);
}

// ─── Get Category By ID ────────────────────────────────────────
async function getCategoryById(id) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query('SELECT * FROM showcase_categories WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const categories = readJSON();
  return categories.find(c => c.id === parseInt(id)) || null;
}

// ─── Add Category ──────────────────────────────────────────────
async function addCategory(categoryData) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const result = await pool.query(
        `INSERT INTO showcase_categories (name, subtitle, image, category, filter_tag, active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
          categoryData.name, categoryData.subtitle, categoryData.image,
          categoryData.category, categoryData.filter_tag,
          categoryData.active !== false, categoryData.sort_order || 0
        ]
      );
      console.log(`✅ [POSTGRES] Showcase category added: ${categoryData.name}`);
      return result.rows[0];
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const categories = readJSON();
  const newCategory = {
    id: categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1,
    ...categoryData,
    active: categoryData.active !== false,
    sort_order: categoryData.sort_order || 0,
    created_at: new Date().toISOString()
  };
  categories.push(newCategory);
  writeJSON(categories);
  console.log(`✅ [JSON] Showcase category added: ${categoryData.name}`);
  return newCategory;
}

// ─── Update Category ───────────────────────────────────────────
async function updateCategory(id, updates) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      const setClauses = [];
      const values = [];
      let paramIndex = 1;
      
      Object.entries(updates).forEach(([key, value]) => {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      });
      
      values.push(id);
      const result = await pool.query(
        `UPDATE showcase_categories SET ${setClauses.join(', ')} 
         WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      console.log(`✅ [POSTGRES] Showcase category ${id} updated`);
      return result.rows[0];
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const categories = readJSON();
  const index = categories.findIndex(c => c.id === parseInt(id));
  if (index === -1) return null;
  
  categories[index] = { ...categories[index], ...updates };
  writeJSON(categories);
  console.log(`✅ [JSON] Showcase category ${id} updated`);
  return categories[index];
}

// ─── Delete Category ───────────────────────────────────────────
async function deleteCategory(id) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      await pool.query('DELETE FROM showcase_categories WHERE id = $1', [id]);
      console.log(`✅ [POSTGRES] Showcase category ${id} deleted`);
      return true;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  let categories = readJSON();
  const originalLength = categories.length;
  categories = categories.filter(c => c.id !== parseInt(id));
  if (categories.length < originalLength) {
    writeJSON(categories);
    console.log(`✅ [JSON] Showcase category ${id} deleted`);
    return true;
  }
  return false;
}

// ─── Reorder Categories ────────────────────────────────────────
async function reorderCategories(orderedIds) {
  await checkPostgresConnection();
  
  if (usePostgres) {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await pool.query(
          'UPDATE showcase_categories SET sort_order = $1 WHERE id = $2',
          [i, orderedIds[i]]
        );
      }
      console.log('✅ [POSTGRES] Categories reordered');
      return true;
    } catch (error) {
      usePostgres = false;
    }
  }
  
  const categories = readJSON();
  orderedIds.forEach((id, index) => {
    const category = categories.find(c => c.id === parseInt(id));
    if (category) category.sort_order = index;
  });
  writeJSON(categories);
  console.log('✅ [JSON] Categories reordered');
  return true;
}

module.exports = {
  getAllCategories,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
};
