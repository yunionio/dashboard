<template>
  <base-select
    :value="value"
    resource="cloudregions"
    need-params
    filterable
    :params="params"
    @change="change" />
</template>

<script>
import mixin from '../mixin'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'JCloudregionList',
  mixins: [mixin],
  computed: {
    params () {
      if (!this.formFd.fd.hypervisor) return {}
      const provider = HYPERVISORS_MAP[this.formFd.fd.hypervisor] ? HYPERVISORS_MAP[this.formFd.fd.hypervisor].provider : this.formFd.fd.hypervisor
      const p = {
        ...this.scopeParams.scopeParams,
        provider,
      }
      return p
    },
  },
}
</script>
