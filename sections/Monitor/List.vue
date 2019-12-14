<template>
  <div class="monitor-list d-flex flex-wrap">
    <a-card v-for="item in listData" :key="item.title" style="width: 700px;" class="position-relative m-3">
      <a-divider>{{ item.title }}</a-divider>
      <actions class="actions position-absolute" :options="singleActions" :row="item" button-type="link" button-size="small" />
      <monitor-list-line :chartData="item.chartData" :lineConfig="getConfig(item)" :loading="loading" />
    </a-card>
  </div>
</template>

<script>
import MonitorListLine from './Line'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'MonitorList',
  components: {
    MonitorListLine,
    Actions,
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
      return {
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

<style lang="scss" scoped>
.monitor-list {
  .actions {
    right: 16px;
    top: 16px;
  }
}
</style>
