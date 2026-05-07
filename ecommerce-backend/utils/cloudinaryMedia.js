import cloudinary from "./cloudinary.js";

export const uploadBuffer = ({ buffer, folder }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });

    stream.end(buffer);
  });

export const uploadManyBuffers = async ({ files, folder }) => {
  const normalizedFiles = Array.isArray(files) ? files : [files];
  return Promise.all(
    normalizedFiles.map((file) => uploadBuffer({ buffer: file.buffer, folder })),
  );
};

export const destroyByUrl = async ({ url, folder }) => {
  const publicId = url.split("/").pop().split(".")[0];
  return cloudinary.uploader.destroy(`${folder}/${publicId}`);
};

export const destroyManyByUrls = async ({ urls, folder }) =>
  Promise.all((urls || []).map((url) => destroyByUrl({ url, folder })));
