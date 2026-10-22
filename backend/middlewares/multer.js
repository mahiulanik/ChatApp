import multer from "multer";

const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "audio/mpeg",
    "audio/mp4",
    "audio/wav",
    "audio/wave",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/aac"
]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024,  // 10 MB
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (!allowedTypes.has(file.mimetype)) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    }
});

export default upload;
