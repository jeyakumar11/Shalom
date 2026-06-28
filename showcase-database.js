const fs = require('fs');
const path = require('path');

const SHOWCASE_DB_PATH = path.join(__dirname, 'showcase-categories.json');

// category = which main tab to show (indian/western/bridal/accessories)
// filterTag = keyword to filter products by (matches product name/occasion/description)
//             empty string means show ALL products in that category (no sub-filter)

const DEFAULT_CARDS = [
  { id:1, name:'College Wear',        subtitle:'',                      image:'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', category:'indian',      filterTag:'college',    active:true, sort_order:1 },
  { id:2, name:'Ethnic Sarees',       subtitle:'',                      image:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600', category:'indian',      filterTag:'saree',      active:true, sort_order:2 },
  { id:3, name:'Elegant Designs',     subtitle:'',                      image:'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', category:'indian',      filterTag:'',           active:true, sort_order:3 },
  { id:4, name:'Mens Wear',           subtitle:'',                      image:'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600', category:'western',     filterTag:'mens',       active:true, sort_order:4 },
  { id:5, name:'Christian Bridal',    subtitle:'bridal wear',           image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', category:'bridal',      filterTag:'christian',  active:true, sort_order:5 },
  { id:6, name:'Bridal Wear',         subtitle:'',                      image:'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', category:'bridal',      filterTag:'',           active:true, sort_order:6 },
  { id:7, name:'Skirts',              subtitle:'Contemporary/Fusion',   image:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600', category:'western',     filterTag:'skirt',      active:true, sort_order:7 },
  { id:8, name:'Contemporary/Fusion', subtitle:'Modern Styles',         image:'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600', category:'western',     filterTag:'',           active:true, sort_order:8 }
];

function initShowcaseDB() {
  if (!fs.existsSync(SHOWCASE_DB_PATH)) {
    fs.writeFileSync(SHOWCASE_DB_PATH, JSON.stringify({
      categories: DEFAULT_CARDS.map(c => ({ ...c, created_at: new Date().toISOString() }))
    }, null, 2));
  }
}

function readDB() {
  try {
    initShowcaseDB();
    return JSON.parse(fs.readFileSync(SHOWCASE_DB_PATH, 'utf8'));
  } catch { return { categories: [] }; }
}

function writeDB(data) {
  fs.writeFileSync(SHOWCASE_DB_PATH, JSON.stringify(data, null, 2));
}

function getAllCategories() {
  const db = readDB();
  return db.categories.filter(c => c.active !== false).sort((a,b) => (a.sort_order||0)-(b.sort_order||0));
}

function getAllCategoriesAdmin() {
  return readDB().categories.sort((a,b) => (a.sort_order||0)-(b.sort_order||0));
}

function addCategory(data) {
  const db = readDB();
  const id = db.categories.length > 0 ? Math.max(...db.categories.map(c=>c.id))+1 : 1;
  const cat = {
    id,
    name:       data.name || 'New Category',
    subtitle:   data.subtitle || '',
    image:      data.image || '',
    category:   data.category || 'indian',
    filterTag:  data.filterTag || '',
    active:     data.active !== false,
    sort_order: parseInt(data.sort_order) || id,
    created_at: new Date().toISOString()
  };
  db.categories.push(cat);
  writeDB(db);
  return cat;
}

function updateCategory(id, data) {
  const db = readDB();
  const idx = db.categories.findIndex(c => c.id === parseInt(id));
  if (idx === -1) throw new Error('Category not found');
  db.categories[idx] = { ...db.categories[idx], ...data, id: parseInt(id), updated_at: new Date().toISOString() };
  writeDB(db);
  return db.categories[idx];
}

function deleteCategory(id) {
  const db = readDB();
  db.categories = db.categories.filter(c => c.id !== parseInt(id));
  writeDB(db);
}

module.exports = { getAllCategories, getAllCategoriesAdmin, addCategory, updateCategory, deleteCategory };
