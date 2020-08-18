<template>
  <div>
    <page-header :title="$t('compute.text_91')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <server-error-status-tab
        resource="servers"
        status="server"
        @getStatusCheckArr="getStatusCheckArr" />
      <vm-instance-list
        :id="listId"
        :cloud-env="cloudEnv"
        :filterParams="filterParams" />
    </page-body>
  </div>
</template>

<script>
import VmInstanceList from './components/List'
import ServerErrorStatusTab from '@Compute/sections/ServerErrorStatusTab'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceIndex',
  components: {
    VmInstanceList,
    ServerErrorStatusTab,
  },
  data () {
    return {
      listId: 'VMInstanceList',
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      cloudEnv: '',
      filterParams: {},
    }
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
