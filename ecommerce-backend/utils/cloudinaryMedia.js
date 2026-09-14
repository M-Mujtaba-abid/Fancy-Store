import cloudinary from "./cloudinary.js";

// ✅ Updated: resource_type parameter support ("image" ya "video")
export const uploadBuffer = ({ buffer, folder, resource_type = "image" }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(buffer);
  });

export const uploadManyBuffers = async ({ files, folder, resource_type = "image" }) => {
  const normalizedFiles = Array.isArray(files) ? files : [files];
  return Promise.all(
    normalizedFiles.map((file) => uploadBuffer({ buffer: file.buffer, folder, resource_type })),
  );
};

export const destroyByUrl = async ({ url, folder, resource_type = "image" }) => {
  const publicId = url.split("/").pop().split(".")[0];
  return cloudinary.uploader.destroy(`${folder}/${publicId}`, { resource_type });
};

export const destroyManyByUrls = async ({ urls, folder, resource_type = "image" }) =>
  Promise.all((urls || []).map((url) => destroyByUrl({ url, folder, resource_type })));
