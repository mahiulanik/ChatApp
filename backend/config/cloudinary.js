
import { v2 as cloudinary } from "cloudinary";
import { randomUUID } from "node:crypto";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = (buffer, folder, options = {}) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                ...options
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });

export const uploadChatMedia = async (file, user) => {
    const userId = String(user._id);
    const fullName = user.fullName || "";

    const safeName = (fullName || "user")
        .trim()
        .replace(/[^\p{L}\p{N}_-]/gu, "_");

    const resourceType = file.mimetype.startsWith("image/")
        ? "image"
        : "video";

    const result = await uploadImage(file.buffer, `chat/${userId}`, {
        resource_type: resourceType,
        public_id: `${safeName}_${randomUUID()}`,
        tags: ["chat", `user_${userId}`],
        context: { user_name: fullName }
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type
    };
};
