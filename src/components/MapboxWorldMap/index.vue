<template>
  <div class="mapbox-world-map" :style="rootStyle">
    <div ref="mapEl" class="mapbox-world-map__canvas" />
    <div
      v-if="selectOnClick && diameterPanelVisible"
      ref="diameterPanel"
      class="mapbox-world-map__diameter-panel"
      :style="diameterPanelStyle"
      @mousedown.stop
      @click.stop>
      <div class="mapbox-world-map__popover-title">{{ $t('regionMap.set_selection_diameter') }}</div>
      <div class="mapbox-world-map__popover-row">
        <span class="mapbox-world-map__popover-label">{{ $t('regionMap.diameter') }}</span>
        <a-input-number
          v-model="diameterKm"
          class="mapbox-world-map__popover-input"
          :min="10"
          :max="10000"
          :step="10"
          size="small"
          @change="onDiameterChange" />
        <span class="mapbox-world-map__popover-unit">{{ $t('regionMap.unit_km') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import L from '@/vendor/tiny-world-map'
import 'leaflet/dist/leaflet.css'
import {
  findItemsWithinRadius,
  getItemCoords,
} from './geo'

if (L.GridLayer && L.GridLayer.TinyWorld) {
  L.GridLayer.TinyWorld.prototype.getAttribution = function () { return '' }
}

const DEFAULT_CENTER = [0, 0]
const DEFAULT_POINT_COLOR = '#1890ff'
const BAR_LINK_CLASS = 'mapbox-world-map__bar-link'

/** splitKey 分组点颜色（Ant Design 色板） */
const SPLIT_POINT_COLORS = [
  '#1890ff',
  '#52c41a',
  '#faad14',
  '#f5222d',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
  '#a0d911',
  '#2f54eb',
]

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

function bindLeafletBarLink (link, onClick) {
  link.href = '#'
  link.setAttribute('role', 'button')
  L.DomEvent.disableClickPropagation(link)
  L.DomEvent.on(link, 'click', (e) => {
    L.DomEvent.stop(e)
    onClick(e)
  })
}

function createLeafletBarLink (title, innerHTML, onClick) {
  const link = L.DomUtil.create('a', BAR_LINK_CLASS)
  link.title = title
  link.innerHTML = innerHTML
  bindLeafletBarLink(link, onClick)
  return link
}

function getOrCreateToolbarBar (corner, createIfMissing) {
  if (!corner) return null
  const zoomBar = corner.querySelector('.leaflet-control-zoom.leaflet-bar')
  if (zoomBar) return zoomBar
  if (!createIfMissing) return null
  const bar = L.DomUtil.create('div', 'leaflet-bar leaflet-control mapbox-world-map__toolbar-bar')
  L.DomEvent.disableClickPropagation(bar)
  corner.appendChild(bar)
  return bar
}

function createUserLocationIcon () {
  return L.divIcon({
    className: 'mapbox-world-map__location-marker',
    html: [
      '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">',
      '<path fill="#fa8c16" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>',
      '</svg>',
    ].join(''),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

export default {
  name: 'MapboxWorldMap',
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    selectOnClick: {
      type: Boolean,
      default: true,
    },
    /** 保留兼容，Leaflet 方案不使用外部 style */
    mapStyle: {
      type: [String, Object],
      default: null,
    },
    /** [经度, 纬度] */
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
      default: 1,
    },
    maxZoom: {
      type: Number,
      default: 19,
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
    locateOnLoad: {
      type: Boolean,
      default: true,
    },
    locateZoomDelta: {
      type: Number,
      default: 1.5,
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
  },
  data () {
    return {
      map: null,
      resizeObserver: null,
      pointsLayer: null,
      selectionLayer: null,
      selectionCenter: null,
      diameterKm: 500,
      diameterPanelVisible: false,
      diameterPanelStyle: null,
      userLocationMarker: null,
      geolocateLinkEl: null,
      diameterLinkEl: null,
      zoomControl: null,
      initialZoom: null,
      mapClickHandler: null,
    }
  },
  computed: {
    rootStyle () {
      return { height: this.height }
    },
    selectionRadiusKm () {
      return this.diameterKm / 2
    },
    leafletCenter () {
      const c = this.center
      if (!Array.isArray(c) || c.length < 2) return [0, 0]
      return [c[1], c[0]]
    },
  },
  watch: {
    data: {
      deep: true,
      handler () {
        this.renderPoints()
        this.refreshSelectionNearby()
      },
    },
    center: {
      deep: true,
      handler () {
        if (this.map) {
          this.map.setView(this.leafletCenter, this.map.getZoom())
        }
      },
    },
    zoom (val) {
      if (this.map && typeof val === 'number') {
        this.map.setZoom(val)
      }
    },
    selectOnClick (val) {
      if (val) {
        this.bindMapClick()
        this.$nextTick(() => this.integrateToolbarControls())
      } else {
        this.unbindMapClick()
        this.clearSelectionCircle()
        this.detachToolbarControls()
        this.closeDiameterPanel()
      }
    },
    interactive (val) {
      this.setMapInteractive(val)
    },
    splitKey () {
      this.renderPoints()
    },
  },
  mounted () {
    this.initMap()
  },
  updated () {
    if (this.map && this.selectOnClick && !this.diameterLinkEl) {
      this.integrateToolbarControls()
    }
  },
  beforeDestroy () {
    this.destroyMap()
  },
  methods: {
    getLeafletControlCorner () {
      const mapEl = this.$refs.mapEl
      if (!mapEl) return null
      return mapEl.querySelector('.leaflet-top.leaflet-right')
    },
    getToolbarBar () {
      const corner = this.getLeafletControlCorner()
      const needBar = this.showGeolocate || this.selectOnClick
      return getOrCreateToolbarBar(corner, needBar && !this.showNavigation)
    },
    integrateToolbarControls () {
      const bar = this.getToolbarBar()
      if (!bar) return

      if (this.showGeolocate && !this.geolocateLinkEl) {
        this.geolocateLinkEl = createLeafletBarLink(
          this.$t('regionMap.locate_current'),
          GEOLOCATE_ICON_SVG,
          () => this.tryLocateUser(),
        )
        bar.appendChild(this.geolocateLinkEl)
      }

      if (this.selectOnClick && !this.diameterLinkEl) {
        this.diameterLinkEl = createLeafletBarLink(
          this.$t('regionMap.selection_diameter', [this.diameterKm]),
          DIAMETER_ICON_SVG,
          () => this.toggleDiameterPanel(),
        )
        bar.appendChild(this.diameterLinkEl)
      }
    },
    toggleDiameterPanel () {
      if (this.diameterPanelVisible) {
        this.closeDiameterPanel()
        return
      }
      this.openDiameterPanel()
    },
    openDiameterPanel () {
      const link = this.diameterLinkEl
      if (!link) return
      if (this._diameterOutsideHandler) {
        document.removeEventListener('mousedown', this._diameterOutsideHandler)
        this._diameterOutsideHandler = null
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
            this.diameterLinkEl && !this.diameterLinkEl.contains(e.target)
          ) {
            this.closeDiameterPanel()
          }
        }
        this._diameterOutsideHandler = handler
        setTimeout(() => {
          document.addEventListener('mousedown', handler)
        }, 0)
      })
    },
    closeDiameterPanel () {
      this.diameterPanelVisible = false
      this.diameterPanelStyle = null
      if (this._diameterOutsideHandler) {
        document.removeEventListener('mousedown', this._diameterOutsideHandler)
        this._diameterOutsideHandler = null
      }
    },
    detachToolbarControls () {
      if (this.geolocateLinkEl && this.geolocateLinkEl.parentNode) {
        this.geolocateLinkEl.parentNode.removeChild(this.geolocateLinkEl)
      }
      this.geolocateLinkEl = null

      if (this.diameterLinkEl && this.diameterLinkEl.parentNode) {
        this.diameterLinkEl.parentNode.removeChild(this.diameterLinkEl)
      }
      this.diameterLinkEl = null
      this.closeDiameterPanel()
    },
    hideAttribution () {
      if (!this.map) return
      const ctrl = this.map.attributionControl
      if (ctrl) {
        this.map.removeControl(ctrl)
        this.map.attributionControl = null
      }
      const root = this.$refs.mapEl
      if (!root) return
      root.querySelectorAll('.leaflet-control-attribution').forEach((el) => {
        el.remove()
      })
    },
    onDiameterChange (val) {
      const n = Number(val)
      if (!Number.isFinite(n) || n <= 0) {
        this.diameterKm = 500
      } else {
        this.diameterKm = Math.min(10000, Math.max(10, Math.round(n)))
      }
      if (this.selectionCenter) {
        this.renderSelectionCircle(
          this.selectionCenter.lng,
          this.selectionCenter.lat,
        )
        this.refreshSelectionNearby()
      }
    },
    shouldFitToData () {
      return this.fitToData && (this.data || []).some(item => getItemCoords(item))
    },
    tryLocateUser () {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.onLocateSuccess(pos.coords.longitude, pos.coords.latitude)
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        },
      )
    },
    onLocateSuccess (lng, lat) {
      this.setUserLocationMarker(lng, lat)
      this.flyToLocation(lng, lat)
      this.$emit('locate', { longitude: lng, latitude: lat })
    },
    flyToLocation (lng, lat) {
      if (!this.map) return
      const baseZoom = this.initialZoom != null ? this.initialZoom : this.zoom
      const delta = Number(this.locateZoomDelta)
      const zoomDelta = Number.isFinite(delta) ? delta : 1
      const targetZoom = Math.min(
        this.maxZoom,
        Math.max(this.minZoom, baseZoom + zoomDelta),
      )
      this.map.flyTo([lat, lng], targetZoom, { duration: 0.8 })
    },
    locateUser () {
      this.tryLocateUser()
    },
    setUserLocationMarker (lng, lat) {
      if (!this.map) return
      if (!this.userLocationMarker) {
        this.userLocationMarker = L.marker([lat, lng], {
          icon: createUserLocationIcon(),
          interactive: false,
        })
      } else {
        this.userLocationMarker.setLatLng([lat, lng])
      }
      this.userLocationMarker.addTo(this.map)
    },
    clearUserLocationMarker () {
      if (this.userLocationMarker) {
        this.userLocationMarker.remove()
        this.userLocationMarker = null
      }
    },
    setMapInteractive (enabled) {
      if (!this.map) return
      const method = enabled ? 'enable' : 'disable'
      ;['dragging', 'scrollWheelZoom', 'doubleClickZoom', 'boxZoom', 'keyboard'].forEach((key) => {
        if (this.map[key]) this.map[key][method]()
      })
    },
    initMap () {
      if (!this.$refs.mapEl) return
      this.destroyMap()

      this.initialZoom = this.zoom
      this.map = L.map(this.$refs.mapEl, {
        center: this.leafletCenter,
        zoom: this.zoom,
        minZoom: this.minZoom,
        maxZoom: this.maxZoom,
        zoomControl: false,
        attributionControl: false,
      })

      new L.GridLayer.TinyWorld({ maxZoom: 19, attribution: '' }).addTo(this.map)
      this.hideAttribution()
      this._onLayerAddHideAttribution = () => this.hideAttribution()
      this.map.on('layeradd', this._onLayerAddHideAttribution)

      if (this.showNavigation) {
        this.zoomControl = L.control.zoom({ position: 'topright' })
        this.zoomControl.addTo(this.map)
      }

      this.pointsLayer = L.layerGroup().addTo(this.map)
      this.selectionLayer = L.layerGroup().addTo(this.map)
      this.setMapInteractive(this.interactive)

      this.renderPoints()
      this.bindMapClick()
      if (this.locateOnLoad) {
        this.tryLocateUser()
      }
      this.$emit('load', this.map)
      this.bindResize()
      this.$nextTick(() => {
        this.integrateToolbarControls()
        this.$nextTick(() => this.integrateToolbarControls())
      })
    },
    bindMapClick () {
      if (!this.map || !this.selectOnClick || this.mapClickHandler) return
      this.mapClickHandler = (e) => {
        this.handleMapSelect(e.latlng.lng, e.latlng.lat)
      }
      this.map.on('click', this.mapClickHandler)
    },
    unbindMapClick () {
      if (!this.map || !this.mapClickHandler) return
      this.map.off('click', this.mapClickHandler)
      this.mapClickHandler = null
    },
    handleMapSelect (lng, lat) {
      this.selectionCenter = { lng, lat }
      this.renderSelectionCircle(lng, lat)
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
    clearSelectionCircle () {
      if (this.selectionLayer) {
        this.selectionLayer.clearLayers()
      }
      this.selectionCenter = null
    },
    renderSelectionCircle (lng, lat) {
      if (!this.map || !this.selectionLayer) return
      this.selectionLayer.clearLayers()
      this.selectionCenter = { lng, lat }

      L.circle([lat, lng], {
        radius: this.selectionRadiusKm * 1000,
        color: '#f5222d',
        weight: 2,
        fillColor: '#f5222d',
        fillOpacity: 0.12,
        interactive: false,
      }).addTo(this.selectionLayer)

      L.circleMarker([lat, lng], {
        radius: 3,
        color: '#ffffff',
        weight: 1.5,
        fillColor: '#f5222d',
        fillOpacity: 1,
        interactive: false,
      }).addTo(this.selectionLayer)
    },
    escapeHtml (str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    },
    fitMapToData () {
      if (!this.map || !this.shouldFitToData()) return
      const latlngs = (this.data || [])
        .map(item => getItemCoords(item))
        .filter(Boolean)
        .map(c => [c.lat, c.lng])
      if (!latlngs.length) return
      if (latlngs.length === 1) {
        this.map.flyTo(latlngs[0], Math.max(this.zoom, 4))
        return
      }
      const bounds = L.latLngBounds(latlngs)
      this.map.fitBounds(bounds, {
        padding: [this.fitPadding, this.fitPadding],
        maxZoom: 12,
      })
    },
    getPointFillColor (item, colorMap) {
      if (!this.splitKey) {
        return DEFAULT_POINT_COLOR
      }
      return getSplitColor(getItemFieldByKey(item, this.splitKey), colorMap)
    },
    renderPoints () {
      if (!this.map || !this.pointsLayer) return
      this.pointsLayer.clearLayers()

      const colorMap = new Map()
      ;(this.data || []).forEach((item) => {
        const coords = getItemCoords(item)
        if (!coords) return
        const name = item.name != null ? String(item.name) : ''
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 5,
          color: '#ffffff',
          weight: 1.5,
          fillColor: this.getPointFillColor(item, colorMap),
          fillOpacity: 1,
        })
        if (name) {
          marker.bindTooltip(this.escapeHtml(name), {
            direction: 'top',
            offset: [0, -8],
            className: 'mapbox-world-map-tooltip',
          })
        }
        marker.addTo(this.pointsLayer)
      })

      this.fitMapToData()
    },
    bindResize () {
      if (!this.$refs.mapEl || typeof ResizeObserver === 'undefined') {
        window.addEventListener('resize', this.handleResize)
        return
      }
      this.resizeObserver = new ResizeObserver(() => this.handleResize())
      this.resizeObserver.observe(this.$refs.mapEl)
    },
    unbindResize () {
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
        this.resizeObserver = null
      }
      window.removeEventListener('resize', this.handleResize)
    },
    handleResize () {
      if (this.map) {
        this.map.invalidateSize()
        if (this.diameterPanelVisible) {
          this.openDiameterPanel()
        }
      }
    },
    destroyMap () {
      this.unbindResize()
      this.unbindMapClick()
      if (this.map && this._onLayerAddHideAttribution) {
        this.map.off('layeradd', this._onLayerAddHideAttribution)
        this._onLayerAddHideAttribution = null
      }
      this.detachToolbarControls()
      this.clearUserLocationMarker()
      this.zoomControl = null
      if (this.map) {
        this.map.remove()
        this.map = null
      }
      this.pointsLayer = null
      this.selectionLayer = null
      this.selectionCenter = null
    },
    getMap () {
      return this.map
    },
  },
}
</script>

<style lang="less" scoped>
.mapbox-world-map {
  position: relative;
  z-index: 0;
  isolation: isolate;
  width: 100%;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;

  &__canvas {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  &__diameter-panel {
    position: absolute;
    z-index: 10;
    min-width: 200px;
    padding: 10px 12px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &__popover {
    font-size: 12px;
    line-height: 1.5;
  }

  &__popover-title {
    margin-bottom: 8px;
    color: rgba(0, 0, 0, 0.85);
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
    color: rgba(0, 0, 0, 0.65);
    white-space: nowrap;
  }

  &__popover-unit {
    margin-left: 4px;
    color: rgba(0, 0, 0, 0.45);
  }
}

::v-deep .mapbox-world-map__popover-input.ant-input-number {
  width: 80px;
}

</style>

<style lang="less">
.mapbox-world-map {
  .leaflet-container {
    z-index: 0;
  }

  .leaflet-control-attribution,
  .leaflet-bottom.leaflet-right .leaflet-control-attribution {
    display: none !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .leaflet-bar a.mapbox-world-map__bar-link {
    display: flex !important;
    align-items: center;
    justify-content: center;
    line-height: 1 !important;
    text-align: center;
    cursor: pointer;

    svg {
      display: block;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      pointer-events: none;
    }
  }
}

.leaflet-touch .mapbox-world-map .leaflet-bar a.mapbox-world-map__bar-link svg {
  width: 20px;
  height: 20px;
}

.mapbox-world-map__location-marker {
  width: 32px;
  height: 32px;
  line-height: 0;
  background: transparent;
  border: 0;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35));
  pointer-events: none;

  svg {
    display: block;
  }
}

.leaflet-tooltip.mapbox-world-map-tooltip {
  padding: 4px 8px;
  font-size: 12px;
  line-height: 1.4;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  pointer-events: none;
}
</style>
