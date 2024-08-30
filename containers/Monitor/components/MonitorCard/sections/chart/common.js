function commonChartProps () {
  return {
    chartHeigth: {
      type: String,
      default: '320px',
    },
    /* 图例显示 */
    showLegend: {
      type: Boolean,
      default: false,
    },
    /* 数据格式
        * http://numeraljs.com/
        * https://vue-echarts.github.io/guide/format.html
        * */
    yAxisFormat: {
      type: String,
      default: '0.[00]',
    },
    /* 图数据 */
    chartData: {
      type: Object,
      required: true,
    },
    /* 图表自身的属性 */
    chartSetting: {
      type: Object,
      default: () => ({}),
    },
    chartExtend: {
      type: Object,
      default: () => ({}),
    },
    /* 图表事件绑定 */
    chartEvents: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
  }
}

export default commonChartProps
