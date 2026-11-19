<template>
  <div>
    <page-header :title="$t('compute.text_113')" :tabs="tabOptions" :current-tab.sync="curTab" />
    <page-body>
      <gpu-list
        v-if="curTab !== 'pci-list'"
        :key="curTab"
        :id="listId"
        :show-baremetal-isolated-devices="curTab === 'baremetal-gpu-list'" />
      <pci-list v-else :id="listId" />
    </page-body>
  </div>
</template>

<script>
import GpuList from './components/List'
import PciList from '../pci/components/PciList'
export default {
  name: 'GPUIndex',
  components: {
    GpuList,
    PciList,
  },
  data () {
    return {
      curTab: 'gpu-list',
    }
  },
  computed: {
    listId () {
      return this.curTab === 'baremetal-gpu-list' ? 'BaremetalGpuList' : 'GpuList'
    },
    tabOptions () {
      return [
        { label: this.$t('compute.text_111') + this.$t('compute.pci.passthrough_device'), key: 'gpu-list' },
        { label: this.$t('compute.text_112') + this.$t('compute.pci.passthrough_device'), key: 'baremetal-gpu-list' },
        { label: this.$t('compute.pci.passthrough_device_type'), key: 'pci-list' },
      ]
    },
  },
}
</script>
