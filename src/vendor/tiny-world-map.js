/**
 * tiny-world-map 依赖全局 L，在 Leaflet 加载后注册 GridLayer.TinyWorld
 */
import L from 'leaflet'

window.L = L
require('./tiny-world-all-10000.js')

export default L
