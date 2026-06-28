// ═══════════════════════════════════════════════════════════════
// Vercel Postgres Database - Showcase Categories Module
// Replaces: showcase-database.js (JSON-based)
// ═══════════════════════════════════════════════════════════════

const { sql } = require('@vercel/postgres');

// ─── Get All Active Categories (Public) ────────────────────────
async function getAllCategories() {
  try {
    const result = await sql`
      SELECT * FROM showcase_categories 
      WHERE active = true
      ORDER BY sort_order ASC, id ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching showcase categories:', error);
    return [];
  }
}

// ─── Get All Categories (Admin) ────────────────────────────────
async function getAllCategoriesAdmin() {
  try {
    const result = await sql`
      SELECT * FROM showcase_categories 
      ORDER BY sort_order ASC, id ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching showcase categories (admin):', error);
    return [];
  }
}

// ─── Add Category ──────────────────────────────────────────────
async function addCategory(data) {
  try {
    const result = await sql`
      INSERT INTO showcase_categories (
        name, subtitle, image, category, 
        filter_tag, active, sort_order
      ) VALUES (
        ${data.name || 'New Category'},
        ${data.subtitle || ''},
        ${data.image || ''},
        ${data.category || 'indian'},
        ${data.filterTag || ''},
        ${data.active !== false},
        ${parseInt(data.sort_order) || 0}
      )
      RETURNING *
    `;
    
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
    const result = await sql`
      UPDATE showcase_categories 
      SET 
        name = ${data.name},
        subtitle = ${data.subtitle || ''},
        image = ${data.image || ''},
        category = ${data.category},
        filter_tag = ${data.filterTag || ''},
        active = ${data.active !== false},
        sort_order = ${parseInt(data.sort_order) || 0}
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;
    
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
    await sql`
      DELETE FROM showcase_categories 
      WHERE id = ${parseInt(id)}
    `;
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
