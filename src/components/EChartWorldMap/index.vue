<template>
  <div class="echart-world-map" :style="rootStyle">
    <div ref="chartEl" class="echart-world-map__canvas" />
    <div v-if="!overviewStyle && (showNavigation || showGeolocate || selectOnClick)" class="echart-world-map__toolbar">
      <div v-if="showNavigation" class="echart-world-map__toolbar-group leaflet-bar">
        <a
          class="echart-world-map__bar-link"
          href="#"
          role="button"
          @click.prevent="zoomIn">
          <span>+</span>
        </a>
        <a
          class="echart-world-map__bar-link"
          href="#"
          role="button"
          @click.prevent="zoomOut">
          <span>−</span>
        </a>
      </div>
      <div v-if="showGeolocate || (showDiameterControl && selectOnClick)" class="echart-world-map__toolbar-group leaflet-bar">
        <a
          v-if="showGeolocate"
          class="echart-world-map__bar-link"
          href="#"
          role="button"
          :title="$t('regionMap.locate_current')"
          @click.prevent="tryLocateUser"
          v-html="geolocateIconSvg" />
        <a
          v-if="showDiameterControl && selectOnClick"
          ref="diameterLink"
          class="echart-world-map__bar-link"
          href="#"
          role="button"
          :title="$t('regionMap.selection_diameter', [diameterKm])"
          @click.prevent="toggleDiameterPanel"
          v-html="diameterIconSvg" />
      </div>
    </div>
    <div
      v-if="selectOnClick && !overviewStyle"
      class="echart-world-map__diameter-hint">
      {{ $t('regionMap.selection_diameter', [diameterKm]) }}
    </div>
    <div
      v-if="showDiameterControl && selectOnClick && diameterPanelVisible"
      ref="diameterPanel"
      class="echart-world-map__diameter-panel"
      :style="diameterPanelStyle"
      @mousedown.stop
      @click.stop>
      <div class="echart-world-map__popover-title">{{ $t('regionMap.set_selection_diameter') }}</div>
      <div class="echart-world-map__popover-row">
        <span class="echart-world-map__popover-label">{{ $t('regionMap.diameter') }}</span>
        <a-input-number
          v-model="diameterKm"
          class="echart-world-map__popover-input"
          :min="10"
          :max="10000"
          :step="10"
          size="small"
          @change="onDiameterChange" />
        <span class="echart-world-map__popover-unit">{{ $t('regionMap.unit_km') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/component/geo'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/chart/scatter'
import i18n from '@/locales'
import {
  circlePolygonFeature,
  findItemsWithinRadius,
  getItemCoords,
} from './geo'
import { projectLngLat, unprojectPoint } from './projection'
import { ensureWorldMercatorMap } from './registerWorldMercator'
const DEFAULT_CENTER = [0, 0]

/** 对齐 dashboard-overview RegionMap 大屏风格 */
const MAP_THEME = {
  ocean: '#000839',
  bg: '#000839',
  area: '#04284e',
  areaEmphasis: 'rgba(37, 43, 61, 0.5)',
  border: '#5bc1c9',
  label: '#94a2e1',
  tooltipBg: '#ff7f50',
  tooltipText: '#d4d5d6',
  visualMapColors: ['#FFBC42', '#EE7785', '#EC6A5C'],
  legendDot: '#84B1ED',
  selectionFill: 'rgba(91, 193, 201, 0.12)',
  selectionStroke: '#5bc1c9',
}

const DEFAULT_POINT_COLOR = '#1890ff'

/** 标点/定位图标基准尺寸，随地图缩放按阻尼系数微调 */
const MARKER_BASE = {
  point: 7,
  userLocation: 32,
  userLocationOffsetY: -12,
}
const MARKER_SCALE_DAMPING = 0.25
const MARKER_SCALE_MIN = 0.75
const MARKER_SCALE_MAX = 1.35
const LOCATE_DEFAULT_ZOOM = 3
const ZOOM_BUTTON_STEP = 0.8
const WHEEL_ZOOM_FACTORS = [1.12, 1.25, 1.45]

const SPLIT_POINT_COLORS = [
  '#FFBC42',
  '#EE7785',
  '#EC6A5C',
  '#84B1ED',
  '#5bc1c9',
  '#94a2e1',
  '#ffc53d',
  '#ff7875',
  '#36cfc9',
  '#b37feb',
]

const DIAMETER_ICON_SVG = [
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">',
  '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 12h10M10 9l-3 3 3 3M14 9l3 3-3 3"/>',
  '</svg>',
].join('')

const GEOLOCATE_ICON_SVG = [
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">',
  '<circle cx="12" cy="12" r="3" fill="currentColor"/>',
  '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  '</svg>',
].join('')

/** 用户位置自定义 SVG 图标：水滴 + 橙色圆环 + 白色内圆 */
const USER_LOCATION_ICON_SVG = [
  '<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">',
  '<path d="M512 160c160 0 288 118.4 288 265.6v9.6c-3.2 86.4-57.6 185.6-144 288-41.6 48-86.4 92.8-134.4 131.2l-9.6 9.6-9.6-9.6-12.8-9.6c-44.8-38.4-83.2-80-121.6-121.6-86.4-99.2-137.6-198.4-144-288v-9.6c0-144 124.8-262.4 281.6-265.6h6.4z" fill="#FC9637"/>',
  '<path d="M512 288c-80 0-144 60.8-144 137.6s64 137.6 144 137.6 144-60.8 144-137.6S592 288 512 288z" fill="#FC9637"/>',
  '<circle cx="512" cy="432" r="77" fill="#FFFFFF"/>',
  '</svg>',
].join('')

const USER_LOCATION_SYMBOL = 'image://data:image/svg+xml;charset=utf-8,' + encodeURIComponent(USER_LOCATION_ICON_SVG)

function getItemFieldByKey (item, key) {
  if (!item || !key) return undefined
  if (Object.prototype.hasOwnProperty.call(item, key)) {
    return item[key]
  }
  return key.split('.').reduce((obj, k) => (obj != null ? obj[k] : undefined), item)
}

function getSplitColor (value, colorMap) {
  const mapKey = value == null || value === '' ? '__default__' : String(value)
  if (!colorMap.has(mapKey)) {
    const idx = colorMap.size % SPLIT_POINT_COLORS.length
    colorMap.set(mapKey, SPLIT_POINT_COLORS[idx])
  }
  return colorMap.get(mapKey)
}

function buildClusterSymbolSvg (colors) {
  const list = (colors || []).filter(Boolean)
  if (list.length <= 1) return null
  const count = list.length
  const r = 8
  const cx = 10
  const cy = 10
  let paths = ''
  for (let i = 0; i < count; i++) {
    const startAngle = (2 * Math.PI * i) / count - Math.PI / 2
    const endAngle = (2 * Math.PI * (i + 1)) / count - Math.PI / 2
    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = count > 2 ? 0 : 1
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${list[i]}"/>`
  }
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">',
    paths,
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    '</svg>',
  ].join('')
  return 'image://data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

function getCoordGroupKey (lng, lat) {
  return `${Number(lng).toFixed(6)},${Number(lat).toFixed(6)}`
}

export default {
  name: 'EChartWorldMap',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    selectOnClick: {
      type: Boolean,
      default: true,
    },
    mapStyle: {
      type: [String, Object],
      default: null,
    },
    center: {
      type: Array,
      default: () => DEFAULT_CENTER.slice(),
    },
    zoom: {
      type: Number,
      default: 2,
    },
    minZoom: {
      type: Number,
      default: 0.8,
    },
    maxZoom: {
      type: Number,
      default: 16,
    },
    height: {
      type: String,
      default: '480px',
    },
    showNavigation: {
      type: Boolean,
      default: true,
    },
    showGeolocate: {
      type: Boolean,
      default: true,
    },
    showDiameterControl: {
      type: Boolean,
      default: false,
    },
    locateOnLoad: {
      type: Boolean,
      default: true,
    },
    locateZoomDelta: {
      type: Number,
      default: 0.8,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
    fitToData: {
      type: Boolean,
      default: true,
    },
    fitPadding: {
      type: Number,
      default: 48,
    },
    splitKey: {
      type: String,
    },
    layoutCenter: {
      type: Array,
      default: () => ['50%', '50%'],
    },
    layoutSize: {
      type: String,
      default: '100%',
    },
    /** 经纬度视觉比例，默认 1 避免北纬区域被压扁（ECharts 内置 0.75 会压缩纬度） */
    aspectScale: {
      type: Number,
      default: 1,
    },
    showTitle: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    /** 对齐 dashboard-overview RegionMap 静态大屏样式 */
    overviewStyle: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      chart: null,
      resizeObserver: null,
      geoCenter: DEFAULT_CENTER.slice(),
      geoZoom: 2,
      initialZoom: null,
      selectionCenter: null,
      userLocation: null,
      diameterKm: 400,
      diameterPanelVisible: false,
      diameterPanelStyle: null,
      diameterIconSvg: DIAMETER_ICON_SVG,
      geolocateIconSvg: GEOLOCATE_ICON_SVG,
      zrClickHandler: null,
      georoamHandler: null,
      domWheelHandler: null,
      useLayoutPosition: true,
      mapName: 'world',
      hasGeoRoam: false,
    }
  },
  computed: {
    rootStyle () {
      return { height: this.height }
    },
    selectionRadiusKm () {
      return this.diameterKm / 2
    },
  },
  watch: {
    data: {
      deep: true,
      handler () {
        this.renderChart()
      },
    },
    center: {
      deep: true,
      handler (val) {
        if (Array.isArray(val) && val.length >= 2) {
          this.geoCenter = [Number(val[0]), Number(val[1])]
          this.renderChart(false)
        }
      },
    },
    zoom (val) {
      if (typeof val === 'number') {
        this.geoZoom = val
        this.renderChart(false)
      }
    },
    interactive () {
      this.renderChart(false)
    },
    splitKey () {
      this.renderChart()
    },
    selectOnClick (val) {
      if (!val) {
        this.clearSelection()
        this.closeDiameterPanel()
      }
      this.renderChart()
    },
  },
  mounted () {
    this.initialZoom = this.zoom
    this.geoZoom = this.zoom
    if (Array.isArray(this.center) && this.center.length >= 2) {
      this.geoCenter = [Number(this.center[0]), Number(this.center[1])]
    }
    this.initChart()
  },
  beforeDestroy () {
    this.destroyChart()
  },
  methods: {
    initChart () {
      if (!this.$refs.chartEl) return
      this.destroyChart()
      this.mapName = ensureWorldMercatorMap()
      this.chart = echarts.init(this.$refs.chartEl)
      this.bindChartEvents()
      this.renderChart(true)
      if (this.locateOnLoad) {
        this.tryLocateUser(true)
      }
      this.bindResize()
      this.$emit('load', this.chart)
    },
    bindChartEvents () {
      if (!this.chart) return
      const zr = this.chart.getZr()
      this.zrClickHandler = (e) => {
        if (!this.selectOnClick || !this.interactive) return
        const pointInPixel = [e.offsetX, e.offsetY]
        if (!this.chart.containPixel({ geoIndex: 0 }, pointInPixel)) return
        const coord = this.chart.convertFromPixel({ geoIndex: 0 }, pointInPixel)
        if (!coord || coord.length < 2) return
        const [lng, lat] = unprojectPoint(coord)
        this.handleMapSelect(lng, lat)
      }
      zr.on('click', this.zrClickHandler)

      this.domWheelHandler = (event) => {
        if (!this.interactive || !this.chart) return
        const el = this.$refs.chartEl
        if (!el) return
        const rect = el.getBoundingClientRect()
        const offsetX = event.clientX - rect.left
        const offsetY = event.clientY - rect.top
        if (
          offsetX < 0 || offsetY < 0 ||
          offsetX > rect.width || offsetY > rect.height
        ) return
        event.preventDefault()
        const delta = event.deltaY
        if (!delta) return
        const zr = this.chart.getZr()
        const originX = offsetX * (zr.getWidth() / rect.width)
        const originY = offsetY * (zr.getHeight() / rect.height)
        const absDelta = Math.abs(delta)
        const factor = absDelta > 50
          ? WHEEL_ZOOM_FACTORS[2]
          : absDelta > 10
            ? WHEEL_ZOOM_FACTORS[1]
            : WHEEL_ZOOM_FACTORS[0]
        const scale = delta < 0 ? factor : 1 / factor
        this.handleGeoZoomAt(originX, originY, scale)
      }
      this.$refs.chartEl.addEventListener('wheel', this.domWheelHandler, { passive: false })

      this.georoamHandler = () => {
        this.hasGeoRoam = true
        const prevZoom = this.geoZoom
        this.syncGeoStateFromChart()
        this.syncMapGroupFromGeo()
        if (this.geoZoom !== prevZoom) {
          this.updateOverlaySizes()
        }
        if (this.diameterPanelVisible) {
          this.openDiameterPanel()
        }
      }
      this.chart.on('georoam', this.georoamHandler)
    },
    unbindChartEvents () {
      if (!this.chart) return
      if (this.zrClickHandler) {
        this.chart.getZr().off('click', this.zrClickHandler)
        this.zrClickHandler = null
      }
      if (this.domWheelHandler && this.$refs.chartEl) {
        this.$refs.chartEl.removeEventListener('wheel', this.domWheelHandler)
        this.domWheelHandler = null
      }
      if (this.georoamHandler) {
        this.chart.off('georoam', this.georoamHandler)
        this.georoamHandler = null
      }
    },
    getPointFillColor (item, colorMap) {
      if (!this.splitKey) return DEFAULT_POINT_COLOR
      return getSplitColor(getItemFieldByKey(item, this.splitKey), colorMap)
    },
    getClusterSegmentColors (items, colorMap) {
      const colors = items.map(item => this.getPointFillColor(item, colorMap))
      if (items.length > 1 && new Set(colors).size === 1) {
        return items.map((item, idx) => {
          if (this.splitKey) {
            return getSplitColor(`${getItemFieldByKey(item, this.splitKey)}_${idx}`, colorMap)
          }
          return SPLIT_POINT_COLORS[idx % SPLIT_POINT_COLORS.length]
        })
      }
      return colors
    },
    formatSplitFieldValue (value) {
      if (value == null || value === '') return value
      if (this.splitKey === 'provider') {
        const key = String(value).toLowerCase()
        let showName = i18n.getI18n([
          `scopeCloudProvidersMap.${key}`,
          `scopeProviders.${key}`,
          `license.provider.${key}`,
          `cloudPrvidersMap.${value}`,
        ], value)
        if (showName === 'OneCloud') {
          showName = i18n.t('brand')
        }
        return showName
      }
      return value
    },
    formatPointTooltip (item) {
      if (!item) return ''
      const name = item.name != null ? String(item.name) : (item.id != null ? String(item.id) : '')
      if (!this.splitKey) return name
      const extra = this.formatSplitFieldValue(getItemFieldByKey(item, this.splitKey))
      if (extra == null || extra === '') return name
      return `${name} (${extra})`
    },
    formatScatterTooltip (data) {
      if (!data) return ''
      const items = data.items || (data._raw ? [data._raw] : [])
      if (!items.length) {
        return data.name || ''
      }
      return items.map(item => this.formatPointTooltip(item)).filter(Boolean).join('<br/>')
    },
    getMarkerSymbolScale () {
      const base = this.initialZoom != null ? this.initialZoom : this.zoom
      const current = typeof this.geoZoom === 'number' ? this.geoZoom : base
      const ratio = current / (base || 1)
      const damped = 1 + (ratio - 1) * MARKER_SCALE_DAMPING
      return Math.max(MARKER_SCALE_MIN, Math.min(MARKER_SCALE_MAX, damped))
    },
    getScaledMarkerSize (baseSize) {
      return Math.max(6, Math.round(baseSize * this.getMarkerSymbolScale()))
    },
    getUserLocationSymbolOffset () {
      const scale = this.getMarkerSymbolScale()
      return [0, Math.round(MARKER_BASE.userLocationOffsetY * scale)]
    },
    updateOverlaySizes () {
      if (!this.chart) return
      const opt = this.chart.getOption()
      const seriesList = opt.series || []
      if (!seriesList.length) return
      const patchSeries = seriesList.map((s) => {
        if (s.name === 'points') {
          return { symbolSize: this.getScaledMarkerSize(MARKER_BASE.point) }
        }
        if (s.name === '__user_location__') {
          return {
            symbolSize: this.getScaledMarkerSize(MARKER_BASE.userLocation),
            symbolOffset: this.getUserLocationSymbolOffset(),
          }
        }
        if (s.name === '__selection_area__') {
          return { symbolSize: this.getSelectionSymbolSizePx() }
        }
        return {}
      })
      this.chart.setOption({ series: patchSeries }, false)
    },
    getSelectionSymbolSizePx () {
      if (!this.chart || !this.selectionCenter) return 0
      const { lng, lat } = this.selectionCenter
      const center = projectLngLat(lng, lat)
      const ring = circlePolygonFeature(lng, lat, this.selectionRadiusKm).geometry.coordinates[0]
      const edge = ring[Math.floor(ring.length / 4)]
      if (!edge) return 0
      const edgeCoord = projectLngLat(edge[0], edge[1])
      try {
        const centerPx = this.chart.convertToPixel({ geoIndex: 0 }, center)
        const edgePx = this.chart.convertToPixel({ geoIndex: 0 }, edgeCoord)
        if (!centerPx || !edgePx) return 0
        return Math.max(0, Math.abs(edgePx[0] - centerPx[0]) * 2)
      } catch (e) {
        return 0
      }
    },
    handleGeoZoomAt (originX, originY, scale) {
      if (!this.chart) return
      this.chart.dispatchAction({
        type: 'geoRoam',
        componentType: 'geo',
        geoIndex: 0,
        zoom: scale,
        originX,
        originY,
      })
      this.syncMapGroupFromGeo()
      this.hasGeoRoam = true
      this.syncGeoStateFromChart()
      this.updateOverlaySizes()
    },
    syncMapGroupFromGeo () {
      if (!this.chart) return
      const geoModel = this.chart.getModel().getComponent('geo', 0)
      if (!geoModel) return
      const geoView = this.chart.getViewOfComponentModel(geoModel)
      const mapDraw = geoView && geoView._mapDraw
      if (!mapDraw || !mapDraw.group) return
      const geo = geoModel.coordinateSystem
      const roamTransform = geo.getTransformInfo().roamTransform
      mapDraw.group.transform = roamTransform.slice()
      mapDraw.group.decomposeTransform()
      mapDraw.group.dirty()
      const host = mapDraw._controllerHost
      if (host) {
        host.zoom = geo.getZoom()
      }
    },
    buildScatterData () {
      const colorMap = new Map()
      const groups = new Map()
      ;(this.data || []).forEach((item) => {
        const coords = getItemCoords(item)
        if (!coords) return
        const key = getCoordGroupKey(coords.lng, coords.lat)
        if (!groups.has(key)) {
          groups.set(key, { lng: coords.lng, lat: coords.lat, items: [] })
        }
        groups.get(key).items.push(item)
      })
      return [...groups.values()].map((group) => {
        const { lng, lat, items } = group
        const isCluster = items.length > 1
        const segmentColors = this.getClusterSegmentColors(items, colorMap)
        const point = {
          name: items.map(item => item.name).filter(name => name != null && name !== '').join('\n'),
          value: projectLngLat(lng, lat),
          items,
          _raw: items.length === 1 ? items[0] : null,
        }
        if (isCluster) {
          const clusterSymbol = buildClusterSymbolSvg(segmentColors)
          point.symbol = clusterSymbol || 'circle'
          point.symbolSize = this.getScaledMarkerSize(MARKER_BASE.point + 2)
          if (!clusterSymbol) {
            point.itemStyle = {
              color: segmentColors[0],
              borderColor: '#fff',
              borderWidth: 1.5,
            }
          }
        } else {
          point.itemStyle = {
            color: segmentColors[0],
            borderColor: '#fff',
            borderWidth: 1.5,
          }
        }
        return point
      })
    },
    buildSelectionSeries () {
      if (!this.selectionCenter) return []
      const { lng, lat } = this.selectionCenter
      const projectedCenter = projectLngLat(lng, lat)
      return [
        {
          name: '__selection_area__',
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 4,
          silent: true,
          symbol: 'circle',
          symbolSize: this.getSelectionSymbolSizePx(),
          itemStyle: {
            color: MAP_THEME.selectionFill,
            borderColor: MAP_THEME.selectionStroke,
            borderWidth: 2,
          },
          data: [{
            value: projectedCenter,
          }],
        },
        {
          name: '__selection_center__',
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 5,
          silent: true,
          symbolSize: 6,
          itemStyle: {
            color: '#f5222d',
            borderColor: '#fff',
            borderWidth: 1.5,
          },
          data: [{
            value: projectedCenter,
          }],
        },
      ]
    },
    buildUserLocationSeries () {
      if (!this.userLocation) return []
      const { lng, lat } = this.userLocation
      return [{
        name: '__user_location__',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 4,
        silent: true,
        symbol: USER_LOCATION_SYMBOL,
        symbolSize: this.getScaledMarkerSize(MARKER_BASE.userLocation),
        symbolOffset: this.getUserLocationSymbolOffset(),
        itemStyle: {
          opacity: 1,
        },
        data: [{
          value: projectLngLat(lng, lat),
        }],
      }]
    },
    buildGeoOption () {
      const geo = {
        map: this.mapName,
        roam: this.interactive ? 'move' : false,
        aspectScale: 1,
        label: {
          emphasis: { show: false },
        },
        scaleLimit: {
          min: this.minZoom,
          max: this.maxZoom,
        },
        itemStyle: {
          normal: {
            color: MAP_THEME.area,
            areaColor: MAP_THEME.area,
            borderColor: MAP_THEME.border,
            borderWidth: 1,
          },
          emphasis: {
            color: MAP_THEME.areaEmphasis,
            areaColor: MAP_THEME.areaEmphasis,
          },
        },
      }
      if (this.useLayoutPosition) {
        geo.layoutCenter = this.layoutCenter
        geo.layoutSize = this.layoutSize
      }
      geo.zoom = this.geoZoom
      if (this.hasGeoRoam || !this.useLayoutPosition) {
        geo.center = projectLngLat(this.geoCenter[0], this.geoCenter[1])
      }
      return geo
    },
    buildChartOption () {
      const scatterData = this.buildScatterData()
      const option = {
        backgroundColor: MAP_THEME.bg,
        grid: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        tooltip: {
          trigger: 'item',
          confine: true,
          backgroundColor: MAP_THEME.tooltipBg,
          textStyle: {
            color: MAP_THEME.tooltipText,
          },
          formatter: (params) => {
            if (!params || params.seriesName !== 'points') return ''
            return this.formatScatterTooltip(params.data)
          },
        },
        geo: this.buildGeoOption(),
        series: [
          {
            name: 'points',
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 5,
            symbolSize: this.getScaledMarkerSize(MARKER_BASE.point),
            label: {
              show: false,
            },
            emphasis: {
              label: { show: false },
            },
            data: scatterData,
          },
          ...this.buildSelectionSeries(),
          ...this.buildUserLocationSeries(),
        ],
      }
      if (this.showTitle) {
        option.title = {
          text: this.title,
          left: 'center',
          textStyle: {
            color: MAP_THEME.label,
          },
        }
      }
      return option
    },
    renderChart (shouldFit = false) {
      if (!this.chart) return
      if (this.hasGeoRoam) {
        this.syncGeoStateFromChart()
      }
      this.chart.setOption(this.buildChartOption(), true)
      if (this.hasGeoRoam) {
        this.syncMapGroupFromGeo()
      }
      if (shouldFit && this.shouldFitToData()) {
        this.fitMapToData()
      }
    },
    shouldFitToData () {
      return this.fitToData && (this.data || []).some(item => getItemCoords(item))
    },
    fitMapToData () {
      const coords = (this.data || []).map(item => getItemCoords(item)).filter(Boolean)
      if (!coords.length) return
      if (coords.length === 1) {
        const c = coords[0]
        this.setGeoView(c.lng, c.lat, Math.max(this.zoom, 3))
        return
      }
      let minLng = Infinity
      let maxLng = -Infinity
      let minLat = Infinity
      let maxLat = -Infinity
      coords.forEach((c) => {
        minLng = Math.min(minLng, c.lng)
        maxLng = Math.max(maxLng, c.lng)
        minLat = Math.min(minLat, c.lat)
        maxLat = Math.max(maxLat, c.lat)
      })
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2
      const span = Math.max(maxLng - minLng, maxLat - minLat, 1)
      const zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, Math.log2(360 / span) - 0.8),
      )
      this.setGeoView(centerLng, centerLat, zoom)
    },
    setGeoView (lng, lat, zoom) {
      this.useLayoutPosition = false
      this.hasGeoRoam = true
      this.geoCenter = [lng, lat]
      this.geoZoom = zoom
      if (!this.chart) return
      this.chart.setOption({
        geo: {
          layoutCenter: null,
          layoutSize: null,
          aspectScale: 1,
          center: projectLngLat(lng, lat),
          zoom: this.geoZoom,
        },
      })
      this.updateOverlaySizes()
    },
    zoomIn () {
      this.syncGeoStateFromChart()
      this.setGeoView(this.geoCenter[0], this.geoCenter[1], Math.min(this.maxZoom, this.geoZoom + ZOOM_BUTTON_STEP))
      this.syncMapGroupFromGeo()
    },
    zoomOut () {
      this.syncGeoStateFromChart()
      this.setGeoView(this.geoCenter[0], this.geoCenter[1], Math.max(this.minZoom, this.geoZoom - ZOOM_BUTTON_STEP))
      this.syncMapGroupFromGeo()
    },
    syncGeoStateFromChart () {
      if (!this.chart) return
      const geoModel = this.chart.getModel().getComponent('geo', 0)
      if (!geoModel) return
      const geo = geoModel.coordinateSystem
      const center = geo.getCenter()
      if (Array.isArray(center) && center.length >= 2) {
        this.geoCenter = unprojectPoint(center)
      }
      const zoom = geo.getZoom()
      if (typeof zoom === 'number' && Number.isFinite(zoom)) {
        this.geoZoom = zoom
      }
    },
    toggleDiameterPanel () {
      if (this.diameterPanelVisible) {
        this.closeDiameterPanel()
      } else {
        this.openDiameterPanel()
      }
    },
    openDiameterPanel () {
      const link = this.$refs.diameterLink
      if (!link) return
      if (this.diameterOutsideHandler) {
        document.removeEventListener('mousedown', this.diameterOutsideHandler)
        this.diameterOutsideHandler = null
      }
      const linkRect = link.getBoundingClientRect()
      const rootRect = this.$el.getBoundingClientRect()
      this.diameterPanelStyle = {
        top: `${linkRect.top - rootRect.top}px`,
        left: `${linkRect.left - rootRect.left}px`,
        transform: 'translateX(calc(-100% - 8px))',
      }
      this.diameterPanelVisible = true
      this.$nextTick(() => {
        const handler = (e) => {
          const panel = this.$refs.diameterPanel
          if (
            panel && !panel.contains(e.target) &&
            link && !link.contains(e.target)
          ) {
            this.closeDiameterPanel()
          }
        }
        this.diameterOutsideHandler = handler
        setTimeout(() => {
          document.addEventListener('mousedown', handler)
        }, 0)
      })
    },
    closeDiameterPanel () {
      this.diameterPanelVisible = false
      this.diameterPanelStyle = null
      if (this.diameterOutsideHandler) {
        document.removeEventListener('mousedown', this.diameterOutsideHandler)
        this.diameterOutsideHandler = null
      }
    },
    onDiameterChange (val) {
      const n = Number(val)
      if (!Number.isFinite(n) || n <= 0) {
        this.diameterKm = 400
      } else {
        this.diameterKm = Math.min(10000, Math.max(10, Math.round(n)))
      }
      if (this.selectionCenter) {
        this.renderChart(false)
        this.refreshSelectionNearby()
      }
    },
    tryLocateUser (isInitial = false) {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.onLocateSuccess(pos.coords.longitude, pos.coords.latitude, isInitial)
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    },
    onLocateSuccess (lng, lat, isInitial = false) {
      this.userLocation = { lng, lat }
      const baseZoom = this.initialZoom != null ? this.initialZoom : this.zoom
      let targetZoom = baseZoom
      if (isInitial) {
        targetZoom = Math.min(
          this.maxZoom,
          Math.max(this.minZoom, LOCATE_DEFAULT_ZOOM),
        )
      } else {
        const delta = Number(this.locateZoomDelta)
        const zoomDelta = Number.isFinite(delta) ? delta : 0.8
        targetZoom = Math.min(
          this.maxZoom,
          Math.max(this.minZoom, baseZoom + zoomDelta),
        )
      }
      this.setGeoView(lng, lat, targetZoom)
      this.renderChart(false)
      this.$emit('locate', { longitude: lng, latitude: lat })
    },
    locateUser () {
      this.tryLocateUser()
    },
    handleMapSelect (lng, lat) {
      this.selectionCenter = { lng, lat }
      this.renderChart(false)
      this.$emit('select', this.buildSelectPayload(lng, lat))
    },
    buildSelectPayload (lng, lat) {
      const nearbyRegions = findItemsWithinRadius(
        this.data,
        lng,
        lat,
        this.selectionRadiusKm,
      )
      return {
        longitude: lng,
        latitude: lat,
        diameterKm: this.diameterKm,
        nearbyRegions,
      }
    },
    refreshSelectionNearby () {
      if (!this.selectionCenter) return
      const { lng, lat } = this.selectionCenter
      this.$emit('select', this.buildSelectPayload(lng, lat))
    },
    clearSelection () {
      this.selectionCenter = null
      this.renderChart(false)
    },
    bindResize () {
      if (!this.$refs.chartEl || typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', this.handleResize)
        return
      }
      this.resizeObserver = new ResizeObserver(() => this.handleResize())
      this.resizeObserver.observe(this.$refs.chartEl)
    },
    unbindResize () {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      window.removeEventListener('resize', this.handleResize)
    },
    handleResize () {
      if (this.chart) {
        this.chart.resize()
        if (this.diameterPanelVisible) {
          this.openDiameterPanel()
        }
      }
    },
    destroyChart () {
      this.unbindResize()
      this.unbindChartEvents()
      this.closeDiameterPanel()
      if (this.chart) {
        this.chart.dispose()
        this.chart = null
      }
      this.selectionCenter = null
      this.userLocation = null
      this.hasGeoRoam = false
    },
    getMap () {
      return this.chart
    },
  },
}
</script>

<style lang="less" scoped>
.echart-world-map {
  position: relative;
  z-index: 0;
  isolation: isolate;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background: #000839;

  &__canvas {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &__toolbar {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  &__toolbar-group {
    pointer-events: auto;
    box-shadow: rgba(62, 164, 255, 0.43) 0 0 16px inset;
    border: 1px solid rgba(91, 193, 201, 0.45);
    border-radius: 4px;
    overflow: hidden;
  }

  &__bar-link {
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #94a2e1;
    background: rgba(4, 40, 78, 0.88);
    border-bottom: 1px solid rgba(91, 193, 201, 0.35);
    line-height: 1 !important;
    text-decoration: none;
    cursor: pointer;

    &:last-child {
      border-bottom: 0;
    }

    &:hover {
      color: #d4d5d6;
      background: rgba(37, 43, 61, 0.85);
    }

    span {
      font-size: 18px;
      line-height: 1;
      pointer-events: none;
    }

    ::v-deep svg {
      display: block;
      width: 18px;
      height: 18px;
      pointer-events: none;
    }
  }

  &__diameter-panel {
    position: absolute;
    z-index: 10;
    min-width: 200px;
    padding: 10px 12px;
    background: rgba(4, 40, 78, 0.92);
    border: 1px solid rgba(91, 193, 201, 0.45);
    border-radius: 4px;
    box-shadow: rgba(62, 164, 255, 0.43) 0 0 20px inset;
  }

  &__diameter-hint {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 5;
    padding: 1px 8px;
    font-size: 12px;
    line-height: 18px;
    color: #94a2e1;
    background: rgba(4, 40, 78, 0.5);
    border-radius: 4px;
    pointer-events: none;
  }

  &__popover-title {
    margin-bottom: 8px;
    color: #94a2e1;
    font-weight: 500;
    white-space: nowrap;
  }

  &__popover-row {
    display: flex;
    align-items: center;
    line-height: 24px;
  }

  &__popover-label {
    margin-right: 6px;
    color: #d4d5d6;
    white-space: nowrap;
  }

  &__popover-unit {
    margin-left: 4px;
    color: #94a2e1;
  }
}

::v-deep .echart-world-map__popover-input.ant-input-number {
  width: 80px;
}
</style>

<style lang="less">
.echart-world-map .leaflet-bar {
  border: 0;
  background: transparent;
}
</style>
