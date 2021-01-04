<template>
  <div>
    <div>
      <header v-if="header" class="header clearfix" style="padding: 10px">
        <div class="title-wrapper float-left" v-if="header.title">
          <div class="title">{{ header.title }}</div>
          <div class="subtitle" v-if="header.subtitle">{{ header.subtitle }}</div>
        </div>
      </header>
      <base-chart :chartType="chartType" :chartData="chartData" :chartConfig="chartConfig" :chartSettings="chartSettings" :chartExtend="chartExtend" :loading="loading" :emptyContent="emptyContent" />
    </div>
  </div>
</template>

<script>
// import { completionDate } from '@/utils/utils'
import { transformUnit } from '@/utils/utils'

export default {
  name: 'OverviewLine',
  props: {
    unit: {
      type: Object,
      default: () => ({}),
    },
    header: {
      type: Object,
      default: () => ({}),
    },
    chartData: {
      type: Object,
      required: true,
    },
    isHistogram: { // 默认表示 Y 轴是数据轴，竖向
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: '100%',
    },
    chartSettings: {
      type: Object,
      default: () => ({}),
    },
    splitLineShow: { // 是否显示分隔线。默认数值轴显示，类目轴不显示。
      type: Boolean,
      default: false,
    },
    emptyContent: {},
    showLegend: { // 图例显示
      type: Boolean,
      default: false,
    },
    dateMode: {},
  },
  data () {
    return {
      chartType: this.isHistogram ? 've-histogram' : 've-bar',
    }
  },
  computed: {
    chartExtend () {
      const unit = this.unit.unit
      const commonSerie = {
        barWidth: '12px',
        barMaxWidth: '24px',
        barCategoryGap: '60%',
      }
      if (!this.isHistogram) {
        const unit = this.unit.unit
        commonSerie.label = {
          show: !this.isHistogram,
          normal: {
            position: 'right',
            show: true,
            color: '#939EAB',
            formatter: function (params) {
              if (unit) {
                const val = transformUnit(params.value, unit, 1000, '0')
                return val.text
              } else {
                return params.value
              }
            },
          },
          emphasis: {
            color: '#4DA1FF',
          },
        }
      }
      const ce = {
        series (v) {
          if (v) return v.map(i => ({ ...i, ...commonSerie }))
          return []
        },
        xAxis: {
          boundaryGap: [0, 0.01],
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            show: this.isHistogram,
          },
        },
        yAxis: {
          nameGap: 30,
          splitLine: {
            show: this.splitLineShow,
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter: (value, index) => {
              if (unit) {
                const val = transformUnit(value, unit, 1000, '0')
                return val.text
              } else {
                return value
              }
            },
          },
        },
        toolbox: {
          showTitle: false,
        },
      }
      if (!this.isHistogram) {
        ce.yAxis.axisLabel = {
          formatter (value, index) {
            // value = value.split(':')[1]
            if (value.length > 15) {
              const prefix = value.slice(0, 6)
              const surfix = value.slice(value.length - 6)
              return `${prefix}...${surfix}`
            }
            return value
          },
        }
      }
      return ce
    },
    chartConfig () {
      const unit = this.unit.unit
      const config = {
        // title,
        height: this.height,
        width: '95%',
        legend: {
          show: this.showLegend,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
            shadowStyle: {
              color: 'rgb(77, 161, 255)',
              opacity: 0.1,
            },
          },
          formatter: function (params, ticket, callback) {
            for (const i in params) {
              if (unit) {
                const val = transformUnit(params[i].data, unit, 1000, '0')
                return `${params[i].seriesName}: ${val.text}`
              } else {
                return `${params[i].seriesName}: ${params[i].data}`
              }
            }
          },
        },
        grid: {
          // left: '3%',
          // right: '4%',
          // bottom: '3%',
          // containLabel: true,
        },
      }
      if (this.isHistogram) {
        config.toolbox = {
          show: true,
          feature: {
            magicType: { type: ['line', 'bar'] },
          },
          right: 20,
        }
        config.grid.top = '10px'
      }
      return config
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep {
  .ve-bar {
    max-height: 1400px; // 30条数据的高度，超过30条数据滚动
    overflow: auto;
  }
}
</style>
