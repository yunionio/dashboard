<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || '磁贴名称' }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right"><slot name="actions" :handle-edit="handleEdit" /></div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <div class="number-card-number mr-2">{{ this.usage.usage }}</div>
        <div class="number-card-unit">{{ this.usage.unit }}</div>
      </div>
    </div>
    <base-drawer class="drawer-wrapper" @update:visible="updateVisible" :visible="visible" title="配置磁贴" @ok="handleSubmit" @cancel="cancel">
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <slot />
        <a-form-item label="磁贴名称">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <quota-config :fc="form.fc" :decorators="decorators" usage-label="指标" @update:usage_key="setDefaultName" />
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
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || `当前${this.$t('dictionary.project')}${this.$t('dictionary.server')}`
    const initialUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_key) || 'server'
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
              { required: true, message: '请输入磁贴名称' },
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
              { required: true, message: '请选择指标' },
            ],
          },
        ],
      },
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

<style lang="scss" scoped>
.number-card-number, .number-card-unit {
  font-size: 36px;
  color: #1890ff;
}
.drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
