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
          <div class="d-flex bottomborder-box align-items-end">
            <div>{{ useLabel }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{usage.usage}}</div>
            <div>{{ usage.unit }}</div>
          </div>
          <div class="d-flex bottomborder-box align-items-end">
            <div>{{ unUseLabel }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{displayUnUsage.usage}}</div>
            <div>{{displayUnUsage.unit}}</div>
          </div>
          <div class="d-flex bottomborder-box align-items-end">
            <div>{{ $t('dashboard.text_44') }}</div>
            <div class="flex-number mr-2 ml-1 text-right">{{allUsage.usage}}</div>
            <div>{{allUsage.unit}}</div>
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
        <k8s-config :fc="form.fc" :fd="form.fd" :decorators="decorators" />
      </a-form>
    </base-drawer>
  </div>
</template>

<script>
import _ from 'lodash'
import mixin from './mixin'
import BaseDrawer from '@Dashboard/components/BaseDrawer'
import { K8S_USAGE_CONFIG } from '@Dashboard/constants'
import { load } from '@Dashboard/utils/cache'
import { getRequestT } from '@/utils/utils'
import K8sConfig from '@Dashboard/sections/K8sConfig'

export default {
  name: 'RingK8s',
  components: {
    BaseDrawer,
    K8sConfig,
  },
  mixins: [mixin],
  data () {
    const initialNameValue = ((this.params && this.params.type === 'k8s') && this.params.name) || this.$t('dashboard.text_45')
    const initialAllUsageKeyValue = ((this.params && this.params.type === 'k8s') && this.params.all_usage_key) || 'all.cluster.node.memory.capacity'
    const initialUsageKeyValue = ((this.params && this.params.type === 'k8s') && this.params.usage_key) || 'all.cluster.node.memory.request'
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
      return (this.data && _.get(this.data, this.form.fd.all_usage_key)) || 0
    },
    usageNumber () {
      return (this.data && _.get(this.data, this.form.fd.usage_key)) || 0
    },
    allUsageConfig () {
      return K8S_USAGE_CONFIG[this.form.fd.all_usage_key]
    },
    usageConfig () {
      return K8S_USAGE_CONFIG[this.form.fd.usage_key]
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
      // if (this.percent < 80) {
      //   return '#52c41a'
      // }
      // if (this.percent < 100) {
      //   return '#faad14'
      // }
      // return '#f5222d'
      return '#1890ff'
    },
    status () {
      let ret = 'normal'
      if (this.percent > 100) {
        ret = 'exception'
      }
      return ret
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
    // if (this.params && this.params.type === 'k8s') {
    //   this.form.fd = this.params
    // }
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
      return params
    },
    async fetchUsage () {
      this.loading = true
      try {
        const params = this.genUsageParams()
        const data = await load({
          res: 'usages',
          actionArgs: {
            url: '/v2/rpc/usages/k8s-usage',
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
        this.$emit('update', this.options.i, { type: 'k8s', ...values })
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
}
.percent-tips {
  font-size: 18px;
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
