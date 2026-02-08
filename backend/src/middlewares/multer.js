import multer from 'multer'
import crypto from 'crypto'
import path from 'path'

// Allowed file types (images only)
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public")
    },
    filename: (req, file, cb) => {
        // Generate a unique, safe filename instead of using user-provided originalname
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${uniqueSuffix}${ext}`)
    }
});

// File filter to validate file type
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error(`Invalid file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`), false);
    }

    cb(null, true);
};

let upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max per file
        files: 5 // Max 5 files per request
    }
})

export default upload
