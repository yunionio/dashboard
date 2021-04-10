<template>
  <base-select
    :value="value"
    ref="baseSelectRef"
    resource="serverskus"
    need-params
    remote
    idKey="name"
    :item.sync="sku"
    :label-format="labelFormat"
    :mapper="mapper"
    :params="params"
    @change="change" />
</template>

<script>
import { mapMutations } from 'vuex'
import mixin from '../mixin'
import { getRequestT } from '@/utils/utils'
import { HYPERVISORS_MAP } from '@/constants'
import { findPlatform } from '@/utils/common/hypervisor'

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
      const hyper = this.formFd.fd.hypervisor
      const env = findPlatform(hyper)
      const p = {
        ...this.scopeParams.scopeParams,
        usable: true,
        enabled: true,
        limit: 0,
        postpaid_status: 'available',
        $t: getRequestT(),
      }
      if (hyper) {
        const onecloudProviders = [HYPERVISORS_MAP.kvm.key, HYPERVISORS_MAP.esxi.key, HYPERVISORS_MAP.zstack.key, HYPERVISORS_MAP.openstack.key]
        if (~onecloudProviders.indexOf(hyper)) {
          p.provider = HYPERVISORS_MAP.kvm.provider
        } else {
          p.provider = hyper
        }
        if (env === 'public') {
          if (this.formFd.fd.preferRegion) p.cloudregion = this.formFd.fd.preferRegion
          if (this.formFd.fd.preferZone) p.zone = this.formFd.fd.preferZone
        }
      }
      if (env === 'public') {
        if (!p.cloudregion || !p.zone) return {}
      }
      if (!p.provider) return {}
      return p
    },
  },
  watch: {
    'formFd.fd.hypervisor' () {
      this.$refs.baseSelectRef.resList = []
      this.$refs.baseSelectRef.resOpts = {}
      this.$nextTick(() => {
        this.$refs.baseSelectRef.loadOptsDebounce()
      })
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
      resList.sort((a, b) => {
        const diff = a.cpu_core_count - b.cpu_core_count
        if (diff === 0) {
          return a.memory_size_mb - b.memory_size_mb
        }
        return diff
      })
      return resList
    },
    getI18NValue (key, originVal) {
      if (this.$te(key)) {
        return this.$t(key)
      }
      return originVal
    },
    labelFormat (item) {
      const cpu = item.cpu_core_count
      let mem = parseInt(item.memory_size_mb / 1024)
      let memUnit = 'GB'
      if (item.memory_size_mb < 1024) {
        mem = item.memory_size_mb
        memUnit = 'MB'
      }
      return `${item.name} (${cpu}${this.$t('compute.text_167')}、${mem}${memUnit})`
    },
  },
}
</script>
