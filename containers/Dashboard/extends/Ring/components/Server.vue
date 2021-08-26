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
          <template v-slot:format><span class="percent-tips" :style="{ color: '#000' }">{{ percentTips }}</span></template>
        </a-progress>
        <div class="flex-fill ml-4">
          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div class="label-unit">{{ useLabel }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{usage.usage}}</div>
            <div class="label-unit">{{usage.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div class="label-unit">{{ unUseLabel }}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.un_usage_tips')"><icon type="help" /></a-tooltip></div>
            <div class="flex-number mr-1 ml-1 text-right">{{displayUnUsage.usage}}</div>
            <div class="label-unit">{{displayUnUsage.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle" v-if="showReserved">
            <div class="flex-shrink-0 flex-grow-0 label-unit">{{$t('dashboard.text_182')}}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{reserved.usage}}</div>
            <div class="label-unit">{{reserved.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle" v-if="showGpuReserved">
            <div class="flex-shrink-0 flex-grow-0 label-unit">
              {{$t('dashboard.text_183')}}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.gpu_reserved_tips')"><icon type="help" /></a-tooltip>
            </div>
            <div class="flex-number mr-2 ml-1 text-right">{{gpuReserved.usage}}</div>
            <div  class="label-unit">{{gpuReserved.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div class="label-unit">{{ $t('dashboard.text_181') }}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.all_usage_tips')"><icon type="help" /></a-tooltip></div>
            <div class="flex-number mr-2 ml-1 text-right">{{allUsage.usage}}</div>
            <div class="label-unit">{{allUsage.unit}}</div>
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
    itemStyle () {
      const ret = {}
      if (this.showReserved || this.showGpuReserved) {
        ret.margin = '0'
      }
      if (this.showGpuReserved && this.showReserved) {
        ret.padding = '3px 0'
      }
      return ret
    },
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
        ret = `${ret} ${this.allUsageConfig.unit}`
      }
      return {
        usage: ret.toString().split(' ')[0],
        unit: ret.toString().split(' ')[1] || '',
      }
    },
    usage () {
      let ret = this.usageNumber
      if (this.usageConfig && this.usageConfig.formatter) {
        ret = this.usageConfig.formatter(ret)
      }
      if (this.usageConfig && this.usageConfig.unit) {
        ret = `${ret} ${this.usageConfig.unit}`
      }
      return {
        usage: ret.toString().split(' ')[0],
        unit: ret.toString().split(' ')[1] || '',
      }
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
        ret = `${ret} ${this.usageConfig.unit}`
      }
      return {
        usage: ret.toString().split(' ')[0],
        unit: ret.toString().split(' ')[1] || this.usage.unit,
      }
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
      if (this.showReserved) {
        const reserved = sizestrWithUnit(this.data['hosts.memory.reserved'], 'M', 1024)
        return {
          usage: reserved.toString().split(' ')[0],
          unit: reserved.toString().split(' ')[1],
        }
      }
      return '-'
    },
    gpuReserved () {
      let gpuReserved = ''
      if (this.form.fd.all_usage_key === 'hosts.memory.total') {
        gpuReserved = sizestrWithUnit(this.data['hosts.memory.reserved.isolated'], 'M', 1024)
      } else if (this.form.fd.all_usage_key === 'hosts.cpu.total') {
        gpuReserved = `${this.data['hosts.cpu.reserved.isolated'] || 0} ${this.usageConfig.unit}`
      } if (this.form.fd.all_usage_key === 'storages') {
        gpuReserved = sizestrWithUnit(this.data['hosts.storage.reserved.isolated'], 'M', 1024)
      }
      return gpuReserved && {
        usage: gpuReserved.toString().split(' ')[0],
        unit: gpuReserved.toString().split(' ')[1],
      }
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
.flex-number{
  font-size: 18px;
  line-height: 20px;
  flex: 1 1 auto;
  color: #000;
  font-weight: bold;
}
.label-unit{
  color: #837F89;
}
.percent-tips {
  font-size: 22px;
  font-weight: bold;
}
.ring-drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
.bottomborder-box{
  border-bottom: 1px dotted #E4E4E4;
  margin: 10px 0;
  padding: 5px 0;
}
</style>
