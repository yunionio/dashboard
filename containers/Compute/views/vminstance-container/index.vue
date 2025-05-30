<template>
  <div>
    <page-header
     :title="$t('compute.vminstance-container')"
     :tabs="cloudEnvOptions"
     :current-tab.sync="cloudEnv"
     isShowResStatusTab
     :status-opts="statusOpts"
     :status-click-handle="statusClickHandle" />
    <page-body>
      <vm-instance-list
        ref="list"
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        :tableOverviewIndexs="tableOverviewIndexs"
        statusResKey="container"
        @updateCloudEnvOptions="updateCloudEnvOptions"
        @resStatisticsChange="resStatisticsChange" />
    </page-body>
  </div>
</template>

<script>
// import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsV2Mixin from '@/mixins/resStatisticsV2Mixin'
import KeepAliveMixin from '@/mixins/keepAlive'
import VmInstanceList from './components/List'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
  },
  mixins: [ResStatisticsV2Mixin, KeepAliveMixin],
  data () {
    return {
      listId: 'VMContainerInstanceList',
      cloudEnv: '',
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
