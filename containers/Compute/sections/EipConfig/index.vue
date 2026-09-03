<template>
  <div>
    <a-form-item :label="label" v-bind="formItemLayout">
      <a-row>
        <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
          <a-radio-button
            v-for="item of types"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-row>
      <a-row class="mt-4" v-if="isBind">
        <base-select
          remote
          v-decorator="decorators.eip"
          resource="eips"
          :params="params"
          :showSync="true"
          :select-props="{ allowClear: true, placeholder: $t('compute.text_145') }" />
      </a-row>
    </a-form-item>
    <a-form-item :label="$t('compute.text_1359')" v-if="isNew && showBgpTypes" v-bind="formItemLayout">
      <a-select v-decorator="decorators.bgp_type">
        <a-select-option v-for="item in bgpTypeOptions" :value="item" :key="item">{{ item === '' ? $t('compute.text_1352') : BGP_TYPES_MAP[item] ? BGP_TYPES_MAP[item].label : item }}</a-select-option>
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
    <a-form-item :label="$t('compute.bandwidth.title')" v-if="isNew" v-bind="formItemLayout">
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
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { EIP_TYPES_MAP as types } from '@Compute/constants'
import { typeClouds } from '@/utils/common/hypervisor'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'
import { BGP_TYPES, BGP_TYPES_MAP } from '@/constants/network'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

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
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：类型/计费/线路；带宽为输入不落盘 */
    formDraftKind: {
      type: String,
      default: 'selection',
    },
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
    showNew: {
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
      BGP_TYPES_MAP,
      type: this.decorators.type[1] && this.decorators.type[1].initialValue,
      chargeType: this.decorators.charge_type[1] && this.decorators.charge_type[1].initialValue,
      bgpTypeOptions: [],
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isOnpremise () {
      return this.cloudEnv === 'onpremise'
    },
    isAliyun () {
      return this.hypervisor === HYPERVISORS_MAP.aliyun.hypervisor
    },
    isPrivateEnv () {
      const privateHyper = []
      for (const key in typeClouds.hypervisorMap) {
        if (typeClouds.hypervisorMap[key].env === 'private') {
          privateHyper.push(typeClouds.hypervisorMap[key].hypervisor)
        }
      }
      return privateHyper.includes(this.hypervisor)
    },
    showBgpTypes () {
      if (!this.bgpTypeOptions || this.bgpTypeOptions.length === 0) {
        return false
      }
      if (this.bgpTypeOptions.length === 1 && this.bgpTypeOptions[0] === '') {
        return false
      }

      return this.cloudEnv == null || this.cloudEnv === 'idc' || this.isOnpremise || this.isAliyun
    },
    types () {
      const ret = { ...types }
      if (!this.showBind) { // 主机创建不支持绑定已有EIP
        delete ret.bind
      }
      if (!this.showNew) {
        delete ret.new
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
        typeClouds.hypervisorMap.azure.key,
        typeClouds.hypervisorMap.aws.key,
        typeClouds.hypervisorMap.google.key,
      ].includes(this.hypervisor)) {
        delete ret.bandwidth
      }
      if (this.hypervisor == null || this.hypervisor === 'kvm') {
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
      return this.$t('compute.text_107')
    },
  },
  watch: {
    types: {
      immediate: true,
      handler () {
        this.$nextTick(() => {
          this.restoreFormFieldDraftFields()
          this.ensureValidEipType()
          this.ensureValidChargeType()
        })
      },
    },
    chargeTypes () {
      this.$nextTick(() => this.ensureValidChargeType())
    },
    bgpTypeOptions () {
      // 切类型会清空/重载 bgp 选项；此处只补线路，禁止整份 restore 把 type 盖回草稿
      this.$nextTick(() => this.tryRestoreBgpFromDraft())
    },
    'form.fd.eip_type' (newValue) {
      if (newValue === 'new') {
        if (this.isAliyun) {
          this.bgpTypeOptions = BGP_TYPES.map(item => item.value)
        } else {
          this.fetchBgpType()
        }
      } else {
        this.bgpTypeOptions = []
      }
    },
  },
  created () {
    this.fetchBgpType()
  },
  methods: {
    getDefaultChargeType () {
      if (R.has('traffic', this.chargeTypes)) return 'traffic'
      return 'bandwidth'
    },
    /** 可选类型变化时：当前值无效则落到第一项 */
    ensureValidEipType () {
      const keys = Object.keys(this.types || {})
      if (!keys.length) return
      const fc = this.resolveFormFc()
      const current = fc?.getFieldValue?.(this.decorators.type[0]) || this.type
      if (current && this.types[current]) {
        this.type = current
        return
      }
      const first = keys[0]
      this.type = first
      this.applyFormFieldValues({ [this.decorators.type[0]]: first })
      if (first === 'new' || first === 'public') {
        this.$nextTick(() => this.applyDefaultChargeType())
      }
    },
    ensureValidChargeType () {
      if (!this.isNew) return
      const fc = this.resolveFormFc()
      if (!fc || !this.decorators.charge_type) return
      const field = this.decorators.charge_type[0]
      const current = fc.getFieldValue(field) || this.chargeType
      if (current && this.chargeTypes[current]) {
        this.chargeType = current
        return
      }
      this.applyDefaultChargeType()
    },
    applyDefaultChargeType () {
      const charge = this.getDefaultChargeType()
      this.chargeType = charge
      this.applyFormFieldValues({ [this.decorators.charge_type[0]]: charge })
    },
    tryRestoreBgpFromDraft () {
      if (!this.canRestoreFormFieldDraft()) return
      if (!this.isNew || !this.showBgpTypes) return
      const draft = this.readFormFieldDraft()
      if (!draft || draft.bgp_type == null) return
      if (!this.bgpTypeOptions.includes(draft.bgp_type)) return
      const field = this.decorators.bgp_type[0]
      const fc = this.resolveFormFc()
      if (!fc) return
      if (fc.getFieldValue(field) === draft.bgp_type) return
      this.applyFormFieldValues({ [field]: draft.bgp_type })
    },
    getCreateFormFieldDraftSnapshot () {
      const fc = this.resolveFormFc()
      if (!fc) return undefined
      const type = fc.getFieldValue(this.decorators.type[0])
      if (type == null || type === '') return undefined
      const snapshot = { type }
      // 带宽为输入不落盘；绑定已有 EIP 依赖远程列表暂不落盘
      if (type === 'new' || type === 'public') {
        snapshot.charge_type = fc.getFieldValue(this.decorators.charge_type[0])
        if (this.decorators.bgp_type) {
          const bgp = fc.getFieldValue(this.decorators.bgp_type[0])
          if (bgp != null) snapshot.bgp_type = bgp
        }
      }
      return snapshot
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || typeof draft !== 'object' || !draft.type) return
      if (!this.types[draft.type]) return
      const fc = this.resolveFormFc()
      const typeField = this.decorators.type[0]
      const currentType = fc?.getFieldValue?.(typeField)
      // 已是草稿类型则只补子项；避免重复 set 触发 eip_type → 清空 bgp → 再回填的循环
      if (currentType !== draft.type) {
        this.type = draft.type
        this.applyFormFieldValues({ [typeField]: draft.type })
      } else {
        this.type = draft.type
      }
      if (draft.type !== 'new' && draft.type !== 'public') return
      // 子表单项在 v-if 内，等挂载后再写
      this.$nextTick(() => {
        const values = {}
        if (draft.charge_type && this.chargeTypes[draft.charge_type]) {
          values[this.decorators.charge_type[0]] = draft.charge_type
          this.chargeType = draft.charge_type
        } else if (!fc?.getFieldValue?.(this.decorators.charge_type[0])) {
          const charge = this.getDefaultChargeType()
          values[this.decorators.charge_type[0]] = charge
          this.chargeType = charge
        }
        if (
          draft.bgp_type != null &&
          this.showBgpTypes &&
          this.bgpTypeOptions.includes(draft.bgp_type)
        ) {
          values[this.decorators.bgp_type[0]] = draft.bgp_type
        }
        if (Object.keys(values).length) {
          this.applyFormFieldValues(values)
        }
      })
    },
    initData (data) {
      this.$nextTick(() => {
        setTimeout(() => {
          if (data.eip_charge_type) {
            this.form.fc.setFieldsValue({ [this.decorators.type[0]]: 'new' })
            this.applyEipTypeChange('new')
            this.form.fd.eip_type = 'new'
          } else if (data.public_ip_charge_type) {
            this.form.fc.setFieldsValue({ [this.decorators.type[0]]: 'public' })
            this.applyEipTypeChange('public')
            this.form.fd.eip_type = 'public'
          }
          setTimeout(() => {
            if (data.eip_charge_type) {
              this.form.fc.setFieldsValue({
                [this.decorators.charge_type[0]]: data.eip_charge_type,
                [this.decorators.bandwidth[0]]: data.eip_bw,
                [this.decorators.bgp_type[0]]: data.eip_bgp_type,
              })
            } else if (data.public_ip_charge_type) {
              this.form.fc.setFieldsValue({
                [this.decorators.charge_type[0]]: data.public_ip_charge_type,
                [this.decorators.bandwidth[0]]: data.public_ip_bw,
                [this.decorators.bgp_type[0]]: data.public_ip_bgp_type,
              })
            }
          }, 1000)
        }, 1000)
      })
    },
    fetchBgpType () {
      if (this.isAliyun) return
      new this.$Manager('networks/distinct-field').list({
        params: {
          usable: true,
          limit: 0,
          field: 'bgp_type',
          scope: this.$store.getters.scope,
          server_type: 'eip',
        },
      }).then(({ data }) => {
        this.bgpTypeOptions = data.bgp_type
      })
    },
    handleTypeChange (e) {
      this.applyEipTypeChange(e.target.value)
    },
    applyEipTypeChange (type) {
      this.type = type
      if (this.type === 'new' || this.type === 'public') {
        this.$nextTick(() => this.applyDefaultChargeType())
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
