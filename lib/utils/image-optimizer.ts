"use client"

/**
 * Optimizes an image by resizing it and converting to WebP format
 * @param file The image file to optimize
 * @param maxWidth Maximum width of the optimized image
 * @param quality Quality of the optimized image (0-1)
 * @returns A Promise that resolves to the optimized image as a Blob
 */
export async function optimizeImage(
  file: File,
  maxWidth = 800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Release object URL
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      // Create canvas for resizing
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize image on canvas
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Could not create blob from canvas"));
          }
        },
        "image/webp",
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };
    
    img.src = URL.createObjectURL(file);
  });
}