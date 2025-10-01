// Image cache utility to prevent continuous loading
class ImageCache {
  private cache = new Map<string, string>();
  private failedImages = new Set<string>();

  // Check if image is already cached or failed
  isCached(url: string): boolean {
    return this.cache.has(url) || this.failedImages.has(url);
  }

  // Get cached image URL
  getCached(url: string): string | null {
    return this.cache.get(url) || null;
  }

  // Cache successful image
  setCached(originalUrl: string, cachedUrl: string): void {
    this.cache.set(originalUrl, cachedUrl);
  }

  // Mark image as failed
  setFailed(url: string): void {
    this.failedImages.add(url);
  }

  // Check if image failed before
  hasFailed(url: string): boolean {
    return this.failedImages.has(url);
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
    this.failedImages.clear();
  }

  // Get cache size
  getSize(): number {
    return this.cache.size;
  }
}

// Global image cache instance
export const imageCache = new ImageCache();

// Utility function to get optimized image URL
export const getOptimizedImageUrl = (url: string, fallback: string = '/images/default-car.jpg'): string => {
  // If image failed before, return fallback immediately
  if (imageCache.hasFailed(url)) {
    return fallback;
  }

  // If image is cached, return cached URL
  const cached = imageCache.getCached(url);
  if (cached) {
    return cached;
  }

  // Return original URL for first load
  return url;
};

// Utility function to handle image load success
export const handleImageLoadSuccess = (originalUrl: string, actualUrl: string): void => {
  imageCache.setCached(originalUrl, actualUrl);
};

// Utility function to handle image load error
export const handleImageLoadError = (url: string): void => {
  imageCache.setFailed(url);
};
