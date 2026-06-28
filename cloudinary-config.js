// ═══════════════════════════════════════════════════════════════
// Cloudinary Configuration for Image Uploads
// Replaces: Local multer file storage
// ═══════════════════════════════════════════════════════════════

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// ─── Configure Cloudinary ──────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Cloudinary Storage for Multer ─────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shalom-fashion/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1000, height: 1000, crop: 'limit', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-${uniqueSuffix}`;
    }
  }
});

// ─── Multer Upload Middleware ──────────────────────────────────
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp)'));
    }
  }
});

// ─── Helper: Delete Image from Cloudinary ──────────────────────
async function deleteImage(imageUrl) {
  try {
    // Extract public_id from Cloudinary URL
    // Example URL: https://res.cloudinary.com/xxx/image/upload/v123/shalom-fashion/products/product-123.jpg
    const match = imageUrl.match(/\/shalom-fashion\/products\/(.+)\./);
    if (match && match[1]) {
      const publicId = `shalom-fashion/products/${match[1]}`;
      await cloudinary.uploader.destroy(publicId);
      console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    return false;
  }
}

// ─── Helper: Get Optimized Image URL ───────────────────────────
function getOptimizedUrl(imageUrl, width = 800, height = 800) {
  // Cloudinary automatically optimizes, but you can customize transformations
  return imageUrl.replace('/upload/', `/upload/w_${width},h_${height},c_limit,q_auto:good/`);
}

module.exports = {
  cloudinary,
  upload,
  deleteImage,
  getOptimizedUrl
};
