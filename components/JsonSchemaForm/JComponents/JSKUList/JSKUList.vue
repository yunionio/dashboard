<template>
  <base-select
    :value="value"
    resource="serverskus"
    need-params
    filterable
    idKey="name"
    :item.sync="sku"
    :mapper="mapper"
    :params="params"
    @change="change" />
</template>

<script>
import { mapMutations } from 'vuex'
import mixin from '../mixin'
import { getRequestT } from '@/utils/utils'
import { HYPERVISORS_MAP } from '@/constants'

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
      if (this.formFd.fd.hypervisor) {
        const onecloudProviders = [HYPERVISORS_MAP.kvm.key, HYPERVISORS_MAP.esxi.key]
        if (~onecloudProviders.indexOf(this.formFd.fd.hypervisor)) {
          p.provider = HYPERVISORS_MAP.kvm.provider
        } else {
          p.provider = this.formFd.fd.hypervisor
        }
      }
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
    mapper (list) {
      // 套餐去重
      const resList = []
      const skuSet = new Set()
      for (let i = 0, len = list.length; i < len; i++) {
        const item = list[i]
        const flag = `${item.name}-${item.provider}-${item.region_ext_id}`
        if (skuSet.has(flag)) {
          continue
        }
        skuSet.add(flag)
        resList.push(item)
      }
      return resList
    },
    getI18NValue (key, originVal) {
      if (this.$te(key)) {
        return this.$t(key)
      }
      return originVal
    },
  },
}
</script>
