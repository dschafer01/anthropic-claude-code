// Course Search Service - External API integration for golf course search

import * as Location from 'expo-location';
import { getItem, setItem, STORAGE_KEYS } from '../utils/storage';
import { TOP_US_COURSES, searchCuratedDatabase } from '../data/topUSCourses';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Main search function - searches for golf courses with caching and fallbacks
 * @param {string} query - Search term (course name or location)
 * @param {object} options - Search options
 * @returns {Promise<{success: boolean, results: array, source: string, error?: string}>}
 */
export const searchCourses = async (query, options = {}) => {
  const { useLocation = true, radiusMiles = 50 } = options;
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery || normalizedQuery.length < 2) {
    return { success: false, results: [], error: 'query_too_short' };
  }

  // Check cache first
  const cached = await getCachedResults(normalizedQuery);
  if (cached) {
    return { success: true, results: cached, source: 'cache' };
  }

  let userLocation = null;

  // Get user location if available
  if (useLocation) {
    userLocation = await getUserLocation();
  }

  try {
    // Try Overpass API first
    const results = await searchOverpass(normalizedQuery, userLocation, radiusMiles);
    if (results.length > 0) {
      await cacheResults(normalizedQuery, results);
      return { success: true, results, source: 'openstreetmap' };
    }
  } catch (error) {
    console.warn('Overpass API failed:', error.message);
  }

  // Fallback to curated database
  const fallbackResults = searchCuratedDatabase(normalizedQuery, userLocation);
  if (fallbackResults.length > 0) {
    return { success: true, results: fallbackResults, source: 'curated' };
  }

  return { success: false, results: [], error: 'no_results' };
};

/**
 * Get user's current location
 */
const getUserLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn('Could not get location:', error.message);
    return null;
  }
};

/**
 * Search using OpenStreetMap Overpass API
 */
const searchOverpass = async (query, userLocation, radiusMiles) => {
  let bbox = null;
  let searchCenter = userLocation;

  // If no user location, try to geocode the query
  if (!searchCenter) {
    searchCenter = await geocodeLocation(query);
  }

  // Create bounding box if we have a location
  if (searchCenter) {
    bbox = getBoundingBox(searchCenter, radiusMiles);
  }

  // Build and execute Overpass query
  const overpassQuery = buildOverpassQuery(query, bbox);

  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'GolfScoreTrackerApp/1.0',
    },
    body: `data=${encodeURIComponent(overpassQuery)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  return parseOverpassResults(data, query, userLocation || searchCenter);
};

/**
 * Geocode a location string to coordinates using Nominatim
 */
const geocodeLocation = async (query) => {
  try {
    // Add "golf" to help find golf-related locations
    const searchTerms = [query, `${query} golf course`, `${query} golf`];

    for (const term of searchTerms) {
      const url = `${NOMINATIM_API_URL}?q=${encodeURIComponent(term)}&format=json&limit=1&countrycodes=us`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GolfScoreTrackerApp/1.0',
        },
      });

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          return {
            latitude: parseFloat(results[0].lat),
            longitude: parseFloat(results[0].lon),
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('Geocoding failed:', error.message);
    return null;
  }
};

/**
 * Build Overpass QL query for golf courses
 */
const buildOverpassQuery = (searchTerm, bbox) => {
  const escapedTerm = escapeRegex(searchTerm);
  const bboxStr = bbox ? `(${bbox.south},${bbox.west},${bbox.north},${bbox.east})` : '';

  // If we have a bbox, search within it; otherwise do a broader name search
  if (bbox) {
    return `
      [out:json][timeout:25];
      (
        way["leisure"="golf_course"]${bboxStr};
        relation["leisure"="golf_course"]${bboxStr};
        node["leisure"="golf_course"]${bboxStr};
        way["golf"="course"]${bboxStr};
        relation["golf"="course"]${bboxStr};
      );
      out center tags;
    `;
  }

  // No bbox - search by name globally (limited results)
  return `
    [out:json][timeout:25];
    (
      way["leisure"="golf_course"]["name"~"${escapedTerm}",i];
      relation["leisure"="golf_course"]["name"~"${escapedTerm}",i];
      way["golf"="course"]["name"~"${escapedTerm}",i];
    );
    out center tags 20;
  `;
};

/**
 * Parse Overpass API response into app course format
 */
const parseOverpassResults = (data, searchTerm, userLocation) => {
  const elements = data.elements || [];
  const query = searchTerm.toLowerCase();

  return elements
    .filter((el) => el.tags && el.tags.name)
    .map((el) => {
      const lat = el.center?.lat || el.lat;
      const lon = el.center?.lon || el.lon;

      return {
        id: `osm_${el.id}`,
        osmId: el.id,
        name: el.tags.name,
        location: formatAddress(el.tags),
        coordinates: lat && lon ? { latitude: lat, longitude: lon } : null,
        distance:
          userLocation && lat && lon
            ? calculateDistance(userLocation, { latitude: lat, longitude: lon })
            : null,
        holes: getHoleCount(el.tags),
        website: el.tags.website || el.tags.url || null,
        phone: el.tags.phone || null,
        source: 'openstreetmap',
        // These need manual entry
        courseRating: null,
        slopeRating: null,
        parData: null,
      };
    })
    .filter((course) => {
      // Filter to courses that match the search term
      const nameMatch = course.name.toLowerCase().includes(query);
      const locationMatch = course.location?.toLowerCase().includes(query);
      // Also include nearby results if we have distance
      const isNearby = course.distance !== null && course.distance <= 50;
      return nameMatch || locationMatch || isNearby;
    })
    .sort((a, b) => {
      // Prioritize name matches, then sort by distance
      const aNameMatch = a.name.toLowerCase().includes(query);
      const bNameMatch = b.name.toLowerCase().includes(query);

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 20);
};

/**
 * Format address from OSM tags
 */
const formatAddress = (tags) => {
  const parts = [];

  if (tags['addr:city']) {
    parts.push(tags['addr:city']);
  }
  if (tags['addr:state']) {
    parts.push(tags['addr:state']);
  }

  if (parts.length === 0) {
    // Try alternative location info
    if (tags.city) parts.push(tags.city);
    if (tags.state) parts.push(tags.state);
  }

  return parts.length > 0 ? parts.join(', ') : null;
};

/**
 * Get hole count from OSM tags
 */
const getHoleCount = (tags) => {
  if (tags.holes) {
    const num = parseInt(tags.holes, 10);
    if (!isNaN(num)) return num;
  }
  // Default to 18 for golf courses
  return 18;
};

/**
 * Calculate bounding box from center point and radius in miles
 */
const getBoundingBox = (center, radiusMiles) => {
  // Rough conversion: 1 degree latitude ≈ 69 miles
  const latOffset = radiusMiles / 69;
  // Longitude varies by latitude
  const lonOffset = radiusMiles / (69 * Math.cos((center.latitude * Math.PI) / 180));

  return {
    south: center.latitude - latOffset,
    north: center.latitude + latOffset,
    west: center.longitude - lonOffset,
    east: center.longitude + lonOffset,
  };
};

/**
 * Calculate distance between two points in miles using Haversine formula
 */
export const calculateDistance = (point1, point2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * Escape special regex characters
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generate a simple hash for cache keys
 */
const hashQuery = (query) => {
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    const char = query.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `q_${Math.abs(hash)}`;
};

/**
 * Get cached search results
 */
const getCachedResults = async (query) => {
  try {
    const cache = await getItem(STORAGE_KEYS.COURSE_SEARCH_CACHE);
    if (!cache) return null;

    const key = hashQuery(query);
    const entry = cache[key];

    if (entry && entry.expiresAt > Date.now()) {
      return entry.results;
    }
    return null;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
};

/**
 * Cache search results
 */
const cacheResults = async (query, results) => {
  try {
    const cache = (await getItem(STORAGE_KEYS.COURSE_SEARCH_CACHE)) || {};
    const key = hashQuery(query);

    cache[key] = {
      results,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL,
    };

    // Limit cache size - keep only last 50 queries
    const keys = Object.keys(cache);
    if (keys.length > 50) {
      const sortedKeys = keys.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
      const toDelete = sortedKeys.slice(0, keys.length - 50);
      toDelete.forEach((k) => delete cache[k]);
    }

    await setItem(STORAGE_KEYS.COURSE_SEARCH_CACHE, cache);
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

export default {
  searchCourses,
  calculateDistance,
};
