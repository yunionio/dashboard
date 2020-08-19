<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center">
        <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
      </div>
    </div>
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form-model
        ref="form"
        hideRequiredMark
        :model="fd"
        :rules="rules">
        <a-form-model-item :label="$t('dashboard.text_6')" prop="name">
          <a-input v-model="fd.name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('dashboard.text_20')" prop="field">
          <a-select v-model="fd.field">
            <template v-for="(item, key) of quotaConfig">
              <a-select-option :value="key" :key="key">{{ item.desc }}</a-select-option>
            </template>
          </a-select>
        </a-form-model-item>
      </a-form-model>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import get from 'lodash/get'
import { mapGetters } from 'vuex'
import { load } from '@Dashboard/utils/cache'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { getRequestT, sizestr, sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'Quota',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
  },
  data () {
    let name = this.$t('dictionary.project')
    if (this.$store.getters.isAdminMode) {
      name = this.$t('dictionary.domain')
    }
    const genDesc = (title) => {
      return this.$t('dashboard.text_27', [name, title])
    }
    const titleKey = this.$store.getters.isAdminMode ? 'domain' : 'tenant'
    const initNameValue = (this.params && this.params.name) || genDesc('CPU')
    const initResourceValue = (this.params && this.params.resource) || 'quotas'
    const initTitleKeyValue = (this.params && this.params.titleKey) || titleKey
    const initFieldValue = (this.params && this.params.field) || 'cpu'
    return {
      data: [],
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
        field: initFieldValue,
        titleKey: initTitleKeyValue,
        resource: initResourceValue,
      },
      rules: {
        name: [
          { required: true, message: this.$t('dashboard.text_8') },
        ],
        field: [
          { required: true, message: this.$t('dashboard.text_22') },
        ],
      },
      quotaConfig: {
        cpu: {
          unit: this.$t('dashboard.text_3'),
          desc: genDesc('CPU'),
          resource: 'quotas',
        },
        memory: {
          format: 'sizestr',
          unit: 'M',
          desc: genDesc(this.$t('dashboard.text_28')),
          resource: 'quotas',
        },
        storage: {
          format: 'sizestr',
          unit: 'M',
          desc: genDesc(this.$t('dashboard.text_29')),
          resource: 'quotas',
        },
        eip: {
          unit: this.$t('dashboard.text_1'),
          desc: genDesc(this.$t('dashboard.text_30')),
          resource: 'region_quotas',
        },
        port: {
          unit: this.$t('dashboard.text_1'),
          desc: genDesc('IP'),
          resource: 'region_quotas',
        },
        isolated_device: {
          unit: this.$t('dashboard.text_4'),
          desc: genDesc('GPU'),
          resource: 'quotas',
        },
        image: {
          unit: this.$t('dashboard.text_1'),
          desc: genDesc(this.$t('dashboard.text_31')),
          resource: 'image_quotas',
        },
        snapshot: {
          unit: this.$t('dashboard.text_1'),
          desc: genDesc(this.$t('dashboard.text_32')),
          resource: 'region_quotas',
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'isDomainMode', 'userInfo']),
    chartData () {
      let data = R.sort((a, b) => {
        const aUsage = get(a, `usage.${this.fd.field}`)
        const bUsage = get(b, `usage.${this.fd.field}`)
        if (aUsage === bUsage) {
          return get(a, this.fd.field) - get(b, this.fd.field)
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
        yAxisData.push(item[this.fd.titleKey])
        allData.push(item[this.fd.field])
        usageData.push(item[`usage.${this.fd.field}`])
      }, data)
      return { yAxisData, allData, usageData }
    },
    chartOptions () {
      return {
        legend: {
          right: 5,
          data: [this.$t('dashboard.text_33'), this.$t('dashboard.text_34')],
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
            const qc = this.quotaConfig[this.fd.field]
            let usage
            let allUage
            let label
            R.forEach(item => {
              if (item.axisValueLabel) label = item.axisValueLabel
              if (qc.format === 'sizestr') {
                if (item.seriesName === this.$t('dashboard.text_34')) {
                  allUage = sizestr(params[1].value, qc.unit, 1024)
                } else {
                  usage = sizestr(params[0].value, qc.unit, 1024)
                }
              } else {
                if (item.seriesName === this.$t('dashboard.text_34')) {
                  allUage = `${params[1].value}${qc.unit}`
                } else {
                  usage = `${params[0].value}${qc.unit}`
                }
              }
            }, params)
            const ret = []
            if (label) ret.push(label)
            if (usage) ret.push(this.$t('dashboard.text_35', [usage]))
            if (allUage) ret.push(this.$t('dashboard.text_36', [allUage]))
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
            name: this.$t('dashboard.text_33'),
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
                  const qc = this.quotaConfig[this.fd.field]
                  if (qc.format === 'sizestr') {
                    return sizestrWithUnit(data.value, qc.unit, 1024)
                  }
                  return `${data.value}${qc.unit}`
                },
              },
            },
          },
          {
            name: this.$t('dashboard.text_34'),
            type: 'bar',
            itemStyle: {
              normal: {
                color: '#dddfe6',
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
                  const qc = this.quotaConfig[this.fd.field]
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
  watch: {
    'fd.field' (val) {
      this.fd.resource = this.quotaConfig[val].resource
      this.fd.name = this.quotaConfig[val].desc
    },
    'fd.resource' (val, oldVal) {
      if (val !== oldVal) {
        this.fetchData()
      }
    },
  },
  created () {
    this.fetchData()
    this.$emit('update', this.options.i, {
      ...this.fd,
    })
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    handleEdit () {
      this.visible = true
    },
    async fetchData () {
      this.loading = true
      const params = {
        ...this.genParams(),
      }
      params.$t = getRequestT()
      try {
        const data = await load({
          res: 'quotas',
          actionArgs: {
            url: `/v2/rpc/${this.fd.resource}/quota-list`,
            method: 'GET',
            params,
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
    async handleSubmit () {
      try {
        await this.$refs.form.validate()
        this.$emit('update', this.options.i, this.fd)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
