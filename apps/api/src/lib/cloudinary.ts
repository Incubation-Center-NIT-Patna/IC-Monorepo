import { v2 as cloudinary } from "cloudinary";
import { env } from "../env";

const isConfigured = Boolean(
  env.CLOUDINARY_URL || (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
);

if (env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: env.CLOUDINARY_URL,
    secure: true,
  });
} else if (env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  resourceType?: "image" | "raw" | "auto" | "video";
}

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

export const cloudinaryService = {
  isConfigured,

  /**
   * Upload buffer directly to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    if (!isConfigured) {
      throw new Error(
        "Cloudinary is not configured. Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET or CLOUDINARY_URL.",
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder ?? "incubation_center",
          public_id: options.publicId,
          resource_type: options.resourceType ?? "auto",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            url: result.url,
            secureUrl: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
        },
      );

      uploadStream.end(buffer);
    });
  },

  /**
   * Delete an asset from Cloudinary
   */
  async deleteAsset(publicId: string): Promise<boolean> {
    if (!isConfigured) return false;
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res?.result === "ok";
    } catch {
      return false;
    }
  },

  /**
   * Build an optimized Cloudinary delivery URL
   */
  getOptimizedUrl(
    publicId: string,
    transformations: Record<string, any> = {},
  ): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: "auto",
      fetch_format: "auto",
      ...transformations,
    });
  },
};

export { cloudinary };

