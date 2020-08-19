<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="() => visible = true" />
          <router-link v-if="!edit" to="/suggestsysalert" class="ml-2">{{$t('dashboard.text_13')}}</router-link>
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
      </a-form-model>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'
import { chartColors } from '@/constants'
import { numerify } from '@/filters'

export default {
  name: 'SuggestsysAlertsDetail',
  components: {
    BaseDrawer,
  },
  props: {
    options: {
      type: Object,
      required: true,
    },
    params: Object,
    edit: Boolean,
  },
  data () {
    const initNameValue = (this.params && this.params.name) || this.$t('dashboard.text_47')
    return {
      data: [],
      visible: false,
      loading: false,
      fd: {
        name: initNameValue,
      },
      rules: {
        name: [
          { required: true, message: this.$t('dashboard.text_8') },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
    allData () {
      const arr = this.data.filter(item => item.cost_type === 'all')
      return arr[0] || {}
    },
    outherData () {
      return this.data.filter(item => item.cost_type !== 'all').map(item => {
        const ret = {
          ...item,
          formatted_amount: numerify(item.amount, '0,0.00'),
          percent: this.getPercent(item.amount, this.allData.amount),
          value: item.amount,
        }
        ret.name = this.$te(`suggestsyRuleTypes.${ret.cost_type}`) ? this.$t(`suggestsyRuleTypes.${ret.cost_type}`) : ret.cost_type
        return ret
      })
    },
    chartOptions () {
      return {
        title: [
          {
            text: this.$t('dashboard.text_48'),
            subtext: `￥${numerify(this.allData.amount, '0,0.00')}`,
            textStyle: {
              fontSize: 12,
              color: '#ccc',
            },
            subtextStyle: {
              fontSize: 18,
              color: 'rgb(100, 100, 100)',
            },
            textAlign: 'center',
            x: '23.5%',
            y: '35%',
          },
        ],
        color: chartColors,
        legend: {
          type: 'scroll',
          pageIconSize: 8,
          icon: 'circle',
          orient: 'vertical',
          left: '50%',
          align: 'left',
          top: 'middle',
          itemHeight: 8,
          itemWidth: 8,
          textStyle: {
            rich: {
              name: {
                verticalAlign: 'right',
                align: 'left',
                fontSize: 12,
                color: 'rgb(100, 100, 100)',
                height: 20,
              },
              percent: {
                align: 'left',
                color: 'rgb(200, 200, 200)',
              },
              formatted_amount: {
                align: 'right',
                fontSize: 12,
                color: 'rgb(100, 100, 100)',
              },
            },
          },
          height: '90%',
          formatter: name => {
            const item = R.find(R.propEq('name', name))(this.outherData)
            if (item) {
              return `{name|${name}} \n {percent|${item.percent}%}{formatted_amount|￥${item.formatted_amount}}`
            }
            return name
          },
        },
        series: [
          {
            name: this.$t('dashboard.text_49'),
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['50%', '65%'],
            hoverAnimation: false,
            label: {
              normal: {
                show: false,
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: this.outherData,
          },
        ],
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
              details: true,
              scope: this.scope,
            },
          },
          useManager: false,
          resPath: 'data.suggest_cost',
        })
        this.data = data || []
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
    getPercent (num, den) {
      const percent = (num / den) * 100
      if (percent < 10) {
        return percent.toFixed(1)
      }
      return `${parseInt(percent)}`
    },
  },
}
</script>
