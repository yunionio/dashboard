<template>
  <div>
    <span class="mr-1">{{ username }}</span>
    <copy :message="username" />
  </div>
</template>

<script>
import _ from 'lodash'

const DEFAULT_ACCOUNT = 'root'

export default {
  name: 'ServerAccount',
  props: {
    instance_capabilities: {
      type: Array,
    },
    hypervisor: {
      type: String,
    },
    osType: {
      type: String,
      default: 'linux',
    },
  },
  computed: {
    username () {
      if (this.hypervisor && this.instance_capabilities && this.instance_capabilities.length) {
        const item = this.instance_capabilities.find(val => {
          return val.hypervisor === this.hypervisor && val.default_account[this.osType]
        })
        if (item) {
          return _.get(item.default_account, `[${this.osType}].default_account`)
        }
      }
      return DEFAULT_ACCOUNT
    },
  },
}
</script>
