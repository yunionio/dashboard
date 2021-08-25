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
  },
  computed: {
    noData () {
      if (this.chartData.rows && this.chartData.rows.length) {
        return false
      }
      return true
    },
    chartConfigC () {
      return {
        colors: this.colors,
        ...this.chartConfig,
      }
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
