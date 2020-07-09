<template>
  <base-select
    :value="value"
    resource="zones"
    need-params
    filterable
    :params="params"
    @change="change" />
</template>

<script>
import mixin from '../mixin'

export default {
  name: 'JZoneList',
  mixins: [mixin],
  computed: {
    params () {
      if (!this.formFd.fd.preferRegion) return {}
      const p = {
        ...this.scopeParams.scopeParams,
        show_emulated: true,
        cloudregion: this.formFd.fd.preferRegion,
      }
      return p
    },
  },
}
</script>
