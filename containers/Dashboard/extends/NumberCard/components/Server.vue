<template>
  <div class="h-100 position-relative">
    <div class="dashboard-card-wrap">
      <div class="dashboard-card-header">
        <div class="dashboard-card-header-left" @click.alt="showDebuggerInfo = !showDebuggerInfo">{{ form.fd.name || $t('dashboard.text_6') }}
          <a-icon class="ml-2" type="loading" v-if="loading" />
          <a-tooltip v-if="isServersAnypool"><template slot="title">{{ $t('dashboard.server_tips') }}</template><icon type="help" /></a-tooltip>
        </div>
        <div class="dashboard-card-header-right">
          <span v-if="showDebuggerInfo">{{ `${$t('dashboard.text_20')}: ${form.fd.usage_key}` }}</span>
          <slot name="actions" :handle-edit="handleEdit" />
          <a class="ml-2" :style="{ color: isResDeny ? '#ccc' : '' }" v-if="!edit && canShowEdit && !isPageDeny" @click="goPage">
            <icon type="arrow-right" style="font-size:18px" />
          </a>
        </div>
      </div>
      <div class="dashboard-card-body d-flex align-items-center justify-content-center">
        <div class="d-flex">
          <div class="number-card-number mr-1">{{ this.usage.usage }}</div>
          <div class="number-card-unit">{{ this.usage.unit }}</div>
        </div>
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
        <a-form-item v-if="canShowUnitConfig" :label="$t('common_250')">
          <base-select
              v-decorator="decorators.unit"
              isDefaultSelect
              :filterable="true"
              :options="unitOpts"
              :select-props="{ placeholder: $t('common_618') }" />
        </a-form-item>
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import QuotaConfig from '@Dashboard/sections/QuotaConfig'
import { USAGE_CONFIG } from '@Dashboard/constants'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'
import routes from '@/router/routes'
import mixin from './mixin'

export default {
  name: 'NumberCardServer',
  components: {
    BaseDrawer,
    QuotaConfig,
  },
  mixins: [mixin],
  props: {
    parmas: Object,
    edit: Boolean,
  },
  data () {
    const usage_key = this.$store.getters.isAdminMode ? 'all.servers' : this.$store.getters.isDomainMode ? 'domain.servers' : 'servers'
    const initialUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.usage_key) || usage_key
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || this.$t('usage')[initialUsageKeyValue]
    const initialRegionAccountType = ((this.params && this.params.type !== 'k8s') && this.params.regionAccountType) || 'region'
    const initUnitValue = (this.params && this.params.unit) || 'auto'
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
        regionAccountType: [
          'regionAccountType',
          {
            initialValue: initialRegionAccountType,
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
        unit: [
          'unit',
          {
            initialValue: initUnitValue,
          },
        ],
      },
      showDebuggerInfo: false,
      unitOpts: [
        { id: 'auto', name: this.$t('common_563') },
        { id: 'K', name: 'KB' },
        { id: 'M', name: 'MB' },
        { id: 'G', name: 'GB' },
        { id: 'T', name: 'TB' },
      ],
      currentUsageKey: initialUsageKeyValue,
    }
  },
  computed: {
    ...mapGetters(['permission']),
    usage () {
      const usage = (this.data && this.data[this.form.fd.usage_key]) || 0
      const ret = {
        usage,
      }
      const config = USAGE_CONFIG[this.form.fd.usage_key]
      // 使用默认单位
      if (config && config.formatter) {
        const fVal = config.formatter(usage)
        const fValArr = fVal.split(' ')
        ret.usage = fValArr[0]
        ret.unit = fValArr[1]
      }
      if (config && config.unit) {
        ret.unit = config.unit
      }
      // 使用用户配置的单位
      if (config && config.userUnitFormatter) {
        if (this.params && this.params.unit && this.params.unit !== 'auto') {
          const fVal = config.userUnitFormatter(usage, this.params.unit)
          const fValArr = fVal.split(' ')
          ret.usage = fValArr[0]
          ret.unit = fValArr[1]
        }
      }
      return ret
    },
    isServersAnypool () {
      if (!this.params) return false
      return ['all.servers.any_pool', 'domain.servers.any_pool', 'servers.any_pool', 'all.servers', 'domain.servers', 'servers'].includes(this.params.usage_key)
    },
    canShowEdit () {
      if (!this.params) return false
      return this.getPageUrl()
    },
    canShowUnitConfig () {
      const config = USAGE_CONFIG[this.currentUsageKey]
      if (config && config.canUseUserUnit) {
        return true
      }
      return false
    },
    isResDeny () {
      const usage_key = this.params?.usage_key || ''
      if (usage_key.endsWith('servers')) {
        return !hasPermission({ key: 'servers_list', permissionData: this.permission })
      } else if (usage_key.endsWith('hosts') || usage_key.endsWith('baremetals')) {
        return !hasPermission({ key: 'hosts_list', permissionData: this.permission })
      } else if (usage_key.endsWith('isolated_devices')) {
        return !hasPermission({ key: 'isolated_devices_list', permissionData: this.permission })
      }
      return false
    },
    isPageDeny () {
      const path = this.getPageUrl()
      if (!path) return false
      const target = routes.filter(item => item.path === path)
      if (target.length && target[0].meta?.hidden) {
        return target[0].meta.hidden()
      }
      return false
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
    } else if (this.form.fd.usage_key) {
      this.$emit('update', this.options.i, this.form.fd)
      this.setDefaultName(this.form.fd.usage_key)
      this.refresh()
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
    goPage () {
      if (!this.params || this.isResDeny) return
      const path = this.getPageUrl()
      if (path) this.$router.push(path)
    },
    getPageUrl () {
      switch (this.params.usage_key) {
        case 'all.servers':
          return '/vminstance'
        case 'servers':
          return '/vminstance'
        case 'domain.servers':
          return '/vminstance'
        case 'baremetals':
          return '/physicalmachine'
        case 'domain.baremetals':
          return '/physicalmachine'
        case 'hosts':
          return '/host'
        case 'domain.hosts':
          return '/host'
        case 'all.buckets':
          return '/bucket'
        case 'domain.buckets':
          return '/bucket'
        case 'all.cache':
          return '/redis'
        case 'domain.cache':
          return '/redis'
        case 'all.rds':
          return '/rds'
        case 'domain.rds':
          return '/rds'
        case 'all.loadbalancer':
          return '/lb'
        case 'domain.loadbalancer':
          return '/lb'
        case 'all.eip.floating_ip':
          return '/eip'
        case 'domain.eip.floating_ip':
          return '/eip'
        case 'all.snapshot':
          return '/disk-snapshot'
        case 'domain.snapshot':
          return '/disk-snapshot'
        case 'all.disks.count':
          return '/disk'
        case 'domain.disks.count':
          return '/disk'
        case 'all.servers.isolated_devices':
          return '/gpu'
        case 'domain.servers.isolated_devices':
          return '/gpu'
        default:
          return ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
.number-card-number {
  font-size: 60px;
  line-height: 48px;
  color: #000000;
}
.number-card-unit {
  font-size: 14px;
  color: #000000;
  margin-left: 5px;
}
.drawer-wrapper {
  &::v-deep.ant-drawer.ant-drawer-open .ant-drawer-mask {
    animation: none;
  }
}
</style>
