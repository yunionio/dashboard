<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
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
// import i18n from 'vue-i18n'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { numerify } from '@/filters'
import { chartColors } from '@/constants'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { resolveValueChangeField } from '@/utils/common/ant'
import ConsumptionConfig from '@Dashboard/sections/ConsumptionConfig'
import { getCurrency } from '@/utils/common/cookie'
import { currencyUnitMap } from '@/constants/currency'

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
  },
  data () {
    const initialNameValue = (this.params && this.params.name) || this.$t('dashboard.consmption_trend')
    const initialCloudEnvValue = ((this.params && this.params.type !== 'Brand') && this.params.cloud_env) || ''
    const initialBrandValue = ((this.params && this.params.type !== 'Brand') && this.params.brand) || ''
    const initCurrencyValue = (this.params && this.params.currency) || getCurrency()
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
    newCurrencys () {
      return this.CURRENCYS.filter(v => {
        return this.currencyOpts.find(obj => obj.item_id === v.key)
      })
    },
    currencySign () {
      return currencyUnitMap[this.form.fd.currency]?.sign || '¥'
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
        if (key === 'currency' && !config.initialValue) {
          config.initialValue = (this.params && this.params.currency) || getCurrency()
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
    getDate () {
      const end = this.$moment()
      const start = this.$moment().subtract(30, 'days')
      return {
        start_date: start.format('YYYY-MM-DD') + 'TZ',
        end_date: end.format('YYYY-MM-DD') + 'TZ',
        // start_date: '2021-05-01TZ',
        // end_date: '2021-05-31TZ',
        data_type: 'day',
      }
    },
    async fetchData () {
      this.loading = true
      try {
        const params = {
          query_type: 'expense_trend',
          admin: this.$store.getters.isAdminMode,
          scope: this.$store.getters.scope,
          ...this.getDate(),
        }
        if (this.form.fd.currency) {
          params.currency = this.form.fd.currency
        }
        if (this.form.fd.brand) {
          params.brand = this.form.fd.brand
        }
        if (this.form.fd.cloud_env) {
          params.cloud_env = this.form.fd.cloud_env
        }
        if (this.form.fd.account) {
          params.account = this.form.fd.account
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
