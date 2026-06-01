const EARTH_RADIUS_KM = 6371

function toRad (deg) {
  return (deg * Math.PI) / 180
}

function toDeg (rad) {
  return (rad * 180) / Math.PI
}

/** 两点球面距离（km） */
export function haversineDistanceKm (lng1, lat1, lng2, lat2) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

function destinationPoint (lng, lat, bearingDeg, distanceKm) {
  const brng = toRad(bearingDeg)
  const lat1 = toRad(lat)
  const lng1 = toRad(lng)
  const d = distanceKm / EARTH_RADIUS_KM
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) +
    Math.cos(lat1) * Math.sin(d) * Math.cos(brng),
  )
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2),
  )
  return [toDeg(lng2), toDeg(lat2)]
}

/** 以 center 为圆心、radiusKm 为半径的 Polygon Feature */
export function circlePolygonFeature (lng, lat, radiusKm, steps = 64) {
  const ring = []
  for (let i = 0; i <= steps; i++) {
    ring.push(destinationPoint(lng, lat, (360 * i) / steps, radiusKm))
  }
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  }
}

export function getItemCoords (item) {
  if (!item || typeof item !== 'object') return null
  const lat = Number(item.latitude ?? item.lat)
  const lng = Number(item.longitude ?? item.lng ?? item.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

/** 筛选半径（km）内的数据项 */
export function findItemsWithinRadius (items, lng, lat, radiusKm) {
  return (items || []).filter((item) => {
    const coords = getItemCoords(item)
    if (!coords) return false
    return haversineDistanceKm(lng, lat, coords.lng, coords.lat) <= radiusKm
  })
}
