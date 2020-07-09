<template>
  <base-select
    :value="value"
    resource="serverskus"
    need-params
    filterable
    idKey="name"
    :item.sync="sku"
    :params="params"
    @change="change" />
</template>

<script>
import { mapMutations } from 'vuex'
import mixin from '../mixin'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'JSKUList',
  mixins: [mixin],
  data () {
    return {
      sku: {},
    }
  },
  computed: {
    params () {
      const p = {
        ...this.scopeParams.scopeParams,
        usable: true,
        enabled: true,
        limit: 0,
        postpaid_status: 'available',
        $t: getRequestT(),
      }
      if (this.formFd.fd.hypervisor) p.provider = this.formFd.fd.hypervisor
      if (this.formFd.fd.preferRegion) p.cloudregion = this.formFd.fd.preferRegion
      if (this.formFd.fd.preferZone) p.zone = this.formFd.fd.preferZone
      if (!p.provider || !p.cloudregion || !p.zone) return {}
      return p
    },
  },
  methods: {
    ...mapMutations('common', {
      setSku: 'UPDATE_OBJECT',
    }),
    change (...ret) {
      this.$emit('change', ...ret)
      this.$nextTick(() => {
        this.setSku({ name: 'jsonschema', data: { sku: this.sku } })
      })
    },
  },
}
</script>
