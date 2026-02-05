<template>
  <div>
    <h5 v-if="isKvm">{{ $t('dictionary.guestsecgroup') }}</h5>
    <vm-secgroup-list :getParams="params" :id="id" :resId="resId" :serverColumns="serverColumns" :data="data" />
    <h5 class="mt-2" v-if="isKvm">{{ $t('compute.nic_secgroups') }}</h5>
    <network-secgroup-list v-if="isKvm" :getParams="params" :id="id" :resId="resId" :data="data" />
  </div>
</template>

<script>
import { HYPERVISORS_MAP } from '@/constants'
import VmSecgroupList from './VmSecgroup'
import NetworkSecgroupList from './NetSecgroup'

export default {
  name: 'SecgroupIndex',
  components: {
    VmSecgroupList,
    NetworkSecgroupList,
  },
  props: {
    resId: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      currentComponent: 'VmSecgroupList',
    }
  },
  computed: {
    isKvm () {
      return this.data.hypervisor === HYPERVISORS_MAP.kvm.key
    },
    tabs () {
      const ret = [
        {
          key: 'VmSecgroupList',
          label: this.$t('dictionary.server'),
        },
      ]
      if (this.isKvm) {
        ret.push({
          key: 'NetworkSecgroupList',
          label: this.$t('compute.nic'),
        })
      }
      return ret
    },
    id () {
      switch (this.currentComponent) {
        case 'VmSecgroupList':
          return 'VmSecgroupListForVminstanceSidepage'
        default:
          return 'NetworkSecgroupListForVminstanceSidepage'
      }
    },
    params () {
      const params = {
        ...this.getParams,
      }
      return params
    },
  },
  methods: {
    callback (key) {
      this.currentComponent = key
    },
  },
}
</script>
