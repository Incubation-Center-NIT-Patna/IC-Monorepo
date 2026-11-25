import type { FastifyPluginAsync } from "fastify";
import { cloudinaryService } from "../../lib/cloudinary";
import { requireAuth } from "../../middleware/auth";

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAuth);

  app.post(
    "/",
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
    try {
      const isMultipart = request.isMultipart();

      let buffer: Buffer | null = null;
      let filename = "image.png";

      if (isMultipart) {
        const file = await request.file();
        if (!file) {
          return reply.status(400).send({
            success: false,
            message: "No file provided in multipart request",
          });
        }
        buffer = await file.toBuffer();
        filename = file.filename || "image.png";
      } else {
        const body = request.body as { data?: string; name?: string };
        if (!body || !body.data) {
          return reply.status(400).send({
            success: false,
            message: "No image data provided in body",
          });
        }

        const base64Data = body.data.replace(/^data:image\/\w+;base64,/, "");
        buffer = Buffer.from(base64Data, "base64");
        filename = body.name || "upload.png";
      }

      if (!buffer) {
        return reply.status(400).send({
          success: false,
          message: "Failed to read image buffer",
        });
      }

      // Security: File size limit (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (buffer.length > MAX_FILE_SIZE) {
        return reply.status(400).send({
          success: false,
          message: "File size exceeds the 10MB limit",
        });
      }

      // Security: Validate image magic bytes to prevent arbitrary binary upload
      const isPng = buffer.length > 4 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
      const isJpg = buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
      const isWebp = buffer.length > 12 && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
      const isGif = buffer.length > 4 && buffer.subarray(0, 4).toString() === "GIF8";

      if (!isPng && !isJpg && !isWebp && !isGif) {
        return reply.status(400).send({
          success: false,
          message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are permitted.",
        });
      }

      if (cloudinaryService.isConfigured) {
        const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_").split(".")[0];
        const publicId = `${Date.now()}_${cleanName}`;
        const result = await cloudinaryService.uploadBuffer(buffer, {
          folder: "incubation_center",
          publicId,
        });

        return reply.send({
          success: true,
          url: result.secureUrl || result.url,
          publicId: result.publicId,
        });
      } else {
        return reply.status(503).send({
          success: false,
          message: "Cloudinary is not configured on the server",
        });
      }
    } catch (err: any) {
      request.log.error(err, "Image upload failed");
      return reply.status(500).send({
        success: false,
        message: err.message || "Failed to process image upload",
      });
    }
  });
};

