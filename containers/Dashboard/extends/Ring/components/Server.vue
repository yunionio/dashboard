<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left">
          {{ form.fd.name || $t('dashboard.text_6') }}<a-icon class="ml-2" type="loading" v-if="loading" />
          <span v-if="isResDeny" class="ml-2"><a-icon class="warning-color mr-1" type="warning" />{{ $t('common.permission.403') }}</span>
          <span v-if="isUsageKeyDeny" class="ml-2">
            <a-tooltip class="mr-2"><template slot="title">{{ $t('dashboard.usage_key_deny_tips') }}</template><icon type="help" /></a-tooltip>
            <a-icon class="warning-color mr-1" type="warning" />
            {{ $t('dashboard.usage_key_deny_tips_2') }}
          </span>
        </div>
        <div class="dashboard-card-header-right">
          <slot name="actions" :handle-edit="handleEdit" />
        </div>
      </div>
      <div class="dashboard-card-body align-items-center">
        <a-progress v-if="isRing" type="circle" :percent="percent" :strokeWidth="12" :status="status" :strokeColor="percentColor">
          <template v-slot:format><span class="percent-tips" :style="{ color: '#000' }">{{ percentTips }}</span></template>
        </a-progress>
        <liquid-fill v-else :value="decimalPercent" />
        <div class="flex-fill ml-4">
          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div :class="`label-unit ${jumpParams.usedPath ? 'label-jump' : ''}`" @click="goJump('used')">{{ useLabel }}</div>
            <div class="flex-number mr-1 ml-1 text-right">{{isResDeny ? '-' : usage.usage}}</div>
            <div class="label-unit">{{usage.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div :class="`label-unit ${jumpParams.reservedPath ? 'label-jump' : ''}`" @click="goJump('reserved')">{{ unUseLabel }}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.un_usage_tips')"><icon type="help" /></a-tooltip></div>
            <div class="flex-number mr-1 ml-1 text-right">{{isResDeny ? '-' : displayUnUsage.usage}}</div>
            <div class="label-unit">{{displayUnUsage.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle" v-if="showReserved">
            <div :class="`flex-shrink-0 flex-grow-0 label-unit ${jumpParams.reservedPath ? 'label-jump' : ''}`" @click="goJump('reserved')">{{$t('dashboard.text_182')}}</div>
            <div class="flex-number mr-1 ml-1 text-right">{{isResDeny ? '-' : reserved.usage}}</div>
            <div class="label-unit">{{reserved.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle" v-if="showGpuReserved">
            <div :class="`flex-shrink-0 flex-grow-0 label-unit ${jumpParams.reservedPath ? 'label-jump' : ''}`" @click="goJump('reserved')">
              {{$t('dashboard.text_183')}}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.gpu_reserved_tips')"><icon type="help" /></a-tooltip>
            </div>
            <div class="flex-number mr-1 ml-1 text-right">{{isResDeny ? '-' : gpuReserved.usage}}</div>
            <div  class="label-unit">{{gpuReserved.unit}}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div :class="`label-unit ${jumpParams.allPath ? 'label-jump' : ''}`" @click="goJump('all')">{{ $t('dashboard.text_181') }}<a-tooltip v-if="showTips" class="ml-1" :title="$t('dashboard.all_usage_tips')"><icon type="help" /></a-tooltip></div>
            <div class="flex-number mr-1 ml-1 text-right">{{isResDeny ? '-' : allUsage.usage}}</div>
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
        <quota-config :fc="form.fc" :fd="form.fd" :decorators="decorators" @update:usage_key="setDefaultName" />
        <a-form-item :label="$t('dashboard.chart_type')">
          <a-radio-group v-decorator="decorators.chart_type">
            <a-radio-button value="ring">{{ $t('dashboard.ring') }}</a-radio-button>
            <a-radio-button value="liquidfill">{{ $t('dashboard.liquidfill') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="isRing" :label="colorLabel || $t('dashboard.color.scheme')" class="mb-0">
          <a-select
            @change="colorChange"
            v-decorator="decorators.color">
            <a-select-option v-for="item in ringColors" :key="item.key" :value="item.key">
              <div>
                <a-progress :show-info="false" :stroke-color="{ '60%': item.percent60, '80%': item.percent80, '100%': item.percent100}" :percent="100" />
              </div>
              <div class="text-color-help">{{ item.label }}</div>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import QuotaConfig from '@Dashboard/sections/QuotaConfig'
import { USAGE_CONFIG, getTargetRangeUsageKey } from '@Dashboard/constants'
import { load } from '@Dashboard/utils/cache'
import { getRequestT, sizestrWithUnit } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'
import { numerify } from '@/filters'
import { chartColors } from '@/constants'
import mixin from './mixin'

export default {
  name: 'RingServer',
  components: {
    BaseDrawer,
    QuotaConfig,
  },
  mixins: [mixin],
  props: {
    dataRangeParams: {
      type: Object,
    },
  },
  data () {
    const all_usage_key = this.$store.getters.isAdminMode ? 'all.servers' : this.$store.getters.isDomainMode ? 'domain.servers' : 'servers'
    const usage_key = this.$store.getters.isAdminMode ? 'all.running_servers' : this.$store.getters.isDomainMode ? 'domain.running_servers' : 'running_servers'
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || this.$t('usage')[usage_key]
    const initialCloudEnvValue = ((this.params && this.params.type !== 'k8s') && this.params.cloud_env) || ''
    const initialBrandValue = ((this.params && this.params.type !== 'k8s') && this.params.brand) || ''
    const initialRegionValue = ((this.params && this.params.type !== 'k8s') && this.params.region) || ''
    const initialAllUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.all_usage_key) || all_usage_key
    const initialUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_key) || usage_key
    const initialRegionAccountType = ((this.params && this.params.type !== 'k8s') && this.params.regionAccountType) || 'region'
    const initialColorValue = ((this.params && this.params.type !== 'k8s') && this.params.color) || 'default'
    const initialUsageLabelValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_label && this.params.usage_label.length > 0) ? this.params.usage_label : this.$t('dashboard.text_33')
    const initialUnUsageLabelValue = ((this.params && this.params.type !== 'k8s') && this.params.un_usage_label && this.params.un_usage_label.length > 0) ? this.params.un_usage_label : this.$t('dashboard.text_34')
    const initialChartTypeValue = ((this.params && this.params.type !== 'k8s') && this.params.chart_type) || 'liquidfill'
    return {
      data: {},
      loading: false,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
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
          chart_type: initialChartTypeValue,
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
        chart_type: [
          'chart_type',
          {
            initialValue: initialChartTypeValue,
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['permission', 'scope', 'isAdminMode', 'isDomainMode']),
    isUsageKeyDeny () {
      const usageConfig = getTargetRangeUsageKey(this.form.fd.usage_key, this.scope, this.dataRangeParams?.scope)
      const allUsageConfig = getTargetRangeUsageKey(this.form.fd.all_usage_key, this.scope, this.dataRangeParams?.scope)
      if (usageConfig.error || usageConfig.usageKey === 'null' || !usageConfig.usageKey || allUsageConfig.error || allUsageConfig.usageKey === 'null' || !allUsageConfig.usageKey) {
        return true
      }
      return false
    },
    isRing () {
      return this.form.fd.chart_type === 'ring'
    },
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
      const usageKey = getTargetRangeUsageKey(this.form.fd.all_usage_key, this.scope, this.dataRangeParams?.scope).usageKey
      if (!usageKey || usageKey === 'null') {
        return 0
      }
      return (this.data && this.data[usageKey]) || 0
    },
    usageNumber () {
      const usageKey = getTargetRangeUsageKey(this.form.fd.usage_key, this.scope, this.dataRangeParams?.scope).usageKey
      if (!usageKey || usageKey === 'null') {
        return 0
      }
      return (this.data && this.data[usageKey]) || 0
    },
    allUsageConfig () {
      return USAGE_CONFIG[this.form.fd.all_usage_key]
    },
    usageConfig () {
      return USAGE_CONFIG[this.form.fd.usage_key]
    },
    colorConfig () {
      return (this.params && this.params.color) || 'blue'
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
    decimalPercent () {
      if (this.isResDeny) return '0'
      if (this.usageNumber === 0 || this.allUsageNumber === 0) return '0'
      const percent = this.usageNumber / this.allUsageNumber
      if (percent > 0 && percent < 0.01) {
        return '0.004'
      }
      return numerify(this.usageNumber / this.allUsageNumber, '0.0000')
    },
    percent () {
      if (this.isResDeny) return '0'
      const data = parseFloat(this.decimalPercent)
      if (data > 0 && data < 0.01) {
        return 0.4
      }
      return data * 100
    },
    percentTips () {
      if (this.percent === 0) return '0%'
      if (this.percent < 1) {
        return '< 1%'
      }
      if (this.percent > 99 && this.percent < 100) {
        return '> 99%'
      }
      return `${numerify(this.percent, 0.0)} %`
    },
    percentColor () {
      switch (this.colorConfig) {
        case 'default':
          if (this.percent < 60) {
            return chartColors[3]
          }
          if (this.percent < 80) {
            return chartColors[1]
          }
          return chartColors[2]
        case 'reverse':
          if (this.percent < 60) {
            return chartColors[2]
          }
          if (this.percent < 80) {
            return chartColors[1]
          }
          return chartColors[3]
        default:
          return chartColors[0]
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
    isResDeny () {
      const usage_key = this.params?.all_usage_key || ''

      if (usage_key.endsWith('servers')) {
        return !hasPermission({ key: 'servers_list', permissionData: this.permission })
      } else if (usage_key.endsWith('disks.count')) {
        return !hasPermission({ key: 'disks_list', permissionData: this.permission })
      } else if (usage_key.endsWith('ports')) {
        return !hasPermission({ key: 'networks_list', permissionData: this.permission })
      } else if (usage_key.endsWith('eip.floating_ip')) {
        return !hasPermission({ key: 'eips_list', permissionData: this.permission })
      }
      return !hasPermission({ key: 'compute_usages_get' })
    },
    isCanJump () {
      return {
        all: true,
        used: true,
        reserved: true,
      }
    },
    jumpParams () {
      const params = this.parseUsageKey(this.form.fd.all_usage_key || '', this.form.fd.usage_key || '')
      return params
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
    'dataRangeParams.scope': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
    'dataRangeParams.domain': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
    'dataRangeParams.project': {
      handler (val) {
        this.fetchUsage()
      },
      immediate: true,
    },
  },
  created () {
    if (this.params && this.params.type !== 'k8s') {
      this.form.fd = { chart_type: 'ring', ...this.params }
    } else if (this.form.fd.usage_key) {
      this.$emit('update', this.options.i, this.form.fd)
      this.setDefaultName(this.form.fd.usage_key)
      this.refresh()
    }
  },
  methods: {
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
    colorChange (color) {
      this.$emit('update:color', color)
    },
    refresh () {
      return this.fetchUsage()
    },
    genUsageParams () {
      const params = {
        scope: this.$store.getters.scope,
        $t: getRequestT(),
        ignoreErrorStatusCode: [403],
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
      if (this.isResDeny) return
      this.loading = true
      try {
        const params = this.genUsageParams()
        if (this.isAdminMode) {
          if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain) {
            params.scope = 'domain'
            params.domain_id = this.dataRangeParams?.domain
          }
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.scope = 'project'
            params.project_id = this.dataRangeParams?.project
          }
        }
        if (this.isDomainMode) {
          if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project) {
            params.scope = 'project'
            params.project_id = this.dataRangeParams?.project
          }
        }
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
    parseUsageKey (allKey, usageKey) {
      const str = allKey.replace(/^(all\.)|(domain\.)|(project\.)/, '')
      const list = str.split('.')
      const allFilterKey = list[1]
      const allFilterValue = list[2]
      const usageStr = usageKey.replace(/^(all\.)|(domain\.)|(project\.)/, '')
      const usageList = usageStr.split('.')
      const usageResource = usageList[0]
      const usageFilterKey = usageList[1]
      const usageFilterValue = usageList[2]
      // const usageFilterValue = usageList[2]
      let allPath = ''
      let usedPath = ''
      let reservedPath = ''
      const allParams = {}
      const usedParams = {}
      const reservedParams = {}
      switch (list[0]) {
        case 'servers':
          allPath = '/vminstance'
          usedPath = '/vminstance'
          // reservedPath = '/vminstance'
          // allParams.status = ['running', 'ready']
          if (usageResource === 'running_servers') {
            usedParams.status = ['running']
            // reservedParams.status = ['ready']
          } else if (usageResource === 'ready_servers') {
            usedParams.status = ['ready']
            // reservedParams.status = ['running']
          } else if (usageResource === 'pending_delete_servers') {
            usedPath = '/serverrecovery'
            reservedPath = '/vminstance'
            // reservedParams.status = ['running', 'ready']
          }
          break
        case 'disks':
          allPath = '/disk'
          usedPath = '/disk'
          reservedPath = '/disk'
          if (usageFilterKey === 'mounted') {
            usedParams.unused = false
            reservedParams.unused = true
          } else if (usageFilterKey === 'unmounted') {
            usedParams.unused = true
            reservedParams.unused = false
          }
          break
        case 'storages':
          if (allFilterKey === 'medium_type') {
            allPath = '/disk'
            usedPath = '/disk'
            reservedPath = '/disk'
            allParams.medium_type = allFilterValue
            usedParams.medium_type = allFilterValue
            reservedParams.medium_type = allFilterValue
            reservedParams.unused = true
            allParams.unused = false
            usedParams.unused = false
          }
          break
        case 'eip':
          allPath = '/eip'
          usedPath = '/eip'
          reservedPath = '/eip'
          if (usageFilterKey === 'floating_ip' && usageFilterValue === 'used') {
            usedParams.is_associated = true
            reservedParams.is_associated = false
          }
          break
          // case 'ports':
          //   allPath = '/network2'
          //   break
        case 'hosts':
          allPath = '/host'
          usedPath = '/host'
          reservedPath = '/host'
          if (usageResource === 'enabled_hosts') {
            usedParams.enabled = true
            reservedParams.enabled = false
          }
          break
        // case 'baremetals':
        //   allPath = '/baremetal'
        //   usedPath = '/vminstance'
        case 'isolated_devices':
          allPath = '/gpu'
          usedPath = '/gpu'
          reservedPath = '/gpu'
          if (usageResource === 'servers' && usageFilterKey === 'isolated_devices') {
            usedParams.is_associated = true
            reservedParams.is_associated = false
          }
          break
        // case 'imgiso':
        //   path = ''
      }
      return {
        allPath,
        allParams,
        usedPath,
        usedParams,
        reservedPath,
        reservedParams,
      }
    },
    goJump (type) {
      this.$router.push({
        path: this.jumpParams[`${type}Path`],
        query: this.jumpParams[`${type}Params`],
      })
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
  font-size: 15px;
  line-height: 21px;
  flex: 1 1 auto;
  color: #000;
  font-weight: 600;
}
.label-unit{
  color: #666666;
}
.label-jump{
  color: var(--antd-wave-shadow-color);
  cursor: pointer;
}
.percent-tips {
  font-size: 20px;
  // font-weight: bold;
}
.ring-drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
.bottomborder-box{
  border-bottom: 1px solid #F2F2F2;
  margin: 10px 0;
  padding: 5px 0;
}
</style>
