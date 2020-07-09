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

export default {
  name: 'JCloudregionList',
  mixins: [mixin],
  computed: {
    params () {
      if (!this.formFd.fd.hypervisor) return {}
      const p = {
        ...this.scopeParams.scopeParams,
        provider: this.formFd.fd.hypervisor,
      }
      return p
    },
  },
}
</script>
