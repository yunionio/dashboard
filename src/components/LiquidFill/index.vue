<template>
  <div style="width:120px;height:120px" ref="liquidFill" />
</template>

<script>
import echarts from 'echarts'
import 'echarts-liquidfill'

export default {
  name: 'LiquidFill',
  props: {
    value: Number,
  },
  data () {
    return {
      chart: '',
    }
  },
  computed: {
    dataList () {
      let dataList = []
      if (this.value >= 1) {
        dataList = [this.value, 0.9, 0.8]
      } else if (this.value >= 0.8) {
        dataList = [this.value, this.value - 0.15, this.value - 0.3, this.value - 0.45]
      } else if (this.value >= 0.6) {
        dataList = [this.value, this.value - 0.1, this.value - 0.2, this.value - 0.3]
      } else if (this.value >= 0.4) {
        dataList = [this.value, this.value - 0.1, this.value - 0.2]
      } else if (this.value >= 0.2) {
        dataList = [this.value, this.value - 0.2]
      } else {
        dataList = [this.value]
      }
      return dataList
    },
  },
  watch: {
    dataList: {
      handler: function (val) {
        this.initChart()
      },
    },
  },
  mounted () {
    this.initChart()
  },
  methods: {
    initChart () {
      setTimeout(() => {
        this.chart = echarts.init(this.$refs.liquidFill)
        this.chart.setOption({
          series: [{
            type: 'liquidFill',
            data: this.dataList,
            radius: '90%',
            outline: {
              show: false,
            },
            label: {
              textStyle: {
                fontSize: 20,
              },
              formatter: (row) => {
                const value = parseFloat(row.value)
                if (value > 0 && value < 0.01) {
                  return '< 1%'
                }
                if (value > 0.99 && value < 1) {
                  return '> 99%'
                }
              },
            },
          }],
          backgroundStyle: {
            borderWidth: 2,
            borderColor: '#156ACF',
          },
        })
      }, 50)
    },
  },
}
</script>
