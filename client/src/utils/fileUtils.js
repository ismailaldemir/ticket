import imageCompression from "browser-image-compression";

export const compressImage = async (imageFile, quality = 0.6) => {
  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality,
    };

    return await imageCompression(imageFile, options);
  } catch (error) {
    console.error("Resim sıkıştırma hatası:", error);
    throw error;
  }
};
