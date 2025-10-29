/**
 * CLOUDINARY UPLOAD HANDLER
 * Secure photo upload for profile pictures, property photos, and documents
 *
 * Features:
 * - Profile pictures (buyers, sellers, admins)
 * - Property photos (seller submissions)
 * - Documents (mortgage statements, tax bills, IDs)
 * - Auto-compression and optimization
 * - Secure signed uploads
 * - File type validation
 * - Size limits
 */

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════
// CLOUDINARY CONFIGURATION
// ═══════════════════════════════════════════════════════════

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ═══════════════════════════════════════════════════════════
// UPLOAD CATEGORIES
// ═══════════════════════════════════════════════════════════

const UPLOAD_CATEGORIES = {
  PROFILE_PICTURE: {
    folder: 'velocity-re/profiles',
    maxSizeKB: 5120,           // 5MB max
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto:good',
      format: 'webp'
    }
  },

  PROPERTY_PHOTO: {
    folder: 'velocity-re/properties',
    maxSizeKB: 10240,          // 10MB max
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 1920,
      height: 1080,
      crop: 'limit',
      quality: 'auto:good',
      format: 'webp'
    }
  },

  PROPERTY_THUMBNAIL: {
    folder: 'velocity-re/properties/thumbs',
    maxSizeKB: 10240,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: {
      width: 600,
      height: 400,
      crop: 'fill',
      quality: 'auto:good',
      format: 'webp'
    }
  },

  DOCUMENT: {
    folder: 'velocity-re/documents',
    maxSizeKB: 20480,          // 20MB max (for PDFs)
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
    transformation: {
      quality: 'auto:good',
      format: 'auto'
    }
  }
};

// ═══════════════════════════════════════════════════════════
// MULTER CONFIGURATION (Temporary storage)
// ═══════════════════════════════════════════════════════════

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024  // 20MB absolute max
  },
  fileFilter: (req, file, cb) => {
    const category = UPLOAD_CATEGORIES[req.body.category];

    if (!category) {
      return cb(new Error('Invalid upload category'));
    }

    const ext = file.originalname.split('.').pop().toLowerCase();

    if (!category.allowedFormats.includes(ext)) {
      return cb(new Error(`Invalid file type. Allowed: ${category.allowedFormats.join(', ')}`));
    }

    cb(null, true);
  }
});

// ═══════════════════════════════════════════════════════════
// UPLOAD CLASS
// ═══════════════════════════════════════════════════════════

class UploadHandler {

  /**
   * UPLOAD PROFILE PICTURE
   * For buyers, sellers, admins
   */
  async uploadProfilePicture(file, userId) {
    console.log(`📸 Uploading profile picture for user: ${userId}`);

    const category = UPLOAD_CATEGORIES.PROFILE_PICTURE;

    // Validate file size
    if (file.size > category.maxSizeKB * 1024) {
      throw new Error(`File too large. Max ${category.maxSizeKB / 1024}MB`);
    }

    // Generate unique filename
    const publicId = `${category.folder}/${userId}_${Date.now()}`;

    try {
      // Upload to Cloudinary with transformations
      const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        public_id: publicId,
        folder: category.folder,
        transformation: [category.transformation],
        resource_type: 'image',
        overwrite: true
      });

      console.log(`   ✅ Uploaded: ${result.secure_url}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };

    } catch (error) {
      console.error(`   ❌ Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * UPLOAD PROPERTY PHOTO
   * For seller property submissions
   */
  async uploadPropertyPhoto(file, propertyId) {
    console.log(`🏠 Uploading property photo for: ${propertyId}`);

    const category = UPLOAD_CATEGORIES.PROPERTY_PHOTO;

    if (file.size > category.maxSizeKB * 1024) {
      throw new Error(`File too large. Max ${category.maxSizeKB / 1024}MB`);
    }

    const publicId = `${category.folder}/${propertyId}_${Date.now()}`;

    try {
      // Upload full-size image
      const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        public_id: publicId,
        folder: category.folder,
        transformation: [category.transformation],
        resource_type: 'image'
      });

      // Also create thumbnail
      const thumbCategory = UPLOAD_CATEGORIES.PROPERTY_THUMBNAIL;
      const thumbPublicId = `${thumbCategory.folder}/${propertyId}_${Date.now()}`;

      const thumbnail = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        public_id: thumbPublicId,
        folder: thumbCategory.folder,
        transformation: [thumbCategory.transformation],
        resource_type: 'image'
      });

      console.log(`   ✅ Full size: ${result.secure_url}`);
      console.log(`   ✅ Thumbnail: ${thumbnail.secure_url}`);

      return {
        success: true,
        fullSize: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height
        },
        thumbnail: {
          url: thumbnail.secure_url,
          publicId: thumbnail.public_id,
          width: thumbnail.width,
          height: thumbnail.height
        }
      };

    } catch (error) {
      console.error(`   ❌ Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * UPLOAD DOCUMENT
   * For mortgage statements, tax bills, IDs, etc.
   */
  async uploadDocument(file, userId, documentType) {
    console.log(`📄 Uploading document: ${documentType} for user: ${userId}`);

    const category = UPLOAD_CATEGORIES.DOCUMENT;

    if (file.size > category.maxSizeKB * 1024) {
      throw new Error(`File too large. Max ${category.maxSizeKB / 1024}MB`);
    }

    const publicId = `${category.folder}/${userId}/${documentType}_${Date.now()}`;

    try {
      const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
        public_id: publicId,
        folder: `${category.folder}/${userId}`,
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
        transformation: file.mimetype !== 'application/pdf' ? [category.transformation] : undefined
      });

      console.log(`   ✅ Uploaded: ${result.secure_url}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resource_type
      };

    } catch (error) {
      console.error(`   ❌ Upload failed: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * DELETE FILE FROM CLOUDINARY
   */
  async deleteFile(publicId, resourceType = 'image') {
    console.log(`🗑️  Deleting file: ${publicId}`);

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      console.log(`   ✅ Deleted: ${publicId}`);
      return { success: true, result };

    } catch (error) {
      console.error(`   ❌ Delete failed: ${error.message}`);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * GENERATE SIGNED UPLOAD URL
   * For direct browser uploads (more secure)
   */
  generateSignedUploadUrl(category, userId) {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = UPLOAD_CATEGORIES[category].folder;
    const publicId = `${folder}/${userId}_${timestamp}`;

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        public_id: publicId,
        folder: folder
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return {
      url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      publicId,
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder
    };
  }

  /**
   * GET OPTIMIZED IMAGE URL
   * Generate URL with specific transformations on-the-fly
   */
  getOptimizedUrl(publicId, width, height, crop = 'fill') {
    return cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality: 'auto:good',
      format: 'webp',
      fetch_format: 'auto'
    });
  }
}

// ═══════════════════════════════════════════════════════════
// EXPRESS ROUTES
// ═══════════════════════════════════════════════════════════

function setupUploadRoutes(app) {
  const handler = new UploadHandler();

  /**
   * UPLOAD PROFILE PICTURE
   * POST /api/upload/profile-picture
   */
  app.post('/api/upload/profile-picture', upload.single('photo'), async (req, res) => {
    try {
      const userId = req.user.userId; // From auth middleware

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await handler.uploadProfilePicture(req.file, userId);

      // Update user profile with new photo URL
      // await updateUserProfile(userId, { profilePicture: result.url });

      res.json(result);

    } catch (error) {
      console.error('Profile picture upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * UPLOAD PROPERTY PHOTO
   * POST /api/upload/property-photo
   */
  app.post('/api/upload/property-photo', upload.single('photo'), async (req, res) => {
    try {
      const propertyId = req.body.propertyId;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!propertyId) {
        return res.status(400).json({ error: 'Property ID required' });
      }

      const result = await handler.uploadPropertyPhoto(req.file, propertyId);

      // Save photo URLs to property record
      // await addPropertyPhoto(propertyId, result.fullSize.url, result.thumbnail.url);

      res.json(result);

    } catch (error) {
      console.error('Property photo upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * UPLOAD DOCUMENT
   * POST /api/upload/document
   */
  app.post('/api/upload/document', upload.single('document'), async (req, res) => {
    try {
      const userId = req.user.userId;
      const documentType = req.body.documentType; // 'mortgage-statement', 'tax-bill', etc.

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!documentType) {
        return res.status(400).json({ error: 'Document type required' });
      }

      const result = await handler.uploadDocument(req.file, userId, documentType);

      // Save document to user's document vault
      // await addDocument(userId, {
      //   type: documentType,
      //   fileUrl: result.url,
      //   fileName: req.file.originalname,
      //   fileSize: result.bytes,
      //   uploadedAt: Date.now()
      // });

      res.json(result);

    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET SIGNED UPLOAD URL
   * POST /api/upload/signed-url
   */
  app.post('/api/upload/signed-url', (req, res) => {
    try {
      const userId = req.user.userId;
      const category = req.body.category; // 'PROFILE_PICTURE', 'PROPERTY_PHOTO', etc.

      if (!UPLOAD_CATEGORIES[category]) {
        return res.status(400).json({ error: 'Invalid category' });
      }

      const signedData = handler.generateSignedUploadUrl(category, userId);
      res.json(signedData);

    } catch (error) {
      console.error('Signed URL error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * DELETE FILE
   * DELETE /api/upload/:publicId
   */
  app.delete('/api/upload/:publicId(*)', async (req, res) => {
    try {
      const publicId = req.params.publicId;
      const resourceType = req.query.resourceType || 'image';

      const result = await handler.deleteFile(publicId, resourceType);
      res.json(result);

    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

// ═══════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════

module.exports = {
  UploadHandler,
  setupUploadRoutes,
  UPLOAD_CATEGORIES
};
