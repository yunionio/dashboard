<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="() => visible = true" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center justify-content-center flex-column">
        <div class="flex-shrink-0 flex-grow-0 font-weight-bold mt-2">您的本月支出预估有<span class="success-color">{{ percent }}%</span>的下降空间</div>
        <div class="flex-fill w-100">
          <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
        </div>
        <div class="w-100">
          <div class="d-flex">
            <div class="flex-grow-0 flex-shrink-0 text-color-help">本月预估成本</div>
            <div class="flex-fill text-right error-color font-weight-bold">￥{{ forcastAmount }}</div>
          </div>
          <div class="d-flex mt-2">
            <div class="flex-grow-0 flex-shrink-0 text-color-help">优化建议可省</div>
            <div class="flex-fill text-right success-color font-weight-bold">￥{{ suggestAmount }}</div>
          </div>
        </div>
      </div>
    </div>
    <base-drawer :visible.sync="visible" title="配置磁贴" @ok="handleSubmit">
      <a-form-model
        ref="form"
        hideRequiredMark
        :model="fd"
        :rules="rules">
        <a-form-model-item label="磁贴名称" prop="name">
          <a-input v-model="fd.name" />
        </a-form-model-item>
      </a-form-model>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'SuggestsysAlertsOverview',
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
    const initNameValue = (this.params && this.params.name) || '优化建议总览'
    return {
      data: {},
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
      },
      rules: {
        name: [
          { required: true, message: '请输入磁贴名称' },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
    forcastAmount () {
      return ((this.data.meter_forcast_cost && this.data.meter_forcast_cost.amount) || 0).toFixed(2)
    },
    suggestAmount () {
      return ((this.data.suggest_cost && this.data.suggest_cost[0] && this.data.suggest_cost[0].amount) || 0).toFixed(2)
    },
    percent () {
      const percent = ((this.suggestAmount / this.forcastAmount) || 0) * 100
      if (percent < 10) {
        return percent.toFixed(1)
      }
      return `${parseInt(percent)}`
    },
    chartOptions () {
      return {
        title: {
          text: `${this.percent}%`,
          x: 'center',
          y: 'center',
          textStyle: {
            fontWeight: 'normal',
            color: 'rgb(150, 150, 150)',
            fontSize: '20',
          },
        },
        color: ['rgba(176, 212, 251, 1)'],
        legend: {
          show: false,
          itemGap: 12,
          data: ['forcastAmount', 'suggestAmount'],
        },
        series: [{
          name: 'Line 1',
          type: 'pie',
          clockWise: true,
          radius: ['50%', '66%'],
          itemStyle: {
            normal: {
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
            },
          },
          hoverAnimation: false,
          data: [{
            value: this.forcastAmount,
            name: 'forcastAmount',
            itemStyle: {
              normal: {
                color: '#1890ff',
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                },
              },
            },
          }, {
            name: 'suggestAmount',
            value: this.suggestAmount,
            itemStyle: {
              normal: {
                color: '#52c41a',
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                },
              },
            },
          }],
        }],
      }
    },
  },
  created () {
    this.fetchData()
    this.$emit('update', this.options.i, {
      ...this.fd,
    })
    this.$bus.$on('DashboardCardRefresh', args => {
      this.fetchData()
    }, this)
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const data = await load({
          res: 'quotas',
          actionArgs: {
            url: '/v1/suggestsysalerts/cost',
            method: 'GET',
            params: {
              $t: getRequestT(),
              details: false,
              scope: this.scope,
            },
          },
          useManager: false,
          resPath: 'data',
        })
        this.data = data || {}
      } finally {
        this.loading = false
      }
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
