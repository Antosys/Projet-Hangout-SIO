

import { useState, useEffect } from 'react';

export const useImagePreloader = (imageUrls: string[]) => {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (imageUrls.length === 0) {
      setImagesLoaded(true);
      return;
    }

    let loadedImages = 0;

    const loadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedImages++;
          setLoadedCount(loadedImages);
          if (loadedImages === imageUrls.length) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.onerror = () => {
          loadedImages++;
          setLoadedCount(loadedImages);
          if (loadedImages === imageUrls.length) {
            setImagesLoaded(true);
          }
          resolve();
        };
        img.src = url;
      });
    };

    Promise.all(imageUrls.map(loadImage));
  }, [imageUrls]);

  return { imagesLoaded, loadedCount, totalImages: imageUrls.length };
};

