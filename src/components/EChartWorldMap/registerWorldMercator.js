import echarts from 'echarts/lib/echarts'
import worldGeoJSON from 'echarts/map/json/world.json'
import { MERCATOR_PROJECTION } from './projection'

const MAP_NAME = 'world-mercator'
let registered = false

function transformCoordinate (coord) {
  if (typeof coord[0] === 'number') {
    return MERCATOR_PROJECTION.project(coord)
  }
  return coord.map(transformCoordinate)
}

function transformGeoJSON (geoJSON) {
  const cloned = JSON.parse(JSON.stringify(geoJSON))
  ;(cloned.features || []).forEach((feature) => {
    if (feature.geometry && feature.geometry.coordinates) {
      feature.geometry.coordinates = transformCoordinate(feature.geometry.coordinates)
    }
  })
  return cloned
}

export function ensureWorldMercatorMap () {
  if (registered) return MAP_NAME
  echarts.registerMap(MAP_NAME, transformGeoJSON(worldGeoJSON))
  registered = true
  return MAP_NAME
}
