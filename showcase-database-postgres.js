// ═══════════════════════════════════════════════════════════════
// Postgres Database - Showcase Categories Module (using node-postgres)
// Compatible with Supabase, Vercel Postgres, and any PostgreSQL
// ═══════════════════════════════════════════════════════════════

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ─── Get All Active Categories (Public) ────────────────────────
async function getAllCategories() {
  try {
    const result = await pool.query(
      'SELECT * FROM showcase_categories WHERE active = true ORDER BY sort_order ASC, id ASC'
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching showcase categories:', error);
    return [];
  }
}

// ─── Get All Categories (Admin) ────────────────────────────────
async function getAllCategoriesAdmin() {
  try {
    const result = await pool.query(
      'SELECT * FROM showcase_categories ORDER BY sort_order ASC, id ASC'
    );
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching showcase categories (admin):', error);
    return [];
  }
}

// ─── Add Category ──────────────────────────────────────────────
async function addCategory(data) {
  try {
    const result = await pool.query(
      `INSERT INTO showcase_categories (name, subtitle, image, category, filter_tag, active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        data.name || 'New Category',
        data.subtitle || '',
        data.image || '',
        data.category || 'indian',
        data.filterTag || '',
        data.active !== false,
        parseInt(data.sort_order) || 0
      ]
    );
    
    console.log(`✅ Showcase category added: ${data.name}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error adding showcase category:', error);
    throw error;
  }
}

// ─── Update Category ───────────────────────────────────────────
async function updateCategory(id, data) {
  try {
    const result = await pool.query(
      `UPDATE showcase_categories 
      SET name = $1, subtitle = $2, image = $3, category = $4,
          filter_tag = $5, active = $6, sort_order = $7
      WHERE id = $8
      RETURNING *`,
      [
        data.name,
        data.subtitle || '',
        data.image || '',
        data.category,
        data.filterTag || '',
        data.active !== false,
        parseInt(data.sort_order) || 0,
        parseInt(id)
      ]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Category not found');
    }
    
    console.log(`✅ Showcase category updated: ${data.name}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error updating showcase category:', error);
    throw error;
  }
}

// ─── Delete Category ───────────────────────────────────────────
async function deleteCategory(id) {
  try {
    await pool.query('DELETE FROM showcase_categories WHERE id = $1', [parseInt(id)]);
    console.log(`✅ Showcase category deleted: ID ${id}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting showcase category:', error);
    throw error;
  }
}

module.exports = { 
  getAllCategories, 
  getAllCategoriesAdmin, 
  addCategory, 
  updateCategory, 
  deleteCategory 
};
