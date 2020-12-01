<template>
  <div>
    <a-form-item :label="label" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
        <a-radio-button
          v-for="item of types"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('compute.text_1359')" v-if="isNew && (cloudEnv === 'idc' || cloudEnv === 'onpremise')" v-bind="formItemLayout">
      <a-select v-decorator="decorators.bgp_type">
        <a-select-option v-for="item in bgpTypeOptions" :value="item" :key="item">{{ item === '' ? $t('compute.text_1352') : item }}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :label="$t('compute.text_1360')" v-if="isNew" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.charge_type" @change="handleChargeTypeChange">
        <a-radio-button
          v-for="item of chargeTypes"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item :label="$t('compute.text_1186')" v-if="isNew" v-bind="formItemLayout">
      <div class="d-flex">
        <a-tooltip placement="top" :title="$t('compute.text_1324', [maxBindWidth])">
          <a-input-number
            :min="1"
            :max="maxBindWidth"
            :step="1"
            :formatter="format"
            :parse="format"
            v-decorator="decorators.bandwidth" />
            Mbps
          </a-tooltip>
      </div>
    </a-form-item>
    <a-form-item :label="$t('compute.text_107')" v-if="isBind" v-bind="formItemLayout">
      <base-select
        remote
        v-decorator="decorators.eip"
        resource="eips"
        :params="params"
        :showSync="true"
        :select-props="{ allowClear: true, placeholder: $t('compute.text_145') }" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { EIP_TYPES_MAP as types } from '@Compute/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import i18n from '@/locales'

const chargeTypes = {
  traffic: {
    key: 'traffic',
    label: i18n.t('compute.text_20'),
  },
  bandwidth: {
    key: 'bandwidth',
    label: i18n.t('compute.text_21'),
  },
}

export default {
  name: 'EipConfig',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    eipParams: Object,
    hypervisor: String,
    hiddenNoneType: Boolean,
    cloudEnv: String,
    form: {
      type: Object,
    },
    formItemLayout: {
      type: Object,
      default: () => ({
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      }),
    },
    showBind: {
      type: Boolean,
      default: true,
    },
    hasPublicIp: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      type: this.decorators.type[1] && this.decorators.type[1].initialValue,
      chargeType: this.decorators.charge_type[1] && this.decorators.charge_type[1].initialValue,
      bgpTypeOptions: [],
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isPrivateEnv () {
      const privateHyper = []
      for (const key in typeClouds.hypervisorMap) {
        if (typeClouds.hypervisorMap[key].env === 'private') {
          privateHyper.push(typeClouds.hypervisorMap[key].hypervisor)
        }
      }
      return privateHyper.includes(this.hypervisor)
    },
    types () {
      const ret = { ...types }
      if (!this.showBind) { // 主机创建不支持绑定已有EIP
        delete ret.bind
      }
      // 私有云不支持新建
      if (this.isPrivateEnv) {
        delete ret.new
      }
      // 是否隐藏暂不需要选项
      if (this.hiddenNoneType) {
        delete ret.none
      }
      if (!this.hasPublicIp) {
        delete ret.public
      }
      return ret
    },
    chargeTypes () {
      const ret = { ...chargeTypes }
      // 腾讯云、Azure、aws、google不支持按固定带宽计费
      if ([
        typeClouds.hypervisorMap.qcloud.key,
        typeClouds.hypervisorMap.azure.key,
        typeClouds.hypervisorMap.aws.key,
        typeClouds.hypervisorMap.google.key,
      ].includes(this.hypervisor)) {
        delete ret.bandwidth
      }
      if (this.hypervisor === 'kvm') {
        delete ret.traffic
      }
      return ret
    },
    isNew () {
      return this.type === 'new' || this.type === 'public'
    },
    isBind () {
      return this.type === 'bind'
    },
    maxBindWidth () {
      const trafficMax = {
        huawei: {
          max: 300,
        },
      }
      const brandWidthMax = {
        huawei: {
          max: 2000,
        },
        aliyun: {
          max: 500,
        },
      }
      if (this.chargeType === 'bandwidth') {
        return (
          brandWidthMax[this.hypervisor] &&
          brandWidthMax[this.hypervisor].max
        ) || (this.hypervisor === 'kvm' ? 10000 : 200)
      }
      return (
        trafficMax[this.hypervisor] &&
        trafficMax[this.hypervisor].max
      ) || (this.hypervisor === 'kvm' ? 10000 : 200)
    },
    sliderMarks () {
      let ret = { 100: '100Mbps' }
      if (this.chargeType === 'bandwidth') {
        if (this.maxBindWidth > 400) {
          ret = { 400: '400Mbps' }
        }
      }
      ret = { ...ret, ...{ 1: '1Mbps', [this.maxBindWidth]: `${this.maxBindWidth}Mbps` } }
      return ret
    },
    params () {
      if (!this.eipParams || R.isEmpty(this.eipParams)) return {}
      return {
        ...{
          usable: true,
          scope: this.scope,
          limit: 20,
        },
        ...this.eipParams,
      }
    },
    label () {
      if (this.hasPublicIp) return this.$t('compute.text_1374')
      return !this.showBind ? this.$t('compute.text_107') : this.$t('compute.text_1180')
    },
  },
  watch: {
    types (val) {
      const values = Object.values(val)
      if (values.length) {
        if (this.form && this.form.fc) {
          const type = values[0].key
          this.type = type
          this.form.fc.setFieldsValue({
            [this.decorators.type[0]]: type,
          })
        }
      }
    },
  },
  created () {
    this.fetchBgpType()
  },
  methods: {
    fetchBgpType () {
      new this.$Manager('networks/distinct-field').list({
        params: {
          usable: true,
          limit: 0,
          field: 'bgp_type',
          scope: this.$scope,
        },
      }).then(({ data }) => {
        this.bgpTypeOptions = data.bgp_type
      })
    },
    handleTypeChange (e) {
      this.type = e.target.value
      if (this.type === 'new') {
        this.$nextTick(() => {
          if (R.has('traffic', this.chargeTypes)) {
            return this.form.fc.setFieldsValue({ eip_charge_type: 'traffic' })
          }
          this.form.fc.setFieldsValue({ eip_charge_type: 'bandwidth' })
        })
      }
    },
    handleChargeTypeChange (e) {
      this.chargeType = e.target.value
    },
    format (val) {
      return +val || 1
    },
  },
}
</script>
