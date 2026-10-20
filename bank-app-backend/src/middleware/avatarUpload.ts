import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

const uploadDirectory = path.resolve(process.cwd(), "uploads", "avatars");

fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory);
  },

  filename: (_req, file, callback) => {
    const extension = allowedMimeTypes[file.mimetype];

    if (!extension) {
      return callback(new Error("Unsupported image type"), "");
    }

    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!Object.hasOwn(allowedMimeTypes, file.mimetype)) {
      return callback(new Error("Only JPEG, PNG and WebP images are allowed"));
    }

    callback(null, true);
  },
}).single("avatar");
