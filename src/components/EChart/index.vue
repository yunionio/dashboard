
<template>
  <div class="echarts" :id="domId" :style="chartStyle" />
</template>

<style>
.echarts {
  width: 600px;
  height: 400px;
}
</style>

<script>
import * as R from 'ramda'
import echarts from 'echarts/lib/echarts'
import debounce from 'lodash/debounce'
import { addListener, removeListener } from 'resize-detector'
const INIT_TRIGGERS = ['theme', 'initOptions', 'autoresize']
const REWATCH_TRIGGERS = ['manualUpdate', 'watchShallow']

export default {
  name: 'EChart',
  props: {
    options: Object,
    theme: [String, Object],
    initOptions: Object,
    group: String,
    autoresize: Boolean,
    watchShallow: Boolean,
    manualUpdate: Boolean,
    domId: String,
    ignoreAutoLabelStyle: {
      type: Boolean,
      default: false,
    },
    chartStyle: Object,
  },
  data () {
    return {
      lastArea: 0,
      chartRect: {},
    }
  },
  watch: {
    group (group) {
      this.chart.group = group
    },
  },
  created () {
    this.initOptionsWatcher()
    INIT_TRIGGERS.forEach(prop => {
      this.$watch(
        prop,
        () => {
          this.refresh()
        },
        { deep: true },
      )
    })
    REWATCH_TRIGGERS.forEach(prop => {
      this.$watch(prop, () => {
        this.initOptionsWatcher()
        this.refresh()
      })
    })
  },
  mounted () {
    // auto init if `options` is already provided
    if (this.options) {
      this.getChartSize()
      this.init()
    }
  },
  activated () {
    if (this.autoresize) {
      this.getChartSize()
      this.chart && this.chart.resize()
    }
  },
  destroyed () {
    if (this.chart) {
      this.destroy()
    }
  },
  methods: {
    getChartSize () {
      if (this.domId) {
        const dom = document.getElementById(this.domId)
        if (!dom) return
        const bounc = dom.getBoundingClientRect()
        this.chartRect = bounc
      }
    },
    pxWidth (text, font) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      font && (context.font = font)
      const metrics = context.measureText(text)
      return metrics.width
    },
    // provide an explicit merge option method
    mergeOptions (options, notMerge, lazyUpdate) {
      if (this.manualUpdate) {
        this.manualOptions = options
      }
      if (!this.chart) {
        this.init(options)
      } else {
        this.delegateMethod('setOption', options, notMerge, lazyUpdate)
      }
    },
    // just delegates ECharts methods to Vue component
    // use explicit params to reduce transpiled size for now
    appendData (params) {
      this.delegateMethod('appendData', params)
    },
    resize (options) {
      this.delegateMethod('resize', options)
    },
    dispatchAction (payload) {
      this.delegateMethod('dispatchAction', payload)
    },
    convertToPixel (finder, value) {
      return this.delegateMethod('convertToPixel', finder, value)
    },
    convertFromPixel (finder, value) {
      return this.delegateMethod('convertFromPixel', finder, value)
    },
    containPixel (finder, value) {
      return this.delegateMethod('containPixel', finder, value)
    },
    showLoading (type, options) {
      this.delegateMethod('showLoading', type, options)
    },
    hideLoading () {
      this.delegateMethod('hideLoading')
    },
    getDataURL (options) {
      return this.delegateMethod('getDataURL', options)
    },
    getConnectedDataURL (options) {
      return this.delegateMethod('getConnectedDataURL', options)
    },
    clear () {
      this.delegateMethod('clear')
    },
    dispose () {
      this.delegateMethod('dispose')
    },
    delegateMethod (name, ...args) {
      if (!this.chart) {
        this.init()
      }
      return this.chart[name](...args)
    },
    delegateGet (methodName) {
      if (!this.chart) {
        this.init()
      }
      return this.chart[methodName]()
    },
    getArea () {
      return this.$el.offsetWidth * this.$el.offsetHeight
    },
    formatOptions (options) {
      if (this.domId && !this.ignoreAutoLabelStyle) {
        const { xAxis = {} } = options
        if (R.is(Object, xAxis)) {
          const { axisLabel = {}, data = [] } = xAxis
          xAxis.axisLabel = axisLabel
          const labelStr = data.join(',')
          const len = data.length || 0
          const width = this.pxWidth(labelStr, '12px')
          if (this.chartRect.width && width + len * 16 > this.chartRect.width * 0.6) {
            // 需要倾斜
            xAxis.axisLabel.rotate = 45
            const interval = Math.floor(len * 24 / this.chartRect.width)
            xAxis.axisLabel.interval = interval
          }
          // if (this.chartRect.width && !xAxis.axisLabel.rotate && !xAxis.axisLabel.width) {
          //   console.log('设置换行')
          //   // 没有倾斜设置换行
          //   const allWidth = this.chartRect.width * 0.8
          //   const labelWidth = allWidth / len
          //   console.log('宽度', labelWidth)
          //   xAxis.axisLabel.width = labelWidth
          //   xAxis.axisLabel.overflow = 'breakAll'
          //   xAxis.axisLabel.interval = 0
          // }
        }
      }
      return options
    },
    init (options) {
      if (this.chart) {
        return
      }
      const chart = echarts.init(this.$el, this.theme, this.initOptions)
      if (this.group) {
        chart.group = this.group
      }
      const formatOptions = this.formatOptions(options || this.manualOptions || this.options || {})
      chart.setOption(formatOptions, true)
      Object.keys(this.$listeners).forEach(event => {
        const handler = this.$listeners[event]
        if (event.indexOf('zr:') === 0) {
          chart.getZr().on(event.slice(3), handler)
        } else {
          chart.on(event, handler)
        }
      })
      if (this.autoresize) {
        this.lastArea = this.getArea()
        this.__resizeHandler = debounce(
          () => {
            if (this.lastArea === 0) {
              // emulate initial render for initially hidden charts
              this.mergeOptions({}, true)
              this.resize()
              this.mergeOptions(this.options || this.manualOptions || {}, true)
            } else {
              this.resize()
            }
            this.lastArea = this.getArea()
          },
          100,
          { leading: true },
        )
        addListener(this.$el, this.__resizeHandler)
      }
      Object.defineProperties(this, {
        // Only recalculated when accessed from JavaScript.
        // Won't update DOM on value change because getters
        // don't depend on reactive values
        width: {
          configurable: true,
          get: () => {
            return this.delegateGet('getWidth')
          },
        },
        height: {
          configurable: true,
          get: () => {
            return this.delegateGet('getHeight')
          },
        },
        isDisposed: {
          configurable: true,
          get: () => {
            return !!this.delegateGet('isDisposed')
          },
        },
        computedOptions: {
          configurable: true,
          get: () => {
            return this.delegateGet('getOption')
          },
        },
      })
      this.chart = chart
      this.$emit('chartInstance', this.chart)
    },
    initOptionsWatcher () {
      if (this.__unwatchOptions) {
        this.__unwatchOptions()
        this.__unwatchOptions = null
      }
      if (!this.manualUpdate) {
        this.__unwatchOptions = this.$watch(
          'options',
          (val, oldVal) => {
            if (!this.chart && val) {
              this.init()
            } else {
              // mutating `options` will lead to merging
              // replacing it with new reference will lead to not merging
              // eg.
              // `this.options = Object.assign({}, this.options, { ... })`
              // will trigger `this.chart.setOption(val, true)
              // `this.options.title.text = 'Trends'`
              // will trigger `this.chart.setOption(val, false)`
              const formatOptions = this.formatOptions(val || {})
              this.chart.setOption(formatOptions, val !== oldVal)
            }
            this.$emit('chartInstance', this.chart)
          },
          { deep: !this.watchShallow },
        )
      }
    },
    destroy () {
      if (this.autoresize) {
        removeListener(this.$el, this.__resizeHandler)
      }
      this.dispose()
      this.chart = null
    },
    refresh () {
      if (this.chart) {
        this.destroy()
        this.init()
      }
    },
  },
  connect (group) {
    if (typeof group !== 'string') {
      group = group.map(chart => chart.chart)
    }
    echarts.connect(group)
  },
  disconnect (group) {
    echarts.disConnect(group)
  },
  getMap (mapName) {
    return echarts.getMap(mapName)
  },
  registerMap (mapName, geoJSON, specialAreas) {
    echarts.registerMap(mapName, geoJSON, specialAreas)
  },
  registerTheme (name, theme) {
    echarts.registerTheme(name, theme)
  },
  graphic: echarts.graphic,
}
</script>
