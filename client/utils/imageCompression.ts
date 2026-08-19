// Client-side image compression — components/admin/products/AddProduct.tsx se
// nikal kar shared banaya, taake category form bhi isko use kar sake.
//
// ⚠️ Ye cosmetic nahi, LOAD-BEARING hai:
//   - Backend multer 8 MB pe cap karta hai (middleware/multer.middleware.js:13-28)
//   - Vercel ~4.5 MB request body edge pe hi reject kar deta hai
//   - MulterError error.middleware.js se bare HTTP 500 "File too large" banta hai,
//     yani admin ko validation message ke bajaye server error dikhta hai
//   - Reference: maujooda category PNGs 7-8.6 MB ke hain (seatCover.png ~8.6 MB),
//     yani woh aaj ke limit se BAHAR hain
//
// Compression ke baad typical output ~200-400 KB WebP hota hai.

export const MAX_IMAGE_DIMENSION = 1600;
export const IMAGE_QUALITY = 0.8;

export const compressImageFile = (file: File): Promise<File> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION / image.width,
        MAX_IMAGE_DIMENSION / image.height,
      );
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Could not initialize image compressor"));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Image compression failed"));
            return;
          }
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            {
              type: "image/webp",
              lastModified: Date.now(),
            },
          );
          resolve(compressedFile);
        },
        "image/webp",
        IMAGE_QUALITY,
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Invalid image file"));
    };

    image.src = objectUrl;
  });
