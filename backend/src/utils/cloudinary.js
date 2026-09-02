import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an in-memory file buffer to Cloudinary and returns the result
 * (result.secure_url is what should be stored as photo_url in Mongo).
 * Required because free hosts (Render/Railway free tier) wipe local disk
 * on every restart/redeploy, so we can no longer save photos with multer's
 * disk storage the way the original code did.
 */
export const uploadBufferToCloudinary = (buffer, folder = "prahari-ai") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

export default cloudinary;
