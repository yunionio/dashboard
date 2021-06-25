<template>
  <div class="monitor-list d-flex flex-wrap">
    <a-card v-for="item in listData" :key="item.title+item.constants ? item.constants.fromItem : ''" style="width: 700px;" class="position-relative m-3">
      <a-divider>{{ item.title }}</a-divider>
      <actions class="actions position-absolute" :options="singleActions" :row="item" button-type="link" button-size="small" />
      <!-- <monitor-list-line :chartData="item.chartData" :lineConfig="getConfig(item)" :loading="loading" /> -->
      <chart-line :columns="item.chartData.columns" :rows="item.chartData.rows" :options="getConfig(item)" />
    </a-card>
  </div>
</template>

<script>
// import MonitorListLine from './Line'
import Actions from '@/components/PageList/Actions'
import ChartLine from '@/sections/Charts/Line'

export default {
  name: 'MonitorList',
  components: {
    // MonitorListLine, // 统一用 echarts 图表
    Actions,
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
    getConfig (item) {
      const lineConfig = item.lineConfig || {}
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
</style>
