<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.text_6') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
          <router-link v-if="!edit" to="/billoverview" class="ml-2">
            <icon type="arrow-right" style="font-size:18px" />
          </router-link>
        </div>
      </div>
      <div class="dashboard-card-body flex-column justify-content-center">
        <template v-if="chartOptions.series[0].data.length">
          <div class="flex-fill position-relative">
            <div class="dashboard-fco-wrap">
              <e-chart :options="chartOptions" style="height: 100%; width: 100%;" autoresize />
            </div>
          </div>
        </template>
        <template v-else>
          <a-empty />
        </template>
      </div>
    </div>
    <base-drawer class="ring-drawer-wrapper" @update:visible="updateVisible" :visible="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <slot />
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <!-- 名称 -->
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <consumption-config :fc="form.fc" :fd="form.fd" :decorators="decorators" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import mixin from './mixin'
import { numerify } from '@/filters'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import ConsumptionConfig from '@Dashboard/sections/ConsumptionConfig'
import { currencyUnitMap } from '@/constants/currency'

export default {
  name: 'DoughnutResourceType',
  components: {
    BaseDrawer,
    ConsumptionConfig,
  },
  mixins: [mixin],
  props: {
    params: Object,
    edit: Boolean,
  },
  data () {
    const initialNameValue = ((this.params && this.params.type !== 'Brand') && this.params.name) || this.$t('dashboard.resource_type_consumption_percent')
    const initialCloudEnvValue = ((this.params && this.params.type !== 'Brand') && this.params.cloud_env) || ''
    const initialBrandValue = ((this.params && this.params.type !== 'Brand') && this.params.brand) || ''
    const initCurrencyValue = (this.params && this.params.currency) || this.currency
    return {
      data: {},
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          cloud_env: initialCloudEnvValue,
          brand: initialBrandValue,
          currency: initCurrencyValue,
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initialNameValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_8') },
            ],
          },
        ],
        cloud_env: [
          'cloud_env',
          {
            initialValue: initialCloudEnvValue,
          },
        ],
        brand: [
          'brand',
          {
            initialValue: initialBrandValue,
          },
        ],
        account: [
          'account',
          {
            initialValue: this.params && this.params.account,
          },
        ],
        currency: [
          'currency',
          {
            initialValue: initCurrencyValue,
          },
        ],
      },
      chartOptions: {
        title: [
          {
            text: this.$t('dashboard.total_fee'),
            subtext: '',
            textStyle: {
              fontSize: 12,
              color: '#ccc',
            },
            subtextStyle: {
              fontSize: 18,
              color: 'rgb(100, 100, 100)',
            },
            top: '38%',
            left: 'center',
          },
        ],

        tooltip: {
          show: true,
          trigger: 'item',
          confine: true,
          position: (point, params, dom, rect, size) => {
            const series = `<div style="color: #616161;">${params.marker} <span>${params.name}</span>:  <span>${this.currencySign}${params.value}</span></div>`
            const wrapper = `<div class="chart-tooltip-wrapper">
                              <div class="lines-wrapper">${series}</div>
                            </div>`
            dom.style.border = 'none'
            dom.style.backgroundColor = 'transparent'
            dom.innerHTML = wrapper
          },
        },
        color: chartColors,
        series: [
          {
            type: 'pie',
            radius: ['50%', '65%'],
            center: ['50%', '50%'],
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
            data: [],
          },
        ],
      },
    }
  },
  computed: {
    ...mapState('common', {
      currency: state => state.bill.currency,
      currencyOpts: state => state.bill.currencyOpts,
    }),
    newCurrencys () {
      return this.CURRENCYS.filter(v => {
        return this.currencyOpts.find(obj => obj.item_id === v.key)
      })
    },
    currencySign () {
      return currencyUnitMap[this.form.fd.currency]?.sign || '¥'
    },
    currencyParams () {
      if (this.form.fd.currency) {
        return {
          filter: [`currency.equals("${this.form.fd.currency}")`],
        }
      }
      return {}
    },
  },
  watch: {
    'form.fd' (val) {
      this.fetchData()
      for (const key in this.decorators) {
        let config = this.decorators[key][1] || {}
        config = {
          ...config,
          initialValue: val[key],
        }
        this.decorators[key][1] = config
      }
    },
  },
  created () {
    if (this.params && this.params.type !== 'Brand') {
      this.form.fd = this.params
    }
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, { type: 'Resource', ...values })
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
    },
    getDate () {
      const end = this.$moment()
      const start = this.$moment().startOf('month')
      return {
        start_date: start.format('YYYY-MM-DD') + 'TZ',
        end_date: end.format('YYYY-MM-DD') + 'TZ',
        data_type: 'day',
      }
    },
    cloudEnv (val) {
      switch (val) {
        case 'onpremise':
          return { is_on_premise: true }
        case 'private':
          return { private_cloud: true }
        case 'public':
          return { public_cloud: true }
        default:
          return {}
      }
    },
    async fetchData () {
      this.loading = true
      try {
        const envParams = this.cloudEnv(this.form.fd.cloud_env || '')
        const params = {
          query_type: 'res_type_stat',
          admin: this.$store.getters.isAdminMode,
          scope: this.$store.getters.scope,
          ...this.getDate(),
          ...envParams,
          ...this.currencyParams,
        }
        if (this.form.fd.brand) {
          params.brand = this.form.fd.brand
        }
        if (this.form.fd.account) {
          params.range_type = 'cloudaccounts'
          params.range_id = this.form.fd.account
        }
        const { data = {} } = await new this.$Manager('bill_analysises', 'v1').list({ params })
        const { data: series = [] } = data
        let total = 0
        const chartData = []
        if (series.length > 0) {
          series.map(item => {
            if (item.res_fee !== 0) {
              total += item.res_fee
              chartData.push({ name: this.getResName(item.item_name), value: item.res_fee })
            }
          })
        }
        this.chartOptions.series[0].data = chartData
        this.chartOptions.title[0].subtext = `${this.currencySign}${numerify(total, '0,0.00')}`
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.updateVisible(true)
    },
    updateVisible (val) {
      this.$emit('update:visible', val)
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        this.$emit('update', this.options.i, { type: 'Resource', ...values })
        this.updateVisible(false)
      } catch (error) {
        throw error
      }
    },
    getResName (name) {
      if (this.$te(`bill_resource_type.${name}`)) {
        return this.$t(`bill_resource_type.${name}`)
      }
      return name
    },
  },
}
</script>

<style lang="less" scoped>
.percent-tips {
  font-size: 18px;
}
.ring-drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
