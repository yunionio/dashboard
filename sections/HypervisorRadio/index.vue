<template>
  <a-form-item class="mb-0">
    <a-radio-group v-decorator="decorator">
      <a-radio-button v-for="item in hypervisorOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
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
  },
}
</script>
