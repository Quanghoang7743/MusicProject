/**
 * Get the full image URL from a filename stored in the database
 * @param {string} filename - The filename from the API (e.g., "artist2.jpg", "song5.jpg", or full URL)
 * @param {string} type - Optional type for default images ('artist', 'album', 'song', 'user')
 * @returns {string} - Full image path
 */
export const getImageUrl = (filename, type = 'default') => {
  // If no filename provided, return default image
  if (!filename || filename === '') {
    const defaults = {
      artist: '/images/thang.jpg',
      album: '/images/thang.jpg',
      song: '/images/thang.jpg',
      user: '/images/thang.jpg',
      genre: '/images/thang.jpg', 
      default: '/images/thang.jpg'
    };
    return defaults[type] || defaults.default;
  }

  // If it's already a full URL (starts with http), return as-is
  // BUT: Convert http:// to https:// to avoid mixed content issues
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    // Force HTTPS for Cloudinary URLs to avoid mixed content
    if (filename.startsWith('http://')) {
      const httpsUrl = filename.replace('http://', 'https://');
      console.log(`🔒 Converting HTTP to HTTPS: ${filename} → ${httpsUrl}`);
      return httpsUrl;
    }
    return filename;
  }

  // If it already starts with /images/, return as-is
  if (filename.startsWith('/images/')) {
    return filename;
  }

  // If it starts with just /, prepend images
  if (filename.startsWith('/')) {
    return `/images${filename}`;
  }

  // Otherwise, it's just a filename - prepend /images/
  return `/images/${filename}`;
};

/**
 * Transform a single item's image URL
 */
export const transformImageUrl = (item, imageField, type = 'default') => {
  if (!item) return item;

  const originalUrl = item[imageField];
  const transformedUrl = getImageUrl(originalUrl, type);

  // Debug log to track transformations
  if (originalUrl !== transformedUrl) {
    console.log(`🖼️ Transformed ${imageField}: ${originalUrl} → ${transformedUrl}`);
  }

  return {
    ...item,
    [imageField]: transformedUrl
  };
};

/**
 * Transform array of items' image URLs
 */
export const transformImageUrls = (items, imageField, type = 'default') => {
  if (!Array.isArray(items)) {
    console.warn('⚠️ transformImageUrls: items is not an array', items);
    return items;
  }

  console.log(`🎨 Transforming ${imageField} for ${items.length} items`);

  return items.map(item => transformImageUrl(item, imageField, type));
};