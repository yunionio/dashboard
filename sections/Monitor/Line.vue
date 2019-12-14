<template>
  <ve-line :data="chartData" v-bind="lineConfig" :loading="loading" :settings="chartSettings">
    <div class="monitor-list-line-loader d-flex flex-column justify-content-center" v-if="!loading && noData">
      <a-empty />
    </div>
  </ve-line>
</template>

<script>
import 'v-charts/lib/style.css' // 使用loading属性前先引入css
import * as R from 'ramda'

export default {
  name: 'MonitorListLine',
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
    lineConfig: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    noData () {
      if (this.chartData.rows && this.chartData.rows.length) {
        return false
      }
      return true
    },
  },
}
</script>

<style lang="scss" scoped>
.monitor-list-line-loader {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
