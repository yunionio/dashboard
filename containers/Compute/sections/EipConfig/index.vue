<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
        <a-radio-button
          v-for="item of types"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="mb-0" v-if="isNew">
      <a-radio-group v-decorator="decorators.charge_type" @change="handleChargeTypeChange">
        <a-radio-button
          v-for="item of chargeTypes"
          :key="item.key"
          :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="mb-0" v-if="isNew">
      <a-row>
        <a-col :span="20">
          <a-slider :min="1" :max="maxBindWidth" :step="1" :marks="sliderMarks" v-decorator="decorators.bandwidth" />
        </a-col>
        <a-col :span="4">
          <a-input-number
            class="ml-2"
            :min="1"
            :max="maxBindWidth"
            :step="1"
            v-decorator="decorators.bandwidth" />
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item class="mb-0" v-if="isBind">
      <base-select
        remote
        v-decorator="decorators.eip"
        resource="eips"
        :params="params"
        :select-props="{ allowClear: true, placeholder: '请选择弹性公网IP' }" />
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { typeClouds } from '@/utils/common/hypervisor'

const types = {
  none: {
    key: 'none',
    label: '暂不需要',
  },
  new: {
    key: 'new',
    label: '新建',
  },
  bind: {
    key: 'bind',
    label: '绑定已有',
  },
}

const chargeTypes = {
  traffic: {
    key: 'traffic',
    label: '按流量计费',
  },
  bandwidth: {
    key: 'bandwidth',
    label: '按固定带宽',
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
  },
  data () {
    return {
      type: this.decorators.type[1] && this.decorators.type[1]['initialValue'],
      chargeType: this.decorators.charge_type[1] && this.decorators.charge_type[1]['initialValue'],
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isPrivateEnv () {
      const privateHyper = []
      for (let key in typeClouds.hypervisorMap) {
        if (typeClouds.hypervisorMap[key].env === 'private') {
          privateHyper.push(typeClouds.hypervisorMap[key].hypervisor)
        }
      }
      return privateHyper.includes(this.hypervisor)
    },
    types () {
      const ret = { ...types }
      // 私有云不支持新建
      if (this.isPrivateEnv) {
        delete ret.new
      }
      // 是否隐藏暂不需要选项
      if (this.hiddenNoneType) {
        delete ret.none
      }
      return ret
    },
    chargeTypes () {
      const ret = { ...chargeTypes }
      // 腾讯云、华为云不支持按固定带宽计费
      if ([typeClouds.hypervisorMap.qcloud.key, typeClouds.hypervisorMap.azure.key].includes(this.hypervisor)) {
        delete ret.bandwidth
      }
      return ret
    },
    isNew () {
      return this.type === 'new'
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
      if (this.type === 'bandwidth') {
        return (
          brandWidthMax[this.hypervisor] &&
          brandWidthMax[this.hypervisor].max
        ) || 200
      }
      return (
        trafficMax[this.hypervisor] &&
        trafficMax[this.hypervisor].max
      ) || 200
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
      return {
        ...{
          usable: true,
          scope: this.scope,
          limit: 20,
        },
        ...this.eipParams,
      }
    },
  },
  methods: {
    handleTypeChange (e) {
      this.type = e.target.value
    },
    handleChargeTypeChange (e) {
      this.chargeType = e.target.value
    },
  },
}
</script>
