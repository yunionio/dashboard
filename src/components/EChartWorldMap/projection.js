/** 墨卡托投影：ECharts 4 无 geo.projection，散点/中心/选区需手动 project */
export const MERCATOR_PROJECTION = {
  project (point) {
    const lon = point[0] / 180 * Math.PI
    const lat = point[1] / 180 * Math.PI
    const x = lon
    const y = Math.log(Math.tan(Math.PI / 4 + lat / 2))
    return [x, y]
  },
  unproject (point) {
    const x = point[0]
    const y = point[1]
    const lon = x / Math.PI * 180
    const lat = (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / Math.PI * 180
    return [lon, lat]
  },
}

export function projectLngLat (lng, lat) {
  return MERCATOR_PROJECTION.project([lng, lat])
}

export function unprojectPoint (point) {
  return MERCATOR_PROJECTION.unproject(point)
}
