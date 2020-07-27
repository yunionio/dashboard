<template>
  <a-card :title="title">
    <ve-ring v-bind="ringOption" :height="height" />
  </a-card>
</template>

<script>
export default {
  props: {
    height: {
      type: String,
      default: '400px',
    },
    options: {
      type: Object,
      required: true,
      default: _ => {
        return {
          pieData: [], // eg: [{value: xx, name: xx}]
          title: '',
          total: 0,
        }
      },
    },
  },
  data () {
    return {
      ringOption: {
        title: {
          left: '5%',
          top: '5%',
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          left: '55%',
          bottom: '20%',
          data: [
            this.$t('common_252'),
            this.$t('common_253'),
            this.$t('common_254'),
          ],
        },
        series: [
          {
            name: '',
            type: 'pie',
            center: ['26%', '50%'],
            radius: [
              '40%',
              '55%',
            ],
            avoidLabelOverlap: false,
            labelLine: {
              show: true,
            },
            data: [],
            label: {
              show: true,
              position: 'center',
              formatter: '8',
              textStyle: {
                fontSize: 22,
                color: '#333',
              },
            },
          },
        ],
      },
    }
  },
  computed: {
    title () {
      return this.options.title
    },
  },
  watch: {
    options: {
      handler: function (val) {
        this.concatOption(val)
      },
      immediate: true,
    },
  },
  methods: {
    concatOption (opData) {
      const tempOption = JSON.parse(JSON.stringify(this.ringOption))
      // tempOption.title.text = opData.title
      tempOption.legend.data = opData.pieData.map(v => v.name)
      tempOption.series[0].data = opData.pieData
      tempOption.series[0].label.formatter = `${opData.total}`
      this.ringOption = tempOption
    },
  },
}
</script>

<style lang="less" scoped>
.ant-card {
  & ::v-deep .ant-card-body {
    padding: 12px;
  }
}
</style>
