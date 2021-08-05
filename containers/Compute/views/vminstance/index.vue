<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv">
      <div slot="res-status-tab" style="position: absolute; right: 0; top: 14px;">
        <res-status-tab
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
        @updateCloudEnvOptions="updateCloudEnvOptions"
        @refresh="refreshHandle" />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'
import ResStatusTab from '@/sections/ResStatusTab'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import ResStatisticsMixin from '@/mixins/resStatisticsMixin'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
    ResStatusTab,
  },
  mixins: [ResStatisticsMixin],
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnv: '',
      resStaticsResource: 'servers',
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands')
    },
  },
  created () {
    this.fetchResStatistics({
      scope: this.$store.getters.scope,
      filter: 'hypervisor.notin(baremetal,container)',
    })
  },
}
</script>
