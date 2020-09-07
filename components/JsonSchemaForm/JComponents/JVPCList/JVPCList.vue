<template>
  <base-select
    :value="value"
    :resource="resource"
    need-params
    filterable
    :params="params"
    @change="change" />
</template>

<script>
import mixin from '../mixin'

export default {
  name: 'JVPCList',
  mixins: [mixin],
  computed: {
    resource () {
      if (!this.formFd.fd.preferRegion) return 'vpcs'
      return `cloudregions/${this.formFd.fd.preferRegion}/vpcs`
    },
    params () {
      if (!this.formFd.fd.preferRegion) return {}
      const p = {
        limit: 0,
        show_emulated: true,
      }
      return p
    },
  },
}
</script>
