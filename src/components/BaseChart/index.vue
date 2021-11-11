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
  },
  computed: {
    noData () {
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
              const loading = this.$message.loading(this.$t('bill.exporting'), 0)
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
              icon: 'path://M649.813333 424.32H603.733333l-64 85.333333a407.68 407.68 0 0 0-25.386666 36.48 459.093333 459.093333 0 0 0-25.813334-39.466666l-58.24-82.133334h-50.986666l109.226666 153.386667-123.946666 167.253333h50.986666l80.426667-111.786666c3.2-4.48 8.106667-12.373333 15.36-24.106667 4.906667 7.68 9.386667 14.933333 14.08 21.333333l80.64 114.56h52.48l-121.386667-170.666666z',
              onclick: () => {
                excel.export()
              },
            }
          } catch (err) {
            console.error(err)
          }
        }
      }
      return config
    },
  },
  watch: {
    chartData: {
      deep: true,
      handler () {
        this.$refs.chart.echarts.resize()
      },
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
