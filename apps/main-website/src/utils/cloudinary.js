'use client';

import { useState, useEffect } from 'react';

/**
 * Checks browser connection status to determine network quality.
 * Returns 'poor' for slow connections (2g, 3g, saveData) or 'good' for fast connection.
 * @returns {'poor' | 'good'}
 */
export function getNetworkQuality() {
  if (typeof window === 'undefined') return 'good';

  const nav = window.navigator;
  const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
  if (!conn) return 'good';

  if (conn.saveData) return 'poor';
  if (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return 'poor';

  return 'good';
}

/**
 * Hook to reactively keep track of network quality on client side.
 * @returns {'poor' | 'good'}
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState('good');

  useEffect(() => {
    setQuality(getNetworkQuality());

    const nav = window.navigator;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    if (!conn || !conn.addEventListener) return;

    const handleConnectionChange = () => {
      setQuality(getNetworkQuality());
    };

    conn.addEventListener('change', handleConnectionChange);
    return () => {
      conn.removeEventListener('change', handleConnectionChange);
    };
  }, []);

  return quality;
}

/**
 * Injects format, quality, and width parameters into a Cloudinary URL based on network quality.
 * @param {string} url - Original Cloudinary image URL
 * @param {object} [options]
 * @param {'poor'|'good'} [options.networkQuality] - Override network quality ('poor'|'good')
 * @param {string} [options.quality] - Specific Cloudinary quality setting (e.g., 'q_auto:eco')
 * @param {string} [options.format] - Specific format (default: 'f_auto')
 * @param {number|string} [options.width] - Optional target width in pixels (e.g. 800)
 * @param {string} [options.crop] - Crop mode (default: 'c_limit')
 * @returns {string} - Transformed Cloudinary URL
 */
export function getOptimizedCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string' || !url.includes('/image/upload')) {
    return url;
  }

  const qualityState = options.networkQuality || getNetworkQuality();

  // If poor network: use q_auto:eco (or q_auto:low); if good network: use q_auto:good (or q_auto)
  const defaultQuality = qualityState === 'poor' ? 'q_auto:eco' : 'q_auto:good';
  const selectedQuality = options.quality || defaultQuality;
  const selectedFormat = options.format || 'f_auto';

  const transformParts = [selectedFormat, selectedQuality];

  // Optional width scaling (especially helpful for mobile)
  if (options.width) {
    const targetWidth = qualityState === 'poor' ? Math.min(Number(options.width), 800) : options.width;
    transformParts.push(`w_${targetWidth}`);
    transformParts.push(options.crop || 'c_limit');
  }

  const transformationString = transformParts.join(',');

  // Check if transformations already exist in the URL
  if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
    return url
      .replace(/f_auto/g, selectedFormat)
      .replace(/q_auto(:[a-z]+)?/g, selectedQuality);
  }

  // Insert transformations right after /image/upload/
  return url.replace('/image/upload/', `/image/upload/${transformationString}/`);
}
