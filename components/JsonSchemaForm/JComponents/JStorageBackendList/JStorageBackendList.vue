<template>
  <base-select
    :value="value"
    filterable
    :options="options"
    @change="change" />
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import mixin from '../mixin'
import { STORAGE_TYPES } from '@/constants/compute'
import { getRequestT, findAndUnshift } from '@/utils/utils'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'JStorageBackendList',
  mixins: [mixin],
  data () {
    return {
      options: [],
      oldCapabilityParams: {},
      storageMap: {},
    }
  },
  computed: {
    ...mapState('common', {
      jsonschema: state => state.jsonschema,
    }),
  },
  watch: {
    'formFd.fd' (val) {
      this.fetchCapability()
    },
    'jsonschema.sku' (val) {
      if (val) {
        this.getStorageList()
      }
    },
  },
  methods: {
    async fetchCapability () {
      try {
        const params = {
          ...this.scopeParams.scopeParams,
          show_emulated: true,
          resource_type: 'shared',
        }
        const { preferRegion, preferZone } = this.formFd.fd
        let id = preferRegion
        let resource = 'cloudregions'
        if (preferZone) {
          id = preferZone
          resource = 'zones'
        }
        const capabilityParams = { id, spec: 'capability', params }
        if (R.equals(this.oldCapabilityParams, capabilityParams)) return
        if (!id) return
        this.oldCapabilityParams = capabilityParams
        capabilityParams.params.$t = getRequestT()
        const { data } = await new this.$Manager(resource).getSpecific(capabilityParams)
        this.storageMap = data.data_storage_types2
        this.getStorageList()
        this.$emit('change', undefined)
      } catch (error) {
        throw error
      }
    },
    getStorageList () {
      const options = []
      const hyper = this.formFd.fd.hypervisor.toLowerCase()
      let storageTypeList = Array.from(new Set(this.storageMap[hyper] || []))
      const hypervisorDisks = { ...STORAGE_TYPES[hyper] } || {}
      if (storageTypeList.find(val => val.includes('local'))) {
        storageTypeList = findAndUnshift(storageTypeList, item => item.includes('local'))
      }
      if (this.jsonschema && !R.isNil(this.jsonschema.sku) && !R.isEmpty(this.jsonschema.sku)) {
        if (this.jsonschema.sku.sys_disk_type) {
          const skuDiskTypes = this.jsonschema.sku.sys_disk_type.split(',')
          if (skuDiskTypes && skuDiskTypes.length) {
            storageTypeList = storageTypeList.filter(val => {
              const type = val.split('/')[0]
              return skuDiskTypes.includes(type)
            })
          }
        } else {
          for (const obj in hypervisorDisks) {
            if (hypervisorDisks[obj].skuFamily && !hypervisorDisks[obj].skuFamily.includes(this.jsonschema.sku.instance_type_family)) {
              delete hypervisorDisks[obj]
            }
          }
        }
      } else {
        if (findPlatform(hyper) === 'public') {
          storageTypeList = []
        }
      }
      for (let i = 0, len = storageTypeList.length; i < len; i++) {
        const type = storageTypeList[i].split('/')[0]
        const opt = hypervisorDisks[type]
        if (opt && !opt.sysUnusable) {
          options.push({
            ...opt,
            label: opt.key === 'nova' ? this.$t('common_18') : opt.label,
          })
        }
      }
      this.options = options
    },
  },
}
</script>
