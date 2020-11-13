<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left" @click.alt="showDebuggerInfo = !showDebuggerInfo">{{ form.fd.name || $t('dashboard.text_6') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right"><span v-if="showDebuggerInfo">{{ `${$t('dashboard.text_20')}: ${form.fd.usage_key}` }}</span><slot name="actions" :handle-edit="handleEdit" /></div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <div class="number-card-number mr-2">{{ this.usage.usage }}</div>
        <div class="number-card-unit">{{ this.usage.unit }}</div>
      </div>
    </div>
    <base-drawer class="drawer-wrapper" @update:visible="updateVisible" :visible="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit" @cancel="cancel">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <slot />
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <quota-config :fc="form.fc" :decorators="decorators" :usage-label="$t('dashboard.text_20')" @update:usage_key="setDefaultName" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import mixin from './mixin'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import QuotaConfig from '@Dashboard/sections/QuotaConfig'
import { USAGE_CONFIG } from '@Dashboard/constants'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'NumberCardServer',
  components: {
    BaseDrawer,
    QuotaConfig,
  },
  mixins: [mixin],
  data () {
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || `${this.$t('dashboard.text_23')}${this.$t('dictionary.project')}${this.$t('dictionary.server')}`
    const initialUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_key) || 'servers'
    return {
      data: {},
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          usage_key: initialUsageKeyValue,
        },
        fi: {
          nameTouched: false,
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
            initialValue: this.params && this.params.cloud_env,
          },
        ],
        brand: [
          'brand',
          {
            initialValue: this.params && this.params.brand,
          },
        ],
        region: [
          'region',
          {
            initialValue: this.params && this.params.region,
          },
        ],
        account: [
          'account',
          {
            initialValue: this.params && this.params.account,
          },
        ],
        usage_key: [
          'usage_key',
          {
            initialValue: initialUsageKeyValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_22') },
            ],
          },
        ],
      },
      showDebuggerInfo: false,
    }
  },
  computed: {
    usage () {
      const ret = {
        usage: (this.data && this.data[this.form.fd.usage_key]) || 0,
      }
      const config = USAGE_CONFIG[this.form.fd.usage_key]
      if (config && config.formatter) {
        const fVal = config.formatter(ret.usage)
        const fValArr = fVal.split(' ')
        ret.usage = fValArr[0]
        ret.unit = fValArr[1]
      }
      if (config && config.unit) {
        ret.unit = config.unit
      }
      return ret
    },
  },
  watch: {
    'form.fd' (val) {
      this.fetchUsage()
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
    if (this.params && this.params.type !== 'k8s') {
      this.form.fd = this.params
    }
    this.$bus.$on('DashboardCardRefresh', args => {
      this.fetchUsage()
    }, this)
  },
  methods: {
    refresh () {
      return this.fetchUsage()
    },
    genUsageParams () {
      const params = {
        scope: this.$store.getters.scope,
        $t: getRequestT(),
      }
      const fd = this.form.fd
      if (fd.cloud_env) params.cloud_env = fd.cloud_env
      if (fd.region) params.region = fd.region
      if (fd.account) {
        params.range_type = 'cloudaccounts'
        params.range_id = fd.account
      }
      if (fd.brand) params.brand = fd.brand
      return params
    },
    async fetchUsage () {
      this.loading = true
      try {
        const params = this.genUsageParams()
        const data = await load({
          res: 'usages',
          action: 'rpc',
          actionArgs: {
            methodname: 'getGeneralUsage',
            params,
          },
          resPath: 'data',
        })
        this.data = data
      } finally {
        this.loading = false
      }
    },
    handleEdit (val) {
      this.updateVisible(true)
    },
    updateVisible (val) {
      this.$emit('update:visible', val)
    },
    async handleSubmit () {
      try {
        const values = await this.form.fc.validateFields()
        this.form.fd = values
        this.$emit('update', this.options.i, values)
        this.updateVisible(false)
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.number-card-number, .number-card-unit {
  font-size: 36px;
  color: rgb(24, 144, 254) !important;
}
.drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
