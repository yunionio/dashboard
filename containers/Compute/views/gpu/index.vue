<template>
  <div>
    <page-header :title="$t('compute.text_113')" :tabs="tabOptions" :current-tab.sync="curTab" />
    <page-body>
      <component :is="curTab" :id="listId" />
    </page-body>
  </div>
</template>

<script>
import PciList from '../pci/components/PciList'
import GpuList from './components/List'

export default {
  name: 'GPUIndex',
  components: {
    GpuList,
    PciList,
  },
  data () {
    return {
      listId: 'GpuList',
      curTab: 'gpu-list',
      tabOptions: [
        { label: this.$t('compute.pci.passthrough_device'), key: 'gpu-list' },
        { label: this.$t('compute.pci.passthrough_device_type'), key: 'pci-list' },
      ],
    }
  },
}
</script>
