<template>
  <div>
    <page-header :title="$t('compute.vminstance-container')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
          :loading="statisticsLoading"
          :status-opts="statusOpts"
          @click="statusClickHandle" />
      </div>
    </page-header>
    <page-body>
      <vm-instance-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        :tableOverviewIndexs="tableOverviewIndexs"
        @updateCloudEnvOptions="updateCloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
// import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'
import VmInstanceList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'VMContainerInstanceList',
      cloudEnv: '',
      resStaticsResource: 'servers',
    }
  },
  computed: {
    cloudEnvOptions () {
      return [
        { key: 'onpremise', label: this.$t('dictionary.onpremise_env') },
      ]
    },
  },
}
</script>
