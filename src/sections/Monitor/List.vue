<template>
  <div class="monitor-list d-flex flex-wrap">
    <div v-if="loading && !listData.length" class="pt-2" style="width:100%;text-align:center">
      <a-spin />
    </div>
    <a-card v-for="item in listData" :key="item.title+item.constants ? item.constants.fromItem : ''" style="width: 700px;" class="position-relative m-3">
      <a-divider>{{ getMetricItem(item) }}</a-divider>
      <chart-line :columns="item.chartData.columns" :rows="item.chartData.rows" :options="getConfig(item)" />
      <div v-if="loading" class="chart-spin">
        <a-spin />
      </div>
    </a-card>
  </div>
</template>

<script>
import ChartLine from '@/sections/Charts/Line'

export default {
  name: 'MonitorList',
  components: {
    // 统一用 echarts 图表
    ChartLine,
  },
  props: {
    singleActions: {
      type: Array,
    },
    listData: {
      type: Array,
    },
    loading: {
      type: Boolean,
    },
  },
  methods: {
    noDataCheck (item) {
      return item.noData || false
    },
    getMetricItem (item) {
      let str = item.title
      const metric = item.constants?.seleteItem || item.constants?.metric || ''
      str += metric ? ` (${metric})` : ''
      return str
    },
    getConfig (item) {
      const lineConfig = item.lineConfig || {}
      if (!lineConfig.tooltip) {
        lineConfig.tooltip = {
          formatter: (params = [], ticket, callback) => {
            let ret = '<div>'
            params.map(param => {
              ret += `<div>${param.marker || ''}<span>${param.seriesName || ''}: ${param.value}${item.unit}</div>`
            })
            ret += '</div>'
            // eslint-disable-next-line
            callback(ret)
            return ret
          },
        }
      }
      return {
        ...lineConfig,
        yAxis: {
          axisLabel: {
            formatter: `{value}${item.unit}`,
          },
          axisTick: {
            show: false,
          },
        },
      }
    },
  },
}
</script>

<style lang="less" scoped>
.monitor-list {
  .actions {
    right: 16px;
    top: 16px;
  }
}
.chart-spin {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  text-align: center;
  vertical-align: middle;
  background: rgba(0, 0, 0, 0.1);
  .ant-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
