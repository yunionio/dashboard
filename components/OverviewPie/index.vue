<template>
  <div>
    <div v-if="header" class="header clearfix">
      <div class="title-wrapper float-left" v-if="header.title">
        <div class="title">{{ header.title }}</div>
        <div class="subtitle" v-if="header.subtitle">{{ header.subtitle }}</div>
      </div>
    </div>
    <base-chart chartType="ve-ring" :chartData="chartData" :chartConfig="chartConfig" :chartSettings="chartSettings" :loading="loading" :emptyContent="emptyContent" />
  </div>
</template>

<script>
export default {
  name: 'OverviewPie',
  props: {
    header: {
      type: Object,
      default: () => ({}),
    },
    chartData: {
      type: Object,
      required: true,
    },
    legendData: {
      type: Array,
      default: () => { return [] },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    height: {
      type: String,
      default: '320px',
    },
    chartSettings: {
      type: Object,
      default: () => ({
        height: '80%',
        offsetY: '45%',
        offsetX: '25%',
        radius: ['45%', '75%'],
        center: ['0%', '45%'],
        label: {
          normal: { show: false },
          emphasis: { show: false },
        },
        labelLine: {
          normal: { show: false },
        },
      }
      ),
    },
    splitLineShow: {
      type: Boolean,
      default: false,
    },
    emptyContent: {},
    showLegend: {
      type: Boolean,
      default: false,
    },
    pieTitle: {
      type: String,
      default: '',
    },
    pieSubtext: {
      type: String,
      default: '',
    },
  },
  data () {
    return {}
  },
  computed: {
    chartConfig () {
      const config = {
        height: this.height,
        width: '100%',
        legend: {
          show: this.showLegend,
          orient: 'horizontal',
          bottom: '0%',
        },
        title: {
          show: true,
          text: this.pieTitle,
          subtext: this.pieSubtext,
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
          position: {
            _custom: {
              type: 'function',
              display: '<span>ƒ</span> position(point, params, dom, rect, size)',
            },
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '3%',
          containLabel: true,
        },
      }
      return config
    },
  },
}
</script>
