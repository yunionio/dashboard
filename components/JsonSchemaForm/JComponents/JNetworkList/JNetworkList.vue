<template>
  <base-select
    :value="value"
    resource="networks"
    :params="params"
    need-params
    filterable
    @change="change" />
</template>

<script>
import mixin from '../mixin'

export default {
  name: 'JNetworkList',
  mixins: [mixin],
  computed: {
    params () {
      if (!this.formFd.fd.preferRegion || !this.formFd.fd.preferZone) return {}
      const p = {
        ...this.scopeParams.scopeParams,
        filter: 'server_type.notin(ipmi, pxe)',
        cloudregion: this.formFd.fd.preferRegion,
        zone: this.formFd.fd.preferZone,
        vpc: this.formFd.fd.vpc,
      }
      return p
    },
  },
}
</script>
