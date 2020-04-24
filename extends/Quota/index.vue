<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ params.name || '配额使用情况'}}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center">
        <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import get from 'lodash/get'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import { getRequestT, sizestr, sizestrWithUnit } from '@/utils/utils'

export const options = {
  label: '配额',
  desc: '配额使用情况',
  thumb: require('./assets/thumb.svg'),
  h: 3,
  w: 5,
  sort: 9,
  galleryHidden: true,
}

export default {
  name: 'Quota',
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    return {
      data: [],
      loading: false,
      quotaConfig: {
        cpu: {
          unit: '核',
        },
        memory: {
          format: 'sizestr',
          unit: 'M',
        },
        storage: {
          format: 'sizestr',
          unit: 'M',
        },
        eip: {
          unit: '个',
        },
        port: {
          unit: '个',
        },
        isolated_device: {
          unit: '个',
        },
        image: {
          unit: '个',
        },
        snapshot: {
          unit: '个',
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode', 'userInfo']),
    chartData () {
      let data = R.sort((a, b) => {
        const aUsage = get(a, `usage.${this.params.field}`)
        const bUsage = get(b, `usage.${this.params.field}`)
        if (aUsage === bUsage) {
          return get(a, this.params.field) - get(b, this.params.field)
        }
        return aUsage - bUsage
      }, R.slice(0, 8, this.data))
      if (this.isDomainMode) {
        data = data.filter(item => item.tenant)
      }
      const yAxisData = []
      const usageData = []
      const allData = []
      R.forEach(item => {
        yAxisData.push(item[this.params.titleKey])
        allData.push(item[this.params.field])
        usageData.push(item[`usage.${this.params.field}`])
      }, data)
      return { yAxisData, allData, usageData }
    },
    chartOptions () {
      return {
        legend: {
          right: 5,
          data: ['已使用', '未使用'],
        },
        grid: {
          left: 10,
          top: 30,
          right: 10,
          bottom: 0,
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            lineStyle: {
              color: '#ddd',
            },
          },
          backgroundColor: 'rgba(255,255,255,1)',
          padding: [5, 10],
          textStyle: {
            color: '#7588E4',
          },
          extraCssText: 'box-shadow: 0 0 5px rgba(0,0,0,0.3)',
          formatter: (params, ticket) => {
            const qc = this.quotaConfig[this.params.field]
            let usage
            let allUage
            let label
            R.forEach(item => {
              if (item.axisValueLabel) label = item.axisValueLabel
              if (qc.format === 'sizestr') {
                if (item.seriesName === '未使用') {
                  allUage = sizestr(params[1].value, qc.unit, 1024)
                } else {
                  usage = sizestr(params[0].value, qc.unit, 1024)
                }
              } else {
                if (item.seriesName === '未使用') {
                  allUage = `${params[1].value}${qc.unit}`
                } else {
                  usage = `${params[0].value}${qc.unit}`
                }
              }
            }, params)
            const ret = []
            if (label) ret.push(label)
            if (usage) ret.push(`已使用：${usage}`)
            if (allUage) ret.push(`未使用：${allUage}`)
            return ret.join('<br>')
          },
        },
        xAxis: {
          show: false,
          type: 'value',
          splitLine: {
            show: false,
            interval: 'auto',
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            showMaxLabel: false,
            margin: 10,
            align: 'left',
            textStyle: {
              fontSize: 12,
            },
            // formatter: (val) => {
            //   const qc = this.quotaConfig[this.params.field]
            //   if (qc.format === 'sizestr') {
            //     return sizestrWithUnit(val, qc.unit, 1024)
            //   }
            //   return `${val}${qc.unit}`
            // },
          },
        },
        yAxis: {
          type: 'category',
          splitLine: {
            show: false,
            lineStyle: {
              color: ['#D4DFF5'],
            },
          },
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
            lineStyle: {
              color: '#999',
            },
          },
          axisLabel: {
            margin: 10,
            textStyle: {
              fontSize: 12,
            },
            formatter: (val) => {
              if (val.length > 8) {
                return `${val.slice(0, 8)}...`
              }
              return val
            },
          },
          data: this.chartData.yAxisData,
        },
        series: [
          {
            name: '已使用',
            type: 'bar',
            itemStyle: {
              normal: {
                color: '#99da69',
              },
            },
            barWidth: 3,
            z: 1,
            data: this.chartData.usageData,
            label: {
              normal: {
                show: true,
                position: 'left',
                align: 'left',
                offset: [5, -10],
                textStyle: {
                  fontSize: 12,
                },
                formatter: data => {
                  const qc = this.quotaConfig[this.params.field]
                  if (qc.format === 'sizestr') {
                    return sizestrWithUnit(data.value, qc.unit, 1024)
                  }
                  return `${data.value}${qc.unit}`
                },
              },
            },
          },
          {
            name: '未使用',
            type: 'bar',
            itemStyle: {
              normal: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            barWidth: 3,
            z: 0,
            barGap: '-100%',
            data: this.chartData.allData,
            label: {
              normal: {
                show: true,
                position: 'left',
                align: 'bottom',
                offset: [5, 10],
                textStyle: {
                  fontSize: 12,
                },
                formatter: data => {
                  const qc = this.quotaConfig[this.params.field]
                  if (qc.format === 'sizestr') {
                    return sizestrWithUnit(data.value, qc.unit, 1024)
                  }
                  return `${data.value}${qc.unit}`
                },
              },
            },
          },
        ],
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const data = await load({
          res: 'quotas',
          actionArgs: {
            url: `/v2/rpc/${this.params.resource}/quota-list`,
            method: 'GET',
            params: {
              $t: getRequestT(),
              ...this.genParams(),
            },
          },
          useManager: false,
          resPath: 'data.data',
        })
        this.data = data || []
      } finally {
        this.loading = false
      }
    },
    genParams () {
      const ret = {
        scope: this.scope,
      }
      if (this.isDomainMode) {
        ret.primary = true
        ret.domain_id = this.userInfo.projectDomainId
      }
      return ret
    },
  },
}
</script>
