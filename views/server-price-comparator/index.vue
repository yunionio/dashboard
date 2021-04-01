<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <price-vm-instance-list
        :id="listId"
        :filterParams="filterParams" />
    </page-body>
  </div>
</template>

<script>
import PriceVmInstanceList from './components/List'

export default {
  name: 'PriceVmInstanceIndex',
  components: {
    PriceVmInstanceList,
  },
  data () {
    return {
      listId: 'PriceVMInstanceList',
      filterParams: {},
    }
  },
}
</script>
