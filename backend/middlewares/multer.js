import multer from "multer";

const allowedTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",

    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // Audio / Voice Messages
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac"
];

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 2 * 1024 * 1024 // 2 MB
    },

    fileFilter: (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Unsupported file type")
            );
        }

        cb(null, true);
    }
});

export default upload;