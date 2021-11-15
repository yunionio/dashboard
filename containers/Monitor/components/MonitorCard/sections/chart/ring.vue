<template>
  <div>
    <base-chart
      :id="this.id"
      chartType="ve-ring"
      :chartData="chartData"
      :chartConfig="chartConfig"
      :chartSettings="chartSettings"
      :loading="loading"
      :chartEvents="chartEvents"
      :extraToolbox="extraToolbox" />
    <download-excel v-show="false" ref="excel" :data="chartData.rows" :fields="exportExcelColumns" :name="`export.xls`" />
  </div>
</template>

<script>
import commonChartProps from './common'

export default {
  name: 'OverviewRing',
  props: Object.assign({
    id: {
      type: String,
      default: 'overview-ring',
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    exportExcelColumns: {
      type: Object,
    },
  }, commonChartProps()),
  computed: {
    extraToolbox () {
      const ret = {
        pdf: {
          name: this.title,
          target: `#${this.id}`,
        },
      }
      if (this.exportExcelColumns) {
        ret.excel = {
          export: this.exportExcel,
        }
      }
      return ret
    },
    chartConfig () {
      const config = {
        height: this.chartHeigth,
        width: '100%',
        legend: {
          show: this.showLegend,
          orient: 'vertical',
          left: 'left',
        },
        title: {
          show: this.title && this.title.length > 0,
          text: this.title,
          subtext: this.subtitle,
          left: 'center',
          top: '35%',
          textStyle: {
            color: '#999999',
            fontSize: 16,
            align: 'center',
          },
          subtextStyle: {
            fontSize: 20,
            color: ['#333'],
            align: 'center',
          },
        },
        tooltip: {
          show: true,
          trigger: 'item',
          // position: {
          //   _custom: {
          //     type: 'function',
          //     display: '<span>ƒ</span> position(point, params, dom, rect, size)',
          //   },
          // },
        },
        toolbox: {
          show: true,
          feature: {},
          right: 20,
        },
      }
      return config
    },
    chartSettings () {
      const cs = {
        radius: [75, 100],
        offsetY: '45%',
        labelLine: { length: 10, length2: 10 },
      }
      if (this.chartData && this.chartData.columns && this.chartData.columns.length > 0) {
        cs.dataType = this.yAxisFormat
        cs.limitShowNum = 9
      }
      return Object.assign(cs, this.chartSetting)
    },
  },
  methods: {
    exportExcel () {
      this.$refs.excel.generate()
    },
  },
}
</script>
