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
            <div class="flex-shrink-0 flex-grow-0">{{ useLabel }}</div>
            <div class="ml-2 flex-fill text-right">{{ this.usage }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">
              {{unUseLabel}}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.un_usage_tips')"><a-icon type="question-circle" /></a-tooltip>
            </div>
            <div class="ml-2 flex-fill text-right">{{ this.displayUnUsage }}</div>
          </div>
          <div class="d-flex" v-if="showReserved">
            <div class="flex-shrink-0 flex-grow-0">{{$t('dashboard.text_182')}}</div>
            <div class="ml-2 flex-fill text-right">{{ this.reserved }}</div>
          </div>
          <div class="d-flex" v-if="showGpuReserved">
            <div class="flex-shrink-0 flex-grow-0">
              {{$t('dashboard.text_183')}}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.gpu_reserved_tips')"><a-icon type="question-circle" /></a-tooltip>
            </div>
            <div class="ml-2 flex-fill text-right">{{ this.gpuReserved }}</div>
          </div>
          <div class="d-flex">
            <div class="flex-shrink-0 flex-grow-0">
              {{$t('dashboard.text_181')}}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.all_usage_tips')"><a-icon type="question-circle" /></a-tooltip>
            </div>
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
        <quota-config :fc="form.fc" :fd="form.fd" :decorators="decorators" />
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
  name: 'RingServer',
  components: {
    BaseDrawer,
    QuotaConfig,
  },
  mixins: [mixin],
  data () {
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || this.$t('dashboard.text_46')
    const initialCloudEnvValue = ((this.params && this.params.type !== 'k8s') && this.params.cloud_env) || ''
    const initialBrandValue = ((this.params && this.params.type !== 'k8s') && this.params.brand) || ''
    const initialRegionValue = ((this.params && this.params.type !== 'k8s') && this.params.region) || ''
    const initialAllUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.all_usage_key) || ''
    const initialUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_key) || ''
    const initialRegionAccountType = ((this.params && this.params.type !== 'k8s') && this.params.regionAccountType) || 'region'
    const initialColorValue = ((this.params && this.params.type !== 'k8s') && this.params.color) || 'default'
    const initialUsageLabelValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_label && this.params.usage_label.length > 0) ? this.params.usage_label : this.$t('dashboard.text_33')
    const initialUnUsageLabelValue = ((this.params && this.params.type !== 'k8s') && this.params.un_usage_label && this.params.un_usage_label.length > 0) ? this.params.un_usage_label : this.$t('dashboard.text_34')
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
          usage_label: initialUsageLabelValue,
          un_usage_label: initialUnUsageLabelValue,
          color: initialColorValue,
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
        regionAccountType: [
          'regionAccountType',
          {
            initialValue: initialRegionAccountType,
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
        color: [
          'color',
          {
            initialValue: initialColorValue,
          },
        ],
        usage_label: [
          'usage_label',
          {
            initialValue: initialUsageLabelValue,
            rules: [
              { required: true, message: this.$t('dashboard.usage_label_title') },
            ],
          },
        ],
        un_usage_label: [
          'un_usage_label',
          {
            initialValue: initialUnUsageLabelValue,
            rules: [
              { required: true, message: this.$t('dashboard.un_usage_label_title') },
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
    colorConfig () {
      return (this.params && this.params.color) || 'default'
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
      switch (this.colorConfig) {
        case 'reverse':
          if (this.percent < 60) {
            return '#f5222d'
          }
          if (this.percent < 80) {
            return '#faad14'
          }
          return '#52c41a'
        default:
          if (this.percent < 60) {
            return '#52c41a'
          }
          if (this.percent < 80) {
            return '#faad14'
          }
          return '#f5222d'
      }
    },
    status () {
      let ret = 'normal'
      if (this.percent > 100) {
        ret = 'exception'
      }
      return ret
    },
    showReserved () {
      return this.form.fd.usage_key === 'all.servers.memory' && this.form.fd.all_usage_key === 'hosts.memory.total'
    },
    showGpuReserved () {
      const isMemory = this.form.fd.usage_key === 'all.servers.memory' && this.form.fd.all_usage_key === 'hosts.memory.total'
      const isCpu = this.form.fd.usage_key === 'all.servers.cpu' && this.form.fd.all_usage_key === 'hosts.cpu.total'
      const isStorage = this.form.fd.usage_key === 'all.servers.disk' && this.form.fd.all_usage_key === 'storages'
      return isMemory || isCpu || isStorage
    },
    reserved () {
      return this.showReserved && sizestrWithUnit(this.data['hosts.memory.reserved'], 'M', 1024)
    },
    gpuReserved () {
      if (this.form.fd.all_usage_key === 'hosts.memory.total') {
        return sizestrWithUnit(this.data['hosts.memory.reserved.isolated'], 'M', 1024)
      } else if (this.form.fd.all_usage_key === 'hosts.cpu.total') {
        return `${this.data['hosts.cpu.reserved.isolated'] || 0}${this.usageConfig.unit}`
      } if (this.form.fd.all_usage_key === 'storages') {
        return sizestrWithUnit(this.data['hosts.storage.reserved.isolated'], 'M', 1024)
      }
      return '-'
    },
    showTips () {
      const keyTips = ['hosts.memory.total', 'hosts.cpu.total', 'storages']
      return keyTips.includes(this.form.fd.all_usage_key)
    },
    useLabel () {
      if (this.params) {
        return this.params.usage_label || this.$t('dashboard.text_43')
      }
      return this.$t('dashboard.text_43')
    },
    unUseLabel () {
      if (this.params) {
        return this.params.un_usage_label || this.$t('dashboard.text_34')
      }
      return this.$t('dashboard.text_34')
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
    // this.$emit('update', this.options.i, this.form.fd)
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
      if (fd.region) {
        params.range_type = 'cloudregions'
        params.range_id = fd.region
      }
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
