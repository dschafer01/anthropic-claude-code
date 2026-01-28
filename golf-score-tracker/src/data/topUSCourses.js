// Curated database of popular US golf courses as fallback when API fails

import { calculateDistance } from '../services/courseSearchService';

export const TOP_US_COURSES = [
  // California
  {
    id: 'curated_pebble_beach',
    name: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    coordinates: { latitude: 36.5683, longitude: -121.9486 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_torrey_pines_south',
    name: 'Torrey Pines Golf Course (South)',
    location: 'La Jolla, CA',
    coordinates: { latitude: 32.8998, longitude: -117.2519 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_torrey_pines_north',
    name: 'Torrey Pines Golf Course (North)',
    location: 'La Jolla, CA',
    coordinates: { latitude: 32.9012, longitude: -117.2508 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_spyglass',
    name: 'Spyglass Hill Golf Course',
    location: 'Pebble Beach, CA',
    coordinates: { latitude: 36.5864, longitude: -121.9561 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_spanish_bay',
    name: 'The Links at Spanish Bay',
    location: 'Pebble Beach, CA',
    coordinates: { latitude: 36.6089, longitude: -121.9481 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_riviera',
    name: 'Riviera Country Club',
    location: 'Pacific Palisades, CA',
    coordinates: { latitude: 34.0478, longitude: -118.5006 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_pasatiempo',
    name: 'Pasatiempo Golf Club',
    location: 'Santa Cruz, CA',
    coordinates: { latitude: 36.9847, longitude: -122.0344 },
    holes: 18,
    source: 'curated',
  },

  // Arizona
  {
    id: 'curated_tpc_scottsdale',
    name: 'TPC Scottsdale (Stadium Course)',
    location: 'Scottsdale, AZ',
    coordinates: { latitude: 33.6419, longitude: -111.9197 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_troon_north',
    name: 'Troon North Golf Club (Monument)',
    location: 'Scottsdale, AZ',
    coordinates: { latitude: 33.7594, longitude: -111.8717 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_grayhawk',
    name: 'Grayhawk Golf Club (Raptor)',
    location: 'Scottsdale, AZ',
    coordinates: { latitude: 33.6822, longitude: -111.8956 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_we_ko_pa',
    name: 'We-Ko-Pa Golf Club (Saguaro)',
    location: 'Fort McDowell, AZ',
    coordinates: { latitude: 33.6475, longitude: -111.6728 },
    holes: 18,
    source: 'curated',
  },

  // Georgia
  {
    id: 'curated_augusta',
    name: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    coordinates: { latitude: 33.5032, longitude: -82.0219 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_east_lake',
    name: 'East Lake Golf Club',
    location: 'Atlanta, GA',
    coordinates: { latitude: 33.7447, longitude: -84.3042 },
    holes: 18,
    source: 'curated',
  },

  // Florida
  {
    id: 'curated_tpc_sawgrass',
    name: 'TPC Sawgrass (Stadium Course)',
    location: 'Ponte Vedra Beach, FL',
    coordinates: { latitude: 30.1975, longitude: -81.3942 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_bay_hill',
    name: 'Bay Hill Club & Lodge',
    location: 'Orlando, FL',
    coordinates: { latitude: 28.4603, longitude: -81.5092 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_streamsong_red',
    name: 'Streamsong Resort (Red)',
    location: 'Streamsong, FL',
    coordinates: { latitude: 27.6336, longitude: -81.5039 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_streamsong_blue',
    name: 'Streamsong Resort (Blue)',
    location: 'Streamsong, FL',
    coordinates: { latitude: 27.6350, longitude: -81.5050 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_doral_blue',
    name: 'Trump National Doral (Blue Monster)',
    location: 'Miami, FL',
    coordinates: { latitude: 25.8119, longitude: -80.3378 },
    holes: 18,
    source: 'curated',
  },

  // South Carolina
  {
    id: 'curated_kiawah_ocean',
    name: 'Kiawah Island (Ocean Course)',
    location: 'Kiawah Island, SC',
    coordinates: { latitude: 32.6081, longitude: -80.0297 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_harbour_town',
    name: 'Harbour Town Golf Links',
    location: 'Hilton Head Island, SC',
    coordinates: { latitude: 32.1361, longitude: -80.8078 },
    holes: 18,
    source: 'curated',
  },

  // North Carolina
  {
    id: 'curated_pinehurst_2',
    name: 'Pinehurst Resort (No. 2)',
    location: 'Pinehurst, NC',
    coordinates: { latitude: 35.1906, longitude: -79.4706 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_pinehurst_4',
    name: 'Pinehurst Resort (No. 4)',
    location: 'Pinehurst, NC',
    coordinates: { latitude: 35.1875, longitude: -79.4650 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_quail_hollow',
    name: 'Quail Hollow Club',
    location: 'Charlotte, NC',
    coordinates: { latitude: 35.0544, longitude: -80.8514 },
    holes: 18,
    source: 'curated',
  },

  // Texas
  {
    id: 'curated_colonial',
    name: 'Colonial Country Club',
    location: 'Fort Worth, TX',
    coordinates: { latitude: 32.7200, longitude: -97.3831 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_tpc_san_antonio',
    name: 'TPC San Antonio (Oaks Course)',
    location: 'San Antonio, TX',
    coordinates: { latitude: 29.5967, longitude: -98.6194 },
    holes: 18,
    source: 'curated',
  },

  // New York / New Jersey
  {
    id: 'curated_bethpage_black',
    name: 'Bethpage State Park (Black Course)',
    location: 'Farmingdale, NY',
    coordinates: { latitude: 40.7478, longitude: -73.4517 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_shinnecock',
    name: 'Shinnecock Hills Golf Club',
    location: 'Southampton, NY',
    coordinates: { latitude: 40.8914, longitude: -72.4467 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_winged_foot',
    name: 'Winged Foot Golf Club (West)',
    location: 'Mamaroneck, NY',
    coordinates: { latitude: 40.9653, longitude: -73.7353 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_baltusrol',
    name: 'Baltusrol Golf Club (Lower)',
    location: 'Springfield, NJ',
    coordinates: { latitude: 40.6906, longitude: -74.3508 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_liberty_national',
    name: 'Liberty National Golf Club',
    location: 'Jersey City, NJ',
    coordinates: { latitude: 40.7019, longitude: -74.0539 },
    holes: 18,
    source: 'curated',
  },

  // Michigan
  {
    id: 'curated_arcadia_bluffs',
    name: 'Arcadia Bluffs Golf Club',
    location: 'Arcadia, MI',
    coordinates: { latitude: 44.4836, longitude: -86.2317 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_forest_dunes',
    name: 'Forest Dunes Golf Club',
    location: 'Roscommon, MI',
    coordinates: { latitude: 44.4289, longitude: -84.6167 },
    holes: 18,
    source: 'curated',
  },

  // Wisconsin
  {
    id: 'curated_whistling_straits',
    name: 'Whistling Straits (Straits Course)',
    location: 'Kohler, WI',
    coordinates: { latitude: 43.8472, longitude: -87.7175 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_blackwolf_run',
    name: 'Blackwolf Run (River Course)',
    location: 'Kohler, WI',
    coordinates: { latitude: 43.7769, longitude: -87.8025 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_erin_hills',
    name: 'Erin Hills',
    location: 'Erin, WI',
    coordinates: { latitude: 43.1872, longitude: -88.3094 },
    holes: 18,
    source: 'curated',
  },

  // Oregon
  {
    id: 'curated_bandon_dunes',
    name: 'Bandon Dunes Golf Resort (Bandon Dunes)',
    location: 'Bandon, OR',
    coordinates: { latitude: 43.1869, longitude: -124.3778 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_pacific_dunes',
    name: 'Bandon Dunes Golf Resort (Pacific Dunes)',
    location: 'Bandon, OR',
    coordinates: { latitude: 43.1889, longitude: -124.3800 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_old_macdonald',
    name: 'Bandon Dunes Golf Resort (Old Macdonald)',
    location: 'Bandon, OR',
    coordinates: { latitude: 43.1875, longitude: -124.3750 },
    holes: 18,
    source: 'curated',
  },

  // Hawaii
  {
    id: 'curated_kapalua_plantation',
    name: 'Kapalua Golf (Plantation Course)',
    location: 'Lahaina, HI',
    coordinates: { latitude: 20.9947, longitude: -156.6539 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_mauna_kea',
    name: 'Mauna Kea Golf Course',
    location: 'Kohala Coast, HI',
    coordinates: { latitude: 20.0042, longitude: -155.8219 },
    holes: 18,
    source: 'curated',
  },

  // Nevada
  {
    id: 'curated_shadow_creek',
    name: 'Shadow Creek Golf Course',
    location: 'North Las Vegas, NV',
    coordinates: { latitude: 36.2639, longitude: -115.1186 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_wolf_creek',
    name: 'Wolf Creek Golf Club',
    location: 'Mesquite, NV',
    coordinates: { latitude: 36.8414, longitude: -114.0681 },
    holes: 18,
    source: 'curated',
  },

  // Colorado
  {
    id: 'curated_cherry_hills',
    name: 'Cherry Hills Country Club',
    location: 'Cherry Hills Village, CO',
    coordinates: { latitude: 39.6147, longitude: -104.9469 },
    holes: 18,
    source: 'curated',
  },

  // Illinois
  {
    id: 'curated_medinah_3',
    name: 'Medinah Country Club (No. 3)',
    location: 'Medinah, IL',
    coordinates: { latitude: 41.9667, longitude: -88.0453 },
    holes: 18,
    source: 'curated',
  },
  {
    id: 'curated_olympia_fields',
    name: 'Olympia Fields Country Club (North)',
    location: 'Olympia Fields, IL',
    coordinates: { latitude: 41.5136, longitude: -87.6853 },
    holes: 18,
    source: 'curated',
  },

  // Oklahoma
  {
    id: 'curated_southern_hills',
    name: 'Southern Hills Country Club',
    location: 'Tulsa, OK',
    coordinates: { latitude: 36.0800, longitude: -95.9564 },
    holes: 18,
    source: 'curated',
  },

  // Kentucky
  {
    id: 'curated_valhalla',
    name: 'Valhalla Golf Club',
    location: 'Louisville, KY',
    coordinates: { latitude: 38.2778, longitude: -85.4947 },
    holes: 18,
    source: 'curated',
  },

  // Massachusetts
  {
    id: 'curated_the_country_club',
    name: 'The Country Club',
    location: 'Brookline, MA',
    coordinates: { latitude: 42.3186, longitude: -71.1433 },
    holes: 18,
    source: 'curated',
  },
];

/**
 * Search the curated database for matching courses
 * @param {string} query - Search term
 * @param {object} userLocation - Optional user location for distance calculation
 * @returns {array} Matching courses with distance added if location available
 */
export const searchCuratedDatabase = (query, userLocation = null) => {
  const q = query.toLowerCase();

  const matches = TOP_US_COURSES.filter((course) => {
    const nameMatch = course.name.toLowerCase().includes(q);
    const locationMatch = course.location.toLowerCase().includes(q);
    return nameMatch || locationMatch;
  });

  // Add distance if user location is available
  const resultsWithDistance = matches.map((course) => ({
    ...course,
    distance:
      userLocation && course.coordinates
        ? calculateDistance(userLocation, course.coordinates)
        : null,
  }));

  // Sort by distance if available, otherwise by name
  return resultsWithDistance.sort((a, b) => {
    if (a.distance !== null && b.distance !== null) {
      return a.distance - b.distance;
    }
    return a.name.localeCompare(b.name);
  });
};

export default {
  TOP_US_COURSES,
  searchCuratedDatabase,
};
