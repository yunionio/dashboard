<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
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
    <base-drawer :visible.sync="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <consumption-config :fc="form.fc" :fd="form.fd" :decorators="decorators" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import { numerify } from '@/filters'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
import ConsumptionConfig from '@Dashboard/sections/ConsumptionConfig'
import { currencyUnitMap } from '@/constants/currency'
import { uuid } from '@/utils/utils'

export default {
  name: 'ConsumptionTrend',
  components: {
    BaseDrawer,
    ConsumptionConfig,
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
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.consmption_trend')
    const initialCloudEnvValue = (this.params && this.params.cloud_env) || ''
    const initialBrandValue = (this.params && this.params.brand) || ''
    const initCurrencyValue = (this.params && this.params.currency) || this.currency
    const initAccountValue = (this.params && this.params.account) || ''
    return {
      data: [],
      visible: false,
      loading: false,
      seriesData: [],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            const newField = resolveValueChangeField(values)
            R.forEachObjIndexed((item, key) => {
              this.$set(this.form.fd, key, item)
            }, newField)
          },
        }),
        fd: {
          name: initialNameValue,
          cloud_env: initialCloudEnvValue,
          brand: initialBrandValue,
          currency: initCurrencyValue,
          account: initAccountValue,
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
            initialValue: initAccountValue,
          },
        ],
        currency: [
          'currency',
          {
            initialValue: initCurrencyValue,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      chartOptions: {
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
        grid: {
          left: 50,
          bottom: 30,
          top: 30,
          right: 20,
          width: 'auto',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            type: 'bar',
            data: [],
          },
        ],
        color: chartColors,
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'capability', 'isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    ...mapState('common', {
      currency: state => state.bill.currency,
    }),
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
    const values = { ...this.form.fd }
    this.$emit('update', this.options.i, values)
    this.fetchData()
  },
  methods: {
    refresh () {
      return this.fetchData()
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
    getDate () {
      const end = this.$moment()
      const start = this.$moment().subtract(30, 'days')
      return {
        start_date: start.format('YYYY-MM-DD') + 'TZ',
        end_date: end.format('YYYY-MM-DD') + 'TZ',
        data_type: 'day',
      }
    },
    async fetchData () {
      this.loading = true
      try {
        const envParams = this.cloudEnv(this.form.fd.cloud_env || '')
        const params = {
          $t: uuid(),
          query_type: 'expense_trend',
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
        const yData = []
        const xData = []
        if (series.length > 0) {
          series.map(item => {
            yData.push(numerify(item.stat_value, '0.00'))
            xData.push(this.$moment(item.date_info).format('MM-DD'))
          })
        }
        this.chartOptions.xAxis.data = xData
        this.chartOptions.series[0].data = yData
      } finally {
        this.loading = false
      }
    },
    handleEdit () {
      this.visible = true
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        const updateValues = { ...values }
        this.$emit('update', this.options.i, updateValues)
        this.visible = false
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
