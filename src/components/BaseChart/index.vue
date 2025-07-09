<template>
  <component :is="chartType" style="height: 100%;" :data="chartData" v-bind="chartConfigC" :loading="loading" :settings="chartSettings" :extend="chartExtend" :events="chartEvents" ref="chart">
    <div class="monitor-list-line-loader d-flex flex-column justify-content-center" v-if="!loading && noData">
      <data-empty :description="emptyContent" />
    </div>
  </component>
</template>

<script>
// 使用前需先引入对应模块
import 'v-charts/lib/style.css' // 使用loading属性前先引入css
import * as R from 'ramda'
import i18n from '@/locales'
import 'echarts/lib/component/toolbox'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/grid'
import 'echarts/lib/component/legend'
import { chartColors } from '@/constants'
import { getPdf } from '@/utils/echart'

export default {
  name: 'BaseChart',
  props: {
    chartData: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.columns) && R.is(Array, val.rows),
    },
    chartSettings: {
      type: Object,
      default: () => ({}),
    },
    chartConfig: {
      type: Object,
      default: () => ({}),
    },
    chartEvents: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    chartType: {
      type: String,
      default: 've-line',
    },
    chartExtend: {
      type: Object,
      default: () => ({}),
    },
    colors: {
      type: Array,
      default: () => chartColors,
    },
    emptyContent: {
      default: i18n.t('common.notData'),
    },
    extraToolbox: {
      type: Object,
    },
    noDataCheck: {
      type: Function,
    },
    domId: {
      type: String,
    },
    ignoreAutuLabelStyle: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      chartRect: {},
    }
  },
  computed: {
    noData () {
      if (this.noDataCheck) {
        return this.noDataCheck()
      }
      if (this.chartData.rows && this.chartData.rows.length) {
        return false
      }
      return true
    },
    chartConfigC () {
      const config = {
        colors: this.colors,
        ...this.chartConfig,
      }
      if (this.extraToolbox) {
        if (!config.toolbox) {
          config.toolbox = {
            show: true,
            feature: {},
            right: 20,
          }
        }
        const { excel, pdf } = this.extraToolbox
        if (pdf) {
          config.toolbox.feature.myPdf = {
            show: true,
            title: this.$t('common.export_pdf'),
            icon: 'path://M1102.485211 622.006857s-55.881143-95.865905-355.620571-20.48c-92.647619-45.641143-186.270476-114.395429-241.566476-216.502857v0.097524c-0.682667-1.26781-1.316571-2.584381 0-0.146286 50.614857-117.077333 79.335619-229.327238 47.299047-296.71619 0 0-68.36419-187.294476-129.365333-16.188953 0 0-48.761905 155.745524 39.740952 323.925334-45.933714 94.354286-118.686476 216.356571-233.862095 371.565714 0 0-64.024381 17.16419-145.554285 64.707047 0 0-163.59619 100.644571-32.329143 145.554286 0 0 81.091048 16.237714 194.072381-145.554286 0 0 143.60381-199.387429 238.640762-400.091428l0.292571 0.243809c41.545143 64.463238 104.935619 129.170286 200.411429 186.270477-92.842667 27.648-205.385143 69.778286-342.308572 132.681142 0 0 226.596571-56.466286 421.790476-90.355809h0.633905c59.343238 27.794286 128.24381 52.906667 208.359619 74.166857 0 0 212.358095 22.625524 129.365333-113.176381zM99.745402 929.304381s-39.253333-7.216762 0-48.518095c0 0 47.201524-39.497143 113.176381-48.518096 0 0-39.643429 92.891429-113.176381 97.036191zM486.476069 344.84419A427.641905 427.641905 0 0 1 455.561021 185.295238s10.435048-230.64381 80.847238-64.707048c0 0 19.894857 62.171429-49.93219 224.256-1.80419 3.803429-0.390095 0.828952 0 0z m535.161904 341.820953s-71.582476-8.874667-163.693714-39.692191l-1.121524-0.487619c134.631619-18.480762 226.937905-16.530286 164.815238 40.17981z',
            onclick: async () => {
              const loading = this.$message.loading(this.$t('common.exporting'), 0)
              try {
                await getPdf({
                  title: pdf.name,
                  target: pdf.target,
                })
              } finally {
                loading()
              }
            },
          }
        }
        if (excel) {
          try {
            config.toolbox.feature.myTool2 = {
              show: true,
              title: this.$t('common.export_excel'),
              icon: 'path://M896 583.59v221.09c0 50.13-39 90.91-86.84 90.91H214.84c-47.84 0-86.84-40.78-86.84-90.91V583.59a32 32 0 0 1 64 0v221.09c0 14.84 10.25 26.91 22.84 26.91h594.32c12.59 0 22.84-12.07 22.84-26.91V583.59a32 32 0 0 1 64 0z m-406.7 77c0.38 0.38 0.77 0.75 1.17 1.12l0.42 0.36 0.72 0.63a0.71 0.71 0 0 1 0.09 0.07l0.6 0.46 0.54 0.42 0.14 0.11 0.66 0.46 0.47 0.33 0.18 0.13 0.67 0.42 0.47 0.29 0.21 0.13c0.21 0.13 0.43 0.24 0.64 0.36l0.51 0.28 0.23 0.13 0.6 0.3 0.59 0.29 0.22 0.11 0.55 0.24 0.68 0.29 0.2 0.09 0.5 0.19 0.78 0.29 0.16 0.06 0.45 0.14 0.89 0.29h0.14l0.41 0.12 1 0.26h0.09l0.41 0.09c0.33 0.07 0.66 0.15 1 0.21h0.1l0.43 0.07 1 0.17h0.09l0.52 0.07 0.93 0.11h0.08l0.74 0.05h4.61l0.73-0.05h0.08l0.93-0.11 0.52-0.07h0.09l1-0.17 0.42-0.07h0.06l1-0.23 0.38-0.08h0.12l1-0.27 0.39-0.11h0.14l0.91-0.29 0.42-0.14 0.17-0.07 0.82-0.3 0.47-0.18 0.2-0.09 0.7-0.3 0.53-0.23 0.22-0.11 0.61-0.3 0.58-0.29 0.22-0.12 0.54-0.3 0.61-0.35 0.22-0.13 0.49-0.31 0.64-0.4 0.19-0.13 0.5-0.35c0.21-0.14 0.42-0.28 0.62-0.43l0.15-0.12 0.56-0.43 0.57-0.44a0.39 0.39 0 0 1 0.1-0.08l0.71-0.61 0.43-0.37c0.4-0.37 0.8-0.74 1.18-1.13l210.93-211a32 32 0 0 0-45.27-45.25L543.93 560.77l-0.09-400.37a32 32 0 0 0-32-32 32 32 0 0 0-32 32l0.09 400.29-156.18-156.33a32 32 0 0 0-45.28 45.23z',
              onclick: () => {
                excel.export()
              },
            }
          } catch (err) {
            console.error(err)
          }
        }
      }
      if (this.domId && !this.ignoreAutuLabelStyle) {
        const { xAxis = [] } = config
        xAxis.map(item => {
          item.axisLabel = item.axisLabel || {}
          const { data = {} } = item
          let labelStr = ''
          let len = 0
          if (R.is(Array, data)) {
            labelStr = Object.values(data).join(',')
            len = data.length
          } else if (R.is(Object, data)) {
            labelStr = Object.values(data).join(',')
            len = Object.values(data).length
          }
          const width = this.pxWidth(labelStr, '12px')
          if (this.chartRect.width && width + len * 16 > this.chartRect.width * 0.6) {
            // 需要倾斜
            item.axisLabel.rotate = 45
            const interval = Math.floor(len * 24 / this.chartRect.width)
            item.axisLabel.interval = interval
          }
          // if (this.chartRect.width && !xAxis.axisLabel.rotate && !xAxis.axisLabel.width) {
          //   // 没有倾斜设置换行
          //   const allWidth = this.chartRect.width * 0.8
          //   const labelWidth = allWidth / len
          //   xAxis.axisLabel.width = labelWidth
          //   xAxis.axisLabel.overflow = 'breakAll'
          // }
        })
      }
      return config
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler () {
        this.$refs.chart.echarts.resize()
        this.getChartSize()
      },
    },
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
  },
}
</script>

<style lang="less" scoped>
.monitor-list-line-loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
