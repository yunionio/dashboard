<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">{{ form.fd.name || $t('dashboard.text_6') }}<a-icon class="ml-2" type="loading" v-if="loading" /></div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <a-progress type="circle" :percent="percent" :strokeWidth="12" :status="status" :strokeColor="percentColor">
          <template v-slot:format><span class="percent-tips" :style="{ color: percentColor }">{{ percentTips }}</span></template>
        </a-progress>
        <div class="flex-fill ml-4">
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">{{$t('dashboard.text_43')}}</div>
            <div class="ml-2 flex-fill text-right">{{ this.usage }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">{{$t('dashboard.text_34')}}</div>
            <div class="ml-2 flex-fill text-right">{{ this.displayUnUsage }}</div>
          </div>
          <div v-if="showReserved" class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">{{$t('common_586')}}</div>
            <div class="ml-2 flex-fill text-right">{{ this.reserved }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">{{$t('dashboard.text_181')}}</div>
            <div class="ml-2 flex-fill text-right">{{ this.allUsage }}</div>
          </div>
        </div>
      </div>
    </div>
    <base-drawer class="ring-drawer-wrapper" @update:visible="updateVisible" :visible="visible" :title="$t('dashboard.text_5')" @ok="handleSubmit">
      <slot />
      <a-form
        hideRequiredMark
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dashboard.text_6')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <quota-config :fc="form.fc" :decorators="decorators" />
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
import { getRequestT, sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'ProjectQuotaRegion',
  components: {
    BaseDrawer,
    QuotaConfig,
  },
  mixins: [mixin],
  data () {
    const initialNameValue = ((this.params && this.params.type === 'project-quota-region') && this.params.name) || this.$t('dashboard.text_46')
    const initialCloudEnvValue = ((this.params && this.params.type === 'project-quota-region') && this.params.cloud_env) || 'onpremise'
    const initialBrandValue = ((this.params && this.params.type === 'project-quota-region') && this.params.brand) || 'OneCloud'
    const initialRegionValue = ((this.params && this.params.type === 'project-quota-region') && this.params.region) || 'default'
    const initialAllUsageKeyValue = ((this.params && this.params.type === 'project-quota-region') && this.params.all_usage_key) || 'hosts.memory'
    const initialUsageKeyValue = ((this.params && this.params.type === 'project-quota-region') && this.params.usage_key) || 'all.servers.memory'
    return {
      data: {},
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          cloud_env: initialCloudEnvValue,
          brand: initialBrandValue,
          region: initialRegionValue,
          all_usage_key: initialAllUsageKeyValue,
          usage_key: initialUsageKeyValue,
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
        region: [
          'region',
          {
            initialValue: initialRegionValue,
          },
        ],
        account: [
          'account',
          {
            initialValue: this.params && this.params.account,
          },
        ],
        all_usage_key: [
          'all_usage_key',
          {
            initialValue: initialAllUsageKeyValue,
            rules: [
              { required: true, message: this.$t('dashboard.text_22') },
            ],
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
    }
  },
  computed: {
    allUsageNumber () {
      return (this.data && this.data[this.form.fd.all_usage_key]) || 0
    },
    usageNumber () {
      return (this.data && this.data[this.form.fd.usage_key]) || 0
    },
    allUsageConfig () {
      return USAGE_CONFIG[this.form.fd.all_usage_key]
    },
    usageConfig () {
      return USAGE_CONFIG[this.form.fd.usage_key]
    },
    allUsage () {
      let ret = this.allUsageNumber
      if (this.allUsageConfig && this.allUsageConfig.formatter) {
        ret = this.allUsageConfig.formatter(ret)
      }
      if (this.allUsageConfig && this.allUsageConfig.unit) {
        ret = `${ret}${this.allUsageConfig.unit}`
      }
      return ret
    },
    usage () {
      let ret = this.usageNumber
      if (this.usageConfig && this.usageConfig.formatter) {
        ret = this.usageConfig.formatter(ret)
      }
      if (this.usageConfig && this.usageConfig.unit) {
        ret = `${ret}${this.usageConfig.unit}`
      }
      return ret
    },
    unUsage () {
      const ret = this.allUsageNumber - this.usageNumber
      return ret < 0 ? 0 : ret
    },
    displayUnUsage () {
      let ret = this.unUsage
      if (
        (this.allUsageConfig && this.allUsageConfig.formatter) &&
        (this.usageConfig && this.usageConfig.formatter)
      ) {
        ret = this.usageConfig.formatter(this.unUsage)
      }
      if (
        (this.allUsageConfig && this.allUsageConfig.unit) &&
        (this.usageConfig && this.usageConfig.unit)
      ) {
        ret = `${ret}${this.usageConfig.unit}`
      }
      return ret
    },
    percent () {
      if (this.usageNumber === 0 || this.allUsageNumber === 0) return 0
      return parseInt((this.usageNumber / this.allUsageNumber) * 100)
    },
    percentTips () {
      return `${this.percent} %`
    },
    percentColor () {
      if (this.percent < 80) {
        return '#52c41a'
      }
      if (this.percent < 100) {
        return '#faad14'
      }
      return '#f5222d'
    },
    status () {
      let ret = 'normal'
      if (this.percent > 100) {
        ret = 'exception'
      }
      return ret
    },
    showReserved () {
      return this.form.fd.usage_key === 'all.servers.memory' && this.form.fd.all_usage_key === 'hosts.memory'
    },
    reserved () {
      return this.showReserved && sizestrWithUnit(this.data['hosts.memory.reserved'], 'M', 1024)
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
    if (this.params && this.params.type === 'project-quota-region') {
      this.form.fd = this.params
    }
    this.$emit('update', this.options.i, this.form.fd)
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
          actionArgs: {
            url: '/v2/rpc/usages/general-usage',
            method: 'GET',
            params,
          },
          useManager: false,
          resPath: 'data',
        })
        this.data = data
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
.percent-tips {
  font-size: 18px;
}
.ring-drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
