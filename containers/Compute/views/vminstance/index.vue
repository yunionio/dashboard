<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <!-- <server-error-status-tab
        resource="servers"
        status="server"
        @getStatusCheckArr="getStatusCheckArr" /> -->
      <vm-instance-list
        :id="listId"
        :cloud-env="cloudEnv"
        :cloudEnvOptions="cloudEnvOptions"
        :filterParams="filterParams"
        @updateCloudEnvOptions="updateCloudEnvOptions" />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'
// import ServerErrorStatusTab from '@Compute/sections/ServerErrorStatusTab'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
    // ServerErrorStatusTab,
  },
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnv: '',
      filterParams: {},
    }
  },
  computed: {
    cloudEnvOptions: () => {
      return getCloudEnvOptions('compute_engine_brands')
    },
  },
  methods: {
    getStatusCheckArr (statusCheckArr, statusArr, isFirstLoad) {
      if (statusCheckArr && statusCheckArr.length > 0) {
        this.filterParams = {
          statusCheckArr: statusCheckArr,
          statusArr: statusArr,
          isFirstLoad: isFirstLoad,
        }
      } else {
        this.filterParams = {
          statusCheckArr: [],
          isFirstLoad: isFirstLoad,
        }
      }
    },
  },
}
</script>
