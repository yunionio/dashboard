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
            <div class="label-unit">{{ $t('dashboard.text_195') }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{ usage.runing }}</div>
            <div class="label-unit">{{ $t('dashboard.text_2') }}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div class="label-unit">{{ $t('dashboard.text_196') }}</div>
            <div class="flex-number mr-1 ml-1 text-right">{{ usage.stoping }}</div>
            <div class="label-unit">{{ $t('dashboard.text_2') }}</div>
          </div>

          <div class="d-flex bottomborder-box align-items-end" :style="itemStyle">
            <div class="flex-shrink-0 flex-grow-0 label-unit">{{ $t('dashboard.text_197') }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{ usage.othor }}</div>
            <div class="label-unit">{{ $t('dashboard.text_2') }}</div>
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
        <tenant-config :fc="form.fc" :fd="form.fd" :decorators="decorators" @update:usage_key="setDefaultName" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import TenantConfig from '@Dashboard/sections/TenantConfig'
import { getRequestT } from '@/utils/utils'
import mixin from './mixin'

export default {
  name: 'RingServer',
  components: {
    BaseDrawer,
    TenantConfig,
  },
  mixins: [mixin],
  data () {
    const all_usage_key = this.$store.getters.isAdminMode ? 'all.servers' : this.$store.getters.isDomainMode ? 'domain.servers' : 'servers'
    const usage_key = this.$store.getters.isAdminMode ? 'all.running_servers' : this.$store.getters.isDomainMode ? 'domain.running_servers' : 'running_servers'
    const initialNameValue = ((this.params && this.params.type !== 'k8s') && this.params.name) || this.$t('usage')[usage_key]
    const initialCloudEnvValue = ((this.params && this.params.type !== 'k8s') && this.params.cloud_env) || ''
    const initialBrandValue = ((this.params && this.params.type !== 'k8s') && this.params.brand) || ''
    const initialRegionValue = ((this.params && this.params.type !== 'k8s') && this.params.region) || ''
    const initialAllUsageKeyValue = ((this.params && this.params.type !== 'k8s') && this.params.all_usage_key) || all_usage_key
    const initialRegionAccountType = ((this.params && this.params.type !== 'k8s') && this.params.regionAccountType) || 'region'
    const initialColorValue = ((this.params && this.params.type !== 'k8s') && this.params.color) || 'default'
    return {
      data: {},
      loading: false,
      manager: new this.$Manager('servers', 'v2'),
      usage: {},
      form: {
        fc: this.$form.createForm(this),
        fd: {
          name: initialNameValue,
          cloud_env: initialCloudEnvValue,
          brand: initialBrandValue,
          region: initialRegionValue,
          all_usage_key: initialAllUsageKeyValue,
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
        color: [
          'color',
          {
            initialValue: initialColorValue,
          },
        ],
      },
    }
  },
  computed: {
    itemStyle () {
      const ret = {}
      ret.margin = '10px 0'
      ret.padding = '3px 0'
      return ret
    },
    colorConfig () {
      return (this.params && this.params.color) || 'default'
    },
    percent () {
      return parseInt((this.usage.runing / this.usage.total) * 100)
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
  },
  methods: {
    refresh () {
      return this.fetchUsage()
    },
    async fetchUsage () {
      this.loading = true
      try {
        const params1 = {
          scope: this.$store.getters.scope,
          limit: 1,
          details: false,
          show_fail_reason: true,
          $t: getRequestT(),
          with_meta: true,
          status: 'running',
        }
        const params2 = {
          scope: this.$store.getters.scope,
          limit: 1,
          details: false,
          show_fail_reason: true,
          $t: getRequestT(),
          with_meta: true,
          status: 'deleting',
        }
        const params3 = {
          scope: this.$store.getters.scope,
          limit: 1,
          details: false,
          show_fail_reason: true,
          $t: getRequestT(),
          with_meta: true,
        }
        const data1 = await this.manager.list({ params: params1 })
        const data2 = await this.manager.list({ params: params2 })
        const data3 = await this.manager.list({ params: params3 })
        const runing = (data1.data && data1.data.total) || '0'
        const stoping = (data2.data && data2.data.total) || '0'
        const total = (data3.data && data3.data.total) || '0'
        const othor = total - runing - stoping
        this.usage = {
          runing: runing,
          stoping: stoping,
          othor: othor,
          total: total,
        }
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
  line-height: 19px;
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
