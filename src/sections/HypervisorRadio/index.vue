<template>
  <a-form-item class="mb-0">
    <span v-if="isEmpty">{{$t('compute.hypervisor_empty_tips')}}</span>
    <a-radio-group v-else v-decorator="decorator">
      <template v-for="item in hypervisorOpts">
        <a-tooltip :title="disabledHypervisorMap[item.key]" :key="item.key">
          <a-radio-button
            :value="item.key"
            :disabled="disabledHypervisorMap[item.key]">
            {{ item.label }}
          </a-radio-button>
        </a-tooltip>
      </template>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import { HYPERVISORS_GROUP, HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'ProviderRadio',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      validator: val => Object.keys(HYPERVISORS_GROUP).includes(val),
    },
    hypervisors: {
      type: Array,
      validator: val => R.isEmpty(val) || val.every(hyper => Object.keys(HYPERVISORS_MAP).includes(hyper)),
    },
    ignoreBaremetal: { // 忽略裸金属服务器
      type: Boolean,
      default: true,
    },
    disabledHypervisorMap: {
      type: Object,
    },
  },
  computed: {
    hypervisorOpts () {
      let hyperItems = []
      const hyperGroup = HYPERVISORS_GROUP[this.type]
      if (hyperGroup) {
        hyperItems = Object.values(hyperGroup)
      }
      hyperItems = this.hypervisors.map(val => HYPERVISORS_MAP[val])
      if (this.ignoreBaremetal) {
        hyperItems = hyperItems.filter(val => val.key !== 'baremetal')
      }
      return hyperItems
    },
    isEmpty () {
      return !this.hypervisorOpts?.length
    },
  },
}
</script>
